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
# This file originally written by Ravi Gidwani
#
# $Id$

from pylons import url,request,response, tmpl_context as c
from pylons.controllers.util import redirect
from flxweb.lib.base import BaseController
from flxweb.lib.ck12.decorators import login_required
from pylons.templating import render_jinja2

class DashboardController(BaseController):
    
    @login_required()
    def dashboard_new(self):
        if c.user.isTeacher() and '/dashboard/student' not in request.path:
            return redirect("/my/dashboard-new/")

        return render_jinja2('/dashboard/dashboard.html')
