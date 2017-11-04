from __future__ import print_function

import logging
import os
import sys

cmdFolder = '/opt/2.0/flx/pylons/flx'
if cmdFolder not in sys.path:
    sys.path.insert(0, cmdFolder)

from flx.model import meta
from flx.model import model
from flx.model import api
from flx.lib.helpers import safe_encode

class VerifyContent:

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

    def verify(self, limit):
        import hashlib, zlib

        size = limit
        count = 0
        offset = 0
        self.session.begin()
        while size > 0:
            query = self.session.query(model.Content)
            query = query.limit(limit)
            query = query.offset(offset)
            contents = query.all()
            size = len(contents)
            for c in contents:
                if not c.compressed:
                    contents = c.contents
                else:
		    try:
			contents = zlib.decompress(c.contents)
		    except Exception, e:
			print('verify[%d]: fail to decompress on resourceURI[%s] ownerID[%s] contentRevisionID[%s] creationTime[%s] csize[%s] checksum[%s]' % (count, c.resourceURI, c.ownerID, c.contentRevisionID, c.creationTime, len(c.contents), c.checksum))
			count += 1
			continue
                md5 = hashlib.md5()
                md5.update(contents)
                checksum = md5.hexdigest()
                if c.checksum != checksum:
		    print('verify[%d]: resourceURI[%s] ownerID[%s] contentRevisionID[%s] creationTime[%s] size[%s] csize[%s] checksum[%s] not matching[%s]' % (count, c.resourceURI, c.ownerID, c.contentRevisionID, c.creationTime, len(contents), len(c.contents), c.checksum, checksum))
                count += 1
            offset += size
        self.session.commit()

if __name__ == "__main__":
    import optparse

    url = 'mysql://dbadmin:D-coD#43@localhost:3306/flx2?charset=utf8'
    limit = 1000

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
    options, args = parser.parse_args()
    if args:
        parser.error('Expected no arguments. Got %r' % args)

    url = options.url
    limit = options.limit
    verbose = options.verbose

    if verbose:
        print('Verifying contents')

    c = VerifyContent(url, verbose)
    c.verify(limit)
