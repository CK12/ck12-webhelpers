"""
    The APIs for the model. An API method cannot call other API methods. methods 
"""

import logging
from datetime import datetime
from pylons.i18n.translation import _ 
from pylons import app_globals as g

from sqlalchemy.sql import or_, and_, not_
from sqlalchemy.sql.expression import desc, asc, case
#from sqlalchemy import distinct
from sqlalchemy import event
from sqlalchemy.pool import Pool
from sqlalchemy import exc as sexc

from auth.model.utils import _transactional, _checkAttributes, _queryOne
from auth.model import meta
from auth.model import model
from auth.model import exceptions as ex
from auth.model import page as p
from auth.lib import helpers as h

log = logging.getLogger(__name__)

@event.listens_for(Pool, "checkout")
def ping_connection(dbapi_connection, connection_record, connection_proxy):
    cursor = dbapi_connection.cursor()
    try:
        cursor.execute("SELECT 1")
        log.debug("Connection is live ... %s" % (connection_proxy._pool.status()))
    except:
        # optional - dispose the whole pool
        # instead of invalidating one at a time
        # connection_proxy._pool.dispose()

        # raise DisconnectionError - pool will try
        # connecting again up to three times before raising.
        log.warn("DisconnectionError: %s" % dbapi_connection) 
        raise sexc.DisconnectionError()
    finally:
        if cursor:
            cursor.close()

class ModelError(Exception):
    pass

def connect(url=None):
    if meta.engine is None:
        from sqlalchemy import create_engine, orm

        meta.engine = create_engine(url)
        sm = orm.sessionmaker(autoflush=False,
                                autocommit=True,
                                bind=meta.engine)
        meta.Session = orm.scoped_session(sm)
    return meta.engine.connect()

"""
    Errors.
"""
def _getInstance(session, instance, instanceType, lockMode=None):
    """
        Allow the instance to be the instance object or just its identifier.

        Return the instance in any case.
    """
    if isinstance(instance, instanceType):
        return instance
    #
    #  It should be an identifier.
    #
    query = session.query(instanceType)
    query = query.filter_by(id=instance)
    if lockMode:
        query = query.with_lockmode(lockMode)
    return _queryOne(query)

def _getInstanceID(instance, instanceType):
    """
        Allow the instance to be the instance object or just its identifier.

        Return the identifier in any case.
    """
    if isinstance(instance, instanceType):
        return instance.id
    #
    #  It should be an identifier already.
    #
    return instance

def _orderBy(session, orderedList, objectList, param):
    objectDict = {}
    for obj in objectList:
        objectDict[obj[param]] = obj
    retList = []
    for item in orderedList:
        if objectDict.has_key(item):
            retList.append(objectDict[item])
    return retList

def _getUnique(session, what, term, value, func=None):
    """
        Return the instance of type `what` with `term` = `value`.
    """
    query = session.query(what)
    if what in [ model.MemberState ]:
        query = query.prefix_with('SQL_CACHE')
    if func is not None and func.__call__:
        query = func(query, 'all')
    kwargs = { term: value }
    return _queryOne(query.filter_by(**kwargs))

@_transactional()
def getUnique(session, what, term, value):
    """
        API for the internal _getUnique() method.
    """
    return _getUnique(session, what, term, value)

"""
    Member related APIs.
"""

memberSearchAttrMap = {
    'email': model.Member.email,
    'firstName': model.Member.givenName,
    'lastName': model.Member.surname,
    'lastLogin': model.Member.loginTime,
    'login': model.Member.login,
}

import copy

memberAttrMap = copy.copy(memberSearchAttrMap)
memberAttrMap.update({
    'id': model.Member.id,
    'stateID': model.Member.stateID,
    'gender': model.Member.gender,
    'suffix': model.Member.suffix,
    'title': model.Member.title,
    'phone': model.Member.phone,
    'fax': model.Member.fax,
    'website': model.Member.website,
    'creationTime': model.Member.creationTime,
    'updateTime': model.Member.updateTime,
})

memberFieldMap = {
    'firstName': 'givenName',
    'lastName': 'surname',
    'lastLogin': 'loginTime',
}

@_transactional()
def getMembers(session, idList=None, sorting=None, filterDict={}, searchDict={}, searchAll=None, pageNum=0, pageSize=0, startDate=None, endDate=None):
    """
        Return the Members, unless idList is given, in which case, only
        those in the list will be returned.
    """
    #return _getMembers(session, idList=None, sorting=None, filterDict={}, searchDict={}, searchAll=None, pageNum=0, pageSize=0, startDate=None, endDate=None)
    #Bug 57302 : Passing over received parameter values to _getMembers()
    return _getMembers(session, idList=idList, sorting=sorting, filterDict=filterDict, searchDict=searchDict,
     searchAll=searchAll, pageNum=pageNum, pageSize=pageSize, startDate=startDate, endDate=endDate)
def _getMembers(session, idList=None, sorting=None, filterDict={}, searchDict={}, searchAll=None, pageNum=0, pageSize=0, startDate=None, endDate=None):
    #
    #  Filter the Members table.
    #
    filterQuery = session.query(model.Member)
    if idList is not None and len(idList) > 0:
        filterQuery = filterQuery.filter(model.Member.id.in_(idList))

    filterKeys = filterDict.keys()
    for key in filterKeys:
        if key == 'roleID':
            if filterDict[key]:
                filterQuery = filterQuery.join(model.MemberHasRole, model.Member.id == model.MemberHasRole.memberID)
                filterQuery = filterQuery.filter(model.MemberHasRole.roleID == int(filterDict[key]))

    if searchDict is not None and len(searchDict) > 0:
        searchKeys = searchDict.keys()
        for key in searchKeys:
            attr = memberSearchAttrMap.get(key)
            if not attr:
                name = memberFieldMap.get(key, key)
                kwargs = { name : searchDict[key] }
                filterQuery = filterQuery.filter_by(**kwargs)
            else:
                filterQuery = filterQuery.filter(attr == searchDict[key])
    elif searchAll:
        filterQuery = filterQuery.filter(or_(
                                            model.Member.email == searchAll.lower().strip(),
                                            model.Member.givenName == searchAll,
                                            model.Member.surname == searchAll,
                                            model.Member.login == searchAll.lower().strip()
                                        ))

    if startDate and endDate:
        filterQuery = filterQuery.filter(and_(model.Member.creationTime >= startDate, model.Member.creationTime <= endDate))
    #
    #  Sort the filtered results.
    #
    sq = filterQuery.subquery()
    query = session.query(model.Member).select_entity_from(sq)
    if sorting is None or len(sorting) == 0:
        field = 'login'
        order = 'asc'
    else:
        sList = sorting.split(',')
        field = sList[0]
        order = sList[1] if len(sList) > 1 else 'asc'
    attribute = memberAttrMap.get(field)
    if attribute is None:
        raise ex.InvalidArgumentException((_(u'Invalid sorting field: %(field)s')  % {"field":field}).encode("utf-8"))
    if order == 'asc':
        query = query.order_by(asc(attribute))
    else:
        query = query.order_by(desc(attribute))

    log.debug('getMembers: query[%s]' % query)
    page = p.Page(query, pageNum, pageSize, tableName='Members')
    return page

def _getAllMembers(session, pageNum=0, pageSize=0):
    query = session.query(model.Member)
    query = query.order_by(model.Member.id.asc())
    return p.Page(query, pageNum, pageSize)

@_transactional()
def getMember(session, id=None, login=None, email=None):
    return _getMember(session, id=id, login=login, email=email)

def _getMember(session, id=None, login=None, email=None):
    member = None
    if id:
        member = _getMemberByID(session, id=id)
        if not member:
            member = _getMemberByLogin(session, login=str(id))
        if not member:
            member = _getMemberByEmail(session, email=str(id))
    if not member and login:
        member = _getMemberByLogin(session, login=login)
    if not member and email:
        member = _getMemberByEmail(session, email=email)
    return member

@_transactional()
def getMemberByID(session, id):
    return _getMemberByID(session, id)

def _getMemberByID(session, id):
    """
        Return the Member that matches the given identifier.
    """
    log.debug('getMemberByID id[%s]' % id)
    try:
        id = long(id)
        #return model.Member.cache(action=model.LOAD, id=id)
        query = session.query(model.Member)
        query = query.filter_by(id=id)
        member = _queryOne(query)
        if member:
            member = member.fix(session=session)
        return member
    except ValueError:
        return None

@_transactional()
def getMemberByEmail(session, email):
    return _getMemberByEmail(session, email)

def _getMemberByEmail(session, email):
    """
        Return the Member that matches the given email address.
    """
    #return model.Member.cache(action=model.LOAD, email=email)
    query = session.query(model.Member)
    query = query.filter_by(email=email.lower().strip())
    member = _queryOne(query)
    if member:
        member = member.fix(session=session)
    return member

@_transactional()
def getMemberByLogin(session, login):
    return _getMemberByLogin(session, login)

def _getMemberByLogin(session, login):
    """
        Return the Member that matches the given login.
    """
    if login:
        login = login.strip()
    if not login:
        return None

    #log.debug('getMemberByLogin login[%s]' % login)
    ## Bug #52566 - Do not make an OR query - since different accounts can exist for login and login.lower()
    #query = query.filter(or_(model.Member.login == login, model.Member.login == login.lower()))
    member = _queryOne(session.query(model.Member).filter(model.Member.login == login))
    if not member and login != login.lower():
        member = _queryOne(session.query(model.Member).filter(model.Member.login == login.lower()))
    if member:
        member = member.fix(session=session)
    else:
        member = _getMemberByDefaultLogin(session, login)
    return member

@_transactional()
def getMemberByDefaultLogin(session, login):
    return _getMemberByDefaultLogin(session, login)

def _getMemberByDefaultLogin(session, login):
    """
        Return the member that matches the given defaultLogin
    """
    #return model.Member.cache(action=model.LOAD, defaultLogin=login)
    query = session.query(model.Member)
    query = query.filter_by(defaultLogin=login.strip())
    member = _queryOne(query)
    if member:
        member = member.fix(session=session)
    return member

def _getMemberByLoginOrDefaultLogin(session, login):
    member = _getMemberByLogin(session, login)
    if not member:
        member = _getMemberByDefaultLogin(session, login)
    return member

@_transactional()
def getMemberExtData(session, authTypeID=None, token=None, externalID=None, memberID=None):
    return _getMemberExtData(session, authTypeID=authTypeID, token=token, externalID=externalID, memberID=memberID)

def _getMemberExtData(session, authTypeID=None, token=None, externalID=None, memberID=None):
    """
        Return the memberExtData instance that matches the given
        authTypeID and token or externalID.
    """
    query = session.query(model.MemberExtData)
    if authTypeID:
        query = query.filter_by(authTypeID=authTypeID)
    if token:
        query = query.filter_by(token=token)
    if memberID:
        query = query.filter_by(memberID=memberID)
    if externalID:
        query = query.filter_by(externalID=externalID)
    if token or (externalID and authTypeID):
        return _queryOne(query)

    return query.all()

def _getMemberHasRoles(session, memberID, roleID=None):
    query = session.query(model.MemberHasRole)
    query = query.filter_by(memberID=memberID)
    if roleID:
        query = query.filter_by(roleID=roleID)
        return _queryOne(query)
    else:
        query = query.order_by(model.MemberHasRole.roleID)
        return query.all()

@_transactional()
def getMemberHasRoles(session, memberID, roleID=None):
    """
        Return the MemberHasRoles for the given member identified by memberID.
    """
    return _getMemberHasRoles(session, memberID, roleID=roleID)

def _getMemberRoles(session, idList=None, pageNum=0, pageSize=0):
    query = session.query(model.MemberRole)
    query = query.prefix_with('SQL_CACHE')
    if idList is not None and len(idList) > 0:
        query = query.filter(model.MemberRole.id.in_(idList))
    page = p.Page(query, pageNum, pageSize)
    return page

@_transactional()
def getMemberRoles(session, idList=None, pageNum=0, pageSize=0):
    """
        Return the MemberRoles, unless idList is given, in which case, only
        those in the list will be returned.
    """
    return _getMemberRoles(session, idList, pageNum, pageSize)

@_transactional()
def getMemberRoleIDByName(session, name):
    """
        Returns the Member role's id given the name
    """
    return _getMemberRoleIDByName(session, name)

def _getMemberRoleIDByName(session, name):
    memberRoles = _getMemberRoles(session)
    memberRoleID = None
    for eachMemberRole in memberRoles:
        if eachMemberRole.name == name:
            memberRoleID = eachMemberRole.id
            break
    return memberRoleID

@_transactional()
def getMemberRole(session, roleID):
    return _getMemberRole(session, roleID)

def _getMemberRole(session, roleID):
    return _getUnique(session, model.MemberRole, 'id', roleID)

@_transactional()
def deleteMemberRoles(session, memberID):
    _deleteMemberRoles(session, memberID)

def _deleteMemberRoles(session, memberID):
    if memberID is None:
        raise ex.InvalidArgumentException((_(u'Invalid argument %(memberID)s')  % {"memberID":memberID}).encode("utf-8"))
    roles = _getMemberHasRoles(session, memberID)
    member = _getMemberByID(session, memberID)
    _invalidateMember(member, forceMerge=True)
    for role in roles:
        log.info('Deleting Role %s' % role)
        session.delete(role)

@_transactional()
def getAdminTraces(session, memberID=None, adminID=None, pageNum=0, pageSize=0):
    return _getAdminTraces(session, memberID=memberID, adminID=adminID, pageNum=pageNum, pageSize=pageSize)

def _getAdminTraces(session, memberID=None, adminID=None, pageNum=0, pageSize=0):
    """
        Return the qualified admin trace records.
    """
    log.debug('getAdminTraces memberID[%s]' % memberID)
    log.debug('getAdminTraces adminID[%s]' % adminID)
    query = session.query(model.AdminTrace)
    if memberID:
        query = query.filter_by(memberID=memberID)
    if adminID:
        query = query.filter_by(adminID=adminID)
    page = p.Page(query, pageNum, pageSize)
    return page

@_transactional()
def getMemberTimezone(session, memberID):
    return _getMemberTimezone(session, memberID)

def _getMemberTimezone(session, memberID):
    """
        Return the member timezone.
    """
    member = _getMemberByID(session, id=memberID)
    return member.timezone

@_transactional()
def setMemberTimezone(session, memberID, timezone):
    return _setMemberTimezone(session, memberID, timezone)

def _setMemberTimezone(session, memberID, timezone):
    """
        set the member timezone.
    """
    member = _getMemberByID(session, id=memberID)
    member = _invalidateMember(member, forceMerge=True)
    member.timezone = timezone
    session.add(member)
    return member.timezone

@_transactional()
def getMemberLocation(session, memberID):
    return _getMemberLocation(session, memberID)

def _getMemberLocation(session, memberID):
    """
        Return the MemberLocation instance.
    """
    query = session.query(model.MemberLocation)
    query = query.filter_by(memberID=memberID)
    query = query.order_by(model.MemberLocation.countryID)
    locations = query.all()
    if len(locations) == 0:
        return None
    return locations[0]

@_transactional()
def getMemberLocations(session, memberID):
    return _getMemberLocations(session, memberID)

def _getMemberLocations(session, memberID):
    """
        Return the MemberLocation instances.
    """
    query = session.query(model.MemberLocation)
    query = query.filter_by(memberID=memberID)
    query = query.order_by(model.MemberLocation.countryID)
    return query.all()

@_transactional()
def getMemberState(session, id=None, name=None):
    return _getMemberStates(session, id=id, name=name)

def _getMemberState(session, id=None, name=None):
    query = session.query(model.MemberState)
    query = query.prefix_with('SQL_CACHE')
    if id:
        query = query.filter_by(id=id)
    elif name:
        query = query.filter_by(name=name)
    else:
        return None

    return query.first()


@_transactional()
def getMemberStates(session, pageNum=0, pageSize=0):
    return _getMemberStates(session, pageNum=pageNum, pageSize=pageSize)

def _getMemberStates(session, pageNum=0, pageSize=0):
    """
        Return the different states a member account could belong to.
    """
    query = session.query(model.MemberState)
    query = query.prefix_with('SQL_CACHE')
    page = p.Page(query, pageNum, pageSize)
    return page

@_transactional()
def getMemberAuthTypeByName(session, name):
    return _getMemberAuthTypeByName(session, name)

def _getMemberAuthTypeByName(session, name):
    """
        Return the authentication type identified by name.
    """
    query = session.query(model.MemberAuthType)
    query = query.filter_by(name=name)
    query = query.prefix_with('SQL_CACHE')
    return _queryOne(query)

@_transactional()
def getMemberAuthTypes(session):
    return _getMemberAuthTypes(session)

def _getMemberAuthTypes(session):
    """
        Return the authentication types supported by CK-12.
    """
    query = session.query(model.MemberAuthType)
    query = query.prefix_with('SQL_CACHE')
    return query.all()

@_transactional()
def getMinorByID(session, id):
    """
        Return the Minor instance.
    """
    query = session.query(model.Minor)
    query = query.filter_by(id=id)
    return _queryOne(query)

@_transactional()
def getMinorByLogin(session, login):
    """
        Return the MinorExtData instance.
    """
    query = session.query(model.MinorExtData)
    query = query.filter_by(login=login.strip())
    return _queryOne(query)

@_transactional()
def getMinors(session, guardianID=None):
    """
        Return the MinorExtData instances of the guardian
        identified by guardianID.
    """
    query = session.query(model.MinorExtData)
    query = query.filter_by(guardianID=guardianID)
    return query.all()

@_transactional()
def getCampaignMembers(session, campaignID=None, memberID=None):
    """
        Return the CampaignMember instance(s) that match.
    """
    query = session.query(model.CampaignMember)
    if campaignID:
        query = query.filter_by(campaignID=campaignID)
    else:
        query = query.order_by(campaignID)
    if memberID:
        query = query.filter_by(memberID=memberID)
    else:
        query = query.order_by(memberID)
    return query.all()

@_transactional()
def getZipCodeInfo(session, zip=None, city=None, state=None):
   return _getZipCodeInfo(session, zip=zip, city=city, state=state)

def _getZipCodeInfo(session, zip=None, city=None, state=None):
    query = session.query(model.ZipCode)
    query = query.prefix_with('SQL_CACHE')
    if zip:
        query = query.filter_by(zipCode=zip)
    if city:
        query = query.filter_by(city=city)
    if state:
        query = query.filter_by(state=state)
    zipCodes = query.all()
    return zipCodes

@_transactional()
def getWorldAddress(session, id):
   return _getWorldAddress(session, id)

def _getWorldAddress(session, id):
    """
        Return the WorldAddress instance that matches the given id.
    """
    query = session.query(model.WorldAddress)
    query = query.filter_by(id=id)
    return _queryOne(query)

@_transactional()
def getUSAddress(session, id):
   return _getUSAddress(session, id)

def _getUSAddress(session, id):
    """
        Return the USAddress instance that matches the given id.
    """
    query = session.query(model.USAddress)
    query = query.filter_by(id=id)
    return _queryOne(query)

@_transactional()
def getUSState(session, abbreviation):
    """
        Return the USState that matches the given state
        abbrevation.
    """
    query = session.query(model.USState)
    query = query.prefix_with('SQL_CACHE')
    query = query.filter(model.USState.abbreviation.ilike(abbreviation))
    return _queryOne(query)

@_transactional()
def getUSStates(session):
    return _getUSStates(session)

def _getUSStates(session):
    """
        Return all the USState instances.
    """
    query = session.query(model.USState)
    query = query.prefix_with('SQL_CACHE')
    query = query.order_by(model.USState.name)
    return query.all()

@_transactional()
def getCountries(session):
    return _getCountries(session)

def _getCountries(session):
    """
        Return all the Country instances.
    """
    query = session.query(model.Country)
    query = query.prefix_with('SQL_CACHE')
    query = query.order_by(model.Country.id)
    return query.all()

@_transactional()
def getPartnerSchool(session,siteID=None, partnerSchoolID=None):
    """
        get a PartnerSchool instance.
    """
    return _getPartnerSchool(session, siteID=siteID, partnerSchoolID=partnerSchoolID)

def _getPartnerSchool(session, siteID=None, partnerSchoolID=None):
    """
        get a PartnerSchool instance.
    """
    query = session.query(model.PartnerSchool)
    if siteID:
        query = query.filter_by(siteID=siteID)
    if partnerSchoolID:
        query = query.filter_by(partnerSchoolID=partnerSchoolID)
    return query.all()

@_transactional()
def getPartnerSchoolDistrict(session, siteID=None, partnerDistrictID=None):
    """
        get a PartnerSchoolDistrict instance.
    """
    return _getPartnerSchoolDistrict(session, siteID= siteID, partnerDistrictID=partnerDistrictID)

def _getPartnerSchoolDistrict(session, siteID=None, partnerDistrictID=None):
    """
        get a PartnerSchoolDistrict instance.
    """
    query = session.query(model.PartnerSchoolDistrict)
    if siteID is not None:
        query = query.filter_by(siteID=siteID)
    if partnerDistrictID is not None:
        query = query.filter_by(partnerDistrictID=partnerDistrictID)
    return query.all()

@_transactional()
def getDistrictHasSchools(session, districtID=None, schoolID=None):
    """
        get a DistrictHasSchools instance.
    """
    return _getDistrictHasSchools(session, districtID= districtID, schoolID=schoolID)

def _getDistrictHasSchools(session, districtID=None, schoolID=None):
    """
        get a PartnerSchoolDistrict instance.
    """
    query = session.query(model.DistrictHasSchool)
    if districtID is not None:
        query = query.filter_by(districtID=districtID)
    if schoolID is not None:
        query = query.filter_by(schoolID=schoolID)
    return query.all()

@_transactional()
def createDistrictHasSchool(session, districtID, schoolID):
    """
        create new DistrictHasSchools entry.
    """
    return _createDistrictHasSchool(session, districtID= districtID, schoolID=schoolID)

def _createDistrictHasSchool(session, districtID, schoolID):
    """
        create new DistrictHasSchools entry.
    """
    districtHasSchool = model.DistrictHasSchool(districtID=districtID, schoolID=schoolID)
    session.add(districtHasSchool)
    return districtHasSchool

@_transactional()
def getPartnerSchoolHasMember(session, memberID=None, roleID=None, siteID=None, partnerSchoolID=None):
    """
        get a PartnerSchoolHasMember instance.
    """
    return _getPartnerSchoolHasMember(session, memberID=memberID, roleID=roleID, siteID=siteID, partnerSchoolID=partnerSchoolID)

def _getPartnerSchoolHasMember(session, memberID=None, roleID=None, siteID=None, partnerSchoolID=None):
    """
        get a PartnerSchoolHasMember instance.
    """
    query = session.query(model.PartnerSchoolHasMember)
    if memberID:
        query = query.filter_by(memberID=memberID)
    if roleID:
        query = query.filter_by(roleID=roleID)
    if siteID:
        query = query.filter_by(siteID=siteID)
    if partnerSchoolID:
        query = query.filter_by(partnerSchoolID=partnerSchoolID)
    return query.all()

@_transactional()
def getSchoolDistrictbyName(session, name):
    """
        get a SchoolDistrict by name.
    """
    return _getSchoolDistrictbyName(session, name=name)

def _getSchoolDistrictbyName(session, name):
    """
        get a SchoolDistrict by name.
    """
    query = session.query(model.SchoolDistrict)
    query = query.filter_by(name=name)
    return _queryOne(query)

@_transactional()
def createSchoolDistrict(session, **kwargs):
    """
        get a SchoolDistrict by name.
    """
    return _createSchoolDistrict(session, **kwargs)

def _createSchoolDistrict(session, **kwargs):
    """
        get a SchoolDistrict by name.
    """
    schoolDistrict = model.SchoolDistrict(name=kwargs['name'])
    session.add(schoolDistrict)
    return schoolDistrict

@_transactional()
def activateMember(session, id):
    """
        Activate the member identified by id.
    """
    member = _getMember(session, id=id)
    if member is None:
        return None, False

    activated = 'activated'
    alreadyActivated = (member.state.name == activated)
    if not alreadyActivated:
        #log.info('Activating member[%s]' % member)
        member = _invalidateMember(member, forceMerge=True)
        activateState = _getUnique(session, model.MemberState, 'name', activated)
        member.stateID = activateState.id
        session.add(member)
    return member, alreadyActivated

@_transactional()
def deactivateMember(session, id):
    """
        Deactivate the member identified by id.
    """
    member = _getMember(session, id=id)
    if member is None:
        return None

    deactivated = 'deactivated'
    alreadyDeactivated = (member.state.name == deactivated)
    if not alreadyDeactivated:
        #log.info('Deactivating member[%s]' % member)
        member = _invalidateMember(member, forceMerge=True)
        deactivateState = _getUnique(session, model.MemberState, 'name', deactivated)
        member.stateID = deactivateState.id
        session.add(member)
    return member

@_transactional()
def disableMember(session, id):
    """
        Deactivate the member identified by id.
    """
    member = _getMember(session, id=id)
    if member is None:
        return None

    disabled = 'disabled'
    alreadyDeactivated = (member.state.name == disabled)
    if not alreadyDeactivated:
        #log.info('Disabling member[%s]' % member)
        member = _invalidateMember(member, forceMerge=True)
        disableState = _getUnique(session, model.MemberState, 'name', disabled)
        member.stateID = disableState.id
        session.add(member)
    return member

"""
    Deletion related APIs.
"""

@_transactional()
def delete(session, instance):
    _delete(session, instance)

def _delete(session, instance):
    """
        Delete the given instance.
    """
    if hasattr(instance.__class__, 'cache'):
        instance = instance.cache(action=model.INVALIDATE, instance=instance)
    session.delete(instance)

def _deleteMember(session, member):
    """
        Delete the given Member.
    """
    member = _invalidateMember(member, forceMerge=True)
    session.delete(member)

@_transactional()
def deleteMember(session, member):
    """
        Delete the given Member.
    """
    _deleteMember(session, member)

@_transactional()
def deleteMemberByLogin(session, login):
    """
        Delete the Member that matches the login.
    """
    query = session.query(model.Member)
    member = _queryOne(query.filter_by(login=login.strip()))
    if member:
        _deleteMember(session, member)
    else:
        member = _queryOne(query.filter_by(login=login.lower().strip()))
        if member:
            _deleteMember(session, member)
    return member

@_transactional()
def deleteMemberByID(session, id):
    """
        Delete the Member that matches the given identifier.
    """
    try:
        id = long(id)
        query = session.query(model.Member)
        member = _queryOne(query.filter_by(id=id))
        if member is not None:
            _deleteMember(session, member)
        return member
    except ValueError:
        return None

"""
    Creation realated APIs.
"""

def _create(session, what, **kwargs):
    instance = what(**kwargs)
    session.add(instance)
    return instance

@_transactional()
def create(session, what, **kwargs):
    return _create(session, what, **kwargs)

def _createMemberAuthType(session, name, description=None):
    """
        Create a MemberAuthType instance.
    """
    authType = model.MemberAuthType(name=name, description=description)
    session.add(authType)
    session.flush()
    #
    #  Invalidate cache.
    #
    g.getMemberAuthTypes(session=session, nocache=True)
    g.getMemberAuthTypeNames(session=session, nocache=True)
    return authType

@_transactional()
def createMemberAuthType(session, name, description=None):
    return _createMemberAuthType(session, name=name, description=description)

def _createMemberExtData(session, memberID, authTypeID, token, verified, externalID=None, reset=False):
    """
        Create a MemberExtData instance.
    """
    if externalID:
        query = session.query(model.MemberExtData)
        query = query.filter_by(authTypeID = authTypeID)
        query = query.filter_by(externalID = externalID)
        query = query.filter(model.MemberExtData.memberID != memberID)
        extData = query.first()
        if extData:
            raise ex.AlreadyExistsException((_(u'Email, %(email)s, exists already.')  % {"email":externalID}).encode("utf-8"))
    extData = model.MemberExtData(memberID=memberID,
                                  authTypeID=authTypeID,
                                  token=token,
                                  externalID=externalID,
                                  verified=verified,
                                  reset=reset,
                                  loginCount=0,
                                  updateTime=datetime.now())
    session.add(extData)
    return extData

@_transactional()
def createMemberExtData(session, memberID, authTypeID, token, verified, externalID=None, reset=False):
    """
        Create a MemberExtData instance.
    """
    return _createMemberExtData(session, memberID, authTypeID, token, verified, externalID=externalID, reset=reset)

def _remove_member_ext_data(session, memberID, authTypeID):
    """
        Delete a MemberExtData instance.
    """
    
    query = session.query(model.MemberExtData)
    query = query.filter_by(memberID=memberID,authTypeID=authTypeID)
    query.delete()    
    return True

@_transactional()
def remove_member_ext_data(session, memberID, authTypeID):
    """
        Delete a MemberExtData instance.
    """
    return _remove_member_ext_data(session, memberID, authTypeID)


def validateEmail(email):
    import re

    regex =  r'(^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)'
    if not re.match(regex, email):
        raise ex.InvalidEmailException((_(u'Invalid email syntax: %(email)s')  % {"email":email}).encode("utf-8"))

@_transactional()
def createMember(session, **kwargs):
    return _createMember(session, **kwargs)

def _createMember(session, **kwargs):
    """
        Create a Member instance.
    """
    _checkAttributes([ 'givenName', 'email', 'authTypeID', 'token', 'roleID'], **kwargs)
    email = kwargs['email']
    email = email.lower().strip()
    emailIsFake = kwargs.get('emailIsFake', False)
    if not emailIsFake:
        validateEmail(email)
    kwargs['email'] = email
    token = kwargs['token']
    del kwargs['token']
    #
    #  See if the member already exists via external login.
    #
    if not kwargs.has_key('emailVerified'):
        kwargs['emailVerified'] = True
    emailVerified = kwargs['emailVerified']
    exist = False
    if not emailVerified:
        query = session.query(model.Member)
        query = query.filter_by(email=email)
        member = _queryOne(query)
        if member is not None:
            exist = True

    login = kwargs.get('login')
    kwargs['updateTime'] = datetime.now()
    authTypeID = kwargs['authTypeID']
    del kwargs['authTypeID']
    if exist:
        if login:
            login = login.lower().strip()
            if len(login) > 0:
                member.login = login
        member.givenName = kwargs['givenName']
        surname = kwargs.get('surname', None)
        if surname is not None:
            member.surname = surname
        session.add(member)
    else:
        if not kwargs.has_key('defaultLogin'):
            original = h.genURLSafeBase64Encode(email, usePrefix=False)
            defaultLogin = original
            unique = False
            seq = 1
            while not unique:
                query = session.query(model.Member)
                query = query.filter_by(defaultLogin=defaultLogin)
                member = _queryOne(query)
                if member is None:
                    break
                defaultLogin = '%s-%d' % (original, seq)
                seq += 1
            kwargs['defaultLogin'] = defaultLogin.lower()

        if login:
            login = login.lower().strip()
            kwargs['login'] = login
        else:
            kwargs['login'] = kwargs['defaultLogin']
        kwargs['creationTime'] = datetime.now()
        kwargs['isProfileUpdated'] = kwargs.get('isProfileUpdated', False)
        kwargs['licenseAcceptedTime'] = kwargs['creationTime']
        member = model.Member(**kwargs)
        member.ext = []
        session.add(member)
        session.flush()

    reset = kwargs.get('reset', False)
    externalID = kwargs.get('externalID', None)
    extData = _createMemberExtData(session, member.id, authTypeID, token, emailVerified, externalID=externalID, reset=reset)
    member.ext.append(extData)

    stateID = kwargs.get('stateID', None)
    if stateID:
        member.state = _getMemberState(session, id=stateID)
    roleID = kwargs['roleID']
    if roleID and roleID != 'None':
        roleID = long(roleID)
        d = { 'memberID': member.id, 'roleID': roleID }
        mhr = _create(session, model.MemberHasRole, **d)
        log.debug('_createMember: mhr[%s]' % mhr)
    if email.endswith('@ck12.org'):
        query = session.query(model.MemberRole)
        query = query.prefix_with('SQL_CACHE')
        query = query.filter_by(name='internal-user')
        iu = query.one()
        d = { 'memberID': member.id, 'roleID': iu.id }
        mhr = _create(session, model.MemberHasRole, **d)
        log.debug('_createMember: mhr[%s]' % mhr)

    return member

@_transactional()
def createPartnerSchool(session, **kwargs):
    """
        Create a PartnerSchool instance.
    """
    return _createPartnerSchool(session, **kwargs)

def _createPartnerSchool(session, **kwargs):
    """
        Create a PartnerSchool instance.
    """
    partnerSchool = _create(session, model.PartnerSchool, **kwargs)
    return partnerSchool

@_transactional()
def createPartnerSchoolDistrict(session, **kwargs):
    """
        Create a PartnerSchoolDistrict instance.
    """
    return _createPartnerSchoolDistrict(session, **kwargs)

def _createPartnerSchoolDistrict(session, **kwargs):
    """
        Create a PartnerSchoolDistrict instance.
    """
    partnerSchoolDistrict = _create(session, model.PartnerSchoolDistrict, **kwargs)
    return partnerSchoolDistrict

@_transactional()
def createPartnerSchoolHasMember(session, **kwargs):
    """
        Create a PartnerSchoolHasMember instance.
    """
    return _createPartnerSchoolHasMember(session, **kwargs)

def _createPartnerSchoolHasMember(session, **kwargs):
    """
        Create a PartnerSchoolHasMember instance.
    """
    partnerSchoolHasMember = _create(session, model.PartnerSchoolHasMember, **kwargs)
    return partnerSchoolHasMember

@_transactional()
def newMemberLocation(session, **kwargs):
    """
        Create a transient MemberLocation instance.
    """
    return _newMemberLocation(session, **kwargs)

def _newMemberLocation(session, **kwargs):
    """
        Create a transient MemberLocation instance.
    """
    _checkAttributes(['memberID','countryID', 'addressID'], **kwargs)
    location = model.MemberLocation(**kwargs)
    return location

@_transactional()
def newWorldAddress(session, **kwargs):
    """
        Create a transient WorldAddress instance.
    """
    return _newWorldAddress(session, **kwargs)

def _newWorldAddress(session, **kwargs):
    worldAddress = model.WorldAddress(**kwargs)
    return worldAddress

@_transactional()
def newUSAddress(session, **kwargs):
    """
        Create a transient USAddress instance.
    """
    return _newUSAddress(session, **kwargs)

def _newUSAddress(session, **kwargs):
    """
        Create a transient USAddress instance.
    """
    usAddress = model.USAddress(**kwargs)
    return usAddress

"""
    Cache related.
"""

@_transactional()
def merge(session, instance):
    return _merge(session, instance)

def _merge(session, instance):
    return session.merge(instance)

def _invalidateMember(member=None, id=None, forceMerge=False):
    #
    #  Invalidate email.
    #
    #return model.Member.cache(action=model.INVALIDATE, instance=member, id=id, forceMerge=forceMerge)
    return member

"""
    Update related APIs.
"""

@_transactional()
def update(session, instance):
    return _update(session, instance)

def _update(session, instance):
    if hasattr(instance.__class__, 'cache'):
        instance = instance.cache(action=model.INVALIDATE, instance=instance)
        instance = session.merge(instance)
    session.add(instance)


@_transactional()
def updateMember(session,
                 member,
                 roleID=None,
                 existLocation=None,
                 existAddress=None,
                 countryID=None,
                 address=None,
                 imageURL=None,
                 existSchool=None,
                 school=None,
                 schoolType=None,
                 adminID=None):
    return _updateMember(session,
                         member,
                         roleID=roleID,
                         existLocation=existLocation,
                         existAddress=existAddress,
                         countryID=countryID,
                         address=address,
                         imageURL=imageURL,
                         existSchool=existSchool,
                         school=school,
                         schoolType=schoolType,
                         adminID=adminID)

def _updateMember(session,
                  member,
                  roleID=None,
                  existLocation=None,
                  existAddress=None,
                  countryID=None,
                  address=None,
                  imageURL=None,
                  existSchool=None,
                  school=None,
                  schoolType=None,
                  adminID=None):
    """
        Update a Member instance.
    """
    member = _invalidateMember(member, forceMerge=True)
    member.updateTime = datetime.now()
    if imageURL: # TODO: Determine a way to unset the value
        member.imageURL = imageURL
    session.add(member)
    log.debug('Updated [%s]' % member.id)
    if roleID is not None:
        roleID = long(roleID)
        query = session.query(model.MemberHasRole)
        query = query.filter_by(memberID=member.id)
        roles = query.all()
        roleDict = {}
        if roles:
            for role in roles:
                roleDict[role.roleID] = role
        if not roleDict.has_key(roleID):
            d = { 'memberID': member.id, 'roleID': roleID }
            _create(session, model.MemberHasRole, **d)
            if roleID == 1:
                if not adminID:
                    adminID = member.id
                d = { 'memberID': member.id, 'adminID': adminID, 'state': 'on' }
                _create(session, model.AdminTrace, **d)
        if roleID == 5:
            teacher = roleDict.get(7)
            if teacher:
                session.delete(teacher)
        elif roleID == 7:
            student = roleDict.get(5)
            if student:
                session.delete(student)
        if roleID == 5 or roleID == 7:
            member_role = roleDict.get(13)
            if member_role:
                session.delete(member_role)

    if existLocation is not None:
        if countryID is None:
            session.add(existLocation)
        else:
            session.delete(existLocation)
    if existAddress is not None:
        if address is None:
            session.add(existAddress)
        else:
            session.delete(existAddress)
    if address is not None:
        session.add(address)
        if countryID is not None:
            session.flush()
            location = _newMemberLocation(session, memberID=member.id,
                                          countryID=countryID,
                                          addressID=address.id)
            session.add(location)

    if existSchool is not None:
        session.delete(existSchool)
        session.flush()
    if schoolType is not None:
        schoolID = 0
        if school is not None:
            session.add(school)
            schoolID = school.id
        mschool = _newMemberSchool(session, memberID=member.id, schoolID=schoolID, schoolType=schoolType)
	session.add(mschool)
        session.flush()

    return member

@_transactional()
def updatePartnerSchool(session, **kwargs):
    """
        update a PartnerSchool instance.
    """
    return _updatePartnerSchool(session, **kwargs)

def _updatePartnerSchool(session, **kwargs):
    """
        update a PartnerSchool instance.
    """
    partnerSchool = _getPartnerSchool(session, kwargs['siteID'],kwargs['partnerSchoolID'])
    if not partnerSchool:
        raise Exception('No record found for siteID:%s or  partnerSchoolID:%s in partnerSchool' % (kwargs['siteID'],kwargs['partnerSchoolID']))
    partnerSchool = partnerSchool[0]
    if kwargs.has_key('partnerDistrictID'):
        partnerSchool.partnerDistrictID = kwargs['partnerDistrictID']
    if kwargs.has_key('schoolID'):
        partnerSchool.schoolID = kwargs['schoolID']
    session.add(partnerSchool)
    return partnerSchool

@_transactional()
def updatePartnerSchoolDistrict(session, **kwargs):
    """
        update a PartnerSchoolDistrict instance.
    """
    return _updatePartnerSchoolDistrict(session, **kwargs)

def _updatePartnerSchoolDistrict(session, **kwargs):
    """
        update a PartnerSchoolDistrict instance.
    """
    partnerSchoolDistrict = _getPartnerSchoolDistrict(session, kwargs['siteID'],kwargs['partnerDistrictID'])
    if not partnerSchoolDistrict:
        raise Exception('No record found for siteID:%s ,partnerDistrictID:%s in partnerSchoolDistrict' % 
                        (kwargs['siteID'],kwargs['partnerDistrictID']))
    partnerSchoolDistrict = partnerSchoolDistrict[0]
    if kwargs.has_key('districtID'):
        partnerSchoolDistrict.districtID = kwargs['districtID']
    if kwargs.has_key('tokenID'):
        partnerSchoolDistrict.tokenID = kwargs['tokenID']
    session.add(partnerSchoolDistrict)
    return partnerSchoolDistrict

@_transactional()
def updatePartnerSchoolHasMember(session, **kwargs):
    """
        update a PartnerSchoolHasMember instance.
    """
    return _updatePartnerSchoolHasMember(session, **kwargs)

def _updatePartnerSchoolHasMember(session, **kwargs):
    """
        update a PartnerSchoolHasMember instance.
    """
    partnerSchoolHasMember = _getPartnerSchoolHasMember(session, kwargs['memberID'],kwargs['roleID'],kwargs['siteID'],kwargs['partnerSchoolID'])
    if not partnerSchoolHasMember:
        raise Exception('No record found for memberID:%s ,roleID:%s ,siteID:%s ,partnerSchoolID:%s in partnerSchoolHasMember' % 
                        (kwargs['memberID'],kwargs['roleID'],kwargs['siteID'],kwargs['partnerSchoolID']))
    partnerSchoolHasMember = partnerSchoolHasMember[0]
    if kwargs.has_key('partnerSysID'):
        partnerSchoolHasMember.partnerSysID = kwargs['partnerSysID']
    if kwargs.has_key('partnerMemberID'):
        partnerSchoolHasMember.partnerMemberID = kwargs['partnerMemberID']
    session.add(partnerSchoolHasMember)
    return partnerSchoolHasMember

"""
    OAuth related APIs.
"""

@_transactional()
def getOAuthClientByID(session, id):
    query = session.query(model.OAuthClient)
    query = query.filter_by(id=id)
    return _queryOne(query)

@_transactional()
def getOAuthClientBySecret(session, secret):
    query = session.query(model.OAuthClient)
    query = query.filter_by(secret=secret)
    return _queryOne(query)

@_transactional()
def getOAuthClientByName(session, name):
    query = session.query(model.OAuthClient)
    query = query.filter_by(name=name)
    return _queryOne(query)

@_transactional()
def getOAuthClientByMember(session, memberID):
    query = session.query(model.OAuthClient)
    query = query.filter_by(memberID=memberID)
    return _queryOne(query)

@_transactional()
def getOAuthToken(session, token):
    query = session.query(model.OAuthToken)
    query = query.filter_by(token=token)
    return _queryOne(query)

@_transactional()
def getOAuthTokenByNonce(session, nonce):
    query = session.query(model.OAuthToken)
    query = query.filter_by(nonce=nonce)
    query = query.order_by(model.OAuthToken.timestamp.desc())
    return query.first()

@_transactional()
def getApplications(session, appName, siteID, providerID, key, secret, pageNum=1, pageSize=10):
    return _getApplications(session, providerID, siteID, appName, key, secret, pageNum, pageSize)

def _getApplications(session, providerID=None, siteID=None, appName=None, key=None, secret=None, pageNum=1, pageSize=10):
    query = session.query(model.Application)
    if providerID:
	query = query.filter_by(providerID=providerID)
    if siteID:
	query = query.filter_by(siteID=siteID)
    if appName:
        query = query.filter_by(appName=appName)
    if key:
        query = query.filter_by(key=key)
    if secret:
        query = query.filter_by(secret=secret)
    page = p.Page(query, pageNum, pageSize)
    return page

@_transactional()
def getApplication(session, appName, siteID, providerID):
    return _getApplication(session, appName, siteID, providerID)

def _getApplication(session, appName, siteID, providerID=None):
    query = session.query(model.Application)
    if providerID:
	query = query.filter_by(providerID=providerID)
    if siteID:
	query = query.filter_by(siteID=siteID)
    query = query.filter_by(appName=appName)
    return _queryOne(query)

@_transactional()
def getApplicationByKey(session, key):
    return _getApplicationByKey(session, key)

def _getApplicationByKey(session, key):
    query = session.query(model.Application)
    query = query.filter_by(key=key)
    return _queryOne(query)

@_transactional()
def createApplication(session, **kwargs):
    return _createApplication(session, **kwargs)

def _createApplication(session, **kwargs):
    _checkAttributes(['providerID', 'siteID', 'appName', 'key', 'secret'], **kwargs)
    providerID = kwargs['providerID']
    siteID = kwargs['siteID']
    appName = kwargs['appName']
    application = _getApplication(session, providerID=providerID, siteID=siteID, appName=appName)
    if application:
        raise ex.AlreadyExistsException('providerID[%s] siteID[%s] name[%s] already exists' % (providerID, siteID, appName))

    key = kwargs['key']
    application = _getApplicationByKey(session, key=key)
    if application:
        raise ex.AlreadyExistsException('key[%s] already exists' % key)

    application = model.Application(**kwargs)
    session.add(application)
    return application

@_transactional()
def getUnderageEmailToken(session, token, parentEmail=None):
    return _getUnderageEmailToken(session, token, parentEmail=parentEmail)

def _getUnderageEmailToken(session, token, parentEmail=None):
    """
        Return the UnderageEmailToken instance matching the given primary key.
    """
    query = session.query(model.UnderageEmailToken)
    query = query.filter_by(token=token)
    if parentEmail:
        query = query.filter_by(parentEmail=parentEmail)
        underageEmailToken = _queryOne(query)
        return underageEmailToken

    underageEmailTokens = query.all()
    return underageEmailTokens


@_transactional()
def createUnderageEmailToken(session, **kwargs):
   return _createUnderageEmailToken(session, **kwargs)

def _createUnderageEmailToken(session, **kwargs):
    """
        Create a UnderageEmailToken instance.
    """
    _checkAttributes(['parentEmail', 'token'], **kwargs)
    email = kwargs['parentEmail']
    email = email.lower().strip()
    validateEmail(email)
    kwargs['parentEmail'] = email

    kwargs['creationTime'] = datetime.now()
    underageEmailToken = model.UnderageEmailToken(**kwargs)
    session.add(underageEmailToken)
    return underageEmailToken

@_transactional()
def getUnderageMemberParent(session, memberID, email=None):
    return _getUnderageMemberParent(session, memberID, email)

def _getUnderageMemberParent(session,memberID, email=None):
    """
        Return the Parent that matches the given member id and email.
    """
    #return model.Member.cache(action=model.LOAD, email=email)
    underageMemberParent = None
    try:
        query = session.query(model.UnderageMemberParent)
        query = query.filter_by(memberID=memberID)
        if email:
            query = query.filter_by(parentEmail=email.lower().strip())
        underageMemberParent = _queryOne(query)
    except Exception:
        pass
    return underageMemberParent

@_transactional()
def createUnderageMemberParent(session, **kwargs):
    return _createUnderageMemberParent(session, **kwargs)

def _createUnderageMemberParent(session, **kwargs):
    """
        Create a Underage Member Parent instance.
    """
    _checkAttributes([ 'memberID', 'parentEmail', 'token', 'approvalRequestCount'], **kwargs)
    email = kwargs['parentEmail']
    email = email.lower().strip()
    validateEmail(email)
    kwargs['parentEmail'] = email

    kwargs['updateTime'] = datetime.now()
    kwargs['creationTime'] = datetime.now()
    if not kwargs.has_key('approvalRequestCount'):
        kwargs['approvalRequestCount'] = 1
    underageMemberParent = model.UnderageMemberParent(**kwargs)
    session.add(underageMemberParent)
    return underageMemberParent

@_transactional()
def updateUnderageMemberParent(session,
                 underageMemberParent):
    return _updateUnderageMemberParent(session,
                         underageMemberParent)

def _updateUnderageMemberParent(session,
                  underageMemberParent):
    """
        Update a Underage Member Parent instance.
    """
    underageMemberParent.updateTime = datetime.now()
    session.add(underageMemberParent)
    log.debug('Updated [%s]' % underageMemberParent.id)
    return underageMemberParent

@_transactional()
def addUSSchoolsMaster(session, name, nces_id='', address='', city='', state='', zipcode='', county=''):
    return _addUSSchoolsMaster(session, name, nces_id=nces_id, address=address, city=city, state=state, zipcode=zipcode, county=county)

def _addUSSchoolsMaster(session, name, nces_id='', address='', city='', state='', zipcode='', county=''):
    data = {
        'name': name,
        'nces_id': nces_id,
        'address': address,
        'city': city,
        'state': state,
        'zipcode': zipcode,
        'county': county,
    }
    school = model.USSchoolsMaster(**data)
    session.add(school)

    return school

@_transactional()
def searchUSSchools(session, search_term, city, state, pageNum, pageSize):
    return _searchUSSchools(session, search_term, city, state, pageNum, pageSize)

def _searchUSSchools(session, search_term, city, state, pageNum, pageSize):
    if not search_term:
        return []
    query = session.query(model.USSchoolsMaster)
    query = query.prefix_with('SQL_CACHE')
    query = query.filter(or_(model.USSchoolsMaster.name.like('%%%s%%'%search_term), model.USSchoolsMaster.zipcode == search_term))
    if state is not None:
        query = query.order_by(case([(model.USSchoolsMaster.state == state, 1), ], else_=2))
    if city is not None:
        query = query.order_by(case([(model.USSchoolsMaster.city == city, 1), ], else_=2))
    query = query.order_by(model.USSchoolsMaster.name)
    page = p.Page(query, pageNum, pageSize, tableName='USSchoolsMaster')
    return page

@_transactional()
def newMemberSchool(session, **kwargs):
    """
        Create a transient MemberSchool instance.
    """
    return _newMemberSchool(session, **kwargs)

def _newMemberSchool(session, **kwargs):
    """
        Create a transient MemberSchool instance.
    """
    _checkAttributes(['memberID','schoolID', 'schoolType'], **kwargs)
    location = model.MemberSchool(**kwargs)
    session.add(location)
    return location

@_transactional()
def getMemberSchool(session, memberID):
    return _getMemberSchool(session, memberID)

def _getMemberSchool(session, memberID):
    """
        Return the MemberSchool instance.
    """
    query = session.query(model.MemberSchool)
    query = query.filter_by(memberID=memberID)
    return _queryOne(query)

@_transactional()
def getUSSchool(session, id):
    return _getUSSchool(session, id)

def _getUSSchool(session, id):
    """
        Return the USSchoolsMaster instance.
    """
    query = session.query(model.USSchoolsMaster)
    query = query.prefix_with('SQL_CACHE')
    query = query.filter_by(id=id)
    return _queryOne(query)

@_transactional()
def getUSSchoolByFilters(session, filters=None, sort=None, pageNum=0, pageSize=0):
    return _getUSSchoolByFilters(session, filters=filters, sort=sort, pageNum=pageNum, pageSize=pageSize)

def _getUSSchoolByFilters(session, filters=None, sort=None, pageNum=0, pageSize=0):
    fields = {
    'id': model.USSchoolsMaster.id,
    'name': model.USSchoolsMaster.name,
    'nces_id': model.USSchoolsMaster.nces_id,
    'zipcode': model.USSchoolsMaster.zipcode
    }

    query = session.query(model.USSchoolsMaster)
    filterDict = {}
    if filters:
        for filterFld, filter in filters:
            if filterFld not in fields.keys():
                raise Exception((_(u'Unsupported filter field: %(filterFld)s')  % {"filterFld":filterFld}).encode("utf-8"))
            if filterFld and filter:
                if not filterDict.has_key(filterFld):
                    filterDict[filterFld] = []
                filterDict[filterFld].append(filter)
    if filterDict:
        for filterFld in filterDict.keys():
            filter = filterDict[filterFld]
            log.info("Filter fld: %s, terms: %s" % (filterFld, filter))
            query = query.filter(fields[filterFld].in_(filter))

    if not sort:
        sort = 'id,desc'

    sortDir = 'asc'
    if ',' in sort:
        sortFld, sortDir = sort.split(',', 1)
    else:
        sortFld = sort
    if sortFld not in fields.keys():
        raise Exception((_(u'Unsupported sort field: %(sortFld)s')  % {"sortFld":sortFld}).encode("utf-8"))
    
    if sortFld:
        if sortDir == 'asc':
            query = query.order_by(asc(fields[sortFld]))
        else:
            query = query.order_by(desc(fields[sortFld]))
    page = p.Page(query, pageNum, pageSize)
    return page

@_transactional()
def addOtherSchool(session, name):
    return _addOtherSchool(session, name)

def _addOtherSchool(session, name):
    """
        Add OtherSchools instance.
    """
    data = {
        'name': name,
    }
    school = model.OtherSchool(**data)
    session.add(school)

    return school

@_transactional()
def getOtherSchoolByName(session, name):
    return _getOtherSchoolByName(session, name)

def _getOtherSchoolByName(session, name):
    """
        Return the OtherSchools instance.
    """
    query = session.query(model.OtherSchool)
    query = query.filter_by(name=name)
    return query.first()

@_transactional()
def getOtherSchool(session, id):
    return _getOtherSchool(session, id)

def _getOtherSchool(session, id):
    """
        Return the OtherSchools instance.
    """
    query = session.query(model.OtherSchool)
    query = query.filter_by(id=id)
    return _queryOne(query)

@_transactional()
def createTask(session, **kwargs):
    return _createTask(session, **kwargs)

def _createTask(session, **kwargs):
    _checkAttributes([ 'name', 'taskID' ], **kwargs)
    """
        Create a Task instance.
    """
    if not kwargs.get('started'):
        kwargs['started'] = datetime.now()
    if not kwargs.get('status'):
        kwargs['status'] = 'PENDING'
    elif kwargs['status'].upper() not in model.TASK_STATUSES:
        raise Exception((_(u"Invalid task status: %(kwargs['status'])s")  % {"kwargs['status']":kwargs['status']}).encode("utf-8"))

    task = model.Task(**kwargs)
    session.add(task)
    session.flush()
    return task

@_transactional()
def updateTask(session, **kwargs):
    _checkAttributes(['id'], **kwargs)
    task = _getUnique(session, model.Task, 'id', kwargs['id'])
    if not task:
        raise Exception((_(u"No such task: %(kwargs['id'])s")  % {"kwargs['id']":kwargs['id']}).encode("utf-8"))
    if kwargs.has_key('name'):
        task.name = kwargs['name']

    if kwargs.has_key('message'):
        task.message = kwargs['message']

    if kwargs.has_key('userdata'):
        task.userdata = kwargs['userdata']

    if kwargs.has_key('hostname'):
        task.hostname = kwargs['hostname']

    if kwargs.has_key('taskID'):
        task.taskID = kwargs['taskID']

    if kwargs.has_key('ownerID'):
        task.ownerID = kwargs['ownerID']

    if kwargs.get('status'):
        if kwargs['status'].upper() not in model.TASK_STATUSES:
            raise Exception((_(u"Invalid task status specified: %(kwargs['status'])s")  % {"kwargs['status']":kwargs['status']}).encode("utf-8"))
        task.status = kwargs['status'].upper()

    session.add(task)
    return task

@_transactional()
def getTaskByID(session, id):
    return _getTaskByID(session, id)

def _getTaskByID(session, id):
    try:
        id = long(id)
        return _getUnique(session, model.Task, 'id', id)
    except ValueError:
        return None

@_transactional()
def getTaskByTaskID(session, taskID):
    return _getTaskByTaskID(session, taskID)

def _getTaskByTaskID(session, taskID):
    session.expire_all()
    query = session.query(model.Task)
    query = query.filter_by(taskID=taskID)
    task = _queryOne(query)
    return task

@_transactional()
def deleteTask(session, task):
    _deleteTask(session, task)

def _deleteTask(session, task):
    if task:
        session.delete(task)

@_transactional()
def deleteTaskByID(session, id):
    try:
        id = long(id)
        task = _getUnique(session, model.Task, 'id', id)
        _deleteTask(session, task=task)
    except ValueError:
        pass

@_transactional()
def getLastTaskByName(session, name, statusList=None, excludeIDs=[]):
    query = session.query(model.Task)
    log.info("Getting task by name: %s" % name)
    query = query.filter(model.Task.name == name)
    if statusList:
        query = query.filter(model.Task.status.in_(statusList))
    if excludeIDs:
        query = query.filter(not_(model.Task.id.in_(excludeIDs)))
    query = query.order_by(model.Task.updated.desc(), model.Task.started.desc())
    return query.first()

@_transactional()
def getTasksByLastUpdateTime(session, lastUpdated, op='before', names=None, excludeNames=None, statusList=None, pageNum=0, pageSize=0):
    query = session.query(model.Task)
    if op == 'before':
        query = query.filter(model.Task.updated < lastUpdated)
    elif op == 'after':
        query = query.filter(model.Task.updated > lastUpdated)
    if names:
        query = query.filter(model.Task.name.in_(names))
    elif excludeNames:
        query = query.filter(not_(model.Task.name.in_(excludeNames)))
    if statusList:
        query = query.filter(model.Task.status.in_(statusList))
    query = query.order_by(model.Task.updated.asc())
    page = p.Page(query, pageNum, pageSize, tableName='Tasks')
    return page

@_transactional()
def getTasks(session, filters=None, searchFld=None, term=None, sort=None, pageNum=0, pageSize=0):
    fields = {
            'status':       model.Task.status,
            'taskID':       model.Task.taskID,
            'id':           model.Task.id,
            'name':         model.Task.name,
            'ownerID':      model.Task.ownerID,
            }
    sortFields = {}
    sortFields.update(fields)
    sortFields.update({
        'started': model.Task.started,
        'updated': model.Task.updated,
    })

    if searchFld and searchFld != 'searchAll' and searchFld not in fields.keys():
        raise Exception((_(u'Unsupported search field: %(searchFld)s')  % {"searchFld":searchFld}).encode("utf-8"))
    
    if not sort:
        sort = 'updated,desc'

    sortDir = 'asc'
    if ',' in sort:
        sortFld, sortDir = sort.split(',', 1)
    else:
        sortFld = sort
    if sortFld not in sortFields:
        raise Exception((_(u'Unsupported sort field: %(sortFld)s')  % {"sortFld":sortFld}).encode("utf-8"))

    query = session.query(model.Task)
    filterDict = {}
    if filters:
        for filterFld, filter in filters:
            if filterFld not in fields.keys():
                raise Exception((_(u'Unsupported filter field: %(filterFld)s')  % {"filterFld":filterFld}).encode("utf-8"))
            if filterFld and filter:
                if not filterDict.has_key(filterFld):
                    filterDict[filterFld] = []
                filterDict[filterFld].append(filter)

    if filterDict:
        for filterFld in filterDict.keys():
            filter = filterDict[filterFld]
            log.debug("Filter fld: %s, terms: %s" % (filterFld, filter))
            query = query.filter(fields[filterFld].in_(filter))

    if searchFld and term and searchFld != 'searchAll':
        query = query.filter(fields[searchFld].ilike('%%%s%%' % term))

    if searchFld == 'searchAll' and term:
        term = '%%%s%%' % term
        query = query.filter(or_(
            model.Task.status.ilike(term),
            model.Task.taskID.ilike(term),
            model.Task.id.ilike(term),
            model.Task.name.ilike(term),
            model.Task.ownerID.ilike(term)))

    if sortFld:
        if sortDir == 'asc':
            query = query.order_by(asc(sortFld))
        else:
            query = query.order_by(desc(sortFld))
    log.debug("Running tasks query: %s" % query)
    page = p.Page(query, pageNum, pageSize, tableName='Tasks')
    return page

@_transactional()
def getDupLogins(session, memberID=None, login=None):
    return _getDupLogins(session, memberID=memberID, login=login)

def _getDupLogins(session, memberID=None, login=None):
    query = session.query(model.DupLogin)
    if memberID:
        query = query.filter_by(memberID=memberID)
    if login:
        query = query.filter_by(login=login)
    dupLogins = query.all()
    log.debug('_getDupLogins: dupLogins[%s]' % dupLogins)
    return dupLogins
