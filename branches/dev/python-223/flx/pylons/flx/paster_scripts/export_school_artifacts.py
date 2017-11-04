import time
import logging
import logging.handlers
import pymongo
from flx.model import api
from flx.lib.unicode_util import UnicodeWriter
import MySQLdb as mdb

HOST = "mysql.master"
#HOST = "localhost"
USER = "dbadmin"
PASSWORD = "D-coD#43"
DB = "flx2"

# MongoDB configuration
db_hostname = 'qaprint2'
db_port = 27017
db_name = 'dexter'
db_username = None
db_password = None
db_replica_set = None

# Initialise Logger
log = logging.getLogger(__name__)
#hdlr = logging.StreamHandler()
hdlr = logging.handlers.RotatingFileHandler('/tmp/logs/school_artifacts.log', maxBytes=100*1024*1024, backupCount=500)
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
hdlr.setFormatter(formatter)
log.addHandler(hdlr)
log.setLevel(logging.INFO)

conn = mdb.connect(host=HOST, user=USER, passwd=PASSWORD, db=DB, use_unicode=True)
cur = conn.cursor()

csv_headers = ['schoolName' ,'schoolID', 'artifactID' ,'artifactDetails' ,'artifactTitle' ,'artifactPerma' ,'state' ,'city' ,'zipcode', 'published']
output_csv_path = '/tmp/data/school_artifacts.csv'

school_mapping = dict()

def run():
    """Main function.
    """    
    stime = time.time()
    build_school_mapping()
    db = get_mongo_db()
    fd = open(output_csv_path, 'w')
    csv_writer = UnicodeWriter(fd)
    csv_writer.writerow(csv_headers)

    # Get the unique school names
    match_clause = {'$match':{'artifactCreator':{'$ne':'CK-12 '}}}
    group_clause = {'$group':{'_id':'$school_name', 'total':{'$sum':1}}}
    sort_clause = {'$sort':{'total':-1}}
    school_query = [match_clause, group_clause, sort_clause]    
    schools = db.SchoolArtifactsExtended.aggregate(school_query)
    schools = schools['result']
    school_count = len(schools)
    log.info("Total %s schools to process." % school_count)
    count = 0
    # Get artifacts for every school
    for school in schools:
        count += 1
        if (count % 100) == 0:
            log.info("School Processed %s/%s" % (count, school_count))

        school_name = school['_id']
        query = {'school_name':school_name, 'artifactType':'book', 'artifactCreator':{'$ne':'CK-12 '}}
        results = db.SchoolArtifactsExtended.find(query)
        for result in results:
            artifact_id = result.get('artifactID', '')
            if not artifact_id:
                log.info('Artifact is empty')
                continue
            artifact = api.getArtifactByID(artifact_id)
            if not artifact:
                log.info('No Artifact exists for ArtifactID:%s' % artifact_id)
                continue
            email = ''
            if artifact.creator:
                email = artifact.creator.email.lower()
            if email.endswith('ck12.org'):
                continue

            perma_array = result.get('artifactPerma', '').split('/')
            artifact_permas = []
            # Build the artifact perma like, 'http://www.ck12.org/' + [perma_array[3], perma_array[1], perma_array[2]].join('/')
            for index, val in enumerate(perma_array):
                if index in [1, 2]:
                    artifact_permas.append(val)
                if index == 3:
                    artifact_permas = [val] + artifact_permas
            artifact_perma = 'http://www.ck12.org/%s' % '/'.join(artifact_permas)

            artifact_details = 'http://www.ck12.org/flxadmin/artifact/%s' % artifact_id
            artifact_revisions = api.getRevisionsOfArtifact(artifact_id, pageNum=1, pageSize=1)
            published = 'no'
            for artifact_revision in artifact_revisions:
                if artifact_revision.publishTime:
                    published = 'yes'
                break
            
            artifact_title = result.get('artifactTitle', '')
            state = result.get('state', 'unknown')
            city = result.get('city', 'unknown')
            zipcode = result.get('zipcode', 'unknown')
            school_id = school_mapping.get(school_name.lower(), '')
            row = [school_name, school_id, artifact_id, artifact_details, artifact_title, artifact_perma, state, city, zipcode, published]
            csv_writer.writerow(row)

    fd.close()
    log.info("Time Taken:%s" % (time.time() - stime))

def get_mongo_db():
    """Get the dexter db.
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

def build_school_mapping():
    """
    """
    global school_mapping
    qry = "SELECT name, id from auth.USSchoolsMaster"
    cur.execute(qry)
    results = cur.fetchall()
    for result in results:
        school_name, school_id = result
        school_mapping[school_name.lower()] = school_id

if __name__ == '__main__':
    run()
