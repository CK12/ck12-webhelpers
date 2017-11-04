import os
import re
import logging
import logging.handlers
import time
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

CONCEPT_MAP_DIR = '/tmp/concept_map'


def main(concept_map_dir):
    """
    """
    count = 0
    # Get the rejected concepts
    main_concept_dict = dict()
    files = os.listdir(concept_map_dir)
    for file_name in files:
        file_path = "%s%s%s" % (concept_map_dir, os.sep, file_name)   
        results = process_concept_map_file(file_path)
        for key, value in results.items():
            tmp_set = main_concept_dict.get(key, set())
            main_concept_dict[key] = tmp_set.union(value)
            
    for key, value in main_concept_dict.items():
        #print key, value
        if count > 10:break
    
    return main_concept_dict
        
def process_concept_map_file(file_path):
    """
    """
    concept_map_dict = {}
    log.info("Processing file :[%s]" % file_path)
    fp = open(file_path)
    csv_reader = csv.reader(fp)
    for row in csv_reader:
        try:
            status = row[4].lower()
            if status == "reject":
                from_concept = row[0].split('(')[1].split(')')[0].strip()
                to_concept = row[1].split('(')[1].split(')')[0].strip()
                concept_map_dict.setdefault(from_concept, set()).add(to_concept)
        except Exception as ex:
            log.info("Unable to process the row: [%s]" % row)
            log.info("Error:%s" % str(ex))    
            #raise
    fp.close()
    return concept_map_dict

if __name__ == "__main__":
    main(CONCEPT_MAP_DIR)
