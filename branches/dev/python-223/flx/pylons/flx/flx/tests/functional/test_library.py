# -*- coding: utf-8 -*-

from flx.tests import *
from flx.model import api, meta
import json
import logging
import os

log = logging.getLogger(__name__)

bookType = 'book'
chapterType = 'chapter'
lessonType = 'lesson'
conceptType = 'concept'

class TestLibraryController(TestController):

    def setUp(self):
        super(TestLibraryController, self).setUp()
        #session = meta.Session()
        ## Clean up the library
        self.userID = 109
        self.userLogin = 'james'
        objects = api.getLibraryArtifactRevisions(memberID=self.userID)
        for object in objects:
            try:
                api.removeObjectFromLibrary(objectID=object.artifactRevisionID, objectType='artifactRevision', memberID=self.userID)
            except:
                pass
        objects = api.getLibraryResourceRevisions(memberID=self.userID)
        for object in objects:
            try:
                api.removeObjectFromLibrary(objectID=object.resourceRevisionID, objectType='resourceRevision', memberID=self.userID)
            except:
                pass

    def test_addRemoveObjectToLibrary(self):
        books = api.getArtifacts(typeName=bookType, pageNum=1, pageSize=1)
        assert books[0]
        arID = books[0].revisions[0].id
        aID = books[0].id

        ## Make one call to cache the artifact
        response = self.app.get(
            url(controller='artifact', action='getInfo', id=aID),
            headers={'Cookie': self.getLoginCookie(self.userID)}
        )
        assert '"status": 0' in response, "Failed to get the artifact info by id"

        response = self.app.post(
            url(controller='library', action='addToLibrary'),
            params={
                'objectID': arID, 
                'objectType': 'artifactRevision',
                },
            headers={'Cookie': self.getLoginCookie(self.userID)}
        )
        assert '"status": 0' in response, "Failed to add artifact to library"

        response = self.app.get(
            url(controller='artifact', action='getInfo', id=aID),
            headers={'Cookie': self.getLoginCookie(self.userID)}
        )
        assert '"status": 0' in response, "Failed to get the artifact info by id"
        j = json.loads(response.normal_body)
        assert j['response']['artifact']['revisions'][0]['addedToLibrary'], "Could not get the addedToLibrary flag for artifact" 

        objects = api.getLibraryArtifactRevisions(memberID=self.userID)
        assert objects
        assert objects[0].artifactRevision.id == arID

        ## Remove
        response = self.app.post(
            url(controller='library', action='removeFromLibrary'),
            params={
                'objectID': arID,
                'objectType': 'artifactRevision',
            },
            headers={'Cookie': self.getLoginCookie(self.userID)}
        )
        assert '"status": 0' in response, "Failed to remove artifact from library"

        objects = api.getLibraryArtifactRevisions(memberID=self.userID)
        assert len(objects) == 0

    def test_addRemoveObjectsToLibrary(self):
        books = api.getArtifacts(typeName=bookType, pageNum=1, pageSize=2)
        assert books
        arIDs = []
        for book in books:
            arIDs.append(book.revisions[0].id)
        print "arIDs: ", arIDs

        mappings = [ 
                { 'objectID': arIDs[0], 'objectType': 'artifactRevision', 'labels': ['abc', 'def', 'xyz'], 'systemLabels': ['mathematics', 'science']},
                { 'objectID': arIDs[1], 'objectType': 'artifactRevision', 'labels': ['bcd', 'efg', 'yza'], 'systemLabels': ['others']},
                ]
        response = self.app.post(
            url(controller='library', action='addToLibraryMulti'),
            params={
                'mappings': json.dumps(mappings),
                },
            headers={'Cookie': self.getLoginCookie(self.userID)}
        )
        assert '"status": 0' in response, "Failed to add artifacts to library"

        objects = api.getLibraryArtifactRevisions(memberID=self.userID)
        assert objects and len(objects) == 2
        if objects[0].artifactRevisionID != arIDs[0]:
            objects.reverse()

        print objects[0].labels
        assert len(objects[0].labels) == 5
        for lbl in objects[0].labels:
            assert lbl.labelName.lower() in ['abc', 'def', 'xyz', 'mathematics', 'science'], "Failed to find label"

        print objects[1].labels
        assert len(objects[1].labels) == 4
        for lbl in objects[1].labels:
            assert lbl.labelName.lower() in ['bcd', 'efg', 'yza', 'others'], "Failed to find label"

        ## Remove
        response = self.app.post(
            url(controller='library', action='removeFromLibrary'),
            params={
                'objectID': arIDs[1],
                'objectType': 'artifactRevision',
            },
            headers={'Cookie': self.getLoginCookie(self.userID)}
        )
        assert '"status": 0' in response, "Failed to remove artifact from library"

        mappings = [ 
                { 'objectID': arIDs[0], 'objectType': 'artifactRevision', 'labels': ['pqr'], 'systemLabels': ['mathematics']},
                ]
        response = self.app.post(
            url(controller='library', action='addToLibraryMulti'),
            params={
                'mappings': json.dumps(mappings),
                },
            headers={'Cookie': self.getLoginCookie(self.userID)}
        )
        assert '"status": 0' in response, "Failed to add artifacts to library"

        objects = api.getLibraryArtifactRevisions(memberID=self.userID)
        assert objects
        assert objects[0].artifactRevision.id == arIDs[0]

        assert len(objects[0].labels) == 2
        for lbl in objects[0].labels:
            assert lbl.labelName.lower() in ['pqr', 'mathematics'], "Failed to find label"

        ## Remove
        response = self.app.post(
            url(controller='library', action='removeFromLibrary'),
            params={
                'objectID': arIDs[0],
                'objectType': 'artifactRevision',
            },
            headers={'Cookie': self.getLoginCookie(self.userID)}
        )
        assert '"status": 0' in response, "Failed to remove artifact from library"

        objects = api.getLibraryArtifactRevisions(memberID=self.userID)
        assert len(objects) == 0

    def test_addRemoveObjectToLibraryWithLabels(self):
        books = api.getArtifacts(typeName=bookType, pageNum=1, pageSize=1)
        assert books[0]
        arID = books[0].revisions[0].id

        response = self.app.post(
            url(controller='library', action='addToLibrary'),
            params={
                'objectID': arID, 
                'objectType': 'artifactRevision',
                'labels': 'myrevs, added today',
                },
            headers={'Cookie': self.getLoginCookie(self.userID)}
        )
        assert '"status": 0' in response, "Failed to add artifact to library"

        print "Getting objects"
        objects = api.getLibraryArtifactRevisions(memberID=self.userID)
        assert objects
        assert objects[0].artifactRevision.id == arID
        print objects[0].labels
        assert len(objects[0].labels) == 2
        for lbl in objects[0].labels:
            assert lbl.labelName in ['myrevs', 'added today'], "Failed to find label"

        ## Remove
        response = self.app.post(
            url(controller='library', action='removeFromLibrary'),
            params={
                'objectID': arID,
                'objectType': 'artifactRevision',
            },
            headers={'Cookie': self.getLoginCookie(self.userID)}
        )
        assert '"status": 0' in response, "Failed to remove artifact from library"

        objects = api.getLibraryArtifactRevisions(memberID=self.userID)
        assert len(objects) == 0

    def test_addRemoveLabelsToObjects(self):
        books = api.getArtifacts(typeName=bookType, pageNum=1, pageSize=1)
        assert books[0]
        arID = books[0].revisions[0].id

        response = self.app.post(
            url(controller='library', action='addToLibrary'),
            params={
                'objectID': arID, 
                'objectType': 'artifactRevision',
                },
            headers={'Cookie': self.getLoginCookie(self.userID)}
        )
        assert '"status": 0' in response, "Failed to add artifact to library"

        ## Create a user-defined label
        response = self.app.post(
                url(controller='library', action='addMemberLabel'),
                params={
                    'label': 'tagged by me',
                    'systemLabel': False
                },
                headers = {'Cookie': self.getLoginCookie(self.userID)}
        )
        assert '"status": 0' in response, "Failed to create a user defined label"

        label = api.getMemberLabelByName(memberID=self.userID, label='tagged by me')
        assert label and label.label == 'tagged by me'

        response = self.app.post(
                url(controller='library', action='assignLabelToObjects'),
                params={
                    'objectIDs': arID,
                    'objectTypes': 'artifactRevision',
                    'label': 'tagged by me',
                    'systemLabel': 'false',
                },
                headers = {'Cookie': self.getLoginCookie(self.userID)}
        )
        assert '"status": 0' in response, "Failed to assign label to library object"

        objects = api.getLibraryArtifactRevisions(memberID=self.userID)
        assert objects
        assert objects[0].artifactRevision.id == arID
        assert objects[0].labels[0].labelName == 'tagged by me'

        ## Move objects to a different label
        response = self.app.post(
                url(controller='library', action='changeLabelForObjects'),
                params={
                    'objectIDs': '%d' % arID,
                    'objectTypes': 'artifactRevision',
                    'oldLabel': 'tagged by me',
                    'newLabel': 'tagged by me2',
                    'systemLabel': 'false',
                },
                headers = {'Cookie': self.getLoginCookie(self.userID)}
        )
        assert '"status": 0' in response, "Failed to change label for library object"

        objects = api.getLibraryArtifactRevisions(memberID=self.userID)
        assert objects
        assert objects[0].artifactRevision.id == arID
        assert objects[0].labels[0].labelName == 'tagged by me2'

        ## Remove label
        response = self.app.post(
                url(controller='library', action='removeLabelFromObjects'),
                params={
                    'objectIDs': '%d' % arID,
                    'objectTypes': 'artifactRevision',
                    'label': 'tagged by me2',
                    'systemLabel': 'false',
                },
                headers = {'Cookie': self.getLoginCookie(self.userID)}
        )
        assert '"status": 0' in response, "Failed to remove label to library object"

        objects = api.getLibraryArtifactRevisions(memberID=self.userID)
        assert objects
        assert objects[0].artifactRevision.id == arID
        print objects[0].artifactRevision.id, objects[0].labels
        assert len(objects[0].labels) == 0, "Failed to remove label"

        ## Delete the user defined label
        response = self.app.post(
                url(controller='library', action='deleteMemberLabel'),
                params={
                    'label': 'tagged by me',
                    'systemLabel': False
                },
                headers = {'Cookie': self.getLoginCookie(self.userID)}
        )
        assert '"status": 0' in response, "Failed to delete a user defined label"

        label = api.getMemberLabelByName(memberID=self.userID, label='tagged by me')
        assert label is None, "Label was not deleted"

        ## Remove object from library
        response = self.app.post(
            url(controller='library', action='removeFromLibrary'),
            params={
                'objectID': arID,
                'objectType': 'artifactRevision',
            },
            headers={'Cookie': self.getLoginCookie(self.userID)}
        )
        assert '"status": 0' in response, "Failed to remove artifact from library"

        objects = api.getLibraryArtifactRevisions(memberID=self.userID)
        assert len(objects) == 0

    def test_addRemoveSystemLabel(self):
        ## Try system label as non-admin - should fail
        response = self.app.post(
                url(controller='library', action='addMemberLabel'),
                params={
                    'label': 'system1',
                    'systemLabel': 'true',
                },
                headers = {'Cookie': self.getLoginCookie(self.userID)}
        )
        assert '"status": 0' not in response, "Unexpected success in creating system label"

        ## Try system label as admin - should work
        response = self.app.post(
                url(controller='library', action='addMemberLabel'),
                params={
                    'label': 'system1',
                    'systemLabel': 'true',
                },
                headers = {'Cookie': self.getLoginCookie(1)}
        )
        assert '"status": 0' in response, "Failed to create system label as admin"

        label = api.getSystemLabelByName(label='system1')
        assert label and label.label == 'system1'
        assert label.memberID is None

        ## Delete the system defined label - as non-admin - should fail
        response = self.app.post(
                url(controller='library', action='deleteMemberLabel'),
                params={
                    'label': 'system1',
                    'systemLabel': True
                },
                headers = {'Cookie': self.getLoginCookie(self.userID)}
        )
        assert '"status": 0' not in response, "Unexpectedly deleted a system defined label as non-admin"

        ## Delete the system defined label - as admin - should work
        response = self.app.post(
                url(controller='library', action='deleteMemberLabel'),
                params={
                    'label': 'system1',
                    'systemLabel': True
                },
                headers = {'Cookie': self.getLoginCookie(1)}
        )
        assert '"status": 0' in response, "Failed to delete a system label as admin"

        label = api.getSystemLabelByName(label='system1')
        assert label is None

    def test_getMyArtifactInfo(self):
        books = api.getArtifacts(typeName=bookType)
        assert books
        revIDs = []

        for i in range(0, len(books)):
            book = books[i]
            revIDs.append(book.revisions[0].id)

        for i in range(0, len(revIDs)):
            response = self.app.post(
                url(controller='library', action='addToLibrary'),
                params={
                    'objectID': revIDs[i],
                    'objectType': 'artifactRevision',
                    'labels': 'mylbl_%d' % i,
                    },
                headers={'Cookie': self.getLoginCookie(self.userID)}
            )
            assert '"status": 0' in response, "Failed to add artifact to library"

        response = self.app.get(
                url(controller='library', action='getMyArtifactInfo', types='book', labels='mylbl_1,mylbl_2'),
                params={
                    'pageNum': 1,
                    'pageSize': 2
                },
                headers={'Cookie': self.getLoginCookie(self.userID)}
            )
        assert '"status": 0' in response, "Failed to get library artifacts"
        j = json.loads(response.normal_body)
        print len(j['response']['artifacts'])
        print j['response']['labels']
        assert len(j['response']['artifacts']) == 2
        for l in j['response']['labels'].keys():
            for id in j['response']['labels'][l]:
                assert j['response']['artifacts'][id]
                assert j['response']['artifacts'][id]['revisions'][0]['labels'][0]['label'] == l

        ## Test query without labels
        response = self.app.get(
                url(controller='library', action='getMyArtifactInfo', types='book'),
                headers={'Cookie': self.getLoginCookie(self.userID)}
            )
        assert '"status": 0' in response, "Failed to get library artifacts"
        j = json.loads(response.normal_body)
        assert j['response']['labels'] is not None and len(j['response']['labels'].keys())
        for a in j['response']['artifacts']:
            assert a['revisions'][0].has_key('labels')

        ## Test query for owned artifacts
        response = self.app.get(
                url(controller='library', action='getMyArtifactInfo', types='book'),
                params={'ownership': 'owned'},
                headers={'Cookie': self.getLoginCookie(self.userID)}
            )
        assert '"status": 0' in response, "Failed to get library artifacts"

        ## Test query for owned artifacts
        response = self.app.get(
                url(controller='library', action='getMyArtifactInfo', types='book'),
                params={'ownership': 'all'},
                headers={'Cookie': self.getLoginCookie(self.userID)}
            )
        assert '"status": 0' in response, "Failed to get library artifacts"

        ## Test query for bookmarked artifacts
        response = self.app.get(
                url(controller='library', action='getMyArtifactInfo', types='book'),
                params={'ownership': 'bookmarks'},
                headers={'Cookie': self.getLoginCookie(self.userID)}
            )
        assert '"status": 0' in response, "Failed to get library artifacts"

        ## Test query for invalid value of ownership
        response = self.app.get(
                url(controller='library', action='getMyArtifactInfo', types='book'),
                params={'ownership': 'others'},
                headers={'Cookie': self.getLoginCookie(self.userID)}
            )
        assert '"status": 0' not in response, "Unexpected success"

        ## Remove object from library
        for revID in revIDs:
            response = self.app.post(
                url(controller='library', action='removeFromLibrary'),
                params={
                    'objectID': revID,
                    'objectType': 'artifactRevision',
                },
                headers={'Cookie': self.getLoginCookie(self.userID)}
            )
            assert '"status": 0' in response, "Failed to remove artifact from library"

    def test_getMyArtifactInfoWithGrades(self):
        chapters = api.getArtifacts(typeName=chapterType)
        assert chapters
        revIDs = []

        for i in range(0, len(chapters)):
            revIDs.append(chapters[i].revisions[0].id)

        for i in range(0, len(revIDs)):
            response = self.app.post(
                url(controller='library', action='addToLibrary'),
                params={
                    'objectID': revIDs[i],
                    'objectType': 'artifactRevision',
                    'labels': 'mylbl_%d' % i,
                    },
                headers={'Cookie': self.getLoginCookie(self.userID)}
            )
            assert '"status": 0' in response, "Failed to add artifact to library"

        response = self.app.get(
                url(controller='library', action='getMyArtifactInfo', types='chapter', labels='mylbl_1,mylbl_2,mylbl_3,mylbl_4'),
                params={
                    'pageNum': 1,
                    'pageSize': 10,
                    'grades': '9,10',
                },
                headers={'Cookie': self.getLoginCookie(self.userID)}
            )
        assert '"status": 0' in response, "Failed to get library artifacts"
        j = json.loads(response.normal_body)
        assert len(j['response']['artifacts']) > 0
        for l in j['response']['labels'].keys():
            for id in j['response']['labels'][l]:
                assert j['response']['artifacts'][id]
                assert j['response']['artifacts'][id]['revisions'][0]['labels'][0]['label'] == l
                artifactID = j['response']['artifacts'][id]['id']
                artifact = api.getArtifactByID(id=artifactID)
                assert artifact
                gradeDict = artifact.getGradeLevelGrid()
                print gradeDict
                found = False
                for grdID, grd in gradeDict:
                    if grd == '9' or grd == '10':
                        found = True
                        break
                assert found

        ## Test query without labels
        response = self.app.get(
                url(controller='library', action='getMyArtifactInfo', types='chapter'),
                params={
                    'grades': '9,10',
                },
                headers={'Cookie': self.getLoginCookie(self.userID)}
            )
        j = json.loads(response.normal_body)
        assert j['responseHeader']['status'] == 0, "Failed to get library artifacts"
        assert j['response']['labels'] is not None and len(j['response']['labels'].keys())
        for a in j['response']['artifacts']:
            assert a['revisions'][0].has_key('labels')

        ## Remove object from library
        for revID in revIDs:
            response = self.app.post(
                url(controller='library', action='removeFromLibrary'),
                params={
                    'objectID': revID,
                    'objectType': 'artifactRevision',
                },
                headers={'Cookie': self.getLoginCookie(self.userID)}
            )
            assert '"status": 0' in response, "Failed to remove artifact from library"

    def test_getLabels(self):
        ## Create a user-defined label
        for i in range(0, 10):
            response = self.app.post(
                    url(controller='library', action='addMemberLabel'),
                    params={
                        'label': 'mylabel_%d' % i,
                        'systemLabel': False
                    },
                    headers = {'Cookie': self.getLoginCookie(self.userID)}
            )
            assert '"status": 0' in response, "Failed to create a user defined label"

        ## Get only user labels
        response = self.app.get(
                url(controller='library', action='getLabels', includeSystem='false'),
                params={
                    'pageNum': 1,
                    'pageSize': 5,
                },
                headers={'Cookie': self.getLoginCookie(self.userID)}
            )
        assert '"status": 0' in response, "Failed to get member labels"
        j = json.loads(response.normal_body)
        assert j['response']['limit'] == 5
        for l in j['response']['labels']:
            assert l['systemLabel'] == 0
            assert l['member'] == self.userLogin

        ## Get system labels as well
        response = self.app.get(
                url(controller='library', action='getLabels', includeSystem='true'),
                params={
                    'pageNum': 1,
                    'pageSize': 20,
                },
                headers={'Cookie': self.getLoginCookie(self.userID)}
            )
        assert '"status": 0' in response, "Failed to get member labels"
        j = json.loads(response.normal_body)
        assert j['response']['limit'] <= j['response']['total']
        for l in j['response']['labels']:
            if l['systemLabel'] == 0:
                assert l['member'] == self.userLogin
            else:
                assert l['member'] is None

        ## Update all labels
        for i in range(0, 10):
            response = self.app.post(
                    url(controller='library', action='updateMemberLabel'),
                    params={
                        'label': 'mylabel_%d' % i,
                        'newLabel': 'myrenamedlabel_%d' % i,
                        'systemLabel': False
                    },
                    headers = {'Cookie': self.getLoginCookie(self.userID)}
            )
            assert '"status": 0' in response, "Failed to rename a user defined label"

        ## Get only user labels
        response = self.app.get(
                url(controller='library', action='getLabels', includeSystem='false'),
                params={
                    'pageNum': 1,
                    'pageSize': 5,
                },
                headers={'Cookie': self.getLoginCookie(self.userID)}
            )
        assert '"status": 0' in response, "Failed to get member labels"
        j = json.loads(response.normal_body)
        assert j['response']['limit'] == 5
        for l in j['response']['labels']:
            assert l['systemLabel'] == 0
            assert l['member'] == self.userLogin
            if 'my' in l['label']:
                assert 'myrenamedlabel' in l['label']

        ## Delete all labels
        for i in range(0, 10):
            response = self.app.post(
                    url(controller='library', action='deleteMemberLabel'),
                    params={
                        'label': 'myrenamedlabel_%d' % i,
                        'systemLabel': False
                    },
                    headers = {'Cookie': self.getLoginCookie(self.userID)}
            )
            assert '"status": 0' in response, "Failed to delete a user defined label"

    def test_getMyResourceInfo(self):
        file = open(os.path.join(os.path.dirname(__file__), "..", 'data', 'test.docx'), 'rb')
        contents = file.read()
        file.close()
        files = [('resourcePath', 'test.docx', contents)]
        parameters = { 'resourceType': 'lessonplan',
                'resourceName': 'test.docx',
                'resourceDesc': 'Lesson plan test documents',
                'resourceAuthors': 'Nimish P',
                'resourceLicense': 'Creative Commons by NC SA',
                'isAttachment': 'true',
                }
        response = self.app.post(url(controller='resource', action='createResource'), upload_files=files, params=parameters, headers={'Cookie': self.getLoginCookie(self.userID)})
        assert '"status": 0' in response, "Failed to create attachment."
        js = json.loads(response.normal_body)
        r1 = js['response']['resourceRevisionID']

        file = open(os.path.join(os.path.dirname(__file__), "..", 'data', 'xdt.png'), 'rb')
        contents = file.read()
        file.close()
        files = [('resourcePath', 'xdt.png', contents)]
        parameters = { 'resourceType': 'image',
                'resourceName': 'xdt.png',
                'resourceDesc': 'XDT Arch Image',
                'resourceAuthors': 'Nimish P',
                'resourceLicense': 'Creative Commons by NC SA',
                'isAttachment': 'true',
                }
        response = self.app.post(url(controller='resource', action='createResource'), upload_files=files, params=parameters, headers={'Cookie': self.getLoginCookie(self.userID)})
        assert '"status": 0' in response, "Failed to create attachment."
        js = json.loads(response.normal_body)
        r2 = js['response']['resourceRevisionID']
        revIDs = [ r1, r2 ]
        print "revIDs", revIDs

        for i in range(0, len(revIDs)):
            response = self.app.post(
                url(controller='library', action='addToLibrary'),
                params={
                    'objectID': revIDs[i],
                    'objectType': 'resourceRevision',
                    'labels': 'my_res_lbl_%d' % i,
                    },
                headers={'Cookie': self.getLoginCookie(self.userID)}
            )
            assert '"status": 0' in response, "Failed to add resource to library"

        response = self.app.get(
                url(controller='library', action='getMyResourceInfo', types='resource', labels='my_res_lbl_0'),
                params={
                    'pageNum': 1,
                    'pageSize': 2
                },
                headers={'Cookie': self.getLoginCookie(self.userID)}
            )
        assert '"status": 0' in response, "Failed to get library resources"
        j = json.loads(response.normal_body)
        print len(j['response']['resources'])
        print j['response']['labels']
        assert len(j['response']['resources']) == 1
        for l in j['response']['labels'].keys():
            for id in j['response']['labels'][l]:
                assert j['response']['resources'][id]
                assert j['response']['resources'][id]['revisions'][0]['labels'][0]['label'] == l

        ## Test query without labels
        response = self.app.get(
                url(controller='library', action='getMyResourceInfo', types='resource'),
                headers={'Cookie': self.getLoginCookie(self.userID)}
            )
        assert '"status": 0' in response, "Failed to get library resources"
        j = json.loads(response.normal_body)
        assert j['response']['labels'] is not None and len(j['response']['labels'].keys())
        for a in j['response']['resources']:
            assert a['revisions'][0].has_key('labels')

        ## Test query for owned resources
        response = self.app.get(
                url(controller='library', action='getMyResourceInfo', types='resource'),
                params={'ownership': 'owned'},
                headers={'Cookie': self.getLoginCookie(self.userID)}
            )
        assert '"status": 0' in response, "Failed to get library resources"

        ## Test query for owned resources
        response = self.app.get(
                url(controller='library', action='getMyResourceInfo', types='resource'),
                params={'ownership': 'all'},
                headers={'Cookie': self.getLoginCookie(self.userID)}
            )
        assert '"status": 0' in response, "Failed to get library resources"

        ## Test query for bookmarked resources
        response = self.app.get(
                url(controller='library', action='getMyResourceInfo', types='resource'),
                params={'ownership': 'bookmarks'},
                headers={'Cookie': self.getLoginCookie(self.userID)}
            )
        assert '"status": 0' in response, "Failed to get library resource"

        ## Test query for invalid value of ownership
        response = self.app.get(
                url(controller='library', action='getMyResourceInfo', types='resource'),
                params={'ownership': 'others'},
                headers={'Cookie': self.getLoginCookie(self.userID)}
            )
        assert '"status": 0' not in response, "Unexpected success"

        ## Remove object from library
        for revID in revIDs:
            response = self.app.post(
                url(controller='library', action='removeFromLibrary'),
                params={
                    'objectID': revID,
                    'objectType': 'resourceRevision',
                },
                headers={'Cookie': self.getLoginCookie(self.userID)}
            )
            assert '"status": 0' not in response, "Should not remove own resource from library"


