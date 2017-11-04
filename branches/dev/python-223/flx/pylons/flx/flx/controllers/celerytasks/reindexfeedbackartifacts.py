from celery.task import Task
from flx.controllers.celerytasks.generictask import GenericTask
from flx.model import api
from flx.model.model import title2Handle
import flx.lib.helpers as h
import logging
import json
from flx.lib.base import BaseController
from flx.controllers.errorCodes import ErrorCodes
from flx.controllers.common import ArtifactCache, ArtifactRevisionCache
from pylons import app_globals as g
from pylons.i18n.translation import _
import traceback
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class reindexFeedbackArtifactTask(GenericTask):

    recordToDB = False

    def __init__(self, **kwargs):
        ## Initialize GenericTask
        GenericTask.__init__(self, **kwargs)
        self.routing_key = 'search'

    def run(self, **kwargs):
        """
            Reindex the artifacts that has received the feedback yesterday.
        """
        GenericTask.run(self, **kwargs)
        yesterday = datetime.now() - timedelta(days=1)
        logger.info("Reindexing the feedback artifacts for date:%s" % yesterday)
        count = 0
        try:
            pageSize = 100
            # Prepare the start and end times for the feedbacks 
            startDatetime = datetime(yesterday.year, yesterday.month, yesterday.day)
            endDatetime = startDatetime + timedelta(hours=23, minutes=59, seconds=59)
            kwargs = {'startDatetime':startDatetime,'endDatetime':endDatetime, 'pageSize':pageSize}
            # Reindex artifacts
            reindexList = []
            pageNum = 1
            
            while True:
                logger.info("Fetching %d artifacts, pageNum: %d" % (pageSize, pageNum))
                kwargs.update({'pageNum':pageNum})
                artifactFeedbacks = api.getArtifactFeedbacksByDateRange(**kwargs)
                if not artifactFeedbacks:
                    break
                reindexList = [af.artifactID for af in artifactFeedbacks]
                if reindexList and len(reindexList) >= 100:
                    logger.info("Reindexing %d artifacts" % len(reindexList))
                    h.reindexArtifacts(reindexList, user=None, wait=False, recursive=False)
                    count += len(reindexList)
                    reindexList = []
                    logger.info("Completed reindexing for page:%s"% pageNum)
                pageNum += 1
            if reindexList:
                logger.info("Reindexing remaining %d artifacts" % len(reindexList))
                h.reindexArtifacts(reindexList, user=None, wait=False, recursive=False)
                count += len(reindexList)
            logger.info("Completed reindexing of %s artifacts." % count)
        except Exception, e:
            logger.error("Unable to reindex feedback artifacts for date: %s, Error:%s" % (yesterday, e))
            raise e
