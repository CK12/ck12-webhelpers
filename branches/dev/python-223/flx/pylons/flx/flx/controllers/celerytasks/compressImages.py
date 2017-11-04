"""
Celery task to periodically compress new images that are added/uploaded to flx
Author: Rahul Nanda
28th December 2015
"""

from flx.controllers.celerytasks.periodictask import PeriodicTask
from flx.model import api
from flx.lib import helpers as h
from flx.lib.fc import fcclient
from tempfile import NamedTemporaryFile
import logging, subprocess, traceback

import json
import os, shutil, imghdr, urllib, requests

LOG_FILENAME = "/tmp/compressimages_celery.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=10*1024*1024, backupCount=5)
handler.setFormatter(formatter)
log.addHandler(handler)

class CompressImagesTask(PeriodicTask):
    recordToDB = True
    
    def __init__(self, **kwargs):
        PeriodicTask.__init__(self, **kwargs)
        self.routing_key = "iss"
        self.skipIfRunning = True
    
    def _compress_images(self, last_resourceid):
        pid_prefix_dl = 'f-d:'
        thumbnailSizes = {"POSTCARD": (500, 500), "LARGE": (192, 192), "SMALL": (95, 95)}
        
        originalImageStreamList = ["IMAGE", "IMAGE_THUMB_POSTCARD", "IMAGE_THUMB_LARGE", "IMAGE_THUMB_SMALL"]
        originalCoverPageStreamList = ["COVER_PAGE", "COVER_PAGE_THUMB_POSTCARD", "COVER_PAGE_THUMB_LARGE", "COVER_PAGE_THUMB_SMALL"]

        newImageStreamList = []
        newCoverPageStreamList = []
        for oisname,ocsname in zip(originalImageStreamList, originalCoverPageStreamList):
            newImageStreamList.append(oisname + "_TINY") 
            newCoverPageStreamList.append(ocsname + "_TINY") 
        
        jpegmini_server = self.config.get('iss_optimize_host')
        if not jpegmini_server:
            raise Exception("Cannot find iss_optimize_host")
        fc = fcclient.FCClient()
     
        fedoraObjectsNotFound = totalResourcesScanned = successCount = notPngOrJpegCount = streamsAlreadyExistCount = jpegCount = pngCount = 0             
        resources = api.getResourcesWithGreaterID(resourceID = last_resourceid, typeNames=['image', 'cover page'])
        failed_resourceIDs = []
        for r in resources:
            if r.isExternal:
                continue
            try:
                totalResourcesScanned += 1
                resourceName = r.name
                url = r.satelliteUrl
 
                obj = fc.getResourceObject(id=r.checksum)
                pid = h.safe_decode('%s%s' % (pid_prefix_dl, r.checksum))
                
                log.info("Resource: id: %d, type: %s, url: %s, name: %s, checksum: %s" % (r.id, r.type.name, url, r.name, r.checksum))

                if not obj:
                    log.info("No fedora object found for resources id: %d" %r.id)
                    fedoraObjectsNotFound += 1          
                    continue

                dsid = fc.getDSName(r.type.name)
                try:
                    originalDSProfile = fc.client.getDatastreamProfile(pid, dsid=dsid) 
                except Exception, e:
                    log.error("Error retrieving Original Image Datastream for given resource. Exception info: %s " % str(e), exc_info=e)
                    continue

                if r.type.name == 'image':
                    newStreamList = newImageStreamList
                    originalStreamList = originalImageStreamList
                else:
                    newStreamList = newCoverPageStreamList
                    originalStreamList = originalCoverPageStreamList 

                # If tiny streams already exist, we delete them.
                dsList = fc.client.listDatastreams(pid)
                for ds in dsList:
                    if "TINY" in ds:
                        fc.client.deleteDatastream(pid, ds)
                        log.info("deleted stream: %s" %ds)

                #Some initialisations..
                mimeType = originalDSProfile['mimeType']
                controlGroup = originalDSProfile['controlGroup']
                dsName = fc.getDSName(r.type.name, 'tiny')

                # ----Download Image------#
                f = NamedTemporaryFile()
                f.close()
                os.makedirs(f.name)
                dlFileName = r.uri 
                if not dlFileName and r.handle:
                    dlFileName = os.path.basename(r.handle)
                if not dlFileName:
                    dlFileName = os.path.basename(f.name)

                dlFile = h.safe_encode(os.path.join(f.name, dlFileName))

                h.urlretrieve(url, dlFile)

                log.info("Downloaded to file: %s, size: %d" % (dlFile, os.path.getsize(dlFile))) 

                # ----Check Image Format and decide compression technique-----#

                if imghdr.what(dlFile) != 'png' and imghdr.what(dlFile) != 'jpeg':
                    """ 
                        for images that are neither of type png nor jpeg, we simply add uncompressed original images to the tiny streams.
                    """
                    notPngOrJpegCount += 1
                    label = h.safe_decode('tiny_%s' % resourceName)
                    
                    for cDSName,oDSName in zip(newStreamList, originalStreamList):
                        if("THUMB" in oDSName):
                            label = h.safe_decode('tiny_thumbnail_%s_for_%s' %(oDSName.split('_')[-1], resourceName))
                        #lock.acquire()
                        obj.addDataStream(cDSName, fc.getDSXml(r.type.name), label=label, mimeType=h.safe_decode('%s' % mimeType), controlGroup=controlGroup, logMessage=h.safe_decode('Storing compressed %s' % r.type.name)) 
                        try:
                            content = obj[oDSName].getContent()
                        except Exception, e:
                            log.error("No datastream: %s for the image resource" %oDSName)
                            continue
                        obj[cDSName].setContent(content.read())
                        log.info("Copied datastream content from %s to %s for non-png resource id: %d, name: %s" %(oDSName, cDSName, r.id, r.name))
                        #lock.release()
                    successCount += 1
                    #shutil.rmtree(f.name, ignore_errors=True)                
                    #continue
                elif imghdr.what(dlFile) == 'jpeg':
                    """Using JPEGmini for jpeg compression
                       For our satellite URLs, JPEGmini REST API is working when the url is twice encoded. 
                    """
                    jpegCount += 1
                    encodedURL = urllib.quote(urllib.quote(url))
                    label = h.safe_decode('tiny_%s' % resourceName)
                    
                    for cDSName,oDSName in zip(newStreamList, originalStreamList):
                        if("THUMB" in oDSName):
                            label = h.safe_decode('tiny_thumbnail_%s_for_%s' %(oDSName.split('_')[-1], resourceName))
                            thumbSatelliteURL = url.replace(dsid, oDSName)
                            encodedURL = urllib.quote(urllib.quote(thumbSatelliteURL))
                        #compress image by passing its url and then download the compressed image
                        response = requests.get( url="http://%s/api/v1/proxy?url=%s" % (
                                jpegmini_server, encodedURL), stream=True)
                        log.info("status code:%s headers:%s" %(response.status_code, response.headers))
                        
                        fjpeg = NamedTemporaryFile()
                        fjpeg.close()
                        with open(fjpeg.name, "wb") as fd:
                            for chunk in response.iter_content(chunk_size=128):
                                fd.write(chunk)
                        ## Check if the stream exists (delete, if so)
                        if cDSName in obj.datastreams():
                            log.info("Deleting existing stream: %s" % cDSName)
                            del obj[cDSName]

                        obj.addDataStream(cDSName, fc.getDSXml(r.type.name), label=label, mimeType=h.safe_decode('%s' % mimeType), controlGroup=controlGroup, logMessage=h.safe_decode('Storing compressed %s' % r.type.name)) 
                        with open(fjpeg.name, "rb") as fd:
                            obj[cDSName].setContent(fd)
                        log.info("Added datastream: %s using jpegmini" %cDSName)
                        #lock.release()
                    successCount += 1
                    #shutil.rmtree(f.name, ignore_errors=True)                
                    #continue
                elif imghdr.what(dlFile) == 'png':
                    """
                        We use pngquant for png image compression
                    """
                    pngCount += 1
                    if not self._compressPNG(dlFile):
                        log.info("Compression of the file %s failed." % dlFile)
                        continue
                                               
                    compressedImagePath = self._getCompressedImagePath(dlFile)

                    # ----Save compressed image ----#
                    #lock.acquire() 
                    #log.info("Add Datastream \n dsName: %s \n label: %s \n mimeType: %s \n controlGroup: %s" % (dsName, h.safe_decode('tiny_%s' % resourceName), h.safe_decode('%s' % mimeType), controlGroup))
                    obj.addDataStream(dsName, fc.getDSXml(r.type.name), label=h.safe_decode('tiny_%s' % resourceName), mimeType=h.safe_decode('%s' % mimeType), controlGroup=controlGroup, logMessage=h.safe_decode('Storing compressed %s' % r.type.name))
                    ds = obj[dsName]
                    tempFile = open(compressedImagePath, "rb")
                    ds.setContent(tempFile)
                    tempFile.close()
                    #lock.release()

                    #Save compressed thumbnails
                    for sizename in fc.thumbnailSizes.keys():
                        x,y = fc.thumbnailSizes[sizename]
                        try:
                            thumbImg = fc.getThumbnail(dlFile, width=x, height=y, animated=False)
                            if not mimeType:
                                mimeType = 'application/binary'
                            
                            compressedImagePath = self._getCompressedImagePath(thumbImg.name)
                            if not self._compressPNG(thumbImg.name):
                                log.info("(Cfail) Compression of the file %s failed." % thumbImg.name)
                                if os.path.exists(compressedImagePath):
                                    os.remove(compressedImagePath)
                                os.remove(thumbImg.name)
                                continue

                            dsNameThumb = fc.getDSName(r.type.name, 'thumb_%s_tiny' % sizename)
                            ## Check if the stream exists (delete, if so)
                            if dsNameThumb in obj.datastreams():
                                log.info("Deleting existing stream: %s" % dsNameThumb)
                                del obj[dsNameThumb]
                            obj.addDataStream(dsNameThumb, fc.getDSXml(r.type.name), label=h.safe_decode('tiny_thumbnail_%s_for_%s' % (sizename, resourceName)), mimeType=h.safe_decode('%s' % mimeType), controlGroup=controlGroup, logMessage=h.safe_decode('Storing thumbnail of size %dx%d for %s' % (x, y, resourceName)))
                            with open(compressedImagePath, "rb") as tempFile:
                                obj[dsNameThumb].setContent(tempFile)
                            os.remove(compressedImagePath)
                            os.remove(thumbImg.name)
                        except:
                            log.error("Error processing/addingDataStream for the thumbnail type: %s" %sizename)
                            log.error(traceback.format_exc())

                    log.info("Streams added successfully for png.")
                    successCount += 1

                shutil.rmtree(f.name, ignore_errors=True)                

            except Exception, e:
                log.error("Error compressing/uploading resource: %s" % str(e), exc_info=e)
                shutil.rmtree(f.name, ignore_errors=True)   
                failed_resourceIDs.append(r.id)
        
        if resources:
            self.userdata = json.dumps({'total': totalResourcesScanned, 'success': successCount, 'pngCount': pngCount, 'jpegCount': jpegCount, 'notPngOrJpegCount':notPngOrJpegCount, 'start_resourceid': resources[0].id, 'last_resourceid':resources[-1].id, 'failed': failed_resourceIDs})
        else:
            self.userdata = json.dumps({'total': totalResourcesScanned, 'success': successCount, 'pngCount': pngCount, 'jpegCount': jpegCount, 'notPngOrJpegCount':notPngOrJpegCount, 'start_resourceid': last_resourceid, 'last_resourceid':last_resourceid})

        self.updateTask()

    def _compressPNG(self, imagePath):
        ncolors = 256
        cmd = ["pngquant", "%s" % ncolors, "%s" % imagePath]
        p = subprocess.Popen(cmd)
        retcode = p.wait()

        compressedImagePath = self._getCompressedImagePath(imagePath)
        if not retcode and os.path.exists(compressedImagePath):
            #log.info("%s compressed successfully. Compressed image size %d" %(imagePath, os.path.getsize(compressedImageName)))
            return True

        return False

    def _getCompressedImagePath(self, imagePath):
        if imagePath.endswith('.png'):
            return imagePath[:-4] + '-fs8.png'
        else:
            return imagePath + '-fs8.png'

    def run(self, **kwargs):
        PeriodicTask.run(self, **kwargs)        
        
        ## Make sure we don't run again if already running/scheduled
        if self.isAlreadyRunning():
            return "Skipped"
        
        excludeIDs = []
        last_resourceid = -1
        while (True):
            lastTask = api.getLastTaskByName(name='CompressImagesTask', statusList=['SUCCESS'], excludeIDs = excludeIDs)
            if not lastTask:
                break
            if lastTask and lastTask.userdata:
                ud = json.loads(lastTask.userdata)
                if ud.has_key('last_resourceid'):
                    log.info("Found last successful task: %s" %lastTask)
                    last_resourceid = ud.get('last_resourceid')
                    break
            excludeIDs.append(lastTask.id)
        
        if last_resourceid != -1 : 
            self._compress_images(last_resourceid)
        
        else:
            raise Exception("Couldn't retrieve last successful task's userdata with last_resourceid!")

