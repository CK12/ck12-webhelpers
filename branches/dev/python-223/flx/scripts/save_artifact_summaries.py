import csv
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
log_filename = "/tmp/artifact_summaries.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler = logging.handlers.RotatingFileHandler(log_filename, maxBytes=10*1024*1024, backupCount=30)
handler.setFormatter(formatter)
log.addHandler(handler)

summary_file = "/tmp/Summarization v2.0 - Sheet1.csv"

def main():
    """
    """
    db = get_mongo_db()   
    valid_actions = set(['A'])   
    # Build the summary dict
    summary_dict = {}
    count = 0
    fp = open(summary_file)
    reader = csv.reader(fp, delimiter=',', quotechar='"')
    for row in reader:
        row = [x.strip() for x in row]
        arft_id, arft_title, concept_title, eid, url, summary, action_old, action = row
        if action not in valid_actions:
            continue        
        count += 1
        try:
            arft_id = int(arft_id)
        except Exception as ex:
            log.info("Not a valid artifactID:[%s]" % arft_id)
            continue        
        summary_dict.setdefault(arft_id, []).append(summary)
    
    # Save the records to database
    for arft_id in summary_dict:
        summaries = summary_dict[arft_id]
        rec = {}
        rec['artifactID'] = arft_id
        rec['summaries'] = summary_dict[arft_id]
        db.ArtifactSummaries.insert(rec)

    log.info("Total [%s] artifact records processd." % count)
    
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
