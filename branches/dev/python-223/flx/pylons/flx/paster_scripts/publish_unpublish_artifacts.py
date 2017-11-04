from flx.model import api
from flx.lib import helpers as h
from flx.controllers.common import ArtifactCache

import logging

LOG_FILENAME = "/tmp/publish_unpublish_artifacts.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=10*1024*1024, backupCount=5)
handler.setFormatter(formatter)
log.addHandler(handler)

def publish(typeName, ownerID=None, notOwnerIDs=[], titleLike=None, encodedIDLike=None, updatedSince=None, startPage=1, endPage=0):
    """
        Publish artifacts by type name and optionally ownerID
        publish(typeName, ownerID=None)
    """

    __run(typeName=typeName, mode='publish', ownerID=ownerID, notOwnerIDs=notOwnerIDs, titleLike=titleLike, encodedIDLike=encodedIDLike, updatedSince=updatedSince, startPage=startPage, endPage=endPage)

def unpublish(typeName, ownerID=None, notOwnerIDs=[], titleLike=None, encodedIDLike=None, updatedSince=None, startPage=1, endPage=0):
    """
        Unpublish artifacts by type name and optionally ownerID
        unpublish(typeName, ownerID=None)
    """

    __run(typeName=typeName, mode='unpublish', ownerID=ownerID, notOwnerIDs=notOwnerIDs, titleLike=titleLike, encodedIDLike=encodedIDLike, updatedSince=updatedSince, startPage=startPage, endPage=endPage)

def __run(typeName, mode='unpublish', ownerID=None, notOwnerIDs=[], titleLike=None, encodedIDLike=None, updatedSince=None, startPage=1, endPage=0):

    if mode not in ['publish', 'unpublish']:
        raise Exception("Invalid mode: %s" % mode)

    pageNum = startPage
    pageSize = 256
    log.info("Starting from page: %d, pageSize: %d" % (startPage, pageSize))
    reindexList = []
    count = 0
    sort = None
    if updatedSince:
        sort = 'updateTime,desc'
    while True:
        print "Fetching %d artifacts, pageNum: %d" % (pageSize, pageNum)
        log.info("Fetching %d artifacts, pageNum: %d" % (pageSize, pageNum))
        artifacts = api.getArtifacts(typeName=typeName, ownerID=ownerID, sorting=sort, pageNum=pageNum, pageSize=pageSize)
        if not artifacts:
            break
        for a in artifacts:
            if ownerID and a.creatorID != ownerID:
                continue
            elif notOwnerIDs and a.creatorID in notOwnerIDs:
                continue
            if titleLike and titleLike not in a.getTitle().lower():
                continue
            if encodedIDLike and encodedIDLike not in a.getEncodedId().upper():
                continue
            artifactRevision = a.revisions[0]
            if mode == 'unpublish' and artifactRevision.publishTime:
                log.info('Unpublishing artifactID: [%s]' %(a.id))
                api.unpublishArtifactRevision(artifactRevision=artifactRevision, recursive=True, memberID=a.creatorID, cache=ArtifactCache()) 
            elif mode == 'publish' and artifactRevision.publishTime == None:
                log.info('Publishing artifactID: [%s]' %(a.id))
                api.publishArtifactRevision(artifactRevision=artifactRevision, recursive=True, memberID=a.creatorID, cache=ArtifactCache()) 
            else:
                log.info("No need to change publish state for [%s]. Skipping ..." % a.id)
                continue
            log.info("Adding to reindex queue: [%s]" % str(a.id))
            reindexList.append(a.id)
            count += 1
            ## Reload cache
            ArtifactCache().load(a.id)
        pageNum += 1

        if reindexList and len(reindexList) >= 100:
            log.info("Reindexing %d artifacts" % len(reindexList))
            print "Reindexing %d artifacts" % len(reindexList)
            h.reindexArtifacts(reindexList, user=None, recursive=True)
            reindexList = []

        if endPage and pageNum >= endPage:
            log.info("Reached page: %d" % pageNum)
            print "Reached page: %d" % pageNum
            break

        if updatedSince and a and a.updateTime < updatedSince:
            log.info("Found artifact with updateTime [%s] before updatedSince [%s]. Stopping scan." % (a.updateTime, updatedSince))
            break

    if reindexList:
        log.info("Reindexing remaining %d artifacts" % len(reindexList))
        h.reindexArtifacts(reindexList, user=None, recursive=True)

    print "All done! Processed: [%d]" % count
    log.info("All done! Processed: [%d]" % count)

