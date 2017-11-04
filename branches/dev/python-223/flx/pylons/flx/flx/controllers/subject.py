from pylons import request, tmpl_context as c, config
from flx.controllers import decorators as d
from flx.model import api
from flx.lib.base import BaseController, render
import flx.lib.helpers as h

from flx.controllers.errorCodes import ErrorCodes
import logging

log = logging.getLogger(__name__)

class SubjectController(BaseController):
    """
        Subject related APIs.
    """

    @d.jsonify()
    @d.trace(log)
    def getSubjects(self):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            subjects_page = api.getSubjects()
            if subjects_page is None or not subjects_page.results:
                raise Exception((_(u'No subjects found')))
            result['response']['subjects'] = [ s.asDict() for s in subjects_page.results ]
            return result
        except Exception, e:
            log.error('get subjects Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.CANNOT_GET_SUBJECTS
            return ErrorCodes().asDict(c.errorCode, str(e))
