import logging
from datetime import datetime
from flx.model.mongo.validationwrapper import ValidationWrapper

log = logging.getLogger(__name__)

class CollectionNode(ValidationWrapper):
    def __init__(self, db, dc=False):
        self.db = db
        # Dependency check flag
        self.dc = dc

        self.required_fields_collection = [
            'creatorID', 'description', 'handle', 'isCanonical', 
            'isPublished', 'title', 'type'
        ]
        self.required_fields = [
            'absoluteHandle', 'title', 'encodedID', 
            'handle', 'descendantIdentifier', 'collection',
            'rank', 'level'
        ]
        self.field_dependencies = { }

    def create(self, **kwargs):
        if not kwargs.has_key('encodedID'):
            kwargs['encodedID'] = None
        if not kwargs.has_key('rank'):
            kwargs['rank'] = self.__getRankFromDescendantIdentifier(kwargs['descendantIdentifier'])

        for key in kwargs.keys():
            if key not in self.required_fields:
                del kwargs[key]
            if key == 'collection':
                if not kwargs[key].has_key('isCanonical'):
                    kwargs[key]['isCanonical'] = False
                if not kwargs[key].has_key('isPublished'):
                    kwargs[key]['isPublished'] = False
                if not kwargs[key].has_key('description'):
                    kwargs[key]['description'] = ''
                for ck in self.required_fields_collection:
                    if not kwargs[key].has_key(ck):
                        raise Exception("Required key 'collection.%s' not found!" % ck)
                
        self.before_insert(**kwargs)
        kwargs['created'] = datetime.now()
        log.debug("Inserting: %s" % kwargs)
        id = self.db.CollectionNodes.insert(kwargs)
        return self.getByID(id)

    def __getRankFromDescendantIdentifier(self, descID):
        parts = descID.split('.')
        while len(parts) < 4:
            parts.append(0)
        return ".".join([ str(x).rjust(4, '0') for x in parts ])

    def deleteAll(self, collectionHandle=None):
        query = {}
        if collectionHandle:
            query['collection.handle'] = collectionHandle.lower()
        self.db.CollectionNodes.remove(query)

    def deleteByDescendantIdentifier(self, descendantIdentifier, collectionHandle, collectionCreatorID=3):
        self.db.CollectionNodes.remove({'descendantIdentifier': descendantIdentifier, 'collection.handle': collectionHandle.lower(), 'collection.creatorID': collectionCreatorID})
        rank = self.__getRankFromDescendantIdentifier(descendantIdentifier)
        if rank:
            self.deleteByRank(rank, collectionHandle, collectionCreatorID)

    def deleteByAbsoluteHandle(self, absoluteHandle, collectionHandle, collectionCreatorID=3):
        self.db.CollectionNodes.remove({'absoluteHandle': absoluteHandle, 'collection.handle': collectionHandle.lower(), 'collection.creatorID': collectionCreatorID})

    def deleteByRank(self, rank, collectionHandle, collectionCreatorID=3):
        self.db.CollectionNodes.remove({'rank': rank, 'collection.handle': collectionHandle.lower(), 'collection.creatorID': collectionCreatorID})

    def getByDescendantIdentifier(self, descendantIdentifier, collectionHandle, collectionCreatorID=3):
        rank = self.__getRankFromDescendantIdentifier(descendantIdentifier)
        self.db.CollectionNodes.find_one({'rank': rank, 'collection.handle': collectionHandle.lower(), 'collection.creatorID': collectionCreatorID})

    def getByID(self, id):
        return self.db.CollectionNodes.find_one(id)

    def getByEncodedIDs(self, eIDs, collectionHandle=None, collectionCreatorID=3, publishedOnly=True, canonicalOnly=False):
        query = {'encodedID': {'$in': eIDs }}
        if collectionHandle:
            query['collection.handle'] = collectionHandle.lower()
        if collectionCreatorID:
            query['collection.creatorID'] = collectionCreatorID
        if publishedOnly:
            query['collection.isPublished'] = True
        if canonicalOnly:
            query['collection.isCanonical'] = True
        return self.db.CollectionNodes.find(query)

    def getByEncodedIDsAndConceptCollectionHandle(self, eIDs, conceptCollectionHandle, collectionCreatorID=3, publishedOnly=True):
        query = { 'encodedID': {'$in': eIDs }, 'handle': conceptCollectionHandle }
        if collectionCreatorID:
            query['collection.creatorID'] = collectionCreatorID
        if publishedOnly is not None:
            query['collection.isPublished'] = publishedOnly
        return self.db.CollectionNodes.find(query)

    def getByConceptCollectionHandles(self, conceptCollectionHandles, collectionCreatorID=None, publishedOnly=True):
        query = {'handle': {'$in': conceptCollectionHandles}}
        if collectionCreatorID:
            query['collection.creatorID'] = collectionCreatorID
        if publishedOnly:
            query['collection.isPublished'] = True
        return self.db.CollectionNodes.find(query)

    def getDescedantNodesByCollectioHandleCreatorIDAndIdentifier(self, collectionHandle, collectionCreatorID, collectionNodeIdentifier):
        query = {
            'collection.handle': collectionHandle.lower(),
            'collection.creatorID': collectionCreatorID,
            'descendantIdentifier': {'$regex': "^"+str(collectionNodeIdentifier)+"$|^"+str(collectionNodeIdentifier)+"\..*"}
        }
        return self.db.CollectionNodes.find(query)

    def getByConceptCollectionHandle(self, conceptCollectionHandle, collectionCreatorID=3, encodedID=None):
        query = {'handle': conceptCollectionHandle, 'collection.creatorID': collectionCreatorID}
        if encodedID:
            query['encodedID'] = encodedID
        return self.db.CollectionNodes.find_one(query)

    def getConceptsForCollection(self, collectionHandle, collectionCreatorID=3, level=0):
        query = { 'collection.handle': collectionHandle.lower(), 'collection.creatorID': collectionCreatorID }
        if level:
            query['level'] = level
        return self.db.CollectionNodes.find(query).sort([('rank', 1)])

    def getCollectionInfosForEncodedID(self, encodedID, publishedOnly=True, canonicalOnly=True):
        query = { 'encodedID': encodedID, 'collection.handle': {'$exists': True} }
        if publishedOnly:
            query['collection.isPublished'] = True
        if canonicalOnly:
            query['collection.isCanonical'] = True
        return self.db.CollectionNodes.find(query)

    def asDict(self, collectionNode):
        return { 
                'collectionHandle': collectionNode['collection']['handle'], 
                'collectionTitle': collectionNode['collection']['title'],
                'conceptCollectionAbsoluteHandle': collectionNode['absoluteHandle'], 
                'conceptCollectionTitle': collectionNode['title'],
                'encodedID': collectionNode.get('encodedID'),
                'collectionCreatorID': collectionNode['collection']['creatorID'],
                'isCanonical': collectionNode['collection'].get('isCanonical', False)
        }

