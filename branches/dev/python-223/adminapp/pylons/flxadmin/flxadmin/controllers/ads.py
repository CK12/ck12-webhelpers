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

from pylons import config, request, tmpl_context as c
from pylons.templating import render_jinja2 as render
from pylons.controllers.util import redirect
from pylons.decorators import jsonify
from formencode import htmlfill
import urllib, json

from flxadmin.lib import helpers as h
from flxadmin.lib.decorators import login_required, ajax_login_required
from flxadmin.lib.base import BaseController
from flxadmin.lib.remoteapi import RemoteAPI
from flxadmin.lib.ck12.exceptions import *

import logging
LOG = logging.getLogger( __name__ )


class AdsController(BaseController):
    
    @login_required()
    def test_query(self):
        """ test out queries
        """
        template = '/ads/testquery.html'
        c.pagetitle = 'Test ADS query'
        c.server = config['flxweb_host_url']
        json_obj = {
         "eg": "exercise",
         "ml": "time_spent:sum",
         "dl": "artifacts:tag",
         "ft": "artifacts:. users:1",
         "gb": "artifacts:tag"
        }
        c.json_str = json.dumps(json_obj, indent=0)
        json_obj['debug'] = 1
        c.result = urllib.urlencode(json_obj)
        return render(template)

    @ajax_login_required()
    @jsonify
    def encode_query(self):
        params = request.params
        json_obj = json.loads(params.get('params'))
        if params.get('debug'):
            json_obj['debug'] = 1
        return {
            'url': urllib.urlencode(json_obj)
        }
