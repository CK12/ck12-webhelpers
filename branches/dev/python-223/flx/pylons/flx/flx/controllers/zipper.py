import logging
import traceback
import json

from pylons import config, request, tmpl_context as c

from flx.controllers import decorators as d
import flx.controllers.user as u
import flx.controllers.task as t
from flx.model import api
from flx.lib.base import BaseController
from flx.controllers.celerytasks import zipper
from flx.controllers.errorCodes import ErrorCodes

log = logging.getLogger(__name__)

class ZipperController(BaseController):

    defaultImageHost = config.get('default_image_host')
    mathSatelliteServer = config.get('math_satelite_server')
    downloadPrefix = config.get('zip_download_prefix')

    @d.jsonify()
    @d.checkAuth(request, False, False, ['id', 'revisionID', 'nocache'])
    @d.trace(log, ['id', 'revisionID', 'nocache'])
    def render(self, id, revisionID, nocache):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        user = u.getCurrentUser(request, anonymousOkay=False)
        log.info('No cache: %s' %(nocache))
        log.info('GET Parameters: %s' %(request.GET))
        skip_notify = False
        if request.GET.get('skip_notify') and request.GET.get('skip_notify').lower() == 'true':
            skip_notify = True
        log.info('skip_notify : %s' %(skip_notify))
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
                eventTypeForSuccess = api.getEventTypeByName(typeName='PRINT_GENERATION_SUCCESSFUL_ZIP')
                eventTypeForFailure = api.getEventTypeByName(typeName='PRINT_GENERATION_FAILED_ZIP')
                api.createNotification(eventTypeID=eventTypeForSuccess.id, subscriberID=user.id, objectID=artifactRevision.id, objectType='artifactRevision', type='email', frequency='once')
                api.createNotification(eventTypeID=eventTypeForFailure.id, subscriberID=user.id, objectID=artifactRevision.id, objectType='artifactRevision', type='email', frequency='once')
                log.info('Created notifications for PRINT_GENERATION_SUCCESSFUL_ZIP and PRINT_GENERATION_FAILED_ZIP for userID: %s' %(user.id))


            tc = t.TaskController()
            taskResult = tc.getUserTask(revisionID=artifactRevision.id, taskName='zip')
            taskResult = json.loads(taskResult)
            if taskResult['response'] and (taskResult['response']['status'] == 'PENDING' or taskResult['response']['status'] == 'IN PROGRESS'):
                log.error('A zip task is already in progress for the artifactRevision: %s' %(artifactRevision.id))
                log.error('Task Info: %s' %(taskResult))
                result['response']['task_id'] = taskResult['response']['taskID']
                return  result

            log.info('No zip task exists for the artifactRevision: %s' %(artifactRevision.id))
            artifactType = artifact.getArtifactType()
            supportedArtifactTypes = ['book', 'chapter', 'lesson', 'section',
                                      'concept', 'tebook', 'workbook', 'labkit']
            if artifactType not in supportedArtifactTypes:
                c.errorCode = ErrorCodes.FORMAT_NOT_SUPPORTED
                return ErrorCodes().asDict(c.errorCode)

            resourceRevision = artifact.getResourceRevision(artifactRevision,
                                                            'zip')
            if nocache == 'True' and resourceRevision:
                log.info('nocache option specified. Regenerating the zip')
                api.deleteArtifactHasResource(artifactRevisionID=artifactRevision.id,
                                            resourceRevisionID=resourceRevision.id)
                api.deleteResource(resource=resourceRevision.resource)
            if nocache == 'False' and resourceRevision:
                log.info('Resource for the given ArtifactRevision already exists. Returning the saved resource')
                downloadUri = resourceRevision.resource.getUri()
                result['response']['downloadUri'] = downloadUri
                return result

            createZip = zipper.zipper()
            task = createZip.delay(id, self.mathSatelliteServer, self.defaultImageHost,
                             revisionID = revisionID, nocache=nocache, user=user.id, skip_notify=skip_notify)
            taskId = task.task_id
            result['response']['task_id'] = taskId
            return result
        except Exception, e:
            log.error("zip render exception[%s]" % str(e))
            log.error(traceback.format_exc())
            c.errorCode = ErrorCodes.NO_SUCH_ARTIFACT
            return ErrorCodes().asDict(c.errorCode, str(e))
