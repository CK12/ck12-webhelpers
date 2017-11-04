import logging
from pylons.i18n.translation import _ 
from datetime import datetime

from pylons import request, session, config
from pylons.controllers.util import redirect

from flx.controllers import decorators as d
from flx.lib.base import BaseController
from flx.controllers.errorCodes import ErrorCodes
from flx.model.mongo.oauth2accesstoken import Oauth2AcessToken
import flx.lib.lms.google_clasroom as classroom

import httplib2
from apiclient.discovery import build
from oauth2client.client import OAuth2WebServerFlow
from oauth2client.client import AccessTokenCredentials

CLIENT_ID = config.get('CLASSROOM_CLIENT_ID')
CLIENT_SECRET = config.get('CLASSROOM_CLIENT_SECRET')
OAUTH_SCOPE = config.get('CLASSROOM_OAUTH_SCOPE')
STUDENT_OAUTH_SCOPE = config.get('CLASSROOM_STUDENT_OAUTH_SCOPE')
REDIRECT_URI = config.get('CLASSROOM_REDIRECT_URI')
REFRESH_REDIRECT_URI = config.get('REFRESH_REDIRECT_URI')
REFRESH_TOKEN_JSON_PATH = '/opt/2.0/flx/pylons/flx/refreshtoken.json'

log = logging.getLogger(__name__)

class GoogleclassroomController(BaseController):

    @d.checkAuth(request, False, True)
    @d.trace(log, ['member'])
    def googleAuthToken(self, member):
        token = request.params.get('code')
        error = request.params.get('error')
        rurl = request.params.get('redirectUrl')
        if token:
            log.info("Received single use token: %s" % token)
            try:
                #credentials = self._getCredentials(auth_token=token)
                credentials = classroom._getCredentials(auth_token=token)
                log.debug('googleAuthToken credentials:[%s]' % credentials)
            except Exception as e:
                log.error('googleAuthToken exception:[%s]' % str(e), exc_info=e)
                error = str(e)
        else:
            log.error('No authentication token found in request')
            if not error:
                error = "No authentication token found in request"
        
        if not rurl:
            rurl = config.get('CLASSROOM_redirectUrl')
        if error:
            rurl += '?error=%s' % error
            log.info("With error Redirecting to: %s" % rurl)
            return redirect(rurl)

        log.info("Redirecting to: %s" % rurl)
        return redirect(rurl)

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log, ['member'])
    def googleAuthURL(self, member):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            redirect_uri = REDIRECT_URI
            SCOPES = OAUTH_SCOPE
            role = request.params.get('role', None)
            log.info('googleAuthURL role :: %s' %role)
            if role and role == 'student':
                SCOPES = STUDENT_OAUTH_SCOPE
            # Force refresh token to be sent
            # https://github.com/google/oauth2client/issues/453
            flow = OAuth2WebServerFlow(client_id=CLIENT_ID,client_secret=CLIENT_SECRET, scope=SCOPES, redirect_uri=redirect_uri, access_type='offline')
            authorize_url = flow.step1_get_authorize_url()
            log.info('authorize_url :: %s' %authorize_url)
            result['response']['googleAuthURL'] = authorize_url
            return result
        except Exception as e:
            log.error('Error getting google authorization URL: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.GOOGLECLASSROOM_GET_AUTH_URL_ERROR, str(e))


    @d.trace(log)
    def googleAuthLogout(self):
        """
            Logout from Google auth session - basically simply remove the googleAuthToken
            from session
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        start = datetime.now()
        try:
            if session.has_key('googleAuthToken'):
                del session['googleAuthToken']
                session.save()
            returnTo = request.params.get('returnTo')
            if not returnTo:
                return d.jsonifyResponse(result, start)
        except Exception as e:
            log.error('Error logging out of google doc authentication: %s' % str(e), exc_info=e)
            return d.jsonifyResponse(ErrorCodes().asDict(ErrorCodes.NO_SUCH_GOOGLECLASSROOM_AUTH, str(e)), start)
        ## Redirect
        if returnTo:
            log.info("Redirecting to: %s" % returnTo)
            return redirect(returnTo)

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log, ['member'])
    def isGoogleClassroomAuthenticated(self, member):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            token = session.get('googleAuthToken')
            if not token:
                raise Exception((_(u'Not authenticated for Google Classroom')).encode("utf-8"))
            # Verify if we can retrieve the service object.
            #service = self._getGoogService(token, is_student=is_student)
            service = classroom._getGoogService(token)
            user = service.userProfiles().get(userId='me').execute()
            verifiedTeacher = user.get('verifiedTeacher', False)
            # For teachers we need to save their credentials to DB for student grade submissions
            if verifiedTeacher:
                credentials = session.get('googleAuthCredentials')
                log.debug("isGoogleClassroomAuthenticated credentials [%s]"%credentials)
                try:
                    res = Oauth2AcessToken().create(memberID = member.id,
                                                  accessToken= credentials.access_token,
                                                  refreshToken = credentials.refresh_token,
                                                  authTypeID = 'google_classroom',
                                                  expires = credentials.token_expiry,
                                                  returnResult = False)
                    log.info("isGoogleClassroomAuthenticated teacher access token stored [%s]"%res)
                except Exception, e:
                    log.error("Could not create access token entry %s"%e,exc_info=e)
            log.debug("isGoogleClassroomAuthenticated user:[%s]" % user)
            result['response']['googleClassroomAuthenticated'] = True
            result['response']['verifiedTeacher'] = verifiedTeacher
            result['response']['id'] = user.get('id')
            result['response']['permissions'] = user.get('permissions')
            return result
        except Exception as e:
            # User is not authenticated with Google, If any auth related data present in session remove it.
            for skey in ['googleAuthToken', 'googleAuthCredentials', 'googleRefreshToken']:
                if session.has_key(skey):
                    del session[skey]
            session.save()
            log.error('Error getting google classroom authenticated check: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.NO_SUCH_GOOGLECLASSROOM_AUTH, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, True)
    @d.setPage(request, ['member'])
    @d.trace(log, ['member', 'pageNum', 'pageSize'])
    def listCourses(self, member, pageNum, pageSize):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            token = session.get('googleAuthToken') or request.params.get('googleAuthToken')
            if not token:
                raise Exception((_(u'Must authenticate with Google Classroom')).encode("utf-8"))
            #service = self._getGoogService(token)
            service = classroom._getGoogService(token)
            results = []
            param = {}
            # Only fetch active courses 
            param['courseStates'] = "ACTIVE"
            # Get courses that are for this teacher only
            param['teacherId'] = "me"
            # Getting minimal information needed.
            # courseID
            # name
            # ownerID.
            param['fields'] = "courses(id,ownerId,name)"
            param['pageSize'] = 100
            response = service.courses().list(**param).execute()
            results.extend(response.get('courses', []))
            total = len(results)    
            if pageSize:
                start = ((pageNum-1) * pageSize)
                end = start + pageSize
            results = results[start:end]	
            result['response']['courses'] = results
            result['response']['total'] = total
            return result
        except Exception as e:
            log.error('Google Classroom listCourses exception:[%s]' % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.CANNOT_LIST_GOOGLE_DOCUMENTS, str(e))

    def _getGoogService(self, token, is_student=False):
        """
        Get the Google service object.
        """
        http = httplib2.Http()		
        credentials = self._getCredentials(access_token=token, is_student=is_student)
        #http.disable_ssl_certificate_validation = True
        # Build the service object
        http = credentials.authorize(http)
        service = build('classroom', 'v1', http=http)
        #try:
        #    user = service.userProfiles().get(userId='me').execute()
        #    log.info('_getGoodService: user [%s]'%str(user.get('id')))            
        #except Exception as e:
        #  log.info('_getGoodService: exception [%s]'%str(e))            
        #  raise Exception('%s'%str(e))
        return service

    def _getCredentials(self, auth_token=None, access_token=None, is_admin=None, is_student=False):
        """
        """
        save = False
        #There is some flow that is breaking this, setting to None to always get credentials
        credentials = session.get('googleAuthCredentials')
        log.info('_getCredentials: Credentials [%s]'%credentials)            
        # Prpeare the credentials.
        if not credentials:
            if auth_token:
                # Create credentials from oauthflow, only once.	
                redirect_uri = REDIRECT_URI
                SCOPES = OAUTH_SCOPE
                if is_student:
                    SCOPES = STUDENT_OAUTH_SCOPE
                flow = OAuth2WebServerFlow(client_id=CLIENT_ID,client_secret=CLIENT_SECRET, scope=SCOPES, redirect_uri=redirect_uri)
                flow.redirect_uri = redirect_uri
                credentials = flow.step2_exchange(auth_token)
                log.info('_getCredentials: Credentials from OAuth2WebServerFlow [%s]'%credentials.to_json())            
            else:
                credentials = AccessTokenCredentials(access_token, 'ck-12')
                if credentials.invalid or credentials.access_token_expired:
                    raise Exception('Google classroom credentials invalid/expired, Please relogin.')
            save = True
        else:
            # Raise exception if credentials are invalid.
            if credentials.invalid:
                log.info('_getCredentials: Credentials are invalid')            
                raise Exception('Google classroom invalid credentials, Please relogin.')
            # Refresh the access token if expired.
            if credentials.access_token_expired:
                log.info('_getCredentials: Access token expired trying to refresh')            
                http = httplib2.Http()
                try:
                    credentials.refresh(http)
                except Exception as e:
                    raise Exception('Google classroom AccessToken expired, Please relogin.')
                save = True
        if save:
            # Save credentials in session.
            session['googleAuthCredentials'] = credentials
            session['googleAuthToken'] = credentials.access_token
            try:
                googleRefreshToken = credentials.refresh_token
            except Exception as e:
                log.error("_getCredentials exception in save credentials: %s", str(e))
                googleRefreshToken = None
            session['googleRefreshToken'] = googleRefreshToken
            session.save()
            log.info('Saving Tokens, AccessToken: %s, RefreshToken:%s' % (credentials.access_token, googleRefreshToken))            

        return credentials

    @d.trace(log)    
    def generateRefreshToken(self):
        """
        """
        flow = OAuth2WebServerFlow(client_id=CLIENT_ID,client_secret=CLIENT_SECRET, scope=OAUTH_SCOPE, redirect_uri=REFRESH_REDIRECT_URI)
        authorize_url = flow.step1_get_authorize_url()
        log.info('authorize_url :: %s' %authorize_url)
        return redirect(authorize_url)

    @d.jsonify()
    @d.trace(log)    
    def refreshToken(self):
        """
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        log.info('request.params :: %s' %request.params)
        code = request.params.get('code')
        flow = OAuth2WebServerFlow(CLIENT_ID, CLIENT_SECRET, OAUTH_SCOPE, REFRESH_REDIRECT_URI)
        flow.redirect_uri = REFRESH_REDIRECT_URI
        credentials = flow.step2_exchange(code)
        log.info('Refresh credentials: %s' % credentials)

        if credentials:
            jsonData = credentials.to_json()
            fp = open(REFRESH_TOKEN_JSON_PATH, "w")
            fp.write(jsonData)
            fp.close()
            result['response']['msg'] = 'Successfully saved the refresh token.'
        else:
            result['response']['msg'] = 'Unable to generate refresh token.'
        
        return result
