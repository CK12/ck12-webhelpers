import json
import logging
import zlib
import copy
import re, urllib2
import random
import traceback
from base64 import standard_b64decode, standard_b64encode
from pylons import config, request, tmpl_context as c
from pylons.i18n.translation import _ 
from pylons import app_globals as g
from beaker.cache import cache_region
from beaker.cache import region_invalidate
from urllib import unquote
from BeautifulSoup import BeautifulSoup

from flx.model import api, utils
from flx.model import exceptions as ex
from flx.model import model
from flx.model.mongo.collectionNode import CollectionNode
from flx.controllers import decorators as d
import flx.controllers.user as u
import flx.lib.helpers as h
from flx.lib.remoteapi import RemoteAPI
from flx.model.mongo import getDB as getMongoDB

from flx.controllers.errorCodes import ErrorCodes

from flx.controllers.mongocache.artifactCache import ArtifactCache as MongoArtifactCache

log = logging.getLogger(__name__)

SYSTEM_LABELS_ORDER = {'Mathematics': 1, 'Science': 2, 'Others': 3}

global config
if not config.get('flx_home'):
    config = h.load_pylons_config()

class LabelCache(object):

    def __init__(self, session=None):
        self.session = session

    @classmethod
    def labelCache(cls, action, memberID, includeSystem):

        def invalidate(memberID, includeSystem):
            region_invalidate(load, 'forever', 'c-l-m', memberID, includeSystem)
            log.debug('cache: label invalidated key[%d, %s]' % (memberID, includeSystem))

        @cache_region('forever', 'c-l-m')
        def load(memberID, includeSystem):
            labels = api.getMemberLabels(memberID=memberID, includeSystem=includeSystem)
            labels = sorted(labels, key=lambda label: SYSTEM_LABELS_ORDER[label.label] if SYSTEM_LABELS_ORDER.has_key(label.label) and label.systemLabel else 999)
            labelList = []
            for label in labels:
                labelList.append(label.asDict())
            log.debug('cache: label caching key[%d, %s]' % (memberID, includeSystem))
            return labelList

        if action == model.LOAD:
            log.debug('cache: label loading key[%d, %s]' % (memberID, includeSystem))
            labelList = load(memberID, includeSystem)
            log.debug('cache: label cached key[%d, %s]' % (memberID, includeSystem))
            return labelList

        log.debug('cache: label invalidate key[%d, %s]' % (memberID, includeSystem))
        invalidate(memberID, includeSystem)

    @d.trace(log, ['memberID'])
    def invalidate(self, memberID):
        self.labelCache(model.INVALIDATE, memberID, True)
        self.labelCache(model.INVALIDATE, memberID, False)

    @d.trace(log, ['memberID', 'includeSystem'])
    def load(self, memberID, includeSystem):
        return self.labelCache(model.LOAD, memberID, includeSystem)

#Class currently not usable - as return object of the load method is still not serializable
class ArtifactResourceCache(object):
    """
        Caches artifact revision resource level Info for a given revisionID
    """
    artifactResourceCacheNameSpaceSuffix = '|__loadArtifactRevisionResourceList'
    artifactResourceCacheKeyPrefix = 'c-a-r'

    if config.has_key('beaker.cache.artifactresource.compression.enable') and config['beaker.cache.artifactresource.compression.enable'] == 'True' :
        isCompressionEnabled = True
    else :
        isCompressionEnabled = False

    def __init__(self, session=None):
        self.session = session
        
    @classmethod
    def artifactResourceCache(cls, action, artifactRevisionID, session=None, artifactRevisionResourceList=None):

        def __invalidateArtifactRevisionResourceList(artifactRevisionID):
            try:
                artifactRevisionID = long(artifactRevisionID)
            except (ValueError, TypeError) as e:
                raise Exception((_('Unknown type of object received as artifactRevisionID, %s.' % artifactRevisionID)).encode('utf-8'))
            region_invalidate(__loadArtifactRevisionResourceList, 'forever', 'c-a-r', artifactRevisionID)

        def __updateArtifactRevisionResourceList(artifactRevisionID, artifactRevisionResourceList):
            try:
                artifactRevisionID = long(artifactRevisionID)
            except (ValueError, TypeError):
                raise Exception((_('Unknown type of object received as artifactRevisionID, %s.' % artifactRevisionID)).encode('utf-8'))

            if artifactRevisionResourceList:
                from beaker.cache import cache_regions, Cache
                s = json.dumps(artifactRevisionResourceList, default=h.toJson, ensure_ascii=False).encode('utf-8')
                region = cache_regions['forever']
                namespace = __file__ + cls.artifactResourceCacheNameSpaceSuffix 
                key = cls.artifactResourceCacheKeyPrefix+str(artifactRevisionID)
                cache = Cache._get_cache(namespace, region)
                if cls.isCompressionEnabled :
                    c = zlib.compress(s)
                    cache.put(key, [c, True])
                else :
                    cache.put(key, [s, False])

        @cache_region('forever', 'c-a-r')
        def __loadArtifactRevisionResourceList(artifactRevisionID):
            try:
                artifactRevisionID = long(artifactRevisionID)
            except (ValueError, TypeError):
                raise Exception((_('Unknown type of object received as artifactRevisionID, %s.' % artifactRevisionID)).encode('utf-8'))

            if session:
                rList = api._getResourcesFromArtifactRevisionID(session, artifactRevisionID=artifactRevisionID)
            else:
                rList = api.getResourcesFromArtifactRevisionID(artifactRevisionID=artifactRevisionID)

            if not rList :
                log.debug('Empty Object received from the api layer')
                raise Exception((_('Unknown Internal Exception Occured While retreiving the list for the artifactRevisionID, %s.' % artifactRevisionID)).encode('utf-8'))
            else :
                s = json.dumps(rList, default=h.toJson, ensure_ascii=False).encode('utf-8')
                if cls.isCompressionEnabled:
                    c = zlib.compress(s)
                    return [c, True]
                else:
                    return [s, False]

        if action == model.LOAD:
            log.debug('cache: artifactResource loading key[%s]' % artifactRevisionID)
            cachedResult = __loadArtifactRevisionResourceList(artifactRevisionID)
            
            if cachedResult[1] == True:
                s=zlib.decompress(c)
            else:
                s=cachedResult[0]

            if isinstance(s, basestring):
                rList = json.loads(s)
            else :
                rList = s
            log.debug('cache: artifactResource cached key[%s]' % artifactRevisionID)
            return rList

        elif action == model.INVALIDATE:
            log.debug('cache: artifactResource invalidating key[%s]' % artifactRevisionID)
            __invalidateArtifactRevisionResourceList(artifactRevisionID)
            log.debug('cache: artifactResource invalidated key[%s]' % artifactRevisionID)

        elif action == model.UPDATE:
            log.debug('cache: artifactResourceupdating key[%s]' % (artifactRevisionID))
            __updateArtifactRevisionResourceList(artifactRevisionID, artifactRevisionResourceList)
            log.debug('cache: artifactResource updating key[%s]' % (artifactRevisionID))

        else:
           raise Exception((_('Unknown action, %s, received.' % action)).encode('utf-8'))

    @d.trace(log, ['artifactRevisionID'])
    def update(self, artifactRevisionID, artifactRevisionResourceList):
        self.artifactRevisionCache(model.UPDATE, artifactRevisionID, session=self.session, artifactRevisionResourceList=artifactRevisionResourceList)

    @d.trace(log, ['artifactRevisionID'])
    def invalidate(self, artifactRevisionID):
        self.artifactResourceCache(model.INVALIDATE, artifactRevisionID, session=self.session)

    @d.trace(log, ['artifactRevisionID'])
    def load(self, artifactRevisionID):
        return self.artifactResourceCache(model.LOAD, artifactRevisionID, session=self.session)

class PermaCache(object):

    def __init__(self, session=None):
        self.session = session

    @classmethod
    def permaCache(cls, action, handle, typeID, creatorID, version=0):

        def invalidate(hash):
            region_invalidate(load, 'forever', 'c-a-perma', hash)
            log.debug('cache: perma invalidated hash[%s]' % hash)

        @cache_region('forever', 'c-a-perma')
        def load(hash):
            ar = api.getArtifactAndRevisionByHandle(handle=handle, typeID=typeID, creatorID=creatorID, version=version)

            if not ar:
                #
                #  See if the given handle is an old one.
                #
                artifactHandles = api.getArtifactHandles(handle=handle, typeID=typeID, creatorID=creatorID)
                for artifactHandle in artifactHandles:
                    log.debug('permaCache.load: artifactHandle[%s]' % artifactHandle)
                    artifact = api.getArtifactByID(artifactHandle.artifactID)
                    if artifact and artifact.creatorID == creatorID and artifact.artifactTypeID == typeID:
                        ar = api.getArtifactAndRevisionByHandle(handle=artifact.handle, typeID=typeID, creatorID=creatorID, version=version)
                        if ar:
                            #
                            #  Found a match.
                            #
                            break
                if not ar:
                    return None
            if not ar:
                return None
            log.debug('cache: perma caching hash[%s] -> id[%d, %d]' % (hash, ar.id, ar.artifactRevisionID))
            arDict = {
                'id': ar.id,
                'artifactRevisionID': ar.artifactRevisionID,
            }
            ## Do not cache instance of a model object.
            return arDict

        import hashlib

        creatorID = long(creatorID)
        typeID = int(typeID)
        version = int(version)
        m = hashlib.sha224()
        m.update(h.safe_encode(handle.lower()))
        m.update(str(typeID))
        m.update(str(creatorID))
        m.update(str(version))
        hash = m.hexdigest()

        if action == model.LOAD:
            log.debug('cache: perma loading hash[%s] perma[%s, %d, %d, %d]' % (hash, handle, typeID, creatorID, version))
            arDict = load(hash)
            ar = None
            if not arDict:
                invalidate(hash)
            else:
                ar = model.ArtifactAndRevision(**arDict)
                log.debug('cache: perma cached hash[%s] perma[%s, %d, %d, %d] -> id[%d, %d]' % (hash, handle, typeID, creatorID, version, ar.id, ar.artifactRevisionID))
            return ar

        log.debug('cache: perma invalidating hash[%s] perma[%s, %d, %d, %d]' % (hash, handle, typeID, creatorID, version))
        invalidate(hash)

    @d.trace(log, ['handle', 'typeID', 'creatorID', 'version'])
    def invalidate(self, handle, typeID, creatorID, version=0):
        h = handle
        while True:
            handle = unquote(h)
            if handle == h:
                break
            h = handle
        self.permaCache(model.INVALIDATE, handle, typeID, creatorID, version)

    @d.trace(log, ['handle', 'typeID', 'creatorID', 'version'])
    def load(self, handle, typeID, creatorID, version):
        h = handle
        while True:
            handle = unquote(h)
            if handle == h:
                break
            h = handle
        return self.permaCache(model.LOAD, handle, typeID, creatorID, version)

def _getSequenceString(sequenceList):
    return '.'.join([str(x) for x in sequenceList])

class PrePostCache(object):

    def __init__(self, session=None):
        self.session = session

    @classmethod
    def prePostCache(cls, action, ancestorRevision, sequenceList=[], descType=None, memberID=None):

        def invalidate(ancestorRevisionID, sequenceList):
            region_invalidate(load, 'forever', 'c-a-pp', ancestorRevisionID, sequenceList)
            log.debug('cache: prePost invalidated key[%d, %s]' % (ancestorRevisionID, sequenceList))

        @cache_region('forever', 'c-a-pp')
        def load(ancestorRevisionID, sequenceList):
            """
                Get the next and previous artifact for an ancestor and a given sequenceList.
                Also get the next and previous parent for the artifact.
                descType is optional and specifies the type of previous and next artifacts returned
            """

            def _getNeighboringArtifactsBySequence(artifactRevision, sequence, memberID=None):
                """
                    Returns neighboring artifacts by sequence for a given parent artifactRevision
                """
                next = prev = None
                sequence = sequence-1
                nextSeq = sequence + 1
                prevSeq = sequence - 1
                if nextSeq >= 0 and nextSeq < len(artifactRevision.children):
                    child = artifactRevision.children[nextSeq]
                    next = [ child.child.artifactID, child.artifactRevisionID ]

                if prevSeq >= 0 and prevSeq < len(artifactRevision.children):
                    child = artifactRevision.children[prevSeq]
                    prev = [ child.child.artifactID, child.artifactRevisionID ]
            
                return prev, next

            preDict = {'parent': None, 'section': None}
            postDict = {'parent': None, 'section': None}
            ## Get previous and next based on the listing of the artifact's ancestors
            #if len(sequenceList) > 0:
            #    prev, next = _getNeighboringArtifactsBySequence(artifactRevision=ancestorRevision, sequence=sequenceList[0])
            #    preDict['parent'] = { _getSequenceString([sequenceList[0]-1, 0]) : prev }
            #    postDict['parent'] = { _getSequenceString([sequenceList[0]+1, 0]) : next }

            ancestorRevision = api.getArtifactRevisionByID(id=ancestorRevisionID)
            prevNextDict = api.getNeighboringArtifactsSequenceBySequence(artifactRevision=ancestorRevision, 
                                                                         sequenceList=sequenceList,
                                                                         descType='all',
                                                                         memberID=memberID)
            if prevNextDict.has_key('prev-concept'):
                preDict['concept'] = { _getSequenceString(prevNextDict['prev']) : prevNextDict['prev-concept']}
            if prevNextDict.has_key('next-concept'):
                postDict['concept'] = { _getSequenceString(prevNextDict['next']) : prevNextDict['next-concept']}
            if prevNextDict.has_key('prev-lesson'):
                preDict['lesson'] = { _getSequenceString(prevNextDict['prev']) : prevNextDict['prev-lesson']}
            if prevNextDict.has_key('next-lesson'):
                postDict['lesson'] = { _getSequenceString(prevNextDict['next']) : prevNextDict['next-lesson']}
            preDict['section'] = { _getSequenceString(prevNextDict['prev']) : prevNextDict['prev-artifact']}
            postDict['section'] = { _getSequenceString(prevNextDict['next']) : prevNextDict['next-artifact']}
            log.debug('cache: prePost caching key[%d, %s]' % (ancestorRevisionID, sequenceList))
            return preDict, postDict, ancestorRevision.artifact.type.name

        def getArtifactDict(id, rid, memberID=None):
            ## TODO: infoOnly -> minimalOnly (done)
            artifactDict, artifact = ArtifactCache().load(id, rid, memberID=memberID, minimalOnly=True)
            if artifactDict.has_key('pre'):
                del artifactDict['pre']
            if artifactDict.has_key('post'):
                del artifactDict['post']
            return artifactDict

        ancestorRevisionID = ancestorRevision.id
        if action == model.LOAD:
            log.debug('cache: prePost loading key[%d, %s]' % (ancestorRevisionID, sequenceList))
            preDict, postDict, typeName = load(ancestorRevisionID, sequenceList)
            if typeName == 'lesson' and descType == 'concept':
                preDict['section'] = preDict['concept']
                postDict['section'] = postDict['concept']
            elif typeName == 'concept' and descType == 'lesson':
                preDict['section'] = preDict['lesson']
                postDict['section'] = postDict['lesson']

            if preDict.has_key('concept'):
                del preDict['concept']
            if postDict.has_key('concept'):
                del postDict['concept']
            if preDict.has_key('lesson'):
                del preDict['lesson']
            if postDict.has_key('lesson'):
                del postDict['lesson']

            if preDict.get('parent'):
                for key in preDict['parent']:
                    if preDict['parent'][key]:
                        id, rid = preDict['parent'][key]
                        artifactDict = getArtifactDict(id, rid, memberID=memberID)
                        preDict['parent'][key] = artifactDict
            if postDict.get('parent'):
                for key in postDict['parent']:
                    if postDict['parent'][key]:
                        id, rid = postDict['parent'][key]
                        artifactDict = getArtifactDict(id, rid, memberID=memberID)
                        postDict['parent'][key] = artifactDict
            for key in preDict['section']:
                if preDict['section'][key]:
                    id, rid = preDict['section'][key]
                    artifactDict = getArtifactDict(id, rid, memberID=memberID)
                    preDict['section'][key] = artifactDict
            for key in postDict['section']:
                if postDict['section'][key]:
                    id, rid = postDict['section'][key]
                    artifactDict = getArtifactDict(id, rid, memberID=memberID)
                    postDict['section'][key] = artifactDict

            log.debug('cache: prePost cached key[%d, %s]' % (ancestorRevisionID, sequenceList))
            return preDict, postDict

        log.debug('cache: prePost invalidate key[%d, %s]' % (ancestorRevisionID, sequenceList))
        invalidate(ancestorRevisionID, sequenceList)

    @d.trace(log, ['ancestorRevision'])
    def invalidate(self, ancestorRevision, sequenceList=[]):
        self.prePostCache(model.INVALIDATE, ancestorRevision, sequenceList)

    @d.trace(log, ['ancestorRevision', 'sequenceList', 'memberID'])
    def load(self, ancestorRevision, sequenceList=[], memberID=None):
        return self.prePostCache(model.LOAD, ancestorRevision, sequenceList=sequenceList, memberID=memberID)

class PersonalCache(object):

    def __init__(self, session=None):
        self.session = session

    @classmethod
    def personalCache(cls, action, memberID, id, revisionID=0, artifact=None, artifactDict=None):

        def invalidate(memberID, id, revisionID):
            region_invalidate(load, 'forever', 'c-a-id-m', memberID, id, revisionID)
            log.debug('cache: personal invalidated key[%s, %d, %d]' % (memberID, id, revisionID))

        @cache_region('forever', 'c-a-id-m')
        def load(memberID, id, revisionID):
            lastRead = api.getMemberViewedArtifact(memberID, id)
            if lastRead:
                lastViewTime = str(lastRead.lastViewTime)
            else:
                lastViewTime = None
            libObj = api.getMemberLibraryObjectByParentID(objectType='artifactRevision', parentID=id, memberID=memberID)
            revisionInLibrary = libObj.objectID if libObj else None

            favorite = api.getFavorite(revisionID, memberID)
            isFavorite = favorite is not None
            labels = []
            libObj = api.getMemberLibraryArtifactRevision(memberID, revisionID)
            if libObj:
                addedToLibrary = str(libObj.added)
                labelObjs = api.getLabelsForMemberLibraryObject(libraryObjectID=libObj.id)
                for l in labelObjs:
                    labels.append({'label': l.label, 'systemLabel': l.systemLabel })
            else:
                addedToLibrary = None

            #memberFeedback = api.getArtifactFeedbacksByMember(artifactID=id, memberID=memberID)
            log.debug('cache: personal caching key[%s, %d, %d]' % (memberID, id, revisionID))
            #return lastViewTime, revisionInLibrary, isFavorite, addedToLibrary, labels, memberFeedback
            return lastViewTime, revisionInLibrary, isFavorite, addedToLibrary, labels

        id = long(id)
        memberID = long(memberID)
        if action == model.LOAD:
            if not artifact or not artifactDict:
                artifactDict, artifact = ArtifactCache().load(id, revisionID)
                if not artifactDict:
                    #
                    #  Artifact is gone, don't continue.
                    #
                    return artifactDict, artifact
            log.debug('cache: personal loading key[%s, %d, %d]' % (memberID, id, revisionID))
            #lastViewTime, revisionInLibrary, isFavorite, addedToLibrary, labels, memberFeedback = load(memberID, id, revisionID)
            #lastViewTime, revisionInLibrary, isFavorite, addedToLibrary, labels = load(memberID, id, revisionID)
            loadData = load(memberID, id, revisionID)
            if len(loadData) == 6:
                lastViewTime, revisionInLibrary, isFavorite, addedToLibrary, labels, memberFeedback = loadData
            else:
                lastViewTime, revisionInLibrary, isFavorite, addedToLibrary, labels = loadData
            artifactDict['lastRead'] = lastViewTime
            artifactDict['revisionInLibrary'] = revisionInLibrary
            artifactDict['revisions'][0]['isFavorite'] = isFavorite
            artifactDict['revisions'][0]['addedToLibrary'] = addedToLibrary
            artifactDict['revisions'][0]['labels'] = labels
            #artifactDict['feedbacks'] = memberFeedback
            log.debug('cache: personal cached key[%s, %d, %d]' % (memberID, id, revisionID))
            return artifactDict, artifact

        log.debug('cache: personal invalidate key[%s, %d, %d]' % (memberID, id, revisionID))
        invalidate(memberID, id, revisionID)

    @d.trace(log, ['memberID', 'id', 'revisionID'])
    def invalidate(self, memberID, id, revisionID=0):
        self.personalCache(model.INVALIDATE, memberID, id, revisionID)

    @d.trace(log, ['memberID', 'id', 'revisionID', 'artifact', 'artifactDict'])
    def load(self, memberID, id, revisionID=0, artifact=None, artifactDict=None):
        return self.personalCache(model.LOAD, memberID, id, revisionID, artifact, artifactDict)

class ArtifactCache(object):
    """
        Caches only artifact level info for a given artifactID (simply id).
    """
    clsMap = {
        'revisions': model.ArtifactRevision,
        'authors': model.ArtifactAuthor,
        'browseTerms': model.BrowseTerm,
        'type': model.ArtifactType,
        'role': model.MemberRole,
        'resourceRevisions': model.ResourceRevision,
        'children': model.Artifact,
        'default': model.FlxModel,
    }

    artifactCacheNameSpaceSuffix = '|__loadArtifactDict'
    artifactCacheKeyPrefix = 'c-a-id '

    isMongoArtifactCacheConfigured = config.has_key('beaker.cache.forever.uri')
    mongoArtifactCache = None
    if isMongoArtifactCacheConfigured :  
        mongoArtifactCache = MongoArtifactCache()

    if config.has_key('beaker.cache.artifact.compression.enable') and config['beaker.cache.artifact.compression.enable'] == 'True':
        isCompressionEnabled = True
    else :
        isCompressionEnabled = False

    def __init__(self, session=None):
        self.session = session
        self.permaCache = PermaCache(session)
        self.prePostCache = PrePostCache(session)
        self.personalCache = PersonalCache(session)
        self.relatedArtifactCache = RelatedArtifactCache(session)

        self.artifactRevisionCache = ArtifactRevisionCache(session)
        self.artifactResourceCache = ArtifactResourceCache(session)

    @classmethod
    def artifactCache(cls, action, id=0, revisionID=0, session=None, artifactDict=None, revisionDict=None):

        @d.trace(log, ['id', 'revisionID'])
        def __invalidate(id, revisionID):
            __invalidateArtifactDict(id)
            ArtifactRevisionCache.artifactRevisionCache(model.INVALIDATE, revisionID, session=session)

        @d.trace(log, ['id'])
        def __invalidateArtifactDict(id) :
            try:
                id = long(id)
            except ValueError:
                #
                #  Memcachedb cannot handle control characters. So encode the id and use it for the key in Cache
                #
                id = id.encode('ascii', 'xmlcharrefreplace')
                id = standard_b64encode(id)
            except TypeError:
                raise Exception((_(u'Unknown type of object received as id, %s.' % id)).encode('utf-8'))

            if id:
                region_invalidate(__loadArtifactDict, 'forever', 'c-a-id', id)

        @d.trace(log, ['id', 'revisionID', 'artifactDict', 'revisionDict'])
        def __update(id, revisionID, artifactDict, revisionDict):
            __updateArtifactDict(id, artifactDict)
            ArtifactRevisionCache.artifactRevisionCache(model.UPDATE, revisionID, session=session, artifactRevisionDict=revisionDict)

        @d.trace(log, ['id', 'artifactDict'])
        def __updateArtifactDict(id, artifactDict) :
            try:
                id = long(id)
            except ValueError:
                #
                #  Memcachedb cannot handle control characters. So encode the id and use it for the key in Cache
                #
                id = id.encode('ascii', 'xmlcharrefreplace')
                id = standard_b64encode(id)
            except TypeError:
                raise Exception((_(u'Unknown type of object received as id, %s.' % id)).encode('utf-8'))

            if id and artifactDict :
                from beaker.cache import cache_regions, Cache
                s = json.dumps(artifactDict, default=h.toJson, ensure_ascii=False).encode('utf-8')
                region = cache_regions['forever']
                namespace = __file__.rstrip('c') + cls.artifactCacheNameSpaceSuffix 
                key = cls.artifactCacheKeyPrefix+str(id)
                cache = Cache._get_cache(namespace, region)
                if cls.isCompressionEnabled :
                    c = zlib.compress(s)
                    cache.put(key, [c, True])
                else :
                    cache.put(key, [s, False])

        @d.trace(log, ['id'])
        @cache_region('forever', 'c-a-id')    
        def __loadArtifactDict(id):
            #given ID can be the actual ID or Title or encodedID - Retrieve the actual ID
            if isinstance(id, str):
                id=standard_b64decode(id)
                id=id.decode('ascii', 'xmlcharrefreplace')

            if session:
                artifact = api._getArtifactByIDOrTitle(session, idOrTitle=id)
                if artifact is None:
                    artifact = api._getArtifactByEncodedID(session, encodedID=id)
            else:
                artifact = api.getArtifactByIDOrTitle(idOrTitle=id)
                if artifact is None:
                    artifact = api.getArtifactByEncodedID(encodedID=id)

            if artifact is None:
                raise Exception((_(u'Unknown id, %s, is given. Only valid actualID / Title / encodedID is accepted.' % id)).encode('utf-8'))
            else:
                id = artifact.id
                if session:
                    artifactDict = api._getArtifactDictByID(session, artifactID=id, artifact=artifact)
                else:
                    artifactDict = api.getArtifactDictByID(artifactID=id, artifact=artifact)

                if not artifactDict :
                    log.debug('Empty Object received from the api layer')
                    raise Exception((_(u'Unknown Internal Exception Occured While retreiving the dict for the artifact with the given ID, %s.' % id)).encode('utf-8'))
                else :
                    s = json.dumps(artifactDict, default=h.toJson, ensure_ascii=False).encode('utf-8')
                    if cls.isCompressionEnabled:
                        c = zlib.compress(s)
                        return [c, True]
                    else:
                        return [s, False]

        @d.trace(log, ['id'])
        def __loadBuildArtifactDict(id):
            cachedResult = __loadArtifactDict(id)
            if cachedResult[1] == True:
                c=cachedResult[0]
                s=zlib.decompress(c)
            else:
                s=cachedResult[0]

            if isinstance(s, basestring):
                artifactDict = json.loads(s)
            else :
                artifactDict = s
            #
            #  For book, add new information.
            #
            artifactType = artifactDict.get('artifactType', None)
            if artifactType != 'book':
                return artifactDict
            toUpdate = False
            id = artifactDict.get('id', None)
            #
            #  Contribution type.
            #
            contributionType = artifactDict.get('contributionType', None)
            if not contributionType:
                contributionType = api.getArtifactContributionType(id)
                log.debug('_loadBuildArtifactDict: id[%s] contributionType[%s]' % (id, contributionType))
                if contributionType:
                    artifactDict['contributionType'] = contributionType.typeName
                    log.debug('_loadBuildArtifactDict: contributionType.typeName[%s]' % contributionType.typeName)
                    toUpdate = True
            #
            #  Ancestor information.
            #
            ancestor = artifactDict.get('ancestor', None)
            log.debug('_loadBuildArtifactDict: id[%s] ancestor[%s]' % (id, ancestor))
            if not ancestor:
                ancestorID = api.getArtifactAncestorID(id)
                if ancestorID:
                    ancestorRev = api.getArtifactRevisionByID(ancestorID)
                    log.debug('_loadBuildArtifactDict: ancestorRev[%s]' % ancestorRev)
                    if ancestorRev:
                        if not hasattr(ancestorRev, 'artifact'):
                            ancestorRev.artifact = api.getArtifactByID(session, ancestorRev.artifactID)
                        ancestor = ancestorRev.artifact
                        log.debug('_loadBuildArtifactDict: ancestor[%s]' % ancestor)
                        artifactDict['ancestor'] = {
                            'artifactRevisionID': ancestorRev.id,
                            'artifactID': ancestor.id,
                            'title': ancestor.name,
                            'handle': ancestor.handle,
                        }
                        log.debug('_loadBuildArtifactDict: artifactDict.ancestor[%s]' % artifactDict['ancestor'])
                        toUpdate = True
            if toUpdate:
                __updateArtifactDict(id, artifactDict)
            return artifactDict

        @d.trace(log, ['mongoArtifactDict'])
        def __buildArtifactAndArtifactRevisionDictsFromMongoArtifactDict(mongoArtifactDict) :
            if not mongoArtifactDict == None : 
                artifactDict = mongoArtifactDict

                revisions = artifactDict.pop('revisions', None)
                standardGrid = artifactDict.pop('standardGrid', None)
                revision = artifactDict.pop('revision', None)
                artifactRevisionID = artifactDict.pop('artifactRevisionID', None)
                coverImage = artifactDict.pop('coverImage', None)
                coverImageSatelliteUrl = artifactDict.pop('coverImageSatelliteUrl', None)
                xhtml = artifactDict.pop('xhtml', None)

                domain = artifactDict.get('domain', None)
                ratype = artifactDict.get('type', None)

                artifactRevisionDict = {}
                if revisions :
                    artifactRevisionDict['revisions'] = revisions
                if standardGrid :
                    artifactRevisionDict['standardGrid'] = standardGrid
                if revision :
                    artifactRevisionDict['revision'] = revision
                if artifactRevisionID :
                    artifactRevisionDict['artifactRevisionID'] = artifactRevisionID
                if coverImage :
                    artifactRevisionDict['coverImage'] = coverImage
                if coverImageSatelliteUrl :
                    artifactRevisionDict['coverImageSatelliteUrl'] = coverImageSatelliteUrl
                if xhtml :
                    artifactRevisionDict['xhtml'] = xhtml
                if domain :
                    artifactRevisionDict['domain'] = domain
                if ratype :
                    artifactRevisionDict['type'] = ratype

                return artifactDict, artifactRevisionDict
            else :
                log.debug('None mongoArtifactDict received.')
                raise Exception((_(u'None mongoArtifactDict received')).encode('utf-8'))


        @d.trace(log, ['id', 'revisionID'])
        def __loadBuildArtifactAndArtifactRevisionDictsFromMongoArtifactCache(id, revisionID):   
            if cls.isMongoArtifactCacheConfigured and cls.mongoArtifactCache:
                try :
                    mongoArtifactCacheDict = cls.mongoArtifactCache.getArtifactCache(id, revisionID)
                    if mongoArtifactCacheDict :
                        mongoArtifactDict = mongoArtifactCacheDict['value']
                        artifactDict, artifactRevisionDict = __buildArtifactAndArtifactRevisionDictsFromMongoArtifactDict(mongoArtifactDict)
                        if artifactDict and artifactRevisionDict :
                            #update the artifactDict Cache & artifactRevisionDict Caches
                            if not revisionID :
                                _revisionID = artifactRevisionDict['revisions'][0]['artifactRevisionID']
                            else :
                                _revisionID = revisionID
                            __update(id, _revisionID, artifactDict, artifactRevisionDict)

                            #invalidate /remove the mongoArtifactCache
                            cls.mongoArtifactCache.removeArtifactCache(id, revisionID)

                            return artifactDict, artifactRevisionDict
                        else :
                            return None, None
                    else :
                        #the given id-revisionID combination can not be found in the configured mongoArtifactCache
                        return None, None
                except Exception as e :
                    log.error('Exception / Error occured while trying to use the oldFormat cache'+traceback.format_exc())
                    return None, None
            else :
                #mongoCache is not configured
                return None, None

        @d.trace(log, ['id', 'revisionID'])
        def __loadBuildArtifactAndArtifactRevisionDicts(id, revisionID):

            #One of id / revisionID is mandatory and both of them need to be proper cachable keys
            #When id alone is passed, we build the dict with artifactInfo + revisionInfo of the latest revision
            #When revisionID alone is passed, we build the dict with artifactInfo taken from the artifact to which the revision belongs + revisionInfo
            #When both are passed, we check if the revisionID & artifactID relates to each other & then build the dict accordingly
            if (id or revisionID) :
                #If we have  id, we can use the existing oldformatted artifactCache in building the new formated dicts for better performance else construct the dicts in the new format in the regular flow.
                #So if both id & revisionID is given - In the oldformatted cache check if there is (id-revisionID) key stored & if only id is given - In the oldformatted cache check if there is (id-0) key stored
                #if the key exists, then construct artifactDict, artifactRevisionDict from it's value, remove it from the oldformatted cache, Then put the new artifactDict, artifactRevisionDicts in their respective newformatted caches
                if id : 
                    if revisionID :
                        artifactDict, artifactRevisionDict = __loadBuildArtifactAndArtifactRevisionDictsFromMongoArtifactCache(id, revisionID)
                        if not artifactDict or not artifactRevisionDict : 
                            artifactDict = __loadBuildArtifactDict(id)
                            artifactRevisionDict = ArtifactRevisionCache.artifactRevisionCache(model.LOAD, revisionID, session=session)
                        
                        if not artifactRevisionDict['revisions'][0]['artifactID'] == artifactDict['id']:
                            raise Exception((_(u'Given revisionID, %s, does not belong to the given artifactID, %s.' % (revisionID, id))).encode('utf-8'))
                    else :
                        artifactDict, artifactRevisionDict = __loadBuildArtifactAndArtifactRevisionDictsFromMongoArtifactCache(id, revisionID)
                        if not artifactDict  or not artifactRevisionDict:
                            artifactDict = __loadBuildArtifactDict(id)
                            revisionID = artifactDict['latestRevisionID']
                            artifactRevisionDict = ArtifactRevisionCache.artifactRevisionCache(model.LOAD, revisionID, session=session)
                else :
                    #only revisionID is passed, we can not use the old mongoArtifact Cache. So construct them in the regular manner
                    artifactRevisionDict = ArtifactRevisionCache.artifactRevisionCache(model.LOAD, revisionID, session=session)
                    id = long(artifactRevisionDict['revisions'][0]['artifactID'])
                    artifactDict = __loadBuildArtifactDict(id) 

                return artifactDict, artifactRevisionDict
            else :
                raise Exception((_(u'Both id, %s, and revisionID, %s, cannot be empty.' % (id, revisionID))).encode('utf-8'))  

        @d.trace(log, ['id', 'revisionID'])
        def __load(id, revisionID):
            #The id received here could be the actualID (of type long) / Title | EncodedID (of type String).
            try:
                id = long(id)
            except ValueError:
                #
                #  Memcachedb cannot handle control characters. So encode the id and use it for the key in Cache
                #
                id = id.encode('ascii', 'xmlcharrefreplace')
                id = standard_b64encode(id)
            except TypeError:
                raise Exception((_(u'Unknown type of object received as id, %s.' % id)).encode('utf-8'))

            #The revisionID received here should be the actualRevisionID (of type long).
            try:
                revisionID = long(revisionID)
            except (ValueError, TypeError) as e:
                raise Exception((_('Unknown type of object received as revisionID, %s.' % revisionID)).encode('utf-8'))

            artifactDict, artifactRevisionDict = __loadBuildArtifactAndArtifactRevisionDicts(id, revisionID)
            if revisionID:
                artifactDict['artifactRevisionID'] = revisionID
            if artifactRevisionDict and 'revisions' in artifactRevisionDict and len(artifactRevisionDict['revisions'])>0:
                if artifactRevisionDict['revisions'][0].get('artifactRevisionID') and artifactDict and 'latestRevisionID' in artifactDict:
                    artifactRevisionDict['revisions'][0]['isLatest'] = artifactRevisionDict['revisions'][0]['artifactRevisionID'] == artifactDict['latestRevisionID']
                
            artifactRevisionDict.update(artifactDict)
            return artifactRevisionDict

        if action == model.LOAD:
            log.debug('cache: artifact loading key[%s, %s]' % (id, revisionID))
            artifactDict = __load(id, revisionID)
            return artifactDict

        elif action == model.INVALIDATE:
            log.debug('cache: artifact invalidating key[%s, %s]' % (id, revisionID))
            __invalidate(id, revisionID)
            log.debug('cache: artifact invalidated key[%s, %s]' % (id, revisionID))
        
        elif action == model.UPDATE:
            log.debug('cache: artifact updating key[%s, %s]' % (id, revisionID))
            __update(id, revisionID, artifactDict, revisionDict)
            log.debug('cache: artifact updated key[%s, %s]' % (id, revisionID))

        else:
            raise Exception((_('Unknown action, %s, received.' % action)).encode('utf-8'))

    @d.trace(log, ['id', 'revisionID'])
    def update(self, id=0, revisionID=0, artifactDict=None, revisionDict=None):
        self.artifactCache(model.UPDATE, id, revisionID, session=self.session, artifactDict=artifactDict, revisionDict=revisionDict)

    @d.trace(log, ['id', 'revisionID'])
    def invalidate(self, id=0, revisionID=0):
        self.artifactCache(model.INVALIDATE, id, revisionID, session=self.session)

    @d.trace(log, ['id', 'revisionID'])
    def recache(self, id=0, revisionID=0):
        from flx.controllers.celerytasks.artifact import ArtifactRecacher
        log.debug("Scheduling recache [%s,%s]" % (id, revisionID))
        ArtifactRecacher().delay(artifactID=id, artifactRevisionID=revisionID)

    @d.trace(log, ['xhtml_content'])
    def changeURLsToCompressed(self, xhtml_content):
        if xhtml_content:
            dsNames = ["IMAGE_THUMB_POSTCARD", "IMAGE_THUMB_LARGE", "IMAGE_THUMB_SMALL", "IMAGE"]
    
            full_img_re = re.compile('<img.*?>', re.DOTALL)
            img_tags = full_img_re.findall(xhtml_content)
            src_re = re.compile('src=".*?"', re.DOTALL)
            for each_img_tag in img_tags:
                img_src = src_re.findall(each_img_tag)    
                if not img_src or len(img_src) < 1:
                    continue
                for dsName in dsNames: 
                    if dsName in img_src[0] and dsName+"_TINY" not in img_src[0]:
                        new_img_src = img_src[0].replace(dsName, dsName+"_TINY")
                        new_img_tag = each_img_tag.replace(img_src[0],new_img_src)
                        xhtml_content = xhtml_content.replace(each_img_tag, new_img_tag)      
                        break
                
        return xhtml_content

    @d.trace(log, ['id', 'revisionID', 'artifact', 'memberID', 'infoOnly', 'minimalOnly', 'forUpdate', 'tiny'])
    def load(self, id=0, revisionID=0, artifact=None, memberID=None, infoOnly=False, minimalOnly=False, forUpdate=False, tiny=True):
        if minimalOnly :
            infoLevel = 'MINIMAL'
        elif infoOnly :
            infoLevel = 'MEDIUM'
        else :
            infoLevel = 'FULL'

        artifactDict = self.artifactCache(model.LOAD, id, revisionID, session=self.session)
        
        if artifactDict:
            if artifact is None:
                def fixArtifact(artifact, d):
                    """
                        Save the dictionary in the instance.
                    """
                    if type(artifact) == model.Artifact:
                        artifact.__dict__['cacheDict'] = d
                        revList = d['revisions']
                        r = 0
                        for revision in artifact.revisions:
                            revDict = revList[r]
                            revision.__dict__['cacheDict'] = revDict
                            revision.__dict__['artifact'] = artifact
                            if revision.children:
                                childList = revDict['children']
                                c = 0
                                for child in revision.children:
                                    cDict = childList[c]
                                    fixArtifact(child, cDict)
                                    c += 1
                            r += 1
                artifact = h.dict2obj(artifactDict, model.Artifact, self.clsMap)
                fixArtifact(artifact, artifactDict)

            latestRevision = artifactDict.get('latestRevision', None)
            revision = artifactDict.get('revision', None)
            if revision:
                if not latestRevision or int(revision) > int(latestRevision):
                    log.debug("!!! FOUND latestRevision mismatch: artifactID: %s, actual latest revision: %s, incorrect latest revision: %s" % (artifactDict.get('id'), revision, latestRevision))
                    artifactDict['latestRevision'] = revision

            if memberID:
                revisionID = artifactDict['artifactRevisionID']
                artifactDict, artifact = self.personalCache.load(memberID, artifact.id, revisionID=revisionID, artifact=artifact, artifactDict=artifactDict)

            if forUpdate:
                if artifactDict.has_key('xhtml'):
                    artifactDict['xhtml'] = artifactDict.get('xhtml_prime',artifactDict.get('xhtml'))
            
            if tiny:
                if artifactDict.has_key('xhtml'):
                    artifactDict['xhtml'] = self.changeURLsToCompressed(artifactDict['xhtml'])

            if artifactDict.get('revisions'):
                for revision in artifactDict['revisions']:
                    artifactDict['published'] = revision.get('published')
                    break

            if infoLevel=='MEDIUM' or infoLevel=='MINIMAL':
                #delete some keys
                keys2Del = ['xhtml_prime', 'xhtml', 'vocabulary']
                for key in keys2Del:
                    if artifactDict.has_key(key):
                        del artifactDict[key]

                #compress revision's children to be just IDs
                if artifactDict.has_key('revisions'):
                    revisions = artifactDict['revisions']
                    for revision in revisions:
                        if revision.has_key('children'):
                            children = revision['children']
                            childIDs = []
                            for child in children:
                                if isinstance(child, dict):
                                    id = child['revisions'][0]['artifactRevisionID']
                                    childIDs.append(id)
                                else:
                                    childIDs.append(child)
                            revision['children'] = childIDs

                #delete more keys if MINIMAL
                if infoLevel == 'MINIMAL':
                    keys2Del = ['revisions', 'standardGrid', 'tagGrid', 'relatedArtifacts', ]
                    for key in keys2Del:
                        if artifactDict.has_key(key):
                            del artifactDict[key]
            
            return artifactDict, artifact
        
        else :
            log.debug('Method contract failed - invalid artifactDict returned')
            raise Exception('Unknown Internal Exception Occured While loading the artifact with the given id & revisionID')

class ArtifactRevisionCache(object):
    """
        Caches artifact revision level Info for a given artifactRevisionID
    """
    artifactRevisionCacheNameSpaceSuffix = '|__loadArtifactRevisionDict'
    artifactRevisionCacheKeyPrefix = 'c-ar-id '

    if config.has_key('beaker.cache.artifactrevision.compression.enable') and config['beaker.cache.artifactrevision.compression.enable'] == 'True':
        isCompressionEnabled = True
    else :
        isCompressionEnabled = False

    def __init__(self, session=None):
        self.session = session

    @classmethod
    def artifactRevisionCache(cls, action, artifactRevisionID, session=None, artifactRevisionDict=None):

        @d.trace(log, ['hash', 'satelliteUrl', 'img_cdn_locations'])
        @cache_region('monthly')
        def __get_resource_uri(hash, satelliteUrl, img_cdn_locations = None):
            try:
                if not img_cdn_locations:
                    img_cdn_locations = config.get('img_cdn_locations')
                    img_cdn_locations = img_cdn_locations.split(',')
                    img_cdn_locations = [each.strip() for each in img_cdn_locations if each.strip()]
                split_result = urllib2.urlparse.urlsplit(satelliteUrl)
                split_result_scheme = split_result.scheme
                if not split_result.scheme or split_result.scheme == 'http':
                    split_result_scheme = 'https'
                random_cdn_location = random.choice(img_cdn_locations).replace("'","")
                if split_result.port:
                    random_cdn_location = '%s:%s'%(random_cdn_location,split_result.port)
                new_src = '%s://%s%s'%(split_result_scheme,random_cdn_location,split_result.path)
                if split_result.query:
                    new_src = "%s?%s"%(new_src,split_result.query)
                if split_result.fragment:
                    new_src = "%s#%s"%(new_src,split_result.fragment)
                return new_src
            except Exception as e:
                log.error("Exception:ArtifactRevisionCache:get_resource_uri")
                log.error(traceback.format_exc())
                return None
        
        ## Deprecated - instead simply render Math using MathJax.
        @d.trace(log, ['hash', 'math_celery', 'type', 'id', 'target', 'math_cdn_locations'])
        def __get_math_uri(hash, math_celery, type, id, target='web', math_cdn_locations=None):
            try:
                if not math_cdn_locations:
                    math_cdn_locations = config.get('math_cdn_locations')
                    math_cdn_locations = math_cdn_locations.split(',')
                    math_cdn_locations = [each.strip() for each in math_cdn_locations if each.strip()]
                is_translated,new_src = math_celery.serve_math(type, id, target)
                if is_translated:
                    split_result = urllib2.urlparse.urlsplit(new_src)
                    split_result_scheme = split_result.scheme
                    if 'cloudfront.net' in split_result.hostname:
                        log.debug("Not changing math url since it is already using CDN: [%s]" % new_src)
                        return new_src
                    if not split_result.scheme or split_result_scheme == 'http':
                        split_result_scheme = 'https'
                    ## If the port is not 80 or 443 - we are probably dealing with dev server (8080 fedora)
                    ## In that case, we don't change anything (The CDN won't work anyway)
                    if (split_result.port and split_result.port not in [80, 443]) or not math_cdn_locations:
                        return None
                    random_cdn_location = random.choice(math_cdn_locations).replace("'","")
                    if split_result.port:
                        random_cdn_location = '%s:%s'%(random_cdn_location,split_result.port)
                    new_src = '%s://%s%s'%(split_result_scheme,random_cdn_location,split_result.path)
                    if split_result.query:
                        new_src = "%s?%s"%(new_src,split_result.query)
                    if split_result.fragment:
                        new_src = "%s#%s"%(new_src,split_result.fragment)
                    return new_src
                else:
                    return None
            except Exception as e:
                log.error("Exception:ArtifactRevisionCache:__get_math_uri e[%s]" % e)
                log.error(traceback.format_exc())
                return None

        @d.trace(log, ['artifactRevisionDict'])
        def __add_interlinks(artifactRevisionDict):
            xhtml_content = artifactRevisionDict.get('xhtml', '')
            artifact_branch = None
            artifact_subject = None
            artifact_domain_name = None
            if artifactRevisionDict.has_key('domain') and artifactRevisionDict['domain']:
                artifact_branch = artifactRevisionDict['domain'].get('branch', 'UBR')
                artifact_subject = artifactRevisionDict['domain'].get('subject', 'UGC')
                if artifact_branch == 'UBR':
                    artifact_branch = None
                    #artifact_domain_name = None
                else:
                    artifact_domain_name = artifactRevisionDict['domain']['name']
            branches = config.get('branches_for_concept_interlinking')
            if not branches:
                branches = ''
            branches = branches.split(',')
            log.debug('artifact_branch: [%s]' %(artifact_branch))
            #if not artifact_branch or artifact_branch.lower() not in branches:
            #    log.debug('This branch is not yet supported for concept interlinking')
            #    return xhtml_content

            #web_prefix_url = config.get('web_prefix_url')
            concepts_info = getConceptsInfo()
            stop_words = getStopWords()
            stop_words = [stop_word.word.lower() for stop_word in stop_words]

            sorted_concepts_info = []
            start = -1
            end = -1
            if artifact_branch:
                for index, each_info in enumerate(concepts_info):
                    if artifact_branch == each_info['branchShortName'] and start == -1:
                        start = index
                    if artifact_branch != each_info['branchShortName'] and start >= 0 and end == -1:
                        end = index
            log.debug('start: [%s], end: [%s]' %(start, end))
            sorted_concepts_info = concepts_info[start:end] + concepts_info[:start] + concepts_info[end:]

            soup = BeautifulSoup(xhtml_content)
            found_concepts = []
            hyperlink_limit = 3
            no_hyperlink_list = ['a', 'img']
            for each_info in sorted_concepts_info:
                log.info(each_info)
                concept_name = each_info['name']
                concept_handle = each_info['handle']
                branch = each_info['branch']
                subject = each_info['subjectShortName']
                if concept_name.lower() in stop_words:
                    continue
                if subject != artifact_subject:
                    continue
                if not concept_name or not concept_handle or not branch or not subject:
                    continue
                if concept_name == artifact_domain_name:
                    continue
                found = False
                if concept_name.lower().find(branch) >= 0:
                    found = True
                if branch.find(concept_name.lower()) >= 0:
                    found = True
                for each_found_concept in found_concepts:
                    if found:
                        break
                    if each_found_concept.find(concept_name.lower()) >= 0:
                        found = True
                    if concept_name.lower().find(each_found_concept) >= 0:
                        found = True
                if found:
                    continue
                if concept_name.lower() in found_concepts:
                    continue

                match = re.search('\W(%s)\W' %(concept_name), xhtml_content, re.I)
                if not match:
                    continue
                matched_concept_name = match.groups()[0]
                log.debug('Found matched_concept_name: [%s]' %(matched_concept_name))
                found_concepts.append(matched_concept_name.lower())

                if soup and soup.body:
                    results = soup.body.findAll(text=re.compile('\W%s\W' %(concept_name), re.I))
                    concept_link = '/c/' + branch + '/' + concept_handle + '?referrer=crossref'
                    count = 0
                    for result in results:
                        restricted_tag = False
                        parents = result.findParents()
                        for each_parent in parents:
                            if each_parent.name in no_hyperlink_list:
                                restricted_tag = True
                                break
                            if each_parent.name in ['div', 'span']:
                                parent_class = each_parent.get('class', '')
                                if 'x-ck12-img' in parent_class:
                                    restricted_tag = True
                        if restricted_tag:
                            continue
                        result_text = re.sub('(\W)(%s)(\W)(?i)' %(concept_name), '\\1<a class="x-ck12-crossref" title="%s" href="%s">\\2</a referrer=crossref >\\3' %(concept_name, concept_link),  unicode(result), 1)
                        result.replaceWith(result_text)
                        count += 1
                        if count >= hyperlink_limit:
                            break

            ## Do not use soup.prettify(). It indents the non-block elements and inserts unnecessary spaces.
            #xhtml_content = unicode(soup.prettify())
            #xhtml_content = h.safe_decode(soup.prettify())
            xhtml_content = h.safe_decode(unicode(soup))
            xhtml_content = xhtml_content.replace('&lt;a class="x-ck12-crossref"', '<a class="x-ck12-crossref"')
            xhtml_content = xhtml_content.replace('?referrer=crossref"&gt;', '">')
            xhtml_content = xhtml_content.replace('&lt;/a referrer=crossref &gt;', '</a>')
            return xhtml_content

        @d.trace(log, ['artifactRevisionDict', 'artifactRevisionID'])
        def __process_images(artifactRevisionDict, artifactRevisionID):
            xhtml_content = artifactRevisionDict.get('xhtml', '')
            img_cdn_locations = config.get('img_cdn_locations')
            img_cdn_locations = img_cdn_locations.split(',')
            img_cdn_locations = [each.strip() for each in img_cdn_locations if each.strip()]
            log.debug("img_cdn_locations: %s" % str(img_cdn_locations))
            math_cdn_locations = config.get('math_cdn_locations')
            math_cdn_locations = math_cdn_locations.split(',')
            math_cdn_locations = [each.strip() for each in math_cdn_locations if each.strip()]
            cdn_download_url = config.get('cdn_download_url')
            cdn_download_url = cdn_download_url if cdn_download_url and str(cdn_download_url).lower() != 'none' else ''
            
            if xhtml_content:
                full_img_re = re.compile('<img.*?>', re.DOTALL)
                img_tags = full_img_re.findall(xhtml_content)
                src_re = re.compile('(src="(.*?)")', re.DOTALL)
                class_re = re.compile('class="(.*?)"', re.DOTALL)
                get_resource_old_re = re.compile('.*?flx/render/([^"]*)', re.DOTALL)
                get_resource_re = re.compile('.*?flx/show/(.*)', re.DOTALL)
                math_img_re = re.compile('.*?flx/math/(.*)',re.DOTALL)
                math_class_re = re.compile('x-ck12-.*?math',re.DOTALL)
                resource_controller = None
                resource_satellite_urls = {}
                if session:
                    resourceTypes = api._getResourceTypes(session)
                else:
                    resourceTypes = api.getResourceTypes()
                resource_type_dict = {}
                resource_type_name_dict = {}
                for resourceType in resourceTypes:
                    id = resourceType.id
                    name = resourceType.name
                    resource_type_dict[name] = id
                    resource_type_name_dict[id] = name
                if img_tags:
                    from flx.controllers import resource
                    resource_controller = resource.ResourceController()
                    if session:
                        artifact_rev_resources = api._getResourcesFromArtifactRevisionID(session, artifactRevisionID)
                    else:
                        artifact_rev_resources = api.getResourcesFromArtifactRevisionID(artifactRevisionID)
                    for each in artifact_rev_resources:
                        try:
                            if len(each) > 1:
                                each = each[1]
                            resource_hash = "%s-%s-%s"%(resource_type_name_dict[each.resourceTypeID], each.handle, each.ownerID)
                            resource_satellite_urls[resource_hash] = each.getSatelliteUrl()
                        except Exception as e: 
                            log.error('Resource parsing error from ArtifactRevisionCache: %s'%e.__str__())
                for each_img_tag in img_tags:
                    try:
                        img_src = src_re.findall(each_img_tag)
                        new_img_src = None
                        if img_src[0][1]:
                            ## Do not process inline base64 encoded image content
                            if img_src[0][1].startswith('data:'):
                                continue
                            resource_perma_path = get_resource_re.findall(img_src[0][1])
                            ##Search by old API skeleton
                            resource_perma_path_old = get_resource_old_re.findall(img_src[0][1])
                            if resource_perma_path_old:
                                resource_perma_path.extend(resource_perma_path_old)
                            if not resource_perma_path:
                                ##Check if the image is of math
                                resource_class = class_re.findall(each_img_tag)
                                if resource_class:
                                    resource_class = resource_class[0]
                                    if math_class_re.search(resource_class.lower()):
                                        math_img_endpoints = math_img_re.findall(img_src[0][1])
                                        
                                        if math_img_endpoints :
                                            math_img_endpoint = math_img_endpoints[0]
                                            math_img_elements = math_img_endpoint.split('/')
                                            log.debug('math_img_elements: %s' %(math_img_elements))
                                            if math_img_elements[-1].lower() == 'kindle':
                                                endpoint_target = 'kindle'
                                                endpoint_latex = "/".join(math_img_elements[1:-1])
                                            else:
                                                endpoint_target = 'web'
                                                endpoint_latex = "/".join(math_img_elements[1:])
                                            #if len(math_img_elements) == 3:
                                            #    endpoint_target = math_img_elements[2]
                                            endpoint_type = math_img_elements[0]
                                            log.debug('endpoint_type: [%s], endpoint_latex: [%s], endpoint_target: [%s]' %(endpoint_type, endpoint_latex, endpoint_target))
                                            ## Simply replace with the new math editor syntax
                                            typeClassMap = { 'inline': 'math', 'block': 'block-math', 'alignat': 'hwpmath' }
                                            endpoint_class = typeClassMap.get(endpoint_type, 'math')
                                            new_img_src = '<span class="x-ck12-mathEditor" data-mathmethod="%s" data-contenteditable="false" data-edithtml="" data-tex="%s" data-math-class="x-ck12-%s"></span>' % (endpoint_type, endpoint_latex, endpoint_class)
                                            log.debug("new_img_src: %s" % new_img_src)
                                            #hash = math_controller._generateHash(endpoint_type, endpoint_latex, endpoint_target)
                                            #new_src = __get_math_uri(hash, math_celery, endpoint_type, endpoint_latex, endpoint_target, math_cdn_locations)
                                            #if new_src:
                                            #    new_img_src = 'data-flx-url="%s" src="%s"'%(img_src[0][1],new_src)
                                else:
                                   continue
                            else:
                                ## Process image
                                resource_perma_path = resource_perma_path[0]
                                resource_perma_elements = resource_perma_path.split('/')
                                log.debug("Processing image: %s" % str(resource_perma_elements))
                                if len(resource_perma_elements) == 6:
                                    resource_stream_type = resource_perma_elements[2]
                                    resource_type = resource_perma_elements[3]
                                    resource_realm = resource_perma_elements[4]
                                    resource_handle = resource_perma_elements[5]
                                elif len(resource_perma_elements) == 5:
                                    resource_stream_type = resource_perma_elements[2]
                                    resource_type = resource_perma_elements[3]
                                    resource_realm = None
                                    resource_handle = resource_perma_elements[4]
                                elif len(resource_perma_elements) == 4:
                                    resource_stream_type = resource_perma_elements[0]
                                    resource_type = resource_perma_elements[1]
                                    resource_realm = resource_perma_elements[2]
                                    resource_handle = resource_perma_elements[3]
                                elif len(resource_perma_elements) == 2:
                                    resource_stream_type = 'default'
                                    resource_type = resource_perma_elements[0]
                                    resource_realm = None
                                    resource_handle = resource_perma_elements[1]
                                elif len(resource_perma_elements) == 3:
                                    if resource_perma_elements[0] in model.STREAM_TYPES:
                                        resource_stream_type = resource_perma_elements[0]
                                        resource_type = resource_perma_elements[1]
                                        resource_realm = None
                                    else: 
                                        resource_stream_type = 'default'
                                        resource_type = resource_perma_elements[0]
                                        resource_realm = resource_perma_elements[1]
                                    resource_handle = resource_perma_elements[2]
                                else:
                                    continue
                                resource_member_id = None
                                if not resource_realm:
                                    ck12Editor = config.get('ck12_editor')
                                    if session:
                                        member = api._getMemberByLogin(session, login=ck12Editor)
                                    else:
                                        member = api.getMemberByLogin(login=ck12Editor)
                                    resource_member_id = member.id
                                else:
                                    resource_realm = urllib2.unquote(resource_realm)
                                    key, login = resource_realm.split(':')
                                    if key.lower() != 'user':
                                        continue
                                    if session:
                                        member = api._getMemberByLogin(session, login=login)
                                    else:
                                        member = api.getMemberByLogin(login=login)
                                    if member is None:
                                        if session:
                                            member = api._getMemberByDefaultLogin(session, defaultLogin=login)
                                        else:
                                            member = api.getMemberByDefaultLogin(defaultLogin=login)
                                    if not member:
                                        continue
                                    resource_member_id = member.id
                                resource_hash = "%s-%s-%s"%(resource_type, unquote(resource_handle), resource_member_id)
                                satelliteUrl = resource_satellite_urls.get(resource_hash, None)
                                if not satelliteUrl:
                                    log.debug("No satelliteUrl in the map. Trying to get resource: [%s], [%s], [%s]" % (resource_handle, resource_type, resource_member_id))
                                    resource = api.getResourceByHandle(handle=resource_handle, typeID=resource_type_dict.get(resource_type), ownerID=resource_member_id)
                                    if resource:
                                        satelliteUrl = resource.satelliteUrl
                                log.debug("satelliteUrl: %s, resource_satellite_urls: %s, hash: %s" % (satelliteUrl, str(resource_satellite_urls), resource_hash))
                                if not satelliteUrl:
                                    continue
                                elif satelliteUrl.startswith(cdn_download_url):
                                    hash = resource_controller._generateHash(resource_type, resource_handle, resource_realm, resource_stream_type)
                                    new_src = __get_resource_uri(hash, satelliteUrl, img_cdn_locations)
                                else:
                                    new_src = satelliteUrl
                                if new_src:
                                    log.debug("new_src=%s, resource_stream_type=%s" % (new_src, resource_stream_type))
                                    if resource_stream_type and resource_stream_type not in ['default', 'DEFAULT']:
                                        ## Apply the correct stream size for the image
                                        for tp in ['IMAGE', 'COVER_PAGE']:
                                            tp_stream = "%s_%s" % (tp, resource_stream_type)
                                            if tp in new_src and tp_stream not in new_src:
                                                new_src = new_src.replace(tp, tp_stream)
                                                break
                                    new_img_src = 'data-flx-url="%s" src="%s"'%(img_src[0][1],new_src)
                        if new_img_src:
                            if new_img_src.startswith('<span'): 
                                ## Math
                                new_img_tag = new_img_src
                            else:
                                new_img_tag = each_img_tag.replace(img_src[0][0],new_img_src)
                            xhtml_content = xhtml_content.replace(each_img_tag, new_img_tag)
                    except Exception as e:
                        log.error("Exception:ArtifactRevisionCache:process_images e[%s]" % e)
                        log.error(traceback.format_exc())
                        continue
            return xhtml_content

        @d.trace(log, ['artifactRevisionID', 'artifactRevisionDict'])
        def __processArtifactRevisionDict(artifactRevisionID, artifactRevisionDict):
            if artifactRevisionDict:
                hasXhtml = artifactRevisionDict.has_key('xhtml')
                if hasXhtml:
                    xhtml = artifactRevisionDict['xhtml']
                    if xhtml and xhtml.find('<!--This is not content XHTML. Ignore-->') >= 0:
                        hasXhtml = False
                artifactRevisionDict['hasXhtml'] = hasXhtml
                if hasXhtml:
                    artifactRevisionDict['xhtml_prime'] = artifactRevisionDict['xhtml']
                    artifactRevisionDict['xhtml'] = __process_images(artifactRevisionDict, artifactRevisionID)
                    if artifactRevisionDict['type']['name'] == 'lesson' and config.get('enable_concept_interlinking') == 'true':
                        artifactRevisionDict['xhtml'] = __add_interlinks(artifactRevisionDict)  
            return artifactRevisionDict

        @d.trace(log, ['artifactRevisionID'])
        def __invalidateArtifactRevisionDict(artifactRevisionID):
            try:
                artifactRevisionID = long(artifactRevisionID)
            except (ValueError, TypeError):
                raise Exception((_('Unknown type of object received as artifactRevisionID, %s.' % artifactRevisionID)).encode('utf-8'))
            
            if artifactRevisionID :
                region_invalidate(__loadArtifactRevisionDict, 'forever', 'c-ar-id', artifactRevisionID)

        @d.trace(log, ['artifactRevisionID', 'artifactRevisionDict'])
        def __updateArtifactRevisionDict(artifactRevisionID, artifactRevisionDict):
            try:
                artifactRevisionID = long(artifactRevisionID)
            except (ValueError, TypeError):
                raise Exception((_('Unknown type of object received as artifactRevisionID, %s.' % artifactRevisionID)).encode('utf-8'))

            if artifactRevisionID and artifactRevisionDict :
                from beaker.cache import cache_regions, Cache
                s = json.dumps(artifactRevisionDict, default=h.toJson, ensure_ascii=False).encode('utf-8')
                region = cache_regions['forever']
                namespace = __file__.rstrip('c') + cls.artifactRevisionCacheNameSpaceSuffix 
                key = cls.artifactRevisionCacheKeyPrefix+str(artifactRevisionID)
                cache = Cache._get_cache(namespace, region)
                if cls.isCompressionEnabled :
                    c = zlib.compress(s)
                    cache.put(key, [c, True])
                else :
                    cache.put(key, [s, False])

        @d.trace(log, ['artifactRevisionID'])
        @cache_region('forever', 'c-ar-id')
        def __loadArtifactRevisionDict(artifactRevisionID):
            try:
                artifactRevisionID = long(artifactRevisionID)
            except (ValueError, TypeError):
                raise Exception((_('Unknown type of object received as artifactRevisionID, %s.' % artifactRevisionID)).encode('utf-8'))
            
            if session:
                artifactRevisionDict = api._getArtifactRevisionDictByID(session, revisionID=artifactRevisionID)
            else:
                artifactRevisionDict = api.getArtifactRevisionDictByID(revisionID=artifactRevisionID)

            if not artifactRevisionDict :
                log.debug('Empty Object received from the api layer')
                raise Exception((_('Unknown Internal Exception Occured While retreiving the dict for the artifactRevisionID, %s.' % artifactRevisionID)).encode('utf-8'))
            else :
                artifactRevisionDict = __processArtifactRevisionDict(artifactRevisionID, artifactRevisionDict)
                s = json.dumps(artifactRevisionDict, default=h.toJson, ensure_ascii=False).encode('utf-8')
                if cls.isCompressionEnabled:
                    c = zlib.compress(s)
                    return [c, True]
                else:
                    return [s, False]

        if action == model.LOAD:
            log.debug('cache: artifactRevision loading key[%s]' % artifactRevisionID)
            
            cachedResult = __loadArtifactRevisionDict(artifactRevisionID)
            if cachedResult[1] == True:
                c=cachedResult[0]
                s=zlib.decompress(c)
            else:
                s=cachedResult[0]
            
            if isinstance(s, basestring):
                artifactRevisionDict = json.loads(s)
            else :
                artifactRevisionDict = s
            return artifactRevisionDict

            log.debug('cache: artifactRevision cached key[%s]' % artifactRevisionID)
            return artifactRevisionDict
        
        elif action == model.INVALIDATE:
            log.debug('cache: artifactRevision invalidating key[%s]' % (artifactRevisionID))
            __invalidateArtifactRevisionDict(artifactRevisionID)
            log.debug('cache: artifactRevision invalidated key[%s]' % (artifactRevisionID))

        elif action == model.UPDATE:
            log.debug('cache: artifactRevision updating key[%s]' % (artifactRevisionID))
            __updateArtifactRevisionDict(artifactRevisionID, artifactRevisionDict)
            log.debug('cache: artifactRevision updated key[%s]' % (artifactRevisionID))

        elif action == model.PROCESS:
            log.debug('cache: artifactRevision processing key[%s]' % (artifactRevisionID))
            return __processArtifactRevisionDict(artifactRevisionID, artifactRevisionDict)
            log.debug('cache: artifactRevision processed key[%s]' % (artifactRevisionID))

        else:
            raise Exception((_('Unknown action, %s, received.' % action)).encode('utf-8'))
    
    @d.trace(log, ['artifactRevisionID'])
    def process(self, artifactRevisionID, artifactRevisionDict):
        return self.artifactRevisionCache(model.PROCESS, artifactRevisionID, session=self.session, artifactRevisionDict=artifactRevisionDict)

    @d.trace(log, ['artifactRevisionID'])
    def update(self, artifactRevisionID, artifactRevisionDict):
        self.artifactRevisionCache(model.UPDATE, artifactRevisionID, session=self.session, artifactRevisionDict=artifactRevisionDict)

    @d.trace(log, ['artifactRevisionID'])
    def invalidate(self, artifactRevisionID):
        self.artifactRevisionCache(model.INVALIDATE, artifactRevisionID, session=self.session)

    @d.trace(log, ['artifactRevisionID'])
    def load(self, artifactRevisionID):
        return self.artifactRevisionCache(model.LOAD, artifactRevisionID, session=self.session)

class RelatedArtifactCache(object):
    """
        Caches related artifacts for an artifact id and a domain id
    """

    def __init__(self, session=None):
        self.session = session
        self.browseTermCache = BrowseTermCache(session)

    @classmethod
    def relatedArtifactCache(cls, action, domainID, memberID=None):

        def invalidate(domainID, memberID=None):
            region_invalidate(load, 'forever', 'c-ra-id', domainID, memberID)
            log.debug('cache: relatedArtifactCache invalidated domainID[%s] memberID[%s]' % (domainID, memberID))

        @cache_region('forever', 'c-ra-id')
        def load(domainID, memberID=None):
            cnode = api.getBrowseTermByID(id=domainID)
            domainDict = BrowseTermCache().load(cnode.id, memberID, prePost=True)
            related = api.getRelatedArtifactsForDomains(domainIDs=[domainID], memberID=memberID)
            if related.getTotal():
                domainDict['modalities'] = []
                for r in related:
                    modalityDict, modality = ArtifactCache().load(r.id, artifact=r.artifact, memberID=memberID, infoOnly=True) 
                    domainDict['modalities'].append(modalityDict)
            
            log.debug('cache: relatedArtifactCache caching id[%d, %s] -> relatedModalities[%s]' % (domainID, memberID, domainDict))
            return domainDict

        if memberID:
            memberID = long(memberID)
        if action == model.LOAD:
            log.debug('cache: relatedArtifactCache loading domainID[%s], memberID[%s]' % (domainID, memberID))
            domainDict = load(domainID, memberID)
            if not domainDict:
                invalidate(domainID, memberID)
            else:
                log.debug('cache: relatedArtifactCache cached id[%d, %s]' % (domainID, memberID))
            return domainDict

        log.debug('cache: relatedArtifactCache invalidating id[%d, %s]' % (domainID, memberID))
        invalidate(domainID, memberID)

    @d.trace(log, ['domainID', 'memberID'])
    def invalidate(self, domainID, memberID=None):
        self.browseTermCache.invalidate(domainID, memberID=memberID)
        if memberID:
            self.relatedArtifactCache(model.INVALIDATE, domainID, memberID)
        self.relatedArtifactCache(model.INVALIDATE, domainID)

    @d.trace(log, ['memberID', 'domainID', 'typeIDs', 'levels', 'modifiedAfter'])
    def load(self, domainID, memberID=None, typeIDs=None, levels=None, modifiedAfter=None):
        domainDict = self.relatedArtifactCache(model.LOAD, domainID, memberID)
        if domainDict.get('modalities'):
            ## Remove the levels that do not match
            artifactTypes = g.getArtifactTypes()
            i = 0
            while i < len(domainDict.get('modalities')):
                if levels and str(domainDict['modalities'][i].get('level', '')).lower() not in levels:
                    log.debug("Removing modality level mismatch")
                    domainDict['modalities'].pop(i)
                    i -= 1
                elif typeIDs and artifactTypes[domainDict['modalities'][i].get('artifactType').lower()] not in typeIDs:
                    log.debug("Removing modality type mismatch")
                    domainDict['modalities'].pop(i)
                    i -= 1
                elif modifiedAfter and domainDict['modalities'][i].get('modified', '') <= modifiedAfter:
                    log.debug("Removing modality modifiedAfter mismatch")
                    domainDict['modalities'].pop(i)
                    i -= 1
                i += 1
        return domainDict

"""
    Store the member specific properties of the browse term cache.
"""
class PersonalBrowseTermCache(object):

    def __init__(self, session=None):
        self.session = session

    @classmethod
    def personalBrowseTermCache(cls, action, memberID, termID, prePost=False, termDict=None, session=None, conceptCollectionHandle=None, collectionCreatorID=3):

        def invalidate(memberID, termID, prePost=False, conceptCollectionHandle=None, collectionCreatorID=3):
            region_invalidate(load, 'forever', 'c-bt-m', memberID, termID, prePost, conceptCollectionHandle, collectionCreatorID)
            log.debug('cache: personalBrowseTermCache invalidated key[%d, %s, %s, %s, %d]' % (memberID, termID, prePost, conceptCollectionHandle, collectionCreatorID))

        @cache_region('forever', 'c-bt-m')
        def load(memberID, termID, prePost, conceptCollectionHandle=None, collectionCreatorID=3):
            if session:
                term = api._getBrowseTermByID(session, id=termID)
            else:
                term = api.getBrowseTermByID(id=termID)
            typeName = term.type.name
            artifactCount = descendantArtifactCount = modalityCount = descendantModalityCount = 0
            preDomains = postDomains = {}
            if term and typeName in ['domain', 'pseudodomain', 'internal-tag']:
                if session:
                    artifactCount = api._countArtifactsAndBrowseTerms(session, browseTermList=[term.id], typeName=None, memberID=memberID, termTypeID=term.termTypeID)
                else:
                    artifactCount = api.countArtifactsAndBrowseTerms(browseTermList=[term.id], typeName=None, memberID=memberID, termTypeID=term.termTypeID)

                descTermIDs = termDict.get('descTermIDs', [])
                log.debug("Got descendant ids: %s" % descTermIDs)
                ## Descendant count not supported for subject levels and higher
                if term.parent and term.parent.encodedID and term.parent.encodedID.lower() != 'ckt' and descTermIDs:
                    if session:
                        descendantArtifactCount = api._countArtifactsAndBrowseTerms(session, browseTermList=descTermIDs, typeName=None, memberID=memberID, termTypeID=term.termTypeID)
                    else:
                        descendantArtifactCount = api.countArtifactsAndBrowseTerms(browseTermList=descTermIDs, typeName=None, memberID=memberID, termTypeID=term.termTypeID)
                else:
                    descendantArtifactCount = 0
                if session:
                    modalityCount = api._countRelatedArtifactsForDomains(session, domainIDs=[term.id], memberID=memberID, privateOnly=True, conceptCollectionHandle=conceptCollectionHandle, collectionCreatorID=collectionCreatorID)
                else:
                    modalityCount = api.countRelatedArtifactsForDomains(domainIDs=[term.id], memberID=memberID, privateOnly=True, conceptCollectionHandle=conceptCollectionHandle, collectionCreatorID=collectionCreatorID)

                descendantModalityCount = 0
                if descTermIDs:
                    if session:
                        descendantModalityCount = api._countRelatedArtifactsForDomains(session, domainIDs=descTermIDs, memberID=memberID, privateOnly=True, conceptCollectionHandle=conceptCollectionHandle, collectionCreatorID=collectionCreatorID)
                    else:
                        descendantModalityCount = api.countRelatedArtifactsForDomains(domainIDs=descTermIDs, memberID=memberID, privateOnly=True, conceptCollectionHandle=conceptCollectionHandle, collectionCreatorID=collectionCreatorID)

                if prePost:
                    if term.type.name == 'domain':
                        log.debug("cache: personalBrowseTermCache Getting preDomains and postDomains for %s" % term.encodedID)
                        preDomains, postDomains = api.getPrePostDomainForEncodedID(encodedID=term.encodedID, memberID=memberID, conceptCollectionHandle=conceptCollectionHandle, collectionCreatorID=collectionCreatorID)

            log.debug('cache: personalBrowseTermCache caching id[%d, %s, %s]' % (termID, memberID, prePost))
            return artifactCount, descendantArtifactCount, modalityCount, descendantModalityCount, preDomains, postDomains

        if action == model.LOAD:
            log.debug("termDict: %s" % str(termDict))
            if not termDict:
                termDict = BrowseTermCache(session).load(termID, memberID=None, prePost=prePost, conceptCollectionHandle=conceptCollectionHandle, collectionCreatorID=collectionCreatorID)
                if not termDict:
                    return termDict

            log.debug('cache: personalBrowseTermCache loading key[%d, %d, %s, %s, %d]' % (memberID, termID, prePost, conceptCollectionHandle, collectionCreatorID))
            artifactCount, descendantArtifactCount, modalityCount, descendantModalityCount, preDomains, postDomains = load(memberID, termID, prePost, conceptCollectionHandle, collectionCreatorID)
            termDict['artifactCount'] = artifactCount
            termDict['descendantArtifactCount'] = descendantArtifactCount
            termDict['communityModalityCount'] = PersonalBrowseTermCache.sumDicts(modalityCount, termDict.get('communityPublicModalityCount'))
            termDict['descendantCommunityModalityCount'] = PersonalBrowseTermCache.sumDicts(descendantModalityCount, termDict.get('communityPublicDescendantModalityCount'))
            if prePost:
                termDict['pre'] = preDomains
                termDict['post'] = postDomains
            log.debug('cache: personalBrowseTermCache cached key[%d, %d, %s, %s, %d]' % (memberID, termID, prePost, conceptCollectionHandle, collectionCreatorID))
            return termDict

        log.debug('cache: personalBrowseTermCache invalidate key[%d, %d, %s, %s, %d]' % (memberID, termID, prePost, conceptCollectionHandle, collectionCreatorID))
        invalidate(memberID, termID, prePost, conceptCollectionHandle, collectionCreatorID)

    @classmethod
    def sumDicts(cls, modalityCount, publicModalityCount):
        """
            Return a sum of counts in 2 dictionaries - modifies the modalityCount dict
        """
        log.debug("publicModalityCount:%s" % publicModalityCount)
        log.debug("modalityCount:%s" % modalityCount)
        retCount = {}
        if modalityCount:
            if not publicModalityCount:
                publicModalityCount = {}
            retCount = copy.deepcopy(modalityCount)
            for k in retCount.keys():
                if retCount[k]:
                    for kk in retCount[k].keys():
                        if publicModalityCount.get(k) and publicModalityCount[k].get(kk):
                            retCount[k][kk] += publicModalityCount[k][kk]
        if publicModalityCount:
            if not retCount:
                retCount = copy.deepcopy(publicModalityCount)
            else:
                for k in publicModalityCount.keys():
                    if publicModalityCount[k]:
                        if not retCount.has_key(k):
                            retCount[k] = copy.deepcopy(publicModalityCount[k])
                        else:
                            for kk in publicModalityCount[k].keys():
                                if not retCount[k].has_key(kk):
                                    retCount[k][kk] = publicModalityCount[k][kk]
        log.debug("retCount:%s" % retCount)
        return retCount

    @d.trace(log, ['memberID', 'termID', 'prePost', 'conceptCollectionHandle', 'collectionCreatorID'])
    def invalidate(self, memberID, termID, prePost=False, conceptCollectionHandle=None, collectionCreatorID=3):
        self.personalBrowseTermCache(model.INVALIDATE, memberID, termID, prePost, session=self.session, conceptCollectionHandle=conceptCollectionHandle, collectionCreatorID=collectionCreatorID)
        self.personalBrowseTermCache(model.INVALIDATE, memberID, termID, not prePost, session=self.session, conceptCollectionHandle=conceptCollectionHandle, collectionCreatorID=collectionCreatorID)

    @d.trace(log, ['memberID', 'termID', 'prePost', 'termDict', 'conceptCollectionHandle', 'collectionCreatorID'])
    def load(self, memberID, termID, prePost=False, termDict=None, conceptCollectionHandle=None, collectionCreatorID=3):
        return self.personalBrowseTermCache(model.LOAD, memberID, termID, prePost, termDict, session=self.session, conceptCollectionHandle=conceptCollectionHandle, collectionCreatorID=collectionCreatorID)


def diffDicts(publicModalityCount, ck12ModalityCount):
    """
        Return difference between 2 dictionaries
    """
    log.debug("publicModalityCount:%s" % publicModalityCount)
    log.debug("ck12modalityCount:%s" % ck12ModalityCount)
    retDict = {}
    if publicModalityCount:
        retDict = copy.deepcopy(publicModalityCount)
    if publicModalityCount and ck12ModalityCount:
        ## modality type
        for k in publicModalityCount.keys():
            if publicModalityCount[k]:
                retDict[k] = {}
                ## level
                for kk in publicModalityCount[k].keys():
                    if publicModalityCount[k][kk]:
                        retDict[k][kk] = publicModalityCount[k][kk]
                        if ck12ModalityCount.get(k) and ck12ModalityCount[k].get(kk):
                            diffCnt = retDict[k][kk] - ck12ModalityCount[k][kk]
                            if diffCnt:
                                retDict[k][kk] = diffCnt
                            else:
                                del retDict[k][kk]
                if not retDict[k]:
                    del retDict[k]
    log.debug("diff count:%s" % retDict)
    return retDict

class BrowseTermCache(object):

    def __init__(self, session=None):
        self.session = session
        self.personalBrowseTermCache = PersonalBrowseTermCache(session)

    @classmethod
    def browseTermCache(cls, action, termID, session=None, conceptCollectionHandle=None, collectionCreatorID=3):

        mongodb = getMongoDB(config)
        def getExerciseCount(termEID):
            ret = {'basic': 0, 'at grade': 0, 'advanced': 0}
            try:
                if termEID:
                    exEID = termEID
                    exJson = RemoteAPI.makeHomeworkpediaGetCall( '/get/info/dict/exercises/%s' % exEID )
                    log.debug("Exercise JSON: %s" % exJson)
                    if exJson['response']['exercises']:
                        if exJson['response']['exercises'].has_key(exEID):
                            ret['at grade'] = int(exJson['response']['exercises'][exEID]['questionCount'])
                        else:
                            for k in exJson['response']['exercises'].keys():
                                level = ''
                                if k.endswith('.1'):
                                    level = 'basic'
                                elif k.endswith('.2'):
                                    level = 'at grade'
                                elif k.endswith('.3'):
                                    level = 'advanced'
                                else:
                                    level = 'at grade'
                                if level:
                                    val = int(exJson['response']['exercises'][k]['questionCount'])
                                    if val:
                                        ret[level] += 1
            except Exception as e:
                log.debug("Error getting exercise count for %s" % termEID, exc_info=e)
                pass
            for r in ret.keys():
                if not ret[r]:
                    del ret[r]
            return ret

        def invalidate(termID, conceptCollectionHandle=None, collectionCreatorID=3):
            region_invalidate(load, 'forever', 'c-bt', termID, conceptCollectionHandle, collectionCreatorID)
            log.debug('cache: browseTermCache invalidated key[%d]-[%s]-[%d]' % (termID, conceptCollectionHandle, collectionCreatorID))

        @cache_region('forever', 'c-bt')
        def load(termID, conceptCollectionHandle=None, collectionCreatorID=3):
            termDict = {}
            if session:
                term = api._getBrowseTermByID(session, id=termID)
            else:
                term = api.getBrowseTermByID(id=termID)
            termDict = term.asDict(includeParent=True, recursive=False)
            termDict['browseModalityCount'] = termDict['publicModalityCount'] = termDict['descendantDomainCountWithModalities'] = 0
            termDict['publicDescendantModalityCount'] = termDict['descendantBrowseModalityCount'] = 0
            termDict['descendantDomainCountWithCK12Modalities'] = termDict['descendantDomainCountWithPublicModalities'] = 0
            if term.type.name == 'domain' and term.encodedID and conceptCollectionHandle and collectionCreatorID:
                collectionNode = CollectionNode(mongodb)
                colNode = collectionNode.getByConceptCollectionHandle(conceptCollectionHandle=conceptCollectionHandle, collectionCreatorID=collectionCreatorID, encodedID=term.encodedID)
                if colNode:
                    termDict['collection'] = collectionNode.asDict(colNode)

            if term.type.name in ['domain', 'pseudodomain', 'internal-tag']:
                if session:
                    termDict['browseModalityCount'] = api._countRelatedArtifactsForDomains(session, domainIDs=[term.id], memberID=None, ck12only=True, conceptCollectionHandle=conceptCollectionHandle, collectionCreatorID=collectionCreatorID)
                    termDict['publicModalityCount'] = api._countRelatedArtifactsForDomains(session, domainIDs=[term.id], memberID=None, ck12only=False, conceptCollectionHandle=conceptCollectionHandle, collectionCreatorID=collectionCreatorID)
                else:
                    termDict['browseModalityCount'] = api.countRelatedArtifactsForDomains(domainIDs=[term.id], memberID=None, ck12only=True, conceptCollectionHandle=conceptCollectionHandle, collectionCreatorID=collectionCreatorID)
                    termDict['publicModalityCount'] = api.countRelatedArtifactsForDomains(domainIDs=[term.id], memberID=None, ck12only=False, conceptCollectionHandle=conceptCollectionHandle, collectionCreatorID=collectionCreatorID)
                termDict['communityPublicModalityCount'] = diffDicts(termDict['publicModalityCount'], termDict['browseModalityCount'])

                if term.type.name == 'domain':
                    ## Get the latest modality timestamp
                    if session:
                        latestModality = api._getLatestModalityForDomains(session, domainIDs=[term.id], memberID=None, ck12only=True, conceptCollectionHandle=conceptCollectionHandle, collectionCreatorID=collectionCreatorID)
                    else:
                        latestModality = api.getLatestModalityForDomains(domainIDs=[term.id], memberID=None, ck12only=True, conceptCollectionHandle=conceptCollectionHandle, collectionCreatorID=collectionCreatorID)
                    termDict['latestModalityAdded'] = latestModality.creationTime if latestModality else None

                    descTermIDs = []
                    log.debug("Getting descendants for: %s" % term.id)
                    if session:
                        descendants = api._getBrowseTermDescendants(session, id=term.id, levels=None)
                    else:
                        descendants = api.getBrowseTermDescendants(id=term.id, levels=None)
                    for t in descendants:
                        descTermIDs.append(t.id)
                    log.debug("Descendant ids: %s" % str(descTermIDs))
                    termDict['descendantDomainCount'] = len(descTermIDs)
                    ## Get the latest modality for descendants timestamp
                    latestDescModality = None
                    ## Descendant count not support for subject levels and higher
                    if term.parent and term.parent.encodedID and term.parent.encodedID.lower() != 'ckt' and descTermIDs:
                        if session:
                            latestDescModality = api._getLatestModalityForDomains(session, domainIDs=descTermIDs, memberID=None, ck12only=True, conceptCollectionHandle=conceptCollectionHandle, collectionCreatorID=collectionCreatorID)
                        else:
                            latestDescModality = api.getLatestModalityForDomains(domainIDs=descTermIDs, memberID=None, ck12only=True, conceptCollectionHandle=conceptCollectionHandle, collectionCreatorID=collectionCreatorID)
                    termDict['latestDescendantModalityAdded'] = latestDescModality.creationTime if latestDescModality else None
                    termDict['descTermIDs'] = descTermIDs

                    if descTermIDs:
                        if session:
                            termDict['publicDescendantModalityCount'], termDict['descendantDomainCountWithPublicModalities'] = \
                                api._countRelatedArtifactsForDomains(session, domainIDs=descTermIDs, memberID=None, privateOnly=False, domainCount=True, conceptCollectionHandle=conceptCollectionHandle, collectionCreatorID=collectionCreatorID)
                            termDict['descendantBrowseModalityCount'], termDict['descendantDomainCountWithCK12Modalities'] = \
                                api._countRelatedArtifactsForDomains(session, domainIDs=descTermIDs, memberID=None, ck12only=True, domainCount=True, conceptCollectionHandle=conceptCollectionHandle, collectionCreatorID=collectionCreatorID)
                        else:
                            termDict['publicDescendantModalityCount'], termDict['descendantDomainCountWithPublicModalities'] = \
                                api.countRelatedArtifactsForDomains(domainIDs=descTermIDs, memberID=None, privateOnly=False, domainCount=True, conceptCollectionHandle=conceptCollectionHandle, collectionCreatorID=collectionCreatorID)
                            termDict['descendantBrowseModalityCount'], termDict['descendantDomainCountWithCK12Modalities'] = \
                                api.countRelatedArtifactsForDomains(domainIDs=descTermIDs, memberID=None, ck12only=True, domainCount=True, conceptCollectionHandle=conceptCollectionHandle, collectionCreatorID=collectionCreatorID)
                        termDict['communityPublicDescendantModalityCount'] = diffDicts(termDict['publicDescendantModalityCount'], termDict['descendantBrowseModalityCount'])

                    ## Following code not necessary since the exercise artifacts are now synced between hwp and flx2
                    use_exercise_artifacts = str(config.get('use_exercise_artifacts')).lower() == 'true'
                    if not use_exercise_artifacts:
                        ### Get exercise count
                        exCount = getExerciseCount(term.encodedID)
                        for key in ['modalityCount', 'browseModalityCount']:
                            if termDict.has_key(key) and type(termDict[key]).__name__ == 'dict':
                                if not termDict[key].has_key('exercise'):
                                    termDict[key]['exercise'] = {}
                                for l in exCount.keys():
                                    if not termDict[key]['exercise'].has_key(l):
                                        termDict[key]['exercise'][l] = 0
                                    termDict[key]['exercise'][l] += exCount[l]

                topTerm = term.getTopLevelAncestorTerm()
                if topTerm:
                    termDict['descendantOf'] = topTerm.asDict(includeParent=False)

                log.debug('cache: browseTermCache caching id[%d] -> browseTermDict[%s]' % (termID, termDict))
            return termDict

        if action == model.LOAD:
            log.debug('cache: browseTermCache loading key[%d]-[%s]-[%d]' % (termID, conceptCollectionHandle, collectionCreatorID))
            termDict = load(termID, conceptCollectionHandle, collectionCreatorID)
            if not termDict:
                invalidate(termID, conceptCollectionHandle, collectionCreatorID)
            else:
                log.debug('cache: browseTermCache cached key[%d]-[%s]-[%d]' % (termID, conceptCollectionHandle, collectionCreatorID))
            return termDict

        log.debug('cache: browseTermCache invalidate key[%d]-[%s]-[%d]' % (termID, conceptCollectionHandle, collectionCreatorID))
        invalidate(termID, conceptCollectionHandle, collectionCreatorID)

    @d.trace(log, ['termID', 'prePost', 'memberID', 'conceptCollectionHandle', 'collectionCreatorID'])
    def invalidate(self, termID, prePost=False, memberID=None, conceptCollectionHandle=None, collectionCreatorID=3):
        self.browseTermCache(model.INVALIDATE, termID, session=self.session, conceptCollectionHandle=conceptCollectionHandle, collectionCreatorID=collectionCreatorID)
        self.personalBrowseTermCache.invalidate(2, termID, prePost, conceptCollectionHandle=conceptCollectionHandle, collectionCreatorID=collectionCreatorID)
        if memberID:
            self.personalBrowseTermCache.invalidate(memberID, termID, prePost, conceptCollectionHandle=conceptCollectionHandle, collectionCreatorID=collectionCreatorID)

    @d.trace(log, ['termID', 'prePost', 'memberID', 'conceptCollectionHandle', 'collectionCreatorID'])
    def invalidateByEncodedID(self, termEID, prePost=False, memberID=None, conceptCollectionHandle=None, collectionCreatorID=3):
        if self.session:
            term = api._getBrowseTermByEncodedID(self.session, encodedID=termEID)
        else:
            term = api.getBrowseTermByEncodedID(encodedID=termEID)
        self.invalidate(term.id, prePost, memberID, conceptCollectionHandle, collectionCreatorID)

    @d.trace(log, ['termEID', 'memberID', 'level', 'prePost', 'modalitiesOnly', 'ck12only', 'communityOnly', 'conceptCollectionHandle', 'collectionCreatorID'])
    def loadByEID(self, termEID, memberID=None, level=None, prePost=False, modalitiesOnly=False, ck12only=False, communityOnly=False, conceptCollectionHandle=None, collectionCreatorID=3):
        if self.session:
            term = api._getBrowseTermByEncodedID(self.session, encodedID=termEID)
        else:
            term = api.getBrowseTermByEncodedID(encodedID=termEID)
        return self.load(term.id, memberID, level, prePost, modalitiesOnly, ck12only, communityOnly, conceptCollectionHandle, collectionCreatorID)

    @d.trace(log, ['termID', 'memberID', 'level', 'prePost', 'modalitiesOnly', 'ck12only', 'communityOnly', 'conceptCollectionHandle', 'collectionCreatorID'])
    def load(self, termID, memberID=None, level=None, prePost=False, modalitiesOnly=False, ck12only=False, communityOnly=False, conceptCollectionHandle=None, collectionCreatorID=3):
        bdict = self.browseTermCache(model.LOAD, termID, session=self.session, conceptCollectionHandle=conceptCollectionHandle, collectionCreatorID=collectionCreatorID)
        if communityOnly:
            bdict['descendantDomainCountWithModalities'] = bdict.pop('descendantDomainCountWithPublicModalities', 0) - bdict.pop('descendantDomainCountWithCK12Modalities', 0)
        elif ck12only:
            bdict['descendantDomainCountWithModalities'] = bdict.pop('descendantDomainCountWithCK12Modalities', 0)
        else:
            bdict['descendantDomainCountWithModalities'] = bdict.pop('descendantDomainCountWithPublicModalities', 0)

        if not memberID:
            memberID = 2
        if memberID:
            bdict = self.personalBrowseTermCache.load(memberID, termID, prePost, bdict, conceptCollectionHandle, collectionCreatorID)
        if communityOnly:
            if bdict.has_key('communityModalityCount'):
                bdict['modalityCount'] = bdict.get('communityModalityCount')
            if bdict.has_key('descendantCommunityModalityCount'):
                bdict['descendantModalityCount'] = bdict.get('descendantCommunityModalityCount')
        elif not communityOnly and not ck12only:
            bdict['modalityCount'] = PersonalBrowseTermCache.sumDicts(bdict.get('browseModalityCount', {}), bdict.get('communityModalityCount', {}))
            bdict['descendantModalityCount'] = PersonalBrowseTermCache.sumDicts(
                    bdict.get('descendantBrowseModalityCount', {}),
                    bdict.get('descendantCommunityModalityCount', {}))
        if level is not None:
            bdict['level'] = level
        log.debug("bdict: %s" % bdict)
        if modalitiesOnly:
            for k in ['artifactCount', 'descendantArtifactCount']:
                if bdict.has_key(k):
                    del bdict[k]
        if bdict.has_key('browseModalityCount'):
            if ck12only:
                bdict['modalityCount'] = bdict['browseModalityCount']
            bdict['ck12ModalityCount'] = bdict['browseModalityCount']
            del bdict['browseModalityCount']
        if bdict.has_key('descendantBrowseModalityCount'):
            if ck12only:
                bdict['descendantModalityCount'] = bdict['descendantBrowseModalityCount']
            bdict['descendantCK12ModalityCount'] = bdict['descendantBrowseModalityCount']
            del bdict['descendantBrowseModalityCount']
        for k in ['descTermIDs', 'publicModalityCount', 'publicDescendantModalityCount', 'communityPublicModalityCount', 'communityPublicDescendantModalityCount',
                  'descendantDomainCountWithPublicModalities', 'descendantDomainCountWithCK12Modalities']:
            if bdict.has_key(k):
                del bdict[k]
        return bdict


class ArtifactCommon(object):

    @d.trace(log, ['type', 'handle', 'realm', 'extDict', 'infoOnly'])
    def getArtifactByPerma(self, type, handle, realm=None, extDict=None, idOnly=False):
        artifactTypeDict = g.getArtifactTypes()
        if artifactTypeDict.has_key(type):
            typeID = artifactTypeDict[type]
        else:
            c.errorCode = ErrorCodes.UNKNOWN_ARTIFACT_TYPE
            raise Exception((_(u'Unknown artifact type[%(type)s]')  % {"type":type}).encode("utf-8"))
        if realm is None:
            creatorID = g.getCK12EditorID()
        else:
            key, login = realm.split(':')
            if key.lower() != 'user':
                c.errorCode = ErrorCodes.UNKNOWN_REALM_TYPE
                raise Exception((_(u'Unknown realm type[%(key)s]')  % {"key":key}).encode("utf-8"))

            tx = utils.transaction(h.getFuncName())
            with tx as session:
                member = api._getMemberByLogin(session, login=login)
                if not member:
                    c.errorCode = ErrorCodes.NO_SUCH_MEMBER
                    raise ex.NotFoundException((_(u'No member with login[%(login)s]')  % {"login":login}).encode("utf-8"))
                creatorID = member.id

        version = 0
        if extDict:
            value = extDict.get('version')
            if value:
                version = int(value)
                if version < 0:
                    c.errorCode = ErrorCodes.INVALID_VERSION
                    raise Exception((_(u'Invalid version[%(value)s]')  % {"value":value}).encode("utf-8"))

        ## [Bug: 9171] unquote cannot work with unicode
        ## So encode it, unquote it, decode it back
        handle = h.safe_decode(unquote(h.safe_encode(handle)))
        ar = PermaCache().load(handle, typeID, creatorID, version)
        if ar is None:
            c.errorCode = ErrorCodes.NO_SUCH_ARTIFACT
            raise ex.NotFoundException((_(u'No artifact with handle[%s] type[%s] realm[%s]' % (h.safe_encode(handle), h.safe_encode(type), h.safe_encode(realm)))).encode('utf-8'))
        return ar

    @d.trace(log, ['id', 'type'])
    def getArtifact(self, id, type=None):
        """
            Retrieves the artifact from the given id or title, and its type.
            If type is None, then it will look for all artifact types.
        """
        if type == 'artifact':
            type = None
        artifact = api.getArtifactByIDOrTitle(idOrTitle=id, typeName=type)
        if artifact is None:
            artifact = api.getArtifactByEncodedID(encodedID=id, typeName=type)
            if not artifact:
                c.errorCode = ErrorCodes.NO_SUCH_ARTIFACT
                if type is None:
                    type = 'artifact'
                raise ex.NotFoundException((_(u'No %(type)s identified by: %(id)s')  % {"type":type,"id": id}).encode("utf-8"))

        return artifact

    @d.trace(log, ['artifact', 'revisionID'])
    def getRevision(self, artifact, revisionID):
        """
            From the given artifact, returns the revision with id
            equals revisionID.
        """
        revisions = artifact.revisions
        if revisionID == 0:
            #
            # Not specified, get the latest.
            #
            return revisions[0]

        for revision in revisions:
            if revision.id == revisionID:
                return revision

        return None

    @d.trace(log, ['artifactID'])
    def getArtifactParents(self, artifactID):
        artifactParentsList = []
        if not artifactID:
            return artifactParentsList
        parents = api.getArtifactParents(artifactID=artifactID)
        for parent in parents:
            artifactDict, ar = ArtifactCache().load(id=parent['parentID'])
            artifactParentsList.append(artifactDict)
        return artifactParentsList

    @d.trace(log, ['artifactID','typeID'])
    def getAllChildren(self, artifactID, typeID):
        all_children_ids = api.getArtifactDescendants(artifactID)
        child_list = []
        for each_id in all_children_ids:
            each_artifact_dict, each_artifact = ArtifactCache().load(each_id)
            if each_artifact_dict['type']['id'] == typeID:
                child_list.append(each_artifact_dict)
        return child_list

    @d.trace(log, ['revisionID'])
    def isFavorite(self, revisionID):
        member = u.getCurrentUser(request, anonymousOkay=False)
        if member is None:
            return False

        favorite = api.getFavorite(artifactRevisionID=revisionID,
                                   memberID=member.id)
        return favorite is not None

    @d.trace(log, ['artifactID', 'revisionID', 'waitForTask'])
    def updateStatistics(self, artifactID, revisionID, waitForTask=False):
        """
            Added artifact, identified by artifactID to the viewed list of
            member, identified by memberID - asynchronously
        """
        from flx.controllers.celerytasks import artifact

        member = u.getCurrentUser(request, anonymousOkay=False)
        if not member:
            return None

        mva = artifact.memberViewedArtifactTask()
        task = mva.delay(memberID=member.id,
                         artifactID=artifactID,
                         revisionID=revisionID, user=member.id)
        log.debug("updateStatistics[%s, %s, %s] Task id: %s, waitForTask: %s" % (member.id, artifactID, revisionID, task.task_id, str(waitForTask)))
        if waitForTask:
            log.debug("Waiting for updateStatistics task to complete")
            task.wait()
        return task.task_id

    @d.trace(log, ['encodedID'])
    def _splitEncodedID(self, encodedID):
        """
            Splits the given encodedID into leaf and non-leaf.
        """
        if encodedID is None:
            return None, None, None

        encodedIDList = encodedID.split('.')
        try:
            leaf = int(encodedIDList[-1])
        except ValueError:
            return None, None, None

        nonLeaf = '.'.join(encodedIDList[0:-1])
        browseTerm = '.'.join(encodedIDList[0:-2])
        return leaf, nonLeaf, browseTerm

    @d.trace(log, ['id', 'typeName', 'level', 'memberID', 'preDomainIDs', 'postDomainIDs'])
    @cache_region('daily')
    def getPrePostForModalities(self, id, typeName, level, memberID, preDomainIDs, postDomainIDs):
        """
            Get pre/post modality for given pre/post domain ids
        """
        log.debug("getPrePostForModalities: %s, %s" % (preDomainIDs, postDomainIDs))
        preArtifacts = postArtifacts = None
        artifactTypeDict = g.getArtifactTypes()
        artifactTypeNameDict = g.getArtifactTypeNames()

        if preDomainIDs:
            for d in preDomainIDs:
                log.debug("Try getting pre for: %s, level: %s" % (d, level))
                preArts = api.getRelatedArtifactsForDomains(domainIDs=[ d ], typeIDs=[ artifactTypeDict[typeName] ], levels=[ level ], memberID=memberID)
                if not preArts:
                    preArts = api.getRelatedArtifactsForDomains(domainIDs=[ d ], typeIDs=[ artifactTypeDict[typeName] ], levels=None, memberID=memberID)
                if preArts:
                    preArtifacts = preArts
                    break

        preDict = {}
        if preArtifacts:
            for preArtifact in preArtifacts:
                log.debug("preArtifact: %s" % preArtifact)
                encodedID = '%s.%s.%d' % (preArtifact.domainEID, artifactTypeNameDict[preArtifact.artifactTypeID]['extensionType'], preArtifact.sequence) 
                preArtifact = preArtifact.artifact
                artifactDict, a = ArtifactCache().load(preArtifact.id, artifact=preArtifact, memberID=memberID, infoOnly=True)
                preDict[encodedID] = artifactDict

        if postDomainIDs:
            for d in postDomainIDs:
                log.debug("Try getting post for: %s, level: %s" % (d, level))
                postArts = api.getRelatedArtifactsForDomains(domainIDs=[ d ], typeIDs=[ artifactTypeDict[typeName] ], levels=[ level ], memberID=memberID)
                if not postArts:
                    postArts = api.getRelatedArtifactsForDomains(domainIDs=[ d ], typeIDs=[ artifactTypeDict[typeName] ], levels=None, memberID=memberID)
                log.debug("Post arts: %d" % len(postArts))
                if postArts:
                    postArtifacts = postArts
                    break
        postDict = {}
        if postArtifacts:
            for postArtifact in postArtifacts:
                encodedID = '%s.%s.%d' % (postArtifact.domainEID, artifactTypeNameDict[postArtifact.artifactTypeID]['extensionType'], postArtifact.sequence) 
                postArtifact = postArtifact.artifact
                artifactDict, a = ArtifactCache().load(postArtifact.id, artifact=postArtifact, memberID=memberID, infoOnly=True)
                postDict[encodedID] = artifactDict

        return preDict, postDict

    @d.trace(log, ['id', 'typeName', 'encodedID', 'level', 'memberID'])
    @cache_region('daily')
    def getPrePost(self, id, typeName, encodedID, level, memberID):
        if typeName not in ['concept', 'lesson']:
            return {}, {}
        leaf, nonLeaf, browseTerm = self._splitEncodedID(encodedID)
        if leaf is None:
            return {}, {}

        preArtifact = None
        postArtifact = None

        ## Do not check the same browse term - those are now related artifacts, not pre/post
        preEncodedID = browseTerm
        while preArtifact is None:
            #
            #  Get the pre-requisite browse term.
            #
            preEncodedID = api.getPreEncodedID(encodedID=preEncodedID)
            if not preEncodedID:
                break
            log.debug("Try getting pre for: %s, level: %s" % (preEncodedID, level))
            keys, values = api.getArtifactsByEncodedID(encodedID=preEncodedID, typeName=typeName, level=level, memberID=memberID)
            if not keys:
                ## Get without the level - any level is fine
                keys, values = api.getArtifactsByEncodedID(encodedID=preEncodedID, typeName=typeName, level=None, memberID=memberID)
            if keys:
                #
                #  Pick the last one.
                #
                preArtifact = values[keys[-1]]
                break
        preDict = {}
        if preArtifact is not None:
            ## TODO: infoOnly -> minimalOnly (done)
            artifactDict, a = ArtifactCache().load(preArtifact.id, artifact=preArtifact, memberID=memberID, minimalOnly=True)
            preDict[preArtifact.encodedID] = artifactDict

        postEncodedID = browseTerm
        while postArtifact is None:
            #
            #  Get the post-requisite browse term.
            #
            postEncodedID = api.getPostEncodedID(encodedID=postEncodedID)
            if not postEncodedID:
                break
            log.debug("Try getting post for: %s, level: %s" % (postEncodedID, level))
            keys, values = api.getArtifactsByEncodedID(encodedID=postEncodedID, typeName=typeName, level=level, memberID=memberID)
            if not keys:
                ## Get without level - any level is fine
                keys, values = api.getArtifactsByEncodedID(encodedID=postEncodedID, typeName=typeName, level=None, memberID=memberID)
            if keys:
                #
                #  Pick the first one.
                #
                postArtifact = values[keys[0]]
                break
        postDict = {}
        if postArtifact is not None:
            ## TODO: infoOnly -> minimalOnly (done)
            artifactDict, a = ArtifactCache().load(postArtifact.id, artifact=postArtifact, memberID=memberID, minimalOnly=True)
            postDict[postArtifact.encodedID] = artifactDict
        return preDict, postDict

    @d.trace(log, ['id', 'type', 'revisionID', 'ancestorRevisions', 'sequenceList', 'descType', 'infoOnly', 'level', 'artifact', 'extendedArtifacts', 'relatedArtifacts',
        'relatedModalities', 'domainID', 'preDomainIDs', 'postDomainIDs', 'minimalOnly', 'forUpdate'])
    def _get(self, id, type=None, revisionID=0, ancestorRevisions=None, sequenceList=[], descType=None, artifact=None, 
            infoOnly=False, level=None, extendedArtifacts=False, relatedArtifacts=False, relatedModalities=None,
            domainID=None, preDomainIDs=None, postDomainIDs=None, minimalOnly=False, forUpdate=False):
        """
            Retrieves the meta data of artifact identified by id. If type is
            specified, the look up will be limited to only the given artifact
            type. If revisionID is specified, it will return the revision
            identified by revisionID; otherwise, the latest revision.
        """
        member = u.getCurrentUser(request, anonymousOkay=False)
        memberID = member.id if member is not None else None
        artifactDict, artifact = ArtifactCache().load(id, revisionID, artifact, memberID, infoOnly=infoOnly, minimalOnly=minimalOnly, forUpdate=forUpdate)
        if artifact is None:
            if type is None:
                type = 'artifact'
            raise Exception((_(u'No %(type)s of id %(id)s')  % {"type":type,"id": id}).encode("utf-8"))
        elif type and type != 'artifact' and artifactDict['artifactType'] != type:
            log.error("Found artifact[id: %s] of type[%s] but expected type[%s]" % (id, artifactDict['artifactType'], type))
            raise Exception((_(u'No %(type)s of id %(id)s')  % {"type":type,"id": id}).encode("utf-8"))

        typeName = artifact.type.name
        revisionID = long(revisionID)
        revision = self.getRevision(artifact, revisionID)

        ## If we want a related artifact of different type (get a concept given a lesson, etc.)
        if descType and descType != 'artifact' and descType != typeName:
            revision = api.getRelatedArtifactRevision(artifactRevision=artifact.revisions[0], descType=descType)
            artifact = revision.artifact
            revisionID = revision.id
            id = artifact.id
            artifactDict, artifact = ArtifactCache().load(id, revisionID, artifact, memberID, infoOnly=infoOnly)
            typeName = artifact.type.name

        if not minimalOnly and relatedModalities and domainID:
            rm = RelatedArtifactCache().load(id, domainID, memberID)
            log.debug("RelatedModalities: %s" % rm)
            if rm and 'artifact' not in relatedModalities:
                cnt = 0
                while cnt < len(rm):
                    if rm[cnt]['artifactType'] not in relatedModalities:
                        rm.pop(cnt)
                        cnt -= 1
                    cnt += 1
            artifactDict['relatedModalities'] = rm
        if (not infoOnly and not minimalOnly) or ancestorRevisions:
            if level not in ['basic', 'at grade', 'advanced']:
                level = artifactDict.get('level')
            log.debug("Getting pre/post for level: %s" % level)
            if ancestorRevisions:
                preDict, postDict = self._getPrePostByAncestorSequence(ancestorRevisions[0], sequenceList, descType, memberID)

                if not minimalOnly:
                    ancestors = []
                    for i in range(len(ancestorRevisions)-1, -1, -1):
                        ancestorRevision = ancestorRevisions[i]
                        ancestors.append((ancestorRevision.artifactID, ancestorRevision.id))

                    ## Nearest ancestor first
                    log.debug("ancestors: %s" % ancestors)
                    """
                    ancestors = api.getArtifactsDictByIDs(idList=[ x[0] for x in ancestors ], 
                                                        revisionIDs=[ x[1] for x in ancestors],
                                                        memberID=memberID,
                                                        includeContent=False,
                                                        excludeChildren=True)
                    """
                    ancestorList = []
                    for id, rid in ancestors:
                        aDict, a = ArtifactCache().load(id, rid, memberID=memberID)
                        ancestorList.append(aDict)
                    ancestors = ancestorList
                    artifactDict['revisions'][0]['ancestors'] = {}
                    sList = sequenceList[:]
                    if len(ancestors) == 1:
                        ## direct child of book
                        sList[0] = 0
                    for i in range(0, len(ancestors)):
                        sList[-(i+1)] = 0
                        artifactDict['revisions'][0]['ancestors'][_getSequenceString(sList)] = ancestors[i]
            elif typeName in ['concept', 'lesson']:
                ## Get previous and next based on the concept node ordering - irrespective of a book or chapter
                preDict, postDict = self.getPrePost(id,
                                                    typeName,
                                                    artifactDict['encodedID'],
                                                    level,
                                                    memberID)
            else:
                preDict, postDict = self.getPrePostForModalities(id,
                        typeName,
                        level,
                        memberID,
                        preDomainIDs,
                        postDomainIDs)
                
            if preDict is not None:
                artifactDict['pre'] = preDict
            if postDict is not None:
                artifactDict['post'] = postDict
            #
            #  Get group editing info.
            #
            if not revisionID:
                if not revision:
                    revision = artifact.revisions[0]
                revisionID = revision.id
            data = api.getBookEditingAssignmentsFromARID(artifactRevisionID=revisionID)
            if data:
                artifactEditingAssignment, creatorID = data
                log.debug('_get: artifactEditingAssignment[%s]' % artifactEditingAssignment)
                log.debug('_get: creatorID[%s]' % creatorID)
                groupEditingData = {
                    'artifactRevisionID': revisionID,
                    'artifactID': artifactEditingAssignment.artifactID,
                    'bookID': artifactEditingAssignment.bookID,
                    'assigneeID': artifactEditingAssignment.assigneeID,
                    'groupID': artifactEditingAssignment.groupID,
                }
                artifactDict['groupEditing'] = groupEditingData

        if not extendedArtifacts:
            extArtDict = artifactDict.get('extendedArtifacts')
            #
            #  Only interested in the number of extended artifacts.
            #
            if not extArtDict:
                artifactDict['extendedArtifactsCount'] = 0
            else:
                typeCount = len(extArtDict)
                count = 0
                if typeCount > 0:
                    keys = extArtDict.keys()
                    for key in keys:
                        typeList = extArtDict[key]
                        count += len(typeList)
                artifactDict['extendedArtifactsCount'] = count
                del artifactDict['extendedArtifacts']

        return artifactDict, artifact, revision

    @d.trace(log, ['ancestorRevision', 'sequenceList', 'descType', 'memberID'])
    def _getPrePostByAncestorSequence(self, ancestorRevision, sequenceList=[], descType=None, memberID=None):
        """
            Get the next and previous artifact for an ancestor and a given sequenceList.
            Also get the next and previous parent for the artifact.
            descType is optional and specifies the type of previous and next artifacts returned
        """
        return PrePostCache().load(ancestorRevision, sequenceList=sequenceList, descType=descType, memberID=memberID)

    @d.trace(log, ['id', 'type', 'revisionID', 'options', 'ancestorRevisions', 'sequenceList', 
        'descType', 'waitForTask', 'domainID', 'preDomainIDs', 'postDomainIDs', 'forUpdate',
        'infoOnly', 'minimalOnly',])
    def getDetail(self, result, id, type=None, revisionID=0, options=[], ancestorRevisions=None, sequenceList=[], descType=None, 
            waitForTask=False, domainID=None, preDomainIDs=None, postDomainIDs=None, forUpdate=False, infoOnly=False, minimalOnly=False):
        """
            Retrieves the contents of artifact identified by id. If type is
            specified, the look up will be limited to only the given artifact
            type. If revisionID is specified, it will return the revision
            identified by revisionID; otherwise, the latest revision.
        """
        revision = None
        try:
            log.debug("Options: %s" % options)
            withMathJax = False
            if 'mathjax' in options:
                withMathJax = True
            includeChildContent = False
            if 'includeChildContent' in options:
                includeChildContent = True
            includeChildHeaders = False
            if 'includeChildHeaders' in options:
                includeChildHeaders = True
            extendedArtifacts = False
            if 'includeExtendedArtifacts' in options:
                extendedArtifacts = True
            relatedArtifacts = False
            if 'includeRelatedArtifacts' in options:
                relatedArtifacts = True
            level = None
            for o in options:
                if o.startswith('level='):
                    level = o.replace('level=', '')
                    break
            artifactDict, artifact, revision = self._get(id,
                                                         type,
                                                         revisionID,
                                                         ancestorRevisions=ancestorRevisions,
                                                         sequenceList=sequenceList,
                                                         descType=descType,
                                                         level=level,
                                                         extendedArtifacts=extendedArtifacts,
                                                         relatedArtifacts=relatedArtifacts,
                                                         forUpdate=forUpdate,
                                                         infoOnly=infoOnly,
                                                         minimalOnly=minimalOnly)
            #
            #  The default cache should already have contents with includeChildContent
            #  set to true for lessons and false otherwise, includeChildHeaders, and
            #  withMathJax set to false. Read the content for the non-default case.
            #
            """
                The includeChildContent has been internally turned on for lessons;
                so no need to do it here.

            ## Only allow includeChildContent for lesson
            if includeConceptContent and artifact.type.name == 'lesson':
                includeChildContent = True
            """
            if includeChildContent and artifact.type.name == 'lesson':
                includeChildContent = False
            if includeChildContent or includeChildHeaders or withMathJax:
                artifactDict = api.getArtifactContentDict(id=artifact.id,
                                                          artifactRevisionID=revisionID,
                                                          artifactDict=artifactDict,
                                                          withMathJax=withMathJax,
                                                          includeChildContent=includeChildContent,
                                                          includeChildHeaders=includeChildHeaders,
                                                          artifact=artifact)
            typeName = type if type is not None else 'artifact'
            result['response'][typeName] = artifactDict
            return result
        except Exception, e:
            log.error('get detail Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.NO_SUCH_ARTIFACT
            return ErrorCodes().asDict(c.errorCode, str(e))
        finally:
            try:
                if revision:
                    self.updateStatistics(artifact.id, revision.id, waitForTask=waitForTask)
                """
                #
                #  Reindex.
                #
                taskId = h.reindexArtifacts([id])
                log.debug("artifact getDetail[%s] Task id: %s" % (id, taskId))
                """
            except Exception, e:
                log.error('get detail unable to update statistics[%s]' % str(e), exc_info=e)
                pass

    @d.trace(log, ['id', 'type', 'revisionID', 'artifact', 'options', 'minimalOnly'])
    def getInfo(self, result, id, type=None, revisionID=0, artifact=None, options=[], minimalOnly=False):
        """
            Retrieves the meta data of artifact identified by id. If type is
            specified, the look up will be limited to only the given artifact
            type. If revisionID is specified, it will return the revision
            identified by revisionID; otherwise, the latest revision.
        """
        try:
            log.debug("Options: %s" % options)
            extendedArtifacts = False
            if 'includeExtendedArtifacts' in options:
                extendedArtifacts = True
            artifactDict, artifact, revision = self._get(id,
                                                         type=type,
                                                         revisionID=revisionID,
                                                         artifact=artifact,
                                                         infoOnly=True,
                                                         extendedArtifacts=extendedArtifacts,
                                                         minimalOnly=minimalOnly)
            typeName = type if type is not None else 'artifact'
            result['response'][typeName] = artifactDict
            return result
        except Exception, e:
            log.error('get info Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.NO_SUCH_ARTIFACT
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.trace(log, ['resourceType', 'artifactRevisions', 'attachmentsOnly', 'member'])
    def getResourcesInfo(self, resourceTypes, artifactRevisions, attachmentsOnly, member):
        rInfos = []
        if artifactRevisions:
            resources = {}
            orderedResources = []
            resourceTypes = [ x.strip() for x in resourceTypes.split(',') ]
            resourceTypeIDs = []
            if 'resource' in resourceTypes:
                resourceTypes = None
            if resourceTypes:
                resourceTypeDict, resourceTypeNameDict = g.getResourceTypes()
                for rt in resourceTypes:
                    if resourceTypeDict.get(rt.lower()):
                        resourceTypeIDs.append(resourceTypeDict[rt.lower()])
            for artifactRevision in artifactRevisions:
                rList = api.getResourcesFromArtifactRevisionID(artifactRevisionID=artifactRevision.id, resourceTypeIDs=resourceTypeIDs, attachmentsOnly=attachmentsOnly) #ArtifactResourceCache().load(artifactRevision.id)
                if rList:
                    for rr, r in rList:
                        if r.isAttachment and not (rr.publishTime or u.checkOwner(member, r.ownerID, failOnError=False)):
                            log.debug("Skipping resource id: %d (attachment) user: %d" % (r.id, member.id))
                            continue
                        if not resources.has_key(r.id):
                            orderedResources.append(r.id)
                            resources[r.id] = [ rr, r ]

            log.debug("Resources: %s" % str(resources))
            for rid in orderedResources:
                rr, r = resources.get(rid)
                rInfos.append(g.resourceHelper.getResourceInfo(rr, resource=r))
        return rInfos

    def getPermaArtifactRevisionID(self, artifact, extDict):
        revisionID = artifact.revisions[0].id
        value = extDict.get('version')
        if value:
            version = len(artifact.revisions) - value
            if version < 0 or version >= len(artifact.revisions):
                c.errorCode = ErrorCodes.INVALID_VERSION
                raise Exception((_(u'Invalid version[%(value)s]')  % {"value":value}).encode("utf-8"))
            log.debug("Getting version: %d" % version)
            revision = artifact.revisions[version]
            revisionID = revision.id
            log.debug("Revision ID: %d" % revisionID)
        return revisionID

    def parseExtension(self, extDict=None):
        if not extDict:
            extDict = h.parsePermaExtension(request.params.get('extension'))

        value = extDict.get('withMathJax')
        options = []
        if value and str(value).lower() == 'true':
            options.append('mathjax')
        value = extDict.get('includeconceptcontent')
        if value and str(value).lower() == 'true':
            options.append('includeConceptContent')
        value = extDict.get('includechildcontent')
        if value and str(value).lower() == 'true':
            options.append('includeChildContent')
        value = extDict.get('includechildheaders')
        if value and str(value).lower() == 'true':
            options.append('includeChildHeaders')
        value = extDict.get('includeextendedartifacts')
        if value and str(value).lower() == 'true':
            options.append('includeExtendedArtifacts')
        value = extDict.get('includerelatedartifacts')
        if value and str(value).lower() == 'true':
            options.append('includeRelatedArtifacts')
        value = extDict.get('includerelatedmodalities')
        if value:
            options.append('includeRelatedModalities=%s' % value.lower())
        value = extDict.get('level')
        if value:
            options.append('level=%s' % value.lower())

        return options

@cache_region('monthly')
def getConceptsInfo():
    conceptsInfo = api.getConceptsInfo()
    return conceptsInfo

@cache_region('daily')
def getStopWords():
    return api.getStopWords(getAll=True)
