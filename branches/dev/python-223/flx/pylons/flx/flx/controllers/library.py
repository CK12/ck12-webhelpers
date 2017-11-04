import logging
import json

from pylons import request, tmpl_context as c
from pylons.i18n.translation import _ 
from pylons import app_globals as g

from flx.controllers import decorators as d
from flx.controllers.common import ArtifactCache, BrowseTermCache
from flx.controllers.common import LabelCache
from flx.model import model
from flx.model import api
from flx.model import exceptions as ex
from flx.lib.base import BaseController, render
from flx.lib.search import solrclient
import flx.controllers.user as u
import flx.lib.helpers as h

from flx.controllers.errorCodes import ErrorCodes

log = logging.getLogger(__name__)

bookType = 'book'
chapterType = 'chapter'
lessonType = 'lesson'
conceptType = 'concept'

class LibraryController(BaseController):

    """
        Library get related APIs.
    """

    @d.jsonify()
    @d.checkAuth(request, False, False, ['types', 'labels'])
    @d.setPage(request, ['types', 'member', 'labels'])
    @d.filterable(request, ['types', 'member', 'labels', 'pageNum', 'pageSize'], noformat=True)
    @d.sortable(request, ['types', 'member', 'labels', 'fq', 'pageNum', 'pageSize'])
    @d.trace(log, ['types', 'member', 'labels', 'fq', 'pageNum', 'pageSize', 'sort'])
    def getMyArtifactInfo(self, pageNum, pageSize, member, sort, fq, types=None, labels=None):
        """
            Retrieves all artifacts from the user's library. This API need authetication.
            Pagination is supported for this API. The pageNum is 1-origin.
            If pageSize is 0, then the entire collection will be returned.
            Supports one or multiple artifact types as a comma-separated list.
            If 'artifact' is one of the artifact types, all types of artifacts
            will be returned
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            c.errorCode = ErrorCodes.NO_SUCH_ARTIFACT
            memberID = member.id
            sortOn = self.getSortOrder(sort, 'MemberLibraryArtifactRevisions')
            all = str(request.params.get('all')).lower() != 'false'
            ownership = request.params.get('ownership', 'all').lower()
            if ownership == 'all' and not all:
                ownership = 'owned' ## Backward compatibility

            typeNames = None
            if types:
                typeNames = [ x.strip() for x in types.lower().split(',') ]
                if typeNames and 'artifact' in typeNames:
                    ## If artifact is specified, include all types
                    typeNames = None
            if labels:
                labels = [ x.strip() for x in labels.lower().split(',') ]

            excludeLabels = []
            if not labels or model.MEMBER_LABEL_ARCHIVED not in labels:
                excludeLabels = [model.MEMBER_LABEL_ARCHIVED]

            grades = None
            if request.params.get('grades'):
                grades = [ x.strip() for x in request.params['grades'].lower().split(',') ]

            queryOptions = {}
            queryOptions['includeLibraryInfos'] = True
            includeRevisionsInState = request.params.get('includeRevisionsInState')
            if includeRevisionsInState in ('draft', 'DRAFT', 'Draft'):
                includeRevisionsInState = 'DRAFT'
                queryOptions['returnDraftIfDraftExists'] = True
                queryOptions['includeChildrenDraftInfos'] = True
            elif includeRevisionsInState in ('final', 'FINAL', 'Final'):
                includeRevisionsInState = 'FINAL'
            else:
                includeRevisionsInState = 'ANY'

            includePublishedRevisionsOnly = request.params.get('includePublishedRevisionsOnly')
            if includePublishedRevisionsOnly in ('TRUE', 'True', 'true', 'YES','Yes', 'yes'):
                includePublishedRevisionsOnly = True
            else:
                includePublishedRevisionsOnly= False

            log.info("Labels: %s, excludeLabels: %s, grades: %s" % (labels, excludeLabels, grades))
            ids = api.getMemberLibraryArtifactRevisionsByLabels(memberID=memberID, 
                    labels=labels, 
                    typeNames=typeNames,
                    sort=sortOn, 
                    filters=fq,
                    grades=grades,
                    ownership=ownership,
                    excludeLabels=excludeLabels,
                    includeRevisionsInState=includeRevisionsInState,
                    includePublishedRevisionsOnly=includePublishedRevisionsOnly,
                    pageNum=pageNum, 
                    pageSize=pageSize)

            from flx.logic.artifactBusinessManager import ArtifactBusinessLogic

            businessLogic = ArtifactBusinessLogic()
            artifactTypeNameDict = g.getArtifactTypeNames()
            artifactDictList = []
            artifactDictDict = {}
            artifactRevisionIDs = []
            if ids and memberID:
                #artifactRevisionIDs, artifactIDs, artifactTypeIDs, handles, creatorIDs, revisions, logins = zip(*ids)
                #artifactDraftInfosMap = api.getMemberArtifactDraftInfosByArtifactRevisionIDs(memberID=memberID, artifactRevisionIDs=artifactRevisionIDs)
                for artifactRevisionID, artifactID, artifactTypeID, handle, creatorID, revision, login in ids:
                    #artifactDict, artifact = ArtifactCache().load(revisionID=artifactRevisionID, memberID=memberID, infoOnly=True)
                    queryOptions = {
                        #'returnDraftIfDraftExists': True,
                        #'includeChildrenDraftInfos': True,
                        'includeLibraryInfos': True,
                        'includeDraftInfo': True,
                        #'includeProcessedContent': True,
                        #'includeExtendedArtifacts': True,
                        'includeAuthors': True,
                        #'includeFeedbacks': True,
                        #'includeFeedbackHelpfuls': True,
                        #'includeFeedbackAbuseReports': True,
                        #'includeFeedbackReviews': True,
                        #'includeFeedbackReviewAbuseReports': True,
                        #'includeFeedbackAggregateScores': True,
                        'includeResources': True,
                        #'includeAllResources': True,
                        #'includeResourceAbuseReports': True,
                        #'includeInlineDocuments': True,
                        #'includeEmbeddedObjects': True,
                        #'includeContent': False,
                        #'includeRevisionStandards': True,
                        #'includeRevisionStandardGrades': True,
                        'includeChildren': True,
                        #'includeGrandChildren': True,
                        'includeBrowseTerms': True,
                        #'includeBrowseTermStandards': True,
                        #'includeBrowseTermStandardGrades': True,
                        #'includeTagTerms': True,
                        #'includeSearchTerms': True,
                        #'includeVocabularies': True,
                        'includeCoverImage': True,
                        'includeDomainCollectionContexts': True,
                    }
                    artifactType = artifactTypeNameDict[artifactTypeID]
                    log.debug('getArtifact: artifactRevisionID[%s]' % artifactRevisionID)
                    log.debug('getArtifact: artifactID[%s]' % artifactID)
                    log.debug('getArtifact: artifactType[%s]' % artifactType['name'])
                    log.debug('getArtifact: handle[%s]' % handle)
                    log.debug('getArtifact: creatorID[%s]' % creatorID)
                    log.debug('getArtifact: revision[%s]' % revision)
                    log.debug('getArtifact: login[%s]' % login)
                    artifactDict = businessLogic.getArtifactByTypeHandleCreatorRevisionNOAndDescendantIdentifier(artifactType=artifactType['name'], artifactHandle=handle, artifactCreator=login, artifactRevisionNO=revision, artifactDescendantIdentifier=None, queryOptions=queryOptions)
                    log.debug('getArtifact: artifactDict[%s]' % artifactDict)
                    """
                    if artifactDraftInfosMap.has_key(artifactRevisionID):
                        artifactDraftInfo = artifactDraftInfosMap[artifactRevisionID]
                        artifactDict['hasDraft'] = True
                        artifactDict['draftTypeID'] = artifactDraftInfo[0]
                        artifactDict['draftHandle'] = artifactDraftInfo[1]
                        artifactDict['draftCreatorID'] = artifactDraftInfo[2]
                        artifactDict['draftCreatedTimeStamp'] = artifactDraftInfo[3]
                        artifactDict['draftLastUpdatedTimeStamp'] = artifactDraftInfo[4]
                    else:
                        artifactDict['hasDraft'] = False
                    """
                    artifactDictList.append(artifactDict)
                    artifactDictDict[artifactID] = artifactDict
                    artifactRevisionIDs.append(artifactRevisionID)
            #
            #  Add label information.
            #
            log.debug('getMyArtifactInfo: artifactRevisionIDs[%s]' % artifactRevisionIDs)
            labels = api.getLabelsForArtifactRevisionIDs(memberID, artifactRevisionIDs)
            log.debug('getMyArtifactInfo: labels[%s]' % labels)
            keyDict = {}
            for artifactID, label in labels:
                aDict = artifactDictDict[artifactID]
                labels = aDict['revisions'][0].get('labels')
                if not labels:
                    labels = aDict['revisions'][0]['labels'] = []
                key = '%s:%s:%s' % (artifactID, label.label, label.systemLabel)
                if not keyDict.get(key, False):
                    labels.append({ 'label': label.label, 'systemLabel': label.systemLabel })
                    keyDict[key] = True

            ## Create a label dictionary with labels and a list of indices in the artifacts response
            labelDict = {}
            for i in range(0, len(artifactDictList)):
                aDict = artifactDictList[i]
                labels = aDict['revisions'][0].get('labels', None)
                if labels:
                    for l in labels:
                        if not labelDict.has_key(l['label']):
                            labelDict[l['label']] = []
                        labelDict[l['label']].append(i)

            result['response']['labels'] = labelDict
            result['response']['artifacts'] = artifactDictList
            result['response']['total'] = ids.total
            result['response']['limit'] = len(ids)
            result['response']['offset'] = (pageNum - 1)*pageSize
            return result
        except Exception, e:
            log.error('mylib Exception[%s]' % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.NO_SUCH_ARTIFACT, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, False, ['types', 'labels'])
    @d.setPage(request, ['types', 'member', 'labels'])
    @d.filterable(request, ['types', 'member', 'labels', 'pageNum', 'pageSize'], noformat=True)
    @d.sortable(request, ['types', 'member', 'labels', 'fq', 'pageNum', 'pageSize'])
    @d.trace(log, ['types', 'member', 'labels', 'fq', 'pageNum', 'pageSize', 'sort'])
    def getMyResourceInfo(self, pageNum, pageSize, member, sort, fq, types=None, labels=None):
        """
            Retrieves all resources from the user's library. This API need authetication.
            Pagination is supported for this API. The pageNum is 1-origin.
            If pageSize is 0, then the entire collection will be returned.
            Supports one or multiple artifact types as a comma-separated list.
            If 'resource' is one of the resource types, all types of resources
            will be returned
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            c.errorCode = ErrorCodes.NO_SUCH_RESOURCE
            sortOn = self.getSortOrder(sort, 'MemberLibraryResourceRevisions')
            ownership = request.params.get('ownership', 'all').lower()
            typeNames = None
            if types:
                typeNames = [ x.strip() for x in types.lower().split(',') ]
                if typeNames and 'resource' in typeNames:
                    ## If artifact is specified, include all types
                    typeNames = None
            if labels:
                labels = [ x.strip() for x in labels.lower().split(',') ]

            excludeLabels = []
            if not labels or model.MEMBER_LABEL_ARCHIVED not in labels:
                excludeLabels = [model.MEMBER_LABEL_ARCHIVED]

            log.info("Labels: %s, excludeLabels: %s" % (labels, excludeLabels))
            resourceRevisions = api.getMemberLibraryResourceRevisionsByLabels(
                    memberID=member.id, 
                    labels=labels, 
                    typeNames=typeNames,
                    sort=sortOn, 
                    filters=fq,
                    ownership=ownership,
                    excludeLabels=excludeLabels,
                    pageNum=pageNum, 
                    pageSize=pageSize)

            revIdList = [ x.resourceRevisionID for x in resourceRevisions ]
            log.info("revIdList: %s" % str(revIdList))
            resourceRevisionsList = api.getResourceRevisionsByIDs(ids=revIdList)
            ## Create a label dictionary with labels and a list of indices in the artifacts response
            labelDict = {}
            resourceDictList = []
            for i in range(0, len(resourceRevisionsList)):
                aDict = g.resourceHelper.getResourceInfo(resourceRevisionsList[i], [resourceRevisionsList[i]], memberID=member.id)
                for l in aDict['revisions'][0]['labels']:
                    if not labelDict.has_key(l['label']):
                        labelDict[l['label']] = []
                    labelDict[l['label']].append(i)
                resourceDictList.append(aDict)

            result['response']['labels'] = labelDict
            result['response']['resources'] = resourceDictList
            result['response']['total'] = resourceRevisions.total
            result['response']['limit'] = len(resourceRevisions)
            result['response']['offset'] = (pageNum - 1)*pageSize
            return result
        except Exception, e:
            log.error('mylib Exception[%s]' % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.NO_SUCH_RESOURCE, str(e))

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log, ['member'])
    def addToLibraryMulti(self, member):
        """
            Add an object to library.
            Parameters:
                mappings: A JSON list of dictionaries specifying the following:
                    objectID: id of the object to be added 
                    objectType: type name of the object to be added
                    domainID: domain id of the context for the object
                    labels: List of labels to be associated with the object
                    systemLabels: List of system labels to be associated
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            mappings = request.params.get('mappings')
            mappings = json.loads(mappings)
            log.info("Mappings: %s" % mappings)
            ids2Reindex = []
            for map in mappings:
                objectID = int(map['objectID'])
                objectType = map['objectType']
                if not objectID or not objectType:
                    raise Exception((_(u'Must specify objectID and objectType both')).encode("utf-8"))
                domainID = map.get('domainID')
                if domainID:
                    domainID = int(domainID)
                labels = map.get('labels')
                if labels:
                    labels = [ x.strip() for x in labels ]
                if not labels:
                    labels = None
                systemLabels = map.get('systemLabels')
                if systemLabels:
                    systemLabels = [ x.strip() for x in systemLabels ]
                if not systemLabels:
                    systemLabels = None
                obj = api.addObjectToLibrary(objectID=objectID, objectType=objectType, 
                            memberID=member.id, domainID=domainID, labels=labels, systemLabels=systemLabels,
                            removeExisting=True, cache=ArtifactCache())
                log.info("Adding %d to library" % (objectID))
                if objectType == 'artifactRevision':
                    ids2Reindex.append(obj.parentID)
            LabelCache().invalidate(member.id)

            if ids2Reindex:
                h.reindexArtifacts(ids2Reindex, member.id)
            return result
        except Exception, e:
            log.error("Exception adding objects to library[%s]" % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.CANNOT_ADD_OBJECT_TO_LIBRARY, str(e))

    @d.checkAuth(request, True, True)
    @d.trace(log, ['member'])
    def addToLibraryForm(self, member):
        c.member = member
        c.prefix = self.prefix
        return render('/flx/library/add.html')

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log, ['member'])
    def addToLibrary(self, member):
        """
            Add an object to library.
            Parameters:
                objectID: id of the object to be added.
                objectType: type name of the object to be added 'artifactRevision' or 'resourceRevision'
                labels: comma-separated label names to be assigned to this object
                        If any label name does not exist, it will be created
                systemLabels: A flag to indicate if ALL the labels in the request are systemLabels
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            objectID = request.params.get('objectID')
            objectType = request.params.get('objectType')
            if not objectID or not objectType:
                raise Exception((_(u'Must specify objectID and objectType both')).encode("utf-8"))
            objectID = int(objectID)
            domainID = int(request.params.get('domainID')) if request.params.get('domainID') else None
            if objectType == 'domain':
                domainID = objectID
            labels = request.params.get('labels')
            if labels:
                labels = [ x.strip() for x in labels.split(',') ]
            if not labels:
                labels = None
            systemLabels = str(request.params.get('systemLabels', '')).lower() == 'true'
            if systemLabels:
                systemLabels = labels
                labels = None

            obj = api.addObjectToLibrary(objectID=objectID, objectType=objectType, memberID=member.id, 
                    domainID=domainID, labels=labels, systemLabels=systemLabels, cache=ArtifactCache())
            LabelCache().invalidate(member.id)
            if obj.objectType == 'artifactRevision' and obj.parentID:
                h.reindexArtifacts([obj.parentID], member.id)
            return result
        except Exception, e:
            log.error("Exception adding object to library[%s]" % str(e))
            return ErrorCodes().asDict(ErrorCodes.CANNOT_ADD_OBJECT_TO_LIBRARY, str(e))

    @d.checkAuth(request, True, True)
    @d.trace(log, ['member'])
    def removeFromLibraryForm(self, member):
        c.member = member
        c.prefix = self.prefix
        return render('/flx/library/remove.html')

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log, ['member'])
    def removeFromLibrary(self, member):
        """
            Remove an object from library.
            Parameters:
                objectID: id of the object to be removed.
                objectType: type name of the object to be removed 'artifactRevision' or 'resourceRevision'
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            objectID = request.params.get('objectID')
            objectType = request.params.get('objectType')
            if not objectID or not objectType:
                raise Exception((_(u'Must specify objectID and objectType both')).encode("utf-8"))
            objectID = int(objectID)
            domainID = int(request.params.get('domainID')) if request.params.get('domainID') else None
            if objectType == 'domain':
                domainID = objectID
            parentID = api.removeObjectFromLibrary(objectID=objectID, objectType=objectType, memberID=member.id, domainID=domainID, cache=ArtifactCache())
            LabelCache().invalidate(member.id)
            if objectType == 'artifactRevision' and parentID:
                h.reindexArtifacts([parentID], member.id)
            return result
        except Exception, e:
            log.error("Exception removing object from library[%s]" % str(e))
            return ErrorCodes().asDict(ErrorCodes.CANNOT_REMOVE_OBJECT_FROM_LIBRARY, str(e))

    def __reindexArtifacts(self, objectIDs, objectTypes, memberID):
        revisionIDs = []
        for i in range(0, len(objectTypes)):
            if objectTypes[i] == 'artifactRevision':
                revisionIDs.append(objectIDs[i])
        if revisionIDs:
            artifactIDs = api.getArtifactIDsForRevisionIDs(revisionIDs=objectIDs)
            h.reindexArtifacts(artifactIDs, memberID)

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log, ['member'])
    def assignLabelToObjects(self, member):
        """
            Assign given label to the library object
            Parameters:
                objectIDs: comma-separated object ids
                objectTypes: comma-separated objectTypes (1:1 correspondance with the objectIDs)
                domainIDs: comma-separated domainIDs (1:1 correspondance with the objectIDs)
                label: Label to be assigned
                systemLabel: True if the label is system-defined
                             False otherwise
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            objectIDs = [ int(x.strip()) for x in request.params.get('objectIDs', '').split(',') ]
            objectTypes = [ x.strip() for x in request.params.get('objectTypes', '').split(',') ]
            if not objectIDs or not objectTypes or len(objectIDs) != len(objectTypes):
                raise Exception((_(u'Invalid request. Must specify at lease one objectID and objectType.')).encode("utf-8"))
            domainIDs = request.params.get('domainIDs')
            if domainIDs:
                domainIDs = [ int(x.strip()) for x in domainIDs.split(',') ]
                if len(domainIDs) != len(objectIDs):
                    raise Exception(_('Invalid request. Number of domainIDs must match number of objectIDs'))
            else:
                domainIDs = None
            label = request.params.get('label')
            systemLabel = str(request.params.get('systemLabel', '')).lower() == 'true'
            api.assignLabelToMemberLibraryObjects(objectIDs=objectIDs, objectTypes=objectTypes, memberID=member.id, 
                    label=label, systemLabel=systemLabel, domainIDs=domainIDs)
            LabelCache().invalidate(member.id)
            self.__reindexArtifacts(objectIDs, objectTypes, member.id)
            return result
        except Exception, e:
            log.error("Error assigning label to library object[%s]" % str(e))
            return ErrorCodes().asDict(ErrorCodes.CANNOT_ASSIGN_LABEL_TO_LIBRARY_OBJECT, str(e))

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log, ['member'])
    def changeLabelForObjects(self, member):
        """
            Remove an existing label and assign a new label to a set of objects
            Parameters:
                objectIDs: comma-separated object ids
                objectTypes: comma-separated objectTypes (1:1 correspondance with the objectIDs)
                domainIDs: comma-separated domainIDs (1:1 correspondance with the objectIDs)
                oldLabel: Label to be removed
                newLabel: Label to be assigned
                systemLabel: True if the label is system-defined, false otherwise
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            log.info("Params: %s" % request.params)
            objectIDs = [ int(x.strip()) for x in request.params.get('objectIDs', '').split(',') ]
            objectTypes = [ x.strip() for x in request.params.get('objectTypes', '').split(',') ]
            if not objectIDs or not objectTypes or len(objectIDs) != len(objectTypes):
                raise Exception((_(u'Invalid request. Must specify at lease one objectID and objectType.')).encode("utf-8"))
            domainIDs = request.params.get('domainIDs')
            if domainIDs:
                domainIDs = [ int(x.strip()) for x in domainIDs.split(',') ]
                if len(domainIDs) != len(objectIDs):
                    raise Exception(_('Invalid request. Number of domainIDs must match number of objectIDs'))
            else:
                domainIDs = None
            oldLabel = request.params.get('oldLabel')
            newLabel = request.params.get('newLabel')
            systemLabel = str(request.params.get('systemLabel', '')).lower() == 'true'
            api.changeMemberLibraryObjectsLabel(objectIDs=objectIDs, objectTypes=objectTypes, memberID=member.id,
                    oldLabel=oldLabel, newLabel=newLabel, systemLabel=systemLabel, domainIDs=domainIDs)
            LabelCache().invalidate(member.id)
            self.__reindexArtifacts(objectIDs, objectTypes, member.id)
            return result
        except Exception as e:
            log.error("Error moving library objects to different label [%s]" % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.CANNOT_ASSIGN_LABEL_TO_LIBRARY_OBJECT, str(e))
            
    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log, ['member'])
    def removeLabelFromObjects(self, member):
        """
            Remove a label from a library object
            Parameters:
                objectIDs: comma-separated object ids
                objectTypes: comma-separated objectTypes (1:1 correspondance with the objectIDs)
                domainIDs: comma-separated domainIDs (1:1 correspondance with the objectIDs)
                label: Label to be removed
                systemLabel: True if the label is system-defined
                             False otherwise
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            objectIDs = [ int(x.strip()) for x in request.params.get('objectIDs', '').split(',') ]
            objectTypes = [ x.strip() for x in request.params.get('objectTypes', '').split(',') ]
            if not objectIDs or not objectTypes or len(objectIDs) != len(objectTypes):
                raise Exception((_(u'Invalid request. Must specify at lease one objectID and objectType.')).encode("utf-8"))
            domainIDs = request.params.get('domainIDs')
            if domainIDs:
                domainIDs = [ int(x.strip()) for x in domainIDs.split(',') ]
                if len(domainIDs) != len(objectIDs):
                    raise Exception(_('Invalid request. Number of domainIDs must match number of objectIDs'))
            else:
                domainIDs = None
            label = request.params.get('label')
            systemLabel = str(request.params.get('systemLabel', '')).lower() == 'true'
            api.deleteLabelFromMemberLibraryObjects(objectIDs=objectIDs, objectTypes=objectTypes, memberID=member.id, 
                    label=label, systemLabel=systemLabel, domainIDs=domainIDs)
            LabelCache().invalidate(member.id)
            self.__reindexArtifacts(objectIDs, objectTypes, member.id)
            return result
        except Exception, e:
            log.error('Error remove label from library object[%s]' % str(e))
            return ErrorCodes().asDict(ErrorCodes.CANNOT_REMOVE_LABEL_FROM_LIBRARY_OBJECT, str(e))

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log, ['member'])
    def addMemberLabel(self, member):
        """
            Create an empty user-defined or system-defined label
            Parameters:
                label: Label to be created
                systemLabel: True if the label is system-defined
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            label = request.params.get('label')
            if not label:
                raise Exception((_(u"No label specified.")).encode("utf-8"))
            systemLabel = str(request.params.get('systemLabel', '')).lower() == 'true'
            if systemLabel and not u.isMemberAdmin(member):
                raise Exception((_(u'Only administrator can add system labels')).encode("utf-8"))
            label = api.createMemberLabel(memberID=member.id, label=label, systemLabel=systemLabel)
            result['label'] = label.asDict()
            LabelCache().invalidate(member.id)
            return result
        except ex.AlreadyExistsException, aee:
            return ErrorCodes().asDict(ErrorCodes.LABEL_ALREADY_EXISTS, str(aee))
        except Exception as e:
            log.error("Error creating a label[%s]" % str(e))
            return ErrorCodes().asDict(ErrorCodes.CANNOT_CREATE_LABEL, str(e))

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log, ['member'])
    def deleteMemberLabel(self, member):
        """
            Delete a user-defined or system-defined label
            Parameters:
                label: Label to be created
                systemLabel: True if the label is system-defined
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            label = request.params.get('label')
            if not label:
                raise Exception((_(u"No label specified.")).encode("utf-8"))
            systemLabel = str(request.params.get('systemLabel', '')).lower() == 'true'
            if systemLabel and not u.isMemberAdmin(member):
                raise Exception((_(u'Only administrator can delete system labels')).encode("utf-8"))
            libObjs = api.getMemberLibraryArtifactsForLabel(memberID=member.id, labelName=label, systemLabel=systemLabel)
            artifactIDs = [ l.parentID for l in libObjs ]
            api.deleteMemberLabel(memberID=member.id, label=label, systemLabel=systemLabel)
            LabelCache().invalidate(member.id)
            if artifactIDs:
                for artifactID in artifactIDs:
                    artifact = api.getArtifactByID(id=artifactID)
                    api.invalidateArtifact(ArtifactCache(), artifact, revision=artifact.revisions[0], memberID=member.id)
                h.reindexArtifacts(artifactIds=artifactIDs, user=member.id)
            return result
        except Exception as e:
            log.error("Error deleting a label[%s]" % str(e))
            return ErrorCodes().asDict(ErrorCodes.CANNOT_DELETE_LABEL, str(e))

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log, ['member'])
    def updateMemberLabel(self, member):
        """
            Update a Label 
            Parameters:
                label: Old label name
                newLabel: New label name
                systemLabel: True is the label is system-defined
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            label = request.params.get('label')
            if not label:
                raise Exception((_(u"No label specified.")).encode("utf-8"))
            newLabel = request.params.get('newLabel')
            if not newLabel:
                raise Exception((_(u"No new label name specified.")).encode("utf-8"))
            systemLabel = str(request.params.get('systemLabel', '')).lower() == 'true'
            if systemLabel and not u.isMemberAdmin(member):
                raise Exception((_(u'Only administrator can rename the system labels')).encode("utf-8"))
            libObjs = api.getMemberLibraryArtifactsForLabel(memberID=member.id, labelName=label, systemLabel=systemLabel)
            artifactIDs = [ l.parentID for l in libObjs ]
            label = api.updateMemberLabel(memberID=member.id, label=label, newLabel=newLabel, systemLabel=systemLabel)
            result['label'] = label.asDict()
            LabelCache().invalidate(member.id)
            if artifactIDs:
                h.reindexArtifacts(artifactIds=artifactIDs, user=member.id)
            return result
        except Exception as e:
            log.error("Error updating a label[%s]" % str(e))
            return ErrorCodes().asDict(ErrorCodes.CANNOT_UPDATE_LABEL, str(e))

    #SYSTEM_LABELS_ORDER = {'Mathematics': 1, 'Science': 2, 'Others': 3}
    @d.jsonify()
    @d.checkAuth(request, False, False, ['includeSystem'])
    @d.setPage(request, ['member', 'includeSystem'])
    @d.trace(log, ['member', 'includeSystem', 'pageNum', 'pageSize'])
    def getLabels(self, member, pageNum, pageSize, includeSystem=True):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            includeSystem = str(includeSystem).lower() == 'true'
            labelList = LabelCache().load(member.id, includeSystem)
            total = len(labelList)
            offset = (pageNum - 1)*pageSize
            left = total - offset
            limit = left if left <= pageSize else pageSize
            
            searchLabel = request.params.get('searchLabel', None)
            newLabelList = []
            if searchLabel:
                searchLabel = searchLabel.lower()
                for labelInfo in labelList:
                    if searchLabel in labelInfo['label'].lower():
                        newLabelList.append(labelInfo)
            else:
                newLabelList = labelList
            
            newLabelList = newLabelList[offset:offset+limit]   
            result['response']['total'] = total
            result['response']['limit'] = limit
            result['response']['offset'] = offset
            result['response']['labels'] = newLabelList
            return result
        except Exception as e:
            log.error("Error getting labels:[%s]" % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.NO_SUCH_LABEL, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, False, ['searchTerm', 'types'])
    @d.sortable(request, ['searchTerm', 'types', 'member' ])
    @d.filterable(request, ['searchTerm', 'types', 'member', 'sort'])
    @d.setPage(request, ['searchTerm', 'types', 'member', 'sort', 'fq'])
    @d.trace(log, ['searchTerm', 'types', 'member', 'sort', 'fq', 'pageNum', 'pageSize'])
    def searchMyArtifacts(self, member, fq, pageNum, pageSize, types, searchTerm=None, sort=None):
        """
            Retrieves all the artifacts that belong to the logged in member.
            Pagination is supported for this API. The pageNum is 1-origin.
            If pageSize is 0, then the entire collection will be returned.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:

            start = (pageNum-1) * pageSize
            sort = solrclient.getSortOrder(sort)
            log.info("Sort order: %s" % sort)
            typeNames = None
            if types:
                typeNames = [ x.strip() for x in types.lower().split(',') ]
            specialSearch = str(request.params.get('specialSearch')).lower() == 'true'
            extendedArtifacts = str(request.params.get('extendedArtifacts')).lower() == 'true'
            if searchTerm == '__all__':
                searchTerm = ''
            hits = api.searchArtifacts(domain=None, term=searchTerm, typeNames=typeNames, fq=fq, sort=sort, start=start, rows=pageSize, memberID=member.id, 
                    specialSearch=specialSearch, extendedArtifacts=extendedArtifacts, searchAll=False, idsOnly=True)
            artifacts = []
            for aid in hits['artifactList']:
                aDict, a = ArtifactCache().load(aid['id'], infoOnly=True)
                artifacts.append(aDict)
            artifactDict = {
                            'total': hits['numFound'], 
                            'limit': len(hits['artifactList']),
                            'offset': start,
                            'result': artifacts,
                            'filters': hits['facets'],
                            'suggestions': hits['suggestions'],
                           }
            result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            result['response']['Artifacts'] = artifactDict
            return result
        except Exception, e:
            log.error('mylib Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.NO_SUCH_ARTIFACT
            return ErrorCodes().asDict(c.errorCode, str(e))


    @d.jsonify()
    @d.checkAuth(request, False, False, ['searchTerm', 'types', 'rtype'])
    @d.sortable(request, ['searchTerm', 'types', 'member', 'rtype' ])
    @d.filterableSearch(request, ['searchTerm', 'types', 'member', 'sort', 'rtype'])
    @d.setPage(request, ['searchTerm', 'types', 'member', 'rtype', 'sort', 'fq'])
    @d.trace(log, ['searchTerm', 'types', 'member', 'rtype', 'sort', 'fq', 'pageNum', 'pageSize'])
    def searchMyModalities(self, member, fq, pageNum, pageSize, types, rtype=None, searchTerm=None, sort=None):
        """
            Retrieves all the artifacts that belong to the logged in member.
            Pagination is supported for this API. The pageNum is 1-origin.
            If pageSize is 0, then the entire collection will be returned.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:

            if not rtype:
                rtype = 'info'
            #infoOnly = True
            minimalOnly = False
            if rtype == 'minimal':
                minimalOnly = True
            start = (pageNum-1) * pageSize
            sort = solrclient.getSortOrder(sort)
            log.info("Sort order: %s" % sort)
            typeNames = None
            if types:
                typeNames = [ x.strip() for x in types.lower().split(',') ]
            specialSearch = str(request.params.get('specialSearch')).lower() == 'true'
            extendedArtifacts = str(request.params.get('extendedArtifacts')).lower() == 'true'
            relatedArtifacts = str(request.params.get('relatedArtifacts')).lower() == 'true'
            if searchTerm == '__all__':
                searchTerm = ''
            hits = api.searchModalities(domain=None, term=searchTerm, typeNames=typeNames, fq=fq, sort=sort, start=start, rows=pageSize, memberID=member.id, 
                    specialSearch=specialSearch, extendedArtifacts=extendedArtifacts, relatedArtifacts=relatedArtifacts, searchAll=False, idsOnly=True)
            artifacts = []
            hitList = hits['artifactList']
            nodeList = []
            artifactList = []
            for item in hitList:
                if item['artifactType'] == 'domain':
                    nodeList.append({'id':abs(int(item['id']))})
                else:
                    artifactList.append(item)
            for aid in artifactList:
                try:
                    a = api.getArtifactByID(id=aid['id'])
                    if not a:
                        h.reindexArtifacts([aid['id']], recursive=True)
                        raise Exception("No such artifact by id: %s" % aid['id'])
                    aDict = a.asDict(memberID=member.id, includeRevisions=not minimalOnly, includeFeedbacks=False)
                    #aDict, a = ArtifactCache().load(aid['id'], memberID=member.id, infoOnly=infoOnly, minimalOnly=minimalOnly)
                    aDict['id'] = int(aDict['id'])
                    if aDict:
                        if not relatedArtifacts and aDict.has_key('relatedArtifacts'):
                            del aDict['relatedArtifacts']
                        if not extendedArtifacts and aDict.has_key('extendedArtifacts'):
                            del aDict['extendedArtifacts']
                    artifacts.append(aDict)
                except Exception as ae:
                    log.warn("Error loading artifact: %s" % str(ae))
            for nid in nodeList:
                nDict = BrowseTermCache().load(nid['id'], memberID=member.id, modalitiesOnly=True)
                nDict['id'] = -int(nDict['id'])
                artifacts.append(nDict)
            idList = []
            for hit in hitList:
                idList.append(int(hit.get('id')))
            artifacts = sorted(artifacts, cmp=lambda x,y: cmp(idList.index(int(x.get('id'))), idList.index(int(y.get('id')))))
            artifactDict = {
                            'total': hits['numFound'], 
                            'limit': len(hits['artifactList']),
                            'offset': start,
                            'result': artifacts,
                            'filters': hits['facets'],
                            'suggestions': hits['suggestions'],
                           }
            result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            result['response']['Artifacts'] = artifactDict
            return result
        except Exception, e:
            log.error('mylib Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.NO_SUCH_ARTIFACT
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log, ['member'])
    def isInLibrary(self, member):
        """
            Add an object to library.
            Parameters:
                objectIDs: id of the object to be added.
                objectTypes: type name of the object to be added 'artifactRevision' or 'resourceRevision'
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            parentIDs = request.params.get('parentIDs')
            objectTypes = request.params.get('objectTypes')
            if not parentIDs or not objectTypes:
                raise Exception((_(u'Must specify parentIDs and objectTypes both')).encode("utf-8"))
            parentIDs = [ int(x) if x.strip() else 0 for x in parentIDs.split(',') ]
            objectTypes = [ x for x in objectTypes.split(',') ]
            if len(parentIDs) != len(objectTypes):
                raise Exception((_(u'Number of parentIDs and objectTypes must match.')).encode('utf-8'))
            objectsDesc = []
            for i in range(0, len(parentIDs)):
                objectsDesc.append((parentIDs[i], objectTypes[i]))
            objects = api.getMemberLibraryObjectsByParentIDsAndTypes(memberID=member.id, objectsDesc=objectsDesc)
            result['response']['objects'] = objects
            return result
        except Exception, e:
            log.error("Could not check if objects are in library[%s]" % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.UNKNOWN_ERROR, str(e))

