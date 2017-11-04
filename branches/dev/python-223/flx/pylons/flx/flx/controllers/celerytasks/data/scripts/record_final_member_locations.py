import time
from datetime import datetime, timedelta
from collections import defaultdict
import pymongo
import MySQLdb as mdb
from urlparse import urlparse

HOST = "mysql.master"
#HOST = "localhost"
USER = "dbadmin"
PASSWORD = "D-coD#43"
DB = "flx2"

# MongoDB configuration
mongo_uri = 'mongodb://flx2admin:D-coD43@localhost:27017/flx2'
replica_set = 'rs1'
max_pool_size = 20

group_median = 15
ip_median = 30
TEACHER_ROLE = 5

conn = mdb.connect(host=HOST, user=USER, passwd=PASSWORD, db=DB, use_unicode=True)
cur = conn.cursor()

state_dict = dict()

def run():
    stime = time.time()
    generate_states()
    location_collection = 'MemberLocationsOverall'
    final_location_collection = 'MemberLocationsFinal'

    db = get_mongo_db()
    location_collection = db[location_collection]
    final_location_collection = db[final_location_collection]

    members = location_collection.distinct('memberID')
    members = list(set(members) - set(['1', '2', '3', '4', '5']))
    member_count = len(members)    
    state_city_info = defaultdict(dict)    
    count = 0
    for i, member_id in enumerate(members):
        member_id = str(member_id).strip()
        count += 1
        print 'Processing final location for member_id: [%s] [%s/%s]' %(member_id, i+1, member_count)
    
        #if count > 10:break
        zipcode, zipcode_info, source = get_member_zipcode(member_id, location_collection, db)
        
        zip_info = None
        if zipcode:
            zipcode = zipcode.lstrip('0')
            zip_info = db.zipcode.find_one({'zipcode':zipcode})
        # Zipcode information not exists in zipcode datbase so use the information stored in collection.
        if not zip_info:
            zip_info = zipcode_info
        #print "ZipInfo:%s" % zip_info
        country = zip_info.get('country', 'unknown').lower()
        state = zip_info.get('state', 'unknown').lower()
        city = zip_info.get('city', 'unknown').lower()
        state = state_dict.get(state, state)
        member_final_location = {'memberID':member_id, 'country':country, 'state':state, 'city':city, 'zipcode':zipcode, 'source':source}
        final_location_collection.update({'memberID':member_id}, {"$set": member_final_location}, upsert=True)

    print "Time taken:%s" % (time.time() - stime)

def get_member_zipcode(member_id, location_collection, db):
    """
    """
    zipcode_dict = dict()
    deduce_zipcode = None
    school_zipcode = None
    results = location_collection.find({'memberID':member_id})
    
    group_zipcodes = []
    ip_zipcodes = []
    user_zipcode = None
    for result in results:
        zipcode = result['zipcode']
        zipcode_dict[zipcode] = result
        if result['source'] == "group":
            group_zipcodes.append((result.get('count', 0 ), zipcode))
        elif result['source'] == "ip":
            ip_zipcodes.append((result.get('count', 0), zipcode))
        elif result['source'] == "user":
            user_zipcode = zipcode

    # Process the zipcode user has provided
    if user_zipcode:
        #print "Got the user zipcode :%s" % user_zipcode
        user_zip_info = None
        if user_zipcode:
            user_zipcode_new = user_zipcode.lstrip('0')
            user_zip_info = db.zipcode.find_one({'zipcode':user_zipcode_new})
        # If user provided zipcode is valid then return the same else deduce the zipcode        
        if user_zip_info:
            #print "User zipcode is valid"
            return (user_zipcode, zipcode_dict[user_zipcode],"user")
        #print "User zipcode is invalid"

    # Deduce the zipcode
    group_zipcode_count = sum([x[0] for x in group_zipcodes])
    ip_zipcode_count = sum([x[0] for x in ip_zipcodes])

    group_zipcode_probability = [(x[1], round(x[0]/float(group_zipcode_count), 2)) for x in group_zipcodes]
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

    return (deduce_zipcode, zipcode_dict[deduce_zipcode], "deduced")

def get_mongo_db():
    db_url = urlparse(mongo_uri)
    if replica_set:
        conn = pymongo.MongoReplicaSetClient(host=db_url.hostname, port=db_url.port, max_pool_size=max_pool_size,
        replicaSet=replica_set, read_preference=pymongo.read_preferences.ReadPreference.PRIMARY_PREFERRED)
    else:
        conn = pymongo.MongoClient(host=db_url.hostname, port=db_url.port, max_pool_size=max_pool_size)

    db = conn[db_url.path[1:]]
    if db_url.username and db_url.password:
        db.authenticate(db_url.username, db_url.password)

    return db

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
