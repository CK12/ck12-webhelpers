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

class OrderAuthor:

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

    def processAuthors(self):
        if verbose:
            print('Getting artifact ID list', end='')
        query = self.session.query(model.ArtifactAuthor.artifactID)
        query = query.distinct()
        artifactIDs = query.all()
        if verbose:
            print(', count=%d' % len(artifactIDs))

        print('Processing', end='')
        count = 0
        self.session.begin()
        for artifactID in artifactIDs:
            if verbose:
                print(' %d' % artifactID, end='')
            id = '%d' % artifactID
            query = self.session.query(model.ArtifactAuthor)
            query = query.filter_by(artifactID = id)
            query = query.order_by(model.ArtifactAuthor.roleID)
            query = query.order_by(model.ArtifactAuthor.sequence)
            authors = query.all()
            first = True
            sequence = 0
            for author in authors:
                if first:
                    roleID = author.roleID
                    first = False
                else:
                    if roleID != author.roleID:
                        sequence = 0
                    roleID = author.roleID
                sequence += 1
                if author.sequence is None:
                    continue
                author.sequence = sequence
                self.session.add(author)
                if verbose:
                    print(':%d' % sequence, end='')
            if verbose:
                print(',', end='')
            count += 1
            if (count % 10000) == 0:
                self.session.commit()
                self.session.begin()
        self.session.commit()
        if verbose:
            print(' Done.')

if __name__ == "__main__":
    import optparse

    url = 'mysql://dbadmin:D-coD#43@localhost:3306/flx2?charset=utf8'

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
        print('Order authors')

    c = OrderAuthor(url)
    c.processAuthors()
