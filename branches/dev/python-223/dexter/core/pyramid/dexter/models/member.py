from bson.objectid import ObjectId
from dexter.models import page as p
from dexter.models.validationwrapper import ValidationWrapper
from dexter.lib import helpers as h

from datetime import datetime
import logging

log = logging.getLogger(__name__)

class Member(ValidationWrapper):

    def __init__(self, db, dc=False):
        self.db = db
	self.AuthMembers = self.db.AuthMembers
        # Dependency check flag
        self.dc = dc 
        self.required_fields = ['login', 'defaultLogin', 'uID', 'email']

    """
        Get members
    """
    @h.trace
    def getMembers(self, pageNum=0, pageSize=0):
        members = p.Page(self.AuthMembers, None, pageNum, pageSize)
        return members
    
    @h.trace
    def getMemberByID(self, id):
        member = None
        try:
            oid = ObjectId(str(id))
            member = self.AuthMembers.find_one(oid)
        except:
            pass
        if not member:
            try:
                member = self.AuthMembers.find_one({'uID': long(id)})
            except:
                pass

        return member

    @h.trace
    def getMemberByLogin(self, login):
        member = self.AuthMembers.find_one({'loginlc': login.lower()})
        if not member:
            member = self.AuthMembers.find_one({'defaultLogin': login})
        return member

    @h.trace
    def getMemberByLoginOrEmail(self, loginOrEmail):
        member = self.AuthMembers.find_one({'$or': [ {'loginlc': loginOrEmail.lower()}, {'defaultLogin': loginOrEmail}, {'email': loginOrEmail}]})
        return member

    '''
        Get all members of given group(eg: ck12, community)
    '''
    @h.trace
    def getMembersForAssessmentGroup(self, groupName):
        # For 'community', get the members other than 'community' group
        if groupName == 'community':
            groupMembers = self.AuthMembers.find({'asmtGroups':{'$nin':[groupName]}})
        else:
            groupMembers = self.AuthMembers.find({'asmtGroups':{'$in':[groupName]}})
        members = []
        for m in groupMembers:
            if m:
                members.append(m)
        return members

    @h.trace
    def getTimeSpentInTest(self, memberID, testID):
        timeSpent = self.AuthMembers.find_one({'_id':memberID, 'timeSpentInTests.testID': testID},{'_id':1, 'timeSpentInTests.$.testID':1})
        if timeSpent:
            timeSpentInTest = timeSpent['timeSpentInTests'][0]
            return timeSpentInTest

    @h.trace
    def isCK12Contributor(self, member):
        if 'ck12' in member['asmtGroups']:
            return True
        return False

    @classmethod
    @h.trace
    def asDict(cls, member,  timeSpentInTests=False):
        rm = ['created', 'updated', ]
        if not timeSpentInTests: 
            rm.append('timeSpentInTests')
        for k in rm:
            if member.has_key(k):
                del member[k]
        return member

    @h.trace
    def createMember(self, **kwargs):
        if not kwargs.has_key('created'):
            kwargs['created'] = datetime.now()
        if not kwargs.has_key('updated'):
            kwargs['updated'] = datetime.now()
        if kwargs.get('login'):
            kwargs['loginlc'] = kwargs['login'].lower()

        self.before_insert(**kwargs)
        if kwargs.get('roles'):
            kwargs['roles'] = [ r.lower() for r in kwargs['roles'] ]
        # Add asmtGroups as 'community' by default
        kwargs['asmtGroups'] = ['community']
        
        id = self.AuthMembers.insert(kwargs)
        return self.AuthMembers.find_one(id)

    @h.trace
    def updateMember(self, id, isSummerChallenge=False, **kwargs):
        self.before_update(**kwargs)
        id = ObjectId(str(id))
        if kwargs.get('login'):
            kwargs['loginlc'] = kwargs['login'].lower()
        if kwargs.get('roles'):
            kwargs['roles'] = [ r.lower() for r in kwargs['roles'] ]
        # Don't update the Members collections 'updated' field, while enrolling/updating summer challenge details(it will have separate field "summerChallenge.updated") 
        if not kwargs.has_key('updated') and not isSummerChallenge:
            kwargs['updated'] = datetime.now()
        self.AuthMembers.update(
                            { '_id': id },
                            { '$set': kwargs },
                            )
        return self.AuthMembers.find_one(id)
    
    '''
        Check if a member is student 
    '''
    @h.trace
    def isStudentMember(self, memberId):
        studentMember = self.AuthMembers.find_one({'_id':ObjectId(str(memberId)), 'roles':{'$in':['student']}})
        if studentMember:
            return True
        else:
            return False
        
    '''
        Get all members of summer challenge
    '''
    @h.trace
    def getMembersForSummerChallenge(self):
        query = {}
        query['summerChallenge'] = {'$exists': True}
        scMembers = self.AuthMembers.find(query, {'summerChallenge':True, 'email':True, 'firstName':True, 'uID':True})
        return scMembers
