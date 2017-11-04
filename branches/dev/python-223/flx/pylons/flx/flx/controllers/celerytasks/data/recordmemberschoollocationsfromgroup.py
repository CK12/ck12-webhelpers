import logging
import MySQLdb as mdb
from datetime import datetime
from datetime import timedelta

from flx.controllers.celerytasks.generictask import GenericTask
from flx.lib import helpers as h

log = logging.getLogger(__name__)


class MemberSchoolGroupTask(GenericTask):
    """Class to deduce member school location information from group information.
    """
    recordToDB = False
    loglevel = "INFO"

    def __init__(self, **kwargs):
        ## Initialize GenericTask
        GenericTask.__init__(self, **kwargs)
        self.routing_key = "print"
        self.init_db()

    def init_db(self):
        """Initialise the MongoDB instance.
        """
        # Get the flx2 database of mongodb.
        self.db = self.mongo_db
        # Remove the existing data.
        self.db.MemberSchoolLocationsOverall.remove()

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
        try:
            groups = self.db.MemberGroup.find({'memberID':{'$in':[member_id, int(member_id)]}}).distinct('groupID')
            friends = self.db.MemberGroup.find({'groupID':{'$in':groups}}).distinct('memberID')
            locations = self.db.MemberSchoolLocation.find({'memberID':{'$in':friends}})
            if not locations.count():
                log.info("No school locations found for the MemberID:%s" % member_id)
                return
            # Get the count for school location.
            location_count = {}
            for location in locations:
                country = location.get('state', 'unknown')
                state = location.get('state', 'unknown')
                city = location.get('city', 'unknown')          
                zipcode = location.get('zipcode', 'unknown')
                school_name = location.get('school_name', 'unknown')
                friend_id = location.get('memberID')

                loc = "%s^%s^%s^%s^%s" % (country, state, city, zipcode, school_name)
                if location_count.has_key(loc):
                    location_count[loc] += 1
                else:
                    location_count[loc] = 1

                # Record the user entered location.
                if friend_id == member_id:
                    member_school_location = {'memberID':member_id, 'state':state, 'city':city, 'zipcode':zipcode, 'country': country, 'school_name':school_name,'source':'user' }
                    self.db.MemberSchoolLocationsOverall.insert(member_school_location)


            # Store the member school location
            for location in location_count:
                country, state, city, zipcode, school_name = location.split('^')
                count = location_count[location]
                member_school_location = {'memberID':member_id, 'state':state, 'city':city, 'zipcode':zipcode, 'country':country, 'count':count, 'school_name':school_name, 'source':'group'}
                self.db.MemberSchoolLocationsOverall.insert(member_school_location)
        except Exception as e:
            log.info("Unable to Process MemberID:%s, Error:%s" % (member_id, str(e)))

    def run(self, **kwargs):
        """Main function.
        """
        self.process_member_groups()
