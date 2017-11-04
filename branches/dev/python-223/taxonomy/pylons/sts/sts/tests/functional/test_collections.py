import os
import json
import string
import random
import logging
import sys

from sts.model.collectionDataManager import COLLECTION_NODE_SEARCHABLE_PROPERTIES_LIST
from sts.tests import *

log = logging.getLogger(__name__)
class TestCollectionsController(TestController):

    @classmethod
    def setUpClass(cls):
        super(TestCollectionsController, cls).setUpClass()
        
        #Test-Requests
        validTestCollectionRequestFile = open(os.path.join(os.path.dirname(__file__), "..", 'data', 'validTestCollectionRequest.json'), 'rb')
        cls.validTestCollectionRequest = validTestCollectionRequestFile.read()
        validTestCollectionRequestFile.close()

        invalidTestCollection_InvalidJsonRequestFile = open(os.path.join(os.path.dirname(__file__), "..", 'data', 'invalidTestCollection_InvalidJsonRequest.json'), 'rb')
        cls.invalidTestCollection_InvalidJsonRequest = invalidTestCollection_InvalidJsonRequestFile.read()
        invalidTestCollection_InvalidJsonRequestFile.close()

        invalidTestCollection_MissingHandleAndTitleRequestFile = open(os.path.join(os.path.dirname(__file__), "..", 'data', 'invalidTestCollection_MissingHandleAndTitleRequest.json'), 'rb')
        cls.invalidTestCollection_MissingHandleAndTitleRequest = invalidTestCollection_MissingHandleAndTitleRequestFile.read()
        invalidTestCollection_MissingHandleAndTitleRequestFile.close()

        invalidTestCollection_MultipleChildrenWithSameHandleRequestFile = open(os.path.join(os.path.dirname(__file__), "..", 'data', 'invalidTestCollection_MultipleChildrenWithSameHandleRequest.json'), 'rb')
        cls.invalidTestCollection_MultipleChildrenWithSameHandleRequest = invalidTestCollection_MultipleChildrenWithSameHandleRequestFile.read()
        invalidTestCollection_MultipleChildrenWithSameHandleRequestFile.close()

        invalidTestCollection_MissingSequenceRequestFile = open(os.path.join(os.path.dirname(__file__), "..", 'data', 'invalidTestCollection_MissingSequenceRequest.json'), 'rb')
        cls.invalidTestCollection_MissingSequenceRequest = invalidTestCollection_MissingSequenceRequestFile.read()
        invalidTestCollection_MissingSequenceRequestFile.close()

        invalidTestCollection_DuplicateSequenceRequestFile = open(os.path.join(os.path.dirname(__file__), "..", 'data', 'invalidTestCollection_DuplicateSequenceRequest.json'), 'rb')
        cls.invalidTestCollection_DuplicateSequenceRequest = invalidTestCollection_DuplicateSequenceRequestFile.read()
        invalidTestCollection_DuplicateSequenceRequestFile.close()

        #Responses from Test-Requests
        cls.createdTestCollection = None
        cls.createdTestCollectionDescendantAbsoluteHandles = []
        cls.createdTestCollectionEncodedIDs = []
        cls.currentPublishedCollectionContexts = []

    @classmethod
    def tearDownClass(cls):
        super(TestCollectionsController, cls).tearDownClass()

    @classmethod
    def _extractCollectionNodeDescendantAbsoluteHandles(cls, collectionNode):
        collectionNodeDescendantAbsoluteHandles = []
        if not collectionNode.get('isRoot'):
            collectionHandle = collectionNode.get('absoluteHandle')
            collectionNodeDescendantAbsoluteHandles.append(collectionHandle)
        containedCollectionNodes = collectionNode.get('contains')
        if containedCollectionNodes:
            for containedCollectionNode in containedCollectionNodes:
                collectionNodeDescendantAbsoluteHandles.extend(cls._extractCollectionNodeDescendantAbsoluteHandles(containedCollectionNode))
        return collectionNodeDescendantAbsoluteHandles
    
    @classmethod
    def _extractCollectionNodeEncodedIDs(cls, collectionNode):
        collectionNodeEncodedIDs = []
        collectionEncodedID = collectionNode.get('encodedID')
        if collectionEncodedID:
            collectionNodeEncodedIDs.append(collectionEncodedID)
        containedCollectionNodes = collectionNode.get('contains')
        if containedCollectionNodes:
            for containedCollectionNode in containedCollectionNodes:
                collectionNodeEncodedIDs.extend(cls._extractCollectionNodeEncodedIDs(containedCollectionNode))
        return collectionNodeEncodedIDs

    @classmethod
    def _extractPublishedCollectionContexts(cls, publishedCollections):
        publishedCollectionContexts = []
        for publishedCollection in publishedCollections:
            publishedCollectionHandle = publishedCollection.get('handle')
            publishedCollectionCreatorID = publishedCollection.get('creatorID')
            if publishedCollectionHandle:
                publishedCollectionContexts.append((publishedCollectionHandle, publishedCollectionCreatorID))
        return publishedCollectionContexts

    @classmethod
    def _generateRandomCollectionContext(cls):
        collectionHandle = ''.join(random.choice(string.ascii_letters + string.digits + ' ') for _ in range(12))
        collectionCreatorID = random.randint(0,100000)
        return (collectionHandle, collectionCreatorID)

    @classmethod
    def _generateSearchQueryCollectionNodes(cls, collectionNode):
        searchQueryCollectionNodes = []
        for COLLECTION_NODE_SEARCHABLE_PROPERTY in COLLECTION_NODE_SEARCHABLE_PROPERTIES_LIST:
            if collectionNode.get(COLLECTION_NODE_SEARCHABLE_PROPERTY):
                searchQueryCollectionNodes.append((collectionNode.get(COLLECTION_NODE_SEARCHABLE_PROPERTY), collectionNode))
        containedCollectionNodes = collectionNode.get('contains')
        if containedCollectionNodes:
            for containedCollectionNode in containedCollectionNodes:
                searchQueryCollectionNodes.extend(cls._generateSearchQueryCollectionNodes(containedCollectionNode))
        return searchQueryCollectionNodes


    #Asserts that dict1 is a subDict (that all the keys & values are present) in dict2.
    #In case of lists, this method expects the order to be maintained when the value is a list.
    @classmethod
    def _assertIsSubObject(cls, object1, object2):
        object2Type = type(object2)
        assert isinstance(object1, object2Type)
        if object2Type == list:
            for objectEntryIndex, object1Entry in enumerate(object1):
                object2Entry = object2[objectEntryIndex]
                cls._assertIsSubObject(object1Entry, object2Entry) 
        elif object2Type == dict:
            for (objectEntryKey, object1EntryValue) in object1.items():
                assert objectEntryKey in object2;                
                object2EntryValue = object2.get(objectEntryKey)
                cls._assertIsSubObject(object1EntryValue, object2EntryValue) 
        else:
            assert object1 == object2

    @classmethod
    def _assertKeysPresence(cls, dict1, keyTuples, assertRecursively=False, recursiveKey=None):
        for keyTuple in keyTuples:
            assert any([key in dict1 for key in keyTuple])
            if assertRecursively and isinstance(dict1.get(recursiveKey), dict):
                cls._assertKeysPresence(dict1.get(recursiveKey), keyTuples, assertRecursively, recursiveKey)

    @classmethod
    def _assertAndParseRawResponse(cls, rawResponse):   
        assert rawResponse
        assert isinstance(rawResponse.normal_body, basestring)

        parsedResponse = json.loads(rawResponse.normal_body)
        assert parsedResponse
        assert isinstance(parsedResponse, dict)
        return parsedResponse

    @classmethod
    def _assertActualResponseHeaders(cls, responseObject, expectedStatus=0):
        actualResponseHeaders = responseObject.get('responseHeader')
        assert actualResponseHeaders
        assert isinstance(actualResponseHeaders, dict)
        assert actualResponseHeaders.has_key('status')
        assert actualResponseHeaders.get('status') == expectedStatus        

    @classmethod
    def _assertActualResponseForFailureCase(cls, responseObject, errorMessageTuples=[]):
        actualResponse = responseObject.get('response')
        assert actualResponse
        assert isinstance(actualResponse, dict)
        assert actualResponse.has_key('errors')
        
        actualErrors = actualResponse.get('errors')
        assert actualErrors
        assert isinstance(actualErrors, list)
        assert len(actualErrors) == len(errorMessageTuples)
        
        for actualErrorIndex, actualError in enumerate(actualErrors):
            assert actualError
            assert isinstance(actualError, dict)
            assert actualError.has_key('errorMessage')
            actualErrorMessage = actualError.get('errorMessage')
            assert isinstance(actualErrorMessage, basestring)

            errorMessageTuple = errorMessageTuples[actualErrorIndex]
            for errorMessage in errorMessageTuple:
                assert errorMessage in actualErrorMessage

    @classmethod
    def _generateRetreiveCollectionQueryParams(cls):
        retreiveCollectionQueryParams = {
            'includeRelations' : True,
            'maxRelationDepth' : 1000,
            'includeCanonicalCollectionsInfo': True,
            'includeTaxonomyComposistionsInfo': True,
            'considerCollectionDescendantsWithEncodedIDForTraversal': True
        }
        return retreiveCollectionQueryParams

    @classmethod
    def _assertAndExtractActualResponseCollection(cls, responseObject):
        actualResponse = responseObject.get('response')
        assert actualResponse
        assert isinstance(actualResponse, dict)
        assert actualResponse.has_key('collection')
        actualResponseCollection = actualResponse.get('collection')
        assert actualResponseCollection
        return actualResponseCollection

    @classmethod
    def _assertAndExtractActualResponseCollections(cls, responseObject):
        actualResponse = responseObject.get('response')
        assert actualResponse
        assert isinstance(actualResponse, dict)
        assert actualResponse.has_key('collections')
        actualResponseCollections = actualResponse.get('collections')
        assert actualResponseCollections
        assert isinstance(actualResponseCollections, list)
        return actualResponseCollections


    #Create Collection API
    def test_001_createCollection_Success(self):
        response = self.app.post(url(controller='collectionServiceManager', action='createCollection'), self.validTestCollectionRequest, headers={'Cookie': self.getCookiesHeaderVal()}, content_type='application/json')
        response = self._assertAndParseRawResponse(response)
        self._assertActualResponseHeaders(response, expectedStatus=0)

        actualCreatedCollection = self._assertAndExtractActualResponseCollection(response)
        self.__class__.createdTestCollection = actualCreatedCollection
        self.__class__.createdTestCollectionDescendantAbsoluteHandles = self._extractCollectionNodeDescendantAbsoluteHandles(self.createdTestCollection)
        self.__class__.createdTestCollectionEncodedIDs = self._extractCollectionNodeEncodedIDs(self.createdTestCollection)
        
        self._assertIsSubObject(json.loads(self.validTestCollectionRequest), self.createdTestCollection)
        self._assertKeysPresence(self.createdTestCollection, keyTuples=[('level',), ('handle',), ('isRoot', 'absoluteHandle'), ('type',), ('creatorID',), ('descendantEIDChildrenCount',)], assertRecursively=True, recursiveKey='contains')

    def test_002_createCollection_Failure_CollectionAlreadyExists(self):
        response = self.app.post(url(controller='collectionServiceManager', action='createCollection'), self.validTestCollectionRequest, headers={'Cookie': self.getCookiesHeaderVal()}, content_type='application/json', expect_errors=True)
        response = self._assertAndParseRawResponse(response)
        self._assertActualResponseHeaders(response, expectedStatus=0)
        self._assertActualResponseForFailureCase(response, errorMessageTuples=[('Another CollectionNode with the received handle :', 'already exists in the database')])

    def test_003_createCollection_Failure_InvalidJson(self):
        response = self.app.post(url(controller='collectionServiceManager', action='createCollection'), self.invalidTestCollection_InvalidJsonRequest, headers={'Cookie': self.getCookiesHeaderVal()}, content_type='application/json', expect_errors=True)
        response = self._assertAndParseRawResponse(response)
        self._assertActualResponseHeaders(response, expectedStatus=0)
        self._assertActualResponseForFailureCase(response, errorMessageTuples=[('Invalid collection :', 'A valid JSON is expected.')])

    def test_004_createCollection_Failure_MissingHandleAndTitle(self):
        response = self.app.post(url(controller='collectionServiceManager', action='createCollection'), self.invalidTestCollection_MissingHandleAndTitleRequest, headers={'Cookie': self.getCookiesHeaderVal()}, content_type='application/json', expect_errors=True)
        response = self._assertAndParseRawResponse(response)
        self._assertActualResponseHeaders(response, expectedStatus=0)
        self._assertActualResponseForFailureCase(response, errorMessageTuples=[('Invalid handleOrTitle :', 'One of title or handle is mandatory for every collection.')])

    def test_005_createCollection_Failure_MultipleChildrenWithSameHandle(self):
        response = self.app.post(url(controller='collectionServiceManager', action='createCollection'), self.invalidTestCollection_MultipleChildrenWithSameHandleRequest, headers={'Cookie': self.getCookiesHeaderVal()}, content_type='application/json', expect_errors=True)
        response = self._assertAndParseRawResponse(response)
        self._assertActualResponseHeaders(response, expectedStatus=0)
        self._assertActualResponseForFailureCase(response, errorMessageTuples=[('Duplicate handleOrTitle:', 'received at the identifier:')])

    def test_006_createCollection_Failure_MissingSequence(self):
        response = self.app.post(url(controller='collectionServiceManager', action='createCollection'), self.invalidTestCollection_MissingSequenceRequest, headers={'Cookie': self.getCookiesHeaderVal()}, content_type='application/json', expect_errors=True)
        response = self._assertAndParseRawResponse(response)
        self._assertActualResponseHeaders(response, expectedStatus=0)
        self._assertActualResponseForFailureCase(response, errorMessageTuples=[('Invalid value for sequence:', 'received under the collection with handleOrTitle:', 'at the identifier:')])

    def test_007_createCollection_Failure_DuplicateSequence(self):
        response = self.app.post(url(controller='collectionServiceManager', action='createCollection'), self.invalidTestCollection_DuplicateSequenceRequest, headers={'Cookie': self.getCookiesHeaderVal()}, content_type='application/json', expect_errors=True)
        response = self._assertAndParseRawResponse(response)
        self._assertActualResponseHeaders(response, expectedStatus=0)
        self._assertActualResponseForFailureCase(response, errorMessageTuples=[('Duplicate sequence:', 'received under the collection with handleOrTitle:', 'at the identifier:')])


    #Get Published Collections API (Shouldn't have any negative test cases)
    def test_006_getPublishedCollections(self):
        response = self.app.get(url(controller='collectionServiceManager', action='getPublishedCollections'))
        response = self._assertAndParseRawResponse(response)
        self._assertActualResponseHeaders(response, expectedStatus=0)

        publishedCollections = self._assertAndExtractActualResponseCollections(response)
        assert len(publishedCollections) >= 1
        self.__class__.currentPublishedCollectionContexts = self._extractPublishedCollectionContexts(publishedCollections)
        assert (self.createdTestCollection.get('handle'), self.createdTestCollection.get('creatorID')) in self.currentPublishedCollectionContexts

    def test_007_getPublishedCollections_QueryParams_ShouldReturnTheJustCreatedCollection(self):
        publishedCollectionsQueryParams = {
            'canonicalOnly': self.createdTestCollection.get('isCanonical') if self.createdTestCollection.get('isCanonical') else False,
            'creatorIDs': self.createdTestCollection.get('creatorID')
        }
        expectedCollectionsCount = 1
        if self.createdTestCollectionEncodedIDs:
            publishedCollectionsQueryParams['encodedIDs'] = ','.join(self.createdTestCollectionEncodedIDs)
            expectedCollectionsCount = len(self.createdTestCollectionEncodedIDs)
        if self.createdTestCollection.get('parentSubjectID'):
            publishedCollectionsQueryParams['parentSubjectIDs'] = self.createdTestCollection.get('parentSubjectID')

        response = self.app.get(url(controller='collectionServiceManager', action='getPublishedCollections'), params=publishedCollectionsQueryParams)
        response = self._assertAndParseRawResponse(response)
        self._assertActualResponseHeaders(response, expectedStatus=0)

        queriedPublishedCollections = self._assertAndExtractActualResponseCollections(response)
        assert len(queriedPublishedCollections) == expectedCollectionsCount
        for queriedPublishedCollection in queriedPublishedCollections:
            assert queriedPublishedCollection
            assert isinstance(queriedPublishedCollection, dict)
            assert (queriedPublishedCollection.get('handle'), queriedPublishedCollection.get('creatorID')) == (self.createdTestCollection.get('handle'), self.createdTestCollection.get('creatorID'))
            if self.createdTestCollectionEncodedIDs:
                assert queriedPublishedCollection.get('descendantHandle')
                assert queriedPublishedCollection.get('descendantAbsoluteHandle')


    #Search Collections API (Shouldn't have any negative test cases)
    def test_008_searchCollections(self):
        #extract a randomQuery from the createdTestCollection
        searchQueryCollectionNodes = self._generateSearchQueryCollectionNodes(self.createdTestCollection)
        if not searchQueryCollectionNodes:
            raise Exception("Random Search Query could not be generated from the given collectionNode")
        
        searchQuery, collectionNode = random.choice(searchQueryCollectionNodes)
        searchCollectionsQueryParams = {
            'query' : searchQuery,
            'skip': 0,
            'limit' : 1000,
            'handles': collectionNode.get('handle'),
            'ancestorHandles': self.createdTestCollection.get('handle'),
            'creatorIDs': collectionNode.get('creatorID'),
            'ancestorCreatorIDs': self.createdTestCollection.get('creatorID'),
            'canonicalOnly': collectionNode.get('isCanonical') if collectionNode.get('isCanonical') else False,
            'ancestorCanonicalOnly': self.createdTestCollection.get('isCanonical') if self.createdTestCollection.get('isCanonical') else False,            
            'publishedOnly': collectionNode.get('isPublished') if collectionNode.get('isPublished') else False,
            'ancestorPublishedOnly': self.createdTestCollection.get('isPublished') if self.createdTestCollection.get('isPublished') else False,
            'withEncodedIDOnly': True if collectionNode.get('encodedID') else False
        }

        response = self.app.get(url(controller='collectionServiceManager', action='searchCollections'), params=searchCollectionsQueryParams)
        response = self._assertAndParseRawResponse(response)
        self._assertActualResponseHeaders(response, expectedStatus=0)

        searchedCollections = self._assertAndExtractActualResponseCollections(response)
        assert len(searchedCollections) == 1
        searchedCollection = searchedCollections[0]
        assert searchedCollection
        assert isinstance(searchedCollection, dict)

        assert any ([searchQuery in searchedCollection.get(COLLECTION_NODE_SEARCHABLE_PROPERTY) for COLLECTION_NODE_SEARCHABLE_PROPERTY in COLLECTION_NODE_SEARCHABLE_PROPERTIES_LIST if searchedCollection.get(COLLECTION_NODE_SEARCHABLE_PROPERTY)])
        assert searchedCollection.get('handle') == searchCollectionsQueryParams.get('handles')
        assert searchedCollection.get('collectionHandle') == searchCollectionsQueryParams.get('ancestorHandles')
        assert searchedCollection.get('creatorID') == searchCollectionsQueryParams.get('creatorIDs')
        assert searchedCollection.get('collectionCreatorID') == searchCollectionsQueryParams.get('ancestorCreatorIDs')
        assert searchedCollection.has_key('encodedID') == searchCollectionsQueryParams.get('withEncodedIDOnly')


    #Get CollectionByHandleCreatorIDAndDescendantIdentifier API
    def test_009_getCollectionByHandleCreatorIDAndDescendantIdentifierOrHandle_SuccessCase(self):
        collectionHandle = self.createdTestCollection.get('handle')
        collectionCreatorID = self.createdTestCollection.get('creatorID')

        retreiveCollectionQueryParams = self._generateRetreiveCollectionQueryParams()
        response = self.app.get(url(controller='collectionServiceManager', action='getCollectionByHandleCreatorIDAndDescendantIdentifierOrHandle', collectionHandle=collectionHandle, collectionCreatorID=collectionCreatorID), params=retreiveCollectionQueryParams)
        response = self._assertAndParseRawResponse(response)
        self._assertActualResponseHeaders(response, expectedStatus=0)
        retreivedCollection = self._assertAndExtractActualResponseCollection(response)
        #Add more assertions

    def test_010_getCollectionByHandleCreatorIDAndDescendantIdentifierOrHandle_FailureCase(self):
        randomNonExistingPublishedCollectionContextGenerated = False
        while not randomNonExistingPublishedCollectionContextGenerated:
            collectionContext = self._generateRandomCollectionContext()
            randomNonExistingPublishedCollectionContextGenerated = not collectionContext in self.currentPublishedCollectionContexts
            collectionHandle, collectionCreatorID = collectionContext
        
        response = self.app.get(url(controller='collectionServiceManager', action='getCollectionByHandleCreatorIDAndDescendantIdentifierOrHandle', collectionHandle=collectionHandle, collectionCreatorID=collectionCreatorID), expect_errors=True)
        response = self._assertAndParseRawResponse(response)
        self._assertActualResponseHeaders(response, expectedStatus=0)
        self._assertActualResponseForFailureCase(response, errorMessageTuples=[('Collection with the given handle :', 'could not be found in the dataBase.')])

    def test_012_getCollectionByHandleCreatorIDAndDescendantIdentifierOrHandle_DescendantIdentifier_SuccessCase(self):
        collectionHandle = self.createdTestCollection.get('handle')
        collectionCreatorID = self.createdTestCollection.get('creatorID')
        collectionNode = self.createdTestCollection
        collectionDescendantIdentifier = "0"
        while collectionNode.get('contains'):
            collectionDescendantIdentifierPart = random.randint(1, len(collectionNode.get('contains')))
            collectionNode = collectionNode.get('contains')[collectionDescendantIdentifierPart-1]
            collectionDescendantIdentifier = collectionDescendantIdentifier + "." + str(collectionDescendantIdentifierPart)

        retreiveCollectionQueryParams = self._generateRetreiveCollectionQueryParams()
        response = self.app.get(url(controller='collectionServiceManager', action='getCollectionByHandleCreatorIDAndDescendantIdentifierOrHandle',  collectionHandle=collectionHandle, collectionCreatorID=collectionCreatorID, collectionDescendantIdentifier=collectionDescendantIdentifier), params=retreiveCollectionQueryParams)
        response = self._assertAndParseRawResponse(response)
        self._assertActualResponseHeaders(response, expectedStatus=0)
        retreivedCollection = self._assertAndExtractActualResponseCollection(response)
        #Add more assertions

    def test_013_getCollectionByHandleCreatorIDAndDescendantIdentifierOrHandle_DescendantIdentifier_FailureCase(self):
        collectionHandle = self.createdTestCollection.get('handle')
        collectionCreatorID = self.createdTestCollection.get('creatorID')
        collectionNode = self.createdTestCollection
        collectionDescendantIdentifier = "0"
        while collectionNode.get('contains'):
            collectionDescendantIdentifierPart = random.randint(1, len(collectionNode.get('contains')))
            collectionNode = collectionNode.get('contains')[collectionDescendantIdentifierPart-1]
            collectionDescendantIdentifier = collectionDescendantIdentifier + "." + str(collectionDescendantIdentifierPart)
        collectionDescendantIdentifier = collectionDescendantIdentifier + ".1"

        response = self.app.get(url(controller='collectionServiceManager', action='getCollectionByHandleCreatorIDAndDescendantIdentifierOrHandle', collectionHandle=collectionHandle, collectionCreatorID=collectionCreatorID, collectionDescendantIdentifier=collectionDescendantIdentifier), expect_errors=True)
        response = self._assertAndParseRawResponse(response)
        self._assertActualResponseHeaders(response, expectedStatus=0)
        self._assertActualResponseForFailureCase(response, errorMessageTuples=[('Collection Descendant with the given collectionDescendantIdentifier:', 'could not be found for the collectionNode with handle :', 'by the memberID:')])

    def test_014_getCollectionByHandleCreatorIDAndDescendantIdentifierOrHandle_DescendantHandle_SuccessCase(self):
        collectionHandle = self.createdTestCollection.get('handle')
        collectionCreatorID = self.createdTestCollection.get('creatorID')
        collectionNode = self.createdTestCollection
        collectionDescendantAbsoluteHandle = None
        while collectionNode.get('contains'):
            collectionDescendantIdentifierPart = random.randint(0, len(collectionNode.get('contains'))-1)
            collectionNode = collectionNode.get('contains')[collectionDescendantIdentifierPart]
            collectionDescendantAbsoluteHandle = collectionNode.get('absoluteHandle')

        retreiveCollectionQueryParams = self._generateRetreiveCollectionQueryParams()
        response = self.app.get(url(controller='collectionServiceManager', action='getCollectionByHandleCreatorIDAndDescendantIdentifierOrHandle', collectionHandle=collectionHandle, collectionCreatorID=collectionCreatorID, absoluteCollectionDescendantHandle=collectionDescendantAbsoluteHandle), params=retreiveCollectionQueryParams)
        response = self._assertAndParseRawResponse(response)
        self._assertActualResponseHeaders(response, expectedStatus=0)
        retreivedCollection = self._assertAndExtractActualResponseCollection(response)
        #Add more assertions

    def test_015_getCollectionByHandleCreatorIDAndDescendantIdentifierOrHandle_DescendantHandle_FailureCase(self):
        collectionHandle = self.createdTestCollection.get('handle')
        collectionCreatorID = self.createdTestCollection.get('creatorID')
        randomNonExistingCollectionDescendantAbsoluteHandleGenerated = False
        while not randomNonExistingCollectionDescendantAbsoluteHandleGenerated:
            collectionDescendantAbsoluteHandle = ''.join(random.choice(string.ascii_letters + string.digits + ' ') for _ in range(12))
            randomNonExistingCollectionDescendantAbsoluteHandleGenerated = not collectionDescendantAbsoluteHandle in self.createdTestCollectionDescendantAbsoluteHandles

        response = self.app.get(url(controller='collectionServiceManager', action='getCollectionByHandleCreatorIDAndDescendantIdentifierOrHandle', collectionHandle=collectionHandle, collectionCreatorID=collectionCreatorID, absoluteCollectionDescendantHandle=collectionDescendantAbsoluteHandle), expect_errors=True)
        response = self._assertAndParseRawResponse(response)
        self._assertActualResponseHeaders(response, expectedStatus=0)
        self._assertActualResponseForFailureCase(response, errorMessageTuples=[('Descendant with the given absoluteCollectionDescendantHandle :', 'could not be found under the current collection.')])

    #Delete Collection API
    def test_016_deleteCollection_Failure_CollectionNotPresent(self):
        randomNonExistingPublishedCollectionContextGenerated = False
        while not randomNonExistingPublishedCollectionContextGenerated:
            collectionContext = self._generateRandomCollectionContext()
            print self.currentPublishedCollectionContexts
            randomNonExistingPublishedCollectionContextGenerated = not collectionContext in self.currentPublishedCollectionContexts
            collectionHandle = collectionContext[0]
        response = self.app.delete(url(controller='collectionServiceManager', action='deleteCollection', collectionHandle=collectionHandle), headers={'Cookie': self.getCookiesHeaderVal()}, expect_errors=True)
        response = self._assertAndParseRawResponse(response)
        self._assertActualResponseHeaders(response, expectedStatus=0)
        self._assertActualResponseForFailureCase(response, errorMessageTuples=[('Collection with the given handle :', 'could not be found in the dataBase.')])

    def test_017_deleteCollection_Failure_UserNotLoggedIn(self):
        collectionHandle = self.createdTestCollection.get('handle')
        response = self.app.delete(url(controller='collectionServiceManager', action='deleteCollection', collectionHandle=collectionHandle), expect_errors=True)
        response = self._assertAndParseRawResponse(response)
        self._assertActualResponseHeaders(response, expectedStatus=0)
        self._assertActualResponseForFailureCase(response, errorMessageTuples=[('User needs to be logged in (authenticated) to perform the requested operation but an error with errorMessage : [No user id found in request] has occured while trying to authenticate the user.', )])

    def test_018_deleteCollection_Success(self):
        collectionHandle = self.createdTestCollection.get('handle')
        collectionCreatorID = self.createdTestCollection.get('creatorID')
        response = self.app.delete(url(controller='collectionServiceManager', action='deleteCollection', collectionHandle=collectionHandle), headers={'Cookie': self.getCookiesHeaderVal()})
        response = self._assertAndParseRawResponse(response)
        self._assertActualResponseHeaders(response, expectedStatus=0)

        deletedCollection = self._assertAndExtractActualResponseCollection(response)
        assert deletedCollection.get('collectionStatus') == 'SUCCESFULLY_DELETED'
        assert deletedCollection.get('handle') == collectionHandle
        assert deletedCollection.get('creatorID') == collectionCreatorID
