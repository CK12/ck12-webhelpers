from __future__ import with_statement
from pylons.i18n.translation import _ 
from celery.task import Task
import logging
import traceback
import os
import time
import threading
import pymongo
import redis
from flx.model import meta
from flx.model import api
from flx.model import model
import flx.lib.helpers as h

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
        self.userdata = None
        self.artifactKey = None
        self.cache = None
        self.rs = None
        self.mongo_db = None

        Task.__init__(self)

        self.test_mode = False
        try:
            testfile = "/var/run/celery/celeryd.test"
            if os.name == 'nt':
                testfile = os.path.join(os.environ.get('WINDIR', 'c:/windows'), 'temp', 'celeryd.test')
            if os.path.exists(testfile):
                self.test_mode = True
                logger.warn("Running in test mode")
        except:
            pass


        self.config = h.load_pylons_config(self.test_mode)

        self.initCache()

        ## Init DB
        init_db = True
        if kwargs.has_key('init_db'):
            init_db = kwargs['init_db']
        if init_db:
            self.initialize_db()

        ## Init Mongo DB
        init_mongo_db = True
        if kwargs.has_key('init_mongo_db'):
            init_mongo_db = kwargs['init_mongo_db']
        if init_mongo_db:
            self.initialize_mongo_db()
        self.initialize_redis()

        self.session = kwargs.get('session', None)

    def initCache(self):
        keys = self.config.keys()
        #logger.debug('initCache: keys%s' % keys)
        cacheDict = {}
        for key in keys:
            if key.startswith('beaker.cache.'):
                cacheDict[key] = self.config[key]
        #logger.debug('initCache: cacheDict%s' % cacheDict)

        from beaker.cache import CacheManager
        from beaker.util import parse_cache_config_options

        self.cache = CacheManager(**parse_cache_config_options(cacheDict))
        #logger.debug('initCache: cache[%s]' % self.cache)

    def initTranslator(self):
        h.initTranslator()

    def initLogger(self, **kwargs):
        global logger
        if not kwargs.has_key('loglevel'):
            kwargs['loglevel'] = logging.DEBUG

        logger = self.get_logger(**kwargs)
        logger.info("Running is test mode? %s" % str(self.test_mode))
        #logging.getLogger('sqlalchemy').setLevel(logging.DEBUG)

    def initialize_redis(self):
        settings = self.config
        redis_host = settings['celery_redis.broker.host']
        redis_port = settings['celery_redis.broker.port']
        redis_db = settings['celery_redis.broker.db']
        self.rs = redis.Redis(redis_host, int(redis_port), redis_db)
    
    def initialize_db(self):
        global dbsession
        if not dbsession:
            dblock.acquire()
            try:
                from flx.model import init_model, getSQLAlchemyEngines as getEngines

                engines = getEngines(self.config, prefix='celery.sqlalchemy')
                init_model(engines)
                h.dataDir = self.config['data_dir']
                dbsession = meta.Session()
            finally:
                dblock.release()

    def initialize_mongo_db(self):
        """
        """
        db_url, dbname, collection = h.getDBAndCollectionFromUrl(self.config['mongo_uri'])
        logger.debug("db_url: %s %s %s" % (db_url, dbname, collection) )
        max_pool_size = int(self.config.get('mongo.max_pool_size', 3))
        replica_set = self.config.get('mongo.replica_set')
        if replica_set:
            conn = pymongo.MongoReplicaSetClient(hosts_or_uri=db_url, max_pool_size=max_pool_size,
            replicaSet=replica_set, read_preference=pymongo.read_preferences.ReadPreference.PRIMARY_PREFERRED)
            logger.debug("Using Replica Set: %s" % replica_set)
        else:
            conn = pymongo.MongoClient(host=db_url, max_pool_size=max_pool_size)

        db = conn[dbname]
        self.mongo_db = db

    def apply_async(self, args=None, kwargs=None,
            task_id=None, producer=None, 
            link=None, link_error=None, 
            **options):
        logger.info("Task id: %s" % task_id)
        ret = super(GenericTask, self).apply_async(args, kwargs, task_id, producer, link, link_error, **options)
        self.enqueueTask(ret, kwargs, session=self.session)
        return ret
    
    def delay(self, *args, **kwargs):
        return self.apply_async(args, kwargs)

    def run(self, **kwargs):
        self.initLogger(**kwargs)
        self.initTranslator()
        if kwargs.get('user'):
            self.user = kwargs['user']
        self.startTask()

    @classmethod
    def enqueueTask(cls, asyncResult, kwargs, session=None):
        try:
            if cls.recordToDB:
                with lock:
                    taskID = asyncResult.task_id
                    logger.info("enqueueTask: RMQ Task ID: %s" % taskID)
                    if session:
                        task = api._getTaskByTaskID(session, taskID=taskID)
                    else:
                        task = api.getTaskByTaskID(taskID=taskID)
                    if not task:
                        taskDict = {}
                        taskDict['name'] = cls.__name__
                        taskDict['status'] = model.TASK_STATUS_PENDING
                        if taskID:
                            taskDict['taskID'] = taskID
                        if kwargs.has_key('revisionID'):
                            taskDict['artifactKey'] = kwargs['revisionID']
                        if kwargs.has_key('user'):
                            taskDict['ownerID'] = kwargs['user']
                        task = api.createTask(**taskDict)
                        logger.info("enqueueTask: Created task ID: %d" % task.id)
            else:
                logger.info("enqueueTask recordToDB: %s, skipping task creation in db" % str(cls.recordToDB))
        except Exception, e:
            logger.error("enqueueTask: Error creating task record: %s" % str(e))
            logger.error(traceback.format_exc())
            raise e

    def __getTask(self):
        if self.recordToDB:
            logger.info("TaskID: %s" % self.taskID)
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
                    task = api.getTaskByTaskID(taskID=self.taskID)
                    if task:
                        self.task = task.asDict()
                        ## Clean up userdata
                        self.userdata = self.task.get('userdata')
                        self.artifactKey = self.task.get('artifactKey')
                        logger.info("Got task for %s id: %s [Try: %d]" % (self.taskID, self.task['id'], i)) 
                        break
                    else:
                        logger.info("No such task: %s [Try: %d]" % (self.taskID, i))
                    time.sleep(5)
            ## No task and not taskID - this is a problem
            if not self.taskID:
                raise Exception((_(u"No task id for this task. After 5 attempts.")).encode("utf-8"))
        return None

    def startTask(self):
        """
            Mark a task started and add an owner - if one exists 
            Note: This method does not change the state of the task to
                  keep it in sync with the Celery/RabbitMQ states.
        """
        try:
            if self.recordToDB:
                self.taskID = self.request.id
                logger.info("RMQ Task ID: %s" % self.taskID)
                self.__getTask()
                if self.task:
                    logger.info("Task id from db: %s" % self.task['id'])
                    taskDict = {'id': self.task['id'] }
                    if self.user:
                        taskDict['ownerID'] = self.user
                    taskDict['userdata'] = self.userdata
                    taskDict['status'] = model.TASK_STATUS_IN_PROGRESS
                    taskDict['artifactKey'] = self.artifactKey
                    taskDict['hostname'] = h.getHostname()
                    task = api.updateTask(**taskDict)
                    self.task = task.asDict()
                    logger.info("startTask: Updated task: %d" % self.task['id'])
                else:
                    raise Exception((_(u"startTask: No such task with taskID: %(self.taskID)s")  % {"self.taskID":self.taskID}).encode("utf-8"))
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
                    logger.info("Task id from db: %s" % self.task['id'])
                    taskDict = {'id': self.task['id'] }
                    taskDict['artifactKey'] = self.artifactKey
                    logger.info('updateTask: Added artifactKey to task %d' %(self.task['id']))
                    taskDict['userdata'] = self.userdata
                    task = api.updateTask(**taskDict)
                    self.task = task.asDict()
                else:
                    raise Exception((_(u"updateTask: No such task with taskID: %(self.taskID)s")  % {"self.taskID":self.taskID}).encode("utf-8"))
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
        try:
            if self.recordToDB:
                self.__getTask()
                if self.task:
                    taskDict = {}
                    taskDict['id'] = self.task['id']
                    taskDict['status'] = status
                    msg = str(retval)
                    if len(msg) > 1024:
                        msg = msg[:1024]
                    taskDict['message'] = msg
                    taskDict['userdata'] = self.userdata
                    task = api.updateTask(**taskDict)
                    self.task = task.asDict()
                else:
                    raise Exception((_(u"after_return: No such task by taskID: %(self.taskID)s")  % {"self.taskID":self.taskID}).encode("utf-8"))
            redisKey = 'celery-task-meta-' + task_id
            logger.info("Going to delete key: %s" % redisKey)
            self.rs.delete(redisKey)
            ## Call parent
            Task.after_return(self, status, retval, task_id, args, kwargs, einfo)
        except Exception, e:
            logger.error("after_return: Error updating task record: %s" % str(e))
            logger.error(traceback.format_exc())
            raise e

    def getFuncName(self):
        import inspect

        return inspect.stack()[1][3]

    @classmethod
    def cleanupTask(cls, taskID):
        """
            Implement this method in your Task class to perform any clean up actions 
            after the task status is set to failure due to timeout.
            The only input to this method is the taskID.
            Please see Import1xBooks from flexr.py for a sample implementation
        """
        pass
