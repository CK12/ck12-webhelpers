from flx.tests import *
from flx.model import meta
from flx.model import api
import re
import os
import logging
import json
import time

log = logging.getLogger(__name__)
INDEX_CREATED = False

class TestBrowseTermController(TestController):

    def _createIndex(self):
        global INDEX_CREATED
        if INDEX_CREATED:
            return

        ids = range(222, 234)
        print "Creating index for ids: %s" % ids
        artifactIDs = ""
        for id in ids:
            if artifactIDs:
                artifactIDs += ","
            artifactIDs += str(id)
        response = self.app.post(url(controller='search', action='reindex'), params = { 'artifactIDs': artifactIDs}, headers={'Cookie': self.getLoginCookie(1)})
        jr = json.loads(response.normal_body)
        taskId = jr['response']['taskID']
        if taskId:
            self.__waitForTask(taskId)
            INDEX_CREATED = True
            time.sleep(1)
        else:
            raise Exception("Unable to reindex artifacts")

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

    def test_get(self):
        response = self.app.get(url(controller='browseTerm', action='get', id='newton'))
        assert "Newton" in response
        assert "domain" in response

    def test_getAncestors(self):
        response = self.app.get(url(controller='browseTerm', action='getAncestors', id='newton'))
        assert 'physics' in response
        response = self.app.get(url(controller='browseTerm', action='getAncestors', id='oxygen'))
        assert 'biology' in response

    def test_getSynonyms(self):
        response = self.app.get(url(controller='browseTerm', action='getSynonyms', id='five'))
        assert '"v"' in response
        assert '"5"' in response
        assert '"five"' not in response
        response = self.app.get(url(controller='browseTerm', action='getSynonyms', id=12, forceID=1))
        assert '"iv"' in response

    def test_getNeighbor(self):
        neighbors = api.createDomainNeighbor(domainID=6,
                                             requiredDomainIDs=[4, 5])
        assert neighbors is not None
        neighbors = api.createDomainNeighbor(domainID=5,
                                             requiredDomainIDs=[3, 4])
        assert neighbors is not None
        neighbors = api.createDomainNeighbor(domainID=4,
                                             requiredDomainIDs=[2, 3])
        assert neighbors is not None
        neighbors = api.createDomainNeighbor(domainID=3,
                                             requiredDomainIDs=[2])
        assert neighbors is not None
        response = self.app.get(
                    url(controller='browseTerm',
                        action='getNeighbor',
                        id=4))
        assert '"status": 0' in response, "Failed get domain neighbors"
        assert 'ERROR:' not in response, "Error getting domain neighbors"
        api.deleteDomainNeighbor(domainID=6, requiredDomainID=5)
        api.deleteDomainNeighbor(domainID=5)
        api.deleteDomainNeighbor(domainID=4)
        api.deleteDomainNeighbors(domainNeighbors=neighbors)

    def test_createSynonym(self):
        response = self.app.post(url(controller='browseTerm', action='createSynonym'), params = {
            'termID': 9,
            'synonymTermID': 11
            },
            headers={'Cookie': self.getLoginCookie(1)} ## Fake login
        )
        assert '"status": 1015' not in response, "Failed to create synonym: %s" % response.normal_body
        synId = None
        pattern = re.compile(r'"id": ([0-9]*),')
        m = pattern.search(response.normal_body)
        if m:
            synId = m.group(1)
            assert synId != '' and synId is not None, "Could not get ID of the new synonym record."
        response = self.app.get(url(controller='browseTerm', action='getSynonyms', id=9, forceID=1))
        assert '"three"' in response
        if synId:
            api.deleteBrowseTermSynonymByID(id=synId)

    def test_loadBrowseTermsFromCSV(self):
        file = open(os.path.join(os.path.dirname(__file__), "..", 'data', 'browseTermsTest.csv'), 'rb')
        contents = file.read()
        file.close()
        files = [('file', 'browseTermsTest.csv', contents)]
        response = self.app.post(url(controller='browseTerm', action='loadDataFromCSV'), upload_files=files, headers={'Cookie': self.getLoginCookie(1)})
        assert '"status": 1016' not in response, "Failed to upload browse term data."
        j = json.loads(response.normal_body)
        taskId = j['response']['taskID']
        self.__waitForTask(taskId)

        artifact = api.getArtifactByID(id=1)
        for bt in artifact.browseTerms:
            print bt.type.name, bt.name
            if bt.type.name == 'subject':
                assert bt.name.lower() in ['physics', 'test term', 'ca']

        file = open(os.path.join(os.path.dirname(__file__), "..", 'data', 'browseTermsRemoveTest.csv'), 'rb')
        contents = file.read()
        file.close()
        files = [('file', 'browseTermsTest.csv', contents)]
        response = self.app.post(url(controller='browseTerm', action='loadDataFromCSV'), 
                params={'waitFor': 'true'}, upload_files=files, headers={'Cookie': self.getLoginCookie(1)})
        assert '"status": 1016' not in response, "Failed to upload browse term data."
        j = json.loads(response.normal_body)
        assert j['response']['messages']
        assert j['response']['errors'] == 0

        artifact = api.getArtifactByID(id=1)
        for bt in artifact.browseTerms:
            print bt.type.name, bt.name
            if bt.type.name == 'subject':
                assert bt.name.lower() not in ['physics', 'test term', 'ca']

        data = [ 
                {'artifactID': 1, 'browseTerm': 'physics', 'browseTermType': 'subject', 'action': 'add'},
                {'artifactID': 1, 'browseTerm': 'ca', 'browseTermType': 'state', 'action': 'add'},
                {'artifactID': 1, 'browseTerm': "Test Term Parent", 'browseTermType': "domain", 'encodedID': "CKT.S.PHY.100.1"},
                {'artifactID': 1, 'browseTerm': "Test Term Child", 'browseTermType': "domain", 'browseTermParent': "Test Term Parent", 'encodedID': "CKT.S.PHY.100.1.10", 'action': 'add'},
                {'artifactID': 1, 'browseTerm': 'ca', 'browseTermType': 'state', 'action': 'remove'},
               ]
                
        response = self.app.post(url(controller='browseTerm', action='loadDataFromCSV'), 
                params={'waitFor': 'true', 'data': json.dumps(data)}, headers={'Cookie': self.getLoginCookie(1)})
        assert '"status": 0' in response, "Failed to upload browse term data."
        j = json.loads(response.normal_body)
        assert j['response']['messages']
        assert j['response']['errors'] == 0

        artifact = api.getArtifactByID(id=1)
        for bt in artifact.browseTerms:
            print "Last", bt.type.name, bt.name
        for bt in artifact.browseTerms:
            if bt.type.name == 'subject':
                assert bt.name.lower() in ['physics', ]
            elif bt.type.name == 'domain':
                assert bt.name.lower() in ['test term parent', 'test term child'] and bt.encodedID in ['CKT.S.PHY.100.1', 'CKT.S.PHY.100.1.10']
            elif bt.type.name == 'state':
                assert bt.name.lower() not in ['ca']

    ## Disabled since we do not allow domain terms to be added to flx directly
    def _test_loadFoundationGridFromCSV(self):
        file = open(os.path.join(os.path.dirname(__file__), "..", 'data', 'encodedBrowseTermsTest.csv'), 'rb')
        contents = file.read()
        file.close()
        files = [('file', 'browseTermsTest.csv', contents)]
        response = self.app.post(url(controller='browseTerm', action='loadFoundationGridFromCSV'), upload_files=files, headers={'Cookie': self.getLoginCookie(1)})
        print response
        assert '"status": 1016' not in response, "Failed to upload foundation grid data."
        assert "ERROR:" not in response, "Failed to process one or more rows in the CSV file."

    def test_getDescendants(self):
        response = self.app.get(url(controller='browseTerm', action='getDescendants', id='CKT'))
        assert '"status": 0' in response, "Error getting root level browseTerms"
        j = json.loads(response.normal_body)
        assert j['response']['total'] > 0, "Got 0 root level categories"
        assert j['response']['term']['children'], "Got category with no children"

        response = self.app.get(url(controller='browseTerm', action='getDescendants', id='mathematics', levels=3), params={'pageSize': 1, 'pageNum': 1})
        assert '"status": 0' in response, "Error getting children for mathematics"
        j = json.loads(response.normal_body)
        assert j['response']['term']['children']
        assert j['response']['term']['artifactCount'], "Could not get artifactCount or artifactCount=0"
        assert not j['response']['term']['descendantArtifactCount'], "Unexpected descendantArtifactCount or descendantArtifactCount != 0"
        assert j['response']['term'].has_key('modalityCount') and j['response']['term'].has_key('descendantModalityCount'), "Could not get the key modalityCount and descendantModalityCount"
        for child in j['response']['term']['children']:
            assert child['children'], "Second level children list empty"

    def test_getDescendantsWithLevel0(self):
        ## Bug 4624
        response = self.app.get(url(controller='browseTerm', action='getDescendants', id='mat.ari', levels=0), params={'pageSize': 1, 'pageNum': 1})
        assert '"status": 0' in response, "Error getting children for arithmetic"
        j = json.loads(response.normal_body)
        assert j['response']['term']['children'] and type(j['response']['term']['children']).__name__ != 'list', "Returned list instead of number in children field."

    def test_browseArtifactsByCategory(self):
        self._createIndex()

        response = self.app.get(url(controller='browseTerm', action='browseArtifacts', id='MAT.ARI'), params={'pageSize': 1, 'pageNum': 1})
        assert '"status": 0' in response, "Error getting artifacts for arithmetic"
        j = json.loads(response.normal_body)
        assert j['response']['total'] > 0, "0 artifacts returned for arithmetic"
        total = j['response']['total']

        response = self.app.get(url(controller='browseTerm', action='browseArtifacts', id='MAT.ARI', all='all'), params={'pageSize': 1, 'pageNum': 1})
        assert '"status": 0' in response, "Error getting all artifacts for arithmetic"
        j = json.loads(response.normal_body)
        assert j['response']['total'] > 0, "0 artifacts returned for arithmetic (asked for all)"
        assert j['response']['total'] >= total, "Got less number of artifacts for 'all' than just 'arithmetic'"

        response = self.app.get(url(controller='browseTerm', action='browseArtifacts', id='mendel', all='all'), params={'pageSize': 1, 'pageNum': 1})
        assert '"status": 0' not in response, "Got successful response when expecting error"
        j = json.loads(response.normal_body)
        assert 'not a valid domain' in j['response']['message'].lower(), "Got unexpected error"

        response = self.app.get(url(controller='browseTerm', action='browseArtifacts', id='twelve', all='all'), params={'pageSize': 1, 'pageNum': 1})
        assert '"status": 0' not in response, "Got successful response when expecting error"
        j = json.loads(response.normal_body)
        assert 'no such domain term' in j['response']['message'].lower(), "Got unexpected error"

    def test_createDeleteAssociation(self):
        response = self.app.post(
                url(controller='browseTerm', action='createAssociation'), 
                params = {'artifactID': 1, 'browseTermID': 2},
                headers={'Cookie': self.getLoginCookie(1)})
        assert '"status": 0' in response, "Error creating artifact association"

        artifact = api.getArtifactByID(id=1)
        found = False
        for bt in artifact.browseTerms:
            if bt.id == 2:
                found = True
        assert found

        response = self.app.post(
                url(controller='browseTerm', action='deleteAssociation'),
                params = {'artifactID': 1, 'browseTermID': 2},
                headers={'Cookie': self.getLoginCookie(1)})
        assert '"status": 0' in response, "Error deleting artifact association"

        artifact = api.getArtifactByID(id=1)
        found = False
        for bt in artifact.browseTerms:
            if bt.id == 2:
                found = True
        assert not found


