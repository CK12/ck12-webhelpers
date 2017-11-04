from __future__ import print_function

import sys
cmdFolder = '/opt/2.0/flx/pylons/flx'
if cmdFolder not in sys.path:
    sys.path.insert(0, cmdFolder)

from flx.model import meta as fmeta
from flx.model import model as fmodel

cmdFolder = '/opt/2.0/flx/pylons/auth'
if cmdFolder not in sys.path:
    sys.path.insert(0, cmdFolder)

from auth.model import meta as ameta
from auth.model import model as amodel

from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class DMember(Base):

    __tablename__ = 'DMembers'

    from sqlalchemy import Column, Integer, String, DateTime

    id = Column('id', Integer(),  primary_key=True, nullable=False)
    login = Column('login', String(255),  nullable=False)
    defaultLogin = Column('defaultLogin', String(length=None, convert_unicode=False, unicode_error=None, _warn_on_bytestring=False),  nullable=False)
    email = Column('email', String(255),  nullable=False)
    givenName = Column('givenName', String(255),  nullable=False)
    surname = Column('surname', String(255),  nullable=False)
    creationTime = Column('creationTime', DateTime(timezone=False),  nullable=False)
    updateTime = Column('updateTime', DateTime(timezone=False),  nullable=False)
    loginTime = Column('loginTime', DateTime(timezone=False),  nullable=False)
    timezone = Column('timezone', String(length=None, convert_unicode=False, unicode_error=None, _warn_on_bytestring=False),  nullable=False, default="US/Pacific")

    def __init__(self, id, login, defaultLogin, email, givenName, surname, creationTime, updateTime, loginTime, timezone):
        self.id = id
        self.login = login
        self.defaultLogin = defaultLogin
        self.email = email
        self.givenName = givenName
        self.surname = surname
        self.creationTime = creationTime
        self.updateTime = updateTime
        self.loginTime = loginTime
        self.timezone = timezone

    def asDict(self):
	return dict(
	    id=self.id,
	    login=self.login,
	    defaultLogin=self.defaultLogin,
	    email=self.email,
	    givenName=self.givenName,
	    surname=self.surname,
	    creationTime=self.creationTime,
	    loginTime=self.loginTime,
	    timezone=self.timezone
	)

class EncryptMembers:

    def _connect(self, url, meta):
        from sqlalchemy import create_engine, orm, MetaData

        meta.engine = create_engine(url)
        sm = orm.sessionmaker(autoflush=False,
                                autocommit=True,
                                bind=meta.engine)
        meta.meta = MetaData()
        meta.Session = orm.scoped_session(sm)
        return meta.Session()

    def __init__(self, aurl, furl):
        self.asession = self._connect(aurl, ameta)
        self.fsession = self._connect(furl, fmeta)

    def updateMember(self, memberDict, model, session, isAuth=False):
	session.begin()
	try:
	    query = session.query(model.Member)
	    query = query.filter_by(id=memberDict.get('id'))
	    member = query.first()
	    if member:
		if member.email == memberDict.get('email', None):
		    session.commit()
		    return False
		if isAuth:
		    query = session.query(model.MemberExtData)
		    query = query.filter_by(memberID=memberDict.get('id'))
		    exts = query.all()
		    if exts:
			for ext in exts:
			    if ext.authTypeID < 10 and ext.externalID: # == member.email:
				ext.externalID = memberDict.get('email', None)
		member.email = memberDict.get('email', None)
		member.login = memberDict.get('login', None)
		member.givenName = memberDict.get('givenName', None)
		member.surname = memberDict.get('surname', None)
		session.add(member)
	    session.commit()
	    return True
	except Exception as e:
	    session.rollback()
	    print(', %s[%s]' % (memberDict.get('id'), str(e)))
	    return False

    def encrypt(self, memberID=None, limit=100, offset=0, upper=0, verbose=True):
        if memberID:
	    self.asession.begin()
	    query = self.asession.query(DMember)
            query = query.filter_by(id=memberID)
            member = query.first()
            if not member:
                self.asession.rollback()
                print('member with id, %s, not found.' % memberID)
            else:
                memberDict = member.asDict()
                self.asession.commit()
                print('memberDict[%s]' % memberDict)
                updated = False
		if self.updateMember(memberDict, amodel, self.asession, isAuth=True):
		    updated = True
		if self.updateMember(memberDict, fmodel, self.fsession, isAuth=False):
		    updated = True
                if verbose:
                    print('%d' % memberDict.get('id'), end='')
                    if updated:
                        print(' updated.')
            return

        first = True
        while True:
	    self.asession.begin()
	    query = self.asession.query(DMember)
            query = query.limit(limit)
            query = query.offset(offset)
            members = query.all()
            if not members:
                break
	    memberList = []
	    for member in members:
		memberDict = member.asDict()
		memberList.append(memberDict)
	    self.asession.commit()
	    for memberDict in memberList:
		updated = False
		if self.updateMember(memberDict, amodel, self.asession, isAuth=True):
		    updated = True
		if self.updateMember(memberDict, fmodel, self.fsession, isAuth=False):
		    updated = True
		if verbose and updated:
		    if first:
			first = False
		    else:
			print(', ', end='')
		    print('%d' % memberDict.get('id'), end='')
            offset += limit
            if upper and offset > upper:
                break
        if verbose:
            print('')

if __name__ == "__main__":
    import optparse

    aurl = 'mysql://dbadmin:D-coD#43@mysql.master:3306/auth?charset=utf8'
    furl = 'mysql://dbadmin:D-coD#43@mysql.master:3306/flx2?charset=utf8'
    memberID = None
    limit = 100
    offset = 0
    upper = 0

    parser = optparse.OptionParser('%prog [options]')
    parser.add_option(
        '-a', '--auth', dest='aurl', default=aurl,
        help='The URL for connecting to the 2.0 auth database. Defaults to %s' % aurl
    )
    parser.add_option(
        '-f', '--flx', dest='furl', default=furl,
        help='The URL for connecting to the 2.0 flx database. Defaults to %s' % furl
    )
    parser.add_option(
        '-l', '--limit', dest='limit', default=limit,
        help='The member limit.'
    )
    parser.add_option(
        '-m', '--member', dest='memberID', default=memberID,
        help='The member ID.'
    )
    parser.add_option(
        '-o', '--offset', dest='offset', default=offset,
        help='The member offset.'
    )
    parser.add_option(
        '-u', '--upper', dest='upper', default=upper,
        help='The member upper limit.'
    )
    parser.add_option(
        '-q', '--quiet', action='store_false', dest='verbose', default=True,
        help='Turn verbose mode off.'
    )
    options, args = parser.parse_args()
    if args:
        parser.error('Expected no arguments. Got %r' % args)

    aurl = options.aurl
    furl = options.furl
    memberID = options.memberID
    limit = int(options.limit)
    offset = int(options.offset)
    upper = int(options.upper)
    verbose = options.verbose

    if verbose:
        print('Re-encrypt member fields to the local key.')

    a = EncryptMembers(aurl, furl)
    a.encrypt(limit=limit, memberID=memberID, offset=offset, upper=upper, verbose=verbose)
