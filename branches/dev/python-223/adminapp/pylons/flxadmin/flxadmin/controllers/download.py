from flxadmin.lib.base import BaseController
from pylons import response, config

import logging
import os
import traceback

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

    def download_and_remove(self, filename):
        try:
            csvShareDir = config.get('cache_share_dir_csv') + '/csv/'
            path = os.path.join(csvShareDir, filename)
            log.info("Path: %s" % path)
            if not os.path.exists(path):
                raise Exception((_(u'Invalid csv path.')).encode("utf-8"))
            
            data = self.__download(path)
            os.remove(path)
            return data
        except Exception, e:
            log.error('download and remove file Exception[%s]: %s' % (str(e), path))
            response.status_int = 404
            return ''
