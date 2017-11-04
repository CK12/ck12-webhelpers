import time
import requests
import logging
from sts.model import api
from unicode_util import UnicodeWriter

# Initialise Logger
log = logging.getLogger(__name__)
#hdlr = logging.StreamHandler()
hdlr = logging.handlers.RotatingFileHandler('/tmp/no_description_concepts.log', maxBytes=20*1024*1024, backupCount=5)
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
hdlr.setFormatter(formatter)
log.addHandler(hdlr)
log.setLevel(logging.INFO)

output_file = '/tmp/no_description_concepts.csv'
csv_headers = ['encodedID', 'Title']

modalities_api = "http://gamma.ck12.org/flx/get/minimal/modalities/%s?ownedBy=ck12"

def run():
    """Main function.
    """
    stime = time.time()
    fd = open(output_file, 'w')
    csv_writer = UnicodeWriter(fd)
    csv_writer.writerow(csv_headers)
    branches = api.getBranches(pageNum=1, pageSize=100)
    for branch in branches:
        log.info("Started processing of the branch:%s" % branch.name)
        branch_id = branch.id
        concepts = api.getConceptNodes(branchID=branch_id, pageSize=-1)
        log.info("Total concepts:%s" % len(concepts))
        for concept in concepts:
            if not concept.description: # No concept description available
                encodedID = concept.encodedID
                mod_api = modalities_api % encodedID
                resp = requests.get(mod_api)
                results = resp.json()
                # Check if concept has atleast one ck12 modality
                if results.has_key('response') and results['response'].has_key('domain') and results['response']['domain'].get('modalities'):
                    csv_writer.writerow([encodedID, concept.name])
                else:
                    log.info("No concept description and no ck12 modalities encodedID:%s" % encodedID)

    fd.close()
    log.info("Time Taken: %s" % (time.time() - stime))

if __name__ == "__main__":
    run()
