import logging

from pylons import request, tmpl_context as c
from pylons.i18n.translation import _ 
from pylons import app_globals as g

from flx.controllers import decorators as d
from flx.controllers.common import ArtifactCache, BrowseTermCache, RelatedArtifactCache
from flx.controllers.errorCodes import ErrorCodes
from flx.lib.base import BaseController
from flx.model import exceptions as ex
from flx.model import api
#from flx.model import model
import flx.lib.helpers as h

import flx.controllers.user as u

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
    def invalidateArtifact(self, member, id):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            artifact = api.getArtifactByID(id=id)
            if not artifact:
                raise Exception((_(u'No such artifact: %(id)s')  % {"id":id}).encode("utf-8"))

            memberID = member.id
            if artifact.creatorID != memberID:
                if not u.isMemberAdmin(member):
                    log.debug('invalidateArtifact: not admin')
                    raise ex.UnauthorizedException((_(u'Only admin can replace contents of others.')).encode("utf-8"))
                memberID = None

            recursive = str(request.params.get('recursive')).lower() == 'true'
            name = artifact.name
            api.invalidateArtifact(cache=ArtifactCache(), artifact=artifact, memberID=memberID, recursive=recursive, clearPrePost=True)
            result['response']['invalidated'] = name
            return result
        except ex.UnauthorizedException, ue:
            log.error('invalidateArtifact: Exception[%s]' % str(ue), exc_info=ue)
            c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
            return ErrorCodes().asDict(c.errorCode, str(ue))
        except ex.NotFoundException, nfe:
            log.error('invalidateArtifact: Exception[%s]' % str(nfe), exc_info=nfe)
            c.errorCode = ErrorCodes.NO_SUCH_ARTIFACT
            return ErrorCodes().asDict(c.errorCode, str(nfe))
        except Exception, e:
            log.error('invalidateArtifact: Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.CANNOT_UPDATE_ARTIFACT
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, False, ['id'])
    @d.trace(log, ['member', 'id'])
    def invalidateArtifactRevision(self, member, id):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            artifactRevision = api.getArtifactRevisionByID(id=id)
            if not artifactRevision:
                raise Exception((_(u'No such artifactRevision: %(id)s')  % {"id":id}).encode("utf-8"))

            artifact = artifactRevision.artifact
            if not artifact:
                artifact = api.getArtifactByID(id=artifactRevision.artifactID)

            memberID = member.id
            if artifact.creatorID != memberID:
                if not u.isMemberAdmin(member):
                    log.debug('invalidateArtifact: not admin')
                    raise ex.UnauthorizedException((_(u'Only admin can replace contents of others.')).encode("utf-8"))
                memberID = None

            recursive = str(request.params.get('recursive')).lower() == 'true'
            name = artifact.name
            api.invalidateArtifact(cache=ArtifactCache(), artifact=artifact, revision=artifactRevision, memberID=memberID, recursive=recursive)
            result['response']['invalidated'] = '%s:%s' % (artifact.id, artifactRevision.id)
            return result
        except ex.UnauthorizedException, ue:
            log.error('invalidateArtifact: Exception[%s]' % str(ue), exc_info=ue)
            c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
            return ErrorCodes().asDict(c.errorCode, str(ue))
        except ex.NotFoundException, nfe:
            log.error('invalidateArtifact: Exception[%s]' % str(nfe), exc_info=nfe)
            c.errorCode = ErrorCodes.NO_SUCH_ARTIFACT
            return ErrorCodes().asDict(c.errorCode, str(nfe))
        except Exception, e:
            log.error('invalidateArtifact: Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.CANNOT_UPDATE_ARTIFACT
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, False, ['id'])
    @d.trace(log, ['member', 'id'])
    def invalidateMember(self, member, id):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            if not u.isMemberAdmin(member):
                log.debug('invalidateMember: not admin')
                raise ex.UnauthorizedException((_(u'Only admin can replace contents.')).encode("utf-8"))

            member = api.getMemberByID(id=id)
            if not member:
                raise Exception((_(u'No such member: %(id)s')  % {"id":id}).encode("utf-8"))

            email = member.email
            #member = member.cache(model.INVALIDATE, instance=member)
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
            c.errorCode = ErrorCodes.CANNOT_UPDATE_MEMBER
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, False, ['id'])
    @d.trace(log, ['member', 'id'])
    def invalidateBrowseTerm(self, member, id):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            if not u.isMemberAdmin(member):
                log.debug('invalidateMember: not admin')
                raise ex.UnauthorizedException((_(u'Only admin can replace contents.')).encode("utf-8"))

            browseTerm = api.getBrowseTermByID(id=id)
            if not browseTerm:
                browseTerm = api.getBrowseTermByEncodedID(encodedID=h.formatEncodedID(id))
            if not browseTerm:
                raise Exception((_(u'No such browseTerm: %(id)s')  % {"id":id}).encode("utf-8"))

            editorID = g.getCK12EditorID()
            if not editorID:
                raise Exception(_(u'No ck12editor member').encode("utf-8"))

            term = browseTerm.asDict(includeParent=False)
            if browseTerm.type.name in ['domain', 'pseudodomain']:
                api.invalidateRelatedArtifacts(RelatedArtifactCache(), domainID=browseTerm.id, memberID=editorID)
                api.invalidateRelatedArtifacts(RelatedArtifactCache(), domainID=browseTerm.id, memberID=member.id)
                ## Clear Artifacts if any
                ras = api.getRelatedArtifactsForDomains(domainIDs=[browseTerm.id])
                log.info("Invalidating %d artifacts" % len(ras))
                for ra in ras:
                    artifact = api.getArtifactByID(id=ra.id)
                    if artifact:
                        api.invalidateArtifact(ArtifactCache(), artifact=artifact, memberID=member.id, clearRelatedArtifacts=False)
            api.invalidateBrowseTerm(BrowseTermCache(), browseTermID=browseTerm.id, memberID=editorID)
            api.invalidateBrowseTerm(BrowseTermCache(), browseTermID=browseTerm.id, memberID=member.id)
            recursive = str(request.params.get('recursive')).lower() == 'true'
            if recursive:
                desc = api.getBrowseTermDescendants(id=browseTerm.id)
                for d in desc:
                    api.invalidateRelatedArtifacts(RelatedArtifactCache(), domainID=d.id, memberID=editorID)
                    api.invalidateRelatedArtifacts(RelatedArtifactCache(), domainID=d.id, memberID=member.id)
                    api.invalidateBrowseTerm(BrowseTermCache(), browseTermID=d.id, memberID=editorID)
                    api.invalidateBrowseTerm(BrowseTermCache(), browseTermID=d.id, memberID=member.id)
                result['response']['invalidatedCount'] = len(desc) + 1
            result['response']['invalidated'] = term
            result['response']['recursive'] = str(recursive)
            return result
        except ex.UnauthorizedException, ue:
            log.error('invalidateBrowseTerm: Exception[%s]' % str(ue), exc_info=ue)
            c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
            return ErrorCodes().asDict(c.errorCode, str(ue))
        except ex.NotFoundException, nfe:
            log.error('invalidateBrowseTerm: Exception[%s]' % str(nfe), exc_info=nfe)
            c.errorCode = ErrorCodes.NO_SUCH_BROWSE_TERM
            return ErrorCodes().asDict(c.errorCode, str(nfe))
        except Exception, e:
            log.error('invalidateBrowseTerm: Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.CANNOT_INVALIDATE_CACHE
            return ErrorCodes().asDict(c.errorCode, str(e))
