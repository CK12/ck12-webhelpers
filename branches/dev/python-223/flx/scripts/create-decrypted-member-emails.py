from __future__ import print_function

from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class DMemberEmail(Base):

    __tablename__ = 'DMemberEmails'

    from sqlalchemy import Column, Integer, String

    id = Column('id', Integer(),  primary_key=True, nullable=False)
    email = Column('email', String(255),  nullable=False)

    def __init__(self, id, email):
        self.id = id
        self.email = email

class CreateDecryptedMemberEmails:

    def __init__(self, url):
        import sys
        cmdFolder = '/opt/2.0/flx/pylons/flx'
        if cmdFolder not in sys.path:
            sys.path.insert(0, cmdFolder)
        from flx.model import meta

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
        from flx.model import model

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
                query = session.query(M.id, M.email)
                query = query.limit(limit)
                query = query.offset(offset)
                members = query.all()
                if not members:
                    break
                for id, email in members:
                    mList.append(dict
                        (
                            id=id,
                            email=email
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
                        member = DMemberEmail(**data)
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

    url = 'mysql://dbadmin:SeeK#94E03@mysql.master:3306/flx2?charset=utf8'

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
        print('Create decrypted member emails.')

    a = CreateDecryptedMemberEmails(url)
    a.create(verbose)
