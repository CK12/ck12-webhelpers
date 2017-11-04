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
from pylons.decorators import jsonify

log = logging.getLogger(__name__)

class EdmodoController(BaseController):
    """
    Controller for edmodo apps 
    """
    
    @jsonify
    def install(self, app_name):
        return {
                'status':'success'
        }

    def launch(self, app_name):
        return render_jinja2('learningapp/practiceapp.html')