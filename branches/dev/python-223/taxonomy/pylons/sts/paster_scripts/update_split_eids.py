import logging
import logging.handlers
import Cookie
import json

from unicode_util import UnicodeDictReader
from sts.lib.remoteapi import RemoteAPI
from sts.model import api
import sts.controllers.subjectbranch as sb

# Initialise Logger
log = logging.getLogger(__name__)
#hdlr = logging.StreamHandler()
hdlr = logging.handlers.RotatingFileHandler('/tmp/logs/create_split_eids.log', maxBytes=20*1024*1024, backupCount=5)
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
hdlr.setFormatter(formatter)
log.addHandler(hdlr)
log.setLevel(logging.INFO)

input_csv_file = '/tmp/split_eids_data.csv'

CK12_USER = 'admin'
CK12_KEY = 'notck12'
AUTH_TYPE = 'ck-12'

def run():
    """Main function.
    """
    fp = open(input_csv_file, 'rb')
    csv_reader = UnicodeDictReader(fp)
    auth_cookies = get_auth_cookies()
    log.info('auth_cookies:%s' % auth_cookies)
    kwargs = dict()    
    for row in csv_reader:
        log.info("Processing row:%s" % str(row))
        try:
            grade = row['Grades']
            if grade == 'split':
                continue
            parent_eid = row['Original.EID']
            child_eid = row['New.EID']
            concept_title = row['Title.of.Concept']
            eid_parts = parent_eid.split('.')
            subject_shortname = eid_parts[0]
            branch_shortname = eid_parts[1]

            parent = api.getConceptNodeByEncodedID(parent_eid)            
            if not parent:
                raise Exception("No parent exists for parent encodedID:%s"% parent_eid)
            subject = sb.getSubject(subject_shortname)
            if not subject:
                raise Exception("No subject exists for subject shortname:%s"% subject_shortname)
            branch = sb.getBranch(branch_shortname)
            if not branch:
                raise Exception("No branch exists for branch shortname:%s"% branch_shortname)

            kwargs = {
                'name': concept_title,
                'subjectID': subject.id,
                'branchID': branch.id,
                'parentID': parent.id,
                'encodedID': child_eid,
                'cookies': auth_cookies,
            }
            node = api.createConceptNode(**kwargs)
            log.info("Created concept node: %d %s" % (node.id, node.encodedID))
        except Exception as e:
            log.info("Unable to process the record: (%s/%s), Exception:%s" % (parent_eid, child_eid, str(e)))

def get_auth_cookies():
    """Returns the auth cookies.
    """
    api_error_msg = "login API response not as excepted"
    auth_cookies = None
    try:
        params_dict = {'login': CK12_USER, 'token': CK12_KEY, 'authType': AUTH_TYPE}
        data = RemoteAPI.makeAuthServiceGetCall('login/member', params_dict=params_dict, raw_response=True)        
        auth_cookies_str = data.headers.getheader('Set-Cookie')
        auth_cookies = Cookie.SimpleCookie(auth_cookies_str)
        result = data.read()
        result = json.loads(result)
        if not 'response' in result or not 'id' in result['response']:
            raise Exception(api_error_msg)
    except Exception as e:
        raise e
    return auth_cookies
    
if __name__ == "__main__":
    run()
