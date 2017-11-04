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

class SplitConceptArtifacts:

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

    def getParents(self, childID, creatorID):
        query = self.session.query(model.Artifact).distinct()
        query = query.join(model.ArtifactAndChildren, model.Artifact.id == model.ArtifactAndChildren.id)
        query = query.filter(model.ArtifactAndChildren.childID == childID)
        parents = query.all()
        pList = []
        for parent in parents:
            if parent.creatorID == creatorID:
                pList.append(parent)
        return pList

    def fix(self, concepts, run, verbose):
        self.session.begin()

        if verbose:
            print('concepts[%s]' % concepts)
        concepts = api._getArtifactsByIDs(self.session, concepts)
        if verbose:
            print('There are %d concepts to process.' % len(concepts))
        count = 0
        #
        #  Process the concept list.
        #
        for concept in concepts:
            if concept.artifactTypeID != 4:
                print('Artifact[%s][%s] is of type %d, not a concept.' % (concept.id, concept.handle, concept.artifactTypeID))
                continue
            revisions = concept.revisions
            crDict = {}
            crs = []
            offset = 0
            for cr in revisions:
                crDict[cr.id] = (offset, cr)
                crs.append(cr)
                offset += 1
            #
            #  Find the parent lessons.
            #
            crList = []
            lessons = self.getParents(concept.id, concept.creatorID)
            for lesson in lessons:
                lessonRevision = lesson.revisions[0]
                child = lessonRevision.children[0]
                offset, cr = crDict.get(child.hasArtifactRevisionID, (-1, None))
                if cr:
                    crList.append((offset, cr, lesson))
            #
            #  Process and split sharing concepts.
            #
            if len(crList) > 1:
                print('Concept[%d]' % concept.id, end='')
                for cr in concept.revisions:
                    print(', %d' % cr.id, end='')
                print('')
                crList.sort()
                total = len(crList)
                toCreate = False
                for n in range(0, total):
                    offset, cr, lesson = crList[n]
                    lessonRevision = lesson.revisions[0]
                    print('\tlesson[%s, %d, %d, %s] cr[%d, %s, %d]' % (lesson.handle, lesson.id, lessonRevision.id, lessonRevision.revision, cr.id, cr.revision, offset))
                    #
                    #  See if the concept artifact for this lesson exists already.
                    #
                    artifact = api._getArtifactByHandle(self.session, lesson.handle, concept.artifactTypeID, lesson.creatorID)
                    if artifact:
                        if artifact.id == concept.id:
                            base = 0
                        else:
                            base = len(artifact.revisions)
                    else:
                        base = 0
                        #
                        #  Create new concept Artifact.
                        #
                        data = {
                            'artifactTypeID': concept.artifactTypeID,
                            'name': lesson.name,
                            'description': concept.description,
                            'handle': lesson.handle,
                            'creatorID': lesson.creatorID,
                            'licenseID': lesson.licenseID,
                        }
                        artifact = model.Artifact(**data)
                        self.session.add(artifact)
                        if toCreate:
                            newArtifact = artifact
                    if hasattr(artifact, 'id') and artifact.id:
                        print('\t\t%s: ' % artifact.id, end='')
                    else:
                        print('\t\tnew: ', end='')
                    if n >= total - 1:
                        nextOffset = len(crs)
                    else:
                        nextOffset = crList[n + 1][0]
                    if nextOffset == offset:
                        #
                        #  Sharing the same revision of the concept.
                        #
                        #  Create a new concept Artifact and copy over the ArtifactRevisions.
                        nextOffset = len(crs)
                        toCreate = True
                        print('new ar ', end='')
                    #
                    #  Update ArtifactRevision.
                    #
                    if base == 0 or offset == nextOffset:
                        revisions = []
                    else:
                        revisions = artifact.revisions
                        ar = crs[0]
                        if revisions[0].id > ar.id:
                            r = offset
                            ext = len(revisions)
                            for ar in revisions:
                                ar.revision = ext + base + nextOffset - r
                                print('ar%d[%s, %s, %s] ' % (r, ar.id, ar.artifactID, ar.revision), end='')
                                self.session.add(ar)
                                r += 1
                    print('offset[%s] nextOffset[%s] base[%s] ' % (offset, nextOffset, base), end='')
                    for r in range(offset, nextOffset):
                        ar = crs[r]
                        if toCreate:
                            data = {
                                'revision': base + nextOffset - r,
                                'comment': ar.comment,
                                'messageToUsers': ar.messageToUsers,
                                'downloads': ar.downloads,
                                'favorites': ar.favorites,
                                'creationTime': ar.creationTime,
                                'publishTime': ar.publishTime,
                            }
                            ar = model.ArtifactRevision(**data)
                        else:
                            ar.revision = base + nextOffset - r
                        if hasattr(artifact, 'id') and artifact.id:
                            ar.artifactID = artifact.id
                        elif hasattr(ar, 'artifactID'):
                            del ar.artifactID
                        print('ar%d[%s, %s, %s] ' % (r, ar.id, ar.artifactID, ar.revision), end='')
                        revisions.append(ar)
                        self.session.add(ar)
                    artifact.revisions = revisions
                    self.session.add(artifact)
                    #
                    #  Update ArtifactRevisionRelation between lesson and concept.
                    #
                    child = lessonRevision.children[0]
                    child.child = revisions[0]
                    self.session.add(child)
                    print('')
                    toCreate = False
                count += 1

        if run:
            self.session.commit()
            print('Concepts splitted[%s]' % count)
        else:
            self.session.rollback()
            print('Concepts shown[%s]' % count)

if __name__ == "__main__":
    import optparse

    url = 'mysql://dbadmin:D-coD#43@mysql.master:3306/flx2?charset=utf8'
    concepts = ''

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
    run = options.run
    verbose = options.verbose

    if not concepts:
        print('Concept list missing.')
    concepts = concepts.split(',')
    if verbose:
        if run:
            print('Splitting concept artifacts with multiple parents.')
        else:
            print('Show concept artifacts with multiple parents.')

    c = SplitConceptArtifacts(url)
    c.fix(concepts, run, verbose)
