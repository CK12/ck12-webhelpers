import logging
import traceback
import MySQLdb as mdb
import pymongo

from flx.model import api
from flx.lib.unicode_util import UnicodeWriter, UnicodeReader
from urllib2 import quote

HOST = "mysql.master"
#HOST = "localhost"
USER = "dbadmin"
PASSWORD = "D-coD#43"
DB = "flx2"

# MongoDB configuration
db_hostname = 'localhost'
#db_hostname = 'qadatamgr'
db_port = 27017
db_name = 'dexter'
db_username = 'adsadmin'
db_password = 'D-coD43'
db_replica_set = 'rs0'
db_username = None
db_password = None
db_replica_set = None


# Server & APIs
SERVER_NAME = "http://www.ck12.org"

LOG_FILE_PATH = "/home/ck12qa/member_book_info.log"

# Initialise Logger
logger = logging.getLogger('__name__')
#hdlr = logging.StreamHandler()
hdlr = logging.FileHandler(LOG_FILE_PATH)
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
hdlr.setFormatter(formatter)
logger.addHandler(hdlr)
logger.setLevel(logging.INFO)

conn = mdb.connect(host=HOST, user=USER, passwd=PASSWORD, db=DB, use_unicode=True)
cur = conn.cursor()

state_mapping = dict()

def run():
    """This function reads the school data and the memberID from database and creates the SchoolArtifacts collection.
    """
    db = get_mongo_db()
    build_state_mapping()
    records = []
    try:
        qry = "SELECT ussm.name, ussm.state, ussm.city, ussm.zipcode, memberID, ms.schoolID from auth.USSchoolsMaster AS ussm \
               JOIN auth.MemberSchools AS ms ON ussm.id = ms.schoolID"
        cur.execute(qry)
        results = cur.fetchall()
        count = 0
        total_count = len(results)
        for result in results:
            count += 1
            logger.info("Processing %s/%s" % (count, total_count))
            school_name, state, city, zipcode, member_id, school_id = result
            school_name = school_name.lower()
            state = state.lower()
            city = city.lower()
            state = state_mapping.get(state, state)
            if not member_id:
                continue
            try:
                member_id = int(member_id)
                member = api.getMemberByID(member_id)        
                if not member:
                    logger.info("No such user with ID : [%s]" % member_id)
                    continue
                if member.email.endswith('@ck12.org'):
                    logger.info("Skipped Internal User [%s] with ID[%s]" %(member.email, member.id))
                    continue

                member_books = api.getArtifacts(typeName='book', ownerID=member_id)
                for book in member_books.results:
                    artifact_id = book.id
                    artifact_title = book.name
                    description = book.description
                    creator_name = book.creator.name
                    details_url = "%s/flxadmin/artifact/%s" % (SERVER_NAME, artifact_id)
                    cover = book.revisions[0].getCoverImageSatelliteUri()
                    if not cover:
                        cover = "%s/media/images/thumb_dflt_flexbook_lg.png" % (SERVER_NAME)
                    cover = cover.replace("COVER_PAGE", "COVER_PAGE_THUMB_LARGE")
                    if not cover.startswith("http"):
                        cover = SERVER_NAME + cover
                    #artifactPerma = "%s%s" % (SERVER_NAME, book.getPerma())
                    perma_array = book.getPerma().split('/')
                    artifact_permas = []

                    # Build the artifact perma like, 'http://www.ck12.org/' + [perma_array[3], perma_array[1], perma_array[2]].join('/')
                    for index, val in enumerate(perma_array):
                        if index in [1, 2]:
                            artifact_permas.append(val)
                        if index == 3:
                            artifact_permas = [val] + artifact_permas
                    artifact_perma = '%s/%s' % (SERVER_NAME, quote('/'.join(artifact_permas).encode('utf-8')))
                    published = 'no'
                    if book.revisions[0].publishTime:
                        published = 'yes'

                    db.SchoolArtifacts.insert({'memberID': str(member_id), 'schoolID':str(school_id), 'schoolName':school_name, 'state':state, 'city':city, 'zipcode':zipcode, 'artifactID':str(artifact_id), 'artifactTitle':artifact_title,'creatorName':creator_name, 'detailsURL':details_url, 'cover':cover, 'description':description,'artifactPerma':artifact_perma, 'published':published })
            except Exception as ex:
                logger.error("Failed to add record for artifactID/memberID %s/%s  Error: [%s]" % (artifact_id, member_id, traceback.format_exc()))
    except Exception as ex:
        logger.error(traceback.format_exc())

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

def build_state_mapping():
    """Builds the mapping dictionary with key/values as state short and long names respectively.
    """
    qry = "SELECT name, longname FROM flx2.StandardBoards"
    cur.execute(qry)
    results = cur.fetchall()
    for result in results:
        sname, lname = result
        state_mapping[sname.lower()] = lname.lower()
