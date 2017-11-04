from __future__ import print_function

import os
import sys

cmdFolder = '/opt/2.0/flx/pylons/flx'
if cmdFolder not in sys.path:
    sys.path.insert(0, cmdFolder)

import flx.lib.helpers as h
from flx.model import meta
from flx.model import model
from flx.model import api

import logging

logger = logging.getLogger('StudyGuidesUpload')
logger.setLevel(logging.DEBUG)
fh = logging.handlers.RotatingFileHandler('/tmp/StudyGuidesUpload.log', maxBytes=100*1024*1024, backupCount=30)
fh.setLevel(logging.DEBUG)
ch = logging.StreamHandler()
ch.setLevel(logging.INFO)
# create formatter and add it to the handlers
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
fh.setFormatter(formatter)
ch.setFormatter(formatter)
# add the handlers to the logger
logger.addHandler(fh)
logger.addHandler(ch)

class StudyGuidesUpload:

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

    def getStudyGuideResource(self, handle, ownerID, resourceTypeID):
        from sqlalchemy.sql import or_

        query = self.session.query(model.Resource).distinct()
        query = query.filter(model.Resource.ownerID == ownerID)
        query = query.filter(model.Resource.resourceTypeID == resourceTypeID)
        query = query.filter(or_(model.Resource.uri == handle, model.Resource.handle == handle))
        studyGuide = query.first()
        return studyGuide

    def updateResource(self, artifactRevisionID, docxResourceRevisionID, pdfResourceRevisionID):
        arr = api._getArtifactRevisionHasResource(self.session, artifactRevisionID, docxResourceRevisionID)
        arr.resourceRevisionID = pdfResourceRevisionID
        self.session.add(arr)

    def upload(self, verbose, checksum=False):
        import glob
        from flx.controllers.common import ArtifactCache

        cache = ArtifactCache(session=self.session)
        self.session.begin()
        language = api._getLanguageByName(self.session, name='English')
        resourceTypeName = 'studyguide'
        resourceType = api._getResourceTypeByName(self.session, name=resourceTypeName)
        member = api._getMemberByID(self.session, id=3)
        resourceIDList = []
        checksumList = []
        for f in glob.glob('*.pdf'):
            print(f, end='')
            if os.path.exists(f):
                from datetime import datetime

                handle = f.rsplit('/', 1)[-1].strip()
                uri = open(handle, 'rb')
                studyGuide = self.getStudyGuideResource(handle, member.id, resourceType.id)
                try:
                    isDocx = False
                    rDict = {
                        'handle': handle,
                        'uri': uri,
                        'uriOnly': False,
                    }
                    if not studyGuide:
                        #
                        #  Create resource.
                        #
                        rDict.update({
                            'name': f,
                            'description': 'Study guide %s' % f,
                            'resourceType': resourceTypeName,
                            'language': language,
                            'ownerID': member.id,
                            'creationTime': datetime.now(),
                            'authors': None,
                            'license': None,
                            'isAttachment': True,
                            'isExternal': False,
                        })
                        resourceRevision = api._createResource(self.session, resourceDict=rDict, resourceType=resourceType)
                        self.session.flush()
                        print(', %d, %d created' % (resourceRevision.resourceID, resourceRevision.id), end='')
                        resourceID = resourceRevision.resourceID
                    else:
                        #
                        #  Update resource.
                        #
                        rDict.update({
                            'name': studyGuide.name,
                            'description': studyGuide.description,
                            'resourceType': resourceType,
                            'language': studyGuide.language,
                            'ownerID': studyGuide.ownerID,
                            'license': studyGuide.license,
                            'isAttachment': True,
                            'isExternal': False,
                            'resourceRevision': studyGuide.revisions[0],
                        })
                        resourceRevision, copied, versioned = api._updateResource(self.session, resourceDict=rDict, member=member)
                        resourceID = resourceRevision.resourceID
                        print(', %d, %d' % (resourceRevision.resourceID, resourceRevision.id), end='')
                        if checksum:
                            resource = resourceRevision.resource
                            checksumList.append((resource.uri, resource.checksum))
                        print(' updated', end='')
                    #
                    #  Invalidate the resource cache
                    #
                    try:
                        results = api._getArtifactRevisionsForResource(self.session, resourceID, resourceRevision.id)
                        if not results:
                            #
                            #  See if .docx was used instead of .pdf.
                            #
                            handle = f.rsplit('/', 1)[-1].strip().replace('pdf', 'docx')
                            docxStudyGuide = self.getStudyGuideResource(handle, member.id, resourceType.id)
                            if docxStudyGuide:
                                docxResourceRevision = docxStudyGuide.revisions[0]
                                results = api._getArtifactRevisionsForResource(self.session, docxStudyGuide.id, docxResourceRevision.id)
                                if results:
                                    isDocx = True
                                    resourceID = docxStudyGuide.id
                                    print(':docx, %d, %d' % (docxStudyGuide.id, docxResourceRevision.id), end='')
                        invalidatedArtifactIDs = []
                        if results:
                            print(':count[%d]' % len(results), end='')
                        for result in results:
                            if hasattr(result, 'artifactRevision'):
                                artifactRevision = result.artifactRevision
                            else:
                                artifactRevision = api._getArtifactRevisionByID(self.session, id=result.revID)
                            if isDocx:
                                #
                                #  Replace resource from using docx to using pdf.
                                #
                                self.updateResource(artifactRevision.id, docxResourceRevision.id, resourceRevision.id)
                            artifactID = artifactRevision.artifactID
                            if artifactID not in invalidatedArtifactIDs:
                                invalidatedArtifactIDs.append(artifactID)
                                artifact = api._getArtifactByID(self.session, id=artifactID)
                                if artifact.artifactTypeID == 11:
                                    print(':%s,%s' % (artifactID, artifactRevision.id), end='')
                                    resource = resourceRevision.resource
                                    if resource and resource.description != artifact.description:
                                        resource.description = artifact.description
                                        self.session.add(resource)
                                try:
                                    api.invalidateArtifact(cache, artifact, revision=artifactRevision, memberID=artifact.creatorID, clearRelatedArtifacts=False)
                                except Exception as ce:
                                    print('\tArtifact resource cache invalidation error %s' % str(ce))
                    except Exception as e:
                        print('\tArtifact resource error %s' % str(e))
                    print('')
                    resourceIDList.append(int(resourceID))
                finally:
                    uri.close()

        #self.session.rollback()
        self.session.commit()
        print('')
        if checksum:
            print('checksum list: %s' % checksumList)
        resourceIDList.sort()
        print('resourceID list: %s' % resourceIDList)

if __name__ == "__main__":
    import optparse

    url = 'mysql://dbadmin:D-coD#43@mysql.master:3306/flx2?charset=utf8'
    folder = '/tmp/study-guide-images/x/sg_pdfs'
    checksum = False

    parser = optparse.OptionParser('%prog [options]')
    parser.add_option(
        '-d', '--database', dest='url', default=url,
        help='The URL for connecting to the 2.0 database. Defaults to %s' % url
    )
    parser.add_option(
        '-f', '--folder', dest='folder', default=folder,
        help='If specified, the output folder. Defaults to "/tmp/study-guide-images/x/sg_pdfs".'
    )
    parser.add_option(
        '-s', '--checksum', action='store_false', dest='checksum', default=False,
        help='If specified, the list of checksum will be generated for updating resources.'
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
    checksum = options.checksum
    verbose = options.verbose

    print('Upload study guides under folder %s' % folder)

    os.chdir(folder)
    c = StudyGuidesUpload(url)
    c.upload(verbose, checksum)
