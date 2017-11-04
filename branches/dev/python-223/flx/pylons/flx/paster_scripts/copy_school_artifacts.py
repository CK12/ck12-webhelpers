import logging
import logging.handlers
import time
import pymongo

# Initialise Logger
log = logging.getLogger(__name__)
#hdlr = logging.StreamHandler()
hdlr = logging.FileHandler('/tmp/copy_school_artifacts.log')
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
hdlr.setFormatter(formatter)
log.addHandler(hdlr)
log.setLevel(logging.INFO)

# MongoDB configuration 1
db_hostname = 'localhost'
db_port = 27017
db_name = 'dexter'
db_username = 'adsadmin'
db_password = 'D-coD43'
db_replica_set = 'rs1'
db_username = None
db_password = None
db_replica_set = None

from_collection = 'SchoolArtifactsReal'
to_collection = 'SchoolArtifactsNew'

def run():
    """
    """
    stime = time.time()
    db = get_mongo_db()
    src_collection = db[from_collection]
    dst_collection = db[to_collection]
    update_keys = ['status', 'rejection_reasons', 'rejection_comment', 'reviewerID']
    records = src_collection.find()
    count = 1
    total_count = records.count()
    for record in records:
        count += 1
        artifact_id = '-'
        try:
            artifact_id = record['artifactID']
            log.info("Processing %s/%s, artifactID:%s" % (count, total_count, artifact_id))
            update_dict = dict()
            for key in update_keys:
                if record.has_key(key):
                    update_dict[key] = record[key]
            if update_dict:
                log.info("Processed artifactID:%s, Update Info:%s" % (artifact_id, str(update_dict)))
                dst_collection.update({'artifactID':artifact_id}, {'$set':update_dict})            
        except Exception as ex:
            log.info("Error in processing record, artifactID:%s, Error:%s" % (artifact_id, traceback.print_exc()))

    log.info("Completed Processing, Time Taken:%s" % str(time.time() - stime))

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

if __name__ == "__main__":
    run()
