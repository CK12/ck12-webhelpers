"""
    The APIs for the neo4j graph datbase.
"""

import logging 
import traceback 
from datetime import datetime 
from urlparse import urlparse 
from collections import defaultdict

from py2neo import neo4j, rel, cypher

from pylons import config 
from sts.model import page as p 
from sts.lib import helpers as h 
from sts.lib import remoteapi 
from sts.model import graph_model

SUBJECT_INDEX_NAME = "subject"
BRANCH_INDEX_NAME = "branch"
COURSE_INDEX_NAME = "course"
UNIT_INDEX_NAME = 'unit'
CONCEPT_INDEX_NAME = "concept"
AET_INDEX_NAME = "aet"
CNI_INDEX_NAME = "nodeinstance"
COLLECTION_INDEX_NAME = "Collection"
 
NODE_INDEX_NAME_LIST = [SUBJECT_INDEX_NAME, BRANCH_INDEX_NAME, COURSE_INDEX_NAME, UNIT_INDEX_NAME, CONCEPT_INDEX_NAME, AET_INDEX_NAME, CNI_INDEX_NAME, COLLECTION_INDEX_NAME]

SUBJECT_INDEX_LIST = ['name', 'shortname', 'description', 'nodeType']
BRANCH_INDEX_LIST = ['name', 'shortname', 'handle', 'description', 'nodeType']
COURSE_INDEX_LIST = ['name', 'shortname', 'handle', 'country','nodeType']
UNIT_INDEX_LIST = ['name','handle','nodeType','encodedID']
CONCEPT_INDEX_LIST = ['name', 'encodedID', 'handle', 'oldHandles', 'description', 'status', 'nodeType', 'redirectedReferences']
AET_INDEX_LIST = ['typeName', 'shortname', 'description', 'nodeType', 'status']
CNI_INDEX_LIST = ['seq', 'sourceURL','nodeType']
REL_TYPE_LIST = ['contains', 'parent', 'requires', 'instances', 'sequences', 'relates']

CONTAINS_REL = "contains"
PARENT_REL = "parent"
REQUIRES_REL = "requires"
INSTANCES_REL = "instances"
SEQUENCES_REL = "sequences"
PREREQUIRES_REL = "prerequires"
COURSE_FLOW_PRECEDES_REL = "precedes"
COURSE_UNIT_REL = "covers"
UNIT_CONCEPT_REL = "includes"
BRANCH_COURCE_REL = "has"
RELATES_REL = "relates"
#COURSE_STARTS_WITH_REL = "startsWith"


STOP_WORDS = ['a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'for', 'if', 'in', 'into', 'is', 'it', 'no', 'not', 'of', 'on', 'or', 's', 'such', 't', 'that', 'the', 'their', 'then', 'there', 'these', 'they', 'this', 'to', 'was', 'will', 'with']
#STOP_WORDS = ['a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'for', 'if', 'in', 'into', 'is', 'it', 'no', 'not', 'on', 'or', 's', 'such', 't', 'that', 'the', 'their', 'then', 'there', 'these', 'they', 'this', 'to', 'was', 'will', 'with']

log = logging.getLogger(__name__)

def initConfig():
    global config
    if not config or not config.get('graphdb.url'):
        config = h.load_pylons_config()

def getGraphConnection():
    try:
        # Initialise the configuration.
        initConfig()
        GRAPHDB_URI = config.get('graphdb.url')
        GRAPHDB_USERNAME = config.get('graphdb.username')
        GRAPHDB_PASSWORD = config.get('graphdb.password')
        log.info("GRAPHDB_URI ::%s" %GRAPHDB_URI)
        parseResult = urlparse(GRAPHDB_URI)
        neo4j.authenticate(parseResult.netloc, GRAPHDB_USERNAME, GRAPHDB_PASSWORD)
        graph_db = neo4j.GraphDatabaseService(GRAPHDB_URI)
    except Exception, e:
        raise Exception('Unable to connect to Graph Database :%s'%e )
    return graph_db

# TODO: Need to Put this graph_db object at global place in application. 
graph_db = getGraphConnection()
# Create the index objects
subject_index = graph_db.get_or_create_index(neo4j.Node, SUBJECT_INDEX_NAME)
branch_index = graph_db.get_or_create_index(neo4j.Node, BRANCH_INDEX_NAME)
course_index = graph_db.get_or_create_index(neo4j.Node, COURSE_INDEX_NAME)
unit_index = graph_db.get_or_create_index(neo4j.Node, UNIT_INDEX_NAME)
concept_index = graph_db.get_or_create_index(neo4j.Node, CONCEPT_INDEX_NAME)
aet_index = graph_db.get_or_create_index(neo4j.Node, AET_INDEX_NAME)
cni_index = graph_db.get_or_create_index(neo4j.Node, CNI_INDEX_NAME)
collection_index = graph_db.get_or_create_index(neo4j.Node,  COLLECTION_INDEX_NAME)


class GraphDBException(Exception):
    """
    GraphDB Exception Class.
    """
    pass

class TaxonomyException(Exception):
    """
    Taxonomy Exception Class.
    """
    pass

class _transactional(object):
    """The transactional decorator that wraps a function into a transaction.

       Any transactional method cannot call another transactional method.
    """

    def __init__(self):
        pass

    def __call__(self, func):
        def decorator(*args, **kwargs):

            log.info('--- begin %s' % func.__name__)
            log.info('args: %s::kwargs: %s' %(args, kwargs))
            start = datetime.now()
            try:
                result = func(*args, **kwargs)
                return result
            except Exception, e:
                log.error(traceback.format_exc())
                log.error(e)
                raise e
            finally:
                end = datetime.now() - start
                log.info('--- %s, took %s' % (func.__name__, end))

        decorator.__name__ = func.__name__
        decorator.__doc__ = func.__doc__
        decorator.__dict__ = func.__dict__
        return decorator


class ValidateAttributeError(Exception):
    """Exception class for missing/empty attribute.
    """
    def __init__(self, value):
        Exception.__init__(self, value)
        self.value = value

    def __repr__(self):
        return self.value

def _checkAttributes(expectedList, **kwargs):
    """Validate the existence of required parameters.
    """
    missingList = emptyList = []
    for expected in expectedList:
        if not kwargs.has_key(expected):
            missingList.append(expected)
        else:
            if not kwargs.get(expected):
                emptyList.append(expected)

    if missingList:
        raise ValidateAttributeError('Missing required attributes: %s' % missingList)

    if emptyList:
        raise ValidateAttributeError('Required attributes can not be empty: %s' % emptyList)

def __getGraphNodesByAttribute(index, attb_name, attb_value, nodeType=None):
    """
    Get the Node from index which has the given attribute and value.
    """
    nodes = []
    if attb_name == 'id':
        # TODO: Need to verify if wrong id is passed.
        nd = graph_db.node(int(attb_value))
        return [nd]


    attb_value_lower = attb_value.lower()
    try:
        # If the value is in ascii.
        attb_value_lower = attb_value_lower.decode('ascii')
        nodes = index.get(attb_name, attb_value_lower)
    except:
        # If the value is not in ascii , prepare the cypher query and get the node.
        try:
            attb_value = attb_value.encode('utf-8')
        except:
            pass

    #these should never be executed - as we'll always have indexes (even for oldHandles & redirectedReferences)
    if not nodes:
        if attb_name in ('oldHandles', 'redirectedReferences'):
            if not nodeType:
                nodeType = 'concept'
            query = "START gnode=node(*) WHERE gnode.nodeType! = \"%s\" AND \"%s\" IN gnode.%s! RETURN gnode" %(nodeType, attb_value, attb_name)
        else:
            query = "START gnode=node(*) WHERE LOWER(gnode.%s!) = LOWER(\"%s\") RETURN gnode" %(attb_name, attb_value)
        
        log.info("Executing Query :: %s"%query)
        results, metadata = cypher.execute(graph_db, query)
        if results:
            nodes = results[0]
    return nodes

def __getNodeByAttribute(index, attb_name, attb_value, nodeType=None, returnGraphNode=False):
    nodes = __getGraphNodesByAttribute(index, attb_name, attb_value, nodeType=nodeType)
    if nodes:
        if returnGraphNode:
            return nodes[0]
        else:
            return graph_model.getTaxonomyNodeFromGraphNode(nodes[0], graph_db, nodeType=nodeType)
    return None

def __getNodesByAttribute(index, attb_name, attb_value, nodeType=None, returnGraphNodes=False):
    nodes = __getGraphNodesByAttribute(index, attb_name, attb_value, nodeType=nodeType)    
    if nodes:
        if returnGraphNodes:
            return nodes
        else:
            taxonomyNodes = []
            for node in nodes:
                taxonomyNodes.append(graph_model.getTaxonomyNodeFromGraphNode(node, graph_db, nodeType=nodeType))
            return taxonomyNodes
    return []

@_transactional()
def __getNodesByQuery(query, is_single=False, pageNum=1, pageSize=10, nodeType=None):
    # If page size is -1 we return all the results.
    if pageSize != -1:
        if pageSize > 0:
            offset = (pageNum - 1)*pageSize
        else:
            offset = 0
        query = query + ' SKIP %s LIMIT %s' %(offset, pageSize)
    try:
        query = query.decode('ascii')
    except:
        try:
            query = query.encode('utf-8')
        except:
            pass

    log.info("Executing query :%s"%query)
    # Fire the cypher query.
    results, metadata = cypher.execute(graph_db, query)
    log.info('results: [%s]' %(results))
    log.info('metadata: [%s]' %(metadata.columns))
    if results:
        if is_single:
            return [graph_model.getTaxonomyNodeFromGraphNode(results[0][0], graph_db, nodeType=nodeType)]
        else:
            # Prepare the list of nodes.
            nodes = nodeIDs = []
            for result in results:
                nodeIDs.append(result[0].id)
            nodes = graph_model.getTaxonomyNodesByIDs(nodeIDs, graph_db, nodeType)
            return nodes
    return []

#
## Subject related.
#

@_transactional()
def getSubjectByID(id):
    return __getNodeByAttribute(subject_index, 'id', id, nodeType='subject')

@_transactional()
def getSubjectByShortname(shortname):
    shortname = str(shortname)
    return __getNodeByAttribute(subject_index, 'shortname', shortname, nodeType='subject')

def _getSubjectByIDOrShortname(id):
    try: 
        id = int(id)
        return __getNodeByAttribute(subject_index, 'id', id, nodeType='subject')
    except:
        shortname = id
        return __getNodeByAttribute(subject_index, 'shortname', shortname, nodeType='subject')
    return None

@_transactional()
def getSubjectByName(name):
    return __getNodeByAttribute(subject_index, 'name', name, nodeType='subject')

@_transactional()
def getSubjects(pageNum=1, pageSize=10):
    return _getSubjects(pageNum, pageSize)

def _getSubjects(pageNum=1, pageSize=10):
    # Prepare cypher query.
    qry = "START n=node:subject('nodeType:subject') RETURN n ORDER BY n.name"        
    exclude_qry = getExcludeQuery("hidden_subjects", "n", "shortname")
    log.info("exclude_qry :%s" % exclude_qry)
    if exclude_qry:
        qry = qry.replace("RETURN n", "%s RETURN n" % exclude_qry)
    results = __getNodesByQuery(qry, pageNum=pageNum, pageSize=pageSize, nodeType='subject')
    #Get the page from results.
    page = p.Page(results, pageNum, pageSize, isGraphModel=True)
    if exclude_qry:
        countQry = "START n=node:subject('nodeType:subject') %s RETURN COUNT(n)" % (exclude_qry) 
    else:
        countQry = "START n=node:subject('nodeType:subject') RETURN COUNT(n)" 
    # Get the result count
    resultCount = __getResultsCount(countQry)
    page.total = resultCount 

    return page

@_transactional()
def getSubjectsDict():
    subjects = _getSubjects()
    d = {}
    for s in subjects:
        sd = s.asDict()        
        d[s.name.lower()] = sd
        d[s.shortname.lower()] = sd
    return d

#@_transactional()
def createSubject(**kwargs):
    _checkAttributes(['name', 'shortname'], **kwargs)
    if not h.checkValue(kwargs['shortname']):
        raise Exception('Shortname can contain only alphabets and digits. Additionally it should contain atleast 1 alphabet')

    # Verify that node with the same name or shortname does not exists already.
    if __getNodeByAttribute(subject_index, 'name', kwargs['name'], nodeType='subject'):
            raise Exception((u'Subject node with name:%s already exist.' %(kwargs['name'])).encode('utf-8'))
    if __getNodeByAttribute(subject_index, 'shortname', kwargs['shortname'], nodeType='subject'):
            raise Exception((u'Subject node with shortname:%s already exist.' %(kwargs['shortname'])).encode('utf-8')) 
    # verifying that no branch is having the same name as that of subject.
    if __getNodeByAttribute(branch_index, 'name', kwargs['name'], nodeType='branch'):
            raise Exception('Subject name should be unique across existing suject and branch names.')

    cookies = kwargs.get('cookies')
    if not kwargs.get('created'):
        kwargs['created'] = str(datetime.now())
    if not kwargs.get('updated'):
        kwargs['updated'] = str(datetime.now())
    if not kwargs.get('previewImageUrl'):
        kwargs['previewImageUrl'] = None
    if not kwargs.get('description'):
        kwargs['description'] = None

    # TODO:Put node types at global location.
    kwargs['nodeType'] = 'subject'

    if kwargs.has_key('cookies'):
        del kwargs['cookies']
    # Create subject node.
    try:
        tmp_node = graph_db.create(kwargs)
        subject_node = tmp_node[0]
        # Create indexes for subject properties.
        for index_prop in SUBJECT_INDEX_LIST:
            node_prop = kwargs.get(index_prop)
            if node_prop:
                if isinstance(node_prop, basestring):
                    node_prop = node_prop.lower()
                subject_index.add(index_prop, node_prop, subject_node)
        
        node_id = subject_node.id
        # Get the node object from subject node.
        tx_node = graph_model.getTaxonomyNodeFromGraphNode(subject_node, graph_db, nodeType='subject')

        flxID = _createBrowseTerm('subject', tx_node, cookies)
        if not flxID:
            # Not able to create the browseterm in flx.So delete the created node.
            deleteSubject(node_id, deleteBrowseTerm=False)
            raise Exception((u'Unable to create browseTerm in flx for Subject:%s.' % kwargs['name']).encode('utf-8'))
        # Update the flxID in subject node.
        setattr(tx_node, 'flxID', flxID)
        tx_node.info['flxID'] = flxID
        subject_node.update_properties({'flxID':flxID})
        log.info("Created BrowserTerm in flx2 for SubjectID/FlexID:%s/%s"%(subject_node.id, flxID))

    except Exception, e:
        log.error('GraphDB Error: %s' % (str(e)), exc_info=e)
        raise GraphDBException('GraphDB Error. Please look at the log files for more information')
    return tx_node

@_transactional()
def updateSubject(**kwargs):
    _checkAttributes(['id'], **kwargs)
    cookies = kwargs.get('cookies')
    if kwargs.has_key('cookies'):
        del kwargs['cookies']

    subject = __getNodeByAttribute(subject_index, 'id', id, nodeType='subject')
    
    if not subject:
        raise Exception('No such subject for id: %s' % kwargs['id'])

    del kwargs['id']
    # To avoide any UnicodeDecodeError, Decode and then encode all properties with utf-8.
    node_dict = {}
    for kw in kwargs:
        prop = kwargs[kw]       
        val = h.safe_decode(prop)
        val = h.safe_encode(val)      
        node_dict[kw] = val

    node_dict['updated'] = str(datetime.now())
    log.info("Updating Subject Node :: %s" % node_dict)    
    try:
        # Update node.
        old_node_dict = subject.get_properties()
        subject.update_properties(node_dict)

        # Index node properties.
        for index_key in SUBJECT_INDEX_LIST:
            new_val = node_dict.get(index_key)
            if new_val:
                if isinstance(new_val, basestring):
                    new_val = new_val.lower()
                old_val = old_node_dict.get(index_key, '')
                old_val = old_val.lower()
                if old_val and subject_index.get(index_key, old_val):
                    subject_index.remove(index_key, old_val, subject)
                subject_index.add(index_key, new_val, subject)
        
        tx_node = graph_model.getTaxonomyNodeFromGraphNode(subject, graph_db, nodeType='subject')    
        tx_node_dict = tx_node.asDict()
        url_info = _getRemoteFlxAPIInfo('update')
        server_url, api_path, timeout = url_info
        # Prepare POST parameters. 
        flxID = tx_node['flxID']
        api_params = dict()
        api_params['passKey'] = 'I@mSt$'
        api_params['name'] =  tx_node_dict.get('name', '')
        api_params['handle'] =  h.name2Handle(api_params['name'])
        api_params['encodedID'] =  tx_node_dict.get('shortname', '')      
        api_params['description'] =  tx_node_dict.get('description', '')      
        api_params['id'] =  flxID

        response = remoteapi.RemoteAPI._makeCall(server_url, api_path, timeout, params_dict=api_params, method='GET',auth_pass=cookies)
        # Update flex ID in concept node.
        if response:
            flx_id = response['response']['id']
            setattr(tx_node, 'flxID', flx_id)
            tx_node.info['flxID'] = flx_id
            subject.update_properties({'flxID':flx_id})
            log.info("Update BrowserTerm in flx2 for SubjectID/FlexID:%s/%s"%(subject.id, flx_id))
        else:
            log.info("Unable to update BrowserTerm in flx2 for SubjectID :: %s" %subject.id)
    except Exception, e:
        log.error('GraphDB Error: %s' % (str(e)), exc_info=e)
        raise GraphDBException('GraphDB Error. Please look at the log files for more information')
    return tx_node

@_transactional()
def deleteSubject(id, cookies=None, deleteBrowseTerm=True):
    # Get the Node form Graph Database.
    subject = _getSubjectByIDOrShortname(id)
    if not subject:
        raise Exception("No such subject by id or shortname: %s" % id)

    rels = ['contains']
    try:    
        subjectID = subject.id
        shortname = subject.shortname
        # First delete from browseTerms.
        if deleteBrowseTerm:
            # Delete browseTerm  from flx.
            _deleteBrowseTerm(shortname, cookies)
        # Delete subject node from taxonomy.
        deleteNodeAndRelations(subjectID, rels)
    except Exception, e:
        log.error('GraphDB Error: %s' % (str(e)), exc_info=e)
        raise GraphDBException('GraphDB Error. Please look at the log files for more information')

#
## Branch related.
#

@_transactional()
def getBranchByID(id):
    return __getNodeByAttribute(branch_index, 'id', id, nodeType='branch')

@_transactional()
def getBranchByShortname(shortname, subjectID=None):
    return _getBranchByShortname(shortname, subjectID)

def _getBranchByShortname(shortname, subjectID=None):
    shortname = str(shortname).upper()
    if subjectID:
        try:
            subjectID = int(subjectID)
            # Prepare cypher query to get node by subjectID and branch shortname when subject id is actual node id.
            qry = "START sub=node(%s) MATCH (sub)-[r:%s]->(br) WHERE br.shortname = '%s' RETURN br" %(subjectID, CONTAINS_REL, shortname)
        except:
            # Prepare cypher query to get node by subjectID and branch shortname when sy=ubject id is subject shortname.
            subjectID = str(subjectID).lower()
            qry = "START sub=node:subject('shortname:%s') MATCH (sub)-[r:%s]->(br) WHERE br.shortname = '%s' RETURN br" %(subjectID, CONTAINS_REL, shortname)
    else:
        # Prepare cypher query to get node by branch shortname.
        qry = "START br=node:branch('shortname:%s') RETURN br" %(shortname.lower())
    
    results = __getNodesByQuery(qry, is_single=True, nodeType='branch')
    if results:
        return results[0]
    else:
        return None


    return __getNodeByAttribute(branch_index, 'shortname', shortname, nodeType='branch')

def getBranchByIDOrShortname(id, subjectID=None):
    return _getBranchByIDOrShortname(id, subjectID=subjectID)

def _getBranchByIDOrShortname(id, subjectID=None):
    try: 
        id = int(id)
        return __getNodeByAttribute(branch_index, 'id', id, nodeType='branch')
    except:
        shortname = id
        return _getBranchByShortname(shortname, subjectID)
    return None

@_transactional()
def getBranchNodeByHandle(handle):
    return __getNodeByAttribute(branch_index, 'handle', handle, nodeType='branch')

@_transactional()
def getBranchNodeByName(name):
    return __getNodeByAttribute(branch_index, 'name', name, nodeType='branch')

@_transactional()
def getBranches(subjectID=None, pageNum=1, pageSize=25):
    return _getBranches(subjectID, pageNum, pageSize)

def _getBranches(subjectID=None, pageNum=1, pageSize=25):
    if subjectID:
        try:
            subjectID = int(subjectID)
            # Prepare cypher query to get the branches filtered by subjectID when subjectID is actual Node ID.
            qry = "START sub=node(%s) MATCH (sub)-[r:%s]->(br) RETURN br" %(subjectID, CONTAINS_REL)        
        except:
            # Prepare cypher query to get the branches filtered by subjectID when subjectID is shortname.        
            subjectID = str(subjectID).lower()
            qry = "START sub=node:subject('shortname:%s') MATCH (sub)-[r:%s]->(br) RETURN br" %(subjectID, CONTAINS_REL)        
    else:
        # Prepare cypher query to get all the branches.
        qry = "START br=node:branch('nodeType:branch') RETURN br"
    exclude_qry = getExcludeQuery("hidden_branches", "br", "shortname")
    log.info("exclude_qry :%s" % exclude_qry)
    if exclude_qry:
        qry = qry.replace("RETURN br", "%s RETURN br" % exclude_qry)
    # Prepare result count query
    countQry = qry.replace('RETURN br', 'RETURN COUNT(br)')
    # Add the PgaeNum and PageSize constraint.
    qry = qry + " ORDER BY br.name"
    results = __getNodesByQuery(qry, pageNum=pageNum, pageSize=pageSize, nodeType='branch')

    results = sorted(results, key=lambda branch: branch.subject['name'])
    #Get the page from results.
    page = p.Page(results, pageNum, pageSize, isGraphModel=True)

    # Get the result count
    resultCount = __getResultsCount(countQry)
    page.total = resultCount 

    return page

@_transactional()
def getBranchesDict():
    branches = _getBranches()
    d = {}
    for b in branches:
        bd = b.asDict()
        bd['id'] = b.id
        d[b.name.lower()] = bd
        d['%s.%s'.lower() % (b.subject['shortname'], b.shortname)] = bd
    return d

@_transactional()
def getBranchByName(name):
    return __getNodeByAttribute(branch_index, 'name', name, nodeType='branch')

@_transactional()
def getBranchesBySubject(subjectID):
    return _getBranchesBySubject(subjectID)

def _getBranchesBySubject(subjectID):
    subjectID = str(subjectID)
    try:
        subjectID = int(subjectID)
        # Prepare cypher query to get node by subjectID.
        qry = "START sub=node(%s) MATCH (sub)-[r:%s]->(br) RETURN br" %(subjectID, CONTAINS_REL)
    except:
        # Prepare cypher query to get node by subject short name.
        qry = "START sub=node:subject('shortname:%s') MATCH (sub)-[r:%s]->(br) RETURN br" %(subjectID, CONTAINS_REL)
    # Exclude branches specified in configuration.
    exclude_qry = getExcludeQuery("hidden_branches", "br", "shortname")
    log.info("exclude_qry :%s" % exclude_qry)
    if exclude_qry:
        qry = qry.replace("RETURN br", "%s RETURN br" % exclude_qry)
    return __getNodesByQuery(qry, pageNum=1, pageSize=-1, nodeType='branch')

@_transactional()
def createBranch(**kwargs):
    _checkAttributes(['name', 'shortname', 'subjectID'], **kwargs)
    if not h.checkValue(kwargs['shortname']):
        raise Exception('Shortname can contain only alphabets and digits. Additionally it should contain atleast 1 alphabet')
    # verifying that no subject is having the same name as that of branch.
    if __getNodeByAttribute(subject_index, 'name', kwargs['name'], nodeType='subject'):
            raise Exception('Branch name should be unique across existing suject and branch names.')

    if not kwargs.get('created'):
        kwargs['created'] = str(datetime.now())
    if not kwargs.get('updated'):
        kwargs['updated'] = str(datetime.now())
    if not kwargs.get('previewImageUrl'):
        kwargs['previewImageUrl'] = None
    if not kwargs.get('bisac'):
        kwargs['bisac'] = None
    if not kwargs.get('description'):
        kwargs['description'] = None
    if not kwargs.get('handle'):
        kwargs['handle'] = graph_model.name2Handle(kwargs['name'])
    # Get the subject node.
    subjectID = kwargs['subjectID']
    subject_node = graph_db.node(subjectID)

    # Verify browseTerm does not exists in FLX.
    cookies = kwargs.get('cookies')
    if kwargs.has_key('cookies'):
        del kwargs['cookies']

    ex_branch = _getBranchByShortname(kwargs['shortname'], subjectID=subjectID)
    if ex_branch:
        raise Exception((u'shortname:%s should be unique under subject.' % kwargs['shortname']).encode('utf-8'))

    # branch handle should be unique across all subjects.
    handle = kwargs['handle']
    ex_node = getBranchNodeByHandle(handle)
    if ex_node:
        raise Exception((u'Branch node with handle:[%s] already exists.' %(handle)).encode('utf-8'))

    # TODO:Put node types at global location.
    kwargs['nodeType'] = 'branch'
    try:
        # Create branch node and add properties to index.
        tmp_node = graph_db.create(kwargs)
        branch_node = tmp_node[0]
        for index_key in BRANCH_INDEX_LIST:
            node_val = kwargs.get(index_key)
            if node_val:
                if isinstance(node_val, basestring):
                    node_val = node_val.lower()
                branch_index.add(index_key, node_val, branch_node)
        # Prepare the relation between subject and branch.
        rel_obj = rel(subject_node, CONTAINS_REL, branch_node)            
        graph_db.create(rel_obj)
        
        node_id = branch_node.id
        # Get the node object from branch node.
        tx_node = graph_model.getTaxonomyNodeFromGraphNode(branch_node, graph_db, nodeType='branch')

        flxID = _createBrowseTerm('branch', tx_node, cookies)
        if not flxID:
            # Not able to create the browseterm in flx.So delete the created node.
            deleteBranch(node_id, deleteBrowseTerm=False)
            raise Exception((u'Unable to create browseTerm in flx for Branch:%s.' % kwargs['name']).encode('utf-8'))
        # Update the flxID in branch node.
        setattr(tx_node, 'flxID', flxID)
        tx_node.info['flxID'] = flxID
        branch_node.update_properties({'flxID':flxID})
        log.info("Created BrowserTerm in flx2 for BranchID/FlexID:%s/%s"%(branch_node.id, flxID))

    except Exception, e:
        log.error('GraphDB Error: %s' % (str(e)), exc_info=e)
        raise GraphDBException('GraphDB Error. Please look at the log files for more information')
    return tx_node

@_transactional()
def updateBranch(**kwargs):
    _checkAttributes(['id'], **kwargs)
    #branch_node = graph_db.node(id)
    branch = getBranchByIDOrShortname(kwargs['id'])
    branch_node = graph_model.getGraphNodeFromTaxonomyNode(branch, graph_db)
    if not branch_node:
        raise Exception('No such branch for id: %s' % kwargs['id'])
    
    cookies = kwargs.get('cookies')
    if kwargs.has_key('cookies'):
        del kwargs['cookies']
    del kwargs['id']

    # To avoide any UnicodeDecodeError, Decode and then encode all properties with utf-8.
    node_dict = dict()
    for kw in kwargs:
        prop = kwargs[kw]       
        val = h.safe_decode(prop)
        val = h.safe_encode(val)      
        node_dict[kw] = val
    node_dict['updated'] = str(datetime.now())
    log.info("Updating Branch Node :: %s" % node_dict)

    # New name provided, so verify that branch with same name does not exists.
    name = node_dict.get('name')
    if name and name.lower() !=  str(branch_node['name']).lower():
        ex_node = getBranchNodeByName(name)
        if ex_node:
            raise Exception('Can not update Branch as Branch with name:%s already exists.' % name)

    # New shortname provided, so verify that branch with same shortname does not exists.
    shortname = node_dict.get('shortname')
    if shortname and shortname.lower() !=  str(branch_node['shortname']).lower():
        ex_node = getBranchByShortname(shortname)
        if ex_node:
            raise Exception('Can not update Branch as Branch with shortname:%s already exists.' % shortname)

    # New handle should be unique across all branches.
    handle = node_dict.get('handle')
    if handle and handle.lower() != str(branch_node['handle']).lower():
        ex_node = getBranchNodeByHandle(handle)
        if ex_node:
            raise Exception((u'Can not update Branch as Branch with handle:[%s] already exists.' %(handle)).encode('utf-8'))

    try:
        # Update node.
        old_node_dict = branch_node.get_properties()
        branch_node.update_properties(node_dict)

        # Index node properties.
        for index_key in BRANCH_INDEX_LIST:
            new_val = node_dict.get(index_key)
            if not new_val:
                continue
            if isinstance(new_val, basestring):
                new_val = new_val.lower()
            # Remove existing value
            old_val = old_node_dict.get(index_key, '')
            if old_val:
                if isinstance(old_val, basestring):
                    old_val = old_val.lower()
                if branch_index.get(index_key, old_val):
                    branch_index.remove(index_key, old_val, branch_node)
            branch_index.add(index_key, new_val, branch_node)
        
        tx_node = graph_model.getTaxonomyNodeFromGraphNode(branch_node, graph_db, nodeType='branch')    
        tx_node_dict = tx_node.asDict()

        url_info = _getRemoteFlxAPIInfo('update')
        server_url, api_path, timeout = url_info
        # Prepare POST parameters. 
        subjectEncodedID = tx_node.subjectID
        api_params = dict()
        api_params['passKey'] = 'I@mSt$'
        api_params['name'] = tx_node_dict.get('name', '')
        api_params['handle'] = tx_node_dict.get('handle', '')
        api_params['encodedID'] = '%s.%s' % (subjectEncodedID, tx_node_dict.get('shortname', ''))
        api_params['description'] = tx_node_dict.get('description', '')
        api_params['parentEncodedID'] = subjectEncodedID

        response = remoteapi.RemoteAPI._makeCall(server_url, api_path, timeout, params_dict=api_params, method='GET',auth_pass=cookies)
        # Update flex ID in concept node.
        if response:
            flx_id = response['response']['id']
            setattr(tx_node, 'flxID', flx_id)
            tx_node.info['flxID'] = flx_id
            branch_node.update_properties({'flxID':flx_id})
            log.info("Updated BrowserTerm in flx2 for BranchID/FlexID:%s/%s" % (branch_node.id, flx_id))
        else:
            log.info("Unable to update BrowserTerm in flx2 for BranchID :: %s" % branch_node.id)

    except Exception, e:
        log.error('GraphDB Error: %s' % (str(e)), exc_info=e)
        raise GraphDBException('GraphDB Error. Please look at the log files for more information')
    return tx_node

@_transactional()
def deleteBranch(id, cookies=None, deleteBrowseTerm=True):
    branch = _getBranchByIDOrShortname(id)
    if not branch:
        raise Exception("No such branch by id or shortname: %s" % id)
    # Delete branch and its relations.    
    rels = ['contains']
    try:
        branchID = branch.id
        shortname = branch.shortname
        subjectID = branch.subjectID        
        # Delete browseTerm  from flx.
        if deleteBrowseTerm:
            encodedID = '%s.%s' % (subjectID, shortname)
            _deleteBrowseTerm(encodedID, cookies)
        # Delete branch node from taxonomy.
        deleteNodeAndRelations(branchID, rels)

    except Exception, e:
        log.error('GraphDB Error: %s' % (str(e)), exc_info=e)
        raise GraphDBException('GraphDB Error. Please look at the log files for more information')

#
## Course Structure
#
def connectBranchesAndCourse(course,branches):
    course_node = None

    if isinstance(course, basestring):
        course_node = getCourseNode(course)
        if not course_node:
            raise Exception('Course node with course handle:: %s not found' % course)
        course_node = graph_db.node(course_node.id)
    elif isinstance(course, neo4j.Node):
        course_node = course
    else:
        raise Exception('Type error course :: ' % (type(course)))
    rels = []
    returnRels = []

    for branch in branches:
        existingRels = graph_db.match(start_node=graph_db.node(branch), rel_type=BRANCH_COURCE_REL, end_node=course_node)
        if existingRels:
            returnRels.extend(existingRels)
        else:
            rels.append( rel(graph_db.node(branch),BRANCH_COURCE_REL,course_node) )
    if rels:
        returnRels.extend(graph_db.create(*tuple(rels)))
    return returnRels #graph_db.create(*tuple(rels))


@_transactional()
def deleteCourseStructure(courseShortname):
    existingStructure = getCourseStructure(courseShortname)

    deleteUnitRels = '''start c = node:course('shortname:%s')
        match (c)-[cov:covers]->(un)-[inc:includes]->(n)
        where inc.course = '%s'
        delete cov,inc,un           
    '''
    deleteUnitRels = deleteUnitRels % (courseShortname,courseShortname)
    results, metadata = cypher.execute(graph_db, deleteUnitRels)

    deleteBranchHasCourse = ''' start crse = node:course('shortname:%s')
        match (br)-[hs:has]->(crse)
        delete hs
    '''
    deleteBranchHasCourse % (courseShortname)
    results, metadata = cypher.execute(graph_db, deleteBranchHasCourse)
    
    if getCourseStructure(courseShortname):
        raise Exception('Delete failed, course structure still exists')
    else:
        return existingStructure
    
@_transactional()
def createCourseStructure(**kwargs):
    courseHandleOrShortName = kwargs.get('course')
    if not courseHandleOrShortName:
        courseHandleOrShortName = kwargs.get('shortname')
    if not courseHandleOrShortName:
        courseHandleOrShortName = kwargs.get('handle')
    if not courseHandleOrShortName:
        raise Exception('Course shortname or handle is required to create structure.')
    courseTxNode = getCourseNode(courseHandleOrShortName)
    if not courseTxNode:
        raise Exception('Course node does not exist!')
    course_node = graph_db.node(courseTxNode.id)
    course_shortname = courseTxNode.shortname
    if getCourseStructure(course_shortname):
        raise Exception('course structure already exists!')
    
    courseStructure = kwargs['courseStructure']
    sequenceNum = 0
    branches = set()
    for seq, unitInfo in enumerate(courseStructure,start=1):
        unitTxNode, unitGraphDbNode = createUnitNode(unitInfo['name'],seq,unitInfo.get('handle',graph_model.name2Handle(unitInfo['name']) ),
				unitInfo.get('description',None),unitInfo.get('previewImageUrl',None), course=courseTxNode)
        for sequenceNum, eid in enumerate(unitInfo['conceptEIDs'],start=1):
            concept_node = getConceptNodeByEncodedID(eid)
            branches.add(concept_node.branch['branchID'])
            connectConceptNodeToUnit(graph_db.node(concept_node.id),unitGraphDbNode,course_shortname,unitTxNode.encodedID,sequenceNum)

    connectBranchesAndCourse(course_node,branches)
    return getCourseStructure(course_shortname)

def getCourseStructure(c):
    cs = graph_model.getCourseStructure(c,graph_db)
    if not cs:
        c = getCourseNodeByHandle(c)
        if c:
            cs = graph_model.getCourseStructure(c.shortname,graph_db)
    return cs

#
## Unit related
#

def connectUnitToCourseNode(course,unit, **kwargs):
    course_node = unit_node = None

    if isinstance(course, basestring):
        course_node = getCourseNode(course)
        if not course_node:
            raise Exception('Course node with course handle :: %s not found' % course)
        course_node = graph_db.node(course_node.id)
    elif isinstance(course, graph_model.courseNode):
        course_node = graph_db.node(course.id)
    elif isinstance(course, neo4j.Node):
        course_node = course
    else:
        raise Exception('Type error course :: ' % (type(course)))

    if isinstance(unit, basestring):
        unit_node = __getNodeByAttribute(unit_index, 'encodedID', unit, nodeType='unit')
        if not unit_node:
            raise Exception('Unit node with encodedID:: %s not found' % unit)
        unit_node = graph_db.node(unit_node.id)
    elif isinstance(unit,graph_model.unitNode):
        unit_node = graph_db.node(unit.id)
    elif isinstance(unit, neo4j.Node):
        unit_node = unit
    else:
        raise Exception('Type error unit :: ' % (type(unit)))

    existingRel = graph_db.match(start_node=course_node,end_node=unit_node,rel_type=COURSE_UNIT_REL)
    if existingRel:
        log.info('Relationship exists, returning')
        return existingRel
    return graph_db.create( rel(course_node,COURSE_UNIT_REL,unit_node ) )

def insertConceptNodeIntoUnit(unitEID,conceptID,insertAt):
    unit_node = __getNodeByAttribute(unit_index,'encodedID',unitEID,nodeType='unit')
    concept_node = _getConceptNodeByIDOrEncodedID(conceptID)
    if unit_node and concept_node:
        unit_node = graph_db.node(unit_node.id)
        courseRel = graph_db.match_one(end_node=unit_node,rel_type=COURSE_UNIT_REL)
        if courseRel:
            course_node = graph_model.getTaxonomyNodeFromGraphNode(courseRel.start_node,graph_db,nodeType='course')
            courseConceptsQry = '''start crse = node(%s)
                match (crse)-[:covers]->(unt)-[inc:includes]->(n)
                where inc.course = '%s' and unt.encodedID = '%s'
                return distinct
                crse.handle, crse.shortname, n.encodedID, ID(n), unt.handle,unt.encodedID,ID(unt), inc, inc.seq
                order by inc.seq
            '''
            courseConceptsQry = courseConceptsQry % (course_node.id, course_node.shortname,unitEID)  
            results, metadata = cypher.execute(graph_db, courseConceptsQry)
            if insertAt < 1:
                raise Exception('insertAt param must be a positive int')

            insertAt = insertAt - 1
            if results and insertAt < len(results):
                new_rel_seq = int(results[insertAt][-1].split('.')[-1])
                for result in results[insertAt:]:
                    existing_seq_prop = result[-1].split('.')
                    new_seq_prop = '.'.join(existing_seq_prop[:-1]) + ('.%03d' % (int(existing_seq_prop[-1])+1))
                    result[-2].update_properties({'seq':new_seq_prop})
            elif results and insertAt > len(results):
                new_rel_seq = len(results) + 1
            connectConceptNodeToUnit(graph_db.node(concept_node.id),unit_node,course_node.shortname,unitEID,new_rel_seq)
        else:
            raise Exception('Unit needs to be associated to a course before you add a concept node')
    else:
        if not unit_node:
           raise Exception('Unit with encodedID not found :: %s' % unitEID)
        else:
           raise Exception('Concept with ID/EID specified was not found :: %s' % conceptID)
    return getCourseStructure(course_node.shortname)

def connectConceptNodeToUnit(concept,unit,courseShortname,unitEID,sequenceNum, **kwargs):
    concept_node = unit_node = None
    if isinstance(concept, basestring):
        concept_node = __getNodeByAttribute(concept_index, 'encodedID', concept, nodeType='concept')
        if not concept_node:
            raise Exception('Concept node with encodedID:: %s not found' % concept)
        concept_node = graph_db.node(concept_node.id)
    elif isinstance(concept,neo4j.Node):
        concept_node = concept
    else:
        raise Exception('Type error concept :: ' % (type(concept)))

    if isinstance(unit, basestring):
        unit_node = __getNodeByAttribute(unit_index, 'encodedID', unit, nodeType='unit')
        if not unit_node:
            raise Exception('Unit node with encodedID:: %s not found' % unit)
        unit_node = graph_db.node(unit_node.id)
    elif isinstance(unit, neo4j.Node):
        unit_node = unit
    else:
        raise Exception('Type error unit :: ' % (type(unit)))

    n = int(sequenceNum)
    if  n < 0 or not unitEID.strip():
        raise Exception('unitEID and in valid integer sequenceNum are mandatory')

    seq_prop = '%s.%03d' % (unitEID,n)
    existingRels = graph_db.match(start_node=unit_node,end_node=concept_node,rel_type=UNIT_CONCEPT_REL)
    for existingRel in existingRels:
        props = existingRel.get_properties()
        if props.get('seq','')==seq_prop:
            log.info('Relationship already exists, returning')
            return [existingRel]
    return graph_db.create( rel((unit_node, (UNIT_CONCEPT_REL, {'seq':seq_prop, 'course':courseShortname}), concept_node )) )

def updateUnitNode(unitEID, **kwargs):
    _checkAttributes(['unitEID'],unitEID=unitEID)
    unitTxNode = __getNodeByAttribute(unit_index,'encodedID',unitEID,nodeType='unit')
    unitNode = graph_db.node(unitTxNode.id)    
    if not unitTxNode:
        raise Exception('Unit node with encodedID %s not found' % unitEID)

    if kwargs.has_key('cookies'):
        del kwargs['cookies']

    node_dict = {}
    newEID = kwargs.get('encodedID')
    if newEID:
        if newEID != unitEID and __getNodeByAttribute(unit_index,'encodedID',newEID,nodeType='unit'):
            raise Exception('Unit node with encodedID %s already exists' % newEID)
        else:
            node_dict['encodedID'] = newEID
    
    node_dict = {}
    for kw in kwargs:
        if kw in ['name','handle','description','previewImageUrl','created']:
            prop = kwargs[kw]       
            val = h.safe_decode(prop)
            val = h.safe_encode(val)      
            node_dict[kw] = val
    node_dict['updated'] = str(datetime.now())
    try:
        old_node_dict = unitNode.get_properties()
        unitNode.update_properties(node_dict)
        for index_key in UNIT_INDEX_LIST:
            new_val = node_dict.get(index_key)
            if new_val:
                if isinstance(new_val, basestring):
                    new_val = new_val.lower()
                old_val = old_node_dict.get(index_key, '')
                old_val = old_val.lower()
                if old_val and unit_index.get(index_key,old_val):
                    unit_index.remove(index_key, old_val,unitNode)
                unit_index.add(index_key, new_val, unitNode)
        rels = graph_db.match(rel_type=UNIT_CONCEPT_REL, start_node=unitNode)
        if node_dict.get('encodedID'):
            for rel in rels:
                newSeq = rel.get_properties().get('seq').replace(unitEID,node_dict.get('encodedID'))
                rel.update_properties({'seq':newSeq})
        newUnitNode = graph_model.getTaxonomyNodeFromGraphNode(unitNode, graph_db, nodeType='unit')
        return newUnitNode
    except Exception,e:
        log.error('GraphDB Error: %s' % (str(e)), exc_info=e)
        raise GraphDBException('GraphDB Error. Please look at the log files for more information')
    


def createUnitNode(name,seq,handle=None,description=None,previewImageUrl=None,course=None,**kwargs):
    _checkAttributes(['name','course'],name=name,course=course)
    courseTxNode =  None

    if isinstance(course, basestring):
        courseTxNode = getCourseNode(course)
        if not courseTxNode:
            raise Exception('Course node with course handle/shortname :: %s not found' % course)
    elif isinstance(course, graph_model.courseNode):
        courseTxNode = course
    elif isinstance(course, neo4j.Node):
        courseTxNode = graph_model.getTaxonomyNodeFromGraphNode(course,graph_db,'course')
    else:
        raise Exception('Type error course :: ' % (type(course)))

    encodedID = courseTxNode.shortname + '.%03d' % int(seq)

    if __getNodeByAttribute(unit_index, 'encodedID', encodedID, nodeType='unit'):
        raise Exception('Unit with encodedID %s already exists!' % encodedID)
    if not handle:
        handle = graph_db.name2Handle(name)
    if __getNodeByAttribute(unit_index, 'handle', handle, nodeType='unit'):
        raise Exception('Unit with handle %s already exists!' % handle)
    
    if not kwargs.get('created'):
        kwargs['created'] = str(datetime.now())
    if not kwargs.get('updated'):
        kwargs['updated'] = str(datetime.now())

    if kwargs.has_key('cookies'):
        del kwargs['cookies']

    node_dict ={'name':name,'handle':handle,'encodedID':encodedID,'description':description,'previewImageUrl':previewImageUrl,'nodeType':'unit','created':kwargs['created'],'updated':kwargs['updated']}

    for key,val in node_dict.iteritems():
        node_dict[key] = h.safe_encode( h.safe_decode(val) )
    
    try:
        node_info = graph_db.create(node_dict)
        new_node = node_info[0]
        log.info("Node Created :: %s" % new_node)
        
        for index_key in  UNIT_INDEX_LIST:
            node_val = node_dict.get(index_key)
            if node_val:
                if isinstance(node_val, basestring):
                    node_val = node_val.lower()
                unit_index.add(index_key, node_val, new_node)
        if course:
            connectUnitToCourseNode(courseTxNode,new_node)
        tx_node = graph_model.getTaxonomyNodeFromGraphNode(new_node, graph_db, nodeType='unit')
    except Exception, e:
        log.error('GraphDB Error: %s' % (str(e)), exc_info=e)
        raise GraphDBException('GraphDB Error. Please look at the log files for more information')
    return tx_node, new_node
        
    
#
## Course related
#


def getCourseNodeByHandle(courseHandle):
    return __getNodeByAttribute(course_index, 'handle', courseHandle, nodeType='course')

def getCourseNodeByShortname(shortname):
    return __getNodeByAttribute(course_index, 'shortname', shortname, nodeType='course')

def getCourseNode(sh):
    c = getCourseNodeByShortname(sh)
    if not c:
        c = getCourseNodeByHandle(sh)
    return c

@_transactional()
def createCourseNode(**kwargs):
    _checkAttributes(['name','country','shortname'],**kwargs)

    if not kwargs.get('shortname').isalpha():
        raise Exception('Shortname can contain only alphabets :: %s '% kwargs.get('shortname'))    
    if __getNodeByAttribute(course_index, 'shortname', kwargs['shortname'], nodeType='course'):
        raise Exception('Course with shortname already exists, please specify a different shortname.')

    if not kwargs.get('handle'):
       kwargs['handle']=graph_db.name2Handle(kwargs['name'])
    if __getNodeByAttribute(course_index, 'handle', kwargs['handle'], nodeType='course'):
        raise Exception('Course with handle already exists, please specify a different handle.')

    if not kwargs.get('created'):
        kwargs['created'] = str(datetime.now())
    if not kwargs.get('updated'):
        kwargs['updated'] = str(datetime.now())
    if not kwargs.get('previewImageUrl'):
        kwargs['previewImageUrl'] = None
    if not kwargs.get('description'):
        kwargs['description'] = None
        
    if kwargs.has_key('cookies'):
        del kwargs['cookies']

    kwargs['nodeType'] = 'course'    
    node_dict = {}
    for kw in kwargs:
        if kw == 'branches':
            continue
        prop = kwargs[kw]
        val = h.safe_decode(prop)
        val = h.safe_encode(val)
        node_dict[kw] = val
    try:
        log.info("Creating course node : %s" % kwargs)
        node_info = graph_db.create(node_dict)
        new_node = node_info[0]
        log.info("Node Created :: %s" % new_node)
    
        # Index node properties.
        for index_key in COURSE_INDEX_LIST:
            node_val = node_dict.get(index_key)
            if node_val:
                if isinstance(node_val, basestring):
                    node_val = node_val.lower()
                course_index.add(index_key, node_val, new_node)
        
        if kwargs.get('branches'):
            branches = [ _getBranchByIDOrShortname(b).id for b in kwargs['branches'] ]
            connectBranchesAndCourse(new_node,branches)
        tx_node = graph_model.getTaxonomyNodeFromGraphNode(new_node, graph_db, nodeType='course')
    except Exception, e:
        log.error('GraphDB Error: %s' % (str(e)), exc_info=e)
        raise GraphDBException('GraphDB Error. Please look at the log files for more information')
    return tx_node,new_node
        
@_transactional()
def updateCourseNode(c, **kwargs):
    courseTxNode = getCourseNode(c)
    courseNode = graph_db.node(courseTxNode.id)
    if not courseTxNode:
        raise Exception('Course with shortname/handle %s not found' % c)
    if kwargs.get('handle') and __getNodeByAttribute(course_index, 'handle', kwargs['handle'], nodeType='course'):
        raise Exception('Course with handle already exists, please specify a different handle.')

    if kwargs.has_key('cookies'):
        del kwargs['cookies']

    # To avoid any UnicodeDecodeError, Decode and then encode all properties with utf-8.
    node_dict = {}
    for kw in kwargs:
        if kw in ['name','handle','description','previewImageUrl','created','country']:
            prop = kwargs[kw]       
            val = h.safe_decode(prop)
            val = h.safe_encode(val)      
            node_dict[kw] = val
    node_dict['updated'] = str(datetime.now())

    try:
        old_node_dict = courseNode.get_properties()
        courseNode.update_properties(node_dict)
        for index_key in COURSE_INDEX_LIST:
            new_val = node_dict.get(index_key)
            if new_val:
                if isinstance(new_val, basestring):
                    new_val = new_val.lower()
                old_val = old_node_dict.get(index_key, '')
                old_val = old_val.lower()
                if old_val and course_index.get(index_key,old_val):
                    course_index.remove(index_key, old_val,courseNode)
                course_index.add(index_key, new_val, courseNode)
        newCourseNode = graph_model.getTaxonomyNodeFromGraphNode(courseNode, graph_db, nodeType='course')
        return newCourseNode
        
    except Exception, e:
        log.error('GraphDB Error: %s' % (str(e)), exc_info=e)
        raise GraphDBException('GraphDB Error. Please look at the log files for more information')
    
    
    


#
## Concept related.
#

@_transactional()
def getConceptNodeByID(id):
    return __getNodeByAttribute(concept_index, 'id', id, nodeType='concept')

@_transactional()
def getConceptNodeByEncodedID(encodedID, returnGraphNode=False):
    return __getNodeByAttribute(concept_index, 'encodedID', encodedID, nodeType='concept', returnGraphNode=returnGraphNode)

@_transactional()
def _getConceptNodeByIDOrEncodedID(id):
    try: 
        id = int(id)
        return __getNodeByAttribute(concept_index, 'id', id, nodeType='concept')
    except:
        encodedID = id
        return __getNodeByAttribute(concept_index, 'encodedID', encodedID, nodeType='concept')
    return None

@_transactional()
def getConceptNodeByHandle(handle):
    return __getNodeByAttribute(concept_index, 'handle', handle, nodeType='concept')

@_transactional()
def getConceptNodeWithHandle(handle, returnGraphNode=False):
    return __getNodeByAttribute(concept_index, 'handle', handle, nodeType='concept', returnGraphNode=returnGraphNode)

@_transactional()
def getConceptNodesWithHandle(handle, returnGraphNodes=False):
    return __getNodesByAttribute(concept_index, 'handle', handle, nodeType='concept', returnGraphNodes=returnGraphNodes)

@_transactional()
def getConceptNodeByOldHandle(oldHandle):
    return __getNodeByAttribute(concept_index, 'oldHandles', oldHandle, nodeType='concept')

@_transactional()
def getConceptNodeByRedirectedReference(redirectedReference):
    return __getNodeByAttribute(concept_index, 'redirectedReferences', redirectedReference, nodeType='concept')

@_transactional()
def getGraphConceptNodesByRedirectedReferences(redirectedReferences):
    if redirectedReferences:
        isFirstQueryPart = True
        query = "START gnode=node:concept(' "

        if not isFirstQueryPart:
            query = query + "AND "
        query = query+"( "
        isFirstQueryPartForQueryOption = True
        for redirectedReference in redirectedReferences:
            redirectedReference = redirectedReference.replace('-', '\\\\-').replace(':', '\\\\:').lower()
            if not isFirstQueryPartForQueryOption:
                query = query + "OR "
            query = query + "redirectedReferences:"+redirectedReference+ " "
            if isFirstQueryPartForQueryOption:
                isFirstQueryPartForQueryOption = False
            if isFirstQueryPart:
                isFirstQueryPart = False
        query = query+") "
        
        query = query+"') "
        query = query + "RETURN gnode"
        results, metadata = cypher.execute(graph_db, query)
        if results:
            nodes = [result[0] for result in results]
            return nodes
    return []

#encodedIDs, handles or oldHandles
@_transactional()
def getGraphConceptNodesByReferences(references):
    if references:
        isFirstQueryPart = True
        query = "START gnode=node:concept(' "
        
        if not isFirstQueryPart:
            query = query + "AND "
        query = query+"( "
        isFirstQueryPartForQueryOption = True
        for reference in references:
            reference = reference.replace('-', '\\\\-').replace(':', '\\\\:').lower()
            if not isFirstQueryPartForQueryOption:
                query = query + "OR " 
            query = query + "( "+ "handle:"+reference+" OR "+"encodedID:"+reference+" OR "+"oldHandles: "+reference +" )"
            if isFirstQueryPartForQueryOption:
                isFirstQueryPartForQueryOption  = False
            if isFirstQueryPart:
                isFirstQueryPart = False
        query = query+") "


        query = query+"') "
        query = query+"RETURN gnode"
        results, metadata = cypher.execute(graph_db, query)
        if results:
            nodes = [result[0] for result in results]
            return nodes
    return []

@_transactional()
def getConceptNodeWithName(name):
    return __getNodeByAttribute(concept_index, 'name', name, nodeType='concept')

@_transactional()
def getConceptNodesWithName(name):
    return __getNodesByAttribute(concept_index, 'name', name, nodeType='concept')

@_transactional()
def getConceptNodeByName(name):
    return __getNodeByAttribute(concept_index, 'name', name, nodeType='concept')

@_transactional()
def getConceptNodesByName(name, subjectID=None, branchID=None, pageNum=1, pageSize=10):
    # Search the index for given name.
    #search_attbs = ['name']
    """
    Sample Query : START sub=node(1), br=node(2),
                         con=node:concept('nodeType:concept AND (name:(addition))')
                         MATCH (sub)-[:contains]->(br)-[:contains]->(con)
                         RETURN con
    """
    head_parts = []
    # name = name.lower()
    # Handle quotes in concept name
    name = name.replace("'", "\\'")
    terms_qry = "con=node:concept('nodeType:concept AND (name:(\"%s\"))')" %(name)

    if subjectID:
        sub_qry = "sub=node(%s)" % subjectID
        head_parts.append(sub_qry)
    if branchID:
        br_qry = "br=node(%s)" % branchID
        head_parts.append(br_qry)

    head_parts.append(terms_qry)
    qry_part_1 = ','.join(head_parts)
    qry_part_2 = ' MATCH (sub)-[:contains]->(br)-[:contains]->(con) RETURN con'
    qry = 'START %s %s' % (qry_part_1, qry_part_2)

    results = __getNodesByQuery(qry, pageNum=pageNum, pageSize=pageSize, nodeType='concept')
    #Get the page from results.
    page = p.Page(results, pageNum, pageSize, isGraphModel=True)

    countQry = qry.replace("RETURN con", "RETURN COUNT(con)")
    # Get the result count
    resultCount = __getResultsCount(countQry)
    page.total = resultCount
    return page

@_transactional()
def getConceptNodesByHandle(handle, subjectID=None, branchID=None, pageNum=1, pageSize=10):
    # Search the index for given name.
    #search_attbs = ['name']
    """
    Sample Query : START sub=node(1), br=node(2),
                         con=node:concept('nodeType:concept AND (handle:("addition"))')
                         MATCH (sub)-[:contains]->(br)-[:contains]->(con)
                         RETURN con
    """
    head_parts = []
    handle = handle.lower()
    terms_qry = "con=node:concept('nodeType:concept AND (handle:(\"%s\"))')" %(handle)

    if subjectID:
        sub_qry = "sub=node(%s)" % subjectID
        head_parts.append(sub_qry)
    if branchID:
        br_qry = "br=node(%s)" % branchID
        head_parts.append(br_qry)

    head_parts.append(terms_qry)
    qry_part_1 = ','.join(head_parts)
    qry_part_2 = ' MATCH (sub)-[:contains]->(br)-[:contains]->(con) RETURN con'
    qry = 'START %s %s' % (qry_part_1, qry_part_2)

    results = __getNodesByQuery(qry, pageNum=pageNum, pageSize=pageSize, nodeType='concept')
    #Get the page from results.
    page = p.Page(results, pageNum, pageSize, isGraphModel=True)

    countQry = qry.replace("RETURN con", "RETURN COUNT(con)")
    # Get the result count
    resultCount = __getResultsCount(countQry)
    page.total = resultCount 
    return page

def getConceptNodesByEncodedIDs(encodedIDs, sub_br_dict):
    # Get all the nodes by encodedIDs
    props = ('created', 'description', 'encodedID', 'handle', 'name', 'parent', 'previewImageUrl', 'previewIconUrl', 'id')
    ret_qry = "node.created, node.description!, node.encodedID, node.handle, node.name, nodeParent.encodedID, node.previewImageUrl!, node.previewIconUrl!,ID(node)"
    encodedIDs = map(lambda x:x.lower(), encodedIDs)
    nodes = dict()
    start_index = 0
    end_index = 1000
    # Process encodedIDs in the batch of 1000 as the max boolean or clause limit for neo4j is 1024.
    while start_index < len(encodedIDs):
        tmp_eids =  encodedIDs[start_index:end_index]
        eid_qry = '(%s)' % ' OR '.join(tmp_eids)
        qry = "START node = node:concept('encodedID:%s') MATCH nodeParent-[?:parent]->node RETURN %s" % (eid_qry, ret_qry)
        #log.info("QRY :: %s" %qry)
        results, metadata = cypher.execute(graph_db, qry)
        # Prepare all the data
        map(lambda x:nodes.setdefault(x[2], sub_br_dict.copy()).update(dict(zip(props, x))), results)
        start_index += 1000
        end_index += 1000        
    #assert False
    return nodes

@_transactional()
def getConceptNodeIDsByName(name, subjectID=None, branchID=None):
    results = getConceptNodesByName(name, subjectID=subjectID, branchID=branchID, pageSize=-1)
    ids = []
    # Prepare list of ids.
    for result in results:
        ids.append(result.id)

    return ids

@_transactional()
def getConceptNodes(subjectID=None, branchID=None, toplevel=False, pageNum=1, pageSize=10):
    """
        Get all concept nodes paginated.
        Sample Query : 
            START sub=node:subject('shortname:mat'),
            br=node:branch('shortname:ari'),
            con=node:concept('nodeType:concept')   
            MATCH (nd)-[r?:parent]->(con)<-[:contains]-(br)<-[:contains]-(sub)
            WHERE r is NULL
            RETURN con
    """
    qry_parts = []
    ## Prepare the graph query.
    # Prepare starting part of the query.
    if subjectID:
        sub_qry = "sub=node(%s)" % subjectID
        qry_parts.append(sub_qry)
    if branchID:
        br_qry = "br=node(%s)" % branchID
        qry_parts.append(br_qry)

    if not qry_parts:
        # If subject or branch is not given then start node will be all concept nodes.     
        qry_parts.append("con=node:concept('nodeType:concept')")
    qry_start = ','.join(qry_parts)

    # Prepare middle part of the query
    qry_mid = '(sub)-[:contains]->(br)-[:contains]->(con)'    
    if subjectID or branchID:
        if toplevel:
            qry_mid = '<-[:contains]-(br)<-[:contains]-(sub)'
        else:
            qry_mid = '(sub)-[:contains]->(br)-[:contains]->(con)'            

    # Prepare end part of the query.    
    if toplevel:
        qry_end = 'MATCH (nd)-[r?:parent]->(con)%s WHERE r is NULL RETURN con' % qry_mid
    else:
        qry_end = 'MATCH %s RETURN con' % qry_mid

    qry = 'START %s %s' %(qry_start, qry_end)
    countQry = qry.replace('RETURN con', 'RETURN COUNT(con)')
    qry = qry + " ORDER BY con.orderedEncodedID"

    results = __getNodesByQuery(qry, pageNum=pageNum, pageSize=pageSize, nodeType='concept')
    #Get the page from results.
    page = p.Page(results, pageNum, pageSize, isGraphModel=True)

    # Get the result count
    resultCount = __getResultsCount(countQry)
    page.total = resultCount 

    return page

@_transactional()
def searchConceptNodes(term, subjectID=None, branchID=None, pageNum=1, pageSize=10):
    return _searchConceptNodes(term, subjectID=subjectID, branchID=branchID, pageNum=pageNum, pageSize=pageSize)

def _searchConceptNodes(term, subjectID=None, branchID=None, search_attbs=None, pageNum=1, pageSize=10):
    """
    Sample Query : START sub=node:subject('shortname:mat'),
                         br=node:branch('shortname:ari'),
                         con=node:concept(
                         'nodeType:concept AND (name:(*addition*) OR encodedID:(*addition*) OR description:(*addition*) OR keywords:(*addition*))')
                         MATCH (sub)-[:contains]->(br)-[:contains]->(con)
                         RETURN con
    """
    head_parts = []
    if not search_attbs:
        search_attbs = ['name', 'encodedID', 'description', 'keywords']
    lterm = term.lower().strip()
    # Clean the search term remove unnecessary characters and escape special characters.
    rm_chars = ['\'', '"', '[', ']', '{', '}', '<', '>']
    sp_chars = ['!', ')', '(', '+', '*', '-', '^', '&&', ':', '||', '?', '~']
    for rm_char in rm_chars:
        lterm = lterm.replace(rm_char, '')
    for sp_char in sp_chars:
        lterm = lterm.replace(sp_char, '\\\%s' % sp_char)

    log.info('lterm: [%s], subjectID: [%s], branchID: [%s]' %(lterm, subjectID, branchID))
    # Return zero results if search term is empty.
    if not (lterm or subjectID or branchID):
        #Get the page from results.
        page = p.Page([], pageNum, pageSize, isGraphModel=True)
        page.total = 0
        return page

    # Remove the stop words from search term.
    words = [lterm] + STOP_WORDS
    lterm = reduce(lambda x,y: x.replace(' %s '%y, ' '), words)

    terms = lterm.split()
    terms_qry = ''
    # Prepare the query from the given term.
    if terms:
        query_all = _build_search_query(lterm, search_attbs[1:], boost=True)
        query_name = _build_search_query(lterm, search_attbs[:1])
        terms_qry = '(%s^10000 OR %s)' % (query_name, query_all)
        """
        # Prepare the tmp query, Eg. if terms = ['add', 'sub'] then tmp_qry will be (*add* OR *sub*)
        tmp_qry = '(*%s*)' % '* OR *'.join(terms)
        # Prepare parts, Eg. parts = ['name:(*add* OR *sub*)','encodeID:(*add* OR *sub*)'....]
        parts = map(lambda x:'%s:%s'%(x,tmp_qry), search_attbs)
        wld_terms_qry = '%s' % ' OR '.join(parts)

        # Prepare parts for prefix query, Eg. parts = ['name:(add* OR sub*)','encodedID:(add* OR sub*)'....]
        prefix_parts = map(lambda x:'%s:((%s)*)^10'%(x,lterm), search_attbs)
        # Boost name with extra 50
        prefix_parts[0] = prefix_parts[0].replace(')^10', ')^10500')
        prefix_terms_qry = '%s' % ' OR '.join(prefix_parts)

        # Build phrase query
        ph_parts = map(lambda x:'%s:("%s")^1000'%(x,lterm), search_attbs)
        # Boost name with extra 50
        ph_parts[0] = ph_parts[0].replace(')^1000', ')^20500')
        ph_terms_qry = '%s' % ' OR '.join(ph_parts)
        #terms_qry = '(%s OR %s)' % (ph_terms_qry, wld_terms_qry)
        terms_qry = '(%s OR %s OR %s)' % (ph_terms_qry, prefix_terms_qry, wld_terms_qry)
        """
    log.info('terms_qry: [%s]' %(terms_qry))

    if subjectID:
        sub_qry = "sub=node(%s)" % subjectID
        head_parts.append(sub_qry)
    if branchID:
        br_qry = "br=node(%s)" % branchID
        head_parts.append(br_qry)

    # Prepare concept query
    if terms:
        con_qry = "con=node:concept('nodeType:concept AND %s')" % terms_qry
    else:
        con_qry = "con=node:concept('nodeType:concept')"
    head_parts.append(con_qry)
    qry_part_1 = ','.join(head_parts)
    qry_part_2 = ' MATCH (sub)-[:contains]->(br)-[:contains]->(con) RETURN con'
    qry = 'START %s %s' % (qry_part_1, qry_part_2)

    # Exclude branches specified in configuration.
    exclude_qry = getExcludeQuery("hidden_branches", "br", "shortname")
    log.info("exclude_qry :%s" % exclude_qry)
    if exclude_qry:
        qry = qry.replace("RETURN con", "%s RETURN con" % exclude_qry)        

    results = __getNodesByQuery(qry, pageNum=pageNum, pageSize=pageSize, nodeType='concept')

    #Get the page from results.
    page = p.Page(results, pageNum, pageSize, isGraphModel=True)

    count = 0
    if results:
        # Get results count.
        qry_part_3 = ' MATCH (sub)-[:contains]->(br)-[:contains]->(con) RETURN COUNT(con)'
        if exclude_qry:
            qry_part_3 = qry_part_3.replace("RETURN COUNT(con)", "%s RETURN COUNT(con)" % exclude_qry)                
        qry = 'START %s %s' % (qry_part_1, qry_part_3)
        try:
            qry = qry.decode('ascii')
        except:
            try:
                qry = qry.encode('utf-8')
            except:
                pass
        results, metadata = cypher.execute(graph_db, qry)
        count = results[0][0]
        
    page.total = count
    return page

def _build_search_query(lterm, search_attbs, boost=None):
    terms = lterm.split()
    # Prepare the tmp query, Eg. if terms = ['add', 'sub'] then tmp_qry will be (*add* OR *sub*)
    tmp_qry = '(*%s*)' % '* OR *'.join(terms)
    # Prepare parts, Eg. parts = ['name:(*add* OR *sub*)','encodeID:(*add* OR *sub*)'....]
    parts = map(lambda x:'%s:%s'%(x,tmp_qry), search_attbs)
    wld_terms_qry = '%s' % ' OR '.join(parts)
    # Prefix query, Eg. life science = > life* OR science*
    prefix_qry = ' OR '.join(['%s*' % term for term in terms])
    # Prepare parts for prefix query, Eg. parts = ['name:(add* OR sub*)','encodedID:(add* OR sub*)'....]
    if boost:
        prefix_parts = map(lambda x:'%s:(%s)^10'%(x, prefix_qry), search_attbs)
    else:
        prefix_parts = map(lambda x:'%s:(%s)'%(x, prefix_qry), search_attbs)
    prefix_terms_qry = '%s' % ' OR '.join(prefix_parts)
    # Build phrase query
    if boost:
        ph_parts = map(lambda x:'%s:("%s")^1000'%(x,lterm), search_attbs)
    else:
        ph_parts = map(lambda x:'%s:("%s")'%(x,lterm), search_attbs)
    ph_terms_qry = '%s' % ' OR '.join(ph_parts)
    #terms_qry = '(%s OR %s)' % (ph_terms_qry, wld_terms_qry)
    terms_qry = '(%s OR %s OR %s)' % (ph_terms_qry, prefix_terms_qry, wld_terms_qry)
    return terms_qry

@_transactional()
def getPrerequisiteConceptNodes(conceptNodeID, pageNum=1, pageSize=10):    
    qry = 'START con=node(%s) MATCH (con)-[:requires]->(req) RETURN req' % conceptNodeID    
    results = __getNodesByQuery(qry, pageNum=pageNum, pageSize=pageSize, nodeType='concept')

    #Get the page from results.
    page = p.Page(results, pageNum, pageSize, isGraphModel=True)
    countQry = qry.replace("RETURN req", "RETURN COUNT(req)")
    # Get the result count
    resultCount = __getResultsCount(countQry)
    page.total = resultCount 
    return page

@_transactional()
def getPostrequisiteConceptNodes(conceptNodeID, pageNum=1, pageSize=10):
    qry = 'START con=node(%s) MATCH (con)<-[:requires]-(req) RETURN req' % conceptNodeID    
    results = __getNodesByQuery(qry, pageNum=pageNum, pageSize=pageSize, nodeType='concept')

    #Get the page from results.
    page = p.Page(results, pageNum, pageSize, isGraphModel=True)
    countQry = qry.replace("RETURN req", "RETURN COUNT(req)")
    # Get the result count
    resultCount = __getResultsCount(countQry)
    page.total = resultCount 

    return page

@_transactional()
def getNextConceptNodes(id, pageNum=1, pageSize=10):
    return _getNextConceptNodes(id, pageNum, pageSize)

@_transactional()
def getNextConceptNode(id):
    page = _getNextConceptNodes(id, 1, 1)
    if page:
        return page.results[0]
    return None

def _getNextConceptNodes(id, pageNum=1, pageSize=10):
    """
    Sample Query ::
        START sub=node:subject('shortname:mat'),br=node:branch('shortname:ari'),con=node:concept('nodeType:concept')
        MATCH (sub)-[:contains]->(br)-[:contains]->(con)
        WHERE con.orderedEncodedID > 'MATARI11000000000000000000000000000000000000000000'
        RETURN DISTINCT con
        ORDER BY con.orderedEncodedID ASC
    """
    conceptNode = getConceptNodeByID(id)
    encodedID = conceptNode.encodedID
    orderedEncodedID = graph_model.getOrderedEncodedID(encodedID)
    subject, branch = encodedID.split('.')[:2]
    # Prepare query
    qry_start = "START sub=node:subject('shortname:%s'),br=node:branch('shortname:%s'),con=node:concept('nodeType:concept')" % (subject.lower(), branch.lower())
    qry_mid = "MATCH (sub)-[:contains]->(br)-[:contains]->(con) WHERE con.orderedEncodedID > '%s'" % orderedEncodedID
    qry_end = "RETURN DISTINCT con ORDER BY con.orderedEncodedID ASC"
    qry = "%s %s %s" % (qry_start, qry_mid, qry_end)

    cnt_qry_end = "RETURN DISTINCT COUNT(con)"
    countQry = "%s %s %s" % (qry_start, qry_mid, cnt_qry_end)

    results = __getNodesByQuery(qry, pageNum=pageNum, pageSize=pageSize, nodeType='concept')
    log.info("results :%s" % [r.encodedID for r in results])
    #Get the page from results.
    page = p.Page(results, pageNum, pageSize, isGraphModel=True)
    # Get the result count
    resultCount = __getResultsCount(countQry)
    page.total = resultCount 
    return page

@_transactional()
def getPreviousConceptNodes(id, pageNum=1, pageSize=10):
    return _getPreviousConceptNodes(id, pageNum, pageSize)

@_transactional()
def getPreviousConceptNode(id):
    prev = _getPreviousConceptNodes(id, pageNum=1, pageSize=1)
    if prev:
        return prev.results[0]
    return None

def _getPreviousConceptNodes(id, pageNum=1, pageSize=10):
    """
    Sample Query :
        START sub=node:subject('shortname:mat'),br=node:branch('shortname:ari'),con=node:concept('nodeType:concept')
        MATCH (sub)-[:contains]->(br)-[:contains]->(con)
        WHERE con.orderedEncodedID < 'MATARI11000000000000000000000000000000000000000000'
        RETURN DISTINCT con
        ORDER BY con.orderedEncodedID DESC
    """
    conceptNode = getConceptNodeByID(id)
    encodedID = conceptNode.encodedID
    orderedEncodedID = graph_model.getOrderedEncodedID(encodedID)
    subject, branch = encodedID.split('.')[:2]
    # Prepare query
    qry_start = "START sub=node:subject('shortname:%s'),br=node:branch('shortname:%s'),con=node:concept('nodeType:concept')" % (subject.lower(), branch.lower())
    qry_mid = "MATCH (sub)-[:contains]->(br)-[:contains]->(con) WHERE con.orderedEncodedID < '%s'" % orderedEncodedID
    qry_end = "RETURN DISTINCT con ORDER BY con.orderedEncodedID DESC"
    cnt_qry_end = "RETURN DISTINCT COUNT(con)"

    qry = "%s %s %s " %(qry_start, qry_mid, qry_end)
    countQry = "%s %s %s " %(qry_start, qry_mid, cnt_qry_end)

    results = __getNodesByQuery(qry, pageNum=pageNum, pageSize=pageSize, nodeType='concept')
    #Get the page from results.
    page = p.Page(results, pageNum, pageSize, isGraphModel=True)
    # Get the result count
    resultCount = __getResultsCount(countQry)
    page.total = resultCount 

    return page

@_transactional()
def getFundamentalConceptNodes(subjectID, branchID, pageNum=1, pageSize=10):
    # Prepare query
    qry_start = "START sub=node(%s), br=node(%s) MATCH sub-[:contains]->br-[:contains]->con" % (subjectID, branchID)
    qry_end = "WITH con MATCH con-[r?:requires]->prerequisites WHERE r IS NULL RETURN con"
    qry = "%s %s" % (qry_start, qry_end)

    results = __getNodesByQuery(qry, pageNum=pageNum, pageSize=pageSize, nodeType='concept')
    #Get the page from results.
    page = p.Page(results, pageNum, pageSize, isGraphModel=True)
    countQry = qry.replace("RETURN con", "RETURN COUNT(con)")
    # Get the result count
    resultCount = __getResultsCount(countQry)
    page.total = resultCount 

    return page

@_transactional()
def createConceptNode(**kwargs):
    """
        Create a new concept node
    """
    _checkAttributes(['encodedID', 'name', 'subjectID', 'branchID'], **kwargs)
    kwargs['encodedID'] = h.formatEncodedID(kwargs['encodedID'])
    encodedID = kwargs['encodedID']
    if not encodedID:
        raise Exception('EncodedID not specified. Please specify an encodedID')
    ex_node = getConceptNodeByEncodedID(kwargs['encodedID'])
    if ex_node:
        raise Exception('Concept node with encodedID:[%s] already exists.' % encodedID)
    if not kwargs.get('handle'):
        kwargs['handle'] = graph_model.name2Handle(kwargs['name'])

    # concept handle should be unique across all subject and branches.
    handle = kwargs['handle']
    ex_node = getConceptNodeByHandle(handle)
    if ex_node:
        raise Exception((u'Concept node with handle:[%s] already exists.' %(handle)).encode('utf-8'))
    
    ex_node = getConceptNodeByOldHandle(handle)
    if ex_node:
        raise Exception((u'Concept node with handle:[%s] already exists.' %(handle)).encode('utf-8'))


    # concept name should be unique under particular branch.
    name = kwargs['name']
    subject_id = kwargs.get('subjectID')
    branch_id = kwargs.get('branchID')
    ex_node = getConceptNodesByName(name, subjectID=subject_id, branchID=branch_id, pageNum=1, pageSize=10)
    if ex_node.total != 0:
        raise Exception((u'Concept node with name:[%s] already exists within the specified subject and branch.' % name).encode('utf-8'))

    cookies = kwargs.get('cookies')
    parent_id = kwargs.get('parentID')

    if not kwargs.get('created'):
        kwargs['created'] = str(datetime.now())
    if not kwargs.get('updated'):
        kwargs['updated'] = str(datetime.now())
    if not kwargs.get('status'):
        kwargs['status'] = 'proposed'
    if not kwargs.get('previewImageUrl'):
        kwargs['previewImageUrl'] = None
    if not kwargs.get('previewIconUrl'):
        kwargs['previewIconUrl'] = None
    if not kwargs.get('description'):
        kwargs['description'] = None

    for key in ['subjectID', 'branchID', 'parentID', 'cookies']:
        # Remove the keys that will not be stored.
        if kwargs.has_key(key):
            del kwargs[key]
    # Add node type and keywords property.
    kwargs['nodeType'] = 'concept'
    # Add ordered encode ID
    kwargs['orderedEncodedID'] = graph_model.getOrderedEncodedID(encodedID)
    kwargs['keywords'] = ''

    # redirectedReferences - will be a list of strings (handle / oldHandles / encodedIDs) by this step
    redirectedReferences = kwargs.get('redirectedReferences')
    if isinstance(redirectedReferences, list):
        if redirectedReferences:
            for redirectedReference in redirectedReferences[:]:
                if redirectedReference.startswith("-"):
                    redirectedReferences.remove(redirectedReference)
            
            completeRedirectedReferences = []
            redirectedGraphConceptNodes = getGraphConceptNodesByReferences(redirectedReferences)
            for redirectedGraphConceptNode in redirectedGraphConceptNodes:
                redirectedGraphConceptNodeProperties = redirectedGraphConceptNode._properties
                if not redirectedGraphConceptNodeProperties:
                    redirectedGraphConceptNodeProperties = redirectedGraphConceptNode.get_properties()

                if redirectedGraphConceptNodeProperties.get('handle'):
                    completeRedirectedReferences.append(redirectedGraphConceptNodeProperties.get('handle'))
                if redirectedGraphConceptNodeProperties.get('encodedID'):
                    completeRedirectedReferences.append(redirectedGraphConceptNodeProperties.get('encodedID'))
                if redirectedGraphConceptNodeProperties.get('oldHandles'):
                    completeRedirectedReferences.extend(redirectedGraphConceptNodeProperties.get('oldHandles'))
            completeRedirectedReferences.extend([redirectedReference for redirectedReference in redirectedReferences if redirectedReference not in completeRedirectedReferences])
            
            # multiple redirections detection
            redirectionGraphConceptNodes = getGraphConceptNodesByRedirectedReferences(completeRedirectedReferences)
            if redirectionGraphConceptNodes:
                raise Exception((u'One or More of the concept nodes for the given redirectedReferences:[%s] has a redirection already established to a different concept node in the database.' %(redirectedReferences)).encode('utf-8'))

            #redirection loop detection - not necessary
        kwargs['redirectedReferences'] = redirectedReferences


    # To avoide any UnicodeDecodeError, Decode and then encode all properties with utf-8.
    node_dict = {}
    for kw in kwargs:
        prop = kwargs[kw]
        val = h.safe_decode(prop)
        val = h.safe_encode(val)
        node_dict[kw] = val
    try:
        # Create node.
        log.info("Creating node :: %s" % kwargs)
        node_info = graph_db.create(node_dict)
        new_node = node_info[0]
        log.info("Node Created :: %s" % new_node.id)

        concept_id = new_node.id
        # Create the required relations for the node.
        if subject_id and branch_id:
            createSubjectContainsBranch(subject_id, branch_id)
        if branch_id:
            createBranchContainsConcept(branch_id, concept_id)
        if parent_id:
            createConceptNodeParent(concept_id, parent_id)

        tx_node = graph_model.getTaxonomyNodeFromGraphNode(new_node, graph_db, nodeType='concept')
        # Create browse term in flx.
        flxID = _createBrowseTerm('concept', tx_node, cookies)
        if not flxID:
            # Not able to create the browseterm in flx.So delete the created node.
            deleteConceptNode(concept_id, cookies=cookies, deleteBrowseTerm=False )
            raise Exception((u'Unable to create browseTerm in flx for Concept:%s.' % kwargs['name']).encode('utf-8'))

        # Update the newly created node with flxID
        setattr(tx_node, 'flxID', flxID)
        tx_node.info['flxID'] = flxID
        new_node.update_properties({'flxID':flxID})

        #Since FLX call is successfull, Index node properties now 
        #This peice code could be above the flx call as well, since when flx call fails.
        #We are deleting the node and that deleted the index entries as well.
        for index_key in CONCEPT_INDEX_LIST:
            node_val = node_dict.get(index_key)
            if node_val is not None:
                #Add the new index value
                if isinstance(node_val, basestring):
                    node_val = node_val.lower()
                    if node_val:
                        concept_index.add(index_key, node_val, new_node)
                elif isinstance(node_val, list) and all([isinstance(node_val_item, basestring) for node_val_item in node_val]):
                    for node_val_item in node_val:
                        node_val_item = node_val_item.lower()
                        if node_val_item:
                            concept_index.add(index_key, node_val_item, new_node)
    except Exception, e:
        log.error('GraphDB Error: %s' % (str(e)), exc_info=e)
        raise GraphDBException('GraphDB Error. Please look at the log files for more information. errorMessage: '+str(e))
    return tx_node

@_transactional()
def createConceptNodeKeywords(**kwargs):    
    id = kwargs.get('conceptNodeID')
    new_kw_list = kwargs.get('keywords', [])

    # Verify that the duplicate keywords are not provided.
    keywordList = map(lambda x:x.strip().lower(), new_kw_list)
    keywordList = filter(None, keywordList)

    if len(keywordList) != len(set(keywordList)):
        raise Exception("Duplicate keywords are not allowed.")

    dup_error = kwargs.get('error_on_duplicate', False)
    log.info('kwargs ::%s' %kwargs)
    try:
        concept_node = graph_db.node(id)
        if new_kw_list:
            try:
                ex_kw_list = concept_node['keywords']
            except:
                ex_kw_list = []
            # Case when new keywords already exists , we will add only new keywords.
            if ex_kw_list:
                lw_func = lambda x:x.lower()
                # Get the duplicate keywords.
                ex_kws = set(map(lw_func, ex_kw_list))
                nw_kws = set(map(lw_func, new_kw_list))
                # Verify that the no duplicate keywords exists and raise error accordingly.
                dup_kws = ex_kws.intersection(nw_kws)
                if dup_kws and dup_error:
                    raise TaxonomyException((u'Keywords:%s already exists in ConceptNode:%s' % (','.join(dup_kws), concept_node['name'])).encode('utf-8'))        

                # Get only the keywords that needs to be added.
                idx_kws = nw_kws.difference(ex_kws)
                ex_kw_list.extend(idx_kws)
            else:
                # No keywords already exists so add all the keywords.
                ex_kw_list = idx_kws = new_kw_list
             
            # Update the neo4j properties
            concept_node.update_properties({'keywords':ex_kw_list})
            # Index keywords.
            key = 'keywords'
            for value in idx_kws:
                if value:
                    if isinstance(value, basestring):
                        value = value.lower()
                    concept_index.add(key, value, concept_node)   
                    log.info("Created Index for property::key/value/node %s/%s/%s" % (key, value, concept_node['name']))
        tx_node = graph_model.getTaxonomyNodeFromGraphNode(concept_node, graph_db, nodeType='concept')
    except Exception, e:
        log.error('GraphDB Error: %s' % (str(e)), exc_info=e)
        raise GraphDBException('GraphDB Error. Please look at the log files for more information')
    return tx_node

@_transactional()
def createSubjectContainsBranch(subjectNodeID, branchNodeID):    
    try:
        subject_node = graph_db.node(subjectNodeID)    
        branch_node = graph_db.node(branchNodeID)    
        rels = graph_db.match(start_node=subject_node, rel_type=CONTAINS_REL, end_node=branch_node)
        if not rels:
            # Relation between Subject and Branch does not exist so create it.
            log.info("Creating Subject-Contains-Branch relation between :: %s-%s" %(subjectNodeID, branchNodeID))
            rel_obj = rel(subject_node, CONTAINS_REL, branch_node)
            results = graph_db.create(rel_obj)

            return results[0]
    except Exception, e:
        log.error('GraphDB Error: %s' % (str(e)), exc_info=e)
        raise GraphDBException('GraphDB Error. Please look at the log files for more information')

@_transactional()
def createBranchContainsConcept(branchNodeID, conceptNodeID):    
    try:
        branch_node = graph_db.node(branchNodeID)    
        concept_node = graph_db.node(conceptNodeID)    
        log.info("Creating Branch-Contains-Concept relation between :: %s-%s" %(branchNodeID, conceptNodeID))
        rel_obj = rel(branch_node, CONTAINS_REL, concept_node)
        results = graph_db.create(rel_obj)

        return results[0]
    except Exception, e:
        log.error('GraphDB Error: %s' % (str(e)), exc_info=e)
        raise GraphDBException('GraphDB Error. Please look at the log files for more information')

@_transactional()
def createConceptNodeParent(conceptNodeID, parentConceptNodeID):    
    try:
        concept_node = graph_db.node(conceptNodeID)
        parent_concept_node = graph_db.node(parentConceptNodeID)
        log.info("Creating Concept-Parent-Concept relation between :: %s-%s" %(parentConceptNodeID, conceptNodeID))
        rel_obj = rel(parent_concept_node, PARENT_REL, concept_node)
        results = graph_db.create(rel_obj)

        return results
    except Exception, e:
        log.error('GraphDB Error: %s' % (str(e)), exc_info=e)
        raise GraphDBException('GraphDB Error. Please look at the log files for more information')


@_transactional()
def createConceptNodeNeighbor(conceptNodeID, requiredConceptNodeID, cookies=None):
    # Verify that the same neighbour does not already exist.
    if existsConceptNodeNeighbor(conceptNodeID, requiredConceptNodeID):
        raise Exception("No such ConceptNodeNeighbor id: %s, requiredID: %s" % (conceptNodeID, requiredConceptNodeID))
    try:
        concept_node = graph_db.node(conceptNodeID)
        req_concept_node = graph_db.node(requiredConceptNodeID)
        log.info("Creating Concept-Requires-Concept relation between :: %s-%s" %(conceptNodeID, requiredConceptNodeID))
        rel_obj = rel(concept_node, REQUIRES_REL, req_concept_node)
        graph_db.create(rel_obj)

        req_txnode = graph_model.getTaxonomyNodeFromGraphNode(req_concept_node, graph_db, nodeType='concept')

        # Add the neighbor entry in flx.
        url_info = _getRemoteFlxAPIInfo('create_neighbor')
        server_url, api_path, timeout = url_info
        # Prepare POST parameters. 
        api_params = dict()
        api_params['encodedID'] = concept_node['encodedID']
        api_params['requiredEncodedID'] = req_concept_node['encodedID']
        remoteapi.RemoteAPI._makeCall(server_url, api_path, timeout, params_dict=api_params, method='GET',auth_pass=cookies)

        return req_txnode
    except Exception, e:
        log.error('GraphDB Error: %s' % (str(e)), exc_info=e)
        raise GraphDBException('GraphDB Error. Please look at the log files for more information')

@_transactional()
def deleteConceptNode(id, cookies=None, deleteBrowseTerm=True):
    try:
        concept_node = graph_db.node(id)
        if not concept_node:
            raise TaxonomyException('No such conceptNode by id: %s'% id)
        rels = ['parent', 'requires', 'contains', 'instances']
        encodedID = concept_node['encodedID']
        log.info("Deleting node ID/EID, %s/%s" % (id, encodedID))
        # Delete browseTerm  from flx.
        if deleteBrowseTerm:
            _deleteBrowseTerm(encodedID, cookies)
            log.info("Deleted the BrowseTerm.")
        # Get the rebuild information for the node to be deleted.
        rel_obj = getRebuildRelationForDeletedNode(id, REQUIRES_REL)
        # Delete concept node and its relations.
        deleteNodeAndRelations(id, rels)
        log.info("Deleted the node Relations.")
        # Save the Rebuilded relation object.
        if rel_obj:
            log.info("Saving the requires relation between the previous/next node of the deleted node.")
            graph_db.create(rel_obj)
    except Exception, e:
        log.error('GraphDB Error: %s' % (str(e)), exc_info=e)
        raise GraphDBException('GraphDB Error. Please look at the log files for more information')

@_transactional()
def deleteConceptNodeNeighbors(conceptNodeID, cookies=None):
    try:
        concept_node = graph_db.node(conceptNodeID)

        # Add the neighbor entry in flx.
        url_info = _getRemoteFlxAPIInfo('delete_neighbor')
        server_url, api_path, timeout = url_info
        # Prepare POST parameters. 
        api_params = dict()
        api_params['encodedID'] = concept_node['encodedID']
        remoteapi.RemoteAPI._makeCall(server_url, api_path, timeout, params_dict=api_params, method='GET',auth_pass=cookies)

        # Remove all the requires relations of a node.
        rels = graph_db.match(start_node=concept_node, rel_type=REQUIRES_REL)
        map(graph_db.delete, rels)

    except Exception, e:
        log.error('GraphDB Error: %s' % (str(e)), exc_info=e)
        raise GraphDBException('GraphDB Error. Please look at the log files for more information')

@_transactional()
def deleteConceptNodeKeywords(conceptNodeID):    
    try:
        concept_node = graph_db.node(conceptNodeID)
        kws_list = concept_node['keywords']
        if kws_list:
            kw_key = 'keywords'
            # Remove all empty strings and lowercase the items.    
            kws_list = map(lambda x: x.lower(), filter(None, kws_list))
            # Delete all the keywords
            for kw_val in kws_list:
                concept_index.remove(kw_key, kw_val, concept_node)  
                log.info("Deleted Index for property::key/value/node %s/%s/%s" % (kw_key, kw_val, concept_node['name']))
            # Delete/Update neo4j keywords property.
            kws_dict = {'keywords': []}
            concept_node.update_properties(kws_dict)
        tx_node = graph_model.getTaxonomyNodeFromGraphNode(concept_node, graph_db, nodeType='concept')    
    except Exception, e:
        log.error('GraphDB Error: %s' % (str(e)), exc_info=e)
        raise GraphDBException('GraphDB Error. Please look at the log files for more information')
    return tx_node

@_transactional()
def deleteConceptNodeKeyword(conceptNodeID, keyword):
    try:
        concept_node = graph_db.node(conceptNodeID)
        kws_list = concept_node['keywords']
        if not kws_list:
            raise TaxonomyException("No keyword exists for concept node (%s)" % conceptNodeID)

        kw_val = str(keyword).lower()
        # Remove all empty strings and lowercase the items.    
        kw_vals = map(lambda x: x.lower(), filter(None, kws_list))
        if kw_val not in kw_vals:
            raise TaxonomyException("No such keyword (%s) exists for concept node: %s" % (keyword, conceptNodeID))
        # Delete keyword from index.
        kw_key = 'keywords'
        concept_index.remove(kw_key, kw_val, concept_node)   
        log.info("Deleted Index for property::key/value/node %s/%s/%s" % (kw_key, kw_val, concept_node['name']))

        # Delete keyword from node.
        kw_index = kw_vals.index(kw_val)
        kws_list.pop(kw_index)
        kws_dict = {'keywords': kws_list}
        concept_node.update_properties(kws_dict)

        tx_node = graph_model.getTaxonomyNodeFromGraphNode(concept_node, graph_db, nodeType='concept')    
    except Exception, e:
        log.error('GraphDB Error: %s' % (str(e)), exc_info=e)
        raise GraphDBException('GraphDB Error. Please look at the log files for more information')

    return tx_node

@_transactional()
def updateConceptNode(**kwargs):
    """
        Update concept node
    """
    _checkAttributes(['id'], **kwargs)
    id = kwargs['id']
    subject_id = kwargs.get('subjectID')
    branch_id = kwargs.get('branchID')
    parent_id = kwargs.get('parentID')
    cookies = kwargs.get('cookies')
    persistOldHandles = kwargs.get('persistOldHandles')
    extendRedirectedReferences = kwargs.get('extendRedirectedReferences')
    
    concept_node = graph_db.node(id) 
    old_node_dict = concept_node.get_properties()  

    for key in ['id', 'subjectID', 'branchID', 'parentID', 'cookies', 'persistOldHandles', 'extendRedirectedReferences']:
        # Remove the keys that will not be stored.
        if kwargs.has_key(key):
            del kwargs[key]

    # To avoide any UnicodeDecodeError, Decode and then encode all properties with utf-8.
    node_dict = {}
    for kw in kwargs:
        prop = kwargs[kw]
        val = h.safe_decode(prop)
        val = h.safe_encode(val)
        node_dict[kw] = val

    node_dict['updated'] = str(datetime.now())
    log.info("Updating Concept Node :: %s" % node_dict)

    eid = node_dict.get('encodedID')
    eid_old = concept_node['encodedID']
    # New encodedID provided, so verify that node with same
    # EID does not exists.
    if eid and eid !=  eid_old:
        ex_node = getConceptNodeByEncodedID(eid)
        if ex_node:
            raise Exception('Can not update ConceptNode as node with encodedID:%s already exists.' % eid)

    # New handle should be unique across all branches.
    handle = node_dict.get('handle')
    if handle:
        if (handle !=  concept_node['handle']):
            ex_node = getConceptNodeByHandle(handle)
            if ex_node:
                raise Exception((u'Concept node with handle:[%s] already exists.' %(handle)).encode('utf-8'))

            old_handles = old_node_dict.get('oldHandles')
            if not old_handles or handle not in old_handles:
                ex_node = getConceptNodeByOldHandle(handle)
                if ex_node:
                    raise Exception((u'Concept node with handle:[%s] already exists.' %(handle)).encode('utf-8'))

            if old_handles and handle in old_handles:
                old_handles.remove(handle)
            
            if persistOldHandles:
                if not old_handles:
                    old_handles = [old_node_dict['handle']]
                else:
                    old_handles.append(old_node_dict['handle'])
            
            if old_handles:
                old_handles = list(set(old_handles))
                node_dict['oldHandles'] = old_handles

    # redirectedReferences - will be a list of strings (handle / oldHandles / encodedIDs) by this step
    redirectedReferences = node_dict.get('redirectedReferences')
    if isinstance(redirectedReferences, list):
        if redirectedReferences:
            oldRedirectedReferences = old_node_dict.get('redirectedReferences', [])
            for redirectedReference in redirectedReferences[:]:
                if redirectedReference.startswith("-"):
                    actualRedirectedReference = redirectedReference[1:]
                    redirectedReferences.remove(redirectedReference)
                    oldRedirectedReferences = filter(lambda a: a != actualRedirectedReference, oldRedirectedReferences)
            
            if extendRedirectedReferences:
                for oldRedirectedReference in oldRedirectedReferences:
                    if oldRedirectedReference not in redirectedReferences:
                        redirectedReferences.append(oldRedirectedReference)

            completeRedirectedReferences = []
            redirectedGraphConceptNodes = getGraphConceptNodesByReferences(redirectedReferences)
            for redirectedGraphConceptNode in redirectedGraphConceptNodes:
                redirectedGraphConceptNodeProperties = redirectedGraphConceptNode._properties
                if not redirectedGraphConceptNodeProperties:
                    redirectedGraphConceptNodeProperties = redirectedGraphConceptNode.get_properties()

                if redirectedGraphConceptNodeProperties.get('handle'):
                    completeRedirectedReferences.append(redirectedGraphConceptNodeProperties.get('handle'))
                if redirectedGraphConceptNodeProperties.get('encodedID'):
                    completeRedirectedReferences.append(redirectedGraphConceptNodeProperties.get('encodedID'))
                if redirectedGraphConceptNodeProperties.get('oldHandles'):
                    completeRedirectedReferences.extend(redirectedGraphConceptNodeProperties.get('oldHandles'))
            completeRedirectedReferences.extend([redirectedReference for redirectedReference in redirectedReferences if redirectedReference not in completeRedirectedReferences])
            
            # multiple redirections detection
            redirectionGraphConceptNodes = getGraphConceptNodesByRedirectedReferences(completeRedirectedReferences)
            redirectionGraphConceptNodes = [redirectionGraphConceptNode for redirectionGraphConceptNode in redirectionGraphConceptNodes if redirectionGraphConceptNode != concept_node]
            if redirectionGraphConceptNodes:
                raise Exception((u'One or More of the concept nodes for the given redirectedReferences:[%s] has a redirection already established to a different concept node in the database.' %(redirectedReferences)).encode('utf-8'))

            #redirection loop detection
            currentConceptReachableRedirectionGraphConceptNodesStep = [concept_node]
            while currentConceptReachableRedirectionGraphConceptNodesStep:
                if set(redirectedGraphConceptNodes).intersection(currentConceptReachableRedirectionGraphConceptNodesStep):
                    raise Exception((u'One or More of the concept nodes for the given redirectedReferences:[%s] creates a redirection loop when attached to the current concept node.' %(redirectedReferences)).encode('utf-8'))

                redirectedReferencesForNextStep = []
                for currentConceptReachableRedirectionGraphConceptNode in currentConceptReachableRedirectionGraphConceptNodesStep:
                    currentConceptReachableRedirectionGraphConceptNodeProperties = currentConceptReachableRedirectionGraphConceptNode._properties
                    if not currentConceptReachableRedirectionGraphConceptNodeProperties:
                        currentConceptReachableRedirectionGraphConceptNodeProperties = redirectionGraphConceptNode.get_properties()

                    if currentConceptReachableRedirectionGraphConceptNodeProperties.get('handle'):
                        redirectedReferencesForNextStep.append(currentConceptReachableRedirectionGraphConceptNodeProperties.get('handle'))
                    if currentConceptReachableRedirectionGraphConceptNodeProperties.get('encodedID'):
                        redirectedReferencesForNextStep.append(currentConceptReachableRedirectionGraphConceptNodeProperties.get('encodedID'))
                    if currentConceptReachableRedirectionGraphConceptNodeProperties.get('oldHandles'):
                        redirectedReferencesForNextStep.extend(currentConceptReachableRedirectionGraphConceptNodeProperties.get('oldHandles'))                
                
                currentConceptReachableRedirectionGraphConceptNodesStep = getGraphConceptNodesByRedirectedReferences(redirectedReferencesForNextStep)

        node_dict['redirectedReferences'] = redirectedReferences

    name = node_dict.get('name')
    try:
        # Neo4j stores data in utf-8 format, If name(from req) contains special characters 
        # then decode to utf-8 so that name comparison does not break.
        name = name.decode('utf-8')
    except:
        pass
    # New name should be unique under particular branch.
    if name and branch_id:
        tx_node = graph_model.getTaxonomyNodeFromGraphNode(concept_node, graph_db, nodeType='concept')
        curBranchID = tx_node.branch['branchID']
        if (name !=  concept_node['name']) or (str(branch_id) != str(curBranchID)):
            ex_node = getConceptNodesByName(name, subjectID=subject_id, branchID=branch_id, pageNum=1, pageSize=10)
            if ex_node.total != 0:
                raise Exception((u'Concept node with name:[%s] already exists within the specified subject and branch.' %(name)).encode('utf-8'))
    try:
        # Update node.
        concept_node.update_properties(node_dict)
        log.info("Concept node updated.")
        for kw in old_node_dict:
            prop = old_node_dict[kw]
            val = h.safe_decode(prop)
            val = h.safe_encode(val)
            old_node_dict[kw] = val

        update_subject_branch = False
        if subject_id and branch_id and parent_id:
            update_subject_branch = True
            update_dict = dict()
            update_dict['id'] = id
            update_dict['subjectID'] = subject_id
            update_dict['branchID'] = branch_id
            update_dict['parentID'] = parent_id
            _updateConceptSubjectBranchParent(**update_dict)

        update_flx = False
        for key in ['name', 'handle', 'encodedID', 'previewImageUrl', 'previewIconUrl','description']:
            if kwargs.has_key(key):
                update_flx = True
                break

        # Update domain terms in flx
        tx_node = graph_model.getTaxonomyNodeFromGraphNode(concept_node, graph_db, nodeType='concept')    
        if not (update_subject_branch or update_flx):
            log.info("Flx update not required.")
            return tx_node

        tx_node_dict = tx_node.asDict()
        # Prepare parameters for create request.
        url_info = _getRemoteFlxAPIInfo('update')
        server_url, api_path, timeout = url_info
        # Prepare POST parameters. 
        api_params = dict()
        flxID = concept_node['flxID']
        api_params['passKey'] = 'I@mSt$'
        api_params['id'] = flxID
        for key in ['name', 'handle', 'encodedID', 'previewImageUrl', 'previewIconUrl','description']:
            tmp_val = tx_node_dict.get(key, None)
            if tmp_val is None:
                tmp_val = ''
            api_params[key] = tmp_val

        if tx_node.parent:
            api_params['parentEncodedID'] = tx_node.parent['encodedID']

        #if the eid has changed, update the redirectedGraphConceptNode as well
        #is necessary only for the encodedID change but not handle as we have oldHandles functionality already implemented
        if eid and eid != eid_old:
            redirectionGraphConceptNodes = getGraphConceptNodesByRedirectedReferences([eid_old])
            if len(redirectionGraphConceptNodes) == 0:
                redirectionGraphConceptNode = None
            elif len(redirectionGraphConceptNodes) == 1:
                redirectionGraphConceptNode = redirectionGraphConceptNodes[0]
            else:
                raise Exception('Multiple redirection concept nodes are found for the given node with for eid or handle: %s' % eid_old)

            if redirectionGraphConceptNode:
                redirectionGraphConceptNodeProperties = redirectionGraphConceptNode._properties
                if not redirectionGraphConceptNodeProperties:
                    redirectionGraphConceptNodeProperties = redirectionGraphConceptNode.get_properties()
                redirectedReferences = redirectionGraphConceptNodeProperties.get('redirectedReferences')
                if redirectedReferences:
                    redirectedReferences = [ redirectedReference if redirectedReference != eid_old else eid for redirectedReference in redirectedReferences]
                    redirectionGraphConceptNode.update_properties({'redirectedReferences': redirectedReferences})
                    log.info("Redirection Concept node updated.")


        response = remoteapi.RemoteAPI._makeCall(server_url, api_path, timeout, params_dict=api_params, method='POST',auth_pass=cookies)
        # Update flex ID in concept node.
        if response:
            flx_id = response['response']['id']
            setattr(tx_node, 'flxID', flx_id)
            tx_node.info['flxID'] = flx_id
            concept_node.update_properties({'flxID':flx_id})
            log.info("Updated BrowserTerm in flx2 for ConceptID/FlexID:%s/%s"%(concept_node.id, flx_id))

            # Update the Indexs now since FLX call is successfull.
            for index_key in CONCEPT_INDEX_LIST:
                new_val = node_dict.get(index_key)
                if new_val is not None:
                    # Remove the already existing index value.
                    old_val = old_node_dict.get(index_key, '')
                    if isinstance(old_val, basestring):
                        old_val = old_val.lower()
                        if old_val:
                            areNodesPresentInConceptIndex = False
                            try:
                                nodesInConceptIndex = concept_index.get(index_key, old_val)
                                if nodesInConceptIndex:
                                    areNodesPresentInConceptIndex = True
                            except Exception, e:
                                pass
                            if areNodesPresentInConceptIndex:
                                concept_index.remove(index_key, old_val, concept_node)
                    elif isinstance(old_val, list) and all([isinstance(old_val_item, basestring) for old_val_item in old_val]):
                        for old_val_item in old_val:
                            old_val_item = old_val_item.lower()
                            if old_val_item:
                                areNodesPresentInConceptIndex = False
                                try:
                                    nodesInConceptIndex = concept_index.get(index_key, old_val_item)
                                    if nodesInConceptIndex:
                                        areNodesPresentInConceptIndex = True
                                except Exception, e:
                                    pass
                                if areNodesPresentInConceptIndex:
                                    concept_index.remove(index_key, old_val_item, concept_node)

                    #Add the new index value
                    if isinstance(new_val, basestring):
                        new_val = new_val.lower()
                        if new_val:
                            concept_index.add(index_key, new_val, concept_node)
                    elif isinstance(new_val, list) and all([isinstance(new_val_item, basestring) for new_val_item in new_val]):
                        for new_val_item in new_val:
                            new_val_item = new_val_item.lower()
                            if new_val_item:
                                concept_index.add(index_key, new_val_item, concept_node)
            log.info("Concept index updated.")
        else:
            log.info("Unable to updated BrowserTerm in flx2 for ConceptID :: %s" %concept_node.id)
            concept_node.set_properties(old_node_dict)
            tx_node = graph_model.getTaxonomyNodeFromGraphNode(concept_node, graph_db, nodeType='concept')  

    except Exception, e:
        concept_node.set_properties(old_node_dict)
        log.error('GraphDB Error: %s' % (str(e)), exc_info=e)
        raise GraphDBException('GraphDB Error. Please look at the log files for more information')
    return tx_node

@_transactional()
def _updateConceptSubjectBranchParent(**kwargs):
    """
    """
    id = kwargs['id']
    concept_node = graph_db.node(id)

    branch_id = kwargs.get('branchID')
    parent_id = kwargs.get('parentID')
    
    # Handle if  Branch is changed
    if branch_id:
        branch_node = graph_db.node(branch_id)
        rels = graph_db.match(rel_type=CONTAINS_REL, end_node=concept_node)
        if rels:
            old_rel = rels[0]
            # branch is changed
            if old_rel.start_node.id != branch_id:
                # Delete the old relation
                graph_db.delete(old_rel)
                # Create new relation
                new_rel = rel(branch_node, CONTAINS_REL, concept_node)
                graph_db.create(new_rel)

    if parent_id:
        parent_node = graph_db.node(parent_id)
        # Handle if  Parent is changed
        rels = graph_db.match(rel_type=PARENT_REL, end_node=concept_node)
        if rels:
            old_rel = rels[0]
            # parent is changed
            if old_rel.start_node.id != parent_id:
                # Delete the old relation
                graph_db.delete(old_rel)
                # Create new relation
                new_rel = rel(parent_node, PARENT_REL, concept_node)
                graph_db.create(new_rel)

@_transactional()
def existsConceptNode(conceptNodeID):
    return _getConceptNodeByIDOrEncodedID(conceptNodeID) is not None

@_transactional()
def getKeywordsForConceptNode(conceptNodeID):
    concept_node = getConceptNodeByID(conceptNodeID)
    return concept_node.keywords

@_transactional()
def getConceptNodeAncestors(id):
    """
    Sample Query:
        START con=node(8836)
        MATCH (con)<-[:parent*1..]-(par)
        RETURN par
    """
    ancestors = []
    #concept_node = getConceptNodeByID(id)
    #if not concept_node:
    #    raise Exception("No such concept node: %s" % id)

    qry = "START con=node(%s) MATCH (con)<-[:parent*1..7]-(par) RETURN par" % id
    results = __getNodesByQuery(qry,  pageNum=1, pageSize=-1, nodeType='concept')
    for parent in results:
        ancestors.append(parent)
        
    return ancestors

@_transactional()
def getConceptNodeDependants(id):
    """
    Sample Query:

	START con=node:concept('nodeType:concept AND encodedID:mat.alg.200')
	MATCH con<-[r:requires*0..]-dep
	WITH con, dep
	WHERE dep.encodedID =~ 'MAT.ALG.2.*'
	RETURN dep
    """
    dependants = []
    concept_node = getConceptNodeByID(id)
    if not concept_node:
        raise Exception("No such concept node: %s" % id)
    eid = concept_node.encodedID
    eid_part = eid[:9]
    qry = """
	START con=node:concept('nodeType:concept AND encodedID:%s')
	MATCH con<-[r:requires*0..]-dep
	WITH con, dep
	WHERE dep.encodedID =~ '%s.*'
	RETURN dep ORDER BY dep.encodedID
    """% (eid.lower(), eid_part.upper())
    results = __getNodesByQuery(qry,  pageNum=1, pageSize=-1, nodeType='concept')
    for dependant in results:
        dependants.append(dependant)
    # Skip the first node as it is the input node. 	
    dependants = dependants[1:] 

    return dependants
        
@_transactional()
def getConceptNodeChildren(id, pageNum=1, pageSize=10):
    concept_node = getConceptNodeByID(id)
    if not concept_node:
        raise Exception("No such concept node: %s" % id)

    qry = "START con=node(%s) MATCH (con)-[:parent]-(child) RETURN child" % id

    results = __getNodesByQuery(qry, pageNum=pageNum, pageSize=pageSize, nodeType='concept')

    #Get the page from results.
    page = p.Page(results, pageNum, pageSize, isGraphModel=True)
    # Get the result count
    countQry = qry.replace("RETURN child", "RETURN COUNT(child)")
    resultCount = __getResultsCount(countQry)
    page.total = resultCount 
    return page

def getConceptNodeChildrensMap(encodedID, nodeType, level=None):
    """
    Sample Query Concept :
        START parentNode = node:concept('encodedID:sci.bio.110')
        MATCH fullpath = parentNode-[p:parent*1..2]->m
        WITH m, fullpath, p
        RETURN extract (x in nodes(fullpath):x.encodedID) as path
        ORDER BY m.encodedID

    Sample Query Branch :
        START branchNode = node:branch('shortname:bio')
        MATCH branchNode-[p:contains]->n
        WITH n MATCH n<-[p?:parent]-(m)
        WHERE p is null
        WITH n as topLevelNode
        MATCH fullpath = topLevelNode-[p1:parent*1..2]->m
        WITH m, fullpath, p1
        RETURN extract (x in nodes(fullpath):x.encodedID) as path
        ORDER BY m.encodedID
    """
    encodedID = encodedID.lower()
    # Prpare query    
    if nodeType == "conceptNode":        
        # Need to increment the level as we need the childcount for the last childrens.
        level += 1
        qry_start = "START parentNode = node:concept('encodedID:%s')" % encodedID
        qry_mid = "MATCH fullpath = parentNode-[p:parent*1..%s]->m WITH m, fullpath, p" % level
        qry_end = "RETURN extract (x in nodes(fullpath):x.encodedID) as path ORDER BY m.encodedID"
    else:
        qry_start = "START branchNode = node:branch('shortname:%s')" % encodedID
        qry_mid = "MATCH branchNode-[p:contains]->n WITH n MATCH n<-[p?:parent]-(m) WHERE p is null WITH n as topLevelNode MATCH fullpath = topLevelNode-[p1:parent*1..%s]->m WITH m, fullpath, p1" % level
        qry_end = "RETURN extract (x in nodes(fullpath):x.encodedID) as path ORDER BY m.encodedID"

    qry = "%s %s %s" % (qry_start, qry_mid, qry_end)
    log.info("Executing query ::%s" % qry)
    results, metadata = cypher.execute(graph_db, qry)
    if nodeType == "branch":
        encodedID = encodedID.upper()
        for record in results:
            # Insert the branch as the first element.
            record[0] = [encodedID] + record[0]
    node_map = {}
    for record in results:
        # Get the Path Eg. [u'SCI.BIO.110', u'SCI.BIO.116', u'SCI.BIO.116.1']
        path = record[0]
        parent = None
        # Go through each element in path and build the node map containing the 
        # child list for every element in path.
        for elmt in path:
            if elmt not in node_map:
                node_map[elmt] = []
                if parent:
                  node_map[parent].append(elmt)  
            else:
                if parent and elmt not in node_map[parent]:
                    node_map[parent].append(elmt)
            parent = elmt     

    for eid in node_map:
        node_map[eid].sort()
    return node_map

def _getConceptNodeNeighbor(conceptNodeID, requiredConceptNodeID):
    concept_node = graph_db.node(conceptNodeID)
    req_concept_node = graph_db.node(requiredConceptNodeID)
    # Verify that the same neighbour does not already exist.
    rels = graph_db.match(start_node=concept_node, rel_type=REQUIRES_REL, end_node=req_concept_node, limit=1)
    if rels:
        return rels[0]

@_transactional()
def existsConceptNodeNeighbor(conceptNodeID, requiredConceptNodeID):
    return _getConceptNodeNeighbor(conceptNodeID, requiredConceptNodeID) is not None

@_transactional()
def deleteConceptNodeNeighbor(conceptNodeID, requiredConceptNodeID, cookies=None):
    neighbor = _getConceptNodeNeighbor(conceptNodeID, requiredConceptNodeID)
    if not neighbor:
        raise Exception("No such ConceptNodeNeighbor id: %s, requiredID: %s" % (conceptNodeID, requiredConceptNodeID))
    try:

        concept_node = graph_db.node(conceptNodeID)
        req_concept_node = graph_db.node(requiredConceptNodeID)

        # Add the neighbor entry in flx.
        url_info = _getRemoteFlxAPIInfo('delete_neighbor')
        server_url, api_path, timeout = url_info
        # Prepare POST parameters. 
        api_params = dict()
        api_params['encodedID'] = concept_node['encodedID']
        api_params['requiredEncodedID'] = req_concept_node['encodedID']

        remoteapi.RemoteAPI._makeCall(server_url, api_path, timeout, params_dict=api_params, method='GET',auth_pass=cookies)

        graph_db.delete(neighbor)
    except Exception, e:
        log.error('GraphDB Error: %s' % (str(e)), exc_info=e)
        raise GraphDBException('GraphDB Error. Please look at the log files for more information')

@_transactional()
def getConceptNodeRank(encodedID, toplevel=False):
    """
        Get rank of the given concept node within all concept nodes for its parent branch and subject
        Sample Query :

            START sub=node:subject('shortname:mat'),
            br=node:branch('shortname:alg'),
            con=node:concept('nodeType:concept')   
            MATCH (nd)-[r?:parent]->(con)<-[:contains]-(br)<-[:contains]-(sub)
            WHERE r is NULL
            WITH con
            WHERE con.encodedID <= 'MAT.ARI.500'
            RETURN con.encodedID
    """
    concept_node = getConceptNodeByEncodedID(encodedID)
    if not concept_node:
        raise Exception("No such concept node by encodedID: %s" % encodedID)
    orderedEncodedID = graph_model.getOrderedEncodedID(encodedID)
    sub_name = concept_node.subject['shortname'] 
    br_name = concept_node.branch['shortname']

    qry_start = "START sub=node:subject('shortname:%s'),br=node:branch('shortname:%s'),con=node:concept('nodeType:concept')" % (sub_name.lower(), br_name.lower())
    if toplevel:
        # Get all the nodes that do not have parents.
        qry_mid = "MATCH (nd)-[r?:parent]->(con)<-[:contains]-(br)<-[:contains]-(sub) WHERE r is NULL WITH con"
    else:
        qry_mid = "MATCH (sub)-[:contains]->(br)-[:contains]->(con)"        
    qry_end = "WHERE con.orderedEncodedID <= '%s' RETURN count(*)" % orderedEncodedID    

    qry = "%s %s %s" % (qry_start, qry_mid, qry_end)
    log.info("Query :: %s" %qry)
    
    results, metadata = cypher.execute(graph_db, qry)
    count = results[0][0]
    
    return count

def getConceptNodeKeywords(conceptNodeID):
    """
    """
    concept_node = getConceptNodeByID(conceptNodeID)
    if not concept_node:
        raise Exception("No such concept node by ID: %s" % conceptNodeID)
    try:
        kw_list = concept_node.keywords
    except:
        kw_list = []
    return kw_list

@_transactional()
def getConceptNodesByKeyword(keyword, excludeConceptNodeIDs=[], subjectID=None, branchID=None, pageNum=1, pageSize=10):
    """
        Get a list of concept nodes that match a given keyword
    """
    return _getConceptNodesByKeyword(keyword, excludeConceptNodeIDs=excludeConceptNodeIDs, subjectID=subjectID, branchID=branchID, countOnly=False, pageNum=pageNum, pageSize=pageSize)

def _getConceptNodesByKeyword(keyword, excludeConceptNodeIDs=[], subjectID=None, branchID=None, countOnly=False, pageNum=1, pageSize=10):
    # TODO: Handle excludeConceptNodeIDs.
    if not keyword:
        raise Exception("No keyword provided.")

    head_parts = []
    keyword = keyword.lower()    
    terms = keyword.split()
    con_qry = ''
    # Prepare the query from the given keyword.
    if terms:
        # Prepare the tmp query, Eg. if keyword = home loan then tmp_qry will be (*home* OR *loan*)
        tmp_qry = '(*%s*)' % '* OR *'.join(terms)
        kw_qry = 'keywords:%s' % tmp_qry
        con_qry = "con=node:concept('nodeType:concept AND %s')" % kw_qry
        head_parts.append(con_qry)
    if not con_qry:
        raise Exception("Unable to prepare keywords query.")
        
    if subjectID:
        sub_qry = "sub=node(%s)" % subjectID
        head_parts.append(sub_qry)
    if branchID:
        br_qry = "br=node(%s)" % branchID
        head_parts.append(br_qry)

    qry_part_1 = ','.join(head_parts)
    qry_part_2 = ' MATCH (sub)-[:contains]->(br)-[:contains]->(con) RETURN con'
    qry = 'START %s %s' % (qry_part_1, qry_part_2)

    results = __getNodesByQuery(qry, pageNum=pageNum, pageSize=pageSize, nodeType='concept')
    #Get the page from results.
    page = p.Page(results, pageNum, pageSize, isGraphModel=True)
    # Get the result count
    countQry = qry.replace("RETURN con", "RETURN COUNT(con)")
    resultCount = __getResultsCount(countQry)
    page.total = resultCount 
    return page

@_transactional()
def deleteNodeAndRelations(nodeID, rels, deleteNode=True):
    log.info("Deleting concept conceptEID/relations/deleteNode: %s/%s/%s" % (nodeID, str(rels), deleteNode))
    # Delete relations first.
    if rels:
        rel_type = '|'.join(rels)
        qry = "START nd=node(%s) MATCH nd-[r:%s]-x RETURN DISTINCT r" % (nodeID, rel_type)
        results, metadata = cypher.execute(graph_db, qry)
        if results:
            # Delete the concept relations.
            rels = map(lambda x:x[0], results)
            map(graph_db.delete, rels)
    if deleteNode:
        concept_node = graph_db.node(nodeID)
        # Remove the indexed data.
        concept_index.remove(entity=concept_node)
        # Delete all the relations of the node.
        # Node might have relations present other than specified in input rels list
        concept_node.isolate()
        # Delete the concept node.
        concept_node.delete()

##
## ArtifactExtensionType related
##

@_transactional()
def getArtifactExtensionTypeByID(id):
    return __getNodeByAttribute(aet_index, 'id', id, nodeType='aet')

@_transactional()
def getArtifactExtensionTypeByName(typeName):
    return __getNodeByAttribute(aet_index, 'typeName', typeName, nodeType='aet')

@_transactional()
def getArtifactExtensionTypeByShortname(shortname):
    return __getNodeByAttribute(aet_index, 'shortname', shortname, nodeType='aet')

def _getArtifactExtensionTypeByIDOrShortname(id):
    try: 
        id = int(id)
        return __getNodeByAttribute(aet_index, 'id', id, nodeType='aet')
    except:
        shortname = id
        return __getNodeByAttribute(aet_index, 'shortname', shortname, nodeType='aet')
    return None

def getArtifactExtensionTypeByIDOrShortname(id):
    return _getArtifactExtensionTypeByIDOrShortname(id)
    
@_transactional()
def getArtifactExtensionTypes(status='published', pageNum=1, pageSize=10):
    """
    Sample Query :
        START aet=node:aet('nodeType:aet AND status:published')
        RETURN aet.typeName
        ORDER BY aet 
        SKIP 0
        LIMIT 10
    """
    qry_1 = "START aet=node:aet('nodeType:aet AND status:%s')" % status
    qry_2 = "RETURN aet ORDER BY aet.typeName"
    qry = "%s %s" % (qry_1, qry_2)

    results = __getNodesByQuery(qry, pageNum=pageNum, pageSize=pageSize, nodeType='aet')
    #Get the page from results.
    page = p.Page(results, pageNum, pageSize, isGraphModel=True)
    countQry = qry.replace("RETURN aet ORDER BY aet.typeName", "RETURN COUNT(aet)")
    # Get the result count
    resultCount = __getResultsCount(countQry)
    page.total = resultCount
    return page

@_transactional()
def createArtifactExtensionType(**kwargs):
    _checkAttributes(['typeName', 'shortname'], **kwargs)
    if not h.checkValue(kwargs['shortname']):
        raise Exception('Shortname can contain only alphabets and digits. Additionally it should contain atleast 1 alphabet')
    if not kwargs.get('status'):
        kwargs['status'] = 'published'
    if not kwargs.get('created'):
        kwargs['created'] = str(datetime.now())
    if not kwargs.get('updated'):
        kwargs['updated'] = str(datetime.now())

    kwargs['nodeType'] = 'aet'

    # Verify that node with the same shortname does not exists already.
    if getArtifactExtensionTypeByShortname(kwargs['shortname']):
        raise Exception('ArtifactExtensionType node with shortname:%s already exist.' %(kwargs['shortname']))
    if getArtifactExtensionTypeByName(kwargs['typeName']):
        raise Exception('ArtifactExtensionType node with typeName:%s already exist.' %(kwargs['typeName']))
    try:
        # Create artifact node.
        tmp_node = graph_db.create(kwargs)
        aet_node = tmp_node[0]
        # Create indexes for artifact properties.
        for index_prop in AET_INDEX_LIST:
            node_prop = kwargs.get(index_prop)
            if node_prop:
                if isinstance(node_prop, basestring):
                    node_prop = node_prop.lower()
                aet_index.add(index_prop, node_prop, aet_node)

        # Get the node object from subject node.
        aet_txnode = graph_model.getTaxonomyNodeFromGraphNode(aet_node, graph_db, nodeType='aet')
    except Exception, e:
        log.error('GraphDB Error: %s' % (str(e)), exc_info=e)
        raise GraphDBException('GraphDB Error. Please look at the log files for more information')

    return aet_txnode

@_transactional()
def deleteArtifactExtensionType(id):
    try:
        try: 
            id = int(id)
            aet =  __getNodeByAttribute(aet_index, 'id', id, nodeType='aet')
        except:
            shortname = id
            aet = __getNodeByAttribute(aet_index, 'shortname', shortname, nodeType='aet')
        if not aet:
            raise TaxonomyException('No such artifact extension type by id or shortname: %s' % id)
        aet_id = aet.id
        rels = []
        deleteNodeAndRelations(aet_id, rels)
        return aet
    except Exception, e:
        log.error('GraphDB Error: %s' % (str(e)), exc_info=e)
        raise GraphDBException('GraphDB Error. Please look at the log files for more information')

@_transactional()
def updateArtifactExtensionType(**kwargs):
    _checkAttributes(['id'], **kwargs)
    id = kwargs['id']	
    aet_node = graph_db.node(id)    
    # Verify that AET object exists.
    if not aet_node:
        raise Exception('No such Artifact Exception Type for id: %s' % kwargs['id'])

    node_dict = dict()
    if kwargs.get('shortname'):
        if not h.checkValue(kwargs['shortname']):
            raise Exception('Shortname can contain only alphabets and digits. Additionally it should contain atleast 1 alphabet')
        aet_new = getArtifactExtensionTypeByShortname(kwargs['shortname'])
        if aet_new:
            if kwargs['shortname'] != aet_node['shortname']:
                raise Exception((u'Artifact Exception Type with Shortname : %s already exists.' % kwargs['shortname']).encode('utf-8'))
        node_dict['shortname'] = kwargs.get('shortname')

    if kwargs.get('typeName'):
        aet_new = getArtifactExtensionTypeByName(kwargs['typeName'])
        if aet_new:
            if kwargs['typeName'] != aet_node['typeName']:
                raise Exception((u'Artifact Exception Type with Name : %s already exists.' % kwargs['typeName']).encode('utf-8'))
        node_dict['typeName'] = kwargs.get('typeName')

    if kwargs.get('description'):
        node_dict['description'] = kwargs.get('description')

    node_dict['updated'] = str(datetime.now())

    try:
        # Update AEt Node.
        old_node_dict = aet_node.get_properties()
        aet_node.update_properties(node_dict)

        # Index node properties.
        for index_prop in AET_INDEX_LIST:
            node_prop = node_dict.get(index_prop)
            if node_prop:
                if isinstance(node_prop, basestring):
                    node_prop = node_prop.lower()
                old_val = old_node_dict.get(index_prop, '')
                old_val = old_val.lower()
                if old_val and aet_index.get(index_prop, old_val):
                    aet_index.remove(index_prop, old_val, aet_node)
                aet_index.add(index_prop, node_prop, aet_node)

            # Get the node object from subject node.
            aet_txnode = graph_model.getTaxonomyNodeFromGraphNode(aet_node, graph_db, nodeType='aet')
    except Exception, e:
        log.error('GraphDB Error: %s' % (str(e)), exc_info=e)
        raise GraphDBException('GraphDB Error. Please look at the log files for more information')
    return aet_txnode

@_transactional()
def createConceptNodeInstance(**kwargs):
    conceptNodeID = kwargs['conceptNodeID']
    artifactTypeID  = kwargs['artifactTypeID']
    sourceURL = kwargs['sourceURL']

    # Get the Instance Node if already exists.
    qry_1 = "START con=node(%s),aet=node(%s),cni=node:nodeinstance('nodeType:nodeinstance')" %(conceptNodeID, artifactTypeID)    
    qry_2 = "MATCH (con)-[:instances]->cni-[:sequences]->(aet)"
    qry_3 = "WITH cni WHERE cni.sourceURL! = '%s' RETURN cni" % (sourceURL)
    qry = "%s %s %s" % (qry_1, qry_2, qry_3)
    results, metadata = cypher.execute(graph_db, qry)
    if results:
        nodes = results[0]
        log.info("Concept node instance for concept/sourceURL/artifactType - : %s/%s/%s  already exists." % (conceptNodeID, sourceURL, artifactTypeID))
        cni_txnode = graph_model.getTaxonomyNodeFromGraphNode(nodes[0], graph_db, nodeType='nodeinstance')
        return cni_txnode
    
    # Instance node does not exist , so go ahead and create it.
    # First find the next seq number.    
    qry_1 = "START con=node(%s),aet=node(%s),cni=node:nodeinstance('nodeType:nodeinstance')" %(conceptNodeID, artifactTypeID)    
    qry_2 = "MATCH (con)-[:instances]->cni-[:sequences]->(aet) RETURN MAX(cni.seq)"
    qry = "%s %s" % (qry_1, qry_2)
    results, metadata = cypher.execute(graph_db, qry)
    try:
        seq = int(results[0][0])
        seq += 1
    except:
        seq = '1'

    log.info("Found the next seq number: %s" % seq)
    try:
        concept_node = graph_db.node(conceptNodeID)
        aet_node = graph_db.node(artifactTypeID)
        node_dict = dict()
        node_dict['seq'] = int(seq)
        node_dict['sourceURL'] = sourceURL
        node_dict['nodeType'] = 'nodeinstance'
        current_time = str(datetime.now())
        if not kwargs.get('created'):
            node_dict['created'] = current_time
        if not kwargs.get('updated'):
            node_dict['updated'] = current_time
        log.info('Creating Concept Instance Node : %s' % node_dict)
        # Create node instance.
        tmp_node = graph_db.create(node_dict)
        cni_node = tmp_node[0]
        # Create indexes for instance properties.
        for index_prop in CNI_INDEX_LIST:
            node_prop = node_dict.get(index_prop)
            if node_prop:
                if isinstance(node_prop, basestring):
                    node_prop = node_prop.lower()
                cni_index.add(index_prop, node_prop, cni_node)

        log.info("Creating Concept-Instances-ConceptInstance relation between :: %s-%s" %(conceptNodeID, cni_node.id))
        # Create ConceptNode-Instances-ConceptNodeInstance relation.
        rel_obj = rel(concept_node, INSTANCES_REL, cni_node)
        results = graph_db.create(rel_obj)

        log.info("Creating ConceptInstance-Sequences-ArtifactType relation between :: %s-%s" %(cni_node.id, artifactTypeID))
        # Create ConceptNodeInstance-Sequences-ArtifactExtensionType relation.
        rel_obj = rel(cni_node, SEQUENCES_REL ,aet_node)
        results = graph_db.create(rel_obj)

        # Get the node object from subject node.
        cni_txnode = graph_model.getTaxonomyNodeFromGraphNode(cni_node, graph_db, nodeType='nodeinstance')
    except Exception, e:
        log.error('GraphDB Error: %s' % (str(e)), exc_info=e)
        raise GraphDBException('GraphDB Error. Please look at the log files for more information')

    return cni_txnode

@_transactional()
def getConceptNodeInstances(conceptNodeID, pageNum=1, pageSize=10):
    qry = "START con=node(%s) MATCH con-[:instances]->cni RETURN cni" % conceptNodeID

    results = __getNodesByQuery(qry, pageNum=pageNum, pageSize=pageSize, nodeType='nodeinstance')
    #Get the page from results.
    page = p.Page(results, pageNum, pageSize, isGraphModel=True)
    countQry = qry.replace("RETURN cni", "RETURN COUNT(cni)")
    # Get the result count
    resultCount = __getResultsCount(countQry)
    page.total = resultCount
    return page

@_transactional()
def existsConceptNodeInstance(conceptNodeID, artifactTypeID, seq):
    qry_1 = "START con=node(%s),aet=node(%s),cni=node:nodeinstance('nodeType:nodeinstance')" %(conceptNodeID, artifactTypeID)    
    qry_2 = "MATCH (con)-[:instances]->cni-[:sequences]->(aet) WHERE cni.seq! = %s RETURN cni" %seq
    qry = "%s %s" % (qry_1, qry_2)
    results = __getNodesByQuery(qry, is_single=True, nodeType='nodeinstance')

    return results != []

@_transactional()
def deleteConceptNodeInstance(conceptNodeID, artifactTypeID, seq):
    """
    Sample Query :
        START con=node(96262),aet=node(96434),cni=node:cninstance('nodeType:nodeinstance')
        MATCH (con)-[:instances]->cni-[:sequences]->(aet)
        WHERE cni.seq! = 1
        RETURN cni.seq
    """
    qry_1 = "START con=node(%s),aet=node(%s),cni=node:nodeinstance('nodeType:nodeinstance')" % (conceptNodeID, artifactTypeID)
    qry_2 = "MATCH (con)-[:instances]->cni-[:sequences]->(aet) WITH cni WHERE cni.seq! = %s RETURN cni" % seq
    qry = "%s %s" % (qry_1, qry_2)
    results = __getNodesByQuery(qry, is_single=True, nodeType='nodeinstance')
    try:
        cni_node = results[0]
        # Delete node and its relations
        deleteNodeAndRelations(cni_node.id, ['instances', 'sequences'])
    except Exception, e:
        log.error('GraphDB Error: %s' % (str(e)), exc_info=e)
        raise GraphDBException('GraphDB Error. Please look at the log files for more information')

@_transactional()
def deleteConceptNodeInstances(conceptNodeID):
    """
    Sample Query :
        START con=node(9234)
        MATCH (con)-[:instances]->cni
        RETURN cni
    """
    qry_1 = "START con=node(%s)" % conceptNodeID
    qry_2 = "MATCH (con)-[:instances]->cni RETURN cni"
    qry = "%s %s" % (qry_1, qry_2)
    results = __getNodesByQuery(qry, pageNum=1, pageSize=-1, nodeType='nodeinstance')
    
    rels = ['instances', 'sequences']
    try:
        # Delete node and its relations.
        for result in results:
            deleteNodeAndRelations(result.id, rels)
    except Exception, e:
        log.error('GraphDB Error: %s' % (str(e)), exc_info=e)
        raise GraphDBException('GraphDB Error. Please look at the log files for more information')


@_transactional()
def getNodesByIDs(ids):
    nodes = []
    ids = map(str, ids)
    nodeIDs = ','.join(ids)    
    qry = 'START n=node(%s) RETURN n' % (nodeIDs)
    results, metadata = cypher.execute(graph_db, qry)
    if results:
        for result in results:
            nodes.append(result[0])
    return nodes

@_transactional()
def getNodeByID(id):
    id = int(str(id))
    node = graph_db.node(id)
    if not node.exists():
        raise Exception("Node with the id:%s does not exists." % id)

    # Get the node object from node.
    tx_node = graph_model.getTaxonomyNodeFromGraphNode(node, graph_db, nodeType=node['nodeType'])
    return tx_node

@_transactional()
def createNodeAttribute(**kwargs):
    tx_nodes = []
    nodes = getNodesByIDs(kwargs['nodeIDs'])
    attributeName = kwargs['attributeName']
    attributeValue = kwargs['attributeValue']
    node_dict = {attributeName: attributeValue}    
    try:    
        # Update the node property.
        for node in nodes:
            nodeType = node['nodeType']
            node.update_properties(node_dict)
            txnode = graph_model.getTaxonomyNodeFromGraphNode(node, graph_db, nodeType=nodeType)
            tx_nodes.append(txnode)
    except Exception, e:
        log.error('GraphDB Error: %s' % (str(e)), exc_info=e)
        raise GraphDBException('GraphDB Error. Please look at the log files for more information')
    return tx_nodes       

@_transactional()
def getNodesFromAttribute(nodeType, attributeName, attributeValue):
    qry = "START node=node(*) WHERE node.nodeType! = '%s' and node.%s! = '%s' RETURN node" % (nodeType.lower(), attributeName.lower(), attributeValue.lower())

    return __getNodesByQuery(qry,nodeType=nodeType)

@_transactional()
def createNodeRelation(**kwargs):
    from_id = kwargs['fromNode']
    to_id = kwargs['toNode']
    rel_type = kwargs['relType']
    rel_properties = kwargs.get('relProperties', {})
    throw_exception = kwargs.get('throwException', 0)
    if rel_type not in REL_TYPE_LIST:
        raise Exception("Invalid relation type provided.")
    try:
        from_node = graph_db.node(from_id)
        to_node = graph_db.node(to_id)
        rels = graph_db.match(start_node=from_node, rel_type=rel_type, end_node=to_node)
        if rels:
            raise TaxonomyException("Relation between fromNode:%s , toNode:%s of type %s already exists." % (from_id, to_id, rel_type))
        # Prepare relation    
        if rel_properties:
            rel_obj = rel(from_node, rel_type, to_node, **rel_properties)    
        else:
            rel_obj = rel(from_node, rel_type, to_node)    
        results = graph_db.create(rel_obj)
    except Exception, e:
        if throw_exception:
            raise
        log.error('GraphDB Error: %s' % (str(e)), exc_info=e)
        raise GraphDBException('GraphDB Error. Please look at the log files for more information')    
    return results

## 
## Activity Log related
##

@_transactional()
def createActivityLog(**kwargs):
    _checkAttributes(['activityType', 'actionObject', 'memberID'], **kwargs)
    if not kwargs.get('created'):
        kwargs['created'] = datetime.now()
    kwargs['created'] = str(kwargs['created'])

    kwargs['nodeType'] = 'activityLog'
    log_info = graph_db.create(kwargs)
    activityLog = log_info[0]
    return activityLog

def _getRemoteFlxAPIInfo(actionType):
    # Prepare the FLX API URL
    if actionType == 'create':
        api_url = config.get('flx_create_domain_term_api','')
    elif actionType == 'update':
        api_url = config.get('flx_update_domain_term_api','')
    elif actionType == 'delete':
        api_url = config.get('flx_delete_domain_term_api','')
    elif actionType == 'delete_branch':
        api_url = config.get('flx_delete_branch_api','')
    elif actionType == 'get':
        api_url = config.get('flx_get_domain_term_api','')
    elif actionType == 'create_neighbor':
        api_url = config.get('flx_create_domain_term_neighbor_api','')
    elif actionType == 'delete_neighbor':
        api_url = config.get('flx_delete_domain_term_neighbor_api','')
    
    url_info = urlparse(api_url)
    server_url = "%s://%s" % (url_info.scheme, url_info.netloc)
    api_path = url_info.path
    timeout = int(config.get('remote_server_timeout', 20))
    return (server_url, api_path, timeout)

def exportConceptNodeData(subjectID=None, branchID=None, pageSize=-1):
    """
    Sample Query :
                START sub=node:subject('shortname:sci'), br=node:branch('shortname:bio')
                MATCH sub-[:contains]->br-[:contains]->con<-[?:parent]-parentCon
                WITH con, parentCon
                MATCH con-[?:requires]->preReqs
                WITH con, parentCon, preReqs
                RETURN con.encodedID, con.name, con.handle,con.description!, parentCon.encodedID, con.keywords!, preReqs.encodedID
                ORDER BY con.orderedEncodedID
    """
    qry_parts = []
    if subjectID:
        sub_qry = "sub=node(%s)" % subjectID
        qry_parts.append(sub_qry)
    if branchID:
        br_qry = "br=node(%s)" % branchID
        qry_parts.append(br_qry)
    if not (subjectID or branchID):
        con_qry = "con=node:concept('nodeType:concept')"
        qry_parts.append(con_qry)

    qry_part_1 = ','.join(qry_parts)
    qry_part_2 = 'MATCH sub-[:contains]->br-[:contains]->con<-[?:parent]-parentCon WITH con, parentCon MATCH con-[?:requires]->preReqs WITH con, parentCon, preReqs'
    qry_part_3 = 'RETURN con.encodedID, con.name, con.handle,con.description!, parentCon.encodedID, preReqs.encodedID, con.keywords!'
    qry_part_4 = 'ORDER BY con.orderedEncodedID'
    qry = 'START %s %s %s %s' % (qry_part_1, qry_part_2, qry_part_3, qry_part_4)

    results, metadata = cypher.execute(graph_db, qry)
    tmp_dict = dict()
    for result in results:
        eid = result[0]
        if tmp_dict.get(eid):
            # Collect all the prerequisite nodes
            ex_rec = tmp_dict[eid]
            new_preq = '%s,%s' % (ex_rec[-1], result[-1])
            ex_rec[-1] = new_preq
            tmp_dict[eid] = ex_rec
        else:
            if isinstance(result[-2], list):
                # Collect all the keywords
                result[-2] = ','.join(result[-2])
            tmp_dict[eid] = result
    return tmp_dict.values()

def isBrowseTermExists(cookies, kwargs):
    """
    Returns browser term from flx.
    """
    # Prepare POST parameters. 
    api_params = dict()
    api_params['passKey'] = 'I@mSt$'
    for key in ['name', 'handle', 'encodedID', 'parentEncodedID']:
        if kwargs.get(key):        
            api_params[key] = kwargs[key]
    # If handle does not exist present then prepare from name.
    if not api_params.get('handle'):
        api_params['handle'] = graph_model.name2Handle(api_params.get('name', ''))

    url_info = _getRemoteFlxAPIInfo('get')
    server_url, api_path, timeout = url_info   
    response = remoteapi.RemoteAPI._makeCall(server_url, api_path, timeout, params_dict=api_params, method='GET',auth_pass=cookies)
    browseTermExists = response['response']['browseTermExists']
    msg = response['response']['msg']
    return (browseTermExists, msg)

def _createBrowseTerm(nodeType, tx_node, cookies):
    """
    Create browseTerm in Flx.
    """
    server_url, api_path, timeout = _getRemoteFlxAPIInfo('create')
    # Prepare POST parameters. 
    api_params = dict()
    api_params['passKey'] = 'I@mSt$'
    try:
        tx_node_dict = tx_node.asDict()
        if nodeType == 'subject':
            api_params['name'] =  tx_node_dict['name']
            api_params['handle'] =  graph_model.name2Handle(tx_node_dict['name'])
            api_params['encodedID'] =  tx_node_dict['shortname']
            api_params['description'] =  tx_node_dict.get('description', '')
        elif nodeType == 'branch':
            api_params['name'] = tx_node_dict['name']
            api_params['handle'] = tx_node_dict['handle']
            api_params['subjectEncodedID'] = tx_node_dict['subject']['shortname']
            api_params['encodedID'] = '%s.%s' % (tx_node_dict['subject']['shortname'], tx_node_dict['shortname'])
            api_params['description'] = tx_node_dict.get('description', '')      
        elif nodeType == 'concept':
            for key in ['name', 'handle', 'encodedID', 'previewImageUrl', 'previewIconUrl', 'description']:
                api_params[key] = tx_node_dict.get(key, '')
            # Do not add previewImageUrl if it is empty
            if not api_params['previewImageUrl']:
                del api_params['previewImageUrl']
            if not api_params['previewIconUrl']:
                del api_params['previewIconUrl']
            subject_eid = tx_node.subject['shortname']
            branch_eid = '%s.%s' % (tx_node.subject['shortname'], tx_node.branch['shortname'])        
            api_params['subjectEncodedID'] = subject_eid
            api_params['branchEncodedID'] = branch_eid
            if tx_node.parent:
                api_params['parentEncodedID'] = tx_node.parent['encodedID']
        response = remoteapi.RemoteAPI._makeCall(server_url, api_path, timeout, params_dict=api_params, method='GET',auth_pass=cookies)
        flxID = response['response']['id']
        log.info("In _createBrowseTerm flxID:%s" % flxID)
        return flxID
    except Exception, e:
        log.error('GraphDB Error: %s' % (str(e)), exc_info=e)


def _deleteBrowseTerm(encodedID, cookies):
    """
    Delete browse term from remote.
    """
    server_url, api_path, timeout = _getRemoteFlxAPIInfo('delete')
    api_params = dict()
    api_params['passKey'] = 'I@mSt$'
    api_params['encodedID'] = encodedID
    # Call remote API
    response = remoteapi.RemoteAPI._makeCall(server_url, api_path, timeout, params_dict=api_params, method='GET',auth_pass=cookies)
    flxID = response['response']['id']
    log.info("Deleted BrowserTerm in flx2 for encodedID/FlexID:%s/%s"%(encodedID, flxID))
    return flxID

def _deleteBranchBrowseTerm(encodedID, cookies):
    """
    Delete branch browse term from remote.
    """
    server_url, api_path, timeout = _getRemoteFlxAPIInfo('delete_branch')
    api_params = dict()
    api_params['passKey'] = 'I@mSt$'
    api_params['encodedID'] = encodedID
    # Call remote API
    response = remoteapi.RemoteAPI._makeCall(server_url, api_path, timeout, params_dict=api_params, method='GET',auth_pass=cookies)
    flxID = response['response']['id']
    log.info("Deleted Branch BrowserTerm in flx2 for encodedID/FlexID:%s/%s"%(encodedID, flxID))
    return flxID

@_transactional()
def createPrerequiresRelation(conceptNodeID, prerequireConcepts):
    # Verify that the conceptNode and prerequireConceptNodes already exists.
    if not existsConceptNode(conceptNodeID):
        raise Exception("No ConceptNode exists id: %s" % conceptNodeID)

    conceptNode = _getConceptNodeByIDOrEncodedID(conceptNodeID)
    conceptEID = conceptNode.encodedID.lower()
    conceptGraphNode = graph_db.node(conceptNode.id)
    

    for prerequireConcept in prerequireConcepts:
        prerequireConceptNodeID, weight = prerequireConcept
        prerequireConceptNodeID = prerequireConceptNodeID.lower()
        if conceptEID == prerequireConceptNodeID:
            raise Exception("Can not create prerequires relation to itself: %s" % conceptEID)
        if not existsConceptNode(prerequireConceptNodeID):
            raise Exception("No prerequireConceptNodeID exists id: %s" % prerequireConceptNodeID)

        rds = getCyclicDependency(conceptEID, prerequireConceptNodeID)
        if rds:
            raise Exception("Cyclic dependency exists, [%s]->prerequires->[%s]->prerequires->[..]->prerequires->[%s] at Level [%s]" % 
                                (conceptEID, prerequireConceptNodeID, conceptEID, rds[1]))

    # Delete all the exisitng prereuires relations for the conceptNode.
    deleteNodeAndRelations(conceptNode.id, [PREREQUIRES_REL], deleteNode=False)
    for prerequireConcept in prerequireConcepts:
        try:
            prerequireConceptNodeID, weight = prerequireConcept
            prerequireConceptNode = _getConceptNodeByIDOrEncodedID(prerequireConceptNodeID)
            prerequireConceptGraphNode = graph_db.node(prerequireConceptNode.id)
            log.info("Creating Concept-Prerequires-Concept relation between :: %s-%s" %(conceptNodeID, prerequireConceptNodeID))
            # Not storing the weight property in relation.
            relObj = rel((conceptGraphNode, PREREQUIRES_REL, prerequireConceptGraphNode))
            graph_db.create(relObj)
        except Exception, e:
            traceback.format_exc()
            log.error('GraphDB Error: %s' % (str(e)), exc_info=e)
            raise GraphDBException('GraphDB Error. Please look at the log files for more information')

    return getPrerequires(conceptNodeID)

def getCyclicDependency(conceptEID, preqEID):
    """Raises exception if any cyclic depedency exists.
    """
    query = """START con1=node:concept("encodedID:%s"), con2=node:concept("encodedID:%s")
               MATCH p = con1-[r:prerequires*]->con2
               RETURN COUNT(*), length(p)""" % (preqEID.lower(), conceptEID.lower())

    results, metadata = cypher.execute(graph_db, query)
    if results:
        return results[0]

def getPrerequires(conceptNodeID):
    prereqs_info = []
    conceptNode = _getConceptNodeByIDOrEncodedID(conceptNodeID)    
    if not conceptNode:
        raise Exception("No ConceptNode exists id: %s" % conceptNodeID)
        
    qry = "START nd=node(%s) MATCH nd-[r:%s]->x RETURN ID(x), r.priority! ORDER BY r.priority! DESC" % (conceptNodeID, PREREQUIRES_REL)
    results, metadata = cypher.execute(graph_db, qry)    
    prereqs_dict = dict()
    if results:
        for result in results:
            _id, priority = result
            prereqs_dict[_id] = priority
        _ids = prereqs_dict.keys()
        tx_nodes = graph_model.getTaxonomyNodesByIDs(_ids, graph_db, "concept")
        for tx_node in tx_nodes:
            tx_node_dict = tx_node.asDict()
            tx_node_dict['priority'] = prereqs_dict.get(tx_node.id)
            prereqs_info.append(tx_node_dict)
    return prereqs_info

def getChildsByLevel(eid, nodeType, level, nodeLevel):
    """Returns childs at each level, Eg. {'level_1':childs, 'level_2':childs...}
    """
    if nodeType == 'branch':
        eid = eid.split('.')[-1]

    level_childs = dict()
    def _getLevelChilds(eid, nodeLevel, levels):
        """Recursive function to get childrens.
        """
        childs = nodeMap.get(eid, [])
        if levels == 0:
            return
        for child in childs:
            node_dict = nodes.get(child, {})
            id = node_dict.get('id', -1)
            # Get the nested childs.
            _getLevelChilds(child, nodeLevel=nodeLevel+1, levels=levels-1)
            # Prepare the levele childs
            level_childs.setdefault(nodeLevel + 1, []).append((child, id))

    #eid = 'TBR'
    #level = 7
    #nodeLevel = -1
    #nodeType = 'branch'
    eid = eid.upper()
    # Get the concept children map Eg. {'concept_1':chils, 'concept_2':childs}
    nodeMap = getConceptNodeChildrensMap(eid, nodeType=nodeType, level=level)
    eids = nodeMap.keys()
    nodes = []
    # Prepare all the data for the nodes.           
    if eids:
        nodes = getConceptNodesByEncodedIDs(eids, {})

    _getLevelChilds(eid, nodeLevel, level)

    return level_childs

@_transactional()
def deleteEntireBranch(id, cookies=None, deleteBrowseTerm=True):
    branch = _getBranchByIDOrShortname(id)
    if not branch:
        raise Exception("No such branch by id or shortname: %s" % id)
    # Delete branch and its relations.    
    rels = ['parent', 'requires', 'contains', 'instances']
    nodeType = "branch"
    level = 7 # max level to go down for childrens
    nodeLevel = -1 # Current level
    try:
        branchID = branch.id
        shortname = branch.shortname
        subjectID = branch.subjectID        
        encodedID = '%s.%s' % (subjectID, shortname)

        # Get the childs at every level.
        level_childs = getChildsByLevel(encodedID, nodeType, level, nodeLevel)
        # Delete branch and all browseTerms under that branch  from flx.
        if deleteBrowseTerm:
            _deleteBranchBrowseTerm(encodedID, cookies)

        # Delete branch and all the concepts under that branch from taxonomy.
        # First delete leaf nodes and then there parents and continue till root(branch).
        levels = sorted(level_childs.keys(), reverse=True)
        for level in levels:
            for concept in level_childs[level]:
                # Delete branch node from taxonomy.
                conceptEID, conceptID = concept
                if conceptID == -1:
                    log.info("Cannot delete concept:%s as conceptID is invalid (-1)" % conceptEID)
                    continue                
                log.info("Deleting concept:%s" % conceptEID)
                deleteNodeAndRelations(conceptID, rels)
        # Delete branch node from taxonomy.
        log.info("Deleting branch:%s" % shortname)
        deleteNodeAndRelations(branchID, rels)
    except Exception, e:
        log.error('GraphDB Error: %s' % (str(e)), exc_info=e)
        raise GraphDBException('GraphDB Error. Please look at the log files for more information')

def __getResultsCount(qry):
    try:
        qry = qry.decode('ascii')
    except:
        try:
            qry = qry.encode('utf-8')
        except:
            pass

    results, metadata = cypher.execute(graph_db, qry)
    count = results[0][0]

    return count

def getRelatedConceptNodes(conceptNodeID, similarity):
    # Get the concept node
    qry = "start nd=node:concept('encodedID:%s') return nd" % conceptNodeID.lower()
    results, metadata = cypher.execute(graph_db, qry)
    records = []
    if results:
        records = [result[0] for result in results]
    if not records:
        raise Exception("No encodedID exists of value %s" % conceptNodeID)
    root_concept = records[0]
    root_concept_name = root_concept['name'].lower()
    # Get the related nodes having similarity greater than input similarity.
    # Prepare the query to get the required properties
    concep_ret_query = "x.created, x.description!, x.encodedID, x.handle, x.keywords, x.name, x.previewImageUrl!, x.previewIconUrl!, x.updated!, x.status!, ID(x), br.shortname"
    if similarity:
        qry = "START nd=node(%s) MATCH nd-[r:%s]->x WHERE r.similarity > %s with x, r match br-[:contains]->x RETURN %s, r.similarity ORDER BY r.similarity DESC" % (root_concept.id, RELATES_REL, similarity, concep_ret_query)
    else:
        qry = "START nd=node(%s) MATCH nd-[r:%s]->x with x, r match br-[:contains]->x RETURN %s, r.similarity ORDER BY r.similarity DESC" % (root_concept.id, RELATES_REL, concep_ret_query)
    
    log.info('Query: [%s]' %(qry))
    prop_keys = ['created', 'description', 'encodedID', 'handle', 'keywords', 'name', 'previewImageUrl', 'previewIconUrl','updated', 'status', 'id', 'branchName', 'similarity']
    results, metadata = cypher.execute(graph_db, qry)
    relations_info = []
    concept_branch_dict = defaultdict(set)
    if results:
        for result in results:
            prop_values = result
            concept_dict = dict(zip(prop_keys, prop_values))
            branch_name = concept_dict['branchName'].lower()
            concept_name = concept_dict['name'].lower()

            # Skip the node if its name is same as the current root node.
            if root_concept_name == concept_name:
                continue

            concept_branch_dict[concept_name].add(branch_name)
            relations_info.append(concept_dict)    

    uniq_relations_info = []
    # Prepare the new concepts list whithout any duplicates.
    for concept in relations_info:
        branch_name = concept['branchName'].lower()
        concept_name = concept['name'].lower()        
        tmp_branches = concept_branch_dict[concept_name]
        is_persist = True
        if len(tmp_branches) > 1 and branch_name in ['lsc', 'psc']:            
            # Same title with multiple branches exists.
            if 'bio' in tmp_branches:
                is_persist = False
            if 'phy' in tmp_branches:
                is_persist = False
            if 'che' in tmp_branches:
                is_persist = False

        if is_persist:
            uniq_relations_info.append(concept)

    return uniq_relations_info


def createRelatedConcepts(concept, related_concepts, raise_exception=False):
    """Create relates relation between concept and related_concepts.
    """
    try:
        concept_id = concept.id
        concept_node = graph_db.node(concept_id)        
        # Create the list of related concept ids
        related_concept_ids = [x[0].id for x in related_concepts]
        related_concept_str_ids = [str(x[0].id) for x in related_concepts]
        related_concept_info = dict([(x[0].id, x[1]) for x in related_concepts])
        
        # verify if relation already exists
        qry = "START con=node(%s), rel_con=node(%s) MATCH con-[r:%s]->rel_con RETURN ID(rel_con)" % (concept_id, ','.join(related_concept_str_ids), RELATES_REL)
        results, metadata = cypher.execute(graph_db, qry)
        existing_relation_ids = map(lambda x:x[0], results)
        
        # Only create relations which does not exist
        new_relation_ids = set(related_concept_ids) - set(existing_relation_ids)

        for new_relation_id in new_relation_ids:
            rel_properties = {'similarity':related_concept_info.get(new_relation_id, 0.0)}
            relation_node = graph_db.node(new_relation_id)
            rel_obj = rel(concept_node, RELATES_REL, relation_node, **rel_properties)
            results = graph_db.create(rel_obj)
    except Exception as ex:
        if raise_exception:
            raise 
        log.info("Unable to create Relation Concepts conceptEID : %s/%s"% (concept.encodedID, ex))

def getRebuildRelationForDeletedNode(node_id, relation_type):
    """Prepare relation between previous and next node of the node_id.
    """
    qry = """START con=node(%s)
             MATCH prev_con-[r1:%s]->con-[r2:%s]->next_con
             RETURN prev_con, next_con
          """ % (node_id, relation_type, relation_type)

    results, metadata = cypher.execute(graph_db, qry)
    if results and results[0]:
        prev_con, next_con = results[0]
        rel_obj = rel(prev_con, relation_type, next_con)
        return rel_obj

def getExcludeQuery(config_val, qry_obj, qry_prop):
    """
    """
    exclude_qry = ""
    qry_part = "%s.%s <> '#VALUE#'" % (qry_obj, qry_prop)
    exclude_val = config.get(config_val, '').strip()
    if exclude_val:        
        exclude_vals = [tmp_val.strip() for tmp_val in exclude_val.split(',')]
        tmp_vals = [qry_part.replace('#VALUE#', tmp_val) for tmp_val in exclude_vals] 
        exclude_qry = " and ".join(tmp_vals)
        exclude_qry = " WHERE %s " % exclude_qry
    return exclude_qry
