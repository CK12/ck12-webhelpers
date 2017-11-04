import logging
import IP2Location
import MySQLdb as mdb
from datetime import datetime
from datetime import timedelta
from datetime import date
from urlparse import urlparse
import pymongo

from flx.controllers.celerytasks.generictask import GenericTask
from flx.lib import helpers as h

log = logging.getLogger(__name__)


class MemberIPTask(GenericTask):
    """Class to deduce member location information from IP information.
    """
    recordToDB = False
    loglevel = "INFO"

    def __init__(self, **kwargs):
        ## Initialize GenericTask
        GenericTask.__init__(self, **kwargs)
        self.routing_key = "print"
        self.ip_city_median = 15
        self.ip_zipcode_median = 15
        self.last_data_hours = 24

        self.config = h.load_pylons_config()
        self.run_all_member_ips = int(self.config.get('run_all_member_ips', 0))
        self.ip2location_db_file = self.config.get('ip2location_db_file', '')
        self.init_db()

    def init_db(self):
        """Initialise the MongoDB instance.
        """
        # Get the flx2 database of mongodb.
        self.db = self.mongo_db
        # Get IP Datbase instance.
        self.ip2location = IP2Location.IP2Location()
        self.ip2location.open(self.ip2location_db_file)
        params = ('localhost', 27017, 'dexter', 'rs1', 'adsadmin','D-coD43')
        self.dexter_db = self.get_mongo_db()

    def process_member_ips(self):
        """Process all the members.
        """
        if self.run_all_member_ips:
            log.info("Started ip processing of all the members.")
            year_time_bucket = ['2014-year', '2013-year']
            member_ids = self.dexter_db.Resolved_FBS_PAGE_VIEW.find({"time_bucket": {"$in":year_time_bucket}}).distinct('memberID')
        else:
            log.info("Started ip processing of recent members.")
            # Get last 24 hours updated members/ips.
            yesterday = datetime.now() - timedelta(hours=self.last_data_hours)
            yesterday_time_bucket = tmp_dt.strftime('%Y-%m-%d-day') 
            member_ids = self.dexter_db.Resolved_FBS_PAGE_VIEW.find({'time_bucket':yesterday_time_bucket}).distinct('memberID')

        # Prepare the unique member ids
        member_ids = map(lambda x:str(x).strip(), member_ids)
        member_ids = list(set(member_ids))
        member_count = len(member_ids)
        for i, member_id in enumerate(member_ids):
            if member_id in ['1', '2', '3', '4', '5']:
                continue
            log.info('Decuding location from IP for member_id: [%s] [%s/%s]' %(member_id, i+1, member_count))
            self.record_member_location(member_id)
    
    def record_member_location(self, member_id):
        """Record the information in MemberLocationsAll collection.  
        """
        try:
            # Get last 30 day visits
            results = self.dexter_db.Resolved_FBS_PAGE_VIEW.aggregate([
                    {"$match":{"memberID":member_id}}, \
                    {"$unwind":"$time_bucket"},
                    {"$match":{"time_bucket":{"$regex":"-day"}}}, \
                    {"$group":{"_id":"$time_bucket"}}, \
                    {"$sort":{"_id":-1}}, \
                    {"$limit":30}, \
                ])
            last_30_day_visits = []
            for time_bucket in results['result']:
                last_30_day_visits.append(time_bucket['_id'])
            log.info('memberID visited for %s days' %(len(last_30_day_visits)))

            location_count = {}
            # Get client ips 
            results = self.dexter_db.Resolved_FBS_PAGE_VIEW.find({"memberID":{'$in':[member_id, int(member_id)]}, "time_bucket": {"$in":last_30_day_visits}}, {"client_ip":1, "_id":-1})

            for result in results:
                client_ip = result.get('client_ip')
                if not client_ip:
                    continue
                location = self.get_location_from_ip(client_ip)
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
                self.db.MemberLocationsOverall.update({'memberID':member_id}, {'$set': member_location}, upsert=True)
        except Exception as e:
            log.info("Unable to Process MemberID:%s, Error:%s" % (member_id, str(e)))

    def get_location_from_ip(self, client_ip):
        """Get the location from IP Address.
        """
        try:
            ip2_info = self.ip2location.get_all(client_ip)
            country = ip2_info.country_long.lower()
            state = ip2_info.region.lower()
            city = ip2_info.city.lower()
            zipcode = ip2_info.zipcode.lower()
            return (country, state, city, zipcode)
        except Exception as e:
            return tuple()

    def get_mongo_db(self):
        """Get mongodb.
        """
        db_url = urlparse(self.config['ads_mongo_uri'])
        log.debug("db_url: %s %s %s" % (db_url.path,db_url.username, db_url.password) )
        max_pool_size = int(self.config.get('mongo.max_pool_size', 3))
        replica_set = self.config.get('mongo.replica_set')
        if replica_set:
            conn = pymongo.MongoReplicaSetClient(host=db_url.hostname, port=db_url.port, max_pool_size=max_pool_size,
            replicaSet=replica_set, read_preference=pymongo.read_preferences.ReadPreference.PRIMARY_PREFERRED)
            log.debug("Using Replica Set: %s" % replica_set)
        else:
            conn = pymongo.MongoClient(host=db_url.hostname, port=db_url.port, max_pool_size=max_pool_size)

        db = conn[db_url.path[1:]]
        if db_url.username and db_url.password:
            db.authenticate(db_url.username, db_url.password)

        return db

    def run(self, **kwargs):
        """Main function.
        """
        self.process_member_ips()
