from flx.controllers import decorators as d
from flx.controllers.mongo.base import MongoBaseController 
from flx.model import api, utils
from flx.model.userdata import lmsuserdata
from flx.lib.remoteapi import RemoteAPI
from pylons import request, config
from pylons.i18n.translation import _
from flx.controllers.errorCodes import ErrorCodes
import flx.controllers.user as u
from flx.lib.lms.edmodo_connect import EdmodoConnect as edmodoconnect
from flx.lib.lms.edmodo_connect import _getAccessToken as gatc

import logging
import json
import traceback

log = logging.getLogger(__name__)

class LmsController(MongoBaseController):
    """
        LMS related APIs.
    """
    def _init(self, session, appName):
        lmsProviderApp = api._getLMSProviderAppByName(session, appName)
        log.debug('_init: lmsProviderApp[%s]' % lmsProviderApp)
        providerID = lmsProviderApp.providerID
        appID = lmsProviderApp.appID
        policyDict = json.loads(lmsProviderApp.policy)
        return providerID, appID, policyDict

    def _setupLMSInfo(self, session, appName, providerID, appID, policyDict, userToken, accessToken, lmsGroupIDs=None, lgs=None):
        if not lgs:
            edmodoConnectAPI = None
            if 'edmodo_connect_access_token' in session:
                edmodoConnectAPI = True
            if not lmsGroupIDs:
                getGroupsUrl = '%s%s?api_key=%s&access_token=%s&user_token=%s' % (policyDict['url'], policyDict['getUserGroups'], policyDict['api_key'], accessToken, userToken)
            else:
                getGroupsUrl = '%s%s?api_key=%s&access_token=%s&group_ids=%s' % (policyDict['url'], policyDict['getGroups'], policyDict['api_key'], accessToken, lmsGroupIDs)
            if edmodoConnectAPI:
                access_token = gatc()
                edmodoconn = edmodoconnect(access_token=access_token)
                groups = edmodoconn.getUserEdmodoGroups()
                log.debug("_setupLMSGroups: (edmodo connect) lgs[%s]" % groups)
                lgs = json.loads(groups)
            else:
                log.debug('_setupLMSInfo: getGroupsUrl[%s]' % getGroupsUrl)
                lgs = self._call(getGroupsUrl, method='GET', external=True)
        log.debug('_setupLMSInfo: lgs%s' % lgs)
        lmsGroupIDList = []
        for lg in lgs:
            lmsGroupID = lg['group_id']
            lmsGroupIDList.append(lmsGroupID)
            lmsGroupTitle = lg['title']
            lmsOwners = lg['owners']
            isOwner = False
            for lmsOwner in lmsOwners:
                if userToken == lmsOwner:
                    isOwner = True
            groupName = '%s: %s %s' % (appName, lmsGroupID, lmsGroupTitle)
            log.debug('_setupLMSInfo: groupName[%s]' % groupName)
            lmsGroups = api._getLMSProviderGroups(session, appName=appName, providerGroupID=lmsGroupID)
            log.debug('_setupLMSInfo: lmsGroups%s' % lmsGroups)
            if not isOwner:
                if not lmsGroups:
                    #
                    #  The owner has not created this group yet.
                    #
                    continue

                lmsGroup = lmsGroups[0]
            else:
                if not lmsGroups:
                    lmsGroup = api._createLMSProviderGroup(session,
                                                           appName=appName,
                                                           providerGroupID=lmsGroupID,
                                                           title=lmsGroupTitle)
                else:
                    lmsGroup = lmsGroups[0]
                    if lmsGroup.title != lmsGroupTitle:
                        from datetime import datetime as dt

                        lmsGroup.title = lmsGroupTitle
                        lmsGroup.updateTime = dt.now()
                        session.add(lmsGroup)

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
                'payload': '{"lmsProvider": "edmodo","appName": "%s","lmsGroupIDList": %s,"userToken": "%s"}' %(appName, lmsGroupIDList, userToken)
            }
            RemoteAPI._makeCall(config.get('ads_url_prefix'), 'record/event', 100, params_dict=params, raw_response=True, failIfNonZero=False)
        except:
            log.error('Unable to trigger FBS_LMS_INSTALL event: [%s]' %(traceback.format_exc()))

    @d.jsonify()
    @d.checkAuth(request, True, False)
    @d.trace(log, ['member'])
    def getLMSProviders(self, member):
        """
            Returns the list of all LMS providers
            Only Admin can access this API
            @input params : LMS providerID
        """
        result = self.getResponseTemplate(ErrorCodes.OK, 0)
        try:
            if not u.isMemberAdmin(member):
                return ErrorCodes().asDict(ErrorCodes.UNAUTHORIZED_OPERATION, 'Only administrator can call this API')
            lmsProviderID = request.params.get('providerID', None)
            
            if request.params.has_key('providerID') and lmsProviderID == '':
                raise Exception((_(u'Missing id for lms provider')).encode("utf-8"))
            lmsProviders = api.getLMSProvider(id=lmsProviderID)
            if not lmsProviders:
                raise Exception((_(u'No such lms provider')).encode("utf-8"))
            result['response']['providers'] = [ x.asDict() for x in lmsProviders ]
            return result
        except Exception, e:
            log.error('get lms provider Exception[%s]' % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.NO_SUCH_LMS_PROVIDER, str(e))

    @d.jsonify()
    @d.sortable(request, ['member'])
    @d.filterable(request, ['sort', 'member'], noformat=True)
    @d.checkAuth(request, False, False, ['sort', 'fq'])
    @d.setPage(request, ['member', 'sort', 'fq'])
    @d.trace(log, ['member', 'sort', 'fq', 'pageNum', 'pageSize'])
    def getLMSProviderAppUsers(self, member, fq, pageNum=0, pageSize=10, sort=None):
        """
            Returns the list of lms information for specified user ids or providerMemberID 
            Only Admin can access this API
            @input params : comma separated user ids or providerMemberID
        """
        result = self.getResponseTemplate(ErrorCodes.OK, 0)
        try:
            if not u.isMemberAdmin(member):
                return ErrorCodes().asDict(ErrorCodes.UNAUTHORIZED_OPERATION, 'Only administrator can call this API')
            lmsProviderAppID = request.params.get('providerAppID', None)
            lmsProviderID = request.params.get('providerID', None)
            appID = None
            if request.params.has_key('providerID') and lmsProviderID == '':
                raise Exception((_(u'Missing id for lms provider')).encode("utf-8"))
            if request.params.has_key('providerAppID') and lmsProviderAppID == '':
                raise Exception((_(u'Missing id for lms provider app')).encode("utf-8"))
            isUserTokenSearch = False
            if request.params.has_key('providerMemberID'):
                isUserTokenSearch = True
                lmsProviderGroupMembers = api.getLMSProviderGroupMembers(providerMemberID=request.params.get('providerMemberID'))
            else:
                memberIDs = None
                filters = None
                if request.params.has_key('userIDs'):
                    memberIDs =  request.params.get('userIDs').split(',')
                    if filters is not None:
                        filters = filters + tuple([('memberID', m) for m in memberIDs])
                    else:
                        filters = tuple([('memberID', m) for m in memberIDs])
                if fq:
                    for name, value in fq:
                        if name == 'appID':
                            appID = value
                        if filters is not None:
                            filters = filters + ((name, value), )
                        else:
                            filters = ((name, value), )
                lmsProviderGroupMembers = api.getLMSProviderGroupMembersByFilters(filters=filters,
                                                                         pageNum=pageNum,
                                                                         pageSize=pageSize)

            # Add member lms groups info in response
            #
            lmsProviderGroupMembersDict = {}
            for lmsProviderGroupMember in lmsProviderGroupMembers:
                if not lmsProviderGroupMember.memberID in lmsProviderGroupMembersDict.keys():
                    lmsProviderGroupMembersDict[lmsProviderGroupMember.memberID] = lmsProviderGroupMember.asDict()
                    lmsGroupsForMembers = api.getLMSProviderGroupsOfMember(lmsProviderGroupMember.memberID, appID=appID)
                    lmsProviderGroupMembersDict[lmsProviderGroupMember.memberID]['groupsInfo'] = [x.asDict() for x in lmsGroupsForMembers] 

            if not isUserTokenSearch:
                result['response']['total'] = lmsProviderGroupMembers.getTotal()
                result['response']['offset'] = (pageNum-1)*pageSize
                result['response']['limit'] = len(lmsProviderGroupMembers)
            result['response']['lmsMembers'] = lmsProviderGroupMembersDict
            return result
        except Exception, e:
            log.error('get lms provider users Exception[%s]' % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.NO_SUCH_LMS_PROVIDER_APP, str(e))

    @d.jsonify()
    @d.checkAuth(request, True, False, ['providerID'])
    @d.trace(log, ['providerID', 'member'])
    def getLMSProviderApps(self, providerID, member):
        """
            Returns the list of all LMS providers
            Only Admin can access this API
        """
        result = self.getResponseTemplate(ErrorCodes.OK, 0)
        try:
            if not u.isMemberAdmin(member):
                return ErrorCodes().asDict(ErrorCodes.UNAUTHORIZED_OPERATION, 'Only administrator can call this API')

            if not providerID:
                providerID = request.params.get('providerID', None)
            if not providerID:
                raise Exception((_(u'Missing id for lms provider')).encode("utf-8"))

            lmsProviderAppID = request.params.get('providerAppID', None)
            if lmsProviderAppID and lmsProviderAppID == '':
                raise Exception((_(u'Missing id for lms provider app')).encode("utf-8"))
            
            lmsProviderApps = api.getLMSProviderApps(providerID=providerID, appID=lmsProviderAppID)
            if not lmsProviderApps:
                raise Exception((_(u'No such lms provider app')).encode("utf-8"))
            result['response']['providerApps'] = [ x.asDict() for x in lmsProviderApps ]
            return result
        except Exception, e:
            log.error('get lms provider apps Exception[%s]' % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.NO_SUCH_LMS_PROVIDER_APP, str(e))

    @d.jsonify()
    @d.checkAuth(request, True, False, ['providerID'])
    @d.trace(log, ['member', 'providerID'])
    def createLMSProviderApp(self, member, providerID=None):
        """
            Create the LMS provider App, if not yet exists.
            Only Admin can access this API
        """
        result = self.getResponseTemplate(ErrorCodes.OK, 0)
        try:
            if not u.isMemberAdmin(member):
                return ErrorCodes().asDict(ErrorCodes.UNAUTHORIZED_OPERATION, 'Only administrator can call this API')

            if not providerID:
                providerID = request.params.get('providerID', None)
            if not providerID:
                raise Exception((_(u'Missing id for lms provider')).encode("utf-8"))

            lmsProviderAppID = request.params.get('appID', None)
            if lmsProviderAppID and lmsProviderAppID == '':
                raise Exception((_(u'Missing id for lms provider app')).encode("utf-8"))

            lmsAppName = request.params.get('appName', 'ltiApp')
            if lmsAppName and lmsAppName == 'ltiApp':
                lmsProviderAppID = '%s:%s' % (lmsProviderAppID, lmsAppName)
            lmsAppPolicy = request.params.get('policy', '{}')

            tx = utils.transaction(self.getFuncName())
            with tx as session:
                lmsProviderApp = api._getLMSProviderAppByAppID(session, appID=lmsProviderAppID)
                if not lmsProviderApp:
                    data = {
                            'providerID': providerID,
                            'appID': lmsProviderAppID,
                            'appName': lmsAppName,
                            'policy': lmsAppPolicy,
                        }
                    lmsProviderApp = api._createLMSProviderApp(session, **data)
                    log.debug('createLMSProviderApp: new lmsProviderApp[%s]' % lmsProviderApp)
                result['response']['providerApp'] = lmsProviderApp.asDict()
            return result
        except Exception, e:
            log.error('get lms provider apps Exception[%s]' % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.NO_SUCH_LMS_PROVIDER_APP, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, True, ['appID'])
    @d.trace(log, ['appID', 'member'])
    def getLMSUserData(self, appID, member):
        result = self.getResponseTemplate(ErrorCodes.OK, 0)
        try:
            member = u.getImpersonatedMember(member)
            ud = lmsuserdata.LMSUserData(self.db).getLMSUserData(memberID=member.id, lmsAppName=appID)
            if not ud:
                return ErrorCodes().asDict(ErrorCodes.NO_SUCH_LMS_USERDATA, "Could not find userdata for app[%s], memberID[%s]" % (appID, member.id))
            result['response'] = ud
            return result
        except Exception as e:
            log.error("getLMSUserData exception[%s]" % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.NO_SUCH_LMS_USERDATA, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, True, ['appID'])
    @d.trace(log, ['appID', 'member'])
    def saveLMSUserData(self, appID, member):
        result = self.getResponseTemplate(ErrorCodes.OK, 0)
        try:
            member = u.getImpersonatedMember(member)
            if not appID:
                raise Exception("Missing appID")
            if not request.params.get('userdata'):
                raise Exception('Cannot save empty userdata')
            kwargs = {'lmsAppName': appID, 'memberID': member.id}
            kwargs['userdata'] = json.loads(request.params.get('userdata'))
            result['response'] = lmsuserdata.LMSUserData(self.db).saveLMSUserData(**kwargs)
            return result
        except Exception as e:
            log.error("saveLMSUserData exception[%s]" % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.CANNOT_SAVE_LMS_USERDATA, str(e))
