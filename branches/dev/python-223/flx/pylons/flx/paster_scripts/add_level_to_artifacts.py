import logging

from flx.model import api,model,meta
import flx.lib.helpers as h
from flx.controllers.common import ArtifactCache

LOG_FILENAME = "/tmp/add_level_to_artifacts.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=50*1024*1024, backupCount=5)
log.addHandler(handler)

def run(filepath):

    levelBrowseTermType = api.getBrowseTermTypeByName(name='level')
    atGradeBrowseTerm = api.getBrowseTerm(name='at grade', browseTermTypeID=levelBrowseTermType.id)
    atGradeBrowseTermID = atGradeBrowseTerm.id

    fd = open(filepath, 'r')
    artifactIDs = fd.readlines()
    reIndexArtifactIDs = []
    total = len(artifactIDs)
    i = 0
    for eachArtifactID in artifactIDs:
        eachArtifactID = eachArtifactID.strip()
        i = i + 1
        if not eachArtifactID:
            continue
        eachArtifactID = int(eachArtifactID)
        log.info('Processing artifactID: [%s]' %(eachArtifactID))
        artifact = api.getArtifactByID(id=eachArtifactID)
        if not artifact:
            continue
        log.info('\tCreating AHBT entry')
        ahbt = api.createArtifactHasBrowseTerm(artifactID=eachArtifactID, browseTermID=atGradeBrowseTermID)
        if ahbt:
            reIndexArtifactIDs.append(eachArtifactID)
            log.info('\tInvalidating artifact cache')
            api.invalidateArtifact(ArtifactCache(), artifact=artifact, recursive=False)
            log.info('\tRecaching artifact')
            ArtifactCache().load(id=eachArtifactID)
            log.info('\tAt Grade level set for artifactID: [%s] - [%d/%d]' %(eachArtifactID, i, total))
        else:
            log.info('Unable to set At Grade level for artifactID: [%s]' %(eachArtifactID))

    log.info('artifactIDs: [%s]' %(reIndexArtifactIDs))
    taskID = h.reindexArtifacts(reIndexArtifactIDs, 1, recursive=False)
    log.info("Reindexing artifacts. TaskID: [%s]" %(taskID))
