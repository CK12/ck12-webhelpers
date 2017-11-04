from HTMLParser import HTMLParser
from pylons.i18n.translation import _ 

import os
import sys
import logging
from zipfile import ZipFile
from tempfile import NamedTemporaryFile
from datetime import datetime
import codecs
import cssutils
import re
from BeautifulSoup import BeautifulSoup
from BeautifulSoup import Tag

flx_dir = os.path.abspath(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))
if flx_dir not in sys.path:
    sys.path.append(flx_dir)

from flx.lib.wiki_importer_lib.rosetta_xhtml import CK12RosettaXHTML
import flx.lib.helpers as h
import flx.lib.artifact_utils as au
from flx.model import api

log = logging.getLogger(__name__)

class GDT2XhtmlParser(HTMLParser):

    def __init__(self, userID, inputFile, toFile):
        HTMLParser.__init__(self)
        self.persistObjects = True
        self.tags = []
        self.attrs = None
        self.data = u''
        self.fileStr = u''
        self.writeInstr = []
        self.inputFile = inputFile
        self.destFile = toFile
        self.userID = userID
        self.resources = {}
        self.warnings = []
        self.stylesheet = None
        self.extraTags = []
        self.info = {}
        self.persistInputHtml = False
        self.color_pair_map = {}
        self.buildColorMap()
        self.olConvertedToulCount = 0
        self.propertyDict = dict()
        #Key - list-style-type from google downloaded documents(lists)
        #Value - all list-style-type values that rosetta supports
        
        self.orderListClass = {'decimal' : 'x-ck12-decimal',\
                               'lower-latin' : 'x-ck12-lower-alpha',\
                               'upper-latin' : 'x-ck12-upper-alpha',\
                               'lower-roman' : 'x-ck12-lower-roman',\
                               'upper-roman' : 'x-ck12-upper-roman'
                              }
        self.previousLIMargin = 0
        self.listEndTagValue = []
        self.liProcessed = False
        self.nestedListCount = 0
        self.listOpened = False
        self.removeUnwantedLITag = False
        
    def addEmptyPTag(self, data):
        """
        """
        soup = BeautifulSoup(data)
        liList = soup.findAll('li')
        for li in liList:
            if not li.text:
                tag = Tag(BeautifulSoup() , 'p')
                tag['class'] = 'empty_li'
                li.insert(0, tag)
        return str(soup)

    ## Override
    def start(self):
        """
            Start the processing by opening the downloaded
            zip file and getting the html file from it
        """
        inputStr = self.getFileFromZip('.html', matchType='endswith')
        if inputStr:
            inputStr = inputStr.replace('<p></p>', '<p>&nbsp;</p>')
            inputStr = re.sub('<div>.*?</div>', '', inputStr)
            inputStr = self.addEmptyPTag(inputStr)
            inputStr = h.transform_to_xhtml(inputStr, cleanHtml=True)
            if self.persistInputHtml:
                ## Write html file out
                f = NamedTemporaryFile(suffix='.html', delete=False)
                f.write(inputStr)
                f.close()
                log.info("Wrote input html at: %s" % f.name)
            self.feed(inputStr)
        else:
            raise Exception((_(u'Could not file an html file in the zip archive')).encode("utf-8"))


    def getFileFromZip(self, pattern, matchType='equals'):
        """
            Get a file from the zip file
        """
        z = None
        try:
            z = ZipFile(self.inputFile, 'r')
            log.info("Opened zipfile: %s" % self.inputFile)
            for file in z.namelist():
                if (matchType == 'endswith' and file.endswith(pattern)) \
                    or (matchType == 'equals' and file == pattern) \
                    or (matchType == 'notin' and pattern not in file):
                    log.info("Found file: %s" % file)
                    f = z.open(file, 'rU')
                    contents = f.read()
                    f.close()
                    return contents
        finally:
            if z:
                z.close()
        return None

    ## Override
    def handle_starttag(self, tag, attrs):
        if self.data:
            self.writeInstr.append({'data': self.data.strip()})
            self.data = u''
        self.tags.append(tag)
        self.attrs = attrs
        self.processTag(tag, 'start')

    ## Override
    def handle_startendtag(self, tag, attrs):
        self.tags.append(tag)
        self.attrs = attrs
        self.processTag(tag, 'startend')
        self.tags.pop()

    ## Override
    def handle_endtag(self, tag):
        log.debug("Tag: %s, Data: %s" % (tag, self.data.strip()))
        self.processTag(tag, 'end')
        self.data = u''
        if self.tags[-1] == tag:
            self.tags.pop()
        #xpath = self.getXpath()
        self.attrs = None

    ## Override
    def handle_data(self, data):
        self.data += h.safe_decode(data)

    ## Override
    def handle_charref(self, name):
        self.data += '&#%s;' % h.safe_decode(name)

    ## Override
    def handle_entityref(self, name):
        self.data += '&%s;' % h.safe_decode(name)

    def getXpath(self):
        if self.tags:
            return '/'.join(self.tags)

    def getValue(self, attrName):
        if self.attrs:
            for a, v in self.attrs:
                if a == attrName:
                    return v
        return None

    def setValue(self, attrName, attrVal):
        if self.attrs:
            i = 0
            while i < len(self.attrs):
                if self.attrs[i][0] == attrName:
                    self.attrs.pop(i)
                    self.attrs.append((attrName, attrVal))
                    return
                i += 1
        if not self.attrs:
            self.attrs = []
        self.attrs.append((attrName, attrVal))

    def appendValue(self, attrName, attrVal):
        val = self.getValue(attrName)
        if val:
            val += ' %s' % attrVal
        else:
            val = attrVal
        self.setValue(attrName, attrVal)

    def removeAttr(self, attrName):
        if self.attrs:
            i = 0
            while i < len(self.attrs):
                if self.attrs[i][0] == attrName:
                    self.attrs.pop(i)
                    return
                i += 1

    def hasAttrsExcept(self, attrNames):
        """
            Check if the current tag has any attributes other than 
            the specified list in attrNames
        """
        if self.attrs:
            for a, v in self.attrs:
                if a not in attrNames:
                    return True
        return False

    def hasCSSPropertyValue(self, clss, propName, propVal):
        
        classList = [clss] if not isinstance(clss, list) else clss
        vals = filter(None, map(lambda x: self.propertyDict.setdefault(x, {}).get(propName), classList))
        if vals and propVal in vals:
            return True

        isPresent = False
        if self.stylesheet:
            for r in self.stylesheet.cssRules:
                if r.type == r.STYLE_RULE and '%s' % r.selectorText.lstrip('.') in clss:
                    if propVal in r.style.getPropertyValue(propName) and not isPresent:
                        self.propertyDict[r.selectorText.lstrip('.')][propName] = propVal
                        isPresent = True

        return isPresent

    def getCSSPropertyValue(self, clss, propName):

        classList = [clss] if not isinstance(clss, list) else clss
        vals = filter(None, map(lambda x: self.propertyDict.setdefault(x, {}).get(propName), classList))
        if vals:
            return vals[0]

        propVal = None
        if self.stylesheet:
            for r in self.stylesheet.cssRules:
                if r.type == r.STYLE_RULE and '%s' % r.selectorText.lstrip('.') in clss:
                   propVal = r.style.getPropertyValue(propName)
        return propVal
   
    def buildColorMap(self):
        self.color_pair_map['#00FFFF'] = self.color_pair_map['#0FF'] = 'aqua' 
        self.color_pair_map['#000000'] = self.color_pair_map['#000'] =  'black' 
        self.color_pair_map['#0000FF'] = self.color_pair_map['#00F'] = 'blue' 
        self.color_pair_map['#FF00FF'] = self.color_pair_map['#F0F'] = 'fuchsia' 
        self.color_pair_map['#808080'] = 'gray' 
        self.color_pair_map['#008000'] = 'green' 
        self.color_pair_map['#00FF00'] = self.color_pair_map['0F0'] = 'lime' 
        self.color_pair_map['#800000'] = 'maroon' 
        self.color_pair_map['#000080'] = 'navy' 
        self.color_pair_map['#808000'] = 'olive' 
        self.color_pair_map['#800080'] = 'purple' 
        self.color_pair_map['#FF0000'] = self.color_pair_map['#F00'] = 'red' 
        self.color_pair_map['#C0C0C0'] = 'silver' 
        self.color_pair_map['#008080'] = 'teal' 
        self.color_pair_map['#FFFFFF'] = self.color_pair_map['#FFF'] ='white' 
        self.color_pair_map['#FFFF00'] = self.color_pair_map['#FF0'] = 'yellow' 
    
    def getColorClass(self, color_val):
        if color_val.strip() and self.color_pair_map.get(color_val.strip().upper()):        
            return self.color_pair_map.get(color_val.strip().upper())
        else:
            return None

    def isBold(self, cls):
        return self.hasCSSPropertyValue(cls, 'font-weight', 'bold')

    def isItalic(self, cls):
        return self.hasCSSPropertyValue(cls, 'font-style', 'italic')

    def isUnderline(self, cls):
        ret = self.hasCSSPropertyValue(cls, 'text-decoration', 'underline')
        #print "isUnderline: return: %s" % ret
        return ret

    def isStrikethrough(self, cls):
        return self.hasCSSPropertyValue(cls, 'text-decoration', 'line-through')

    def isSuperscript(self, cls):
        return self.hasCSSPropertyValue(cls, 'vertical-align', 'super')

    def isSubscript(self, cls):
        return self.hasCSSPropertyValue(cls, 'vertical-align', 'sub')

    def isOpen(self, tag):
        i = len(self.writeInstr) - 1
        while i >= 0:
            if self.writeInstr[i].get('tag') == tag:
                if self.writeInstr[i].get('pos') == 'start':
                    return True
                else:
                    break
            i -= 1
        return False

    def processTag(self, tag, pos):
        """
            Process the tag by enqueing it appropriately in the list
        """
        xpath = self.getXpath()
        log.debug( "Tag: %s, xpath: %s, pos: %s, attrs: %s" % (tag, xpath, pos, self.attrs))
        if tag == 'style' and pos == 'end':
            try:
                self.stylesheet = cssutils.parseString(self.data)
            except Exception, e:
                log.error("Error parsing css: %s" % str(e), exc_info=e)
            return

        if tag in ['meta', 'script']:
            return

        ## Special case for <a name="" id=""></a> tags in google html
        if tag == 'a' and not self.hasAttrsExcept(['class', 'id', 'name']):
            return

        #if tag == 'h1':
        #    ## push one level down
        #    tag = 'h2'

        skipTag = False
        omitAttrs = ['class']
        if tag == 'span':
            if self.getValue('class') and pos == 'start':
                cls = self.getValue('class').split()
                self.removeAttr('class')
                ## Tag replacement
                if self.isBold(cls):
                    #print "Found bold"
                    self.writeInstr.append({'tag': 'strong', 'pos': 'start'})
                    self.extraTags.append('strong')
                    skipTag = True
                if self.isItalic(cls):
                    self.writeInstr.append({'tag': 'em', 'pos': 'start'})
                    self.extraTags.append('em')
                    skipTag = True
                if self.isSuperscript(cls):
                    self.writeInstr.append({'tag': 'sup', 'pos': 'start'})
                    self.extraTags.append('sup')
                    skipTag = True
                if self.isSubscript(cls):
                    self.writeInstr.append({'tag': 'sub', 'pos': 'start'})
                    self.extraTags.append('sub')
                    skipTag = True
                    
                ## Class change - need to keep the span tag with a different class
                if self.isUnderline(cls):
                    self.appendValue('class', 'x-ck12-underline')
                    skipTag = False
                    omitAttrs = []
                if self.isStrikethrough(cls):
                    self.appendValue('class', 'x-ck12-strikethrough')
                    skipTag = False
                    omitAttrs = []
                text_background_color = self.getCSSPropertyValue(cls, 'background-color')
                text_font_color = self.getCSSPropertyValue(cls, 'color')
                text_class_val = ''
                if text_background_color and self.getColorClass(text_background_color):
                    text_class_val = 'x-ck12-textbgcolor-%s' % (self.getColorClass(text_background_color))
                if text_font_color and self.getColorClass(text_font_color):
                    text_class_val = '%s x-ck12-textcolor-%s' % (text_class_val, self.getColorClass(text_font_color))
                if text_class_val:
                    self.appendValue('class', text_class_val.strip())
                    skipTag = False
                    omitAttrs = []
        
            elif pos == 'end':
                ## Check if this tag is open already
                if not self.isOpen(tag):
                    skipTag = True
            else:
                skipTag = True

        elif tag == 'ol':
            if pos == 'start' :
                self.nestedListCount += 1
                self.listOpened = True
            if self.getValue('class') and pos == 'start':
                self.liProcessed = False
                cls = self.getValue('class').split()
                list_style_type = self.getCSSPropertyValue(cls, 'list-style-type')
                if list_style_type == 'disc' or list_style_type == 'circle' or list_style_type == 'square':
                    # for unordered lists rosetta doesn't support start attribute, remove start attribute for ol lists
                    tag = 'ul'
                    omitAttrs = ['start']
                    self.olConvertedToulCount += 1
                    self.removeUnwantedLITag = True
                elif list_style_type in self.orderListClass.keys() :
                    self.appendValue('class', self.orderListClass[list_style_type])
                    omitAttrs = []
                # As, for ol default list style is decimal number, this is optional check and can be removed - Girish
                else :
                    self.appendValue('class', self.orderListClass['decimal'])
                    omitAttrs = []
                skipTag = False
            elif pos == 'end':
                self.listOpened = False
                ## Check if this tag is open already
                if self.olConvertedToulCount > 0:
                    self.writeInstr.append({'tag': 'ul', 'pos': 'end'})
                    self.listEndTagValue.append({'tag': 'ul', 'pos': 'end'})
                    self.olConvertedToulCount -= 1
                elif self.olConvertedToulCount == 0 and self.isOpen(tag) :
                    self.writeInstr.append({'tag': 'ol', 'pos': 'end'})
                    self.listEndTagValue.append({'tag': 'ol', 'pos': 'end'})
                skipTag = True
            else:
                skipTag = True
        
        elif tag == 'li':
            if self.getValue('class') and pos == 'start' :
                cls = self.getValue('class').split()
                margin_left = ''
                # ckeck for each class applied to current p tag
                for currentClass in cls :
                    if self.getCSSPropertyValue(currentClass, 'margin-left'):
                        margin_left = self.getCSSPropertyValue(cls, 'margin-left')
                        break
                    
                if margin_left :
                    try :
                        margin_left_int = int(re.findall(r'\d+', margin_left)[0])
                        # if current margin-left is greater that previous then nest the ul/ol
                        if margin_left_int > self.previousLIMargin :
                            self.previousLIMargin = margin_left_int
                            if len(self.listEndTagValue) > 0 :
                                endTag = self.listEndTagValue.pop()
                                if  endTag in self.writeInstr :
                                    if self.nestedListCount > 1 :
                                        # remove the last closing ul/ol tag so that current list will be nested inside previous ul/ol
                                        del self.writeInstr[[i for i,x in enumerate(self.writeInstr) if x == endTag][-1]]
                                        self.listEndTagValue.append(endTag)
                                        self.nestedListCount +=1
                                    self.liProcessed = True
                        # if list element is not processed and current margin is less than previous implies end of previous list
                        elif not self.liProcessed and margin_left_int < self.previousLIMargin:
                            if len(self.listEndTagValue) > 0 :
                                endTag = self.listEndTagValue.pop()
                                if  endTag in self.writeInstr :
                                    ii = self.previousLIMargin
                                    #if current margin-left is less than previous margin-left then add closing ul/ol tag 
                                    while ii > margin_left_int :
                                        y = ([i for i,x in enumerate(self.writeInstr) if x == endTag][-1]) + 1
                                        self.writeInstr.insert( y, endTag )
                                        ii -= 36
                                        self.nestedListCount -= 1
                                    self.previousLIMargin = margin_left_int - 1
                                    self.liProcessed = True
                    except Exception, e:
                        log.error("Error processing list elements : %s" % str(e), exc_info=e)
            skipTag = False
            
        elif tag == 'p':
            log.debug("end of p? %s last tag: %s, data: [%s]" % (pos == 'end', self.writeInstr[-1].get('tag'), self.data.strip()))
            # In bug - 9187 - Indentation is applied using margin-left or text-indent attribute, check for same if present,
            # then add class x-ck12-indent to p tag.
            if self.getValue('class') and pos == 'start':
                tempClass = self.getValue('class').split()
                text_class_val = ''
                # ckeck for each class applied to current p tag
                for currentClass in tempClass :
                    if self.getCSSPropertyValue(currentClass, 'margin-left') or self.getCSSPropertyValue(currentClass, 'text-indent') :
                        text_class_val = 'x-ck12-indent'
                if text_class_val :
                    self.appendValue('class', text_class_val.strip())
                    skipTag = False
                    omitAttrs = []
            if pos == 'end' and self.writeInstr[-1].get('tag') == 'img' and not self.data.strip() \
                    and self.writeInstr[-4].get('tag') == 'p' and self.writeInstr[-4].get('pos') == 'start':
                ## p is ending and the last instruction before this was img tag
                ## Create the div - block image
                self.extraTags.append('div')
                attrs = [('class', 'x-ck12-img-postcard x-ck12-nofloat')]
                ## Put the div before the start of p
                self.writeInstr.insert(-4, {'tag': 'div', 'pos': 'start', 'attrs': attrs, 'omitAttrs': ['alt']})

        elif tag == 'img':
            inlineImage = False
            if self.writeInstr[-1].get('tag') != 'div' and self.writeInstr[-1].get('pos') != 'start':
                ## Not a block image - make it inline
                inlineImage = True
                self.writeInstr.append({'tag': 'span', 'pos': 'start', 'attrs': [('class', 'x-ck12-img-inline')], 'omitAttrs':['alt']})
            ## Add comments for authors and license
            self.writeInstr.append({'comment': {'author': ''}})
            self.writeInstr.append({'comment': {'license': ''}})
            ## Create a new resource
            imgFile = self.getValue('src')
            if imgFile and self.persistObjects:
                resourceUri, resourceID = self.createResource(imgFile, 'image')
                self.setValue('src', resourceUri)
            omitAttrs.append('alt')
            self.writeInstr.append({'tag': tag, 'pos': pos, 'attrs': self.attrs, 'omitAttrs': omitAttrs})
            if inlineImage:
                self.writeInstr.append({'tag': 'span', 'pos': 'end'})
            skipTag = True

        elif tag == 'table':
            cls = self.getValue('class')
            if cls:
                cls = cls.split()
                ## Does the table have a border?
                if not self.hasCSSPropertyValue(cls, 'border', '0') \
                        and (self.hasCSSPropertyValue(cls, 'border-collapse', 'collapse') \
                        or self.hasCSSPropertyValue(cls, 'border-collapse', 'separate')):
                    self.setValue('border', '1')
            else:
                self.setValue('border', '0')
            #self.setValue('id', '')
            self.setValue('summary', '')
            self.removeAttr('class')
            self.setValue('class', 'x-ck12-nofloat')
            omitAttrs = ['cellspacing', 'cellpadding']
            log.info("table attributes: %s" % str(self.attrs))

        """
         if any tag other than ul/ol comes and is out of ul/ol tag then close all ol/ul tags 
         this is necessary because if more than one lists are present in document new list
         should not get nest in previous list
        """
        if tag not in ['ol' , 'li'] and not self.listOpened :
            i = self.nestedListCount
            while i > 0 and len(self.listEndTagValue) > 0 :
                self.writeInstr.append(self.listEndTagValue.pop())
                self.previousLIMargin = 0
                i -= 1
                self.nestedListCount -= 1
                self.liProcessed = True
            self.nestedListCount = 0
            self.listEndTagValue = []
            
        if pos == 'end':
            ## Write the data first
            self.writeInstr.append({'data': self.data.strip()})
            #print "Wrote data for %s" % xpath
        #print "skipTag: %s for tag: %s" % (skipTag, xpath)
        if not skipTag:
            self.writeInstr.append({'tag': tag, 'pos': pos, 'attrs': self.attrs, 'omitAttrs': omitAttrs})

        if pos == 'end':
            ## If we added any extra tags, close them
            for i in range(0, len(self.extraTags)):
                extraTag = self.extraTags.pop()
                #print "Closing %s" % extraTag
                self.writeInstr.append({'tag': extraTag, 'pos': 'end'})

    def writeComments(self, dict):
        if dict:
            for k, v in dict.iteritems():
                self.fileStr += '\n<!-- @@%s="%s" -->' % (k, v)

    def writeOutput(self):
        for instr in self.writeInstr:
            if instr.get('tag'):
                omitAttrs = instr.get('omitAttrs')
                if omitAttrs is None:
                    omitAttrs = ['class']
                self.writeTag(instr.get('tag'), instr.get('pos'), instr.get('data'), instr.get('attrs'), omitAttrs=omitAttrs)
            elif instr.get('comment'):
                self.writeComments(instr.get('comment'))
            elif instr.get('data'):
                self.fileStr += instr.get('data').strip()
        self.fileStr = h.transform_to_xhtml(self.fileStr, cleanHtml=True)

    def writeTag(self, tag, pos, data=None, attrs=None, omitAttrs=['class']):
        log.info("Writing %s, %s, %s" % (tag, pos, attrs))
        #print "Writing %s, %s, %s" % (tag, pos, attrs)
        if pos == 'start' or pos == 'startend':
            self.fileStr += '\n<%s' % tag
            if attrs:
                for a, v in attrs:
                    if omitAttrs and a in omitAttrs:
                        continue
                    self.fileStr += ' %s="%s"' % (a,v)
            if pos == 'startend':
                self.fileStr += '/>'
            else:
                self.fileStr += '>'
        else:
            if data:
                self.fileStr += data.strip()
            self.fileStr += '</%s>\n' % tag


    def close(self):
        '''
            Close the parser and create the output file
        '''
        HTMLParser.close(self)

        self.writeOutput()

        if self.removeUnwantedLITag: 
            self.removeUnwantedLITags()
            self.removeUnwantedLITag = False

        converter = CK12RosettaXHTML()
        self.fileStr = h.safe_decode(converter.to_rosetta_xhtml(self.fileStr))

        log.debug("Type: self.fileStr: %s" % type(self.fileStr).__name__)
        log.debug( self.fileStr )
        f = codecs.open(self.destFile, "wb", encoding='utf-8')
        f.write(self.fileStr)
        f.close()
        log.info("Wrote file: %s" % self.destFile)

    def removeUnwantedLITags(self):
        # for ul unwanted li tags get's added by parser, remove them to get list view properly on display
        try :
            li_re = re.compile('</li>\s+<li\s+class=".*?">', re.DOTALL)
            li_elements = li_re.findall(self.fileStr)
            for li_element in li_elements:
                self.fileStr = self.fileStr.replace(li_element, '')
        except Exception, e :
            log.error("Error removing unwanted LI tags : %s" % str(e), exc_info=e)
    
    def createResource(self, image_path, type, desc=None, authors=None, license=None):
        '''
            Create a new resource for given type and using given file or url
        '''
        if not self.persistObjects:
            return False
        resourceDict = {}
        imgFile = None
        path, name = os.path.split(image_path)
        if image_path.lower().startswith('http'):
            resourceDict['uri'] = image_path
            resourceDict['uriOnly'] = True
            resourceDict['isExternal'] = True 
        else:
            content = self.getFileFromZip(image_path, 'equals')
            if not content:
                raise Exception((_(u"Could not get image: %(image_path)s in zip")  % {"image_path":image_path}).encode("utf-8"))
            imgFile = NamedTemporaryFile(suffix=name, delete=False)
            imgFile.write(content)
            imgFile.close()
            resourceDict['uri'] = open(imgFile.name, "rb")
            resourceDict['uriOnly'] = False
            resourceDict['isExternal'] = False
        resourceDict['resourceType'] = api.getResourceTypeByName(name=type)
        resourceDict['name'] = name
        resourceDict['description'] = desc
        language = api.getLanguageByName(name='English')
        resourceDict['languageID'] = language.id
        resourceDict['ownerID'] = self.userID 
        resourceDict['creationTime'] = datetime.now()
        resourceDict['authors'] = authors
        resourceDict['license'] = license
        
        if type == 'cover video' or type == 'video':
           resourceDict['uriOnly'] = True
           resourceDict['isExternal'] = True
        
        log.info("Params: "+ str(resourceDict))

        resourceRevision = api.createResource(resourceDict=resourceDict, commit=True)
        resourceID = resourceRevision.resource.id
        #resourceUri = resourceRevision.resource.getUri()
        ## Use the perma url
        resourceUri = resourceRevision.resource.getPermaUri(fullUrl=True)
        ## Save the resource created with the perma - we will later tie this resource to an artifact
        self.resources[resourceUri] = resourceID

        if imgFile:
            os.remove(imgFile.name)
        return (resourceUri, resourceID)

    def saveArtifacts(self, title, artifactHandle, type='lesson', artifact_xhtml=None, artifact_desc=None, encodedID=None, updateExisting=False, authors=[]):
        '''
            Create a new artifacts of type lesson or concept
            If the type is lesson, the input is expected to be in a
            certain format and will be split into lesson and underlying 
            concept
        '''
        if not self.persistObjects:
            return False
        log.info("Getting contents: %s" % self.destFile)
        if not artifact_xhtml:
            xhtml = h.getContents(self.destFile)
        else:
            xhtml = artifact_xhtml
        log.info('XHTML: %s' % xhtml)
        xhtml_body_re = re.compile('(<body>.*?</body>)', re.DOTALL)
        xhtml_body = xhtml_body_re.findall(xhtml)
        for each_xhtml in xhtml_body:
            if each_xhtml.replace('<body>','').replace('</body>','').strip():
                xhtml = each_xhtml
                break
        
        # Remove colspan & rowspan as they are not supported in rosetta
        col_pat = re.compile('colspan.*?=.*?["\'].*?["\']', re.IGNORECASE)
        row_pat = re.compile('rowspan.*?=.*?["\'].*?["\']', re.IGNORECASE)
        xhtml, col_count = re.subn(col_pat, '', xhtml)
        xhtml, row_count = re.subn(row_pat, '', xhtml)
        log.info("Removed %s, Colspans & %s, Rowspans:" % (col_count, row_count))        

        log.info("Got xhtml length: %d" % len(xhtml))
        if not title:
            title = self.getTitleFromContent(xhtml)
            artifactHandle = title.replace(' ', '-').replace('/','')
        if not artifact_desc:
            desc = ''
        else:
            desc = artifact_desc
        ## Split xhtml into lesson and concept
        if type == 'lesson':
            lesson_enc_id = None
            concept_enc_id = None
            if encodedID:
                lesson_enc_id = encodedID
                concept_enc_id = encodedID.replace('.L.', '.C.')
            children = []
            lesson_xhtml = concept_xhtml = None
            if api.isLessonConceptSplitEnabled:
                try:
                    lesson_xhtml, concept_xhtml = h.splitLessonXhtml(xhtml, splitOn='h2')
                except Exception, e:
                    log.error("Error splitting concept: %s" % str(e), exc_info=e)
                    concept_xhtml = xhtml
                    lesson_xhtml = h.getLessonSkeleton()
            else:
                conceptStartXHTML = "<!-- Begin inserted XHTML \[CONCEPT: .*\] -->"
                conceptEndXHTML = "<!-- End inserted XHTML \[CONCEPT: .*\] -->"
                conceptStartXHTML = re.search(conceptStartXHTML, xhtml)
                conceptEndXHTML = re.search(conceptEndXHTML, xhtml)
                if conceptStartXHTML and conceptEndXHTML:
                    xhtml = xhtml[:conceptStartXHTML.start()]+xhtml[conceptStartXHTML.end():conceptEndXHTML.start()]+xhtml[conceptEndXHTML.end():]
       
                lesson_xhtml=xhtml
                concept_xhtml=None                
            try:
                if concept_xhtml:
                    conceptID, conceptRevID, newArtifact = au.saveArtifact(self.userID, title, artifactHandle, concept_xhtml, 'concept', encodedID=concept_enc_id, description=desc, updateExisting=updateExisting, authors=authors)
                    children = [conceptRevID]
                if lesson_xhtml:
                    lessonID, lessonRevID,newArtifact = au.saveArtifact(self.userID, title, artifactHandle, lesson_xhtml, 'lesson', encodedID=lesson_enc_id, children=children, description=desc, updateExisting=updateExisting, authors=authors)
                    return lessonID
            except Exception as e:
                raise e
        else:
            try:
                conceptID, conceptRevID, newArtifact = au.saveArtifact(self.userID, title, artifactHandle, xhtml, type, encodedID=encodedID, description=desc, updateExisting=updateExisting, authors=authors)
            except Exception as e:
                raise e
            return conceptID

    def getTitleFromContent(self, xhtml):
        title_re = re.compile('<title>(.*?)</title>', re.DOTALL)
        title_text = title_re.findall(xhtml)
        if title_text:
            title_text = title_text[0].strip()
        else:
            title_text = ''
        return title_text

if __name__ == '__main__':
    from flx.lib.gdt.gdt2xhtml import GDT2XhtmlParser
    parser = GDT2XhtmlParser(1, '/tmp/gdt/g_test1.zip', '/tmp/gdt/g_test.xhtml')
    parser.persistObjects = False
    parser.start()
    parser.close()
