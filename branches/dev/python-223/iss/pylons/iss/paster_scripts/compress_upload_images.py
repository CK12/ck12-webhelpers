"""
30th Dec 2015
Paster Script to compress all png images using pngquant library, jpeg images using jpegMini and store as datastreams on FC. 
Can run this script simulataneously on multiple instances as different processes each of which is given a 'processNum' and totalProcesses defines the total processes to be run simultaneouly. The script will divide the images equally among all these processes.   
For each process, you can choose the number of threads referred to using 'threadCount', for multi-threading

Make sure that sqlalchemy.url points to flx2img in development.ini when executing this script

Author: Rahul Nanda

Call the function 'timeitRun' with the appropriate parameters to run the sript.
Update the value of 'jpegmini_server' if it changes.
"""
from flx.model import api, model, meta
from flx.lib import helpers as h
from flx.lib.fc import fcclient
from pylons import config
from tempfile import NamedTemporaryFile
import logging, subprocess, traceback

import os, shutil, time, threading, imghdr, urllib, requests

def myLog(threadNum):
    LOG_FILENAME = "/tmp/compress_resource_and_upload%d.log" %threadNum
    log = logging.getLogger(__name__ + ".thread%d" %threadNum)
    log.setLevel(logging.DEBUG)
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=10*1024*1024, backupCount=5)
    handler.setFormatter(formatter)
    log.handlers = []
    log.addHandler(handler)
    return log

session = meta.Session()

"""
    startImgNo is the resource no. to start with
    countT is the total no. of resources to scan.
"""
def run(startImgNo=0, countT=1, log=None, resourceIDs=[], force=False):
    if not log:
        log = myLog(0)
    pageSize = 1000
    if resourceIDs:
        startImgNo = 0
        countT = len(resourceIDs)
    if countT < pageSize:
        pageSize=countT
    pageNum = startImgNo/pageSize + 1
    count = countT/pageSize #+ 1
    pid_prefix_dl = 'f-d:'
    thumbnailSizes = {"POSTCARD": (500, 500), "LARGE": (192, 192), "SMALL": (95, 95)}
    
    originalImageStreamList = ["IMAGE", "IMAGE_THUMB_POSTCARD", "IMAGE_THUMB_LARGE", "IMAGE_THUMB_SMALL"]
    originalCoverPageStreamList = ["COVER_PAGE", "COVER_PAGE_THUMB_POSTCARD", "COVER_PAGE_THUMB_LARGE", "COVER_PAGE_THUMB_SMALL"]

    newImageStreamList = []
    newCoverPageStreamList = []
    for oisname,ocsname in zip(originalImageStreamList, originalCoverPageStreamList):
        newImageStreamList.append(oisname + "_TINY") 
        newCoverPageStreamList.append(ocsname + "_TINY") 
    
    jpegmini_server = config.get("iss_optimize_host", "iss-optimize.ck12.org")
    fc = fcclient.FCClient()
    fedoraObjectsNotFound = resourcesScannedCount = resourcesSuccessCount = notPngOrJpegCount = streamsAlreadyExistCount = jpegCount = 0     
    while count>0:
        count-=1
        ck12editor = api._getUnique(session, model.Member, 'login', 'ck12editor')
        if resourceIDs:
            resources = api.getResources(ids=resourceIDs)
        else:
            resources = api.getResourcesByOwner(ownerID = ck12editor.id, typeName = 'image', pageNum=pageNum, pageSize=pageSize)
        pageNum += 1
        if not resources:
            break
        for r in resources:
            if r.isExternal:
                continue
            try:
                resourcesScannedCount += 1
                resourceName = r.name
                url = r.satelliteUrl
 
                obj = fc.getResourceObject(id=r.checksum)
                pid = h.safe_decode('%s%s' % (pid_prefix_dl, r.checksum))
                
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

                # Check if streams already exist
                dsList = fc.client.listDatastreams(pid)
                if set(newStreamList).issubset(set(dsList)):
                    log.info("Streams already exist for resource id %d." %r.id)
                    streamsAlreadyExistCount += 1
                    if not force:
                        log.info("No force specified. Skipping ...")
                        continue

                log.info("Resource: id: %d, type: %s, url: %s, name: %s, checksum: %s" % (r.id, r.type.name, url, r.name, r.checksum))
                
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

                ## Do not use HTTPS urls for cloudfront since we do not have support for TLS in Python 2.7.6
                urlToGet = url.replace("https://", "http://") if 'cloudfront.net/' in url else url
                h.urlretrieve(urlToGet, dlFile)

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
                        try:
                            content = obj[oDSName].getContent()
                        except Exception, e:
                            log.error("No datastream: %s for the image resource" %oDSName)
                            continue
                        if cDSName in obj.datastreams():
                            del obj[cDSName]
                            log.info("Deleted existing stream: %s" % cDSName)
                        obj.addDataStream(cDSName, fc.getDSXml(r.type.name), label=label, mimeType=h.safe_decode('%s' % mimeType), 
                                controlGroup=controlGroup, logMessage=h.safe_decode('Storing compressed %s' % r.type.name)) 
                        ftemp = NamedTemporaryFile()
                        ftemp.close()
                        with open(ftemp.name, "wb") as fd:
                            fd.write(content.read())
                        with open(ftemp.name, "rb") as fd:
                            obj[cDSName].setContent(fd)
                        log.info("Copied datastream content from %s to %s for non-png resource id: %d, name: %s" %(oDSName, cDSName, r.id, r.name))
                elif imghdr.what(dlFile) == 'jpeg':
                    """Using JPEGmini for jpeg compression
                       For our satellite URLs, JPEGmini REST API is working when the url is twice encoded. 
                    """
                    jpegCount += 1
                    encodedURL = urllib.quote(urllib.quote(urlToGet))
                    label = h.safe_decode('tiny_%s' % resourceName)
                    
                    for cDSName,oDSName in zip(newStreamList, originalStreamList):
                        log.info("Processing %s, %s" % (cDSName, oDSName))
                        if("THUMB" in oDSName):
                            label = h.safe_decode('tiny_thumbnail_%s_for_%s' %(oDSName.split('_')[-1], resourceName))
                            thumbSatelliteURL = urlToGet.replace(dsid, oDSName)
                            encodedURL = urllib.quote(urllib.quote(thumbSatelliteURL))
                        #compress image by passing its url and then download the compressed image
                        log.debug("encodedURL[%s]" % (encodedURL))
                        response = requests.get(url="http://%s/api/v1/proxy?url=%s" % (
                                jpegmini_server, encodedURL), stream=True)
                        log.info("status code:%s headers:%s" %(response.status_code, response.headers))
                        if response.status_code == 200:
                            fjpeg = NamedTemporaryFile()
                            fjpeg.close()
                            with open(fjpeg.name, "wb") as fd:
                                for chunk in response.iter_content(chunk_size=128):
                                    fd.write(chunk)
                            ## Check if the stream exists (delete, if so)
                            if cDSName in obj.datastreams():
                                del obj[cDSName]
                                log.info("Deleted existing stream: %s" % cDSName)

                            ## Add the new stream
                            obj.addDataStream(cDSName, fc.getDSXml(r.type.name), label=label, mimeType=h.safe_decode('%s' % mimeType), 
                                    controlGroup=controlGroup, logMessage=h.safe_decode('Storing compressed %s' % r.type.name)) 
                            with open(fjpeg.name, "rb") as fd:
                                obj[cDSName].setContent(fd)
                            log.info("Added datastream: %s using jpegmini" %cDSName)
                        else:
                            if cDSName not in obj.datastreams():
                                obj.addDataStream(cDSName, fc.getDSXml(r.type.name), label=label, mimeType=h.safe_decode('%s' % mimeType), 
                                        controlGroup=controlGroup, logMessage=h.safe_decode('Storing compressed %s' % r.type.name)) 
                                try:
                                    content = obj[oDSName].getContent()
                                except Exception, e:
                                    log.error("No datastream: %s for the image resource" %oDSName)
                                    continue
                                obj[cDSName].setContent(content.read())
                                log.info("Copied datastream content from %s to %s for JPEG resource id: %d, name: %s" %(oDSName, cDSName, r.id, r.name))
                elif imghdr.what(dlFile) == 'png':
                    """
                        We use pngquant for png image compression
                    """
                    if not compressPNG(dlFile):
                        log.info("Compression of the file %s failed." % dlFile)
                        continue
                                               
                    compressedImagePath = getCompressedImagePath(dlFile)

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
                            dsNameThumb = fc.getDSName(r.type.name, 'thumb_%s_tiny' % sizename)
                            dsNameThumbOrig = fc.getDSName(r.type.name, 'thumb_%s' % sizename)
                            thumbImg = fc.getThumbnail(dlFile, width=x, height=y, animated=False)
                            if not mimeType:
                                mimeType = 'application/binary'
                            
                            compressedImagePath = getCompressedImagePath(thumbImg.name)
                            if not compressPNG(thumbImg.name):
                                log.info("(Cfail) Compression of the file %s failed." % thumbImg.name)
                                if os.path.exists(compressedImagePath):
                                    os.remove(compressedImagePath)
                                os.remove(thumbImg.name)
                                continue

                            ## Check if the stream exists (delete, if so)
                            if dsNameThumb in obj.datastreams():
                                del obj[dsNameThumb]
                                log.info("Deleted existing stream: %s" % dsNameThumb)

                            obj.addDataStream(dsNameThumb, fc.getDSXml(r.type.name), label=h.safe_decode('tiny_thumbnail_%s_for_%s' % (sizename, resourceName)), 
                                    mimeType=h.safe_decode('%s' % mimeType), controlGroup=controlGroup, 
                                    logMessage=h.safe_decode('Storing thumbnail of size %dx%d for %s' % (x, y, resourceName)))
                            with open(compressedImagePath, "rb") as tempFile:
                                obj[dsNameThumb].setContent(tempFile)
                            os.remove(compressedImagePath)
                            os.remove(thumbImg.name)
                        except Exception as pnge:
                            log.error("Error processing/addingDataStream for the thumbnail type: %s" %sizename, exc_info=pnge)
                            ## Fix data streams
                            if dsNameThumb not in obj.datastreams():
                                obj.addDataStream(dsNameThumb, fc.getDSXml(r.type.name), label=label, mimeType=h.safe_decode('%s' % mimeType), 
                                        controlGroup=controlGroup, logMessage=h.safe_decode('Storing compressed %s' % r.type.name)) 
                                try:
                                    content = obj[dsNameThumbOrig].getContent()
                                except Exception, e:
                                    log.error("No datastream: %s for the image resource" % dsNameThumbOrig)
                                    continue
                                obj[dsNameThumb].setContent(content.read())
                                log.info("Copied datastream content from %s to %s for JPEG resource id: %d, name: %s" %(dsNameThumbOrig, dsNameThumb, r.id, r.name))

                    log.info("Streams added successfully.")
                    resourcesSuccessCount += 1

                shutil.rmtree(f.name, ignore_errors=True)                

            except Exception, e:
                log.error("Error compressing/uploading resource: %s" % str(e), exc_info=e)
                shutil.rmtree(f.name, ignore_errors=True)                
            
    log.info("\n *** \n Summary: fedoraObjectsNotFound: %d streamsAlreadyExistCount: %d notPngOrJpegCount: %d resourcesScannedCount: %d resourcesSuccessCount: %d jpegCount: %d" %(fedoraObjectsNotFound, streamsAlreadyExistCount, notPngOrJpegCount, resourcesScannedCount, resourcesSuccessCount, jpegCount))

def compressPNG(imagePath):
    ncolors = 256
    cmd = ["pngquant", "%s" % ncolors, "%s" % imagePath]
    p = subprocess.Popen(cmd)
    retcode = p.wait()

    compressedImagePath = getCompressedImagePath(imagePath)
    if not retcode and os.path.exists(compressedImagePath):
        #log.info("%s compressed successfully. Compressed image size %d" %(imagePath, os.path.getsize(compressedImageName)))
        return True

    return False

def getCompressedImagePath(imagePath):
    if imagePath.endswith('.png'):
        return imagePath[:-4] + '-fs8.png'
    else:
        return imagePath + '-fs8.png'
        
def timeitRun(**args):
    startTime = time.time()
    #run(**args)
    i = main(**args)
    t = time.time() - startTime
    log = myLog(0)
    log.info("total time: %f" %t)
    print "total time: %f" %t
    print "time per image: %f" %(t/i)

def main(processNum, threadCount=1, totalProcesses = 3, totalImages = 100):
    
    countP = totalImages/totalProcesses #ImageCount for each process

    countT = countP/threadCount + 1 #ImageCount for each thread
         
    startImgNo = (processNum-1)*countP + 1 
    
    lock = threading.Lock()
    for i in range(threadCount):
        log = myLog(i+1)
        t = threading.Thread(target=run, args=(startImgNo, countT, log))
        t.start()
        startImgNo += countT

    main_thread = threading.currentThread()
    for t in threading.enumerate():
        if t is main_thread:
            continue
        t.join()

    return threadCount*countT
