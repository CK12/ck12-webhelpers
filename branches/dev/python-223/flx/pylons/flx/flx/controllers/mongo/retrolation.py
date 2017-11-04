import logging
import traceback

from pylons import request

from flx.model import api
from flx.lib import helpers as h
from flx.controllers.mongo.base import MongoBaseController
from flx.controllers import decorators as d
from flx.controllers.errorCodes import ErrorCodes
from flx.model.exceptions import MissingArgumentException, AlreadyExistsException, NotFoundException, InvalidArgumentException

from flx.model.mongo import artifactsimilarity
from flx.controllers.common import ArtifactCache

log = logging.getLogger(__name__)

class RetrolationController(MongoBaseController):
    """
        Artifact Similary APIs.
    """
    def __init__(self, **kwargs):
        MongoBaseController.__init__(self, **kwargs)

#
    #  Get Artifact Similarity
    #
    @d.jsonify()
    @d.trace(log, ['artifactID', 'artifactRevisionID'])
    def getRetrolation(self, artifactID, artifactRevisionID=None):
        """
            Returns similarity and CK-12 artifact info for the given artifactID and optional artifactRevisionID
        """
        try:
            result = MongoBaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            kwargs = {}

            if not artifactID and not artifactRevisionID:
                raise MissingArgumentException((_(u'artifactID or artifactRevisionID is missing.')).encode("utf-8"))

            if artifactID:
                kwargs['artifactID'] = int(artifactID)

            retrolated_concept = self.db.Retrolation.find_one({'section_artifact_id':  kwargs['artifactID']})
            if not retrolated_concept or (retrolated_concept.has_key('skip') and retrolated_concept['skip']):
                retrolated_concept = {}
            result['response'] = retrolated_concept
            result['response']['recommendationID'] = h.getRandomString(31)

            return result
        except NotFoundException, nfe:
            log.debug('getRetrolation: Not Found Exception[%s] traceback' %(traceback.format_exc()))
            errorCode = ErrorCodes.NO_SUCH_ARTIFACT_SIMILARITY
            return ErrorCodes().asDict(errorCode, str(nfe))
        except Exception, e:
            log.error('Error in getting artifact similarity: [%s]' %(str(e)))
            errorCode = ErrorCodes.CAN_NOT_GET_ARTIFACT_SIMILARITY
            log.error(traceback.format_exc(e))
            return ErrorCodes().asDict(errorCode, str(e))
