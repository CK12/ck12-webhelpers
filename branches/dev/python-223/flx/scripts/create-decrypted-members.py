from __future__ import print_function

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

class CreateDecryptedMembers:

    def __init__(self, url):
        import sys
        cmdFolder = '/opt/2.0/flx/pylons/auth'
        if cmdFolder not in sys.path:
            sys.path.insert(0, cmdFolder)
        from auth.model import meta

        if meta.engine is None:
            from sqlalchemy import create_engine, orm, MetaData

            meta.engine = create_engine(url)
            sm = orm.sessionmaker(autoflush=False,
                                  autocommit=True,
                                  bind=meta.engine)
            meta.meta = MetaData()
            meta.Session = orm.scoped_session(sm)
        self.session = meta.Session()
        self.engine = meta.engine

    def create(self, verbose=True):
        from auth.model import model

        limit = 1000
        offset = 0
        count = 0
        session = self.session
        try:
            while True:
                from sqlalchemy.orm import aliased

                mList = []
                session.begin()
                M = aliased(model.Member)
                query = session.query(M.id, M.login, M.defaultLogin, M.email, M.givenName, M.surname, M.creationTime, M.updateTime, M.loginTime, M.timezone)
                query = query.limit(limit)
                query = query.offset(offset)
                members = query.all()
                if not members:
                    break
                for id, login, defaultLogin, email, givenName, surname, creationTime, updateTime, loginTime, timezone in members:
                    mList.append(dict
                        (
                            id=id,
                            login=login,
                            defaultLogin=defaultLogin,
                            email=email,
                            givenName=givenName,
                            surname=surname,
                            creationTime=creationTime,
                            updateTime=updateTime,
                            loginTime=loginTime,
                            timezone=timezone
                        )
                    )
                if len(members) < limit:
                    break
                session.commit()
                count = len(mList)
                for n in range(0, count):
                    data = mList[n]
                    session.begin()
                    try:
                        member = DMember(**data)
                        session.add(member)
                        session.commit()
                    except Exception as e:
                        print('member%s: failed[%s]@offset[%s]' % (data, str(e), (offset + n)))
                        session.rollback()
                offset += limit
        finally:
            if verbose:
                print('total=%d.' % count)

if __name__ == "__main__":
    import optparse

    url = 'mysql://dbadmin:D-coD#43@mysql.master:3306/auth?charset=utf8'

    parser = optparse.OptionParser('%prog [options]')
    parser.add_option(
        '-d', '--database', dest='url', default=url,
        help='The URL for connecting to the 2.0 database. Defaults to %s' % url
    )
    parser.add_option(
        '-q', '--quiet', action='store_false', dest='verbose', default=True,
        help='Turn verbose mode off.'
    )
    options, args = parser.parse_args()
    if args:
        parser.error('Expected no arguments. Got %r' % args)

    url = options.url
    verbose = options.verbose

    if verbose:
        print('Create decrypted members.')

    a = CreateDecryptedMembers(url)
    a.create(verbose)
