import logging
import traceback
import base64

from pylons import request, tmpl_context as c

from flx.controllers import decorators as d
from flx.lib.profanity_filter.profanity_filter import ProfanityFilter
from flx.lib.base import BaseController
#import flx.controllers.user as u

from flx.controllers.errorCodes import ErrorCodes

log = logging.getLogger(__name__)
seq = 101

class FilterController(BaseController):
    """
        Filter related APIs.
    """

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log)
    def detectProfanity(self):
        """
            Checks for profanity in the input string.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            #user = u.getCurrentUser(request)
            if not request.params.has_key('string'):
                raise Exception('No string found in the request to detect profanity')
            string = request.params['string']
            try:
                string = base64.b64decode(string)
            except TypeError:
                log.warn("Unable to decode payload.")
            PF = ProfanityFilter()
            isProfane, profaneWord = PF.isProfaneBasic(string)
            result['response']['isProfane'] = isProfane
            result['response']['profaneWord'] = profaneWord
            log.info('Is profane words present?: %s' %(result['response']['isProfane']))
            return result
        except Exception, e:
            log.error('Profanity filter Exception[%s]' % str(e))
            log.error('Profanity filter Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = -1
            return ErrorCodes().asDict(c.errorCode, str(e))
