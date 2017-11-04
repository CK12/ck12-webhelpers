import sys
import os
import clr
import traceback
import optparse
import logging
import System
from System.Text import StringBuilder
from System.IO import DirectoryInfo, File, FileInfo, FileStream, FileMode, Path, StreamWriter, StreamReader, BinaryWriter, BinaryReader

log = logging.getLogger(__name__)

clr.AddReference("DocumentFormat.OpenXml")

from System import Array, Byte
from DocumentFormat.OpenXml import WordprocessingDocumentType
from DocumentFormat.OpenXml.Packaging import *
from DocumentFormat.OpenXml.Wordprocessing import *
from DocumentFormat.OpenXml.Vml import Shape, TextBox

from openxml import common
## Get environment properties - must be done before importing modules below!
try:
    for key in common.ENVIRONMENT_PROPS.keys():
        if os.environ.has_key(key) and os.environ[key]:
            common.ENVIRONMENT_PROPS[key] = os.environ[key]
except Exception as e:
    log.error("Error getting environment props!", exc_info=e)


from openxml.fromdocx.translator import DocxTranslator
from openxml.fromdocx.baseTranslator import BaseTranslator
from openxml.fromdocx.tableTranslator import TableTranslator
from openxml.fromdocx.imageHandler import ImageHandler
from openxml.fromdocx.equationHandler import EquationHandler
from openxml.fromdocx.elementboxTranslator import ElementBoxTranslator

class Docx2Xhtml(DocxTranslator):

    def __init__(self):

        self.userId = None
        self.login = None
        self.token = None
        self.xhtml = ""
        #self.imageCount = 0
        self.mainPart = None
        self.hasTitle = False
        self.XNamespace = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
        self.curListLevel = -1
        self.curListType = "none" #enum{"none", "number", "bullet"}
        self.blockImageHandler = None
        self.defTermElement = None
        self.bt = None
        self.tt = None
        self.doc = None
        self.ebt = None
        self.inDl = False
        self.mapping = {'Title': self.translateTitle,
                        'CK12ChapterTitle': self.translateTitle,
                        'Heading1': self.translateHeading1,
                        'CK12SectionTitle': self.translateHeading1,
                        'Heading2': self.translateHeading2,
                        'CK12SubsectionTitle': self.translateHeading2,
                        'Heading3': self.translateHeading3,
                        'CK12SubsubsectionTitle': self.translateHeading3,
                        'ListParagraph': self.translateList,
                        'CK12NumberedList': self.translateNumberList,
                        'CK12BulletedList': self.translateBulletList,
                        'CK12LessonBase': self.translateBase,
                        'CK12BlockImage': self.translateBlockImage,
                        'CK12ImageCaption': self.translateImageCaption,
                        'CK12LiteralLayout' : self.translateLiteral,
                        'CK12BlockQuote': self.translateBlockQuote,
                        'CK12Indent': self.translateIndent,
                        'CK12DefinitionTerm': self.translateDefTerm,
                        'CK12DefinitionDesc': self.translateDefDesc,
                        'CK12BlockEquation': self.translateMTBlockMath,
                        'MTDisplayEquation': self.translateMTBlockMath,
                        'CK12RawData': self.translateRawData,
                        'CK12ElementBox': self.translateElementBox,
                        }
        
    def translateElement(self, element):
        type = element.GetType().ToString()
        if type.rfind('Para') >= 0:
            return self.translateParagraph(element)
        if type.rfind('Table') >= 0:
            return self.translateTable(element)
        if type.rfind('TextBox') >= 0:
            return self.translateElementBox(element)

    def translateParagraph(self, element):
        text = element.InnerText
        #log.info("Paragraph "+ text)
        try:
            style = None
            try:
                style = element.ParagraphProperties.ParagraphStyleId.Val.ToString()
                log.info("Style: [%s]" % style)
            except:
                style = ''
                pass
            
            #Handlers from previous element
            if style.rfind('List') < 0:
                self.resolveListClosure()
                log.info("Finished resolveListClosure()")
            if not style.endswith('CK12DefinitionTerm') and not style.endswith('CK12DefinitionDesc'):
                self.resolveDefList()
            
            if style.rfind ('Caption') < 0 :
                if self.blockImageHandler is not None and style.rfind('RawData') < 0:
                    log.info("Calling resolveBlockImage")
                    self.resolveBlockImage()
                elif self.tt is not None:
                    log.info("Calling resolveTable")
                    self.resolveTable()
                
            ## Special case for elementBox - the test is to check if the para
            ## has one or more text boxes as its descendants.
            if self.__hasElementBox(element):
                log.info("Calling translateElementBox")
                self.translateElementBox(element)
            elif self.mapping.has_key(style):
                log.info("Calling handler for %s: %s" % (style, str(self.mapping[style])))
                self.mapping[style](element)
            else:
                log.info("WARNING, no translator for style: [%s]. Degrading..." %style)
                self.translateBase(element)

        except Exception as e:
            #empty paragraph
            log.error("Warning, style not found. Degrading... %s" % str(e), exc_info=e)
            self.addWarning("Warning, style not found. Degrading... %s " % str(e))
            self.translateBase(element)

    def __hasElementBox(self, element):
        for e in element.Descendants[TextBox]():
            log.info("Has a TextBox as child")
            return True
        log.info("Para has no textbox - not an element box")
        return False

    def resolveListClosure(self, target=0, clear=True):
        log.info("Resolving list closure: %s" % self.curListType)
        #resolve unclosed list tags.
        
        #This resolves anything but the last one
        if self.curListType == "none" :
            return
        elif self.curListType == "number" :
            while self.curListLevel > target:
                self.xhtml += "    </ol>\n   </li>\n"
                self.curListLevel -= 1
        elif self.curListType == "bullet" :
            while self.curListLevel > target:
                self.xhtml += "    </ul>\n  </li>\n"
                self.curListLevel -= 1
        
        #this resolves the last level    
        if clear:
            if self.curListType == "number" :
                self.xhtml += "</ol>\n"
            elif self.curListType == "bullet" :
                self.xhtml += "</ul>\n"
                
            self.curListType = "none"
            self.curListLevel = -1
            
        #log.info("Post resolving lists. Done")
        
    def translateBulletList(self, element):
        try:
            if not element.ParagraphProperties.NumberingProperties:
                ## This is a new para within the same listitem
                log.info("New para in same list item")
                inList = False
                if self.curListType != 'none' and self.xhtml.endswith('</li>\n'):
                    self.xhtml = self.xhtml[:-1*len('</li>\n')]
                    inList = True
                self.translateBase(element)
                if inList:
                    self.xhtml += '</li>\n'
                return

            numberId = element.ParagraphProperties.NumberingProperties.NumberingId.Val.ToString()
            level = element.ParagraphProperties.NumberingProperties.NumberingLevelReference.Val.ToString()
            #log.info("List level: "+ level +" "+ element.InnerText)
            #log.info("List numberId: "+ numberId)
            level = int(level)    
            
            if self.curListType == "none" :
                #new list
                self.xhtml +="\n<ul>\n"
            elif self.curListType == "bullet" :
                #check for new level
                if self.curListLevel < level :
                    #Adding indent level
                    if self.xhtml.endswith('</li>\n'):
                        self.xhtml = self.xhtml[:-1*len('</li>\n')] + "\n    <ul>\n"
                elif self.curListLevel > level:
                    #Decreasing indent level
                    self.resolveListClosure(target=level, clear=False)
            elif self.curListType == "number" :
                #Assuming new list, close the others
                self.resolveListClosure()
                self.xhtml +="<ul>\n"

            self.curListLevel = level
            self.curListType = "bullet"
            para = self.translateBase(element, append=False, para=False)
            #self.xhtml +="    <listitem><para>%s</para></listitem>\n" %element.InnerText
            if not para:
                para = "&nbsp;"
            self.xhtml +="    <li>%s</li>\n" %para
        except Exception as e:
            log.error("Error: Unable to get list properties. Degrading... [%s]" % str(e), exc_info=e)
            self.addWarning("Error: Unable to get list properties. Degrading... [%s]" % str(e))
            self.translateBase(element)
            
    def translateNumberList(self, element):
        log.info("Translating NumberedList")
        try:
            if not element.ParagraphProperties.NumberingProperties:
                ## This is a new para within the same listitem
                log.info("New para in same list item")
                inList = False
                if self.curListType != 'none' and self.xhtml.endswith('</li>\n'):
                    self.xhtml = self.xhtml[:-1*len('</li>\n')]
                    inList = True
                self.translateBase(element)
                if inList:
                    self.xhtml += '</li>\n'
                return

            numberId = element.ParagraphProperties.NumberingProperties.NumberingId.Val.ToString()
            level = element.ParagraphProperties.NumberingProperties.NumberingLevelReference.Val.ToString()
            #log.info("List level: "+ level +" "+ element.InnerText)
            log.info("List numberId: "+ numberId)
            level = int(level)
            startAt = 1
            foundStart = False
            officeType = None
            try:
                abnumId = -1
                numbering = self.mainPart.NumberingDefinitionsPart.Numbering
                for child in numbering.ChildElements:
                    if type(child) == NumberingInstance and int(child.NumberID) == int(numberId):
                        abnumId = int(child.AbstractNumId.Val)
                        break
                log.info("abnumId: %d %s" % (abnumId, type(abnumId)))

                for child in numbering.ChildElements:
                    if type(child) == AbstractNum and int(child.AbstractNumberId) == abnumId:
                        for lvl in child.ChildElements:
                            if type(lvl) == Level and int(lvl.LevelIndex) == level:
                                if not foundStart and lvl.StartNumberingValue:
                                    startAt = int(lvl.StartNumberingValue.Val)
                                    foundStart = True
                                if not officeType:
                                    for nf in lvl.ChildElements:
                                        if type(nf) == NumberingFormat:
                                            officeType = nf.Val
                        break

            except Exception, e:
                log.error("Error getting startAt value and/or numbering format", exc_info=e)
                self.addWarning("Error getting startAt value: [%s]" % str(e))
            
            log.info("Starting at: %d" % startAt)
            startStr = ''
            if startAt > 1:
                startStr = ' start="%d"' % startAt

            log.info("Numbering style: %s" % officeType)
            if officeType:
                numberingType = self.getXhtmlNumberingType(officeType)
                if numberingType:
                    startStr = '%s class="%s"' % (startStr, numberingType)
            log.info("Attr str: %s" % startStr)

            if self.curListType == "none" :
                #new list
                self.xhtml +='<ol%s>\n' % startStr
            elif self.curListType == "number" :
                #check for new level
                if self.curListLevel < level :
                    #Adding indent level
                    if self.xhtml.endswith('</li>\n'):
                        self.xhtml = self.xhtml[:-1*len('</li>\n')] + '\n    <ol%s>\n' % startStr
                elif self.curListLevel > level:
                    #Decreasing indent level
                    self.resolveListClosure(target=level, clear=False)
                    #self.xhtml +="\n  </listitem>\n"
            elif self.curListType == "bullet" :
                #Assuming new list, close everything else
                self.resolveListClosure()
                self.xhtml +='<ol%s>\n' % startStr
                
            self.curListLevel = level
            self.curListType = "number"
            para = self.translateBase(element, append=False, para=False)
            if not para:
                para = "&nbsp;"
            self.xhtml +="    <li>%s</li>\n" %para
        except Exception as e:
            log.info("Error: Unable to get list properties. Degrading...")
            log.error("Error message: %s" % str(e))
            self.addWarning("Unable to get list properties. [%s]" % str(e))
            self.translateBase(element)
            
    def getXhtmlNumberingType(self, officeType):
        """
            Convert an MS Office list type to xhtml type
        """
        officeType = str(officeType).lower()
        if officeType == str(NumberFormatValues.UpperLetter).lower():
            return 'x-ck12-upper-alpha'
        elif officeType == str(NumberFormatValues.LowerLetter).lower():
            return 'x-ck12-lower-alpha'
        elif officeType == str(NumberFormatValues.UpperRoman).lower():
            return 'x-ck12-upper-roman'
        elif officeType == str(NumberFormatValues.LowerRoman).lower():
            return 'x-ck12-lower-roman'

        return 'x-ck12-decimal'
            
    def translateList(self, element):
        try:
            numberId = element.ParagraphProperties.NumberingProperties.NumberingId.Val.ToString()
            level = element.ParagraphProperties.NumberingProperties.NumberingLevelReference.Val.ToString()
            log.info("curListLevel: %d" % self.curListLevel)
            log.info("List level: "+ level +" "+ element.InnerText)
            log.info("List numberId: "+ numberId)
                
            #new list    
            if self.curListLevel < int(level):
                self.curListLevel = int(level)
                self.xhtml +="<ul>\n"
                self.curListType = 'bullet'
                
            self.xhtml +="    <li>%s</li>\n" %element.InnerText
        except Exception as e:
            log.info("Error: Unable to get list properties. Degrading...")
            log.error("Error message: %s" % str(e))
            self.addWarning("Unable to get list properties. [%s]" % str(e))
            self.translateBase(element)
            

    def getInnerText(self, element):
        text = ''
        for e in element.Descendants[Text]():
            text += e.InnerText
        return text


    ## TODO: h2 should be promoted to h1 and so forth ...
    def translateTitle(self, element):
        text = self.getInnerText(element)
        log.info("title text: %s" % text)
        id = common.genURLSafeBase64Encode(text)
        if not self.hasTitle :
            txt = '<h2 id="%s">%s</h2>\n' % (id, text)
            self.hasTitle = True
        else:
            txt = '<h3 id="%s">%s</h3>\n' % (id, text)
        self.xhtml = self.xhtml + txt

    def getAttribute(element, localName, namespaceUri=common.CK12_XML_NAMESPACE):
        try:
            attr = element.GetAttribute(localName, namespaceUri)
            return attr.Value
        except Exception as e:
            log.error("Could not get %s in element: %s" % (localName, element))
            return None

    def translateHeading1(self, element):
        text = element.InnerText.strip()
        id = common.genURLSafeBase64Encode(text)
        self.xhtml += '<h2 id="%s">%s</h2>\n' % (id, text)
    
    def translateHeading2(self, element):
        text = element.InnerText.strip()
        id = common.genURLSafeBase64Encode(text)
        self.xhtml += '<h3 id="%s">%s</h3>\n' % (id, text)
    
    def translateHeading3(self, element):
        text = element.InnerText.strip()
        id = common.genURLSafeBase64Encode(text)
        self.xhtml += '<h4 id="%s">%s</h4>\n' % (id, text)

    def translateLiteral(self, element):
        self.xhtml += self.bt.translateLiteral(element)

    def translateBlockQuote(self, element):
        text = element.InnerText
        self.xhtml += "<blockquote><p>%s</p></blockquote>\n" %text

    def translateIndent(self, element):
        """
            Convert the paragraph to indent style
        """
        text = element.InnerText
        self.xhtml += '<p class="x-ck12-indent">%s</p>\n' %text

    """
        Translate the MTDisplayEquation type paragraphs to equation elements
    """
    def translateMTBlockMath(self, element):
        self.xhtml += self.bt.translateBlockMath(element)

    
    def translateBase(self, element, append=True, para=True):
        try:
            val = self.bt.translateBase(element, paraWrap=para)
            if append:        
                self.xhtml += val
            else: 
                return val
        except Exception, e:
            log.error("ERROR: %s" % str(e))
            self.addWarning("Error from translateBase: [%s]" % str(e))
                
    def translateTable(self, element):
        self.resolveListClosure()
        self.resolveDefList()
        self.tt = TableTranslator(self.mainPart, self.userId, self.login, self.token)
        self.tt.addTableElement(element)

    def resolveTable(self):        
        tableXhtml = self.tt.translateTable()
        log.info("Translating table: %s" % tableXhtml)
        self.xhtml += tableXhtml
        self.tt = None

    def translateElementBox(self, element):
        self.ebt = ElementBoxTranslator(self, self.mainPart, element, self.userId, self.login, self.token)
        self.resolveElementBox()

    def resolveElementBox(self):
        ## Modifies self.xhtml
        self.ebt.translateElementBox()
        self.ebt = None
        log.info("Resolved elementBox")

    """
        Translate raw data of the python dictionary format.
        eg: {prop1: val1, prop2: val2, ...}
        Currently used for video properties that cannot be stored in
        Word.
    """
    def translateRawData(self, element):
        d = {}
        data = element.InnerText
        log.info("Raw data: %s" % data)
        data = data.strip('{}')
        parts = data.split(',')
        for part in parts:
            nv = part.split(':', 1)
            d[nv[0].strip()] = nv[1].strip()
        log.info("Values: %s" % d)

        if not self.blockImageHandler:
            self.blockImageHandler = ImageHandler(self.mainPart, self.userId, self.login, self.token)
        ## Figure out which object this data belongs to:
        if self.blockImageHandler:
            #if d['class'].lower() in ['youtube',]:
            self.blockImageHandler.isVideo = True
            self.blockImageHandler.videoData = d
        else:
            log.info("WARNING: Got raw data but no parent for it. Ignoring ...")

    def translateBlockImage(self, element):
        log.info("Translating block image.")
        #self.imageCount += 1
        self.blockImageHandler = ImageHandler(self.mainPart, self.userId, self.login, self.token)
        self.blockImageHandler.addBlockPara(element)

    def translateImageCaption(self, element):
        if self.blockImageHandler is not None:
            self.blockImageHandler.addCaption(element)
            self.resolveBlockImage()
        elif self.tt is not None:
            self.tt.addCaption(element)
            self.resolveTable()
        else:
            log.info("ERROR: image caption without image. Degrading...")
            self.translateBase(element)
                    
    def resolveBlockImage(self):
        imageStr = self.blockImageHandler.translateBlock()
        log.info("Image string after translateBlock(): %s" % imageStr)
        self.xhtml += imageStr
        self.blockImageHandler = None
        
    def translateDefTerm(self, element):
        if not self.inDl:
            self.xhtml += '\n<dl>'
            self.inDl = True
        self.defTermElement = element
    
    def translateDefDesc(self, element):
        term = self.bt.translateBase(self.defTermElement, paraWrap=False)
        desc = self.bt.translateBase(element, paraWrap=False)
        listText = "\n<dd>%s</dd>" %desc
        entryText = "\n<dt>%s</dt>%s" % (term, listText)
        self.xhtml += entryText

    def resolveDefList(self):
        if self.inDl:
            self.xhtml += '\n</dl>\n'
            self.inDl = False
        
    def removeMacros(self):
        while True:
            found = False
            for part in self.mainPart.Parts:
                if part.OpenXmlPart.RelationshipType.endswith("/vbaProject"):
                    log.info("Deleting part: %s" % part.OpenXmlPart.RelationshipType)
                    self.mainPart.DeletePart(part.OpenXmlPart)
                    found = True
                    break
            if not found:
                break

    def translateDocx(self, docname):
        self.doc = WordprocessingDocument.Open(docname, True)
        try:
            self.mainPart = self.doc.MainDocumentPart
            self.removeMacros()
            self.initiateTranslators()
            childList = self.doc.MainDocumentPart.Document.Body.ChildElements
            for child in childList:
                log.info("Handling child of type: %s" % child.GetType().ToString())
                self.translateElement(child)
            self.resolveListClosure()
            self.resolveDefList()
            if self.blockImageHandler:
                self.resolveBlockImage()
            return '''<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
  "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <title></title>
    </head>
    <body>
        %s
    </body>
</html>''' % self.xhtml
        finally:
            if self.doc:
                self.doc.Close()

    def initiateTranslators(self):
        self.bt = BaseTranslator(self.mainPart, self.userId, self.login, self.token)
        #self.tt = TableTranslator(self.mainPart)
        
if __name__ == '__main__':
    docname = None
    xhtmlName = None

    parser = optparse.OptionParser()
    parser.add_option("-u", "--user-id", type="int", dest="userId", help="User ID of the user adding a content")
    parser.add_option("-l", "--login", dest="login", help="Login of the user adding a content")
    parser.add_option("-t", "--token", dest="token", help="Token of the user adding a content in the form '<cookiename>=<value>'")
    parser.add_option("-s", "--source", dest="source", help="Source document to be parsed.")
    parser.add_option("-d", "--dest", dest="destination", help="Destination XHTML file to be created")

    translator = Docx2Xhtml()
    (options, args) = parser.parse_args(sys.argv)
    if options.userId:
        translator.userId = options.userId
    else:
        raise Exception("Invalid user id.")
    if options.login:
        translator.login = options.login
    else:
        raise Exception("Invalid login")

    if options.token:
        translator.token = options.token
    else:
        raise Exception("Must specify a login token")

    if options.source:
        docname = options.source
    else:
        docname = "xhtml.docx"

    if options.destination:
        xhtmlName = options.destination
    else:
        xhtmlName = "concept.xhtml"

    try:
        xhtml = translator.translateDocx(docname)
        file = open(xhtmlName, 'w')
        file.write(xhtml.encode('utf-8'))
        file.close()
        log.info(xhtmlName)
    finally:
        warningFile = xhtmlName + '.warn'
        f = open(warningFile, "w")
        if translator.getWarnings():
            log.info("!!!!!!!!!! WARNINGS !!!!!!!!!!!")
            for warning in translator.getWarnings():
                log.info("!!! WARN: %s" % warning)
                f.write('%s\n' % warning.encode('utf-8'))
        f.close()
    
