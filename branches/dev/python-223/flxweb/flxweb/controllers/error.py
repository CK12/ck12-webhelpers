#
# Copyright 2007-2011 CK-12 Foundation
#
# All rights reserved
#
#
# Unless required by applicable law or agreed to in writing, software
# distributed under this License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
# implied.  See the License for the specific language governing
# permissions and limitations.
#
# This file originally written by Ravi Gidwani
#
# $Id$

import cgi

from paste.urlparser import PkgResourcesParser
from pylons.middleware import error_document_template
from webhelpers.html.builder import literal

from flxweb.lib.base import BaseController
from pylons.templating import render_jinja2
from datetime import datetime
from pylons import tmpl_context as c
from flxweb.model.browseTerm import BrowseManager
import logging

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
        c.orig_request = request.environ.get('pylons.original_request')
#        content = literal(resp.body) or cgi.escape(request.GET.get('message', ''))
#        page = error_document_template % \
#            dict(prefix=request.environ.get('SCRIPT_NAME', ''),
#                 code=cgi.escape(request.GET.get('code', str(resp.status_int))),
#                 message=content)
#        return page
        c.now = datetime.now()
        c.subjects = BrowseManager.get_subjects()
        logging.getLogger(__name__).debug('Error ID:%s' % c.now)
        if request and resp:
            code = request.GET.get('code', str(resp.status_int))
            logging.getLogger(__name__).debug('[%s] %s ' %( code, c.orig_request.path))
        else:
            code = '404'
            logging.getLogger(__name__).debug('[%s] %s ' %( code, request.path))

        if code == '404':
            return render_jinja2('/errors/404.html')
        elif code == '408':
            return render_jinja2('/errors/408.html')
        else:
            return render_jinja2('/errors/500.html')

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
