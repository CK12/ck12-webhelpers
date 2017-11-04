import time
import logging
import Cookie
import json
from sts.lib.remoteapi import RemoteAPI
from sts.model import api
from sts.lib.unicode_util import UnicodeDictReader

# Initialise Logger
log = logging.getLogger(__name__)
hdlr = logging.StreamHandler()
#hdlr = logging.handlers.RotatingFileHandler('/tmp/update_concept_description.log', maxBytes=20*1024*1024, backupCount=5)
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
hdlr.setFormatter(formatter)
log.addHandler(hdlr)
log.setLevel(logging.INFO)

input_csv_file = '/tmp/concept_description_data.csv'

CK12_USER = 'admin'
CK12_KEY = 'notck12'
AUTH_TYPE = 'ck-12'

def run():
    """Main function.
    """
    stime = time.time()
    fp = open(input_csv_file, 'rb')
    csv_reader = UnicodeDictReader(fp)
    auth_cookies = get_auth_cookies()
    log.info('auth_cookies:%s' % auth_cookies)
    kwargs = dict()
    count = 0
    for row in csv_reader:
        count += 1
        log.info("Processing row:%s" % str(row))    
        if (count % 100) == 0:
            log.info("Till now processed rows:%s, Time Taken:%s" % (count, (time.time() - stime)))
        eid = row['EID']
        desc = row['SHORT DESCRIPTION'].strip()
        if not desc:
            log.info("Description is empty")
            continue
        con_node = api.getConceptNodeByEncodedID(eid)
        if not con_node:
            log.info("No concept exists for Concept EncodedID:%s" % eid)
            continue
        kwargs['id'] = con_node.id
        kwargs['description'] = desc
        kwargs['cookies'] = auth_cookies
        node = api.updateConceptNode(**kwargs)
        log.info("Updated concept node: %d %s" % (node.id, node.encodedID))

    log.info("Total Records Processed:%s" % count)
    log.info("Time Taken:%s" % (time.time() - stime))

def get_auth_cookies():
    """Returns the auth cookies.
    """
    api_error_msg = "login API response not as excepted"
    auth_cookies = None
    try:
        api = 'http://gamma.ck12.org/auth/login/member'
        params_dict = {'login': CK12_USER, 'token': CK12_KEY, 'authType': AUTH_TYPE}
        data = RemoteAPI.makeAuthServiceGetCall(api, params_dict=params_dict, raw_response=True)        
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
