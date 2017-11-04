#
# Copyright 2007-2017 CK-12 Foundation
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
# This file originally written by Felix Nance
#
# $Id: $

#import flx.controllers.user as u
from flx.controllers import decorators as d
#from flx.lib import helpers as h
from flx.lib.lms.lms import LMSManager
import flx.lib.lms.google_clasroom as classroom
#from flx.lib.remoteapi import RemoteAPI
from flx.model import api, exceptions as ex
from pylons import config, request, session as pylons_session
from pylons.i18n.translation import _
from flx.model.audit_trail import AuditTrail
#from flx.lib.lms.edmodo_connect import _getAccessToken as gatc
#import json
import logging
import traceback
import httplib2
from apiclient.discovery import build
from oauth2client.client import OAuth2WebServerFlow
from oauth2client.client import AccessTokenCredentials

CLIENT_ID = config.get('CLASSROOM_CLIENT_ID')
CLIENT_SECRET = config.get('CLASSROOM_CLIENT_SECRET')
OAUTH_SCOPE = config.get('CLASSROOM_OAUTH_SCOPE')
REDIRECT_URI = config.get('CLASSROOM_REDIRECT_URI')
#ADMIN_REDIRECT_URI = config.get('ADMIN_REDIRECT_URI')
REFRESH_REDIRECT_URI = config.get('REFRESH_REDIRECT_URI')
REFRESH_TOKEN_JSON_PATH = '/opt/2.0/flx/pylons/flx/refreshtoken.json'

#Initialing logger
log = logging.getLogger(__name__)
#integrationslog = logging.getLogger('integrationserrors')

class GoogleManager(LMSManager):
    '''
        Google class for Google classroom intergration with FBS.
    '''
    def __init__(self, appID, **kwargs):
        super(GoogleManager, self).__init__(appID, **kwargs)
        self.auditTrail = AuditTrail()

    @d.trace(log, ['member','groupID','lmsGroupName'])
    def createGroup(self, groupID, appID, member, returnIDOnly=True, providerMemberID=None, lmsGroupName=None):
        """
            Checks if ck-12 group exists, if not then create new create
            returns group info
        """
        lmsGroupID = groupID 
        log.debug("createGroup: lmsGroupName [%s]" %lmsGroupName)
        if not lmsGroupID:
            raise ex.MissingArgumentException((_(u'Required parameter groupID is missing')).encode("utf-8"))
        #
        #  Check if the LMS group already exists.
        #
        lmsGroups = api._getLMSProviderGroups(self.session, appID=self.appID, providerGroupID=lmsGroupID)
        if not lmsGroups:
            lmsGroup = None
	else:
            lmsGroup = lmsGroups[0]
            groupID = lmsGroup.groupID
            if groupID:
                #
                #  Shadow group already created.
                #
                isAdmin = False
                gmrs = api._getGroupMemberRoles(self.session, groupID, member.id)
                if gmrs:
                    for gmr in gmrs:
                        if gmr.roleID == 15:
                            isAdmin = True
                            break
                if not isAdmin:
                    #
                    #  Make this user the group admin.
                    #
                    d = {'memberID':member.id, 'groupID':groupID, 'roleID':15, 'statusID':2, 'disableNotification':0}
                    log.debug('createGroup: creating GroupHasMembers entry%s' % d)
                    api._createGroupHasMember(self.session, **d)
                    self.session.flush()

                if returnIDOnly:
                    return groupID

                group = api._getGroupByID(self.session, id=groupID)
                if group:
                    return group
        #
        #  Check if group already exists by name.
        #
        log.debug("createGroup: lmsGroupName [%s]" %lmsGroupName)
        if not lmsGroupName:
            lmsGroupName = "GoogleClassroom"
        log.debug("createGroup: lmsGroupName [%s]" %lmsGroupName)
        groupName = '%s|%s-%s' %(lmsGroupName, self.providerID, lmsGroupID)
        log.debug("Google Create Group : Group Name : [%s] , memberID: [%s]" %(groupName, member.id))
        group = api._getGroupByNameAndCreator(self.session, groupName, member.id)
        log.debug("Group Info: [%s]" %group)
        if group:
            if returnIDOnly:
                return group.id
            else:
                return group
        #
        # Create Shadow group for Google classroom
        #
        groupDescription="Shadow Google Classroom Group for %s|%s" % (lmsGroupName, lmsGroupID)
        log.debug('Create Group with name [%s]' % groupName)
        group = api._createGroup(self.session, groupName=groupName, groupDescription=groupDescription, groupScope='open',
                                 groupType='class', creator=member, origin='lms')
        if not group:
            groupID = None
        else:
            groupID = group.id
            if lmsGroup:
                lmsGroup.groupID = groupID
                api._update(self.session, lmsGroup)
            else:
                #
                # Add group entry to LMSProviderGroups
                #
                log.debug('Create LMS provider group entry')
                api._createLMSProviderGroup(self.session, appID=appID,
                                            providerGroupID=lmsGroupID,
                                            groupID=groupID,
                                            title=groupDescription)
            #self.createLMSMemberGroupAssociation(lmsGroupID, providerMemberID, memberID)
            self.createLMSMemberAssociation(lmsGroupID, memberID=member.id, providerMemberID=providerMemberID)

        if returnIDOnly:
            return groupID

        return group

    @d.trace(log, ['member'])
    def _getMyLMSGroups(self, member, **kwargs):
        """
            Returns lms groups for the member
        """
        pass

    def createLMSMemberAssociation(self, providerGroupID, providerMemberID=None, memberID=None):
        if not providerMemberID:
            token = pylons_session.get('googleAuthToken')
            if not token:
                raise Exception((_(u'Not authenticated for Google Classroom')).encode("utf-8"))
            service = classroom._getGoogService(token)
            user = service.userProfiles().get(userId='me').execute()
            providerMemberID = user.get('id')
            log.debug('createLMSMemberAssociation: providerMemberID %s'%providerMemberID)
            self.providerMemberID = providerMemberID
        self.createLMSMemberGroupAssociation(providerGroupID, providerMemberID, memberID)

    def createLMSAssignment(self, **kwargs):
        #
        #  Call LMS to create the assignment.
        #
        token = pylons_session.get('googleAuthToken')
        if not token:
            raise Exception((_(u'Not authenticated for Google Classroom')).encode("utf-8"))
        #import time
        #import datetime
        title = kwargs['title']
        description = kwargs['instructions']
        providerGroupID = kwargs['contextID']
        timezone = kwargs['timezone']
        due = kwargs['due']
        if not providerGroupID:
            raise ex.MissingArgumentException((_(u'Required parameter contextID is missing')).encode("utf-8"))
        assignmentID = kwargs['assignmentID']
        if not assignmentID:
            raise ex.MissingArgumentException((_(u'Required parameter assignmentID is missing')).encode("utf-8"))
        if not due:
            due = None
        assignmentUrl = "%s/%s" %(config.get("flx_prefix_url"),"auth/login/member/google?assignmentID=%s&contextID=%s&appName=googleClassroom" %(assignmentID, providerGroupID))

        courseWork = classroom.create_assignment(providerGroupID, title, description, assignmentUrl, dueDate=due, timezone=timezone)
        log.debug('createLMSAssignment: providerAssignmentID[%s]' % courseWork.get('id'))
        log.debug("createLMSAssignment:  assignment[%s]" % courseWork)
        status = None
        #start_time = None
        #start_time = time.time()
        #run_time = (time.time() - start_time)
        # Audit Trail - edmodo_create_assignment
        #auditTrailDict = { 'auditType': 'googleclassroom_create_assignment',
        #   'createAssignmentUrl': createAssignmentUrl,
        #   'assignmentUrl':assignmentUrl,
        #   'userToken': self.userToken,
        #   'accessToken': self.accessToken,
        #   'memberID': pylons_session.get('userID'),
        #   'groupID': kwargs['groupID'],
        #   'appID': request.params.get('appID', None),
        #   'providerGroupID': lmsGroupID,
        #   'providerAssignmentID': status.get('assignment_id', None),
        #   'request_params' : params,
        #   'responseStatus' : status,
        #   'executionTime': run_time,
        #   'creationTime': datetime.datetime.utcnow()}
        #try:
        #    self.auditTrail.insertTrail(collectionName='edmodoRequests', data=auditTrailDict)
        #except Exception, e:
        #    log.error("There was an issue logging the audit trail: %s"%e)
        lmsAssignmentID = courseWork.get('id')
        if not lmsAssignmentID:
            raise ex.ExternalException((_(u'Unable to create assignment for %s: %s' % (self.appID, status))).encode('utf8'))
        return courseWork, lmsAssignmentID

    def update_assignment_score_for_member(self, groupMember, assignmentID, score, testScoreID=None, topicName=None, groupCreator=None):
        #
        #  First, get the LMS provider assignment's ID.
        #  We only allow an asignment to be assigned to a single group
        #  at the time of assignment creation.
        #
        # Verify that the student has access to the course
        #
        invalidAssignment = False
        maxPoints = 100
        assignments = api._getLMSProviderAssignments(self.session, providerID=self.providerID, assignmentID=assignmentID)
        if not assignments or len(assignments) == 0:
            raise ex.NotFoundException((_(u'Assignment of id[%s] does not exist.' % assignmentID)).encode("utf-8"))
        assignment = assignments[0]
        coursework = classroom.get_coursework(groupMember.providerGroupID, assignment.providerAssignmentID)
        if not coursework:
            raise ex.NotFoundException((_(u'Google coursework with id[%s] was not found.' % assignment.providerAssignmentID)).encode("utf-8"))
        log.info('update_assignment_score_for_member: coursework [%s]' % coursework)
        maxPoints = coursework.get('maxPoints')
        log.info('update_assignment_score_for_member: maxPoints [%s]' % maxPoints)

        studentSubmissions = classroom.get_studentSubmissions_for_member(groupMember.providerGroupID, assignment.providerAssignmentID)
        log.info('update_assignment_score_for_member: studentSubmissions [%s]' % studentSubmissions)

        assignmentScores = api._getLMSProviderAssignmentScores(self.session,
                                                               providerID=self.providerID,
                                                               providerGroupID=groupMember.providerGroupID,
                                                               providerMemberID=groupMember.providerMemberID,
                                                               providerAssignmentID=assignment.providerAssignmentID)
        if assignmentScores:
            assignmentScore = assignmentScores[0]
            #
            # Check to see if assignment has already been turned in.
            # if true, then we need to do a patch to the courseWork
            #firstTime = False
            firstTime = True
        else:
            #
            #  Create.
            #
            assignmentScore = api._createLMSProviderAssignmentScore(self.session,
                                                                    providerID=self.providerID,
                                                                    providerGroupID=groupMember.providerGroupID,
                                                                    providerMemberID=groupMember.providerMemberID,
                                                                    providerAssignmentID=assignment.providerAssignmentID)
            firstTime = True
        # If the student submission's sate is TURNED_IN
        # set firstTime to False
        # https://developers.google.com/classroom/reference/rest/v1/courses.courseWork.studentSubmissions
        #if studentSubmissions and 'state' in studentSubmissions:
        #    if studentSubmissions['state'] == 'TURNED_IN':
        #        firstTime = False
        assignmentScore.score = score
        assignmentScore.testScoreID = testScoreID
        assignmentScore.status = 'reported'
        self.session.add(assignmentScore)

        if assignment:
            if firstTime:
                #
                #  Turn in the assignment.
                #  https://developers.google.com/classroom/reference/rest/v1/courses.courseWork.studentSubmissions/turnIn
                #
                import time

                scoreUrl = request.params.get('lmsAppUrl', None)
                if scoreUrl:
                    assesmentReportUrl = "%s/assessment/ui/views/test.detail.new.html"%config.get('flx_prefix_url')
                    scoreUrl = scoreUrl.replace("app://", assesmentReportUrl)

                log.info('update_assignment_score_for_member: scoreUrl[%s]' % scoreUrl)
                try:
                    status = None
                    start_time = time.time()
                    # Turn in assignment
                    turnedInAssignment = classroom.turnin_assignment_for_member(groupMember.providerGroupID, assignment.providerAssignmentID, studentSubmissions['id'], reportURL=scoreUrl)
                    log.debug('update_assignment_score_for_member: turnedInAssignment[%s]' % turnedInAssignment)
                    run_time = (time.time() - start_time)
                    log.debug('update_assignment_score_for_member: status[%s]' % status)
                    #s = status.get('status')
                    # Audit Trail - googleclassroom_turnin
                    #auditTrailDict = { 'auditType': 'googleclassroom_turnin',
                    #       'turnInAssignmentUrl':turnInAssignmentUrl,
                    #       'userToken': self.userToken,
                    #       'accessToken': self.accessToken,
                    #       'memberID': groupMember.memberID,
                    #       'assignmentID':assignment.assignmentID,
                    #       'providerID': self.providerID,
                    #       'providerGroupID': groupMember.providerGroupID,
                    #       'providerAssignmentID': assignmentScore.providerAssignmentID,
                    #       'request_params' : params,
                    #       'responseStatus' : status,
                    #       'turninSuccess': "true" if s == 201 else "false",
                    #       'executionTime': run_time,
                    #       'creationTime': datetime.datetime.utcnow()}
                    #try:
                    #   self.auditTrail.insertTrail(collectionName='edmodoRequests', data=auditTrailDict)
                    #except Exception, e:
                    #   log.error("There was an issue logging the audit trail: %s"%e)
                    if turnedInAssignment != 'success':
                            raise ex.ExternalException((_(u'Cannot turn in assignment[%s];' % turnedInAssignment)).encode('utf8'))
                except Exception, e:
                    log.info('_updateLMSPartner: Cannot turn in assignment, exception[%s].' % traceback.format_exc())
                    raise e
            #
            #  Set grade
            #  https://developers.google.com/classroom/reference/rest/v1/courses.courseWork.studentSubmissions/patch
            #
            if not invalidAssignment:
                try:
                    from flx.model.mongo.oauth2accesstoken import Oauth2AcessToken
                    creator_access_token = Oauth2AcessToken().getAccessTokenByMemberID(groupCreator)
                    log.debug('update_assignment_score_for_member: creator_access_token[%s]' % creator_access_token)
                    if not creator_access_token or "refreshToken" not in creator_access_token:
                        # The teacher has not created an entry
                        log.error('update_assignment_score_for_member: Could not find assignment creator token: [%s]'%(creator_access_token))
                        raise ex.TeacherAccessTokenNotFoundException((_(u'Could not find assignment creator token.')).encode('utf8'))
                    if maxPoints:
                        score = (score * int(maxPoints))/100
                    gradedResponse = classroom.grade_studentSubmission_for_member(creator_access_token['accessToken'],
                                                                                  groupMember.providerGroupID,
                                                                                  assignment.providerAssignmentID,
                                                                                  score,
                                                                                  studentSubmissions['id'],
                                                                                  refreshToken=creator_access_token['refreshToken'],
                                                                                  tokenExpiry=creator_access_token['expires'])
                    log.debug('update_assignment_score_for_member: gradedResponse[%s]' % gradedResponse)
                    # Check to see if the token is expired
                    #import pytz
                    #import dateutil.parser
                    #tokenExpired = dateutil.parser.parse(creator_access_token['expires']) < pytz.utc.localize(datetime.datetime.utcnow())
                    # Token is expired and we need to refresh it
                    #if tokenExpired:
                        #    #TODO: Add token url to development.ini and let Ops know about new setting
                        #new_token = h.refreshAccessToken('https://api.edmodo.com/oauth/token',
                        #                                 config.get('edmodo_client_id'),
                        #                                 config.get('edmodo_client_secret'),
                        #                                 config.get('edmodo_redirect_uri'),
                        #                                 creator_access_token['refreshToken'],
                        #                                 grant_type="refresh_token")
                        #if not new_token or "access_token" not in new_token:
                        #  log.error('update_assignment_score_for_member: Could not refresh expired teacher access token: [%s]'%(new_token))
                        #  raise ex.TeacherAccessTokenNotFoundException((_(u'Could not refresh expired teacher access token.')).encode('utf8'))
                        #log.debug("update_assignment_score_for_member: Old teacher token [%s] New teacher token [%s]" %(creator_access_token['refreshToken'], new_token['access_token']))
                        #creator_access_token['refreshToken'] = new_token['access_token']

                    #run_time = (time.time() - start_time)
                    s = str(gradedResponse['assignedGrade']) if ('assignedGrade' in gradedResponse) else None
                    # Audit Trail - edmodo_setgrade
                    #auditTrailDict = { 'auditType': 'edmodo_setgrade',
                    #	   'setGradeUrl':setGradeUrl,
                    #	   'userToken': self.userToken,
                    #	   'accessToken': self.accessToken,
                    #	   'memberID': groupMember.memberID,
                    #	   'assignmentID':assignment.assignmentID,
                    #   'providerID': self.providerID,
                    #	   'score': score,
                    #	   'providerGroupID': groupMember.providerGroupID,
                    #	   'providerAssignmentID': assignmentScore.providerAssignmentID,
                    #	   'request_params' : json.dumps(params),
                    #	   'responseStatus' : json.dumps(gradedResponse),
                    #	   'turninSuccess': "false" if s!= str(score)  else "true",
                    #	   'executionTime': run_time,
                    #	   'creationTime': datetime.datetime.utcnow()}
                    #try:
                    #self.auditTrail.insertTrail(collectionName='edmodoRequests', data=auditTrailDict)
                    #except Exception, e:
                    # log.error("There was an issue logging the audit trail: %s"%e)
                    if s != str(score):
                        raise ex.ExternalException((_(u'Cannot set grade[%s];' % gradedResponse)).encode('utf8'))
                except Exception, e:
                        log.error('update_assignment_score_for_member: Cannot set grade, exception[%s].' % traceback.format_exc())
                        if type(e).__name__ == 'TeacherAccessTokenNotFoundException':
                            raise e
                        raise Exception((_(u'Cannot set grade[%s]' %e)).encode('utf8'))

        log.debug('update_assignment_score_for_member: assignmentScore[%s]' % assignmentScore)
        return assignmentScore.asDict()
