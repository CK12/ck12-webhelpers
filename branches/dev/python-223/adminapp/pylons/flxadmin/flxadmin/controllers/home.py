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

from flxadmin.lib.decorators import login_required
from flxadmin.lib.base import BaseController
from flxadmin.lib import helpers as h

import logging
LOG = logging.getLogger( __name__ )


class HomeController(BaseController):
    """ Admin home page 
    """
    @login_required()
    def index(self):
        c.pagetitle = "Admin Home"
        return render('/home.html')
