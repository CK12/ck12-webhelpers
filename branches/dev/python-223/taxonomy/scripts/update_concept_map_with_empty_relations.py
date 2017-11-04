import requests
import json
import logging
import logging.handlers
import urllib2
from urllib import quote
from urlparse import urlparse
import json
import csv

# Initialise Logger
log = logging.getLogger(__name__)
hdlr = logging.StreamHandler()
hdlr = logging.FileHandler('/tmp/reject_concept_map.log')
#hdlr = logging.handlers.RotatingFileHandler('/tmp/concept_prereq.log', maxBytes=1024*1024, backupCount=5)
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
hdlr.setFormatter(formatter)
log.addHandler(hdlr)
log.setLevel(logging.INFO)

CONCEPT_MAP_FILE = '/tmp/my_new_V1.json'
NEW_CONCEPT_MAP_FILE = '/tmp/my_new_V3.json'

CONCEPT_INFO_API = 'http://www.ck12.org/taxonomy/get/info/concept/%s'
MODALITY_INFO_API = 'http://www.ck12.org/flx/get/featured/modalities/lesson,lecture,asmtpractice,enrichment,simulationint,simulation,PLIX,rwa/%s'

def main():
    """
    """
    all_eids = set([])
    data = open(CONCEPT_MAP_FILE).read()
    concept_map = json.loads(data)
    for eid in concept_map:
        related_data = concept_map[eid].get('related', [])
        related_eids = set([x['EID'] for x in related_data if x.has_key('EID')])
        all_eids = all_eids.union(related_eids)
    
    ex_eids = set(concept_map.keys())
    new_eids = all_eids - ex_eids
    print "Total New Eids:%s" %len(new_eids)
    print new_eids
    for eid in new_eids:
        if concept_map.has_key(eid):
            print "EID already exists, :%s" % eid
        else:
            concept_map[eid] = get_eid_info(eid)
    fp = open(NEW_CONCEPT_MAP_FILE, "w")
    fp.write(json.dumps(concept_map))
    fp.close()

def get_eid_info(eid):
    """
    """
    print "Processing EID:%s" %eid
    eid_info = dict()
    concept_api = CONCEPT_INFO_API % eid
    print "Processing concept_api:%s" % concept_api
    resp = requests.get(concept_api)
    concept_resp = json.loads(resp.text)
    concept_data = concept_resp['response']
    eid_info['name'] = concept_data['name']
    eid_info['description'] = concept_data['description']
    eid_info['url'] = '/%s/%s' % (concept_data['branch']['name'], concept_data['handle'])
    eid_info['related'] = []

    modality_api = MODALITY_INFO_API % eid    
    print "Processing modality_api:%s" % modality_api
    resp = requests.get(modality_api)
    modality_resp = json.loads(resp.text)
    modality_data = modality_resp['response']
    modalities = modality_data['Artifacts']
    filter_modalities = []
    for modality in modalities:
        tmp_modality = dict()
        tmp_modality['creator'] = modality.get('creator', '')
        tmp_modality['image'] = modality.get('coverImageSatelliteUrl', '')
        tmp_modality['level'] = modality.get('level', '')
        tmp_modality['summary'] = modality.get('summary', '')
        tmp_modality['title'] = modality.get('title', '')
        tmp_modality['type'] = modality.get('type', {}).get('name', '')                      
        tmp_modality['url'] = modality.get('perma', '')                       
        filter_modalities.append(tmp_modality)
    eid_info['modalities'] = filter_modalities
    return eid_info
    
if __name__ == "__main__":
    main()
