#
# Copyright 2007-2013 CK-12 Foundation
#
# All rights reserved
#      
#
# Unless required by applicable law or agreed to in writing, software
# distributed under this License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
# implied.  See the License for the specific language governing
# permissions and limitations.
#
# This file originally written by Javed Attar
#
# $Id$
from flx.controllers.celerytasks.periodictask import PeriodicTask
from flx.model import api
from urllib2 import urlopen, HTTPError
from datetime import datetime
from flx.controllers.common import ArtifactCache

import flx.lib.helpers as h
import os
import json
import logging

log = logging.getLogger(__name__)

class ThumbnailGenerationTask(PeriodicTask):

    recordToDB = True

    def __init__(self, **kwargs):
        PeriodicTask.__init__(self, **kwargs)
        self.routing_key = 'print'
        self.maxWaitMinutes = 360
        self.skipIfRunning = True
        self.thumbnail_host = self.config["thumbnail_generation_host"]
        self.diff_in_runs = self.config.get("thumbnail_diff_in_runs", "120")
        self.diff_in_runs = int(self.diff_in_runs)
        self.thumbnail_image_type = self.config.get("thumbnail_image_type", "png")
        self.thumbnail_image_width = self.config.get("thumbnail_image_width", "1024")
        self.thumbnail_image_height = self.config.get("thumbnail_image_height", "768")

    def run(self, **kwargs):
        PeriodicTask.run(self, **kwargs)


    def _get_first_anchor_from_xhtml(self, revision):
        import re
        first_url = None
        if revision.getXhtml():
            link_re = re.compile('<a.*?href="(.*?)".*?</a>',re.MULTILINE)
            hrefs = link_re.findall(revision.getXhtml())
            for href in hrefs:
                first_url = href
                break
        log.info('URL for first anchor of XHTML is "%s"' % first_url)
        return first_url

class GenerateThumbnails(ThumbnailGenerationTask):

    recordToDB = True

    def run(self, **kwargs):
        ThumbnailGenerationTask.run(self, **kwargs)
        fromDate = toDate = None
        if kwargs.get('fromDate') and kwargs.get('toDate'):
            fromDate = kwargs.get('fromDate')
            toDate = kwargs.get('toDate')
        newOnly = kwargs.get('newOnly', False)
        force = kwargs.get('force', False)
        modalityHandle = kwargs.get('handle', None)
        log.info("Running web thumbnail generations with params %s" % kwargs)
        """
        Generate web thumbnail image of web/link modalities
        Upload them to server and then persist in DB as cover page.
        """
        
        # Iterate over web/link modalities
        pageNum = 1
        pageSize = 10
        totalCount = successCount = failCount = skipCount = 0
        tasks = []
        if fromDate and toDate:
            fromDate = datetime.strptime(fromDate.strip(),'%m/%d/%Y')
            toDate = datetime.strptime(toDate.strip(),'%m/%d/%Y')

        while True:
            log.info("Fetching modalities for page=%s with page size %s" % (pageNum, pageSize))
            web_modality_list = self._get_modalities(pageNum, pageSize, fromDate, toDate, modalityHandle, force)

            if not web_modality_list:
                break
            modalities = []
            for modality in web_modality_list:
                artifactRevisionID = modality[0]
                artifactID = modality[1]
                artifactTitle = modality[2]
                thumbnail_url = None
                revision = api.getArtifactRevisionByID(artifactRevisionID)
                resourceRevision = revision.getResourceRevision('cover page')
                #resourceRevision = modality.getResourceRevision(revision, "cover page")
                # Try to get URL from XHTML, if present.
                thumbnail_url = self._get_first_anchor_from_xhtml(revision)

                if not thumbnail_url and revision.getUri("web"):
                    # get web resource of modality.
                    thumbnail_url = revision.getUri("web")

                # only new modalities or modalities missing cover page should be processed 
                if newOnly and revision.getUri('cover page'):
                    log.info("Skipped modality as it already have Cover Page and we are processing only new")
                    skipCount +=1
                    continue

                #resourceRevision = modality.getResourceRevision(revision, "cover page")
                # If no force and cover page exists check if its been created before some time frame defined in config
                if resourceRevision and not force:
                    diff_time = datetime.now() - resourceRevision.resource.creationTime
                    diff_time = int(h.get_total_seconds(diff_time)/60)
                    if diff_time < self.diff_in_runs:
                        log.info("Skipped modality time difference in previous in current run (%s / %s)" % (diff_time, self.diff_in_runs))
                        skipCount +=1
                        continue

                if thumbnail_url:
                    _modalityDict = {'id':artifactID, 'thumbnail_url':thumbnail_url}
                    modalities.append(_modalityDict)
                else:
                    log.info("URI missing for modality '%s' having id=%s and revision id=%s" % (artifactTitle,artifactID,artifactRevisionID))
            w = GenerateThumbnailWorker()
            t = w.delay(modalities=modalities, loglevel='INFO')
            tasks.append(t)
            pageNum += 1
            totalCount = web_modality_list.getTotal()

        for task in tasks:
            try:
                ret = task.wait()
                successCount += ret['success']
                failCount += ret['failed']
                self.userdata = json.dumps({'total': totalCount, 'success': successCount, 'failed': failCount, 'skipped': skipCount})
                self.updateTask()
            except Exception, e:
                log.error("Error running at least one worker: %s" % str(e), exc_info=e)

        log.info("Total Web modalities count=%s" % totalCount)
        log.info("Successful Web modalities count=%s" % successCount)
        log.info("Failed Web modalities count=%s" % failCount)
        log.info("Skipped Web modalities count=%s" % skipCount)

    def _get_modalities(self, pageNum, pageSize, fromDate, toDate, modalityHandle, force):
        web_modality_list = api.getThumbnailModalities(artifactTypeID=34, pageNum=pageNum, pageSize=pageSize, fromDate=fromDate, toDate=toDate, handle= modalityHandle, force=force)
        return web_modality_list

class GenerateThumbnailWorker(ThumbnailGenerationTask):

    recordToDB = False

    def run(self, **kwargs):
        ThumbnailGenerationTask.run(self, **kwargs)
        modalities = kwargs.get('modalities')
        success = failed = 0
        for _modality in modalities:
            try:
                modality = api.getArtifactByID(_modality['id'], 'web')
                thumbnail_url = _modality['thumbnail_url']
                # Keep the url parameter last, else the other parameters are passed to the URL as its parameters
                params = "type=%s&width=%s&height=%s&url=%s" % (self.thumbnail_image_type, self.thumbnail_image_width, self.thumbnail_image_height,thumbnail_url)

                customCoverWorkdir = '/tmp/custom_cover_workdir/'
                if not os.path.exists(customCoverWorkdir):
                    os.mkdir(customCoverWorkdir)
        
                timestamp = datetime.now().strftime("%Y%m%d%s%f")
                cover_image_path = customCoverWorkdir + 'custom-' + h.safe_encode(modality.getTitle()).replace(' ', '_') + '-%s' %(timestamp) + '.' + self.thumbnail_image_type
                log.info("Calling: %s with params: %s" % (self.thumbnail_host, params))
                f = urlopen(self.thumbnail_host, data=params)
                newTempFile = None
                try:
                    newTempFile = open(cover_image_path,"wb")
                    newTempFile.write(f.read())
                finally:
                    newTempFile.close()
                log.info("Wrote screenshot to: %s" % cover_image_path)
                # Create resource on satellite server and associate it with modality as cover page
                self.__createAssociateCoverImage(modality, cover_image_path, modality.getOwnerId())
                if os.path.exists(cover_image_path):
                    os.remove(cover_image_path)
                success +=1
            except HTTPError, herr:
                log.info("Not able generate thumbnail for modality '%s' having id=%s" % (modality.getTitle(),modality.getId()), exc_info=herr)
                failed += 1
            except Exception,e:
                log.info("There is exception processing modality '%s' having id=%s" % (modality.getTitle(),modality.getId()), exc_info=e)
                failed += 1
        return {'success':success, 'failed':failed}

    def __createCoverImageResource(self, cover_image_path, userID):
        log.info("User ID=%s"%userID)
        resourceDict = {}
        path, name = os.path.split(cover_image_path)
        resourceDict['uri'] = open(cover_image_path, "rb")
        resourceDict['uriOnly'] = False
        resourceDict['isExternal'] = False
        resourceDict['resourceType'] = api.getResourceTypeByName(name='cover page')
        resourceDict['name'] = name
        resourceDict['description'] = None
        language = api.getLanguageByName(name='English')
        resourceDict['languageID'] = language.id
        resourceDict['ownerID'] = userID
        resourceDict['creationTime'] = datetime.now()
        resourceRevision = api.createResource(resourceDict=resourceDict,
                                              commit=True)
        return resourceRevision

    def __associateCoverImage(self, artifact, resourceRevision, memberID=None):
        artifactRevision = artifact.revisions[0]
        artifactRevisionHasResource = api.createArtifactHasResource(artifactRevisionID=artifactRevision.id,
                                      resourceRevisionID=resourceRevision.id)
        api.invalidateArtifact(cache=ArtifactCache(), artifact=artifact, memberID=memberID)
        return artifactRevisionHasResource

    def __createAssociateCoverImage(self, artifact, cover_image_path, memberID):
        resourceRevision = self.__createCoverImageResource(cover_image_path, memberID)
        artifactRevisionHasResource = self.__associateCoverImage(artifact, resourceRevision, memberID=memberID)

