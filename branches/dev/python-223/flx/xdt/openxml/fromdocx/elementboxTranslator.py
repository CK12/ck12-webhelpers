import sys
import os
import clr
import logging
import System
from System.Text import StringBuilder
from System.IO import DirectoryInfo, File, FileInfo, Path, StreamWriter

log = logging.getLogger(__name__)
    
clr.AddReference("DocumentFormat.OpenXml")

from System import Array, Byte
from DocumentFormat.OpenXml import WordprocessingDocumentType, OpenXmlElement
from DocumentFormat.OpenXml.Packaging import *
from DocumentFormat.OpenXml.Wordprocessing import *
import DocumentFormat.OpenXml.Drawing.Pictures as pic
from DocumentFormat.OpenXml.Vml import Shape, TextBox
import DocumentFormat.OpenXml.Vml.Office as ovml

from openxml.fromdocx.translator import DocxTranslator
from openxml.fromdocx.baseTranslator import BaseTranslator

class ElementBoxTranslator(DocxTranslator):

    def __init__(self, mainTranslator, mainPart, element, userId, login, token):
        self.parent = element
        self.userId = userId
        self.login = login
        self.token = token
        self.header = None
        self.body = None
        self.id = ""
        self.hasHeader = False
        self.hasHeaderClosing = False
        self.hasBody = False
        self.mainPart = mainPart
        self.bt = BaseTranslator(self.mainPart, self.userId, self.login, self.token)
        self.mainTranslator = mainTranslator
        self.__findHeadAndBody()

    def __findHeadAndBody(self):
        type = self.parent.GetType().ToString()
        log.info("Type of elementBox: %s" % type)
        if type.rfind('TextBox') >= 0:
            ## Find the other textbox (if any)
            element = self.parent
            while element and type(element) != Paragraph:
                log.info("Type of parent: %s" % element.GetType().ToString())
                element = element.Parent
            self.parent = element

        tbs = self.__findTextBoxesInDescendants()
        log.info("Text boxes within para: %d" % len(tbs))

        nonHeaderTbs = []
        for tb in tbs:
            if self.__isHeaderTextBox(tb):
                self.header = tb
        if not self.header and len(tbs) >= 2:
            self.header = tbs[0]
        if tbs:
            self.body = tbs[-1]
        else:
            self.addWarning("Could not find body for elementBox")
            raise Exception("Could not find text box body")
        log.info("Header: %s, Body: %s" % (self.header, self.body))

    def __isHeaderTextBox(self, tb):
        for e in tb.Descendants[ParagraphProperties]():
            if e.ParagraphStyleId and e.ParagraphStyleId.Val.ToString() == 'CK12ElementBoxHeader':
                return True
        return False

    def __findTextBoxesInDescendants(self):
        textBoxes = []
        log.info("Parent type: %s" % self.parent.GetType().ToString())
        if self.parent.GetType().ToString().rfind('TextBox') < 0 and self.parent.HasChildren:
            for e in self.parent.Descendants[TextBox]():
                textBoxes.append(e)
        return textBoxes

    def translateElementBox(self):
        log.info("translate ElementBox")
        self.mainTranslator.xhtml += '''
        <div class="x-ck12-element-box">'''

        if self.header:
            self.mainTranslator.xhtml += '''
            <div class="x-ck12-element-box-header">'''
            for c in self.header.Descendants[Paragraph]():
                self.mainTranslator.xhtml += self.bt.translateBase(c, paraWrap=False)
            self.mainTranslator.xhtml += '''
            </div>'''

        if self.body:
            self.mainTranslator.xhtml += '''
            <div class="x-ck12-element-box-body">'''

            for tbc in self.body.Elements[TextBoxContent]():
                for c in tbc.Elements[OpenXmlElement]():
                    type = c.GetType().ToString()
                    if type.endswith('Paragraph') or type.endswith('Table'):
                        log.info("Translating element of type: %s" % type)
                        self.mainTranslator.translateElement(c)
                        if type.endswith('Table'):
                            self.mainTranslator.resolveTable()
                    elif type.endswith('TextBox'):
                        log.info("Error! Found nested element box.")
                        self.addWarning("Found a nested element box. Nesting element boxes is not supported. Ignoring ...")
            self.mainTranslator.resolveListClosure()
            self.mainTranslator.xhtml += '''
            </div>''' 

        self.mainTranslator.xhtml += '''
        </div>
        '''
