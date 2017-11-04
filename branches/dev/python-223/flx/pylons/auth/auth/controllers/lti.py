import logging
import json
import time
import zlib

from Crypto.Cipher import Blowfish
from base64 import b16encode, b16decode
from base64 import b64encode, b64decode

from pylons import app_globals as g, session as pylons_session, config, request, tmpl_context as c
from pylons.controllers.util import redirect
from pylons.i18n.translation import _

from auth.model import api, exceptions as ex, utils
from auth.controllers import decorators as d
from auth.controllers import member as m
from auth.controllers import user as u
from auth.controllers.extAuth import ExtAuthController
from auth.controllers.errorCodes import ErrorCodes
from auth.lib.base import BaseController
from auth.lib import helpers as h
from auth.lib.ims_lti_py import PylonsToolProvider


log = logging.getLogger(__name__)

__controller__ = 'LTIController'
class LTIController(ExtAuthController):
    """
        LTI authentication related APIs.

        This is the parent of all LTI partners.
    """
    expire = 3600    # in seconds

    def __init__(self):
        self.authTypeDict = g.getMemberAuthTypes()
        self.authTypeNameDict = g.getMemberAuthTypeNames()
        self.memberRoleDict, self.memberRoleNameDict = g.getMemberRoles()

    def sanitizeUserToken(self, userToken=None):
        """
            Does a string replace on the userToken to remove unwanted characters.
            Example:
                userToken = 37472713::9a1a2a439a003c9d7c8a8d89e5c5beb6
            We will clean it up to 37472713--9a1a2a439a003c9d7c8a8d89e5c5beb6
            This fixes issues when using userToken to construct emails
        """
        if userToken:
            userToken = str(userToken)
            userToken = userToken.replace(":","-")
            log.debug("sanitizeUserToken userToken sanitized [%s]"%userToken)
        return userToken

    def generateToken(self, length=25):
        import random
        import string

        token = ''.join(random.choice(string.ascii_letters.decode('ascii') + string.digits.decode('ascii')) for i in range(length))
        return unicode(token)

    def generateKey(self, id, s, expire):
        """
            Generates an encrypted key to be used in launch.
        """
        data = '%s@%s@%s' % (int(time.time()) + int(expire), id, s)
        if len(data) % 8:
            #
            #  Data block length must be multiple of eight.
            #
            data += 'X' * (8 - (len(data) % 8))

        return b16encode(Blowfish.new(config.get('lms_key_secret')).encrypt(data))

    def decryptKey(self, key, checkExpiration=True):
        """
            Decrypts the encrypted key.
        """
        expire, id, s = Blowfish.new(config.get('lms_key_secret')).decrypt(b16decode(key)).rstrip('X').rsplit('@', 2)                                                                     
        expire = int(expire)
        _time = time.time()
        if checkExpiration and expire < _time:
            log.info('Key has expired: expire [%s] < time [%s]'%(expire,_time))
            raise Exception((_(u'Time duration for this request has expired.')).encode("utf-8"))

        return id, s, expire

    def nestedMultiDict2Dict(self, nestedMultiDict):
        d = nestedMultiDict.dict_of_lists()
        params = {}
        for key in d.keys():
            if len(d[key]) == 1:
                params[key] = d[key][0]
            else:
                params[key] = d[key]
        return params

    @d.jsonify()
    @d.checkAuth(request, False, False, ['provider', 'site', 'appName'])
    @d.trace(log, ['member', 'provider', 'site', 'appName'])
    def registerApplication(self, member, provider, appName, site=None):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            if not u.isMemberAdmin(member):
                raise ex.UnauthorizedException((_(u'Only admin can register applications.')).encode("utf-8"))

            prefix = config.get('flx_prefix_url')
            providerApi = '%s/get/lms/provider' % prefix
            log.debug('registerApplication: providerApi[%s]' % providerApi)
            status, providerDict = self._call(providerApi, fromReq=True)
            log.debug('registerApplication: status[%s]' % status)
            if status != ErrorCodes.OK:
                raise Exception((_(u'Unable to get provider information.')).encode("utf-8"))

            description = request.params.get('description', None)

            providers = providerDict['providers']
            log.debug('registerApplication: providers[%s]' % providers)
            provider = provider.lower()
            providerID = None
            for p in providers:
                if p['name'].lower() == provider:
                    providerID = p['id']
                    break
            log.debug('registerApplication: providerID[%s]' % providerID)
            if not providerID:
                raise ex.InvalidArgumentException((_(u'Unknown provider, %s.' % provider)).encode("utf-8"))

            if not site:
                name = provider
            else:
                name = '%s-%s' % (provider, site)
            #
            #  Create flx2.LMSProviderApps entry, if not yet exists.
            #
            createProviderAppApi = '%s/create/lms/providerapp' % prefix
            createProviderAppApi = '%s/%d?appID=%s' % (createProviderAppApi, providerID, name)
            log.debug('registerApplication: createProviderAppApi[%s]' % createProviderAppApi)
            status, providerAppDict = self._call(createProviderAppApi, fromReq=True)
            log.debug('registerApplication: providerAppDict[%s]' % providerAppDict)
            log.debug('registerApplication: status[%s]' % status)
            if status != ErrorCodes.OK:
                raise Exception((_(u'Unable to get provider information.')).encode("utf-8"))

            secret = self.generateToken(length=50)
            log.debug('registerApplication: secret[%s]' % secret)
            key = self.generateToken(length=50)
            log.debug('registerApplication: key[%s]' % key)

            tx = utils.transaction(self.getFuncName())
            with tx as session:
                authType = api._getMemberAuthTypeByName(session, name=name)
                log.debug('registerApplication: authType[%s]' % authType)
                if not authType:
                    #
                    #  Creates it.
                    #
                    if not site:
                        desc = '%s Authentication.' % provider
                    else:
                        desc = '%s %s Authentication.' % (provider, site)
                    authType = api._createMemberAuthType(session, name=name, description=desc)
                    log.debug('registerApplication: created authType[%s]' % authType)

                application = api._createApplication(session, providerID=providerID, siteID=authType.id, appName=appName, key=key, secret=secret, description=description)
                log.debug('registerApplication: application[%s]' % application)
                result['response']['application'] = application.asDict()
            return result
        except ex.UnauthorizedException, uae:
            log.debug('registerApplication: UnauthorizedExcpetion[%s]' % uae)
            errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
            return ErrorCodes().asDict(errorCode, str(uae))
        except ex.InvalidArgumentException, iae:
            log.debug('getApplication: UnauthorizedExcpetion[%s]' % iae)
            errorCode = ErrorCodes.INVALID_ARGUMENT
            return ErrorCodes().asDict(errorCode, str(iae))
        except Exception, e:
            log.debug('registerApplication: excpetion[%s]' % e)
            errorCode = ErrorCodes.CANNOT_REGISTER_APP
            return ErrorCodes().asDict(errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, False, ['provider', 'site', 'appName', 'key', 'secret'])
    @d.setPage(request, ['member', 'provider', 'site', 'appName', 'key', 'secret'])
    @d.trace(log, ['member', 'provider', 'site', 'appName', 'key', 'secret', 'pageNum', 'pageSize'])
    def getApplications(self, member, provider=None, site=None, appName=None, key=None, secret=None, pageNum=1, pageSize=10):
        if not provider:
            provider = request.params.get('provider', None)
        log.debug('getApplication: provider[%s]' % provider)
        if not site:
            site = request.params.get('site', None)
        log.debug('getApplication: site[%s]' % site)
        if not appName:
            appName = request.params.get('appName', None)
        log.debug('getApplication: appName[%s]' % appName)
        if not key:
            key = request.params.get('key', None)
        log.debug('getApplication: key[%s]' % key)
        if not secret:
            secret = request.params.get('secret', None)
        log.debug('getApplication: secret[%s]' % secret)

        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            if not u.isMemberAdmin(member):
                raise ex.UnauthorizedException((_(u'Only admin can get applications.')).encode("utf-8"))

            tx = utils.transaction(self.getFuncName())
            with tx as session:
                prefix = config.get('flx_prefix_url')
                providerApi = '%s/get/lms/provider' % prefix
                log.debug('getApplication: providerApi[%s]' % providerApi)
                status, providerDict = self._call(providerApi, fromReq=True)
                log.debug('getApplication: status[%s]' % status)
                if status != ErrorCodes.OK:
                    raise ex.InvalidArgumentException((_(u'Unable to get provider information.')).encode("utf-8"))
                providers = providerDict['providers']
                providerDict = {}
                for p in providers:
                    providerDict[p['id']] = p

                if not provider:
                    providerID = None
                else:
                    provider = provider.lower()
                    providerID = None
                    for p in providers:
                        if p['name'].lower() == provider:
                            providerID = p['id']
                            break
                    if not providerID:
                        raise ex.InvalidArgumentException((_(u'Unknown provider, %s.' % provider)).encode("utf-8"))

                if not site:
                    siteID = None
                else:
                    if not provider:
                        raise ex.MissingArgumentException((_(u'Missing provider for site, %s.' % site)).encode("utf-8"))
                    name = '%s-%s' % (provider, site)
                    siteID = self.authTypeDict.get(name)
                    if not siteID:
                        raise ex.InvalidArgumentException((_(u'Unknown site, %s.' % site)).encode("utf-8"))

                page = api._getApplications(session, providerID=providerID, siteID=siteID, appName=appName, key=key, secret=secret, pageNum=pageNum, pageSize=pageSize)
                applications = []
                for application in page:
                    appDict = application.asDict()
                    appDict['site'] = self.authTypeNameDict.get(application.siteID)
                    appDict['provider'] = providerDict.get(application.providerID)
                    applications.append(appDict)
                result['response']['total'] = page.getTotal()
                result['response']['limit'] = len(page)
                result['response']['offset'] = (pageNum - 1)*pageSize
                result['response']['applications'] = applications
            return result
        except ex.UnauthorizedException, uae:
            log.debug('getApplication: UnauthorizedExcpetion[%s]' % uae)
            errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
            return ErrorCodes().asDict(errorCode, str(uae))
        except ex.InvalidArgumentException, iae:
            log.debug('getApplication: UnauthorizedExcpetion[%s]' % iae)
            errorCode = ErrorCodes.INVALID_ARGUMENT
            return ErrorCodes().asDict(errorCode, str(iae))
        except ex.MissingArgumentException, mae:
            log.debug('getApplication: UnauthorizedExcpetion[%s]' % mae)
            errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
            return ErrorCodes().asDict(errorCode, str(mae))
        except Exception, e:
            log.debug('getApplication: excpetion[%s]' % e)
            errorCode = ErrorCodes.CANNOT_REGISTER_APP
            return ErrorCodes().asDict(errorCode, str(e))

    def _getPartner(self, ltiInfo):
        consumerKey = ltiInfo.get('oauth_consumer_key')
        application = api.getApplicationByKey(key=consumerKey)
        if application:
            partner = self.authTypeNameDict.get(application.siteID)
            log.debug('_getPartner: partner[%s]' % partner)
            if partner:
                return partner

        partner = ltiInfo.get('tool_consumer_info_product_family_code')
        if partner in ['canvas','moodle','itslearning','schoology']:
            import urlparse

            address = ltiInfo.get('launch_presentation_return_url')
            log.debug('_getPartner: address[%s]' % address)
            hostname = urlparse.urlparse(address).hostname
            log.debug('_getPartner: hostname[%s]' % hostname)
            #
            #  This is a workaround for a Canvas bug.
            #  We will remove  after Canvas fixes the issue.
            #
            if not hostname:
                hostname = 'ck12.instructure.com'

            subdomain = hostname.split('.')[0]
            log.debug('_getPartner: subdomain[%s]' % subdomain)
            if subdomain != partner:
                partner = '%s-%s' % (partner, subdomain)
        log.debug('_getPartner: partner[%s]' % partner)
        return partner

    @d.trace(log, ['appName', 'extra'])
    def launch(self, appName, extra=None):
        """
            Launch an instance for this LTI partner.

            Protocol:
                - Students:
                    - if MemberExtData entry is not found, create entry
                    - log the student in
                    - return user info
                - Teachers:
                    - if MemberExtData entry is found
                        - log the teacher in
                        - return user info
                    - otherwise, return UNKNOWN_MEMBER error with LTI user info
        """
        log.debug('launch: appName[%s]' % appName)
        log.debug('launch: extra[%s]' % extra)
        key = request.params.get('launch_key', None)
        log.debug('launch: key[%s]' % key)
        log.debug('launch: request.params[%s]' % request.params)

        ltiInfoDict = pylons_session.get('ltiInfoDict', None)
        log.debug('launch: ltiInfoDict[%s]' % ltiInfoDict)

        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        errorCode = ErrorCodes.OK
        if not key:
            #
            #  Initial request from partner: Authenticate, and redirect to app.
            #
            try:
                #
                #  1. Authenticate.
                #
                consumerKey = request.params.get('oauth_consumer_key')
                log.debug('launch: consumerKey[%s]' % consumerKey)
                application = api.getApplicationByKey(key=consumerKey)
                params = self.nestedMultiDict2Dict(request.params)
                if not application:
                    errorCode = ErrorCodes.INVALID_LTI_CONSUMER_KEY
                    raise ex.InvalidLTIConsumerKeyException((_(u'Unknown key, %s.' % consumerKey)).encode("utf-8"))
                consumerSecret = application.secret
                log.debug('launch: consumerSecret[%s]' % consumerSecret)
                log.debug('launch: params[%s]' % params)
                toolProvider = PylonsToolProvider(consumerKey, consumerSecret, params=params)
                log.debug('launch: toolProvider[%s]' % toolProvider)
                isValid = toolProvider.is_valid_request(request)
                log.debug('launch: isValid[%s]' % isValid)
                if not isValid:
                    raise Exception((_(u'Invalid request.')).encode("utf-8"))
                #
                #  2. Save info to cookie.
                #
                id = params.get('user_id')
                log.debug('launch: id[%s]' % id)
                s = params.get('oauth_signature')
                log.debug('launch: s[%s]' % s)
                key = self.generateKey(id, s, self.expire)
                log.debug('launch: key[%s]' % key)

                ltiInfoDict = params
                ltiInfoDict['extra'] = extra
                partner = self._getPartner(params)
                ltiInfoDict['consumerSecret'] = consumerSecret
                ltiInfoDict['appName'] = appName
                ltiInfoDict['appID'] = partner + ':' + appName

                from pylons import response

                log.debug('launch: ltiInfo[%s]' % ltiInfoDict)
                pylons_session['ltiInfoDict'] = ltiInfoDict
                pylons_session.save()
            except Exception, e:
                log.error('launch: excpetion[%s]' % e, exc_info=e)
                if errorCode == ErrorCodes.OK:
                    errorCode = ErrorCodes.AUTHENTICATION_FAILED
                roles = params.get('ext_roles', None)
                userName = params.get('lis_person_name_full', None)
                userEmail = params.get('lis_person_contact_email_primary',None)
                auth_error_cookie = None
                auth_error_cookie = "%s;%s"%(userName,userEmail)
                auth_error_cookie = b64encode(auth_error_cookie)
                from pylons import response
                if auth_error_cookie:
                    response.set_cookie("lti_auth_error", auth_error_cookie, max_age=60)
                appUrl = '%s/lmspractice/ltiApp/index.html?auth_failed=%s&roles=%s&errorCode=%s' % (config.get('web_prefix_url'), e,roles,errorCode)
                return redirect(appUrl,302)
            #
            #  3. Redirect to app.
            #
            if not extra:
                appUrl = '%s/lmspractice/ltiApp/index.html?launch_key=%s' % (config.get('web_prefix_url'), key)
            else:
                appUrl = '%s/lmspractice/ltiApp/index.html?launch_key=%s&extra=%s' % (config.get('web_prefix_url'), key, extra)
            log.debug('launch: appUrl[%s]' % appUrl)
            return redirect(appUrl, 302)
        #
        #  Call from app when key is provided.
        #
        try:
            id, s, expire = self.decryptKey(key)
            log.debug('launch: id[%s]' % id)
            log.debug('launch: s[%s]' % s)
            log.debug('launch: expire[%s]' % expire)

            if not ltiInfoDict:
               raise Exception((_(u'ltiInfoDict is none: Time duration for this request has expired.')).encode("utf-8"))

            ltiInfo = ltiInfoDict
            consumerKey = ltiInfo.get('oauth_consumer_key')
            consumerSecret = ltiInfo.get('consumerSecret')
            toolProvider = PylonsToolProvider(consumerKey, consumerSecret, params=ltiInfo)

            userToken = ltiInfo.get('user_id', None)
            log.debug('launch: userToken[%s]' % userToken)

            token = m.generateDigest(userToken, seed=userToken)
            log.debug('launch: token[%s]' % token)
            userType = 'teacher' if toolProvider.is_instructor() else 'student'
            log.debug('launch: userType[%s]' % userType)
            email = ltiInfo.get('lis_person_contact_email_primary', None)
            if email:
                email = email.lower().strip()
                try:
                    api.validateEmail(email)
                except ex.InvalidEmailException:
                    email = None
            log.debug('launch: email[%s]' % email)

            partner = self._getPartner(ltiInfo)
            authTypeID = self.authTypeDict.get(partner, None)
            if not authTypeID:
                raise Exception((_(u'Unknown partner, %s.' % partner)).encode("utf-8"))
            log.debug('launch: authTypeID[%s]' % authTypeID)

            tx = utils.transaction(self.getFuncName())
            with tx as session:
                extData = api._getMemberExtData(session, authTypeID, externalID=userToken)
                if not extData:
                    extData = api._getMemberExtData(session, authTypeID, token=token)
                    if extData:
                        extData.externalID = userToken
                        session.add(extData)
                log.debug('launch: extData[%s]' % extData)
                member = None
                if not extData:
                    if email:
                        member = api._getMemberByEmail(session, email=email)
                        log.debug('launch: member[%s]' % member)
                    if member:
                        for e in member.ext:
                            if e.authTypeID == authTypeID:
                                extData = e
                        if extData and extData.externalID != userToken:
                            raise ex.AlreadyExistsException((_(u'Member with a different user id, %s, from %s, exist already.' % (extData.externalID, userToken))).encode("utf-8"))
                        #
                        #  Create the MemberExtData entry.
                        #
                        if not extData:
                            extData = api._createMemberExtData(session, member.id, authTypeID, token, True, externalID=userToken, reset=False)
                    else:
                        #
                        #  Create entry for student.
                        #
                        roleID = self.memberRoleNameDict.get(userType)
                        log.debug('launch: roleID[%s]' % roleID)
                        if not email:
                            email = '%s-%s@partners.ck12.org' % (partner, self.sanitizeUserToken(userToken))
                        log.debug('launch: email[%s]' % email)
                        givenName = toolProvider.given_name()
                        if not givenName:
                            givenName = 'guest'
                        surname = toolProvider.family_name()
                        if not surname:
                            surname = partner
                        member = api._createMember(session,
                                                   givenName=givenName,
                                                   surname=surname,
                                                   authTypeID=authTypeID,
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
                    raise Exception('No entry for %s user[%s].' % (partner, userToken))

                if not member:
                    member = api._getMemberByID(session, id=extData.memberID)
                    if not member:
                        errorCode = ErrorCodes.UNKNOWN_MEMBER
                        raise Exception('Member id[%s] not found.' % extData.memberID)

                member, extDict = m.getMember(member.id, member, authType=partner)
                log.debug('launch: member[%s]' % member)
            #
            #  Login.
            #
            kwargs = {
                'userToken': userToken,
                'ltiInfoDict': ltiInfoDict,
            }
            u.saveSession(request, member.id, member.email, partner, timeout=(864000 - 1), **kwargs)
            #
            #  Update analytics.
            #
            self._updateAnalytics(member, authTypeID, session=session)
            #
            #  Get user info.
            #
            userDict = m.getDict(member, extDict)
            userDict['ltiInfo'] = ltiInfo
            log.debug('launch: userDict%s' % userDict)
            result['response'] = userDict
            return json.dumps(result, default=h.toJson)
        except Exception, e:
            log.debug('launch: excpetion[%s]' % e)
            if errorCode == ErrorCodes.OK:
                errorCode = ErrorCodes.AUTHENTICATION_FAILED
            return json.dumps(ErrorCodes().asDict(errorCode, str(e)), default=h.toJson)

    @d.jsonify()
    @d.trace(log, ['email'])
    def login(self, email=None):
        """
            Login via LTI partner for teachers.

            Protocol:
                - if email not found
                    - create the member entry
                    - log the teacher in
                    - return user info
                - otherwise, return MEMBER_ALREADY_EXIST error with LTI user info
        """
        key = request.params.get('launch_key', None)
        log.debug('login: key[%s]' % key)
        if not key:
            errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
            return ErrorCodes().asDict(errorCode, 'Missing launch_key.')

        ltiInfoDict = pylons_session.get('ltiInfoDict', None)
        if not ltiInfoDict:
            errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
            return ErrorCodes().asDict(errorCode, 'No LTI data in session.')

        ltiInfo = ltiInfoDict
        log.debug('login: ltiInfo[%s]' % ltiInfo)
        if not ltiInfo:
            errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
            return ErrorCodes().asDict(errorCode, 'No LTI data for the given launch key[%s].' % key)

        consumerKey = ltiInfo.get('oauth_consumer_key')
        if not consumerKey:
            errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
            return ErrorCodes().asDict(errorCode, 'Missing LTI consumer key.')

        userToken = ltiInfo.get('user_id', None)
        if not userToken:
            errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
            return ErrorCodes().asDict(errorCode, 'Missing LTI user token.')

        partner = self._getPartner(ltiInfo)
        log.debug('login: partner[%s]' % partner)

        if not email and request.params.has_key('email'):
            email = request.params.get('email')
        if not email:
            email = '%s-%s@partners.ck12.org' % (partner, userToken)
        else:
            email = email.lower().strip()
        log.debug('login: email[%s]' % email)

        authTypeID = self.authTypeDict.get(partner, None)
        if not authTypeID:
            raise Exception((_(u'Unknown partner, %s.' % partner)).encode("utf-8"))
        log.debug('login: authTypeID[%s]' % authTypeID)

        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            roleID = self.memberRoleNameDict.get('teacher')
            token = m.generateDigest(userToken, seed=userToken)

            tx = utils.transaction(self.getFuncName())
            with tx as session:
                extData = api._getMemberExtData(session, authTypeID, externalID=userToken)
                if not extData:
                    extData = api._getMemberExtData(session, authTypeID, token=token)
                    if extData:
                        extData.externalID = userToken
                        session.add(extData)
                log.debug('login: extData[%s]' % extData)
                member = None
                if not extData:
                    if email:
                        member = api._getMemberByEmail(session, email=email)
                        log.debug('login: member[%s]' % member)
                    if member:
                        #
                        #  Create the MemberExtData entry.
                        #
                        extData = api._createMemberExtData(session, member.id, authTypeID, token, True, externalID=userToken, reset=False)
                log.debug('login: extData[%s]' % extData)
                if extData:
                    member = api._getMemberByID(session, id=extData.memberID)

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
                        return ErrorCodes().asDict(errorCode, 'Member with email[%s] is not a CK-12 teacher.' % email, infoDict = { 'ltiInfo': ltiInfo })
                    #
                    #  Teacher entry already exists, return error.
                    #
                    errorCode = ErrorCodes.MEMBER_ALREADY_EXISTS
                    return ErrorCodes().asDict(errorCode, 'Teacher with email[%s] already exists.' % email, infoDict = { 'ltiInfo': ltiInfo })
                #
                #  Create entry for teacher.
                #
                member = api._createMember(session,
                                           givenName=ltiInfo.get('lis_person_name_given', None),
                                           surname=ltiInfo.get('lis_person_name_family', None),
                                           authTypeID=authTypeID,
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
                kwargs = {
                    'userToken': userToken,
                }
                u.saveSession(request, member.id, member.email, partner, **kwargs)
                #
                #  Update analytics.
                #
                self._updateAnalytics(member, authTypeID, session=session)
                #
                #  Get user info.
                #
                member, extDict = m.getMember(member.id, member, authType=partner)
                userDict = m.getDict(member, extDict)
            log.debug('login: userDict%s' % userDict)
            result['response'] = userDict
            return result
        except Exception, e:
            log.error('login: Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.CANNOT_CREATE_MEMBER
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, False)
    @d.trace(log, ['member'])
    def create(self, member):
        """
            Protocol:
                - create the MemberExtData entry for the teacher
        """
        key = request.params.get('launch_key', None)
        log.debug('create: key[%s]' % key)
        if not key:
            errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
            return ErrorCodes().asDict(errorCode, 'Missing launch_key.')

        ltiInfoDict = pylons_session.get('ltiInfoDict', None)
        if not ltiInfoDict:
            errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
            return ErrorCodes().asDict(errorCode, 'No LTI data in session.')

        ltiInfo = ltiInfoDict
        log.debug('create: ltiInfo[%s]' % ltiInfo)
        if not ltiInfo:
            errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
            return ErrorCodes().asDict(errorCode, 'No LTI data for the given launch key[%s].' % key)

        consumerKey = ltiInfo.get('oauth_consumer_key')
        if not consumerKey:
            errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
            return ErrorCodes().asDict(errorCode, 'Missing LTI consumer key.')

        partner = self._getPartner(ltiInfo)
        log.debug('launch: partner[%s]' % partner)
        authTypeID = self.authTypeDict.get(partner, None)
        if not authTypeID:
            raise Exception((_(u'Unknown partner, %s.' % partner)).encode("utf-8"))
        log.debug('launch: authTypeID[%s]' % authTypeID)

        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            userToken = ltiInfo.get('user_id', None)
            if not userToken:
                errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
                return ErrorCodes().asDict(errorCode, 'Missing LTI user token.')
            externalID = userToken
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
                    return ErrorCodes().asDict(errorCode, 'Member with email[%s] is not a CK-12 teacher.' % member.email, infoDict = { 'ltiInfo': ltiInfo })
                #
                #  Make sure the association has not been done to
                #  another LTI user.
                #
                extData = None
                ext = member.ext
                for e in ext:
                    if e.authTypeID == authTypeID:
                        if e.externalID != externalID:
			    log.debug('create: Member has already been associated to %s externalID[%s].' % (partner, e.externalID))
                            errorCode = ErrorCodes.MEMBER_ALREADY_ASSOCIATED
                            return ErrorCodes().asDict(errorCode, 'Member has already been associated to %s externalID[%s].' % (partner, e.externalID), infoDict = { 'ltiInfo': ltiInfo })
                        #
                        #  Association done before.
                        #
                        extData = e
                if not extData:
                    #
                    #  Create the MemberExtData entry.
                    #
                    extData = api._createMemberExtData(session, member.id, authTypeID, token, True, externalID=userToken, reset=False)
                #
                #  Get user info.
                #
                member, extDict = m.getMember(member.id, member, authType=partner)
                userDict = m.getDict(member, extDict)
            result['response'] = userDict
            return result
        except Exception, e:
            log.warn('create: Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.CANNOT_UPDATE_MEMBER
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, False)
    @d.trace(log, ['member'])
    def get_launch_info(self, member):
        """
            Returns the LIT Launch information for the user
        """
        log.debug(request)
        key = request.params.get('launch_key', None)
        log.debug('get_launch_info: key[%s]' % key)
        if not key:
            errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
            return ErrorCodes().asDict(errorCode, 'Missing launch_key.')

        ltiInfoDict = pylons_session.get('ltiInfoDict', None)
        if not ltiInfoDict:
            errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
            return ErrorCodes().asDict(errorCode, 'No LTI data in session.')

        ltiInfo = ltiInfoDict
        log.debug('get_launch_info: ltiInfo[%s]' % ltiInfo)
        if not ltiInfo:
            errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
            return ErrorCodes().asDict(errorCode, 'No LTI data for the given launch key[%s].' % key)
        
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            if key.lower() == 'debug':
                ltiInfo = b64encode(str(ltiInfo))
            result['response'] = ltiInfo
            return result
        except Exception, e:
            log.warn('get_launch_info: Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.CANNOT_UPDATE_MEMBER
            return ErrorCodes().asDict(c.errorCode, str(e))
