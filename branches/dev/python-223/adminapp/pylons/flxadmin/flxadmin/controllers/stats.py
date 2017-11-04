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

from flxadmin.forms.stats import SayThanksForm
from flxadmin.lib import helpers as h
from flxadmin.lib.base import BaseController
from flxadmin.lib.ck12.errorcodes import ErrorCodes
from flxadmin.lib.decorators import login_required, ajax_login_required
from flxadmin.lib.remoteapi import RemoteAPI
from formencode import htmlfill
from pip import req
from pylons import config, request, tmpl_context as c
from pylons.controllers.util import redirect
from pylons.decorators import jsonify
from pylons.templating import render_jinja2 as render
from symbol import except_clause

import logging


LOG = logging.getLogger( __name__ )


class StatsController(BaseController):
    """ for: Say Thanks, and other stats
    """
    @login_required()
    def saythanks(self):
        """ Say thanks stats
        """
        c.cancel = request.url
        template = '/stats/saythanks.html'
        prvlink = '/stats/saythanks'
        c.pagetitle = 'Say Thanks Stats'
        c.crumbs = h.htmlalist(['home'])
        c.form = SayThanksForm()
        params = request.params
        
        if(params.has_key('del')):
            api_root_delete = '/delete/downloadStatsTypes/'
            msg_delete = 'Source type deleted successfully'
            h.api(api_root_delete + params['del'] , {}, msg_delete)
            c.cancel = h.url_(prvlink)
            
        data = h.api('get/downloadStatsTypes')
        stats = h.traverse(data, ['response', 'downloadstatstypes'])
        c.stats_dict = h.to_dict(stats)
        # date updated dict to hold key values for dates updated for items.
        d = {}
        for ls in stats:
            if len(ls) > 1:
                d[ls[0]] = h.compact(ls[2])
        
        c.date_updated_dict = d
        
        if request.method == 'GET':
            c.success = h.flash.pop_message()
            return htmlfill.render(render(template), c.stats_dict)
        elif request.method == 'POST':
            if not h.validate_integer(params, c.form):
                c.success = h.flash.pop_message()
                return htmlfill.render(render(template), c.form_result)
            
            api_root = 'update/downloadStatsTypes/'
            msg = 'Data Updated Successfully.'
            appstore_data, appstore_changed = None, False
            for key,value in c.stats_dict.items():
                for paramKey,paramValue in params.items():
                    if(str(key) == str(paramKey) and str(value) != str(paramValue) ):
                        appstore_data = h.api(api_root + str(paramKey) + '/' + str(paramValue), {}, msg)
                        appstore_changed = True
                
            if (appstore_changed and not appstore_data):
                return htmlfill.render(render(template), c.form_result)
            return redirect(request.url)
        

    @login_required()
    def addDownloadStatsType(self):
        c.re_url = request.url
        template = '/stats/saythanks.html'
        c.pagetitle = 'Say Thanks Stats'
        c.crumbs = h.htmlalist(['home'])
        params = request.params
        c.form = SayThanksForm()
        data = h.api('get/downloadStatsTypes')
        stats = h.traverse(data, ['response', 'downloadstatstypes'])
        c.stats_dict = h.to_dict(stats)
        # date updated dict to hold key values for dates updated for items.
        d = {}
        for ls in stats:
            if len(ls) > 1:
                d[ls[0]] = h.compact(ls[2])
        
        c.date_updated_dict = d
        
        if (str(request.method).upper() == "GET"):
            c.success = h.flash.pop_message()
            return htmlfill.render(render(template), c.stats_dict)
        
        downloadStatType = params['downloadStatType']
        if not h.validate_new_stat_type(downloadStatType, c.form, c.stats_dict):
            return htmlfill.render(render(template), c.stats_dict)
        api_root = 'add/downloadStatsTypes/'
        msg = 'Source Type added successfully'
        response = h.api(api_root + downloadStatType,{}, msg)
        if not response:
            return htmlfill.render(render(template), c.stats_dict)
        return redirect(c.re_url)
    
    
    # raw json or xhtml renderers, for url type-in use, not called in app
    @login_required()
    @jsonify
    def saythanks_raw(self):
        return h.api_raw('get/downloadStatsTypes')
