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
from flx.controllers import decorators as d
from pylons import request
from pylons.i18n.translation import _
from flx.model import api
from flx.lib.http import Http
import logging
import json

#Initialing logger
log = logging.getLogger(__name__)

class LMSManager(object):
    '''
        Base class for LMS intergration with FBS.
    '''

    http = None

    def __init__(self, appID, **kwargs):
        self.appID = appID
        self.session = kwargs.get('txSession', None)
        headers = {
                'Accept': 'application/json, */*; q=0.01',
                'Content-Type': 'application/json; charset=UTF-8',
                'Connection': 'keep-alive'
        }
        self.http = Http(external=True, headers=headers)

        if self.session:
            lmsProviderApp = api._getLMSProviderAppByAppID(self.session, self.appID)
        else:
            lmsProviderApp = api.getLMSProviderAppByAppID(self.appID)
        log.debug('_init: lmsProviderApp[%s]' % lmsProviderApp)
        providerID = lmsProviderApp.providerID
        appName = lmsProviderApp.appName
        policyDict = json.loads(lmsProviderApp.policy)
        self.providerID = providerID
        self.appName = appName
        self.policyDict = policyDict

    def _init(self):
        return self.providerID, self.policyDict

    def _setupLMSInfo(self, session, providerID, appID, policyDict, userToken, accessToken, lmsGroupIDs=None, lgs=None):
        raise Exception((_(u'_setupLMSInfo must be implemented by each subclass.')).encode("utf-8"))

    def _validateLMSRequest(self):
        pass

    @d.trace(log, ['member'])
    def _getMyLMSGroups(self, member):
        return []

    def createGroup(self, groupID, member, returnIDOnly=True, lmsGroupName=None):
        return groupID

    def createLMSAssignment(self, **kwargs):
        return request.params.get('assignment_id', None)

    def createLMSAssignmentAssociation(self, lmsAssignmentID, assignmentID):
        #
        #  Create the LMS association, if not present
        #
        lmsProviderAssignment = api._getLMSProviderAssignments(self.session, providerID=self.providerID,
                                                               providerAssignmentID=lmsAssignmentID, assignmentID=assignmentID)
        if not lmsProviderAssignment:
            kwargs = {
                      'providerID': self.providerID,
                      'providerAssignmentID': lmsAssignmentID,
                      'assignmentID': assignmentID,
                      }
            lmsAssignment = api._createLMSProviderAssignment(self.session, **kwargs)
            log.debug('createLMSAssociation: lmsAssignment[%s]' % lmsAssignment)

    def createLMSMemberAssociation(self, providerGroupID, providerMemberID=None, memberID=None):
        raise Exception((_(u'createLMSMemberAssociation: must be implemented by each subclass.')).encode("utf-8"))

    def createLMSMemberGroupAssociation(self, providerGroupID, providerMemberID, memberID):
        #
        #  Create the LMS Member Group Association, if not present
        #
        lmsGroupMembers = api._getLMSProviderGroupMembers(self.session,
                                                  providerID=self.providerID,
                                                  providerGroupID=providerGroupID,
                                                  providerMemberID=providerMemberID,
                                                  memberID=memberID)

        if not lmsGroupMembers:
            log.debug("Creating LMS Provider Member Group Association: providerID [%s], providerGroupID [%s], providerMemberID [%s], memberID [%s]"\
                       % (self.providerID, providerGroupID, providerMemberID, memberID))
            lmsGroupMember = api._createLMSProviderGroupMember(self.session,
                                                               providerID=self.providerID,
                                                               providerGroupID=providerGroupID,
                                                               providerMemberID=providerMemberID,
                                                               memberID=memberID)
            log.debug('createLMSMemberGroupAssociation: lmsGroupMember[%s]' % lmsGroupMember)

    def update_assignment_score_for_member(self, groupMember, assignmentID, score, testScoreID=None, topicName=None):
        raise Exception((_(u'update_assignment_score_for_member must be implemented by each subclass.')).encode("utf-8"))

    def auditThridPartyAPIs(self,url,data,db=None):
        raise Exception((_(u'auditThirdPartyAPIs must be implemented by each subclass.')).encode("utf-8"))
