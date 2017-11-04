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

class FixArtifactNotLatestResource:

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

    def fix(self, memberID, run=False, verbose=True):
        cache = ArtifactCache(session=self.session)
        self.session.begin()

        query = self.session.query(model.Resource)
        query = query.filter_by(resourceTypeID = 1)
        query = query.join(model.ResourceRevision, model.ResourceRevision.resourceID == model.Resource.id)
        query = query.join(model.ArtifactRevisionHasResources, model.ArtifactRevisionHasResources.resourceRevisionID == model.ResourceRevision.id)
        query = query.join(model.ArtifactRevision, model.ArtifactRevision.id == model.ArtifactRevisionHasResources.artifactRevisionID)
        query = query.join(model.Artifact, model.Artifact.id == model.ArtifactRevision.artifactID)
        query = query.filter(model.Artifact.artifactTypeID == 4)
        query = query.filter(model.Artifact.creatorID == memberID)
        resources = query.all()
        if verbose:
            print('There are %d resources' % len(resources))
        resourceDict = {}
        for resource in resources:
            """
            contentRevisionID = self.session.query(model.Content.contentRevisionID) \
                                    .filter(model.Content.resourceURI == resource.uri) \
                                    .filter(model.Content.ownerID == memberID) \
                                    .order_by(model.Content.contentRevisionID.desc()) \
                                    .limit(1) \
                                    .scalar()
            """
            resourceDict[int(resource.id)] = resource

        count = 0
        total = 0
        select = 'select x.id, x.artifactID from ( select ar.* from ArtifactRevisions ar, Artifacts a where ar.artifactID = a.id and a.creatorID = %s and a.artifactTypeID = 4 order by artifactID, id desc ) x group by artifactID' % memberID
        results = self.engine.execute(select)
        if verbose:
            print('processing artifact revisions')
        alist = []
        for arid, aid in results:
            query = self.session.query(model.ResourceRevision)
            query = query.join(model.ArtifactRevisionHasResources, model.ArtifactRevisionHasResources.resourceRevisionID == model.ResourceRevision.id)
            query = query.filter(model.ArtifactRevisionHasResources.artifactRevisionID == arid)
            query = query.join(model.Resource, model.Resource.id == model.ResourceRevision.resourceID)
            query = query.filter(model.Resource.resourceTypeID == 1)
            query = query.order_by(model.ResourceRevision.id.desc())
            resourceRevision = query.first()
            if not resourceRevision:
                print('No rr for arid[%s]' % arid)
                continue
            resource = resourceDict.get(int(resourceRevision.resourceID))
            if not resource:
                print('resource[%s] not found' % resourceRevision.resourceID)
                continue
            rr = resource.revisions[0]
            if resourceRevision.id != rr.id:
                query = self.session.query(model.ArtifactRevisionHasResources)
                query = query.filter_by(artifactRevisionID = arid)
                query = query.filter_by(resourceRevisionID = resourceRevision.id)
                arr = query.first()
                if run:
                    arr.resourceRevisionID = rr.id
                    self.session.add(arr)
                print('aid[%s] arid[%d] rid[%s] rrid[%d] rr.revision[%s] curr[%s]' % (aid, arid, resource.id, rr.id, rr.revision, resourceRevision.revision))
                alist.append(aid)
                count += 1
            total += 1
        print('There were %d artifact revisions.' % total)

        first = True
        for aid in alist:
            if first:
                first = False
            else:
                print(',', end='')
            print(aid, end='')
        print('')

        if run:
            self.session.commit()
            print('artifact fixed[%s]' % count)
        else:
            self.session.rollback()
            print('artifact found[%s]' % count)

if __name__ == "__main__":
    import optparse

    url = 'mysql://dbadmin:D-coD#43@mysql.master:3306/flx2?charset=utf8'
    memberID = 3

    parser = optparse.OptionParser('%prog [options]')
    parser.add_option(
        '-d', '--database', dest='url', default=url,
        help='The URL for connecting to the 2.0 database. Defaults to %s' % url
    )
    parser.add_option(
        '-m', '--member', dest='memberID', default=memberID,
        help='The memberID to be fixed.'
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
    memberID = options.memberID
    verbose = options.verbose

    if verbose:
        if run:
            print('Fix resources that are not referencing the latest in the database.')
        else:
            print('Find resources that are not referencing the latest in the database.')

    a = FixArtifactNotLatestResource(url)
    a.fix(memberID, run, verbose)
