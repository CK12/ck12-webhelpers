import codecs
import logging
import logging.handlers
import time
import json
import urllib

from flx.model import api

BRANCH_API = "http://gamma.ck12.org/taxonomy/get/info/branches"
CONCEPT_API = "http://gamma.ck12.org/taxonomy/get/info/concepts/%s/%s?pageSize=-1"
XHTML_DIR = "/home/ck12qa/artifact_xhtmls/"

LOG_FILENAME = "/tmp/artifact_xhtmls.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
#handler = logging.StreamHandler()
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=10*1024*1024, backupCount=5)
handler.setFormatter(formatter)
log.addHandler(handler)

def main(branch, modality_types=["rwa"]):
    """
    """
    stime = time.time()
    log.info("Started processing , Branch:%s, Modality Types:%s" % (branch, str(modality_types)))
    # Get the subject for the given branch
    subject = get_branch_subject(branch)
    log.info("Subject:%s" % subject)
    if not subject:
        raise Exception("Branch not associated with any subject.Please provide the correct branch.")
    # Fetch all the concepts for the branch 
    concept_api = CONCEPT_API % (subject, branch)
    response = urllib.urlopen(concept_api)
    concepts_response = json.loads(response.read())
    concepts = concepts_response["response"]["conceptNodes"]
    eids = [concept["encodedID"] for concept in concepts]        
    log.info("Total concepts to process :%s" % len(eids))
    # Prepare the list of domainIDs
    domain_ids = []
    for eid in eids:
        browse_term = api.getBrowseTermByEncodedID(encodedID=eid)
        if not browse_term:
            print "No browseterm exists for encodedID:%s" % eid
            continue
        domain_ids.append(browse_term.id)

    # Build the arttifact type dictionary
    all_modality_types = api.getArtifactTypes(modalitiesOnly=True)
    type_dict = dict([(all_modality_type.id, all_modality_type.name) for all_modality_type in all_modality_types])                
    type_ids = []
    for all_modality_type in all_modality_types:
        if all_modality_type.name in modality_types:
            type_ids.append(all_modality_type.id)
    log.info("Type IDs:%s" % str(type_ids))
            
    # Get the related artifacts
    related_artifacts = api.getRelatedArtifactsForDomains(domainIDs=domain_ids, typeIDs=type_ids,
                                                          levels=None, memberID=None, sort=None, ownedBy='ck12')
    artifact_ids = [related_artifact.id for related_artifact in related_artifacts]
    artifact_ids = list(set(artifact_ids))
    log.info("Total artifacts to process:%s" % len(artifact_ids))
    artifacts = api.getArtifactsByIDs(artifact_ids)
    # Create the XHTML file for each artifact.
    for artifact in artifacts:
        try:
            type_name = type_dict.get(artifact.artifactTypeID, "unknown")
            file_name = "%s_%s_%s.html" % (eid, type_name, artifact.id)
            xhtml =  artifact.getXhtml(includeChildContent=True, includeChildHeaders=True)
            fp = codecs.open(XHTML_DIR + file_name, "wb", encoding='utf-8')
            #fp = open(XHTML_DIR + file_name, "w")
            fp.write(xhtml)
            fp.close()                                                   
            log.info("XHTML File:%s" % file_name)
        except Exception as ex:
            log.info("Unable to process the artifactID:%s, Error:%s" % (artifact.id, str(ex)))

    log.info("Finished processing.")
    log.info("Time Taken:%s" % (time.time() - stime))
    
def get_branch_subject(branch):
    """
    """
    print branch
    branch = branch.lower()
    subject = None
    resp = urllib.urlopen(BRANCH_API)
    branch_info = json.loads(resp.read())
    branches = branch_info["response"]["branches"]
    
    for branch_info in branches:
        if branch_info["shortname"].lower() == branch:
            subject = branch_info["subjectID"]
            break
    return subject
    
if __name__ == "__main__":
    branch = "BIO"
    modality_types = ["rwa"]
    main(branch, modality_types)
