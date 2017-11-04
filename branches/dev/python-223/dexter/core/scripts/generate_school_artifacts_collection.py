import pymongo
import time
import logging
import logging.handlers
from unicode_util import UnicodeDictReader

# MongoDB configuration
db_hostname = 'localhost'
db_port = 27017
db_name = 'dexter'
db_username = ''
db_password = ''
db_replica_set = ''
db_username = None
db_password = None
db_replica_set = None


# Initialise Logger
log = logging.getLogger(__name__)
#hdlr = logging.StreamHandler()
hdlr = logging.handlers.RotatingFileHandler('/home/ck12qa/logs/school_artifacts.log', maxBytes=20*1024*1024, backupCount=5)
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
hdlr.setFormatter(formatter)
log.addHandler(hdlr)
log.setLevel(logging.INFO)

input_csv_file = '/home/ck12qa/data/member_schools.csv'

school_info = dict()
def run():
    """Main Function.
    """
    log.info("Started processing of School Artifacts")
    stime = time.time()
    # Get mongo db instance.
    db = get_mongo_db()
    fp = open(input_csv_file, 'rb')
    csv_reader = UnicodeDictReader(fp)
    member_count = 0
    insert_count = 0
    count = 0
    for row in csv_reader:
        member_count += 1
    fp.close()

    fp = open(input_csv_file, 'rb')
    csv_reader = UnicodeDictReader(fp)
    for row in csv_reader:
        try:
            count += 1
            if (count % 100) == 0:
                log.info("Processed %s/%s" % (count, member_count))
            member_id = row['memberID']
            school_name = row['schoolName'].lower()
            zipcode = row['zipcode']
            state = row['state'].lower()
            city = row['city'].lower()
            results = db.Resolved_FBS_MODALITY.find({'memberID': member_id})
            for result in results:
                artifact_id = str(result['artifactID'])
                info_key = '%s_%s_%s' % (school_name, zipcode, artifact_id)
                if school_info.has_key(info_key):
                    continue
                artifact_type = result.get('artifactID_artifactType', 'unknown')
                school_artifact = {
                'school_name': school_name,
                'zipcode': zipcode,
                'state': state,
                'city': city,
                'artifactID': artifact_id,
                'artifactType': artifact_type
                }
                db.SchoolArtifacts.insert(school_artifact)
                insert_count += 1
                school_info[info_key] = ''
        except Exception as e:
            log.info("Unable to process the row: %s" %str(row))
            log.info("Exception:%s" % str(e))
    fp.close()
    log.info("Total Records inserted:%s" %insert_count)
    log.info("Time taken: %s" % (time.time() - stime))

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
