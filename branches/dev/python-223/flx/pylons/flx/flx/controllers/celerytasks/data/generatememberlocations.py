import time
import logging

from flx.controllers.celerytasks.generictask import GenericTask
from flx.controllers.celerytasks.data.updatemembergroups import MemberGroupUpdateTask
from flx.controllers.celerytasks.data.updatememberlocations import MemberLocationTask
from flx.controllers.celerytasks.data.updatememberschoollocations import MemberSchoolLocationTask
from flx.controllers.celerytasks.data.recordmemberlocationsfromgroup import MemberGroupTask
from flx.controllers.celerytasks.data.recordmemberlocationsfromip import MemberIPTask
from flx.controllers.celerytasks.data.recordmemberschoollocationsfromgroup import MemberSchoolGroupTask

log = logging.getLogger(__name__)


class MemberLocationsAll(GenericTask):
    """Class to trigger all the celery task to generate member location from Group and IP.
    """
    recordToDB = False
    loglevel = "INFO"

    def __init__(self, **kwargs):
        ## Initialize GenericTask
        GenericTask.__init__(self, **kwargs)
        self.routing_key = "print"
    
    def run(self, **kwargs):
        """Main Application.
        """
        log.info("Started Updating member groups.")
        obj = MemberGroupUpdateTask()
        result = obj.delay()
        while not result.ready():
            time.sleep(5)            
        log.info("Completed Updating member groups.")

        log.info("Started Updating member zipcodes.")
        obj = MemberLocationTask()
        result = obj.delay()
        while not result.ready():
            time.sleep(5)
        log.info("Completed Updating member zipcodes.")
        log.info("Started Generating member locations from group.")
        obj = MemberGroupTask()
        result = obj.delay()
        while not result.ready():
            time.sleep(5)
        log.info("Completed Generating member locations from group.")

        log.info("Started Generating member locations from ip.")
        obj = MemberIPTask()
        result = obj.delay()
        while not result.ready():
            time.sleep(5)
        log.info("Completed Generating member locations from ip.")

        log.info("Started Updating member school locations.")
        obj = MemberSchoolLocationTask()
        result = obj.delay()
        while not result.ready():
            time.sleep(5)
        log.info("Completed Updating member school locations.")

        log.info("Started Generating member school locations from group.")
        obj = MemberSchoolGroupTask()
        result = obj.delay()
        while not result.ready():
            time.sleep(5)
        log.info("Completed Generating member school locations from group.")
