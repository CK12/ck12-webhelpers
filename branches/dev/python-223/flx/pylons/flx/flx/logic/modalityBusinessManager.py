from flx.model.modalityDataManager import ModalityDataModel

class ModalityBusinessLogic(object):

    def __init__(self):
        self.dataModel = ModalityDataModel()

    def getFeaturedModalitiesForDomainHandleOrEncodedID(self, domainHandleOrEncodedID, memberDict, queryOptions):
        return self.dataModel.getFeaturedModalitiesForDomainHandleOrEncodedID(domainHandleOrEncodedID, memberDict, queryOptions)

    def getFeaturedModalityTypeCountsForDomainHandleOrEncodedID(self, domainHandleOrEncodedID, memberDict, queryOptions):
        return self.dataModel.getFeaturedModalityTypeCountsForDomainHandleOrEncodedID(domainHandleOrEncodedID, memberDict, queryOptions)
    
    def getFeaturedModalityTypeCountsForCollectionHandleAndCreatorID(self, collectionHandle, collectionCreatorID, memberDict, queryOptions):
        return self.dataModel.getFeaturedModalityTypeCountsForCollectionHandleAndCreatorID(collectionHandle, collectionCreatorID, memberDict, queryOptions)