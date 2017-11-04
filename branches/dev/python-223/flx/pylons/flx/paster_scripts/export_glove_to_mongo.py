from pylons import config
import logging
import logging.handlers
import time
import pymongo
    
from flx.lib.ml import utils as u

# Initialise Logger
log = logging.getLogger(__name__)
#hdlr = logging.StreamHandler()
hdlr = logging.FileHandler('/tmp/export_glove_to_mongo.log')
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
hdlr.setFormatter(formatter)
log.addHandler(hdlr)
log.setLevel(logging.INFO)

# MongoDB configuration 1
db_hostname = 'asmtdb.master'
db_port = 27017
db_name = 'flx2'
db_username = 'flx2admin'
db_password = 'D-coD43'
db_replica_set = 'rs0'
#db_username = None
#db_password = None
#db_replica_set = None

to_collection = 'Glove300d'

def run():
    """
    """
    stime = time.time()
    db = get_mongo_db()
    glove_collection = db[to_collection]
    glove_model_path = config.get('ml.glove_model_path', '/opt/ml_work_dir/models/glove.6B.300d.txt')  
    log.info('Getting glove model')
    glove_model = u.get_glove_model(glove_model_path)
    log.info('Glove model loaded')
    for word, features in glove_model.items():
        glove_collection.insert({'word':word, 'features': features})

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
