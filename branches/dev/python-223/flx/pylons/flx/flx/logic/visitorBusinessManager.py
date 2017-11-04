from flx.model.memberVisitorDataManager import MemberVisitorDataModel
from flx.model import exceptions
from pylons import config
import pymongo
import re

class VisitorBusinessLogic(object):

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

    mongoVisitorReadInfosCollectionName = config.get('flx.visitor.readinfos.collection.name')
    if not mongoVisitorReadInfosCollectionName:
        mongoVisitorReadInfosCollectionName = 'VisitorReadInfos'

    def __init__(self):
        self.dataModel = MemberVisitorDataModel()

    ##Implementation Assumptions
    # 1: contextEID is of form SUB.BRA.CONCEPT*
        # SUB - 3 letter code of Subject.
        # BRA - 3 letter code of Branch. 
        # CONCEPT - The code for Concept. Could be of any length.
    #2 : Could be many to many relationships between them. (Though it is ideally one-one)
    
    def getLastReadModalities(self, visitorID, subjectEID=None, branchEID=None, conceptEID=None, offSet=0, limit=10):
        if VisitorBusinessLogic.mongoClient:
            mongoDataBase = VisitorBusinessLogic.mongoClient.get_default_database()
            if mongoDataBase and mongoDataBase.name == VisitorBusinessLogic.mongoDataBaseName:
                if VisitorBusinessLogic.mongoVisitorReadInfosCollectionName in mongoDataBase.collection_names():
                    mongoVisitorReadInfosCollection = mongoDataBase[VisitorBusinessLogic.mongoVisitorReadInfosCollectionName]
                    contextEIDRegex = ''
                    if subjectEID:
                        contextEIDRegex = '^'+subjectEID
                    
                    if branchEID:
                        if contextEIDRegex:
                            contextEIDRegex = contextEIDRegex+'\.'+branchEID
                        else:
                            contextEIDRegex = '...'+'\.'+branchEID
                    
                    if conceptEID:
                        if contextEIDRegex:
                            contextEIDRegex = contextEIDRegex+'\.'+conceptEID
                        else:
                            contextEIDRegex = '...'+'\.'+'...'+'\.'+conceptEID
                    else:
                        if contextEIDRegex:
                            contextEIDRegex = contextEIDRegex+'\..*' 

                    matchQuery = {'$match':{'_id.visitorID':visitorID}}

                    if contextEIDRegex:
                        matchQuery['$match']['_id.contextEID'] = re.compile(contextEIDRegex)
                    
                    groupQuery = {'$group':{'_id':'$_id.modalityID', 'lastReadAT':{'$max':'$lastReadAT'}}}
                    
                    sortQuery = {'$sort':{'lastReadAT':-1}}
                    
                    skipQuery = {'$skip':offSet}
                    
                    limitQuery = {'$limit':limit}                    
                    result = mongoVisitorReadInfosCollection.aggregate([matchQuery, groupQuery, sortQuery, skipQuery, limitQuery])
                    if result:
                        if result.get('ok'):
                            modalityIDs = []
                            lastReadATs = []
                            resultDocuments = result.get('result')
                            for resultDocument in resultDocuments:
                                if resultDocument.has_key('_id'):
                                    modalityIDs.append(resultDocument.get('_id'))

                                if resultDocument.has_key('lastReadAT'):
                                    lastReadATs.append(resultDocument.get('lastReadAT'))

                            if modalityIDs and lastReadATs:
                                contextInfos = mongoVisitorReadInfosCollection.find({'_id.visitorID': visitorID, '_id.modalityID': {'$in': modalityIDs}, 'lastReadAT': {'$in': lastReadATs}})
                                modalityLastReadContextEIDMap = {}
                                for contextInfo in contextInfos:
                                    contextEID = contextInfo.get('_id').get('contextEID')
                                    modalityID = contextInfo.get('_id').get('modalityID')
                                    lastReadAT = contextInfo.get('lastReadAT')
                                    modalityLastReadContextEIDMap[str(modalityID) + '-' + str(lastReadAT)] = contextEID

                                for resultDocument in resultDocuments:
                                    modalityID = resultDocument.get('_id')
                                    lastReadAT = resultDocument.get('lastReadAT')
                                    if modalityLastReadContextEIDMap.has_key(str(modalityID) + '-' + str(lastReadAT)):
                                        resultDocument['contextEID'] = modalityLastReadContextEIDMap.get(str(modalityID) + '-' + str(lastReadAT))
                            conceptEIDs = []
                            branchEIDs = []
                            subjectEIDs = []
                            for resultDocument in resultDocuments:
                                if resultDocument.has_key('contextEID'):
                                    contextEID = resultDocument.get('contextEID')
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
                                if resultDocument.has_key('contextEID'):
                                    contextEID = resultDocument.pop('contextEID')
                                    if conceptInfoDictsMap.has_key(contextEID):
                                        resultDocument[u'contextInfo'] = conceptInfoDictsMap[contextEID]
                                        resultDocument[u'contextInfo'][u'contextType'] = 'CONCEPT'
                                    elif branchInfoDictsMap.has_key(contextEID):
                                        resultDocument[u'contextInfo'] = branchInfoDictsMap[contextEID]
                                        resultDocument[u'contextInfo'][u'contextType'] = 'BRANCH'
                                    elif subjectInfoDictsMap.has_key(contextEID):
                                        resultDocument[u'contextInfo'] = subjectInfoDictsMap[contextEID]
                                        resultDocument[u'contextInfo'][u'contextType'] = 'SUBJECT'
                                    else:
                                        resultDocument[u'contextInfo'] = {u'contextEID': contextEID}
                                        resultDocument[u'contextInfo'][u'contextType'] = 'NONE'

                            if modalityIDs:
                                modalityInfoDictsMap = self.dataModel.getLastReadModalities(modalityIDs)
                                for resultDocument in resultDocuments:
                                    if resultDocument.has_key('_id'):
                                        modalityID = resultDocument.pop('_id')
                                        if modalityInfoDictsMap.has_key(modalityID):
                                            resultDocument.update(modalityInfoDictsMap[modalityID])
                                        else:
                                            resultDocument[u'modalityID'] = modalityID
                            return resultDocuments
                        else:
                            exceptionMessage = result.get('errmsg')
                            raise exceptions.SystemInternalException(unicode(exceptionMessage).encode('utf-8'))
                    else:
                        raise exceptions.SystemInternalException(u"could not retrieve the last-read information from the dataBase.".encode('utf-8'))
                else:
                    raise exceptions.SystemConfigurationException(u"configured mongoVisitorReadInfosCollectionName : [{mongoVisitorReadInfosCollectionName}] could not be found on the configured mongoDataBaseName : [{mongoDataBaseName}] of mongoClient created from the configured mongoURL : [{mongoURL}].".format(mongoVisitorReadInfosCollectionName=VisitorBusinessLogic.mongoVisitorReadInfosCollectionName, mongoDataBaseName=VisitorBusinessLogic.mongoDataBaseName, mongoURL=VisitorBusinessLogic.mongoURL).encode('utf-8'))                                   
            else:
                raise exceptions.SystemConfigurationException(u"configured mongoDataBaseName : [{mongoDataBaseName}] is not the defaultDataBase of the mongoClient created from the configured mongoURL : [{mongoURL}].".format(mongoDataBaseName=VisitorBusinessLogic.mongoDataBaseName, mongoURL=VisitorBusinessLogic.mongoURL).encode('utf-8'))
        else:
            raise exceptions.SystemConfigurationException(u"mongoClient could not be created from the configured mongoURL : [{mongoURL}].".format(mongoURL=VisitorBusinessLogic.mongoURL).encode('utf-8'))

    def getLastReadConcepts(self, visitorID, subjectEID=None, branchEID=None, offSet=0, limit=10):
        if VisitorBusinessLogic.mongoClient:
            mongoDataBase = VisitorBusinessLogic.mongoClient.get_default_database()
            if mongoDataBase and mongoDataBase.name == VisitorBusinessLogic.mongoDataBaseName:
                if VisitorBusinessLogic.mongoVisitorReadInfosCollectionName in mongoDataBase.collection_names():
                    mongoVisitorReadInfosCollection = mongoDataBase[VisitorBusinessLogic.mongoVisitorReadInfosCollectionName]
                    contextEIDRegex = ''
                    if subjectEID:
                        contextEIDRegex = '^'+subjectEID
                    
                    if branchEID:
                        if contextEIDRegex:
                            contextEIDRegex = contextEIDRegex+'\.'+branchEID
                        else:
                            contextEIDRegex = '...'+'\.'+branchEID
                    
                    if contextEIDRegex:
                        contextEIDRegex = contextEIDRegex+'\..*'
                    else:
                        contextEIDRegex = '...\....\..*'
                    
                    matchQuery = {'$match':{'_id.visitorID':visitorID}}
                    if contextEIDRegex:
                        matchQuery['$match']['_id.contextEID'] = re.compile(contextEIDRegex)
                    
                    groupQuery = {'$group':{'_id':'$_id.contextEID', 'lastReadAT':{'$max':'$lastReadAT'}}}
                    
                    sortQuery = {'$sort':{'lastReadAT':-1}}
                    
                    skipQuery = {'$skip':offSet}
                    
                    limitQuery = {'$limit':limit}                    
                    result = mongoVisitorReadInfosCollection.aggregate([matchQuery, groupQuery, sortQuery, skipQuery, limitQuery])
                    if result:
                        if result.get('ok'):
                            conceptEIDs = []
                            resultDocuments = result.get('result')
                            for resultDocument in resultDocuments:
                                if resultDocument.has_key('_id'):
                                    conceptEIDs.append(resultDocument.get('_id'))

                            if conceptEIDs:
                                conceptInfoDictsMap = self.dataModel.getLastReadConcepts(conceptEIDs)
                                for resultDocument in resultDocuments:
                                    if resultDocument.has_key('_id'):
                                        conceptEID = resultDocument.pop('_id')
                                        if conceptInfoDictsMap.has_key(conceptEID):
                                            resultDocument.update(conceptInfoDictsMap[conceptEID])
                                        else:
                                            resultDocument[u'conceptEID'] = conceptEID
                            return resultDocuments
                        else:
                            exceptionMessage = result.get('errmsg')
                            raise exceptions.SystemInternalException(unicode(exceptionMessage).encode('utf-8'))
                    else:
                        raise exceptions.SystemInternalException(u"could not retrieve the last-read information from the dataBase.".encode('utf-8'))
                else:
                    raise exceptions.SystemConfigurationException(u"configured mongoVisitorReadInfosCollectionName : [{mongoVisitorReadInfosCollectionName}] could not be found on the configured mongoDataBaseName : [{mongoDataBaseName}] of mongoClient created from the configured mongoURL : [{mongoURL}].".format(mongoVisitorReadInfosCollectionName=VisitorBusinessLogic.mongoVisitorReadInfosCollectionName, mongoDataBaseName=VisitorBusinessLogic.mongoDataBaseName, mongoURL=VisitorBusinessLogic.mongoURL).encode('utf-8'))                                   
            else:
                raise exceptions.SystemConfigurationException(u"configured mongoDataBaseName : [{mongoDataBaseName}] is not the defaultDataBase of the mongoClient created from the configured mongoURL : [{mongoURL}].".format(mongoDataBaseName=VisitorBusinessLogic.mongoDataBaseName, mongoURL=VisitorBusinessLogic.mongoURL).encode('utf-8'))
        else:
            raise exceptions.SystemConfigurationException(u"mongoClient could not be created from the configured mongoURL : [{mongoURL}].".format(mongoURL=VisitorBusinessLogic.mongoURL).encode('utf-8'))

    def getLastReadBranches(self, visitorID, subjectEID=None, offSet=0, limit=10):
        if VisitorBusinessLogic.mongoClient:
            mongoDataBase = VisitorBusinessLogic.mongoClient.get_default_database()
            if mongoDataBase and mongoDataBase.name == VisitorBusinessLogic.mongoDataBaseName:
                if VisitorBusinessLogic.mongoVisitorReadInfosCollectionName in mongoDataBase.collection_names():
                    mongoVisitorReadInfosCollection = mongoDataBase[VisitorBusinessLogic.mongoVisitorReadInfosCollectionName]
                    contextEIDRegex = ''
                    if subjectEID:
                        contextEIDRegex = '^'+subjectEID
                    
                    if contextEIDRegex:
                        contextEIDRegex = contextEIDRegex+'\..*'
                    else:
                        contextEIDRegex = '...\..*'

                    matchQuery = {'$match':{'_id.visitorID':visitorID}}
                    if contextEIDRegex:
                        matchQuery['$match']['_id.contextEID'] = re.compile(contextEIDRegex)

                    groupQuery = {'$group':{'_id':{'$substr':['$_id.contextEID', 0, 7]}, 'lastReadAT':{'$max':'$lastReadAT'}}}
                    
                    sortQuery = {'$sort':{'lastReadAT':-1}}
                    
                    skipQuery = {'$skip':offSet}
                    
                    limitQuery = {'$limit':limit}                    
                    result = mongoVisitorReadInfosCollection.aggregate([matchQuery, groupQuery, sortQuery, skipQuery, limitQuery])
                    if result:
                        if result.get('ok'):
                            branchEIDs = []
                            resultDocuments = result.get('result')
                            for resultDocument in resultDocuments:
                                if resultDocument.has_key('_id'):
                                    branchEIDs.append(resultDocument.get('_id'))

                            if branchEIDs:
                                branchInfoDictsMap = self.dataModel.getLastReadBranches(branchEIDs)
                                for resultDocument in resultDocuments:
                                    if resultDocument.has_key('_id'):
                                        branchEID = resultDocument.pop('_id')
                                        if branchInfoDictsMap.has_key(branchEID):
                                            resultDocument.update(branchInfoDictsMap[branchEID])
                                        else:
                                            resultDocument[u'branchEID'] = branchEID
                            return resultDocuments
                        else:
                            exceptionMessage = result.get('errmsg')
                            raise exceptions.SystemInternalException(unicode(exceptionMessage).encode('utf-8'))
                    else:
                        raise exceptions.SystemInternalException(u"could not retrieve the last-read information from the dataBase.".encode('utf-8'))
                else:
                    raise exceptions.SystemConfigurationException(u"configured mongoVisitorReadInfosCollectionName : [{mongoVisitorReadInfosCollectionName}] could not be found on the configured mongoDataBaseName : [{mongoDataBaseName}] of mongoClient created from the configured mongoURL : [{mongoURL}].".format(mongoVisitorReadInfosCollectionName=VisitorBusinessLogic.mongoVisitorReadInfosCollectionName, mongoDataBaseName=VisitorBusinessLogic.mongoDataBaseName, mongoURL=VisitorBusinessLogic.mongoURL).encode('utf-8'))                                   
            else:
                raise exceptions.SystemConfigurationException(u"configured mongoDataBaseName : [{mongoDataBaseName}] is not the defaultDataBase of the mongoClient created from the configured mongoURL : [{mongoURL}].".format(mongoDataBaseName=VisitorBusinessLogic.mongoDataBaseName, mongoURL=VisitorBusinessLogic.mongoURL).encode('utf-8'))
        else:
            raise exceptions.SystemConfigurationException(u"mongoClient could not be created from the configured mongoURL : [{mongoURL}].".format(mongoURL=VisitorBusinessLogic.mongoURL).encode('utf-8'))

    def getLastReadSubjects(self, visitorID, offSet=0, limit=10):
        if VisitorBusinessLogic.mongoClient:
            mongoDataBase = VisitorBusinessLogic.mongoClient.get_default_database()
            if mongoDataBase and mongoDataBase.name == VisitorBusinessLogic.mongoDataBaseName:
                if VisitorBusinessLogic.mongoVisitorReadInfosCollectionName in mongoDataBase.collection_names():
                    mongoVisitorReadInfosCollection = mongoDataBase[VisitorBusinessLogic.mongoVisitorReadInfosCollectionName]

                    matchQuery = {'$match':{'_id.visitorID':visitorID}}

                    groupQuery = {'$group':{'_id':{'$substr':['$_id.contextEID', 0, 3]}, 'lastReadAT':{'$max':'$lastReadAT'}}}
                    
                    sortQuery = {'$sort':{'lastReadAT':-1}}
                    
                    skipQuery = {'$skip':offSet}
                    
                    limitQuery = {'$limit':limit}                    
                    result = mongoVisitorReadInfosCollection.aggregate([matchQuery, groupQuery, sortQuery, skipQuery, limitQuery])
                    if result:
                        if result.get('ok'):
                            subjectEIDs = []
                            resultDocuments = result.get('result')
                            for resultDocument in resultDocuments:
                                if resultDocument.has_key('_id'):
                                    subjectEIDs.append(resultDocument.get('_id'))

                            if subjectEIDs:
                                subjectInfoDictsMap = self.dataModel.getLastReadSubjects(subjectEIDs)
                                for resultDocument in resultDocuments:
                                    if resultDocument.has_key('_id'):
                                        subjectEID = resultDocument.pop('_id')
                                        if subjectInfoDictsMap.has_key(subjectEID):
                                            resultDocument.update(subjectInfoDictsMap[subjectEID])
                                        else:
                                            resultDocument[u'subjectEID'] = subjectEID
                            return resultDocuments
                        else:
                            exceptionMessage = result.get('errmsg')
                            raise exceptions.SystemInternalException(unicode(exceptionMessage).encode('utf-8'))
                    else:
                        raise exceptions.SystemInternalException(u"could not retrieve the last-read information from the dataBase.".encode('utf-8'))
                else:
                    raise exceptions.SystemConfigurationException(u"configured mongoVisitorReadInfosCollectionName : [{mongoVisitorReadInfosCollectionName}] could not be found on the configured mongoDataBaseName : [{mongoDataBaseName}] of mongoClient created from the configured mongoURL : [{mongoURL}].".format(mongoVisitorReadInfosCollectionName=VisitorBusinessLogic.mongoVisitorReadInfosCollectionName, mongoDataBaseName=VisitorBusinessLogic.mongoDataBaseName, mongoURL=VisitorBusinessLogic.mongoURL).encode('utf-8'))                                   
            else:
                raise exceptions.SystemConfigurationException(u"configured mongoDataBaseName : [{mongoDataBaseName}] is not the defaultDataBase of the mongoClient created from the configured mongoURL : [{mongoURL}].".format(mongoDataBaseName=VisitorBusinessLogic.mongoDataBaseName, mongoURL=VisitorBusinessLogic.mongoURL).encode('utf-8'))
        else:
            raise exceptions.SystemConfigurationException(u"mongoClient could not be created from the configured mongoURL : [{mongoURL}].".format(mongoURL=VisitorBusinessLogic.mongoURL).encode('utf-8'))
