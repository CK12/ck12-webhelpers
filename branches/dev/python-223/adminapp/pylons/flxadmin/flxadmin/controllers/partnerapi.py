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
# This file originally written by Girish Vispute
#
# $Id: $

from pylons import request, tmpl_context as c
from pylons.templating import render_jinja2 as render
import json
from webhelpers import paginate

from flxadmin.lib import helpers as h
from flxadmin.lib.decorators import login_required, ajax_login_required
from flxadmin.lib.base import BaseController
from flxadmin.forms.options import getviewmode
from flxadmin.forms.partnerapi import *
from flxadmin.model.partnerapi import PartnerapiManager

import logging
LOG = logging.getLogger( __name__ )


class PartnerapiController(BaseController):
    """ 
    """
    @login_required()
    def partner_api(self):
        """ api_partner listing page, client should call getAllApplications() for data
        """
        template = '/partnerapi/partner_api.html'
        c.pagetitle = 'Partner API Key Management'
        c.crumbs = h.htmlalist(['home'])
        c.form = PartnerapiForm()
        c.viewmode = request.params.get('viewmode', getviewmode('artifacts'))
        return render(template)

    @ajax_login_required()
    def getAllApplications(self):
        """
            template to return all the partner application
        """
        template = '/partnerapi/applications_list.html'
        params = dict(request.params)
        pageSize=15
        pageUrl = paginate.PageURL(h.url_('/api_partner_applications_list'), params)
        pageNum = h.modify_page_attrs(params, pageSize)
        result = PartnerapiManager.getAllPartnerApplications(params)
        result = json.loads(json.dumps(result))
        total = result['num_results']
        result = result['objects']
        for res in result :
            if res['paths']:
                res['paths'] = json.dumps(res['paths']) 
        c.paginator = paginate.Page(result, pageNum, pageSize, total, 
                       url=pageUrl, presliced_list=True)
        return render(template)

    @ajax_login_required()
    def createApplication(self):
        """
            create a new partner application
            on success get new applciation information using ID
        """
        template = '/partnerapi/applications_list.html'
        params = dict(request.params)
        params = params['data']
        if PartnerapiManager.isApplicationExist(json.loads(params)['name']):
            result = {"message" : "Application with same name already exists."}
        else:
            result = PartnerapiManager.createNewApplication(params)
            if result and result.has_key('id'):
                result = PartnerapiManager.getApplicationByID(result["id"])
                if result and result.has_key('paths'):
                    result['paths'] = json.dumps(result['paths']) 
                    c.paginator = paginate.Page([result], 1, 1, 1, 
                                               presliced_list=True)
                    return render(template)
        if result:
            result = json.dumps(result)
        return result

    @ajax_login_required()
    def updateApplication(self,ID=None):
        """
            Update the paths associated with an exiting application using application ID 
        """
        params = dict(request.params)
        result = None
        if ID and params:
            params = params['data']
            result = PartnerapiManager.updateApplication(ID,params)
        if result:
            result = json.dumps(result)
        return result

    @ajax_login_required()
    def getAllPaths(self):
        """
            tempalate to return all the partner application
        """
        template = 'partnerapi/api_paths_list.html'
        result = PartnerapiManager.getAllAPIPaths()
        c.paths = result['objects']
        return render(template);

    @ajax_login_required()
    def createPath(self,path=None):
        """
            create a new path
            on success get new path information using ID
        """
        template = '/partnerapi/api_paths_list.html'
        params = dict(request.params)
        params = params['data']
        if PartnerapiManager.isPathExist(json.loads(params)['mask']):
            result = {"message" : "Path with same name already exists."}
        else:
            result = PartnerapiManager.createNewPath(params)
            if result and result.has_key('id'):
                result = PartnerapiManager.getPathByID(result["id"])
                if result:
                    c.paths = [result]
                    return render(template)
        if result:
            result = json.dumps(result)
        return result
    
    @ajax_login_required()
    def deleteByID(self,path=None, ID=None):
        """
            Delete partner application/path
        """
        result = None
        if path and ID:
            if path == 'path':
                result = PartnerapiManager.getPathByID(ID)
                if result and result['applications'] :
                    return json.dumps({'message' : ('Unable to delete path "%s", path associated with one or more applications' % result['mask'])})
            result = PartnerapiManager.deleteByID(path,ID)
        return result