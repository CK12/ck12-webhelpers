# -*- coding: utf-8 -*-

from flx.tests import *
from flx.model import api
import json, base64
import logging

log = logging.getLogger(__name__)

bookType = 'book'
chapterType = 'chapter'
lessonType = 'lesson'
conceptType = 'concept'

INDEX_CREATED = False

class TestAssembleArtifactController(TestController):

    def test_crud(self):
        """
            Add a concept to new flexbook.
        """
        userID=1
        #
        #  Create new concept.
        #
        """
        params = {}
        artifact = {
                    'artifactRevisionID': 'new',
                    'title': 'test say concept 0',
                    'summary': '',
                    'authors': '{"author": ["Nachiket Karve"]}',
                    'artifactType': 'concept',
                    'domainEID': '',
                    'children': [],
                    'artifactID': 'new',
                    'xhtml': '<p>The contents of this test concept 0.</p>',
                   }
        params['artifact'] = json.dumps(artifact)
        response = self.app.post(
            url(controller='artifact', action='assembleArtifact'),
            params=params,
            headers={'Cookie': self.getLoginCookie(userID)}
        )
        print response
        assert '"status": 0' in response, "Failed creating concept artifact"
        j = json.loads(response.normal_body)
        id = j['response']['artifact']['artifactID']
        concept = api.getArtifactByID(id=id)
        assert concept
        conceptID = concept.id
        conceptRevID = concept.revisions[0].id
        #
        #  Create a new lesson for the concept.
        #
        params = {}
        artifact = {
                    "artifactRevisionID": "new",
                    "title": "test say lesson 0",
                    "summary": "",
                    "authors": '{"author": ["Nachiket Karve"]}',
                    "artifactType": "lesson",
                    "domainEID": "",
                    "children": [
                        {
                            "artifactRevisionID": conceptRevID,
                            "artifactType": "lesson",
                            "summary": "",
                            "children": [],
                            "title": "test say concept 0"
                        }
                    ],
                    "artifactID": "new"
                   }
        params['artifact'] = json.dumps(artifact)
        response = self.app.post(
            url(controller='artifact', action='assembleArtifact'),
            params=params,
            headers={'Cookie': self.getLoginCookie(userID)}
        )
        print response
        assert '"status": 0' in response, "Failed creating concept artifact"
        j = json.loads(response.normal_body)
        id = j['response']['artifact']['artifactID']
        lesson = api.getArtifactByID(id=id)
        assert lesson
        lessonID = lesson.id
        lessonRevID = lesson.revisions[0].id
        """
        #
        #  Create a new flexbook.
        #
        params = {}
        artifact = {
                    "artifactRevisionID": "new",
                    "title": "My New Book 0206",
                    "summary": "",
                    "authors": '{"author": ["Nachiket Karve"]}',
                    "artifactType": "book",
                    "domainEID": "",
                    "children": [
                        {
                            "artifactRevisionID": "new",
                            "artifactType": "chapter",
                            "summary": "Identify intersecting, parallel and perpendicular lines in a plane",
                            "children": [],
                            "title": "Parallel and Perpendicular Lines"
                        }
                    ],
                    "artifactID": "new"
                   }
        params['artifact'] = base64.b64encode(json.dumps(artifact))
        response = self.app.post(
            url(controller='artifact', action='assembleArtifact'),
            params=params,
            headers={'Cookie': self.getLoginCookie(userID)}
        )
        print response
        assert '"status": 0' in response, "Failed creating concept artifact"
        j = json.loads(response.normal_body)
        id = j['response']['artifact']['artifactID']
        book = api.getArtifactByID(id=id)
        assert book
        bookID = book.id
        bookRevID = book.revisions[0].id

        """
            Create a concept under a different user.
        """
        userID=3
        params = {
            'authors': 'Stephen AuYueng',
            'title': 'Test say concept 2',
            'summary': '',
            'cover image name': 'testImage',
            'cover image description': 'Image for artifact creation test',
            'cover image uri': 'http://www.google.com/images/errors/logo_sm.gif',
            'xhtml': base64.b64encode('<p>The contents of this test concept 2.</p>'),
        }
        response = self.app.get(
            url(controller='artifact', action='createArtifact', typeName=conceptType),
            params=params,
            headers={'Cookie': self.getLoginCookie(userID)}
        )
        assert '"status": 0' in response, "Unexpectedly created artifact"

        j = json.loads(response.normal_body)
        assert j['response'], "No info returned"
        id = j['response'][conceptType]['id']
        concept1 = api.getArtifactByID(id=id)
        assert concept1
        concept1ID = concept1.id
        concept1RevID = concept1.revisions[0].id

        #
        #  Add concept to existing flexbook.
        #
        userID=1
        artifact = {
                    'artifactRevisionID': bookRevID,
                    'title': 'test say book 1',
                    'summary': '',
                    'authors': '{"author": ["Stephen AuYeung"]}',
                    'artifactType': 'book',
                    'domainEID': '',
                    'children': [
                        {
                            'artifactRevisionID': concept1RevID,
                            'artifactType': 'lesson',
                            'title': 'Test say concept 2',
                            'children': []
                        }
                    ],
                    'artifactID': bookID,
                   }
        params['artifact'] = base64.b64encode(json.dumps(artifact))
        response = self.app.post(
            url(controller='artifact', action='assembleArtifact'),
            params=params,
            headers={'Cookie': self.getLoginCookie(userID)}
        )
        print response
        assert '"status": 0' in response, "Failed creating book artifact"

        j = json.loads(response.normal_body)
        id = j['response']['artifact']['artifactID']
        assert id == bookID
        book = api.getArtifactByID(id=id)
        assert book

        api.deleteArtifactByID(id=book.id, recursive=True)
        api.deleteArtifactByID(id=concept1ID, recursive=True)
