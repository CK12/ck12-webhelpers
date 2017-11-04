import time
import logging

from flx.controllers.celerytasks.generictask import GenericTask
from flx.controllers.celerytasks.updatemembergroups import MemberGroupUpdateTask
from flx.controllers.celerytasks.updatememberzipcodes import MemberZipcodeTask
from flx.controllers.celerytasks.recordmemberlocationsfromgroup import MemberGroupTask
from flx.controllers.celerytasks.recordmemberlocationsfromip import MemberIPTask

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
        obj = MemberZipcodeTask()
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
