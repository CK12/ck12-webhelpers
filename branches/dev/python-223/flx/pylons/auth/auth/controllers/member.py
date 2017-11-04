from Crypto.Cipher import Blowfish
from base64 import b16encode, b16decode
from datetime import datetime
from auth.controllers import decorators as d
from auth.controllers.errorCodes import ErrorCodes
from auth.controllers.extAuth import ExtAuthController
from auth.lib.base import BaseController, render
from auth.lib.remoteapi import RemoteAPI
from auth.model import api, exceptions as ex, model, utils
from auth.model.exceptions import RemoteAPIStatusException
from auth.model.mongosession import MongoSession, getDB as getSessionDB
from pylons import app_globals as g, config, request, response
from pylons import tmpl_context as c, url, session as pylons_session
from pylons.controllers.util import redirect
from auth.lib.clever import CleverPartner
from pylons.i18n.translation import _
from sqlalchemy.orm.exc import DetachedInstanceError
import copy
import auth.controllers.user as u
import auth.lib.helpers as h
import hashlib
import logging
import pytz
import shutil
import os
import time
import json
import re
import traceback
import urllib

log = logging.getLogger(__name__)

def generateDigest(password, seed=None):
    if seed is None:
        import random

        seed = str(random.random())
    salt = hashlib.sha256(seed).hexdigest()[:5]
    if type(password) == unicode:
        password = password.encode('utf8')
    password = urllib.unquote(password)
    p = salt + password
    token = hashlib.sha256(p).hexdigest()
    return 'sha256:%s:%s' % (salt, token)

def _checkPassword(member, extDict, memberToken, password):
    if member.state.name != 'activated':
        isUnderAge = False
        try:
            from dateutil.relativedelta import relativedelta
            if member.state.name == 'deactivated' and member.birthday\
              and relativedelta(member.creationTime.date(), member.birthday).years < 13:
                c.hasParentEmail = True
                underageMemberParent = api.getUnderageMemberParent(memberID=member.id)
                isUnderAge = True

                #
                # Encode member email and other information if any, to not to expose in links
                #
                from base64 import standard_b64encode
                encodedData = json.dumps({'member_email': member.email}, ensure_ascii=False, default=h.toJson).encode('utf-8')
                encodedData = urllib.quote(standard_b64encode(encodedData))
                c.encodedData = encodedData

                #
                #If underage parent information not present, show link to redirect to underageSignup.html
                #
                if not underageMemberParent:
                    c.hasParentEmail = False
                else:
                    c.token = underageMemberParent.token
                messageHtml = render('/auth/member/underageInDeactivatredStateErrorMessage.html')
                raise Exception((_(messageHtml)).encode("utf-8"))
        except Exception as e:
            if isUnderAge:
                raise e
            pass
        raise Exception((_(u'Member is not active. login: %(member.login)s')  % {"member.login":member.login}).encode("utf-8"))

    if memberToken is None or not password:
        return True

    if type(password) == unicode:
        password = password.encode('utf8')
    password = urllib.unquote(password)

    try:
        algorithm, salt, mpass = memberToken.split(':')
        if algorithm != 'sha256':
            raise Exception((_(u'_checkPassword: unknown algorithm[%(algorithm)s]')  % {"algorithm":algorithm}).encode("utf-8"))

        salt = salt.encode('utf8')
        p = salt + password
        digest = hashlib.sha256(p).hexdigest()
    except ValueError:
        try:
            #
            #  Release 1.x style.
            #
            algorithm, salt, mpass = memberToken.split('$')
            salt = salt.encode('utf8')
            p = salt + password
            if algorithm == 'sha1':
                digest = hashlib.sha1(p).hexdigest()
            elif algorithm == 'md5':
                digest = hashlib.md5(p).hexdigest()
            elif algorithm == 'crypt':
                try:
                    import crypt
                except ImportError:
                    raise ValueError('_checkPassword: "crypt" password algorithm not supported.')
                digest = crypt.crypt(password, salt)
            else:
                raise Exception((_(u'_checkPassword: Unknown algorithm[%(algorithm)s]')  % {"algorithm":algorithm}).encode("utf-8"))
        except ValueError:
            try:
                #
                #  Release 2.0 style without salt.
                #
                algorithm, mpass = memberToken.split(':')
                if algorithm != 'sha256':
                    raise Exception((_(u'_checkPassword: unknown algorithm[%(algorithm)s]')  % {"algorithm":algorithm}).encode("utf-8"))

                digest = hashlib.sha256(password).hexdigest()
                if mpass == digest:
                    #
                    #  Seemlessly convert to new style by adding salt.
                    #
                    authTypeID = extDict['authTypeID']
                    for e in member.ext:
                        if e.authTypeID == authTypeID:
                            e.token = generateDigest(password)
                            api.update(instance=e)
                            member = member.cache(model.INVALIDATE, instance=member)
            except ValueError:
                return False
    return mpass == digest

def getMember(id, member=None, useID=True, authType=None, session=None):
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
        if session:
            member = api._getMember(session, id=id, login=login, email=email)
        else:
            member = api.getMember(id=id, login=login, email=email)
        if not member:
            if not id:
                id = email if email else login
            raise ex.NotFoundException((_(u"Member '%(id)s' does not exist.")  % {"id":id}).encode("utf-8"))

    extDict = {}
    for e in member.ext:
        if authType:
            name = authType
        elif e.authType:
            name = e.authType.name
        else:
            authTypeNames = g.getMemberAuthTypeNames(session=session)
            name = authTypeNames[e.authTypeID]
        extDict[name] = {
            'authTypeID' : e.authTypeID,
            'token': e.token,
            'verified': e.verified,
            'loginCount': e.loginCount,
            'externalID':e.externalID
        }
    return member, extDict

def birthdayStr(birthday):
    if not birthday:
        return birthday
    birthday = birthday.strip()
    if not birthday:
        return birthday
    try:
        birthday = datetime.strptime(birthday, '%m/%d/%Y').date()
    except ValueError:
        try:
            birthday = datetime.strptime(birthday, '%Y/%m/%d').date()
        except ValueError:
            try:
                birthday = datetime.strptime(birthday, '%Y-%m-%d').date()
            except ValueError:
                raise Exception((_(u'Invalid date format. Use mm/dd/yyyy, yyyy/mm/dd, or yyyy-mm-dd')).encode("utf-8"))
    if birthday.year < 1900:
        raise Exception((_(u'Invalid year: Must be after year 1900.')).encode("utf-8"))
    return birthday

@d.trace(log)
def isUnderageMember(member):
    birthday = member.birthday
    if not birthday:
        return False
    today = datetime.strptime(datetime.now().__format__('%m/%d/%Y'), '%m/%d/%Y')
    birthday = datetime.strptime(birthday.__format__('%m/%d/%Y'), '%m/%d/%Y')
    from dateutil.relativedelta import relativedelta
    if relativedelta(today, birthday).years < 13:
        return True
    return False

def getDict(member, extDict=None, moreDetails=False, isMemberAdmin=False, session=None):
    memberDict = {}
    memberDict['id'] = member.id
    if not hasattr(member, 'state') and not hasattr(member.state, 'name'):
        states, stateNames = g.getAuthMemberStates(session=session)
        stateName = states[member.stateID]
    else:
        stateName = member.state.name
    memberDict['state'] = stateName
    memberDict['stateID'] = member.stateID
    memberDict['login'] = member.login
    memberDict['defaultLogin'] = member.defaultLogin
    memberDict['email'] = member.email
    memberDict['firstName'] = member.givenName
    memberDict['lastName'] = member.surname
    memberDict['isProfileUpdated'] = member.isProfileUpdated
    memberDict['licenseAcceptedTime'] = member.licenseAcceptedTime
    hasLoginConflict = getattr(member, 'hasLoginConflict', False)
    if hasLoginConflict:
        memberDict['hasLoginConflict'] = hasLoginConflict
    isRosterUser = bool(re.search(r'student-.*partners.ck12.org', member.email))
    if isRosterUser:
        log.debug('getDict: email[%s]' % member.email)
        un, domain = member.email.split('@')
        log.debug('getDict: un[%s] domain[%s]' % (un, domain))
        try:
            s, tid, login = re.search(r'^(student)-(\d*)-(.*)', un).groups()
        except Exception, e:
            log.error('getDict: Error processing un[%s] Exception [%s]'%(un,traceback.format_exc()))
            raise e
        log.debug('getDict: s[%s] tid[%s] login[%s]' % (s, tid, login))
        memberDict['isRosterUser'] = True
        memberDict['teacherID'] = tid
    if isUnderageMember(member):
        memberDict['isUnderage'] = True
    if not member.givenName and not member.surname:
        memberDict['firstName'] = member.email
    if member.suffix is not None:
        memberDict['suffix'] = member.suffix
    if member.title is not None:
        memberDict['title'] = member.title
    if member.gender is not None:
        memberDict['gender'] = member.gender
    if member.imageURL is not None:
        memberDict['imageURL'] = member.imageURL
    if member.roles:
        roles = []
        for role in member.roles:
            roles.append(role.role.asDict())
        memberDict['roles'] = roles
        memberDict['role'] = roles[0]
    else:
        memberRoleDict, memberRoleNameDict = g.getAuthMemberRoles(session=session)
        memberDict['role'] = { 'id': memberRoleNameDict['guest'], 'name': 'guest' }
    memberDict['registered'] = unicode(member.creationTime)
    memberDict['lastLogin'] = unicode(member.loginTime)
    memberDict['timezone'] = unicode(member.timezone)
    isNewMember = True
    if extDict is not None:
        for key in extDict.keys():
            del extDict[key]['token']
            #If any of auth types has a non-zero loginCount, don't consider member as new
            if extDict[key].get('loginCount', 0) != 0:
                isNewMember = False
        memberDict['authTypes'] = extDict
        memberDict['newMember'] = isNewMember
    if moreDetails:
        memberDict['phone'] = member.phone
        memberDict['fax'] = member.fax
        memberDict['website'] = member.website
        addressDict = getMemberLocation(member)
        if addressDict:
            memberDict['address'] = addressDict
        schoolDict = getMemberSchool(member)
        memberDict['school'] = schoolDict
    #include extra fields if requester is admin user
    if isMemberAdmin:
        memberDict['birthday'] = member.birthday
    return memberDict

def getMemberLocation(member):
    location = api.getMemberLocation(memberID=member.id)
    if location is not None:
        countryID = location.countryID
        addressID = location.addressID
        countryDict, countryNameDict = g.getCountries()
        if countryID == countryNameDict['US']:
            address = api.getUSAddress(id=addressID)
            if address is None:
                addressDict = {}
            else:
                addressDict = {
                    'city': address.city,
                    'state': address.state,
                    'postalCode': address.zip,
                    'country': countryDict[countryID]
                }
        else:
            address = api.getWorldAddress(id=addressID)
            if address is None:
                addressDict = {}
            else:
                addressDict = {
                    'city': address.city,
                    'province': address.province,
                    'postalCode': address.postalCode,
                    'country': countryDict[countryID]
                }
        return addressDict
    return None

def getMemberSchool(member):
    mschool = api.getMemberSchool(memberID=member.id)
    schoolDict = {}
    if mschool is not None:
        schoolType = mschool.schoolType
        schoolID = mschool.schoolID
        if schoolType == 'usmaster':
            school = api.getUSSchool(id=schoolID)
            if school is not None:
                schoolDict = {
                    'id': schoolID,
                    'name': school.name,
                    'nces_id': school.nces_id,
                    'address': school.address,
                    'city': school.city,
                    'state': school.state,
                    'zipcode': school.zipcode,
                    'county': school.county
                }
        elif schoolType == 'other':
            school = api.getOtherSchool(id=schoolID)
            if school is not None:
                schoolDict = {
                    'id': schoolID,
                    'name': school.name,
                }
        elif schoolType == 'home':
            schoolDict = {
                'schoolType': 'home'
            }
    return schoolDict

def validateLogin(login, token, authType, checkAlternative=False):
    if login is None:
        raise ex.InvalidLoginException((_(u'No login provided.')).encode("utf-8"))

    if authType is None:
        authType = 'ck-12'

    if type(login) == unicode:
        login = login.encode('utf8')
    login = urllib.unquote(login)
    #login = login.lower().strip()
    login = login.strip()
    #
    #  Identify the user by login name.
    #
    if not checkAlternative:
        try:
            member, extDict = getMember(login, useID=False)
        except ex.NotFoundException:
            try:
                member, extDict = getMember(login.lower(), useID=False)
            except ex.NotFoundException:
                raise Exception((_(u'Incorrect login or password.')).encode("utf-8"))
    else:
        #
        #  This block of code is temporary.
        #
        #  It's used to clean up the user name
        #  conflicts.
        #
        #  It should be removed once the duplicate
        #  user name issue has been resolved.
        #
        memberID = None
        dupLogins = api.getDupLogins(login=login)
        if dupLogins:
            for dupLogin in dupLogins:
                if login == dupLogin.login:
                    memberID = dupLogin.memberID
                    break
        if not memberID:
            raise Exception((_(u'Incorrect login or password.')).encode("utf-8"))

        member = api.getMemberByID(id=memberID)
        if not member:
            raise Exception((_(u'Incorrect login or password.')).encode("utf-8"))

        try:
            member, extDict = getMember(memberID, member)
        except ex.NotFoundException:
            raise Exception((_(u'Incorrect login or password.')).encode("utf-8"))

        log.debug('validateLogin: member[%s]' % member)
        log.debug('validateLogin: extDict[%s]' % extDict)
    #
    #  Authenticate the login/password.
    #
    auth = extDict.get(authType)
    if auth is None:
        raise Exception((_(u'Incorrect login or password.')).encode("utf-8"))

    memberToken = auth['token']
    if memberToken is not None:
        if not _checkPassword(member, auth, memberToken, token):
            raise Exception((_(u'Incorrect login or password.')).encode("utf-8"))

    return member, extDict

def encryptPasswordResetToken(id, email, expire):
    """
        Generates an encrypted token to be used in password reset URL 
    """
    data = '%s@%s@%s' % (id, int(time.time()) + int(expire * 60 * 60 * 24), email)
    if len(data) % 8:
        # data block length must be multiple of eight
        data += 'X' * (8 - (len(data) % 8)) 
    return b16encode(Blowfish.new(config.get('member.password.reset.secret')).encrypt(data))

def decryptPasswordResetToken(token, checkExpiration=True):
    """
        Decrypts a password reset token. Returns (member email, member id) if
        the token is valid, else raise an exception
    """
    try:
        id, expire, email = Blowfish.new(config.get('member.password.reset.secret')).decrypt(b16decode(token)).rstrip('X').split('@', 2)
        try:
            expire = int(expire)
        except ValueError:
            #
            #  The order was different before, make it backward compatible.
            #
            email, id, expire = Blowfish.new(config.get('member.password.reset.secret')).decrypt(b16decode(token)).rstrip('X').rsplit('@', 2)
            expire = int(expire)
        if checkExpiration and expire < time.time():
            raise Exception((_(u'Time duration for this request has expired.')).encode("utf-8"))
        return email, id, expire
    except Exception, e:
        log.exception('invalid password reset token Exception[%s]' % str(e))
        raise e

def encryptUnderAgeVerifyEmailToken(member,parentEmail, expire):
    """
        Generates an encrypted token to be used in password reset URL 
    """
    data = '%s@@%s@@%s@@%s' % (member.email, member.id, parentEmail, int(time.time()) + int(expire * 60 * 60 * 24 * 7))
    if len(data) % 8:
        # data block length must be multiple of eight
        data += 'X' * (8 - (len(data) % 8)) 
    return b16encode(Blowfish.new(config.get('member.password.reset.secret')).encrypt(data))

def decryptUnderAgeVerifyEmailToken(token, checkExpiration=True):
    """
        Decrypts a password reset token. Returns (member email, member id) if
        the token is valid, else raise an exception
    """
    try:
        email, id, parentEmail, expire = Blowfish.new(config.get('member.password.reset.secret')).decrypt(b16decode(token)).rstrip('X').rsplit('@@')
        expire = int(expire)
        if checkExpiration and expire < time.time():
            raise ex.TokenExpired((_(u'Time duration for this request has expired.')).encode("utf-8"))
        return email, id, parentEmail, expire
    except Exception, e:
        log.exception('invalid under age email varification token Exception[%s]' % str(e))
        raise e


class MemberController(ExtAuthController):
    """
        Member related APIs.
    """
    sessionDB = None

    def _get(self, id, member=None, useID=True, session=None):
        """
            Retrieves the member that matches the given id, login or email.
        """
        if id is None:
            if request.params.has_key('id'):
                id = request.params['id']
        return getMember(id, member, useID=useID, session=session)
    
    @d.trace(log, ['login'])
    def validateUsername(self, login=None):
        response.content_type = 'application/json; charset=utf-8'

        member = u.getCurrentUser(request, anonymousOkay=False)
        loggedIn = False if member is None else True

        if not login:
            login = request.params.get('login')
            if not login:
                return "false"

        login = login.lower().strip()
        if loggedIn and login == member.login:
            return "true"

        member = api.getMemberByLogin(login=login)
        if member is None:
            return "true"
        else:
            return "false"

    @d.trace(log, ['firstName', 'lastName', 'email', 'login','birthday'])
    def validate(self, firstName=None, lastName=None, email=None, login=None, birthday=None):
        """
            Validate that this is an existing email or login.
        """
        response.content_type = 'application/json; charset=utf-8'

        member = u.getCurrentUser(request, anonymousOkay=False)
        loggedIn = False if member is None else True

        if email is None:
            email = request.params.get('email')

        if login is None:
            login = request.params.get('login')
        
        if firstName is None:
            firstName = request.params.get('firstName')
        
        if firstName:
            firstName = firstName.strip()
            if not firstName.__contains__('"') and not firstName.__contains__('<'):
                return "true"
        
        if lastName is None:
            lastName = request.params.get('lastName')
        
        if lastName:
            lastName = lastName.strip()
            if not lastName.__contains__('"') and not lastName.__contains__('<'):
                return "true"

        if email or login:
            if email:
                email = email.strip()
                if loggedIn and email == member.email:
                    #
                    #  Member with this email already logged in.
                    #
                    return "true"

                try:
                    m, ext = getMember(id=email)
                    log.debug('validate: found member[%s]' % m.id)
                except Exception:
                    m = None

                if not m and member:
                    exts = api.getMemberExtData(externalID=email)
                    if exts and len(exts) > 0:
                        for e in exts:
                            if e.memberID != member.id:
                                #
                                #  This email belongs to someone else.
                                #
                                return "false"

                if not m:
                    #
                    #  Unused email.
                    #
                    return "true"
                if m.stateID == 3:
                    #
                    #  Inactive member's email.
                    #
                    return "true"
                    
            else:
                login = login.lower().strip()
                if loggedIn and login == member.login.lower():
                    return "true"

                member = api.getMemberByLogin(login=login)
                if member is None:
                    chars = set('~#%')
                    if not any((c in chars) for c in login):
                        return "true"

        if not birthday:
            birthday = request.params.get('birthday')
        if birthday:
            try:
                from dateutil.relativedelta import relativedelta

                birthday = birthdayStr(birthday) # datetime.strptime(birthday.strip().__format__('%m/%d/%Y'), '%m/%d/%Y')
                today = datetime.strptime(datetime.now().__format__('%m/%d/%Y'), '%m/%d/%Y')
                delta = relativedelta(today, birthday)
                if delta.years > 0 or delta.months > 0 or delta.days > 0:
                    return "true"
            except Exception, dte:
                log.warn('validate: exception date[%s]' % dte)
                return "false"

        return "false"

    #
    # Export Members csv API. 
    #
   
    @d.jsonify()
    @d.checkAuth(request, False, False, [])
    @d.setPage(request, ['member'])
    @d.trace(log, ['member', 'startDate', 'endDate', 'pageNum', 'pageSize'])
    def getmembersforExport(self,member,startDate=None,endDate=None, pageNum=0, pageSize=10):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        startDate = request.params.get('startDate')
        endDate = request.params.get('endDate')
      
        try:
            if startDate is None or endDate is None:
                raise ex.InvalidArgumentException((_(u'Required parameter, startDate or endDate, is missing')).encode("utf-8"))
            
            startDate =  datetime.strptime(startDate + " 00:00:00" , '%Y-%m-%d %H:%M:%S')
            endDate =  datetime.strptime(endDate + " 23:59:59" , '%Y-%m-%d %H:%M:%S')
                 
            id = request.params.get('id')
            if id is not None:
                try:
                    id = long(id)
                    if id != member.id and not u.isMemberAdmin(member):
                        raise ex.UnauthorizedException((_(u'Only admin can view other members.')).encode("utf-8"))
                except ValueError:
                    if id != member.email and id != member.login and not u.isMemberAdmin(member):
                        raise ex.UnauthorizedException((_(u'Only admin can view other members.')).encode("utf-8"))
                member, extDict = self._get(id)
                memberDict = getDict(member, extDict)
                result['response'] = memberDict
                return result

            if not u.isMemberAdmin(member):
                raise ex.UnauthorizedException((_(u'Only admin can view other members.')).encode("utf-8"))
                        
            members = api.getMembers(sorting='creationTime',startDate=startDate,endDate=endDate, pageNum=pageNum, pageSize=pageSize)
            memberList = []
            for member in members:
                member, extDict = self._get(member.id, member)
                memberList.append(getDict(member, extDict, moreDetails=True))
            result['response']['total'] = members.getTotal()
            result['response']['limit'] = len(memberList)
            result['response']['offset'] = (pageNum - 1)*pageSize
            result['response']['memberList'] = memberList

            return result
        except ex.InvalidArgumentException, iae:
            log.debug('get member for Export: Invalid Argument Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
            return ErrorCodes().asDict(c.errorCode, str(iae))
        except Exception, e:
            log.error('get member for Export Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.NO_SUCH_MEMBER
            return ErrorCodes().asDict(c.errorCode, str(e))    
    
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
            isMemberAdmin = u.isMemberAdmin(member)
            if id is not None:
                log.debug('get: id[%s]' % id)
                try:
                    id = long(id)
                    if id != member.id and not isMemberAdmin:
                        params_dict = {
                            'studentID': id,
                        }
                        resp = RemoteAPI.makeFlxGetCall( 'get/my/added/students', params_dict=params_dict)
                        log.debug('get: resp[%s]' % resp)
                        if resp['responseHeader']['status'] != 0 or not resp['response']['students']:
                            raise ex.UnauthorizedException((_(u'Only admin can view other members.')).encode("utf-8"))
                except ValueError:
                    if id != member.email and id != member.login and not isMemberAdmin:
                        raise ex.UnauthorizedException((_(u'Only admin can view other members.')).encode("utf-8"))
                member, extDict = self._get(id)
                memberDict = getDict(member, extDict, isMemberAdmin=isMemberAdmin)
                result['response'] = memberDict
                return result

            if not isMemberAdmin:
                raise ex.UnauthorizedException((_(u'Only admin can view other members.')).encode("utf-8"))
            idList = None
            if request.params.has_key('ids'):
                idList = request.params.get('ids','').split(',')
            if not fq:
                fq = []
            filterDict = {}
            for name, value in fq:
                if name in ['roleID']:
                    value = int(value)
                else:
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

            members = api.getMembers(idList=idList,
                                     sorting=sort,
                                     filterDict=filterDict,
                                     searchDict=searchDict,
                                     searchAll=searchAll,
                                     pageNum=pageNum,
                                     pageSize=pageSize)
            memberList = []
            for member in members:
                member, extDict = self._get(member.id, member)
                memberList.append(getDict(member, extDict))

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
    @d.checkAuth(request)
    @d.trace(log, ['member'])
    def getMemberTimezone(self, member):
        """
            Retrieves the member timezone setting
        """
        try:
            result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            if hasattr(member, 'timezone'):
                timezone = member.timezone
            else:
                timezone = api.getMemberTimezone(memberID=member.id)
            result['response']['timezone'] = timezone
            return result
        except Exception, e:
            log.error('get member timezone Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.RETRIEVAL_ERROR
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log, ['member'])
    def setMemberTimezone(self, member):
        """
            Sets the member timezone setting
        """
        try:
            result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            timezone = request.params.get('timezone','US/Pacific')
            if timezone not in pytz.common_timezones:
                raise Exception((_(u'Invalid timezone value')).encode("utf-8"))
            timezone = api.setMemberTimezone(memberID=member.id, timezone=timezone)

            ## Call refresh for flx
            log.debug("The user timezone was updated. Calling refresh ...")
            resp = RemoteAPI.makeFlxGetCall( 'refresh/my' )
            log.debug("Response from flx/refresh/my: %s" % str(resp))

            result['response']['timezone'] = timezone
            return result
        except Exception, e:
            log.error('set member timezone Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.RETRIEVAL_ERROR
            return ErrorCodes().asDict(c.errorCode, str(e))

    def _refreshNodes(self):
        """
           Call flx, assessment, and peerhelp to force the member sync.
        """
        refreshList = config.get('refresh_list')
        if refreshList:
            prefix = config.get('web_prefix_url')
            refreshNodes = refreshList.split(',')
            for refreshNode in refreshNodes:
                refreshNode = refreshNode.strip()
                apiUrl = '%s/%s/refresh/my' % (prefix, refreshNode)
                try:
                    status, data = self._call(apiUrl, method='GET', fromReq=True)
                    if status != ErrorCodes.OK:
                        log.debug('update_member_login: call[%s] failed[%s]' % (apiUrl, status))
                except Exception, e:
                    log.debug('update_member_login: call[%s] exception[%s]' % (apiUrl, str(e)))

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log, ['member'])
    def update_member_login(self, member):
        """
            Update members username/email with validating password
            required fields in params are password, new email/username
        """
        try:
            result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            
            password = request.params.get('password')
            if not password:
                raise ex.InvalidArgumentException((_(u'Missing password.')).encode("utf-8"))

            member, extDict = self._get(id, member)

            email = request.params.get('email', None)
            if email:
                email = email.strip()
            if not email:
                email = None
            elif self.validate(email=email) == "false":
                raise ex.InvalidEmailException((_(u'Invalid email[%s].' % email)).encode("utf-8"))

            if extDict.has_key('ck-12'):
                token = extDict['ck-12']['token']
                if token is not None and token != '':
                    if not _checkPassword(member, extDict['ck-12'], token, password):
                        raise ex.NotFoundException((_(u'Incorrect password.')).encode("utf-8"))
                newEntry = False
            else:
                #log.debug("extDict: %s" % extDict)
                typeID = g.getMemberAuthTypes()['ck-12']
                memberToken = generateDigest(password)
                api.createMemberExtData(memberID=member.id,
                                        authTypeID=typeID,
                                        token=memberToken,
                                        verified=False,
                                        externalID=email)
                newEntry = True
                    
            if email:
                if not newEntry:
                    for ext in member.ext:
                        log.debug('update_member_login: authTypeID[%s]' % ext.authTypeID)
                        log.debug('update_member_login: externalID[%s]' % ext.externalID)
                        if ext.authTypeID == 1:
                            if not ext.externalID or ext.externalID.lower() != email.lower():
                                ext.externalID = email
                                log.debug('update_member_login: updated externalID[%s]' % ext.externalID)
                            break
                if member.email.endswith('@ck12.org') and not email.endswith('@ck12.org'):
                    memberRoleDict, memberRoleNameDict = g.getMemberRoles()
                    iuID = memberRoleNameDict.get('internal-user')
                    mhr = api.getMemberHasRoles(memberID=member.id, roleID=iuID)
                    if mhr:
                        api.delete(mhr)
                elif email.endswith('@ck12.org') and not member.email.endswith('@ck12.org'):
                    memberRoleDict, memberRoleNameDict = g.getMemberRoles()
                    iuID = memberRoleNameDict.get('internal-user')
                    mhr = api.getMemberHasRoles(memberID=member.id, roleID=iuID)
                    if not mhr:
                        d = { 'memberID': member.id, 'roleID': iuID }
                        api.create(model.MemberHasRole, **d)
                member.email = email
                result['response']['email'] = email

            if request.params.has_key('login'):
                login = request.params.get('login')
                if login:
                    login = login.lower().strip()
                if not login:
                    raise ex.InvalidLoginException((_(u'Empty username.')).encode("utf-8"))

                if self.validateUsername(login) == "false":
                    raise ex.AlreadyExistsException((_(u'Username[%s] in use already.' % login)).encode("utf-8"))
                if self.validate(login=login) == "false":
                    raise ex.InvalidLoginException((_(u'Invalid username[%s].' % login)).encode("utf-8"))
                member.login = login
                result['response']['login'] = login

            member.updateTime = datetime.now()
            api.update(instance=member)
            member = member.cache(model.INVALIDATE, instance=member)

            log.debug("The user emailID/Username was updated....")
            
            #
            #  Update HubSpot & icontact.
            #
    
            marketing_tool = config.get('marketing_tool')
            if marketing_tool == 'icontact':
                self._newVocusContact(member, isExisting=True)
            elif marketing_tool == 'hubspot':
                self._newHubSpotContact(member)
            else:
                pass
            
            #
            #  Call flx, assessment, and peerhelp entities to force the member sync.
            #
            self._refreshNodes()

            return result
        except ex.InvalidArgumentException, iae:
            log.debug('update_member_login: missing password', exc_info=iae)
            c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
            return ErrorCodes().asDict(c.errorCode, str(iae))
        except ex.InvalidEmailException, iee:
            log.debug('update_member_login: invalid email[%s]' % str(iee), exc_info=iee)
            c.errorCode = ErrorCodes.INVALID_EMAIL
            return ErrorCodes().asDict(c.errorCode, str(iee))
        except ex.InvalidLoginException, ile:
            log.debug('update_member_login: invalid username[%s]' % str(ile))
            c.errorCode = ErrorCodes.VALIDATION_FAILED
            return ErrorCodes().asDict(c.errorCode, str(ile))
        except ex.AlreadyExistsException, aee:
            log.debug('update_member_login: user already exists[%s]' % str(aee))
            c.errorCode = ErrorCodes.MEMBER_ALREADY_EXISTS
            return ErrorCodes().asDict(c.errorCode, str(aee))
        except Exception, e:
            log.error('update_member_login: email/username Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.RETRIEVAL_ERROR
            return ErrorCodes().asDict(c.errorCode, str(e))
        
    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log, ['member'])
    def remove_member_account(self, member):
        """
            remove member account
        """
        try:
            result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            
            member, extDict = self._get(id, member)
            auth_type = request.params.get('auth_type')
            
            if extDict.has_key(auth_type):
                if len(extDict) == 1:
                    raise ex.NotFoundException((_(u"Atleast one account required to login,so please create ck-12 account to disconnect social account")).encode("utf-8"))
                
                auth_type_id = g.getMemberAuthTypes()[auth_type]
                api.remove_member_ext_data(memberID=member.id, 
                                           authTypeID=auth_type_id)
            else:
                raise ex.NotFoundException((_(u"Incorrect Member Auth Type '%s'")%(auth_type)).encode("utf-8"))

            member = member.cache(model.INVALIDATE, instance=member)
            
            log.debug("Account is disconnected....")
            user_dict = getDict(member, extDict)
            del user_dict['authTypes'][auth_type]
            result['response'] = user_dict
            return result
        except Exception, e:
            log.error('Remove account Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.RETRIEVAL_ERROR
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

    def _getMemberRoles(self):
        """
            Retrieves the member roles as a dictionary with identifiers as
            the keys and the role names as the values.
        """
        memberRoles = api.getMemberRoles()
        memberRoleDict = {}
        for memberRole in memberRoles:
            memberRoleDict[memberRole.id] = memberRole.name
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

    #
    #  Create related APIs.
    #
    def _createForm(self):
        memberRoles = api.getMemberRoles()
        c.memberRoleDict = {}
        for memberRole in memberRoles:
            c.memberRoleDict[str(memberRole.id)] = memberRole.name

        c.keys = sorted(c.memberRoleDict.keys(), cmp=h.num_compare)

        memberStates = api.getMemberStates()
        c.memberStatesDict = {}
        for memberState in memberStates:
            c.memberStatesDict[str(memberState.id)] = memberState.name
        c.stateKeys = sorted(c.memberStatesDict.keys(), cmp=h.num_compare)

        c.memberList = [
            'firstName',
            'lastName',
            'gender',
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
            #if isAdmin or lname in ('student', 'teacher', 'parent'):
            if isAdmin or lname in ('student', 'teacher'):
                roleDict[roleID] = name
                roleKeys.append(roleID)
        return roleDict, roleKeys

    def _getDefaultReturnTo(self):
        returnTo = config.get('web_prefix_url')
        if returnTo.endswith('/'):
            returnTo = '%smy/dashboard/' % returnTo
        else:
            returnTo = '%s/my/dashboard/' % returnTo
        return returnTo

    @d.jsonify()
    @d.trace(log)
    def checkEmailUsed(self):
        """
        Verifies if the provided email is already used.
        """
        used = False
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            email = request.params.get('email')
            if not email:
                raise Exception((_(u'No email given')).encode("utf-8"))

            try:
                member, extDict = self._get(email, None)
            except:
                member = None

            if member:
                used = True
            result['response'] = {}
            result['response']['used'] = used
        except Exception, e:
            log.error('checkEmailUsed: Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
            return ErrorCodes().asDict(c.errorCode, str(e))

        return result

    @d.jsonify()
    @d.trace(log)
    def checkLoginUsed(self):
        """
        Verifies if the provided login is already used.
        """
        used = False
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            login = request.params.get('login')
            if not login:
                raise Exception((_(u'No login given')).encode("utf-8"))

            try:
                member = api.getMemberByLogin(login)
            except:
                member = None

            if member:
                used = True
            result['response'] = {
                'used': used
            }
        except Exception as e:
            log.error('checkLoginUsed: Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
            return ErrorCodes().asDict(c.errorCode, str(e))

        return result

    @d.trace(log, ['role', 'join'])
    def signupForm(self, role=None, join='false'):
        from auth.forms.member import SignupForm, SignupStudentForm, SignupTeacherForm
        from auth.lib.ck12 import messages

        returnTo = request.params.get('returnTo')
        if not returnTo:
            returnTo = self._getDefaultReturnTo()
        c.returnTo = returnTo
        try:
            h.validateDomain(c.returnTo)
        except h.ForbiddenError:
            c.returnTo = self._getDefaultReturnTo()
            return render('%s/errors/403.html' % self.prefix)
        c.requestor = request.params.get('requestor', None)

        appCode = request.params.get('appCode')
        if appCode:
            if appCode not in config.get('ck12_app_codes', '').split(','):
                raise Exception("Invalid App Code")
            c.appCode = appCode

        member = u.getCurrentUser(request, anonymousOkay=False)
        if member:
            c.member = member.infoDict()
            return redirect(returnTo)

        if not role:
            role = 'student'
        c.role = role
        if not role:
            c.form = SignupForm()
        elif role == 'student':
            c.form = SignupStudentForm()
        elif role == 'teacher':
            c.form = SignupTeacherForm()
        else:
            raise Exception((_(u'Unknow role %(role)s.') % {'role':role}).encode("utf-8"))

        memberRoleDict, memberRoleNameDict = g.getMemberRoles()
        c.form.roleDict, c.form.roleKeys = self._setupMemberRoles(isAdmin=False)
        c.messages = messages
        c.form.roleID = memberRoleNameDict.get(role, 'Student')
        c.hide_signup_link = True
        if join.lower() == 'true':
            if role == 'student':
                return render('/%s/member/joinStudent.html' % self.prefix)
            if role == 'teacher':
                return render('/%s/member/joinTeacher.html' % self.prefix)
        else:
            if role == 'student':
                return render('/%s/member/signupStudent.html' % self.prefix)
            if role == 'teacher':
                return render('/%s/member/signupTeacher.html' % self.prefix)

        return render('/%s/member/signup.html' % self.prefix)

    @d.trace(log)
    def underageAlreadyExists(self):
        try:
            if not request.params.has_key('t'):
                raise Exception((_(u'Invalid request')).encode("utf-8"))

            email, id, parentEmail, expire =  decryptUnderAgeVerifyEmailToken(request.params.get('t').strip(), checkExpiration=False)
            if not id and not email and not parentEmail:
                raise Exception((_(u'Invalid request')).encode("utf-8"))
            
            member, extDict = self._get(id)
            c.token = request.params.get('t').strip()
            c.member = member
            if request.headers.get('cookie') is None :
                raise Exception((_(u'Cookies are disabled on your browser.')).encode("utf-8"))

            from base64 import standard_b64encode
            encodedData = json.dumps({'member_email': member.email}, ensure_ascii=False, default=h.toJson).encode('utf-8')
            encodedData = urllib.quote(standard_b64encode(encodedData))
            c.encodedData = encodedData

        except Exception, e:
            c.form_errors = e
            log.error('Account Already Exists Exception[%s]' % str(e))
            c.form_success = None
        
        return render('%s/member/underageAlreadyExists.html' % self.prefix)

    def encryptData(self, **kwargs):
        """
            Generates an encrypted token based on the data given.
        """
        expire = kwargs.get('expire', 30)
        kwargs['expire'] = int(time.time()) + int(expire)*60*60*24
        data = json.dumps(kwargs)
        if len(data) % 8:
            # data block length must be multiple of eight
            data += 'X' * (8 - (len(data) % 8)) 
        return b16encode(Blowfish.new(config.get('member.password.reset.secret')).encrypt(data))

    def decryptData(self, token, checkExpiration=True):
        """
            Decrypts a token.
        """
        try:
            jsonStr = Blowfish.new(config.get('member.password.reset.secret')).decrypt(b16decode(token)).rstrip('X')
            dataDict = json.loads(jsonStr)
            expire = int(dataDict.get('expire'))
            if checkExpiration and expire < time.time():
                raise Exception((_(u'Time duration for this request has expired.')).encode("utf-8"))
            return dataDict
        except Exception, e:
            log.exception('invalid password reset token Exception[%s]' % str(e))
            raise e

    def _sendUnderageSignupRequestEmail(self, email, name, birthday):
        expire = request.params.get('expire', 7)
        token = self.encryptData(id=0, email=email, expire=expire, name=name, birthday=birthday)
        firstName = name.split(' ', 1)[0]
        signupUrl = url(controller='member', action='signupUnderage', qualified=True, protocol='https')
        rurl = '%s?t=%s' % (signupUrl, token)
        log.debug('_sendUnderageSignupRequestEmail: rurl[%s]' % rurl)
        signupTeacherUrl = '%s/signup/teacher?returnTo=%s' % (config.get('auth_prefix_url'), urllib.quote(rurl))
        eventData = {
            'rurl': rurl,
            'signupTeacherUrl': signupTeacherUrl,
            'name': name,
            'firstName': firstName,
        }
        data = json.dumps(eventData, default=h.toJson)

        tx = utils.transaction(self.getFuncName())
        with tx as session:
            #
            #  Create UnderageEmailToken in database.
            #
            kwargs = {
                'parentEmail': email,
                'token': token
            }
            api._createUnderageEmailToken(session, **kwargs)
            #
            #  Send email.
            #
            self._sendEmail(0, email, 'SIGNUP_UNDERAGE', data)

    @d.trace(log)
    def underageSignupRequest(self):
        from auth.forms.member import UnderageRequestForm
        from auth.lib.ck12 import messages

        jsonify = request.params.get('jsonify', True)
        if jsonify:
            name = request.params.get('name')
            birthday = request.params.get('birthday')
            email = request.params.get('email')
            #log.debug('underageSignupRequest: name[%s] birthday[%s] email[%s]' % (name, birthday, email))
            try:
                result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
                self._sendUnderageSignupRequestEmail(email, name, birthday)
            except Exception, en:
                log.error('underageSignupRequest: Unable to send email[%s]' % en, exc_info=en)
                c.errorCode = ErrorCodes.CANNOT_SEND_EMAIL
                result = ErrorCodes().asDict(c.errorCode, str(en))
            return json.dumps(result)
        else:
            c.form = UnderageRequestForm()
            c.messages = messages
            #log.debug('underageSignupRequest: request.params[%s]' % request.params)
            if request.method == 'POST':
                import formencode

                toRedirect = False
                try:
                    formResult = c.form.to_python(request.params)
                    name = formResult['name']
                    birthday = formResult['birthday']
                    if birthday:
                        birthday = request.params.get('birthday')
                    email = formResult['email']
                    #log.debug('underageSignupRequest: name[%s] birthday[%s] email[%s]' % (name, birthday, email))
                    #
                    #  Send email.
                    #
                    self._sendUnderageSignupRequestEmail(email, name, birthday)
                    toRedirect = True
                except formencode.validators.Invalid, error:
                    c.form = error.value
                    c.form_errors = error.error_dict or {}
                    log.info('underageSignupRequest: error[%s]' % error)
                except Exception, e:
                    c.form_error = e
                    log.info('underageSignupRequest: e[%s]' % e)

                if toRedirect:
                    site = config.get('web_prefix_url', 'http://www.ck12.org')
                    return redirect(site, 302)

            return render('/%s/member/requestUnderage.html' % self.prefix)

    @d.checkAuth(request, True, True)
    @d.trace(log, ['member'])
    def signupUnderage(self, member):
        from auth.forms.member import SignupUnderageForm
        from auth.lib.ck12 import messages

        c.email = member.email
        c.messages = messages
        c.form = SignupUnderageForm()
        if request.method == 'GET':
            t = request.params.get('t')
            log.debug('signupUnderage: t[%s]' % t)
            emailMismatch = False
            hasCreated = False
            hasExpired = True
            underageEmailToken = api.getUnderageEmailToken(parentEmail=member.email, token=t)
            log.debug('signupUnderage: underageEmailToken[%s]' % underageEmailToken)
            if not underageEmailToken:
                underageEmailTokens = api.getUnderageEmailToken(token=t)
                if underageEmailTokens:
                    emailMismatch = True
                    c.email = underageEmailTokens[0].parentEmail
            if not emailMismatch:
                if underageEmailToken:
                    if underageEmailToken.studentID:
                        hasCreated = True
                    else:
                        c.t = t
                        dataDict = self.decryptData(token=t, checkExpiration=False)
                        log.debug('signupUnderage: dataDict%s' % dataDict)
                        expire = int(dataDict.get('expire', 0))
                        if expire >= time.time():
                            hasExpired = False
            if emailMismatch or hasCreated or hasExpired:
                from auth.forms.error import ErrorForm

                c.form = ErrorForm()
                if emailMismatch:
                    c.status = ErrorCodes.UNAUTHORIZED_OPERATION
                    c.message = (_(u'Requesting email, %(e1)s is different from the email, %(e2)s, of the logged in member.') % {'e1':c.email, 'e2':member.email}).encode("utf-8")
                elif hasCreated:
                    c.status = ErrorCodes.MEMBER_ALREADY_EXISTS
                    c.message = _(u'The account of this request has already been created.').encode("utf-8")
                else:
                    c.status = ErrorCodes.UNAUTHORIZED_OPERATION
                    c.message = _(u'This request has been expired.').encode("utf-8")
                log.debug('signupUnderage: %s' % c.message)
                c.returnTo = request.params.get('returnTo', self._getDefaultReturnTo())
                try:
                    h.validateDomain(c.returnTo)
                except h.ForbiddenError:
                    c.returnTo = self._getDefaultReturnTo()
                return render('/%s/common/error.html' % self.prefix)

            c.email = dataDict.get('email').lower()
            c.name = dataDict.get('name')
            c.birthday = dataDict.get('birthday')
            #log.debug('signupUnderage: email[%s] name[%s] birthday[%s]' % (c.email, c.name, c.birthday))
            if c.email != member.email:
                from auth.forms.error import ErrorForm

                c.form = ErrorForm()
                c.status = ErrorCodes.UNAUTHORIZED_OPERATION
                c.message = (_(u'Requesting email, %(e1)s is different from the email, %(e2)s, of the logged in member.') % {'e1':c.email, 'e2':member.email}).encode("utf-8")
                log.debug('signupUnderage: %s' % c.message)
                c.returnTo = request.params.get('returnTo', self._getDefaultReturnTo())
                try:
                    h.validateDomain(c.returnTo)
                except h.ForbiddenError:
                    c.returnTo = self._getDefaultReturnTo()
                return render('/%s/common/error.html' % self.prefix)
        else:
            jsonify = request.params.get('jsonify', True)
            if jsonify:
                
                import formencode
                try:
                    result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
                    formResult = c.form.to_python(request.params)
                    login = formResult['username']
                    password = formResult['password']
    
                    t = request.params.get('t', None)
                    if not t:
                        from auth.forms.error import ErrorForm
    
                        c.form = ErrorForm()
                        c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
                        if not t:
                            c.message = _(u'Missing token.').encode("utf-8")
                        log.debug('signupUnderage: missing token.')
                        c.returnTo = request.params.get('returnTo', config.get('web_prefix_url'))
                        try:
                            h.validateDomain(c.returnTo)
                        except h.ForbiddenError:
                            c.returnTo = self._getDefaultReturnTo()
                        return render('/%s/common/error.html' % self.prefix)

                    underageEmailToken = api.getUnderageEmailToken(parentEmail=member.email, token=t)
                    if underageEmailToken and underageEmailToken.studentID:
                        c.status = ErrorCodes.MEMBER_ALREADY_EXISTS
                        c.message = _(u'The account of this request has already been created.').encode("utf-8")
                        c.returnTo = request.params.get('returnTo', config.get('web_prefix_url'))
                        try:
                            h.validateDomain(c.returnTo)
                        except h.ForbiddenError:
                            c.returnTo = self._getDefaultReturnTo()
                        return render('/%s/common/error.html' % self.prefix)
    
                    dataDict = self.decryptData(request.params['t'], checkExpiration=False)
                    name = dataDict.get('name')
                    birthday = dataDict.get('birthday')
                    #log.debug('sigunpUnderage: name[%s] birthday[%s] login[%s] password[%s]' % (name, birthday, login, password))
                    #
                    #  Create underage member.
                    #
                    params = {
                        'authType': 'ck-12',
                        'name': name,
                        'login': login,
                        'token': password,
                        'birthday': birthday,
                        'roleID': 7,
                        't': t,
                    }
                    apiUrl = url(controller='member',
                                 action='createU13',
                                 qualified=True,
                                 protocol='https',
                                 **params)
                    status, createU13_result = self._call(apiUrl, method='POST', fromReq=True)
                    log.info("createU13_result---->%s"%createU13_result)
                    if status != ErrorCodes.OK:
                        log.error('loginForm: login failed[%s]' % result)
                        result['responseHeader']['status'] = status
                        result['response'] = createU13_result
                        return json.dumps(result)
                    
                    result['response'] = params
    
                except formencode.validators.Invalid, error:
                    c.form = error.value
                    c.form_errors = error.error_dict or {}
                    log.info('signupUnderage: error[%s]' % error)
                except Exception, e:
                    c.form_error = e
                    result = ErrorCodes().asDict(c.form_error, str(e))
                    log.info('signupUnderage: e[%s]' % e)
                    
                return json.dumps(result)
            
            else:
                import formencode
                toRedirect = False
                try:
                    formResult = c.form.to_python(request.params)
                    login = formResult['username']
                    password = formResult['password']
    
                    t = request.params.get('t', None)
                    if not t:
                        from auth.forms.error import ErrorForm
    
                        c.form = ErrorForm()
                        c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
                        if not t:
                            c.message = _(u'Missing token.').encode("utf-8")
                        log.debug('signupUnderage: missing token.')
                        c.returnTo = request.params.get('returnTo', config.get('web_prefix_url'))
                        try:
                            h.validateDomain(c.returnTo)
                        except h.ForbiddenError:
                            c.returnTo = self._getDefaultReturnTo()
                        return render('/%s/common/error.html' % self.prefix)

                    underageEmailToken = api.getUnderageEmailToken(parentEmail=member.email, token=t)
                    if underageEmailToken and underageEmailToken.studentID:
                        c.status = ErrorCodes.MEMBER_ALREADY_EXISTS
                        c.message = _(u'The account of this request has already been created.').encode("utf-8")
                        c.returnTo = request.params.get('returnTo', config.get('web_prefix_url'))
                        try:
                            h.validateDomain(c.returnTo)
                        except h.ForbiddenError:
                            c.returnTo = self._getDefaultReturnTo()
                        return render('/%s/common/error.html' % self.prefix)

                    dataDict = self.decryptData(request.params['t'], checkExpiration=False)
                    name = dataDict.get('name')
                    birthday = dataDict.get('birthday')
                    #log.debug('sigunpUnderage: name[%s] birthday[%s] login[%s] password[%s]' % (name, birthday, login, password))
                    #
                    #  Create underage member.
                    #
                    params = {
                        'authType': 'ck-12',
                        'name': name,
                        'login': login,
                        'token': password,
                        'birthday': birthday,
                        'roleID': 7,
                        't': t,
                    }
                    apiUrl = url(controller='member',
                                 action='createU13',
                                 qualified=True,
                                 protocol='https',
                                 **params)
                    status, result = self._call(apiUrl, method='POST', fromReq=True)
                    if status != ErrorCodes.OK:
                        log.error('loginForm: login failed[%s]' % result)
                        c.status = ErrorCodes().getName(status)
                        c.message = result.get('message')
                        return render('%s/common/error.html' % self.prefix)
    
                    toRedirect = True
                except formencode.validators.Invalid, error:
                    c.form = error.value
                    c.form_errors = error.error_dict or {}
                    log.info('signupUnderage: error[%s]' % error)
                except Exception, e:
                    c.form_error = e
                    log.info('signupUnderage: e[%s]' % e)
    
                if toRedirect:
                    site = config.get('web_prefix_url', 'http://www.ck12.org')
                    return redirect(site, 302)
        return render('/%s/member/signupUnderage.html' % self.prefix)

    @d.trace(log)
    def underageSignup(self):
        try:
            success = False
            c.encodedData = request.params.get('underageinfo')
            if request.method == 'POST':
                parent_email = request.params.get('parent_email', None)
                self._update_underage_information(parent_email = parent_email)
                success = True
        except Exception, e:
            c.form_errors = e
            log.error('Under Age SignUp Exception[%s]' % str(e))
        if success:
            api_url = url(controller='member', action='underageSignupComplete', qualified=True, protocol='https')
            return redirect(api_url)
        return render('/%s/member/underageSignup.html' % self.prefix)
    
        
    @d.trace(log)
    def signupCompleteForm(self):
        from auth.forms.member import SignupForm, SignupStudentForm, SignupTeacherForm
        from auth.lib.ck12 import messages

        memberRoleDict, memberRoleNameDict = g.getMemberRoles()
        fromSignupForm = request.params.get('fromSignupForm', False)
        email = request.params.get('email')
        if not (fromSignupForm):
            c.success = True
            member = u.getCurrentUser(request, anonymousOkay=False)
            c.returnTo = request.params.get('returnTo', self._getDefaultReturnTo())
            h.validateDomain(c.returnTo)
            c.requestor = request.params.get('requestor', None)
            c.member = member
            c.user = member
            # show signup complete only once and only if user object is present
            # we show signup complete only once, to prevent bots from hitting signup complete
            # and inflating our analytics
            if c.member and 'new_signup' in pylons_session:
                del pylons_session['new_signup'] 
                pylons_session.save()
                return render('/%s/member/signupComplete.html' % self.prefix)
            elif c.member:
                return redirect(c.returnTo)
            else:
                return redirect(url('signin',returnTo=c.returnTo) )

        log.debug('signupCompleteForm: params[%s]' % request.params)
        role = request.params.get('role', None)
        if request.method == "GET":
            import formencode

            if not role:
                form = SignupForm()
            elif role == 'student':
                form = SignupStudentForm()
            elif role == 'teacher':
                form = SignupTeacherForm()
            else:
                raise Exception((_(u'Unknow role %(role)s.') % {'role':role}).encode("utf-8"))
            c.messages = messages
            toRedirect = False
            try:
                c.form = form
                #Do now allow to register if cookies are disabled on client browser as
                # auto-login after creating account cause internal server error.
                if request.headers.get('cookie') is None :
                    raise Exception((_(u'Cookies are disabled on your browser.')).encode("utf-8"))

                form.to_python(request.params)
                toRedirect = True
            except formencode.validators.Invalid, error:
                c.form_errors = error.error_dict or {}
            except Exception, e:
                c.form_error = e

            if not toRedirect:
                c.form.roleDict, c.form.roleKeys = self._setupMemberRoles(isAdmin=False)
                c.form.roleID = memberRoleNameDict.get(role, 'Student')
                c.returnTo = request.params.get('returnTo', self._getDefaultReturnTo())
                try:
                    h.validateDomain(c.returnTo)
                except h.ForbiddenError:
                    c.returnTo = config.get('web_prefix_url')
                    return render('%s/errors/403.html' % self.prefix)
                if role == 'student':
                    return render('/%s/member/signupStudent.html' % self.prefix)
                if role == 'teacher':
                    return render('/%s/member/signupTeacher.html' % self.prefix)

                return render('/%s/member/signup.html' % self.prefix)
        

        newMember = False
        try:
            member, extDict = self._get(email, None)
        except:
            member = None

        if role != 'teacher' and member and member.stateID == 3:
            underageMemberParent = api.getUnderageMemberParent(memberID=member.id)
            log.debug('signupCompleteForm: underageMemberParent[%s]' % underageMemberParent)
            if underageMemberParent:
                c.token = underageMemberParent.token
                c.member = member
                return redirect('%s/member/underageAlreadyExists?t=%s' % (self.prefix,c.token))
            else:
                from base64 import standard_b64encode
                encodedData = json.dumps({'member_email':member.email}, ensure_ascii=False, default=h.toJson).encode('utf-8')
                encodedData = urllib.quote(standard_b64encode(encodedData))

                return redirect('%s/member/underageSignup?underageinfo=%s' % (self.prefix, encodedData))

        if not member:
            try:
                tx = utils.transaction(self.getFuncName())
                with tx as session:
                    member = self._create(session, role=role)
                    #log.debug('signupCompleteForm: member[%s]' % member)
                c.success = member is not None
                newMember = True
            except ex.AlreadyExistsException as aee:
                log.debug('signupCompleteForm: member already exists[%s]' % e, exc_info=e)
                c.status = ErrorCodes.MEMBER_ALREADY_EXISTS
                c.message = str(aee)
                c.returnTo = self._getDefaultReturnTo()
                log.debug('signupCompleteForm: cannot create member aee[%s]' % aee)
                return render('%s/common/error.html' % self.prefix)
            except ex.InvalidEmailException as iee:
                log.debug('signupCompleteForm: invalid email[%s]' % str(iee))
                c.status = ErrorCodes.INVALID_EMAIL
                c.message = str(iee)
                c.returnTo = self._getDefaultReturnTo()
                return render('%s/common/error.html' % self.prefix)
            except ex.MissingArgumentException as mae:
                log.debug('signupCompleteForm: missing argument[%s]' % str(mae))
                c.status = ErrorCodes.REQUIRED_PARAMS_MISSING
                c.message = str(mae)
                c.returnTo = self._getDefaultReturnTo()
                return render('%s/common/error.html' % self.prefix)
            except Exception as e:
                log.debug('signupCompleteForm: Unable to create member[%s]' % e, exc_info=e)
                c.status = ErrorCodes.CANNOT_CREATE_MEMBER
                c.message = str(e)
                return render('%s/common/error.html' % self.prefix)

            if role != 'teacher' and self._validateUnderAge():
                if c.success:
                    memberStateDict, memberStateNameDict = g.getMemberStates()
                    member.stateID = memberStateNameDict['deactivated']
                    member.updateTime = datetime.now()
                    roleID = memberRoleNameDict.get('student')
                    api.updateMember(member, roleID=roleID)
                    api.update(instance=member)
                    member = member.cache(model.INVALIDATE, instance=member)
                    from base64 import standard_b64encode
                    encodedData = json.dumps({'member_email':member.email}, ensure_ascii=False, default=h.toJson).encode('utf-8')
                    encodedData = urllib.quote(standard_b64encode(encodedData))
    
                    return redirect('%s/member/underageSignup?underageinfo=%s' % (self.prefix, encodedData))

        else:
            typeID = g.getMemberAuthTypes()['ck-12']
            found = False
            for ext in member.ext:
                if ext.authTypeID == typeID:
                    found = True
            if not found:
                token = generateDigest(request.params.get('password', request.params.get('token')))
                memberID = member.id
                api.createMemberExtData(memberID=memberID,
                                        authTypeID=typeID,
                                        token=token,
                                        externalID=member.email,
                                        verified=True)
            c.success = True

        c.user = member.infoDict() if member is not None else None
        authType = 'ck-12'
        login = email
        if type(login) == unicode:
            login = login.encode('utf8')
        #log.debug('signupCompleteForm: login[%s]' % login)
        login = urllib.quote(login)
        token = request.params.get('password', request.params.get('token'))
        if type(token) == unicode:
            token = token.encode('utf8')
        else:
            token = urllib.quote(token)
        params = {
            'authType': authType,
            'login': login,
            'token': token,
            #'returnTo': urllib.quote(request.url),
        }
        apiUrl = url(controller='member',
                     action='login',
                     qualified=True,
                     protocol='https')
        status, result = self._call(apiUrl, method='POST', params=params, fromReq=True)
        if status != ErrorCodes.OK:
            log.debug('signupCompleteForm: login failed[%s]' % result)
            c.status = ErrorCodes().getName(status)
            c.message = result.get('message')
            c.returnTo = request.params.get('returnTo', self._getDefaultReturnTo())
            try:
                h.validateDomain(c.returnTo)
            except h.ForbiddenError:
                c.returnTo = self._getDefaultReturnTo()
            c.success = False
            return render('%s/common/error.html' % self.prefix)

        if not member:
            member = api.getMemberByEmail(email=email)

        if member:
            u.saveSession(request, str(member.id), email, authType, timeout=0)
        """
        if newMember or newCK12Entry:
            self._sendVerificationEmail(member)
        """

        c.member = member
        c.user = member
        c.returnTo = request.params.get('returnTo', self._getDefaultReturnTo())
        try:
            h.validateDomain(c.returnTo)
        except h.ForbiddenError:
            c.returnTo = self._getDefaultReturnTo()
            return render('%s/errors/403.html' % self.prefix)
        if newMember or ( result.has_key('newMember') and result['newMember'] == True ):
            #Mark this session as new signup, so that we can use it to track conversion
            pylons_session['new_signup'] = True
            pylons_session.save()
            if member:
                self._set_newsletter_notifications({ 'id': member.id })
            return render('/%s/member/signupComplete.html' % self.prefix)

        if member:
            return redirect(c.returnTo)
        else:
            return redirect(url('signin', returnTo=c.returnTo) )

    def _sendVerificationEmail(self, member):
        verifiedUrl = url(controller='member', action='verifiedEmail', qualified=True, protocol='https')
        expire = request.params.get('expire', 2)
        token = encryptPasswordResetToken(member.id, member.email, expire)
        rurl = '%s?t=%s' % (verifiedUrl, token)
        eventData = {
            'rurl': rurl,
            'firstName': member.givenName,
            'lastName': member.surname,
        }
        data = json.dumps(eventData, default=h.toJson)
        self._sendEmail(member.id, member.email, 'VERIFY_MEMBER', data)

    @d.jsonify()
    @d.checkAuth(request, False, False)
    @d.trace(log, ['member'])
    def verifyEmail(self, member):

        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        if member.emailVerified:
            c.errorCode = ErrorCodes.MEMBER_EMAIL_ALREADY_VERIFIED
            return ErrorCodes().asDict(c.errorCode, (_(u'Email, %(email)s, has already been verified.') % {'email': member.email}).encode('utf-8'))

        try:
            self._sendVerificationEmail(member)
            return result
        except Exception, en:
            log.error('verifyEmail: Unable to send email[%s]' % en, exc_info=en)
            c.errorCode = ErrorCodes.CANNOT_SEND_EMAIL
            return ErrorCodes().asDict(c.errorCode, str(en))

    @d.trace(log)
    def verifiedEmail(self):
        try:
            email, id, expire = decryptPasswordResetToken(request.params['t'], checkExpiration=False)
            member, extDict = getMember(id)
            if member.email.lower() != email.lower():
                raise Exception((_(u'Email not matched for %(email)s, should have been %(member.email)s')  % {"email":email,"member.email": member.email}).encode("utf-8"))

            extData = extDict.get('ck-12')
            c.isNewMember = 'false'

            import time

            if expire < time.time():
                raise Exception((_(u'Time duration for this request has expired.  Please re-start the process by signing in again.')).encode("utf-8"))

            tx = utils.transaction(self.getFuncName())
            with tx as session:
                member.emailVerified = True
                for ext in member.ext:
                    if extData and ext.authTypeID == extData['authTypeID']:
                        ext.verified = True
                        c.isNewMember = 'true'
                        api._update(session, instance=ext)
                        break
                member = member.cache(model.INVALIDATE, instance=member)
                api._update(session, instance=member)

            from auth.forms.member import EmailVerifiedForm
            from auth.lib.ck12 import messages

            c.form = EmailVerifiedForm()
            c.site = config.get('web_prefix_url', 'http://www.ck12.org')
            c.redirect = '%s?memberVerified=true&email=%s' % (c.site, urllib.quote(member.email))
            c.email = member.email
            c.messages = messages
            log.debug('verifiedEmail: c.redirect[%s]' % c.redirect)
            #log.debug('verifiedEmail: c.email[%s]' % c.email)
        except Exception, e:
            log.error('verifiedEmail: Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.CANNOT_UPDATE_MEMBER
            c.form = e
            c.form_errors = e

        return render('%s/authenticate/emailVerified.html' % self.prefix)

    def _create(self, session, role=None):
        """
            Creates a new member.
        """
        login = request.params.get('login', None)
        if login:
            login = login.strip().lower()
            if not login:
                c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
                raise ex.MissingArgumentException((_(u'Login is empty')).encode("utf-8"))
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
        if not givenName and request.params.has_key('name'):
            name = request.params.get('name').split(' ', 1)
            givenName = name[0]
            surname = name[1] if name.__len__() > 1 else ''
        gender = request.params.get('gender', None)
        if gender == '':
            gender = None
        suffix = request.params.get('suffix', None)
        title = request.params.get('title', None)
        if request.params.has_key('email'):
            email = request.params['email']
            if email is None or email == '':
                c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
                raise ex.MissingArgumentException((_(u'Email is required')).encode("utf-8"))
            emailIsFake = False
        elif hasattr(request, 'fake_email'):
            email = request.fake_email
            if email is None or email == '':
                c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
                raise ex.MissingArgumentException((_(u'Email is required')).encode("utf-8"))
            emailIsFake = True
        else:
            c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
            raise ex.MissingArgumentException((_(u'Email is required')).encode("utf-8"))
        email = email.strip().lower()
        mEmail = api._getMemberByEmail(session, email=email)
        if mEmail:
            raise ex.AlreadyExistsException((_(u'Email is already registered.')).encode("utf-8"))
        imageURL = request.params.get('imageURL', None)

        if request.params.has_key('authType'):
            authType = request.params['authType'].lower()
        else:
            authType = 'ck-12'
        authTypeID = g.getMemberAuthTypes(session=session)[authType]
        password = request.params.get('password', request.params.get('token'))
        if not password:
            c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
            raise ex.MissingArgumentException((_(u'Password is required')).encode("utf-8"))
        if authType == 'ck-12':
            if len(password) < 6:
                c.errorCode = ErrorCodes.INVALID_ARGUMENT
                raise ex.InvalidArgumentException((_(u'Password needs to be at least 6 characters')).encode("utf-8"))
        token = generateDigest(password)
        if authTypeID == 5:
            emailVerified = False
        else:
            emailVerified = True

        ## Default active
        stateID = 2
        if request.params.has_key('stateID'):
            stateID = int(request.params['stateID'])
        elif request.params.has_key('state'):
            state = request.params['state'].lower()
            memberStateDict, memberStateNameDict = g.getAuthMemberStates(session=session)
            stateID = memberStateNameDict[state]

        roleID = None
        if not role:
            role = request.params.get('role', None)
            if not role:
                role = 'student' ## Default to student (studyNow! does not send a role)
        if role:
            memberRoleDict, memberRoleNameDict = g.getAuthMemberRoles(session=session)
            if role == 'admin' and not email.endswith('@ck12.org'):
                #
                #  Do not allow non-CK12 users to be admin during creation time.
                #
                role = 'member'
            roleID = memberRoleNameDict.get(role, None)
            if roleID:
                role = api._getMemberRole(session, roleID=roleID)
                if role.is_admin_role:
                    raise ex.UnauthorizedException((_(u'Not allowed to create member with admin role.')).encode("utf-8"))

        if not roleID:
            roleID = request.params.get('roleID', None)
            if not roleID:
                raise ex.MissingArgumentException((_(u'Role is required')).encode("utf-8"))

        birthday = None
        if request.params.has_key('birthday'):
            birthday = request.params['birthday']
            if birthday:
                birthday = birthdayStr(birthday) # datetime.strptime(birthday.strip().__format__('%m/%d/%Y'), '%m/%d/%Y')

        externalID = request.params.get('externalID')
        if not externalID:
            externalID = email
        else:
            externalID = externalID.strip()

        if not givenName:
            givenName = re.sub('@.*', '', email)
        member = api._createMember(session,
                                   givenName=givenName,
                                   surname=surname,
                                   gender=gender,
                                   suffix=suffix,
                                   title=title,
                                   login=login,
                                   authTypeID=authTypeID,
                                   token=token,
                                   email=email,
                                   emailIsFake=emailIsFake,
                                   externalID=externalID,
                                   stateID=stateID,
                                   roleID=roleID,
                                   groupID=1,
                                   emailVerified=emailVerified,
                                   birthday=birthday,
                                   imageURL=imageURL)
        #
        # create records in PartnerSchool, PartnerSchoolDistrict, PartnerSchoolHasMember
        #
        partnerMemberID = request.params.get('partnerMemberID')
        partnerSchoolID = request.params.get('partnerSchoolID')
        partnerDistrictID = request.params.get('partnerDistrictID')
        partnerSysID = request.params.get('partnerSysID')
        if partnerMemberID and partnerSchoolID and partnerDistrictID:
            # PartnerSchools
            partnerSchool = api._getPartnerSchool(session, authTypeID, partnerSchoolID)
            if not partnerSchool:
                ps_data = {
                            'siteID': authTypeID,
                            'partnerSchoolID': partnerSchoolID,
                            'partnerDistrictID': partnerDistrictID,
                            'schoolID':None
                            }
                api._createPartnerSchool(session, **ps_data)
            #PartnerSchoolDistricts
            partnerSchoolDistrict = api._getPartnerSchoolDistrict(session, authTypeID, partnerDistrictID)
            if not partnerSchoolDistrict:
                psd_data = {
                            'siteID': authTypeID,
                            'partnerDistrictID': partnerDistrictID,
                            'districtID':None
                            }
                api._createPartnerSchoolDistrict(session, **psd_data)
            #PartnerSchoolHasMembers
            partnerSchoolHasMember = api._getPartnerSchoolHasMember(session, member.id, roleID, authTypeID, partnerSchoolID)
            if not partnerSchoolHasMember:
                pshm_data = {
                                'memberID': member.id,
                                'roleID': roleID,
                                'siteID': authTypeID,
                                'partnerSchoolID': partnerSchoolID,
                                'partnerMemberID': partnerMemberID,
                                'partnerSysID': partnerSysID,
                            }
                api._createPartnerSchoolHasMember(session, **pshm_data)
            
        if request.params.has_key('countryCode'):
            countryID = None
            address = None
            countryNameList = api._getCountries(session)
            for countryData in countryNameList:
                if countryData.code2Letter == request.params.get('countryCode'):
                    countryID = countryData.id
                    break
            
            city = request.params.get('city')
            state = request.params.get('state')
            zip = request.params.get('zip')
            
            if request.params.has_key('zip'):
                if not state or not city:
                    zipCodeList = api._getZipCodeInfo(session, zip=zip)
                    for zipCodeData in zipCodeList:
                        state = zipCodeData.state
                        city = zipCodeData.city
                        break
            
            if request.params.get('countryCode') == 'US' and city and state:
                address = api._newUSAddress(session,city=city,
                                            state=state, zip=zip)
                session.add(address)
            if countryID and address:
                session.flush()
                location = api._newMemberLocation(session, memberID=member.id,
                                                    countryID=countryID, addressID=address.id)
                session.add(location)
                
                city = request.params.get('city')
                state = request.params.get('state')
                zip = request.params.get('zip')
                
                if request.params.has_key('zip'):
                    if not state or not city:
                        zipCodeList = api._getZipCodeInfo(session, zip=zip)
                        for zipCodeData in zipCodeList:
                            state = zipCodeData.state
                            city = zipCodeData.city
                            break
                
                if request.params.get('countryCode') == 'US' and city and state:
                    address = api._newUSAddress(session,city=city,
                                                state=state, zip=zip)
                    session.add(address)
                if countryID and address:
                    session.flush()
                    location = api._newMemberLocation(session, memberID=member.id,
                                                      countryID=countryID, addressID=address.id)
                    session.add(location)
                    
                if address and roleID and request.params.has_key('gradeIDs'):
                    member.isProfileUpdated = 1
                    session.add(member)
        session.flush()
        #
        #  create HubSpot & icontact.
        #
        if not emailIsFake:
            #
            #  create HubSpot & icontact.
            #
            newNewsletter = request.params.get('newNewsletter', None)
            if newNewsletter is None:
                optout = False
                status = 'normal'
            else:
                optout = True if newNewsletter.lower() in ['yes', 'true'] else False
                status = 'donotcontact' if newNewsletter.lower() in ['yes', 'true'] else 'normal'
            
            marketing_tool = config.get('marketing_tool')
            if marketing_tool == 'icontact':
                self._newVocusContact(member, status=status, session=session)
            elif marketing_tool == 'hubspot':
                self._newHubSpotContact(member, optout=optout)
            else:
                pass
        
            self._sendWelcomeEmail(None, member, session=session)

        return member
    
    @d.jsonify()
    @d.checkAuth(request, False, False)
    @d.trace(log, ['member'])
    def setMarketingToolNotification(self, member):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            status = request.params.get('status', 'normal')
            optout = request.params.get('optout', False)
            
            marketing_tool = config.get('marketing_tool')
            if marketing_tool == 'icontact':
                self._newVocusContact(member, isExisting=True, status=status)
            elif marketing_tool == 'hubspot':
                self._newHubSpotContact(member, optout=optout)
            else:
                pass
            return result
        except Exception, e:
            log.error('MarketingTool: Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.CANNOT_CREATE_MEMBER
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, False, ['optout'])
    @d.trace(log, ['member', 'optout'])
    def setHubSpotContactNotification(self, member, optout):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            self._newHubSpotContact(member, optout=optout)
            return result
        except Exception, e:
            log.error('newHubSpotContact: Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.CANNOT_CREATE_MEMBER
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, False)
    @d.trace(log, ['member'])
    def createU13(self, member):
        """
            Creates a new under 13 member.
        """
        try:
            result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            login = request.params['login']
            login = login.lower()

            m = api.getMemberByLogin(login)
            if m:
                msg = 'Login already in use %s' % login
                log.error(msg)
                c.errorCode = ErrorCodes.LOGIN_BEING_USED_ALREADY
                return ErrorCodes().asDict(c.errorCode, msg)

            if not hasattr(request, 'fake_email'):
                login = request.params['login']
                login = login.replace('@', '_').replace('<', '_').replace('>', '_').replace(' ', '_').replace("'", '').replace('"', '')
                request.fake_email = config.get('fake_email') % ('u13', '%d-%s' % (member.id, login))

            tx = utils.transaction(self.getFuncName())
            with tx as session:
                u13_member = self._create(session, role='student')
            #
            #  Update UnderageEmailToken.
            #
            t = request.params.get('t', None)
            underageEmailToken = api.getUnderageEmailToken(parentEmail=member.email, token=t)
            if underageEmailToken:
                underageEmailToken.studentID = u13_member.id
                api.update(underageEmailToken)
            #
            #  Create link to parent account.
            #
            kwargs = {
                'memberID': u13_member.id,
                'parentEmail': member.email,
                'token': u13_member.ext[0].token,
                'approvedTime': datetime.now(),
                'approvalRequestCount': 1,
            }
            api.createUnderageMemberParent(**kwargs)

            result['response'] = {
                'id': u13_member.id,
                'email': u13_member.email,
                'login': u13_member.login,
                'defaultLogin': u13_member.defaultLogin,
                'givenName': u13_member.givenName,
                'surname': u13_member.surname,
                'roleID': u13_member.roleID,
            }
            authTypes = []
            for ext in u13_member.ext:
                if ext.authType:
                    name = ext.authType.name
                else:
                    authTypeNames = g.getMemberAuthTypeNames()
                    name = authTypeNames[ext.authTypeID]
                authTypes.append({ name : {} })
            result['response']['authTypes'] = authTypes
            return result

        except ex.InvalidEmailException, iee:
            log.debug('create member u13: invalid email[%s]' % str(iee), exc_info=iee)
            c.errorCode = ErrorCodes.INVALID_EMAIL
            return ErrorCodes().asDict(c.errorCode, str(iee))
        except Exception, e:
            log.error('create memberi u13: Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.CANNOT_CREATE_MEMBER
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, False)
    @d.trace(log, ['member'])
    def createStudent(self, member):
        """
            Creates a new student member.
        """
        try:
            result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            login = request.params['login']

            c.errorCode = ErrorCodes.OK
            if not hasattr(request, 'fake_email'):
                login = login.replace('@', '_').replace('<', '_').replace('>', '_').replace(' ', '_').replace("'", '').replace('"', '')
                request.fake_email = config.get('fake_email') % ('student', '%d-%s' % (member.id, login))

            tx = utils.transaction(self.getFuncName())
            with tx as session:
                login = login.lower()
                m = api._getMemberByLogin(session, login)
                if m:
                    msg = 'Login already in use %s' % login
                    log.error(msg)
                    c.errorCode = ErrorCodes.LOGIN_BEING_USED_ALREADY
                    return ErrorCodes().asDict(c.errorCode, msg)

                studentMember = self._create(session, role='student')
                if not hasattr(studentMember, 'id') or not studentMember.id:
                    session.flush()

                result['response'] = {
                    'id': studentMember.id,
                    'email': studentMember.email,
                    'login': studentMember.login,
                    'defaultLogin': studentMember.defaultLogin,
                    'givenName': studentMember.givenName,
                    'surname': studentMember.surname,
                    'roleID': studentMember.roleID,
                }
                authTypes = []
                for ext in studentMember.ext:
                    if not hasattr(ext, 'authType') or not ext.authType:
                        name = 'ck-12'
                    else:
                        name = ext.authType.name
                    authTypes.append({ name : {} })
                result['response']['authTypes'] = authTypes
            #
            #  Call flx to associate the newly created
            #  student with this teacher.
            #
            prefix = config.get('flx_prefix_url')
            params = {
                'email': studentMember.email,
                'login': studentMember.login,
                'defaultLogin': studentMember.defaultLogin,
                'givenName': studentMember.givenName,
                'surname': studentMember.surname,
                'authID': studentMember.id,
                'roleID': studentMember.roleID,
            }
            addStudentUrl = '%s/add/student' % prefix
        
            status, add_result = self._call(addStudentUrl, method='POST', params=params, fromReq=True)
            if status != ErrorCodes.OK:
                log.debug('creaetStudent: flx add student failed[%s]' % add_result)
                c.errorCode = status
                result['responseHeader']['status'] = status
                result['response'] = add_result
                raise Exception((_(u'Unable to create student, %(login)s.' % {'login':studentMember.login})).encode("utf-8"))

            return result
        except ex.InvalidEmailException as iee:
            log.debug('createStudent: invalid email[%s]' % str(iee), exc_info=iee)
            if c.errorCode == ErrorCodes.OK:
                c.errorCode = ErrorCodes.INVALID_EMAIL
            return ErrorCodes().asDict(c.errorCode, str(iee))
        except Exception as e:
            log.debug('createStudent: Exception[%s]' % str(e), exc_info=e)
            if c.errorCode == ErrorCodes.OK:
                c.errorCode = ErrorCodes.CANNOT_CREATE_MEMBER
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log)
    def create(self):
        """
            Creates a new member.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            user = u.getCurrentUser(request, anonymousOkay=False)
            if user:
                raise ex.AlreadyLoggedInException((_(u'Already logged in.')).encode("utf-8"))
            tx = utils.transaction(self.getFuncName())
            with tx as session:
                member = self._create(session)
                result['response'] = {
                    'id': member.id,
                    'email': member.email,
                    'login': member.login,
                }
                authTypes = []
                for ext in member.ext:
                    if ext.authType:
                        name = ext.authType.name
                    else:
                        authTypeNames = g.getMemberAuthTypeNames(session=session)
                        name = authTypeNames[ext.authTypeID]
                    authTypes.append({ name : {} })
            result['response']['authTypes'] = authTypes
            return result
        except ex.InvalidEmailException as iee:
            log.debug('create member: invalid email[%s]' % str(iee))
            c.errorCode = ErrorCodes.INVALID_EMAIL
            return ErrorCodes().asDict(c.errorCode, str(iee))
        except ex.MissingArgumentException as mae:
            log.error('create member: Missing argument[%s]' % str(mae), exc_info=mae)
            c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
            info = request.params.get('email', request.params.get('login', ''))
            return ErrorCodes().asDict(c.errorCode, 'Unable to create member for %s: %s.' % (info, mae.message))
        except ex.AlreadyLoggedInException as ale:
            log.error('create member: Already logged in[%s]' % str(ale), exc_info=ale)
            c.errorCode = ErrorCodes.ALREADY_LOGGED_IN
            info = request.params.get('email', request.params.get('login', ''))
            return ErrorCodes().asDict(c.errorCode, 'Unable to create member for %s: %s.' % (info, ale.message))
        except ex.AlreadyExistsException as aee:
            log.error('create member: Already exists[%s]' % str(aee), exc_info=aee)
            c.errorCode = ErrorCodes.MEMBER_ALREADY_EXISTS
            info = request.params.get('email', request.params.get('login', ''))
            return ErrorCodes().asDict(c.errorCode, 'Unable to create member for %s: %s.' % (info, aee.message))
        except Exception as e:
            log.error('create member: Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.CANNOT_CREATE_MEMBER
            info = request.params.get('email', request.params.get('login', ''))
            return ErrorCodes().asDict(c.errorCode, 'Unable to create member for %s: %s.' % (info, e.message))

    @d.jsonify()
    @d.trace(log, ['id', 'type'])
    def createMemberAuthType(self, id, type=None):
        """
            Creates a new authentication type for the given member,
            identified by id which could either be the member id or
            the login name.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            member, extDict = self._get(id)
            if type is None:
                type = 'ck-12'
            typeID = g.getMemberAuthTypes()[type]
            password = request.params['token'] if request.params.has_key('token') else None
            if password is None:
                token = None
            else:
                token = generateDigest(password)

            externalID = request.params.get('externalID')
            if not externalID:
                externalID = member.email
            else:
                externalID = externalID.strip()
            api.createMemberExtData(memberID=member.id,
                                    authTypeID=typeID,
                                    token=token,
                                    externalID=externalID,
                                    verified=True)
            result['response'] = {
                'id': member.id,
                'email': member.email,
                'login': member.login,
                'authType': type,
            }
            return result
        except Exception, e:
            log.error('create member auth type Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.CANNOT_CREATE_MEMBER
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

        memberStates = api.getMemberStates()
        c.memberStatesDict = {}
        for memberState in memberStates:
            c.memberStatesDict[str(memberState.id)] = memberState.name
        c.stateKeys = sorted(c.memberStatesDict.keys(), cmp=h.num_compare)

        c.memberDict = {
            'id': member.id,
            'firstName': member.givenName,
            'lastName': member.surname,
            'gender': member.gender,
            'login': member.login,
            'email': member.email,
            'state': str(member.state.id),
        }
        c.memberList = [
            'firstName',
            'lastName',
            'gender',
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
        member, extDict = self._get(id, member)
        return self._updateForm(member)

    def _setProfileForm(self, form, member):
        form.firstName = member.givenName
        form.lastName = member.surname if member.surname is not None else ''
        form.email = member.email
        form.roLogin = member.login != member.defaultLogin
        form.login = member.login if form.roLogin else ''
        form.phone = member.phone if member.phone is not None else ''
        form.fax = member.fax if member.fax is not None else ''
        form.website = member.website if member.website is not None else ''
        form.birthday = member.birthday.strftime('%m/%d/%Y') if member.birthday is not None else ''
        form.imageURL = member.imageURL if member.imageURL is not None else '' 
        
        form.id = member.id
        countryDict, countryNameDict = g.getCountries()
        form.countryNameDict = countryNameDict
        form.countryDict = countryDict
        form.countryKeys = sorted(form.countryDict.keys())
        form.stateDict = g.getStates()
        form.stateKeys = sorted(form.stateDict.keys())

        memberRoleDict, memberRoleNameDict = g.getMemberRoles()
        form.roleID = memberRoleNameDict.get('student', 'Student')
        teacherRoleID = memberRoleNameDict.get('teacher', 'Teacher')
        for role in member.roles:
            if role.roleID == teacherRoleID:
                form.roleID = teacherRoleID
                break

        prefix = config.get('flx_prefix_url')
        memberGradesUrl = '%s/get/member/grades' % prefix
        status, result = self._call(memberGradesUrl, method='GET', fromReq=True)

        if status == 0:
            gradeList = sorted(result['result'], key=lambda k: k['id'])
            if gradeList:
                form.memberGradesId, gradeNamesList = zip(*[(grade['id'], grade['name']) for grade in gradeList])
                form.memberGradesName = ', ' . join(gradeNamesList)
            else:
                form.memberGradesId = []
                gradeNamesList = []
                form.memberGradesName = ''
            if len(gradeNamesList) > 1:
                form.memberGradesName = re.sub(r'(.*),',r'\1 and', ', '.join(gradeNamesList))

        memberSubjectsUrl = '%s/get/member/subjects' % prefix
        status, result = self._call(memberSubjectsUrl, method='GET', fromReq=True)

        if status == 0:
            subjectList = sorted(result['result'], key=lambda k: k['name'])
            if subjectList:
                form.memberSubjectsId, form.subjectNamesList = zip(*[(grade['id'], grade['name']) for grade in subjectList])
                form.memberSubjectsName = ', ' . join(form.subjectNamesList)
            else:
                form.memberSubjectsId = []
                form.subjectNamesList = []
                form.memberSubjectsName = ''
            if len(form.subjectNamesList) > 1:
                form.memberSubjectsName = re.sub(r'(.*),',r'\1 and', ', '.join(form.subjectNamesList))

            allGradesUrl = '%s/get/info/grades/correlated' % prefix

            status, result = self._call(allGradesUrl, method='GET', fromReq=True)
            if status == 0:
                form.allGrades = result['grades']

        isAdmin = u.isMemberAdmin(member)
        form.roleDict, form.roleKeys = self._setupMemberRoles(isAdmin=isAdmin)

        userDict = getDict(member, moreDetails=True)
        if (userDict.has_key('address')):
            form.userAddress = userDict['address']
        else:
            form.userAddress = 'null';
        if (userDict.has_key('school')):
            form.userSchool = userDict['school']
        else:
            form.userSchool = 'null';
        '''
        form.state = ''
        form.city = ''
        form.zip = ''
        form.province = ''
        form.postalCode = ''
        location = api.getMemberLocation(memberID=member.id)
        countryDict, countryNameDict = g.getCountries()
        if location is None:
            form.countryID = countryNameDict['US']
        else:
            form.countryID = location.countryID
            if form.countryID == countryNameDict['US']:
                address = api.getUSAddress(id=location.addressID)
                form.state = address.state
                form.city = address.city
                form.zip = address.zip
            else:
                address = api.getWorldAddress(id=location.addressID)
                form.province = address.province
                form.city = address.city
                form.postalCode = address.postalCode
        '''
        return form

    @d.checkAuth(request, True, True, ['id'])
    @d.trace(log, ['member', 'id'])
    def updateProfileForm(self, member, id=None):
        adminID = None
        if id is None:
            id = request.params.get('id')
            if id is None:
                id = member.id
        if id != member.id:
            if not u.isMemberAdmin(member):
                id = member.id
            else:
                adminID = member.id
                member = None
        member, extDict = self._get(id, member)
        c.member = member.infoDict()
        c.isUnderage = isUnderageMember(member)
        if member.email:
            c.isRosterUser = bool(re.search(r'student-.*partners.ck12.org', member.email))

        returnTo = request.params.get('returnTo')
        if returnTo is None:
            returnTo = request.params.get('next')
            if returnTo  is None:
                returnTo = self._getDefaultReturnTo()
        c.returnTo = returnTo
        try:
            h.validateDomain(c.returnTo)
        except h.ForbiddenError:
            c.returnTo = self._getDefaultReturnTo()
            return render('%s/errors/403.html' % self.prefix)

        from auth.forms.member import ProfileForm
        from auth.lib.ck12 import messages

        c.messages = messages
        form = ProfileForm()
        if request.method == 'GET':
            c.form = self._setProfileForm(form, member)
        elif request.method == 'POST':
            import formencode

            toRedirect = False
            try:
                formResult = form.to_python(request.params)
                log.debug('updateProfileForm: PUT formResult[%s]' % formResult)
                self._update(member, member.id, adminID=adminID)
                ## Log the event
                try:
                    self._sendEmail(member.id, member.email, 'MEMBER_PROFILE_UPDATED', json.dumps(member.infoDict(), default=h.toJson))
                except Exception, en:
                    log.error('updateProfileForm: Unable to send email[%s]' % en, exc_info=en)

                c.form_success = messages.PROFILE_SAVE_SUCCESS
                toRedirect = True
            except formencode.validators.Invalid, error:
                log.info('updateProfileForm: invalid[%s]' % error)
                c.form_errors = error.error_dict or {}
                c.form_success = None
            except ex.InvalidEmailException, iee:
                log.info('updateProfileForm: invalid email[%s]' % iee)
                c.form_errors = iee
                c.form_success = None
            except Exception, e:
                log.info('updateProfileForm: exception[%s]' % e)
                c.form_error = e
                c.form_success = None

            if toRedirect:
                return redirect(returnTo)

            c.form = self._setProfileForm(form, member)
            #
            #  Fill the form with what the user entered.
            #
            c.form.roleID = request.params.get('roleID')
            c.form.firstName = request.params.get('firstName')
            c.form.lastName = request.params.get('lastName')
            c.form.email = request.params.get('email')
            c.form.login = request.params.get('login')
            c.form.phone = request.params.get('phone')
            c.form.fax = request.params.get('fax')
            c.form.website = request.params.get('website')
            c.form.city = request.params.get('city')
            c.form.state = request.params.get('state')
            c.form.countryCode = request.params.get('countryCode')
            c.form.province = request.params.get('province')
            c.form.postalCode = request.params.get('postalCode')
            c.form.zip = request.params.get('zip')
            c.form.birthday = request.params.get('birthday')
        
        return render('/%s/member/profile.html' % self.prefix)

    def _update(self, member, id=None, adminID=None):
        """
            Updates member.
        """
        if id is None:
            id = request.params.get('id')
            if id is None:
                raise ex.InvalidArgumentException((_(u'Missing member id.')).encode("utf-8"))
        id = long(id)
        isOwn = True
        if id != member.id:
            if not u.isMemberAdmin(member):
                raise ex.UnauthorizedException((_(u'Only admin can update other members.')).encode("utf-8"))
            member = None
            isOwn = False

        loginChanged = False
        try:
            tx = utils.transaction(self.getFuncName())
            with tx as session:
                member, extDict = self._get(id, member, session=session)

                if request.params.has_key('login'):
                    login = request.params['login']
                    if login and login.lower() != member.login:
                        login = login.strip().lower()
                        existMember = api._getMemberByLogin(session, login=login)
                        if existMember is not None and existMember.id != member.id:
                            c.errorCode = ErrorCodes.LOGIN_BEING_USED_ALREADY
                            raise Exception((_(u"Login '%(login)s' is being used.")  % {"login":login}).encode("utf-8"))
                        #
                        #  This block of code is temporary.
                        #
                        #  It's used to clean up the user name
                        #  conflicts.
                        #
                        #  It should be removed once the duplicate
                        #  user name issue has been resolved.
                        #
                        if member.login != member.defaultLogin:
                            dupLogins = api._getDupLogins(session, memberID=member.id)
                            if dupLogins:
                                for dupLogin in dupLogins:
                                    if member.login == dupLogin.login:
                                        #
                                        #  Conflicts for this login resolved.
                                        #
                                        session.delete(dupLogin)
                                        break
                        member.login = login
                        loginChanged = True
                if request.params.has_key('firstName'):
                    member.givenName = request.params['firstName']
                elif request.params.has_key('givenName'):
                    member.givenName = request.params['givenName']
                if request.params.has_key('lastName'):
                    member.surname = request.params['lastName']
                elif request.params.has_key('surname'):
                    member.surname = request.params['surname']
                if request.params.has_key('gender'):
                    member.gender = request.params['gender']
                    if member.gender == '':
                        member.gender = None
                if request.params.has_key('suffix'):
                    member.suffix = request.params['suffix']
                if request.params.has_key('title'):
                    member.title = request.params['title']
                if request.params.has_key('email'):
                    email = request.params['email']
                    email = email.strip().lower()
                    api.validateEmail(email)
                    for ext in member.ext:
                        if ext.authTypeID == 1:
                            if ext.externalID and ext.externalID.lower() == member.email.lower():
                                ext.externalID = email
                            break
                    if member.email.endswith('@ck12.org') and not email.endswith('@ck12.org'):
                        memberRoleDict, memberRoleNameDict = g.getMemberRoles(session=session)
                        iuID = memberRoleNameDict.get('internal-user')
                        mhr = api._getMemberHasRoles(session, memberID=member.id, roleID=iuID)
                        if mhr:
                            api._delete(session, mhr)
                    elif email.endswith('@ck12.org') and not member.email.endswith('@ck12.org'):
                        memberRoleDict, memberRoleNameDict = g.getMemberRoles(session=session)
                        iuID = memberRoleNameDict.get('internal-user')
                        mhr = api._getMemberHasRoles(session, memberID=member.id, roleID=iuID)
                        if not mhr:
                            d = { 'memberID': member.id, 'roleID': iuID }
                            api._create(session, model.MemberHasRole, **d)
                    member.email = email
                if request.params.has_key('stateID'):
                    member.stateID = request.params['stateID']
                if request.params.has_key('phone'):
                    member.phone = request.params['phone']
                if request.params.has_key('fax'):
                    member.fax = request.params['fax']
                if request.params.has_key('website'):
                    member.website = request.params['website']
                if request.params.has_key('emailVerified'):
                    member.emailVerified = str(request.params.get('emailVerified')).lower() == 'true'
                if request.params.has_key('birthday') and request.params.get('birthday'):
                    birthday = request.params['birthday']
                    member.birthday = birthdayStr(birthday) # datetime.strptime(request.params['birthday'], '%m/%d/%Y').date()
                if request.params.has_key('imageURL'):
                    member.imageURL = request.params['imageURL']
                if request.params.has_key('isProfileUpdated'):
                    member.isProfileUpdated = request.params['isProfileUpdated']
                if request.params.has_key('isLicenseAccepted') and request.params.get('isLicenseAccepted'):
                    member.licenseAcceptedTime = datetime.now()
                elif request.params.has_key('licenseAcceptedTime'):
                    member.licenseAcceptedTime = request.params.get('licenseAcceptedTime') or None

                password = request.params.get('password', None)
                if password:
                    self._updatePassword(id, member, password, oldPassword=None, sendEmail=False, isAdmin=True, session=session)

                roleID = request.params.get('roleID', None)
                if roleID:
                    role = api._getMemberRole(session, roleID=roleID)
                    log.debug('_update: role[%s]' % role)
                    if role.is_admin_role:
                        log.debug('_update: adminID[%s]' % adminID)
                        log.debug('_update: member.id[%s]' % member.id)
                        if not adminID or adminID == member.id:
                            raise ex.UnauthorizedException((_(u'Not allowed to self upgrade to admin role.')).encode("utf-8"))
                countryCode = request.params.get('countryCode')
                location = None
                address = None
                if countryCode is None or len(countryCode) == 0:
                    api._updateMember(session, member=member, roleID=roleID, adminID=adminID)
                else:
                    countryDict, countryNameDict = g.getCountries()
                    countryID = countryNameDict[countryCode]
                    location = api._getMemberLocation(session, memberID=member.id)
                    if location is None:
                        if countryID == countryNameDict['US']:
                            #
                            #  New US address.
                            #
                            city = request.params.get('city')
                            state = request.params.get('state')
                            zip = request.params.get('zip')
                            address = api._newUSAddress(session,
                                                        city=city,
                                                        state=state,
                                                        zip=zip)
                        else:
                            #
                            #  New world address.
                            #
                            city = request.params.get('city')
                            province = request.params.get('province')
                            postalCode = request.params.get('postalCode')
                            address = api._newWorldAddress(session,
                                                        city=city,
                                                        province=province,
                                                        postalCode=postalCode)
                        api._updateMember(session,
                                        member=member,
                                        roleID=roleID,
                                        countryID=countryID,
                                        address=address,
                                        adminID=adminID)
                    else:
                        if countryID == location.countryID:
                            if countryID == countryNameDict['US']:
                                #
                                #  Existing US address.
                                #
                                address = api._getUSAddress(session, id=location.addressID)
                                if address is not None:
                                    city = request.params.get('city')
                                    if city != address.city:
                                        address.city = city
                                    state = request.params.get('state')
                                    if state != address.state:
                                        address.state = state
                                    zip = request.params.get('zip')
                                    if zip != address.zip:
                                        address.zip = zip
                            else:
                                #
                                #  Existing US address.
                                #
                                address = api._getWorldAddress(session, id=location.addressID)
                                if address is not None:
                                    city = request.params.get('city')
                                    if city != address.city:
                                        address.city = city
                                    province = request.params.get('province')
                                    if province != address.province:
                                        address.province = province
                                    postalCode = request.params.get('postalCode')
                                    if postalCode != address.postalCode:
                                        address.postalCode = postalCode
                            api._updateMember(session,
                                            member=member,
                                            roleID=roleID,
                                            existLocation=location,
                                            existAddress=address,
                                            adminID=adminID)
                        else:
                            existLocation = location
                            existAddress = api._getUSAddress(session, id=location.addressID)
                            if countryID == countryNameDict['US']:
                                #
                                #  New US address.
                                #
                                city = request.params.get('city')
                                state = request.params.get('state')
                                zip = request.params.get('zip')
                                address = api._newUSAddress(session,
                                                            city=city,
                                                            state=state,
                                                            zip=zip)
                            else:
                                #
                                #  New world address.
                                #
                                city = request.params.get('city')
                                province = request.params.get('province')
                                postalCode = request.params.get('postalCode')
                                address = api._newWorldAddress(session,
                                                            city=city,
                                                            province=province,
                                                            postalCode=postalCode)
                            api._updateMember(session,
                                            member=member,
                                            roleID=roleID,
                                            existLocation=existLocation,
                                            existAddress=existAddress,
                                            countryID=countryID,
                                            address=address,
                                            adminID=adminID)

                schoolID = request.params.get('schoolID')
                schoolName = request.params.get('schoolName')
                schoolType = request.params.get('schoolType')
                school = None
                if schoolID is not None:
                    school = api._getUSSchool(session, id=schoolID)
                    schoolType = 'usmaster'
                elif schoolName is not None:
                    schoolName = urllib.unquote(schoolName)
                    school = api._addOtherSchool(session, name=schoolName)
                    schoolType = 'other'
                if schoolType is not None:
                    existSchool = api._getMemberSchool(session, memberID=member.id)
                    api._updateMember(session,
                                    member=member,
                                    existSchool=existSchool,
                                    school=school,
                                    schoolType=schoolType,
                                    adminID=adminID)

                if request.params.get('invalidate_client', None) and request.cookies.get('flxweb', None):
                    domain = config.get('beaker.session.domain')
                    response.set_cookie('flx-invalidate-client', 'true', domain=domain)
                    response.set_cookie('flxapi-invalidate-client', 'true', domain=domain)
                member = member.cache(model.INVALIDATE, instance=member)
                if isOwn:
                    self._refreshSessions()
            return member
        finally:
            if loginChanged:
                #
                #  Call flx, assessment, and peerhelp entities to force the member sync.
                #
                self._refreshNodes()

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
            loggedInMember = copy.copy(member)
            if not id:
                id = request.params.get('id')
            if not id:
                try:
                    id = member.id
                except DetachedInstanceError:
                    member = api.merge(member)
                    id = member.id

            try:
                id = long(id)
                useID = True
            except ValueError:
                useID = False

            tx = utils.transaction(self.getFuncName())
            with tx as session:
                member, extDict = self._get(id, useID=useID, session=session)

            adminID = loggedInMember.id
            if loggedInMember.id != id:
                if not u.isMemberAdmin(loggedInMember):
                    params_dict = {
                        'studentID': id,
                    }
                    resp = RemoteAPI.makeFlxGetCall( 'get/my/added/students', params_dict=params_dict)
                    log.debug('update: resp[%s]' % resp)
                    if resp['responseHeader']['status'] != 0 or not resp['response']['students']:
                        raise ex.UnauthorizedException((_(u'Only admin can update other members.')).encode("utf-8"))

                    adminID = None

            prevMember = getDict(member)

            member = self._update(member, id, adminID=adminID)
            memberEmail = member.email
            memberLogin = member.login
            """
            # TODO: NEED TO IDENTIFY ROOT CAUSE OF THE COOKIE LOSS.
            # Cookies are lost when _newHubSpotContact or _sendWelcomeEmail are called after _update
            # It was removing cookie "flx-invalidate-client". Holding headers to set it after 
            # _newHubSpotContact and _sendWelcomeEmail are called.
            """
            headers = response.headers
            
            #
            #  Update HubSpot & icontact.
            #
    
            marketing_tool = config.get('marketing_tool')
            if marketing_tool == 'icontact':
                self._newVocusContact(member, isExisting=True)
            elif marketing_tool == 'hubspot':
                self._newHubSpotContact(member)
            else:
                pass
            
            if (not u.isMemberAdmin(loggedInMember)) and id == loggedInMember.id:
                self._sendWelcomeEmail(prevMember, member)
            response.headers = headers
            result['response']['id'] = id
            result['response']['email'] = memberEmail
            result['response']['login'] = memberLogin
            return result
        except ex.InvalidEmailException, iee:
            c.errorCode = ErrorCodes.INVALID_EMAIL
            log.debug('update member: invalid email[%s]' % iee)
            return ErrorCodes().asDict(c.errorCode, str(iee))
        except ex.InvalidArgumentException, iae:
            c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
            return ErrorCodes().asDict(c.errorCode, str(iae))
        except ex.UnauthorizedException, uae:
            c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
            return ErrorCodes().asDict(c.errorCode, str(uae))
        except ex.NotFoundException, nfe:
            c.errorCode = ErrorCodes.UNKNOWN_MEMBER
            return ErrorCodes().asDict(c.errorCode, str(nfe))
        except Exception, e:
            if c.errorCode == ErrorCodes.OK:
                c.errorCode = ErrorCodes.CANNOT_UPDATE_MEMBER
            log.error('update member Exception[%s]' % str(e))
            return ErrorCodes().asDict(c.errorCode, str(e))

    def _updatePasswordForm(self, member):
        c.memberDict = {
            'id': member.id,
        }
        c.returnTo = request.params.get('returnTo', self._getDefaultReturnTo())
        try:
            h.validateDomain(c.returnTo)
        except h.ForbiddenError:
            c.returnTo = self._getDefaultReturnTo()
            return render('%s/errors/403.html' % self.prefix)
        c.prefix = self.prefix
        return render('/%s/member/updatePasswordForm.html' % self.prefix)

    @d.checkAuth(request, True, True, ['id'])
    @d.trace(log, ['member', 'id'])
    def updatePasswordForm(self, member, id=None):
        if id is None:
            id = request.params.get('id')
        if not u.isMemberAdmin(member):
            id = member.id
        else:
            member = None
        member, extDict = self._get(id, member)
        return self._updatePasswordForm(member)

    @d.checkAuth(request, True, True)
    @d.trace(log, ['member'])
    def changePasswordForm(self, member):
        from auth.forms.member import PasswordChangeForm
        from auth.lib.ck12 import messages

        c.member = member.infoDict()

        form = PasswordChangeForm()
        c.messages = messages
        c.curl = url(controller='member', action='changePasswordCompleteForm', qualified=True, protocol='https')

        c.returnTo = request.params.get('returnTo', self._getDefaultReturnTo())
        try:
            h.validateDomain(c.returnTo)
        except h.ForbiddenError:
            c.returnTo = self._getDefaultReturnTo()
            return render('%s/errors/403.html' % self.prefix)

        if request.method == "GET":
            c.form = form
            c.form.id = member.id
        elif request.method == "POST":
            import formencode

            toRedirect = False
            id = member.id
            try:
                formResult = form.to_python(request.params)
                id = formResult.get('id')
                oldPassword = formResult['current_password']
                password = formResult['password']
                self._updatePassword(id, member, password, oldPassword, isAdmin=False)
                toRedirect = True
            except formencode.validators.Invalid, error:
                c.form_errors = error.error_dict or {}
            except Exception, e:
                c.form_error = e

            if toRedirect:
                c.curl = '%s?returnTo=%s' % (c.curl, c.returnTo)
                return redirect(c.curl)

            c.form = form
            c.form.id = id

        return render('/%s/member/changePassword.html' % self.prefix)

    @d.trace(log)
    def changePasswordCompleteForm(self):
        member = u.getCurrentUser(request, anonymousOkay=False)
        if member:
            c.member = member.infoDict()
        else:
            c.member = None
        c.returnTo = request.params.get('returnTo', self._getDefaultReturnTo())
        try:
            h.validateDomain(c.returnTo)
        except h.ForbiddenError:
            c.returnTo = self._getDefaultReturnTo()
            return render('%s/errors/403.html' % self.prefix)
        return render('/%s/member/changePasswordComplete.html' % self.prefix)

    @d.trace(log)
    def _refreshSessions(self):
        self.__clearUserInfoCookies()
        log.info("Calling refresh session on FLX and ASSESSMENT")
        RemoteAPI.makeFlxCall('/refresh/my', params_dict={}, method='POST', failIfNonZero=False)
        RemoteAPI.makeAssessmentCall('/refresh/my', params_dict={}, method='POST', failIfNonZero=False)

    @d.trace(log)
    def __clearUserInfoCookies(self):
        sessionDomain = config.get('beaker.session.domain')
        userCookie = config.get('user_id_cookie')
        response.delete_cookie(userCookie, path='/', domain=sessionDomain)
        userInfoCookie = config.get('user_info_cookie')
        response.delete_cookie(userInfoCookie, path='/', domain=sessionDomain)

    @d.trace(log, ['memberID', 'isOwn'])
    def _invalidateSessions(self, memberID, isOwn=True):
        preserveList = []
        if isOwn:
            cookieName = config.get('beaker.session.key')
            cookieVal = request.cookies.get(cookieName)
            if not cookieVal:
                raise ex.NotFoundException((_(u'Could not get login cookie.')).encode("utf-8"))
            preserveList.append(cookieVal[-32:])
        if not self.sessionDB:
            self.sessionDB = getSessionDB()
        if self.sessionDB:
            MongoSession(self.sessionDB).clearSessionsForUser(userID=memberID, preserveList=preserveList)
        self.__clearUserInfoCookies()

        params_dict = {}
        if not isOwn:
            params_dict = {'userID': memberID}
        RemoteAPI.makeFlxCall('/clear/sessions/my', params_dict=params_dict, method='POST', failIfNonZero=False)
        RemoteAPI.makeAssessmentCall('/clear/sessions/my', params_dict=params_dict, method='POST', failIfNonZero=False)

    def _updatePassword(self, id, member, password, oldPassword, sendEmail=True, isAdmin=False, session=None):
        """
            Updates member password.
        """
        member, extDict = self._get(id, member, session=session)
        if not isAdmin and extDict.has_key('ck-12'):
            token = extDict['ck-12']['token']
            if token is not None and token != '':
                if not _checkPassword(member, extDict['ck-12'], token, oldPassword):
                    raise ex.NotFoundException((_(u'Incorrect password.')).encode("utf-8"))

        token = generateDigest(password)
        if extDict.has_key('ck-12'):
            for e in member.ext:
                if e.authTypeID == extDict['ck-12']['authTypeID']:
                    e.token = token
                    e.updateTime = datetime.now()
                    if session:
                        api._update(session, instance=e)
                    else:
                        api.update(instance=e)
                    member = member.cache(model.INVALIDATE, instance=member)
                    self._invalidateSessions(member.id, not isAdmin)
                    break
        else:
            if session:
                api._createMemberExtData(session,
                                         memberID=member.id,
                                         authTypeID=1,
                                         token=token,
                                         externalID=member.email,
                                         verified=True)
            else:
                api.createMemberExtData(memberID=member.id,
                                        authTypeID=1,
                                        token=token,
                                        externalID=member.email,
                                        verified=True)
            member = member.cache(model.INVALIDATE, instance=member)

        if sendEmail:
            try:
                self._sendEmail(member.id, member.email, 'MEMBER_PASSWORD_UPDATED', json.dumps(member.infoDict(), default=h.toJson))
            except Exception, en:
                log.error('_updatePassword: Unable to send email[%s]' % en, exc_info=en)

    @d.jsonify()
    @d.checkAuth(request, False, False, ['id'])
    @d.trace(log, ['member', 'id'])
    def updatePassword(self, member, id):
        """
            Updates member password.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            if id is None:
                id = request.params.get('id')
                if id is None:
                    raise ex.InvalidArgumentException((_(u'Missing member id.')).encode("utf-8"))
            id = int(id)
            if member.id == id:
                isAdmin = False
            else:
                if not u.isMemberAdmin(member):
                    raise ex.UnauthorizedException((_(u'Only admin can update password for other members.')).encode("utf-8"))
                isAdmin = True
                member = None

            oldPassword = request.params.get('old password')
            if oldPassword is None:
                oldPassword = request.params.get('current_password')
            password = request.params['password']
            self._updatePassword(id, member, password, oldPassword, isAdmin)

            if member is None:
                member = api.getMemberByID(id=id)

            result['response']['id'] = member.id
            result['response']['email'] = member.email
            result['response']['login'] = member.login
            return result
        except Exception, e:
            log.error('update member password Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.CANNOT_UPDATE_MEMBER
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.trace(log)
    def forgetPasswordForm(self):
        from auth.forms.member import ForgetPasswordForm
        from auth.lib.ck12 import messages

        member = u.getCurrentUser(request, anonymousOkay=False)
        if member:
            c.member = member.infoDict()
        else:
            c.member = None

        form = ForgetPasswordForm()
        c.messages = messages
        c.curl = url(controller='member', action='forgetPasswordCompleteForm', qualified=True, protocol='https')
        if request.method == "GET":
            c.form = form
        elif request.method == "POST":
            import formencode

            toRedirect = False
            try:
                formResult = form.to_python(request.params)
                email = formResult['email']
                result = self._forgetPassword(email)
                if result and result.get('authTypes',None):
                    pylons_session['authTypes'] = result.get('authTypes',None)
                    pylons_session.save()
                toRedirect = True
            except formencode.validators.Invalid, error:
                c.form = error.value
                c.form_errors = error.error_dict or {}
            except Exception, e:
                c.form_error = e
                
            if toRedirect:
                return redirect(c.curl)

        c.returnTo = request.params.get('returnTo', self._getDefaultReturnTo())
        c.cancel = self._getDefaultReturnTo()
        try:
            h.validateDomain(c.returnTo)
        except h.ForbiddenError:
            c.returnTo = self._getDefaultReturnTo()
            return render('%s/errors/403.html' % self.prefix)
        return render('/%s/member/forgetPassword.html' % self.prefix)

    def _forgetPassword(self, email=None):
        """
            Kicks off the password reset workflow as follows:
              (1) If `send email` is yes, true, or 1, send an email containing a link to `landing page`.
                  The page prompts the user to enter new password. Otherwise, return token back to caller.
              (2) The new password is submitted to `resetPassword()` along with the token.
              (3) `resetPassword()` resets the user's password.
              
            Parameters:
              `landing page`    URL of the landing page
              `expire`          token expiration in hours (default=2)
              `send email`      yes|true|1|no|false|0 (default is no)
        """
        result = {}
        member, extDict = self._get(email or request.params.get('email'))
        if extDict and not extDict.has_key('ck-12'):
            if extDict.has_key('google') or extDict.has_key('facebook') or extDict.has_key('twitter') or extDict.has_key('live'):
                result['authTypes'] = extDict
                return result
            
        if member is None:
            raise ex.NotFoundException((_(u'No member with email, %(email)s.')  % {"email":email}).encode("utf-8"))
        member = member.cache(model.INVALIDATE, instance=member)
        if member.state.name == 'disabled' or (member.state.name == 'deactivated' and isUnderageMember(member)):
            raise Exception((_(u'Member with email-id "%(email)s", is not active')  % {"email":email}).encode("utf-8"))
        
        memberID = member.id

        # User account found, send out password reset email
        sendEmail = request.params.get('send email', 'yes')
        if sendEmail.lower() in ('yes', 'true', '1'):
            resetUrl = url(controller='member', action='resetPasswordForm', qualified=True, protocol='https')
            expire = request.params.get('expire', 2)
            token = encryptPasswordResetToken(member.id, member.email, expire)
            if request.params.has_key('landing page'):
                landingPage = request.params.get('landing page')
                rurl = '%s?r=%s&t=%s' % (resetUrl, landingPage, token)
            else:
                rurl = '%s?t=%s' % (resetUrl, token)

            if request.params.has_key('activationEmail'):
                rTypeName = 'PASSWORD_RESET_FOR_ACTIVATION'
            else:
                rTypeName = 'PASSWORD_RESET_REQUESTED'

            event = { 'rurl': rurl, 'name': member.fix().name }
            try:
                self._sendEmail(memberID, member.email, rTypeName, json.dumps(event))
            except Exception, en:
                log.error('_forgetPassword: Unable to send email[%s]' % en, exc_info=en)

    @d.jsonify()
    @d.trace(log, ['email'])
    def forgetPassword(self, email=None):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            curl = request.params.get('curl')
            if curl is None:
                member = u.getCurrentUser(request, anonymousOkay=False)
                if member is None or not u.isMemberAdmin(member):
                    raise ex.UnauthorizedException((_(u'Only admin can update other members.')).encode("utf-8"))
            self._forgetPassword(email)
            if curl is None:
                result['response'] = 'The email has been sent.'
                return result
        except Exception, e:
            log.exception('forget password Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.CANNOT_UPDATE_MEMBER
            return ErrorCodes().asDict(c.errorCode, str(e))

        return redirect(curl)

    @d.trace(log)
    def forgetPasswordCompleteForm(self):
        if pylons_session.has_key('authTypes'):
            c.authTypes = pylons_session['authTypes']
            del pylons_session['authTypes']
            
        c.returnTo = request.params.get('returnTo', self._getDefaultReturnTo())
        try:
            h.validateDomain(c.returnTo)
        except h.ForbiddenError:
            c.returnTo = self._getDefaultReturnTo()
            return render('%s/errors/403.html' % self.prefix)
        return render('/%s/member/forgetPasswordComplete.html' % self.prefix)

    @d.trace(log)
    def resetPasswordForm(self):
        from auth.forms.member import PasswordChangeForm
        from auth.lib.ck12 import messages

        c.form = PasswordChangeForm()
        c.messages = messages
        c.token = request.params['t']
        try:
            email, id, expire = decryptPasswordResetToken(c.token)
            member, extDict = self._get(id)
            if member.email.lower() != email.lower():
                raise Exception((_(u'Email not matched for %(email)s, should have been %(member.email)s')  % {"email":email,"member.email": member.email}).encode("utf-8"))

            c.member = member
            if request.params.has_key('r'):
                c.rurl = request.params['r']
            else:
                c.rurl = ''
            c.returnTo = request.params.get('returnTo', self._getDefaultReturnTo())
            try:
                h.validateDomain(c.returnTo)
            except h.ForbiddenError:
                c.returnTo = self._getDefaultReturnTo()
                return render('%s/errors/403.html' % self.prefix)
            c.form_success = True
        except Exception, e:
            c.form_error = e
            c.form_success = None

        return render('/%s/member/resetPassword.html' % self.prefix)

    @d.trace(log)
    def resetPassword(self):
        """
            Reset a user's password to the new one passed in if the token is valid.
            Returns the member's login and authType so client can log the member in.
            See `forgetPassword()` for details.
        """
        from auth.forms.member import PasswordResetForm
        from auth.lib.ck12 import messages
        from formencode.validators import Invalid

        try:
            c.redirectTo = True
            c.messages = messages
            email, id, expire = decryptPasswordResetToken(request.params['token'])
            member, extDict = self._get(id)
            if member.email.lower() != email.lower():
                raise Exception((_(u'Email not matched for %(email)s, should have been %(member.email)s')  % {"email":email,"member.email": member.email}).encode("utf-8"))

            form = PasswordResetForm()
            try:
                formResult = form.to_python(request.params)
                password = formResult['password']
                c.redirectTo = False
                if request.params.has_key('name'):
                    if len(request.params.get('name').strip()) == 0:
                        c.form_error = messages.ACCOUNT_FIRSTNAME_EMPTY
                        c.redirectTo = True
                    else:
                        name = request.params.get('name').strip().split(' ', 1)
                        givenName = name[0]
                        surname = name[1] if name.__len__() > 1 else ''
                        if len(givenName) > 63:
                            c.form_error = messages.ACCOUNT_FIRSTNAME_MAXLENGTH
                            c.redirectTo = True
                        elif len(surname) > 63:
                            c.form_error = messages.ACCOUNT_LASTNAME_MAXLENGTH
                            c.redirectTo = True
            except Invalid, error:
                c.form = error.value
                c.form_errors = error.error_dict or {}
            except Exception, e:
                c.form_error = e

        except Exception, e:
            log.error('reset password Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.CANNOT_UPDATE_MEMBER
            return ErrorCodes().asDict(c.errorCode, str(e))

        if c.redirectTo:
            c.form_success = True
            c.token = request.params['token']
            email, id, expire = decryptPasswordResetToken(c.token)
            member, extDict = self._get(id)
            c.member = member
            return render('/%s/member/resetPassword.html' % self.prefix)

        try:
            token = generateDigest(password)
            authType = 'ck-12'
            ck12 = extDict.get(authType)
            if not ck12:
                typeID = g.getMemberAuthTypes()[authType]
                ext = api.createMemberExtData(memberID=member.id,
                                              authTypeID=typeID,
                                              token=token,
                                              externalID=member.email,
                                              verified=True)
                member = member.cache(model.INVALIDATE, instance=member)
            else:
                for ext in member.ext:
                    if ext.authTypeID == ck12['authTypeID']:
                        ext.token = token
                        ext.updateTime = datetime.now()
                        api.update(instance=ext)
                        member = member.cache(model.INVALIDATE, instance=member)
                        break

            dirty = False
            if not member.givenName:
                member.givenName = request.params.get('firstName', '')
                dirty = True
            if not member.surname:
                member.surname = request.params.get('lastName', '')
                dirty = True
            if not member.givenName and request.params.has_key('name'):
                name = request.params.get('name').strip().split(' ', 1)
                member.givenName = name[0]
                member.surname = name[1] if name.__len__() > 1 else ''
                dirty = True
        
            if member.state.name != 'activated':
                #
                #  Activate the member since the email has been verified.
                #
                memberStateDict, memberStateNameDict = g.getMemberStates()
                member.stateID = memberStateNameDict['activated']
                dirty = True
            if dirty:
                member.updateTime = datetime.now()
                api.update(instance=member)
                member = member.cache(model.INVALIDATE, instance=member)

            ## Log the event
            try:
                self._sendEmail(member.id, member.email, 'MEMBER_PASSWORD_UPDATED', json.dumps(member.infoDict(), default=h.toJson))
            except Exception, en:
                log.error('resetPasswordForm: Unable to send email[%s]' % en, exc_info=en)

            rurl = request.params.get('rurl')
            if rurl is None or len(rurl) == 0:
                rurl = url(controller='member', action='resetPasswordCompleteForm', qualified=True, protocol='https')
        except Exception, e:
            log.error('reset password Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.CANNOT_UPDATE_MEMBER
            return ErrorCodes().asDict(c.errorCode, str(e))

        return redirect(rurl)

    @d.trace(log, ['id'])
    def resetPasswordCompleteForm(self):
        member = u.getCurrentUser(request, anonymousOkay=False)
        if member:
            c.member = member.infoDict()
        else:
            c.member = None
        c.returnTo = request.params.get('returnTo', self._getDefaultReturnTo())
        try:
            h.validateDomain(c.returnTo)
        except h.ForbiddenError:
            c.returnTo = self._getDefaultReturnTo()
            return render('%s/errors/403.html' % self.prefix)
        return render('/%s/member/changePasswordComplete.html' % self.prefix)

    @d.jsonify()
    @d.checkAuth(request, False, False, ['id', 'roleID'])
    @d.trace(log, ['member', 'id', 'roleID'])
    def updateMemberRole(self, member, id=None, roleID=None):
        """
            Update roleID of the given member.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            if id is None:
                id = request.params.get('id')
                if id is None:
                    raise ex.InvalidArgumentException((_(u'Missing member id.')).encode("utf-8"))
            id = int(id)

            isOwn = True
            adminID = None
            if id != member.id:
                if not u.isMemberAdmin(member):
                    raise ex.UnauthorizedException((_(u'Only admin can update other members.')).encode("utf-8"))
                member = None
                isOwn = False
                adminID = member.id

            member, extDict = self._get(id, member)
            memberID = member.id

            if roleID is None:
                roleID = request.params.get('roleID')
            if roleID is not None:
                roleID = long(roleID)
                roles = api.getMemberHasRoles(memberID=memberID)
                teacherID = api.getMemberRoleIDByName('teacher')
                studentID = api.getMemberRoleIDByName('student')
                found = False
                isStudent = isTeacher = False
                for role in roles:
                    if role.roleID == roleID:
                        found = True
                        break
                    if role.roleID == studentID:
                        isStudent = True
                    elif role.roleID == teacherID:
                        isTeacher = True
                if not found:
                    log.debug('Input RoleID [%s]' % roleID)
                    if (isStudent and roleID == teacherID) or (isTeacher and roleID == studentID):
                        raise Exception((_(u'User cannot have Teacher and Student roles together')).encode("utf-8"))
                    roleToAdd = api.getMemberRole(roleID=roleID)
                    log.debug('_update: role[%s]' % role)
                    if roleToAdd.is_admin_role:
                        log.debug('_update: adminID[%s]' % adminID)
                        log.debug('_update: member.id[%s]' % member.id)
                        if not adminID or adminID == member.id:
                            raise ex.UnauthorizedException((_(u'Not allowed to self upgrade to admin role.')).encode("utf-8"))

                    data = {
                        'memberID': memberID,
                        'roleID': roleID,
                    }
                    role = api.create(model.MemberHasRole, **data)

            if not found:
                member = member.cache(model.INVALIDATE, instance=member)
                if isOwn:
                    self._refreshSessions()
            result['response'] = role.asDict()
            return result
        except Exception, e:
            log.exception('update member role Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.CANNOT_UPDATE_MEMBER
            return ErrorCodes().asDict(c.errorCode, str(e))

    
    @d.jsonify()
    @d.checkAuth(request, False, False, ['id'])
    @d.trace(log, ['member', 'id'])
    def updateMemberRoles(self, member, id=None):
        """
            Update roles of member
            TODO: Merge with updateMemberRole to update one or more roles.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            adminID = None
            if id is None:
                id = request.params.get('id')
                if id is None:
                    raise ex.InvalidArgumentException((_(u'Missing member id.')).encode("utf-8"))
            id = int(id)

            isOwn = True
            if id != member.id:
                if not u.isMemberAdmin(member):
                    raise ex.UnauthorizedException((_(u'Only admin can update other members.')).encode("utf-8"))
                adminID = member.id
                member = None
                isOwn = False

            member, extDict = self._get(id, member)
            memberID = member.id
            if not adminID:
                adminID = memberID
            roleIDs = request.params.get('roleIDs')

            if roleIDs is None:
                raise ex.InvalidArgumentException((_(u'Missing member roleIDs')).encode("utf-8"))
            roleIDs = roleIDs.split(',')
            if len(roleIDs) == 0:
                raise ex.InvalidArgumentException((_(u'Missing member roleIDs')).encode("utf-8"))

            validRoles = api.getMemberRoles(roleIDs, 1, 20)
            if validRoles.total == 0:
                raise ex.InvalidArgumentException((_(u'Invalid member roleIDs %(roleIDs)s') % {'roleIDs':roleIDs}).encode("utf-8"))

            # remove duplicates if any
            roleIDs = list(set(roleIDs))

            tx = utils.transaction(self.getFuncName())
            with tx as session:
                teacherID = api._getMemberRoleIDByName(session, 'teacher')
                studentID = api._getMemberRoleIDByName(session, 'student')
                log.debug('TeacherID [%s] and StudentID [%s]' % (teacherID, studentID))
                log.debug('Input RoleIDs [%s]' % roleIDs)
                if str(studentID) in roleIDs and str(teacherID) in roleIDs:
                    raise Exception((_(u'User cannot have Teacher and Student roles together')).encode("utf-8"))
                if roleIDs is not None and len(roleIDs) != 0:
                    roles = [r.roleID for r in member.roles]
                    if 1 in roles and '1' not in roleIDs:
                        data = {
                                'memberID': member.id,
                                'adminID': adminID,
                                'state': 'off',
                               }
                        api._create(session, model.AdminTrace, **data)

                    # delete existing member roles
                    log.debug('Deleting roles of member [%s]' % memberID)
                    api._deleteMemberRoles(session, memberID)
                    session.flush()

                # create new member roles
                memberRoles = []
                for roleID in roleIDs:
                    roleID = int(roleID)
                    data = {
                            'memberID': memberID,
                            'roleID': roleID,
                            }
                    role = api._create(session, model.MemberHasRole, **data)
                    memberRoles.append(role.asDict())
                    if roleID == 1:
                        data = {
                                'memberID': member.id,
                                'adminID': adminID,
                                'state': 'on',
                               }
                        api._create(session, model.AdminTrace, **data)
                member = member.cache(model.INVALIDATE, instance=member)
                log.debug('MemberRoles Dict %s' % memberRoles)
                result['response']['roles'] = memberRoles
            if isOwn:
                self._refreshSessions()
            return result
        except Exception, e:
            log.exception('update member roles Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.CANNOT_UPDATE_MEMBER
            return ErrorCodes().asDict(c.errorCode, str(e))


    @d.trace(log)
    def _updateNotification(self, member, typeName, ruleName, turnOn='yes'):
        memberID = member.id
        if turnOn is None:
            turnOn = True
        else:
            turnOn = turnOn.lower() in [ 'yes', 'true' ]

        envetTypeDict,eventTypeNameDict = g.getEventTypes()
        typeID = eventTypeNameDict.get(typeName)
        if typeID is None:
            raise Exception((_(u'_updateNotfiication: Invalid type: %(typeName)s')  % {"typeName":typeName}).encode("utf-8"))

        notificationRuleDict, notificationRuleNameDict = g.getNotificationRules()
        ruleID = notificationRuleNameDict.get(ruleName) if ruleName is not None else None

        ## Double check to make sure notification is unique for the subscriberID and eventTypeID
        notification = api.getUniqueNotification(eventTypeID=typeID, subscriberID=memberID, ruleID=ruleID, type='email', frequency='instant')
        if turnOn:
            if not notification:
                api.createNotification(eventTypeID=typeID, subscriberID=memberID, ruleID=ruleID, type='email', frequency='instant')
        else:
            if notification:
                api.deleteNotification(id=notification.id)

    @d.jsonify()
    @d.checkAuth(request, False, False)
    @d.trace(log, ['member'])
    def updateNotifications(self, member):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            newMaterial = request.params.get('newMaterial')
            if newMaterial is not None:
                self._updateNotification(member, 'ARTIFACT_RELATED_MATERIAL_ADDED', 'EXISTS_IN_LIBRARY', newMaterial)
            newUpdate = request.params.get('newUpdate')
            if newUpdate is not None:
                self._updateNotification(member, 'ARTIFACT_REVISION_CREATED', 'EXISTS_IN_LIBRARY', newUpdate)
            newNewsletter = request.params.get('newNewsletter')
            if newNewsletter is not None:
                self._updateNotification(member, 'NEWSLETTER_PUBLISHED', None, newNewsletter)
            return result
        except Exception, e:
            log.error('member updateNotification Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.CANNOT_UPDATE_NOTIFICATION
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log, ['member'])
    def getNotifications(self, member):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            result['response']['notifications'] = []
            eventTypes = { 
                    'ARTIFACT_RELATED_MATERIAL_ADDED': {'ruleName': 'EXISTS_IN_LIBRARY', 'label': 'newMaterial'}, 
                    'ARTIFACT_REVISION_CREATED': {'ruleName': 'EXISTS_IN_LIBRARY', 'label': 'newUpdate'},
                    'NEWSLETTER_PUBLISHED': {'ruleName': None, 'label': 'newNewsletter' } 
                    }
            for typeName in eventTypes.keys():
                ruleName = eventTypes[typeName]['ruleName']
                label = eventTypes[typeName]['label']
                envetTypeDict, eventTypeNameDict = g.getEventTypes()
                typeID = eventTypeNameDict.get(typeName)
                notificationRuleDict, notificationRuleNameDict = g.getNotificationRules()
                ruleID = notificationRuleNameDict.get(ruleName) if ruleName else None
                notification = api.getUniqueNotification(eventTypeID=typeID, subscriberID=member.id,
                        ruleID=ruleID, type='email', frequency='instant')
                result['response']['notifications'].append({ label: True if notification else False })
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

    @d.jsonify()
    @d.checkAuth(request, False, False, ['id'])
    @d.trace(log, ['member', 'id'])
    def updateLoginTime(self, member, id):
        """
            Updates the loginTime of member to the current time.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            member.loginTime = datetime.now()
            api.update(member)
            return result
        except Exception, e:
            if c.errorCode == ErrorCodes.OK:
                c.errorCode = ErrorCodes.CANNOT_UPDATE_MEMBER
            log.warn('updateLoginTime: Exception[%s]' % str(e))
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
            member, extDict = self._get(id, member)

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

    #
    #  Authentication related APIs.
    #
    #@https()
    def loginForm(self, returnTo=''):
        if request.params.has_key('returnTo'):
            returnTo = request.params.get('returnTo')
        c.returnTo = returnTo
        if c.returnTo and not c.returnTo.startswith('/'):
            c.returnTo = '/' + c.returnTo
        log.debug("Return to: %s" % c.returnTo)
        c.prefix = self.prefix
        return render('%s/authenticate/login.html' % self.prefix)

    #@https()
    @d.jsonify()
    @d.trace(log)
    def federatedLogin(self):
        """
            Login a member who has been externally authenticated already.
            The following external authentication types are currently supported:
            - facebook
            - google

            In all cases, a login and token will be given for authentication.

            A session instance will be created and passed back to the caller
            for future APIs.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        newMember = False
        try:
            log.debug("Params: %s" % request.params)
            email = request.params.get('email', None)
            if not email:
                raise ex.InvalidEmailException((_(u'No email provided, network or provider could be down.')).encode("utf-8"))
            #
            #  Identify the user by email/externalID.
            #
            extDict = None
            authType = request.params['authType']
            typeID = g.getMemberAuthTypes()[authType]
            email = email.strip().lower()
            externalID = request.params.get('externalID')
            if not externalID:
                externalID = email
            else:
                externalID = externalID.strip()
            memberExtData = api.getMemberExtData(authTypeID=typeID, externalID=externalID)

            member = u.getCurrentUser(request, anonymousOkay=False)
            if member:
                memberID = member.id
                if memberExtData:
                    if memberExtData.memberID != memberID:
                        c.email = email
                        c.account = authType.title()
                        messageHtml = render('/auth/member/accountAlreadyExistsMessage.html')
                        raise ex.AlreadyExistsException((_(messageHtml)).encode("utf-8"))

                member, extDict = self._get(memberID)
            else:
                if memberExtData:
                    memberID = memberExtData.memberID
                    member, extDict = self._get(memberID)
                    if pylons_session.has_key('authType') and pylons_session['userID'] != memberID:
                        c.email = email
                        c.account = authType.title()
                        messageHtml = render('/auth/member/accountAlreadyExistsMessage.html')
                        raise ex.AlreadyExistsException((_(messageHtml)).encode("utf-8"))
                elif pylons_session.has_key('authType'):
                    session_userID = pylons_session['userID']
                    member, extDict = self._get(session_userID)
                    if member.email == email:
                        memberID = member.id
                    else:
                        member = None
                        extDict = None
                        pylons_session['userID'] = None
                        pylons_session['email'] = None
                        pylons_session.delete()

                log.debug('federatedLogin: member[%s]' % member)
                if not member:
                    try:
                        member, extDict = self._get(email)
                        memberID = member.id
                    except Exception:
                        extData = api.getMemberExtData(authTypeID=typeID, externalID=externalID)
                        log.debug('federatedLogin: extData[%s]' % extData)
                        if extData:
                            #
                            #  Match the email of the auth type (in externalID).
                            #
                            memberID = extData.memberID
                            member, extDict = self._get(memberID)
                        else:
                            #
                            #  Create the member as this is his first time logging in.
                            #
                            role = request.params.get('role', None)
                            if not role:
                                role = 'member'
                            tx = utils.transaction(self.getFuncName())
                            with tx as session:
                                member = self._create(session, role=role)
                                memberID = member.id
                            newMember = True
                            #
                            #  Get the member again to avoid session timeout.
                            #
                            member, extDict = self._get(memberID)
            log.debug('federatedLogin: newmember[%s]' % newMember)
            if member.state.name == 'disabled':
                raise ex.UnauthorizedException((_(u'Member with email-id "%(email)s" has been disabled.')  % {"email":member.email}).encode("utf-8"))
            if member.state.name == 'deactivated':
                raise ex.UnauthorizedException((_(u'Member with email-id "%(email)s" is not activated.')  % {"email":member.email}).encode("utf-8"))
            #
            #  Is this the first time an existing member login using
            #  this authentication type? If so, create it.
            #
            # If the imageURL is not set, check if the request params has it and assign it.
            if not member.imageURL and request.params.has_key('imageURL'):
                member.imageURL = request.params.get('imageURL')
                api.update(member)

            #log.debug("Params: %s" % request.params)
            token = request.params['token']
            #log.debug("federatedLogin: token[%s]" % token)
            if  extDict.has_key(authType):
                memberToken = extDict[authType]['token']
            else:
                if token is None:
                    memberToken = None
                else:
                    memberToken = generateDigest(token)
                log.debug("federatedLogin: memberToken[%s]" % memberToken)
                memberExtData = api.createMemberExtData(memberID=memberID,
                                                        authTypeID=typeID,
                                                        token=memberToken,
                                                        externalID=externalID,
                                                        verified=True)
                member = member.cache(model.INVALIDATE, instance=member)
                extDict[authType] = {
                                        'authTypeID': memberExtData.authTypeID,
                                        'token': memberExtData.token,
                                        'externalID': memberExtData.externalID
                                    }
                log.debug("federatedLogin: extDict[%s]" % extDict)
                
            userDict = getDict(member, extDict)
            name = member.fix().name
            #
            #  Authenticate the login/password.
            #
            #  Clever specific:
            #   There may be a teacher that teaches at multiple schools.
            #   In this case, there will be multiple externalIDs and
            #   therefore the token may not match.
            #
            #   Skip the checking for now.
            #
            if authType != 'clever' and not _checkPassword(member, extDict[authType], memberToken, token):
                c.errorCode = ErrorCodes.UNKNOWN_MEMBER
                return ErrorCodes().asDict(c.errorCode,
                                           'Incorrect login or password.')
            
            if not pylons_session.has_key('authType'):
                #
                #  Update analytics.
                #
                self._updateAnalytics(member, typeID)
                #
                #  Create and save the session.
                #
                id = str(memberID)
                #log.debug('Saving session parameters id[%s],email[%s],authType[%s]' % (id, email, authType))
                u.saveSession(request, id, email, authType)

            if newMember:
                self._set_newsletter_notifications({ 'id': memberID })
                
            if authType == 'clever':
                # Update clever information in ck-12 db
                partnerSchoolID = request.params.get('partnerSchoolID')
                partnerDistrictID = request.params.get('partnerDistrictID')

                CleverPartner()._init(memberID=memberID,
                                      siteID=typeID,
                                      partnerSchoolID=partnerSchoolID,
                                      partnerDistrictID=partnerDistrictID)

            #response.set_cookie('userID', id, max_age=3600)
            #
            #  Return information.
            #
            userDict.update({
                'name': name,
                'sessionID': pylons_session.id,
                'timeout': u.getSessionTimeout(),
            })
            #log.debug('federatedLogin: userDict[%s]' % userDict)
            log.debug('federatedLogin: session[%s]' % pylons_session)
            result['response'] = userDict
            if newMember:
                result['response']['newMember'] = True
        except ex.AlreadyExistsException, aee:
            log.debug('Email already registered[%s]' % str(aee))
            c.errorCode = ErrorCodes.CANNOT_UPDATE_MEMBER
            return ErrorCodes().asDict(c.errorCode, str(aee))
        except ex.InvalidEmailException, iee:
            log.debug('federatedLogin: invalid email[%s]' % str(iee))
            c.errorCode = ErrorCodes.INVALID_EMAIL
            return ErrorCodes().asDict(c.errorCode, str(iee))
        except Exception, e:
            log.error('federatedLogin: Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.UNKNOWN_MEMBER
            return ErrorCodes().asDict(c.errorCode, str(e))

        if not request.params.has_key('returnTo'):
            return result

        returnTo = urllib.unquote(request.params['returnTo'])
        log.debug("returning to : %s" % returnTo)
        try:
            h.validateDomain(returnTo)
        except h.ForbiddenError:
            return render('%s/errors/403.html' % self.prefix)
        response.location = returnTo
        redirect(returnTo, 302)

    #@https()
    @d.jsonify()
    @d.trace(log)
    def login(self):
        """
            Authenticates a member. The following authentication types are
            currently supported:
            - ck-12 (internal)
            - ck12 (external)
            - facebook
            - google

            In all cases, a login and token will be given for authentication.

            A session instance will be created and passed back to the caller
            for future APIs.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            login = request.params.get('login')
            if not login:
                login = request.params.get('email')
            if login:
                login = login.strip()
            if not login:
                c.errorCode = ErrorCodes.UNKNOWN_MEMBER
                return ErrorCodes().asDict(c.errorCode, 'no login provided.')
            if type(login) == unicode:
                login = login.encode('utf8')
            login = urllib.unquote(login).strip()

            returnTo = None
            if request.params.has_key('returnTo'):
                returnTo = urllib.unquote(request.params['returnTo'])
                log.debug("Return to: %s" % returnTo)

            authType = 'ck-12'
            appName = request.params.get('appName', None)
            remember = True #str(request.params.get('remember')).lower() == 'true'

            member = u.getCurrentUser(request, anonymousOkay=False)
            if member:
                if member.email != login and member.login != login and str(member.id) != login:
                    if not appName:
                        raise ex.AlreadyLoggedInException((_(u'Already logged in as a different user.')).encode("utf-8"))
                    #
                    #  Logout the current user and login the new user.
                    #
                    pass

            token = request.params.get('token', request.params.get('password'))
            if token is None:
                raise ex.InvalidLoginException((_(u'No token provided.')).encode("utf-8"))

            try:
                member, extDict = validateLogin(login, token, authType)
            except Exception:
                member, extDict = validateLogin(login, token, authType, checkAlternative=True)
            #
            #  Update analytics.
            #
            typeID = g.getMemberAuthTypes()[authType]
            self._updateAnalytics(member, typeID)
            #
            #  Create and save the session.
            #
            id = str(member.id)
            timeout = None if remember else 0
            u.saveSession(request, id, member.email, authType, timeout=timeout)

            #
            #  Return information.
            #
            member, extDict = getMember(member.id, member=member)
            userDict = getDict(member, extDict)
            userDict.update({
                'name': member.fix().name,
                'sessionID': pylons_session.id,
                'timeout': u.getSessionTimeout(),
            })
            result['response'] = userDict
        except ex.AlreadyLoggedInException, alie:
            log.debug('member login Exception[%s]' % str(alie))
            c.errorCode = ErrorCodes.ALREADY_LOGGED_IN
            return ErrorCodes().asDict(c.errorCode, str(alie))
        except ex.InvalidLoginException, ile:
            log.debug('member login Exception[%s]' % str(ile))
            c.errorCode = ErrorCodes.MISSING_PASSWORD
            return ErrorCodes().asDict(c.errorCode, str(ile))
        except Exception, e:
            log.error('member login Exception[%s]' % str(e), exc_info=e)
            log.error(traceback.format_exc())
            c.errorCode = ErrorCodes.UNKNOWN_MEMBER
            return ErrorCodes().asDict(c.errorCode, str(e))

        if returnTo is None or len(returnTo) == 0:
            return result

        try:
            h.validateDomain(returnTo)
        except h.ForbiddenError:
            return render('%s/errors/403.html' % self.prefix)

        from base64 import standard_b64encode
        import json

        encodedData = json.dumps(userDict, ensure_ascii=False, default=h.toJson).encode('utf-8')
        encodedData = urllib.quote(standard_b64encode(encodedData))
        returnTo += '&' if '?' in returnTo else '?'
        returnTo += 'userinfo=%s' % encodedData
        requestor = request.params.get('requestor')
        if requestor:
            returnTo += 'requestor=%s' % urllib.quote(requestor)
        log.debug("returning to : %s" % returnTo)
        response.location = returnTo
        return redirect(returnTo, 302)

    #@https()
    @d.jsonify()
    @d.trace(log)
    def loginInternal(self):
        """
            Expects token parameter with encoded email and id information.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            returnTo = request.params.get('returnTo')
            token = request.params.get('token')
            email, id, expire = decryptPasswordResetToken(token)

            member, extDict = getMember(id)
            if member is None:
                c.errorCode = ErrorCodes.UNKNOWN_MEMBER
                return ErrorCodes().asDict(c.errorCode,
                                           'No member of %s.' % id)

            if extDict.has_key('ck-12'):
                authType = 'ck-12'
            else:
                authType = extDict.keys()[0]
            #
            #  Create and save the session.
            #
            u.saveSession(request, member.id, member.email, authType)

            userDict = getDict(member, extDict)
            userDict.update({
                'name': member.fix().name,
                'sessionID': pylons_session.id,
                'timeout': u.getSessionTimeout(),
            })
            if returnTo is None:
                result['response'] = {
                    'userInfo': userDict,
                }
                return result
        except Exception, e:
            log.error('member loginInternal Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.UNKNOWN_MEMBER
            return ErrorCodes().asDict(c.errorCode, str(e))

        try:
            h.validateDomain(returnTo)
        except h.ForbiddenError:
            return render('%s/errors/403.html' % self.prefix)

        from base64 import standard_b64encode
        import json

        encodedData = json.dumps(userDict, ensure_ascii=False, default=h.toJson).encode('utf-8')
        encodedData = urllib.quote(standard_b64encode(encodedData))
        if '?' in returnTo:
            returnTo += '&'
        else:
            returnTo += '?'
        returnTo += 'userinfo=%s' % encodedData
        log.debug("returning to : %s" % returnTo)
        response.location = returnTo
        return redirect(returnTo, 302)

    @d.jsonify()
    @d.trace(log)
    def logout(self):
        """
            Logout and clear the session information.
        """
        if pylons_session.has_key('userID'):
            userID = pylons_session['userID']
            if userID == pylons_session['userID']:
                pylons_session['userID'] = None
                pylons_session['email'] = None
                pylons_session.delete()
        request.environ['REMOTE_USER'] = None
        try:
            pylons_session.invalidate()
        except Exception:
            pass
        log.debug('logout: session[%s]' % pylons_session)

        returnTo = None
        if request.params.has_key('returnTo'):
            returnTo = request.params['returnTo']
            log.debug("Return to: %s" % returnTo)
            try:
                h.validateDomain(returnTo)
            except h.ForbiddenError:
                return render('%s/errors/403.html' % self.prefix)

        self.__clearUserInfoCookies()
        log.info('logout: returnTo[%s]' % returnTo)
        if returnTo:
            response.location = returnTo
            return redirect(returnTo, 302)

        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        return result

    @d.jsonify()
    @d.checkAuth(request, True, False, ['id'])
    @d.trace(log, ['member', 'id'])
    def activate(self, member, id=None):
        """
            Activates a member identified by his/her id.
        """
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

            prefix = config.get('flx_prefix_url')
            activateUrl = '%s/activate/member/%s' % (prefix, id)
            status, data = self._call(activateUrl, method='POST', fromReq=True)
            if status != 0:
                raise Exception((_(u"Fail to activate member '%(id)s': %(status)s.")  % {'id':id, 'status':status}).encode("utf-8"))

            log.debug('Activated member[%s]' % member.id)
            result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            userDict = {
                        'id': member.id,
                        'login': member.login,
                        'email': member.email,
                        'name': member.fix().name,
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

            prefix = config.get('flx_prefix_url')
            deactivateUrl = '%s/deactivate/member/%s' % (prefix, id)
            status, data = self._call(deactivateUrl, method='POST', fromReq=True)
            if status != 0:
                raise Exception((_(u"Fail to deactivate member '%(id)s': %(status)s.")  % {'id':id, 'status':status}).encode("utf-8"))

            log.debug('Deactivated member[%s]' % member.id)
            result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            userDict = {
                        'id': member.id,
                        'login': member.login,
                        'email': member.email,
                        'name': member.fix().name,
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

            prefix = config.get('flx_prefix_url')
            disableUrl = '%s/disable/member/%s' % (prefix, id)
            status, data = self._call(disableUrl, method='POST', fromReq=True)
            if status != 0:
                raise Exception((_(u"Fail to disable member '%(id)s': %(status)s.")  % {'id':id, 'status':status}).encode("utf-8"))

            log.debug('Disableded member[%s]' % member.id)
            result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            userDict = {
                        'id': member.id,
                        'login': member.login,
                        'email': member.email,
                        'name': member.fix().name,
                       }
            result['response'] = userDict
            return result
        except Exception, e:
            c.errorCode = ErrorCodes.UNKNOWN_MEMBER
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, False, ['withDetails'])
    @d.trace(log, ['member', 'withDetails'])
    def getInfo(self, member, withDetails=False):
        """
            Get info for the logged in member
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            member, extDict = getMember(id=member.login,member=member)
            if not withDetails:
                userDict = getDict(member, extDict)
                userDict.update({
                    'suffix': member.suffix,
                    'title': member.title,
                    'gender': member.gender,
                    'imageURL': member.imageURL,
                    'updateTime': member.updateTime,
                    'registered': member.creationTime,
                    'location': getMemberLocation(member),
                    'school': getMemberSchool(member),
                })
            else:
                userDict = getDict(member, extDict, moreDetails=True)
            userDict['emailVerified'] = member.emailVerified
            log.debug('getInfo: session[%s]' % pylons_session)
            if pylons_session:
                userDict['authType'] = pylons_session.get('authType', None)
                userDict['userToken'] = pylons_session.get('userToken', None)
                appName = request.params.get('appName', None)
                if appName:
                    userDict[appName] = pylons_session.get(appName, None)
                    log.debug('getInfo: %s[%s]' % (appName, userDict.get(appName, None)))

            #Add the partnerInfo as well to the userDict if user is logged in by the partner
            if pylons_session.get('userLoggedInByPartner'):
                userDict['userLoggedInByPartner'] = True
                userDict['partnerInfo'] = {}
                userDict['partnerInfo']['partnerName'] = pylons_session.get('partnerName')
                userDict['partnerInfo']['partnerMemberID'] = pylons_session.get('partnerMemberID')

            #log.debug('getInfo: userDict%s' % userDict)
            result['response'] = userDict
            u.setUserCookies(request, member.id)
            return result
        except Exception, e:
            log.error("Error getting logged in member info: %s" % str(e), exc_info=e)
            c.errorCode = ErrorCodes.UNKNOWN_MEMBER
            return ErrorCodes().asDict(c.errorCode, str(e))

    ## No auth check for this API - profile image should be visible to everyone
    @d.trace(log, ['id', 'size'])
    def profileImage(self, id, size=None):
        user = api.getMemberByID(id)
        if user and user.imageURL:
            url = user.imageURL
            if size and url[0:4].lower() != 'http':
                s = '/flx/show/thumb_%s/image' % size
                url = url.replace('/flx/show/image', s)
            return redirect(url, 302)

        #return abort(404)
        return redirect(h.url_images('../auth/images/user_icon_2.png'), 302)

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
    @d.trace(log)
    def invite(self):
        """
            Invite others to use CK-12.

            The followings will be done for each invited:
            1. Create the CK-12 account.
            2. Add to CampaignMembers table.
            3. Send invite email.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            log.debug("invite: params[%s]" % request.params)
            data = request.params.get('data')
            if not data:
                raise Exception((_(u'No data given')).encode("utf-8"))

            info = json.loads(data)
            log.debug("invite: info[%s]" % info)

            inviter = info.get('from', None)
            if not inviter:
                return result
            campaignID = info.get('campaign', None)
            if not campaignID:
                return result
            invitees = info.get('invites', None)
            if not invitees:
                return result

            try:
                source, medium, campaign = campaignID.split(':')
            except ValueError:
                return result

            memberRoleDict, memberRoleNameDict = g.getMemberRoles()
            roleID = memberRoleNameDict.get('member', 'Member')
            email = inviter.get('email', '')
            name = inviter.get('name', '')
            if not name:
                name = re.sub('@.*', '', email)
            name = self._capitalize(name)
            emailInfo = {
                'inviter': { 'name': name, 'email': email },
                'campaign': { 'source': source, 'medium': medium, 'campaign': campaign, },
            }
            # If request has forum information, then process forum invites.
            forum = info.get('forum', None)
            if forum:
                forumID, forumName = forum.split(':')
                emailInfo.update({'forum': { 'forumID': forumID, 'forumName':forumName}})
                for invitee in invitees:                    
                    log.debug('invite: invitee[%s]' % invitee)
                    email = invitee.get('email', '')
                    if not email:
                        continue
                    invitee_data = dict()
                    # If invitee already CK12 user user his information else use email.
                    member = api.getMemberByEmail(email=email)
                    invitee_data['email'] = email
                    if member:
                        member_id = member.id
                        invitee_data['name'] = member.givenName
                        invitee_data['surname'] = member.surname                                                
                    else:
                        member_id = ''
                        invitee_data['name'] = email
                        invitee_data['surname'] = ''
                        log.info('invite: Member with email[%s] does not exists.' % email)
                        #continue
                    emailInfo.update({'invitee': invitee_data})
                    #log.info("emailInfo:%s" % emailInfo)
                    self._sendEmail(member_id, email, 'INVITE_MEMBER_FORUM', json.dumps(emailInfo, default=h.toJson))
                return result

            for invitee in invitees:
                import random

                #log.debug('invite: invitee[%s]' % invitee)
                email = invitee.get('email', '')
                if not email:
                    continue
                member = api.getMemberByEmail(email=email)
                if member:
                    log.info('invite: email[%s] already signed up.' % email)
                    continue

                givenName = invitee.get('name', '')
                surname = invitee.get('last', '')
                password = '%06x' % random.randrange(256**3)
                token = generateDigest(password)
                email = email.strip().lower()
                if not givenName:
                    givenName = re.sub('@.*', '', email)
                try:
                    member = api.createMember(givenName=givenName,
                                              surname=surname,
                                              gender=None,
                                              suffix=None,
                                              title=None,
                                              login=None,
                                              authTypeID=1,
                                              token=token,
                                              email=email,
                                              externalID=email,
                                              stateID=2,
                                              roleID=roleID,
                                              groupID=1,
                                              emailVerified=True)
                    kwargs = {
                        'campaignID': campaignID,
                        'memberID': member.id,
                    }
                    api.create(model.CampaignMember, **kwargs)

                    #
                    #  create HubSpot & icontact.
                    #
                    marketing_tool = config.get('marketing_tool')
                    if marketing_tool == 'icontact':
                        self._newVocusContact(member)
                    elif marketing_tool == 'hubspot':
                        self._newHubSpotContact(member)
                    else:
                        pass

                except ex.InvalidEmailException, iee:
                    raise iee
                except Exception, ce:
                    log.warn('invite: Unable to create invitee[%s]: %s' % (invitee, str(ce)))
                else:
                    name = '%s %s' % (self._capitalize(givenName), self._capitalize(surname))
                    if name == ' ':
                        name = re.sub('@.*', '', email)
                    if not givenName:
                        givenName = re.sub('@.*', '', email)
                    emailInfo['invitee'] = {
                        'name': name,
                        'first': givenName,
                        'email': email,
                        'password': password,
                    }
                    self._sendEmail(member.id, email, 'INVITE_MEMBER', json.dumps(emailInfo, default=h.toJson))
        except Exception, e:
            log.error('invite: Exception[%s]' % str(e), exc_info=e)

        return result

    @d.trace(log)
    def _set_newsletter_notifications(self, flx2_member):
        params = {'memberID':flx2_member['id']}
        newMaterial = request.params.get('newMaterial')
        newUpdate = request.params.get('newUpdate')
        newNewsletter = request.params.get('newNewsletter')
        if not (newMaterial or newUpdate or newNewsletter):
            # do nothing and return
            return

        if newMaterial:
            params['newMaterial'] = newMaterial
        if newUpdate:
            params['newUpdate'] = newUpdate
        if newNewsletter:
            params['newNewsletter'] = newNewsletter

        prefix = config.get('flx_prefix_url')
        notificationUrl = '%s/create/member/notifications' % prefix
        status, result = self._call(notificationUrl, method='POST', params=params, fromReq=True)
        log.debug('_set_newsletter_notifications: saved notifications status=%s and result=%s' % (status, result))

    @d.trace(log)
    def _validateUnderAge(self):
        isUnderAge = False
        birthday = request.params.get('birthday')
        today = datetime.strptime(datetime.now().__format__('%m/%d/%Y'), '%m/%d/%Y')
        if birthday:
            birthday = birthdayStr(birthday) # datetime.strptime(birthday.strip().__format__('%m/%d/%Y'), '%m/%d/%Y').date()
        from dateutil.relativedelta import relativedelta
        if relativedelta(today, birthday).years < 13:
            isUnderAge = True
        return isUnderAge

    @d.trace(log, ['parent_email', 'member_email'])
    def _update_underage_information(self, member_email=None, parent_email=None):
        if request.headers.get('cookie') is None:
            raise Exception((_(u'Cookies are disabled on your browser.')).encode("utf-8"))
        if member_email == None or parent_email == None:
            try:
                encodedData = request.params.get('underageinfo', None)
                log.info("Underage Sign up: encodedData[%s]" % encodedData)
    
                from base64 import standard_b64decode
                j = json.loads(standard_b64decode(encodedData))
                #log.info("Underage User info: %s" % json.dumps(j, ensure_ascii=False, default=h.toJson))
                member_email = j.get('member_email', None)
                parent_email = j.get('parent_email', parent_email)
            except Exception as e:
                log.error('Underage update information Exception [%s]' %(str(e)))
                raise Exception((_(u'Invalid Request')).encode("utf-8"))

        if parent_email:
            parent_email = parent_email.strip()
        if not member_email:
            c.redirectToSignUpPage = True
            raise Exception((_(u'Invalid Request')).encode("utf-8"))

        member, extDict = self._get(member_email, None);
        if not parent_email:
            raise Exception((_(u'Parent email id required.')).encode("utf-8"))
        elif parent_email.lower() == member.email.lower():
            raise Exception((_(u'Parent email and member email can not be same : %(email)s')  % {"email":parent_email}).encode("utf-8"))

        eventData = {'memberID': member.id,
                     'email': member.email,
                     'firstName': member.givenName,
                     'birthday': member.birthday,
                     'lastName':member.surname
                    }
        verifiedUrl = url(controller='member', action='verifyUnderageApproval', qualified=True, protocol='https')
        expire = request.params.get('expire', 2)
        token = encryptUnderAgeVerifyEmailToken(member, parent_email, expire)
        rurl = '%s?t=%s' % (verifiedUrl, token)
        eventData['rurl'] = rurl
        underageMemberParent = api.getUnderageMemberParent(memberID=member.id)
        if not underageMemberParent:
            kwargs = {}
            kwargs['memberID'] = member.id
            kwargs['parentEmail'] = parent_email
            kwargs['token'] = token
            kwargs['approvalRequestCount'] = 1
            api.createUnderageMemberParent(**kwargs)
        else:
            underageMemberParent.token = token
            underageMemberParent.parentEmail = parent_email
            underageMemberParent.approvalRequestCount = int(underageMemberParent.approvalRequestCount) + 1
            api.updateUnderageMemberParent(underageMemberParent)

        try:
            self._sendEmail(member.id, parent_email, 'UNDERAGE_REGISTRATION_NOTIFICATION_PARENT', json.dumps(eventData, default=h.toJson))
        except Exception, en:
            log.error('_update_underage_information: Unable to send email[%s]' % en, exc_info=en)

    def underageSignupComplete(self):
        c.redirectToSignUpPage = False
        try:
            return render('/%s/member/underageSignupComplete.html' % self.prefix)
        except Exception as e:
            if not c.redirectToSignUpPage:
                c.form_errors = e
                return render('/%s/member/underageSignup.html' % self.prefix)
        #If underage information is not found in session redirect to signup page
        return  redirect(url('signup', qualified=True, protocol='https'))

    @d.trace(log)
    def _underageCookieCheck(self):
        if config.get('session.underage.cookie.key') in request.cookies.keys():
            return True
        return False

    @d.trace(log, ['t'])
    def resendUnderageApprovalEmail(self):
        try:
            if request.params.has_key('t') and request.params.get('t').strip() :
                email, id, parentEmail, expire =  decryptUnderAgeVerifyEmailToken(request.params.get('t').strip(), checkExpiration=False)
                member, extDict = self._get(id);
                underageMemberParent = api.getUnderageMemberParent(memberID=member.id, email=parentEmail)
                memberStateDict, memberStateNameDict = g.getMemberStates()
                if not underageMemberParent or underageMemberParent.token != request.params.get('t').strip() or member.stateID != memberStateNameDict['deactivated']:
                    log.error("Either Underage parent doesn't exist or parent token doesn't match with request token or member state is not deactivated for memberID : %s" % member.id)
                    log.error("Request token : %s" % request.params.get('t').strip())
                    raise Exception((_(u'Invalid resend request')).encode("utf-8"))
            else:
                log.error("No token information found in request params, invalid token request")
                raise Exception((_(u'Invalid resend request')).encode("utf-8"))

            self._update_underage_information(email, parentEmail)
            c.redirect = True
        except Exception as e:
            c.form_errors = e
            c.redirect = False
            log.error('Underage resend approval request Exception[%s]' % str(e), exc_info=e)
        if c.redirect:
            api_url = url(controller='member',
                          action='underageSignupComplete',
                          qualified=True,
                          protocol='https')
            return redirect(api_url)
        return render('/%s/member/underageVerifyEmail.html' % self.prefix)

    @d.trace(log)
    def verifyUnderageApproval(self):
        try:
            c.resendApprovalEmail = False
            c.accountAlreadyActivated = False
            token_expired_error = None
            if request.params.has_key('t'):
                try:
                    email, id, parentEmail, expire = decryptUnderAgeVerifyEmailToken(request.params.get('t').strip())
                except ex.TokenExpired as e:
                    token_expired_error = e
                    log.error("Token Expirted for request %s Error : [%s]" % (request.params.get('t'), str(e)), exc_info=e)
                    email, id, parentEmail, expire = decryptUnderAgeVerifyEmailToken(request.params.get('t').strip(), checkExpiration=False)
                except Exception as e:
                    log.error("Error in decrypt underage verify email token : [%s]" % str(e), exc_info=e)
                    token_expired_error = None
                    raise e

                member, extDict = self._get(id)
                if member.email.lower() != email.lower():
                    raise Exception((_(u'Email not matched for %(email)s, should have been %(member.email)s')  % {"email":email,"member.email": member.email}).encode("utf-8"))
                
                memberStateDict, memberStateNameDict = g.getMemberStates()
                if member.stateID == memberStateNameDict['deactivated'] and token_expired_error:
                    c.resendApprovalEmail = True
                    c.token = request.params.get('t')
                    raise token_expired_error
                elif member.stateID == memberStateNameDict['deactivated'] and token_expired_error is None:
                    underageMemberParent = api.getUnderageMemberParent(memberID=member.id)
                    if not underageMemberParent or (underageMemberParent and underageMemberParent.token != request.params.get('t').strip()):
                        log.error("Either Underage parent doesn't exist or parent token doesn't match with request token for memberID : %s" % member.id)
                        log.error("Request token : %s" % request.params.get('t').strip())
                        raise Exception((_(u'Invalid request')).encode("utf-8"))
                    member.stateID = memberStateNameDict['activated']
                    member.updateTime = datetime.now()
                    api.update(instance=member)
                    member = member.cache(model.INVALIDATE, instance=member)
                    c.member = member

                    underageMemberParent.approvedTime = datetime.now()
                    api.updateUnderageMemberParent(underageMemberParent)
                    log.info("Account activation request approved for memberID : %s at %s" % (member.id, underageMemberParent.approvedTime))
                    c.form_success = True

                elif member.stateID != memberStateNameDict['deactivated'] and token_expired_error is None:
                    c.accountAlreadyActivated = True
                    underageMemberParent = api.getUnderageMemberParent(memberID=member.id, email=parentEmail)
                    c.member = member
                    c.underageMemberParent = underageMemberParent
                    raise Exception((_(u'Invalid request')).encode("utf-8"))
                else:
                    raise Exception((_(u'Invalid request')).encode("utf-8"))
            else:
                log.error("No token information found in request params, invalid token request")
                raise Exception((_(u'Invalid request')).encode("utf-8"))
        except ex.TokenExpired as e:
            c.form_errors = None
            c.form_sucess = None
        except Exception, e:
            c.form_errors = e
            if c.accountAlreadyActivated == True:
                c.form_errors = None
            log.error('Verify underage email Exception[%s]' % str(e))
            c.form_success = None

        c.token = request.params['t']
        c.flxweb_home_url = config.get('web_prefix_url')
        #return render('/%s/member/underageVerifyEmail.html' % self.prefix)
        if c.resendApprovalEmail:
            return redirect('%s/member/resendApprovalEmail?t=%s' % (self.prefix, c.token))
        elif c.accountAlreadyActivated:
            return redirect('%s/member/accountAlreadyActivated?t=%s' % (self.prefix, c.token))
       
        return render('/%s/member/underageVerifyEmail.html' % self.prefix)
    
    @d.jsonify()
    @d.checkAuth(request, False, False, ['email'])
    @d.trace(log, ['member', 'email'])
    def isMemberVerified(self, member, email=None):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            if email:
                if not u.isMemberAdmin(member):
                    raise ex.UnauthorizedException((_(u'Only admin can check other members.')).encode("utf-8"))

                member = api.getMemberByEmail(email=email)
                if not member:
                    raise ex.NotFoundException((_(u"Member '%(email)s' does not exist.")  % {"email":email}).encode("utf-8"))

            emailVerified = member.emailVerified
            result['response']['verified'] = 'true' if emailVerified else 'false'
            return result
        except ex.UnauthorizedException, uae:
            c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
            return ErrorCodes().asDict(c.errorCode, str(uae))
        except ex.NotFoundException, nfe:
            c.errorCode = ErrorCodes.UNKNOWN_MEMBER
            return ErrorCodes().asDict(c.errorCode, str(nfe))

    @d.trace(log)
    def resendApprovalEmail(self):
        try:
            email, id, parentEmail, expire =  decryptUnderAgeVerifyEmailToken(request.params.get('t').strip(), checkExpiration=False)
            if not id and not email and not parentEmail:
                raise Exception((_(u'Invalid request')).encode("utf-8"))
            
            member, extDict = self._get(id)        
            c.token = request.params.get('t').strip()
            c.member = member
            c.underageMemberParent = api.getUnderageMemberParent(memberID=member.id)
            c.resendApprovalEmail = True
        except Exception, e:
            c.form_errors = e
            log.error('Resend Approval Email Exception[%s]' % str(e))
            c.form_success = None
        return render('/%s/member/underageVerifyEmail.html' % self.prefix)
    
    
    @d.trace(log)
    def accountAlreadyActivated(self):
        try:
            email, id, parentEmail, expire =  decryptUnderAgeVerifyEmailToken(request.params.get('t').strip(), checkExpiration=False)
            if not id and not email and not parentEmail:
                raise Exception((_(u'Invalid request')).encode("utf-8"))
            
            member, extDict = self._get(id)
            c.token = request.params.get('t').strip()
            c.member = member
            c.underageMemberParent = api.getUnderageMemberParent(memberID=member.id, email=parentEmail)
            c.accountAlreadyActivated = True
        except Exception, e:
            c.form_errors = e
            log.error('Account Already Activated Exception[%s]' % str(e))
            c.form_success = None
        return render('/%s/member/underageVerifyEmail.html' % self.prefix)

    @d.jsonify()
    @d.checkAuth(request, False, False, ['id'])
    @d.trace(log)
    def createProfileImage(self):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            resourceObj = {}
            resourceObj.update({'resourceType' : request.params.get('resourceType','image'),
                                'resourceDesc' : request.params.get('resourceDesc','User Profile Image'), 
                                'isPublic' : request.params.get('isPublic', False) == 'true',
                                'isExternal' : request.params.get('isExternal',False) == '1',
                                'resourceHandle' : request.params.get('resourceHandle','')
                                })
            
            if not request.params.has_key('resourcePath') and not request.params.has_key('resourcePathLocation'):
                log.error('File object not found for profile image')
                raise Exception((_(u'Neither resource uri nor resource path is specified')).encode("utf-8")) 

            member, extDict = self._get(id=pylons_session.get('userID'))
            if request.params.has_key('resourcePath'):
                filename = request.params['resourcePath'].filename
                log.info("Image name in request.params is %s"%filename)
                filename_list = filename.split('.')
                filename_list[0] += time.strftime("-%Y%m%d-%H%M%S")
                filename = '.'.join(filename_list)
                log.info("Changed image name is %s"%filename)
                
                log.info('Got file object ...downloading....')
                tmp_upload_dir = h.get_unique_upload_dir()
                stored_file_path = h.store_upload_file( tmp_upload_dir, filename, request.params['resourcePath'].file)
                if stored_file_path:
                    path, ext = os.path.splitext(stored_file_path)
                    allowed_image_extensions = ['.png', '.jpg', '.jpeg', '.gif']
                    if not ext or ext.lower() not in allowed_image_extensions:
                        raise Exception((_(u'Invalid file extension. Files of type %(ext)s are not supported as profile image.')  % {"ext":ext}).encode("utf-8"))

                if not h.validate_resource_size(stored_file_path) :
                    raise Exception((_(u'Uploaded file is too large. Maximum size allowed is 2 MB.')).encode("utf-8"))

                if request.params.has_key('resourceName') and request.params.get('resourceName'):
                    resourceObj['resourceName'] = request.params['resourceName']
                else:
                    resourceObj['resourceName'] = stored_file_path.split('/')[-1]
                    
                if not resourceObj.get('resourceHandle'):
                    resourceObj.update({'resourceHandle': stored_file_path.split('/')[-1].replace(' ', '-') })

                if h.upload_dir_is_shared() and h.get_upload_dir() and h.get_upload_dir() in stored_file_path :
                    resourceObj.update({'resourcePathLocation': stored_file_path})
                    log.debug('Creating resource. Params: %s' % resourceObj)
                    resource = self._createProfileImage(resourceObj, member)
                    os.remove(h.safe_encode(stored_file_path))
                else:
                    uploaded_file = open(h.safe_encode(stored_file_path), 'r')
                    resourceObj.update({'resourcePath':uploaded_file})
                    log.debug('uploading attachment: %s' % uploaded_file.name)
                    log.debug("upload params: %s" % resourceObj)
                    resource = self._createProfileImage(resourceObj, member)
                    uploaded_file.close()
                shutil.rmtree(tmp_upload_dir)
            else:
                log.info('Got image location....')
                resourceObj.update({'resourcePathLocation':request.params['resourcePathLocation'],
                                    'resourceName':request.params['resourceName']
                                   })
                resource = self._createProfileImage(resourceObj, member)
            
            if resource and resource.has_key('uri') and resource.get('uri'):
                imageURL = resource.get('uri')
                if request.params.has_key('updateMember') and request.params.get('updateMember'):
                    member = member.cache(model.INVALIDATE, instance=member)
                    member.imageURL = imageURL
                    api.updateMember(member=member)
                if request.params.get('invalidate_client', None) and request.cookies.get('flxweb', None):
                    domain = config.get('beaker.session.domain')
                    response.set_cookie('flx-invalidate-client', 'true', domain=domain)

                log.info("Profile image uri for user %s is %s = " %(member.id, imageURL))
                result['response']['uri'] = imageURL
            else:
                log.error('Can not create/update profile image')
                raise Exception((_(u'Unable to upload profile image forlogin: %(member.login)s')  % {"member.login":member.login}).encode("utf-8"))
        except Exception as e:
            log.error("Error saving profile image", exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.CANNOT_CREATE_RESOURCE, str(e.message))
        finally:
            try:
                if stored_file_path and os.path.exists(stored_file_path):
                    os.remove(stored_file_path)
            except:
                pass
        return result

    @d.trace(log)
    def _createProfileImage(self, resourceObj, member):
        try:
            multipart = False
            if resourceObj.has_key('resourcePath'):
                multipart = True
            
            try:
                data = RemoteAPI.makeFlxCall('/create/resource', resourceObj, multipart=multipart)
            except RemoteAPIStatusException, e:
                if ErrorCodes.RESOURCE_ALREADY_EXISTS == e.status_code:
                    data = e.response_data
                    if 'response' in data and 'uri' in data['response']:
                        existing_resource = data['response']
                        return existing_resource
                elif ErrorCodes.CANNOT_CREATE_RESOURCE == e.status_code:
                    raise Exception((_(u'Unable to create resource. login: %(member.login)s ErrorCode: %(errorcode)s')  % {"member.login":member.login, "errorcode":e.status_code}).encode("utf-8"))
            if 'response' in data and 'responseHeader' in data:
                status =  data['responseHeader']['status']
                result = data['response']
            log.info("Reponse from create resource = %s , status code = %s" %(result, status))

            return result
        except Exception, e:
            log.info(e)
            raise e

    @d.jsonify()
    @d.checkAuth(request, False, False)
    @d.trace(log)
    def setMemberGrades(self):
        try:
            gradeIDs = request.params.get('gradeIDs', '')
            #if not gradeIDs:
            #    return BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)

            params = {
                'gradeIDs': gradeIDs
            }
            prefix = config.get('flx_prefix_url')
            setGradesUrl = '%s/set/member/grades' % prefix
        
            status, result = self._call(setGradesUrl, method='POST', params=params, fromReq=True)
            return result
        except Exception, e:
            log.info(e)
            raise e

    @d.jsonify()
    @d.checkAuth(request, False, False)
    @d.trace(log)
    def setMemberSubjects(self):
        try:
            subjects = request.params.get('subjects','')
            if subjects is not None:
                params = {
                    'subjects' : subjects
                }
                prefix = config.get('flx_prefix_url')
                subjectUrl = '%s/set/member/subjects' % prefix
            
                status, result = self._call(subjectUrl, method='POST', params=params, fromReq=True)
                return result
        except Exception, e:
            log.info(e)
            raise e

    @d.jsonify()
    @d.checkAuth(request, False, False, ['search_term'])
    @d.setPage(request, ['member', 'search_term'])
    @d.trace(log, ['member','search_term', 'pageNum', 'pageSize'])
    def searchUSSchools(self, member, search_term, pageNum, pageSize):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            if not search_term:
                search_term = request.params.get('search_term', None)
            if not search_term:
                raise ex.MissingArgumentException((_(u'Search term is missing')).encode("utf-8"))

            city = None
            state = request.params.get('state')
            if state is not None:
                city = request.params.get('city')

            schools = api.searchUSSchools(search_term=search_term, city=city, state=state, pageNum=pageNum, pageSize=pageSize)
            result['response']['schools'] = []
            if schools.getTotal() != 0:
                result['response']['total'] = schools.total
                for school in schools:
                    result['response']['schools'].append(school.asDict())
        except ex.MissingArgumentException, mae:
            log.debug('searchUSSchools: Missing Argument Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
            return ErrorCodes().asDict(c.errorCode, str(mae))
        except Exception, e:
            log.info(e)
            raise e
        return result

    def _sendWelcomeEmail(self, prevMember, currMember, session=None):
        #log.debug('_create: currMember[%s]' % currMember)
        memberRoleDict, memberRoleNameDict = g.getAuthMemberRoles(session=session)
        studentRoleID = memberRoleNameDict['student']
        teacherRoleID = memberRoleNameDict['teacher']
        currMemberDict = getDict(currMember, session=session)
        log.debug('_create: currMemberDict[%s]' % currMemberDict)
        currRoles = currMemberDict.get('roles', [])
        log.debug('_create: currRoles[%s]' % currRoles)
        roleName = None
        if not prevMember:
            for role in currRoles:
                roleID = role.get('id', None)
                if roleID:
                    if studentRoleID == roleID or teacherRoleID == roleID:
                        roleName = role['name']
                        log.debug('_sendWelcomeEmail: User %s selected role %s' % (currMemberDict['id'], roleName))
                else:
                    name = role.get('name', None)
                    if name == 'student' or name == 'teacher':
                        roleName = name
        else:
            prevRoles = prevMember.get('roles', [])
            rolePresent = False
            # loop over previous member roles to find out if teacher or student role was already set
            for role in prevRoles:
                if studentRoleID == role['id'] or teacherRoleID == role['id']:
                    if not prevMember.get('isUnderage',False):
                        log.debug('_sendWelcomeEmail: Role %s is already set for user %s so no need to process further for welcome email' % (studentRoleID, prevMember['id']))
                        rolePresent = True
                    else:
                        log.info('_sendWelcomeEmail: Underage student ID %s for the first time with role %s' % (prevMember['id'], studentRoleID))
                    break
            if not rolePresent:
                for role in currRoles:
                    roleID = role.get('id', None)
                    if roleID:
                        if studentRoleID == role['id'] or teacherRoleID == role['id']:
                            roleName = role['name']
                            log.debug('_sendWelcomeEmail: User %s selected role %s' % (currMemberDict['id'], roleName))
                    else:
                        name = role.get('name', None)
                        if name == 'student' or name == 'teacher':
                            roleName = name

        if roleName:
            if not prevMember:
                sendEmail = True
            else:
                sendEmail = False
                try:
                    params_dict = {'pageNum': 1, 'pageSize': 1, 'sort':'lastSent,desc'}
                    notifications = RemoteAPI.makeFlxCall('/get/self/notifications/MEMBER_CREATED', params_dict=params_dict, method='GET', failIfNonZero=False)

                    if notifications and notifications['response'] and notifications['response']['notifications']:
                        lastSent = notifications['response']['notifications'][0]['lastSent']
                        if lastSent is not None and lastSent != 'None' and len(lastSent) > 1:
                            log.debug('_sendWelcomeEmail: Already Welcome email is sent. Skipping welcome email')
                        else:
                            log.debug('_sendWelcomeEmail: Need to send welcome email')
                            sendEmail = True
                    else:
                        log.debug('_sendWelcomeEmail: Need to send welcome email')
                        sendEmail = True
                except RemoteAPIStatusException, e:
                    log.error('_sendWelcomeEmail: Exception[%s]' % str(e), exc_info=e)
                    log.error(ErrorCodes.NO_SUCH_NOTIFICATION)

            if sendEmail:
                try:
                    eventData = currMember.infoDict()
                    eventData['roleName'] = roleName
                    self._sendEmail(currMemberDict['id'], currMemberDict['email'], 'MEMBER_CREATED', json.dumps(eventData, default=h.toJson))
                except Exception, en:
                    log.error('_sendWelcomeEmail: Unable to send email[%s]' % en, exc_info=en)

    @d.jsonify()
    @d.checkAuth(request, False, False, ['memberID', 'adminID'])
    @d.setPage(request, ['member', 'memberID', 'adminID'])
    @d.trace(log, ['member', 'memberID', 'adminID', 'pageNum', 'pageSize'])
    def getMemberTraces(self, member, memberID=None, adminID=None, pageNum=0, pageSize=0):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            if memberID != member.id and not u.isMemberAdmin(member):
                raise ex.UnauthorizedException((_(u'Only admin can view other members.')).encode("utf-8"))

            page = api.getAdminTraces(memberID=memberID, adminID=adminID, pageNum=pageNum, pageSize=pageSize)
            l = []
            for r in page:
                log.debug('getMemberTraces: r[%s]' % r)
                l.append(r.asDict())
            result['response']['total'] = page.getTotal()
            result['response']['limit'] = len(l)
            result['response']['offset'] = (pageNum - 1)*pageSize
            result['response']['result'] = l
            return result
        except ex.UnauthorizedException, uae:
            c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
            return ErrorCodes().asDict(c.errorCode, str(uae))
        except Exception, e:
            log.error('getMemberTraces: Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.NO_SUCH_MEMBER
            return ErrorCodes().asDict(c.errorCode, str(e))
