from bson.objectid import ObjectId
import logging
from datetime import datetime
import re

from dexter.models.validationwrapper import ValidationWrapper
from dexter.models import page as p
from dexter.lib import helpers as h

log = logging.getLogger(__name__)

class EventTask(ValidationWrapper):

    def __init__(self, db, dc=False):
        self.db = db
        # Dependency check flag
        self.dc = dc

        self.required_fields = ['name','eventtype','frequency']
        self.required_fields_structure = {'name':'str or unicode', 'eventtype':'str or unicode', 'frequency':'int'}

    """
        Register an event task
    """
    @h.trace
    def register(self, **kwargs):
        self.before_insert(**kwargs)

        existing = self.getEventTask(name = kwargs['name'])
        if existing:
            raise Exception('Event task(%s) already exists' % (kwargs['name']))
        event_type = self.db.EventTypes.find({'eventType':kwargs['eventtype']}) 
        if event_type.count() == 0:
            raise Exception('Invalid eventtype (%s)'% kwargs['eventtype'])
        kwargs['created'] = datetime.now()
        kwargs['updated'] = datetime.now()
        id = self.db.EventTasks.insert(kwargs)
        return self.db.EventTasks.find_one(id)

    """
        Update an event task
    """
    @h.trace
    def update(self, **kwargs):
        self.required_fields = ['name']
        self.required_fields_structure = {'name':'str or unicode'}
        self.before_update(**kwargs)
        kwargs['updated'] = datetime.now()
        existing = self.getEventTask(name = kwargs['name'])
        if not existing:
            raise Exception('Event task (%s) doesn\'t exist' % (kwargs['name']))
        result = self.db.EventTasks.update(
            { 'name': kwargs['name']},
                            { '$set': kwargs },
                            )
        return result

    """
        Unregister event task
    """
    @h.trace
    def unregister(self, **kwargs):
        self.required_fields = ['name']
        self.required_fields_structure = {'name':'str or unicode'}
        self.before_delete(**kwargs)
        result = self.db.EventTasks.remove({'name': re.compile(kwargs['name'], re.IGNORECASE)}, safe=True)
        return result

    """
        Get event_task
    """
    @h.trace
    def getByID(self, id):
        log.info("Getting event task for id: %s" % id)
        event_task = self.db.EventTasks.find_one(ObjectId(str(id)))
        self.asDict(event_task)
        log.info("Event Task: %s" % event_task)
        return event_task

    def getEventTask(self, name):
        event_task = self.db.EventTasks.find_one({'name': re.compile(name, re.IGNORECASE)})
        return event_task

    def asDict(self, event_task):
        if event_task:
            return event_task

    """
        Get all event_tasks
    """
    @h.trace
    def getAll(self, pageNum=0, pageSize=0):
        event_tasks = p.Page(self.db.EventTasks, None, pageNum, pageSize)
        return event_tasks
