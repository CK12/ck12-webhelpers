import logging
import logging.handlers
import time
import urllib2
from urllib import quote
from urlparse import urlparse
import json

# Initialise Logger
log = logging.getLogger(__name__)
hdlr = logging.StreamHandler()
hdlr = logging.FileHandler('/tmp/add_concept_prereqs.log')
#hdlr = logging.handlers.RotatingFileHandler('/tmp/concept_prereq.log', maxBytes=1024*1024, backupCount=5)
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
hdlr.setFormatter(formatter)
log.addHandler(hdlr)
log.setLevel(logging.INFO)

CONCEPT_JSON_FILE = "/tmp/my.json"
NEW_CONCEPT_JSON_FILE = "/tmp/my_new.json"
PREREQS_API = "http://www.ck12.org/taxonomy/get/info/conceptPrerequires/%s"

def main():
    """
    """
    log.info("Started processing of concept map json.")
    count = 0
    stime = time.time()
    data = open(CONCEPT_JSON_FILE).read()
    jdata = json.loads(data)
    total_count = len(jdata.keys())
    log.info("Total EIDs to process:%s" % total_count)
    for eid in jdata:
        count += 1
        tmp_data = jdata[eid]
        related_dict = dict()
        for item in tmp_data.get('related', []):
            related_dict[item['EID']] = item
        prereq_eids = get_prereqs(eid)
        for prereq_eid in prereq_eids:
            if related_dict.has_key(prereq_eid):
                related_dict[prereq_eid].update({'prerequires':True}) 
            else:
                related_dict[prereq_eid]= {'EID':prereq_eid, 'prerequires':True}
        related = [item for key, item in related_dict.items()]
        jdata[eid]['related'] = related        
        if (count % 100) == 0:
            log.info("Till now Records Processed :%s/%s" % (count, total_count))
            #break
    fp = open(NEW_CONCEPT_JSON_FILE, "w")
    fp.write(json.dumps(jdata))
    fp.close()
    log.info("Completed processing of concept map json.")    
    log.info("Time Taken : %s" % (time.time() - stime))
    log.info("New concept map json file :%s" % NEW_CONCEPT_JSON_FILE)
       

def get_prereqs(encoded_id):
    log.info('Processing encodedID: [%s]' %(encoded_id))
    api = PREREQS_API %(encoded_id)
    prereq_eids = []
    try:
        api_response = urllib2.urlopen(api).read()
        api_response = json.loads(api_response)
        if api_response.get('response') and api_response.get('response').get('prerequires'):
            prereqs = api_response['response']['prerequires']
            for each_prereq in prereqs:
                prereq_eids.append(each_prereq['encodedID'])
    except Exception as ex:
        print traceback.format_exc(ex)
        raise ex
    return prereq_eids
    
if __name__ == "__main__":
    main()
