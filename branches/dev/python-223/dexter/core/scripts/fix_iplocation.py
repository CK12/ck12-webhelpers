import time
import logging
import pymongo

db_hostname = 'qaasmtdb4'
#db_hostname = 'localhost'
db_port = 27017
db_name = 'dexter'
db_username = 'adsadmin'
db_password = 'D-coD43'
db_replica_set = 'rs0'
#dst_db_username = None
#dst_db_password = None
#dst_db_replica_set = None

LOG_FILE_PATH = "/tmp/fix_iplocation.log"

# Initialise Logger
log = logging.getLogger('__name__')
hdlr = logging.StreamHandler()
hdlr = logging.FileHandler(LOG_FILE_PATH)
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
hdlr.setFormatter(formatter)
log.addHandler(hdlr)
log.setLevel(logging.INFO)

def main():
    stime = time.time()
    db = get_mongo_db(db_hostname, db_port, db_replica_set, db_name, db_username, db_password)
    # Get all the results having duplicate entires
    results = db.IP2Location.aggregate([{'$group': {'_id': '$ip_address', 'count':{'$sum':1}}}, {'$match':{'count':{'$gt':1}} }], allowDiskUse=True)
    duplicate_ips = [] 
    original_ips = []
    count = 0
    empty_count = 0
    for result in results['result']:
        count += 1
        ip = result['_id']
        ip_results = db.IP2Location.find({'ip_address': ip})
        valid_info_exists = False
        for ip_result in ip_results:        
            try:
                if valid_info_exists:
                    duplicate_ips.append(ip_result['_id'])
                    continue
                country = ip_result['country_long']
                area = ip_result['region']
                city = ip_result['city']
                if not (country.strip() and area.strip() and city.strip()): 
		    duplicate_ips.append(ip_result['_id']) 
		    empty_count += 1
  		    continue
                if country.strip() and area.strip() and city.strip():
                    valid_info_exists = True
                    original_ips.append(ip_result['_id'])
                else:
                    duplicate_ips.append(ip_result['_id'])
            except Exception, e:
                log.info("Unable to process the ip:[%s], Error:[%s]" % (ip, str(e)))
    log.info("Done with collection all the duplicate ip information.")
    log.info("Delete duplicate ip information. Count: [%s]" % len(duplicate_ips))
    
    for rec in duplicate_ips:
        db.IP2Location.remove({'_id':rec})
 
    log.info("Total IPs:[%s], Duplicate IPs:[%s], Original IPs:[%s], Empty IPs: [%s]" % (count, len(duplicate_ips), len(original_ips), empty_count))

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
