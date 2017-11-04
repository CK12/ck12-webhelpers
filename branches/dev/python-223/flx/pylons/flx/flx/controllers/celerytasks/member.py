from celery.task import Task
from flx.controllers.celerytasks.generictask import GenericTask
from flx.model import api
import flx.lib.helpers as h
import logging
from flx.lib.base import BaseController
from flx.controllers.errorCodes import ErrorCodes
from pylons import app_globals as g
from pylons.i18n.translation import _
import traceback

logger = logging.getLogger(__name__)

class updateMemberAccessTimeTask(GenericTask):

    recordToDB = False

    def __init__(self, **kwargs):
        ## Initialize GenericTask
        GenericTask.__init__(self, **kwargs)
        self.routing_key = 'artifact'

    def run(self, memberID, objectType, objectID, accessTime, **kwargs):
        """
            Set/ update accessTime for object identified by objectType and objectID for
            member identified by memberID.
        """
        GenericTask.run(self, **kwargs)
        logger.info("Updating accessTime %s for member[%s] objectType[%s] objectID[%s]" % (accessTime, memberID, objectType, objectID))
        logger.info("DB: %s" % self.config['sqlalchemy.url'])

        try:
            api.updateMemberAccessTime(memberID=memberID, objectType=objectType, objectID=objectID, accessTime=accessTime)
            return "Updated accessTime %s for member: %s objectType: %s objectID: %s" % (accessTime, memberID, objectType, objectID)
        except Exception, e:
            logger.error("Unable to update accessTime for member %s for objectType %s, objectID %s [%s]" % (memberID, objectType, objectID, e))
            raise e
