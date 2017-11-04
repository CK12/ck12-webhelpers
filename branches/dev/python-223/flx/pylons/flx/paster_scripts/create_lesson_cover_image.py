import os
import urllib
import re
from datetime import datetime

from flx.model import api
from flx.lib.helpers import reindexArtifacts
from flx.controllers.common import ArtifactCache
from pylons import app_globals as g

import logging

SERVER_NAME = "http://www.ck12.org"

LOG_FILENAME = "/tmp/create_lesson_cover_image.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=10*1024*1024, backupCount=5)
handler.setFormatter(formatter)
log.addHandler(handler)

def printToLog(message):
    print message
    log.debug(message)

class ArtifactCoverImage:

    def __init__(self, artifactID, verbose=True):
        self.artifactID = artifactID
        self.verbose = verbose
        self.allowedArtifactTypes = ['book', 'lesson', 'section']
        self.genericCoverImages = ['cover_chapter_generic.png', 'cover_concept_generic.png', 'cover_flexbook_generic.png', 'cover_lesson_generic.png', 'read_gicon.png']
        self.invalidateArtifactIDs = []

    def run(self):
        try:
            artifact = api.getArtifactByID(self.artifactID)
            if not artifact or artifact.getArtifactType() not in self.allowedArtifactTypes:
                printToLog("Artifact with id [%s] doen't exists or artifact type not allowed" % self.artifactID)
                raise Exception("Artifact with id [%s] doen't exists or artifact type not allowed" % self.artifactID)
            
            artifactType = artifact.getArtifactType()

            printToLog("Artifact is a %s" %artifactType)            
            if artifactType == 'book':
                self.getLessonsFromArtifact(artifact)
            else:
                self.getCoverImage(artifact)
            ## Reindex
            if self.invalidateArtifactIDs:
                self.invalidateArtifactIDs = list(set(self.invalidateArtifactIDs))
                reindexArtifactsIDs = []
                for artifactID in list(set(self.invalidateArtifactIDs)):
                    artifact = api.getArtifactByID(artifactID)
                    printToLog("Invalidating Artifact Cache :[%s]" % artifact.id)
                    api.invalidateArtifact(ArtifactCache(), artifact, revision=artifact.revisions[0], recursive=True, memberID=artifact.creator.id)
                    ArtifactCache().load(artifact.id)
                    reindexArtifactsIDs.append(artifact.id)
                if reindexArtifactsIDs:
                    printToLog("Reindex artifactIDs : [%s]" % self.invalidateArtifactIDs)
                    taskId = reindexArtifacts([reindexArtifactsIDs], user=artifact.creator.id, recursive=True)
                    printToLog("reindex task id: %s" % taskId)

            printToLog("Done...")
        except Exception as e:
            printToLog(str(e))
            raise e

    def getLessonsFromArtifact(self, artifact):
        for child in artifact.getChildren():
            if child.getArtifactType() in ['lesson', 'section']:
                self.getCoverImage(child)
            elif child.getChildren():
                self.getLessonsFromArtifact(child)

    def downloadImageFromUrl(self, imageUrl):
        imageUrl = SERVER_NAME + imageUrl
        downloadDirectory = '/tmp/cover_images'
        if not os.path.exists(downloadDirectory):
            os.mkdir(downloadDirectory)
        newCoverImagePath = downloadDirectory + '/' + imageUrl.split('/')[-1:][0]
        printToLog("Downloading: %s into %s" %(imageUrl, newCoverImagePath))
        urllib.urlretrieve(imageUrl, newCoverImagePath)
        return newCoverImagePath

    def getCoverImage(self, artifact):
        def _get_first_img_src(xhtmlContent):
            log.info("Trying to find first image as cover page from xhtml ...")
            img_src = None
            try:
                img_re = re.compile('<img .*?src=\W*"(.*?)"', re.DOTALL)
                img_srcs = img_re.findall(xhtmlContent.replace('\n',''))
                img_src = None
                for each in img_srcs: 
                    if not each.lower().__contains__('/flx/math/'):
                        img_src = each
                        break
                if img_src:
                    img_src = re.sub('(.*?)THUMB.*?(image.*)','\\1\\2',img_src)
                
            except Exception as e: 
                img_src = None
            printToLog("Found first image from xhtml as cover page: [%s]" % img_src)
            return img_src

        if artifact.getArtifactType() == 'section':
            coverImage = artifact.getCoverImageUri()
            newCoverImageUrl = _get_first_img_src(artifact.getXhtml())
            newCoverImagePath = self.downloadImageFromUrl(newCoverImageUrl)
            """"#If cover generic cover image already present then remove it
            if coverImage:
                artifactRevision = artifact.revisions[0]
                resourceRevision = artifact.getResourceRevision(artifactRevision, 'cover page')
                printToLog("Deleting existing cover image for section artifact id [%s] with artifactRevision %s and resourceRevision %s"\
                        % (artifact.id, artifactRevision.id, resourceRevision.id))
                api.deleteArtifactHasResource(artifactRevisionID=artifactRevision.id, resourceRevisionID=resourceRevision.id)

                try:
                    api.deleteResource(resource=artifact.resource)
                except Exception as ex:
                    printToLog("Unable to delete resource, reason %s" % str(ex))"""
            self.generateCoverImageForArtifact(artifact, newCoverImagePath)
            self.invalidateArtifactIDs.append(artifact.id)
        elif artifact.getArtifactType() == 'lesson':
            lessonArtifact = artifact
            coverImage = lessonArtifact.getCoverImageUri()
            #if cover image not present or if generic cover image present then look of first block image in artifact xhtml
            if not coverImage or coverImage.split('/')[-1:][0] in self.genericCoverImages:
                artifactTypeDict = g.getArtifactTypes()
                typeID = artifactTypeDict['concept']
                conceptArtifact = api.getRelatedArtifactByPerma(typeID, \
                                                                lessonArtifact.handle, \
                                                                lessonArtifact.creatorID, \
                                                                lessonArtifact.getDomain()['encodedID'])
                if conceptArtifact:
                    conceptArtifact = conceptArtifact.artifact
                    newCoverImageUrl = _get_first_img_src(conceptArtifact.getXhtml())
                    if newCoverImageUrl:
                        newCoverImagePath = self.downloadImageFromUrl(newCoverImageUrl)
                        #If cover generic cover image already present then remove it
                        """if coverImage:
                            artifactRevision = lessonArtifact.revisions[0]
                            lessonResourceRevision = lessonArtifact.getResourceRevision(artifactRevision, 'cover page')
                            printToLog("Deleting existing cover image for lesson artifact id [%s] with artifactRevision %s and resourceRevision %s"\
                                    % (lessonArtifact.id, artifactRevision.id, lessonResourceRevision.id))
                            api.deleteArtifactHasResource(artifactRevisionID=artifactRevision.id, resourceRevisionID=lessonResourceRevision.id)

                            artifactRevision = conceptArtifact.revisions[0]
                            resourceRevision = conceptArtifact.getResourceRevision(artifactRevision, 'cover page')
                            printToLog("Deleting existing cover image for concept artifact id [%s] with artifactRevision %s and resourceRevision %s"\
                                    % (conceptArtifact.id, artifactRevision.id, resourceRevision.id))
                            api.deleteArtifactHasResource(artifactRevisionID=artifactRevision.id, resourceRevisionID=resourceRevision.id)

                            #if more than one associations exists the exception would be thrown. 
                            try:
                                api.deleteResource(resource=lessonResourceRevision.resource)
                            except Exception as ex:
                                printToLog("Unable to delete resource, reason %s" % str(ex))
                            try:
                                api.deleteResource(resource=resourceRevision.resource)
                            except Exception as ex:
                                printToLog("Unable to delete resource, reason %s" % str(ex))"""
                        self.generateCoverImageForArtifact(lessonArtifact, newCoverImagePath)
                        self.invalidateArtifactIDs.append(lessonArtifact.id)
                        self.generateCoverImageForArtifact(conceptArtifact, newCoverImagePath)
                        self.invalidateArtifactIDs.append(conceptArtifact.id)
                        
    def generateCoverImageForArtifact(self, artifact, coverImagePath):
        artifactRevision = artifact.revisions[0]
        resourceDict = {}
        path, name = os.path.split(coverImagePath)
        resourceDict['uri'] = open(coverImagePath, "rb")
        resourceDict['uriOnly'] = False
        resourceDict['isExternal'] = False
        resourceDict['resourceType'] = api.getResourceTypeByName(name='cover page')
        resourceDict['name'] = name
        resourceDict['description'] = None
        language = api.getLanguageByName(name='English')
        resourceDict['languageID'] = language.id
        resourceDict['ownerID'] = artifact.creatorID
        resourceDict['creationTime'] = datetime.now()
        resourceRevision = api.createResource(resourceDict=resourceDict,
                                              commit=True)
        artifactRevisionHasResource = api.createArtifactHasResource(artifactRevisionID=artifactRevision.id,
                                      resourceRevisionID=resourceRevision.id)

if __name__ == '__main__':
    import optparse

    parser = optparse.OptionParser('%prog [options]')
    parser.add_option(
        '-id', '--artifactid', dest='artifactid', default=None,
        help='The artifact id of book or lesson to create cover image for'
    )
    parser.add_option(
        '-q', '--quiet', action='store_false', dest='verbose', default=True,
        help='Turn verbose mode off.'
    )
    options, args = parser.parse_args()

    artifactID = options.artifactID
    verbose = options.verbose

    if not artifactID:
        raise Exception('Missing Artifact ID')

    if verbose:
        print('Artifact ID to generate cover image %s.' % artifactID)

    a = ArtifactCoverImage(artifactID, verbose)
    a.run()