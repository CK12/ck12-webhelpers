import logging
import time, os, json

from pylons import config, session, tmpl_context as c
from pylons.i18n.translation import _ 
from pylons import request as req, response
from auth.model import api
from auth.model import exceptions as ex
from auth.lib import helpers as h
from auth.controllers.errorCodes import ErrorCodes
from beaker.cache import CacheManager
from sqlalchemy.orm.exc import DetachedInstanceError

log = logging.getLogger(__name__)

def getCurrentUser(request, anonymousOkay=True, autoLogin=True):
    authType = None
    try:
        log.debug("Cookies: %s" % request.cookies)
        userID = session.get('userID')
        if not userID:
            userID = checkTestLogin(request)
        if not userID:
            userID = checkInternalLogin(request)
        if not userID and not anonymousOkay:
            raise Exception((_(u'No user id found in request')).encode("utf-8"))

        from auth.controllers.member import getMember

        user, extDict = getMember(userID)
        if extDict.has_key('ck-12'):
            authType = 'ck-12'
        else:
            authType = extDict.keys()[0]
        if not user:
            raise Exception((_(u'Found a userID [%(userID)s] but no such user in DB')  % {"userID":userID}).encode("utf-8"))
    except Exception as e:
        log.debug('getCurrentUser: error[%s]' % str(e), exc_info=e)
        if anonymousOkay:
            user = api.getMemberByLogin(login='guest')
        else:
            user = None

    if user:
        try:
            user.id
        except DetachedInstanceError:
            user = api.merge(user)
        userID = session.get('userID')
        ## Convert both userID and id to string for correct comparison
        if userID and str(userID) != str(user.id) and authType:
            log.debug('getCurrentUser: old userID[%s, %s] user.id[%s, %s] authType[%s]' % (userID, type(userID).__name__, user.id, type(user.id).__name__, authType))
            saveSession(request, user.id, user.email, authType)
    return user

def __getCache():
    cm = CacheManager(type='file', data_dir=config.get('cache_share_dir'))
    return cm.get_cache('test-login-repo')

def checkTestLogin(request):
    ## Rely on login cache
    ## The test code can have access to the cache 
    ## only if running on the same machine
    cookieName = config.get('beaker.session.key')
    cookieVal = request.cookies.get(cookieName)
    log.debug('checkTestLogin: cookieName[%s] cookieVal[%s]' % (cookieName, cookieVal))
    if cookieVal and ':' in cookieVal:
        userID, ts = cookieVal.split(':')
        log.debug('checkTestLogin: userID[%s] ts[%s]' % (userID, ts))
        cache = __getCache()
        ## Current time stamp
        ts = int(time.time() * 1000)
        ret = cache.get_value(key='test-login-%s' % userID, expiretime=30*60)
        log.debug('checkTestLogin: ret[%s]' % ret)
        if ret and ret == cookieVal:
            userID, cts = ret.split(':', 1)
            ## get the cache time stamp - it cannot be more than 5 minutes old
            timeout = config.get('beaker.session.timeout', '86400')
            if int(cts) - ts < int(timeout):
                log.warn("Found valid test login for user: %s" % userID)
                return userID
    return None

def checkInternalLogin(request):
    ## Rely on shared file system
    ## The caller and callee both must have access to the shared file system
    log.debug("Checking internal auth ...: [%s]" % request.cookies)
    cookieName = config.get('beaker.session.key')
    interalAuthDir = config.get('internal_auth_shared_dir')
    if not interalAuthDir:
        log.warn("No internal_auth_shared_dir defined. Cannot use internal auth.")
        return None

    cookieVal = request.cookies.get(cookieName)
    if cookieVal and cookieVal != 'None':
        filePath = os.path.join(interalAuthDir, cookieVal)
        if os.path.exists(filePath):
            try:
                data = open(filePath, 'r').read()
                if data:
                    data = data.strip()
                    try:
                        userID = long(data)
                        return userID
                    except Exception, e:
                        user = api.getMemberByLogin(login=data)
                        if user:
                            userID = user.id
                        if not userID:
                            log.error("File exists but cannot convert contents to userID: %s" % data, exc_info=e)
                else:
                    log.warn("File exists but the contents are empty: %s" % filePath)
            finally:
                #os.remove(filePath)
                pass
        else:
            log.warn("No such file [%s]. Internal login failed." % filePath)
    return None

def getUserToken(request):
    """
        Get the cookie from the request if the user has
        logged in.
    """
    u = getCurrentUser(request, anonymousOkay=False)
    if u:
        cookieName = config.get('ck12_login_cookie')
        return request.cookies.get(cookieName)
    return None

def checkOwner(member, ownerID, entity=None, noweb=False, failOnError=True):
    if isMemberAdmin(member) or (ownerID is not None and member.id == int(ownerID)):
        return True

    if not failOnError:
        return False

    if not noweb:
        c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
    if ownerID is None:
        raise ex.UnauthorizedException(
                'Operation is not allowed by %s' % member.fix().name)

    if entity is None:
        raise ex.UnauthorizedException((_(u'%(member.name)s is not authorized.')  % {"member.name":member.fix().name}).encode("utf-8"))

    raise ex.UnauthorizedException(
                '%s identified by %s is not owned by %s' %
                (entity.type.name, entity.id, member.fix().name))

def saveSession(request, id, email, authType, timeout=None, authCookie=None, **kwargs):
    userID = session.get('userID')
    ## Convert both userID and id to string for correct comparison
    if userID and str(userID) != str(id):
        log.debug('saveSession: delete[%s]' % userID)
        session['userID'] = None
        session['email'] = None
        session.invalidate()
        log.debug('saveSession: deleted session[%s]' % session)

    log.debug('saveSession: cookies[%s]' % request.cookies)
    log.debug('saveSession: id[%s]' % id)
    sessionDomain = config.get('beaker.session.domain')
    session._set_domain(domain=sessionDomain)
    sessionPath = config.get('beaker.session.path')
    session._set_path(path=sessionPath)

    if not timeout:
        sessionTimeout = config.get('beaker.session.timeout')
        timeout = long(sessionTimeout)
    else:
        timeout = long(timeout)
    
    from datetime import datetime, timedelta
    expires = datetime.now() + timedelta(0, timeout)
    session._set_cookie_expires(expires=expires)
    session._update_cookie_out()

    session['userID'] = id
    session['email'] = email
    session['authType'] = authType
    session['authCookie'] = authCookie
    #log.debug('saveSession: kwargs%s' % kwargs)
    for key in kwargs.keys():
        log.debug('saveSession: key[%s] value[%s]' % (key, kwargs[key]))
        session[key] = kwargs[key]
    session.save()
    session.persist()
    request.environ['REMOTE_USER'] = id
    setUserCookies(request, id)

def setUserCookies(request, memberID):
    userCookie = config.get('user_id_cookie')
    userInfoCookie = config.get('user_info_cookie')
    setUserIDCookie = not request.cookies.get(userCookie)
    setUserInfoCookie = not request.cookies.get(userInfoCookie)
    ## Disable for now
    setUserInfoCookie = False
    if setUserIDCookie or setUserInfoCookie:
        sessionDomain = config.get('beaker.session.domain')
        if setUserIDCookie:
            sessionTimeout = config.get('beaker.session.timeout')
            timeout = int(sessionTimeout)
            ## Here we are simply encoding the memberID - not encrypting it. This is not PII
            response.set_cookie(userCookie, h.encodeVigenere(config.get('user_id_cipher_key'), memberID), max_age=timeout, path='/', domain=sessionDomain, secure=True, httponly=True)
        if setUserInfoCookie:
            user = api.getMemberByID(id=memberID)
            userInfo = user.asDict(includePersonal=False, includeExt=False)
            if user.roles:
                roles = []
                for role in user.roles:
                    roles.append(role.role.asDict())
                userInfo['roles'] = roles
            log.debug("userInfo: %s" % json.dumps(userInfo, default=h.toJson))
            response.set_cookie(userInfoCookie, h.encodeVigenere(config.get('user_id_cipher_key'), json.dumps(userInfo, default=h.toJson)), 
                    path='/', domain=sessionDomain, secure=True, httponly=True)

def getSessionTimeout():
    sessionTimeout = config.get('beaker.session.timeout')
    return sessionTimeout

def getUserInfo(member, includePersonal=False):
    try:
        memberDict = member.asDict(includePersonal=includePersonal)
    except DetachedInstanceError:
        member = api.merge(member)
        memberDict = member.asDict(includePersonal=includePersonal)
    return memberDict, member

def isMemberAuthorized(member, roleNames=[]):
    """
        Check if the member has given role.
    """
    try:
        id = member.id
    except DetachedInstanceError:
        member = api.merge(member)
        id = member.id

    memberRoles = api.getMemberHasRoles(memberID=id)
    for mr in memberRoles:
        if roleNames:
            if mr.role.name in roleNames:
                return True
        elif mr.role.is_admin_role:
            return True
    return False

def isMemberAdmin(member):
    return isMemberAuthorized(member)

def getImpersonatedMember(member):
    if isMemberAdmin(member) and req.params.get('impersonateMemberID'):
        memberID = int(req.params.get('impersonateMemberID'))
        impersonateMember = api.getMemberByID(id=memberID)
        if impersonateMember:
            #log.info("Impersonating: %s" % impersonateMember.asDict())
            return impersonateMember
    return member
