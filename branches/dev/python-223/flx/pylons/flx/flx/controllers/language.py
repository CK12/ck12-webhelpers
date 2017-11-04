from pylons import request
from flx.controllers import decorators as d
from flx.model import api
from flx.lib.base import BaseController

from flx.controllers.errorCodes import ErrorCodes
import logging

log = logging.getLogger(__name__)

class LanguageController(BaseController):
    """
        Language related APIs.
    """

    @d.jsonify()
    @d.setPage(request)
    @d.trace(log, ['pageNum', 'pageSize'])
    def getLanguages(self, pageNum, pageSize):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            languages = api.getLanguages(pageNum=pageNum, pageSize=pageSize)
            result['response'] = {
                    'languages': [ l.asDict() for l in languages ],
                    'total':languages.getTotal(),
                    'limit': len(languages),
                    'offset': (pageNum - 1) * pageSize
                    }
            return result
        except Exception, e:
            log.error('get languages Exception[%s]' % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.CANNOT_GET_LANGUGAGES, str(e))

