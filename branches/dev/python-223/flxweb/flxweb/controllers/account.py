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

from pylons import request, response,tmpl_context as c
from pylons.templating import render_jinja2
from pylons.controllers.util import redirect
from flxweb.lib.base import BaseController
from flxweb.model.user import UserManager
from flxweb.lib.ck12.decorators import login_required, ajax_login_required
from flxweb.lib.ck12 import messages
import formencode
import logging
from flxweb.model.browseTerm import BrowseManager
from flxweb.controllers import decorators as d
from flxweb.lib.ck12.messages import RESOURCE_FILE_TOO_LARGE
from flxweb.lib.ck12.exceptions import ResourceExceedsSizeLimitException
from flxweb.lib.ck12.json_response import JSONResponse
from flxweb.lib import filters
from flxweb.lib.remoteapi import RemoteAPI
import simplejson
log = logging.getLogger(__name__)

class AccountController(BaseController):

    @login_required()
    def settings( self ):
        return render_jinja2( '/account/settings.html' )

    @d.jsonify()
    @login_required()
    def profileInformation(self):
        result = self.getJSONResponseTemplate(0)
        # get the most up to date user information
        user = UserManager.getUserDetails()
        if request.method == "GET" :
            try:
                required_roles = ['student','teacher']
                allRoles = UserManager.getAllRoles()
                roles_list = [{'id':k,'name':v} for k,v in allRoles.items() if v in required_roles]
                if user['imageURL']:
                    user['imageURL'] = filters.ck12_image_thumbnail_size(user['imageURL'], 'large')
                    
                data = RemoteAPI.makeCall( '/get/member/grades')
                if "response" in data:
                    gradeIDs = data['response']['result']
                    user['gradeIDs']= gradeIDs
                #roles_list = sorted(roles_list, key=lambda tuple_: tuple_[1])
                grades = BrowseManager.getCorrelatedGrades()
                result['response']['result'] = {}
                result['response']['result']['member'] = user
                result['response']['result']['grades'] = grades
                result['response']['result']['allRoles'] = roles_list
                return result
            except Exception as e:
                log.error(e)
                result['response']['result'] = {"status" : "error", "message":str(e)}
                return result
        elif request.method == "POST":
            try :
                params = dict(request.params)
                params['id'] = user['id']
                if params.has_key('country'):
                    params['countryCode'] = params['country'].split(': ')[0]
                user = UserManager.updateAuthUser(params)
                if  params.has_key('gradeIDs') and params['roleID'] != 7:
                    grades = UserManager.updateUserGrades(simplejson.loads(params['gradeIDs']))
                user = UserManager.updateUserInfo()
                c.user = user
                result['response']['result'] = {"status" : "Success" , "member" : user}
            except Exception as e:
                log.error(e)
                result['response']['result'] = {"status" : "error" , "message" : str(e)}
            return result
        
    @login_required()
    def profileImage(self):
        params = request.POST
        filelike = params.get('resourcePath', None)
        resource_type = params.get('resourceType','image')
        resource_desc = params.get('desc','') 
        is_attachment = params.get('isAttachment', False) == 'true'
        is_public = params.get('isPublic', False) == 'true'
        is_external = params.get('isExternal',False) == '1'

        resource_name = filelike.filename
        from flxweb.model.resource import ResourceManager
        resource_name = resource_handle = '%s-%s' % (ResourceManager.get_upload_filename_prefix(), resource_name)
        resource_fileobj = filelike.file
        
        params = {'resource_name' : resource_name,
                  'resource_desc' : resource_desc, 
                  'resource_type' : resource_type, 
                  'resource_fileobj' : resource_fileobj,
                  'resource_handle' : resource_handle,
                  'is_attachment' : is_attachment,
                  'is_public' : is_public,
                  'is_external' : is_external
                 }
        try:
            data = UserManager.uploadProfileImage(params)
            if 'response' in data and 'uri' in data['response']:
                if data['response']['uri']:
                    data['response']['display_uri'] = filters.ck12_image_thumbnail_size(data['response']['uri'], 'large')
        except ResourceExceedsSizeLimitException:
            _response = JSONResponse("error", RESOURCE_FILE_TOO_LARGE, {"reason" : "RESOURCE_FILE_TOO_LARGE"})
            return _response
        except Exception as ex:
            return ex
       
        if  'ACCEPT' in request.headers and\
        'application/json' in request.headers['ACCEPT']:
            response.headers['Content-type'] = 'application/json; charset=utf-8'
        else:
            response.headers['Content-type'] = 'text/plain; charset=utf-8'

        if 'X-Requested-With' in request.headers and 'XMLHttpRequest' in request.headers['X-Requested-With']:
            return  simplejson.dumps(data)
        else: 
            response.headers['Content-type'] = 'text/html; charset=utf-8'
            return "<html><body>%s</body></html>" % simplejson.dumps(data)

    @login_required()
    def validateProfileUsername(self):
        login = request.params.get('login')
        if not login:
            return 'false'
        result = UserManager.validateLoginName(login=login)
        if 'response' in result:
            return result['response']
        
    @login_required()
    def _saveProfileUsername(self):
        try:
            user = UserManager.getUserDetails()
            params = dict(request.params)
            params['id'] = user['id']
            user = UserManager.updateAuthUser(params)
            user = UserManager.updateUserInfo()
        except Exception, e:
            raise Exception (_("Failed to save login / username"))

    @d.jsonify()
    @ajax_login_required()
    def getInfoMy(self):
        result = self.getJSONResponseTemplate(0)
        try:
            resp = RemoteAPI.makeAuthServiceGetCall('get/info/my')
            log.info("Resp: %s" % resp)
            if resp['responseHeader']['status'] != 0:
                raise Exception('Error from auth API: %s' % str(resp))
            return resp
        except Exception as e:
            log.error("Error calling auth API: %s" % str(e), exc_info=e)
            result['response']['result'] = {"status" : "error", "message":str(e)}
            return result
