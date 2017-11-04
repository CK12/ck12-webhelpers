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

import flx.controllers.user as u
from flx.controllers import decorators as d
from flx.lib import helpers as h
from flx.lib.lms.lms import LMSManager
from flx.lib.remoteapi import RemoteAPI
from flx.model import api, exceptions as ex
from pylons import config, request, session as pylons_session
from pylons.i18n.translation import _
from Crypto.Cipher import Blowfish
from flx.model.audit_trail import AuditTrail
from flx.lib.lms.edmodo_connect import EdmodoConnect as edmodoconnect
from flx.lib.lms.edmodo_connect import _getAccessToken as gatc
import json
import logging
import traceback

#Initialing logger
log = logging.getLogger(__name__)
#integrationslog = logging.getLogger('integrationserrors')

class EdmodoManager(LMSManager):
    '''
        Edmodo library class for edmodo intergration with FBS.
    '''
    def __init__(self, appID, **kwargs):
        super(EdmodoManager, self).__init__(appID, **kwargs)
        self.auditTrail = AuditTrail()

    @d.trace(log, ['member'])
    def _getMyLMSGroups(self, member, **kwargs):
        """
            Returns lms groups for the member
        """
        log.debug("_getMyLMSGroups: kwargs [%s]"%kwargs)
        self._validateLMSRequest()
        #
        #  Get group information from the LMS for this user.
        #
        lgs = []
        #check to see if we need to use the new Edmodo Connect API
        authType = pylons_session.get('authType', None)
        if authType == "edmodoconnect":
            access_token = gatc()
            edmodoconn = edmodoconnect(access_token=access_token)
            groups = edmodoconn.getUserEdmodoGroups()
            log.debug("_getMyLMSGroups: (edmodo connect) lgs[%s]" % groups)
            lgs = json.loads(groups)
        else:
	    getGroupsUrl = '%s%s?api_key=%s&access_token=%s&user_token=%s' % (self.policyDict['url'], self.policyDict['getUserGroups'], self.policyDict['api_key'], self.accessToken, self.userToken)
	    log.debug('_getMyLMSGroups: getGroupsUrl[%s]' % getGroupsUrl)
	    lgs = self.http.call(getGroupsUrl, method='GET')
        log.debug('_getMyLMSGroups: lgs[%s]' % lgs)
        lgDict = {}
        for lg in lgs:
	    # Make sure group_id key is in dict. In the case of edmodo connect we add it here.
            if 'group_id' not in lg:
		lg['group_id'] = lg['id']
            lmsGroupID = lg['group_id']
            lgDict[str(lmsGroupID)] = lg
            #
            #  Associate the  missing groups, if any, with this user.
            #
            lmsGroupMembers = api._getLMSProviderGroupMembers(self.session,
                                                              providerID=self.providerID,
                                                              providerGroupID=lmsGroupID,
                                                              providerMemberID=self.userToken)
            if not lmsGroupMembers:
                #
                #  Since students do not call the install API, perform the LMS setup here.
                #
                self._setupLMSInfo(self.session, self.providerID, self.appID, self.policyDict, self.userToken, self.accessToken, lgs=[lg])
                self.session.flush()
        log.debug('_getMyLMSGroups: lgDict[%s]' % lgDict)
        #
        #  See if the LMS and CK-12 groups have already been associated.
        #
        lmsGroupMembers = api._getLMSProviderGroupMembers(self.session, providerID=self.providerID, providerMemberID=self.userToken)
        log.debug('_getMyLMSGroups: lmsGroupMembers[%s]' % lmsGroupMembers)

        groupIDs = []
        for lmsGroupMember in lmsGroupMembers:
            lg = lgDict.get(lmsGroupMember.providerGroupID, None)
            log.debug('_getMyLMSGroups: lg[%s]' % lg)
            if not lg:
                #
                #  The group is not for this app.
                #
                continue

            lmsGroupID = lg['group_id']
            lmsGroups = api._getLMSProviderGroups(self.session, appID=self.appID, providerGroupID=lmsGroupID)
            # NOTE: Since there is no longer installs happening in Edmodo for app, we will create the group association
            #       if missing for the given appID.
            if not lmsGroups:
                #
                #  The group is not for this app.
                #
		self._setupLMSInfo(self.session, self.providerID, self.appID, self.policyDict, self.userToken, self.accessToken, lgs=[lg])
                self.session.flush()
                lmsGroups = api._getLMSProviderGroups(self.session, appID=self.appID, providerGroupID=lmsGroupID)
                if not lmsGroups:
                    log.error('_getMyLMSGroups: could not find any lms groups for appID[%s] and providerGroupID[%s]'% (self.appID, lmsGroupID))
                    continue

            lmsGroup = lmsGroups[0]
            log.debug('_getMyLMSGroups: lmsGroup[%s]' % lmsGroup)
            lmsOwners = lg['owners']
            isOwner = False
            for lmsOwner in lmsOwners:
                if type(lmsOwner).__name__ == 'dict':
                    lmsOwner = str(lmsOwner['id'])
                if str(self.userToken) == lmsOwner:
                    isOwner = True
                elif str(pylons_session.get('externalID')) == str(lmsOwner):
                    isOwner = True 
                    break
            log.debug('_getMyLMSGroups: isOwner[%s]' % isOwner)
            groupName = '%s: %s %s' % (self.appID, lmsGroup.providerGroupID, lmsGroup.title)
            log.debug('_getMyLMSGroups: groupName[%s]' % groupName)
            if not lmsGroup.groupID:
                group = None
            else:
                group = api._getGroupByID(self.session, id=lmsGroup.groupID, onlyActive=False)

            log.debug('_getMyLMSGroups:  group returned [%s]' % group)
            if not group:
                if not isOwner:
                    #
                    #  Teacher may have created the group but not yet launch.
                    #  Just skip and let caller handle.
                    #
                    continue
                #
                #  Create the association.
                #
                log.debug('_getMyLMSGroups: attempting to associate a new group %s' % (groupName))
                group = api._createGroup(self.session, groupName=groupName, creator=member, groupType='class', origin='lms')
                lmsGroup.groupID = group.id
                self.session.add(lmsGroup)
                self.session.flush()
                log.debug('_getMyLMSGroups: associated new group[%s] to lmsGroup[%s]' % (group, lmsGroup))

	    # For LMS groups when set isActive flag to false. We need to enable
	    # the group to use again.
	    if group.isActive == 0:
	        group = api._updateGroup(self.session, group=group, newGroupName=group.name, newGroupDesc=group.description, isActive=1)
	        log.debug('_getMyLMSGroups: updated group is: %s' % group)
	        self.session.flush()
            groupIDs.append(group.id)

            if not api._isGroupMember(self.session, groupID=group.id, memberID=member.id):
                groupMember = api._addMemberToGroup(self.session, group=group, memberID=member.id, isAdmin=isOwner)
                log.debug('_getMyLMSGroups: create groupMember[%s]' % groupMember)

            if not lmsGroupMember.memberID:
                lmsGroupMember.memberID = member.id
                self.session.add(lmsGroupMember)
                log.debug('_getMyLMSGroups: associated lmsGroupMember[%s]' % lmsGroupMember)
                self.session.flush()
        return groupIDs

    def _setupLMSInfo(self, session, providerID, appID, policyDict, userToken, accessToken, lmsGroupIDs=None, lgs=None):
        authType = pylons_session.get('authType', None)
        if not lgs:
            if not lmsGroupIDs:
                getGroupsUrl = '%s%s?api_key=%s&access_token=%s&user_token=%s' % (policyDict['url'], policyDict['getUserGroups'], policyDict['api_key'], accessToken, userToken)
            else:
                getGroupsUrl = '%s%s?api_key=%s&access_token=%s&group_ids=%s' % (policyDict['url'], policyDict['getGroups'], policyDict['api_key'], accessToken, lmsGroupIDs)
            if authType == 'edmodoconnect':
                access_token = gatc()
                edmodoconn = edmodoconnect(access_token=access_token)
                groups = edmodoconn.getUserEdmodoGroups()
                log.debug("_setupLMSInfo: (edmodo connect) lgs[%s]" % groups)
                lgs = json.loads(groups)
            else:
                log.debug('_setupLMSInfo: getGroupsUrl[%s]' % getGroupsUrl)
                lgs = self.http.call(getGroupsUrl, method='GET')
        log.debug('_setupLMSInfo: lgs%s' % lgs)
        lmsGroupIDList = []
        for lg in lgs:
	    # Make sure group_id key is in dict. In the case of edmodo connect we add it here.
	    if 'group_id' not in lg:
		lg['group_id'] = lg['id']
            lmsGroupID = lg['group_id']
            lmsGroupIDList.append(lmsGroupID)
            lmsGroupTitle = lg['title']
            lmsOwners = lg['owners']
            log.debug('_setupLMSInfo: lmsOwners%s' % lmsOwners)
            isOwner = False
            for lmsOwner in lmsOwners:
                if type(lmsOwner).__name__ == 'dict':
                    lmsOwner = str(lmsOwner['id'])
                if str(userToken) == lmsOwner:
                    isOwner = True
                elif str(pylons_session.get('externalID')) == lmsOwner:
                    isOwner = True
            groupName = '%s: %s %s' % (self.appID, lmsGroupID, lmsGroupTitle)
            log.debug('_setupLMSInfo: groupName[%s]' % groupName)
            lmsGroups = api._getLMSProviderGroups(session, appID=self.appID, providerGroupID=lmsGroupID)
            log.debug('_setupLMSInfo: lmsGroups%s' % lmsGroups)
            if not isOwner:
                if not lmsGroups:
                    #
                    #  The owner has not created this group yet.
                    #
                    continue
            else:
                if not lmsGroups:
                    api._createLMSProviderGroup(session,
                                                appID=self.appID,
                                                providerGroupID=lmsGroupID,
                                                title=lmsGroupTitle)
                else:
                    lmsGroup = lmsGroups[0]
                    if lmsGroup.title != lmsGroupTitle:
                        from datetime import datetime as dt

                        lmsGroup.title = lmsGroupTitle
                        lmsGroup.updateTime = dt.now()
                        session.add(lmsGroup)

            session.flush()
            lmsGroupMembers = api._getLMSProviderGroupMembers(session,
                                                              providerID=providerID,
                                                              providerGroupID=lmsGroupID,
                                                              providerMemberID=userToken)
            log.debug('_setupLMSInfo: lmsGroupMembers[%s]' % lmsGroupMembers)
            if not lmsGroupMembers:
                lmsGroupMember = api._createLMSProviderGroupMember(session,
                                                                   providerID=providerID,
                                                                   providerGroupID=lmsGroupID,
                                                                   providerMemberID=userToken)
                log.debug('_setupLMSInfo: created lmsGroupMember[%s]' % lmsGroupMember)
        try:
            params = {
                'clientID': '24839961',
                'eventType': 'FBS_LMS_INSTALL',
                'payload': '{"lmsProvider": "edmodo","appName": "%s","lmsGroupIDList": %s,"userToken": "%s", "appID": "%s"}' %(self.appName, lmsGroupIDList, userToken, self.appID)
            }
            RemoteAPI._makeCall(config.get('ads_url_prefix'), 'record/event', 100, params_dict=params, raw_response=True, failIfNonZero=False)
        except:
            log.error('Unable to trigger FBS_LMS_INSTALL event: [%s]' %(traceback.format_exc()))

    def createLMSAssignment(self, **kwargs):
        #
        #  Call LMS to create the assignment.
        #
	import time
	import datetime
        self._validateLMSRequest()
        authType = pylons_session.get('authType', None)
        title = kwargs['title']
        assignmentID = kwargs.get('assignmentID', None)
        createAssignmentUrl = '%s%s?api_key=%s&access_token=%s&user_token=%s' % (self.policyDict['url'], self.policyDict['createAssignment'], self.policyDict['api_key'], self.accessToken, self.userToken)
        log.debug('createLMSAssignment: createAssignmentUrl[%s]' % createAssignmentUrl)
        lmsGroupID = request.params.get('lmsGroupID', None)
        if not lmsGroupID:
            raise ex.MissingArgumentException((_(u'Required parameter lmsGroupID is missing')).encode("utf-8"))
        assignmentUrl = request.params.get('assignmentUrl', None)
        if not assignmentUrl:
            raise ex.MissingArgumentException((_(u'Required parameter assignmentUrl is missing')).encode("utf-8"))
        # We need to add the assignmentID for the front-end.
        # This will be used to retrieve the collection info.
        # Bug #57077
        if assignmentID:
            assignmentUrl = "%s&assignmentID=%s" % (assignmentUrl, assignmentID)
        params = {
            'title': title,
            'description': title,
            'due_date': kwargs['due'],
            'recipients': json.dumps([{
                'group_id': lmsGroupID,
            }]),
            'attachments': json.dumps([{
                'type': 'link',
                'title': title,
                'url': assignmentUrl,
            }]),
        }
        log.debug('createLMSAssignment: params%s' % params)
        start_time = None
        status = None
        if authType== "edmodoconnect":
            access_token = gatc()
            recipients = {'groups':[{'id':lmsGroupID}]}
            authLaunchUrl = "%s/%s" %(config.get("flx_prefix_url"),"auth/login/member/edmodo?appName=%s&" %self.appName)
            assignmentUrl = assignmentUrl.replace("app://?", authLaunchUrl)
            attachment = {'links':[{'title': title, 'url': assignmentUrl, "thumb_url":"https://apps.edim.co/36712191142913739611633.png"}]}
            if self.appName == "EdmPracticeScience":
                attachment['thumb_url'] = "https://apps.edim.co/36712191142248773210613.png"
            edmodoconn = edmodoconnect(access_token=access_token)
            start_time = time.time()
            status = edmodoconn.createAssignment(title, params['due_date'], recipients, title, attachment)
            status = json.loads(status)
            log.debug("createLMSAssignment: (edmodo connect) assignment[%s]" % status)
        else:
            start_time = time.time()
            status = self.http.call(createAssignmentUrl, method='POST', params=params, usePostBody=False)
        run_time = (time.time() - start_time)
        s = status.get('status')
        # Audit Trail - edmodo_create_assignment
        auditTrailDict = { 'auditType': 'edmodo_create_assignment',
           'createAssignmentUrl': createAssignmentUrl,
           'assignmentUrl':assignmentUrl,
           'userToken': self.userToken,
           'accessToken': self.accessToken,
           'memberID': pylons_session.get('userID'),
           'groupID': kwargs['groupID'],
           'appID': request.params.get('appID', None),
           'providerGroupID': lmsGroupID,
           'providerAssignmentID': status.get('assignment_id', None),
           'request_params' : params,
           'responseStatus' : status,
           'executionTime': run_time,
           'creationTime': datetime.datetime.utcnow()}
        try:
            self.auditTrail.insertTrail(collectionName='edmodoRequests', data=auditTrailDict)
        except Exception, e:
            log.error("There was an issue logging the audit trail: %s"%e)
        log.debug('createLMSAssignment: status[%s]' % status)
        lmsAssignmentID = status.get('assignment_id', None)
        if not lmsAssignmentID:
            raise ex.ExternalException((_(u'Unable to create assignment for %s: %s' % (self.appID, status))).encode('utf8'))
        return lmsAssignmentID

    def update_assignment_score_for_member(self, groupMember, assignmentID, score, testScoreID=None, topicName=None, groupCreator=None):
        #
        #  First, get the LMS provider assignment's ID.
        #
	from flx.lib.lms.edmodo_connect import _getAccessToken as gatc

        invalidAssignment = False
        authType = pylons_session.get('authType', None)
        assignments = api._getLMSProviderAssignments(self.session, providerID=self.providerID, assignmentID=assignmentID)
        if not assignments or len(assignments) == 0:
            raise ex.NotFoundException((_(u'Assignment of id[%s] does not exist.' % assignmentID)).encode("utf-8"))
        if len(assignments) == 1:
            assignment = assignments[0]
        else:
            log.debug('_updateConceptNodeStatus: assignments[%s]' % assignments)
            #
            #  Find the correct assignment.
            #
            asgns = None
	    if authType== "edmodoconnect":
                access_token = gatc()
		edmodoconn = edmodoconnect(access_token=access_token)
		status = edmodoconn.getAssignments(group_ids=None)
		asgns = json.loads(status)
		log.debug("_updateConceptNodeStatus: (edmodo connect) get assignments[%s]" % asgns)
	    else:
		getAssignmentsUrl = '%sassignmentsByAppForUser?api_key=%s&access_token=%s&user_token=%s' % (self.policyDict['url'], self.policyDict['api_key'], self.accessToken, self.userToken)
		log.debug('_updateConceptNodeStatus: getAssignmentsByAppForUserUrl[%s]' % getAssignmentsUrl)
		asgns = self.http.call(getAssignmentsUrl, method='GET')
		log.debug('_updateConceptNodeStatus: asgns[%s]' % asgns)
            found = False
            for asgn in asgns:
                recipients = asgn.get('recipients')
                posted_in = None
                if not recipients:
                    posted_in_type = asgn.get('posted_in', None)
                    if posted_in_type and str(posted_in_type) == 'group':
                        posted_in = asgn.get('posted_in_id')
                        log.debug("providerGroupID from posted_in: %s" %posted_in)

                 
                if type(asgn) == dict:
                    asgnID = str(asgn.get('assignment_id'))
                else:
                    asgnID = str(asgn.assignment_id)

                # For this assignment see if the groupID matches our providerGroupID
                # If the group matches, check the list of assignments to see if the ID matches what we are looking for.
                if posted_in:
                    if str(groupMember.providerGroupID) == str(posted_in):
                        for assignment in assignments:
                            if str(assignment.providerAssignmentID) == asgnID:
                                found = True
                                break
		        if found:
			    break
 
                for d in recipients:
                    gp = d.get('groupd_id', None)
                    if gp and str(groupMember.providerGroupID) == str(gp):
                        #
                        #  Group matches, find the matching assignment.
                        #
                        for assignment in assignments:
                            if str(assignment.providerAssignmentID) == asgnID:
                                found = True
                                break
                        if found:
                            break
                if found:
                    break
            if not found:
                raise ex.NotFoundException((_(u'Assignment of id[%s] has no match from partner.' % assignmentID)).encode("utf-8"))

        assignmentScores = api._getLMSProviderAssignmentScores(self.session,
                                                               providerID=self.providerID,
                                                               providerGroupID=groupMember.providerGroupID,
                                                               providerMemberID=groupMember.providerMemberID,
                                                               providerAssignmentID=assignment.providerAssignmentID)
        if assignmentScores:
            assignmentScore = assignmentScores[0]
            #
            #  Because of bug 34164, some assignments may have the
            #  LMSProviderAssignmentScore entries but have not yet
            #  turned in to Edmodo. We will need to call the API
            #  to turn them in every time for now.
            #
            #  To be turned off in a few months.
            #
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
        assignmentScore.score = score
        assignmentScore.testScoreID = testScoreID
        assignmentScore.status = 'reported'
        self.session.add(assignmentScore)

        if assignment:
            if firstTime:
                #
                #  Turn in the assignment.
                #
                import re
                import time
                import datetime

                turnInAssignmentUrl = '%s%s?api_key=%s&access_token=%s&user_token=%s' % (self.policyDict['url'], self.policyDict['turnInAssignment'], self.policyDict['api_key'], self.accessToken, self.userToken)
                log.debug('update_assignment_score_for_member: turnInAssignmentUrl[%s]' % turnInAssignmentUrl)
                scoreUrl = request.params.get('lmsAppUrl', None)
                m = re.search('(.+)-.\d+:\w+', topicName)
                title = m.group(1) if m else topicName
                submitTime = datetime.datetime.strftime(datetime.datetime.now(), '%m/%d/%Y @ %I:%M %p')
                params = {
                    'assignment_id': assignmentScore.providerAssignmentID,
                    'content': 'Assignment Submission Time: %s \n Assignment Submission Score: %s/100 \n via CK-12'%(submitTime, score),
                    'attachments': json.dumps([{
                        'type': 'link',
                        'title': title,
                        'url': scoreUrl,
                    }]),
                }
                log.info('update_assignment_score_for_member: params[%s]' % params)
                try:
                    status = None
                    if authType== "edmodoconnect":
			access_token = gatc()
			edmodoconn = edmodoconnect(access_token=access_token)
			attachment = json.loads(params['attachments'])
			log.debug("update_assignment_score_for_member: (edmodo connect) attachment[%s]" % str(attachment))
			start_time = time.time()
			status = edmodoconn.turninAssignment(params['assignment_id'], params['content'], attachment)
			log.debug("update_assignment_score_for_member: (edmodo connect) response status[%s]" % status)
			status = json.loads(status)
			log.debug("update_assignment_score_for_member: (edmodo connect) turn in assignment[%s]" % status)
		    else:
			start_time = time.time()
			status = self.http.call(turnInAssignmentUrl, method='POST', params=params, usePostBody=False)
                    if not status:
                        log.debug('update_assignment_score_for_member: Edmodo turnIn API 500 status')
                        raise ex.EdmodoAPIFailureException((_(u'Edmodo turnIn API 500 status')).encode('utf8'))
                    run_time = (time.time() - start_time)
                    log.debug('update_assignment_score_for_member: status[%s]' % status)
                    s = status.get('status')
                    # Audit Trail - edmodo_turnin
                    auditTrailDict = { 'auditType': 'edmodo_turnin',
                           'turnInAssignmentUrl':turnInAssignmentUrl,
                           'userToken': self.userToken,
                           'accessToken': self.accessToken,
                           'memberID': groupMember.memberID,
                           'assignmentID':assignment.assignmentID,
                           'providerID': self.providerID,
                           'providerGroupID': groupMember.providerGroupID,
                           'providerAssignmentID': assignmentScore.providerAssignmentID,
                           'request_params' : params,
                           'responseStatus' : status,
                           'turninSuccess': "true" if s == 201 else "false",
                           'executionTime': run_time,
                           'creationTime': datetime.datetime.utcnow()}
                    try:
                       self.auditTrail.insertTrail(collectionName='edmodoRequests', data=auditTrailDict)
                    except Exception, e:
                       log.error("There was an issue logging the audit trail: %s"%e)
                    if s != 'success' and s != 201:
                        #
                        #  Skip already turned in error.
                        #
                        #  If error does not have code, get status_code from the repsonse
                        status_code = status.get('status_code') if 'status_code' in status else s
                        # For 404 status, it means the assignment has been deleted on Edmodo.
                        # We need to flag LMSProviderAssignment as invalid bug 43471.
                        # Set invalidAssignment flag to true and skip set grade
                        if int(status_code) in [404]:
                            log.debug('_updateConceptNodeStatus: Need to update assignment and mark as invalid status_code[%s] providerAssignmentID[%s]' % (status_code, assignmentScore.providerAssignmentID))
			    removedLMSProviderAssignment = api._updateLMSProviderAssignmentStatus(self.session,
			                                                                           status=0,
			                                                                           providerAssignmentID=assignmentScore.providerAssignmentID)
                            
                            log.debug('_updateConceptNodeStatus: removedLMSProviderAssignment[%s]' % (removedLMSProviderAssignment))
			    invalidAssignment = True
                        error = status.get('error', None)
                        if not error:
                            raise ex.ExternalException((_(u'Cannot turn in assignment[%s];' % status)).encode('utf8'))
                        code = error.get('code') if type(error).__name_ !='unicode' else status_code
                        log.debug('_updateConceptNodeStatus: code[%d]' % code)
                        if code != 9000 and not invalidAssignment:
                            raise ex.ExternalException((_(u'Cannot turn in assignment[%s];' % status)).encode('utf8'))
                except Exception, e:
                    log.info('_updateLMSPartner: Cannot turn in assignment, exception[%s].' % traceback.format_exc())
                    #integrationslog.error('_updateLMSPartner: Cannot turn in assignment, exception[%s].' % traceback.format_exc())
                    if type(e).__name__ == 'EdmodoAPIFailureException':
                        raise e
            #
            #  Set grade, only if the assignment is still valid i.e not deleted on Edmodo.
            #
            if not invalidAssignment:
                try:
		    setGradeUrl = '%s%s?api_key=%s&access_token=%s&user_token=%s' % (self.policyDict['url'], self.policyDict['setGrade'], self.policyDict['api_key'], self.accessToken, self.userToken)
		    log.info('update_assignment_score_for_member: setGradeUrl[%s]' % setGradeUrl)
		    params = {
			'assignment_id': assignmentScore.providerAssignmentID,
			'score': score,
			'total': 100,
		    }
		    log.info('update_assignment_score_for_member: params[%s]' % params)

		    status = None
		    if authType== "edmodoconnect":
			from flx.model.mongo.oauth2accesstoken import Oauth2AcessToken
			creator_access_token = Oauth2AcessToken().getAccessTokenByMemberID(groupCreator)
                        if not creator_access_token or "refreshToken" not in creator_access_token:
                            # The teacher has not launched via Edmodo Connnect to create an entry
                            log.error('update_assignment_score_for_member: Could not find assignment creator token: [%s]'%(creator_access_token))
                            raise ex.TeacherAccessTokenNotFoundException((_(u'Could not find assignment creator token.')).encode('utf8'))
                        # Check to see if the token is expired
                        import pytz
                        import dateutil.parser
                        tokenExpired = dateutil.parser.parse(creator_access_token['expires']) < pytz.utc.localize(datetime.datetime.utcnow())
                        # Token is expired and we need to refresh it
                        if tokenExpired:
                            #TODO: Add token url to development.ini and let Ops know about new setting
                            new_token = h.refreshAccessToken( 'https://api.edmodo.com/oauth/token',
                                                              config.get('edmodo_client_id'),
                                                              config.get('edmodo_client_secret'),
                                                              config.get('edmodo_redirect_uri'),
                                                              creator_access_token['refreshToken'],
                                                              grant_type="refresh_token")
                            if not new_token or "access_token" not in new_token:
                              log.error('update_assignment_score_for_member: Could not refresh expired teacher access token: [%s]'%(new_token))
                              raise ex.TeacherAccessTokenNotFoundException((_(u'Could not refresh expired teacher access token.')).encode('utf8'))
                            log.debug("update_assignment_score_for_member: Old teacher token [%s] New teacher token [%s]" %(creator_access_token['refreshToken'], new_token['access_token']))
                            creator_access_token['refreshToken'] = new_token['access_token']

			edmodoconn = edmodoconnect(access_token=creator_access_token['refreshToken'])
			start_time = time.time()
			submitterID = pylons_session.get('externalID')
			status = edmodoconn.submitGrade(submitterID, int(params['assignment_id']), "assignment", score, 100)
			status = json.loads(status)
			log.debug("update_assignment_score_for_member: (edmodo connect) set grade[%s]" % status)
		    else:
			start_time = time.time()
			status = self.http.call(setGradeUrl, method='POST', params=params, usePostBody=False)
		    run_time = (time.time() - start_time)
		    log.info('update_assignment_score_for_member: status[%s]' % status)
		    s = status.get('score')
		    # Audit Trail - edmodo_setgrade
		    auditTrailDict = { 'auditType': 'edmodo_setgrade',
				   'setGradeUrl':setGradeUrl,
				   'userToken': self.userToken,
				   'accessToken': self.accessToken,
				   'memberID': groupMember.memberID,
				   'assignmentID':assignment.assignmentID,
				   'providerID': self.providerID,
				   'score': score,
				   'providerGroupID': groupMember.providerGroupID,
				   'providerAssignmentID': assignmentScore.providerAssignmentID,
				   'request_params' : json.dumps(params),
				   'responseStatus' : status,
				   'turninSuccess': "false" if s!= str(score)  else "true",
				   'executionTime': run_time,
				   'creationTime': datetime.datetime.utcnow()}
		    try:
			self.auditTrail.insertTrail(collectionName='edmodoRequests', data=auditTrailDict)
		    except Exception, e:
			log.error("There was an issue logging the audit trail: %s"%e)
		    if s != str(score):
			raise ex.ExternalException((_(u'Cannot set grade[%s];' % status)).encode('utf8'))
                except Exception, e:
                    log.error('update_assignment_score_for_member: Cannot set grade, exception[%s].' % traceback.format_exc())
                    if type(e).__name__ == 'TeacherAccessTokenNotFoundException':
                        raise e
		    raise Exception((_(u'Cannot set grade[%s]' %e)).encode('utf8'))

        log.debug('update_assignment_score_for_member: assignmentScore[%s]' % assignmentScore)
        return assignmentScore.asDict()

    def _validateLMSRequest(self):
        #
        #  For LMS users.
        #
        log.debug('_validateLMSRequest: cookies[%s]' % request.cookies)
        lmsCookieName = '%s%s' % (config.get('lms_cookie_prefix'), self.policyDict['api_key'])
        log.debug('_validateLMSRequest: lmsCookieName[%s]' % lmsCookieName)
        _authType = pylons_session.get('authType', None)
        accessToken = request.cookies.get(lmsCookieName)
        if accessToken:
            accessToken = Blowfish.new(config.get('lms_secret')).decrypt(h.genURLSafeBase64Decode(accessToken, hasPrefix=False)).rstrip(' ') if config.get('lms_secret') else h.genURLSafeBase64Decode(accessToken, hasPrefix=False)
        else:
            accessToken = request.params.get('accessToken')
            if not accessToken and _authType == "edmodoconnect":
		from flx.lib.lms.edmodo_connect import _getAccessToken as gatc
		accessToken = gatc()
            if not accessToken:
                raise Exception((_(u'Authentication problem. No access token found.')).encode('utf8'))
        log.debug("lmsCookieName: %s, accessToken: %s" % (lmsCookieName, accessToken))
        log.debug('_validateLMSRequest: pre _authType[%s]' % _authType)
        userToken = pylons_session.get('userToken')
        if not userToken:
            #
            #  Get the data from auth.
            #
            loginCookie = config.get('ck12_login_cookie')
            cookie = request.cookies.get(loginCookie)
            user = u.getInfoFromAuth(request, login_cookie=loginCookie, cookie=cookie, save=True, appName=self.appName, txSession=self.session)
	    log.debug('_validateRequest: user [%s]' % user)
            if user:
                #accessToken = request.cookies.get(lmsCookieName)
                #accessToken = Blowfish.new(config.get('lms_secret')).decrypt(h.genURLSafeBase64Decode(accessToken, hasPrefix=False)).rstrip(' ') if config.get('lms_secret') else h.genURLSafeBase64Decode(accessToken, hasPrefix=False)
                if not userToken:
                    userToken = pylons_session.get('userToken')
            if not user or not userToken:
                raise Exception((_(u'Authentication problem')).encode('utf8'))
        log.debug('_validateRequest: accessToken [%s]' % accessToken)
        self.accessToken = accessToken
        self.userToken = userToken
