from flx.model import api
import logging

LOG_FILENAME = "/tmp/add_attachments_to_library.log"
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
                if not resource.isAttachment:
                    continue

                api.safeAddObjectToLibrary(objectID=resource.revisions[0].id, objectType='resourceRevision', memberID=resource.ownerID)
                log.info("Added resource %d to %d's library." % (resource.id, resource.ownerID))
            except Exception, e:
                log.error("Error adding resource to library: %s" % str(e), exc_info=e)
            
        pageNum += 1
