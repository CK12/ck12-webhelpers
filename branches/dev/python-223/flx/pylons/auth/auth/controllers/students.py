import logging

from pylons import request, config, tmpl_context as c
from pylons.i18n.translation import _ 

from auth.controllers import decorators as d
from auth.controllers.errorCodes import ErrorCodes
from auth.model import utils
from auth.model.students import UploadStudents as us
from auth.lib.base import BaseController
import auth.lib.helpers as h

log = logging.getLogger(__name__)

class StudentsController(BaseController):

    @d.jsonify()
    @d.checkAuth(request, False, False, ['school', 'code', 'grade'])
    @d.trace(log, ['member', 'school', 'code', 'grade'])
    def uploadStudents(self, member, school=None, code=None, grade=None):
        """
        Upload the student information from a CSV file.
        Each row of the file is as follows:

        user name for logging in
            |
            | password for logging in (if not given,
            | generate one based on login)
            |        |
            |        | email address (if empty,
            |        | construct a fake one based ------+
            |        | on login and school              |
            |        |                                  |
            |        |                                  |
            |        |                                  |
            |        |                                  |
        +---v---+----v-----+------------+-----------+---v---+
        | login | password | first name | last name | email |
        +-------+----------+------^-----+-----^-----+-------+
                                  |           |
                                  |           +- last name of the student
                                  +- first name of the student

        If the CSV file is not given, the student data can be provided in the
        'students' param that each row is semicolon (;) separated. The contains
        of each row is described above.
        """

        log.debug('uploadStudents: request.params[%s]' % request.params)
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            if not school:
                school = request.get('school', None)
                if not school:
                    raise Exception((_(u'Missing school info.')).encode("utf-8"))
                school = school.strip()
            if not code:
                code = request.get('code', None)
                if not code:
                    raise Exception((_(u'Missing group code info.')).encode("utf-8"))
                code = code.strip()
            if not grade:
                grade = request.get('grade', None)
                if not grade:
                    raise Exception((_(u'Missing grade info.')).encode("utf-8"))
                grade = grade.strip()
            if request.params.has_key('file'):
                #
                #  Save the file to temp location.
                #
                csvFilePath = h.saveUploadedFile(request, 'file', dir=config.get('cache_share_dir'))
                log.debug('uploadStudents: csvFilePath[%s]' % csvFilePath)
                with open(csvFilePath, 'r') as f:
                    students_s = f.read()
                    log.debug('uploadStudents: students_s[%s]' % students_s)
                delimiter = '\n'
            elif request.params.get('students'):
                students_s = request.params.get('students')
                log.debug('uploadStudents: students_s[%s]' % students_s)
                delimiter = ';'
            else:
                raise Exception((_(u'CSV File or JSON formatted data required.')).encode("utf-8"))
            #
            #  Convert students_s to a list.
            #
            students = students_s.split(delimiter)
            for n in range(0, len(students)):
                students[n] = students[n].split(',')
            log.debug('uploadStudents: students%s' % students)
            #
            #  Validate code and grade on flx side.
            #
            url = '%s/validate/code/%s/grade/%s' % (config.get('flx_prefix_url'), code, grade)
            status, data = self._call(url, method='GET', fromReq=True)
            if status != ErrorCodes.OK:
                raise Exception('%s: %s, %s' % (url, status, data))
            teacherID = data.get('response', {}).get('creatorID', None)
            if not teacherID:
                raise Exception('%s: no teacherID[%s]' % data)
            #
            #  Create students.
            #
            tx = utils.transaction(self.getFuncName())
            with tx as session:
                uploader = us(session)
                mList, midList, lmList = uploader.process(students, teacherID, school)
                log.debug('uploadStudents: mList%s' % mList)
                log.debug('uploadStudents: midList%s' % midList)
                log.debug('uploadStudents: lmList%s' % lmList)
                #
                #  Sync up the flx side.
                #
                if mList:
                    url = '%s/upload/students/code/%s/grade/%s' % (config.get('flx_prefix_url'), code, grade)
                    params = {
                        'students': mList,
                    }
                    status, data = self._call(url, method='POST', params=params, fromReq=True)
                    if status != ErrorCodes.OK:
                        raise Exception('%s: %s, %s' % (url, status, data))

            result['result'] = mList
            result['status'] = lmList
            return result
        except Exception, e:
            log.error('upload student data from CSV Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.CANNOT_UPLOAD_DATA
            return ErrorCodes().asDict(c.errorCode, str(e))
