from __future__ import print_function

class EncryptMembers:

    def __init__(self, url, module='auth'):
        self.module = module

        import sys
        cmdFolder = '/opt/2.0/flx/pylons/%s' % module
        if cmdFolder not in sys.path:
            sys.path.insert(0, cmdFolder)
        if self.module == 'flx':
            from flx.model import meta
        else:
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

    def encrypt(self, verbose=True):
        if self.module == 'flx':
            from flx.model import model
        else:
            from auth.model import model

        self.session.begin()
        limit = 1000
        offset = 0
        query = self.session.query(model.Member)
        total = query.count()
        if verbose:
            print('Encrypting %d members.' % total)
        remaining = total
        first = True
        while remaining > 0:
            query = query.limit(limit)
            query = query.offset(offset)
            members = query.all()
            for member in members:
                from sqlalchemy.orm.attributes import flag_modified

                member.email = member.email.lower()
                member.login = member.login.lower().strip()
                flag_modified(member, 'email')
                flag_modified(member, 'login')
                flag_modified(member, 'givenName')
                flag_modified(member, 'surname')
                self.session.add(member)
                if verbose:
                    if first:
                        first = False
                    else:
                        print(', ', end='')
                    print('%d' % member.id, end='')
            self.session.commit()
            offset += limit
            remaining -= len(members)
            self.session.begin()
        if verbose:
            print('')
        self.session.commit()
        self.session.rollback()

if __name__ == "__main__":
    import optparse

    url = 'mysql://dbadmin:D-coD#43@mysql.master:3306/flx2?charset=utf8'
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

    if verbose:
        print('Encrypt some member fields.')

    a = EncryptMembers(url, module=module)
    a.encrypt(verbose)
