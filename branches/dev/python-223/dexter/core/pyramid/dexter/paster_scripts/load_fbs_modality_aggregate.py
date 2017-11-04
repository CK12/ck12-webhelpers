import pymongo
from urlparse import urlparse
import traceback
import logging
import logging.handlers
from datetime import datetime, timedelta
import urllib2
import json
from celery import task
from dexter.lib import helpers as h
from dexter.models import iplocation

subject_url = 'http://www.ck12.org/taxonomy/get/info/subjects'
branch_url =  'http://www.ck12.org/taxonomy/get/info/branches'

# Initialise Logger
log = logging.getLogger(__name__)
#hdlr = logging.handlers.RotatingFileHandler('/tmp/modality_aggregate.log', maxBytes=20*1024*1024, backupCount=5)
#formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
#hdlr.setFormatter(formatter)
#log.addHandler(hdlr)
#log.setLevel(logging.INFO)

modality_types = set(['activity', 'activityans', 'asmtpractice', 'asmtpracticeg', 'asmtpracticeint', 'asmtquiz', 'asmttest', 'attachment', 'audio', 'concept', 'conceptmap', 'cthink', 'enrichment', 'exerciseint', 'flashcard', 'handout', 'image', 'interactive', 'lab', 'labans', 'lecture', 'lesson', 'lessonplan', 'lessonplanans', 'lessonplanx', 'lessonplanxans', 'plix', 'postread', 'postreadans', 'prepostread', 'prepostreadans', 'preread', 'prereadans', 'presentation', 'quiz', 'quizans', 'quizdemo', 'rubric', 'rwa', 'rwaans', 'simulation', 'simulationint', 'studyguide', 'web', 'whileread', 'whilereadans', 'worksheet', 'worksheetans'])

def run(time_bucket=None):
    """
    """
    try:
        config = h.load_config()
        server_name = config.get('web_prefix_url')
        server_loc = urlparse(server_name).netloc
        db = get_mongo_db()
        if not time_bucket:
            today = datetime.today()
            time_bucket = today.strftime('%Y-%m-%d-day')
        subjects, branches = setup_subject_branches()    
        #Get the modalities for the given time bucket
        log.info('Processing modalities for time_bucket: [%s]', time_bucket)
        modalities = db.Events.find({'eventType':'FBS_MODALITY', "time_bucket": time_bucket})
        inserted_count = 0
        skipped_count = 0            
        for modality in modalities:
            log.info("Processing FBS_MODALITY record ID:%s" % modality.get('_id', '-1'))
            modality_payload = modality.get("payload", {})
            client_ip = modality_payload.get("client_ip")
            if not client_ip:
                skipped_count += 1
                continue                
            if not modality_payload:
                log.info("Payload is empty.")
                skipped_count += 1
                continue
            encoded_id = modality_payload.get("context_eid", '').strip()
            if not (encoded_id and is_valid_eid(encoded_id, subjects, branches)):
                log.info("Encoded ID not available/not valid, EncodedID :%s" %encoded_id)
                skipped_count += 1
                continue                
            if not modality_payload.get('modality_type'):
                log.info("modality_type not available.")
                skipped_count += 1
                continue                    
            if not modality_payload.get('artifactID'):
                log.info("artifactID not available.")                    
                skipped_count += 1
                continue
            modality_type = modality_payload.get('modality_type', '').lower()
            if modality_type not in modality_types:
                log.info("Not a modality, modality type :%s" % modality_type)
                skipped_count += 1                    
                continue
            url_referrer = modality_payload.get('url_referrer')
            if not url_referrer or urlparse(url_referrer).netloc != server_loc:
                log.info("Event is not from: [%s]. Skipping" %(server_name))
                skipped_count += 1
                continue
                                    
            ip_info = iplocation.IPLocation(db).get_location(ip_address=client_ip)
            country, state, city, zipcode, isp = [ip_info.get(x, 'unknown') 
                                                  for x in ['country_long', 'region', 'city', 'zipcode', 'isp']]
            subject, branch = encoded_id.split('.')[:2]                        
            modality_time_bucket = modality.get('time_bucket')                
            artifact_id = str(modality_payload.get('artifactID'))
            modality_aggregation =  {'encodedID': encoded_id, \
                                   'time_bucket': modality_time_bucket, \
                                   'modality_type': modality_type, \
                                   'artifactID':artifact_id, \
                                   'subject': subject.upper(), \
                                   'branch': branch.upper(), \
                                   'country': country, \
                                   'state': state, \
                                   'city':city, \
                                   'zipcode':zipcode, \
                                   'isp':isp, \
                                   'timestamp': datetime.now()}
            update_info = {'$set':modality_aggregation, '$inc':{'count':1}}
            update_params = {'artifactID':artifact_id, 'modality_type':modality_type, 'subject':subject, 'branch':branch, 
                             'country':country, 'state':state}
            id = db.ModalityAggregate.update(update_params, update_info, upsert=True)
            log.info("Insreted record in ModalityAggregate, %s", id)
            inserted_count += 1

        log.info("Skipped Records Count : %s", skipped_count)
        log.info("Inserted Records Count : %s", inserted_count)
    except Exception as e:
        log.error('Error enountered while running FBSModalityAggregator: %s' %(str(e)))
        log.error(traceback.format_exc())


def setup_subject_branches():
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
        
def is_valid_eid(eid, subjects, branches):
    """
    Check if the encodedID has a valid format SUB.BRN.XXX.YYY or SUB.BRN.XXX
    """
    eid_parts = eid.split('.')
    # Eid should be SUB.BRN.XXX.YYY or SUB.BRN.XXX
    if not len(eid_parts) in [3, 4]:
        return False
    eid_parts = map(lambda x:x.lower(), eid_parts)
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

def get_mongo_db():
    """
    """
    config = h.load_config()
    mongo_uri = config.get('mongo_uri')
    if ',' in mongo_uri:
        mongo_uri = mongo_uri.split(',')[0] +  '/' + mongo_uri.split('/')[-1]
    db_url = urlparse(mongo_uri)
    max_pool_size = int(config.get('mongo.max_pool_size'))
    replica_set = config.get('mongo.replica_set')
    if replica_set:
        conn = pymongo.MongoReplicaSetClient(host=db_url.hostname, port=db_url.port, max_pool_size=max_pool_size,
            replicaSet=replica_set, read_preference=pymongo.read_preferences.ReadPreference.PRIMARY_PREFERRED)
        log.debug("Using Replica Set: %s" % replica_set)
    else:
        conn = pymongo.MongoClient(host=db_url.hostname, port=db_url.port, max_pool_size=max_pool_size)
    db = conn[db_url.path[1:]]
    if db_url.username and db_url.password:
        db.authenticate(db_url.username, db_url.password)
    return db
    
if __name__ == "__main__":
    run()
