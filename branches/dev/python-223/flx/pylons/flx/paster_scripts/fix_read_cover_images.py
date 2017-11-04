from flx.model import api, meta
from flx.lib.helpers import reindexArtifacts
from flx.controllers.common import ArtifactCache
import logging

LOG_FILENAME = "/tmp/fix_read_cover_images"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=50*1024*1024, backupCount=5)
log.addHandler(handler)
session = meta.Session()

def run():
    """
        Script to go through all lessons and concepts
        run()
    """
    pageSize = 100
    pageNum = 1
    reindexList = []
    types = ['lesson', 'concept']
    for eachType in types:
        while True:
            log.info("Fetching %d artifacts, pageNum: %d" % (pageSize, pageNum))
            artifactList = api.getArtifacts(typeName=eachType, pageNum=pageNum, pageSize=pageSize)
            if not artifactList:
                break
            for artifact in artifactList:
                log.info('Processing artifact with id: [%d], title: [%s]' %(artifact.id, artifact.getTitle()))
                reindexList.append(artifact.id)
                try:
                    for artifactRevision in artifact.revisions:
                        artifactRevisionID = artifactRevision.id
                        ## Loop through all the resource revisions
                        for rr in artifactRevision.resourceRevisions:
                            log.info('\tAnalyzing: [%s]' %(rr.resource.type.name))
                            # If the resource is a cover image and has a custom cover image
                            if rr.resource.type.name.startswith('cover page') and rr.resource.uri.endswith('cover_lesson_generic.png'):
                                resourceRevisionID = rr.id
                                log.info('\tRemoving artifactHasResource entry for artifactRevisionID: [%d], resourceRevisionID: [%d], resourceURI: [%s]' %(artifactRevisionID, resourceRevisionID, rr.resource.uri))
                                api.deleteArtifactHasResource(artifactRevisionID=artifactRevisionID, resourceRevisionID=resourceRevisionID)
                    api.invalidateArtifact(ArtifactCache(), artifact, recursive=True)

                except Exception as e:
                    log.error("ERROR processing artifactID: %s: %s" % (artifact.id, str(e)), exc_info=e)
            pageNum += 1
    log.info('Reindexing [%s] artifacts' %(len(reindexList)))
    reindexArtifacts(reindexList, user=None, recursive=True)
