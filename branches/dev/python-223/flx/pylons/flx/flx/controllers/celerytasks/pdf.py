import os
import json
import logging
import traceback
import re
import shutil

from pylons import config
from pylons.i18n.translation import _
from flx.lib.ck12_pdf_lib.ck12pdf import CK12Pdf
from flx.model import api
from flx.controllers.celerytasks.generictask import GenericTask
from flx.lib import helpers as h
from flx.controllers.common import ArtifactCache

logger = logging.getLogger(__name__)

templateStyleMapping = { 'onecolumn':'s1', 'twocolumn':'s2'}
artifactTypeMapping = { 'book':'b', 'chapter':'ch', 'lesson':'l', 'concept':'c', 'section': 's', 'tebook': 'te', 'workbook': 'wb', 'labkit':'lk', 'worksheet': 'wb', 'quizbook':'qb'}

def save_pdf_resource(pdfpath, artifactRevision, template, userID, nocache=False):
    from datetime import datetime

    resourceDict = {}
    resourceDict['resourceType'] = api.getResourceTypeByName(name="pdf")
    #uniqueName = artifactRevision.artifact.type.name \
    #             + '_' + artifactRevision.artifact.getHandle() \
    #             + '_v' + artifactRevision.revision
    uniqueName = artifactRevision.artifact.getHandle()[0:100] \
                 + '_' + artifactTypeMapping.get(artifactRevision.artifact.type.name, '') \
                 + '_v' + artifactRevision.revision + '_%s' %(h.getRandomString(3))
    resourceDict['name'] = uniqueName
    resourceDict['description'] = ''
    resourceDict['isExternal'] = False
    resourceDict['uriOnly'] = False
    newPDFPath = os.path.dirname(pdfpath) + '/' + uniqueName + '_%s' %(templateStyleMapping.get(template, 's1'))
    newPDFPath = newPDFPath.encode('utf-8') + '.pdf'
    logger.info('New PDFPath: %s' %(newPDFPath))
    os.rename(pdfpath, newPDFPath)
    resourceDict['uri'] = open(newPDFPath, 'rb')
    resourceDict['creationTime'] = datetime.now()
    resourceDict['ownerID'] = artifactRevision.artifact.creatorID

    logger.info('No cache: %s' %(nocache))
    if nocache:
        resourcesRevision = artifactRevision.getResourcesRevision('pdf')
        logger.info('resourcesRevision: %s' %(resourcesRevision))
        for eachResourceRevision in resourcesRevision:
            downloadUri = eachResourceRevision.resource.getPermaUri(fullUrl=True, qualified=True)
            if _getTemplateByUri(downloadUri) == templateStyleMapping[template]:
                logger.info('nocache option specified. Deleting the previous PDF and creating a new one')
                api.deleteArtifactHasResource(artifactRevisionID=artifactRevision.id,
                                            resourceRevisionID=eachResourceRevision.id)
                api.deleteResource(resource=eachResourceRevision.resource)

    resourceRevision = api.createResource(resourceDict=resourceDict, commit=True)
    downloadUri = resourceRevision.resource.getPermaUri(fullUrl=True, qualified=True)
    artifactRevisionHasResource = api.createArtifactHasResource(artifactRevisionID=artifactRevision.id,
                                    resourceRevisionID=resourceRevision.id)
    return downloadUri

def _getTemplateByEncodedID(encodedID):
    if not encodedID:
        template = 'onecolumn'
    else:
        if encodedID.split('.')[1] == 'MAT':
            template = 'onecolumn'
        else:
            template = 'twocolumn'
    return template

def _getTemplateByUri(uri):
    return uri.split('_')[-1].split('.')[0]

class pdf(GenericTask):

    recordToDB = True

    def run(self,id,downloadPrefix,defaultImageHost,revisionID=None,
            nocache=False, template=None, skip_notify=False, **kwargs):

        GenericTask.run(self, **kwargs)
        logger.info('%s %s %s %s' %(id, downloadPrefix, defaultImageHost, kwargs))
        artifact_url = kwargs.get('artifact_url', '')
        if revisionID == None:
            artifact = api.getArtifactByID(id=id)
            artifactRevision = artifact.revisions[0]
        else:
            artifactRevision = api.getArtifactRevisionByID(id=revisionID)
            artifact = artifactRevision.artifact

        artifactID = id
        self.artifactKey = str(artifactRevision.id)
        artifactType = artifact.type.name
        if artifactType == 'workbook':
            artifactType = 'worksheet'
        self.updateTask()

        bookLevelArtifactTypes = ['book', 'tebook', 'studyguide', 'workbook', 'labkit', 'worksheet', 'quizbook']
        if not template:
            if artifactType in ['studyguide', 'workbook', 'labkit']:
                template = 'onecolumn'
            elif artifactType in ['book', 'tebook', 'concept']:
                encodedID = artifact.getEncodedId()
                logger.info('encodedID: %s' %(encodedID))
                template = _getTemplateByEncodedID(encodedID)
            elif artifactType in ['section', 'chapter', 'lesson']:
                allAncestors = api.getArtifactAncestors(artifactID=artifact.id)
                bookArtifactID = None
                if allAncestors:
                    for eachAncestor in allAncestors:
                        if api.getArtifactTypeByID(id=eachAncestor['parentTypeID']) in bookLevelArtifactTypes:
                            bookArtifactID = eachAncestor['parentID']
                            break
                if bookArtifactID:
                    logger.info('Parent artifactID: %s' %(bookArtifactID))
                    parentArtifact = api.getArtifactByID(id=bookArtifactID)
                    parentEncodedID = parentArtifact.getEncodedId()
                    template = _getTemplateByEncodedID(parentEncodedID)
                else:
                    template = 'onecolumn'

        resourcesRevision = artifact.getResourcesRevision(artifactRevision, 'pdf')
        notificationFilter = [('subscriberID', kwargs['user']), ('objectType', 'artifactRevision'), ('objectID', artifactRevision.id)]
        logger.info('Resources Revision: %s' %(resourcesRevision))
        if nocache == 'True':
            nocache=True
        elif nocache == 'False' and resourcesRevision:
            nocache = False
            for eachResourceRevision in resourcesRevision:
                downloadUri = eachResourceRevision.resource.getPermaUri(fullUrl=True, qualified=True)
                if _getTemplateByUri(downloadUri) == templateStyleMapping[template]:
                    logger.info('Resource for the given ArtifactRevision already exists. Returning the saved resource')
                    logger.info('Download Uri: %s' %(downloadUri))
                    self.userdata = json.dumps({'downloadUri': downloadUri,
                                                'template': template,'artifactUrl':artifact_url})
                    n = api.getNotificationsByFilter(filters=notificationFilter, sort='created,asc', pageNum=1, pageSize=10)
                    for eachNotification in n:
                        logger.info('Deleting notification with id: [%s]' %(eachNotification.id))
                        api.deleteNotification(id=eachNotification.id)
                    return downloadUri

        metadata = {}
        chap ={}
        myPDF = CK12Pdf()
        logger.info('Creating async pdf task...')
        myPDF.setLogger(logger)
        myPDF.template = template if template else 'onecolumn'

        logger.info('Setting the template: %s' %(template))
        myPDF.default_image_host=defaultImageHost
        metadata['revisionID'] = artifactRevision.id
        allAuthors = []
        allAuthors.extend(artifact.getAuthors())
        #Extract and save front and back matter xhtml
        front_matter, back_matter = myPDF.extract_pdf_front_and_back_matter(artifactRevision.getXhtml(includeChildContent=True, includeChildHeaders=True, replaceMathJax=True))
        if front_matter:
            myPDF.save_front_matter(front_matter)
        if back_matter :
            myPDF.save_back_matter(back_matter)
        chapters = artifactRevision.children
        for eachChapter in chapters:
            allAuthors.extend(eachChapter.child.artifact.getAuthors())
        authors = []
        contributors = []
        editors = []
        sources = []
        translators = []
        reviewers = []
        technicalreviewers = []
        for eachAuthor in allAuthors:
            if eachAuthor['role'] == 'author':
                authors = h.appendStringIfUnique(authors, eachAuthor['name'])
            if eachAuthor['role'] == 'contributor':
                contributors = h.appendStringIfUnique(contributors, eachAuthor['name'])
            if eachAuthor['role'] == 'editor':
                editors = h.appendStringIfUnique(editors, eachAuthor['name'])
            if eachAuthor['role'] == 'translator':
                translators = h.appendStringIfUnique(translators, eachAuthor['name'])
            if eachAuthor['role'] == 'source':
                sources = h.appendStringIfUnique(sources, eachAuthor['name'])
            if eachAuthor['role'] == 'reviewer':
                reviewers = h.appendStringIfUnique(reviewers, eachAuthor['name'])
            if eachAuthor['role'] == 'technicalreviewer':
                technicalreviewers = h.appendStringIfUnique(technicalreviewers, eachAuthor['name'])
        authors_string = "; ".join(authors)
        editors_string = "; ".join(editors)
        sources_string = "; ".join(sources)
        contributors_string = "; ".join(contributors)
        translators_string = "; ".join(translators)
        reviewers_string = ", ".join(reviewers)
        technicalreviewers_string = ", ".join(technicalreviewers)
        metadata['authors'] = authors_string
        metadata['editors'] = editors_string
        metadata['sources'] = sources_string
        metadata['translators'] = translators_string
        metadata['contributors'] = contributors_string
        metadata['reviewers'] = reviewers_string
        metadata['technicalreviewers'] = technicalreviewers_string
        metadata['title'] = artifact.getTitle()
        metadata['created'] = artifact.getCreated()
        metadata['modified'] = artifact.getModified()
        metadata['summary'] = artifact.getSummary()
        if artifact.getCoverImageUri():
            cover_image = artifact.getCoverImageUri()
            if not cover_image.startswith("http"):
                cover_image = defaultImageHost + cover_image
            metadata['coverimage'] = cover_image
        else:
            cover_image = artifactRevision.getCoverImageSatelliteUri()
            if cover_image:
                metadata['coverimage'] = cover_image
            else:
                metadata['coverimage'] = ''
        metadata['handle'] = ''
        metadata['encodedID'] = ''
        myPDF.create_metadata_pdf(metadata, artifactType)

        if artifactType in bookLevelArtifactTypes:
            chapters = artifactRevision.children
            for eachChapter in chapters:
                logger.info('PDF Rendering: Adding chapter: %s' %(eachChapter))
                chap['id'] = eachChapter.child.artifact.id
                chap['title'] = eachChapter.child.artifact.getTitle()
                chap['xhtml'] = eachChapter.child.getXhtml(includeChildContent=True, includeChildHeaders=True, replaceMathJax=True)
                logger.info('Chapter XHTML: %s' %(chap['xhtml']))
                myPDF.save_chapter_xhtml(chap)
        else:
            chap['id'] = artifactRevision.artifact.id
            chap['title'] = artifactRevision.artifact.getTitle()
            chap['xhtml'] = artifactRevision.getXhtml(includeChildContent=True, includeChildHeaders=True, replaceMathJax=True)
            myPDF.save_chapter_xhtml(chap)

        myPDF.save_metadata_file(artifactType)
        e = None
        try:
            local_path, template = myPDF.create_pdf_via_f2pdf()
            if local_path and os.path.exists(local_path):
                downloadUri = save_pdf_resource(local_path, artifactRevision,
                                                template, userID=kwargs['user'],
                                                nocache=nocache)
                self.userdata = json.dumps({'downloadUri' : downloadUri,
                                            'template':template,'artifactUrl':artifact_url})

                debugPdfGeneration = self.config.get('debug_pdf_generation')
                if debugPdfGeneration =='false':
                    workDirPath = myPDF.get_work_dir_path()
                    if os.path.exists(workDirPath):
                        shutil.rmtree(workDirPath)
                self.userdata = json.dumps({'downloadUri' : downloadUri, \
                                            'template':template, 'id':artifactID, 'printType':'PDF', \
                                            'title':metadata['title'].encode('utf-8'),'artifactUrl':artifact_url, \
                                            'coverimage': metadata['coverimage'], 'artifactType': artifactType})
                if not skip_notify:
                    e = api.createEventForType(typeName='PRINT_GENERATION_SUCCESSFUL_PDF', objectID=artifactRevision.id, objectType='artifactRevision', eventData=json.dumps(self.userdata), ownerID=kwargs['user'], processInstant=False)
                    webEventTypeName = 'PRINT_GENERATION_SUCCESSFUL_WEB'
                eventForFailure = api.getEventTypeByName(typeName='PRINT_GENERATION_FAILED_PDF')
                notificationFilter.append(('eventTypeID', eventForFailure.id))
                api.invalidateArtifact(cache=ArtifactCache(), artifact=artifact, recursive=False)
                return 'pdf successfully generated via f2pdf for artifactID: %s, artifactRevisionID %s, by user with userID: %s' %(artifact.id, artifactRevision.id, kwargs['user'])
            else:
                raise Exception((_(u'PDF could not be generated. pdflatex could not create the PDF')).encode("utf-8"))
        except Exception as exceptObj:
            self.userdata = json.dumps({'id':chap['id'], 'printType':'PDF', 'title':metadata['title'].encode('utf-8')})
            if not skip_notify:
                e = api.createEventForType(typeName='PRINT_GENERATION_FAILED_PDF', objectID=artifactRevision.id, objectType='artifactRevision', eventData=json.dumps(self.userdata), ownerID=kwargs['user'], processInstant=False)
                webEventTypeName = 'PRINT_GENERATION_FAILED_WEB'
            eventForSuccess = api.getEventTypeByName(typeName='PRINT_GENERATION_SUCCESSFUL_PDF')
            notificationFilter.append(('eventTypeID', eventForSuccess.id))

            logger.error(exceptObj.__str__())
            logger.error(traceback.format_exc())
            raise Exception((_(u"Error in generating the pdf via f2pdf for artifactID: %(artifact.id)s, artifactRevisionID %(artifactRevision.id)s, by user with userID: %(kwargs['user'])s, with message %(traceback.format_exc())s") % {"artifact.id":artifact.id,"artifactRevision.id": artifactRevision.id,"kwargs['user']": kwargs['user'],"traceback.format_exc()": traceback.format_exc()}).encode("utf-8"))
        finally:
            logger.info('NotificationFilter: %s' %(notificationFilter))
            if len(notificationFilter) >= 4:
                n = api.getNotificationsByFilter(filters=notificationFilter, sort='created,asc', pageNum=1, pageSize=10)
                if n.getTotal() > 0:
                    api.deleteNotification(id=n[0].id)
            try:
                if not skip_notify:
                    logger.info("Creating PDF web notification of type=[%s], objectID=[%s], user=[%s]" % (webEventTypeName, artifactRevision.id, kwargs['user']))
                    web_e = api.createEventForType(typeName=webEventTypeName, objectID=artifactRevision.id, objectType='artifactRevision', eventData=json.dumps(self.userdata), ownerID=kwargs['user'], subscriberID=kwargs['user'], processInstant=False)
                    logger.info("Created PDF web notification: [%s]" % web_e.id)
                    webEvent = api.getEventTypeByName(typeName=webEventTypeName)
                    api.createNotification(eventTypeID=webEvent.id, objectID=artifactRevision.id, objectType='artifactRevision', address=None, subscriberID=kwargs['user'], type='web', frequency='ondemand')
            except Exception as ex:
                logger.error("Error creating PDF web notification")
                logger.error(ex.__str__())
                logger.error(traceback.format_exc())
            if not e:
                logger.error('Unable to send the notification as Event object is not defined or skip_notify is set to True')
            else:
                emailNotifications = api.getNotificationsForEvent(event=e, notificationTypes=['email'], frequencies=['once'], notSentSinceUpdate=True, onlyRecent=True)
                h.processInstantNotifications([e.id], notificationIDs=[n.id for n in emailNotifications], user=kwargs['user'], noWait=False)
