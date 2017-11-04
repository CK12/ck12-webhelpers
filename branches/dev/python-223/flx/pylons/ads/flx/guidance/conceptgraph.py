#
# This module requires Neo4j graph database. Follow the steps to install Neo4j:
#
#    sudo apt-get install python-pype
#    sudo pip-install neo4j-embedded
# 
# Also please ensure JAVA_HOME is set correctly.
#
import sys, re, logging, getopt, shutil, os
from xml.etree.ElementTree import ElementTree
from neo4j import GraphDatabase, OUTGOING, Evaluation

log = logging.getLogger(__name__)

_USAGE = \
"""
Usage: %s [options] CXL_FILE'
  options:
    -c               Create concept graph
    -t DEPTH         Traverse concept graph
    -r ENCODED_ID    Encoded ID of root node to start traversing
"""

_linkingPhrases = {}  # id -> [[fromNode, ...], [toNode, ...]]
_nodes = {}  # id -> node

def _debug(fmt, *args):
    msg = fmt % args
    #log.debug(msg)
    print msg
    
def usage():
    print _USAGE % sys.argv[0]
    sys.exit(1)
    
def parseCXL(fileName):
    dbName = fileName.split('.')[0]
    if os.path.exists(dbName):
        shutil.rmtree(dbName)
    db = GraphDatabase(dbName)
    
    try:
        # Create node index
        with db.transaction:
            node_idx = db.node.indexes.create('concepts', type='fulltext')
            
        #
        # Store nodes
        #
        rec = re.compile('(.*)\[(.*)\]?$', re.DOTALL)
        tree = ElementTree()
        tree.parse(fileName)
        for i in tree.getiterator('{http://cmap.ihmc.us/xml/cmap/}concept'):
            id = i.get('id')
            label = i.get('label')
            m = rec.match(label)
            if m:
                name, encodedID = m.groups()
                encodedID = encodedID.strip('[]')
            else:
                name, encodedID = label, ''
            with db.transaction:
                _nodes[id] = db.node(name=name, encodedID=encodedID)
                node_idx[(encodedID or name).upper()]['node'] = _nodes[id]
        _debug('# of nodes: %s', len(_nodes))
    
        #
        # Build linking phrases lookup dictionary (to skip linking phrases)
        #
        for i in tree.getiterator('{http://cmap.ihmc.us/xml/cmap/}linking-phrase'):
            _linkingPhrases[i.get('id')] = [[], []]

        #
        # Link nodes
        #
        for i in tree.getiterator('{http://cmap.ihmc.us/xml/cmap/}connection'):
            fromID = i.get('from-id')
            toID = i.get('to-id')
            if _linkingPhrases.has_key(fromID) or _linkingPhrases.has_key(toID):
                if _linkingPhrases.has_key(fromID):
                    _linkingPhrases[fromID][1].append(_nodes.get(toID))
                if _linkingPhrases.has_key(toID):
                    _linkingPhrases[toID][0].append(_nodes.get(fromID))
                continue  # skip linking phrases
                
            with db.transaction:
                fromNode = _nodes.get(fromID)
                toNode = _nodes.get(toID)
                if fromNode and toNode:
                    with db.transaction:
                        fromNode.precedes(toNode)
                else:
                    _debug('Node(s) not found: %s%s', '' if fromNode else fromID, ' ' if toNode else toID)
                    
        #
        # Link nodes via linking phrases (?)
        #
        for id, nodes in _linkingPhrases.items():
            fromNodes, toNodes = nodes
            for i in fromNodes:
                for j in toNodes:
                    with db.transaction:
                        i.precedes(j)
                    
    finally:
        db.shutdown()

def stop_at_depth(depth):
    def evaluator(path):
        if len(path) >= depth:
            return Evaluation.INCLUDE_AND_PRUNE
        return Evaluation.INCLUDE_AND_CONTINUE
    return evaluator

def traverse(db, encodedID, depth):
    try:
        with db.transaction:
            node_idx = db.node.indexes.get('concepts')
            try:
                rootNode = node_idx[encodedID]['node'][0]
                traversal = db.traversal().relationships('precedes', OUTGOING).evaluator(stop_at_depth(depth)).traverse(rootNode)
                for i in traversal.nodes:
                    print '-'*40
                    print i['name'], i['encodedID']
            except Exception, e:
                print e
    finally:
        db.shutdown()
    
        
if __name__ == '__main__':
    if len(sys.argv) == 1:
        usage()
        
    try:
        opts, args = getopt.getopt(sys.argv[1:], 'ct:r:')
        if len(args) != 1:
            usage()
        cxlFileName = args[0]
        for i in opts:
            if i[0] == '-c':
                action = 'parse'
            elif i[0] == '-t':
                action = 'traverse'
                if not i[1].isdigit():
                    usage()
                depth = int(i[1])
            elif i[0] == '-r':
                encodedID = i[1].upper() 
    except getopt.GetoptError, e:
        print >>sys.stderr, 'ERROR:', str(e)
        usage()

    if action == 'parse':
        parseCXL(cxlFileName)
    elif action == 'traverse':
        db = GraphDatabase(cxlFileName.split('.')[0])
        try:
            traverse(db, encodedID=encodedID, depth=depth,)
        finally:
            db.shutdown()


                