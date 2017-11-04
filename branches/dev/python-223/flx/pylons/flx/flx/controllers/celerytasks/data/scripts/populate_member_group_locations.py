import time
import MySQLdb as mdb
import pymongo

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

exclude_member_ids = '1, 2, 3, 4, 5'
exclude_group_ids = '1, 2, 3'
state_mapping = dict()

conn = mdb.connect(host=HOST, user=USER, passwd=PASSWORD, db=DB, use_unicode=True)
cur = conn.cursor()


def main():
    """
    """
    stime = time.time()
    db = get_mongo_db()
    zipcode_collection = db['zipcode']
    group_collection = db['MemberGroup']
    location_collection = db['MemberLocation']
    school_location_collection = db['MemberSchoolLocation']

    # Populate MemberGroup collection.
    qry = "SELECT memberID, groupID, joinTime FROM flx2.GroupHasMembers WHERE memberID NOT IN (%s) AND groupID NOT IN (%s)" % \
          (exclude_member_ids, exclude_group_ids)
    cur.execute(qry)
    results = cur.fetchall()
    record_count = len(results)
    print "Total member group records to process :%s" % record_count
    # Remove the existing data and Record the member group information.
    group_collection.remove()
    for i, result in enumerate(results):
        member_id, group_id, join_time = result
        print 'Processing member group for member_id: [%s] [%s/%s]' %(member_id, i+1, record_count)
        record = dict()
        record['memberID'] = str(member_id)
        record['groupID'] = str(group_id)
        record['joinTime'] = join_time
        group_collection.insert(record)

    # Populate MemberLocation collection.
    build_state_mapping()
    qry = "SELECT ml.memberID,usa.zip FROM auth.MemberLocations as ml,auth.USAddresses as usa WHERE ml.addressID=usa.id AND (zip is not null AND zip != '' )"
    cur.execute(qry)
    results = cur.fetchall()
    record_count = len(results)
    print "Total member location records to process :%s" % record_count
    # Remove the existing data and Record the member location information.
    location_collection.remove()
    for i,result in enumerate(results):
        member_id, zipcode = result
        print 'Processing member location for member_id: [%s] [%s/%s]' %(member_id, i+1, record_count)
        record = get_location_from_zipcode(zipcode, zipcode_collection)
        record['memberID'] = str(member_id)
        location_collection.insert(record)
    print "Completed processing of the member locations."

    # Populate MemberSchoolLocation collection.
    print "\n\nStarted processing the school locations."
    qry = "SELECT ms.memberID, usm.name, usm.nces_id, usm.zipcode from auth.MemberSchools ms, auth.USSchoolsMaster usm where ms.schoolID=usm.id"
    cur.execute(qry)
    results = cur.fetchall()
    record_count = len(results)
    print "Total member school location records to process :%s" % record_count
    # Remove the existing data and Record the member school location information.
    school_location_collection.remove()
    for i,result in enumerate(results):
        member_id, school_name, nces_id, school_zipcode = result
        print 'Processing member school location for member_id: [%s] [%s/%s]' %(member_id, i+1, record_count)
        record = get_location_from_zipcode(school_zipcode, zipcode_collection)
        record['memberID'] = str(member_id)
        record['school_name'] = school_name
        record['nces_id'] = nces_id
        school_location_collection.insert(record)
    print "Completed processing the member school locations."

    print "\nTime taken:%s" % (time.time() - stime)

def get_location_from_zipcode(zipcode, zipcode_collection):
    """Get the location from zipcode.
    """ 
    loc_info = {'zipcode':zipcode}
    loc = zipcode_collection.find_one({'zipcode':zipcode})
    if loc:
        state = loc.get('state', 'na').lower()
        loc_info['state'] = state_mapping.get(state, state)
        loc_info['city'] = loc.get('city', 'na').lower()            
    return loc_info

def build_state_mapping():
    """Builds the mapping dictionary with key/values as state short and long names respectively.
    """
    global state_mapping
    qry = "SELECT name, longname FROM flx2.StandardBoards"
    cur.execute(qry)
    results = cur.fetchall()
    for result in results:
        sname, lname = result
        state_mapping[sname.lower()] = lname.lower()

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
    main()
