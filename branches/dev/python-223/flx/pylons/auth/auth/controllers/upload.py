import csv
import json
import logging
import os

from tempfile import NamedTemporaryFile, mkstemp

from pylons import request, config, tmpl_context as c
from pylons.i18n.translation import _ 

from auth.controllers import decorators as d
from auth.model.uploadStudents import UploadUsers as uu
from auth.lib.base import BaseController, render
from auth.lib.unicode_util import UnicodeWriter
import auth.lib.helpers as h

from auth.controllers.errorCodes import ErrorCodes

log = logging.getLogger(__name__)

class UploadController(BaseController):

    @d.jsonify()
    @d.checkAuth(request, False, False, ['prefix'])
    @d.trace(log, ['member', 'prefix'])
    def uploadStudents(self, member, prefix=None):
        """
        Upload the student information from a CSV file.
        Each row of the file is as follows:

             email address (if empty, construct a -+
             fake one based on prefix and student  |
             id)                                   |
                  user name for logging in (if not given, -+
                  generate one based on prefix and student |
                  id)                              |       |
                          password for logging in (if not given,  -+
                          generate one based on prefix and student |
                          id)                      |       |       |
        +----+------------+-----------+----------+-v-----+-v-----+-v--------+
        | id | first name | last name | birthday | email | login | password |
        +-^--+-^----------+-^---------+-^--------+-------+-------+----------+
          |    |            |           +- birthday of the student
          |    |            +- last name of the student
          |    +- first name of the student
          +- student id

        If the CSV file is not given, the student data can be provided in the
        'data' param that is in json format with 'students' as the key and the
        list of rows described above as value.
        """

        log.debug('uploadStudents: request.params[%s]' % request.params)
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        csvFilePath = None
        try:
            if not prefix:
                prefix = request.params.get('prefix', None)
                if not prefix:
                    raise Exception((_(u'Missing prefix.')).encode("utf-8"))
            log.info('uploadStudents: prefix[%s]' % prefix)
            if request.params.has_key('file'):
                #
                #  Save the file to temp location.
                #
                csvFilePath = h.saveUploadedFile(request, 'file', dir=config.get('cache_share_dir'))
                log.info('uploadStudents: csvFilePath[%s]' % csvFilePath)
            elif request.params.get('data'):
                data = request.params.get('data')
                data = json.loads(data)
                if not data.get('students'):
                    raise Exception((_(u'Missing students key.')).encode("utf-8"))
                students = data['students']
                #
                #  Create the temp file.
                #
                file = NamedTemporaryFile(suffix='.csv', dir=config.get('cache_share_dir'), delete=False)
                csvFilePath = file.name
                #
                #  Fill the temp file with data.
                #
                try:
                    writer = UnicodeWriter(file)
                    for row in students:
                        row = row.split(',')
                        writer.writerow(row)
                finally:
                    file.close()
                log.info('uploadStudents: Created csvFilePath: %s' % csvFilePath)
            else:
                raise Exception((_(u'CSV File or JSON formatted data required.')).encode("utf-8"))

            fd, logFilePath = mkstemp(suffix='.log', dir=config.get('cache_share_dir'), text=True)
            log.info('uploadStudents: logFilePath[%s]' % logFilePath)
            url = config.get('sqlalchemy.url')
            log.info('uploadStudents: url[%s]' % url)
            uploader = uu(url, True)
            uploader.process(csvFilePath, logFilePath, prefix)
            logs = []
            file = os.fdopen(fd)
            try:
                reader = csv.reader(file, delimiter=',', quotechar='"')
                for row in reader:
                    logs.append(row)
            finally:
                file.close()
            os.remove(csvFilePath)
            os.remove(logFilePath)
            result['response'] = {
                'prefix': prefix,
                'log': logs,
            }
            return result
        except Exception, e:
            log.error('upload student data from CSV Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.CANNOT_UPLOAD_DATA
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.checkAuth(request, True, True)
    @d.trace(log)
    def uploadStudentsForm(self):
        c.prefix = self.prefix
        return render('/auth/member/uploadStudents.html')
