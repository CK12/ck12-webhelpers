from auth.model.partnerDataManager import PartnerDataModel

class PartnerBusinessLogic(object):

    def __init__(self):
        self.dataModel = PartnerDataModel()

    def validatePartnerRequestOrigin(self, partnerName, requestSignature, requestData):
        return self.dataModel.validatePartnerRequestOrigin(partnerName, requestSignature, requestData)

    def loginMember(self, partnerName, loginDict):
        return self.dataModel.loginMember(partnerName, loginDict)