from __future__ import print_function

class FixDuplicateDefaultLogins:

    def __init__(self, url, module='auth'):
        import sys

        self.module = module
        cmdFolder = '/opt/2.0/flx/pylons/%s' % module
        if cmdFolder not in sys.path:
            sys.path.insert(0, cmdFolder)
        if self.module == 'flx':
            from flx.model import meta
            import flx.lib.helpers as h
        else:
            from auth.model import meta
            import auth.lib.helpers as h

        if meta.engine is None:
            from sqlalchemy import create_engine, orm, MetaData

            meta.engine = create_engine(url)
            sm = orm.sessionmaker(autoflush=False,
                                autocommit=True,
                                bind=meta.engine)
            meta.meta = MetaData()
            meta.Session = orm.scoped_session(sm)
        self.session = meta.Session()

        self.config = h.load_pylons_config()

    def getDuplicateDefaultLogins(self):
        from sqlalchemy.sql import func

        statement = 'select defaultLogin from ( select defaultLogin, count(*) as c from Members group by defaultLogin ) as dl where dl.c > 1;'
        query = self.session.execute(statement)
        dls = query.fetchall()
        defaultLogins = []
        if dls:
            for dl in dls:
                defaultLogin = dl[0]
                defaultLogins.append(defaultLogin)
        return defaultLogins

    def getMembersByDefaultLogin(self, model, defaultLogin):
        query = self.session.query(model.Member)
        query = query.filter(model.Member.defaultLogin.like('%%%s%%' % defaultLogin))
        members = query.all()
        return members

    def fixDuplicate(self):
        if self.module == 'flx':
            from flx.model import model
            from flx.model import api
        else:
            from auth.model import model
            from auth.model import api

        #
        #  Get duplicate defaultLogins.
        #
        self.session.begin()
        defaultLogins = self.getDuplicateDefaultLogins()
        if verbose:
            print('There are %d defaultLogins ' % len(defaultLogins))

        for defaultLogin in defaultLogins:
            print('Processing %s' % defaultLogin, end='')
            members = self.getMembersByDefaultLogin(model, defaultLogin)
            if members and len(members) > 1:
                print(':%d' % len(members), end='')
                member = members[0]
                n = 1
                while True:
                    defaultLogin = '%s.%d' % (defaultLogin, n)
                    m = api._getMemberByDefaultLogin(self.session, defaultLogin)
                    if not m:
                        break
                    n += 1
                if member.login == member.defaultLogin:
                    member.login = defaultLogin
                member.defaultLogin = defaultLogin
                self.session.add(member)
                print(' [%d-%s]' % (member.id, defaultLogin))
        self.session.commit()

if __name__ == "__main__":
    import optparse

    url = 'mysql://dbadmin:D-coD#43@mysql.master:3306/auth?charset=utf8'
    module = 'auth'

    parser = optparse.OptionParser('%prog [options]')
    parser.add_option(
        '-d', '--database', dest='url', default=url,
        help='The URL for connecting to the 2.0 database. Defaults to %s' % url
    )
    parser.add_option(
        '-m', '--module', dest='module', default=module,
        help='The module, either flx or auth.',
    )
    parser.add_option(
        '-q', '--quiet', action='store_false', dest='verbose', default=True,
        help='Turn verbose mode off.'
    )
    options, args = parser.parse_args()
    if args:
        parser.error('Expected no arguments. Got %r' % args)

    url = options.url
    module = options.module
    verbose = options.verbose

    if module == 'flx':
        url = url.replace('auth', 'flx2')

    if verbose:
        print('Fix duplicate defaultLogins on %s' % url)

    c = FixDuplicateDefaultLogins(url, module)
    c.fixDuplicate()
