import json
import logging
import zlib

from pylons import request, tmpl_context as c

from flx.controllers import decorators as d
from flx.controllers.errorCodes import ErrorCodes
from flx.model.mongocache.artifactCache import ArtifactCache as AC
import flx.lib.helpers as h

log = logging.getLogger(__name__)

class ArtifactCache:
    """
    """
    def __init__(self, db=None):
        self.db = db
        self.ac = AC(self.db)

    def getArtifactCache(self, id, revID=0):        
        """
            Get the artifact cache.
        """
        log.debug('getArtifactCache: id[%s]' % id)
        log.debug('getArtifactCache: revID[%s]' % revID)
        artifactCacheDict = self.ac.getArtifact(id=id, revID=revID)
	    
        if not artifactCacheDict:
	    return None

        if not revID:
            ## Also available, artifactCache['namespace'], artifactCache['key']
            revID = artifactCacheDict['value']
            log.debug('getArtifactCache: revID[%s]' % revID)
            artifactCacheDict = self.ac.getArtifact(id=id, revID=revID)

        artifactCache = zlib.decompress(artifactCacheDict['value'][0])
        artifactCache = json.loads(artifactCache)
        artifactCacheDict['value'] = artifactCache
        log.debug('getArtifactCache: artifactCacheDict%s' % artifactCacheDict)
        return artifactCacheDict

    def putArtifactCache(self, id, revID, namespace, artifactDict, isLatest=True):
        """
            Update the artifact cache.
        """
        log.debug('putArtifactCache: id[%s]' % id)
        log.debug('putArtifactCache: revID[%s]' % revID)
        log.debug('putArtifactCache: namespace[%s]' % namespace)
        log.debug('putArtifactCache: isLatest[%s]' % isLatest)
        
        s = json.dumps(artifactDict, default=h.toJson, ensure_ascii=False).encode('utf-8')
        
        log.debug('putArtifactCache: s[%s]' % s)
        value = [ zlib.compress(s), True ]
        log.debug('putArtifactCache: value[%s]' % value)
        
        return self.ac.putArtifact(id, revID, namespace, value, isLatest)

    def removeArtifactCache(self, id, revID=0, namespace=None):
        log.debug('removeArtifactCache: id[%s]' % id)
        log.debug('removeArtifactCache: revID[%s]' % revID)
        
        if not namespace or revID == 0:
            artifactCacheDict = self.ac.getArtifact(id, revID)
            
            if not artifactCacheDict:
                return None

            if not namespace:
                namespace = artifactCacheDict.get('namespace')

            if not revID:
                #remove the document 0
                self.ac.removeArtifact(id, revID, namespace)
                revID = artifactCacheDict['value']

        log.debug('removeArtifactCache: namespace[%s], revID[%s]' % (namespace, revID))
        #remove the document with the actual revisionID
        return self.ac.removeArtifact(id, revID, namespace)

    #method to remove the complete artifact from the cache, Removes all the revisions
    def removeCompleteArtifactCache(self, id, namespace=None):
        log.debug('removeCompleteArtifactCache: id[%s]' % id)

        #if namespace is not passed, get the namespace under which the artifact is stored by accessng it's 0th revision, if the 0th revision is also not found, just ignore
        if not namespace :
            artifactCacheDict = self.ac.getArtifact(id, 0)
            if artifactCacheDict :
                namespace = artifactCacheDict.get('namespace')
                return self.ac.removeCompleteArtifact(id, namespace)
            else :
                return None
        else :
            return self.ac.removeCompleteArtifact(id, namespace)

