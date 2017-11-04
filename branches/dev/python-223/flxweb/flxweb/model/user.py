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

from pylons import config
from flxweb.lib.ck12 import messages
from flxweb.lib.ck12.exceptions import RemoteAPIException, CreateUserException, InvalidLogin,RemoteAPIStatusException,\
    AuthProfileExistsException, ResourceExceedsSizeLimitException
from flxweb.lib.remoteapi import RemoteAPI
from flxweb.model.ck12model import CK12Model
from flxweb.model.session import SessionManager
from flxweb.lib.ck12.errorcodes import ErrorCodes
from flxweb.lib.ck12 import util
import json
import logging
import Cookie
from flxweb.model.resource import ResourceManager

import shutil,os
log = logging.getLogger( __name__ )

class User( CK12Model ):

    AUTH_TYPE_CK12 = 'ck-12'
    AUTH_TYPE_GOOGLE = 'google'
    AUTH_TYPE_FB = 'facebook'

    def __init__(self, dict_obj=None):
        CK12Model.__init__(self, dict_obj)

        if not 'firstName' in self or not self['firstName']:
            self['firstName'] = ''
        
        if not 'lastName' in self or not self['lastName']:
            self['lastName'] = ''

        self['fullName'] = '%s %s' % (self['firstName'].title(), self['lastName'].title())

    @classmethod
    def fromValues( cls, firstName, lastName, email, token, state="activated", authType=AUTH_TYPE_CK12 ):
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

    def hasAnyRole(self, roles):
        if 'roles' in self:
            for r in self['roles']:
                for r1 in roles:
                    if 'name' in r and r['name'] == r1:
                        return True
        return False


    def hasRole(self, role):
        if 'roles' in self:
            for r in self['roles']:
                if 'name' in r and ((isinstance(role, list) and r['name'] in role) or r['name'] == role):
                    return True
        return False

    def getRoles(self):
        roles = []
        if 'roles' in self:
            for r in self['roles']:
                roles.append(r['name'])
        return roles

    def isAdmin(self):
        #return self.hasRole(['admin', 'content-admin', 'support-admin', 'content-de-author-admin', 'content-admin', 'content-support-admin'])
        if 'roles' in self:
            for r in self['roles']:
                if r.has_key('is_admin_role') and r['is_admin_role']:
                    return True
        return False
    
    def isEditAllowed(self):
        edit_allowed_roles = config['edit_allowed_roles'].split(',')
        for role in edit_allowed_roles:
            if self.hasRole(role):
                return True
        return False
    
    def isStudent(self):
        return self.hasRole('student')
    
    def isTeacher(self):
        return self.hasRole('teacher')

    def has_1x_books( self ):
        '''
        Checks if the user has books in 1.x system
        '''
        return UserManager.has_1x_books()

class UserManager( object ):
    '''
    UserManger class handles user management like creating user, checking if a user exists,
    login, logout,etc
    '''

    @staticmethod
    def updateUserInfo():
        if SessionManager.hasKey('user'):
            user = SessionManager.getCurrentUser()
            id = user.get('authID', user.get('id'))
            latest_user_obj = UserManager.getUser( id )
            dataDict = {'user': latest_user_obj }
            SessionManager.saveDataInSession(dataDict)
            return latest_user_obj 

    @staticmethod
    def userExists( email=None,username=None ):
        if username or email:
            if email:
                token = email 
            elif username:
                token = username
            
            try:
                data = RemoteAPI.makeAuthServiceCall( 'get/member/%s' % token )
            except RemoteAPIStatusException, ex:
                if ex.status_code == ErrorCodes.NO_SUCH_MEMBER:
                    return None
                else:
                    raise ex
            if "response" in data:
                if "id" in data["response"]:
                    id = data['response'].get('authID', data['response'].get('id'))
                    return UserManager.getUser( id )
                else:
                    return None
        else:
            raise ValueError('username or email parameter is required' )

    @staticmethod
    def createUser(  user ):
        params = {'givenName':user['firstName'],
                  'surname':user['lastName'],
                  'gender':user['gender'],
                  'email':user['email'],
                  'token':user['token'],
                  'state':user['state'],
                  'authType':user['authType']}

        data = RemoteAPI.makeCall( 'create/member', params )
        if not "response" in data or not "id" in data["response"]:
            raise CreateUserException( "Could not create account" )
        else:
            # get the newly created user and return it
            id = data['response'].get('authID', data['response'].get('id'))
            user = UserManager.getUser( id )
        return user

    @staticmethod
    def updateUser( user ):
        try:
            if user and 'id' in user:
                params = {'givenName':user['firstName'],
                          'surname':user['lastName'],
                          'gender':user['gender'],
                          'email':user['email'],
                          'login':user['login']
                          }
                data = RemoteAPI.makeCall( 'update/member/%s' % user['id'], params )
                if "response" in data:
                    user = User( data['response'] )
        except Exception,e:
            log.exception(e)

        return user

    @staticmethod
    def getLoggedInUser():
        data = RemoteAPI.makeAuthServiceGetCall( 'get/info/my' )
        if "response" in data:
            user = User( data['response'] )
            return user
        else:
            raise RemoteAPIException( 'response field missing in API response' )

    @staticmethod
    def getUser( id ):
        if id:
            data = RemoteAPI.makeAuthServiceGetCall( 'get/member/%s' % id )
            if "response" in data:
                user = User( data['response'] )
                return user
            else:
                raise RemoteAPIException( 'response field missing in API response' )

    @staticmethod
    def createAuthProfile( firstName, lastName, gender , email, token, authType,raiseExceptionIfExists=False ):
        user = UserManager.userExists( email )
        if not user:
            user = User.fromValues( firstName, lastName, email, token, authType=authType )
            user['gender'] = gender
            user = UserManager.createUser( user )
            log.debug( "Created new user %s" % (user) )
        
        # check if the user has this authType; raise exception if raiseExceptionIfExists is True
        if user.hasAuthType( authType ) and raiseExceptionIfExists:
            raise AuthProfileExistsException(user, authType)
        # check if the user has this authType; if not create one
        elif not user.hasAuthType( authType ):
            user = UserManager.createAuthType( user['id'], token, authType )
            log.debug( "Created new %s Auth Profile for user %s " % (authType, user) )
        return user

    @staticmethod
    def createAuthType( id, token, authType ):
        params = {'token': token}
        if id and authType:
            data = RemoteAPI.makeCall( 'create/member/auth/%s/%s' % ( authType, id ), params )
            if not "response" in data or not "id" in data["response"]:
                raise CreateUserException( "Could not create account" )
            else:
                # get the newly created user and return it
                id = data['response'].get('authID', data['response'].get('id'))
                user = UserManager.getUser( id )
            return user
        else:
            return None

    @staticmethod
    def _loadCookies(cookies, cookies_str):
        try:
            cookies.load(cookies_str)
        except Cookie.CookieError,ce:
            if 'Illegal key value:' in ce.message:
                illegalCookie = ce.message.replace('Illegal key value:','')
                illegalCookie = illegalCookie.strip()
                cookies_str = cookies_str.replace(illegalCookie,'illegalCookie')
                log.debug("Found illegal cookie name (%s) in cookies_str. Skipping it for signin" % illegalCookie)
                # try again
                cookies.load(cookies_str)

    @staticmethod
    def federatedLogin(cookies_str,  authType=None ):
        log.debug('In federatedLogin')
        log.debug('cookies_str = %s' % cookies_str)
        cookies = Cookie.SimpleCookie()
        if cookies_str:
            UserManager._loadCookies(cookies, cookies_str) 
                
        SessionManager.storeCookiesToSession( cookies )
        try:
            userInfo = UserManager.getLoggedInUser()
        except RemoteAPIException,e:
            userInfo = None
        except RemoteAPIStatusException,e:
            log.debug('********* DEBUG INFORMATION FOR FAILED LOGIN *******************')
            log.debug('cookies_str=%s' % cookies_str)
            if cookies:
                log.debug('*** Cookies passed to storeCookiesToSession')
                for c in cookies:
                    log.debug('%s' % cookies[c])
            else:
                log.debug('cookies=' % cookies)
            from_session_cookies = SessionManager.getCookiesFromSession( )
            if from_session_cookies:
                log.debug('*** Cookies fetched from session')
                for c in from_session_cookies:
                    log.debug('%s' % cookies[c])
            else:
                log.debug('cookies=' % from_session_cookies)
            userInfo= None


        if userInfo and 'id' in userInfo and cookies:
            SessionManager.storeCookiesToSession( cookies )
            if not authType and 'authType' in userInfo:
                authType = userInfo['authType']  
            id = userInfo.get('authID', userInfo.get('id'))
            user = UserManager().getUser( id )
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
    def login( username, password, authType=User.AUTH_TYPE_CK12 ):
        try:
            data = RemoteAPI.makeAuthServiceCall( 'login/member', {'login': username, 'token' : password, 'authType':authType} )
            if 'response' in data:
                if 'id' in data['response']:
                    id = data['response'].get('authID', data['response'].get('id'))
                    user = UserManager().getUser( id )
                    dataDict = {'user' : user,
                                'authType' : authType
                                }
                    SessionManager.saveDataInSession(dataDict)
                    return user
        except RemoteAPIStatusException,e:
            # Authentication failed! Raise InvalidLogin exception
            raise InvalidLogin( messages.ACCOUNT_LOGIN_INVALID )

    @staticmethod
    def logout():
        #purge flxweb session
        SessionManager.purgeSession()

    @staticmethod
    def update_password( user,current_password,new_password ):
        params = {}
        if user and current_password and new_password:
            params = {  'old password':current_password,
                        'password':new_password} 
     
            data = RemoteAPI.makeCall( 'update/member/password/%s' % (user['id']), params )
            return True 
        else:
            raise ValueError('user,current_password and new_password parameters all are required' )

    @staticmethod
    def get_my_notifications_settings():
        data = RemoteAPI.makeGetCall( 'get/member/notifications' )
        if 'response' in data and 'notifications' in data['response']:
            return data['response']['notifications']
        else:
            return []

    @staticmethod
    def set_my_notifications_settings(settings_dict):
        if not settings_dict:
            raise ValueError('settings dictionary cannot be empty')
        data = RemoteAPI.makeCall( 'set/member/notifications',settings_dict )
        if 'responseHeader' in data and 'status' in data['responseHeader']\
            and data['responseHeader']['status'] == 0:
            return True
        else:
            return False

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
    def has_1x_books():
        """
        Checks if the current logged in user has 1.x books
        returns a dictionary containing relevent fields/flags returned by api. 
        https://insight.ck12.org/wiki/index.php/Release_2.0_Server_Design_Specification#Get_Members_that_have_1.x_Books:
        """
        try:
            api_url = 'get/member/has/1x/books'
            results_key = 'result'
            json_response = {}
            data = RemoteAPI.makeGetCall(api_url)
            if 'response' in data and \
                results_key in data['response'] and\
                data['response'][results_key]:
                    # get the result
                    json_response = data['response'][results_key]
                    # init the total/fail/pass count to 0
                    json_response['total_count'] = json_response['pass_count'] = json_response['fail_count'] = 0
                    # if result is failed, then get the pass/fail book count
                    if 'status' in json_response and\
                        json_response['status'] and\
                        json_response['taskID'] and\
                        not json_response['status'].lower() in ('not started'):
                            # get the task status
                            task_status = UserManager.get_migration_status(json_response['taskID'])
                            if task_status and\
                                'userdata' in task_status and task_status['userdata'] and\
                                'books' in task_status['userdata'] and\
                                task_status['userdata']['books']:
                                    # get the total book count
                                    json_response['total_count'] = len(task_status['userdata']['books'])
                                    # then get the failed count
                                    fail_count = 0
                                    json_response['books'] = task_status['userdata']['books']
                                    for bid in task_status['userdata']['books']:
                                        book = task_status['userdata']['books'][bid]
                                        if type(book) == dict:
                                            status = book['status']
                                        elif isinstance(book,basestring):
                                            status = book 
                                        if status not in ['SUCCESS','SKIPPED']:
                                            fail_count +=1
                                    json_response['fail_count'] = fail_count
                                    # finally set the pass count
                                    json_response['pass_count'] = json_response['total_count'] - fail_count

        except Exception,e:
            log.exception(e)
        return json_response

    @staticmethod
    def migrate_books():
        """
        Starts the migration of 1.x books for the current logged in user
        returns a dictionary containing relevent fields/flags returned by api. 
        https://insight.ck12.org/wiki/index.php/Release_2.0_Server_Design_Specification#Migrate_1.x_Books
        """
        try:
            api_url = 'import/1x/books'
            results_key = 'result'
            json_response = {}
            data = RemoteAPI.makeGetCall(api_url)
            if 'response' in data and \
               results_key in data['response']:
                    json_response = data['response'][results_key]
        except Exception,e:
            log.exception(e)
        return json_response

    @staticmethod
    def get_migration_status(task_id):
        """
        Returns the status of the migration of 1.x books for the current logged in user.
        Returns a dictionary containing relevent fields/flags returned by api. 
        """
        try:
            if not task_id:
                raise ValueError('task_id cannot be none')

            api_url = 'get/status/task/%s' % task_id
            json_response = {}
            data = RemoteAPI.makeGetCall(api_url)
            if 'response' in data:
                json_response = data['response']
                
                if 'userdata' in json_response and\
                    isinstance(json_response['userdata'],basestring):
                    json_response['userdata'] = json.loads(json_response['userdata'])
        except Exception,e:
            log.exception(e)
        return json_response

    @staticmethod
    def decline_migration():
        """
        Declines the migration of 1.x books for the current logged in user.
        Returns a dictionary containing relevent fields/flags returned by api. 
        """
        try:
            api_url = 'decline/import/1x/books'
            results_key = 'result'
            json_response = {}
            data = RemoteAPI.makeGetCall(api_url)
            if 'response' in data and \
               results_key in data['response']:
                    json_response = data['response'][results_key]
        except Exception,e:
            log.exception(e)
        return json_response

    @staticmethod
    def acknowledge_migration_complete():
        """
        Updates the users 1.x migration status to 'acknowledged'
        This indicates the user acknowledged the migration complete in the UI.
        Returns a dictionary containing relevent fields/flags returned by api. 
        """
        try:
            api_url = 'acknowledge/import/1x/books'
            results_key = 'result'
            json_response = {}
            data = RemoteAPI.makeGetCall(api_url)
            if 'response' in data and \
               results_key in data['response']:
                    json_response = data['response'][results_key]
        except Exception,e:
            log.exception(e)
        return json_response

    @staticmethod
    def send_invites(from_name, from_email=None, campaign=None, invites=[]):
        """
        Makes a API call to the 'Auth' service to pre-create user accounts
        and send invitation emails, to these accounts.
        Parameters:
            from_name - the name of the person sending the invites
            from_email (optional) - the email of the person sending the invites
            campaign (optional) - the GA campaign used for tracking these invites.
                                  campaign string should be "Source:Medium:Campaign"
                                  e.g "Invites:email:Christmas_invites"
            invites - List of dictionaries object containing following fields
                      { "name": "John", 
                        "last": "Doe",
                        "email": "someone@example.com"
                      } 
        """
        try:
            if not from_email:
                from_email = ''

            # clean the data in invites list
            for idx, invite in enumerate(invites):
                modified_invite = {}
                for k,v in invite.items():
                    modified_invite[k] = util.remove_tags(v)
                invites[idx] = modified_invite


            api_url = 'invite'
            payload = {'from':\
                            {
                                "name": util.remove_tags(from_name),
                                "email": util.remove_tags(from_email)
                            },
                            'campaign':campaign,
                            'invites': invites
                        }
            params = {'data': json.dumps(payload)}
            data = RemoteAPI.makeAuthServiceCall(api_url, params)
            if 'responseHeader' in data and \
               'status' in data['responseHeader'] and\
               data['responseHeader']['status'] == 0:
                return True
            else:
                raise Exception('Error calling the invite api.Response=%s' % data)
        except Exception,e:
            log.exception(e)
            return False

    @staticmethod
    def getAllRoles():
        try:

            api_url = 'get/member/roles'
            data = RemoteAPI.makeAuthServiceGetCall(api_url)
            if 'responseHeader' in data and \
               'status' in data['responseHeader'] and\
               data['responseHeader']['status'] == 0:
                return data['response']
            else:
                raise Exception('Error calling the get all roles api.Response=%s' % data)
        except Exception,e:
            log.exception(e)
            return False

    @staticmethod
    def updateUserGrades( gradeIDs ):
        try:
                params = {
                          'gradeIDs':",".join(gradeIDs)
                          }
                data = RemoteAPI.makeCall( '/set/member/grades', params )
                if "response" in data:
                    return True
        except Exception,e:
            log.exception(e)
            return False
    
    @staticmethod
    def getUserDetails():
        data = RemoteAPI.makeAuthServiceGetCall( '/get/detail/my' )
        if "response" in data:
            user = User( data['response'] )
            return user
        else:
            raise RemoteAPIException( 'response field missing in API response' )

    @staticmethod
    def updateAuthUser( user ):
        try:
            params = {}
            if user and 'id' in user:
                loginUpdated = False
                if 'roleID' in user:
                    params = {'roleID':user['roleID'],
                              'isProfileUpdated' : "1"
                              }
                if user.has_key('imageURL') and user['imageURL']:
                    params['imageURL'] = user['imageURL']
                if user.has_key('state') and user.has_key('city') :
                    if user.has_key('countryCode'):
                        params['countryCode'] = user['countryCode']
                    if user.has_key('city'):
                        params['city'] = user['city']
                    if user.has_key('state'):
                        params['state'] = user['state']
                    if user.has_key('province'):
                        params['province'] = user['province']
                    if user.has_key('zip'):
                        params['zip'] = user['zip']
                if user.has_key('login'):
                    params['login'] = user['login']
                    loginUpdated = True
                if user.has_key('isLicenseAccepted') and user.get('isLicenseAccepted'):
                    params['isLicenseAccepted'] = True
                data = RemoteAPI.makeAuthServiceCall( 'update/member/%s' % user['id'], params )
                if "response" in data:
                    user = User( data['response'] )
                if loginUpdated:
                    ## Call refresh for flx and assessment
                    log.debug("The username was updated. Calling refresh ...")
                    resp = RemoteAPI.makeGetCall( 'refresh/my' )
                    log.debug("Response from flx/refresh/my: %s" % str(resp))
                    resp = RemoteAPI.makeAssessmentGetCall( 'refresh/my' )
                    log.debug("Response from assessment/api/refresh/my: %s" % str(resp))
        except Exception,e:
            log.exception(e)
        return user

    @staticmethod
    def uploadProfileImage(params):
        tmp_upload_dir = None
        stored_file_path = None
        result=None
        params_dict = {}
        params_dict.update({'resourceName' : params['resource_name'],
                  'resourceDesc' : params['resource_desc'], 
                  'resourceType' : params['resource_type'], 
                  'resourceHandle' : params['resource_handle'],
                  'isAttachment' : params['is_attachment'],
                  'isPublic' : params['is_public'],
                  'isExternal' : params['is_external']
                 })
        try:
            # save the file
            tmp_upload_dir = ResourceManager.get_unique_upload_dir()
            stored_file_path = ResourceManager.store_upload_file( tmp_upload_dir , params_dict['resourceName'], params['resource_fileobj'])
            
            if not ResourceManager.validate_resource_size(stored_file_path,param='profile_image_max_upload_size') :
                raise ResourceExceedsSizeLimitException()

            if ResourceManager.upload_dir_is_shared() and ResourceManager.get_upload_dir() and ResourceManager.get_upload_dir() in stored_file_path :
                params_dict.update({'resourcePathLocation': stored_file_path})
                log.debug('Creating resource. Params: %s' % params_dict)
                result = RemoteAPI.makeAuthServiceCall('save/profile/image', params_dict, multipart=False)
                os.remove(stored_file_path)
            else:
                uploaded_file = open(stored_file_path, 'r')
                params_dict.update({'resourcePath':uploaded_file})
                log.debug('uploading profile image: %s' % uploaded_file.name)
                log.debug("upload params: %s" % params_dict)
                # make API request
                result = RemoteAPI.makeAuthServiceCall('save/profile/image', params_dict, multipart=True)
                uploaded_file.close()
            shutil.rmtree(tmp_upload_dir)
            log.debug('status: %s' % result)
        except RemoteAPIStatusException, ex:
            if ErrorCodes.RESOURCE_EXCEEDS_SIZE_LIMIT == ex.status_code:
                raise ResourceExceedsSizeLimitException()
            else:
                raise ex
        finally:
            try:
                if stored_file_path and os.path.exists(stored_file_path):
                    os.remove(stored_file_path)
                if tmp_upload_dir and os.path.exists(tmp_upload_dir):
                    shutil.rmtree(tmp_upload_dir)
            except:
                pass
        return result
    
    @staticmethod
    def validateLoginName(login):
        api_url = 'ajax/validate/member/login/%s' % (login)
        result = RemoteAPI.makeAuthServiceCall(api_url, {}, multipart=False)
        return result
