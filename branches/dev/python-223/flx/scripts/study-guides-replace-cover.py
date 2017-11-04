from __future__ import print_function

import logging
import os
import sys

from datetime import datetime, timedelta

cmdFolder = '/opt/2.0/flx/pylons/flx'
if cmdFolder not in sys.path:
    sys.path.insert(0, cmdFolder)

import flx.lib.helpers as h
from flx.model import meta
from flx.model import model
from flx.model import api

class StudyGuidesReplaceCover:

    def __init__(self, url):
        self.config = h.load_pylons_config()
        if meta.engine is None:
            from sqlalchemy import create_engine, orm, MetaData

            meta.engine = create_engine(url)
            sm = orm.sessionmaker(autoflush=False,
                                  autocommit=True,
                                  bind=meta.engine)
            meta.meta = MetaData()
            meta.Session = orm.scoped_session(sm)
        self.session = meta.Session()
        self.initCache(self.config)

    def initCache(self, config):
        keys = config.keys()
        cacheDict = {}
        for key in keys:
            if key.startswith('beaker.'):
                cacheDict[key] = config[key]

        from beaker.cache import CacheManager
        from beaker.util import parse_cache_config_options

        self.cache = CacheManager(**parse_cache_config_options(cacheDict))

    def replace(self, verbose, csvFileName):
        from flx.controllers.common import ArtifactCache
        import glob

        cache = ArtifactCache(session=self.session)
        self.session.begin()
        language = api._getLanguageByName(self.session, name='English')
        resourceTypeName = 'cover page'
        resourceType = api._getResourceTypeByName(self.session, name=resourceTypeName)
        with open(csvFileName, 'r') as f:
            import csv

            for aid, rid, png in csv.reader(f, delimiter=',', skipinitialspace=True):
                from datetime import datetime

                print('png[%s]' % png, end='')
                if not os.path.exists(png):
                    print(' does not exist.')
                    continue

                a = api._getArtifactByID(self.session, id=aid)
                if not a:
                    print(' aid, %s, not found.' % aid)
                    continue

                ar = a.revisions[0]
                print(', aid[%s], arid[%s]' % (aid, ar.id), end='')

                #uri = 'http://hints.ck12.org/study-guide-images/%s' % png
                uri = open(png, 'rb')
                rDict = {
                    'uri': uri,
                    'uriOnly': False,
                    'isExternal': False,
                    'resourceType': resourceTypeName,
                    'name': a.name,
                    'description': 'Cover image for %s' % a.name,
                    'language': language,
                    'ownerID': 3,
                    'creationTime': datetime.now(),
                    'authors': None,
                    'license': None,
                }
                try:
                    resourceRevision = api._createResource(self.session, resourceDict=rDict, artifactRevision=ar, resourceType=resourceType)
                except Exception as e:
                    resourceRevision = None
                    print(' Failed[%s].' % str(e))
                    continue

                print(', rid[%d], rrid[%d]' % (resourceRevision.resourceID, resourceRevision.id), end='')
                api._createArtifactHasResource(self.session, artifactRevisionID=ar.id, resourceRevisionID=resourceRevision.id)
                api.invalidateArtifact(cache, a, revision=ar, memberID=a.creatorID)
                print(' associated.')

        self.session.commit()

if __name__ == "__main__":
    import optparse

    url = 'mysql://dbadmin:D-coD#43@mysql.master:3306/flx2?charset=utf8'
    folder = '/tmp/study-guide-images'
    csv = '/tmp/study-guide-images.csv'

    parser = optparse.OptionParser('%prog [options]')
    parser.add_option(
        '-d', '--database', dest='url', default=url,
        help='The URL for connecting to the 2.0 database. Defaults to %s' % url
    )
    parser.add_option(
        '-c', '--csv', dest='csv', default=csv,
        help='The csv file having artifact and image file assocation. Defaults to "/tmp/study-guide-images.csv".'
    )
    parser.add_option(
        '-f', '--folder', dest='folder', default=folder,
        help='If specified, the output folder. Defaults to "/tmp/study-guide-images".'
    )
    parser.add_option(
        '-q', '--quiet', action='store_false', dest='verbose', default=False,
        help='Turn verbose mode off.'
    )
    options, args = parser.parse_args()
    if args:
        parser.error('Expected no arguments. Got %r' % args)

    url = options.url
    folder = options.folder
    csv = options.csv
    verbose = options.verbose

    print('Replace study guides covers from under folder %s' % folder)

    os.chdir(folder)
    c = StudyGuidesReplaceCover(url)
    c.replace(verbose, csvFileName=csv)
