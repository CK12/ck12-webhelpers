import logging
from datetime import datetime
from datetime import timedelta
import MySQLdb as mdb

from flx.controllers.celerytasks.generictask import GenericTask
from flx.lib import helpers as h

log = logging.getLogger(__name__)

# MySQL configuration
HOST = "mysql.master"
USER = "dbadmin"
PASSWORD = "D-coD#43"
DB = "flx2"


class MemberZipcodeTask(GenericTask):
    """Class to record members zipcode to MemberZipcode collection.
    """
    recordToDB = False
    loglevel = "INFO"

    def __init__(self, **kwargs):
        ## Initialize GenericTask
        GenericTask.__init__(self, **kwargs)
        self.routing_key = "print"
        self.last_data_hours = 24
        self.exclude_member_ids = '1, 2, 3, 4, 5'
        self.state_mapping = dict()

        self.config = h.load_pylons_config()
        self.run_all_member_zipcodes = int(self.config.get('run_all_member_zipcodes', 0))

        self.init_db()

    def init_db(self):
        """Initialise the MySQL and MongoDB.
        """
        # Get Mysql cursor
        conn = mdb.connect(host=HOST, user=USER, passwd=PASSWORD, db=DB, use_unicode=True)
        self.cur = conn.cursor()

        # Get the flx2 database of mongodb.
        self.db = self.mongo_db
        # Create index for memberID field if does not exists.
        self.db.MemberZipcode.ensure_index('memberID')

        # Build state mapping
        self.build_state_mapping()

    def process_all_member_zipcodes(self):
        """Process actual locations for all the members who have updated there locations.
        """
        log.info("Started processing all member zipcodes.")
        #Update Member zipcodes
        qry = "SELECT ml.memberID,usa.zip FROM auth.MemberLocations as ml,auth.USAddresses as usa WHERE ml.addressID=usa.id AND (zip is not null AND zip != '' )"
        self.cur.execute(qry)
        results = self.cur.fetchall()
        log.info("Total records to process:%s" % len(results))
        for result in results:
            member_id, zipcode = result
            record = self.get_location_from_zipcode(zipcode)
            record['memberID'] = str(member_id)
            self.db.MemberZipcode.update({'memberID':str(member_id)}, {'$set': record}, upsert=True)

        log.info("Completed processing all member zipcodes.")
        # Update MemberSchool zipcodes
        log.info("Started processing all member school zipcodes.")
        qry = "SELECT ms.memberID, usm.name, usm.nces_id, usm.zipcode from auth.MemberSchools ms, auth.USSchoolsMaster usm where ms.schoolID=usm.id"
        self.cur.execute(qry)
        results = self.cur.fetchall()
        log.info("Total records to process:%s" % len(results))
        for result in results:
            member_id, school_name, nces_id, school_zipcode = result
            tmp_record = self.get_location_from_zipcode(school_zipcode)
            record = dict()
            for key in ['zipcode', 'state', 'city', 'location']:
                if tmp_record.has_key(key):
                    new_key = "school_%s" % key
                    record[new_key] = tmp_record[key]            
            record['memberID'] = str(member_id)
            record['school_name'] = school_name
            record['nces_id'] = nces_id
            self.db.MemberZipcode.update({'memberID':str(member_id)}, {'$set': record}, upsert=True)
        log.info("Completed processing all member school zipcodes.")

    def process_recent_member_zipcodes(self, hrs=24):
        """Process actual locations for all the members who have updated there locations in last 24 hours.
        """
        log.info("Started processing recent member zipcodes.")
        # Get all the Members who have updated there information in last 24 hours.
        tmp_dt = datetime.now() - timedelta(hours=hrs)
        dt = tmp_dt.strftime('%Y-%m-%d 00:00:00')        
        qry = "SELECT id FROM auth.Members WHERE id NOT IN (%s) AND updateTime > '%s'"% (self.exclude_member_ids, dt)
        self.cur.execute(qry)
        results = self.cur.fetchall()
        if results:
            members = map(lambda x:str(x[0]), results)
            member_ids = ','.join(members)
            # Get zipcode for all the updated members.
            qry = "SELECT ml.memberID,usa.zip FROM auth.MemberLocations as ml,auth.USAddresses as usa WHERE ml.addressID=usa.id AND (zip is not null AND zip != '' ) AND ml.memberID IN (%s)" % member_ids
            self.cur.execute(qry)
            results = self.cur.fetchall()
            log.info("Total records to process :%s" % len(results))
            # Update the zipcode/location in MemberZipcode collection.
            for result in results:
                member_id, zipcode = result
                record = self.get_location_from_zipcode(zipcode)
                record['memberID'] = str(member_id)
                self.db.MemberZipcode.update({'memberID':str(member_id)}, {'$set': record}, upsert=True)

            log.info("Completed processing recent member zipcodes.")            
            log.info("Started processing recent member school zipcodes.")

            # Update MemberSchool zipcodes
            qry = "SELECT ms.memberID, usm.name, usm.nces_id, usm.zipcode from auth.MemberSchools ms, auth.USSchoolsMaster usm where ms.schoolID=usm.id AND ms.memberID IN (%s)" % member_ids
            self.cur.execute(qry)
            results = self.cur.fetchall()
            log.info("Total records to process :%s" % len(results))
            for result in results:
                member_id, school_name, nces_id, school_zipcode = result
                tmp_record = self.get_location_from_zipcode(school_zipcode)
                record = dict()
                for key in ['zipcode', 'state', 'city', 'location']:
                    if tmp_record.has_key(key):
                        new_key = "school_%s" % key
                        record[new_key] = tmp_record[key]            
                record['memberID'] = str(member_id)
                record['school_name'] = school_name
                record['nces_id'] = nces_id
                self.db.MemberZipcode.update({'memberID':str(member_id)}, {'$set': record}, upsert=True)
            log.info("Completed processing recent member school zipcodes.")

    def build_state_mapping(self):
        """Builds the mapping dictionary with key/values as state short and long names respectively.
        """
        qry = "SELECT name, longname FROM flx2.StandardBoards"
        self.cur.execute(qry) 
        results = self.cur.fetchall()  
        for result in results:
            sname, lname = result
            self.state_mapping[sname.lower()] = lname.lower()

    def get_location_from_zipcode(self, zipcode):
        """Get the location from zipcode.
        """ 
        loc_info = {'zipcode':zipcode}
        loc = self.db.zipcode.find_one({'zipcode':zipcode})
        if loc:
            state = loc.get('state', 'na').lower()
            loc_info['state'] = self.state_mapping.get(state, state)
            loc_info['city'] = loc.get('city', 'na').lower()
            loc_info['location'] = '%s:%s' % (loc_info['state'], loc_info['city'])
        return loc_info

    def run(self, **kwargs):
        """Main function.
        """
        if self.run_all_member_zipcodes:
            self.process_all_member_zipcodes()
        else:
            self.process_recent_member_zipcodes(hrs=self.last_data_hours)
