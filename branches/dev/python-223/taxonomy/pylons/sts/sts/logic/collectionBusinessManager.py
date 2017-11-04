from sts.model.collectionDataManager import CollectionDataModel

class CollectionBusinessLogic(object):

    def __init__(self):
        self.dataModel = CollectionDataModel()

    def createCollection(self, memberDict, collectionDict):
        return self.dataModel.createCollection(memberDict, collectionDict)

    def getPublishedCollections(self, queryOptions):
        return self.dataModel.getPublishedCollections(queryOptions)

    def searchCollections(self, queryOptions):
        return self.dataModel.searchCollections(queryOptions)

    def getCollectionByHandleCreatorIDAndDescendantIdentifierOrHandle(self, collectionHandle, collectionCreatorID, collectionDescendantIdentifier, collectionDescendantHandle, queryOptions):
        return self.dataModel.getCollectionByHandleCreatorIDAndDescendantIdentifierOrHandle(collectionHandle, collectionCreatorID, collectionDescendantIdentifier, collectionDescendantHandle, queryOptions)

    def deleteCollection(self, memberDict, collectionHandle):
        return self.dataModel.deleteCollection(memberDict, collectionHandle)

