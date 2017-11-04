import sys
import os
import clr
import System
import urllib2, urllib
import json
import traceback
import time
import random
import logging
from datetime import datetime
from System.Text import StringBuilder
from System.IO import DirectoryInfo, File, FileInfo, FileStream, FileMode, Path, StreamWriter, StreamReader, BinaryWriter, BinaryReader

log = logging.getLogger(__name__)
    
clr.AddReference("System.Drawing")
clr.AddReference("DocumentFormat.OpenXml")

from System import Array, Byte
import System.Drawing.Image as DImage
from DocumentFormat.OpenXml import WordprocessingDocumentType
from DocumentFormat.OpenXml.Packaging import *
from DocumentFormat.OpenXml.Wordprocessing import *
import DocumentFormat.OpenXml.Drawing as d
import DocumentFormat.OpenXml.Drawing.Wordprocessing as dw
import DocumentFormat.OpenXml.Drawing.Pictures as pic

from openxml.fromdocx.translator import DocxTranslator
from openxml.fromdocx.multipartpost import MultipartPostHandler

from openxml.common import ENVIRONMENT_PROPS

#REPOSITORY_HOST = "ec2-50-16-92-231.compute-1.amazonaws.com"
#REPOSITORY_HOST = "prime.ck12.org"
IMAGE_HANDLER_URL_CREATE = "http://%s/flx/create/resource" % ENVIRONMENT_PROPS['FLX2_HOST']
IMAGE_HANDLER_URL_UPDATE = "http://%s/flx/update/resource" % ENVIRONMENT_PROPS['FLX2_HOST']
EO_HANDLER_URL_CREATE = "http://%s/flx/create/embeddedobject" % ENVIRONMENT_PROPS['FLX2_HOST']
RESOURCE_PERMA_URL = "http://%s/flx/construct/perma/resource/" % ENVIRONMENT_PROPS['FLX2_HOST']
RESOURCE_PERMA_INFO_URL = "http://%s/flx/get/perma/resource/info" % ENVIRONMENT_PROPS['FLX2_HOST']

class ImageHandler(DocxTranslator):

    def __init__(self, mainPart, userId, login, token):
        self.html_entities = {
                              "&" : "&amp;",
                              '"' : "&quot;",
                              "'" : "&apos;",
                              ">" : "&gt;",
                              "<" : "&lt;",
                             }
                             
        self.typeMapping = {'image/jpeg': 'jpg',
                            'image/bmp': 'bmp',
                            'image/gif': 'gif',
                            'image/x-pcx': 'pcx',
                            'image/tiff': 'tif',
                            'image/png': 'png',
                            'image/x-icon': 'ico',
                            'image/x-wmf': 'wmf',
                            } #leaving emf and wmf (windows metafile).
                            
        self.userId = userId
        self.login = login
        self.token = token
        self.workDir = 'c:/cygwin/tmp/'
        self.imageName = None
        self.imagePath = ""
        self.mainPart = mainPart
        #self.count = self.createTimestamp()
        self.fileId = ""
        self.imageId = ''
        self.url = ''
        self.caption = ""
        self.title = ""
        self.para = None
        self.drawing = None
        self.width = ""
        self.float = " x-ck12-nofloat"
        self.author = ''
        self.license = ''
        self.isVideo = False
        self.videoData = {}
        self.inlineTemplate = '''
        <span class="x-ck12-img-inline">
            <!-- @@author="%s" -->
            <!-- @@license="%s" -->
            <img src="%s" %s/>
        </span>\n'''

        self.blockTemplate = '''
                              <div %s class="x-ck12-img-postcard%s">
                                <!-- @@author="%s" -->
                                <!-- @@license="%s" -->
                                <p><img alt="%s" longdesc="%s" src="%s" %s/></p>
                                <p>%s</p>
                              </div>\n'''
        self.videoTemplateIframe = '''<iframe id="%s" name="%s" width="%s" height="%s" src="%s" frameborder="0">
    <!-- @@author="%s" -->
    <!-- @@license="%s" -->
</iframe>\n'''

        self.videoTemplateObject = '''<object classid="%s" id="%s" internalid="%s" %s %s>
%s
%s
</object>\n'''

        
    def getImageFromGraphicData(self, drawing):
        try:
            self.drawing = drawing
            GraphicData = None
            for e in  self.drawing.Elements[dw.Inline]():
                GraphicData = e.Graphic.GraphicData
            if not GraphicData:
                for e in self.drawing.Elements[dw.Anchor]():
                    for g in e.Elements[d.Graphic]():
                        GraphicData = g.GraphicData
                        ## Floating image
                        log.info("Found drawing.Graphic.GraphicData - floating image")
                        self.float = " x-ck12-float"
                        break
                    break
            for e in GraphicData.Descendants[pic.NonVisualDrawingProperties]():
                self.imageName = e.Name
                break
            log.info("imageName: %s" % self.imageName)
            for e in GraphicData.Descendants[pic.BlipFill]():
                log.info("BlipFill: %s" % e.Blip.Embed.ToString())
                self.fileId = e.Blip.Embed.ToString()
                break
            log.info("fileId: %s" % self.fileId)

            #self.fileId = GraphicData.FirstChild.BlipFill.Blip.Embed.ToString()
            if not self.imageName:
                self.imageName = self.fileId
            log.info("Image refId: "+ self.fileId)
        except Exception as e:
            self.addWarning("Could not get the file id for an embedded image: %s" % str(e))
            log.error("ERROR: FileID doesn't exist, %s" % str(e), exc_info=e)
    
        if self.extractImage():
            self.url = self.persistImage()
            
            
        self.getImageDimensions()
        return self.imagePath

    def translate(self):
        self.clearFiles()
        self.getDescription()
        if self.float.strip()  == 'x-ck12-float':
            ## float images are block images with a float
            return self.translateBlock()
        if self.url != '':
            log.info("In Translate: %s" % self.url)
            widthStr = ''
            if self.width:
                widthStr = 'width="%s"' % self.width
            return self.inlineTemplate % (self.author, self.license, self.url, widthStr)
                
    def isObjectVideo(self):
        if self.videoData:
            for key in self.videoData.keys():
                if key.startswith('embed_'):
                    return True
        return False

    def translateBlock(self):
        self.clearFiles()
        if self.url != '':
            log.info("In TranslateBlock: "+ self.url)
            widthStr = ''
            heightStr = ''
            if self.videoData.get('width', ''):
                widthStr = 'width="%s"' % self.videoData.get('width', '')
            elif self.width:
                widthStr = 'width="%s"' % self.width
            if self.videoData.get('height', ''):
                heightStr = 'height="%s"' % self.videoData.get('height', '')
            elif self.height:
                heightStr = 'height="%s"' % self.height

            if not self.isVideo:
                idStr = ''
                if self.imageId:
                    idStr = 'id="%s"' % self.imageId
                return self.blockTemplate % (idStr, self.float, self.author, self.license, self.title, self.caption, self.url, widthStr, self.caption)

        if self.isVideo:
            log.info("Processing embedded video")
            iframeID = 'eo_%s_%s_iframe'
            url = None
            info = {}
            if self.isObjectVideo():
                params = ''
                embedStr = ''
                for key in self.videoData.keys():
                    keyStr = key.lstrip('_')
                    if not key.startswith('embed_'):
                        params += '\t<param name="%s" value="%s" />\n' % (keyStr, self.videoData.get(key, ''))
                    else:
                        embedStr += '%s="%s" ' % (keyStr.replace('embed_', ''), self.videoData.get(key, ''))
                if embedStr:
                    embedStr = '\t<embed %s />\n' % embedStr

                code = self.videoTemplateObject % (self.videoData.get('classid', ''),
                        self.videoData.get('id', ''),
                        self.videoData.get('internalid', ''),
                        widthStr,
                        heightStr,
                        params,
                        embedStr)
                info, url = self.persistEmbeddedObject(url=None, code=code)
            else:
                fileref = self.videoData.get('fileref')
                if not fileref:
                    fileref = self.videoData.get('src')
                if fileref:
                    info, url = self.persistEmbeddedObject(url=fileref, code=None)

            if url:
                classes = self.videoData.get('class', '').split()
                eoType = ''
                for cls in classes:
                    if not cls.startswith('x-ck12'):
                        eoType = cls
                        break

                iframeID = iframeID % (eoType, info['id'])
                return self.videoTemplateIframe % (iframeID,
                        info['id'],
                        self.videoData.get('width', info.get('width', '')),
                        self.videoData.get('height', info.get('height', '')),
                        url, self.videoData.get('author', ''), self.videoData.get('license', ''))
            else:
                self.addWarning("No url found for this embedded object. Could not process. [%s]" % str(self.videoData))


        log.info("No url for this image and could not process as a video")
        return ''
                
    def extractImage(self):
        try:
            random.seed()
            imagePart = self.mainPart.GetPartById(self.fileId)
            stream = imagePart.GetStream()
            type = imagePart.ContentType.ToString()
            log.info("ImagePartType: "+ type)
            myReader = BinaryReader(stream)
            ext = self.typeMapping[type]
            imageNameUnique = '%s%s-%s-%s' % (str(int(round(time.time() * 1000))), str(random.randint(1,10000)), self.userId, self.imageName)
            self.imagePath = '%s%s' % (self.workDir, imageNameUnique)
            if not self.imagePath.endswith(ext):
                self.imagePath += '.%s' % ext
            log.info("imagePath: %s" % self.imagePath)
            file = FileStream(self.imagePath, FileMode.OpenOrCreate)
            read = 0
            bytes = Array.CreateInstance(System.Byte, 32*1024)
            while (True) :
                read = myReader.Read(bytes, 0, bytes.Length)
                if read >0 :
                    file.Write(bytes, 0, read)
                else: 
                    break;
            
            file.Close()
            log.info("Extracted image: %s" % self.imagePath)
            return True
        except Exception as e:
            self.addWarning("Could not extract embedded image from the document for image id: %s, error: %s" % (self.fileId, str(e)))
            log.error("ERROR: Stream error, %s "%str(e), exc_info=e)

    def addBlockPara(self, para):
        self.para = para
        try:
            self.drawing = self.getDrawingFromPara(para)
            self.getDescription()
            fileName = self.getImageFromGraphicData(self.drawing)
            log.info("Waiting for caption..")

        except Exception as e:
            self.addWarning("Could not find a drawing element withing paragraph marked with image style: %s" % str(e))
            log.error("ERROR: couldn't find drawing element in a P with image style. Degrading.. [%s]" % str(e), exc_info=e)

    def getImageDimensions(self):
        try:
            ## Get actual image dimentions
            image = DImage.FromFile(self.imagePath)
            self.width = image.Width
            self.height = image.Height
            self.horizReso = min(image.HorizontalResolution, 92.0)
            self.vertReso = min(image.VerticalResolution, 92.0)
            log.info("%s %s (%sx%s)" % (self.width, self.height, self.horizReso, self.vertReso))
            image.Dispose()

            ## Get image dimensions in word
            extent = self.drawing.Inline.Extent
            if extent:
                widthEMU = extent.Cx.Value
                if widthEMU:
                    widthPx = long(float(widthEMU) * float(self.horizReso) / float(914400))
                    log.info("widthPx: %s" % widthPx)
                    if widthPx: 
                        self.width = widthPx
            log.info("Image width: %s" % self.width)
        except Exception, e:
            self.addWarning("Could not get the dimensions of the image: %s" % str(e))
            log.error("ERROR: Couldn't get image dimensions. %s" % str(e), exc_info=e)
        

    def getDescription(self):
        try:
            docpr = None
            for e in self.drawing.Descendants[dw.Inline]():
                docpr = e.DocProperties
                break
            if not docpr:
                for e in self.drawing.Descendants[dw.Anchor]():
                    for dp in e.Elements[dw.DocProperties]():
                        docpr = e
                        break
                    break
            log.info("DEBUG: got docpr:"+ docpr.GetType().ToString())
            
            try:
                try:
                    ## Get title - only in Office 2010
                    self.title = self.html_escape(docpr.Title.ToString())
                except:
                    pass
                desc = self.html_escape(docpr.Description.ToString())
                parts = desc.split('@@')
                if not self.title:
                    self.title = parts[0]
                for i in range(1, len(parts)):
                    if 'author:' in parts[i].lower():
                        self.author = ':'.join(parts[i].split(':')[1:]).strip()
                    elif 'license:' in parts[i].lower():
                        self.license = ':'.join(parts[i].split(':')[1:]).strip()
                if not self.author:
                    self.author = ''
                if not self.license:
                    self.license = ''

            except Exception, e:
                #got no desc, no problem
                pass        
                
        except Exception, e:
            self.addWarning("Could not find Properties for image: %s" % str(e))
            log.error("Info: not getting dpr, %s "% str(e), exc_info=e)
        
    def getDrawingFromPara(self, element):        
        childList = element.ChildElements
        #found = False
        for child in childList:
            type = child.GetType().ToString()
            log.info("Image child: "+ type)
            if type.rfind('Run') >0:
               grandChildList = child.ChildElements
               for grandChild in grandChildList:
                   gcType = grandChild.GetType().ToString()
                   log.info("GrandChild: "+ gcType)
                   if gcType.rfind('Drawing') >=0 :
                       return grandChild 
            elif not self.imageId and type.rfind('BookmarkStart') > 0:
                log.info("DEBUG: Got bookmarkStart!")
                try:
                    self.imageId = child.Name.ToString() 
                    log.info("BookmarkStart: %s" % self.imageId)
                except Exception, e:
                    self.addWarning("Bookmark has no name specified. Ignoring: %s" % str(e))
                    log.error("ERROR: bookmark has no name: %s"% str(e), exc_info=e)
            else:
                continue

    def persistImage(self):
        log.info("Trying to upload image to: %s" % IMAGE_HANDLER_URL_CREATE)
        try: 
            resourceName = os.path.basename(self.imagePath)
            opener = urllib2.build_opener(MultipartPostHandler)
            params = {"resourcePath" : open(self.imagePath, "rb")}
            params["resourceType"] = "image"
            params["resourceName"] = resourceName
            log.info("Resource name: %s, Image path: %s" % (resourceName, self.imagePath))
            
            urllib2.install_opener(opener)
            req = urllib2.Request(IMAGE_HANDLER_URL_CREATE, params)
            req.add_header('Cookie', '%s' % str(self.token))
            
            res = urllib2.urlopen(req)
            resource_upload_response = res.read()
            j = json.loads(resource_upload_response)
            if j['responseHeader']['status'] == 0:
                resourceID = j['response']['id']
                resourceUri = j['response']['uri']
                log.info("Upload response: %s " % resource_upload_response)
                log.info("Resource id: %s, url: %s" % (resourceID, resourceUri))
            else:
                self.addWarning("Image with name [%s] already exists. Updating instead of creating new." % resourceName)
                log.info("Failed to create new image resource: %s" % resource_upload_response)
                permaResp = urllib2.urlopen('%s/default/image/%s/%s' % (RESOURCE_PERMA_INFO_URL, urllib.quote('user:%s' % self.login), urllib.quote(resourceName.replace(' ', '-')))).read()
                permaJ = json.loads(permaResp)
                if permaJ['responseHeader']['status'] == 0:
                    resourceID = permaJ['response']['resource']['id']
                    ## Try updating
                    params["resourcePath"] = open(self.imagePath, "rb")
                    params['id'] = str(resourceID)
                    urllib2.install_opener(opener)
                    req = urllib2.Request(IMAGE_HANDLER_URL_UPDATE, params)
                    req.add_header('Cookie', '%s' % str(self.token))
                    res = urllib2.urlopen(req).read()
                    jUpdate = json.loads(res)
                    if jUpdate['responseHeader']['status'] == 0:
                        resourceUri = jUpdate['response']['uri']
                        log.info("Updated response: %s" % res)
                        log.info("Resource id: %s, url: %s" % (resourceID, resourceUri))
                    else:
                        raise Exception("Invalid response from resource update API: %s" % res)
                else:
                    raise Exception("Invalid response from get perma info for resource: %s" % permaResp)

            return resourceUri
        except Exception as e:            
            log.error("Error: failed uploading %s " % e, exc_info=e)

    def persistEmbeddedObject(self, url, code):
        log.info("Trying to create embeded object for: %s or %s" % (url, code))
        try:
            opener = urllib2.build_opener(MultipartPostHandler)
            if url:
                params = {'url': url}
            elif code:
                params = {'code': code}
            
            urllib2.install_opener(opener)
            req = urllib2.Request(EO_HANDLER_URL_CREATE, params)
            req.add_header('Cookie', '%s' % str(self.token))
            
            res = urllib2.urlopen(req)
            resource_upload_response = res.read()
            j = json.loads(resource_upload_response)
            if j['responseHeader']['status'] == 0:
                resourceID = j['response']['resource']['id']

                permaResp = urllib2.urlopen("%s%s" % (RESOURCE_PERMA_URL, resourceID)).read()
                permaJ = json.loads(permaResp)
                if permaJ['responseHeader']['status'] == 0:
                    resourceUri = "/flx/show%s" % (permaJ['response']['perma'])

                log.info("Upload response: %s " % resource_upload_response)
                log.info("Resource id: %s, url: %s" % (resourceID, resourceUri))
            else:
                raise Exception("Invalid response from create eo api: %s" % resource_upload_response)

            return j['response'], resourceUri
        except Exception as e:            
            self.addWarning("Could not create embeddedobject for a video or simulation: %s" % str(e))
            log.error("Error: failed uploading %s " % str(e), exc_info=e)

    def createTimestamp(self):
        return datetime.now().strftime("%d%H%M%S")
                
    def addCaption(self, element):
        caption = ''
        for e in element.ChildElements:
            if 'ARABIC' not in e.InnerText and 'SEQ' not in e.InnerText:
                caption += e.InnerText
        self.caption = caption
        log.info("Caption found: %s" % self.caption)
        
    def html_escape(self, text):
        return "".join(self.html_entities.get(c,c) for c in text)

    def clearFiles(self):
        try:
            if os.path.exists(self.imagePath):
                log.info("DEBUG: Trying to delete file after upload: "+ self.imagePath)
                os.remove(self.imagePath)
        except Exception as e:
            log.error("ERROR: Could not delete image file", exc_info=e)

