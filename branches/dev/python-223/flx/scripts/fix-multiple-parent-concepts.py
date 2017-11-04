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
from flx.lib.helpers import safe_encode

class MultipleParentConcepts:

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

    def fix(self, concepts, memberID, run, verbose):
        self.session.begin()

        if verbose:
            print('concepts[%s]' % concepts)
        concepts = api._getArtifactsByIDs(self.session, concepts)
        if verbose:
            print('There are %d concepts to process.' % len(concepts))
        count = 0
        for concept in concepts:
            if concept.artifactTypeID != 4:
                print('Artifact[%s][%s] is of type %d, not a concept.' % (concept.id, concept.handle, concept.artifactTypeID))
                continue
            conceptRevision = concept.revisions[0]
            #
            #  Find the correct parent lesson.
            #
            lesson = api._getArtifactByHandle(self.session, concept.handle, 3, memberID)
            if lesson:
                diff = concept.id - lesson.id
                if abs(diff) > 10:
                    lesson = None
            if not lesson:
                print('No lesson found for concept[%d][%s]' % (concept.id, concept.handle))
                parents = conceptRevision.parents
                for parent in parents:
                    lesson = parent.parent.artifact
                    print('\tCurrent parent lesson[%s][%s]' % (lesson.id, lesson.handle))
                continue
            lessonRevision = lesson.revisions[0]
            children = lessonRevision.children
            if len(children) > 1:
                print('Lesson[%d] has more than 1 concpet.' % lesson.id)
            child = children[0]
            if child.hasArtifactRevisionID != conceptRevision.id:
                if run:
                    child.hasArtifactRevisionID = conceptRevision.id
                print('Fixing lesson[%s] -> concept[%s]' % (lesson.id, concept.id))
            if run:
                lessonRevision.children = [ child ]
                self.session.add(lessonRevision)
            count += 1

        if run:
            self.session.commit()
            print('Concepts fixed[%s]' % count)
        else:
            self.session.rollback()
            print('Concepts shown[%s]' % count)

if __name__ == "__main__":
    import optparse

    url = 'mysql://dbadmin:D-coD#43@mysql.master:3306/flx2?charset=utf8'
    concepts = ''
    memberID = 3

    parser = optparse.OptionParser('%prog [options]')
    parser.add_option(
        '-c', '--concepts', dest='concepts', default=concepts,
        help='The concept list, comma separated.'
    )
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

    url = options.url
    concepts = options.concepts
    memberID = options.memberID
    run = options.run
    verbose = options.verbose

    if not concepts:
        print('Concept list missing.')
    concepts = concepts.split(',')
    if verbose:
        if run:
            print('Correcting muliple parent concepts.')
        else:
            print('Show multiple parent concepts.')

    c = MultipleParentConcepts(url)
    c.fix(concepts, memberID, run, verbose)
