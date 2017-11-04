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
from flx.model.vcs import vcs as v
from flx.lib.helpers import safe_encode

from sqlalchemy.sql import func

class FixArtifactBrowseTerms:

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

    def fix(self, verbose=True):
        self.session.begin()
        #
        #  Get the level ArtifactsAndBrowseTerms where the artifacts
        #  have more than one browse terms.
        #
        query = self.session.query(model.ArtifactsAndBrowseTerms)
        query = query.filter_by(termTypeID = 7)
        query = query.group_by(model.ArtifactsAndBrowseTerms.id)
        query = query.having(func.count(model.ArtifactsAndBrowseTerms.browseTermID) > 1)
        query = query.order_by(model.ArtifactsAndBrowseTerms.id)
        abts = query.all()
        if verbose:
            l = len(abts)
            print('%d artifacts has multiple level browse terms.' % l)
            if l > 0:
                print('Processing', end='')
            first = True
        for abt in abts:
            if verbose:
                if first:
                    first = False
                else:
                    print(';', end='')
                print(' %d(' % abt.id, end='')
            query = self.session.query(model.ArtifactsAndBrowseTerms)
            query = query.filter_by(id = abt.id)
            query = query.filter_by(termTypeID = 7)
            query = query.order_by(model.ArtifactsAndBrowseTerms.browseTermID)
            bts = query.all()
            if verbose:
                bt = bts[0]
                print('[%d:%s]' % (bt.browseTermID, bt.name), end='')
            for n in range(1, len(bts)):
                bt = bts[n]
                id = bt.id
                btID = bt.browseTermID
                api._deleteArtifactHasBrowseTerm(self.session, artifactID=id, browseTermID=btID)
                if verbose:
                    print(', %d:%d:%s' % (n, btID, bt.name), end='')
            if verbose:
                print(')', end='')
        self.session.commit()
        if verbose:
            if l > 0:
                print('.')

if __name__ == "__main__":
    import optparse

    url = 'mysql://dbadmin:D-coD#43@mysql.master:3306/flx2?charset=utf8'

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
        print('Fix artifacts that have more than one level browse terms.')

    a = FixArtifactBrowseTerms(url)
    a.fix(verbose)
