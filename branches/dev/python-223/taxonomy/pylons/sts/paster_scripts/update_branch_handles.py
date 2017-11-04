import logging
import Cookie
import json
from sts.lib.remoteapi import RemoteAPI
from sts.model import api
from sts.model.model import name2Handle
from unicode_util import UnicodeDictReader

# Initialise Logger
log = logging.getLogger(__name__)
#hdlr = logging.StreamHandler()
hdlr = logging.handlers.RotatingFileHandler('/tmp/logs/update_branch_handles.log', maxBytes=20*1024*1024, backupCount=5)
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
hdlr.setFormatter(formatter)
log.addHandler(hdlr)
log.setLevel(logging.INFO)

CK12_USER = 'admin'
CK12_KEY = 'notck12'
AUTH_TYPE = 'ck-12'

def run():
    """Main function.
    """
    auth_cookies = get_auth_cookies()
    branches = api.getBranches(pageNum=1, pageSize=100)
    for branch in branches:
        update_dict = dict()
        update_dict['id'] = branch.id
        update_dict['handle'] = name2Handle(branch.name)
        update_dict['cookies'] = auth_cookies
        if branch.name.lower() == 'my branch':
            node = api.updateBranch(**update_dict)
            log.info("Updated branch name/handle: %s/%s" % (node.name, node.handle))

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
