import logging

import pymongo
from flx.model import api
from flx.lib.remoteapi import RemoteAPI
from datetime import datetime
LOG_FILE_PATH = "/tmp/related_artifacts.log"
# Taxonomy server & apis
SERVER_NAME = "http://www.ck12.org/"
TAXONOMY_SERVER = "http://www.ck12.org/taxonomy"
SUBJECT_API = "/get/info/subjects"
BRANCH_API = "/get/info/branches/%s"
CONCEPT_API = "/get/info/concepts/%s/%s"
FEATURED_MODALITY_API = "flx/get/featured/modalities/lesson/"

# Initialise Logger
logger = logging.getLogger('__name__')
hdlr = logging.FileHandler(LOG_FILE_PATH)
#hdlr = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
hdlr.setFormatter(formatter)
logger.addHandler(hdlr)
logger.setLevel(logging.INFO)

remoteapi = RemoteAPI()

# MongoDB configuration 1
db_hostname = 'localhost'
db_port = 27017
db_name = 'flx2'
db_username = 'flx2admin'
db_password = 'D-coD43'
db_replica_set = 'rs1'
db_username = None
db_password = None
db_replica_set = None

to_collection = 'RelatedArtifacts'


def run():
    """Create the related artifacts for each  concept.
    """
    db = get_mongo_db()
    r_collection = db[to_collection]
    # Get the list of all the subjects and branches.
    results = getSubjectBranches()
    for result in results:
        try:
            concept_api = CONCEPT_API % result
            # Get all the concepts under branch.
            response = remoteapi._makeCall(TAXONOMY_SERVER, concept_api, 500, params_dict={'pageSize':1000}, method='GET')
            cons = response['response']['conceptNodes']
            if cons:
                subName = cons[0]['subject']['name']
                brName = cons[0]['branch']['name']
                logger.info("Processing Concept(s) for branch/subject[%s/%s]" % (brName, subName))
                # Prepare list of concepts under branch.
                for con in cons:
                    eid = con['encodedID']
                    domain = api.getBrowseTermByEncodedID(encodedID=eid)
                    if not domain:
                        raise Exception("No such domain with encodedID [%s] " % eid)
                    kwargs = {}
                    kwargs['handle'] = domain.handle
                    kwargs['domainID'] = int(domain.id)
                    kwargs['encodedID'] = eid

                    kwargs['artifacts'] = []
                    modalities = getModalities(domain)
                    for eachmodality in modalities:
                        artifactDict = {}
                        artifactDict['artifactID'] = eachmodality.id
                        artifactDict['artifactType'] = eachmodality.getArtifactType()
                        artifactDict['level'] = eachmodality.getLevel()
                        artifactDict['pop_score'] = eachmodality.getScore()
                        kwargs['artifacts'].append(artifactDict)

                    relatedArtifacts = r_collection.find_one({'encodedID': eid})

                    kwargs['creationTime'] = relatedArtifacts.get('creationTime', datetime.now()) if relatedArtifacts else datetime.now()
                    kwargs['updateTime'] = datetime.now()
                    r_collection.update({"encodedID":eid}, {"$set": kwargs}, upsert=True)
                    logger.info("Created related artifacts for eid[%s]" % eid)
            logger.info("Completed processing for Subject/Branch :%s/%s" % (subName, brName))
        except Exception as e:
            logger.error("Error creating related artifacts for url[%s], Exception:%s" % (concept_api, str(e)), exc_info=e)

def getModalities(domain):
    relatedArtifacts = api.getRelatedArtifactsForDomains(domainIDs=[domain.id], ownedBy='ck12', pageNum=1, pageSize=100)
    modalities = []
    for eachModality in relatedArtifacts:
        artifact = api.getArtifactByID(id=eachModality.id)
        modalities.append(artifact)

    return modalities

def get_mongo_db():
    """Get mongodb.
    """
    # Get the collection from mongodb
    if db_replica_set:
        conn = pymongo.MongoReplicaSetClient(host=db_hostname, port=db_port,
                                             replicaSet=db_replica_set,
                                             read_preference=pymongo.read_preferences.ReadPreference.PRIMARY_PREFERRED)
    else:
        conn = pymongo.MongoClient(host=db_hostname, port=db_port)
    db = conn[db_name]
    if db_username and db_password:
        db.authenticate(db_username, db_password)
    return db

def getSubjectBranches():
    """Get the list of subject and respective branches.
    """
    # Fetch subjects.
    response = remoteapi._makeCall(TAXONOMY_SERVER, SUBJECT_API, 500, params_dict={'pageSize':1000}, method='GET')
    subjects = response['response']['subjects']
    subBrancheList = []
    for subject in subjects:
        # Fetch branches.
        shortname = subject['shortname']
        branch_api = BRANCH_API % shortname
        response = remoteapi._makeCall(TAXONOMY_SERVER, branch_api, 500, params_dict={'pageSize':1000}, method='GET')
        branches = map(lambda x:x['shortname'], response['response']['branches'])
        if branches:
            subBrancheList.extend(map(lambda x:(shortname,x), branches))

    return subBrancheList
