from flx.model import meta, model, api
from flx.lib import helpers as h
from flx.model.mongo import getDB as getMongoDBConnection
import time

from pylons import config
from sqlalchemy import and_, exc
import os
from datetime import datetime, timedelta
import logging

LOG_FILENAME = "/opt/2.0/log/migrate_retrolation.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=100*1024*1024, backupCount=5)
handler.setFormatter(formatter)
log.handlers = []
log.addHandler(handler)

session = meta.Session()
eid_mappings = {}

def run():
    """
        Migrate Retrolation Collection
    """
    stime = time.time()
    # Build the eid mappings
    global eid_mappings        
    for row in session.query(model.MigratedConcept).all():
        eid_mappings[row.originalEID] = row.newEID
    log.info("eid_mappings length: [%d]" % len(eid_mappings.keys()))
    # Get the mongo db instance
    db = getMongoDBConnection(config)
    
    # Fetch all the retrolations
    retrolations = db.RetrolationNew.find()
    retrolations = [retrolation for retrolation in retrolations]
    log.info("Retrolation records count: [%s]" % len(retrolations))    
    count = 0
    for retrolation in retrolations:
        # Fetch the new concepts for respective old concepts.
        old_concepts = retrolation['concepts']
        log.info("OLD Concepts: %s" % old_concepts)
        new_concepts = _get_new_concepts(old_concepts)
        log.info("New Concepts: %s" % new_concepts)
        # Update the new concepts
        if new_concepts:
            update_result = db.RetrolationNew.update({'_id': retrolation['_id']},{'$set': {'concepts':new_concepts}})
            log.info("Update Result : [%s]" % update_result)
            count += 1
        else:
            log.info("Unable to get new concepts _id :[%s]" % retrolation['_id'])            
    
    log.info("Total Retrolations [%s], Updated Retrolations [%s]" % (len(retrolations), count))
    log.info("Completed processing all the retrolations. Time Taken [%s]" % (time.time() - stime))
    
def _get_new_concepts(old_concepts):
    """Returns the new concepts for respective old concepts.
    """
    new_concepts = []
    for old_concept in old_concepts:
        new_concept = {}
        old_eid = old_concept['concept_eid']
        # Get new eid from mappings
        new_eid = eid_mappings.get(old_eid)
        if not new_eid:
            log.info("No mapping exists for old encodedID :[%s]" % old_eid)
            continue            
        new_concept['concept_eid'] = new_eid
        new_concept['lesson_handle'] = old_concept['lesson_handle']
        # Get new concept name and handle
        browse_term = api.getBrowseTermByEncodedID(new_eid)
        if not browse_term:
            log.info("No browse term exists for new encodedID :[%s]" % new_eid)
            continue
        new_concept['concept_name'] = browse_term.name
        new_concept['concept_handle'] = browse_term.handle
        # Get new branch handle
        branch_handle = ''
        artifact = api.getArtifactByHandle(handle = old_concept['lesson_handle'], typeID = 3, creatorID = 3)
        if artifact:
            try:    
                branch_handle = artifact.getAssociatedCollections()[0]['collectionHandle']
            except:
                log.info("Unable to get associated collections for artifact artifactID: [%s]" % artifact.id)
        else:
            log.info("Unable to get artifact for browse term handle : [%s]" % browse_term.handle)
            
        new_concept['branch_handle'] = branch_handle        
        new_concepts.append(new_concept)
            
    return new_concepts
