# -*- coding: utf-8 -*-

import random
import os
from datetime import datetime

from flx.tests import *
from flx.model import meta
from flx.model import model
from flx.model import api
from flx.lib import helpers as h
from flx.controllers.common import ArtifactCache

bookType = 'book'
chapterType = 'chapter'

class TestAPIs(TestController):
    authID = 200

    def setUp(self):
        super(TestAPIs, self).setUp()
        self.useImageSatellite, self.imageSatelliteServer, self.iamImageSatellite = h.getImageSatelliteOptions()
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
                                       roleID=5,
                                       emailVerified=True,
                                       authID=self.authID
                                      )
        self.authID += 1

    def tearDown(self):
        super(TestAPIs, self).tearDown()
        api.deleteMemberByID(id=self.member.id)
            
    def test_browseArtifacts(self):
        session = meta.Session()
        query = session.query(model.Artifact)
        artifacts = query.all()
        m = random.randint(0, len(artifacts) - 1)
        artifact = artifacts[m]
        browseTerms = artifact.getBrowseTerms()
        if browseTerms:
            for browseTerm in browseTerms:
            #if browseTerms is not None and len(browseTerms) > 0:
                #n = random.randint(0, len(browseTerms) - 1)
                #browseTerm = browseTerms[n]
                result = api.browseArtifacts(term=browseTerm['term'])
                assert result is not None and len(result) > 0

    def test_browseBooks(self):
        books = api.getArtifacts(typeName=bookType)
        for book in books:
            browseTerms = book.getBrowseTerms()
            for browseTerm in browseTerms:
            #if browseTerms is not None and len(browseTerms) > 0:
                #n = random.randint(0, len(browseTerms) - 1)
                #browseTerm = browseTerms[n]
                result = api.browseArtifacts(term=browseTerm['term'], typeNames=[bookType])
                assert result is not None and len(result) > 0

    def test_browseChapters(self):
        chapters = api.getArtifacts(typeName=chapterType)
        m = random.randint(0, len(chapters) - 1)
        chapter = chapters[m]
        browseTerms = chapter.getBrowseTerms()
        for browseTerm in browseTerms:
        #if browseTerms is not None and len(browseTerms) > 0:
            #n = random.randint(0, len(browseTerms) - 1)
            #browseTerm = browseTerms[n]
            result = api.browseArtifacts(term=browseTerm['term'], typeNames=[chapterType])
            assert result is not None and len(result) > 0

    def test_searchArtifacts(self):
        session = meta.Session()
        query = session.query(model.Artifact)
        artifacts = query.all()
        m = random.randint(0, len(artifacts) - 1)
        artifact = artifacts[m]
        for browseTerm in artifact.getBrowseTerms():
            try:
                domain = browseTerm['parent']
            except KeyError:
                domain = None
            result = api.searchArtifacts(domain=domain, term=browseTerm['term'])
            assert result is not None and len(result) > 0

    def test_searchBooks(self):
        typeName = bookType
        books = api.getArtifacts(typeName=typeName)
        for book in books:
            browseTerms = book.getBrowseTerms()
            for browseTerm in browseTerms:
            #if browseTerms is not None and len(browseTerms) > 0:
                #n = random.randint(0, len(browseTerms) - 1)
                #browseTerm = browseTerms[n]
                try:
                    domain = browseTerm['parent']
                except KeyError:
                    domain = None
                result = api.searchArtifacts(domain=domain,
                                             term=browseTerm['term'],
                                             typeNames=[typeName])
                assert result is not None and len(result) > 0

    def test_searchChapters(self):
        typeName = chapterType
        chapters = api.getArtifacts(typeName=typeName)
        m = random.randint(0, len(chapters) - 1)
        chapter = chapters[m]
        browseTerms = chapter.getBrowseTerms()
        for browseTerm in browseTerms:
        #if browseTerms is not None and len(browseTerms) > 0:
            #n = random.randint(0, len(browseTerms) - 1)
            #browseTerm = browseTerms[n]
            try:
                domain = browseTerm['parent']
            except KeyError:
                domain = None
            result = api.searchArtifacts(domain=domain,
                                         term=browseTerm['term'],
                                         typeNames=[typeName])
            assert result is not None and len(result) > 0

    def test_searchArtifactsByStandard(self):
        artifacts = api.searchArtifactsByStandard(state='US.CA', otherTerms=['Newton'], artifactTypeNames=['chapter'])
        assert artifacts is not None and len(artifacts) > 0    
        
    def test_getArtifactByID(self):
        session = meta.Session()
        query = session.query(model.Artifact)
        artifacts = query.all()
        for artifact in artifacts:
            a = api.getArtifactByID(id=artifact.id)
            assert a is not None
            assert a.id == artifact.id

    def test_getBookByID(self):
        typeName = bookType
        books = api.getArtifacts(typeName=typeName)
        for book in books:
            b = api.getArtifactByID(id=book.id, typeName=typeName)
            assert b is not None
            assert b.id == book.id

    def test_getChapterByID(self):
        typeName = chapterType
        chapters = api.getArtifacts(typeName=typeName)
        for chapter in chapters:
            c = api.getArtifactByID(id=chapter.id, typeName=typeName)
            assert c is not None
            assert c.id == chapter.id

    def test_getArtifactsByTitle(self):
        session = meta.Session()
        query = session.query(model.Artifact)
        artifacts = query.all()
        for artifact in artifacts:
            aList = api.getArtifactsByTitle(title=artifact.name.upper())
            found = False
            for a in aList:
                assert a is not None
                if a.name == artifact.name:
                    found = True
                    break
            assert found

    def test_getBooksByTitle(self):
        typeName = bookType
        books = api.getArtifacts(typeName=typeName)
        for book in books:
            bList = api.getArtifactsByTitle(title=book.name.lower(),
                                            typeName=typeName)
            found = False
            for b in bList:
                assert b is not None
                if b.name == book.name:
                    found = True
                    break
            assert found

    def test_getChaptersByTitle(self):
        typeName = chapterType
        chapters = api.getArtifacts(typeName=typeName)
        for chapter in chapters:
            cList = api.getArtifactsByTitle(title=chapter.name,
                                            typeName=typeName)
            found = False
            for c in cList:
                assert c is not None
                if c.name == chapter.name:
                    found = True
                    break
            assert found

    def test_getArtifactsByIDOrTitle(self):
        session = meta.Session()
        query = session.query(model.Artifact)
        artifacts = query.all()
        for artifact in artifacts:
            a = api.getArtifactByIDOrTitle(idOrTitle=artifact.id)
            assert a is not None
            assert a.id == artifact.id
            assert a.name == artifact.name

    def test_getBooksByIDOrTitle(self):
        typeName = bookType
        books = api.getArtifacts(typeName=typeName)
        for book in books:
            b = api.getArtifactByIDOrTitle(idOrTitle=book.name,
                                           typeName=typeName)
            assert b is not None
            assert b.id == book.id
            assert b.name == book.name

    def test_getChaptersByIDOrTitle(self):
        typeName = chapterType
        chapters = api.getArtifacts(typeName=typeName)
        for chapter in chapters:
            c = api.getArtifactByIDOrTitle(idOrTitle=chapter.name,
                                           typeName=typeName)
            assert c is not None
            #assert c.id == chapter.id
            assert c.name == chapter.name

    def test_getArtifactParents(self):
        parents = api.getArtifactParents(artifactID='6')
        assert parents is not None and len(parents) > 0, "No parents for artifact 6"
        found = False
        for parent in parents:
            if parent['parentID'] == 1:
                assert parent['parentTypeID'] == 1 and parent['sequence'] == 5
                found = True
        assert found

    def test_getArtifactAncestors(self):
        artifacts = api.getArtifacts(typeName=chapterType)
        for artifact in artifacts:
            ancestors = api.getArtifactAncestors(artifactID=artifact.getId())
            assert ancestors is not None
            for ancestor in ancestors:
                assert ancestor and ancestor['parentID']

    def test_getArtifactChildren(self):
        children = api.getArtifactChildren(artifactID='1')
        assert children is not None and len(children) > 0, "No children for artifact 1"
        found = False
        for child in children:
            if child['childID'] == 6:
                assert child['sequence'] == 5
                found = True
        assert found

    def test_updateDownloadCount(self):
        typeName = bookType
        books = api.getArtifacts(typeName=typeName)
        counts = []
        for book in books:
            revision = book.revisions[0]
            counts.append(revision.downloads)
            api.updateDownloadCount(revisionID=revision.id)
        books = api.getArtifacts(typeName=typeName)
        i = 0
        for book in books:
            revision = book.revisions[0]
            assert counts[i] == (revision.downloads - 1)
            api.undoDownloadCount(artifactRevision=revision)
            i += 1

    def test_createFeedbacks(self):
        books = api.getArtifacts(typeName=bookType)
        for book in books:
            feedback = api.createFeedback(artifactID=book.id, memberID=self.member.id, type='rating', score=5, comments='Excellent!')
        for book in books:
            feedbacks = book.feedbacks
            for feedback in feedbacks:
                assert feedback in book.feedbacks
                api.deleteFeedback(artifactID=book.id, memberID=self.member.id)

    def test_getBrowseTermTypes(self):
        browseTermTypes = api.getBrowseTermTypes()
        assert len(browseTermTypes) > 0

    def test_getBrowseTermTypeByID(self):
        browseTermType = api.getBrowseTermTypeByID(id=1)
        assert browseTermType is not None

    def test_getBrowseTermsByName(self):
        browseTerms = api.getBrowseTermsByName(name='ca')
        assert len(browseTerms) > 0

    def test_getTopLevelBrowseTerms(self):
        topLevelBrowseTerms = api.getTopLevelBrowseTerms()
        assert len(topLevelBrowseTerms) > 0

    def test_getSubjectBrowseTerms(self):
        subjectBrowseTerms = api.getSubjectBrowseTerms()
        assert len(subjectBrowseTerms) > 0

    def test_getBrowseTerms(self):
        browseTerms = api.getBrowseTerms()
        total = len(browseTerms)
        domainList = api.getBrowseTermTypes(name='domain')
        assert domainList is not None
        assert len(domainList) == 2
        domain = domainList[0]
        physicsList = api.getBrowseTerms(term='physics')
        assert physicsList is not None
        assert len(physicsList) > 0
        physics = physicsList[0]
        browseTerms = api.getBrowseTerms(parent=physics)
        assert browseTerms is not None
        physicsCount = len(browseTerms)
        assert physicsCount  > 0
        assert total > physicsCount
        browseTerms = api.getBrowseTerms(termType=domain)
        domainCount = len(browseTerms)
        assert domainCount > 0
        assert domainCount >= physicsCount
        assert total > domainCount

    def test_getBrowseTermAncestors(self):
        browseTerm = api.getBrowseTermByIDOrName(idOrName='newton')
        result = api.getBrowseTermAncestors(id=browseTerm.id)
        assert len(result) > 0
        ancestors = []
        for ancestor in result:
            term = api.getBrowseTermByID(id=ancestor.id)
            assert term != None
            ancestors.append(term.name.lower())
        assert 'physics' in ancestors

    def test_getBrowseTermSynonyms(self):
        browseTerm = api.getBrowseTermByIDOrName(idOrName='five')
        result = api.getBrowseTermSynonyms(id=browseTerm.id)
        assert len(result) > 0
        synonyms = []
        for synonym in result:
            term = api.getBrowseTermByIDOrName(idOrName=synonym.synonymTermID)
            assert term != None
            synonyms.append(term.name)
        assert 'v' in synonyms
        assert '5' in synonyms
        assert 'five' not in synonyms
    
    def test_getGrades(self):
        grades = api.getGrades()
        assert len(grades) > 0
        for grade in grades:
            g = api.getGradeByID(id=grade.id)
            assert g is not None
            g = api.getGradeByName(name=grade.name)
            assert g is not None
            g = api.getGrades(idList=[ grade.id ])
            assert len(g) == 1

    def test_getGradesDict(self):
        gradeDict = api.getGradesDict()
        assert gradeDict

        grades = api.getGrades()
        assert grades
        for grade in grades:
            assert gradeDict.has_key(grade.name.lower())
            assert gradeDict[grade.name.lower()].id == grade.id

    def test_getSubjects(self):
        subjects = api.getSubjects()
        assert len(subjects) > 0
        for subject in subjects:
            s = api.getSubjectByID(id=subject.id)
            assert s is not None
            s = api.getSubjectByName(name=subject.name)
            assert s is not None
            assert s.name == subject.name, "Got an in-exact match for %s when an exact match was available" % subject.name

    def test_getSubjectsDict(self):
        subjectsDict = api.getSubjectsDict()
        assert subjectsDict

        subjects = api.getSubjects()
        assert subjects
        for subject in subjects:
            assert subjectsDict.has_key(subject.name.lower())
            assert subjectsDict[subject.name.lower()].id == subject.id

    def test_getStandardBoards(self):
        standardBoards = api.getStandardBoards()
        assert len(standardBoards) > 0
        for standardBoard in standardBoards:
            s = api.getStandardBoardByID(id=standardBoard.id)
            assert s is not None
            s = api.getStandardBoardByName(name=standardBoard.name, country=standardBoard.country)
            assert s is not None

    def test_standards(self):
        standards = api.getStandards()
        #assert len(standards) > 0
        for standard in standards:
            s = api.getStandards(section=standard.section)
            assert len(s) > 0
            s = api.getStandards(standardBoard=standard.standardBoard)
            assert len(s) > 0
            s = api.getStandards(subject=standard.subject)
            assert len(s) > 0
            s = api.getStandards(standardBoard=standard.standardBoard,
                                 subject=standard.subject,
                                 section=standard.section)
            assert len(s) > 0

    def test_browseTerm(self):
        browseTermTypes = api.getBrowseTermTypes()
        assert len(browseTermTypes) > 0
        name = 'Test browse term'
        browseTerm = api.createBrowseTerm(name=name,
                                          browseTermType=browseTermTypes[0].id)
        assert browseTerm is not None
        browseTerm = api.getBrowseTerms(term=name)[0]
        api.deleteBrowseTerm(browseTerm=browseTerm)
        browseTerm = api.createBrowseTerm(name=name,
                                          browseTermType=browseTermTypes[0])
        assert browseTerm is not None
        try:
            bt = api.createBrowseTerm(name=name,
                                      browseTermType=browseTermTypes[0].id)
            assert bt is None
        except Exception:
            pass
        browseTerm = api.getBrowseTerms(term=name)[0]
        browseTerm = api.deleteBrowseTermByID(id=browseTerm.id)
        assert browseTerm is not None

    def test_book(self):
        book = None
        name = 'test1'
        description = 'Original description.'
        contents = 'This is a test only.'
        chapters = api.getArtifacts(typeName=chapterType)
        children = []

        n = 0
        for chapter in chapters:
            children.append({ 'artifact': chapter.revisions[0] })
            n += 1
            if n > 0:
                break
        typeName = bookType
        book = api.createArtifact(name=name,
                                  handle=name,
                                  typeName=typeName,
                                  description=description,
                                  creator=self.member,
                                  resources=[],
                                  children=children)
        print 'book[%s]' % book
        assert book is not None
        book = api.getArtifactByID(id=book.id, typeName=typeName)
        assert book.description == description
        assert book.getChildren() is not None

        reversed = children.reverse()
        updateDict = {
            'artifact': book,
            'member': self.member,
            'name': name,
            'description': description,
            'children': reversed,
            'cache': ArtifactCache(),
        }
        api.updateArtifact(**updateDict)

        updatedBook = api.getArtifactByID(id=book.id, typeName=typeName)
        assert updatedBook.description == description
        book = updatedBook

        """
        artifactRevision = book.revisions[0]
        resourceDict = {}
        for child in artifactRevision.children:
            resourceRevisions = child.child.resourceRevisions
            for revision in resourceRevisions:
                resource = revision.resource
                resourceDict[resource.id] = resource
        for id in resourceDict.keys():
            api.deleteResource(resource=resourceDict[id])
        """
        api.deleteArtifact(artifact=book, recursive=True)

    def test_chapter(self):
        chapter = None
        name = 'test1'
        description = 'Original description.'
        contents = '<p>This is a test ’s only.</p>'
        contents = h.transform_to_xhtml(contents) #.encode('utf-8'))
        contentType = api.getResourceTypeByName(name='contents')
        resources = [
            {
                'resourceType': contentType,
                'name': name,
                'description': description,
                'uri': 'test1.html',
                'contents': contents,
                'isExternal': False,
                'uriOnly': False,
            },
        ]
        typeName = chapterType
        chapter = api.createArtifact(name=name,
                                     handle=name,
                                     typeName=typeName,
                                     description=description,
                                     creator=self.member,
                                     resources=resources,
                                     bookTitle='Test Book')
        assert chapter is not None
        chapter = api.getArtifactByID(id=chapter.id, typeName=typeName)
        assert chapter.description == description
        xhtml = chapter.getXhtml()
        assert xhtml == contents

        resources = []
        description = 'Updated description'
        contents = '<p>This is an update to ’s the test.</p>'
        contents = h.transform_to_xhtml(contents) #.encode('utf-8'))
        resRevID = None
        for rr in chapter.revisions[0].resourceRevisions:
            if rr.resource.type.name == 'contents':
                resRevID = rr.id
                break
        contentDict = {
            'resourceType': contentType,
            'id': resRevID,
            'name': name,
            'description': description,
            'contents': contents,
            'isExternal': False,
        }
        resources.append(contentDict)
        updateDict = {
            'artifact': chapter,
            'member': self.member,
            'name': name,
            'description': description,
            'resources': resources,
            'bookTitle': 'Test Book',
            'cache': ArtifactCache(),
        }
        api.updateArtifact(**updateDict)

        updatedChapter = api.getArtifactByID(id=chapter.id, typeName=typeName)
        print 'updatedChapter[%s]' % updatedChapter
        assert updatedChapter.description == description
        xhtml = updatedChapter.getXhtml()
        assert xhtml == contents

        """
        artifactRevision = updatedChapter.revisions[0]
        resourceDict = {}
        resourceRevisions = artifactRevision.resourceRevisions
        for revision in resourceRevisions:
            resource = revision.resource
            resourceDict[resource.id] = resource
        """
        api.deleteArtifact(artifact=updatedChapter, recursive=True)

    def test_member(self):
        member = None
        try:
            member = api.createMember(surname='AuYeung')
            assert member is None
        except Exception:
            assert member is None

        login = 'stephen1'
        member = api.createMember(login=login,
                                  givenName='Stephen',
                                  surname='AuYeung',
                                  defaultLogin='stephen@ck12.org',
                                  email='stephen1@ck12.org',
                                  roleID=7,
                                  authID=self.authID
                                 )
        self.authID += 1
        assert member is not None
        member = api.deleteMemberByLogin(login=login)
        assert member is not None
        member = api.createMember(login=login,
                                  givenName='Stephen',
                                  surname='AuYeung',
                                  defaultLogin='stephen@ck12.org',
                                  email='stephen1@ck12.org',
                                  roleID=5,
                                  authID=self.authID
                                 )
        self.authID += 1
        assert member is not None
        member = api.deleteMemberByID(id=member.id)
        assert member is not None

    def test_updateMember(self):
        self.member.givenName = 'Hang'
        api.update(instance=self.member)
        member = api.getMemberByLogin(login=self.login)
        assert member.givenName == 'Hang'
    

    def test_createAndDeleteBrowseTermSynonym(self):
        syn = api.createBrowseTermSynonym(termID=30, synonymTermID=31)
        assert syn is not None
        terms = api.getBrowseTermSynonyms(id=30)
        assert terms is not None
        found = False
        for term in terms:
            if term.termID == 30 and term.synonymTermID == 31:
                found = True
                break
        assert found == True
        api.deleteBrowseTermSynonym(termID=syn.termID, synonymTermID=syn.synonymTermID)
        terms = api.getBrowseTermSynonyms(id=30)
        assert terms is None or len(terms) == 0

    def test_getBrowseTermTypeByName(self):
        termType = api.getBrowseTermTypeByName(name='subject')
        assert termType is not None, "Could not get any browseTermType for name 'subject'"
        assert termType.name == 'subject' and termType.id is not None

    def test_getBrowseTermByName(self):
        term = api.getBrowseTermByName(name='physics')
        assert term is not None, "Could not get any browseTerm for name 'physics'"
        assert term.name == 'physics' and term.id is not None

    def test_deleteArtifact(self):
        artifacts = api.getArtifacts(typeName=bookType)
        assert artifacts
        for artifact in artifacts:
            if artifact:
                children = api.getArtifactChildren(artifactID=artifact.getId())
                if children:
                    for child in children:
                        try:
                            a = api.getArtifactByID(id=child['childID'])
                            deleted, kept = api.deleteArtifact(artifact=a)
                            failed = a.id in kept
                        except:
                            failed = True
                        assert failed, "Incorrectly deleted artifact whose parent existed."

    def test_getArtifactIDsByBrowseTerms(self):
        artifacts = api.getArtifacts()
        assert artifacts
        for artifact in artifacts:
            if artifact:
                browseTerms = artifact.browseTerms
                if browseTerms:
                    termIDs = []
                    for term in browseTerms:
                        termIDs.append(term.id)
                    artifactIDs = api.getArtifactIDsByBrowseTerm(termIDs=[term.id])
                    assert artifact.id in artifactIDs, "This artifact [id:%s] not found in artifacts for terms: %s" % (artifact.id, termIDs)

    def test_getArtifactRevisionsForResource(self):
        artifacts = api.getArtifacts()
        assert artifacts
        maxChecks = 20
        cnt = 0
        for artifact in artifacts:
            if artifact:
                for revision in artifact.revisions:
                    if revision:
                        for rr in revision.resourceRevisions:
                            assert rr.resource.id
                            arevs = api.getArtifactRevisionsForResource(resourceID=rr.resource.id)
                            assert arevs, "No artifact revisions found"
                            found = False
                            for arev in arevs:
                                if arev.artifactID == artifact.id:
                                    found = True
                                    break
                            assert found, "No artifact id found for this resource"

                            brevs = api.getArtifactRevisionsForResource(resourceID=rr.resource.id, resourceRevisionID=rr.id)
                            assert brevs, "No artifact revisions found"
                            found = False
                            for brev in brevs:
                                if brev.artifactID == artifact.id:
                                    found = True
                                    break
                            assert found, "No artifact id found for this resource and resourceRevision"

                            cnt += 1

                            if cnt >= maxChecks:
                                return

    def test_getBrowseTermChildren(self):
        bt = api.getBrowseTermByEncodedID(encodedID='MAT.ARI')
        assert bt, "No browse term for Arithmetic"

        children = api.getBrowseTermChildren(id=bt.id)
        assert children, "No children for browse term Arithmetic"

    def test_getCandidatesForBrowseTerm(self):
        bt = api.getBrowseTermByEncodedID(encodedID='MAT.ARI')
        assert bt, "No browse term for arithmetic"

        candidates = api.getCandidatesForBrowseTerm(categoryID=bt.id, maxSequence=100)
        assert candidates, "No featured candidate terms for arithmetic"
        cnt = len(candidates)
        for candidate in candidates:
            assert candidate.category.encodedID == 'MAT.ARI'

        allCandidates = api.getCandidatesForBrowseTerm(categoryID=bt.id)
        assert allCandidates, "Got 0 candidate terms for arithmetic"
        assert len(allCandidates) >= cnt, "All candidates fewer than featured candidates"
        for candidate in allCandidates:
            assert candidate.category.encodedID == 'MAT.ARI'

    def test_browseArtifactsByCategory(self):
        h.reindexArtifacts(artifactIds=[231], wait=True)
        hits = api.browseArtifactsByCategory(terms=['MAT.ARI', 'MAT.ARI.300'])
        assert hits['artifactList'] and hits['numFound'] > 0

    def test_browseArtifactsByCategoryRanges(self):

        hits = api.browseArtifactsByCategoryRanges(ranges=[{'rangeStart': 'MAT.ALG.600', 'rangeEnd': 'MAT.ALG.600'}, {'rangeStart': 'MAT.ARI.100', 'rangeEnd': 'MAT.ARI.800'}])
        assert hits['artifactList'] is not None

    def test_countArtifactsForBrowseTermDescendants(self):
        term = api.getBrowseTermByIDOrName(idOrName='arithmetic')
        assert term
        assert term.type.name == 'domain'
        count = api.countArtifactsForBrowseTermDescendants(term=term)
        assert count > 0
 
    def test_createResource(self):
        image = os.path.join('data', 'xdt.png')
        assert os.path.exists(image)

        language = api.getLanguageByName(name='English')
        assert language

        resourceDict = {}
        resourceDict['resourceType'] = api.getResourceTypeByName(name="equation")
        resourceDict['name'] = os.path.basename(image)
        resourceDict['description'] = "XDT Architecture"
        resourceDict['languageID'] = language.id
        resourceDict['ownerID'] = 1
        resourceDict['isExternal'] = False   
        #resourceDict['uri'] = os.path.abspath(image)
        resourceDict['uri'] = open(image, "rb")
        resourceDict['creationTime'] = datetime.now()
        resourceDict['uriOnly'] = False
        resourceRevision = api.createResource(resourceDict=resourceDict, commit=True)
        resourceID = resourceRevision.resource.id
        assert resourceID, "Error creating resource"
        resourceURL = resourceRevision.resource.getUri()  
        if not self.useImageSatellite:
            assert ':8080/' in resourceURL, "Did not get correct resourceURL"
        print resourceURL

    def test_createTask(self):
        taskDict = {}
        taskDict['name'] = self.__class__.__name__
        taskDict['status'] = 'PENDING'
        taskDict['taskID'] = 'aaaaaaa-test-aaaaaaa'
        taskDict['ownerID'] = 1
        task = api.createTask(**taskDict)

        assert task, "Failed to create task"
        assert task.taskID == taskDict['taskID'], "Task id does not match"

    def test_modifyTask(self):
        task = api.getTaskByTaskID(taskID='aaaaaaa-test-aaaaaaa')
        assert task, "Could not find task by taskID"

        taskDict = {}
        taskDict['id'] = task.id
        taskDict['status'] = 'SUCCESS'
        taskUpdated = api.updateTask(**taskDict)

        assert taskUpdated.id == task.id, "Task id does not match"
        assert str(task.started) <= str(task.updated)

    def test_getTask(self):
        task = api.getTaskByTaskID(taskID='aaaaaaa-test-aaaaaaa')
        assert task, "Could not find task by taskID"

        task2 = api.getTaskByID(id=task.id)
        assert task2, "Could not find task by id"

        assert task.taskID == task2.taskID

    def test_removeTask(self):
        task = api.getTaskByTaskID(taskID='aaaaaaa-test-aaaaaaa')
        assert task, "Could not find task by taskID"
        
        api.deleteTask(task=task)
        task = api.getTaskByTaskID(taskID='aaaaaaa-test-aaaaaaa')
        assert task == None, "Could not delete task"

    def test_getResourceByHandle(self):
        resources = api.getResources(pageNum=1, pageSize=10)
        assert resources, "Could not find any resources"

        for resource in resources:
            r = api.getResourceByHandle(handle=resource.handle, typeID=resource.type.id, ownerID=resource.ownerID)
            assert r, "Could not get resource by handle"
            assert r.id == resource.id

    def test_getResoucesByOwner(self):
        member = api.getMemberByID(id=104)
        assert member

        resources = api.getResourcesByOwner(ownerID=member.id, typeName='cover page', pageNum=1, pageSize=10)
        assert resources, "Could not get resources by owner"

        for resource in resources:
            assert resource.ownerID == member.id and resource.type.name == 'cover page', "Got resources of different owner or type"
            
    def test_getProvider(self):
        provider = api.getProviderByDomain(domain='www.youtube.com')
        assert provider
        assert provider.name.lower() == 'youtube'
        id = provider.id

        provider = api.getProviderByID(id=id)
        assert provider
        assert provider.name.lower() == 'youtube'
        assert provider.id == id

    def test_getProviderByDomain(self):
        domain = 'video1.cdn.schooltube.com'
        provider = api.getProviderByDomain(domain=domain)
        assert provider
        assert provider.domain.strip('.*') in domain

    def test_createProvider(self):
        pd = {
                'name': 'SomeProvider',
                'domain': '*.someprovider.com',
                'needsApi': False,
                'blacklisted': False
            }
        provider = api.createProvider(**pd)
        assert provider and provider.id
        assert provider.name == 'SomeProvider'
        id = provider.id

        provider = api.getProviderByDomain(domain='www.someprovider.com')
        assert provider.id == id

        api.deleteProvider(providerID=id)
        provider = api.getProviderByID(id=id)
        assert provider is None, "Could not delete provider"

    def test_updateProvider(self):
        pd = {
                'name': 'SomeProvider',
                'domain': '*.someprovider.com',
                'needsApi': False,
                'blacklisted': False
            }
        provider = api.createProvider(**pd)
        assert provider and provider.id
        assert int(provider.blacklisted) == 0
        id = provider.id

        pd = {
                'id': id,
                'blacklisted': True
            }
        provider = api.updateProvider(**pd)
        assert provider and provider.id == id
        assert int(provider.blacklisted) == 1

        api.deleteProvider(providerID=id)
        provider = api.getProviderByID(id=id)
        assert provider is None, "Could not delete provider"

    def test_createEmbeddedObject(self):
        provider = api.getProviderByDomain(domain='www.youtube.com')
        assert provider

        eoDict = {}
        member = api.getMemberByID(id=1)
        eoDict['ownerID'] = member.id
        eoDict['type'] = 'youtube'
        eoDict['providerID'] = provider.id
        eoDict['uri'] = u'http://www.youtube.com/v/3Po3nfITsok'
        eoDict['width'] = 480
        eoDict['height'] = 390
        eoDict['code'] = '<iframe width="425" height="349" src="http://www.youtube.com/embed/3Po3nfITsok" frameborder="0" allowfullscreen></iframe>'
        import hashlib
        hash = hashlib.md5(eoDict['code']).hexdigest()
        eoDict['hash'] = hash

        eo = api.createEmbeddedObject(**eoDict)
        assert eo and eo.id, "Could not create EmbeddedObject"

    def test_getEmbeddedObject(self):
        eo = api.getEmbeddedObjectByURI(uri=u'http://www.youtube.com/v/3Po3nfITsok')
        assert eo and eo.uri == u'http://www.youtube.com/v/3Po3nfITsok'
        id = eo.id

        import hashlib
        code = eo.code
        hash = hashlib.md5(code).hexdigest()

        eo = api.getEmbeddedObjectByHash(hash=hash)
        assert eo and eo.id == id and eo.hash == hash

        eo = api.getEmbeddedObjectByID(id=id)
        assert eo and eo.hash == hash and eo.uri == u'http://www.youtube.com/v/3Po3nfITsok'

        eos = api.getEmbeddedObjects(type='youtube', pageNum=1, pageSize=1)
        assert eos and type(eos.results).__name__ == 'list'
        for eo in eos:
            assert eo.type == 'youtube'

        provider = api.getProviderByDomain(domain='www.youtube.com')
        assert provider
        providerID = provider.id
        eos = api.getEmbeddedObjectsByProvider(provider=provider, pageNum=1, pageSize=1)
        assert eos and type(eos.results).__name__ == 'list'
        for eo in eos:
            assert eo.provider.id == providerID

    def test_editEmbeddedObject(self):
        eo = api.getEmbeddedObjectByURI(uri=u'http://www.youtube.com/v/3Po3nfITsok')
        assert eo
        id = eo.id

        eoDict = {
                'id': eo.id,
                'blacklisted': True
                }
        eo = api.updateEmbeddedObject(**eoDict)
        assert eo and eo.id == id
        assert eo.blacklisted, "Could not update EmbeddedObject"

    def test_removeEmbeddedObject(self):
        eo = api.getEmbeddedObjectByURI(uri=u'http://www.youtube.com/v/3Po3nfITsok')
        assert eo
        id = eo.id

        api.deleteEmbeddedObject(id=id)
        eo = api.getEmbeddedObjectByID(id=id)
        assert eo is None, "Could not delete embeddedObject"

    def test_createAbuseReport(self):
        resource = api.getResourceByID(id=7)
        assert resource

        kwargs = {}
        kwargs['reason'] = 'Copyrighted material not in free domain.'
        kwargs['resourceRevisionID'] = resource.revisions[0].id
        
        abuseReport = api.createAbuseReport(**kwargs)
        assert abuseReport, "Failed to create a new abuse report"
        assert abuseReport.id
        assert abuseReport.status == 'reported', "Create method did not add default status"

    def test_editAbuseReport(self):
        resource = api.getResourceByID(id=7)
        assert resource

        admin = api.getMemberByLogin(login='admin')
        assert admin, "Could not get admin user"

        abuseReports = api.getAbuseReportsByResourceRevisionID(resourceRevisionID=resource.revisions[0].id)
        assert abuseReports and abuseReports[0]

        reportID = abuseReports[0].id
        kwargs = { 'id': abuseReports[0].id, 'reviewerID': admin.id, 'remark': 'Removing image', 'status': 'flagged' }
        ar = api.updateAbuseReport(**kwargs)
        assert ar and ar.status == 'flagged', "Could not update abuse report"
        assert ar.reviewer.login == admin.login

        kwargs['status'] = 'invalid status'
        try:
            ar = api.updateAbuseReport(**kwargs)
            assert False, "Should not succeed"
        except Exception, e:
            assert e

        abuseReports = api.getAbuseReportsByStatus(status='flagged')
        assert len(abuseReports)
        found = False
        for report in abuseReports:
            if report.id == reportID:
                found = True
        assert found

        abuseReports = api.getAbuseReportsByStatus(status='flagged', resourceRevisionID=resource.revisions[0].id)
        assert len(abuseReports)
        assert abuseReports[0].id == reportID

    def test_removeAbuseReport(self):
        resource = api.getResourceByID(id=7)
        assert resource

        abuseReports = api.getAbuseReportsByResourceRevisionID(resourceRevisionID=resource.revisions[0].id)
        assert abuseReports and abuseReports[0]

        reportID = abuseReports[0].id
        api.deleteAbuseReport(id=reportID)

        ar = api.getAbuseReportByID(id=reportID)
        assert ar is None, "Failed to delete abuse report"

    def test_assignEncode(self):

        artifact = api.getArtifactByID(id=225)
        assert artifact.encodedID
        encodedID = artifact.encodedID
        encode = '.'.join(encodedID.split('.')[:-2])

        artifact = api.assignNextEncode(artifactID=225, encodedID=encode)
        assert encodedID == artifact.encodedID

        artifact = api.getArtifactByID(id=224)
        assert not artifact.encodedID

        artifact = api.assignNextEncode(artifactID=224, encodedID=encode)
        assert artifact.encodedID and artifact.encodedID > encodedID

        artifact = api.getArtifactByID(id=226)
        assert not artifact.encodedID

        artifact = api.assignNextEncode(artifactID=226, encodedID='MAT.ARI.320')
        assert artifact.encodedID == 'MAT.ARI.320.CH.1'

    def test_getNext(self):
        ancestorRevisions = []
        book = api.getArtifactByIDOrTitle(idOrTitle='Geometry', typeName='book')
        ancestorRevisions.append(book.revisions[0])

        id = book.revisions[0].children[-1].child.artifact.id
        artifact, chapter = api.getNextArtifactByID(id=id, typeName='chapter', ancestorRevisions=ancestorRevisions)
        assert not artifact and not chapter
        
        id = book.revisions[0].children[0].child.artifact.id
        while True:
            artifact, chapter = api.getNextArtifactByID(id=id, typeName='chapter', ancestorRevisions=ancestorRevisions)
            if artifact:
                print "Next of %d: %s" % (id, artifact['id'])
                assert artifact and artifact['id'] != id
                assert chapter and artifact['id'] == chapter['id']
                id = artifact['id']
            else:
                print "No next of %d" % id
                assert id == book.revisions[0].children[-1].child.artifact.id
                break

    def test_getPrevious(self):
        ancestorRevisions = []
        book = api.getArtifactByIDOrTitle(idOrTitle='Geometry', typeName='book')
        ancestorRevisions.append(book.revisions[0])

        ## Start from last
        id = book.revisions[0].children[-1].child.artifact.id
        while True:
            artifact, chapter = api.getPreviousArtifactByID(id=id, typeName='chapter', ancestorRevisions=ancestorRevisions)
            if artifact:
                print "Previous of %d: %s" % (id, artifact['id'])
                assert artifact and artifact['id'] != id
                assert chapter and chapter['id'] == artifact['id']
                id = artifact['id']
            else:
                print "No previous of %d" % id
                assert id == book.revisions[0].children[0].child.artifact.id
                break

    def test_multipleCoverPages(self):
        
        # Test to verify that an artifact has at most 1 cover page type resource
        # Check that:
        #    1. An artifact cannot be created with more than one cover page resources
        #    2. A separately create cover page resource when added to the artifact,
        #       overwrites the existing cover page resource.

        book = None
        name = 'test multiple covers'
        description = 'Original description.'

        language = api.getLanguageByName(name='English')
        coverImageType = api.getResourceTypeByName(name='cover page')
        coverImageDict1 = {
            'resourceType': coverImageType,
            'name': "test cover image 1",
            'description': "test cover image 1",
            'uri': "http://www.ck12.org/media/images/logo_ck12_195.png",
            'isExternal': True,
            'uriOnly': True,
            'languageID': language.id,
        }
        coverImageDict2 = {
            'resourceType': coverImageType,
            'name': "test cover image 2",
            'description': "test cover image 2",
            'uri': "http://www.ck12.org/media/images/logo_sm.png",
            'isExternal': True,
            'uriOnly': True,
            'languageID': language.id,
        }
        resources = [ coverImageDict1, coverImageDict2 ]
        typeName = bookType
        failed = False
        try:
            book = api.createArtifact(name=name,
                                  handle=name,
                                  typeName=typeName,
                                  description=description,
                                  creator=self.member,
                                  resources=resources,
                                  children=[])
        except Exception:
            failed = True

        assert failed, "Expected a failure in book creation due to multiple cover images but got success"

        resources.pop()
        book = api.createArtifact(name=name,
                                handle=name,
                                typeName=typeName,
                                description=description,
                                creator=self.member,
                                resources=resources,
                                children=[])

        assert book is not None
        bookID = book.id
        for rr in book.revisions[0].resourceRevisions:
            if rr.resource.type.name == 'cover page':
                oldCoverPage = rr.resource.id
                assert rr.resource.name == 'test cover image 1'
                break
        assert oldCoverPage 

        resourceDict = {}
        resourceDict['resourceType'] = api.getResourceTypeByName(name="cover page")
        resourceDict['name'] = "Test cover image 2"
        resourceDict['description'] = "Test Cover Image 2"
        resourceDict['languageID'] = language.id
        resourceDict['ownerID'] = self.member.id
        resourceDict['isExternal'] = True
        resourceDict['uri'] = "http://www.ck12.org/media/images/logo_sm.png"
        resourceDict['creationTime'] = datetime.now()
        resourceDict['uriOnly'] = True
        resourceRevision = api.createResource(resourceDict=resourceDict, commit=True)
        resourceID = resourceRevision.resource.id
        assert resourceID, "Error creating resource"

        ## Try associating resource
        kwargs = {}
        kwargs['artifactRevisionID'] = book.revisions[0].id
        kwargs['resourceRevisionID'] = resourceRevision.id
        arhr = api.createArtifactHasResource(**kwargs)
        
        assert arhr is not None
        assert arhr.artifactRevisionID == kwargs['artifactRevisionID'] and arhr.resourceRevisionID == kwargs['resourceRevisionID']

        book = api.getArtifactByID(id=bookID)
        assert book

        coverPageCnt = 0
        for rr in book.revisions[0].resourceRevisions:
            if rr.resource.type.name == 'cover page':
                assert rr.resource.name == "Test cover image 2"
                coverPageCnt += 1
        assert coverPageCnt == 1

        api.deleteArtifact(artifact=book, recursive=True)
        r = api.getResourceByID(id=oldCoverPage)
        assert r
        api.deleteResource(resource=r)

    def test_updateArtifactChildRevisions(self):
        bookName = 'update artifact test - book'
        name = 'update artifact test - chapter'
        description = 'Original description.'
        contents = '<p>Version 1.</p>'
        contents = h.transform_to_xhtml(contents) 
        contentType = api.getResourceTypeByName(name='contents')
        resources = [
            {
                'resourceType': contentType,
                'name': name,
                'description': description,
                'uri': 'test1-chapter.html',
                'contents': contents,
                'isExternal': False,
                'uriOnly': False,
            },
        ]
        chapter = api.createArtifact(name=name,
                                     handle=name,
                                     bookTitle=bookName,
                                     typeName=chapterType,
                                     description=description,
                                     creator=self.member,
                                     resources=resources,
                                     children=[])
        assert chapter
        origChapterRevisionID = chapter.revisions[0].id
        chapterContentRevision = None
        for rr in chapter.revisions[0].resourceRevisions:
            if rr.resource.type.name == 'contents':
                chapterContentRevision = rr.id
                break

        book = None
        description = 'Original description.'
        contents = '<p>Version 1.</p>'
        contents = h.transform_to_xhtml(contents) #.encode('utf-8'))
        resources = [
            {
                'resourceType': contentType,
                'name': bookName,
                'description': description,
                'uri': 'test1.html',
                'contents': contents,
                'isExternal': False,
                'uriOnly': False,
            },
        ]
        typeName = bookType
        book = api.createArtifact(name=bookName,
                                  handle=bookName,
                                  typeName=typeName,
                                  description=description,
                                  creator=self.member,
                                  resources=resources,
                                  children=[{'artifact': chapter},])

        assert book
        assert len(book.revisions) == 1
        assert len(book.revisions[0].children) == 1
        assert book.revisions[0].children[0].child.id == chapter.revisions[0].id

        api.createFeedback(artifactID=book.id, memberID=self.member.id, type='rating', score=3, comments='Comment 1')

        book = api.getArtifactByID(id=book.id)
        assert len(book.feedbacks) == 1
                
        bookContentRevision = None
        for rr in book.revisions[0].resourceRevisions:
            if rr.resource.type.name == 'contents':
                bookContentRevision = rr.id
                break

        ## Update the chapter
        contentDict = {
            'resourceType': contentType,
            'id': chapterContentRevision,
            'name': name,
            'contents': h.transform_to_xhtml('<p>Version 2 chapter</p>'),
            'isExternal': False,
            'uriOnly': False,
        }
        updateDict = {
            'artifact': api.getArtifactByID(id=chapter.id),
            'member': self.member,
            'resources': [contentDict, ],
            'bookTitle': bookName,
            'cache': ArtifactCache(),
        }
        chapter = api.updateArtifact(**updateDict)

        assert len(chapter.revisions) == 2
        newChapterRevisionID = chapter.revisions[0].id

        ## Now update the book - the only change is the new chapter revision as its child
        updateDict = {
            'artifact': api.getArtifactByID(id=book.id),
            'member': self.member,
            'children': [newChapterRevisionID,],
            'cache': ArtifactCache(),
        }
        book = api.updateArtifact(**updateDict)

        assert len(book.revisions) == 2
        assert len(book.revisions[0].children) == 1
        assert len(book.revisions[1].children) == 1
        assert book.revisions[0].children[0].hasArtifactRevisionID == newChapterRevisionID
        assert book.revisions[1].children[0].hasArtifactRevisionID == origChapterRevisionID
        assert len(book.feedbacks) == 1

        ## Update the book content - not the children
        contentDict = {
            'resourceType': contentType,
            'id': bookContentRevision,
            'name': bookName,
            'contents': h.transform_to_xhtml('<p>Version 3 book</p>'),
            'isExternal': False,
            'uriOnly': False,
        }
        updateDict = {
            'artifact': api.getArtifactByID(id=book.id),
            'member': self.member,
            'resources': [contentDict, ],
            'cache': ArtifactCache(),
        }
        book = api.updateArtifact(**updateDict)

        assert len(book.revisions) == 3
        assert len(book.revisions[0].children) == 1
        assert len(book.revisions[1].children) == 1
        assert len(book.revisions[2].children) == 1
        assert book.revisions[0].children[0].hasArtifactRevisionID == newChapterRevisionID
        assert book.revisions[1].children[0].hasArtifactRevisionID == newChapterRevisionID
        assert book.revisions[2].children[0].hasArtifactRevisionID == origChapterRevisionID
        assert len(book.feedbacks) == 1

        ## Cleanup
        try:
            api.deleteArtifact(artifact=book, recursive=True)
            #api.deleteArtifact(artifact=chapter)
        except:
            pass

    def test_createArtifactHasBrowseTerm(self):
        books = api.getArtifacts(typeName=bookType, pageNum=1, pageSize=1)
        assert books
        book = books[0]
        term = api.getBrowseTermByEncodedID(encodedID='MAT.ARI.100')
        assert term

        kwargs = { 'artifactID': book.id, 'browseTermID': term.id }
        
        fg = book.getBrowseTerms()
        cnt = len(fg)
        api.createArtifactHasBrowseTerm(**kwargs)
        fg = book.getBrowseTerms()
        print cnt, len(fg)
        assert cnt == len(fg)
        fg2 = book.getFoundationGrid()
        ## No foundation grid for books
        assert len(fg2) == 0

        api.deleteArtifactHasBrowseTerm(artifactID=book.id, browseTermID=term.id)

        lessons = api.getArtifacts(typeName='lesson', pageNum=1, pageSize=1)
        assert lessons and lessons[0]
        lesson = lessons[0]
        kwargs = {'artifactID': lesson.id, 'browseTermID': term.id}
        fgBefore = lesson.getFoundationGrid()
        api.createArtifactHasBrowseTerm(**kwargs)
        fgAfter = lesson.getFoundationGrid()
        assert len(fgAfter) == len(fgBefore) + 1
        found = False
        for id, name, eid, handle, branchHandle in fgAfter:
            if id == term.id:
                found = True
                break
        assert found
        api.deleteArtifactHasBrowseTerm(artifactID=lesson.id, browseTermID=term.id)

        type = api.getBrowseTermTypeByName(name='level')
        kwargs = {'name': 'at grade', 'browseTermType': type, 'force': True}
        term = api.createBrowseTerm(**kwargs)
        assert term

        kwargs = {'artifactID': book.id, 'browseTermID': term.id}
        api.createArtifactHasBrowseTerm(**kwargs)
        
        cnt = 0
        for bt in book.browseTerms:
            if bt.type.name == 'level':
                assert bt.name == 'at grade' and bt.id == term.id
                cnt += 1
        assert cnt == 1

        kwargs = {'name': 'basic', 'browseTermType': type, 'force': True}
        term = api.createBrowseTerm(**kwargs)
        assert term

        kwargs = {'artifactID': book.id, 'browseTermID': term.id}
        api.createArtifactHasBrowseTerm(**kwargs)
        
        cnt = 0
        for bt in book.browseTerms:
            if bt.type.name == 'level':
                assert bt.name == 'basic' and bt.id == term.id
                cnt += 1
        assert cnt == 1

        api.deleteArtifactHasBrowseTerm(artifactID=book.id, browseTermID=term.id)
