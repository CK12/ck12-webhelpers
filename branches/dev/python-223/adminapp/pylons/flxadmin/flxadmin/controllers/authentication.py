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
# $Id: $

from pylons import config, url, request, response, tmpl_context as c
from pylons.controllers.util import redirect
from pylons.templating import render_jinja2 as render
from pylons.decorators import jsonify
from flxadmin.forms.account import SigninForm
from flxadmin.model.session import SessionManager
from flxadmin.model.user import UserManager
from flxadmin.lib import helpers as h
from flxadmin.lib.base import BaseController
from flxadmin.lib.ck12.exceptions import InvalidLogin
from flxadmin.lib.ck12 import messages
import formencode
from formencode import htmlfill
import logging
import urllib
from flxadmin.lib.decorators import login_required
from flxadmin.lib.ck12.errorcodes import ErrorCodes
from pylons.controllers.util import abort
LOG = logging.getLogger( __name__ )


class AuthenticationController( BaseController ):
   
    """
    Controller to handle the authentication related actions.
    """
    def __init__( self ):
        self.user_manager = UserManager()
   
        
    def __after__(self):
        ''' This syncs auth cookie received from the auth API with that of user's browser
        Note: flxadmin app can only set cookies for its subdomain and domain
        '''
        cookies_from_session = SessionManager.getCookiesFromSession()
        LOG.debug('cookies after signin() or signout():')
        LOG.debug(cookies_from_session)
        sc_name = config['ck12_login_cookie']
        if sc_name in cookies_from_session and sc_name not in request.cookies:
            s_cookie = cookies_from_session[sc_name]  
            response.set_cookie(s_cookie.key, s_cookie.value,
                #max_age=s_cookie.get('max-age'), #convert needed for timedelta(seconds=max_age) called for it
                max_age=None,
                path=s_cookie.get('path') or '/',
                domain=config['ck12_login_cookie_domain'],
                secure=s_cookie.get('secure') or None,
            )
    
    def signin( self ):
        """ Renders page on GET, authenticates and redirect user to ?next on POST.
        """
        login_success_url = config['login_success_url']
        template = '/account/signin.html'
        c.form = SigninForm()

        if request.method == "GET":
            c.form.next = request.params.get('next') or login_success_url
            user = SessionManager.getCurrentUser()

            if c.user_error_code and c.user_error_code == ErrorCodes.ALREADY_LOGGED_IN:
                c.next = request.params.get('next', config['login_success_url'])
                return render('user/invalid_session.html')

            if not user or not user.isAdmin():
                return render(template)
            else:
                return redirect(c.form.next.encode('utf-8'))

        elif request.method == "POST":
            try:
                form_result = c.form.to_python(request.params)
                LOG.debug('authenticating user %s' % form_result['username'])
                user = UserManager.login(form_result['username'], form_result['password'])

                login_success_url = form_result['next'] or login_success_url
                LOG.debug('redirecting the user to %s' % login_success_url)
                return redirect( login_success_url )
            except formencode.Invalid, e:
                form_result = e.value
                c.form_errors = e.error_dict or {}
            except InvalidLogin, e:
                c.form_errors = e
            # authentication failed.
            return htmlfill.render(render(template), form_result)

    def signout( self ):
        """ Called when the user clicks sign/log out
        Logs user out from app and auth service
        """
        LOG.debug('User clicked log out, clearing cookies:')
        LOG.debug(request.cookies)
        UserManager.logout()
        for cookie in request.cookies:
            response.delete_cookie(cookie)
        return redirect('%s?returnTo=%s' % (url('auth-signout'), h.url_('home')))
   
    @login_required()
    def dlg_switchuser(self):
        '''
        Renders the switch user dialog.
        '''
        c.asOverlay = True
        return render ('/account/dialog_switchuser.html')
    
    @login_required()
    @jsonify
    def ajax_list_users(self):
        '''
        Returns the list of users that match the specified "term".
        This is called by the switch user dialog when filtering 
        users in the list.
        '''
        search_term = urllib.unquote_plus(request.GET.get('term'))
        users = UserManager.get_users(search_term,page_size=5,sort="firstName,asc")
        users_json = []
        for user in users:
            users_json.append( {
                                'id': user['id'],
                                'value': user['id'],
                                'email':user['email'],
                                'firstName':user['firstName'],
                                'lastName':user['lastName'],
                                'login': user['login']  })
        return {'users': users_json}
    
    def switchuser( self ):
        '''
        callback method used when using switch user API provided by 
        the CK-12 auth service. 
        The switch user functionality allows a authorized user to
        switch into someone else's account, without password.
        '''
        cookies_str = request.headers.get('cookie')
        # logout the current user
        UserManager.logout()
        # then sigin into the switched user 
        if cookies_str:
            self.user_manager.federatedLogin( cookies_str)
            next_url = request.params.get('next')
            if next_url:
                return redirect(next_url,301)
            else:
                return redirect('/')
        else:
            abort(401)

