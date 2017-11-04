"""Helper functions

Consists of functions to typically be used within templates, but also
available to Controllers. This module is available to templates as 'h'.
"""
# Import helpers as desired, or define your own, ie:
#from webhelpers.html.tags import checkbox, password
from pylons.i18n.translation import _
import os
import logging
from BeautifulSoup import BeautifulStoneSoup, BeautifulSoup, Tag
from pylons import config
from pylons import url as _url
from tidylib import tidy_document
import urllib, urllib2, socket
import traceback
import time
import re
import stat
from tempfile import NamedTemporaryFile, TemporaryFile
import codecs
from beaker.cache import CacheManager
from beaker.util import parse_cache_config_options
from urllib import quote, unquote
try:
    from PIL import Image, ImageFont, ImageDraw
except:
    import Image, ImageFont, ImageDraw
from flx.lib.xmlwritercompat import encode_entity
import htmlentitydefs
import json
import shutil, hashlib
from Crypto.Cipher import Blowfish
import HTMLParser
import pytz
from datetime import datetime, timedelta, date
from bson.objectid import ObjectId
import requests
import xmltodict
import ast
import simplejson

from flx.lib.fc import fcclient as fc
from flx.lib.localtime import Local

## Following imports are used in templates - DO NOT REMOVE

log = logging.getLogger(__name__)

level1BucketSize = 1024*1024
level2BucketSize = 1024

dataDir = None
apps = None

EMBEDED_PROVIDERS = {               #[<list of regex for URL match> , <oembed endpoint>, <supported format>]
                    'youtube.com': ['youtube.com/.+','http://www.youtube.com/oembed','json'],
                    'www.schooltube.com': ['http://www.schooltube.com/video/.+','http://www.schooltube.com/oembed.xml','xml'],
                    'vimeo.com': ['http://vimeo.com/.+','http://vimeo.com/api/oembed.xml','xml'],
                    'www.ted.com': ['http://www.ted.com/talks/.+','http://www.ted.com/talks/oembed.xml','xml'],
                    'www.scribd.com': ['http://www.scribd.com/doc/.+','http://www.scribd.com/services/oembed/','json'],
                    'www.slideshare.net': ['http://www.slideshare.net/.+/.+','http://www.slideshare.net/api/oembed/2','json'],
                    'www.thinglink.com': ['www.thinglink.com/scene/+','https://www.thinglink.com/api/oembed','json'],
                    'www.teachertube.com': ['http://www.teachertube.com/video/.+','http://api.embed.ly/1/oembed','json']
                    }

ALLOWED_ATTACHMENT_EXTENSIONS = [
    '.doc', '.docx', '.odt', '.dot', '.dotx', '.txt', '.ott',
    '.ppt', '.pptx', '.odp', '.otp', '.pps', '.pot', '.potx', '.ppsx', '.swf',
    '.xls', '.xlsx', '.ods', '.xlt', '.xltx', '.ots',
    '.zip', '.pdf', '.tar', '.tgz', '.gz',
    '.epub', '.mobi',
    '.key', '.keynote',
    '.numbers', '.pages',
    '.png', '.jpg', '.jpeg', '.bmp',
    '.cdf', '.flv',
    '.mp4', '.mp3',
    '.html'
    ]

##
## Exceptions
##
class InvalidRosettaException(Exception):
    """
        Invalid Rosetta syntax
    """
    pass

class InvalidContentException(Exception):
    """
        Invalid Rosetta content
    """
    pass

class InvalidImageException(Exception):
    """
        Invalid image endpoints in the HTML
    """
    pass

class MaliciousFileException(Exception):
    """
        Malicious File content
    """
    pass

def num_compare(a, b):
    return int(a) - int(b)

def getBucketPath(relPath, id=None):
    """
        Use a 2-level bucket for allowing a huge amount of ids.

        relPath     The relative path to form the VCS path.
        id          The member identifer. If not given, then it's embedded in
                    the relPath as 'id/...'. If not, then nothing will be done.

        It will return a path in the form of:

            <level 1 bucket number>/<level 2 bucket number>/id/fileName
    """
    if id is None:
        id = relPath.split(os.path.sep)[0]
        if id == relPath:
            return relPath
        #
        #  The remaining part without the id.
        #
        dirList = relPath.split(os.path.sep)[1:]
        relPath = ''
        for dir in dirList:
            relPath = os.path.join(relPath, dir)

    if type(id) is str:
        id = int(id)

    level1Bucket = id / level1BucketSize
    level2Bucket = (id - level1Bucket*level1BucketSize) / level2BucketSize
    path = '%s/%s/%s/%s' % (level1Bucket, level2Bucket, id, relPath)
    log.info("Bucket path: %s" % path)
    return path

def makedirs(path, startFromRoot=False):
    """
        Add a new path with one or more non-existent directories.
    """
    dirPath = ''
    if startFromRoot:
        dirPath = '/'
    path = os.path.dirname(path)
    dirList = path.split(os.path.sep)
    dirCreated = False
    for dir in dirList:
        if dir == '':
            continue
        dirPath = os.path.join(dirPath, dir)
        if not os.path.exists(dirPath):
            os.mkdir(dirPath, 0755)
            dirCreated = True

    return dirCreated

def getDataPath(relPath, id=None):
    """
        Return the data directory together with bucket path.
        Also create non-existing directories.
    """
    global dataDir
    if dataDir is None:
        dataDir = config.get('data_dir')
    path = os.path.join(dataDir, getBucketPath(relPath, id=id))
    makedirs(path)
    return path

def getRepositoryDataPath(id, resourceType, dsSuffix=''):
    fcclient = fc.FCClient()
    return fcclient.getResourceLink(id=id, resourceType=resourceType, dsSuffix=dsSuffix)

def saveUploaded(uri, file):
    """
        Save the uploaded contents to the given file.
    """
    shutil.copyfileobj(uri.file, file)
    uri.file.close()

def saveUploadedToTemp(uri):
    """
        Save the uploaded contents to a temporary file
    """
    import shutil
    tempfd = NamedTemporaryFile()
    tempFile = tempfd.name
    tempfd.close()
    tempFilefd = open(tempFile, 'w')
    shutil.copyfileobj(uri.file, tempFilefd)
    tempFilefd.close()
    uri.file.seek(0, 0)
    #uri.file.close()
    return tempFile

def getUploadedContents(uri):
    """
        Get the uploaded contents.
    """
    file = TemporaryFile(suffix=os.path.basename(uri.filename))
    try:
        saveUploaded(uri, file)
        return file.read()
    finally:
        try:
            file.close()
        except Exception:
            pass

def getContents(path):
    """
        Read the contents from the file identified by path.
    """
    file = open(path, 'rb')
    try:
        return file.read()
    finally:
        try:
            file.close()
        except Exception:
            pass

def saveContents(path, contents):
    """
        Save the given contents to the file identified by path.
    """
    file = codecs.open(path, 'wb', encoding='utf-8')
    try:
        log.info("Type of contents: %s" % type(contents).__str__)
        if not isinstance(contents, unicode):
            contents = unicode(contents, 'utf-8')
        file.write(contents)
    finally:
        try:
            file.close()
            os.chmod(path, stat.S_IRUSR | stat.S_IWUSR | stat.S_IRGRP | stat.S_IWGRP | stat.S_IROTH | stat.S_IWOTH)
        except Exception:
            pass

def saveUploadedFile(request, fileParam, dir=None, allowedExtenstions=None, duplicateFile=False, userID=None):
    uploadedFile = request.POST[fileParam]

    file_name = safe_encode(uploadedFile.filename)
    #Bug - 12362 - For XDT requests - On windows instance subproces.Popen is not supported with unicode characters,
    #create a file with some random name and use this file to process the docx importing
    if duplicateFile:
        import random
        random_string = hashlib.md5(random.random().__str__()).hexdigest()
        if userID:
            file_name = "_%s_%s_%s"%(userID,random_string,file_name)
            tmp_file_name = "_%s_%s_%s" %(userID,random_string,str(allowedExtenstions[0]))
        else:
            tmp_file_name = "_%s_%s" %(random_string,str(allowedExtenstions[0]))

    log.info('File %s [%d bytes]' % (file_name.decode("utf-8"), len(uploadedFile.value)))
    if allowedExtenstions:
        fn = file_name.lower()
        matched = False
        for ext in allowedExtenstions:
            if fn.endswith(ext):
                matched = True
                break
        if not matched:
            raise Exception('Invalid file name extension. Allowed extensions are: %s' % ','.join(allowedExtenstions))
    try:
        ## save the file to temp location
        tfile = NamedTemporaryFile(suffix=os.path.basename(file_name), delete=False, dir=dir)
        saveUploaded(uploadedFile, tfile)
        tfile.close()
        # if xdt request then return the temp_tfile name i.e. file name with some random string
        if duplicateFile:
            temp_tfile = NamedTemporaryFile(suffix=os.path.basename(tmp_file_name), delete=False, dir=dir)
            tfile = open(tfile.name, "r")
            shutil.copyfileobj(tfile, temp_tfile)
            tfile.close()
            temp_tfile.close()
            os.chmod(temp_tfile.name, stat.S_IRUSR | stat.S_IWUSR | stat.S_IRGRP | stat.S_IWGRP | stat.S_IROTH | stat.S_IWOTH)
            return temp_tfile.name

        os.chmod(tfile.name, stat.S_IRUSR | stat.S_IWUSR | stat.S_IRGRP | stat.S_IWGRP | stat.S_IROTH | stat.S_IWOTH)
        return safe_decode(tfile.name)
    except Exception, e:
        log.error('Error saving uploaded file to disk: Exception[%s]' % str(e))
        raise e

def saveFileToDirectory(src, dir):
    try:
        srcfile = open(src, "rb")
        ## save the file to temp location
        tfile = NamedTemporaryFile(suffix=os.path.basename(src), delete=False, dir=dir)
        shutil.copyfileobj(srcfile, tfile)
        srcfile.close()
        tfile.close()
        os.chmod(tfile.name, stat.S_IRUSR | stat.S_IWUSR | stat.S_IRGRP | stat.S_IWGRP | stat.S_IROTH | stat.S_IWOTH)
        return tfile.name
    except Exception, e:
        log.error('Error saving uploaded file to disk: Exception[%s]' % str(e))
        raise e

entity_re = re.compile(r'&(\w+);')
schemaOrg_re = re.compile('(<div itemprop="video".*?</div>)', re.DOTALL)
meta_re = re.compile('(<meta[ ]*itemprop=".*?"[ ]*content=".*?"[ ]*/>)', re.DOTALL)
meta_comment_re = re.compile('(<!--[ ]*<meta[ ]*itemprop=".*?"[ ]*content=".*?"[ ]*/>[ ]*-->)', re.DOTALL)
htmlParser = HTMLParser.HTMLParser()

def _unescape_comment(matchobj):
    return htmlParser.unescape(matchobj.group(0))

def _getAttributeFromElement(element, attribute):
    attribute_re = re.compile(r'%s[\s]*=[\s]*"([^"]*)"' %(attribute), re.DOTALL)
    matchObj = attribute_re.search(element)
    return matchObj.groups()[0] if matchObj else ''

def transform_to_xhtml(html, cleanHtml=False, validateRosetta=False, addIDs=True, demoteH2=False, validateImages=False):
    if not html:
        html = ''
    for eachSchemaOrgDiv in schemaOrg_re.findall(html):
        newSchemaOrgDiv = eachSchemaOrgDiv
        for eachMeta in meta_re.findall(eachSchemaOrgDiv):
            newSchemaOrgDiv = newSchemaOrgDiv.replace(eachMeta, '<!-- %s -->' %(eachMeta.replace('-', '\-')))
        html = html.replace(eachSchemaOrgDiv, newSchemaOrgDiv)
    html = html.replace('></span>&nbsp;</p>', '>&nbsp;</span></p>')
    html = html.replace('></span>&nbsp;&nbsp;</p>', '>&nbsp;&nbsp;</span></p>')

    option = {"output-xhtml":1, "clean":int(cleanHtml), "tidy-mark":0,
            "char-encoding":"utf8", "preserve-entities":1,
            "indent":0}

    def fixEntities(m):
        """
            Replace html entities with xml entities
        """
        if m.group(1):
            entity = m.group(1)
            if htmlentitydefs.name2codepoint.has_key(entity):
                ret = '&#%s;' %  htmlentitydefs.name2codepoint[entity]
                log.debug("Replacing %s with %s" % (entity, ret))
                return ret
        return m.group(0)

    document, errors = tidy_document(html, option)
    # \n<strong>\n test\n</strong>\n will become <strong> test</strong>
    tags = ['strong', 'em', 'b', 'i']
    pat_template = '[\n]*(<$name$>)[\n]*|[\n]*(</$name$>)[\n]*'
    for tag in tags:
        tmp_template = pat_template.replace('$name$', tag)
        document = re.sub(tmp_template, lambda x:x.group(1) if x.group(1) else x.group(2), document)

    if errors:
        log.debug("Errors from tidy: %s" % str(errors))
    ## Replace html entities with xml entities
    document = entity_re.sub(fixEntities, document)
    ret = fix_tidy_issues(document, demoteH2=demoteH2)
    ret = ret.replace('/*<![CDATA[*/', '')
    ret = ret.replace('/*]]>*/', '')

    blockelements = ['ul', 'ol', 'dl', 'table', 'div', 'pre', 'blockquote', 'p', 'h2', 'h3', 'h4']
    for eachBlockElement in blockelements:
        endTag_re = re.compile(r'([ ]*</%s>(.*?)[ ]*$)' %(eachBlockElement), re.M)
        for eachString in endTag_re.findall(ret):
            if len(eachString[1].strip()) > 0:
                #log.warn('ulolTail %s' %(eachString[1]))
                fullString = eachString[0].replace(eachString[1], '<p>' + eachString[1] + '</p>')
                ret = ret.replace(eachString[0], fullString)
    # Replace all the comments with some hash codes
    comment_pat = re.compile('<!--(.*?)-->', re.M|re.DOTALL)
    comments = comment_pat.findall(ret)
    for i, comment in enumerate(comments):
        tmp_comment = '<!--%s-->' % comment
        ret = ret.replace(tmp_comment, '##--%s--##' % i, 1)
    # Enclose the image and span elements present directly under the body tag with P tag
    soup = BeautifulSoup(ret)
    elms = soup.findAll(['img', 'span'])
    for elm in elms:
        if elm.parent.name == 'body':
            # Prepare the empty p tag
            tag = Tag(soup, 'p', [])
            # Get the existing img/span element and replace it with the enclosing p tag.
            clone_tag = BeautifulSoup(str(elm))
            real_tag = clone_tag.first()
            tag.insert(0, real_tag)
            elm.replaceWith(tag)

    texts = soup.body.findAll(text=True)
    for txt in texts:
        if txt.strip() and txt.parent.name == 'body':
            # Enclose text in P tag.
            tag = Tag(soup, 'p', [])
            new_text = txt.strip()
            tag.insert(0, new_text)
            txt.replaceWith(tag)

    tags = soup.body.findAll(True)
    for tag in tags:
        for attrName in ['class', 'id']:
            if tag.get(attrName):
                attrVals = tag.get(attrName).split(' ')
                attrVals2keep = []
                for i in range(0, len(attrVals)):
                    if attrVals[i].startswith('x-ck12-'):
                        attrVals2keep.append(attrVals[i])
                    else:
                        log.debug("Removing %s" % attrVals[i])
                attrVals = " ".join(attrVals2keep)
                if attrVals.strip():
                    tag[attrName] = attrVals
                else:
                    log.debug("Removing empty attribute %s for %s" % (attrName, tag.name))
                    del tag[attrName]

    ret = unicode(soup)
    # Replace all the hash codes with the actual comments.
    for i, comment in enumerate(comments):
        tmp_comment = '<!--%s-->' % comment
        ret = ret.replace('##--%s--##' % i, tmp_comment, 1)

    if addIDs:
        soup = BeautifulSoup(ret)
        annotatableElements = ['p', 'ul', 'ol', 'dl', 'table', 'div', 'pre', 'blockquote']
        elements = {}
        for eachAnnotatableElement in annotatableElements:
            elements[eachAnnotatableElement] = []
            for eachElement in soup.findAll(eachAnnotatableElement):
                charsToStrip = [' ', '\n', '\t', '.', '-', '_', ';', ':', '/', '\\', '=', '~', '!', '@', '#', '%', '(', ')']
                if eachElement.text:
                    text = safe_encode(eachElement.text.strip())
                    for eachCharToStrip in charsToStrip:
                        text = text.replace(eachCharToStrip, '')
                    md5 = hashlib.md5(text).hexdigest()
                    elements[eachAnnotatableElement].append(genURLSafeBase64Encode(md5) + '-' + getRandomString(3))
                else:
                    elements[eachAnnotatableElement].append('x-ck12-' + getRandomString(3))

        for eachAnnotatableElement in annotatableElements:
            ids = elements[eachAnnotatableElement]
            if not ids:
                continue
            #element_re = re.compile(r'<%s[\s]?[^>]*>' %(eachAnnotatableElement), re.DOTALL)
            element_re = re.compile(r'(<%s([\s]*|[\s]+[^>]*)>)' %(eachAnnotatableElement), re.DOTALL)
            i = 0
            for eachElement in element_re.findall(ret):
                if i >= len(ids):
                    break
                eachElement = eachElement[0]
                if eachAnnotatableElement == 'div' and _getAttributeFromElement(eachElement, 'class').startswith('x-ck12-data'):
                    i = i + 1
                    continue
                if _getAttributeFromElement(eachElement, 'id'):
                    i = i + 1
                    continue
                newElement = eachElement.replace('<%s' %(eachAnnotatableElement), '<%s id="%s"' %(eachAnnotatableElement, ids[i]), 1)
                ret = ret.replace(eachElement, newElement, 1)
                i = i + 1

    ret = ret.replace('&squot;', "")
    if validateRosetta:
        validateRosettaStone(ret, failOnError=True)
    if validateImages:
        ret = validateImageEndpoints(ret)
    return ret

def validateImageEndpoints(html):
    """
        Validate images in html if they have got any absolute URLs.
    """
    full_img_re = re.compile('<img.*?>', re.DOTALL)
    img_tags = full_img_re.findall(html)
    src_re = re.compile('(src="(.*?)")', re.DOTALL)
    class_re = re.compile('class="(.*?)"', re.DOTALL)
    math_class_re = re.compile('x-ck12-.*?math',re.DOTALL)
    absolute_images = { 'math': [], 'other': [] }
    if img_tags:
        for each_img_tag in img_tags:
            try:
                is_math = False
                img_src = src_re.findall(each_img_tag)
                if img_src[0] and img_src[0][1] and (img_src[0][1].startswith('http:') or img_src[0][1].startswith('https:')):
                    resource_class = class_re.findall(each_img_tag)
                    if resource_class:
                        resource_class = resource_class[0]
                        if math_class_re.search(resource_class.lower()):
                            is_math = True
                    if is_math:
                        absolute_images['math'].append(img_src[0][1])
                    else:
                        absolute_images['other'].append(img_src[0][1])
            except Exception as e:
                continue
    if any([v for v in absolute_images['math']]):
        log.error('XHTML contains absolute images: %s'% absolute_images)
        raise InvalidImageException(safe_encode(_(u'Images validation failed: [%(absolute_images)s]')  % {"absolute_images":absolute_images}))

    ## Bug #33112 - we allow non-math images with absolute paths. But we make them protocol-relative.
    ## Only replace if non-math images exist with absolute path.
    if absolute_images['other']:
        abs_img_regex = re.compile(r'(<img [^>]*)src="http[s]?://')
        html = abs_img_regex.sub(r'\1src="//', html)
    return html

def validateRosettaStone(html, failOnError=True):
    """
        ONLY validate the given xhtml
        DO NOT modify it any way.
    """
    global config
    if not config.get('flx_home'):
        config = load_pylons_config()

    from flx.lib.rosetta import XhtmlValidator
    xsdPath = os.path.join(config.get('flx_home'), 'flx/templates/flx/rosetta/2_0.xsd')
    lxml_use_filename = str(config.get('lxml_use_filename')).lower() == 'true'
    log.debug("Going to instantiate XhtmlValidator")
    xv = XhtmlValidator(xsdPath, useFilename=lxml_use_filename)
    log.debug("Done instantiating XhtmlValidator")
    errorsToIgnore = {
            "ignore-data-attr": re.compile(r"The attribute 'data-[a-zA-Z0-9-]*' is not allowed.", re.I),
            }
    try:
        if not xv.validate(html):
            if len(xv.errors) > 0 and failOnError:
                fatalErrors = []
                for err in xv.errors:
                    log.debug("Error: [%s]" % str(err))
                    ignore = False
                    for k in errorsToIgnore.keys():
                        if errorsToIgnore[k].search(err):
                            log.debug("Ignoring error due to [%s]" % k)
                            ignore = True
                            break
                    if not ignore:
                        fatalErrors.append(err)
                if fatalErrors:
                    raise InvalidContentException(safe_encode(_(u'Rosetta validation failed: [%(fatalErrors)s]')  % {"fatalErrors":fatalErrors}))
    except InvalidContentException as ice:
        log.warn("Error validating: %s" % str(ice), exc_info=ice)
        log.warn("XHTML with errors: %s" % html)
        raise ice
    except Exception as e:
        log.warn("Error validating: %s" % str(e), exc_info=e)
        raise e

# tidy has a few bugs, and it hasn't been maintained in the past few years.
# Compensate for all the problems here.
def fix_tidy_issues(buffer, demoteH2=False):
    # 1. tidy remove double backslash from image alt tag.
    # This makes math notation invalid.
    img_pattern_re = re.compile("<img.*?>", re.DOTALL)
    img_patterns = img_pattern_re.findall(buffer)
    class_re = re.compile('class="(.*?)"',re.DOTALL)
    src_re = re.compile('src="(.*?)"',re.DOTALL)
    alt_re = re.compile('alt="(.*?)"',re.DOTALL)
    for eachImgPattern in img_patterns:
        try:
            if not class_re.findall(eachImgPattern):
                continue
            mathClass = class_re.findall(eachImgPattern)[0]
            srcText = src_re.findall(eachImgPattern)[0]
            index = None
            if mathClass == 'x-ck12-math':
                index = srcText.find('inline') + 7
            elif mathClass == 'x-ck12-block-math':
                index = srcText.find('block') + 6
            if not index:
                continue
            formula = unquote(srcText[index:]).encode('ascii', 'ignore').replace('\n', '')
            altText = alt_re.findall(eachImgPattern)[0]
            encoded_formula = encode_entity(formula)
            newImgPattern = eachImgPattern.replace('alt="%s"'%altText,'alt="%s"'%encoded_formula)
            buffer = buffer.replace(eachImgPattern, newImgPattern, 1)
        except Exception as e:
            log.error('Fix_tidy_issues: %s' %(e.__str__()), exc_info=e)
            continue
    full_img_re = re.compile('<img.*?longdesc="(.*?)".*?>', re.DOTALL)
    img_tags = full_img_re.findall(buffer)
    for each_img_tag in img_tags:
        try:
            longdesc = each_img_tag
            new_img_tag = each_img_tag.replace(longdesc, quote(unquote(longdesc)))
            buffer = buffer.replace(each_img_tag, new_img_tag)
        except Exception as e:
            continue
    ## Remove empty width="" parameters
    empty_width_re = re.compile(r'(\s)width=""', re.I)
    buffer = empty_width_re.sub(r'\1', buffer)

    ## Remove empty height="" parameters
    empty_height_re = re.compile(r'(\s)height=""', re.I)
    buffer = empty_height_re.sub(r'\1', buffer)

    ## Upgrade h7 and higher to h6
    h67_re = re.compile(r'<(/?)h[789]([^<>]*)>', re.I)
    buffer = h67_re.sub(r'<\1h6\2>', buffer)

    if demoteH2:
        buffer = demoteH2s(buffer)

    ## Remove start attribute from divs
    div_style_re = re.compile('(<div style="(.*?)" start="(.*?)">)')
    buffer = div_style_re.sub(r'<div style="\2">',  buffer)

    ## Uncomment the meta tag in schema.org divs
    for eachSchemaOrgDiv in schemaOrg_re.findall(buffer):
        newSchemaOrgDiv = eachSchemaOrgDiv
        for eachMeta in meta_comment_re.findall(eachSchemaOrgDiv):
            newSchemaOrgDiv = newSchemaOrgDiv.replace(eachMeta, eachMeta.replace('\-', '-').replace('<!--', '').replace('-->', ''))
        buffer = buffer.replace(eachSchemaOrgDiv, newSchemaOrgDiv)

    return safe_decode(buffer)

def demoteH2s(xhtml):
    lxhtml = xhtml.lower()
    if '<h1 ' in lxhtml or '<h1>' in lxhtml:
        demoteLevel = 2
    elif '<h2 ' in lxhtml or '<h2>' in lxhtml:
        demoteLevel = 1
    else:
        return xhtml

    def replaceHeaders(m):
        level = int(m.group(2)) + demoteLevel
        if level > 6:
            level = 6
        log.info("New Level: %d" % level)
        return '<' + m.group(1) + 'h' + str(level) + m.group(3) + '>'

    h_re = re.compile(r'<(/?)h([123456])([^<>]*)>', re.I)
    xhtml = h_re.sub(replaceHeaders, xhtml)
    return xhtml

def doPost(request, controller, action, payload={}):
    """
        Post payload to a controller url - also copy certain headers from the request (such as cookies etc.)
    """
    try:
        hostUrl = request.host_url
        urlReq = hostUrl + url(controller=controller, action=action)
        postData = urllib.urlencode(payload)
        log.info("Posting to url: %s with payload: %s" % (url, postData))
        r = urllib2.Request(url=urlReq, data=postData)
        for header in ['Cookie', 'User-Agent']:
            if request.headers.has_key(header):
                r.add_header(header, request.headers[header])
        response = urllib2.urlopen(r)
        return response.read()
    except Exception, e:
        log.error("Error running doPost: %s" % str(e))
        log.error(traceback.format_exc())

def rebuildMathCache(artifactID=None, userID=None):
    """
        Rebuild math cache - asynchronously
        If an artifactID is given, the cache is built just for that artifact
        otherwise for all artifacts in the database.
    """
    from flx.controllers.celerytasks import mathcache
    cache_maker = mathcache.MathCacheTask()
    task = cache_maker.delay(artifactID=artifactID, user=userID)
    return task.task_id

def rebuildIndex(user=None):
    """
        Rebuild index entirely - asynchronously
    """
    log.info("Rebuilding entire search index ...")
    from flx.controllers.celerytasks import search
    createIndex = search.CreateIndex()
    task = createIndex.delay(metadataOnly=False, loglevel='INFO',user=user)
    return task.task_id

def reindexArtifacts(artifactIds, user=None, wait=False, recursive=False, optimize=False, autoSplit=100, force=False):
    """
        Re-index a given list of artifactIds - asynchronously
    """
    log.info("Reindexing artifacts: %s, wait: %s" % (artifactIds, str(wait)))
    task_id = None
    result = None
    from flx.controllers.celerytasks import search
    if artifactIds:
        if autoSplit > 0:
            aIDLists = [artifactIds[i:i+autoSplit] for i in range(0, len(artifactIds), autoSplit)]
        else:
            aIDLists = [ artifactIds ]
        for aIDList in aIDLists:
            if wait:
                reindex = search.QuickReindex()
                ret = reindex.apply(kwargs={'artifactIDList': aIDList, 'recursive': recursive, 'loglevel': 'INFO', 'user': user, 'optimize': optimize, 'force': force})
                log.info("Called QuickReindex task sync: %s" % ret)
                result = ret.result
            else:
                reindex = search.Reindex()
                task = reindex.delay(artifactIDList=aIDList, recursive=recursive, loglevel='INFO', user=user, force=force)
                task_id = task.task_id
        return result if wait else task_id
    return None

def validateArtifactUrl(wait=True):
    """
        Re-index a given list of artifactIds - asynchronously
    """
    task_id = None
    result = None
    from flx.controllers.celerytasks import artifacturlvalidator
    if wait:
        validator = artifacturlvalidator.ArtifactUrlValidator()
        ret = validator.apply(kwargs={})
        log.info("Called ArtifactUrlValidator task sync: %s" % ret)
        result = ret.result
    else:
        reindex = artifacturlvalidator.ArtifactUrlValidator()
        task = reindex.delay()
        task_id = task.task_id
    return result if wait else task_id

def processInstantNotifications(eventIDs, notificationIDs=None, user=None, noWait=False, session=None):
    """
        Process any instance notifications for this event
    """
    from flx.controllers.celerytasks import notifier
    log.info("eventIDs: %s, notificationIDs: %s" % (eventIDs, notificationIDs))
    if eventIDs:
        kwargs = dict(session=session)
        if noWait:
            log.info("No wait: %s, processing notification right away." % str(noWait))
            n = notifier.QuickEmailNotifierTask(**kwargs)
            ret = n.apply(kwargs={'eventIDs': eventIDs, 'notificationIDs':notificationIDs, 'user': user, 'loglevel': 'INFO'})
            log.info("Called task: %s" % ret)
            return ret.result
        else:
            n = notifier.EmailNotifierTask(**kwargs)
            t = n.delay(eventIDs=eventIDs, notificationIDs=notificationIDs, loglevel='INFO', user=user)
            return t.task_id
    return None

def __mathjax_replace__(match):
    """
        Helper function for regex substitution. Returns the math expression from ck-12 math match object from RE
    """
    delim = config.get("mathjax_inline_delimiter")
    return delim + match.group(2) + delim

def __mathjax_replace_block__(match):
    """
        Helper function for regex substitution. Returns the math expression from ck-12 math match object from RE
    """
    delim = config.get("mathjax_block_delimiter")
    return delim +'\\begin{align*}'+ match.group(2) +'\\end{align*}'+ delim


def __add_mathjax_header__(ck12_html):
    """
        Making sure mathjax header exist in the html string
    """
    if (ck12_html.rfind("MathJax.js") < 0):
        #header hasn't been added. Adding.
        prefix = config.get("mathjax_prefix_url")
        mathjax_script="""
<!-- CK-12 MathJax Loader script. Do not remove these line -->
<script src="%%MATHJAX_PREFIX%%/MathJax.js">
  MathJax.Hub.Config({
    extensions: ["tex2jax.js","TeX/AMSmath.js", "TeX/AMSsymbol.js"],
    jax: ["input/TeX","output/HTML-CSS"],
    tex2jax: {inlineMath: [["$","$"]]}
  });
</script>"""

        header = mathjax_script.replace("%%MATHJAX_PREFIX%%", prefix)
        return ck12_html.replace("</head>", header + "</head>")

def replace_math(ck12_html):
    """
        Replaces occurrences of ck12 image objects in xhtml string with the equivalent mathjax expression.
        The script header still needs to be added
    """
    ck12_html = transform_to_xhtml(ck12_html)
    ck12_html = re.sub('\n', "", ck12_html)
    img_src_pattern = re.compile("<img class=\W*\"x-ck12-math\" src=\W*\"(.*?)\" alt=\W*\"(.*?)\" />")
    ret = re.sub(img_src_pattern, __mathjax_replace__, ck12_html)
    img_src_pattern = re.compile("<img class=\W*\"x-ck12-block-math\" src=\W*\"(.*?)\" alt=\W*\"(.*?)\" />")
    ret = re.sub(img_src_pattern, __mathjax_replace_block__, ret)
    ret = __add_mathjax_header__(ret)
    return ret

def genMD5Hash(path):
    f = open(path, 'rb')
    m = hashlib.md5()
    try:
        bufSize = 4096
        c = f.read(bufSize)
        while len(c) > 0:
            m.update(c)
            c = f.read(bufSize)
    finally:
        f.close()
    return m.hexdigest()

def genURLSafeBase64Encode(string, strip=True, usePrefix=True):
    """ Returns a URL-safe Base64 encode of the string with '=' replaced with
    '_' after the encode. """
    if not string:
        return string
    from base64 import urlsafe_b64encode
    if strip:
        string = string.strip()
    if not isinstance(string, str):
        string = string.encode('utf-8')
    string = urlsafe_b64encode(string).replace('=', '.')
    if usePrefix:
        string = 'x-ck12-%s' % string
    return string

def genURLSafeBase64Decode(encoded_string, hasPrefix=True):
    """ Returns the decoded string of the base64 encode generated by
    genURLSafeBase64Encode function. """
    if not encoded_string:
        return encoded_string
    from base64 import urlsafe_b64decode
    if hasPrefix:
        encoded_string = encoded_string.replace('x-ck12-','')
    if not isinstance(encoded_string, str):
        encoded_string = encoded_string.encode('utf-8')
    return urlsafe_b64decode(encoded_string.replace('.', '='))

def load_pylons_config(test_mode=False):
    """
        Loads some parts of pylons configuration for modules outside pylons
    """
    import os
    ## Get the production.ini file path
    mydir = os.path.dirname(os.path.abspath(__file__))
    for i in range(1, 3):
        mydir = os.path.dirname(mydir)
    CONFIG_FILE = os.path.join(mydir, "production.ini")

    import ConfigParser

    cfg = ConfigParser.ConfigParser()
    DEV_CONFIG_FILE = CONFIG_FILE.replace('production.ini', 'development.ini')
    if os.path.exists(CONFIG_FILE):
        cfg.read(CONFIG_FILE)
    elif os.path.exists(DEV_CONFIG_FILE):
        cfg.read(DEV_CONFIG_FILE)
    elif os.path.exists('/opt/2.0/flx/pylons/flx/production.ini'):
        cfg.read('/opt/2.0/flx/pylons/flx/production.ini')
    elif os.path.exists('/opt/2.0/flx/pylons/flx/development.ini'):
        cfg.read('/opt/2.0/flx/pylons/flx/development.ini')
    else:
        raise Exception(safe_encode(_(u"Cannot find %(CONFIG_FILE)s or %(DEV_CONFIG_FILE)s")  % {"CONFIG_FILE":CONFIG_FILE,"DEV_CONFIG_FILE": DEV_CONFIG_FILE}))


    configs = [cfg]
    if test_mode:
        test_cfg = ConfigParser.ConfigParser()
        if os.path.exists(CONFIG_FILE):
            TEST_CONFIG_FILE = CONFIG_FILE.replace('production.ini', 'test.ini')
        else:
            TEST_CONFIG_FILE = "/opt/2.0/flx/pylons/flx/test.ini"
        if os.path.exists(TEST_CONFIG_FILE):
            test_cfg.read(TEST_CONFIG_FILE)
        configs.append(test_cfg)


    config = {}
    for cfg in configs:
        sections = ['DEFAULT', 'app:main', 'server:main']
        for section in sections:
            for name, value in cfg.items(section):
                config[name] = value
    return config

tagExp = re.compile(r'<.*?>')
spaceExp = re.compile(r'\s+')
def xhtml_to_text(xhtmlClean):
    """
        Parse the already clean (from bzr) xhtml string and get the plain text content for indexing
    """
    text = None
    if xhtmlClean:
        xhtmlClean = unicode(BeautifulStoneSoup(xhtmlClean, convertEntities=BeautifulStoneSoup.ALL_ENTITIES))
        xhtmlClean = spaceExp.sub(u' ', xhtmlClean)
        xhtmlClean = tagExp.sub(u'', xhtmlClean)
        text = xhtmlClean.strip()
    return text

def isUploadField(fld):
    if fld is None:
        return False
    log.debug("Type: %s" % type(fld))
    if type(fld) != str and type(fld) != unicode:
        return True
    return False

def formatEncodedID(encodedID):
    if encodedID:
        newID = ''
        parts = encodedID.split('.')
        if not parts:
            return encodedID
        cnt = 0
        for part in parts:
            if newID:
                newID += '.'
            if part.isdigit():
                if cnt == 2:
                    ## The main concept identifier
                    newID += '%03d' % int(part)
                else:
                    newID += part
            else:
                newID += part.upper()
            cnt += 1
        return newID
    return encodedID

def splitEncodedID(encodedID):
    domainEncoding = None
    domainPrefix = None
    if encodedID:
        parts = encodedID.split('.')
        domainTermID = '.'.join(parts[:2])
        cnt = 2
        while cnt < len(parts):
            if parts[cnt].isdigit():
                domainTermID += '.' + parts[cnt]
            else:
                break
            cnt += 1
        log.debug("Term: %s" % domainTermID)
        parts = domainTermID.split('.')
        encodingPrefix = '.'.join(parts[:2])
        encodedID = ''.join(parts[2:]).ljust(18,'0')
        domainEncoding = long(encodedID)
        domainPrefix = encodingPrefix
    return domainEncoding, domainPrefix

def getDomainEIDFromEID(encodedID):
    if encodedID:
        parts = encodedID.split('.')
        if len(parts) == 6:
            encodedID = '.'.join(parts[:-2])
        elif len(parts) == 5:
            if parts[-1].isalpha():
                encodedID = '.'.join(parts[:-1])
            else:
                encodedID = '.'.join(parts[:-2])
        elif len(parts) == 4:
            if parts[-1].isalpha():
                encodedID = '.'.join(parts[:-1])
    return encodedID

def isValidDomainEID(encodedID):
    if encodedID:
        parts = encodedID.split('.')
        return (len(parts) == 3 and parts[-1].isdigit()) or \
                (len(parts) == 4 and parts[-1].isdigit() and parts[-2].isdigit())
    return False

def getCanonicalEncodedID(eid):
    eid = eid.strip().upper()
    eid = eid.rstrip('.')
    if eid.count('.') == 3:
        eid = eid.rstrip('0')
    eid = eid.rstrip('.')
    return eid

def getArtifactURL(artifact):
    aDomain = artifact.getDomain()
    if aDomain and aDomain.has_key('branch') and aDomain.has_key('branchInfo'):
        branchHandle = aDomain['branchInfo']['handle']
        if aDomain['branchInfo']['encodedID'] == 'UGC.UBR':
            branchHandle = 'na'
        if artifact.creator.login != 'ck12editor':

            return "/%s/%s/%s/user:%s/%s" % (branchHandle.lower(), aDomain['handle']\
                                 , artifact.getArtifactType(), safe_encode(urllib2.quote(artifact.creator.login)), artifact.getHandle())
        else:
            return "/%s/%s/%s/%s" % (branchHandle.lower(), aDomain['handle']\
                                 , artifact.getArtifactType(),  artifact.getHandle())
    else:
        if artifact.creator.login != 'ck12editor':
            return "/user:%s/%s/%s" % (safe_encode(urllib2.quote(artifact.creator.login)), artifact.getArtifactType(), artifact.getHandle())
        else:
            return "/%s/%s" % (artifact.getArtifactType(), artifact.getHandle())

def getNewModalityURLForArtifact(artifact,browseTerm=None):
    """ Get New Modality url in the following format
        http://<host>/<branch>/<concept-handle>/<modality-type>/<realm>/<modality-handle>"""
    if not browseTerm:
        return None
    if browseTerm.encodedID.startswith('UGC'):
        branch = 'na'
    else:
        branch = browseTerm.name
    artifact_domain_handle = safe_encode(urllib2.quote(artifact['domain']['handle']))
    artifact_branch = safe_encode(urllib2.quote(branch.lower()))
    artifact_handle = safe_encode(urllib2.quote(artifact['handle']))
    if artifact.get('realm',None):
        return "%s/%s/%s/%s/%s/%s" % (config.get('web_prefix_url'), artifact_branch, artifact_domain_handle\
                                         , artifact['artifactType'], safe_encode(urllib2.quote(artifact['realm'])), artifact_handle)
    else:
        return "%s/%s/%s/%s/%s" % (config.get('web_prefix_url'), artifact_branch, artifact_domain_handle\
                                         , artifact['artifactType'], artifact_handle)

def toBool(string):
  if isinstance(string, bool):
      return string
  if isinstance(string,str) or isinstance(string,unicode):
      return string.lower() == 'true' or string.lower() == '1'
  return False


def getDefinitions(content):

    definitions = {}
    start = 0
    while start < len(content):
        dtStart = content.find('<dt>', start)
        if dtStart < 0:
            break
        start = dtStart+4
        dtEnd = content.find('</dt>', start)
        if dtEnd < 0:
            break
        start = dtEnd+5
        dt = content[dtStart+4:dtEnd].strip()
        if dt:
            ## Not get the dt
            ddStart = content.find('<dd>', start)
            if ddStart < 0:
                break
            start = ddStart+4
            ddEnd = content.find('</dd>', start)
            if ddEnd < 0:
                break
            start = ddEnd+4
            dd = content[ddStart+4:ddEnd]
            if dd:
                definitions[dt] = dd.strip()
    return definitions

def url(*args, **kwargs):
    if args and len(args) > 0:
        return unicode(_url(args[0].encode('utf-8'),**kwargs),'utf-8')

    return _url(*args,**kwargs)

LESSON_SKELETON = u'''
<body>
<div class="x-ck12-data-objectives">
    @@LHS@@
</div>
<div class="x-ck12-data-concept">
<!--
    <concept />
-->
</div>
<div class="x-ck12-data-problem-set">
    @@LTS@@
</div>
<div class="x-ck12-data-vocabulary">
    @@LTVOCAB@@
</div>
</body>
'''

LESSON_SKELETON_CLEAN = None

def getLessonSkeleton():
    global LESSON_SKELETON_CLEAN
    if not LESSON_SKELETON_CLEAN:
        #lessonSkeleton = LESSON_SKELETON.replace('@@KT@@', '')
        lessonSkeleton = LESSON_SKELETON.replace('@@LHS@@', '')
        lessonSkeleton = lessonSkeleton.replace('@@LTS@@', '')
        lessonSkeleton = lessonSkeleton.replace('@@LTVOCAB@@', '')
        LESSON_SKELETON_CLEAN = lessonSkeleton
    return LESSON_SKELETON_CLEAN

COMMENT_REGEX = [
        re.compile(r'<!--\s*<concept\s*/>\s*-->'),
        re.compile(r'<!--[^@<>]*-->'),
        ]

def processLessonXhtmlForWrappingInContentComments(xhtml, conceptRevisionID=None):
    if xhtml and '<!-- Begin inserted XHTML [CONCEPT:' not in xhtml and '<!-- End inserted XHTML [CONCEPT:' not in xhtml and '<div class="x-ck12-data-concept">' in xhtml:
        dataConceptDivStartStartIndex = xhtml.index('<div class="x-ck12-data-concept">')
        dataConceptDivStartEndIndex = dataConceptDivStartStartIndex+33
        dataConceptDivEndStartIndex = -1
        dataConceptDivEndEndIndex = -1
        if '<div class="x-ck12-data-problem-set">' in xhtml[dataConceptDivStartEndIndex:]:
            dataConceptDivEndEndIndex = dataConceptDivStartEndIndex+xhtml[dataConceptDivStartEndIndex:].index('<div class="x-ck12-data-problem-set">')
            dataConceptDivEndStartIndex = dataConceptDivStartEndIndex+xhtml[dataConceptDivStartEndIndex:dataConceptDivEndEndIndex].rfind("</div>")
            dataConceptDivEndEndIndex = dataConceptDivEndStartIndex+6
        elif '<div class="x-ck12-data-vocabulary">' in xhtml[dataConceptDivStartEndIndex:]:
            dataConceptDivEndEndIndex = dataConceptDivStartEndIndex+xhtml[dataConceptDivStartEndIndex:].index('<div class="x-ck12-data-vocabulary">')
            dataConceptDivEndStartIndex = dataConceptDivStartEndIndex+xhtml[dataConceptDivStartEndIndex:dataConceptDivEndEndIndex].rfind("</div>")
            dataConceptDivEndEndIndex = dataConceptDivEndStartIndex+6
        elif '</div>' in xhtml[dataConceptDivStartEndIndex:]:
            dataConceptDivEndStartIndex = dataConceptDivStartEndIndex+xhtml[dataConceptDivStartEndIndex:].rfind('</div>')
            dataConceptDivEndEndIndex = dataConceptDivEndStartIndex+6

        if dataConceptDivEndStartIndex != -1 and dataConceptDivEndEndIndex != -1:
            if conceptRevisionID:
                contentStartComment = '\n<!-- Begin inserted XHTML [CONCEPT: '+str(conceptRevisionID)+'] -->\n'
                contentEndComment = '\n<!-- End inserted XHTML [CONCEPT: '+str(conceptRevisionID)+'] -->\n'
            else:
                contentStartComment = '\n<!-- Begin inserted XHTML [CONCEPT: ] -->\n'
                contentEndComment = '\n<!-- End inserted XHTML [CONCEPT: ] -->\n'

            log.debug("dataConceptDivStartEndIndex: %d, dataConceptDivEndStartIndex: %d" % (dataConceptDivStartEndIndex, dataConceptDivEndStartIndex))
            if dataConceptDivStartEndIndex == dataConceptDivEndStartIndex:
                ## [Bug #52531] Make sure the xhtml for concept content is not empty.
                xhtml = xhtml[:dataConceptDivStartStartIndex]+contentStartComment+'<p>&#160;</p>'+contentEndComment+xhtml[dataConceptDivEndEndIndex:]
            else:
                xhtml = xhtml[:dataConceptDivStartStartIndex]+contentStartComment+xhtml[dataConceptDivStartEndIndex:dataConceptDivEndStartIndex]+contentEndComment+xhtml[dataConceptDivEndEndIndex:]
    if xhtml:
        ## For non-lesson modalities, do not return empty body otherwise editor cannot load.
        emptyBodyRegex = re.compile(r'<body>\s*</body>', re.I | re.MULTILINE)
        m = emptyBodyRegex.search(xhtml)
        if m:
            xhtml = xhtml.replace('<body>', '<body>\n<p>&#160;</p>')
    return xhtml

def splitLessonXhtml(xhtml, splitOn=None):
    backup_xhtml = xhtml
    ## Cleanup XHTML
    xhtml = xhtml.replace('\n', '')
    xhtml = xhtml.replace('\r', '')
    for r in COMMENT_REGEX:
        xhtml = r.sub('', xhtml)
    lesson_xhtml = xhtml
    concept_content = xhtml
    objectives_content = ''
    problem_set_content = ''
    vocabulary_content = ''
    is_detect_template = False
    if not splitOn:
        splitOn = ['div class="x-ck12-data', 'h2']
    elif type(splitOn).__name__ != 'list':
        splitOn = [splitOn]
    for tag in splitOn:
        if tag not in xhtml:
            continue
        log.info('helpers.splitLessonXhtml: Tag: %s' % tag)
        if tag.startswith('div'):
            sections_re_obj = re.compile('(<%s.*?>)' % tag)
        else:
            sections_re_obj = re.compile('<%s.*?>' % tag)
        sections = sections_re_obj.split(lesson_xhtml)
        i = 0
        concept_pos = obj_pos = prob_pos = vocab_pos = -1
        is_detect_template = False
        while i < len(sections):
            each = sections[i].strip()
            if tag.startswith('div'):
                if each.startswith('<div class="x-ck12-data-objectives"'):
                    objectives_content = safe_decode(sections[i+1].strip())
                    if objectives_content.endswith('</div>'):
                        objectives_content = objectives_content[:-6]
                    obj_pos = i
                    log.info('helpers.splitLessonXhtml: objectives_content: %s' % objectives_content)
                elif each.startswith('<div class="x-ck12-data-concept"'):
                    concept_content = safe_decode(sections[i+1].strip())
                    if concept_content.endswith('</div>'):
                        concept_content = concept_content[:-6]
                    concept_pos = i
                    log.info('helpers.splitLessonXhtml: concept_content: %s' % concept_content)
                elif each.startswith('<div class="x-ck12-data-problem-set"'):
                    problem_set_content = safe_decode(sections[i+1].strip())
                    if '</body>' in problem_set_content:
                        problem_set_content = problem_set_content.split('</body>')[0].strip()
                    if problem_set_content.endswith('</div>'):
                        problem_set_content = problem_set_content[:-6]
                    prob_pos = i
                    log.info('helpers.splitLessonXhtml: problem_set_content: %s' % problem_set_content)
                elif each.startswith('<div class="x-ck12-data-vocabulary"'):
                    vocabulary_content = safe_decode(sections[i+1].strip())
                    if '</body>' in vocabulary_content:
                        vocabulary_content = vocabulary_content.split('</body>')[0].strip()
                    if vocabulary_content.endswith('</div>'):
                        vocabulary_content = vocabulary_content[:-6]
                    vocab_pos = i
                    log.info('helpers.splitLessonXhtml: vocabulary_content: %s' % vocabulary_content)
            else:
                is_detect_template = True
                if each.split('</%s>' % tag)[0].lower().strip() == 'concept':
                    concept_content = safe_decode(each.split('</%s>' % tag)[1])
                    concept_pos = i
                    log.info("helpers.splitLessonXhtml: concept_content: %s" % concept_content)
                elif each.split('</%s>' % tag)[0].lower().strip() == 'objectives' and i < 3:
                    objectives_content = safe_decode(each.split('</%s>' % tag)[1])
                    concept_content = safe_decode(concept_content).replace(objectives_content, '')
                    tag_title = each.split('</%s>' % tag)[0]
                    concept_content = re.sub('<%s id="%s">%s</%s>' % (tag,genURLSafeBase64Encode(tag_title),tag_title, tag), '', concept_content)
                    obj_pos = i
                    log.info("helpers.splitLessonXhtml: objectives_content: %s" % objectives_content)
                elif each.split('</%s>' % tag)[0].lower().strip() == 'problem set':
                    problem_set_xhtml = safe_decode(each.split('</%s>' % tag)[1])
                    problem_set_content = problem_set_xhtml.split('</body>')[0]
                    tag_title = each.split('</%s>' % tag)[0]
                    concept_content = safe_decode(concept_content).replace(problem_set_content, '')
                    concept_content = re.sub('<%s id="%s">%s</%s>' % (tag,genURLSafeBase64Encode(tag_title),tag_title, tag), '', concept_content)
                    prob_pos = i
                    log.info("helpers.splitLessonXhtml: problem_set_content: %s", problem_set_content)
                elif each.split('</%s>' % tag)[0].lower().strip() == 'vocabulary':
                    vocabulary_xhtml = safe_decode(each.split('</%s>' % tag)[1])
                    vocabulary_content = vocabulary_xhtml.split('</body>')[0]
                    tag_title = each.split('</%s>' % tag)[0]
                    concept_content = safe_decode(concept_content).replace(vocabulary_content, '')
                    concept_content = re.sub('<%s id="%s">%s</%s>' % (tag,genURLSafeBase64Encode(tag_title),tag_title, tag), '', concept_content)
                    vocab_pos = i
                    log.info("helpers.splitLessonXhtml: vocabulary_content: %s", vocabulary_content)
            i += 1
        break

    if is_detect_template:
        actual_list = [obj_pos, concept_pos, prob_pos, vocab_pos]
        while True:
            if actual_list.__contains__(-1):
                actual_list.remove(-1)
            else:
                break
        exp_list = actual_list
        exp_list.sort()

        if actual_list != exp_list or actual_list == []:
            lesson_xhtml = getLessonSkeleton()
            concept_content = backup_xhtml
        else:
            lesson_xhtml = LESSON_SKELETON
            lesson_xhtml = lesson_xhtml.replace('@@LHS@@', objectives_content)
            lesson_xhtml = lesson_xhtml.replace('@@LTS@@', problem_set_content)
            lesson_xhtml = lesson_xhtml.replace('@@LTVOCAB@@', vocabulary_content)
            if not concept_content:
                try:
                    log.warn("helpers.splitLessonXhtml: !!! is_detect_template: %s concept_content is empty: [%s], lesson_xhtml: [%s]" % (is_detect_template, safe_decode(concept_content), safe_decode(lesson_xhtml)))
                    log.info("helpers.splitLessonXhtml: !!! original html: [%s]" % safe_decode(backup_xhtml))
                except:
                    pass
                concept_content = '<p>&#160;</p>'
    else:
        lesson_xhtml = LESSON_SKELETON
        lesson_xhtml = lesson_xhtml.replace('@@LHS@@', objectives_content)
        lesson_xhtml = lesson_xhtml.replace('@@LTS@@', problem_set_content)
        lesson_xhtml = lesson_xhtml.replace('@@LTVOCAB@@', vocabulary_content)
        if not concept_content:
            try:
                log.warn("helpers.splitLessonXhtml: !!! is_detect_template: %s concept_content is empty: [%s], lesson_xhtml: [%s]" % (is_detect_template, safe_decode(concept_content), safe_decode(lesson_xhtml)))
                log.info("helpers.splitLessonXhtml: !!! original html: [%s]" % safe_decode(backup_xhtml))
            except:
                pass
            concept_content = '<p>&#160;</p>'

    ## replace h1 and h2 with h3
    concept_content = demoteH2s(concept_content)

    return lesson_xhtml, concept_content

def __getCache():
    global config
    if not config.get('cache_share_dir'):
        config = load_pylons_config()
    log.info("cache_share_dir: %s" % config.get('cache_share_dir'))
    cm = CacheManager(type='file', data_dir=config.get('cache_share_dir'))
    return cm.get_cache('test-login-repo')

def getCacheManager():
    global config
    if not config.get('beaker.cache.enabled'):
        config = load_pylons_config()

    cacheDict = {}
    for key in config.keys():
        if key.startswith('beaker.cache.'):
            cacheDict[key] = config[key]
    return CacheManager(**parse_cache_config_options(cacheDict))

def internalLogin(userID):
    """
        Imitate the login by creating a cache entry for the user id along with the
        timestamp.
        Only valid for the expiration time
    """
    internalLogout(userID)
    cache = __getCache()
    ts = int(time.time() * 1000)
    val = '%s:%s' % (userID, ts)
    ret = cache.get_value(key='test-login-%s' % userID, createfunc=lambda: '%s' % (val), expiretime=30*60)
    return ret

def getLoginCookie(userID):
    val = internalLogin(userID)
    return '%s=%s' % (config.get('beaker.session.key'), val)

def internalLogout(userID):
    cache = __getCache()
    cache.remove_value(key='test-login-%s' % userID)

def safe_encode(s):
    if s and type(s).__name__ == 'unicode':
        return s.encode('utf-8')
    return s

def safe_decode(s):
    if s and type(s).__name__ == 'str':
        return s.decode('utf-8')
    return s

def decode_encrypted(s):
    try:
        return safe_decode(s)
    except:
        return s.decode('utf-8', 'ignore')

def _splitOnSpace(text):
    splitLength = len(text)/2
    while splitLength < len(text) and text[splitLength] != ' ':
        splitLength = splitLength + 1
    return text[:splitLength], text[splitLength:]

def cropAndScaleImageToSize(imageObj, size):
    aspectRatio = float(size[0])/size[1]
    inputWidth, inputHeight = imageObj.size
    givenAspectRatio = float(inputWidth)/inputHeight

    if givenAspectRatio > aspectRatio:
        scale = float(size[1])/inputHeight
        scaledWidth = int(inputWidth * scale)
        scaledHeight = int(inputHeight * scale)
        imResized = imageObj.resize((scaledWidth, scaledHeight), Image.BICUBIC)
        diffWidth = int(scaledWidth - size[0])
        box = (diffWidth/2, 0, scaledWidth-diffWidth/2, scaledHeight)
    else:
        scale = float(size[0])/inputWidth
        scaledWidth = int(inputWidth * scale)
        scaledHeight = int(inputHeight * scale)
        imResized = imageObj.resize((scaledWidth, scaledHeight), Image.BICUBIC)
        diffHeight = int(scaledHeight - size[1])
        box = (0, diffHeight/2, scaledWidth, scaledHeight-diffHeight/2)

    imCropped = imResized.crop(box)
    return imCropped

def createCustomCoverImage(coverImageTemplate, coverImage, text, outputCoverImage):

    fontLocation = '/usr/share/fonts/truetype/freefont/FreeSansBold.ttf'
    fontLocation = '/usr/share/fonts/truetype/msttcorefonts/Georgia_Bold.ttf'
    fontLocation = '/usr/share/fonts/truetype/msttcorefonts/Georgia.ttf'
    fontSizeForFirstLine = 120
    fontSizeForSecondLine = 120
    fontForFirstLine = ImageFont.truetype(fontLocation, fontSizeForFirstLine)
    fontForSecondLine = ImageFont.truetype(fontLocation, fontSizeForSecondLine)

    fontTextSize = fontForFirstLine.getsize(text)
    if fontTextSize[0] <= 2225:
        firstLineText, secondLineText = text, ''
        fontSizeForFirstLine = 120
    else:
        firstLineText, secondLineText = _splitOnSpace(text)
        fontTextSizeForFirstLine = fontForFirstLine.getsize(firstLineText)[0]
        if fontTextSizeForFirstLine <= 2225:
            fontSizeForFirstLine = 120
        else:
            fontSizeForFirstLine = int(120*(2225.0/fontTextSizeForFirstLine))

    fontSizeForSecondLine = fontSizeForFirstLine
    lineHeight = 40

    imCoverImageTemplate = Image.open(coverImageTemplate)
    templateWidth, templateHeight = imCoverImageTemplate.size
    imCoverImage = Image.open(coverImage)
    draw = ImageDraw.Draw(imCoverImageTemplate)

    fontForFirstLine = ImageFont.truetype(fontLocation, fontSizeForFirstLine)
    fontForSecondLine = ImageFont.truetype(fontLocation, fontSizeForSecondLine)
    XLocationForFirstLine = templateWidth - fontForFirstLine.getsize(firstLineText)[0] - 153
    YLocationForFirstLine = 770
    XLocationForSecondLine = templateWidth - fontForSecondLine.getsize(secondLineText)[0] - 153
    YLocationForSecondLine = 770 + lineHeight + fontForFirstLine.getsize(firstLineText)[1]

    draw.text((XLocationForFirstLine, YLocationForFirstLine), firstLineText,
              font=fontForFirstLine, fill="white")
    draw.text((XLocationForSecondLine, YLocationForSecondLine), secondLineText,
              font=fontForSecondLine, fill="white")

    anchorLocation = (0, 1312)
    imCoverImage = cropAndScaleImageToSize(imCoverImage, (2550, 1988))
    imCoverImageTemplate.paste(imCoverImage, anchorLocation)

    imCoverImageTemplate.save(outputCoverImage)
    return outputCoverImage

def restoreSlash(url):
    if url is None:
        return url

    if '://' not in url and ':/' in url:
        return url.replace(':/', '://')

    return url

def checkUrlExists(url):
    from urllib import FancyURLopener
    class CK12Opener(FancyURLopener):
        version = 'Mozilla/5.0 (X11; Linux i686) AppleWebKit/534.30 (KHTML, like Gecko) Chrome/12.0.742.124 Safari/534.31'
    if not url:
        return False
    if url.startswith('//'):
        url = 'http:%s' % url
    try:
        opener = CK12Opener().open(url)
        return opener.getcode() < 400
    except IOError as ioe:
        ## TODO: Remove this after upgrading to Ubuntu 16.04
        if url.startswith('https:') and 'handshake failure' in str(ioe):
            ## Issue with newer SSL protocols that Python 2.6.9 and below does not support
            log.warn("Cannot open url with new SSL protocol. url[%s]" % url)
            return True
        raise ioe
    except Exception as e:
        log.debug("Exception type: %s" % type(e).__name__, exc_info=e)
        try:
            from M2Crypto.SSL.Checker import WrongHost
            if isinstance(e, WrongHost):
                log.warn("Got an DNS domain name mismatch exception: [%s]. Ignoring ..." % str(e))
                return True
        except:
            pass
        raise e
    return False

def urlretrieve(uri, filepath):
    from urllib import FancyURLopener
    class CK12Opener(FancyURLopener):
        version = 'Mozilla/5.0 (X11; Linux i686) AppleWebKit/534.30 (KHTML, like Gecko) Chrome/12.0.742.124 Safari/534.31'
    return CK12Opener().retrieve(uri, filepath)

def getRandomString(noOfChars):
    import string
    import random
    allChars = [x for x in string.lowercase] + [x for x in string.digits]
    random.shuffle(allChars)
    return "".join(allChars[:noOfChars])

def getApps():
    global apps

    if apps is None:
        apps = []
        appList = config.get('app_list')
        if appList is not None:
            appList = appList.split(';')
            for app in appList:
                apps.append(app.split('@'))
    return apps

def isFileMalicious(filepath, delete=True):
    global config
    if not config.get('check_for_malicious'):
        config = load_pylons_config()
    check_for_malicious = config.get('check_for_malicious')
    if check_for_malicious != 'true':
        return False
    else:
        import pyclamd
        pyclamd.init_network_socket('localhost', 3310)
        status = pyclamd.scan_file(filepath)
        if status:
            log.error('Malicious file detected: %s' %(status))
            if delete:
                os.remove(filepath)
            raise MaliciousFileException(safe_encode(_(u'Malicious file detected: %(status.values())s') % {"status.values()":status.values()}))
        else:
            log.info('File is free of malicious content.')
            return False

def createRemoteResource(resourceType, isExternal, creator, name, contents, checksum, authors=None, licenseName=None, isAttachment=False):
    """
        Check for and create a remote resource in the satellite server
    """
    from flx.lib.remoteapi import RemoteAPI
    newResource = False
    ## Check if the resource exists on the image satellite server
    try:
        api = '/get/info/resource/checksum/%s' % checksum
        resp = RemoteAPI.makeImageGetCall(api, failIfNonZero=False)
        if resp['responseHeader']['status'] != 0:
            raise Exception(safe_encode(_(u'No such resource for checksum')))
        log.info("(CACHE HIT) Object exists: %s" % json.dumps(resp))
        return newResource, resp
    except Exception as e:
        log.warn("Resource does not exist for checksum: %s [%s]" % (checksum, str(e)))

    ## Create a resource on the image satellite server
    getImageSatelliteOptions()
    image_satellite_share = config.get('image_satellite_share')
    useShare = False
    if image_satellite_share and os.path.exists(image_satellite_share):
        tf = NamedTemporaryFile(dir=image_satellite_share)
        useShare = True
    else:
        tf = NamedTemporaryFile()
    tf.close()

    os.makedirs(tf.name)
    uploadFile = safe_encode(os.path.join(tf.name, os.path.basename(name)))
    uf = open(uploadFile, 'wb')
    shutil.copyfileobj(contents, uf)
    uf.close()
    contents.close()
    log.info("Sending file: %s, size: %d" % (uploadFile, os.path.getsize(uploadFile)))
    issPasscode = config.get('iss_passcode') + checksum
    if len(issPasscode) % 8:
        # data block length must be multiple of eight
        issPasscode += 'X' * (8 - (len(issPasscode) % 8))

    api = '/create/resourceSatellite'
    params = {
            'resourceType': resourceType.name,
            'resourceName': name,
            'resourceHandle': '%s%s' % (checksum, os.path.splitext(uploadFile)[1]),
            'secret': genURLSafeBase64Encode(Blowfish.new(config.get('iss_secret')).encrypt(issPasscode), usePrefix=False),
            'checksum': checksum,
            'isAttachment': str(isAttachment),
            }
    if useShare:
        params['resourcePathLocation'] = uploadFile
        log.info("Using file location [%s]. No upload" % uploadFile)
    else:
        params['resourcePath'] = open(uploadFile, 'rb')
        log.info("Using file attachment [%s]. Uploading ..." % uploadFile)

    if authors:
        params['resourceAuthors'] = authors
    if licenseName:
        params['resourceLicense'] = licenseName
    resp = RemoteAPI.makeImageCall(api, params_dict=params, multipart=True)
    newResource = True
    log.info("Remote resource create returned: %s" % json.dumps(resp))
    shutil.rmtree(tf.name, ignore_errors=True)
    return newResource, resp

def computeChecksum(contents, isAttachment=False):
    """
        Calculate checksum for given content
        the contents param could be a file object or a string
    """
    ## Compute checksum using sha224
    size = 0
    m = hashlib.sha224()
    if type(contents).__name__ in ['str', 'unicode']:
        m.update(contents)
        size = len(contents)
    else:
        tf = NamedTemporaryFile(delete=False)
        shutil.copyfileobj(contents, tf)
        tf.close()
        size = os.path.getsize(tf.name)
        log.info("Saved file for checksum: %s, size: %d" % (tf.name, size))
        m.update(open(tf.name).read())
        contents.seek(0)
        os.remove(tf.name)
    if isAttachment:
        log.info("computeChecksum: isAttachment: %s" % str(isAttachment))
        m.update(str(isAttachment))
    sum = m.hexdigest()
    log.info("Object checksum: %s" % sum)
    return sum, size

def getImageSatelliteOptions():
    global config
    if not config or not config.has_key('image_use_satellite'):
        config = load_pylons_config()
    useImageSatellite = str(config.get('image_use_satellite')).lower() == 'true'
    imageSatelliteServer = config.get('image_satellite_server')
    iamImageSatellite = str(config.get('iam_image_satellite')).lower() == 'true'
    return useImageSatellite, imageSatelliteServer, iamImageSatellite

def getConfigOptionValue(option):
    global config
    if not config or not config.has_key('instance'):
        config = load_pylons_config()
    return config.get(option)

def urlQuote(url):
    return quote(url)

def appendStringIfUnique(input_list, string):
    string = string.strip()
    string = re.sub("\s+", ' ', string)
    if string not in input_list:
        input_list.append(string)
    return input_list

def parsePermaExtension(extension):
    extDict = {}
    if extension:
        extension = unquote(extension)
        extList = extension.split(',')
        for ext in extList:
            key, value = ext.split(':')
            key = key.lower()
            if key == 'version':
                value = int(value)
            extDict[key] = value
    return extDict

def dict2obj(d, cls, clsMap):
    top = cls()
    seqs = tuple, list, set, frozenset
    for k, v in d.iteritems():
        if isinstance(v, dict):
            if clsMap.get(k):
                cName = k
            else:
                cName = 'default'
            top.__dict__[k] = dict2obj(v, clsMap[cName], clsMap)
        elif isinstance(v, seqs):
            if clsMap.get(k):
                cName = k
            else:
                cName = 'default'
            top.__dict__[k] = type(v)(dict2obj(sv, clsMap[cName], clsMap) if isinstance(sv, dict) else sv for sv in v)
        else:
            top.__dict__[k] = v
    return top

def initTranslator():
    import pylons

    push = False
    if hasattr(pylons, 'translator'):
        typeName = type(pylons.translator).__name__
        log.debug('initTranslator: Found translator: %s' % typeName)
        if typeName not in [ 'NullTranslations', 'GNUTranslations', 'StackedObjectProxy' ]:
            log.debug('initTranslator: Did not find any objects of interest - pushing!')
            push = True
        elif typeName == 'StackedObjectProxy':
            found = False
            objects = None
            try:
                objects = pylons.translator._object_stack()
            except:
                pass
            if objects:
                log.debug('initTranslator: Found StackedObjectProxy: Size: %d' % len(objects))
                for obj in objects:
                    objType = obj.__class__.__name__
                    log.debug('Object: %s, Type: %s' % (obj, objType))
                    if objType in [ 'NullTranslations', 'GNUTranslations' ]:
                        log.debug('initTranslator: Found object of type: %s' % objType)
                        found = True
                        break
            push = not found
    else:
        push = True

    if push:
        #
        #  Set up i18n translator.
        #
        conf = pylons.config.current_conf()
        if not conf['pylons.paths']['root']:
            conf['pylons.paths']['root'] = os.path.abspath('/opt/2.0/flx/pylons/flx/flx')
            if os.name == 'nt':
                conf['pylons.paths']['root'] = os.path.abspath('c:/2.0/flx/pylons/flx/flx')
        if not conf.get('pylons.package'):
            conf['pylons.package'] = 'flx'
        obj = pylons.i18n.translation._get_translator('en')
        pylons.translator._push_object(obj)
        log.info('initTranslator: pushed: %s' % obj)
    log.info('initTranslator: translator[%s]' % pylons.translator)

def obfuscate(s):
    return s.encode('rot13') if s else None

def deobfuscate(s):
    return s.decode('rot13') if s else None

hostname = None
def getHostname():
    global hostname
    if not hostname:
        hostname = obfuscate(socket.gethostname())
    return hostname

## Python 2.6 equivalent of 2.7's timedelta.total_seconds()
def get_total_seconds(td):
    return (td.microseconds + (td.seconds + td.days * 24 * 3600) * 1e6) / 1e6

def smart_truncate(content, length=100, suffix='...'):
    return (content if len(content) <= length else content[:length].rsplit(' ', 1)[0]+suffix)

def get_peer_help_backurl(UUID):
    web_prefix_url = config.get('web_prefix_url')
    url = web_prefix_url

    if UUID.startswith(config.get('peerhelp.uuid.group')):
        url = '%s/group-discussions/%s#' % (web_prefix_url, UUID[11:])
    elif UUID.startswith(config.get('peerhelp.uuid.asmt')):
        url = '%s/assessment/ui/views/question.preview.peerhelp.html#qIID:%s' % (web_prefix_url, UUID[15:])

    return url

def html_to_plaintext(string):
    from BeautifulSoup import BeautifulSoup
    txt = string
    try:
        txt = BeautifulSoup(string, convertEntities=BeautifulSoup.HTML_ENTITIES).text
    except Exception, e:
        log.error('Error sending notification: %s' % str(e), exc_info=e)

    return txt

def get_current_time_in_timezone(timezone):
    return convert_to_timezone(datetime.utcnow(), 'UTC', timezone)

def convert_to_timezone(dt, src_tz, dst_tz):
    return pytz.timezone(src_tz).localize(dt).astimezone(pytz.timezone(dst_tz))

def next_weekday(d, weekday):
    days_ahead = weekday - d.weekday()
    if days_ahead <= 0: # Target day already happened this week
        days_ahead += 7
    return d + timedelta(days_ahead)

def toJson(pythonObject):
    if isinstance(pythonObject, datetime):
        pythonObject = pythonObject.replace(tzinfo=Local)
        #return pythonObject.isoformat(' ')
        return pythonObject.isoformat()

    if isinstance(pythonObject, date):
        return pythonObject.isoformat()


    from datetime import time
    if isinstance(pythonObject, time):
        return pythonObject.isoformat()

    if type(pythonObject) == ObjectId:
        return str(pythonObject)

    if isinstance(pythonObject, Exception):
        return repr(pythonObject)

    log.error("Cannot jsonify object: %s, type: %s" % (repr(pythonObject), type(pythonObject).__name__))
    raise TypeError(repr(pythonObject) + ' is not JSON serializable')

INPUT_SIZE = 8

def pad_string(str):

    new_str = str
    pad_chars = INPUT_SIZE - (len(str) % INPUT_SIZE)

    if pad_chars != 0:
        for x in range(pad_chars):
            new_str += " "

    return new_str

def uploadDocumentBatch(resource_ids=None, wait=False, inprocess=False):
    """
        Find out modalities having resource to be uploaded and upload to box viewer site
    """
    from flx.controllers.celerytasks import documentLoader as doc
    if inprocess:
        docTask = doc.UploadDocumentBatchInprocess()
        ret = docTask.apply(kwargs={'loglevel': 'INFO', 'resourceIDs': resource_ids})
        return ret
    else:
        docTask = doc.UploadDocumentBatch()
        task = docTask.delay(loglevel='INFO', resourceIDs=resource_ids)
        if wait:
            result = task.wait()
            return result
        return task.task_id

def str_to_bool(val, extra_true=None, extra_false=None):
    """
    Converts text value to True/ False boolean value
    True: true, yes, y
    False: false, no, n
    """
    t = [True, 'true', 't', 'yes', 'y']
    f = [False, 'false', 'f', 'no', 'n']

    if val:
        if extra_true:
            t = t + [x.lower() for x in extra_true]
        if extra_false:
            t = t + [x.lower() for x in extra_false]

        _val = val.lower()
        if _val in t:
            return True
        if _val in f:
            return False
    return val

def get_bookmarkURL_status(url):
    """
    Download just the header of a URL and
    return dictionary with url info .
    """
    url_info = {}
    try:
        # Get url status data
        r = requests.get(url, verify=False)
        status_code = r.status_code
        headers = dict(**r.headers)
        if r.status_code in [301,302] and headers.has_key('location'):
            url = headers.get('location')
            r = requests.get(url, verify=False)
            status_code = r.status_code
            headers = dict(**r.headers)
        log.info("URL status and header: %s--%s" % (status_code, headers))

        # Response script for http://www.teachertube.com/video/
        if re.search('http://www.teachertube.com/video/+', url) and status_code == 410:
            log.info("Processing seperate urlinfo for teachertube video")
            url_info['valid'] = True
            url_info['url'] = url
            url_info['iframe'] = {'isIframeSupport': False,'iframeResponse': {}}
            # we are splitting url like http://www.teachertube.com/video/3-or-more-addends-349087 to get last number 349087
            urlRoutList = url.split('/')
            urlRoutList = urlRoutList[len(urlRoutList)-1].split('-')
            videoNumber = urlRoutList[len(urlRoutList)-1]
            if not videoNumber.isdigit():
                newnumber = ''
                for s in videoNumber:
                    if s.isdigit():
                        newnumber += ''.join(s)
                    else:
                        break
                videoNumber = newnumber
            src = 'http://www.teachertube.com/embed/video/%s'% videoNumber
            html = "<iframe width='560' height='315' frameborder='0' allowfullscreen='' src='%s'></iframe>"% src
            url_info['embeded'] = {'embededSupport': True,'embededResponse': {'html':html}}
            if url_info['embeded']['embededSupport']:
                url_info['iframe'] = {'isIframeSupport': False,'iframeResponse': {}}
                return url_info
        elif re.search('http://www.teachertube.com*', url):
                log.info("Processing seperate urlinfo for teachertube video")
                url_info['valid'] = True
                url_info['url'] = url
                url_info['embeded'] = {'embededSupport': False,'embededResponse': {}}
                url_info['iframe'] = {'isIframeSupport': False,'iframeResponse': {}}
                return url_info
        else:
            pass

        if status_code == 200:
            url_info['valid'] = True

            #script for http://www.wikipedia.org/ related urls
            if re.search('wikipedia.org/+',url):
                url = url+ '?printable=yes'

            #script for https:www.youtube.com/watch related urls
            if re.search('youtube.com/watch+',url):
                v_index = url.find('v=')
                last_index = url.find('&', v_index)
                if last_index>=0:
                    url = url[: last_index]

            url_info['url'] = url
            # Get embeded support data
            url_info['embeded'] = {'embededSupport': False,'embededResponse': {}}
            for embededSiteKey in EMBEDED_PROVIDERS:
                if re.search(embededSiteKey, url):
                    url_info['iframe'] = {'isIframeSupport': False,'iframeResponse': {}}
                    if re.search(EMBEDED_PROVIDERS[embededSiteKey][0], url):
                        embedTestUrl = EMBEDED_PROVIDERS[embededSiteKey][1] + '?url=%s&format=%s'%(url,EMBEDED_PROVIDERS[embededSiteKey][2])
                        log.info("embedTestUrl: %s" % embedTestUrl)
                        r = requests.get(embedTestUrl, verify=False)
                        data = r.text
                        if EMBEDED_PROVIDERS[embededSiteKey][2] == 'json':
                            data = simplejson.loads(data)
                        else:
                            orderedDict = xmltodict.parse(data)
                            data = simplejson.dumps(orderedDict)
                            if type(data) == str:
                                data = ast.literal_eval(data)
                            if data.get('oembed'):
                                data = data.get('oembed')

                        url_info['embeded']['embededSupport'] = True
                        url_info['embeded']['embededResponse'] = data
                    return url_info

            # Get iframe support data
            url_info['iframe'] = {'isIframeSupport': False,'iframeResponse': {}}
            if headers.has_key('x-frame-options'):
                if headers.get('x-frame-options').upper() in ['DENY', 'SAMEORIGIN', 'ALLOW-FROM']:
                    url_info['iframe']['isIframeSupport'] = False
            elif headers.has_key('content-security-policy') or headers.has_key('x-content-security-policy') or headers.has_key('x-webkit-csp'):
                csp_list = headers.get('content-security-policy').split()
                log.info("content-security-policy:%s---%s---%s"% (csp_list,csp_list[0],csp_list[1].lower()))
                if len(csp_list) > 2 and csp_list[0] in ['frame-ancestors','frame-options','frame-src']:
                    if csp_list[1].lower() in ["'deny'","'sameorigin'", "'self'", "'none'"]:
                        url_info['iframe']['isIframeSupport'] = False
                    else:
                        url_info['iframe']['isIframeSupport'] = True
                        html = "<iframe src='%s' width='100%%' height='100%%' frameborder='0'></iframe>"%url
                        url_info['iframe']['iframeResponse']['html'] = html

            else:
                url_info['iframe']['isIframeSupport'] = True
                html = "<iframe src='%s' width='100%%' height='100%%' frameborder='0'></iframe>"%url
                url_info['iframe']['iframeResponse']['html'] = html

        else:
            url_info['valid'] = False

        log.info("URL info: %s" % url_info)
    except Exception, e:
        url_info['valid'] = False
        log.error('Error validating url: %s' % str(e), exc_info=e)
    return url_info

def getDBAndCollectionFromUrl(url):
    collection = None
    dbname = None
    if '/' in url:
        url, dbname = url.rsplit('/', 1)
    if '.' in dbname:
        dbname, collection = dbname.rsplit('.', 1)
    if dbname:
        url = '%s/%s' % (url, dbname)
    return url, dbname, collection

def refreshAccessToken(token_url,client_id, client_secret, redirect_uri, refresh_token, grant_type="refresh_token"):
    """
        Used to refresh Oauth2 access token.
    """
    try:
        response = None
        data = {"client_id": client_id,
               "client_secret": client_secret,
               "redirect_uri": redirect_uri,
               "refresh_token": refresh_token,
               "grant_type": grant_type}

        r = requests.post(token_url, data = data)

        if r.ok:
            response = r.json()
        return response
    except Exception, e:
        log.error("Could not refresh access token: %s" % str(e), exc_info=e)
        raise e

def getFuncName():
    import inspect
    return inspect.stack()[1][3]

def validate_email(email_ids=None):
    validation_result = dict()
    invalid_email_ids = list()
    #email_pattern_text = r"[\w!#$%&*+\-/=?^_`{|}~]+(\.[\w!#$%&*+\-/=?^_`{|}~]+)*@((([\-\w]+\.)+[\w]{2,}))"
    email_pattern_text = r"(^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)"
    email_pattern = re.compile(email_pattern_text)
    if email_ids:
        if isinstance(email_ids,basestring):
            email_ids = [email_ids]
        for email_id in email_ids:
            if email_pattern.match(email_id) is None:
                invalid_email_ids.append(email_id)
    validation_result["success"] = True if not invalid_email_ids else False
    if invalid_email_ids:
        validation_result["invalid_email_ids"] = invalid_email_ids
    return validation_result

def setCORSAndCacheHeaders(request, response):
    originUrl = request.headers['Origin'] if 'Origin' in request.headers else None
    # uncomment this if we want to enable any random domain
    log.debug("setCORSAndCacheHeaders: request.headers: [%s]" % str(request.headers))
    if originUrl:
        # this header is also added from R2 config for *.ck12.org sites
        # the check is to prevent from adding it multiple times
        if "ck12.org" not in originUrl:
            response.headers['Access-Control-Allow-Origin'] = originUrl
    if request.method == 'OPTIONS':
        # we want to return just the headers and not the complete response
        log.debug("OPTIONS call, returning only headers and no response")
        # cache the options call for 30 days
        response.headers['Access-Control-Max-Age'] = '2592000'

    if 'Access-Control-Request-Headers' in request.headers:
        response.headers['Access-Control-Allow-Headers'] = request.headers['Access-Control-Request-Headers']

    log.debug("setCORSAndCacheHeaders: response.headers: [%s]" % str(response.headers))
    setCacheControlHeaders(request, response)

def setCacheControlHeaders(request, response):
    cacheAgeMap = {
        "nocache" : 0,
        "quarter-hourly" : 60 * 15,
        "half-hourly" : 60 * 30,
        "hourly" : 3600,
        "daily" : 3600 * 24,
        "weekly" : 3600 * 24 * 7,
        "biweekly" : 3600 * 24 * 14,
        "monthly" : 3600 * 24 * 30,
        "yearly" : 3600 * 24 * 365
    }
    cacheAge = cacheAgeMap["nocache"]

    if 'expirationAge' in request.params:
        expirationAge = request.params.get('expirationAge')

        if request.method == 'OPTIONS':
            expirationAge = "monthly"
        if expirationAge in cacheAgeMap:
            cacheAge = cacheAgeMap[expirationAge]
        else:
            #this should not happen, error in the request
            pass

    ## Removing existing Cache-Control header, if present
    for header in ['Cache-Control', 'Pragma']:
        if header in response.headers:
            del response.headers[header]
    response.cache_expires(seconds=cacheAge)
    log.debug("setCacheControlHeaders: response.headers: [%s]" % str(response.headers))

def setSEOHeaders(response):
    response.headers['X-Robots-Tag'] = 'noindex'

def unquoteIterate(str):
    str = safe_encode(str)
    ustr = unquote(str)
    while str != ustr:
        str = ustr
        ustr = unquote(str)
    return safe_decode(str)

def splitConceptCollectionHandle(str):
    sep = '-::-'
    parts = str.lower().split(sep)
    ret = (None, None)
    if len(parts) == 2:
        ret = (parts[0], parts[1])
    else:
        raise Exception("Invalid conceptCollectionHandle: %s" % str)
    return ret

def splitSearchCollectionHandle(chandle):
    parts = chandle.split('|', 2)
    ret = { 'collectionHandle': '', 'isCanonical': False, 'collectionCreatorID': 3 }
    if len(parts) == 1:
        ret['collectionHandle'] = parts[0]
    elif len(parts) == 2:
        ret['collectionHandle'] = parts[0]
        ret['collectionCreatorID'] = int(parts[1])
    elif len(parts) == 3:
        ret['isCanonical'] = parts[0] == 'c'
        ret['collectionHandle'] = parts[1]
        ret['collectionCreatorID'] = int(parts[2])
    else:
        raise Exception("Invalid collectionHandle: %s" % chandle)
    return ret
