import re
import os
import json
import logging
import traceback

from celery.task import Task
from pylons.i18n.translation import _

from flx.controllers.celerytasks.generictask import GenericTask
from flx.controllers.celerytasks import epub
from flx.lib import helpers as h
from flx.lib.ck12_zip_lib.ck12_zip import CK12Zip
from flx.model import api
from flx.controllers.common import ArtifactCache

logger = logging.getLogger(__name__)

artifactTypeMapping = { 'book':'b', 'chapter':'ch', 'lesson':'l', 'concept':'c', 'section': 's', 'tebook': 'te', 'workbook': 'wb', 'labkit':'lk'}

def save_zip_resource(zipPath, artifactRevision, userID, nocache=False):
    from datetime import datetime
    resourceDict = {}
    resourceDict['resourceType'] = api.getResourceTypeByName(name="zip")
    #uniqueName = artifactRevision.artifact.type.name \
    #             + '_' + artifactRevision.artifact.getHandle() \
    #             + '_v' + artifactRevision.revision
    uniqueName = artifactRevision.artifact.getHandle()[0:100] \
                 + '_' + artifactTypeMapping.get(artifactRevision.artifact.type.name, '') \
                 + '_v' + artifactRevision.revision + '_%s' %(h.getRandomString(3))
    #timestamp = datetime.now().strftime("%Y%m%d%s%f")
    #uniqueName = uniqueName + timestamp
    resourceDict['name'] = uniqueName
    resourceDict['description'] = ''
    resourceDict['isExternal'] = False
    resourceDict['uriOnly'] = False
    newZipPath = os.path.dirname(zipPath) + '/' + uniqueName
    newZipPath = newZipPath.encode('utf-8') + '.zip'
    logger.info('New zipPath: %s' %(newZipPath))
    print 'New zipPath: %s' %(newZipPath)
    os.rename(zipPath, newZipPath)
    resourceDict['uri'] = open(newZipPath, 'rb')
    resourceDict['creationTime'] = datetime.now()
    resourceDict['ownerID'] = artifactRevision.artifact.creatorID
    resourceRevision = artifactRevision.artifact.getResourceRevision(artifactRevision, 'zip')
    if nocache and resourceRevision:
        logger.info('nocache option specified. Deleting the previous zip and creating a new one')
        api.deleteArtifactHasResource(artifactRevisionID=artifactRevision.id,
                                resourceRevisionID=resourceRevision.id)
        api.deleteResource(resource=resourceRevision.resource)

    resourceRevision = api.createResource(resourceDict=resourceDict, commit=True)
    downloadUri = resourceRevision.resource.getPermaUri(fullUrl=True, qualified=True)
    artifactRevisionHasResource = api.createArtifactHasResource(artifactRevisionID=artifactRevision.id,
                                    resourceRevisionID=resourceRevision.id)
    return downloadUri

class zipTask(GenericTask):

    def __init__(self, **kwargs):
        ## Initialize GenericTask
        GenericTask.__init__(self, **kwargs)
        self.routing_key = "print"


class zipper(zipTask):

    recordToDB = True

    def run(self, id, mathSatelliteServer, defaultImageHost, revisionID=None,
            nocache=False, skip_notify=False, **kwargs):

        zipTask.run(self, **kwargs)
        e = None
        try:
            if revisionID == None:
                artifact = api.getArtifactByID(id=id)
                artifactRevision = artifact.revisions[0]
            else:
                artifactRevision = api.getArtifactRevisionByID(id=revisionID)
                artifact = artifactRevision.artifact

            self.artifactKey = str(artifactRevision.id)
            self.updateTask()

            notificationFilter = [('subscriberID', kwargs['user']), ('objectType', 'artifactRevision'), ('objectID', artifactRevision.id)]
            resourceRevision = artifact.getResourceRevision(artifactRevision, 'zip')
            if nocache == 'True':
                nocache = True
            elif nocache == 'False' and resourceRevision:
                nocache = False
                logger.info('Resource for the given ArtifactRevision already exists. Returning the saved resource')
                downloadUri = resourceRevision.resource.getUri()
                self.userdata = json.dumps({'downloadUri' : downloadUri})
                return downloadUri

            createEpub = epub.epubk()
            logger.info('Triggering ePubk task')
            task = createEpub.apply(kwargs={'id':id, \
                                            'mathSatelliteServer':mathSatelliteServer, \
                                            'defaultImageHost':defaultImageHost,
                                            'revisionID':revisionID, \
                                            'nocache':'True', \
                                            'optimizeForKindle':'True',\
                                            'user':kwargs['user']})

            logger.info('ePub Task completed with taskID: %s' %(task.task_id))
            logger.info('Status of the ePub Task: %s' %(task.status))
            userdata = task.result
            logger.info('Task Result: %s' %(userdata))
            if task.status == 'SUCCESS' and userdata.has_key('downloadUri'):
                downloadUri = userdata['downloadUri']
                logger.info('downloadUri for the ePubk: %s' %(downloadUri))
                myZip = CK12Zip(downloadUri)
                zipLocation = myZip.render()
                logger.info('ZIP Location: %s' %(zipLocation))
            else:
                raise Exception((_(u'Unable to obtain the downloadUri for the zip.')).encode("utf-8"))

            if os.path.exists(zipLocation):
                logger.info('zip rendered successfully. Location: %s' %(zipLocation))
                downloadUri = save_zip_resource(zipLocation, artifactRevision,
                                          userID=kwargs['user'], nocache=nocache)
                self.userdata = json.dumps({'downloadUri' : downloadUri, 'title': artifact.getTitle().encode('utf-8'), 'printType':'Zip Book'})
                if not skip_notify:
                    e = api.createEventForType(typeName='PRINT_GENERATION_SUCCESSFUL_ZIP', objectID=artifactRevision.id, objectType='artifactRevision', eventData=json.dumps(self.userdata), ownerID=kwargs['user'], processInstant=False)
                eventForFailure = api.getEventTypeByName(typeName='PRINT_GENERATION_FAILED_ZIP')
                notificationFilter.append(('eventTypeID', eventForFailure.id))
                api.invalidateArtifact(cache=ArtifactCache(), artifact=artifact, recursive=False)
                return 'zip successfully generated for artifactID: %s, artifactRevisionID %s, by user with userID: %s' %(artifact.id, artifactRevision.id, kwargs['user'])
            else:
                raise Exception((_(u'Error in rendering zip.')).encode("utf-8"))
        except Exception as exceptObj:
            self.userdata = json.dumps({'title': artifact.getTitle().encode('utf-8'), 'printType':'Zip Book'})
            if not skip_notify:
                e = api.createEventForType(typeName='PRINT_GENERATION_FAILED_ZIP', objectID=artifactRevision.id, objectType='artifactRevision', eventData=json.dumps(self.userdata), ownerID=kwargs['user'], processInstant=False)

            eventForSuccess = api.getEventTypeByName(typeName='PRINT_GENERATION_SUCCESSFUL_ZIP')
            notificationFilter.append(('eventTypeID', eventForSuccess.id))
            logger.error(exceptObj.__str__())
            logger.error(traceback.format_exc())
            raise Exception((_(u"Error in generating zip for artifactID: %(artifact.id)s, artifactRevisionID %(artifactRevision.id)s, by user with userID: %(kwargs['user'])s, with message %(traceback.format_exc())s") % {"artifact.id":artifact.id,"artifactRevision.id": artifactRevision.id,"kwargs['user']": kwargs['user'],"traceback.format_exc()": traceback.format_exc()}).encode("utf-8"))
        finally:
            logger.info('NotificationFilter: %s' %(notificationFilter))
            if len(notificationFilter) >= 4:
                n = api.getNotificationsByFilter(filters=notificationFilter, sort='created,asc', pageNum=1, pageSize=10)
                if n.getTotal() > 0:
                    api.deleteNotification(id=n[0].id)

            if not e:
                logger.error('Unable to send the notification as Event object is not defined or skip_notify is set to True')
            else:
                emailNotifications = api.getNotificationsForEvent(event=e, notificationTypes=['email'], frequencies=['once'], notSentSinceUpdate=True, onlyRecent=True)
                h.processInstantNotifications([e.id], notificationIDs=[n.id for n in emailNotifications], user=kwargs['user'], noWait=False)
