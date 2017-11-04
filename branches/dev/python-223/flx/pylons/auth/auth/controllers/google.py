import logging, traceback

from pylons import config, request, session, tmpl_context as c, url
from pylons.controllers.util import redirect

from auth.controllers import decorators as d
from auth.controllers.extAuth import ExtAuthController
from auth.controllers.errorCodes import ErrorCodes
from auth.lib.base import BaseController, render

from oauth2client.client import AccessTokenCredentials
from oauth2client.client import OAuth2WebServerFlow
import httplib2
import json
from urllib import quote
import auth.lib.helpers as h

log = logging.getLogger(__name__)

class GoogleController(ExtAuthController):
    """
        Google authentication related APIs.
    """
    site = 'google'

    def __init__(self):
        self.client_id = config.get('google_client_id')
        self.client_secret = config.get('google_client_secret')
        self.scope = 'profile email'
        #scope = 'https://www.googleapis.com/auth/userinfo.profile email'
        self.return_url = config.get('google_redirect_uri')
        self.ck12_app_codes = config.get('ck12_app_codes',"").split(",")
        #self.return_url = url(controller='google', action='authenticated', qualified=True)
        self.state = ''

    @d.trace(log, ['url'])
    def login(self, url=None):
        """
            Login via Google oAuth2.
        """
        try:
            appLogin = True if request.params.get('appLogin', '').lower() == 'true' else False
            if appLogin:
                self.return_url = '' # Set empty redirect_uri for app login. 
            oAuthFlow = OAuth2WebServerFlow(self.client_id, self.client_secret, self.scope, redirect_uri=self.return_url, state=self.state)
            returnTo = request.params.get('returnTo','')
            requestor = request.params.get('requestor','')
            appName = request.params.get('appName', None)
            if appName:
                assignmentID = request.params.get('assignmentID', None)
                contextID = request.params.get('contextID', None)
                if appName == 'googleClassroom':
                    returnTo = config.get('google_classroom_returnTo')
                    if assignmentID:
                        returnTo = "%s?assignmentID=%s&contextID=%s"%(returnTo,assignmentID,contextID)
                    session['returnTo'] = returnTo

            log.debug("google login: returnTo[%s]" % returnTo)
            log.debug("google login: requestor[%s]" % requestor)
            # if popup is false, the request is for a non-popup signin
            # default behavior is popup
            popup = request.params.get('popup','true')
            if appName:
                popup = 'false'
            session['isPopup'] = popup
            if popup == 'false':
                if requestor:
                    session['requestor'] = requestor 
                if returnTo:
                    session['returnTo'] = returnTo
          
            session['oAuthFlow'] = oAuthFlow

            role = request.params.get('role', None)
            if role:
                session['role'] = role
                log.debug("google login: role[%s]" % role)
            session.save()
            if not appLogin:
                redirectURL = oAuthFlow.step1_get_authorize_url()
            else:
                return 'OK'
        except Exception, e:
            log.exception(e)
            c.status = ErrorCodes().getName(ErrorCodes.AUTHENTICATION_FAILED)
            c.message = str(e)
            return render('%s/common/error.html' % self.prefix)

        return redirect(redirectURL)


    @d.trace(log, ['appCode'])
    def verifyAppMember(self, appCode):
            """
                Url to pass userdata to the app through deep link.
            """
            try:
                token = request.params.get("token")
                if not token or len(token) != 64:
                    raise Exception("Unauthorized Operation")
                c.appCode = appCode
                if appCode not in self.ck12_app_codes:
                    raise Exception("Invalid App Code")

                enc_settings ={"aes_secret_key": config.get("aes_secret_key"), 'aes_block_size':int(config.get("aes_block_size"))}
                ecookies = quote(json.dumps(dict(request.cookies)))
                ecookies = token + ecookies
                c.cookies = h.encrypt(ecookies,enc_settings)
                return render('%s/authenticate/verifyAppMember.html' % (self.prefix))
            except Exception,e:
                log.exception(e)
                c.status = ErrorCodes().getName(ErrorCodes.UNAUTHORIZED_OPERATION)
                c.message = str(e)
                return render('%s/common/error.html' % self.prefix)


    @d.jsonify()
    @d.trace(log)
    def getInfo(self):
        """
            Get the member information from google.
        """
        code = request.params.get('code')
        token = request.params.get('token')
        oAuthFlow = session.get('oAuthFlow')

        if oAuthFlow is not None:
            log.info("BULE1 ")
            log.info(code)
            if token:     
                credentials = AccessTokenCredentials(token,'')
            else:     
                credentials = oAuthFlow.step2_exchange(code)

            http = httplib2.Http()
            _http = credentials.authorize(http)
            info = _http.request(config.get('google_userinfo_url'))
            _info = json.loads(info[1])

            log.debug("getInfo _info: [%s]" % str(_info))

            params = {}
            params['authType'] = 'google'
            givenName = _info.get('given_name')
            if givenName is not None:
                params['firstName'] = givenName
            surname = _info.get('family_name')
            if surname is not None:
                params['lastName'] = surname
            gender = _info.get('gender')
            if gender is not None:
                params['gender'] = gender
            email = _info.get('email')
            if email:
                import auth.controllers.user as u

                email = email.strip().lower()
                member = u.getCurrentUser(request, anonymousOkay=False)
                if member and member.email != email:
                    from auth.model import api

                    newMember = api.getMemberByEmail(email=email)
                    if newMember:
                        errorCode = ErrorCodes.MEMBER_ALREADY_EXISTS
                        return ErrorCodes().asDict(errorCode, 'Already logged in as a different user')

                params['email'] = email
            params['token'] = 'https://plus.google.com/%s' % str(_info.get('id'))
            picture = _info.get('picture')
            if picture is not None:
                params['imageURL'] = picture

            result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            result['response']['google'] = params
            return result
        c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
        return ErrorCodes().asDict(c.errorCode, 'UNAUTHORIZED_OPERATION', {'redirect': url(controller='extAuth', action='loginForm', qualified=True, protocol='https')})

    #
    #  Internal code for testing.
    #
    @d.trace(log)
    def test(self):
        """
            Test the login action.
        """
        return self._test(self.site)

    @d.trace(log)
    def authenticated(self):
        """
            This is an example for how authenticated could be implemented at
            the App layer.
        """
        log.info('google authenticated: params[%s]' % request.params)
        return self._authenticated(self.site)
