from flx.model import api, model
import logging
import os

LOG_FILENAME = "/tmp/remove_attachments.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=50*1024*1024, backupCount=5)
handler.setFormatter(formatter)
log.addHandler(handler)

RESOURCE_TYPES_MAP = {
        'lessonplan': 'lessonplan',
        'studyguide': 'studyguide',
        'web': 'web',
        'studyguide': 'studyguide',
        'image': 'image',
        'audio': 'audio',

        'attachment': 'attachment',
        }

def run(ownerID=3):
    """
        Create pseudodomain for artifacts by type name and optionally ownerID
        run(typeName, ownerID=None)
    """

    reindexList = []
    processedAttachments = {}
    deletedAssociations = 0
    typeList = ['lesson', 'concept']
    for type in typeList:
        pageNum = 1
        pageSize = 256
        while True:
            log.info("Fetching %d artifacts, pageNum: %d" % (pageSize, pageNum))
            artifacts = api.getArtifacts(typeName=type, pageNum=pageNum, pageSize=pageSize)
            if not artifacts:
                break
            for a in artifacts:
                try:
                    if ownerID and a.creatorID != ownerID:
                        continue
                    ## Convert attachments to modalities

                    for rr in a.revisions[0].resourceRevisions:
                        if rr.resource.isAttachment and rr.resource.ownerID == ownerID:
                            ## Get all associated artifacts
                            ars = api.getArtifactRevisionsForResource(resourceID=rr.resource.id)
                            for ar in ars:
                                modalityExists = False
                                if ar.artifact.creatorID == ownerID and ar.artifact.artifactTypeID != a.artifactTypeID and ar.artifact.type.modality:
                                    if api.getRelatedArtifactsForArtifact(artifactID=ar.artifact.id):
                                        log.info("Modality %s exists for resource %s [%s]" % (ar.artifact.type.name, rr.resource.handle, rr.resource.type.name))
                                        modalityExists = True
                                        break
                            if modalityExists:
                                log.info("Deleting resource association for %s [%s] with %s [%s]" % (a.handle, a.type.name, rr.resource.handle, rr.resource.type.name))
                                api.deleteArtifactHasResource(artifactRevisionID=a.revisions[0].id, resourceRevisionID=rr.id)
                                reindexList.append(a.id)
                                deletedAssociations += 1
                            processedAttachments[rr.resource.id] = a.id

                except Exception as e:
                    log.error("ERROR processing artifactID: %s: %s" % (a.id, str(e)), exc_info=e)
            pageNum += 1

    if reindexList:
        log.info("Reindexing %d artifacts" % len(reindexList))
        from flx.lib.helpers import reindexArtifacts
        reindexArtifacts(reindexList, user=None, recursive=True)
    log.info("Deleted %d associations." % deletedAssociations)


