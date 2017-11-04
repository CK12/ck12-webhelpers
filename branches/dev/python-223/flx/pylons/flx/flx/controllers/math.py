import logging
import hashlib

from pylons import request, tmpl_context as c
from pylons.i18n.translation import _ 
from pylons.controllers.util import redirect
from pylons.decorators.cache import beaker_cache

from flx.controllers import decorators as d
from flx.lib.base import BaseController
from flx.controllers.celerytasks import mathcache
import flx.controllers.user as u
from flx.controllers.errorCodes import ErrorCodes
import flx.lib.helpers as h

log = logging.getLogger(__name__)

class MathController(BaseController):

    useTask = False

    def _generateCache(self, type, id, target='web'):
        hash = self._generateHash(type, id, target)
        log.debug("Using key: %s" % hash)
        return self._generateCacheAndCache(hash, type, id, target)
    
    def _generateHash(self, type, id, target='web'):
        m = hashlib.sha224()
        m.update(h.safe_encode(id))
        m.update(type)
        m.update(target)
        hash = m.hexdigest()
        return hash

    @beaker_cache(key='hash', expire=31536000, query_args=False)
    def _generateCacheAndCache(self, hash, type, id, target='web'):
        log.debug("Cache miss! Need to check the DB or render equation")
        if id == "":
            id = "Missing formula"  
        member = u.getCurrentUser(request)
        result = None
        if not member:
            raise Exception(h.safe_encode(_(u'Could not get a user - even guest')))
        if self.useTask:
            mc = mathcache.MathCacheTask()
            task = mc.delay(artifactID=None, equation=id, type=type, user=member.id)
            result = task.wait()
        else:
            math = mathcache.MathCacheTask(userID=member.id)
            if type == 'inline':
                result = math.serve_inline_math(id, target)
            elif type == 'block':
                result = math.serve_block_math(id, target)
            elif type == 'alignat':
                result = math.serve_alignat_math(id, target)
        log.info("Result: %s" % result)
        return result


    #@d.trace(log, ['id', 'target'])
    def inline(self, id, target="web"):
        result = self._generateCache('inline', id, target)
        if result[0]:
            redirect(result[1], code=301)
        #else
            #return render problem image

    #@d.trace(log, ['id', 'target'])
    def block(self, id, target="web"):
        result = self._generateCache('block', id, target)
        if result[0]:
            redirect(result[1], code=301)
        #else
            #return render problem image


    #@d.trace(log, ['id', 'target'])
    def alignat(self, id, target="web"):
        result = self._generateCache('block', id, target)
        if result[0]:
            redirect(result[1], code=301)
        #else
            #return render problem image


    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log, ['id', 'member'])
    def makecache(self, member, id=None):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            if not u.isMemberAdmin(member):
                return ErrorCodes().asDict(ErrorCodes.UNAUTHORIZED_OPERATION, 'Only administrator can call this API')
            cache_maker = mathcache.MathCacheTask()
            task = cache_maker.delay(artifactID=id, user=member.id)
            result['response']['task_id'] = task.task_id
            return result
        except Exception, e:
            log.error('Error while creating math cache: %s' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.CANNOT_CREATE_MATH_CACHE
            return ErrorCodes().asDict(c.errorCode, str(e))
