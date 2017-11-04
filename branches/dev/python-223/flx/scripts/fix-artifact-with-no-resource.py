from __future__ import print_function

import sys

cmdFolder = '/opt/2.0/flx/pylons/flx'
if cmdFolder not in sys.path:
    sys.path.insert(0, cmdFolder)

from flx.model import meta
from flx.model import model
from flx.model import api
from flx.controllers.common import ArtifactCache

import flx.lib.helpers as h

class FixArtifactNoResource:

    def __init__(self, url):
        config = h.load_pylons_config()
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

    def recover(self, revisions, i, cache=None, run=False, verbose=True):
        size = len(revisions)
        revision = revisions[i] if i < size else None
        if not revision:
            if verbose:
                print('out of bound, ', end='')
            return 0

        rrs = revision.resourceRevisions
        if rrs and len(rrs) > 0:
            if verbose:
                print('already fixed, ', end='')
            return 0

        i += 1
        previousRevision = revisions[i] if i < size else None
        if not previousRevision:
            if verbose:
                print('No previous revision, remain empty, i[%d] ' % i, end='')
            return 0

        prrs = previousRevision.resourceRevisions
        if not prrs or len(prrs) == 0:
            self.recover(revisions, i, cache=cache, run=run, verbose=verbose)
            prrs = previousRevision.resourceRevisions

        if prrs and len(prrs) > 0:
            if run:
                for prr in prrs:
                    revision.resourceRevisions.append(prr)
                artifact = revision.artifact
                api.invalidateArtifact(cache, artifact, revision=revision, memberID=artifact.creatorID)
            if verbose:
                print('from[%s, %s] ' % (previousRevision.id, previousRevision.creationTime), end='')
            return 1

        return 0

    def fix(self, run=False, verbose=True):
        cache = ArtifactCache(session=self.session)
        self.session.begin()
        select = 'select distinct a.* from ArtifactRevisions ar, Artifacts a where a.id = ar.artifactID and a.artifactTypeID in (2, 3, 4, 8) and ar.id not in ( select distinct(artifactRevisionID) from ArtifactRevisionHasResources ) group by a.id'
        result = self.engine.execute(select)
        count = 0
        total = 0
        for a in result:
            query = self.session.query(model.Artifact)
            query = query.filter_by(id = a.id)
            artifact = query.first()
            if artifact:
                if verbose:
                    print('id[%s] creator[%s] type[%s] name[%s] ' % (artifact.id, artifact.creatorID, artifact.artifactTypeID, artifact.name.encode('utf-8')), end='')
                revisions = artifact.revisions
                if revisions and len(revisions) > 1:
                    if verbose:
                        print('size[%s] ' % len(revisions), end='')
                    count += self.recover(revisions, 0, cache=cache, run=run, verbose=verbose)
                if verbose:
                    print('')
            total += 1
        print('artifact total[%s]' % total)
        if run:
            self.session.commit()
            print('artifact fixed[%s]' % count)
        else:
            self.session.rollback()
            print('artifact found[%s]' % count)

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
    parser.add_option(
        '-r', '--run', action='store_true', dest='run', default=False,
        help='Actually performance the fix. Defaults to dry run only.'
    )
    options, args = parser.parse_args()
    if args:
        parser.error('Expected no arguments. Got %r' % args)

    run = options.run
    url = options.url
    verbose = options.verbose

    if verbose:
        if run:
            print('Fix artifacts that have lost their resources.')
        else:
            print('Find artifacts that have lost their resources.')

    a = FixArtifactNoResource(url)
    a.fix(run, verbose)
