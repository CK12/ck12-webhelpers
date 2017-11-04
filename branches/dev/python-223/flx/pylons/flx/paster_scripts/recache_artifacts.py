from flx.model import api
from flx.controllers.common import ArtifactCache

import logging

LOG_FILENAME = "/tmp/recache_artifacts.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=10*1024*1024, backupCount=5)
handler.setFormatter(formatter)
log.addHandler(handler)

def run(ownerID=3, typeName=None, recursive=False, invalidate=True, startPage=1):
    pageSize = 64
    pageNum = startPage
    total = 0
    cnt = 0
    if ownerID:
        owner = api.getMemberByID(id=ownerID)
        ownerID = owner.id
    while True:
        log.info("Getting page %d of size %d ..." % (pageNum, pageSize))
        artifacts = api.getArtifacts(typeName=typeName, ownerID=ownerID, pageSize=pageSize, pageNum=pageNum)
        if not artifacts:
            break
        total = artifacts.getTotal()
        for a in artifacts:
            try:
                cnt += 1
                log.info("[%d/%d] Processing artifact: [id: %d, ownerID: %s, title: %s, type: %s]" % (cnt, total, a.id, a.creatorID, a.getTitle(), a.type.name))
                if invalidate:
                    api.invalidateArtifact(ArtifactCache(), artifact=a, revision=a.revisions[0], recursive=recursive)
                ArtifactCache().load(id=a.id)
                log.info("Finished processing artifact: [id: %d]" % (a.id))
            except Exception, e:
                log.error("Error processing artifact: %s" % a.id, exc_info=e)
        pageNum += 1

