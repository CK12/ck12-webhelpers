from datetime import datetime
import logging

from flx.model import api
from flx.model import meta

LOG_FILENAME = "/tmp/artifacts_with_subjecteid.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=50*1024*1024, backupCount=5)
log.addHandler(handler)

def run(filepath):

    fd = open(filepath, 'r')
    artifactIDs = fd.readlines()
    for eachArtifactID in artifactIDs:
        eachArtifactID = eachArtifactID.strip()
        if not eachArtifactID:
            continue
        artifact = api.getArtifactByID(id=eachArtifactID)
        session = meta.Session()
        session.begin()
        if artifact:
            log.info('Artifact found. Updating the updateTime')
            artifact.updateTime = datetime.now()
            session.merge(artifact)
        session.commit()
