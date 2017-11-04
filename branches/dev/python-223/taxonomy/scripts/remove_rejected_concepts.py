import logging
import logging.handlers
import time
import urllib2
from urllib import quote
from urlparse import urlparse
import json
import generate_rejected_concept_map

# Initialise Logger
log = logging.getLogger(__name__)
#hdlr = logging.StreamHandler()
hdlr = logging.FileHandler('/tmp/remove_rejected_concepts.log')
#hdlr = logging.handlers.RotatingFileHandler('/tmp/concept_prereq.log', maxBytes=1024*1024, backupCount=5)
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
hdlr.setFormatter(formatter)
log.addHandler(hdlr)
log.setLevel(logging.INFO)

CONCEPT_JSON_FILE = "/tmp/my_new.json"
NEW_CONCEPT_JSON_FILE = "/tmp/my_new_V1.json"


def main():
    """
    """
    log.info("Started processing of remove concept map.")
    rejected_concept_dict = generate_rejected_concept_map.main(generate_rejected_concept_map.CONCEPT_MAP_DIR)
    count = 0
    stime = time.time()
    data = open(CONCEPT_JSON_FILE).read()
    concept_map = json.loads(data)
    total_count = len(concept_map.keys())
    log.info("Total EIDs to process:%s" % total_count)
    for eid in concept_map:
        count += 1
        rejected_concepts = rejected_concept_dict.get(eid)
        if not rejected_concepts:
            continue                    
        related_concepts = concept_map[eid].get('related', [])
        if not related_concepts:
            continue
        new_related_concepts = []
        for related_concept in related_concepts:
            related_eid = related_concept['EID']
            if related_eid not in rejected_concepts:
                new_related_concepts.append(related_concept)
        concept_map[eid]['related'] = new_related_concepts
        if (count % 100) == 0:
            log.info("Till now Records Processed :%s/%s" % (count, total_count))
            #break
    fp = open(NEW_CONCEPT_JSON_FILE, "w")
    fp.write(json.dumps(concept_map))
    fp.close()
    log.info("Completed processing of concept map json.")    
    log.info("Time Taken : %s" % (time.time() - stime))
    log.info("New concept map json file :%s" % NEW_CONCEPT_JSON_FILE)
      

if __name__ == "__main__":
    main()
