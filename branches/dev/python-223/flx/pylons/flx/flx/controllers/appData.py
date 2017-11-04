from flx.controllers import decorators as d
from flx.controllers.mongo.base import MongoBaseController 
from flx.model.userdata import appuserdata
from flx.controllers.errorCodes import ErrorCodes
import flx.controllers.user as u
from pylons import request

import logging
import json

log = logging.getLogger(__name__)

class AppdataController(MongoBaseController):
    """
        App Data related APIs.
    """

    @d.jsonify()
    @d.checkAuth(request, False, False, ['appName'])
    @d.trace(log, ['appName', 'member'])
    def getUserData(self, appName, member):
        result = self.getResponseTemplate(ErrorCodes.OK, 0)
        try:
            member = u.getImpersonatedMember(member)
            ud = appuserdata.UserData(self.db).getUserData(memberID=member.id, appName=appName)
            if not ud:
                raise Exception("Could not find userdata for app[%s], memberID[%s]" % (appName, member.id))
            result['response'] = ud
            return result
        except Exception as e:
            log.error("getUserData exception[%s]" % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.NO_SUCH_USERDATA, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, False, ['appName'])
    @d.trace(log, ['appName', 'member'])
    def saveUserData(self, appName, member):
        result = self.getResponseTemplate(ErrorCodes.OK, 0)
        try:
            member = u.getImpersonatedMember(member)
            if not appName:
                raise Exception("Missing appName")
            userData = None
            if request.params.get("userdata"):
                userData = request.params.get("userdata")   
            elif request.body:
                userData = request.body
            if not userData:    
                raise Exception('Cannot save empty userdata')
            kwargs = {'appName': appName, 'memberID': member.id}
            kwargs['userdata'] = json.loads(userData)
            result['response'] = appuserdata.UserData(self.db).saveUserData(**kwargs)
            return result
        except Exception as e:
            log.error("saveUserData exception[%s]" % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.CANNOT_SAVE_USERDATA, str(e))
