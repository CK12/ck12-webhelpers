#
# Copyright 2007-2011 CK-12 Foundation
#
# All rights reserved
#
#
# Unless required by applicable law or agreed to in writing, software
# distributed under this License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
# implied.  See the License for the specific language governing
# permissions and limitations.
#
# This file originally written by Nimish Pachapurkar
#
# $Id$

from beaker.cache import cache_region
from flxweb.lib.ck12.exceptions import RemoteAPIException, RemoteAPIStatusException
from flxweb.lib.ck12.util import equalsIgnoreCase
from flxweb.lib.remoteapi import RemoteAPI
import flxweb.lib.helpers as h
from flxweb.model.artifact import ArtifactManager
from flxweb.model.ck12model import CK12Model
from flxweb.model.browseTerm import BrowseTerm, BrowseManager
from pylons import config
import logging
import re
import json
import math
import urllib

log = logging.getLogger( __name__ )


class ConceptNodeManager(RemoteAPI):

    @staticmethod
    def getSubjects():
        """
            Get all subjects
        """
        data = RemoteAPI.makeTaxonomyGetCall('get/info/subjects')
        if data['responseHeader']['status'] == 0:
            for subject in data['response']['subjects']:
                subject['id'] = subject['shortname']
                subject['kind'] = 'subject'
                subject['name'] = subject['name'].capitalize()
                subject['hasChildren'] = (ConceptNodeManager.getBranchCountForSubject(subject['id']) > 0)
        return data

    @staticmethod
    def getBranchCountForSubject(subjectID):
        """
            Get number of branches for this subject
        """
        data = RemoteAPI.makeTaxonomyGetCall('get/info/branches/%s' % subjectID, params_dict={'pageNum':1, 'pageSize':1})
        if data['responseHeader']['status'] == 0:
            return data['response']['total']
        return 0

    @staticmethod
    def getBranchesForSubject(subjectID):
        """
            Get all branches for a given subjectID
        """
        data = RemoteAPI.makeTaxonomyGetCall('get/info/branches/%s' % subjectID)
        if data['responseHeader']['status'] == 0:
            for branch in data['response']['branches']:
                branch['id'] = branch['subject']['shortname'] + '.' + branch['shortname']
                branch['kind'] = 'branch'
                branch['name'] = branch['name'].capitalize()
                branch['hasChildren'] = (ConceptNodeManager.getTopLevelConceptNodeCount(subjectID, branch['shortname']) > 0)
                branch['numChildren'] = ConceptNodeManager.getTopLevelConceptNodeCount(subjectID, branch['shortname'])
        return data

    @staticmethod
    def getTopLevelConceptNodeCount(subjectID, branchID):
        """
            Get the number of top-level concepts for a subjectID and branchID
        """
        data = RemoteAPI.makeTaxonomyGetCall('get/info/concepts/%s/%s/top' % (subjectID, branchID), params_dict={'pageNum': 1, 'pageSize': 1})
        if data['responseHeader']['status'] == 0:
            return data['response']['total']
        return 0

    @staticmethod
    def getBrowseTermForConceptNode(encodedID):
        """
            Get corresponding browseTerm for this concept node - they have the same encodedID
        """
        data = RemoteAPI.makeGetCall('get/info/browseTerm/descendants/%s/0' % encodedID)
        if data['responseHeader']['status'] == 0:
            return BrowseTerm(data["response"]["term"])
        return None

    @staticmethod
    def getConceptNodeInfo(encodedID):
        """
            Get info for a concept node identified by encodedID
        """
        data = RemoteAPI.makeTaxonomyGetCall('get/info/concept/%s' % encodedID)
        if data['responseHeader']['status'] == 0:
            return data["response"]
        return None

    @staticmethod
    def getTopLevelConceptNodes(subjectID, branchID, pageNum=1, pageSize=0):
        """
            Get top-level concept nodes for a subjectID and branchID
        """
        data = RemoteAPI.makeTaxonomyGetCall('get/info/concepts/%s/%s/top' % (subjectID, branchID), params_dict={'pageSize': pageSize, 'pageNum': pageNum})
        if data['responseHeader']['status'] == 0:
            for node in data['response']['conceptNodes']:
                ConceptNodeManager._getConceptNodeChildrenInfo(node)
        return data

    @staticmethod
    def _getConceptNodeChildrenInfo(node):
        """
            Get information for concept node children and artifacts (recursively)
        """
        if node.get('encodedID'):
            node['id'] = node['encodedID']
        if not node.get('kind'):
            node['kind'] = 'conceptNode'
        node['artifactCount'] = 0
        node['hasChildren'] = node['childCount'] > 0

        browseTerm = ConceptNodeManager.getBrowseTermForConceptNode(node['encodedID'])
        if browseTerm:
            node['artifactCount'] = browseTerm['artifactCount']
            node['hasChildren'] = browseTerm['hasChildren']
        if node.has_key('children') and type(node['children']).__name__ == 'list':
            log.info("Node has %d children" % len(node['children']))
            for child in node['children']:
                ConceptNodeManager._getConceptNodeChildrenInfo(child)
            if node['artifactCount'] > 0:
                node['children'].extend(ConceptNodeManager.getArtifactsForConceptNode(node['id'], conceptName=node['name']))
            if browseTerm and node['artifactCount'] == 0 and browseTerm.get('domainUrl'):
                child = {
                        'id': '%s_%s' % (node['id'], browseTerm.get('domainUrl')),
                        'name': 'More on \'%s\'' % node['name'],
                        'kind': 'artifact',
                        'perma': browseTerm.get('domainUrl'),
                        }
                node['children'].append(child)

    @staticmethod
    def getArtifactsForConceptNode(conceptID, type='concept', conceptName=''):
        """
            Get artifacts of given type for concept node
        """
        artifacts = []
        conceptID = conceptID.upper()
        ## We browse artifacts for this concept node id - do not use browse/category API here as that will
        ## Return artifacts for children of this concept node as well
        data = RemoteAPI.makeGetCall('browse/%s/%s' % (type, conceptID), params_dict={'pageSize': 1})
        if conceptID in data["response"]:
            for artifact in data["response"][conceptID]:
                artifactObj = ArtifactManager.toArtifact(artifact)
                artifacts.append(artifactObj)

        ConceptNodeManager._fixArtifacts(artifacts, conceptID, conceptName)
        artifacts = sorted(artifacts, cmp=lambda x,y: cmp(x.get('encodedID'), y.get('encodedID')))
        return artifacts

    @staticmethod
    def _fixArtifacts(artifacts, conceptID, conceptName=''):
        for artifact in artifacts:
            artifact['id'] = artifact['handle'] + '#%s' % conceptID
            artifact['anchor'] = ''
            if conceptName:
                artifact['anchor'] = u'#%s' % conceptName.encode('utf-8')
            artifact['name'] = artifact['title']
            artifact['kind'] = 'artifact'

    @staticmethod
    def getDescendantConceptNodes(encodedID, levels=1):
        """
            Get descendants for a conceptNode upto given levels (max 3)
        """
        data = RemoteAPI.makeTaxonomyGetCall('get/info/descendants/concepts/%s/%d' % (encodedID, levels))
        if data['responseHeader']['status'] == 0:
            ConceptNodeManager._getConceptNodeChildrenInfo(data['response']['conceptNode'])
        return data

    @staticmethod
    def getAncestorConceptNodes(encodedID):
        """
            Get ancestors of a conceptNode as an ordered list with nearest ancestor first
        """
        data = RemoteAPI.makeTaxonomyGetCall('get/info/ancestors/concepts/%s' % encodedID)
        if data['responseHeader']['status'] == 0:
            for node in data['response']['ancestors']:
                ConceptNodeManager._getConceptNodeChildrenInfo(node)
        return data

    @staticmethod
    def getConceptNodeRank(encodedID, topOnly=False):
        """
            Get rank of this conceptNode
        """
        data = RemoteAPI.makeTaxonomyGetCall('get/info/rank/concept/%s/%s' % (encodedID, str(topOnly)))
        if data['responseHeader']['status'] == 0:
            return data['response']['rank']
        return None

    @staticmethod
    def browseConceptNode(search_term, page_num=None, page_size=None, return_total_count=False):
        """
        browse concept node by search term
        """
        data = []
        try:
            data = RemoteAPI.makeTaxonomyGetCall('search/concept/%s' % search_term, params_dict={'pageNum':page_num, 'pageSize':page_size})
        except RemoteAPIStatusException, ex:
            raise ex
        conceptNodes = []
        if 'response' in data and\
            'conceptNodes' in data['response']:
            conceptNodes = data['response']['conceptNodes']

        if return_total_count:
            if 'total' in data['response']:
                total_count = data['response']['total']
            else:
                total_count = 0
            return total_count, conceptNodes
        else:
            return conceptNodes

    @staticmethod
    def browseCollectionNode(search_term, page_num=None, page_size=None, return_total_count=False):
        """
        browse collections by search term
        """
        data = []
        try:
            data = RemoteAPI.makeTaxonomyGetCall('collections/search', params_dict={ 'query' : search_term, 'withEncodedIDOnly' : True })
        except RemoteAPIStatusException, ex:
            raise ex
        collectionNodes = []
        if 'response' in data and\
            'collections' in data['response']:
            collectionNodes = data['response']['collections']

        if return_total_count:
            if 'total' in data['response']:
                total_count = data['response']['total']
            else:
                total_count = 0
            return total_count, collectionNodes
        else:
            return collectionNodes
