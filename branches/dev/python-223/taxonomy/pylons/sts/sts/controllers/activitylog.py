import logging
import os
from datetime import datetime
import traceback
from tempfile import NamedTemporaryFile

from pylons import request, response, session, tmpl_context as c
from pylons.controllers.util import abort
from sqlalchemy.sql import select
from pylons.decorators.cache import beaker_cache

from sts.controllers import decorators as d
import sts.controllers.user as u
from sts.model import meta
from sts.model import api
from sts.model.model import ConceptNode, ActivityLog
from sts.lib.base import BaseController, render
from sts.lib.app_globals import MultiPaginator
import sts.lib.helpers as h

from sts.controllers.errorCodes import ErrorCodes

log = logging.getLogger(__name__)

def logActivity(activityType, actionObject, logFailure=False):
    try:
        member = u.getCurrentUser()
        alogKwargs = {
                'activityType': activityType,
                'actionObject': type(actionObject).__name__,
                'memberID': member['id']
                }
        if not logFailure:
            alogKwargs['actionObject'] += ':%d' % actionObject.id if hasattr(actionObject, 'id') else ':0'
        else:
            alogKwargs['actionObject'] += ':%s' % str(actionObject)

        alog = api.createActivityLog(**alogKwargs)
        log.info("Created new activity log: %s" % alog.id)
        return alog
    except Exception, e:
        log.error("Failed to log activity: %s" % str(e), exc_info=e)
        return None

