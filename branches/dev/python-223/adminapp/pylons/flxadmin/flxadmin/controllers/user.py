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
from formencode import htmlfill
from webhelpers import paginate
from flxadmin.lib.csv_writer import CsvHandler
from flxadmin.lib import helpers as h
from flxadmin.lib.decorators import login_required, ajax_login_required
from flxadmin.lib.base import BaseController
from flxadmin.lib.remoteapi import RemoteAPI
from flxadmin.lib.ck12.exceptions import *
from flxadmin.model.session import SessionManager
from flxadmin.model.user import ACLManager
from flxadmin.forms.user import *
from flxadmin.forms.options import getviewmode
import json
from flxadmin.lib.ck12.json_response import JSONResponse
from flxadmin.model.lms import LmsManager as LmsManager
import logging
from flxadmin.model.user import UserManager
LOG = logging.getLogger( __name__ )


class UserController(BaseController):
    """ for: User Profile, profiles list, User(s)'s 1.x Books
    """

    @ajax_login_required()
    def profiles_list(self):
        """ User profiles list data, for ajax calls
        """
        template = '/user/profiles_list.html'
        params = dict(request.params)
        c.self_id = SessionManager.getCurrentUser().get('id') or ''
        c.viewmode = request.params.get('viewmode', getviewmode('users'))

        c.has_switch_access = ACLManager.validate_access(h.url_('dlg-switchuser', qualified = False))
        pageSize = 25
        lms_total = None
        pageUrlKey = 'users'
        pageUrl = paginate.PageURL(h.url_(pageUrlKey), dict(params))
        pageNum = h.modify_page_attrs(params, pageSize)

        isUserTokenSearch = False
        if params.has_key('search') and params['search']:
            for typeFilter in params['search'].split(';'):
                filterFld, filterVal = typeFilter.split(',')
                if filterFld == 'lms_token':
                    isUserTokenSearch = True
                    params['providerMemberID'] = filterVal
                    lmsProviderGroupMember = LmsManager.get_lms_provider_app_users(providerMemberID=filterVal)
                    if not lmsProviderGroupMember:
                        c.paginator = paginate.Page([], 1 , 1, 0)
                        return render(template)
                    del params['search']
                    params['searchAll'] = lmsProviderGroupMember.keys()[0]
        if params.has_key('filters') and params['filters']:
            new_filters = ''
            lms_filters = ''
            for typeFilter in params['filters'].split(';'):
                filterFld, filterVal = typeFilter.split(',')
                if filterFld == 'appID' or filterFld == 'providerID':
                    if lms_filters != '':
                        lms_filters += ";"
                    lms_filters += '%s,%s' % (filterFld, filterVal)
                else:
                    if new_filters != '':
                        new_filters += ";"
                    new_filters += '%s,%s' % (filterFld, filterVal)
            params['filters'] = new_filters
            if lms_filters != '' and not isUserTokenSearch:
                LOG.info("LMS filters: %s" % lms_filters)
                lmsProviderGroupMember, lms_total = LmsManager.get_lms_provider_app_users(filters=lms_filters, page_num=1, page_size=pageSize, getTotal=True)
                memberIDs = ','.join([str(id) for id in lmsProviderGroupMember])
                params['ids'] = memberIDs

        #In case of lms token search, get only matching memberID instead of searching all fields
        if isUserTokenSearch and h.int_in_search(params, 'auth/get/member'):
            return render(template)
        if h.int_in_search(params, 'auth/get/member', altSearchPath='auth/get/members', pageSize=25, altSearchKey='result', pageNum=pageNum, pageUrlKey=pageUrlKey):
            return render(template)

        result, total = h.page_get('auth/get/members', params, 'result')
        if lms_total is not None:
            total = lms_total
        c.paginator = paginate.Page(result, pageNum, pageSize, total,
                       url=pageUrl, presliced_list=True)
        return render(template)

    @login_required()
    def profiles(self):
        """ User profiles page, client should call profiles_list() for data
        """
        template = '/user/profiles.html'
        c.pagetitle = 'User Profiles'
        c.crumbs = h.htmlalist(['home'])
        c.viewmode = request.params.get('viewmode', getviewmode('users'))
        c.form = UserProfilesForm()
        c.self_id = SessionManager.getCurrentUser().get('id', '')
        has_switch_access = ACLManager.validate_access(h.url_('dlg-switchuser', qualified = False))
        if has_switch_access and len([item for item in c.form.listhead if 'action' in item.lower()]) == 0 :
            c.form.listhead.append(h.htmldiv(*('Action', 'action', '')))
            c.form.listhead_short.append(h.htmldiv(*('Action', 'action', '')))
        return render(template)

    @login_required()
    def profileFormData(self, auth_response, flx_response, flxID, current_roles):
        try:
            lmsProviderGroupMember = LmsManager.get_lms_provider_app_users(userIDStr=flxID)
            lmsProviderGroupMember = lmsProviderGroupMember[lmsProviderGroupMember.keys()[0]]
        except Exception as ex:
            lmsProviderGroupMember = {}

        try:
            roles_data = UserManager.get_all_user_roles()
        except RemoteAPIStatusException, e:
            LOG.exception(e)
            roles_data = {}
            h.set_error(e)

        try:
            books_data = RemoteAPI.makeGetCall('get/1x/books/%s'% flxID)
        except RemoteAPIStatusException, e:
            LOG.exception(e)
            books_data = {}
            h.set_error(e)

        try:
            artifacts_data = RemoteAPI.makeGetCall('get/info/artifacts',
                                    {'search': 'creatorID,%s'% flxID })
        except RemoteAPIStatusException, e:
            LOG.exception(e)
            artifacts_data= {}
            h.set_error(e)


        roles_list = roles_data.items()
        try:
            #Don't expose member, groupMember, groupAdmin roles
            roles_list = [role for role in roles_list if int(role[0]) not in [13,14,15]]
        except Exception, e:
            LOG.exception(e)
        c.role_choices = sorted(roles_list, key=lambda tuple_: tuple_[1])

        authTypes = auth_response.get('authTypes', {}) #eg. "authTypes":{"ck-12":{"authTypeID":1}}
        LOG.info("authTypes: %s" % authTypes.keys())
        for authType in authTypes.keys():
            if authType.lower()=='ck-12' and authTypes[authType].get('authTypeID')==1:
                c.authTypeCK12 = True

        c.nArtifacts = (artifacts_data.get('response') or {}).get('total', 0)
        c.n1xBooks = (books_data.get('response') or {}).get('total', 0)

        c.success = h.flash.pop_message()
        defaults = h.remove_attrs(auth_response, 'role')
        defaults.update({'favoriteCount':flx_response.get('favoriteCount')})
        defaults.update({'viewedCount':flx_response.get('viewedCount')})
        defaults.update({'feedbackCount':flx_response.get('feedbackCount')})
        defaults['roleID'] = current_roles
        defaults['licenseAcceptedTime'] = auth_response.get('licenseAcceptedTime')
        defaults['sw_auth_url'] = h.url('auth-switchuser')
        defaults['sw_returnto'] = h.url('authorized_switch',qualified='True')
        if lmsProviderGroupMember:
            defaults['lmsProviderUserToken'] = lmsProviderGroupMember.get('providerMemberID')
            lmsGroupsInfoStr = ""

            for lmsGroupInfo in lmsProviderGroupMember.get('groupsInfo'):
                lmsGroupsInfoStr += json.dumps({"appID": lmsGroupInfo['appID'], "providerGroupID" : lmsGroupInfo['providerGroupID'], "groupID": lmsGroupInfo["groupID"]})
            defaults['lmsProviderUserGroups'] = lmsGroupsInfoStr
        return defaults

    @login_required()
    def profile(self, id=None):
        """ User Profile details/edit
        """
        template = '/user/profile.html'
        c.pagetitle = 'User Profile'
        prvlink = 'users'
        c.crumbs = h.htmlalist(['home', prvlink])
        c.self_id = SessionManager.getCurrentUser().get('id') or ''
        c.edit_self = c.self_id == int(id)
        c.form = UserProfileForm()
        c.has_switch_access = ACLManager.validate_access(h.url_('dlg-switchuser', qualified = False))
        c.is_pane = request.params.get('viewmode', '').startswith('pane')
        c.cancel = '' if c.is_pane else h.url_(prvlink)
        c.profile = None
        c.id = id

        current_roles = []
        flx_current_roles = []

        try:
            # Bug - 16673 - Make sure flx2 member is updated
            params = {'impersonateMemberID':id}
            h.makeGetCall('refresh/my', params)
            flx_data = h.makeGetCall('get/member/%s' % id)
            auth_data = h.makeGetCall('auth/get/member/%s' % id)
        except RemoteAPIStatusException, e:
            LOG.exception(e)

        school_claims = self._get_school_claims(id)
        c.schools = school_claims.get('schools', [])
        flx_response = flx_data.get('response') or {}
        auth_response = auth_data.get('response') or {}
        if (flx_response):
            flxID = flx_response['id']
            c.flxID = flxID
            flx_current_roles = [role['id'] for role in flx_response['roles']]

        if (auth_response):
            roles = auth_response.get('roles', auth_response.get('role'))
            if isinstance(roles, list):
                current_roles = [role['id'] for role in auth_response.get('roles', auth_response.get('role'))]
            else:
                current_roles = roles['id']

        c.profile = auth_response
        #Bug - profileFormData method call is necessary to load/initialize required context variables again
        defaults = self.profileFormData(auth_response, flx_response, flxID, current_roles)
        if request.method == 'GET':
            if c.edit_self:
                c.current_roles = current_roles
            return htmlfill.render(render(template), defaults)
        elif request.method == 'POST':
            if not h.validate(request.params, c.form):
                if not request.params.getall('roleID'):
                    c.form_errors['roleID'] = "Select User Role"
                return htmlfill.render(render(template), c.form_result)

            new_role_ids = [int(roleID) for roleID in request.params.getall('roleID')]
            try:
                if not new_role_ids:
                    raise Exception((u'Atleast one role should be selected').encode("utf-8"))
                if 7 in new_role_ids and 5 in new_role_ids:
                    raise Exception((u'User can not have teacher and student role at same time').encode("utf-8"))
                elif 7 in new_role_ids and 13 in new_role_ids:
                    raise Exception((u'User can not have member and student role at same time').encode("utf-8"))
                elif 5 in new_role_ids and 13 in new_role_ids:
                    raise Exception((u'User can not have member and teacher role at same time').encode("utf-8"))
            except Exception, e:
                h.set_error(e)
                return htmlfill.render(render(template), defaults)

            #TODO : Remove the burdon on client to take care of synching auth roles in flx2 db
            #instead of this, add code to flx user.py getInfoFromAuth() method to take care of this.
            flx_removed_role_ids = [role for role in flx_current_roles if role not in new_role_ids]
            flx_added_role_ids = [role for role in new_role_ids if role not in flx_current_roles]
            params = h.remove_attrs(request.params,
             'id login roleID authTypes state registered feedbackCount viewedCount favoriteCount'.split())
            post_data = h.api_post('auth/update/member/'+id, params, 'Profile Successfully Saved!')
            if post_data:
                new_role_ids.sort()
                current_roles.sort()
                updateRoles = new_role_ids == current_roles
                if not updateRoles:
                    try:
                        params = {'roleIDs': ','.join([str(roleID) for roleID in new_role_ids])}
                        data = h.api_post('auth/update/member/roles/%s' %(id),params)
                    except Exception as e:
                        LOG.exception(e)

                #Bug : 13767 - from admin app member role should only be roles in Group id 1
                groupID = 1
                for roleID in flx_removed_role_ids:
                    try:
                        params = {}
                        data = h.api_post('/flx/remove/member/role/%s/%s/%s' %(flxID,groupID,roleID),params)
                    except Exception as e:
                        LOG.exception(e)
                for roleID in flx_added_role_ids :
                    try:
                        params = {}
                        data = h.api_post('/flx/add/member/role/%s/%s/%s' %(flxID,groupID,roleID),params)
                    except Exception as e:
                        LOG.exception(e)
            #Bug - 16524 - Keep flx2 member in sync with auth
            params = {'impersonateMemberID':id}
            h.makeGetCall('refresh/my', params)
            if not post_data or c.is_pane:
                if c.is_pane and post_data:
                    c.success = h.flash.pop_message()
                return htmlfill.render(render(template), c.form_result)
            return redirect(request.url)


    @ajax_login_required()
    @jsonify
    def delete_user_report_data(self, id):
        """ Delete user's ADS report data
        """
        return h.api_post('ads/delete/data', {'userID': id})

    @ajax_login_required()
    def users_have1xbooks_list(self):
        """ Users who have 1.x books json data
        """
        template = '/user/have1xbooks_list.html'
        params = dict(request.params)
        if h.int_in_search(params, 'get/member/has/1x/books/', 'result'):
            return render(template)

        pageSize = 25
        pageUrl = paginate.PageURL(h.url_('/users/have1xbooks'), dict(params))
        pageNum = h.modify_page_attrs(params, pageSize)
        result, total = h.page_get('get/members/have/1x/books', params, 'result')

        c.paginator = paginate.Page(result, pageNum, pageSize, total,
                       url=pageUrl, presliced_list=True)
        return render(template)

    @login_required()
    def users_have1xbooks(self):
        """ Users who has 1.x books page, client should call above fn for data
        """
        template = '/user/have1xbooks.html'
        c.pagetitle = 'Users Who Have 1.x Books'
        c.crumbs = h.htmlalist(['home'])
        c.form = UsersWhoHave1xBooksForm()
        return render(template)


    @ajax_login_required()
    def user_1xbooks_list(self):
        """ User's 1.x books json data
        (Use code at end of file if want to display in pagination listing style)
        """
        template = '/user/1xbooks_list.html'
        pageSize = 999

        idSearched = request.params.get('userid', '')
        if not idSearched:
            return render(template)

        try:
            id = int(idSearched)
        except ValueError:
            id = 0
        if id < 1:
            c.result_msg = "Invalid User ID "+idSearched
            return render(template)

        result, total = h.page_get('get/1x/books/%s'%id, {'pageSize':pageSize}, 'result')
        if total < 1:
            c.result_msg = "User %s has no imported 1.x Books or Invalid User ID"%id
            return render(template)

        book_links = ['%s: %s' % (i['fid'],
         h.idlink('/artifact/', i, 'artifactID', 'artifactID')) for i in result]
        c.fmtd_books_list = ', &nbsp;'.join(book_links)
        c.fmtd_user = h.htmla_('/user/profile/%s'%id, str(id))
        c.nBooks = str(total)
        return render(template)

    @login_required()
    def user_1xbooks(self):
        """ User's 1.x Books page, client needs to call fn above for actual data
        """
        # c.form = Users1xBooksForm() # Uncomment if using pagination listing style
        template = '/user/1xbooks.html'
        c.pagetitle = "User's Imported 1.x Books"
        c.crumbs = h.htmlalist(['home'])
        return render(template)


    @login_required()
    def upload_students(self):
        """ Uploads students by filename
        """
        template = '/user/upload_students.html'
        c.crumbs = h.htmlalist(['home'])

        c.upload_name = 'Students'
        c.task_name = 'UploadStudentsLoaderTask'
        c.form = UploadStudentsForm()
        c.pagetitle = 'Upload Students'
        c.input_id = 'students'
        c.upload_result = None
        if request.method == 'GET':
            return htmlfill.render(render(template))
        elif request.method == 'POST':
            if not h.validate(request.params, c.form):
                return htmlfill.render(render(template), c.form_result)

            upload_prefix = request.params['prefix']
            post_data = h.api_load(request.params, c.upload_name+' Uploaded Successfully',api='auth/upload/students/%s' %(upload_prefix))
            if post_data:
                c.success = h.flash.pop_message()
                _response = post_data['response']
                result = json.dumps(_response)
                c.upload_result = result
                return htmlfill.render(render(template), c.form_result)
            else: return htmlfill.render(render(template), c.form_result)
        return redirect(request.url)

    # raw json renderers, for url type-in use, not called in app
    @login_required()
    @jsonify
    def profiles_raw(self):
        return h.api_raw('auth/get/members', {'pageSize':25, 'sort': 'lastLogin,desc'})

    @login_required()
    @jsonify
    def profile_raw(self, id=None):
        return h.api_raw('auth/get/member/%s' % id)

    @login_required()
    @jsonify
    def users_have1xbooks_raw(self):
        return h.api_raw('get/members/have/1x/books', {'pageSize':25})

    @login_required()
    @jsonify
    def user_1xbooks_raw(self, id='1'):
        return h.api_raw('get/1x/books/'+id, {'pageSize':999})

    @login_required()
    def user_export(self):
        c.pagetitle = 'Users Export to CSV'
        template ='/user/user_export.html'
        return render(template)

    @login_required()
    @jsonify
    def ajax_users_export(self):
        c.result = ''
        c.message = ''
        c.startDate = str(request.params.get('startDate'))
        c.endDate = str(request.params.get('endDate'))
        file_name = request.params.get('file_name', None)
        pageNum = str(request.params.get('pageNum'))
        pageSize = str(request.params.get('pageSize'))

        total = ""
        ids = ""
        if c.startDate == "":
            ids = 'Start'
        if c.endDate == "":
            ids = "%s," % (ids) if not ids == "" else ""
            ids = '%s End' % (ids)
        if not ids == '':
            c.message = ('Please enter %s Date to export csv.' % ids)
            return {'message': c.message}

        export_url = 'auth/get/members/csv'
        writer = CsvHandler()
        headers = ["firstName","lastName", "registered" ,"email", "lastLogin", "state", "role" ]
        result = h.api_raw(export_url, { 'startDate':c.startDate , 'endDate':c.endDate , 'pageNum':pageNum, 'pageSize':pageSize }, timeOut = 300)
            # Error
        if 'message' in result['response']:
            c.message = result['response']['message']

        if 'memberList' in result['response']:
            file_name = writer.process_csv(headers = headers, data=result['response']['memberList'],file_name = file_name)
        if 'total' in result['response']:
            total = result['response']['total']

        return {'file_name' :str(file_name), 'total' : total, 'pageNum':pageNum, 'pageSize':pageSize,'message': c.message,'startDate':c.startDate , 'endDate':c.endDate}

    @ajax_login_required()
    def acl_list(self):
        """ Events list data, for ajax calls
        """
        template = '/user/useracl_list.html'
        params = dict(request.params)
        role_name = None
        if params and params.get('filters', None):
            for typeFilter in params['filters'].split(';'):
                filterFld, filterVal = typeFilter.split(',')
                if filterFld and filterVal:
                    role_name = filterVal

        c.acl = {}
        user_acl = ACLManager.get_acl_by_role(role_name)[role_name] if role_name else []
        c.acl['useracl'] = {}
        if user_acl:
            c.acl['useracl'] = {}
            c.acl['useracl']['paths'] = ACLManager.get_allowed_paths(role_name)
            c.acl['useracl']['acl'] = user_acl
        c.acl['allRoutes'] = ACLManager.get_all_routes_information()
        c.permissions = [('1', 'All'),
                         ('2', 'View'),
                         ('3', 'No Permission')
                        ]
        return render(template)

    @login_required()
    def acl(self):
        """ User acl listing page, client should call acl_list() for all paths
        """
        template = '/user/useracl.html'
        c.pagetitle = 'Access Control'
        c.crumbs = h.htmlalist(['home'])
        c.form = ACLForm()
        if c.form.select_all_checkbox not in c.form.listhead:
            c.form.listhead.insert(0,c.form.select_all_checkbox)
        c.query = request.query_string
        if request.method == 'GET':
            return render(template)
        if request.method == 'POST':
            params = request.params
            # response = ACLManager.update_acl(json.loads(params))
            response = h.api_post('/flx/update/admin/userrole/acl', params)
            return json.dumps(response)

    @ajax_login_required()
    def reset_password_email(self, email=None):
        try:
            #update/member/forget/password/'+email
            result = RemoteAPI.makeAuthServiceCall('/update/member/forget/password/%s'%(email))
            return json.dumps(result)
        except Exception, e:
            return json.dumps({'status':'error','response':e.api_message})

    @ajax_login_required()
    def groups_list(self, id=None):
        """
        groups list data for ajax calls.
        """
        template = "/user/member_groups_list.html"
        params = dict(request.params)
        pageSize = 1000
        pageUrl = paginate.PageURL(h.url_('.'), dict(params))
        pageNum = h.modify_page_attrs(params, pageSize)
        params['impersonateMemberID'] = id
        result, total = h.page_get('flx/group/my', params, 'groups')
        c.paginator = paginate.Page(result, pageNum, pageSize, total,
                       url=pageUrl, presliced_list=True)
        return render(template)

    @ajax_login_required()
    def trace(self):
        """
        return a template that handles the user trace application.
        """
        template = "/user/trace.html"
        return render(template)


    @login_required()
    def admin_traces(self):
        """
        Admin traces listing page, client should call admin_traces_list() for data
        """
        template = "/user/admin_traces.html"
        c.pagetitle = 'Admin Role Traces'
        c.crumbs = h.htmlalist(['home'])
        c.form = AdminTracesForm()
        c.viewmode = request.params.get('viewmode', getviewmode('admin_traces'))
        return render(template)

    @ajax_login_required()
    def admin_traces_list(self):
        """ Admin traces list data, for ajax calls
        """
        template = '/user/admin_traces_list.html'
        params = dict(request.params)
        c.viewmode = request.params.get('viewmode', getviewmode('modalities'))

        pageSize = 20
        adminID = None
        memberID = None
        if params.has_key('search') and (str(params.get('search',',').split(',')[1])).strip():
            for typeSearch in params['search'].split(';'):
                filterFld, filterVal = typeSearch.split(',')
                if filterFld == 'adminID' and filterVal:
                    adminID = filterVal
                if filterFld == 'memberID' and filterVal:
                    memberID = filterVal
        if adminID and memberID:
            api = '/auth/get/admin/trace/%s/%s' % (adminID, memberID)
        elif adminID and not memberID:
            api = '/auth/get/admin/trace/by/%s' % adminID
        elif memberID and not adminID:
            api = '/auth/get/admin/trace/of/%s' % memberID
        else:
            api = 'auth/get/admin/traces'
        pageUrl = paginate.PageURL(h.url_('admin_traces'), dict(params))
        pageNum = h.modify_page_attrs(params, pageSize)
        result, total = h.page_get(api, params, 'result')
        c.paginator = paginate.Page(result, pageNum, pageSize, total,
                       url=pageUrl, presliced_list=True)
        return render(template)

    @login_required()
    def user_restrictions(self):
        """
            Restricted/Blocked users listing page, client should call user_restrictions_list() for data
        """
        template = "/user/restricted_users.html"
        c.pagetitle = 'Manage User Restrictions'
        c.crumbs = h.htmlalist(['home'])
        c.form = UserRestricitonsForm()
        c.viewmode = request.params.get('viewmode', getviewmode('user_restrictions'))
        return render(template)

    @ajax_login_required()
    def user_restrictions_list(self):
        """ 
            Blocked users data, for ajax calls
        """
        template = '/user/restricted_users_list.html'
        params = dict(request.params)
        pageSize = 20

        api = 'flx/get/restricted/members'
        
        c.viewmode = request.params.get('viewmode', getviewmode('user_restrictions'))

        pageUrl = paginate.PageURL(h.url_('user_restrictions'), dict(params))
        pageNum = h.modify_page_attrs(params, pageSize)
        result, total = h.page_get(api, params, 'members')
        c.paginator = paginate.Page(result, pageNum, pageSize, total,
                       url=pageUrl, presliced_list=True)
        return render(template)
        
    def _get_school_claims(self, member_id):
        schools_claims = {}
        total = 0
        school_attbs = {'memberID':member_id}
        try:
            response = h.makeGetCall('flx/get/school/claims', school_attbs )
            responseHeader = response['responseHeader']
            if responseHeader and responseHeader['status'] != 0:
                raise Exception("Exception:%s" % response['response']['message'])
            schools_claims = response['response']['schoolClaims']
        except RemoteAPIStatusException, e:
            LOG.exception(e)
            h.set_error(e)
        except Exception, e:
            LOG.exception(e)
            h.set_error(e)
        return schools_claims
