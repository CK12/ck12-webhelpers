import re
import urllib
from urlparse import urlparse, parse_qs
import logging

from flx.model import api

IFRAME_REGEX = re.compile('<iframe.*?>[ ]*</iframe>', re.DOTALL)
OBJECT_REGEX = re.compile(r'<object(.+?)</object>', re.DOTALL)
SRC_REGEX = re.compile('src="(.*?)"')
SRC2_REGEX = re.compile('<param name="src" value="(.*?)"[\s]*/>')


LOG_FILENAME = "/tmp/disable_related_videos.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=10*1024*1024, backupCount=5)
handler.setFormatter(formatter)
log.addHandler(handler)

def updateSrc(src):
    parseResult = urlparse(src)
    queryDict = parse_qs(parseResult.query)
    queryDict['wmode'] = ['transparent']
    queryDict['rel'] = ['0']
    newSrc = parseResult.scheme + '://' + parseResult.netloc + parseResult.path + "?" + urllib.urlencode(queryDict, True)
    return newSrc

def disableRelatedVideos(youtube_code):
    iframeString = IFRAME_REGEX.findall(youtube_code)
    objectString = OBJECT_REGEX.findall(youtube_code)
    updatedYoutubeCode = youtube_code
    if iframeString:
        iframeString = iframeString[0]
        srcMatch = SRC_REGEX.search(iframeString)
        if srcMatch:
            src = srcMatch.group(1)
            newSrc = updateSrc(src)
            updatedYoutubeCode = youtube_code.replace(src, newSrc)
    elif objectString:
            objectString = objectString[0]
            srcMatch = SRC_REGEX.search(objectString)
            if srcMatch:
                src = srcMatch.group(1)
                newSrc = updateSrc(src)
                updatedYoutubeCode = youtube_code.replace(src, newSrc)
            else:
                srcMatch = SRC2_REGEX.search(objectString)
                if srcMatch:
                    src = srcMatch.group(1)
                    newSrc = updateSrc(src)
                    updatedYoutubeCode = youtube_code.replace(src, newSrc)

    log.info('Updated Youtube Code: %s' %(updatedYoutubeCode))
    return updatedYoutubeCode


def start():
    pageNum = 1
    pageSize = 10
    count = 0
    while True:
        page = api.getEmbeddedObjects(pageNum=pageNum, pageSize=pageSize)
        #page = [api.getEmbeddedObjectByID(id=45118)]
        if not page:
            print 'Completed processing [%s] EmbeddedObjects. Exiting...' %(count)
            break
        for eachEntry in page:
            if eachEntry.code and eachEntry.type == 'youtube':
                print '\tProcessing embeddedObject with id: [%s]' %(eachEntry.id)
                try:
                    updateIframeCode = disableRelatedVideos(eachEntry.code)
                    api.updateEmbeddedObject(id=eachEntry.id, code=updateIframeCode)
                    count = count + 1
                except Exception as e:
                    log.error('\tException in processing embeddedObject with id: [%s]' %(eachEntry.id))
                    log.error(e.__str__())
        pageNum = pageNum + 1
    log.info('Completed processing [%s] EmbeddedObjects. Exiting...' %(count))
    log.info('*'*100)
