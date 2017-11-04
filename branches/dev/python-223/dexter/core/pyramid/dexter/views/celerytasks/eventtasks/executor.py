import logging
import traceback

from celery import task
#from time import sleep

from dexter.views.celerytasks.generictask import GenericTask

log = logging.getLogger(__name__)

@task(name="eventtasks.executor", base=GenericTask)
class Executor(GenericTask):
    def run(self, name, alias, **kwargs):
        GenericTask.run(self, **kwargs)
        try:
            name = name.encode('utf-8')
            self.name = name
            self.updateTask()
            log.info('Running EventTasks Executor. Name: %s, Alias: %s' %(name, alias))
            eventtasks = __import__('dexter.views.celerytasks.eventtasks', globals(), locals(), [name], -1)
            module_name = getattr(eventtasks, name)
            module_name.run()
        except Exception as e:
            log.error(traceback.format_exc(), exc_info=e)

