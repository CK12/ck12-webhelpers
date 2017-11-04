from __future__ import print_function

#import logging
import sys

#from datetime import datetime, timedelta

cmdFolder = '/opt/2.0/flx/pylons/flx'
if cmdFolder not in sys.path:
    sys.path.insert(0, cmdFolder)

import flx.lib.helpers as h
from flx.model import meta
from flx.model import model
#from flx.model import api

class BGSkillConcept:

    bgURL = 'http://braingenie.ck12.org/skills/'

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
        self.config = h.load_pylons_config()

    def getBGResources(self):
        query = self.session.query(model.Resource).distinct()
        query = query.filter(model.Resource.ownerID == 3)
        query = query.filter(model.Resource.uri.ilike('%s%%' % self.bgURL))
        bgResources = query.all()
        return bgResources

    def process(self, cvsfile, bgList, verbose):
        query = self.session.query(model.Artifact, model.BrowseTerm.encodedID, model.Resource.id, model.Resource.uri).distinct()
        query = query.filter(model.Artifact.creatorID == 3)
        query = query.join(model.ArtifactHasBrowseTerms, model.ArtifactHasBrowseTerms.artifactID == model.Artifact.id)
        query = query.join(model.BrowseTerm, model.BrowseTerm.id == model.ArtifactHasBrowseTerms.browseTermID)
        query = query.filter(model.BrowseTerm.termTypeID == 4)
        query = query.join(model.ArtifactRevision, model.ArtifactRevision.artifactID == model.Artifact.id)
        query = query.join(model.ArtifactRevisionHasResources, model.ArtifactRevisionHasResources.artifactRevisionID == model.ArtifactRevision.id)
        query = query.join(model.ResourceRevision, model.ResourceRevision.id == model.ArtifactRevisionHasResources.resourceRevisionID)
        query = query.join(model.Resource, model.Resource.id == model.ResourceRevision.resourceID)
        query = query.filter(model.Resource.id.in_(bgList))
        results = query.all()
        if verbose:
            print('Find %s artifacts' % len(results))

        f = open(cvsfile, 'w')
        try:
            f.write('aid, handle, encodedID, skillID\n')
            for artifact, encodedID, rid, uri in results:
                skill = uri.replace(self.bgURL, '')
                f.write('%d, %s, %s, %s\n' % (artifact.id, artifact.handle, encodedID, skill))
        finally:
            f.close()

    def findConceptLinks(self, csvFile, verbose):
        self.session.begin()
        bgResources = self.getBGResources()
        if verbose:
            print('Find %s braingenie resources' % len(bgResources))
        bgList = []
        for bgResource in bgResources: 
            bgList.append(bgResource.id)
        self.process(csvFile, bgList, verbose)
        self.session.commit()

if __name__ == "__main__":
    import optparse

    url = 'mysql://dbadmin:D-coD#43@mysql.master:3306/flx2?charset=utf8'
    csvFile = '/tmp/bg-skill-concept.csv'

    parser = optparse.OptionParser('%prog [options]')
    parser.add_option(
        '-d', '--database', dest='url', default=url,
        help='The URL for connecting to the 2.0 database. Defaults to %s' % url
    )
    parser.add_option(
        '-c', '--csv', dest='csvFile', default=csvFile,
        help='The csv file having artifact and image file assocation. Defaults to "/tmp/study-guides.csv".'
    )
    parser.add_option(
        '-q', '--quiet', action='store_false', dest='verbose', default=True,
        help='Turn verbose mode off.'
    )
    options, args = parser.parse_args()
    if args:
        parser.error('Expected no arguments. Got %r' % args)

    url = options.url
    csvFile = options.csvFile
    verbose = options.verbose

    print('Find the Braingenie skills link to CK-12 concepts, verbose[%s]' % verbose)

    c = BGSkillConcept(url)
    c.findConceptLinks(csvFile, verbose)
