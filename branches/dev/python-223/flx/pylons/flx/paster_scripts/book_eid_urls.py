#
#  Create a csv with eids and urls for book, chapter, sections
#  We can build on this and add whatever data content team needs for a book.
#
# Usage: run([artifactID(s)])
#   @params: list of artifactID(s)
#
# Felix Nance 4/11/2017

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

def getBookHandle(handle):
    return "https://www.ck12.org%s/"%handle

def getSectionHandle(handle,sequence):
    return "https://www.ck12.org%s/section/%s/"%(handle,sequence)

def _writecsvrows(chapter_number,section_number,artifact, book_handle):

  artifactID = artifact.id
  url = None
  section = "%s.%s"%(chapter_number,section_number)
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

  if chapter_number == 0:
      url = getBookHandle(book_handle)
  else:
      url = getSectionHandle(book_handle, section)

  csvwriter.writerow(["'%s"%section,artifact.name,encID,artifactID,url])

def run(artifactIDs,filename=""):
  global csvwriter
  if type(artifactIDs) != list:
    print "Must pass in a list of artifact ids"
    return
  for artifact_id in artifactIDs:
    # Get the book using artifactID
    artifact = api.getArtifactByID(artifact_id)
    book_handle= artifact.getPerma()
    outputFile = open ("%s_book_eids_url.csv"%artifact.handle,'w')
    csvwriter = UnicodeWriter(outputFile)
    csvwriter.writerow(["Sequence","Artifact Title","EID","Artifact ID","Artifact URL"])
    _writecsvrows(0,0,artifact, book_handle)
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
            _writecsvrows(i,0,chapter, book_handle)
          else:
            for v,section in enumerate(chapter.getChildren()):
              _writecsvrows(i,v+1,section, book_handle)
    outputFile.close()
