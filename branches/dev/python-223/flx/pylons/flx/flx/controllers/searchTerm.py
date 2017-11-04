import logging
from pylons.i18n.translation import _ 
from pylons import request, tmpl_context as c
from flx.controllers import decorators as d
from flx.controllers.errorCodes import ErrorCodes
from flx.controllers.common import ArtifactCache
from flx.lib.base import BaseController
import flx.lib.helpers as h
from flx.model import api

log = logging.getLogger(__name__)

class SearchtermController(BaseController):
    """
        Search Term related APIs.
    """

    #
    #  Get related APIs.
    #
    @d.jsonify()
    @d.trace(log, ['id'])
    def get(self, id):
        """ Get information about a searchTerm """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            searchTerm = api.getSearchTermByIDOrName(idOrName=id)
            if not searchTerm:
                raise Exception((_(u'No search term of %(id)s')  % {"id":id}).encode("utf-8"))
            result['response'] = searchTerm.asDict()
            return result
        except Exception, e:
            log.error('get searchTermInfo Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.NO_SUCH_SEARCH_TERM
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log)
    def create(self):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        name = request.POST['name']
        try:
            searchTerm = api.createSearchTerm(name=name)
	    result['response']['id'] = searchTerm.id
	    result['response']['name'] = searchTerm.name
            return result
        except Exception, e:
            log.error('create search term Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.CANNOT_CREATE_SEARCH_TERM
	    try:
                searchTerm = api.getSearchTermByName(name=name)
		if searchTerm is not None:
		    infoDict = {
                        'id': searchTerm.id,
                        'name': searchTerm.name
                    }
	    except Exception:
		infoDict = None
            return ErrorCodes().asDict(c.errorCode, message=str(e), infoDict=infoDict)

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log, ['member'])
    def createAssociation(self, member):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            artifactID = int(request.POST['artifactID'])
            artifact = api.getArtifactByID(id=artifactID)
            searchTermID = int(request.POST['searchTermID'])
            artifactHasSearchTerms = api.createArtifactHasSearchTerm(artifactID=artifactID, searchTermID=searchTermID)
            api.invalidateArtifact(ArtifactCache(), artifact, memberID=member.id)
            ## Call the reindex method
            taskId = h.reindexArtifacts([artifactID], member.id)
            log.info("Task id for reindex: %s" % taskId)
            return result
        except Exception, e:
            log.error('create search term association Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.CANNOT_CREATE_SEARCH_TERM_ASSOCIATION
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log, ['member'])
    def deleteAssociation(self, member):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            artifactID = int(request.POST['artifactID'])
            artifact = api.getArtifactByID(id=artifactID)
            searchTermID = int(request.POST['searchTermID'])
            api.deleteArtifactHasSearchTerm(artifactID=artifactID, searchTermID=searchTermID)
            api.invalidateArtifact(ArtifactCache(), artifact, memberID=member.id)
            ## Call the reindex method
            taskId = h.reindexArtifacts([artifactID], member.id)
            log.info("Task id for reindex: %s" % taskId)
            return result
        except Exception, e:
            log.error('delete search term association Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.CANNOT_DELETE_SEARCH_TERM_ASSOCIATION
            return ErrorCodes().asDict(c.errorCode, str(e))

