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

class Chapter:

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

    def getChildDict(self, children):
        childDict = {}
        if len(children) > 0:
            idList = []
            for child in children:
                idList.append(child.hasArtifactRevisionID)
            query = self.session.query(model.ArtifactRevision)
            query = query.filter(model.ArtifactRevision.id.in_(idList))
            ars = query.all()
            for ar in ars:
                id = ar.artifactID
                if childDict.has_key(id):
                    childDict[id].append(child.hasArtifactRevisionID)
                else:
                    childDict[id] = [ child.hasArtifactRevisionID ]
            #print('childDict[%s]' % childDict)
        return childDict

    def processArtifacts(self, id, idList):
        query = self.session.query(model.Artifact)
        query = query.filter_by(id = id)
        parent = query.one()
        query = self.session.query(model.Artifact)
        query = query.filter(model.Artifact.id.in_(idList))
        children = query.all()
        for child in children:
            if child.artifactTypeID == 2 and child.creatorID == parent.creatorID:
                import re

                cPattern = model.getChapterSeparator()
                cItems = re.split(cPattern, child.handle)
                cItem = cItems[0]
                rPattern = '-::rev::-'
                rItems = re.split(rPattern, cItem)
                if len(rItems) == 1:
                    cItems[0] = '%s%s%s' % (cItem, rPattern, len(child.revisions))
                else:
                    rItems[-1] = str(len(child.revisions))
                    cItems[0] = rPattern.join(rItems)
                handle = cPattern.join(cItems)
                if handle != child.handle:
                    print('id[%s] type[%s] handle old[%s] new[%s]' % (child.id, child.artifactTypeID, safe_encode(child.handle), safe_encode(handle)))
                    child.handle = handle
                    self.session.add(child)

    def processHiddenChapters(self):
        print('Adding revision information to the name of those ', end='')
        print('ArtifactRevision instances that were removed from ', end='')
        print('the next revision.')

        self.session.begin()
        query = self.session.query(model.Artifact)
        query = query.filter(model.Artifact.artifactTypeID == 1)
        query = query.filter(model.Artifact.creatorID >= 5)
        books = query.all()
        #print('count books[%s]' % len(books))
        idList = []
        for book in books:
            idList.append(book.id)
        query = self.session.query(model.ArtifactRevision)
        query = query.filter(model.ArtifactRevision.artifactID.in_(idList))
        query = query.order_by(model.ArtifactRevision.artifactID)
        query = query.order_by(model.ArtifactRevision.id)
        revisions = query.all()
        #print('count revisions[%s]' % len(revisions))
        bookDict = {}
        prevAid = None
        prevRevision = None
        for revision in revisions:
            aid = revision.artifactID
            if prevAid == aid:
                if not bookDict.has_key(aid):
                    bookDict[aid] = [ prevRevision ]
                bookDict[aid].append(revision)
            else:
                prevAid = aid
                prevRevision = revision
        bookList = bookDict.keys()
        #print('count bookList[%s]' % len(bookList))
        for aid in bookList:
            revList = bookDict[aid]
            if len(revList) > 1:
                pChildDict = self.getChildDict(revList[0].children)
                for n in range(1, len(revList)):
                    childDict = self.getChildDict(revList[n].children)
                    for id in childDict.keys():
                        if pChildDict.has_key(id):
                            del pChildDict[id]
                    if len(pChildDict) > 0:
                        self.processArtifacts(aid, pChildDict.keys())
                    pChildDict = childDict
        self.session.commit()

    def processAloneChapters(self):
        """
            select ar.id, a.id, a.name, a.creatorID
                from ArtifactRevisions as ar, Artifacts as a
                where a.id = ar.artifactID and a.artifactTypeID = 2 and
                      ar.id not in ( select distinct hasArtifactRevisionID from ArtifactRevisionRelations ) and
                      a.creatorID >= 5 order by a.creatorID, a.id, ar.id;
        """
        print('Removing chapters whose revision has no parent (i.e., ', end='')
        print('no book using it). The removal may fail and will be ', end='')
        print('ignored since that means there may be other ', end='')
        print('artifacts, or resources depending on it.')

        from sqlalchemy import and_, not_

        query = self.session.query(model.ArtifactRevisionRelation)
        query = query.distinct(model.ArtifactRevisionRelation.hasArtifactRevisionID)
        rels = query.all()
        idDict = {}
        for rel in rels:
            idDict[rel.hasArtifactRevisionID] = rel.hasArtifactRevisionID
        idList = idDict.keys()
        #print('count idList[%s]' % len(idList))
        query = self.session.query(model.ArtifactRevision)
        query = query.filter(model.Artifact.id == model.ArtifactRevision.artifactID)
        query = query.filter(model.Artifact.artifactTypeID == 2)
        query = query.filter(model.Artifact.creatorID >= 5)
        query = query.filter(not_(model.ArtifactRevision.id.in_(idList)))
        query = query.order_by(model.Artifact.creatorID)
        query = query.order_by(model.Artifact.id)
        query = query.order_by(model.ArtifactRevision.id)
        ars = query.all()
        arsDict = {}
        for ar in ars:
            arsDict[ar.id] = ar.artifactID
        #print('count arList[%s]' % len(ars))
        count = 0
        for ar in arsDict.keys():
            print('Removing ArtifactRevision id[%s] aid[%s]: ' % (ar, arsDict[ar]), end='')
            try:
                id = long(arsDict[ar])
                a = api.getArtifactByID(id=id)
                if a is not None:
                    deleted, kept = api.deleteArtifact(artifact=a)
                    if id in deleted:
                        count += 1
                    print('Succeeded deleted%s, kept%s' % (deleted, kept))
                else:
                    print('Not found')
            except Exception, e:
                print('Failed[%s]' % e)
        return count


if __name__ == "__main__":
    import optparse

    url = 'mysql://dbadmin:D-coD#43@lilyserver.ck12.org:3306/flx2?charset=utf8'

    parser = optparse.OptionParser('%prog [options]')
    parser.add_option(
        '-d', '--database', dest='url', default=url,
        help='The URL for connecting to the 2.0 database. Defaults to %s' % url
    )
    parser.add_option(
        '-q', '--quiet', action='store_false', dest='verbose', default=True,
        help='Turn verbose mode off.'
    )
    options, args = parser.parse_args()
    if args:
        parser.error('Expected no arguments. Got %r' % args)

    url = options.url
    verbose = options.verbose

    if verbose:
        print('Correcting problem chapters')

    c = Chapter(url)
    c.processHiddenChapters()
    count = 1
    while count > 0:
        count = c.processAloneChapters()
        print('Deleted %d chapters in this round' % count)
