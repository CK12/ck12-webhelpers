import logging
import cgi
from datetime import datetime

from paste.urlparser import PkgResourcesParser
from pylons import request, tmpl_context as c
from pylons.controllers.util import forward
#from pylons.middleware import error_document_template
#from pylons.templating import render_jinja2
from webhelpers.html.builder import literal

from auth.lib.base import BaseController, render
from auth.controllers import decorators as d
from auth.controllers.errorCodes import ErrorCodes

log = logging.getLogger(__name__)

class ErrorController(BaseController):

    """Generates error documents as and when they are required.

    The ErrorDocuments middleware forwards to ErrorController when error
    related status codes are returned from the application.

    This behaviour can be altered by changing the parameters to the
    ErrorDocuments middleware in your config/middleware.py file.

    """
    errorCodes = ErrorCodes()

    def document(self, reason=''):
        """Render the error document"""
        resp = request.environ.get('pylons.original_response')
        content = literal(resp.body) or cgi.escape(request.GET.get('message', ''))
        log.debug('%s' % (content))
        #page = error_document_template % \
        #    dict(prefix=request.environ.get('SCRIPT_NAME', ''),
        #         code=cgi.escape(request.GET.get('code', str(resp.status_int))),
        #         message=content)
        #return page
        c.now = datetime.now()
        try:
            import json

            d = json.loads(content)
            status = d['responseHeader']['status']
            message = d['response']['message']
            c.reason = '%s - %s' % (status, message)
        except KeyError, ke:
            #
            #  Error from external.
            #
            c.reason = content
            #log.error('Error: %s, at: [%s]' % (str(ke), c.now), exc_info=ke)
        except ValueError, ve:
            #
            #  Not a json object.
            #
            c.reason = content
            #log.error('Error: %s, at: [%s]' % (str(ve), c.now), exc_info=ve)
        except Exception, e:
            c.reason = content
            log.error('Error: %s, at: [%s]' % (str(e), c.now), exc_info=e)
        code = request.GET.get('code', str(resp.status_int))
        if code == '400':
            return render('%s/errors/400.html' % self.prefix)

        if code == '401':
            return render('%s/errors/401.html' % self.prefix)

        if code == '403':
            return render('%s/errors/403.html' % self.prefix)

        if code == '404':
            return render('%s/errors/404.html' % self.prefix)

        return render('%s/errors/500.html' % self.prefix)


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
