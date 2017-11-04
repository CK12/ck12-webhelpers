import logging
import logging.handlers
import calendar
import json
import base64
import requests
import pymongo
import time
from mixpanel import Mixpanel
import eventlet
from eventlet.green import urllib2

# Initialise Logger
log = logging.getLogger(__name__)
#hdlr = logging.StreamHandler()
#hdlr = logging.FileHandler('/tmp/mixpanel_export.log')
hdlr = logging.handlers.RotatingFileHandler('/tmp/mx_logs/mixpanel_export_opt.log', maxBytes=2048000, backupCount=5)
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

# CK-12 Analytics
#PROJECT_TOKEN = '0097d68bb53089517f638ace9464db0f'
#API_KEY = '1ae02154d5491a4d7d0cfdb5d86a7552'
# CK-12 Test
PROJECT_TOKEN = '657fed1b2b3213980209974573508d75'
API_KEY = '984fa81d80f1c74b0f15c797b2608650'
mixpanel_api = 'http://api.mixpanel.com/import/'

remove_keys = ['_id', 'eventID', 'timestamp']

metadata_mapping = {'artifactID_artifactType': 'artifactType', 'artifactID_level': 'level',
                    'artifactID_creator': 'creator', 'artifactID_isModality': 'isModality', 
                    'memberID_firstName': 'firstName', 'memberID_lastName': 'lastName', 
                    'memberID_email': 'email', 'memberID_roles': 'roles',
                    'context_eid_name': 'name', 'context_eid_handle': 'handle', 
                    'context_eid_previewImageUrl': 'previewImageURL', 'context_eid_subject': 'subject', 
                    'context_eid_branch': 'branch', 'client_ip': 'ip',
                    'context_eid': 'eid', 'encodedID': 'eid', 'authType': 'loginProvider',
                    'referrer': 'fromPage', 'sequence': 'questionSequence'}

event_type_mapping = {'fbs_modality': 'PURE CONTENT VIEW', 'fbs_customize_start': 'CUSTOMIZE START', 'fbs_view': 'PAGE VIEW', 
                      'fbs_signups': 'SIGNUPS', 'fbs_search': 'SEARCH', 'fbs_timespent': 'TIMESPENT',
                      'fbs_location_infofbs_improve_question': 'IMPROVE QUESTION',
                      'fbs_assessment_peerhelp_tab': 'ASSESSMENT PEERHELP TAB',
                      'fbs_assessment_filters': 'ASSESSMENT RESULTS FILTER', 'fbs_assessment_video_tab': 'ASSESSMENT VIDEO TAB',
                      'fbs_bookmark': 'BOOKMARKS', 'fbs_assessment_review_answers': 'fbs_assessment_review_answers', 
                      'fbs_practice_video': 'ASSESSMENT VIDEO', 'fbs_assessment_attempts_navigate': 'fbs_assessment_attempts_navigate', 
                      'fbs_customize_complete': 'CUSTOMIZE COMPLETE', 'fbs_active_user': 'ACTIVE USER', 'fbs_highlight': 'HIGHLIGHTS',
                      'fbs_assessment': 'ASSESSMENT', 'fbs_download': 'DOWNLOADS', 'fbs_signins': 'SIGNINS',
                      'fbs_assessment_action': 'fbs_assessment_action', 'fbs_lms_install': 'LMS INSTALL',
                      'fbs_cross_links': 'CONCEPT CROSS LINKS CLICKED', 'fbs_assessment_create': 'QUIZ CREATED', 
                      'fbs_profanity_filter': 'PROFANITY FILTER', 'fbs_search_hit': 'SEARCH RESULT CLICKED',
                      'fbs_assessment_start': 'ASSESSMENT START', 'fbs_note': 'NOTES',
                      'fbs_assessment_result_switch': 'ASSESSMENT RESULT SWITCH', 'fbs_share': 'SHARE',
                      'athena_app_launch': 'ATHENA APP LAUNCH', 'athena_modality_insert': 'ATHENA MODALITY INSERT',
                      'fbs_assessment_customize': 'ASSESSMENT CUSTOMIZE', 'fbs_bkmklt_create': 'BKMKLT CREATE',
                      'fbs_bkmklt_launch': 'BKMKLT LAUNCH', 'fbs_page_view': 'PAGE VIEWS', 'studynow_ios_error': 'STUDYNOW IOS ERROR'}

subject_mapping = {'SOC': 'Social Science', 'TEC': 'Technology', 'SCI': 'Science', 'MAT': 'Mathematics', 'ENG': 'Engineering'}
branch_mapping = {'BIO': 'Biology', 'HIS': 'History', 'MEA': 'Measurement', 'STA': 'Statistics', 'PRB': 'Probability', 
                  'ALG': 'Algebra', 'CAL': 'Calculus', 'TRG': 'Trigonometry', 'PHY': 'Physics', 'ESC': 'Earth Science',
                  'ELM': 'Elementary Math', 'ALY': 'Analysis', 'CHE': 'Chemistry', 'ARI': 'Arithmetic', 'TST': 'Software Testing',
                  'PSC': 'Physical Science', 'GEO': 'Geometry', 'LSC': 'Life Science'}

def main():
    """Export Resolved events to mixpanel.
    """
    collection_params = dict()
    pool = eventlet.GreenPool(200)
    start_time = time.time()
    time_buckets = ['2014-10-month', '2014-09-month', '2014-08-month', '2014-07-month', '2014-06-month', '2014-05-month', '2014-04-month',
                    '2014-03-month', '2014-02-month', '2014-01-month', '2013-12-month', '2013-11-month','2013-10-month', '2013-09-month',   
                    '2013-08-month', '2013-07-month', '2013-06-month', '2013-05-month', '2013-04-month', '2013-03-month', '2013-02-month', 
                    '2013-01-month']
    time_buckets = ['2014-10-month']
    counter = 0 
    urls = []
    params = []
    db = get_mongo_db()
    collection_names = db.collection_names()
    collections = []
    # Prepare list of collections to process
    for collection_name in collection_names:
        if not collection_name.startswith('Resolved_'):
            continue
        event_type = collection_name.replace('Resolved_', '').lower()
        if event_type not in event_type_mapping:    
            log.info("No event mapping available for collection:%s" % collection_name)
            continue

        event_type = '%s' % event_type_mapping[event_type]
        collection = db[collection_name]
        collections.append((collection, collection_name, event_type))
        collection_params[event_type] = []

    for time_bucket in time_buckets:
        print "Processing events from time bucket: %s" % time_bucket
        log.info("Processing events from time bucket: %s" % time_bucket)
        # Specify events time span
        #time_bucket = '2014-10-month'
        for collection_info in collections:
            collection, collection_name, event_type = collection_info
            log.info("Processing collection: %s" % collection_name)
            events = collection.find({'time_bucket':time_bucket})
            event_data = {}
            for event in events:
                event_data = event
                log.info("Go the event data: %s" % event_data)
                if event_data.has_key('visitorID'):
                    distinct_id = event_data['visitorID']
                elif event_data.has_key('memberID'):
                    distinct_id = event_data['memberID']
                else:
                    log.info("No distinct_id found for collection: %s" % collection_name)
                    continue

                event_params = dict()
                for event_key in event_data:
                    # Remove unnecessary keys
                    if event_key in remove_keys:
                        continue
                    # Get the updated key for Mixpanel
                    param_key = metadata_mapping.get(event_key, event_key)
                    event_params[param_key] = event_data[event_key]
                if event_params.has_key('subject') and event_params['subject']:
                    sub = event_params['subject']
                    event_params['subject'] = subject_mapping.get(sub, sub)
                if event_params.has_key('branch') and event_params['branch']:
                    branch = event_params['branch']
                    event_params['branch'] = branch_mapping.get(branch, branch)

                dt = event_data['timestamp']
                epoch_time = calendar.timegm(dt.timetuple())            
                event_properties = dict()
                event_properties['distinct_id'] = distinct_id
                event_properties['time'] = epoch_time
                event_properties['token'] = PROJECT_TOKEN
                event_properties.update(event_params)
                collection_params[event_type] = list(set(collection_params[event_type] + event_properties.keys()))
                event_dict = {'event':event_type, 'properties':event_properties}
                # Record the event
                log.info("\nevent_dict: %s" % event_dict)
                # Base64 encoding of the json of event dict
                json_data = json.dumps(event_dict)            
                encoded_data = base64.b64encode(json_data)
                urls.append(mixpanel_api)
                params.append("data=%s&api_key=%s" % (encoded_data, API_KEY))

                #api = "%s?data=%s&api_key=%s" % (mixpanel_api, encoded_data, API_KEY)
                #log.info("Calling API:%s" % api)
                #fp = requests.post(api)
                #log.info("Response:%s " % fp)
                counter += 1
                if (counter % 1000) == 0:
                    for url, body in pool.imap(fetch, urls, params):
                        log.info("API/Response :: %s/%s" % (url, body))
                        #print "API/Response :: %s/%s" % (url, body)
                    urls = []
                    params = []
                    log.info("Records processed till now : %s" % counter)
                    print "Records processed till now : %s" % counter
                    log.info("Time taken : %s" % (time.time() - start_time))
                    print "Time taken : %s" % (time.time() - start_time)                    

    # Process the remaining events
    for url, body in pool.imap(fetch, urls, params):
        log.info("API/Response :: %s/%s" % (url, body))
        #print "API/Response :: %s/%s" % (url, body)
    log.info("Records processed till now : %s" % counter)
    print "Records processed till now : %s" % counter

    distinct_id = 0 
    mp = Mixpanel(PROJECT_TOKEN)
    for event_type in collection_params:
        # Insert into mixpanel
        params = collection_params[event_type]        
        
        event_params = dict()        
        tmp_data = map(lambda x:event_params.setdefault(x, 'test'), params)
        distinct_id += 1
        log.info("\nInsert event type: %s" % event_type)
        log.info("\nInsert event_dict: %s" % event_params)
        mp.track(distinct_id, event_type, event_params)

    log.info("Time taken : %s" % (time.time() - start_time))
    print "Time taken : %s" % (time.time() - start_time)                    

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

def fetch(url, data):
    req = urllib2.Request(url, data)
    body = urllib2.urlopen(req).read()
    return url, body

if __name__ == "__main__":
    main()
