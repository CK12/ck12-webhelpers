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

from pylons import config, tmpl_context as c
from flxadmin.lib.ck12 import messages
from flxadmin.lib.ck12.exceptions import RemoteAPIException, InvalidLogin, RemoteAPIStatusException
from flxadmin.lib.remoteapi import RemoteAPI
from flxadmin.model.ck12model import CK12Model
from flxadmin.model.session import SessionManager
from flxadmin.lib.ck12.errorcodes import ErrorCodes
from flxadmin.lib.ck12.decorators import ck12_cache_region
from flxadmin.lib import helpers as h
import Cookie
import logging
LOG = logging.getLogger(__name__)


class User( CK12Model ):
    AUTH_TYPE_CK12 = 'ck-12'
    AUTH_TYPE_GOOGLE = 'google'
    AUTH_TYPE_FB = 'facebook'

    @classmethod
    def fromValues(cls, firstName, lastName, email, token, state="activated", authType=AUTH_TYPE_CK12 ):
        new_user = cls()
        new_user['firstName'] = firstName
        new_user['lastName'] = lastName
        new_user['email'] = email
        new_user['token'] = token
        new_user['state'] = state
        new_user['authType'] = authType
        new_user['gender'] = ''
        return new_user

    def hasAuthType( self, authType ):
        return authType in self['authTypes']

    def isAdmin(self):
        if self.hasAdminRole():
            return True
        elif UserManager.getHasAdminRole(self):
            self.setHasAdminRole()
            return True
        return False

    def hasAdminRole(self, getAdminRole=False):
        return SessionManager.getDataFromSession('adminRole') if getAdminRole else SessionManager.getDataFromSession('hasAdminRole')

    def setHasAdminRole(self, hasAdminRole=True, adminRole = 'admin'):
        SessionManager.saveDataInSession({'hasAdminRole': hasAdminRole})
        SessionManager.saveDataInSession({'adminRole': adminRole})

    def has_username(self):
       ''' Returns true if the login (aka username) has been added.
       The user is allowed to edit the login/username only if:
       1) if the 'login' == email (which the case when user register)
       2) Or when 'login' is empty
       '''
       return (('login' in self) and (not self['email'] == self['login']))

class UserManager( object ):
    
    @staticmethod
    def get_users(search_term=None,page_num=None,
                        page_size=None,sort='login,desc'):
        """
        Returns a list of users matching the search_term. The search_term
        is matched against the firstname, lastname and the email address.
        """
        try:
            if page_num:
                page_num = int( page_num )
            else:
                page_num = 1

            if not page_size:
                page_size = 10 

            results_key = 'result'
        
            users_api_url = 'get/members' 
            params = {'pageNum':page_num, 'pageSize':page_size}

            if search_term:
                params['searchAll'] = search_term
            
            if sort:
                params['sort'] = sort

            data = RemoteAPI.makeAuthServiceCall(users_api_url, params)
            users_list = []
            if 'response' in data and \
               results_key in data['response']:
                    data = data['response'][results_key]
                    users_list = [User(item) for item in data]

            return users_list
        except Exception, e:
            raise e
            #log.exception( e )
            #else all return nothing
            #return [] 
            
    @staticmethod
    @ck12_cache_region('daily', invalidation_key='userroles')
    def get_all_user_roles():
        """
        retrieve all available user roles.
        """
        roles_data = {}
        try:
            roles_data = h.makeGetCall('auth/get/member/roles').get('response')
        except RemoteAPIStatusException, e:
            LOG.exception(e)
            roles_data = {}
            
        return roles_data

    @staticmethod
    def federatedLogin(cookies_str,  authType=None ):
        cookies = Cookie.SimpleCookie()
        if cookies_str:
            cookies.load(cookies_str) 
        SessionManager.storeCookiesToSession( cookies )
        try:
            userInfo = UserManager.getLoggedInUser()
        except RemoteAPIException,e:
            userInfo= None
                         
        if userInfo and 'id' in userInfo and cookies:
            SessionManager.storeCookiesToSession( cookies )
            if not authType and 'authType' in userInfo:
                authType = userInfo['authType']  
            id = userInfo.get('authID', userInfo.get('id'))
            user = UserManager().getUser(id, isAuthID=True)
            # add the type of authentication used to login
            user['authType'] = authType
            # store the logged in user, authtype AND the auth
            # session id. The auth-session-id, allows us to 
            # validate session with auth service
            #TODO: RG: need to think of a better way to pick the ck12_login_cookie
            #models should not use the pylons global objects like config 
            auth_cookie = config.get( 'ck12_login_cookie' )
            if auth_cookie in cookies:
                auth_session_id = cookies[auth_cookie].value
            else:
                auth_session_id = None

            dataDict = {'user' : user,
                        'authType' : authType,
                        'auth-session-id' : auth_session_id
                       }
            SessionManager.saveDataInSession(dataDict)
            return user
        else:
            # Authentication failed! Raise InvalidLogin exception
            raise InvalidLogin( messages.ACCOUNT_LOGIN_INVALID )
        

    @staticmethod
    def getLoggedInUser():
        data = RemoteAPI.makeAuthServiceGetCall( 'get/info/my' )
        if "response" in data:
            user = User( data['response'] )
            return user
        else:
            raise RemoteAPIException( 'response field missing in API response' )

    @staticmethod
    def getUser(id, isAuthID=False):
        if id:
            LOG.debug("Remote call to flx api for user[%s] with isAuthID[%s]" %(id, isAuthID))
            if isAuthID:
                data = RemoteAPI.makeCall('get/member/auth/%s' % id)
            else:
                data = RemoteAPI.makeCall('get/member/%s' % id)
            if "response" in data:
                user = User( data['response'] )
                LOG.debug("Reponse from flx API %s " %(data['response']))
                return user
            else:
                raise RemoteAPIException('get/member API did not returned a response field')

    @staticmethod
    def getHasAdminRole(user, getRole=False):
        user = user or SessionManager.getCurrentUser()
        if not user:
            return False
        data = RemoteAPI.makeCall('get/member/groups/%s' % user['id'])
        ADMIN_GROUP_ID = 1

        if 'response' in data:
            for group in data['response']:
            # eg: {'id': 1, 'roles': [{'1': 'admin'}], 'name': 'CK-12 Foundation Group'}
                if group.get('id') == ADMIN_GROUP_ID and 'roles' in group:
                    for role in group['roles']:
                        for _role in role.values():
                            if _role['is_admin_role']:
                                return True, _role['name'] if getRole else True
        return False, None if getRole else False

    @staticmethod
    def login(username, password, cookies_str='', authType=User.AUTH_TYPE_CK12):
        """ Login user with username & password or via cookies_str.
        If login fails (incorrect, non-admin, etc), then either:
        - Raise login error if direct login via username, password,
        OR (new single-sign-on requirement):
        - Return None or logs out if login via cookie fails (via cookies means 
         auto-login via controller base, so don't raise exceptions here). login_required
         decorators will redirect user to login page if auto-login fails.
        NOTE: single sign-on from cookie always logins in user as long as cookie
         login is valid, it doesn't enforce the Admin app session timeout 
         requirement as there doesn't seem to be any good way to do that aside 
         from api supporting it.
        """
        api_error_msg = "login API response not as excepted"
        cookies = None
        direct_login = not cookies_str

        LOG.debug("Attempting login for user %s with auth type %s" % (username, authType))
        LOG.debug("Is Direct Login = %s" %direct_login)
        if direct_login:
            try:
                data = RemoteAPI.makeAuthServiceCall( 'login/member', 
                 {'login': username, 'token': password, 'authType': authType})
                LOG.debug("Reponse From Auth Server for user [%s]: %s" %(username, data))
                if not 'response' in data or not 'id' in data['response']:
                    LOG.error("Invalid Repsponse or id is not in API reponse")
                    raise InvalidLogin(api_error_msg)
                userInfo = data['response']
            except RemoteAPIStatusException,e:
                raise InvalidLogin( messages.ACCOUNT_LOGIN_INVALID )

        elif cookies_str:
            LOG.debug("Has Cookies, user already logged-in")
            cookies = Cookie.SimpleCookie()
            cookies.load(cookies_str) 
            SessionManager.storeCookiesToSession(cookies)
            try:
                userInfo = UserManager.getLoggedInUser()
                LOG.debug("User Information : %s" %(userInfo))
            except RemoteAPIException, e:
                return None
            except RemoteAPIStatusException, e:
                return None

        if userInfo and 'id' in userInfo:
            user = UserManager().getUser(userInfo['id'], isAuthID=True)
            dataDict = {
             'user': user,
             'authType': authType if direct_login else userInfo.get('authType')
            }
            if cookies and 'auth' in cookies:
                # auth-session-id allows us to validate session with auth service
                dataDict.update({'auth-session-id': cookies['auth'].value})
            # temporary save dataDict in session, needed to call member/groups api
            SessionManager.saveDataInSession(dataDict)
            hasAdminRole , adminRole = UserManager.getHasAdminRole(user, getRole=True)
            user.setHasAdminRole( hasAdminRole , adminRole )
            if user.hasAdminRole():
                return user
            else:
                if direct_login:
                    LOG.debug('Direct login: No admin role, clearing session')
                    SessionManager.invalidate_delete()
                    raise InvalidLogin( messages.ACCOUNT_NOT_ADMIN )
                else:
                    LOG.debug('Auto login: No admin role, logging out')
                    #UserManager.logout()
                    SessionManager.invalidate_delete()
                    c.user_error_code = ErrorCodes.ALREADY_LOGGED_IN
                    return None
        else:
            if direct_login:
                LOG.error('Direct login: No id in get/info/my response')
                raise InvalidLogin(api_error_msg)
            else:
                LOG.error('Auto login: No id in get/info/my response')
                UserManager.logout()
                return None

    @staticmethod
    def logout():
        """ flxweb's code before single-sign-on changes:
            response = RemoteAPI.makeAuthServiceCall('logout/member')        
            if 'responseHeader' in response and response['responseHeader']['status'] == 0:
                SessionManager.purgeSession()  # was session.invalidate(), session.delete()
        flxweb now: 
            SessionManager.purgeSession()  # session.invalidate(), session['dummy']='dummy', session.save()
        flxadmin (what's coded here) now:
            mirrors flxadmin (and flxweb)'s signout controller, since it's 
            confusing if UserManager.logout() and signout controllers are diff.
        """
        response = RemoteAPI.makeAuthServiceGetCall('logout/member')
        if response and response.get('responseHeader').get('status') == 0:
            SessionManager.invalidate()

from flxadmin.model.acl_processor import AclManager
class ACLManager( AclManager ):
    ALLOWED_URL_LIST = ['/', '/error/{action}', '/error/{action}/{id}', '/signin', '/signout']
    
    @staticmethod
    def get_all_routes_information():
        allRoutes = []
        try:
            for route in config['routes.map']._routematches:
                allRoutes.append(route.routepath)
        except Exception, e:
            LOG.error('Unable to get all routes for flxadmin app Exception : [%s]' %str(e))
        return allRoutes

    @staticmethod
    def validate_access(url):
        import re
        role_name = User().hasAdminRole(getAdminRole=True)
        # For admin user(super admin) all paths are allowed
        if role_name == 'admin':
            return True
        paths = ACLManager.get_allowed_paths(role_name)
        paths.extend(ACLManager.ALLOWED_URL_LIST)
        for path in paths:
            pattern = ACLManager.get_pattern(path, url)
            if re.match(pattern, url, re.I):
                return True

        # Allow access to user self profile page
        user = SessionManager.getCurrentUser()
        if user and config['routes.map']._routenames.get('profile_detail', None) :
            user_id = None
            try:
                user_id = int(url.split('/')[-1])
            except:
                return False
            if user_id == int(user.get('id')) :
                pattern = ACLManager.get_pattern(config['routes.map']._routenames.get('profile_detail', None).routepath, url)
                if re.match(pattern, url, re.I):
                    return True
                else:
                    pattern = ACLManager.get_pattern(config['routes.map']._routenames.get('member_groups', None).routepath, url)
                    if re.match(pattern, url, re.I):
                        return True
        return False
 
    @staticmethod
    def get_pattern(path, url):
        import re
        # if path contains dynamic values, first replace intermediate dynamic values.
        regex = re.compile(r"/{.*}/")
        pattern = regex.sub(r"/(.*)/", path)
        # if path contains dynamic value at the end without ending slash, then replace it
        regex = re.compile(r"/{.*}")
        pattern = regex.sub(r"/(.*)", pattern)
        if url.startswith('/flxadmin'):
            pattern = '/flxadmin' + pattern
        pattern = pattern + '$'
        return pattern

    @staticmethod
    def get_allowed_paths(role_name):
        if not role_name:
            raise Exception(u'Missing role name.').encode("utf-8")
        user_acl = ACLManager.get_acl_by_role(role_name)
        if role_name == 'admin':
            return ACLManager.get_all_routes_information()
        paths  = []
        if user_acl:
            user_acl = user_acl.get(role_name, [])
            paths = [acl.keys()[0] for acl in user_acl]
        return paths
