import logging
import traceback

from pylons import request, tmpl_context as c

from flx.controllers.mongo.base import MongoBaseController
from flx.controllers import decorators as d
from flx.controllers.errorCodes import ErrorCodes

from flx.model.mongo import relatedartifacts

log = logging.getLogger(__name__)

class RelatedartifactsController(MongoBaseController):
    """
        Concept Related Artifacts APIs.
    """
    def __init__(self, **kwargs):
        MongoBaseController.__init__(self, **kwargs)

#
    #  Get Related Artifacts
    #
    @d.jsonify()
    @d.trace(log, ['encodedID'])
    def getRelatedArtifacts(self, encodedID=None):
        """
            Get RelatedArtifacts for the given concept EID
        """
        try:
            result = MongoBaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            kwargs = {}

            encodedID = request.params.get('encodedID', encodedID)
            if not encodedID:
                raise Exception('encodedID not specified')
            kwargs['encodedID'] = encodedID


            result['response']['artifact'] = relatedartifacts.RelatedArtifacts(self.db).getRelatedArtifact(**kwargs)
            return result
        except Exception, e:
            log.error('Error in getting related artifacts: [%s]' %(str(e)))
            c.errorCode = ErrorCodes.CANNOT_GET_RELATEDARTIFACTS
            log.error(traceback.format_exc(e))
            return ErrorCodes().asDict(c.errorCode, str(e))

    #
    #  Create Related Artifacts
    #
    @d.jsonify()
    @d.checkAuth(request, False, False, ['encodedID'])
    @d.trace(log, ['encodedID'])
    def createRelatedArtifacts(self, encodedID=None):
        """
            Created RelatedArtifacts for the given concept EID
        """
        try:
            result = MongoBaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            kwargs = {}

            encodedID = request.params.get('encodedID', encodedID)
            if not encodedID:
                raise Exception('encodedID not specified')
            kwargs['encodedID'] = encodedID


            result['response']['artifact'] = relatedartifacts.RelatedArtifacts(self.db).createRelatedArtifact(**kwargs)
            return result
        except Exception, e:
            log.error('Error in creating related artifacts: [%s]' %(str(e)))
            c.errorCode = ErrorCodes.CANNOT_CREATE_RELATEDARTIFACTS
            log.error(traceback.format_exc(e))
            return ErrorCodes().asDict(c.errorCode, str(e))

