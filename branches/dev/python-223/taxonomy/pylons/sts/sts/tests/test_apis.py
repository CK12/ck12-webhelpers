import random
import os
from datetime import datetime

from sts.tests import *
from sts.model import meta
from sts.model import model
from sts.model import api
from sts.lib import helpers as h


class TestAPIs(TestController):

    def setUp(self):
        super(TestAPIs, self).setUp()
        session = meta.Session()

    def tearDown(self):
        super(TestAPIs, self).tearDown()

    def test_getConceptNodesByKeyword(self):
        nodes = api.getConceptNodesByKeyword(keyword='addition')
        assert nodes

        found = False
        for node in nodes:
            for keyword in node.keywords:
                if 'addition' in keyword.lower():
                    found = True
                    break
            assert found

    def test_getConceptNodesByName(self):
        nodes = api.getConceptNodesByName(name="multiplication", pageNum=1, pageSize=2)
        assert nodes
        assert len(nodes) <= 2

        for node in nodes:
            assert 'multiplication' in node.name.lower()

    def test_getConceptNodeIDsByName(self):
        nodeIDs = api.getConceptNodeIDsByName(name='multiplication')
        nodes = api.getConceptNodesByName(name='multiplication')
        assert nodeIDs and nodes and len(nodeIDs) == len(nodes)

        for node in nodes:
            assert node.id in nodeIDs

    def test_getConceptNodesByEncodedID(self):
        nodes = api.getConceptNodes(pageNum=1, pageSize=20)
        for node in nodes:
            retNode = api.getConceptNodeByEncodedID(encodedID=node.encodedID)
            assert retNode and retNode.id == node.id

    def test_getConceptNodesByID(self):
        nodes = api.getConceptNodes(pageNum=1, pageSize=20)
        for node in nodes:
            retNode = api.getConceptNodeByID(id=node.id)
            assert retNode and retNode.encodedID == node.encodedID

    def test_getConceptNodeByName(self):
        node = api.getConceptNodeByName(name='addition')
        assert node and node.name.lower() == 'addition'

    def test_createConceptNode(self):
        node = api.getConceptNodeByEncodedID(encodedID='MAT.ARI.110')
        assert node

        subject = api.getSubjectByShortname(shortname='MAT')
        assert subject

        branch = api.getBranchByShortname(shortname='GEO', subjectID=subject.id)
        assert branch

        cookies = self.getLoginAppCookieObject()
        kwargs = { 
                'encodedID': 'MAT.GEO.110.1101', 
                'name': 'test node creation', 
                'description': 'testing new concept node creation', 
                'parentID': node.id,
                'branchID': branch.id,
                'subjectID': subject.id,
                'cookies': cookies,
                }
        newNode = api.createConceptNode(**kwargs)
        assert newNode and newNode.id

        id = newNode.id
        assert newNode.encodedID == 'MAT.GEO.110.1101'
        assert newNode.status == 'proposed'

    def test_modifyConceptNode(self):
        node = api.getConceptNodeByEncodedID(encodedID='MAT.GEO.110.1101')
        assert node
        id = node.id
        cookies = self.getLoginAppCookieObject()
        kwargs = {
                'id': id,
                'status': 'published',
                'name': 'test node update',
                'cookies': cookies,
                }
        node = api.updateConceptNode(**kwargs)
        assert node.id == id
        assert node.status == 'published'
        assert node.name == 'test node update'

    def test_removeConceptNode(self):
        node = api.getConceptNodeByEncodedID(encodedID='MAT.GEO.110.1101')
        assert node
        id = node.id
        cookies = self.getLoginAppCookieObject()
        api.deleteConceptNode(id=id, cookies=cookies)

        node = api.getConceptNodeByID(id=id)
        assert node is None

    def test_getArtifactExtensionTypeByShortname(self):
        extType = api.getArtifactExtensionTypeByShortname(shortname='FB')
        assert extType and extType.shortname == 'FB'

    def test_getArtifactExtensionTypeByID(self):
        tmpType = api.getArtifactExtensionTypeByShortname(shortname='L')
        extType = api.getArtifactExtensionTypeByID(id=tmpType.id)
        assert extType and extType.id == tmpType.id

    def test_getArtifactExtensionTypes(self):
        extTypes = api.getArtifactExtensionTypes(pageNum=1, pageSize=10)
        assert extTypes and len(extTypes) <= 10


    def test_conceptNodeNeighbors(self):
        nodes = api.getConceptNodes(pageSize=20, pageNum=1)
        assert nodes
        for node in nodes:
            pres = api.getPrerequisiteConceptNodes(conceptNodeID=node.id)
            assert pres
            for pre in pres:
                assert pre
                assert api.existsConceptNodeNeighbor(conceptNodeID=node.id, requiredConceptNodeID=pre.id)

            posts = api.getPostrequisiteConceptNodes(conceptNodeID=node.id)
            assert posts
            for post in posts:
                assert post
                assert api.existsConceptNodeNeighbor(conceptNodeID=post.id, requiredConceptNodeID=node.id)


    def test_createConceptNodeNeighbor(self):
        nodes = api.getConceptNodes(pageSize=10, pageNum=1)
        assert nodes
        node1 = nodes[0]
        for node in nodes[1:]:
            if not api.existsConceptNodeNeighbor(conceptNodeID=node1.id, requiredConceptNodeID=node.id):
                neighbor = api.createConceptNodeNeighbor(conceptNodeID=node1.id, requiredConceptNodeID=node.id, cookies=self.getLoginAppCookieObject())
                assert neighbor and neighbor.encodedID == node.encodedID
                api.deleteConceptNodeNeighbor(conceptNodeID=node1.id, requiredConceptNodeID=neighbor.id, cookies=self.getLoginAppCookieObject())
                assert not api.existsConceptNodeNeighbor(conceptNodeID=node1.id, requiredConceptNodeID=neighbor.id)

    def test_getNextConceptNode(self):
        nodes = api.getConceptNodes(pageSize=100, pageNum=1)
        assert nodes

        for node in nodes:
            next = api.getNextConceptNodes(id=node.id, pageNum=1, pageSize=1)
            if next:
                prev = api.getPreviousConceptNodes(id=next.results[0].id, pageNum=1, pageSize=1)
                assert prev and prev[0].id == node.id
                print "Next of %s is %s" % (node.encodedID, next[0].encodedID)
            else:
                print "Next of %s is NONE" % (node.encodedID)

    def test_getPreviousConceptNode(self):
        nodes = api.getConceptNodes(pageSize=100, pageNum=1)
        assert nodes

        for node in nodes:
            prev = api.getPreviousConceptNodes(id=node.id, pageNum=1, pageSize=1)
            if prev:
                next = api.getNextConceptNodes(id=prev[0].id, pageNum=1, pageSize=1)
                assert next.results[0] and next.results[0].id == node.id
                print "Previous of %s is %s" % (node.encodedID, prev.results[0].encodedID)
            else:
                print "Previous of %s is NONE" % (node.encodedID)


    def test_conceptNodeOrdering(self):
        n1 = n2 = n3 = n4 = None
        cookies = self.getLoginAppCookieObject()
        try:
            math = api.getSubjectByShortname(shortname='MAT')
            branch = api.getBranchByShortname(shortname='TRI', subjectID=math.id)

            kwargs = {
                    'name': 'test ordering node 1',
                    'encodedID': 'MAT.TRI.998',
                    'status': 'published',
                    'subjectID': math.id,
                    'branchID': branch.id,
                    'cookies': cookies,
                    }
            n1 = api.createConceptNode(**kwargs)
            assert n1

            kwargs = {
                    'name': 'test ordering node 2',
                    'encodedID': 'MAT.TRI.999',
                    'status': 'published',
                    'subjectID': math.id,
                    'branchID': branch.id,
                    'cookies': cookies,
                    }
            n2 = api.createConceptNode(**kwargs)
            assert n2

            next = api.getNextConceptNode(id=n1.id)
            assert next and next.id == n2.id

            prev = api.getPreviousConceptNode(id=n2.id)
            assert prev and prev.id == n1.id

            kwargs = {
                    'name': 'test ordering node 3',
                    'encodedID': 'MAT.TRI.998.1',
                    'status': 'published',
                    'subjectID': math.id,
                    'branchID': branch.id,
                    'cookies': cookies,
                    }
            n3 = api.createConceptNode(**kwargs)
            assert n3

            next = api.getNextConceptNode(id=n1.id)
            assert next and next.id == n3.id

            prev = api.getPreviousConceptNode(id=n2.id)
            assert prev and prev.id == n3.id

            kwargs = {
                    'name': 'test ordering node 4',
                    'encodedID': 'MAT.TRI.998.11',
                    'status': 'published',
                    'subjectID': math.id,
                    'branchID': branch.id,
                    'cookies': cookies,
                    }
            n4 = api.createConceptNode(**kwargs)
            assert n4

            list = [ n1.encodedID, n3.encodedID, n4.encodedID, n2.encodedID ]
            next = n1
            cnt = 1
            while next:
                next = api.getNextConceptNode(id=next.id)
                if next:
                    assert next and next.encodedID == list[cnt]

                cnt += 1
        except Exception, e:
            assert False, "Exception"
        finally:
            if n1 and n1.id:
                api.deleteConceptNode(id=n1.id, cookies=cookies)
            if n2 and n2.id:
                api.deleteConceptNode(id=n2.id, cookies=cookies)
            if n3 and n3.id:
                api.deleteConceptNode(id=n3.id, cookies=cookies)
            if n4 and n4.id:
                api.deleteConceptNode(id=n4.id, cookies=cookies)

    def test_getFundamentalConceptNodes(self):
        math = api.getSubjectByShortname(shortname='mat')
        arith = api.getBranchByShortname(shortname='ari', subjectID=math.id)
        nodes = api.getFundamentalConceptNodes(subjectID=math.id, branchID=arith.id)
        for node in nodes:
            assert node.subject['shortname'] == math.shortname and node.branch['shortname'] == arith.shortname

    def test_getToplevelConceptNodes(self):
        math = api.getSubjectByShortname(shortname='mat')
        arith = api.getBranchByShortname(shortname='ari', subjectID=math.id)
        nodes = api.getConceptNodes(subjectID=math.id, branchID=arith.id, toplevel=True)
        for node in nodes:
            assert node.subject['shortname'] == math.shortname and node.branch['shortname'] == arith.shortname
            assert node.parent is None

    def test_getConceptNodeRank(self):
        math = api.getSubjectByShortname(shortname='mat')
        arith = api.getBranchByShortname(shortname='ari', subjectID=math.id)
        nodes = api.getConceptNodes(subjectID=math.id, branchID=arith.id, toplevel=True, pageNum=1, pageSize=20)
        correctRank = 1
        for node in nodes:
            rank = api.getConceptNodeRank(encodedID=node.encodedID, toplevel=True)
            assert rank == correctRank
            correctRank += 1

        nodes = api.getConceptNodes(subjectID=math.id, branchID=arith.id, toplevel=False, pageNum=1, pageSize=100)
        correctRank = 1
        for node in nodes:
            rank = api.getConceptNodeRank(encodedID=node.encodedID, toplevel=False)
            assert rank == correctRank
            correctRank += 1

