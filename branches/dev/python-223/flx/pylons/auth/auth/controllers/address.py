import logging

from pylons import tmpl_context as c

from auth.controllers import decorators as d
from auth.controllers.errorCodes import ErrorCodes
from auth.lib.base import BaseController
from auth.model import api

log = logging.getLogger(__name__)

class AddressController(BaseController):

    @d.jsonify()
    @d.trace(log, ['zip', 'city', 'state'])
    def getZipCodeInfo(self, zip=None, city=None, state=None):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            zipCodes = api.getZipCodeInfo(zip=zip, city=city, state=state)
            zips = []
            for zipCode in zipCodes:
                zips.append(zipCode.asDict())
            result['response']['zipCodes'] = zips
            return result
        except Exception, e:
            log.error('getZipCodeInfo: Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.CANNOT_UPDATE_ARTIFACT
            return ErrorCodes().asDict(c.errorCode, str(e))
