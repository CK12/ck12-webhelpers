"""
Script to import scrible annotation data. Multiple instances of the script can be run in parallel over different
parts of the dump, by passing appropriate value of suffix and dump_path_suffix to run(). For example:
run(suffix="1", dump_path_suffix="part1") will import the dump under part1/ folder and log in convert_scrible1.log

Date: 8th July 2016

Author: Rahul Nanda
"""
import os
import math
import json
import re
import requests
import urllib
import logging
import pymongo
import sys
import pytz
from flx.model import api, meta, model
from dateutil import parser
import requests.packages.urllib3
requests.packages.urllib3.disable_warnings()

LOG_FILENAME = "/tmp/convert_scrible"
log = None

# MongoDB configuration
db_hostname = 'localhost'
db_port = 27017
db_name = 'flx2'
db_username = None
db_password = None
db_replica_set = None

GET_MEMBER_SEARCH_ALL_URL = "https://www.ck12.org/auth/get/members?searchAll="
GET_MEMBER_FROM_FIELD_URL = "https://www.ck12.org/auth/get/members?search="
AUTH_COOKIE = "54dfda4a8071249ea2fd2d6d413ce8a2d314406ee0e32d892d124bc69517600d76393d53"
cookies_dict = dict(auth=AUTH_COOKIE)

DUMP_PATH = "/home/ck12qa/scribleDump/ck12_full_dump_final/"
CK12_COLORS = [("c1", "d9b2ff"), ("c2","add8ff"), ("c3","c0ed72"), ("c4","ffeb6b"), ("c5","ffb0ca")]

utc = pytz.UTC


def get_artifact_revision(session, artifactID, revision=None, last_saved=None):
    query = session.query(model.ArtifactRevision)
    query = query.filter(model.ArtifactRevision.artifactID == artifactID)
    if revision:
        query = query.filter(model.ArtifactRevision.revision == revision)
        try:
            query = query.one()
        except:
            return None
    elif last_saved:
        # Get the latest revision that was published at the time of saving the annotations
        last_saved = last_saved.replace(tzinfo=None) # for comparison with publishTime, need to remove tzinfo
        query = query.filter(model.ArtifactRevision.publishTime < last_saved)
        query = query.order_by(model.ArtifactRevision.publishTime.desc())
        query = query.first()
        #log.info("*#$Check ARid %d last_saved %s" %(query.id, last_saved.strftime("%Y-%m-%d %H:%M:%S")))
    else:
        return None
    return query


def check_url(url):
    """
    Check if the URL is a valid read modality URL on production
    """
    find_query_parameter = url.find('?')
    # Remove query paramter string from the URL
    if find_query_parameter != -1:
        url = url[:find_query_parameter]
    if not url.endswith('/'):
        url += '/'
    host_re = r'http[s]?://(www.)?ck12.org/'
    user_re = r'user((%3A)|:)(?P<user_login>.+?)/'
    book_re = host_re + r'(%s)?' % user_re + 'book/(?P<book_handle>.+?)/(r(?P<book_revision>[0-9]+?)/)?section/(?P<section_no>.+?)/$'
    lesson_re = host_re + r'(?P<branch>.+?)/(?P<concept_handle>.+?)/lesson/' + r'(%s)?' %user_re + r'(?P<lesson_handle>.+?)/(r(?P<lesson_revision>[0-9]+?)/)?$'
    section_re = host_re + r'(%s)?' % user_re + 'section/(?P<section_handle>.+?)/(r(?P<section_revision>[0-9]+?)/)?$'
    book_ro = re.compile(book_re)
    lesson_ro = re.compile(lesson_re)
    section_ro = re.compile(section_re)
    m1 = book_ro.match(url)
    m2 = lesson_ro.match(url)
    m3 = section_ro.match(url)
    if m1 or m2 or m3:
        return True
    return False


def get_artifact_from_url(session, original_url, last_saved):
    #log.info("get_artifact_details for URL: %s" % original_url)
    find_query_parameter = original_url.find('?')
    # Remove referrer string from the URL
    if find_query_parameter != -1:
        original_url = original_url[:find_query_parameter]
    if not original_url.endswith('/'):
        original_url += '/'
    host_re = r'http[s]?://(www.)?ck12.org/'
    user_re = r'user((%3A)|:)(?P<user_login>.+?)/'
    book_re = host_re + r'(%s)?' %user_re + 'book/(?P<book_handle>.+?)/(r(?P<book_revision>[0-9]+?)/)?section/(?P<section_no>.+?)/$'
    lesson_re = host_re + r'(?P<branch>.+?)/(?P<concept_handle>.+?)/lesson/' + r'(%s)?' %user_re + r'(?P<lesson_handle>.+?)/(r(?P<lesson_revision>[0-9]+?)/)?$'
    section_re = host_re + r'(%s)?' % user_re + 'section/(?P<section_handle>.+?)/(r(?P<section_revision>[0-9]+?)/)?$'
    book_ro = re.compile(book_re)
    lesson_ro = re.compile(lesson_re)
    section_ro = re.compile(section_re)
    m1 = book_ro.match(original_url)
    m2 = lesson_ro.match(original_url)
    m3 = section_ro.match(original_url)
    ck12editor = api._getMember(session, login='ck12editor')
    if not m1 and not m2 and not m3:
        log.error("No regex match for %s" % original_url)
    if m1:
        book_handle = m1.group('book_handle')
        section_no = m1.group('section_no')
        user_login = m1.group('user_login')
        book_revision = m1.group('book_revision')

        if user_login:
            creatorID = search_member(user_login)
            if not creatorID:
                # *** Add log statement
                #log.error("couldn't find member with login %s" % user_login)
                return 0, 0
        else:
            creatorID = ck12editor.id
        book_artifactID = find_artifact(session, handle=book_handle, typeID=1, creatorID=creatorID)
        if not book_artifactID:
            log.error("couldn't find book artifact with handle: %s for url: %s" %(book_handle, original_url))
            return 0, 0
        book_artifactRevision = get_artifact_revision(session, artifactID=book_artifactID, revision=book_revision, last_saved=last_saved)
        if not book_artifactRevision:
            log.error("Couldn't find artifactRevision for artifactID %d revision %s" %(book_artifactID, book_revision))
            return book_artifactID, 0
        artifactRevision = book_artifactRevision
        descendants_sequence = section_no.split('.')
        for ds in descendants_sequence:
            ds = int(ds)
            if ds == 0:
                artifactRevision = artifactRevision
            else:
                if ds <= len(artifactRevision.children):
                    artifactRevision = artifactRevision.children[ds-1].child
                else:
                    log.error("sequence no. %s doesn't exist for artifactRevision with id: %d" %(ds, artifactRevision.id))
                    return 0, 0
        if artifactRevision:
            artifact = artifactRevision.artifact
            if artifact.type.name != "lesson" and artifact.type.name != "section":
                log.error("Artifact found is neither a lesson nor a section")
                return 0, 0
            return artifact.id, artifactRevision.id
        #print m1.groups()
    elif m2:
        user_login = m2.group('user_login')
        lesson_handle = m2.group('lesson_handle')
        lesson_revision = m2.group('lesson_revision')
        if user_login:
            creatorID = search_member(user_login)
            if creatorID < 0:
                # *** Add log statement
                #log.error("couldn't find member with login %s" % user_login)
                return 0, 0
        else:
            creatorID = 3
        artifactID = find_artifact(session, handle=lesson_handle, typeID=3, creatorID=creatorID)
        if not artifactID:
            return 0, 0
        artifactRevision = get_artifact_revision(session, artifactID=artifactID, revision=lesson_revision, last_saved=last_saved)
        artifactRevisionID = 0
        if artifactRevision:
            artifactRevisionID = artifactRevision.id
        #print lesson_artifactID
        #raw_input('e')
        return artifactID, artifactRevisionID

    elif m3:
        user_login = m3.group('user_login')
        section_handle = m3.group('section_handle')
        section_revision = m3.group('section_revision')
        if user_login:
            creatorID = search_member(user_login)
            if creatorID < 0:
                # *** Add log statement
                #log.error("couldn't find member with login %s" % user_login)
                return 0, 0
        else:
            creatorID = 3
        artifactID = find_artifact(session, handle=section_handle, typeID=8, creatorID=creatorID)
        if not artifactID:
            return 0, 0
        artifactRevision = get_artifact_revision(session, artifactID=artifactID, revision=section_revision, last_saved=last_saved)
        artifactRevisionID = 0
        if artifactRevision:
            artifactRevisionID = artifactRevision.id
        return artifactID, artifactRevisionID
    return 0, 0


def check_if_already_imported(scrible_id):
    global mdb
    for x in range(5):
        try:
            result = mdb.Annotation.find_one({'sID': scrible_id})
            if not result:
                return False
            return True
        except Exception, e:
            log.error("Error while searching annotation %s" % str(e), exc_info = e)
            mdb = get_mongo_db()


def save_annotation(ck12_annotation):
    global mdb
    for x in range(5):
        try:
            mdb.Annotation.insert(ck12_annotation)
            global saved_count
            saved_count += 1
            log.info("Saved annotation %d" %ck12_annotation["sID"])
            break
        except Exception, e:
            log.error("Error inserting annotation %s" % str(e), exc_info=e)
            mdb = get_mongo_db()


def search_member(field, is_email=False):
    try:
        if is_email:
            r = requests.get(GET_MEMBER_FROM_FIELD_URL+"email,"+field, cookies=cookies_dict)
        else:
            r = requests.get(GET_MEMBER_SEARCH_ALL_URL+field, cookies=cookies_dict)
        member_id = r.json()['response']['result'][0]['id']
        return member_id
    except Exception, e:
        log.error("Error getting memberID %s" % str(e), exc_info=e)
    return 0


def find_artifact_by_handle(session, handle, typeID, creatorID):
    artifact = api._getArtifactByHandle(session, handle=handle, typeID=typeID, creatorID=creatorID)
    if not artifact:
        #print "couldn't find artifact in Artifacts table. Will check in old handles table"
        ah = api._getArtifactHandles(session, handle=handle, typeID=typeID, creatorID=creatorID)
        # Check if list is empty
        if not ah:
            #print "couldn't find in old handles table"
            return 0
        else:
            #print ah
            artifactID = ah[0].artifactID
    else:
        artifactID = artifact.id
    return artifactID


def find_artifact(session, handle, typeID, creatorID):
    h = handle
    artifactID = 0
    # Keep decoding the URL handle if not found
    while True:
        artifactID = find_artifact_by_handle(session, handle=handle, typeID=typeID, creatorID=creatorID)
        if artifactID:
            break
        handle = urllib.unquote(handle)
        if handle == h:
            break
        h = handle
    return artifactID


def get_artifact_from_pageid(session, page_id):
    #print page_id
    user_re = r'user((%3A)|:)(?P<user_login>.+?)/'
    page_id_re = r'(%s)?' % user_re + r'(?P<artifact_type>(concept|section))/(?P<handle>.+?)/(r(?P<revision>[0-9]+?)/)'
    page_id_ro = re.compile(page_id_re)
    m1 = page_id_ro.match(page_id)
    if not m1:
        #log.error("page id: %s didn't match the regex" % page_id)
        return 0, 0
    artifact_type = m1.group('artifact_type')
    user_login = m1.group('user_login')
    handle = m1.group('handle')
    revision = m1.group('revision')
    if user_login:
        creatorID = search_member(user_login)
        if not creatorID:
            #log.error("couldn't find member with login %s" % user_login)
            return 0, 0
    else:
        creatorID = 3
    typesDict = api._getArtifactTypesDict(session)
    # Initial 2.x URLs of the form concept/handle
    if artifact_type == 'concept':
        artifact_type = 'lesson'
    artifactID = find_artifact(session, handle=handle, typeID=typesDict[artifact_type].id, creatorID=creatorID)
    if not artifactID:
        return 0, 0
    artifactRevision = get_artifact_revision(session, artifactID=artifactID, revision=revision)
    if not artifactRevision:
        #log.error("couldn't find artifactRevision with revision %s for artifactID %d" %(revision, artifactID))
        return artifactID, 0
    artifactRevisionID = artifactRevision.id

    return artifactID, artifactRevisionID


def initialise_logger(suffix):
    global LOG_FILENAME, log
    LOG_FILENAME += suffix + ".log"
    log = logging.getLogger(__name__)
    log.setLevel(logging.DEBUG)
    handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=50*1024*1024, backupCount=5)
    log.addHandler(handler)

color_map = {}
saved_count=0
mdb = None


def run(suffix="", dump_path_suffix=""):
    initialise_logger(suffix)
    global DUMP_PATH
    DUMP_PATH += dump_path_suffix
    processed_file_path = os.path.join(DUMP_PATH, "processedFiles" + suffix + ".txt")
    processed_file = open(processed_file_path, 'a+')
    processed_file.seek(0)
    processed_files_list = list(processed_file)
    import time
    start_time = time.time()
    global mdb
    mdb = get_mongo_db()
    session = meta.Session()
    session.begin()
    total_annotations = 0
    for root, dirs, files in os.walk(DUMP_PATH, topdown=False):
        print root
        for name in files:
            file_path = os.path.join(root, name)
            if not name.endswith('json'):
                continue
            if name+"\n" in processed_files_list:
                log.info("Skipping %s. Already in processed file list" % name)
                continue
            with open(file_path) as data_file:
                try:
                    scrible_data = json.load(data_file)
                except Exception, e:
                    log.error("Couldn't load json from %s" % file_path)
                    continue
            log.info("Processing File: %s" % file_path)
            for user_data in scrible_data:
                total_annotations += len(user_data["annotations"])
                convert_and_save_scrible_data(session, user_data)
            processed_file.write(name+"\n")
    session.commit()
    session.close()
    processed_file.close()
    time_taken = (time.time() - start_time)/60
    log.info("time taken %f minutes" % time_taken)
    log.info("Total Annotations: %d" % total_annotations)
    log.info("Annotations Saved: %d" % saved_count)


def get_rgb_from_hex(hex_color_string):
    r = int(hex_color_string[:2], 16)
    g = int(hex_color_string[2:4], 16)
    b = int(hex_color_string[4:6], 16)
    return r, g, b


def distance(color1, color2):
    r1, g1, b1 = get_rgb_from_hex(color1)
    r2, g2, b2 = get_rgb_from_hex(color2)
    return math.sqrt((r1-r2)**2 + (g1-g2)**2 + (b1-b2)**2)


def map_color_to_ck12color(hex_color_string):
    if hex_color_string in color_map:
        return color_map[hex_color_string]
    # Find closest CK12_COLOR by computing Euclidean distances and finding the minimum
    min_distance = sys.maxint
    mapped_color = "c3" # Just an initial default color value
    for ck in CK12_COLORS:
        d = distance(hex_color_string, ck[1])
        if d < min_distance:
            mapped_color = ck[0]
            min_distance = d
    color_map[hex_color_string] = mapped_color
    return mapped_color


def convert_and_save_scrible_data(session, user_data):

    if not check_url(user_data["original_url"]):
        #log.info("URL %s doesn't match requirements. Skipping.." % user_data["original_url"])
        return False
    email = user_data["user_id"]
    member_id = search_member(email, is_email=True)
    if not member_id:
        #log.error("Couldn't find Email: %s Skipping.." % email)
        return False
    # If all annotations already imported then skip the further steps..
    """
    skip = True
    for a in user_data["annotations"]:
        if not check_if_already_imported(scrible_id=a["annotation_id"]):
            skip = False
            break
    if skip:
        log.info("Annotations already imported. Skipping..")
        return True"""
    scrible_last_saved = user_data["last_saved"]
    scrible_last_saved = parser.parse(scrible_last_saved)
    artifactID, artifactRevisionID = 0, 0
    try:
        artifactID, artifactRevisionID = get_artifact_from_pageid(session, user_data["page_id"])
        if not artifactID or not artifactRevisionID:
            artifactID2, artifactRevisionID2 = get_artifact_from_url(session, user_data["original_url"], last_saved=scrible_last_saved)
            if not artifactID:
                artifactID = artifactID2
            if not artifactRevisionID:
                artifactRevisionID = artifactRevisionID2
        #log.info("artifactID : %d artifactRevisionID %d" %(artifactID, artifactRevisionID))
    except Exception, e:
        log.debug('Getting artifact info exception: %s' % e)
    #if not artifactID or not artifactRevisionID:
        #log.error("**Not found artifactID / revisionID for page_id: %s URL: %s" %(user_data["page_id"], user_data["original_url"]))
        #return False
    if not artifactID:
        #log.error("**Not found artifactID for page_id: %s URL: %s" %(user_data["page_id"], user_data["original_url"]))
        return False

    for a in user_data["annotations"]:
        if check_if_already_imported(scrible_id=a["annotation_id"]):
            log.info("Annotation %d already imported. Skipping.." %a["annotation_id"])
            continue
        ck12_annotation = {}
        ck12_annotation["page_id"] = user_data["page_id"]
        ck12_annotation["original_url"] = user_data["original_url"]
        ck12_annotation["memberID"] = member_id
        ck12_annotation["artifactID"] = artifactID
        ck12_annotation["revisionID"] = artifactRevisionID
        #ck12_annotation["email"] = email
        ck12_annotation["sID"] = a["annotation_id"]

        range_dict = {}
        scrible_start_id = a.get("start_ref_node_id", None)
        scrible_end_id = a.get("end_ref_node_id", None)

        if scrible_start_id and scrible_end_id:
            range_dict["start"] = "/" + scrible_start_id
            range_dict["end"] = "/" + scrible_end_id
        else:
            #log.info("Skipping annotation. Null start/end node_id : %s" %json.dumps(a))
            continue

        #Importing all data for now
        if scrible_start_id:
            range_dict["start"] = "/" + scrible_start_id
        else:
            range_dict["start"] = scrible_start_id
        if scrible_end_id:
            range_dict["end"] = "/" + scrible_end_id
        else:
            range_dict["end"] = scrible_end_id
        #Simply copying the el_path and node_pos from scrible data for now
        range_dict["startChildPath"] = a.get("start_ref_node_el_path", None)
        range_dict["endChildPath"] = a.get("end_ref_node_el_path", None)
        range_dict["startNodePos"] = a.get("start_node_pos", None)
        range_dict["endNodePos"] = a.get("end_node_pos", None)

        range_dict["startOffset"] = a["start_text_pos"]
        range_dict["endOffset"] = a["end_text_pos"]
        ck12_annotation["ranges"] = []
        ck12_annotation["ranges"].append(range_dict)

        ck12_annotation["migrated"] = True
        ck12_annotation["quote"] = a["anchor_text"]
        ck12_annotation["quote_offset"] = a["anchor_text_offset"]
        ck12_annotation["annotation_type"] = a["annotation_type"]
        ck12_annotation["created"] = ck12_annotation["updated"] = scrible_last_saved

        ck12_annotation["highlightColor"] = map_color_to_ck12color(a["color"])

        if a["annotation_type"] == "note":
            ck12_annotation["text"] = a.get("note_html", "")
        ck12_annotation["annotator_schema_version"] = "v1.0"
        save_annotation(ck12_annotation)
    return True


def get_mongo_db():
    for x in range(5):
        try:
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
        except Exception, e:
            log.error("Failed mongodb connection attempt: %d" %(x+1))
            log.info("Exception: %s" % str(e), exc_info=e)
    return None
