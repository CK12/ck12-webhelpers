from flx.controllers.celerytasks.periodictask import PeriodicTask
from pylons.i18n.translation import _ 
from flx.model import api
from flx.model import model

import logging
import os
import re
import json
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

PROTECTED_TASKS = [
        "epub",
        "mobi",
        "pdf",
        "worksheet",
        #"Import1xBooks",
        "assembleArtifactTask",
        ]

EAGER_CLEANUP_TASKS = [
        "EmailNotifierTask",
        "deleteArtifactTask",
        "Reindex",
        "SyncIndex",
        "MathCacheTask",
        "AssignmentPushNotifierTask",
        ]

## If clean up is needed after a task status is set to Failure due to timeout,
## add the task-class mapping here
## In addtion, the task must implement a cleanupTask class method
TASK_CLASS_MAPPINGS = {
        'Import1xBooks': 'flx.controllers.celerytasks.flexr',
        }

class TasksMaintainerTask(PeriodicTask):

    recordToDB = False

    def __init__(self, **kwargs):
        ## Initialize PeriodicTask
        PeriodicTask.__init__(self, **kwargs)
        self.routing_key = 'artifact'
        self.skipIfRunning = True
        self.celeryConfig = os.path.join(self.config.get('flx_home'), 'celeryconfig_queues.py')
        if os.path.exists(self.celeryConfig):
            regex = re.compile(r'^CELERYD_TASK_TIME_LIMIT\s*=\s*(\d+)')
            for line in open(self.celeryConfig, 'r'):
                line = line.strip()
                m = regex.match(line)
                if m:
                    ## Add 20 minutes to max limit
                    self.maxTaskTimeLimit = int(m.group(1)) + 20*60
                    logger.info("maxTaskTimeLimit: %d" % self.maxTaskTimeLimit)
                    break
        else:
            raise Exception((_(u'Could not find celeryConfig: %(self.celeryConfig)s')  % {"self.celeryConfig":self.celeryConfig}).encode("utf-8"))
        if not self.maxTaskTimeLimit:
            raise Exception((_(u"Could not get maximum task run time")).encode("utf-8"))


    def run(self, **kwargs):
        logger.info("maxTaskTimeLimit: %d" % self.maxTaskTimeLimit)
        now = datetime.now()
        before = now - timedelta(seconds=self.maxTaskTimeLimit)
        taskCleanupDaysLongTerm = int(self.config.get('task_cleanup_interval_days_long_term'))
        taskCleanupDaysShortTerm = int(self.config.get('task_cleanup_interval_days_short_term'))
        eventCleanupDays = int(self.config.get('event_cleanup_interval_days'))
        logger.info("Getting tasks last updated before: %s" % before)
        pageSize = 256
        pageNum = 1
        updated = failed = purged = evtPurged = 0
        while True:
            try:
                tasks = api.getTasksByLastUpdateTime(lastUpdated=before, op='before', names=None, statusList=['IN PROGRESS'], pageNum=pageNum, pageSize=pageSize)
                if not tasks:
                    break
                for task in tasks:
                    try:
                        data = { 'id': task.id, 'status': model.TASK_STATUS_FAILURE }
                        udata = {}
                        if task.userdata:
                            try:
                                udata = json.loads(task.userdata)
                            except:
                                udata = {'data': task.userdata}
                        udata['__timeout__'] = 'Task run time exceeded timeout of: %s' % self.maxTaskTimeLimit
                        data['userdata'] = json.dumps(udata)
                        logger.info("Marking task failed due to timeout exceeded! Updating task: %d, last updated on: %s" % (task.id, str(task.updated)))
                        t = api.updateTask(**data)
                        if TASK_CLASS_MAPPINGS.has_key(task.name):
                            module = __import__(TASK_CLASS_MAPPINGS[task.name], fromlist=[task.name])
                            klass = getattr(module, task.name)
                            logger.info("Calling cleanup for: %s, module: %s, class: %s" % (task.name, module, klass))
                            klass.cleanupTask(task.taskID)
                        else:
                            logger.info("No cleanup for: %s" % task.name)

                        updated += 1
                    except Exception as e:
                        failed += 1
                        logger.error('Error marking task id: %d as failed' % task.id, exc_info=e)
                pageNum += 1
            except Exception as e:
                logger.error("Error getting tasks by start time: %s" % str(e), exc_info=e)

        cleanupSchedules = [
                {
                    'interval': taskCleanupDaysLongTerm,
                    'taskNames': None ## All unprotected tasks
                },
                {
                    'interval': taskCleanupDaysShortTerm,
                    'taskNames': EAGER_CLEANUP_TASKS
                }
            ]
        for schedule in cleanupSchedules:
            ## Delete old tasks (> taskCleanupDays days old)
            taskCleanupDays = schedule['interval']
            taskNames = schedule['taskNames']
            before = now - timedelta(days=taskCleanupDays)
            logger.info('Purging tasks names: [%s], interval: %d days, threshold: %s' % (str(taskNames), taskCleanupDays, str(before)))
            try:
                purged += api.deleteTasksByLastUpdateTime(lastUpdated=before, op='before', names=taskNames, excludeNames=PROTECTED_TASKS, statusList=None)
            except Exception as e:
                logger.error("Error deleting tasks by update time: %s" % str(e), exc_info=e)

        ## Delete old events (> eventCleanupDays days old)
        before = now - timedelta(days=eventCleanupDays)
        logger.info('Purging events interval: %d days, threshold: %s' % (eventCleanupDays, str(before)))
        try:
            evtPurged = api.deleteEventsByTimestamp(timestamp=before, op='before', eventTypeIDs=None, excludeTypeIDs=None)
        except Exception as e:
            logger.error("Error deleting events by created time: %s" % str(e), exc_info=e)

        return {'updated': updated, 'failed': failed, 'purged': purged, 'eventsPurged': evtPurged}
