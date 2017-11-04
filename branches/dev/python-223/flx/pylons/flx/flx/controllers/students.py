import logging
import traceback

from pylons import request, tmpl_context as c
from pylons.i18n.translation import _

from flx.controllers import decorators as d
from flx.controllers.errorCodes import ErrorCodes
from flx.model import students as st
from flx.model import utils
from flx.lib.base import BaseController

log = logging.getLogger(__name__)

class StudentsController(BaseController):

    @d.jsonify()
    @d.checkAuth(request, False, False, ['code', 'grade'])
    @d.trace(log, ['member', 'code', 'grade'])
    def validateGroupAndGrade(self, member, code, grade):

        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            tx = utils.transaction(self.getFuncName())
            with tx as session:
                creatorID = st.validateGroupAndGrade(session, code, grade)
            result['response']['validated'] = True
            result['response']['creatorID'] = creatorID
            return result
        except Exception, e:
            log.error("No such artifact: %s" % id)
            log.error(traceback.format_exc())
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, False, ['code', 'grade'])
    @d.trace(log, ['member', 'code', 'grade'])
    def uploadStudents(self, member, code, grade):

        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        c.errorCode = ErrorCodes.OK
        try:
            students_s = request.params.get('students', None)
            log.debug('uploadStudents: students_s[%s]' % students_s)
            if not students_s:
                c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
                raise Exception((_(u'Missing students.')).encode("utf-8"))

            import ast

            students = ast.literal_eval(students_s)
            log.debug('uploadStudents: students[%s]' % students)
            if not students:
                c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
                raise Exception((_(u'Missing students.')).encode("utf-8"))

            tx = utils.transaction(self.getFuncName())
            with tx as session:
                st.uploadStudents(session, students, code, grade)
            result['response']['uploaded'] = True
            return result
        except Exception, e:
            log.error("Unable to upload students: %s" % id)
            log.error(traceback.format_exc())
            if c.errorCode == ErrorCodes.OK:
                c.errorCode = ErrorCodes.CANNOT_CREATE_MEMBER
            return ErrorCodes().asDict(c.errorCode, str(e))
