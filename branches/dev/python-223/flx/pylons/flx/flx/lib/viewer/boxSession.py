#
# Copyright 2007-2013 CK-12 Foundation
#
# All rights reserved
#      
#
# Unless required by applicable law or agreed to in writing, software
# distributed under this License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
# implied.  See the License for the specific language governing
# permissions and limitations.
#
# This file originally written by Somnath Zankar
#

import urllib
import urllib2
import simplejson
from pylons import config
import logging

log = logging.getLogger(__name__)


def create_session(document_id):
    """
    function to create box viewer session ID
    """
    url = config.get('box_url')+'sessions'
    log.info('Session Box URL---:%s'%(url))
    params = {"document_id": document_id, "duration": 60}
    log.info('Session Box params---:%s'%(params))
    params = simplejson.dumps(params)
    
    token = "Token "+ config.get('box_view_token')
    headers = { "Content-type" : "application/json","Authorization": token }
    try:
        req = urllib2.Request(url, params, headers)
    
        response = urllib2.urlopen(req)
        the_page = response.read()
        data = simplejson.loads(the_page)
        log.info('Session Box data---:%s'%(data))
        return data['id']
        
    except urllib2.HTTPError as e:
        error_message = e.read()
        log.error('Error creating session for document_id=%s is %s'%(document_id, error_message))
    

