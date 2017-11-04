from flx.model import api, model, meta
import logging
import traceback

LOG_FILENAME = "/tmp/list_unplublished_concepts.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=50*1024*1024, backupCount=5)
log.addHandler(handler)
session = meta.Session()


def run(ownerID=3):
    """
        Create pseudodomain for artifacts by type name and optionally ownerID
        run(typeName, ownerID=None)
    """

    bookLevelArtifactTypes = ['book', 'tebook', 'studyguide', 'workbook', 'labkit', 'worksheet']
    for type in bookLevelArtifactTypes:
        pageNum = 1
        pageSize = 256
        log.info('Processing artifact of type: %s' %(type))
        while True:
            log.info("Fetching %d artifacts, pageNum: %d" % (pageSize, pageNum))
            artifactList = api.getArtifacts(typeName=type, ownerID=ownerID, pageNum=pageNum, pageSize=pageSize)
            if not artifactList:
                break
            for artifact in artifactList:
                #if ownerID and artifact.creatorID != ownerID:
                #    continue
                log.info('Processing book with artifactID: [%d]' %(artifact.id))
                artifactRevision = artifact.revisions[0]
                if not artifactRevision.publishTime:
                    log.info('\tBook with title: [%s], artifactID: [%d] is not published. Skipping...' %(artifact.getTitle().encode('utf-8'), artifact.id))
                    continue
                try:
                    if artifact.type.name not in bookLevelArtifactTypes:
                        continue
                    chapterList = artifactRevision.children
                    for chapter in chapterList:
                        if not chapter.child.publishTime:
                             log.info('\tChapter/Lesson/Section with title: [%s], artifactID: [%d], artifactRevisionID: [%d] is not published' %(chapter.child.artifact.getTitle().encode('utf-8'), chapter.child.artifact.id, chapter.child.id))

                        conceptList = chapter.child.children
                        if not conceptList:
                            conceptList = []
                        for concept in conceptList:
                            if not concept.child.publishTime:
                                log.info('\t\tLesson or Section with title: [%s], artifactID: [%d], artifactRevisionID: [%d] is not published' %(concept.child.artifact.getTitle().encode('utf-8'), concept.child.artifact.id, concept.child.id))
                except Exception as exceptObj:
                    log.error(traceback.format_exc())
            pageNum = pageNum + 1
