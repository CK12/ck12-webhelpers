import logging, traceback

from pylons import config, request, session, tmpl_context as c, url
from pylons.controllers.util import redirect

from auth.controllers import decorators as d
from auth.controllers.extAuth import ExtAuthController
from auth.controllers.errorCodes import ErrorCodes
from auth.lib.base import BaseController, render
from oauth2client.client import AccessTokenCredentials
from oauth2client.client import OAuth2WebServerFlow
from auth.model.exceptions import RemoteAPIStatusException
from auth.model import api
import httplib2
import json

log = logging.getLogger(__name__)
# http://google-api-python-client.googlecode.com/hg/docs/epy/oauth2client.client.OAuth2WebServerFlow-class.html
class EdmodoconnectController(ExtAuthController):
    """
        Classlink authentication related APIs.
    """
    def __init__(self):
        self.client_id = config.get('edmodo_client_id')
        self.client_secret = config.get('edmodo_client_secret')
        self.scope = 'basic read_groups read_connections read_user_email create_messages write_library_items all write_assignments read_assignment_submissions write_assignment_submissions read_assignments'
        self.site = 'edmodoconnect'
        self.return_url = config.get('edmodo_redirect_uri')
        self.returnTo = config.get('edmodo_returnTo')
        self.token_uri = config.get('edmodo_token_url')
        self.auth_uri = config.get('edmodo_oauth_url')
        self.state = ''
        self.appName = ''
        self.teacher_roles = ['teacher']
        self.edmodoDict = {
            'apiKeys': {
                'edmpracticemath': config.get('edmodo_math_api_key'),
                'edmpracticescience': config.get('edmodo_science_api_key'),
            },
            'launchUrl': config.get('edmodo_launch_url')
        }

    def _getMinimalMember(self, params, member, accessToken, externalID, appID=None):
	params['email'] = member.email
	params['token'] = 'https://edmodo-connect.com/%s' % externalID
	params['access_token'] = accessToken
	if appID:
	    params['appID'] = appID
	return params

    @d.trace(log, ['url'])
    def login(self, url=None):
        """
            Login via Edmodo oAuth2.
        """
        try:
            appLogin = True if request.params.get('appLogin', '').lower() == 'true' else False
            if appLogin:
                self.return_url = '' # Set empty redirect_uri for app login. 
            oAuthFlow = OAuth2WebServerFlow(self.client_id, self.client_secret, self.scope, auth_uri=self.auth_uri, token_uri=self.token_uri, redirect_uri=self.return_url, state=self.state,response_type="code")
            returnTo = request.params.get('returnTo', self.returnTo)
            # check for appName
            appName = request.params.get('appName', '').lower()
            appRedirect = request.params.get('redirect', None)
            if appRedirect:
                session['appRedirect'] = appRedirect
            if appName:
                assignmentEID = request.params.get('assignmentEID', None)
                assignmentID = request.params.get('assignmentID', None)
                self.appName = appName
                if appName == "edmpracticemath":
                    returnTo = config.get("edmodo_math_appUrl") 
                if appName == "edmpracticescience":
                    returnTo = config.get("edmodo_science_appUrl")
                if assignmentID:
                    returnTo = "%s?assignmentID=%s" %(returnTo, assignmentID)
                elif assignmentEID:
                    returnTo = "%s?assignmentEID=%s" %(returnTo, assignmentEID)
            session['appName'] = appName 
            requestor = request.params.get('requestor','')
            log.debug("edmodoConnect login: returnTo[%s]" % returnTo)
            log.debug("edmodoConnect login: requestor[%s]" % requestor)
            log.debug("edmodoConnect oAuthFlow: oAuthFlow[%s]" % oAuthFlow)
            # if popup is false, the request is for a non-popup signin
            # default behavior is popup
            popup = request.params.get('popup','false')
            session['isPopup'] = popup
            if popup == 'false':
                if requestor:
                    session['requestor'] = requestor 
                if returnTo:
                    log.debug("edmodoConnect login: saving returnTo to session")
                    session['returnTo'] = returnTo
          
            session['oAuthFlow'] = oAuthFlow
            session.save()
            if not appLogin:
                redirectURL = oAuthFlow.step1_get_authorize_url()
                log.debug("edmodoConnect login: redirectURL[%s]" % redirectURL)
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
            Get the member information from edmodo.
        """
        code = request.params.get('code')
        token = request.params.get('token')
        appName = session.get('appName')
        oAuthFlow = session.get('oAuthFlow')
        appRedirect = session.get('appRedirect')
        c.errorCode = ErrorCodes.OK
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)

        if oAuthFlow is not None:
            log.info("BULE1 ")
            log.info(code)
            if token:     
                credentials = AccessTokenCredentials(token,'')
            else:     
                credentials = oAuthFlow.step2_exchange(code)
            
            credentialsJSON = json.loads(credentials.to_json())
            log.debug("code [%s]"%code)
            log.debug("credentials [%s]"%credentials)
            log.debug("credentials json [%s]"%credentialsJSON)
            # https://developers.edmodo.com/edmodo-connect/docs/
            http = httplib2.Http()
            _http = credentials.authorize(http)
            userinfo_url = config.get('edmodo_userinfo_url')
            log.debug("getInfo edmodoMyInfo: [%s]" % userinfo_url)
            info = _http.request(userinfo_url)
            log.debug("getInfo info: [%s]" % str(info))
            response_header = info[0]
            _info = json.loads(info[1])

            # Check for 403 or other errors from API call
            if "error" in _info or response_header.status in [403]:
                log.error("getInfo resposne status [%s]" %response_header.status)
                c.errorCode = ErrorCodes.AUTHENTICATION_FAILED
                message = "%s: %s"%(_info['status_code'], _info['error'])
                raise RemoteAPIStatusException(c.errorCode, message, response_data = _info)

            params = {}
            params['authType'] = self.site
            params['externalID'] = _info.get('id')
            params['isTeacher'] = False
            if appRedirect:
                params['appRedirect'] = appRedirect

            # For now only storing teacher access_token to use for setting grades for students.
            # Store refresh_token incase we need a fresh token.
            # Flx.lib.helpers has the function to refresh the token.
            role = _info.get('type', None)
            if role and role in self.teacher_roles:
                params['isTeacher'] = True
                params['refresh_token'] = credentialsJSON['refresh_token']
                params['token_expiry'] = credentialsJSON['token_expiry']
            # Check to see if we've already setup this user's edmodo connect account.
            typeID = api.getMemberAuthTypeByName(self.site)
            log.debug("getInfo memberAuthTypeByName  [%s]"% str(typeID.id))
            memberExtData = api.getMemberExtData(authTypeID=typeID.id, externalID=str(_info.get('id')))
            log.debug("getInfo memberExtData with edmodo connect authType  [%s]"% str(memberExtData))
            member = None
            # This assumes we've already checked for the edmodo account using user_token
            # when we setup the account initially.
            if memberExtData:
                params['userToken'] = memberExtData.externalID
                typeID = api.getMemberAuthTypeByName('edmodo')
                edmodo_auth = api.getMemberExtData(authTypeID=typeID.id, memberID=memberExtData.memberID)
                log.debug("getInfo edmodo_auth [%s]"%edmodo_auth)
                if edmodo_auth:
                    edmodo_auth = edmodo_auth[0]
                    log.debug("getInfo edmodo_auth [%s]"%edmodo_auth)
                    params['userToken'] = edmodo_auth.externalID
                member = api.getMemberByID(id=memberExtData.memberID)
                params = self._getMinimalMember(params, member,credentialsJSON['access_token'], memberExtData.externalID)
                if appName:
                    params['appID'] = self.edmodoDict['apiKeys'][appName]
                log.debug("getInfo we have already setup this account [%s]"%str(params))
                result['response']['edmodoconnect'] = params
                return result

            # Get user token for checking old apps api authenticated users
            get_user_token_url = "https://api.edmodo.com/users/%s/user_token"%(_info.get('id'))
            log.debug("getInfo get user token url [%s]" %(get_user_token_url))
            token_info = _http.request(get_user_token_url)
            log.debug("getInfo userToken info [%s]"% str(token_info))
            log.debug("getInfo _info: [%s]" % str(_info))
            token_resp = json.loads(token_info[1])
            response_header = token_info[0]

            try:
                # Check for 403 or other errors from API call
                if "error" in _info or response_header.status in [403]:
                    log.error("getInfo user_token resposne status [%s]" %response_header.status)
                    c.errorCode = ErrorCodes.AUTHENTICATION_FAILED
                    message = "%s: %s"%(token_resp['status_code'], token_resp['error'])
                    raise RemoteAPIStatusException(c.errorCode, message, response_data = token_resp)

                userToken = token_resp.get('user_token', None)
                if userToken:
                    # Lookup existing edmodo extData user userToken.
                    # If found get the member info using getMemberByID
                    # and set the email for federatedLogin 
                    params['userToken'] = userToken
                    #See if account exists using edmodo authID and userToken
                    typeID = api.getMemberAuthTypeByName('edmodo')
                    log.debug("getInfo authTypeID [%s]"% str(typeID.id))
                    memberExtData = api.getMemberExtData(authTypeID=typeID.id, externalID=userToken)
                    log.debug("getInfo memberExtData  [%s]"% str(memberExtData))
                    member = None
                    if memberExtData:
                        member = api.getMemberByID(id=memberExtData.memberID) 
                        log.debug("getInfo member email [%s]"% str(member.email))
                    if member:
                        _info['email'] = member.email
                        params['email'] = member.email
                        params['token'] = 'https://edmodo-connect.com/%s' % str(_info.get('id'))
                        params['access_token'] = credentialsJSON['access_token']
                        if appName:
                            params['appID'] = self.edmodoDict['apiKeys'][appName]
                        result['response']['edmodoconnect'] = params
                        return result
                else:
                    params['userToken'] = params['externalID']
            except Exception, e:
                log.error("getInfo Exception [%s]  getting token_info: [%s]" % (str(e),str(token_info)))
                log.error(traceback.format_exc())
                c.errorCode = ErrorCodes.AUTHENTICATION_FAILED
                message = "Error processing user token [%s]"%(str(e))
                raise RemoteAPIStatusException(c.errorCode, message, response_data = token_resp)

            firstName = _info.get('first_name')
            if firstName is not None:
                params['firstName'] = firstName
            lastName = _info.get('last_name')
            if lastName is not None:
                params['lastName'] = lastName
            email = _info.get('email')
            if email is not None:
                email = email.lower().strip()
                params['email'] = email
            else:
                params['email'] = '%s-%s@partners.ck12.org' % (self.site, str(_info.get('id')).lower().strip())
            picture = _info.get('avatars')['small']
            if picture is not None:
                params['imageURL'] = picture
            params['token'] = 'https://edmodo-connect.com/%s' % str(_info.get('id'))
            params['roleID'] = 7
            params['role'] = 'student'
            role = _info.get('type')
            if role is not None:
                if role in self.teacher_roles:
                    params['roleID'] = 5
                    params['role'] = 'teacher'
            params['access_token'] = credentialsJSON['access_token']
            if appName:
                params['appID'] = self.edmodoDict['apiKeys'][appName]
            result['response']['edmodoconnect'] = params
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
        log.info('edmodoConnect authenticated: params[%s]' % request.params)
        return self._authenticated(self.site)
