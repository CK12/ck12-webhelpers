import logging

from pylons import request, tmpl_context as c
from pylons.i18n.translation import _ 
from pylons import app_globals as g

from auth.controllers import decorators as d
from auth.controllers.errorCodes import ErrorCodes
from auth.lib.base import BaseController
from auth.model import exceptions as ex
from auth.model import api
from auth.model import model

import auth.controllers.user as u

log = logging.getLogger(__name__)

class CacheController(BaseController):

    @d.jsonify()
    @d.checkAuth(request, False, False, ['name'])
    @d.trace(log, ['member', 'name'])
    def invalidateGlobals(self, member, name):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            if not u.isMemberAdmin(member):
                log.debug('invalidateGlobals: not admin')
                raise ex.UnauthorizedException((_(u'Only admin can invalidate cache.')).encode("utf-8"))

            func = getattr(g, name)
            if not func:
                raise Exception((_(u'No such function: %(name)s')  % {"name":name}).encode("utf-8"))

            from pylons import cache
            from pylons.decorators.cache import create_cache_key

            namespace, key = create_cache_key(func)
            cache.get_cache(namespace).remove(key)
            result['response']['invalidated'] = name
            return result
        except ex.UnauthorizedException, ue:
            log.error('invalidateGlobals: Exception[%s]' % str(ue), exc_info=ue)
            c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
            return ErrorCodes().asDict(c.errorCode, str(ue))
        except Exception, e:
            log.error('invalidateGlobals: Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.CANNOT_INVALIDATE_CACHE
            return ErrorCodes().asDict(c.errorCode, str(e))


    @d.jsonify()
    @d.checkAuth(request, False, False, ['id'])
    @d.trace(log, ['member', 'id'])
    def invalidateMember(self, member, id):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            if not u.isMemberAdmin(member):
                log.debug('invalidateMember: not admin')
                raise ex.UnauthorizedException((_(u'Only admin can invalidate cache.')).encode("utf-8"))

            member = api.getMemberByID(id=id)
            if not member:
                raise Exception((_(u'No such member: %(id)s')  % {"id":id}).encode("utf-8"))

            email = member.email
            member = member.cache(model.INVALIDATE, instance=member)
            result['response']['invalidated'] = email
            return result
        except ex.UnauthorizedException, ue:
            log.error('invalidateMember: Exception[%s]' % str(ue), exc_info=ue)
            c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
            return ErrorCodes().asDict(c.errorCode, str(ue))
        except ex.NotFoundException, nfe:
            log.error('invalidateMember: Exception[%s]' % str(nfe), exc_info=nfe)
            c.errorCode = ErrorCodes.NO_SUCH_MEMBER
            return ErrorCodes().asDict(c.errorCode, str(nfe))
        except Exception, e:
            log.error('invalidateMember: Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.CANNOT_INVALIDATE_CACHE
            return ErrorCodes().asDict(c.errorCode, str(e))
