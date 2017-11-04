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
GRAPH_URI = "http://localhost:7474/db/data"
GRAPH_USER = "dbadmin"
GRAPH_PASSWORD = "D-coD#43"
AET_COLUMN_LIST = ['typeName', 'description','shortname']
AET_INDEX_NAME = "aet"
AET_INDEX_LIST = ['typeName', 'description', 'shortname', 'status', 'nodeType']
INDEX_CONFIG = {'type':'exact', 'to_lower_case':'true'}

conn = mdb.connect(host=HOST, user=USER, passwd=PASSWORD, db=DB, use_unicode=True)
if GRAPH_USER and GRAPH_PASSWORD:
    neo4j.authenticate("localhost:7474", GRAPH_USER, GRAPH_PASSWORD)
graph_db = neo4j.GraphDatabaseService(GRAPH_URI)            

def load_aet():
    """
    Load Artifact Extension Type  nodes.
    """  
    # Get all AET's from database.
    cur = conn.cursor()
    cur.execute("SELECT name as typeName,description,extensionType as shortname from flx2.ArtifactTypes")
    results = cur.fetchall()
    aet_info = list()
    aet_node_type ='aet' 
    status = 'published'
    tstamp = str(datetime.now())
    # Prepare aet node properties.
    for result in results:
        tmp_dict = dict(zip(AET_COLUMN_LIST, result))
        tmp_dict['nodeType'] = aet_node_type
        tmp_dict['status'] = status
        tmp_dict['created'] = tstamp
        tmp_dict['updated'] = tstamp
        aet_info.append(tmp_dict)

    createNodes(aet_info)

def createNodes(node_info):
    """
    Create nodes in graph databae.
    """        
    cnt1 = cnt2 = 0
    index_obj = graph_db.get_or_create_index(neo4j.Node, AET_INDEX_NAME, config=INDEX_CONFIG)
    index_list = AET_INDEX_LIST
    for node_dict in node_info:            
        shortname = node_dict.get('shortname')
        shortname = shortname.lower()
        # Check if AET already exists.
        node = index_obj.get('shortname', shortname)
        if not node:
            cnt1 += 1
            print "Creating Node: %s" %node_dict        
            node_dict['created'] = str(node_dict['created'])
            if node_dict['updated']:
                node_dict['updated'] = str(node_dict['updated'])
            node_info = graph_db.create(node_dict)
            new_node = node_info[0]
            # Index properties.
            for key in index_list:
                value = node_dict.get(key)
                if value:
                    # If value is string convert it to lowercase for indexing.
                    if isinstance(value, basestring):
                        value = value.lower()                                                    
                    index_obj.add(key, value, new_node)               
        
        else:
            cnt2 += 1
            print "Node already exists, Node: %s" %node_dict

    print "\nTotal AET nodes exists:%s" % cnt2
    print "Total AET nodes created:%s" % cnt1
    print "Total AET nodes :%s" % (cnt1 + cnt2)

load_aet()
