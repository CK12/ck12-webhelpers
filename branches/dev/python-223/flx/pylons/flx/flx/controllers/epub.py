import logging
import traceback
import json

from pylons import config, request, tmpl_context as c

from flx.controllers import decorators as d
import flx.controllers.user as u
import flx.controllers.task as t
from flx.lib import helpers as h
from flx.model import api
from flx.lib.base import BaseController
from flx.controllers.celerytasks import epub
from flx.controllers.errorCodes import ErrorCodes

log = logging.getLogger(__name__)

class EpubController(BaseController):

    defaultImageHost = config.get('default_image_host')
    mathSatelliteServer = config.get('math_satelite_server')
    webPrefixUrl = config.get('web_prefix_url')

    @d.jsonify()
    @d.checkAuth(request, False, False, ['id', 'revisionID', 'nocache', 'optimizeForKindle'])
    @d.trace(log, ['id', 'revisionID', 'nocache', 'optimizeForKindle'])
    def render(self, id, revisionID, nocache, optimizeForKindle):
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
            artifact_url = request.params.get('artifacturl')
        log.info("artifacturl : %s" % artifact_url)

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
                eventTypeForSuccess = api.getEventTypeByName(typeName='PRINT_GENERATION_SUCCESSFUL_EPUB')
                eventTypeForFailure = api.getEventTypeByName(typeName='PRINT_GENERATION_FAILED_EPUB')
                api.createNotification(eventTypeID=eventTypeForSuccess.id, subscriberID=user.id, objectID=artifactRevision.id, objectType='artifactRevision', type='email', frequency='once')
                api.createNotification(eventTypeID=eventTypeForFailure.id, subscriberID=user.id, objectID=artifactRevision.id, objectType='artifactRevision', type='email', frequency='once')
                log.info('Created notifications for PRINT_GENERATION_SUCCESSFUL_EPUB and PRINT_GENERATION_FAILED_EPUB for userID: %s' %(user.id))


            tc = t.TaskController()
            taskResult = tc.getUserTask(revisionID=artifactRevision.id, taskName='epub')
            taskResult = json.loads(taskResult)
            if taskResult['response'] and (taskResult['response']['status'] == 'PENDING' or taskResult['response']['status'] == 'IN PROGRESS'):
                log.error('An ePub task is already in progress for the artifactRevision: %s' %(artifactRevision.id))
                log.error('Task Info: %s' %(taskResult))
                result['response']['task_id'] = taskResult['response']['taskID']
                return  result

            artifactType = artifact.getArtifactType()
            supportedArtifactTypes = ['book', 'chapter', 'lesson', 'section',
                                      'concept', 'tebook', 'workbook', 'labkit',
                                      'quizbook']
            if artifactType not in supportedArtifactTypes:
                c.errorCode = ErrorCodes.FORMAT_NOT_SUPPORTED
                return ErrorCodes().asDict(c.errorCode)
            else :
                createEpub = epub.epub()
                task = createEpub.delay(id, self.mathSatelliteServer, self.defaultImageHost, revisionID = revisionID, nocache=nocache, optimizeForKindle=optimizeForKindle, user=user.id, skip_notify=skip_notify, artifact_url=artifact_url)
                taskId = task.task_id
                result['response']['task_id'] = taskId
                return result
        except Exception, e:
            log.error("EPUB render exception[%s]" % str(e))
            log.error(traceback.format_exc())
            c.errorCode = ErrorCodes.NO_SUCH_ARTIFACT
            return ErrorCodes().asDict(c.errorCode, str(e))

    #Creates an epub from multiple web resources
    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log)
    def stitch(self):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        user = u.getCurrentUser(request, anonymousOkay=False)
        book_title = request.POST['book_title']
        chapter_urls = request.POST.getall('chapter_url')
        try:
            stitchEpub = epub.stitch()
            task = stitchEpub.delay(book_title,chapter_urls,self.downloadPrefix, user=user.id)
            taskId = task.task_id
            result['response']['task_id'] = taskId
            return result
        except Exception, e:
            log.error('epub exception[%s]' % str(e))
            log.error(traceback.format_exc())
            c.errorCodes = ErrorCodes.NO_SUCH_ARTIFACT
            return ErrorCodes().asDict(c.errorCodes, str(e))

