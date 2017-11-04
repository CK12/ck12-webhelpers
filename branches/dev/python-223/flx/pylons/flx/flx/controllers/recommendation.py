import logging
import traceback
from urllib import unquote

from pylons import request, tmpl_context as c
#from beaker.cache import cache_region
from pylons import app_globals as g

from flx.controllers.mongo.base import MongoBaseController
from flx.controllers import decorators as d
import flx.controllers.user as u
from flx.model import model as m
from flx.model import api
from flx.lib import helpers as h
from flx.controllers.errorCodes import ErrorCodes

from flx.model.recommendation import recommendation

log = logging.getLogger(__name__)

class RecommendationController(MongoBaseController):
    """
        Recommendation related APIs.
    """
    def __init__(self, **kwargs):
        MongoBaseController.__init__(self, **kwargs)

    #
    #  Get recommendations
    #
    @d.jsonify()
    @d.trace(log)
    def getRecommendations(self):
        """
            Get recommendations
        """
        try:
            result = MongoBaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            user = u.getCurrentUser(request)
            kwargs = {}

            memberID = user.id
            if memberID == 2:
                adsVisitor = request.cookies.get('dexterjsVisitorID')
                if adsVisitor:
                    memberID = adsVisitor
            log.info('memberID: [%s]' %(memberID))
            kwargs['memberID'] = memberID

            encodedIDs = request.params.get('encodedID', None)
            sid = request.params.get('sid', None)

            modalityTypes = request.params.get('modalityTypes', ['lesson', 'lecture', 'enrichment'])
            if modalityTypes:
                if type(modalityTypes).__name__ != 'list':
                    modalityTypes = unquote(modalityTypes).split(',')
                kwargs['modalityTypes'] = modalityTypes
                log.info('modalityTypes: [%s]' %(modalityTypes))

            kwargs['pageSize'] = None
            pageSize = request.params.get('pageSize', 0)
            if pageSize:
                kwargs['pageSize'] = int(pageSize)

            pageNum = request.params.get('pageNum', 1)
            kwargs['pageNum'] = int(pageNum)
            conceptCollectionHandle = request.params.get('conceptCollectionHandle')
            collectionCreatorID = None
            if conceptCollectionHandle:
                conceptCollectionHandle = h.unquoteIterate(conceptCollectionHandle)
                collectionCreatorID = request.params.get('collectionCreatorID', '3')
                if collectionCreatorID:
                    collectionCreatorID = int(collectionCreatorID)

            log.debug("conceptCollectionHandle: %s, collectionCreatorID: %s" % (conceptCollectionHandle, collectionCreatorID))
            searchTerm = request.params.get('searchTerm', None)
            if searchTerm:
                searchPageSize = kwargs['pageSize'] if kwargs.get('pageSize', 0) > 0 else 10
                hits = self._searchCK12Modalities(pageNum=1, pageSize=searchPageSize, searchTerm=searchTerm, typeNames=modalityTypes,
                    infoOnly=True, minimalOnly=True,
                    sort=None, fq=[], specialSearch=False, extendedArtifacts=False,
                    relatedArtifacts=False, includeEIDs=True, ck12only=True,
                    communityContributed=False, minScore=0.0, onlyHits=True, spellSuggest=False)
                log.debug('Search hits: [%s]' %(hits))
                hits = hits['artifactList']
                if hits:
                    eidsDict = {}
                    for hit in hits:
                        if not hit.get('domainIDs.ext'):
                            continue
                        for domainID in hit['domainIDs.ext']:
                            domainID = domainID.upper()
                            if not eidsDict.has_key(domainID):
                                eidsDict[domainID] = True
                    encodedIDs = eidsDict.keys()

            if not (sid or encodedIDs):
                conceptName = request.params.get('conceptName', None)
                conceptHandle = None
                if conceptName:
                    conceptHandle = m.title2Handle(conceptName)
                    browseTermType = api.getBrowseTermTypeByName(name='domain')
                    domainTerm = api.getBrowseTermByHandle(handle=conceptHandle, typeID=browseTermType.id)
                    if domainTerm:
                        encodedIDs = domainTerm.encodedID
                        log.info('Concept EID from conceptName: [%s]' %(encodedIDs))
                    else:
                        raise Exception('No concept found for conceptHandle: [%s]' %(conceptHandle))


            # Either encodedID or SID should be provided.
            if sid:
                kwargs['sid'] = sid
                log.info('sid [%s]' %(sid))
            kwargs['boardName'] = request.params.get('boardName', None)
            if encodedIDs:
                if type(encodedIDs).__name__ != 'list':
                    encodedIDs = unquote(encodedIDs).split(',')
                kwargs['encodedIDs'] = encodedIDs
                log.info('encodedIDs [%s]' %(encodedIDs))

            if not (sid or encodedIDs or conceptHandle):
                raise Exception('EncodedIDs or SID or conceptName not specified')

            scoreLevel = request.params.get('scoreLevel', 2)
            if not scoreLevel:
                raise Exception('scoreLevel not specified')
            kwargs['scoreLevel'] = int(scoreLevel)

            level = request.params.get('level', None)
            if level:
                kwargs['level'] = unquote(level)

            instanceID = request.params.get('instanceID', None)
            if not instanceID:
                raise Exception('instanceID not specified')
            kwargs['instanceID'] = instanceID

            levels = request.params.get('levels', None)
            if levels:
                levels = unquote(levels).split(',')
                kwargs['levels'] = levels
                log.info('levels: [%s]' %(levels))

            kwargs['includeEfficacy'] = request.params.get('includeEfficacy')
            if conceptCollectionHandle:
                kwargs['conceptCollectionHandle'] = conceptCollectionHandle
                kwargs['collectionCreatorID'] = collectionCreatorID
            result['response']['modalities'] = recommendation.Recommendation(self.db).getRecommendations(**kwargs)
            return result
        except Exception, e:
            log.error('Error in initiating a recommendation[%s]' %(str(e)))
            c.errorCode = ErrorCodes.CANNOT_INITIATE_RECOMMENDATION
            log.error(traceback.format_exc(e))
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.ck12_cache_region('daily')
    def _searchCK12Modalities(self, pageNum, pageSize, searchTerm, typeNames=[],
            infoOnly=True, minimalOnly=False,
            sort=None, fq=[], specialSearch=False, extendedArtifacts=False,
            relatedArtifacts=False, includeEIDs=None, ck12only=False,
            communityContributed=False, minScore=0.0, onlyHits=False, spellSuggest=True):
        start = (pageNum-1) * pageSize
        log.info("Page number: %d, page size: %d" % (pageNum, pageSize))
        hits = api.searchModalities(domain=None, term=searchTerm, typeNames=typeNames,
                fq=fq, sort=sort, start=start, rows=pageSize, memberID=None, spellSuggest=spellSuggest,
                specialSearch=specialSearch, extendedArtifacts=extendedArtifacts,
                relatedArtifacts=relatedArtifacts, includeEIDs=includeEIDs, idsOnly=True,
                ck12only=ck12only, communityContributed=communityContributed, minScore=minScore)
        return hits


    #
    #  Record User Action
    #
    @d.jsonify()
    @d.trace(log)
    def recordUserAction(self):
        """
            Record user action
        """
        try:
            result = MongoBaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            user = u.getCurrentUser(request)
            kwargs = {}

            memberID = user.id
            if memberID == 2:
                adsVisitor = request.cookies.get('dexterjsVisitorID')
                if adsVisitor:
                    memberID = adsVisitor
            log.info('memberID: [%s]' %(memberID))
            kwargs['memberID'] = memberID

            instanceID = request.params.get('instanceID', None)
            if not instanceID:
                raise Exception('instanceID not specified')
            kwargs['instanceID'] = instanceID

            userAction = request.params.get('userAction', None)
            if not userAction:
                raise Exception('userAction not specified')
            kwargs['userAction'] = userAction

            result['response'] = recommendation.RecommendationUserAction(self.db).recordUserAction(**kwargs)
            return result
        except Exception, e:
            log.error('Error in initiating a recommendation[%s]' %(str(e)))
            c.errorCode = ErrorCodes.CANNOT_INITIATE_RECOMMENDATION
            log.error(traceback.format_exc(e))
            return ErrorCodes().asDict(c.errorCode, str(e))
        
    #
    #  Recommend Assignment Concept Pairs
    #
    @d.jsonify()
    @d.trace(log)
    def getAssignmentRecommendations(self):
        """
            Recommend Assignment Concept Pairs
        """
        try:
            result = MongoBaseController.getResponseTemplate(self, ErrorCodes.OK, 0)

            conceptEIDs = request.params.get('conceptEIDs', None)
            if not conceptEIDs:
                raise Exception('conceptEIDs not specified')
            conceptEIDs = conceptEIDs.split(',')

            log.info('Concept EIDs: [%s]' %(conceptEIDs))

            result['response'] = recommendation.AssignmentRecommendations(self.db).getAssignmentRecommendations(conceptEIDs)
            # Disable recommending assignment recommendations for 2.7 (temporary fix)
            #result['response'] = []
            return result
        except Exception, e:
            log.error('Error in recommending assignment concept pairs[%s]' %(str(e)))
            c.errorCode = ErrorCodes.CANNOT_INITIATE_RECOMMENDATION
            log.error(traceback.format_exc(e))
            return ErrorCodes().asDict(c.errorCode, str(e))
