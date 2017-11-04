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

from urllib2 import urlparse, urlopen 
from pylons import config, request, response, tmpl_context as c
from pylons.decorators import jsonify
import json

from flxadmin.lib import helpers as h
from flxadmin.lib.decorators import ajax_login_required
from flxadmin.lib.base import BaseController
from flxadmin.lib.remoteapi import RemoteAPI
from flxadmin.lib.ck12.exceptions import *

import logging
LOG = logging.getLogger( __name__ )


class ApiproxyController(BaseController):
    """ 
    Proxy to API services to bypass js cross-domain problem in local development
    """
    # @jsonify
    def external(self):
        url_raw_str = urlparse.urlparse(request.url).query
        url = url_raw_str.replace('url=', '')
        return urlopen(url).read()
        
    @ajax_login_required()
    # @jsonify
    def proxy(self, raw=False):
        path_and_query_str = urlparse.urlparse(request.url).query
        path_querystr_list = path_and_query_str.split('?')
        path, params = '', {}
        if len(path_querystr_list) > 1 and request.method == 'GET':
            params = urlparse.parse_qs(path_querystr_list[1])
        else:
            params = request.params
        # LOG.debug(path)
        # LOG.debug(params)
        check_status = True
        if "check_status" in params:
            check_status = params.get("check_status")
            if str(check_status) == "false":
                check_status = False

        if len(path_querystr_list) > 0:
            path = urlparse.parse_qs(path_querystr_list[0])
            path = path.get('path', [''])
            path = path[0]
        path = h.remove_starting_slash(path)

        try:
            data = h.makeCall(path, params, raw=raw, check_status=check_status) if request.method=='POST' \
              else h.makeGetCall(path, params, raw=raw, check_status=check_status)
        except Exception, e:
            LOG.exception(e)
            response.headers['Content-Type'] = 'application/json'
            response.status = 500
            return str(e)

        if path.startswith('flxweb/') or raw:
            return data
        else:
            response.headers['Content-Type'] = 'application/json'
            return json.dumps(data)#, cls=json.JSONEncoder)
