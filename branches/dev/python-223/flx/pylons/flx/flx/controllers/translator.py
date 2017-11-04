import logging
import re

from pylons import request, response, session, tmpl_context as c, url
from pylons.controllers.util import abort, redirect
from flx.controllers import decorators as d
from flx.lib.base import BaseController, render
from flx.controllers.errorCodes import ErrorCodes
from tidylib import tidy_document
import flx.lib.helpers as h
import flx.lib.translator as translator
from pylons import tmpl_context as c

log = logging.getLogger(__name__)

class TranslatorController(BaseController):

    def __init__(self):
        #If Debug mode is set,All the used Directories/Files will be removed after the intended process is Done
        self.debug_mode = False  

    def xhtmlToDocbookForm(self):
        c.prefix = self.prefix
        return render('/flx/translator/xhtmltodocbook.html')

    @d.jsonify()
    @d.trace(log, ['id'])
    def xhtmlToDocbook(self):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        xhtmlpath = h.saveUploadedFile(request, 'file')
        try:
            chapter_title = request.POST["chapter_title"]
        except Exception:
            chapter_title = None
        xhtmlpath = translator.cleanup(xhtmlpath)
        docbook = translator.get_docbook(xhtmlpath)
        if docbook != None:
            if chapter_title != None:   
                  docbook = translator.add_chapter_title(docbook, chapter_title) 
            result['response']['docbook'] = docbook
            if not self.debug_mode:
                translator.removeTmpDirectories(xhtmlpath)
            return result
        else:
            c.errorCode = ErrorCodes.FORMAT_NOT_SUPPORTED 
            return ErrorCodes().asDict(c.errorCode,'fb2n failed to convert xhtml to docbook, see log') 

    def docbookToXhtmlForm(self):
        c.prefix = self.prefix
        return render('/flx/translator/docbooktoxhtml.html')

    @d.jsonify()
    @d.trace(log, ['id'])
    def docbookToXhtml(self):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        docbookpath = h.saveUploadedFile(request, 'file')
        xhtml = translator.get_xhtml(docbookpath)
        if xhtml != None:  
            result['response']['xhtml'] = xhtml
            if not self.debug_mode:  
                translator.removeTmpDirectories(docbookpath)
            return result
        else:
            c.errorCode = ErrorCodes.FORMAT_NOT_SUPPORTED 
            return ErrorCodes().asDict(c.errorCode,'fb2n failed to convert docbook to xhtml, see log')
 
