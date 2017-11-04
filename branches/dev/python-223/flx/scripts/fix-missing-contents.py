from __future__ import print_function

import sys

cmdFolder = '/opt/2.0/flx/pylons/flx'
if cmdFolder not in sys.path:
    sys.path.insert(0, cmdFolder)

from flx.model import meta
from flx.model import model
from flx.lib import helpers as h

class FixEmptyResource:

    def __init__(self, url, verbose):
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
        self.initCache(config)
        self.verbose = verbose

    def initCache(self, config):
        keys = config.keys()
        cacheDict = {}
        for key in keys:
            if key.startswith('beaker.'):
                cacheDict[key] = config[key]

        from beaker.cache import CacheManager
        from beaker.util import parse_cache_config_options

        self.cache = CacheManager(**parse_cache_config_options(cacheDict))

    def fix(self, aids=None, memberID=None, artifactTypeID=None):
        from flx.controllers.common import ArtifactCache

        cache = ArtifactCache(session=self.session)

        self.session.begin()
        query = self.session.query(model.ArtifactRevision.id, model.ArtifactRevision.artifactID)
        query = query.filter(model.ArtifactRevision.artifactID == model.Artifact.id)
        if artifactTypeID:
            query = query.filter(model.Artifact.artifactTypeID == artifactTypeID)
        if aids:
            query = query.filter(model.Artifact.id.in_(aids))
        if memberID:
            query = query.filter(model.Artifact.creatorID == memberID)
        query = query.order_by(model.ArtifactRevision.artifactID.asc(), model.ArtifactRevision.id.desc())
        ids = query.all()
        print('Artifact revision count[%d]' % len(ids))
        arids = []
        count = 0
        oaid = None
        for arid, aid in ids:
            if oaid == aid:
                continue
            oaid = aid
            #
            #  Check and see if it has content.
            #
            query = self.session.query(model.ArtifactRevisionHasResources)
            query = query.filter_by(artifactRevisionID=arid)
            query = query.join(model.ResourceRevision, model.ResourceRevision.id == model.ArtifactRevisionHasResources.resourceRevisionID)
            query = query.join(model.Resource, model.Resource.id == model.ResourceRevision.resourceID)
            query = query.filter(model.Resource.resourceTypeID == 1)
            arhr = query.first()
            if arhr:
                continue
            #
            #  No content, try to copy from one of its previous
            #  revisions that do.
            #
            from flx.model import api

            artifact = api._getArtifactByID(self.session, id=aid)
            revisions = artifact.revisions
            if len(revisions) > 1:
                fixed = False
                for n in range(1, len(revisions)):
                    par = revisions[n]
                    if hasattr(par, 'resourceRevisions') and par.resourceRevisions:
                        arhrs = par.resourceRevisions
                    else:
                        query = self.session.query(model.ArtifactRevisionHasResources)
                        query = query.filter_by(artifactRevisionID=par.id)
                        query = query.join(model.ResourceRevision, model.ResourceRevision.id == model.ArtifactRevisionHasResources.resourceRevisionID)
                        query = query.join(model.Resource, model.Resource.id == model.ResourceRevision.resourceID)
                        query = query.filter(model.Resource.resourceTypeID == 1)
                        arhrs = query.all()
                    if arhrs and len(arhrs) > 0:
                        #
                        #  Found a revision with content.
                        #
                        i = n
                        while i > 0:
                            i -= 1
                            ar = revisions[i]
                            ar.resourceRevisions = arhrs
                            if self.verbose:
                                print('i[%s] arid[%s] aid[%s] type[%s] creator[%s] len[%s]' % (i, ar.id, aid, artifact.artifactTypeID, artifact.creatorID, len(arhrs)))
                            self.session.add(ar)
                        fixed = True
                        break
                if fixed:
                    api.invalidateArtifact(cache, artifact, revision=revisions[0], memberID=artifact.creatorID)
                    arids.append(aid)
                    count += 1

            if ( count % 1000 ) == 0 and len(arids) > 0:
                self.session.commit()
                tid = h.reindexArtifacts(arids, 1)
                if self.verbose:
                    print('Processed count[%d] reindex task[%s]' % (count, tid))
                arids = []
                self.session.begin()

        print('Total processed count[%d]' % count)
        self.session.commit()
        if len(arids) > 0:
            tid = h.reindexArtifacts(arids, 1)
            if self.verbose:
                print('Reindex task[%s]' % tid)
        print('Done.')

if __name__ == "__main__":
    import optparse

    url = 'mysql://dbadmin:SeeK#94E03@mysql.master:3306/flx2?charset=utf8'
    aids = None
    artifactTypeID = None
    memberID = None

    parser = optparse.OptionParser('%prog [options]')
    parser.add_option(
        '-a', '--artifacts', dest='aids', default=aids,
        help='The artifact list to be fixed (optional).'
    )
    parser.add_option(
        '-d', '--database', dest='url', default=url,
        help='The URL for connecting to the 2.0 database. Defaults to %s' % url
    )
    parser.add_option(
        '-m', '--member', dest='memberID', default=memberID,
        help='The memberID to be fixed (optional).'
    )
    parser.add_option(
        '-t', '--type', dest='artifactTypeID', default=artifactTypeID,
        help='The memberID to be fixed (optional).'
    )
    parser.add_option(
        '-q', '--quiet', action='store_false', dest='verbose', default=True,
        help='Turn verbose mode off.'
    )
    options, args = parser.parse_args()
    if args:
        parser.error('Expected no arguments. Got %r' % args)

    url = options.url
    aids = options.aids
    artifactTypeID = options.artifactTypeID
    memberID = options.memberID
    verbose = options.verbose

    if aids:
        aids = aids.split(',')
    if verbose:
        print('Fixing artifacts with empty content ', end='')
        if aids:
            print('for artifact list %s' % aids, end='')
        if artifactTypeID:
            print('for artifact type with id %s' % artifactTypeID, end='')
        if memberID:
            print('for member with id %s' % memberID, end='')
        print('')

    c = FixEmptyResource(url, verbose)
    c.fix(aids=aids, memberID=memberID, artifactTypeID=artifactTypeID)
