import argparse
import time
import logging
import pymongo
import IP2Location

# Initialise Logger
log = logging.getLogger(__name__)
hdlr = logging.StreamHandler()  # Prints on console
hdlr = logging.FileHandler('/tmp/update_ip2location.log') 
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
hdlr.setFormatter(formatter)
log.addHandler(hdlr)
log.setLevel(logging.INFO)

# MongoDB configuration
#db_hostname = 'localhost'
#db_hostname = 'asmtdb.master'
#db_port = 27017
#db_name = 'flx2'
#db_username = 'flx2admin'
#db_password = 'D-coD43'
#db_replica_set = 'rs1'
#db_username = None
#db_password = None
#db_replica_set = None

ip_to_location_path = "/opt/2.0/deploy/components/ip2location/IPV6-COUNTRY-REGION-CITY-LATITUDE-LONGITUDE-ZIPCODE-ISP-DOMAIN.BIN"

def main(db_hostname, db_port, db_replica_set, db_name, db_username, db_password):
    """
    """
    stime = time.time()
    log.info("===============Started update ip2location===============")
    # Get the mongodb instance   
    ipdb = get_mongo_db(db_hostname, db_port, db_replica_set, db_name, db_username, db_password)
    log.info("Got the mongodb instance: [%s]" % ipdb)
    # Get the IP2Location instance
    ip2location = IP2Location.IP2Location()
    ip2location.open(ip_to_location_path)
    log.info("Got the ip2location instance: [%s]" % ip2location)
    # Fetch all the existing ip records
    total_ips = ipdb.IP2Location.count()
    log.info("Total [%s] records to process" % total_ips)
    iplocations = ipdb.IP2Location.find()
    count = 0
    exception_count = 0
    for iplocation in iplocations:
        try:
            _id = iplocation['_id']
            if (count % 10000) == 0:
                log.info("IPs processed, [%s/%s]" % (count, total_ips))
            # Fetch the ip and get its details
            ip_address = iplocation['ip_address']
            try:
                ip_info_obj = ip2location.get_all(ip_address)
            except Exception as ex:
                log.info("Record does not exists in IP2Location for IP: [%s]" %(ip_address))
                log.info("Exception: [%s]" % str(ex))    
                count += 1
                continue
            ip_info = {}
            # Get the required location details.
            ip_info['ip_address'] = ip_address
            ip_info['country_short'] = ip_info_obj.country_short.lower()
            ip_info['country_long'] = ip_info_obj.country_long.lower()
            ip_info['region'] = ip_info_obj.region.lower()
            ip_info['city'] = ip_info_obj.city.lower()
            ip_info['isp'] = ip_info_obj.isp.lower()
            ip_info['latitude'] = ip_info_obj.latitude
            ip_info['longitude'] = ip_info_obj.longitude
            ip_info['domain'] = ip_info_obj.domain
            ip_info['zipcode'] = ip_info_obj.zipcode
            ip_info['timezone'] = ip_info_obj.timezone
            ip_info['netspeed'] = ip_info_obj.netspeed
            ip_info['idd_code'] = ip_info_obj.idd_code
            ip_info['area_code'] = ip_info_obj.area_code
            ip_info['weather_code'] = ip_info_obj.weather_code
            ip_info['weather_name'] = ip_info_obj.weather_name
            ip_info['mcc'] = ip_info_obj.mcc
            ip_info['mnc'] = ip_info_obj.mnc
            ip_info['mobile_brand'] = ip_info_obj.mobile_brand
            ip_info['elevation'] = ip_info_obj.elevation
            ip_info['usage_type'] = ip_info_obj.usage_type
            for key in ip_info.keys():
                if ip_info[key] == '-':
                    ip_info[key] = ''
            # Save the ip details
            result = ipdb.IP2Location.update({'_id':_id},{'$set': ip_info}, upsert=False)
        except Exception as ex:
            log.info("Got exception in processing record : [%s]" %(iplocation))
            log.info("Exception: [%s]" % str(ex))
            exception_count += 1
        count += 1
    log.info("Total Records processed: [%s]" % count)
    log.info("Total Records with exception : [%s]" % exception_count)
    log.info("Time Taken: [%s]" % (time.time() - stime))
    log.info("===============Completed update ip2location===============")

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
    """python /opt/2.0/flx/scripts/update_ip2location.py --db_hostname=asmtdb.master --db_port=27017 --db_replica_set=rs0 --db_name=flx2 --db_username=flx2admin --db_password=D-coD43
    """
    parser = argparse.ArgumentParser()
    parser.add_argument("--db_hostname")
    parser.add_argument("--db_port", type=int)
    parser.add_argument("--db_replica_set", default='')
    parser.add_argument("--db_name")
    parser.add_argument("--db_username")
    parser.add_argument("--db_password")
    args = parser.parse_args()
    db_hostname = args.db_hostname
    db_port = args.db_port
    db_replica_set = args.db_replica_set
    db_name = args.db_name
    db_username = args.db_username
    db_password = args.db_password
    main(db_hostname, db_port, db_replica_set, db_name, db_username, db_password)
