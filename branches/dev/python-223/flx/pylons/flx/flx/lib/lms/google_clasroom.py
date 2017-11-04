# https://developers.google.com/api-client-library/python/apis/classroom/v1
from apiclient.discovery import build
from oauth2client.client import OAuth2WebServerFlow
from oauth2client.client import AccessTokenCredentials
from oauth2client.client import OAuth2Credentials
from pylons import config, session as pylons_session
from pylons.i18n.translation import _
import logging
import httplib2
import json

CLIENT_ID = config.get('CLASSROOM_CLIENT_ID')
CLIENT_SECRET = config.get('CLASSROOM_CLIENT_SECRET')
OAUTH_SCOPE = config.get('CLASSROOM_OAUTH_SCOPE')
REDIRECT_URI = config.get('CLASSROOM_REDIRECT_URI')
REFRESH_REDIRECT_URI = config.get('REFRESH_REDIRECT_URI')
REFRESH_TOKEN_JSON_PATH = '/opt/2.0/flx/pylons/flx/refreshtoken.json'

log = logging.getLogger(__name__)

# Use fields to improve performance
# https://developers.google.com/classroom/guides/performance
FIELDS = {'coursework': 'maxPoints,state',
        'createAssignment': 'id,title,alternateLink',
        'studentSubmissions':'studentSubmissions(id,state,draftGrade,assignedGrade)'}

def _getCredentials(auth_token=None, access_token=None, is_admin=None, teacher_permissions=False, refreshToken=None, tokenExpiry=None):
    """
        Documentation on oauth2client
        http://oauth2client.readthedocs.io/en/latest/_modules/oauth2client/client.htm
    """
    save = False
    credentials = pylons_session.get('googleAuthCredentials')
    # Don't use session credentials, this is only used for setting grade
    if teacher_permissions:
        credentials = None
    # Prpeare the credentials.
    if not credentials:
        if auth_token:
            # Create credentials from oauthflow, only once. 
            redirect_uri = REDIRECT_URI
            # Force refresh token to be sent setting prompt to consent
            # https://github.com/google/oauth2client/issues/453
            flow = OAuth2WebServerFlow(client_id=CLIENT_ID,client_secret=CLIENT_SECRET, scope=OAUTH_SCOPE, redirect_uri=redirect_uri, access_type='offline')
            flow.redirect_uri = redirect_uri
            credentials = flow.step2_exchange(auth_token)
        else:
            if refreshToken and tokenExpiry:
                log.debug("_getCredentials using OAuth2Credentials class")
                credentials = OAuth2Credentials(access_token,
                                                CLIENT_ID,
                                                CLIENT_SECRET,
                                                refreshToken,
                                                tokenExpiry,
                                                'https://accounts.google.com/o/oauth2/token',
                                                'ck-12',
                                                scopes=OAUTH_SCOPE)
                log.info('_getCredentials: Credentials from OAuth2WebServerFlow [%s]'%credentials.to_json())
            else:
                log.debug("_getCredentials using AccessTokenCredentials class")
                credentials = AccessTokenCredentials(access_token, 'ck-12')
            if credentials.access_token_expired:
                http = httplib2.Http()
                try:
                    credentials.refresh(http)
                except Exception as e:
                    if teacher_permissions:
                        raise Exception('Google classroom teacher AccessToken expired, Please relogin.')
                    else:
                        raise Exception('Google classroom AccessToken expired, Please relogin.')
            if credentials.invalid:
                raise Exception('Google classroom credentials invalid/expired, Please relogin.')
        save = True
    else:
        # Raise exception if credentials are invalid.
        if credentials.invalid:
            raise Exception('Google classroom invalid credentials, Please relogin.')
        # Refresh the access token if expired.
        if credentials.access_token_expired:
            http = httplib2.Http()
            try:
                credentials.refresh(http)
            except Exception as e:
                raise Exception('Google classroom AccessToken expired, Please relogin.')
            save = True
    # Don't save to sessions this is only used for setting grade
    if teacher_permissions:
        save = False
    if save:
        # Save credentials in session.
        pylons_session['googleAuthCredentials'] = credentials
        pylons_session['googleAuthToken'] = credentials.access_token
        try:
            googleRefreshToken = credentials.refresh_token
        except Exception as e:
            googleRefreshToken = None
        pylons_session['googleRefreshToken'] = googleRefreshToken
        pylons_session.save()
        log.info('Saving Tokens, AccessToken: %s, RefreshToken:%s' % (credentials.access_token, googleRefreshToken))

    return credentials

def _getGoogService(token, teacher_permissions=False, refreshToken=None, tokenExpiry=None):
    """
    Get the Google service object.
    """
    http = httplib2.Http()
    credentials = _getCredentials(access_token=token, teacher_permissions=teacher_permissions, refreshToken=refreshToken, tokenExpiry=tokenExpiry)
    #http.disable_ssl_certificate_validation = True
    # Build the service object
    http = credentials.authorize(http)
    credentialsJSON = json.loads(credentials.to_json())
    log.debug("_getGoogService credentials json [%s]"%credentialsJSON)
    service = build('classroom', 'v1', http=http)
    return service

def turnin_assignment_for_member(providerGroupID, providerAssignmentID, studentSubmissionID, reportURL=None):
    #
    #  Turnin assignment in Google Classroom
    #
    token = pylons_session.get('googleAuthToken')
    if not token:
        raise Exception((_(u'Not authenticated for Google Classroom')).encode("utf-8"))
    service = _getGoogService(token)
    turnedInAssignment = None
    try:
        if reportURL:
            try:
                body = {}
                body["addAttachments"] = [{'link': {'url':str(reportURL).encode('utf-8')}}]
                log.debug("turnin_assignment_for_member attachment body [%s]"%body)
                modifiedAttachment = service.courses().courseWork().studentSubmissions().modifyAttachments(
                        courseId=providerGroupID,
                        courseWorkId=providerAssignmentID,
                        id=studentSubmissionID,
                        body=body).execute()
                log.error("turnin_assignment_for_member returned attachment [%s]"%modifiedAttachment)
            except Exception as e:
                log.error("turnin_assignment_for_member adding report attachment exception[%s]"%str(e))


        turnedInAssignment = service.courses().courseWork().studentSubmissions().turnIn(
                courseId=providerGroupID,
                courseWorkId=providerAssignmentID,
                id=studentSubmissionID,
                body={}).execute()
        if not turnedInAssignment:
            turnedInAssignment = 'success'
    except Exception as e:
        log.error("turnin_assignment_for_member exception[%s]"%str(e))
        if type(e).__name__ == 'HttpError':
            raise Exception((_(u'Google Classroom denied access for this course courseId[%s] courseWorkId[%s]'%(providerGroupID,providerAssignmentID))).encode("utf-8"))
        raise e

    log.debug("turnin_assignment_for_member: courseWork[%s]" % turnedInAssignment)
    return turnedInAssignment

def create_assignment(providerGroupID, title, description, assignmentUrl, thumbnailUrl="https://img2.ck12.org/media/common/images/logo_ck12.svg", dueDate=None, timezone='US/Pacific'):
    #
    #  Create assignment in Google Classroom
    #
    token = pylons_session.get('googleAuthToken')
    if not token:
        raise Exception((_(u'Not authenticated for Google Classroom')).encode("utf-8"))
    service = _getGoogService(token)
    assignmentResponse = None
    courseWork = {
            'title': title,
            'description': description,
            'materials': [
                {'link': { 'url': assignmentUrl, "title": "%s assignment" %title,"thumbnailUrl": thumbnailUrl}},
            ],
          'workType': 'ASSIGNMENT',
          'state': 'PUBLISHED',
          'maxPoints': 100
          }
    if dueDate:
        from datetime import datetime, timedelta
        import pytz
        # Get midnight in UTC from local timezone
        tz = pytz.timezone(timezone)
        log.debug('create_assignment timezone [%s]' %(timezone))
        dueDate = datetime.strptime(dueDate, "%Y-%m-%d")
        dueDate = dueDate + timedelta(hours=23, minutes=59)
        midnight = tz.localize(dueDate, is_dst=None)
        midnight = midnight.astimezone(pytz.utc)
        log.debug('create_assignment midnight [%s]' %(midnight))

        courseWork['dueDate'] = {"year": dueDate.year, "month": dueDate.month, "day": dueDate.day}
        courseWork['dueTime'] = {"hours": midnight.hour,"minutes": midnight.minute,"seconds": 00, "nanos": 0}
        log.debug('create_assignment courseWork [%s]' %(courseWork))
    try:
        assignmentResponse = service.courses().courseWork().create(courseId=providerGroupID, body=courseWork,
                             fields=FIELDS['createAssignment']).execute()
    except Exception as e:
        log.error("create_assignment exception[%s]"%str(e))
        if type(e).__name__ == 'HttpError':
            raise Exception((_(u'%s'%(str(e)))).encode("utf-8"))
        raise e
    log.debug("create_assignment: assignmentResponse[%s]" % assignmentResponse)
    return assignmentResponse

def grade_studentSubmission_for_member(teacher_token, providerGroupID, providerAssignmentID, score, studentSubmissionID, refreshToken=None, tokenExpiry=None):
    #
    #  Set grade for the assignment in Google Classroom
    #
    service = _getGoogService(teacher_token, teacher_permissions=True, refreshToken=refreshToken, tokenExpiry=tokenExpiry)
    gradedResponse = None
    studentSubmission = {
            'assignedGrade': score,
            'draftGrade': score
    }
    try:
        gradedResponse = service.courses().courseWork().studentSubmissions().patch(
                courseId=providerGroupID,
                courseWorkId=providerAssignmentID,
                id=studentSubmissionID,
                updateMask='assignedGrade,draftGrade',
                body=studentSubmission).execute()
    except Exception as e:
        log.error("grade_studentSubmission_for_member exception[%s]"%str(e))
        if type(e).__name__ == 'HttpError':
            raise Exception((_(u'Google Classroom denied access for this course courseId[%s] courseWorkId[%s]'%(providerGroupID,providerAssignmentID))).encode("utf-8"))
        raise e

    log.debug("grade_studentSubmission_for_member: gradedResponse[%s]" % gradedResponse)
    return gradedResponse

def get_studentSubmissions_for_member(providerGroupID, providerAssignmentID):
    #
    #  Check assignment access for permission errors.
    #
    token = pylons_session.get('googleAuthToken')
    if not token:
        raise Exception((_(u'Not authenticated for Google Classroom')).encode("utf-8"))
    service = _getGoogService(token)
    studentSubmissions = None
    try:
        result = service.courses().courseWork().studentSubmissions().list(courseId=providerGroupID,
                 courseWorkId=providerAssignmentID,
                 userId="me",
                 fields=FIELDS['studentSubmissions']).execute()
        log.debug("get_studentSubmissions_for_member: student submissions result [%s]" %result)
        studentSubmissions = result.get('studentSubmissions', [])
        log.debug("get_studentSubmissions_for_member: student submissions result [%s]" %studentSubmissions)
        if studentSubmissions:
            studentSubmissions = studentSubmissions[0]
    except Exception as e:
        log.error("_get_studentSubmissions_for_member exception[%s]"%str(e))
        if type(e).__name__ == 'HttpError':
            raise Exception((_(u'Google Classroom denied access for this course courseId[%s] courseWorkId[%s]'%(providerGroupID,providerAssignmentID))).encode("utf-8"))
        raise e

    log.debug("get_studentSubmissions_for_member: student's submissions [%s]" %studentSubmissions)
    return studentSubmissions

def get_coursework(providerGroupID, providerAssignmentID):
    #
    #  Check assignment access for permission errors.
    #
    token = pylons_session.get('googleAuthToken')
    if not token:
        raise Exception((_(u'Not authenticated for Google Classroom')).encode("utf-8"))
    service = _getGoogService(token)
    coursework = None
    try:
        coursework = service.courses().courseWork().get(courseId=providerGroupID, id=providerAssignmentID,
                fields=FIELDS['coursework']).execute()
        log.debug("get_coursework: coursework  [%s]" %coursework)
    except Exception as e:
        log.error("get_coursework exception[%s]"%str(e))
        if type(e).__name__ == 'HttpError':
            raise Exception((_(u'Google Classroom denied access for this course courseId[%s] courseWorkId[%s]'%(providerGroupID,providerAssignmentID))).encode("utf-8"))
        raise e

    return coursework

