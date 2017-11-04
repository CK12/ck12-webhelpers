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

class TagtermController(BaseController):
    """
        Tag Term related APIs.
    """

    #
    #  Get related APIs.
    #
    @d.jsonify()
    @d.trace(log, ['id'])
    def get(self, id):
        """ Get information about a tagTerm """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            tagTerm = api.getTagTermByIDOrName(idOrName=id)
            if not tagTerm:
                raise Exception((_(u'No tag term of %(id)s')  % {"id":id}).encode("utf-8"))
            result['response'] = tagTerm.asDict()
            return result
        except Exception, e:
            log.error('get tagTermInfo Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.NO_SUCH_TAG_TERM
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log)
    def create(self):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        name = request.POST['name']
        try:
            tagTerm = api.createTagTerm(name=name)
	    result['response']['id'] = tagTerm.id
	    result['response']['name'] = tagTerm.name
            return result
        except Exception, e:
            log.error('create tag term Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.CANNOT_CREATE_TAG_TERM
	    try:
                tagTerm = api.getTagTermByName(name=name)
		if tagTerm is not None:
		    infoDict = {
                        'id': tagTerm.id,
                        'name': tagTerm.name
                    }
	    except Exception:
		infoDict = None
            return ErrorCodes().asDict(c.errorCode, message=str(e), infoDict=infoDict)
        
    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log, ['member'])
    def getTagTermsByMemberID(self, member):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            data = api.getTagTermsDictForMembers(memberID=member.id)
            
            searchTagTerm = request.params.get('searchTagTerm', None)
            searchData = []
            if searchTagTerm:
                for tagTerm in data:
                    if searchTagTerm in tagTerm['term']:
                        searchData.append(tagTerm)
            else:
                searchData = data
            result['response'] = searchData
            return result
        except Exception, e:
            log.error('get tagTermInfo Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.NO_TAG_TERM
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log, ['member'])
    def createAssociation(self, member):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            artifactID = int(request.POST['artifactID'])
            artifact = api.getArtifactByID(id=artifactID)
            tagTermID = int(request.POST['tagTermID'])
            artifactHasTagTerms = api.createArtifactHasTagTerm(artifactID=artifactID, tagTermID=tagTermID)
            api.invalidateArtifact(ArtifactCache(), artifact, memberID=member.id)
            ## Call the reindex method
            taskId = h.reindexArtifacts([artifactID], member.id)
            log.info("Task id for reindex: %s" % taskId)
            return result
        except Exception, e:
            log.error('create tag term association Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.CANNOT_CREATE_TAG_TERM_ASSOCIATION
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log, ['member'])
    def deleteAssociation(self, member):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            artifactID = int(request.POST['artifactID'])
            artifact = api.getArtifactByID(id=artifactID)
            tagTermID = int(request.POST['tagTermID'])
            api.deleteArtifactHasTagTerm(artifactID=artifactID, tagTermID=tagTermID)
            api.invalidateArtifact(ArtifactCache(), artifact, memberID=member.id)
            ## Call the reindex method
            taskId = h.reindexArtifacts([artifactID], member.id)
            log.info("Task id for reindex: %s" % taskId)
            return result
        except Exception, e:
            log.error('delete tag term association Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.CANNOT_DELETE_TAG_TERM_ASSOCIATION
            return ErrorCodes().asDict(c.errorCode, str(e))

