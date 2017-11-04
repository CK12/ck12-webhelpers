from __future__ import print_function

import logging
import os
import sys

cmdFolder = '/opt/2.0/flx/pylons/flx'
if cmdFolder not in sys.path:
    sys.path.insert(0, cmdFolder)

import flx.lib.helpers as h
from flx.controllers.common import ArtifactCache
from flx.model import meta
from flx.model import model, init_model, getSQLAlchemyEngines
from flx.model import api
from flx.model.vcs import vcs as v
from flx.lib.helpers import safe_encode

from sqlalchemy.sql import func
from sqlalchemy.orm import aliased                                                                                                                      

class FixArtifactColonHandles:

    def __init__(self, url):
        config = h.load_pylons_config()
        if meta.engine is None:
            engines = getSQLAlchemyEngines(config)
            init_model(engines)
        self.session = meta.Session()
        self.initCache(config)

    def initCache(self, config):
        keys = config.keys()
        cacheDict = {}
        for key in keys:
            if key.startswith('beaker.'):
                cacheDict[key] = config[key]

        from beaker.cache import CacheManager
        from beaker.util import parse_cache_config_options

        self.cache = CacheManager(**parse_cache_config_options(cacheDict))

    def fix(self, verbose=True):
        self.session.begin()
        #
        #  Get the artifact pairs that are:
        #  - owned by 3 (ck12editor)
        #  - of web type
        #  - of the same name
        #  - with handles differed by ':'
        #
        a = aliased(model.Artifact, name='a')
        b = aliased(model.Artifact, name='b')
        query = self.session.query(a, b)
        query = query.filter(a.creatorID == 3)
        query = query.filter(b.creatorID == a.creatorID)
        query = query.filter(a.artifactTypeID == 34)
        query = query.filter(b.artifactTypeID == a.artifactTypeID)
        query = query.filter(b.name == a.name)
        query = query.filter(b.handle != a.handle)
        query = query.filter(a.handle.like('%%:%%'))
        result = query.all()
        for aa, ab in result:
            if aa.id < ab.id:
                d = ab
                k = aa
            else:
                d = aa
                k = ab
            #
            #  Deleting d and keeping k.
            #
            print('(%d, %s) -> (%d, %s)' % (d.id, d.handle, k.id, k.handle), end='')
            handle = d.handle
            idsDeleted = []
            idsKept = []
            api._deleteArtifact(self.session, d, cache=ArtifactCache(), idsToDelete=idsDeleted, idsToKeep=idsKept)
            if idsKept:
                print(' %s not deleted' % idsKept, end='')
            print('')
            k.handle = handle
            self.session.add(k)
        self.session.commit()

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
        print('Fix artifacts that have multiple handles.')

    a = FixArtifactColonHandles(url)
    a.fix(verbose)
