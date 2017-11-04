import logging
#from datetime import datetime
#from datetime import date
#from datetime import time
#from datetime import timedelta

#from dexter.models import page as p
from dexter.lib import helpers as h

log = logging.getLogger(__name__)


class LMSInstall(object):
    """
    LMSInstall related Model APIs.
    """

    def __init__(self, db, dc=False):
        self.db = db
        # Dependency check flag
        self.dc = dc

    @h.trace
    def get_lms_installs(self):
        """
        Get the total number of LMS Instals.
        """
        launchTimeStamp = h.toDatetime("2014-04-04 22:00", format="%Y-%m-%d %H:%M")
        query = {"timestamp":{"$gte" : launchTimeStamp} }
        totalCount = self.db.Resolved_FBS_LMS_INSTALL.find(query).count()
        log.info(totalCount)
        return totalCount
