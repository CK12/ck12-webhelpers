import logging
import traceback
import base64, json

from pylons import request, response, tmpl_context as c
from pylons.i18n.translation import _ 
from pylons import app_globals as g

from flx.controllers import decorators as d
from flx.lib.base import BaseController, render
import flx.lib.helpers as h
from flx.model import exceptions as ex

from flx.controllers.errorCodes import ErrorCodes

log = logging.getLogger(__name__)

class RosettaController(BaseController):

    @d.trace(log)
    def getSample(self):
        return render('/flx/rosetta/sample.xhtml')

    @d.trace(log)
    def get(self):
        """
            Return the Rosetta 2.0 XML Schema file.
        """
        response.content_type = 'application/xml'
        return render('/flx/rosetta/2_0.xsd')

    @d.trace(log)
    def validateForm(self):
        c.prefix = self.prefix
        return render('/flx/rosetta/upload.html')

    @d.jsonify()
    @d.trace(log)
    def validate(self):
        """
            Validate the uploaded file.
        """

        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        errors = None
        contents = ''
        info = {}
        try:
            if request.POST.has_key('xhtml'):
                contents = request.POST['xhtml'].strip()
            if len(contents) == 0:
                if request.POST.has_key('file'):
                    try:
                        fromFile = request.POST['file']
                        contents = fromFile.file.read()
                    finally:
                        fromFile.file.close()

            info['xhtml'] = contents
            contents = h.transform_to_xhtml(contents, validateRosetta=False)
            info['xhtml'] = contents

            xv = g.getXhtmlValidator()
            if xv.validate(contents):
                result['response']['result'] = 'Validated'
                result['response']['xhtml'] = info['xhtml']
            else:
                errors = xv.errors
                raise Exception((_(u'Errors in validation')).encode("utf-8"))
            return result
        except Exception, e:
            log.error("XHTML: \n%s" % info['xhtml'])
            log.error('validate rosetta Exception[%s]' % str(e))
            log.error('validate rosetta traceback[%s]' % (traceback.format_exc()))
            c.errorCode = ErrorCodes.VALIDATION_FAILED
            if errors:
                info['errors'] = errors
            return ErrorCodes().asDict(c.errorCode, str(e), infoDict=info)

    @d.jsonify()
    @d.trace(log)
    def validateXhtmlList(self):
        """
            Validate list of xhtml sent from ajax post.
        """
        #data = {'xhtmlList':['<p>data2</p>','<p>data33</p>']}
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        errors = []
        contentsList = []
        contents = ''
        info = {}
        try:
            if request.method == 'POST':
                if request.content_type == 'text/plain':
                    try:
                        payload = base64.b64decode(request.body)
                    except TypeError:
                        log.warn("Error decoding request body.")
                else:
                    raise ex.InvalidContentTypeException(u"contentType : [{contentType}] content in the request body is not supported.".format(contentType=request.content_type).encode('utf-8'))                
                if payload:
                    json_acceptable_string = payload.replace('"', "\"")
                    try:
                        contentsList = json.loads(json_acceptable_string)
                    except (ValueError, TypeError) as vte:
                        log.error("Invalid JSON.", exc_info=vte)
                        raise ex.InvalidContentTypeException("Invalid JSON.")
                    if contentsList:
                        for contents in contentsList:
                            info['xhtml'] = contents
                            contents = h.transform_to_xhtml(contents, validateRosetta=False)
                            info['xhtml'] = contents
                            xv = g.getXhtmlValidator()
                            if xv.validate(contents):
                                errors.append(['valid'])
                                result['response']['result'] = 'Validated'
                            else:
                                errors.append(xv.errors)
                                xv.errors = []
                    if errors:
                        result['response']['result'] = 'Validated'
                        result['response']['validations'] = errors
            return result
        except ex.InvalidContentTypeException as icte:
            return ErrorCodes().asDict(ErrorCodes.VALIDATION_FAILED, str(icte))
        except Exception, e:
            log.error("XHTML: \n%s" % info['xhtml'])
            log.error('validate rosetta Exception[%s]' % str(e))
            log.error('validate rosetta traceback[%s]' % (traceback.format_exc()))
            c.errorCode = ErrorCodes.VALIDATION_FAILED
            if errors:
                info['errors'] = errors
            return ErrorCodes().asDict(c.errorCode, str(e), infoDict=info)
