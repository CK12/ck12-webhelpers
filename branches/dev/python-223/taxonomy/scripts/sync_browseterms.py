import json
import logging
import urllib

from py2neo import neo4j ,rel, cypher

GRAPH_URI = "http://localhost:7474/db/data/"
LOG_FILE_PATH = "/tmp/flx_browseterm.log"
BROWSE_TERM_URL = "http://akshayv.ck12.org/flx/get/info/browseTerm"

# Initialise Logger
logger = logging.getLogger('__name__')
hdlr = logging.FileHandler(LOG_FILE_PATH)
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
hdlr.setFormatter(formatter)
logger.addHandler(hdlr)
logger.setLevel(logging.INFO)

def syncBrowseTerms():
    """Update the Browseterm ID from flx into concept.
    """
    graph_db  = neo4j.GraphDatabaseService(GRAPH_URI)
    con_index = graph_db.get_index(neo4j.Node, 'concept')
    con_query = """START con=node:concept('nodeType:concept')
                   RETURN con.encodedID!, con.flxID!, ID(con)
                   ORDER BY con.encodedID
                """
    results, metadata = cypher.execute(graph_db, con_query)
    for result in results:
        try:
            eid, flxID, nodeID  = result
            print "Processing EID :%s" % eid
            browseTerm = getBrowseTermInfo(eid)
            if not browseTerm:
                raise Exception("No BrowseTerm Info available for encodedID:%s" % eid)
            resp = browseTerm['response']            
            br_flxID = resp['id']
            art = resp.get('artifactCount', {})
            artifactCount = 0
            if isinstance(art, dict):
                artifactCount = sum(art.values())
            props = dict()
            if not flxID or (flxID and flxID != br_flxID):
                props['flxID'] = br_flxID
                logger.info("%s:%s encodedID/flxID Added/Updated" % (eid, br_flxID))
            else:
                logger.info("%s:%s encodedID/flxID No Change." % (eid, flxID))
            props['artifactCount'] = artifactCount
            print "Updating the Concept Node:%s" % props
            node = graph_db.node(nodeID)
            node.update_properties(props)
        except Exception as e:
            import traceback
            traceback.print_exc()
            logger.error('Unable to sync for encodedID:%s, Exception:%s' % (eid, str(e)))

def getBrowseTermInfo(eid):
    """Returns BrowseTerm information.
    """
    try:
        url = "%s/%s" % (BROWSE_TERM_URL, eid)
        fp = urllib.urlopen(url)
        data = fp.read()
        browseTerm = json.loads(data)
        return browseTerm
    except Exception as e:
        logger.error('Unable to get BrowserTerm Info for encodedID:%s, Exception:%s' % (eid, str(e)))
    
if __name__ == "__main__":
    syncBrowseTerms()
