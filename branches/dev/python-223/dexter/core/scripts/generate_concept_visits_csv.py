"""
This file will generate the csv files for :
    1) Top 3000 concept nodes (EIDs) by number of visits to the concept page or to any modality for that EID.
    2) Top 3000 concept nodes (EIDs) by number of visits to their read modality pages specifically.

python generate_concept_visits_csv.py # Defaults to top 3000 nodes 
python generate_concept_visits_csv.py 1000 # Manually specify top nodes.

"""
import sys
import time
import csv
import codecs
import cStringIO
import pymongo
from bson.son import SON
import urllib
import json
import re
# MongoDB configuration
db_hostname = 'localhost'
db_port = 27017
db_name = 'dexter'
db_collection = 'Resolved_FBS_VIEW'
db_replicaset = ''
db_username = ''
db_password = ''

#Taxonomy configuration
server_name = "http://astro.ck12.org"
taxonomy_server = "http://astro.ck12.org/taxonomy"
branch_api = "/get/info/branches/%s"
concept_api = "/get/info/concepts/%s/%s?pageSize=1000"
subjects = ['MAT', 'SCI', 'ENG', 'TEC']

concept_csv = "/tmp/concept_visits.csv"
read_modality_csv = "/tmp/read_modality_visits.csv"
limit = 3000
conceptNodes = dict()


class UnicodeWriter:
    """
    A CSV writer which will write rows to CSV file "f",
    which is encoded in the given encoding.
    """

    def __init__(self, f, dialect=csv.excel, encoding="utf-8", **kwds):
        # Redirect output to a queue
        self.queue = cStringIO.StringIO()
        self.writer = csv.writer(self.queue, dialect=dialect, **kwds)
        self.stream = f
        self.encoder = codecs.getincrementalencoder(encoding)()

    def writerow(self, row):
        for i in range(0, len(row)):
            if type(row[i]).__name__ not in ['str', 'unicode']:
                row[i] = str(row[i])
        self.writer.writerow([self.safe_encode(s) for s in row])
        # Fetch UTF-8 output from the queue ...
        data = self.queue.getvalue()
        data = data.decode("utf-8")
        # ... and reencode it into the target encoding
        data = self.encoder.encode(data)
        # write to the target stream
        self.stream.write(data)
        # empty queue
        self.queue.truncate(0)

    def writerows(self, rows):
        for row in rows:
            self.writerow(row)

    def safe_encode(self, s):
        if s and type(s).__name__ == 'unicode':
            return s.encode('utf-8')
        return s

    def safe_decode(self, s):
        if s and type(s).__name__ == 'str':
            return s.decode('utf-8')
        return s

def generateConceptVisits():
    """Prpare the csv file containing below information:
        1) Top 3000 concept nodes (EIDs) by number of visits to the concept page or to any modality for that EID.
        2) Top 3000 concept nodes (EIDs) by number of visits to their read modality pages specifically.
    """
    # Get the top limit provided as input.
    try:
        top_limit = int(sys.argv[1])
    except:
        top_limit = limit
    if db_replicaset:
        conn = pymongo.MongoReplicaSetClient(host=db_hostname, port=db_port, replicaSet=db_replicaset)
    else:
        conn = pymongo.MongoClient(host=db_hostname, port=db_port)
    db = conn[db_name]
    if db_username and db_password:
        db.authenticate(db_username, db_password) 
    #Get read modality page visits
    nonUGC = re.compile(r'^(mat|sci|eng|tec)\..*', re.I)
    read_modality_visits = db.Resolved_FBS_MODALITY.aggregate([
                {"$match": {"artifactID_isModality":1, "artifactID_artifactType" : "lesson", "context_eid": nonUGC}},
                {"$group": {"_id": "$context_eid", "count": {"$sum": 1}}},
                {"$sort": SON([("count", -1)])},
                {"$limit":top_limit}
            ])

    #Get all modality page visits
    all_modality_visits = db.Resolved_FBS_MODALITY.aggregate([
                {"$match": {"artifactID_isModality":1, "context_eid": nonUGC}},
                {"$group": {"_id": "$context_eid", "count": {"$sum": 1}}},
                {"$sort": SON([("count", -1)])},
                {"$limit":top_limit}
            ])

    #Get concept details page visits
    concept_details_visits = db.Resolved_FBS_VIEW.aggregate([
                {"$match": {"page":"concept_details", "context_eid": nonUGC}},
                {"$group": {"_id": "$context_eid", "count": {"$sum": 1}}},
                {"$sort": SON([("count", -1)])},
                {"$limit":top_limit}
            ])

    print "Finished running MongoDB queries."
    # Prpeare the data for concept page visits.
    concept_dict = dict()
    concept_visits = all_modality_visits['result'] + concept_details_visits['result']
    for concept_visit in concept_visits:
        eid = concept_visit.get('_id')
        if not eid:
            continue
        if concept_dict.has_key(eid):
            concept_dict[eid] += concept_visit.get('count', 0) 
        else:
            concept_dict[eid] = concept_visit.get('count', 0)

    # Get the eids sorted by visits.
    items = concept_dict.items()
    concepts = map(lambda x:(x[1], x[0]), items)
    concepts.sort(reverse=True)

    # Generate the concept visits csv file.
    fp = open(concept_csv,"w")
    csvWriter = UnicodeWriter(fp)
    csvWriter.writerow(["EID", "Concept Name", "Concept Handle", "Concept Page Visits"])
    for concept in concepts:
        visits, eid = concept
        concept_info = conceptNodes.get(eid, {})
        # Prepare the csv row information.
        name = concept_info.get('concept_name', '')
        handle = concept_info.get('concept_handle', '')
        url = concept_info.get('concept_url', '')
        concept_lnk = '=HYPERLINK("%s", "%s")' % (url, name)
        rowData = [eid, concept_lnk, handle, visits]
        csvWriter.writerow(rowData)
    fp.close()
    print "Successfully generated CSV for Concept Page Visits:%s" % concept_csv

    # Generate the read modality visits csv file.
    fp = open(read_modality_csv,"w")
    csvWriter = UnicodeWriter(fp)
    csvWriter.writerow(["EID", "Concept Name", "Concept Handle", "Read Modality Visits"])
    results = read_modality_visits['result']
    for result in results:
        eid = result.get('_id')
        if not eid:
            continue
        visits = result.get('count', 0)
        concept_info = conceptNodes.get(eid, {})
        # Prepare the csv row information.
        name = concept_info.get('concept_name', '')
        handle = concept_info.get('concept_handle', '')
        url = concept_info.get('concept_url', '')
        concept_lnk = '=HYPERLINK("%s", "%s")' % (url, name)
        rowData = [eid, concept_lnk, handle, visits]
        csvWriter.writerow(rowData)
    fp.close()
    print "Successfully generated CSV for Read Modality Visits:%s" % read_modality_csv

def getSubjectBranches():
    """Get the list of subject and respetive branches.
    """    
    subBrancheList = []
    for subject in subjects:
        # Fetch branches.
        branch_url = "%s%s" % (taxonomy_server, branch_api % subject)
        response = _makeCall(branch_url)
        branches = map(lambda x:x['shortname'], response['response']['branches'])
        if branches:
            subBrancheList.extend(map(lambda x:(subject,x), branches))

    return subBrancheList

def prepareConceptNodes():
    """
    Prepare the concept node dictionary so that the same dictionary can be used later to fetch the conept information.
    """
    global conceptNodes
    results = getSubjectBranches()
    for result in results:
        concept_url = "%s%s" % (taxonomy_server, concept_api % result)
        # Get all the concepts under branch.
        response = _makeCall(concept_url)        
        cons = response['response']['conceptNodes']
        if cons:
            # Prepare branch information
            data = cons[0]
            branch_name = data['branch']['name']
            branch_handle = branch_name.replace(' ', '-')
            branch_eid = "%s.%s" % result           
            branch = dict()
            branch['concept_name'] = branch_name
            branch['concept_handle'] = branch_handle
            branch['concept_url'] = "%s/%s" % (server_name, branch_handle)
            conceptNodes[branch_eid] = branch
            # Prepare concepts information
            for con in cons:
                concept = dict()
                eid = con['encodedID']
                concept['concept_name'] = con['name']
                concept['concept_handle'] = con['handle']
                concept['concept_url'] = "%s/%s/%s" % (server_name, branch_handle, con['handle'])
                conceptNodes[eid] = concept

    print "Finished collecting concept information."   

def _makeCall(url):
    """
    Call the url and return the response.
    """
    fp = urllib.urlopen(url)
    response = fp.read()
    fp.close()
    results = json.loads(response)
    return results
   
if __name__ == "__main__":
    stime = time.time()
    prepareConceptNodes()
    generateConceptVisits()
    print "Time Taken: %s seconds" % (time.time() - stime)
