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

from flxadmin.lib.decorators import login_required, ajax_login_required
from pylons import config, request
from flxadmin.lib.base import BaseController
from pylons.decorators import jsonify
from flxadmin.lib.ck12.exceptions import *
from flxadmin.forms.groups import *
from flxadmin.model.lms import LmsManager as LmsManager
from pylons.templating import render_jinja2 as render
from formencode import htmlfill
from pylons.controllers.util import redirect
from pylons import request, tmpl_context as c
from flxadmin.forms.options import getviewmode
from webhelpers import paginate
from flxadmin.lib import helpers as h
from flxadmin.forms.lms import LTIAppsForm, LTIAppForm
import simplejson
import logging
log = logging.getLogger( __name__ )


class LmsController(BaseController):
    """
    
    """
    
    @login_required()
    def lti_apps(self):
        """ LIT app Entries listing page, 
        """
        template = '/lti/lti_apps.html'
        c.pagetitle = 'LTI Applications'
        c.crumbs = h.htmlalist(['home'])
        c.form = LTIAppsForm()
        c.viewmode = request.params.get('viewmode', getviewmode('specialsearchentries'))
        return render(template)

    @ajax_login_required()
    def lti_apps_list(self):
        """  list data, for ajax calls
        """
        template = '/lti/lti_apps_list.html'
        
        params = dict(request.params)
        if params and params.has_key('search') and params['search']:
            for searchType in params['search'].split(';'):
                if 'termLike,' in searchType:
                    params['termLike'] = searchType.split(',')[1]
        c.viewmode = request.params.get('viewmode', getviewmode('lti_apps'))
        searchPath = '/auth/get/applications'
        searchKey = 'applications'
        pageSize = 25
        pageUrl = paginate.PageURL(h.url_(searchKey), dict(params))
        pageNum = h.modify_page_attrs(params, pageSize)
        result, total = h.page_get(searchPath, params, searchKey)
        c.paginator = paginate.Page(result, pageNum, pageSize, total,url=pageUrl, presliced_list=True)
        return render(template)

    @login_required()
    def lti_app(self, provider=None, site=None):
        """ LTI APP details
        """
        template = '/lti/lti_app.html'
        c.pagetitle = 'LTI App Details'

        prvlink = ('/lit_apps', "LTI Applications")
        c.crumbs = h.htmlalist(['home', prvlink])
        c.form = LTIAppForm()
        c.is_pane = request.params.get('viewmode', '').startswith('pane')
        c.cancel = '' if c.is_pane else h.url_(prvlink[0])
        c.isNewApp = (provider == 'new' and site and site == 'app')
        c.createOrSave = 'Create' if c.isNewApp else 'Update'
        if not site:
            site = request.params.get('site')
        c.term = None

        if not c.isNewApp:
            c.site = site
            data = h.api('auth/get/applications', {'site' : site, 'provider': provider})
            c.app = h.traverse(data, ['response'])
            defaults = {}

        if request.method == 'GET':
            c.success = h.flash.pop_message()

            if not c.isNewApp:
                return htmlfill.render(render(template), defaults)
            else:
                return htmlfill.render(render(template))

        elif request.method == 'POST':
            pass
        return redirect(request.url)

    @ajax_login_required()
    def get_raw_all_lms_providers(self):
        """
            raw lms providers data for ajax calls.
        """
        params = dict(request.params)
        includeAppInfo = params.get('includeAppInfo', 'false').lower() == 'true'
        lmsProviders =  LmsManager.getAllLMSProviders(includeAppInfo=includeAppInfo)

        return simplejson.dumps(lmsProviders)

    @ajax_login_required()
    def get_raw_lms_provider_apps(self, providerID):
        """
            raw lms provider apps data for ajax calls.
        """
        lmsProviderApps =  LmsManager.getLMSProviderAppsByProviderID(providerID=int(providerID))

        return simplejson.dumps(lmsProviderApps)

    @ajax_login_required()
    @jsonify
    def get_lms_provider_app_users(self):
        params = dict(request.params)
        return LmsManager.get_lms_provider_app_users(params.get('userIDs',None))
