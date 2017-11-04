from sts.model import api
from sts.model import exceptions
from py2neo import neo4j, rel, cypher, node as neo_node
import operator

COLLECTION_NODE_INDEX_NAME = "Collection"
COLLECTION_CONTAINS_RELATION_INDEX_NAME = "Collection-contains"
COLLECTION_NODE_SEARCHABLE_PROPERTIES_LIST = ['title', 'description', 'encodedID', 'handle', 'absoluteHandle']

HANDLE_IDENTIFIERS_SEPARATOR = '-::-'
COLLECTION_NODE_RELATIONS_MAX_DEPTH=10

COLLECTION_NODE_TYPE = 'Collection'
COLLECTION_CONTAINS_RELATION_NAME = 'contains'

TAXONOMY_CONCEPT_NODE_INDEX_NAME = 'concept'
TAXONOMY_SUBJECT_NODE_INDEX_NAME = 'subject'
TAXONOMY_BRANCH_NODE_INDEX_NAME = 'branch'

TAXONOMY_CONCEPT_NODE_TYPE = 'concept'
TAXONOMY_BRANCH_NODE_TYPE = 'branch'
TAXONOMY_SUBJECT_NODE_TYPE = 'subject'

graphDB = api.graph_db
collectionNodeIndex = graphDB.get_or_create_index(neo4j.Node, COLLECTION_NODE_INDEX_NAME)
collectionContainsRelationIndex = graphDB.get_or_create_index(neo4j.Relationship, COLLECTION_CONTAINS_RELATION_INDEX_NAME)

class CollectionDataModel(object):

    def _validateAndSeparateRootNonRootCollectionHandles(self, handle, includeSeparatorValidation=True):
        if not isinstance(handle, basestring) or (includeSeparatorValidation and handle.count(HANDLE_IDENTIFIERS_SEPARATOR) != 1):
            raise Exception("Invalid handle: [{handle}] received. A valid string with only one occurence of handleIdentifiersSeparator:[{handleIdentifiersSeparator}] is expected.".format(handle=handle, handleIdentifiersSeparator=HANDLE_IDENTIFIERS_SEPARATOR))
        return handle.split(HANDLE_IDENTIFIERS_SEPARATOR)

    def _generateCollectionDescendantIdentifierFromCollectionDescendantHandle(self, collectionNode, collectionDescendantHandle, pathDepth=COLLECTION_NODE_RELATIONS_MAX_DEPTH):
        if not collectionNode or not isinstance(collectionNode, neo4j.Node):
            raise exceptions.InvalidArgumentException("Invalid collectionNode : [{collectionNode}] received.".format(collectionNode=collectionNode))
        if not collectionNode.__uri__ or collectionNode.__uri__.base != graphDB.__uri__.base:
            raise exceptions.InvalidArgumentException("Given collectionNode : [{collectionNode}] is not attached to the current graphDB".format(collectionNode=collectionNode))
        collectionHandle, absoluteCollectionDescendantHandle = self._validateAndSeparateRootNonRootCollectionHandles(collectionDescendantHandle)
        
        #if the nodeID is present, use it to directly identify the node.
        descendantCollectionNodeQuery = "START collectionNode=Node("+str(collectionNode.id)+"), descendantCollectionNode=node:"+COLLECTION_NODE_INDEX_NAME+"(' handle:"+collectionDescendantHandle.replace('-', '\\\\-').replace(':', '\\\\:').lower()+" ') MATCH path=(collectionNode)-[collectionContainsRelations:"+COLLECTION_CONTAINS_RELATION_NAME+"*1.."+str(pathDepth)+"]->(descendantCollectionNode) RETURN collectionNode, collectionContainsRelations, descendantCollectionNode"
        descendantCollectionNodeQueryResults = cypher.execute(graphDB, descendantCollectionNodeQuery)

        if descendantCollectionNodeQueryResults and isinstance(descendantCollectionNodeQueryResults[0], list) and len(descendantCollectionNodeQueryResults[0])>0:
            descendantCollectionNodeQueryResults = descendantCollectionNodeQueryResults[0]
            if len(descendantCollectionNodeQueryResults) == 1:
                descendantCollectionNodeQueryResult = descendantCollectionNodeQueryResults[0]
                collectionContainsRelations = descendantCollectionNodeQueryResult[1]
                
                if len(collectionContainsRelations) == 0:
                    raise exceptions.SystemDataException("Empty relations path encountered when processing the given absoluteCollectionDescendantHandle : [{absoluteCollectionDescendantHandle}] under the current collection.".format(absoluteCollectionDescendantHandle=absoluteCollectionDescendantHandle))                            

                collectionContainsRelationSequences = []
                for collectionContainsRelation in collectionContainsRelations:
                    collectionContainsRelationProperties = collectionContainsRelation._properties
                    if not collectionContainsRelationProperties:
                        collectionContainsRelationProperties = collectionContainsRelation.get_properties()
                    collectionContainsRelationSequence = collectionContainsRelationProperties.get('sequence')
                    if not isinstance(collectionContainsRelationSequence, int):
                        raise exceptions.SystemDataException("Invalid collectionContainsRelationSequence : [{collectionContainsRelationSequence}] encountered when processing the given absoluteCollectionDescendantHandle : [{absoluteCollectionDescendantHandle}] under the current collection.".format(collectionContainsRelationSequence=collectionContainsRelationSequence, absoluteCollectionDescendantHandle=absoluteCollectionDescendantHandle))                            
                    collectionContainsRelationSequences.append(collectionContainsRelationSequence)
                
                return collectionContainsRelationSequences
            else:
                raise exceptions.SystemDataException("Multiple descendants with the given absoluteCollectionDescendantHandle : [{absoluteCollectionDescendantHandle}] are found under the current collection.".format(absoluteCollectionDescendantHandle=absoluteCollectionDescendantHandle))                            
        else:
            raise exceptions.InvalidArgumentException("Descendant with the given absoluteCollectionDescendantHandle : [{absoluteCollectionDescendantHandle}] could not be found under the current collection.".format(absoluteCollectionDescendantHandle=absoluteCollectionDescendantHandle))            

    def _buildNodeGraph(self, node, pathDepth=COLLECTION_NODE_RELATIONS_MAX_DEPTH):
        if not node or not isinstance(node, neo4j.Node):
            raise exceptions.InvalidArgumentException("Invalid node : [{node}] received.".format(node=node))
        if not node.__uri__ or node.__uri__.base != graphDB.__uri__.base:
            raise exceptions.InvalidArgumentException("Given node : [{node}] is not attached to the current graphDB".format(node=node))

        nodeGraph ={}
        #Since we currently don't have relationshipsIndex, this is the only way.
        #But since this query is having the starting nodeID - it should not have any performance issues.
        nodeGraphQueryParams = {'nodeID' : node.id}
        nodeGraphQuery = "START node=Node({nodeID}) MATCH path=(node)-[relations*0.."+str(pathDepth)+"]->(relatedNode) RETURN node, relations, relatedNode ORDER BY length(path) ASC"
        nodeGraphQueryResults = cypher.execute(graphDB, nodeGraphQuery, nodeGraphQueryParams)
        if nodeGraphQueryResults and nodeGraphQueryResults[0] and isinstance(nodeGraphQueryResults[0], list):
            relationInfoMap = {}
            for nodeGraphQueryResult in nodeGraphQueryResults[0]:
                node = nodeGraphQueryResult[0]
                nodeRelations = nodeGraphQueryResult[1]
                nodeRelatedNode = nodeGraphQueryResult[2]

                if nodeRelations:
                    nodeRelation = nodeRelations[len(nodeRelations)-1]
                    for index, nodeRelation in enumerate(nodeRelations):
                        if index != len(nodeRelations)-1:
                            node = relationInfoMap.get(nodeRelation)[1]
                    relationInfoMap[nodeRelation] = (node, nodeRelatedNode)
                    
                    if node not in nodeGraph:
                        nodeGraph[node] = []
                    nodeGraph[node].append((nodeRelation, nodeRelatedNode))
        return nodeGraph       

    def _buildCollectionNodeGraph(self, collectionNode, collectionRelationType=COLLECTION_CONTAINS_RELATION_NAME):
        collectionNodeGraph = {}
        nodeGraph = self._buildNodeGraph(collectionNode)
        for node in nodeGraph:
            nodeProperties = node._properties
            if not nodeProperties:
                nodeProperties = node.get_properties()

            nodeRelationInfos = nodeGraph.get(node)
            for nodeRelationInfo in nodeRelationInfos:
                nodeRelation, nodeRelatedNode = nodeRelationInfo
                if nodeRelation.type == collectionRelationType:
                    nodeRelationProperties = nodeRelation._properties
                    if not nodeRelationProperties:
                        nodeRelationProperties = nodeRelation.get_properties()
                    
                    if node not in collectionNodeGraph:
                        collectionNodeGraph[node] = {}
                    
                    nodeSequence = nodeRelationProperties.get('sequence')
                    if nodeSequence:
                        if nodeSequence not in collectionNodeGraph[node]:
                            collectionNodeGraph[node][nodeSequence] = nodeRelatedNode
                        else:
                            raise exceptions.SystemDataException("Multiple descendants with the given sequence: [{sequence}] are found in the database for the collectionNode with handle : [{collectionHandle}] by the memberID: [{collectionCreatorID}].".format(sequence=nodeSequence, collectionHandle=nodeProperties.get('handle'), collectionCreatorID=nodeProperties.get('creatorID')))
                    else:
                        raise exceptions.SystemDataException("Descendant with the no sequence information is found under the collectionNode with handle : [{collectionHandle}] by the memberID: [{collectionCreatorID}].".format(collectionHandle=nodeProperties.get('handle'), collectionCreatorID=nodeProperties.get('creatorID')))

        return collectionNodeGraph, nodeGraph

    def _isNodePartOfCanonicalCollection(self, node):
        if not node or not isinstance(node, neo4j.Node):
            raise exceptions.InvalidArgumentException("Invalid node : [{node}] received.".format(node=node))
        if not node.__uri__ or node.__uri__.base != graphDB.__uri__.base:
            raise exceptions.InvalidArgumentException("Given node : [{node}] is not attached to the current graphDB".format(node=node))

        isNodePartOfCanonicalCollection = False
        canonicalParentsQuery = "START node=Node("+str(node.id)+"), parentNode=node:"+COLLECTION_NODE_INDEX_NAME+"(' isCanonical:true ') MATCH path=(parentNode)-[relations*0.."+str(COLLECTION_NODE_RELATIONS_MAX_DEPTH)+"]->(node) RETURN DISTINCT(parentNode)"
        canonicalParentsQueryResults = cypher.execute(graphDB, canonicalParentsQuery)
        if canonicalParentsQueryResults and canonicalParentsQueryResults[0] and isinstance(canonicalParentsQueryResults[0], list) and len(canonicalParentsQueryResults[0]) > 0:
            isNodePartOfCanonicalCollection = True

        return isNodePartOfCanonicalCollection

    def _extractEncodedIDsFromNodeDict(self, nodeDict, encodedIDs=None):
        if not isinstance(nodeDict, dict):
            raise exceptions.InvalidArgumentException("Invalid nodeDict : [{nodeDict}] received.".format(nodeDict=nodeDict))
        
        if encodedIDs is None:
            encodedIDs = []
        if nodeDict:
            for key, value in nodeDict.items():
                if isinstance(value, list):
                    valueList = value
                    for value in valueList:
                        if isinstance(value, dict):
                            self._extractEncodedIDsFromNodeDict(value, encodedIDs)
                elif isinstance(value, dict):
                    self._extractEncodedIDsFromNodeDict(value, encodedIDs)
            
            encodedID = nodeDict.get('encodedID')
            if encodedID and encodedID not in encodedIDs:
                encodedIDs.append(encodedID)
        return encodedIDs

    def _attachInfoToEncodedIDs(self, nodeDict, encodedIDInfoMap, infoKey, includeParentKeys=None):
        if not isinstance(nodeDict, dict):
            raise exceptions.InvalidArgumentException("Invalid nodeDict : [{nodeDict}] received.".format(nodeDict=nodeDict))

        if not isinstance(encodedIDInfoMap, dict):
            raise exceptions.InvalidArgumentException("Invalid encodedIDInfoMap : [{encodedIDInfoMap}] received.".format(encodedIDInfoMap=encodedIDInfoMap))

        if not infoKey or not isinstance(infoKey, basestring):
            raise exceptions.InvalidArgumentException("Invalid infoKey : [{infoKey}] received.".format(infoKey=infoKey))

        if includeParentKeys is None:
            includeParentKeys = []

        if nodeDict and encodedIDInfoMap:
            for key, value in nodeDict.items():
                if key in includeParentKeys:
                    if isinstance(value, list):
                        valueList = value
                        for value in valueList:
                            if isinstance(value, dict):
                                self._attachInfoToEncodedIDs(value, encodedIDInfoMap, infoKey, includeParentKeys)
                    elif isinstance(value, dict):
                        self._attachInfoToEncodedIDs(value, encodedIDInfoMap, infoKey, includeParentKeys)

            encodedID = nodeDict.get('encodedID')   
            if encodedID in encodedIDInfoMap:
                nodeDict[infoKey] = encodedIDInfoMap.get(encodedID)

    def _buildCanonicalCollectionsInfoMapForEncodedIDs(self, encodedIDs):
        if not isinstance(encodedIDs, list):
            raise exceptions.InvalidArgumentException("Invalid encodedIDs : [{encodedIDs}] received.".format(encodedIDs=encodedIDs))
        
        encodedIDCanonicalCollectionsInfoMap = {}
        if encodedIDs:
            
            #START Part & Nodes selection
            canonicalCollectionsQuery =  "START node=node:"+COLLECTION_NODE_INDEX_NAME+"(' isRoot:true AND isCanonical:true AND isPublished:true' ), "
            canonicalCollectionsQuery = canonicalCollectionsQuery+ "relatedNode=node:"+COLLECTION_NODE_INDEX_NAME+"(' "
            isFirstQueryPartForQueryOption = True
            for encodedID in encodedIDs: 
                if not isFirstQueryPartForQueryOption:
                    canonicalCollectionsQuery = canonicalCollectionsQuery + "OR "
                canonicalCollectionsQuery = canonicalCollectionsQuery + "encodedID:"+encodedID.lower() + " "
                if isFirstQueryPartForQueryOption:
                    isFirstQueryPartForQueryOption = False
            canonicalCollectionsQuery = canonicalCollectionsQuery+"') "

            #Match Part
            canonicalCollectionsQuery = canonicalCollectionsQuery+"MATCH (node)-[relation*0.."+str(COLLECTION_NODE_RELATIONS_MAX_DEPTH)+"]->(relatedNode) "
            
            #RETURN PART
            canonicalCollectionsQuery = canonicalCollectionsQuery + "RETURN node, relatedNode"

            canonicalCollectionsQueryResults = cypher.execute(graphDB, canonicalCollectionsQuery)
            if canonicalCollectionsQueryResults and canonicalCollectionsQueryResults[0]:
                for canonicalCollectionsQueryResult in canonicalCollectionsQueryResults[0]:
                    canonicalCollectionRootNode = canonicalCollectionsQueryResult[0]
                    canonicalCollectionInternalNode = canonicalCollectionsQueryResult[1]
                    
                    canonicalCollectionInternalNodeProperties = canonicalCollectionInternalNode._properties
                    if not canonicalCollectionInternalNodeProperties:
                        canonicalCollectionInternalNodeProperties = canonicalCollectionInternalNode.get_properties()
                    canonicalCollectionRootNodeProperties = canonicalCollectionRootNode._properties
                    if not canonicalCollectionRootNodeProperties:
                        canonicalCollectionRootNodeProperties = canonicalCollectionRootNode.get_properties()

                    encodedID = canonicalCollectionInternalNodeProperties.get('encodedID')
                    descendantHandle = canonicalCollectionInternalNodeProperties.get('handle')
                    rootHandle = canonicalCollectionRootNodeProperties.get('handle')                
                    if encodedID:
                        if encodedID not in encodedIDCanonicalCollectionsInfoMap:
                            encodedIDCanonicalCollectionsInfoMap[encodedID] = {}

                        if rootHandle:
                            if rootHandle not in encodedIDCanonicalCollectionsInfoMap[encodedID]:
                                encodedIDCanonicalCollectionsInfoMap[encodedID][rootHandle] = self._generateNodeDict(canonicalCollectionRootNode)
                            
                            if descendantHandle and descendantHandle != rootHandle:
                                if 'descendantInfos' not in encodedIDCanonicalCollectionsInfoMap[encodedID][rootHandle]:
                                    encodedIDCanonicalCollectionsInfoMap[encodedID][rootHandle][u'descendantInfos'] = {}
                                if descendantHandle not in encodedIDCanonicalCollectionsInfoMap[encodedID][rootHandle]['descendantInfos']:
                                    encodedIDCanonicalCollectionsInfoMap[encodedID][rootHandle]['descendantInfos'][descendantHandle] = self._generateNodeDict(canonicalCollectionInternalNode)

            for encodedID in encodedIDCanonicalCollectionsInfoMap:
                for rootHandle in encodedIDCanonicalCollectionsInfoMap[encodedID]:
                    if 'descendantInfos' in encodedIDCanonicalCollectionsInfoMap[encodedID][rootHandle]:
                        encodedIDCanonicalCollectionsInfoMap[encodedID][rootHandle][u'descendantInfos'] = [encodedIDCanonicalCollectionsInfoMap[encodedID][rootHandle]['descendantInfos'][descendantHandle] for descendantHandle in encodedIDCanonicalCollectionsInfoMap[encodedID][rootHandle]['descendantInfos']]
                encodedIDCanonicalCollectionsInfoMap[encodedID] = [ encodedIDCanonicalCollectionsInfoMap[encodedID][rootHandle] for rootHandle in encodedIDCanonicalCollectionsInfoMap[encodedID]]        
        return encodedIDCanonicalCollectionsInfoMap

    def _buildTaxonomyCompositionsInfoMapForEncodedIDs(self, encodedIDs):
        if not isinstance(encodedIDs, list):
            raise exceptions.InvalidArgumentException("Invalid encodedIDs : [{encodedIDs}] received.".format(encodedIDs=encodedIDs))
        
        encodedIDTaxonomyCompositionsInfoMap = {}
        if encodedIDs:
            
            #START & Nodes Selection Part            
            taxonomyCompositionsQuery = "START conceptNode=node:"+TAXONOMY_CONCEPT_NODE_INDEX_NAME+"(' status:published AND ( "
            isFirstQueryPartForQueryOption = True
            for encodedID in encodedIDs: 
                if not isFirstQueryPartForQueryOption:
                    taxonomyCompositionsQuery = taxonomyCompositionsQuery + "OR "
                taxonomyCompositionsQuery = taxonomyCompositionsQuery + "encodedID:"+encodedID.lower() + " "
                if isFirstQueryPartForQueryOption:
                    isFirstQueryPartForQueryOption = False
            taxonomyCompositionsQuery = taxonomyCompositionsQuery+") '), "            
            taxonomyCompositionsQuery = taxonomyCompositionsQuery+"branchNode=node:"+TAXONOMY_BRANCH_NODE_INDEX_NAME+"( '*:*' ), "
            taxonomyCompositionsQuery = taxonomyCompositionsQuery+"subjectNode=node:"+TAXONOMY_SUBJECT_NODE_INDEX_NAME+"( '*:*' ) "
            
            #MATCH Part
            taxonomyCompositionsQuery = taxonomyCompositionsQuery + "MATCH (subjectNode)-[:contains]->(branchNode)-[:contains]->(conceptNode) "
            
            #Return Part
            taxonomyCompositionsQuery = taxonomyCompositionsQuery+ "RETURN subjectNode, branchNode, conceptNode"
            
            taxonomyCompositionsQueryResults = cypher.execute(graphDB, taxonomyCompositionsQuery)
            if taxonomyCompositionsQueryResults and taxonomyCompositionsQueryResults[0]:
                for taxonomyCompositionsQueryResult in taxonomyCompositionsQueryResults[0]:
                    subjectNode = taxonomyCompositionsQueryResult[0]
                    branchNode = taxonomyCompositionsQueryResult[1]
                    conceptNode = taxonomyCompositionsQueryResult[2]
                    if subjectNode and branchNode and conceptNode:
                        
                        conceptNodeProperties = conceptNode._properties
                        if not conceptNodeProperties:
                            conceptNodeProperties = conceptNode.get_properties()
                        
                        branchNodeProperties = branchNode._properties
                        if not branchNodeProperties:
                            branchNodeProperties = branchNode.get_properties()

                        subjectNodeProperties = subjectNode._properties
                        if not subjectNodeProperties:
                            subjectNodeProperties = branchNode.get_properties()                       

                        encodedID = conceptNodeProperties.get('encodedID')
                        conceptHandle = conceptNodeProperties.get('handle')
                        branchShortName = branchNodeProperties.get('shortname')
                        subjectShortName = subjectNodeProperties.get('shortname')
                        if encodedID:
                            if encodedID not in encodedIDTaxonomyCompositionsInfoMap:
                                encodedIDTaxonomyCompositionsInfoMap[encodedID] = {}

                            if subjectShortName:
                                if subjectShortName not in encodedIDTaxonomyCompositionsInfoMap[encodedID]:
                                    encodedIDTaxonomyCompositionsInfoMap[encodedID][subjectShortName] = self._generateNodeDict(subjectNode)
                                if branchShortName:
                                    if 'branches' not in encodedIDTaxonomyCompositionsInfoMap[encodedID][subjectShortName]:
                                        encodedIDTaxonomyCompositionsInfoMap[encodedID][subjectShortName]['branches'] = {}
                                    if branchShortName not in encodedIDTaxonomyCompositionsInfoMap[encodedID][subjectShortName]['branches']:
                                        encodedIDTaxonomyCompositionsInfoMap[encodedID][subjectShortName]['branches'][branchShortName] = self._generateNodeDict(branchNode)
                                    if conceptHandle:
                                            if 'concepts' not in encodedIDTaxonomyCompositionsInfoMap[encodedID][subjectShortName]['branches'][branchShortName]:
                                                encodedIDTaxonomyCompositionsInfoMap[encodedID][subjectShortName]['branches'][branchShortName]['concepts'] = {}
                                            if conceptHandle not in encodedIDTaxonomyCompositionsInfoMap[encodedID][subjectShortName]['branches'][branchShortName]['concepts']:
                                                encodedIDTaxonomyCompositionsInfoMap[encodedID][subjectShortName]['branches'][branchShortName]['concepts'][conceptHandle] = self._generateNodeDict(conceptNode)

            for encodedID in encodedIDTaxonomyCompositionsInfoMap:
                for subjectShortName in encodedIDTaxonomyCompositionsInfoMap[encodedID]:
                    if 'branches' in encodedIDTaxonomyCompositionsInfoMap[encodedID][subjectShortName]:
                        for branchShortName in encodedIDTaxonomyCompositionsInfoMap[encodedID][subjectShortName]['branches']:
                            if 'concepts' in encodedIDTaxonomyCompositionsInfoMap[encodedID][subjectShortName]['branches'][branchShortName]:
                                    encodedIDTaxonomyCompositionsInfoMap[encodedID][subjectShortName][u'branches'][branchShortName][u'concepts'] = [encodedIDTaxonomyCompositionsInfoMap[encodedID][subjectShortName]['branches'][branchShortName]['concepts'][conceptHandle] for conceptHandle in encodedIDTaxonomyCompositionsInfoMap[encodedID][subjectShortName]['branches'][branchShortName]['concepts']]
                        encodedIDTaxonomyCompositionsInfoMap[encodedID][subjectShortName][u'branches'] = [encodedIDTaxonomyCompositionsInfoMap[encodedID][subjectShortName]['branches'][branchShortName] for branchShortName in encodedIDTaxonomyCompositionsInfoMap[encodedID][subjectShortName][u'branches']]
                encodedIDTaxonomyCompositionsInfoMap[encodedID] = [ encodedIDTaxonomyCompositionsInfoMap[encodedID][subjectShortName] for subjectShortName in encodedIDTaxonomyCompositionsInfoMap[encodedID]]  
        return encodedIDTaxonomyCompositionsInfoMap 

    def _sliceNodeDict(self, nodeDict, maxRelationDepth=0):
        if nodeDict and isinstance(nodeDict, dict):
            for nodeDicyKey, nodeDictValue in nodeDict.items():
                if maxRelationDepth == 0:
                    if isinstance(nodeDictValue, dict) or isinstance(nodeDictValue, list):
                        nodeDict.pop(nodeDicyKey)
                else:
                    if isinstance(nodeDictValue, list):
                        nodeDictValues = nodeDictValue
                        for nodeDictValue in nodeDictValues:
                            if isinstance(nodeDictValue, dict):
                                self._sliceNodeDict(nodeDictValue, maxRelationDepth-1)
                    elif isinstance(nodeDictValue, dict):
                        self._sliceNodeDict(nodeDictValue, maxRelationDepth-1)

    #Constructs the dict from the nodeGraph received. (will make additional database calls only if nodeGraph is None)
    def _generateNodeDict(self, node, nodeGraph=None, **queryOptions):
        if not node or not isinstance(node, neo4j.Node):
            raise exceptions.InvalidArgumentException("Invalid node : [{node}] received.".format(node=node))
        if not node.__uri__ or node.__uri__.base != graphDB.__uri__.base:
            raise exceptions.InvalidArgumentException("Given node : [{node}] is not attached to the current graphDB".format(node=node))

        nodeDict = {}
        nodeProperties = node._properties
        if nodeProperties is None:
            nodeProperties = node.get_properties()
        if nodeProperties:
            for nodePropertyKey, nodePropertyValue in nodeProperties.items():
                nodeDict[nodePropertyKey] = nodePropertyValue
                if nodePropertyKey == 'handle':
                    nodeHandleParts = self._validateAndSeparateRootNonRootCollectionHandles(nodePropertyValue, False)
                    if len(nodeHandleParts) == 2:
                        nodeDict[u'absoluteHandle'] = nodeHandleParts[1]
        nodeDict[u'descendantEIDChildrenCount'] = 0


        includeRelations = queryOptions.get('includeRelations', False)
        if includeRelations:
            if nodeGraph is None:
                nodeGraph = self._buildNodeGraph(node)
            
            if node in nodeGraph:
                nodeRelationInfos = nodeGraph.get(node)
                for nodeRelationInfo in nodeRelationInfos:
                    nodeRelation = nodeRelationInfo[0]
                    nodeRelatedNode = nodeRelationInfo[1]
                    if nodeRelation.type not in nodeDict:
                        nodeDict[nodeRelation.type] = []
                    
                    nodeRelatedNodeDict = self._generateNodeDict(nodeRelatedNode, nodeGraph, **queryOptions)
                    nodeRelationProperties = nodeRelation._properties
                    if nodeRelationProperties is None:
                        nodeRelationProperties = nodeRelation.get_properties()
                    if nodeRelationProperties:
                        for nodeRelationPropertyKey, nodeRelationPropertyValue in nodeRelationProperties.items():
                            nodeRelatedNodeDict[nodeRelationPropertyKey] = nodeRelationPropertyValue

                    nodeDict[u'descendantEIDChildrenCount'] = nodeDict[u'descendantEIDChildrenCount']+nodeRelatedNodeDict[u'descendantEIDChildrenCount']
                    if nodeRelatedNodeDict.has_key('encodedID'):
                        nodeDict[u'descendantEIDChildrenCount'] = nodeDict[u'descendantEIDChildrenCount']+ 1  
                    nodeDict[nodeRelation.type].append(nodeRelatedNodeDict)

                #sort accordingly to 'sequence' for contains relation
                if isinstance(nodeDict.get('contains'), list):
                    nodeDict['contains'].sort(key=operator.itemgetter('sequence'), reverse=False)
        
        maxRelationDepth = queryOptions.get('maxRelationDepth', COLLECTION_NODE_RELATIONS_MAX_DEPTH)
        if maxRelationDepth:
            self._sliceNodeDict(nodeDict, maxRelationDepth)
        return nodeDict

    def _processNodeDictForAdditionalQueryOptions(self, node, nodeDict, **queryOptions):
        if not node or not isinstance(node, neo4j.Node):
            raise exceptions.InvalidArgumentException("Invalid node : [{node}] received.".format(node=node))
        if not node.__uri__ or node.__uri__.base != graphDB.__uri__.base:
            raise exceptions.InvalidArgumentException("Given node : [{node}] is not attached to the current graphDB".format(node=node))

        if not isinstance(nodeDict, dict):
            raise exceptions.InvalidArgumentException("Invalid nodeDict : [{nodeDict}] received.".format(nodeDict=nodeDict))
        
        includeCanonicalCollectionsInfo = queryOptions.get('includeCanonicalCollectionsInfo', False)
        includeTaxonomyComposistionsInfo = queryOptions.get('includeTaxonomyComposistionsInfo', False)
        isNodePartOfCanonicalCollection = self._isNodePartOfCanonicalCollection(node)
        if (includeCanonicalCollectionsInfo and not isNodePartOfCanonicalCollection) or includeTaxonomyComposistionsInfo:
            encodedIDs = self._extractEncodedIDsFromNodeDict(nodeDict)
        if includeCanonicalCollectionsInfo and not isNodePartOfCanonicalCollection:
            encodedIDCanonicalCollectionsInfoMap = self._buildCanonicalCollectionsInfoMapForEncodedIDs(encodedIDs)
            self._attachInfoToEncodedIDs(nodeDict, encodedIDCanonicalCollectionsInfoMap, 'canonicalCollectionsInfo', [COLLECTION_CONTAINS_RELATION_NAME])
        if includeTaxonomyComposistionsInfo:
            encodedIDTaxonomyCompositionsInfoMap = self._buildTaxonomyCompositionsInfoMapForEncodedIDs(encodedIDs)
            self._attachInfoToEncodedIDs(nodeDict, encodedIDTaxonomyCompositionsInfoMap, 'taxonomyComposistionsInfo', [COLLECTION_CONTAINS_RELATION_NAME])
        
        return nodeDict

    def _generateCollectionNodeDictWithDescendants(self, collectionNode, descendantCollectionNode, collectionDescendantIdentifier, nextDescendantCollectionNode, nextCollectionDescendantIdentifier, previousDescendantCollectionNode, previousCollectionDescendantIdentifier, nodeGraph, queryOptions):
        if not collectionNode or not isinstance(collectionNode, neo4j.Node):
            raise exceptions.InvalidArgumentException("Invalid collectionNode : [{collectionNode}] received.".format(collectionNode=collectionNode))
        if not collectionNode.__uri__ or collectionNode.__uri__.base != graphDB.__uri__.base:
            raise exceptions.InvalidArgumentException("Given collectionNode : [{collectionNode}] is not attached to the current graphDB".format(collectionNode=collectionNode))

        collectionNodeDict = self._generateNodeDict(collectionNode, nodeGraph=nodeGraph)
        if descendantCollectionNode:
            if not descendantCollectionNode or not isinstance(descendantCollectionNode, neo4j.Node):
                raise exceptions.InvalidArgumentException("Invalid descendantCollectionNode : [{descendantCollectionNode}] received.".format(descendantCollectionNode=descendantCollectionNode))
            if not descendantCollectionNode.__uri__ or descendantCollectionNode.__uri__.base != graphDB.__uri__.base:
                raise exceptions.InvalidArgumentException("Given descendantCollectionNode : [{descendantCollectionNode}] is not attached to the current graphDB".format(descendantCollectionNode=descendantCollectionNode))
            descendantCollectionNodeDict = self._generateNodeDict(descendantCollectionNode, nodeGraph=nodeGraph, **queryOptions)
            descendantCollectionNodeDict = self._processNodeDictForAdditionalQueryOptions(descendantCollectionNode, descendantCollectionNodeDict, **queryOptions)
            if collectionDescendantIdentifier:
                descendantCollectionNodeDict['identifier'] = '.'.join(str(i) for i in collectionDescendantIdentifier)            
            collectionNodeDict['descendantCollection'] = descendantCollectionNodeDict

        if nextDescendantCollectionNode:
            if not nextDescendantCollectionNode or not isinstance(nextDescendantCollectionNode, neo4j.Node):
                raise exceptions.InvalidArgumentException("Invalid nextDescendantCollectionNode : [{nextDescendantCollectionNode}] received.".format(nextDescendantCollectionNode=nextDescendantCollectionNode))
            if not nextDescendantCollectionNode.__uri__ or nextDescendantCollectionNode.__uri__.base != graphDB.__uri__.base:
                raise exceptions.InvalidArgumentException("Given nextDescendantCollectionNode : [{nextDescendantCollectionNode}] is not attached to the current graphDB".format(nextDescendantCollectionNode=nextDescendantCollectionNode))
            nextDescendantCollectionNodeDict = self._generateNodeDict(nextDescendantCollectionNode, nodeGraph=nodeGraph)
            if nextCollectionDescendantIdentifier:
                nextDescendantCollectionNodeDict['identifier'] = '.'.join(str(i) for i in nextCollectionDescendantIdentifier)            
            collectionNodeDict['nextDescendantCollection'] = nextDescendantCollectionNodeDict

        if previousDescendantCollectionNode:
            if not previousDescendantCollectionNode or not isinstance(previousDescendantCollectionNode, neo4j.Node):
                raise exceptions.InvalidArgumentException("Invalid previousDescendantCollectionNode : [{previousDescendantCollectionNode}] received.".format(previousDescendantCollectionNode=previousDescendantCollectionNode))
            if not previousDescendantCollectionNode.__uri__ or previousDescendantCollectionNode.__uri__.base != graphDB.__uri__.base:
                raise exceptions.InvalidArgumentException("Given previousDescendantCollectionNode : [{previousDescendantCollectionNode}] is not attached to the current graphDB".format(previousDescendantCollectionNode=previousDescendantCollectionNode))
            previousDescendantCollectionNodeDict = self._generateNodeDict(previousDescendantCollectionNode, nodeGraph=nodeGraph)
            if previousCollectionDescendantIdentifier:
                previousDescendantCollectionNodeDict['identifier'] = '.'.join(str(i) for i in previousCollectionDescendantIdentifier)            
            collectionNodeDict['previousDescendantCollection'] = previousDescendantCollectionNodeDict
        
        return collectionNodeDict

    def _generateCollectionDescendantNodesAndIdentifiers(self, collectionNode, collectionDescendantIdentifier, considerCollectionDescendantsWithEncodedIDForTraversal=False, collectionNodeGraph=None, nodeGraph=None):
        if not collectionNode or not isinstance(collectionNode, neo4j.Node):
            raise exceptions.InvalidArgumentException("Invalid collectionNode : [{collectionNode}] received.".format(collectionNode=collectionNode))
        if not collectionNode.__uri__ or collectionNode.__uri__.base != graphDB.__uri__.base:
            raise exceptions.InvalidArgumentException("Given collectionNode : [{collectionNode}] is not attached to the current graphDB".format(collectionNode=collectionNode))

        actualCollectionNode = collectionNode
        actualCollectionNodeProperties = collectionNode._properties
        if not actualCollectionNodeProperties:
            actualCollectionNodeProperties = collectionNode.get_properties() 

        if collectionNodeGraph is None or nodeGraph is None:
            collectionNodeGraph, nodeGraph = self._buildCollectionNodeGraph(collectionNode)
        
        parentCollectionNodeList = []
        parentCollectionNodeList.append(collectionNode)
        for collectionDescendantIdentifierPart in collectionDescendantIdentifier:
            if collectionDescendantIdentifierPart == 0:
                collectionNode = collectionNode
            else:
                if collectionNodeGraph.get(collectionNode) and collectionNodeGraph[collectionNode].get(collectionDescendantIdentifierPart):
                    collectionNode = collectionNodeGraph[collectionNode][collectionDescendantIdentifierPart]
                else:
                    raise exceptions.ResourceNotFoundException("Collection Descendant with the given collectionDescendantIdentifier: [{collectionDescendantIdentifier}] could not be found for the collectionNode with handle : [{collectionHandle}] by the memberID:[{collectionCreatorID}].".format(collectionDescendantIdentifier=collectionDescendantIdentifier, collectionHandle=actualCollectionNodeProperties.get('handle'), collectionCreatorID=actualCollectionNodeProperties.get('creatorID')))
            parentCollectionNodeList.append(collectionNode)
        #length of parentCollectionNodeList by here will be equal to length of collectionDescendantIdentifier+1
        
        descendantCollectionNode = collectionNode
        nextDescendantCollectionNode = None
        previousDescendantCollectionNode = None
        nextCollectionDescendantIdentifier = list(collectionDescendantIdentifier)
        previousCollectionDescendantIdentifier = list(collectionDescendantIdentifier)
        
        if descendantCollectionNode in collectionNodeGraph:
            descendantCollectionNodeSequences = collectionNodeGraph[descendantCollectionNode].keys()
            if descendantCollectionNodeSequences:
                descendantCollectionNodeMinSequence = min(descendantCollectionNodeSequences)
                nextCollectionDescendantIdentifier.append(descendantCollectionNodeMinSequence)
                nextDescendantCollectionNode = collectionNodeGraph[descendantCollectionNode][descendantCollectionNodeMinSequence]
            
        for index, collectionDescendantIdentifierPart in reversed(list(enumerate(collectionDescendantIdentifier))):
            if not nextDescendantCollectionNode or not previousDescendantCollectionNode:
                currentParentCollectionNode = parentCollectionNodeList[index]
                currentParentCollectionNodeSequences = []
                if currentParentCollectionNode in collectionNodeGraph:
                    currentParentCollectionNodeSequences = collectionNodeGraph[currentParentCollectionNode].keys()
                
                if not nextDescendantCollectionNode:
                    del nextCollectionDescendantIdentifier[index]
                    currentParentCollectionNodeNextPossibleSequences = [currentParentCollectionNodeSequence for currentParentCollectionNodeSequence in currentParentCollectionNodeSequences if currentParentCollectionNodeSequence > collectionDescendantIdentifierPart]
                    if currentParentCollectionNodeNextPossibleSequences:
                        currentParentCollectionNodeNextMinSequence = min(currentParentCollectionNodeNextPossibleSequences)
                        nextCollectionDescendantIdentifier.append(currentParentCollectionNodeNextMinSequence)
                        nextDescendantCollectionNode = collectionNodeGraph[currentParentCollectionNode][currentParentCollectionNodeNextMinSequence]
                    
                if not previousDescendantCollectionNode:
                    del previousCollectionDescendantIdentifier[index]
                    if collectionDescendantIdentifierPart-1 >= 1:
                        currentParentCollectionNodePreviousPossibleSequences = [currentParentCollectionNodeSequence for currentParentCollectionNodeSequence in currentParentCollectionNodeSequences if currentParentCollectionNodeSequence < collectionDescendantIdentifierPart]
                        if currentParentCollectionNodePreviousPossibleSequences:
                            currentParentCollectionNodePreviousMaxSequence = max(currentParentCollectionNodePreviousPossibleSequences)
                            previousCollectionDescendantIdentifier.append(currentParentCollectionNodePreviousMaxSequence)
                            previousDescendantCollectionNode = collectionNodeGraph[currentParentCollectionNode][currentParentCollectionNodePreviousMaxSequence]

                            while previousDescendantCollectionNode in collectionNodeGraph and collectionNodeGraph[previousDescendantCollectionNode].keys():
                                previousDescendantCollectionNodeSequences = collectionNodeGraph[previousDescendantCollectionNode].keys()
                                previousDescendantCollectionNodeMaxSequence = max(previousDescendantCollectionNodeSequences)
                                previousCollectionDescendantIdentifier.append(previousDescendantCollectionNodeMaxSequence)
                                previousDescendantCollectionNode = collectionNodeGraph[previousDescendantCollectionNode][previousDescendantCollectionNodeMaxSequence]
                    elif collectionDescendantIdentifierPart-1 == 0:
                        if not previousCollectionDescendantIdentifier:
                            previousCollectionDescendantIdentifier.append(0)
                        previousDescendantCollectionNode = currentParentCollectionNode

        if considerCollectionDescendantsWithEncodedIDForTraversal:
            doesNextDescendantCollectionNodeHasEncodedID = False
            while nextDescendantCollectionNode and doesNextDescendantCollectionNodeHasEncodedID is False:
                nextDescendantCollectionNodeProperties = nextDescendantCollectionNode._properties
                if not nextDescendantCollectionNodeProperties:
                    nextDescendantCollectionNodeProperties = nextDescendantCollectionNode.get_properties()
                
                if nextDescendantCollectionNodeProperties.get('encodedID'):
                    doesNextDescendantCollectionNodeHasEncodedID = True
                else:
                    collectionDescendantNodesAndIdentifiers = self._generateCollectionDescendantNodesAndIdentifiers(actualCollectionNode, nextCollectionDescendantIdentifier, collectionNodeGraph=collectionNodeGraph, nodeGraph=nodeGraph)
                    nextDescendantCollectionNode, nextCollectionDescendantIdentifier =  collectionDescendantNodesAndIdentifiers[2], collectionDescendantNodesAndIdentifiers[3]

            doesPreviousDescendantCollectionNodeHasEncodedID = False
            while previousDescendantCollectionNode and doesPreviousDescendantCollectionNodeHasEncodedID is False:
                previousDescendantCollectionNodeProperties = previousDescendantCollectionNode._properties
                if not previousDescendantCollectionNodeProperties:
                    previousDescendantCollectionNodeProperties = previousDescendantCollectionNode.get_properties()

                if previousDescendantCollectionNodeProperties.get('encodedID'):
                    doesPreviousDescendantCollectionNodeHasEncodedID = True
                else:
                    collectionDescendantNodesAndIdentifiers = self._generateCollectionDescendantNodesAndIdentifiers(actualCollectionNode, previousCollectionDescendantIdentifier, collectionNodeGraph=collectionNodeGraph, nodeGraph=nodeGraph)
                    previousDescendantCollectionNode, previousCollectionDescendantIdentifier = collectionDescendantNodesAndIdentifiers[4], collectionDescendantNodesAndIdentifiers[5]

        return descendantCollectionNode, collectionDescendantIdentifier, nextDescendantCollectionNode, nextCollectionDescendantIdentifier, previousDescendantCollectionNode, previousCollectionDescendantIdentifier, nodeGraph

    def _constructCollectionNodesAndRelations(self, memberDict, collectionDict, collectionIsRoot=False, collectionNodes=None, collectionRelations=None):
        if collectionNodes is None:
            collectionNodes = []
        if collectionRelations is None:
            collectionRelations = []

        collectionHandle = collectionDict.get('handle')
        collectionCreatorID = memberDict.get('memberID')

        #create a CollectionNode
        collectionNodeProperties = {}
        collectionNodeProperties['handle'] = collectionHandle
        collectionNodeProperties['creatorID'] = collectionCreatorID
        collectionNodeProperties['type'] = COLLECTION_NODE_TYPE
        if collectionIsRoot:
            collectionNodeProperties['isRoot'] = collectionIsRoot
            collectionIsPublished = collectionDict.get('isPublished')
            if collectionIsPublished:
                collectionNodeProperties['isPublished'] = collectionIsPublished
            
            collectionCanonicalID = collectionDict.get('canonicalID')
            if collectionCanonicalID:
                collectionNodeProperties['canonicalID'] = collectionCanonicalID
                collectionNodeProperties['isCanonical'] = True

            collectionParentSubjectID = collectionDict.get('parentSubjectID')
            if collectionParentSubjectID:
                collectionNodeProperties['parentSubjectID'] = collectionParentSubjectID
        
        collectionTitle = collectionDict.get('title')
        if collectionTitle:
            collectionNodeProperties['title'] = collectionTitle

        collectionDescription = collectionDict.get('description')
        if collectionDescription:
            collectionNodeProperties['description'] = collectionDescription

        collectionCountry = collectionDict.get('country')
        if collectionCountry:
            collectionNodeProperties['country'] = collectionCountry

        collectionEncodedID = collectionDict.get('encodedID')
        if collectionEncodedID:
            collectionNodeProperties['encodedID'] = collectionEncodedID

        collectionLevel = collectionDict.get('level')
        if collectionLevel is not None:
            collectionNodeProperties['level'] = collectionLevel

        collectionPreviewEID = collectionDict.get('previewEID')
        if collectionPreviewEID:
            collectionNodeProperties['previewEID'] = collectionPreviewEID

        collectionPreviewImageUrl = collectionDict.get('previewImageUrl')
        if collectionPreviewImageUrl:
            collectionNodeProperties['previewImageUrl'] = collectionPreviewImageUrl


        collectionPreviewIconUrl = collectionDict.get('previewIconUrl')
        if collectionPreviewIconUrl:
            collectionNodeProperties['previewIconUrl'] = collectionPreviewIconUrl   

        collectionNode = neo_node(**collectionNodeProperties)
        collectionNodes.append(collectionNode)
        collectionNodeIndex = len(collectionNodes)-1

        containedCollections = collectionDict.get('contains')
        if containedCollections:
            for containedCollection in containedCollections:
                containedCollectionNodeIndex, collectionNodes, collectionRelations = self._constructCollectionNodesAndRelations(memberDict, containedCollection, collectionNodes=collectionNodes, collectionRelations=collectionRelations)

                containedRelationProperties = {}
                containedCollectionNodeSequence = containedCollection.get('sequence')
                containedRelationProperties['sequence'] = containedCollectionNodeSequence
                
                collectionRelations.append(rel(collectionNodeIndex, COLLECTION_CONTAINS_RELATION_NAME, containedCollectionNodeIndex, **containedRelationProperties))

        return collectionNodeIndex, collectionNodes, collectionRelations

    #The query is assumed to have one return value which is the node that needs to be processed for image/icon Urls.
    def _populateCollectionPreviewImageIconUrlMap(self, collectionPreviewNodeSearchQuery, propertyToConsider, collectionPreviewEIDImageIconUrlMap=None, performUniqueExistenceCheck=True):
        if collectionPreviewEIDImageIconUrlMap is None:
            collectionPreviewEIDImageIconUrlMap = {}

        collectionPreviewNodeSearchQueryResults = cypher.execute(graphDB, collectionPreviewNodeSearchQuery)
        if collectionPreviewNodeSearchQueryResults and collectionPreviewNodeSearchQueryResults[0]:
            for collectionPreviewNodeSearchQueryResult in collectionPreviewNodeSearchQueryResults[0]:        
                collectionPreviewNode = collectionPreviewNodeSearchQueryResult[0]
                collectionPreviewNodeProperties = collectionPreviewNode._properties
                if not collectionPreviewNodeProperties:
                    collectionPreviewNodeProperties = collectionPreviewNode.get_properties()
                if collectionPreviewNodeProperties and propertyToConsider in collectionPreviewNodeProperties:
                    collectionPreviewEIDs = collectionPreviewNodeProperties.get(propertyToConsider)
                    collectionPreviewImageUrl = collectionPreviewNodeProperties.get('previewImageUrl')
                    collectionPreviewIconUrl = collectionPreviewNodeProperties.get('previewIconUrl')                        
                    if isinstance(collectionPreviewEIDs, list):
                        for collectionPreviewEID in collectionPreviewEIDs:
                            if collectionPreviewEID not in collectionPreviewEIDImageIconUrlMap:
                                collectionPreviewEIDImageIconUrlMap[collectionPreviewEID] = (collectionPreviewImageUrl, collectionPreviewIconUrl)    
                            else:
                                if performUniqueExistenceCheck:
                                    raise exceptions.SystemDataException("Multiple concept nodes are found for the given collectionPreviewEID: [{collectionPreviewEID}] in the database.".format(collectionPreviewEID=collectionPreviewEID))
                    else:
                        collectionPreviewEID = collectionPreviewEIDs
                        if collectionPreviewEID not in collectionPreviewEIDImageIconUrlMap:
                            collectionPreviewEIDImageIconUrlMap[collectionPreviewEID] = (collectionPreviewImageUrl, collectionPreviewIconUrl)    
                        else:
                            if performUniqueExistenceCheck:
                                raise exceptions.SystemDataException("Multiple concept nodes are found for the given collectionPreviewEID: [{collectionPreviewEID}] in the database.".format(collectionPreviewEID=collectionPreviewEID))

        return collectionPreviewEIDImageIconUrlMap

    def _extractImageIconUrlsForCollectionPreviewEIDs(self, collectionPreviewEIDs):
        collectionPreviewEIDImageIconUrlMap = {}
        if collectionPreviewEIDs:            
            #query1
            #START Part & Nodes Selection
            collectionPreviewNodeSearchQuery = "START node=node:"+TAXONOMY_CONCEPT_NODE_INDEX_NAME+"(' ( "
            isFirstQueryPartForQueryOption = True            
            for collectionPreviewEID in collectionPreviewEIDs: 
                if not isFirstQueryPartForQueryOption:
                    collectionPreviewNodeSearchQuery = collectionPreviewNodeSearchQuery + "OR "
                collectionPreviewNodeSearchQuery = collectionPreviewNodeSearchQuery + "encodedID:"+collectionPreviewEID.lower() + " "
                if isFirstQueryPartForQueryOption:
                    isFirstQueryPartForQueryOption = False
            collectionPreviewNodeSearchQuery = collectionPreviewNodeSearchQuery+") ') "        
            
            #RETURN Part
            collectionPreviewNodeSearchQuery = collectionPreviewNodeSearchQuery+"RETURN node"
            collectionPreviewEIDImageIconUrlMap = self._populateCollectionPreviewImageIconUrlMap(collectionPreviewNodeSearchQuery, 'encodedID')
            

            #query2 - needs to be a separated one. Think why?
            #START Part
            collectionPreviewNodeSearchQuery = "START node=node:"+TAXONOMY_CONCEPT_NODE_INDEX_NAME+"(' ( "
            isFirstQueryPartForQueryOption = True            
            for collectionPreviewEID in collectionPreviewEIDs: 
                if not isFirstQueryPartForQueryOption:
                    collectionPreviewNodeSearchQuery = collectionPreviewNodeSearchQuery + "OR "
                collectionPreviewNodeSearchQuery = collectionPreviewNodeSearchQuery + "redirectedReferences:"+collectionPreviewEID.lower() + " "
                if isFirstQueryPartForQueryOption:
                    isFirstQueryPartForQueryOption = False
            collectionPreviewNodeSearchQuery = collectionPreviewNodeSearchQuery+") ') "        

            #RETURN Part
            collectionPreviewNodeSearchQuery = collectionPreviewNodeSearchQuery+"RETURN node"
            collectionPreviewEIDImageIconUrlMap = self._populateCollectionPreviewImageIconUrlMap(collectionPreviewNodeSearchQuery, 'redirectedReferences', collectionPreviewEIDImageIconUrlMap, False)

            collectionPreviewEIDImageIconUrlMapKeys = collectionPreviewEIDImageIconUrlMap.keys()
            collectionPreviewEIDsWithOutConceptNode = list(set(collectionPreviewEIDs) - set(collectionPreviewEIDImageIconUrlMapKeys))
            if collectionPreviewEIDsWithOutConceptNode:
                raise exceptions.ResourceNotFoundException("Concept Nodes for the collectionPreviewEIDs: [{collectionPreviewEIDsWithOutConceptNode}] could not be found in the database .".format(collectionPreviewEIDsWithOutConceptNode=collectionPreviewEIDsWithOutConceptNode))
        return collectionPreviewEIDImageIconUrlMap

    #previewEID may or may not be present.
    def _extractCollectionPreviewEIDs(self, collectionDict):
        collectionPreviewEID = collectionDict.get('previewEID')
        collectionPreviewEIDs = [collectionPreviewEID] if collectionPreviewEID else []
        containedCollections = collectionDict.get('contains')
        if containedCollections:
            for containedCollection in containedCollections:
                containedCollectionPreviewEIDs = self._extractCollectionPreviewEIDs(containedCollection)
                collectionPreviewEIDs.extend(containedCollectionPreviewEIDs)
        return list(set(collectionPreviewEIDs))

    def _populateCollectionWithPreveiwImageIconUrls(self, collectionDict, collectionPreviewEIDImageIconUrlMap):
        collectionPreviewEID = collectionDict.get('previewEID')
        if collectionPreviewEID in collectionPreviewEIDImageIconUrlMap:
            collectionDict['previewImageUrl'] =  collectionPreviewEIDImageIconUrlMap[collectionPreviewEID][0]
            collectionDict['previewIconUrl'] = collectionPreviewEIDImageIconUrlMap[collectionPreviewEID][1]

        containedCollections = collectionDict.get('contains')
        if containedCollections:
            for containedCollection in containedCollections:
                self._populateCollectionWithPreveiwImageIconUrls(containedCollection, collectionPreviewEIDImageIconUrlMap)
        return collectionDict

    def _processCollectionPreviewEIDs(self, collectionDict):
        collectionPreviewEIDs = self._extractCollectionPreviewEIDs(collectionDict) 
        collectionPreviewEIDImageIconUrlMap = self._extractImageIconUrlsForCollectionPreviewEIDs(collectionPreviewEIDs)
        self._populateCollectionWithPreveiwImageIconUrls(collectionDict, collectionPreviewEIDImageIconUrlMap)

    def _attachLevelInfos(self, collectionDict, level=1):
        try :
            collectionLevel=long(level)
        except (ValueError, TypeError):
            raise exceptions.InvalidArgumentException("Invalid value for level: [{collectionLevel}] received.".format(collectionLevel=level))
        
        collectionDict['level'] = collectionLevel
        containedCollections = collectionDict.get('contains')
        if containedCollections:
            for containedCollection in containedCollections:
                self._attachLevelInfos(containedCollection, level+1)
        return collectionDict
    
    def _extractCollectionNodes(self, collectionCreatorID, collectionHandles=None):
        if collectionHandles is None:
            collectionHandles = []
        collectionHandlesChunks = [collectionHandles[x:x + 10] for x in xrange(0, len(collectionHandles), 10)]
        collectionNodeSearchQueryResults = []
        for collectionHandlesChunk in collectionHandlesChunks:
            collectionNodeSearchQuery = "START collectionNode=node:"+COLLECTION_NODE_INDEX_NAME+"('creatorID:"+str(collectionCreatorID)
            if collectionHandlesChunk:
                collectionNodeSearchQuery = collectionNodeSearchQuery + " AND ("
                isFirstQueryPartForQueryOption = True
                for collectionHandle in collectionHandlesChunk:
                    if not isFirstQueryPartForQueryOption:
                        collectionNodeSearchQuery = collectionNodeSearchQuery + " OR "   
                    collectionNodeSearchQuery = collectionNodeSearchQuery + "handle:"+collectionHandle.replace('-', '\\\\-').replace(':', '\\\\:').lower()
                    if isFirstQueryPartForQueryOption:
                        isFirstQueryPartForQueryOption  = False
                collectionNodeSearchQuery = collectionNodeSearchQuery+")"

            collectionNodeSearchQuery = collectionNodeSearchQuery+"')"
            collectionNodeSearchQuery = collectionNodeSearchQuery + " RETURN collectionNode"
            collectionNodeSearchQueryResultsChunk = cypher.execute(graphDB, collectionNodeSearchQuery)
            collectionNodeSearchQueryResults.extend(collectionNodeSearchQueryResultsChunk)
        return collectionNodeSearchQueryResults

    #The presence of a unique handle mandatorily for every collectionNode is already done & validated by service layer.   
    def _extractCollectionHandles(self, collectionDict):
        collectionHandle = collectionDict.get('handle')
        collectionHandles = [collectionHandle] if collectionHandle else []
        containedCollections = collectionDict.get('contains')
        if containedCollections:
            for containedCollection in containedCollections:
                containedCollectionHandles = self._extractCollectionHandles(containedCollection)
                collectionHandles.extend(containedCollectionHandles)
        return list(set(collectionHandles))

    def _validateCollectionHandles(self, memberDict, collectionDict):
        collectionCreatorID = memberDict.get('memberID')   
        collectionHandles = self._extractCollectionHandles(collectionDict)
        collectionNodeSearchQueryResults = self._extractCollectionNodes(collectionCreatorID, collectionHandles)
        forceCollectionCreation = collectionDict.get('forceCreate')
        if forceCollectionCreation:
            while(collectionNodeSearchQueryResults and collectionNodeSearchQueryResults[0]):
                collectionNode = collectionNodeSearchQueryResults[0][0][0]
                collectionNode.delete_related()
                collectionNodeSearchQueryResults = self._extractCollectionNodes(collectionCreatorID, collectionHandles)
        else:
            if collectionNodeSearchQueryResults and collectionNodeSearchQueryResults[0]:
                collectionNode = collectionNodeSearchQueryResults[0][0][0]
                collectionNodeProperties = collectionNode._properties
                if collectionNodeProperties is None:
                    collectionNodeProperties = collectionNode.get_properties()
                collectionHandle = collectionNodeProperties.get('handle')
                raise exceptions.ResourceAlreadyExistsException("Another CollectionNode with the received handle : [{collectionHandle}] by the memberID : [{collectionCreatorID}] already exists in the database .".format(collectionHandle=collectionHandle, collectionCreatorID=collectionCreatorID))

    def _populatedIndexes(self, collectionCreationResults):
        for collectionCreationResult in collectionCreationResults:
            #populating only the nodeIndex (collectionNodeIndex for now)
            if isinstance(collectionCreationResult, neo4j.Node):
                collectionNode = collectionCreationResult
                collectionNodeProperties = collectionNode._properties
                if not collectionNodeProperties:
                    collectionNodeProperties = collectionNodeProperties.get_properties()
                for key, value in collectionNodeProperties.items():
                    if isinstance(value, basestring):
                        value = value.lower()
                    collectionNodeIndex.add(key, value, collectionNode)

    def _constructCollectionNodeQuery(self, queryOptions):
        collectionNodeQuery = ""
        collectionNodeQueryStart = "collectionNode=node:"+COLLECTION_NODE_INDEX_NAME+"(' "
        collectionNodeQueryEnd = "') "

        isFirstQueryPart = True
        isFirstQueryPartForQueryOption = True
        query = queryOptions.get('query')
        if query:
            if not collectionNodeQuery:
                collectionNodeQuery = collectionNodeQueryStart
            if not isFirstQueryPart:
                collectionNodeQuery = collectionNodeQuery + "AND "
            collectionNodeQuery = collectionNodeQuery+"( "

            #Process the whole search query
            for searchableProperty in COLLECTION_NODE_SEARCHABLE_PROPERTIES_LIST:
                if not isFirstQueryPartForQueryOption:
                    collectionNodeQuery = collectionNodeQuery + "OR "
                collectionNodeQuery = collectionNodeQuery+searchableProperty+":\""+query.lower()+"\"^4.0 "
                if isFirstQueryPartForQueryOption:
                    isFirstQueryPartForQueryOption = False                
                if isFirstQueryPart:
                    isFirstQueryPart = False

            #Process individual words
            queryWords = query.split()
            for searchableProperty in COLLECTION_NODE_SEARCHABLE_PROPERTIES_LIST:
                for queryWord in queryWords:
                    if not isFirstQueryPartForQueryOption:
                        collectionNodeQuery = collectionNodeQuery + "OR "
                    collectionNodeQuery = collectionNodeQuery+searchableProperty+":"+queryWord.lower()+"^2.0"+" OR "+searchableProperty+":"+"*"+queryWord.lower()+"* "
                    if isFirstQueryPartForQueryOption:
                        isFirstQueryPartForQueryOption = False
                    if isFirstQueryPart:
                        isFirstQueryPart = False

            collectionNodeQuery = collectionNodeQuery+") "


        withEncodedIDOnly = queryOptions.get('withEncodedIDOnly')
        if withEncodedIDOnly:
            if not collectionNodeQuery:
                collectionNodeQuery = collectionNodeQueryStart
            if not isFirstQueryPart:
                collectionNodeQuery = collectionNodeQuery + "AND "
            collectionNodeQuery = collectionNodeQuery + "encodedID:"+"* "
            if isFirstQueryPart:
                isFirstQueryPart = False

        canonicalOnly = queryOptions.get('canonicalOnly')
        if canonicalOnly:
            if not collectionNodeQuery:
                collectionNodeQuery = collectionNodeQueryStart
            if not isFirstQueryPart:
                collectionNodeQuery = collectionNodeQuery + "AND "
            collectionNodeQuery = collectionNodeQuery + "isCanonical:true "
            if isFirstQueryPart:
                isFirstQueryPart = False

        publishedOnly = queryOptions.get('publishedOnly')
        if publishedOnly:
            if not collectionNodeQuery:
                collectionNodeQuery = collectionNodeQueryStart
            if not isFirstQueryPart:
                collectionNodeQuery = collectionNodeQuery + "AND "
            collectionNodeQuery = collectionNodeQuery + "isPublished:true "
            if isFirstQueryPart:
                isFirstQueryPart = False

        handles = queryOptions.get('handles')
        if handles:
            if not collectionNodeQuery:
                collectionNodeQuery = collectionNodeQueryStart
            if not isFirstQueryPart:
                collectionNodeQuery = collectionNodeQuery + "AND "
            collectionNodeQuery = collectionNodeQuery+"( "
            isFirstQueryPartForQueryOption = True
            for handle in handles:
                if not isFirstQueryPartForQueryOption:
                    collectionNodeQuery = collectionNodeQuery + "OR "   
                collectionNodeQuery = collectionNodeQuery + "handle:"+handle.replace('-', '\\\\-').replace(':', '\\\\:').lower() + " "
                if isFirstQueryPartForQueryOption:
                    isFirstQueryPartForQueryOption  = False
                if isFirstQueryPart:
                    isFirstQueryPart = False
            collectionNodeQuery = collectionNodeQuery+") "

        creatorIDs = queryOptions.get('creatorIDs')
        if creatorIDs:
            if not collectionNodeQuery:
                collectionNodeQuery = collectionNodeQueryStart
            if not isFirstQueryPart:
                collectionNodeQuery = collectionNodeQuery + "AND "
            collectionNodeQuery = collectionNodeQuery+"("
            isFirstQueryPartForQueryOption = True
            for creatorID in creatorIDs:
                if not isFirstQueryPartForQueryOption:
                    collectionNodeQuery = collectionNodeQuery + "OR "   
                collectionNodeQuery = collectionNodeQuery + "creatorID:"+str(creatorID) + " "
                if isFirstQueryPartForQueryOption:
                    isFirstQueryPartForQueryOption = False
                if isFirstQueryPart:
                    isFirstQueryPart = False
            collectionNodeQuery = collectionNodeQuery+") "
        
        if collectionNodeQuery:
            collectionNodeQuery = collectionNodeQuery+collectionNodeQueryEnd
        return collectionNodeQuery

    def _constructCollectionAncestorNodeQuery(self, queryOptions):
        collectionAncestorNodeQuery = "collectionAncestorNode=node:"+COLLECTION_NODE_INDEX_NAME+"(' isRoot:true "

        ancestorCanonicalOnly = queryOptions.get('ancestorCanonicalOnly')
        if ancestorCanonicalOnly:
            collectionAncestorNodeQuery = collectionAncestorNodeQuery + "AND isCanonical:true "

        ancestorPublishedOnly = queryOptions.get('ancestorPublishedOnly')
        if ancestorPublishedOnly:
            collectionAncestorNodeQuery = collectionAncestorNodeQuery + "AND isPublished:true "

        ancestorHandles = queryOptions.get('ancestorHandles')
        if ancestorHandles:
            collectionAncestorNodeQuery = collectionAncestorNodeQuery + "AND "
            collectionAncestorNodeQuery = collectionAncestorNodeQuery+"( "
            isFirstQueryPartForQueryOption = True
            for ancestorHandle in ancestorHandles:
                if not isFirstQueryPartForQueryOption:
                    collectionAncestorNodeQuery = collectionAncestorNodeQuery + "OR "   
                collectionAncestorNodeQuery = collectionAncestorNodeQuery + "handle:"+ancestorHandle.replace('-', '\\\\-').replace(':', '\\\\:').lower() + " "
                if isFirstQueryPartForQueryOption:
                    isFirstQueryPartForQueryOption  = False
            collectionAncestorNodeQuery = collectionAncestorNodeQuery+") "

        ancestorCreatorIDs = queryOptions.get('ancestorCreatorIDs')
        if ancestorCreatorIDs:
            collectionAncestorNodeQuery = collectionAncestorNodeQuery + "AND "
            collectionAncestorNodeQuery = collectionAncestorNodeQuery+"( "
            isFirstQueryPartForQueryOption = True
            for ancestorCreatorID in ancestorCreatorIDs:
                if not isFirstQueryPartForQueryOption:
                    collectionAncestorNodeQuery = collectionAncestorNodeQuery + "OR "   
                collectionAncestorNodeQuery = collectionAncestorNodeQuery + "creatorID:"+str(ancestorCreatorID) + " "
                if isFirstQueryPartForQueryOption:
                    isFirstQueryPartForQueryOption  = False
            collectionAncestorNodeQuery = collectionAncestorNodeQuery+") "

        if collectionAncestorNodeQuery:
            collectionAncestorNodeQuery = collectionAncestorNodeQuery+"') "
        return collectionAncestorNodeQuery

    def createCollection(self, memberDict, collectionDict):
        #By this step, It is assumed that the member is properly authenticated with the auth server using his login cookie in the request
        #And we would have a proper and valid memberDetails in the memberDict
        memberID = memberDict.get('memberID')
        if not memberID:
            raise exceptions.InvalidArgumentException("Invalid memberID : [{memberID}] is received.".format(memberID=memberID))
        self._validateCollectionHandles(memberDict, collectionDict)
        self._attachLevelInfos(collectionDict)
        self._processCollectionPreviewEIDs(collectionDict)
        collectionRootNodeIndex, collectionNodes, collectionRelations = self._constructCollectionNodesAndRelations(memberDict, collectionDict, collectionIsRoot=True)
        collectionCreationResults = graphDB.create(*(collectionNodes+collectionRelations))
        self._populatedIndexes(collectionCreationResults)
        return self._generateNodeDict(collectionCreationResults[0], includeRelations=True)

    def getPublishedCollections(self, queryOptions):
        publishedRootCollectionNodeSearchQuery = "START node=node:"+COLLECTION_NODE_INDEX_NAME+"(' isRoot:true AND isPublished:true "

        canonicalOnly = queryOptions.get('canonicalOnly', False)
        if canonicalOnly:
            publishedRootCollectionNodeSearchQuery = publishedRootCollectionNodeSearchQuery+"AND "
            publishedRootCollectionNodeSearchQuery = publishedRootCollectionNodeSearchQuery+"isCanonical:true "

        creatorIDs = queryOptions.get('creatorIDs', [])
        if creatorIDs:
            publishedRootCollectionNodeSearchQuery = publishedRootCollectionNodeSearchQuery + "AND "
            publishedRootCollectionNodeSearchQuery = publishedRootCollectionNodeSearchQuery+"( "
            isFirstQueryPartForQueryOption = True
            for creatorID in creatorIDs:
                if not isFirstQueryPartForQueryOption:
                    publishedRootCollectionNodeSearchQuery = publishedRootCollectionNodeSearchQuery + "OR "   
                publishedRootCollectionNodeSearchQuery = publishedRootCollectionNodeSearchQuery + "creatorID:"+str(creatorID) + " "
                if isFirstQueryPartForQueryOption:
                    isFirstQueryPartForQueryOption = False
            publishedRootCollectionNodeSearchQuery = publishedRootCollectionNodeSearchQuery+") "

        parentSubjectIDs = queryOptions.get('parentSubjectIDs', [])
        if parentSubjectIDs:
            publishedRootCollectionNodeSearchQuery = publishedRootCollectionNodeSearchQuery + "AND "
            publishedRootCollectionNodeSearchQuery = publishedRootCollectionNodeSearchQuery+"("
            isFirstQueryPartForQueryOption = True
            for parentSubjectID in parentSubjectIDs:
                if not isFirstQueryPartForQueryOption:
                    publishedRootCollectionNodeSearchQuery = publishedRootCollectionNodeSearchQuery + "OR "   
                publishedRootCollectionNodeSearchQuery = publishedRootCollectionNodeSearchQuery + "parentSubjectID:"+parentSubjectID.lower() + " "
                if isFirstQueryPartForQueryOption:
                    isFirstQueryPartForQueryOption = False
            publishedRootCollectionNodeSearchQuery = publishedRootCollectionNodeSearchQuery+") "
        
        publishedRootCollectionNodeSearchQuery = publishedRootCollectionNodeSearchQuery+"') "

        #Related Node Part - Start
        publishedRootCollectionNodeSearchQueryRelatedNodePart = ""
        publishedRootCollectionNodeSearchQueryRelatedNodePartStart = "relatedNode=node:"+COLLECTION_NODE_INDEX_NAME+"(' "
        publishedRootCollectionNodeSearchQueryRelatedNodePartEnd = "') "
        isFirstQueryPartInRelatedNode = True

        encodedIDs = queryOptions.get('encodedIDs', [])
        if encodedIDs:
            if not publishedRootCollectionNodeSearchQueryRelatedNodePart:
                publishedRootCollectionNodeSearchQueryRelatedNodePart = publishedRootCollectionNodeSearchQueryRelatedNodePartStart
            if not isFirstQueryPartInRelatedNode:
                publishedRootCollectionNodeSearchQueryRelatedNodePart = publishedRootCollectionNodeSearchQueryRelatedNodePart + "AND "
            publishedRootCollectionNodeSearchQueryRelatedNodePart = publishedRootCollectionNodeSearchQueryRelatedNodePart+"( "
            isFirstQueryPartInRelatedNodeForQueryOption = True
            for encodedID in encodedIDs:
                if not isFirstQueryPartInRelatedNodeForQueryOption:
                    publishedRootCollectionNodeSearchQueryRelatedNodePart = publishedRootCollectionNodeSearchQueryRelatedNodePart + "OR "  
                publishedRootCollectionNodeSearchQueryRelatedNodePart = publishedRootCollectionNodeSearchQueryRelatedNodePart + "encodedID:"+encodedID.lower() + " "
                if isFirstQueryPartInRelatedNodeForQueryOption:
                    isFirstQueryPartInRelatedNodeForQueryOption = False
                if isFirstQueryPartInRelatedNode:
                    isFirstQueryPartInRelatedNode = False
            publishedRootCollectionNodeSearchQueryRelatedNodePart = publishedRootCollectionNodeSearchQueryRelatedNodePart+") "
        
        if publishedRootCollectionNodeSearchQueryRelatedNodePart:
            publishedRootCollectionNodeSearchQueryRelatedNodePart = publishedRootCollectionNodeSearchQueryRelatedNodePart+publishedRootCollectionNodeSearchQueryRelatedNodePartEnd
        

        if publishedRootCollectionNodeSearchQueryRelatedNodePart:
            publishedRootCollectionNodeSearchQuery = publishedRootCollectionNodeSearchQuery+ ", "+publishedRootCollectionNodeSearchQueryRelatedNodePart + " "
            publishedRootCollectionNodeSearchQuery = publishedRootCollectionNodeSearchQuery+"MATCH (node)-[relation*0.."+str(COLLECTION_NODE_RELATIONS_MAX_DEPTH)+"]->(relatedNode) "
            publishedRootCollectionNodeSearchQuery = publishedRootCollectionNodeSearchQuery+"RETURN DISTINCT node, relatedNode"
        else:
            publishedRootCollectionNodeSearchQuery = publishedRootCollectionNodeSearchQuery+ "RETURN DISTINCT node, null"


        publishedRootCollectionNodeSearchQueryResults = cypher.execute(graphDB, publishedRootCollectionNodeSearchQuery)
        publishedRootCollectionNodeDictList = []
        if publishedRootCollectionNodeSearchQueryResults and publishedRootCollectionNodeSearchQueryResults[0]:
            for publishedRootCollectionNodeSearchQueryResult in publishedRootCollectionNodeSearchQueryResults[0]:
                publishedRootCollectionNode = publishedRootCollectionNodeSearchQueryResult[0]
                publishedRootCollectionNodeDict = self._generateNodeDict(publishedRootCollectionNode)
                publishedRootCollectionNodeRelatedNode = publishedRootCollectionNodeSearchQueryResult[1]
                if publishedRootCollectionNodeRelatedNode:
                    publishedRootCollectionNodeRelatedNodeProperties = publishedRootCollectionNodeRelatedNode._properties
                    if publishedRootCollectionNodeRelatedNodeProperties is None:
                        publishedRootCollectionNodeRelatedNodeProperties = publishedRootCollectionNodeRelatedNode.get_properties()
                    if publishedRootCollectionNodeRelatedNodeProperties and publishedRootCollectionNodeRelatedNodeProperties.get('handle'):
                        publishedRootCollectionNodeRelatedNodeHandle = publishedRootCollectionNodeRelatedNodeProperties.get('handle')
                        publishedRootCollectionNodeDict[u'descendantHandle'] = publishedRootCollectionNodeRelatedNodeHandle
                        publishedRootCollectionNodeRelatedNodeHandleParts = self._validateAndSeparateRootNonRootCollectionHandles(publishedRootCollectionNodeRelatedNodeHandle, False)
                        if len(publishedRootCollectionNodeRelatedNodeHandleParts) == 2:
                            publishedRootCollectionNodeDict[u'descendantAbsoluteHandle'] = publishedRootCollectionNodeRelatedNodeHandleParts[1]

                publishedRootCollectionNodeDictList.append(publishedRootCollectionNodeDict)

        return publishedRootCollectionNodeDictList

    def searchCollections(self, queryOptions):
        collectionNodeDictList = []        
        collectionNodeQuery = self._constructCollectionNodeQuery(queryOptions) #in the current flow, collectionNodeQuery would always be present as queryWords are mandatory
        collectionAncestorNodeQuery = self._constructCollectionAncestorNodeQuery(queryOptions) #This would always be present due to the latest isRoot changes in the query generation we had made

        #START part
        collectionNodeSearchQuery = "START "
        if collectionNodeQuery:
            collectionNodeSearchQuery = collectionNodeSearchQuery+collectionNodeQuery+", "+collectionAncestorNodeQuery + " "
        else:
            collectionNodeSearchQuery = collectionNodeSearchQuery+collectionAncestorNodeQuery + " "

        #MATCH part
        if collectionNodeQuery:
            collectionNodeSearchQuery = collectionNodeSearchQuery+"MATCH (collectionAncestorNode)-[relation*0.."+str(COLLECTION_NODE_RELATIONS_MAX_DEPTH)+"]->collectionNode "

        #RETURN part
        collectionNodeSearchQuery = collectionNodeSearchQuery + "RETURN "
        if collectionNodeQuery:
            collectionNodeSearchQuery = collectionNodeSearchQuery + "collectionNode, collectionAncestorNode "
        else:
            collectionNodeSearchQuery = collectionNodeSearchQuery + "collectionAncestorNode "

        skip = queryOptions.get('skip')
        if skip:
            collectionNodeSearchQuery = collectionNodeSearchQuery+"SKIP "+str(skip) + " "

        limit = queryOptions.get('limit')
        if limit:
            collectionNodeSearchQuery = collectionNodeSearchQuery+"LIMIT "+str(limit)

        collectionNodeSearchQueryResults = cypher.execute(graphDB, collectionNodeSearchQuery)
        if collectionNodeSearchQueryResults and collectionNodeSearchQueryResults[0]:
            for collectionNodeSearchQueryResult in collectionNodeSearchQueryResults[0]:
                collectionNode = collectionNodeSearchQueryResult[0]
                collectionNodeDict = self._generateNodeDict(collectionNode)
                if len(collectionNodeSearchQueryResult) > 1:
                    collectionAncestorNode = collectionNodeSearchQueryResult[1]
                    collectionAncestorNodeDict = self._generateNodeDict(collectionAncestorNode)
                    if collectionAncestorNodeDict.get('title'):
                        collectionNodeDict['collectionTitle'] = collectionAncestorNodeDict.get('title')
                    if collectionAncestorNodeDict.get('handle'):
                        collectionNodeDict['collectionHandle'] = collectionAncestorNodeDict.get('handle')
                    if collectionAncestorNodeDict.get('creatorID'):
                        collectionNodeDict['collectionCreatorID'] = collectionAncestorNodeDict.get('creatorID')
                collectionNodeDictList.append(collectionNodeDict)
        return collectionNodeDictList

    def getCollectionByHandleCreatorIDAndDescendantIdentifierOrHandle(self, collectionHandle, collectionCreatorID, collectionDescendantIdentifier, collectionDescendantHandle, queryOptions):
        collectionNodeSearchQuery = "START node=node:"+COLLECTION_NODE_INDEX_NAME+"(' handle:"+collectionHandle.replace('-', '\\\\-').replace(':', '\\\\:').lower()+" AND creatorID:"+str(collectionCreatorID)+" ') RETURN node"
        collectionNodeSearchQueryResults = cypher.execute(graphDB, collectionNodeSearchQuery)
        if collectionNodeSearchQueryResults and collectionNodeSearchQueryResults[0]:
            if len(collectionNodeSearchQueryResults[0]) == 1:
                collectionNode = collectionNodeSearchQueryResults[0][0][0]
                
                if collectionDescendantHandle:
                    collectionDescendantIdentifier = self._generateCollectionDescendantIdentifierFromCollectionDescendantHandle(collectionNode, collectionDescendantHandle)

                if collectionDescendantIdentifier:
                    #repsonseDict here would be a descendantsStructured collectionDict
                    considerCollectionDescendantsWithEncodedIDForTraversal = queryOptions.pop('considerCollectionDescendantsWithEncodedIDForTraversal', False)
                    collectionDescendantNodesIdentifiersAndGraph = self._generateCollectionDescendantNodesAndIdentifiers(collectionNode, collectionDescendantIdentifier, considerCollectionDescendantsWithEncodedIDForTraversal)
                    responseDict = self._generateCollectionNodeDictWithDescendants(collectionNode, collectionDescendantNodesIdentifiersAndGraph[0], collectionDescendantNodesIdentifiersAndGraph[1], collectionDescendantNodesIdentifiersAndGraph[2], collectionDescendantNodesIdentifiersAndGraph[3], collectionDescendantNodesIdentifiersAndGraph[4], collectionDescendantNodesIdentifiersAndGraph[5], collectionDescendantNodesIdentifiersAndGraph[6], queryOptions)
                else:
                    #repsonseDict here would be a regular collectionDict                    
                    responseDict = self._generateNodeDict(collectionNode, **queryOptions)
                    responseDict  = self._processNodeDictForAdditionalQueryOptions(collectionNode, responseDict, **queryOptions)
                return responseDict
            else:
                raise exceptions.SystemDataException("Multiple collections with the given handle : [{collectionHandle}] by the memberID: [{collectionCreatorID}] are found in the dataBase.".format(collectionHandle=collectionHandle, collectionCreatorID=collectionCreatorID))
        else:
            raise exceptions.ResourceNotFoundException("Collection with the given handle : [{collectionHandle}] by the memberID: [{collectionCreatorID}] could not be found in the dataBase.".format(collectionHandle=collectionHandle, collectionCreatorID=collectionCreatorID))

    def deleteCollection(self, memberDict, collectionHandle):
        #By this step, It is assumed that the member is properly authenticated with the auth server using his login cookie in the request
        #And we would have a proper and valid memberDetails in the memberDict
        memberID = memberDict.get('memberID')
        if not memberID:
            raise exceptions.InvalidArgumentException("Invalid memberID : [{memberID}] is received.".format(memberID=memberID))
        collectionCreatorID = memberID
        
        collectionNodeSearchQuery = "START node=node:"+COLLECTION_NODE_INDEX_NAME+"(' handle:"+collectionHandle.replace('-', '\\\\-').replace(':', '\\\\:').lower()+" AND creatorID:"+str(collectionCreatorID)+" ') RETURN node"
        collectionNodeSearchQueryResults = cypher.execute(graphDB, collectionNodeSearchQuery)
        if collectionNodeSearchQueryResults and collectionNodeSearchQueryResults[0]:
            if len(collectionNodeSearchQueryResults[0]) == 1:
                collectionNode = collectionNodeSearchQueryResults[0][0][0]
                collectionNodeProperties = collectionNode._properties
                if collectionNodeProperties is None:
                    collectionNodeProperties = collectionNode.get_properties()
                if collectionNodeProperties and collectionNodeProperties.get('isRoot'):
                    collectionNode.delete_related()
                    collectionDict = {}
                    collectionDict['handle'] = collectionHandle
                    collectionDict['creatorID'] = collectionCreatorID
                    collectionDict['collectionStatus'] = 'SUCCESFULLY_DELETED'
                    return collectionDict
                else:
                    raise exceptions.InvalidArgumentException("Collection with handle : [{collectionHandle}] by the memberID : [{collectionCreatorID}] is not a rootCollection and hence could not be deleted.".format(collectionHandle=collectionHandle, collectionCreatorID=collectionCreatorID))
            else:
                raise exceptions.SystemDataException("Multiple collections with the given handle : [{collectionHandle}] by the memberID: [{collectionCreatorID}] are found in the dataBase.".format(collectionHandle=collectionHandle, collectionCreatorID=collectionCreatorID))

        else:
            raise exceptions.ResourceNotFoundException("Collection with the given handle : [{collectionHandle}] by the memberID: [{collectionCreatorID}] could not be found in the dataBase.".format(collectionHandle=collectionHandle, collectionCreatorID=collectionCreatorID))