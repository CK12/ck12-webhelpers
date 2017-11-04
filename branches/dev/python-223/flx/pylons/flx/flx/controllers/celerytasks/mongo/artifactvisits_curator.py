from flx.controllers.celerytasks.periodictask import PeriodicTask
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class ArtifactVisitsCuratorTask(PeriodicTask):

    recordToDB = False

    def __init__(self, **kwargs):
        ## Initialize GenericTask
        PeriodicTask.__init__(self, **kwargs)
        self.routing_key = 'artifact'
        # Get the flx2 database of mongodb.
        self.db = self.mongo_db
        
    def run(self, **kwargs):
        """
            Remove the ArtifactVisits records which are older than six months.
        """
        PeriodicTask.run(self, **kwargs)
        try:
            old_dt = self.get_old_date()    
            logger.info("Old Date:%s" % old_dt)
            # Delete the records older than 180 days
            result = self.db.ArtifactVisits.remove({'processedAt':{'$lt': old_dt}})
            logger.info("Remove results:%s" % result)            
        except Exception, e:
            logger.error('Remove artifact visits curator Exception[%s]' % str(e), exc_info=e)
            raise e
            
    def get_old_date(self):
        """Returns the yesterdays start and end time.
        """
        no_of_days = 180
        today = datetime.now()        
        dt = today - timedelta(days=no_of_days)
        old_dt = datetime(dt.year, dt.month, dt.day)
        return old_dt
