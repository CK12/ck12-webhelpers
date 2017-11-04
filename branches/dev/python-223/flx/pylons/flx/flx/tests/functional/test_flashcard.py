from flx.tests import *
from flx.model import meta
from flx.model import api
from flx.model.vcs import vcs as v
import re
import os
import json
import logging

log = logging.getLogger(__name__)

bookType = 'book'
chapterType = 'chapter'
lessonType = 'lesson'
conceptType = 'concept'

INDEX_CREATED = False

class TestFlashcardController(TestController):

    def setUp(self):
        super(TestFlashcardController, self).setUp()
        session = meta.Session()

    def test_getDefinitions(self):
        pageNum = 1
        artifactDict = {}
        while True:
            artifacts = api.getArtifacts(typeName=chapterType, pageSize=64, pageNum=pageNum)
            if not artifacts:
                break
            for artifact in artifacts:
                artifactDict[artifact.getId()] = artifact.getTitle()
            pageNum += 1
        for id in artifactDict.keys():
            title = artifactDict[id]
            response = self.app.get(url(controller='flashcard', action='getDefinitions', type='chapter', id=id))
            assert response
            j = json.loads(response.normal_body)
            assert j['responseHeader']['status'] == 0, "Error getting definitions for %d" % id
            if len(j['response']['definitions']) > 0:
                print id, len(j['response']['definitions']), title
                for defn in j['response']['definitions']:
                    assert defn['term'] and defn['definition']

