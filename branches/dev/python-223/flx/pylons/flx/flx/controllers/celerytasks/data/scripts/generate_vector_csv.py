import logging
import logging.handlers
import MySQLdb as mdb
from datetime import datetime, timedelta
import time
from collections import defaultdict

import pymongo
import IP2Location

from unicode_util import UnicodeWriter

# Initialise Logger
log = logging.getLogger(__name__)
hdlr = logging.StreamHandler()
#hdlr = logging.FileHandler('/tmp/assessment_error.log')
hdlr = logging.handlers.RotatingFileHandler('/tmp/vector_info.log', maxBytes=20*1024*1024, backupCount=5)
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
hdlr.setFormatter(formatter)
log.addHandler(hdlr)
log.setLevel(logging.INFO)

HOST = "mysql.master"
HOST = "localhost"
USER = "dbadmin"
PASSWORD = "D-coD#43"
DB = "flx2"

# MongoDB configuration
db_hostname = 'localhost'
db_port = 27017
db_name = 'flx2'
db_username = 'flx2admin'
db_password = 'D-coD43'
db_replica_set = 'rs1'
db_username = None
db_password = None
db_replica_set = None

conn = mdb.connect(host=HOST, user=USER, passwd=PASSWORD, db=DB, use_unicode=True)
cur = conn.cursor()

group_median = 15
ip_median = 30
TEACHER_ROLE = 5

member_roles = dict()
school_zipcodes = dict()
state_dict = dict()

GMAP_DIR = "/opt/data/gmap1"
csv_headers_states = ['latitude', 'longitude', 'state', 'state teachers', 'state students', 'state schools']
csv_headers_cities = ['latitude', 'longitude', 'state', 'city', 'city teachers', 'city students', 'city schools']
csv_headers_zipcodes = ['latitude', 'longitude', 'state', 'city', 'zipcode', 'zipcode teachers', 'zipcode students', 'zipcode schools']

def run():

    stime = time.time()

    generate_states()
    generate_member_roles()

    location_collection = 'MemberLocationsOverall'#'MemberLocationsOverall_new'
    school_location_collection = 'MemberSchoolLocationsOverall'
    db = get_mongo_db()
    location_collection = db[location_collection]
    school_location_collection = db[school_location_collection]

    members = location_collection.distinct('memberID')
    members = list(set(members) - set(['1', '2', '3', '4', '5']))

    member_count = len(members)    
    state_city_info = defaultdict(dict)
    count = 0
    for i, member_id in enumerate(members):
        member_id = str(member_id).strip()
        count += 1
        if (count % 1000) == 0 :
            log.info("Processed members %s/%s" % (count, member_count))
        log.info('Decuding location from Group for member_id: [%s] [%s/%s]' %(member_id, i+1, member_count))
    
        #if count > 10:break
        zipcode = get_member_zipcode(member_id, location_collection)
        school_zipcode = get_member_school_zipcode(member_id, zipcode, school_location_collection)        
        
        zip_info = None
        if zipcode:
            zipcode = zipcode.lstrip('0')
            zip_info = db.zipcode.find_one({'zipcode':zipcode})

        if not zip_info:
            continue
        log.info("ZipInfo:%s" % zip_info)
        state = zip_info['state']
        city = zip_info['city']
        latitude = zip_info['lat']
        longitude = zip_info['long']

        role = member_roles.get(member_id)
        if not state_city_info[state].has_key(city):
            state_city_info[state][city] = dict()
            state_city_info[state][city]['teacher'] = 0
            state_city_info[state][city]['student'] = 0
            state_city_info[state][city]['school'] = 0

        if not state_city_info[state][city].has_key(zipcode):
            state_city_info[state][city][zipcode] = dict()
            state_city_info[state][city][zipcode]['teacher'] = 0
            state_city_info[state][city][zipcode]['student'] = 0
            state_city_info[state][city][zipcode]['school'] = 0

        if role == TEACHER_ROLE:
            state_city_info[state][city]['teacher'] = state_city_info[state][city]['teacher'] + 1
            state_city_info[state][city][zipcode]['teacher'] = state_city_info[state][city][zipcode]['teacher'] + 1
        else:
            state_city_info[state][city]['student'] = state_city_info[state][city]['student'] + 1
            state_city_info[state][city][zipcode]['student'] = state_city_info[state][city][zipcode]['student'] + 1

        state_city_info[state][city][zipcode]['latitude'] = latitude
        state_city_info[state][city][zipcode]['longitude'] = longitude
    
        school_zip_info = None
        if school_zipcode:
            school_zipcode = school_zipcode.lstrip('0')
            school_zip_info = db.zipcode.find_one({'zipcode':school_zipcode})

        if not school_zip_info:
            continue
        log.info("School ZipInfo:%s" % school_zip_info)
        school_state = school_zip_info['state']
        school_city = school_zip_info['city']
        school_latitude = school_zip_info['lat']
        school_longitude = school_zip_info['long']

        if not state_city_info[school_state].has_key(school_city):
            state_city_info[school_state][school_city] = dict()
            state_city_info[school_state][school_city]['teacher'] = 0
            state_city_info[school_state][school_city]['student'] = 0
            state_city_info[school_state][school_city]['school'] = 0

        if not state_city_info[school_state][school_city].has_key(school_zipcode):
            state_city_info[school_state][school_city][school_zipcode] = dict()
            state_city_info[school_state][school_city][school_zipcode]['teacher'] = 0
            state_city_info[school_state][school_city][school_zipcode]['student'] = 0
            state_city_info[school_state][school_city][school_zipcode]['school'] = 0

        state_city_info[school_state][school_city]['school'] = state_city_info[school_state][school_city]['school'] + 1
        state_city_info[school_state][school_city][school_zipcode]['school'] = state_city_info[school_state][school_city][school_zipcode]['school'] + 1
        state_city_info[school_state][school_city][school_zipcode]['latitude'] = school_latitude
        state_city_info[school_state][school_city][school_zipcode]['longitude'] = school_longitude

    fd1 = open("%s/CK-12_States.csv"%GMAP_DIR, 'w')
    csv_writer1 = UnicodeWriter(fd1)
    csv_writer1.writerow(csv_headers_states)
    fd2 = open("%s/CK-12_Cities.csv"%GMAP_DIR, 'w')
    csv_writer2 = UnicodeWriter(fd2)
    csv_writer2.writerow(csv_headers_cities)
    fd3 = open("%s/CK-12_Zipcodes.csv"%GMAP_DIR, 'w')
    csv_writer3 = UnicodeWriter(fd3)
    csv_writer3.writerow(csv_headers_zipcodes)

    # Write all the cities
    state_counts = []
    city_count = 0
    city_zero_count = 0
    city_exists_count = 0
    state_exists_count = 0
    for state in state_city_info:
        state_name = state_dict.get(state, state)
        state_teachers = 0
        state_students = 0
        state_schools = 0
        for city in state_city_info[state]:
            city_count += 1
            city_info = state_city_info[state][city]
            for zipcode in city_info:
                if zipcode not in ['teacher', 'student', 'school']:
                    latitude = state_city_info[state][city][zipcode].get('latitude')
                    longitude = state_city_info[state][city][zipcode].get('longitude')
                    zt_count = state_city_info[state][city][zipcode].get('teacher', 0)
                    zs_count = state_city_info[state][city][zipcode].get('student', 0)
                    sc_count = state_city_info[state][city][zipcode].get('school', 0)
                    csv_writer3.writerow([latitude, longitude, state_name.title(), city.title(), zipcode, zt_count, zs_count, sc_count])

            t_count = state_city_info[state][city].get('teacher', 0)
            s_count = state_city_info[state][city].get('student', 0)
            sh_count = state_city_info[state][city].get('school', 0)
            if t_count == 0 and s_count == 0 and sh_count == 0:
                city_zero_count += 1
                continue
            state_teachers += t_count
            state_students += s_count
            state_schools += sh_count

            lat = lng = 0            
            record = db.StateCityCord.find_one({'state':state_name, 'city':city,'state_city':"C"})
            if record:
                city_exists_count += 1
                lat = record['lat']
                lng = record['long']                
                data = [lat, lng, state_name.title(), city.title(), t_count, s_count, sh_count]
                csv_writer2.writerow(data)
        #state_counts.append((state, state_teachers, state_students))
        record = db.StateCityCord.find_one({'state':state_name, 'state_city':"S"})
        if record:
            state_exists_count += 1
            lat = record['lat']
            lng = record['long']            
            data = [lat, lng, state_name.title(), state_teachers, state_students, state_schools]            
            csv_writer1.writerow(data)

    fd1.close()
    fd2.close()
    fd3.close()

    log.info("Time taken:%s" % (time.time() - stime))

def get_member_zipcode(member_id, location_collection):
    """
    """
    deduce_zipcode = None
    school_zipcode = None
    results = location_collection.find({'memberID':member_id})
    
    group_zipcodes = []
    ip_zipcodes = []
    for result in results:
        if result['source'] == "group":
            group_zipcodes.append((result.get('count', 0 ), result['zipcode']))
        else:
            ip_zipcodes.append((result.get('count', 0), result['zipcode']))
    
    group_zipcode_count = sum([x[0] for x in group_zipcodes])
    ip_zipcode_count = sum([x[0] for x in ip_zipcodes])

    group_zipcode_probability = {}
    if group_zipcode_count:
        group_zipcode_probability = [(x[1], round(x[0]/float(group_zipcode_count), 2)) for x in group_zipcodes]

    ip_zipcode_probability = {}
    if ip_zipcode_count:
        ip_zipcode_probability = [(x[1], round(x[0]/float(ip_zipcode_count), 2)) for x in ip_zipcodes]                

    group_zipcode_confidence = round(group_zipcode_count / float(group_median), 2)
    ip_zipcode_confidence = round(ip_zipcode_count / float(ip_median), 2)

    # Calculate Zipcode probability
    group_probs = dict(group_zipcode_probability)
    ip_probs = dict(ip_zipcode_probability)
    # Get all the locations from group and IP
    locs = group_probs.keys() + ip_probs.keys()
    overall_probs = []
    for loc in set(locs):
        # Get location probability for group and IP.
        group_prob = group_probs.get(loc, 0)
        ip_prob = ip_probs.get(loc, 0)
        # Calculate the final probability
        prob = float(group_prob) * float(group_zipcode_confidence) * 0.2 + float(ip_prob) * float(ip_zipcode_confidence) * 0.8
        loc_prob = (loc, str(round(prob, 2)))
        overall_probs.append(loc_prob)

    if overall_probs:
        sorted_probs = sorted(overall_probs, key=lambda x:float(x[1]), reverse=True)
        deduce_zipcode = str(sorted_probs[0][0])

    return deduce_zipcode

def get_member_school_zipcode(member_id, member_zipcode, school_location_collection):
    """
    """
    deduce_zipcode = None
    results = school_location_collection.find({'memberID':member_id})
    school_zipcodes = []
    for result in results:
        school_zipcodes.append((result.get('count', 0 ), result['zipcode']))
    
    if school_zipcodes:
        school_zipcodes.sort(reverse=True)    
        deduce_zipcode = school_zipcodes[0][1]
        if deduce_zipcode != member_zipcode:
            deduce_zipcode_count = school_zipcodes[0][0]
            zipcodes = [(item[1], item[0]) for item in school_zipcodes]
            school_zipcode_dict = dict(zipcodes)
            member_zipcode_count = school_zipcode_dict.get(member_zipcode, 0)
            if deduce_zipcode_count <= member_zipcode_count:
                deduce_zipcode = member_zipcode

    return deduce_zipcode

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

def generate_member_roles():
    """
    """
    global member_roles
    # Prepare the state information dictionary.
    qry = "SELECT roleID, memberID FROM auth.MemberHasRoles where roleID=5"
    cur.execute(qry) 
    results = cur.fetchall()  
    for result in results:
        role_id, member_id = result
        member_roles[str(member_id)] = role_id

def generate_states():
    """
    """
    global state_dict
    # Prepare the state information dictionary.
    qry = "select name, longname from flx2.StandardBoards"
    cur.execute(qry) 
    results = cur.fetchall()  
    for result in results:
        name, longname = result
        state_dict[name.lower()] = longname.lower()

if __name__ == '__main__':
    run()
