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
from flxweb.model.session import SessionManager
from pylons import tmpl_context as c, request,config,response
from pylons.controllers import WSGIController
from pylons.templating import render_jinja2 as render
from pylons.controllers.util import abort
from pylons.controllers.util import redirect
from flxweb.model.user import UserManager
from flxweb.lib.ck12 import messages
from flxweb.lib.ck12.errorcodes import ErrorCodes
from flxweb.lib.ck12.exceptions import RemoteAPIStatusException
from flxweb.lib.remoteapi import RemoteAPI
import logging
import datetime
import ast
import re

'''The base Controller API
Provides the BaseController class for subclassing.
'''

log = logging.getLogger(__name__)

class BaseController( WSGIController ):

    def __before__( self ):

        #######################################
        # Handle authentication scenarios
        #######################################
        # Case 1: User is signed in flxweb, but signed out in
        # authentication service. see bug# 7029
        # check for "auth" cookie
        try:
            auth_cookie = config.get( 'ck12_login_cookie' )
            cookies = request.cookies
            # if it does not exists, then signout from flxweb
            logged_in_user = SessionManager.getCurrentUser()
            if ( (not auth_cookie in cookies) or\
                not cookies[auth_cookie] == SessionManager.getDataFromSession('auth-session-id'))\
                and 'flxweb' in cookies\
                and logged_in_user:
                log.debug('Case 1 from base.py :signing out %s user, since this user is not signed in auth service' % logged_in_user['email'])
                UserManager.logout()
                # clear all the cookies
                for cookie in request.cookies:
                    if cookie.startswith('flx'):
                        log.debug('clearing cookie %s' % cookie)
                        response.delete_cookie(cookie)

            # Case 2: User is signed in authentication service
            # but not in flxweb.
            if auth_cookie in cookies\
                and (not 'flxweb' in cookies\
                or not logged_in_user\
                or not cookies[auth_cookie] == SessionManager.getDataFromSession('auth-session-id')):
                log.debug('Case 2 from base.py: Auth cookie(%s) exists, so checking if user is signed in' % (cookies[auth_cookie]))
                cookies_str = request.headers.get('cookie')
                if cookies_str:
                    try:
                        UserManager.federatedLogin( cookies_str)
                    except Exception,e:
                        log.debug("********* START Remove auth cookie *********")
                        log.debug('Removing the auth cookie(%s), since the user is not authenticated with auth service' % cookies[auth_cookie])
                        response.delete_cookie(auth_cookie,domain='.ck12.org')
                        log.debug("Reason was following exception")
                        log.exception(e)
                        log.debug("********* END Remove auth cookie **********")

            #If user-name or user-image updated from auth pages, get latest user information
            if 'flx-invalidate-client' in cookies.keys() and cookies.get('flx-invalidate-client', None) == 'true':
                log.debug('Got invalidate-client cookies in request[%s]. Invaliting client....' % cookies)
                try:
                    logged_in_user = UserManager.updateUserInfo()
                except Exception,e:
                    log.exception(e)
                finally:
                    response.delete_cookie('flx-invalidate-client',domain='.ck12.org')

            # recheck for logged in user, after handling the above cases
            logged_in_user = SessionManager.getCurrentUser()
            if logged_in_user:
                request.environ["REMOTE_USER"] = logged_in_user['firstName']

                # make the flxweb_role cookie matches the user role
                flxweb_role = cookies.get('flxweb_role',None)

                if not flxweb_role and logged_in_user.isTeacher():
                    response.set_cookie('flxweb_role','teacher', secure=True)
                elif not flxweb_role:
                    response.set_cookie('flxweb_role','student', secure=True)
                elif flxweb_role == 'student' and logged_in_user.isTeacher():
                    response.set_cookie('flxweb_role','teacher', secure=True)
                elif flxweb_role == 'teacher' and logged_in_user.isStudent():
                    response.set_cookie('flxweb_role','student', secure=True)
            
            c.user = logged_in_user
        except Exception,e:
            log.exception(e)
            c.user = None
        # add the messages to context, so that they are available
        # to all templates and controllers
        c.messages = messages
        #Add current time to context
        c.now = datetime.datetime.now()

        #set the selected navigation menu item
        nav_names = ast.literal_eval(config['nav_names'])
        for url_path,name in nav_names.items():
            if re.search(url_path,request.path):
                c.page_name = name
                break

        #set the page_type,used for tracking in GA/ADS  
        page_types = ast.literal_eval(config['page_types'])
        for url_path,name in page_types.items():
            if re.search(url_path,request.path):
                c.page_type = name
                break

    def __call__( self, environ, start_response ):
        """Invoke the Controller"""
        # WSGIController.__call__ dispatches to the Controller method
        # the request is routed to. This routing information is
        # available in environ['pylons.routes_dict']
        try:
            return WSGIController.__call__( self, environ, start_response )
        except Exception, e:
            log.error('Error: %s' % str(e), exc_info=e)
            raise e


    def getJSONResponseTemplate(self, status, qTime=0):
        return {
                'responseHeader':{'status':status, 'QTime':qTime},
                'response':{},
                }
    
    '''
        Page not found 
    '''
    def _custom404(self, url):
        abort(404)
        
