# -*- coding: utf-8 -*-

import sys
from datetime import datetime

from flx.tests import *
from flx.model import meta
from flx.model import api

bookType = 'book'
chapterType = 'chapter'

class TestLibraryAPIs(TestController):

    def setUp(self):
        super(TestLibraryAPIs, self).setUp()
        #session = meta.Session()
        self.login = 'stephen'
        self.member = api.createMember(gender='male',
                                       login=self.login,
                                       defaultLogin=self.login,
                                       stateID=2,
                                       authTypeID=1,
                                       token='youguessit',
                                       email='stephen@ck12.org',
                                       givenName='Stephen',
                                       surname='AuYeung',
                                       emailVerified=True,
                                       roleID=5,
                                       authID=1000
                                      )
        memberID = self.member.id
        ## Clean up the library
        objects = api.getLibraryArtifactRevisions(memberID=memberID)
        for object in objects:
            api.removeObjectFromLibrary(objectID=object.artifactRevisionID, objectType='artifactRevision', memberID=memberID)
        objects = api.getLibraryResourceRevisions(memberID=memberID)
        for object in objects:
            api.removeObjectFromLibrary(objectID=object.resourceRevisionID, objectType='resourceRevision', memberID=memberID)

    def tearDown(self):
        super(TestLibraryAPIs, self).tearDown()
        api.deleteMemberByID(id=self.member.id)
 
    def test_addToLibrary(self):
        memberID = self.member.id
        books = api.getArtifacts(typeName=bookType)
        objectIDs = []
        for book in books:
            objectIDs.append(book.revisions[0].id)
            api.addObjectToLibrary(objectID=book.revisions[0].id, objectType='artifactRevision', memberID=memberID)

        objects = api.getLibraryArtifactRevisions(memberID=memberID) 
        print len(objects)
        assert objects
        assert len(objects) == len(objectIDs)
        for obj in objects:
            assert obj.artifactRevision.id in objectIDs

        ## Remove objects
        for objectID in objectIDs:
            api.removeObjectFromLibrary(objectID=objectID, objectType='artifactRevision', memberID=memberID)

        objects = api.getLibraryArtifactRevisions(memberID=memberID) 
        assert len(objects) == 0

    def test_addToLibraryWithLabels(self):
        memberID = self.member.id
        books = api.getArtifacts(typeName=bookType)
        objectIDs = []
        for book in books:
            objectIDs.append(book.revisions[0].id)
            api.addObjectToLibrary(objectID=book.revisions[0].id, objectType='artifactRevision', memberID=memberID, labels=['test1', 'test2'])

        objects = api.getLibraryArtifactRevisions(memberID=memberID) 
        assert objects
        assert len(objects) == len(objectIDs)
        for obj in objects:
            assert obj.artifactRevisionID in objectIDs
            labels = api.getMemberLabelsForArtifactRevision(memberID=memberID, artifactRevisionID=obj.artifactRevisionID)
            for lbl in labels:
                print obj.artifactRevisionID, lbl.label.label
                assert lbl.label.label in ['test1', 'test2']

        for obj in objects:
            api.createMemberLibraryObjectHasLabel(objectID=obj.artifactRevisionID, objectType='artifactRevision', memberID=memberID, label='test3')

        objects = api.getLibraryArtifactRevisions(memberID=memberID) 
        assert objects
        for obj in objects:
            assert obj.artifactRevisionID in objectIDs
            found = False
            labels = api.getMemberLabelsForArtifactRevision(memberID=memberID, artifactRevisionID=obj.artifactRevisionID)
            for lbl in labels:
                print obj.artifactRevisionID, lbl.label.label
                if lbl.label.label == 'test3':
                    found = True
                    break
            assert found

        ## Remove labels
        for obj in objects:
            print "Deleting 'test2' for %d" % obj.artifactRevisionID
            api.deleteMemberLibraryObjectHasLabel(objectID=obj.artifactRevisionID, objectType='artifactRevision', memberID=memberID, label='test2')
        
        lblTest2 = api.getMemberLabelByName(memberID=memberID, label='test2')
        objects = api.getLibraryArtifactRevisions(memberID=memberID) 
        for obj in objects:
            found = False
            mapping = api.getMemberLibraryObjectHasLabel(libraryObjectID=obj.id, labelID=lblTest2.id)
            assert mapping is None, "Error removing label"

        ## Remove objects
        for objectID in objectIDs:
            api.removeObjectFromLibrary(objectID=objectID, objectType='artifactRevision', memberID=memberID)

        objects = api.getLibraryArtifactRevisions(memberID=memberID) 
        assert len(objects) == 0

    def test_addAndRemoveLabels(self):
        memberID = self.member.id
        books = api.getArtifacts(typeName=bookType, pageNum=1, pageSize=1)
        for book in books:
            api.addObjectToLibrary(objectID=book.revisions[0].id, objectType='artifactRevision', memberID=memberID)
            api.createMemberLibraryObjectHasLabel(objectID=book.revisions[0].id, objectType='artifactRevision', memberID=memberID, label='test_addremove')

        ids = []
        objects = api.getLibraryArtifactRevisions(memberID=memberID)
        for obj in objects:
            assert obj.labels[0].labelName == 'test_addremove'
            ids.append(obj.id)

        lbl = api.getMemberLabelByName(memberID=memberID, label='test_addremove')
        assert lbl
        for objID in ids:
            api.deleteMemberLibraryObjectHasLabel(objectID=obj.artifactRevisionID, objectType=obj.objectType, memberID=memberID, label='test_addremove')

        mapping = api.getMemberLibraryObjectHasLabel(libraryObjectID=ids[0], labelID=lbl.id)
        assert mapping is None
