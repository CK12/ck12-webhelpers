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

class StudyGuidesPDF2PNG:

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

    def getStudyGuideResources(self):
        query = self.session.query(model.Resource.id, model.Resource.handle, model.Resource.satelliteUrl, model.Artifact.id).distinct()
        query = query.filter(model.Resource.resourceTypeID == 16)
	query = query.join(model.ResourceRevision, model.ResourceRevision.resourceID == model.Resource.id)
        query = query.join(model.ArtifactRevisionHasResources, model.ArtifactRevisionHasResources.resourceRevisionID == model.ResourceRevision.id)
        query = query.join(model.ArtifactRevision, model.ArtifactRevision.id == model.ArtifactRevisionHasResources.artifactRevisionID)
        query = query.join(model.Artifact, model.Artifact.id == model.ArtifactRevision.artifactID)
        query = query.filter(model.Artifact.artifactTypeID == 11)
        query = query.filter(model.Artifact.creatorID == 3)
        studyGuides = query.all()
        return studyGuides

    def runCommand(self, cmd):
        import subprocess

        o = subprocess.check_output(cmd.split(' '))
        if o:
            print('cmd[%s]' % o)

    def convert(self, verbose, showDocxUrlOnly=False, csvOnly=False):
        self.session.begin()
        #
        #  Get MemberExtData entries.
        #
        studyGuides = self.getStudyGuideResources()
        if verbose:
            print('There are %d study guides ' % len(studyGuides), end='')

        csv = open('/tmp/study-guide-images.csv', 'w')
        try:
            for rid, handle, surl, aid in studyGuides:
                handle = handle.strip().lower()
                filename = '%s.png' % os.path.splitext(handle)[0]
                row = '%d, %d, "%s"\n' % (aid, rid, filename)
                csv.write(row)
                if not csvOnly:
                    curl = 'curl -o %s -s -S %s' % (handle, surl)
                    if not showDocxUrlOnly:
                        #
                        #  Download the study guide document.
                        #
                        print(curl)
                        self.runCommand(curl)
                    #
                    #  Convert based on type.
                    #
                    if handle.endswith('.pdf'):
                        if not showDocxUrlOnly:
                            convert = 'convert -density 300 -trim %s[0] -quality 100 %s' % (handle, filename)
                            print(convert)
                            self.runCommand(convert)
                    elif handle.endswith('.docx'):
                        if showDocxUrlOnly:
                            curl = 'curl -o "%s" -s -S "%s"' % (str(handle), str(surl))
                            print(curl)
                    else:
                        print('skipping %s: aid[%s] rid[%s]' % (curl, aid, rid))
        finally:
            csv.close()
        self.session.commit()

if __name__ == "__main__":
    import optparse

    url = 'mysql://dbadmin:D-coD#43@mysql.master:3306/flx2?charset=utf8'
    folder = '/tmp/study-guide-images'
    show = False

    parser = optparse.OptionParser('%prog [options]')
    parser.add_option(
        '-d', '--database', dest='url', default=url,
        help='The URL for connecting to the 2.0 database. Defaults to %s' % url
    )
    parser.add_option(
        '-f', '--folder', dest='folder', default=folder,
        help='If specified, the output folder. Defaults to "/tmp/inactive-members.csv".'
    )
    parser.add_option(
        '-q', '--quiet', action='store_false', dest='verbose', default=False,
        help='Turn verbose mode off.'
    )
    parser.add_option(
        '-s', '--show', action='store_true', dest='show', default=False,
        help='Show the command to download docx files only.'
    )
    options, args = parser.parse_args()
    if args:
        parser.error('Expected no arguments. Got %r' % args)

    url = options.url
    folder = options.folder
    show = options.show
    verbose = options.verbose

    print('Convert study guides from PDF to PNG, show=%s' % show)

    os.chdir(folder)
    c = StudyGuidesPDF2PNG(url)
    c.convert(verbose, show)
