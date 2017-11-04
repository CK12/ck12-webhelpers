import logging
import cgi

from paste.urlparser import PkgResourcesParser
from pylons.middleware import error_document_template
from webhelpers.html.builder import literal

from sts.lib.base import BaseController, render

log = logging.getLogger(__name__)

class ErrorController(BaseController):
    """Generates error documents as and when they are required.

    The ErrorDocuments middleware forwards to ErrorController when error
    related status codes are returned from the application.

    This behaviour can be altered by changing the parameters to the
    ErrorDocuments middleware in your config/middleware.py file.

    """
    def document(self):
        """Render the error document"""
        request = self._py_object.request
        resp = request.environ.get('pylons.original_response')
        content = literal(resp.body) or cgi.escape(request.GET.get('message', ''))
        #page = error_document_template % \
        #    dict(prefix=request.environ.get('SCRIPT_NAME', ''),
        #         code=cgi.escape(request.GET.get('code', str(resp.status_int))),
        #         message=content)
        #return page
        code = request.GET.get('code', str(resp.status_int))
        logging.getLogger(__name__).debug('%s' %(content))
        if code == '400':
            return render('/errors/400.html')
        if code == '401':
            return render('/errors/401.html')
        if code == '403':
            return render('/errors/403.html')
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
        request = self._py_object.request
        request.environ['PATH_INFO'] = '/%s' % path
        return PkgResourcesParser('pylons', 'pylons')(request.environ, self.start_response)
