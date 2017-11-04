# -*- coding: utf-8 -*-

from flx.tests import *
from flx.model import api
from flx.model.vcs import vcs as v
import json
import logging
import urllib2
import time

log = logging.getLogger(__name__)

bookType = 'book'
chapterType = 'chapter'
lessonType = 'lesson'
conceptType = 'concept'

INDEX_CREATED = False

class TestArtifactController(TestController):

    def _browseArtifact(self, term):
        response = self.app.get(url(controller='artifact', action='browseArtifactInfoPaginated', type='artifact', browseTerm=term))
        assert '"status": 0' in response, "Failed browse artifacts"
        assert 'ERROR:' not in response, "Error browsing artifacts"
        assert term in response, "browse term not found"

    def test_browseArtifact(self):
        self._createIndex(range(49,75))

        self._browseArtifact('algebra')
        self._browseArtifact('biology')
        self._browseArtifact('chemistry')
        self._browseArtifact('mathematics')
        self._browseArtifact('physics')

        ## Query with filters
        self._browseArtifact('evolution')


    def test_createArtifactUnicode(self):
        userID = 3
        params = {
            'authors': 'Stephen AuYueng',
            'title': 'ध्रुवीय उपग्रह प्रक्षेपण 任何',
            'handle': 'ध्रुवीय-उपग्रह-प्रक्षेपण-任何',
            'summary': 'ध्रुवीय उपग्रह प्रक्षेपण 任何',
            'languageCode': 'hi',
            'cover image name': 'testImage',
            'cover image description': 'Image for artifact creation test',
            'cover image uri': 'notexist.html',
            'xhtml': 'भारत ने एक ध्रुवीय उपग्रह प्रक्षेपण यान (पीएसएलवी) द्वारा आधुनिक संचार उपग्रह जीसैट-12 को अंतरिक्ष कक्षा में सफलतापूर्वक स्थापित किया। 维基百科是一个内容自由、任何人都能参与、并有多种语言的百科全书协作计划。我们的目标是建立一个完整、准确和中立的百科全书。This is a test only.',
        }
        params['xhtml'] = '<p>' + params['xhtml'] + '</p>'
        response = self.app.get(
            url(controller='artifact', action='createArtifact', typeName=conceptType),
            params=params
        )
        assert '"status": 0' not in response, "Unexpectedly created unicode artifact"
        
        response = self.app.get(url(controller='perma', action='get', type='chapter', handle='ध्रुवीय-उपग्रह-प्रक्षेपण-任何'))
        print response
        assert '"status": 0' not in response, "Unexpected get on unicode perma url"

        response = self.app.get(
            url(controller='artifact', action='createArtifact', typeName=conceptType),
            params=params,
            headers={'Cookie': self.getLoginCookie(userID)} ## Fake login
        )
        print response
        assert '"status": 0' in response, "Failed creating unicode artifact"
        j = json.loads(response.normal_body)
        assert j['response'], "No info returned"
        assert j['response'][conceptType]['language'] == 'Hindi', 'Incorrect language for artifact'
        id = j['response'][conceptType]['id']

        chapter = api.getArtifactByIDOrTitle(idOrTitle=id, typeName=conceptType)
        assert chapter, 'Unable to retrieve newly created unicode chapter'

        response = self.app.get(
            url(controller='artifact', action='createArtifact', typeName=conceptType),
            params=params,
            headers={'Cookie': self.getLoginCookie(userID)} ## Fake login
        )
        print response
        assert '"status": 0' not in response, "Unexpectedly created unicode artifact"

    def test_createArtifact(self):
        userID = 3
        params = {
            'authors': 'Stephen AuYueng',
            'title': 'Test Artifact Creation',
            'handle': 'Test-Artifact-Creation',
            'summary': 'Create dummy artifact to test creation',
            'cover image name': 'testImage',
            'cover image description': 'Image for artifact creation test',
            'cover image uri': 'notexist.html',
            'xhtml': '<p>This is a test only.</p>',
        }
        response = self.app.get(
            url(controller='artifact', action='createArtifact', typeName=conceptType),
            params=params
        )
        assert '"status": 0' not in response, "Unexpectedly created artifact"
        
        response = self.app.get(url(controller='perma', action='get', type='chapter', handle='Test-Artifact-Creation'))
        print response
        assert '"status": 0' not in response, "Unexpected get on perma url"

        response = self.app.get(
            url(controller='artifact', action='createArtifact', typeName=conceptType),
            params=params,
            headers={'Cookie': self.getLoginCookie(userID)}
        )
        print response
        assert '"status": 0' in response, "Failed creating artifact"
        j = json.loads(response.normal_body)
        assert j['response'], "No info returned"
        id = j['response'][conceptType]['id']

        chapter = api.getArtifactByIDOrTitle(idOrTitle=id, typeName=conceptType)
        assert chapter, 'Unable to retrieve newly created chapter'

        response = self.app.get(
            url(controller='artifact', action='createArtifact', typeName=conceptType),
            params=params,
            headers={'Cookie': self.getLoginCookie(userID)}
        )
        print response
        assert '"status": 0' not in response, "Unexpectedly created artifact"

    def test_deleteArtifact(self):
        title = 'Test Artifact Creation'
        artifact = api.getArtifactByIDOrTitle(idOrTitle=title)
        assert artifact is not None

        contentUri = artifact.getContentsUri()
        coverUri = artifact.getCoverImageUri()
        owner = artifact.getOwnerId()

        print "Content: %s" % contentUri
        print "Cover image: %s" % coverUri
        vcs = v.vcs(owner)
        content = vcs.get(contentUri)
        print "Content: %s" % content

        userID = 2
        response = self.app.get(
            url(controller='artifact',
                action='deleteArtifact',
                id=artifact.getId()),
            headers={'Cookie': self.getLoginCookie(userID)}
        )
        assert '"status": 0' not in response

        userID = 1
        response = self.app.get(
            url(controller='artifact',
                action='deleteArtifact',
                id=artifact.getId()),
            headers={'Cookie': self.getLoginCookie(userID)}
        )
        assert '"status": 0' in response
        jr = json.loads(response.normal_body)
        self.__waitForTask(jr['response']['taskID'])

        notFound = False
        try:
            content = vcs.get(contentUri)
            if content is None:
                notFound = True
        except:
            notFound = True

        assert notFound, "Did not delete content file"

    def test_createUpdateLesson(self):
        ## Tests creates a lesson and a child concept.
        ## Then it attaches a newer version of that concept to a new lesson.
        userID=3
        params = {
            'authors': 'Nimish P',
            'title': 'Test Lesson Create',
            'handle': 'Test-Lesson-Create',
            'summary': 'Create dummy artifact to test creation',
            'xhtml': '<p>Concept content.</p>',
            'cover image name': '',
            'cover image description': '',
            'cover image uri': '',
            'autoSplitLesson': True,
        }
        ## Create concept
        response = self.app.post(
            url(controller='artifact', action='createArtifact', typeName=lessonType),
            params=params,
            headers={'Cookie': self.getLoginCookie(userID)}
        )
        assert '"status": 0' in response, "Failed creating lesson artifact"

        j = json.loads(response.normal_body)
        assert j['response'][lessonType]
        lessonID = j['response'][lessonType]['id']
        lesson = api.getArtifactByID(id=lessonID)
        assert lesson
	assert len(lesson.revisions[0].children) == 0
        #concept = lesson.revisions[0].children[0].child.artifact
        #assert concept and concept.getTitle() == 'Test Lesson Create' and concept.type.name == conceptType
        #assert 'Concept content' in concept.getXhtml()
        assert 'Concept concept' not in lesson.getXhtml()
        origLessonID = lessonID
        #origConceptID = concept.id

        ## Update lesson
        response = self.app.post(
            url(controller='artifact', action='updateArtifact', id=lessonID, type=lessonType),
            params={'title': 'Test Lesson Update', 'summary': 'Newer summary', 'xhtml': '<p>Concept updated content!</p>', 'autoSplitLesson': True},
            headers={'Cookie': self.getLoginCookie(userID)}
        )
        assert '"status": 0' in response, "Failed updating lesson artifact"

        j = json.loads(response.normal_body)
        assert j['response'][lessonType]
        lessonID = j['response'][lessonType]['id']
        lesson = api.getArtifactByID(id=lessonID)
        assert lesson
	assert len(lesson.revisions[0].children) == 0
        #concept = lesson.revisions[0].children[0].child.artifact
        #print concept
        #assert concept and concept.getTitle() == 'Test Lesson Update' and concept.type.name == conceptType
        #assert 'Concept updated content' in concept.getXhtml()
        assert 'Concept updated concept' not in lesson.getXhtml()
        assert lessonID == origLessonID #and concept.id == origConceptID
        assert len(lesson.revisions) == 2

        api.deleteArtifact(artifact=lesson, recursive=True)

    ## This test disabled and has been moved to test_library
    def __disabled_test_getMyInfo(self):
        response = self.app.get(url(controller='artifact', action='getMyArtifactInfo'),
            headers={'Cookie': self.getLoginCookie(1)} ## Fake login
        )
        assert '"status": 0' in response, "Failed get my artifact info"
        assert 'ERROR:' not in response, "Error getting my artifact info"
        assert '"book"' in response, "my book info not found"
        assert '"chapter"' in response, "my chapter info not found"

        ## Check with one artifact type 
        response = self.app.get(url(controller='artifact', action='getMyArtifactInfo', types='book'),
            params={'pageSize': 2, 'pageNum': 1},
            headers={'Cookie': self.getLoginCookie(3)} ## Fake login
        )
        assert '"status": 0' in response, "Failed get my book info"
        assert 'ERROR:' not in response, "Error getting my book info"
        j = json.loads(response.normal_body)
        assert j['response']['limit'] <= 2, "Page size exceeded"
        for a in j['response']['artifacts']:
            assert a['artifactType'] == 'book', "Got unexpected artifact type: %s" % a['artifactType']

        ## Check with multiple artifact types
        response = self.app.get(url(controller='artifact', action='getMyArtifactInfo'),
            params={'sort': 'name,asc', 'pageSize': -1},
            headers={'Cookie': self.getLoginCookie(3)} ## Fake login
        )
        assert '"status": 0' in response, "Failed get my artifact info sorted by title"
        assert 'ERROR:' not in response, "Error getting my artifact info"
        j = json.loads(response.normal_body)
        self._checkOrder(j['response']['artifacts'], 'title', 'asc', ignoreCase=True)

        ## Check with multiple artifact types
        response = self.app.get(url(controller='artifact', action='getMyArtifactInfo', types='book,chapter'),
            params={'sort': 'latest', 'pageSize': -1},
            headers={'Cookie': self.getLoginCookie(3)} ## Fake login
        )
        assert '"status": 0' in response, "Failed get my book and chapter info"
        assert 'ERROR:' not in response, "Error getting my artifact info"
        bookCnt = chapterCnt = 0
        j = json.loads(response.normal_body)
        for a in j['response']['artifacts']:
            assert a['artifactType'] in ['chapter', 'book'], "Got unexpected artifact type: %s" % a['artifactType']
            if a['artifactType'] == 'book':
                bookCnt += 1
            elif a['artifactType'] == 'chapter':
                chapterCnt += 1
        assert bookCnt > 0 and chapterCnt > 0
        self._checkOrder(j['response']['artifacts'], 'modified', 'desc')

    def test_getInfo(self):
        id = 1
        response = self.app.get(url(controller='artifact', action='getInfo', type=bookType, id=id))
        assert '"status": 0' in response, "Failed get book info"
        assert 'ERROR:' not in response, "Error getting book info"
        assert '"book"' in response, "book info not found"
        for id in [2, 3, 4, 5, 6]:
            response = self.app.get(url(controller='artifact', action='getInfo', type=chapterType, id=id))
            assert '"status": 0' in response, "Failed get chapter info"
            assert 'ERROR:' not in response, "Error getting chapter info"
            assert '"chapter"' in response, "chapter info not found"

    def test_getDetail(self):
        id = 1
        response = self.app.get(url(controller='artifact', action='getDetail', type=bookType, id=id))
        assert '"status": 0' in response, "Failed get book detail"
        assert 'ERROR:' not in response, "Error getting book detail"
        assert '"book"' in response, "book detail not found"
        for id in [2, 3, 4, 5, 6]:
            response = self.app.get(url(controller='artifact', action='getDetail', type=chapterType, id=id))
            print response
            assert '"status": 0' in response, "Failed get chapter detail"
            assert 'ERROR:' not in response, "Error getting chapter detail"
            assert '"chapter"' in response, "chapter detail not found"

        for id in [2, 3, 4, 5, 6]:
            response = self.app.get(url(controller='artifact', action='getRevisionDetail', id=id))
            print response
            assert '"status": 0' in response, "Failed get revision detail"
            assert 'ERROR:' not in response, "Error getting revision detail"

    def test_getLatest(self):
        response = self.app.get(
            url(controller='artifact', action='getLatest'),
            params={'pageNum': '1', 'pageSize': '5'},
        )
        assert '"status": 0' in response, "Failed get latest"
        assert 'ERROR:' not in response, "Error getting latest"

    def _test_getPopular(self):
        response = self.app.get(
            url(controller='artifact', action='getPopular'),
            params={'pageNum': '1', 'pageSize': '5'},
        )
        assert '"status": 0' in response, "Failed get popular"
        assert 'ERROR:' not in response, "Error getting popular"

    def test_updateResourceHash(self):
        response = self.app.get(url(controller='artifact', action='updateResourceHash', type=bookType))
        assert '"status": 0' in response, "Failed updating resource hash"

    def test_updateArtifactRevisions(self):
        userID=1
        params = {
            'authors': 'Nimish P',
            'title': 'Test Artifact Creation 2',
            'handle': 'Test-Artifact-Creation 2',
            'summary': 'Create dummy artifact to test creation',
            'xhtml': '<p>Creating.</p>',
            'cover image name': '',
            'cover image description': '',
            'cover image uri': '',
        }
        response = self.app.post(
            url(controller='artifact', action='createArtifact', typeName=conceptType),
            params=params,
            headers={'Cookie': self.getLoginCookie(userID)} ## Fake login
        )
        assert '"status": 0' in response, "Failed creating artifact"

        j = json.loads(response.normal_body)
        print 'j[%s]' % j
        id = j['response'][conceptType]['id']

        response = self.app.post(
            url(controller='artifact', action='updateArtifact', id=id),
            params={'title': 'Newer title', 'summary': 'Newer summary', 'xhtml': '<p>Updating!</p>'},
            headers={'Cookie': self.getLoginCookie(userID)} ## Fake login
        )
        print 'create response[%s]' % response
        assert '"status": 0' in response, "Failed updating artifact"

        response = self.app.get(url(controller='artifact', action='getDetail', id=id), params={'waitForTask': True})
        print 'update response[%s]' % response
        assert '"status": 0' in response, "Failed to get detail for new artifact"

        ## Update without change in xhtml
        response = self.app.post(
            url(controller='artifact', action='updateArtifact', id=id),
            params={'title': 'Newer title', 'summary': 'Newer summary', 'xhtml': '<p>Updating!</p>'},
            headers={'Cookie': self.getLoginCookie(userID)} ## Fake login
        )
        assert '"status": 0' in response, "Failed updating artifact"

        response = self.app.get(url(controller='artifact', action='getInfo', id=id))
        assert '"status": 0' in response, "Failed to get info for new artifact"

        if id:
            response = self.app.get(
                url(controller='artifact',
                    action='deleteArtifact',
                    id=id),
                headers={'Cookie': self.getLoginCookie(userID)} ## Fake login
            )
            assert '"status": 0' in response
            jr = json.loads(response.normal_body)
            self.__waitForTask(jr['response']['taskID'])

    def test_updateArtifact(self):
        userID=1
        response = self.app.post(
            url(controller='artifact', action='updateArtifact', id=2),
            params={'title': 'New title', 'summary': 'New summary', 'bookTitle': 'Physics', 'authors': 'Nimish P:author;Dow Jones, Ph.D:contributor'},
            headers={'Cookie': self.getLoginCookie(userID)} ## Fake login
        )
        assert '"status": 0' in response, "Failed updating artifact"
        j = json.loads(response.normal_body)
        id = j['response']['artifact']['id']
        artifact = api.getArtifactByID(id=id)
        assert len(artifact.authors) == 2
        for author in artifact.authors:
            assert author.name in ['Nimish P', 'Dow Jones, Ph.D']

        response = self.app.post(
            url(controller='artifact', action='updateArtifact', id='New title-::of::-Physics'),
            params={'title': 'Newer title', 'summary': 'Newer summary', 'bookTitle': 'Physics', 'authors': 'Nimish P:editor'},
            headers={'Cookie': self.getLoginCookie(userID)} ## Fake login
        )
        assert '"status": 0' in response, "Failed updating artifact"
        j = json.loads(response.normal_body)
        id = j['response']['artifact']['id']
        artifact = api.getArtifactByID(id=id)
        assert len(artifact.authors) == 1
        for author in artifact.authors:
            assert author.name in ['Nimish P']

        if id != '2':
            print 'Delete artifact[%s]' % id
            response = self.app.get(
                url(controller='artifact',
                    action='deleteArtifact',
                    id=id),
                headers={'Cookie': self.getLoginCookie(userID)} ## Fake login
            )
            print 'response[%s]' % response
            assert '"status": 0' in response
            jr = json.loads(response.normal_body)
            self.__waitForTask(jr['response']['taskID'])

    def test_updateArtifactCase1(self):
        ## Tests creates a concept and a parent lesson.
        ## Then it attaches a newer version of that concept to a new lesson.
        userID=3
        params = {
            'authors': 'Deepak Babu',
            'title': 'Test Artifact Creation 1',
            'handle': 'Test-Artifact-Creation-1',
            'summary': 'Create dummy artifact to test creation',
            'xhtml': '<p>Creating.</p>',
            'cover image name': '',
            'cover image description': '',
            'cover image uri': '',
        }
        ## Create concept
        response = self.app.post(
            url(controller='artifact', action='createArtifact', typeName=conceptType),
            params=params,
            headers={'Cookie': self.getLoginCookie(userID)} ## Fake login
        )
        assert '"status": 0' in response, "Failed creating concept artifact"

        j = json.loads(response.normal_body)
        concept_id = j['response'][conceptType]['id']
        concept_rev_id = j['response'][conceptType]['revisions'][0]['id']
        original_concept_rev_id = concept_rev_id
        print "On create, concept id: %s, concept rev id: %s" % (concept_id, concept_rev_id)

        params = {
            'authors': 'Deepak Babu',
            'title': 'Test Artifact Creation 2',
            'handle': 'Test-Artifact-Creation-2',
            'summary': 'Create dummy artifact to test creation',
            'xhtml': '<p>Creating.</p>',
            'cover image name': '',
            'cover image description': '',
            'cover image uri': '',
            'autoSplitLesson': 'false',
            'children': concept_rev_id
        }
        ## Create lesson with concept as child
        response = self.app.post(
            url(controller='artifact', action='createArtifact', typeName=lessonType),
            params=params,
            headers={'Cookie': self.getLoginCookie(userID)} ## Fake login
        )
        assert '"status": 0' in response, "Failed creating lesson artifact"
        j = json.loads(response.normal_body)
        lesson_id = j['response'][lessonType]['id']
        lesson_rev_id = j['response'][lessonType]['revisions'][0]['id']
        print "On create, lesson_id: %s, lesson_rev_id: %s" % (lesson_id, lesson_rev_id)

        ## Update concept
        response = self.app.post(
            url(controller='artifact', action='updateArtifact', id=concept_id),
            params={'title': 'Newer title', 'summary': 'Newer summary', 'xhtml': '<p>Updating!</p>'},
            headers={'Cookie': self.getLoginCookie(userID)} ## Fake login
        )
        assert '"status": 0' in response, "Failed updating concept artifact"
        j = json.loads(response.normal_body)
        concept_id = j['response']['artifact']['id']
        concept_rev_id = j['response']['artifact']['revisions'][0]['id']

        print "After update, concept id: %s, concept rev id: %s" % (concept_id, concept_rev_id)

        params = {
            'authors': 'Deepak Babu',
            'title': 'Test Artifact Creation 3',
            'handle': 'Test-Artifact-Creation-3',
            'summary': 'Create dummy artifact to test creation',
            'xhtml': '<p>Creating.</p>',
            'cover image name': '',
            'cover image description': '',
            'cover image uri': '',
            'children': concept_rev_id
        }
        ## Create new lesson with new concept 
        response = self.app.post(
            url(controller='artifact', action='createArtifact', typeName=lessonType),
            params=params,
            headers={'Cookie': self.getLoginCookie(userID)} ## Fake login
        )
        assert '"status": 0' in response, "Failed creating lesson artifact"
        j = json.loads(response.normal_body)
        lesson_id2 = j['response'][lessonType]['id']

        response = self.app.get(url(controller='artifact', action='getDetail', id=lesson_id), params={'waitForTask': True})
        jOrig = json.loads(response.normal_body)

        response = self.app.get(url(controller='artifact', action='getDetail', id=lesson_id2), params={'waitForTask': True})
        j = json.loads(response.normal_body)
        lesson_id2 = j['response']['artifact']['id']
        lesson_rev_id2 = j['response']['artifact']['revisions'][0]['id']
        print "On create, lesson_id: %s, lesson_rev_id: %s" % (lesson_id2, lesson_rev_id2)

        print "Children of old lesson: %s" % j['response']['artifact']['revisions'][0]['children']
        print "Children of new lesson: %s" % jOrig['response']['artifact']['revisions'][0]['children']

        response = self.app.get(
            url(controller='artifact',
                action='deleteArtifact',
                id=lesson_id2),
            params={'recursive': 'false'},
            headers={'Cookie': self.getLoginCookie(userID)} ## Fake login
        )
        assert '"status": 0' in response, "Failed to delete artifact"
        jr = json.loads(response.normal_body)
        self.__waitForTask(jr['response']['taskID'])

        response = self.app.get(
            url(controller='artifact',
                action='deleteArtifact',
                id=lesson_id),
            params={'recursive': 'false'},
            headers={'Cookie': self.getLoginCookie(userID)} ## Fake login
        )
        assert '"status": 0' in response, "Failed to delete artifact"
        jr = json.loads(response.normal_body)
        self.__waitForTask(jr['response']['taskID'])

        response = self.app.get(
            url(controller='artifact',
                action='deleteArtifact',
                id=concept_id),
            params={'recursive': 'false'},
            headers={'Cookie': self.getLoginCookie(userID)} ## Fake login
        )
        assert '"status": 0' in response, "Failed to delete artifact"
        jr = json.loads(response.normal_body)
        self.__waitForTask(jr['response']['taskID'])
       
        assert len(j['response']['artifact']['revisions'][0]['children']) == 1, "Failed updating lesson artifact: Child ID not updated"
        assert j['response']['artifact']['revisions'][0]['children'][0]['revisions'][0]['id'] == concept_rev_id

        childList = jOrig['response']['artifact']['revisions'][0]['children']
        print 'original_concept_rev_id[%s]' % original_concept_rev_id
        print 'childList[%s]' % childList
        assert len(jOrig['response']['artifact']['revisions'][0]['children']) == 1, "Failed updating lesson artifact: Child ID not updated"
        assert original_concept_rev_id == childList[0]['revisions'][0]['id']

    def test_updateArtifactCase2(self):
        userID=3
        params = {
            'authors': 'Deepak Babu',
            'title': 'Test Artifact Creation 1',
            'handle': 'Test-Artifact-Creation-1',
            'summary': 'Create dummy artifact to test creation',
            'xhtml': '<p>Creating.</p>',
            'cover image name': '',
            'cover image description': '',
            'cover image uri': '',
        }
        response = self.app.post(
            url(controller='artifact', action='createArtifact', typeName=conceptType),
            params=params,
            headers={'Cookie': self.getLoginCookie(userID)} ## Fake login
        )
        assert '"status": 0' in response, "Failed creating concept artifact"

        j = json.loads(response.normal_body)
        concept_id = j['response'][conceptType]['id']
        concept_rev_id = j['response'][conceptType]['revisions'][0]['id']
        original_concept_rev_id = concept_rev_id
        print "On create, concept id: %s, concept rev id: %s" % (concept_id, concept_rev_id)

        params = {
            'authors': 'Deepak Babu',
            'title': 'Test Artifact Creation 2',
            'handle': 'Test-Artifact-Creation-2',
            'summary': 'Create dummy artifact to test creation',
            'xhtml': '<p>Creating.</p>',
            'cover image name': '',
            'cover image description': '',
            'cover image uri': '',
            'children': concept_rev_id
        }
        response = self.app.post(
            url(controller='artifact', action='createArtifact', typeName=lessonType),
            params=params,
            headers={'Cookie': self.getLoginCookie(userID)} ## Fake login
        )
        assert '"status": 0' in response, "Failed creating lesson artifact"
        j = json.loads(response.normal_body)
        lesson_id = j['response'][lessonType]['id']
        lesson_rev_id = j['response'][lessonType]['revisions'][0]['id']
        print "On create, lesson_id: %s, lesson_rev_id: %s" % (lesson_id, lesson_rev_id)

        response = self.app.post(
            url(controller='artifact', action='updateArtifact', id=concept_id),
            params={'title': 'Newer title', 'summary': 'Newer summary', 'xhtml': '<p>Updating!</p>'},
            headers={'Cookie': self.getLoginCookie(userID)} ## Fake login
        )
        assert '"status": 0' in response, "Failed updating concept artifact"
        j = json.loads(response.normal_body)
        concept_id = j['response']['artifact']['id']
        concept_rev_id = j['response']['artifact']['revisions'][0]['id']

        print "After update, concept id: %s, concept rev id: %s" % (concept_id, concept_rev_id)

        response = self.app.post(
            url(controller='artifact', action='updateArtifact', id=lesson_id),
            params={'title': 'Newer title', 'summary': 'Newer summary', 'xhtml': '<p>Updating!</p>', 'children':concept_rev_id},
            headers={'Cookie': self.getLoginCookie(userID)} ## Fake login
        )
        response = self.app.get(url(controller='artifact', action='getDetail', id=lesson_id), params={'waitForTask': True})
        updated_lesson_response = json.loads(response.normal_body)

        print "After update, lesson_id: %s, lesson_rev_id: %s" % (updated_lesson_response['response']['artifact']['id'], updated_lesson_response['response']['artifact']['revisions'][0]['id'])
        print "Children: %s" % updated_lesson_response['response']['artifact']['revisions'][0].get('children')
       
        #assert len(updated_lesson_response['response']['artifact']['revisions'][0]['children']) == 1, "Failed updating lesson artifact: Child ID not updated"
        #assert updated_lesson_response['response']['artifact']['revisions'][0]['children'][0]['revisions'][0]['id'] != original_concept_rev_id
        
        response = self.app.get(
            url(controller='artifact',
                action='deleteArtifact',
                id=lesson_id),
            params={'recursive': 'false'},
            headers={'Cookie': self.getLoginCookie(userID)} ## Fake login
        )
        assert '"status": 0' in response, "Failed to delete artifact"
        jr = json.loads(response.normal_body)
        self.__waitForTask(jr['response']['taskID'])

        response = self.app.get(
            url(controller='artifact',
                action='deleteArtifact',
                id=concept_id),
            headers={'Cookie': self.getLoginCookie(userID)} ## Fake login
        )
        assert '"status": 0' in response, "Failed to delete artifact"
        jr = json.loads(response.normal_body)
        self.__waitForTask(jr['response']['taskID'])

    def test_updateArtifactCase3(self):
        userID=3
        params = {
            'authors': 'Deepak Babu',
            'title': 'Test Artifact Creation 3',
            'handle': 'Test-Artifact-Creation-3',
            'summary': 'Create dummy artifact to test creation',
            'xhtml': '<p>Creating.</p>',
            'cover image name': '',
            'cover image description': '',
            'cover image uri': '',
        }
        response = self.app.post(
            url(controller='artifact', action='createArtifact', typeName=conceptType),
            params=params,
            headers={'Cookie': self.getLoginCookie(userID)} ## Fake login
        )
        assert '"status": 0' in response, "Failed creating concept artifact"

        j = json.loads(response.normal_body)
        concept_id = j['response'][conceptType]['id']
        concept_rev_id = j['response'][conceptType]['revisions'][0]['id']
        params = {
            'authors': 'Deepak Babu',
            'title': 'Test Artifact Creation 4',
            'handle': 'Test-Artifact-Creation-4',
            'summary': 'Create dummy artifact to test creation',
            'xhtml': '<p>Creating.</p>',
            'cover image name': '',
            'cover image description': '',
            'cover image uri': '',
            'children': concept_rev_id
        }
        response = self.app.post(
            url(controller='artifact', action='createArtifact', typeName=lessonType),
            params=params,
            headers={'Cookie': self.getLoginCookie(userID)} ## Fake login
        )
        assert '"status": 0' in response, "Failed creating lesson artifact"
        j = json.loads(response.normal_body)
        lesson_id = j['response'][lessonType]['id']
        lesson_rev_id = j['response'][lessonType]['revisions'][0]['id']

        response = self.app.post(
            url(controller='artifact', action='updateArtifact', id=concept_id),
            params={'title': 'Newer title', 'summary': 'Newer summary', 'xhtml': '<p>Updating!</p>'},
            headers={'Cookie': self.getLoginCookie(userID)} ## Fake login
        )
        assert '"status": 0' in response, "Failed updating concept artifact"
        j = json.loads(response.normal_body)
        concept_id = j['response']['artifact']['id']
        concept_rev_id = j['response']['artifact']['revisions'][0]['id']

        response = self.app.post(
            url(controller='artifact', action='updateArtifact', id=lesson_id),
            params={'title': 'Newer title', 'summary': 'Newer summary', 'children':[concept_rev_id]},
            headers={'Cookie': self.getLoginCookie(userID)} ## Fake login
        )
        response = self.app.get(url(controller='artifact', action='getInfo', id=lesson_id))
        updated_lesson_response = json.loads(response.normal_body)
        
        response = self.app.get(
            url(controller='artifact',
                action='deleteArtifact',
                id=lesson_id),
            params={'recursive': 'false'},
            headers={'Cookie': self.getLoginCookie(userID)} ## Fake login
        )
        assert '"status": 0' in response, "Failed to delete artifact"
        jr = json.loads(response.normal_body)
        self.__waitForTask(jr['response']['taskID'])

        response = self.app.get(
            url(controller='artifact',
                action='deleteArtifact',
                id=concept_id),
            headers={'Cookie': self.getLoginCookie(userID)} ## Fake login
        )
        assert '"status": 0' in response, "Failed to delete artifact"
        jr = json.loads(response.normal_body)
        self.__waitForTask(jr['response']['taskID'])
        
        #assert len(updated_lesson_response['response']['artifact']['revisions'][0]['children']) == 1, "Failed updating lesson artifact: Child ID not updated"

    def test_publishArtifact(self):
        response = self.app.get(
            url(controller='artifact',
                action='publishArtifact',
                id=2,
                member=1),
            headers={'Cookie': 'flx2=%s' % self.login(5)}
        )
        assert '"status": 0' not in response, "Unexpected publishing artifact"

        response = self.app.get(
            url(controller='artifact',
                action='publishArtifact',
                id=1,
                member=4),
            headers={'Cookie': 'flx2=%s' % self.login(1)}
        )
        assert '"status": 0' in response, "Failed publishing artifact"

    def test_publishArtifactRevision(self):
        response = self.app.get(
            url(controller='artifact',
                action='publishArtifactRevision',
                id=2,
                member=1),
            params={'contributionType': 'original'},
            headers={'Cookie': 'flx2=%s' % self.login(5)}
        )
        assert '"status": 0' not in response, "Unexpected publishing artifact revision"

        response = self.app.get(url(controller='artifact', action='getInfo', id=2))
        assert '"status": 0' in response, "Failed retrieving a published artifact"

        response = self.app.get(
            url(controller='artifact',
                action='publishArtifactRevision',
                id=1,
                member=4),
            params={'contributionType': 'original'},
            headers={'Cookie': 'flx2=%s' % self.login(1)}
        )
        assert '"status": 0' in response, "Failed publishing artifact revision"

        response = self.app.get(url(controller='artifact', action='getInfo', id=1))
        assert '"status": 0' in response, "Failed retrieving a published artifact"

    def __waitForTask(self, taskId):
        maxCount = 50
        cnt = 0
        while True:
            time.sleep(5)
            cnt += 1
            if cnt >= maxCount:
                assert False, "Exceed max wait of %d secs!" % maxCount
                break

            response = self.app.get(url(controller='task', action='getStatus', taskID = taskId), headers={'Cookie': self.getLoginCookie(1)})
            assert '"status": 0' in response, "Failed to check status"

            js = json.loads(response.normal_body)
            assert js['response']['taskID'] == taskId
            assert js['response']['status'], "Invalid task status"
            assert js['response']['status'] != 'FAILURE', "Task failed."

            if js['response']['status'] == "SUCCESS":
                break

    def _createIndex(self, ids):
        global INDEX_CREATED
        if INDEX_CREATED:
            return

        print "Creating index for ids: %s" % ids
        artifactIDs = ""
        for id in ids:
            if artifactIDs:
                artifactIDs += ","
            artifactIDs += str(id)
        response = self.app.post(url(controller='search', action='reindex'), params = { 'artifactIDs': artifactIDs}, headers={'Cookie': 'flx2=%s' % self.login(1)})
        jr = json.loads(response.normal_body)
        self.__waitForTask(jr['response']['taskID'])

        ## Build spell index
        resp = urllib2.urlopen("http://localhost:8080/solr/select?q=sid:zzz&spellcheck=true&spellcheck.build=true")
        print "Spell checker: %s" % resp.read()
        INDEX_CREATED = True

    def test_getRelatedArtifacts(self):
        self._createIndex(range(49,75))
        response = self.app.get(url(controller='artifact', action='getRelatedArtifacts', id=60))
        assert '"status": 0' in response, "Error getting related artifacts"
        j = json.loads(response.normal_body)
        assert j['response']['total'] > 0, "Got 0 results"
        assert j['response']['total'] >= j['response']['limit']

        response = self.app.get(url(controller='artifact', action='getRelatedArtifacts', id=60, type=chapterType), params={'pageNum':2, 'pageSize':5})
        print response
        assert '"status": 0' in response, "Error getting related chapters"
        j = json.loads(response.normal_body)
        assert j['response']['total'] > 0, "Got 0 results"
        assert j['response']['offset'] == 5, "Wrong offset"
        assert j['response']['limit'] == 5, "Wrong limit"


    def _browseWithFilters(self, term):
        response = self.app.get(url(controller='artifact', action='browseArtifactInfoPaginated', browseTerm=term, type='artifact'), params={'pageNum':1, 'pageSize':5})
        assert '"status": 0' in response, "Error browsing paginated"
        j = json.loads(response.normal_body)
        filters = j['response']['filters']

        assert filters is not None, "No filters returned"
        if filters:
            fld = 'domains.ext'
            assert filters.has_key(fld)
            if filters[fld]:
                filterTerm = filters[fld][0][0]
                filterQuery = '%s,%s' % (fld, filters[fld][0][0])
                print filterTerm, filterQuery
                response = self.app.get(url(controller='artifact', action='browseArtifactInfoPaginated', browseTerm=term, type='artifact'), params={'filters':filterQuery})
                assert '"status": 0' in response, "Error getting filtered response"
                j2 = json.loads(response.normal_body)
                assert j2['response']['limit'] > 0, "Zero rows after filtering"
                for hit in j2['response'][term]:
                    found = False
                    artifactID = hit['id']
                    artifact = api.getArtifactByID(id=artifactID)
                    assert artifact
                    fg = artifact.getFoundationGrid()
                    print fg
                    for id, term, eid, handle, brnhandle in fg:
                        if term.lower() == filterTerm:
                            found = True
                            break
                    assert found, "Did not find the term filtered on!"

    def _checkOrder(self, list, param, order, numeric=False, ignoreCase=False):
        last = None
        for item in list:
            if last:
                thisVal = item[param]
                if numeric:
                    thisVal = int(thisVal)
                elif ignoreCase:
                    thisVal = thisVal.lower()
                if order == 'desc':
                    assert thisVal <= last, "Sort order not correct"
                else:
                    assert thisVal >= last, "Sort order not correct [%s not >= %s]" % (thisVal, last)
            last = item[param]
            if numeric:
                last = int(last)
            elif ignoreCase:
                last = last.lower()

    def test_browseArtifactInfoPaginated(self):
        self._createIndex(range(49,75))
        response = self.app.get(url(controller='artifact', action='browseArtifactInfoPaginated', browseTerm='science', type='artifact'), params={'pageNum':1, 'pageSize':5, 'sort': 'latest'})
        assert '"status": 0' in response, "Error browsing paginated"
        j = json.loads(response.normal_body)
        assert j['response']['total'] >= j['response']['limit']

        self._checkOrder(j['response']['science'], 'modified', 'desc')
           
        response = self.app.get(url(controller='artifact', action='browseArtifactInfoPaginated', browseTerm='science', type='artifact'), params={'pageNum':1, 'pageSize':5, 'sort': 'popular'})
        assert '"status": 0' in response, "Error browsing paginated"
        j = json.loads(response.normal_body)
        assert j['response']['total'] >= j['response']['limit']

        response = self.app.get(url(controller='artifact', action='browseArtifactInfoPaginated', browseTerm='science', type='artifact'), params={'pageNum':2, 'pageSize':5, 'sort': 'sid,desc'})
        assert '"status": 0' in response, "Error browsing paginated"
        j = json.loads(response.normal_body)
        assert j['response']['total'] >= j['response']['limit']

        self._checkOrder(j['response']['science'], 'sid', 'desc', numeric=True)

    def test_browseArtifactInfoPaginatedWithFilters(self):
        self._createIndex(range(49,75))
        for term in ['science', 'evolution']:
            self._browseWithFilters(term)

    def test_browseArtifactInfoByTermGridPaginated(self):
        self._createIndex(range(49,75))
        response = self.app.get(url(controller='artifact', action='browseArtifactInfoByTermGridPaginated', browseTerms='science/evolution', type='artifact'), params={'pageNum': 1, 'pageSize': 1, 'sort': 'stitle,desc'})
        assert '"status": 0' in response, "Error getting browse response"
        j = json.loads(response.normal_body)
        assert j['response']['total'] >= j['response']['limit']
        andTotal = j['response']['total']

        self._checkOrder(j['response']['result'], 'title', 'desc')

        response = self.app.get(url(controller='artifact', action='browseArtifactInfoByTermGridPaginated', browseTerms='science,evolution', type='artifact'), params={'pageNum': 1, 'pageSize': 1, 'sort': 'stitle,desc'})
        assert '"status": 0' in response, "Error getting browse response"
        j = json.loads(response.normal_body)
        assert j['response']['total'] and j['response']['total'] >= j['response']['limit']
        orTotal = j['response']['total']
        assert andTotal <= orTotal, "Got fewer results when OR-ing the browse terms"
        self._checkOrder(j['response']['result'], 'title', 'desc')

    def test_searchArtifacts(self):
        self._createIndex(range(49, 75))
        response = self.app.get(url(controller='artifact', action='searchArtifacts', searchTerm='science', rtype='info', types='artifact'), params={'pageNum':1, 'pageSize':5, 'sort':'latest'})
        assert '"status": 0' in response, "Error searching for artifacts"
        print response
        j = json.loads(response.normal_body)
        assert j['response']['Artifacts']['total'] >= j['response']['Artifacts']['limit']

        self._checkOrder(j['response']['Artifacts']['result'], 'modified', 'desc')

        response = self.app.get(url(controller='artifact', action='searchArtifacts', searchTerm='science', rtype='info', types='artifact'), params={'pageNum':1, 'pageSize':5, 'sort':'stitle,asc'})
        assert '"status": 0' in response, "Error searching for artifacts"
        print response
        j = json.loads(response.normal_body)
        assert j['response']['Artifacts']['total'] >= j['response']['Artifacts']['limit']
        self._checkOrder(j['response']['Artifacts']['result'], 'title', 'asc')

        ## Test spelling suggestions
        response = self.app.get(url(controller='artifact', action='searchArtifacts', searchTerm='evlution', rtype='info', types='artifact'), params={'pageNum':1, 'pageSize':5})
        assert '"status": 0' in response, "Error searching for artifacts"
        print response
        j = json.loads(response.normal_body)
        assert j['response']['Artifacts']['suggestions']

    ## Disabled since this functionality is moved to the library controller
    def __disabled_test_searchMyArtifacts(self):
        self._createIndex(range(49, 75))
        userID = 31
        response = self.app.get(url(controller='artifact', action='searchMyArtifacts', searchTerm='science', types='artifact'),
                                    params={'pageNum':1, 'pageSize':5, 'sort':'latest'},
                                    headers={'Cookie': self.getLoginCookie(userID)} ## Fake login
                                   )
        assert '"status": 0' in response, "Error searching for artifacts"
        print response
        j = json.loads(response.normal_body)
        assert j['response']['Artifacts']['total'] >= j['response']['Artifacts']['limit']

        self._checkOrder(j['response']['Artifacts']['result'], 'modified', 'desc')

        response = self.app.get(url(controller='artifact', action='searchArtifacts', searchTerm='science', types='book,chapter'),
                                    params={'pageNum':1, 'pageSize':5, 'sort':'stitle,asc'},
                                    headers={'Cookie': self.getLoginCookie(userID)} ## Fake login
                                   )
        assert '"status": 0' in response, "Error searching for artifacts"
        print response
        j = json.loads(response.normal_body)
        assert j['response']['Artifacts']['total'] >= j['response']['Artifacts']['limit']
        self._checkOrder(j['response']['Artifacts']['result'], 'title', 'asc')

        ## Test spelling suggestions
        response = self.app.get(url(controller='artifact', action='searchArtifacts', searchTerm='evlution', types='artifact'),
                                params={'pageNum':1, 'pageSize':5},
                                headers={'Cookie': self.getLoginCookie(userID)} ## Fake login
                               )
        assert '"status": 0' in response, "Error searching for artifacts"
        print response
        j = json.loads(response.normal_body)
        assert j['response']['Artifacts']['suggestions']

    def test_searchDomain(self):
        self._createIndex(range(49, 75))
        response = self.app.get(url(controller='artifact', action='searchDomain', domain='science', searchTerm='evolution'), params={'pageNum':1, 'pageSize':5, 'sort': 'latest'})
        assert '"status": 0' in response, "Error searching for artifacts"
        print response
        j = json.loads(response.normal_body)
        assert j['response']['Artifacts']['total'] >= j['response']['Artifacts']['limit']

        self._checkOrder(j['response']['Artifacts']['result'], 'modified', 'desc')

    def test_searchWikipedia(self):
        response = self.app.get(url(controller='artifact', action='searchWikipedia', domain='science', searchTerm='evolution'), params={'pageNum':1, 'pageSize':5})
        assert '"status": 0' in response, "Error searching in wikipedia"
        print response
        j = json.loads(response.normal_body)
        assert j['response']['Wikipedia']['total'] >= j['response']['Wikipedia']['limit']
        assert j['response']['Wikipedia']['limit'] == 5

    def test_getInfoArtifactResources(self):
        response = self.app.get(url(controller='artifact', action='getResourcesInfo', id=234, type='artifact', revisionID=0, resourceTypes='resource'))
        assert '"status": 0' in response, "Error getting all resources for artifact"
        j = json.loads(response.normal_body)
        assert j['response']['resources'] and len(j['response']['resources']) > 1, "Could not get resources for artifact"
        artifact = api.getArtifactByID(id=234)
        revisionID = artifact.revisions[0].id

        response = self.app.get(url(controller='artifact', action='getResourcesInfo', id=234, type='artifact', revisionID=revisionID, resourceTypes='resource'))
        assert '"status": 0' in response, "Error getting all resources for artifact"
        j = json.loads(response.normal_body)
        assert j['response']['resources'] and len(j['response']['resources']) > 1, "Could not get resources for artifact"

        response = self.app.get(url(controller='artifact', action='getResourcesInfo', id=234, type='artifact', revisionID=revisionID, resourceTypes='contents'))
        assert '"status": 0' in response, "Error getting all resources for artifact"
        j = json.loads(response.normal_body)
        assert j['response']['resources'] and len(j['response']['resources']) == 1, "Could not get contents for artifact"
        assert j['response']['resources'][0]['type'] == 'contents', "Could not get contents for artifact"

    def test_getInfoListArtifactRevisions(self):
        response = self.app.get(url(controller='artifact', action='getRevisionListInfo', ids='1,2,3,4,5,6'))
        assert '"status": 0' in response, "Error getting artifact info from revision ids"
        j = json.loads(response.normal_body)
        l = j['response']['artifacts']
        assert len(l) == 6, "Wrong number of artifacts"

    def test_getInfoListArtifacts(self):
        response = self.app.get(url(controller='artifact', action='getArtifactListInfo', ids='1,2,3,4,5,6'))
        assert '"status": 0' in response, "Error getting artifact info from artifact ids"
        j = json.loads(response.normal_body)
        assert j['response']['limit'] == 6, "Wrong number of artifacts"
        assert j['response']['total'] == 6, "Wrong number of artifacts"

    def test_getInfoListArtifacts2(self):
        response = self.app.get(url(controller='artifact', action='getRevisionListInfoOfArtifact', id='1'))
        assert '"status": 0' in response, "Error getting revision info from artifact id"
        j = json.loads(response.normal_body)
        assert j['response']['limit'] >= 1, "Too little revisions"
        assert j['response']['total'] >= 1, "Too little revisions"

    def test_getExtendedArtifacts(self):
        books = api.getArtifacts(typeName=bookType, pageNum=1, pageSize=1)
        assert books
        bookID = books[0].id

        response = self.app.get(url(controller='artifact', action='getExtendedArtifacts', type='book', id=bookID, artifactTypes='artifact'))
        assert '"status": 0' in response, "Error getting extended artifacts info from artifact id"

        response = self.app.get(url(controller='artifact', action='getExtendedArtifacts', id=bookID, artifactTypes='workbook,labkit'))
        assert '"status": 0' in response, "Error getting extended artifacts info from artifact id"

        response = self.app.get(url(controller='artifact', action='getExtendedArtifacts', type='book', id=bookID+1, artifactTypes='workbook,labkit'))
        assert '"status": 0' not in response, "Unexpected success getting extended artifacts info from artifact id"

    def test_getArtifactTypes(self):
        response = self.app.get(url(controller='artifact', action='getArtifactTypes', params={'pageSize': 100}))
        assert '"status": 0' in response, "Error getting artifact types"
        j = json.loads(response.normal_body)
        assert j['response']['total'], "Received 0 artifact types"
        total = j['response']['total']

        response = self.app.get(url(controller='artifact', action='getArtifactTypes', params={'pageSize': 100, 'modalitiesOnly': True}))
        assert '"status": 0' in response, "Error getting artifact types"
        j = json.loads(response.normal_body)
        assert j['response']['total'], "Received 0 artifact types"
        assert j['response']['total'] >= total, "Received fewer types with modalitiesOnly filter"
