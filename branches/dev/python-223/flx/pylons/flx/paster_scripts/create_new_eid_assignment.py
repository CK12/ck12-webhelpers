# This script does the artifactID to encodedID association.
# You can pass in a headless csv or txt file with artifactid,encodedid
# or you can use run("artifactid,encodedID") with string params.
# ex: run("usefile",filename="/tmp/precalencodedIDs.csv")
# ex: run("1108890,MAT.ALY.140")
# Felix created 12/19/2013

from flx.model import api
from flx.controllers.common import ArtifactCache
from flx.lib.helpers import reindexArtifacts
import logging

LOG_FILENAME = "/tmp/create_new_encodedID_assignment.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=50*1024*1024, backupCount=5)
log.addHandler(handler)

subjectencodedIDs = {
        'mathematics': 'MAT',
        'arithmetic': 'MAT.ARI',
        'measurement': 'MAT.MEA',
        'algebra': 'MAT.ALG',
        'geometry': 'MAT.GEO',
        'trigonometry': 'MAT.TRG',
        'probability': 'MAT.PRB',
        'statistics': 'MAT.STA',
        'calculus': 'MAT.CAL',
        'science': 'SCI',
        'life science': 'SCI.LSC',
        'biology': 'SCI.BIO',
        'chemistry': 'SCI.CHE',
        'physics': 'SCI.PHY',
        'earth science': 'SCI.ESC',
        'analysis': 'MAT.ALY',
        'engineering': 'ENG',
        'physical science': 'SCI.PSC'
        }

def help():
  print "usage --> run(artifact_encodedID='artifactID,encodedID',[filename=],[subjects=true],[ownerID=])"
  print "\nartifact_encodedID - ArtifactID and EncodedID as string list 'artifactID,encodedID'.\
         \nfilename - Path of the file.\
         \nsubjects - If true, update all books for CK-12editor by default.\
         \nownerID - The member id for whom you want to update subjects."

#def run(artifact_encodedID='artifactID,encodedID',[filename=],[subjects=true],[ownerID=])
def run(**kwargs):
  """ Main fucntion to run script.

      run(artifact_encodedID='artifactID,encodedID',[filename=],[subjects=true],[ownerID=])

      artifact_encodedID - run script and make the browseTerm association for the pair.
      filename - run script on file comma deliminated artifactID,encodedID
      subjects - run scirpt to update all books for an ownerID default is 3.
      ownerID - use with subjects=True, to update browseTerms for different ownerID.
        
        Parameters:
          artifact_encodedID - ArtifactID and EncodedID as string list 'artifactID,encodedID'.
          filename - Path of the  csv file.
          subjects - If true, update all books for ownerID CK-12editor by default.
          ownerID - The member id for whom you want to update subjects. (default is 3)

    """


  # List for reindex artifacts
  reindexlist = []
  file_data = None
  failure_list = []
  
  log.info("Running..")
  
  def _createBrowseTerm(artifactID,encodedID=None,browse_term_id=None):
    """ Create Browse terms. 

        Get the artifact by ID, get the browseTermID,  
        make call createArtifactHasBrowseTerm(artifactID,browseTermID).
        Invalidate artifact cache.
    """
    
    if encodedID:
      encodedID=encodedID
    if browse_term_id:
      browse_term_id = browse_term_id
    
    # Get artifact by ID via api.
    log.info("Calling getArtifactByID(%s)"%(artifactID))
    print "Calling getArtifactByID(%s)"%(artifactID)
    artifact = api.getArtifactByID(artifactID)
    if not artifact:
      log.info("Could not get artifact. Check artifactID: %s"%(artifactID))
      print "Error could not get artifact. Check artifactID: %s"%(artifactID)
      return 

    browseTermID=None
    if encodedID:
      log.info("Calling getBrowseTermByEncodedID(%s)"%(encodedID))
      print "Calling getBrowseTermByEncodedID(%s)"%encodedID
      browseTermID = api.getBrowseTermByEncodedID(str(encodedID)).id
    elif browse_term_id:
      browseTermID = browse_term_id
    if browseTermID:
      log.info("Calling createArtifactHasBrowseTerm(artifactID=%s, browseTermID=%s)"%(artifact.id,browseTermID))
      print "Calling createArtifactHasBrowseTerm(artifactID=%s, browseTermID=%s)"%(artifact.id,browseTermID)
      api.createArtifactHasBrowseTerm(artifactID=artifact.id, browseTermID=browseTermID)
    else:
      log.info("Could not get browseTermID. Check encodedID: %s"%(encodedID))
      print "Could not get browseTermID. Check encodedID: %s"%(encodedID)
      return
    
    log.info("Calling invalidateArtifact(ArtifactCache(ArtifactCache(),artifact)")
    print "Calling invalidateArtifact(ArtifactCache(ArtifactCache(),artifact)"
    api.invalidateArtifact(ArtifactCache(),artifact)
    log.info("Calling ArtifactCache().load(%s)"%artifact.id)
    print "Calling ArtifactCache().load(%s)"%artifact.id
    ArtifactCache().load(artifact.id)
    reindexlist.append(artifact.id)
    #new_encodedID = artifact.asDict()['domain']['encodedID']
    #if new_encodedID != encodedID:
    #    failure_list.append("artifactID encodedID %s is not the expected value %s"%(new_encodedID,encodedID))
  
  def _updateSubjects():
    ownerID = 3

    if kwargs.has_key("ownerID"):
      ownerID = kwargs["ownerID"]
    class owner:
      def __init__(self):
        self.id = ownerID

    log.info("Getting all books for ownerID: %s"%(str(owner().id)))
    print "Getting all books for ownerID: %s"%(str(owner().id))
    books = api.getArtifactsByOwner(owner(),typeName="book")

    # Go through each book in the list.
    for book in books.results:
      subjectlist =[]
      # Add the subject browseTerms to a list.
      for term in book.getBrowseTerms():
        if term['type'].lower() == 'subject' and term['name']:
          subjectlist.append(term['name'])
      if subjectlist:
        log.info(" Processing: %s %s %s"%(book.id, book.name, subjectlist))
        print "Processing:", book.id, book.name, subjectlist
        for subject in subjectlist:
          print "Creating browse term for subject %s"%subject
          log.info("Creating browse term for subject %s"%subject)
          #btid = api.getBrowseTermByIDOrName(idOrName=str(subject)).id
          # Check to see that subject is in listed with encodedID above.
          if subject.lower() in subjectencodedIDs:
            encodedID = subjectencodedIDs[str(subject.lower())]
            print "Calling _createBrowseTerm() for subject: %s"%subject
            log.info("Calling _createBrowseTerm() subject: %s"%subject)
            _createBrowseTerm(book.id,encodedID=encodedID)
            reindexlist.append(book.id)
          else:
            print "Subject (%s) was not found in the subject list."%subject
            log.info("Subject (%s) was not found in the subject list."%subject)
            failure_list.append("Failed - Subject (%s) was not found in the subject list."%subject)
          
      else:
          print "Skipping Book: %s %s has no subject in browseTerms" %(book.id,book.name)
          log.info("Skipping Book: %s %s has no subject in browseTerms" %(book.id,book.name))
          failure_list.append("Failed - Book: %s %s has no subject in browseTerms" %(book.id,book.name))

    if reindexlist:
      log.info("Re-indexing artifacts %s"%reindexlist)
      print "Re-indexing artifacts %s"%reindexlist
      reindexArtifacts(reindexlist,user=None,recursive=True)

  def _useFile(filename):
    # Optionally read from a csv file
    log.info("Found file %s"%filename)
    with open(filename,'r') as f:
      file_data = f.read().strip().split('\n')
    file_data = map(lambda x: x.split(","),file_data)
    for artifactID,encodedID in file_data:
      _createBrowseTerm(artifactID,encodedID=encodedID)
    if reindexlist:
      log.info("reindexArtifacts")
      reindexArtifacts(reindexlist,user=None,recursive=True)


  if kwargs.has_key("filename"):
    _useFile(kwargs['filename'])
  elif kwargs.has_key("subjects"):
    _updateSubjects()

  else:
    try:
     artifact_encodedID = kwargs["artifact_encodedID"].split(",")
     _createBrowseTerm(artifact_encodedID[0],encodedID=artifact_encodedID[1])
     if reindexlist:
      log.info("reindexArtifacts")
      reindexArtifacts(reindexlist,user=None,recursive=True)
    except:
      help()
  if failure_list:
    for item in failure_list:
      log.info(item)
      print item
    
  log.info("Finished running.")
