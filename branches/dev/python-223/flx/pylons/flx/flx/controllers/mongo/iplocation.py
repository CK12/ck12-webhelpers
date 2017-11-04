import logging

from pylons import tmpl_context as c
from pylons import request

from flx.controllers.errorCodes import ErrorCodes
from flx.controllers import decorators as d
from flx.controllers.mongo.base import MongoBaseController
from flx.model.mongo.iplocation import IPLocation

log = logging.getLogger(__name__)

class IplocationController(MongoBaseController):
    """
    """
    def __init__(self, **kwargs):
        MongoBaseController.__init__(self, **kwargs)
        self.il = IPLocation(self.db)

    @d.jsonify()
    @d.trace(log)
    def getIPLocation(self):        
        """Get the ip location.
        """
        try:    
            result = MongoBaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            client_ip = request.params.get('client_ip')
            ip_location = self.il.getIPLocation(client_ip)
            result['response']['location'] = ip_location
            return result
        except Exception, e:
            log.error('getIPLocation Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.GENERIC_ERROR
            return ErrorCodes().asDict(c.errorCode, str(e))
