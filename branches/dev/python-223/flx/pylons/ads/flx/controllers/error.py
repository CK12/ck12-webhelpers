import logging
import cgi

from paste.urlparser import PkgResourcesParser
from pylons import request
from pylons.controllers.util import forward
from pylons.middleware import error_document_template
#from pylons.templating import render_jinja2
from webhelpers.html.builder import literal

from flx.lib.base import BaseController, render
from flx.controllers import decorators as d
from flx.controllers.errorCodes import ErrorCodes

log = logging.getLogger(__name__)

class ErrorController(BaseController):

    """Generates error documents as and when they are required.

    The ErrorDocuments middleware forwards to ErrorController when error
    related status codes are returned from the application.

    This behaviour can be altered by changing the parameters to the
    ErrorDocuments middleware in your config/middleware.py file.

    """
    errorCodes = ErrorCodes()

    def document(self):
        """Render the error document"""
        resp = request.environ.get('pylons.original_response')
        content = literal(resp.body) or cgi.escape(request.GET.get('message', ''))
        #page = error_document_template % \
        #    dict(prefix=request.environ.get('SCRIPT_NAME', ''),
        #         code=cgi.escape(request.GET.get('code', str(resp.status_int))),
        #         message=content)
        #return page
        code = request.GET.get('code', str(resp.status_int))
        logging.getLogger(__name__).debug('%s' %(content))
        if code == '404':
            return render('/errors/404.html')
        else:
            return render('/errors/500.html')


    def img(self, id):
        """Serve Pylons' stock images"""
        return self._serve_file('/'.join(['media/img', id]))

    def style(self, id):
        """Serve Pylons' stock stylesheets"""
        return self._serve_file('/'.join(['media/style', id]))

    def _serve_file(self, path):
        """Call Paste's FileApp (a WSGI application) to serve the file
        at the specified path
        """
        request.environ['PATH_INFO'] = '/%s' % path
        return forward(PkgResourcesParser('pylons', 'pylons'))

    @d.jsonify()
    @d.trace(log, ['id'])
    def info(self, id):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        result['response']['errorCode'] = id
        name, desc = self.errorCodes.getDescription(id)
        result['response']['name'] = name
        result['response']['description'] = desc
        return result
