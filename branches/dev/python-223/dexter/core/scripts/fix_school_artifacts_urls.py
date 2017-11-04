import sys
import logging
import pymongo
from bson.objectid import ObjectId

# MongoDB configuration
db_hostname = 'localhost'
db_hostname = 'asmtdb.master'
db_port = 27017
db_name = 'dexter'
db_username = 'adsadmin'
db_password = 'D-coD43'
db_replica_set = 'rs0'
#db_username = None
#db_password = None
#db_replica_set = None

LOG_FILE_PATH = "/tmp/fix_school_artifacts_urls.log"

# Initialise Logger
log = logging.getLogger('__name__')
hdlr = logging.StreamHandler()
#hdlr = logging.FileHandler(LOG_FILE_PATH)
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
hdlr.setFormatter(formatter)
log.addHandler(hdlr)
log.setLevel(logging.INFO)

def main():
    """Update all the urls in schoolArtifacts on the gamma server.
    """
    update_count = 0
    db = get_mongo_db()
    artifacts = db.SchoolArtifacts.find()
    count = db.SchoolArtifacts.count()
    log.info("SchoolArtifacts count:%s" % count)
    for artifact in artifacts:
        artifact_urls = {}
        for url_key in ['artifactPerma', 'cover', 'detailsURL']:
            url = artifact.get(url_key)
            if url:
                if url.startswith('http://www.ck12.org'):
                    url = url.replace('http://www.ck12.org', 'http://gamma.ck12.org', 1)
                    artifact_urls[url_key] = url
                elif url.startswith('https://www.ck12.org'):
                    url = url.replace('https://www.ck12.org', 'https://gamma.ck12.org', 1)
                    artifact_urls[url_key] = url
        if artifact_urls:
            id = artifact.get('_id')
            db.SchoolArtifacts.update({'_id':ObjectId(id)},{'$set':artifact_urls})
            update_count += 1
    log.info("SchoolArtifacts updated count: %s" % update_count)

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
    main()
