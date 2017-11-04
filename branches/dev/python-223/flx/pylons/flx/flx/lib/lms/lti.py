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
# This file originally written by Girish Vispute
#
# $Id: $

from flx.lib.lms.lms import LMSManager
from flx.model import api, exceptions as ex
from flx.controllers.errorCodes import ErrorCodes
from pylons.i18n.translation import _
from pylons import request, config, tmpl_context as c
from flx.model.audit_trail import AuditTrail
import json
import time
import datetime
import traceback
import re
#Initialing logger
import logging

log = logging.getLogger(__name__)

class LTIManager(LMSManager):
    '''
        LTI library class for LMS intergration with FBS.
    '''
    def __init__(self, appID, **kwargs):
        super(LTIManager, self).__init__(appID, **kwargs)
        
        #
        # get required information from LITinfo dict using launch_key
        #
        self.auditTrail = AuditTrail()
        launchKey = kwargs.get('launchKey', None)
        if not launchKey:
            launchKey = request.params.get("launch_key")
        log.debug("LTI Launch Key = [%s]" % launchKey)
        if launchKey:
            self.key = launchKey
            log.debug('__init__: self.key[%s]' % self.key)
            log.debug('__init__: request.cookies[%s]' % request.cookies)
            ltiInfo = None
            ltiInfoDict = request.cookies.get(self.key, None)
            if ltiInfoDict:
                try:
                    ltiInfo = json.loads(ltiInfoDict)
                except Exception:
                    pass
            if not ltiInfo:
                params = {'launch_key' : launchKey}
                launch_info_api = "%s/get/info/lti" % config.get('flx_auth_api_server')
                self.http.external = False
                self.http.fromReq = True
                status, data = self.http.call(launch_info_api, method='GET', params=params)
                log.debug("__init__: launch info api status[%s],  data[%s]" % (status, data))
                self.http.external = True
                self.http.fromReq = False
                ltiInfo = data
            log.debug('__init__: ltiInfo[%s]' % ltiInfo)
            if ltiInfo:
                # Only storing what is needed for grade passback in self.params
                # See new_requests in ims_lti_py/tool_provider.py
                self.params = {'lis_outcome_service_url': ltiInfo.get('lis_outcome_service_url'),
                               'lis_result_sourcedid': ltiInfo.get('lis_result_sourcedid')}
                self.secret = ltiInfo.get('consumerSecret')
                self.consumerKey = ltiInfo.get('oauth_consumer_key')
                self.providerMemberID = ltiInfo.get('user_id')
                self.contextID = ltiInfo.get('context_id')
                self.contextTitle = ltiInfo.get('context_title')
                self.ltiRoles = ltiInfo.get('roles', '').split(",")
    #The following three methods are from auth/lib/ims_lti_py/tool_provider.py
    def has_role(self, role):
        '''
        Check whether the Launch Paramters set the role.
        '''
        return self.ltiRoles and any([re.search(role, our_role, re.I)
                                   for our_role in self.ltiRoles])

    def is_student(self):
        '''
        Convenience method for checking if the user has 'learner' or 'student'
        role.
        '''
        return any((self.has_role('learner'),
                    self.has_role('student')))

    def is_instructor(self):
        '''
        Convenience method for checking if user has 'instructor', 'faculty'
        or 'staff' role.

        Currently this does not support the TeachingAssistant role
        '''
        return any((self.has_role('instructor'),
                    self.has_role('faculty'),
                    self.has_role('staff')))

    def createGroup(self, groupID, appID, member, returnIDOnly=True, providerMemberID=None, lmsGroupName=None):
        """
            Checks if ck-12 group exists, if not then create new create
            returns group info
        """
        lmsGroupID = groupID 
        if not lmsGroupID:
            raise ex.MissingArgumentException((_(u'Required parameter groupID is missing')).encode("utf-8"))
        #
        #  Check if the LMS group already exists.
        #
        lmsGroups = api._getLMSProviderGroups(self.session, appID=appID, providerGroupID=lmsGroupID)
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
        groupName = '%s|%s-%s' %(self.contextTitle, self.providerID, lmsGroupID)
        log.debug("LTI Create Group : Group Name : [%s] , memberID: [%s]" %(groupName, member.id))
        group = api._getGroupByNameAndCreator(self.session, groupName, member.id)
        log.debug("Group Info: [%s]" %group)
        if group:
            if returnIDOnly:
                return group.id
            else:
                return group
        #
        # Create Shadow group for LTI
        #
        groupDescription="ltiPractice Group for %s|%s" % (self.contextTitle, lmsGroupID)
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

            self.createLMSMemberAssociation(lmsGroupID, memberID=member.id, providerMemberID=providerMemberID)

        if returnIDOnly:
            return groupID

        return group

    def createLMSMemberAssociation(self, providerGroupID, providerMemberID=None, memberID=None):
        if not providerMemberID:
            providerMemberID = self.providerMemberID
        self.createLMSMemberGroupAssociation(providerGroupID, providerMemberID, memberID)

    def createLMSAssignment(self, **kwargs):
        t = str(time.time())
        contextID = kwargs.get('contextID')
        if not contextID:
            contextID = self.contextID
        log.debug('createLMSAssignment: contextID[%s]' % contextID)
        return str(kwargs.get('groupID')) + ':' + kwargs.get('contextID', contextID) + ':' + kwargs.get('eid') + ':' + t

    def createLMSAssignmentByAssignmentEID(self, member, assignmentEID, ck12groupID, contextID, appID):
        """ Create an assignment using assignmentEID through AssignmentController.
           Return the assignment or raise exception.
    
           member - Member object for assignment creator
           assignmentEID - EncodedID or artifactID can be used.
           ck12groupID - The ID of the group you are assigning to.
           contextID - The LMSprovider's groupID.
        """
        try:
            from flx.controllers.assignment import AssignmentController
            ac = AssignmentController()
            log.debug('createLMSAssignmentByAssignmentEID: assignmentEID [%s]'% assignmentEID)
            log.debug('createLMSAssignmentByAssignmentEID: ck12groupID [%s]'% ck12groupID)
            log.debug('createLMSAssignmentByAssignmentEID: contextID [%s]'%contextID)

            # Pass the ck-12 groupID and set providerGroupID=False
            # This will prevent the member from being added to the group as an admin
            assignment = ac.assignLMSAssignmentToGroupMembers(self.session, member, ck12groupID, appID, EIDs=assignmentEID, providerGroupID=False)
            log.debug('createLMSAssignmentByAssignmentEID: assignment [%s]'%assignment)
            return assignment
        except Exception, e:
            log.error('createLMSAssignmentByAssignmentEID: Exception creating assignment [%s]'% str(e))
            log.error('createLMSAssignmentByAssignmentEID: Exception traceback [%s]' %(traceback.format_exc()))
        raise e
            
    def createLMSAssignmentByAssignmentID(self, member, studyTrackID, contextID, artifactID, appID, ck12groupID=None, title=None, handle=None):
        """ Create an assignment using assignmentID through AssignmentController.
           Return the assignment or raise exception.

           member - Member object for assignment creator
           assignmentID - CK-12 study track ID.
           contextID - The lms provider group ID
           artifactID - Artifact ID of the assigned concept
        """
        try:
            from flx.controllers.assignment import AssignmentController
            ac = AssignmentController()
            assignment = ac.assignLMSAssignmentToGroupMembers(self.session, member, ck12groupID, appID, providerGroupID=False, assignmentID=studyTrackID)
            log.debug('createLMSAssignmentByAssignmentID: assignment [%s]'%assignment)
            return assignment
        except Exception, e:
            log.error('createLMSAssignmentByAssignmentID: Exception creating assignment [%s]'% str(e))
            log.error('createLMSAssignmentByAssignmentID: Exception traceback [%s]' %(traceback.format_exc()))

    def _lookupAssignmentByAssignmentEID(self, assignmentEID, groupID):
	""" Look up exsisting assignments by the assignmentEID.

	    Returns an array of assignments
	"""
        lmsAssignmentID = self.createLMSAssignment(title=None, due=None, groupID=groupID, contextID=self.contextID, eid=assignmentEID)
        log.debug('_lookupAssignmentByAssignmentEID: lmsAssignmentID[%s]' % lmsAssignmentID)
        assignments = api._getLMSProviderAssignments(self.session, providerAssignmentID=lmsAssignmentID, providerAssignmentIDLike=True)
	return (assignments, lmsAssignmentID)

    def _lookupAssignmentByAssignmentID(self, assignmentID, groupID, appID, member):
        """ Look up exsisting assignments by the assignmentID.
            Does some lookups using teh assignmentID to get the artifact
            that was used to create the assignment.

            Returns an array of assignments
        """
        try:
            artifact = api._getArtifactByID(self.session, assignmentID)
            assignment = None
            studyTrackID = None
            log.debug("_lookupAssignmentByAssignmentID: artifact [%s]" % artifact)
            if not artifact:
                raise ex.NotFoundException((_(u'Artifact of id %s does not exist.' % id)).encode("utf-8"))
            if artifact.type.name not in ['assignment', 'study-track']:
                raise ex.InvalidArgumentException((_(u'Invalid type: %s.' % artifact.type.name)).encode("utf-8"))
            if artifact.type.name == 'assignment':
                assignment = api._getAssignmentByID(self.session, id=artifact.id)
                log.debug("_lookupAssignmentByAssignmentID: assignment [%s]" % assignment)
                # Check to see if this assignment is assigned to this group
                if assignment and assignment.groupID != groupID:
                    log.error("Assignment id[%s] does not belong to this group id[%s]" % (assignment.assignmentID, assignment.groupID))
                    # raise ex.UnauthorizedException((_(u'Assignments can only be viewed by its members.')).encode("utf-8"))
                    # Get the study track for this assignment, to create a new assignemnt
                    children = artifact.getChildren()
                    if children and children[0].type.name == 'study-track':
                        studyTrackID = children[0].id
                    assignment = None
            else:
                studyTrackID = artifact.id
            return (assignment, artifact.id, artifact.name, studyTrackID)
        except Exception, e:
            log.error("_lookupAssignmentByAssignmentID: Exception [%s]" %str(e))
            raise e

    def createCourseCopyAssignment(self, member, contextID, groupID, appID, assignmentID=None, assignmentEID=None):
        """ Create a new assignment from existing assignment created in another LMS course.
            First try finding previous assignments. If we cannot find any assignments create new a one.

            Returns an assignment
        """
        # Get lms assignment
        assignments = None
        lmsAssignmentID = None
        artifactID = None
        if assignmentEID:
            assignments, lmsAssignmentID = self._lookupAssignmentByAssignmentEID(assignmentEID, groupID)
            if not assignments:
                log.error('createCourseCopyAssignment: No assignments found for assignmentEID [%s] for groupID [%s]' % (assignmentEID, groupID) )
                c.errorCode = ErrorCodes.CANNOT_CREATE_COURSE_COPY_ASSIGNMENT_FOR_EID
                return ErrorCodes().asDict(c.errorCode, "Could not create copy assignment for assignmentEID [%s] for groupID [%s]"%(assignmentEID, groupID))
            log.debug('createCourseCopyAssignment: results [%s]' %assignments)
        elif assignmentID:
            assignments, artifactID, title, studyTrackID = self._lookupAssignmentByAssignmentID(assignmentID, groupID, appID, member)
            if not assignments:
                assignments = [self.createLMSAssignmentByAssignmentID(member, studyTrackID, contextID, artifactID, appID, ck12groupID=groupID)]
                log.debug('createCourseCopyAssignment: created new assignment [%s]' % assignments)
        log.debug('createCourseCopyAssignment: assignments[%s]' % assignments)
        if not assignments:
            c.errorCode = ErrorCodes.CANNOT_CREATE_COURSE_COPY_ASSIGNMENT
            if not lmsAssignmentID:
                lmsAssignmentID = assignmentID
            return ErrorCodes().asDict(c.errorCode, "Assignment [%s] for group: [%s] contextID(%s) does not exist"%(lmsAssignmentID, groupID, contextID))
        assignment = None
        assignmentID = None
        if type(assignments).__name__ == 'list':
            if type(assignments[0]).__name__ == 'dict':
                assignmentID = assignments[0]['assignmentID']
            else:
                assignmentID = assignments[0].assignmentID
        else:
            if type(assignments).__name__ == 'dict':
                assignmentID = assignments['assignmentID']
            else:
                assignmentID = assignments.assignmentID
        log.debug('createCourseCopyAssignment: assignment[%s]' % assignment)
        assignment = api._getArtifactByID(self.session, id=assignmentID)
        log.debug('createCourseCopyAssignment: assignment artifact [%s]' % assignment)
        return assignment

    def update_assignment_score_for_member(self, groupMember, assignmentID, score, testScoreID=None, topicName=None):
        #
        #  First, get the LMS provider assignment's ID.
        #
        assignments = api._getLMSProviderAssignments(self.session, providerID=self.providerID, assignmentID=assignmentID)
        if not assignments:
            raise ex.NotFoundException((_(u'Assignment of id[%s] does not exist.' % assignmentID)).encode("utf-8"))
        assignment = assignments[0]
        assignmentScores = api._getLMSProviderAssignmentScores(self.session,
                                                                providerID=self.providerID,
                                                                providerGroupID=groupMember.providerGroupID,
                                                                providerMemberID=groupMember.providerMemberID,
                                                                providerAssignmentID=assignment.providerAssignmentID)
        if assignmentScores:
            assignmentScore = assignmentScores[0]
        else:
            #
            #  Create.
            #
            assignmentScore = api._createLMSProviderAssignmentScore(self.session,
                                                                    providerID=self.providerID,
                                                                    providerGroupID=groupMember.providerGroupID,
                                                                    providerMemberID=groupMember.providerMemberID,
                                                                    providerAssignmentID=assignment.providerAssignmentID)
            self.session.flush()
        assignmentScore.score = score
        assignmentScore.testScoreID = testScoreID
        assignmentScore.status = 'reported'
        self.session.add(assignmentScore)
        assignmentScore = assignmentScore.asDict()
        #
        #  Submit score to LTI partner.
        #
        from flx.lib.ims_lti_py import PylonsToolProvider                                                                                                                                                             
        toolProvider = PylonsToolProvider(self.consumerKey, self.secret, params=self.params)
        log.debug('update_assignment_score_for_member: posting score[%s]' % score)
        if type(score) != float:
            score = float(score)

        scoreUrl = request.params.get('lmsAppUrl', None)
        if scoreUrl:
            scoreUrl = { 'url': scoreUrl }

        # Audit Trail
        start_time = time.time()
        result = toolProvider.post_replace_result(score/100.0, result_data=scoreUrl)
        run_time = (time.time() - start_time)
        auditTrailDict = { 'auditType': 'lti_grade_passback',
                           'score': score,
                           'scoreUrl': scoreUrl,
                           'consumerKey': self.consumerKey,
                           'memberID': groupMember.memberID,
                           'assignmentID':assignment.assignmentID,
                           'providerID': groupMember.providerID,
                           'providerGroupID': groupMember.providerGroupID,
                           'providerMemberID': groupMember.providerMemberID,
                           'providerAssignmentID': assignment.providerAssignmentID,
                           'request_params' : json.dumps(self.params),
                           'responseStatus' : result.response_code,
                           'reportedSuccess': "true" if result.response_code == 200 else "false",
                           'executionTime': run_time,
                           'creationTime': datetime.datetime.utcnow()}
        try:
            self.auditTrail.insertTrail(collectionName='lmsRequests',data=auditTrailDict)
        except Exception, e:
            log.error("There was an issue logging the audit trail: %s"%e)

        if result and result.response_code:
            if result.response_code != 200:
                log.error("update_assignment_score_for_member: result [%s]" %result)
                raise ex.LTIGradePassbackFailureException((_(u'[%s]' % result.post_response)).encode("utf-8"))

        log.debug('update_assignment_score_for_member: posted score[%s]' % score)
        return assignmentScore
