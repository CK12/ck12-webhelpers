import logging
import time, os
import json
from urllib import unquote
from urllib2 import build_opener
from cookielib import Cookie, CookieJar
from beaker.cache import CacheManager

from pylons import request, session, config, tmpl_context as c
from pylons.i18n.translation import _ 

import sts.lib.helpers as h
from sts.model import model

from sts.controllers.errorCodes import ErrorCodes

log = logging.getLogger(__name__)
sessionTimeout = config.get('beaker.session.timeout')
login_cookie = config.get('ck12_login_cookie')

def saveToSession(paramDict, timeout=1*60*60):
    if not timeout:
        timeout = long(sessionTimeout)
    else:
        timeout = long(timeout)

    for key in paramDict.keys():
        session[key] = paramDict.get(key)

    session.timeout = timeout
    session['login_cookie'] = request.cookies.get(login_cookie)
    session.save()

def saveCookies():
    session['cookies'] = []
    cj = CookieJar()
    for ck in request.cookies:
        cookie = Cookie(version=0, name=ck, value=request.cookies[ck], port=None, port_specified=False, domain='', domain_specified=False, 
                domain_initial_dot=False, path='/', path_specified=True, secure=False, 
                expires=None, discard=True, comment=None, comment_url=None, 
                rest={'HttpOnly': None}, rfc2109=False)
        cj.set_cookie(cookie)
    h.storeCookiesToSession(cj)

def getInfoMy(login_cookie, cookie, memberID=None, appName=None):
    from cookielib import CookieJar
    from urllib2 import build_opener, HTTPCookieProcessor

    cj = CookieJar()
    opener = build_opener(HTTPCookieProcessor(cj))
    opener.addheaders.append(('Cookie', '%s=%s' % (login_cookie, cookie)))
    prefix = config.get('ck12_login_prefix')
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

def getInfoFromAuth(request, login_cookie, cookie, memberID=None, appName=None):
    log.debug('getInfoFromAuth: request.params[%s]' % request.params)
    if not appName:
        appName = request.params.get('appName', None)
    try:
        j = getInfoMy(login_cookie, cookie, memberID, appName)
        log.debug('getInfoFromAuth: j[%s]' % j)
        if j and j['responseHeader']['status'] == 0:
            resp = j['response']
            authType = resp.get('authType')
            if authType is None:
                authTypes = resp.get('authTypes')
                if authTypes:
                    authType = authTypes.keys()[0]
            if authType is None:
                authType = 'ck-12'
            
            if not appName:
                kwargs = {}
            else:
                kwargs = {
                    'userToken': resp.get('userToken'),
                }
                if authType == "edmodoconnect":
                    authTypes = resp.get('authTypes')
                    externalID = authTypes[authType].get('externalID', None)
                    kwargs['externalID'] = externalID

            userData = {
                'id': resp.get('authID', resp['id']),
                'email': resp['email'],
                'stateID': resp.get('stateID', 2),
                'login': resp.get('login'),
                'defaultLogin': resp.get('defaultLogin'),
                'givenName': resp.get('firstName'),
                'surname': resp.get('lastName'),
                'roleID': resp.get('role').get('name'),
            } 
            user = userData
            c.user = userData
          
            kwargs['userID'] = resp.get('authID', resp['id'])
            kwargs['authType'] = authType
            kwargs['authCookie'] = cookie
            kwargs['userImage'] = resp.get('imageURL')
            kwargs['userLocation'] = resp.get('location')
            kwargs['userSchool'] = resp.get('school')
            kwargs['user'] = user
            saveToSession(kwargs)
            saveCookies()
        else:
            user = None
    except Exception, e:
        log.error('getInfoFromAuth: Failed to get user info from auth[%s]' % str(e), exc_info=e)
        user = None
    return user

def authLogin(request, login_cookie, cookie):
    return getInfoFromAuth(request, login_cookie, cookie)

def getCurrentUser(request=request,anonymousOkay=True, autoLogin=True, throwbackException=False):
    try:
        log.debug('getCurrentUser: Cookies[%s]' % request.cookies)
        log.debug('getCurrentUser: Session[%s]' % session)
        login_cookie = config.get('ck12_login_cookie')
        cookie = request.cookies.get(login_cookie)
        userID = session.get('userID')

        user = None
        if userID:
            #
            #  Check if the login_cookie exists and is same as what we saved when we logged in
            #  Otherwise kill the session.
            #
            match = False
            if login_cookie:
                if cookie and session.get('authCookie') == cookie:
                    log.debug("getCurrentUser: Auth cookie exists and matches. We are good ...")
                    match = True
                    user = session.get('user')
            if not match:
                log.debug("getCurrentUser: Auth cookie does not exist or mismatch. Kill the session!")
                session.invalidate()
                userID = None

        if not userID:
            userID, user = checkTestLogin(request)
        if not userID:
            userID = checkInternalLogin(request)
        if not userID:
            if autoLogin and login_cookie and cookie:
                log.debug("getCurrentUser: Going to authLogin")
                user = authLogin(request, login_cookie, cookie)
                if user:
                    userID = user.get('id')
        if not userID:
            userID = checkInternalLogin(request)
        if not userID:
            raise Exception((_(u'No user id found in request')).encode("utf-8"))
        if not user:
            user = getInfoFromAuth(request, login_cookie, cookie)
            log.debug('getCurrentUser: user[%s]' % user)
    except Exception, e:
        log.debug('getCurrentUser: exception e[%s]' % e, exc_info=e)
        if throwbackException:
            raise e
        else:
            if anonymousOkay:
                user = {
                         'id': 0,
                         'login': 'guest',
                         'email': None,
                         'name': 'Guest',
                         'authType': 'ck-12',
                         'sessionID': None,
                         'timeout': 0
                       }
            else:
                user = None

    log.debug('getCurrentUser: returning user[%s]' % user)
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
        if ret:
            userDict, cts = ret.rsplit(':', 1)
            log.debug("userDict: [%s], cts: %s" % (userDict, cts))
            userDict = json.loads(userDict)
            if userDict['id'] == int(userID):
                ## get the cache time stamp - it cannot be more than 5 minutes old
                timeout = config.get('beaker.session.timeout', '86400')
                if int(cts) - ts < int(timeout):
                    log.warn("Found valid test login for user: %s" % userID)
                    return userID, userDict
    return None, None

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
                        if user:
                            userID = user.get('id')
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

def hasRoleInGroup(roleName, groupID=1):
    user = getCurrentUser(anonymousOkay=False)
    if not user:
        return False

    ## Backdoor for tests
    if request.environ.get('paste.testing') == True and user['login'] == 'testAdmin':
        return True

    groupRoles = session.get('groupRoles')
    if groupRoles:
        roles = groupRoles.get(groupID)
        if roles and roleName.lower() in roles:
            return True

    memberID = user['id']
    j = h.makeRemoteCall('get/member/groups/%s' % memberID, None, method='GET')
    if j['responseHeader']['status'] != 0:
        raise Exception('Error getting roles and groups for user %s: [%s]' % (memberID, j['responseHeader']))

    if j['response']:
        for grp in j['response']:
            log.info("Group: %s" % grp)
            if grp['id'] == groupID:
                for role in grp['roles']:
                    log.info("Role: %s" % role)
                    if roleName.lower() in [ x['name'].lower() for x in role.values() ]:
                        ## Cache in session
                        if not session.get('groupRoles'):
                            session['groupRoles'] = {}
                        if not session['groupRoles'].get(groupID):
                            session['groupRoles'][groupID] = []
                        if roleName.lower() not in session['groupRoles'][groupID]:
                            session['groupRoles'][groupID].append(roleName.lower())
                            session.save()
                        return True

    return False

def checkCreatePrivileges(additional_roles=None):
    isPartner = False
    isAdmin = hasRoleInGroup('admin')
    if not isAdmin:
        isPartner = hasRoleInGroup('partner')
    if not isAdmin and not isPartner:
        if additional_roles:
            for additional_role in additional_roles:
                if hasRoleInGroup(additional_role):
                    return True, True
        return False, ErrorCodes().asDict(ErrorCodes.INSUFFICIENT_PRIVILEGES, message='You have in-sufficient privileges to perform the requested operation')
    return True, True

def autoLogin():
    user = None
    if login_cookie and request.cookies and request.cookies.get(login_cookie):
        try:
            ## Make login call
            opener = build_opener()
            opener.addheaders.append(('Cookie', '%s=%s' % (login_cookie, request.cookies[login_cookie])))
            prefix = config.get('ck12_login_prefix')
            log.info("Trying auto login: %s" % opener.addheaders)
            data = opener.open('%s/get/info/my' % prefix, None, 30).read()
            j = None
            try:
                j = json.loads(data)
            except Exception as je:
                log.warn("Cannot autoLogin: %s" % str(je))
            if j and j['responseHeader']['status'] == 0:
                resp = j['response']
                if not resp.get('authType'):
                    resp['authType'] = 'ck-12'
                for k in ["school"]:
                    if resp.has_key(k):
                        del resp[k]
                params = { 'user': resp, 'userID': str(resp.get('id')), 'groupRoles': None }
                saveToSession(params, 1*60*60)
                saveCookies()
                user = getCurrentUser(anonymousOkay=False, tryAutoLogin=False)
                log.debug('autoLogin c.user[%s]' % user)
            else:
                user = None
        except Exception, e:
            log.error('Failed to login automatically to auth: %s' % str(e), exc_info=e)
            user = None
    return user

