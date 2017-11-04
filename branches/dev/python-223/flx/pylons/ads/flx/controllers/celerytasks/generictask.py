from __future__ import with_statement
from celery.task import Task
import logging
import os
import threading

from flx.model import meta
from flx.model import init_model
from sqlalchemy import engine_from_config
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
    abstract = True
    serializer = "json"
    loglevel = "INFO"
    recordToDB = False

    def __init__(self, **kwargs):
        super(GenericTask, self).__init__()
        self.config = None
        self.user = None
        self.dbsession = None
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
        self.initialize_db()

    def initLogger(self, **kwargs):
        global logger
        if not kwargs.has_key('loglevel'):
            kwargs['loglevel'] = logging.DEBUG

        logger = self.get_logger(**kwargs)
        logger.info("Running is test mode? %s" % str(self.test_mode))
        #logging.getLogger('sqlalchemy').setLevel(logging.DEBUG)

    def initialize_db(self):
        if not self.dbsession:
            with dblock:
                engine = engine_from_config(self.config, 'celery.sqlalchemy.')
                logger.info("Initializing new session ... DB url: %s PID: %s" % (self.config.get("celery.sqlalchemy.url"), os.getpid()))
                init_model(engine)
                h.dataDir = self.config['data_dir']
                self.dbsession = meta.Session()

    def apply_async(self, args=None, kwargs=None,
            task_id=None, producer=None, connection=None, router=None,
            link=None, link_error=None, publisher=None, add_to_parent=True,
            **options):
        logger.info("Task id: %s" % task_id)
        ret = super(GenericTask, self).apply_async(args, kwargs, task_id, producer, connection, router, link, link_error, publisher, add_to_parent, **options)
        return ret

    def delay(self, *args, **kwargs):
        return self.apply_async(args, kwargs)

