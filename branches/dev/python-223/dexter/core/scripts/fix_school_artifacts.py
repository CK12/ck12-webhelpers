import sys
import logging
import MySQLdb as mdb
import pymongo

HOST = "mysql.master"
#HOST = "localhost"
USER = "dbadmin"
PASSWORD = "D-coD#43"
DB = "flx2"

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

LOG_FILE_PATH = "/tmp/fix_school_artifacts.log"

# Initialise Logger
log = logging.getLogger('__name__')
hdlr = logging.StreamHandler()
#hdlr = logging.FileHandler(LOG_FILE_PATH)
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
hdlr.setFormatter(formatter)
log.addHandler(hdlr)
log.setLevel(logging.INFO)

def main(mode):
    log.info("Running in %s mode" % mode)
    db = get_mongo_db()
    conn = mdb.connect(host=HOST, user=USER, passwd=PASSWORD, db=DB, use_unicode=True)
    cur = conn.cursor()

    member_ids = db.SchoolArtifacts.distinct('memberID')
    member_ids = set([int(member_id) for member_id in member_ids])
    
    qry = "SELECT memberID from auth.MemberSchools where schoolType in ('other','home')"
    cur.execute(qry)
    other_member_ids = set(cur.fetchall())
    other_member_ids = [other_member_id[0] for other_member_id in other_member_ids]

    del_member_ids = member_ids.intersection(other_member_ids)
    del_member_ids = list(del_member_ids) + [str(member_id) for member_id in del_member_ids]

    del_docs = db.SchoolArtifacts.find({'memberID':{'$in':del_member_ids}})
    total_count  = db.SchoolArtifacts.count()

    info_dict = dict()
    count = 0
    for doc in del_docs:
        state = doc.get('state', 'unknown')
        info_dict[state] = info_dict.get(state, 0) + 1
        count += 1
    
    log.info("Total records: %s, Records to be  deleted: %s" % (total_count, count))


    for state in info_dict:
        log.info("%s:%s" % (state.title(), info_dict[state]))

    if mode == "write":    
        db.SchoolArtifacts.remove({'memberID':{'$in':del_member_ids}})
        log.info("Records Deleted.")

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
    print "python fix_school_artifacts.py read/write"
    mode  = sys.argv[1]
    if mode not in ["read", "write"]:
        print "Please provide proper mode. (read/write)"
    else:
        main(mode)
