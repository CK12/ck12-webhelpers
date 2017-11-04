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
from urllib import unquote

class UnquoteHandle:

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

    def processArtifact(self, limit):
        size = limit
        if self.verbose:
            print('Processed', end='')
        count = 0
        self.session.begin()
        while size > 0:
            if self.verbose:
                print(' %d' % count, end='')
            query = self.session.query(model.Artifact)
            query = query.limit(limit)
            query = query.offset(count)
            artifacts = query.all()
            size = len(artifacts)
            for artifact in artifacts:
                h = artifact.handle
                while True:
                    handle = unquote(h)
                    if handle == h:
                        break
                    h = handle
                if artifact.handle != handle:
                    artifact.handle = handle
                    self.session.add(artifact)
                    try:
                        self.session.commit()
                    except Exception, e:
                        self.session.rollback()
                    self.session.begin()
            if self.verbose:
                print(',', end='')
            count += size
        if self.verbose:
            print(' Done.')

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
        print('Unquoting handles')

    c = UnquoteHandle(url, verbose)
    c.processArtifact(limit)
