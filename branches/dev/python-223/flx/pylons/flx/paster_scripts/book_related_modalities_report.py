#
#  Create a report of related artifacts for a book.
#  List all modality types for each section.
#
# Usage: run([artifactID(s)], [filename=])
#   @params: list of artifactID(s)
#   @params: filename for the csv. example.csv
#
# Felix Nance 7/14/2014

from flx.model import api
from flx.controllers.common import ArtifactCache
from flx.lib.helpers import reindexArtifacts
import logging
from flx.lib.unicode_util import UnicodeWriter

LOG_FILENAME = "/tmp/book_related_modalities_report.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=50*1024*1024, backupCount=5)
log.addHandler(handler)

subjects = {'ALG':'algebra','ESC':'earth-science','BIO':'biology',
    'CHE':'chemistry','GEO':'geometry','CAL':'calculus',
    'STA':'statistics','PRB':'probability','LSC':'life-science',
    'PSC':'physical-science','PHY':'physics','MEA':'measurement',
    'TRG':'trigonometry', 'ALY':'analysis','ARI':'arithmetic',
    'UBR':'na'}

csvwriter = None

def createHandle(encodedID,artifact_type,handle):
    start = encodedID.find('.')
    subject = subjects[encodedID[start+1:start+4]]
    return "http://www.ck12.org/%s/%s/%s/%s"%(subject,encodedID,artifact_type,handle)

def _writecsvrows(chapter_number,section_number,artifact):

  artifactID = artifact.id
  section = "'%s.%s"%(chapter_number,section_number)
  print "Processing artifact: %s"%artifactID
  log.info("Processing artifact: %s"%artifactID)

  # Write lesson as first modality type
  encID = None
  domainTermID = None
  # Check for artifacts without encodedID
  domainTerm = artifact.getDomainTerm()
  if not domainTerm:
    domainTerm = artifact.getDomain()
  try:
      encID = domainTerm.encodedID
      domainTermID = domainTerm.id
  except AttributeError:
    encID = domainTerm['encodedID']
    domainTermID = domainTerm['id']

  handle = createHandle(encID,artifact.type.name,artifact.handle)
  csvwriter.writerow([section,artifact.name,encID,artifact.type.name,artifactID,artifact.name,handle])

  #domain = api.getRelatedArtifactsForArtifact(artifactID).results[0]
  related_artifacts = api.getRelatedArtifactsForDomains(domainIDs=[domainTermID], ownedBy='ck12', pageNum=1, pageSize=100)

  first_read = None
  for item in related_artifacts.results:
      artifact_type = api.getArtifactTypeByID(item.artifactTypeID).name
      handle = createHandle(item.domain.encodedID,artifact_type,item.handle)
      print artifact.name,section,item.domain.encodedID,artifact_type,item.id,item.name,handle
      if (artifact_type =='lesson'):
          # Don't add a duplicate lesson
          if first_read and first_read != item.id:
              csvwriter.writerow([section,artifact.name,item.domain.encodedID,"%s_related"%artifact_type,item.id,item.name,handle])
          else:
              first_read = item.id
              pass
      else:
        csvwriter.writerow([section,artifact.name,item.domain.encodedID,artifact_type,item.id,item.name,handle])

def run(artifactIDs,filename=""):
  global csvwriter
  if type(artifactIDs) != list:
    print "Must pass in a list of artifact ids"
    return
  for artifact_id in artifactIDs:
    # Get the book using artifactID
    artifact = api.getArtifactByID(artifact_id)
    outputFile = open ("%s_related_modal_report.csv"%artifact.handle,'w')
    csvwriter = UnicodeWriter(outputFile)
    csvwriter.writerow(["Lesson Number","Concept/Lesson Title","EID","Modality Type","Artifact ID","Artifact Title","Artifact URL"])
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
        for i,chapter in enumerate(chapters):
          i+=1
          if chapter.artifactTypeID == 3:
            _writecsvrows(i,0,chapter)
          else:
            for v,section in enumerate(chapter.getChildren()):
              _writecsvrows(i,v+1,section)
    outputFile.close()
