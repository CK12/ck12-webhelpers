import logging
import simplejson

from pylons import request, response, session, tmpl_context as c
from pylons.controllers.util import abort
from sqlalchemy.sql import select

from flx.controllers import decorators as d
from flx.model import meta
from flx.model import api
from flx.lib.base import BaseController, render
import flx.lib.helpers as h

from flx.controllers.errorCodes import ErrorCodes

log = logging.getLogger(__name__)

def application(environ, startResponse):
    return app(environ, startResponse)

class UploadController(BaseController):
    prefix = '/tmp/uploads/'

    def file(self, id):
        c.type = id
        c.prefix = self.prefix
        return render('/flx/upload/upload.html')

    def chapterForm(self):
        return self.file('chapter')

    @d.jsonify()
    @d.checkAuth(request, True)
    @d.trace(log, ['id', 'member'])
    def artifact(self, type=None):
        """
            Uploads an artifact of the given type.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        return save(type)


    def save(self, type):
        import os
        import shutil

        if type is None:
            type = request.params['type']
        fromFile = request.POST['file']
        path = os.path.join(self.prefix, fromFile.filename.lstrip(os.sep))
        file = open(path, 'w')
        try:
            shutil.copyfileobj(fromFile.file, file)
        finally:
            fromFile.file.close()
            file.close()
        return simplejson.dumps(ErrorCodes().asDict(ErrorCodes.OK))
