from py2neo import neo4j ,rel, cypher

GRAPHDB_URI = "http://localhost:7474/db/data"
GRAPHDB_USERNAME = None
GRAPHDB_PASSWORD = None

def run(rel_type):
    """Delete the provided node relations.
    """
    graph_db = getGraphConnection()
    qry = "START nd=node:concept('nodeType:concept') MATCH nd-[r:%s]-x RETURN DISTINCT r" % (rel_type)
    results, metadata = cypher.execute(graph_db, qry)
    print "Deleting %s %s relations:" % (len(results), rel_type)
    if results:
        # Delete the concept relations.
        rels = map(lambda x:x[0], results)
        tmp_data = map(graph_db.delete, rels)

def getGraphConnection():
    try:        
        if GRAPHDB_USERNAME and GRAPHDB_PASSWORD:
            from urlparse import urlparse 
            parseResult = urlparse(GRAPHDB_URI)
            neo4j.authenticate(parseResult.netloc, GRAPHDB_USERNAME, GRAPHDB_PASSWORD)
        graph_db = neo4j.GraphDatabaseService(GRAPHDB_URI)
    except Exception, e:
        raise Exception('Unable to connect to Graph Database :%s'%e )
    return graph_db

if __name__ == "__main__":
    run('prerequires')
