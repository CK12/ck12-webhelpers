import logging
import json

from pylons import config, request, tmpl_context as c

from flx.controllers import decorators as d
from flx.model import api
from flx.lib.base import BaseController
import flx.controllers.user as u

from flx.controllers.celerytasks import pdf
from flx.controllers.celerytasks import worksheet
import flx.controllers.task as t

from flx.controllers.errorCodes import ErrorCodes

log = logging.getLogger(__name__)

class PdfController(BaseController):

    defaultImageHost = config.get('default_image_host')
    downloadPrefix = config.get('pdf_download_prefix')

    @d.jsonify()
    @d.checkAuth(request, False, False, ['id', 'revisionID', 'nocache', 'template'])
    @d.trace(log, ['id', 'revisionID', 'nocache', 'template'])
    def render(self, id, revisionID, nocache, template):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        user = u.getCurrentUser(request, anonymousOkay=False)
        log.info('No cache: %s' %(nocache))
        log.info('GET Parameters: %s' %(request.GET))
        skip_notify = False
        if request.GET.get('skip_notify') and request.GET.get('skip_notify').lower() == 'true':
            skip_notify = True
        log.info('skip_notify : %s' %(skip_notify))
    	artifact_url = ''
        if request.params.get('artifacturl'):
            artifact_url = request.GET.get('artifacturl')
        log.info('artifact_url : %s' %(artifact_url))
        try:
            if revisionID == None:
                artifact = api.getArtifactByID(id=id)
                artifactRevision = artifact.revisions[0]
                revisionID = artifactRevision.id
            else:
                artifactRevision = api.getArtifactRevisionByID(id=revisionID)
                artifact = artifactRevision.artifact

            #if not (artifactRevision.publishTime or \
            #   u.isMemberAdmin(user) or \
            #   artifact.creatorID == user.id):
            #    log.info('User with id: %s does not have permissions to print artifact with id: %s' %(user.id, artifact.id))
            #    c.errorCode = ErrorCodes.NOT_AUTHORIZED_TO_PRINT
            #    return ErrorCodes().asDict(c.errorCode)

            if nocache == 'False':
                eventTypeForSuccess = api.getEventTypeByName(typeName='PRINT_GENERATION_SUCCESSFUL_PDF')
                eventTypeForFailure = api.getEventTypeByName(typeName='PRINT_GENERATION_FAILED_PDF')
                api.createNotification(eventTypeID=eventTypeForSuccess.id, subscriberID=user.id, objectID=artifactRevision.id, objectType='artifactRevision', type='email', frequency='once')
                api.createNotification(eventTypeID=eventTypeForFailure.id, subscriberID=user.id, objectID=artifactRevision.id, objectType='artifactRevision', type='email', frequency='once')
                log.info('Created notifications for PRINT_GENERATION_SUCCESSFUL_PDF and PRINT_GENERATION_FAILED_PDF for userID: %s' %(user.id))

            tc = t.TaskController()
            taskResult = tc.getUserTask(revisionID=artifactRevision.id, taskName='pdf')
            taskResult = json.loads(taskResult)
            if taskResult['response'] and (taskResult['response']['status'] == 'PENDING' or taskResult['response']['status'] == 'IN PROGRESS'):
                log.error('A PDF task is already in progress for the artifactRevision: %s' %(artifactRevision.id))
                log.error('Task Info: %s' %(taskResult))
                result['response']['task_id'] = taskResult['response']['taskID']
                return  result

            #artifact = api.getArtifactByID(id=id)
            artifactType = artifact.getArtifactType()
            supportedArtifactTypes = ['book', 'chapter', 'lesson', 'section',
                                      'concept', 'tebook', 'workbook', 'labkit',
                                      'quizbook']
            if artifactType not in supportedArtifactTypes:
                log.info("Artifact type is not supported. Exiting...")
                c.errorCode = ErrorCodes.FORMAT_NOT_SUPPORTED
                return ErrorCodes().asDict(c.errorCode)
            else :
                createPdf = pdf.pdf()
                if template:
                    template = template.strip().strip('/')
                    if len(template) <= 0:
                        template = None

                #template = None if len(template) < 0 else template.strip().strip('/')
                task = createPdf.delay(id,self.downloadPrefix,
                                       self.defaultImageHost,
                                       revisionID=revisionID, nocache=nocache,
                                       user=user.id, template=template, skip_notify=skip_notify,artifact_url=artifact_url)
                taskId = task.task_id
                result['response']['task_id'] = taskId
                return result
        except Exception, e:
            log.info('Exception :- '+str(e))
            c.errorCode = ErrorCodes.NO_SUCH_ARTIFACT
            return ErrorCodes().asDict(c.errorCode, str(e))


    @d.jsonify()
    #@d.checkAuth(request, False, False, ['id'])
    @d.trace(log, ['id'])
    def renderWorksheet(self):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        user = u.getCurrentUser(request, anonymousOkay=False)
        doPDF = int(request.params['do_pdf'])
        doHTML = int(request.params['do_html'])
        answerKey = request.params['answer_key']
        title = request.params['title']
        worksheetHTML = request.params['worksheet_html']

        ## Async Celery Task 
        try:
            createWorksheet = worksheet.worksheet()
            task = createWorksheet.delay(worksheetHTML, answerKey, title, doHTML, doPDF, user=user.id)
            taskId = task.task_id
            result['response']['taskId'] = taskId

            return result
        except Exception, e:
            log.error('createWorksheet: %s' % str(e))
            c.errorCode = ErrorCodes.CANNOT_CREATE_WORKSHEET
            c.errorDesc = ErrorCodes().getName(c.errorCode)
            return ErrorCodes().asDict(c.errorCode, str(e))
