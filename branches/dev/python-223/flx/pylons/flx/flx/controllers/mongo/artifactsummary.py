import logging
import traceback

from flx.controllers import decorators as d
from flx.controllers.errorCodes import ErrorCodes
from flx.controllers.mongo.base import MongoBaseController
from flx.model.exceptions import MissingArgumentException, AlreadyExistsException, NotFoundException, InvalidArgumentException

from flx.model.mongo import artifactsummary

log = logging.getLogger(__name__)

class ArtifactsummaryController(MongoBaseController):
    """
        Artifact Summary APIs.
    """
    def __init__(self, **kwargs):
        MongoBaseController.__init__(self, **kwargs)
        
#
    #  Get Artifact Similarity
    #
    @d.jsonify()
    @d.trace(log, ['artifactID'])
    def getArtifactSummary(self, artifactID):
        """
            Returns summary for the given artifactID
        """
        try:
            result = MongoBaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            kwargs = {}

            if not artifactID:
                raise MissingArgumentException((_(u'artifactID is missing.')).encode("utf-8"))

            if artifactID:
                kwargs['artifactID'] = int(artifactID)

            artifactSummary = artifactsummary.ArtifactSummary(self.db).getArtifactSummary(**kwargs) or {}            
            result['response'] = artifactSummary
            return result
        except Exception, e:
            log.error('Error in getting artifact summary: [%s]' %(str(e)))
            errorCode = ErrorCodes.CAN_NOT_GET_ARTIFACT_SUMMARY
            log.error(traceback.format_exc(e))
            return ErrorCodes().asDict(errorCode, str(e))
