import sys
from datetime import datetime
import time
import logging
import MySQLdb as mdb

from py2neo import neo4j ,rel
# Database configuration details.
HOST = "localhost"
USER = "dbadmin"
PASSWORD = "D-coD#43"
DB = "taxonomy"
DEV_GRAPH_URI = "http://localhost:7474/db/data/"
TEST_GRAPH_URI = "http://localhost:7475/db/data/"
LOG_FILE_PATH = '/tmp/node.log'
MAX_ENCODE_LENGTH = 50
# Database column list for subject, branch and concept.
SUBJECT_COLUMN_LIST = ['name', 'shortname', 'description', 'previewImageUrl', 'created', 'updated']
BRANCH_COLUMN_LIST = ['name', 'shortname', 'description', 'bisac', 'previewImageUrl', 'created', 'updated']
CONCEPT_COLUMN_LIST = ['encodedID', 'name', 'handle', 'description', 'previewImageUrl', 'status', 'created', 'updated']
AET_COLUMN_LIST = ['typeName', 'description','shortname']

SUBJECT_INDEX_NAME = "subject"
BRANCH_INDEX_NAME = "branch"
CONCEPT_INDEX_NAME = "concept"
AET_INDEX_NAME = "aet"

SUBJECT_INDEX_LIST = ['name', 'shortname', 'description', 'nodeType']
BRANCH_INDEX_LIST = ['name', 'shortname', 'handle', 'description', 'nodeType']
CONCEPT_INDEX_LIST = ['name', 'encodedID', 'handle', 'oldHandles', 'description', 'status', 'nodeType', 'redirectedReferences']
AET_INDEX_LIST = ['typeName', 'shortname', 'description', 'nodeType', 'status']

INDEX_CONFIG = {'type':'exact', 'to_lower_case':'true'}

CONTAINS_REL = "contains"
PARENT_REL = "parent"
REQUIRES_REL = "requires"

# Initialise Logger
logger = logging.getLogger('__name__')
hdlr = logging.FileHandler(LOG_FILE_PATH)
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
hdlr.setFormatter(formatter)
logger.addHandler(hdlr)
logger.setLevel(logging.INFO)


class NodeGenerator(object):
    """Class to generate subject,branch and concept nodes from respective MySQL tables.    
    """

    def __init__(self, graph_uri):
        """
        Prepare connections for mysql and neo4j databases.
        """        
        fname = sys._getframe().f_code.co_name
        msg = "In %s::%s" %(self.__class__.__name__, fname)        
        logger.info(msg)

        try:
            # Using unicode True for mysql connection, to get all the text-likes columns in unicode format.
            self.conn = mdb.connect(host=HOST, user=USER, passwd=PASSWORD, db=DB, use_unicode=True)
            self.graph_db = neo4j.GraphDatabaseService(graph_uri)            
        except Exception, e:
            msg1 = msg + "Unable to get connection to MySQL/Graph DB. Error- %s:"%e
            print msg1
            logger.error(msg1)
            sys.exit(1)
        logger.info("Successfully connected to mysql & neo4j.")
        try:
            # Create the indexes.
            self.subject_index = self.graph_db.get_or_create_index(neo4j.Node, SUBJECT_INDEX_NAME, config=INDEX_CONFIG)          
            self.branch_index = self.graph_db.get_or_create_index(neo4j.Node, BRANCH_INDEX_NAME, config=INDEX_CONFIG)          
            self.concept_index = self.graph_db.get_or_create_index(neo4j.Node, CONCEPT_INDEX_NAME, config=INDEX_CONFIG)
            self.aet_index = self.graph_db.get_or_create_index(neo4j.Node, AET_INDEX_NAME, config=INDEX_CONFIG)
        except Exception, e:
            msg1 = msg + "Unable to create subject/branch/concept index. Error- %s:"%e
            print msg1
            logger.error(msg1)
            sys.exit(1)
        logger.info("Successfully created the indexes for subject, branch & concept.")
        self.subject_node_type = 'subject'
        self.branch_node_type = 'branch'
        self.concept_node_type = 'concept'
        self.aet_node_type = 'aet'
        self.lowerCase = str.lower

    def createAllNodes(self):
        """
        Create all the nodes.
        """
        fname = sys._getframe().f_code.co_name
        msg = "In %s::%s" %(self.__class__.__name__, fname)        
        logger.info(msg)

        self.createSubjectNodes()
        self.createBranchNodes()
        self.createConceptNodes()
        self.createAETNodes()

    def createAllRelations(self):
        """
        Create all the relations
        """
        fname = sys._getframe().f_code.co_name
        msg = "In %s::%s" %(self.__class__.__name__, fname)        
        logger.info(msg)

        self.createSubjectContainsBranchRelation()
        self.createBranchContainsConceptRelation()
        self.createConceptParentRelation()
        self.createConceptNodeNeighborsRelation()

    def clearNodesAndRelations(self):
        """
        Removes all the existing nodes and relations.
        """
        fname = sys._getframe().f_code.co_name
        msg = "In %s::%s" %(self.__class__.__name__, fname)
        logger.info(msg)

        # Delete the indexes.
        self.graph_db.delete_index(neo4j.Node, SUBJECT_INDEX_NAME)
        self.graph_db.delete_index(neo4j.Node, BRANCH_INDEX_NAME)
        self.graph_db.delete_index(neo4j.Node, CONCEPT_INDEX_NAME)
        self.graph_db.delete_index(neo4j.Node, AET_INDEX_NAME)
        logger.info("Removed subject, branch & concept indexes.")

        self.graph_db.clear()
        logger.info("Removed all Nodes and Relationships")

    def clearBrowseTerms(self):
        """
        Removes all the Browseterms from flx2.
        """
        fname = sys._getframe().f_code.co_name
        msg = "In %s::%s" %(self.__class__.__name__, fname)        
        logger.info(msg)

        eids = ['MAT.ARI.115','MAT.ARI.117', 'MAT.TRI.100','MAT.GEO.100.20','MAT.GEO.100.20.1','MAT.GEO.100.20.2', 'MAT.GEO.110.1101', 'MAT.TRI.900', 'MAT.TRI.910']
        # Get all BrowseTerms.
        cur = self.conn.cursor()
        qry = "SELECT encodedID,id FROM flx2.BrowseTerms WHERE encodedID IN ('%s')" % "','".join(eids) 
        cur.execute(qry) 
        results = cur.fetchall()
        terms_info = dict()
        for result in results:
            eid,id = result[0],result[1]
            terms_info[eid] = str(id)
        if terms_info:
            # Delete domain neighbors.
            domain_ids = ','.join(terms_info.values())
            qry = "DELETE from flx2.DomainNeighbors WHERE domainID IN (%s)" % domain_ids
            cur.execute(qry) 
            # Delete related artifacts.
            qry = "SELECT artifactID FROM flx2.ArtifactHasBrowseTerms WHERE browseTermID IN (%s)" % domain_ids
            cur.execute(qry) 
            results = cur.fetchall()
            artifactList = []
            for result in results:                
                artifactList.append(str(result[0]))            
            if artifactList:
                artifacts = ','.join(artifactList)
                qry = "DELETE FROM flx2.ArtifactAuthors WHERE ArtifactID IN (%s)" % artifacts
                cur.execute(qry)
                qry = "DELETE FROM flx2.ArtifactRevisions WHERE ArtifactID IN (%s)" % artifacts
                cur.execute(qry)
                qry = "DELETE FROM flx2.RelatedArtifacts WHERE ArtifactID IN (%s)" % artifacts
                cur.execute(qry)
                qry = "DELETE FROM flx2.ArtifactHasBrowseTerms WHERE ArtifactID IN (%s)" % artifacts
                cur.execute(qry)
                qry = "DELETE FROM flx2.Artifacts WHERE id IN (%s)" % artifacts
                cur.execute(qry)

            # Delete the dependant DomainUrls.        
            domain_ids = ','.join(terms_info.values())
            qry = "DELETE FROM flx2.DomainUrls WHERE DomainID IN (%s)" % domain_ids
            cur.execute(qry)
            logger.info("Removing records from flx2.DomainUrls IDs:%s" % domain_ids)
            # Delete BrowseTerms
            peid = 'MAT.GEO.100.20'
            pid = terms_info.get(peid)
            if pid:
                del terms_info[peid]
            browse_ids = terms_info.values()

            qry = "DELETE FROM flx2.BrowseTerms WHERE id IN (%s)" % ",".join(browse_ids) 
            cur.execute(qry)
            logger.info("Removing records from flx2.BrowseTerms IDs:%s" % browse_ids)
            if pid:
                qry = "DELETE FROM flx2.BrowseTerms WHERE id = %s" % pid
                cur.execute(qry)
                logger.info("Removing parent record from flx2.BrowseTerms ID:%s" % pid)

        logger.info("Removed all BrowseTerms from flx2.")
        # Create the  Trigonometry Test
        qry = "SELECT id from flx2.BrowseTerms WHERE encodedID='MAT.TRI'"
        cur.execute(qry)
        results = cur.fetchall()
        if not results:
            qry = "INSERT INTO flx2.BrowseTerms (name,handle,encodedID,termTypeID,parentID) VALUES ('Trigonometry Test','Trigonometry-Test','MAT.TRI',4,2)"
            cur.execute(qry)
            logger.info("Added the Trigonometry Test(MAT.TRI) BrowseTerm in flx2.BrowseTerms.")

        # Commit the records
        self.conn.commit()

    def createSubjectNodes(self):
        """
        Create subject nodes.
        """
        fname = sys._getframe().f_code.co_name
        msg = "In %s::%s" %(self.__class__.__name__, fname)        
        logger.info(msg)

        # Get all subjects from database.
        cur = self.conn.cursor()
        cur.execute("SELECT name,shortname,description,previewImageUrl,created,updated FROM Subjects") 
        results = cur.fetchall()
        subject_info = list()
        # Prepare subjet node properties.
        for result in results:
            tmp_dict = dict(zip(SUBJECT_COLUMN_LIST, result))
            tmp_dict['nodeType'] = self.subject_node_type
            subject_info.append(tmp_dict)

        self.createNodes(subject_info)
        msg = "Total Subject nodes created:%s" %len(subject_info)
        print msg
        logger.info(msg)

    def createBranchNodes(self):
        """
        Create branch nodes.
        """
        fname = sys._getframe().f_code.co_name
        msg = "In %s::%s" %(self.__class__.__name__, fname)        
        logger.info(msg)

        # Get all branches from database.
        cur = self.conn.cursor()
        cur.execute("SELECT name,shortname,description,bisac,previewImageUrl,created,updated FROM Branches") 
        results = cur.fetchall()
        branch_info = list()
        # Prepare branch node properties.
        for result in results:
            tmp_dict = dict(zip(BRANCH_COLUMN_LIST, result))
            tmp_dict['nodeType'] = self.branch_node_type
            branch_info.append(tmp_dict)

        self.createNodes(branch_info)
        msg = "Total Branch nodes created:%s" %len(branch_info)
        print msg
        logger.info(msg)

    def createConceptNodes(self):
        """
        Create concept nodes.
        """
        fname = sys._getframe().f_code.co_name
        msg = "In %s::%s" %(self.__class__.__name__, fname)        
        logger.info(msg)

        concept_kws = self._getConceptKeywords()
        # Get all concepts from database.
        cur = self.conn.cursor()
        cur.execute("SELECT encodedID,name,handle,description,previewImageUrl,status,created,updated FROM ConceptNodes") 
        node_count = int(cur.rowcount)
        concept_info = list()
        for i in range(node_count):
            result = cur.fetchone()
            tmp_dict = dict(zip(CONCEPT_COLUMN_LIST, result))
            tmp_dict['nodeType'] = self.concept_node_type
            # Add ordered encodeID
            encodedID = tmp_dict.get('encodedID', '')
            tmp_dict['orderedEncodedID'] = self.getOrderedEncodedID(encodedID)
            # Add keywords for the concept.
            concept_eid = tmp_dict.get('encodedID', '')
            kw_list = concept_kws.get(concept_eid, [])
            # neo4j does not allows to store empty list , [], so if no keywords store empty string.
            tmp_dict['keywords'] = ''
            if kw_list:
                tmp_dict['keywords'] = kw_list

            concept_info.append(tmp_dict)
            
        self.createNodes(concept_info)
        msg = "Total Concept nodes created:%s" %len(concept_info)        
        print msg
        logger.info(msg)

    def _getConceptKeywords(self):
        """
        Returns concept keywords in the form : {concept_eid:[keyword_list]}
        """
        fname = sys._getframe().f_code.co_name
        msg = "In %s::%s" %(self.__class__.__name__, fname)        
        logger.info(msg)

        kw_dict = {}
        cur = self.conn.cursor()
        #cur.execute("SELECT cnhk.ConceptNodeID,ck.name from ConceptKeywords as ck,ConceptNodeHasKeywords as cnhk where ck.id=cnhk.keywordID") 
        cur.execute("SELECT cn.encodedID as eid,ck.name from ConceptNodes as cn,ConceptKeywords as ck,ConceptNodeHasKeywords as cnhk where ck.id=cnhk.keywordID and cnhk.ConceptNodeID = cn.id order by eid")
        results = cur.fetchall()
        for result in results:
            concept_eid = result[0]
            concept_keyword = result[1]
            kw_dict.setdefault(concept_eid, []).append(concept_keyword)
        return kw_dict     

    def createAETNodes(self):
        """
        Create Artifact Extension Type  nodes.
        """  
        fname = sys._getframe().f_code.co_name
        msg = "In %s::%s" %(self.__class__.__name__, fname)        
        logger.info(msg)

        # Get all AET's from database.
        cur = self.conn.cursor()
        cur.execute("SELECT name as typeName,description,extensionType as shortname from flx2.ArtifactTypes")
        results = cur.fetchall()
        aet_info = list()
        
        status = 'published'
        tstamp = str(datetime.now())
        # Prepare aet node properties.
        for result in results:
            tmp_dict = dict(zip(AET_COLUMN_LIST, result))
            tmp_dict['nodeType'] = self.aet_node_type
            tmp_dict['status'] = status
            tmp_dict['created'] = tstamp
            tmp_dict['updated'] = tstamp
            aet_info.append(tmp_dict)

        self.createNodes(aet_info)
        msg = "Total AET nodes created:%s" %len(aet_info)
        print msg
        logger.info(msg)


    def createNodes(self, node_info):
        """
        Create nodes in graph databae.
        """        
        fname = sys._getframe().f_code.co_name
        msg = "In %s::%s" %(self.__class__.__name__, fname)        
        logger.info(msg)

        for node_dict in node_info:            
            index_obj = index_list = None
            node_dict['created'] = str(node_dict['created'])
            if node_dict['updated']:
                node_dict['updated'] = str(node_dict['updated'])
            # Create node in graph database.
            logger.info("Created node :: %s" %node_dict)
            node_info = self.graph_db.create(node_dict)
            #logger.info("Created node :: %s" %node_dict)
            b = time.time()
            new_node = node_info[0]
            node_type = node_dict.get('nodeType')
            # Prepare index object and property list to be indexed.
            if node_type == self.subject_node_type:
                index_obj = self.subject_index                
                index_list = SUBJECT_INDEX_LIST
            elif node_type == self.branch_node_type:
                index_obj = self.branch_index
                index_list = BRANCH_INDEX_LIST
            elif node_type == self.concept_node_type:
                index_obj = self.concept_index
                index_list = CONCEPT_INDEX_LIST
            elif node_type == self.aet_node_type:
                index_obj = self.aet_index
                index_list = AET_INDEX_LIST
                        
            kws_list = node_dict.get('keywords')
            # Index properties.
            if index_obj and index_list:
                for key in index_list:
                    value = node_dict.get(key)
                    if value:
                        # If value is string convert it to lowercase for indexing.
                        if isinstance(value, basestring):
                            value = value.lower()                                                    
                        index_obj.add(key, value, new_node)   
                        logger.info("Created Index for property::key/value/node %s/%s/%s" % (key, value, new_node))

            # Index keywords for concept node.
            if node_type == self.concept_node_type and kws_list:
                for value in kws_list:  
                    # If value is string convert it to lowercase for indexing.
                    if isinstance(value, basestring):
                        value = value.lower()                                                    
                    index_obj.add('keywords', value, new_node)   
                    logger.info("Created Index for keyword ::key/value/node %s/%s/%s" % (key, value, new_node))

    def createSubjectContainsBranchRelation(self):
        """
        Create relations - Subject Contains Branches.
        """
        fname = sys._getframe().f_code.co_name
        msg = "In %s::%s" %(self.__class__.__name__, fname)        
        logger.info(msg)

        # Create Subject Contains Branch relaions.
        counter = 0    
        # Get all subject with respective branche.
        cur = self.conn.cursor()
        cur.execute("SELECT LOWER(s.shortname), LOWER(b.shortname) FROM Subjects AS s , Branches AS b WHERE b.subjectID=s.id")
        results = cur.fetchall()
        for result in results:
            subject_sname = result[0]
            branch_sname = result[1]
            try:
                subject_node = self.subject_index.get('shortname', subject_sname)[0]
                branch_node = self.branch_index.get('shortname', branch_sname)[0]
                rel_obj = rel(subject_node, CONTAINS_REL, branch_node)            
                self.graph_db.create(rel_obj)
                counter += 1
            except Exception, e:
                msg1 = msg + "Unable to create Subject-Contains-Branch Relation for Subject/Branch %s/%s: Exception::%s" %(subject_sname, branch_sname, e)
                print msg1
                logger.error(msg1)
            
        msg = "Total Subject-Contains-Branch relation created:%s" %counter
        print msg
        logger.info(msg)

    def createBranchContainsConceptRelation(self):
        """
        Create relations - Branch Contains Concepts.
        """
        fname = sys._getframe().f_code.co_name
        msg = "In %s::%s" %(self.__class__.__name__, fname)        
        logger.info(msg)

        # Create Branch contains Concept relaions.
        fname = sys._getframe().f_code.co_name
        counter = 0
        # Get all branches with respective concepts.
        cur = self.conn.cursor()
        cur.execute("SELECT LOWER(b.shortname) as Branch, LOWER(c.encodedID) as Concept FROM Branches as b, ConceptNodes as c WHERE c.branchID=b.id") 
        results = cur.fetchall()
        for result in results:
            branch_sname = result[0]
            concept_eid = result[1]
            try:
                branch_node = self.branch_index.get('shortname', branch_sname)[0]
                concept_node = self.concept_index.get('encodedID', concept_eid)[0]
                rel_obj = rel(branch_node, CONTAINS_REL, concept_node)        
                self.graph_db.create(rel_obj)
                counter += 1
            except Exception, e:
                msg1 = msg + "Unable to create Branch-Contains-Concept Relation for Branch/Concept %s/%s: Exception::%s" %(branch_sname, concept_eid, e)
                print msg1
                logger.error(msg1)
            
        msg = "Total Branch-Contains-Concept relation created:%s" %counter
        print msg
        logger.info(msg)

    def createConceptParentRelation(self):
        """
        Create relations - Concept and parent concept.
        """
        fname = sys._getframe().f_code.co_name
        msg = "In %s::%s" %(self.__class__.__name__, fname)        
        logger.info(msg)

        # Create Concept and its parent relaion.
        fname = sys._getframe().f_code.co_name
        counter = 0
        child_node = parent_node = None
        # Get all concepts with respective parent concepts.
        cur = self.conn.cursor()
        cur.execute("SELECT LOWER(child.encodedID) AS cid,LOWER(parent.encodedID) AS pid FROM ConceptNodes AS child, ConceptNodes AS parent WHERE child.parentID = parent.id GROUP BY pid, cid") 
        results = cur.fetchall()
        for result in results:
            child_eid = result[0]
            parent_eid = result[1]
            try:
                child_node = self.concept_index.get('encodedID', child_eid)[0]
                parent_node = self.concept_index.get('encodedID', parent_eid)[0]
                rel_obj = rel(parent_node, PARENT_REL, child_node)
                self.graph_db.create(rel_obj)
                counter += 1
            except Exception, e:
                msg1 = msg + "Unable to create Concept-Parent Relation for ChildEid/parentEid %s/%s: Exception::%s" %(child_eid, parent_eid, e)
                print msg1
                logger.error(msg1)
            
        msg = "Total Concept-Parent relation created:%s" %counter
        print msg
        logger.info(msg)

    def createConceptNodeNeighborsRelation(self):
        """
        Create relations - Concept and its Neighbours relations.
        """
        fname = sys._getframe().f_code.co_name
        msg = "In %s::%s" %(self.__class__.__name__, fname)        
        logger.info(msg)

        # Create Concept and its neighbours relaion.
        counter = 0
        child_node = parent_node = None
        # Get all the concepts with respective neighbour concepts.
        cur = self.conn.cursor()
        cur.execute("SELECT LOWER(encodedID), LOWER(requiredEncodedID) FROM EncodedIDNeighbors")
        results = cur.fetchall()
        # Create concept neighbour relation.
        for result in results:
            concept_eid = result[0]
            req_concept_eid = result[1]
            try:    
                concept_node = self.concept_index.get('encodedID', concept_eid)[0]
                req_concept_node = self.concept_index.get('encodedID', req_concept_eid)[0]
                rel_obj = rel(concept_node, REQUIRES_REL, req_concept_node)
                self.graph_db.create(rel_obj)
                counter += 1
            except Exception, e:
                msg1 = msg + "Unable to create Concept-Neighbour Relation for Concep/Req Concept %s/%s: Exception::%s" %(concept_eid, req_concept_eid, e)
                print msg1
                logger.error(msg1)
            
        msg = "Total Concept-Neighbours relation created:%s" %counter
        print msg
        logger.info(msg)

    def safe_encode(self, s):
        """
        Safely encode value to UTF-8.
        """
        if s and type(s).__name__ == 'unicode':
            return s.encode('utf-8')
        return s

    def safe_decode(self, s):
        """
        Safely decode value to UTF-8.
        """
        if s and type(s).__name__ == 'str':
            return s.decode('utf-8', 'ignore')
        return s

    def getOrderedEncodedID(self, encodedID):
        """
        Get the ordered encoded ID from EncodedID.
        """
        return encodedID.replace('.', '').ljust(MAX_ENCODE_LENGTH, '0')

def main(dest):
    """
    Main handler for node generation.
    """
    # Point to appropriate neo4j instance dev/test.
    if dest == "dev":
        graph_uri = DEV_GRAPH_URI
    else:
        graph_uri = TEST_GRAPH_URI
    stime = time.time()
    logger.info("===============Node Generation started.=================")
    print "=========================================================="
    print "-------------------------START----------------------------"
    print "=========================================================="        
    ng = NodeGenerator(graph_uri)
    logger.info("Clear Existing Nodes Started.")
    print "\n-------------Clear Existing Nodes Started---------------"
    ng.clearNodesAndRelations()
    print "\n-------------Clear Existing Nodes Finished--------------"
    logger.info("Clear Existing Nodes Finished.")

    logger.info("Clear Browse Terms Started.")
    print "\n-------------Clear Browse Terms Started---------------"
    ng.clearBrowseTerms()
    print "\n-------------Clear Browse Terms Finished--------------"
    logger.info("Clear Browse Terms Finished.")

    logger.info("Create Nodes Started.")
    print "\n-------------Create Nodes Started-----------------------"
    ng.createAllNodes()
    print "\n-------------Create Nodes Finished----------------------"
    logger.info("Create Nodes Finished.")

    logger.info("Create Relationship Started")
    print "\n-------------Create Relationship Started----------------"
    ng.createAllRelations()
    print "\n-------------Create Relationship Finished---------------"   
    logger.info("Create Relationship Finished")

    print "=========================================================="
    print "-------------------------END------------------------------"
    print "=========================================================="
    logger.info("=================Node Generation completed.=================")

    etime = time.time()
    ex_time =  "Execution Time : %s" % (etime - stime)
    print ex_time
    logger.info(ex_time)    

if __name__ == "__main__":
    if len(sys.argv) == 2 and sys.argv[1] in ['dev', 'test']:
        dest = sys.argv[1]
        main(dest)
    else:
        print "\nPlease provide destination for loading data , either dev or test."
        print "Usage:\n  python load_nodes.py dev"
        print "  python load_nodes.py test\n"

