import logging
import Cookie
import json
from sts.lib.remoteapi import RemoteAPI
from sts.model import api
from unicode_util import UnicodeDictReader

# Initialise Logger
log = logging.getLogger(__name__)
#hdlr = logging.StreamHandler()
hdlr = logging.handlers.RotatingFileHandler('/tmp/update_cover_images.log', maxBytes=20*1024*1024, backupCount=5)
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
hdlr.setFormatter(formatter)
log.addHandler(hdlr)
log.setLevel(logging.INFO)

input_csv_file = '/tmp/cover_image_data.csv'

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
        eid = row['concept EID']
        preview_image_url = row ['previewImageURL'].strip()
        if not preview_image_url:
            log.info("previewImageURL is empty")
            continue
        con_node = api.getConceptNodeByEncodedID(eid)
        if not con_node:
            log.info("No concept exists for Concept EncodedID:%s" % eid)
            continue
        kwargs['id'] = con_node.id
        kwargs['subjectID'] = con_node.subject['subjectID']
        kwargs['branchID'] = con_node.branch['branchID']
        kwargs['previewImageUrl'] = preview_image_url
        kwargs['cookies'] = auth_cookies
        node = api.updateConceptNode(**kwargs)
        log.info("Updated concept node: %d %s" % (node.id, node.encodedID))

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
