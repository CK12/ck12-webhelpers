import logging

from flx.model import meta
from flx.controllers.celerytasks.generictask import GenericTask

log = logging.getLogger(__name__)


class MemberGroupUpdateTask(GenericTask):
    """Class to record member and his group information in MemberGroup collection.
    """
    recordToDB = False
    loglevel = "INFO"

    def __init__(self, **kwargs):
        ## Initialize GenericTask
        GenericTask.__init__(self, **kwargs)
        self.routing_key = "print"
        self.last_data_hours = 24
        self.exclude_member_ids = '1, 2, 3, 4, 5'
        self.exclude_group_ids = '1, 2, 3'
        self.state_mapping = dict()
        self.init_db()

    def init_db(self):
        """Initialise the MySQL and MongoDB.
        """
        #Get Mysql session
        self.session = meta.Session()        
        # Get the flx2 database of mongodb.
        self.db = self.mongo_db

    def process_member_groups(self):
        """Process the updation of members group.
        """
        qry = "SELECT memberID, groupID, joinTime FROM flx2.GroupHasMembers WHERE memberID NOT IN (%s) AND groupID NOT IN (%s)" % (self.exclude_member_ids, self.exclude_group_ids)
        log.info("Started processing for all the member groups.")
        results = self.session.execute(qry).fetchall()
        log.info("Total records to processs :%s" % len(results))
        # Record the member group information.
        for result in results:
            member_id, group_id, join_time = result
            record = dict()
            record['memberID'] = str(member_id)
            record['groupID'] = str(group_id)
            record['joinTime'] = join_time
            self.db.MemberGroup.update({'memberID':str(member_id), 'groupID':str(group_id)}, {'$set': record}, upsert=True)
        log.info("Completed processing for all the member groups.")

    def run(self, **kwargs):
        """Main Application.
        """
        self.process_member_groups()
