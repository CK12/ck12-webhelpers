from flx.model.partnerDataManager import PartnerDataModel

class PartnerBusinessLogic(object):

    def __init__(self):
        self.dataModel = PartnerDataModel()

    def buildAssignment(self, memberDict, assignmentDict, partnerAppName):
        return self.dataModel.buildAssignment(memberDict, assignmentDict, partnerAppName)

    def enrollMembersInGroup(self, memberDict, enrollDict, partnerAppName):
        return self.dataModel.enrollMembersInGroup(memberDict, enrollDict, partnerAppName)

    def getAssignmentProgress(self, memberDict, partnerAppName, partnerGroupID, assignmentID):
        return self.dataModel.getAssignmentProgress(memberDict, partnerAppName, partnerGroupID, assignmentID)