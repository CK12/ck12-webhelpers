from pylons import request, response
from sts.logic.collectionBusinessManager import CollectionBusinessLogic
from sts.controllers import user
from sts.model import exceptions
from sts.controllers import decorators as dec1
from sts.util import decorators as dec2
from sts.util import util
from sts.lib.base import BaseController
from urllib import quote, unquote
import json
import re

HANDLE_IDENTIFIERS_SEPARATOR = '-::-'

UNSAFE_CHARS_FOR_HANDLE_GENERATION = [ '!', '"', '#', '$', '%', '&', "'", '(', ')', '*', '+', ',', '/', ';', '<', '=', '>', '?', '@', '[', '\\', ']', '^', '`', '{', '|', '}', '~' ]
UNSAFE_CHARS_FOR_SEARCH_QUERY = ['\'', '"', '[', ']', '{', '}', '<', '>']
SPECIAL_CHARS_FOR_SEARCH_QUERY = ['!', ')', '(', '+', '*', '-', '^', '&&', ':', '||', '?', '~']
STOP_WORDS_FOR_SEARCH_QUERY = ['a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'for', 'if', 'in', 'into', 'is', 'it', 'no', 'not', 'of', 'on', 'or', 's', 'such', 't', 'that', 'the', 'their', 'then', 'there', 'these', 'they', 'this', 'to', 'was', 'will', 'with']


__controller__ = 'CollectionServiceController'

class CollectionServiceController(BaseController):

    def __init__(self):
        self.businessLogic = CollectionBusinessLogic()

    def _validateRequestMethod(self, validMethods):
        if request.method not in validMethods:
            raise exceptions.InvalidHTTPMethodException(u"HTTPMethod : [{httpMethod}] is not supported for this URL : [{URL}]".format(httpMethod=request.method, URL=request.path).encode('utf-8'))

    def _validateContentType(self, validContentType):
        if request.content_type != validContentType:
            raise exceptions.InvalidContentTypeException(u"contentType : [{contentType}] content in the request body is not supported.".format(contentType=request.content_type).encode('utf-8'))                
    
    def _constructMemberDict(self, member):
        memberDict = {}
        memberDict['memberID'] = member['id']
        memberDict['memberEmail'] = member['email']
        memberDict['memberLogin'] = member['login']
        memberDict['memberDefaultLogin'] = member['defaultLogin']
        return memberDict
    
    def _validateAndProcessCollectionHandle(self, collectionHandle):
        if not collectionHandle or not isinstance(collectionHandle, basestring):
            raise exceptions.InvalidArgumentException(u"Invalid handle : [{collectionHandle}] is received.".format(collectionHandle=collectionHandle).encode('utf-8'))

        if isinstance(collectionHandle, unicode):
            collectionHandle=collectionHandle.encode('utf-8')

        collectionHandle = collectionHandle.strip()
        handle = collectionHandle
        while True:
            collectionHandle = unquote(handle)
            if collectionHandle == handle:
                break
            handle = collectionHandle
        
        #Remove unsafe characters.
        for char in UNSAFE_CHARS_FOR_HANDLE_GENERATION:
            collectionHandle = collectionHandle.replace(char, '')
        
        #Change space to '-' and Reduce repeating '-' into a single one.
        collectionHandle = ' '.join(collectionHandle.split())
        collectionHandle = collectionHandle.replace(' ', '-')
        collectionHandle = re.sub(r'(-)\1+', r'\1', collectionHandle)
        collectionHandle = collectionHandle.lower()
        return collectionHandle

    def _validateAndAppendRootNonRootCollectionHandles(self, rootCollectionHandle, nonRootCollectionHandle):
        if not isinstance(nonRootCollectionHandle, basestring) or HANDLE_IDENTIFIERS_SEPARATOR in nonRootCollectionHandle:
            raise Exception(u"Invalid nonRootCollectionHandle: [{nonRootCollectionHandle}] received. A valid string with out [{handleIdentifiersSeparator}] expected.".format(nonRootCollectionHandle=nonRootCollectionHandle, handleIdentifiersSeparator=HANDLE_IDENTIFIERS_SEPARATOR).encode('utf-8'))
        if not isinstance(rootCollectionHandle, basestring) or ' ' in rootCollectionHandle or HANDLE_IDENTIFIERS_SEPARATOR in rootCollectionHandle:
            raise Exception(u"Invalid rootCollectionHandle: [{rootCollectionHandle}] received. A valid string with out space or [{handleIdentifiersSeparator} ] is expected.".format(rootCollectionHandle=rootCollectionHandle, handleIdentifiersSeparator=HANDLE_IDENTIFIERS_SEPARATOR).encode('utf-8'))
        return rootCollectionHandle + HANDLE_IDENTIFIERS_SEPARATOR + nonRootCollectionHandle
    
    def _validateAndProcessCollectionCreatorID(self, collectionCreatorID):
        if collectionCreatorID is not None:
            try :
                collectionCreatorID=long(collectionCreatorID)
            except (ValueError, TypeError) as e:
                raise exceptions.InvalidArgumentException(u"Invalid collectionCreatorID : [{collectionCreatorID}] is received.".format(collectionCreatorID=collectionCreatorID).encode('utf-8'))
            if collectionCreatorID <=0:
                raise exceptions.InvalidArgumentException(u"Invalid collectionCreatorID : [{collectionCreatorID}] is received.".format(collectionCreatorID=collectionCreatorID).encode('utf-8'))                
        return collectionCreatorID

    def _extractAndDefaultCollectionCreatorID(self):
        collectionCreator = user.getCurrentUser(anonymousOkay=False, autoLogin=True, throwbackException=False)
        if not collectionCreator:
            collectionCreatorID = 3L
        else:
            collectionCreatorID = collectionCreator['id']
        return collectionCreatorID

    def _validateAndProcessCollectionDict(self, collectionDict, encounteredCollectionHandleOrTitles=None, collectionIdentifier="root"):
        if encounteredCollectionHandleOrTitles is None:
            encounteredCollectionHandleOrTitles = []
        if collectionIdentifier != 'root' and not encounteredCollectionHandleOrTitles:
            raise exceptions.SystemImplementationException(u"Invalid / Empty encounteredCollectionHandleOrTitles : [{encounteredCollectionHandleOrTitles}] received while processing the collection with the identifier: [{collectionIdentifier}].".format(encounteredCollectionHandleOrTitles=encounteredCollectionHandleOrTitles, collectionIdentifier=collectionIdentifier).encode('utf-8'))

        #validateHandleOrTitle (one of handle or title is mandatory)
        collectionHandleOrTitle = collectionDict.get('handle')
        if not collectionHandleOrTitle:
            collectionHandleOrTitle = collectionDict.get('title')
        if not collectionHandleOrTitle or not isinstance(collectionHandleOrTitle, basestring):
            raise exceptions.InvalidArgumentException(u"Invalid handleOrTitle : [{collectionHandleOrTitle}] is received for the collection at the identifier: [{collectionIdentifier}]. One of title or handle is mandatory for every collection.".format(collectionHandleOrTitle=collectionHandleOrTitle, collectionIdentifier=collectionIdentifier).encode('utf-8'))

        #validate that handleOrTitle is unqiue across the whole collection - not necessary for the rootHandle, but just mandating it.
        collectionHandleOrTitle = self._validateAndProcessCollectionHandle(collectionHandleOrTitle)
        if collectionHandleOrTitle in encounteredCollectionHandleOrTitles:
            raise exceptions.InvalidArgumentException(u"Duplicate handleOrTitle: [{collectionHandleOrTitle}] received at the identifier: [{collectionIdentifier}].".format(collectionHandleOrTitle=collectionHandleOrTitle, collectionIdentifier=collectionIdentifier).encode('utf-8'))
        encounteredCollectionHandleOrTitles.append(collectionHandleOrTitle)
        
        #validateTitle (This is necessary as the above handleOrTitle check will not check for the validity of the title when both handle + title are present)
        collectionTitle = collectionDict.get('title')
        if collectionTitle is not None:
            if not collectionTitle or not isinstance(collectionTitle, basestring):
                raise exceptions.InvalidArgumentException(u"Invalid title : [{collectionTitle}] is received for the collection with handleOrTitle: [{collectionHandleOrTitle}] at the identifier: [{collectionIdentifier}].".format(collectionTitle=collectionTitle, collectionHandleOrTitle=collectionHandleOrTitle, collectionIdentifier=collectionIdentifier).encode('utf-8'))

        #validateDescription
        collectionDescription = collectionDict.get('description')
        if collectionDescription is not None:
            if not collectionDescription or not isinstance(collectionDescription, basestring):
                raise exceptions.InvalidArgumentException(u"Invalid description : [{collectionDescription}] is received for the collection with handleOrTitle: [{collectionHandleOrTitle}] at the identifier: [{collectionIdentifier}].".format(collectionDescription=collectionDescription, collectionHandleOrTitle=collectionHandleOrTitle, collectionIdentifier=collectionIdentifier).encode('utf-8'))

        #validateCountry
        collectionCountry = collectionDict.get('country')
        if collectionCountry is not None:
            if not collectionCountry or not isinstance(collectionCountry, basestring):
                raise exceptions.InvalidArgumentException(u"Invalid country : [{collectionCountry}] is received for the collection with handleOrTitle: [{collectionHandleOrTitle}] at the identifier: [{collectionIdentifier}].".format(collectionCountry=collectionCountry, collectionHandleOrTitle=collectionHandleOrTitle, collectionIdentifier=collectionIdentifier).encode('utf-8'))

        if collectionIdentifier == 'root':
            collectionIsPublished = collectionDict.get('isPublished')
            if collectionIsPublished and collectionIsPublished not in ('true', 'false', 'True', 'False', True, False):
                raise exceptions.InvalidArgumentException(u"Invalid value for isPublished : [{collectionIsPublished}] received.".format(collectionIsPublished=collectionIsPublished).encode('utf-8'))
            else:
                if collectionIsPublished in ('true', 'True', True):
                    collectionIsPublished = True
                else:
                    collectionIsPublished = False
                collectionDict['isPublished'] = collectionIsPublished

            collectionIsCanonical = collectionDict.get('isCanonical')
            if collectionIsCanonical and collectionIsCanonical not in ('true', 'false', 'True', 'False', True, False):
                raise exceptions.InvalidArgumentException(u"Invalid value for isCanonical : [{collectionIsCanonical}] received.".format(collectionIsCanonical=collectionIsCanonical).encode('utf-8'))
            else:
                if collectionIsCanonical in ('true', 'True', True):
                    collectionIsCanonical = True
                else:
                    collectionIsCanonical = False
                collectionDict['isCanonical'] = collectionIsCanonical

            forceCollectionCreation = collectionDict.get('forceCreate')
            if forceCollectionCreation and forceCollectionCreation not in ('true', 'false', 'True', 'False', True, False):
                raise exceptions.InvalidArgumentException(u"Invalid value for forceCreate : [{forceCollectionCreation}] received.".format(forceCollectionCreation=forceCollectionCreation).encode('utf-8'))
            else:
                if forceCollectionCreation in ('true', 'True', True):
                    forceCollectionCreation = True
                else:
                    forceCollectionCreation = False
                collectionDict['forceCreate'] = forceCollectionCreation
        
            collectionDict['handle'] = collectionHandleOrTitle
        else:
            collectionDict['handle'] = self._validateAndAppendRootNonRootCollectionHandles(encounteredCollectionHandleOrTitles[0], collectionHandleOrTitle)

        #validateEncodedID
        collectionHasEncodedID = False
        collectionEncodedID = collectionDict.get('encodedID')
        if collectionEncodedID is not None:
            if not collectionEncodedID or not isinstance(collectionEncodedID, basestring):
                raise exceptions.InvalidArgumentException(u"Invalid encodedID : [{collectionEncodedID}] is received for the collection with handleOrTitle: [{collectionHandleOrTitle}] at the identifier: [{collectionIdentifier}].".format(collectionEncodedID=collectionEncodedID, collectionHandleOrTitle=collectionHandleOrTitle, collectionIdentifier=collectionIdentifier).encode('utf-8'))
            collectionHasEncodedID = True

        #validateContainedCollections
        containedCollectionDicts = collectionDict.get('contains')
        if containedCollectionDicts is not None:
            #collection is a non-leaf collection, should not contain an encodedID
            if collectionHasEncodedID:
                raise exceptions.InvalidArgumentException(u"Invalid encodedID : [{collectionEncodedID}] is received for the collection with handleOrTitle: [{collectionHandleOrTitle}] at the identifier: [{collectionIdentifier}]. EncodedID is not allowed for non-leaf collections".format(collectionEncodedID=collectionEncodedID, collectionHandleOrTitle=collectionHandleOrTitle, collectionIdentifier=collectionIdentifier).encode('utf-8'))

            if not isinstance(containedCollectionDicts, list) or not containedCollectionDicts:
                raise exceptions.InvalidArgumentException(u"Invalid contains : [{containedCollectionDicts}] is received for the collection with handleOrTitle: [{collectionHandleOrTitle}] at the identifier: [{collectionIdentifier}].".format(containedCollectionDicts=containedCollectionDicts, collectionHandleOrTitle=collectionHandleOrTitle, collectionIdentifier=collectionIdentifier).encode('utf-8'))
            else:
                containedCollectionSequenceIDs = []
                processedContainedCollectionDicts = []
                for containedCollectionDict in containedCollectionDicts:
                    containedCollectionSequenceID = containedCollectionDict.get('sequence')
                    try :
                        containedCollectionSequenceID=long(containedCollectionSequenceID)
                    except (ValueError, TypeError) as e:
                        raise exceptions.InvalidArgumentException(u"Invalid value for sequence: [{containedCollectionSequenceID}] received under the collection with handleOrTitle: [{collectionHandleOrTitle}] at the identifier: [{collectionIdentifier}].".format(containedCollectionSequenceID=containedCollectionSequenceID, collectionHandleOrTitle=collectionHandleOrTitle, collectionIdentifier=collectionIdentifier).encode('utf-8'))
                    if containedCollectionSequenceID <=0:
                        raise exceptions.InvalidArgumentException(u"Invalid value for sequence: [{containedCollectionSequenceID}] received under the collection with handleOrTitle: [{collectionHandleOrTitle}] at the identifier: [{collectionIdentifier}].".format(containedCollectionSequenceID=containedCollectionSequenceID, collectionHandleOrTitle=collectionHandleOrTitle, collectionIdentifier=collectionIdentifier).encode('utf-8'))
                    if containedCollectionSequenceID in containedCollectionSequenceIDs:
                        raise exceptions.InvalidArgumentException(u"Duplicate sequence: [{containedCollectionSequenceID}] received under the collection with handleOrTitle: [{collectionHandleOrTitle}] at the identifier: [{collectionIdentifier}].".format(containedCollectionSequenceID=containedCollectionSequenceID, collectionHandleOrTitle=collectionHandleOrTitle, collectionIdentifier=collectionIdentifier).encode('utf-8'))
                    containedCollectionSequenceIDs.append(containedCollectionSequenceID)

                    processedContainedCollectionDict = self._validateAndProcessCollectionDict(containedCollectionDict, encounteredCollectionHandleOrTitles, collectionIdentifier+"."+str(containedCollectionSequenceID))
                    processedContainedCollectionDicts.append(processedContainedCollectionDict)
                collectionDict['contains'] = processedContainedCollectionDicts
        else:
            #collection is a leaf collection, should contain an encodedID mandatorily
            if not collectionHasEncodedID:
                raise exceptions.InvalidArgumentException(u"Invalid encodedID : [{collectionEncodedID}] is received for the collection with handleOrTitle: [{collectionHandleOrTitle}] at the identifier: [{collectionIdentifier}]. A valid encodedID is mandatory for the leaf collections".format(collectionEncodedID=collectionEncodedID, collectionHandleOrTitle=collectionHandleOrTitle, collectionIdentifier=collectionIdentifier).encode('utf-8'))
        return collectionDict

    def _validateAndProcessCollectionDescendantIdentifier(self, collectionDescendantIdentifier):
        if collectionDescendantIdentifier is not None:
            if not collectionDescendantIdentifier or not isinstance(collectionDescendantIdentifier, basestring):
                raise exceptions.InvalidArgumentException(u"Invalid collectionDescendantIdentifier : [{collectionDescendantIdentifier}] is received.".format(collectionDescendantIdentifier=collectionDescendantIdentifier).encode('utf-8'))

            actualCollectionDescendantIdentifier = collectionDescendantIdentifier
            collectionDescendantIdentifierParts = collectionDescendantIdentifier.split('.')
            collectionDescendantIdentifier = []
            for collectionDescendantIdentifierPart in collectionDescendantIdentifierParts:
                try :
                    collectionDescendantIdentifierPart=int(collectionDescendantIdentifierPart)
                except (ValueError, TypeError) as e:
                    raise exceptions.InvalidArgumentException(u"Invalid collectionDescendantIdentifier : [{collectionDescendantIdentifier}] is received.".format(collectionDescendantIdentifier=actualCollectionDescendantIdentifier).encode('utf-8'))
                collectionDescendantIdentifier.append(collectionDescendantIdentifierPart)
        return collectionDescendantIdentifier

    def _extractAndDefaultQueryOptionsForPublishedCollections(self):
        queryOptions = {}

        #',' seperated list of the encodedIDs of which atleast one needs to be present in each of the collection being returned
        encodedIDs = request.GET.get('encodedIDs')
        if encodedIDs is not None:
            if not encodedIDs or not isinstance(encodedIDs, basestring):
                raise exceptions.InvalidArgumentException(u"Invalid encodedIDs : [{encodedIDs}] is received.".format(encodedIDs=encodedIDs).encode('utf-8'))

            actualEncodedIDs = encodedIDs
            encodedIDs = encodedIDs.split(',')
            processedEncodedIDs = []
            for encodedID in encodedIDs:
                encodedID = encodedID.strip()
                if not encodedID:
                    raise exceptions.InvalidArgumentException(u"Invalid encodedIDs : [{encodedIDs}] is received.".format(encodedIDs=actualEncodedIDs).encode('utf-8'))                
                encodedID = util.processEncodedID(encodedID)
                if encodedID not in processedEncodedIDs:
                    processedEncodedIDs.append(encodedID)
            queryOptions['encodedIDs'] = processedEncodedIDs

        #',' seperated list of the parentSubjectIDs
        parentSubjectIDs = request.GET.get('parentSubjectIDs')
        if parentSubjectIDs is not None:
            if not parentSubjectIDs or not isinstance(parentSubjectIDs, basestring):
                raise exceptions.InvalidArgumentException(u"Invalid parentSubjectIDs : [{parentSubjectIDs}] is received.".format(parentSubjectIDs=parentSubjectIDs).encode('utf-8'))

            actualParentSubjectIDs = parentSubjectIDs
            parentSubjectIDs = parentSubjectIDs.split(',')
            processedParentSubjectIDs = []
            for parentSubjectID in parentSubjectIDs:
                parentSubjectID = parentSubjectID.strip()
                if not parentSubjectID:
                    raise exceptions.InvalidArgumentException(u"Invalid parentSubjectIDs : [{parentSubjectIDs}] is received.".format(parentSubjectIDs=actualParentSubjectIDs).encode('utf-8'))                
                if parentSubjectID not in processedParentSubjectIDs:
                    processedParentSubjectIDs.append(parentSubjectID)
            queryOptions['parentSubjectIDs'] = processedParentSubjectIDs
        
        canonicalOnly = request.GET.get('canonicalOnly')
        if canonicalOnly is not None:
            if canonicalOnly not in ('true', 'false', 'True', 'False', True, False):
                raise exceptions.InvalidArgumentException(u"Invalid value for canonicalOnly : [{canonicalOnly}] received.".format(canonicalOnly=canonicalOnly).encode('utf-8'))
            
            if canonicalOnly in ('true', 'True', True):
                canonicalOnly = True
            else:
                canonicalOnly = False
            queryOptions['canonicalOnly'] = canonicalOnly

        #',' seperated list of the creatorIDs. The returned collection will have it's creatorID from this list
        creatorIDs = request.GET.get('creatorIDs')
        if creatorIDs is not None:
            if not creatorIDs or not isinstance(creatorIDs, basestring):
                raise exceptions.InvalidArgumentException(u"Invalid creatorIDs : [{creatorIDs}] is received.".format(creatorIDs=creatorIDs).encode('utf-8'))

            actualCreatorIDs = creatorIDs
            creatorIDs = creatorIDs.split(',')
            processedCreatorIDs = []
            for creatorID in creatorIDs:
                creatorID = creatorID.strip()
                if not creatorID:
                    raise exceptions.InvalidArgumentException(u"Invalid value for creatorID : [{creatorID}] found in the received creatorIDs: [{creatorIDs}].".format(creatorID=creatorID, creatorIDs=actualCreatorIDs).encode('utf-8'))
                try :
                    creatorID=long(creatorID)
                except (ValueError, TypeError) as e:
                    raise exceptions.InvalidArgumentException(u"Invalid value for creatorID : [{creatorID}] found in the received creatorIDs: [{creatorIDs}].".format(creatorID=creatorID, creatorIDs=actualCreatorIDs).encode('utf-8'))
                if creatorID<0:
                    raise exceptions.InvalidArgumentException(u"Invalid value for creatorID : [{creatorID}] received creatorIDs: [{creatorIDs}].".format(creatorID=creatorID, creatorIDs=actualCreatorIDs).encode('utf-8'))
                if creatorID not in processedCreatorIDs:
                    processedCreatorIDs.append(creatorID)
            queryOptions['creatorIDs'] = processedCreatorIDs

        return queryOptions

    def _extractAndDefaultQueryOptionsForSearchCollections(self):
        queryOptions = {}

        query = request.GET.get('query')
        if not query or not isinstance(query, basestring):
            raise exceptions.InvalidArgumentException(u"Invalid query : [{query}] is received for the. Query is mandatory.".format(query=query,).encode('utf-8'))
        
        #prrocess the queryTerm
        if isinstance(query, unicode):
            query=query.encode('utf-8')
        
        #Remove unsafe chars
        for char in UNSAFE_CHARS_FOR_SEARCH_QUERY:
            query = query.replace(char, '')
        
        #Escape special characters
        for char in SPECIAL_CHARS_FOR_SEARCH_QUERY:
            query = query.replace(char, '\\\%s' % char)

        #Reduce Stop Words
        query = reduce(lambda x,y: x.replace(' %s '%y, ' '), [query] + STOP_WORDS_FOR_SEARCH_QUERY)
        query = query.strip().lower()
        queryOptions['query'] = query

        skip = request.GET.get('skip')
        if skip is not None:
            try :
                skip=long(skip)
            except (ValueError, TypeError) as e:
                raise exceptions.InvalidArgumentException(u"Invalid skip : [{skip}] is received.".format(skip=skip).encode('utf-8'))
            if skip < 0:
                raise exceptions.InvalidArgumentException(u"Invalid skip : [{skip}] is received.".format(skip=skip).encode('utf-8'))                
        else:
            skip = 0
        queryOptions['skip'] = skip

        limit = request.GET.get('limit')
        if limit is not None:
            try :
                limit=long(limit)
            except (ValueError, TypeError) as e:
                raise exceptions.InvalidArgumentException(u"Invalid limit : [{limit}] is received.".format(limit=limit).encode('utf-8'))
            if limit <= 0:
                raise exceptions.InvalidArgumentException(u"Invalid limit : [{limit}] is received.".format(limit=limit).encode('utf-8'))                
        else:
            limit = 10
        queryOptions['limit'] = limit


        handles = request.GET.get('handles')
        if handles is not None:
            if not handles or not isinstance(handles, basestring):
                raise exceptions.InvalidArgumentException(u"Invalid handles : [{handles}] is received.".format(handles=handles).encode('utf-8'))

            actualHandles = handles
            handles = handles.split(',')
            processedHandles = []
            for handle in handles:
                handle = self._validateAndProcessCollectionHandle(handle)
                if not handle:
                    raise exceptions.InvalidArgumentException(u"Invalid handles : [{handles}] is received.".format(handles=actualHandles).encode('utf-8'))                
                if handle not in processedHandles:
                    processedHandles.append(handle)
            queryOptions['handles'] = processedHandles

        ancestorHandles = request.GET.get('ancestorHandles')
        if ancestorHandles is not None:
            if not ancestorHandles or not isinstance(ancestorHandles, basestring):
                raise exceptions.InvalidArgumentException(u"Invalid ancestorHandles : [{ancestorHandles}] is received.".format(ancestorHandles=ancestorHandles).encode('utf-8'))

            actualAncestorHandles = ancestorHandles
            ancestorHandles = ancestorHandles.split(',')
            processedAncestorHandles = []
            for ancestorHandle in ancestorHandles:
                ancestorHandle = self._validateAndProcessCollectionHandle(ancestorHandle)
                if not ancestorHandle:
                    raise exceptions.InvalidArgumentException(u"Invalid ancestorHandles : [{ancestorHandles}] is received.".format(ancestorHandles=actualAncestorHandles).encode('utf-8'))                
                if ancestorHandle not in processedAncestorHandles:
                    processedAncestorHandles.append(ancestorHandle)
            queryOptions['ancestorHandles'] = processedAncestorHandles
        
        #',' seperated list of the creatorIDs. The returned collections will have it's creatorID from this list
        creatorIDs = request.GET.get('creatorIDs')
        if creatorIDs is not None:
            if not creatorIDs or not isinstance(creatorIDs, basestring):
                raise exceptions.InvalidArgumentException(u"Invalid creatorIDs : [{creatorIDs}] is received.".format(creatorIDs=creatorIDs).encode('utf-8'))

            actualCreatorIDs = creatorIDs
            creatorIDs = creatorIDs.split(',')
            processedCreatorIDs = []
            for creatorID in creatorIDs:
                creatorID = creatorID.strip()
                if not creatorID:
                    raise exceptions.InvalidArgumentException(u"Invalid value for creatorID : [{creatorID}] found in the received creatorIDs: [{creatorIDs}].".format(creatorID=creatorID, creatorIDs=actualCreatorIDs).encode('utf-8'))
                try :
                    creatorID=long(creatorID)
                except (ValueError, TypeError) as e:
                    raise exceptions.InvalidArgumentException(u"Invalid value for creatorID : [{creatorID}] found in the received creatorIDs: [{creatorIDs}].".format(creatorID=creatorID, creatorIDs=actualCreatorIDs).encode('utf-8'))
                if creatorID<0:
                    raise exceptions.InvalidArgumentException(u"Invalid value for creatorID : [{creatorID}] received creatorIDs: [{creatorIDs}].".format(creatorID=creatorID, creatorIDs=actualCreatorIDs).encode('utf-8'))
                if creatorID not in processedCreatorIDs:
                    processedCreatorIDs.append(creatorID)
            queryOptions['creatorIDs'] = processedCreatorIDs

        ancestorCreatorIDs = request.GET.get('ancestorCreatorIDs')
        if ancestorCreatorIDs is not None:
            if not ancestorCreatorIDs or not isinstance(ancestorCreatorIDs, basestring):
                raise exceptions.InvalidArgumentException(u"Invalid ancestorCreatorIDs : [{ancestorCreatorIDs}] is received.".format(ancestorCreatorIDs=ancestorCreatorIDs).encode('utf-8'))

            actualAncestorCreatorIDs = ancestorCreatorIDs
            ancestorCreatorIDs = ancestorCreatorIDs.split(',')
            processedAncestorCreatorIDs = []
            for ancestorCreatorID in ancestorCreatorIDs:
                ancestorCreatorID = ancestorCreatorID.strip()
                if not ancestorCreatorID:
                    raise exceptions.InvalidArgumentException(u"Invalid value for ancestorCreatorID : [{ancestorCreatorID}] found in the received ancestorCreatorIDs: [{ancestorCreatorIDs}].".format(ancestorCreatorID=ancestorCreatorID, ancestorCreatorIDs=actualAncestorCreatorIDs).encode('utf-8'))
                try :
                    ancestorCreatorID=long(ancestorCreatorID)
                except (ValueError, TypeError) as e:
                    raise exceptions.InvalidArgumentException(u"Invalid value for ancestorCreatorID : [{ancestorCreatorID}] found in the received ancestorCreatorIDs: [{ancestorCreatorIDs}].".format(ancestorCreatorID=ancestorCreatorID, ancestorCreatorIDs=actualAncestorCreatorIDs).encode('utf-8'))
                if ancestorCreatorID<0:
                    raise exceptions.InvalidArgumentException(u"Invalid value for ancestorCreatorID : [{ancestorCreatorID}] received ancestorCreatorIDs: [{ancestorCreatorIDs}].".format(ancestorCreatorID=ancestorCreatorID, ancestorCreatorIDs=actualAncestorCreatorIDs).encode('utf-8'))
                if ancestorCreatorID not in processedAncestorCreatorIDs:
                    processedAncestorCreatorIDs.append(ancestorCreatorID)
            queryOptions['ancestorCreatorIDs'] = processedAncestorCreatorIDs

        canonicalOnly = request.GET.get('canonicalOnly')
        if canonicalOnly is not None:
            if canonicalOnly not in ('true', 'false', 'True', 'False', True, False):
                raise exceptions.InvalidArgumentException(u"Invalid value for canonicalOnly : [{canonicalOnly}] received.".format(canonicalOnly=canonicalOnly).encode('utf-8'))
            
            if canonicalOnly in ('true', 'True', True):
                canonicalOnly = True
            else:
                canonicalOnly = False
            queryOptions['canonicalOnly'] = canonicalOnly

        ancestorCanonicalOnly = request.GET.get('ancestorCanonicalOnly')
        if ancestorCanonicalOnly is not None:
            if ancestorCanonicalOnly not in ('true', 'false', 'True', 'False', True, False):
                raise exceptions.InvalidArgumentException(u"Invalid value for ancestorCanonicalOnly : [{ancestorCanonicalOnly}] received.".format(ancestorCanonicalOnly=ancestorCanonicalOnly).encode('utf-8'))
            
            if ancestorCanonicalOnly in ('true', 'True', True):
                ancestorCanonicalOnly = True
            else:
                ancestorCanonicalOnly = False
            queryOptions['ancestorCanonicalOnly'] = ancestorCanonicalOnly

        publishedOnly = request.GET.get('publishedOnly')
        if publishedOnly is not None:
            if publishedOnly not in ('true', 'false', 'True', 'False', True, False):
                raise exceptions.InvalidArgumentException(u"Invalid value for publishedOnly : [{publishedOnly}] received.".format(publishedOnly=publishedOnly).encode('utf-8'))
            
            if publishedOnly in ('true', 'True', True):
                publishedOnly = True
            else:
                publishedOnly = False
            queryOptions['publishedOnly'] = publishedOnly

        ancestorPublishedOnly = request.GET.get('ancestorPublishedOnly')
        if ancestorPublishedOnly is not None:
            if ancestorPublishedOnly not in ('true', 'false', 'True', 'False', True, False):
                raise exceptions.InvalidArgumentException(u"Invalid value for ancestorPublishedOnly : [{ancestorPublishedOnly}] received.".format(ancestorPublishedOnly=ancestorPublishedOnly).encode('utf-8'))
            
            if ancestorPublishedOnly in ('true', 'True', True):
                ancestorPublishedOnly = True
            else:
                ancestorPublishedOnly = False
            queryOptions['ancestorPublishedOnly'] = ancestorPublishedOnly

        withEncodedIDOnly = request.GET.get('withEncodedIDOnly')
        if withEncodedIDOnly is not None:
            if withEncodedIDOnly not in ('true', 'false', 'True', 'False', True, False):
                raise exceptions.InvalidArgumentException(u"Invalid value for withEncodedIDOnly : [{withEncodedIDOnly}] received.".format(withEncodedIDOnly=withEncodedIDOnly).encode('utf-8'))
            
            if withEncodedIDOnly in ('true', 'True', True):
                withEncodedIDOnly = True
            else:
                withEncodedIDOnly = False
            queryOptions['withEncodedIDOnly'] = withEncodedIDOnly

        return queryOptions

    def _extractAndDefaultQueryOptionsForCollectionRetrieval(self):
        queryOptions = {}

        includeRelations = request.GET.get('includeRelations')
        if includeRelations is not None:
            if includeRelations not in ('true', 'false', 'True', 'False', True, False):
                raise exceptions.InvalidArgumentException(u"Invalid value for includeRelations : [{includeRelations}] received.".format(includeRelations=includeRelations).encode('utf-8'))
            
            if includeRelations in ('true', 'True', True):
                includeRelations = True
            else:
                includeRelations = False
            queryOptions['includeRelations'] = includeRelations

        
        maxRelationDepth = request.GET.get('maxRelationDepth')
        if maxRelationDepth is not None:
            try :
                maxRelationDepth=long(maxRelationDepth)
            except (ValueError, TypeError) as e:
                raise exceptions.InvalidArgumentException(u"Invalid value for maxRelationDepth : [{maxRelationDepth}] received.".format(maxRelationDepth=maxRelationDepth).encode('utf-8'))
            if maxRelationDepth<=0:
                raise exceptions.InvalidArgumentException(u"Invalid value for maxRelationDepth : [{maxRelationDepth}] received.".format(maxRelationDepth=maxRelationDepth).encode('utf-8'))
            queryOptions['maxRelationDepth'] = maxRelationDepth

        includeCanonicalCollectionsInfo = request.GET.get('includeCanonicalCollectionsInfo')
        if includeCanonicalCollectionsInfo is not None:
            if includeCanonicalCollectionsInfo not in ('true', 'false', 'True', 'False', True, False):
                raise exceptions.InvalidArgumentException(u"Invalid value for includeCanonicalCollectionsInfo : [{includeCanonicalCollectionsInfo}] received.".format(includeCanonicalCollectionsInfo=includeCanonicalCollectionsInfo).encode('utf-8'))
            
            if includeCanonicalCollectionsInfo in ('true', 'True', True):
                includeCanonicalCollectionsInfo = True
            else:
                includeCanonicalCollectionsInfo = False
            queryOptions['includeCanonicalCollectionsInfo'] = includeCanonicalCollectionsInfo

        includeTaxonomyComposistionsInfo = request.GET.get('includeTaxonomyComposistionsInfo')
        if includeTaxonomyComposistionsInfo is not None:
            if includeTaxonomyComposistionsInfo not in ('true', 'false', 'True', 'False', True, False):
                raise exceptions.InvalidArgumentException(u"Invalid value for includeTaxonomyComposistionsInfo : [{includeTaxonomyComposistionsInfo}] received.".format(includeTaxonomyComposistionsInfo=includeTaxonomyComposistionsInfo).encode('utf-8'))
            
            if includeTaxonomyComposistionsInfo in ('true', 'True', True):
                includeTaxonomyComposistionsInfo = True
            else:
                includeTaxonomyComposistionsInfo = False
            queryOptions['includeTaxonomyComposistionsInfo'] = includeTaxonomyComposistionsInfo

        considerCollectionDescendantsWithEncodedIDForTraversal = request.GET.get('considerCollectionDescendantsWithEncodedIDForTraversal')
        if considerCollectionDescendantsWithEncodedIDForTraversal is not None:
            if considerCollectionDescendantsWithEncodedIDForTraversal not in ('true', 'false', 'True', 'False', True, False):
                raise exceptions.InvalidArgumentException(u"Invalid value for considerCollectionDescendantsWithEncodedIDForTraversal : [{considerCollectionDescendantsWithEncodedIDForTraversal}] received.".format(considerCollectionDescendantsWithEncodedIDForTraversal=considerCollectionDescendantsWithEncodedIDForTraversal).encode('utf-8'))
            
            if considerCollectionDescendantsWithEncodedIDForTraversal in ('true', 'True', True):
                considerCollectionDescendantsWithEncodedIDForTraversal = True
            else:
                considerCollectionDescendantsWithEncodedIDForTraversal = False
            queryOptions['considerCollectionDescendantsWithEncodedIDForTraversal'] = considerCollectionDescendantsWithEncodedIDForTraversal

        return queryOptions

    @dec2.responsify()
    @dec1.checkAuth(throwbackException=True)
    def createCollection(self, member):
        self._validateRequestMethod(('POST'))
        self._validateContentType('application/json')
        memberDict = self._constructMemberDict(member)
        
        #validate collectionData and other details in it
        collectionData = request.body
        try:
            collectionDict = json.loads(collectionData)
        except (ValueError, TypeError) as e:
            raise exceptions.InvalidArgumentException(u"Invalid collection : [{collection}] received in the request parameters. A valid JSON is expected.".format(collection=collectionData).encode('utf-8'))
        collectionDict = self._validateAndProcessCollectionDict(collectionDict)

        collectionDict = self.businessLogic.createCollection(memberDict, collectionDict)
        responseDict = {'collection':collectionDict}
        return responseDict

    @dec2.responsify()
    def getPublishedCollections(self):
        self._validateRequestMethod(('GET'))
        queryOptions = self._extractAndDefaultQueryOptionsForPublishedCollections()
        publishedCollectionDictList = self.businessLogic.getPublishedCollections(queryOptions)
        responseDict = {'collections':publishedCollectionDictList}
        return responseDict

    @dec2.responsify()
    def searchCollections(self):
        self._validateRequestMethod(('GET'))
        queryOptions = self._extractAndDefaultQueryOptionsForSearchCollections()
        collectionDictList = self.businessLogic.searchCollections(queryOptions)
        responseDict = {'collections':collectionDictList}
        return responseDict

    @dec2.responsify(argNames=['collectionHandle', 'collectionCreatorID', 'collectionDescendantIdentifier', 'absoluteCollectionDescendantHandle'])
    def getCollectionByHandleCreatorIDAndDescendantIdentifierOrHandle(self, collectionHandle, collectionCreatorID=None, collectionDescendantIdentifier=None, absoluteCollectionDescendantHandle=None):
        self._validateRequestMethod(('GET'))
        collectionHandle = self._validateAndProcessCollectionHandle(collectionHandle)
        collectionCreatorID = self._validateAndProcessCollectionCreatorID(collectionCreatorID)
        if collectionCreatorID is None:
            collectionCreatorID = self._extractAndDefaultCollectionCreatorID()
        collectionDescendantIdentifier = self._validateAndProcessCollectionDescendantIdentifier(collectionDescendantIdentifier)
        
        collectionDescendantHandle = None
        if absoluteCollectionDescendantHandle:
            absoluteCollectionDescendantHandle = self._validateAndProcessCollectionHandle(absoluteCollectionDescendantHandle)
            collectionDescendantHandle = self._validateAndAppendRootNonRootCollectionHandles(collectionHandle, absoluteCollectionDescendantHandle)
        
        queryOptions = self._extractAndDefaultQueryOptionsForCollectionRetrieval()
        collectionDict = self.businessLogic.getCollectionByHandleCreatorIDAndDescendantIdentifierOrHandle(collectionHandle, collectionCreatorID, collectionDescendantIdentifier, collectionDescendantHandle, queryOptions)
        responseDict = {'collection':collectionDict}
        return responseDict

    @dec2.responsify(argNames=['collectionHandle'])
    @dec1.checkAuth(argNames=['collectionHandle'], throwbackException=True)
    def deleteCollection(self, member, collectionHandle):
        self._validateRequestMethod(('DELETE'))
        memberDict = self._constructMemberDict(member)
        collectionHandle = self._validateAndProcessCollectionHandle(collectionHandle)
        collectionDict = self.businessLogic.deleteCollection(memberDict, collectionHandle)
        responseDict = {'collection':collectionDict}
        return responseDict
