import logging

from flx.model import meta
from flx.controllers.celerytasks.generictask import GenericTask

log = logging.getLogger(__name__)


class MemberLocationTask(GenericTask):
    """Class to record members location to MemberLocation collection.
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
        self.init_db()

    def init_db(self):
        """Initialise the MySQL and MongoDB.
        """
        #Get Mysql session
        self.session = meta.Session()
        # Get the flx2 database of mongodb.
        self.db = self.mongo_db
        # Build state mapping
        self.build_state_mapping()

    def process_member_locations(self):
        """Process actual locations for all the members who have updated there locations.
        """
        log.info("Started processing member locations.")
        #Update Member locations
        qry = "SELECT ml.memberID,usa.zip FROM auth.MemberLocations as ml,auth.USAddresses as usa WHERE ml.addressID=usa.id AND (zip is not null AND zip != '' )"
        results = self.session.execute(qry).fetchall()  
        log.info("Total records to process:%s" % len(results))
        for result in results:
            member_id, zipcode = result
            record = self.get_location_from_zipcode(zipcode)
            record['memberID'] = str(member_id)
            self.db.MemberLocation.update({'memberID':str(member_id)}, {'$set': record}, upsert=True)

        log.info("Completed processing member locations.")

    def build_state_mapping(self):
        """Builds the mapping dictionary with key/values as state short and long names respectively.
        """
        qry = "SELECT name, longname FROM flx2.StandardBoards"
        results = self.session.execute(qry).fetchall()  
        for result in results:
            sname, lname = result
            self.state_mapping[sname.lower()] = lname.lower()

    def get_location_from_zipcode(self, zipcode):
        """Get the location from zipcode.
        """ 
        loc_info = {'zipcode':zipcode}
        loc = self.db.zipcode.find_one({'zipcode':zipcode})
        if loc:
            state = loc.get('state', 'unknown').lower()
            loc_info['state'] = self.state_mapping.get(state, state)
            loc_info['city'] = loc.get('city', 'unknown').lower()
            loc_info['country'] = loc.get('country', 'unknown').lower()            
        return loc_info

    def run(self, **kwargs):
        """Main function.
        """
        self.process_member_locations()
