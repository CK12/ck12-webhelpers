import time
from unicode_util import UnicodeDictReader
from sts.model import api
import logging
import logging.handlers

from collections import defaultdict

# Initialise Logger
log = logging.getLogger(__name__)
hdlr = logging.StreamHandler()  # Prints on console
#hdlr = logging.FileHandler('/tmp/add_artifact_creatorID.log') # Use for smaller logs
hdlr = logging.handlers.RotatingFileHandler('/tmp/logs/concept_related_relations.log', maxBytes=10*1024*1024, backupCount=500) #Use for bigger logs
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
hdlr.setFormatter(formatter)
log.addHandler(hdlr)
log.setLevel(logging.INFO)

csv_file = '/tmp/related_concepts.csv'

def run():
    concept_info = defaultdict(set)
    stime = time.time()
    csv_reader = UnicodeDictReader(open(csv_file, 'rb'))
    
    for row in csv_reader:
        concept_eid = row['Concept EID']
        related_concept_eid = row['Related Concept EID']
        similarity = float(row['Similarity'])
        concept_info[concept_eid].add((related_concept_eid, similarity))

    count = 0
    total_count = len(concept_info)
    for concept_eid in concept_info:
        try:
            concept = api.getConceptNodeByEncodedID(concept_eid)
            if not concept:
                raise Exception("Concept node does not exists, Concept EID:%s"% concept_eid)

            # Only retain the related concept having higher similarity for the concept
            related_concepts_dict = defaultdict(float)
            for info in concept_info[concept_eid]:
                related_concept_eid, similarity = info
                if related_concepts_dict[related_concept_eid] < similarity:
                    related_concepts_dict[related_concept_eid] = similarity
            # Remove the non existing related concepts from processing.
            related_concepts = related_concepts_dict.items()
            related_concepts = map(lambda x:(api.getConceptNodeByEncodedID(x[0]), x[1]), related_concepts)
            related_concepts = filter(lambda x:x[0], related_concepts)

            if related_concepts:
                api.createRelatedConcepts(concept, related_concepts, raise_exception=True)
                log.info("Successfully created relates relation between concepts %s/%s" % (concept_eid, str(related_concepts)))    
            count += 1
            if (count % 100) == 0:
                log.info("Processed concepts %s/%s" % (count, total_count))
        except Exception as e:
            log.info("Unable to create relates relation for concept %s" % concept_eid)    
            log.info("Exception :%s" % str(e))
    
    print "Time Taken: %s" % (time.time() - stime)   
        

if __name__ == "__main__":
    run()
