import logging
import os, time
from beaker.cache import CacheManager
from datetime import datetime, timedelta
from dexter.models import member
from dexter.models import exceptions as ex
from dexter.views.errorCodes import ErrorCodes
from dexter.views.decorators import jsonify
from dexter.lib import helpers as h
from dexter.lib.remoteapi import RemoteAPI as remotecall
from pymongo.errors import DuplicateKeyError
from dateutil import parser

log = logging.getLogger(__name__)

@h.trace
def getCurrentUser(request, anonymousOkay=True, tryAutoLogin=True, getImpersonatedUser=True):
    config = request.registry.settings
    session = request.session
    try:
        log.debug("Cookies: %s" % request.cookies)
        login_cookie = config.get('ck12_login_cookie')
        enable_test_login = str(config.get('enable_test_login', False)).lower() == 'true'
        internal_auth = str(config.get('internal_auth', False)).lower() == 'true'
        log.debug("enable_test_login: %s, internal_auth: %s, tryAutoLogin: %s" % (str(enable_test_login), str(internal_auth), str(tryAutoLogin)))
        userID = session.get('userID')
        log.debug("userID from session: %s" % userID)

        if userID:
            ## Check if the login_cookie exists and is same as what we saved when we logged in
            ## Otherwise kill the session
            if login_cookie and request.cookies.get(login_cookie):
                if session.get('authCookie') == request.cookies[login_cookie]:
                    log.info("Auth cookie exists and matches. We are good ...")
                    userID = session['userID']
                elif tryAutoLogin:
                    log.info("Auth cookie exists but no match. Auto login ...")
                    session.invalidate()
                    userID = None
            else:
                log.info("Auth cookie does not exist or does not match. Kill the session!")
                session.invalidate()
                userID = None
        if not userID:
            if tryAutoLogin and request.cookies.get(login_cookie):
                from dexter.views.decorators import autoLogin
                log.info("Going to autoLogin")
                user = autoLogin(request)
                if user:
                    userID = user['uID']
        if not userID and enable_test_login:
            userID = checkTestLogin(request)
        if not userID and internal_auth:
            userID = checkInternalLogin(request)
        if not userID:
            raise Exception(u'No user id found in request')
        user = member.Member(request.db).getMemberByID(id=userID)
        if not user:
            raise Exception('Found a userID [%s] but no such user in DB' % userID)
    except Exception, e:
        if session:
            session.invalidate()
        log.error('getCurrentUser: exception[%s]' % e)
        if anonymousOkay:
            user = member.Member(request.db).getMemberByLogin(login='guest')
        else:
            user = None

    if user and getImpersonatedUser:
        user = getImpersonatedMember(request, user)
    return user

@h.trace
def __getCache(request):
    config = request.registry.settings
    cm = CacheManager(type='file', data_dir=config.get('cache_share_dir'))
    return cm.get_cache('test-login-repo')

@h.trace
def checkTestLogin(request):
    ## Rely on login cache
    ## The test code can have access to the cache 
    ## only if running on the same machine
    config = request.registry.settings
    cookieName = config.get('session.key')
    log.debug("cookieName: %s" % cookieName)
    cookieVal = request.cookies.get(cookieName)
    log.debug("cookieVal%s" % cookieVal)
    log.debug(request.cookies)
    if cookieVal:
        login = cookieVal
        log.info("Login from cookieVal: %s" % login)
        user = member.Member(request.db).getMemberByLogin(login=login)
        if user:
            return user['_id']
    if cookieVal and ':' in cookieVal:
        userID, ts = cookieVal.split(':')
        cache = __getCache(request)
        ## Current time stamp
        ts = int(time.time() * 1000)
        ret = cache.get_value(key='test-login-%s' % userID, expiretime=30*60)
        if ret and ret == cookieVal:
            userID, cts = ret.split(':', 1)
            ## get the cache time stamp - it cannot be more than 5 minutes old
            timeout = config.get('session.timeout', '86400')
            if int(cts) - ts < int(timeout):
                log.warn("Found valid test login for user: %s" % userID)
                return userID
    return None

@h.trace
def checkInternalLogin(request):
    ## Rely on shared file system
    ## The caller and callee both must have access to the shared file system
    config = request.registry.settings
    cookieName = config.get('session.key')
    interalAuthDir = config.get('internal_auth_shared_dir')
    if not interalAuthDir:
        log.warn("No internal_auth_shared_dir defined. Cannot use internal auth.")
        return None

    cookieVal = request.cookies.get(cookieName)
    if cookieVal:
        filePath = os.path.join(interalAuthDir, cookieVal)
        if os.path.exists(filePath):
            data = open(filePath, 'r').read()
            if data:
                data = data.strip()
                try:
                    userID = long(data)
                    return userID
                except Exception, e:
                    user = member.Member(request.db).getMemberByLogin(login=data)
                    if user:
                        userID = user.uID
                    if not userID:
                        log.error("File exists but cannot convert contents to userID: %s" % data, exc_info=e)
            else:
                log.warn("File exists but the contents are empty: %s" % filePath)
            os.remove(filePath)
        else:
            log.warn("No such file [%s]. Internal login failed." % filePath)
    return None

@jsonify
@h.trace
def checkAuth(request, failOnError=True):
    user = getCurrentUser(request, anonymousOkay=False)
    if not user:
        errorCode = ErrorCodes.AUTHENTICATION_REQUIRED
        return ErrorCodes().asDict(errorCode, 'Authentication required')

@h.trace
def getUser(request, userID):
    userData = getUserData(request, userID)
    roles = [ r['name'] for r in userData['roles'] ]
    return checkOrCreateUser(request, userData, roles)

@h.trace
def getUserData(request, userID):    
    config = request.registry.settings
    interalAuthDir = config.get('internal_auth_shared_dir')
    if not interalAuthDir:
        log.warn("No internal_auth_shared_dir defined. Cannot use internal auth.")
        return None
    authPrefix = config.get('ck12_auth_prefix')
    j = remotecall.makeRemoteCallWithAuth('get/info/my', authPrefix, method='GET', ownerID=userID)
    if j['responseHeader']['status'] != 0:
        log.error("Error calling the member info API from auth: %s" % j)
        return None
    return j['response']

@h.trace
def checkOrCreateUser(request, userData, roles=[], fixDuplicateError=True):
    id, email, login, defaultLogin, firstName, lastName, updateTime, imageURL = userData['id'], userData['email'], userData.get('login'), \
            userData.get('defaultLogin'), userData.get('firstName'), userData.get('lastName'), userData.get('updateTime'), \
            userData.get('imageURL')
    user = member.Member(request.db).getMemberByID(id=id)
    kwargs = { 'uID': id, 'email': email, 'login': login, 'defaultLogin': defaultLogin, 'firstName': firstName, 'lastName': lastName, 'roles': roles,
            'imageURL': imageURL }
    if not user:
        log.debug("Creating new user: %s" % id)
        
        try: 
            user = member.Member(request.db).createMember(**kwargs)
        except DuplicateKeyError, e:
            if not fixDuplicateError:
                raise e
            fixDuplicateUser(request, kwargs, e)
            return checkOrCreateUser(request, userData,roles, fixDuplicateError=False)
    elif isMemberUpdateNeeded(user, updateTime, **kwargs):
        try: 
            user = member.Member(request.db).updateMember(user['_id'], **kwargs)
        except DuplicateKeyError, e:
            if not fixDuplicateError:
                raise e
            fixDuplicateUser(request, kwargs, e)
            user = member.Member(request.db).updateMember(user['_id'], **kwargs)
    return user

def fixDuplicateUser(request, kwargs, e):
    err = h.safe_encode(unicode(e))
    dupKey = None
    for key in kwargs.keys():
        if err.find(key) > 0:
            dupKey = key       
    if dupKey:
        query = {dupKey:kwargs[dupKey]}
        eUser = request.db.Members.find_one(query)
        if eUser:
            eUserUID = eUser['uID']
            eUserData = getUserData(request, userID = eUserUID)
            if eUserData:
                try:
                    checkOrCreateUser(request, eUserData, fixDuplicateError=False)
                    return 
                except Exception, e:
                    raise e    
            else:
                raise Exception('Unable to fix the duplicate exception in user data inject %s' % kwargs)  
    raise e 
   

@h.trace
def isMemberUpdateNeeded(user, updateTime, **kwargs):
    ## Update the user record - to make sure we get all latest info from auth
    from dexter.lib.localtime import Local
    updateTime = parser.parse(updateTime)
    updated = user.get('updated')
    if updateTime and not updateTime.tzinfo:
         updateTime = updateTime.replace(tzinfo=Local)
    if updated and not updated.tzinfo:
         updated = updated.replace(tzinfo=Local)
    # Bug 15457, Update user data, only if the user account was updated in auth server. 
    # Or update the user data if any new data field present in kwargs.  
    # Bug 29944 - Make sure check the roles array as well.
    toBeOrNotToBe = (not updateTime) or (not updated) or (updateTime > updated) or \
            len(filter(lambda k : k not in user.keys(),  kwargs.keys())) > 0 or \
            set(user.get('roles', [])) != set(kwargs.get('roles', [])) or \
            user.get('imageURL') != kwargs.get('imageURL')

    log.debug("Member needs update? %s" % str(toBeOrNotToBe))
    return toBeOrNotToBe


@h.trace
def saveSession(request, userData, timeout=None, authCookie=None):
    session = request.session
    if timeout is None:

        timeout = getSessionTimeout(request)
        expires = datetime.now() + timedelta(0, timeout)
        #session._set_cookie_expires(expires=expires)
        #session._update_cookie_out()

    ## Create user if new
    user = checkOrCreateUser(request, userData, roles=[r['name'] for r in userData['roles']])

    session['userID'] = user['uID']
    session['email'] = user['email']
    session['login'] = user['login']
    session['authType'] = userData['authType']
    session['roles'] = user.get('roles')
    session['authCookie'] = authCookie
    session.save()
    request.environ['REMOTE_USER'] = user['uID']

@h.trace
def killSession(request):
    session = request.session
    request.environ['REMOTE_USER'] = None
    try:
        session.invalidate()
        session.delete()
    except Exception:
        pass

def getSessionTimeout(request):
    sessionTimeout = long(request.registry.settings.get('session.timeout', 86400))
    return sessionTimeout

def checkOwner(obj, request, user, ownerID, noweb = False, allowAdmin = True, failOnError=True):
    if (allowAdmin and isMemberAdmin(request, user)) or (ownerID is not None and str(user['_id']) == str(ownerID)):
        return True

    if not failOnError:
        return False

    if not noweb:
        obj.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
    if ownerID is None:
        raise ex.UnauthorizedException(
                'Operation is not allowed by %s' % user['firstName'])
    else:
        raise ex.UnauthorizedException((u'%(name)s is not authorized.')  % {"name":user['firstName']})


def hasRoleInGroup(request, roleName, groupID=1, user=None):
    if not user:
        user = getCurrentUser(request, anonymousOkay=False)
        if not user:
            return False

    ## Backdoor for tests
    if request.environ.get('paste.testing') == True and user['login'] == 'testAdmin':
        return True

    session = request.session
    groupRoles = session.get('groupRoles')
    if groupRoles:
        roles = groupRoles.get(groupID)
        if roles and roleName.lower() in roles:
            return True

    memberID = user.get('uID')
    if not memberID:
        return False
    settings = request.registry.settings    
    core_server = settings.get('flx_core_api_server')
    internal_auth = settings.get('internal_auth', 'false').lower() == 'true'
    auth_pass = dict(request.cookies)
    if internal_auth:
        j = remotecall.makeRemoteCallWithAuth('get/member/groups/%s' % memberID, core_server, method='GET', ownerID=memberID)
    else:
        j = remotecall.makeRemoteCall('get/member/groups/%s' % memberID, core_server, auth_pass=auth_pass, method='GET')

    if j['responseHeader']['status'] != 0:
        raise Exception('Error getting roles and groups for user %s: [%s]' % (memberID, j['responseHeader']))

    if j['response']:
        for grp in j['response']:
            log.info("Group: %s" % grp)
            if grp['id'] == groupID:
                for role in grp['roles']:
                    log.debug("Role: %s" % role)
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

## Check if the member has a given role
def memberHasRole(request, user, roleNames, getImpersonatedUser=True):
    if not user:
        user = getCurrentUser(request, anonymousOkay=False, getImpersonatedUser=getImpersonatedUser)
    if not user:
        return False
    if not user.has_key('roles'):
        ## Need to sync the user again
        killSession(request)
        user = getCurrentUser(request, anonymousOkay=False, getImpersonatedUser=getImpersonatedUser)
        if not user:
            return False
    ret = False
    if roleNames:
        for rl in roleNames:
            log.debug("Checking %s in %s" % (rl.lower(), user.get('roles')))
            ret = rl.lower() in user.get('roles', [])
            if ret:
                break
    log.debug("Returning: %s" % ret)
    return ret

#TODO: Identify admin user by member role.
def isMemberAdmin(request, user):
    config = request.registry.settings
    adminRoles = [r.strip() for r in config.get('admin_roles').split(',')]
    isAdmin = memberHasRole(request, user, roleNames=adminRoles, getImpersonatedUser=False)
    user['isAdmin'] = isAdmin
    return isAdmin

def checkMembersInGroup(self, groupID, admin=None, members=[]):
    if not admin or not members:
        return
    g_members = getGroupMembers(self.request, groupID=groupID)

    if admin and not isMemberAdmin(self.request, admin):
        admin_ids  = [m['id'] for m in g_members if m['groupMemberRole'] == 'groupadmin']
        if admin['uID'] not in admin_ids:
           self.c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
           raise Exception('Permission denied')
    if members:   
        member_ids = [m['id'] for m in g_members]
        for m in members:
            if int(m) not in member_ids:
               self.c.errorCode = ErrorCodes.MEMBER_NOT_IN_GROUP
               raise Exception('Member(id:%s) not in group' % m)

def isMemberGroupAdmin(request, member, groupID):
    g_members = getGroupMembers(request, groupID=groupID, filters={'groupMemberRole':'groupadmin'})
    memberID = member['uID']
    isAdmin = False
    for mem in g_members:
        if mem['id'] == memberID:
            isAdmin = True
            break
    return isAdmin 

def isMemberInGroup(request, memberID, groupID):
    g_members = getGroupMembers(request, groupID=groupID)
    isMember = False
    for mem in g_members:
        if mem['id'] == memberID:
            isMember = True
            break
    return isMember

def getImpersonatedMember(req, user):
    if user and isMemberAdmin(req, user) and req.params.get('impersonateMemberID'):
        memberID = req.params.get('impersonateMemberID')
        impersonateMember = member.Member(req.db).getMemberByID(id=memberID)
        if not impersonateMember:
            ## We need to create this member entry
            impersonateMember = getUser(req, memberID)
        if impersonateMember:
            log.info("Impersonating: %s" % impersonateMember)
            return impersonateMember
        else:
            log.error("Cannot get the member record for impersonateMemberID: %s" % memberID)
    return user

def getGroupMembers(request, groupID, filters={}):
    params = {}
    params['groupID'] = groupID
    params['filters'] = ';'.join([r for r in [','.join([str(q) for q in p]) for p in filters.items()]])
    params['pageSize'] = 100
    settings = request.registry.settings    
    core_server = settings.get('flx_core_api_server')
    auth_pass = dict(request.cookies)
    j = remotecall.makeRemoteCall('group/members', core_server, auth_pass=auth_pass, params_dict=params, method='GET')
    if j['responseHeader']['status'] != 0:
        raise Exception('Error getting members list in group:%s: [%s]' % (groupID, j['response']['message']))
    if j['response'] and j['response'].has_key('members'):
       return j['response']['members']
    return [] 
