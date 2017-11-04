import logging
import simplejson
import os
from tempfile import NamedTemporaryFile
from pylons.i18n.translation import _ 
import traceback

from pylons import request, response, session, config, tmpl_context as c
from pylons.controllers.util import abort
from pylons.decorators.secure import https
from sqlalchemy.sql import select

from flx.controllers import decorators as d
from flx.model import meta
from flx.model import api
from flx.lib.base import BaseController, render
import flx.lib.helpers as h
import flx.lib.translator as translator

from flx.controllers.errorCodes import ErrorCodes

log = logging.getLogger(__name__)

class DownloadController(BaseController):
    fileTypeDict = {
        'gif':      'image/gif',
        'ico':      'image/vnd.microsoft.icon',
        'jpeg':     'image/jpeg',
        'png':      'image/png',
        'svg':      'image/svg+xml',

        'mp4':      'video/mp4',
        'mpeg':     'video/mpeg',
        'ogg':      'video/ogg',

        'doc':      'application/msword',
        'docx':     'application/msword',
        'docbook':  'text/xml',
        'pdf':      'application/pdf',
        'ppt':      'application/ms-powerpoint',
        'pptx':     'application/ms-powerpoint',
        'rar':      'application/x-rar',
        #'xhtml':    'application/xhtml+xml',
        'xhtml':    'text/html', ## So that the user can view it in browser
        'xls':      'application/ms-excel',
        'xlsm':     'application/ms-excel',
        'zip':      'application/zip',

        'css':      'text/css',
        'html':     'text/html',
        'xml':      'text/xml',
        'csv':      'application/vnd.ms-excel',
    }

    def __download(self, path):
        file = None
        try:
            file = open(path, 'rb')
            #
            #  Use the extension to determin the type, if possible.
            #
            ext = path.split('.')[-1].lower()
            if self.fileTypeDict.has_key(ext):
                response.content_type = self.fileTypeDict[ext]
            #
            #  Return the contents.
            #
            return file.read()
        except Exception, e:
            log.error(traceback.format_exc())
            raise e
        finally:
            if file:
                file.close()

    @d.trace(log, ['path'])
    def download(self, path):
        try:
            return self.__download(path)
        except Exception, e:
            log.error('download Exception[%s]: %s' % (str(e), path))
            response.status_int = 404
            return ''

    @d.checkAuth(request, False, True, ['filename', 'format'])
    @d.trace(log, ['filename', 'format'])
    def downloadXdt(self, filename, format=None):
        """
            Download a converted document or docbook from xdt
            Only accepts the filename. The directory and full path
            is not exposed for security reasons.
        """
        try:
            xdtShareDir = config.get('xdt_share_linux')
            path = os.path.join(xdtShareDir, filename)
            log.info("Path: %s" % path)
            if not os.path.exists(path):
                raise Exception((_(u'Invalid path.')).encode("utf-8"))

            ## Convert to requested format
            if path.endswith('.xml') and format == 'xhtml':
                xhtml = translator.get_xhtml(path)
                if xhtml:
                    output = NamedTemporaryFile(suffix='.xhtml', delete=False, dir=xdtShareDir)
                    output.close()
                    h.saveContents(output.name, xhtml)
                    if os.path.exists(output.name):
                        path = output.name
                    else:
                        raise Exception((_(u'No such file: %(os.path.basename(output.name))s')  % {"os.path.basename(output.name)":os.path.basename(output.name)}).encode("utf-8"))
                else:
                    raise Exception((_(u'Conversion to %(format)s failed.')  % {"format":format}).encode("utf-8"))
                
            return self.__download(path)
        except Exception, e:
            log.error('download Exception[%s]: %s' % (str(e), filename))
            response.status_int = 404
            return ''

