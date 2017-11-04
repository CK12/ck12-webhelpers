import logging
import json
from urllib2 import urlopen
from Crypto.Cipher import Blowfish

from pylons import app_globals as g, config, session as pylons_session, request, tmpl_context as c
from pylons.i18n.translation import _

from auth.model import api, exceptions as ex, utils
from auth.controllers import decorators as d
from auth.controllers import member as m
from auth.controllers import user as u
from auth.controllers.extAuth import ExtAuthController
from auth.controllers.errorCodes import ErrorCodes
from auth.lib.base import BaseController
from auth.lib import helpers as h


log = logging.getLogger(__name__)

class EdmodoController(ExtAuthController):
    """
        Edmodo authentication related APIs.
    """
    site = 'edmodo'

    def __init__(self):
        self.edmodoDict = {
            'apiKeys': {
                'edmPracticeMath': config.get('edmodo_math_api_key'),
                'edmPracticeScience': config.get('edmodo_science_api_key'),
            },
            'launchUrl': config.get('edmodo_launch_url')
        }
        log.debug('edmodo: self.edmodoDict%s' % self.edmodoDict)
        authTypeDict = g.getMemberAuthTypes()
        self.authTypeID = authTypeDict.get(self.site, None)
        self.memberRoleDict, self.memberRoleNameDict = g.getMemberRoles()

    @d.jsonify()
    @d.trace(log, ['app', 'appName', 'key'])
    def launch(self, app, appName=None, key=None):
        """
            Launch Edmodo.

            Protocol:
                - Students:
                    - if MemberExtData entry is not found, create entry
                    - log the student in
                    - return user info
                - Teachers:
                    - if MemberExtData entry is found
                        - log the teacher in
                        - return user info
                    - otherwise, return UNKNOWN_MEMBER error with Edmodo user info
        """
        log.debug('launch: app[%s]' % app)
        log.debug('launch: appName[%s]' % appName)
        saveToken = False
        if not key:
            key = request.params.get('key', None)

        log.debug('launch: key[%s]' % key)
        if not key:
            #
            #  See if this is from admin user.
            #
            try:
                member = u.getCurrentUser(request, anonymousOkay=False)
                if not member:
                    raise ex.MissingArgumentException((_(u'Launch key missing.')).encode("utf-8"))

                if not u.isMemberAdmin(member):
                    raise ex.UnauthorizedException((_(u'Only admin can launch for other members.')).encode("utf-8"))

                member = u.getImpersonatedMember(member)
                member, extDict = m.getMember(member.id, member, authType=self.site)

                prefix = config.get('flx_prefix_url')
                url = '%s/get/userdata/%s?impersonateMemberID=%s' % (prefix, self.edmodoDict['apiKeys'][appName], member.id)
                log.debug('launch: url[%s]' % url)
                status, r = self._call(url, fromReq=True)
                if status != ErrorCodes.OK:
                    raise Exception((_(u'%s failed[%s, %s]' % (url, status, r))).encode('utf-8'))

                log.debug('launch: get result%s' % r)
                r = r['userdata']
                accessToken = r['accessToken']
                userToken = r['userToken']
            except ex.MissingArgumentException, mae:
                log.error('launch: Exception[%s]' % str(mae), exc_info=mae)
                c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
                return ErrorCodes().asDict(c.errorCode, str(mae))
            except ex.UnauthorizedException, ue:
                log.error('launch: Exception[%s]' % str(ue), exc_info=ue)
                c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
                return ErrorCodes().asDict(c.errorCode, str(ue))
            except Exception, e:
                log.error('launch: Exception[%s]' % str(e), exc_info=e)
                c.errorCode = ErrorCodes.UNKNOWN_MEMBER
                return ErrorCodes().asDict(c.errorCode, str(e))
        else:
            member = None

            launchUrl = '%s?api_key=%s&launch_key=%s' % (self.edmodoDict['launchUrl'], self.edmodoDict['apiKeys'][appName], key)
            log.info('launch: launchUrl[%s]' % launchUrl)
            # Audit Trail - edmodo_launch
            import time
            prefix = config.get('flx_prefix_url')
            auditTrailAPI =  "%s/create/auditTrail?collectionName=edmodoRequests"%(prefix)
            start_time = None
            run_time = None
            auditData = {'auditType': 'edmodo_launch'}
            auditTrailDict = { 'launchdata':{}}
            launchErrorDict = {}
            try:
                start_time = time.time()
                f = urlopen(launchUrl)
                run_time = (time.time() - start_time)
                info = f.read()
                log.info('launch: tokenUrl: info[%s]' % info)
            except Exception, e:
                run_time = (time.time() - start_time)
                if not type(e).__name__ == "HTTPError":
                    msg = 'Provider is down[%s].' % str(e)
                    log.error(msg)
                    launchErrorDict['code'] =  ErrorCodes.AUTHENTICATION_FAILED
                    launchErrorDict['msg'] = msg
                else:
                    msg = e.read()
                    launchErrorDict['code'] = ErrorCodes.UNAUTHORIZED_OPERATION
                    launchErrorDict['msg'] = "Server error from edmodo: %s" % msg
                log.exception(e)
                auditData['responseStatus'] = launchErrorDict['code']
                auditData['exceptionMessage'] = launchErrorDict['msg']
                auditData['executionTime'] = run_time
                auditTrailDict['launchdata'] = auditData
                try:
                    self._call(auditTrailAPI,method='POST', params=auditTrailDict)
                except Exception,e:
                    log.error("There was an issue logging the audit trail: %s"%e,exc_info=e) 
                return ErrorCodes().asDict(launchErrorDict['code'], launchErrorDict['msg'])

            auditData['executionTime'] = run_time
            edmodoInfo = json.loads(info)
            log.debug('launch: edmodoInfo[%s]' % edmodoInfo)

            accessToken = edmodoInfo['access_token']

            userToken = edmodoInfo['user_token']
            token = m.generateDigest(userToken, seed=userToken)
            userType = edmodoInfo['user_type'].lower()

            try:
                tx = utils.transaction(self.getFuncName())
                with tx as session:
                    log.debug('launch: authTypeID[%s] token[%s]' % (self.authTypeID, token))
                    extData = api._getMemberExtData(session, self.authTypeID, externalID=userToken)
                    if not extData:
                        extData = api._getMemberExtData(session, self.authTypeID, token=token)
                        if extData:
                            extData.externalID = userToken
                            session.add(extData)
                    if not extData and userType == 'student':
                        #
                        #  Create entry.
                        #
                        roleID = self.memberRoleNameDict.get('student')
                        log.debug('launch: roleID[%s]' % roleID)
                        email = '%s-%s@partners.ck12.org' % (self.site, userToken)
                        log.debug('launch: email[%s]' % email)
                        member = api._createMember(session,
                                                givenName=edmodoInfo.get('first_name', None),
                                                surname=edmodoInfo.get('last_name', None),
                                                authTypeID=self.authTypeID,
                                                token=token,
                                                externalID=userToken,
                                                email=email,
                                                stateID=2,
                                                roleID=roleID,
                                                groupID=1,
                                                emailVerified=True)

                        extData = member.ext
                    log.debug('launch: extData[%s]' % extData)
                    if not extData:
                        #
                        #  Teacher with no entry, return error.
                        #
                        errorCode = ErrorCodes.UNKNOWN_MEMBER
                        return ErrorCodes().asDict(errorCode, 'No entry for edmodo user[%s].' % userToken, infoDict = { 'edmodoInfo': edmodoInfo })

                    if not member:
                        member = api._getMemberByID(session, id=extData.memberID)
                        if not member:
                            raise Exception('Member id[%s] not found.' % extData.memberID)
                    member, extDict = m.getMember(member.id, member, authType=self.site)
                    log.debug('launch: member[%s]' % member)
                saveToken = True
            except Exception, e:
                log.error('launch: Exception[%s]' % str(e), exc_info=e)
                c.errorCode = ErrorCodes.AUTHENTICATION_FAILED
                return ErrorCodes().asDict(c.errorCode, str(e))

        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            #
            #  Login.
            #
            ## Set cookie for access token
            lmsCookieName = '%s%s' % (config.get('lms_cookie_prefix'), self.edmodoDict['apiKeys'][appName])
            accessTokenEnc = Blowfish.new(config.get('lms_secret')).encrypt(h.pad_string(accessToken)) if config.get('lms_secret') else accessToken
            accessTokenEnc = h.genURLSafeBase64Encode(accessTokenEnc, strip=False, usePrefix=False)
            log.debug("[launch] Setting: lmsCookieName: %s, accessToken: %s, accessTokenEnc: %s" % (lmsCookieName, accessToken, accessTokenEnc))
            result['__cookies'] = [ {'name': lmsCookieName, 'value': accessTokenEnc, 'max_age': 24*60*60, 'path': '/'} ]

            kwargs = {
                'userToken': userToken,
            }
            u.saveSession(request, member.id, member.email, self.site, timeout=(86400 - 1), **kwargs)

            # Audit Trail - edmodo_launch
            auditData['userToken'] = userToken
            auditData['launch_key'] = key
            auditData['memberID'] = member.id
            auditData['accessToken'] = accessToken
            auditData['responseStatus'] = 200
            auditData['appID'] = self.edmodoDict['apiKeys'][appName]
            auditTrailDict['launchdata'] = auditData

            if saveToken:
                #
                #  Save access token, etc.
                #
                userDataDict = {
                    'userdata': json.dumps({
                        'impersonateMemberID': member.id,
                        'accessToken': accessToken,
                        'userToken': userToken,
                    }),
                }
                prefix = config.get('flx_prefix_url')
                url = '%s/save/userdata/%s' % (prefix, self.edmodoDict['apiKeys'][appName])
                log.debug('launch: url[%s]' % url)
                status, r = self._call(url, method='POST', params=userDataDict, fromReq=True)
                log.debug('launch: save status[%s]' % status)
                if status != ErrorCodes.OK:
                    log.warn('launch: %s failed[%s, %s]' % (url, status, r))
                log.debug('launch: save r[%s]' % r)
            #
            #  Update analytics.
            #
            self._updateAnalytics(member, self.authTypeID, session=pylons_session)
            #
            #  Get user info.
            #
            prefix = config.get('flx_prefix_url')
            auditTrailAPI =  "%s/create/auditTrail?collectionName=edmodoRequests"%(prefix)
            try:
                self._call(auditTrailAPI,method='POST', params=auditTrailDict)
            except Exception,e:
                log.error("There was an issue logging the audit trail: %s"%e,exc_info=e) 
            userDict = m.getDict(member, extDict)
            userDict['edmodoInfo'] = {
                'appID': self.edmodoDict['apiKeys'][appName],
            }
            log.debug('launch: userDict%s' % userDict)
            result['response'] = userDict
            return result
        except Exception, e:
            log.error('launch: Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.AUTHENTICATION_FAILED
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log, ['email'])
    def login(self, email=None):
        """
            Login via Edmodo for teachers.

            Protocol:
                - if email not found
                    - create the member entry
                    - log the teacher in
                    - return user info
                - otherwise, return MEMBER_ALREADY_EXIST error with Edmodo user info
        """
        info = request.params.get('edmodoInfo', None)
        if not info:
            errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
            return ErrorCodes().asDict(errorCode, 'Missing Edmodo info.')
        edmodoInfo = json.loads(info)
        log.debug('login: edmodoInfo[%s]' % edmodoInfo)

        accessToken = edmodoInfo.get('access_token', None)
        if not accessToken:
            errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
            return ErrorCodes().asDict(errorCode, 'Missing Edmodo access token.')

        userToken = edmodoInfo.get('user_token', None)
        if not userToken:
            errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
            return ErrorCodes().asDict(errorCode, 'Missing Edmodo user token.')

        if not email and request.params.has_key('email'):
            email = request.params.get('email')
            email = email.lower().strip()
        if not email:
            email = '%s-%s@partners.ck12.org' % (self.site, userToken)
        log.debug('login: email[%s]' % email)

        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            roleID = self.memberRoleNameDict.get('teacher')
            token = m.generateDigest(userToken, seed=userToken)

            tx = utils.transaction(self.getFuncName())
            with tx as session:
                member = api._getMemberByEmail(session, email)
                if member:
                    #
                    #  Make sure the CK-12 user is a teacher.
                    #
                    isTeacher = False
                    roles = member.roles
                    for r in roles:
                        if r.role.name == 'teacher':
                            isTeacher = True
                    if not isTeacher:
			log.debug('login: Member with email[%s] is not a CK-12 teacher.' % email)
                        errorCode = ErrorCodes.MEMBER_ROLE_CONFLICT
                        return ErrorCodes().asDict(errorCode, 'Member with email[%s] is not a CK-12 teacher.' % email, infoDict = { 'edmodoInfo': edmodoInfo })
                    #
                    #  Teacher entry already exists, return error.
                    #
                    errorCode = ErrorCodes.MEMBER_ALREADY_EXISTS
                    return ErrorCodes().asDict(errorCode, 'Teacher with email[%s] already exists.' % email, infoDict = { 'edmodoInfo': edmodoInfo })
                #
                #  Create entry.
                #
                member = api._createMember(session,
                                           givenName=edmodoInfo.get('first_name', None),
                                           surname=edmodoInfo.get('last_name', None),
                                           authTypeID=self.authTypeID,
                                           token=token,
                                           externalID=userToken,
                                           email=email,
                                           stateID=2,
                                           roleID=roleID,
                                           groupID=1,
                                           emailVerified=True)
                log.debug('login: member[%s]' % member)
                #
                #  Login.
                #
                ## Set cookie for access token
                appName = request.params.get('appName')
                log.debug('login: appName[%s]' % appName)
                lmsCookieName = '%s%s' % (config.get('lms_cookie_prefix'), self.edmodoDict['apiKeys'][appName])
                accessTokenEnc = Blowfish.new(config.get('lms_secret')).encrypt(h.pad_string(accessToken)) if config.get('lms_secret') else accessToken
                accessTokenEnc = h.genURLSafeBase64Encode(accessTokenEnc, strip=False, usePrefix=False)
                log.debug("[login] Setting: lmsCookieName: %s, accessToken: %s, accessTokenEnc: %s" % (lmsCookieName, accessToken, accessTokenEnc))
                result['__cookies'] = [ {'name': lmsCookieName, 'value': accessTokenEnc, 'max_age': 24*60*60, 'path': '/'} ]

                kwargs = {
                    'userToken': userToken,
                }
                u.saveSession(request, member.id, member.email, self.site, **kwargs)
                #
                #  Update analytics.
                #
                self._updateAnalytics(member, self.authTypeID, session=pylons_session)
                #
                #  Get user info.
                #
                member, extDict = m.getMember(member.id, member, authType=self.site)
                userDict = m.getDict(member, extDict)
            userDict['edmodoInfo'] = {
                'appID': self.edmodoDict['apiKeys'][appName],
            }
            log.debug('login: userDict%s' % userDict)
            result['response'] = userDict
            return result
        except Exception, e:
            log.error('login: Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.CANNOT_CREATE_MEMBER
            return ErrorCodes().asDict(c.errorCode, str(e))

    #
    #  Internal code for testing.
    #
    @d.trace(log)
    def test(self):
        """
            Test the login action.
        """
        return self._test(self.site)

    @d.jsonify()
    @d.checkAuth(request, False, False)
    @d.trace(log, ['member'])
    def create(self, member):
        """
            Protocol:
                - create the MemberExtData entry for the teacher
        """
        info = request.params.get('edmodoInfo', None)
        if not info:
            errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
            return ErrorCodes().asDict(errorCode, 'Missing Edmodo info.')
        edmodoInfo = json.loads(info)
        log.debug('create: edmodoInfo[%s]' % edmodoInfo)

        appName = request.params.get('appName')
        if not info:
            errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
            return ErrorCodes().asDict(errorCode, 'Missing appName.')
        log.debug('create: appName[%s]' % appName)

        accessToken = edmodoInfo['access_token']

        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            userToken = edmodoInfo['user_token']
            token = m.generateDigest(userToken, seed=userToken)

            tx = utils.transaction(self.getFuncName())
            with tx as session:
                #
                #  Make sure the CK-12 user is a teacher.
                #
                isTeacher = False
                roles = member.roles
                for r in roles:
                    if r.role.name == 'teacher':
                        isTeacher = True
                if not isTeacher:
		    log.debug('create: Member with email[%s] is not a CK-12 teacher.' % member.email)
                    errorCode = ErrorCodes.MEMBER_ROLE_CONFLICT
                    return ErrorCodes().asDict(errorCode, 'Member with email[%s] is not a CK-12 teacher.' % member.email, infoDict = { 'edmodoInfo': edmodoInfo })
                #
                #  Make sure the association has not been done to
                #  another Edmodo user.
                #
                extData = None
                ext = member.ext
                for e in ext:
                    if e.authTypeID == self.authTypeID:
                        if e.externalID != userToken:
			    log.debug('create: Member has already been associated to Edmodo userToken[%s].' % e.externalID)
                            errorCode = ErrorCodes.MEMBER_ALREADY_ASSOCIATED
                            return ErrorCodes().asDict(errorCode, 'Member has already been associated to Edmodo userToken[%s].' % e.externalID, infoDict = { 'edmodoInfo': edmodoInfo })
                        #
                        #  Association done before.
                        #
                        extData = e
                if not extData:
                    #
                    #  Create the MemberExtData entry.
                    #
                    extData = api._createMemberExtData(session, member.id, self.authTypeID, token, True, externalID=userToken, reset=False)
                #
                #  Login.
                #
                ## Set cookie for access token
                lmsCookieName = '%s%s' % (config.get('lms_cookie_prefix'), self.edmodoDict['apiKeys'][appName])
                accessTokenEnc = Blowfish.new(config.get('lms_secret')).encrypt(h.pad_string(accessToken)) if config.get('lms_secret') else accessToken
                accessTokenEnc = h.genURLSafeBase64Encode(accessTokenEnc, strip=False, usePrefix=False)
                log.debug("[login] Setting: lmsCookieName: %s, accessToken: %s, accessTokenEnc: %s" % (lmsCookieName, accessToken, accessTokenEnc))
                result['__cookies'] = [ {'name': lmsCookieName, 'value': accessTokenEnc, 'max_age': 24*60*60, 'path': '/'} ]

                kwargs = {
                    'userToken': userToken,
                }
                u.saveSession(request, member.id, member.email, self.site, timeout=(86400 - 1), **kwargs)
                #
                #  Update analytics.
                #
                self._updateAnalytics(member, self.authTypeID, session=pylons_session)
                #
                #  Get user info.
                #
                member, extDict = m.getMember(member.id, member, authType=self.site)
                userDict = m.getDict(member, extDict)
            userDict['edmodoInfo'] = {
                'appID': self.edmodoDict['apiKeys'][appName],
            }
            result['response'] = userDict
            return result
        except Exception, e:
            log.warn('create: Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.CANNOT_UPDATE_MEMBER
            return ErrorCodes().asDict(c.errorCode, str(e))
