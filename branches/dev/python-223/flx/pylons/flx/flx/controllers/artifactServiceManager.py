import logging
import json
import base64

from pylons.controllers import WSGIController
from pylons import request, response, tmpl_context as c
from flx.logic.artifactBusinessManager import ArtifactBusinessLogic
from flx.controllers import user
from flx.controllers.common import ArtifactCache
from flx.model import api, exceptions, utils
from flx.controllers import decorators as dec1
from flx.lib.base import BaseController
from flx.util import decorators as dec2
from flx.model import meta
from flx.controllers.errorCodes import ErrorCodes
from flx.model import exceptions as ex
from flx.lib import helpers
from datetime import datetime
from logging import handlers
from pylons import config
log = logging.getLogger(__name__)
saveErrorsLog = logging.getLogger('save_errors_flx')

__controller__ = 'ArtifactServiceController'

class ArtifactServiceController(BaseController):

    def __init__(self):
        self.businessLogic = ArtifactBusinessLogic()

    def _validateRequestMethod(self, validMethods):
        if request.method not in validMethods:
            raise exceptions.InvalidHTTPMethodException(u"HTTPMethod : [{httpMethod}] is not supported for this URL : [{URL}]".format(httpMethod=request.method, URL=request.path).encode('utf-8'))

    def _validateAndProcessArtifactRevisionID(self, artifactRevisionID):
        try :
            artifactRevisionID=long(artifactRevisionID)
        except (ValueError, TypeError) as e:
            raise exceptions.InvalidArgumentException(u"Invalid value for artifactRevisionID : [{artifactRevisionID}] received.".format(artifactRevisionID=artifactRevisionID).encode('utf-8'))
        if artifactRevisionID <=0:
            raise exceptions.InvalidArgumentException(u"Invalid value for artifactRevisionID : [{artifactRevisionID}] received.".format(artifactRevisionID=artifactRevisionID).encode('utf-8'))
        return artifactRevisionID

    def _validateAndProcessArtifactID(self, artifactID):
        try :
            artifactID=long(artifactID)
        except (ValueError, TypeError) as e:
            raise exceptions.InvalidArgumentException(u"Invalid value for artifactID : [{artifactID}] received.".format(artifactID=artifactID).encode('utf-8'))
        if artifactID <=0:
            raise exceptions.InvalidArgumentException(u"Invalid value for artifactID : [{artifactID}] received.".format(artifactID=artifactID).encode('utf-8'))
        return artifactID

    def _validateAndProcessArtifactType(self, artifactType):
        if not artifactType or not isinstance(artifactType, basestring):
            raise exceptions.InvalidArgumentException(u"Invalid artifactType : [{artifactType}] is received.".format(artifactType=artifactType).encode('utf-8'))
        return artifactType

    def _validateAndProcessArtifactHandle(self, artifactHandle):
        if not artifactHandle or not isinstance(artifactHandle, basestring):
            raise exceptions.InvalidArgumentException(u"Invalid artifactHandle : [{artifactHandle}] is received.".format(artifactHandle=artifactHandle).encode('utf-8'))
        return artifactHandle

    def _validateAndProcessArtifactCreator(self, artifactCreator):
        if artifactCreator is not None:
            if not artifactCreator or not isinstance(artifactCreator, basestring):
                raise exceptions.InvalidArgumentException(u"Invalid artifactCreator : [{artifactCreator}] is received.".format(artifactCreator=artifactCreator).encode('utf-8'))
        return artifactCreator

    def _extractAndDefaultArtifactCreator(self):
        artifactCreator = user.getCurrentUser(anonymousOkay=False, autoLogin=True, txSession=meta.Session, throwbackException=True)
        if not artifactCreator:
            artifactCreator = 'ck12editor'
        else:
            artifactCreator = artifactCreator.login
        return artifactCreator

    def _validateAndProcessArtifactRevisionNO(self, artifactRevisionNO):
        if artifactRevisionNO != 0:
            try :
                artifactRevisionNO=long(artifactRevisionNO)
            except (ValueError, TypeError) as e:
                raise exceptions.InvalidArgumentException(u"Invalid value for artifactRevisionNO : [{artifactRevisionNO}] received.".format(artifactRevisionNO=artifactRevisionNO).encode('utf-8'))
            if artifactRevisionNO <= 0:
                raise exceptions.InvalidArgumentException(u"Invalid value for artifactRevisionNO : [{artifactRevisionNO}] received.".format(artifactRevisionNO=artifactRevisionNO).encode('utf-8'))
        return artifactRevisionNO

    def _validateAndProcessArtifactDescendantIdentifier(self, artifactDescendantIdentifier):
        if artifactDescendantIdentifier is not None:
            if not artifactDescendantIdentifier or not isinstance(artifactDescendantIdentifier, basestring):
                raise exceptions.InvalidArgumentException(u"Invalid artifactDescendantIdentifier : [{artifactDescendantIdentifier}] is received.".format(artifactDescendantIdentifier=artifactDescendantIdentifier).encode('utf-8'))

            artifactDescendantIdentifierParts = artifactDescendantIdentifier.split('.')
            artifactDescendantIdentifier = []
            for artifactDescendantIdentifierPart in artifactDescendantIdentifierParts:
                try :
                    artifactDescendantIdentifierPart=int(artifactDescendantIdentifierPart)
                except (ValueError, TypeError) as e:
                    raise exceptions.InvalidArgumentException(u"Invalid artifactDescendantIdentifier : [{artifactDescendantIdentifier}] is received.".format(artifactDescendantIdentifier=artifactDescendantIdentifier).encode('utf-8'))
                artifactDescendantIdentifier.append(artifactDescendantIdentifierPart)

            while 0 in artifactDescendantIdentifier and artifactDescendantIdentifier.index(0) == 0:
                artifactDescendantIdentifier = artifactDescendantIdentifier[1:]
            artifactDescendantIdentifier = list(reversed(artifactDescendantIdentifier))
            while 0 in artifactDescendantIdentifier and artifactDescendantIdentifier.index(0) == 0:
                artifactDescendantIdentifier = artifactDescendantIdentifier[1:]

            artifactDescendantIdentifier = list(reversed(artifactDescendantIdentifier))
        return artifactDescendantIdentifier

    def _extractAndDefaultQueryOptionsForArtifactGeneration(self):
        queryOptions = {}

        returnDraftIfDraftExists = request.GET.get('returnDraftIfDraftExists')
        if returnDraftIfDraftExists and returnDraftIfDraftExists not in ('true', 'false', 'True', 'False'):
            raise exceptions.InvalidArgumentException(u"Invalid value for returnDraftIfDraftExists : [{returnDraftIfDraftExists}] received.".format(returnDraftIfDraftExists=returnDraftIfDraftExists).encode('utf-8'))
        else:
            if returnDraftIfDraftExists in ('true', 'True'):
                returnDraftIfDraftExists = True
            else:
                returnDraftIfDraftExists = False
            queryOptions['returnDraftIfDraftExists'] = returnDraftIfDraftExists

        includeDraftInfo = request.GET.get('includeDraftInfo')
        if includeDraftInfo and includeDraftInfo not in ('true', 'false', 'True', 'False'):
            raise exceptions.InvalidArgumentException(u"Invalid value for includeDraftInfo : [{includeDraftInfo}] received.".format(includeDraftInfo=includeDraftInfo).encode('utf-8'))
        else:
            if includeDraftInfo in ('true', 'True'):
                includeDraftInfo = True
            else:
                includeDraftInfo = False
            queryOptions['includeDraftInfo'] = includeDraftInfo

        includeChildrenDraftInfos = request.GET.get('includeChildrenDraftInfos')
        if includeChildrenDraftInfos and includeChildrenDraftInfos not in ('true', 'false', 'True', 'False'):
            raise exceptions.InvalidArgumentException(u"Invalid value for includeChildrenDraftInfos : [{includeChildrenDraftInfos}] received.".format(includeChildrenDraftInfos=includeChildrenDraftInfos).encode('utf-8'))
        else:
            if includeChildrenDraftInfos in ('true', 'True'):
                includeChildrenDraftInfos = True
            else:
                includeChildrenDraftInfos = False
            queryOptions['includeChildrenDraftInfos'] = includeChildrenDraftInfos

        includeLibraryInfos = request.GET.get('includeLibraryInfos')
        if includeLibraryInfos and includeLibraryInfos not in ('true', 'false', 'True', 'False'):
            raise exceptions.InvalidArgumentException(u"Invalid value for includeLibraryInfos : [{includeLibraryInfos}] received.".format(includeLibraryInfos=includeLibraryInfos).encode('utf-8'))
        else:
            if includeLibraryInfos in ('true', 'True'):
                includeLibraryInfos = True
            else:
                includeLibraryInfos = False
            queryOptions['includeLibraryInfos'] = includeLibraryInfos

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

        includeDomainCollectionContexts = request.GET.get('includeDomainCollectionContexts')
        if includeDomainCollectionContexts and includeDomainCollectionContexts not in ('true', 'false', 'True', 'False'):
            raise exceptions.InvalidArgumentException(u"Invalid value for includeDomainCollectionContexts : [{includeDomainCollectionContexts}] received.".format(includeDomainCollectionContexts=includeDomainCollectionContexts).encode('utf-8'))
        else:
            if includeDomainCollectionContexts in ('true', 'True'):
                includeDomainCollectionContexts = True
            else:
                includeDomainCollectionContexts = False
            queryOptions['includeDomainCollectionContexts'] = includeDomainCollectionContexts

        return queryOptions

    def _extractAndDefaultQueryOptionsForArtifactFeedbacksGeneration(self):
        queryOptions = {}

        considerFeedbacksWithCommentOnly = request.GET.get('considerFeedbacksWithCommentOnly')
        if considerFeedbacksWithCommentOnly and considerFeedbacksWithCommentOnly not in ('true', 'false', 'True', 'False'):
            raise exceptions.InvalidArgumentException(u"Invalid value for considerFeedbacksWithCommentOnly : [{considerFeedbacksWithCommentOnly}] received.".format(considerFeedbacksWithCommentOnly=considerFeedbacksWithCommentOnly).encode('utf-8'))
        else:
            if considerFeedbacksWithCommentOnly in ('true', 'True'):
                considerFeedbacksWithCommentOnly = True
            else:
                considerFeedbacksWithCommentOnly = False
            queryOptions['considerFeedbacksWithCommentOnly'] = considerFeedbacksWithCommentOnly

        includeHelpfuls = request.GET.get('includeHelpfuls')
        if includeHelpfuls and includeHelpfuls not in ('true', 'false', 'True', 'False'):
            raise exceptions.InvalidArgumentException(u"Invalid value for includeHelpfuls : [{includeHelpfuls}] received.".format(includeHelpfuls=includeHelpfuls).encode('utf-8'))
        else:
            if includeHelpfuls in ('true', 'True'):
                includeHelpfuls = True
            else:
                includeHelpfuls = False
            queryOptions['includeHelpfuls'] = includeHelpfuls

        includeAbuseReports = request.GET.get('includeAbuseReports')
        if includeAbuseReports and includeAbuseReports not in ('true', 'false', 'True', 'False'):
            raise exceptions.InvalidArgumentException(u"Invalid value for includeAbuseReports : [{includeAbuseReports}] received.".format(includeAbuseReports=includeAbuseReports).encode('utf-8'))
        else:
            if includeAbuseReports in ('true', 'True'):
                includeAbuseReports = True
            else:
                includeAbuseReports = False
            queryOptions['includeAbuseReports'] = includeAbuseReports

        includeReviews = request.GET.get('includeReviews')
        if includeReviews and includeReviews not in ('true', 'false', 'True', 'False'):
            raise exceptions.InvalidArgumentException(u"Invalid value for includeReviews : [{includeReviews}] received.".format(includeReviews=includeReviews).encode('utf-8'))
        else:
            if includeReviews in ('true', 'True'):
                includeReviews = True
            else:
                includeReviews = False
            queryOptions['includeReviews'] = includeReviews

        includeReviewAbuseReports = request.GET.get('includeReviewAbuseReports')
        if includeReviewAbuseReports and includeReviewAbuseReports not in ('true', 'false', 'True', 'False'):
            raise exceptions.InvalidArgumentException(u"Invalid value for includeReviewAbuseReports : [{includeReviewAbuseReports}] received.".format(includeReviewAbuseReports=includeReviewAbuseReports).encode('utf-8'))
        else:
            if includeReviewAbuseReports in ('true', 'True'):
                includeReviewAbuseReports = True
            else:
                includeReviewAbuseReports = False
            queryOptions['includeReviewAbuseReports'] = includeReviewAbuseReports

        offset = request.GET.get('offset', 0)
        try :
            offset=long(offset)
        except (ValueError, TypeError) as e:
            raise exceptions.InvalidArgumentException(u"Invalid value for offset : [{offset}] received.".format(offset=offset).encode('utf-8'))
        if offset<0:
            raise exceptions.InvalidArgumentException(u"Invalid value for offset : [{offset}] received.".format(offset=offset).encode('utf-8'))
        queryOptions['offset'] = offset

        limit = request.GET.get('limit', 0)
        try :
            limit=long(limit)
        except (ValueError, TypeError) as e:
            raise exceptions.InvalidArgumentException(u"Invalid value for limit : [{limit}] received.".format(limit=limit).encode('utf-8'))
        if limit <0:
            raise exceptions.InvalidArgumentException(u"Invalid value for limit : [{limit}] received.".format(limit=limit).encode('utf-8'))
        queryOptions['limit'] = limit

        return queryOptions


    @dec2.responsify(argNames=['artifactRevisionID', 'artifactDescendantIdentifier'])
    def getArtifactByRevisionIDAndDescendantIdentifier(self, artifactRevisionID, artifactDescendantIdentifier=None):
        self._validateRequestMethod(('GET'))
        artifactRevisionID = self._validateAndProcessArtifactRevisionID(artifactRevisionID)
        artifactDescendantIdentifier = self._validateAndProcessArtifactDescendantIdentifier(artifactDescendantIdentifier)
        queryOptions = self._extractAndDefaultQueryOptionsForArtifactGeneration()
        artifactDict = self.businessLogic.getArtifactByRevisionIDAndDescendantIdentifier(artifactRevisionID, artifactDescendantIdentifier, queryOptions)
        responseDict = {'artifact':artifactDict}
        return responseDict

    @dec2.responsify(argNames=['artifactID', 'artifactRevisionNO', 'artifactDescendantIdentifier'])
    def getArtifactByIDRevisionNOAndDescendantIdentifier(self, artifactID, artifactRevisionNO=0, artifactDescendantIdentifier=None):
        self._validateRequestMethod(('GET'))
        artifactID = self._validateAndProcessArtifactID(artifactID)
        artifactRevisionNO = self._validateAndProcessArtifactRevisionNO(artifactRevisionNO)
        artifactDescendantIdentifier = self._validateAndProcessArtifactDescendantIdentifier(artifactDescendantIdentifier)
        queryOptions = self._extractAndDefaultQueryOptionsForArtifactGeneration()
        artifactDict = self.businessLogic.getArtifactByIDRevisionNOAndDescendantIdentifier(artifactID, artifactRevisionNO, artifactDescendantIdentifier, queryOptions)
        responseDict = {'artifact':artifactDict}
        return responseDict

    @dec2.responsify(argNames=['artifactType', 'artifactHandle', 'artifactCreator', 'artifactRevisionNO', 'artifactDescendantIdentifier'])
    def getArtifactByTypeHandleCreatorRevisionNOAndDescendantIdentifier(self, artifactType, artifactHandle, artifactCreator=None, artifactRevisionNO=0, artifactDescendantIdentifier=None):
        self._validateRequestMethod(('GET'))
        artifactType = self._validateAndProcessArtifactType(artifactType)
        artifactHandle = self._validateAndProcessArtifactHandle(artifactHandle)
        artifactCreator = self._validateAndProcessArtifactCreator(artifactCreator)
        if artifactCreator is None:
            artifactCreator = self._extractAndDefaultArtifactCreator()
        artifactRevisionNO = self._validateAndProcessArtifactRevisionNO(artifactRevisionNO)
        artifactDescendantIdentifier = self._validateAndProcessArtifactDescendantIdentifier(artifactDescendantIdentifier)
        queryOptions = self._extractAndDefaultQueryOptionsForArtifactGeneration()
        artifactDict = self.businessLogic.getArtifactByTypeHandleCreatorRevisionNOAndDescendantIdentifier(artifactType, artifactHandle, artifactCreator, artifactRevisionNO, artifactDescendantIdentifier, queryOptions)
        responseDict = {'artifact':artifactDict}
        return responseDict


    @dec2.responsify(argNames=['artifactRevisionID', 'artifactDescendantIdentifier'])
    def getArtifactFeedbacksByRevisionIDAndDescendantIdentifier(self, artifactRevisionID, artifactDescendantIdentifier=None):
        self._validateRequestMethod(('GET'))
        artifactRevisionID = self._validateAndProcessArtifactRevisionID(artifactRevisionID)
        artifactDescendantIdentifier = self._validateAndProcessArtifactDescendantIdentifier(artifactDescendantIdentifier)
        queryOptions = self._extractAndDefaultQueryOptionsForArtifactFeedbacksGeneration()
        artifactFeedbackDictList = self.businessLogic.getArtifactFeedbacksByRevisionIDAndDescendantIdentifier(artifactRevisionID, artifactDescendantIdentifier, queryOptions)
        responseDict = {'artifactFeedbacks':artifactFeedbackDictList}
        return responseDict

    @dec2.responsify(argNames=['artifactID', 'artifactRevisionNO', 'artifactDescendantIdentifier'])
    def getArtifactFeedbacksByIDRevisionNOAndDescendantIdentifier(self, artifactID, artifactRevisionNO=0, artifactDescendantIdentifier=None):
        self._validateRequestMethod(('GET'))
        artifactID = self._validateAndProcessArtifactID(artifactID)
        artifactRevisionNO = self._validateAndProcessArtifactRevisionNO(artifactRevisionNO)
        artifactDescendantIdentifier = self._validateAndProcessArtifactDescendantIdentifier(artifactDescendantIdentifier)
        queryOptions = self._extractAndDefaultQueryOptionsForArtifactFeedbacksGeneration()
        artifactFeedbackDictList = self.businessLogic.getArtifactFeedbacksByIDRevisionNOAndDescendantIdentifier(artifactID, artifactRevisionNO, artifactDescendantIdentifier, queryOptions)
        responseDict = {'artifactFeedbacks':artifactFeedbackDictList}
        return responseDict

    @dec2.responsify(argNames=['artifactType', 'artifactHandle', 'artifactCreator', 'artifactRevisionNO', 'artifactDescendantIdentifier'])
    def getArtifactFeedbacksByTypeHandleCreatorRevisionNOAndDescendantIdentifier(self, artifactType, artifactHandle, artifactCreator=None, artifactRevisionNO=0, artifactDescendantIdentifier=None):
        self._validateRequestMethod(('GET'))
        artifactType = self._validateAndProcessArtifactType(artifactType)
        artifactHandle = self._validateAndProcessArtifactHandle(artifactHandle)
        artifactCreator = self._validateAndProcessArtifactCreator(artifactCreator)
        if artifactCreator is None:
            artifactCreator = self._extractAndDefaultArtifactCreator()
        artifactRevisionNO = self._validateAndProcessArtifactRevisionNO(artifactRevisionNO)
        artifactDescendantIdentifier = self._validateAndProcessArtifactDescendantIdentifier(artifactDescendantIdentifier)
        queryOptions = self._extractAndDefaultQueryOptionsForArtifactFeedbacksGeneration()
        artifactFeedbackDictList = self.businessLogic.getArtifactFeedbacksByTypeHandleCreatorRevisionNOAndDescendantIdentifier(artifactType, artifactHandle, artifactCreator, artifactRevisionNO, artifactDescendantIdentifier, queryOptions)
        responseDict = {'artifactFeedbacks':artifactFeedbackDictList}
        return responseDict


    def _authorize(self, memberDict, operation, artifactDict=None, artifactDraftDict=None):
        memberID = memberDict.get('memberID')
        email = memberDict.get('memberEmail')
        tx = utils.transaction(self.getFuncName())
        with tx as session:
            if artifactDict:
                creatorID = artifactDict.get('creatorID')
                artifactID = artifactDict.get('id', artifactDict.get('artifactID', None))
                artifactData = artifactDict
            elif artifactDraftDict:
                creatorID = artifactDraftDict.get('creatorID')
                artifactRevisionID = artifactDraftDict.get('artifactRevisionID')
                artifactRevision = api._getArtifactRevisionByID(session, artifactRevisionID)
                artifactID = artifactRevision.artifactID
                artifactData = artifactDraftDict
            else:
                raise exceptions.InvalidArgumentException(u'No artifact info.'.encode('utf-8'))
            if not artifactID:
                raise exceptions.InvalidArgumentException(u'No artifact id for [{artifact}].'.format(artifact=artifactData).encode('utf-8'))
            api._authorizeBookEditing(session, memberID, email, operation, creatorID, artifactID)
            return creatorID

    def insertAuditTrail(self, action, assigneeID, creatorID, artifactRevisionID, artifactID=None):
        #
        #  Log the group editing actions.
        #
        from datetime import datetime
        from flx.model.audit_trail import AuditTrail

        log.debug('insertAuditTrail: action[%s]' % action)
        log.debug('insertAuditTrail: assigneeID[%s]' % assigneeID)
        log.debug('insertAuditTrail: creatorID[%s]' % creatorID)
        log.debug('insertAuditTrail: artifactRevisionID[%s]' % artifactRevisionID)
        log.debug('insertAuditTrail: artifactID[%s]' % artifactID)
        auditTrailDict = {
            'auditType': 'group_editing',
            'action': action,
            'memberID': assigneeID,
            'assigneeID': assigneeID,
            'creatorID': creatorID,
            'artifactRevisionID': artifactRevisionID,
            'artifactID': artifactID,
            'creationTime': datetime.utcnow()
        }
        try:
            AuditTrail().insertTrail(collectionName='artifacts', data=auditTrailDict)
            log.debug('insertAuditTrail: inserted')
        except Exception as e:
            log.error('insertAuditTrail: There was an issue logging the audit trail: %s' % e)

    @dec2.responsify()
    @dec1.checkAuth(throwbackException=True)
    def createArtifactDraft(self, member):
        if request.method != 'POST':
            raise exceptions.InvalidHTTPMethodException(u"HTTPMethod : [{httpMethod}] is not supported for this URL : [{URL}]".format(httpMethod=request.method, URL=request.path_qs).encode('utf-8'))

        if request.content_type not in ['application/json', 'text/plain']:
            raise exceptions.InvalidContentTypeException(u"contentType : [{contentType}] content in the request body is not supported.".format(contentType=request.content_type).encode('utf-8'))

        #I guess member is already authenticated by this step using his login cookie in the request
        #And we would have a proper memberID, memberEmail, memberLogin, memberDefaultLogin
        memberDict = {}
        memberDict['memberID'] = memberID = member.id
        memberDict['memberEmail'] = member.email
        memberDict['memberLogin'] = member.login
        memberDict['memberDefaultLogin'] = member.defaultLogin

        #validate artifactData and other details in it
        artifactData = request.body
        if request.content_type == 'text/plain':
            try:
                artifactData = base64.b64decode(artifactData)
            except TypeError as te:
                raise exceptions.InvalidContentTypeException(u"Invalid encoded data received in the request parameter.".format(artifact=artifactData).encode('utf-8'))

        try:
            artifactDict = json.loads(artifactData)
        except (ValueError, TypeError) as e:
            raise exceptions.InvalidArgumentException(u"Invalid artifact : [{artifact}] received in the request parameters. A valid JSON is expected.".format(artifact=artifactData).encode('utf-8'))
        log.debug('createArtifactDraft: artifactDict[%s]' % artifactDict)

        artifactDraftType = artifactDict.get('artifactType')
        if not artifactDraftType or not isinstance(artifactDraftType, basestring):
            raise exceptions.InvalidArgumentException(u"Invalid artifactType : [{artifactDraftType}] is received.".format(artifactDraftType=artifactDraftType).encode('utf-8'))

        artifactDraftHandle = artifactDict.get('handle')
        if artifactDraftHandle is None:
            artifactTitle = artifactDict.get('title')
            if not artifactTitle or not isinstance(artifactTitle, basestring):
                raise exceptions.InvalidArgumentException(u"Invalid artifactTitle : [{artifactTitle}] is received. artifactTitle is mandatory if artifactHandle is not passed.".format(artifactTitle=artifactTitle).encode('utf-8'))
        elif not artifactDraftHandle or not isinstance(artifactDraftHandle, basestring):
            raise exceptions.InvalidArgumentException(u"Invalid handle : [{artifactDraftHandle}] is received.".format(artifactDraftHandle=artifactDraftHandle).encode('utf-8'))

        artifactDraftArtifactRevisionID = artifactDict.get('artifactRevisionID')
        if artifactDraftArtifactRevisionID is not None:
            try :
                artifactDraftArtifactRevisionID=long(artifactDraftArtifactRevisionID)
            except (ValueError, TypeError) as e:
                raise exceptions.InvalidArgumentException(u"Invalid value for artifactRevisionID : [{artifactDraftArtifactRevisionID}] received.".format(artifactDraftArtifactRevisionID=artifactDraftArtifactRevisionID).encode('utf-8'))
            if artifactDraftArtifactRevisionID <=0:
                raise exceptions.InvalidArgumentException(u"Invalid value for artifactRevisionID : [{artifactDraftArtifactRevisionID}] received.".format(artifactDraftArtifactRevisionID=artifactDraftArtifactRevisionID).encode('utf-8'))
            artifactDict['artifactRevisionID'] = artifactDraftArtifactRevisionID

        creatorID = self._authorize(memberDict, operation=api.BOOK_EDITING_CREATE, artifactDict=artifactDict)
        if member.id == creatorID:
            action = 'self-create-draft'
        else:
            action = 'group-create-draft'
            creator = api.getMemberByID(id=creatorID)
            memberDict['memberID'] = creator.id
            memberDict['memberEmail'] = creator.email
            memberDict['memberLogin'] = creator.login
            memberDict['memberDefaultLogin'] = creator.defaultLogin

        artifactDraftDict = self.businessLogic.createArtifactDraft(memberDict, artifactDict)
        responseDict = {'artifactDraft':artifactDraftDict}
        try:
            #
            #  Audit Trail.
            #
            self.insertAuditTrail(action, memberID, creatorID, artifactDict['artifactRevisionID'], artifactID=artifactDict['id'])
        except Exception as e:
            log.info('createArtifactDraft: unable to insert audit trail: %s' % str(e))
        return responseDict

    @dec2.responsify(argNames=['artifactDraftID'])
    @dec1.checkAuth(argNames=['artifactDraftID'], throwbackException=True)
    def updateArtifactDraftByID(self, member, artifactDraftID):
        if request.method != 'POST':
            raise exceptions.InvalidHTTPMethodException(u"HTTPMethod : [{httpMethod}] is not supported for this URL : [{URL}]".format(httpMethod=request.method, URL=request.path_qs).encode('utf-8'))

        if request.content_type not in ['application/json', 'text/plain']:
            raise exceptions.InvalidContentTypeException(u"contentType : [{contentType}] content in the request body is not supported.".format(contentType=request.content_type).encode('utf-8'))

        #I guess member is already authenticated by this step using his login cookie in the request
        #And we would have a proper memberID, memberEmail, memberLogin, memberDefaultLogin
        memberDict = {}
        memberDict['memberID'] = memberID = member.id
        memberDict['memberEmail'] = member.email
        memberDict['memberLogin'] = member.login
        memberDict['memberDefaultLogin'] = member.defaultLogin

        try :
            artifactDraftID=long(artifactDraftID)
        except (ValueError, TypeError) as e:
            raise exceptions.InvalidArgumentException(u"Invalid value for artifactDraftID : [{artifactDraftID}] received.".format(artifactDraftID=artifactDraftID).encode('utf-8'))
        if artifactDraftID <=0:
            raise exceptions.InvalidArgumentException(u"Invalid value for artifactDraftID : [{artifactDraftID}] received.".format(artifactDraftID=artifactDraftID).encode('utf-8'))

        #validate artifactData and other details in it
        artifactData = request.body
        if request.content_type == 'text/plain':
            try:
                artifactData = base64.b64decode(artifactData)
            except TypeError as te:
                raise exceptions.InvalidContentTypeException(u"Invalid encoded data received in the request parameter.".format(artifact=artifactData).encode('utf-8'))

        try:
            artifactDict = json.loads(artifactData)
        except (ValueError, TypeError) as e:
            raise exceptions.InvalidArgumentException(u"Invalid artifact : [{artifact}] received in the request parameters. A valid JSON is expected.".format(artifact=artifactData).encode('utf-8'))

        artifactDraftType = artifactDict.get('artifactType')
        if not artifactDraftType or not isinstance(artifactDraftType, basestring):
            raise exceptions.InvalidArgumentException(u"Invalid artifactType : [{artifactDraftType}] is received.".format(artifactDraftType=artifactDraftType).encode('utf-8'))

        artifactDraftHandle = artifactDict.get('handle')
        if artifactDraftHandle is None:
            artifactTitle = artifactDict.get('title')
            if not artifactTitle or not isinstance(artifactTitle, basestring):
                raise exceptions.InvalidArgumentException(u"Invalid artifactTitle : [{artifactTitle}] is received. artifactTitle is mandatory if artifactHandle is not passed.".format(artifactTitle=artifactTitle).encode('utf-8'))
        elif not artifactDraftHandle or not isinstance(artifactDraftHandle, basestring):
            raise exceptions.InvalidArgumentException(u"Invalid handle : [{artifactDraftHandle}] is received.".format(artifactDraftHandle=artifactDraftHandle).encode('utf-8'))

        artifactDraftArtifactRevisionID = artifactDict.get('artifactRevisionID')
        if artifactDraftArtifactRevisionID is not None:
            try :
                artifactDraftArtifactRevisionID=long(artifactDraftArtifactRevisionID)
            except (ValueError, TypeError) as e:
                raise exceptions.InvalidArgumentException(u"Invalid value for artifactRevisionID : [{artifactDraftArtifactRevisionID}] received.".format(artifactDraftArtifactRevisionID=artifactDraftArtifactRevisionID).encode('utf-8'))
            if artifactDraftArtifactRevisionID <=0:
                raise exceptions.InvalidArgumentException(u"Invalid value for artifactRevisionID : [{artifactDraftArtifactRevisionID}] received.".format(artifactDraftArtifactRevisionID=artifactDraftArtifactRevisionID).encode('utf-8'))
            artifactDict['artifactRevisionID'] = artifactDraftArtifactRevisionID

        creatorID = self._authorize(memberDict, operation=api.BOOK_EDITING_UPDATE, artifactDict=artifactDict)
        if member.id == creatorID:
            action = 'self-update-draft'
        else:
            action = 'group-update-draft'
            creator = api.getMemberByID(id=creatorID)
            memberDict['memberID'] = creator.id
            memberDict['memberEmail'] = creator.email
            memberDict['memberLogin'] = creator.login
            memberDict['memberDefaultLogin'] = creator.defaultLogin
        #
        #  Check and see if it's being finalized.
        #
        api.checkBookFinalizationLock(artifactDict['id'])

        artifactDraftDict = self.businessLogic.updateArtifactDraftByID(memberDict, artifactDraftID, artifactDict)
        responseDict ={'artifactDraft':artifactDraftDict}
        try:
            #
            #  Audit Trail.
            #
            self.insertAuditTrail(action, memberID, creatorID, artifactDict['artifactRevisionID'], artifactID=artifactDict['id'])
        except Exception as e:
            log.info('updateArtifactDraft: unable to insert audit trail: %s' % str(e))
        return responseDict

    @dec2.responsify(argNames=['artifactDraftID'])
    @dec1.checkAuth(argNames=['artifactDraftID'], throwbackException=True)
    def deleteArtifactDraftByID(self, member, artifactDraftID):
        if request.method != 'DELETE':
            raise exceptions.InvalidHTTPMethodException(u"HTTPMethod : [{httpMethod}] is not supported for this URL : [{URL}]".format(httpMethod=request.method, URL=request.path_qs).encode('utf-8'))

        #I guess member is already authenticated by this step using his login cookie in the request
        #And we would have a proper memberID, memberEmail, memberLogin, memberDefaultLogin
        memberDict = {}
        memberDict['memberID'] = memberID = member.id
        memberDict['memberEmail'] = member.email
        memberDict['memberLogin'] = member.login
        memberDict['memberDefaultLogin'] = member.defaultLogin

        try :
            artifactDraftID=long(artifactDraftID)
        except (ValueError, TypeError) as e:
            raise exceptions.InvalidArgumentException(u"Invalid value for artifactDraftID : [{artifactDraftID}] received.".format(artifactDraftID=artifactDraftID).encode('utf-8'))
        if artifactDraftID <=0:
            raise exceptions.InvalidArgumentException(u"Invalid value for artifactDraftID : [{artifactDraftID}] received.".format(artifactDraftID=artifactDraftID).encode('utf-8'))

        artifactDraftDict = self.businessLogic.getArtifactDraftByID(memberDict, artifactDraftID)
        creatorID = self._authorize(memberDict, operation=api.BOOK_EDITING_DELETE, artifactDraftDict=artifactDraftDict)
        if memberID == creatorID:
            action = 'self-update-draft'
        else:
            action = 'group-update-draft'
            creator = api.getMemberByID(id=creatorID)
            memberDict['memberID'] = creator.id
            memberDict['memberEmail'] = creator.email
            memberDict['memberLogin'] = creator.login
            memberDict['memberDefaultLogin'] = creator.defaultLogin

        artifactDraftDict = self.businessLogic.deleteArtifactDraftByID(memberDict, artifactDraftID)
        responseDict = {'artifactDraft':artifactDraftDict}
        try:
            #
            #  Audit Trail.
            #
            self.insertAuditTrail(action, memberID, memberID, artifactDraftDict['artifactRevisionID'])
        except Exception as e:
            log.info('deleteeArtifactDraft: unable to insert audit trail: %s' % str(e))
        return responseDict

    @dec2.responsify(argNames=['artifactDraftType', 'artifactDraftHandle'])
    @dec1.checkAuth(argNames=['artifactDraftType', 'artifactDraftHandle'], throwbackException=True)
    def getArtifactDraftByTypeAndHandle(self, member, artifactDraftType, artifactDraftHandle):
        if request.method != 'GET':
            raise exceptions.InvalidHTTPMethodException(u"HTTPMethod : [{httpMethod}] is not supported for this URL : [{URL}]".format(httpMethod=request.method, URL=request.path_qs).encode('utf-8'))

        #I guess member is already authenticated by this step using his login cookie in the request
        #And we would have a proper memberID, memberEmail, memberLogin, memberDefaultLogin
        memberDict = {}
        memberDict['memberID'] = member.id
        memberDict['memberEmail'] = member.email
        memberDict['memberLogin'] = member.login
        memberDict['memberDefaultLogin'] = member.defaultLogin

        if not artifactDraftType or not isinstance(artifactDraftType, basestring):
            raise exceptions.InvalidArgumentException(u"Invalid artifactDraftType : [{artifactDraftType}] is received.".format(artifactDraftType=artifactDraftType).encode('utf-8'))

        if not artifactDraftHandle or not isinstance(artifactDraftHandle, basestring):
            raise exceptions.InvalidArgumentException(u"Invalid artifactDraftHandle : [{artifactDraftHandle}] is received.".format(artifactDraftHandle=artifactDraftHandle).encode('utf-8'))

        artifactDraftDict = self.businessLogic.getArtifactDraftByTypeAndHandle(memberDict, artifactDraftType, artifactDraftHandle)
        responseDict = {'artifactDraft': artifactDraftDict}
        return responseDict

    @dec2.responsify(argNames=['artifactDraftArtifactRevisionID'])
    @dec1.checkAuth(argNames=['artifactDraftArtifactRevisionID'], throwbackException=True)
    def getArtifactDraftByArtifactRevisionID(self, member, artifactDraftArtifactRevisionID):
        if request.method != 'GET':
            raise exceptions.InvalidHTTPMethodException(u"HTTPMethod : [{httpMethod}] is not supported for this URL : [{URL}]".format(httpMethod=request.method, URL=request.path_qs).encode('utf-8'))

        #I guess member is already authenticated by this step using his login cookie in the request
        #And we would have a proper memberID, memberEmail, memberLogin, memberDefaultLogin
        memberDict = {}
        memberDict['memberID'] = member.id
        memberDict['memberEmail'] = member.email
        memberDict['memberLogin'] = member.login
        memberDict['memberDefaultLogin'] = member.defaultLogin

        try :
            artifactDraftArtifactRevisionID=long(artifactDraftArtifactRevisionID)
        except (ValueError, TypeError) as e:
            raise exceptions.InvalidArgumentException(u"Invalid value for artifactDraftArtifactRevisionID : [{artifactDraftArtifactRevisionID}] received.".format(artifactDraftArtifactRevisionID=artifactDraftArtifactRevisionID).encode('utf-8'))
        if artifactDraftArtifactRevisionID <=0:
            raise exceptions.InvalidArgumentException(u"Invalid value for artifactDraftArtifactRevisionID : [{artifactDraftArtifactRevisionID}] received.".format(artifactDraftArtifactRevisionID=artifactDraftArtifactRevisionID).encode('utf-8'))

        collaborationGroupID = request.params.get('collaborationGroupID', None)

        artifactDraftDict = self.businessLogic.getArtifactDraftByArtifactRevisionID(memberDict, artifactDraftArtifactRevisionID, collaborationGroupID=collaborationGroupID)
        responseDict = {'artifactDraft':artifactDraftDict}
        return responseDict

    @dec2.responsify(argNames=['artifactDraftID'])
    @dec1.checkAuth(argNames=['artifactDraftID'], throwbackException=True)
    def getArtifactDraftByID(self, member, artifactDraftID):
        if request.method != 'GET':
            raise exceptions.InvalidHTTPMethodException(u"HTTPMethod : [{httpMethod}] is not supported for this URL : [{URL}]".format(httpMethod=request.method, URL=request.path_qs).encode('utf-8'))

        #I guess member is already authenticated by this step using his login cookie in the request
        #And we would have a proper memberID, memberEmail, memberLogin, memberDefaultLogin
        memberDict = {}
        memberDict['memberID'] = member.id
        memberDict['memberEmail'] = member.email
        memberDict['memberLogin'] = member.login
        memberDict['memberDefaultLogin'] = member.defaultLogin

        try :
            artifactDraftID=long(artifactDraftID)
        except (ValueError, TypeError) as e:
            raise exceptions.InvalidArgumentException(u"Invalid value for artifactDraftID : [{artifactDraftID}] received.".format(artifactDraftID=artifactDraftID).encode('utf-8'))
        if artifactDraftID <=0:
            raise exceptions.InvalidArgumentException(u"Invalid value for artifactDraftID : [{artifactDraftID}] received.".format(artifactDraftID=artifactDraftID).encode('utf-8'))

        artifactDraftDict = self.businessLogic.getArtifactDraftByID(memberDict, artifactDraftID)
        responseDict = {'artifactDraft':artifactDraftDict}
        return responseDict

    @dec2.responsify()
    @dec1.checkAuth(throwbackException=True)
    def getArtifactDrafts(self, member):
        if request.method != 'GET':
            raise exceptions.InvalidHTTPMethodException(u"HTTPMethod : [{httpMethod}] is not supported for this URL : [{URL}]".format(httpMethod=request.method, URL=request.path_qs).encode('utf-8'))

        #I guess member is already authenticated by this step using his login cookie in the request
        #And we would have a proper memberID, memberEmail, memberLogin, memberDefaultLogin
        memberDict = {}
        memberDict['memberID'] = member.id
        memberDict['memberEmail'] = member.email
        memberDict['memberLogin'] = member.login
        memberDict['memberDefaultLogin'] = member.defaultLogin

        artifactDraftDictList = self.businessLogic.getArtifactDrafts(memberDict)
        responseDict = {'artifactDrafts':artifactDraftDictList}
        return responseDict

    @dec1.jsonify()
    @dec1.checkAuth(request, False, False, ['artifactType', 'artifactHandle', 'artifactCreator', 'artifactDescendantIdentifier'])
    @dec1.trace(log, ['member', 'artifactType', 'artifactHandle', 'artifactCreator', 'artifactDescendantIdentifier'])
    def updateArtifact(self, member, artifactType, artifactHandle, artifactCreator, artifactDescendantIdentifier=None):
        """
            Controller for the case when a single Lesson/Chapter is updated within a book

            @param member: The logged in user
            @param artifactType:  The type of artifact Ex: book, chapter, lesson
            @param artifactHandle: The handle of the artifact
            @param artifactCreator: The login of the creator of the artifact. This is present as part of read urls as well.
                                    If the artifactCreator and logged in user are not same then a copy of the artifact will be made
            @param artifactDescendantIdentifier: The identifier of Lesson or Chapter within a book
                                                Ex: 2.4 ---> 4th Lesson within 2nd Chapter of the book
                                                    2.0 ---> 2nd chapter within a book
        """
        memberEmail, memberId = member.email, member.id
        extraParams = {'artifactType':artifactType, 'artifactHandle':artifactHandle, 'artifactCreator':artifactCreator, 
                       'artifactDescendantIdentifier':artifactDescendantIdentifier}
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            if request.content_type not in ['application/json', 'text/plain']:
                raise exceptions.InvalidContentTypeException(u"contentType : [{contentType}] content in the request body is not supported.".format(
                    contentType=request.content_type).encode('utf-8'))

            artifactData = request.body
            try:
                artifactData = base64.b64decode(artifactData)
            except TypeError as te:
                raise exceptions.InvalidContentTypeException(u"Invalid encoded data received in the request parameter.".encode('utf-8'))
            try:
                artifactDict = json.loads(artifactData)
            except (ValueError, TypeError) as e:
                raise exceptions.InvalidArgumentException(u"Invalid artifact : [{artifact}] received in the request parameters. A valid JSON is "
                                                          u"expected.".format(artifact=artifactData).encode('utf-8'))
            if artifactDescendantIdentifier:
                artifactDescendantIdentifier = self._validateAndProcessArtifactDescendantIdentifier(artifactDescendantIdentifier)

            updatedArtifactDict = self.businessLogic.updateArtifact(member.id, artifactDict, artifactType,
                                                                    artifactHandle, artifactCreator,
                                                                    artifactDescendantIdentifier, artifactCache=ArtifactCache())
        except Exception, e:
            self._logSaveException(memberEmail, memberId, e, artifactDict, extraParams)
            return self._handleException(e)

        result['response'] = {'artifact': updatedArtifactDict}
        return result

    @dec1.jsonify()
    @dec1.checkAuth(request, False, False)
    @dec1.trace(log, ['member'])
    def updateOrCreateArtifact(self, member):
        """
            Controller for all Cases except individual Lesson/Chapter update within a book

            @param member: The logged in user

            The JSON payload should either have for update case
                {artifactID} or {artifactRevisionID} or {artifactType, artifactHandle, artifactCreator}
            Otherwise a new artifact will be created

            EndPoint: /artifact/save


            Json Format:
            1. The philosophy followed is generic. An artifact can have children artifacts with structure same as parent.
            2. If a field is not passed, it won't be updated
            3. If a field has to be updated as null, it has to explicitly passed as none depending on type
            4. Wherever there's array and sequence is important, the order of the array determines the sequence

            There are checks to ensure right parent/children relations. Depending on the payload there can be multiple updates
            at each level in parent/children.

            {
               "id":1234,
               "revisionID":1234,
               "type":{
                  "name":"lesson",
                  "id":3
               },
               "authors":[
                  {
                     "name":"TestAuthor",
                     "role":{
                        "Id":3,
                        "name":"",
                        "description":""
                     },
                     "sequence":1
                  }
               ],
               "handle":"only for ADMIN",
               "creator":{
                  "id":3
               },
               "description":"",
               "encodedID":"",
               "license":{
                  "description":"",
                  "id":5,
                  "name":"CC BY NC"
               },
               "title":"TestTitle1",
               "description":"This is the NEW DESCRIPTION!!",
               "tagTerms":[
                  {
                     "name":"ta3"
                  },
                  {
                     "name":"ta2"
                  },
                  {
                     "id":12
                  }
               ],
               "searchTerms":[
                  {
                     "name":"search11"
                  }
               ],
               "browseTerms":[
                  {
                     "id":9
                  },
                  {
                     "id":1938
                  },
                  {
                     "id":2190
                  }
               ],
               "resources":[
                  {
                     "id":9771685
                  },
                  {
                     "creator":{
                        "id":3
                     },
                     "handle":"",
                     "type":{
                        "id":1234,
                        "name":""
                     }
                  }
               ],
               "revisions":[
                  {
                     "children":[
                        {
                           #"Format same as outer JSON / Parent"
                        }
                     ],
                     "contentRevision":{
                        "xhtml":"Content"
                     }
                  }
               ]
            }

        """
        returnedArtifactDict = {}
        memberEmail, memberId = member.email, member.id
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            if request.content_type not in ['application/json', 'text/plain']:
                raise exceptions.InvalidContentTypeException(u"contentType : [{contentType}] content in the request body is not supported.".format(
                    contentType=request.content_type).encode('utf-8'))

            artifactData = request.body
            try:
                artifactData = base64.b64decode(artifactData)
            except TypeError as te:
                raise exceptions.InvalidContentTypeException(u"Invalid encoded data received in the request parameter.".encode('utf-8'))
            try:
                artifactDict = json.loads(artifactData)
            except (ValueError, TypeError) as e:
                raise exceptions.InvalidArgumentException(u"Invalid artifact : [{artifact}] received in the request parameters. A valid JSON \
                    is expected.".format(artifact=artifactData).encode('utf-8'))

            if request.method == 'POST':
                # Create
                returnedArtifactDict = self.businessLogic.createArtifact(member.id, artifactDict, artifactCache=ArtifactCache())
            elif request.method == 'PUT':
                # Update
                returnedArtifactDict = self.businessLogic.updateArtifact(member.id, artifactDict, artifactCache=ArtifactCache())
            else:
                raise exceptions.InvalidHTTPMethodException(u"HTTPMethod : [{httpMethod}] is not supported for this URL : [{URL}]".format(httpMethod=request.method, URL=request.path_qs).encode('utf-8'))
        except Exception, e:
            self._logSaveException(memberEmail, memberId, e, artifactDict)
            return self._handleException(e)

        result['response'] = {'artifact': returnedArtifactDict}
        return result


    def _logSaveException(self, memberEmail, memberId, e, payload, extraParams={}):
        logStr = "\nERROR_ID: " + datetime.utcnow().strftime('%Y%m%d%H%M%S%f')
        logStr += "\nARTIFACT_ID: " + str(payload.get('id'))
        logStr += "\nARTIFACT_REVISION_ID: " + str(payload.get('revisionID'))
        logStr += "\nARTIFACT_TYPE: " + payload['type']['name'] if payload.get('type') and payload['type'].get('name') else "None"
        logStr += "\nUSER_EMAIL: " + memberEmail
        logStr += "\nUSER_ID: " + str(memberId)
        logStr += "\nextraParams: " + json.dumps(extraParams)
        logStr += "\nSAVE_PAYLOAD: " + json.dumps(payload)
        logStr += "\nEXCEPTION_MESSAGE: " + str(e)
        logStr += "\n"
        handler = handlers.SMTPHandler(config.get('smtp_server', 'localhost'), 
                                       config.get('error_email_from', 'ck12operations@ck12.org'),
                                       config.get('email_to', 'qa-errors@ck12.org'),
                                       config.get('error_subject_prefix', '[ FLX Error on gamma.ck12.org ]') + "<Artifact Save Error>")
        saveErrorsLog.addHandler(handler)
        saveErrorsLog.error(logStr, exc_info=e)

    
    def _handleException(self, e):
        if isinstance(e, helpers.InvalidContentException):
            log.error("updateOrCreateArtifact: invalid rosetta: %s" % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.INVALID_HTML_CONTENT, str(e))
        elif isinstance(e, helpers.InvalidRosettaException):
            log.error("updateOrCreateArtifact: invalid rosetta syntax: %s" % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.INVALID_ROSETTA, str(e))
        elif isinstance(e, helpers.InvalidImageException):
            log.error("updateOrCreateArtifact: invalid image endpoints: %s" % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.INVALID_IMAGE_ENDPOINT, str(e))
        elif isinstance(e, ex.UnknownArtifactTypeException):
            log.error("updateOrCreateArtifact: unknown artifact type: %s" % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.UNKNOWN_ARTIFACT_TYPE, str(e))
        elif isinstance(e, ex.CannotCreateArtifactException):
            log.error("updateOrCreateArtifact: cannot create artifact: %s" % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.CANNOT_CREATE_ARTIFACT, str(e))
        elif isinstance(e, ex.AlreadyExistsException):
            log.error("updateOrCreateArtifact: already exists: %s" % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.ARTIFACT_ALREADY_EXIST, str(e))
        elif isinstance(e, ex.EmptyArtifactHandleException):
            log.debug("updateOrCreateArtifact: %s" % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.EMPTY_ARTIFACT_HANDLE, str(e))
        elif isinstance(e, ex.DuplicateTitleException):
            log.error('updateOrCreateArtifact: duplicate chapter title[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.DUPLICATE_CHAPTER_TITLE
            return ErrorCodes().asDict(c.errorCode, str(e))
        elif isinstance(e, ex.NoSuchArtifactException):
            log.error('update artifact Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.NO_SUCH_ARTIFACT
            return ErrorCodes().asDict(c.errorCode, str(e))
        elif isinstance(e, ex.CannotCreateLabelException):
            log.error('updateOrCreateArtifact: cannot create label exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.CANNOT_CREATE_LABEL
            return ErrorCodes().asDict(c.errorCode, str(e))
        elif isinstance(e, exceptions.InvalidContentTypeException):
            log.error('updateOrCreateArtifact: InvalidContentTypeException[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.CANNOT_UPDATE_ARTIFACT
            return ErrorCodes().asDict(c.errorCode, str(e))
        elif isinstance(e, exceptions.InvalidArgumentException):
            log.error('updateOrCreateArtifact: InvalidArgumentException[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.CANNOT_UPDATE_ARTIFACT
            return ErrorCodes().asDict(c.errorCode, str(e))
        elif isinstance(e, exceptions.OldRevisionUpdateException):
            log.error('updateOrCreateArtifact: OldRevisionUpdateException[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.CANNOT_UPDATE_OLD_REVISION
            return ErrorCodes().asDict(c.errorCode, str(e))
        else:
            log.error('updateOrCreateArtifact: Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.CANNOT_UPDATE_ARTIFACT
            return ErrorCodes().asDict(c.errorCode, str("Unable to save artifact"))
