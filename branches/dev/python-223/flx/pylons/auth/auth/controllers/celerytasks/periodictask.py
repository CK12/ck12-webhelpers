from datetime import datetime, timedelta
import logging
import json

from auth.model import api
from auth.controllers.celerytasks.generictask import GenericTask

logger = logging.getLogger(__name__)

class AlreadyRunningException(Exception):

    def __init__(self, value):
        self.value = value

    def __str__(self):
        return repr(self.value)

class PeriodicTask(GenericTask):

    def __init__(self, **kwargs):
        GenericTask.__init__(self, **kwargs)
        """
            Override this method to specify how long should 
            the scheduler wait for the previous task to finish (in minutes)
        """
        self.maxWaitMinutes = 60
        """
            Override this method to specify if the scheduler should skip
            scheduling another instance of a task if one is already running
            Returning False essentially disables the check for periodic tasks as well
        """
        self.skipIfRunning = True

    def isAlreadyRunning(self):
        if self.skipIfRunning:
            taskName = self.__class__.__name__
            logger.warn("Checking for task: %s" % taskName)
    
            now = datetime.now()
            task = api.getLastTaskByName(name=taskName, excludeIDs=[self.task['id']])
            if task and task.status in ['PENDING', 'IN PROGRESS'] and (now - task.started) < timedelta(minutes=self.maxWaitMinutes):
                ## Skip running
                logger.warn('Task [%s] already scheduled or running: %s. Skipping!' % (taskName, task.taskID))
                self.userdata = json.dumps({'message':'Skipped since already running', 'at': str(datetime.now())})
                return True
        return False


