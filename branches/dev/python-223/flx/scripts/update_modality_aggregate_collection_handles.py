import pymongo
import logging, logging.handlers

# MongoDB configuration
db_hostname = 'localhost'
db_hostname = 'qaasmtdb4'
db_port = 27017
db_name = 'flx2'
db_username = 'flx2admin'
db_password = 'D-coD43'
db_replica_set = 'rs0'
#db_username = None
#db_password = None
#db_replica_set = None

# Logging configuration
log_filename = "/tmp/collection_handles.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler = logging.handlers.RotatingFileHandler(log_filename, maxBytes=10*1024*1024, backupCount=30)
handler = logging.StreamHandler()
handler = logging.StreamHandler()
handler.setFormatter(formatter)
log.addHandler(handler)

BRANCH_ENCODEDID_MAPPING = {'MAT.ARI': 'arithmetic',
                            'MAT.MEA': 'measurement',
                            'MAT.ALG': 'algebra',
                            'MAT.GEO': 'geometry',
                            'MAT.PRB': 'probability',
                            'MAT.STA': 'statistics',
                            'MAT.CAL': 'calculus',
                            'MAT.TRG': 'trigonometry',
                            'MAT.ALY': 'analysis',
                            'SCI.PHY': 'physics',
                            'SCI.BIO': 'biology',
                            'SCI.ESC': 'earth-science',
                            'SCI.CHE': 'chemistry',
                            'SCI.LSC': 'life-science',
                            'SCI.PSC': 'physical-science', 
                            'ELA.SPL': 'spelling',
                            'ENG.TST': 'testing',
                           }
                           
def main():
    """
    """
    db = get_mongo_db()   
    results = db.ModalityAggregate.find()
    for result in results:
        _id = result['_id']
        log.info("Processing ID: [%s]" % _id)
        collection_handle = result.get('collection_handle')
        log.info("collection_handle: [%s]" % collection_handle)
        if collection_handle:
            continue        
        branch = "%s.%s" % (result.get('subject'), result.get('branch'))
        log.info("branch: [%s]" % branch)
        branch.upper() 
        if BRANCH_ENCODEDID_MAPPING.get(branch):
            collection_handle = BRANCH_ENCODEDID_MAPPING[branch]
            log.info("Got the collection handle")
            update_result = db.ModalityAggregate.update({'_id':_id}, {'$set':{'collection_handle': collection_handle}})
            log.info("update_result: [%s]" % update_result)            
    
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
