import logging

from pylons import request, tmpl_context as c
from pylons.i18n.translation import _ 

from flx.controllers import decorators as d
from flx.model import api
from flx.lib.base import BaseController
import flx.controllers.user as u
from flx.controllers.errorCodes import ErrorCodes


log = logging.getLogger(__name__)


def getTaskInfo(task):
    taskInfo = {}
    taskInfo['id'] = task.id
    taskInfo['taskID'] = task.taskID
    taskInfo['name'] = task.name
    taskInfo['status']  = task.status
    taskInfo['hostname'] = task.hostname
    if task.owner:
        taskInfo['owner'], task.owner = u.getUserInfo(task.owner)
    taskInfo['result'] = task.message
    taskInfo['started'] = str(task.started)
    taskInfo['updated'] = str(task.updated)
    taskInfo['userdata'] = task.userdata
    return taskInfo

class TaskController(BaseController):

    @d.jsonify()
    @d.checkAuth(request, False, False, ['taskID'])
    @d.trace(log, ['taskID'])
    def getStatus(self, taskID):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            id = None
            try:
                id = int(taskID)
            except Exception, e:
                pass

            task = None
            if id:
                task = api.getTaskByID(id=id)
            if not task:
                task = api.getTaskByTaskID(taskID=taskID)
            if task:
                result['response'] = getTaskInfo(task)
            else:
                raise Exception((_(u'Could not find task by id: %(taskID)s')  % {"taskID":taskID}).encode("utf-8"))
            return result
        except Exception, e:
            log.error("No such task_id: %s" % taskID)
            c.errorCode = ErrorCodes.NO_SUCH_TASK
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, False, ['revisionID', 'taskName'])
    @d.trace(log, ['revisionID', 'taskName'])
    def getUserTask(self, revisionID, taskName):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        user = u.getCurrentUser(request, anonymousOkay=False)
        try:
            task = api.getTaskByArtifactRevisionID(ownerID=None,
                                        artifactRevisionID=revisionID,taskName=taskName)
            result['response'] = None
            if task:
                artifactRevision = api.getArtifactRevisionByID(id=revisionID)
                if artifactRevision.artifact.updateTime < task.updated:
                    log.info('artifactRevisionID: %s has not changed since the last task of type: %s' %(revisionID, taskName))
                    result['response'] = getTaskInfo(task)
            else:
                log.info('Could not find task by ownerID: %s artifactRevisionID: %s taskName: %s' \
                                %(user.id, revisionID, taskName))
            log.info('In getUserTask: %s' %(result))
            return result
        except Exception, e:
            log.error("No such task exists")
            log.error("Exception: %s" %e.__str__())
            c.errorCode = ErrorCodes.NO_SUCH_TASK
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.sortable(request)
    @d.filterable(request, ['sort'], noformat=True)
    @d.setPage(request, ['sort', 'fq'])
    @d.trace(log, ['sort', 'fq', 'pageNum', 'pageSize'])
    def getTasksInfo(self, fq, pageNum, pageSize, sort=None):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            search = request.params.get('search')
            searchFld = None
            searchTerm = None
            if search:
                searchFld, searchTerm = search.split(',', 1)
            else:
                searchTerm = request.params.get('searchAll')
                if searchTerm:
                    searchFld = 'searchAll'

            tasks = api.getTasks(filters=fq, 
                    searchFld=searchFld, term=searchTerm, 
                    sort=sort, 
                    pageNum=pageNum, pageSize=pageSize)

            result['response']['total'] = tasks.getTotal()
            result['response']['limit'] = len(tasks)
            result['response']['offset'] = (pageNum - 1)*pageSize
            result['response']['tasks'] = []
            for task in tasks:
                result['response']['tasks'].append(getTaskInfo(task))
            return result
        except Exception, e:
            log.error("No such task exists: [%s]" % str(e), exc_info=e)
            c.errorCode = ErrorCodes.NO_SUCH_TASK
            return ErrorCodes().asDict(c.errorCode, str(e))

