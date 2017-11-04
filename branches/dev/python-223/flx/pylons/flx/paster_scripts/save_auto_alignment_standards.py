import os
import sys
import argparse
import logging
import logging.handlers
import csv
import json
import urllib2
import hashlib
import pymongo

import flx.lib.helpers as h
from flx.lib.ml import utils as u

# Load config
config = h.load_pylons_config()
#glove_model_path = config.get('ml.glove_model_path', '/opt/ml_work_dir/models/glove.6B.300d.txt')
taxonomy_server = config.get('taxonomy_server', 'http://www.ck12.org/taxonomy')

# MongoDB configuration
db_hostname = 'asmtdb.master'
db_port = 27017
db_name = 'flx2'
db_username = 'flx2admin'
db_password = 'D-coD43'
db_replica_set = 'rs0'
#db_hostname = 'localhost'
#db_username = None
#db_password = None
#db_replica_set = None

# Logging
log_filename = "/tmp/save_auto_alignment_standards.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler = logging.handlers.RotatingFileHandler(log_filename, maxBytes=10*1024*1024, backupCount=5)
handler.setFormatter(formatter)
log.addHandler(handler)

# Global variables
#glove_model = u.get_glove_model(glove_model_path)
taxonomy_api = taxonomy_server + "/get/info/concept/%s"
branches = ['SCI.BIO', 'SCI.CHE','SCI.PHY', 'SCI.ESC', 'SCI.LSC', 'SCI.PSC']
main_concept_dict = dict()
csv_delimiter = '\t'
            
def main(country, standard_name, input_file, region=None):
    """
    """
    db = get_mongo_db()    
    # Generate the hash as SID from standard name
    sid = hashlib.md5(standard_name).hexdigest()
    # Prepare the location info
    location_info = dict()    
    if country:
        # If country provided add the respective location info.
        from flx.model import api
        country_info = api.getCountryByName(country.strip().lower())
        if not country_info:
            raise Exception("Please provide proper country details, country does not exists.")
        location_info['countryName'] = country_info.name
        location_info['countryCode'] = country_info.code3Letter
        if region:
            location_info['region'] = region.strip().lower()
    parents = []
    fp = open(input_file)
    reader = csv.reader(fp, delimiter=csv_delimiter, quotechar='"')
    for row in reader:        
        row = [x.strip() for x in row]
        # Add the missing values as empty values
        row_len = len(row)
        extra_params = row_len * ['']
        row.extend(extra_params)        
        # Prepare the ancestors
        if '%s%s%s' % (row[0], row[1], row[2]) == '':
            standard_id, standard_title, standard_desc, seq =  row[3:7]
            parents = parents[:3] + [standard_id]
        elif '%s%s' % (row[0], row[1]) == '':
            standard_id,standard_title, standard_desc, seq =  row[2:6]
            parents = parents[:2] + [standard_id]
        elif row[0] == '':
            standard_id,standard_title, standard_desc, seq =  row[1:5]
            parents = parents[:1] + [standard_id]
        else:
            standard_id,standard_title, standard_desc, seq =  row[:4]
            parents = [standard_id]            
        ancestors =  parents[:-1]        
        try:
            seq = int(seq)
        except:
            seq = -1
        # Get the related concepts
        related_concepts = []
        if standard_desc and standard_desc.strip():
            related_concepts = get_related_concepts(standard_id, standard_desc)
        record = dict()
        record['standardName'] = standard_name
        record['SID'] = sid             
        record['standardID'] = standard_id
        record['standardTitle'] = standard_title
        record['standardDescription'] = standard_desc
        record['sequence'] = seq
        record['ancestors'] = ancestors        
        record['relatedConcepts'] = related_concepts
        record.update(location_info)
        # Save the reocrd
        db.standardAlignments.insert(record)
                
def get_related_concepts(standard_id, standard_desc):
    """Get the related concepts for the provided standards description.
    """
    log.info("In get related concepts: standardID/standardDesc : [%s]/[%s]" % (standard_id, standard_desc))
    # call the machine learning algorithm to get the related concept eids for the standard.    
    eids = get_related_concept_eids(standard_desc)
    eids = [eid.lower() for eid in eids]
    global main_concept_dict
    concepts = []
    for eid in eids:
        # Check if the concept information is already available.
        if main_concept_dict.has_key(eid):
            concepts.append(main_concept_dict[eid])
            continue
        info = {'eid':eid}
        try:
            # Fetch the concept info
            api = taxonomy_api % eid
            obj = urllib2.urlopen(api)
            data = obj.read()
            response = json.loads(data)
            response = response['response']
            for attb in ['name', 'handle', 'previewIconUrl', 'previewImageUrl']:
                if response.has_key(attb):
                    info[attb] = response[attb]
            branch_handle = response['branch']['handle']
            info['relativeConceptUrl'] = '/%s/%s' % (branch_handle.lower(), response['handle'])
            concepts.append(info)
        except Exception as ex:
            log.info("Exception in get_related_concepts, eid : [%s], Error:[%s]" % (eid, str(ex)))
        main_concept_dict[eid] = info
    return concepts

def get_related_concept_eids(standard_desc):
    """Get the related concept eids for the provided standard description using ML apis.
    """
    concept_eids = []
    # Get the related concepts for each branch
    for branch in branches:
        # Calling Machine Learning API to get the content matches
        matches = u.get_content_matches(standard_desc, branches=[branch])
        eids = [eid_info.get('domain_eid') for eid_info in matches if eid_info.get('domain_eid')]
        concept_eids.extend(eids[:10])
    return concept_eids 
    
def get_mongo_db():
    """Get mongodb.
    """
    # Get the collection from mongodb
    if db_replica_set:
        conn = pymongo.MongoReplicaSetClient(host=db_hostname, port=db_port,
                                             replicaSet=db_replica_set,
                                             read_preference=pymongo.read_preferences.ReadPreference.PRIMARY_PREFERRED)
    else:
        conn = pymongo.MongoClient(host=db_hostname, port=db_port)
    db = conn[db_name]
    if db_username and db_password:
        db.authenticate(db_username, db_password)
    return db

if __name__ == "__main__":
    """
    """
    region = None
    parser = argparse.ArgumentParser()
    parser.add_argument('--country', help='Country', required=True, nargs='+')
    parser.add_argument('--standard', help='Standard Name', required=True)    
    parser.add_argument('--input', help='Standard template input file', required=True)        
    parser.add_argument('--region', help='Region', nargs='+')
    
    args = parser.parse_args()
    country, standard_name, input_file = ' '.join(args.country), args.standard, args.input
    region = ' '.join(args.region) if args.region else None
    
    if not os.path.exists(input_file):
        print "Error: The input file does not exists. Please provide the appropriate file.\n"
        sys.exit()
        
    print country, standard_name, input_file, region
    
    """
    country = region = None
    if len(sys.argv) == 3:
        country, region = sys.argv[1:]
    elif len(sys.argv) == 2:
        country = sys.argv[1]        
    else:
        print "Please provide the country name argument."
        sys.exit()
    main(country=country, region=region)
    """
    main(country, standard_name, input_file, region=region)
