import time
import logging
import pymongo

# MongoDB source DB  configuration
src_db_hostname = 'asmtdb.master'
#src_db_hostname = 'localhost'
src_db_port = 27017
src_db_name = 'dexter'
src_db_username = 'adsadmin'
src_db_password = 'D-coD43'
src_db_replica_set = 'rs0'
#src_db_username = None
#src_db_password = None
#src_db_replica_set = None

# MongoDB destination DB  configuration
dst_db_hostname = 'asmtdb.master'
#dst_db_hostname = 'localhost'
dst_db_port = 27017
dst_db_name = 'flx2'
dst_db_username = 'flx2admin'
dst_db_password = 'D-coD43'
dst_db_replica_set = 'rs0'
#dst_db_username = None
#dst_db_password = None
#dst_db_replica_set = None

LOG_FILE_PATH = "/tmp/migrate_school_artifacts.log"

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
    src_db = get_mongo_db(src_db_hostname, src_db_port, src_db_replica_set, src_db_name, src_db_username, src_db_password)
    dst_db = get_mongo_db(dst_db_hostname, dst_db_port, dst_db_replica_set, dst_db_name, dst_db_username, dst_db_password)

    school_ids = src_db.SchoolArtifacts.distinct('schoolID')
    school_count = len(school_ids)
    log.info("Total schools to process : %s" % school_count)
    for school_id in school_ids:
        log.info("Processing School : %s" % school_id)
        school_info = dict()
        artifacts = []
        school_artifacts = src_db.SchoolArtifacts.find({'schoolID':school_id})
        for school_artifact in school_artifacts:
            artifact_info = dict()
            for school_prop in school_props:
                try:
                    school_info[school_prop] = school_artifact[school_prop]
                except:
                    pass
                for arft_prop in arft_props:
                    try:
                        artifact_info[arft_prop] = school_artifact[arft_prop]
                    except:
                        pass
            if artifact_info.get('published') == 'yes':
                artifact_info['published'] = True
            elif artifact_info.get('published') == 'no':
                artifact_info['published'] = False
            artifacts.append(artifact_info)
        school_info['artifacts'] = artifacts
        insert_id = dst_db.SchoolArtifacts.insert(school_info)				
        log.info("Completed processing school SchoolID/MongoID: [%s/%s]" % (school_id, insert_id))
    log.info("Total school processed : %s" % school_count)
    log.info("Total time taken: %s" % (time.time() - stime))

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
