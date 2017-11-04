# -*- coding: utf-8 -*-

from flx.tests import *
from flx.model import api
import json
import logging
import re
import copy
from datetime import datetime

log = logging.getLogger(__name__)

lessonType = 'lesson'

ID_REGEX = re.compile(r'<p id="([^"]*)"')
LESSON_ID = 253

class TestAnnoationsController(TestController):

    def test_annotations(self):
        userID = 1
        lesson = api.getArtifactByID(id=LESSON_ID)
        assert lesson and lesson.type.name == lessonType
        xhtml = lesson.getXhtml()
        m = ID_REGEX.search(xhtml)
        assert m
        id = m.group(1)
        assert id
        lessonID = lesson.id

        payload = {
                "memberID": userID,
                "ranges":[
                    {
                        "start":"/%s" % id,
                        "startOffset":1,
                        "end":"/%s" % id,
                        "endOffset":5
                    }
                ],
                "quote":"Here you'll learn what the Pythagorean",
                "highlightColor":"c5",
                "annotation_type":"highlight",
                "artifactID":"%d" % lessonID,
                "version":"v1.0",
                "revisionID":"%s" % lesson.revisions[0].id
                }
        response = self.app.post_json(
            url(controller='annotator', action='create'),
            payload,
            headers={'Cookie': self.getLoginCookie(userID)}
        )
        print response.normal_body
        rj = json.loads(response.normal_body)
        assert rj['artifactID'] == lessonID
        assert rj['memberID'] == userID
        assert rj['id']

        annotationID = rj['id']

        payload['id'] = annotationID
        payload['annotation_type'] = 'note'
        payload['text'] = 'Test note.'

        response = self.app.put_json(
                url(controller='annotator', action='multiPurpose', annotationID=annotationID),
                payload,
                headers={'Cookie': self.getLoginCookie(userID)})
        print response.normal_body
        rj = json.loads(response.normal_body)
        assert rj['response']['annotation_type'] == 'note'
        assert rj['response']['artifactID'] == lessonID
        assert rj['response']['memberID'] == userID
        assert rj['response']['id'] == annotationID
        assert rj['response']['text'] == 'Test note.'

        ## Search annotation
        response = self.app.get(
                url(controller='annotator', action='search'),
                params={'artifactID': lessonID},
                headers={'Cookie': self.getLoginCookie(userID)})
        print response.normal_body
        rj = json.loads(response.normal_body)
        assert rj['total'] == 1
        assert rj['rows'][0]['annotation_type'] == 'note'
        assert rj['rows'][0]['artifactID'] == lessonID
        assert rj['rows'][0]['memberID'] == userID

        response = self.app.get(
                url(controller='annotator', action='search'),
                params={'artifactID': lessonID},
                headers={'Cookie': self.getLoginCookie(3)})
        print response.normal_body
        rj = json.loads(response.normal_body)
        assert rj['total'] == 0

        ## Delete annotation
        response = self.app.delete_json(
                url(controller='annotator', action='multiPurpose', annotationID=annotationID),
                payload,
                headers={'Cookie': self.getLoginCookie(userID)})
        print response.normal_body
        rj = json.loads(response.normal_body)
        assert rj['responseHeader']['status'] == 0

    def test_derived_annotations(self):
        userID = 104
        lesson = api.getArtifactByID(id=LESSON_ID)
        assert lesson and lesson.type.name == lessonType
        xhtml = lesson.getXhtml()
        m = ID_REGEX.search(xhtml)
        assert m
        id = m.group(1)
        assert id
        lessonID = lesson.id
        lessonTitle = lesson.getTitle()

        payload = {
                "memberID": userID,
                "ranges":[
                    {
                        "start":"/%s" % id,
                        "startOffset":1,
                        "end":"/%s" % id,
                        "endOffset":5
                    }
                ],
                "quote":"Here you'll learn what the Pythagorean",
                "highlightColor":"c5",
                "annotation_type":"highlight",
                "artifactID":"%d" % lessonID,
                "version":"v1.0",
                "revisionID":"%s" % lesson.revisions[0].id
                }
        response = self.app.post_json(
            url(controller='annotator', action='create'),
            payload,
            headers={'Cookie': self.getLoginCookie(userID)}
        )
        print response.normal_body
        rj = json.loads(response.normal_body)
        assert rj['artifactID'] == lessonID
        assert rj['memberID'] == userID
        assert rj['id']

        annotationID = rj['id']

        response = self.app.post(
            url(controller='artifact', action='updateArtifact', id=lessonID, type=lessonType),
            params={'title': '%s-my-%s' % (lessonTitle, datetime.now()), 'summary': 'Newer summary', 'xhtml': xhtml},
            headers={'Cookie': self.getLoginCookie(userID)}
        )
        assert '"status": 0' in response, "Failed updating lesson artifact"
        print response.normal_body
        rj = json.loads(response.normal_body)
        assert rj['response']['lesson']['id']
        newLessonID = rj['response']['lesson']['id']

        ## Search annotation
        response = self.app.get(
                url(controller='annotator', action='search'),
                params={'artifactID': newLessonID},
                headers={'Cookie': self.getLoginCookie(userID)})
        print response.normal_body
        rj = json.loads(response.normal_body)
        assert rj['total'] == 1
        assert rj['rows'][0]['annotation_type'] == payload['annotation_type']
        assert rj['rows'][0]['artifactID'] == lessonID
        assert rj['rows'][0]['memberID'] == userID

        ## Create an annotation for new artifact
        newLesson = api.getArtifactByID(id=newLessonID)
        newPayload = copy.deepcopy(payload)
        newPayload['artifactID'] = newLessonID
        newPayload['revisionID'] = newLesson.revisions[0].id
        newPayload['quote'] = "learn what the Pythagorean"

        response = self.app.post_json(
            url(controller='annotator', action='create'),
            newPayload,
            headers={'Cookie': self.getLoginCookie(userID)}
        )
        print response.normal_body
        rj = json.loads(response.normal_body)
        assert rj['artifactID'] == newLessonID
        assert rj['memberID'] == userID
        assert rj['id']
        newAnnotationID = rj['id']

        ## Delete annotation
        response = self.app.delete_json(
                url(controller='annotator', action='multiPurpose', annotationID=annotationID),
                payload,
                headers={'Cookie': self.getLoginCookie(userID)})
        print response.normal_body
        rj = json.loads(response.normal_body)
        assert rj['responseHeader']['status'] == 0

        response = self.app.delete_json(
                url(controller='annotator', action='multiPurpose', annotationID=newAnnotationID),
                newPayload,
                headers={'Cookie': self.getLoginCookie(userID)})
        print response.normal_body
        rj = json.loads(response.normal_body)
        assert rj['responseHeader']['status'] == 0

    def test_migrated_annotations(self):
        userID = 104
        lesson = api.getArtifactByID(id=LESSON_ID)
        assert lesson and lesson.type.name == lessonType
        response = self.app.get(
                url(controller='annotator', action='getMigrated'),
                params={'artifactID': LESSON_ID, 'memberID': userID},
                headers={'Cookie': self.getLoginCookie(userID)})
        print response.normal_body
        assert '"status": 0' not in response 

        response = self.app.get(
                url(controller='annotator', action='getMigrated'),
                params={'artifactID': LESSON_ID, 'memberID': userID},
                headers={'Cookie': self.getLoginCookie(1)})
        print response.normal_body
        rj = json.loads(response.normal_body)
        assert rj.has_key('total')

    def test_popular_annotations(self):
        userID = 104
        lesson = api.getArtifactByID(id=LESSON_ID)
        assert lesson and lesson.type.name == lessonType
        response = self.app.get(
                url(controller='annotator', action='getPopularAnnotations'),
                params={'artifactID': LESSON_ID, 'memberID': userID},
                headers={'Cookie': self.getLoginCookie(userID)})
        print response.normal_body
        rj = json.loads(response.normal_body)
        assert rj.has_key('total')

