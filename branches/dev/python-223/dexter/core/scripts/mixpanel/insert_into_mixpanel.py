import logging
import pymongo
from mixpanel import Mixpanel

# Initialise Logger
log = logging.getLogger(__name__)
#hdlr = logging.StreamHandler()
hdlr = logging.FileHandler('/tmp/mx_logs/mixpanel_insert.log')
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
# CK-12 Test
PROJECT_TOKEN = '657fed1b2b3213980209974573508d75'

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
    """Insert one record of every Resolved event into mixpanel.
    """
    mp = Mixpanel(PROJECT_TOKEN)
    db = get_mongo_db()
    for collection_name in db.collection_names():
        if not collection_name.startswith('Resolved_'):
            continue
        log.info("Processing collection: %s" % collection_name)
        event_type = collection_name.replace('Resolved_', '').lower()
        if event_type not in event_type_mapping:    
            log.info("No event mapping available for collection:%s" % collection_name)
            continue
        event_type = '%s' % event_type_mapping[event_type]
        log.info("Event Type: %s" % event_type)
        coll = db[collection_name]
        events = coll.find().sort('$natural', 1).limit(1)
        event_data = {}
        for event in events:
            event_data = event
        log.info("Got the event data: %s" % event_data)
        if event_data.has_key('visitorID'):
            distinct_id = event_data['visitorID']
        elif event_data.has_key('memberID'):
            distinct_id = event_data['memberID']
        else:
            log.info("No distinct_id found for collection: %s" % collection_name)
            continue

        event_params = dict()
        for event_key in event_data:
            # Remove unnecessary parameters
            if event_key in remove_keys:
                continue
            # Get the updated parameter keys for Mixpanel
            param_key = metadata_mapping.get(event_key, event_key)
            event_params[param_key] = event_data[event_key]

        if event_params.has_key('subject') and event_params['subject']:
            sub = event_params['subject']
            event_params['subject'] = subject_mapping.get(sub, sub)
        if event_params.has_key('branch') and event_params['branch']:
            branch = event_params['branch']
            event_params['branch'] = branch_mapping.get(branch, branch)

        # Record the event
        log.info("distinct_id: %s" % distinct_id)
        log.info("event_type: %s" % event_type)
        log.info("event_params: %s" % event_params)
        mp.track(distinct_id, event_type, event_params)

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
