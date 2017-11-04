from flx.model.artifactDataManager import ArtifactDataModel

class ArtifactBusinessLogic(object):

    def __init__(self):
        self.dataModel = ArtifactDataModel()


    def getArtifactByRevisionIDAndDescendantIdentifier(self, artifactRevisionID, artifactDescendantIdentifier, queryOptions):
        return self.dataModel.getArtifactByRevisionIDAndDescendantIdentifier(artifactRevisionID, artifactDescendantIdentifier, queryOptions)

    def getArtifactByIDRevisionNOAndDescendantIdentifier(self, artifactID, artifactRevisionNO, artifactDescendantIdentifier, queryOptions):
        return self.dataModel.getArtifactByIDRevisionNOAndDescendantIdentifier(artifactID, artifactRevisionNO, artifactDescendantIdentifier, queryOptions)

    def getArtifactByTypeHandleCreatorRevisionNOAndDescendantIdentifier(self, artifactType, artifactHandle, artifactCreator, artifactRevisionNO, artifactDescendantIdentifier, queryOptions):
        return self.dataModel.getArtifactByTypeHandleCreatorRevisionNOAndDescendantIdentifier(artifactType, artifactHandle, artifactCreator, artifactRevisionNO, artifactDescendantIdentifier, queryOptions)

    
    def getArtifactFeedbacksByRevisionIDAndDescendantIdentifier(self, artifactRevisionID, artifactDescendantIdentifier, queryOptions):
        return self.dataModel.getArtifactFeedbacksByRevisionIDAndDescendantIdentifier(artifactRevisionID, artifactDescendantIdentifier, queryOptions)

    def getArtifactFeedbacksByIDRevisionNOAndDescendantIdentifier(self, artifactID, artifactRevisionNO, artifactDescendantIdentifier, queryOptions):
        return self.dataModel.getArtifactFeedbacksByIDRevisionNOAndDescendantIdentifier(artifactID, artifactRevisionNO, artifactDescendantIdentifier, queryOptions)
    
    def getArtifactFeedbacksByTypeHandleCreatorRevisionNOAndDescendantIdentifier(self, artifactType, artifactHandle, artifactCreator, artifactRevisionNO, artifactDescendantIdentifier, queryOptions):
        return self.dataModel.getArtifactFeedbacksByTypeHandleCreatorRevisionNOAndDescendantIdentifier(artifactType, artifactHandle, artifactCreator, artifactRevisionNO, artifactDescendantIdentifier, queryOptions)


    def createArtifactDraft(self, memberDict, artifactDict):
        return self.dataModel.createArtifactDraft(memberDict, artifactDict)

    def updateArtifactDraftByID(self, memberDict, artifactDraftID, artifactDict):
        return self.dataModel.updateArtifactDraftByID(memberDict, artifactDraftID, artifactDict)

    def deleteArtifactDraftByID(self, memberDict, artifactDraftID):
        return self.dataModel.deleteArtifactDraftByID(memberDict, artifactDraftID)

    def getArtifactDraftByID(self, memberDict, artifactDraftID):
        return self.dataModel.getArtifactDraftByID(memberDict, artifactDraftID)

    def getArtifactDraftByTypeAndHandle(self, memberDict, artifactDraftType, artifactDraftHandle):
        return self.dataModel.getArtifactDraftByTypeAndHandle(memberDict, artifactDraftType, artifactDraftHandle)

    def getArtifactDraftByArtifactRevisionID(self, memberDict, artifactDraftArtifactRevisionID, collaborationGroupID=None):
        return self.dataModel.getArtifactDraftByArtifactRevisionID(memberDict, artifactDraftArtifactRevisionID, collaborationGroupID)

    def getArtifactDrafts(self, memberDict):
        return self.dataModel.getArtifactDrafts(memberDict)

    def updateArtifact(self, memberID, artifactDict, artifactType=None, artifactHandle=None, artifactCreator=None,
                          artifactDescendantIdentifier=None, artifactCache=None):
        return self.dataModel.updateArtifactEntryFunction(memberID, artifactDict, artifactType, artifactHandle,
                                                          artifactCreator, artifactDescendantIdentifier, artifactCache)

    def createArtifact(self, memberID, artifactDict, artifactCache=None):
        #TODO: revisit
        return self.dataModel.updateArtifactEntryFunction(memberID, artifactDict, artifactType=None, artifactHandle=None,
                                                          artifactCreator=memberID, artifactDescendantIdentifier=None,
                                                          artifactCache=artifactCache)
