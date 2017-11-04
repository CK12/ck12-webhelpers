import logging
import os
from datetime import datetime

from pylons import request, response, session, tmpl_context as c
from pylons import app_globals as g
from pylons.controllers.util import abort
from sqlalchemy.sql import select

from flx.controllers import decorators as d
from flx.model import exporter
from flx.lib.base import BaseController, render
import flx.lib.helpers as h
import flx.controllers.user as u

from flx.controllers.errorCodes import ErrorCodes

log = logging.getLogger(__name__)

class MigrationController(BaseController):
    """
        Migration related APIs.
    """

    @d.jsonify()
    @d.checkAuth(request, False, False, ['system', 'emails'])
    @d.trace(log, ['system', 'emails'])
    def export(self, system, emails):
        """
            Export the data from the database.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            member = u.getCurrentUser(request)
            if member.email != 'admin@ck12.org':
                c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
                return ErrorCodes().asDict(c.errorCode)

            exp = exporter.Export()
            if system == 'True':
                log.info('system[%s]' % system)
                tableDict = exp.getSystem()
            elif emails != '':
                #log.debug('emails[%s]' % emails)
                tableDict = exp.getMembers(emails=emails)
            else:
                tableDict = exp.getAll()

            result['response']['tables'] = tableDict
            return result
        except Exception, e:
            log.error('export Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.FORMAT_NOT_SUPPORTED
            return ErrorCodes().asDict(c.errorCode, str(e))
