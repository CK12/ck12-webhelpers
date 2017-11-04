from flx.model import api, model, meta
import flx.lib.artifact_utils as au
from flx.controllers.common import ArtifactCache
import logging
import os

LOG_FILENAME = "/tmp/delete_artifacts_no_resources.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=50*1024*1024, backupCount=5)
log.addHandler(handler)
session = meta.Session()

def run(ownerID=3, artifactTypes=[]):
    '''
    Delete artifacts ownned by CK-12 Editor which do not have any resources
    '''
    #typeName not used, instead using artifact types as 'lesson' and 'book'
    owner = api.getMemberByID(id=ownerID)
    ownerID = owner.id
    if not owner:
        return False
    excludeArtifacts = ['concept', 'lesson', 'asmtpractice', 'asmtquiz', 'asmttest']

    if not artifactTypes:
        artifactTypes = api.getArtifactTypes(modalitiesOnly=True)
        artifactTypes = [x.name for x in artifactTypes]
    for artifactType in excludeArtifacts:
        artifactTypes.remove(artifactType)

    noArtifacts = 0
    deletableArtifacts = []
    deletableArtifactsByTypes = {}
    for artifactType in artifactTypes:
        #Get all artifacts for each artifact type, owened if ck12
        print "Checking for artifacts of type [%s]" % (artifactType)
        log.info("Checking for artifacts of type [%s]" % (artifactType))
        artifacts = api.getArtifactsByOwner(owner=owner, typeName=artifactType)
        for artifact in artifacts:
            log.info('Processing artifact artifactID: [%s]' %(artifact.id))
            resourceCount = artifact.revisions[0].getResourceCounts()
            count = sum(resourceCount.values())
            if count <= 0:
                log.info('Artifact with artifactID: [%s] needs to be deleted' %(artifact.id))
                deletableArtifacts.append(artifact)
                if deletableArtifactsByTypes.has_key(artifactType):
                    deletableArtifactsByTypes[artifactType].append(artifact.id)
                else:
                    deletableArtifactsByTypes[artifactType] = [artifact.id]
                noArtifacts += 1

    for artifact in deletableArtifacts:
        log.info("Deleting artifact: [%s]" %(artifact.id))
        try:
            api.deleteArtifactByID(id=artifact.id, recursive=False)
        except:
            pass
        api.invalidateArtifact(ArtifactCache(), artifact, recursive=True)

    for artifact in deletableArtifacts:
        from flx.lib.helpers import reindexArtifacts
        reindexArtifacts(artifact.id, user=None)


    print 'No of artifacts deleted: [%s]' %(noArtifacts)
    print 'Arifacts deleted: %s' %(deletableArtifacts)


