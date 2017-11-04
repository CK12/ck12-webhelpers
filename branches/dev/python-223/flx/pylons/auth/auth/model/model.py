"""
    Map database tables to python classes.

    NOTE: Do not log any PII for members
"""

import logging

from beaker.cache import cache_region
from beaker.cache import region_invalidate
from sqlalchemy import orm
from sqlalchemy.orm.exc import DetachedInstanceError, NoResultFound
from auth.model import meta
from auth.lib import helpers as h

########## Reviewed Model Classes ##########

class MemberAuthTypeKey(object):

    def __init__(self, **kw):
        self.__dict__.update(kw)

#####################################

log = logging.getLogger(__name__)

ck12Editor = None

INVALIDATE = 0
LOAD = 1

LEVEL = 3

"""
    Classes to be filled in by the mapper of SqlAlchemy.
"""

class FlxModel(object):
    def __init__(self, **kw):
        self.__dict__.update(kw)

    def __unicode__(self):
        return unicode(vars(self))

    def __str__(self):
        return unicode(self).encode('utf-8')

    def __repr__(self):
        return str(self)

    @staticmethod
    def processMulti(items, level=LEVEL):
        if hasattr(items, 'keys'):
            d = {}
            #
            #  Dictionary.
            #
            for key in items.keys():
                value = items.get(key, None)
                #log.debug('processMulti: dict key[%s] %s[%s]' % (key, type(items), items))
                if isinstance(value, FlxModel):
                    d[key] = value.asDict(level - 1, top=False)
                else:
                    d[key] = processMulti(value, level - 1)
            return d
        elif hasattr(items, '__iter__'):
            #
            #  List.
            #
            l = []
            for value in items:
                #log.debug('processMulti: list %s[%s]' % (type(value), value))
                if isinstance(value, FlxModel):
                    l.append(value.asDict(level=level - 1, top=level == LEVEL))
                else:
                    l.append(processMulti(value, level - 1))
            #log.debug('processMulti: return %s[%s]' % (type(l), l))
            return l

    def asDict(self, level=LEVEL, top=True):
        """
            Return the dictionary this instance.
        """
        if level <= 0:
            return '...'

        d = {}
        mine_dict = self.__dict__
        for key in mine_dict.keys():

            if key == '_sa_instance_state':
                continue
            value = mine_dict.get(key)
            #log.debug('asDict[%d]: key[%s] %s[%s]' % (level, key, type(value), value))
            if hasattr(value, 'keys') or hasattr(value, '__iter__'):
                children = FlxModel.processMulti(value, level - 1)
                d[key] = children
            elif isinstance(value, FlxModel):
                child = value.asDict(level - 1, top=False)
                d[key] = child
            else:
                #log.debug('asDict[%d]: single key[%s] value[%s]' % (level, key, value))
                d[key] = value
        return d

class ZipCode(FlxModel):

    def asDict(self):
        zipCode = {
                    'zipCode': self.zipCode,
                    'city': self.city,
                    'state': self.state,
                    'latitude': float(self.latitude),
                    'longitude': float(self.longitude),
                    'classification': self.classification,
                    'population': self.population,
                  }
        return zipCode

class USState(FlxModel):
    pass

class Country(FlxModel):
    pass

class WorldAddress(FlxModel):
    pass

class USAddress(FlxModel):
    pass

class Address(FlxModel):
    pass

class Member(FlxModel):

    @classmethod
    def cache(cls, action, id=None, email=None, login=None, defaultLogin=None, instance=None, forceMerge=False):

        @cache_region('forever', 'm-id')
        def loadByID(id):
            session = meta.Session()
            query = session.query(cls)
            query = query.filter_by(id=id)
            try:
                member = query.one()
                if member:
                    log.debug('cache: member caching id[%s]' % member.id)
                    return member

                return None
            except NoResultFound:
                return None

        @cache_region('forever', 'm-email')
        def getIDFromEmail(email):
            session = meta.Session()
            query = session.query(cls.id)
            query = query.filter_by(email=email)
            #log.debug('getIDFromEmail: query[%s]' % query)
            try:
                id, = query.one()
                if id:
                    log.debug('cache: member caching email id[%d]' % (id))
                    return id

                return None
            except NoResultFound:
                return None

        @cache_region('forever', 'm-login')
        def getIDFromLogin(login):
            session = meta.Session()
            query = session.query(cls.id)
            query = query.filter_by(login=login)
            try:
                id, = query.one()
                if id:
                    log.debug('cache: member caching login id[%d]' % (id))
                    return id

                return None
            except NoResultFound:
                return None

        @cache_region('forever', 'm-defLogin')
        def getIDFromDefaultLogin(defaultLogin):
            session = meta.Session()
            query = session.query(cls.id)
            query = query.filter_by(defaultLogin=defaultLogin)
            try:
                id, = query.one()
                if id:
                    log.debug('cache: member caching defaultLogin id[%d]' % (id))
                    return id

                return None
            except NoResultFound:
                return None

        def __merge(member, forceMerge=False):
            try:
                if member.id > 0 and not forceMerge:
                    return member
            except DetachedInstanceError:
                pass

            session = meta.Session()
            member = session.merge(member)
            if hasattr(member, 'state'):
                member.state = session.merge(member.state)
            if hasattr(member, 'lebels'):
                member.lebels = session.merge(member.lebels)
            if hasattr(member, 'ext'):
                for n in range(0, len(member.ext)):
                    member.ext[n] = session.merge(member.ext[n])
            log.debug('cache: member merged id[%d]' % (member.id))
            return member

        if action == LOAD:
            if email:
                id = getIDFromEmail(email)
                if id:
                    log.debug('cache: member cached email id[%d]' % (id))
                else:
                    region_invalidate(getIDFromEmail, 'forever', 'm-email', email)
            elif login:
                id = getIDFromLogin(login)
                if id:
                    log.debug('cache: member cached id[%d]' % (id))
                else:
                    region_invalidate(getIDFromLogin, 'forever', 'm-login', login)
            elif defaultLogin:
                id = getIDFromDefaultLogin(defaultLogin)
                if id:
                    log.debug('cache: member cached defaultLogin id[%d]' % (id))
                else:
                    region_invalidate(getIDFromDefaultLogin, 'forever', 'm-defLogin', defaultLogin)
            if id:
                #
                #  To make sure id is integer.
                #
                id = long(id)

                member = loadByID(id)
                if member:
                    member = __merge(member, forceMerge=forceMerge)
                    log.debug('cache: member cached id[%d]' % (id))
                else:
                    region_invalidate(loadByID, 'forever', 'm-id', id)
                return member
        elif action == INVALIDATE:
            if instance:
                member = instance
                region_invalidate(getIDFromEmail, 'forever', 'm-email', member.email)
                if hasattr(member, 'login'):
                    region_invalidate(getIDFromLogin, 'forever', 'm-login', member.login)
                region_invalidate(getIDFromDefaultLogin, 'forever', 'm-defLogin', member.defaultLogin)
                region_invalidate(loadByID, 'forever', 'm-id', member.id)
                log.debug('cache: member invalidated[%s]' % member.id)
                return __merge(member, forceMerge=forceMerge)

            if id:
                id = long(id)
                region_invalidate(loadByID, 'forever', 'm-id', id)
                log.debug('cache: member invalidated id[%d]' % id)

        return None

    def fix(self, session=None):
        for attr in ['givenName', 'surname', 'login', 'email']:
            if hasattr(self, attr):
                setattr(self, attr, h.encode_encrypted(getattr(self, attr)))
        if not hasattr(self, 'name'):
            self.name = ('%s %s' % (self.givenName, self.surname)).strip()
        #
        #  Make sure user set logins are in lower case.
        #
        attr = 'login'
        login = getattr(self, attr)
        if login and login != getattr(self, 'defaultLogin'):
            try:
                inSession = session is not None
                if not inSession:
                    session = meta.Session()
                    session.begin()
                query = session.query(DupLogin)
                query = query.filter_by(memberID=self.id)
                m = query.first()
                if m:
                    if login == m.login:
                        self.hasLoginConflict = True
                    else:
                        #
                        #  User has already changed the login.
                        #
                        session.delete(m)
                if not inSession:
                    session.commit()
            except Exception:
                pass
        return self

    def asDict(self, includePersonal=False, includeExt=False):
        info = {
                'email': self.email.lower(),
                'login': self.login,
                'defaultLogin': self.defaultLogin,
                'id': self.id,
            }
        hasLoginConflict = getattr(self, 'hasLoginConflict', False)
        if hasLoginConflict:
            info['hasLoginConflict'] = True
        if includePersonal:
            info['givenName'] = self.givenName
            info['surname'] = self.surname
            info['gender'] = self.gender
            info['phone'] = self.phone
            info['fax'] = self.fax
            info['website'] = self.website
            info['imageURL'] = self.imageURL
            info['creationTime'] = self.creationTime
            info['loginTime'] = self.loginTime
            info['updateTime'] = self.updateTime
            info['birthday'] = self.birthday
            if not info['givenName'] and not info['surname']:
                info['givenName'] = self.email
            info['timezone'] = self.timezone
        if includeExt:
            if not hasattr(self, 'ext'):
                session = meta.Session()
                query = session.query(MemberExtData)
                query = query.filter_by(memberID=self.id)
                self.ext = query.all()
            exts = []
            for e in self.ext:
                exts.append(e.asDict())
            info['ext'] = exts
        return info

    def infoDict(self):
        mdict = {
                'firstName': self.givenName,
                'lastName': self.surname,
                'name': ('%s %s' % (self.givenName, self.surname)).strip(),
                'email': self.email.lower(), 
                'login': self.login,
                'created': str(self.creationTime),
                'lastLogin': str(self.loginTime),
                }
        if not mdict['firstName'] and not mdict['lastName']:
            mdict['firstName'] = self.email
            mdict['name'] = self.email
        return mdict

class MemberLocation(FlxModel):
    pass

class MemberAuthType(FlxModel):
    pass

class MemberExtData(FlxModel):
    pass

class MemberRole(FlxModel):
    pass

class MemberState(FlxModel):
    pass

class MemberHasRole(FlxModel):
    pass

class Minor(FlxModel):
    pass

class MinorExtData(FlxModel):
    pass

class CampaignMember(FlxModel):
    pass

class OAuthClient(FlxModel):
    pass

class OAuthToken(FlxModel):
    pass

class UnderageEmailToken(FlxModel):
    pass

class UnderageMemberParent(FlxModel):
    pass

class USSchoolsMaster(FlxModel):
    pass

class OtherSchool(FlxModel):
    pass

class MemberSchool(FlxModel):
    pass

class Application(FlxModel):
    pass

class PartnerSchool(FlxModel):
    pass

class PartnerSchoolDistrict(FlxModel):
    pass

class PartnerSchoolHasMember(FlxModel):
    pass

class DistrictHasSchool(FlxModel):
    pass

class SchoolDistrict(FlxModel):
    pass

class AdminTrace(FlxModel):
    pass

class DupLogin(FlxModel):
    pass

TASK_STATUS_IN_PROGRESS = 'IN PROGRESS'
TASK_STATUS_PENDING = 'PENDING'
TASK_STATUS_SUCCESS = 'SUCCESS'
TASK_STATUS_FAILURE = 'FAILURE'
TASK_STATUSES = [TASK_STATUS_IN_PROGRESS, TASK_STATUS_PENDING, TASK_STATUS_SUCCESS, TASK_STATUS_FAILURE]

class Task(FlxModel):
    def asDict(self):
        taskDict = {}
        taskDict['id'] = self.id
        taskDict['name'] = self.name
        taskDict['taskID'] = self.taskID
        taskDict['status'] = self.status
        if self.owner:
            taskDict['owner'] = {
                    'id': self.owner.id,
                    'login': self.owner.login
                    }
        taskDict['message'] = self.message
        taskDict['userdata'] = self.userdata
        taskDict['hostname'] = self.hostname
        taskDict['started'] = self.started
        taskDict['updated'] = self.updated
        return taskDict

"""
    1.  Map tables to classes.
    2.  Set up one-to-one, many-to-one, and many-to-many relationships.
    3.  Add attributes converting identifiers to instances.
"""

########## Reviewed Object Table Mappings ##########

orm.mapper(MemberAuthTypeKey, meta.MemberAuthTypeKey,
           properties={
            'authType': orm.relation(MemberAuthType, lazy='joined')
           }
          )

####################################################

orm.mapper(USState, meta.USStates)
orm.mapper(ZipCode, meta.ZipCodes)
orm.mapper(Country, meta.Countries)
orm.mapper(USAddress, meta.USAddresses)
orm.mapper(WorldAddress, meta.WorldAddresses)
orm.mapper(Address, meta.Addresses,
    properties={
        'country': orm.relation(Country, uselist=False),
        'member': orm.relation(Member, uselist=False),
    }
)
orm.mapper(MemberLocation, meta.MemberLocations)
orm.mapper(MemberRole, meta.MemberRoles)
orm.mapper(MemberState, meta.MemberStates)
orm.mapper(MemberHasRole, meta.MemberHasRoles,
    properties={
        'role': orm.relation(MemberRole,
                             primaryjoin=meta.MemberRoles.c.id==meta.MemberHasRoles.c.roleID,
                             lazy='joined',
                             uselist=False),
    }
)
orm.mapper(MemberAuthType, meta.MemberAuthTypes)
orm.mapper(MemberExtData, meta.MemberExtData,
    properties={
        'authType': orm.relation(MemberAuthType, uselist=False, lazy='joined'),
    }
)
orm.mapper(Member, meta.Members,
    properties={
        'state': orm.relation(MemberState, uselist=False, lazy='select'),
        'roles': orm.relation(MemberHasRole, primaryjoin=meta.Members.c.id==meta.MemberHasRoles.c.memberID, cascade='all, delete-orphan'),
        'location': orm.relation(MemberLocation, cascade='delete'),
        'school': orm.relation(MemberSchool, cascade='delete'),
        'ext': orm.relation(MemberExtData, lazy='select', cascade='all, delete-orphan'),
    }
)
orm.mapper(Minor, meta.Minors)
orm.mapper(MinorExtData, meta.MinorExtData,
    properties={
        'guardian': orm.relation(Member, primaryjoin=meta.MinorExtData.c.guardianID == meta.Members.c.id, lazy='joined'),
        'minor': orm.relation(Minor, primaryjoin=meta.MinorExtData.c.minorID == meta.Minors.c.id, lazy='joined'),
    }
)
orm.mapper(CampaignMember, meta.CampaignMembers)
orm.mapper(OAuthClient, meta.OAuthClients,
    properties={
        'member': orm.relationship(Member, primaryjoin=meta.OAuthClients.c.memberID == meta.Members.c.id, lazy='joined'),
    }
)

orm.mapper(Task, meta.Tasks,
        properties={
            'owner': orm.relation(Member, primaryjoin=meta.Tasks.c.ownerID == meta.Members.c.id),
        }
    )

orm.mapper(OAuthToken, meta.OAuthTokens)
orm.mapper(UnderageEmailToken, meta.UnderageEmailTokens)
orm.mapper(UnderageMemberParent, meta.UnderageMemberParents)
orm.mapper(USSchoolsMaster, meta.USSchoolsMaster)
orm.mapper(OtherSchool, meta.OtherSchools)
orm.mapper(MemberSchool, meta.MemberSchools)
orm.mapper(Application, meta.Applications)
orm.mapper(PartnerSchool, meta.PartnerSchools)
orm.mapper(PartnerSchoolDistrict, meta.PartnerSchoolDistricts)
orm.mapper(PartnerSchoolHasMember, meta.PartnerSchoolHasMembers)
orm.mapper(DistrictHasSchool, meta.DistrictHasSchools)
orm.mapper(SchoolDistrict, meta.SchoolDistricts)
orm.mapper(AdminTrace, meta.AdminTraces)
orm.mapper(DupLogin, meta.DupLogins)
