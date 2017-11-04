import time
import logging
import pymongo
import IP2Location
from unicode_util import UnicodeWriter

# Initialise Logger
log = logging.getLogger(__name__)
hdlr = logging.StreamHandler()  # Prints on console
#hdlr = logging.FileHandler('/tmp/logs/school_visitors.log') # Use for smaller logs
#handler = logging.handlers.RotatingFileHandler('/tmp/logs/school_visitors.log', maxBytes=10*1024*1024, backupCount=500) #Use for bigger logs
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
hdlr.setFormatter(formatter)
log.addHandler(hdlr)
log.setLevel(logging.INFO)

# MongoDB configuration
db_hostname = 'localhost'
db_port = 27017
db_name = 'dexter'
db_username = 'adsadmin'
db_password = 'D-coD43'
db_replica_set = 'rs1'
db_username = None
db_password = None
db_replica_set = None

ip2location_db_file = '/opt/2.0/deploy/components/ip2location/IP-COUNTRY-REGION-CITY-LATITUDE-LONGITUDE-ZIPCODE-ISP-DOMAIN.BIN'
ip2location = IP2Location.IP2Location()
ip2location.open(ip2location_db_file)

output_file = 'school_visitors.csv'

csv_headers = ['ISP Name', 'Visitor Count', 'Time Bucket', 'Weekday', 'Country', 'State', 'City', 'Zipcode']

school_data = ['school','college','education','learn','academy','elementary','middle', 'high','community', 'development', 
               'academic','secondary','sch','elem','parent','student','teacher','campus','child','development']

def run():
    stime = time.time()
    fd = open(output_file, 'w')
    csv_writer = UnicodeWriter(fd)
    csv_writer.writerow(csv_headers)
    db = get_mongo_db()
    records = db.VisitorClusters.find()
    total_count = records.count()
    log.info("Total %s records to process." % total_count)    
    count = 1
    for record in records:
        count += 1
        if count > 100:
            log.info("Processed %s/%s " % (count, total_count))
        client_ip = record['client_ip']
        location_info = get_location_from_ip(client_ip)    
        if not location_info:
            continue
        isp, country, state, city, zipcode = location_info
        for isp_part in isp.split(' '):
            if isp_part in school_data:
                visitor_count = record['visitor_count']
                time_bucket = record['time_bucket']
                weekday = record['weekday']
                csv_writer.writerow([isp, visitor_count, time_bucket, weekday, country, state, city, zipcode])
                break
    fd.close()

    print "Time Taken: %s" % (time.time() - stime)   
        
def get_location_from_ip(client_ip):
    try:
        ip2_info = ip2location.get_all(client_ip)
        if ip2_info.isp:
            isp = ip2_info.isp.lower()
            country = ip2_info.country_long.lower()
            state = ip2_info.region.lower()
            city = ip2_info.city.lower()
            zipcode = ip2_info.zipcode.lower()
            return (isp, country, state, city, zipcode)
    except Exception as e:
        return tuple()

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
