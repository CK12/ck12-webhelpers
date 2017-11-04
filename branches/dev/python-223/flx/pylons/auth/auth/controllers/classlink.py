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

log = logging.getLogger(__name__)
# http://google-api-python-client.googlecode.com/hg/docs/epy/oauth2client.client.OAuth2WebServerFlow-class.html
class ClasslinkController(ExtAuthController):
    """
        Classlink authentication related APIs.
    """
    def __init__(self):
        self.client_id = config.get('classlink_client_id')
        self.client_secret = config.get('classlink_client_secret')
        self.scope = 'profile email'
        self.site = 'classlink'
        self.return_url = config.get('classlink_redirect_uri')
        self.token_uri = config.get('classlink_token_url')
        self.auth_uri = config.get('classlink_oauth_url')
        self.state = ''
        self.teacher_roles = ['Teacher', 'Tenant Administrator']

    @d.trace(log, ['url'])
    def login(self, url=None):
        """
            Login via Classlink oAuth2.
        """
        try:
            appLogin = True if request.params.get('appLogin', '').lower() == 'true' else False
            if appLogin:
                self.return_url = '' # Set empty redirect_uri for app login. 
            oAuthFlow = OAuth2WebServerFlow(self.client_id, self.client_secret, self.scope, auth_uri=self.auth_uri, token_uri=self.token_uri, redirect_uri=self.return_url, state=self.state)
            returnTo = request.params.get('returnTo','')
            requestor = request.params.get('requestor','')
            log.debug("classlink login: returnTo[%s]" % returnTo)
            log.debug("classlink login: requestor[%s]" % requestor)
            # if popup is false, the request is for a non-popup signin
            # default behavior is popup
            popup = request.params.get('popup','false')
            session['isPopup'] = popup
            if popup == 'false':
                if requestor:
                    session['requestor'] = requestor 
                if returnTo:
                    session['returnTo'] = returnTo
          
            session['oAuthFlow'] = oAuthFlow
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

    @d.jsonify()
    @d.trace(log)
    def getInfo(self):
        """
            Get the member information from classlink.
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

            # https://developer.classlink.com/docs/v2myinfo
            http = httplib2.Http()
            _http = credentials.authorize(http)
            info = _http.request(config.get('classlink_userinfo_url'))
            log.debug("getInfo info: [%s]" % str(info))
            _info = json.loads(info[1])

            log.debug("getInfo _info: [%s]" % str(_info))

            params = {}
            params['authType'] = self.site
            # The UserID field is Classlink's unique ID and will always be there.
            params['externalID'] = _info.get('UserId')
            firstName = _info.get('FirstName')
            if firstName is not None:
                params['firstName'] = firstName
            lastName = _info.get('LastName')
            if lastName is not None:
                params['lastName'] = lastName
            email = _info.get('Email')
            if email is not None:
                email = email.lower().strip()
                params['email'] = email
            picture = _info.get('ImagePath')
            if picture is not None:
                params['imageURL'] = picture
            params['token'] = 'https://launchpad.classlink.com/%s' % str(_info.get('UserId'))
            params['roleID'] = 7
            params['role'] = 'student'
            role = _info.get('Role')
            if role is not None:
                if role in self.teacher_roles:
                    params['roleID'] = 5
                    params['role'] = 'teacher'
            districtName = _info.get('Tenant')
            if districtName is not None:
                params['partnerDistrictName'] = districtName
            districtID = _info.get('TenantId')
            if districtID is not None:
                params['partnerDistrictID'] = districtID

            result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            result['response']['classlink'] = params
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
        log.info('classlink authenticated: params[%s]' % request.params)
        return self._authenticated(self.site)
