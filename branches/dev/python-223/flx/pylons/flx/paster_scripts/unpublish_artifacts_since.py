import logging

import flx.lib.helpers as h
from flx.model import api, model, meta
from flx.controllers.common import ArtifactCache

LOG_FILENAME = '/tmp/uas.log'
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=50*1024*1024, backupCount=5)
log.addHandler(handler)

def run(since, typeName=None, creatorID=None):
    from time import mktime, strptime
    from datetime import datetime

    publishTime = datetime.fromtimestamp(mktime(strptime(since, '%Y-%m-%d %H:%M:%S')))
    log.info('Unpublishing artifacts since %s' % publishTime)
    session = meta.Session()
    session.begin()
    query = session.query(model.Artifact).distinct()
    if creatorID:
        query = query.filter(model.Artifact.creatorID == creatorID)
    else:
        query = query.filter(model.Artifact.creatorID != 3)
    if typeName:
        query = query.filter(model.Artifact.type.has(name = typeName))
    query = query.join(model.ArtifactRevision, model.ArtifactRevision.artifactID == model.Artifact.id)
    query = query.filter(model.ArtifactRevision.publishTime >= since)
    artifacts =  query.all()
    artifactIDs = []
    for artifact in artifacts:
        log.info('Unpublishing artifactID: [%s]' %(artifact.id))
        artifactRevisions = artifact.revisions
        for artifactRevision in artifactRevisions:
            if not artifactRevision.publishTime:
                continue
            if artifactRevision.publishTime < publishTime:
                break
            api._unpublishArtifactRevision(session, artifactRevision=artifactRevision, recursive=False, memberID=artifact.creatorID)
            api.invalidateArtifact(ArtifactCache(), artifact=artifact, recursive=False)
        artifactIDs.append(artifact.id)
    log.info('artifactIDs%s' % artifactIDs)
    session.commit()
    taskId = h.reindexArtifacts(artifactIDs, 1, recursive=False)
    log.info("unpublish artifacts. Task id[%s]" % taskId)
