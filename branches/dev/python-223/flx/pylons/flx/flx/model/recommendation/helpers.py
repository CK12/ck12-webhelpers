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
# This file originally written by Akshay Valsa
#
#

"""
Helper functions

Consists of functions typically to be used within templates, but also
available to Controllers.
"""
import logging

from pylons import app_globals as g
from pylons import config
from flx.lib import helpers as h
from flx.lib.remoteapi import RemoteAPI
from flx.model import api

log = logging.getLogger(__name__)


def _getAPIServer(server):
    """
    """
    global config
    if server == 'assessment':
        server_name = 'assessment_api_server'
    elif server == 'taxonomy':
        server_name = 'taxonomy_api_server'

    api_server = config.get(server_name)
    if not api_server:
        config = h.load_pylons_config()
        api_server = config.get(server_name)
    return api_server

def getQuestionsCount(encodedIDs):
    """
    This function will return the questions count for multi-choice and true-false questions.
    """
    assessment_api_server = _getAPIServer('assessment')
    responseDict = dict()
    questionCountDict = dict()
    for encodedID in encodedIDs:
        baseEID = '.'.join(encodedID.split('.')[:2])
        if not responseDict.has_key(baseEID):
            log.info('Getting the questions count for encodedID: [%s] from: [%s]' %(encodedID, assessment_api_server))
            response = RemoteAPI._makeCall(assessment_api_server, '/browse/info/question/counts/%s' %(baseEID), timeout=180)
            log.debug('Response from assessment server: [%s]' %(response))
            responseDict[baseEID] = response
        mulChoiceDict = {}
        trueFalseDict = {}
        for record in responseDict[baseEID]['response']['questionsCount']:
            if record['encodedID'] == encodedID:
                if record.has_key('multiple-choice'):
                    mulChoiceDict = record['multiple-choice']
                if record.has_key('true-false'):
                    trueFalseDict = record['true-false']
                questionsCount = sum(mulChoiceDict.values()) + sum(trueFalseDict.values())
                questionCountDict[encodedID] = questionsCount
    log.info('questionCountDict: [%s], encodedIDs:%s' %(questionCountDict, encodedIDs))
    return questionCountDict

def getChildren(encodedID):
    """
    This function will return the children's encodedID for the given concept node.
    """
    taxonomy_api_server = _getAPIServer('taxonomy')
    log.info('Getting the children count for encodedID: [%s] from: [%s]' %(encodedID, taxonomy_api_server))
    response = RemoteAPI._makeCall(taxonomy_api_server, 'get/info/descendants/concepts/%s/1' %(encodedID), timeout=180)
    log.debug('Response from taxonomy server: [%s]' % (response))

    encodedIDList = []
    children = response['response']['conceptNode']['children']
    for eachChild in children:
        encodedIDList.append(eachChild['encodedID'])
    log.info('Children for encodedID: [%s]' %(encodedIDList))
    return encodedIDList

def getSuggestionsFromChildrens(encodedID):
    """
    Get the suggestions from the childrens of the provided encodedID.
    """
    level = 1
    childs = getChildren(encodedID)
    artifactTypesDict = g.getArtifactTypes()
    typeIDs=[artifactTypesDict['lesson']]
    
    def _getSuggestions(level, childs):
        """
        Recursive function to get the suggestions.
        """
        # We can go deep down until level 7.
        if level > 7:
            return None
        eids = []
        for childEncodedID in childs:
            eids.append(childEncodedID)
            log.info('Fetching read modalities for encodedID: [%s]' %(childEncodedID))
            domain = api.getBrowseTermByEncodedID(encodedID=childEncodedID)
            readModalities = api.getRelatedArtifactsForDomains(domainIDs=[domain.id], typeIDs=typeIDs, ownedBy='ck12', pageNum=1, pageSize=10)
            if readModalities:
                artifactsLevelsDict = { 'basic': [], 'at grade': [], 'advanced': [] }
                for modality in readModalities:
                    level = str(modality.level).lower()
                    artifactsLevelsDict[level].append(modality.id)

                suggestedArtifacts = []
                if artifactsLevelsDict['at grade']:
                    suggestedArtifacts = artifactsLevelsDict['at grade']
                elif artifactsLevelsDict['basic']:
                    suggestedArtifacts = artifactsLevelsDict['basic']
                elif artifactsLevelsDict['advanced']:
                    suggestedArtifacts = artifactsLevelsDict['advanced']
                if suggestedArtifacts:
                    return suggestedArtifacts
        # We could not get any modalities at the current level, so lets move to next level.
        # Prepare the list of childs present in the next level.
        level = level + 1
        childrens = []
        for eid in eids:
            tmpChilds = getChildren(eid)
            if tmpChilds:
                childrens.extend(tmpChilds)
        if childrens:
            # Do recursive call to fecth the suggestions.
            suggestedArtifacts = _getSuggestions(level, childrens)
            if suggestedArtifacts:
                return suggestedArtifacts

    suggestedArtifacts = _getSuggestions(level, childs)
    return suggestedArtifacts

def getSortedArtifacts(artifacts):
    """
    Returns the list of artifact objects, sorted by vote feeddback like/dislike.
    If the artifacts has equal likes then sorted by dislikes.
    """
    # Verify if the input is artifactIDs or artifacts
    elm = artifacts[0]
    try:
        id = int(elm)
        objects = False
    except:
        objects = True
    # Get the Artifact Objects.
    if not objects:
        artifacts = map(api.getArtifactByID, artifacts)
    # Sort the artifact first on likes then on dislikes.    
    sorted_artifacts = sorted(artifacts, key=lambda x:(x.getFeedbacks()['voting']['like'],-x.getFeedbacks()['voting']['dislike']), reverse=True)
    return sorted_artifacts
