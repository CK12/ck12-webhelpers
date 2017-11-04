import time
import logging
import pymongo

db_hostname = 'asmtdb.master'
#db_hostname = 'localhost'
db_port = 27017
db_name = 'flx2'
db_username = 'flx2admin'
db_password = 'D-coD43'
db_replica_set = 'rs0'
#dst_db_username = None
#dst_db_password = None
#dst_db_replica_set = None

LOG_FILE_PATH = "/tmp/fix_empty_school_artifacts.log"

# Initialise Logger
log = logging.getLogger('__name__')
hdlr = logging.StreamHandler()
#hdlr = logging.FileHandler(LOG_FILE_PATH)
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
hdlr.setFormatter(formatter)
log.addHandler(hdlr)
log.setLevel(logging.INFO)

def main():
    stime = time.time()
    school_props = ['schoolID', 'schoolName', 'state', 'city', 'zipcode']
    arft_props = ['artifactID', 'reviewerID', 'published', 'status', 'detailsURL', 'description', 'creatorName', 'cover', 'artifactTitle', 
    	          'artifactPerma', 'memberID']
    schools = set()
    db = get_mongo_db(db_hostname, db_port, db_replica_set, db_name, db_username, db_password)

    
    school_artifacts = {}
    schools = db.SchoolArtifacts.find()
    empty_count = count = 0
    for school in schools:
        count += 1
        school_id = school['schoolID']
        school_name = school['schoolName']
        #log.info("Processing School, schoolName/schoolID : [%s/%s]" % (school_name, school_id))
        update_artifact = False
        artifacts = school.get('artifacts', [])
        new_artifacts = []
        for artifact in artifacts:            
            if artifact.has_key('artifactID'):
                new_artifacts.append(artifact)                
            else:
                update_artifact = True
        if update_artifact:
            empty_count += 1
            log.info("Empty Artifact is present for the school, schoolName/schoolID : [%s/%s]" % (school_name, school_id))
            school_artifacts[school_id] = new_artifacts
            
    for school_id in school_artifacts:
        artifacts = school_artifacts[school_id]
        db.SchoolArtifacts.update({'schoolID':school_id}, {'$set': {'artifacts': artifacts}})

    log.info("Total school processed/ Schools with empty artifacts : [%s/%s]" % (count, empty_count))


def get_mongo_db(db_hostname, db_port, db_replica_set, db_name, db_username, db_password):
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

if __name__ == "__main__":
    main()
