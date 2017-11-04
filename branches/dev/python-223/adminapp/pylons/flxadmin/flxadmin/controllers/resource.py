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

from pylons import request, response, tmpl_context as c
from pylons.templating import render_jinja2 as render
from pylons.controllers.util import redirect
from pylons.decorators import jsonify
import simplejson
from formencode import htmlfill
from webhelpers import paginate
from datetime import datetime, timedelta

from flxadmin.lib import helpers as h
from flxadmin.lib.decorators import login_required, ajax_login_required
from flxadmin.lib.base import BaseController
from flxadmin.lib.remoteapi import RemoteAPI
from flxadmin.lib.ck12.exceptions import *
from flxadmin.lib.ck12.messages import *
from flxadmin.lib.ck12.json_response import JSONResponse
from flxadmin.model.session import SessionManager
from flxadmin.forms.resource import *
from flxadmin.forms.options import getviewmode

import logging
LOG = logging.getLogger( __name__ )


class ResourceController(BaseController):
    """ for: Resources listing, details
    """
    
    @ajax_login_required()
    def resources_list(self):
        """ Resources list data, for ajax calls
        """
        template = '/resource/resources_list.html'
        params = dict(request.params)

        artifactID = h.val_for(params, 'search', 'artifactID')
        resourceType = h.val_for(params,'filters','type')
        if not artifactID:
            c.paginator = paginate.Page([], 1, 1, 0) 
            return render(template)

        pageSize = 250 # reduce to 25 when api supports paging (returns everything now)
        pageNum = 1 # h.modify_page_attrs(params, pageSize) when api supports paging
        result, total = h.page_get('get/info/artifact/resources/%s/%s'%(artifactID,resourceType), params, 'resources')

        c.viewmode = request.params.get('viewmode', getviewmode('resources'))
        c.paginator = paginate.Page(result, pageNum, pageSize, total) 
                        # url=pageUrl, presliced_list=True)
        return render(template)

    @login_required()
    def resources(self):
        """ Resources listing page, client should call resources_list() for data
        """
        template = '/resource/resources.html'
        c.pagetitle = 'Resources'
        c.viewmode = request.params.get('viewmode', getviewmode('resources'))

        if request.referer and 'artifact/' in request.referer:
            c.crumbs = h.htmlalist(['home', (request.referer, 'Artifact')])
        elif request.referer and 'artifacts' in request.referer:
            c.crumbs = h.htmlalist(['home', (request.referer, 'Artifacts')])
        else:
            c.crumbs = h.htmlalist(['home'])
        c.form = ResourcesForm()
        return render(template)

    @login_required()
    def resource(self, id=None):
        """ Resource details
        """
        template = '/resource/resource.html'
        c.pagetitle = 'Resource'
        prvlink = 'resources'
        c.prvlink = h.url_(prvlink)
        if request.referer and 'resources' in request.referer:
            prvlink = (request.referer, 'Resources')
            c.prvlink = request.referer
        c.crumbs = h.htmlalist(['home', prvlink])
        c.form = ResourceForm()
        c.is_pane = request.params.get('viewmode', '').startswith('pane')
        c.cancel = '' if c.is_pane else c.prvlink
        c.id = id

        data = h.api('get/info/resource/%s' % id)
        resource = h.traverse(data, ['response', 'resource'])
        revisions = resource.get('revisions') or []
        revision0 = revisions[0] if len(revisions) > 0 else {}

        artiRevs = resource.get('artifactRevisions') or []
        artiRevLinks = [h.idlink('/revision/', r, 'artifactRevisionID', 'artifactRevisionID') \
                        for r in artiRevs if r.get('artifactRevisionID')]
        artifactLinks = [h.idlink('/artifact/', r, 'artifactID', 'artifactID') \
                        for r in artiRevs if r.get('artifactID')]

        c.rendered = h.resource_tag(resource)
        c.resource_is = h.resource_is(resource)

        rsrcRevID = str(revision0.get('id') or '')
        abuseLinks = 'None'
        if rsrcRevID:
            abuse_data = h.api('get/info/abusereports', 
                {'filters': 'resourceRevisionID,'+rsrcRevID})

            abuse_response = h.traverse(abuse_data, 'response')
            if abuse_response.get('total') > 0:
                abuses = abuse_response.get('reports') or []
                abuseLinks = [h.idlink('/abusereport/', abuse, 'id') \
                              for abuse in abuses if abuse.get('id')]
        c.fmtd = {
         'revisions': h.pprint(revision0),
         'artifacts': h.pprint(artifactLinks),
         'artifactRevisions': h.pprint(artiRevLinks),
         'abusereports': h.pprint(abuseLinks), 
        }

        if request.method == 'GET':
            c.success = h.flash.pop_message()
            return htmlfill.render(render(template), resource)

        elif request.method == 'POST':
            if not h.validate(request.params, c.form):
                return htmlfill.render(render(template), c.form_result)

            params = h.keep_only(request.params, 
             'id resourceUri resourcePath type description authors license'.split()) 
            artiRev0 = artiRevs[0] if len(artiRevs) > 0 else {}
            artifactID = artiRev0.get('artifactID')
            artifact = h.get_artifact(artifactID)
            
            if artifact and artifact.get('creatorID'):
                params['impersonateMemberID'] = artifact.get('creatorID')
                post_data= h.create_or_update_resource(params, 'Resource Updated Successfully!')
                if not post_data or c.is_pane:
                    if c.is_pane and post_data:
                        c.success = h.flash.pop_message()
                    return htmlfill.render(render(template), c.form_result)
            else:
                return htmlfill.render(render(template), c.form_result)

            return redirect(request.url)


    @ajax_login_required()
    def providers_list(self):
        """ Embedded Object Providers list data, for ajax calls
        """
        template = '/resource/providers_list.html'
        params = dict(request.params)

        if h.int_in_search(params, 'get/info/embeddedobjectProviders', 'providers', 
                           queryAttr='filters'):
            return render(template)

        pageSize = 25
        pageUrl = paginate.PageURL(h.url_('providers'), params)
        pageNum = h.modify_page_attrs(params, pageSize)
        result, total = h.page_get('get/info/embeddedobjectProviders', params, 'providers')
        
        c.viewmode = request.params.get('viewmode', getviewmode('providers'))
        c.paginator = paginate.Page(result, pageNum, pageSize, total, 
                       url=pageUrl, presliced_list=True)
        return render(template)

    @login_required()
    def providers(self, id=None):
        """ Embedded Object Providers listing page, client should call providers_list()
        """
        template = '/resource/providers.html'
        c.pagetitle = 'Embedded Object Providers'
        c.viewmode = request.params.get('viewmode', getviewmode('providers'))

        if request.referer and 'resource/' in request.referer:
            c.crumbs = h.htmlalist(['home', (request.referer, 'Resource')])
        else:
            c.crumbs = h.htmlalist(['home'])
        c.form = ProvidersForm()
        return render(template)

    @login_required()
    def provider(self, id=None):
        """ Embedded Object Provider details
        """
        template = '/resource/provider.html'
        c.pagetitle = 'Provider Details'
        prvlink = ('providers', 'Embedded Object Providers')
        c.crumbs = h.htmlalist(['home', prvlink])
        c.is_pane = request.params.get('viewmode', '').startswith('pane')
        c.cancel = '' if c.is_pane else h.url('providers')
        c.form = ProviderForm()

        data = h.api('get/info/embeddedobjectProviders', {'filters': 'id,'+id})
        providers = h.traverse(data, ['response', 'providers'])
        provider = providers[0] if len(providers)==1 else {}

        if request.method == 'POST':
            if not h.validate(request.params, c.form):
                return htmlfill.render(render(template), c.form_result)
            params = dict(request.params)
            params['needsApi']    = h.boolstr(params['needsApi'])
            params['blacklisted'] = h.boolstr(params['blacklisted'])
            post_data = h.api_post('update/embeddedobjectprovider', params, 
                'Embedded Object Provider Updated')
            if not post_data or c.is_pane:
                if c.is_pane and post_data:
                    c.success = h.flash.pop_message()
                return htmlfill.render(render(template), c.form_result)
            return redirect(request.url)
        else:
            c.success = h.flash.pop_message()
            return htmlfill.render(render(template), provider)
            
    @login_required()
    def create_provider(self):
        """ Create New Embedded Object Provider 
        """
        template = '/resource/provider.html'
        c.pagetitle = 'New Provider'
        prvlink = ('providers', 'Embedded Object Providers')
        c.crumbs = h.htmlalist(['home', prvlink])
        c.cancel = h.url('providers')
        c.form = NewProviderForm()
        c.create = True
        
        if request.method == 'POST':
            if not h.validate(request.params, c.form):
                return htmlfill.render(render(template), c.form_result)

            data = h.api_post('create/embeddedobjectprovider', request.params, 
                'Provider Successfully Created!')
            if not data:
                return htmlfill.render(render(template), c.form_result)
            id = h.traverse(data, ['response', 'id'])
            return redirect(h.url_('/provider/'+str(id)))
        else:
            c.success = h.flash.pop_message()
            return htmlfill.render(render(template), 
                {'needsApi': 'false', 'blacklisted': 'false'})


    @ajax_login_required()
    def abusereports_list(self):
        """ Abuse reports list data, for ajax calls
        """
        template = '/resource/abusereports_list.html'
        params = h.join_attrs(request.params, 'filters', 'search')
        pageSize = 25
        pageUrl = paginate.PageURL(h.url_('abusereports'), dict(params))
        pageNum = h.modify_page_attrs(params, pageSize)
        result, total = h.page_get('get/info/abusereports', params, 'reports')

        c.viewmode = request.params.get('viewmode', getviewmode('abusereports'))
        c.paginator = paginate.Page(result, pageNum, pageSize, total, 
                       url=pageUrl, presliced_list=True)
        c.reasonIDs = SessionManager.getDataFromSession('reasonIDs')
        return render(template)

    @login_required()
    def abusereports(self, id=None):
        """ Abuse reports listing page, client should call abusereports_list() for data
        """
        template = '/resource/abusereports.html'
#         c.pagetitle = 'Abuse Reports'
        c.pagetitle = 'User Reported Issues and Feedback'
        defaults = {}
        defaults['toDate'] = datetime.now().__format__('%m-%d-%Y')
        defaults['fromDate'] = (datetime.now()-timedelta(days=7)).__format__('%m-%d-%Y')
        
        if request.referer and 'resource/' in request.referer:
            c.crumbs = h.htmlalist(['home', (request.referer, 'Resource')])
        else:
            c.crumbs = h.htmlalist(['home'])
        c.form = AbuseReportsForm()
        c.viewmode = request.params.get('viewmode', getviewmode('abusereports'))
        SessionManager.saveDataInSession({'reasonIDs': c.form.reasonIDs}) 
        return htmlfill.render(render(template), defaults)
#         return render(template)
    
    @login_required()
    def abusereportsredirect(self, id=None):
        """ redirect to new Abuse reports listing page
        """
        return redirect(h.url_('/issues'))

    @login_required()
    def abusereport(self, id=None):
        """ Abuse report details
        """
        template = '/resource/abusereport.html'
        c.pagetitle = 'User Reported Issue and Feedback'
        _prvlink = 'issues'
        if request.referer and 'issues' in request.referer:
            _prvlink = request.referer
        prvlink = (_prvlink, 'User Reported Issues and Feedback')
        c.crumbs = h.htmlalist(['home', prvlink])
        c.form = AbuseReportForm()
        c.is_pane = request.params.get('viewmode', '').startswith('pane')
        c.cancel = '' if c.is_pane else h.url(_prvlink)
        c.id = id

        data = h.api('get/info/abusereport/'+id)
        c.report = data.get('response', {}) if data else {}
        c.isClosed = c.report.get('status') == 'ignored' or \
                     c.report.get('status') == 'flagged'

        if request.method == 'POST':
            new_status = request.params['newstatus']
            if new_status == 'Flag':
                c.form = AbuseReportFormWithReason()
            if not h.validate(request.params, c.form):
                return htmlfill.render(render(template), c.form_result)

            params = h.keep_only(request.params, ['id', 'remark', 'reasonID'])
            reason_map = {
             'Re-Open':'reopened',
             'Flag':   'flagged',
             'Ignore': 'ignored',
            }
            params['status'] = reason_map[new_status]

            post_data = h.api_post('update/abusereport', params, 'Abuse Report Updated!')
            if not post_data or c.is_pane:
                if c.is_pane and post_data:
                    c.success = h.flash.pop_message()
                form_result = h.remove_attrs(c.form_result, 'newstatus')
                form_result['status'] = params['status']
                c.isClosed = params['status'] == 'ignored' or \
                     params['status'] == 'flagged'
                return htmlfill.render(render(template), form_result)
            return redirect(request.url)
        else:
            c.success = h.flash.pop_message()
            return htmlfill.render(render(template), c.report)
    
    @login_required()
    def abusereportredirect(self, id=None):
        """ redirect to new Abuse report details page
        """
        url = '/issue/'+ id
        if request.params:
            first_parameter = True
            for param in request.params:
                prefix = '?' if first_parameter else '&'
                if prefix == '?':
                    first_parameter = False
                url += prefix + param +'='+request.params.get(param)
        return redirect(h.url_(url))

    @login_required()
    def reportabuse(self, id=None):
        """ Create Abuse Report
        """
        template = '/resource/reportabuse.html'
        c.pagetitle = 'Create Abuse Report'
        c.id = id
        prvlink = h.url_('/resource/'+id)
        c.crumbs = h.htmlalist(['home', (prvlink, 'Resource')])
        c.form = ReportAbuseForm()
        c.cancel = h.url(prvlink)

        if request.method == 'POST':
            if not h.validate(request.params, c.form):
                return htmlfill.render(render(template), c.form_result)

            post_data = h.api_post('create/abusereport', request.params, 'Abuse Report Created!')
            if not post_data:
                return htmlfill.render(render(template), c.form_result)
            return redirect(h.url_('/resource/'+id))
        else:
            return htmlfill.render(render(template), {'resourceID': id})

    @login_required()
    def upload(self):
        """ Uploads file ( <input type='file'> ) or url by calling resource
        create/update API.  Returns json string.
        """
        params = dict(request.params)
        params['description'] = params.get('description', 'image')

        if  'ACCEPT' in request.headers and\
            'application/json' in request.headers['ACCEPT']:
            response.headers['Content-type'] = 'application/json; charset=utf-8'
        else:
            response.headers['Content-type'] = 'text/plain; charset=utf-8'

        if not params.get('resourceUri') and (not params.has_key('resourcePath')\
           or (params.has_key('resourcePath') and params['resourcePath']=='')):
            return simplejson.dumps(JSONResponse("error", 
                "resourcePath or resourceUri required"))
        try:
            data = h.create_or_update_resource(params, raw_call=True)
        except ResourceAlreadyExistsException, ex:
            _response = JSONResponse("error", RESOURCE_ALREADY_EXISTS, 
             {"reason" : "RESOURCE_ALREADY_EXISTS","resource": ex.resource})
        except ResourceSaveException:
            _response = JSONResponse("error", RESOURCE_SAVE_FAILED, 
             {"reason" : "RESOURCE_SAVE_FAILED"})
        except ResourceExceedsSizeLimitException:
            _response = JSONResponse("error", RESOURCE_FILE_TOO_LARGE, 
             {"reason" : "RESOURCE_FILE_TOO_LARGE"})
        except RemoteAPIStatusException:
            _response = JSONResponse("error", "Unknown Error")

        if data and 'response' in data:
            _response = data['response']
        else:
            _response = JSONResponse("error", "No Response from Resource API")
        return simplejson.dumps(_response)


    # raw json renderers, for url type-in use, not called in app
    @login_required()
    @jsonify
    def abusereports_raw(self):
        return h.api_raw('get/info/abusereports', 
            {'pageSize':25, 'sort': 'updated,desc'})

    @login_required()
    @jsonify
    def abusereport_raw(self, id=None):
        return h.api_raw('get/info/abusereport/%s' % id)

    @login_required()
    @jsonify
    def resource_raw(self, id=None):
        return h.api_raw('get/info/resource/%s' % id)

    @login_required()
    @jsonify
    def provider_raw(self, id=None):
        return h.api_raw('get/info/embeddedobjectProviders', {'filters': 'id,'+id})

    @login_required()
    @jsonify
    def providers_raw(self):
        return h.api_raw('get/info/embeddedobjectProviders',
            {'pageSize':25, 'sort': 'updated,desc'})
