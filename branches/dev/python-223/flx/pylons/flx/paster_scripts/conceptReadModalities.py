#
#  Create a csv file of concept eids to all the related read modalities
#
# Usage: run([filename=])
#   @params: filename for the csv. For example, "FileName"
#
# Rahul Nanda 27th Jan 2015

from flx.model import api, model
from flx.model.api import _transactional
from datetime import datetime
import logging
from flx.lib.unicode_util import UnicodeWriter

LOG_FILENAME = "/tmp/conceptReadModalities.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=50*1024*1024, backupCount=5)
log.addHandler(handler)

def run(filename="conceptReadMod"):
  
    aTypesDict = api.getArtifactTypesDict()
    bTypesDict = api.getBrowseTermTypesDict()
    domains = api.getBrowseTermsByType(termTypeID = bTypesDict['domain'].id)
    outputFile = open("%s.csv" %filename,'w')
    csvwriter = UnicodeWriter(outputFile)
    csvwriter.writerow(["Concept EID", "Artifact EID/ID"])
    for d in domains:
        # get read modalities for each concept
        
        artifacts = api.getRelatedArtifactsForDomains(domainIDs = [d.id], typeIDs = [aTypesDict['lesson'].id])
        writtenArtifactIDs = [] #to avoid duplicate artifacts being written
        for a in artifacts:
            if a.id not in writtenArtifactIDs:
                
                if a.encodedID==None:
                    log.info(" concept eid : %s artifact id : %s" %(a.domainEID, a.id))
                    csvwriter.writerow([a.domainEID, a.id])
                else:  
                    log.info(" concept eid : %s artifact eid : %s" %(a.domainEID, a.encodedID))   
                    csvwriter.writerow([a.domainEID, a.encodedID])
                
                writtenArtifactIDs.append(a.id)
    
    outputFile.close()
        
