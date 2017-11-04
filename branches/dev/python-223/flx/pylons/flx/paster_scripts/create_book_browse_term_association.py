#
#  Loop through artifact's children.
#  Book -> 
#        Chapter ->
#                  Lessons
#
#  For each lesson, look up the related artifacts and get the domainID(s) of termTypeID: 4
#  -- If more than domainID of type 4 get the first one.
#    api.getRelatedArtifactsForArtifact(artifactID)
#    createArtifactHasBrowseTerm(artifactID=%s, browseTermID=%s)
#
# Usage: run([artifactID(s)])
#   @params: list of artifactID(s)
#
# Felix Nance 7/8/2014

from flx.model import api
from flx.controllers.common import ArtifactCache
from flx.lib.helpers import reindexArtifacts
import logging

LOG_FILENAME = "/tmp/create_book_browse_term_association.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=50*1024*1024, backupCount=5)
log.addHandler(handler)

def _createBrowseTerm(artifact):

  artifactID = artifact.id
  print "Processing artifact: %s"%artifactID
  log.info("Processing artifact: %s"%artifactID)

  related_artifacts = api.getRelatedArtifactsForArtifact(artifactID)
  browseTermID = None
  # Get the first browse term of type 4
  browseTermIDs = filter( lambda x: x.domain.termTypeID==4,related_artifacts.results)
  if browseTermIDs:
    browseTermID = browseTermIDs[0].domain.id

    try:
      log.info("Calling createArtifactHasBrowseTerm(artifactID=%s, browseTermID=%s)"%(artifactID,browseTermID))
      print "Calling createArtifactHasBrowseTerm(artifactID=%s, browseTermID=%s)"%(artifactID,browseTermID)
      api.createArtifactHasBrowseTerm(artifactID=artifactID, browseTermID=browseTermID)

      log.info("Calling invalidateArtifact(ArtifactCache(ArtifactCache(),artifact)")
      print "Calling invalidateArtifact(ArtifactCache(ArtifactCache(),artifact)"
      api.invalidateArtifact(ArtifactCache(),artifact)
      log.info("Calling ArtifactCache().load(%s)"%artifactID)
      print "Calling ArtifactCache().load(%s)"%artifactID
      ArtifactCache().load(artifactID)
    
    except:
      log.error("Error creating browseTerm for artifact: %s"%artifactID)
      print "Error creating browseTerm for artifact: %s"%artifactID

  else:
    print "Browseterms not found for artifact: %s"%artifactID
    log.error("Browse term not found for artifact: %s"%artifactID)

def run(artifactIDs):
  if type(artifactIDs) != list:
    print "Must pass in a list of artifact ids"
    return
  for artifact_id in artifactIDs:
    # Get the book using artifactID
    artifact = api.getArtifactByID(artifact_id)
    if not artifact:
      log.info("Could not get artifact. Check artifactID: %s"%(artifact_id))
      print "Error could not get artifact. Check artifactID: %s"%(artifact_id)
      return
    else:
      # Get chapters
      chapters = artifact.getChildren()
      # if chapter is lesson create browse term
      # else get setions of chapter
      if chapters:
        for chapter in chapters:
          if chapter.artifactTypeID == 3:
            _createBrowseTerm(chapter)
          else:
            for section in chapter.getChildren():
              _createBrowseTerm(section)
