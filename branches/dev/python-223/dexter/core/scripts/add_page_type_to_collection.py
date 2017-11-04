from urlparse import urlparse
import time
import logging
import logging.handlers
import pymongo

# Initialise Logger
log = logging.getLogger(__name__)
#hdlr = logging.StreamHandler()
#hdlr = logging.FileHandler('/tmp/add_artifact_creatorID.log')
hdlr = logging.handlers.RotatingFileHandler('/tmp/logs/add_page_type.log', maxBytes=10*1024*1024, backupCount=500)
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
hdlr.setFormatter(formatter)
log.addHandler(hdlr)
log.setLevel(logging.INFO)

# MongoDB configuration
db_hostname = 'localhost'
#db_hostname = 'qadatamgr'
db_port = 27017
db_name = 'dexter'
db_username = 'adsadmin'
db_password = 'D-coD43'
db_replica_set = 'rs0'
db_username = None
db_password = None
db_replica_set = None

branches = [u'arithmetic', u'measurement', u'algebra', u'geometry', u'probability', u'analysis', u'calculus', u'earth-science', u'life-science', u'physical-science', u'biology', u'chemistry', u'physics', u'elementary-math-grade-1', u'elementary-math-grade-2', u'elementary-math-grade-3', u'elementary-math-grade-4', u'elementary-math-grade-5', u'history', u'trigonometry', u'statistics', u'engineering',u'english',u'astronomy', u'english', 'software-testing']

book_types = ['book','tebook','workbook','studyguide','labkit','quizbook']

page_types = {'student': 'student_home_page', 'teacher':'teacher_home_page', 'browse':'browse_page', 'standards':'standards_aligned_page',
              'standard':'standard_home_page', 'ngss':'next_generation_science_standards_page', 'ccss':'common_core_math_standards_page',
              'group':'group_home_page', 'group-discussions': 'group_discussions_page', 'group-resources':'group_resources_page',
              'group-settings':'group_settings_page', 'group-members':'group_members_page', 'group-assignments':'group_assignments_page',
              'group-reports':'group_reports_page' , 'assessment':'assessment_page','editor':'editor_page', 'section':'section_details_page',
              'na':'ghost_concept_details_page', 'concept':'conept_details_page', 'lmspractice':'lmspractice_page', 'saythanks':'thank_you_page',
              'theme':'theme_page'}

def run():
    """Function to add url_pageType to Resolved_FBS_PAGE_VIEW collection.
    """
    stime = time.time()
    db = get_mongo_db()
    results = db.Resolved_FBS_PAGE_VIEW.find()
    total_count = results.count()
    log.info("Total records to Process:%s" % total_count)
    count = 0
    for result in results:
        count += 1
        if (count % 1000) == 0:
            log.info("%s/%s processed, Time:%s" % (count, total_count, (time.time() - stime)))
        url = result['URL']
        if not url:
            continue
        id = result['_id']
        page_type = get_page_type_from_url(url)
        if not page_type:
            log.info("Unable to get paget type for ID/Url:%s/%s" %(id, url))
            continue
        db.Resolved_FBS_PAGE_VIEW.update({'_id':id}, {'$set':{'url_pageType':page_type}})
    log.info("Time taken:%s" % (time.time() - stime))

def get_page_type_from_url(url):
    """
    """
    url = url.strip()
    if not url:
        return
    if url in ['http://www.ck12.org/', 'https://www.ck12.org/']:
        page_type = 'ck12_home_page'
        return page_type
    page_type = 'unknown'
    book_type = ''
    obj = urlparse(url)
    query = obj.query
    tmp_params = query.split('&')
    tmp_params = filter(None, tmp_params)
    query_params = dict(filter(lambda y:len(y) == 2,map(lambda x:x.split('=', 1), tmp_params)))
    path = obj.path
    parts = path.split('/')
    parts = filter(None, parts)

    tmp_type1 = tmp_type2 = tmp_type3 = ''
    try:
        tmp_type1 = parts[0].lower()
        tmp_type2 = parts[1].lower()
        tmp_type3 = parts[2].lower()
    except:
        pass

    if page_types.has_key(tmp_type1):
        page_type = page_types[tmp_type1]
        return page_type

    if tmp_type1 == 'search':
        if query_params.get('source') == 'community':
            page_type = 'community_search_page'
        elif query_params.get('source') == 'my':
            page_type = 'my_search_page'
        else:
            page_type = 'ck12_search_page'
        return page_type
    elif tmp_type1 == 'new' and tmp_type2 == 'concept':
        page_type = 'create_new_concept_page'
    elif tmp_type1.startswith('user:') and tmp_type2 == 'section':
        page_type = 'user_section_details_page'
    elif tmp_type1.startswith('user:') and tmp_type2 == 'concept':
        page_type = 'user_concept_details_page'
    elif tmp_type1 == 'account' and tmp_type2 == 'settings':
        page_type = 'account_setting_page'
    elif tmp_type1 == 'account' and tmp_type2 == 'signin-complete':
        page_type = 'signin_complete_page'
    elif tmp_type1 == 'auth':
        if tmp_type2 == 'signup':
            if tmp_type3 == 'teacher':
                page_type = 'teacher_signup_page'
                return page_type        
            elif tmp_type3 == 'student':
                page_type = 'student_signup_page'
                return page_type        
            elif tmp_type3 == 'complete':
                page_type = 'account_created_page'
                return page_type
            else:
                page_type = 'signup_page'
                return page_type

        elif tmp_type2 == 'signin':
                page_type = 'signin_page'
                return page_type
        elif tmp_type2 == 'forgot' and tmp_type3 == 'password':
                page_type = 'forgot_password_page'
                return page_type

    if tmp_type1 == 'join' and tmp_type2 == 'group':
        page_type = 'group_join_page'
        return page_type

    if tmp_type1 == 'create' and tmp_type2 == 'exercise' and tmp_type3 == 'test':
        page_type = 'create_quiz_page'
        return page_type


    if tmp_type1 in branches or tmp_type2 in branches:
        prefix = ''
        if tmp_type1.startswith('user'):
            prefix = 'user_'
        else:
            prefix = 'ck12_'
        if prefix == 'ck12_':
            if len(parts) == 1: # Eg. http://www.ck12.org/earth-science/
                page_type = '%sbranch_details_page' % prefix
            elif len(parts) == 2: # Eg. http://www.ck12.org/earth-science/Minerals/
                page_type = '%sconcept_details_page' % prefix
            else:
                page_type = '%smodality_details_page' % prefix # Eg. http://www.ck12.org/earth-science/Minerals/lesson/Minerals/?referrer=featured_content
        else:
            if len(parts) == 2: # Eg. http://www.ck12.org/earth-science/
                page_type = '%sbranch_details_page' % prefix
            elif len(parts) == 3: # Eg. http://www.ck12.org/earth-science/Minerals/
                page_type = '%sconcept_details_page' % prefix
            else:
                page_type = '%smodality_details_page' % prefix # Eg. http://www.ck12.org/earth-science/Minerals/lesson/Minerals/
        return page_type
   
    if tmp_type2 in ['dashboard', 'groups', 'library',  'content', 'tests']:
        if tmp_type2 == 'dashboard':
            if obj.fragment == 'selfStudy':
                page_type = 'self_study_page'
                return page_type
            elif obj.fragment == 'groupActivity':
                page_type = 'group_study_page'
                return page_type
        page_type = '%s_page' % tmp_type2
        return page_type

    # Book types occurs either in first or second part of the URL
    if tmp_type1 in book_types:
        book_type = tmp_type1
    elif tmp_type2 in book_types:
        book_type = tmp_type2

    if book_type:
        if parts[-1] == 'section':
            page_type = 'invalid_book_section_details_page'
            return page_type
        if tmp_type1.startswith('user'):
            book_type_tmp = 'user_%s' % book_type
            if 'concept' in tmp_type3: # Book title contains concept
                book_type_tmp = 'user_concept_%s' % book_type
        else:
            book_type_tmp = 'ck12_%s' % book_type
            if 'concept' in tmp_type2: # Book title contains concept
                book_type_tmp = 'ck12_concept_%s' % book_type

        if 'section' in parts:
            # Eg. /book/CK-12-Algebra-I-Concepts/section/1.0/ will be book_chapter_details_page
            # /book/CK-12-Algebra-I-Concepts/section/1/ will be book_chapter_details_page
            # /book/CK-12-Algebra-I-Concepts/section/1.5/ will be book_section_details_page
            section_index = parts.index('section')
            section_no = parts[section_index + 1]
            section_parts = section_no.split('.')
            chapter_no = section_no = ''
            try:
                chapter_no = int(section_parts[0])
                section_no = int(section_parts[1])
            except:
                pass
            if section_no and section_no > 0:
                page_type = '%s_section_details_page' % book_type_tmp
            elif chapter_no:
                page_type = '%s_chapter_details_page' % book_type_tmp
            else:
                page_type = '%s_details_page' % book_type_tmp
        else:
            page_type = '%s_details_page' % book_type_tmp

    return page_type

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
