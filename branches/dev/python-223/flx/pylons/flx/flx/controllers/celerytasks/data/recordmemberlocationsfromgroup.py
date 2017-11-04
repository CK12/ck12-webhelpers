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
        self.init_db()

    def init_db(self):
        """Initialise the MongoDB instance.
        """
        # Get the flx2 database of mongodb.
        self.db = self.mongo_db
        # Remove the existing data.
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
        try:
            groups = self.db.MemberGroup.find({'memberID':{'$in':[member_id, int(member_id)]}}).distinct('groupID')
            friends = self.db.MemberGroup.find({'groupID':{'$in':groups}}).distinct('memberID')
            locations = self.db.MemberLocation.find({'memberID':{'$in':friends}})
            if not locations.count():
                log.info("No locations found for the MemberID:%s" % member_id)
                return
            # Get the count for member locations.
            location_count = {}
            for location in locations:
                country = location.get('country', 'unknown')
                state = location.get('state', 'unknown')
                city = location.get('city', 'unknown')          
                zipcode = location.get('zipcode', 'unknown')
                friend_id = location.get('memberID')

                loc = "%s^%s^%s^%s" % (country, state, city, zipcode)
                if location_count.has_key(loc):
                    location_count[loc] += 1
                else:
                    location_count[loc] = 1
                # Record the user entered location.
                if friend_id == member_id:
                    member_location = {'memberID':member_id, 'state':state, 'city':city, 'zipcode':zipcode, 'country': country, 'source':'user'}
                    self.db.MemberLocationsOverall.insert(member_location)

            # Store the member locations.
            for location in location_count:
                country, state, city, zipcode = location.split('^')
                count = location_count[location]
                member_location = {'memberID':member_id, 'state':state, 'city':city, 'zipcode':zipcode, 'count':count, 'country': country, 'source':'group'}
                self.db.MemberLocationsOverall.insert(member_location)
        except Exception as e:
            log.info("Unable to Process MemberID:%s, Error:%s" % (member_id, str(e)))

    def run(self, **kwargs):
        """Main function.
        """
        self.process_member_groups()
