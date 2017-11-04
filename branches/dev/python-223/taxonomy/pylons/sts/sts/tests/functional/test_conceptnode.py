import os
import json
import logging
from urllib import quote

from sts.tests import *
from sts.model import api

import Cookie
import time
from cookielib import CookieJar 

log = logging.getLogger(__name__)

ADMIN_USER = {
         'id': 1,
         'login': 'testAdmin',
         'email': None,
         'name': 'Test Admin',
         'authType': 'ck-12',
         'sessionID': None,
         'timeout': 0
       }

class TestConceptNodeController(TestController):

    def test_getInfo(self):
        response = self.app.get(url(controller='conceptnode', action='getInfo', encodedID='mat.ari.110'))
        assert response
        assert '"status": 0' in response

        j = json.loads(response.normal_body)
        assert j['response']['encodedID'] == 'MAT.ARI.110'

        response = self.app.get(url(controller='conceptnode', action='getInfo', encodedID='MAT.ALG.100'))
        assert response
        assert '"status": 0' in response

        j = json.loads(response.normal_body)
        assert j['response']['encodedID'] == 'MAT.ALG.100'

    def __call_search(self, term, subject=None, branch=None, pageNum=0, pageSize=0):
        params = {'pageSize': pageSize, 'pageNum': pageNum}
        if subject:
            params['subjectID'] = subject
        if branch:
            params['branchID'] = branch
        response = self.app.get(url(controller='conceptnode', action='search', term=term), params=params)
        assert response
        assert '"status": 0' in response
        j = json.loads(response.normal_body)
        assert j['response']['offset'] == (pageNum-1) * pageSize
        assert j['response']['limit'] <= pageSize
        
        for node in j['response']['conceptNodes']:
            assert node['encodedID']
        return j

    def test_search(self):
        pageNum = 1
        while True:
            j = self.__call_search('addition', pageNum=pageNum, pageSize=5)
            if j['response']['limit'] == 0:
                break
            pageNum += 1
        
        pageNum = 1
        while True:
            j = self.__call_search('tion', subject='MAT', branch='ARI', pageNum=pageNum, pageSize=5)
            print "Total search results: %d, Limit: %d" % (j['response']['total'], j['response']['limit'])
            if j['response']['limit'] == 0:
                break
            pageNum += 1

    def test_loadConcepts(self):
        file = open(os.path.join(os.path.dirname(__file__), "..", 'data', 'conceptNodes.csv'), 'rb')
        contents = file.read()
        file.close()
        files = [('file', 'conceptNodes.csv', contents)]
        response = self.app.post(url(controller='conceptnode', action='loadConceptNodeData'), upload_files=files, headers={'Cookie': self.getCookiesHeaderVal()})        
        assert '"status": 0' in response, "Failed to upload foundation grid data."
        assert "ERROR:" not in response, "Failed to process one or more rows in the CSV file."

    def test_exportConceptsForSubjectAndBranch(self):
        response = self.app.get(url(controller='conceptnode', action='exportConceptNodeData', subjectID='MAT', branchID='ALG'), headers={'Cookie': self.getLoginCookie()})
        print response.headers
        assert response and response.headers.has_key('Content-Disposition')
        assert response.headers.get('Content-Type') == 'text/csv'
        assert response.headers.get('Content-Length') > '100'

    def test_exportConceptsForSubject(self):
        response = self.app.get(url(controller='conceptnode', action='exportConceptNodeData', subjectID='MAT'), headers={'Cookie': self.getLoginCookie()})
        print response.headers
        assert response and response.headers.has_key('Content-Disposition')
        assert response.headers.get('Content-Type') == 'text/csv'
        assert response.headers.get('Content-Length') > '100'

    def _verifyPrePost(self, nodes, family, parentEncodedID):
        for node in nodes:
            assert family in node['encodedID']
            assert node['encodedID'] != parentEncodedID
            if node.has_key('pre'):
                self._verifyPrePost(node['pre'], family, node['encodedID'])
            elif node.has_key('post'):
                self._verifyPrePost(node['post'], family, node['encodedID'])
            elif node.has_key('preCount'):
                node['preCount'] > 0
            else:
                node['postCount'] > 0
 
    def test_getPrereqs(self):
        response = self.app.get(url(controller='conceptnode', action='getPrerequisites', encodedID='MAT.ALG.200', levels=3), params={'pageNum': 1, 'pageSize': 10})
        assert '"status": 0' in response
        j = json.loads(response.normal_body)
        assert j['response']['total'] > 0 and j['response']['limit'] <= 10
        self._verifyPrePost(j['response']['pre'], 'MAT.ALG.', 'MAT.ALG.200')

    def test_getAdvanced(self):
        response = self.app.get(url(controller='conceptnode', action='getPostrequisites', encodedID='MAT.ALG.200'), params={'pageNum': 1, 'pageSize': 10})
        assert '"status": 0' in response
        j = json.loads(response.normal_body)
        assert j['response']['total'] > 0 and j['response']['limit'] <= 10
        self._verifyPrePost(j['response']['post'], 'MAT.ALG.', 'MAT.ALG.200')

    def test_getConceptNodes(self):
        response = self.app.get(url(controller='conceptnode', action='getConceptNodes', subjectID='MAT', branchID='ALG'), params={'pageNum': 1, 'pageSize': 10})
        assert '"status": 0' in response
        j = json.loads(response.normal_body)
        assert j['response']['total'] > 0 and j['response']['limit'] <= 10
        for node in j['response']['conceptNodes']:
                assert 'MAT.ALG.' in node['encodedID']

        response = self.app.get(url(controller='conceptnode', action='getConceptNodes', subjectID='MAT', branchID='ALG', toplevel='top'), params={'pageNum': 1, 'pageSize': 10})
        assert '"status": 0' in response
        j = json.loads(response.normal_body)
        assert j['response']['total'] > 0 and j['response']['limit'] <= 10
        for node in j['response']['conceptNodes']:
                assert 'MAT.ALG.' in node['encodedID']
                assert node['parent'] is None

    def test_getNext(self):
        encodedID = 'MAT.ARI.100'
        for i in range(1,10):
            response = self.app.get(url(controller='conceptnode', action='getNextInfo', encodedID='MAT.ARI.100'), params={'pageNum': i, 'pageSize': 5})
            assert '"status": 0' in response
            j = json.loads(response.normal_body)
            
            for node in j['response']['conceptNodes']:
                assert node['encodedID'] > encodedID
                encodedID = node['encodedID']

    def test_getPrevious(self):
        encodedID = 'MAT.ARI.740'
        for i in range(1,10):
            response = self.app.get(url(controller='conceptnode', action='getPreviousInfo', encodedID='MAT.ARI.740'), params={'pageNum': i, 'pageSize': 5})
            assert '"status": 0' in response
            j = json.loads(response.normal_body)
            for node in j['response']['conceptNodes']:
                assert node['encodedID'] < encodedID
                encodedID = node['encodedID']

    def test_createInsertAfter(self):

        parameters = {
                'name': 'Test Node 1',
                'description': 'Test node after addition',
                'subjectID': 'MAT',
                'branchID': 'ari',
                'keywords': 'genesis10,mach3',
                'parentID': 'mat.ari.100',
                'insertAfter': 'mat.ari.110',
                'prereqs': 'mat.ari.120',
            }
        response = self.app.post(url(controller='conceptnode', action='create'), headers={'Cookie': self.getCookiesHeaderVal()}, params=parameters)

        assert '"status": 0' in response
        j = json.loads(response.normal_body)

        encodedID = j['response']['encodedID']
        assert 'MAT.ARI' in j['response']['encodedID']
        assert j['response']['encodedID'] > 'MAT.ARI.110'
        assert j['response']['parent']['encodedID'] == 'MAT.ARI.100'

        node = api.getConceptNodeByEncodedID(encodedID=encodedID)
        assert node
        assert 'mach3' in [ x for x in node.keywords ]
        
        prereqs = api.getPrerequisiteConceptNodes(conceptNodeID=node.id)
        assert prereqs
        assert 'MAT.ARI.120' == prereqs[0].encodedID

    def test_createInsertBefore(self):
        parameters = {
                'name': 'Test Node 2',
                'description': 'Test node before subtraction',
                'subjectID': 'MAT',
                'branchID': 'ari',
                'keywords': 'genesis10,mach3',
                'parentID': 'mat.ari.100',
                'insertBefore': 'mat.ari.120',
                'prereqs': 'mat.ari.110',
            }
        response = self.app.post(url(controller='conceptnode', action='create'), headers={'Cookie': self.getCookiesHeaderVal()}, params=parameters)
        assert '"status": 0' in response
        j = json.loads(response.normal_body)

        encodedID = j['response']['encodedID']
        assert 'MAT.ARI' in j['response']['encodedID']
        assert j['response']['encodedID'] > 'MAT.ARI.110' and encodedID < 'MAT.ARI.120'
        assert j['response']['parent']['encodedID'] == 'MAT.ARI.100'

        node = api.getConceptNodeByEncodedID(encodedID=encodedID)
        assert node
        assert 'mach3' in [ x for x in node.keywords ]
        
        prereqs = api.getPrerequisiteConceptNodes(conceptNodeID=node.id)
        assert prereqs
        assert 'MAT.ARI.110' == prereqs[0].encodedID

    def test_createInsertFirst(self):

        parameters = {
                'name': 'Test Node 3',
                'description': 'Test node basic trig',
                'subjectID': 'MAT',
                'branchID': 'tri',
                'keywords': 'genesis_test,mach_test',
                'insertFirst': True,
            }
        response = self.app.post(url(controller='conceptnode', action='create'), headers={'Cookie': self.getCookiesHeaderVal()},params=parameters)
        assert '"status": 0' in response
        j = json.loads(response.normal_body)

        encodedID = j['response']['encodedID']
        assert 'MAT.TRI' in j['response']['encodedID']
        assert j['response']['encodedID'] == 'MAT.TRI.100'
        assert j['response'].get('parent') is None

        node = api.getConceptNodeByEncodedID(encodedID=encodedID)
        assert node
        assert 'mach_test' in [ x for x in node.keywords ]
        
        prereqs = api.getPrerequisiteConceptNodes(conceptNodeID=node.id)
        assert len(prereqs) == 0

        parameters = {
                'name': 'Test Node 4',
                'description': 'Test node basic alg',
                'subjectID': 'MAT',
                'branchID': 'alg',
                'keywords': 'genesis_test,mach_test',
                'insertFirst': True,
            }
        response = self.app.post(url(controller='conceptnode', action='create'), headers={'Cookie': self.getCookiesHeaderVal()}, params=parameters)
        assert '"status": 0' not in response

    def test_update(self):
        cnode = api.getConceptNodeByEncodedID(encodedID='MAT.ARI.240')
        assert cnode
        oldHandle = cnode.handle
        conceptNodeID = cnode.id
        params = {
                'id': cnode.encodedID,
                'name': 'Test Node 1 (updated)',
                'description': 'Test node arithmetic updated',
                'subjectID': 'MAT',
                'branchID': 'GEO',
                'keywords': '',
                'prereqs': 'MAT.ARI.200, MAT.ARI.230',
                'previewImageUrl': 'http://flexmath.ck12.org/media/style/../images/learn_btn.png',
                }
        response = self.app.post(url(controller='conceptnode', action='update'), headers={'Cookie': self.getCookiesHeaderVal()}, params=params)
        assert '"status": 0' not in response, "Unexpected success. Should have failed for the branch check."

        params['branchID'] = 'ARI'
        response = self.app.post(url(controller='conceptnode', action='update'), headers={'Cookie': self.getCookiesHeaderVal()}, params=params)
        assert '"status": 0' in response
        j = json.loads(response.normal_body)
        
        assert 'MAT.ARI.240' == j['response']['encodedID'], "Encoded id should not change"
        assert j['response']['handle'] != oldHandle
        assert j['response']['description'] == params['description']
        assert j['response']['subject']['shortname'] == params['subjectID']
        assert j['response']['branch']['shortname'] == params['branchID']

        keywords = api.getKeywordsForConceptNode(conceptNodeID=conceptNodeID)
        assert not len(keywords), "Keyword list should be empty"

        prereqs = api.getPrerequisiteConceptNodes(conceptNodeID=conceptNodeID)
        for p in prereqs:
            assert p.encodedID in ['MAT.ARI.200', 'MAT.ARI.230'], "Unexpected prerequisites found"

    def test_getAncestors(self):
        response = self.app.get(url(controller='conceptnode', action='getAncestors', encodedID='mat.ari.132'))
        assert '"status": 0' in response
        j = json.loads(response.normal_body)
        assert j['response']['total'] > 0
        level = 10
        for a in j['response']['ancestors']:
            assert a['level'] < level
            level = a['level']

        ## Negative
        response = self.app.get(url(controller='conceptnode', action='getAncestors', encodedID='sci.ari.100'))
        assert '"status": 0' not in response

    def test_getDescendants(self):
        encodedID = 'mat.ari.100'
        #encodedID = 'sci.bio.110'
        response = self.app.get(url(controller='conceptnode', action='getDescendants', encodedID=encodedID, levels=7), params={'pageNum':1, 'pageSize':5})
        assert '"status": 0' in response
        j = json.loads(response.normal_body)
        
        assert j['response']['total'] >= 5 and j['response']['offset'] == 0
        encodedID = j['response']['conceptNode']['encodedID']
        for child in j['response']['conceptNode']['children']:
            assert child['parent'] == encodedID
            if child['hasChildren']:
                for ch in child['children']:
                    assert ch['parent'] == child['encodedID']

        ## Branch        
        encodedID = 'mat.ari'
        response = self.app.get(url(controller='conceptnode', action='getDescendants', encodedID=encodedID, levels=7), params={'pageNum':1, 'pageSize':5})
        assert '"status": 0' in response
        j = json.loads(response.normal_body)

        assert j['response']['total'] >= 5 and j['response']['offset'] == 0
        shortname = j['response']['branch']['shortname']
        assert shortname == 'ARI'
        for c in j['response']['branch']['children']:
            encodedID = c['encodedID']
            for child in c['children']:
                assert child['parent'] == encodedID
                if child['hasChildren']:
                    for ch in child['children']:
                        assert ch['parent'] == child['encodedID']

    def test_createConceptNodeNeighbors(self):
        node = api.getConceptNodeByEncodedID(encodedID='MAT.MEA.900')
        nodeID = node.id
        encodedID = node.encodedID
        requiredConceptNode = api.getConceptNodeByEncodedID(encodedID='MAT.MEA.600')
        requiredNodeID = requiredConceptNode.id
        requiredEncodedID = requiredConceptNode.encodedID

        assert node and requiredConceptNode

        response = self.app.post(url(controller='conceptnode', action='createConceptNodeNeighbor'), 
                params={ 'conceptNodeID': encodedID, 'requiredConceptNodeID': requiredEncodedID}, 
                headers={'Cookie': self.getCookiesHeaderVal()})
        assert '"status": 0' in response
        j = json.loads(response.normal_body)
        
        assert j['response']['requiredConceptNode']['encodedID'] == requiredEncodedID

        assert api.existsConceptNodeNeighbor(conceptNodeID=nodeID, requiredConceptNodeID=requiredNodeID), "Failed to create ConceptNodeNeighbor"


        ## Failure
        response = self.app.post(url(controller='conceptnode', action='createConceptNodeNeighbor'), 
                params={ 'conceptNodeID': encodedID, 'requiredConceptNodeID': requiredEncodedID}, 
                headers={'Cookie': self.getCookiesHeaderVal()})
        assert '"status": 0' not in response

    def test_deleteConceptNodeNeighbors(self):
        node = api.getConceptNodeByEncodedID(encodedID='MAT.MEA.900')
        nodeID = node.id
        encodedID = node.encodedID
        requiredConceptNode = api.getConceptNodeByEncodedID(encodedID='MAT.MEA.600')
        requiredNodeID = requiredConceptNode.id
        requiredEncodedID = requiredConceptNode.encodedID

        assert node and requiredConceptNode

        response = self.app.post(url(controller='conceptnode', action='deleteConceptNodeNeighbor'), 
                params={ 'conceptNodeID': encodedID, 'requiredConceptNodeID': requiredEncodedID}, 
                headers={'Cookie': self.getCookiesHeaderVal()})
        assert '"status": 0' in response

        assert not api.existsConceptNodeNeighbor(conceptNodeID=nodeID, requiredConceptNodeID=requiredNodeID), "Failed to delete ConceptNodeNeighbor"

        ## Failure
        response = self.app.post(url(controller='conceptnode', action='deleteConceptNodeNeighbor'), 
                params={ 'conceptNodeID': encodedID, 'requiredConceptNodeID': requiredEncodedID}, 
                headers={'Cookie': self.getCookiesHeaderVal()})
        assert '"status": 0' not in response

    def test_getConceptNodeRank(self):
        response = self.app.get(url(controller='conceptnode', action='getConceptNodes', subjectID='MAT', branchID='ALG', toplevel='top'), params={'pageNum': 1, 'pageSize': 10})
        assert '"status": 0' in response
        j = json.loads(response.normal_body)
        correctRank = 1
        for node in j['response']['conceptNodes']:
            r = self.app.get(url(controller='conceptnode', action='getConceptNodeRank', encodedID=node['encodedID'], toplevel='top'))
            assert '"status": 0' in r
            j2 = json.loads(r.normal_body)
            assert j2['response']['rank'] == correctRank
            correctRank += 1

        response = self.app.get(url(controller='conceptnode', action='getConceptNodes', subjectID='MAT', branchID='ALG'), params={'pageNum': 1, 'pageSize': 20})
        assert '"status": 0' in response
        j = json.loads(response.normal_body)
        correctRank = 1
        for node in j['response']['conceptNodes']:
            r = self.app.get(url(controller='conceptnode', action='getConceptNodeRank', encodedID=node['encodedID']))
            assert '"status": 0' in r
            j2 = json.loads(r.normal_body)
            assert j2['response']['rank'] == correctRank, "EXpected rank: %d, actual rank: %d, eid: %s" % (correctRank, j2['response']['rank'], encodedID)
            correctRank += 1

    def test_createConceptKeyword(self):
        response = self.app.post(url(controller='conceptnode', action='associateConceptNodeKeyword'), 
                    params={'conceptNodeID': 'MAT.MEA.600', 'keyword': '__Friday__'}, 
                    headers={'Cookie': self.getLoginCookie()})

        assert '"status": 0' in response
        j = json.loads(response.normal_body)
        assert j['response']['conceptNodeID'] == 'MAT.MEA.600'
        assert j['response']['keyword'] == '__Friday__'

        response = self.app.get(url(controller='conceptnode', action='search', term='__friday__'))
        assert '"status": 0' in response
        j = json.loads(response.normal_body)
        found = False
        for node in j['response']['conceptNodes']:
            if node['encodedID'] == 'MAT.MEA.600':
                found = True
                break
        assert found, "Could not find concept node with new keyword."

        ## Negative keyword already exists.
        response = self.app.post(url(controller='conceptnode', action='associateConceptNodeKeyword'), 
                    params={'conceptNodeID': 'MAT.MEA.600', 'keyword': '__Friday__'}, 
                    headers={'Cookie': self.getLoginCookie()})
            
        assert '"status": 0' not in response
        response = self.app.post(url(controller='conceptnode', action='associateConceptNodeKeyword'), 
                    params={'conceptNodeID': 'MAT.MEA.600', 'keyword': '__Thursday__'})
        assert '"status": 0' not in response

    def test_deleteConceptKeyword(self):
        response = self.app.post(url(controller='conceptnode', action='deleteConceptNodeKeyword'), 
                    params={'conceptNodeID': 'MAT.MEA.600', 'keyword': '__Friday__'}, 
                    headers={'Cookie': self.getLoginCookie()})
        assert '"status": 0' in response

        response = self.app.get(url(controller='conceptnode', action='search', term='__friday__'))
        assert '"status": 0' in response
    
        j = json.loads(response.normal_body)
        found = False
        for node in j['response']['conceptNodes']:
            if node['encodedID'] == 'MAT.MEA.600':
                found = True

        assert not found, "concept node with new keyword still exists."

        ## Negative
        response = self.app.post(url(controller='conceptnode', action='deleteConceptNodeKeyword'), 
                    params={'conceptNodeID': 'MAT.MEA.600', 'keyword': '__thursday__'})
        assert '"status": 0' not in response

        response = self.app.post(url(controller='conceptnode', action='deleteConceptNodeKeyword'), 
                    params={'conceptNodeID': 'MAT.MEA.600', 'keyword': '__Friday__'}, 
                    headers={'Cookie': self.getLoginCookie()})
        assert '"status": 0' not in response

    def test_createConceptNodeInstance(self):
        
        response = self.app.post(url(controller='conceptnode', action='createConceptNodeInstance'), 
                    params={'conceptNodeID': 'MAT.MEA.900', 'sourceURL':'http://www.ck12.org/lesson1/', 'artifactType': 'L'},
                    headers={'Cookie': self.getLoginCookie()})

        assert '"status": 0' in response
        j = json.loads(response.normal_body)
        assert j['response']['conceptNode'] == 'MAT.MEA.900'
        assert j['response']['artifactType'] == 'L'
        assert j['response']['encodedID'] == 'MAT.MEA.900.L.1'

        response = self.app.post(url(controller='conceptnode', action='createConceptNodeInstance'), 
                    params={'conceptNodeID': 'MAT.MEA.900', 'sourceURL':'http://www.ck12.org/lesson2/', 'artifactType': 'L'},
                    headers={'Cookie': self.getLoginCookie()})

        assert '"status": 0' in response
        j = json.loads(response.normal_body)
        assert j['response']['conceptNode'] == 'MAT.MEA.900'
        assert j['response']['artifactType'] == 'L'
        assert j['response']['encodedID'] == 'MAT.MEA.900.L.2'

    def test_getConceptNodeInstances(self):

        response = self.app.post(url(controller='conceptnode', action='getConceptNodeInstances', encodedID='MAT.MEA.900'))

        assert '"status": 0' in response
        j = json.loads(response.normal_body)

        for node in j['response']['conceptInstances']:
            assert 'MAT.MEA.600' == node['conceptNode']
            assert 'MAT.MEA.600' in node['encodedID']

    def test_deleteConceptNodeInstance(self):
        node = api.getConceptNodeByEncodedID('MAT.MEA.900')
        nodeID = node.id
        artifactType = api.getArtifactExtensionTypeByShortname('L')
        artifactTypeID = artifactType.id
        nodeIns = api.getConceptNodeInstances(nodeID)
        assert nodeIns
        seq = 1

        assert api.existsConceptNodeInstance(conceptNodeID=nodeID, artifactTypeID=artifactTypeID, seq=1)

        response = self.app.post(url(controller='conceptnode', action='deleteConceptNodeInstance'), 
                    params={'conceptNodeID': 'MAT.MEA.900', 'artifactType': 'L', 'seq':seq},
                    headers={'Cookie': self.getLoginCookie()})

        assert '"status": 0' in response

        assert not api.existsConceptNodeInstance(conceptNodeID=nodeID, artifactTypeID=artifactTypeID, seq=1), "Failed to delete ConceptNodeInstance."

    def test_deleteConceptNodeInstances(self):
        node = api.getConceptNodeByEncodedID('MAT.MEA.900')
        nodeID = node.id
        nodeIns = api.getConceptNodeInstances(nodeID, pageNum=1, pageSize=1)
        assert nodeIns

        response = self.app.post(url(controller='conceptnode', action='deleteConceptNodeInstances'),
                    params={'conceptNodeID': 'MAT.MEA.900'},
                    headers={'Cookie': self.getLoginCookie()})
        assert '"status": 0' in response
        assert not api.getConceptNodeInstances(nodeID), "Failed to delted ConceptNodeInstances"

    def test_createNodeRelation(self):
        from_node = api.getConceptNodeByEncodedID('MAT.MEA.900')
        to_node = api.getConceptNodeByEncodedID('MAT.MEA.600')
        rel_type = "parent"

        response = self.app.post(url(controller='conceptnode', action='createNodeRelation'),
                    params={'fromNode': from_node.id, 'relType':rel_type, 'toNode':to_node.id},
                    headers={'Cookie': self.getLoginCookie()})
        assert '"status": 0' in response

        # Negative , rel_type is wrong
        rel_type = "knows"

        response = self.app.post(url(controller='conceptnode', action='createNodeRelation'),
                    params={'fromNode': from_node.id, 'relType':rel_type, 'toNode':to_node.id},
                    headers={'Cookie': self.getLoginCookie()})
        assert '"status": 0' not in response

    def test_deleteConceptNode(self):
        n1 = n2 = None
        try:
            cookies = self.getLoginAppCookieObject()
            math = api.getSubjectByShortname(shortname='MAT')
            branch = api.getBranchByShortname(shortname='TRI', subjectID=math.id)
            kwargs = {
                    'name': 'Test Delete Concept 1',
                    'encodedID': 'MAT.TRI.900',
                    'status': 'published',
                    'subjectID': math.id,
                    'branchID': branch.id,
                    'cookies': cookies,
                    }
            n1 = api.createConceptNode(**kwargs)
            assert n1

            kwargs = {
                    'name': 'Test Delete Concept 2',
                    'encodedID': 'MAT.TRI.910',
                    'status': 'published',
                    'subjectID': math.id,
                    'branchID': branch.id,
                    'parentID': n1.id,
                    'cookies': cookies,
                    'keywords': 'math_delete',
                    }
            n2 = api.createConceptNode(**kwargs)
            assert n2

            ## Delete node        
            encodedID = n2.encodedID
            nodeID = n2.id
            response = self.app.post(url(controller='conceptnode', action='delete'), 
                    params={ 'conceptNodeID': encodedID}, headers={'Cookie': self.getCookiesHeaderVal()})
            assert '"status": 0' in response

            ## Verify if node exists
            assert not api.existsConceptNode(nodeID), "Failed to delete ConceptNode"

            ## Failure
            response = self.app.post(url(controller='conceptnode', action='delete'), 
                    params={ 'conceptNodeID': encodedID}, headers={'Cookie': self.getCookiesHeaderVal()})
            assert '"status": 0' not in response
        except Exception, e:
            assert False, "Exception"
        finally:
            if n1 and n1.id:
                api.deleteConceptNode(id=n1.id, cookies=cookies)
