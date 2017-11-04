import logging
from datetime import datetime

from flx.model.mongo.validationwrapper import ValidationWrapper
from flx.model.mongo.collectionNode import CollectionNode
from flx.model import api

log = logging.getLogger(__name__)

class RelatedArtifacts(ValidationWrapper):

    def __init__(self, db, dc=False):
        self.db = db
        # Dependency check flag
        self.dc = dc
        self.required_fields = ['encodedID']

    """
        Get Related Artifacts for given encodedIDs
    """
    def getRelatedArtifact(self, **kwargs):
        try:
            results = []
            encodedIDs = [eid.upper() for eid in kwargs['encodedIDs']]
            conceptCollectionHandle = kwargs.get('conceptCollectionHandle')
            collectionCreatorID = kwargs.get('collectionCreatorID')
            query = { 'encodedID': {'$in': encodedIDs }}
            if conceptCollectionHandle:
                query['conceptCollectionHandle'] = conceptCollectionHandle
                query['collectionCreatorID'] = collectionCreatorID
            relatedArtifacts = self.db.RelatedArtifacts.find(query)
            for relatedArtifact in relatedArtifacts:
                results.append(relatedArtifact)

            return results
        except Exception as e:
            log.error('Error getting related artifacts: %s' %(str(e)), exc_info=e)
            raise e
        return []

    """
        Create Related Artifacts for given encodedID
    """
    def createRelatedArtifact(self, **kwargs):
        try:
            self.before_insert(**kwargs)
            kwargs['encodedID'] = kwargs['encodedID'].upper()
            
            encodedID = kwargs.get('encodedID')

            domain = api.getDomainTermByEncodedID(encodedID)
            if not domain:
                raise Exception("No such domain with encodedID [%s] " % encodedID)
            self.insertRelatedArtifact(domain)

            ## Proces collectionInfo
            collectionInfos = CollectionNode(self.db).getCollectionInfosForEncodedID(encodedID=encodedID, publishedOnly=True)
            for collectionInfo in collectionInfos:
                self.insertRelatedArtifact(domain, collectionInfo)
        except Exception as e:
            log.error('Error creating related artifacts: %s' %(str(e)), exc_info=e)
            raise e
        return {}

    def insertRelatedArtifact(self, domain, collectionInfo=None):
        encodedID = domain.encodedID.upper()
        kwargs = {}
        kwargs['encodedID'] = encodedID
        kwargs['handle'] = domain.handle
        kwargs['domainID'] = int(domain.id)

        kwargs['artifacts'] = []

        if not collectionInfo:
            modalities = self.getModalities(domain)
        else:
            modalities = self.getModalities(domain, conceptCollectionHandle=collectionInfo['handle'], collectionCreatorID=collectionInfo['collection']['creatorID'])
            kwargs['conceptCollectionHandle'] = collectionInfo['handle']
            kwargs['collectionCreatorID'] = collectionInfo['collection']['creatorID']
            kwargs['collectionHandle'] = collectionInfo['collection']['handle']
        for eachmodality in modalities:
            artifactDict = {}
            artifactDict['artifactID'] = eachmodality.id
            artifactDict['artifactType'] = eachmodality.getArtifactType()
            artifactDict['level'] = eachmodality.getLevel()
            artifactDict['pop_score'] = eachmodality.getScore()
            kwargs['artifacts'].append(artifactDict)
            
        if not collectionInfo:
            query = {'encodedID': encodedID, 'conceptCollectionHandle': {'$exists': False}}
        else:
            query = {'encodedID': encodedID, 'conceptCollectionHandle': collectionInfo['handle'], 'collectionCreatorID': collectionInfo['collection']['creatorID']}
        relatedArtifacts = self.db.RelatedArtifacts.find_one(query)

        kwargs['creationTime'] = relatedArtifacts.get('creationTime', datetime.now()) if relatedArtifacts else datetime.now()
        kwargs['updateTime'] = datetime.now()
        log.info("Adding RelatedArtifacts for encodedID %s" %encodedID)
        log.info('kwargs =  %s' % kwargs)

        self.db.RelatedArtifacts.update(query, {"$set": kwargs}, upsert=True)
        return kwargs

    def getModalities(self, domain, conceptCollectionHandle=None, collectionCreatorID=3):

        relatedArtifacts = api.getRelatedArtifactsForDomains(domainIDs=[domain.id], conceptCollectionHandle=conceptCollectionHandle, collectionCreatorID=collectionCreatorID, ownedBy='ck12', pageNum=1, pageSize=100)
        modalities = []
        for eachModality in relatedArtifacts:
            artifact = api.getArtifactByID(id=eachModality.id)
            modalities.append(artifact)

        return modalities
