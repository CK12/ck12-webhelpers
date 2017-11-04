from sts.model import api
from py2neo import neo4j, cypher


#>>>from paster_scripts import rebuild_all_indexes
#>>>rebuild_all_indexes.run()
def run():
    NODE_INDEX_NAME_LIST = api.NODE_INDEX_NAME_LIST
    graph_db = api.graph_db
    print "TRIGGERING REBUILD-INDEXES"
    print 
    for nodeIndexName in NODE_INDEX_NAME_LIST:
        print
        print "Starting to rebuildIndex: "+nodeIndexName
        if nodeIndexName not in NODE_INDEX_NAME_LIST:
            raise Exception("Invalid nodeIndexName received for building index. Valid nodeIndexNames: "+str(NODE_INDEX_NAME_LIST))

        index = graph_db.delete_index(neo4j.Node, nodeIndexName)
        index = graph_db.get_or_create_index(neo4j.Node, nodeIndexName)
        
        nodesQueryParams = {'nodeType':nodeIndexName}
        nodesQuery = "START node=Node(*) WHERE node.nodeType! = {nodeType} OR node.type! = {nodeType} RETURN node"
        
        skip = 0
        limit = 100
        while True:
            print "Querying nodeIndexName: "+nodeIndexName+" SKIP: "+str(skip)+" LIMIT: "+str(limit)
            nodesResultsChunk = cypher.execute(graph_db, nodesQuery+" SKIP "+str(skip)+" LIMIT "+str(limit), nodesQueryParams)
            if nodesResultsChunk and nodesResultsChunk[0]:
                print str(len(nodesResultsChunk[0]))+" results received for nodeIndexName: "+nodeIndexName+" SKIP: "+str(skip)+" LIMIT: "+str(limit)
                for node in nodesResultsChunk[0]:
                    node = node[0]
                    nodeProperties = node._properties
                    if not nodeProperties:
                        nodeProperties = node.get_properties()
                    for key, value in nodeProperties.items():
                        if isinstance(value, list):
                            values = value
                            for value in values:
                                if isinstance(value, basestring):
                                    value = value.lower()
                                index.add(key, value, node)                                
                        else:
                            if isinstance(value, basestring):
                                value = value.lower()
                            index.add(key, value, node)
                skip = skip + limit
            else:
                break
        print "Completed to rebuildIndex: "+nodeIndexName
        print 
    print 
    print "COMPLETED REBUILDING-INDEXES"
