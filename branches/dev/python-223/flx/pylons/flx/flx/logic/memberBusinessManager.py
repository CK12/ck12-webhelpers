from flx.controllers.common import ArtifactCache
from flx.model.memberVisitorDataManager import MemberVisitorDataModel
from flx.model import exceptions
from pylons import config
import pymongo
import logging

log = logging.getLogger(__name__)
class MemberBusinessLogic(object):

    #static block initializing mongoConnectionPool
    mongoClient = None
    mongoServerAddress = None
    mongoDataBaseName = None
    mongoURL = config.get('mongo_uri')
    if mongoURL and '/' in mongoURL:
        mongoServerAddress, mongoDBAndCollectionName = mongoURL.rsplit('/', 1)
        if mongoDBAndCollectionName and '.' in mongoDBAndCollectionName:
            mongoDataBaseName, mongoCollectionName = mongoDBAndCollectionName.rsplit('.', 1)
        else:
            mongoDataBaseName = mongoDBAndCollectionName

        mongoServerAddressWithDBName = mongoServerAddress+'/'+mongoDataBaseName
        mongoMaxPoolSize = config.get('mongo.max_pool_size', 10)
        try:
            mongoMaxPoolSize = int(mongoMaxPoolSize)
        except (ValueError, TypeError) as e:
            mongoMaxPoolSize = 10

        mongoReplicaSet = config.get('mongo.replica_set')
        if mongoReplicaSet:
            mongoClient = pymongo.MongoReplicaSetClient(hosts_or_uri=mongoServerAddressWithDBName, max_pool_size=mongoMaxPoolSize, replicaSet=mongoReplicaSet, read_preference=pymongo.read_preferences.ReadPreference.PRIMARY_PREFERRED)
        else:
            mongoClient = pymongo.MongoClient(host=mongoServerAddressWithDBName, max_pool_size=mongoMaxPoolSize)

    mongoMemberReadInfosCollectionName = config.get('flx.member.readinfos.collection.name')
    if not mongoMemberReadInfosCollectionName:
        mongoMemberReadInfosCollectionName = 'ArtifactVisits'

    def __init__(self):
        self.dataModel = MemberVisitorDataModel()

    ##Implementation Assumptions
    # 1: contextEID is of form SUB.BRA.CONCEPT*
        # SUB - 3 letter code of Subject.
        # BRA - 3 letter code of Branch. 
        # CONCEPT - The code for Concept. Could be of any length.
    #2 : Could be many to many relationships between them. (Though it is ideally one-one)
    
    def getLastReadModalities(self, **kwargs):
        if MemberBusinessLogic.mongoClient:
            mongoDataBase = MemberBusinessLogic.mongoClient.get_default_database()
            if mongoDataBase and mongoDataBase.name == MemberBusinessLogic.mongoDataBaseName:
                if MemberBusinessLogic.mongoMemberReadInfosCollectionName in mongoDataBase.collection_names():
                    mongoMemberReadInfosCollection = mongoDataBase[MemberBusinessLogic.mongoMemberReadInfosCollectionName]
                    memberID = kwargs['memberID']
                    offset = kwargs.get('offSet', 0)
                    limit = kwargs.get('limit', 10)
                    query_dict = dict()
                    query_dict['memberID'] = memberID
                    collectionHandles = kwargs.get('collectionHandles')
                    subjects = kwargs.get('subjects')
                    branches = kwargs.get('branches')
                    conceptEID = kwargs.get('conceptEID')
                    modalityTypes = kwargs.get('modalityTypes')
                    flow = kwargs.get('flow')
                    isModality = kwargs.get('isModality')
                    withEID = kwargs.get('withEID')                    
                    if collectionHandles:
                        query_dict['collectionHandle'] = {'$in': collectionHandles}
                    if subjects:
                        query_dict['subject'] = {'$in': subjects}
                    if branches:
                        query_dict['branch'] = {'$in': branches}
                    if conceptEID:
                        query_dict['encodedID'] = conceptEID.upper()                        
                    if modalityTypes:
                        query_dict['modalityType'] = {'$in': modalityTypes}
                    if flow:
                        query_dict['flow'] = flow
                    if isModality:
                        query_dict['isModality'] = isModality
                    if withEID:
                        query_dict['withEID'] = withEID
                    log.info("query_dict : %s" % query_dict)
                    results = mongoMemberReadInfosCollection.find(query_dict).sort('lastReadAt',-1).skip(offset).limit(limit)
                    log.info("results : %s" % results)
                    resultDocuments = [result for result in results]
                    modalityIDs = [long(resultDocument['artifactID']) for resultDocument in resultDocuments if resultDocument.get('artifactID')]
                    conceptEIDs = []
                    branchEIDs = []
                    subjectEIDs = []
                    for resultDocument in resultDocuments:
                        if resultDocument.has_key('encodedID'):
                            contextEID = resultDocument.get('encodedID')
                            if contextEID:
                                contextEIDDotCount = contextEID.count('.')
                                if contextEIDDotCount >= 2:
                                    conceptEIDs.append(contextEID)
                                elif contextEIDDotCount == 1:
                                    branchEIDs.append(contextEID)
                                elif contextEIDDotCount == 0 and contextEID:
                                    subjectEIDs.append(contextEID)

                    conceptInfoDictsMap = {}
                    branchInfoDictsMap = {}
                    subjectInfoDictsMap = {}
                    if conceptEIDs:
                        conceptInfoDictsMap = self.dataModel.getLastReadConcepts(conceptEIDs)
                    if branchEIDs:
                        branchInfoDictsMap = self.dataModel.getLastReadBranches(branchEIDs)
                    if subjectEIDs:
                        subjectInfoDictsMap = self.dataModel.getLastReadSubjects(subjectEIDs)

                    for resultDocument in resultDocuments:
                        if resultDocument.has_key('encodedID'):
                            contextEID = resultDocument.pop('encodedID')
                            if conceptInfoDictsMap.has_key(contextEID):
                                resultDocument[u'contextInfo'] =  conceptInfoDictsMap[contextEID]
                                resultDocument[u'contextInfo'][u'contextType'] = 'CONCEPT'
                            elif branchInfoDictsMap.has_key(contextEID):
                                resultDocument[u'contextInfo'] = branchInfoDictsMap[contextEID]
                                resultDocument[u'contextInfo'][u'contextType'] = 'BRANCH'
                            elif subjectInfoDictsMap.has_key(contextEID):
                                resultDocument[u'contextInfo'] = subjectInfoDictsMap[contextEID]
                                resultDocument[u'contextInfo'][u'contextType'] = 'SUBJECT'
                            else:
                                resultDocument[u'contextInfo'] = {u'contextEID':contextEID}
                                resultDocument[u'contextInfo'][u'contextType'] = 'NONE'

                    if modalityIDs:
                        details = kwargs['details'] if kwargs.has_key('details') else False
                        modalityInfoDictsMap = self.dataModel.getLastReadModalities(modalityIDs)
                        log.info("modalityInfoDictsMap:%s" %modalityInfoDictsMap)
                        log.info("modalityInfoDictsMap keys :%s" % modalityInfoDictsMap.keys())
                        log.info("resultDocuments:%s" %resultDocuments)
                        for resultDocument in resultDocuments:
                            if resultDocument.has_key('artifactID'):
                                modalityID = long(resultDocument.get('artifactID'))
                                log.info("modalityID:%s" % modalityID)
                                if modalityInfoDictsMap.has_key(modalityID):
                                    resultDocument.update(modalityInfoDictsMap[modalityID])
                                else:
                                    resultDocument[u'modalityID'] = modalityID
                                if details:
                                    artifactDict, artifact = ArtifactCache().load(id=modalityID)
                                    resultDocument[u'modalityInfo'] = artifactDict                
                    return resultDocuments
                else:
                    raise exceptions.SystemConfigurationException(u"configured mongoMemberReadInfosCollectionName : [{mongoMemberReadInfosCollectionName}] could not be found on the configured mongoDataBaseName : [{mongoDataBaseName}] of mongoClient created from the configured mongoURL : [{mongoURL}].".format(mongoMemberReadInfosCollectionName=MemberBusinessLogic.mongoMemberReadInfosCollectionName, mongoDataBaseName=MemberBusinessLogic.mongoDataBaseName, mongoURL=MemberBusinessLogic.mongoURL).encode('utf-8'))
            else:
                raise exceptions.SystemConfigurationException(u"configured mongoDataBaseName : [{mongoDataBaseName}] is not the defaultDataBase of the mongoClient created from the configured mongoURL : [{mongoURL}].".format(mongoDataBaseName=MemberBusinessLogic.mongoDataBaseName, mongoURL=MemberBusinessLogic.mongoURL).encode('utf-8'))
        else:
            raise exceptions.SystemConfigurationException(u"mongoClient could not be created from the configured mongoURL : [{mongoURL}].".format(mongoURL=MemberBusinessLogic.mongoURL).encode('utf-8'))

    def getLastReadConcepts(self, memberID, subjects=None, branches=None, offSet=0, limit=10):
        if MemberBusinessLogic.mongoClient:
            mongoDataBase = MemberBusinessLogic.mongoClient.get_default_database()
            if mongoDataBase and mongoDataBase.name == MemberBusinessLogic.mongoDataBaseName:
                if MemberBusinessLogic.mongoMemberReadInfosCollectionName in mongoDataBase.collection_names():
                    mongoMemberReadInfosCollection = mongoDataBase[MemberBusinessLogic.mongoMemberReadInfosCollectionName]
                    query_dict = dict()
                    query_dict['memberID'] = memberID
                    query_dict['flow'] = 'modality'
                    query_dict['isModality'] = True
                    query_dict['encodedID'] = {'$exists': True}
                    if subjects:
                        query_dict['subject'] = {'$in': subjects}
                    
                    if branches:
                        query_dict['branch'] = {'$in': branches}

                    results = mongoMemberReadInfosCollection.find(query_dict).sort('lastReadAt',-1).skip(offSet).limit(limit)
                    log.info("results : %s" % results)
                    if results:
                        resultDocuments = [result for result in results]
                        conceptEIDs = [resultDocument['encodedID'] for resultDocument in resultDocuments]
                        if conceptEIDs:
                            conceptInfoDictsMap = self.dataModel.getLastReadConcepts(conceptEIDs)
                            for resultDocument in resultDocuments:
                                conceptEID = resultDocument.pop('encodedID')
                                if conceptInfoDictsMap.has_key(conceptEID):
                                    resultDocument.update(conceptInfoDictsMap[conceptEID])
                                else:
                                    resultDocument[u'conceptEID'] = conceptEID
                        return resultDocuments
                    else:
                        raise exceptions.SystemInternalException(u"could not retrieve the last-read information from the dataBase.".encode('utf-8'))
                else:
                    raise exceptions.SystemConfigurationException(u"configured mongoMemberReadInfosCollectionName : [{mongoMemberReadInfosCollectionName}] could not be found on the configured mongoDataBaseName : [{mongoDataBaseName}] of mongoClient created from the configured mongoURL : [{mongoURL}].".format(mongoMemberReadInfosCollectionName=MemberBusinessLogic.mongoMemberReadInfosCollectionName, mongoDataBaseName=MemberBusinessLogic.mongoDataBaseName, mongoURL=MemberBusinessLogic.mongoURL).encode('utf-8'))                                   
            else:
                raise exceptions.SystemConfigurationException(u"configured mongoDataBaseName : [{mongoDataBaseName}] is not the defaultDataBase of the mongoClient created from the configured mongoURL : [{mongoURL}].".format(mongoDataBaseName=MemberBusinessLogic.mongoDataBaseName, mongoURL=MemberBusinessLogic.mongoURL).encode('utf-8'))
        else:
            raise exceptions.SystemConfigurationException(u"mongoClient could not be created from the configured mongoURL : [{mongoURL}].".format(mongoURL=MemberBusinessLogic.mongoURL).encode('utf-8'))

    def getLastReadBranches(self, memberID, subjects=None, offSet=0, limit=10):
        if MemberBusinessLogic.mongoClient:
            mongoDataBase = MemberBusinessLogic.mongoClient.get_default_database()
            if mongoDataBase and mongoDataBase.name == MemberBusinessLogic.mongoDataBaseName:
                if MemberBusinessLogic.mongoMemberReadInfosCollectionName in mongoDataBase.collection_names():
                    mongoMemberReadInfosCollection = mongoDataBase[MemberBusinessLogic.mongoMemberReadInfosCollectionName]

                    query_dict = dict()
                    query_dict['memberID'] = memberID
                    query_dict['branch'] = {'$exists': True}
                    if subjects:
                        query_dict['subject'] = {'$in': subjects}
                                            
                    results = mongoMemberReadInfosCollection.find(query_dict).sort('lastReadAt',-1).skip(offSet).limit(limit)
                    log.info("results : %s" % results)                                        
                    if results:
                        resultDocuments = [result for result in results if result.get('branch')]
                        branchEIDs = []
                        for resultDocument in resultDocuments:
                            branchEID = '%s.%s' % (resultDocument['subject'], resultDocument['branch'])
                            branchEIDs.append(branchEID)
                            
                        if branchEIDs:
                            branchInfoDictsMap = self.dataModel.getLastReadBranches(branchEIDs)
                            for resultDocument in resultDocuments:
                                branchEID = '%s.%s' % (resultDocument['subject'], resultDocument['branch'])
                                if branchInfoDictsMap.has_key(branchEID):
                                    resultDocument.update(branchInfoDictsMap[branchEID])
                                else:
                                    resultDocument[u'branchEID'] = branchEID
                        return resultDocuments
                    else:
                        raise exceptions.SystemInternalException(u"could not retrieve the last-read information from the dataBase.".encode('utf-8'))
                else:
                    raise exceptions.SystemConfigurationException(u"configured mongoMemberReadInfosCollectionName : [{mongoMemberReadInfosCollectionName}] could not be found on the configured mongoDataBaseName : [{mongoDataBaseName}] of mongoClient created from the configured mongoURL : [{mongoURL}].".format(mongoMemberReadInfosCollectionName=MemberBusinessLogic.mongoMemberReadInfosCollectionName, mongoDataBaseName=MemberBusinessLogic.mongoDataBaseName, mongoURL=MemberBusinessLogic.mongoURL).encode('utf-8'))                                   
            else:
                raise exceptions.SystemConfigurationException(u"configured mongoDataBaseName : [{mongoDataBaseName}] is not the defaultDataBase of the mongoClient created from the configured mongoURL : [{mongoURL}].".format(mongoDataBaseName=MemberBusinessLogic.mongoDataBaseName, mongoURL=MemberBusinessLogic.mongoURL).encode('utf-8'))
        else:
            raise exceptions.SystemConfigurationException(u"mongoClient could not be created from the configured mongoURL : [{mongoURL}].".format(mongoURL=MemberBusinessLogic.mongoURL).encode('utf-8'))

    def getLastReadSubjects(self, memberID, offSet=0, limit=10):
        if MemberBusinessLogic.mongoClient:
            mongoDataBase = MemberBusinessLogic.mongoClient.get_default_database()
            if mongoDataBase and mongoDataBase.name == MemberBusinessLogic.mongoDataBaseName:
                if MemberBusinessLogic.mongoMemberReadInfosCollectionName in mongoDataBase.collection_names():
                    mongoMemberReadInfosCollection = mongoDataBase[MemberBusinessLogic.mongoMemberReadInfosCollectionName]
                    query_dict = dict()
                    query_dict['memberID'] = memberID
                    query_dict['subject'] = {'$exists': True}
                    results = mongoMemberReadInfosCollection.find(query_dict).sort('lastReadAt',-1).skip(offSet).limit(limit)
                    log.info("results : %s" % results)                                        
                    if results:
                        resultDocuments = [result for result in results if result.get('subject')]
                        subjectEIDs = [resultDocument['subject'] for resultDocument in resultDocuments]
                            
                        if subjectEIDs:
                            subjectInfoDictsMap = self.dataModel.getLastReadSubjects(subjectEIDs)
                            for resultDocument in resultDocuments:
                                subjectEID = resultDocument['subject']
                                if subjectInfoDictsMap.has_key(subjectEID):
                                    resultDocument.update(subjectInfoDictsMap[subjectEID])
                                else:
                                    resultDocument[u'subjectEID'] = subjectEID
                        return resultDocuments
                    else:
                        raise exceptions.SystemInternalException(u"could not retrieve the last-read information from the dataBase.".encode('utf-8'))

                else:
                    raise exceptions.SystemConfigurationException(u"configured mongoMemberReadInfosCollectionName : [{mongoMemberReadInfosCollectionName}] could not be found on the configured mongoDataBaseName : [{mongoDataBaseName}] of mongoClient created from the configured mongoURL : [{mongoURL}].".format(mongoMemberReadInfosCollectionName=MemberBusinessLogic.mongoMemberReadInfosCollectionName, mongoDataBaseName=MemberBusinessLogic.mongoDataBaseName, mongoURL=MemberBusinessLogic.mongoURL).encode('utf-8'))                                   
            else:
                raise exceptions.SystemConfigurationException(u"configured mongoDataBaseName : [{mongoDataBaseName}] is not the defaultDataBase of the mongoClient created from the configured mongoURL : [{mongoURL}].".format(mongoDataBaseName=MemberBusinessLogic.mongoDataBaseName, mongoURL=MemberBusinessLogic.mongoURL).encode('utf-8'))
        else:
            raise exceptions.SystemConfigurationException(u"mongoClient could not be created from the configured mongoURL : [{mongoURL}].".format(mongoURL=MemberBusinessLogic.mongoURL).encode('utf-8'))

    def getViewedModalities(self, memberID, eids, visitorID=None, offSet=0, limit=10):
        if MemberBusinessLogic.mongoClient:
            mongoDataBase = MemberBusinessLogic.mongoClient.get_default_database()
            if mongoDataBase and mongoDataBase.name == MemberBusinessLogic.mongoDataBaseName:
                if MemberBusinessLogic.mongoMemberReadInfosCollectionName in mongoDataBase.collection_names():
                    mongoMemberReadInfosCollection = mongoDataBase[MemberBusinessLogic.mongoMemberReadInfosCollectionName]
                    query_dict = dict()
                    query_dict['memberID'] = memberID
                    if visitorID:
                        query_dict['visitorID'] = visitorID
                    query_dict['encodedID'] = {'$in': eids}
                    results = mongoMemberReadInfosCollection.find(query_dict).skip(offSet).limit(limit)
                    log.debug("results : %s" % results)                                        
                    if results:
                        resultDocuments = [result for result in results]
                        log.info('resultDocuments : %s' % resultDocuments)
                        return resultDocuments
                    else:
                        return []
                else:
                    raise exceptions.SystemConfigurationException(u"configured mongoMemberReadInfosCollectionName : [{mongoMemberReadInfosCollectionName}] could not be found on the configured mongoDataBaseName : [{mongoDataBaseName}] of mongoClient created from the configured mongoURL : [{mongoURL}].".format(mongoMemberReadInfosCollectionName=MemberBusinessLogic.mongoMemberReadInfosCollectionName, mongoDataBaseName=MemberBusinessLogic.mongoDataBaseName, mongoURL=MemberBusinessLogic.mongoURL).encode('utf-8'))                                   
            else:
                raise exceptions.SystemConfigurationException(u"configured mongoDataBaseName : [{mongoDataBaseName}] is not the defaultDataBase of the mongoClient created from the configured mongoURL : [{mongoURL}].".format(mongoDataBaseName=MemberBusinessLogic.mongoDataBaseName, mongoURL=MemberBusinessLogic.mongoURL).encode('utf-8'))
        else:
            raise exceptions.SystemConfigurationException(u"mongoClient could not be created from the configured mongoURL : [{mongoURL}].".format(mongoURL=MemberBusinessLogic.mongoURL).encode('utf-8'))

    def getViewedSubjects(self, memberID, visitorID=None, offSet=0, limit=10):
        if MemberBusinessLogic.mongoClient:
            mongoDataBase = MemberBusinessLogic.mongoClient.get_default_database()
            if mongoDataBase and mongoDataBase.name == MemberBusinessLogic.mongoDataBaseName:
                if MemberBusinessLogic.mongoMemberReadInfosCollectionName in mongoDataBase.collection_names():
                    mongoMemberReadInfosCollection = mongoDataBase[MemberBusinessLogic.mongoMemberReadInfosCollectionName]
                    query_list = []
                    query_dict = dict()
                    if memberID:
                        query_dict['$match'] = {
                            'memberID': memberID,
                            'subject': {
                                '$exists': True
                            }
                        }
                    elif visitorID:
                        query_dict['$match'] = {
                            'visitorID': visitorID,
                            'subject': {
                                '$exists': True
                            }
                        }
                    query_list.append(query_dict)
                    query_dict = dict()
                    query_dict['$group'] = {
                        '_id': '$subject',
                        'total': {
                            '$sum': 1
                        }
                    }
                    query_list.append(query_dict)
                    query_dict = dict()
                    query_dict['$sort'] = {
                        'total': -1
                        
                    }
                    query_list.append(query_dict)
                    log.debug("query_list : %s" % query_list)                                        
                    results = mongoMemberReadInfosCollection.aggregate(query_list)
                    log.debug("results : %s" % results)                                        
                    if results:
                        results = results.get('result')
                        log.debug("results : %s" % results)                                        
                        if results:
                            resultDocuments = [result for result in results]
                            log.info('resultDocuments : %s' % resultDocuments)
                            return resultDocuments

                    return []
                else:
                    raise exceptions.SystemConfigurationException(u"configured mongoMemberReadInfosCollectionName : [{mongoMemberReadInfosCollectionName}] could not be found on the configured mongoDataBaseName : [{mongoDataBaseName}] of mongoClient created from the configured mongoURL : [{mongoURL}].".format(mongoMemberReadInfosCollectionName=MemberBusinessLogic.mongoMemberReadInfosCollectionName, mongoDataBaseName=MemberBusinessLogic.mongoDataBaseName, mongoURL=MemberBusinessLogic.mongoURL).encode('utf-8'))                                   
            else:
                raise exceptions.SystemConfigurationException(u"configured mongoDataBaseName : [{mongoDataBaseName}] is not the defaultDataBase of the mongoClient created from the configured mongoURL : [{mongoURL}].".format(mongoDataBaseName=MemberBusinessLogic.mongoDataBaseName, mongoURL=MemberBusinessLogic.mongoURL).encode('utf-8'))
        else:
            raise exceptions.SystemConfigurationException(u"mongoClient could not be created from the configured mongoURL : [{mongoURL}].".format(mongoURL=MemberBusinessLogic.mongoURL).encode('utf-8'))

    def getViewedBranches(self, memberID, visitorID=None, offSet=0, limit=10):
        if MemberBusinessLogic.mongoClient:
            mongoDataBase = MemberBusinessLogic.mongoClient.get_default_database()
            if mongoDataBase and mongoDataBase.name == MemberBusinessLogic.mongoDataBaseName:
                if MemberBusinessLogic.mongoMemberReadInfosCollectionName in mongoDataBase.collection_names():
                    mongoMemberReadInfosCollection = mongoDataBase[MemberBusinessLogic.mongoMemberReadInfosCollectionName]
                    query_list = []
                    query_dict = dict()
                    if memberID:
                        query_dict['$match'] = {
                            'memberID': memberID,
                            'subject': {
                                '$exists': True
                            }
                        }
                    elif visitorID:
                        query_dict['$match'] = {
                            'visitorID': visitorID,
                            'subject': {
                                '$exists': True
                            }
                        }
                    query_list.append(query_dict)
                    query_dict = dict()
                    query_dict['$group'] = {
                        '_id': {
                            'subject': '$subject',
                            'branch': '$branch',
                        },
                        'total': {
                            '$sum': 1
                        }
                    }
                    query_list.append(query_dict)
                    query_dict = dict()
                    query_dict['$sort'] = {
                        'total': -1
                        
                    }
                    query_list.append(query_dict)
                    log.debug("query_list : %s" % query_list)                                        
                    results = mongoMemberReadInfosCollection.aggregate(query_list)
                    log.debug("results : %s" % results)                                        
                    if results:
                        results = results.get('result')
                        log.debug("results : %s" % results)                                        
                        if results:
                            resultDocuments = [result for result in results]
                            log.info('resultDocuments : %s' % resultDocuments)
                            return resultDocuments

                    return []
                else:
                    raise exceptions.SystemConfigurationException(u"configured mongoMemberReadInfosCollectionName : [{mongoMemberReadInfosCollectionName}] could not be found on the configured mongoDataBaseName : [{mongoDataBaseName}] of mongoClient created from the configured mongoURL : [{mongoURL}].".format(mongoMemberReadInfosCollectionName=MemberBusinessLogic.mongoMemberReadInfosCollectionName, mongoDataBaseName=MemberBusinessLogic.mongoDataBaseName, mongoURL=MemberBusinessLogic.mongoURL).encode('utf-8'))                                   
            else:
                raise exceptions.SystemConfigurationException(u"configured mongoDataBaseName : [{mongoDataBaseName}] is not the defaultDataBase of the mongoClient created from the configured mongoURL : [{mongoURL}].".format(mongoDataBaseName=MemberBusinessLogic.mongoDataBaseName, mongoURL=MemberBusinessLogic.mongoURL).encode('utf-8'))
        else:
            raise exceptions.SystemConfigurationException(u"mongoClient could not be created from the configured mongoURL : [{mongoURL}].".format(mongoURL=MemberBusinessLogic.mongoURL).encode('utf-8'))
            

    def getLastReadStandards(self, **kwargs):
        if MemberBusinessLogic.mongoClient:
            mongoDataBase = MemberBusinessLogic.mongoClient.get_default_database()
            if mongoDataBase and mongoDataBase.name == MemberBusinessLogic.mongoDataBaseName:
                mongoStandardReadInfoCollection = mongoDataBase['StandardViews']
                memberID = kwargs['memberID']
                visitorID = kwargs['visitorID']
                if memberID:
                    results = mongoStandardReadInfoCollection.find({'memberID':memberID}).sort('count', -1)
                else:
                    results = mongoStandardReadInfoCollection.find({'visitorID':visitorID}).sort('count', -1)
                log.debug("results : %s" % results)                                        
                resultDocuments = []
                for result in results:
                    del result['_id'] 
                    if result.get('memberID'):
                        del result['memberID'] 
                    if result.get('visitorID'):
                        del result['visitorID']                         
                    resultDocuments.append(result)
                return resultDocuments
            else:
                raise exceptions.SystemConfigurationException(u"configured mongoDataBaseName : [{mongoDataBaseName}] is not the defaultDataBase of the mongoClient created from the configured mongoURL : [{mongoURL}].".format(mongoDataBaseName=MemberBusinessLogic.mongoDataBaseName, mongoURL=MemberBusinessLogic.mongoURL).encode('utf-8'))
        else:
            raise exceptions.SystemConfigurationException(u"mongoClient could not be created from the configured mongoURL : [{mongoURL}].".format(mongoURL=MemberBusinessLogic.mongoURL).encode('utf-8'))
