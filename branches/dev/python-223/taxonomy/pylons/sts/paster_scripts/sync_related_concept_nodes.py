import logging
import logging.handlers
import ast
import time
import logging
from py2neo import cypher, neo4j ,rel
from pylons import config

# Initialise Logger
log = logging.getLogger(__name__)
#hdlr = logging.StreamHandler()  # Prints on console
hdlr = logging.handlers.RotatingFileHandler('/tmp/logs/sync_related_concept_nodes.txt', maxBytes=10*1024*1024, backupCount=500)
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
hdlr.setFormatter(formatter)
log.addHandler(hdlr)
log.setLevel(logging.INFO)

RELATES_REL = 'relates'
BATCH_SIZE = 100

def run(GRAPH_URI_SRC, GRAPH_USER_SRC=None, GRAPH_PASSWD_SRC=None):
    """Sync related concept nodes and relations.
    """
    stime = time.time()
    # Initialise source and destination graph database.
    src_db = _get_graph_db(GRAPH_URI_SRC, GRAPH_USER_SRC, GRAPH_PASSWD_SRC)
    dest_db = _get_graph_db(config.get('graphdb.url'), config.get('graphdb.username'), config.get('graphdb.password'))
    #dest_db = _get_graph_db('http://localhost:7474/db/data', None, None)
    log.info("Got the source DB: %s" % src_db)
    log.info("Got the destination DB: %s" % dest_db)
    # Prepare the list of subject/branches at destination.
    sub_brs = _get_subject_branches(dest_db)
    log.info("Subject/branches at Destination:%s" % sub_brs)
    tmp_sub_brs = map(lambda x:tuple(x), sub_brs)
    sub_brs_set = set(tmp_sub_brs)

    # Fetch all the concetp nodes from destination graph database.
    dest_query = """
                 START con=node:concept('nodeType:concept')
                 MATCH con-[r:relates]->rel_con
                 RETURN collect(DISTINCT(LOWER(con.encodedID)))
                 """
    results, metadata = cypher.execute(dest_db, dest_query)
    dest_concepts = results[0][0]
    log.info("Destination concept nodes count: %s" % len(dest_concepts))  
    dest_concepts.sort()
    total_count = len(dest_concepts) 
    dest_concepts_set = set(dest_concepts)
    skip_count = 0
    update_count = 0
    create_count = 0
    process_count = 0
    count = 1
    while True:
        # Process the concepts in batch
        concepts = dest_concepts[:BATCH_SIZE]
        dest_concepts = dest_concepts[BATCH_SIZE:]
        log.info("Processing Concepts from Batch, %s-%s" % (count, count+BATCH_SIZE-1))
        count += BATCH_SIZE
        if not dest_concepts:
            break
        log.info("Processing concepts:%s" % concepts)
        eids = ' OR '.join(concepts)
        query = """
                START con=node:concept('nodeType:concept AND encodedID:(%s)')
                MATCH con-[r:relates]->rel_con
                RETURN LOWER(con.encodedID + '_' + rel_con.encodedID), r.similarity?
                """ % eids
        src_results, metadata = cypher.execute(src_db, query)
        log.info("Got concept-relations from Source:%s" % len(src_results))
        if not src_results:
            continue
        query = """
                START con=node:concept('nodeType:concept AND encodedID:(%s)')
                MATCH con-[r:relates]->rel_con
                RETURN LOWER(con.encodedID + '_' + rel_con.encodedID), r
                """ % eids
        dest_results, metadata = cypher.execute(dest_db, query)
        log.info("Got concept-relations from Destination:%s" % len(dest_results))
        src_rels = dict(src_results)     
        dest_rels = dict(dest_results)
        
        # Update the relation in destination ,if relation exists both source and destionation.
        dest_rel_keys = dest_rels.keys()
        dest_rel_keys.sort()
        rels_count = len(dest_rel_keys)
        tmp_count = 0
        for key in dest_rel_keys:
            #if process_count > 10000:break
            process_count += 1
            tmp_count += 1
            if (tmp_count % 100) == 0:
                log.info("Processed %s/%s" % (tmp_count, rels_count))
            if src_rels.has_key(key):
                dest_relation = dest_rels[key]
                src_relation = src_rels[key]
                props = {'similarity':src_relation}#src_relation.get_properties()
                #print props
                dest_relation.update_properties(props)
                update_count += 1
            else:
                skip_count += 1
                log.info("Destination has no relation for :%s" % key.replace('_', '/'))                

        log.info("Done updating concept-relation for existing relations in Destination.")
        # Create the relation in destination ,if relation exists in source and not in destination.
        new_rels = set(src_rels.keys()) - set(dest_rels.keys()) # Fetch the relations that exists only in source
        final_new_rels = []
        new_eids = []
        for new_rel in new_rels:
            # Do not process the concept-relation if the concept branch does not exists in destination
            start_eid, end_eid = new_rel.split('_')
            if start_eid.split('.')[:2] not in sub_brs_set:
                continue
            if end_eid.split('.')[:2] not in sub_brs_set:
                continue
            # Process concept-relation between exisitng concepts only, do not create new concept.
            if start_eid in dest_concepts_set and end_eid in dest_concepts_set:
                final_new_rels.append((start_eid, end_eid))
                new_eids.extend((start_eid, end_eid))
        # Create new relations that exists in source but not in destination.
        if final_new_rels:
            log.info("New relations to be created:%s" % final_new_rels)
            new_eids_str = ' OR '.join(new_eids)
            # Get the concept from destination for creating concept-relation
            query = """
                    START con=node:concept('nodeType:concept AND encodedID:(%s)')
                    RETURN LOWER(con.encodedID), con
                    """ % new_eids_str
            results, metadata = cypher.execute(dest_db, query)
            concept_dict = dict(results)
            for final_new_rel in final_new_rels:
                start_eid, end_eid = final_new_rel
                src_relation = src_rels["%s_%s" % final_new_rel]
                props = {'similarity':src_relation}#src_relation.get_properties()
                #print props
                rel_obj = rel(concept_dict[start_eid], RELATES_REL, concept_dict[end_eid], **props)
                dest_db.create(rel_obj)
                create_count += 1
            log.info("Done creating concept-relation.")
        #break
        #if process_count > 10000:break
    log.info("Total Time Taken: %s seconds" % (time.time() - stime))
    log.info("Total Relations Processed/Created/Updated/Skipped: %s/%s/%s/%s" % (process_count, create_count, update_count, skip_count))

def _get_graph_db(graph_uri, user=None, passwd=None):
    """Returns the graph database.
    """
    log.info("Connecting to Graph DB:%s" % graph_uri)
    if user and passwd:
        neo4j.authenticate(graph_uri, user, passwd)
    return neo4j.GraphDatabaseService(graph_uri)

def _get_subject_branches(graph_db):
    """
    """
    query = """
          START sub=node:subject('nodeType:subject'), br=node:branch('nodeType:branch') 
          MATCH sub-[r:contains]->br
          RETURN LOWER(sub.shortname), LOWER(br.shortname)
          """
    results, metadata = cypher.execute(graph_db, query)
    return results
                
 
if __name__ == "__main__":
    GRAPH_URI = 'http://chaplin.ck12.org:7474/db/data'
    GRAPH_USER = None
    GRAPH_PASSWD = None
    run(GRAPH_URI)
