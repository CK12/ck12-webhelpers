import logging
import sys

cmdFolder = '/opt/2.0/flx/pylons/flx'
if cmdFolder not in sys.path:
    sys.path.insert(0, cmdFolder)

import flx.lib.helpers as h
from flx.model import meta
from flx.model import model, init_model, getSQLAlchemyEngines
from flx.controllers.common import ArtifactCache

log = logging.getLogger(__name__)

encoding = 'utf-8'

class CacheArtifacts:

    def __init__(self, url, verbose):
        config = h.load_pylons_config()
        if meta.engine is None:
            engines = getSQLAlchemyEngines(config)
            init_model(engines)
        self.session = meta.Session()
        self.verbose = verbose
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

    def process(self, published, limit=100, dryRun=False):
        #
        #  Get the qualified artifacs.
        #
        aCache = ArtifactCache()
        size = limit
        count = 0
        cached = 0
        lastID = 0
        while size > 0:
            self.session.begin()
            query = self.session.query(model.Artifact.id,
                                       model.ArtifactRevision.id.label('arid'))
            query = query.filter(
                        model.Artifact.id == model.ArtifactRevision.artifactID)
            if published:
                query = query.filter(
                                model.ArtifactRevision.publishTime != None)
                query = query.order_by(model.Artifact.id,
                                       model.ArtifactRevision.id.desc())
            else:
                query = query.filter(
                                model.ArtifactRevision.publishTime == None)
            query = query.limit(limit)
            query = query.offset(count)
            rows = query.all()
            self.session.commit()
            size = len(rows)
            if size > 0:
                for a in rows:
                    #
                    #  Process artifacts.
                    #
                    if a.id == lastID:
                        toSkip = True
                    else:
                        toSkip = False
                        lastID = a.id
                    if self.verbose:
                        log.info('artifact[%s, %s] %s' % (a.id, a.arid, 'skipped' if toSkip else ''))
                        print 'artifact[%s, %s] %s' % (a.id, a.arid, 'skipped' if toSkip else '')
                    if not dryRun and not toSkip:
                        #aCache.load(a.id, revisionID=a.arid, infoOnly=True)
                        aCache.load(a.id, infoOnly=True)
                        cached += 1
                count += size
                if self.verbose:
                    log.info('Processed %d qualified artifacts, cached %d.' % (count, cached))
                    print '\tProcessed %d qualified artifacts, cached %d.' % (count, cached)


if __name__ == "__main__":
    import optparse

    class OptionParser(optparse.OptionParser):

        def format_description(self, formatter):
            return self.description


    url = 'mysql://dbadmin:D-coD#43@localhost:3306/flx2?charset=utf8'
    publishedOnly = True

    parser = OptionParser('%prog [options]', description=
"""Cache artifacts.
""")
    parser.add_option(
        '-a', '--all', dest='publishedOnly', default=True, action='store_false',
        help='Cached all the artifacts. Defaults to the published artifacts only.'
    )
    parser.add_option(
        '-d', '--database', dest='url', default=url, action='store',
        help='The URL for connecting to the database. Defaults to %s' % url
    )
    parser.add_option(
        '-q', '--quiet', action='store_false', dest='verbose', default=True,
        help='Turn verbose mode off.'
    )
    options, args = parser.parse_args()
    if args:
        parser.error('Expected no arguments. Got %r' % args)

    publishedOnly = options.publishedOnly
    url = options.url
    verbose = options.verbose

    if verbose:
        log.info('Caching artifacts from %s' % url)
        print 'Caching artifacts from %s' % url
    cache = CacheArtifacts(url, verbose)
    cache.process(True)
    if not publishedOnly:
        cache.process(False)
