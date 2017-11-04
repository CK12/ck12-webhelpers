import pymongo
import traceback
import logging
from datetime import datetime, timedelta
import urllib2
import json
import IP2Location
import logging.handlers
# MongoDB configuration
db_hostname = 'dexterdb.master'
db_port = 27017
db_name = 'dexter'
db_username = 'adsadmin'
db_password = 'D-coD43'
db_replica_set = 'rs2'
#db_username = None
#db_password = None
#db_replica_set = None

# Initialise Logger
log = logging.getLogger(__name__)
hdlr = logging.StreamHandler()
#hdlr = logging.FileHandler('/tmp/assessment_error.log')
hdlr = logging.handlers.RotatingFileHandler('/tmp/concept_aggregates.log', maxBytes=20*1024*1024, backupCount=5)
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
hdlr.setFormatter(formatter)
log.addHandler(hdlr)
log.setLevel(logging.INFO)

subject_url = 'http://www.ck12.org/taxonomy/get/info/subjects'
branch_url =  'http://www.ck12.org/taxonomy/get/info/branches'

IP2LocObj = IP2Location.IP2Location()
IP2LocObj.open('/opt/2.0/deploy/components/ip2location/IP-COUNTRY-REGION-CITY-LATITUDE-LONGITUDE-ZIPCODE-ISP-DOMAIN.BIN')

def main():
    """Record the concept information to concept aggregates collection.
    """
    subjects, branches = get_subject_branches()
    db = get_mongo_db()
    month_time_bucket = ['2015-11-month', '2015-10-month', '2015-09-month', '2015-08-month', '2015-07-month', '2015-06-month']
    log.info('Processing concept queries for month time bucket: %s', month_time_bucket)
    concepts = db.FBS_MODALITY.find({"time_bucket": {'$in': month_time_bucket}})
    inserted_count = 0
    skipped_count = 0
    for concept in concepts:
        log.info("Processing FBS_MODALITY record ID:%s" % concept.get('_id', '-1'))
        concept_payload = concept
        client_ip = concept_payload.get("client_ip")
        if not client_ip:
            skipped_count += 1
            continue
        encoded_id = concept_payload.get("context_eid", '').strip()
        encoded_id = encoded_id.lower()
        if not (encoded_id and is_valid_eid(encoded_id, subjects, branches)):
            log.info("Encoded ID not valid, EncodedID :%s" %encoded_id)
            skipped_count += 1
            continue

        location = get_location_from_ip(client_ip)
        if not location:
            country, state, city, zipcode, isp = ('unknown', 'unknown', 'unknown', 'unknown', 'unknown')
        else:
            country, state, city, zipcode, isp = location

        concept_time_bucket = concept.get('time_bucket')
        concept_aggregation =  {'encodedID': encoded_id, \
                               'country': country, \
                               'state': state, \
                               'city':city, \
                               'zipcode':zipcode, \
                               'isp': isp, \
                               'time_bucket': concept_time_bucket, \
                               'created_time': datetime.now()}
        id = db.ConceptAggregate.insert(concept_aggregation)
        log.info("Insreted record in ConceptAggregate, %s", id)
        inserted_count += 1

    log.info("Skipped Records Count : %s", skipped_count)
    log.info("Inserted Records Count : %s", inserted_count)

def is_valid_eid(eid, subjects, branches):
    """
    Check if the encodedID has a valid format SUB.BRN.XXX.YYY or SUB.BRN.XXX
    """
    eid_parts = eid.split('.')
    # Eid should be SUB.BRN.XXX.YYY or SUB.BRN.XXX
    if not len(eid_parts) in [3, 4]:
        return False
    # Valid Subject not present
    if eid_parts[0] not in subjects:
        return False
    # Valid Branch not present
    if eid_parts[1] not in branches:
        return False
    # Encoded id not valid.
    try:
        if len(eid_parts) == 3:
            tmp_data = int(eid_parts[2])
        else:
            tmp_data = int(eid_parts[2])
            tmp_data = int(eid_parts[3])
    except ValueError, e:
        return False
    return True

def get_subject_branches():
    """Get all the subjects and respective branches.
    """
    resp = urllib2.urlopen(subject_url)
    data = resp.read()
    sub_resp = json.loads(data)
    subjects = map(lambda x:x['shortname'].lower(), sub_resp['response']['subjects'])
    log.info("Subjects :%s" % subjects)
    resp = urllib2.urlopen(branch_url)
    data = resp.read()
    br_resp = json.loads(data)
    branches = map(lambda x:x['shortname'].lower(), br_resp['response']['branches'])
    log.info("Branches :%s" % branches)

    return subjects, branches

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

def get_location_from_ip(client_ip):
    """Get the location from IP Address.
    """
    try:
        IP2Info = IP2LocObj.get_all(client_ip)
        location = IP2Info.country_long, IP2Info.region, IP2Info.city, IP2Info.zipcode, IP2Info.isp
        location = map(lambda x: x.lower().strip('-').strip(), location)
        location = map(lambda x: x if x else 'unknown', location)
        return location
    except:
        return None

if __name__ == "__main__":
    main()
