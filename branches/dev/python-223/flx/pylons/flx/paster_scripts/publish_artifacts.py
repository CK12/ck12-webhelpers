import logging

from flx.controllers.common import ArtifactCache
from flx.model import api
from flx.lib import helpers as h

LOG_FILENAME = "/tmp/publish_artifacts.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=50*1024*1024, backupCount=5)
log.addHandler(handler)

def run(filepath, memberID):

    toReindex = {}
    fd = open(filepath, 'r')
    artifactIDs = fd.readlines()
    for eachArtifactID in artifactIDs:
        eachArtifactID = eachArtifactID.strip()
        if not eachArtifactID:
            continue
        artifact = api.getArtifactByID(id=eachArtifactID)
        if artifact:
            if not toReindex.has_key(eachArtifactID):
                toReindex[eachArtifactID] = True
            artifactRevision = artifact.revisions[0]
            log.info('Publishing artifactID: [%s]' %(artifact.id))
            api.publishArtifactRevision(artifactRevision=artifactRevision, recursive=True, cache=ArtifactCache())
    if toReindex:
        h.reindexArtifacts(artifactIds=toReindex.keys(), wait=False)
