from beaker.cache import cache_region
import logging

from bson.objectid import ObjectId
from dexter.lib import helpers as h
from dexter.models.validationwrapper import ValidationWrapper
from dexter.models import page as p

log = logging.getLogger(__name__)

TASK_STATUS_IN_PROGRESS = 'IN PROGRESS'
TASK_STATUS_PENDING = 'PENDING'
TASK_STATUS_SUCCESS = 'SUCCESS'
TASK_STATUS_FAILURE = 'FAILURE'
TASK_STATUSES = [TASK_STATUS_IN_PROGRESS, TASK_STATUS_PENDING, TASK_STATUS_SUCCESS, TASK_STATUS_FAILURE]


class Task(ValidationWrapper):

    def __init__(self, db, dc=False):
        self.db = db
        # Dependency check flag
        self.dc = dc

        self.required_fields = ['name','status', 'started', 'updated']

    """
        Create a Task
    """
    @h.trace
    def create(self, **kwargs):
        self.before_insert(**kwargs)
        id = self.db.Tasks.insert(kwargs)
        return self.db.Tasks.find_one(id)

    """
        Update a Task
    """
    @h.trace
    def update(self, id, **kwargs):
        self.before_update(**kwargs)
        id = ObjectId(str(id))
        self.db.Tasks.update(
                            { '_id': id },
                            { '$set': kwargs },
                            )
        return self.db.Tasks.find_one(id)

    """
        Get Task
    """
    @h.trace
    def get(self, id=None, name=None, idOrName=None):
        if idOrName:
            if h.isValidObjectId(idOrName):
               id = idOrName
            else:
               name = idOrName
        if id:
            return self.db.Tasks.find_one(ObjectId(str(id)))
        elif name:
            return self.db.Tasks.find_one({'name':name})

    @h.trace
    def getTaskByTaskID(self,taskID):
        return self.db.Tasks.find_one({'taskID':taskID})

    @h.trace
    def getLastTaskByName(self, name, statusList=None, excludeIDs=[]):
        log.info("Getting task by name: %s" % name)
        query = {'name':name}
        if statusList:
           query['status'] = { "$in" : statusList }
        if excludeIDs:
           query['status'] = { "$nin" : statusList }
        result = list(self.db.Tasks.find(query).sort('started',-1).limit(1))
        if result:
            return result[0]

    """
        Get all Tasks
    """
    @h.trace
    def getAll(self, pageNum=0, pageSize=0):
        tasks = p.Page(self.db.Tasks, None, pageNum, pageSize)
        return tasks
