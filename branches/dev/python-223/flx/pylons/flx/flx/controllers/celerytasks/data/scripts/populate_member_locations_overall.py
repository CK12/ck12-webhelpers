import time
import MySQLdb as mdb
import pymongo
import IP2Location

# Mysql Configuration
HOST = "mysql.master"
USER = "dbadmin"
PASSWORD = "D-coD#43"
DB = "auth"

# MongoDB configuration
db_hostname = 'localhost'
db_port = 27017
db_name = 'flx2'
db_username = 'flx2admin'
db_password = 'D-coD43'
db_replica_set = 'rs1'
#db_username = None
#db_password = None
#db_replica_set = None

state_mapping = dict()

conn = mdb.connect(host=HOST, user=USER, passwd=PASSWORD, db=DB, use_unicode=True)
cur = conn.cursor()

IP2LocObj = IP2Location.IP2Location()
IP2LocObj.open('/opt/data_awareness/IP-COUNTRY-REGION-CITY-LATITUDE-LONGITUDE-ZIPCODE-ISP-DOMAIN.BIN')

def main():
    """Record member locations from group and ip.
    """
    stime = time.time()
    db = get_mongo_db()
    dexter_db = get_dexter_db()
    location_overall_collection = db['MemberLocationsOverall']
    school_location_overall_collection = db['MemberSchoolLocationsOverall']
    location_overall_collection.remove()
    store_member_location_from_group(db)
    store_member_location_from_ip(db, dexter_db)
    school_location_overall_collection.remove()
    store_member_location_from_group(db, store_school=True)

    print "\nTime taken:%s" % (time.time() - stime)

def store_member_location_from_group(db, store_school=False):
    """Record member locations from group.
    """    
    print "\nStarted recording member locations from group.\n"
    zipcode_collection = db['zipcode']
    group_collection = db['MemberGroup']
    if store_school:
        location_collection = db['MemberSchoolLocation']
        location_overall_collection = db['MemberSchoolLocationsOverall']
        context = 'school location'
    else:
        location_collection = db['MemberLocation']
        location_overall_collection = db['MemberLocationsOverall']
        context = 'location'

    # Get all the member ids
    member_ids = group_collection.distinct('memberID')
    # Prepare the unique member ids
    member_ids = map(lambda x:str(x).strip(), member_ids)
    member_ids = list(set(member_ids) - set(['1', '2', '3', '4', '5']))
    member_count = len(member_ids)
    for i, member_id in enumerate(member_ids):
        print 'Decuding %s from Group for member_id: [%s] [%s/%s]' %(context, member_id, i+1, member_count)
        groups = group_collection.find({'memberID':{'$in':[member_id, int(member_id)]}}).distinct('groupID')
        friends = group_collection.find({'groupID':{'$in':groups}}).distinct('memberID')
        locations = location_collection.find({'memberID':{'$in':friends}})
        if not locations.count():
            print "No %s found for the MemberID:%s" % (context, member_id)
            continue
        # Get the count for member locations.
        location_count = {}
        for location in locations:
            state = location.get('state', 'unknown')
            city = location.get('city', 'unknown')          
            zipcode = location.get('zipcode', 'unknown')

            loc = "%s^%s^%s" % (state, city, zipcode)
            if location_count.has_key(loc):
                location_count[loc] += 1
            else:
                location_count[loc] = 1
        # Store the member locations.
        for location in location_count:
            state, city, zipcode = location.split('^')
            count = location_count[location]
            member_location = {'memberID':member_id, 'state':state, 'city':city, 'zipcode':zipcode, 'count':count, 'source':'group'}
            location_overall_collection.insert(member_location)

def store_member_location_from_ip(db, dexter_db):
    """Record member locations from ip.
    """
    print "\nStarted recording member locations from ip.\n"
    dexter_collection = dexter_db['Resolved_FBS_PAGE_VIEW']
    location_overall_collection = db['MemberLocationsOverall']

    year_time_bucket = ['2014-year', '2013-year']
    members = dexter_collection.find({"time_bucket": {"$in":year_time_bucket}}).distinct('memberID')
    # Prepare the unique member ids
    members = map(lambda x:str(x).strip(), members)
    members = list(set(members) - set(['1', '2', '3', '4', '5']))
    member_count = len(members)

    for i, member_id in enumerate(members):
        print 'Decuding location from IP for member_id: [%s] [%s/%s]' %(member_id, i+1, member_count)

        results = dexter_collection.aggregate([
                {"$match":{"memberID":{'$in':[member_id, int(member_id)]}}}, \
                {"$unwind":"$time_bucket"},
                {"$match":{"time_bucket":{"$regex":"-day"}}}, \
                {"$group":{"_id":"$time_bucket"}}, \
                {"$sort":{"_id":-1}}, \
                {"$limit":30}, \
            ])

        last_30_day_visits = []
        for time_bucket in results['result']:
            last_30_day_visits.append(time_bucket['_id'])
        print 'member_id visited for %s days' %(len(last_30_day_visits))

        location_count = {}
        results = dexter_collection.find({"memberID":{'$in':[member_id, int(member_id)]}, "time_bucket": {"$in":last_30_day_visits}}, \
                                         {"client_ip":1, "_id":-1})
        for result in results:
            client_ip = result.get('client_ip')
            if not client_ip:
                continue
            location = get_location_from_ip(client_ip)
            if not location:
                continue
            location = [x if x else 'unknown' for x in location]
            location = '^'.join(location)
            if location_count.has_key(location):
                location_count[location] += 1
            else:
                location_count[location] = 1

        for location in location_count:
            country, state, city, zipcode = location.split('^')
            count = location_count[location]
            member_location = {'memberID':member_id, 'country':country, 'state':state, 'city':city, 'zipcode':zipcode, 'count':count, 'source':'ip'}
            location_overall_collection.insert(member_location)

def get_location_from_ip(client_ip):
    """Get the location from IP Address.
    """
    try:
        IP2Info = IP2LocObj.get_all(client_ip)
        location = IP2Info.country_long, IP2Info.region, IP2Info.city, IP2Info.zipcode
        location = map(lambda x: x.lower().strip('-').strip(), location)
        location = map(lambda x: x if x else None, location)        
        return location
    except:
        return None

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

def get_dexter_db():
    """Get mongodb for dexter.
    """
    dexter_db_name = 'dexter'
    dexter_db_username = 'adsadmin'
    # Get the collection from mongodb
    if db_replica_set:
        conn = pymongo.MongoReplicaSetClient(host=db_hostname, port=db_port,
                                             replicaSet=db_replica_set,
                                             read_preference=pymongo.read_preferences.ReadPreference.PRIMARY_PREFERRED)
    else:
        conn = pymongo.MongoClient(host=db_hostname, port=db_port)
    db = conn[dexter_db_name]
    if db_username and db_password:
        db.authenticate(dexter_db_username, db_password)
    return db

if __name__ == "__main__":
    main()
