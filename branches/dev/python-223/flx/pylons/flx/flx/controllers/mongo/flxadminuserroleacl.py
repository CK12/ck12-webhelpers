import logging
import traceback
import json

from pylons import request
from pylons.i18n.translation import _

from flx.controllers.mongo.base import MongoBaseController
from flx.controllers import decorators as d
from flx.controllers.errorCodes import ErrorCodes
from flx.model.exceptions import MissingArgumentException, \
                                AlreadyExistsException, \
                                NotFoundException, \
                                InvalidArgumentException, \
                                UnauthorizedException

import flx.controllers.user as u
from flx.model.mongo import flxadminuserroleacl
import base64

log = logging.getLogger(__name__)


class FlxadminuserroleaclController(MongoBaseController):
    """
        Flxadmin acl management related APIs.
    """
    def __init__(self, **kwargs):
        MongoBaseController.__init__(self, **kwargs)

    @d.jsonify()
    @d.checkAuth(request, False, True)
    @d.trace(log, ['member'])
    def get_flxadmin_user_role_acl(self, member):
        """
          Returns user roles and associated allowed routes information
        """
        result = MongoBaseController.getResponseTemplate(self,
                                                         ErrorCodes.OK, 0)
        try:
            if not u.isMemberAdmin(member):
                raise UnauthorizedException(
                    (_(u'%(member.name)s is not authorized.') %
                     {"member.name": member.fix().name}).encode("utf-8"))

            kwargs = {}

            user_acl = flxadminuserroleacl.FlxadminUserRoleAcl(self.db).\
                get_user_role_acl(**kwargs) or {}
            result['response'] = {}
            result['response']['user_acl'] = user_acl
            return result
        except UnauthorizedException, ue:
            log.debug(
                "get_flxadmin_user_acl: Not authorized to access this api",
                traceback.format_exc())
            errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
            return ErrorCodes().asDict(errorCode, str(ue))
        except Exception, e:
            log.error('Error in getting flxadmin_user_acl: [%s]', (str(e)))
            errorCode = ErrorCodes.CAN_NOT_GET_ADMIN_USER_ROLES_ACL
            log.error(traceback.format_exc(e))
            return ErrorCodes().asDict(errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, True)
    @d.trace(log, ['member'])
    def update_flxadmin_user_role_acl(self, member):
        """
            updates allowed routes for given user_role
        """
        result = MongoBaseController.getResponseTemplate(self,
                                                         ErrorCodes.OK, 0)
        try:
            if not u.isMemberAdmin(member):
                raise UnauthorizedException(
                    (_(u'%(member.name)s is not authorized.') %
                     {"member.name": member.fix().name}).encode("utf-8"))

            kwargs = {}

            #Bug - 54974 expect base64 encoded payload.
            if "payload" in request.json_body:
                params = base64.b64decode(request.json_body["payload"])
                params = json.loads(params)

            #params = request.json_body

            user_role = params.get('user_role', None)
            allowed_routes = params.get('allowed_routes', [])

            if not user_role:
                raise MissingArgumentException(
                    (_(u'user_role is missing.')).encode("utf-8"))

            kwargs['user_role'] = user_role
            kwargs['allowed_routes'] = allowed_routes

            _resp = result['response'] = flxadminuserroleacl.\
                FlxadminUserRoleAcl(self.db).update_flxadmin_user_role_acl(**kwargs)

            resp = {}
            if _resp['updatedExisting'] or 'upserted' in _resp:
                resp['isUpdated'] = True
            else:
                resp['isUpdated'] = False

            resp['message'] = _resp.get('err')
            result['response']['user_acl'] = resp
            if "lastOp" in result["response"]:
                if hasattr(result["response"]["lastOp"],"as_datetime"):
                    result["response"]["lastOp"] = result["response"]["lastOp"].as_datetime()
            return result
        except Exception, e:
            log.error('Error in updating flxadmin user acl: [%s]', (str(e)))
            errorCode = ErrorCodes.CAN_NOT_UPDATE_ADMIN_USER_ROLE_ACL
            log.error(traceback.format_exc(e))
            return ErrorCodes().asDict(errorCode, str(e))
