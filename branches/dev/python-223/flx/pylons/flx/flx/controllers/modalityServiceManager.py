from pylons.controllers import WSGIController
from pylons import request, response
from flx.logic.modalityBusinessManager import ModalityBusinessLogic
from flx.controllers import user
from flx.model import exceptions
from flx.controllers import decorators as dec1
from flx.util import decorators as dec2
import json

__controller__ = 'ModalityServiceController'

class ModalityServiceController(WSGIController):

    def __init__(self):
        self.businessLogic = ModalityBusinessLogic()

    def _validateRequestMethod(self, validMethods):
        if request.method not in validMethods:
            raise exceptions.InvalidHTTPMethodException(u"HTTPMethod : [{httpMethod}] is not supported for this URL : [{URL}]".format(httpMethod=request.method, URL=request.path).encode('utf-8'))

    def _validateAndProcessDomainHandleOrEncodedID(self, domainHandleOrEncodedID):
        if not domainHandleOrEncodedID or not isinstance(domainHandleOrEncodedID, basestring):
            raise exceptions.InvalidArgumentException(u"Invalid domainHandleOrEncodedID : [{domainHandleOrEncodedID}] is received.".format(domainHandleOrEncodedID=domainHandleOrEncodedID).encode('utf-8'))
        return domainHandleOrEncodedID

    def _validateAndProcessCollectionHandle(self, collectionHandle):
        if not collectionHandle or not isinstance(collectionHandle, basestring):
            raise exceptions.InvalidArgumentException(u"Invalid collectionHandle : [{collectionHandle}] is received.".format(collectionHandle=collectionHandle).encode('utf-8'))
        collectionHandle = collectionHandle.lower()
        return collectionHandle

    def _validateAndProcessCollectionCreatorID(self, collectionCreatorID):
        if collectionCreatorID is not None:
            try :
                collectionCreatorID=long(collectionCreatorID)
            except (ValueError, TypeError) as e:
                raise exceptions.InvalidArgumentException(u"Invalid value for collectionCreatorID : [{collectionCreatorID}] received.".format(collectionCreatorID=collectionCreatorID).encode('utf-8'))
            if collectionCreatorID <=0:
                raise exceptions.InvalidArgumentException(u"Invalid value for collectionCreatorID : [{collectionCreatorID}] received.".format(collectionCreatorID=collectionCreatorID).encode('utf-8'))
        return collectionCreatorID

    def _extractMemberDict(self):
        memberDict = {}
        member = user.getCurrentUser(anonymousOkay=False, autoLogin=True)
        if member:
            memberDict['memberID'] = member.id
            memberDict['memberEmail'] = member.email
            memberDict['memberLogin'] = member.login
            memberDict['memberDefaultLogin'] = member.defaultLogin
        return memberDict

    def _extractAndDefaultQueryOptionsForFeaturedModalitiesGenerationFromDomainHandleOrEncodedID(self):
        queryOptions = {}

        conceptCollectionHandle = request.GET.get('conceptCollectionHandle')
        if conceptCollectionHandle is not None:
            if not conceptCollectionHandle or not isinstance(conceptCollectionHandle, basestring):
                raise exceptions.InvalidArgumentException(u"Invalid value for conceptCollectionHandle : [{conceptCollectionHandle}] received.".format(conceptCollectionHandle=conceptCollectionHandle).encode('utf-8'))
            conceptCollectionHandle = conceptCollectionHandle.lower()
            queryOptions['conceptCollectionHandle'] = conceptCollectionHandle

        collectionCreatorID = request.GET.get('collectionCreatorID')
        if collectionCreatorID is not None:
            try :
                collectionCreatorID=long(collectionCreatorID)
            except (ValueError, TypeError) as e:
                raise exceptions.InvalidArgumentException(u"Invalid value for collectionCreatorID : [{collectionCreatorID}] received.".format(collectionCreatorID=collectionCreatorID).encode('utf-8'))
            if collectionCreatorID <=0:
                raise exceptions.InvalidArgumentException(u"Invalid value for collectionCreatorID : [{collectionCreatorID}] received.".format(collectionCreatorID=collectionCreatorID).encode('utf-8'))
            queryOptions['collectionCreatorID'] = collectionCreatorID

        if (conceptCollectionHandle and not collectionCreatorID) or (not conceptCollectionHandle and collectionCreatorID):
            raise Exception((_(u"Invalid query parameters received. conceptCollectionHandle & collectionCreatorID should be either present or not present togeather." % nodeID)).encode("utf-8"))        

        considerModalitiesOfTypes = request.GET.get('considerModalitiesOfTypes', '')
        if not isinstance(considerModalitiesOfTypes, basestring):
            raise exceptions.InvalidArgumentException(u"Invalid value for considerModalitiesOfTypes : [{considerModalitiesOfTypes}] received.".format(considerModalitiesOfTypes=considerModalitiesOfTypes).encode('utf-8'))
        else:
            if considerModalitiesOfTypes:
                considerModalitiesOfTypes = considerModalitiesOfTypes.split(',')
            else:
                considerModalitiesOfTypes = []
            considerModalitiesOfTypes = list(set(considerModalitiesOfTypes))
            queryOptions['considerModalitiesOfTypes'] = considerModalitiesOfTypes

        considerModalitiesOwnedBy = request.GET.get('considerModalitiesOwnedBy')
        if considerModalitiesOwnedBy and considerModalitiesOwnedBy not in ('all', 'ALL', 'ck12', 'CK12', 'community', 'COMMUNITY'):
            raise exceptions.InvalidArgumentException(u"Invalid value for considerModalitiesOwnedBy : [{considerModalitiesOwnedBy}] received.".format(considerModalitiesOwnedBy=considerModalitiesOwnedBy).encode('utf-8'))
        else:
            if considerModalitiesOwnedBy in ('ck12', 'CK12'):
                considerModalitiesOwnedBy = 'CK12'
            elif considerModalitiesOwnedBy in ('community', 'COMMUNITY'):
                considerModalitiesOwnedBy = 'COMMUNITY'
            else:
                considerModalitiesOwnedBy = 'ALL'
            queryOptions['considerModalitiesOwnedBy'] = considerModalitiesOwnedBy

        pageNO = request.params.get('pageNO')
        if pageNO is not None:
            try :
                pageNO=long(pageNO)
            except (ValueError, TypeError) as e:
                raise exceptions.InvalidArgumentException(u"Invalid value for pageNO : [{pageNO}] received.".format(pageNO=pageNO).encode('utf-8'))
            if pageNO <0:
                raise exceptions.InvalidArgumentException(u"Invalid value for pageNO : [{pageNO}] received.".format(pageNO=pageNO).encode('utf-8'))
        else:
            pageNO = 0;
        queryOptions['pageNO'] = pageNO

        #responseControl related query paramters.
        includeExtendedArtifacts = request.GET.get('includeExtendedArtifacts')
        if includeExtendedArtifacts and includeExtendedArtifacts not in ('true', 'false', 'True', 'False'):
            raise exceptions.InvalidArgumentException(u"Invalid value for includeExtendedArtifacts : [{includeExtendedArtifacts}] received.".format(includeExtendedArtifacts=includeExtendedArtifacts).encode('utf-8'))
        else:
            if includeExtendedArtifacts in ('true', 'True'):
                includeExtendedArtifacts = True
            else:
                includeExtendedArtifacts = False
            queryOptions['includeExtendedArtifacts'] = includeExtendedArtifacts

        includeAuthors = request.GET.get('includeAuthors')
        if includeAuthors and includeAuthors not in ('true', 'false', 'True', 'False'):
            raise exceptions.InvalidArgumentException(u"Invalid value for includeAuthors : [{includeAuthors}] received.".format(includeAuthors=includeAuthors).encode('utf-8'))
        else:
            if includeAuthors in ('true', 'True'):
                includeAuthors = True
            else:
                includeAuthors = False
            queryOptions['includeAuthors'] = includeAuthors

        includeFeedbacks = request.GET.get('includeFeedbacks')
        if includeFeedbacks and includeFeedbacks not in ('true', 'false', 'True', 'False'):
            raise exceptions.InvalidArgumentException(u"Invalid value for includeFeedbacks : [{includeFeedbacks}] received.".format(includeFeedbacks=includeFeedbacks).encode('utf-8'))
        else:
            if includeFeedbacks in ('true', 'True'):
                includeFeedbacks = True
            else:
                includeFeedbacks = False
            queryOptions['includeFeedbacks'] = includeFeedbacks

        includeFeedbackHelpfuls = request.GET.get('includeFeedbackHelpfuls')
        if includeFeedbackHelpfuls and includeFeedbackHelpfuls not in ('true', 'false', 'True', 'False'):
            raise exceptions.InvalidArgumentException(u"Invalid value for includeFeedbackHelpfuls : [{includeFeedbackHelpfuls}] received.".format(includeFeedbackHelpfuls=includeFeedbackHelpfuls).encode('utf-8'))
        else:
            if includeFeedbackHelpfuls in ('true', 'True'):
                includeFeedbackHelpfuls = True
            else:
                includeFeedbackHelpfuls = False
            queryOptions['includeFeedbackHelpfuls'] = includeFeedbackHelpfuls

        includeFeedbackAbuseReports = request.GET.get('includeFeedbackAbuseReports')
        if includeFeedbackAbuseReports and includeFeedbackAbuseReports not in ('true', 'false', 'True', 'False'):
            raise exceptions.InvalidArgumentException(u"Invalid value for includeFeedbackAbuseReports : [{includeFeedbackAbuseReports}] received.".format(includeFeedbackAbuseReports=includeFeedbackAbuseReports).encode('utf-8'))
        else:
            if includeFeedbackAbuseReports in ('true', 'True'):
                includeFeedbackAbuseReports = True
            else:
                includeFeedbackAbuseReports = False
            queryOptions['includeFeedbackAbuseReports'] = includeFeedbackAbuseReports

        includeFeedbackReviews = request.GET.get('includeFeedbackReviews')
        if includeFeedbackReviews and includeFeedbackReviews not in ('true', 'false', 'True', 'False'):
            raise exceptions.InvalidArgumentException(u"Invalid value for includeFeedbackReviews : [{includeFeedbackReviews}] received.".format(includeFeedbackReviews=includeFeedbackReviews).encode('utf-8'))
        else:
            if includeFeedbackReviews in ('true', 'True'):
                includeFeedbackReviews = True
            else:
                includeFeedbackReviews = False
            queryOptions['includeFeedbackReviews'] = includeFeedbackReviews

        includeFeedbackReviewAbuseReports = request.GET.get('includeFeedbackReviewAbuseReports')
        if includeFeedbackReviewAbuseReports and includeFeedbackReviewAbuseReports not in ('true', 'false', 'True', 'False'):
            raise exceptions.InvalidArgumentException(u"Invalid value for includeFeedbackReviewAbuseReports : [{includeFeedbackReviewAbuseReports}] received.".format(includeFeedbackReviewAbuseReports=includeFeedbackReviewAbuseReports).encode('utf-8'))
        else:
            if includeFeedbackReviewAbuseReports in ('true', 'True'):
                includeFeedbackReviewAbuseReports = True
            else:
                includeFeedbackReviewAbuseReports = False
            queryOptions['includeFeedbackReviewAbuseReports'] = includeFeedbackReviewAbuseReports

        includeFeedbackAggregateScores = request.GET.get('includeFeedbackAggregateScores')
        if includeFeedbackAggregateScores and includeFeedbackAggregateScores not in ('true', 'false', 'True', 'False'):
            raise exceptions.InvalidArgumentException(u"Invalid value for includeFeedbackAggregateScores : [{includeFeedbackAggregateScores}] received.".format(includeFeedbackAggregateScores=includeFeedbackAggregateScores).encode('utf-8'))
        else:
            if includeFeedbackAggregateScores in ('true', 'True'):
                includeFeedbackAggregateScores = True
            else:
                includeFeedbackAggregateScores = False
            queryOptions['includeFeedbackAggregateScores'] = includeFeedbackAggregateScores

        includeResources = request.GET.get('includeResources')
        if includeResources and includeResources not in ('true', 'false', 'True', 'False'):
            raise exceptions.InvalidArgumentException(u"Invalid value for includeResources : [{includeResources}] received.".format(includeResources=includeResources).encode('utf-8'))
        else:
            if includeResources in ('true', 'True'):
                includeResources = True
            else:
                includeResources = False
            queryOptions['includeResources'] = includeResources
        
        includeAllResources = request.GET.get('includeAllResources')
        if includeAllResources and includeAllResources not in ('true', 'false', 'True', 'False'):
            raise exceptions.InvalidArgumentException(u"Invalid value for includeAllResources : [{includeAllResources}] received.".format(includeAllResources=includeAllResources).encode('utf-8'))
        else:
            if includeAllResources in ('true', 'True'):
                includeAllResources = True
            else:
                includeAllResources = False
            queryOptions['includeAllResources'] = includeAllResources

        includeResourceAbuseReports = request.GET.get('includeResourceAbuseReports')
        if includeResourceAbuseReports and includeResourceAbuseReports not in ('true', 'false', 'True', 'False'):
            raise exceptions.InvalidArgumentException(u"Invalid value for includeResourceAbuseReports : [{includeResourceAbuseReports}] received.".format(includeResourceAbuseReports=includeResourceAbuseReports).encode('utf-8'))
        else:
            if includeResourceAbuseReports in ('true', 'True'):
                includeResourceAbuseReports = True
            else:
                includeResourceAbuseReports = False
            queryOptions['includeResourceAbuseReports'] = includeResourceAbuseReports

        includeInlineDocuments = request.GET.get('includeInlineDocuments')
        if includeInlineDocuments and includeInlineDocuments not in ('true', 'false', 'True', 'False'):
            raise exceptions.InvalidArgumentException(u"Invalid value for includeInlineDocuments : [{includeInlineDocuments}] received.".format(includeInlineDocuments=includeInlineDocuments).encode('utf-8'))
        else:
            if includeInlineDocuments in ('true', 'True'):
                includeInlineDocuments = True
            else:
                includeInlineDocuments = False
            queryOptions['includeInlineDocuments'] = includeInlineDocuments

        includeEmbeddedObjects = request.GET.get('includeEmbeddedObjects')
        if includeEmbeddedObjects and includeEmbeddedObjects not in ('true', 'false', 'True', 'False'):
            raise exceptions.InvalidArgumentException(u"Invalid value for includeEmbeddedObjects : [{includeEmbeddedObjects}] received.".format(includeEmbeddedObjects=includeEmbeddedObjects).encode('utf-8'))
        else:
            if includeEmbeddedObjects in ('true', 'True'):
                includeEmbeddedObjects = True
            else:
                includeEmbeddedObjects = False
            queryOptions['includeEmbeddedObjects'] = includeEmbeddedObjects

        includeContent = request.GET.get('includeContent')
        if includeContent and includeContent not in ('true', 'false', 'True', 'False'):
            raise exceptions.InvalidArgumentException(u"Invalid value for includeContent : [{includeContent}] received.".format(includeContent=includeContent).encode('utf-8'))
        else:
            if includeContent in ('true', 'True'):
                includeContent = True
            else:
                includeContent = False
            queryOptions['includeContent'] = includeContent

        includeProcessedContent = request.GET.get('includeProcessedContent')
        if includeProcessedContent and includeProcessedContent not in ('true', 'false', 'True', 'False'):
            raise exceptions.InvalidArgumentException(u"Invalid value for includeProcessedContent : [{includeProcessedContent}] received.".format(includeProcessedContent=includeProcessedContent).encode('utf-8'))
        else:
            if includeProcessedContent in ('true', 'True'):
                includeProcessedContent = True
            else:
                includeProcessedContent = False
            queryOptions['includeProcessedContent'] = includeProcessedContent

        includeRevisionStandards = request.GET.get('includeRevisionStandards')
        if includeRevisionStandards and includeRevisionStandards not in ('true', 'false', 'True', 'False'):
            raise exceptions.InvalidArgumentException(u"Invalid value for includeRevisionStandards : [{includeRevisionStandards}] received.".format(includeRevisionStandards=includeRevisionStandards).encode('utf-8'))
        else:
            if includeRevisionStandards in ('true', 'True'):
                includeRevisionStandards = True
            else:
                includeRevisionStandards = False
            queryOptions['includeRevisionStandards'] = includeRevisionStandards

        includeRevisionStandardGrades = request.GET.get('includeRevisionStandardGrades')
        if includeRevisionStandardGrades and includeRevisionStandardGrades not in ('true', 'false', 'True', 'False'):
            raise exceptions.InvalidArgumentException(u"Invalid value for includeRevisionStandardGrades : [{includeRevisionStandardGrades}] received.".format(includeRevisionStandardGrades=includeRevisionStandardGrades).encode('utf-8'))
        else:
            if includeRevisionStandardGrades in ('true', 'True'):
                includeRevisionStandardGrades = True
            else:
                includeRevisionStandardGrades = False
            queryOptions['includeRevisionStandardGrades'] = includeRevisionStandardGrades

        includeChildren = request.GET.get('includeChildren')
        if includeChildren and includeChildren not in ('true', 'false', 'True', 'False'):
            raise exceptions.InvalidArgumentException(u"Invalid value for includeChildren : [{includeChildren}] received.".format(includeChildren=includeChildren).encode('utf-8'))
        else:
            if includeChildren in ('true', 'True'):
                includeChildren = True
            else:
                includeChildren = False
            queryOptions['includeChildren'] = includeChildren

        includeGrandChildren = request.GET.get('includeGrandChildren')
        if includeGrandChildren and includeGrandChildren not in ('true', 'false', 'True', 'False'):
            raise exceptions.InvalidArgumentException(u"Invalid value for includeGrandChildren : [{includeGrandChildren}] received.".format(includeGrandChildren=includeGrandChildren).encode('utf-8'))
        else:
            if includeGrandChildren in ('true', 'True'):
                includeGrandChildren = True
            else:
                includeGrandChildren = False
            queryOptions['includeGrandChildren'] = includeGrandChildren

        includeBrowseTerms = request.GET.get('includeBrowseTerms')
        if includeBrowseTerms and includeBrowseTerms not in ('true', 'false', 'True', 'False'):
            raise exceptions.InvalidArgumentException(u"Invalid value for includeBrowseTerms : [{includeBrowseTerms}] received.".format(includeBrowseTerms=includeBrowseTerms).encode('utf-8'))
        else:
            if includeBrowseTerms in ('true', 'True'):
                includeBrowseTerms = True
            else:
                includeBrowseTerms = False
            queryOptions['includeBrowseTerms'] = includeBrowseTerms

        includeBrowseTermStandards = request.GET.get('includeBrowseTermStandards')
        if includeBrowseTermStandards and includeBrowseTermStandards not in ('true', 'false', 'True', 'False'):
            raise exceptions.InvalidArgumentException(u"Invalid value for includeBrowseTermStandards : [{includeBrowseTermStandards}] received.".format(includeBrowseTermStandards=includeBrowseTermStandards).encode('utf-8'))
        else:
            if includeBrowseTermStandards in ('true', 'True'):
                includeBrowseTermStandards = True
            else:
                includeBrowseTermStandards = False
            queryOptions['includeBrowseTermStandards'] = includeBrowseTermStandards

        includeBrowseTermStandardGrades = request.GET.get('includeBrowseTermStandardGrades')
        if includeBrowseTermStandardGrades and includeBrowseTermStandardGrades not in ('true', 'false', 'True', 'False'):
            raise exceptions.InvalidArgumentException(u"Invalid value for includeBrowseTermStandardGrades : [{includeBrowseTermStandardGrades}] received.".format(includeBrowseTermStandardGrades=includeBrowseTermStandardGrades).encode('utf-8'))
        else:
            if includeBrowseTermStandardGrades in ('true', 'True'):
                includeBrowseTermStandardGrades = True
            else:
                includeBrowseTermStandardGrades = False
            queryOptions['includeBrowseTermStandardGrades'] = includeBrowseTermStandardGrades

        includeTagTerms = request.GET.get('includeTagTerms')
        if includeTagTerms and includeTagTerms not in ('true', 'false', 'True', 'False'):
            raise exceptions.InvalidArgumentException(u"Invalid value for includeTagTerms : [{includeTagTerms}] received.".format(includeTagTerms=includeTagTerms).encode('utf-8'))
        else:
            if includeTagTerms in ('true', 'True'):
                includeTagTerms = True
            else:
                includeTagTerms = False
            queryOptions['includeTagTerms'] = includeTagTerms

        includeSearchTerms = request.GET.get('includeSearchTerms')
        if includeSearchTerms and includeSearchTerms not in ('true', 'false', 'True', 'False'):
            raise exceptions.InvalidArgumentException(u"Invalid value for includeSearchTerms : [{includeSearchTerms}] received.".format(includeSearchTerms=includeSearchTerms).encode('utf-8'))
        else:
            if includeSearchTerms in ('true', 'True'):
                includeSearchTerms = True
            else:
                includeSearchTerms = False
            queryOptions['includeSearchTerms'] = includeSearchTerms

        includeVocabularies = request.GET.get('includeVocabularies')
        if includeVocabularies and includeVocabularies not in ('true', 'false', 'True', 'False'):
            raise exceptions.InvalidArgumentException(u"Invalid value for includeVocabularies : [{includeVocabularies}] received.".format(includeVocabularies=includeVocabularies).encode('utf-8'))
        else:
            if includeVocabularies in ('true', 'True'):
                includeVocabularies = True
            else:
                includeVocabularies = False
            queryOptions['includeVocabularies'] = includeVocabularies

        return queryOptions

    def _extractAndDefaultQueryOptionsForFeaturedModalityTypeCountsGenerationFromDomainHandleOrEncodedID(self):
        queryOptions = {}

        conceptCollectionHandle = request.GET.get('conceptCollectionHandle')
        if conceptCollectionHandle is not None:
            if not conceptCollectionHandle or not isinstance(conceptCollectionHandle, basestring):
                raise exceptions.InvalidArgumentException(u"Invalid value for conceptCollectionHandle : [{conceptCollectionHandle}] received.".format(conceptCollectionHandle=conceptCollectionHandle).encode('utf-8'))
            conceptCollectionHandle = conceptCollectionHandle.lower()
            queryOptions['conceptCollectionHandle'] = conceptCollectionHandle

        collectionCreatorID = request.GET.get('collectionCreatorID')
        if collectionCreatorID is not None:
            try :
                collectionCreatorID=long(collectionCreatorID)
            except (ValueError, TypeError) as e:
                raise exceptions.InvalidArgumentException(u"Invalid value for collectionCreatorID : [{collectionCreatorID}] received.".format(collectionCreatorID=collectionCreatorID).encode('utf-8'))
            if collectionCreatorID <=0:
                raise exceptions.InvalidArgumentException(u"Invalid value for collectionCreatorID : [{collectionCreatorID}] received.".format(collectionCreatorID=collectionCreatorID).encode('utf-8'))
            queryOptions['collectionCreatorID'] = collectionCreatorID

        if (conceptCollectionHandle and not collectionCreatorID) or (not conceptCollectionHandle and collectionCreatorID):
            raise Exception((_(u"Invalid query parameters received. conceptCollectionHandle & collectionCreatorID should be either present or not present togeather." % nodeID)).encode("utf-8"))        

        considerModalitiesOfTypes = request.GET.get('considerModalitiesOfTypes', '')
        if not isinstance(considerModalitiesOfTypes, basestring):
            raise exceptions.InvalidArgumentException(u"Invalid value for considerModalitiesOfTypes : [{considerModalitiesOfTypes}] received.".format(considerModalitiesOfTypes=considerModalitiesOfTypes).encode('utf-8'))
        else:
            if considerModalitiesOfTypes:
                considerModalitiesOfTypes = considerModalitiesOfTypes.split(',')
            else:
                considerModalitiesOfTypes = []
            considerModalitiesOfTypes = list(set(considerModalitiesOfTypes))
            queryOptions['considerModalitiesOfTypes'] = considerModalitiesOfTypes

        considerModalitiesOwnedBy = request.GET.get('considerModalitiesOwnedBy')
        if considerModalitiesOwnedBy and considerModalitiesOwnedBy not in ('all', 'ALL', 'ck12', 'CK12', 'community', 'COMMUNITY'):
            raise exceptions.InvalidArgumentException(u"Invalid value for considerModalitiesOwnedBy : [{considerModalitiesOwnedBy}] received.".format(considerModalitiesOwnedBy=considerModalitiesOwnedBy).encode('utf-8'))
        else:
            if considerModalitiesOwnedBy in ('ck12', 'CK12'):
                considerModalitiesOwnedBy = 'CK12'
            elif considerModalitiesOwnedBy in ('community', 'COMMUNITY'):
                considerModalitiesOwnedBy = 'COMMUNITY'
            else:
                considerModalitiesOwnedBy = 'ALL'
            queryOptions['considerModalitiesOwnedBy'] = considerModalitiesOwnedBy

        return queryOptions

    def _extractAndDefaultQueryOptionsForFeaturedModalityTypeCountsGenerationFromCollectionHandle(self):
        queryOptions = {}

        considerModalitiesOfTypes = request.GET.get('considerModalitiesOfTypes', '')
        if not isinstance(considerModalitiesOfTypes, basestring):
            raise exceptions.InvalidArgumentException(u"Invalid value for considerModalitiesOfTypes : [{considerModalitiesOfTypes}] received.".format(considerModalitiesOfTypes=considerModalitiesOfTypes).encode('utf-8'))
        else:
            if considerModalitiesOfTypes:
                considerModalitiesOfTypes = considerModalitiesOfTypes.split(',')
            else:
                considerModalitiesOfTypes = []
            considerModalitiesOfTypes = list(set(considerModalitiesOfTypes))
            queryOptions['considerModalitiesOfTypes'] = considerModalitiesOfTypes

        includeCK12OwnedCounts = request.GET.get('includeCK12OwnedCounts')
        if includeCK12OwnedCounts and includeCK12OwnedCounts not in ('true', 'false', 'True', 'False'):
            raise exceptions.InvalidArgumentException(u"Invalid value for includeCK12OwnedCounts : [{includeCK12OwnedCounts}] received.".format(includeCK12OwnedCounts=includeCK12OwnedCounts).encode('utf-8'))
        else:
            if includeCK12OwnedCounts in ('true', 'True'):
                includeCK12OwnedCounts = True
            else:
                includeCK12OwnedCounts = False
            queryOptions['includeCK12OwnedCounts'] = includeCK12OwnedCounts

        includeCommunityOwnedCounts = request.GET.get('includeCommunityOwnedCounts')
        if includeCommunityOwnedCounts and includeCommunityOwnedCounts not in ('true', 'false', 'True', 'False'):
            raise exceptions.InvalidArgumentException(u"Invalid value for includeCommunityOwnedCounts : [{includeCommunityOwnedCounts}] received.".format(includeCommunityOwnedCounts=includeCommunityOwnedCounts).encode('utf-8'))
        else:
            if includeCommunityOwnedCounts in ('true', 'True'):
                includeCommunityOwnedCounts = True
            else:
                includeCommunityOwnedCounts = False
            queryOptions['includeCommunityOwnedCounts'] = includeCommunityOwnedCounts

        return queryOptions

    @dec2.responsify(argNames=['domainHandleOrEncodedID'])
    def getFeaturedModalitiesForDomainHandleOrEncodedID(self, domainHandleOrEncodedID):
        self._validateRequestMethod(('GET'))
        domainHandleOrEncodedID = self._validateAndProcessDomainHandleOrEncodedID(domainHandleOrEncodedID)
        memberDict = self._extractMemberDict()
        queryOptions = self._extractAndDefaultQueryOptionsForFeaturedModalitiesGenerationFromDomainHandleOrEncodedID()
        modalityDictList = self.businessLogic.getFeaturedModalitiesForDomainHandleOrEncodedID(domainHandleOrEncodedID, memberDict, queryOptions)
        responseDict = {'domainHandleOrEncodedID':domainHandleOrEncodedID, 'featuredModalities':modalityDictList}
        return responseDict

    @dec2.responsify(argNames=['domainHandleOrEncodedID'])
    def getFeaturedModalityTypeCountsForDomainHandleOrEncodedID(self, domainHandleOrEncodedID):
        self._validateRequestMethod(('GET'))
        domainHandleOrEncodedID = self._validateAndProcessDomainHandleOrEncodedID(domainHandleOrEncodedID)
        memberDict = self._extractMemberDict()
        queryOptions = self._extractAndDefaultQueryOptionsForFeaturedModalityTypeCountsGenerationFromDomainHandleOrEncodedID()
        modalityTypeCountsDict = self.businessLogic.getFeaturedModalityTypeCountsForDomainHandleOrEncodedID(domainHandleOrEncodedID, memberDict, queryOptions)
        responseDict = {'domainHandleOrEncodedID':domainHandleOrEncodedID, 'featuredModalityTypeCounts':modalityTypeCountsDict}
        return responseDict

    @dec2.responsify(argNames=['collectionHandle', 'collectionCreatorID'])
    def getFeaturedModalityTypeCountsForCollectionHandleAndCreatorID(self, collectionHandle=None, collectionCreatorID=None):
        self._validateRequestMethod(('GET'))
        memberDict = self._extractMemberDict()
        if collectionHandle is not None:
            collectionHandle = self._validateAndProcessCollectionHandle(collectionHandle)
            if collectionCreatorID is not None:
                collectionCreatorID = self._validateAndProcessCollectionCreatorID(collectionCreatorID)
            else:
                if memberDict.get('memberID'):
                    collectionCreatorID = memberDict.get('memberID')
                else:
                    collectionCreatorID = 3 #'ck12editor'
        else:
            collectionHandle = ''
            collectionCreatorID = 0

        queryOptions = self._extractAndDefaultQueryOptionsForFeaturedModalityTypeCountsGenerationFromCollectionHandle()
        modalityTypeCountsDict = self.businessLogic.getFeaturedModalityTypeCountsForCollectionHandleAndCreatorID(collectionHandle, collectionCreatorID, memberDict, queryOptions)
        responseDict = {'collectionHandle':collectionHandle, 'featuredModalityTypeCounts':modalityTypeCountsDict}
        return responseDict
