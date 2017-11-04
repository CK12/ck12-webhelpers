import logging

from flx.model import api

LOG_FILENAME = "/tmp/unpublish_artifacts.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=50*1024*1024, backupCount=5)
log.addHandler(handler)

def run(filepath, memberID):

    fd = open(filepath, 'r')
    artifactIDs = fd.readlines()
    for eachArtifactID in artifactIDs:
        eachArtifactID = eachArtifactID.strip()
        if not eachArtifactID:
            continue
        artifact = api.getArtifactByID(id=eachArtifactID)
        artifactRevision = artifact.revisions[0]
        log.info('Unpublishing artifactID: [%s]' %(artifact.id))
        api.unpublishArtifactRevision(artifactRevision=artifactRevision, recursive=True, memberID=memberID)
