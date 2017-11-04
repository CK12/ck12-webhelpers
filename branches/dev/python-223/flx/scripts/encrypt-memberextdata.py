from __future__ import print_function

class EncryptMemberExtData:

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
        query = self.session.query(model.MemberExtData)
        total = query.count()
        if verbose:
            print('Encrypting %d MemberExtData.' % total)
        remaining = total
        first = True
        while remaining > 0:
            query = query.limit(limit)
            query = query.offset(offset)
            data = query.all()
            for e in data:
                from sqlalchemy.orm.attributes import flag_modified

                #e.externalID = e.externalID.lower()
                flag_modified(e, 'externalID')
                self.session.add(e)
                if verbose:
                    if first:
                        first = False
                    else:
                        print(', ', end='')
                    print('%d' % e.memberID, end='')
            self.session.commit()
            offset += limit
            remaining -= len(data)
            self.session.begin()
        if verbose:
            print('')
        self.session.commit()

if __name__ == "__main__":
    import optparse

    module = 'auth'
    url = 'mysql://dbadmin:D-coD#43@mysql.master:3306/%s?charset=utf8' % module

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
        print('Encrypt some MemberExtData fields.')

    a = EncryptMemberExtData(url, module=module)
    a.encrypt(verbose)
