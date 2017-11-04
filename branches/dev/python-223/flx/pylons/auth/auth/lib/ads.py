#
# Copyright 2007-2011 CK-12 Foundation
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
#
# $Id: ads.py 17328 2012-04-03 23:45:52Z wei.shao $

import logging, urlparse
from paste.deploy.converters import asbool
from pylons import request, config
from auth.lib.remoteapi import RemoteAPI

log = logging.getLogger(__name__)

def logExternalRequest(action, member=None):
    """
    Sends an event to ADS to record an access of an artifact from a non-CK12 site.
    
    Arguments:
    action -- action performed by server
    member -- (optional) member object
    """
    try:
        if not asbool(config.get('ads_log_external_request', False)):
            return
        
        referer = request.environ.get('HTTP_REFERER') or \
                  request.headers.get('REFERER', '')
        external = action and not action.startswith('_') and referer and not urlparse.urlparse(referer).netloc.lower().__contains__('ck12.org')
        if external:
            ip = request.environ.get('HTTP_X_FORWARDED_FOR') or \
                 request.headers.get('X_FORWARDED_FOR') or \
                 request.environ.get('REMOTE_ADDR', '')
            log.info('action: %s|member: %s|referer: %s|ip: %s|params: %s',
                     action, (member and member.id) or '', referer, ip, (request.params and request.params.items()) or '')
            params = {
                'g': 'flx_external_request',
                'e': 'dummy',
                'v': 1,
                'd': [(member and member.id) or ''],
                'a': [action, referer[:100], ip[:100]],
                'json': 1  # RemoteAPI expects JSON response
            }
            RemoteAPI._makeCall(config.get('ads_url_prefix'), 'event', 100, params_dict=params)
    except Exception, e:
        log.error('Unexpected error: %s', e)
        
