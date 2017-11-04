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

from pylons import request, tmpl_context as c, response
from pylons.templating import render_jinja2 as render
from webhelpers import paginate
from formencode import htmlfill
from pylons.controllers.util import redirect

from flxadmin.lib import helpers as h
from flxadmin.lib.decorators import login_required, ajax_login_required
from flxadmin.lib.base import BaseController
from flxadmin.forms.options import getviewmode
import json
from urllib import quote
from pylons import config
import re
from flxadmin.forms.specialSearch import SearchControllerForm, SearchEntryForm, trySpecialSearchForm
import logging
LOG = logging.getLogger( __name__ )


class SpecialsearchController(BaseController):
    """ for: search listing, details,
    """
    def __init__(self):
        self.params = {}

    def loadEntryTypes(self):
        try:
            entryOptions = {}
            entryTypes = re.sub(';\s*', '\n', config.get('special_search_entry_type')).split('\n')
            for eachType in entryTypes:
                entryTypeName, entryKeys = tuple(eachType.split('='))
                entryKeys = entryKeys.split(',')
                entryOptions[entryTypeName] = entryKeys
            entryTypes = [('', 'Select')]
            for each in entryOptions.keys():
                entryTypes.append((each, each))
            entryTypes = sorted(entryTypes, key = lambda x: x[0].lower())
            return entryTypes, entryOptions
        except Exception as e:
            LOG.error("Error loading special_search_entry_types: %s" %str(e))
            return [], {}

        
    def getData(self, term):
        data = h.api('/get/info/specialSearchEntry', {'term' : term})
        c.entry = h.traverse(data, ['response'])
        defaults = {
        }
        if c.entry :
            defaults.update(c.entry)
            defaults.update(h.special_search_entry_defaults(defaults['entry']))
            #value=key+":"+str(defaults['entry'][key]) if key else ''
            #defaults.update({'entry': value })
            c.entry = defaults
        return defaults

    def validate_entry(self, dict_obj):
        hasError = False
        self.params = {}
        entry = {}
        for key in dict_obj:
            if (key.startswith("key") or key.startswith("value")) and not key.strip():
                hasError = True
            elif key.startswith("value"):
                continue
            elif key.startswith("key"):
                key_id = key.strip('key')
                entry.update({dict_obj[key]: dict_obj['value%s' % key_id]})
            self.params[key] = dict_obj[key]
        self.params['entry'] = json.dumps(entry)
        return (not hasError)

    @login_required()
    def specialSearchEntry(self, term=None, entry=None):
        """ Search Term Details
        """
        template = '/search/specialsearchentry.html'
        c.pagetitle = 'Special Search Term Details'
        prvlink = ('/specialsearchentries', "Special Search Entries")
        c.crumbs = h.htmlalist(['home', prvlink])
        c.form = SearchEntryForm()
        c.is_pane = request.params.get('viewmode', '').startswith('pane')
        c.cancel = '' if c.is_pane else h.url_(prvlink[0])
        c.isNewEntry = (term == 'new' and entry and entry == 'entry')
        c.deleteSearchTerm = (term == 'delete' and entry and entry == 'entry')
        c.createOrSave = 'Create' if c.isNewEntry else 'Update'
        if not term:
            term = request.params.get('spterm')
        c.term = None

        c.entryTypes , c.entryOptions = self.loadEntryTypes()
        if not c.isNewEntry and not c.deleteSearchTerm:
            c.term = term
            defaults = self.getData(term)

        action = ''
        success_messages = {'created': 'Special Search Entry Successfully Created!',
                            'updated': 'Special Search Entry Successfully Updated!'}
        if request.method == 'GET':
            c.success = None#h.flash.pop_message()
            if not c.success and request.cookies.get('flxadmin-search-entry-action'):
                c.success = success_messages[request.cookies.get('flxadmin-search-entry-action')]
                domain = config.get('ck12_login_cookie_domain')
                response.set_cookie('flxadmin-search-entry-action', '', path="/", domain=domain, max_age=-100)

            if not c.isNewEntry and not c.deleteSearchTerm:
                return htmlfill.render(render(template), defaults)
            else:
                return htmlfill.render(render(template))

        elif request.method == 'POST':
            if not c.deleteSearchTerm and not h.validate(request.params, c.form):
                return htmlfill.render(render(template), c.form_result)
            
            #Don't validate entry field in case of delete action
            if not c.deleteSearchTerm and not self.validate_entry(dict(request.params)):
                c.form_errors = {'entry': 'Invalid value for entry parameter'}
                return htmlfill.render(render(template), c.form_result)

            if c.isNewEntry:
                params = h.keep_only(self.params, {
                 'entry': 'entry',
                 'term': 'term',
                 'entryType': 'entryType' 
                })
                post_data = h.api_post('/flx/create/specialSearchEntry', params)
                action = 'created'
                if not post_data:
                    c.success = h.flash.pop_message()
                    return htmlfill.render(render(template), c.form_result)
            elif c.deleteSearchTerm:
                params = h.keep_only(request.params, {
                 'term': 'term'
                })
                post_data = h.api_post('/flx/delete/specialSearchEntry', params)
                if post_data and post_data['responseHeader']['status'] == 0 and post_data['response']:
                    return json.dumps({'success': True})
                else:
                    return json.dumps({'success': False})
            else:
                params = h.keep_only(self.params, {
                 '_id': 'id',
                 'entry': 'entry',
                 'term': 'term',
                 'entryType': 'entryType' 
                })
                post_data = h.api_post('/flx/update/specialSearchEntry', params)
                action = 'updated'
                if not post_data:
                    return htmlfill.render(render(template), c.form_result)
            if post_data or c.is_pane:
                #c.success = h.flash.pop_message()
                domain = config.get('ck12_login_cookie_domain')
                response.set_cookie('flxadmin-search-entry-action', action, path="/", domain=domain, max_age=100)
                redirect(h.url_(('/specialsearchentry?spterm=%s' % quote(params['term'])), qualified = True))
        return redirect(request.url)

    @login_required()
    def specialSearchEntries(self):
        """ special Search Entries listing page, 
        """
        template = '/search/specialsearchentries.html'
        c.pagetitle = 'Special Search Entry'
        c.crumbs = h.htmlalist(['home'])
        c.form = SearchControllerForm()
        c.viewmode = request.params.get('viewmode', getviewmode('specialsearchentries'))
        return render(template)

    @ajax_login_required()
    def specialSearchEntries_list(self):
        """  list data, for ajax calls
        """
        template = '/search/specialsearchentries_list.html'
        
        params = dict(request.params)
        if params and params.has_key('search') and params['search']:
            for searchType in params['search'].split(';'):
                if 'termLike,' in searchType:
                    params['termLike'] = searchType.split(',')[1]
        c.viewmode = request.params.get('viewmode', getviewmode('specialsearchentries'))
        searchPath = '/flx/get/info/specialSearchEntries'
        searchKey = 'entries'
        pageSize = 25
        pageUrl = paginate.PageURL(h.url_(searchKey), dict(params))
        pageNum = h.modify_page_attrs(params, pageSize)
        result, total = h.page_get(searchPath, params, searchKey)
        for each_result in result:
            entries = []
            for each_entry in each_result['entry']:
                entries.append("%s:%s"% (each_entry, each_result['entry'][each_entry]))
            each_result['entry'] = ", ".join(entries)
            each_result['term'] = quote(each_result['term'].encode('utf-8'))
        c.paginator = paginate.Page(result, pageNum, pageSize, total,url=pageUrl, presliced_list=True)
        return render(template)

    @ajax_login_required()
    def trySpecialSearch(self):
        """ special Search Entries listing page, 
        """
        template = '/search/tryspecialsearch.html'
        c.pagetitle = 'Special Search Entry'

        prvlink = ('/specialsearchentries', "Special Search Entries")
        c.crumbs = h.htmlalist(['home', prvlink])
        c.form = trySpecialSearchForm()
        c.viewmode = request.params.get('viewmode', getviewmode('tryspecialsearch'))
        return render(template)

    @ajax_login_required()
    def tryspecialsearch_list(self):
        """  list data, for ajax calls
        """
        key = str(request.params.get('search',''))
        key=key.split(',')[-1]

        template = '/search/tryspecialsearch_list.html'
        params = dict(request.params)
        c.viewmode = request.params.get('viewmode', getviewmode('tryspecialsearch'))
        searchPath = '/flx/match/info/specialSearchEntries'
        params['term'] = key
        searchKey = 'entries'
        pageSize = 25
        pageUrl = paginate.PageURL(h.url_(searchKey), dict(params))
        pageNum = h.modify_page_attrs(params, pageSize)
        if not key:
            result = []
            total = 0
        else:
            result, total = h.page_get(searchPath, params, searchKey)
        c.paginator = paginate.Page(result, pageNum, pageSize, total,url=pageUrl, presliced_list=True)
        return render(template)



