import logging
import MySQLdb as mdb
from datetime import datetime
from datetime import timedelta

from flx.controllers.celerytasks.generictask import GenericTask
from flx.lib import helpers as h

log = logging.getLogger(__name__)


class MemberGroupTask(GenericTask):
    """Class to deduce member location information from group information.
    """
    recordToDB = False
    loglevel = "INFO"

    def __init__(self, **kwargs):
        ## Initialize GenericTask
        GenericTask.__init__(self, **kwargs)
        self.routing_key = "print"
        self.group_city_median = 15
        self.group_zipcode_median = 15
        self.last_data_days = 1
        self.exclude_member_ids = '1, 2, 3, 4, 5'
        self.exclude_group_ids = '1, 2, 3'

        self.config = h.load_pylons_config()
        self.init_db()

    def init_db(self):
        """Initialise the MongoDB instance.
        """
        # Get the flx2 database of mongodb.
        self.db = self.mongo_db
        # Ensure that required indexes exists.
        self.db.MemberLocationsOverall.ensure_index('memberID')
        #Remove the existing data.
        self.db.MemberLocationsOverall.remove()

    def process_member_groups(self):
        """Process all the members of every group.
        """
        # Get all the member ids
        member_ids = self.db.MemberGroup.distinct('memberID')
        # Prepare the unique member ids
        member_ids = map(lambda x:str(x).strip(), member_ids)
        member_ids = list(set(member_ids))
        member_count = len(member_ids)
        for i, member_id in enumerate(member_ids):
            if member_id in ['1', '2', '3', '4', '5']:
                continue
            log.info('Decuding location from Group for member_id: [%s] [%s/%s]' %(member_id, i+1, member_count))
            self.record_member_location(member_id)        
    
    def record_member_location(self, member_id):
        """Record the information in MemberLocationsAll collection.  
        """
        log.info("Processing MemberID:%s" % member_id)
        friends = []
        city_actual_location = None
        zipcode_actual_location = None
        try:
            groups = self.db.MemberGroup.find({'memberID':{'$in':[member_id, int(member_id)]}}).distinct('groupID')
            friends = self.db.MemberGroup.find({'groupID':{'$in':groups}}).distinct('memberID')
            locations = self.db.MemberZipcode.find({'memberID':{'$in':friends}})
            if not locations.count():
                log.info("No locations found for the MemberID:%s" % member_id)
                return
            # Get the count for location and school.
            location_count = {}
            school_location_count = {}
            for location in locations:
                state = location.get('state', 'unknown')
                city = location.get('city', 'unknown')          
                zipcode = location.get('zipcode', 'unknown')

                loc = "%s^%s^%s" % (state, city, zipcode)
                if location_count.has_key(loc):
                    location_count[loc] += 1
                else:
                    location_count[loc] = 1

                school_state = location.get('school_state', 'unknown')
                school_city = location.get('school_city', 'unknown')          
                school_zipcode = location.get('school_zipcode', 'unknown')

                school_loc = "%s^%s^%s" % (school_state, school_city, school_zipcode)
                if school_location_count.has_key(school_loc):
                    school_location_count[school_loc] += 1
                else:
                    school_location_count[school_loc] = 1

            # Deducing the school zipcode, zipcode having highest count.
            schools = tuple(school_location_count.items())
            sorted_schools = sorted(schools, key=lambda x:float(x[1]), reverse=True)
            school_zipcode = None
            if sorted_schools:
                tmp_data = sorted_schools[0][0]
                school_zipcode = tmp_data.split('^')[2]

            # Store the member location
            for location in location_count:
                state, city, zipcode = location.split('^')
                count = location_count[location]
                member_location = {'member_id':member_id, 'state':state, 'city':city, 'zipcode':zipcode, 'count':count, 'source':'group'}
                if school_zipcode:
                    member_location['school_zipcode'] = school_zipcode
                self.db.insert(member_location)
        except Exception as e:
            log.info("Unable to Process MemberID:%s, Error:%s" % (member_id, str(e)))

    def run(self, **kwargs):
        """Main function.
        """
        self.process_member_groups()
