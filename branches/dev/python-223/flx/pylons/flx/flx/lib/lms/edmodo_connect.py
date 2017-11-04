from datetime import datetime
from flx.controllers import decorators as d
from flx.controllers.errorCodes import ErrorCodes
from flx.lib import helpers as h
from Crypto.Cipher import Blowfish
from flx.lib.base import BaseController
from flx.model import exceptions as ex
from flx.lib.lms.utils import utils as lms_utils
#from auth.controllers.errorCodes import ErrorCodes
from oauth2client.client import AccessTokenCredentials
from oauth2client.client import OAuth2WebServerFlow
from oauth2client.client import AccessTokenCredentialsError
import httplib2
import json
import urllib
import logging
from pylons import config, tmpl_context as c
from pylons.i18n.translation import _
log = logging.getLogger(__name__)

session_cookie_domain = config.get("beaker.session.cookie_domain")
token_url = "https://api.edmodo.com/oauth/token"
client_id = config.get('edmodo_client_id')
client_secret = config.get('edmodo_client_secret')
redirect_uri = config.get('edmodo_redirect_uri')
########################################################################
# Decorator that can be used by controllers to handle access token
class accesTokenChecker(object):
    """
        Decorator to check for and return access token for using 
        Edmodo connect APIs.
    """

    def __init__(self, argNames=[]):
        self.argNames = argNames

    def __call__(self, func):
        def decorator(funcSelf, *args, **kwargs):
            log.debug("accesTokenChecker kwargs [%s]" %kwargs)
            access_token = _getAccessToken()
            log.debug("accesTokenChecker access_token [%s]" %access_token)
            if not access_token:
                return _accessTokenError("External access token not found")
            kwargs['access_token'] = access_token
            log.debug("accesTokenChecker kwargs [%s]" %kwargs)
            return func(funcSelf, *args, **kwargs)

        decorator.__name__ = func.__name__
        decorator.__doc__ = func.__doc__
        decorator.__dict__ = func.__dict__
        return decorator

def _getAccessToken():
    """
        Look for access token in session, if not found check
        request.cookies for lmscookie. Relies on edmodoappID cookie
        set by auth.

        If the lmscookie is not found look for a generic _edmcat cookie.

        Save the access token to the session and delete the cookie.
    """
    from pylons import response, request, session
    access_token = None
    lms_secret = config.get('lms_secret')
    log.debug(" _getAccessToken Request.cookies: [%s]"%request.cookies)
    log.debug("_getAccessToken session keys [%s] " %(session.keys()))
    if 'edmodo_connect_access_token' in session:
        log.debug("_getAccessToken getting token from session [%s]" %(session['edmodo_connect_access_token']))
        access_token = session['edmodo_connect_access_token']
    else:
        appID = request.cookies.get('edmodoappID', None)
        if appID:
            log.debug("_getAccessToken  building lmscookie name with appID [%s] " %(appID))
            lmsCookieName = '%s%s' % (config.get('lms_cookie_prefix'), appID)
            log.debug("_getAccessToken lmscookie name [%s] " %(lmsCookieName))
            access_token = request.cookies.get(lmsCookieName, None)
            log.debug("_getAccessToken access_token [%s] " %(access_token))
	    response.delete_cookie(lmsCookieName)
        else:
            log.debug("_getAccessToken getting access token from _edmcat")
            access_token = request.cookies.get('_edmcat', None)
            log.debug("_getAccessToken access token from _edmcat: [%s]" %(access_token))
	    response.delete_cookie('_edmcat')
	if access_token:
	    access_token = Blowfish.new(lms_secret).decrypt(h.genURLSafeBase64Decode(access_token, hasPrefix=False)).rstrip(' ') if lms_secret else h.genURLSafeBase64Decode(access_token, hasPrefix=False)
	    log.debug("_getAccessToken access token (2016): [%s]"%access_token)
	    # Save access token to session, then delte the cookie
	    session['edmodo_connect_access_token'] = access_token
	    session.save()
        memberID = session.get("userID", None)
        log.debug("_getAccessToken memberID: [%s]" %(memberID))
        if not access_token and memberID:
            access_token = lms_utils.getAccessTokenFromMongoDB(memberID=memberID)
            if access_token:
                session['edmodo_connect_access_token'] = access_token
                session.save()

	log.debug("Request.cookies: [%s]"%request.cookies)
    return access_token

def _accessTokenError(msg):
        error_message = "External access token not found or expired"
        if msg:
            error_message = str(msg)
        c.errorCode = ErrorCodes.EXTERNAL_API_FAILURE
        return ErrorCodes().asDict(c.errorCode, error_message)

def _retryAPI(token, api_url, method, data, headers):
    info = []
    credentials = None
    new_token = h.refreshAccessToken(token_url,client_id, client_secret, redirect_uri, token, grant_type="refresh_token")
    if new_token:
        try:
	    credentials = AccessTokenCredentials(new_token['access_token'],'')
	    http = httplib2.Http()
	    _http = credentials.authorize(http)
	    info = _http.request(api_url, method=method, body=data, headers = headers)
	    if info[0].status == 403:
	        raise ex.ExternalException((_(u'API returned 403 forbbiden')).encode('utf8'))
	    return info
        except Exception, e:
	    log.error(e)
	    raise e
    else:
        raise ex.ExternalException((_(u'Could not refresh token')).encode('utf8'))
########################################################################
class EdmodoConnect(BaseController):
    def __init__ (self,access_token=None):
        self.token = access_token
        self.connectAPI_prefix = 'https://api.edmodo.com'
    
   
    def _getAccessTokenCredentials(self, token=None):
        if token:
            self.token = token
        try:
            credentials = AccessTokenCredentials(self.token,'')
            return credentials
        except Exception, e:
            if type(e).__name__ == "AccessTokenCredentialsError":
                log.debug("Access token could not be redeemed")
            log.debug(e)
            return None

    def _getHTTPObject(self, creds=None):
        """
            Helper method to get a httplib2 Http object with
            oauth2 credentials.
        """
        credentials = None
        if creds:
            credentials = creds
        else:
            credentials = self._getAccessTokenCredentials()
        log.debug("_getHTTPObject credentials: [%s]" %credentials)
        http = httplib2.Http()
        _http = credentials.authorize(http)
        return _http

    @d.trace(log)        
    def postToEdmodoLibrary(self,type,itemObj, token=None):
        """
            Method to POST a CK-12 link to user's edmodo library
        """
        add_library_api = '%s/library_items'%(self.connectAPI_prefix)
        if token:
            self.token = token
        log.debug('postToEdmodoLibrary token[%s]'%(self.token))
        log.debug('postToEdmodoLibrary item type[%s]'%(type))
        log.debug('postToEdmodoLibrary item object[%s]'%( str(json.dumps(itemObj))))

        _http = self._getHTTPObject()

        headers = {'Content-type': 'application/json'}
        data = json.dumps({"type": type, "item": itemObj})

        log.debug("postToEdmodoLibrary data: [%s]" % str(data))
        
        info = _http.request(add_library_api,method='POST',body=data, headers = headers)
        return info[1]


    @d.trace(log)
    def _getGroupMembership(self, groupID, httpObject=None):
        _http = httpObject
        
        if not groupID:
            log.error("_getGroupMembership missing groupID")
            return None

        if not _http:
            _http = self._getHTTPObject()
        
	get_group_membership_api = '%s/group_memberships?group_id=%s'%(self.connectAPI_prefix, groupID)
	info = _http.request(get_group_membership_api)

        return info

    @d.trace(log)
    def getUserEdmodoInfo(self):
        """
           Method to get the logged in user info
        """

        get_my_info_api = '%s/users/me'%(self.connectAPI_prefix)
        try:
	    _http = self._getHTTPObject()

	    info = _http.request(get_my_info_api)
	    if info[0].status == 403:
                raise ex.ExternalException((_(u'API returned 403 forbbiden')).encode('utf8'))

	    log.debug("getUserEdmodoInfo info: [%s]" % str(info))
	    user_info = json.loads(info[1])

	    return json.dumps(user_info)

	except ex.ExternalException, e:
            log.error("Failed to create assignment due to 403: %s"% str(e), exc_info=e)
            raise ex.ExternalException(e)

        except Exception, e:
            log.debug("There was an error [%s]" %str(e))
            raise e

    @d.trace(log)
    def getUserEdmodoGroups(self):
        """
           Method to get all the Edmodo groups a user is in.
        """
        get_groups_api = '%s/groups'%(self.connectAPI_prefix)
        try:
	    _http = self._getHTTPObject()
	    info = _http.request(get_groups_api)
	    log.debug("getUserEdmodoGroups info: [%s]" % str(info))
	    if info[0].status == 403:
                raise ex.ExternalException((_(u'API returned 403 forbbiden')).encode('utf8'))
	    return info[1]
        except Exception, e:
            log.debug("There was an error getting groups from Edmodo [%s]" %str(e))
            raise e

    @d.trace(log)
    def getAssignments(self, user_ids=None, group_ids=None):
        """
           Method to get a users assignments
        """

        get_assignments_api = '%s/assignments'%(self.connectAPI_prefix)
        try:
            params = ""
            if user_ids:
              params += "user_ids=%s"% str(user_ids)

            if group_ids:
              params += "group_ids=%s"% str(group_ids)
            
            #params = urllib.urlencode(params)
	    log.debug("getAssignments params: [%s]" % str(params))
            get_assignments_api = "%s?%s"%(get_assignments_api,params)
	    log.debug("getAssignments api: [%s]" % str(get_assignments_api))
            _http = self._getHTTPObject()

	    info = _http.request(get_assignments_api)

	    log.debug("getAssignments info: [%s]" % str(info))
	    if info[0].status == 403:
                raise ex.ExternalException((_(u'API returned 403 forbbiden')).encode('utf8'))
	    assignment_list = json.loads(info[1])

	    return json.dumps(assignment_list)
	except ex.ExternalException, e:
	    log.error("Failed to get assignments due to 403: %s"% str(e), exc_info=e)
            raise ex.ExternalException(e)
	except Exception, e:
	    log.error("Failed to get assignments unknown exception: %s"% str(e), exc_info=e)
            #status = {'status': 'fail'} status = { 'status': 'failed', 'error_message': str(e) }
            raise Exception(e)


    @d.trace(log)
    def createAssignment(self, title, due_at, recipients, desc=None, attachments=None):
        """
           Method to create an assignment
        """
        desc = desc
	log.debug("createAssignments description: [%s]" % desc)
        try:
	    if not title:
		log.error("Missing title");
		raise ex.MissingArgumentException((_(u'title missing.')).encode('utf8'))
	    if not due_at:
		log.error("Missing due date");
		raise ex.MissingArgumentException((_(u'due date missing.')).encode('utf8'))
	    if not recipients:
		log.error("Missing recipients");
		raise ex.MissingArgumentException((_(u'recipients missing.')).encode('utf8'))

	    create_assignments_api = '%s/assignments'%(self.connectAPI_prefix)
	    _http = self._getHTTPObject()

            headers = {'Content-type': 'application/json'}
            data = {"title": title, "due_at": due_at, "recipients": recipients}#{"users":[{"id":38083795}]}}

	    log.debug("createAssignments description: [%s]" % desc)
            if desc:
                data['description'] = desc

            if attachments:
                data['attachments'] = attachments
           
            data = json.dumps(data)
	    log.debug("createAssignments post data: [%s]" % data)
            info = _http.request(create_assignments_api, method='POST', body=data, headers = headers)

	    log.debug("createAssignments reponse: [%s]" % str(info))

            if info[0].status == 403:
                raise ex.ExternalException((_(u'API returned 403 forbbiden')).encode('utf8')) 
	    log.debug("getAssignments info: [%s]" % str(info))
	    assignment_list = json.loads(info[1])
            assignment_list['status'] = info[0].status
            assignment_list['assignment_id'] = assignment_list['id'] 
            return json.dumps(assignment_list)

	except ex.MissingArgumentException, e:
	    log.error("Failed to create assignment: %s"% str(e), exc_info=e)
            raise ex.MissingArgumentException(e)
        
	except ex.ExternalException, e:
	    log.error("Failed to create assignment due to 403: %s"% str(e), exc_info=e)
            raise ex.ExternalException(e)

	except Exception, e:
	    log.error("Failed to create assignment unknown exception: %s"% str(e), exc_info=e)
            #status = {'status': 'fail'} status = { 'status': 'failed', 'error_message': str(e) }
            raise Exception(e)


    @d.trace(log)
    def turninAssignment(self, assignment_id, content, attachment=None):
        """
            Method to turn in an assignment
        """
        try:
            turnin_assignment_api = '%s/assignment_submissions'%(self.connectAPI_prefix)
            _http = self._getHTTPObject()

            log.debug("turninAssignment attachment: [%s]"%attachment)
            headers = {'Content-type': 'application/json'}
            data = {"assignment_id": int(assignment_id), "content": str(content), "attachment": attachment}
            data = json.dumps(data)
            log.debug("turninAssignment post data: [%s]"%data)
            info = _http.request(turnin_assignment_api, method='POST', body=data, headers = headers)

            if info[0].status == 403:
                raise ex.ExternalException((_(u'API returned 403 forbbiden')).encode('utf8'))

            log.debug("turninAssignment info: [%s]"%str(info))
            turnedIn = json.loads(info[1])
            turnedIn['status'] = info[0].status
            return json.dumps(turnedIn)

	except ex.ExternalException, e:
	    log.error("Failed to turn in assignment due to 403: %s"% str(e), exc_info=e)
            raise ex.ExternalException(e)

	except Exception, e:
	    log.error("Failed to turn in assignment unknown exception: %s"% str(e), exc_info=e)
            raise Exception(e)

    @d.trace(log)
    def submitGrade(self, submitter_id, entity_id, entity_type="assignment", grade_score=None, grade_total=None):
        """
           Method to submit a grade for an assignment
        """
        try:
	    submit_grade_api = '%s/grades'%(self.connectAPI_prefix)
	    _http = self._getHTTPObject()

            headers = {'Content-type': 'application/json'}
            data = {"submitter_id": int(submitter_id),
                    "entity_id": entity_id,
                    "entity_type": entity_type}

            if grade_score:
                data["grade_score"] = str(grade_score)
            else:
                data["grade_score"] = "0"
            if grade_total:
                data["grade_total"] = str(grade_total)
            else:
                data["grade_total"] = "100"

            data = json.dumps(data)
	    log.debug("submitGrade data for request: [%s]" % data)
            info = []
            try:
              info = _http.request(submit_grade_api, method='POST', body=data, headers = headers)
            except AccessTokenCredentialsError, e:
	        # need to refresh access token
	        info = _retryAPI(self.token, submit_grade_api, 'POST', data, headers)
	    log.debug("submitGrade response info: [%s]" % str(info))

            if info[0].status == 403:
                raise ex.ExternalException((_(u'API returned 403 forbbiden')).encode('utf8'))
            if info[0].status == 401:
	        log.debug("submitGrade response info: [%s]" % str(info))
                log.debug("submitGrade need to refresh access token")
	        info = _retryAPI(self.token, submit_grade_api, 'POST', data, headers)
                    
	    log.debug("submitGrade response info: [%s]" % str(info))
	    assignment_list = json.loads(info[1])
            assignment_list['score'] = str(grade_score)
            return json.dumps(assignment_list)

	except ex.MissingArgumentException, e:
	    log.error("Failed to submit grade: %s"% str(e), exc_info=e)
            raise ex.MissingArgumentException(e)
        
	except Exception, e:
	    log.error("Failed to submit grade unknown exception: %s"% str(e), exc_info=e)
            raise Exception(e)

