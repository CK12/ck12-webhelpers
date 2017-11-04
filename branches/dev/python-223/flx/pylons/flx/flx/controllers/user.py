import logging
import time, os
import json

from pylons import request, config, session, tmpl_context as c
from pylons.i18n.translation import _ 
from pylons import request as req
from pylons import app_globals as g
from flx.model import api
from flx.model import exceptions as ex
from flx.controllers.errorCodes import ErrorCodes
from beaker.cache import CacheManager
from sqlalchemy.orm.exc import DetachedInstanceError

from flx.model.partnerDataManager import PartnerDataModel

log = logging.getLogger(__name__)
sessionTimeout = config.get('beaker.session.timeout', 86400)
partnerDataModel = PartnerDataModel()
def getInfoMy(login_cookie, cookie, memberID=None, appName=None):
    from cookielib import CookieJar
    from urllib2 import build_opener, HTTPCookieProcessor

    cj = CookieJar()
    opener = build_opener(HTTPCookieProcessor(cj))
    opener.addheaders.append(('Cookie', '%s=%s' % (login_cookie, cookie)))
    prefix = config.get('flx_auth_api_server')
    if not memberID:
        apiUrl = '%s/get/info/my' % prefix
    else:
        apiUrl = '%s/get/member/%d' % (prefix, memberID)
    if appName:
        apiUrl = '%s?appName=%s' % (apiUrl, appName)
    log.debug('getInfoMy: apiUrl[%s]' % apiUrl)
    data = opener.open(apiUrl, None, 30).read()
    try:
        j = json.loads(data)
    except Exception as je:
        log.warn("getInfoFromMy: exception[%s]" % str(je))
        j = None

    return j

def getInfoFromAuth(request, login_cookie, cookie, save=False, memberID=None, appName=None, txSession=None):
    if not appName:
        log.debug('getInfoFromAuth: request.params[%s]' % request.params)
        appName = request.params.get('appName', None)
    log.debug('getInfoFromAuth: appName[%s]' % appName)
    user = None
    try:
        j = getInfoMy(login_cookie, cookie, memberID, appName)
        log.debug('getInfoFromAuth: j[%s]' % j)
        if j and j['responseHeader']['status'] == 0:
            resp = j['response']
            id = resp.get('authID', resp['id'])
            email = resp['email']
            imageURL = resp.get('imageURL')
            memberLocation = resp.get('location')
            memberSchool = resp.get('school')
            roleDict, roleNameDict = g.getMemberRoles()
            if save:
                authType = resp.get('authType')
                if authType is None:
                    ## /get/member/<id> API returns authTypes dict
                    authTypes = resp.get('authTypes')
                    if authTypes:
                        authType = authTypes.keys()[0]
                if authType is None:
                    authType = 'ck-12'
                if not memberID:
                    if not appName:
                        kwargs = {}
                    else:
                        userToken = resp.get('userToken')
                        kwargs = {
                            'userToken': userToken,
                        }
                        if authType == "edmodoconnect":
                            authTypes = resp.get('authTypes')
                            externalID = authTypes[authType].get('externalID', None)
                            kwargs['externalID'] = externalID
                    saveSession(request, id, email, authType, authCookie=cookie, userImage=imageURL, location=memberLocation, school=memberSchool, **kwargs)
                    user = getCurrentUser(request, anonymousOkay=False, autoLogin=False, txSession=txSession)
                    log.debug('getInfoFromAuth: after getCurrentUser user[%s]' % user)
                else:
                    if not txSession:
                        user = api.getMemberByID(id=memberID)
                    else:
                        user = api._getMemberByID(txSession, id=memberID)
                if user:
                    isDirty = False
                    if email != user.email:
                        user.email = email
                        isDirty = True
                    if resp['stateID'] != user.stateID:
                        user.stateID = resp['stateID']
                        isDirty = True
                    if resp['login'] != user.login:
                        user.login = resp['login']
                        isDirty = True
                    if resp['defaultLogin'] != user.defaultLogin:
                        user.defaultLogin = resp['defaultLogin']
                        isDirty = True
                    if resp['firstName'] != user.givenName:
                        user.givenName = resp['firstName']
                        isDirty = True
                    if resp['lastName'] != user.surname:
                        user.surname = resp['lastName']
                        isDirty = True
                    if resp['timezone'] != user.timezone:
                        user.timezone = resp['timezone']
                        isDirty = True
                    user_roles = [groupRole.role.name.lower() for groupRole in user.groupRoles if groupRole.groupID == 1]
                    log.debug("user_roles: %s" % str(user_roles))
                    for authRole in resp.get('roles', []):
                        if authRole['name'].lower() not in user_roles:
                            roleID2Add = roleNameDict.get(authRole['name'].lower())
                            if not txSession:
                                api.createGroupHasMember(memberID=user.id, groupID=1, roleID=roleID2Add)
                            else:
                                api._createGroupHasMember(session=txSession, memberID=user.id, groupID=1, roleID=roleID2Add)
                        else:
                            user_roles.remove(authRole['name'].lower())
                    for role in user_roles:
                        role2Del = roleNameDict.get(role)
                        if not txSession:
                            api.deleteGroupHasMember(memberID=user.id, roleID=role2Del, groupID=1)
                        else:
                            api._deleteGroupHasMember(session=txSession, memberID=user.id, roleID=role2Del, groupID=1)
                    if isDirty:
                        if not txSession:
                            api.updateMember(user)
                        else:
                            api._updateMember(txSession, user)
                    c.user = user.asDict(includePersonal=True)
                    log.debug('getInfoFromAuth: c.user[%s]' % c.user)
            else:

                def create():
                    #
                    #  Create local copy.
                    #
                    ## Check once again for the user - this methos may be called multiple times.
                    user = api._getMemberByAuthID(txSession, id=id)
                    log.debug('getInfoFromAuth: create id[%s] user[%s]' % (id, user))
                    if not user:
                        role = resp.get('role')
                        roleID = roleNameDict.get(role['name'])
                        data = {
                            'authID': id,
                            'email': email,
                            'stateID': resp.get('stateID', 2),
                            'login': resp.get('login'),
                            'defaultLogin': resp.get('defaultLogin'),
                            'givenName': resp.get('firstName'),
                            'surname': resp.get('lastName'),
                            'roleID': roleID,
                        }
                        user = api._createMember(txSession, **data)
                        txSession.flush()
                        for authRole in resp.get('roles', []):
                            aRoleID = roleNameDict.get(authRole['name'].lower())
                            if aRoleID == roleID:
                                continue
                            api._createGroupHasMember(session=txSession, memberID=user.id, groupID=1, roleID=aRoleID)

                    return user

                if txSession:
                    user = create()
                else:
                    from flx.lib import helpers as h
                    from flx.model import utils

                    tx = utils.transaction(h.getFuncName())
                    with tx as txSession:
                        log.debug('getInfoFromAuth: txSession[%s]' % txSession)
                        user = create()
        
            #save partnerInformation in the session
            if resp.get('userLoggedInByPartner'):
                if isinstance(resp.get('partnerInfo'), dict):
                    if isinstance(resp.get('partnerInfo').get('partnerName'), basestring):
                        if isinstance(resp.get('partnerInfo').get('partnerMemberID'), basestring):
                            session['userLoggedInByPartner'] = True
                            session['partnerName'] = resp['partnerInfo']['partnerName']
                            session['partnerMemberID'] = resp['partnerInfo']['partnerMemberID']
        else:
            user = None
    except Exception, e:
        log.error('getInfoFromAuth: Failed to get user info from auth[%s]' % str(e), exc_info=e)
        user = None
    return user

def authLogin(request, login_cookie, cookie, txSession=None):
    return getInfoFromAuth(request, login_cookie, cookie, save=True, txSession=txSession)

def getCurrentUser(request=request, anonymousOkay=True, autoLogin=True, txSession=None, throwbackException=False, verifyPartnerLogin=False, partnerAppName=None):
    try:
        log.debug('getCurrentUser: Cookies[%s]' % request.cookies)
        login_cookie = config.get('ck12_login_cookie')
        userID = session.get('userID')
        log.debug('getCurrentUser: userID[%s]' % userID)

        user = None
        cookie = None
        if userID:
            #
            #  Check if the login_cookie exists and is same as what we saved when we logged in
            #  Otherwise kill the session.
            #
            match = False
            if login_cookie:
                cookie = request.cookies.get(login_cookie)
                log.debug('getCurrentUser: cookie[%s]' % cookie)
                log.debug('getCurrentUser: authCookie[%s]' % session.get('authCookie'))
                if cookie and session.get('authCookie') == cookie:
                    log.debug("getCurrentUser: Auth cookie exists and matches. We are good ...")
                    match = True
            if not match:
                log.debug("getCurrentUser: Auth cookie does not exist or mismatch. Kill the session!")
                session.invalidate()
                userID = None
        if not userID:
            userID = checkTestLogin(request)
        if not userID:
            userID = checkInternalLogin(request)
        if not userID:
            if autoLogin and login_cookie:
                if not cookie:
                    cookie = request.cookies.get(login_cookie)
                log.debug("getCurrentUser: Going to authLogin")
                user = authLogin(request, login_cookie, cookie, txSession=txSession)
                if user:
                    userID = user.id
        if not userID:
            userID = checkInternalLogin(request)
        if not userID:
            raise Exception((_(u'No user id found in request')).encode("utf-8"))
        if not user:
            if not txSession:
                user = api.getMemberByAuthID(id=userID)
            else:
                user = api._getMemberByAuthID(txSession, id=userID)
            if not user:
                user = getInfoFromAuth(request, login_cookie, cookie, txSession=txSession)
                log.debug('getCurrentUser: user[%s]' % user)

        #handle verifyPartnerLogin
        if verifyPartnerLogin:
            if not partnerAppName or not isinstance(partnerAppName, basestring):
                raise ex.InvalidArgumentException(u"Invalid partnerAppName : [{partnerAppName}] is received. partnerAppName is mandatory.".format(partnerAppName=partnerAppName).encode('utf-8'))
            
            if not session.get('userLoggedInByPartner') or not isinstance(session.get('partnerName'), basestring):
                raise ex.UnauthorizedException(u"This API requires the member login to have been performed by a partner but current member login is not done by a partner.".encode('utf-8'))
            else:
                partnerName = session['partnerName']
                partnerDataModel.verifyPartnerAppOwnership(partnerName, partnerAppName)

        #handle all the memberDefaultLoginActions when a partner logs him in 
        #(like update LMSProviderGroupMembers, insert GroupHasMembers, MemberStudyTrackItenStatuses)
        if session.get('userLoggedInByPartner') and isinstance(session.get('partnerName'), basestring) and isinstance(session.get('partnerMemberID'), basestring):
            partnerName = session['partnerName']
            partnerMemberID = session['partnerMemberID']
            memberDict = {}
            memberDict['memberID'] = session['userID']
            memberDict['memberEmail'] = session['email']
            memberDict['memberLogin'] = None
            memberDict['memberDefaultLogin'] = None
            partnerDataModel.performPartnerMemberDefaultLoginActions(memberDict, partnerName, partnerMemberID)

    except Exception, e:
        log.debug('getCurrentUser: exception e[%s]' % e)
        if throwbackException:
            raise e
        else:
            if anonymousOkay:
                if not txSession:
                    user = api.getMemberByLogin(login='guest')
                else:
                    user = api._getMemberByLogin(txSession, login='guest')
            else:
                user = None

    log.debug('getCurrentUser: returning user[%s]' % user)
    if user:
        try:
            user.id
        except DetachedInstanceError:
            if not txSession:
                user = api.merge(user)
            else:
                user = api._merge(txSession, user)
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
    cookieName = config.get('beaker.session.key')
    interalAuthDir = config.get('internal_auth_shared_dir')
    if not interalAuthDir:
        log.warn("No internal_auth_shared_dir defined. Cannot use internal auth.")
        return None

    cookieVal = request.cookies.get(cookieName)
    if cookieVal:
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

def checkOwner(member, ownerID, entity=None, session=None, noweb=False, failOnError=True):
    if isMemberAdmin(member, session=session) or (ownerID is not None and member.id == int(ownerID)):
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

def saveSession(request, id, email, authType, timeout=None, authCookie=None, userImage=None, location=None, school=None, **kwargs):
    if not timeout:
        timeout = long(sessionTimeout)
    else:
        timeout = long(timeout)
    
    from datetime import datetime, timedelta
    expires = datetime.now() + timedelta(0, timeout)
    session._set_cookie_expires(expires=expires)
    session._update_cookie_out()

    log.debug('saveSession: id[%s]' % id)
    #log.debug('saveSession: email[%s]' % email)
    log.debug('saveSession: authCookie[%s]' % authCookie)
    log.debug('saveSession: authType[%s]' % authType)
    session['userID'] = id
    session['email'] = email
    session['authType'] = authType
    session['authCookie'] = authCookie
    session['userImage'] = userImage
    session['userLocation'] = location
    session['userSchool'] = school
    log.debug('saveSession: kwargs%s' % kwargs)
    for key in kwargs.keys():
        session[key] = kwargs[key]
    session.save()
    request.environ['REMOTE_USER'] = id

def getSessionTimeout():
    return sessionTimeout

def getUserInfo(member, includePersonal=False):
    try:
        memberDict = member.asDict(includePersonal=includePersonal)
    except DetachedInstanceError:
        member = api.merge(member)
        memberDict = member.asDict(includePersonal=includePersonal)
    return memberDict, member

def isMemberAuthorized(member, roleNames=[], session=None, groupID=1):
    """
        Check if the member has one of the given roles in a given Group
    """
    if not member:
        return False

    try:
        id = member.id
    except DetachedInstanceError:
        member = api.merge(member)
        id = member.id

    if session:
        memberGroups = api._getMemberGroup(session, id=id, groupID=groupID)
    else:
        memberGroups = api.getMemberGroup(id=id, groupID=groupID)
    for mg in memberGroups:
        if mg.groupID == groupID:
            if roleNames:
                for roleName in roleNames:
                    if mg.role.name == roleName and mg.role.is_admin_role:
                        return True
            elif mg.role.is_admin_role:
                return True
    return False

def isMemberAdmin(member, session=None, groupID=1):
    return isMemberAuthorized(member, session=session, groupID=groupID)

def isMemberSuperAdmin(member, session=None, groupID=1):
    return isMemberAuthorized(member, roleNames=[ 'admin' ], session=session, groupID=groupID)

def getImpersonatedMember(member, forceRefresh=False):
    if isMemberAdmin(member) and req.params.get('impersonateMemberID'):
        memberID = int(req.params.get('impersonateMemberID'))
        impersonateMember = api.getMemberByID(id=memberID)
        if not impersonateMember or forceRefresh:
            log.debug("Refreshing user: %d as impersonatedMember" % memberID)
            login_cookie = config.get('ck12_login_cookie')
            cookie = req.cookies.get(login_cookie)
            getInfoFromAuth(req, login_cookie, cookie, save=impersonateMember is not None, memberID=memberID)
            impersonateMember = api.getMemberByID(id=memberID)
        if impersonateMember:
            log.info("Impersonating: %s" % impersonateMember.asDict())
            return impersonateMember
        else:
            log.error("Cannot get member record of impersonateMemberID: %s" % memberID)
    return member

def isMemberBlocked(member, objectType, subObjectType=None, objectID=None, session=None):
    if session:
        return api._getBlockedMemberByMemberID(session, member.id, objectType, subObjectType, objectID)
    else:
        return api.getBlockedMemberByMemberID(member.id, objectType, subObjectType, objectID)
