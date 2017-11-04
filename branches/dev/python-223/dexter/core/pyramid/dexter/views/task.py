from pyramid.view import view_config
from dexter.models import task
from dexter.lib import helpers as h
from dexter.views.decorators import jsonify, paginate
from dexter.views.errorCodes import ErrorCodes
from dexter.views.common import AssessCommon as common
from dexter.views.base import BaseView
import logging

log = logging.getLogger(__name__)

class TaskView(BaseView):
    def __init__(self, context, request):
        BaseView.__init__(self, context, request)

    #@view_config(route_name='get_task_status')
    @jsonify
    @h.trace
    def get_task_status(self):
        try:
            request = self.request
            result = common.getResponseTemplate(ErrorCodes.OK, 0)
            taskID = request.matchdict['taskID']
            taskObj = task.Task(request.db).getTaskByTaskID(taskID=taskID)
            if not taskObj:
                raise Exception('No such Task idOrName:%s' % id)
            result['response']['task'] = taskObj
            return result
        except Exception,e:
            if not hasattr(self.c,'errorCode'):
                self.c.errorCode = ErrorCodes.NO_SUCH_TASK
            log.error('get_task_info: %s' % str(e))
            return ErrorCodes().asDict(self.c.errorCode, str(e))

    #@view_config(route_name='get_tasks_info')
    @jsonify
    @h.trace
    def get_tasks_info(self):
        try:
            request = self.request
            pageNum, pageSize = paginate(request)
            result = common.getResponseTemplate(ErrorCodes.OK, 0)
            tasks = task.Task(request.db).getAll()
            result['response']['tasks'] = [ p for p in tasks ]
            result['response']['total'] = tasks.getTotal()
            result['response']['limit'] = tasks.getResultCount()
            result['response']['offset'] = (pageNum-1)*pageSize
            return result
        except Exception,e:
            if not hasattr(self.c,'errorCode'):
                self.c.errorCode = ErrorCodes.NO_SUCH_TASK
            log.error('get_tasks_info: %s' % str(e))
            return ErrorCodes().asDict(self.c.errorCode, str(e))

