import logging

from pylons import request, tmpl_context as c
from pylons import app_globals as g

from flx.controllers import decorators as d
from flx.controllers.common import ArtifactCache
from flx.model import api
from flx.lib.base import BaseController, render
import flx.lib.helpers as h
import flx.controllers.user as u
from flx.lib.search import solrclient

from flx.controllers.errorCodes import ErrorCodes

log = logging.getLogger(__name__)

class FeaturedController(BaseController):
    """
        Featured related APIs.
    """

    @d.jsonify()
    @d.setPage(request, ['type'])
    @d.trace(log, ['type', 'pageNum', 'pageSize'])
    def get(self, pageNum, pageSize, type=None):
        """
            Returns the featured artifact list.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            member = u.getCurrentUser(request, anonymousOkay=False)
            memberID = member.id if member is not None else None

            featuredList = api.getFeaturedArtifacts(typeName=type,
                                                    pageNum=pageNum,
                                                    pageSize=pageSize)
            featuredInfo = []
            if featuredList is not None and len(featuredList) > 0:
                for featured in featuredList.results:
                    id = featured.id
                    artifactDict, artifact = ArtifactCache().load(id, memberID=memberID)
                    featuredInfo.append({
                                            'artifact': artifactDict,
                                            'order': featured.listOrder,
                                            'comments': featured.comments,
                                        })
            result['response']['total'] = featuredList.getTotal()
            result['response']['limit'] = len(featuredList)
            result['response']['offset'] = (pageNum - 1)*pageSize
            result['response']['result'] = featuredInfo
            return result
        except Exception, e:
            log.error('get featured artifacts Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.CANNOT_GET_FEATURED_ARTIFACT_LIST
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.sortable(request, ['term', 'types', 'rtype' ])
    @d.setPage(request, ['term', 'types', 'rtype', 'sort'])
    @d.trace(log, ['term', 'types', 'rtype', 'sort', 'pageNum', 'pageSize'])
    def getFeaturedArtifactsByTag(self, pageNum, pageSize, sort, term, types=None, rtype='minimal'):
        """
            Returns the featured artifact list.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            typeNames = None
            if types:
                typeNames = [ x.strip() for x in types.lower().split(',') ]
            if not rtype:
                rtype = 'info'
            infoOnly = True if rtype == 'info' else False
            minimalOnly = True if rtype == 'minimal' else False

            featuredArtifacts = self._getFeaturedArtifactsByTag(
                    term=term,
                    typeNames=typeNames,
                    sort=sort,
                    pageNum=pageNum,
                    pageSize=pageSize,
                    infoOnly=infoOnly,
                    minimalOnly=minimalOnly)

            result['response'] = featuredArtifacts
            return result
        except Exception, e:
            log.error('get featured artifacts Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.CANNOT_GET_FEATURED_ARTIFACT_LIST
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.ck12_cache_region('weekly')
    def _getFeaturedArtifactsByTag(self, term, typeNames, sort, pageNum, pageSize, infoOnly, minimalOnly):
        start = (pageNum-1) * pageSize
        log.info("Page number: %d, page size: %d" % (pageNum, pageSize))
        sort = solrclient.getSortOrder(sort)
        hits = api.getFeaturedArtifactsByInternalTag(term=term, typeNames=typeNames, sort=sort, start=start, rows=pageSize)
        artifacts = []
        hitList = hits['artifactList']
        artifactList = [art for art in hitList if art['id'] > 0]
        for aid in artifactList:
            try:
                aDict, a = ArtifactCache().load(aid['id'], infoOnly=infoOnly, minimalOnly=minimalOnly)
                if aDict:
                    if aDict.has_key('relatedArtifacts'):
                        del aDict['relatedArtifacts']
                    artifacts.append(aDict)
            except Exception as ae:
                log.warn("Error loading artifact: %s" % str(ae))

        artifactDict = {
                        'total': hits['numFound'],
                        'limit': len(hits['artifactList']),
                        'offset': start,
                        'result': artifacts,
                       }
        return artifactDict

    #
    #  Create related APIs.
    #
    def _create(self):
        artifacts = api.getArtifacts()
        c.artifactKeys = []
        c.artifactDict = {}
        for artifact in artifacts:
            key = artifact.type.name + ':' + artifact.name
            c.artifactKeys.append(key)
            c.artifactDict[key] = artifact.id
        c.artifactKeys = sorted(c.artifactKeys)
        member = u.getCurrentUser(request)
        c.userName = member.fix().name
        c.prefix = self.prefix
        return render('/flx/featured/createForm.html')

    @d.checkAuth(request, True, True)
    @d.trace(log)
    def createForm(self):
        return self._create()

    @d.jsonify()
    @d.checkAuth(request, True)
    @d.trace(log)
    def create(self):
        """
            Features an artifact.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            member = u.getCurrentUser(request)
            if member.id != 1:
                c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
                return ErrorCodes().asDict(c.errorCode)

            id = request.params['id']
            artifact = g.ac.getArtifact(id)
            id = artifact.id
            order = request.params['order']
            hasComments = request.params.has_key('comments')
            comments = request.params['comments'] if hasComments else None
            api.createFeaturedArtifact(artifactID=id,
                                       listOrder=order,
                                       comments=comments)
            result['response']['featured'] = { 'artifactID': id, 'order': order, 'comments': comments }
            #
            #  Reindex
            #
            taskId = h.reindexArtifacts([id])
            log.debug("Featured: reindex[%s] Task id: %s" % (id, taskId))
            return result
        except Exception, e:
            log.error('add featured artifact Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.CANNOT_CREATE_FEATURED_ARTIFACT
            return ErrorCodes().asDict(c.errorCode, str(e))

    #
    #  Update related APIs.
    #
    def _update(self, id):
        artifact = api.getArtifactByID(id=id)
        id = artifact.id
        featured = api.getFeaturedArtifact(artifactID=id)
        c.typeName = artifact.type.name
        c.artifactID = id
        c.artifactName = artifact.name
        c.order = featured.listOrder
        c.comments = featured.comments
        member = u.getCurrentUser(request)
        c.userName = member.fix().name
        c.prefix = self.prefix
        return render('/flx/featured/updateForm.html')

    @d.checkAuth(request, True, True, ['id'])
    @d.trace(log, ['id'])
    def updateForm(self, id):
        return self._update(id)

    @d.jsonify()
    @d.checkAuth(request, True, False, ['id'])
    @d.trace(log, ['id'])
    def update(self, id):
        """
            Updates a featured artifact.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            member = u.getCurrentUser(request)
            if member.id != 1:
                c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
                return ErrorCodes().asDict(c.errorCode)

            order = request.params['order']
            artifact = g.ac.getArtifact(id)
            id = artifact.id
            featured = api.getFeaturedArtifact(artifactID=id)
            featured.listOrder = order
            hasComments = request.params.has_key('comments')
            comments = request.params['comments'] if hasComments else None
            featured.comments = comments
            api.update(instance=featured)
            result['response']['featured'] = { 'artifactID': id, 'order': order, 'comments': comments }
            #
            #  Reindex
            #
            taskId = h.reindexArtifacts([id])
            log.debug("Featured: reindex[%s] Task id: %s" % (id, taskId))
            return result
        except Exception, e:
            log.error('update featured artifact Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.CANNOT_CREATE_FEATURED_ARTIFACT
            return ErrorCodes().asDict(c.errorCode, str(e))

    #
    #  Delete related APIs.
    #
    @d.jsonify()
    @d.checkAuth(request, True, False, ['id'])
    @d.trace(log, ['id'])
    def delete(self, id):
        """
            Deletes the given eatured artifact identified by id.
        """
        c.errorCode = ErrorCodes.OK
        try:
            member = u.getCurrentUser(request)
            if member.id != 1:
                c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
                return ErrorCodes().asDict(c.errorCode)

            artifact = g.ac.getArtifact(id)
            id = artifact.id
            featured = api.getFeaturedArtifact(artifactID=id)
            if featured is None:
                c.errorCode = ErrorCodes.NO_SUCH_FEATURED_ARTIFACT
                return ErrorCodes().asDict(c.errorCode, 'Featured artifact %s not found.' % id)

            c.errorCode = ErrorCodes.CANNOT_DELETE_FEATURED_ARTIFACT
            api.deleteFeaturedArtifact(featuredArtifact=featured)
            #
            #  Reindex
            #
            taskId = h.reindexArtifacts([id])
            log.debug("Featured: reindex[%s] Task id: %s" % (id, taskId))
            return ErrorCodes().asDict(ErrorCodes.OK)
        except Exception, e:
            log.error('delete FeaturedArtifact Exception[%s]' % str(e))
            return ErrorCodes().asDict(c.errorCode, str(e))
