import logging

from pylons import request, tmpl_context as c
from pylons import config

from flx.controllers import decorators as d
from flx.controllers.errorCodes import ErrorCodes
from flx.controllers.mongo.base import MongoSessionBaseController
from flx.model.mongosession import MongoSession
import flx.controllers.user as u

log = logging.getLogger(__name__)

class SessionController(MongoSessionBaseController):
    """
    """
    @d.jsonify()
    @d.checkAuth(request, False, False)
    @d.trace(log, ['member'])
    def clearUserSessions(self, member):        
        """
            Clear the user sessions
        """
        try:    
            result = MongoSessionBaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            if not self.db:
                raise Exception("Cannot clear user sessions - no session db defined.")
            userID = member.id
            if u.isMemberSuperAdmin(member) and request.params.get('userID'):
                userID = request.params.get('userID')
            cookieName = config.get("beaker.session.key")
            cookieVal = request.cookies.get(cookieName)
            MongoSession(self.db).clearSessionsForUser(userID=userID, preserveList=[cookieVal[-32:]])
            return result
        except Exception, e:
            log.error('clearUserSessions: Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.GENERIC_ERROR
            return ErrorCodes().asDict(c.errorCode, str(e))

