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
import formencode
from formencode import validators

import logging
LOG = logging.getLogger( __name__ )


class ApplicationManagementForm(formencode.Schema):
    term = validators.String(not_empty=True)
    termTxt = validators.String(not_empty=False)
    allow_extra_fields = True
    
    med = 'info xmed'
    ordered_fields_android = [ h.labelreadonly(*vals) if 'info' in vals[2] else \
                       h.labelinput(*vals) for vals in [
     ('Current Version', 'current_version_android', 'xmed'), 
     ('Min. Supported version', 'minimum_version_android', 'xmed'),
    ]]
    
    ordered_fields_ios = [ h.labelreadonly(*vals) if 'info' in vals[2] else \
                       h.labelinput(*vals) for vals in [
     ('Current Version', 'current_version_ios', 'xmed'), 
     ('Mi. Supported version', 'minimum_version_ios', 'xmed'),
    ]]

    ordered_fields_popup = [ h.labelinput(*vals) for vals in [
        ('Title', 'popup_title', 'xmed'),
        ('Body', 'popup_body', 'xmed'),
        ('Action Label', 'popup_action_label', 'xmed'),
        ('Action', 'popup_action', 'xmed'),
        ('Dismiss Label', 'popup_dismiss_label', 'xmed'),
        ('Updated at', 'popup_update_time', 'xmed')
    ]]

class ApplicationmanagementController(BaseController):
    """ for: Mobile Application Version Management Related Activities,
    """

    @login_required()
    def applicationManagementForm(self,):
        """ Application Management Template
        """

        template = '/applications/application_management.html'
        c.pagetitle = 'Mobile Application Version Management'

        c.crumbs = h.htmlalist(['home'])
        c.form = ApplicationManagementForm()
        c.createOrSave = 'Save'

        appName = request.params.get("appName", "ck12practice")
        c.appName = appName
        data = h.api('/assessment/api/app/versions', params={'appName': appName})
        apps = h.traverse(data, ['response'])
        defaults = {}
        c.branch = None
        if apps and apps.has_key('app_version_support'):
            defaults['current_version_android'] = apps['app_version_support']['android']['current']
            defaults['minimum_version_android'] = apps['app_version_support']['android']['min']
            defaults['current_version_ios'] = apps['app_version_support']['ios']['current']
            defaults['minimum_version_ios'] = apps['app_version_support']['ios']['min']
            c.branches = apps.get('branch_updates')
            defaults.update(h.app_verion_branch_defaults(c.branches))
        if apps and apps.has_key('popup_message'):
            defaults['popup_title'] = apps['popup_message']['title']
            defaults['popup_body'] = apps['popup_message']['body']
            defaults['popup_update_time'] = apps['popup_message']['update_time']
            defaults['popup_action_label'] = apps['popup_message']['action_label']
            defaults['popup_dismiss_label'] = apps['popup_message']['dismiss_label']
            defaults['popup_action'] = apps['popup_message']['action']

        if request.method == 'GET':
            c.success = h.flash.pop_message()
            if apps:
                return htmlfill.render(render(template), defaults)
            else:
                return htmlfill.render(render(template))
