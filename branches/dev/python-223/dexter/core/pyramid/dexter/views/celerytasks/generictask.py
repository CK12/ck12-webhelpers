from __future__ import with_statement
#from pylons.i18n.translation import _ 
from celery.task import Task
import logging
import traceback
import os
import time
import threading

from datetime import datetime
from dexter.models import task as t
import dexter.lib.helpers as h
from urlparse import urlparse
import pymongo
import redis

from dexter.lib.global_lock import GlobalLock, AccessDeniedException

logger = logging.getLogger(__name__)
lock = threading.RLock()
dblock = threading.RLock()
dbsession = None

class GenericTask(Task):
    """
        Generic Celery Task that does basic setup for db and bzr configuration etc.
        All celery tasks should inherit from this class.
    """
    serializer = "json"
    loglevel = "INFO"
    recordToDB = False

    def __init__(self, **kwargs):
        self.config = None
        self.user = None
        self.task = None
        self.taskID = ''
        self.cache = None
        self.db = None
        self.rs = None
        self.singleInstance = False
        self.gl = None

        Task.__init__(self)

        self.test_mode = False
        try:
            testfile = "/var/run/celery/celeryd.test"
            if os.path.exists(testfile):
                self.test_mode = True
                logger.warn("Running in test mode")
        except:
            pass

        self.config = h.load_config(self.test_mode)

        self.initCache()

        ## Init DB
        init_db = True
        if kwargs.has_key('init_db'):
            init_db = kwargs['init_db']
        if init_db:
            self.initialize_db()

        #Initialize Redis Client
        init_cache = True
        if kwargs.has_key('init_cache'):
            init_cache = kwargs['init_cache']
        if init_cache:
            self.initialize_redis()

    def initCache(self):
        keys = self.config.keys()
        #logger.debug('initCache: keys%s' % keys)
        cacheDict = {}
        for key in keys:
            if key.startswith('beaker.'):
                cacheDict[key] = self.config[key]
        #logger.debug('initCache: cacheDict%s' % cacheDict)

        from beaker.cache import CacheManager
        from beaker.util import parse_cache_config_options

        self.cache = CacheManager(**parse_cache_config_options(cacheDict))
        #logger.debug('initCache: cache[%s]' % self.cache)

    def initLogger(self, **kwargs):
        global logger
        if not kwargs.has_key('loglevel'):
            kwargs['loglevel'] = logging.DEBUG

        logger = self.get_logger(**kwargs)
        logger.info("Running is test mode? %s" % str(self.test_mode))
        #logging.getLogger('sqlalchemy').setLevel(logging.DEBUG)

    def initialize_db(self):
        settings = self.config
        global dbsession
        if not dbsession:
            dbsession = self.get_db(settings)
        self.db = dbsession

    def initialize_redis(self):
        settings = self.config
        redis_host = settings['celery_redis.broker.host']
        redis_port = settings['celery_redis.broker.port']
        redis_db = settings['celery_redis.broker.db']
        self.rs = redis.Redis(redis_host, int(redis_port), redis_db)

    @classmethod
    def get_db(self, settings=None):
        if not settings:
            settings = h.load_config(False)
        from dexter.lib.helpers import getDBAndCollectionFromUrl
        db_url, dbname, collection = getDBAndCollectionFromUrl(settings['mongo_uri'])
        logger.debug("db_url[%s], dbname[%s], collection[%s]" % (db_url, dbname, collection))
        max_pool_size = int(settings['mongo.max_pool_size'])
        replica_set = settings.get('mongo.replica_set')
        if replica_set:
            conn = pymongo.MongoReplicaSetClient(hosts_or_uri=db_url, max_pool_size=max_pool_size,
                replicaSet=replica_set, read_preference=pymongo.read_preferences.ReadPreference.PRIMARY_PREFERRED)
            logger.debug("Using Replica Set: %s" % replica_set)
        else:
            conn = pymongo.MongoClient(host=db_url, max_pool_size=max_pool_size)

        db = conn[dbname]
        return db

    def apply_async(self, args=None, kwargs=None,
            task_id=None, producer=None, connection=None, router=None,
            link=None, link_error=None, publisher=None, add_to_parent=True,
            **options):
        logger.info('Calling apply_async of BaseTask. singleInstance: %s' %(self.singleInstance))
        taskName = self.__class__.__name__
        try:
            if self.singleInstance:
                logger.info('Single Instance task. Trying to obtain a lock for taskID: [%s]' %(task_id))
                self.gl = GlobalLock(self.rs, key='%s_GLOBAL_LOCK' %(taskName), value=taskName, blocking=False, expires=60*60*6)
                self.gl.lock()
        except AccessDeniedException as aDE:
            logger.info('Another task of type: [%s] is already running. Exiting...' %(taskName))
            raise aDE
        ret = super(GenericTask, self).apply_async(args, kwargs, task_id, producer, connection, router, link, link_error, publisher, add_to_parent, **options)
        self.enqueueTask(ret, kwargs)
        return ret

    #def delay(self, *args, **kwargs):
    #    return self.apply_async(args, kwargs)

    def run(self, **kwargs):
        self.initLogger(**kwargs)
        #self.initTranslator()
        if kwargs.get('user'):
            self.user = kwargs['user']
        self.startTask()

    def enqueueTask(self, asyncResult, kwargs):
        self.taskID = asyncResult.task_id
        logger.info('Calling enqueueTask for taskID: [%s]' %(self.taskID))
        try:
            self.taskID = asyncResult.task_id
            if self.recordToDB:
                with lock:
                    logger.info("enqueueTask: Broker Task ID: %s" % self.taskID)
                    self.task = t.Task(self.get_db(),True).getTaskByTaskID(taskID=self.taskID)
                    if not self.task:
                        taskDict = {}
                        taskDict['name'] = self.__class__.__name__
                        taskDict['status'] = t.TASK_STATUS_PENDING
                        taskDict['started'] = datetime.now()
                        taskDict['updated'] = datetime.now()
                        if self.taskID:
                            taskDict['taskID'] = self.taskID
                        if kwargs.has_key('user'):
                            taskDict['ownerID'] = kwargs['user']
                        task = t.Task(self.get_db(),True).create(**taskDict)
                        logger.info("enqueueTask: Created task ID: %s" % str(task['_id']))
            else:
                logger.info("enqueueTask recordToDB: %s, skipping task creation in db" % str(self.recordToDB))
        except Exception, e:
            logger.error("enqueueTask: Error creating task record: %s" % str(e))
            logger.error(traceback.format_exc())
            raise e

    def __getTask(self):
        if self.recordToDB:
            #logger.info("TaskID: %s" % self.taskID)
            if self.task and self.task['taskID'] == self.taskID:
                return
            ## No task yet, but we have a taskID - so we look up in the DB.
            if self.taskID:
                ## This function is called from startTask and after_return methods below.
                ## The startTask method can possibly call this function before the enqueueTask()
                ## method has had a chance to create the task row. Hence, we wait and keep checking
                ## for the existing of task row in the database. 
                ## Any other locking mechanism is not feasible since the enqueueTask is called from
                ## paster and startTask is called from a remote celery process.
                ##   -- Nimish
                for i in range(1, 5):
                    task = t.Task(dbsession,True).getTaskByTaskID(taskID=self.taskID)
                    if task:
                        self.task = task
                        logger.info("Got task for %s id: %s [Try: %d]" % (self.taskID, self.task['_id'], i))
                        break
                    else:
                        logger.info("No such task: %s [Try: %d]" % (self.taskID, i))
                    time.sleep(5)
            ## No task and not taskID - this is a problem
            if not self.taskID:
                raise Exception(u"No task id for this task. After 5 attempts.")
        return None

    def startTask(self):
        """
            Mark a task started and add an owner - if one exists
            Note: This method does not change the state of the task to
                  keep it in sync with the Celery/RabbitMQ states.
        """
        self.taskID = self.request.id
        logger.info('Calling startTask for taskID: [%s]' %(self.taskID))
        try:
            if self.recordToDB:
                self.__getTask()
                if self.task:
                    logger.info("Task id from db: %s" % self.task['_id'])
                    taskDict = {}
                    if self.user:
                        taskDict['ownerID'] = self.user
                    taskDict['status'] = t.TASK_STATUS_IN_PROGRESS
                    self.task = t.Task(dbsession,True).update(self.task['_id'], **taskDict)
                    logger.info("startTask: Updated task: %s" % self.task['_id'])
                else:
                    raise Exception(u"startTask: No such task with taskID: %(self.taskID)s" % {"self.taskID":self.taskID})
        except Exception, e:
            logger.error("startTask: Error updating task record: %s" % str(e))
            logger.error(traceback.format_exc())
            raise e

    def updateTask(self):
        """
            Update the task with additional attribute values like the artifactKey
            Note: This method does not change the state of the task to
                  keep it in sync with the Celery/RabbitMQ states.
        """
        try:
            if self.recordToDB:
                if not self.taskID:
                    self.taskID = self.request.id
                self.__getTask()
                if self.task:
                    logger.info("Task id from db: %s" % self.task['_id'])
                    taskDict = { }
                    task = t.Task(dbsession,True).update(self.task['_id'], **taskDict)
                    self.task = task.asDict()
                else:
                    raise Exception(u"updateTask: No such task with taskID: %(self.taskID)s"  % {"self.taskID":self.taskID})
            logger.info('In updateTask. taskName: [%s]' %(self.name))
        except Exception, e:
            logger.error("updateTask: Error updating task record: %s" % str(e))
            logger.error(traceback.format_exc())
            raise e

    ## Overrides after_return from Task - actually BaseTask
    def after_return(self, status, retval, task_id, args, kwargs, einfo=None):
        """Handler called after the task returns.

        :param status: Current task state.
        :param retval: Task return value/exception.
        :param task_id: Unique id of the task.
        :param args: Original arguments for the task that failed.
        :param kwargs: Original keyword arguments for the task
                       that failed.

        :keyword einfo: :class:`~celery.datastructures.ExceptionInfo`
                        instance, containing the traceback (if any).

        The return value of this handler is ignored.

        """
        taskName = self.__class__.__name__
        try:
            if self.recordToDB:
                self.__getTask()
                if self.task:
                    taskDict = {}
                    taskDict['status'] = status
                    msg = str(retval)
                    if len(msg) > 1024:
                        msg = msg[:1024]
                    taskDict['message'] = msg
                    task = t.Task(dbsession,True).update(self.task['_id'], **taskDict)
                    self.task = task
                else:
                    raise Exception(u"after_return: No such task by taskID: %(self.taskID)s"  % {"self.taskID":self.taskID})
            logger.info('Deleting task info for Task ID: [%s] from Redis' %(task_id))
            if self.singleInstance:
                logger.info('Unlocking the global lock held by taskID: [%s]' %(self.taskID))
                self.gl = GlobalLock(self.rs, key='%s_GLOBAL_LOCK' %(taskName), value=taskName, blocking=False, expires=60*60*6)
                self.gl.unlock()
            redisKey = 'celery-task-meta-' + task_id
            self.rs.delete(redisKey)
            Task.after_return(self, status, retval, task_id, args, kwargs, einfo)
        except Exception, e:
            logger.error("after_return: Error updating task record: %s" % str(e))
            logger.error(traceback.format_exc())
            raise e

    def cleanupTask(self, taskID):
        """
            Implement this method in your Task class to perform any clean up actions
            after the task status is set to failure due to timeout.
            The only input to this method is the taskID.
            Please see Import1xBooks from flexr.py for a sample implementation
        """
        pass
