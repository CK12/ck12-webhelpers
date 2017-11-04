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

from pylons import request, tmpl_context as c, session
from pylons.templating import render_jinja2 as render
from formencode import htmlfill
from flxadmin.lib import helpers as h
from flxadmin.lib.decorators import login_required
from flxadmin.lib.base import BaseController

import logging
LOG = logging.getLogger( __name__ )


class DexterController(BaseController):
    """ for: Dexter related information,
    """

    @login_required()
    def stateSchoolForm(self,):
        """ State School Template
        """
        template = '/dexter/school_artifacts.html'
        c.pagetitle = 'State Schools Artifacts Information'
        prevlink = '/manage/schools'
        prevText = 'Manage Schools'
        c.crumbs = h.htmlalist(['home'])
        c.crumbs.append(h.htmla_(prevlink, prevText))
        user = session.get( 'user' )
        c.loggedInUserID = user.get('id')
        if request.method == 'GET':
            return htmlfill.render(render(template))

