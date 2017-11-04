"""Module consisting of graph models.
"""
import time
import logging
from py2neo import neo4j, cypher, rel

from sts.lib import helpers as h
MAX_ENCODE_LENGTH = 50
log = logging.getLogger(__name__)

NODE_TYPES = ['subject', 'branch', 'concept', 'aet', 'nodeinstance']
SUBJECT_PROPS = ('created','description','name','previewImageUrl','shortname','updated','id')
BRANCH_PROPS = ('bisac', 'created','description','name','handle','previewImageUrl','shortname','subjectID','updated','id')
COURSE_PROPS = ('handle', 'name', 'shortname', 'country', 'created', 'updated', 'description', 'previewImageUrl','id')
UNIT_PROPS = ('name','handle','encodedID','description','previewImageUrl','created','updated','id')
COURSE_CONCEPT_NODE_PROPS = ('updated', 'created', 'description', 'handle', 'status', 'name', 'encodedID', 'previewImageUrl', 'keywords', 'id')
CONCEPT_PROPS = ('childCount','created','description','encodedID','handle','oldHandles','redirectedReferences','keywords','name','parentID','previewImageUrl','previewIconUrl','updated', 'status','id')
CON_SUBJECT_PROPS = ('created','description','name','previewImageUrl','shortname','updated','subjectID')
CON_BRANCH_PROPS = ('bisac', 'created','description','name','handle','previewImageUrl','shortname','subjectID','updated','branchID')
AET_PROPS = ('created', 'description','shortname','status', 'typeName','updated','id')
CNI_PROPS = ('artifactType','conceptNode', 'created', 'encodedID','updated','seq','sourceURL','id')

def name2Handle(name):
    handle = None
    if name:
        handle = name.replace(' ', '-')
        handle = handle.replace(',', '')
        handle = handle.replace(':', '')
    return handle

class TaxonomyGraphModel(object):
    """Base class for Taxonomy Graph Model.
    """
    def __init__(self, node_info, graph_db):
        """
        Initialise the neo4j.Node, TaxonomyGraphModel classes.
        uri : URI of the Node.
        """
        if not isinstance(node_info, dict):
            node_info = {}
        
        self.info = node_info
        self.graph_db = graph_db
        self.__dict__.update(self.info)

    def __unicode__(self):
        return unicode(vars(self))

class subjectNode(TaxonomyGraphModel):
    """Customised neo4j.Node class for subject node.
    """
    def asDict(self):
        """
        Returns the dictionary of the properties.
        """
        self.info.pop('id', None)
        return self.info

class courseNode(TaxonomyGraphModel):
    ''' Customised neo4j.Node class for course node '''
    def asDict(self):
        """
        Returns the dictionary of the properties.
        """
        self.info.pop('id', None)
        return self.info

class unitNode(TaxonomyGraphModel):
    ''' Customised neo4j.Node class for unit node '''
    def asDict(self):
        """
        Returns the dictionary of the properties.
        """        
        self.info.pop('id', None)
        return self.info

class branchNode(TaxonomyGraphModel):
    """Customised neo4j.Node class for branch node.
    """
    def asDict(self, includeSubject=True):
        """
        Returns the dictionary of the properties.
        """
        if not includeSubject and self.info.has_key('subject'):
            del self.info['subject']
        
        self.info.pop('id', None)
        return self.info

class conceptNode(TaxonomyGraphModel):
    """Customised neo4j.Node class.
    """
    def asDict(self, includeParent=True, includeChildren=True, level=None):
        """
        Returns the dictionary of the properties.
        """
        if not includeParent:
            self.info['parent'] = self.info.get('parentID')
        if level is not None:
            self.info['level'] = level
        if not self.info.get('keywords'):
            self.info['keywords'] = []
        if not self.info.get('oldHandles'):
            self.info['oldHandles'] = []
        if not self.info.get('redirectedReferences'):
            self.info['redirectedReferences'] = []

        if isinstance(self.info.get('branch'), dict):
            self.info.get('branch').pop('branchID', None)
        if isinstance(self.info.get('subject'), dict):
            self.info.get('subject').pop('subjectID', None)
        if isinstance(self.info.get('parent'), dict):
            self.info.get('parent').pop('id', None)
            if isinstance(self.info.get('parent').get('branch'), dict):
                self.info.get('parent').get('branch').pop('id', None)
            if isinstance(self.info.get('parent').get('subject'), dict):
                self.info.get('parent').get('subject').pop('id', None)

        self.info.pop('id', None)
        return self.info

class artifactExtnTypeNode(TaxonomyGraphModel):
    """Customised neo4j.Node class for ArtifactExtensionType node.
    """
    def asDict(self):
        """
        Returns the dictionary of the properties.
        """
        self.info.pop('id', None)
        return self.info

class conceptNodeInstance(TaxonomyGraphModel):
    """Customised neo4j.Node class for Instance node.
    """
    def asDict(self):
        """
        Returns the dictionary of the properties.
        """
        self.info.pop('id', None)
        return self.info

def getTaxonomyNodeFromGraphNode(graph_node, graph_db, nodeType):
    """Returns the taxonomy node from graph node.
    """
    node = None
    if not graph_node.exists():
        return None
    nodeID = graph_node._id
    nodeIDs = [nodeID]
    nodes = getTaxonomyNodesByIDs(nodeIDs, graph_db, nodeType)
    return nodes[0]


def getCourseStructure(courseShortname,graph_db):
    courseStructQry = ''' start crse = node:course('shortname:%s')
        match (crse)-[:covers]->(unt)-[inc:includes]->(n)
        where inc.course = '%s'
        return distinct
        crse.handle, crse.name, crse.shortname, crse.country, crse.created, crse.updated!, crse.description!, crse.previewImageUrl!,ID(crse)
         , n.updated!, n.created, n.description!, n.handle, n.status, n.name, n.encodedID, n.previewImageUrl!, n.keywords!, ID(n)
         , unt.name,unt.handle,unt.encodedID,unt.description!,unt.previewImageUrl!,unt.created,unt.updated!,ID(unt)
         , inc
        order by inc.seq
    '''
    courseStructQry = courseStructQry % (courseShortname,courseShortname)
    results, metadata = cypher.execute(graph_db, courseStructQry)
    if results:
        visitedUnits = {}
        courseStructure = {
            'units':[],
        }
        courseStructure.update(dict(zip(COURSE_PROPS,results[0][:9])))
        for result in results:
            ueid = result[21].strip()
            if ueid not in visitedUnits.keys():
                u = dict(zip(UNIT_PROPS,result[19:27]))
                u['concepts'] = []
                courseStructure['units'].append(u)
                visitedUnits[ueid]=len(courseStructure['units'])-1 # store the index for future iterations
            courseConceptNode = dict(zip(COURSE_CONCEPT_NODE_PROPS,result[9:19]))
            courseStructure['units'][visitedUnits[ueid]]['concepts'].append(courseConceptNode)
        return courseStructure
    else:
        return None
     
def getTaxonomyNodesByIDs(ids, graph_db, nodeType):
    """Returns the taxonomy nodes from graph node ids.
    """
    if not nodeType:
        raise Exception("nodeType not provided.")
    nodes = []
    node_dict = dict()
    ids = map(str, ids)
    nodeIDs = ','.join(ids)
    try:
        if nodeType == 'subject':
            query = '''
                START sub = node(%s)
                WHERE sub.nodeType! = 'subject'
                RETURN sub.created, sub.description!,sub.name, sub.previewImageUrl!,sub.shortname,sub.updated!,ID(sub)
            ''' %(nodeIDs)
            results, metadata = cypher.execute(graph_db, query)
            if results:
                for result in results:
                    node_info = dict(zip(SUBJECT_PROPS,result))
                    node = subjectNode(node_info, graph_db)
                    node_dict[node.id] = node

        elif nodeType == 'branch':
            query = '''
                START br = node(%s)
                MATCH sub-[:contains]->br
                WITH br, sub
                WHERE br.nodeType! = 'branch'
                RETURN sub.created, sub.description!,sub.name, sub.previewImageUrl!,sub.shortname,sub.updated!,
                br.bisac!, br.created, br.description!,br.name,br.handle!, br.previewImageUrl!,br.shortname,sub.shortname,br.updated!,ID(br)
            ''' %(nodeIDs)
            results, metadata = cypher.execute(graph_db, query)
            if results:
                for result in results:
                    sub_info = result[:6]
                    br_info = result[6:]
                    node_info = dict(zip(BRANCH_PROPS,br_info))
                    node_info['subject'] = dict(zip(SUBJECT_PROPS,sub_info))                    
                    node = branchNode(node_info, graph_db)
                    node_dict[node.id] = node

        elif nodeType == 'course':
            query = '''
                START course = node(%s)
                WHERE course.nodeType! = 'course'
                RETURN course.handle, course.name, course.shortname!, course.country, course.created, course.updated, course.description!, course.previewImageUrl!,ID(course)
            '''
            query = query %(nodeIDs)
            
            results, metadata = cypher.execute(graph_db, query)
            if results:
                for result in results:
                    node_info = dict(zip(COURSE_PROPS,result))
                    node = courseNode(node_info, graph_db)
                    node_dict[node.id] = node

        elif nodeType == 'unit':
            query =  '''
                START unit = node(%s)
                WHERE unit.nodeType! = 'unit'
                RETURN unit.name, unit.handle, unit.encodedID, unit.description!, unit.previewImageUrl!, unit.created, unit.updated!, ID(unit)
            '''
            query = query % nodeIDs
            
            results, metadata = cypher.execute(graph_db, query)
            if results:
                for result in results:
                    node_info = dict(zip(UNIT_PROPS,result))
                    node = unitNode(node_info, graph_db)
                    node_dict[node.id] = node
            
        elif nodeType == 'concept':
            query = h.getConceptInfoQuery(nodeIDs)
            results, metadata = cypher.execute(graph_db, query)
            if results:
                for result in results:
                    sub_info, br_info, cn_info = result[:7], result[7:17], result[17:32]
                    node_info = dict(zip(CONCEPT_PROPS,cn_info))
                    node_info['subject'] = dict(zip(CON_SUBJECT_PROPS,sub_info))
                    node_info['branch'] = dict(zip(CON_BRANCH_PROPS,br_info))                    
                    node_info['hasChildren'] = int(node_info['childCount']) > 0
                    node_info['parent'] = None
                    if node_info['parentID']:
                        psub_info, pbr_info, pcn_info = result[32:39], result[39:49], result[49:]   
                        node_info['parent'] = dict(zip(CONCEPT_PROPS,pcn_info))
                        node_info['parent']['subject'] = dict(zip(SUBJECT_PROPS,psub_info))
                        node_info['parent']['branch'] = dict(zip(BRANCH_PROPS,pbr_info))
                        node_info['parent']['hasChildren'] = int(node_info['parent']['childCount']) > 0
                    node = conceptNode(node_info, graph_db)
                    node_dict[node.id] = node

        elif nodeType == 'aet':
            query = '''
                START aet = node(%s)
                WHERE aet.nodeType! = 'aet'
                RETURN aet.created, aet.description!,aet.shortname!, aet.status!,aet.typeName!,aet.updated!,ID(aet)
            ''' %(nodeIDs)
            results, metadata = cypher.execute(graph_db, query)
            if results:
                for result in results:
                    node_info = dict(zip(AET_PROPS,result))
                    node = artifactExtnTypeNode(node_info, graph_db)
                    node_dict[node.id] = node

        elif nodeType == 'nodeinstance':
            query = '''
                START cni = node(%s)
                MATCH n-[:instances]->cni-[:sequences]->aet
                WITH n, cni, aet
                WHERE cni.nodeType! = 'nodeinstance'
                RETURN aet.shortname, n.encodedID,cni.created, n.encodedID + '.' + aet.shortname + '.' + cni.seq ,cni.updated!,cni.seq,cni.sourceURL,ID(cni)
            ''' %(nodeIDs)
            results, metadata = cypher.execute(graph_db, query)
            if results:
                for result in results:
                    node_info = dict(zip(CNI_PROPS,result))
                    node = conceptNodeInstance(node_info, graph_db)
                    node_dict[node.id] = node
        # Get the nodes in original order.
        for nodeID in nodeIDs.split(','):
            nodes.append(node_dict.get(int(nodeID)))
        return nodes
    except Exception as e:
        log.error('%s' %e.__str__(), exc_info=e)
        raise e

def getGraphNodeFromTaxonomyNode(tx_node, graph_db):
    """Returns the graph node from taxonomy node.
    """
    try:
        node = graph_db.node(tx_node.id)
        return node
    except Exception, e:
        raise e

def getOrderedEncodedID(encodedID):
    return encodedID.replace('.', '').ljust(MAX_ENCODE_LENGTH, '0')
