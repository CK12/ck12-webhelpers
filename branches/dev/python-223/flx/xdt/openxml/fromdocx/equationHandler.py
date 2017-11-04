import sys
import os
import clr
import System
import urllib2, urllib
import json
import re
import traceback
import logging
from datetime import datetime
from System.Text import StringBuilder
from System.IO import DirectoryInfo, File, FileInfo, FileStream, FileMode, Path, StreamWriter, StreamReader, BinaryWriter, BinaryReader

log = logging.getLogger(__name__)
    
clr.AddReference("DocumentFormat.OpenXml")

from System import Array, Byte
from DocumentFormat.OpenXml import WordprocessingDocumentType, SpaceProcessingModeValues, OpenXmlElement
from DocumentFormat.OpenXml.Packaging import *
from DocumentFormat.OpenXml.Wordprocessing import *
from DocumentFormat.OpenXml.Vml import ImageData
from DocumentFormat.OpenXml.Vml.Office import OleObject, OleValues
from multipartpost import MultipartPostHandler

from openxml.fromdocx.imageHandler import ImageHandler
from openxml.mathtype.mathtypelib import EquationInputFileWMF, EquationOutputFileText, ConvertEquation
from MTSDKDN import ClipboardFormats

from openxml.common import ENVIRONMENT_PROPS

EQUATION_HANDLER_URL__INLINE = "/flx/math/inline/"
EQUATION_HANDLER_URL__BLOCK = "/flx/math/block/"

BLOCK_REGEX = re.compile(r'^\\begin\{[^\}]*\}(.*)\\end\{[^\}]*\}$')

INLINE_PREFIXES = [ '$', '{' ]
INLINE_SUFFIXES = [ '$', '}' ]

"""
    Converts MathType equation images (WMF) in a word document to LaTeX equation strings
"""
class EquationHandler(ImageHandler):

    def __init__(self, mainPart, userId, login, token):
        ImageHandler.__init__(self, mainPart, userId, login, token)

        self.url = ''
        self.forceBlock = False
        self.equation = None
        self.inlineTemplate = '<img class="x-ck12-math" src="%s" alt="%s" />'
        self.blockTemplate = '''
                              <p><img class="x-ck12-block-math" src="%s" alt="%s" /></p>\n'''


    ## Override for now
    def getDescription(self):
        self.title = ""

    def getDrawingFromPara(self, element):        
        found = False
        imageData = None
        for child in element.Descendants[OpenXmlElement]():
            if type(child) == ImageData:
                imageData = child
            elif type(child) == OleObject:
                if child.Type == OleValues.Embed and child.ProgId == "Equation.DSMT4":
                    found = True
            if found and imageData:
                break
        return imageData

    def addBlockPara(self, para):
        self.para = para
        try:
            self.drawing = self.getDrawingFromPara(para)
            self.getDescription()
            log.info("Drawing name: "+ self.drawing.LocalName.ToString())
            equation = self.getImageFromGraphicData(self.drawing)
        except Exception as e:
            self.addWarning("Couldn't find drawing element in a paragraph: %s" % str(e))
            log.error("ERROR: couldn't find drawing element in a P with image style.")
            log.error("ERROR msg: %s" % str(e))

        ## Try if there is just plain latex text
        mathText = ''
        try:
            text = self.para.InnerText
            mathText = text.strip()
            log.info("Text: %s" % mathText)
            if mathText.startswith('\\[') and mathText.endswith('\\]') and len(mathText) > 4:
                log.info("Possible block math: %s" % mathText)
                self.equation = mathText
        except Exception, e:
            self.addWarning("Not valid math: %s" % str(e))
            log.error("ERROR: Not math: %s. Degrading ..." % mathText)
            log.error(traceback.format_exc())


    def getImageFromGraphicData(self, imageData):
        log.info("Getting image from graphic data: %s" % imageData)
        try:
            self.fileId = imageData.RelationshipId
            log.info("Image refId: %s" % self.fileId)
        except Exception as e:
            log.error("ERROR: FileID doesn't exist, %s " % str(e))
    
        if self.extractImage():
            self.convertToLatex()
            
        return self.equation

    def convertToLatex(self):
        log.info("Going to convert to LaTeX")
        ce = ConvertEquation(log=log)
        ei = EquationInputFileWMF(self.imagePath, log=log)
        if not ei:
            raise Exception("Failed to create EquationInputFileWMF object")
        outputFile = '%s.tex' % self.imagePath
        if os.path.exists(outputFile):
            os.remove(outputFile)
        #eo = EquationOutputFileText(outputFile, "Texify.tdl")
        eo = EquationOutputFileText(outputFile, "LaTeX.tdl", log=log)
        ret = ce.Convert(ei, eo)
        if ret:
            if os.path.exists(outputFile):
                self.equation = ''
                f = open(outputFile, "r")
                for line in f.readlines():
                    line = line.strip()
                    #log.info("Line: %s" % line)
                    if line:
                        if not line.startswith('%'):
                            if '% MathType' in line:
                                line = line.split('% MathType', 1)[0]
                            if '^^' in line:
                                line = line.replace('^^', '^')
                            self.equation += line
                f.close()
        else:
            log.info("Failed! ret: %s" % ret)
        log.info("Equation: %s" % self.equation)
        try:
            #os.remove(self.imagePath)
            os.remove(outputFile)
        except Exception, e:
            log.error("Failed to delete tex or image file: %s, %s" % (outputFile, self.imagePath), exc_info=e)

    def cleanupEquation(self):
        """
            Clean up the equation by removing all extra tags and enclosures
        """
        log.info("In cleanup equation!")
        if self.equation:
            self.equation = self.equation.strip()
            eqn = self.equation
            if self.equation.startswith(r'\['):
                self.equation = self.equation[2:]
            if self.equation.endswith(r'\]'):
                self.equation = self.equation[:-2]
            if eqn != self.equation:
                self.forceBlock = True

            self.equation = self.equation.strip('$')
            eqn = self.equation
            if 'begin{' in self.equation:
                ## Extract the equation without the \begin{*} \end{*} strings
                m = BLOCK_REGEX.match(self.equation)
                if m:
                    self.equation = m.group(1)
            if eqn != self.equation:
                self.forceBlock = True
            self.equation = self.equation.strip()
            log.info("Equation after cleanup: %s" % self.equation)

    def __removeExtraBraces(self):
        opens = 0
        if self.equation.startswith('{') and self.equation.endswith('}'):
            i = 1
            while i < len(self.equation)-1:
                if self.equation[i] == '{':
                    opens += 1
                elif self.equation[i] == '}':
                    opens -= 1
                i += 1
            if opens == 0:
                self.equation = self.equation[1:-1]

    def translate(self):
        if self.equation:
            self.cleanupEquation()
            if self.forceBlock:
                log.info("Forcing block equation!")
                return self.translateBlock()

            #self.__removeExtraBraces()

            self.url = '%s%s' % (EQUATION_HANDLER_URL__INLINE, urllib.quote(self.equation))
            log.info("In Translate: "+ self.url)
            return self.inlineTemplate % (self.url, self.html_escape(self.equation))
                
    def translateBlock(self):
        if self.equation:
            self.cleanupEquation()
            self.url = '%s%s' % (EQUATION_HANDLER_URL__BLOCK, urllib.quote(self.equation))
            log.info("In TranslateBlock: "+ self.url)
            return self.blockTemplate % (self.url, self.html_escape(self.equation))
 
