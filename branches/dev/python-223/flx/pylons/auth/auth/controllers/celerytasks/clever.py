import json
import logging

from auth.controllers.celerytasks.periodictask import PeriodicTask
from auth.lib.clever import CleverPartner

log = logging.getLogger(__name__)

class CleverTask(PeriodicTask):

    recordToDB = True

    def run(self, **kwargs):
        log.debug("CleverTask: run")
        data = {'messages': "Success"}
        self.userdata = json.dumps(data) 
        self.updateTask()
        return data

class CleverPartnerUpdator(PeriodicTask):
    recordToDB = True

    def __init__(self, **kwargs):
        ## Initialise Periodic
        PeriodicTask.__init__(self, **kwargs)
        self.routing_key = 'data-auth'
        self.skipIfRunning = True

    def run(self, **kwargs):
        PeriodicTask.run(self, **kwargs)
        data = CleverPartner(logLevel='info', config=self.config)._init(**kwargs)
        self.userdata = json.dumps(data) 
        self.updateTask()

        return data
