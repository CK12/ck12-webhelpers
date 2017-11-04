import os
import csv
import codecs
import cStringIO
import json
import logging
import urllib

from py2neo import neo4j ,rel, cypher

GRAPH_URI = "http://localhost:7474/db/data/"
LOG_FILE_PATH = "/tmp/modality_count.log"
BROWSE_TERM_URL = "http://www.ck12.org/flx/get/info/browseTerm"
SUBJECT_URL = "http://www.ck12.org/taxonomy/get/info/subjects"
BRANCH_URL = "http://www.ck12.org/taxonomy/get/info/branches/%s"
CONCEPT_URL = "http://www.ck12.org/taxonomy/get/info/concepts/%s/%s?pageSize=-1"

# CSV Configurations
CSV_DIR = "/opt/2.0/taxonomy/scripts/concept_csvs/"
CSV_DELIMETER = "#"
HEADER_FIELDS = ["EncodedID", "Concept Name", "Read Modality Count", "Oher Modality Count"]

# Initialise Logger
logger = logging.getLogger('__name__')
hdlr = logging.FileHandler(LOG_FILE_PATH)
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
hdlr.setFormatter(formatter)
logger.addHandler(hdlr)
logger.setLevel(logging.INFO)


def generateModalityCount():
    """Generate the CSV files containing the modality count for every concept.
    """
    # Create the path where CSV files will be stored.
    if not os.path.exists(CSV_DIR):
        os.mkdir(CSV_DIR)

    results = getSubjectBranches()
    for result in results:
        try:
            # Get all the concepts under branch.
            response = callURL(CONCEPT_URL, result)
            cons = response['response']['conceptNodes']
            if cons:
                conList = []
                subName = cons[0]['subject']['name']
                brName = cons[0]['branch']['name']
                # Prepare subjects directory.
                subPath = CSV_DIR + subName
                if not os.path.exists(subPath):
                    os.mkdir(subPath)
                # Prepare list of concepts under branch.
                for con in cons:
                    name = con['name']
                    eid = con['encodedID']
                    # get read and other modality count.
                    counts = getModalityCount(eid)
                    read_mcount = other_mcount = ''
                    if counts:
                        read_mcount, other_mcount = counts
                    conList.append([eid, name, str(read_mcount), str(other_mcount)])
                # Write CSV file for every branch.
                brName = brName.title()
                brPath = subPath + os.sep + "%s.csv" % brName
                outf = open(brPath, "wb")
                writer = UnicodeWriter(outf, delimiter=CSV_DELIMETER)
                writer.writerow(HEADER_FIELDS)
                writer.writerows(conList)
                outf.close()
                logger.info('Completed processing for Subject/Branch :%s/%s' % (subName, brName))
        except Exception as e:
            import traceback
            traceback.print_exc()
            logger.error('Unable to get modality count for Record:%s, Exception:%s' % (result, str(e)))

def getSubjectBranches():
    """
    Get the list of subject and respetive branches.
    """
    # Fetch subjects.
    response = callURL(SUBJECT_URL)
    subjects = response['response']['subjects']
    subBrancheList = []
    for subject in subjects:
        # Fetch branches.
        shortname = subject['shortname']
        response = callURL(BRANCH_URL, shortname)
        branches = map(lambda x:x['shortname'], response['response']['branches'])
        if branches:
            subBrancheList.extend(map(lambda x:(shortname,x), branches))

    return subBrancheList

def callURL(url, params=None):
    """
    Calls the given url and return the extracted json.
    """
    if params:
        url = url % (params)
    fp = urllib.urlopen(url)
    data = fp.read()
    response = json.loads(data)

    return response
    

def getModalityCount(eid):
    """Returns modality count information.
    """
    try:
        url = "%s/%s" % (BROWSE_TERM_URL, eid)
        fp = urllib.urlopen(url)
        data = fp.read()
        browseTerm = json.loads(data)
        # Get modality count dictionary.
        read_mcount = other_mcount = 0
        artifact =  browseTerm['response']['artifactCount']
        if isinstance(artifact, dict):
            read_mcount = artifact.get('lesson', 0)
            # Prepare the required list of modality counts.
            keys = set(artifact.keys()) - set(['concept', 'exercise', 'lesson'])
            for key in keys:
                other_mcount += int(artifact[key])

        return (read_mcount, other_mcount)
    except Exception as e:
        logger.error('Unable to get modality count for encodedID:%s, Exception:%s' % (eid, str(e)))

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
        self.writer.writerow([s.encode("utf-8") for s in row])
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
    
if __name__ == "__main__":
    generateModalityCount()
