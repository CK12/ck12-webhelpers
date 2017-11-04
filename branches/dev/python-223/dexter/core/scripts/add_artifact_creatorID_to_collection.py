import time
import logging
import logging.handlers
import pymongo

# Initialise Logger
log = logging.getLogger(__name__)
#hdlr = logging.StreamHandler()
#hdlr = logging.FileHandler('/tmp/add_artifact_creatorID.log')
hdlr = logging.handlers.RotatingFileHandler('/tmp/logs/add_artifact_creatorID.log', maxBytes=10*1024*1024, backupCount=500)
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
hdlr.setFormatter(formatter)
log.addHandler(hdlr)
log.setLevel(logging.INFO)

# MongoDB configuration
db_hostname = 'localhost'
#db_hostname = 'qadatamgr'
db_port = 27017
db_name = 'dexter'
db_username = 'adsadmin'
db_password = 'D-coD43'
db_replica_set = 'rs0'
db_username = None
db_password = None
db_replica_set = None

def run():
    """Function to add artifactID_creator to Resolved_FBS_Modality collection.
    """
    stime = time.time()
    db = get_mongo_db()
    artifacts = db.Artifacts.find({}, {'entityKey':1, '_id':0, 'entityValue.response.artifact.creatorID':1})
    total_count = artifacts.count()
    log.info("Total records to Process:%s" % total_count)
    records = []
    for artifact in artifacts:
        artifact_id = int(artifact['entityKey'])
        creator_id = artifact['entityValue']['response']['artifact']['creatorID']
        records.append((artifact_id, creator_id))

    count = 0
    for record in records:
        artifact_id, creator_id = record
        count += 1
        try:
            log.info("Processing artifactID:%s" % artifact_id)  
            if (count % 100) == 0:
                log.info("Processed %s/%s" % (count, total_count))
                log.info("Time taken %s" % (time.time() - stime))
            db.Resolved_FBS_MODALITY.update({'artifactID':{'$in':[artifact_id, str(artifact_id)]} },  {'$set':{'artifactID_creatorID': creator_id}}, multi=True)
        except Exception as e:
            log.info("Unable to Process artifactID:%s, Error:%s" % (artifact_id, str(e)))  


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
