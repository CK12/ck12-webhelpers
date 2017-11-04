import logging
import traceback

from pylons import request

from flx.model import api
from flx.controllers.mongo.base import MongoBaseController
from flx.controllers import decorators as d
from flx.controllers.errorCodes import ErrorCodes
from flx.model.exceptions import MissingArgumentException, AlreadyExistsException, NotFoundException, InvalidArgumentException

from flx.model.mongo import artifactsimilarity
from flx.controllers.common import ArtifactCache

log = logging.getLogger(__name__)

class ArtifactsimilarityController(MongoBaseController):
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
    def getArtifactSimilarity(self, artifactID, artifactRevisionID=None):
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

            if artifactRevisionID:
                kwargs['artifactRevisionID'] = int(artifactRevisionID)

            artifactSimilarity = artifactsimilarity.ArtifactSimilarity(self.db).getArtifactSimilarity(**kwargs) or {}
            if not artifactSimilarity:
                artifactDict, artifact = ArtifactCache().load(artifactID)
                if artifact.creatorID == 3:
                    artifactSimilarity['sourceArtifactID'] = artifactID
                    if artifact.type.name == 'section':
                        artifactSimilarity['sourceEncodedID'] = 'section'
                    artifactSimilarity['similarity'] = 1.0
                    artifactSimilarity['isCK12Artifact'] = True
            if artifactSimilarity:
                sourceArtifactID = artifactSimilarity['sourceArtifactID']
                encodedID = artifactSimilarity.get('sourceEncodedID', '')
                sequence = None
                if encodedID.lower() == 'section':
                    log.info('Artifact with artifactID: [%s] is a section. Get artifactRoot to construct book perma' %(sourceArtifactID))
                    try:
                        artifactRoot = api.getArtifactRoot(artifactID=sourceArtifactID)
                        log.info('Artifact Root for artifactID: [%s] is [%s]' %(sourceArtifactID, artifactRoot))
                        if len(artifactRoot) == 2:
                            bookArtifactID = artifactRoot[1][0]
                            sequence = str(artifactRoot[1][2]) + '.' + str(artifactRoot[0][2])
                            sourceArtifactID = bookArtifactID
                        else:
                            log.error('Unable to find the correct root to artifact!')
                    except Exception as artifactRootEx:
                        log.error('Error while getting the artifactRoot')
                        log.error(traceback.format_exc(artifactRootEx))
                if not artifactSimilarity.get('isCK12Artifact', False):
                    artifactDict, artifact = ArtifactCache().load(sourceArtifactID)
                artifactDict.pop('xhtml', None)
                artifactDict.pop('xhtml_prime', None)
                artifactDict.pop('revisions', None)
                artifactSimilarity['artifact'] = artifactDict
                if sequence:
                    artifactSimilarity['sequence'] = sequence
            result['response'] = artifactSimilarity
            return result
        except NotFoundException, nfe:
            log.debug('getArtifactSimilarity: Not Found Exception[%s] traceback' %(traceback.format_exc()))
            errorCode = ErrorCodes.NO_SUCH_ARTIFACT_SIMILARITY
            return ErrorCodes().asDict(errorCode, str(nfe))
        except Exception, e:
            log.error('Error in getting artifact similarity: [%s]' %(str(e)))
            errorCode = ErrorCodes.CAN_NOT_GET_ARTIFACT_SIMILARITY
            log.error(traceback.format_exc(e))
            return ErrorCodes().asDict(errorCode, str(e))

    #
    #  Create Artifact Similarity
    #
    @d.jsonify()
    #@d.checkAuth(request, False, False, ['encodedID'])
    @d.trace(log, ['artifactID', 'artifactRevisionID'])
    def createArtifactSimilarity(self, artifactID, artifactRevisionID):
        """
            Create Artifact Similarity for given artifactID and artifactRevisionID
        """
        try:
            result = MongoBaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            kwargs = {}

            sourceArtifactID = request.params.get('sourceArtifactID', None)
            sourceArtifactRevisionID = request.params.get('sourceArtifactRevisionID', None)

            similarity = request.params.get('similarity', None)

            if not sourceArtifactID:
                raise MissingArgumentException((_(u'sourceArtifactID is missing.')).encode("utf-8"))
            if not sourceArtifactRevisionID:
                raise MissingArgumentException((_(u'sourceArtifactRevisionID is missing.')).encode("utf-8"))
            if not similarity:
                raise MissingArgumentException((_(u'similarity is missing.')).encode("utf-8"))

            if request.params.has_key('sourceEncodedID'):
                kwargs['sourceEncodedID'] = request.params['sourceEncodedID']

            kwargs['artifactID'] = int(artifactID)
            kwargs['artifactRevisionID'] = int(artifactRevisionID)
            kwargs['sourceArtifactID'] = int(sourceArtifactID)
            kwargs['sourceArtifactRevisionID'] = int(sourceArtifactRevisionID)
            kwargs['similarity'] = similarity

            result['response'] = artifactsimilarity.ArtifactSimilarity(self.db).createArtifactSimilarity(**kwargs)
            return result
        except AlreadyExistsException, aee:
            log.debug('createArtifactSimilarity: Exception in creating artifact similarity: [%s] traceback' % (traceback.format_exc()))
            errorCode = ErrorCodes.ARTIFACT_SIMILARITY_ALREADY_EXIST
            return ErrorCodes().asDict(errorCode, str(aee))
        except MissingArgumentException, mae:
            log.debug('createArtifactSimilarity: Exception in creating artifact similarity: [%s] traceback' % (traceback.format_exc()))
            errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
            return ErrorCodes().asDict(errorCode, str(mae))
        except InvalidArgumentException, iae:
            log.debug('createArtifactSimilarity: Exception in create artifact similarity: [%s] traceback' % (traceback.format_exc()))
            errorCode = ErrorCodes.INVALID_ARGUMENT
            return ErrorCodes().asDict(errorCode, str(iae))
        except Exception, e:
            log.error('Error in creating artifact similarity: [%s]' %(str(e)))
            errorCode = ErrorCodes.CAN_NOT_CREATE_ARTIFACT_SIMILARITY
            log.error(traceback.format_exc(e))
            return ErrorCodes().asDict(errorCode, str(e))

    #
    #  Update Artifact Similarity
    #
    @d.jsonify()
    #@d.checkAuth(request, False, False, ['encodedID'])
    @d.trace(log, ['artifactID', 'artifactRevisionID'])
    def updateArtifactSimilarity(self, artifactRevisionID, artifactID=None):
        """
            Update Artifact Similarity for given artifactID and artifactRevisionID
        """
        try:
            result = MongoBaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            kwargs = {}

            sourceArtifactID = request.params.get('sourceArtifactID', None)
            sourceArtifactRevisionID = request.params.get('sourceArtifactRevisionID', None)

            if request.params.has_key('sourceEncodedID'):
                kwargs['sourceEncodedID'] = request.params['sourceEncodedID']

            similarity = request.params.get('similarity', None)

            if not sourceArtifactID:
                raise MissingArgumentException((_(u'sourceArtifactID is missing.')).encode("utf-8"))
            if not sourceArtifactRevisionID:
                raise MissingArgumentException((_(u'sourceArtifactRevisionID is missing.')).encode("utf-8"))
            if not similarity:
                raise MissingArgumentException((_(u'similarity is missing.')).encode("utf-8"))

            if artifactID:
                kwargs['artifactID'] = int(artifactID)
            kwargs['artifactRevisionID'] = int(artifactRevisionID)
            kwargs['sourceArtifactID'] = int(sourceArtifactID)
            kwargs['sourceArtifactRevisionID'] = int(sourceArtifactRevisionID)
            kwargs['similarity'] = similarity

            result['response'] = artifactsimilarity.ArtifactSimilarity(self.db).updateArtifactSimilarity(**kwargs)
            return result
        except NotFoundException, nfe:
            log.debug('updateArtifactSimilarity: Not Found Exception[%s] traceback' %(traceback.format_exc()))
            errorCode = ErrorCodes.NO_SUCH_ARTIFACT_SIMILARITY
            return ErrorCodes().asDict(errorCode, str(nfe))
        except MissingArgumentException, mae:
            log.debug('updateArtifactSimilarity: Exception in update artifact similarity: [%s] traceback' % (traceback.format_exc()))
            errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
            return ErrorCodes().asDict(errorCode, str(mae))
        except InvalidArgumentException, iae:
            log.debug('updateArtifactSimilarity: Exception in update artifact similarity: [%s] traceback' % (traceback.format_exc()))
            errorCode = ErrorCodes.INVALID_ARGUMENT
            return ErrorCodes().asDict(errorCode, str(iae))
        except Exception, e:
            log.error('Error in update artifact artifact: [%s]' %(str(e)))
            errorCode = ErrorCodes.CAN_NOT_UPDATE_ARTIFACT_SIMILARITY
            log.error(traceback.format_exc(e))
            return ErrorCodes().asDict(errorCode, str(e))
