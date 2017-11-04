import json
import codecs
import logging

from pylons import config, request, tmpl_context as c
from pylons.i18n.translation import _ 
from pylons import app_globals as g

from flx.controllers import decorators as d
from flx.controllers.mongo.base import MongoBaseController 
from flx.lib.base import BaseController, render
import flx.lib.helpers as h
import flx.controllers.user as u

from flx.controllers.errorCodes import ErrorCodes

log = logging.getLogger(__name__)
__controller__ = 'AskCK12Controller'

class AskCK12Controller(MongoBaseController):
    """
        Artifact get related APIs.
    """
    @d.jsonify()
    @d.trace(log, ['sentence'])
    def askck12(self):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            #fd = codecs.open('/opt/2.0/deploy/components/askck12/output.json', encoding='utf-8')
            #responseDict = json.load(fd)
            result['response'] = {'modalities': [9277, 9279, 1193629]}
            return result
        except Exception, e:
            log.error('Cannot ask questions now. Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.CANNOT_LOAD_MODALITY_DATA
            return ErrorCodes().asDict(c.errorCode, str(e))
