from flx.controllers import decorators as d
from flx.controllers.mongo.base import MongoBaseController 
from flx.model import exceptions as ex
from pylons import request
from pylons.i18n.translation import _
from flx.controllers.errorCodes import ErrorCodes
import flx.controllers.user as u
from flx.model.mongo.forumssequence import ForumsSequence

import logging
import json

log = logging.getLogger(__name__)

__controller__ = 'FourmsSequenceController'


class FourmsSequenceController(MongoBaseController):
    """
    Public Forums Sequence related APIs
    """

    @d.jsonify()
    @d.setPage(request)
    @d.trace(log, ['pageNum', 'pageSize'])
    def getForumsSequence(self, pageNum, pageSize):
        result = self.getResponseTemplate(ErrorCodes.OK, 0)
        try:
            forums_sequence = ForumsSequence(self.db).getForumsSequence()
            result['response']['forums_sequence'] = forums_sequence
            return result
        except Exception as e:
            log.error('getForumsSequence Exception[%s]' % str(e), exc_info=e)
            return ErrorCodes().asDict(
                ErrorCodes.CANNOT_GET_FORUMS_SEQUENCE, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, True)
    @d.trace(log, ['member'])
    def updateForumsSequence(self, member):
        result = self.getResponseTemplate(ErrorCodes.OK, 0)
        try:
            params = request.json_body
            forums_sequence = params.get('forums_sequence')
            if not forums_sequence:
                raise Exception("Missing required parameter: forums_sequence")

            if not u.isMemberAdmin(member):
                raise ex.UnauthorizedException(
                    (_(u'%(member.name)s is not authorized.')
                     % {"member.name": member.fix().name}).encode("utf-8"))

            if not isinstance(forums_sequence, list):
                raise ex.InvalidArgumentException(
                    "Invalid input for forums_sequence, expected list")

            result['response'] = ForumsSequence(self.db).update(
                forums_sequence=forums_sequence)
            return result
        except Exception as e:
            log.error("updateForumsSequence exception[%s]"
                      % str(e), exc_info=e)
            return ErrorCodes().asDict(
                ErrorCodes.CANNOT_UPDATE_FORUMS_SEQUENCE, str(e))

