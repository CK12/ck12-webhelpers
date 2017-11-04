from __future__ import print_function

import sys

cmdFolder = '/opt/2.0/flx/pylons/flx'
if cmdFolder not in sys.path:
    sys.path.insert(0, cmdFolder)

from flx.model import meta
from flx.model import model

class ShowContent:

    def __init__(self, url, verbose):
        if meta.engine is None:
            from sqlalchemy import create_engine, orm, MetaData

            meta.engine = create_engine(url)
            sm = orm.sessionmaker(autoflush=False,
                                  autocommit=True,
                                  bind=meta.engine)
            meta.meta = MetaData()
            meta.Session = orm.scoped_session(sm)
        self.session = meta.Session()
        self.verbose = verbose

    def processContent(self, limit, uri, owner, rev):
        size = limit
        if self.verbose:
            print('Processed', end='')
        while size > 0:
            self.session.begin()
            query = self.session.query(model.Content)
            if uri:
                query = query.filter_by(resourceURI = uri)
            if owner:
                query = query.filter_by(ownerID = owner)
            if rev:
                query = query.filter_by(contentRevisionID = rev)
            query = query.limit(limit)
            query = query.offset(0)
            contents = query.all()
            if not contents:
                break
            for c in contents:
                import zlib

                content = zlib.decompress(c.contents)
                print('=========================================================================================')
                print('uri[%s] rev[%s] len[%s]' %(c.resourceURI, c.contentRevisionID, len(content)))
                print('-----------------------------------------------------------------------------------------')
                print(content)
            self.session.commit()
            size -= len(contents)

if __name__ == "__main__":
    import optparse

    url = 'mysql://dbadmin:D-coD#43@mysql.master:3306/flx2?charset=utf8'
    limit = 1000
    uri = None
    owner = None
    rev = None

    parser = optparse.OptionParser('%prog [options]')
    parser.add_option(
        '-d', '--database', dest='url', default=url,
        help='The URL for connecting to the 2.0 database. Defaults to %s' % url
    )
    parser.add_option(
        '-l', '--limit', dest='limit', default=limit,
        help='The batch size of each transaction. Defaults to %s' % limit
    )
    parser.add_option(
        '-q', '--quiet', action='store_false', dest='verbose', default=True,
        help='Turn verbose mode off.'
    )
    parser.add_option(
        '-u', '--uri', dest='uri', default=uri,
        help='The resource URI.'
    )
    parser.add_option(
        '-o', '--owner', dest='owner', default=owner,
        help='The owner ID.'
    )
    parser.add_option(
        '-r', '--rev', dest='rev', default=rev,
        help='The revision ID.'
    )
    options, args = parser.parse_args()
    if args:
        parser.error('Expected no arguments. Got %r' % args)

    url = options.url
    limit = options.limit
    uri = options.uri
    owner = options.owner
    rev = options.rev
    verbose = options.verbose

    if verbose:
        print('Showing contents')

    c = ShowContent(url, verbose)
    c.processContent(limit, uri, owner, rev)
