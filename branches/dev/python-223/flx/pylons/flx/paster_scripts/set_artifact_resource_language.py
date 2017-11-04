# Script to set language ID of XHTML resources for the spanish translataed version 
import logging
from flx.lib.helpers import reindexArtifacts
from flx.model import api
from flx.controllers.common import ArtifactCache

LOG_FILENAME = "/opt/2.0/log/set_artifact_resource_language.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=10*1024*1024, backupCount=30)
handler.setFormatter(formatter)
log.addHandler(handler)

reindexIdList = []
invalidatedArtifactID = []

def printToLog(message):
    print message
    log.debug(message)

def updateChilArtifactResourceLanguage(artifact, language):
    for child in artifact.revisions[0].children:
        try:
            childArtifact = api.getArtifactByID(child.child.artifactID)
            updateResourceLanguage(childArtifact, language)
            updateChilArtifactResourceLanguage(childArtifact, language)
        except Exception as ex:
            printToLog("Exception while updating artifact language [%s] : [%s], Skipped...." % (childArtifact.id, ex))

def updateResourceLanguage(artifact, language):
    resourceInfo = artifact.getResourceRevision(artifact.revisions[0], 'contents')
    printToLog("Updating resource language to [%s] for resource id: %s" % (language, resourceInfo.resourceID))
    api.updateResourceLanguage(resourceInfo.resourceID, language)
    try:
        artifactRevisions = api.getArtifactRevisionsForResource(resourceInfo.resourceID)
        for artifactRevision in artifactRevisions:
            artifactID = artifactRevision.artifactID
            if artifactID not in invalidatedArtifactID:
                printToLog("Invalidating Artifact Cache [%s]" % artifact.id)
                invalidatedArtifactID.append(artifactID)
                artifact = api.getArtifactByID(id=artifactID)
                api.invalidateArtifact(cache=ArtifactCache(), artifact=artifact, revision=artifactRevision, memberID=artifact.creatorID)
    except Exception, e:
        log.error('Artifact resource cache invalidation error %s' % str(e))

    reindexIdList.append(int(artifact.id))


def run(artifactID, language = 'spanish', recursive=True):
    printToLog("ArtifactID: %s" % artifactID)
    printToLog("language: %s" % language)
    printToLog("recursive: %s" % recursive)
    
    artifact = api.getArtifactByID(artifactID)
    invalidatedArtifactID = []
    if not artifactID:
        printToLog("Artifact(s) Does not exists")
        return 

    updateResourceLanguage(artifact, language)

    if recursive == True:
        updateChilArtifactResourceLanguage(artifact, language)
    api.invalidateArtifact(ArtifactCache(), artifact, memberID=artifact.creatorID, recursive=True)
    reindexArtifacts(artifactIds=reindexIdList)
    printToLog("Done...")
    
