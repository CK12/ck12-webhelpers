from flx.model import exceptions
from pylons import config
import pymongo
import logging

log = logging.getLogger(__name__)
class ArtifactBusinessAnalyticsLogic(object):

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
  
    def getArtifactVisitDetails(self, artifactIDs):
        if ArtifactBusinessAnalyticsLogic.mongoClient:
            mongoDataBase = ArtifactBusinessAnalyticsLogic.mongoClient.get_default_database()
            if mongoDataBase and mongoDataBase.name == ArtifactBusinessAnalyticsLogic.mongoDataBaseName:
                if ArtifactBusinessAnalyticsLogic.mongoMemberReadInfosCollectionName in mongoDataBase.collection_names():
                    mongoMemberReadInfosCollection = mongoDataBase[ArtifactBusinessAnalyticsLogic.mongoMemberReadInfosCollectionName]
                    #db.ArtifactVisits.aggregate([{"$match": {"artifactID":{"$in":[2639453,1290811,2639302]}}}, {"$group":{"_id":{"artifactID":"$artifactID"}, "users_visits":{"$sum":1}, "artifact_visits":{"$sum":"$visitCount"}}}])
                    match_query = {'artifactID':{'$in':artifactIDs}}
                    group_query = {'_id':{'artifactID':'$artifactID', 'visitorID':'$visitorID'}, 'userVisits':{'$sum':1}, 'artifactVisits':{'$sum':'$visitCount'}}
                    
                    results = mongoMemberReadInfosCollection.aggregate([{'$match':match_query}, {'$group':group_query}])
                    if not results.has_key('result'):
                        raise exceptions.SystemInternalException("Unable to get the results")
                        
                    resultDocuments = results['result']
                    
                    visitDetails = []
                    visitInfo = {}
                    for resultDocument in resultDocuments:
                        artifactID = resultDocument['_id']['artifactID']
                        if not visitInfo.has_key(artifactID):
                            visitInfo[artifactID] = {}
                            visitInfo[artifactID]['userVisits'] = 0 
                            visitInfo[artifactID]['artifactVisits'] = 0                            
                        visitInfo[artifactID]['userVisits'] += resultDocument['userVisits']
                        visitInfo[artifactID]['artifactVisits'] += resultDocument['artifactVisits']                        
                    
                    for artifactID in visitInfo:
                        tmp_info = {}
                        tmp_info['artifactID'] = artifactID
                        tmp_info['userVisits'] = visitInfo[artifactID]['userVisits']
                        tmp_info['artifactVisits'] = visitInfo[artifactID]['artifactVisits']                        
                        visitDetails.append(tmp_info)          
                    return visitDetails
                else:
                    raise exceptions.SystemConfigurationException(u"configured mongoMemberReadInfosCollectionName : [{mongoMemberReadInfosCollectionName}] could not be found on the configured mongoDataBaseName : [{mongoDataBaseName}] of mongoClient created from the configured mongoURL : [{mongoURL}].".format(mongoMemberReadInfosCollectionName=ArtifactBusinessAnalyticsLogic.mongoMemberReadInfosCollectionName, mongoDataBaseName=ArtifactBusinessAnalyticsLogic.mongoDataBaseName, mongoURL=ArtifactBusinessAnalyticsLogic.mongoURL).encode('utf-8'))
            else:
                raise exceptions.SystemConfigurationException(u"configured mongoDataBaseName : [{mongoDataBaseName}] is not the defaultDataBase of the mongoClient created from the configured mongoURL : [{mongoURL}].".format(mongoDataBaseName=ArtifactBusinessAnalyticsLogic.mongoDataBaseName, mongoURL=ArtifactBusinessAnalyticsLogic.mongoURL).encode('utf-8'))
        else:
            raise exceptions.SystemConfigurationException(u"mongoClient could not be created from the configured mongoURL : [{mongoURL}].".format(mongoURL=ArtifactBusinessAnalyticsLogic.mongoURL).encode('utf-8'))
