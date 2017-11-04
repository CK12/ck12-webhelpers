# Copyright 2007-2013 CK-12 Foundation
#
# All rights reserved
#
#
# Unless required by applicable law or agreed to in writing, software
# distributed under this License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
# implied.  See the License for the specific language governing
# permissions and limitations.
#
# This file originally written by Javed Attar
#
# $Id$
from pylons import request, tmpl_context as c, session as pylons_session
from pylons import app_globals as g
from pylons.decorators.cache import beaker_cache
from pylons.i18n.translation import _
from sqlalchemy.sql import func
from flx.controllers import decorators as d
from flx.controllers.common import ArtifactCache, BrowseTermCache
from flx.controllers.errorCodes import ErrorCodes
from flx.controllers.lms import LmsController
from flx.lib.base import BaseController
from flx.model import exceptions as ex
from flx.model import api, studyTrackItemContext as stic, utils
from flx.model import model, meta, migrated_concepts as mc
from flx.controllers.mongo.base import MongoBaseController 
from flx.model.mongo.collectionNode import CollectionNode
from flx.model.mongo.conceptnode import ConceptNode
import flx.controllers.user as u
import flx.controllers.notification as n
import flx.lib.helpers as h

from datetime import datetime as dt, timedelta, date
import logging
import traceback
import json
import urllib

log = logging.getLogger(__name__)

class AssignmentController(LmsController, MongoBaseController):

    def __init__(self, **kwargs):
        LmsController.__init__(self, **kwargs)
        MongoBaseController.__init__(self, **kwargs)
        self.collectionNode = CollectionNode(self.db)
        self.conceptNode = ConceptNode(self.db)

    def index(self):
        # Return a rendered template
        #return render('/assignment.mako')
        # or, return a string
        return 'Hello World'

    def _attachCollectionEncodedIDInfos(self, session, artifactList):
        collectionCreatorIDConceptCollectionHandlesMap = {}
        for artifact in artifactList:
            if artifact.get('conceptCollectionHandle') and artifact.get('collectionCreatorID'):
                collectionCreatorID = artifact.get('collectionCreatorID')
                conceptCollectionHandle = artifact.get('conceptCollectionHandle')
                if collectionCreatorID not in collectionCreatorIDConceptCollectionHandlesMap:
                    collectionCreatorIDConceptCollectionHandlesMap[collectionCreatorID] = []

                if conceptCollectionHandle not in collectionCreatorIDConceptCollectionHandlesMap[collectionCreatorID]:
                    collectionCreatorIDConceptCollectionHandlesMap[collectionCreatorID].append(conceptCollectionHandle)    

        collectionContextCollectionNodeMap = {}
        if collectionCreatorIDConceptCollectionHandlesMap:
            for collectionCreatorID, conceptCollectionHandles in collectionCreatorIDConceptCollectionHandlesMap.items():
                conceptCollectionHandleInfos = self.collectionNode.getByConceptCollectionHandles(conceptCollectionHandles=conceptCollectionHandles, collectionCreatorID=collectionCreatorID, publishedOnly=True)
                for conceptCollectionHandleInfo in conceptCollectionHandleInfos:
                    conceptCollectionHandle = conceptCollectionHandleInfo.get('handle')
                    collectionCreatorID = conceptCollectionHandleInfo.get('collection').get('creatorID')
                    if conceptCollectionHandle and collectionCreatorID:
                        if (conceptCollectionHandle, collectionCreatorID) not in collectionContextCollectionNodeMap:
                            collectionContextCollectionNodeMap[(conceptCollectionHandle, collectionCreatorID)] = conceptCollectionHandleInfo

        if collectionContextCollectionNodeMap:
            for artifact in artifactList:
                if artifact.get('conceptCollectionHandle') and artifact.get('collectionCreatorID'):
                    conceptCollectionHandle = artifact.get('conceptCollectionHandle')
                    collectionCreatorID = artifact.get('collectionCreatorID')
                    if (conceptCollectionHandle, collectionCreatorID) in collectionContextCollectionNodeMap:
                        collectionNode = collectionContextCollectionNodeMap.get((conceptCollectionHandle, collectionCreatorID))
                        conceptCollectionTitle = collectionNode.get('title')
                        conceptCollectionAbsoluteHandle = collectionNode.get('absoluteHandle')
                        collectionHandle = collectionNode.get('collection').get('handle')
                        if conceptCollectionTitle:
                            artifact['conceptCollectionTitle'] = conceptCollectionTitle
                        if collectionHandle:
                            artifact['collectionHandle'] = collectionHandle
                        if conceptCollectionAbsoluteHandle:
                            artifact['conceptCollectionAbsoluteHandle'] = conceptCollectionAbsoluteHandle

        return artifactList

    def _processMigratedConcepts(self, session, concepts):
        eidMap = {}
        for concept in concepts:
            if concept.get('encodedID') and concept.get('collectionHandle'):
                eidMap[concept['encodedID']] = concept
        log.debug("_processMigratedConcepts: eidMap: %s" % str(eidMap))
        for concept in concepts:
            if concept.get('encodedID') and not concept.get('collectionHandle'):
                originalEID = concept.get('encodedID')
                if session:
                    supercedingConcept = mc._getSupercedingConcept(session, originalEID)
                else:
                    supercedingConcept = mc.getSupercedingConcept(encodedID=originalEID)
                if supercedingConcept:
                    concept['originalEncodedID'] = originalEID
                    if eidMap.has_key(supercedingConcept.encodedID):
                        log.debug("_processMigratedConcepts: Replacing %s with value of %s" % (originalEID, supercedingConcept.encodedID))
                        concept.update(eidMap.get(supercedingConcept.encodedID))
                    else:
                        concept['encodedID'] = supercedingConcept.encodedID
                        if session:
                            newDomain = api._getArtifactByEncodedID(session, encodedID=supercedingConcept.encodedID, typeName='domain')
                        else:
                            newDomain = api.getArtifactByEncodedID(encodedID=supercedingConcept.encodedID, typeName='domain')
                        if newDomain:
                            concept['id'] = newDomain.id
                            concept['handle'] = newDomain.handle
                            concept['login'] = newDomain.creator.login
                            concept['creatorID'] = newDomain.creatorID

        return concepts

    def _asDict(self, session, artifact):
        artifactType = artifact.type.name
        assignmentDict = {}
        assignmentDict['id'] = artifact.id
        assignmentDict['type'] = artifactType
        assignmentDict['name'] = artifact.name
        assignmentDict['description'] = artifact.description
        if artifactType == 'assignment':
            assignment = api._getAssignmentByID(session, id=artifact.id)
            if not assignment:
                raise ex.NotFoundException((_(u'Assignment of id %s does not exist.' % artifact.id)).encode("utf-8"))

            assignmentDict.update(assignment.asDict())
            assignmentDict['isPastDue'] = 1 if assignment.due and assignment.due < dt.now() else 0
            del assignmentDict['assignmentType']

            children = artifact.revisions[0].children
            studyTracks = []
            for child in children:
                if child.child is not None:
                    revision = child.child
                else:
                    revision = api._getArtifactRevisionByID(session, child.hasArtifactRevisionID)
                studyTracks.append(revision)
        elif artifactType == 'study-track':
            studyTracks = [ artifact.revisions[0] ]
        else:
            raise ex.InvalidArgumentException((_(u'Invalid type: %s.' % artifactType)).encode("utf-8"))

        artifactList = []
        asgns = {}
        sts = []
        for st in studyTracks:
            #
            #  Find the assignments associated with this study track.
            #
            assignmentIDs = []
            parents = api._getArtifactParents(session, st.artifactID)
            for parent in parents:
                assignmentIDs.append(parent['parentID'])
            asgns[st.artifactID] = assignmentIDs
            sts.append(st.asDict())
            #
            #  Find the concept nodes associated with this study track.
            #
            if st.children is not None:
                artifactIDs = []
                for child in st.children:
                    artifactIDs.append(child.hasArtifactRevisionID)
            else:
                artifactIDs = api._getArtifactRevisionChildren(session, st.id)
            artifactNodes = api._getArtifactRevisionsByIDs(session, artifactIDs)
            #
            #  Filter out concepts having zero modality count.
            #
            conceptEIDs = []
            for an in artifactNodes:
                if an.encodedID:
                    conceptEIDs.append(an.encodedID)

            if conceptEIDs:
                modalityCounts = api._countTotalRelatedArtifactsForDomainIDs(session, conceptEIDs, True)
                conceptEIDs = [domain[0] for domain in modalityCounts]

            ## Get context, if any
            ctxs = stic._getStudyTrackItemContexts(session, studyTrackID=st.artifactID)
            log.debug("ctxs: %s for studyTrackID: %s" % (str(ctxs), st.artifactID))
            topEID = branch = None
            for artifactRevision in artifactNodes:
                artifact = {}
                eid = artifactRevision.encodedID
                if eid and artifactRevision.artifact.type.name == 'domain':
                    artifact['encodedID'] = eid
                    #
                    #  Get the subject level handle.
                    #
                    if eid.count('.') > 1:
                        ea = eid.split('.')
                        eid = '.'.join(ea[0:2])
                    if eid != topEID:
                        topEID = eid
                        branch = api._getBrowseTermByEncodedID(session, topEID)
                    if branch:
                        artifact['branchHandle'] = branch.handle
                else:
                    a = artifactRevision.artifact
                    if not a:
                        a = api._getArtifactByID(session, id=artifactRevision.artifactID)
                    ds = a.getDomains()
                    domains = []
                    for d in ds:
                        domains.append(a._getDomainTermDict(d))
                    ## Do not add domains for artifacts which do not have a domain (eg: sections)
                    if domains:
                        artifact['domains'] = domains

                artifact['id'] = artifactRevision.id
                artifact['revisionID'] = artifactRevision.artifactRevisionID
                artifact['type'] = artifactRevision.typeName
                artifact['description'] = artifactRevision.description
                artifact['name'] = artifactRevision.name
                artifact['handle'] = artifactRevision.handle
                artifact['creatorID'] = artifactRevision.creatorID
                artifact['login'] = artifactRevision.login

                for ctx in ctxs:
                    if artifactRevision.id == ctx.get('studyTrackItemID'):
                        if ctx.get('contextUrl'):
                            artifact['contextUrl'] = ctx.get('contextUrl')
                        if ctx.get('conceptCollectionHandle'):
                            artifact['conceptCollectionHandle'] = ctx.get('conceptCollectionHandle')
                        if ctx.get('collectionCreatorID'):
                            artifact['collectionCreatorID'] = ctx.get('collectionCreatorID')
                        ctxs.remove(ctx)
                        break

                artifactList.append(artifact)

        assignmentDict['concepts'] = self._attachCollectionEncodedIDInfos(session, artifactList)
        assignmentDict['concepts'] = self._processMigratedConcepts(session, assignmentDict['concepts'])
        ## Make concept list unique after migration for many-to-one case Bug 71213
        uniqueConcepts = []
        studyTrackItemIDs = set()
        for concept in assignmentDict['concepts']:
            if concept['id'] not in studyTrackItemIDs:
                studyTrackItemIDs.add(concept['id'])
                uniqueConcepts.append(concept)
        assignmentDict['concepts'] = uniqueConcepts
        assignmentDict['assignments'] = asgns
        assignmentDict['studyTracks'] = sts
        log.debug('_asDict: assignmentDict%s' % assignmentDict)
        return assignmentDict

    @d.jsonify()
    @d.checkAuth(request, True, False, ['id'])
    @d.trace(log, ['member', 'id'])
    def get(self, member, id):
        """
            Retrieve the assignment or study track identified by id.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        c.errorCode = ErrorCodes.OK
        try:
            if not id:
                id = request.params.get('id', None)
            if not id:
                raise ex.MissingArgumentException((_(u'Assignment ID missing.')).encode("utf-8"))

            member = u.getImpersonatedMember(member)
            memberID = member.id

            tx = utils.transaction(self.getFuncName())
            with tx as session:
                artifact = api._getArtifactByID(session, id=id)
                if not artifact:
                    raise ex.NotFoundException((_(u'Artifact of id %s does not exist.' % id)).encode("utf-8"))

                if artifact.type.name not in ['assignment', 'study-track']:
                    raise ex.InvalidArgumentException((_(u'Invalid type: %s.' % artifact.type.name)).encode("utf-8"))

                if memberID != artifact.creatorID and not u.isMemberAdmin(member, session=session):
                    assignment = api._getAssignmentByID(session, id=artifact.id)
                    mg = api._getMemberGroup(session, id=memberID, groupID=assignment.groupID)
                    if not mg:
                        raise ex.UnauthorizedException((_(u'Assignments can only be viewed by its members.')).encode("utf-8"))

                result['response']['assignment'] = self._asDict(session, artifact)
            return result
        except ex.NotFoundException, iae:
            log.debug('get: Not Found Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.NO_SUCH_ARTIFACT
            return ErrorCodes().asDict(c.errorCode, str(iae))
        except ex.InvalidArgumentException, iae:
            log.debug('get: Invalid Argument Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.INVALID_ARGUMENT
            return ErrorCodes().asDict(c.errorCode, str(iae))
        except ex.UnauthorizedException, uae:
            log.debug('get: Unauthorized Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
            return ErrorCodes().asDict(c.errorCode, str(uae))
        except Exception, e:
            log.debug('get: Exception[%s] traceback' %(traceback.format_exc()))
            if c.errorCode == ErrorCodes.OK:
                c.errorCode = ErrorCodes.NO_SUCH_ARTIFACT
            return ErrorCodes().asDict(c.errorCode, str(e))


    def _extractCollectionInfosForEncodedIDs(self, session, encodedIDs, processEncodedIDsForDeletedStatus=False):
        encodedIDCollectionInfoMap = {}
        if encodedIDs:
            if processEncodedIDsForDeletedStatus:
                encodedIDConceptInfos = self.conceptNode.getByEncodedIDs(encodedIDs)
                deletedEncodedIDs = []
                deletedRedirectedReferences = []
                deletedRedirectedReferencesToEncodedIDMap = {}
                for encodedIDConceptInfo in encodedIDConceptInfos:
                    encodedID =  encodedIDConceptInfo.get('encodedID')
                    handle = encodedIDConceptInfo.get('handle')
                    oldHandles = encodedIDConceptInfo.get('oldHandles')
                    status = encodedIDConceptInfo.get('status')
                    if  status == 'deleted' and  encodedID:
                        deletedEncodedIDs.append(encodedID)
                        deletedRedirectedReferences.append(encodedID)
                        deletedRedirectedReferencesToEncodedIDMap[encodedID] = encodedID
                        if handle:
                            deletedRedirectedReferences.append(handle)
                            deletedRedirectedReferencesToEncodedIDMap[handle] = encodedID
                        if oldHandles:
                            for oldHandle in oldHandles:
                                deletedRedirectedReferences.append(oldHandle) 
                                deletedRedirectedReferencesToEncodedIDMap[oldHandle] = encodedID                              

                #if there are any deleted encodedIDs, get the EIDs they are redirected to now
                redirectedEncodedIDToActualDeletedEncodedIDsMap = {}
                if deletedRedirectedReferences:
                    deletedRedirectedReferenceConceptInfos = self.conceptNode.getByRedirectedReferences(redirectedReferences=deletedRedirectedReferences)
                    for deletedRedirectedReferenceConceptInfo in deletedRedirectedReferenceConceptInfos:
                        encodedID = deletedRedirectedReferenceConceptInfo.get('encodedID')
                        if encodedID:
                            redirectedReferences = deletedRedirectedReferenceConceptInfo.get('redirectedReferences')
                            for redirectedReference in redirectedReferences:
                                if redirectedReference in deletedRedirectedReferencesToEncodedIDMap:
                                    deletedEncodedID = deletedRedirectedReferencesToEncodedIDMap[redirectedReference]
                                    if not encodedID in redirectedEncodedIDToActualDeletedEncodedIDsMap:
                                        redirectedEncodedIDToActualDeletedEncodedIDsMap[encodedID] = []
                                    redirectedEncodedIDToActualDeletedEncodedIDsMap[encodedID].append(deletedEncodedID)

                processedEncodedIDs = list((set(encodedIDs) - set(deletedEncodedIDs)).union(set(redirectedEncodedIDToActualDeletedEncodedIDsMap.keys())))
            else:
                processedEncodedIDs = encodedIDs

            if session:
                ck12editor = api._getMemberByLogin(session, login='ck12editor')
            else:
                ck12editor = api.getMemberByLogin(login='ck12editor')
            collectionCreatorID = ck12editor.id
            encodedIDCollectionInfos = self.collectionNode.getByEncodedIDs(eIDs=processedEncodedIDs, collectionCreatorID=collectionCreatorID, publishedOnly=True, canonicalOnly=True)
            for encodedIDCollectionInfo in encodedIDCollectionInfos:
                encodedID = encodedIDCollectionInfo.get('encodedID')
                conceptCollectionHandle = encodedIDCollectionInfo.get('handle')
                collectionCreatorID = encodedIDCollectionInfo.get('collection').get('creatorID')
                if conceptCollectionHandle and collectionCreatorID and encodedID:
                    if encodedID in encodedIDs:
                        encodedIDCollectionInfoMap[encodedID] = {}
                        encodedIDCollectionInfoMap[encodedID]['conceptCollectionHandle'] = conceptCollectionHandle
                        encodedIDCollectionInfoMap[encodedID]['collectionCreatorID'] = collectionCreatorID
                    elif encodedID in redirectedEncodedIDToActualDeletedEncodedIDsMap:
                        for actualDeletedEncodedID in redirectedEncodedIDToActualDeletedEncodedIDsMap.get(encodedID):
                            encodedIDCollectionInfoMap[actualDeletedEncodedID] = {}
                            encodedIDCollectionInfoMap[actualDeletedEncodedID]['conceptCollectionHandle'] = conceptCollectionHandle
                            encodedIDCollectionInfoMap[actualDeletedEncodedID]['collectionCreatorID'] = collectionCreatorID
                            encodedIDCollectionInfoMap[actualDeletedEncodedID]['redirectedEncodedID'] = encodedID 
        return encodedIDCollectionInfoMap

    def generateSelfStudyDictsFromCollectionFirstLevelNodeInfos(self, collectionFirstLevelNodeInfos, conceptCollectionNodeInfosToMemberSelfStudyInfosMap={}):
        collectionFirstLevelNodes = []
        collectionFirstLevelNodeInfosToDescendantNodesWithEncodedIDMap = {}
        descendantNodeEncodedIDs = []
        for collectionFirstLevelNodeInfo in collectionFirstLevelNodeInfos:
            collectionHandle = collectionFirstLevelNodeInfo[0]
            collectionCreatorID = collectionFirstLevelNodeInfo[1]
            collectionFirstLevelNodeIdentifier = collectionFirstLevelNodeInfo[2]
            collectionFirstLevelDescendantNodes = self.collectionNode.getDescedantNodesByCollectioHandleCreatorIDAndIdentifier(collectionHandle, collectionCreatorID, collectionFirstLevelNodeIdentifier)
            for collectionFirstLevelDescendantNode in collectionFirstLevelDescendantNodes:
                if collectionFirstLevelDescendantNode.get('descendantIdentifier') == collectionFirstLevelNodeIdentifier:
                    collectionFirstLevelNodes.append(collectionFirstLevelDescendantNode)
                else:
                    collectionFirstLevelDescendantNodeEncodedID = collectionFirstLevelDescendantNode.get('encodedID')
                    if collectionFirstLevelDescendantNodeEncodedID:
                        if (collectionHandle, collectionCreatorID, collectionFirstLevelNodeIdentifier) not in collectionFirstLevelNodeInfosToDescendantNodesWithEncodedIDMap:
                            collectionFirstLevelNodeInfosToDescendantNodesWithEncodedIDMap[(collectionHandle, collectionCreatorID, collectionFirstLevelNodeIdentifier)] = []  
                        collectionFirstLevelNodeInfosToDescendantNodesWithEncodedIDMap[(collectionHandle, collectionCreatorID, collectionFirstLevelNodeIdentifier)].append(collectionFirstLevelDescendantNode)
                        descendantNodeEncodedIDs.append(collectionFirstLevelDescendantNodeEncodedID)
                    else:
                        #some intermediate descendantNode - Can be ignored
                        pass

        descendantNodeEncodedIDArtifacts = api.getArtifactsByEncodedIDs(descendantNodeEncodedIDs, creatorID=1, artifactTypeID=g.getArtifactTypes()['domain'])
        descendantNodeEncodedIDToArtifactInfoMap = {}
        for descendantNodeEncodedIDArtifact in descendantNodeEncodedIDArtifacts:
            artifactEncodedID = descendantNodeEncodedIDArtifact.encodedID
            artifactTitle = descendantNodeEncodedIDArtifact.name
            artifactHandle = descendantNodeEncodedIDArtifact.handle
            if artifactEncodedID not in descendantNodeEncodedIDToArtifactInfoMap:
                descendantNodeEncodedIDToArtifactInfoMap[artifactEncodedID] = {}
                descendantNodeEncodedIDToArtifactInfoMap[artifactEncodedID]['conceptHandle'] = artifactHandle
                descendantNodeEncodedIDToArtifactInfoMap[artifactEncodedID]['conceptTitle'] = artifactTitle

        selfStudyDicts = []
        for collectionFirstLevelNode in collectionFirstLevelNodes:
            selfStudyDict = {}
            selfStudyDict['title'] = collectionFirstLevelNode.get('title')
            selfStudyDict['description'] = collectionFirstLevelNode.get('description')

            if collectionFirstLevelNode.get('collection'):
                if collectionFirstLevelNode['collection'].get('title'):
                     selfStudyDict['collectionTitle'] = collectionFirstLevelNode['collection']['title']

                if collectionFirstLevelNode['collection'].get('canonicalID'):
                     selfStudyDict['collectionCanonicalEncodedID'] = collectionFirstLevelNode['collection']['canonicalID']

                if collectionFirstLevelNode['collection'].get('handle'):
                    selfStudyDict['collectionHandle']  = collectionFirstLevelNode['collection']['handle']

                if collectionFirstLevelNode['collection'].get('creatorID'):
                    selfStudyDict['collectionCreatorID']  = collectionFirstLevelNode['collection']['creatorID']                    

                if collectionFirstLevelNode['collection'].get('handle') and collectionFirstLevelNode['collection'].get('creatorID') and collectionFirstLevelNode.get('descendantIdentifier'):
                    collectionHandle = collectionFirstLevelNode['collection']['handle']
                    collectionCreatorID = collectionFirstLevelNode['collection']['creatorID']  
                    collectionFirstLevelNodeIdentifier = collectionFirstLevelNode['descendantIdentifier']
                    collectionFirstLevelNodeInfo = (collectionHandle, collectionCreatorID, collectionFirstLevelNodeIdentifier)
                    if collectionFirstLevelNodeInfo in collectionFirstLevelNodeInfosToDescendantNodesWithEncodedIDMap:
                        collectionFirstLevelDescendantNodesWithEncodedID = collectionFirstLevelNodeInfosToDescendantNodesWithEncodedIDMap[collectionFirstLevelNodeInfo]
                        selfStudyDict['totalCount'] = len(collectionFirstLevelDescendantNodesWithEncodedID)
                        completedCount = 0
                        conceptDicts = []
                        for collectionFirstLevelDescendantNodeWithEncodedID in collectionFirstLevelDescendantNodesWithEncodedID:
                            conceptDict = {}
                            conceptEncodedID = collectionFirstLevelDescendantNodeWithEncodedID.get('encodedID')
                            conceptCollectionHandle = collectionFirstLevelDescendantNodeWithEncodedID.get('handle')
                            conceptCollectionTitle = collectionFirstLevelDescendantNodeWithEncodedID.get('title')
                            conceptCollectionDescendantIdentifier = collectionFirstLevelDescendantNodeWithEncodedID.get('descendantIdentifier')

                            conceptDict['conceptEncodedID'] = conceptEncodedID
                            conceptDict['conceptCollectionHandle'] = conceptCollectionHandle
                            conceptDict['conceptCollectionTitle'] = conceptCollectionTitle
                            conceptDict['conceptCollectionDescendantIdentifier'] = conceptCollectionDescendantIdentifier
                            if collectionFirstLevelDescendantNodeWithEncodedID.get('collection') and collectionFirstLevelDescendantNodeWithEncodedID['collection'].get('creatorID'):
                                collectionCreatorID = collectionFirstLevelDescendantNodeWithEncodedID['collection']['creatorID']
                                conceptDict['collectionCreatorID'] = collectionCreatorID
                            if (conceptEncodedID, conceptCollectionHandle, collectionCreatorID) in conceptCollectionNodeInfosToMemberSelfStudyInfosMap:
                                conceptDict.update(conceptCollectionNodeInfosToMemberSelfStudyInfosMap[(conceptEncodedID, conceptCollectionHandle, collectionCreatorID)])                                       
                            else:
                                conceptDict['status'] = 'incomplete'
                            if conceptEncodedID in descendantNodeEncodedIDToArtifactInfoMap:
                                conceptDict.update(descendantNodeEncodedIDToArtifactInfoMap[conceptEncodedID])
                            if conceptDict['status'] == 'completed':
                                completedCount = completedCount+1
                            conceptDicts.append(conceptDict)
                        
                        selfStudyDict['concepts'] = conceptDicts
                        selfStudyDict['completedCount'] = completedCount
                        selfStudyDict['incompleteCount'] = selfStudyDict['totalCount'] - selfStudyDict['completedCount']
            selfStudyDicts.append(selfStudyDict)
        return selfStudyDicts

    #collectionFirstLevelNodes are what we refer as topics
    #firstLevelNodeInfos and collectionNodeInfosToMemberSelfStudyInfosMap 
    def getLatestCFLNodeInfosAndCCNodeInfosToMSSInfosMapFromSelfStudies(self, memberID, offset=0, limit=10):
        memberSelfStudyItemStatuses = api.getMemberSelfStudyItemStatusesByMemberID(memberID, offset=offset, limit=limit)
        conceptCollectionNodeInfosToMemberSelfStudyInfosMap = {}
        collectionCreatorIDToConceptCollectionHandlesMap = {}
        conceptCollectionHandleCollectionCreatorIDToRankIDMap = {}
        rankID = 1
        for memberSelfStudyItemStatus in memberSelfStudyItemStatuses:
            conceptCollectionHandle = memberSelfStudyItemStatus.conceptCollectionHandle 
            collectionCreatorID = memberSelfStudyItemStatus.collectionCreatorID 
            conceptEncodedID = memberSelfStudyItemStatus.item.encodedID
            if conceptCollectionHandle and collectionCreatorID and conceptEncodedID: 
                if collectionCreatorID not in collectionCreatorIDToConceptCollectionHandlesMap:
                    collectionCreatorIDToConceptCollectionHandlesMap[collectionCreatorID] = []
                collectionCreatorIDToConceptCollectionHandlesMap[collectionCreatorID].append(conceptCollectionHandle)
                conceptCollectionHandleCollectionCreatorIDToRankIDMap[(conceptCollectionHandle, collectionCreatorID)] = rankID
                rankID = rankID+1

            selfStudyItemStatusDict = {
                'contextUrl': memberSelfStudyItemStatus.contextUrl,
                'lastAccessTime': memberSelfStudyItemStatus.lastAccess,
                'score': memberSelfStudyItemStatus.score,
                'status': memberSelfStudyItemStatus.status
            }
            conceptCollectionNodeInfosToMemberSelfStudyInfosMap[(conceptEncodedID, conceptCollectionHandle, collectionCreatorID)] =  selfStudyItemStatusDict 

        #Retrieve the first level node infos
        collectionFirstLevelNodeInfos = [] 
        for collectionCreatorID in collectionCreatorIDToConceptCollectionHandlesMap:
            conceptCollectionHandles = collectionCreatorIDToConceptCollectionHandlesMap[collectionCreatorID]
            conceptCollectionNodes = self.collectionNode.getByConceptCollectionHandles(conceptCollectionHandles, collectionCreatorID, publishedOnly=True)
            for conceptCollectionNode in conceptCollectionNodes:
                if conceptCollectionNode.get('collection') and conceptCollectionNode['collection'].get('handle') and conceptCollectionNode.get('descendantIdentifier'):
                    actualDescendantConceptCollectionHandle = conceptCollectionNode['handle']
                    collectionHandle = conceptCollectionNode['collection']['handle']
                    conceptCollectionDescendantIdentifier = conceptCollectionNode['descendantIdentifier']
                    collectionFirstLevelNodeIdentifer = conceptCollectionDescendantIdentifier.split('.')[0]
                    if (collectionHandle, collectionCreatorID, collectionFirstLevelNodeIdentifer, actualDescendantConceptCollectionHandle) not in collectionFirstLevelNodeInfos:
                        collectionFirstLevelNodeInfos.append((collectionHandle, collectionCreatorID, collectionFirstLevelNodeIdentifer, actualDescendantConceptCollectionHandle))
        
        collectionFirstLevelNodeInfos = sorted(collectionFirstLevelNodeInfos, key=lambda x:conceptCollectionHandleCollectionCreatorIDToRankIDMap.get((x[3], x[1])))
        processedCollectionFirstLevelNodeInfos = []
        for collectionFirstLevelNodeInfo in collectionFirstLevelNodeInfos:
            processedCollectionFirstLevelNodeInfo = (collectionFirstLevelNodeInfo[0], collectionFirstLevelNodeInfo[1], collectionFirstLevelNodeInfo[2])
            if processedCollectionFirstLevelNodeInfo not in processedCollectionFirstLevelNodeInfos:
                processedCollectionFirstLevelNodeInfos.append(processedCollectionFirstLevelNodeInfo)
        return processedCollectionFirstLevelNodeInfos, conceptCollectionNodeInfosToMemberSelfStudyInfosMap

    def getMyLatestSelfStudies(self, memberID, requiredNumberOfSelfStudies=3):
        offset = 0
        limit = 10
        collectionFirstLevelNodeInfos = []
        conceptCollectionNodeInfosToMemberSelfStudyInfosMap = {}
        while len(collectionFirstLevelNodeInfos) < requiredNumberOfSelfStudies:
            collectionFirstLevelNodeInfosFromLastIteration, conceptCollectionNodeInfosToMemberSelfStudyInfosMapFromLastIteration = self.getLatestCFLNodeInfosAndCCNodeInfosToMSSInfosMapFromSelfStudies(memberID, offset, limit)
            if collectionFirstLevelNodeInfosFromLastIteration:
                for collectionFirstLevelNodeInfoFromLastIteration in collectionFirstLevelNodeInfosFromLastIteration:
                    if len(collectionFirstLevelNodeInfos) < requiredNumberOfSelfStudies and collectionFirstLevelNodeInfoFromLastIteration not in collectionFirstLevelNodeInfos:
                        collectionFirstLevelNodeInfos.append(collectionFirstLevelNodeInfoFromLastIteration)
                    else:
                        break
                conceptCollectionNodeInfosToMemberSelfStudyInfosMap.update(conceptCollectionNodeInfosToMemberSelfStudyInfosMapFromLastIteration)
                offset = offset + limit
            else:
                break
        return self.generateSelfStudyDictsFromCollectionFirstLevelNodeInfos(collectionFirstLevelNodeInfos, conceptCollectionNodeInfosToMemberSelfStudyInfosMap)


    def getMySelfStudiesByCollection(self, memberID, collectionHandle, collectionCreatorID):
        #Actual level of first level children would be '2' including root node
        #Use the paramters from the mongoDB result as the received parameters can be in different case
        collectionFirstLevelNodes = self.collectionNode.getConceptsForCollection(collectionHandle, collectionCreatorID, level=2)
        collectionFirstLevelNodeInfos = []
        for collectionFirstLevelNode in collectionFirstLevelNodes:
            if collectionFirstLevelNode.get('collection') and collectionFirstLevelNode['collection'].get('handle') and collectionFirstLevelNode['collection'].get('creatorID') and collectionFirstLevelNode.get('descendantIdentifier'):
                collectionFirstLevelNodeInfos.append((collectionFirstLevelNode['collection']['handle'], collectionFirstLevelNode['collection']['creatorID'], collectionFirstLevelNode['descendantIdentifier']))
        
        selfStudyDicts = []
        if collectionFirstLevelNodeInfos:        
            memberSelfStudyItemStatuses = api.getMemberSelfStudyItemStatusesByMemberID(memberID, collectionHandle=collectionHandle, collectionCreatorID=collectionCreatorID)
            conceptCollectionNodeInfosToMemberSelfStudyInfosMap = {}
            for memberSelfStudyItemStatus in memberSelfStudyItemStatuses:
                conceptCollectionHandle = memberSelfStudyItemStatus.conceptCollectionHandle 
                collectionCreatorID = memberSelfStudyItemStatus.collectionCreatorID 
                conceptEncodedID = memberSelfStudyItemStatus.item.encodedID
                selfStudyItemStatusDict = {
                    'contextUrl': memberSelfStudyItemStatus.contextUrl,
                    'lastAccessTime': memberSelfStudyItemStatus.lastAccess,
                    'score': memberSelfStudyItemStatus.score,
                    'status': memberSelfStudyItemStatus.status
                }
                conceptCollectionNodeInfosToMemberSelfStudyInfosMap[(conceptEncodedID, conceptCollectionHandle, collectionCreatorID)] =  selfStudyItemStatusDict 
            selfStudyDicts = self.generateSelfStudyDictsFromCollectionFirstLevelNodeInfos(collectionFirstLevelNodeInfos, conceptCollectionNodeInfosToMemberSelfStudyInfosMap)
        return selfStudyDicts
    
    @d.jsonify()
    @d.checkAuth(request, False, False, ['detailed', 'groupID'])
    @d.filterable(request, ['member', 'detailed', 'groupID'], noformat=True)
    @d.setPage(request, ['member', 'detailed', 'groupID', 'fq'])
    @d.trace(log, ['member', 'detailed', 'pageNum', 'pageSize', 'groupID', 'fq'])
    def getMySelfStudies(self, member, detailed, pageNum, pageSize, groupID=None, fq=None):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            #Support for groupID & fq?            
            memberID = member.id

            limit = request.params.get('limit', 3)
            if limit:
                try :
                    limit=long(limit)
                except (ValueError, TypeError) as e:
                    raise ex.InvalidArgumentException(u"Invalid value for limit : [{limit}] received.".format(limit=limit).encode('utf-8'))
                if limit <=0:
                    raise ex.InvalidArgumentException(u"Invalid value for limit : [{limit}] received.".format(limit=limit).encode('utf-8'))  

            collectionHandle = request.params.get('collectionHandle', None)
            if collectionHandle:
                collectionHandle = collectionHandle.lower()
            collectionCreatorID = request.params.get('collectionCreatorID', None)
            if collectionCreatorID:
                try :
                    collectionCreatorID=long(collectionCreatorID)
                except (ValueError, TypeError) as e:
                    raise ex.InvalidArgumentException(u"Invalid value for collectionCreatorID : [{collectionCreatorID}] received.".format(collectionCreatorID=collectionCreatorID).encode('utf-8'))
                if collectionCreatorID <=0:
                    raise ex.InvalidArgumentException(u"Invalid value for collectionCreatorID : [{collectionCreatorID}] received.".format(collectionCreatorID=collectionCreatorID).encode('utf-8'))            
            if (collectionHandle and not collectionCreatorID) or (not collectionHandle and collectionCreatorID):
                raise ex.InvalidArgumentException(u"Invalid value for collectionHandle : [{collectionHandle}] - collectionCreatorID: [{collectionCreatorID}] combination received.".format(collectionHandle=collectionHandle, collectionCreatorID=collectionCreatorID).encode('utf-8'))  

            if collectionHandle and collectionCreatorID:
                #we should return all the first level nodes (refered as topics) for this collection
                selfStudyDicts = self.getMySelfStudiesByCollection(memberID, collectionHandle, collectionCreatorID)
            else:
                #we should return last 'limit' number of first level nodes across collections
                selfStudyDicts = self.getMyLatestSelfStudies(memberID, requiredNumberOfSelfStudies=limit)
                
            responseDict = {}
            responseDict['selfStudies'] = selfStudyDicts
            result['response'] = responseDict
            return result
        except ex.UnauthorizedException, uae:
            log.debug('getMySelfStudies: Unauthorized Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
            return ErrorCodes().asDict(c.errorCode, str(uae))
        except ex.MissingArgumentException, mae:
            log.debug('getMySelfStudies: Missing Argument Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
            return ErrorCodes().asDict(c.errorCode, str(mae))
        except ex.InvalidArgumentException, iae:
            log.debug('getMySelfStudies: Invalid Argument Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.INVALID_ARGUMENT
            return ErrorCodes().asDict(c.errorCode, str(iae))
        except Exception:
            log.debug('getMySelfStudies: Cannot fetch assignments for the user [%s] due to exception [%s]' %(member.id, traceback.format_exc()))
            c.errorCode = ErrorCodes.CANNOT_LOAD_ASSIGNMENTS
            return ErrorCodes().asDict(c.errorCode, 'Cannot fetch assignments for the user [%s]' %(member.id))

    def __getSelfStudyConceptsForStudyTrack(self, session, studyTrackID):
        @d.ck12_cache_region('daily')
        def __getSelfStudyConceptsForStudyTrackCached(studyTrackID):
            log.debug("Processing children for %s" % studyTrackID)
            studyTrackType = api._getArtifactTypeByName(session, typeName="study-track")
            artifact = api._getArtifactByID(session, id=studyTrackID)
            ids = []
            if artifact.artifactTypeID == studyTrackType.id:
                children = artifact.revisions[0].children
                for child in children:
                    revision = api._getArtifactRevisionByID(session, id=child.hasArtifactRevisionID)
                    artifactID = revision.artifactID
                    ids.append(artifactID)
            return ids
        return __getSelfStudyConceptsForStudyTrackCached(studyTrackID)

    @d.jsonify()
    @d.checkAuth(request, False, False, ['id', 'detailed', 'groupID'])
    @d.filterable(request, ['member', 'id', 'detailed', 'groupID'], noformat=True)
    @d.setPage(request, ['member', 'id', 'detailed', 'groupID', 'fq'])
    @d.trace(log, ['member', 'id', 'detailed', 'pageNum', 'pageSize', 'groupID', 'fq'])
    def getMyAssignment(self, id, member, detailed, pageNum, pageSize, groupID=None, fq=None):
        detailed = detailed and detailed.lower() == 'true'
        assignmentType = 'assignment'
        try:
            id = long(id)
        except ValueError:
            ## Fix the issue where the same assignmentID comes as a comma-separated list
            if ',' in id:
                id = id.split(',')[0].strip()
                id = long(id)
        return self._memberAssignments(member, assignmentType, fq, groupID=groupID, detailed=detailed, assignmentID=id, pageNum=pageNum, pageSize=pageSize)

    @d.jsonify()
    @d.checkAuth(request, False, False, ['detailed', 'groupID'])
    @d.sortable(request, ['member', 'detailed', 'groupID'])
    @d.filterable(request, ['member', 'detailed', 'groupID', 'sort'], noformat=True)
    @d.setPage(request, ['member', 'detailed', 'groupID', 'fq', 'sort'])
    @d.trace(log, ['member', 'detailed', 'pageNum', 'pageSize', 'groupID', 'fq', 'sort'])
    def getMyAssignments(self, member, detailed, pageNum, pageSize, groupID=None, fq=None, sort=None):
        detailed = detailed and detailed.lower() == 'true'
        assignmentType = 'assignment'
        return self._memberAssignments(member, assignmentType, fq, sort=sort, groupID=groupID, detailed=detailed, pageNum=pageNum, pageSize=pageSize)

    @d.jsonify()
    @d.checkAuth(request, False, False, ['groupID', 'assignmentType', 'detailed'])
    @d.sortable(request, ['member', 'groupID', 'assignmentType', 'detailed'])
    @d.filterable(request, ['member','groupID','assignmentType', 'detailed', 'sort'], noformat=True)
    @d.setPage(request, ['member', 'groupID','assignmentType', 'detailed','fq', 'sort'])
    @d.trace(log, ['member', 'groupID', 'assignmentType', 'detailed', 'fq', 'sort', 'pageNum', 'pageSize'])
    def groupMemberAssignments(self, member, assignmentType, detailed, groupID, pageNum, pageSize, fq=None, sort=None):
        detailed = detailed and detailed.lower() == 'true'

        #if not fq or not groupID:
        #    raise ex.MissingArgumentException((_(u'Missing required arguments')).encode("utf-8"))
        return self._memberAssignments(member, assignmentType, fq, sort=sort, groupID=groupID, detailed=detailed, pageNum=pageNum, pageSize=pageSize)

    def _getNodes(self, session, artifacts):
        nodes = []
        if artifacts:
            nodeIDs = artifacts.split(',')
            for nodeID in nodeIDs:
                if not nodeID:
                    continue
                ctxUrl = ''
                conceptCollectionHandle = ''
                collectionCreatorID = 0
                log.debug('_getNodes: nodeID[%s]' % nodeID)

                nodeIDPipeCount = nodeID.count('|')
                if nodeIDPipeCount > 0:
                    if nodeIDPipeCount == 3:
                        nodeID, ctxUrl, conceptCollectionHandle, collectionCreatorID = nodeID.split('|')
                        conceptCollectionHandle = conceptCollectionHandle.lower()
                        if collectionCreatorID == '':
                            collectionCreatorID = 0
                        if (conceptCollectionHandle and not collectionCreatorID) or (not conceptCollectionHandle and collectionCreatorID):
                            raise Exception((_(u"Invalid nodeID[%s] parameter received. nodeID (actualNodeID | ctxUrl | conceptCollectionHandle | collectionCreatorID) should either contain / not contain  conceptCollectionHandle & collectionCreatorID togeather." % nodeID)).encode("utf-8"))
                        if collectionCreatorID:
                            try :
                                collectionCreatorID=long(collectionCreatorID)
                            except (ValueError, TypeError) as e:
                                raise ex.InvalidArgumentException(u"Invalid value for collectionCreatorID : [{collectionCreatorID}] received.".format(collectionCreatorID=collectionCreatorID).encode('utf-8'))
                            if collectionCreatorID <=0:
                                raise ex.InvalidArgumentException(u"Invalid value for collectionCreatorID : [{collectionCreatorID}] received.".format(collectionCreatorID=collectionCreatorID).encode('utf-8'))
                    elif nodeIDPipeCount == 1:
                        nodeID, ctxUrl = nodeID.split('|')
                    elif nodeIDPipeCount == 0:
                        nodeID = nodeID
                        ctxUrl = None
                    else:
                        raise Exception((_(u"Invalid nodeID[%s] parameter received. nodeID (actualNodeID | ctxUrl | conceptCollectionHandle | collectionCreatorID) can contain at either three or one or zero occurences of '|' character. " % nodeID)).encode("utf-8"))
                    
                #
                #  If the id is encodedID, convert it to the internal ID.
                #
                try:
                    nodeID = long(nodeID)
                    node = api._getArtifactByID(session, nodeID)
                    log.debug('_getNodes: ID node[%s]' % node)
                    if not node:
                        c.errorCode = ErrorCodes.NO_SUCH_ARTIFACT
                        raise Exception((_(u'No such concept node[%s].' % nodeID)).encode("utf-8"))
                except ValueError:
                    node = api._getArtifactByEncodedID(session, nodeID)
                    log.debug('_getNodes: encodedID node[%s]' % node)
                    if not node:
                        c.errorCode = ErrorCodes.NO_SUCH_ARTIFACT
                        raise Exception((_(u'No such concept node[%s].' % nodeID)).encode("utf-8"))

                if node.type.name == 'domain':
                    if not node.encodedID:
                        raise Exception((_(u'Invalid concept node[%s].' % nodeID)).encode("utf-8"))

                    #Check for the existence of browseTerm
                    browseTerm = api._getBrowseTermByEncodedID(session, node.encodedID)
                    if not browseTerm:
                        raise Exception((_(u'No such domain[%s].' % node.encodedID)).encode("utf-8"))

                    #Check that collectionContext is mandatorily present
                    if not conceptCollectionHandle or not collectionCreatorID:
                        raise Exception((_(u"Invalid nodeID[%s] parameter received. nodeID should mandatorily contain conceptCollectionHandle & collectionCreatorID (if it is domain typed)." % nodeID)).encode("utf-8"))

                    #Check this domainID is valid for the received collectionContext - it has some artifacts attached (must be ck12)
                    artifactCount = api._countTotalRelatedArtifactsForDomain(session, browseTerm.id, publishedOnly=True, ck12Only=True, conceptCollectionHandle=conceptCollectionHandle, collectionCreatorID=collectionCreatorID)
                    if artifactCount == 0:
                        raise Exception((_(u"Invalid nodeID[%s] parameter received. nodeID is not valid under the received collectionContext - [%s : %d]" %(nodeID, conceptCollectionHandle, collectionCreatorID))).encode("utf-8"))
                elif node.type.modality:
                    if node.type.name == 'asmtpractice' and not (conceptCollectionHandle and collectionCreatorID):
                        ## If there is no collectionContext, we add a default one
                        contextInfo = session.query(model.RelatedArtifactsAndLevels).filter(
                                model.RelatedArtifactsAndLevels.id == node.id, 
                                model.RelatedArtifactsAndLevels.conceptCollectionHandle != '', 
                                model.RelatedArtifactsAndLevels.collectionCreatorID == 3,
                                model.RelatedArtifactsAndLevels.publishTime != None).first()
                        if contextInfo:
                            conceptCollectionHandle = contextInfo.conceptCollectionHandle
                            collectionCreatorID = contextInfo.collectionCreatorID
                        else:
                            raise Exception((_(u"Either the practice modality is unpublished or there is no collection context for it: %s." % (nodeID))).encode("utf-8"))
                    else:
                        ## For modality assignments (except for section), the given context must exist in RelatedArtifacts
                        query = session.query(func.count(meta.RelatedArtifactsAndLevels.c.domainID)).filter(
                                meta.RelatedArtifactsAndLevels.c.id == node.id, 
                                meta.RelatedArtifactsAndLevels.c.conceptCollectionHandle == conceptCollectionHandle, 
                                meta.RelatedArtifactsAndLevels.c.collectionCreatorID==collectionCreatorID)
                        if node.type.name == 'asmtpractice':
                            query = query.filter(meta.RelatedArtifactsAndLevels.c.publishTime != None)
                        domainCountInfo = query.first()
                        domainCount = domainCountInfo[0] if domainCountInfo else 0
                        if domainCount == 0:
                            if node.type.name == 'asmtpractice':
                                raise Exception((_(u"Invalid nodeID[%s] parameter received. nodeID is not valid or is unpublished under the received collectionContext - [%s : %d]" %(nodeID, conceptCollectionHandle, collectionCreatorID))).encode("utf-8"))
                            raise Exception((_(u"Invalid nodeID[%s] parameter received. nodeID is not valid or under the received collectionContext - [%s : %d]" %(nodeID, conceptCollectionHandle, collectionCreatorID))).encode("utf-8"))

                if ctxUrl:
                    node.contextUrl = urllib.unquote(ctxUrl)
                if conceptCollectionHandle:
                    node.conceptCollectionHandle = conceptCollectionHandle
                if collectionCreatorID:
                    node.collectionCreatorID = collectionCreatorID
                if node in nodes:
                  raise Exception((_(u'Duplicate nodeID: [%s] received.' % nodeID)).encode("utf-8"))
                nodes.append(node)
        if not nodes:
            raise Exception((_(u'No concept node provided.')).encode("utf-8"))
        return nodes

    @d.jsonify()
    @d.checkAuth(request, False, False)
    @d.trace(log, ['member'])
    def createStudyTrack(self, member):
        """
            Creates a new study track.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        c.errorCode = ErrorCodes.OK
        try:
            name = request.params.get('name', None)
            description = request.params.get('description', None)
            concepts = request.params.get('concepts', None)
            handle = request.params.get('handle', None)
            if name:
                name = name.strip()
            if not name:
                raise ex.MissingArgumentException((_(u'Name missing.')).encode("utf-8"))
            if not concepts:
                concepts = concepts.strip()
                if not concepts:
                    raise ex.MissingArgumentException((_(u'Study track missing.')).encode("utf-8"))
            if not handle:
                handle = model.title2Handle(name)

            tx = utils.transaction(self.getFuncName())
            with tx as session:
                nodes = self._getNodes(session, concepts)
                if not nodes:
                    raise ex.InvalidArtifactException((_(u'Incorrect concepts provided.')).encode("utf-8"))
                studyTrack = api._createStudyTrack(session,
                                                   creator=member,
                                                   name=name,
                                                   handle=handle,
                                                   description=description,
                                                   nodes=nodes)
                stDict = self._asDict(session, studyTrack)
                log.debug('Create studyTrack[%s]' % stDict)

                result['response']['assignment'] = stDict
            return result
        except ex.MissingArgumentException, mae:
            log.debug('Create studyTrack: Missing Argument Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
            return ErrorCodes().asDict(c.errorCode, str(mae))
        except ex.InvalidArtifactException, iae:
            log.debug('Create studyTrack: Invalid Artifact Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.INVALID_ARGUMENT
            return ErrorCodes().asDict(c.errorCode, str(iae))
        except Exception, e:
            log.debug('Create studyTrack Exception[%s] traceback' %(traceback.format_exc()))
            if c.errorCode == ErrorCodes.OK:
                c.errorCode = ErrorCodes.CANNOT_CREATE_ASSIGNMENT
            return ErrorCodes().asDict(c.errorCode, str(e))

    def _updateMemberStudyTrackItems(self, session, assignmentID, children, memberID=None, groupMembers=None):
        log.debug('_updateMemberStudyTrackItems: assignmentID[%s]' % assignmentID)
        log.debug('_updateMemberStudyTrackItems: children[%s]' % children)
        assignment = api._getAssignmentByID(session, id=assignmentID)
        #
        #  Find all the status entries for this member/group of this assignment.
        #
        if memberID:
            #
            #  Skip if the member was not assigned to this assignment.
            #
            gm = api._getMemberGroup(session, memberID, groupID=assignment.groupID)
            if not gm:
                return

            memberIDs = [ memberID ]
        else:
            memberIDs = []
            if not groupMembers:
                return

            for groupMember in groupMembers:
                memberIDs.append(groupMember.memberID)
        log.debug('_updateMemberStudyTrackItems: memberIDs[%s]' % memberIDs)

        nodeStatusList = api._getMemberStudyTrackStatus(session,
                                                        memberIDs=memberIDs,
                                                        assignmentID=assignmentID)
        log.debug('_updateMemberStudyTrackItems: nodeStatusList[%s]' % nodeStatusList)
        nodeDict = {}
        for nodeStatus in nodeStatusList:
            nodeDict["%d-%d" %(int(nodeStatus.studyTrackItemID), int(nodeStatus.memberID))] = nodeStatus
        #
        #  Create status entries, if not yet exist.
        #
        kwargs = {}
        kwargs['assignmentID'] = assignmentID
        for child in children:
            revision = api._getArtifactRevisionByID(session, child.hasArtifactRevisionID)
            kwargs['studyTrackItemID'] = revision.artifactID
            for memberID in memberIDs:
                cKey = "%d-%d" % (int(revision.artifactID), int(memberID))
                nodeStatus = nodeDict.get(cKey)
                if nodeStatus:
                    del nodeDict[cKey]
                    log.debug('_updateMemberStudyTrackItems: cKey[%s] already exists.' % cKey)
                    continue

                kwargs['memberID'] = memberID
                log.debug('_updateMemberStudyTrackItems: fm cKey[%s] creating.' % cKey)
                api._createMemberStudyTrackItemStatus(session, **kwargs)
        #
        #  Delete the remaining entries.
        #
        nodeStatusList = nodeDict.values()
        for nodeStatus in nodeStatusList:
            session.delete(nodeStatus)
            log.debug('_updateMemberStudyTrackItems: nodeStatus[%s] deleting.' % nodeStatus)

    @d.jsonify()
    @d.checkAuth(request, False, False, ['id'])
    @d.trace(log, ['member', 'id'])
    def update(self, member, id):
        """
            Updates either an assignment or a study track, identified by id.
            Since both are artifacts, we can identify the type once retrieving
            the instance.

            If it is a study track, the caller can update the following:
            -  name (of the study track)
            -  description (of the study track)
            -  concept list

            If it is an assignment, the caller can update the following:
            -  name (of the assignment)
            -  description (of the assignment)
            -  concept list (of the study track)
            -  due date
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        c.errorCode = ErrorCodes.OK
        try:
            if not id:
                id = request.params.get('id', None)
            if not id:
                raise ex.MissingArgumentException((_(u'Artifact ID missing.')).encode("utf-8"))

            name = request.params.get('name', None)
            description = request.params.get('description', None)
            concepts = request.params.get('concepts', None)
            due = request.params.get('due', None)
            if due == '':
                due = 'none'

            member = u.getImpersonatedMember(member)
            memberID = member.id

            tx = utils.transaction(self.getFuncName())
            with tx as session:
                artifact = api._getArtifactByID(session, id=id)
                if not artifact:
                    raise ex.NotFoundException((_(u'Artifact of id %s does not exist.' % id)).encode("utf-8"))

                if artifact.type.name not in ['assignment', 'study-track']:
                    raise ex.InvalidArgumentException((_(u'Invalid type: %s.' % artifact.type.name)).encode("utf-8"))

                if memberID != artifact.creatorID and not u.isMemberAdmin(member, session=session):
                    raise ex.UnauthorizedException((_(u'Assignments can only be updated by its creators.')).encode("utf-8"))
                #
                #  Get assignment(s) and study track.
                #
                nodes = None
                assignment = None
                if artifact.type.name == 'study-track':
                    studyTrack = artifact
                    log.debug('update: studyTrack id[%s]' % studyTrack.id)
                else:
                    assignment = api._getAssignmentByID(session, id=artifact.id)
                    if not assignment:
                        raise ex.NotFoundException((_(u'Assignment of id %s does not exist.' % artifact.id)).encode("utf-8"))
                    log.debug('update: assignment[%s]' % assignment)

                    studyTrack = artifact.revisions[0].children[0].child.artifact
                    log.debug('update: studyTrack id[%s]' % studyTrack.id)
                #
                #  If there will be changes, get the original artifact
                #  into a dictionary.
                #
                nodes = []
                nodeDict = {}
                if concepts:
                    query = session.query(model.ArtifactAndChildren)
                    query = query.filter_by(id=studyTrack.id)
                    nodes = query.all()
                    for node in nodes:
                        id = node.childID
                        a = api._getArtifactByID(session, id=id)
                        nodeDict[id] = a
                #
                #  Update the assignment or study-track.
                #
                kwargs = {
                    'member': member,
                    'memberID': memberID,
                    'artifact': artifact,
                    'artifactID': artifact.id,
                }
                origName = artifact.name
                if name:
                    kwargs['name'] = name
                if description:
                    kwargs['description'] = description
                kwargs['cache'] = ArtifactCache()
                if artifact.type.name == 'assignment':
                    if due:
                        due = due.strip().lower()
                        #
                        #  Add Group Activity for changing assignment due date.
                        #
                        dd = None
                        if due != 'none':
                            try:
                                dd = dt.strptime(due, '%Y-%m-%d %H:%M:%S')
                            except ValueError:
                                dd = dt.strptime(due, '%Y-%m-%d')

                            if dd:
                                api.validateDueDate(dd)
                        if assignment.due != dd:
                            kwargs['due'] = due
                            data = {}
                            data['groupID'] = assignment.groupID
                            data['ownerID'] = member.id
                            data['objectID'] = None
                            data['objectType'] = None
                            data['activityType'] = 'change-due-date'
                            activityData = {"name": artifact.name, "assignmentID": artifact.id, "owner": artifact.creatorID, "due": due}
                            data['activityData'] = json.dumps(activityData)
                            groupActivity = api._addGroupActivity(session, **data)
                            log.debug("Group Activity for changing due date [%s] " % groupActivity.asDict())

                    if assignment.groupID:
                        group = api._getGroupByID(session, assignment.groupID)
                        if group:
                            kwargs['group_handle'] = group.handle
                            artifact = api._updateArtifact(session, **kwargs)
                            log.debug('update: updated group handle of artifact id[%s]' % artifact.id)
                            del kwargs['group_handle']

                if concepts:
                    nodes = self._getNodes(session, concepts)
                    children = []
                    for node in nodes:
                        children.append(node.revisions[0].id)
                    log.debug('update: children%s' % children)
                    kwargs['children'] = children

                if artifact.type.name == 'assignment':
                    if kwargs.has_key('due'):
                        del kwargs['due']
                #
                #  Update the study track children.
                #
                kwargs['artifact'] = studyTrack
                kwargs['artifactID'] = studyTrack.id
                if concepts:
                    #delete all the existing contexts and create new contexts as per the update
                    stic._deleteStudyTrackItemContexts(session, studyTrack.id)
                    session.flush()
                    api._createStudyTrackItemContexts(session, studyTrack.id, nodes)
                studyTrack = api._updateArtifact(session, **kwargs)
                log.debug('update: updated studyTrack id[%s]' % studyTrack.id)

                stDict = self._asDict(session, studyTrack)
                result['response'][studyTrack.type.name] = stDict
                #
                #  Get the assignments associated to this study track.
                #
                query = session.query(model.ArtifactAndChildren)
                query = query.filter_by(childID=studyTrack.id)
                query = query.join(model.Artifact, model.Artifact.id == model.ArtifactAndChildren.id)
                query = query.filter(model.Artifact.creatorID == memberID)
                assignments = query.all()
                log.debug('update: assignments len[%s]' % len(assignments))
                assignmentDict = {}
                for ac in assignments:
                    log.debug('update: assignment id[%s]' % ac.id)
                    asgn = api._getAssignmentByID(session, id=ac.id)
                    if not asgn:
                        raise ex.NotFoundException((_(u'Assignment of id %s does not exist.' % ac.id)).encode("utf-8"))
                    assignmentDict[ac.id] = asgn
                #
                #  Update name of other assignments.
                #
                arList = []
                if name or description:
                    for ac in assignments:
                        if assignment and ac.id == assignment.assignmentID:
                            #
                            #  Already updated self.
                            #
                            continue

                        if kwargs.has_key('due'):
                            del kwargs['due']
                        if kwargs.has_key('children'):
                            del kwargs['children']

                        assignment = assignmentDict.get(ac.id)
                        kwargs['artifact'] = assignment.artifact
                        kwargs['artifactID'] = ac.id

                        group = api._getGroupByID(session, assignment.groupID)
                        if group:
                            kwargs['group_handle'] = group.handle
                            a = api._updateArtifact(session, **kwargs)
                            del kwargs['group_handle']

                        arDict = self._asDict(session, artifact)
                        arList.append(arDict)

                newNodes = []
                removedNodes = []
                if not concepts:
                    if artifact.type.name == 'assignment':
                        arDict = self._asDict(session, artifact)
                        arList.append(arDict)
                else:
                    #
                    #  Figure out the changes in concept node list.
                    #
                    for node in nodes:
                        if nodeDict.get(node.id, None):
                            del nodeDict[node.id]
                        else:
                            newNodes.append(node.encodedID if node.encodedID else node.name)
                    for node in nodeDict.values():
                        removedNodes.append(node.encodedID if node.encodedID else node.name)
                log.debug('update: newNodes[%s]' % newNodes)
                log.debug('update: removedNodes[%s]' % removedNodes)

                if name or concepts:
                    for ac in assignments:
                        log.debug('update: ac.id[%s]' % ac.id)
                        assignment = assignmentDict.get(ac.id)
                        artifact = assignment.artifact
                        #
                        #  Update the member status.
                        #
                        if concepts:
                            group = api._getGroupByID(session, assignment.groupID)
                            fq=[('groupMemberRoleID', 14)]
                            groupMembers = api._getGroupMembers(session, group=group, fq=fq, pageSize=0)
                            if groupMembers and len(groupMembers) > 0:
                                #
                                #  Create the member study track items, if it does not exist yet.
                                #
                                self._updateMemberStudyTrackItems(session,
                                                                  ac.id,
                                                                  studyTrack.revisions[0].children,
                                                                  groupMembers=groupMembers)
                        #
                        #  Prepare Group Activity for assignment edit.
                        #
                        groupID = assignment.groupID
                        if groupID:
                            kwargs = {}
                            kwargs['groupID'] = groupID
                            kwargs['ownerID'] = member.id
                            kwargs['objectID'] = None
                            kwargs['objectType'] = None
                            kwargs['activityType'] = 'assignment-edit'
                            #
                            #  Add Group Activity for assignment edit.
                            #
                            activityData = {'name': artifact.name, 'assignmentID': artifact.id, 'owner': artifact.creatorID}
                            if len(newNodes) > 0:
                                activityData['concepts-added'] = newNodes
                            if len(removedNodes) > 0:
                                activityData['concepts-removed'] = removedNodes
                            if origName != artifact.name:
                                activityData['orig-name'] = origName
                            kwargs['activityData'] = json.dumps(activityData)
                            groupActivity = api._addGroupActivity(session, **kwargs)
                            log.debug("Group Activity for assignment [%s] " % groupActivity.asDict())

                        if not assignmentDict.get(ac.id):
                            arDict = self._asDict(session, artifact)
                            arList.append(arDict)
                if len(arList) > 0:
                    result['response'][artifact.type.name + 's'] = arList

            return result
        except ex.NotFoundException, iae:
            log.debug('update: Not Found Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.NO_SUCH_ARTIFACT
            return ErrorCodes().asDict(c.errorCode, str(iae))
        except ex.InvalidArgumentException, iae:
            log.debug('update: Invalid Argument Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.INVALID_ARGUMENT
            return ErrorCodes().asDict(c.errorCode, str(iae))
        except ex.UnauthorizedException, uae:
            log.debug('update: Unauthorized Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
            return ErrorCodes().asDict(c.errorCode, str(uae))
        except Exception, e:
            log.debug('update: Exception[%s] traceback' %(traceback.format_exc()))
            if c.errorCode == ErrorCodes.OK:
                c.errorCode = ErrorCodes.CANNOT_UPDATE_ASSIGNMENT
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, False, ['id', 'deleteStudyTrack'])
    @d.trace(log, ['member', 'id', 'deleteStudyTrack'])
    def delete(self, member, id, deleteStudyTrack):
        """
            Deletes an existing assignment, and optionally deletes its study tracks.

            When deleting the entire assignment, deleteStudyTrack should be True.
            When unassigning, deleteStudyTrack should be False.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        c.errorCode = ErrorCodes.OK
        try:
            if not id:
                id = request.params.get('id', None)
            if not id:
                raise ex.MissingArgumentException((_(u'Assignment ID missing.')).encode("utf-8"))

            member = u.getImpersonatedMember(member)
            memberID = member.id
            artifactTypeDict = g.getArtifactTypes()

            tx = utils.transaction(self.getFuncName())
            with tx as session:
                #
                #  Lookup the assignment assuming the given id is the
                #  internal id.
                #
                assignment = api._getAssignmentByID(session, id=id)
                if not assignment:
                    #
                    #  See if the given id is a handle.
                    #
                    artifact = api._getArtifactByHandle(session,
                                                        id,
                                                        artifactTypeDict['assignment'],
                                                        creatorID=memberID)
                    if not artifact:
                        c.errorCode = ErrorCodes.NO_SUCH_ASSIGNMENT
                        raise Exception((_(u'Assignment of id %s does not exist for member %d.' % (id, memberID))).encode("utf-8"))

                    assignment = api._getAssignmentByID(session, id=artifact.id)
                    if not assignment:
                        c.errorCode = ErrorCodes.NO_SUCH_ASSIGNMENT
                        raise Exception((_(u'Assignment of id %s does not exist.' % id)).encode("utf-8"))

                    assignment.artifact = artifact

                if memberID != assignment.artifact.creatorID and not u.isMemberAdmin(member, session=session):
                    raise ex.UnauthorizedException((_(u'Assignments can only be deleted by its creators.')).encode("utf-8"))

                # Prepare Group Activity for unassign / assignment delete
                deleteStudyTrack = deleteStudyTrack and deleteStudyTrack.lower() == 'true'
                groupID = assignment.groupID
                if groupID:
                    kwargs = {}
                    kwargs['groupID'] = groupID
                    kwargs['ownerID'] = member.id
                    kwargs['objectID'] = None
                    kwargs['objectType'] = None
                    activityData = {'name':assignment.artifact.name, 'assignmentID': assignment.artifact.id, 'owner':assignment.artifact.creatorID}
                    kwargs['activityData'] = json.dumps(activityData)
                    if deleteStudyTrack:
                        kwargs['activityType'] = 'assignment-delete'
                    else:
                        kwargs['activityType'] = 'unassign'

                #
                #  Delete the assignment.
                #
                api._deleteAssignment(session,
                                      memberID,
                                      assignment,
                                      deleteStudyTrack=deleteStudyTrack,
                                      cache=ArtifactCache())
                # Add Group Activity for unassign / assignment delete
                if groupID:
                    groupActivity = api._addGroupActivity(session, **kwargs)
                    log.debug("Group Activity for assignment [%s] " % groupActivity.asDict())

            return result
        except ex.UnauthorizedException, uae:
            log.debug('Delete assignment: Unauthorized Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
            return ErrorCodes().asDict(c.errorCode, str(uae))
        except Exception, e:
            log.debug('Delete assignment Exception[%s] traceback' %(traceback.format_exc()))
            if c.errorCode == ErrorCodes.OK:
                c.errorCode = ErrorCodes.CANNOT_DELETE_ASSIGNMENT
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, False, ['id'])
    @d.trace(log, ['member', 'id'])
    def deleteAll(self, member, id):
        """
            Deletes the artifact, identified by id, and it's related data.

            If the id is a study track, delete all the associated assignments
            and the study track itself.

            If the id is an assignment, find it's corresponding study track(s),
            and for each study track, delete all the associated assignments
            and the study track itself.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        c.errorCode = ErrorCodes.OK
        try:
            if not id:
                id = request.params.get('id', None)
            if not id:
                raise ex.MissingArgumentException((_(u'Artifact id missing.')).encode("utf-8"))

            member = u.getImpersonatedMember(member)
            memberID = member.id
            artifactTypeDict = g.getArtifactTypes()
            event = None
            nList = []
            member_info = member.asDict(True, True)
            member_info['firstName'] = member_info['givenName']
            member_info['lastName'] = member_info['surname']
            member_info['imageURL'] = pylons_session.get('userImage')

            tx = utils.transaction(self.getFuncName())
            with tx as session:
                #
                #  Lookup the artifact assuming the given id is the
                #  internal id.
                #
                artifact = api._getArtifactByID(session, id=id)
                if not artifact:
                    #
                    #  See if the given id is a handle.
                    #
                    artifact = api._getArtifactByHandle(session,
                                                        id,
                                                        artifactTypeDict['assignment'],
                                                        creatorID=memberID)
                    if not artifact:
                        c.errorCode = ErrorCodes.NO_SUCH_ASSIGNMENT
                        raise ex.NotFoundException((_(u'Artifact of id %s does not exist.' % id)).encode("utf-8"))

                if artifact.type.name not in ['assignment', 'study-track']:
                    raise ex.InvalidArgumentException((_(u'Invalid type: %s.' % artifact.type.name)).encode("utf-8"))

                if memberID != artifact.creatorID and not u.isMemberAdmin(member, session=session):
                    raise ex.UnauthorizedException((_(u'Assignments can only be deleted by its creators.')).encode("utf-8"))

                if artifact.type.name == 'study-track':
                    studyTracks = [ artifact ]
                else:
                    #
                    #  Find the corresponding study tracks of this assignment.
                    #
                    children = artifact.revisions[0].children
                    studyTracks = []
                    for child in children:
                        revision = api._getArtifactRevisionByID(session, child.hasArtifactRevisionID)
                        studyTracks.append(revision.artifact)

                stDict = {}
                for studyTrack in studyTracks:
                    #
                    #  Find the assignments associated with this study track.
                    #
                    asList = []
                    parents = api._getArtifactParents(session, studyTrack.id)
                    #If study strack and in unassigned state
                    if not parents:
                        log.debug("Delete Study track [%s] " % studyTrack.id)
                        api._deleteArtifact(session, studyTrack, cache=ArtifactCache())
                    for parent in parents:
                        artifact = api._getArtifactByID(session, id=parent['parentID'])
                        #
                        #  Retreive assignment.
                        #
                        assignment = api._getAssignmentByID(session, id=artifact.id)
                        if not assignment:
                            raise ex.NotFoundException((_(u'Assignment of id %s does not exist.' % artifact.id)).encode("utf-8"))

                        assignment.artifact = artifact
                        #
                        #  Prepare Group Activity for assignment delete.
                        #
                        groupID = assignment.groupID
                        if groupID:
                            kwargs = {}
                            kwargs['groupID'] = groupID
                            kwargs['ownerID'] = member.id
                            kwargs['objectID'] = None
                            kwargs['objectType'] = None
                            activityData = {'name': artifact.name, 'assignmentID': artifact.id, 'owner': artifact.creatorID}
                            kwargs['activityData'] = json.dumps(activityData)
                            kwargs['activityType'] = 'assignment-delete'
                        #
                        #  Delete the assignment.
                        #
                        api._deleteAssignment(session,
                                              memberID,
                                              assignment,
                                              deleteStudyTrack=(studyTrack == studyTracks[-1]),
                                              cache=ArtifactCache())
                        #
                        #  Add Group Activity for assignment delete.
                        #
                        if groupID:
                            groupActivity = api._addGroupActivity(session, **kwargs)
                            log.debug("Group Activity for assignment [%s] " % groupActivity.asDict())
                            #
                            #  Send email to notify members.
                            #
                            group = api._getGroupByID(session, groupID)
                            if group:
                                eventType = api._getEventTypeByName(session, 'ASSIGNMENT_DELETED')
                                if eventType:
                                    notifications = api._getNotificationsByFilter(session, filters=[('eventTypeID', eventType.id), ('groupID', group.id), ('frequency', 'instant')]).results
                                    for notification in notifications:
                                        nList.append(notification.id)

                                    if len(nList) > 0:
                                        data = {
                                            'creator': member.fix().name,
                                            'group': group.name,
                                            'assignment': artifact.name,
                                            'assignmentURL': '/group-assignments/%s' % group.id,
                                            'groupURL': '/group/%s' % group.id,
                                            'myGroups': '/my/groups',
                                            'id': artifact.id,
                                            'type': 'assignment'
                                        }
                                        data = json.dumps(data)
                                        event = api._createEventForType(session, typeName='ASSIGNMENT_DELETED', objectID=group.id, objectType='group', eventData=data, ownerID=memberID, processInstant=False)

                                eventTypeName = 'ASSIGNMENT_DELETED_WEB'
                                eventType = api._getEventTypeByName(session, eventTypeName)
                                if eventType:
                                    event_data = json.dumps({
                                        'member': member_info,
                                        'creator': member.fix().name,
                                        'group': group.name,
                                        'groupID': group.id,
                                        'group_name': group.name,
                                        'assignment': artifact.name,
                                        'assignmentURL': '/group-assignments/%s' % group.id,
                                        'groupURL': '/group/%s' % group.id,
                                        'myGroups': '/my/groups',
                                        'id': artifact.id,
                                        'type': 'assignment'
                                    })
                                    notificationFilters = [('eventTypeID', eventType.id), ('groupID', group.id)]
                                    n.createEventForTypeHelperWithSession(session, eventTypeName, memberID, event_data, group.id, 'group', False, notificationFilters)

                        asList.append(artifact.id)
                    stDict[studyTrack.id] = asList
                result['response']['deleted'] = stDict

            if event:
                h.processInstantNotifications([event.id] * len(nList), notificationIDs=nList, noWait=False)

            return result
        except ex.NotFoundException, nfe:
            log.debug('deleteAll: No Such assignment Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.NO_SUCH_ASSIGNMENT
            return ErrorCodes().asDict(c.errorCode, str(nfe))
        except ex.InvalidArgumentException, iae:
            log.debug('deleteAll: Invalid Argument Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.INVALID_ARGUMENT
            return ErrorCodes().asDict(c.errorCode, str(iae))
        except ex.MissingArgumentException, mae:
            log.debug('deleteAll: Missing Argument Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
            return ErrorCodes().asDict(c.errorCode, str(mae))
        except ex.UnauthorizedException, uae:
            log.debug('deleteAll: Unauthorized Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
            return ErrorCodes().asDict(c.errorCode, str(uae))
        except Exception, e:
            log.debug('deleteAll: Exception[%s] traceback' %(traceback.format_exc()))
            if c.errorCode == ErrorCodes.OK:
                c.errorCode = ErrorCodes.CANNOT_DELETE_ASSIGNMENT
            return ErrorCodes().asDict(c.errorCode, str(e))

    def _getTopLevelAncestorTerm(self, session, eid):
        @beaker_cache(expire=864000)
        def __getTopLevelAncestorTerm(eid):
            browseTerm = api._getDomainTermByEncodedID(session, eid)
            if not browseTerm:
                c.errorCode = ErrorCodes.NO_SUCH_BROWSE_TERM
                raise Exception((_(u'No such EID[%s].' % eid)).encode("utf-8"))

            ancestor = browseTerm.getTopLevelAncestorTerm()
            return ancestor.asDict(includeParent=False, recursive=False, includeSubjectBranchInfo=False)
        return __getTopLevelAncestorTerm(eid)

    @d.jsonify()
    @d.checkAuth(request, False, False, ['concepts', 'artifactID', 'status', 'score', 'lastAccess'])
    @d.trace(log, ['member', 'concepts', 'artifactID', 'status', 'score', 'lastAccess'])
    def updateConceptNodeStatus(self, member, concepts=None, artifactID=None, status=None, score=None, lastAccess=None):
        """
            Update the status of the given concept node(s).

            It will also create a self-study assignment for the top level
            ancestor of these concept nodes (if they don't exist yet).
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        c.errorCode = ErrorCodes.OK

        try:
            group = request.params.get('group', None)
            forceUpdate = str(request.params.get('forceUpdate')).lower() == 'true'
            return self._updateConceptNodeStatus(member, result, concepts=concepts, artifactID=artifactID, status=status, score=score, lastAccess=lastAccess, group=group, 
                    forceUpdate=forceUpdate)
        except ex.InvalidArgumentException, iae:
            log.error('updateConceptNodeStatus: Invalid Argument Exception[%s] traceback' %(traceback.format_exc()), exc_info=iae)
            c.errorCode = ErrorCodes.INVALID_ARGUMENT
            return ErrorCodes().asDict(c.errorCode, str(iae))
        except ex.MissingArgumentException, mae:
            log.error('updateConceptNodeStatus: Missing Argument Exception[%s] traceback' %(traceback.format_exc()), exc_info=mae)
            c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
            return ErrorCodes().asDict(c.errorCode, str(mae))
        except ex.ExternalException, ee:
            log.error('updateConceptNodeStatus: External Exception [%s] traceback' %(traceback.format_exc()), exc_info=ee)
            c.errorCode = ErrorCodes.EXTERNAL_ERROR
            return ErrorCodes().asDict(c.errorCode, str(ee))
        except Exception, e:
            log.error('updateConceptNodeStatus: Exception[%s] traceback' %(traceback.format_exc()), exc_info=e)
            if c.errorCode == ErrorCodes.OK:
                c.errorCode = ErrorCodes.CANNOT_UPDATE_ASSIGNMENT
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, False, ['appID', 'concepts', 'artifactID', 'status', 'score', 'lastAccess'])
    @d.trace(log, ['member', 'appID', 'concepts', 'artifactID', 'status', 'score', 'lastAccess'])
    def updateLMSConceptNodeStatus(self, member, appID, concepts=None, artifactID=None, status=None, score=None, lastAccess=None):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        c.errorCode = ErrorCodes.OK

        try:
            if not appID:
                appID = request.params.get('appID', None)
                if not appID:
                    raise ex.MissingArgumentException((_(u'App Name missing.')).encode("utf-8"))

            testScoreID = request.params.get('testScoreID', None)

            launchKey = request.params.get('launchKey', None)
            if not launchKey:
                authType = pylons_session.get('authType', None)
                log.debug("updateLMSConceptNodeStatus: authType [%s]"%authType)
                if authType =="edmodoconnect":
                    # Check for edmodoconnect does not need launch key
                    pass
                elif appID =="GOOGLE_CLASSROOM":
                    # Google classroom does not need launch key
                    pass
                else:
                    raise ex.MissingArgumentException((_(u'Launch key missing.')).encode("utf-8"))

            group = request.params.get('group', None)
            #
            # Get CK-12 group using LTI contextID 
            #
            if not group and appID and (':ltiApp' in appID or appID =="GOOGLE_CLASSROOM"):
                contextID = request.params.get('contextID', None)
                if not contextID:
                    raise ex.MissingArgumentException((_(u'LTI contextID missing.')).encode("utf-8"))
                group = api.getLMSProviderGroups(appID=appID, providerGroupID=contextID)
                if group is not None:
                    if len(group) == 0:
                        group = None
                    else:
                        group = group[0].groupID
            if not group:
                raise ex.MissingArgumentException((_(u'CK-12 Group IDs missing.')).encode("utf-8"))

            return self._updateConceptNodeStatus(member, result, concepts=concepts, artifactID=artifactID, status=status, score=score, lastAccess=lastAccess, group=group, testScoreID=testScoreID, appID=appID, launchKey=launchKey)
        except ex.InvalidArgumentException, iae:
            log.debug('updateLMSConceptNodeStatus: Invalid Argument Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.INVALID_ARGUMENT
            return ErrorCodes().asDict(c.errorCode, str(iae))
        except ex.MissingArgumentException, mae:
            log.debug('updateLMSConceptNodeStatus: Missing Argument Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
            return ErrorCodes().asDict(c.errorCode, str(mae))
        except ex.ExternalException, ee:
            log.debug('updateLMSConceptNodeStatus: External Exception [%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.EXTERNAL_ERROR
            return ErrorCodes().asDict(c.errorCode, str(ee))
        except ex.EdmodoAPIFailureException, ea:
            log.debug('updateLMSConceptNodeStatus: Edmodo API failure [%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.EXTERNAL_API_FAILURE
            return ErrorCodes().asDict(c.errorCode, str(ea))
        except ex.TeacherAccessTokenNotFoundException, tat:
            log.debug('updateLMSConceptNodeStatus: Edmodo Set Grade Exception [%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.TEACHER_ACCESS_TOKEN_NOT_FOUND
            return ErrorCodes().asDict(c.errorCode, str(tat))
        except Exception, e:
            log.debug('updateLMSConceptNodeStatus: Exception[%s] traceback' %(traceback.format_exc()))
            if c.errorCode == ErrorCodes.OK:
                c.errorCode = ErrorCodes.CANNOT_UPDATE_ASSIGNMENT
            return ErrorCodes().asDict(c.errorCode, str(e))

    def _isEligibleForUpdatingConceptNodeStatus(self, collectionContexts = [], assignmentStudyTrackID=None, studyTrackIDCollectionContextsMap={}):
        return ((collectionContexts and assignmentStudyTrackID and studyTrackIDCollectionContextsMap.has_key(assignmentStudyTrackID) and (set(studyTrackIDCollectionContextsMap.get(assignmentStudyTrackID)) & set(collectionContexts)))
                or (not collectionContexts and (not assignmentStudyTrackID or not studyTrackIDCollectionContextsMap.has_key(assignmentStudyTrackID) or (set(studyTrackIDCollectionContextsMap.get(assignmentStudyTrackID)) & set([('',0),(None,0)])))))

    def _extractConceptEIDsAndConceptEIDCollectionContextInfosMap(self, rawConceptEIDs):
        conceptEIDCollectionContextInfosMap = {}
        rawConceptEIDs = rawConceptEIDs.split(',')
        for rawConceptEID in rawConceptEIDs:
            if not rawConceptEID:
                continue

            ctxUrl = None
            conceptCollectionHandle = ''
            collectionCreatorID = 0
            conceptEIDPipeCount = rawConceptEID.count('|')
            if conceptEIDPipeCount == 3:
                conceptEID, ctxUrl, conceptCollectionHandle, collectionCreatorID = rawConceptEID.split('|')
                conceptCollectionHandle = conceptCollectionHandle.lower()
                if ctxUrl == '':
                    ctxUrl = None
                if conceptCollectionHandle == '':
                    conceptCollectionHandle = None
                if collectionCreatorID == '':
                    collectionCreatorID = None
                if (conceptCollectionHandle and not collectionCreatorID) or (not conceptCollectionHandle and collectionCreatorID):
                    raise Exception((_(u"Invalid nodeID[%s] parameter received. nodeID (actualNodeID | ctxUrl | conceptCollectionHandle | collectionCreatorID) should either contain / not contain  conceptCollectionHandle & collectionCreatorID togeather." % rawConceptEID)).encode("utf-8"))
                if collectionCreatorID:
                    try :
                        collectionCreatorID=long(collectionCreatorID)
                    except (ValueError, TypeError) as e:
                        raise ex.InvalidArgumentException(u"Invalid value for collectionCreatorID : [{collectionCreatorID}] received.".format(collectionCreatorID=collectionCreatorID).encode('utf-8'))
                    if collectionCreatorID <=0:
                        raise ex.InvalidArgumentException(u"Invalid value for collectionCreatorID : [{collectionCreatorID}] received.".format(collectionCreatorID=collectionCreatorID).encode('utf-8'))
            elif conceptEIDPipeCount == 1:
                conceptEID, ctxUrl = rawConceptEID.split('|')
            elif conceptEIDPipeCount == 0:
                conceptEID = rawConceptEID
                ctxUrl = None
            else:
                raise Exception((_(u"Invalid conceptEID[%s] parameter received. conceptEID (actualNodeID | ctxUrl | conceptCollectionHandle | collectionCreatorID) can contain at either three or one or zero occurences of '|' character. " % rawConceptEID)).encode("utf-8"))

            collectionContext = (conceptCollectionHandle, collectionCreatorID)
            if conceptEID not in conceptEIDCollectionContextInfosMap:
                conceptEIDCollectionContextInfosMap[conceptEID] = {}
            if collectionContext not in conceptEIDCollectionContextInfosMap[conceptEID]:
                conceptEIDCollectionContextInfosMap[conceptEID][collectionContext] = ctxUrl
            else:
                raise ex.InvalidArgumentException(u"Duplicate conceptCollectionHandle: [{conceptCollectionHandle}] and collectionCreatorID : [{collectionCreatorID}] combinaton received for conceptEID: [{conceptEID}].".format(conceptCollectionHandle=conceptCollectionHandle, collectionCreatorID=collectionCreatorID, conceptEID=conceptEID).encode('utf-8'))

        return conceptEIDCollectionContextInfosMap

    def _resolveCollectionContexts(self, conceptEID, collectionContexts):
        collectionContextsResolutionMap = {}
        for collectionContext in collectionContexts:
            conceptCollectionHandle = collectionContext[0]
            collectionCreatorID = collectionContext[1]
            if not api.COLLECTION_HANDLE_IDENTIFIERS_SEPARATOR in conceptCollectionHandle:
                #Passed handle is a collectionHandle and not a conceptCollectionHandle
                #Need to be replaced with all the conceptCollectionHandles with this EID
                collectionHandle = conceptCollectionHandle
                if not collectionCreatorID:
                    collectionCreatorID = 3
                collectionNodesForConceptEID = self.collectionNode.getByEncodedIDs([conceptEID], collectionHandle=collectionHandle, collectionCreatorID = collectionCreatorID)
                if collectionNodesForConceptEID:
                    for collectionNodeForConceptEID in collectionNodesForConceptEID:
                        if collectionNodeForConceptEID.get('handle'):
                            conceptCollectionHandle = collectionNodeForConceptEID.get('handle')
                            if collectionContext not in collectionContextsResolutionMap:
                                collectionContextsResolutionMap[collectionContext] = []
                            collectionContextsResolutionMap[collectionContext].append((conceptCollectionHandle, collectionCreatorID))
                        else:
                            raise ex.InvalidArgumentException((_(u'Received concept: [%s] and conceptCollectionHandle: [%s] resolved to an invalid conceptCollectionHandle: [%s] after collectionHandle-to-conceptCollectionHandle resolution.' % (conceptEID, conceptCollectionHandle, None))).encode("utf-8"))
                else:
                    raise ex.InvalidArgumentException((_(u'Received concept: [%s] and conceptCollectionHandle: [%s] could not be found in the system.' % (conceptEID, conceptCollectionHandle))).encode("utf-8"))
            else:
                if collectionContext not in collectionContextsResolutionMap:
                    collectionContextsResolutionMap[collectionContext] = []
                collectionContextsResolutionMap[collectionContext].append(collectionContext)
        return collectionContextsResolutionMap

    def _processConceptEIDCollectionContextInfosMapForResolution(self, conceptEIDCollectionContextInfosMap):
        conceptEIDCollectionContextsMap = {}
        for conceptEID in conceptEIDCollectionContextInfosMap:
            conceptEIDCollectionContextsMap[conceptEID] = set([])
            conceptEIDCollectionContexts = [conceptEIDCollectionContext for conceptEIDCollectionContext in conceptEIDCollectionContextInfosMap[conceptEID]]
            conceptEIDCollectionContextsResolutionMap = self._resolveCollectionContexts(conceptEID, conceptEIDCollectionContexts)
            for conceptEIDCollectionContext in conceptEIDCollectionContextsResolutionMap:
                resolvedConceptEIDCollectionContexts = conceptEIDCollectionContextsResolutionMap[conceptEIDCollectionContext]
                for resolvedConceptEIDCollectionContext in resolvedConceptEIDCollectionContexts:
                    if conceptEIDCollectionContext in conceptEIDCollectionContextInfosMap:
                        conceptEIDCollectionContextInfosMap[resolvedConceptEIDCollectionContext] = conceptEIDCollectionContextInfosMap[conceptEIDCollectionContext]
                    conceptEIDCollectionContextsMap[conceptEID].add(resolvedConceptEIDCollectionContext)
            conceptEIDCollectionContextsMap[conceptEID] = list(conceptEIDCollectionContextsMap[conceptEID])
        return conceptEIDCollectionContextsMap, conceptEIDCollectionContextInfosMap

    def _updateConceptNodeStatus(self, member, result, concepts=None, artifactID=None, status=None, score=None, lastAccess=None, 
            group=None, testScoreID=None, appID=None, launchKey=None, forceUpdate=False):
        """
            Update the status of the given concept node(s) / artifacts.

            It will also create a member self-study-item status entry if it doesn't exist it
        """

        authType = pylons_session.get('authType', None)
        if not concepts:
            concepts = request.params.get('concepts', None)
        if not artifactID:
            artifactID = request.params.get('artifactID', None)

        if not concepts and not artifactID:
            raise ex.MissingArgumentException((_(u'Concept Node EIDs or artifact ID missing.')).encode("utf-8"))
        if concepts and artifactID:
            raise ex.InvalidArgumentException((_(u'Concept Node EIDs and artifact ID are mutually exclusive.')).encode("utf-8"))

        if not status:
            status = request.params.get('status', None)
        if score is None or score == '':
            score = request.params.get('score', None)
            if score is not None and score != '':
                score = int(float(score))
        log.debug('_updateConceptNodeStatus: score[%s]' % score)
        if not status and score is not None and score != '':
            status = 'completed'
        log.debug('_updateConceptNodeStatus: status[%s]' % status)
        log.debug('_updateConceptNodeStatus: forceUpdate[%s]' % str(forceUpdate))

        if not lastAccess:
            lastAccess = request.params.get('lastAccess', None)
        if lastAccess:
            lastAccess = dt.strptime(lastAccess, '%Y-%m-%d %H:%M:%S')
        elif forceUpdate and score == 0:
            lastAccess = None
        else:
            lastAccess = dt.now()


        artifactTypeDict = g.getArtifactTypes()
        memberID = member.id #1754508 

        if artifactID:
            collectionContexts = request.params.get('collectionContexts', [])
            if collectionContexts:
                conceptEIDCollectionContextInfosMap = self._extractConceptEIDsAndConceptEIDCollectionContextInfosMap(collectionContexts)
                conceptEIDCollectionContextsMap, conceptEIDCollectionContextInfosMap = self._processConceptEIDCollectionContextInfosMapForResolution(conceptEIDCollectionContextInfosMap)
                collectionContexts = set([])
                for conceptEID in conceptEIDCollectionContextsMap:
                    collectionContexts.update(conceptEIDCollectionContextsMap[conceptEID])
                collectionContexts = list(collectionContexts)
        elif concepts:
            conceptEIDCollectionContextInfosMap = self._extractConceptEIDsAndConceptEIDCollectionContextInfosMap(concepts)
            conceptEIDCollectionContextsMap, conceptEIDCollectionContextInfosMap = self._processConceptEIDCollectionContextInfosMapForResolution(conceptEIDCollectionContextInfosMap)
            conceptEIDs = conceptEIDCollectionContextInfosMap.keys()
        
        admin = None
        tx = utils.transaction(self.getFuncName())
        with tx as session:
            origin = 'ck-12'
            log.debug('_updateConceptNodeStatus: appID[%s]' % appID)
            if appID:
                #
                #  LMS App.
                #
                lmsManager = self.getLMSInstance(appID, launchKey=launchKey, txSession=session)
                lmsManager._validateLMSRequest()
                providerID, policyDict = lmsManager._init()                                                                                             
                log.debug('_updateConceptNodeStatus: policyDict[%s]' % policyDict)
                origin = 'lms'

            groupID = group
            log.debug('_updateConceptNodeStatus: groupID[%s]' % groupID)
            if not groupID:
                isGroupAdmin = False
            else:
                isGroupAdmin = api._isGroupAdmin(session, groupID=groupID, memberID=memberID)
            
            if group and appID:
                groups = api._getLMSProviderGroups(session, appID=appID, groupID=groupID)
                if not groups:
                    raise ex.NotFoundException((_(u'Group of id[%s] does not exist.' % groupID)).encode("utf-8"))
                group = groups[0]
                log.debug('_updateConceptNodeStatus: group[%s]' % group)
                groupMembers = api._getLMSProviderGroupMembers(session,
                                                               providerID=providerID,
                                                               providerGroupID=group.providerGroupID,
                                                               memberID=member.id)
                if not groupMembers:
                    raise ex.NotFoundException((_(u'Member of id[%s] does not exist in group of id[%s] for provider of id[%s].' % (member.id, group.providerGroupID, providerID))).encode("utf-8"))
                groupMember = groupMembers[0]
                log.debug('_updateConceptNodeStatus: groupMember[%s]' % groupMember)

            #
            #  Today in datetime form.
            #
            import datetime
            today = dt.combine(date.today(), datetime.time())
            log.debug('_updateConceptNodeStatus: today[%s]' % today)

            statusList = []
            scoreList = []
            
            if artifactID:
                artifact = api._getArtifactByID(session, artifactID)
                if not artifact:
                    raise Exception((_(u'No such artifact[%s].' % artifactID)).encode("utf-8"))
                
                if not isGroupAdmin:
                    #
                    #  Recreate the missing MemberStudyTrackStatus entries, if any.
                    #
                    #   1. Find the study stacks.
                    #   2. Find the assignments.
                    #   3. Check the existence of MemberStudyTrackStatus for this member.
                    #
                    threeMonthAgo = dt.now() - timedelta(days=90)
                    query = session.query(model.Artifact)
                    query = query.filter_by(artifactTypeID = artifactTypeDict['study-track'])
                    query = query.join(model.ArtifactAndChildren, model.ArtifactAndChildren.id == model.Artifact.id)
                    query = query.filter(model.ArtifactAndChildren.childID == artifactID)
                    query = query.join(model.Assignment, model.Assignment.assignmentID == model.ArtifactAndChildren.id)
                    query = query.filter(model.Assignment.due > threeMonthAgo)
                    studyTracks = query.all()
                    for studyTrack in studyTracks:
                        query = session.query(model.Artifact)
                        query = query.filter_by(artifactTypeID = artifactTypeDict['assignment'])
                        query = query.join(model.ArtifactAndChildren, model.ArtifactAndChildren.id == model.Artifact.id)
                        query = query.filter(model.ArtifactAndChildren.childID == studyTrack.id)
                        artifacts = query.all()
                        for a in artifacts:
                            #
                            #  Create the missing member study track items.
                            #
                            self._updateMemberStudyTrackItems(session,
                                                              a.id,
                                                              studyTrack.revisions[0].children,
                                                              memberID=memberID)
                            session.flush()

                #studyTrack contexts for the current artifactID
                studyTrackContextInfos = session.query(meta.StudyTrackItemContexts.c.studyTrackID, meta.StudyTrackItemContexts.c.conceptCollectionHandle, meta.StudyTrackItemContexts.c.collectionCreatorID).filter(meta.StudyTrackItemContexts.c.studyTrackItemID==artifactID).all()
                studyTrackIDCollectionContextsMap = {}
                for studyTrackContextInfo in studyTrackContextInfos:
                    if studyTrackContextInfo[0] not in studyTrackIDCollectionContextsMap:
                        studyTrackIDCollectionContextsMap[studyTrackContextInfo[0]] = []
                    studyTrackIDCollectionContextsMap[studyTrackContextInfo[0]].append((studyTrackContextInfo[1], studyTrackContextInfo[2]))

                #
                #  Find the MemberStudyTrackStatus entries.
                #
                groupIDs = []
                if groupID:
                    groupIDs = [ groupID ]
                assignmentStatuses = api._getMemberStudyTrackStatusByItemID(session, memberID=memberID, studyTrackItemID=artifactID, groupIDs=groupIDs) 
                
                #
                #  Find the study tracks.
                #
                for assignmentStatus in assignmentStatuses:
                    log.debug('_updateConceptNodeStatus: assignmentStatus[%s]' % assignmentStatus)
                    assignment = api._getAssignmentByID(session, id=assignmentStatus.assignmentID)
                    log.debug('_updateConceptNodeStatus: assignment[%s]' % assignment)
                    if assignment:
                        origin = assignment.origin
                        assignmentStudyTrackID = None
                        assignmentStudyTrackInfos = session.query(meta.ArtifactAndChildren.c.childID).filter(meta.ArtifactAndChildren.c.id == assignmentStatus.assignmentID).all()
                        if assignmentStudyTrackInfos and assignmentStudyTrackInfos[0]:
                            assignmentStudyTrackID = assignmentStudyTrackInfos[0][0]
                        
                        dueDate = assignment.due
                        if dueDate:
                            ## Get to the mid-night of next day.
                            dueDate = dt.combine(dueDate.date(), dt.min.time()) + timedelta(days=1)
                        log.debug("lastAccess: [%s], status: [%s], assignmentStatus.lastAccess: [%s], forceUpdate: [%s], due: [%s], dueDate: [%s], score: [%s]" \
                                % (lastAccess, assignmentStatus.status, assignmentStatus.lastAccess, forceUpdate, assignment.due, dueDate, score))
                        skip = False
                        if not appID and origin == 'ck-12' and not forceUpdate:
                            if not lastAccess and assignmentStatus.status == 'completed':
                                log.debug("Skipping update because [not lastAccess and assignmentStatus.status == 'completed']")
                                skip = True
                            elif lastAccess and dueDate and dueDate < lastAccess and assignmentStatus.status == 'completed':
                                log.debug("Skipping update because this attempt was made [%s] after the dueDate [%s] and assignment was already completed." % (lastAccess, dueDate))
                                skip = True
                            elif assignmentStatus.lastAccess and assignmentStatus.lastAccess > lastAccess:
                                log.debug("Skipping update because this attempt was made [%s] before the last time assignment status was updated [%s]." % (lastAccess, assignmentStatus.lastAccess))
                                skip = True
                        if skip:
                            #
                            #  Skip for those that have already turned in and is now pass the due date.
                            #  If forceUpdate is specified, we should still update the status.
                            #
                            log.debug('_updateConceptNodeStatus: skip updating')
                            if  assignmentStatus.item.type.name not in ('asmtpractice') or self._isEligibleForUpdatingConceptNodeStatus(collectionContexts, assignmentStudyTrackID, studyTrackIDCollectionContextsMap):
                                assignmentStatusDict = assignmentStatus.asDict()
                                assignmentStatusDict['conceptUpdateStatus'] = 'SKIPPED'
                                assignmentStatusDict['conceptType'] = 'ASSIGNMENT'
                                statusList.append(assignmentStatusDict)
                            continue

                        if (not appID and origin == 'ck-12') or (appID and origin == 'lms'):
                            #if the assignment is of type 'asmtpractice', only then check if it completed in the correct collection context 
                            #Else we can simply update the status as completing a modality in all others would be same
                            if  assignmentStatus.item.type.name not in ('asmtpractice') or self._isEligibleForUpdatingConceptNodeStatus(collectionContexts, assignmentStudyTrackID, studyTrackIDCollectionContextsMap):
                                #
                                #  Update existing status entry.
                                #                            
                                if status:
                                    assignmentStatus.status = status
                                #
                                #  Update last access timestamp and score.
                                #
                                if forceUpdate or (lastAccess and ( not assignmentStatus.lastAccess or lastAccess > assignmentStatus.lastAccess )):
                                    if lastAccess:
                                        assignmentStatus.lastAccess = lastAccess
                                    if score is not None:
                                        ## For assignments, restrict the reported score to 100%
                                        assignmentStatus.score = 100 if (score > 100 and assignment.assignmentType == 'assignment') else score
                                        log.info("Setting assignmentStatus.score=%s" % assignmentStatus.score)
                                api._update(session, assignmentStatus)
                                assignmentStatusDict = assignmentStatus.asDict()
                                assignmentStatusDict['conceptUpdateStatus'] = 'UPDATED'
                                assignmentStatusDict['conceptType'] = 'ASSIGNMENT'
                                statusList.append(assignmentStatusDict)

                    #
                    #  LMS related.
                    #
                    if groupID and appID:
                        assignmentScore = None
                        if authType =="edmodoconnect":
                            group = api._getGroupByID(session, groupID)
                            if group:
                                creatorID = group.creator.id
                                log.debug("_updateConceptNodeStatus: (edmodo connect) group [%s]"%group)
                                log.debug("_updateConceptNodeStatus: (edmodo connect) group creator [%s]"%creatorID)
                                assignmentScore = lmsManager.update_assignment_score_for_member(groupMember, assignment.assignmentID, score, testScoreID, artifact.name, groupCreator=creatorID)
                            else:
                                # _getGroupByID returns active groups by default. The groupID may be set to inactive
                                log.error("_updateConceptNodeStatus: No active group found for groupID: [%s], to call set grade API."%groupID)
                        elif appID == "GOOGLE_CLASSROOM":
                            group = api._getGroupByID(session, groupID)
                            creatorID = group.creator.id
                            assignmentScore = lmsManager.update_assignment_score_for_member(groupMember, assignment.assignmentID, score, testScoreID, artifact.name, groupCreator=creatorID)
                            log.debug("_updateConceptNodeStatus: (google classroom) assignmentScore[%s]"%assignmentScore)
                        else:
                            assignmentScore = lmsManager.update_assignment_score_for_member(groupMember, assignment.assignmentID, score, testScoreID, artifact.name)
                        scoreList.append(assignmentScore)
            elif concepts:
                #Create / Update the MemberSelfStudyItemStatus table entries 
                #Only for the concepts in the request
                conceptEIDToIDMap = {}
                conceptArtifacts = api._getArtifactsByEncodedIDs(session, conceptEIDs, creatorID=1, artifactTypeID=artifactTypeDict['domain'])
                validConceptEIDs = [conceptArtifact.encodedID for conceptArtifact in conceptArtifacts]
                invalidConceptEIDs = list(set(conceptEIDs) - set(validConceptEIDs))
                if invalidConceptEIDs:
                    raise ex.InvalidArgumentException((_(u'One or more of the received concepts: [%s] could not be found in the system.' % invalidConceptEIDs)).encode("utf-8"))
                for conceptArtifact in conceptArtifacts:
                    conceptEIDToIDMap[conceptArtifact.encodedID] = conceptArtifact.id 

                for conceptEID in conceptEIDs:
                    existingMemberSelfStudyItems = api._getMemberSelfStudyItemStatusesByMemberID(session, memberID, domainEncodedID=conceptEID)
                    existingCollectionContexts = []
                    collectionContextMemberSelfStudyStatusItemMap = {}
                    for existingMemberSelfStudyItem in existingMemberSelfStudyItems:
                        collectionContext = (existingMemberSelfStudyItem.conceptCollectionHandle, existingMemberSelfStudyItem.collectionCreatorID)
                        existingCollectionContexts.append(collectionContext)
                        collectionContextMemberSelfStudyStatusItemMap[collectionContext] = existingMemberSelfStudyItem
                    collectionContexts = conceptEIDCollectionContextsMap.get(conceptEID, [])                    
                    
                    #Update for the existing self-study-item-statuses
                    for collectionContext in list(set(collectionContexts).intersection(set(existingCollectionContexts))):
                        memberSelfStudyStatusItem = collectionContextMemberSelfStudyStatusItemMap.get(collectionContext)
                        updateStatus = 'SKIPPED'
                        if forceUpdate or (lastAccess and ( not memberSelfStudyStatusItem.lastAccess or lastAccess > memberSelfStudyStatusItem.lastAccess )):
                            if status: 
                                memberSelfStudyStatusItem.status = status
                            if lastAccess:
                                memberSelfStudyStatusItem.lastAccess = lastAccess
                            if score is not None and score != '':
                                ## For assignments, restrict the reported score to 100%?
                                memberSelfStudyStatusItem.score = score
                            #should we allow updating the contextURL?
                            if conceptEID in conceptEIDCollectionContextInfosMap and collectionContext in conceptEIDCollectionContextInfosMap[conceptEID]:
                                memberSelfStudyStatusItem.contextUrl = conceptEIDCollectionContextInfosMap[conceptEID][collectionContext]
                            session.add(memberSelfStudyStatusItem)
                            updateStatus = 'UPDATED'
                        memberSelfStudyStatusItemDict = memberSelfStudyStatusItem.asDict()
                        memberSelfStudyStatusItemDict['conceptUpdateStatus'] = updateStatus
                        memberSelfStudyStatusItemDict['conceptType'] = 'SELF-STUDY'
                        statusList.append(memberSelfStudyStatusItemDict)

                    #Create the new self-study-item-statuses
                    for collectionContext in list(set(collectionContexts) - set(existingCollectionContexts)):
                        contextUrl = None
                        if conceptEID in conceptEIDCollectionContextInfosMap and collectionContext in conceptEIDCollectionContextInfosMap[conceptEID]:
                            contextUrl = conceptEIDCollectionContextInfosMap[conceptEID][collectionContext]

                        memberSelfStudyStatusItem = model.MemberSelfStudyItemStatus(domainID=conceptEIDToIDMap[conceptEID], memberID=memberID, conceptCollectionHandle=collectionContext[0], collectionCreatorID=collectionContext[1], score=score, lastAccess=lastAccess, status=status, contextUrl=contextUrl)
                        session.add(memberSelfStudyStatusItem)
                        session.flush()
                        memberSelfStudyStatusItemDict = memberSelfStudyStatusItem.asDict()
                        memberSelfStudyStatusItemDict['conceptUpdateStatus'] = 'CREATED'
                        memberSelfStudyStatusItemDict['conceptType'] = 'SELF-STUDY'
                        statusList.append(memberSelfStudyStatusItemDict)

                #Actual status update for the assignments
                session.flush()
                for conceptEID in conceptEIDs:
                    collectionContexts = conceptEIDCollectionContextsMap.get(conceptEID, [])

                    #studyTrack contexts for the current artifactID
                    studyTrackContextInfos = session.query(meta.StudyTrackItemContexts.c.studyTrackID, meta.StudyTrackItemContexts.c.conceptCollectionHandle, meta.StudyTrackItemContexts.c.collectionCreatorID).filter(meta.StudyTrackItemContexts.c.studyTrackItemID==conceptEIDToIDMap[conceptEID]).all()
                    studyTrackIDCollectionContextsMap = {}
                    for studyTrackContextInfo in studyTrackContextInfos:
                        if studyTrackContextInfo[0] not in studyTrackIDCollectionContextsMap:
                            studyTrackIDCollectionContextsMap[studyTrackContextInfo[0]] = []
                        studyTrackIDCollectionContextsMap[studyTrackContextInfo[0]].append((studyTrackContextInfo[1], studyTrackContextInfo[2]))

                    groupIDs = [ groupID ] if groupID else []
                    nodeStatusList = api._getMemberStudyTrackStatus(session,
                                                                    memberIDs=[ memberID ],
                                                                    studyTrackItemID=conceptEIDToIDMap[conceptEID],
                                                                    groupIDs=groupIDs)
                    log.debug('_updateConceptNodeStatus: concept member status list %s ' % nodeStatusList)
                    if ( not appID and origin == 'ck-12' ) or ( appID and origin == 'lms' ):
                        for nodeStatus in nodeStatusList:
                            log.debug('_updateConceptNodeStatus: nodeStatus[%s]' % nodeStatus)
                            assignment = api._getAssignmentByID(session, id=nodeStatus.assignmentID)
                            log.debug('_updateConceptNodeStatus: assignment[%s]' % assignment)
                            dueDate = assignment.due
                            if dueDate:
                                ## Get to the mid-night of next day.
                                dueDate = dt.combine(dueDate.date(), dt.min.time()) + timedelta(days=1)
                            log.debug('_updateConceptNodeStatus: due[%s], dueDate[%s], status[%s]' % (str(assignment.due), dueDate, nodeStatus.status))
                            assignmentStudyTrackID = None
                            assignmentStudyTrackInfos = session.query(meta.ArtifactAndChildren.c.childID).filter(meta.ArtifactAndChildren.c.id == nodeStatus.assignmentID).all()
                            if assignmentStudyTrackInfos and assignmentStudyTrackInfos[0]:
                                assignmentStudyTrackID = assignmentStudyTrackInfos[0][0]                            
                            log.debug("lastAccess: [%s], status: [%s], nodeStatus.lastAccess: [%s], forceUpdate: [%s], due: [%s], dueDate: [%s], score: [%s]" \
                                    % (lastAccess, nodeStatus.status, nodeStatus.lastAccess, forceUpdate, assignment.due, dueDate, score))
                            skip = False
                            if not appID and assignment and not forceUpdate:
                                if not lastAccess and nodeStatus.status == 'completed':
                                    log.debug("Skipping update because [not lastAccess and nodeStatus.status == 'completed']")
                                    skip = True
                                elif lastAccess and dueDate and dueDate < lastAccess and nodeStatus.status == 'completed':
                                    log.debug("Skipping update because this attempt was made [%s] after the dueDate [%s] and assignment was already completed." % (lastAccess, dueDate))
                                    skip = True
                                elif nodeStatus.lastAccess and nodeStatus.lastAccess > lastAccess:
                                    log.debug("Skipping update because this attempt was made [%s] before the last time assignment status was updated [%s]." % (lastAccess, nodeStatus.lastAccess))
                                    skip = True
                            if skip:
                                #
                                #  Skip for those that have already turned in and is now pass the due date.
                                #
                                log.debug('_updateConceptNodeStatus: skip updating')
                                if  self._isEligibleForUpdatingConceptNodeStatus(collectionContexts, assignmentStudyTrackID, studyTrackIDCollectionContextsMap):
                                    nodeStatusDict = nodeStatus.asDict()
                                    nodeStatusDict['conceptUpdateStatus'] = 'SKIPPED'
                                    nodeStatusDict['conceptType'] = 'ASSIGNMENT'
                                    statusList.append(nodeStatusDict)
                                continue
                            else:
                                if  self._isEligibleForUpdatingConceptNodeStatus(collectionContexts, assignmentStudyTrackID, studyTrackIDCollectionContextsMap):
                                    #
                                    #  Update existing status entry.
                                    #
                                    if status and nodeStatus.status != status:
                                        nodeStatus.status = status
                                    #
                                    #  Update last access timestamp and score.
                                    #
                                    if forceUpdate or (lastAccess and ( not nodeStatus.lastAccess or lastAccess > nodeStatus.lastAccess )):
                                        if lastAccess:
                                            nodeStatus.lastAccess = lastAccess
                                        if score is not None and score != '':
                                            ## For assignments, restrict the reported score to 100%
                                            nodeStatus.score = score
                                            log.info("nodeStatus.score: %s" % type(nodeStatus.score).__name__)
                                            if score > 100:
                                                nodeStatus.score = 100 if assignment.assignmentType == "assignment" else score
                                            log.info("Setting nodeStatus.score=%s" % nodeStatus.score)
                                    else:
                                        log.info("Skipping score update. Later score already present.")
                                    api._update(session, nodeStatus)
                                    nodeStatusDict = nodeStatus.asDict()
                                    nodeStatusDict['conceptUpdateStatus'] = 'UPDATED'
                                    nodeStatusDict['conceptType'] = 'ASSIGNMENT'
                                    statusList.append(nodeStatusDict)
                    #
                    #  LMS related.
                    #
                    if groupID and appID:
                        ancestorDict = {}
                        for conceptEID in conceptEIDs:
                            log.debug('_updateConceptNodeStatus: conceptEID[%s]' % conceptEID)
                            log.debug('_updateConceptNodeStatus: statusList[%s]' % statusList)
                            _conceptCollectionHandle = None
                            if appID == "GOOGLE_CLASSROOM":
                                if statusList:
                                    firstStatus = statusList[0]
                                    if 'conceptCollectionHandle' in firstStatus:
                                        _conceptCollectionHandle = firstStatus['conceptCollectionHandle']
                                        log.debug('_updateConceptNodeStatus: _conceptCollectionHandle[%s]' % _conceptCollectionHandle)
                            assignmentStatuses, eids = api._getMemberStudyTrackStatusByEID(session, memberID=member.id, eid=conceptEID, groupIDs=[ groupID ], conceptCollectionHandle=_conceptCollectionHandle) 
                            log.debug('_updateConceptNodeStatus: assignmentStatuses[%s]' % assignmentStatuses)
                            log.debug('_updateConceptNodeStatus: eids[%s]' % eids)

                            eidDict = {}
                            for id, encodedID in eids:
                                eidDict[id] = encodedID

                            asgnList = []
                            for assignmentStatus in assignmentStatuses:
                                assignmentID = assignmentStatus.assignmentID
                                topic = api._getArtifactByID(session, id=assignmentID)
                                log.debug('_updateConceptNodeStatus: studyTrackItemID[%s]' % assignmentStatus.studyTrackItemID)
                                log.debug('_updateConceptNodeStatus: topic[%s]' % topic)
                                asgnList.append((eidDict[assignmentStatus.studyTrackItemID], topic))
                            ancestorDict[conceptEID] = asgnList

                        log.debug('_updateConceptNodeStatus: conceptEIDDict[%s]' % ancestorDict[conceptEID])
                        for topicEID, topic in ancestorDict[conceptEID]:
                            assignmentScore = None
                            log.debug('_updateConceptNodeStatus: topic[%s]' % topic)
                            if authType =="edmodoconnect" or appID == "GOOGLE_CLASSROOM":
                                group = api._getGroupByID(session, groupID)
                                if group:
                                    creatorID = group.creator.id
                                    log.debug("_updateConceptNodeStatus: (edmodo connect | google classroom) group [%s]"%group)
                                    log.debug("_updateConceptNodeStatus: (edmodo connect | google classroom) group creator [%s]"%creatorID)
                                    assignmentScore = lmsManager.update_assignment_score_for_member(groupMember, topic.id, score, testScoreID, topic.name, groupCreator=creatorID)
                                    log.debug('_updateConceptNodeStatus: (edmodo connect | google classroom) scoreList[%s]' % scoreList)
                                else:
                                    log.error("_updateConceptNodeStatus: No group found for groupID: [%s], to call set grade API."%groupID)
                            else:
                                assignmentScore = lmsManager.update_assignment_score_for_member(groupMember, topic.id, score, testScoreID, topic.name)
                            scoreList.append(assignmentScore)
                            log.debug('_updateConceptNodeStatus: scoreList[%s]' % scoreList)

            result['response']['concept-status-list'] = statusList
            if scoreList:
                result['response']['lms-score-list'] = scoreList
            log.debug('updated concept member status list [%s]' % result)
        return result

    @d.jsonify()
    @d.checkAuth(request, False, False, ['assignmentID', 'groupID'])
    @d.trace(log, ['member','assignmentID', 'groupID'])
    def assignAssignmentToGroupMembers(self, member, assignmentID=None, groupID=None, appID=None, EIDs=None):
        """
            Assign Group Members with assignment.

            The assignment id is actually the study track id, and the assignment
            itself has not been created yet.
        """
        #log.debug("assignAssignmentToGroupMembers: params: %s" % str(request.params))
        appID = request.params.get('appID', appID)
        if not groupID:
            groupID = request.params.get('groupID', None)
        if not assignmentID:
            assignmentID = request.params.get('assignmentID', None)
        instructions = request.params.get('instructions')

        timezone = request.params.get('timezone', None)

        if appID and not assignmentID:
            ## Bugs 56641, 56109, 56630
            ## Support collection context for LTI assignments.
            concepts = request.params.get('concepts')
            if not concepts:
                concepts = request.params.get('EIDs', EIDs)
                if not concepts:
                    raise ex.MissingArgumentException((_(u'Required parameter EIDs is missing')).encode("utf-8"))
            log.debug("assignAssignmentToGroupMembers: concepts: [%s]" % concepts)

        assignmentType = request.params.get('assignmentType', 'assignment')
        due = request.params.get('due', None)
        if due == u'':
            due = None

        member_info = member.asDict(True, True)
        member_info['firstName'] = member_info['givenName']
        member_info['lastName'] = member_info['surname']
        member_info['imageURL'] = pylons_session.get('userImage')

        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        c.errorCode = ErrorCodes.OK
        try:
            tx = utils.transaction(self.getFuncName())
            lmsAssignment = None
            with tx as session:
                if appID:
                    #
                    # For LTI create group based on context ID which is passed as groupID
                    #
                    launch_key = request.params.get('launch_key', None)
                    lmsManager = self.getLMSInstance(appID, launchKey=launch_key, txSession=session)
                    log.debug('assignAssignmentToGroupMembers: before lmsManager.createGroup groupID [%s]' %groupID)
                    lmsGroupName = request.params.get('lmsGroupName', None)
                    log.debug('assignAssignmentToGroupMembers: lmsGroupName [%s]' %lmsGroupName)
                    groupID = lmsManager.createGroup(groupID, appID, member, lmsGroupName=lmsGroupName)
                    log.debug('assignAssignmentToGroupMembers: after lmsManager.createGroup groupID [%s]' %groupID)

                if not groupID:
                    raise ex.MissingArgumentException((_(u'Required parameter groupID is missing')).encode("utf-8"))
                if not assignmentID and not appID:
                    raise ex.MissingArgumentException((_(u'Required parameters assignmentID or appID are missing')).encode("utf-8"))

                isAdmin = api._isGroupAdmin(session, groupID=groupID, memberID=member.id)
                isSuperAdmin = api._isGroupAdmin(session, groupID=1, memberID=member.id)
                if not isAdmin and not isSuperAdmin:
                    raise ex.UnauthorizedException((_(u'Not authorized to assign any assignment to this group')).encode("utf-8"))

                memberID = member.id
                event = None
                nList = []

                artifactTypeDict = g.getArtifactTypes()
                if assignmentID:
                    #
                    #  Retrieve the study track.
                    #
                    studyTrack = api._getArtifactByID(session, id=assignmentID, typeName='study-track')
                    if not studyTrack:
                        raise ex.NotFoundException((_(u'Assignment does not exist [%s]' % assignmentID)).encode("utf-8"))
                    title = studyTrack.name
                else:
                    #
                    #  appID must be provided. Create the study track.
                    #
                    nodes = self._getNodes(session, concepts)
                    log.debug("assignAssignmentToGroupMembers Got nodes: [%s]" % str(nodes))
                    title = request.params.get('assignmentTitle')
                    suffix = '%s:%s' % (groupID, appID)
                    if not title:
                        title = suffix
                        name = title
                    else:
                        name = '%s-%s' % (title, suffix)
                    #
                    #  See if the study track exsits already.
                    #
                    typeID = artifactTypeDict['study-track']
                    handle = request.params.get('handle', None)
                    if not handle:
                        handle = model.title2Handle(name)
                    handle = 'lms:%s' % handle
                    studyTrack = api._getArtifactByHandle(session, handle, typeID, member.id)
                    if not studyTrack:
                        #
                        #  Create the study track.
                        #
                        studyTrack = api._createStudyTrack(session,
                                                           creator=member,
                                                           name=name,
                                                           handle=handle,
                                                           nodes=nodes)
                        stDict = self._asDict(session, studyTrack)
                        log.debug('assignAssignmentToGroupMembers: Created studyTrack[%s]' % stDict)
                #
                #  Retrieve the group.
                #
                group = api._getGroupByID(session, groupID)
                log.debug('assignAssignmentToGroupMembers: retrieved group [%s] for groupID [%s] groupID' %(group, groupID))
                if not group.isClassGroup():
                    raise ex.WrongTypeException((_(u'Cannot assign assignment to non class group')).encode("utf-8"))
                #
                #  See if the assignment exists alreay.
                #
                query = session.query(model.Artifact)
                query = query.join(model.ArtifactAndChildren, model.ArtifactAndChildren.id == model.Artifact.id)
                query = query.filter(model.ArtifactAndChildren.childID == studyTrack.id)
                assignments = query.all()
                assignment = None
                for a in assignments:
                    asgn = api._getAssignmentByID(session, a.id)
                    if asgn.groupID == group.id:
                        assignment = a
                        break
                if assignment:
                    #
                    #  Update the assignment.
                    #
                    doUpdate = False
                    if due:
                        #
                        #  We don't need to get asgn again since it's set when setting assignment.
                        #
                        #asgn = api._getAssignmentByID(session, assignment.id)
                        dd = None
                        try:
                            dd = dt.strptime(due, '%Y-%m-%d %H:%M:%S')
                        except ValueError:
                            dd = dt.strptime(due, '%Y-%m-%d')

                        if dd:
                            api.validateDueDate(dd)
                        asgn.due = dd
                        doUpdate = True
                    elif instructions is not None:
                        asgn.description = instructions
                        doUpdate = True
                    if doUpdate:
                        session.add(asgn)
                else:
                    #
                    #  Create the assignment.
                    #
                    data = {
                        'groupID': groupID,
                        'creator': member,
                        'assignmentType' : assignmentType,
                        'origin': 'ck-12' if not appID else 'lms',
                        'due': due,
                        'studyTrack': studyTrack,
                        'handle': '%s-%s' % (studyTrack.handle, group.handle),
                        'description': instructions
                    }
                    assignment = api._createAssignment(session, **data)

                if appID:
                    lmsManager.session = session
                    node = nodes[0]
                    if node.encodedID:
                        eid = node.encodedID
                    else:
                        eid = str(node.id)
                    contextID = request.params.get('lmsGroupID', None)
                    lmsAssignmentID = None
                    if appID == "GOOGLE_CLASSROOM":
                        lmsAssignment, lmsAssignmentID = lmsManager.createLMSAssignment(title=title, due=due, groupID=group.id, eid=eid, contextID=contextID, instructions=instructions, assignmentID=assignment.id, timezone=timezone)
                    else:
                        lmsAssignmentID = lmsManager.createLMSAssignment(title=title, due=due, groupID=group.id, eid=eid, contextID=contextID, instructions=instructions, assignmentID=assignment.id)
                    lmsManager.createLMSAssignmentAssociation(lmsAssignmentID, assignment.id)
                #
                #  Assign to group members.
                #
                fq=[('groupMemberRoleID', 14)]
                groupMembers = api._getGroupMembers(session, group=group, fq=fq, pageSize=0)
                if groupMembers and len(groupMembers) > 0:
                    #
                    #  Create the member study track items, if it does not exist yet.
                    #
                    children = studyTrack.revisions[0].children
                    self._updateMemberStudyTrackItems(session, assignment.id, children, groupMembers=groupMembers)
                #
                #  Add Group Activity for assignment
                #
                kwargs = {}
                kwargs['groupID'] = groupID
                kwargs['ownerID'] = memberID
                kwargs['objectID'] = None
                kwargs['objectType'] = None
                kwargs['activityType'] = 'assign'
                activityData = {"name": assignment.name, "assignmentID": assignment.id, "owner": assignment.creatorID}
                kwargs['activityData'] = json.dumps(activityData)
                groupActivity = api._addGroupActivity(session, **kwargs)
                log.debug("Group Activity for assignment [%s] " % groupActivity.asDict())
                if not appID:
                    #
                    #  Email to group members about this new assignment.
                    #
                    eventType = api._getEventTypeByName(session, 'ASSIGNMENT_ASSIGNED')
                    if eventType:
                        notifications = api._getNotificationsByFilter(session, filters=[('eventTypeID', eventType.id), ('groupID', group.id), ('frequency', 'instant')]).results
                        for notification in notifications:
                            nList.append(notification.id)

                        if len(nList) > 0:
                            data = {
                                'creator': member.fix().name,
                                'group': group.name,
                                'assignment': assignment.name,
                                'assignmentURL': '/group-assignments/%s' % group.id,
                                'groupID': group.id,
                                'groupURL': '/group/%s' % group.id,
                                'myGroups': '/my/groups',
                                'id': assignment.id,
                                'type': 'assignment'
                            }
                            data = json.dumps(data)
                            event = api._createEventForType(session, typeName='ASSIGNMENT_ASSIGNED', objectID=group.id, objectType='group', eventData=data, ownerID=memberID, processInstant=False)

                    eventTypeName = 'ASSIGNMENT_ASSIGNED_WEB'
                    eventType = api._getEventTypeByName(session, eventTypeName)
                    if eventType:
                        event_data = json.dumps({
                            'member': member_info,
                            'creator': member.fix().name,
                            'group': group.name,
                            'groupID': group.id,
                            'group_name': group.name,
                            'assignment': assignment.name,
                            'assignmentURL': '/group-assignments/%s' % group.id,
                            'groupURL': '/group/%s' % group.id,
                            'myGroups': '/my/groups',
                            'id': assignment.id,
                            'type': 'assignment'
                        })
                        notificationFilters = [('eventTypeID', eventType.id), ('groupID', group.id)]
                        n.createEventForTypeHelperWithSession(session, eventTypeName, memberID, event_data, group.id, 'group', False, notificationFilters)

                asDict = self._asDict(session, assignment)
                result['response']['assignment'] = asDict
                if lmsAssignment:
                    result['response']['lmsAssignment'] = lmsAssignment

            if event:
                h.processInstantNotifications([event.id] * len(nList), notificationIDs=nList, noWait=False)

            return result
        except ex.MissingArgumentException, mae:
            log.debug('assignAssignmentToGroupMembers: Missing Argument Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
            return ErrorCodes().asDict(c.errorCode, str(mae))
        except ex.UnauthorizedException, uae:
            log.debug('assignAssignmentToGroupMembers: Unauthorized Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
            return ErrorCodes().asDict(c.errorCode, str(uae))
        except ex.NotFoundException, nfe:
            log.debug('assignAssignmentToGroupMembers: No Such assignment Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.NO_SUCH_ASSIGNMENT
            return ErrorCodes().asDict(c.errorCode, str(nfe))
        except ex.WrongTypeException, wte:
            log.debug('assignAssignmentToGroupMembers: Cannot create assignment for this group type Exception [%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.CANNOT_CREATE_ASSIGNMENT
            return ErrorCodes().asDict(c.errorCode, str(wte))
        except ex.AlreadyExistsException, aee:
            log.debug('assignAssignmentToGroupMembers: Assignment conflict[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.ARTIFACT_ALREADY_EXIST
            return ErrorCodes().asDict(c.errorCode, str(aee))
        except ex.InvalidArgumentException, iae:
            log.debug('assignAssignmentToGroupMembers: Invalid Argument Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.INVALID_ARGUMENT
            return ErrorCodes().asDict(c.errorCode, str(iae))
        except ex.ExternalException, ee:
            log.debug('assignAssignmentToGroupMembers: External Exception [%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.EXTERNAL_ERROR
            return ErrorCodes().asDict(c.errorCode, str(ee))
        except Exception, e:
            log.debug('assignAssignmentToGroupMembers: Exception[%s] traceback' %(traceback.format_exc()))
            if c.errorCode == ErrorCodes.OK:
                c.errorCode = ErrorCodes.CANNOT_UPDATE_ASSIGNMENT
            return ErrorCodes().asDict(c.errorCode, str(e))


    @d.trace(log, ['member','assignmentID', 'groupID','EIDs', 'appID','providerGroupID', 'title', 'handle'])
    def assignLMSAssignmentToGroupMembers(self, session, member, groupID, appID, assignmentID=None, EIDs=None, title=None, handle=None, providerGroupID=True):
        """
            Assign Group Members with assignment.

            The assignment id is actually the study track id, and the assignment
            itself has not been created yet.
        """
        
        log.debug('assignLMSAssignmentToGroupMembers: assignmentID [%s]' %assignmentID)
        log.debug('assignLMSAssignmentToGroupMembers: EIDs [%s]' %EIDs)
        if not assignmentID:
            concepts = EIDs
            log.debug('assignLMSAssignmentToGroupMembers: EIDs [%s]' %EIDs)
            if not concepts:
                raise ex.MissingArgumentException((_(u'Required parameter EIDs is missing')).encode("utf-8"))

        assignmentType = 'assignment'
        due = None
        adminMember = None
        nodes = None

        c.errorCode = ErrorCodes.OK
        try:
            lmsManager = self.getLMSInstance(appID, txSession=session)
            # For LTI create group based on context ID which is passed as groupID
            #
            if providerGroupID:
                groupID = lmsManager.createGroup(groupID, appID, member)

            if not groupID:
                raise ex.MissingArgumentException((_(u'Required parameter groupID is missing')).encode("utf-8"))
            if not assignmentID and not EIDs:
                raise ex.MissingArgumentException((_(u'Required parameters assignmentID or EIDs are missing')).encode("utf-8"))

            isAdmin = api._isGroupAdmin(session, groupID=groupID, memberID=member.id)
            isSuperAdmin = api._isGroupAdmin(session, groupID=1, memberID=member.id)
            if not isAdmin and not isSuperAdmin:
                # Use the LMS Admin member
                adminMember = api._getMemberByEmail(session, "ck12.lms.admin@ck12.org")

            artifactTypeDict = g.getArtifactTypes()
            if assignmentID:
                #
                #  Retrieve the study track.
                #
                studyTrack = api._getArtifactByID(session, id=assignmentID, typeName='study-track')
                log.debug("assignLMSAssignmentToGroupMembers: studyTrack [%s]" %studyTrack)
                if not studyTrack:
                    raise ex.NotFoundException((_(u'Assignment does not exist [%s]' % assignmentID)).encode("utf-8"))
                title = studyTrack.name
            else:
                raise ex.NotFoundException((_(u'Study track does not exist [%s] cannot create assignment.' % assignmentID)).encode("utf-8"))

            #
            #  Retrieve the group.
            #
            group = api._getGroupByID(session, groupID)
            if not group.isClassGroup():
                raise ex.WrongTypeException((_(u'Cannot assign assignment to non class group')).encode("utf-8"))
            #
            #  See if the assignment exists alreay.
            #
            query = session.query(model.Artifact)
            query = query.join(model.ArtifactAndChildren, model.ArtifactAndChildren.id == model.Artifact.id)
            query = query.filter(model.ArtifactAndChildren.childID == studyTrack.id)
            assignments = query.all()
            assignment = None
            log.debug('assignLMSAssignmentToGroupMembers: assignments !! [%s]' %assignments)
            if assignments:
                api_getAssignmentByID = api._getAssignmentByID
                for a in assignments:
                    asgn = api_getAssignmentByID(session, a.id)
                    if asgn.groupID == group.id:
                        assignment = a
                        break
                if assignment:
                    #
                    #  Update the assignment.
                    #
                    if due:
                        #
                        #  We don't need to get asgn again since it's set when setting assignment.
                        #
                        #asgn = api._getAssignmentByID(session, assignment.id)
                        dd = None
                        try:
                            dd = dt.strptime(due, '%Y-%m-%d %H:%M:%S')
                        except ValueError:
                            dd = dt.strptime(due, '%Y-%m-%d')

                        if dd:
                            api.validateDueDate(dd)
                        asgn.due = dd
                        session.add(asgn)
                else:
                    #
                    #  Create the assignment.
                    #
                    data = {
                        'groupID': groupID,
                        'creator': member if not adminMember else adminMember,
                        'assignmentType' : assignmentType,
                        'origin': 'lms',
                        'due': due,
                        'studyTrack': studyTrack,
                        'handle': '%s-%s' % (studyTrack.handle, group.handle)
                    }
                    assignment = api._createAssignment(session, **data)

            lmsManager.session = session
            if nodes:
                node = nodes[0]
                if node.encodedID:
                    eid = node.encodedID
                else:
                    eid = str(node.id)
            else:
                eid = 'study.track.%s' % studyTrack.id
            lmsAssignmentID = lmsManager.createLMSAssignment(title=title, due=due, groupID=group.id, eid=eid, assignmentID=assignment.id)
            lmsManager.createLMSAssignmentAssociation(lmsAssignmentID, assignment.id)
            #
            #  Assign to group members.
            #
            fq=[('groupMemberRoleID', 14)]
            groupMembers = api._getGroupMembers(session, group=group, fq=fq, pageSize=0)
            if groupMembers and len(groupMembers) > 0:
                #
                #  Create the member study track items, if it does not exist yet.
                #
                children = studyTrack.revisions[0].children
                self._updateMemberStudyTrackItems(session, assignment.id, children, groupMembers=groupMembers)
            #
            #  Add Group Activity for assignment
            #
            kwargs = {}
            kwargs['groupID'] = groupID
            kwargs['ownerID'] = member.id if not adminMember else adminMember.id
            kwargs['objectID'] = None
            kwargs['objectType'] = None
            kwargs['activityType'] = 'assign'
            activityData = {"name": assignment.name, "assignmentID": assignment.id, "owner": assignment.creatorID}
            kwargs['activityData'] = json.dumps(activityData)
            groupActivity = api._addGroupActivity(session, **kwargs)
            log.debug("Group Activity for assignment [%s] " % groupActivity.asDict())

            assignmentDict = self._asDict(session, assignment)
                

            return assignmentDict
        except ex.MissingArgumentException, mae:
            log.debug('assignLMSAssignmentToGroupMembers: Missing Argument Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
            return ErrorCodes().asDict(c.errorCode, str(mae))
        except ex.UnauthorizedException, uae:
            log.debug('assignLMSAssignmentToGroupMembers: Unauthorized Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
            return ErrorCodes().asDict(c.errorCode, str(uae))
        except ex.NotFoundException, nfe:
            log.debug('assignLMSAssignmentToGroupMembers: No Such assignment Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.NO_SUCH_ASSIGNMENT
            return ErrorCodes().asDict(c.errorCode, str(nfe))
        except ex.WrongTypeException, wte:
            log.debug('assignLMSAssignmentToGroupMembers: Cannot create assignment for this group type Exception [%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.CANNOT_CREATE_ASSIGNMENT
            return ErrorCodes().asDict(c.errorCode, str(wte))
        except ex.AlreadyExistsException, aee:
            log.debug('assignLMSAssignmentToGroupMembers: Assignment conflict[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.ARTIFACT_ALREADY_EXIST
            return ErrorCodes().asDict(c.errorCode, str(aee))
        except ex.InvalidArgumentException, iae:
            log.debug('assignLMSAssignmentToGroupMembers: Invalid Argument Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.INVALID_ARGUMENT
            return ErrorCodes().asDict(c.errorCode, str(iae))
        except ex.ExternalException, ee:
            log.debug('assignLMSAssignmentToGroupMembers: External Exception [%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.EXTERNAL_ERROR
            return ErrorCodes().asDict(c.errorCode, str(ee))
        except Exception, e:
            log.debug('assignLMSAssignmentToGroupMembers: Exception[%s] traceback' %(traceback.format_exc()))
            if c.errorCode == ErrorCodes.OK:
                c.errorCode = ErrorCodes.CANNOT_UPDATE_ASSIGNMENT
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, False)
    @d.filterable(request, ['member'], noformat=True)
    @d.trace(log, ['member', 'fq'])
    def getCounts(self, member, fq=None):
        """
            Returns the following counts for the logged in user:

            1. Assigned assignments.
            2. Self study tracks.
            3. Group activities.
            4. Group Count
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        c.errorCode = ErrorCodes.OK
        try:
            memberID = member.id

            tx = utils.transaction(self.getFuncName())
            with tx as session:
                assignmentCount = api._getMemberIncompleteAssignments(session, memberID=memberID, assignmentType='assignment', lms=False, fq=fq, artifactTypeDict=g.getArtifactTypes(), countOnly=True)
                selfStudyCount = api._getMemberSelfStudyCount(session, memberID)
                groupCount = api._countMemberGroups(session, memberID, origin='ck-12')
                classCount = api._countMemberGroups(session, memberID, groupType='class', origin='ck-12')
                studyGroupCount = api._countMemberGroups(session, memberID, groupType='study', origin='ck-12')
                groupActivityCount = api._countMemberGroupsActivities(session, memberID)
                distinctMemberCountInGroups = api._countDistinctMembersInGroups(session, memberID, groupTypes=['study', 'class'], origin='ck-12')
            result['response']['assignment-count'] = assignmentCount
            result['response']['self-study-count'] = selfStudyCount
            result['response']['group-count'] = groupCount
            result['response']['class-count'] = classCount
            result['response']['study-group-count'] = studyGroupCount
            result['response']['group-activity-count'] = groupActivityCount
            result['response']['distinct-group-member-count'] = distinctMemberCountInGroups
            return result
        except Exception, e:
            log.debug('getCounts: Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.CANNOT_LOAD_REQUIRED_COUNTS
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, False, ['groupID'])
    @d.sortable(request, ['member', 'groupID'])
    @d.setPage(request, ['member', 'groupID', 'sort'])
    @d.trace(log, ['member', 'groupID', 'pageNum', 'pageSize', 'sort'])
    def getGroupAssignments(self, member, groupID, pageNum, pageSize, sort):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        c.errorCode = ErrorCodes.OK
        try:
            memberID = member.id
            artifactTypeDict = g.getArtifactTypes()
            types = request.params.get('types', 'assignment,study-track')
            if not types:
                typeIDs = [ artifactTypeDict['assignment'] ]
            else:
                typeNames = types.split(',')
                typeIDs = []
                for typeName in typeNames:
                    if typeName not in ['assignment', 'study-track']:
                        raise ex.InvalidArgumentException((_(u'Unsupported type: [%s]' % typeName)).encode("utf-8"))
                    typeIDs.append(artifactTypeDict[typeName])

            log.debug("typeIDs: %s" % typeIDs)
            isSuperAdmin = api.isGroupAdmin(groupID=1, memberID=member.id)  or u.isMemberAdmin(member)
            if isSuperAdmin:
                member = u.getImpersonatedMember(member)
                memberID = member.id
            tx = utils.transaction(self.getFuncName())
            with tx as session:
                isGroupAdmin = api._isGroupAdmin(session, groupID=groupID, memberID=member.id)
                if not isGroupAdmin and not isSuperAdmin:
                        raise ex.UnauthorizedException((_(u'You are not the admin of this group')).encode("utf-8"))
                #
                #  Get the artifacts of both assignments and study tracks,
                #  if specified in typeIDs, created by this member.
                #
                artifacts = api._getAssignmentsByCreatorID(session,
                                                           creatorID=memberID,
                                                           typeIDs=typeIDs,
                                                           artifactTypeDict=artifactTypeDict,
                                                           groupID=groupID,
                                                           sort=sort,
                                                           pageNum=pageNum,
                                                           pageSize=pageSize)

                assignmentDict = {}
                aList = []
                for artifact in artifacts:
                    #
                    #  Process both study tracks and assignments.
                    #
                    revisions = artifact.revisions
                    if revisions and len(revisions) > 0:
                        if artifact.type.name != 'assignment':
                            revision = revisions[0]
                        else:
                            child = revisions[0].children[0]
                            if child.child is not None:
                                revision = child.child
                            else:
                                revision = api._getArtifactRevisionByID(session, child.hasArtifactRevisionID)
                        conceptCount = len(revision.children)
                    else:
                        conceptCount = 0
                    stDict = {
                        'id': artifact.id,
                        'name': artifact.name,
                        'description': artifact.description,
                        'assigned': 0,
                        'totalCount': conceptCount,
                    }
                    aList.append(stDict)
                    if artifact.type.name == 'assignment':
                        assignmentDict[artifact.id] = stDict
                    elif artifact.type.name != 'study-track':
                        raise ex.InvalidArgumentException((_(u'Invalid artifact type %s' % artifact.type.name)).encode("utf-8"))

                if len(assignmentDict) > 0:
                    #
                    #  Add additional data for the assignments.
                    #
                    if not groupID:
                        raise ex.MissingArgumentException((_(u'Required parameter, groupID, is missing')).encode("utf-8"))

                    assignments = api._getAssignments(session, assignmentIDs=assignmentDict.keys(), groupID=groupID)
                    for assignment in assignments:
                        today = dt.now().date()
                        due = assignment.due
                        dueDt = due.date() if due else ''
                        stDict = assignmentDict[assignment.assignmentID]
                        
                        nodeStatusList = api._getMemberStudyTrackStatus(session, memberIDs=[], assignmentID=assignment.assignmentID, groupIDs=[groupID])
                        conceptsDict = {}
                        conceptsMemberDict = {}
                        for nodeStatus in nodeStatusList:
                            itemID = int(nodeStatus.studyTrackItemID)
                            if not conceptsDict.has_key(itemID) or conceptsDict[itemID] == 'completed':
                                conceptsDict.update({itemID : nodeStatus.status})
                            memberID = int(nodeStatus.memberID)
                            if not conceptsMemberDict.has_key(memberID):
                                conceptsMemberDict[memberID] = { 'completed': 0, 'incomplete': 0}
                            conceptsMemberDict[memberID][nodeStatus.status] += 1

                        memberCompletedCount = memberIncompleteCount = 0
                        conceptsStatus = conceptsDict.values()
                        for m in conceptsMemberDict.keys():
                            if conceptsMemberDict[m].get('completed') == stDict['totalCount']:
                                memberCompletedCount += 1
                            else:
                                memberIncompleteCount += 1

                        stDict.update({
                            'assigned': 1,
                            'due': due if due else '',
                            'isPastDue': 1 if dueDt and today > dueDt else 0,
                            'completedCount' : conceptsStatus.count('completed'),
                            'incompleteCount' : conceptsStatus.count('incomplete'),
                            'memberCompletedCount' : memberCompletedCount,
                            'memberIncompleteCount' : memberIncompleteCount
                        })
                log.debug('getGroupAssignments: aList[%s]' % aList)
            result['response']['assignments'] = aList
            result['response']['total'] = artifacts.total
            result['response']['limit'] = len(artifacts)
            result['response']['offset'] = (pageNum - 1)*pageSize
            return result
        except ex.UnauthorizedException, uae:
            log.error('getGroupAssignments: Unauthorized Exception[%s] traceback' %(traceback.format_exc()), exc_info=uae)
            c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
            return ErrorCodes().asDict(c.errorCode, str(uae))
        except ex.MissingArgumentException, mae:
            log.debug('getGroupAssignments: Missing Argument Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
            return ErrorCodes().asDict(c.errorCode, str(mae))
        except ex.InvalidArgumentException, iae:
            log.debug('getGroupAssignments: Invalid Argument Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.INVALID_ARGUMENT
            return ErrorCodes().asDict(c.errorCode, str(iae))
        except Exception, e:
            log.error('getGroupAssignments: Exception[%s] traceback' %(traceback.format_exc()), exc_info=e)
            if c.errorCode == ErrorCodes.OK:
                c.errorCode = ErrorCodes.NO_SUCH_ASSIGNMENT
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, False, ['id', 'providerAssignmentID'])
    @d.trace(log, ['member', 'id', 'providerAssignmentID'])
    def deleteLMSProviderAssignment(self, member, id, providerAssignmentID=None):
        """
            Deletes an LMS Provider assignment association.
            Only Admin user can access this API
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        c.errorCode = ErrorCodes.OK
        try:
            if not id:
                id = request.params.get('id', None)
            if not id:
                raise ex.MissingArgumentException((_(u'Assignment ID missing.')).encode("utf-8"))

            if not providerAssignmentID:
                providerAssignmentID = request.params.get('providerAssignmentID', None)

            if not providerAssignmentID:
                raise ex.MissingArgumentException((_(u'Provider Assignment ID missing.')).encode("utf-8"))

            isSuperAdmin = api.isGroupAdmin(groupID=1, memberID=1)
            if not isSuperAdmin:
                raise ex.UnauthorizedException((_(u'Not authorized to access this api')).encode("utf-8"))

            tx = utils.transaction(self.getFuncName())
            with tx as session:
                #
                #  Lookup the assignment assuming the given id is the
                #  internal id.
                #
                assignment = api._getLMSProviderAssignments(session, assignmentID=id)
                assignment = assignment[0]
                if not assignment:
                    c.errorCode = ErrorCodes.NO_SUCH_ASSIGNMENT
                    raise Exception((_(u'Assignment of id %s does not exist.' % id)).encode("utf-8"))

                #
                #  Delete the LMS Provider assignment.
                #
                api._deleteLMSProviderAssignment(session,
                                      assignment.assignmentID,
                                      providerAssignmentID=providerAssignmentID)
                api._deleteLMSProviderAssignmentScore(session, 
                                                      providerID=assignment.providerID,
                                                      providerAssignmentID=assignment.providerAssignmentID)
            result['response'] = "Success"
            return result
        except ex.UnauthorizedException, uae:
            log.debug('Delete assignment: Unauthorized Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
            return ErrorCodes().asDict(c.errorCode, str(uae))
        except Exception, e:
            log.debug('Delete assignment Exception[%s] traceback' %(traceback.format_exc()))
            if c.errorCode == ErrorCodes.OK:
                c.errorCode = ErrorCodes.CANNOT_DELETE_ASSIGNMENT
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, False, ['types'])
    @d.sortable(request, ['fq', 'pageNum', 'pageSize', 'sort'])
    @d.filterable(request, ['sort'], noformat=True)
    @d.setPage(request, ['fq', 'sort'])
    @d.trace(log, ['fq', 'pageNum', 'pageSize', 'sort'])
    def getAllAssignments(self, fq, pageNum, pageSize, sort):
        """
            Returns assignment info.
            Only Admin user can access this API
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        c.errorCode = ErrorCodes.OK
        try:
            isSuperAdmin = api.isGroupAdmin(groupID=1, memberID=1)
            if not isSuperAdmin:
                raise ex.UnauthorizedException((_(u'Not authorized to view all assignments')).encode("utf-8"))

            tx = utils.transaction(self.getFuncName())
            with tx as session:
                assignmentDict = {}
                aList = []
                assignments = api._getAssignmentsByFilters(session, filters=fq, sort=sort, pageNum=pageNum, pageSize=pageSize)
                for assignment in assignments:
                    artifact = api._getArtifactByID(session, id=assignment.assignmentID, typeName='assignment')
                    conceptCount = len(api._getArtifactRevisionChildren(session, artifact.revisions[0].children[0].hasArtifactRevisionID))
                    assignmentDict = {}
                    today = dt.now().date()
                    dueDt = assignment.due.date() if assignment.due else ''
                    assignmentDict['id'] = artifact.id
                    assignmentDict['name'] =  artifact.name
                    assignmentDict['description'] = artifact.description
                    assignmentDict['artifact'] = artifact.asDict()
                    assignmentDict['totalCount'] = conceptCount
                    assignmentDict['assigned'] = 1
                    assignmentDict['due'] = assignment.due if assignment.due else ''
                    assignmentDict['groupID'] = assignment.groupID
                    assignmentDict['assignmentType'] = assignment.assignmentType
                    assignmentDict['origin'] = assignment.origin
                    # if origin is lms then add lms information in details
                    if assignment.origin == 'lms':
                        lmsProviderAssignments = api._getLMSProviderAssignments(session, assignmentID=assignment.assignmentID)
                        if (lmsProviderAssignments):
                            assignmentDict['lmsAssignment'] = lmsProviderAssignments[0].asDict()
                    assignmentDict['isPastDue'] = 1 if dueDt and today > dueDt else 0
                    aList.append(assignmentDict)
                log.debug('getGroupAssignments: aList[%s]' % aList)
            result['response']['assignments'] = aList
            result['response']['total'] = assignments.getTotal()
            result['response']['limit'] = len(assignments)
            result['response']['offset'] = (pageNum - 1)*pageSize
            return result
        except ex.UnauthorizedException, uae:
            log.debug('getGroupAssignments: Unauthorized Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
            return ErrorCodes().asDict(c.errorCode, str(uae))
        except ex.MissingArgumentException, mae:
            log.debug('getGroupAssignments: Missing Argument Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
            return ErrorCodes().asDict(c.errorCode, str(mae))
        except ex.InvalidArgumentException, iae:
            log.debug('getGroupAssignments: Invalid Argument Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.INVALID_ARGUMENT
            return ErrorCodes().asDict(c.errorCode, str(iae))
        except Exception, e:
            log.debug('getGroupAssignments: Exception[%s] traceback' %(traceback.format_exc()))
            if c.errorCode == ErrorCodes.OK:
                c.errorCode = ErrorCodes.NO_SUCH_ASSIGNMENT
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.trace(log, ['member', 'assignmentType', 'fq', 'sort', 'groupID', 'detailed', 'assignmentID', 'pageNum', 'pageSize'])
    def _memberAssignments(self, member, assignmentType, fq=None, sort=None, groupID=None, detailed=False, assignmentID=None, pageNum=1, pageSize=10):
        log.debug('_memberAssignments: assignmentType[%s] fq[%s] sort[%s] groupID[%s]' % (assignmentType, fq, sort, groupID))
        appID = request.params.get('appID', None)
        log.debug('_memberAssignments: appID[%s]' % appID)
        log.debug('_memberAssignments: assignmentID[%s]' % assignmentID)
        if groupID:
            groupIDs = [ groupID ]
        else:
            groupIDs = []

        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            memberID = member.id
            artifactTypeDict = g.getArtifactTypes()

            tx = utils.transaction(self.getFuncName())
            with tx as session:
                if appID:
                    #
                    #  LMS App.
                    #
                    lmsGroups = api._getLMSProviderGroupsOfMember(session, memberID=memberID, appID=appID)
                    if not groupIDs:
                        for lmsGroup in lmsGroups:
                            groupIDs.append(lmsGroup.groupID)

                if groupIDs:
                    for groupID in groupIDs:
                        isMember = api._isGroupMember(session, groupID=groupID, memberID=memberID)
                        if not isMember:
                            raise ex.UnauthorizedException((_(u'Member is not authorized to access this group assignments')).encode("utf-8"))

                eids = branchName = None
                state = 'incomplete'
                if fq:
                    for f in fq:
                        if f[0] == 'state':
                            state = f[1]
                        elif f[0] == 'subject':
                            eid = f[1]
                            #
                            #  Get the subject browse term.
                            #
                            top = api._getBrowseTermByEncodedID(session, eid)
                            if not top:
                                raise ex.InvalidArgumentException((_(u'Invalid subject: %s.' % eid)).encode("utf-8"))
                            branchName = top.name
                            #
                            #  Get the topic browse terms.
                            #
                            browseTerms = api._getBrowseTermDescendants(session, id=top.id, levels=1)
                            #
                            #  Get the topic browse term EIDs.
                            #
                            eids = [ top.encodedID ]
                            for browseTerm in browseTerms:
                                eids.append(browseTerm.encodedID)

                if state == 'completed' or assignmentID:
                    states = [state] if state else None
                    assignments = api._getMemberAssignments(session, memberID=memberID, assignmentType=assignmentType, groupIDs=groupIDs, states=states, eids=eids, assignmentID=assignmentID, pageNum=pageNum, pageSize=pageSize, fq=fq, sort=sort, lms=appID is not None)
                else:
                    assignments = api._getMemberIncompleteAssignments(session, memberID=memberID, assignmentType=assignmentType, groupIDs=groupIDs, eids=eids, pageNum=pageNum, pageSize=pageSize, fq=fq, sort=sort, artifactTypeDict=artifactTypeDict, lms=appID is not None)
                if assignments is None:
                    raise ex.MissingArgumentException((_(u'Required parameters are missing')).encode("utf-8"))

                assignmentIDs = []
                for assignment in assignments:
                    assignmentIDs.append(assignment.assignmentID)
                log.debug('_memberAssignments: assignmentIDs[%s]' % assignmentIDs)
                nodeStatusLists = api._getMemberStudyTrackStatus(session, memberIDs=[member.id], assignmentIDs=assignmentIDs, groupIDs=groupIDs, includeTrackArtifact=True)
                nodeStatusDict = {}
                assignmentID = None
                nodeStatusList = []
                for nodeStatus, a in nodeStatusLists:
                    if nodeStatus.assignmentID != assignmentID:
                        if assignmentID:
                            nodeStatusDict[assignmentID] = nodeStatusList
                            log.debug('_memberAssignments: nodeStatusDict[%s][%s]' % (assignmentID, nodeStatusDict[assignmentID]))
                        assignmentID = nodeStatus.assignmentID
                        nodeStatusList = []
                    nodeStatusList.append((nodeStatus, a))
                if assignmentID and nodeStatusList:
                    nodeStatusDict[assignmentID] = nodeStatusList
                    log.debug('_memberAssignments: nodeStatusDict[%s][%s]' % (assignmentID, nodeStatusDict[assignmentID]))

                total = assignments.total
                assignmentList = []
                for assignment in assignments:
                    completedCount = incompleteCount = totalCount = 0
                    _assignment = assignment.asDict()
                    assignmentArtifact = assignment.artifact
                    _assignment['name'] = assignmentArtifact.name
                    _assignment['description'] = assignmentArtifact.description
                    today = dt.strptime(dt.now().__format__('%m/%d/%Y'), '%m/%d/%Y')
                    _assignment['isPastDue'] = 1 if assignment.due and assignment.due < today else 0
                    studyTrack = assignmentArtifact.revisions[0].children[0].child.artifact
                    #
                    # Find out and add branch name for self study
                    #
                    if assignment.assignmentType == 'self-study':
                        topicID = assignmentArtifact.handle
                        if topicID:
                            if branchName:
                                _assignment['branchName'] = branchName
                            else:
                                log.debug('_memberAssignment: no branchName for[%s]' % topicID)
                                browseTerm = api._getBrowseTermByEncodedID(session, topicID)
                                if browseTerm:
                                    subjects = api._getSubjectsForDomainID(session, browseTerm.id)
                                    if len(subjects) == 2:
                                        _assignment['branchName'] = subjects[1].name
                            # TODO: Get subject EID in better way if possible
                            _assignment['branchEncodedID'] = topicID[:7]
                    else:
                        _assignment['instructions'] = studyTrack.getSummary()

                    if detailed:
                        if assignment.group:
                            group = assignment.group.asDict()
                            groupImageUri = group['resource']['uri'] if group.get('resource') else ''
                            _assignment['group'] = {'name':group['name'], 'id':group['id'], 'imageUri': groupImageUri}
                        _assignment['concepts'] = []

                    ctxs = stic._getStudyTrackItemContexts(session, studyTrackID=studyTrack.id)
                    ## Get children for studyTrack
                    studyTrackItemIDSeq = { c.child.artifact.id : idx for idx, c in enumerate(studyTrack.revisions[0].children) }
                    ## [Bug #57212]Sort the list using the sequence of children in the study track to maintain the original sequence.
                    nodeStatusList = sorted(nodeStatusDict[assignment.assignmentID], key=lambda k: studyTrackItemIDSeq.get(k[0].studyTrackItemID))
                    for nodeStatus, a in nodeStatusList:
                        log.debug('_memberAssignments: nodeStatus[%s]' % nodeStatus)
                        if detailed:
                            typeName = a.typeName
                            login = a.login
                            _artifact = {}
                            if a.encodedID and h.isValidDomainEID(a.encodedID):
                                _artifact['encodedID'] = a.encodedID
                            else:
                                a = a.artifact
                                if not a:
                                    a = api._getArtifactByID(session, id=a.id)
                                ds = a.getDomains()
                                domains = []
                                for d in ds:
                                    domains.append(a._getDomainTermDict(d))
                                _artifact['domains'] = domains
                            
                            for ctx in ctxs:
                                if a.id == ctx.get('studyTrackItemID'):
                                    if ctx.get('contextUrl'):
                                        _artifact['contextUrl'] = ctx.get('contextUrl')
                                    if ctx.get('conceptCollectionHandle'):
                                        _artifact['conceptCollectionHandle'] = ctx.get('conceptCollectionHandle')
                                    if ctx.get('collectionCreatorID'):
                                        _artifact['collectionCreatorID'] = ctx.get('collectionCreatorID')
                                    ctxs.remove(ctx)
                                    break
                            
                            _artifact['type'] = typeName
                            _artifact['name'] = a.name
                            _artifact['description'] = a.description
                            _artifact['handle'] = a.handle
                            _artifact['creatorID'] = a.creatorID
                            _artifact['login'] = login
                            _artifact['id'] = a.id
                            _artifact['score'] = nodeStatus.score if (nodeStatus.score is not None and nodeStatus.score !='') else ''
                            _artifact['lastAccess'] = nodeStatus.lastAccess if nodeStatus.lastAccess else ''
                            _artifact['status'] = nodeStatus.status
                            _assignment['concepts'].append(_artifact)
                        if nodeStatus.status == 'incomplete':
                            incompleteCount += 1
                        else:
                            completedCount += 1
                        totalCount += 1

                    if _assignment.has_key('concepts'):
                        _assignment['concepts'] = self._attachCollectionEncodedIDInfos(session, _assignment['concepts'])
                        _assignment['concepts'] = self._processMigratedConcepts(session, _assignment['concepts'])
                        uniqueConcepts = []
                        studyTrackItemIDs = set()
                        incompleteCount = completedCount = 0
                        for concept in _assignment['concepts']:
                            if concept['id'] not in studyTrackItemIDs:
                                studyTrackItemIDs.add(concept['id'])
                                uniqueConcepts.append(concept)
                                if concept.get('status') == 'incomplete':
                                    incompleteCount += 1
                                else:
                                    completedCount += 1
                        _assignment['concepts'] = uniqueConcepts
                        for concept in _assignment['concepts']:
                            if concept.get('encodedID'):
                                btDict = BrowseTermCache(session).loadByEID(concept['encodedID'], ck12only=True, 
                                        conceptCollectionHandle=concept.get('conceptCollectionHandle'), collectionCreatorID=concept.get('collectionCreatorID', 0))
                                if btDict:
                                    concept['ck12ModalityCount'] = btDict.get('ck12ModalityCount', {})

                        totalCount = len(uniqueConcepts)
                    _assignment['incompleteCount'] = incompleteCount
                    _assignment['completedCount'] = completedCount
                    _assignment['totalCount'] = totalCount
                    assignmentList.append(_assignment)

                if state == 'completed':
                    aCount = len(assignmentList)
                else:
                    aCount = 0
                    for groupID in groupIDs:
                        aCount += api._countMemberCompletedAssignments(session, memberID=memberID, assignmentType=assignmentType, groupID=groupID, eids=eids)

            result['response']['assignmentCompletedCount'] = aCount
            result['response']['assignments'] = assignmentList
            try:
                result['response']['total'] = total
                #
                # since we are eliminating assignment having 0 concepts totalcount needs to be changed
                #
                if eids:
                    result['response']['total'] = len(assignmentList)
            except AttributeError:
                result['response']['total'] = len(assignments)
            result['response']['limit'] = len(assignmentList)
            result['response']['offset'] = (pageNum - 1)*pageSize
        except ex.UnauthorizedException, uae:
            log.debug('_memberAssignments: Unauthorized Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
            return ErrorCodes().asDict(c.errorCode, str(uae))
        except ex.MissingArgumentException, mae:
            log.debug('_memberAssignments: Missing Argument Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
            return ErrorCodes().asDict(c.errorCode, str(mae))
        except ex.InvalidArgumentException, iae:
            log.debug('_memberAssignments: Invalid Argument Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.INVALID_ARGUMENT
            return ErrorCodes().asDict(c.errorCode, str(iae))
        except Exception:
            log.debug('_memberAssignments: Cannot fetch assignments for the user [%s] due to exception [%s]' %(member.id, traceback.format_exc()))
            c.errorCode = ErrorCodes.CANNOT_LOAD_ASSIGNMENTS
            return ErrorCodes().asDict(c.errorCode, 'Cannot fetch assignments for the user [%s]' %(member.id))

        return result

    def _authorizeMember(self, member, group, memberID=None):
            """
                Member verification scenarios:

                1. No memberID: if admin, view report of entire group, else if group member, view report of self.
                2. MemberID, but same as member.id: if group member, view report of self.
                3. MemberID, but different from member.id: if admin, view report of other group member.
            """
            isSuperAdmin = api.isGroupAdmin(groupID=1, memberID=member.id)  or u.isMemberAdmin(member)
            if isSuperAdmin:
                if memberID:
                    #
                    #  The asking memberID must belong to the given group.
                    #
                    isMember = api.isGroupMember(groupID=group.id, memberID=memberID)
                    if not isMember:
                        raise ex.InvalidArgumentException((_(u'Member %s not in group %s' % (memberID, group.id))).encode("utf-8"))
            else:
                if not memberID or long(memberID) != long(member.id):
                    #
                    #  Trying to view report of other(s).
                    #
                    isGroupAdmin = api.isGroupAdmin(groupID=group.id, memberID=member.id)
                    if not isGroupAdmin:
                        if memberID:
                            raise ex.UnauthorizedException((_(u'You are not the admin of this group')).encode("utf-8"))
                        #
                        #  Trying to view his/her own report.
                        #
                        memberID = member.id
                        isMember = api.isGroupMember(groupID=group.id, memberID=memberID)
                        if not isMember:
                            raise ex.InvalidArgumentException((_(u'Member %s not in group %s' % (memberID, group.id))).encode("utf-8"))
                else:
                    #
                    #  Trying to view his/her own report.
                    #
                    isMember = api.isGroupMember(groupID=group.id, memberID=member.id)
                    if not isMember:
                        raise ex.InvalidArgumentException((_(u'Member %s not in group %s' % (memberID, group.id))).encode("utf-8"))

            if memberID:
                fq = [('memberID', memberID) , ('groupMemberRoleID', 14)]
            else:
                fq = [('groupMemberRoleID', 14)]
            return memberID, fq


    @d.jsonify()
    @d.checkAuth(request, False, False, ['groupID'])
    @d.setPage(request, ['member', 'groupID'])
    @d.trace(log, ['member', 'groupID', 'pageNum', 'pageSize'])
    def getGroupAssignmentsReport(self, member, groupID, pageNum, pageSize):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        memberID = None
        try:
            if not groupID:
                groupID = request.params.get('groupID', None)
            groupHandle = request.params.get('groupHandle', None)

            group = None
            if groupID:
                group = api.getGroupByID(id=groupID)
            elif groupHandle:
                group = api.getGroupByHandle(handle=groupHandle)
            if not group:
                raise ex.InvalidArgumentException((_(u'Group with id %s or handle: %s does not exist' % (groupID, groupHandle))).encode("utf-8"))

            sort = None if group.groupType in ['public-forum'] else 'a_name'
            memberID, fq = self._authorizeMember(member, group, memberID=request.params.get('memberID', None))
            group_members = api.getGroupMembers(group=group, pageNum=pageNum, pageSize=pageSize, sort=sort, fq=fq)

            member_list = []
            for each_member in group_members:
                mem_info = {}
                mem_info['name'] = each_member.member_info.fix().name
                mem_info['email'] = each_member.member_info.email
                mem_info['id'] = each_member.memberID
                mem_info['groupMemberRoleID'] = each_member.roleID
                mem_info['groupMemberRole'] = each_member.role.name
                mem_info['statusID'] = each_member.statusID
                mem_info['status'] = each_member.status.name
                mem_info['joinTime'] = each_member.joinTime
                mem_info['userRole'] = each_member.member_info.systemRoles[0].role.name
                mem_info['userRoleID'] = each_member.member_info.systemRoles[0].roleID
                member_list.append(mem_info)
            memberIDs =  [m['id'] for m in member_list]

            assignments = api.getAssignmentsByGroupID(groupID=groupID, memberID=memberID).results
            assignmentIDs =  [a.assignmentID for a in assignments]
            nodeStatusLists = api.getMemberStudyTrackStatus(memberIDs=memberIDs, assignmentIDs=assignmentIDs)
            nodeStatusDict = {}
            nodeStatusList = []
            prevAsID = None
            for n in nodeStatusLists:
                if n.assignmentID != prevAsID:
                    if prevAsID:
                        nodeStatusDict[prevAsID] = nodeStatusList
                        nodeStatusList = []
                    prevAsID = n.assignmentID
                nodeStatusList.append(n)
            if prevAsID and nodeStatusList:
                nodeStatusDict[n.assignmentID] = nodeStatusList
            log.debug('getGroupAssignmentsReport: nodeStatusDict[%s]' % nodeStatusDict)

            member_assignment = {}
            assignmentList = []
            for assignment in assignments:
                totalCount = 0
                _assignment = assignment.asDict()
                _assignment['name'] = assignment.artifact.name
                _assignment['description'] = assignment.artifact.description
                _assignment['isPastDue'] = 1 if assignment.due and assignment.due < dt.now() else 0
                _assignment['creationTime'] = assignment.artifact.creationTime
                _assignment['concepts'] = []
                assignmentArtifact = assignment.artifact
                studyTracks = assignmentArtifact.revisions[0].children
                nodeStatusList = nodeStatusDict.get(assignment.assignmentID)
                log.debug('getGroupAssignmentsReport: nodeStatusList[%s]' % nodeStatusList)
                for st in studyTracks:
                    ctxs = {}
                    studyTrackArtifactRevision = api.getArtifactRevisionByID(st.hasArtifactRevisionID)
                    if studyTrackArtifactRevision:
                        studyTrackID = studyTrackArtifactRevision.artifactID
                        ctxs = stic.getStudyTrackItemContexts(studyTrackID=studyTrackID)
                    
                    artifactIDs = api.getArtifactRevisionChildren(st.hasArtifactRevisionID)
                    #nodeStatusList = api.getMemberStudyTrackStatus(memberIDs=memberIDs, assignmentID=assignment.assignmentID)
                    artifactNodes = api.getArtifactRevisionsByIDs(artifactIDs)
                    for artifactRevision in artifactNodes:
                        _artifact = {}
                        if artifactRevision.encodedID:
                            _artifact['encodedID'] = artifactRevision.encodedID
                        else:
                            a = artifactRevision.artifact
                            if not a:
                                a = api.getArtifactByID(id=artifactRevision.id)
                            ds = a.getDomains()
                            domains = []
                            for d in ds:
                                domains.append(a._getDomainTermDict(d))
                            _artifact['domains'] = domains
                        _artifact['name'] = artifactRevision.name
                        _artifact['description'] = artifactRevision.description
                        _artifact['handle'] = artifactRevision.handle
                        _artifact['id'] = artifactRevision.id
                        _artifact['type'] = artifactRevision.typeName
                        _artifact['creatorID'] = artifactRevision.creatorID
                        _artifact['login'] = artifactRevision.login
                        
                        for ctx in ctxs:
                            if artifactRevision.id == ctx.get('studyTrackItemID'):
                                if ctx.get('contextUrl'):
                                    _artifact['contextUrl'] = ctx.get('contextUrl')
                                if ctx.get('conceptCollectionHandle'):
                                    _artifact['conceptCollectionHandle'] = ctx.get('conceptCollectionHandle')
                                if ctx.get('collectionCreatorID'):
                                    _artifact['collectionCreatorID'] = ctx.get('collectionCreatorID')
                                ctxs.remove(ctx)
                                break
                        _assignment['concepts'].append(_artifact)
                        totalCount += 1

                if _assignment.has_key('concepts'):
                    _assignment['concepts'] = self._attachCollectionEncodedIDInfos(None, _assignment['concepts'])
                    _assignment['concepts'] = self._processMigratedConcepts(None, _assignment['concepts'])
                    studyTrackItemIDs = set()
                    uniqueConcepts = []
                    for concept in _assignment['concepts']:
                        if not concept['id'] in studyTrackItemIDs:
                            studyTrackItemIDs.add(concept['id'])
                            uniqueConcepts.append(concept)
                    _assignment['concepts'] = uniqueConcepts
                    totalCount = len(uniqueConcepts)

                migratedStudyTrackItemIDMap = {}
                for member in member_list:
                    completedCount = incompleteCount = 0
                    _tmpkey = str(member['id']) + '-' + str(assignment.assignmentID)
                    member_assignment[_tmpkey] = {}
                    concepts = {}
                    for nodeStatus in nodeStatusList:
                        if nodeStatus.memberID == member['id']:
                            _concept_map = {}
                            _concept_map['lastAccess'] = nodeStatus.lastAccess if nodeStatus.lastAccess else ''
                            _concept_map['status'] = nodeStatus.status
                            _concept_map['score'] = nodeStatus.score if (nodeStatus.score is not None and nodeStatus.score !='') else ''
                            if nodeStatus.studyTrackItemID not in migratedStudyTrackItemIDMap.keys():
                                ## Check for duplicates - sometimes the many-to-one mapping after collection migration can have 2 nodes with same result.
                                migratedStudyTrackItemID = self._getMigratedStudyTrackItemID(nodeStatus.studyTrackItemID)
                                migratedStudyTrackItemIDMap[nodeStatus.studyTrackItemID] = migratedStudyTrackItemID
                            else:
                                migratedStudyTrackItemID = migratedStudyTrackItemIDMap[nodeStatus.studyTrackItemID]
                            _concept_map['studyTrackItemID'] = migratedStudyTrackItemID
                            if migratedStudyTrackItemID != nodeStatus.studyTrackItemID:
                                _concept_map['oldStudyTrackItemID'] = nodeStatus.studyTrackItemID
                            if concepts.has_key(migratedStudyTrackItemID):
                                existingScore = concepts[migratedStudyTrackItemID].get('score')
                                if not existingScore:
                                    existingScore = 0
                                newScore = _concept_map['score']
                                if not newScore:
                                    newScore = 0
                                if newScore < existingScore:
                                    continue
                            concepts[migratedStudyTrackItemID] = _concept_map
                    for concept in concepts.values():
                        if concept.get('status') == 'incomplete':
                            incompleteCount += 1
                        else:
                            completedCount += 1
                    member_assignment[_tmpkey] = concepts
                    member_assignment[_tmpkey].update({'incompleteCount':incompleteCount})
                    member_assignment[_tmpkey].update({'completedCount':completedCount})

                _assignment['totalCount'] = totalCount
                assignmentList.append(_assignment)

            result['response']['assignments'] = assignmentList
            result['response']['groupMembers'] = member_list
            result['response']['member_assignment'] = [member_assignment]

            result['response']['total'] = group_members.total
            result['response']['limit'] = len(group_members)
            result['response']['offset'] = (pageNum - 1) * pageSize

        except ex.UnauthorizedException, uae:
            log.debug('getGroupAssignmentsReport: Unauthorized Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
            return ErrorCodes().asDict(c.errorCode, str(uae))
        except ex.MissingArgumentException, mae:
            log.debug('getGroupAssignmentsReport: Missing Argument Exception[%s] traceback' % (traceback.format_exc()))
            c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
            return ErrorCodes().asDict(c.errorCode, str(mae))
        except ex.InvalidArgumentException, iae:
            log.debug('getGroupAssignmentsReport: Invalid Argument Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.INVALID_ARGUMENT
            return ErrorCodes().asDict(c.errorCode, str(iae))
        except Exception, e:
            if not memberID:
                memberID = member.id
            log.error('getGroupAssignmentsReport: Cannot fetch assignments for the user [%s] due to exception [%s]' %(memberID, traceback.format_exc()), exc_info=e)
            c.errorCode = ErrorCodes.CANNOT_LOAD_ASSIGNMENTS
            return ErrorCodes().asDict(c.errorCode, 'Cannot fetch assignments for the user [%s]' %(memberID))

        return result

    def _getMigratedStudyTrackItemID(self, studyTrackItemID):
        if studyTrackItemID:
            originalArtifact = api.getArtifactByID(id=studyTrackItemID)
            if originalArtifact and originalArtifact.type.name == 'domain':
                originalEID = originalArtifact.encodedID
                supercedingConcept = mc.getSupercedingConcept(encodedID=originalEID)
                if supercedingConcept:
                    newArtifact = api.getArtifactByEncodedID(encodedID=supercedingConcept.encodedID, typeName='domain')
                    return newArtifact.id if newArtifact else studyTrackItemID
        return studyTrackItemID

    @d.jsonify()
    @d.checkAuth(request, False, False, ['groupID'])
    @d.setPage(request, ['member', 'groupID'])
    @d.trace(log, ['member', 'groupID', 'pageNum', 'pageSize'])
    def getMembersGroupAssignmentsReport(self, member, groupID, pageNum=1, pageSize=10):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        memberID = None
        try:
            if not groupID:
                groupID = request.params.get('groupID', None)
            if groupID is None:
                raise ex.MissingArgumentException((_(u'Required parameters are missing: groupID')).encode("utf-8"))
            group = None
            if groupID:
                group = api.getGroupByID(id=groupID)
            if group is None:
                raise ex.InvalidArgumentException((_(u'Invalid group: %s.' % groupID)).encode("utf-8"))

            memberID, fq = self._authorizeMember(member, group, memberID=request.params.get('memberID', None))
            group_members = api.getGroupMembers(group=group, sort='a_name', fq=fq, pageNum=pageNum, pageSize=pageSize)

            member_list = []
            for each_member in group_members:
                mem_info = {}
                mem_info['name'] = each_member.member_info.fix().name
                mem_info['email'] = each_member.member_info.email
                mem_info['id'] = each_member.memberID
                mem_info['groupMemberRoleID'] = each_member.roleID
                mem_info['groupMemberRole'] = each_member.role.name
                mem_info['statusID'] = each_member.statusID
                mem_info['status'] = each_member.status.name
                mem_info['joinTime'] = each_member.joinTime
                mem_info['userRole'] = each_member.member_info.systemRoles[0].role.name
                mem_info['userRoleID'] = each_member.member_info.systemRoles[0].roleID
                member_list.append(mem_info)

            # users assignments average score
            averageScore  = api.getMemberStudyTrackAverage(memberID=memberID, assignmentType='assignment', assignmentID=None)
            # assignments are paged.
            assignments = api.getAssignmentsByGroupID(groupID=groupID, memberID=memberID, pageNum=pageNum, pageSize=pageSize)

            assignmentList = []
            for assignment in assignments:
                completedCount = incompleteCount = totalCount = 0
                _assignment = assignment.asDict()
                assignmentArtifact = assignment.artifact
                _assignment['name'] = assignmentArtifact.name
                _assignment['description'] = assignmentArtifact.description
                _assignment['isPastDue'] = 1 if assignment.due and assignment.due < dt.now() else 0
                _assignment['concepts'] = []
                studyTracks = assignmentArtifact.revisions[0].children

                for st in studyTracks:
                    ctxs = {}
                    studyTrackArtifactRevision = api.getArtifactRevisionByID(st.hasArtifactRevisionID)
                    if studyTrackArtifactRevision:
                        studyTrackID = studyTrackArtifactRevision.artifactID
                        ctxs = stic.getStudyTrackItemContexts(studyTrackID=studyTrackID)

                    artifactIDs = api.getArtifactRevisionChildren(st.hasArtifactRevisionID)
                    nodeStatusList = api.getMemberStudyTrackStatus(memberIDs=[memberID], assignmentID=assignment.assignmentID)
                    artifactNodes = api.getArtifactRevisionsByIDs(artifactIDs)
                    for artifactRevision in artifactNodes:
                        _artifact = {}
                        if artifactRevision.encodedID:
                            _artifact['encodedID'] = artifactRevision.encodedID
                        else:
                            a = artifactRevision.artifact
                            if not a:
                                a = api.getArtifactByID(id=artifactRevision.id)
                            ds = a.getDomains()
                            domains = []
                            for d in ds:
                                domains.append(a._getDomainTermDict(d))
                            _artifact['domains'] = domains
                        _artifact['name'] = artifactRevision.name
                        _artifact['description'] = artifactRevision.description
                        _artifact['handle'] = artifactRevision.handle
                        _artifact['type'] = artifactRevision.typeName
                        _artifact['creatorID'] = artifactRevision.creatorID
                        _artifact['login'] = artifactRevision.login
                        
                        for ctx in ctxs:
                            if artifactRevision.id == ctx.get('studyTrackItemID'):
                                if ctx.get('contextUrl'):
                                    _artifact['contextUrl'] = ctx.get('contextUrl')
                                if ctx.get('conceptCollectionHandle'):
                                    _artifact['conceptCollectionHandle'] = ctx.get('conceptCollectionHandle')
                                if ctx.get('collectionCreatorID'):
                                    _artifact['collectionCreatorID'] = ctx.get('collectionCreatorID')
                                ctxs.remove(ctx)
                                break

                        for nodeStatus in nodeStatusList:
                            if nodeStatus.studyTrackItemID == artifactRevision.id:
                                _artifact['score'] = nodeStatus.score if (nodeStatus.score is not None and nodeStatus.score !='') else ''
                                _artifact['lastAccess'] = nodeStatus.lastAccess if nodeStatus.lastAccess else ''
                                _artifact['status'] = nodeStatus.status
                                if nodeStatus.status == 'incomplete':
                                    incompleteCount += 1
                                else:
                                    completedCount += 1
                        totalCount += 1
                        _assignment['concepts'].append(_artifact)

                if _assignment.has_key('concepts'):
                    _assignment['concepts'] = self._attachCollectionEncodedIDInfos(None, _assignment['concepts'])
                    _assignment['concepts'] = self._processMigratedConcepts(None, _assignment['concepts'])
                _assignment['incompleteCount'] = incompleteCount
                _assignment['completedCount'] = completedCount
                _assignment['totalCount'] = totalCount
                assignmentList.append(_assignment)

            result['response']['groupMembers'] = member_list
            result['response']['assignments'] = assignmentList
            result['response']['averageScore'] = averageScore
            try:
                result['response']['total'] = assignments.total
            except AttributeError:
                result['response']['total'] = len(assignments)
            result['response']['limit'] = len(assignments)
            result['response']['offset'] = (pageNum - 1)*pageSize
        except ex.UnauthorizedException, uae:
            log.debug('getMembersGroupAssignmentsReport: Unauthorized Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
            return ErrorCodes().asDict(c.errorCode, str(uae))
        except ex.MissingArgumentException, mae:
            log.debug('getMembersGroupAssignmentsReport: Missing Argument Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
            return ErrorCodes().asDict(c.errorCode, str(mae))
        except ex.InvalidArgumentException, iae:
            log.debug('getMembersGroupAssignmentsReport: Invalid Argument Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.INVALID_ARGUMENT
            return ErrorCodes().asDict(c.errorCode, str(iae))
        except Exception:
            if not memberID:
                memberID = member.id
            log.debug('getMembersGroupAssignmentsReport: Cannot fetch assignments for the user [%s] due to exception [%s]' %(memberID, traceback.format_exc()))
            c.errorCode = ErrorCodes.CANNOT_LOAD_ASSIGNMENTS
            return ErrorCodes().asDict(c.errorCode, 'Cannot fetch assignments for the user [%s]' %(memberID))

        return result

    @d.jsonify()
    @d.checkAuth(request, False, False, ['eid'])
    @d.trace(log, ['member', 'eid'])
    def getMyAssignedModalities(self, member, eid):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            ownedBy = request.params.get('ownedBy')
            if ownedBy and ownedBy not in ['ck12', 'community', 'all']:
                try:
                    ownedBy = int(ownedBy)
                except ValueError:
                    raise Exception("Invalid ownedBy argument. Should be either 'ck12', 'community', 'all', or the ownerID.")
            modalities = api.getAssignedModalitiesForDomain(domainEID=eid, memberID=member.id, ownedBy=ownedBy)
            ## Add studyTrackContexts to distinguish between the collections
            for k in modalities.keys():
                for item in modalities[k]:
                    assignmentArtifact = api.getArtifactByID(id=item.get('assignmentID'))
                    studyTrack = assignmentArtifact.revisions[0].children[0].child.artifact
                    studyTrackItemContexts = stic.getStudyTrackItemContexts(studyTrackID=studyTrack.id)
                    for ctx in studyTrackItemContexts:
                        log.debug("ctx: %s" % ctx)
                        if ctx['studyTrackItemID'] == item['studyTrackItemID']:
                            item.update({'contextUrl': ctx['contextUrl'], 'conceptCollectionHandle': ctx['conceptCollectionHandle'], 'collectionCreatorID': ctx['collectionCreatorID']})
                            break
            result['response']['modalities'] = modalities
        except Exception as e:
            log.error("getMyAssignedModalities: Error getting assigned modalities [%s]" % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.CANNOT_LOAD_ASSIGNMENTS, 'Cannot fetch assigned modalities for user [%s]' % member.id)
        return result

    @d.jsonify()
    @d.checkAuth(request, False, False, ['subjectEID'])
    @d.trace(log, ['member', 'subjectEID'])
    def getMyAssignedGroups(self, member, subjectEID):
        appID = request.params.get('appID', None)

        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            subjectEID = subjectEID.upper().strip()
            groupsDict = {}
            assignmentsDict = {}
            groups = []
            studyTracksDict = {}
            eidDict = {}
            tx = utils.transaction(self.getFuncName())
            with tx as session:
                roleName = 'student'
                if hasattr(member, 'groupRoles'):
                    groupRoles = member.groupRoles
                else:
                    groupRoles = api._getGroupMemberRoles(session, 1, member.id)
                for groupRole in groupRoles:
                    if groupRole.groupID != 1:
                        continue
                    if groupRole.role.name == 'teacher':
                        roleName = groupRole.role.name
                        break
                log.debug('getMyAssignedGroups: roleName[%s]' % roleName)
                if roleName == 'teacher':
                    from sqlalchemy.orm import aliased
                    from sqlalchemy.sql import or_

                    ## If a practice modality or the domain is assigned, we should return the assignment is either case. 
                    practiceArt = domainArt = None
                    if '.' in subjectEID: ## Valid EID
                        practiceArt = api._getPracticeModalityForEID(session, subjectEID)
                        log.debug('getMyAssignedGroups: practiceArt[%s]' % practiceArt)
                    else:          ## Probably a modality id
                        domainArt = api._getDomainArtifactForModality(session, artifactID=subjectEID, typeName='asmtpractice')
                        log.debug('getMyAssignedGroups: domainArt[%s]' % domainArt)

                    artifactTypeDict = g.getArtifactTypes()
                    artifactTypeID = artifactTypeDict['study-track']

                    aAlias = aliased(model.Artifact)
                    query = session.query(model.Artifact, aAlias.id.label('studyTrackItemID')).distinct()
                    query = query.filter_by(artifactTypeID=artifactTypeID)
                    query = query.filter_by(creatorID=member.id)
                    query = query.join(model.ArtifactAndChildren, model.ArtifactAndChildren.id == model.Artifact.id)
                    query = query.join(aAlias, aAlias.id == model.ArtifactAndChildren.childID)
                    if not practiceArt and not domainArt:
                        query = query.filter(or_(aAlias.encodedID == subjectEID, aAlias.id == subjectEID))
                    elif practiceArt and not domainArt:
                        query = query.filter(or_(aAlias.encodedID == subjectEID, aAlias.id == subjectEID, aAlias.id == practiceArt.id))
                    elif not practiceArt and domainArt:
                        query = query.filter(or_(aAlias.encodedID == subjectEID, aAlias.id == subjectEID, aAlias.id == domainArt.id))
                    else:
                        ## Should never happen
                        query = query.filter(or_(aAlias.encodedID == subjectEID, aAlias.id == subjectEID, aAlias.id == practiceArt.id, aAlias.id == domainArt.id))
                    studyTracks = query.all()
                    assignmentInfo = []
                    for row in studyTracks:
                        studyTrack = row.Artifact
                        log.debug('getMyAssignedGroups: studyTrack.id[%s], studyTrackItemID:[%s]' % (studyTrack.id, row.studyTrackItemID))
                        studyTracksDict[studyTrack.id] = row.studyTrackItemID

                        artifactTypeID = artifactTypeDict['assignment']
                        rid = studyTrack.revisions[0].id

                        query = session.query(model.Artifact)
                        query = query.filter_by(artifactTypeID=artifactTypeID)
                        query = query.filter_by(creatorID=member.id)
                        query = query.join(model.ArtifactRevision, model.ArtifactRevision.artifactID == model.Artifact.id)
                        query = query.join(model.ArtifactRevisionRelation, model.ArtifactRevisionRelation.artifactRevisionID == model.ArtifactRevision.id)
                        query = query.filter(model.ArtifactRevisionRelation.hasArtifactRevisionID == rid)
                        query = query.join(model.Assignment, model.Assignment.assignmentID == model.Artifact.id)
                        if appID:
                            query = query.filter(model.Assignment.origin == 'lms')
                        else:
                            query = query.filter(model.Assignment.origin == 'ck-12')
                        assignments = query.all()
                        log.debug('getMyAssignedGroups: assignments%s' % assignments)
                        for assignment in assignments:
                            assignmentInfo.append((assignment.id, None))
                            log.debug('getMyAssignedGroups: appended assignment.id[%s]' % assignment.id)
                else:
                    ## Student case
                    assignmentStatuses, eids = api._getMemberStudyTrackStatusByEID(session, memberID=member.id, eid=subjectEID) 
                    log.debug('getMyAssignedGroups: assignmentStatuses%s' % assignmentStatuses)
                    log.debug('getMyAssignedGroups: eids%s' % eids)
                    #
                    #  Process eids.
                    #
                    for id, encodedID in eids:
                        eidDict[id] = encodedID

                    assignmentInfo = []
                    for assignmentStatus in assignmentStatuses:
                        assignmentInfo.append((assignmentStatus.assignmentID, assignmentStatus))

                for assignmentID, assignmentStatus in assignmentInfo:
                    assignedGroups = api._getAssignedGroups(session, assignmentID, appID=appID, memberID=member.id)
                    log.debug('getMyAssignedGroups: assignedGroups%s' % assignedGroups)
                    for assignedGroup, assignmentType, due in assignedGroups:
                        groupDict = groupsDict.get(assignedGroup.id, None)
                        #
                        #  There may be multiple assignments on a signle group.
                        #
                        if not groupDict:
                            #
                            #  Have not seen this group before.
                            #
                            groupDict = assignedGroup.asDict()
                            groupDict['assignmentDict'] = {}
                            groupsDict[assignedGroup.id] = groupDict
                            groups.append(groupDict)
                        #
                        #  Associate assignment to group.
                        #
                        assignment = assignmentsDict.get(assignmentID, None)
                        if not assignment:
                            assignment = {
                                'id': assignmentID,
                                'type': assignmentType,
                                'due': due,
                                'eids': [],
                            }
                            assignmentsDict[assignmentID] = assignment

                        assignmentArtifact = api._getArtifactByID(session, assignmentID)
                        studyTrack = assignmentArtifact.revisions[0].children[0].child.artifact
                        studyTrackItemID = assignmentStatus.studyTrackItemID if assignmentStatus else studyTracksDict.get(studyTrack.id)
                        eidInfo = {
                            'eid': eidDict.get(studyTrackItemID),
                            'artifactID': studyTrackItemID,
                        }
                        if assignmentStatus:
                            ## Fill the information for the student
                            eidInfo.update({
                                'status': assignmentStatus.status,
                                'score': assignmentStatus.score,
                                'lastAccess': assignmentStatus.lastAccess,
                            })
                        studyTrackItemContext = stic._getStudyTrackItemContext(session, studyTrackID=studyTrack.id, studyTrackItemID=studyTrackItemID)
                        if studyTrackItemContext:
                            if studyTrackItemContext.conceptCollectionHandle:
                                collectionHandle, conceptCollectionAbsoluteHandle = h.splitConceptCollectionHandle(studyTrackItemContext.conceptCollectionHandle)
                                eidInfo.update({
                                    'contextUrl': studyTrackItemContext.contextUrl,
                                    'conceptCollectionHandle': studyTrackItemContext.conceptCollectionHandle,
                                    'collectionCreatorID': studyTrackItemContext.collectionCreatorID,
                                    'collectionHandle': collectionHandle,
                                    'conceptCollectionAbsoluteHandle': conceptCollectionAbsoluteHandle
                                })
                                if not eidInfo.get('eid'):
                                    ## Get EID from collectionContext if not already present (teacher case)
                                    cnode = self.collectionNode.getByConceptCollectionHandle(conceptCollectionHandle=studyTrackItemContext.conceptCollectionHandle, collectionCreatorID=studyTrackItemContext.collectionCreatorID)
                                    eidInfo['eid'] = cnode['encodedID']
                        assignment['eids'].append(eidInfo)
                        groupDict['assignmentDict'][assignmentID] = assignment
            result['response']['groups'] = groups
            return result
        except ex.UnauthorizedException, uae:
            log.debug('getMyAssignedGroups: Unauthorized Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
            return ErrorCodes().asDict(c.errorCode, str(uae))
        except Exception:
            log.debug('getMyAssignedGroups: Cannot fetch assigned groups for user [%s] due to exception [%s]' %(member.id, traceback.format_exc()))
            c.errorCode = ErrorCodes.CANNOT_LOAD_ASSIGNMENTS
            return ErrorCodes().asDict(c.errorCode, 'Cannot fetch assigned groups for user [%s]' %(member.id))

    @d.jsonify()
    @d.checkAuth(request, False, False)
    @d.trace(log, ['member'])
    def getIncompleteAssignments(self, member):
        """
            Retrieve the incomplete assignments that is due before
            the given date for the list of members.
        """
        memberIDs = request.params.get('memberIDs', None)
        dueIn = request.params.get('dueIn', None)

        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        c.errorCode = ErrorCodes.OK

        try:
            if not memberIDs:
                raise ex.MissingArgumentException((_(u'Member ID list missing.')).encode("utf-8"))
            memberIDs = memberIDs.split(',')
            log.debug('getIncompleteAssignments: memberIDs%s' % memberIDs)

            if not dueIn:
                raise ex.MissingArgumentException((_(u'Due in time missing.')).encode("utf-8"))
            try:
                dueIn = int(dueIn)
            except ValueError:
                raise ex.InvalidArgumentException((_(u'Due in time must be integer.')).encode("utf-8"))
            dueBefore = dt.now() + timedelta(hours=dueIn)
            log.debug('getIncompleteAssignments: dueBefore[%s]' % dueBefore)

            member = u.getImpersonatedMember(member)

            tx = utils.transaction(self.getFuncName())
            with tx as session:
                if not u.isMemberAdmin(member, session=session):
                    raise ex.UnauthorizedException((_(u'This API can only be called by admins.')).encode("utf-8"))

                tuples = api._getIncompleteAssignments(session, memberIDs, dueBefore)
                log.debug('getIncompleteAssignments: tuples[%s]' % tuples)
                members = {}
                for memberID, assignmentID, groupID, due, groupName in tuples:
                    if not members.get(memberID):
                        members[memberID] = []
                    members[memberID].append({
                            'assignmentID': assignmentID,
                            'groupID': groupID,
                            'groupName': groupName,
                            'due': due,
                        })
                result['response']['members'] = members
            return result
        except ex.NotFoundException, iae:
            log.debug('get: Not Found Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.NO_SUCH_ARTIFACT
            return ErrorCodes().asDict(c.errorCode, str(iae))
        except ex.InvalidArgumentException, iae:
            log.debug('get: Invalid Argument Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.INVALID_ARGUMENT
            return ErrorCodes().asDict(c.errorCode, str(iae))
        except ex.UnauthorizedException, uae:
            log.debug('get: Unauthorized Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
            return ErrorCodes().asDict(c.errorCode, str(uae))
        except Exception, e:
            log.debug('get: Exception[%s] traceback' %(traceback.format_exc()))
            if c.errorCode == ErrorCodes.OK:
                c.errorCode = ErrorCodes.NO_SUCH_ARTIFACT
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, False)
    @d.trace(log, ['member'])
    def countMyStudyTracks(self, member):
        """
            Count the number of study tracks created by me.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        c.errorCode = ErrorCodes.OK
        try:
            count = api.countMyStudyTracks(memberID=member.id)
            result['response']['count'] = count
            return result
        except Exception as e:
            log.debug('get: Exception[%s] traceback' %(traceback.format_exc()))
            if c.errorCode == ErrorCodes.OK:
                c.errorCode = ErrorCodes.NO_SUCH_ARTIFACT
            return ErrorCodes().asDict(c.errorCode, str(e))
