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
from flx.lib.ck12_mobi_lib.ck12_mobi import CK12Mobi
from flx.model import api
from flx.controllers.common import ArtifactCache

logger = logging.getLogger(__name__)

artifactTypeMapping = { 'book':'b', 'chapter':'ch', 'lesson':'l', 'concept':'c', 'section': 's', 'tebook': 'te', 'workbook': 'wb', 'labkit':'lk', 'quizbook': 'qb'}

def save_mobi_resource(mobiPath, artifactRevision, userID, nocache=False):
    from datetime import datetime
    resourceDict = {}
    resourceDict['resourceType'] = api.getResourceTypeByName(name="mobi")
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
    newMobiPath = os.path.dirname(mobiPath) + '/' + uniqueName
    newMobiPath = newMobiPath.encode('utf-8') + '.mobi'
    logger.info('New mobiPath: %s' %(newMobiPath))
    print 'New mobiPath: %s' %(newMobiPath)
    os.rename(mobiPath, newMobiPath)
    resourceDict['uri'] = open(newMobiPath, 'rb')
    resourceDict['creationTime'] = datetime.now()
    resourceDict['ownerID'] = artifactRevision.artifact.creatorID
    resourceRevision = artifactRevision.artifact.getResourceRevision(artifactRevision, 'mobi')
    if nocache and resourceRevision:
        logger.info('nocache option specified. Deleting the previous mobi and creating a new one')
        api.deleteArtifactHasResource(artifactRevisionID=artifactRevision.id,
                                resourceRevisionID=resourceRevision.id)
        api.deleteResource(resource=resourceRevision.resource)

    resourceRevision = api.createResource(resourceDict=resourceDict, commit=True)
    downloadUri = resourceRevision.resource.getPermaUri(fullUrl=True, qualified=True)
    artifactRevisionHasResource = api.createArtifactHasResource(artifactRevisionID=artifactRevision.id,
                                    resourceRevisionID=resourceRevision.id)
    return downloadUri

class mobiTask(GenericTask):

    def __init__(self, **kwargs):
        ## Initialize GenericTask
        GenericTask.__init__(self, **kwargs)
        self.routing_key = "print"


class mobi(mobiTask):

    recordToDB = True

    def run(self, id, mathSatelliteServer, defaultImageHost, revisionID=None,
            nocache=False, skip_notify=False, **kwargs):

	artifact_url = kwargs.get('artifact_url', '')
        mobiTask.run(self, **kwargs)
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
            resourceRevision = artifact.getResourceRevision(artifactRevision, 'mobi')
            if nocache == 'True':
                nocache = True
            elif nocache == 'False' and resourceRevision:
                nocache = False
                logger.info('Resource for the given ArtifactRevision already exists. Returning the saved resource')
                downloadUri = resourceRevision.resource.getUri()
                self.userdata = json.dumps({'downloadUri' : downloadUri, 'artifactUrl':artifact_url})
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
                myMobi = CK12Mobi(downloadUri)
                mobiLocation = myMobi.render()
                logger.info('Mobi Location: %s' %(mobiLocation))
            else:
                raise Exception((_(u'Unable to obtain the downloadUri for the ePub.')).encode("utf-8"))

            if os.path.exists(mobiLocation):
                logger.info('mobi rendered successfully. Location: %s' %(mobiLocation))
                downloadUri = save_mobi_resource(mobiLocation, artifactRevision,
                                          userID=kwargs['user'], nocache=nocache)
                cover_image = artifact.getCoverImageUri()
                if cover_image and not cover_image.startswith("http"):
                    cover_image = defaultImageHost + cover_image
                elif not cover_image:
                    cover_image = artifactRevision.getCoverImageSatelliteUri()

                self.userdata = json.dumps({'downloadUri' : downloadUri, \
                                            'artifactUrl':artifact_url, 'title': artifact.getTitle().encode('utf-8'), \
                                            'printType':'Kindle Book', 'coverimage': cover_image if cover_image else '', 'artifactType': artifact.getArtifactType()})
                if not skip_notify:
                    e = api.createEventForType(typeName='PRINT_GENERATION_SUCCESSFUL_MOBI', objectID=artifactRevision.id, objectType='artifactRevision', eventData=json.dumps(self.userdata), ownerID=kwargs['user'], processInstant=False)
                    webEventTypeName = 'PRINT_GENERATION_SUCCESSFUL_WEB'
                eventForFailure = api.getEventTypeByName(typeName='PRINT_GENERATION_FAILED_MOBI')
                notificationFilter.append(('eventTypeID', eventForFailure.id))
                api.invalidateArtifact(cache=ArtifactCache(), artifact=artifact, recursive=False)
                return 'mobi successfully generated for artifactID: %s, artifactRevisionID %s, by user with userID: %s' %(artifact.id, artifactRevision.id, kwargs['user'])
            else:
                raise Exception((_(u'Error in rendering mobi via kindlegen')).encode("utf-8"))
        except Exception as exceptObj:
            self.userdata = json.dumps({'title': artifact.getTitle().encode('utf-8'), 'printType':'Kindle Book', 'artifactUrl':artifact_url, 'coverimage': defaultImageHost + artifact.getCoverImageUri() if artifact.getCoverImageUri() else ''})
            if not skip_notify:
                e = api.createEventForType(typeName='PRINT_GENERATION_FAILED_MOBI', objectID=artifactRevision.id, objectType='artifactRevision', eventData=json.dumps(self.userdata), ownerID=kwargs['user'], processInstant=False)
                webEventTypeName = 'PRINT_GENERATION_FAILED_WEB'

            eventForSuccess = api.getEventTypeByName(typeName='PRINT_GENERATION_SUCCESSFUL_MOBI')
            notificationFilter.append(('eventTypeID', eventForSuccess.id))
            logger.error(exceptObj.__str__())
            logger.error(traceback.format_exc())
            raise Exception((_(u"Error in generating mobi for artifactID: %(artifact.id)s, artifactRevisionID %(artifactRevision.id)s, by user with userID: %(kwargs['user'])s, with message %(traceback.format_exc())s") % {"artifact.id":artifact.id,"artifactRevision.id": artifactRevision.id,"kwargs['user']": kwargs['user'],"traceback.format_exc()": traceback.format_exc()}).encode("utf-8"))
        finally:
            logger.info('NotificationFilter: %s' %(notificationFilter))
            if len(notificationFilter) >= 4:
                n = api.getNotificationsByFilter(filters=notificationFilter, sort='created,asc', pageNum=1, pageSize=10)
                if n.getTotal() > 0:
                    api.deleteNotification(id=n[0].id)
            try:
                if not skip_notify:
                    logger.info("Creating MOBI web notification of type=[%s], objectID=[%s], user=[%s]" % (webEventTypeName, artifactRevision.id, kwargs['user']))
                    web_e = api.createEventForType(typeName=webEventTypeName, objectID=artifactRevision.id, objectType='artifactRevision', eventData=json.dumps(self.userdata), ownerID=kwargs['user'], subscriberID=kwargs['user'], processInstant=False)
                    logger.info("Created MOBI web notification: [%s]" % web_e.id)
                    webEvent = api.getEventTypeByName(typeName=webEventTypeName)
                    api.createNotification(eventTypeID=webEvent.id, objectID=artifactRevision.id, objectType='artifactRevision', address=None, subscriberID=kwargs['user'], type='web', frequency='ondemand')
            except Exception as ex:
                logger.error("Error creating MOBI web notification")
                logger.error(ex.__str__())
                logger.error(traceback.format_exc())

            if not e:
                logger.error('Unable to send the notification as Event object is not defined or skip_notify is set to True')
            else:
                emailNotifications = api.getNotificationsForEvent(event=e, notificationTypes=['email'], frequencies=['once'], notSentSinceUpdate=True, onlyRecent=True)
                h.processInstantNotifications([e.id], notificationIDs=[n.id for n in emailNotifications], user=kwargs['user'], noWait=False)
