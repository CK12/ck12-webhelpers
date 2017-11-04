import logging
import logging.handlers
import re
import csv, codecs, cStringIO
from datetime import datetime
from py2neo import cypher, neo4j ,rel

BASE_PATH = '/home/ck12qa/prereqs'
# Initialise Logger
log = logging.getLogger(__name__)
hdlr = logging.StreamHandler()
#hdlr = logging.FileHandler('/tmp/mixpanel_export.log')
hdlr = logging.handlers.RotatingFileHandler('%s/logs/concept_prereq.log'% BASE_PATH, maxBytes=1024*1024, backupCount=5)
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
hdlr.setFormatter(formatter)
log.addHandler(hdlr)
log.setLevel(logging.INFO)

SERVER_NAME = "gamma.ck12.org"
input_csv_file = BASE_PATH + '/worksheets/%s.csv'
cy_dep_file = BASE_PATH + '/logs/cyclic_dependency_%s.txt'
GRAPH_URI = "http://%s:7474/db/data/" % SERVER_NAME
GRAPH_USER = GRAPH_PASSWORD = None
GRAPH_USER = "dbadmin"
GRAPH_PASSWORD = "D-coD#43"
PREREQUIRES_REL = "prerequires"
if GRAPH_USER and GRAPH_PASSWORD:
    neo4j.authenticate("%s:7474" % SERVER_NAME, GRAPH_USER, GRAPH_PASSWORD)
graph_db = neo4j.GraphDatabaseService(GRAPH_URI)            

eid_column_name = 'DEV-EID'
prereq_eid_column_name = 'DEV-PRE-EID'
priority_column_name = 'PRIORITY'

def main(name='temp'):
    """
    """
    input_csv_file_new = input_csv_file % name 
    cy_dep_file_new = cy_dep_file % name
    fp = open(input_csv_file_new, 'rb')
    cdep_fp = open(cy_dep_file_new, "a+")
    cdep_fp.write('\n' + '='*100 + '\n')
    cdep_fp.write( input_csv_file_new + '\n')
    cdep_fp.write(str(datetime.now()) + '\n')
    cdep_fp.write('='*100 + '\n')
    csv_reader = UnicodeDictReader(fp)
    rels_deleted_eids = set()
    for row in csv_reader:
        log.info("Processing csv row: %s" % row)
        eid = row[eid_column_name].strip().lower()
        eid = eid.strip('.').strip(',')
        if not eid:
            log.info("EID is empty")
            continue
                    
        priority = row.get(priority_column_name, '').strip()
        # Data can be be of the forms : 
        # EID1:weight1,EID2:weight2 or EID1:weight1,EID2:weight1 or EID1, EID2
        preq_info = row[prereq_eid_column_name].lower()
        preq_data = preq_info.split(',')
        preqs = []
        for preq in preq_data:
            preq = preq.strip().strip('.').strip(',')
            if ':' in preq:
                tmp_eid, tmp_weight = preq.split(':')
                preqs.append(tmp_eid.strip().strip('.').strip(','))
            else:
                preqs.append(preq)
        eids = [eid] + preqs
        eid_dict = get_nodes_by_eids(eids)

        concept_node = eid_dict.get(eid)
        if not concept_node:
            log.info("Concept node does not exists %s" % eid)
            continue
        
                    
        # Delete the existing prereqs relations for the eid
        if eid not in rels_deleted_eids:
            #delete_prereqs_relation(eid)
            rels_deleted_eids.add(eid)                        
        log.info("Processing prereqs:%s" % str(preqs))
        for preq_eid in preqs:            
            try:
                if eid == preq_eid:
                    log.info("Cannot create prereq relations to itself.")
                    continue
                preq_node = eid_dict.get(preq_eid)
                #preq_node = get_node_by_attribute('encodedID', preq_eid)
                if not preq_node:
                    log.info("Prereq Concept node does not exists %s" % preq_eid)
                    continue
                if relation_exists(concept_node, PREREQUIRES_REL, preq_node):
                    log.info("Concept-Prerequires-Concept relation already exists between :: %s-%s" %(eid, preq_eid))
                    continue
                # Verify the cyclic dependency
                results = get_cyclic_dependency(eid, preq_eid)   
                if results:
                    # Write the cyclic dependency to the file
                    cdep_count, cdep_level, cdep_eids = results
                    cdep_eids.append(cdep_eids[0])
                    cdep_fp.write(','.join(cdep_eids) + '\n')
                    cdep_chain = '[' + ']->prerequires->['.join(cdep_eids) + ']'
                    raise Exception("Cyclic dependency exists, %s at Level [%s]" % (cdep_chain, cdep_level))

                log.info("Creating Concept-Prerequires-Concept relation between :: %s-%s" %(eid, preq_eid))
                props = {}
                if priority:
                    props = {'priority':priority}
                else:
                    props = {'priority':'1'} # If priority not exists , set it to 1
                log.info("props:%s" % props)
                rel_obj = rel((concept_node, PREREQUIRES_REL, preq_node, props))
                results = graph_db.create(rel_obj)  
               
            except Exception as e:
                log.info("Exception occured in creating relation.Error:%s" % str(e))
    cdep_fp.close()
 
def get_node_by_attribute(attb_name, attb_value):
    """
    """
    attb_value = attb_value.upper()
    query = "START gnode=node(*) WHERE gnode.%s! = '%s' RETURN gnode LIMIT 1" %(attb_name, attb_value)
    log.info("Executing get_node_by_attribute Query :: %s"%query)
    results, metadata = cypher.execute(graph_db, query)
    if results:
        return results[0][0]
        
def get_nodes_by_eids(eids):
    """
    """
    eids_query = " or ".join([eid.lower() for eid in eids])
    query = "START con=node:concept('encodedID:(%s)') RETURN con.encodedID, con" %(eids_query)
    log.info("Executing get_nodes_by_eids Query :: %s"%query)
    results, metadata = cypher.execute(graph_db, query)
    eid_dict = dict()
    for result in results:
        eid_dict[result[0].lower()] = result[1]
    return eid_dict          

def relation_exists(from_node, relation, to_node):
    """
    """
    #return False
    query = "START a=node(%s), x=node(%s) MATCH a-[:%s]->x RETURN a,x" % (from_node.id, to_node.id, relation)
    log.info("Executing relation_exists Query :: %s"%query)
    results, metadata = cypher.execute(graph_db, query)
    if results:
        return True
    return False

def get_prerequires(concept_eid):
    """Get the prerequires encodedIDs for the conceptID.
    """
    prerequire_eids = set()
    concept_eid =  concept_eid.lower()
    query = "START con=node:concept('encodedID:%s') MATCH con-[r:prerequires]->x RETURN x" % (concept_eid)
    log.info("Executing prerequires Query :: %s"%query)
    results, metadata = cypher.execute(graph_db, query)
    if results:
        for result in results:
            prerequire_eids.add(result[0]['encodedID'].lower())
    return prerequire_eids

def get_cyclic_dependency(concept_eid, preq_eid):
    """Raises exception if any cyclic depedency exists.
    """
    query = """START con1=node:concept("encodedID:%s"), con2=node:concept("encodedID:%s")
               MATCH p = con1-[r:prerequires*]->con2
               RETURN COUNT(*), length(p), extract(n in nodes(p) : n.encodedID)""" % (preq_eid.lower(), concept_eid.lower())

    results, metadata = cypher.execute(graph_db, query)
    if results:
        return results[0]
        
def delete_prereqs_relation(concept_eid):
    """
    """
    concept_eid =  concept_eid.lower()
    query = "START con=node:concept('encodedID:%s') MATCH con-[r:prerequires]->x RETURN r" % (concept_eid)
    log.info("Executing prerequires Delete Query :: %s"%query)
    results, metadata = cypher.execute(graph_db, query)
    #print "results:%s" % results
    if results:
        # Delete the concept relations.
        rels = map(lambda x:x[0], results)
        tmp_data = map(graph_db.delete, rels)
        #print tmp_data
    graph_db.refresh()
                
class UTF8Recoder:
    """
    Iterator that reads an encoded stream and reencodes the input to UTF-8
    """
    def __init__(self, f, encoding):
        self.reader = codecs.getreader(encoding)(f)

    def __iter__(self):
        return self

    def next(self):
        return self.reader.next().encode("utf-8")
            
class UnicodeDictReader:
    """
    A CSV reader which will iterate over lines in the CSV file "f",
    which is encoded in the given encoding.
    """

    reSpecial = re.compile(r'[^0-9a-zA-Z-_]*')
    def __init__(self, f, fieldnames=None, sanitizeFieldNames=False, dialect=csv.excel, encoding="utf-8", **kwds):
        f = UTF8Recoder(f, encoding)
        self.reader = csv.DictReader(f, fieldnames=fieldnames, dialect=dialect, **kwds)
        self.sanitizeFieldNames = sanitizeFieldNames
        self.sanitizedFieldNames = {}
        if self.reader.fieldnames:
            for i in range(0, len(self.reader.fieldnames)):
                self.reader.fieldnames[i] = self.safe_decode(self.reader.fieldnames[i])
                if self.sanitizeFieldNames:
                    fldName = self.reSpecial.sub('', self.reader.fieldnames[i].lower())
                    self.sanitizedFieldNames[self.reader.fieldnames[i]] = fldName

    def next(self):
        row = self.reader.next()
        for k in self.reader.fieldnames:
            if row[k] is not None:
                row[k] = self.safe_decode(row[k])
                if self.sanitizeFieldNames:
                    row[self.sanitizedFieldNames[k]] = row[k]
        return row

    def __iter__(self):
        return self

    def safe_encode(self, s):
        if s and type(s).__name__ == 'unicode':
            return s.encode('utf-8')
        return s

    def safe_decode(self, s):
        if s and type(s).__name__ == 'str':
            return s.decode('utf-8')
        return s

if __name__ == "__main__":
    #names = ['CHE', 'PHY', 'MSES', 'MSPS','MSLS', 'BIO', 'BIOADV', 'MATH', 'EM']
    #names = ['BIO', 'CHE', 'PHY', 'BIOADV', 'MSES', 'MSPS','MSLS']
    names = ['MSLS']
    for name in names:
        main(name)
