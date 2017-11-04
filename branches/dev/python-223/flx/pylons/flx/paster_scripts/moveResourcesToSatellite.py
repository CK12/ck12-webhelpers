from flx.model import api
from flx.lib import helpers as h
from tempfile import NamedTemporaryFile
import logging

import os, shutil

LOG_FILENAME = "/tmp/move_to_satellite.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=10*1024*1024, backupCount=5)
handler.setFormatter(formatter)
log.addHandler(handler)

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
                if resource.satelliteUrl:
                    log.info("Skipping resource: %d. Satellite url exists!" % resource.id)
                    continue
                url = resource.getUri(oldStyle=True, local=True)
                log.info("Resource: id: %d, type: %s, url: %s" % (resource.id, resource.type.name, url))
                f = NamedTemporaryFile()
                f.close()
                os.makedirs(f.name)
                dlFile = h.safe_encode(os.path.join(f.name, resource.uri))
                h.urlretrieve(url, dlFile)

                log.info("Downloaded to file: %s, size: %d" % (dlFile, os.path.getsize(dlFile)))

                ## Re-save
                updateResource(resource, dlFile)
                shutil.rmtree(f.name, ignore_errors=True)
            except Exception, e:
                log.error("Error updating resource: %s" % str(e), exc_info=e)
            
        pageNum += 1

def updateResource(resource, file):
    resourceDict = {}
    resourceDict['id'] = resource.id
    resourceDict['resourceType'] = resource.type
    resourceDict['resourceName'] = resource.name
    resourceDict['resourceDesc'] = resource.description
    resourceDict['ownerID'] = resource.ownerID
    resourceDict['isExternal'] = False
    resourceDict['uriOnly'] = False
    resourceDict['resourceRevision'] = api.getResourceRevisionsByIDs(ids=[resource.revisions[0].id])[0]
    resourceDict['uri'] = open(file, 'rb')

    (resourceRevision, copied, versioned) = api.updateResource(resourceDict=resourceDict, member=resource.owner, commit=True)
    log.info("Updated resource: %s" % resourceRevision.resource.id)

