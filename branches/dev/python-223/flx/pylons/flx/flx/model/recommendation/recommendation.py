import logging
from datetime import datetime
from copy import deepcopy
import re
import traceback

from BeautifulSoup import BeautifulSoup
from pylons import app_globals as g

from flx.model.mongo.validationwrapper import ValidationWrapper
from flx.model import api, meta
from flx.model.mongo import relatedartifacts
from flx.model.mongo import standard
from flx.controllers.common import ArtifactCache
from flx.lib import helpers as h
from pylons import config

log = logging.getLogger(__name__)

class Recommendation(ValidationWrapper):

    def __init__(self, db, dc=False):
        self.db = db
        # Dependency check flag
        self.dc = dc
        self.required_fields = ['memberID']

    """
        Get Recommendation
    """
    def getRecommendations(self, **kwargs):
        try:
            global config
            self.before_insert(**kwargs)
            kwargs['creationTime'] = datetime.now()
            kwargs['updateTime'] = datetime.now()
            memberID = kwargs.get('memberID')
            instanceID = kwargs.get('instanceID')
            scoreLevel = kwargs.get('scoreLevel')
            pageSize = kwargs.get('pageSize', None)
            pageNum = kwargs.get('pageNum', 1)
            modalityTypes = kwargs.get('modalityTypes', ['lesson', 'lecture', 'enrichment'])
            level = kwargs.get('level', None)
            levelToScore = {'basic':1, 'at grade':2, 'advanced':3}
            if level:
                level = level.strip().lower()
                if level not in levelToScore:
                    raise Exception('level should be one of basic, at grade, advanced')
                scoreLevel = levelToScore.get(level)
            levels = kwargs.get('levels', [])
            encodedIDs = kwargs.get('encodedIDs')
            sid = kwargs.get('sid')
            conceptCollectionHandle = kwargs.get('conceptCollectionHandle')
            collectionCreatorID = kwargs.get('collectionCreatorID')
            # Get the associated concepts from SID
            if sid:
                standardRec = standard.Standard(self.db).getByLabel(label=sid, setName=kwargs.get('boardName', None))
                if not standardRec:
                    raise Exception("Incorrect SID: [%s] specified" % sid)
                conceptEids = standardRec.get('conceptEids', None)
                if not conceptEids:
                    raise Exception("No concepts associated with SID: %s" % sid)
                if encodedIDs:
                    # Raise exception if the any of the provides eid is not associated with SID
                    eids = [eid.upper() for eid in encodedIDs]
                    assocEids = [conceptEid.upper() for conceptEid in conceptEids]
                    nonAssocEids = set(eids) - set(assocEids)
                    if nonAssocEids:
                        log.info("SID:%s, encodedIDs:%s concepts:%s" % (sid, str(encodedIDs),str(conceptEids)))
                        raise Exception("Not all the encodedIDs: %s are associated with SID: %s" % (str(eids), sid))
                else:
                    encodedIDs = conceptEids

                log.info("SID:%s encodedIDs:%s" % (sid, str(encodedIDs)))

            kwargs['encodedID'] = [eid.upper() for eid in encodedIDs]

            log.info('memberID: [%s],  Kwargs: [%s]' %(memberID, kwargs))

            requestParams = deepcopy(kwargs)
            del requestParams['updateTime']
            requestID = RecommendationRequest(self.db).recordRequest(**requestParams)
            log.info('Stored request. requestID: [%s]' %(requestID))

            recommendation = self.db.Recommendations.find_one({'instanceID': instanceID, 'memberID': memberID})
            if recommendation:
                userActions = recommendation.get('userActions', [])
            else:
                del kwargs['scoreLevel']
                userActions = []
                kwargs['userActions'] = userActions
                recommendationID = self.db.Recommendations.insert(kwargs)
                log.info('Created a new recommendation. recommendationID: [%s]' %(recommendationID))

            modalities = self.recommendModalities(encodedIDs, scoreLevel, modalityTypes=modalityTypes, levels=levels, excludeIDs=userActions, conceptCollectionHandle=conceptCollectionHandle, 
                    collectionCreatorID=collectionCreatorID, pageNum=pageNum, pageSize=pageSize, includeEfficacy=kwargs.get('includeEfficacy'))
            return modalities
        except Exception as e:
            log.error('Error while getting recommendations: %s' %(str(e)), exc_info=e)
            raise e
        return True

    def getModalities(self, domain, modalityTypes=['lesson'], levels=[], excludeIDs=[]):
        global config

        encodedID = domain.encodedID
        log.info('Fetching modalities for encodedID: [%s]' %(encodedID))
        domain = api.getBrowseTermByEncodedID(encodedID=encodedID)
        artifactTypesDict = g.getArtifactTypes()
        typeIDs = []
        for eachModalityType in modalityTypes:
            typeIDs.append(artifactTypesDict[eachModalityType])

        relatedArtifacts = api.getRelatedArtifactsForDomains(domainIDs=[domain.id], typeIDs=typeIDs, ownedBy='ck12', excludeIDs=excludeIDs, pageNum=1, pageSize=100)
        modalities = []
        for eachModality in relatedArtifacts:
            artifact = api.getArtifactByID(id=eachModality.id)
            modalities.append(artifact)

        return modalities

    def recommendModalities(self, encodedIDs, scoreLevel, modalityTypes=['lesson'], levels=[], excludeIDs=[], conceptCollectionHandle=None, collectionCreatorID=3, pageNum=1, pageSize=3, includeEfficacy=False):
        allLevels = ['sentinel', 'basic', 'at grade', 'advanced']
        allRLevels = ['advanced', 'at grade', 'basic']
        modalityPreference = {'lesson':12, 'simulationint':11, 'plix':10, 'lecture':9, 'enrichment':8, 'rwa':7, 'studyguide':6}
        if pageSize:
            topX = pageSize
        else:
            topX = len(modalityTypes)

        if scoreLevel in [0, 1]:
            currentLevel = 'basic'
        elif scoreLevel == 2:
            currentLevel = 'at grade'
        elif scoreLevel == 3:
            currentLevel = 'advanced'

        domainInfo = {}
        for encodedID in encodedIDs:
            domain = api.getBrowseTermByEncodedID(encodedID=encodedID)
            if domain:
                domainDict = domain.asDict()
            else:
                domainDict = {}
            domainInfo[encodedID.upper()] = domainDict

        #modalities = self.getModalities(domain, modalityTypes=modalityTypes, excludeIDs=excludeIDs)
        #if not modalities and excludeIDs:
        #    modalities = self.getModalities(domain, modalityTypes=modalityTypes, excludeIDs=[])

        kwargs = {'encodedIDs':encodedIDs, 'conceptCollectionHandle': conceptCollectionHandle, 'collectionCreatorID': collectionCreatorID}
        relatedArtifacts = relatedartifacts.RelatedArtifacts(self.db).getRelatedArtifact(**kwargs)
        opModalities = []
        for relatedArtifact in relatedArtifacts:
            tmpModalities = relatedArtifact['artifacts']
            tmpEID = relatedArtifact['encodedID']
            tmpModalities = filter(lambda x: x['artifactType'] in modalityTypes, tmpModalities)
            # Filter the modalities on level
            if levels:
                tmpModalities = filter(lambda x: x['level'] in levels, tmpModalities)

            eidDict = {'encodedID':tmpEID.upper()}
            [x.update(eidDict) for x in tmpModalities]
            opModalities.extend(tmpModalities)

        log.info("Modalities::%s" % str(opModalities))
        unSortedModalities = []
        for eachModality in opModalities:
            modalityProperty = {}

            level = eachModality.get('level', '')
            if not level:
                level = 'basic'
            level = level.lower()
            if level == currentLevel:
                sortLevel = 3
            else:
                if currentLevel == 'advanced':
                    sortLevel = 3 - allRLevels.index(level)
                else:
                    sortLevel = 3 - allLevels.index(level)
            modalityProperty['level'] = sortLevel

            modalityProperty['modalityType'] = modalityPreference.get(eachModality.get('artifactType'), 1)
            log.info('Optimized Modalities level: [%s], sortLevel: [%s], type: [%s], typePreference: [%s]' %(level, sortLevel, eachModality.get('artifactType'), modalityProperty['modalityType']))

            modalityProperty['pop_score'] = eachModality.get('pop_score', 0)

            modalityProperty['artifact'] = eachModality

            unSortedModalities.append(modalityProperty)


        sortedModalities = sorted(unSortedModalities, key=lambda x:(x['level'], x['modalityType'], x['pop_score']), reverse=True)
        #start_offset = (pageNum - 1) * pageSize
        #end_offset = start_offset +  pageSize
        #sortedModalities = sortedModalities[start_offset:end_offset]

        filteredModalities = []
        if sortedModalities:
            curr = []
            for eachSortedModality in sortedModalities:
                if len(filteredModalities) == topX:
                    break
                modalityType = eachSortedModality['artifact']['artifactType']
                modalityGroup = self.getModalityGroup(modalityType)
                if modalityGroup not in curr:
                    log.info('artifactID: [%s] modalityType: [%s] modalityGroup: [%s]' %(eachSortedModality['artifact']['artifactID'], modalityType, modalityGroup))
                    filteredModalities.append(eachSortedModality)
                    curr.append(modalityGroup)
        if pageSize:
            for eachSortedModality in sortedModalities:
                if len(filteredModalities) == topX:
                    break
                if eachSortedModality not in filteredModalities:
                    filteredModalities.append(eachSortedModality)

        log.debug('filteredModalities: [%s]' %(filteredModalities))
        #sortedModalities = sortedModalities[:topX]
        #filteredModalities = [x['artifact'].asDict() for x in filteredModalities]
        modalities = []
        for modality in filteredModalities:
            try:
                artifactDict, artifact = ArtifactCache().load(modality['artifact']['artifactID'])
            except Exception as cacheException:
                log.error('Error getting artifact info for artifactID: [%s] from cache - most likely because the artifact no longer exists. Skipping...' %(modality['artifact']['artifactID']))
                log.error(traceback.format_exc(cacheException))
                continue
            artifactDict.pop('revisions', None)
            artifactDict.pop('children', None)
            artifactDict.pop('relatedArtifacts', None)
            #log.info('artifactDict: [%s]' %(artifactDict.get('xhtml', None)))
            excerpt = self.getModalityExcerpt(artifactDict)
            artifactDict.pop('xhtml', None)
            artifactDict.pop('xhtml_prime', None)
            #log.info('excerpt: [%s]' %(excerpt))
            #modalityDict = modality['artifact'].asDict()
            modalityDict = artifactDict
            modalityDict['domain'] = domainInfo[modality['artifact']['encodedID']]
            if conceptCollectionHandle:
                collectionHandle, absoluteHandle = h.splitConceptCollectionHandle(conceptCollectionHandle)
                modalityDict['collection'] = { 'collectionHandle': collectionHandle, 'conceptAbsoluteHandle': absoluteHandle, 'collectionCreatorID': collectionCreatorID }
            modalityDict['excerpt'] = excerpt
            modalities.append(modalityDict)
        filteredModalities = modalities

        try:
            if len(encodedIDs) > 0 and includeEfficacy in ['True', 'true', 'TRUE', 'Yes', 'yes', 'YES', 'On' ,'on','ON', True] and config.get('flx.recommendations.include.assessment-scores') in ['True', 'true', 'TRUE', 'Yes', 'yes', 'YES', 'On' ,'on','ON', True]:
                collectionName = config.get('flx.recommendations.assessment-scores.collection-name')
                if collectionName is None:
                    collectionName = 'ModalityAssessmentScores'

                if collectionName in self.db.collection_names():
                    #Consider also the encodedIDs which are redirected to this encodedID during the collectionMigration
                    migratedEncodedIDInfos = meta.Session.query(meta.MigratedConcepts.c.newEID, meta.MigratedConcepts.c.originalEID).filter(meta.MigratedConcepts.c.newEID.in_(encodedIDs)).all()
                    for migratedEncodedIDInfo in migratedEncodedIDInfos:
                        migratedEncodedID = migratedEncodedIDInfo[1]
                        if migratedEncodedID not in encodedIDs:
                            encodedIDs.append(migratedEncodedID)

                    modalityImpactPeriod = config.get('flx.recommendations.assessment-scores.modality-impact-period')
                    if modalityImpactPeriod is None:
                        modalityImpactPeriod = 1209600000

                    minimumTotalResponses = config.get('flx.recommendations.assessment-scores.minimum-total-responses')
                    if minimumTotalResponses is None:
                        minimumTotalResponses = 3

                    recommendedModalityIDList = []
                    for modality in filteredModalities:
                        if modality.get('id'):
                            recommendedModalityIDList.append(modality['id'])

                    for modality in filteredModalities:
                        modality['assessmentScore'] = '0.00';

                    for encodedID in encodedIDs:
                        log.debug('Existing Modality Assessment Scores: '+str([modality['assessmentScore'] for modality in filteredModalities]))
                        log.debug('Processing encodedID: '+encodedID+' for efficacy calculation.')
                        assessmentKey = 'assessmentScore-'+str(modalityImpactPeriod)+'-'+str(minimumTotalResponses)
                        matchQuery = {'$match':{'$and':[{'_id.modalityID':{'$in':recommendedModalityIDList}}, {'_id.contextEID':encodedID.upper()}]}}
                        groupQuery = {'$group':{'_id':'$_id.modalityID', 'correctResponses':{'$sum':'$'+assessmentKey+'.correctResponses'}, 'totalResponses':{'$sum':'$'+assessmentKey+'.totalResponses'}}}
                        recommendedModalityAssessmentScores = self.db[collectionName].aggregate([matchQuery, groupQuery])['result']
                        recommendedModalityAssessmentScoresMap = {}
                        for recommendedModalityAssessmentScore in recommendedModalityAssessmentScores:
                            if recommendedModalityAssessmentScore['totalResponses'] != 0:
                                recommendedModalityAssessmentScorePercentage = round((recommendedModalityAssessmentScore['correctResponses']*1.0 / recommendedModalityAssessmentScore['totalResponses'])*100, 2)
                                recommendedModalityAssessmentScoresMap[recommendedModalityAssessmentScore['_id']] = str(recommendedModalityAssessmentScorePercentage)
                        log.debug('RecommendedModalityAssessmentScoresMap computed in efficacy calculation: '+str(recommendedModalityAssessmentScoresMap))
                        for modality in filteredModalities:
                            if modality.get('id') and recommendedModalityAssessmentScoresMap.has_key(modality['id']):
                                existingRecommendedModalityAssessmentScore = modality.get('assessmentScore')
                                currentRecommendedModalityAssessmentScore = recommendedModalityAssessmentScoresMap[modality['id']]
                                if currentRecommendedModalityAssessmentScore > existingRecommendedModalityAssessmentScore:
                                    modality['assessmentScore'] = currentRecommendedModalityAssessmentScore
                else:
                    #though includeAssessmentScores is turnedOn, the specified / default assessment scores collection could not be found in the database
                    log.info('Assessment Scores Collection : [ %s ] could not be found in the database. Hence the returned recommendations would not contain any assessment-scores' %(collectionName))
        except (Exception) as e:
            log.info('Assessmentscore feature could not be run on this request because of the exception : '+str(e))
        return filteredModalities

    def getModalityGroup(self, modalityType):
        if modalityType in ['lecture', 'enrichment']:
            return 'video'
        return modalityType

    def getModalityExcerpt(self, modality):
        excerpt = ''
        xhtml = modality.get('xhtml', None)
        if xhtml:
            xhtml = re.sub('<!--(.*?)-->', '', xhtml, re.DOTALL)
            soup = BeautifulSoup(xhtml)
            paragraphs = soup.findAll('p')
            paragraphCount = len(paragraphs)
            i = 0
            for i in range(paragraphCount):
                if paragraphs[i].parent and paragraphs[i].parent.name == 'div' and paragraphs[i].parent.get('class', '') == 'x-ck12-data-objectives':
                    continue
                if not paragraphs[i].text.strip():
                    continue
                break
            for j in range(3):
                offset = i+j
                log.debug('offset: [%s], length: [%s]' %(offset, len(paragraphs)))
                if offset < len(paragraphs):
                    excerpt += str(paragraphs[offset])
            log.debug('Excerpt for artifact id: [%s], [%s]' %(modality['id'], excerpt))
        return excerpt

class RecommendationRequest(ValidationWrapper):

    def __init__(self, db, dc=False):
        self.db = db
        # Dependency check flag
        self.dc = dc
        self.required_fields = ['instanceID', 'encodedID', 'memberID']


    def recordRequest(self, **kwargs):
        self.before_insert(**kwargs)
        instanceID = kwargs.get('instanceID')
        if not instanceID:
            raise Exception('instanceID not specified. Cannot proceed')

        requestID = self.db.RecommendationRequests.insert(kwargs)
        return requestID

class RecommendationUserAction(ValidationWrapper):

    def __init__(self, db, dc=False):
        self.db = db
        # Dependency check flag
        self.dc = dc
        self.required_fields = ['instanceID', 'userAction']


    def recordUserAction(self, **kwargs):
        self.before_insert(**kwargs)
        instanceID = kwargs.get('instanceID')
        memberID = kwargs.get('memberID')
        if not instanceID:
            raise Exception('instanceID not specified. Cannot proceed')
        userAction = kwargs.get('userAction')
        if not userAction:
            raise Exception('userAction not specified. Cannot proceed')

        recommendation = self.db.Recommendations.find_one({'instanceID': instanceID})
        if not recommendation:
            raise Exception('Cannot find any recommendation for instanceID: [%s]' %(instanceID))

        requestParams = deepcopy(kwargs)
        requestParams['encodedID'] = recommendation.get('encodedID')
        requestID = RecommendationRequest(self.db).recordRequest(**requestParams)
        log.info('Stored request. requestID: [%s]' %(requestID))

        updateTime = datetime.now()
        self.db.Recommendations.update({"instanceID":instanceID, 'memberID':memberID}, {"$push":{"userActions": userAction}, "$set":{"updateTime": updateTime}})
        
class AssignmentRecommendations(ValidationWrapper):

    def __init__(self, db, dc=False):
        self.db = db
        # Dependency check flag
        self.dc = dc
        self.required_fields = []


    def getAssignmentRecommendations(self, conceptEIDs):

        eidCollection = {}
        for eachConcept in conceptEIDs:
            eid, collectionHandle = eachConcept.split('||')
            eidCollection[eid.upper()] = collectionHandle.split('-::-')[0]
        #recommendations = []
        #for concept in cursor:
        #    _tmp = concept
        #    _tmp['collectionHandle'] = eidCollection[recommendedConcepts[concept['encodedID']]]
        #    recommendations.append(_tmp)

        #recommendations = self.db.AssignmentRecommendations.find({'concept_eid': {'$in':eidCollection.keys()}}).distinct('recommend_concept_eid')
        recommendations = self.db.AssignmentRecommendations.find({'concept_eid': {'$in':eidCollection.keys()}})
        recommendedConcepts = {}
        query = []
        for eachRecommendation in recommendations:
            if eachRecommendation['recommend_concept_eid'] not in recommendedConcepts.keys() + eidCollection.keys(): 
                recommendedConcepts[eachRecommendation['recommend_concept_eid']] = eachRecommendation['concept_eid']
                query.append({'encodedID': eachRecommendation['recommend_concept_eid'], 'collection.handle': eidCollection[eachRecommendation['concept_eid']]})


        #if not recommendations:
        #    recommendations = []
        log.info('Assignment Recommendations for: [%s] is: [%s]' %(conceptEIDs, recommendedConcepts.keys()))
        #recommendations = list(set(recommendations) - set(eidCollection.keys()))
        #cursor = self.db.ConceptNodes.find({'encodedID': {'$in':recommendedConcepts.keys()}})
        recommendations = []
        if query:  
            cursor = self.db.CollectionNodes.find({'$or': query})
            recommendations = list(cursor)
        #recommendations = []
        #for concept in cursor:
        #    _tmp = concept
        #    _tmp['collectionHandle'] = eidCollection[recommendedConcepts[concept['encodedID']]]
        #    recommendations.append(_tmp)

        return recommendations
