import sys
import os
import clr
import System
from System.Text import StringBuilder
from System.IO import DirectoryInfo, File, FileInfo, Path, StreamWriter
import traceback
import logging
from xml.sax import saxutils

log = logging.getLogger(__name__)
    
clr.AddReference("DocumentFormat.OpenXml")

from System import Array, Byte
from DocumentFormat.OpenXml import WordprocessingDocumentType, OpenXmlElement
from DocumentFormat.OpenXml.Packaging import *
from DocumentFormat.OpenXml.Wordprocessing import *

from openxml.fromdocx.translator import DocxTranslator
from openxml.fromdocx.imageHandler import ImageHandler
from openxml.fromdocx.equationHandler import EquationHandler
from openxml import common
from openxml import htmlentities

class BaseTranslator(DocxTranslator):

    def __init__(self, mainPart, userId, login, token):
        self.mainPart = mainPart
        self.userId = userId
        self.login = login
        self.token = token
        self.mappedColors = {}
    
    """
        paraWrap: specify True if you want the text to be enclosed within <p></p>
    """
    def translateBase(self, element, append=True, paraWrap=True):
        text = ""
        paras = self.getPara(element)
        possibleEmptyPara = True
        for para in paras:
            
            ptext = ""
            try:
                style = para.ParagraphProperties.ParagraphStyleId.Val.ToString()
                log.info("'"+ style +"'")
                if style in ['CK12BlockEquation', 'MTDisplayEquation']:
                    ptext = self.translateBlockMath(para)
                if style in ['CK12LiteralLayout']:
                    ptext = self.translateLiteral(para)
            except:
                possibleEmptyPara = False
                log.error(traceback.format_exc())
                log.error("No style for para! Type: %s" % para.GetType().ToString())
                self.addWarning("No style for paragraph.")

            if not ptext:
                if para.HasChildren:
                    for child in para.ChildElements:
                        type = child.GetType().ToString()
                        #log.info("Paragraph's child: "+ type)
                        if type.rfind('Run') >=0:
                            output = self.translateRun(child)
                            if output == None:
                                output = ''
                            ptext += output
                        elif type.rfind('Hyperlink') > 0:
                            log.info("DEBUG: Found hyperlink. "+ child.InnerText)
                            output = self.translateLink(child)
                            if output:
                                ptext += output
                            else:
                                raise Exception('Could not translate run: %s text [%s]' % (element, child.InnerText))
            if paraWrap:
                if not ptext.strip() and possibleEmptyPara:
                    ptext = '&nbsp;'
                ptext = "<p>"+ ptext +"</p>\n"
                log.info("Para wanted.")
            else:
                log.info("No para.")
            text += ptext
        return text
        
    def translateLink(self, element):
        text = ""
        target =""
        #is internal link?
        try:
            target = element.Anchor.ToString()
            log.info("Got anchor: "+ target)
            for run in element.Elements[Run]():
                text += self.translateRun(run)
            tooltip = ""
            try:
                tooltip = element.Tooltip.ToString()
            except:
                pass
            text = '<a class="x-ck12-xref" href="#%s" title="%s">%s</a>' % (target, tooltip, text) 
        except Exception, e:
            log.info("No anchor found.")
            #is external link?    
            try:
                id = element.Id.ToString() 
                log.info("Got rel id: "+ id)
                target = self.getUrlFromId(id)
                tooltip = ""
                try:
                    tooltip = element.Tooltip.ToString()
                except:
                    pass
                #log.info("My target is: "+ target)
                for run in element.Elements[Run]():
                    text += self.translateRun(run)
                try:
                    target = saxutils.escape(target)
                except:
                    pass
                text = '<a href="%s" title="%s">%s</a>' %(target, tooltip, text)
            except Exception, es:
                log.error("ERROR: Something wrong fetching target from id. [%s]" % str(es))
                self.addWarning("Could not translate hyperlink as an external link: %s" % str(es))
            
        return text
    
    def getUrlFromId(self, id):
        target = ""
        try:
            relPart = self.mainPart.GetReferenceRelationship(id)
            target = relPart.Uri.ToString()
            log.info("Got relPart. Type: "+ target)
        except Exception, e:
            log.error("ERROR: Couldn't get reference relationship of id: %s" %id)
            self.addWarning("Couldn't get reference relationship for a hyperlink: %s" % id)
        
        return target
        
        
    def getTextForRun(self, element):
        text = ''
        ## Do not get text for other types such as w:instrText
        for d in element.Descendants[Text]():
            text += d.Text
        return text

    def isOn(self, value):
        val = str(value).lower()
        log.info("val: %s" % val)
        return val not in ['false', 'off', 'no']

    def translateRun(self, element):
        text = ""
        #image?
        drawing = None
        for e in element.Descendants[Drawing]():
            drawing = e
            break

        if not drawing:
            for e in element.Descendants[EmbeddedObject]():
                drawing = e
                break

        if drawing and drawing.GetType().ToString().rfind('Drawing') > 0:
            log.info("Inline image: %s "% str(drawing))
            text = self.processInlineDrawing(drawing)
        elif drawing and drawing.GetType().ToString().rfind('EmbeddedObject') > 0:
            log.info("Processing inline equation: %s" % drawing)
            text = self.processInlineEquation(drawing)
        else:
            try:
                text = self.getTextForRun(element)
                #style = element.RunProperties.RunStyle.Val.ToString()
                #log.info("Run style: "+ style)
                log.info("Run text: "+ text)
                if text:
                    try:
                        mathText = text.strip()
                        if mathText.startswith('$') and mathText.endswith('$') and len(mathText) > 2:
                            log.info("Possible math text: %s" % mathText)
                            ## Inline equation
                            eqnHandler = EquationHandler(self.mainPart, self.userId, self.login, self.token)
                            eqnHandler.equation = mathText
                            text = eqnHandler.translate()
                            log.info("Inline math: %s" % text)
                    except Exception, e:
                        log.error(traceback.format_exc())
                        log.error("Error formatting mathText")
                        self.addWarning("Error formatting math text: %s" % str(e))

                    text = htmlentities.replaceHtmlEntities(htmlentities.escapeHtmlEntities(text))
                    propList = element.RunProperties.ChildElements
                    for prop in propList:
                        propStyle = prop.GetType().ToString()
                        log.info("Prop Style:"+ propStyle)
                        
                        if propStyle.rfind('Italic') >0 and self.isOn(prop.Val):
                            #has italic ?
                            #italics = element.RunProperties.Italic.ToString()            
                            #log.info("Has italics: ")
                            text = '<em>'+ text +'</em>'
                            
                        if propStyle.rfind('Bold') >0 and self.isOn(prop.Val):
                            #has bold ?
                            #log.info("Has bold: ")
                            text = '<strong>'+ text +'</strong>'
                            
                        if propStyle.rfind('Strike') > 0 and self.isOn(prop.Val):
                            #has strike ?
                            #log.info("Has strike: ")
                            text = '<span class="x-ck12-strikethrough">'+ text +'</span>'
                        
                        if propStyle.rfind('Underline') >0 and self.isOn(prop.Val):
                            #has underline ?
                            #log.info("Has underline: ")
                            text = '<span class="x-ck12-underline">'+ text +'</span>'
                        
                        if propStyle.rfind('VerticalTextAlignment') > 0:
                            align = prop.Val.ToString()
                            #log.info("Has align: "+ align)
                            if align == "superscript" :
                                text = "<sup>"+ text + "</sup>"
                                
                            if align == "subscript":
                                text = "<sub>"+ text + "</sub>"

                        if propStyle.rfind('Color') > 0:
                            color = prop.Val.ToString()
                            colorName = self.getColorName(color)
                            if colorName:
                                text = '<span class="x-ck12-textcolor-%s">%s</span>' % (colorName, text)

                        if propStyle.rfind('Shading') > 0:
                            bgcolor = prop.Fill.ToString()
                            bgcolorName = self.getColorName(bgcolor)
                            if bgcolorName:
                                text = '<span class="x-ck12-textbgcolor-%s">%s</span>' % (bgcolorName, text)

                        if propStyle.rfind('Highlight') > 0:
                            bgcolorName = prop.Val.ToString()
                            if bgcolorName and bgcolorName in common.COLOR_CODES.keys():
                                text = '<span class="x-ck12-textbgcolor-%s">%s</span>' % (bgcolorName, text)

            except Exception as e:
                #log.info("DEBUG: Run with no style. Plain"+ str(e))
                pass
           
        return text

    def getColorName(self, code):
        name = None
        try:
            code = str(code)
            if len(code) != 6:
                raise Exception('Invalid color code. Must be 6 chars long. [%s]' % code)
            ## check the cache first
            if self.mappedColors.get(code):
                log.debug("CACHE HIT: Returning %s for %s" % (self.mappedColors[code], code))
                return self.mappedColors[code]
            rgb = [(0,2), (2,4), (4,6)]
            minDiff = 9999
            for key in common.COLOR_CODES.keys():
                diff = 0
                for ib, ie in rgb:
                    i = int(code[ib:ie], 16)
                    log.debug("Color: %s" % i)
                    d = abs(int(common.COLOR_CODES[key][ib:ie], 16) - i)
                    diff += d
                diff /= 3
                log.debug("key: %s, diff: %s, minDiff: %s" % (key, diff, minDiff))
                if diff < minDiff:
                    minDiff = diff
                    name = key
                    log.debug("Closest color yet: %s" % name)
            if name:
                ## Cache if found a close match
                self.mappedColors[code] = name
        except Exception as e:
            self.addWarning("Could not determine the color name: %s" % str(e))
            pass
        return name
        
    def processInlineDrawing(self, drawing):
        handler = ImageHandler(self.mainPart, self.userId, self.login, self.token)
        fileName = handler.getImageFromGraphicData(drawing)
        text = handler.translate()
        log.info(text)
        return text

    """
        Convert inline equation to inlineequation element
    """
    def processInlineEquation(self, embeddedObject):
        handler = EquationHandler(self.mainPart, self.userId, self.login, self.token)
        imageData = handler.getDrawingFromPara(embeddedObject)
        if imageData:
            eqn = handler.getImageFromGraphicData(imageData)
            log.info("Equation after parsing: %s" % eqn)
            text = handler.translate()
            log.info("inline eqn xhtml: %s" % text)
            if not text:
                log.info("ERROR: Got empty text for inline equation")
                return ''
            return text
        else:
            log.error("ERROR: Could not find expected ImageData for inline equation.")
        
    def getPara(self, element):
        paras = []
        if element.GetType().ToString().rfind('Paragraph') >= 0:
            paras.append(element)
        else:
            childList = element.ChildElements
            for child in childList:
                type = child.GetType().ToString()
                if type.rfind('Paragraph') >= 0 :
                    paras.append(child)
                
        return paras
        
    def translateBlockMath(self, element):
        try:
            log.info("Translating block math")
            self.blockMathHandler = EquationHandler(self.mainPart, self.userId, self.login, self.token)
            self.blockMathHandler.addBlockPara(element)
            return self.blockMathHandler.translateBlock()
        except Exception, e:
            traceback.format_exc()
            self.addWarning("Could not translate block math: %s" % str(e))
        return ''

    def translateLiteral(self, element):
        text = element.InnerText
        return "<pre>%s</pre>\n" % text

