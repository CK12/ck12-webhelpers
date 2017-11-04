import os
import sys

cmdFolder = os.path.dirname(os.path.abspath(__file__))
cmdFolder = os.path.dirname(cmdFolder)
cmdFolder = os.path.dirname(cmdFolder)
if cmdFolder not in sys.path:
    sys.path.insert(0, cmdFolder)

from auth.model import meta
from auth.model import model
from auth.model import api

encoding = 'utf-8'

class MemberRole(object):

    def __init__(self, src, dst):
        from sqlalchemy import create_engine, orm

        engine = create_engine(src)
        sm = orm.sessionmaker(autoflush=False,
                              autocommit=True,
                              bind=engine)
        Session = orm.scoped_session(sm)
        self.srcConn = engine.connect()
        self.srcSession = Session()
        self.srcMeta = meta.MetaData(engine)

        meta.engine = create_engine(dst)
        sm = orm.sessionmaker(autoflush=False,
                              autocommit=True,
                              bind=meta.engine)
        meta.Session = orm.scoped_session(sm)
        self.dstConn = meta.engine.connect()
        self.dstSession = meta.Session()

    def process(self):

        class GroupHasMembers(model.FlxModel):
            pass

        from sqlalchemy import Table, Column, Integer, SmallInteger, String, DateTime

        GroupHasMembers = Table('GroupHasMembers', self.srcMeta,
            Column('groupID', Integer(),  primary_key=True, nullable=False),
            Column('memberID', Integer(), primary_key=True,  nullable=False),
            Column('roleID', Integer(), primary_key=True,  nullable=False),
            Column('statusID', SmallInteger(), nullable=False, default=2),
            Column('memberEmail', String(length=None, convert_unicode=False, unicode_error=None, _warn_on_bytestring=False), nullable=True),
            Column('joinTime', DateTime(timezone=False),  nullable=False),
            Column('updateTime', DateTime(timezone=False),  nullable=False),
            Column('disableNotification', SmallInteger(), nullable=False, default=0),
        )
	self.dstSession.begin()

        query = self.srcSession.query(GroupHasMembers)
        query = query.group_by(GroupHasMembers.c.memberID)
        query = query.order_by(GroupHasMembers.c.roleID)
        groupMembers = query.all()
        for groupMember in groupMembers:
            data = {
                'roleID': groupMember.roleID,
                'memberID': groupMember.memberID,
            }
            api._create(self.dstSession, model.MemberHasRole, **data)

	self.dstSession.commit()


if __name__ == "__main__":
    import optparse

    src = 'mysql://dbadmin:D-coD#43@localhost:3306/flx2?charset=utf8'
    dst = 'mysql://dbadmin:D-coD#43@localhost:3306/auth?charset=utf8'

    parser = optparse.OptionParser('%prog [options]')
    parser.add_option(
        '-s', '--source', dest='src', default=src,
        help='The URL for connecting to the source database. Defaults to %s' % src
    )
    parser.add_option(
        '-t', '--target', dest='dst', default=dst,
        help='The URL for connecting to the target database. Defaults to %s' % dst
    )
    parser.add_option(
        '-q', '--quiet', action='store_false', dest='verbose', default=True,
        help='Turn verbose mode off.'
    )
    options, args = parser.parse_args()
    if args:
        parser.error('Expected no arguments. Got %r' % args)

    src = options.src
    dst = options.dst
    verbose = options.verbose

    if verbose:
        print 'Migrate member roles.'
    MemberRole(src, dst).process()
