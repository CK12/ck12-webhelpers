import logging
import traceback

from celery import task

#from time import sleep

from dexter.views.celerytasks.generictask import GenericTask

log = logging.getLogger(__name__)

@task(name="tasks.dispatcher", base=GenericTask)
class Dispatcher(GenericTask):

    def run(self, **kwargs):
        GenericTask.run(self, **kwargs)
        try:
            log.info('Running dispatcher...')
            from dexter.views.celerytasks.eventtasks.executor import Executor
            et = Executor()
            name = 'test'
            alias = 'Event Task Test'
            k = et.apply_async((name, alias), queue='dispatcher')
        except Exception as e:
            log.error('Error running Dispatcher: %s'% e)
            log.error(traceback.format_exc())

