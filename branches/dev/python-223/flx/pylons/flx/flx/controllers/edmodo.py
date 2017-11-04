from flx.controllers import decorators as d
from flx.controllers.lms import LmsController
from flx.model import api, model, exceptions as ex, utils
from flx.model.audit_trail import AuditTrail
from pylons import request
from pylons.i18n.translation import _

import json
import logging


log = logging.getLogger(__name__)

class EdmodoController(LmsController):
    """
        Edmodo related APIs.
    """

    @d.jsonify()
    @d.trace(log, ['appID'])
    def install(self, appID):
        """
            Install Edmodo app.
        """
        try:
            auditTrail = AuditTrail()
            log.debug('install: params[%s]' % request.params)
            install = request.params.getone('install')
            if not install:
                raise ex.MissingArgumentException((_(u'install info missing.')).encode('utf8'))

            installDict = json.loads(install)
            log.debug('install: installDict[%s]' % installDict)
            userToken = installDict.get('user_token', None)
            accessToken = installDict.get('access_token', None)
            groups = installDict.get('groups', None)
            lmsGroupIDs = []
            for group in groups:
                lmsGroupIDs.append(int(group))
            lmsGroupIDs = str(lmsGroupIDs).replace(' ', '')

            tx = utils.transaction(self.getFuncName())
            auditTrailDict = { 'auditType': 'edmodo_install',
                               'userToken': userToken,
                               'accessToken': accessToken,
                               'memberID': None,
                               'lmsGroups': groups,
                               'lmsGroupIDs': lmsGroupIDs,
                               'appID': appID}
            with tx as session:
                lmsManager = self.getLMSInstance(appID, txSession=session)
                lmsManager._setupLMSInfo(session, lmsManager.providerID, lmsManager.appID, lmsManager.policyDict, userToken, accessToken, lmsGroupIDs)
                

            status = { 'status': 'success' }
            auditTrailDict['status'] = status
            try:
                auditTrail.insertTrail(collectionName='edmodoRequests',data=auditTrailDict)
            except Exception, e:
                log.error("There was an issue logging the audit trail: %s"%e)
            return status
        except Exception, e:
            status = { 'status': 'failed', 'error_message': str(e) }
            auditTrailDict['status'] = status
            try:
                auditTrail.insertTrail(collectionName='edmodoRequests',data=auditTrailDict)
            except Exception, e:
                log.error("There was an issue logging the audit trail: %s"%e)
            log.warn('install: exception[%s]' % str(e), exc_info=e)
            return status

    @d.jsonify()
    @d.trace(log, ['appID'])
    def processUpdate(self, appID):
        """
            Process notification event from Edmodo.
        """
        auditTrail = AuditTrail()
        try:
            auditTrailDict = {"appID":appID}
            auditTrailDict['memberID'] = None
            log.debug('processUpdate: params[%s]' % request.params)
            data = request.params.getone('update_data')
            if not data:
                raise ex.MissingArgumentException((_(u'processUpdate data missing.')).encode('utf8'))
            data = json.loads(data)

            updateType = data.get('update_type', None)
            if not updateType:
                raise ex.MissingArgumentException((_(u'processUpdate update_type missing.')).encode('utf8'))

            tx = utils.transaction(self.getFuncName())
            with tx as session:
                lmsManager = self.getLMSInstance(appID, txSession=session)
                if updateType == 'user_data_updated':
                    users = data.get('updated_users', [])
                    for user in users:
                        log.debug('processUpdate: user_data_updated user[%s]' % user)
                        #userType = user.get('user_type')
                        userToken = user.get('user_token')
                        #firstName = user.get('first_name')
                        #lastName = user.get('last_name')
                        log.debug('processUpdate: no-op for now')
                elif updateType == 'app_uninstall':
                    auditTrailDict['auditType'] = 'edmodo_uninstall'
                    groups = data.get('uninstalled_groups',[])
                    auditTrailDict['lmsGroups'] = groups
                    log.debug('Ready to proces these groups [%s]' % groups)
                    lmsGroupIDs = map(lambda x: x['group_id'], groups)
                    auditTrailDict['lmsProviderGroupIDs'] = lmsGroupIDs
                    auditTrailDict['groups'] = []
                    for lmsGroupID in lmsGroupIDs:
                        log.info('processUpdate: group_deleted lmsGroupID[%s]' % lmsGroupID)
                        lmsGroups = api._getLMSProviderGroups(session, appID=appID, providerGroupID=lmsGroupID)
                        log.info('processUpdate: lnmsGroups are lmsGroups[%s]' % lmsGroups)
                        if not lmsGroups:
                            raise ex.InvalidArgumentException((_(u'Invalid LMS group id[%s]' % lmsGroupID)).encode('utf8'))
                        lmsGroup = lmsGroups[0]
                        groupID = lmsGroup.groupID
                        if not groupID:
                            log.debug('processUpdate: groupID was not found')
                            continue
                        group = api._getGroupByID(session, id=groupID)
                        if not group:
                            auditTrailDict['groups'].append({'lmsGroupID':lmsGroupID,'groupID':groupID,'removed':'false'})
                            raise ex.InvalidArgumentException((_(u'Invalid group id[%s]' % groupID)).encode('utf8'))
                        # Flag the group as inactive and not fully delete
                        log.debug('processUpdate: Updating group isActive to false')
                        removed = api._updateGroup(session, group=group, newGroupName=group.name, newGroupDesc=group.description, isActive=0)
                        log.debug('processUpdate: disabled group id %s  %s'% (groupID, removed))
                        auditTrailDict['groups'].append({'lmsProviderGroupID':lmsGroupID,'groupID':groupID,'removed':'true','creatorID':group.creatorID})
                        """
                            TODO: lmsGroupMember is not defined.

                        userTokens = lmsGroupMember.get('user_tokens', [])
                        for userToken in userTokens:
                            log.info('processUpdate: group_deleted userToken[%s]' % userToken)
                            lmsGroupMembers = api._getLMSProviderGroupMembers(session,
                                                                              providerID=lmsManager.providerID,
                                                                              providerGroupID=lmsGroupID,
                                                                              providerMemberID=userToken)
                            for lmsGroupMember in lmsGroupMembers:
                                log.info('processUpdate: group_deleted memberID[%s]' % lmsGroupMember.memberID)
                                session.delete(lmsGroupMember)
                        """
                elif updateType == 'group_member_created':
                    auditTrailDict['auditType'] = 'edmodo_group_member_created'
                    lmsGroupMembers = data.get('new_group_members', [])
                    gmDict = {}
                    auditTrailDict['lmsGroupMembers'] = lmsGroupMembers
                    auditTrailDict['newLmsGroupMembers'] = []
                    for lmsGroupMember in lmsGroupMembers:
                        lmsGroupID = lmsGroupMember.get('group_id')
                        if not gmDict.get(lmsGroupID, None):
                            gmDict[lmsGroupID] = {}
                        lmsGroups = api._getLMSProviderGroups(session, appID=appID, providerGroupID=lmsGroupID)
                        if not lmsGroups:
                            raise ex.InvalidArgumentException((_(u'Invalid LMS group id[%s]' % lmsGroupID)).encode('utf8'))
                        lmsMembers = lmsGroupMember.get('members', [])
                        for lmsMember in lmsMembers:
                            log.debug('processUpdate: new_group_member lmsMember[%s]' % lmsMember)
                            userToken = lmsMember.get('user_token')
                            if gmDict[lmsGroupID].get(userToken, None):
                                continue
                            gmDict[lmsGroupID][userToken] = lmsGroupMember
                            lmsGroupMembers = api._getLMSProviderGroupMembers(session,
                                                                              providerID=lmsManager.providerID,
                                                                              providerGroupID=lmsGroupID,
                                                                              providerMemberID=userToken)
                            if lmsGroupMembers:
                                lmsGroupMember = lmsGroupMembers[0]
                                log.debug('processUpdate: found lmsGroupMember[%s]' % lmsGroupMember)
                            else:
                                lmsGroupMember = api._createLMSProviderGroupMember(session,
                                                                                   providerID=lmsManager.providerID,
                                                                                   providerGroupID=lmsGroupID,
                                                                                   providerMemberID=userToken)
                                auditTrailDict['newLmsGroupMembers'].append(lmsGroupMember)
                                log.info('processUpdate: created lmsGroupMember[%s]' % lmsGroupMember)
                elif updateType == 'group_member_deleted':
                    auditTrailDict['auditType'] = 'edmodo_group_member_deleted'
                    lmsGroupMembers = data.get('removed_group_members', [])
                    auditTrailDict['lmsGroupMembers'] = lmsGroupMembers
                    auditTrailDict['removedLmsGroupMembers'] = []
                    for lmsGroupMember in lmsGroupMembers:
                        lmsGroupID = lmsGroupMember.get('group_id')
                        lmsGroups = api._getLMSProviderGroups(session, appID=appID, providerGroupID=lmsGroupID)
                        if not lmsGroups:
                            raise ex.InvalidArgumentException((_(u'Invalid LMS group id[%s]' % lmsGroupID)).encode('utf8'))
                        lmsGroup = lmsGroups[0]
                        groupID = lmsGroup.groupID
                        if not groupID:
                            continue
                        group = api._getGroupByID(session, id=groupID)
                        if not group:
                            raise ex.InvalidArgumentException((_(u'Invalid group id[%s]' % groupID)).encode('utf8'))
                        userTokens = lmsGroupMember.get('user_tokens', [])
                        for userToken in userTokens:
                            log.debug('processUpdate: removed_group_member userToken[%s]' % userToken)
                            lmsGroupMembers = api._getLMSProviderGroupMembers(session,
                                                                              providerID=lmsManager.providerID,
                                                                              providerGroupID=lmsGroupID,
                                                                              providerMemberID=userToken)
                            memberIDs = []
                            for lmsGroupMember in lmsGroupMembers:
                                memberID = lmsGroupMember.memberID
                                memberIDs.append(memberID)
                                auditTrailDict['removedLmsGroupMembers'].append({'memberID':memberID,'userToken':userToken,'lmsGroupID':lmsGroupID})
                                session.delete(lmsGroupMember)
                            if memberIDs:
                                query = session.query(model.GroupHasMember)
                                query = query.filter_by(groupID=group.id)
                                query = query.filter(model.GroupHasMember.memberID.in_(memberIDs))
                                query.delete()
                else:
                    log.debug('processUpdate: no-op for now')

            status = { 'status': 'success' }
            if auditTrailDict:
                try:
                    auditTrail.insertTrail(collectionName='edmodoRequests',data=auditTrailDict)
                except Exception, e:
                    log.error("There was an issue logging the audit trail: %s"%e)
            return status
        except Exception, e:
            status = { 'status': 'failed', 'error_message': str(e) }
            auditTrailDict['status'] = status
            log.warn('processUpdate: exception[%s]' % str(e), exc_info=e)
            try:
                auditTrail.insertTrail(collectionName='edmodoRequests',data=auditTrailDict)
            except Exception, e:
                log.error("There was an issue logging the audit trail: %s"%e)
            return status
