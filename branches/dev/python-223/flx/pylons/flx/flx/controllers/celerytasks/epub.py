import os
import json
import urllib2
import logging
import traceback

from flx.controllers.celerytasks.generictask import GenericTask
from pylons.i18n.translation import _
from flx.lib.ck12_epub_lib.ck12_epub import CK12EPub
from flx.model import api
from flx.lib import helpers as h
from flx.controllers.common import ArtifactCache

logger = logging.getLogger(__name__)

artifactTypeMapping = { 'book':'b', 'chapter':'ch', 'lesson':'l', 'concept':'c', 'section': 's', 'tebook': 'te', 'workbook': 'wb', 'labkit':'lk', 'quizbook': 'qb'}

def save_epub_resource(epubpath, artifactRevision, userID, nocache=False, optimizeForKindle=False):
    from datetime import datetime
    resourceDict = {}
    if optimizeForKindle:
        epubType = 'epubk'
    else:
        epubType = 'epub'
    resourceDict['resourceType'] = api.getResourceTypeByName(name=epubType)
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
    newEpubPath = os.path.dirname(epubpath) + '/' + uniqueName
    newEpubPath = newEpubPath.encode('utf-8') + '.%s' %(epubType)
    logger.info('New ePubPath: %s' %(newEpubPath))
    os.rename(epubpath, newEpubPath)
    resourceDict['uri'] = open(newEpubPath, 'rb')
    resourceDict['creationTime'] = datetime.now()
    resourceDict['ownerID'] = artifactRevision.artifact.creatorID
    resourceRevision = artifactRevision.artifact.getResourceRevision(artifactRevision, epubType)
    if nocache and resourceRevision:
        logger.info('nocache option specified. Deleting the previous ePub and creating a new one')
        api.deleteArtifactHasResource(artifactRevisionID=artifactRevision.id,
                                    resourceRevisionID=resourceRevision.id)
        api.deleteResource(resource=resourceRevision.resource)

    resourceRevision = api.createResource(resourceDict=resourceDict, commit=True)
    downloadUri = resourceRevision.resource.getPermaUri(fullUrl=True, qualified=True)
    artifactRevisionHasResource = api.createArtifactHasResource(artifactRevisionID=artifactRevision.id,
                                    resourceRevisionID=resourceRevision.id)
    return downloadUri

class epubTask(GenericTask):

    def __init__(self, **kwargs):
        ## Initialize GenericTask
        GenericTask.__init__(self, **kwargs)
        self.routing_key = "print"


class epub(epubTask):

    recordToDB = True

    def run(self, id, mathSatelliteServer, defaultImageHost, revisionID=None, nocache=False, optimizeForKindle=False, skip_notify=False, **kwargs):

        artifact_url = kwargs.get('artifact_url', '')
        epubTask.run(self, **kwargs)
        e = None
        try:
            if revisionID == None:
                artifact = api.getArtifactByID(id=id)
                artifactRevision = artifact.revisions[0]
            else:
                artifactRevision = api.getArtifactRevisionByID(id=revisionID)
                artifact = artifactRevision.artifact

            self.artifactKey = str(artifactRevision.id)
            artifactType = artifact.type.name
            title = artifact.getTitle().strip()
            cover_image = artifact.getCoverImageUri()
            if cover_image and not cover_image.startswith("http"):
                cover_image = defaultImageHost + cover_image
            elif not cover_image:
                cover_image = artifactRevision.getCoverImageSatelliteUri()
            self.updateTask()
            if optimizeForKindle == 'True':
                optimizeForKindle = True
                epubType = 'epubk'
            else:
                optimizeForKindle = False
                epubType = 'epub'

            notificationFilter = [('subscriberID', kwargs['user']), ('objectType', 'artifactRevision'), ('objectID', artifactRevision.id)]
            bookLevelArtifactTypes = ['book', 'tebook', 'studyguide', 'workbook', 'labkit', 'quizbook']
            logger.info('optimizeForKindle: %s, epubType: %s' %(optimizeForKindle, epubType))
            resourceRevision = artifact.getResourceRevision(artifactRevision, epubType)
            if nocache == 'True':
                nocache=True
            elif nocache == 'False' and resourceRevision:
                nocache = False
                logger.info('Resource for the given ArtifactRevision already exists. Returning the saved resource')
                downloadUri = resourceRevision.resource.getUri()
                self.userdata = json.dumps({'downloadUri' : downloadUri,'artifactUrl':artifact_url})

                taskDetails = {'downloadUri' : downloadUri, 'title': title.encode('utf-8'), 'printType':'ePub', \
                               'artifactID': artifact.id, 'artifactRevisionID': artifactRevision.id, 'userID': kwargs['user'],
                               'coverimage': cover_image if cover_image else '', 'artifactType': artifactType}
                n = api.getNotificationsByFilter(filters=notificationFilter, sort='created,asc', pageNum=1, pageSize=10)
                for eachNotification in n:
                    logger.info('Deleting notification with id: [%s]' %(eachNotification.id))
                    api.deleteNotification(id=eachNotification.id)
                return taskDetails

            myEpub = CK12EPub()
            myEpub.setLogger(logger)
            myEpub.optimizeForKindle = optimizeForKindle
            myEpub.artifactType = artifactType

            allAuthors = []
            allAuthors.extend(artifact.getAuthors())
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
            authors_string = ", ".join(authors)
            editors_string = ", ".join(editors)
            sources_string = ", ".join(sources)
            contributors_string = ", ".join(contributors)
            translators_string = ", ".join(translators)
            reviewers_string = ", ".join(reviewers)
            technicalreviewers_string = ", ".join(technicalreviewers)

            myEpub.add_author_attribution(authors_string,
                                          editors_string,
                                          sources_string,
                                          contributors_string,
                                          translators_string,
                                          reviewers_string,
                                          technicalreviewers_string)
            myEpub.set_book_title(artifact.getTitle().strip())
            coverImageUri = artifact.getCoverImageUri()
            if coverImageUri:
                parse = urllib2.urlparse.urlparse(coverImageUri)
                if not parse.netloc:
                    coverImageUri = defaultImageHost + coverImageUri
                logger.info('CoverImage: [%s]' %(coverImageUri))
                myEpub.add_book_cover_from_url(coverImageUri)

            if artifactType in bookLevelArtifactTypes:
                #extract, save - front and back matter chapters 
                artifact_xhtml = artifact.getXhtml(includeChildContent=True, includeChildHeaders=True, replaceMathJax=True)
                front_matter, back_matter = myEpub.extract_front_and_back_matter(artifact_xhtml)
                if front_matter:
                    front_matter_chapters = myEpub.make_front_matter_chapters(front_matter)
                    for chap in front_matter_chapters:
                        myEpub.add_new_chapter_with_concepts(chap['title'],[], chap['xhtml'], defaultImageHost, mathSatelliteServer)
                chapters = artifactRevision.children
                for eachChapter in chapters:
                    logger.info('ePub Rendering: Adding chapter: %s' %(eachChapter.child.artifact.getHandle()))
                    chapterType = eachChapter.child.artifact.getArtifactType()
                    chapter_xhtml = eachChapter.child.getXhtml(includeChildContent=True, includeChildHeaders=True, includePracticeLinks=True, replaceMathJax=True)
                    lesson_titles = []
                    lessons = []
                    if chapterType == 'chapter':
                        logger.info('First level children is a chapter. Getting the second level children')
                        lessons = eachChapter.child.getChildren()
                    if len(lessons) != 0:
                        for eachLesson in lessons:
                            lesson_titles.append(eachLesson.getTitle().strip())
                        myEpub.add_new_chapter_with_concepts(eachChapter.child.artifact.getTitle().strip(), lesson_titles,
                                                             chapter_xhtml, defaultImageHost, mathSatelliteServer)
                    else:
                        logger.info('No second level children. TOC will be only go 1 level deep')
                        myEpub.add_new_chapter_with_concepts(eachChapter.child.artifact.getTitle().strip(),[], chapter_xhtml, defaultImageHost, mathSatelliteServer)
            elif artifactType in ['section', 'lesson', 'concept']:
                logger.info('ePub Rendering: Adding %s: %s' %(artifactType, artifact.getHandle()))
                artifact_xhtml = artifact.getXhtml(includeChildContent=True, includeChildHeaders=True, includePracticeLinks=True, replaceMathJax=True)
                logger.info('No second level children. TOC will be only go 1 level deep')
                myEpub.add_new_chapter_with_concepts(artifact.getTitle().strip(),[], artifact_xhtml, defaultImageHost, mathSatelliteServer)
                pass
            elif artifactType == 'chapter':
                children = artifactRevision.children
                if children:
                    for eachChild in children:
                        childXhtml = eachChild.child.artifact.getXhtml(includeChildContent=True, includeChildHeaders=True, includePracticeLinks=True, replaceMathJax=True)
                        childTitle = eachChild.child.artifact.getTitle().strip()
                        myEpub.add_new_chapter_with_concepts(childTitle, [], childXhtml, defaultImageHost, mathSatelliteServer)
                else:
                    logger.info('No second level children. TOC will be only go 1 level deep')
                    artifact_xhtml = artifact.getXhtml(includeChildContent=True, includeChildHeaders=True, replaceMathJax=True)
                    myEpub.add_new_chapter_with_concepts(artifact.getTitle().strip(),[], artifact_xhtml, defaultImageHost, mathSatelliteServer)

            myEpub.render()
            local_path = myEpub.workdir + '/book.epub'
            if os.path.exists(local_path):
                logger.info('ePub rendered successfully. Location: %s' %(local_path))
                downloadUri = save_epub_resource(local_path, artifactRevision,
                                          userID=kwargs['user'], nocache=nocache, optimizeForKindle=optimizeForKindle)
                taskDetails = {'downloadUri' : downloadUri, 'title': title.encode('utf-8'), 'printType':'ePub', \
                               'artifactID': artifact.id, 'artifactRevisionID': artifactRevision.id, \
                               'userID': kwargs['user'],'artifactUrl':artifact_url, \
                               'coverimage': cover_image if cover_image else '', 'artifactType': artifactType}
                self.userdata = json.dumps(taskDetails)
                if optimizeForKindle == False and not skip_notify:
                    e = api.createEventForType(typeName='PRINT_GENERATION_SUCCESSFUL_EPUB', objectID=artifactRevision.id, objectType='artifactRevision', eventData=json.dumps(self.userdata), ownerID=kwargs['user'], processInstant=False)
                    webEventTypeName = 'PRINT_GENERATION_SUCCESSFUL_WEB'
                eventForFailure = api.getEventTypeByName(typeName='PRINT_GENERATION_FAILED_EPUB')
                notificationFilter.append(('eventTypeID', eventForFailure.id))
                api.invalidateArtifact(cache=ArtifactCache(), artifact=artifact, recursive=False)
                return taskDetails
            else:
                raise Exception((_(u'Error in rendering epub')).encode("utf-8"))
        except Exception as exceptObj:
            logger.error(exceptObj.__str__())
            logger.error(traceback.format_exc())
            if optimizeForKindle == False and not skip_notify:
                self.userdata = json.dumps({ 'title': title.encode('utf-8'), 'printType':'ePub'})
                e = api.createEventForType(typeName='PRINT_GENERATION_FAILED_EPUB', objectID=artifactRevision.id, objectType='artifactRevision', eventData=json.dumps(self.userdata), ownerID=kwargs['user'], processInstant=False)
                webEventTypeName = 'PRINT_GENERATION_FAILED_WEB'
            eventForSuccess = api.getEventTypeByName(typeName='PRINT_GENERATION_SUCCESSFUL_EPUB')
            notificationFilter.append(('eventTypeID', eventForSuccess.id))

            raise Exception((_(u"Error in generating ePub for artifactID: %(artifact.id)s, artifactRevisionID %(artifactRevision.id)s, by user with userID: %(kwargs['user'])s, with message %(traceback.format_exc())s") % {"artifact.id":artifact.id,"artifactRevision.id": artifactRevision.id,"kwargs['user']": kwargs['user'],"traceback.format_exc()": traceback.format_exc()}).encode("utf-8"))
        finally:
            logger.info('NotificationFilter: %s' %(notificationFilter))
            if len(notificationFilter) >= 4:
                n = api.getNotificationsByFilter(filters=notificationFilter, sort='created,asc', pageNum=1, pageSize=10)
                if n.getTotal() > 0:
                    api.deleteNotification(id=n[0].id)
            try:
                if optimizeForKindle == False and not skip_notify:
                    logger.info("Creating EPUB web notification of type=[%s], objectID=[%s], user=[%s]" % (webEventTypeName, artifactRevision.id, kwargs['user']))
                    web_e = api.createEventForType(typeName=webEventTypeName, objectID=artifactRevision.id, objectType='artifactRevision', eventData=json.dumps(self.userdata), ownerID=kwargs['user'], subscriberID=kwargs['user'], processInstant=False)
                    logger.info("Created EPUB web notification: [%s]" % web_e.id)
                    webEvent = api.getEventTypeByName(typeName=webEventTypeName)
                    api.createNotification(eventTypeID=webEvent.id, objectID=artifactRevision.id, objectType='artifactRevision', address=None, subscriberID=kwargs['user'], type='web', frequency='ondemand')
            except Exception as ex:
                logger.error("Error creating EPUB web notification")
                logger.error(ex.__str__())
                logger.error(traceback.format_exc())
            if optimizeForKindle == False and not skip_notify:
                if not e:
                    logger.error('Unable to send the notification as Event object is not defined.')
                else:
                    emailNotifications = api.getNotificationsForEvent(event=e, notificationTypes=['email'], frequencies=['once'], notSentSinceUpdate=True, onlyRecent=True)
                    h.processInstantNotifications([e.id], notificationIDs=[n.id for n in emailNotifications], user=kwargs['user'], noWait=False)


class epubk(epub):

    recordToDB = False


class stitch(epubTask):

    recordToDB = True

    def run(self,book_title,chapter_urls,downloadPrefix, **kwargs):
        epubTask.run(self, **kwargs)
        try:
            myEpub = CK12EPub()
            myEpub.setLogger(logger)
            myEpub.book_title = book_title
            for url in chapter_urls:
                myEpub.add_new_chapter_from_url(url)

            myEpub.render()
            path = downloadPrefix + myEpub.workdir.replace("/tmp","")
            return path
        except Exception, e:
            logger.error('epub exception[%s]' % str(e))
            raise e
