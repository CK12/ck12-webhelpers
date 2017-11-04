#
#  Create a csv file of book lessons to concept
#  newspaper pages.
#
# Usage: run([artifactID(s)], [filename=])
#   @params: list of artifactID(s)
#   @params: filename for the csv. example.csv
#
# Felix Nance 8/1/2014

from flx.model import api
from flx.controllers.common import ArtifactCache
from flx.lib.helpers import reindexArtifacts
import logging
from flx.lib.unicode_util import UnicodeWriter

LOG_FILENAME = "/tmp/book_to_newspaper_page.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=50*1024*1024, backupCount=5)
log.addHandler(handler)

subjects = {'ALG':'algebra','ESC':'earth-science','BIO':'biology',
    'CHEM':'chemistry','GEO':'geometry','CAL':'calculus',
    'STA':'statistics','PRB':'probability','LSC':'life-science',
    'PSC':'physical-science','PHY':'physics','MEA':'measurement',
    'TRG':'trigonometry', 'ALY':'analysis','ARI':'arithmetic'}

csvwriter = None

def createHandle(encodedID,handle):
    start = encodedID.find('.')
    subject = subjects[encodedID[start+1:start+4]]
    return "http://www.ck12.org/%s/%s/"%(subject,handle)

def _writecsvrows(chapter_number,section_number,artifact):

  artifactID = artifact.id
  section = "'%s.%s"%(chapter_number,section_number)
  print "Processing artifact: %s %s"%(artifactID,artifact.name)
  log.info("Processing artifact: %s %s"%(artifactID,artifact.name))

  handle = createHandle(artifact.getDomainTerm().encodedID,artifact.handle) 
  csvwriter.writerow([section,artifact.name,artifact.getDomainTerm().encodedID,artifactID,artifact.name,handle])

def run(artifactIDs,filename=""):
  global csvwriter
  if type(artifactIDs) != list:
    print "Must pass in a list of artifact ids"
    return
  for artifact_id in artifactIDs:
    # Get the book using artifactID
    artifact = api.getArtifactByID(artifact_id)
    outputFile = open ("%s_newspaper_urls.csv"%artifact.handle,'w')
    csvwriter = UnicodeWriter(outputFile)
    csvwriter.writerow(["Lesson Number","Concept/Lesson Title","EID","Artifact ID","Concept Title","Concept URL"])
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
