import json
import logging

from pylons import request, tmpl_context as c

from flx.controllers import decorators as d
from flx.controllers.errorCodes import ErrorCodes
from flx.controllers.mongo.base import MongoCacheBaseController
from flx.controllers.mongocache.artifactCache import ArtifactCache

log = logging.getLogger(__name__)

class CacheController(MongoCacheBaseController):
    """
    """
    def __init__(self, **kwargs):
        MongoCacheBaseController.__init__(self, **kwargs)
        self.ac = ArtifactCache(self.db)

    @d.jsonify()
    @d.trace(log, ['id', 'revID'])
    def getArtifactCache(self, id=0, revID=0):        
        """
            Get the artifact cache.
        """
        try:    
            result = MongoCacheBaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            if not id:
                id = request.params.get('id')
            log.debug('getArtifactCache: id[%s]' % id)
            if not revID:
                revID = request.params.get('revID', 0)
            log.debug('getArtifactCache: revID[%s]' % revID)
            artifactCacheDict = self.ac.getArtifactCache(id=id, revID=revID)
            result['response']['cache'] = artifactCacheDict
            return result
        except Exception, e:
            log.error('getArtifactCache: Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.GENERIC_ERROR
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log, ['id', 'revID'])
    def removeArtifactCache(self, id, revID=0):        
        """
            Remove the artifact cache.
        """
        try:    
            result = MongoCacheBaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            log.debug('removeArtifactCache: id[%s]' % id)
            if not revID:
                revID = request.params.get('revID', 0)
            log.debug('removeArtifactCache: revID[%s]' % revID)
            self.ac.removeArtifactCache(id=id, revID=revID)
            result['response']['removed'] = '%s, %s' % (id, revID)
            return result
        except Exception, e:
            log.error('removeArtifactCache: Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.GENERIC_ERROR
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log, ['id', 'revID'])
    def testArtifactCache(self, id=0, revID=0):        
        """
            Get the artifact cache.
        """
        try:    
            result = MongoCacheBaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            if not id:
                id = request.params.get('id')
            log.debug('getArtifactCache: id[%s]' % id)
            if not revID:
                revID = request.params.get('revID', 0)
            log.debug('getArtifactCache: revID[%s]' % revID)
            artifactCacheDict = self.ac.getArtifactCache(id=id, revID=revID)
            if artifactCacheDict:
                namespace = artifactCacheDict['namespace']
                artifactDict = artifactCacheDict['value']
                artifactDict['isDirty'] = True
                self.ac.putArtifactCache(id=artifactDict['artifactID'], revID=artifactDict['artifactRevisionID'], namespace=namespace, artifactDict=artifactDict)
                artifactCacheDict = self.ac.getArtifactCache(id=id, revID=revID)
            result['response']['cache'] = artifactCacheDict
            return result
        except Exception, e:
            log.error('getArtifactCache: Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.GENERIC_ERROR
            return ErrorCodes().asDict(c.errorCode, str(e))
