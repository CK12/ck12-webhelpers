from __future__ import print_function

import sys
cmdFolder = '/opt/2.0/flx/pylons/auth'
if cmdFolder not in sys.path:
    sys.path.insert(0, cmdFolder)

from auth.model import meta, model, api

class InternalMembers:

    def __init__(self, url):
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

    def _getAuthMemberRoles(self):
        memberRoles = api._getMemberRoles(self.session)
        memberRoleNameDict = {}
        for memberRole in memberRoles:
            id = memberRole.id
            name = memberRole.name
            memberRoleNameDict[name] = id
        return memberRoleNameDict

    def internalize(self, verbose=True):
        self.session.begin()
        memberRoleNameDict = self._getAuthMemberRoles()
        iuID = memberRoleNameDict.get('internal-user')
        limit = 10000
        offset = 0
        query = self.session.query(model.Member)
        done = False
        first = True
        while not done:
            query = query.limit(limit)
            query = query.offset(offset)
            members = query.all()
            done = not members
            if not done:
                for member in members:
                    if not member.email.endswith('@ck12.org'):
                        continue
                    mhr = api._getMemberHasRoles(self.session, memberID=member.id, roleID=iuID)
                    if mhr:
                        continue
                    if verbose:
                        if first:
                            first = False
                        else:
                            print(', ', end='')
                        print('%d' % member.id, end='')
                    d = { 'memberID': member.id, 'roleID': iuID }
                    api._create(self.session, model.MemberHasRole, **d)
                self.session.commit()
                offset += limit
                self.session.begin()
        if verbose:
            print('')
        self.session.commit()

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
        print('Internalizing members.')

    a = InternalMembers(url)
    a.internalize(verbose)
