from flx.model import api
from flx.lib import helpers as h
from flx.controllers.common import ArtifactCache

import logging
from datetime import datetime

LOG_FILENAME = "/tmp/reindex_artifacts.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=10*1024*1024, backupCount=5)
handler.setFormatter(formatter)
log.addHandler(handler)

def help():
    print "reindex_artifacts.run(typeName, ownerID=None, notOwnerIDs=[], titleLike=None, recursive=False, invalidate=True, startPage=1, endPage=0)"
    print ""

def run(typeName, ownerID=None, notOwnerIDs=[], titleLike=None, encodedIDLike=None, updatedSince=None, collectionHandle=None, collectionCreatorID=None, recursive=False, invalidate=True, wait=False, startPage=1, endPage=0, dryRun=False):
    """
        Reindex artifacts by type name and optionally ownerID
        run(typeName, ownerID=None)
    """

    pageNum = startPage
    pageSize = 256
    log.info("Starting from page: %d, pageSize: %d" % (startPage, pageSize))
    seenArtifacts = set()
    reindexList = []
    count = 0
    sort = None
    if updatedSince:
        sort = 'updateTime,desc'
    filterDict = {}
    if collectionHandle:
        filterDict['collectionHandle'] = collectionHandle
        filterDict['collectionCreatorID'] = collectionCreatorID

    while True:
        print "Fetching %d artifacts, pageNum: %d" % (pageSize, pageNum)
        log.info("Fetching %d artifacts, pageNum: %d" % (pageSize, pageNum))
        artifacts = api.getArtifacts(typeName=typeName, ownerID=ownerID, sorting=sort, filterDict=filterDict, pageNum=pageNum, pageSize=pageSize)
        if not artifacts:
            break
        for a in artifacts:
            if a.id in seenArtifacts:
                continue
            seenArtifacts.add(a.id)
            if ownerID and a.creatorID != ownerID:
                continue
            elif notOwnerIDs and a.creatorID in notOwnerIDs:
                continue
            if titleLike and titleLike not in a.getTitle().lower():
                continue
            if encodedIDLike and encodedIDLike not in a.getEncodedId().upper():
                continue
            log.info("Adding to reindex queue: [%s]" % str(a.id))
            reindexList.append(a.id)
            count += 1
            if not dryRun and invalidate:
                api.invalidateArtifact(ArtifactCache(), artifact=a, revision=a.revisions[0])
                ArtifactCache().load(a.id)
        pageNum += 1

        if reindexList and len(reindexList) >= 100:
            log.info("Reindexing %d artifacts" % len(reindexList))
            print "Reindexing %d artifacts" % len(reindexList)
            if not dryRun:
                s = datetime.now()
                h.reindexArtifacts(reindexList, user=None, wait=wait, recursive=recursive)
                if wait:
                    log.info("Done reindexing. pageNum: %d, time: %s" % (pageNum, datetime.now()-s))
            reindexList = []

        if endPage and pageNum >= endPage:
            log.info("Reached page: %d" % pageNum)
            print "Reached page: %d" % pageNum
            break

        if updatedSince and a and a.updateTime < updatedSince:
            log.info("Found artifact with updateTime [%s] before updatedSince [%s]" % (a.updateTime, updatedSince))
            break

    if reindexList:
        log.info("Reindexing remaining %d artifacts" % len(reindexList))
        if not dryRun:
            h.reindexArtifacts(reindexList, user=None, wait=wait, recursive=recursive)

    print "All done! Processed: [%d]" % count
    log.info("All done! Processed: [%d]" % count)

