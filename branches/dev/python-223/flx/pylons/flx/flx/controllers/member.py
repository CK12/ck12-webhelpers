import logging
import json

from datetime import datetime
from pylons.i18n.translation import _
from pylons import request, response, config, session, tmpl_context as c
from pylons import app_globals as g

from flx.controllers import decorators as d
from flx.controllers.common import ArtifactCache
from flx.model import api, utils
#from flx.model import model
from flx.model import exceptions as ex
from flx.lib.base import BaseController, render
import flx.lib.helpers as h
from flx.lib.ck12.exceptions import RemoteAPIStatusException
import flx.controllers.user as u

from flx.controllers.errorCodes import ErrorCodes
log = logging.getLogger(__name__)

def getMember(id, member=None, useID=True):
    """
        Retrieves the member that matches the given id, login or email.

        The useID will be False if the caller is from external login
        because login using member ID is not supported.
    """
    if not member:
        login = None
        email = None
        if id is None:
            if request.params.has_key('login'):
                login = request.params['login']
            elif request.params.has_key('email'):
                email = request.params['email']
        elif not useID:
            login = id
            email = id
            id = None
        member = api.getMember(id=id, login=login, email=email)
        if not member:
            raise ex.NotFoundException((_(u"Member '%(id)s' does not exist.")  % {"id":id}).encode("utf-8"))
    return member


def getDict(member, moreDetails=False):
    favoriteCount = api.getFavoriteCount(memberID=member.id)
    #feedbackCount = api.getFeedbackCount(memberID=member.id)
    viewedCount = api.getMemberViewedArtifactCount(id=member.id)
    memberDict = {}
    memberDict['authID'] = member.id
    memberDict['id'] = member.id
    memberDict['login'] = member.login
    memberDict['email'] = member.email
    memberDict['firstName'] = member.givenName
    memberDict['lastName'] = member.surname
    if not member.givenName and not member.surname:
        memberDict['firstName'] = member.email
    memberDict['favoriteCount'] = favoriteCount
    #memberDict['feedbackCount'] = feedbackCount
    memberDict['viewedCount'] = viewedCount
    memberGroup = api.getMemberGroup(id=member.id, groupID=1)
    roles = []
    for mg in memberGroup:
        roleDict = mg.role.asDict()
        roles.append(roleDict)
    memberDict['roles'] = roles

    if member.grades is not None:
        grades = member.grades
    else:
        mgs = api.getMemberHasGrades(member.id)
        log.debug('getDict: mgs%s' % mgs)
        gradeIDs = []
        for mg in mgs:
            gradeIDs.append(mg.gradeID)
        if not gradeIDs:
            grades = None
        else:
            grades = api.getGrades(idList=gradeIDs, pageNum=1, pageSize=100)
    log.debug('getDict: grades%s' % grades)
    memberDict['grades'] = []
    if grades:
        for grade in grades:
            memberDict['grades'].append(grade.asDict())

    if member.subjects is not None:
        subjects = member.subjects
    else:
        mss = api.getMemberHasSubjects(member.id)
        log.debug('getDict: mss%s' % mss)
        subjectIDs = []
        for ms in mss:
            subjectIDs.append(ms.subjectID)
        if not subjectIDs:
            subjects = None
        else:
            subjects = api.getSubjects(idList=subjectIDs, pageNum=1, pageSize=100)
    log.debug('getDict: subjects%s' % subjects)
    memberDict['subjects'] = []
    if subjects:
        for subject in subjects:
            memberDict['subjects'].append(subject.asDict())

    memberDict['userLocation'] = session.get('userLocation', None)
    memberDict['userSchool'] = session.get('userSchool', None)
    memberDict['userImage'] = session.get('userImage', None)
    return memberDict

class MemberController(BaseController):
    """
        Member related APIs.
    """

    def __before__(self):
        c.errorCode = ErrorCodes.OK
        cookies = request.cookies
        #If user-name or user-image updated from auth pages, get latest user information
        if 'flxapi-invalidate-client' in cookies.keys() and cookies.get('flxapi-invalidate-client', None) == 'true':
            log.debug('Got invalidate-client cookies in request[%s]. Invaliting client....' % cookies)
            try:
                self.updateMyInfo()
            except Exception,e:
                log.exception(e)
            finally:
                response.delete_cookie('flxapi-invalidate-client',domain='.ck12.org')

    def _get(self, id, member=None):
        """
            Retrieves the member that matches the given id, login or email.
        """
        if id is None:
            if request.params.has_key('id'):
                id = request.params['id']
        return getMember(id, member)

    #
    #  Get related APIs.
    #
    @d.jsonify()
    @d.sortable(request, ['id'])
    @d.filterable(request, ['id', 'sort'], noformat=True)
    @d.checkAuth(request, False, False, ['id', 'sort', 'fq'])
    @d.setPage(request, ['member', 'id', 'sort', 'fq'])
    @d.trace(log, ['member', 'id', 'sort', 'fq', 'pageNum', 'pageSize'])
    def get(self, member, fq, id=None, pageNum=0, pageSize=10, sort=None):
        """
            Retrieves the member that matches the given id or email address.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            if id is None:
                id = request.params.get('id')
            if id is not None:
                try:
                    id = long(id)
                    if id != member.id and not u.isMemberAdmin(member):
                        raise ex.UnauthorizedException((_(u'Only admin can view other members.')).encode("utf-8"))
                except ValueError:
                    if id != member.email and id != member.login and not u.isMemberAdmin(member):
                        raise ex.UnauthorizedException((_(u'Only admin can view other members.')).encode("utf-8"))
                member = self._get(id)
                memberDict = getDict(member)
                result['response'] = memberDict
                return result

            if not u.isMemberAdmin(member):
                raise ex.UnauthorizedException((_(u'Only admin can view other members.')).encode("utf-8"))

            if not fq:
                fq = [('adminOnly', 'false')]
            filterDict = {}
            for name, value in fq:
                value = True if value.lower() == 'true' else False
                filterDict[name] = value

            search = request.params.get('search')
            searchDict = {}
            if search is None:
                searchAll = request.params.get('searchAll')
            else:
                if len(search) > 0:
                    name, value = search.split(',')
                    searchDict[name] = value
                searchAll = None

            members = api.getMembers(sorting=sort,
                                     filterDict=filterDict,
                                     searchDict=searchDict,
                                     searchAll=searchAll,
                                     pageNum=pageNum,
                                     pageSize=pageSize)
            memberList = []
            for member in members:
                member = self._get(member.id, member)
                memberList.append(getDict(member))

            result['response']['total'] = members.getTotal()
            result['response']['limit'] = len(memberList)
            result['response']['offset'] = (pageNum - 1)*pageSize
            result['response']['result'] = memberList
            return result
        except Exception, e:
            log.error('get member Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.NO_SUCH_MEMBER
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, False, ['id'])
    @d.trace(log, ['member', 'id'])
    def getMemberByAuthID(self, member, id=None):
        """
            Retrieves the member that matches the given id or email address.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            if id is None:
                id = request.params.get('id')
            if id is not None:
                try:
                    id = long(id)
                    if id != member.id and not u.isMemberAdmin(member):
                        raise ex.UnauthorizedException((_(u'Only admin can view other members.')).encode("utf-8"))
                except ValueError:
                    if id != member.email and id != member.login and not u.isMemberAdmin(member):
                        raise ex.UnauthorizedException((_(u'Only admin can view other members.')).encode("utf-8"))
                member = api.getMemberByAuthID(id=id)
                memberDict = getDict(member)
                result['response'] = memberDict
                return result
        except Exception, e:
            log.error('get member Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.NO_SUCH_MEMBER
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log, ['id'])
    def getMemberRole(self, id):
        """
            Retrieves the member roles as a dictionary with identifiers as
            the keys and the role names as the values.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            memberRole = api.getMemberRole(id=id)
            memberRoleDict = memberRole.asDict() if memberRole is not None else {}
            result['response'] = memberRoleDict
            return result
        except Exception, e:
            log.error('get member role Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.RETRIEVAL_ERROR
            return ErrorCodes().asDict(c.errorCode, str(e))

    def _getMemberRoles(self, getRolePermission=False):
        """
            Retrieves the member roles as a dictionary with identifiers as
            the keys and the role names as the values.
        """
        memberRoles = api.getMemberRoles()
        memberRoleDict = {}
        for memberRole in memberRoles:
            if getRolePermission:
                memberRoleDict[memberRole.id] = {'name': memberRole.name, 'is_admin_role': memberRole.is_admin_role}
            else:
                memberRoleDict[memberRole.id] =  memberRole.name
        return memberRoleDict

    @d.jsonify()
    @d.trace(log)
    def getMemberRoles(self):
        """
            Retrieves the member roles as a dictionary with identifiers as
            the keys and the role names as the values.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            result['response'] = self._getMemberRoles()
            return result
        except Exception, e:
            log.error('get member roles Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.RETRIEVAL_ERROR
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, True, False, ['id'])
    @d.trace(log, ['member', 'id'])
    def getMemberGroups(self, member, id=None):

        """
            Retrieves the member group as a dictionary with identifiers as
            the keys and the group names as the values.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            if id is None:
                id = member.id
            member = self._get(id, member)
            memberRoleDict = self._getMemberRoles(getRolePermission=True)
            groups = api.getMemberGroupsWithName(id=member.id)
            groupDict = {}
            groupID = None
            roleList = []
            for ghm, name in groups:
                log.debug('getMemberGroups: name[%s]' % name)
                if groupID != ghm.groupID:
                    if groupID is not None:
                        groupDict[groupID]['roles'] = roleList
                    roleList = []
                    roleID = ghm.roleID
                    roleList.append({ roleID: memberRoleDict[roleID] })
                    groupID = ghm.groupID
                    groupDict[ghm.groupID] = {
                        'id': ghm.groupID,
                        'name': name,
                    }
                else:
                    roleID = ghm.roleID
                    roleList.append({ roleID: memberRoleDict[roleID] })
            if groupID is not None:
                groupDict[groupID]['roles'] = roleList
            groupList = []
            for ghm, name in groups:
                groupList.append(groupDict[ghm.groupID])
            result['response'] = groupList
            return result
        except Exception, e:
            log.error('get member roles Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.RETRIEVAL_ERROR
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, True, False, ['id', 'type'])
    @d.setPage(request, ['member', 'id', 'type'])
    @d.trace(log, ['member', 'id', 'type', 'pageNum', 'pageSize'])
    def getViewedArtifacts(self, member, type, id=None, pageNum=0, pageSize=10):
        """
            Retrieves the artifacts the given or logged in member has viewed.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            if id is None:
                id = member.id
            member = self._get(id, member)
            viewed = api.getMemberViewedArtifacts(id=id,
                                                  typeName=type,
                                                  pageNum=pageNum,
                                                  pageSize=pageSize)
            idList = []
            n = 0
            for v in viewed:
                idList.append([ v.artifactID, v ])
                n += 1
            artifactDictList = []
            for id, artifact in idList:
                artifactDict, artifact = ArtifactCache().load(id, memberID=member.id, artifact=artifact)
                artifactDictList.append(artifactDict)
            result['response']['total'] = viewed.getTotal()
            result['response']['limit'] = len(artifactDictList)
            result['response']['offset'] = (pageNum - 1)*pageSize
            #result['response']['result'] = dictList
            result['response']['result'] = artifactDictList
            return result
        except Exception, e:
            log.error('get viewed artifacts Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.RETRIEVAL_ERROR
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, True, False, ['type', 'id'])
    @d.setPage(request, ['member', 'type', 'id'])
    @d.trace(log, ['member', 'type', 'id', 'pageNum', 'pageSize'])
    def getFavorites(self, member, type, pageNum, pageSize, id=None):
        """
            Retrieves the favorites of the given or logged in member.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            if id is None:
                id = member.id
            member = self._get(id, member)
            favorites = api.getFavorites(memberID=id,
                                         typeName=type,
                                         pageNum=pageNum,
                                         pageSize=pageSize)
            if len(favorites) == 0:
                dictList = []
            else:
                idList = []
                n = 0
                for favorite in favorites:
                    idList.append([ favorite.artifactID, favorite ])
                    n += 1
                dictList = []
                for aid, favorite in idList:
                    artifactDict, artifact = ArtifactCache().load(aid, memberID=member.id)
                    dictList.append(artifactDict)
            result['response']['total'] = favorites.getTotal()
            result['response']['limit'] = len(favorites)
            result['response']['offset'] = (pageNum - 1)*pageSize
            result['response']['result'] = dictList
            return result
        except Exception as e:
            log.error('get favorites Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.RETRIEVAL_ERROR
            return ErrorCodes().asDict(c.errorCode, str(e))

    #
    #  Create related APIs.
    #
    def _createForm(self):
        memberRoles = api.getMemberRoles()
        c.memberRoleDict = {}
        for memberRole in memberRoles:
            c.memberRoleDict[str(memberRole.id)] = memberRole.name

        c.keys = sorted(c.memberRoleDict.keys(), cmp=h.num_compare)

        c.memberList = [
            'firstName',
            'lastName',
            'login',
            'token',
            'email',
        ]
        c.prefix = self.prefix
        return render('/flx/member/createForm.html')

    @d.trace(log)
    def createForm(self):
        return self._createForm()

    def _setupMemberRoles(self, isAdmin):
        roleDict = {}
        roleKeys = []
        memberRoleDict, memberRoleNameDict = g.getMemberRoles()
        memberRoleKeys = memberRoleDict.keys()
        for roleID in memberRoleKeys:
            name = memberRoleDict[roleID]
            lname = name.lower()
            if isAdmin or lname == 'student' or lname == 'teacher':
                roleDict[roleID] = name
                roleKeys.append(roleID)
        return roleDict, roleKeys

    @d.trace(log)
    def _create(self, session):
        """
            Creates a new member.
        """
        if request.params.has_key('login'):
            login = request.params['login']
        else:
            login = ''
        if request.params.has_key('defaultLogin'):
            defaultLogin = request.params['defaultLogin']
        else:
            defaultLogin = login
        if request.params.has_key('firstName'):
            givenName = request.params['firstName']
        elif request.params.has_key('givenName'):
            givenName = request.params['givenName']
        else:
            givenName = ''
        if request.params.has_key('lastName'):
            surname = request.params['lastName']
        elif request.params.has_key('surname'):
            surname = request.params['surname']
        else:
            surname = ''
        if request.params.has_key('authID'):
            authID = request.params['authID']
        else:
            raise Exception((_(u'Account cannot be created here directly. Call auth.')).encode("utf-8"))
        if request.params.has_key('email'):
            email = request.params['email']
            if email is None or email == '':
                raise Exception((_(u'Email is required')).encode("utf-8"))
        else:
            raise Exception((_(u'Email is required')).encode("utf-8"))

        memberRoleDict, memberRoleNameDict = g.getMemberRoles(session=session)
        roleID = memberRoleNameDict.get('member', 'Member')
        roleID = request.params.get('roleID', roleID)

        member = api._createMember(session,
                                   givenName=givenName,
                                   surname=surname,
                                   login=login,
                                   defaultLogin=defaultLogin,
                                   email=email,
                                   roleID=roleID,
                                   authID=authID)
        return member

    @d.jsonify()
    @d.checkAuth(request, False, False, ['groupID'])
    @d.trace(log, ['member', 'groupID'])
    def createU13InGroup(self, member, groupID):
        """
            Creates a new under 13 member through group admin.
        """
        try:
            groupID = int(groupID)

            givenName = request.params.get('givenName')
            if not givenName:
                c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
                msg = 'Name cannot be empty'
                return ErrorCodes().asDict(c.errorCode, msg)

            surname = request.params.get('surname')

            username = request.params.get('username')
            if not username:
                c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
                msg = 'username cannot be empty'
                return ErrorCodes().asDict(c.errorCode, msg)

            password = request.params.get('password')
            if not password:
                c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
                msg = 'password cannot be empty'
                return ErrorCodes().asDict(c.errorCode, msg)

            if not member.email:
                log.error('Member does not have email. Possibly under 13')
                c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
                return ErrorCodes().asDict(c.errorCode, 'You are not authorized')

            group = api.getGroupByID(id=groupID)
            if group is None:
                msg = 'No such group %d' % groupID
                log.error(msg)
                c.errorCode = ErrorCodes.NO_SUCH_GROUP
                return ErrorCodes().asDict(c.errorCode, msg)

            if group.groupType != 'class':
                msg = 'This operation is supported only in "class" groups. %d is %s' % (groupID, group.groupType)
                log.error(msg)
                c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
                return ErrorCodes().asDict(c.errorCode, msg)

            isAdmin = api.isGroupAdmin(groupID=group.id, memberID=member.id)
            if not isAdmin:
                msg = 'Only group admin can create under 13 member. %d is not an admin for %d' % (member.id, groupID)
                log.error(msg)
                c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
                return ErrorCodes().asDict(c.errorCode, msg)

            memberRoleDict, memberRoleNameDict = g.getMemberRoles()

            from flx.lib.remoteapi import RemoteAPI
            apiUrl = '/create/member/u13'
            params_dict = {
                'givenName': givenName,
                'surname': surname or '',
                'login': username,
                'password': password,
                'roleID': memberRoleNameDict['student']
            }
            apiResp = RemoteAPI.makeAuthServiceCall(apiUrl, params_dict=params_dict)

            resp = apiResp['response']
            data = {
                'authID': resp.get('id'),
                'email': resp.get('email'),
                'login': resp.get('login'),
                'defaultLogin': resp.get('defaultLogin'),
                'givenName': resp.get('givenName'),
                'surname': resp.get('surame'),
                'roleID': resp.get('roleID'),
            }
            user = api.createMember(**data)

            kwargs = {'group': group, 'memberID': user.id}
            gresp = api.addMemberToGroup(**kwargs)

            if gresp['is_user_added']:
                result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
                result['response'] = dict(resp.items() + gresp.items())
                return result
            else:
                msg = 'User %d was added, but not added to group %d : %s' % (user.id, groupID, str(gresp))
                log.error(msg)
                c.errorCode = ErrorCodes.CANNOT_ADD_MEMBER_TO_GROUP
                return ErrorCodes().asDict(c.errorCode, msg)
        except RemoteAPIStatusException as e:
            log.error('create member Exception[%s]' % e.api_message)
            c.errorCode = e.status_code
            return ErrorCodes().asDict(c.errorCode, e.api_message)
        except Exception, e:
            log.error('create member Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.CANNOT_CREATE_MEMBER
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, False, ['id'])
    @d.trace(log, ['member', 'id'])
    def sync(self, member, id):
        """
            Sync from auth.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        memberID = member.id

        try:
            tx = utils.transaction(self.getFuncName())
            with tx as session:
                m = api._getMemberByID(session, id=id)
                if not m:
                    c.errorCode = ErrorCodes.UNKNOWN_MEMBER
                    raise ex.UnauthorizedException((_(u'No such member.')).encode("utf-8"))

                if m.id != memberID and not u.isMemberAdmin(member, session=session):
                    tsrel = api._getTeacherStudentRelations(session, studentID=m.id, teacherID=memberID)
                    if not tsrel:
                        c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
                        raise ex.UnauthorizedException((_(u'Only admin can update other members.')).encode("utf-8"))

                from flx.lib.remoteapi import RemoteAPI

                apiUrl = '/get/member/%s' % id
                apiResp = RemoteAPI.makeAuthServiceCall(apiUrl)
                resp = apiResp['response']
                log.debug('sync: resp[%s]' % resp)
                dirty = False
                givenName = resp.get('firstName', None)
                if givenName and givenName != m.givenName:
                    m.givenName = givenName
                    dirty = True
                surname = resp.get('lastName', None)
                if surname is not None and surname != m.surname:
                    m.surname = surname
                    dirty = True
                email = resp.get('email', None)
                if email and email != m.email:
                    m.email = email
                    dirty = True
                login = resp.get('login', None)
                if login and login != m.login:
                    m.login = login
                    dirty = True
                if dirty:
                    session.add(m)
                result['response'] = m.asDict()
            return result
        except Exception as e:
            log.error('sync: Exception[%s]' % str(e))
            if c.errorCode == ErrorCodes.OK:
                c.errorCode = ErrorCodes.CANNOT_UPDATE_MEMBER
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log)
    def create(self):
        """
            Creates a new member.
            ##################################################################
            # THIS API IS BEING USED BY EXTERNAL CLIENTS AND APPLICATIONS
            # PLEASE MAINTAIN BACKWARD COMPATIBILITY AT ALL TIMES
            ##################################################################
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            tx = utils.transaction(self.getFuncName())
            with tx as session:
                member = self._create(session)
                result['response'] = {
                    'id': member.id,
                    'email': member.email,
                    'login': member.login,
                }
            return result
        except Exception, e:
            log.error('create member Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.CANNOT_CREATE_MEMBER
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, True)
    @d.trace(log, ['member'])
    def addStudent(self, member):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        memberID = member.id

        try:
            tx = utils.transaction(self.getFuncName())
            with tx as session:
                login = request.params.get('login', None)
                if not login:
                    raise ex.InvalidArgumentException((_(u'Missing login.')).encode("utf-8"))

                studentMember = api._getMemberByLogin(session, login)
                if not studentMember:
                    studentMember = self._create(session)
                    if not hasattr(studentMember, 'id') or not studentMember.id:
                        session.flush()

                tsr = api._createTeacherStudentRelation(session, studentID=studentMember.id, teacherID=memberID)
                log.debug('addStudent: tsr[%s]' % tsr)
                result['response'] = {
                    'studentID': studentMember.id,
                    'teacherID': memberID,
                    'creationTime': tsr.creationTime,
                }
            log.debug('addStudent: result[%s]' % result)
            return result
        except Exception as e:
            log.debug('addStudent: Exception[%s]' % str(e), exc_info=e)
            if c.errorCode == ErrorCodes.OK:
                c.errorCode = ErrorCodes.CANNOT_CREATE_MEMBER
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, True)
    @d.setPage(request, ['member'])
    @d.trace(log, ['member', 'pageNum', 'pageSize'])
    def getMyStudents(self, member, pageNum, pageSize):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        memberID = member.id
        groupID = request.params.get('groupID', None)

        try:
            tx = utils.transaction(self.getFuncName())
            with tx as session:
                myStudentList = api._getMyStudents(session, teacherID=memberID, pageNum=pageNum, pageSize=pageSize)
                if groupID:
                    joinedStudentDict = {}
                    joinedStudentList = api._getMemberIDsForGroupIDs(session, groupIDs=[ groupID ])
                    for joinedStudentID in joinedStudentList:
                        joinedStudentDict[joinedStudentID] = True
                myStudents = []
                for myStudent in myStudentList:
                    myStudentDict = myStudent.asDict(includePersonal=True)
                    if groupID:
                        isMemberOfList = []
                        if joinedStudentDict.get(myStudent.id):
                            isMemberOfList.append(groupID)
                        myStudentDict['isMemberOf'] = isMemberOfList
                    myStudents.append(myStudentDict)
                result['response'] = {
                    'students': myStudents,
                    'limit': len(myStudents),
                    'offset': (pageNum - 1)*pageSize,
                    'total': myStudentList.getTotal(),
                }
            log.debug('getMyStudents: result[%s]' % result)
            return result
        except Exception as e:
            log.debug('getMyStudents: Exception[%s]' % str(e), exc_info=e)
            if c.errorCode == ErrorCodes.OK:
                c.errorCode = ErrorCodes.UNABLE_TO_GET_MEMBERS
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, True)
    @d.setPage(request, ['member'])
    @d.trace(log, ['member', 'pageNum', 'pageSize'])
    def getMyAddedStudents(self, member, pageNum, pageSize):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        memberID = member.id
        studentID = request.params.get('studentID', None)
        groupID = request.params.get('groupID', None)

        try:
            tx = utils.transaction(self.getFuncName())
            with tx as session:
                myStudentList = api._getTeacherStudentRelations(session, studentID=studentID, teacherID=memberID, pageNum=pageNum, pageSize=pageSize)
                if groupID:
                    joinedStudentDict = {}
                    joinedStudentList = api._getMemberIDsForGroupIDs(session, groupIDs=[ groupID ])
                    for joinedStudentID in joinedStudentList:
                        joinedStudentDict[joinedStudentID] = True
                myStudents = []
                for myStudent in myStudentList:
                    myStudentDict = myStudent.asDict()
                    if groupID:
                        isMemberOfList = []
                        if joinedStudentDict.get(myStudent.studentID):
                            isMemberOfList.append(groupID)
                        myStudentDict['isMemberOf'] = isMemberOfList
                    myStudents.append(myStudentDict)
                result['response'] = {
                    'students': myStudents,
                    'limit': len(myStudents),
                    'offset': (pageNum - 1)*pageSize,
                    'total': myStudentList.getTotal(),
                }
            log.debug('getMyStudents: result[%s]' % result)
            return result
        except Exception as e:
            log.debug('getMyStudents: Exception[%s]' % str(e), exc_info=e)
            if c.errorCode == ErrorCodes.OK:
                c.errorCode = ErrorCodes.UNABLE_TO_GET_MEMBERS
            return ErrorCodes().asDict(c.errorCode, str(e))

    #
    #  Update related APIs.
    #
    def _updateForm(self, member):
        memberRoles = api.getMemberRoles()
        c.memberRoleDict = {}
        for memberRole in memberRoles:
            c.memberRoleDict[str(memberRole.id)] = memberRole.name

        c.keys = sorted(c.memberRoleDict.keys(), cmp=h.num_compare)

        c.memberDict = {
            'id': member.id,
            'firstName': member.givenName,
            'lastName': member.surname,
            'login': member.login,
            'email': member.email,
        }
        c.memberList = [
            'firstName',
            'lastName',
            'login',
            'email',
        ]
        c.prefix = self.prefix
        return render('/%s/member/updateForm.html' % self.prefix)

    @d.checkAuth(request, True, True, ['id'])
    @d.trace(log, ['member', 'id'])
    def updateForm(self, member, id=None):
        if id is None:
            id = request.params.get('id')
        if not u.isMemberAdmin(member):
            id = member.id
        else:
            member = None
        member = self._get(id, member)
        return self._updateForm(member)

    def _update(self, member, id=None):
        """
            Updates member.
        """
        if id is None:
            id = request.params.get('id')
            if id is None:
                raise ex.InvalidArgumentException((_(u'Missing member id.')).encode("utf-8"))
        id = long(id)
        if id != member.id:
            if not u.isMemberAdmin(member):
                raise ex.UnauthorizedException((_(u'Only admin can update other members.')).encode("utf-8"))
            member = None
        member = self._get(id, member)
        #member = member.cache(model.INVALIDATE, instance=member)

        #loginChanged = False
        if request.params.has_key('login'):
            login = request.params['login']
            if login and login != member.login:
                login = login.strip()
                existMember = api.getMemberByLogin(login=login)
                if existMember is not None and existMember.id != member.id:
                    c.errorCode = ErrorCodes.LOGIN_BEING_USED_ALREADY
                    raise Exception((_(u"Login '%(login)s' is being used.")  % {"login":login}).encode("utf-8"))
                ## Try email match
                existMember = api.getMemberByEmail(email=login)
                if existMember is not None and existMember.id != member.id:
                    c.errorCode = ErrorCodes.LOGIN_BEING_USED_ALREADY
                    raise Exception((_(u"Login '%(login)s' is being used.")  % {"login":login}).encode("utf-8"))
                member.login = login
                #loginChanged = True
        if request.params.has_key('firstName'):
            member.givenName = request.params['firstName']
        elif request.params.has_key('givenName'):
            member.givenName = request.params['givenName']
        if request.params.has_key('lastName'):
            member.surname = request.params['lastName']
        elif request.params.has_key('surname'):
            member.surname = request.params['surname']
        if request.params.has_key('email'):
            email = request.params['email']
            """
            #
            #  Comment out to keep the login even after email
            #  changed.
            if member.login == member.email and not loginChanged:
                member.login = email
            """
            email = email.strip()
            if email and email != member.email:
                existMember = api.getMemberByEmail(email=email)
                if existMember is not None and existMember.id != member.id:
                    c.errorCode = ErrorCodes.EMAIL_BEING_USED_ALREADY
                    raise Exception((_(u"Email '%(email)s' is being used.")  % {"email":email}).encode("utf-8"))
                ## Try login match
                existMember = api.getMemberByLogin(login=email)
                if existMember is not None and existMember.id != member.id:
                    c.errorCode = ErrorCodes.EMAIL_BEING_USED_ALREADY
                    raise Exception((_(u"Email '%(email)s' is being used.")  % {"email":email}).encode("utf-8"))
            member.email = email

        member.updateTime = datetime.now()

        roleID = request.params.get('roleID')
        api.updateMember(member=member, roleID=roleID)
        return member

    @d.jsonify()
    @d.checkAuth(request, False, False, ['id'])
    @d.trace(log, ['member', 'id'])
    def update(self, member, id=None):
        """
            Updates member.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        c.errorCode = ErrorCodes.OK
        try:
            member = self._update(member, id)
            result['response']['id'] = member.id
            result['response']['email'] = member.email
            result['response']['login'] = member.login
            return result
        except Exception, e:
            if c.errorCode == ErrorCodes.OK:
                c.errorCode = ErrorCodes.CANNOT_UPDATE_MEMBER
            log.error('update member Exception[%s]' % str(e))
            return ErrorCodes().asDict(c.errorCode, str(e))

    def _updatePassword(self, id, member, password, oldPassword, isAdmin=False):
        """
            Updates member password.
        """
        member = self._get(id, member)

    @d.jsonify()
    @d.checkAuth(request, True, False, ['id'])
    @d.trace(log, ['member', 'id'])
    def activate(self, member, id=None):
        """
            Activates a member identified by his/her id.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            if not u.isMemberAdmin(member):
                raise ex.UnauthorizedException((_(u'Only admin can activate other members.')).encode("utf-8"))

            if id is None:
                if request.params.has_key('id'):
                    id = request.params['id']
                else:
                    c.errorCode = ErrorCodes.UNKNOWN_MEMBER
                    raise Exception((_(u'No member information provided.')).encode("utf-8"))
            member, alreadyActivated = api.activateMember(id=id)
            if member is None:
                c.errorCode = ErrorCodes.UNKNOWN_MEMBER
                raise Exception((_(u"Member '%(id)s' does not exist.")  % {"id":id}).encode("utf-8"))
            if alreadyActivated:
                c.errorCode = ErrorCodes.ALREADY_ACTIVATED_MEMBER
                raise Exception((_(u"Member '%(id)s' is already activated.")  % {"id":id}).encode("utf-8"))

            log.debug('Activated member[%s]' % member.id)
            userDict = {
                        'id': member.id,
                        'login': member.login,
                        'email': member.email,
                        'name': ('%s %s' % (member.givenName, member.surname)).strip(),
                       }
            result['response'] = userDict
            return result
        except Exception, e:
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, True, False, ['id'])
    @d.trace(log, ['member', 'id'])
    def deactivate(self, member, id=None):
        """
            Deactivates a member identified by his/her id.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            if not u.isMemberAdmin(member):
                raise ex.UnauthorizedException((_(u'Only admin can deactivate other members.')).encode("utf-8"))

            if id is None:
                if request.params.has_key('id'):
                    id = request.params['id']
                else:
                    c.errorCode = ErrorCodes.UNKNOWN_MEMBER
                    raise Exception((_(u'No member information provided.')).encode("utf-8"))
            member = api.deactivateMember(id=id)
            if member is None:
                raise Exception((_(u"Member '%(id)s' does not exist.")  % {"id":id}).encode("utf-8"))

            log.debug('Deactivated member[%s]' % member.id)
            userDict = {
                        'id': member.id,
                        'login': member.login,
                        'email': member.email,
                        'name': ('%s %s' % (member.givenName, member.surname)).strip(),
                       }
            result['response'] = userDict
            return result
        except Exception, e:
            c.errorCode = ErrorCodes.UNKNOWN_MEMBER
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, True, False, ['id'])
    @d.trace(log, ['member', 'id'])
    def disable(self, member, id=None):
        """
            Disables a member identified by his/her id.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            if not u.isMemberAdmin(member):
                raise ex.UnauthorizedException((_(u'Only admin can disable other members.')).encode("utf-8"))

            if id is None:
                if request.params.has_key('id'):
                    id = request.params['id']
                else:
                    c.errorCode = ErrorCodes.UNKNOWN_MEMBER
                    raise Exception((_(u'No member information provided.')).encode("utf-8"))
            member = api.disableMember(id=id)
            if member is None:
                raise Exception((_(u"Member '%(id)s' does not exist.")  % {"id":id}).encode("utf-8"))

            log.debug('Disableded member[%s]' % member.id)
            userDict = {
                        'id': member.id,
                        'login': member.login,
                        'email': member.email,
                        'name': ('%s %s' % (member.givenName, member.surname)).strip(),
                       }
            result['response'] = userDict
            return result
        except Exception, e:
            c.errorCode = ErrorCodes.UNKNOWN_MEMBER
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.trace(log, ['member', 'typeName', 'ruleName', 'frequency', 'groupID', 'objectID', 'objectType'])
    def _updateNotification(self, member, typeName, ruleName, frequency='instant', groupID=None, objectID=None, objectType=None):
        memberID = member.id
        if frequency is None:
            frequency = 'instant'
        else:
            frequency = 'instant' if frequency.lower() in [ 'yes', 'true' ] else frequency
            frequency = 'off' if frequency.lower() == 'no' else frequency

        envetTypeDict,eventTypeNameDict = g.getEventTypes()
        typeID = eventTypeNameDict.get(typeName)
        if typeID is None:
            raise Exception((_(u'_updateNotfiication: Invalid type: %(typeName)s')  % {"typeName":typeName}).encode("utf-8"))

        notificationRuleDict, notificationRuleNameDict = g.getNotificationRules()
        ruleID = notificationRuleNameDict.get(ruleName) if ruleName is not None else None

        # Delete the 'ph_post' object type of notifications which could've been previously set for the user.
        if frequency == "delete" and objectType == "ph_post" and objectID is None:
            notificationFilters = []
            notificationFilters.append(('eventTypeID', typeID))
            notificationFilters.append(('subscriberID', member.id))
            notificationFilters.append(('type', 'email'))
            notificationFilters.append(('groupID', groupID))
            notificationFilters.append(('objectType', objectType))
            notificationFilters = tuple(notificationFilters)
            notification = api.getNotificationsByFilter(filters=notificationFilters).results
            if notification:
                notification = list(notification)        
        else:
            ## Double check to make sure notification is unique for the subscriberID and eventTypeID
            notification = api.getUniqueNotification(eventTypeID=typeID, subscriberID=memberID, groupID=groupID, ruleID=ruleID, type='email', objectID=objectID, objectType=objectType)

        ## Check if the group is public forum and set 'resetLastSent' to True
        isPublicForum = False
        tx = utils.transaction(self.getFuncName())
        with tx as session:
            group = api._getGroupByID(session, id=groupID)      
            if group:
                isPublicForum = group.groupType in ['public-forum']

        if frequency == 'delete':
            # helper for GROUP_PH_POST deletion
            if isinstance(notification, list):
                for item in notification:
                    api.deleteNotification(id=item.id)
            else:
                if notification:
                    api.deleteNotification(id=notification.id)
        else:
            if not notification:
                api.createNotification(eventTypeID=typeID, subscriberID=memberID, groupID=groupID, ruleID=ruleID, type='email', frequency=frequency, objectID=objectID, objectType=objectType)
            else:
                if isPublicForum:
                    api.updateNotification(id=notification.id, frequency=frequency, resetLastSent=True)
                else:
                    api.updateNotification(id=notification.id, frequency=frequency)

    def _handleNotifications(self, member):
        newMaterial = request.params.get('newMaterial')
        if newMaterial is not None:
            self._updateNotification(member, 'ARTIFACT_RELATED_MATERIAL_ADDED', 'EXISTS_IN_LIBRARY', newMaterial)
        newUpdate = request.params.get('newUpdate')
        if newUpdate is not None:
            self._updateNotification(member, 'ARTIFACT_REVISION_CREATED', 'EXISTS_IN_LIBRARY', newUpdate)

        from flx.lib.remoteapi import RemoteAPI

        newNewsletter = request.params.get('newNewsletter')
        if newNewsletter is None:
            optout = False
            status = 'normal'
        else:
            optout = False if newNewsletter.lower() in ['yes', 'true'] else True
            status = 'normal' if newNewsletter.lower() in ['yes', 'true'] else 'donotcontact'

        # Remote call to marketing tool iContact/HubSpot
        apiUrl = '/set/marketingTool/contact'
        params_dict = {
            'status': status,
            'optout': optout
        }
        RemoteAPI.makeAuthServiceCall(apiUrl, params_dict=params_dict)

        if newNewsletter is not None:
            self._updateNotification(member, 'NEWSLETTER_PUBLISHED', None, newNewsletter)
        groupID = request.params.get('groupID')
        memberJoin = request.params.get('memberJoin')
        if memberJoin is not None and groupID is not None:
            self._updateNotification(member, 'GROUP_MEMBER_JOINED', None, memberJoin, groupID, objectID=groupID, objectType='group')
        resourceShared = request.params.get('resourceShared')
        if resourceShared is not None and groupID is not None:
            self._updateNotification(member, 'GROUP_SHARE', None, resourceShared, groupID, objectID=groupID, objectType='group')
            # Beluga related change
            if api.isGroupAdmin(groupID=groupID, memberID=member.id):
                self._updateNotification(member, 'GROUP_MEMBER_JOINED', None, resourceShared, groupID, objectID=groupID, objectType='group')
            self._updateNotification(member, 'ASSIGNMENT_ASSIGNED', None, resourceShared, groupID, objectID=groupID, objectType='group')
            self._updateNotification(member, 'ASSIGNMENT_DELETED', None, resourceShared, groupID, objectID=groupID, objectType='group')
        peerHelp = request.params.get('peerHelp')
        if peerHelp is not None and groupID is not None:
            if peerHelp == 'off':
                self._updateNotification(member, 'GROUP_PH_POST', None, 'off', groupID, objectID=groupID, objectType='group')
            else:
                onlyParticipation = request.params.get('onlyParticipation')
                if onlyParticipation is None:
                    self._updateNotification(member, 'PH_POST', None, 'delete', groupID, objectID=groupID, objectType='group')
                    #self._updateNotification(member, 'PH_POST', None, 'delete', groupID, objectType='ph_post')
                    self._updateNotification(member, 'GROUP_PH_POST', None, peerHelp, groupID, objectID=groupID, objectType='group')
                else:
                    self._updateNotification(member, 'GROUP_PH_POST', None, 'delete', groupID, objectID=groupID, objectType='group')
                    self._updateNotification(member, 'PH_POST', None, peerHelp, groupID, objectID=groupID, objectType='group')

    @d.jsonify()
    @d.checkAuth(request, False, False)
    @d.trace(log, ['member'])
    def updateNotifications(self, member):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            memberID = request.params.get('memberID', None)
            if memberID and memberID != member.id:
                if not u.isMemberAdmin(member):
                    raise ex.UnauthorizedException((_(u"Only admin can change others' notification settings.")).encode("utf-8"))
                member = api.getMemberByID(memberID)
            self._handleNotifications(member)
            return result
        except Exception, e:
            log.error('member updateNotification Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.CANNOT_UPDATE_NOTIFICATION
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, False)
    @d.trace(log, ['member'])
    def createNotifications(self, member):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            memberID = request.params.get('memberID', None)
            if memberID and memberID != member.id:
                if not u.isMemberAdmin(member):
                    raise ex.UnauthorizedException((_(u"Only admin can change others' notification settings.")).encode("utf-8"))
                member = api.getMemberByID(memberID)
            self._handleNotifications(member)
            return result
        except ex.UnauthorizedException, uae:
            c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
            return ErrorCodes().asDict(c.errorCode, str(uae))
        except Exception, e:
            log.error('member createNotifications Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.CANNOT_CREATE_NOTIFICATION
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log, ['member'])
    def getNotifications(self, member):
        try:
            result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            notifications = {}

            eventTypeDict, eventTypeNameDict = g.getEventTypes()
            notificationRuleDict, notificationRuleNameDict = g.getNotificationRules()

            eventTypes = ['ARTIFACT_RELATED_MATERIAL_ADDED', 'ARTIFACT_REVISION_CREATED']

            for eventType in eventTypes:
                notification = api.getUniqueNotification(
                    eventTypeID=eventTypeNameDict.get(eventType),
                    subscriberID=member.id, type='email',
                    ruleID=notificationRuleNameDict.get('EXISTS_IN_LIBRARY')
                )

                if notification:
                    notifications[eventType] = notification.asDict()
                else:
                    notifications[eventType] = {'frequency':'off'}

            eventType = 'NEWSLETTER_PUBLISHED'
            notification = api.getUniqueNotification(eventTypeID=eventTypeNameDict.get(eventType), subscriberID=member.id, type='email')
            if notification:
                notifications[eventType] = notification.asDict()
            else:
                notifications[eventType] = {'frequency':'instant'}

            member_groupIDs = [group.groupID for group in api.getMemberGroups(member.id) if group.groupID not in (1, 2)]
            groupIDs = []
            if request.params.has_key('groupID'):
                groupID = request.params.get('groupID')
                if groupID:
                    groupIDs.append(int(groupID))
            elif request.params.has_key('groupIDs'):
                groupIDs = request.params.get('groupIDs')
                if type(groupIDs) in (type(''), type(u''), type(r'')):
                    try:
                        groupIDs = json.loads(groupIDs)
                    except:
                        groupIDs = groupIDs.split(',')
                if type(groupIDs) != type([]):
                    raise Exception('invalid groupIDs parameter')
                groupIDs = [int(x) for x in groupIDs]
            else:
                groupIDs = member_groupIDs

            if groupIDs:
                eventTypes = ['GROUP_SHARE', 'GROUP_MEMBER_JOINED', 'GROUP_MEMBER_ACTIVATED', 'GROUP_MEMBER_DECLINED',
                    'GROUP_CREATE', 'GROUP_PH_POST', 'PH_POST',
                    'ASSIGNMENT_ASSIGNED', 'ASSIGNMENT_UNASSIGNED', 'ASSIGNMENT_UPDATED', 'ASSIGNMENT_DELETED']

                notificationFilters = []
                notificationFilters.append(('subscriberID', member.id))
                notificationFilters.append(('type', 'email'))
                for groupID in groupIDs:
                    notificationFilters.append(('groupID', groupID))
                    notificationFilters.append(('objectID', groupID))
                    notificationFilters.append(('objectType', 'group'))
                for eventType in eventTypes:
                    notificationFilters.append(('eventTypeID', eventTypeNameDict.get(eventType)))
                notificationFilters = tuple(notificationFilters)

                _notifications = api.getNotificationsByFilter(filters=notificationFilters).results

                _eventTypes = [x for x in eventTypes if x not in ['GROUP_PH_POST', 'PH_POST']]

                groupNotifications = {}
                for groupID in groupIDs:
                    if groupID in member_groupIDs:
                        groupNotifications[groupID] = dict((eventType, {'frequency': 'off'}) for eventType in _eventTypes)
                    else:
                        groupNotifications[groupID] = {'message': 'You are not a member of this group'}
                for n in _notifications:
                    n = n.asDict()
                    groupID = n['groupID']
                    if not groupNotifications.has_key(groupID):
                        groupNotifications[groupID] = dict((eventType, {'frequency': 'off'}) for eventType in _eventTypes)
                    groupNotifications[groupID][n['eventType']] = n

                for groupID in groupNotifications:
                    if groupID in member_groupIDs:
                        gn = groupNotifications[groupID]
                        if 'GROUP_PH_POST' not in gn and 'PH_POST' not in gn:
                            groupNotifications[groupID]['GROUP_PH_POST'] = {'frequency': 'off'}

                notifications['groupNotifications'] = groupNotifications

            result['response']['notifications'] = notifications
            return result
        except Exception, e:
            log.error('member get notifications Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.NO_SUCH_NOTIFICATION
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log, ['member'])
    def getNotifications1(self, member):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            result['response']['notifications'] = []
            eventTypes = {
                    'ARTIFACT_RELATED_MATERIAL_ADDED': {'ruleName': 'EXISTS_IN_LIBRARY', 'label': 'newMaterial'},
                    'ARTIFACT_REVISION_CREATED': {'ruleName': 'EXISTS_IN_LIBRARY', 'label': 'newUpdate'},
                    'NEWSLETTER_PUBLISHED': {'ruleName': None, 'label': 'newNewsletter' }
                    }

            groupID = request.params.get('groupID')
            if groupID is not None:
                isMember = api.isGroupMember(groupID=groupID, memberID=member.id)
                isSuperAdmin = api.isGroupAdmin(groupID=1, memberID=member.id)
                if not isMember and not isSuperAdmin:
                    c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
                    return ErrorCodes().asDict(c.errorCode, "You are not a member of this group")

                eventTypes.update({
                    'GROUP_MEMBER_JOINED': {'ruleName': None, 'label': 'memberJoin' },
                    'GROUP_SHARE': {'ruleName': None, 'label': 'resourceShared' },
                    'GROUP_PH_POST': {'ruleName': None, 'label': 'peerHelp' },
                })

            envetTypeDict, eventTypeNameDict = g.getEventTypes()
            notificationRuleDict, notificationRuleNameDict = g.getNotificationRules()
            for typeName in eventTypes.keys():
                ruleName = eventTypes[typeName]['ruleName']
                label = eventTypes[typeName]['label']
                typeID = eventTypeNameDict.get(typeName)
                ruleID = notificationRuleNameDict.get(ruleName) if ruleName else None
                notification = api.getUniqueNotification(eventTypeID=typeID, subscriberID=member.id,
                        groupID=groupID, ruleID=ruleID, type='email', objectID=groupID, objectType='group')
                result['response']['notifications'].append({ label: True if (notification and notification.frequency != 'off') else False })
                if notification:
                    result['response']['notifications'].append({typeName: notification.asDict()})
            return result
        except Exception, e:
            log.error('member get notifications Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.NO_SUCH_NOTIFICATION
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.setPage(request)
    @d.trace(log, ['pageNum', 'pageSize'])
    def getNewsletterSubscribers(self, pageNum=0, pageSize=10):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            envetTypeDict, eventTypeNameDict = g.getEventTypes()
            typeID = eventTypeNameDict.get('NEWSLETTER_PUBLISHED')
            notifications = api.getNotificationsForEventType(eventTypeID=typeID, frequencies=['instant'], pageNum=pageNum, pageSize=pageSize)
            idList = []
            for notification in notifications:
                idList.append(notification.subscriberID)
            members = api.getMembers(idList=idList)
            subscriberList = []
            for member in members:
                subscriberList.append({
                    'email': member.email,
                    'firstName': member.givenName,
                    'lastName': member.surname,
                })
            result['response']['total'] = notifications.getTotal()
            result['response']['limit'] = len(subscriberList)
            result['response']['offset'] = (pageNum - 1)*pageSize
            result['response']['result'] = subscriberList
            return result
        except Exception, e:
            log.error('member getNewsletterSubscribers Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.NO_SUCH_NOTIFICATION
            return ErrorCodes().asDict(c.errorCode, str(e))

    #
    #  Delete related APIs.
    #
    @d.jsonify()
    @d.checkAuth(request, False, False, ['id'])
    @d.trace(log, ['member', 'id'])
    def delete(self, member, id):
        """
            Deletes the given member identified by its email address.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        c.errorCode = ErrorCodes.OK
        try:
            if id != member.id:
                if not u.isMemberAdmin(member):
                    raise ex.UnauthorizedException((_(u'Only admin can delete other members.')).encode("utf-8"))
                member = None
            member = self._get(id, member)

            loggedInMember = u.getCurrentUser(request, anonymousOkay=True)
            u.checkOwner(loggedInMember, None, None)

            memberDict = {
                    'id': member.id,
                    'email': member.email,
                    'login': member.login,
                    }
            member = api.deleteMember(member=member)
            result['response'] = memberDict
            return result
        except ex.NotFoundException, nfe:
            c.errorCode = ErrorCodes.UNKNOWN_MEMBER
            return ErrorCodes().asDict(c.errorCode, str(nfe))
        except ex.UnauthorizedException, uae:
            c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
            return ErrorCodes().asDict(c.errorCode, str(uae))
        except Exception, e:
            log.error('member delete Exception[%s]' % str(e))
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, False, ['withDetails'])
    @d.trace(log, ['member', 'withDetails'])
    def getInfo(self, member, withDetails=False):
        """
            Get info for the logged in member
            ##################################################################
            # THIS API IS BEING USED BY EXTERNAL CLIENTS AND APPLICATIONS
            # PLEASE MAINTAIN BACKWARD COMPATIBILITY AT ALL TIMES
            ##################################################################
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            result['response'] = self._getUserDict(member, withDetails)
            return result
        except Exception, e:
            log.error("Error getting logged in member info: %s" % str(e), exc_info=e)
            c.errorCode = ErrorCodes.UNKNOWN_MEMBER
            return ErrorCodes().asDict(c.errorCode, str(e))

    def _getUserDict(self, member, withDetails=False):
        if not withDetails:
            userDict = {
                'id': member.id,
                'authID': member.id,
                'login': member.login,
                'email': member.email,
                'firstName': member.givenName,
                'lastName': member.surname,
            }
            if not member.givenName and not member.surname:
                userDict['firstName'] = member.email
            memberGroup = api.getMemberGroup(id=member.id, groupID=1)
            userDict['roles'] = [ mg.role.asDict() for mg in memberGroup ]
        else:
            userDict = getDict(member)
        return userDict

    @d.jsonify()
    @d.checkAuth(request, False, False)
    @d.trace(log, ['member'])
    def updateMyInfo(self, member):
        """
            Refresh info for the logged in member
            Basically, removes the login cookie and redirects to /get/info/my
               which should refresh the member info from auth
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            impersonatedMember = u.getImpersonatedMember(member, forceRefresh=True)
            log.info("member: %d, impersonatedMember: %s" % (member.id, impersonatedMember))
            if impersonatedMember and member.id != impersonatedMember.id:
                member = impersonatedMember
            else:
                log.info("Refreshing self: %d" % member.id)
                if session.has_key('userID'):
                    userID = session['userID']
                    log.info('_logout: session userID[%s]' % userID)
                    session['userID'] = None
                    session['email'] = None
                request.environ['REMOTE_USER'] = None
                try:
                    session.invalidate()
                    session.delete()
                except Exception:
                    pass
                member = u.getCurrentUser(request)
            result['response'] = self._getUserDict(member)
            return result
        except Exception, e:
            log.error("Error refreshing logged in member info: %s" % str(e), exc_info=e)
            c.errorCode = ErrorCodes.UNKNOWN_MEMBER
            return ErrorCodes().asDict(c.errorCode, str(e))

    #
    #  Role related APIs.
    #

    @d.jsonify()
    @d.checkAuth(request, False, False, ['roleID', 'id', 'groupID'])
    @d.trace(log, ['member', 'roleID', 'id', 'groupID'])
    def addMemberRole(self, member, roleID=None, id=None, groupID=None):
        """
            Add roleID to the given member.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            if id is None:
                id = request.params.get('id')
                if id is None:
                    id = member.id
            id = long(id)

            if id != member.id:
                if not u.isMemberAdmin(member):
                    raise ex.UnauthorizedException((_(u'Only admin can update other members.')).encode("utf-8"))
                member = None

            if roleID is None:
                roleID = request.params.get('roleID')
            if roleID is None:
                raise ex.InvalidArgumentException((_(u'Missing roleID.')).encode("utf-8"))

            member = self._get(id, member)
            memberID = member.id
            if groupID is None:
                groupID = 1
            memberGroup = api.getMemberGroup(id=memberID, groupID=groupID)
            roleID = int(roleID)
            for mg in memberGroup:
                if roleID == mg.roleID:
                    raise ex.AlreadyExistsException((_(u'RoleID %(roleID)s already exists.') % {'roleID': roleID}).encode("utf-8"))

            data = { 'memberID': memberID, 'groupID': groupID, 'roleID': roleID, 'statusID': 2, 'disableNotification': 0 }
            ghm = api.createGroupHasMember(**data)
            result['response'] = ghm.asDict()
            return result
        except ex.InvalidArgumentException, iae:
            log.debug('add member role InvalidArgumentException[%s]' % str(iae))
            c.errorCode = ErrorCodes.CANNOT_UPDATE_MEMBER
            return ErrorCodes().asDict(c.errorCode, str(iae))
        except ex.AlreadyExistsException, aee:
            log.debug('add member role AlreadyExistsException[%s]' % str(aee))
            c.errorCode = ErrorCodes.CANNOT_UPDATE_MEMBER
            return ErrorCodes().asDict(c.errorCode, str(aee))
        except Exception, e:
            log.exception('add member role Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.CANNOT_UPDATE_MEMBER
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, False, ['roleID', 'id', 'groupID'])
    @d.trace(log, ['member', 'roleID', 'id', 'groupID'])
    def removeMemberRole(self, member, roleID=None, id=None, groupID=None):
        """
            Remove roleID from the given member.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            if id is None:
                id = request.params.get('id')
                if id is None:
                    raise ex.InvalidArgumentException((_(u'Missing member id.')).encode("utf-8"))
            id = int(id)

            if id != member.id:
                if not u.isMemberAdmin(member):
                    raise ex.UnauthorizedException((_(u'Only admin can update other members.')).encode("utf-8"))
                member = None

            if roleID is None:
                roleID = request.params.get('roleID')
            if roleID is None:
                raise ex.InvalidArgumentException((_(u'Missing roleID.')).encode("utf-8"))

            member = self._get(id, member)
            memberID = member.id
            if groupID is None:
                groupID = 1
            memberGroup = api.getMemberGroup(id=memberID, groupID=groupID)
            groupHasMember = None
            roleID = int(roleID)
            for mg in memberGroup:
                if roleID == mg.roleID:
                    groupHasMember = mg
                    break
            if not groupHasMember:
                raise ex.NotFoundException((_(u'RoleID %(roleID)s does not exist.') % {'roleID': roleID}).encode("utf-8"))

            api.delete(groupHasMember)
            result['response'] = groupHasMember.asDict()
            return result
        except ex.InvalidArgumentException, iae:
            log.debug('remove member role InvalidArgumentException[%s]' % str(iae))
            c.errorCode = ErrorCodes.CANNOT_UPDATE_MEMBER
            return ErrorCodes().asDict(c.errorCode, str(iae))
        except ex.NotFoundException, aee:
            log.debug('remove member role NotFoundException[%s]' % str(aee))
            c.errorCode = ErrorCodes.CANNOT_UPDATE_MEMBER
            return ErrorCodes().asDict(c.errorCode, str(aee))
        except Exception, e:
            log.exception('remove member role Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.CANNOT_UPDATE_MEMBER
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.trace(log)
    def getDetail(self):
        return self.getInfo(withDetails=True)

    def _capitalize(self, s):
        if len(s) == 0:
            return s
        if len(s) == 1:
            return s.upper()

        l = s.split(' ')
        f = []
        for i in l:
            if len(i) == 0:
                continue
            if len(i) == 1:
                f.append(i.upper())
            else:
                f.append(i[0].upper() + i[1:])
        return ' '.join(f)

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log)
    def addMemberGrades(self):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            user = u.getCurrentUser(request)
            if user is None:
                raise Exception((_(u'No user found in request')).encode("utf-8"))

            gradeIDs = []
            param_gradeIDs = request.params.get('gradeIDs')
            if param_gradeIDs:
                gradeIDs = param_gradeIDs.split(',')
            kwargs = {'memberID': user.id, 'gradeIDs':gradeIDs}
            log.info(kwargs)
            result['response']['result'] = api.addOrUpdateMemberGrades(**kwargs)
        except Exception, e:
            log.error('membergrades exception: Exception[%s]' % str(e), exc_info=e)
        return result

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log)
    def getGradesByMember(self):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            user = u.getCurrentUser(request)
            if user is None:
                raise Exception((_(u'No user found in request')).encode("utf-8"))
            grades = user.grades
            gradesList = []
            for r in grades:
                gradesList.append(r.asDict())
            result['response']['result'] = gradesList
        except Exception, e:
            log.error('membergrades exception: Exception[%s]' % str(e), exc_info=e)
        return result

    @d.jsonify()
    @d.setPage(request, ['gradeID'])
    @d.trace(log, ['gradeID', 'pageNum', 'pageSize'])
    def getMembersByGrade(self, gradeID, pageNum=0, pageSize=10):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            members = api.getMembersByGrade(gradeID, pageNum, pageSize)
            memberList = []
            for member in members:
                memberDict = getDict(member)
                gradeDict = []
                for grade in member.grades:
                    gradeDict.append(grade.asDict())
                memberDict['grades'] = gradeDict
                memberList.append(memberDict)

            result['response']['total'] = members.getTotal()
            result['response']['limit'] = len(memberList)
            result['response']['offset'] = (pageNum - 1)*pageSize
            result['response']['result'] = memberList
        except Exception, e:
            log.error('get members by grades exception: Exception[%s]' % str(e), exc_info=e)
        return result

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log)
    def addMemberSubjects(self):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            user = u.getCurrentUser(request)
            if user is None:
                raise Exception((_(u'No user found in request')).encode("utf-8"))

            subjects = []
            param_subjects = request.params.get('subjects')
            if param_subjects:
                subjects = param_subjects.split(',')
            kwargs = {'memberID': user.id, 'subjects':subjects}
            log.info(kwargs)
            result['response']['result'] = api.addOrUpdateMemberSubjects(**kwargs)
        except Exception, e:
            log.error('addMemberSubjects exception: Exception[%s]' % str(e), exc_info=e)
        return result

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log)
    def getSubjectsByMember(self):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            user = u.getCurrentUser(request)
            if user is None:
                raise Exception((_(u'No user found in request')).encode("utf-8"))
            subjects = user.subjects
            subjectsList = []
            for r in subjects:
                subjectsList.append(r.asDict(includeEID=True))
            result['response']['result'] = subjectsList
        except Exception, e:
            log.error('subjectsList exception: Exception[%s]' % str(e), exc_info=e)
        return result

    @d.jsonify()
    @d.checkAuth(request, False, False, ['objectType'])
    @d.trace(log, ['objectType', 'member'])
    def updateMemberAccessTime(self, member, objectType):
        try:
            if objectType not in ('group', 'inapp_notifications'):
                raise Exception('objectType cannot be %s' % objectType)
            objectID = 0;
            if request.params.has_key('objectID'):
                objectID = int(request.params.get('objectID'))
            accessTime = request.params.get('accessTime', str(datetime.now()))

            if objectType == 'group' and objectID == 0:
                raise Exception('objectType group cannot have objectID 0')

            api.updateMemberAccessTime(member.id, objectType, objectID, accessTime)

            result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            return result
        except Exception, e:
            log.exception('update member access time [%s] [%d] Exception[%s]' % (objectType, objectID, str(e)))
            c.errorCode = ErrorCodes.CANNOT_UPDATE_MEMBER_ACCESSTIME
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, False, ['objectType'])
    @d.trace(log, ['objectType', 'member'])
    def restrictMemberAccess(self, member, objectType):
        try:
            if not u.isMemberAdmin(member):
                raise ex.UnauthorizedException((_(u'Only administrator can call this API')).encode("utf-8"))

            objectID = None
            subObjectType = request.params.get('subObjectType', None)
            if request.params.has_key('objectID'):
                objectID = int(request.params.get('objectID'))

            action = request.params.get('action', None)

            if action not in ['allow', 'block']:
                raise ex.InvalidArgumentException((_(u'Missing action')).encode("utf-8"))

            kwargs = {}
            kwargs['memberID'] = int(request.params.get('memberID'))
            kwargs['objectType'] = objectType
            kwargs['subObjectType'] = subObjectType
            kwargs['objectID'] = objectID

            loginCookie = config.get('ck12_login_cookie')
            cookie = request.cookies.get(loginCookie)
            user_info = u.getInfoMy(login_cookie=loginCookie, cookie=cookie, memberID=kwargs["memberID"])
            if user_info and 'responseHeader' in user_info:
                if 'response' in user_info:
                    response = user_info["response"]
                    if "roles" in response:
                        user_roles = response["roles"]
                        if isinstance(user_roles, list):
                            for user_role in user_roles:
                                if isinstance(user_role, dict):
                                    if int(user_role["id"]) == 21 and str(user_role['name']).lower() == "content-admin":
                                        errorMsg = "Sorry, cannot block content-admin Users"
                                        c.errorCode = ErrorCodes.CANNOT_RESTRICT_MEMBER_ACCESS
                                        return ErrorCodes().asDict(c.errorCode, errorMsg)

            tx = utils.transaction(self.getFuncName())
            with tx as session:
                if action == 'allow':
                    api._removeMemberToBlockedList(session, **kwargs)
                elif action == 'block':
                    #Remove member from all the public forums and update peerhelp membership
                    if objectType == 'group' and subObjectType == 'public-forum' and objectID is None:
                        publicForums = api._getGroupsByMemberID(session,
                                                                  memberID=kwargs['memberID'], \
                                                                  lmsAppID=None, \
                                                                  pageSize=0, \
                                                                  groupTypes='public-forum')

                        for group in publicForums:
                            group = group.Group
                            is_user_deleted = api._deleteMemberFromGroup(session, group=group, memberID=kwargs['memberID'], requesterID=member.id)
                            if is_user_deleted:
                                notifications = api._getNotificationsByFilter(session, filters=[('groupID', group.id), ('subscriberID', kwargs['memberID'])]).results
                                for notification in notifications:
                                    api._deleteNotification(session, notification.id)

                            payload = {
                                       'groupID'        : group.id, 
                                       'memberID'       : kwargs['memberID'],
                                       'currentUserID'  : member.id
                                       }

                            self._updatePeerhelpGroupMemberAssociation('group/delete/member', payload)


                    kwargs['blockedBy'] = member.id
                    kwargs['reason'] = request.params.get('reason', None)
                    api._addMemberToBlockedList(session, **kwargs)

            result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            return result
        except Exception, e:
            log.exception('member restrict [%s] [%s] [%s] Exception[%s]' % (objectType, subObjectType, objectID, str(e)))
            import traceback
            log.error('get group Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.CANNOT_RESTRICT_MEMBER_ACCESS
            return ErrorCodes().asDict(c.errorCode, str(e))


    @d.jsonify()
    @d.checkAuth(request)
    @d.sortable(request, ['member', 'fq', 'pageNum', 'pageSize', 'sort'])
    @d.filterable(request, ['member', 'sort'], noformat=True)
    @d.setPage(request, ['member', 'fq', 'sort'])
    @d.trace(log, ['member', 'fq', 'pageNum', 'pageSize', 'sort'])
    def getRestrictedMembers(self, member,fq, pageNum, pageSize, sort):
        """
            Returns restricted members info.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            if not u.isMemberAdmin(member):
                raise ex.UnauthorizedException((_(u'Only administrator can call this API')).encode("utf-8"))

            blockedMembers = api.getBlockedMembers(pageNum=pageNum, pageSize=pageSize, filters=fq, sort=sort)

            membersInfo = []
            for eachMember in blockedMembers:
                memberDict = {}
                memberDict['memberID'] = eachMember.memberID
                memberDict['objectType'] = eachMember.objectType
                memberDict['subObjectType'] = eachMember.subObjectType
                memberDict['objectID'] = eachMember.objectID
                memberDict['blockedBy'] = eachMember.blockedBy
                memberDict['reason'] = eachMember.reason
                memberDict['creationTime'] = eachMember.creationTime

                membersInfo.append(memberDict)
            result['response']['members'] = membersInfo
            result['response']['total'] = blockedMembers.total
            return result
        except Exception, e:
            log.error('get restricted members Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.NO_SUCH_MEMBER
            return ErrorCodes().asDict(c.errorCode, str(e))
