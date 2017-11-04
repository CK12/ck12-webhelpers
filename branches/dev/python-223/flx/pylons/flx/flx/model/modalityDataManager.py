from flx.model import meta, model
from flx.model import exceptions
from flx.model.artifactDataManager import ArtifactDataModel
from flx.lib.localtime import Local
from flx.util import util
from sqlalchemy import orm
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import exc
from sqlalchemy.sql import and_, or_ , func
from urllib import quote, unquote
import json
import zlib
import re

class ModalityDataModel(object):

    def __init__(self):
        self.artifactDataModel = ArtifactDataModel()

    def getFeaturedModalitiesForDomainHandleOrEncodedID(self, domainHandleOrEncodedID, memberDict, queryOptions):
        meta.Session.begin()
        try:
            #validateAndExtract browseTermID
            try:
                browseTermID = meta.Session.query(meta.BrowseTerms.c.id).filter(meta.BrowseTerms.c.handle==domainHandleOrEncodedID).join(meta.BrowseTermTypes, meta.BrowseTerms.c.termTypeID==meta.BrowseTermTypes.c.id).filter(meta.BrowseTermTypes.c.name=='domain').one()[0]
            except exc.NoResultFound:
                try:
                    browseTermID = meta.Session.query(meta.BrowseTerms.c.id).filter(meta.BrowseTerms.c.encodedID==domainHandleOrEncodedID).one()[0]
                except exc.NoResultFound:
                    raise exceptions.ResourceNotFoundException(u"Domain typed BrowseTerm with the given domainHandleOrEncodedID : [{domainHandleOrEncodedID}] could not be found in the dataBase.".format(domainHandleOrEncodedID=domainHandleOrEncodedID).encode('utf-8'))
                except exc.MultipleResultsFound:
                    raise exceptions.SystemDataException(u"Multiple Domain typed BrowseTerms with the given domainHandleOrEncodedID : [{domainHandleOrEncodedID}] as an encodedID are found in the dataBase. Internal System data error.".format(domainHandleOrEncodedID=domainHandleOrEncodedID).encode('utf-8'))
            except exc.MultipleResultsFound:
                raise exceptions.SystemDataException(u"Multiple Domain typed BrowseTerms with the given domainHandleOrEncodedID : [{domainHandleOrEncodedID}] as a handle are found in the dataBase. Internal System data error.".format(domainHandleOrEncodedID=domainHandleOrEncodedID).encode('utf-8'))

            featuredModalitiesQuery = meta.Session.query(meta.RelatedArtifactsAndLevels.c.id, meta.RelatedArtifactsAndLevels.c.artifactTypeID, meta.RelatedArtifactsAndLevels.c.sequence).filter(meta.RelatedArtifactsAndLevels.c.domainID==browseTermID)
            
            conceptCollectionHandle = queryOptions.pop('conceptCollectionHandle', None)
            collectionCreatorID = queryOptions.pop('collectionCreatorID', None)
            if conceptCollectionHandle and collectionCreatorID:
                featuredModalitiesQuery = featuredModalitiesQuery.filter(meta.RelatedArtifactsAndLevels.c.conceptCollectionHandle == conceptCollectionHandle, meta.RelatedArtifactsAndLevels.c.collectionCreatorID == collectionCreatorID)
            else:
                featuredModalitiesQuery = featuredModalitiesQuery.filter(meta.RelatedArtifactsAndLevels.c.conceptCollectionHandle == '', meta.RelatedArtifactsAndLevels.c.collectionCreatorID == 0)
             
            considerModalitiesOfTypesIDMap = {}
            considerModalitiesOfTypeIDs = []
            considerModalitiesOfTypes = queryOptions.pop('considerModalitiesOfTypes', [])
            if considerModalitiesOfTypes:
                considerModalitiesOfTypeInfos = meta.Session.query(meta.ArtifactTypes.c.name, meta.ArtifactTypes.c.id).filter(meta.ArtifactTypes.c.name.in_(considerModalitiesOfTypes)).all()
                if len(considerModalitiesOfTypeInfos) != len(considerModalitiesOfTypes):
                    raise exceptions.InvalidArgumentException(u"One or more types in the given considerModalitiesOfTypes : [{considerModalitiesOfTypes}] could not be found in the dataBase.".format(considerModalitiesOfTypes=considerModalitiesOfTypes).encode('utf-8'))

                for considerModalitiesOfTypeInfo in considerModalitiesOfTypeInfos:
                    considerModalitiesOfTypeIDs.append(considerModalitiesOfTypeInfo[1])
                    considerModalitiesOfTypesIDMap[considerModalitiesOfTypeInfo[0]] = considerModalitiesOfTypeInfo[1]

                if considerModalitiesOfTypeIDs:
                    featuredModalitiesQuery = featuredModalitiesQuery.filter(meta.RelatedArtifactsAndLevels.c.artifactTypeID.in_(considerModalitiesOfTypeIDs))

            considerModalitiesOwnedBy = queryOptions.pop('considerModalitiesOwnedBy')
            if considerModalitiesOwnedBy in ('CK12', 'COMMUNITY', 'ALL'):
                try:
                    ck12EditorLogin = 'ck12editor'
                    ck12EditorDO = meta.Session.query(meta.Members.c.id).filter(meta.Members.c.login == ck12EditorLogin).one()
                except exc.NoResultFound:
                    raise exceptions.ResourceNotFoundException(u"Member with the ck12EditorLogin : [{ck12EditorLogin}] could not be found in the dataBase.".format(ck12EditorLogin=ck12EditorLogin).encode('utf-8'))
                except exc.MultipleResultsFound:
                    raise exceptions.SystemDataException(u"Multiple members with the given ck12EditorLogin : [{ck12EditorLogin}] are found in the dataBase. Internal System data error.".format(ck12EditorLogin=ck12EditorLogin).encode('utf-8'))
                ck12EditorID = ck12EditorDO.id
                
                if considerModalitiesOwnedBy == 'CK12':
                    featuredModalitiesQuery = featuredModalitiesQuery.filter(meta.RelatedArtifactsAndLevels.c.creatorID == ck12EditorID, meta.RelatedArtifactsAndLevels.c.publishTime != None)
                elif considerModalitiesOwnedBy == 'COMMUNITY':
                    if memberDict.get('memberID'):
                        memberID = memberDict.get('memberID')
                        featuredModalitiesQuery = featuredModalitiesQuery.filter(or_(and_(meta.RelatedArtifactsAndLevels.c.creatorID != ck12EditorID, meta.RelatedArtifactsAndLevels.c.publishTime != None), and_(meta.RelatedArtifactsAndLevels.c.creatorID == memberID, meta.RelatedArtifactsAndLevels.c.publishTime == None)))
                    else:
                        featuredModalitiesQuery = featuredModalitiesQuery.filter(meta.RelatedArtifactsAndLevels.c.creatorID != ck12EditorID, meta.RelatedArtifactsAndLevels.c.publishTime != None)
                else:
                    if memberDict.get('memberID'):
                        memberID = memberDict.get('memberID')
                        featuredModalitiesQuery = featuredModalitiesQuery.filter(or_(meta.RelatedArtifactsAndLevels.c.publishTime != None, and_(meta.RelatedArtifactsAndLevels.c.creatorID == memberID, meta.RelatedArtifactsAndLevels.c.publishTime == None)))
                    else:
                        featuredModalitiesQuery = featuredModalitiesQuery.filter(meta.RelatedArtifactsAndLevels.c.publishTime != None)                    


            featuredModalitiesQuery = featuredModalitiesQuery.order_by(meta.RelatedArtifactsAndLevels.c.sequence.asc())
            featuredModalityInfos = featuredModalitiesQuery.all()
            featuredModalityTypePageInfoDict = {}
            pageNO = queryOptions.pop('pageNO', 0)
            for featuredModalityInfo in featuredModalityInfos:
                featuredModalityID = featuredModalityInfo[0]
                featuredModalityTypeID = featuredModalityInfo[1]
                if not featuredModalityTypePageInfoDict.get(featuredModalityTypeID):
                    featuredModalityTypePageInfoDict[featuredModalityTypeID] = {}

                if not featuredModalityTypePageInfoDict[featuredModalityTypeID].get('pageNO'):
                    featuredModalityTypePageInfoDict[featuredModalityTypeID]['pageNO'] = 0
                
                if featuredModalityTypePageInfoDict[featuredModalityTypeID]['pageNO'] == pageNO:
                    featuredModalityTypePageInfoDict[featuredModalityTypeID]['id'] = featuredModalityID
                featuredModalityTypePageInfoDict[featuredModalityTypeID]['pageNO'] = featuredModalityTypePageInfoDict[featuredModalityTypeID]['pageNO']+1

            featuredModlaityIDs = [featuredModalityTypePageInfoDict[featuredModalityTypeID]['id'] for featuredModalityTypeID in featuredModalityTypePageInfoDict if featuredModalityTypePageInfoDict[featuredModalityTypeID].get('id') ]
            featuredModalityDOs = meta.Session.query(model.Artifact).filter(model.Artifact.id.in_(featuredModlaityIDs))
            featuredModalityDictList = []
            for featuredModalityDO in featuredModalityDOs:
                featuredModalityRevisionDO = featuredModalityDO.revisions[0]
                featuredModalityDict = self.artifactDataModel.generateArtifactDict(featuredModalityDO, featuredModalityRevisionDO, **queryOptions)
                featuredModalityDictList.append(featuredModalityDict)
            meta.Session.commit()
            return featuredModalityDictList
        except SQLAlchemyError, sqlae:
            meta.Session.rollback()
            raise exceptions.SystemInternalException(unicode(sqlae).encode('utf-8'))
        except Exception, e:
            meta.Session.rollback()
            raise e
        finally:
            meta.Session.expire_all()
            meta.Session.close()
            meta.Session.remove()

    def getFeaturedModalityTypeCountsForDomainHandleOrEncodedID(self, domainHandleOrEncodedID, memberDict, queryOptions):
        meta.Session.begin()
        try:

            #validateAndExtract browseTermID
            try:
                browseTermID = meta.Session.query(meta.BrowseTerms.c.id).filter(meta.BrowseTerms.c.handle==domainHandleOrEncodedID).join(meta.BrowseTermTypes, meta.BrowseTerms.c.termTypeID==meta.BrowseTermTypes.c.id).filter(meta.BrowseTermTypes.c.name=='domain').one()[0]
            except exc.NoResultFound:
                try:
                    browseTermID = meta.Session.query(meta.BrowseTerms.c.id).filter(meta.BrowseTerms.c.encodedID==domainHandleOrEncodedID).one()[0]
                except exc.NoResultFound:
                    raise exceptions.ResourceNotFoundException(u"Domain typed BrowseTerm with the given domainHandleOrEncodedID : [{domainHandleOrEncodedID}] could not be found in the dataBase.".format(domainHandleOrEncodedID=domainHandleOrEncodedID).encode('utf-8'))
                except exc.MultipleResultsFound:
                    raise exceptions.SystemDataException(u"Multiple Domain typed BrowseTerms with the given domainHandleOrEncodedID : [{domainHandleOrEncodedID}] as an encodedID are found in the dataBase. Internal System data error.".format(domainHandleOrEncodedID=domainHandleOrEncodedID).encode('utf-8'))
            except exc.MultipleResultsFound:
                raise exceptions.SystemDataException(u"Multiple Domain typed BrowseTerms with the given domainHandleOrEncodedID : [{domainHandleOrEncodedID}] as a handle are found in the dataBase. Internal System data error.".format(domainHandleOrEncodedID=domainHandleOrEncodedID).encode('utf-8'))

            featuredModalityTypeCountsQuery = meta.Session.query(meta.RelatedArtifactsAndLevels.c.artifactTypeID, meta.ArtifactTypes.c.name, func.count(meta.RelatedArtifactsAndLevels.c.id)).filter(meta.RelatedArtifactsAndLevels.c.domainID==browseTermID)
            
            conceptCollectionHandle = queryOptions.pop('conceptCollectionHandle', None)
            collectionCreatorID = queryOptions.pop('collectionCreatorID', None)
            if conceptCollectionHandle and collectionCreatorID:
                featuredModalityTypeCountsQuery = featuredModalityTypeCountsQuery.filter(meta.RelatedArtifactsAndLevels.c.conceptCollectionHandle == conceptCollectionHandle, meta.RelatedArtifactsAndLevels.c.collectionCreatorID == collectionCreatorID)
            else:
                featuredModalityTypeCountsQuery = featuredModalityTypeCountsQuery.filter(meta.RelatedArtifactsAndLevels.c.conceptCollectionHandle == '', meta.RelatedArtifactsAndLevels.c.collectionCreatorID == 0)
             
            considerModalitiesOfTypesIDMap = {}
            considerModalitiesOfTypeIDs = []
            considerModalitiesOfTypes = queryOptions.pop('considerModalitiesOfTypes', [])
            if considerModalitiesOfTypes:
                considerModalitiesOfTypeInfos = meta.Session.query(meta.ArtifactTypes.c.name, meta.ArtifactTypes.c.id).filter(meta.ArtifactTypes.c.name.in_(considerModalitiesOfTypes)).all()
                if len(considerModalitiesOfTypeInfos) != len(considerModalitiesOfTypes):
                    raise exceptions.InvalidArgumentException(u"One or more types in the given considerModalitiesOfTypes : [{considerModalitiesOfTypes}] could not be found in the dataBase.".format(considerModalitiesOfTypes=considerModalitiesOfTypes).encode('utf-8'))

                for considerModalitiesOfTypeInfo in considerModalitiesOfTypeInfos:
                    considerModalitiesOfTypeIDs.append(considerModalitiesOfTypeInfo[1])
                    considerModalitiesOfTypesIDMap[considerModalitiesOfTypeInfo[0]] = considerModalitiesOfTypeInfo[1]

                if considerModalitiesOfTypeIDs:
                    featuredModalityTypeCountsQuery = featuredModalityTypeCountsQuery.filter(meta.RelatedArtifactsAndLevels.c.artifactTypeID.in_(considerModalitiesOfTypeIDs))

            considerModalitiesOwnedBy = queryOptions.pop('considerModalitiesOwnedBy')
            if considerModalitiesOwnedBy in ('CK12', 'COMMUNITY', 'ALL'):
                try:
                    ck12EditorLogin = 'ck12editor'
                    ck12EditorDO = meta.Session.query(meta.Members.c.id).filter(meta.Members.c.login == ck12EditorLogin).one()
                except exc.NoResultFound:
                    raise exceptions.ResourceNotFoundException(u"Member with the ck12EditorLogin : [{ck12EditorLogin}] could not be found in the dataBase.".format(ck12EditorLogin=ck12EditorLogin).encode('utf-8'))
                except exc.MultipleResultsFound:
                    raise exceptions.SystemDataException(u"Multiple members with the given ck12EditorLogin : [{ck12EditorLogin}] are found in the dataBase. Internal System data error.".format(ck12EditorLogin=ck12EditorLogin).encode('utf-8'))
                ck12EditorID = ck12EditorDO.id
                
                if considerModalitiesOwnedBy == 'CK12':
                    featuredModalityTypeCountsQuery = featuredModalityTypeCountsQuery.filter(meta.RelatedArtifactsAndLevels.c.creatorID == ck12EditorID, meta.RelatedArtifactsAndLevels.c.publishTime != None)
                elif considerModalitiesOwnedBy == 'COMMUNITY':
                    if memberDict.get('memberID'):
                        memberID = memberDict.get('memberID')
                        featuredModalityTypeCountsQuery = featuredModalityTypeCountsQuery.filter(or_(and_(meta.RelatedArtifactsAndLevels.c.creatorID != ck12EditorID, meta.RelatedArtifactsAndLevels.c.publishTime != None), and_(meta.RelatedArtifactsAndLevels.c.creatorID == memberID, meta.RelatedArtifactsAndLevels.c.publishTime == None)))
                    else:
                        featuredModalityTypeCountsQuery = featuredModalityTypeCountsQuery.filter(meta.RelatedArtifactsAndLevels.c.creatorID != ck12EditorID, meta.RelatedArtifactsAndLevels.c.publishTime != None)
                else:
                    if memberDict.get('memberID'):
                        memberID = memberDict.get('memberID')
                        featuredModalityTypeCountsQuery = featuredModalityTypeCountsQuery.filter(or_(meta.RelatedArtifactsAndLevels.c.publishTime != None, and_(meta.RelatedArtifactsAndLevels.c.creatorID == memberID, meta.RelatedArtifactsAndLevels.c.publishTime == None)))
                    else:
                        featuredModalityTypeCountsQuery = featuredModalityTypeCountsQuery.filter(meta.RelatedArtifactsAndLevels.c.publishTime != None)                    

            featuredModalityTypeCountsQuery= featuredModalityTypeCountsQuery.join(meta.ArtifactTypes, meta.RelatedArtifactsAndLevels.c.artifactTypeID == meta.ArtifactTypes.c.id).group_by(meta.ArtifactTypes.c.name)            
            featuredModalityTypeCountInfos = featuredModalityTypeCountsQuery.all()
            featuredModalityTypeCountsDict = {}
            for featuredModalityTypeCountInfo in featuredModalityTypeCountInfos:
                featureModalityTypeID = featuredModalityTypeCountInfo[0]
                featureModalityTypeName = featuredModalityTypeCountInfo[1]
                featureModalityTypeCount = featuredModalityTypeCountInfo[2]
                if featureModalityTypeName in featuredModalityTypeCountsDict:
                    raise exceptions.SystemImplementationException(u"Duplicate featureModalityTypeName : [{featureModalityTypeName}] encountered when determining the featuredModalityTypeCounts from the results of a groupBy query. Internal System implementation error. Please contact the admin.".format(featureModalityTypeName=featureModalityTypeName).encode('utf-8'))
                featuredModalityTypeCountsDict[featureModalityTypeName] = featureModalityTypeCount
            meta.Session.commit()
            
            return featuredModalityTypeCountsDict
        except SQLAlchemyError, sqlae:
            meta.Session.rollback()
            raise exceptions.SystemInternalException(unicode(sqlae).encode('utf-8'))
        except Exception, e:
            meta.Session.rollback()
            raise e
        finally:
            meta.Session.expire_all()
            meta.Session.close()
            meta.Session.remove()

    def getFeaturedModalityTypeCountsForCollectionHandleAndCreatorID(self, collectionHandle, collectionCreatorID, memberDict, queryOptions):
        meta.Session.begin()
        try:
            if collectionHandle:
                collectionHandleRegex = collectionHandle+'-::-%'
            else:
                collectionHandleRegex = ''
            featuredModalityTypeCountsQuery = meta.Session.query(meta.RelatedArtifactsAndLevels.c.domainEID, meta.RelatedArtifactsAndLevels.c.domainHandle, meta.RelatedArtifactsAndLevels.c.domainID, meta.RelatedArtifactsAndLevels.c.domainTerm, meta.ArtifactTypes.c.name, meta.RelatedArtifactsAndLevels.c.artifactTypeID, meta.RelatedArtifactsAndLevels.c.conceptCollectionHandle, func.count(meta.RelatedArtifactsAndLevels.c.id)).filter(meta.RelatedArtifactsAndLevels.c.conceptCollectionHandle.like(collectionHandleRegex), meta.RelatedArtifactsAndLevels.c.collectionCreatorID == collectionCreatorID)
            
            considerModalitiesOfTypesIDMap = {}
            considerModalitiesOfTypeIDs = []
            considerModalitiesOfTypes = queryOptions.pop('considerModalitiesOfTypes', [])
            if considerModalitiesOfTypes:
                considerModalitiesOfTypeInfos = meta.Session.query(meta.ArtifactTypes.c.name, meta.ArtifactTypes.c.id).filter(meta.ArtifactTypes.c.name.in_(considerModalitiesOfTypes)).all()
                if len(considerModalitiesOfTypeInfos) != len(considerModalitiesOfTypes):
                    raise exceptions.InvalidArgumentException(u"One or more types in the given considerModalitiesOfTypes : [{considerModalitiesOfTypes}] could not be found in the dataBase.".format(considerModalitiesOfTypes=considerModalitiesOfTypes).encode('utf-8'))
                for considerModalitiesOfTypeInfo in considerModalitiesOfTypeInfos:
                    considerModalitiesOfTypeIDs.append(considerModalitiesOfTypeInfo[1])
                    considerModalitiesOfTypesIDMap[considerModalitiesOfTypeInfo[0]] = considerModalitiesOfTypeInfo[1]
                if considerModalitiesOfTypeIDs:
                    featuredModalityTypeCountsQuery = featuredModalityTypeCountsQuery.filter(meta.RelatedArtifactsAndLevels.c.artifactTypeID.in_(considerModalitiesOfTypeIDs))

            includeCK12OwnedCounts = queryOptions.pop('includeCK12OwnedCounts', False)
            includeCommunityOwnedCounts = queryOptions.pop('includeCommunityOwnedCounts', False)
            if includeCK12OwnedCounts or includeCommunityOwnedCounts:
                try:
                    ck12EditorLogin = 'ck12editor'
                    ck12EditorDO = meta.Session.query(meta.Members.c.id).filter(meta.Members.c.login == ck12EditorLogin).one()
                except exc.NoResultFound:
                    raise exceptions.ResourceNotFoundException(u"Member with the ck12EditorLogin : [{ck12EditorLogin}] could not be found in the dataBase.".format(ck12EditorLogin=ck12EditorLogin).encode('utf-8'))
                except exc.MultipleResultsFound:
                    raise exceptions.SystemDataException(u"Multiple members with the given ck12EditorLogin : [{ck12EditorLogin}] are found in the dataBase. Internal System data error.".format(ck12EditorLogin=ck12EditorLogin).encode('utf-8'))
                ck12EditorID = ck12EditorDO.id

            #Determining CK12Owned Counts
            ck12OwnedFeaturedModalityTypeCountsDict = {}
            if includeCK12OwnedCounts:
                try:
                    ck12EditorLogin = 'ck12editor'
                    ck12EditorDO = meta.Session.query(meta.Members.c.id).filter(meta.Members.c.login == ck12EditorLogin).one()
                except exc.NoResultFound:
                    raise exceptions.ResourceNotFoundException(u"Member with the ck12EditorLogin : [{ck12EditorLogin}] could not be found in the dataBase.".format(ck12EditorLogin=ck12EditorLogin).encode('utf-8'))
                except exc.MultipleResultsFound:
                    raise exceptions.SystemDataException(u"Multiple members with the given ck12EditorLogin : [{ck12EditorLogin}] are found in the dataBase. Internal System data error.".format(ck12EditorLogin=ck12EditorLogin).encode('utf-8'))
                ck12EditorID = ck12EditorDO.id
                ck12OwnedFeaturedModalityTypeCountsQuery = featuredModalityTypeCountsQuery.filter(meta.RelatedArtifactsAndLevels.c.creatorID == ck12EditorID, meta.RelatedArtifactsAndLevels.c.publishTime != None)
                ck12OwnedFeaturedModalityTypeCountsQuery = ck12OwnedFeaturedModalityTypeCountsQuery.join(meta.ArtifactTypes, meta.RelatedArtifactsAndLevels.c.artifactTypeID == meta.ArtifactTypes.c.id).group_by(meta.RelatedArtifactsAndLevels.c.domainEID, meta.RelatedArtifactsAndLevels.c.conceptCollectionHandle, meta.ArtifactTypes.c.name)    
                ck12OwnedFeaturedModalityTypeCountInfos = ck12OwnedFeaturedModalityTypeCountsQuery.all()
                for ck12OwnedFeaturedModalityTypeCountInfo in ck12OwnedFeaturedModalityTypeCountInfos:
                    ck12OwnedFeaturedModalityDomainEncodedID = ck12OwnedFeaturedModalityTypeCountInfo[0]
                    ck12OwnedFeaturedModalityDomainHandle = ck12OwnedFeaturedModalityTypeCountInfo[1]
                    ck12OwnedFeaturedModalityDomainID = ck12OwnedFeaturedModalityTypeCountInfo[2]
                    ck12OwnedFeaturedModalityDomainName = ck12OwnedFeaturedModalityTypeCountInfo[3]
                    ck12OwnedFeaturedModalityTypeName = ck12OwnedFeaturedModalityTypeCountInfo[4]
                    ck12OwnedFeaturedModalityTypeID = ck12OwnedFeaturedModalityTypeCountInfo[5]
                    ck12OwnedFeaturedModalityConceptCollectionHandle = ck12OwnedFeaturedModalityTypeCountInfo[6]
                    ck12OwnedFeaturedModalityTypeCount = ck12OwnedFeaturedModalityTypeCountInfo[7]
                    if ck12OwnedFeaturedModalityDomainEncodedID not in ck12OwnedFeaturedModalityTypeCountsDict:
                        ck12OwnedFeaturedModalityTypeCountsDict[ck12OwnedFeaturedModalityDomainEncodedID] = {}
                        ck12OwnedFeaturedModalityTypeCountsDict[ck12OwnedFeaturedModalityDomainEncodedID]['handle'] = ck12OwnedFeaturedModalityDomainHandle
                        ck12OwnedFeaturedModalityTypeCountsDict[ck12OwnedFeaturedModalityDomainEncodedID]['id'] = ck12OwnedFeaturedModalityDomainID
                        ck12OwnedFeaturedModalityTypeCountsDict[ck12OwnedFeaturedModalityDomainEncodedID]['name'] = ck12OwnedFeaturedModalityDomainName
                        ck12OwnedFeaturedModalityTypeCountsDict[ck12OwnedFeaturedModalityDomainEncodedID]['conceptCollectionHandleCounts'] = {}
                        
                    if ck12OwnedFeaturedModalityConceptCollectionHandle not in ck12OwnedFeaturedModalityTypeCountsDict[ck12OwnedFeaturedModalityDomainEncodedID]['conceptCollectionHandleCounts']:
                        ck12OwnedFeaturedModalityTypeCountsDict[ck12OwnedFeaturedModalityDomainEncodedID]['conceptCollectionHandleCounts'][ck12OwnedFeaturedModalityConceptCollectionHandle] = {}
                        ck12OwnedFeaturedModalityTypeCountsDict[ck12OwnedFeaturedModalityDomainEncodedID]['conceptCollectionHandleCounts'][ck12OwnedFeaturedModalityConceptCollectionHandle]['ck12OwnedCounts'] = {}

                    if ck12OwnedFeaturedModalityTypeName in ck12OwnedFeaturedModalityTypeCountsDict[ck12OwnedFeaturedModalityDomainEncodedID]['conceptCollectionHandleCounts'][ck12OwnedFeaturedModalityConceptCollectionHandle]['ck12OwnedCounts']:
                        raise exceptions.SystemImplementationException(u"Duplicate ck12OwnedFeaturedModalityTypeName : [{ck12OwnedFeaturedModalityTypeName}] encountered when determining the ck12OwnedFeaturedModalityTypeCounts from the results of a groupBy query. Internal System implementation error. Please contact the admin.".format(ck12OwnedFeaturedModalityTypeName=ck12OwnedFeaturedModalityTypeName).encode('utf-8'))
                    ck12OwnedFeaturedModalityTypeCountsDict[ck12OwnedFeaturedModalityDomainEncodedID]['conceptCollectionHandleCounts'][ck12OwnedFeaturedModalityConceptCollectionHandle]['ck12OwnedCounts'][ck12OwnedFeaturedModalityTypeName]  = ck12OwnedFeaturedModalityTypeCount
            
            #Determinging Community Owned Counts
            communityOwnedFeaturedModalityTypeCountsDict = {}
            if includeCommunityOwnedCounts:
                communityOwnedFeaturedModalityTypeCountsQuery = featuredModalityTypeCountsQuery
                if memberDict.get('memberID'):            
                    memberID = memberDict.get('memberID')
                    communityOwnedFeaturedModalityTypeCountsQuery = communityOwnedFeaturedModalityTypeCountsQuery.filter(or_(and_(meta.RelatedArtifactsAndLevels.c.creatorID != ck12EditorID, meta.RelatedArtifactsAndLevels.c.publishTime != None), and_(meta.RelatedArtifactsAndLevels.c.creatorID == memberID, meta.RelatedArtifactsAndLevels.c.publishTime == None)))
                else:
                    communityOwnedFeaturedModalityTypeCountsQuery = communityOwnedFeaturedModalityTypeCountsQuery.filter(meta.RelatedArtifactsAndLevels.c.creatorID != ck12EditorID, meta.RelatedArtifactsAndLevels.c.publishTime != None)
                communityOwnedFeaturedModalityTypeCountsQuery = communityOwnedFeaturedModalityTypeCountsQuery.join(meta.ArtifactTypes, meta.RelatedArtifactsAndLevels.c.artifactTypeID == meta.ArtifactTypes.c.id).group_by(meta.RelatedArtifactsAndLevels.c.domainEID, meta.RelatedArtifactsAndLevels.c.conceptCollectionHandle, meta.ArtifactTypes.c.name)
                communityOwnedFeaturedModalityTypeCountInfos = communityOwnedFeaturedModalityTypeCountsQuery.all()
                for communityOwnedFeaturedModalityTypeCountInfo in communityOwnedFeaturedModalityTypeCountInfos:
                    communityOwnedFeaturedModalityDomainEncodedID = communityOwnedFeaturedModalityTypeCountInfo[0]
                    communityOwnedFeaturedModalityDomainHandle = communityOwnedFeaturedModalityTypeCountInfo[1]
                    communityOwnedFeaturedModalityDomainID = communityOwnedFeaturedModalityTypeCountInfo[2]
                    communityOwnedFeaturedModalityDomainName = communityOwnedFeaturedModalityTypeCountInfo[3]
                    communityOwnedFeaturedModalityTypeName = communityOwnedFeaturedModalityTypeCountInfo[4]
                    communityOwnedFeaturedModalityTypeID = communityOwnedFeaturedModalityTypeCountInfo[5]
                    communityOwnedFeaturedModalityConceptCollectionHandle = communityOwnedFeaturedModalityTypeCountInfo[6]
                    communityOwnedFeaturedModalityTypeCount = communityOwnedFeaturedModalityTypeCountInfo[7]
                    if communityOwnedFeaturedModalityDomainEncodedID not in communityOwnedFeaturedModalityTypeCountsDict:
                        communityOwnedFeaturedModalityTypeCountsDict[communityOwnedFeaturedModalityDomainEncodedID] = {}
                        communityOwnedFeaturedModalityTypeCountsDict[communityOwnedFeaturedModalityDomainEncodedID]['handle'] = communityOwnedFeaturedModalityDomainHandle
                        communityOwnedFeaturedModalityTypeCountsDict[communityOwnedFeaturedModalityDomainEncodedID]['id'] = communityOwnedFeaturedModalityDomainID
                        communityOwnedFeaturedModalityTypeCountsDict[communityOwnedFeaturedModalityDomainEncodedID]['name'] = communityOwnedFeaturedModalityDomainName
                        communityOwnedFeaturedModalityTypeCountsDict[communityOwnedFeaturedModalityDomainEncodedID]['conceptCollectionHandleCounts'] = {}
                        communityOwnedFeaturedModalityTypeCountsDict[communityOwnedFeaturedModalityDomainEncodedID]['conceptCollectionHandleCounts'][communityOwnedFeaturedModalityConceptCollectionHandle] = {}
                        communityOwnedFeaturedModalityTypeCountsDict[communityOwnedFeaturedModalityDomainEncodedID]['conceptCollectionHandleCounts'][communityOwnedFeaturedModalityConceptCollectionHandle]['communityOwnedCounts'] = {}


                    if communityOwnedFeaturedModalityTypeName in communityOwnedFeaturedModalityTypeCountsDict[communityOwnedFeaturedModalityDomainEncodedID]['conceptCollectionHandleCounts'][communityOwnedFeaturedModalityConceptCollectionHandle]['communityOwnedCounts']:
                        raise exceptions.SystemImplementationException(u"Duplicate communityOwnedFeaturedModalityTypeName : [{communityOwnedFeaturedModalityTypeName}] encountered when determining the communityOwnedFeaturedModalityTypeCounts from the results of a groupBy query. Internal System implementation error. Please contact the admin.".format(communityOwnedFeaturedModalityTypeName=communityOwnedFeaturedModalityTypeName).encode('utf-8'))
                    communityOwnedFeaturedModalityTypeCountsDict[communityOwnedFeaturedModalityDomainEncodedID]['conceptCollectionHandleCounts'][communityOwnedFeaturedModalityConceptCollectionHandle]['communityOwnedCounts'][communityOwnedFeaturedModalityTypeName]  = communityOwnedFeaturedModalityTypeCount

            featureModalityTypeCountsDict = util.mergeDictionariesRecursively(dict(ck12OwnedFeaturedModalityTypeCountsDict), communityOwnedFeaturedModalityTypeCountsDict)
            for key, value in featureModalityTypeCountsDict.items():
                processedConceptCollectionHandleCounts= []
                for conceptCollectionHandle, conceptCollectionHandleCountsDict in featureModalityTypeCountsDict[key]['conceptCollectionHandleCounts'].items():
                    conceptCollectionHandleCountsDict['conceptCollectionHandle'] = conceptCollectionHandle
                    processedConceptCollectionHandleCounts.append(conceptCollectionHandleCountsDict)
                featureModalityTypeCountsDict[key]['conceptCollectionHandleCounts'] = processedConceptCollectionHandleCounts

            meta.Session.commit()
            return featureModalityTypeCountsDict
        except SQLAlchemyError, sqlae:
            meta.Session.rollback()
            raise exceptions.SystemInternalException(unicode(sqlae).encode('utf-8'))
        except Exception, e:
            meta.Session.rollback()
            raise e
        finally:
            meta.Session.expire_all()
            meta.Session.close()
            meta.Session.remove()