from flx.model import meta, model, api
from flx.model import exceptions
from flx.lib.localtime import Local
from sqlalchemy import orm
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import aliased, exc
from sqlalchemy.sql.expression import func
from urllib import quote, unquote
from datetime import datetime
import sqlalchemy
import logging
import json
import zlib
import re
import string
import random
import time

allStringChars = [x for x in string.lowercase] + [x for x in string.lowercase] + [x for x in string.digits]
class PartnerDataModel(object):

    #privateMethods expects expects caller to take care of session opening or closing
    def _generateRandomString(self, noOfChars=3):
        random.shuffle(allStringChars)
        return "".join(allStringChars[:3])

    def _convertNameToHandle(self, name, forGroup=False):
        if not name or not isinstance(name, basestring):
            raise exceptions.InvalidArgumentException(u"Invalid name : [{name}] received for handle generation.".format(name=name).encode('utf-8'))
        handle = name
        if handle:
            h = handle
            while True:
                handle = unquote(h)
                if handle == h:
                    break
                h = handle
            
            #Remove unsafe characters.
            for ch in [ '!', '"', '#', '$', '%', '&', "'", '(', ')', '*', '+', ',', '/', ';', '<', '=', '>', '?', '@', '[', '\\', ']', '^', '`', '{', '|', '}', '~' ]:
                handle = handle.replace(ch, '')
            
            #Change space to '-' and Reduce repeating '-' into a single one.
            handle = handle.replace(' ', '-')
            handle = re.sub(r'(-)\1+', r'\1', handle)

        if forGroup:
            groupHandle = handle + '-' +self._generateRandomString(3)
            while True:
                groupMetaDOsWithThisHandle = meta.Session.query(meta.Groups).filter_by(handle=groupHandle).all()
                if not groupMetaDOsWithThisHandle:
                    break
                groupHandle = handle + '-' +self._generateRandomString(3)
            handle = groupHandle
        return handle

    def _generateAssignmentDict(self, assignmentDO):
        if not isinstance(assignmentDO, model.Assignment) or not assignmentDO.assignmentID:
            raise exceptions.InvalidArgumentException(u"Invalid assignmentDO : [{assignmentDO}] encountered while trying to generate assignmentDict.".format(assignmentDO=assignmentDO).encode('utf-8'))
        if meta.Session() != orm.session.Session.object_session(assignmentDO):
            raise exceptions.InvalidArgumentException(u"Received assignmentDO with assignmentID : [{assignmentID}] is not attached to the current session.".format(assignmentID=assignmentDO.assignmentID).encode('utf-8'))

        assignmentDict = {}
        assignmentDict[u'assignmentID'] = assignmentDO.assignmentID
        assignmentDict[u'assignmentName'] = assignmentDO.artifact.name
        assignmentDict[u'assignmentType'] = assignmentDO.assignmentType
        if assignmentDO.due:
            assignmentDict[u'assignmentDueBy'] = assignmentDO.due.replace(tzinfo=Local).isoformat()
        else:
            assignmentDict[u'assignmentDueBy'] = assignmentDO.due
        assignmentDict[u'groupID'] = assignmentDO.group.id
        return assignmentDict
 
    def _assignAssignmentsToGroupMembers(self, assignmentAIDs, groupMemberIDs):
        if not isinstance(assignmentAIDs, list) or not all(isinstance(assignmentAID, long) or isinstance(assignmentAID, int) for assignmentAID in assignmentAIDs):
            raise exceptions.InvalidArgumentException(u"Invalid assignmentAIDs : [{assignmentAIDs}] encountered while trying to assign assignments to groupMembers.".format(assignmentAIDs=assignmentAIDs).encode('utf-8'))

        if not isinstance(groupMemberIDs, list) or not all(isinstance(groupMemberID, long) or isinstance(groupMemberID, int) for groupMemberID in groupMemberIDs):
            raise exceptions.InvalidArgumentException(u"Invalid groupMemberIDs : [{groupMemberIDs}] encountered while trying to assign assignments to groupMembers.".format(groupMemberIDs=groupMemberIDs).encode('utf-8'))

        if assignmentAIDs and groupMemberIDs:
            assignmentAIDsChunks = [assignmentAIDs[x:x+20] for x in xrange(0, len(assignmentAIDs), 20)]
            assignmentALatestRevisionIDs = []
            assignmentALatestRevisionIDAIDMap = {}
            for assignmentAIDsChunk in assignmentAIDsChunks:
                assignmentALatestRevisionInfos = meta.Session.query(meta.ArtifactRevisions.c.artifactID, func.max(meta.ArtifactRevisions.c.id)).filter(meta.ArtifactRevisions.c.artifactID.in_(assignmentAIDsChunk)).group_by(meta.ArtifactRevisions.c.artifactID).all()
                for assignmentALatestRevisionInfo in assignmentALatestRevisionInfos:
                    assignmentAID = assignmentALatestRevisionInfo[0]
                    assignmentALatestRevisionID = assignmentALatestRevisionInfo[1]
                    assignmentALatestRevisionIDAIDMap[assignmentALatestRevisionID] = assignmentAID
                    assignmentALatestRevisionIDs.append(assignmentALatestRevisionID)
                                
            artifactRevisionRelationsAlias = aliased(meta.ArtifactRevisionRelations)
            assignmentArtifactInfos = meta.Session.query(meta.ArtifactRevisionRelations.c.artifactRevisionID, meta.ArtifactRevisions.c.artifactID).filter(meta.ArtifactRevisionRelations.c.artifactRevisionID.in_(assignmentALatestRevisionIDs)).join(artifactRevisionRelationsAlias, meta.ArtifactRevisionRelations.c.hasArtifactRevisionID==artifactRevisionRelationsAlias.c.artifactRevisionID).join(meta.ArtifactRevisions, artifactRevisionRelationsAlias.c.hasArtifactRevisionID==meta.ArtifactRevisions.c.id).all() 
            assignmentAIDArtifactIDsMap = {}
            for assignmentArtifactInfo in assignmentArtifactInfos:
                assignmentALatestRevisionID = assignmentArtifactInfo[0]
                assignmentArtifactID = assignmentArtifactInfo[1]
                if assignmentALatestRevisionID in assignmentALatestRevisionIDAIDMap:
                    if assignmentALatestRevisionIDAIDMap[assignmentALatestRevisionID] not in assignmentAIDArtifactIDsMap:
                        assignmentAIDArtifactIDsMap[assignmentALatestRevisionIDAIDMap[assignmentALatestRevisionID]] = []
                
                    assignmentAIDArtifactIDsMap[assignmentALatestRevisionIDAIDMap[assignmentALatestRevisionID]].append(assignmentArtifactID) 
                
            memberStudyTrackItemStatusesAlreadyExistingInfoMap = {}
            memberStudyTrackItemStatusesAlreadyExistingInfos= meta.Session.query(meta.MemberStudyTrackItemStatus.c.memberID, meta.MemberStudyTrackItemStatus.c.assignmentID, meta.MemberStudyTrackItemStatus.c.studyTrackItemID).filter(meta.MemberStudyTrackItemStatus.c.memberID.in_(groupMemberIDs)).all()
            for memberStudyTrackItemStatusesAlreadyExistingInfo in memberStudyTrackItemStatusesAlreadyExistingInfos:
                mID = memberStudyTrackItemStatusesAlreadyExistingInfo[0]
                aID = memberStudyTrackItemStatusesAlreadyExistingInfo[1]
                stID = memberStudyTrackItemStatusesAlreadyExistingInfo[2]
                if not mID in memberStudyTrackItemStatusesAlreadyExistingInfoMap:
                    memberStudyTrackItemStatusesAlreadyExistingInfoMap[mID] = {}
                if not aID in memberStudyTrackItemStatusesAlreadyExistingInfoMap[mID]:
                    memberStudyTrackItemStatusesAlreadyExistingInfoMap[mID][aID] = []
                if not stID in memberStudyTrackItemStatusesAlreadyExistingInfoMap[mID][aID]:
                     memberStudyTrackItemStatusesAlreadyExistingInfoMap[mID][aID].append(stID)    

            memberStudyTrackItemStatuses = []
            for groupMemberID in groupMemberIDs:
                for assignmentAID in assignmentAIDArtifactIDsMap:
                    for assignmentArtifactID in assignmentAIDArtifactIDsMap[assignmentAID]:
                        mID = groupMemberID
                        aID = assignmentAID
                        stID = assignmentArtifactID
                        if (mID not in memberStudyTrackItemStatusesAlreadyExistingInfoMap or aID not in memberStudyTrackItemStatusesAlreadyExistingInfoMap[mID] or stID not in memberStudyTrackItemStatusesAlreadyExistingInfoMap[mID][aID]):
                            memberStudyTrackItemStatus = {'memberID' : groupMemberID, 'assignmentID' : assignmentAID, 'studyTrackItemID' : assignmentArtifactID}
                            memberStudyTrackItemStatuses.append(memberStudyTrackItemStatus)
        
            if memberStudyTrackItemStatuses:
                meta.Session.execute(meta.MemberStudyTrackItemStatus.insert(), memberStudyTrackItemStatuses)

    def buildAssignment(self, memberDict, assignmentDict, partnerAppName):
        meta.Session.begin()
        atomicOperationTime = datetime.now()
        try:
            #It is assumed that the member is properly authenticated with the auth server using his login cookie in the request by now.
            #And we would have a proper and valid memberDetails in the memberDict
            memberID = memberDict.get('memberID')
            if not memberID:
                raise exceptions.InvalidArgumentException(u"Invalid memberID : [{memberID}] is received.".format(memberID=memberID).encode('utf-8'))

            try:
                (partnerAppID, partnerID, partnerName, ) = meta.Session.query(meta.LMSProviderApps.c.appID, meta.LMSProviderApps.c.providerID, meta.LMSProviders.c.name).filter(meta.LMSProviderApps.c.appID == partnerAppName).join(meta.LMSProviders, meta.LMSProviderApps.c.providerID==meta.LMSProviders.c.id).one()
            except exc.NoResultFound:
                raise exceptions.ResourceNotFoundException(u"PartnerApp with the given partnerAppName : [{partnerAppName}] could not be found in the dataBase.".format(partnerAppName=partnerAppName).encode('utf-8'))
            except exc.MultipleResultsFound:
                raise exceptions.SystemDataException(u"Multiple partnerApps with the given partnerAppName : [{partnerAppName}] are found in the dataBase. Internal System data error.".format(partnerAppName=partnerAppName).encode('utf-8'))

            assignmentArtifactIDs = assignmentDict.get('assignmentArtifactIDs')
            assignmentArtifactIDTuplesFromDB = meta.Session.query(meta.Artifacts.c.id).filter(meta.Artifacts.c.id.in_(assignmentArtifactIDs)).all()
            assignmentArtifactIDsFromDB = [assignmentArtifactIDTupleFromDB[0] for assignmentArtifactIDTupleFromDB in assignmentArtifactIDTuplesFromDB]
            if len(assignmentArtifactIDsFromDB) != len(assignmentArtifactIDs):
                raise exceptions.InvalidArgumentException(u"One or more IDs in the given assignmentArtifactIDs : [{assignmentArtifactIDs}] could not be found in the dataBase.".format(assignmentArtifactIDs=assignmentArtifactIDs).encode('utf-8'))

            assignmentTypeIDsSubQuery = meta.Session.query(meta.Artifacts.c.artifactTypeID).filter(meta.Artifacts.c.id.in_(assignmentArtifactIDs)).subquery('assignmentTypeIDsSubQuery')
            assignmentArtifactTypeInfoTuples= meta.Session.query(meta.ArtifactTypes.c.name, meta.ArtifactTypes.c.modality).filter(meta.ArtifactTypes.c.id == assignmentTypeIDsSubQuery.c.artifactTypeID).all()
            areValidAssignmentArtifactTypes = all([(assignmentArtifactTypeInfoTuple[0] in (u'assignment', u'domain') or assignmentArtifactTypeInfoTuple[1])for assignmentArtifactTypeInfoTuple in assignmentArtifactTypeInfoTuples])
            if not areValidAssignmentArtifactTypes:
                 raise exceptions.InvalidArgumentException(u"Invalid type of assignmentArtifactIDs : [{assignmentArtifactIDs}] rceived. They should be of type [assignment | domain ] or of type which is a modality.".format(assignmentArtifactIDs=assignmentArtifactIDs).encode('utf-8'))
            
            partnerAssignmentID = assignmentDict.get('partnerAssignmentID')
            if partnerAssignmentID:
                lmsProviderAssignmentDO = meta.Session.query(model.LMSProviderAssignment).get((partnerID, partnerAssignmentID))
                if lmsProviderAssignmentDO:
                    raise exceptions.InvalidArgumentException(u"The received partnerAssignmentID : [{partnerAssignmentID}] for partnerAppName : [{partnerAppName}]  and partnerName : [{partnerName}] is already mapped to another assignment in the dataBase. Please try creating a new parterAssignment and then creating a corresponding assignment.".format(partnerAssignmentID=partnerAssignmentID, partnerAppName=partnerAppName, partnerName=partnerName).encode('utf-8'))

            partnerGroupID = assignmentDict.get('partnerGroupID')
            partnerGroupDO = meta.Session.query(model.LMSProviderGroup).get((partnerAppID, partnerGroupID))
            groupID = partnerGroupDO.groupID if partnerGroupDO else None
            if groupID:
                groupDO = meta.Session.query(model.Group).get(groupID)
                groupCreatorID = groupDO.creatorID
                if memberID != groupCreatorID:
                    raise exceptions.UnauthorizedException(u"Given member with the memberID : [{memberID}] is not authorized assign an assignment to the given group with partnerGroupID : [{partnerGroupID}] and partnerAppName = [{partnerAppName}].".format(memberID=memberID, partnerGroupID=partnerGroupID, partnerAppName=partnerAppName).encode('utf-8'))

                partnerGroupName = assignmentDict.get('partnerGroupName')
                if partnerGroupName is not None and partnerGroupDO.title != partnerGroupName:
                    partnerGroupDO.title = partnerGroupName
                    partnerGroupDO.updateTime = atomicOperationTime

                if partnerGroupName is not None and groupDO.name != partnerGroupName:
                    #verify is update is valid
                    try:
                        groupIDFromNameCreator= meta.Session.query(meta.Groups).filter(meta.Groups.c.name==partnerGroupName, meta.Groups.c.creatorID==memberID).one()
                    except exc.NoResultFound:
                        groupIDFromNameCreator = None
                    except exc.MultipleResultsFound:
                        raise exceptions.SystemDataException(u"Multiple groups with the given partnerGroupName : [{partnerGroupName}], memberID : [{memberID}] combination are found in the dataBase. Internal System data error.".format(partnerGroupName=partnerGroupName, memberID=memberID).encode('utf-8'))   
                    if groupIDFromNameCreator is not None:
                        raise exceptions.ResourceAlreadyExistsException(u"Current group's name cannot be updated as another group with the given partnerGroupName : [{partnerGroupName}], memberID : [{memberID}] combination is already found in the dataBase. Please try another partnerGroupName or leave the original as is by not passing any partnerGroupName.".format(partnerGroupName=partnerGroupName, memberID=memberID).encode('utf-8'))
                    
                    #Now upodate
                    groupDO.name = partnerGroupName
                    groupDO.handle = self._convertNameToHandle(partnerGroupName, forGroup=True)
                    groupDO.updateTime = atomicOperationTime
            else:
                partnerGroupName = assignmentDict.get('partnerGroupName')
                if not partnerGroupName:
                    if partnerGroupDO:
                        partnerGroupName = partnerGroupDO.title
                    else:
                        raise exceptions.InvalidArgumentException(u"Invalid partnerGroupName : [{partnerGroupName}] is received. partnerGroupName is mandatory while trying to assign an assignment to the group for first time.".format(partnerGroupName=partnerGroupName).encode('utf-8'))
                else:
                    if partnerGroupDO:
                        if partnerGroupName != partnerGroupDO.title:
                            partnerGroupDO.title = partnerGroupName
                            partnerGroupDO.updateTime = atomicOperationTime

                try:
                    groupIDFromNameCreator= meta.Session.query(meta.Groups).filter(meta.Groups.c.name==partnerGroupName, meta.Groups.c.creatorID==memberID).one()
                except exc.NoResultFound:
                    groupIDFromNameCreator = None
                except exc.MultipleResultsFound:
                    raise exceptions.SystemDataException(u"Multiple groups with the given partnerGroupName : [{partnerGroupName}], memberID : [{memberID}] combination are found in the dataBase. Internal System data error.".format(partnerGroupName=partnerGroupName, memberID=memberID).encode('utf-8'))   
                if groupIDFromNameCreator is not None:
                    raise exceptions.ResourceAlreadyExistsException(u"Group can not be created as another group with the given partnerGroupName : [{partnerGroupName}], memberID : [{memberID}] combination is already found in the dataBase. Please try changing the partnerGroupName.".format(partnerGroupName=partnerGroupName, memberID=memberID).encode('utf-8'))
                
                groupDO = model.Group(parentID=1, name=partnerGroupName, handle=self._convertNameToHandle(partnerGroupName, forGroup=True), origin='lms', creatorID=memberID, creationTime=atomicOperationTime, updateTime=atomicOperationTime)
                if not partnerGroupDO:
                    partnerGroupDO = model.LMSProviderGroup(appID=partnerAppID, providerGroupID=partnerGroupID, title=partnerGroupName, creationTime=atomicOperationTime, updateTime=atomicOperationTime)

                memberRoleInfoInRootGroupTuples = meta.Session.query(meta.GroupHasMembers.c.roleID, meta.MemberRoles.c.name).filter(meta.GroupHasMembers.c.memberID==memberID, meta.GroupHasMembers.c.groupID==1).join(meta.MemberRoles, meta.GroupHasMembers.c.roleID==meta.MemberRoles.c.id).all()
                memberRoleNamesInRootGroup  = [memberRoleInfoInRootGroupTuple[1] for memberRoleInfoInRootGroupTuple in memberRoleInfoInRootGroupTuples]  
                if 'teacher' in memberRoleNamesInRootGroup:
                    groupDO.groupType = 'class'
                
                groupDO.lmsGroups = []
                groupDO.members = []
                groupDO.assignments = []
                
                meta.Session.add(groupDO)
                meta.Session.add(partnerGroupDO)
                meta.Session.flush()

            memberRoleInfoTuples = meta.Session.query(meta.MemberRoles.c.name, meta.MemberRoles.c.id).filter(meta.MemberRoles.c.name.in_(['groupmember', 'groupadmin'])).all()
            memberRoleInfoDict = {}
            for memberRoleInfoTuple in memberRoleInfoTuples:
                memberRoleInfoDict[memberRoleInfoTuple[0]] = memberRoleInfoTuple[1]
            if 'groupmember' not in memberRoleInfoDict:
                raise exceptions.SystemDataException(u"Group Member member role could not be found in the dataBase. Internal System data error.".format().encode('utf-8'))                   
            if 'groupadmin' not in memberRoleInfoDict:
                raise exceptions.SystemDataException(u"Group Admin member role could not be found in the dataBase. Internal System data error.".format().encode('utf-8'))                   
                        
            #filter the memberIDs already logged in with this group
            memberIDsALreadyLoggedInWithThisGroup = []
            partnerGroupMemberInfoTuples = meta.Session.query(meta.LMSProviderGroupMembers.c.providerMemberID, meta.LMSProviderGroupMembers.c.memberID).filter(meta.LMSProviderGroupMembers.c.providerGroupID==partnerGroupDO.providerGroupID, meta.LMSProviderGroupMembers.c.providerID==partnerID).all()
            for partnerGroupMemberInfoTuple in partnerGroupMemberInfoTuples:
                if partnerGroupMemberInfoTuple[1]:
                    memberIDsALreadyLoggedInWithThisGroup.append(partnerGroupMemberInfoTuple[1])

            #is memberID present as group-admin
            #are other memberIDs logged in with this group are present as group-member             
            isCreatorPresentAsAdmin = False;
            for groupMember in groupDO.members:
                if groupMember.memberID == memberID and groupMember.roleID == memberRoleInfoDict['groupadmin']:
                    isCreatorPresentAsAdmin = True
                if groupMember.roleID == memberRoleInfoDict['groupmember'] and groupMember.memberID in memberIDsALreadyLoggedInWithThisGroup:
                    memberIDsALreadyLoggedInWithThisGroup.remove(groupMember.memberID)
            if not isCreatorPresentAsAdmin:
                groupDO.members.append(model.GroupHasMembers(memberID=memberID, roleID=memberRoleInfoDict['groupadmin']))
            for memberIDALreadyLoggedInWithThisGroup in memberIDsALreadyLoggedInWithThisGroup:
                groupDO.members.append(model.GroupHasMembers(memberID=memberIDALreadyLoggedInWithThisGroup, roleID=memberRoleInfoDict['groupmember']))
            
            #is partnerGroupDO present as lmsGroup
            isPartnerGroupPresentAsLMSGroup = False
            for lmsGroupDO in groupDO.lmsGroups:
                if lmsGroupDO.appID == partnerGroupDO.appID and lmsGroupDO.providerGroupID == partnerGroupDO.providerGroupID:
                   isPartnerGroupPresentAsLMSGroup = True
            if not isPartnerGroupPresentAsLMSGroup:
                groupDO.lmsGroups.append(partnerGroupDO)

            #TODO - enquire about the genartion of names, handles of the study-track and assignment artifacts from assignmentName
            assignmentName = assignmentDict.get('assignmentName')
            assignmentADOHandle = self._convertNameToHandle(assignmentName)
            assignmentASTDOHandle = assignmentADOHandle+'-study-track'
            assignmentLanguage = assignmentDict.get('assignmentLanguage', 'en')
            assignmentLanguageDO = api._getLanguageByNameOrCode(meta.Session, nameOrCode=assignmentLanguage)
            if not assignmentLanguageDO:
                raise exceptions.InvalidArgumentException(u"Invalid language name or code specified in assignmentLanguage: [%s]" % assignmentLanguage)

            try:
                #you can fire a query.one as type+owner+handle togeather forms the a unique key and only 1 result is guaranteed
                assignmentAIDFromHandle= meta.Session.query(meta.Artifacts.c.id).filter(meta.Artifacts.c.handle==assignmentADOHandle, meta.Artifacts.c.creatorID==memberID).join(meta.ArtifactTypes, meta.Artifacts.c.artifactTypeID==meta.ArtifactTypes.c.id).filter(meta.ArtifactTypes.c.name=='assignment').one()
            except exc.NoResultFound:
                assignmentAIDFromHandle = None
            except exc.MultipleResultsFound:
                raise exceptions.SystemDataException(u"Multiple artifacts of the type study-tracks with the given assignmentName : [{assignmentName}], memberID : [{memberID}] combination are found in the dataBase. Internal System data error.".format(assignmentName=assignmentName, memberID=memberID).encode('utf-8'))   
            if assignmentAIDFromHandle is not None:
                raise exceptions.ResourceAlreadyExistsException(u"Could not build the assignment as another assignment with the given assignmentName : [{assignmentName}], memberID : [{memberID}] combination already exists in the database. Please try changing the assignmentName.".format(assignmentName=assignmentName, memberID=memberID).encode('utf-8'))
            
            try:
                #you can fire a query.one as type+owner+handle togeather forms the a unique key and only 1 result is guaranteed
                assignmentASTIDFromHandle= meta.Session.query(meta.Artifacts.c.id).filter(meta.Artifacts.c.handle==assignmentASTDOHandle, meta.Artifacts.c.creatorID==memberID).join(meta.ArtifactTypes, meta.Artifacts.c.artifactTypeID==meta.ArtifactTypes.c.id).filter(meta.ArtifactTypes.c.name=='study-track').one()
            except exc.NoResultFound:
                assignmentASTIDFromHandle = None
            except exc.MultipleResultsFound:
                raise exceptions.SystemDataException(u"Multiple artifacts of the type study-tracks with the given assignmentName : [{assignmentName}], memberID : [{memberID}] combination are found in the dataBase. Internal System data error.".format(assignmentName=assignmentName, memberID=memberID).encode('utf-8'))   
            if assignmentASTIDFromHandle is not None:
                raise exceptions.ResourceAlreadyExistsException(u"Could not build the assignment as another study track with the given assignmentName : [{assignmentName}], memberID : [{memberID}] combination already exists in the database. Please try changing the assignmentName.".format(assignmentName=assignmentName, memberID=memberID).encode('utf-8'))
            
            artifactTypeInfoTuples = meta.Session.query(meta.ArtifactTypes.c.name, meta.ArtifactTypes.c.id).filter(meta.ArtifactTypes.c.name.in_(['assignment', 'study-track'])).all()
            artifactTypeInfoDict = {}
            for artifactTypeInfoTuple in artifactTypeInfoTuples:
                artifactTypeInfoDict[artifactTypeInfoTuple[0]] = artifactTypeInfoTuple[1]
            if 'study-track' not in artifactTypeInfoDict:
                raise exceptions.SystemDataException(u"Assignment artifactType could not be found in the dataBase. Internal System data error.".format().encode('utf-8'))                   
            if 'assignment' not in artifactTypeInfoDict:
                raise exceptions.SystemDataException(u"Study Track artifactType could not be found in the dataBase. Internal System data error.".format().encode('utf-8'))                   
                        
            #Artifact table entry for the study-track
            assignmentASTDO = model.Artifact(name=assignmentName, handle=assignmentASTDOHandle, artifactTypeID=artifactTypeInfoDict['study-track'], 
                    creatorID=memberID, creationTime=atomicOperationTime, updateTime=atomicOperationTime, languageID=assignmentLanguageDO.id)
            assignmentASTDO.revisions = [model.ArtifactRevision(revision=1, creationTime=atomicOperationTime)]


            #Map to handle all the contexts of the assignmentArtifactIDs
                #We need to retain the contexts from the 'assignment' typed assignmentArtifactIDs
                #We need to defaultize the contexts for 'domain' & 'asmtpractice' typed assignmentArtifactIDs if not already received / resolved
            assignmentArtifactIDCollectionContextsMap = {}

            #Extract all the actual assignments in our dataBase from the given assignmentArtifactIDs (the TODO list IDs) 
            assignmentAIDTuples = meta.Session.query(meta.Artifacts.c.id).filter(meta.Artifacts.c.id.in_(assignmentArtifactIDs)).join(meta.ArtifactTypes).filter(meta.ArtifactTypes.c.name == 'assignment').all()
            assignmentAIDs = [assignmentAIDTuple[0] for assignmentAIDTuple in assignmentAIDTuples]
            if assignmentAIDs:
                assignmentALatestRevisionIDsSubQuery = meta.Session.query(func.max(meta.ArtifactRevisions.c.id).label('assignmentALatestRevisionID')).filter(meta.ArtifactRevisions.c.artifactID.in_(assignmentAIDs)).group_by(meta.ArtifactRevisions.c.artifactID).subquery('assignmentALatestRevisionIDsSubQuery')
                artifactRevisionRelationsAlias = aliased(meta.ArtifactRevisionRelations)
                artifactRevisionsAlias = aliased(meta.ArtifactRevisions)
                assignmentArtifactIDTuplesFromAssignmentAIDs = meta.Session.query(meta.ArtifactRevisionRelations.c.artifactRevisionID, artifactRevisionsAlias.c.artifactID, meta.ArtifactRevisions.c.artifactID).filter(meta.ArtifactRevisionRelations.c.artifactRevisionID == assignmentALatestRevisionIDsSubQuery.c.assignmentALatestRevisionID).join(artifactRevisionRelationsAlias, meta.ArtifactRevisionRelations.c.hasArtifactRevisionID==artifactRevisionRelationsAlias.c.artifactRevisionID).join(artifactRevisionsAlias, artifactRevisionRelationsAlias.c.artifactRevisionID==artifactRevisionsAlias.c.id).join(meta.ArtifactRevisions, artifactRevisionRelationsAlias.c.hasArtifactRevisionID==meta.ArtifactRevisions.c.id).all() 
                
                #Populate the actualIDs
                assignmentArtifactIDsFromAssignmentAIDs = [assignmentArtifactIDTupleFromAssignmentAIDs[2] for assignmentArtifactIDTupleFromAssignmentAIDs in assignmentArtifactIDTuplesFromAssignmentAIDs]
                assignmentArtifactIDs = list(set(assignmentArtifactIDs) - set(assignmentAIDs) | set(assignmentArtifactIDsFromAssignmentAIDs))

                #Populate the contexts
                assignmentArtifactIDParentIDsFromAssignmentAIDs = [(assignmentArtifactIDTupleFromAssignmentAIDs[2], assignmentArtifactIDTupleFromAssignmentAIDs[1]) for assignmentArtifactIDTupleFromAssignmentAIDs in assignmentArtifactIDTuplesFromAssignmentAIDs]
                if assignmentArtifactIDParentIDsFromAssignmentAIDs:
                    studyTrackItemContextFilters = [sqlalchemy.and_(meta.StudyTrackItemContexts.c.studyTrackItemID==assignmentArtifactIDParentIDFromAssignmentAIDs[0], meta.StudyTrackItemContexts.c.studyTrackID==assignmentArtifactIDParentIDFromAssignmentAIDs[1]) for assignmentArtifactIDParentIDFromAssignmentAIDs in assignmentArtifactIDParentIDsFromAssignmentAIDs]
                    studyTrackItemContextInfos = meta.Session.query(meta.StudyTrackItemContexts.c.studyTrackID, meta.StudyTrackItemContexts.c.studyTrackItemID, meta.StudyTrackItemContexts.c.contextUrl, meta.StudyTrackItemContexts.c.conceptCollectionHandle, meta.StudyTrackItemContexts.c.collectionCreatorID).filter(sqlalchemy.or_(*studyTrackItemContextFilters)).all()
                    for studyTrackItemContextInfo in studyTrackItemContextInfos:
                        if studyTrackItemContextInfo[1] not in assignmentArtifactIDCollectionContextsMap:
                            assignmentArtifactIDCollectionContextsMap[studyTrackItemContextInfo[1]] = (studyTrackItemContextInfo[2], studyTrackItemContextInfo[3], studyTrackItemContextInfo[4])


            #Perform the type check again after resolution of 'assignment' typed assignmentArtifactIDs
            assignmentTypeIDsSubQuery = meta.Session.query(meta.Artifacts.c.artifactTypeID).filter(meta.Artifacts.c.id.in_(assignmentArtifactIDs)).subquery('assignmentTypeIDsSubQuery')
            assignmentArtifactTypeInfoTuples= meta.Session.query(meta.ArtifactTypes.c.name, meta.ArtifactTypes.c.modality).filter(meta.ArtifactTypes.c.id == assignmentTypeIDsSubQuery.c.artifactTypeID).all()
            areValidAssignmentArtifactTypes = all([(assignmentArtifactTypeInfoTuple[0] in (u'domain') or assignmentArtifactTypeInfoTuple[1])for assignmentArtifactTypeInfoTuple in assignmentArtifactTypeInfoTuples])
            if not areValidAssignmentArtifactTypes:
                 raise exceptions.InvalidArgumentException(u"Invalid type of assignmentArtifactIDs : [{assignmentArtifactIDs}] rceived. They should be of type [assignment | domain ] or of type which is a modality.".format(assignmentArtifactIDs=assignmentArtifactIDs).encode('utf-8'))

            #Now since all the resolutions are done, create a map of type to ids for all the assignmentArtifacts.
            assignmentArtifactTypeIDsMap = {}
            assignmentArtifactInfos  = meta.Session.query(meta.Artifacts.c.id, meta.ArtifactTypes.c.name).filter(meta.Artifacts.c.id.in_(assignmentArtifactIDs), meta.Artifacts.c.artifactTypeID == meta.ArtifactTypes.c.id).all()
            for assignmentArtifactInfo in assignmentArtifactInfos:
                assignmentArtifactID = assignmentArtifactInfo[0]
                assignmentArtifactType = assignmentArtifactInfo[1]
                if assignmentArtifactType not in assignmentArtifactTypeIDsMap:
                    assignmentArtifactTypeIDsMap[assignmentArtifactType] = []
                assignmentArtifactTypeIDsMap[assignmentArtifactType].append(assignmentArtifactID)


                #add all the latest revisions of the assignmentArtifactIDs as children to the created study-track
            assignmentArtifactIDsChunks = [assignmentArtifactIDs[x:x+20] for x in xrange(0, len(assignmentArtifactIDs), 20)]
            assignmentArtifactLatestRevisionIDs = []
            for assignmentArtifactIDsChunk in assignmentArtifactIDsChunks:
                assignmentArtifactLatestRevisionIDTuplesChunk = meta.Session.query(func.max(meta.ArtifactRevisions.c.id)).filter(meta.ArtifactRevisions.c.artifactID.in_(assignmentArtifactIDsChunk)).group_by(meta.ArtifactRevisions.c.artifactID).all()
                assignmentArtifactLatestRevisionIDs.extend([assignmentArtifactLatestRevisionIDTuple[0] for assignmentArtifactLatestRevisionIDTuple in assignmentArtifactLatestRevisionIDTuplesChunk])
            assignmentASTDO.revisions[0].children = []
            sequence=0
            for assignmentArtifactLatestRevisionID in assignmentArtifactLatestRevisionIDs:
                sequence = sequence+1
                assignmentASTDO.revisions[0].children.append(model.ArtifactRevisionRelation(hasArtifactRevisionID=assignmentArtifactLatestRevisionID, sequence=sequence))


            #Defaulting the Contexts
            #Note that since this defaultization (selecting a ck12Editor owned collection context randomly) is happening after the resolution of 'assignment' typed assignmentArtifactIDs, 
                #we are retaining any of the existing contexts from those 'assignment' typed ArtifactIDs
            assignmentArtifactDefaultCollectionContextInfos = []
                #ck12EditorID determination - to be used in defaultizing the contexts
            ck12EditorLogin = 'ck12editor'
            ck12EditorID  = None
            try:
                ck12EditorID = meta.Session.query(meta.Members.c.id).filter(meta.Members.c.login == ck12EditorLogin).one()[0]
            except exc.NoResultFound:
                raise exceptions.SystemDataException(u"No member could be found with the ck12EditorLogin : [{ck12EditorLogin}] in the dataBase. Internal System data error.".format(ck12EditorLogin=ck12EditorLogin).encode('utf-8'))   
            except exc.MultipleResultsFound:
                raise exceptions.SystemDataException(u"Multiple members are found with the ck12EditorLogin : [{ck12EditorLogin}] in the dataBase. Internal System data error.".format(ck12EditorLogin=ck12EditorLogin).encode('utf-8'))

            #Generate a default context for all the studyTrackItems which are of type 'asmtpractice'
            asmtPracticeTypedAssignmentArtifactIDs = assignmentArtifactTypeIDsMap.get('asmtpractice', [])
            asmtPracticeTypedAssignmentArtifactIDsWithOutCollectionContext = [asmtPracticeTypedAssignmentArtifactID for asmtPracticeTypedAssignmentArtifactID in asmtPracticeTypedAssignmentArtifactIDs if asmtPracticeTypedAssignmentArtifactID not in assignmentArtifactIDCollectionContextsMap]
            if asmtPracticeTypedAssignmentArtifactIDsWithOutCollectionContext:
                asmtPracticeTypedAssignmentArtifactDefaultCollectionContextInfos = meta.Session.query(meta.RelatedArtifacts.c.artifactID, meta.RelatedArtifacts.c.conceptCollectionHandle, meta.RelatedArtifacts.c.collectionCreatorID).filter(meta.RelatedArtifacts.c.artifactID.in_(asmtPracticeTypedAssignmentArtifactIDsWithOutCollectionContext), meta.RelatedArtifacts.c.conceptCollectionHandle != '', meta.RelatedArtifacts.c.collectionCreatorID == ck12EditorID).all()
                assignmentArtifactDefaultCollectionContextInfos.extend(asmtPracticeTypedAssignmentArtifactDefaultCollectionContextInfos)


            #Generate a default context for all the studyTrackItems which are of type 'domain'
            domainTypedAssignmentArtifactIDs = assignmentArtifactTypeIDsMap.get('domain', [])
            domainTypedAssignmentArtifactIDsWithOutCollectionContext = [domainTypedAssignmentArtifactID for domainTypedAssignmentArtifactID in domainTypedAssignmentArtifactIDs if domainTypedAssignmentArtifactID not in assignmentArtifactIDCollectionContextsMap]
            if domainTypedAssignmentArtifactIDsWithOutCollectionContext:
                browseTermIDArtifactIDsMap = {}
                domainTypedAssignmentArtifactIDBrowseTermInfos = meta.Session.query(meta.Artifacts.c.id, meta.BrowseTerms.c.encodedID, meta.BrowseTerms.c.id).filter(meta.Artifacts.c.id.in_(domainTypedAssignmentArtifactIDsWithOutCollectionContext), meta.Artifacts.c.encodedID == meta.BrowseTerms.c.encodedID).all()
                for domainTypedAssignmentArtifactIDBrowseTermInfo in domainTypedAssignmentArtifactIDBrowseTermInfos:
                    artifactID = domainTypedAssignmentArtifactIDBrowseTermInfo[0]
                    browseTermID = domainTypedAssignmentArtifactIDBrowseTermInfo[2]
                    if browseTermID not in browseTermIDArtifactIDsMap:
                        browseTermIDArtifactIDsMap[browseTermID] = []
                    browseTermIDArtifactIDsMap[browseTermID].append(artifactID)

                browseTermIDs = browseTermIDArtifactIDsMap.keys()
                browseTermDefaultContextInfos = meta.Session.query(meta.RelatedArtifacts.c.domainID, meta.RelatedArtifacts.c.conceptCollectionHandle, meta.RelatedArtifacts.c.collectionCreatorID).filter(meta.RelatedArtifacts.c.domainID.in_(browseTermIDs), meta.RelatedArtifacts.c.conceptCollectionHandle != '', meta.RelatedArtifacts.c.collectionCreatorID == ck12EditorID).all()
                for browseTermDefaultContextInfo in browseTermDefaultContextInfos:
                    browseTermID = browseTermDefaultContextInfo[0]
                    conceptCollectionHandle = browseTermDefaultContextInfo[1]
                    collectionCreatorID = browseTermDefaultContextInfo[2]
                    artifactIDs = browseTermIDArtifactIDsMap.get(browseTermID)
                    for artifactID in artifactIDs:
                        assignmentArtifactDefaultCollectionContextInfos.append((artifactID, conceptCollectionHandle, collectionCreatorID))

            #Populate the contextsMap with the generated default contexts.
            for assignmentArtifactDefaultCollectionContextInfo in assignmentArtifactDefaultCollectionContextInfos:
                assignmentArtifactID = assignmentArtifactDefaultCollectionContextInfo[0]
                assignmentArtifactDefaultConceptCollectionHandle = assignmentArtifactDefaultCollectionContextInfo[1]
                assignmentArtifactDefaultCollectionCreatorID = assignmentArtifactDefaultCollectionContextInfo[2] #3 by defaulting in the query
                if assignmentArtifactID not in assignmentArtifactIDCollectionContextsMap:
                      assignmentArtifactIDCollectionContextsMap[assignmentArtifactID] = (None, assignmentArtifactDefaultConceptCollectionHandle, assignmentArtifactDefaultCollectionCreatorID)

            #Verify that contexts are present for all the 'asmtpractice' & 'domain' typed assignmentArtifactIDs now
            asmtPracticeTypedAssignmentArtifactIDsWithOutDefaultCollectionContext = [asmtPracticeTypedAssignmentArtifactIDWithOutCollectionContext for asmtPracticeTypedAssignmentArtifactIDWithOutCollectionContext in asmtPracticeTypedAssignmentArtifactIDsWithOutCollectionContext if asmtPracticeTypedAssignmentArtifactIDWithOutCollectionContext not in assignmentArtifactIDCollectionContextsMap]
            if asmtPracticeTypedAssignmentArtifactIDsWithOutDefaultCollectionContext:
                raise exceptions.SystemDataException(u"Could not defaultize the collection contexts for one or more of the received 'asmtpractice' typed assignmentArtifactIDs. asmtPracticeTypedAssignmentArtifactIDsWithOutDefaultCollectionContext: [{asmtPracticeTypedAssignmentArtifactIDsWithOutDefaultCollectionContext}]. Please contact the admin.".format(asmtPracticeTypedAssignmentArtifactIDsWithOutDefaultCollectionContext=asmtPracticeTypedAssignmentArtifactIDsWithOutDefaultCollectionContext).encode('utf-8'))                   
            domainTypedAssignmentArtifactIDsWithOutDefaultCollectionContext = [domainTypedAssignmentArtifactIDWithOutCollectionContext for domainTypedAssignmentArtifactIDWithOutCollectionContext in domainTypedAssignmentArtifactIDsWithOutCollectionContext if domainTypedAssignmentArtifactIDWithOutCollectionContext not in assignmentArtifactIDCollectionContextsMap]
            if domainTypedAssignmentArtifactIDsWithOutDefaultCollectionContext:
                raise exceptions.SystemDataException(u"Could not defaultize the collection contexts for one or more of the received 'domain' typed assignmentArtifactIDs. domainTypedAssignmentArtifactIDsWithOutDefaultCollectionContext: [{domainTypedAssignmentArtifactIDsWithOutDefaultCollectionContext}]. Please contact the admin.".format(domainTypedAssignmentArtifactIDsWithOutDefaultCollectionContext=domainTypedAssignmentArtifactIDsWithOutDefaultCollectionContext).encode('utf-8'))                   

            #Once the defaultization...etc is completed, now attach the contexts.
            assignmentASTDO.studyTrackItemContexts = []
            for assignmentArtifactID, assignmentArtifactCollectionContext in assignmentArtifactIDCollectionContextsMap.items():
                assignmentASTDO.studyTrackItemContexts.append(model.StudyTrackItemContext(studyTrackItemID=assignmentArtifactID, contextUrl=assignmentArtifactCollectionContext[0], conceptCollectionHandle=assignmentArtifactCollectionContext[1], collectionCreatorID=assignmentArtifactCollectionContext[2]))

            #Artifact table entry for the assignment
            assignmentADO = model.Artifact(name=assignmentName, handle=assignmentADOHandle, creatorID=memberID, artifactTypeID=artifactTypeInfoDict['assignment'], 
                    creationTime=atomicOperationTime, updateTime=atomicOperationTime, languageID=assignmentLanguageDO.id)
            assignmentADO.revisions = [model.ArtifactRevision(revision=1, creationTime=atomicOperationTime)]

                #add the latest revision of the created study-track as the child of assignment
            assignmentADORevisionChildDO = model.ArtifactRevisionRelation()
            assignmentADORevisionChildDO.child = assignmentASTDO.revisions[0]
            assignmentADORevisionChildDO.sequence = 1
            assignmentADO.revisions[0].children = [assignmentADORevisionChildDO]

            #Assignment table entry
            assignmentDO = model.Assignment()
            assignmentDO.artifact = assignmentADO
            assignmentDO.group = groupDO
            assignmentDueBy = assignmentDict.get('assignmentDueBy')
            if assignmentDueBy:
                assignmentDO.due = assignmentDueBy

            #create memberStudyTrackStauses for all the members in the group with all of the assignmentArtifacts
            assignmentDO.memberStudyTrackStatuses = []
            groupMemberIDs = [groupDOMember.memberID for groupDOMember in assignmentDO.group.members]
            for groupMemberID in groupMemberIDs:
                if groupMemberID != memberID:
                    for assignmentArtifactID in assignmentArtifactIDs:
                        assignmentDO.memberStudyTrackStatuses.append(model.MemberStudyTrackItemStatus(memberID=groupMemberID, studyTrackItemID=assignmentArtifactID))
            
            #create and lmsAssignment to this assignment
            if partnerAssignmentID:
                assignmentDO.lmsAssignments = [model.LMSProviderAssignment(providerID=partnerID, providerAssignmentID=partnerAssignmentID)]
            else:
                assignmentDO.lmsAssignments = []
            
            meta.Session.add(assignmentDO)
            meta.Session.flush()
            assignmentDict = self._generateAssignmentDict(assignmentDO)
            assignmentDict['partnerAppName'] = partnerAppName
            assignmentDict['partnerName'] = partnerName
            assignmentDict['partnerGroupID'] = partnerGroupID
            meta.Session.commit()
            return assignmentDict
        except SQLAlchemyError, sqlae:
            logging.exception(sqlae)
            meta.Session.rollback()
            raise exceptions.SystemInternalException(unicode(sqlae).encode('utf-8'))
        except Exception, e:
            logging.exception(e)
            meta.Session.rollback()
            raise e
        finally:
            meta.Session.expire_all()
            meta.Session.close()
            meta.Session.remove()

    def enrollMembersInGroup(self, memberDict, enrollDict, partnerAppName):
        meta.Session.begin()
        atomicOperationTime = datetime.now()
        try:
            #It is assumed that the member is properly authenticated with the auth server using his login cookie in the request by now.
            #And we would have a proper and valid memberDetails in the memberDict
            memberID = memberDict.get('memberID')
            if not memberID:
                raise exceptions.InvalidArgumentException(u"Invalid memberID : [{memberID}] is received.".format(memberID=memberID).encode('utf-8'))

            try:
                (partnerAppID, partnerID, partnerName, ) = meta.Session.query(meta.LMSProviderApps.c.appID, meta.LMSProviderApps.c.providerID, meta.LMSProviders.c.name).filter(meta.LMSProviderApps.c.appID == partnerAppName).join(meta.LMSProviders, meta.LMSProviderApps.c.providerID==meta.LMSProviders.c.id).one()
            except exc.NoResultFound:
                raise exceptions.ResourceNotFoundException(u"PartnerApp with the given partnerAppName : [{partnerAppName}] could not be found in the dataBase.".format(partnerAppName=partnerAppName).encode('utf-8'))
            except exc.MultipleResultsFound:
                raise exceptions.SystemDataException(u"Multiple partnerApps with the given partnerAppName : [{partnerAppName}] are found in the dataBase. Internal System data error.".format(partnerAppName=partnerAppName).encode('utf-8'))

            partnerGroupID = enrollDict.get('partnerGroupID')
            partnerGroupDO = meta.Session.query(model.LMSProviderGroup).get((partnerAppID, partnerGroupID))
            groupID = partnerGroupDO.groupID if partnerGroupDO else None
            if groupID:
                groupDO = meta.Session.query(model.Group).get(groupID)
                groupCreatorID = groupDO.creatorID
                if memberID != groupCreatorID:
                    raise exceptions.UnauthorizedException(u"Given member with the memberID : [{memberID}] is not authorized to enroll students in the given group with partnerGroupID : [{partnerGroupID}] and partnerAppName = [{partnerAppName}].".format(memberID=memberID, partnerGroupID=partnerGroupID, partnerAppName=partnerAppName).encode('utf-8'))

                partnerGroupName = enrollDict.get('partnerGroupName')
                if partnerGroupName is not None and partnerGroupDO.title != partnerGroupName:
                    partnerGroupDO.title = partnerGroupName
                    partnerGroupDO.updateTime = atomicOperationTime

                if partnerGroupName is not None and groupDO.name != partnerGroupName:
                    #verify is update is valid
                    try:
                        groupIDFromNameCreator= meta.Session.query(meta.Groups).filter(meta.Groups.c.name==partnerGroupName, meta.Groups.c.creatorID==memberID).one()
                    except exc.NoResultFound:
                        groupIDFromNameCreator = None
                    except exc.MultipleResultsFound:
                        raise exceptions.SystemDataException(u"Multiple groups with the given partnerGroupName : [{partnerGroupName}], memberID : [{memberID}] combination are found in the dataBase. Internal System data error.".format(partnerGroupName=partnerGroupName, memberID=memberID).encode('utf-8'))   
                    if groupIDFromNameCreator is not None:
                        raise exceptions.ResourceAlreadyExistsException(u"Current group's name cannot be updated as another group with the given partnerGroupName : [{partnerGroupName}], memberID : [{memberID}] combination is already found in the dataBase. Please try another partnerGroupName or leave the original as is by not passing any partnerGroupName.".format(partnerGroupName=partnerGroupName, memberID=memberID).encode('utf-8'))
                    
                    #Now upodate
                    groupDO.name = partnerGroupName
                    groupDO.handle = self._convertNameToHandle(partnerGroupName, forGroup=True)
                    groupDO.updateTime = atomicOperationTime
            else:
                partnerGroupName = enrollDict.get('partnerGroupName')
                if not partnerGroupName:
                    if partnerGroupDO:
                        partnerGroupName = partnerGroupDO.title
                    else:
                        raise exceptions.InvalidArgumentException(u"Invalid partnerGroupName : [{partnerGroupName}] is received. partnerGroupName is mandatory while trying to enroll students in the group for first time.".format(partnerGroupName=partnerGroupName).encode('utf-8'))
                else:
                    if partnerGroupDO:
                        if partnerGroupName != partnerGroupDO.title:
                            partnerGroupDO.title = partnerGroupName
                            partnerGroupDO.updateTime = atomicOperationTime

                try:
                    groupIDFromNameCreator= meta.Session.query(meta.Groups).filter(meta.Groups.c.name==partnerGroupName, meta.Groups.c.creatorID==memberID).one()
                except exc.NoResultFound:
                    groupIDFromNameCreator = None
                except exc.MultipleResultsFound:
                    raise exceptions.SystemDataException(u"Multiple groups with the given partnerGroupName : [{partnerGroupName}], memberID : [{memberID}] combination are found in the dataBase. Internal System data error.".format(partnerGroupName=partnerGroupName, memberID=memberID).encode('utf-8'))   
                if groupIDFromNameCreator is not None:
                    raise exceptions.ResourceAlreadyExistsException(u"Group can not be created as another group with the given partnerGroupName : [{partnerGroupName}], memberID : [{memberID}] combination is found in the dataBase. Please try changing the partnerGroupName.".format(partnerGroupName=partnerGroupName, memberID=memberID).encode('utf-8'))
                
                groupDO = model.Group(parentID=1, name=partnerGroupName, handle=self._convertNameToHandle(partnerGroupName, forGroup=True), creatorID=memberID, creationTime=atomicOperationTime, updateTime=atomicOperationTime)
                if not partnerGroupDO:
                    partnerGroupDO = model.LMSProviderGroup(appID=partnerAppID, providerGroupID=partnerGroupID, title=partnerGroupName, creationTime=atomicOperationTime, updateTime=atomicOperationTime)

                memberRoleInfoInRootGroupTuples = meta.Session.query(meta.GroupHasMembers.c.roleID, meta.MemberRoles.c.name).filter(meta.GroupHasMembers.c.memberID==memberID, meta.GroupHasMembers.c.groupID==1).join(meta.MemberRoles, meta.GroupHasMembers.c.roleID==meta.MemberRoles.c.id).all()
                memberRoleNamesInRootGroup  = [memberRoleInfoInRootGroupTuple[1] for memberRoleInfoInRootGroupTuple in memberRoleInfoInRootGroupTuples]  
                if 'teacher' in memberRoleNamesInRootGroup:
                    groupDO.groupType = 'class'
                
                groupDO.lmsGroups = []
                groupDO.members = []
                groupDO.assignments = []
                
                meta.Session.add(groupDO)
                meta.Session.add(partnerGroupDO)
                meta.Session.flush()

            memberRoleInfoTuples = meta.Session.query(meta.MemberRoles.c.name, meta.MemberRoles.c.id).filter(meta.MemberRoles.c.name.in_(['groupmember', 'groupadmin'])).all()
            memberRoleInfoDict = {}
            for memberRoleInfoTuple in memberRoleInfoTuples:
                memberRoleInfoDict[memberRoleInfoTuple[0]] = memberRoleInfoTuple[1]
            if 'groupmember' not in memberRoleInfoDict:
                raise exceptions.SystemDataException(u"Group Member member role could not be found in the dataBase. Internal System data error.".format().encode('utf-8'))                   
            if 'groupadmin' not in memberRoleInfoDict:
                raise exceptions.SystemDataException(u"Group Admin member role could not be found in the dataBase. Internal System data error.".format().encode('utf-8'))                   
                  
            #filter and process the received partnerMemberIDs
            #filter the memberIDs already logged in with this group
            partnerMemberIDs = enrollDict.get('partnerMemberIDs')
            partnerMemberIDsNotEnrolledWithThisGroup = partnerMemberIDs
            partnerMemberIDsJustEnrolledWithThisGroup = []
            partnerMemberIDsAlreadyLoggedInWithThisGroup = {}
            memberIDsAlreadyLoggedInWithThisGroup = []
            partnerGroupMemberInfoTuples = meta.Session.query(meta.LMSProviderGroupMembers.c.providerMemberID, meta.LMSProviderGroupMembers.c.memberID).filter(meta.LMSProviderGroupMembers.c.providerGroupID==partnerGroupDO.providerGroupID, meta.LMSProviderGroupMembers.c.providerID==partnerID).all()
            for partnerGroupMemberInfoTuple in partnerGroupMemberInfoTuples:
                if partnerGroupMemberInfoTuple[0] in partnerMemberIDs:
                    if partnerGroupMemberInfoTuple[1] is None :
                        partnerMemberIDsJustEnrolledWithThisGroup.append(partnerGroupMemberInfoTuple[0])
                    else:
                        partnerMemberIDsAlreadyLoggedInWithThisGroup[partnerGroupMemberInfoTuple[0]] = partnerGroupMemberInfoTuple[1]
                if partnerGroupMemberInfoTuple[0] in partnerMemberIDsNotEnrolledWithThisGroup:
                    partnerMemberIDsNotEnrolledWithThisGroup.remove(partnerGroupMemberInfoTuple[0])
                if partnerGroupMemberInfoTuple[1]:
                    memberIDsAlreadyLoggedInWithThisGroup.append(partnerGroupMemberInfoTuple[1])
            
            partnerGroupMembersNotEnrolledWithThisGroup = []
            for partnerMemberIDNotEnrolledWithThisGroup in partnerMemberIDsNotEnrolledWithThisGroup:
                partnerGroupMembersNotEnrolledWithThisGroup.append({'providerMemberID':partnerMemberIDNotEnrolledWithThisGroup, 'providerGroupID':partnerGroupDO.providerGroupID, 'providerID':partnerID})
            if partnerGroupMembersNotEnrolledWithThisGroup:
                meta.Session.execute(meta.LMSProviderGroupMembers.insert(), partnerGroupMembersNotEnrolledWithThisGroup)
            
            #is memberID present as group-admin
            #are other memberIDs logged in with this group are present as group-member             
            isCreatorPresentAsAdmin = False;
            for groupMember in groupDO.members:
                if groupMember.memberID == memberID and groupMember.roleID == memberRoleInfoDict['groupadmin']:
                    isCreatorPresentAsAdmin = True
                if groupMember.roleID == memberRoleInfoDict['groupmember'] and groupMember.memberID in memberIDsAlreadyLoggedInWithThisGroup:
                    memberIDsAlreadyLoggedInWithThisGroup.remove(groupMember.memberID)
            if not isCreatorPresentAsAdmin:
                groupDO.members.append(model.GroupHasMembers(memberID=memberID, roleID=memberRoleInfoDict['groupadmin']))
            for memberIDAlreadyLoggedInWithThisGroup in memberIDsAlreadyLoggedInWithThisGroup:
                groupDO.members.append(model.GroupHasMembers(memberID=memberIDAlreadyLoggedInWithThisGroup, roleID=memberRoleInfoDict['groupmember']))
            
            #is partnerGroupDO present as lmsGroup
            isPartnerGroupPresentAsLMSGroup = False
            for lmsGroupDO in groupDO.lmsGroups:
                if lmsGroupDO.appID == partnerGroupDO.appID and lmsGroupDO.providerGroupID == partnerGroupDO.providerGroupID:
                   isPartnerGroupPresentAsLMSGroup = True
            if not isPartnerGroupPresentAsLMSGroup:
                groupDO.lmsGroups.append(partnerGroupDO)

            assignmentAIDs = []
            for groupAssignmentDO in groupDO.assignments:
                assignmentAIDs.append(groupAssignmentDO.assignmentID)

            groupMemberIDs = []
            for groupMemberDO in groupDO.members:
                groupMemberID = groupMemberDO.memberID
                roleID = groupMemberDO.roleID
                if groupMemberID not in groupMemberIDs and roleID != memberRoleInfoDict['groupadmin'] :
                    groupMemberIDs.append(groupMemberID)

            if assignmentAIDs and groupMemberIDs:
                self._assignAssignmentsToGroupMembers(assignmentAIDs, groupMemberIDs)
                         
            enrollDict = {}
            enrollDict[u'groupID'] = groupDO.id
            enrollDict[u'memberEnrollStatuses'] = []
            for partnerMemberIDNotEnrolledWithThisGroup in partnerMemberIDsNotEnrolledWithThisGroup:
                memberEnrollStatusDict = {}
                memberEnrollStatusDict[u'partnerMemberID'] =  partnerMemberIDNotEnrolledWithThisGroup
                memberEnrollStatusDict[u'enrollStatus'] = 'SUCCESS'
                memberEnrollStatusDict[u'enrollStatusMessage'] = 'MEMBER_ENROLLED_NOW_AND_YET_TO_ENROLL_IN_CK12_GROUP'
                enrollDict['memberEnrollStatuses'].append(memberEnrollStatusDict)

            for partnerMemberIDJustEnrolledWithThisGroup in partnerMemberIDsJustEnrolledWithThisGroup:
                memberEnrollStatusDict = {}
                memberEnrollStatusDict[u'partnerMemberID'] =  partnerMemberIDJustEnrolledWithThisGroup
                memberEnrollStatusDict[u'enrollStatus'] = 'SUCCESS'                
                memberEnrollStatusDict[u'enrollStatusMessage'] = 'MEMBER_ALREADY_ENROLLED_AND_YET_TO_ENROLL_IN_CK12_GROUP'
                enrollDict['memberEnrollStatuses'].append(memberEnrollStatusDict)        

            for partnerMemberIDAlreadyLoggedInWithThisGroup in partnerMemberIDsAlreadyLoggedInWithThisGroup:
                memberEnrollStatusDict = {}
                memberEnrollStatusDict[u'partnerMemberID'] = partnerMemberIDAlreadyLoggedInWithThisGroup
                memberEnrollStatusDict[u'memberID'] = partnerMemberIDsAlreadyLoggedInWithThisGroup[partnerMemberIDAlreadyLoggedInWithThisGroup]
                memberEnrollStatusDict[u'enrollStatus'] = 'SUCCESS'                
                memberEnrollStatusDict[u'enrollStatusMessage'] = 'MEMBER_ALREADY_ENROLLED_IN_BOTH_PARTNER_AND_CK12_GROUPS'
                enrollDict['memberEnrollStatuses'].append(memberEnrollStatusDict)  

            meta.Session.add(groupDO)
            meta.Session.flush()
            enrollDict[u'partnerAppName'] = partnerAppName
            enrollDict[u'partnerName'] = partnerName
            enrollDict[u'partnerGroupID'] = partnerGroupID
            meta.Session.commit()
            return enrollDict
        except SQLAlchemyError, sqlae:
            logging.exception(sqlae)
            meta.Session.rollback()
            raise exceptions.SystemInternalException(unicode(sqlae).encode('utf-8'))
        except Exception, e:
            logging.exception(e)
            meta.Session.rollback()
            raise e
        finally:
            meta.Session.expire_all()
            meta.Session.close()
            meta.Session.remove()

    def getAssignmentProgress(self, memberDict, partnerAppName, partnerGroupID, assignmentID):
        meta.Session.begin()
        atomicOperationTime = datetime.now()
        try:
            #It is assumed that the member is properly authenticated with the auth server using his login cookie in the request by now.
            #And we would have a proper and valid memberDetails in the memberDict
            memberID = memberDict.get('memberID')
            if not memberID:
                raise exceptions.InvalidArgumentException(u"Invalid memberID : [{memberID}] is received.".format(memberID=memberID).encode('utf-8'))

            try:
                (partnerAppID, partnerID, partnerName, ) = meta.Session.query(meta.LMSProviderApps.c.appID, meta.LMSProviderApps.c.providerID, meta.LMSProviders.c.name).filter(meta.LMSProviderApps.c.appID == partnerAppName).join(meta.LMSProviders, meta.LMSProviderApps.c.providerID==meta.LMSProviders.c.id).one()
            except exc.NoResultFound:
                raise exceptions.ResourceNotFoundException(u"PartnerApp with the given partnerAppName : [{partnerAppName}] could not be found in the dataBase.".format(partnerAppName=partnerAppName).encode('utf-8'))
            except exc.MultipleResultsFound:
                raise exceptions.SystemDataException(u"Multiple partnerApps with the given partnerAppName : [{partnerAppName}] are found in the dataBase. Internal System data error.".format(partnerAppName=partnerAppName).encode('utf-8'))

            partnerGroupDO = meta.Session.query(model.LMSProviderGroup).get((partnerAppID, partnerGroupID))
            if partnerGroupDO:
                groupID = partnerGroupDO.groupID          
                if groupID:
                    groupDO = meta.Session.query(model.Group).get(groupID)
                    groupCreatorID = groupDO.creatorID
                else:
                    raise exceptions.InvalidArgumentException(u"Group with the given partnerGroupID: [{partnerGroupID}] and partnerAppName : [{partnerAppName}] currently doesn't have a corresponding CK12 group in the dataBase. Internal System data error. Please contact CK12 admin or report on our support page.".format(partnerGroupID=partnerGroupID, partnerAppName=partnerAppName).encode('utf-8'))
            else:
                raise exceptions.InvalidArgumentException(u"Group with the given partnerGroupID: [{partnerGroupID}] and partnerAppName : [{partnerAppName}] could not be found in the dataBase.".format(partnerGroupID=partnerGroupID, partnerAppName=partnerAppName).encode('utf-8'))

            assignmentMetaDO = meta.Session.query(meta.Assignments).filter(meta.Assignments.c.assignmentID==assignmentID).all()
            if not assignmentMetaDO:
                raise exceptions.InvalidArgumentException(u"Assignment with the given assignmentID : [{assignmentID}] could not be found in the dataBase.".format(assignmentID=assignmentID).encode('utf-8'))
            
            groupAssignmentMetaDO = meta.Session.query(meta.Assignments).filter(meta.Assignments.c.assignmentID==assignmentID, meta.Assignments.c.groupID==groupID).all()
            if not groupAssignmentMetaDO:
                raise exceptions.InvalidArgumentException(u"Assignment with the given assignmentID : [{assignmentID}] is not assigned to the group with the given partnerGroupID: [{partnerGroupID}] and partnerAppName : [{partnerAppName}].".format(assignmentID=assignmentID, partnerGroupID=partnerGroupID, partnerAppName=partnerAppName).encode('utf-8'))

            if memberID != groupCreatorID:
                groupPartnerMemberInfoTuples = meta.Session.query(meta.LMSProviderGroupMembers.c.providerMemberID, meta.LMSProviderGroupMembers.c.memberID).filter(meta.LMSProviderGroupMembers.c.providerID == partnerID, meta.LMSProviderGroupMembers.c.providerGroupID == partnerGroupID, meta.LMSProviderGroupMembers.c.memberID == memberID).all()
                if not groupPartnerMemberInfoTuples:
                    raise exceptions.InvalidArgumentException(u"Given member with memberID : [{memberID}] is neither the owner nor is currently enrolled in the group with the given partnerGroupID: [{partnerGroupID}] and partnerAppName : [{partnerAppName}].".format(memberID=memberID, partnerGroupID=partnerGroupID, partnerAppName=partnerAppName).encode('utf-8'))
            else:
                groupPartnerMemberInfoTuples = meta.Session.query(meta.LMSProviderGroupMembers.c.providerMemberID, meta.LMSProviderGroupMembers.c.memberID).filter(meta.LMSProviderGroupMembers.c.providerID == partnerID, meta.LMSProviderGroupMembers.c.providerGroupID == partnerGroupID).all()

            if memberID != groupCreatorID:
                groupMemberTuples = meta.Session.query(meta.GroupHasMembers.c.memberID).filter(meta.GroupHasMembers.c.groupID == groupID, meta.GroupHasMembers.c.memberID == memberID).all()
                groupMemberIDs = [groupMemberTuple[0] for groupMemberTuple in groupMemberTuples]
                if not groupMemberIDs:
                    raise exceptions.SystemDataException(u"Given member with memberID : [{memberID}] seems to be neither the owner nor is currently enrolled with the CK12 group corresponding to the partner group with given partnerGroupID: [{partnerGroupID}] and partnerAppName : [{partnerAppName}]. Member gets enrolled with CK12 group when he logs in to the CK12 system for the first time after getting enrolled in the partner group. Internal System data error. Please contact CK12 admin or report on our support page.".format(memberID=memberID, partnerGroupID=partnerGroupID, partnerAppName=partnerAppName).encode('utf-8'))            
            else:
                groupMemberTuples = meta.Session.query(meta.GroupHasMembers.c.memberID).filter(meta.GroupHasMembers.c.groupID == groupID).all()
                groupMemberIDs = [groupMemberTuple[0] for groupMemberTuple in groupMemberTuples]       
            
            memberStudyTrackItemStatusMetaDOs = meta.Session.query(meta.MemberStudyTrackItemStatus).filter(meta.MemberStudyTrackItemStatus.c.memberID.in_(groupMemberIDs), meta.MemberStudyTrackItemStatus.c.assignmentID == assignmentID).all()
            memberStudyTracksProgressMap = {}
            for memberStudyTrackItemStatusMetaDO in memberStudyTrackItemStatusMetaDOs:
                if memberStudyTrackItemStatusMetaDO.memberID not in memberStudyTracksProgressMap:
                    memberStudyTracksProgressMap[memberStudyTrackItemStatusMetaDO.memberID] = []
                memberStudyTrackProgress = {}
                memberStudyTrackProgress['studyTrackItemID'] = memberStudyTrackItemStatusMetaDO.studyTrackItemID
                memberStudyTrackProgress['status'] = memberStudyTrackItemStatusMetaDO.status
                memberStudyTrackProgress['score'] = memberStudyTrackItemStatusMetaDO.score
                if memberStudyTrackItemStatusMetaDO.lastAccess:
                    memberStudyTrackProgress['lastAccessed'] = memberStudyTrackItemStatusMetaDO.lastAccess.replace(tzinfo=Local).isoformat()
                else:
                    memberStudyTrackProgress['lastAccessed'] =  memberStudyTrackItemStatusMetaDO.lastAccess
                memberStudyTracksProgressMap[memberStudyTrackItemStatusMetaDO.memberID].append(memberStudyTrackProgress)

            assignmentProgressDict = {}
            assignmentProgressDict[u'assignmentID'] = assignmentID
            assignmentProgressDict[u'groupID'] = groupID
            assignmentProgressDict[u'membersAssignmentProgress'] = []
            for groupPartnerMemberInfoTuple in groupPartnerMemberInfoTuples:
                memberAssignmentProgress = {}
                memberAssignmentProgress[u'partnerMemberID'] = groupPartnerMemberInfoTuple[0]

                if not groupPartnerMemberInfoTuple[1]:
                    memberAssignmentProgress[u'memberStatus'] = 'MEMBER_NOT_LOGGED_INTO_CK12_TO_ATTEMPT_ANY_ASSIGNMENT'
                    memberAssignmentProgress[u'assignmentProgress'] =  [] 
                else:
                    memberAssignmentProgress[u'memberID'] = groupPartnerMemberInfoTuple[1]
                    if groupPartnerMemberInfoTuple[1] not in groupMemberIDs:
                        memberAssignmentProgress[u'memberStatus']  = 'MEMBER_NOT_ENROLLED_IN_CK12_GROUP.SYSTEM_DATA_ERROR'
                        memberAssignmentProgress[u'assignmentProgress'] = [] 
                    else: 
                        if groupPartnerMemberInfoTuple[1] not in memberStudyTracksProgressMap:
                            memberAssignmentProgress[u'memberStatus']  = 'MEMBER_NOT_ASSIGNED_ANY_ASSIGNMENTS.SYSTEM_DATA_ERROR'
                            memberAssignmentProgress[u'assignmentProgress'] = [] 
                        else:
                            memberAssignmentProgress[u'memberStatus']  = 'MEMBER_ASSIGN_ATTEMPT_SUCCESSFULL'
                            memberAssignmentProgress[u'assignmentProgress'] = memberStudyTracksProgressMap[groupPartnerMemberInfoTuple[1]]
                
                assignmentProgressDict[u'membersAssignmentProgress'].append(memberAssignmentProgress)
 
            assignmentProgressDict['partnerAppName'] = partnerAppName
            assignmentProgressDict['partnerName'] = partnerName
            assignmentProgressDict['partnerGroupID'] = partnerGroupID
            meta.Session.commit()
            return assignmentProgressDict
        except SQLAlchemyError, sqlae:
            logging.exception(sqlae)
            meta.Session.rollback()
            raise exceptions.SystemInternalException(unicode(sqlae).encode('utf-8'))
        except Exception, e:
            logging.exception(e)
            meta.Session.rollback()
            raise e
        finally:
            meta.Session.expire_all()
            meta.Session.close()
            meta.Session.remove()

    def performPartnerMemberDefaultLoginActions(self, memberDict, partnerName, partnerMemberID):
        meta.Session.begin(subtransactions=True)
        atomicOperationTime = datetime.now()
        try:
            #It is assumed that the member is properly authenticated with the auth server using his login cookie in the request by now.
            #And we would have a proper and valid memberDetails in the memberDict
            memberID = memberDict.get('memberID')
            if not memberID:
                raise exceptions.InvalidArgumentException(u"Invalid memberID : [{memberID}] is received.".format(memberID=memberID).encode('utf-8'))

            try:
                (partnerID, partnerName, ) = meta.Session.query(meta.LMSProviders.c.id, meta.LMSProviders.c.name).filter(meta.LMSProviders.c.name == partnerName).one()
            except exc.NoResultFound:
                raise exceptions.ResourceNotFoundException(u"Partner with the received partnerName : [{partnerName}] could not be found in the dataBase.".format(partnerName=partnerName).encode('utf-8'))
            except exc.MultipleResultsFound:
                raise exceptions.SystemDataException(u"Multiple partners with the received partnerName : [{partnerName}] are found in the dataBase. Internal System data error.".format(partnerName=partnerName).encode('utf-8'))

            #get all the partnerGroupIDs in which this partnerMember is enrolled as a member recently
            memberPartnerGroupIDTuples = meta.Session.query(sqlalchemy.distinct(meta.LMSProviderGroupMembers.c.providerGroupID)).filter(meta.LMSProviderGroupMembers.c.providerID==partnerID, meta.LMSProviderGroupMembers.c.providerMemberID==partnerMemberID, sqlalchemy.or_(meta.LMSProviderGroupMembers.c.memberID != memberID, meta.LMSProviderGroupMembers.c.memberID == None)).all()
            memberPartnerGroupIDs = [memberPartnerGroupIDTuple[0] for memberPartnerGroupIDTuple in memberPartnerGroupIDTuples]

            if memberPartnerGroupIDs:
                #update the memberID mapping of the oartnerMember across all partnerGroups
                meta.Session.execute(meta.LMSProviderGroupMembers.update().values(memberID=memberID).where(sqlalchemy.and_(meta.LMSProviderGroupMembers.c.providerID==partnerID, meta.LMSProviderGroupMembers.c.providerMemberID==partnerMemberID)))

                #check if there are any these partnerGroups doesn't have the corresponding group present
                incompleteMemberPartnerGroupIDTuples = meta.Session.query(meta.LMSProviderGroups.c.providerGroupID).filter(meta.LMSProviderGroups.c.providerGroupID.in_(memberPartnerGroupIDs), meta.LMSProviderGroups.c.groupID is None).all()
                if incompleteMemberPartnerGroupIDTuples:
                        raise exceptions.SystemDataException(u"Given member is currently part of some of the partner groups which doesn't have a corresponding group in dataBase. Internal System data error.".format().encode('utf-8'))                   

                #Now since all of them have a corresponding group, get all the groupIDs
                memberGroupIDFromPartnerGroupIDTuples = meta.Session.query(meta.LMSProviderGroups.c.groupID).filter(meta.LMSProviderGroups.c.providerGroupID.in_(memberPartnerGroupIDs), meta.LMSProviderGroups.c.groupID is not None).all()
                memberGroupIDFromPartnerGroupIDs = [memberGroupIDFromPartnerGroupIDTuple[0] for memberGroupIDFromPartnerGroupIDTuple in memberGroupIDFromPartnerGroupIDTuples]
                if memberGroupIDFromPartnerGroupIDs:
                    
                    memberRoleInfoTuples = meta.Session.query(meta.MemberRoles.c.name, meta.MemberRoles.c.id).filter(meta.MemberRoles.c.name.in_(['groupmember', 'groupadmin'])).all()
                    memberRoleInfoDict = {}
                    for memberRoleInfoTuple in memberRoleInfoTuples:
                        memberRoleInfoDict[memberRoleInfoTuple[0]] = memberRoleInfoTuple[1]
                    if 'groupmember' not in memberRoleInfoDict:
                        raise exceptions.SystemDataException(u"Group Member member role could not be found in the dataBase. Internal System data error.".format().encode('utf-8'))                   
                    if 'groupadmin' not in memberRoleInfoDict:
                        raise exceptions.SystemDataException(u"Group Admin member role could not be found in the dataBase. Internal System data error.".format().encode('utf-8'))                   
                    
                    #all the groupIDs in which this member is present as a 'groupmember'
                    memberGroupIDTuples = meta.Session.query(sqlalchemy.distinct(meta.GroupHasMembers.c.groupID)).filter(meta.GroupHasMembers.c.memberID==memberID, meta.GroupHasMembers.c.roleID==memberRoleInfoDict['groupmember']).all()
                    memberGroupIDs = [memberGroupIDTuple[0] for memberGroupIDTuple in memberGroupIDTuples]
                    
                    #filter those groupIDs in which this member is already present as a 'groupmember'
                    #And then add this member as a 'groupmember' for all the remaining groupIDs, 
                    groupIDs = list(set(memberGroupIDFromPartnerGroupIDs) - set(memberGroupIDs))                   
                    groupMembers = []
                    for groupID in groupIDs:
                        groupMembers.append({'groupID':groupID, 'memberID':memberID, 'roleID':memberRoleInfoDict['groupmember']})
                    if groupMembers:
                        meta.Session.execute(meta.GroupHasMembers.insert(), groupMembers)

                    #Verify all the assignments of all the groups he is a groupmember of should have been assigned to him. (entries in MemberStudyTrackItemStatus table)
                    memberGroupIDTuples = meta.Session.query(sqlalchemy.distinct(meta.GroupHasMembers.c.groupID)).filter(meta.GroupHasMembers.c.memberID==memberID, meta.GroupHasMembers.c.roleID==memberRoleInfoDict['groupmember']).all()
                    memberGroupIDs = [memberGroupIDTuple[0] for memberGroupIDTuple in memberGroupIDTuples]
                    assignmentAIDTuples = meta.Session.query(meta.Assignments.c.assignmentID).filter(meta.Assignments.c.groupID.in_(memberGroupIDs)).all()
                    assignmentAIDs = [assignmentAIDTuple[0] for assignmentAIDTuple in assignmentAIDTuples]
                    groupMemberIDs = [memberID]
                    if assignmentAIDs and groupMemberIDs:
                        self._assignAssignmentsToGroupMembers(assignmentAIDs, groupMemberIDs)

            meta.Session.commit()
        except SQLAlchemyError, sqlae:
            logging.exception(sqlae)
            meta.Session.rollback()
            raise exceptions.SystemInternalException(unicode(sqlae).encode('utf-8'))
        except Exception, e:
            logging.exception(e)
            meta.Session.rollback()
            raise e

    def verifyPartnerAppOwnership(self, partnerName, partnerAppName):
        meta.Session.begin(subtransactions=True)
        atomicOperationTime = datetime.now()
        try:
            try:
                (partnerAppID, partnerIDFromAppName, partnerNameFromAppName, ) = meta.Session.query(meta.LMSProviderApps.c.appID, meta.LMSProviderApps.c.providerID, meta.LMSProviders.c.name).filter(meta.LMSProviderApps.c.appID == partnerAppName).join(meta.LMSProviders, meta.LMSProviderApps.c.providerID==meta.LMSProviders.c.id).one()
            except exc.NoResultFound:
                raise exceptions.ResourceNotFoundException(u"PartnerApp with the given partnerAppName : [{partnerAppName}] could not be found in the dataBase.".format(partnerAppName=partnerAppName).encode('utf-8'))
            except exc.MultipleResultsFound:
                raise exceptions.SystemDataException(u"Multiple partnerApps with the given partnerAppName : [{partnerAppName}] are found in the dataBase. Internal System data error.".format(partnerAppName=partnerAppName).encode('utf-8'))

            if partnerNameFromAppName != partnerName:
                raise exceptions.InvalidArgumentException(u"partnerAppName : [{partnerAppName}] does not belong to the partner with the current partner with partnerName : [{partnerName}].".format(partnerAppName=partnerAppName, partnerName=partnerName).encode('utf-8'))

            meta.Session.commit()
        except SQLAlchemyError, sqlae:
            logging.exception(sqlae)
            meta.Session.rollback()
            raise exceptions.SystemInternalException(unicode(sqlae).encode('utf-8'))
        except Exception, e:
            logging.exception(e)
            meta.Session.rollback()
            raise e 
