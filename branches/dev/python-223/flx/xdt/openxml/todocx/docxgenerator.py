# -*- coding: utf-8 -*-

import sys
import os
import urllib2, json
import clr
import System
from System.Text import StringBuilder
from System.IO import DirectoryInfo, File, FileInfo, Path, StreamWriter, FileStream, FileMode
import traceback
    
clr.AddReference("System.Drawing")
clr.AddReference("DocumentFormat.OpenXml")

from System import Array, Byte
import System.Drawing.Image as DImage
from DocumentFormat.OpenXml import *
from DocumentFormat.OpenXml.Packaging import *
from DocumentFormat.OpenXml.Wordprocessing import *
import DocumentFormat.OpenXml.Drawing as d
import DocumentFormat.OpenXml.Drawing.Wordprocessing as dw
import DocumentFormat.OpenXml.Drawing.Pictures as pic

from openxml import common
try:
    for key in common.ENVIRONMENT_PROPS.keys():
        if os.environ.has_key(key) and os.environ[key]:
            common.ENVIRONMENT_PROPS[key] = os.environ[key]
    print "Environment properties: %s" % common.ENVIRONMENT_PROPS
except:
    print "Error getting environment properties!"
    print traceback.format_exc()

from openxml.todocx.styles import *
from openxml.todocx.docxlist import BulletList
from openxml.todocx.docximage import DocxImage
from openxml.todocx.docxequation import DocxEquation
from openxml.todocx.docxtable import DocxTable
from openxml.todocx.docxlink import DocxExternalLink, DocxInternalLink
from openxml.todocx.docxelementbox import DocxElementBox
from openxml.todocx.xhtml.xhtmlparser import NONBLOCK_NODES
from openxml.todocx.macrorunner import MacroRunner

IMAGE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'images')
EO_INFO_URL = 'http://%s/flx/get/info/embeddedobject' % common.ENVIRONMENT_PROPS['FLX2_HOST']

class DocxGenerator:

    def __init__(self, filename="xhtml.docx"):

        self.filename = os.path.abspath(filename)
        self.lastPara = None
        self.lastRunProperties = None
        self.nodedict = []
        self.createNewNext = True
        self.lastDepth = -1
        self.comments = None

        ## Table stuff
        self.table = None
        self.tableInstanceId = 1

        ## Image stuff
        self.figureTitle = None
        self.figureCaption = None
        self.imageInstanceId = 1
        self.imageNumber = 1
        self.image = None
        self.figureVideoData = {}
        self.imageFloat = False

        ## Equation stuff
        self.equation = None
        self.equationId = 1
        self.enableEmbeddedEquations = False

        ## List stuff
        self.bulletList = None
        self.numberedList = None
        self.listId = 0
        self.numPart = None

        ## Bookmarks
        self.bookmarkId = 1
        self.bookmarkName = None

        ## ElementBox stuff
        self.elementBoxId = 1
        self.elementBox = None
        self.inElementBoxBody = False

        self.doc = WordprocessingDocument.Create(filename, WordprocessingDocumentType.Document)
        self.mainPart = self.doc.AddMainDocumentPart()
        self.mainPart.Document = Document()
        self.mainPart.Document.AddNamespaceDeclaration("ck", common.CK12_XML_NAMESPACE)
        self.body = Body()

        self.addNumbersDefinitionPart()

        ## Define styles
        self.stylePart = self.mainPart.AddNewPart[StyleDefinitionsPart]()
        self.stylePart.Styles = Styles()
        addStyles(self.stylePart, self.mainPart, self.numPart)

        self.warnings = []

    def writeDocument(self):
        ## Add body and save the document
        self.stylePart.Styles.Save()
        self.mainPart.Document.Append(self.body)
        self.mainPart.Document.Save()
        self.doc.Close()

        #self.convertMath()

    def addTextRun(self, para, node):
        text = node.get('text')
        if text:
            if node['name'].endswith('/pre'):
                lines = text.split("\n")
            else:
                lines = [ text ]
            r = Run()
            para.Append(r)
            i = 0
            while i < len(lines):
                line = lines[i]
                if i > 0 and node['name'].endswith('/pre'):
                    lnbr = Break()
                    lnbr.Type = BreakValues.TextWrapping
                    r.Append(lnbr)

                t = Text()
                t.Space = SpaceProcessingModeValues.Preserve
                t.Text = line
                r.Append(t)

                i += 1

    def parseComment(self):
        dict = {}
        if self.comments:
            parts = self.comments.strip().split('@@')
            for part in parts:
                if part:
                    name, val = part.split('=', 1)
                    dict[name.strip().lower()] = val.strip().strip('"').strip("'")
        return dict

    def addTextRuns(self, para, texts):
        runs = 0
        for text in texts:
            t = Text()
            t.Space = SpaceProcessingModeValues.Preserve
            t.Text = text
            para.Append(Run(t))
            runs += 1
        return runs

    def processNodes(self, nodes):
        for node in nodes:
            self.processNode(node)

        i = 0
        lastParaIdx = 0
        while i < len(self.nodedict):
            node = self.nodedict[i]
            print "Processing node name %s" % node['name']
            i += 1
            if node['node']:
                if node['name'] == 'p' and not self.hasText(node['node']) and not node['node'].HasChildren:
                    continue
                try:
                    if not node['node'].Parent:
                        print "Appending %s to body" % str(node)
                        self.body.Append(node['node'])
                        lastParaIdx = i-1
                except SystemError, se:
                    if 'part of a tree' in se.message:
                        self.warnings.append("Ignoring duplicate insertion error: %s" % node['xpath'])
                    else:
                        raise se

    def findLastNodeOfTypes(self, needTypes):
        if self.nodedict:
            i = len(self.nodedict) - 1
            while i >= 0:
                if self.nodedict[i]['node'] and type(self.nodedict[i]['node']) in needTypes:
                    return self.nodedict[i]['node']
                i -= 1
            return None

    def addImageCaption(self, image, shortCaption, longCaption):
        para = image.addCaptionParagraph(shortCaption=shortCaption, longCaption=longCaption, imageNumber=self.imageNumber)
        if longCaption:
            self.imageNumber += 1
        return para

    def getStyleValue(self, node, propName):
        if node.has_key('style') and node['style']:
            style = node['style']
            parts = style.lower().split(';')
            for part in parts:
                part = part.strip()
                if part:
                    pair = part.split(':')
                    if pair[0].strip() == propName.lower():
                        return pair[1].strip()
        return None

    def hasClass(self, node, className, op='='):
        result, name = self.hasAttrValue(node, attrName='class', attrVal=className, op=op)
        return result

    def getClass(self, node, className, op='='):
        result, name = self.hasAttrValue(node, attrName='class', attrVal=className, op=op)
        return name

    def hasAttrValue(self, node, attrName, attrVal, op='='):
        if node.has_key(attrName):
            if op == 'exists':
                return True, None
            vals = [ v.strip() for v in node[attrName].split() ]
            
            if op == '=':
                return attrVal in vals, attrVal
            elif op == 'startswith':
                for v in vals:
                    if v.startswith(attrVal):
                        return True, v
            elif op == 'endswith':
                for v in vals:
                    if v.endswith(attrVal):
                        return True, v
        return False, False


    def getColorCode(self, name):
        if not name:
            return None
        name = name.lower()
        return common.COLOR_CODES.get(name)

    def processNode(self, node):
        if node.get('comments'):
            self.comments = ' '.join(node.get('comments'))
        depth = node['name'].count("/") - 1
        nodeName = os.path.basename(node['name'])
        endNode = nodeName.endswith('__end')
        startNode = nodeName.endswith('__start')
        nodeName = nodeName.replace('__end', '')
        nodeName = nodeName.replace('__start', '')
        parent = os.path.basename(os.path.dirname(node['name']))

        print "Node: %s Parent: %s Starting new? %s End node? %s" % (nodeName, parent, str(self.createNewNext), str(endNode))
        processText = True
        if nodeName not in NONBLOCK_NODES:
            if self.createNewNext:
                para = None
                if node['name'].endswith('/html'):
                    pass

                elif node['name'].startswith('/html/head'):
                    pass

                elif node['name'].endswith('/html/body'):
                    if node.get('text'):
                        para = STYLES['CK12LessonBase'].getNewParagraph()

                ## h1 should be the concept title - but current XHTML for concept has title in h2
                elif node['name'].endswith('/h1'):
                    para = STYLES['CK12ChapterTitle'].getNewParagraph()
                    if node.get('id'):
                        attr = OpenXmlAttribute("ck", "id", common.CK12_XML_NAMESPACE, node.get('id'))
                        para.SetAttribute(attr)
                
                elif node['name'].endswith('/h2'):
                    para = STYLES['CK12SectionTitle'].getNewParagraph()
                    if node.get('id'):
                        attr = OpenXmlAttribute("ck", "id", common.CK12_XML_NAMESPACE, node.get('id'))
                        para.SetAttribute(attr)
                 
                elif node['name'].endswith('/h3'):
                    para = STYLES['CK12SubsectionTitle'].getNewParagraph()
                    if node.get('id'):
                        attr = OpenXmlAttribute("ck", "id", common.CK12_XML_NAMESPACE, node.get('id'))
                        para.SetAttribute(attr)
                 
                elif node['name'].endswith('/h4') or node['name'].endswith('/h5') \
                        or node['name'].endswith('/h6') or node['name'].endswith('/h7'):
                    para = STYLES['CK12SubsubsectionTitle'].getNewParagraph()
                    if node.get('id'):
                        attr = OpenXmlAttribute("ck", "id", common.CK12_XML_NAMESPACE, node.get('id'))
                        para.SetAttribute(attr)
 
                elif node['name'].endswith('/div') and self.hasClass(node, 'x-ck12-element-box', 'startswith'):
                    ## Process element box
                    if self.hasClass(node, 'x-ck12-element-box'):
                        print "Found element box: %s" % node['name']
                        self.elementBox = DocxElementBox(self.elementBoxId)
                        self.elementBoxId += 1
                        para = self.elementBox.create()

                    elif self.hasClass(node, 'x-ck12-element-box-header'):
                        print "Found element box header: %s" % node['text']
                        para = self.elementBox.getNewHeaderParagraph()
                        self.inElementBoxBody = False

                    elif self.hasClass(node, 'x-ck12-element-box-body'):
                        print "Found element box body: %s" % node['text']
                        self.inElementBoxBody = True

                elif node['name'].endswith('/div') and self.hasClass(node, 'x-ck12-img', 'startswith'):
                    self.image = None
                    self.imageFloat = False
                    if self.hasClass(node, 'x-ck12-float'):
                        self.imageFloat = True
                    self.figureTitle = self.figureCaption = self.bookmarkName = None
                    if node.has_key('id'):
                        self.bookmarkName = node['id']

                elif node['name'].endswith('/img') and not self.hasClass(node, 'x-ck12-math') and not self.hasClass(node, 'x-ck12-block-math'):
                    ## Image but not math image
                    if node.has_key('alt'):
                        self.figureTitle = node['alt']
                    if node.has_key('longdesc'):
                        self.figureCaption = node['longdesc']
                    processText = False
                    try:
                        self.image = DocxImage(self.mainPart, node['src'], self.imageInstanceId)
                        if self.comments:
                            self.image.comments = self.parseComment()
                            self.comments = None
                        self.imageInstanceId += 1
                        imagePartId = self.image.saveImagePart()
                        width = height = 0
                        align = 'left'
                        if node.has_key('width') and node['width']:
                            width = int(node['width'].replace('px', ''))
                        if node.has_key('height') and node['height']:
                            height = int(node['height'].replace('px', ''))
                        if node.has_key('align') and node['align']:
                            align = node['align']
                        if node.has_key('style'):
                            align = self.getStyleValue(node, propName='float')

                        if '/div/' not in node['name']:
                            ## Since this is an inline image and not a block image
                            print "Inline image: %s" % node['src']
                            lastPara = self.findLastNodeOfTypes(needTypes=[Paragraph])
                            link = None
                            if node['name'].endswith('/a/img'):
                                print "This is an image within a hyperLink: %s" % node['src']
                                link = None
                                for e  in lastPara.Descendants[Hyperlink]():
                                    link = e
                                lastPara = link
                            run = self.image.getNewImageRun(type=DocxImage.DocxInlineImageType, desiredWidth=width, desiredHeight=height, hyperLink=link)
                            lastPara.Append(run)
                        else:
                            ## Block image (with figure)
                            self.image.bookmarkName = self.bookmarkName
                            self.image.bookmarkId = self.bookmarkId
                            self.bookmarkId += 1
                            para = self.image.getNewImageParagraph(type=DocxImage.DocxBlockImageType, desiredWidth=width, desiredHeight=height, alignment=align, float=self.imageFloat)
                            if self.figureTitle or self.figureCaption:
                                ## Save the image paragraph
                                self.nodedict.append({'node': para, 'depth': depth, 'name': nodeName, 'xpath': node['name']})
                                print "!!! Adding long caption: %s" % self.figureCaption
                                para = self.addImageCaption(self.image, shortCaption=self.figureTitle, longCaption=self.figureCaption)
                        self.figureTitle = self.figureCaption = self.bookmarkName = None
                    except Exception, e:
                        print traceback.format_exc()
                        self.warnings.append('Unable to get image: %s [Exception: %s]' % (node['src'], e))

                    if self.image:
                        self.addImageCaption(self.image, shortCaption=self.figureTitle, longCaption=self.figureCaption)
                        #self.image.addCaptionParagraph(shortCaption=self.figureTitle, longCaption=None)
                
                elif node['name'].endswith('/object') or node['name'].endswith('/iframe'):
                    print "Found node: %s" % nodeName
                    self.figureVideoData = {}
                    if self.comments:
                        self.figureVideoData.update(self.parseComment())
                        self.comments = None
                    for key in node.keys():
                        if key not in ('name', 'text', 'children', 'comments'):
                            self.figureVideoData[key.lstrip('_')] = node[key]
                    print "Video data: %s" % str(self.figureVideoData)

                elif node['name'].endswith('/object/param'):
                    if node.has_key('_name') and node['_name']:
                        self.figureVideoData[node['_name']] = node['value']

                elif node['name'].endswith('/object/embed'):
                    for key in node.keys():
                        if key not in ['name', 'text', 'children']:
                            self.figureVideoData['embed_%s' % key] = node[key]

                elif (nodeName.endswith('object') or nodeName.endswith('iframe')) and endNode:
                    print "Here in end of object"
                    print "Video data: %s" % str(self.figureVideoData)
                    processText = False
                    eoID = None
                    if self.figureVideoData.get('name'):
                        eoID = self.figureVideoData['name']
                    elif self.figureVideoData.get('internalid'):
                        eoID = self.figureVideoData['internalid']
                    thumbnail = os.path.join(IMAGE_DIR, "emb_video.png")
                    width = height = 0
                    if self.figureVideoData.get('width'):
                        width = int(self.figureVideoData.get('width').replace('px', ''))
                    if self.figureVideoData.get('height'):
                        height = int(self.figureVideoData.get('height').replace('px', ''))
                    if eoID:
                        ## Call the info api to get embedded object info
                        res = urllib2.urlopen('%s/%s' % (EO_INFO_URL, eoID)).read()
                        j = json.loads(res)
                        if j['responseHeader']['status'] == 0:
                            thumbnail = j['response']['thumbnail']
                            if not width:
                                width = j['response']['width']
                            if not height:
                                height = j['response']['height']
                    self.image = DocxImage(self.mainPart, thumbnail, self.imageInstanceId)
                    self.imageInstanceId += 1
                    imagePartId = self.image.saveImagePart()
                    para = self.image.getNewImageParagraph(type=DocxImage.DocxBlockImageType, desiredWidth=width, desiredHeight=height)
                    self.nodedict.append({'node': para, 'depth': depth, 'name': nodeName, 'xpath': node['name']})
                    para = self.image.addVideoData(self.figureVideoData)

                elif node['name'].endswith('/img') and self.hasClass(node, 'x-ck12-', 'startswith'):
                    ## This is an image with a math class
                    ## We will just insert LaTeX representation for the Math objects
                    ## later, when we call the MathType macro to convert the whole document, all math will get
                    ## converted to WMF images.
                    ## Could either be inline math or block math
                    try:
                        if self.hasClass(node, 'x-ck12-block-math'):
                            ## Blockmath
                            if self.enableEmbeddedEquations:
                                self.equation = DocxEquation(self.mainPart, node['alt'], DocxEquation.DocxBlockEquationType, self.equationId)
                                imagePartId = self.equation.saveImagePart()
                                self.equationId += 1
                            if '/table/' in node['name'] and self.table:
                                para = self.table.addParagraphToLastColumn()
                                if self.enableEmbeddedEquations:
                                    run = self.equation.getNewEquationRun(DocxEquation.DocxBlockEquationType)
                                    para.Append(run)
                                    processText = False
                            else:
                                if self.enableEmbeddedEquations:
                                    para = self.equation.getNewEquationParagraph()
                                    processText = False
                                else:
                                    para = STYLES['CK12BlockEquation'].getNewParagraph()
                            if node['alt']:
                                node['alt'] = '\\[\\begin{align}\n' + node['alt'] + '\n\\end{align}\\]'
                            node['text'] = node['alt']
                        elif self.hasClass(node, 'x-ck12-math'):
                            ## Inline math
                            lastPara = self.findLastNodeOfTypes(needTypes=[Paragraph])
                            if node['alt']:
                                if not node['alt'].startswith('{') or not node['alt'].endswith('}'):
                                    ## put the text between { and } - {} is required for MathType to interprete numbers correctly - eg: ${45}$
                                    node['alt'] = '{' + node['alt'] + '}'
                                ## All inlineequations must be delimited by '$' on both sides
                                node['alt'] = '$' + node['alt'] + '$'
                                if not STYLES['CK12InlineEquation'].getFirstDescendantOfType(lastPara, Run):
                                    ## Also prepend a space so that MathType macro does not give option to convert inlineequation to block equation
                                    node['alt'] = ' ' + node['alt']
                            if self.enableEmbeddedEquations:
                                self.equation = DocxEquation(self.mainPart, node['alt'], DocxEquation.DocxInlineEquationType, self.equationId)
                                imagePartId = self.equation.saveImagePart()
                                self.equationId += 1
                                run = self.equation.getNewEquationRun()
                            else:
                                run = STYLES['CK12InlineEquation'].getNewRun(node['alt'])
                            lastPara.Append(run)
                            ## Text already processed
                            processText = False
                        else:
                            self.warnings.append('Unexpected %s in xpath %s' % (nodeName, node['name']))
                    except Exception, e:
                        print traceback.format_exc()
                        self.warnings.append('Unable to get image: %s [Exception: %s]' % (node['alt'], e))

                elif node['name'].endswith('/ul'):
                    if '/ul/' not in node['name']:
                        ## Find out if there is another itemizedlist item in the xpath
                        ## - if so this is just a new level in an existing list
                        ## If not, this is not a sublist

                        self.bulletList = BulletList(self.mainPart, self.numPart, self.listId)
                        self.bulletList.addBulletListDefinition('bullet')
                        self.listId += 1
                        if not node.has_key('children') or not node['children']:
                            para = self.bulletList.getNewNumberingParagraph(node['name'].count('ul/'))
                            self.warnings.append("Found an empty list. Processing by adding empty bullet.")

                elif node['name'].endswith('/ul/li'):
                    level = node['name'].count('ul/') - 1
                    para = self.bulletList.getNewNumberingParagraph(level)

                elif node['name'].endswith('/ul/li/p'):
                    para = self.bulletList.getNewParagraph()

                elif node['name'].endswith('/ol'):
                    if '/ol/' not in node['name']:
                        ## Find out if there is another orderedlist item in the xpath 
                        ## - if so this is just a new level in an existing list
                        ## If not, this is not a sublist

                        self.numberedList = BulletList(self.mainPart, self.numPart, self.listId)
                        if node.has_key('start') and node['start']:
                            self.numberedList.startAt = int(node['start'])
                            print "New list starts at: %d" % self.numberedList.startAt
                        self.numberedList.addBulletListDefinition('number')
                        self.listId += 1
                        if not node.has_key('children') or not node['children']:
                            print "Adding level: %d" % node['name'].count('ol/')
                            para = self.numberedList.getNewNumberingParagraph(node['name'].count('ol/'))
                            self.warnings.append("Found an empty list. Processing by adding empty bullet.")
                    if node.get('class'):
                        level = node['name'].count('ol/')
                        self.numberedList.changeListLevelType(node['class'], level)

                elif node['name'].endswith('/ol/li'):
                    level = node['name'].count('ol/') - 1
                    para = self.numberedList.getNewNumberingParagraph(level)

                elif node['name'].endswith('/ol/li/p'):
                    para = self.numberedList.getNewParagraph()

                elif node['name'].endswith('/table'):
                    bookmarkName = None
                    if node.has_key('id'):
                        bookmarkName = node['id']
                    float = self.hasClass(node, 'x-ck12-float')
                    self.table = DocxTable(self.tableInstanceId, self.bookmarkId, bookmarkName=bookmarkName, float=float)
                    self.tableInstanceId += 1
                    self.bookmarkId += 1
                    para = self.table.table

                    if node.has_key('summary'):
                        self.table.addCaption(node['summary'])

                elif node['name'].endswith('/table/caption'):
                    para = self.table.addDescription(node['text'])
                    processText = False
                
                elif node['name'].endswith('/table/thead'):
                    pass

                elif node['name'].endswith('/table/thead/tr'):
                    self.table.addHeaderRow()
                
                elif node['name'].endswith('/table/thead/tr/td') or node['name'].endswith('/table/thead/tr/th'):
                    #hasText = (node.has_key('text') and node['text']) or (node.has_key('children') and 'para' not in node['children'])
                    para = self.table.addHeaderColumn()
                
                elif node['name'].endswith('/table/tbody'):
                    pass

                elif node['name'].endswith('/table/tbody/tr'):
                    self.table.addRow()
                
                elif node['name'].endswith('/table/tbody/tr/td'):
                    #hasText = (node.has_key('text') and node['text']) or (node.has_key('children') and 'para' not in node['children'])
                    para = self.table.addColumn()

                elif node['name'].endswith('/tr/td/p'):
                    para = self.table.addParagraphToLastColumn()

                elif node['name'].endswith('/pre'):
                    para = STYLES['CK12LiteralLayout'].getNewParagraph()

                elif node['name'].endswith('/blockquote'):
                    pass

                elif node['name'].endswith('/blockquote/p'):
                    para = STYLES['CK12BlockQuote'].getNewParagraph()

                elif node['name'].endswith('/bibliography'):
                    self.warnings.append('Ignoring node: %s' % node['name'])
                    pass

                elif node['name'].endswith('/bibliomixed'):
                    ## Not implemented
                    self.warnings.append("Ignoring node: %s" % node['name'])

                elif node['name'].endswith('/dl/dt'):
                    para = STYLES["CK12DefinitionTerm"].getNewParagraph()

                elif node['name'].endswith('/dl/dd'):
                    para = STYLES["CK12DefinitionDesc"].getNewParagraph()

                elif node['name'].endswith('/dl'):
                    pass

                elif node['name'].endswith('/p'):
                    if self.hasClass(node, 'x-ck12-indent'):
                        para = STYLES['CK12Indent'].getNewParagraph()
                    else:
                        para = STYLES['CK12LessonBase'].getNewParagraph()

                else:
                    if not endNode:
                        self.warnings.append('Unknown node at xpath: %s' % node['name'])

                if para:
                    if self.inElementBoxBody:
                        self.elementBox.addNewContentParagraph(para)
                    ## Add the new paragraph to nodedict
                    self.nodedict.append({'node': para, 'depth': depth, 'name': nodeName, 'xpath': node['name']})
            else:
                self.createNewNext = True

            if nodeName == 'img' and self.hasClass(node, 'x-ck12-math') and endNode:
                self.createNewNext = False
            if nodeName == 'img' and '/div/' not in node['name'] and endNode:
                self.createNewNext = False
            if nodeName == 'div' and self.hasClass(node, 'x-ck12-element-box-body') and endNode:
                print "Closing content"
                self.elementBox.closeContent()
                self.inElementBoxBody = False

            ## we are in block node - reset lastRunProperties
            self.lastRunProperties = None
        else:
            self.createNewNext = False

        ## Node where all children should be added
        i = len(self.nodedict) - 1
        while i >= 0:
            para = self.nodedict[i]['node']
            if para:
                break
            i -= 1

        if nodeName in NONBLOCK_NODES:
            ## Make sure the createNewNext is set correctly when one of the non-block nodes end
            if endNode and parent not in NONBLOCK_NODES:
                print "Setting createNewNext to True. Node: %s, Parent: %s, Text: %s" % (nodeName, parent, node.get('text'))
                #self.createNewNext = True

            if '/div/' in node['name'] or '/table/' in node['name'] and not endNode:
                ## Just send the text to title or caption
                ## This should not happen! No formatting allowed inside these tags
                if '/caption/' in node['name']:
                    processText = False
                    self.warnings.append("No %s allowed inside '/caption'" % (nodeName))
                    #if not self.figureCaption:
                    #    self.figureCaption = ''
                    #self.figureCaption += node['text']
                    #if self.image:
                    #    self.image.addCaptionParagraph(shortCaption=None, longCaption=self.figureCaption)
                elif '/title/' in node['name']:
                    processText = False
                    self.warnings.append("No %s allowed inside '/title'" % (nodeName))

            if self.lastRunProperties and depth > self.lastDepth:
                ## If last time we are also in non-block node and 
                ## This node is a child of last one, then copy its RunProperties
                self.lastRunProperties = self.copyRunProperties()
            else:
                ## Create a new one
                self.lastRunProperties = RunProperties()
                if node['name'].endswith('/em') or node['name'].endswith('/i') or node['name'].endswith('/strong') or node['name'].endswith('/b') or node['name'].endswith('/u') or node['name'].endswith('/strike'):
                    runStyle = RunStyle()
                    runStyle.Val = "CK12Emphasis"
                    self.lastRunProperties.Append(runStyle)

            ## Add bold, italics or underline
            if node['name'].endswith('/strong') or node['name'].endswith('/b'):
                self.lastRunProperties.Append(Bold())
            elif node['name'].endswith('/em') or node['name'].endswith('/i'):
                self.lastRunProperties.Append(Italic())
            elif node['name'].endswith('/u') or (node['name'].endswith('/span') and self.hasClass(node, 'x-ck12-underline')):
                ul = Underline()
                ul.Val = UnderlineValues.Single
                self.lastRunProperties.Append(ul)
            elif node['name'].endswith('/strike') or (node['name'].endswith('/span') and self.hasClass(node, 'x-ck12-strikethrough')):
                self.lastRunProperties.Append(Strike())

            elif node['name'].endswith('/sup'):
                vta = VerticalTextAlignment()
                vta.Val = VerticalPositionValues.Superscript
                self.lastRunProperties.Append(vta)

            elif node['name'].endswith('/sub'):
                vta = VerticalTextAlignment()
                vta.Val = VerticalPositionValues.Subscript
                self.lastRunProperties.Append(vta)

            elif node['name'].endswith('/span'):
                if self.hasClass(node, 'x-ck12-textcolor-', 'startswith'):
                    colorCode = self.getColorCode(self.getClass(node, 'x-ck12-textcolor-', 'startswith').replace('x-ck12-textcolor-', ''))
                    if colorCode:
                        color = Color()
                        color.Val = colorCode
                        self.lastRunProperties.Append(color)
                elif self.hasClass(node, 'x-ck12-textbgcolor-', 'startswith'):
                    colorCode = self.getColorCode(self.getClass(node, 'x-ck12-textbgcolor-', 'startswith').replace('x-ck12-textbgcolor-', ''))
                    if colorCode:
                        shd = Shading()
                        shd.Val = ShadingPatternValues.Clear
                        shd.Fill = colorCode
                        self.lastRunProperties.Append(shd)

            elif node['name'].endswith('/a'):
                print "Processing hyperLink"
                ## If node has no url but only a name, it is an internal link
                if not node.get('href') and node.get('_name'):
                    node['href'] = node['_name']
                    node['class'] = 'xref'
                if node.get('href'):
                    if node['href'].startswith('#') or self.hasClass(node, 'xref'):
                        ## Internal link
                        target = node['href'].lstrip('#')
                        link = DocxInternalLink(target, node['text'])
                        link.addNewRun(self.lastRunProperties)
                        para.Append(link.hyperLink)
                    else:
                        link = DocxExternalLink(self.mainPart, node['href'], node['text'])
                        link.addNewRun(self.lastRunProperties)
                        para.Append(link.hyperLink)
                    if 'img' in node.get('children', []):
                        print "Image inside the hyperlink, createNewNext should be True now"
                        self.createNewNext = True
                else:
                    self.warnings.append('Missing required attribute "url" for node %s' % nodeName)
                processText = False

            else:
                if not endNode:
                    self.warnings.append("Unknown NONBLOCK_NODE: %s" % node['name'])
                processText = False

            if not endNode and node.get('text') and processText:
                run = Run()
                t = Text()
                t.Space = SpaceProcessingModeValues.Preserve
                t.Text = node['text']
                run.Append(self.lastRunProperties)
                run.Append(t)

                if para:
                    para.Append(run)
                else:
                    self.warnings.append("Invalid XHTML structure. Node %s has no valid parent! [xpath: %s]" % (nodeName, node['name']))

        else:
            if para and processText and not endNode:
                self.addTextRun(para, node)
        self.lastDepth = depth

    def hasText(self, para):
        for e in para.Descendants[OpenXmlElement]():
            if type(e) == Text:
                return True
        return False

    def copyRunProperties(self):
        rp = self.lastRunProperties
        rpr = RunProperties()
        for el in rp.ChildElements:
            rpr.Append(el.CloneNode(True))
        return rpr

    def addNumbersDefinitionPart(self):
        if not self.numPart:
            ## Only add this once
            self.numPart = self.mainPart.AddNewPart[NumberingDefinitionsPart]()
            bulletList = BulletList(self.mainPart, self.numPart, self.listId)
            bulletList.addBulletListDefinition('bullet', 1)
            self.listId += 1

    def convertMath(self):
        try:
            mr = MacroRunner(self.filename, 'MTCommand_TeXToggle')
            mr.run()
            print "Converted math to MathType successfully!"
        except Exception, e:
            print e
