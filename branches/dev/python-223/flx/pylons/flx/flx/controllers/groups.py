from Crypto.Cipher import Blowfish
from datetime import datetime
from flx.controllers import decorators as d
from flx.controllers import notification as n
from flx.controllers.common import ArtifactCache
from flx.controllers.errorCodes import ErrorCodes
from flx.model.exceptions import NotFoundException
from flx.model.mongo.forumssequence import ForumsSequence
from flx.lib import helpers as h
from flx.lib.base import BaseController, render
from flx.model import api, model, exceptions as ex, utils
from pylons import app_globals as g, config, request, session as pylons_session, tmpl_context as c
from pylons.i18n.translation import _
from flx.lib.lms.edmodo_connect import EdmodoConnect as edmodoconnect
import flx.controllers.user as u
import json
import base64
import logging
import traceback
from os import remove as FileRemove
from flx.lib.http import Http
from cookielib import CookieJar
import requests
from urlparse import urljoin

log = logging.getLogger(__name__)

class GroupsController(BaseController):
    """
        Group related APIs.
    """

    def createForm(self):
        user = u.getCurrentUser(request)
        c.userName = user.name
        c.prefix = self.prefix
        return render('/flx/group/createForm.html')

    def _create(self, session, user, groupName, groupDescription, groupScope, groupType, roleDict, roleNameDict, resourceRevisionID=None, groupHandle=None, roleID=None, assigneeIDs=None, book=None):
        """
            Creates a new group with the user as the admin/owner
        """
        isPublicForum = groupType in ['public-forum']

        #Bug 45186: Allow public-forum creation only for 'admin' and 'content-admin' user            
        if isPublicForum:
            if not u.isMemberAdmin(user, session=session):
                raise ex.UnauthorizedException((_(u'You are not authorized to create public forum')).encode("utf-8"))

            memberGroups = api._getMemberGroup(session, id=user.id, groupID=1)
            allowMember = False
            for mg in memberGroups:
                if mg.role.name in ['content-admin', 'admin']:
                    allowMember = True
                    break
            if not allowMember:
                raise ex.UnauthorizedException((_(u'You are not authorized to create public forum')).encode("utf-8"))

        isEditing = groupType in ['editing']
        if not isEditing and not resourceRevisionID:
            resources = api._getResourcesByTypes(session, typeNames=['group system image'], ownerID=3,
                getAll=False, sort=None, pageNum=0, pageSize=0)
            if resources.total > 0:
                resourceRevisionID = resources.results[0].revisions[0].id

        if not groupName:
            raise ex.AlreadyExistsException((_(u'Group name cannot be empty.')).encode("utf-8"))

        if groupType not in model.Group.groupType.property.columns[0].type.enums:
            c.errorCode = ErrorCodes.INVALID_GROUP_TYPE
            raise ex.InvalidArgumentException((_(u'Group type cannot be %(groupType)s.' % { 'groupType': groupType })).encode("utf-8"))

        if groupType == 'editing' and not book:
            c.errorCode = ErrorCodes.INVALID_ARGUMENT
            raise ex.InvalidArgumentException((_(u'BookID missing for editing group.')).encode("utf-8"))

        if groupScope not in model.Group.groupScope.property.columns[0].type.enums:
            c.errorCode = ErrorCodes.INVALID_GROUP_SCOPE
            raise ex.InvalidArgumentException((_(u'Group scope cannot be %(groupScope)s.' % { 'groupScope': groupScope })).encode("utf-8"))

        res = api._getGroupByNameAndCreator(session, groupName=groupName, creatorID=user.id)
        if res:
            raise ex.AlreadyExistsException((_(u'Cannot create group. Group with same name already exists for this user.')).encode("utf-8"))
        group = api._createGroup(session,
                                 handle=groupHandle,
                                 groupName=groupName,
                                 groupDescription=groupDescription,
                                 roleID=roleID,
                                 groupScope=groupScope,
                                 groupType=groupType,
                                 creator=user,
                                 resourceRevisionID=resourceRevisionID)
        memberList = []
        if assigneeIDs:
            assigneeIDs = assigneeIDs.split(',')
            log.debug('_create: assigneeIDs[%s]' % assigneeIDs)
            #
            #  Add members, identified by their assigneeIDs, to this new group.
            #
            if roleID and roleDict.get(roleID) == 'ge-owner':
                role = 'ge-collaborator'
            else:
                role = 'groupmember'
            roleID = roleNameDict.get(role, None)
            log.debug('_create: roleID[%s]' % roleID)
            unknownAssigneeList = []
            for assigneeID in assigneeIDs:
                assigneeID = assigneeID.lower().strip()
                member = api._getMember(session, id=assigneeID)
                if not member:
                    unknownAssigneeList.append(assigneeID.encode('utf-8'))
                    continue
                if member.id == user.id:
                    raise ex.InvalidArgumentException((_(u'Assignee, %(assigneeID)s, cannot be the group creator.' % { 'assigneeID': assigneeID })).encode("utf-8"))
                result = api._addMemberToGroup(session, group=group, memberID=member.id, roleID=roleID)
                if not result.get('is_user_added', False):
                    raise Exception((_(u'Unable to add user with %(assigneeID)s to the group: %(message)s.' % { 'assigneeID': assigneeID, 'message': result.get('message', '') })).encode("utf-8"))
                log.debug('_create: added member[%s]' % member.id)
                if group.groupType == 'editing':
                    #
                    #  Add to assignee's library with the "Collaboration" system label.
                    #
                    objectID = book.revisions[0].id
                    objectType = 'artifactRevision'
                    libObject = api._safeAddObjectToLibrary(session, objectID, objectType, memberID=member.id, systemLabels=['Collaboration'], cache=ArtifactCache())
                    log.debug('_create: added library object[%s]' % libObject)
                memberList.append(member.asDict())
            if unknownAssigneeList:
                s = 's' if len(unknownAssigneeList) > 1 else ''
                raise ex.InvalidArgumentException((_(u'We cannot find the CK-12 account%(s)s for the following email%(s)s %(assigneeList)s.' % { 's': s, 'assigneeList': unknownAssigneeList })).encode("utf-8"))
        log.debug('_create: group[%s]' % group)
        return group, memberList

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log)
    def create(self):
        """
            Creates a new group with the user as the admin
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            user = u.getCurrentUser(request)
            rurl = '%s/get/info/my' % config.get('flx_auth_api_server')
            status, data = self._call(rurl, method='GET', fromReq=True)
            if status !=  ErrorCodes.OK:
                raise Exception('Unable to get user information on status, %s: %s' % (status, data))

            groupName = request.params.get('groupName')
            groupDescription = request.params.get('groupDescription')
            groupScope = request.params.get('groupScope','closed')
            groupType = request.params.get('groupType','class')
            resourceRevisionID = request.params.get('resourceRevisionID')
            
            roleDict, roleNameDict = g.getMemberRoles()
            groupSubjects = request.params.get('groupSubjects', '')
            groupGrades = request.params.get('groupGrades', '')
            tagLine = request.params.get('tagLine', None)
            taggedRole = request.params.get('taggedRoles', None)

            resourceType = request.params.get('resourceType', None)
            resourceName = request.params.get('resourceName', None) 
            resourcePath = request.params.get('resourcePath', None)
            resourceUri = request.params.get('resourceUri', None)

            isPublicForum = groupType in ['public-forum']
            
            #Bug 45186: Allow public-forum creation only for 'admin' and 'content-admin' user
            if isPublicForum:
                if not u.isMemberAdmin(user):
                    raise ex.UnauthorizedException((_(u'You are not authorized to create public forum')).encode("utf-8"))

                memberGroups = api.getMemberGroup(id=user.id, groupID=1)
                allowMember = False
                for mg in memberGroups:
                    if mg.role.name in ['content-admin', 'admin']:
                        allowMember = True
                        break
                if not allowMember:
                    raise ex.UnauthorizedException((_(u'You are not authorized to create public forum')).encode("utf-8"))

            if not groupName:
                c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
                msg = 'Group name cannot be empty'
                return ErrorCodes().asDict(c.errorCode, msg)

            if groupType not in model.Group.groupType.property.columns[0].type.enums:
                c.errorCode = ErrorCodes.INVALID_GROUP_TYPE
                msg = 'Group type cannot be ' + groupType
                return ErrorCodes().asDict(c.errorCode, msg)

            if groupScope not in model.Group.groupScope.property.columns[0].type.enums:
                c.errorCode = ErrorCodes.INVALID_GROUP_SCOPE
                msg = 'Group scope cannot be ' + groupScope
                return ErrorCodes().asDict(c.errorCode, msg)

            if resourceType is not None and resourceName is not None and \
            (resourcePath is not None or resourceUri is not None) and \
            not resourceRevisionID:
                payload_data = dict()
                http = Http(fromReq=True)
                cookie_jar = CookieJar()
                cookie_jar = http._restoreCookiesFromSession(cj=cookie_jar)
                durl_prefix = urljoin(config.get('flx_prefix_url'), config.get('instance'))
                durl = durl_prefix + "/create/resource"
                if resourcePath is not None:
                    tempFile = h.saveUploadedToTemp(resourcePath)
                    file_data = {"resourcePath":(resourceName, open(tempFile,"rb"))}
                keys = ["resourceAuthors","resourceLicense","resourceDesc",\
                "resourceName","resourceType"]
                for key in keys:
                    if request.params.get(key, None):
                        payload_data[key] = request.params.get(key)
                if not resourceUri:
                    resp = requests.post(durl, data=payload_data, cookies=cookie_jar,\
                     files = file_data)
                    FileRemove(tempFile)
                elif resourceUri:
                    payload_data.update({"resourceUri",resourceUri})
                    resp = requests.post(durl, data=payload_data, cookies=cookie_jar)
                resp_json = resp.json()
                if "response" in resp_json and resp_json["response"]:
                    resourceRevisionID = resp_json["response"]["revisions"][0]["id"]

            if not resourceRevisionID:
                resources = api.getResourcesByTypes(typeNames=['group system image'], ownerID=3,
                    getAll=False, sort=None, pageNum=0, pageSize=0)
                if resources.total > 0:
                    resourceRevisionID = resources.results[0].revisions[0].id

            group = None
            tx = utils.transaction(self.getFuncName())
            with tx as session:
                group, memberList = self._create(session, user, groupName, groupDescription, groupScope, groupType, roleDict, roleNameDict, resourceRevisionID=resourceRevisionID)

                if groupSubjects and not isPublicForum:
                    log.info("Adding Group Subjects")
                    groupSubjectsList = groupSubjects.split(',')
                    api._addOrUpdateGroupSubjects(session, groupID=group.id, subjects=groupSubjectsList)

                if groupGrades and not isPublicForum:
                    log.info("Adding Group Grades")
                    groupGradesList = groupGrades.split(',')
                    api._addOrUpdateGroupGrades(session, groupID=group.id, gradeIDs=groupGradesList)

                elif groupType in ['public-forum']:
                    api._addOrUpdateForumMetadata(session, groupID=group.id, tagLine=tagLine, taggedRole=taggedRole)

            if group:
                result['response']['group'] = group.asDict(obfuscateEmail=True)
                log.info('Group created successfully: %s' %(result['response']['group']))

                try:
                    ## Email notifications - turned on by default [
                    api.addGroupNotificationSetting(eventType='GROUP_MEMBER_JOINED', groupID=group.id, subscriberID=user.id)
                    api.addGroupNotificationSetting(eventType='GROUP_SHARE', groupID=group.id, subscriberID=user.id)
                    if group.groupType in ['public-forum']:
                        api.addGroupNotificationSetting(eventType='GROUP_PH_POST', groupID=group.id, subscriberID=user.id, notificationType='email', frequency='daily')
                    else:
                        api.addGroupNotificationSetting(eventType='GROUP_PH_POST', groupID=group.id, subscriberID=user.id, notificationType='email', frequency='instant')

                    ## In-app web notifications`
                    api.addGroupNotificationSetting(eventType='GROUP_MEMBER_JOINED_WEB', groupID=group.id, notificationType='web', frequency='ondemand')
                    api.addGroupNotificationSetting(eventType='GROUP_SHARE_WEB', groupID=group.id, notificationType='web', frequency='ondemand')
                    api.addGroupNotificationSetting(eventType='ASSIGNMENT_ASSIGNED_WEB', groupID=group.id, notificationType='web', frequency='ondemand')
                    api.addGroupNotificationSetting(eventType='ASSIGNMENT_DELETED_WEB', groupID=group.id, notificationType='web', frequency='ondemand')
                    api.addGroupNotificationSetting(eventType='GROUP_PH_POST_WEB', groupID=group.id, notificationType='web', frequency='ondemand')

                    kwargs = {}
                    kwargs['groupID'] = group.id
                    kwargs['ownerID'] = user.id
                    kwargs['objectID'] = group.id
                    kwargs['objectType'] = 'group'
                    kwargs['activityType'] = 'create'
                    #kwargs['activityData'] = json.dumps({'url': request.params.get('url')})
                    api.addGroupActivity(**kwargs)

                    api.createEventForType(typeName='GROUP_CREATE', objectID=group.id, objectType='group',
                        eventData=json.dumps({"url": request.params.get('url')}), ownerID=user.id, processInstant=False)
                except Exception, e:
                    log.error('create group Exception[%s]' % str(e))
                    log.error('create group Exception[%s] traceback' %(traceback.format_exc()))

                payload = {'groupID'        : group.id,
                           'groupType'      : group.groupType,
                           'role'           : 'groupadmin',
                           'memberID'       : user.id,
                           'name'           : group.name ,
                           'accessCode'     : group.accessCode,
                           'roleID'         : 15,
                           'currentUserID'  : user.id
                           }

                self.__updatePeerhelpGroupMemberAssociation('group/add/member', payload, QAInfo=True)

                if memberList:
                    result['response']['members'] = memberList

                return result
            else:
                c.errorCode = ErrorCodes.CANNOT_CREATE_GROUP
                return ErrorCodes().asDict(c.errorCode, 'Cannot createGroup possibly due to an already existing group with the same title')
        except ex.AlreadyExistsException, aee:
            c.errorCode = ErrorCodes.GROUP_ALREADY_EXISTS
            return ErrorCodes().asDict(c.errorCode, str(aee))
        except ex.InvalidArgumentException, iae:
            if c.errorCode == ErrorCodes.OK:
                c.errorCode = ErrorCodes.INVALID_ARGUMENT
            return ErrorCodes().asDict(c.errorCode, str(iae))
        except ex.MissingArgumentException, mae:
            c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
            return ErrorCodes().asDict(c.errorCode, str(mae))
        except ex.UnauthorizedException, uae:
            c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
            return ErrorCodes().asDict(c.errorCode, str(uae))
        except Exception, e:
            log.error('create group Exception[%s]' % str(e))
            log.error('create group Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.CANNOT_CREATE_GROUP
            return ErrorCodes().asDict(c.errorCode, 'Cannot createGroup possibly due to an already existing group with the same title')

    @d.jsonify()
    @d.checkAuth(request, False, False, ['bookID'])
    @d.trace(log, ['bookID'])
    def createEditingGroup(self, bookID):
        """
            Creates a new editing group.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            user = u.getCurrentUser(request)
            memberID = user.id
            roleDict, roleNameDict = g.getMemberRoles()
            tx = utils.transaction(self.getFuncName())
            with tx as session:
                book = api._getArtifactByID(session, id=bookID)
                if not book:
                    raise ex.InvalidArgumentException((_(u'Invalid book id, %(bookID)s.' % { 'bookID': bookID })).encode("utf-8"))

                from flx.controllers.artifact import bookTypes

                if book.type.name not in bookTypes:
                    raise ex.InvalidArgumentException((_(u'Invalid type of book id, %(bookID)s. Must be a book.' % { 'bookID': bookID })).encode("utf-8"))
                if book.creatorID != memberID:
                    raise ex.UnauthorizedException((_(u'Not the owner of book with id, %(bookID)s.' % { 'bookID': bookID })).encode("utf-8"))
                #
                #  For Editing Group, we currently only allow admin or
                #  content-admin to create, but in the future, we will
                #  relax it to everybody.
                #
                memberGroups = api._getMemberGroup(session, id=memberID, groupID=1)
                allowMember = False
                for mg in memberGroups:
                    if mg.role.name in ['content-admin', 'admin']:
                        allowMember = True
                        break
                if not allowMember:
                    raise ex.UnauthorizedException((_(u'You are not authorized to create editing group.')).encode("utf-8"))

                assigneeIDs = request.params.get('assigneeIDs', None)

                groupType = 'editing'
                groupName = 'Editing %s' % bookID
                groupHandle = '%s-Editing-%s' % (memberID, bookID)
                groupDescription = 'Group editing book %s' % bookID
                groupScope = 'closed'
                roleID = roleNameDict.get('ge-owner', None)
                group, memberList = self._create(session, user, groupName, groupDescription, groupScope, groupType, roleDict, roleNameDict, groupHandle=groupHandle, roleID=roleID, assigneeIDs=assigneeIDs, book=book)
                if not group:
                    raise Exception((_(u'Cannot createGroup possibly due to an already existing group with the same title.')).encode("utf-8"))
                #
                #  Add to owner's library with the "Collaboration" system label.
                #
                objectID = book.revisions[0].id
                objectType = 'artifactRevision'
                libObject = api._addObjectToLibrary(session, objectID, objectType, memberID, systemLabels=['Collaboration'], removeExisting=True, cache=ArtifactCache())
                log.debug('createEditingGroup: added library object[%s]' % libObject)
                #
                #  Flush so that membersCount will not be zero.
                #
                session.flush()
                result['response']['group'] = group.asDict(obfuscateEmail=True)
                if memberList:
                    result['response']['members'] = memberList
            log.info('createEditingGroup: Group created successfully: %s' %(result['response']['group']))
            return result
        except ex.AlreadyExistsException, aee:
            c.errorCode = ErrorCodes.GROUP_ALREADY_EXISTS
            return ErrorCodes().asDict(c.errorCode, str(aee))
        except ex.InvalidArgumentException, iae:
            if c.errorCode == ErrorCodes.OK:
                c.errorCode = ErrorCodes.INVALID_ARGUMENT
            return ErrorCodes().asDict(c.errorCode, str(iae))
        except ex.MissingArgumentException, mae:
            c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
            return ErrorCodes().asDict(c.errorCode, str(mae))
        except ex.UnauthorizedException, uae:
            c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
            return ErrorCodes().asDict(c.errorCode, str(uae))
        except Exception, e:
            log.error('createEditingGroup: create group Exception[%s]' % str(e))
            log.error('createEditingGroup: create group Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.CANNOT_CREATE_GROUP
            return ErrorCodes().asDict(c.errorCode, str(e))

    def __updatePeerhelpGroupMemberAssociation(self, rurl, payloadData, QAInfo=False):
        #Update group member information in peerhelp
        server = config.get('flx_peerhelp_api_server')
        peehelpClientID = config.get('peerhelp_client_id')
        rurl = '%s/%s' % (server, rurl)

        if QAInfo:
                enableQA = True
                allowAnonymous = False
                eventTypeDict,eventTypeNameDict = g.getEventTypes()
                typeID = eventTypeNameDict.get('GROUP_QA_STATUS')
                if typeID is None:
                    raise Exception((_(u'getGroupQAstatusInfo: Invalid type: GROUP_DISABLE_QA')))
                events = api.getEventsForObject(objectID=payloadData['groupID'], objectType='group', eventTypeIDs=[typeID])
                if events:
                    eventDict = events[0].asDict()
                    enableQA = eventDict.get('eventData').get('enableQA',True)
                    if isinstance(enableQA, list):
                        enableQA = enableQA[0]
                
                typeID = eventTypeNameDict.get('GROUP_QA_ANONYMOUS_PERMISSION')
                if typeID is None:
                    raise Exception((_(u'getGroupQAstatusInfo: Invalid type: GROUP_ALLOW_QA_ANONYMOUS_IDENTITY')))
                events = api.getEventsForObject(objectID=payloadData['groupID'], objectType='group', eventTypeIDs=[typeID])
                if events:
                    eventDict = events[0].asDict()
                    allowAnonymous = eventDict.get('eventData').get('allowAnonymous',False)
                payloadData.update({'enableQA' : enableQA, 'allowAnonymous' : allowAnonymous})

        issPasscode = config.get('iss_passcode') + str(payloadData['memberID']) + str(payloadData['groupID'])
        if len(issPasscode) % 8:
            # data block length must be multiple of eight
            issPasscode += 'X' * (8 - (len(issPasscode) % 8))

        payloadData.update({'clientID': peehelpClientID,
                            'secret': h.genURLSafeBase64Encode(Blowfish.new(config.get('iss_secret')).encrypt(issPasscode), usePrefix=False),
                            })

        status, data = self._call(rurl, method='POST', params=payloadData, fromReq=True)
        if status !=  ErrorCodes.OK:
            log.error('Unable to update peerhelp member group association: %s: %s' % (status, data))

    def _getGroupHandleFromBook(self, bookID=None):
        log.debug('_getGroupHandleFromBook: bookID[%s]' % bookID)
        if not bookID:
            groupHandle = request.params.get('groupHandle', None)
        else:
            book = api.getArtifactByID(id=bookID)
            if not book:
                raise ex.InvalidArgumentException((_(u'Invalid book id, %(bookID)s.' % { 'bookID': bookID })).encode("utf-8"))
            groupHandle = '%s-Editing-%s' % (book.creatorID, bookID)
        log.debug('_getGroupHandleFromBook: groupHandle[%s]' % groupHandle)
        return groupHandle

    @d.jsonify()
    @d.checkAuth(request, True, False, ['bookID', 'state'])
    @d.trace(log, ['bookID', 'state'])
    def update(self, bookID=None, state=None):
        """
            Updates group name and description.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            user = u.getCurrentUser(request)
            memberID = user.id
            groupID = request.params.get('groupID')
            groupHandle = self._getGroupHandleFromBook(bookID=bookID)
            log.debug('update: groupHandle[%s]' % groupHandle)
            newGroupName = request.params.get('newGroupName', None)
            newGroupDesc = request.params.get('newGroupDesc', None)
            groupType = request.params.get('groupType', 'class')
            groupScope = request.params.get('groupScope', 'closed')
            log.debug('update: state[%s]' % state)
            if not state:
                isActive = request.params.get('isActive', None)
                if isActive:
                    isActive = isActive.lower() == 'true'
            else:
                isActive = state.lower() == 'on'
            log.debug('update: isActive[%s]' % isActive)
            isQAActivity = request.params.get('isQAActivity', 'false').lower() == 'true'
            isVisible = request.params.get('isVisible', None)
            groupSubjects = request.params.get('groupSubjects', '')
            groupGrades = request.params.get('groupGrades', '')
            tagLine = request.params.get('tagLine', None)
            taggedRole = request.params.get('taggedRoles', None)
            resourceType = request.params.get('resourceType', None)
            resourceName = request.params.get('resourceName', None) 
            resourcePath = request.params.get('resourcePath', None)
            resourceUri = request.params.get('resourceUri', None)

            if groupScope == 'closed':
                doGenCode = request.params.get('doGenCode', False)
            else:
                doGenCode = False

            resourceRevisionID = request.params.get('resourceRevisionID')
            if not ((groupID or groupHandle) and (state or newGroupName or isQAActivity or isVisible)):
                c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
                msg = 'Required parameters are empty.'
                return ErrorCodes().asDict(c.errorCode, msg)

            tx = utils.transaction(self.getFuncName())
            with tx as session:
                isSuperAdmin = api._isGroupAdmin(session, groupID=1, memberID=memberID) or u.isMemberAdmin(user, session=session)

                kwargs = {}
                if isSuperAdmin and isVisible:
                    kwargs['isVisible'] = isVisible.lower() == 'true'
                elif not isSuperAdmin and isVisible:
                    c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
                    return ErrorCodes().asDict(c.errorCode, "Only admin can change group visibility.")

                group = None
                if groupID:
                    group = api._getGroupByID(session, id=groupID, onlyActive=False)
                elif groupHandle:
                    group = api._getGroupByHandle(session, handle=groupHandle, onlyActive=False)

                if group is None:
                    c.errorCode = ErrorCodes.NO_SUCH_GROUP
                    msg = 'No such group.'
                    return ErrorCodes().asDict(c.errorCode, msg)

                isAdmin = api._isGroupAdmin(session, groupID=group.id, memberID=memberID)
                if not isAdmin and not isSuperAdmin and not isQAActivity:
                    raise Exception('Only Admin can update a group.')

                if isActive is not None:
                    kwargs['isActive'] = isActive

                if newGroupName and group.name != newGroupName:
                    res = api._getGroupByNameAndCreator(session, groupName=newGroupName, creatorID=memberID)
                    if res:
                        c.errorCode = ErrorCodes.GROUP_ALREADY_EXISTS
                        msg = 'Cannot update group. Group with same name already exists for this user.'
                        return ErrorCodes().asDict(c.errorCode, msg)

                if newGroupName and group.name != newGroupName:
                    res = api._getGroupByNameAndCreator(session, groupName=newGroupName, creatorID=memberID)
                    if res:
                        c.errorCode = ErrorCodes.GROUP_ALREADY_EXISTS
                        msg = 'Cannot update group. Group with same name already exists for this user.'
                        return ErrorCodes().asDict(c.errorCode, msg)

                kwargs['group'] = group
                api._updateGroup(session, **kwargs)
                result['response']['group'] = group.asDict(obfuscateEmail=True)

            if resourceType is not None and resourceName is not None and \
                    (resourcePath is not None or resourceUri is not None) and \
                    not resourceRevisionID:
                payload_data = dict()
                http = Http(fromReq=True)
                cookie_jar = CookieJar()
                cookie_jar = http._restoreCookiesFromSession(cj=cookie_jar)
                durl_prefix = urljoin(config.get('flx_prefix_url'), config.get('instance'))
                durl = durl_prefix + "/create/resource"
                if resourcePath is not None:
                    tempFile = h.saveUploadedToTemp(resourcePath)
                    file_data = {"resourcePath":(resourceName, open(tempFile,"rb"))}
                keys = ["resourceAuthors","resourceLicense","resourceDesc",\
                "resourceName","resourceType"]
                for key in keys:
                    if request.params.get(key, None):
                        payload_data[key] = request.params.get(key)
                if not resourceUri:
                    resp = requests.post(durl, data=payload_data, cookies=cookie_jar,\
                     files = file_data)
                    FileRemove(tempFile)
                elif resourceUri:
                    payload_data.update({"resourceUri",resourceUri})
                    resp = requests.post(durl, data=payload_data, cookies=cookie_jar)
                resp_json = resp.json()
                if "response" in resp_json and resp_json["response"]:
                    resourceRevisionID = resp_json["response"]["revisions"][0]["id"]

            kwargs['group'] = group
            #kwargs['creator'] = user
            kwargs['newGroupName'] = newGroupName
            kwargs['newGroupDesc'] = newGroupDesc
            kwargs['groupType'] = groupType
            kwargs['groupScope'] = groupScope
            kwargs['doGenCode'] = doGenCode
            kwargs['isQAActivity'] = isQAActivity
            kwargs['resourceRevisionID'] = resourceRevisionID
            group = None
            resource_info = dict()
            tx = utils.transaction(self.getFuncName())
            with tx as session:
                group = api._updateGroup(session, **kwargs)

                if groupType not in ['public-forum']:
                    log.info("Adding Group Subjects")
                    groupSubjectsList = groupSubjects.split(',')
                    api._addOrUpdateGroupSubjects(session, groupID=group.id, subjects=groupSubjectsList)

                    log.info("Adding Group Grades")
                    groupGradesList = groupGrades.split(',')
                    api._addOrUpdateGroupGrades(session, groupID=group.id, gradeIDs=groupGradesList)
                elif groupType in ['public-forum']:
                    api._addOrUpdateForumMetadata(session, groupID=group.id, tagLine=tagLine, taggedRole=taggedRole)

                if resourceRevisionID:
                    new_resource_revision = api._getResourceRevisionByID(session,id=resourceRevisionID)
                    dct = new_resource_revision.resource.asDict()
                    resource_info['resource'] = {}
                    resource_info['resource']['id'] = dct['resourceRevisionID']
                    resource_info['resource']['uri'] = dct.get('satelliteUrl', dct.get('uri'))

            result['response']['group'] = group.asDict(obfuscateEmail=True)
            if resource_info and 'resource' in result['response']['group']:
                result['response']['group']['resource'] = resource_info['resource']
            log.info('Group updated successfully: %s' %(result['response']['group']))
            return result
        except Exception, e:
            log.error('update group Exception[%s]' % str(e))
            log.error('update group Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.CANNOT_UPDATE_GROUP
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, True, False, ['bookID'])
    @d.trace(log, ['bookID'])
    def delete(self, bookID=None):
        """
            Deletes a group.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            user = u.getCurrentUser(request)
            memberID = user.id
            kwargs = {}
            groupID = request.params.get('groupID', None)
            groupHandle = self._getGroupHandleFromBook(bookID=bookID)

            if not (groupID or groupHandle):
                c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
                msg = 'Required parameters are empty.'
                return ErrorCodes().asDict(c.errorCode, msg)

            group = None
            tx = utils.transaction(self.getFuncName())
            with tx as session:
                if groupID:
                    group = api._getGroupByID(session, id=groupID, onlyActive=False)
                elif groupHandle:
                    group = api._getGroupByHandle(session, handle=groupHandle, onlyActive=False)

                if not group:
                    c.errorCode = ErrorCodes.NO_SUCH_GROUP
                    raise ex.InvalidArgumentException((_(u'No such group.')).encode("utf-8"))

                kwargs['group'] = group
                kwargs['memberID'] = memberID
                isAdmin = api._isGroupAdmin(session, groupID=group.id, memberID=memberID)
                isSuperAdmin = api._isGroupAdmin(session, groupID=1, memberID=memberID) or u.isMemberAdmin(user, session=session)
                if not isAdmin and not isSuperAdmin:
                    c.errorCode = ErrorCodes.AUTHENTICATION_REQUIRED
                    raise ex.UnauthorizedException((_(u'Only admin can delete a group.')).encode("utf-8"))

                if group.groupType in ['editing']:
                    #
                    #  Remove from library.
                    #
                    objectType = 'artifactRevision'
                    book = api._getArtifactByID(session, id=bookID)
                    if not book:
                        raise ex.InvalidArgumentException((_(u'Invalid book id, %(bookID)s.' % { 'bookID': bookID })).encode("utf-8"))
                    revisions = book.revisions
                    for revision in revisions:
                        objectID = revision.id
                        try:
                            api._deleteMemberLibraryObjectHasLabel(session, objectID, objectType, memberID, 'Collaboration', True)
                            break
                        except Exception:
                            pass

                    res = api._deleteGroup(session, **kwargs)
                else:
                    res = api._softDeleteGroup(session, **kwargs)
                    """
                        Comment out the following to keep the assignments
                        and practice results.

                    from flx.controllers.common import ArtifactCache

                    assignments = api._getAssignments(session, groupID=group.id)
                    for assignment in assignments:
                        api.deleteAssignment(session, memberID, assignment, deleteStudyTrack=False, cache=ArtifactCache())
                    """

            log.info('Group deleted successfully: %s' % res)
            result['response']['group'] = res
            return result
        except Exception, e:
            log.error('delete group Exception[%s]' % str(e))
            log.error('delete group Exception[%s] traceback' %(traceback.format_exc()))
            if c.errorCode == ErrorCodes.OK:
                c.errorCode = ErrorCodes.CANNOT_DELETE_GROUP
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, False, ['bookID'])
    @d.trace(log,['member', 'bookID'])
    def getEditingGroup(self, member, bookID):
        """
            Returns group info.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            groupHandle = self._getGroupHandleFromBook(bookID=bookID)
            group = api.getGroupByHandle(handle=groupHandle)
            log.debug('getEditingGroup: group[%s]' % group)
            if not group:
                groupInfo = {}
            else:
                """
                #
                #  Allow anyone to see the group info.
                #
                gms = member.groupRoles
                authorized = False
                for gm in gms:
                    if gm.groupID == group.id and gm.role.name == 'ge-owner':
                        authorized = True
                        break
                if not authorized:
                    isSuperAdmin = api.isGroupAdmin(groupID=1, memberID=member.id) or u.isMemberAdmin(member)
                    if not isSuperAdmin:
                        c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
                        return ErrorCodes().asDict(c.errorCode, 'Only admin can view group.')
                """
                groupInfo = group.asDict(includeMembers=True)
            result['response']['group'] = groupInfo

            bf = api.getBookFinalization(bookID=bookID)
            if bf:
                result['response']['finalization'] = bf.asDict()
            return result
        except Exception, e:
            log.error('get group Exception[%s]' % str(e))
            log.error('get group Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.NO_SUCH_GROUP
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, False, ['id'])
    @d.trace(log,['id'])
    def getGroupByID(self,id):
        """
            Returns group info.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            user = u.getCurrentUser(request)
            groupId = id
            group = api.getGroupByID(id=groupId)
            if not group:
                groupInfo = {}
            else:
                groupInfo = group.asDict()
                assignmentsCount = api.getGroupAssignmentsCount(group.id)
                groupInfo.update(dict(assignmentsCount=assignmentsCount))
                isAdmin = api.isGroupAdmin(groupID=group.id, memberID=user.id)
                isSuperAdmin = api.isGroupAdmin(groupID=1, memberID=user.id) or u.isMemberAdmin(user)
                if not isAdmin and not isSuperAdmin:
                    groupInfo.pop('accessCode')
            result['response']['group'] = groupInfo
            log.info('RESP: %s'%result)
            return result
        except Exception, e:
            log.error('get group Exception[%s]' % str(e))
            log.error('get group Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.NO_SUCH_GROUP
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log)
    def get(self):
        """
            Returns group info.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            groupID = request.params.get('groupID')
            groupHandle = request.params.get('groupHandle')
            groupName = request.params.get('groupName')
            accessCode = request.params.get('accessCode')

            if groupID:
                group = api.getGroupByID(id=groupID)
            elif groupHandle:
                group = api.getGroupByHandle(handle=groupHandle)
            elif groupName and accessCode:
                group = api.getGroupByNameAccessCode(groupName=groupName, accessCode=accessCode)
            else:
                raise Exception('Expected Group ID or access code or group name, received None')

            if group:
                groupInfo = group.asDict(obfuscateEmail=True)
                assignmentsCount = api.getGroupAssignmentsCount(group.id)
                groupInfo.update(dict(assignmentsCount=assignmentsCount))
            else:
                c.errorCode = ErrorCodes.NO_SUCH_GROUP
                return ErrorCodes().asDict(c.errorCode, "Group doesn't exist")

            #Check if user is signed-in, if not and group type is not 'public-forum', return error
            user = u.getCurrentUser(request, anonymousOkay=False, autoLogin=True)
            isPublicForum = group.groupType in ['public-forum']
            if not isPublicForum and not user:
                errorCode = ErrorCodes.AUTHENTICATION_REQUIRED
                return ErrorCodes().asDict(errorCode,
                                                'Authentication required')

            isMember = isAdmin = isSuperAdmin = False
            if user:
                isMember = api.isGroupMember(groupID=group.id, memberID=user.id)
                isAdmin = api.isGroupAdmin(groupID=group.id, memberID=user.id)
                isSuperAdmin = api.isGroupAdmin(groupID=1, memberID=user.id) or u.isMemberAdmin(user)

            if not isMember and not isSuperAdmin and not isPublicForum:
                c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
                return ErrorCodes().asDict(c.errorCode, "You are not a member of this group")

            if not isAdmin and not isSuperAdmin and not isPublicForum:
                groupInfo.pop('accessCode')
            #Adding code to get Q&A enable/disable and allow/deny anonymous identity
            QAstatus ={
                   'enableQA': True,
                   'allowAnonymous': False
                   }
            eventTypeDict,eventTypeNameDict = g.getEventTypes()
            typeID = eventTypeNameDict.get('GROUP_QA_STATUS')
            if typeID is None:
                raise Exception((_(u'getGroupQAstatusInfo: Invalid type: GROUP_DISABLE_QA')))
            events = api.getEventsForObject(objectID=groupID, objectType='group', eventTypeIDs=[typeID])
            if events:
                eventDict = events[0].asDict()
                QAstatus['enableQA'] = eventDict.get('eventData').get('enableQA',True)

            typeID = eventTypeNameDict.get('GROUP_QA_ANONYMOUS_PERMISSION')
            if typeID is None:
                raise Exception((_(u'getGroupQAstatusInfo: Invalid type: GROUP_ALLOW_QA_ANONYMOUS_IDENTITY')))
            events = api.getEventsForObject(objectID=groupID, objectType='group', eventTypeIDs=[typeID])
            if events:
                eventDict = events[0].asDict()
                QAstatus['allowAnonymous'] = eventDict.get('eventData').get('allowAnonymous',False)
            groupInfo.update(QAstatus)

            result['response']['group'] = groupInfo
            result['response']['isMember'] = isMember

            return result
        except Exception, e:
            log.error('get group Exception[%s]' % str(e))
            log.error('get group Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.NO_SUCH_GROUP
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request)
    @d.sortable(request, ['fq', 'pageNum', 'pageSize', 'sort'])
    @d.filterable(request, ['sort'], noformat=True)
    @d.setPage(request, ['fq', 'sort'])
    @d.trace(log, ['fq', 'pageNum', 'pageSize', 'sort'])
    def getAll(self,fq, pageNum, pageSize, sort):
        """
            Returns group info.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        #group_name = request.params.get('groupName')
        try:
            user = u.getCurrentUser(request)
            isSuperAdmin = api.isGroupAdmin(groupID=1, memberID=user.id) or u.isMemberAdmin(user)
            if not isSuperAdmin:
                raise Exception('Not authorized to view all groups')
            groupName = request.params.get('groupName')
            search_str = request.params.get('search', None)
            isHidden = request.params.get('isHidden',0)
            searchDict = {}
            if search_str is not None:
                if len(search_str) > 0:
                    for typeFilter in search_str.split(';'):
                        filterFld, filterVal = typeFilter.split(',')
                        if filterFld == 'creatorID':
                            searchDict[filterFld] = filterVal.split(' ')
                        else:
                            searchDict[filterFld] = filterVal
            groups = api.getGroups(pageNum=pageNum, pageSize=pageSize, groupName=groupName, filters=fq, searchDict=searchDict, sort=sort, isHidden=isHidden)
            groupInfo = []
            for eachGroup in groups:
                groupInfo.append(eachGroup.asDict())
            result['response']['group'] = groupInfo
            result['response']['total'] = groups.total
            return result
        except Exception, e:
            log.error('get groups Exception[%s]' % str(e))
            log.error('get groups Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.NO_SUCH_GROUP
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.sortable(request, ['fq', 'pageNum', 'pageSize', 'sort'])
    @d.filterable(request, ['sort'], noformat=True)
    @d.setPage(request, ['fq', 'sort'])
    @d.trace(log, ['fq', 'pageNum', 'pageSize', 'sort'])
    def getAllForums(self,fq, pageNum, pageSize, sort):
        """
            Returns all forums info.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            user = u.getCurrentUser(request)
            groupType = 'public-forum'
            fq = (('groupType', groupType), ('isVisible', True))
            taggedRole = request.params.get('taggedRoles', '').split(',')
            for eachTaggedRole in taggedRole:
                fq = fq + tuple([('taggedRole', eachTaggedRole)])

            @d.ck12_cache_region('short_term')
            def getForumDetails(pageNum, pageSize, filters, sort):
                groups = api.getGroups(pageNum=1, pageSize=0, filters=filters, sort=sort)
                # Bug 52188: Ordered list for forums
                fourmsSequence = self._get_forums_sequence(forumsCache=True)
                groups.results = sorted(groups.results, key=lambda g: fourmsSequence.get(g.id, 9999))
                if pageNum and pageSize:
                    if pageSize > 0:
                        groups.results = groups.results[(pageNum-1) * pageSize: (
                            (pageNum-1) * pageSize) + pageSize]
                groupInfo = []
                for eachGroup in groups:
                    groupDict = eachGroup.asDict(obfuscateEmail=True)
                    groupInfo.append(groupDict)

                return groupInfo, groups.total

            groupInfo, total = getForumDetails(pageNum=pageNum, pageSize=pageSize, filters=fq, sort=sort)
            s = datetime.now()
            memberOfGroups = {}
            if user:
                groupIDs = [ x['id'] for x in groupInfo ]
                memberOfGroups = api.checkGroupsMembershipForMember(groupIDs=groupIDs, memberID=user.id)
            for grpInfo in groupInfo:
                grpInfo['isMember'] = memberOfGroups.has_key(int(grpInfo['id']))
            log.info("Time for loop: %s" % (datetime.now() - s))
            result['response']['group'] = groupInfo
            result['response']['total'] = total
            result['response']['limit'] = len(groupInfo)
            result['response']['offset'] = (pageNum-1) * pageSize

            return result
        except Exception, e:
            log.error('get forums Exception[%s]' % str(e))
            log.error('get forums Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.NO_SUCH_GROUP
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.ck12_cache_region('forever',
                         invalidation_key='ck12-forums-sequence-cache')
    def _get_forums_sequence(self, **kwargs):
        # Bug 52188: Ordered list for forums
        from flx.model.mongo import getDB as getMongoDB
        forums_seq = ForumsSequence(getMongoDB(config)).getForumsSequence()
        seq = {}
        for each_seq in forums_seq:
            seq[each_seq.get('forum_id')] = each_seq.get('sequence')

        return seq

    @d.jsonify()
    @d.checkAuth(request)
    @d.sortable(request, ['member'])
    @d.filterable(request, ['member', 'sort'], noformat=True)
    @d.setPage(request, ['member', 'fq', 'sort'])
    @d.trace(log, ['member', 'fq', 'pageNum', 'pageSize', 'sort'])
    def getmy(self, member, fq, pageNum, pageSize, sort=None):
        """
            Returns group info.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        addActivity = request.params.get('activity', 'false')
        addActivity = addActivity if addActivity == 'true' else False
        activityPageSize = request.params.get('activityPageSize', 2)
        newAssignmentCheck = request.params.get('newAssignmentCheck')
        newAssignmentCheck = newAssignmentCheck if newAssignmentCheck == 'true' else False
        member = u.getImpersonatedMember(member)

        groupTypes = request.params.get('groupType', request.params.get('groupTypes', 'class,study'))
        groupTypes = groupTypes.split(",")
        #
        #  LMS related if appID is given.
        #
        appID = request.params.get('appID', None)
        log.debug('getmy: appID[%s]' % appID)
        externalID = pylons_session.get('externalID',None)
        appName = request.params.get('appName', appID)
        log.debug('getmy: appName[%s]' % appName)

        try:
            tx = utils.transaction(self.getFuncName())
            with tx as session:
                if not appID:
                    groups = api._getGroupsByMemberID(session, \
                                                      memberID=member.id, \
                                                      lmsAppID=None, \
                                                      groupTypes=groupTypes, \
                                                      pageNum=pageNum, \
                                                      pageSize=pageSize, \
                                                      fq=fq, \
                                                      sort=sort)
                else:
                    lmsManager = self.getLMSInstance(appID, txSession=session)
                    policyDict = lmsManager.policyDict
                    groupIDs = lmsManager._getMyLMSGroups(member)

                    if not groupIDs:
			#accessToken = pylons_session.get(appName)
			lmsCookieName = '%s%s' % (config.get('lms_cookie_prefix'), policyDict['api_key'])
			log.debug('getmy: lmsCookieName[%s]' % lmsCookieName)
			accessToken = request.cookies.get(lmsCookieName)
			_authType = pylons_session.get('authType', None)
			log.debug('getmy: pre _authType[%s]' % _authType)
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
			userToken = pylons_session.get('userToken')
			if not userToken:
			    #
			    #  Get the data from auth.
			    #
			    loginCookie = config.get('ck12_login_cookie')
			    cookie = request.cookies.get(loginCookie)
			    user = u.getInfoFromAuth(request, login_cookie=loginCookie, cookie=cookie, save=True, appName=appName, txSession=session)
			    log.debug("getmy: user %s" % user)
			    if user:
				#accessToken = pylons_session.get(appName)
				#accessToken = request.cookies.get(lmsCookieName)
				#accessToken = Blowfish.new(config.get('lms_secret')).decrypt(h.genURLSafeBase64Decode(accessToken, hasPrefix=False)).rstrip(' ') if config.get('lms_secret') else h.genURLSafeBase64Decode(accessToken, hasPrefix=False)
				if not userToken:
				    userToken = pylons_session.get('userToken')
			    if not user or not userToken:
				raise Exception((_(u'Authentication problem')).encode('utf8'))
			#
			#  Get group information from the LMS for this user.
			#
			lgs = []
			if _authType == "edmodoconnect":
			    edmodoconn = edmodoconnect(access_token=accessToken)
			    groups = edmodoconn.getUserEdmodoGroups()
			    log.debug("_getMyLMSGroups: (edmodo connect) lgs[%s]" % groups)
			    lgs = json.loads(groups)
			else:
			    getGroupsUrl = '%s%s?api_key=%s&access_token=%s&user_token=%s' % (policyDict['url'], policyDict['getUserGroups'], policyDict['api_key'], accessToken, userToken)
			    log.debug('getmy: getGroupsUrl[%s]' % getGroupsUrl)
			    lgs = self._call(getGroupsUrl, method='GET', external=True)
			log.debug('getmy: lgs[%s]' % lgs)
			if type(lgs) != list:
			    message = str(lgs)
			    if type(lgs) == dict:
				if lgs.get('error'):
				    message = lgs.get('error')
				    if type(message) == dict:
					if message.get('message'):
					    message = message.get('message')
			    raise Exception((_(u'Unable to get group information from LMS partner: %s' % message)).encode('utf8'))
			providerID = lmsManager.providerID

			lgDict = {}
			for lg in lgs:
                            # Make sure group_id key is in dict. In the case of edmodo connect we add it here.
                            if 'group_id' not in lg:
                                lg['group_id'] = lg['id']
			    lmsGroupID = lg['group_id']
			    lgDict[str(lmsGroupID)] = lg
			log.debug('getmy: lgDict[%s]' % lgDict)
			#
			#  Associate the  missing groups, if any, with this user.
			#
			lmsGroupMembers = api._getLMSProviderGroupMembers(session,
									  providerID=providerID,
									  providerMemberID=userToken)
			log.debug('getmy: lmsGroupMembers[%s]' % lmsGroupMembers)
			if not lmsGroupMembers:
			    #
			    #  Since students do not call the install API, perform the LMS setup here.
			    #
			    # Felix: Made a change here. No longer using userToken, now using externalID which is memberID
			    # for user on Edmodo. This change is for Edmodo Connect, which does not use userTokens
			    lmsManager._setupLMSInfo(session, providerID, appID, policyDict, externalID, accessToken, lgs=lgs)
			    session.flush()

			groupIDs = []
			for lmsGroupMember in lmsGroupMembers:
			    lg = lgDict.get(lmsGroupMember.providerGroupID, None)
			    log.debug('getmy: lg[%s]' % lg)
			    if not lg:
				#
				#  The group is not for this app.
				#
				continue

			    lmsGroupID = lg['group_id']
			    lmsGroups = api._getLMSProviderGroups(session, appID=appID, providerGroupID=lmsGroupID)
			    if not lmsGroups:
				#
				#  The group is not for this app.
				#
				continue

			    lmsGroup = lmsGroups[0]
			    log.debug('getmy: lmsGroup[%s]' % lmsGroup)
			    lmsOwners = lg['owners']
			    isOwner = False
			    #TODO: Since there may be some group owners with userToken we need to check for both
			    # Check for externalID first since the userToken is depreciated by Edmdo
			    # Eventually we can remove this after converting userTokens to externalID in all DBs
			    log.debug('getmy: userToken[%s]' % userToken)
			    log.debug('getmy: externalID[%s]' % externalID)
			    for lmsOwner in lmsOwners:
				log.debug('getmy: lmsOwner[%s]' % lmsOwner)
				if type(lmsOwner).__name__ == 'dict':
				    lmsOwner = lmsOwner['id']
				    log.debug('getmy: lmsOwner[%s]' % lmsOwner)
				if str(externalID) == str(lmsOwner):
				    isOwner = True
				elif userToken == lmsOwner:
				    isOwner = True
				    break
			    name = appID
			    groupName = '%s: %s %s' % (name, lmsGroup.providerGroupID, lmsGroup.title)
			    log.debug('getmy: groupName[%s]' % groupName)
			    if not lmsGroup.groupID:
				group = None
			    else:
				group = api._getGroupByID(session, id=lmsGroup.groupID)
			    #log.debug("getmy: isOwner [%s]"%isOwner)
			    #log.debug("getmy: group [%s]"%group)
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
				group = api._createGroup(session, groupName=groupName, creator=member, groupType='class', origin='lms')
				lmsGroup.groupID = group.id
				session.add(lmsGroup)
				session.flush()
				log.debug('getmy: associated new group[%s] to lmsGroup[%s]' % (group, lmsGroup))

			    groupIDs.append(group.id)

			    if not api._isGroupMember(session, groupID=group.id, memberID=member.id):
				groupMember = api._addMemberToGroup(session, group=group, memberID=member.id, isAdmin=isOwner)
				log.debug('getmy: create groupMember[%s]' % groupMember)
				self._retrieveScores(session, groupID=group.id, memberID=member.id)

			    if not lmsGroupMember.memberID:
				lmsGroupMember.memberID = member.id
				session.add(lmsGroupMember)
				log.debug('getmy: associated lmsGroupMember[%s]' % lmsGroupMember)
				session.flush()

                    log.debug('getmy: groupIDs%s' % groupIDs)
                    if not groupIDs:
                        groups = []
                    else:
                        groups = api._getGroupsByMemberID(session, \
                                                          memberID=member.id, \
                                                          groupIDs=groupIDs, \
                                                          lmsAppID=appID, \
                                                          groupTypes=groupTypes, \
                                                          pageNum=pageNum, \
                                                          pageSize=pageSize, \
                                                          fq=fq, \
                                                          sort=sort)
                    log.debug('getmy: groups%s' % groups)

                groupsList = []
                for group in groups:
                    _group = group.Group.asDict(obfuscateEmail=True)
                    _group['roleID'] = group.roleID
                    _group['role'] = group.role
                    _group['statusID'] = group.statusID
                    _group['status'] = group.status
                    if newAssignmentCheck:
                        _group['hasNewAssignment'] = api._hasNewAssignment(session, group.Group.id)
                    if addActivity:
                        fq = [('excludeActivityTypes','leave,create')]
                        activities = api._getGroupActivity(session, group=group.Group, pageNum=1, pageSize=activityPageSize, fq=fq)
                        _activities = []
                        for activity in activities:
                            if activity:
                                _activity = activity.asDict()
                                owner = api._getMemberByID(session, activity.ownerID)
                                if owner:
                                    _activity['owner'] = owner.asDict(obfuscateEmail=True)
                                _activity.update(self.__loadActivityData(activity, session=session))
                                _activities.append(_activity)
                        _group['activities'] = _activities

                    #Adding code to get Q&A enable/disable and allow/deny anonymous identity
                    QAstatus ={
                           'enableQA': True,
                           'allowAnonymous': False
                           }
                    eventTypeDict, eventTypeNameDict = g.getEventTypes(session=session)

                    typeID = eventTypeNameDict.get('GROUP_QA_STATUS')
                    if typeID is None:
                        raise Exception((_(u'getGroupQAstatusInfo: Invalid type: GROUP_DISABLE_QA')))
                    events = api._getEvents(session, objectID=_group['id'], objectType='group', eventTypeIDs=[typeID])
                    if events:
                        eventDict = events[0].asDict()
                        QAstatus['enableQA'] = eventDict.get('eventData').get('enableQA',True)

                    typeID = eventTypeNameDict.get('GROUP_QA_ANONYMOUS_PERMISSION')
                    if typeID is None:
                        raise Exception((_(u'getGroupQAstatusInfo: Invalid type: GROUP_ALLOW_QA_ANONYMOUS_IDENTITY')))
                    events = api._getEvents(session, objectID=_group['id'], objectType='group', eventTypeIDs=[typeID])
                    if events:
                        eventDict = events[0].asDict()
                        QAstatus['allowAnonymous'] = eventDict.get('eventData').get('allowAnonymous',False)
                    _group.update(QAstatus)

                    if not (_group['statusID'] == 3 or _group['statusID'] == 4):
                        groupsList.append(_group)
                result['response']['groups'] = groupsList
                result['response']['total'] = groups.getTotal() if groupsList else 0
                result['response']['limit'] = len(groups)
                result['response']['offset'] = (pageNum - 1) * pageSize
                log.debug('User with memberID: [%s] belongs to Groups: [%s]' %(member.id, result['response']['groups']))
            return result
        except Exception, e:
            log.error('getmy Exception[%s]' % str(e))
            log.error('getmy Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.NO_SUCH_GROUP
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log)
    def details(self):
        """
            Returns group details.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            user = u.getCurrentUser(request)
            #groupName = request.params.get('groupName')
            groupID = request.params.get('groupID')
            groupHandle = request.params.get('groupHandle')
            #accessCode = request.params.get('accessCode')
            pageNum = pageSize = 0
            fq = []
            group = None
            if groupID:
                group = api.getGroupByID(id=groupID)
            elif groupHandle:
                group = api.getGroupByHandle(handle=groupHandle)
            if not group:
                raise Exception('Group with id %s or handle: %s does not exist' %(groupID, groupHandle))
            groupInfo = group.asDict()
            member_list = []
            isAdmin = api.isGroupAdmin(groupID=group.id, memberID=user.id)
            isSuperAdmin = api.isGroupAdmin(groupID=1, memberID=user.id) or u.isMemberAdmin(user)
            if not isAdmin and not isSuperAdmin:
                groupInfo.pop('accessCode')
            else:
                group_members = api.getGroupMembers(group=group, pageNum=pageNum, pageSize=pageSize, fq=fq)
                for each_member in group_members:
                    memberEmail = each_member.member_info.email
                    emailID, domain = memberEmail.split('@', 1) if '@' in memberEmail else ['******', 'enc.ck12.org']
                    email = emailID[:3] + '*'*(len(emailID) - 3) + '@' + domain
                    try:
                        h.safe_decode(email)
                    except UnicodeDecodeError:
                        email = '******@enc.ck12.org'

                    mem_info = {}
                    mem_info['name'] = each_member.member_info.fix().name
                    mem_info['email'] = email
                    mem_info['id'] = each_member.memberID
                    mem_info['groupMemberRoleID'] = each_member.roleID
                    mem_info['groupMemberRole'] = each_member.role.name
                    mem_info['statusID'] = each_member.statusID
                    mem_info['status'] = each_member.status.name
                    mem_info['userRole'] = each_member.member_info.systemRoles[0].role.name
                    mem_info['userRoleID'] = each_member.member_info.systemRoles[0].roleID
                    member_list.append(mem_info)
            result['response']['group'] = groupInfo
            result['response']['group']['members'] = member_list
            return result
        except Exception, e:
            log.error('get group Exception[%s]' %(e))
            log.error('get group Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.NO_SUCH_GROUP
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    #@d.checkAuth(request)
    @d.sortable(request, ['fq', 'pageNum', 'pageSize', 'sort'])
    @d.filterable(request, ['fq', 'pageNum', 'pageSize', 'sort'], noformat=True)
    @d.setPage(request, ['fq', 'pageNum', 'pageSize', 'sort'])
    @d.trace(log, ['fq', 'pageNum', 'pageSize', 'sort'])
    def members(self, fq, pageNum, pageSize, sort=None):
        """
            Returns members of a group.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            groupID = request.params.get('groupID')
            groupHandle = request.params.get('groupHandle')
            getCounts = request.params.get('getCounts', False)
            if getCounts:
                getCounts = getCounts.lower() in ['true', 'yes']
            allowSuperAdmin = request.params.get('allowSuperAdmin', False)
            providerAppName = request.params.get('providerAppName', request.params.get('partnerAppName'))

            user = u.getCurrentUser(request, anonymousOkay=False, autoLogin=True)

            group = None
            if groupID:
                group = api.getGroupByID(id=groupID)
            elif groupHandle:
                group = api.getGroupByHandle(handle=groupHandle)
            if not group:
                raise Exception('Group with id %s or handle: %s does not exist' %(groupID, groupHandle))

            #Allow Anonymous users to view members of forum
            isPublicForum = group.groupType in ['public-forum']

            if not isPublicForum and not user:
                errorCode = ErrorCodes.AUTHENTICATION_REQUIRED
                return ErrorCodes().asDict(errorCode,
                                           'Authentication required')

            isMember = isSuperAdmin = False
            if user:
                isMember = api.isGroupMember(groupID=group.id, memberID=user.id)
                if allowSuperAdmin:
                    isSuperAdmin = api.isGroupAdmin(groupID=1, memberID=user.id) or u.isMemberAdmin(user)

            if not isMember and not isSuperAdmin and not isPublicForum:
                c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
                return ErrorCodes().asDict(c.errorCode, "You are not a member of this group")

            memberRoleDict, memberRoleNameDict = g.getMemberRoles()
            group_members = api.getGroupMembers(group=group, providerAppName=providerAppName, pageNum=pageNum, pageSize=pageSize, fq=fq, sort=sort)
            memberIDs = [each_member.memberID for each_member in group_members]
            mRoles = []
            studentDict = {}
            if memberIDs:
                mRoles = api.getMemberRolesByMemberIDs(memberIDs)
                if user and user.id == group.creatorID:
                    tsrels = api.getTeacherStudentRelations(teacherID=group.creatorID, studentIDs=memberIDs, pageSize=pageSize)
                    if tsrels:
                        for tsrel in tsrels:
                            studentDict[tsrel.studentID] = tsrel
            member_list = []
            for each_member in group_members:
                memberEmail = each_member.member_info.email
                emailID, domain = memberEmail.split('@', 1) if '@' in memberEmail else ['******', 'enc.ck12.org']
                email = emailID[:3] + '*'*(len(emailID) - 3) + '@' + domain
                try:
                    h.safe_decode(email)
                except UnicodeDecodeError:
                    email = '******@enc.ck12.org'

                mem_info = {}
                mem_info['name'] = each_member.member_info.fix().name
                mem_info['firstName'] = each_member.member_info.givenName
                mem_info['lastName'] = each_member.member_info.surname
                mem_info['email'] = email
                mem_info['login'] = each_member.member_info.login
                mem_info['id'] = each_member.memberID
                mem_info['groupMemberRoleID'] = each_member.roleID
                mem_info['groupMemberRole'] = each_member.role.name
                mem_info['statusID'] = each_member.statusID
                mem_info['status'] = each_member.status.name
                mem_info['joinTime'] = each_member.joinTime
                if providerAppName:
                    mem_info['providerMemberID'] = each_member.providerMemberID
                if mRoles and memberRoleNameDict['teacher'] in mRoles[int(each_member.memberID)]:
                    mem_info['userRole'] = 'teacher'
                    mem_info['userRoleID'] = memberRoleNameDict['teacher']
                elif mRoles and memberRoleNameDict['student'] in mRoles[int(each_member.memberID)]:
                    mem_info['userRole'] = 'student'
                    mem_info['userRoleID'] = memberRoleNameDict['student']
                else:
                    memberRoleName = memberRoleDict[mRoles[int(each_member.memberID)][0]]
                    mem_info['userRole'] = memberRoleName
                    mem_info['userRoleID'] = memberRoleNameDict[memberRoleName]
                mem_info['isCreatedByTeacher'] = studentDict.get(each_member.memberID, None) is not None

                member_list.append(mem_info)

            if getCounts:
                teacherCount, studentCount = api.getGroupMemberCounts(group=group, memberRoleNameDict=memberRoleNameDict)
                result['response']['teacherCount'] = teacherCount
                result['response']['studentCount'] = studentCount

            result['response']['group'] = group.name
            result['response']['id'] = group.id
            result['response']['members'] = member_list
            result['response']['total'] = group_members.getTotal()
            result['response']['limit'] = len(group_members)
            result['response']['offset'] = (pageNum - 1) * pageSize
            return result
        except Exception, e:
            log.error('get group Exception[%s]' %(e))
            log.error('get group Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.NO_SUCH_GROUP
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log)
    def memberCounts(self):
        """
            Returns member counts of a group.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            params = request.GET.copy()
            groupIDs = params.get('groupIDs').split(",")
            totalMembers = params.get('totalMembers', None)
            if totalMembers:
                totalMembers = int(totalMembers)
            allowSuperAdmin = params.get('allowSuperAdmin', False)
            providerAppName = params.get('providerAppName', params.get('partnerAppName'))
            publicForums = params.get('publicForums', False)

            if not publicForums:
                user = u.getCurrentUser(request, anonymousOkay=False, autoLogin=True)
                isSuperAdmin = False
                if allowSuperAdmin:
                    isSuperAdmin = api.isGroupAdmin(groupID=1, memberID=user.id) or u.isMemberAdmin(user)

            if totalMembers > 10:
                c.errorCode = ErrorCodes.INVALID_GROUP_TOTAL_MEMBERS
                return ErrorCodes().asDict(c.errorCode, "Cannot request for more than 10 members per Group.")
            if len(groupIDs) > 15:
                c.errorCode = ErrorCodes.INVALID_GROUP_IDS
                return ErrorCodes().asDict(c.errorCode, "Cannot process request for more than 15 group IDs.")
            all_groups = dict()

            for groupID in groupIDs:
                isMember = False
                if not publicForums:
                    if not isSuperAdmin:
                        if user:
                            isMember = api.isGroupMember(groupID=groupID, memberID=user.id)
                            if not isMember:
                                c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
                                return ErrorCodes().asDict(c.errorCode, "You are not a member of this group")
                
                all_groups[groupID] = dict()
                all_groups[groupID]["group_id"] = groupID

                if totalMembers:
                    all_groups[groupID]["members"] = list()
                
                    group_members = api.getGroupMembers(group=groupID, providerAppName=providerAppName, pageNum=1, \
                        pageSize=totalMembers, publicForums=publicForums)

                    for each_member in group_members:
                        mem_info = {}
                        mem_info["id"] = each_member.memberID
                        mem_info["groupMemberRoleID"] = each_member.roleID
                        mem_info["groupMemberRole"] = each_member.role.name
                        all_groups[str(each_member.groupID)]["members"].append(mem_info)

            count_results = api.getGroupMembersCounts(groupIDs=groupIDs, providerAppName=providerAppName, \
                pageNum=1, pageSize=0)

            count_results_dict = dict((map(lambda(x,y):(str(int(x)),int(y)),count_results.results)))

            for group_id in all_groups.keys():
                if group_id in count_results_dict:
                    all_groups[group_id]["total"] = count_results_dict[group_id]
                else:
                    all_groups[group_id]["total"] = 0

            result['response']['groups'] = all_groups
            return result
        except Exception, e:
            log.error('get group Exception[%s]' %(e))
            log.error('get group Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.NO_SUCH_GROUP
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request)
    @d.sortable(request, ['member', 'fq', 'pageNum', 'pageSize', 'sort'])
    @d.filterable(request, ['member', 'fq', 'pageNum', 'pageSize', 'sort'], noformat=True)
    @d.setPage(request, ['member', 'fq', 'pageNum', 'pageSize', 'sort'])
    @d.trace(log, ['member', 'fq', 'pageNum', 'pageSize', 'sort'])
    def activity(self, member, fq, pageNum, pageSize, sort=None):
        """
            Returns activity of a group.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            #user = u.getCurrentUser(request)
            user = member
            groupID = request.params.get('groupID')
            groupHandle = request.params.get('groupHandle')

            if not groupID and not groupHandle:
                c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
                return ErrorCodes().asDict(c.errorCode, "Required parameters were emtpy.")

            group = None
            if groupID:
                group = api.getGroupByID(id=groupID)
            elif groupHandle:
                group = api.getGroupByHandle(handle=groupHandle)
            if not group:
                raise Exception('Group with id %s or handle: %s does not exist' %(groupID, groupHandle))

            isMember = api.isGroupMember(groupID=group.id, memberID=user.id)
            if not isMember:
                c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
                return ErrorCodes().asDict(c.errorCode, "You are not a member of this group")

            group_activity = api.getGroupActivity(group=group, memberID=user.id, pageNum=pageNum, pageSize=pageSize, fq=fq, sort=sort)

            activity_list = []

            accessTime = group.creationTime
            at = api.getMemberAccessTime(user.id, 'group', group.id)
            if at:
                accessTime = at.accessTime

            result['response']['lastAccessTime'] = accessTime

            isFirstTime = False
            isAdmin = api.isGroupAdmin(groupID=group.id, memberID=user.id)
            if isAdmin:
                isFirstTime = api.isGroupFirstActivity(groupID=group.id, accessTime=accessTime)

            result['response']['isFirstTime'] = isFirstTime

            for activity in group_activity:
                act_info = {}
                act_info['id'] = activity.id
                #act_info['groupID'] = activity.groupID
                act_info['activityType'] = activity.activityType
                act_info['objectType'] = activity.objectType
                act_info['objectID'] = activity.objectID
                act_info['ownerID'] = activity.ownerID
                act_info['owner'] = api.getMemberByID(activity.ownerID).asDict(obfuscateEmail=True)
                act_info['creationTime'] = activity.creationTime
                act_info.update(self.__loadActivityData(activity))
                activity_list.append(act_info)

            result['response']['group'] = group.name
            result['response']['activity'] = activity_list
            result['response']['total'] = group_activity.getTotal()
            result['response']['limit'] = len(group_activity)
            result['response']['offset'] = (pageNum - 1) * pageSize

            from flx.controllers.celerytasks import member as celerytasks_member
            mat = celerytasks_member.updateMemberAccessTimeTask()
            mat.delay(memberID=user.id,
                      objectType='group',
                      objectID=group.id,
                      accessTime=str(datetime.now())
                     )

            return result
        except Exception, e:
            log.error('get group Exception[%s]' %(e))
            log.error('get group Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.NO_SUCH_GROUP
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.trace(log, ['activity', 'session'])
    def __loadActivityData(self, activity, session=None):
        act_info = {}
        if activity.activityData:
            try:
                act_info['activityData'] = json.loads(activity.activityData)
            except Exception, e:

                log.exception('ActivityData [%s] exception[%s]' % (activity.activityData,e))
                act_info['activityData'] = {}

        if activity.objectType == 'member':
            if session:
                m = api._getMemberByID(session, activity.objectID)
            else:
                m = api.getMemberByID(activity.objectID)
            if m:
                act_info['member'] = m.asDict(obfuscateEmail=True)
            else:
                act_info['member'] = {'status': 'deleted'}
        elif activity.objectType == 'group':
            if session:
                g = api._getGroupByID(session, activity.objectID)
            else:
                g = api.getGroupByID(activity.objectID)
            if g:
                act_info['group'] = g.asDict(obfuscateEmail=True)
            else:
                act_info['group'] = {'status': 'deleted'}
        elif activity.objectType == 'artifact':
            if session:
                a = act_info['artifact'] = api._getArtifactByID(session, activity.objectID)
            else:
                a = act_info['artifact'] = api.getArtifactByID(activity.objectID)
            if a:
                act_info['artifact'] = a.asDict()
            else:
                act_info['artifact'] = {'status': 'deleted'}
        elif activity.objectType == 'artifactRevision':
            if session:
                a = api._getArtifactRevisionByID(session, activity.objectID)
            else:
                a = api.getArtifactRevisionByID(activity.objectID)
            if a:
                act_info['artifactRevision'] = a.asDict()
            else:
                act_info['artifactRevision'] = {'status': 'deleted'}
        elif activity.objectType == 'resource':
            if session:
                r = api._getResourceByID(session, activity.objectID)
            else:
                r = api.getResourceByID(activity.objectID)
            if r:
                act_info['resource'] = r.asDict()
            else:
                act_info['resource'] = {'status': 'deleted'}
        elif activity.objectType == 'resourceRevision':
            if session:
                r = api._getResourceRevisionByID(session, activity.objectID)
            else:
                r = api.getResourceRevisionByID(activity.objectID)
            if r:
                act_info['resourceRevision'] = r.asDict()
            else:
                act_info['resourceRevision'] = {'status': 'deleted'}
        elif activity.objectType == 'notification':
            if session:
                notification = api._getNotificationByID(session, activity.objectID)
            else:
                notification = api.getNotificationByID(activity.objectID)
            if notification:
                act_info['notification'] = notification.asDict()
            else:
                act_info['notification'] = {'status': 'deleted'}

        return act_info

    @d.jsonify()
    @d.checkAuth(request, False, False, ['groupID', 'memberID'])
    @d.trace(log, ['member', 'groupID', 'memberID'])
    def retrieveScores(self, member, groupID=None, memberID=None):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            if not memberID:
                memberID = request.params.get('memberID')

            if not groupID:
                groupID = request.params.get('groupID')
            if not groupID:
                c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
                log.error('Required parameter, groupID, was emtpy')
                return ErrorCodes().asDict(c.errorCode, "Required parameter, groupID, was emtpy.")

            group = api.getGroupByID(id=groupID)
            if not group:
                c.errorCode = ErrorCodes.NO_SUCH_GROUP
                log.error('Could not find group matching with groupID=%s' % groupID)
                return ErrorCodes().asDict(c.errorCode,'Could not find group matching with groupID=%s' % groupID)

            isAdmin = api.isGroupAdmin(groupID=group.id, memberID=member.id)
            isSuperAdmin = api.isGroupAdmin(groupID=1, memberID=member.id) or u.isMemberAdmin(member)

            if not isAdmin and not isSuperAdmin:
                if (not str(memberID) == str(member.id)):
                    log.error('Only Admin or self can retrieve scores.')
                    raise Exception('Only Admin or self can retrieve scores.')

            tx = utils.transaction(self.getFuncName())
            with tx as session:
                data = self._retrieveScores(session, groupID, memberID)
            result['response']['result'] = data
            return result
        except Exception, e:
            log.error('get group Exception[%s]' % str(e))
            log.error('get group Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.CANNOT_ADD_MEMBER_TO_GROUP
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.trace(log, ['session', 'groupID', 'memberID', 'toCallAssessment'])
    def _retrieveScores(self, session, groupID, memberID=None, toCallAssessment=True):
        """
            Calls assessment to retrieve any missing scores.

            This could happen when the member left the group after
            doing some assignments and then join back later.
        """
        #
        #  Get concept EIDs.
        #
        #   1. Get the assignments of the given groupID.
        #   2. Find the corresponding study tracks of these assignments.
        #
        studyTracks = []
        assignments = api._getAssignments(session, groupID=groupID)
        for assignment in assignments:
            log.debug('_retrieveScores: assignment id[%s]' % assignment.assignmentID)
            artifact = api._getArtifactByID(session, id= assignment.assignmentID)
            children = artifact.revisions[0].children
            for child in children:
                revision = api._getArtifactRevisionByID(session, child.hasArtifactRevisionID)
                studyTracks.append((revision.artifact, assignment))
        conceptEIDs = []
        for studyTrack, assignment in studyTracks:
            log.debug('_retrieveScores: study track id[%s]' % studyTrack.id)
            children = studyTrack.revisions[0].children
            for child in children:
                revision = api._getArtifactRevisionByID(session, child.hasArtifactRevisionID)
                artifact = revision.artifact
                log.debug('_retrieveScores: domain id[%s]' % artifact.id)
                conceptEIDs.append(artifact.encodedID)
                if memberID:
                    memberIDs = [ memberID ]
                else:
                    memberIDs = []
                    query = session.query(model.GroupHasMembers)
                    query = query.filter_by(groupID=groupID)
                    query = query.filter_by(roleID=14)
                    groupMembers = query.all()
                    for gm in groupMembers:
                        memberIDs.append(gm.memberID)
                for mid in memberIDs:
                    scores = api._getMemberStudyTrackStatus(session, memberIDs=[ mid ], studyTrackItemID=artifact.id, assignmentID=assignment.assignmentID)
                    if not scores:
                        data = {
                            'memberID': mid,
                            'assignmentID': assignment.assignmentID,
                            'studyTrackItemID': artifact.id,
                        }
                        score = api._createMemberStudyTrackItemStatus(session, **data)
                        log.debug('_retrieveScores: created missing score entry[%s]' % score)

        if not toCallAssessment:
            return None
        #
        #  Get scores from assessment server.
        #
        eids = ','.join(map(str, conceptEIDs))
        log.debug('_retrieveScores: eids[%s]' % eids)

        server = config.get('flx_assessment_api_server')
        rurl = '%s/report/scores/my?groupID=%s' % (server, groupID)
        if memberID:
            rurl = '%s&studentID=%s' % (rurl, memberID)
        if eids:
            rurl = '%s&conceptEIDs=%s' % (rurl, eids)
        log.debug('_retrieveScores: rurl[%s]' % rurl)
        status, data = self._call(rurl, method='GET', fromReq=True)
        if status !=  ErrorCodes.OK:
            c.errorCode = status
        log.debug('_retrieveScores: data%s' % data)
        return data

    def _addMemberToGroup(self, session, member, group, user):
        result = {}
        selfAdd = member.id == user.id
        groupID = group.id
        memberID = member.id
        objectID = group.id if group.groupType != 'public-forum' else None
        blockedInfo = u.isMemberBlocked(member, 'group', group.groupType, objectID, session=session)
        if blockedInfo:
            c.errorCode = ErrorCodes.USER_OPERATION_RESTRICTED
            errorMessage = 'You are restricted to perform any operation on %s %s' % (blockedInfo.subObjectType, blockedInfo.objectType)
            if blockedInfo.objectID:
                errorMessage = (', with id %s' % blockedInfo.objectID)
            return ErrorCodes().asDict(c.errorCode, errorMessage)

        is_user_added = api._addMemberToGroup(session, group=group, memberID=memberID)
        if not is_user_added:
            is_user_added = {}
            is_user_added['is_user_added'] = False
        elif is_user_added.has_key('message'):
            result['message'] = is_user_added.get('message')
        else:
            if group.groupScope != 'protected':
                event_data = {}
                event_data['new_member_id'] = memberID
                event_data['groupID'] = group.id
                event_data['group_name'] = group.name
                event_data['group_owner_id'] = group.creator.id
                event_data['group_member_count'] = group.membersCount
                event_data['group_type'] = group.groupType
                if user.id != memberID:
                    event_data['added_by'] = {
                        'memberID': user.id,
                        'name': user.name,
                    }
                member = member.asDict(True, True)
                member['firstName'] = member['givenName']
                member['lastName'] = member['surname']
                member['imageURL'] = pylons_session.get('userImage')
                event_data['member'] = member
                event_data = json.dumps(event_data)

                eventTypeName = 'GROUP_MEMBER_JOINED_WEB'
                eventType = api._getEventTypeByName(session, eventTypeName)
                notificationFilters = [('eventTypeID', eventType.id), ('groupID', group.id)]
                n.createEventForTypeHelperWithSession(session, eventTypeName, memberID, event_data, group.id, 'group', False, notificationFilters, onlyGroupAdmins=True)

                eventType = api._getEventTypeByName(session, 'GROUP_MEMBER_JOINED')
                notifications = api._getNotificationsByFilter(session, filters=[('eventTypeID', eventType.id), ('groupID', group.id), ('frequency', 'instant')]).results
                notificationIDs = []
                for notification in notifications:
                    notificationIDs.append(notification.id)

                event = api._createEventForType(session, typeName='GROUP_MEMBER_JOINED', objectID=group.id, objectType='group', ownerID=memberID, eventData=event_data, processInstant=False)
                h.processInstantNotifications([event.id] * len(notificationIDs), notificationIDs=notificationIDs, noWait=False, session=session)

                if group.groupType not in ['public-forum']:
                    if not selfAdd:
                        # Make sure the 'added_by' key is there
                        event_data = json.loads(event_data)
                        if "added_by" not in event_data:
                            event_data['added_by'] = {
                                'memberID': user.id,
                                'name': user.name,
                            }
                        event_data = json.dumps(event_data)

                        # In-app notification for group admin added member to group
                        eventTypeName = 'GROUP_ADMIN_ADDED_MEMBER_WEB'
                        eventType = api._getEventTypeByName(session, eventTypeName)
                        notificationFilters = [('eventTypeID', eventType.id), ('groupID', group.id)]
                        n.createEventForTypeHelperWithSession(session, eventTypeName, memberID, event_data, objectID=group.id, objectType='group', processInstant=False, notificationFilters=notificationFilters, onlyGroupAdmins=False, onlyForMember=True)

        eventTypeDict, eventTypeNameDict = g.getEventTypes(session=session)
        typeID = eventTypeNameDict.get('GROUP_QA_STATUS')
        if typeID is None:
            raise Exception((_(u'getGroupQAstatusInfo: Invalid type: GROUP_DISABLE_QA')))
        QAstatus = {
                    'enableQA': True,
                    'allowAnonymous': False
                    }
        events = api._getEvents(session, objectID=groupID, objectType='group', eventTypeIDs=[typeID])
        if events:
            eventDict = events[0].asDict()
            QAstatus['enableQA'] = eventDict.get('eventData').get('enableQA',True)

        typeID = eventTypeNameDict.get('GROUP_QA_ANONYMOUS_PERMISSION')
        if typeID is None:
            raise Exception((_(u'getGroupQAstatusInfo: Invalid type: GROUP_ALLOW_QA_ANONYMOUS_IDENTITY')))
        events = api._getEvents(session, objectID=groupID, objectType='group', eventTypeIDs=[typeID])
        if events:
            eventDict = events[0].asDict()
            QAstatus['allowAnonymous'] = eventDict.get('eventData').get('allowAnonymous',False)

        """
        if is_user_added.get('is_user_added') and group.groupType not in ['public-forum']:
            tx = utils.transaction(self.getFuncName())
            with tx as session:
                self._retrieveScores(session, group.id, memberID=memberID, toCallAssessment=selfAdd)
        """

        result['result'] = is_user_added['is_user_added']
        result['groupID'] = group.id
        result['qa'] = QAstatus
        result['memberID'] = memberID

        if is_user_added['is_user_added']:
            ## Email notifications
            api._addGroupNotificationSetting(session, eventType='GROUP_SHARE', groupID=group.id, subscriberID=memberID)
            api._addGroupNotificationSetting(session, eventType='ASSIGNMENT_ASSIGNED', groupID=group.id, subscriberID=memberID)
            api._addGroupNotificationSetting(session, eventType='ASSIGNMENT_DELETED', groupID=group.id, subscriberID=memberID)
            if group.groupType in ["public-forum"]:            
                api._addGroupNotificationSetting(session, eventType='GROUP_PH_POST', groupID=group.id, subscriberID=memberID, notificationType='email', frequency='daily')
            else:
                api._addGroupNotificationSetting(session, eventType='GROUP_PH_POST', groupID=group.id, subscriberID=memberID, notificationType='email', frequency='instant')                
            ## In-app web notifications
            api._addGroupNotificationSetting(session, eventType='GROUP_SHARE_WEB', groupID=group.id, notificationType='web', frequency='ondemand')
            api._addGroupNotificationSetting(session, eventType='ASSIGNMENT_ASSIGNED_WEB', groupID=group.id, notificationType='web', frequency='ondemand')
            api._addGroupNotificationSetting(session, eventType='ASSIGNMENT_DELETED_WEB', groupID=group.id, notificationType='web', frequency='ondemand')

            kwargs = {}
            kwargs['groupID'] = group.id
            kwargs['ownerID'] = memberID
            kwargs['objectID'] = memberID
            kwargs['objectType'] = 'member'
            kwargs['activityType'] = 'join'
            #kwargs['activityData'] = json.dumps({'url': request.params.get('url')})
            api._addGroupActivity(session, **kwargs)

            if selfAdd:
                payload = { 'groupID'        : group.id,
                            'groupType'      : group.groupType,
                            'role'           : 'groupmember',
                            'memberID'       : memberID,
                            'name'           : group.name ,
                            'accessCode'     : group.accessCode,
                            'roleID'         : 14
                            }

                self._updatePeerhelpGroupMemberAssociation('group/add/member', payload, QAInfo=True, session=session)

        return result

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log)
    def addMembersToGroup(self):
        """
            Adds members to group.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            user = u.getCurrentUser(request)

            groupID = request.params.get('groupID')
            groupHandle = request.params.get('groupHandle')
            accessCode = request.params.get('accessCode')

            if not (groupID or groupHandle or accessCode):
                c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
                return ErrorCodes().asDict(c.errorCode, "Required group info were emtpy.")

            group = None
            if groupID:
                group = api.getGroupByID(id=groupID)
            elif groupHandle:
                group = api.getGroupByHandle(handle=groupHandle)
            elif accessCode:
                group = api.getGroupByCode(accessCode=accessCode)

            if accessCode:
                if not group or group.accessCode != accessCode:
                    c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
                    return ErrorCodes().asDict(c.errorCode,'The accessCode does not match')

            if not group:
                c.errorCode = ErrorCodes.NO_SUCH_GROUP
                return ErrorCodes().asDict(c.errorCode,'Could not find group matching with groupID=%s or groupHandle=%s' % (groupID, groupHandle))

            memberIDs = request.params.get('memberIDs')
            if not memberIDs:
                c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
                return ErrorCodes().asDict(c.errorCode, "Required parameter, memberIDs, was missing.")

            isAdmin = api.isGroupAdmin(groupID=group.id, memberID=user.id)
            if not isAdmin:
                isSuperAdmin = api.isGroupAdmin(groupID=1, memberID=user.id) or u.isMemberAdmin(user)
                if not isSuperAdmin:
                    c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
                    return ErrorCodes().asDict(c.errorCode, 'Only admin can add group members.')

            memberIDs = memberIDs.split(',')
            rList = []
            tx = utils.transaction(self.getFuncName())
            with tx as session:
                for memberID in memberIDs:
                    member = api._getMemberByID(session, memberID)
                    if not member:
                        c.errorCode = ErrorCodes.UNKNOWN_MEMBER
                        return ErrorCodes().asDict(c.errorCode, 'No member with id, %s' % memberID)

                    r = self._addMemberToGroup(session, member, group, user)
                    rList.append(r)

            result['response']['result'] = rList
            result['response']['total'] = len(rList)
            return result
        except Exception, e:
            log.error('get group Exception[%s]' % str(e))
            log.error('get group Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.CANNOT_ADD_MEMBER_TO_GROUP
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log)
    def addMemberToGroup(self):
        """
            Adds member to group.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            user = u.getCurrentUser(request)

            groupID = request.params.get('groupID')
            bookID = request.params.get('bookID', None)
            if bookID:
                book = api.getArtifactByID(id=bookID)
                if not book:
                    raise ex.InvalidArgumentException((_(u'Invalid book id, %(bookID)s.' % { 'bookID': bookID })).encode("utf-8"))
                groupHandle = self._getGroupHandleFromBook(bookID=bookID)
            else:
                groupHandle = request.params.get('groupHandle', None)
                if groupHandle:
                    aid, e, bookID = groupHandle.split('-')
                    book = api.getArtifactByID(id=bookID)
                    if not book:
                        raise ex.InvalidArgumentException((_(u'Invalid book id, %(bookID)s.' % { 'bookID': bookID })).encode("utf-8"))
            accessCode = request.params.get('accessCode')

            if not (groupID or groupHandle or accessCode):
                c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
                return ErrorCodes().asDict(c.errorCode, "Required parameters were emtpy.")

            group = None
            if groupID:
                group = api.getGroupByID(id=groupID)
            elif groupHandle:
                group = api.getGroupByHandle(handle=groupHandle)
            elif accessCode:
                group = api.getGroupByCode(accessCode=accessCode)


            if accessCode:
                if not group or group.accessCode != accessCode:
                    c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
                    return ErrorCodes().asDict(c.errorCode,'The accessCode does not match')

            if not group:
                c.errorCode = ErrorCodes.NO_SUCH_GROUP
                return ErrorCodes().asDict(c.errorCode,'Could not find group matching with groupID=%s or groupHandle=%s' % (groupID, groupHandle))

            selfAdd = True
            memberID = request.params.get('memberID')
            if not memberID:
                assigneeID = request.params.get('assigneeID', None)
                if not assigneeID:
                    member = user
                    memberID = user.id
                else:
                    member = api.getMember(id=assigneeID)
                    if not member:
                        c.errorCode = ErrorCodes.INVALID_ARGUMENT
                        return ErrorCodes().asDict(c.errorCode, 'Invalid assignee, %s' % assigneeID)
                    memberID = member.id
            else:
                isAdmin = api.isGroupAdmin(groupID=group.id, memberID=user.id)
                if not isAdmin:
                    isSuperAdmin = api.isGroupAdmin(groupID=1, memberID=user.id) or u.isMemberAdmin(user)
                    if not isSuperAdmin:
                        c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
                        return ErrorCodes().asDict(c.errorCode, 'Only admin can add group members.')

                member = api.getMemberByID(memberID)
                if not member:
                    c.errorCode = ErrorCodes.UNKNOWN_MEMBER
                    return ErrorCodes().asDict(c.errorCode, 'No member with id, %s' % memberID)

                selfAdd = False

            objectID = group.id if group.groupType != 'public-forum' else None
            blockedInfo = u.isMemberBlocked(member, 'group', group.groupType, objectID)
            if blockedInfo:
                c.errorCode = ErrorCodes.USER_OPERATION_RESTRICTED
                errorMessage = 'You are restricted to perform any operation on %s %s' % (blockedInfo.subObjectType, blockedInfo.objectType)
                if blockedInfo.objectID:
                    errorMessage = (', with id %s' % blockedInfo.objectID)
                return ErrorCodes().asDict(c.errorCode, errorMessage)


            if not group:
                if accessCode:
                    c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
                    return ErrorCodes().asDict(c.errorCode, 'The accessCode does not match')
                c.errorCode = ErrorCodes.NO_SUCH_GROUP
                return ErrorCodes().asDict(c.errorCode, 'Could not find group matching with groupID=%s or groupHandle=%s' % (groupID, groupHandle))

            if accessCode and group.accessCode != accessCode:
                c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
                return ErrorCodes().asDict(c.errorCode, 'The accessCode does not match')

            log.debug('addMemberToGroup: group.groupType[%s]' % group.groupType)
            if group.groupType == 'editing':
                if not book:
                    c.errorCode = ErrorCodes.INVALID_ARGUMENT
                    return ErrorCodes().asDict(c.errorCode, 'BookID missing for editing group.')

                if group.creatorID == memberID:
                    c.errorCode = ErrorCodes.INVALID_ARGUMENT
                    return ErrorCodes().asDict(c.errorCode, 'No need to assign group owner as a member.')

            if memberID == user.id:
                role = request.params.get('role', None)
            else:
                if group.groupType != 'editing':
                    role = None
                else:
                    #
                    #  Must be one of the admin types or a ge-owner
                    #  on editing type of groups to qualify.
                    #
                    authorized = False
                    role = 'ge-collaborator'
                    gms = user.groupRoles
                    for gm in gms:
                        if gm.groupID == group.id and gm.role.name == 'ge-owner':
                            authorized = True
                            break
                    if not authorized and not u.isMemberAdmin(user):
                        c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
                        return ErrorCodes().asDict(c.errorCode, 'Only admin/owner can add a member to a group.')

            if not role:
                roleID = None
            else:
                roleDict, roleNameDict = g.getMemberRoles()
                roleID = roleNameDict.get(role, None)
                if not roleID:
                    c.errorCode = ErrorCodes.INVALID_ARGUMENT
                    return ErrorCodes().asDict(c.errorCode, 'Invalid role name, %s' % role)

            is_user_added = api.addMemberToGroup(group=group, memberID=memberID, roleID=roleID)
            log.debug('addMemberToGroup: is_user_added[%s]' % is_user_added)
            if not is_user_added:
                is_user_added = {}
                is_user_added['is_user_added'] = False
            elif is_user_added.has_key('message'):
                result['response']['message'] = is_user_added.get('message')
            elif group.groupType != 'editing':
                if group.groupScope != 'protected':
                    event_data = {}
                    event_data['new_member_id'] = memberID
                    event_data['groupID'] = group.id
                    event_data['group_name'] = group.name
                    event_data['group_owner_id'] = group.creator.id
                    event_data['group_member_count'] = group.membersCount
                    event_data['group_type'] = group.groupType
                    if user.id != memberID:
                        event_data['added_by'] = {
                            'memberID': user.id,
                            'name': user.name,
                        }
                    member = member.asDict(True, True)
                    member['firstName'] = member['givenName']
                    member['lastName'] = member['surname']
                    member['imageURL'] = pylons_session.get('userImage')
                    event_data['member'] = member
                    event_data = json.dumps(event_data)

                    eventTypeName = 'GROUP_MEMBER_JOINED_WEB'
                    eventType = api.getEventTypeByName(eventTypeName)
                    notificationFilters = [('eventTypeID', eventType.id), ('groupID', group.id)]
                    n.createEventForTypeHelper(eventTypeName, memberID, event_data, group.id, 'group', False, notificationFilters, onlyGroupAdmins=True)

                    #event,notification = api.addGroupNotification(eventType='GROUP_MEMBER_JOINED', eventData=event_data, groupID=group.id)
                    eventType = api.getEventTypeByName('GROUP_MEMBER_JOINED')
                    notifications = api.getNotificationsByFilter(filters=[('eventTypeID', eventType.id), ('groupID', group.id), ('frequency', 'instant')]).results
                    notificationIDs = []
                    for notification in notifications:
                        notificationIDs.append(notification.id)

                    event = api.createEventForType(typeName='GROUP_MEMBER_JOINED', objectID=group.id, objectType='group', ownerID=memberID, eventData=event_data, processInstant=False)
                    h.processInstantNotifications([event.id] * len(notificationIDs), notificationIDs=notificationIDs, noWait=True)

                    if group.groupType not in ['public-forum']:
                        if not selfAdd:
                            # Make sure the 'added_by' key is there
                            event_data = json.loads(event_data)
                            if "added_by" not in event_data:
                                event_data['added_by'] = {
                                    'memberID': user.id,
                                    'name': user.name,
                                }
                            event_data = json.dumps(event_data)

                            # In-app notification for group admin added member to group
                            eventTypeName = 'GROUP_ADMIN_ADDED_MEMBER_WEB'
                            eventType = api.getEventTypeByName(eventTypeName)
                            notificationFilters = [('eventTypeID', eventType.id), ('groupID', group.id)]
                            n.createEventForTypeHelper(eventTypeName, memberID, event_data, objectID=group.id, objectType='group', processInstant=False, notificationFilters=notificationFilters, onlyGroupAdmins=False, onlyForMember=True)

            if group.groupType == 'editing':
                if is_user_added['is_user_added']:
                    #
                    #  Add to assignee's library with the "Collaboration" system label.
                    #
                    objectID = book.revisions[0].id
                    objectType = 'artifactRevision'
                    libObject = api.addObjectToLibrary(objectID, objectType, memberID, systemLabels=['Collaboration'], removeExisting=True, cache=ArtifactCache())
                    log.debug('addMemberToGroup: added library object[%s]' % libObject)
            else:
                eventTypeDict, eventTypeNameDict = g.getEventTypes()
                typeID = eventTypeNameDict.get('GROUP_QA_STATUS')
                if typeID is None:
                    raise Exception((_(u'getGroupQAstatusInfo: Invalid type: GROUP_DISABLE_QA')))
                QAstatus = {
                            'enableQA': True,
                            'allowAnonymous': False
                        }
                events = api.getEventsForObject(objectID=groupID, objectType='group', eventTypeIDs=[typeID])
                if events:
                    eventDict = events[0].asDict()
                    QAstatus['enableQA'] = eventDict.get('eventData').get('enableQA',True)
                    
                typeID = eventTypeNameDict.get('GROUP_QA_ANONYMOUS_PERMISSION')
                if typeID is None:
                    raise Exception((_(u'getGroupQAstatusInfo: Invalid type: GROUP_ALLOW_QA_ANONYMOUS_IDENTITY')))
                events = api.getEventsForObject(objectID=groupID, objectType='group', eventTypeIDs=[typeID])
                if events:
                    eventDict = events[0].asDict()
                    QAstatus['allowAnonymous'] = eventDict.get('eventData').get('allowAnonymous',False)
                result['response']['qa'] = QAstatus

                if is_user_added.get('is_user_added') and group.groupType not in ['public-forum']:
                    tx = utils.transaction(self.getFuncName())
                    with tx as session:
                        self._retrieveScores(session, group.id, memberID=memberID, toCallAssessment=selfAdd)

                #Check if there are any previously set notifications for this user and groupID.
                existing_notifications = None
                existing_notifications = api.getNotificationsByFilter(filters=[('groupID', group.id), ('subscriberID', memberID)]).results
                isPublicForum = group.groupType in ['public-forum']

                if is_user_added['is_user_added']:
                    ## Email notifications
                    eventTypesPresent = []
                    if existing_notifications and isPublicForum:
                        #eventTypesRequired = ["GROUP_SHARE","ASSIGNMENT_ASSIGNED","ASSIGNMENT_DELETED","GROUP_PH_POST"]
                        for existing_notification in existing_notifications:
                            if hasattr(existing_notification, "eventType"):
                                if hasattr(existing_notification.eventType, "name"):
                                    if existing_notification.eventType.name not in eventTypesPresent:
                                        eventTypesPresent.append(existing_notification.eventType.name)                    

                    if "GROUP_SHARE" not in eventTypesPresent:
                        api.addGroupNotificationSetting(eventType='GROUP_SHARE', groupID=group.id, subscriberID=memberID)
                    if "ASSIGNMENT_ASSIGNED" not in eventTypesPresent:
                        api.addGroupNotificationSetting(eventType='ASSIGNMENT_ASSIGNED', groupID=group.id, subscriberID=memberID)
                    if "ASSIGNMENT_DELETED" not in eventTypesPresent:
                        api.addGroupNotificationSetting(eventType='ASSIGNMENT_DELETED', groupID=group.id, subscriberID=memberID)
                    if "GROUP_PH_POST" not in eventTypesPresent:                        
                        if group.groupType in ['public-forum']:
                            api.addGroupNotificationSetting(eventType='GROUP_PH_POST', groupID=group.id, subscriberID=memberID, notificationType='email', frequency='daily')
                        else:
                            api.addGroupNotificationSetting(eventType='GROUP_PH_POST', groupID=group.id, subscriberID=memberID, notificationType='email', frequency='instant')
                            
                    ## In-app web notifications
                    api.addGroupNotificationSetting(eventType='GROUP_SHARE_WEB', groupID=group.id, notificationType='web', frequency='ondemand')
                    api.addGroupNotificationSetting(eventType='ASSIGNMENT_ASSIGNED_WEB', groupID=group.id, notificationType='web', frequency='ondemand')
                    api.addGroupNotificationSetting(eventType='ASSIGNMENT_DELETED_WEB', groupID=group.id, notificationType='web', frequency='ondemand')

                    kwargs = {}
                    kwargs['groupID'] = group.id
                    kwargs['ownerID'] = memberID
                    kwargs['objectID'] = memberID
                    kwargs['objectType'] = 'member'
                    kwargs['activityType'] = 'join'
                    #kwargs['activityData'] = json.dumps({'url': request.params.get('url')})
                    api.addGroupActivity(**kwargs)
                    if selfAdd:
                        payload = { 'groupID'        : group.id,
                                    'groupType'      : group.groupType,
                                    'role'           : 'groupmember',
                                    'memberID'       : memberID,
                                    'name'           : group.name ,
                                    'accessCode'     : group.accessCode,
                                    'roleID'         : 14,
                                    'currentUserID'  : user.id
                                }
                        self._updatePeerhelpGroupMemberAssociation('group/add/member', payload, QAInfo=True)

            result['response']['result'] = is_user_added['is_user_added']
            result['response']['groupID'] = group.id
            return result
        except Exception, e:
            log.error('get group Exception[%s]' % str(e))
            log.error('get group Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.CANNOT_ADD_MEMBER_TO_GROUP
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, False, ['appID'])
    @d.trace(log, ['member', 'appID'])
    def addLMSMemberToGroup(self, member, appID=None):
        """
            Adds member to group.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            if not appID:
                appID = request.params.get('appID')
            log.debug('addLMSMemberToGroup: appID[%s]' % appID)
            if not appID:
                c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
                return ErrorCodes().asDict(c.errorCode, "Required parameters appID missing.")

            contextID = request.params.get('contextID', None)
            log.debug('addLMSMemberToGroup: contextID[%s]' % contextID)
            if not contextID:
                c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
                return ErrorCodes().asDict(c.errorCode, "Required parameters contextID missing.")

            providerMemberID = request.params.get('providerMemberID', None)
            log.debug('addLMSMemberToGroup: providerMemberID[%s]' % providerMemberID)
            if not providerMemberID:
                c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
                return ErrorCodes().asDict(c.errorCode, "Required parameters providerMemberID missing.")

            assignmentID = request.params.get('assignmentID', None)
            assignmentEID = request.params.get('assignmentEID', None)
            # We can look up assignment using assignmentEID or assignmentID
            # if neither one is returned we will throw an error
            if not assignmentEID and not assignmentID:
                c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
                return ErrorCodes().asDict(c.errorCode, "Required parameters assignmentEID or assignmentID missing.")

            tx = utils.transaction(self.getFuncName())
            with tx as session:
                lmsProviderGroups = api._getLMSProviderGroups(session, appID=appID, providerGroupID=contextID)

                ck12LMSAdmin = api._getMemberByEmail(session, "ck12.lms.admin@ck12.org")
                log.debug("addLMSMemberToGroup: ck12LMSAdmin [%s]" % ck12LMSAdmin)
                isTeacher = False
                isGroupOwner = False
                createShadowGroup = False

                member_roles = api._getMemberRolesByMemberIDs(session,[member.id])
                log.debug("addLMSMemberToGroup: member roles [%s]" % member_roles)
                isTeacher = True in [role == 5 for role in member_roles[member.id]]
                log.debug("addLMSMemberToGroup: member is a teacher [%s]"%isTeacher)

                groupID = None
                if lmsProviderGroups:
                    groupID = lmsProviderGroups[0].groupID

                log.debug('addLMSMemberToGroup: groupID %s' %(groupID))
                lmsManager = self.getLMSInstance(appID, txSession=session)
                isLMSInstructor = None
                #Goole Classroom instructors will have permission
                permission = request.params.get('permission', None)
                log.debug('addLMSMemberToGroup: permission %s' %(permission))
                if permission:
                    isLMSInstructor = True if permission == "CREATE_COURSE" else False;
                else:
                    isLMSInstructor = lmsManager.is_instructor()

                if groupID is None:
                    log.debug('addLMSMemberToGroup: Need to create shadow group for contextID %s' %(contextID))
                    # If we don't have a shadow group created we need to create one. This comes from a course copy
                    # use case, where a teacher can copy all assignments from a course to a new course. The teacher
                    # may not even launch the assignments after the copy.
                    try:
                        #TODO: Add the ck12LMSAdmin member email to development.ini
                        # Check to see if this user is a teacher on CK-12 and for the LMS group
                        # We check both the LMS role and the CK-12 role because, the user can be 
                        # a student on CK-12 but a teacher in the LMS course
                        if isLMSInstructor and isTeacher:
                            groupID = lmsManager.createGroup(contextID, appID, member, providerMemberID=providerMemberID)
                            isGroupOwner = True
                        # I'm not a teacher use ck12LMSAdmin
                        else:
                            groupID = lmsManager.createGroup(contextID, appID, ck12LMSAdmin, providerMemberID='ck12.lms.admin@ck12.org')
                        log.debug("addLMSMemberToGroup: groupID [%s]" % groupID)
                        createShadowGroup = True
                        if not groupID:
                            c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
                            return ErrorCodes().asDict(c.errorCode, "Group for contextID: %s does not exist" %(contextID))
                    except Exception, e:
                        log.error('addLMSMemberToGroup: could not create shadow group [%s] for app [%s]'%(groupID, appID))
                        log.error('addLMSMemberToGroup: createGroup Exception[%s] traceback' %(traceback.format_exc()))
                        raise e

                group = api._getGroupByID(session, id=groupID)
                log.debug("addLMSMemberToGroup: group [%s]" % group)
                if not isGroupOwner:
                    isGroupOwner = group.creatorID == member.id
                # Check to see if the teacher needs to be made group admin.
                # Only if the current group owner is ck12LMSAdmin, otherwise assuming the reclaim has happened.
                if isTeacher and isLMSInstructor and (group.creatorID == ck12LMSAdmin.id) and not isGroupOwner:
                    isGroupOwner = True
                # Add this user to the new  ck-12 group
                is_user_added = api._addMemberToGroup(session, group=group, memberID=member.id, isAdmin=isGroupOwner)
                # Add this user to the new lms group
                lmsManager.createLMSMemberAssociation(contextID, providerMemberID=providerMemberID, memberID=member.id)
                # Get lms assignment
                assignment = None
                if createShadowGroup:
                    assignment = lmsManager.createCourseCopyAssignment(member, contextID, group.id, appID, assignmentID=assignmentID, assignmentEID=assignmentEID)
                if assignment:
                    assignmentID = assignment.id
                # Check to see if there was an error response returned
                if assignment and type(assignment).__name__ == 'dict' and  'responseHeader' in assignment:
                    return assignment
                # Check to see if there was an error response returned
                if assignment and 'responseHeader' in assignment:
                    return assignment

                #
                #  Create the member study track items, if it does not exist yet.
                #  FN: For teacher users only 4/13/2017
                if not isTeacher and createShadowGroup and assignmentID:
                    memberStudyTrackItems = api._getMemberStudyTrackStatusByAssignment(session, member.id, assignmentID)
                    log.debug("addLMSMemberToGroup: after api._getMemberStudyTrackStatusByAssignment for memberID[%s] and assignment [%s] and results [%s]"%(member.id,assignmentID,memberStudyTrackItems))
                    if not memberStudyTrackItems:
                        children = assignment.revisions[0].children
                        from flx.controllers.assignment import AssignmentController
                        ac = AssignmentController()
                        ac._updateMemberStudyTrackItems(session, assignmentID, children, memberID=member.id)

                if is_user_added.has_key('message'):
                    result['response']['message'] = is_user_added.get('message')
                    result['response']['assignmentID'] = assignmentID
                else:
                    result['response']['result'] = is_user_added['is_user_added']
                    result['response']['groupID'] = group.id
                    result['response']['assignmentID'] = assignmentID

            return result
        except Exception, e:
            log.error('addLMSMemberToGroup Exception[%s]' % str(e))
            log.error('addLMSMemberToGroup Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.CANNOT_ADD_MEMBER_TO_GROUP
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log)
    def deleteMemberFromGroup(self):
        """
            Delete member From group.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            user = u.getCurrentUser(request)
            groupID = request.params.get('groupID')
            bookID = request.params.get('bookID', None)
            if bookID:
                book = api.getArtifactByID(id=bookID)
                if not book:
                    raise ex.InvalidArgumentException((_(u'Invalid book id, %(bookID)s.' % { 'bookID': bookID })).encode("utf-8"))
                groupHandle = self._getGroupHandleFromBook(bookID=bookID)
            else:
                groupHandle = request.params.get('groupHandle', None)
                if groupHandle:
                    aid, e, bookID = groupHandle.split('-')
                    book = api.getArtifactByID(id=bookID)
                    if not book:
                        raise ex.InvalidArgumentException((_(u'Invalid book id, %(bookID)s.' % { 'bookID': bookID })).encode("utf-8"))
            assigneeID = request.params.get('assigneeID', None)
            if not assigneeID:
                memberID = request.params.get('memberID', None)
            else:
                member = api.getMember(id=assigneeID)
                if not member:
                    c.errorCode = ErrorCodes.INVALID_ARGUMENT
                    return ErrorCodes().asDict(c.errorCode, 'Invalid assignee, %s' % assigneeID)
                memberID = member.id
            log.debug('deleteMemberFromGroup: memberID[%s]' % memberID)

            if (not groupID and not groupHandle) or not memberID:
                c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
                log.error('Required parameters were emtpy. [%s/%s] %s' % (groupID, groupHandle, memberID))
                return ErrorCodes().asDict(c.errorCode, "Required parameters were emtpy.")

            group = None
            if groupID:
                group = api.getGroupByID(id=groupID)
            elif groupHandle:
                group = api.getGroupByHandle(handle=groupHandle)

            if not group:
                c.errorCode = ErrorCodes.NO_SUCH_GROUP
                log.error('Could not find group matching with groupID=%s or groupHandle=%s' % (groupID, groupHandle))
                return ErrorCodes().asDict(c.errorCode,'Could not find group matching with groupID=%s or groupHandle=%s' % (groupID, groupHandle))
            log.debug('deleteMemberFromGroup: group[%s]' % group)
            #
            #  Must be one of the admin types or a ge-owner
            #  on editing type of groups to qualify.
            #
            authorized = False
            if group.groupType == 'editing':
                #
                #  See if assignee still has assigned artifact(s).
                #
                assignments = api.getBookEditingAssignments(assigneeID=memberID, groupID=group.id)
                if assignments:
                    c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
                    return ErrorCodes().asDict(c.errorCode, 'Assignee, %s, still has assignment(s).' % memberID)
                #
                #  Authorization specific to editing groups.
                #
                gms = user.groupRoles
                for gm in gms:
                    if gm.groupID == group.id and gm.role.name == 'ge-owner':
                        if memberID == user.id:
                            c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
                            return ErrorCodes().asDict(c.errorCode, 'Group owner cannot remove herself.')
                        authorized = True
                        break

            isPublicForum = group.groupType in ['public-forum']
            if not authorized:
                isAdmin = api.isGroupAdmin(groupID=group.id, memberID=user.id)
                isSuperAdmin = api.isGroupAdmin(groupID=1, memberID=user.id) or u.isMemberAdmin(user)

                #Allow users to un-follow from forums
                isPublicForum = group.groupType in ['public-forum']
                if not isAdmin and not isSuperAdmin:
                    if (not str(memberID) == str(user.id)) and not isPublicForum:
                        c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
                        return ErrorCodes().asDict(c.errorCode, 'Only admin can remove a member from a group.')

            is_user_deleted = api.deleteMemberFromGroup(group=group, memberID=memberID, requesterID=user.id)
            if not is_user_deleted:
                is_user_deleted = False
            else:
                if not isPublicForum:
                    notifications = api.getNotificationsByFilter(filters=[('groupID', group.id), ('subscriberID', memberID)]).results
                    for notification in notifications:
                        api.deleteNotification(notification.id)
                if group.groupType == 'editing':
                    #
                    #  Remove from library.
                    #
                    objectType = 'artifactRevision'
                    revisions = book.revisions
                    for revision in revisions:
                        objectID = revision.id
                        libObject = api.getMemberLibraryObject(memberID, objectID, objectType)
                        if libObject:
                            api.removeObjectFromLibrary(objectID, objectType, memberID, cache=ArtifactCache())
                            log.debug('deleteMemberFromGroup: deleted library object[%s]' % libObject)
                            break
                if group.groupType == 'editing':
                    #
                    #  Remove from library.
                    #
                    objectType = 'artifactRevision'
                    revisions = book.revisions
                    for revision in revisions:
                        objectID = revision.id
                        libObject = api.getMemberLibraryObject(memberID, objectID, objectType)
                        if libObject:
                            api.removeObjectFromLibrary(objectID, objectType, memberID, cache=ArtifactCache())
                            log.debug('deleteMemberFromGroup: deleted library object[%s]' % libObject)
                            break

            result['response']['result'] = is_user_deleted

            if is_user_deleted and group.groupType != 'editing':
                kwargs = {}
                kwargs['groupID'] = group.id
                kwargs['ownerID'] = user.id
                kwargs['objectID'] = memberID
                kwargs['objectType'] = 'member'
                kwargs['activityType'] = 'leave'
                #kwargs['activityData'] = json.dumps({'url': request.params.get('url')})
                api.addGroupActivity(**kwargs)

                payload = {'groupID'        : group.id,
                           'memberID'       : memberID,
                           'currentUserID'  : user.id
                           }

                self.__updatePeerhelpGroupMemberAssociation('group/delete/member', payload)

            return result
        except Exception, e:
            log.error('get group Exception[%s]' % str(e))
            log.error('get group Exception[%s] traceback' %(traceback.format_exc()))
            if c.errorCode == ErrorCodes.OK:
                c.errorCode = ErrorCodes.CANNOT_DELETE_MEMBER_FROM_GROUP
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log)
    def activate(self):
        """
            Activate a group member after he/she asked for permission to join the group
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            user = u.getCurrentUser(request)
            groupID = request.params.get('groupID')
            groupHandle = request.params.get('groupHandle')
            memberID = request.params.get('memberID')

            if (not groupID and not groupHandle) or not memberID:
                c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
                return ErrorCodes().asDict(c.errorCode, "Required parameters were emtpy.")

            group = None
            if groupID:
                group = api.getGroupByID(id=groupID)
            elif groupHandle:
                group = api.getGroupByHandle(handle=groupHandle)

            if not group:
                c.errorCode = ErrorCodes.NO_SUCH_GROUP
                return ErrorCodes().asDict(c.errorCode,'Could not find group matching with groupID=%s or groupHandle=%s' % (groupID, groupHandle))

            isAdmin = api.isGroupAdmin(groupID=group.id, memberID=user.id)
            isSuperAdmin = api.isGroupAdmin(groupID=1, memberID=user.id)
            if not isAdmin and not isSuperAdmin:
                raise Exception('Only Admin can activate a group member.')
            statusID = 2
            is_user_activated = api.updateGroupMemberState(group=group,memberID=memberID,statusID=statusID)
            if not is_user_activated:
                is_user_activated = {}
                is_user_activated['is_stae_updated'] = False
            elif is_user_activated.has_key('message'):
                result['response']['message'] = is_user_activated.get('message')
            else:
                if group.type == 'protected':
                    event_data = {}
                    event_data['new_member_id'] = memberID
                    event_data['group_id'] = group.id
                    groupMember = api.getMemberByID(memberID)
                    member_email = groupMember.email
                    event_data = json.dumps(event_data)
                    event,notification = api.addGroupNotification(eventType='GROUP_MEMBER_ACTIVATED', address=member_email, eventData=event_data, groupID=group.id)
                    h.processInstantNotifications([event.id], notificationIDs=[notification.id], noWait=False)
            result['response']['result'] = is_user_activated['is_state_updated']
            return result
        except Exception, e:
            log.error('get group Exception[%s]' % str(e))
            log.error('get group Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.CANNOT_ACTIVATE_GROUP_MEMBER
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log)
    def decline(self):
        """
            Decline a member's group join request.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            user = u.getCurrentUser(request)
            groupID = request.params.get('groupID')
            groupHandle = request.params.get('groupHandle')
            memberID = request.params.get('memberID')

            if (not groupID and not groupHandle) or not memberID:
                c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
                return ErrorCodes().asDict(c.errorCode, "Required parameters were emtpy.")

            group = None
            if groupID:
                group = api.getGroupByID(id=groupID)
            elif groupHandle:
                group = api.getGroupByHandle(handle=groupHandle)

            if not group:
                c.errorCode = ErrorCodes.NO_SUCH_GROUP
                return ErrorCodes().asDict(c.errorCode,'Could not find group matching with groupID=%s or groupHandle=%s' % (groupID, groupHandle))

            statusID = 3
            isAdmin = api.isGroupAdmin(groupID=group.id, memberID=user.id)
            isSuperAdmin = api.isGroupAdmin(groupID=1, memberID=user.id)
            if not isAdmin and not isSuperAdmin:
                raise Exception('Only Admin can decline a group member.')
            is_user_declined = api.updateGroupMemberState(group=group,memberID=memberID,statusID=statusID)
            if not is_user_declined:
                is_user_declined = {}
                is_user_declined['is_state_updated'] = False
            elif is_user_declined.has_key('message'):
                result['response']['message'] = is_user_declined.get('message')
            else:
                if group.type == 'protected':
                    event_data = {}
                    event_data['new_member_id'] = memberID
                    event_data['group_id'] = group.id
                    event_data = json.dumps(event_data)
                    groupMember = api.getMemberByID(memberID)
                    member_email = groupMember.email
                    event_data = json.dumps(event_data)
                    event,notification = api.addGroupNotification(eventType='GROUP_MEMBER_DECLINED', address=member_email, eventData=event_data, groupID=group.id)
                    h.processInstantNotifications([event.id], notificationIDs=[notification.id], noWait=False)
            result['response']['result'] = is_user_declined['is_state_updated']
            return result
        except Exception, e:
            log.error('get group Exception[%s]' % str(e))
            log.error('get group Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.CANNOT_DECLINE_GROUP_MEMBER
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log)
    def share(self):
        """
            Share artifact with group members
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        result['response']['result']={}
        try:
            user = u.getCurrentUser(request)
            objectID = request.params.get('objectID')
            artifact = api.getArtifactByID(id=objectID)
            if not artifact:
                raise NotFoundException((_(u'No artifact with id [%s] found.' % objectID)).encode("utf-8"))
            title = artifact.asDict()['title']
            member = user.asDict(True, True)
            member['firstName'] = member['givenName']
            member['lastName'] = member['surname']
            member['imageURL'] = pylons_session.get('userImage')

            groupIDs = []
            if request.params.get('groupIDs'):
                groupIDs = request.params.get('groupIDs').split(',')
                groupIDs = map(int, groupIDs)
            else:
                groupIDs.append(int(request.params.get('groupID')))

            log.info('GroupIDs: %s' %(groupIDs))
            for groupID in groupIDs:
                group = api.getGroupByID(id=groupID)
                url = request.params.get('url')
                event_data = json.dumps({"type":"artifact", "id":request.params.get('objectID'), "url": url, "title": title, "member": member, "group_name": group.name, "groupID": group.id})

                kwargs = {}
                log.info('Request Params: %s' %(request.params))
                kwargs['groupID'] = groupID
                kwargs['ownerID'] = user.id
                kwargs['objectID'] = objectID
                kwargs['objectType'] = 'artifact'
                kwargs['activityType'] = 'share'
                kwargs['activityData'] = event_data
                tx = utils.transaction(self.getFuncName())
                with tx as session:
                    groupActivity = api._addGroupActivity(session, **kwargs)
                    session.flush()
                    result['response']['result'][groupID] = groupActivity.asDict()

                eventTypeName = 'GROUP_SHARE_WEB'
                eventType = api.getEventTypeByName(eventTypeName)
                notificationFilters = [('eventTypeID', eventType.id), ('groupID', groupID)]
                n.createEventForTypeHelper(eventTypeName, user.id, event_data, groupID, 'group', False, notificationFilters)

                eventTypeName = 'GROUP_SHARE'
                eventType = api.getEventTypeByName(eventTypeName)
                notificationFilters = [('eventTypeID', eventType.id), ('groupID', groupID),('frequency','instant')]
                n.createEventForTypeHelper(eventTypeName, user.id, event_data, groupID, 'group', True, notificationFilters)
                #XXX: Verify with Nimish
                '''
                event = api.createEventForType(typeName=eventTypeName, objectID=request.params.get('objectID'), objectType='artifact',
                    ownerID=user.id, eventData=event_data, processInstant=False)

                # the * len(notificationIDs) is required to match the lists
                h.processInstantNotifications([event.id] * len(notificationIDs), notificationIDs=notificationIDs, user=user.id, noWait=False)
                '''
            return result
        except Exception, e:
            log.error('share group Exception[%s]' % str(e))
            log.error('share group Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = -1
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, False, ['groupID', 'activityID'])
    @d.setPage(request, ['member', 'groupID', 'activityID'])
    @d.trace(log,['member', 'groupID', 'activityID'])
    def unshare(self, member, groupID, activityID):
        """
            Unshare / Remove shared resource
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        if groupID is None:
            groupID = request.params.get('groupID')
        if activityID is None:
            activityID = request.params.get('activityID')

        try:
            #
            # Check if activity exists
            #
            groupActivity = api.getGroupActivityByID(id=activityID, activityType='share')
            if not groupActivity:
                raise ex.InvalidArgumentException((_(u'Share activity with id=%s doesn\'t exist' % (activityID))).encode("utf-8"))
            #
            # Check if user is authorized for this group
            #
            isSuperAdmin = api.isGroupAdmin(groupID=1, memberID=member.id)
            isGroupAdmin = api.isGroupAdmin(groupID=groupID, memberID=member.id)
            isMember = api.isGroupMember(groupID=groupID, memberID=member.id)

            if not (isSuperAdmin or isGroupAdmin or isMember):
                raise ex.UnauthorizedException((_(u'You are not authorized to manipulate this group')).encode("utf-8"))
            #
            # Check if user is authorized to remove activity
            #
            if (isMember and groupActivity.ownerID == member.id) or (isSuperAdmin or isGroupAdmin):
                api.deleteGroupActivityByID(activityID)
                result['response']['success'] = 'true'
                return result
            else:
                raise ex.UnauthorizedException((_(u'You are not authorized to unshare this resource or artifact')).encode("utf-8"))
        except ex.InvalidArgumentException, iae:
            log.debug('update: Invalid Argument Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.INVALID_ARGUMENT
            return ErrorCodes().asDict(c.errorCode, str(iae))
        except ex.UnauthorizedException, uae:
            log.debug('update: Unauthorized Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
            return ErrorCodes().asDict(c.errorCode, str(uae))
        except Exception, e:
            log.error('share group Exception[%s]' % str(e))
            log.error('share group Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = -1
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.setPage(request, ['searchTerm'])
    @d.trace(log, ['searchTerm','pageNum', 'pageSize'])
    def searchGroups(self, searchTerm, pageNum=1, pageSize=10):
        """
            Search Public Groups
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            groups = api.searchGroups(searchTerm,pageNum,pageSize)
            groupsList = []
            for each_group in groups:
                groupsList.append(each_group.asDict())
            result['response']['groups'] = {}
            result['response']['groups']['result'] = groupsList
            result['response']['groups']['total'] = groups.total
            return result
        except Exception, e:
            log.error('search group Exception[%s]' % str(e))
            log.error('search group Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = -1
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log)
    def addGroupActivity(self):
        """
            Creates a new group activity
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            user = u.getCurrentUser(request)
            groupID = request.params.get('groupID')

            isSuperAdmin = api.isGroupAdmin(groupID=1, memberID=user.id)
            isGroupAdmin = api.isGroupAdmin(groupID=groupID, memberID=user.id)
            isMember = api.isGroupMember(groupID=groupID, memberID=user.id)

            if not (isSuperAdmin or isGroupAdmin or isMember):
                raise ex.UnauthorizedException((_(u'You are not authorized to manipulate this group')).encode("utf-8"))

            kwargs = {}
            kwargs['groupID'] = groupID
            kwargs['ownerID'] = user.id
            kwargs['objectID'] = request.params.get('objectID')
            kwargs['objectType'] = request.params.get('objectType')
            kwargs['activityType'] = request.params.get('activityType')
            kwargs['activityData'] = request.params.get('activityData')
            try:
                kwargs['activityData'] = h.safe_decode(base64.b64decode(kwargs['activityData']))
            except TypeError:
                log.warn("Could not decode activityData")
            #kwargs['url'] = request.params.get('url')
            tx = utils.transaction(self.getFuncName())
            with tx as session:
                groupActivity = api._addGroupActivity(session, **kwargs)
                session.flush()
                result['response']['result'] = groupActivity.asDict()
            return result
        except Exception, e:
            log.error('add group activity Exception[%s]' % str(e))
            log.error('add group activity Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = -1
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, False, ['activityIDs'])
    @d.trace(log, ['member', 'activityIDs'])
    def updateMemberActivityStatus(self, member, activityIDs):
        """
            Marks given activityID as viewed for current user
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            tx = utils.transaction(self.getFuncName())
            with tx as session:
                for activityID in activityIDs.split(','):
                    activity = api._getGroupActivityByID(session, id=int(activityID))
                    if activity:
                        kwargs = {}
                        kwargs['groupID'] = activity.groupID
                        kwargs['activityID'] = activity.id
                        kwargs['memberID'] = member.id
                        api._updateMemberActivityStatus(session, **kwargs)
                    else:
                        raise NotFoundException((_(u'No such activity with id [%s]' % activityID)).encode("utf-8"))

            result['response']['result'] = True
            return result
        except Exception, e:
            log.error('Update group activity status Exception[%s]' % str(e))
            log.error('Update group activity status Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = -1
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log)
    def deleteGroupActivity(self):
        """
            Deletes a group activity
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            user = u.getCurrentUser(request)
            groupID = request.params.get('groupID')

            isSuperAdmin = api.isGroupAdmin(groupID=1, memberID=user.id)
            isGroupAdmin = api.isGroupAdmin(groupID=groupID, memberID=user.id)
            isMember = api.isGroupMember(groupID=groupID, memberID=user.id)

            if not (isSuperAdmin or isGroupAdmin or isMember):
                raise ex.UnauthorizedException((_(u'You are not authorized to manipulate this group')).encode("utf-8"))

            activityID = request.params.get('activityID')
            objectID = request.params.get('objectID')
            objectType = request.params.get('objectType')
            activityType = request.params.get('activityType')

            if activityID:
                res = api.deleteGroupActivityByID(activityID)
            elif objectID and objectType and activityType:
                kwargs = {}
                kwargs['groupID'] = groupID
                kwargs['objectID'] = request.params.get('objectID')
                kwargs['objectType'] = request.params.get('objectType')
                kwargs['activityType'] = request.params.get('activityType')
                res = api.deleteGroupActivity(**kwargs)
            else:
                c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
                msg = 'Required params are missing'
                return ErrorCodes().asDict(c.errorCode, msg)

            result['response']['result'] = {'isDeleted': True if res else False}
            return result
        except Exception, e:
            log.error('delete group activity Exception[%s]' % str(e))
            log.error('delete group activity Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = -1
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, False)
    @d.trace(log, ['member'])
    def updateGroupQAstatus(self, member):
        """
        function to create/update event to disable/enable group QA access
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            groupID = request.params.get('groupID')
            typeName = request.params.get('typeName')
            event = None

            if api.isGroupAdmin(groupID=groupID, memberID=member.id):
                eventTypeDict,eventTypeNameDict = g.getEventTypes()
                if typeName == 'GROUP_QA_STATUS':
                    enableQA = request.params.get('enableQA')
                    if not enableQA:
                        raise ex.UnauthorizedException((_(u"Please provide parameter 'enableQA' with value True/False.")).encode("utf-8"))
                    enableQA = True if enableQA.lower() in ['yes', 'true'] else False
                    typeID = eventTypeNameDict.get(typeName)
                    if typeID is None:
                        raise Exception((_(u'updateGroupQAstatus: Invalid type: %(typeName)s')  % {"typeName":typeName}).encode("utf-8"))
                    events = api.getEventsForObject(objectID=groupID, objectType='group', eventTypeIDs=[typeID])
                    if events:
                        event = api.updateEventForType(id=events[0].id, eventData=json.dumps({"enableQA": enableQA}))
                    else:
                        event = api.createEventForType(typeName=typeName, objectID=groupID, objectType='group',
                                eventData=json.dumps({"enableQA": enableQA}), ownerID=member.id, processInstant=False)
                elif typeName == 'GROUP_QA_ANONYMOUS_PERMISSION':
                    allowAnonymous = request.params.get('allowAnonymous')
                    if not allowAnonymous:
                        raise ex.UnauthorizedException((_(u"Please provide parameter 'allowAnonymous' with value True/False.")).encode("utf-8"))
                    allowAnonymous = True if allowAnonymous.lower() in ['yes', 'true'] else False
                    typeID = eventTypeNameDict.get(typeName)
                    if typeID is None:
                        raise Exception((_(u'allowGroupQAuserAnonymousIdentity: Invalid type: %(typeName)s')  % {"typeName":typeName}).encode("utf-8"))
                    events = api.getEventsForObject(objectID=groupID, objectType='group', eventTypeIDs=[typeID])
                    if events:
                        event = api.updateEventForType(id=events[0].id, eventData=json.dumps({"allowAnonymous": allowAnonymous}))
                    else:
                        event = api.createEventForType(typeName=typeName, objectID=groupID, objectType='group',
                                eventData=json.dumps({"allowAnonymous": allowAnonymous}), ownerID=member.id, processInstant=False)
                else:
                    pass

            else:
                raise ex.UnauthorizedException((_(u"Only Group admin can change Q&A settings.")).encode("utf-8"))
            if event:
                result['response']['event'] = event.asDict()
            return result
        except Exception, e:
            log.error('Group Q&A status Exception[%s]' % str(e))
            c.errorCode = -1
            return ErrorCodes().asDict(c.errorCode, str(e))
