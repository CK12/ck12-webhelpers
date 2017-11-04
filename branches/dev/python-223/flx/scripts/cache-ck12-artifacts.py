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
from flx.controllers.common import ArtifactCache

import flx.lib.helpers as h

class CacheCK12Artifact:

    def __init__(self, url, force=False):
        config = h.load_pylons_config()
        if meta.engine is None:
            from sqlalchemy import create_engine, orm, MetaData

            meta.engine = create_engine(url)
            sm = orm.sessionmaker(autoflush=False,
                                  autocommit=True,
                                  bind=meta.engine)
            meta.meta = MetaData()
            meta.Session = orm.scoped_session(sm)
        self.force = force
        self.session = meta.Session()
        self.initCache(config)
        h.initTranslator()

    def initCache(self, config):
        keys = config.keys()
        cacheDict = {}
        for key in keys:
            if key.startswith('beaker.'):
                cacheDict[key] = config[key]

        from beaker.cache import CacheManager
        from beaker.util import parse_cache_config_options

        self.cache = CacheManager(**parse_cache_config_options(cacheDict))

    def process(self):
        limit = 50
        offset = 0
        size = limit
        self.session.begin()
        query = self.session.query(model.Artifact)
        query = query.filter_by(creatorID = 3)
        count = query.count()
        if verbose:
            print('Caching %d artifacts.' % count)
        cache = ArtifactCache(session=self.session)
        while size > 0:
            #
            #  Get the artifacts.
            #
            query = query.limit(limit)
            query = query.offset(offset)
            artifacts = query.all()
            size = len(artifacts)
            if size > 0:
                first = True
                for artifact in artifacts:
                    if verbose:
                        if first:
                            first = False
                        else:
                            print(',', end='')
                        print('%d' % artifact.id, end='')
                    if self.force:
                        api.invalidateArtifact(cache, artifact, memberID=artifact.creatorID)
                    a = cache.load(artifact.id, minimalOnly=True)
                offset += size
                if verbose:
                    print('  ::%d::  ' % offset, end='')
        self.session.commit()
        if verbose:
            print('Done.')

if __name__ == "__main__":
    import optparse

    force = False
    url = 'mysql://dbadmin:D-coD#43@mysql.master:3306/flx2?charset=utf8'

    parser = optparse.OptionParser('%prog [options]')
    parser.add_option(
        '-d', '--database', dest='url', default=url,
        help='The URL for connecting to the 2.0 database. Defaults to %s' % url
    )
    parser.add_option(
        '-f', '--force', action='store_true', dest='force', default=False,
        help='Force the caching, invalidate first. Use to regenerate artifact cache on systems after reloading data from the production database.'
    )
    parser.add_option(
        '-q', '--quiet', action='store_false', dest='verbose', default=True,
        help='Turn verbose mode off.'
    )
    options, args = parser.parse_args()
    if args:
        parser.error('Expected no arguments. Got %r' % args)

    force = options.force
    url = options.url
    verbose = options.verbose

    if verbose:
        print('Cache CK-12 artifacts')
        if force:
            print('Forcing')

    c = CacheCK12Artifact(url, force)
    c.process()
