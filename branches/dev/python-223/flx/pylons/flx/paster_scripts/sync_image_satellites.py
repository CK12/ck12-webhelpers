from flx.model import api
from flx.lib import helpers as h
from flx.controllers.eohelper import HeadRequest, HeadRedirectHandler
from tempfile import NamedTemporaryFile
import logging
import urllib2

import os, shutil

LOG_FILENAME = "/tmp/sync_image_satellites.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=10*1024*1024, backupCount=5)
handler.setFormatter(formatter)
log.addHandler(handler)

SRC_PREFIX = 'http://image-dev.ck12.org.s3-website-us-east-1.amazonaws.com/'
DEST_PREFIX = 'http://d3daypaozb97n7.cloudfront.net/'

"""
    Make sure to change the image satellite options in your development.ini to match the DEST server's options.
"""

new = 0
def urlExists(url):
    try:
        headOpener = urllib2.build_opener(HeadRedirectHandler())
        response = headOpener.open(HeadRequest(url))
        _url = response.geturl()
        return True
    except Exception, e:
        log.warn("Error making head request: %s" % str(e))
    return False

class HeadRequest(urllib2.Request):
    """
        Class that overloads an HTTP request to get just the HEAD and not the whole response.
    """
    def get_method(self):
        return 'HEAD'

def run():
    pageSize = 128
    pageNum = 1
    while True:
        r = api.getResources(pageNum=pageNum, pageSize=pageSize)
        if not r:
            break
        for resource in r:
            try:
                if resource.isExternal or resource.type.versionable or resource.type.streamable:
                    continue
                if not resource.satelliteUrl:
                    log.info("Skipping resource: %d. Satellite url does not exist!" % resource.id)
                    continue
                url = resource.satelliteUrl
                log.info("Resource: id: %d, type: %s, url: %s" % (resource.id, resource.type.name, url))

                newUrl = url.replace(SRC_PREFIX, DEST_PREFIX)
                if urlExists(newUrl):
                    log.info("Skipping %s. Already exists" % newUrl)
                    continue

                f = NamedTemporaryFile()
                f.close()
                os.makedirs(f.name)
                dlFile = h.safe_encode(os.path.join(f.name, resource.uri))
                h.urlretrieve(url, dlFile)

                log.info("Downloaded to file: %s, size: %d" % (dlFile, os.path.getsize(dlFile)))

                ## Re-save
                create_resource_satellite(dlFile, resourceType=resource.type.name, license=resource.license)
                shutil.rmtree(f.name, ignore_errors=True)
            except Exception, e:
                log.error("Error updating resource: %s" % str(e), exc_info=e)
            
        pageNum += 1
        log.info("Total new added: %d" % new)

def create_resource_satellite(resourcePath, resourceType, license=None):
    global new
    f = None
    try:
        log.info("Uploading image: %s" % resourcePath)
        type = api.getResourceTypeByName(name=resourceType)
        f = open(resourcePath, 'rb')
        sum, size = h.computeChecksum(contents=f)
        isNew, j = h.createRemoteResource(resourceType=type, isExternal=False, creator=3, name=os.path.basename(resourcePath), contents=f, checksum=sum, authors=None, licenseName='CC BY-NC-SA')
        if isNew:
            new += 1
        log.info("Satellite image: %s, New? [%s]" % (j['response']['uri'], str(isNew)))
    except Exception as e:
        log.error("Error creating remote resource: %s" % str(e), exc_info=e)
    finally:
        if f:
            f.close()

