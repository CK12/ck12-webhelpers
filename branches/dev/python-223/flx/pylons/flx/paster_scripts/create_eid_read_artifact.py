from flx.model import api, model
from flx.model.api import _transactional
from datetime import datetime
import logging
from flx.lib.unicode_util import UnicodeWriter

LOG_FILENAME = "/tmp/artifactEID_script.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=50*1024*1024, backupCount=5)
log.addHandler(handler)

@_transactional()
def run(session, dryrun=True):
    aTypesDict = api._getArtifactTypesDict(session)
    bTypesDict = api._getBrowseTermTypesDict(session)
    domains = api._getBrowseTermsByType(session, termTypeID = bTypesDict['domain'].id)

    if dryrun:
        outputFile = open("new_artifact_EID.csv",'w')
        csvwriter = UnicodeWriter(outputFile)
        csvwriter.writerow(["Concept EID", "Artifact ID", "New Artifact EID"])

    for d in domains:
        # get read modalities for each concept
        if not d.encodedID:
            continue
        artifacts = api._getRelatedArtifactsForDomains(session, domainIDs=[d.id], typeIDs=[aTypesDict['lesson'].id], ownedBy='ck12')
        writtenArtifactIDs = [] #to avoid duplicate artifacts being written
        initialS = d.encodedID
        max = 0
        for a in artifacts:
            if not a.encodedID:
                continue
            if ".L." in a.encodedID:
                eid = a.encodedID.split('.')
                eidNum = int(eid[len(eid)-1])
                if eidNum > max:
                    max = eidNum
                log.info(" artifact eid: %s under concept eid : %s" %(a.encodedID, a.domainEID))              
        
        nextEidNum = max+1 
        for a in artifacts:
            if a.id not in writtenArtifactIDs:
                if not a.encodedID:
                    
                    while True:
                        generatedEID = initialS + ".L." + str(nextEidNum)
                        nextEidNum+=1
                        if not api._getArtifactByEncodedID(session, generatedEID):
                            break
                    if dryrun:
                        csvwriter.writerow([a.domainEID, a.id, generatedEID])
                    else:    
                        a.encodedID = generatedEID
                        session.add(a)
                    log.info("*** Created EID: %s for artifact id: %s under concept eid : %s" %(generatedEID, a.id, a.domainEID))  

                writtenArtifactIDs.append(a.id)

    outputFile.close()   
