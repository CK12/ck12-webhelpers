#
# Copyright 2007-2012 CK-12 Foundation
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

 
from pylons import config, url, request, tmpl_context as c,response
from pylons.controllers.util import redirect,abort
from pylons.templating import render_jinja2
from pylons.decorators import jsonify
from flxweb.lib.base import BaseController
from flxweb.lib.remoteapi import RemoteAPI
from flxweb.model.session import SessionManager
from flxweb.model.user import UserManager
import logging
import urllib

log = logging.getLogger( __name__ )

class AuthenticationController( BaseController ):
    """
    Controller to handle the authentication related actions.
    """
    def __init__( self ):
        self.user_manager = UserManager()
        self.auth_server_url = RemoteAPI.getAuthServerURL()

    def authorized( self, popup):
        '''
        Callback used for CK-12 authentication service. This method 
        is called back after CK-12 auth service authenticates the user.
        '''
        cookies_str = request.headers.get('cookie')
        new_member = request.params.get('newMember')
        userinfo = request.params.get('userinfo')
        log.debug('in authorized callback from auth service')
        if cookies_str:
            try:
                user = self.user_manager.federatedLogin( cookies_str)
            except Exception, e:
                import base64
                log.debug('User login failed')
                log.debug('cookies_str=%s' % cookies_str)
                if userinfo:
                    log.debug('userinfo=%s' % base64.b64decode(userinfo))
                else:
                    log.debug('userinfo from request is none')
                log.exception(e)
                raise e
            # if the user is a new user, use the URL for tracking new users
            # else use the normal URL. The URL difference will help in tracking
            # using Google analytics
            if str(new_member).lower() == 'true':
                continue_to = url('signin-complete-newuser',authType=user['authType'], newuser='true')
            else:
                continue_to = url('signin-complete',authType=user['authType'])

            next_url = request.params.get('next')
            if next_url and ('/student' not in next_url and '/teacher' not in next_url):
                continue_to = '%s?redirect=%s' % (continue_to,urllib.quote(next_url.encode('utf-8')))
            else:
                dashboard_url = url('dashboard')
                continue_to = '%s?redirect=%s' % (continue_to,dashboard_url)
            return redirect(continue_to)
        else:
            abort(401)

    @jsonify
    def debug_session(self):
        return SessionManager.getSession() 

    def signin_complete(self,authType=None,newuser=False):
        '''
        Called after flxweb has authorized the signin.
        It simply helps in tracking the signin in Google Analytics.
        The url helps in tracking new user from different auth types.
        '''
        c.redirect = request.params.get('redirect')
        #contextID is for Google classroom.
        #Needs to be added to the redirect
        contextID = request.params.get('contextID')
        if str(contextID) !="None":
            c.redirect = "%s&contextID=%s" %(c.redirect, contextID)
        log.debug("[signin_complete]: %s"%c.redirect)
        c.isNewuser = str(newuser).lower() == 'true'
        return render_jinja2('/account/signin_complete.html')

    def signout( self ):
        """
        Called when the user clicks the sign out link/action.
        Sign's out the user and then redirect the user to the landing page.
        """
        # logout from flxweb
        UserManager.logout()
        do_not_delete = ['flxweb_role']
        # clear all the cookies, except the ones listed in do_not_delete
        for cookie in request.cookies:
            if cookie.startswith('flx') and cookie not in do_not_delete:
                log.debug('Logout called. clearing cookie %s' % cookie)
                response.delete_cookie(cookie)

        # then logout from auth service
        home = url('home',qualified=True)
        auth_signout_url = url('auth-signout')
        #add query parameter so that we can track this in Google Analytics
        paramsData = request.params
        returnToUrl = paramsData.get('returnTo', None)
        if not returnToUrl:
            returnToUrl = home
        return redirect( '%s?returnTo=%s?s=signed_out' % (auth_signout_url,returnToUrl))

