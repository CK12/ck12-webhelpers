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
# This file originally written by Nachiket Karve
#
# $Id: about.py 12495 2011-08-26 19:15:18Z ravi $

import logging
from flxweb.lib.base import BaseController
from pylons.templating import render_jinja2
from pylons import request, response, config, tmpl_context as c

log = logging.getLogger(__name__)

class IlowrapperController(BaseController):
    """
    Controller for handling the "about" pages. 
    """
    
    def index(self):
        """
        Default action for rendering the about page.
        """
        iloname = request.GET.get('ilo')
        iloconfig = {}
        for key in request.GET:
            if key.startswith('ilo.'):
                val = request.GET.get(key)
                key = key.replace('ilo.','')
                iloconfig[key]=val
        c.iloname = iloname
        c.iloconfig = iloconfig
        #response.headers['Access-Control-Allow-Origin'] = config.get('ilo_server_url')
        #response.headers['Access-Control-Allow-Origin'] = '*'
        
        return render_jinja2 ('/ilowrapper/ilowrapper.html')
