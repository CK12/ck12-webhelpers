import logging
import time
import sys
import zlib
import sqlalchemy
import re


from flx.model.mongo import getDB as getMongoDB
from flx.model.mongo.collectionNode import CollectionNode
from flx.model.mongo.conceptnode import ConceptNode
from flx.model import meta, model
from flx.lib import helpers
from sqlalchemy.orm import aliased, exc
from sqlalchemy.sql import func
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from pylons import config

GAMMA_COLLECTIONS_RELEASE_DATE = '2017-07-16 00:00:00'
PROD_COLLECTIONS_RELEASE_DATE = '2017-08-05 00:00:00'
oldBranchToNewCollectionMap = {
    'ALG' : 'algebra',
    'ALY' : 'analysis',
    'ARI' : 'arithmetic',
    'BIO' : 'biology',
    'CAL' : 'calculus',
    'CHE' : 'chemistry',
    'EM1' : 'elementary-math-grade-1',
    'EM2' : 'elementary-math-grade-2',
    'EM3' : 'elementary-math-grade-3',
    'EM4' : 'elementary-math-grade-4',
    'EM5' : 'elementary-math-grade-5',
    'ESC' : 'earth-science',
    'GEO' : 'geometry',
    'LSC' : 'life-science',
    'MEA' : 'measurement',
    'PHY' : 'physics',
    'PRB' : 'probability',
    'PSC' : 'physical-science',
    'SPL' : 'spelling',
    'STA' : 'statistics',
    'TRG' : 'trigonometry'
}


#This script retrives the study-tracks which doesn't have a collection context between the startDate & endDate
#And then tries to attach a collectionContext to them by determining the EID redirection...etc.
#If there was a redirection determined / resolved and performAssignmentsMigration is turned on, Script would also update the domains of the studyTracks & entries in MemberStudyTrackItemStatus
#Would required collectionNodes & conceptNodes on FLX mongo, MigratedConcepts on FLX mysql to be up-to-date & sync
#This script is not idempotent, running the same script multiple times with the commitFixesToDataBase turned on would do unintened migrations since this script doesn't update the studyTrack's creationTime / updateTime

#####################
#Log Analysis - CMDs#
#####################
#grep -c "STARTED PROCESSING" /opt/2.0/log/collections_migrate_study_tracks.log
#grep -c "FAILED" /opt/2.0/log/collections_migrate_study_tracks.log
#grep  "FAILED" /opt/2.0/log/collections_migrate_study_tracks.log  | grep -c "unique CollectionContext determination for the endodedID:"
#grep  "FAILED" /opt/2.0/log/collections_migrate_study_tracks.log  | grep -c "Invalid (not a valid published EID in the new taxonomy structure) endodedID"
#grep -c "COMPLETED" /opt/2.0/log/collections_migrate_study_tracks.log
#grep -c "SCRIPT CURRENTLY DOESN'T SUPPORT THEM" /opt/2.0/log/collections_migrate_study_tracks.log
#grep -c "ALREADY PRESENT FOR ALL" /opt/2.0/log/collections_migrate_study_tracks.log
#grep -c "SUCCESSFULLY DETERMINED AND ATTACHED FOR ALL OF THEM" /opt/2.0/log/collections_migrate_study_tracks.log

#Usage: $paster shell
#>>>from paster_scripts import collections_migrate_study_tracks
#>>>collections_migrate_study_tracks.run(startCreationTime='2017-01-01 00:00:00', endCreationTime='2017-01-02 00:00:00', performAssignmentsMigration=False)
def run(creatorIDs=[], studyTrackIDs=[], startCreationTime=None, endCreationTime=None, environment='GAMMA', performAssignmentsMigration=False, commitFixesToDataBase=False):
    if environment == 'PROD':
        COLLECTIONS_RELEASE_DATE = PROD_COLLECTIONS_RELEASE_DATE
    elif environment == 'GAMMA':
        COLLECTIONS_RELEASE_DATE = GAMMA_COLLECTIONS_RELEASE_DATE
    else:
        raise Exception(u"Invalid 'environment' received. It should be one of [PROD, GAMMA].")

    if not isinstance(creatorIDs, list) or not all([isinstance(creatorID, int) for creatorID in creatorIDs]):
         raise Exception(u"Invalid 'creatorIDs' received. It should be a valid list of integers.")

    if performAssignmentsMigration:
        scoreReReportingPythonScriptFile = open("/tmp/collections_migrate_study_tracks_score_re_reporter.py", "w", 1)
        scoreReReportingPythonScriptFile.write("from assessment.views.celerytasks.scorereporter import ScoreReReporter\n")

    LOG_FILENAME = "/opt/2.0/log/collections_migrate_study_tracks.log"
    handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=1000*1024*1024, backupCount=5)
    log = logging.getLogger(__name__)
    log.setLevel(logging.DEBUG)
    log.addHandler(handler)
    handler.doRollover()

    processStartTime = time.time()
    session = meta.Session
    flxMongoDB = getMongoDB(config)
    collectionNode = CollectionNode(flxMongoDB)
    conceptNode = ConceptNode(flxMongoDB)
    artifactTypeNameIDMap = {}
    totalNumberOfStudyTracks = 0

    try:
        session.begin()
        try:
            artifactTypeInfos = session.query(meta.ArtifactTypes.c.name, meta.ArtifactTypes.c.id).filter(meta.ArtifactTypes.c.name.in_(['assignment', 'study-track', 'domain', 'asmtpractice'])).all()
            artifactTypeNameIDMap = {}
            for artifactTypeInfo in artifactTypeInfos:
                artifactTypeName = artifactTypeInfo[0]
                artifactTypeID = artifactTypeInfo[1]
                artifactTypeNameIDMap[artifactTypeName] = artifactTypeID

            if 'assignment' not in artifactTypeNameIDMap or 'study-track' not in artifactTypeNameIDMap or 'domain' not in artifactTypeNameIDMap or 'asmtpractice' not in artifactTypeNameIDMap:
                raise Exception(u"ArtifactTypeID of 'assignment' / 'study-track' / 'domain' / 'asmtpractice' types could not be determined from the dataBase.")
            else:
                assignmentArtifactTypeID = artifactTypeNameIDMap['assignment']
                studyTrackArtifactTypeID = artifactTypeNameIDMap['study-track']
                domainArtifactTypeID = artifactTypeNameIDMap['domain']
                asmtPracticeArtifactTypeID = artifactTypeNameIDMap['asmtpractice']

            totalNumberOfStudyTracks = _generateStudyTracksCountQuery(session, creatorIDs, studyTrackIDs, startCreationTime, endCreationTime, studyTrackArtifactTypeID).one()[0]
        except exc.NoResultFound, nre:
            raise Exception(u"Total number of study-track rows could not be determined. NoResultFoundException occured - "+str(nre))
        except exc.MultipleResultsFound, mre:
            raise Exception(u"Total number of study-track rows could not be determined. MultipleResultsFound occured - "+str(mre))
    except SQLAlchemyError, sqlae:
        session.rollback()
        raise Exception(u"Total number of study-track rows could not be determined. SQLAlchemyError occured - "+str(sqlae))
    except Exception, e:
        session.rollback()
        raise e
    finally:
        session.close()

    print "TOTAL NUMBER OF STUDY-TRACKS FOUND : "+str(totalNumberOfStudyTracks)
    print 
    log.info("TOTAL NUMBER OF STUDY-TRACKS FOUND : "+str(totalNumberOfStudyTracks))
    log.info("")

    offset = 0
    while offset < totalNumberOfStudyTracks:
        print
        print "STARTED PROCESSING STUDY-TRACK WITH START = "+str(offset)+", END = "+str(offset+1)
        log.info("")
        log.info("STARTED PROCESSING STUDY-TRACK WITH START = "+str(offset)+", END = "+str(offset+1))
        chunkStartTime = time.time()
        try:
            session.begin()
            currentStudyTrackID, currentStudyTrackCreationTime = _generateStudyTracksQuery(session, creatorIDs, studyTrackIDs, startCreationTime, endCreationTime, studyTrackArtifactTypeID, offset, 1).one()
            print "STUDY-TRACK DETAILS - studyTrackID: "+str(currentStudyTrackID)+", studyTrackCreationTime: "+str(currentStudyTrackCreationTime)

            #Get all the children where child is of type domain for the current study-track. 
            currentStudyTrackDomainChildrenInfos = session.query(meta.ArtifactAndChildren.c.id, meta.ArtifactAndChildren.c.childID, meta.Artifacts.c.encodedID).filter(meta.ArtifactAndChildren.c.id == currentStudyTrackID, meta.ArtifactAndChildren.c.childID == meta.Artifacts.c.id, meta.Artifacts.c.artifactTypeID == domainArtifactTypeID).all()

            #Computing Children & Related Infos                
            currentStudyTrackChildrenEncodedIDs = list(set([currentStudyTrackDomainChildrenInfo[2] for currentStudyTrackDomainChildrenInfo in currentStudyTrackDomainChildrenInfos if currentStudyTrackDomainChildrenInfo[2]]))
            currentStudyTrackChildrenEncodedIDs = [helpers.getCanonicalEncodedID(currentStudyTrackChildrenEncodedID) for currentStudyTrackChildrenEncodedID in currentStudyTrackChildrenEncodedIDs]

            #Redirections Infos
            encodedIDRedirectedEncodedIDMap = {}
            if currentStudyTrackChildrenEncodedIDs:
                encodedIDRedirectedEncodedIDInfos = session.query(meta.MigratedConcepts.c.originalEID, meta.MigratedConcepts.c.newEID, meta.Artifacts.c.id).filter(meta.MigratedConcepts.c.originalEID.in_(currentStudyTrackChildrenEncodedIDs), meta.MigratedConcepts.c.newEID == meta.Artifacts.c.encodedID, meta.Artifacts.c.artifactTypeID == domainArtifactTypeID).all()
                for encodedIDRedirectedEncodedIDInfo in encodedIDRedirectedEncodedIDInfos:
                    originalEncodedID = encodedIDRedirectedEncodedIDInfo[0]
                    newEncodedID = encodedIDRedirectedEncodedIDInfo[1]
                    newArtifactID = encodedIDRedirectedEncodedIDInfo[2]
                    if originalEncodedID not in encodedIDRedirectedEncodedIDMap:
                        encodedIDRedirectedEncodedIDMap[originalEncodedID] = (newEncodedID, newArtifactID)
                        if newEncodedID not in currentStudyTrackChildrenEncodedIDs:
                            currentStudyTrackChildrenEncodedIDs.append(newEncodedID)
                    else:
                        raise Exception("Duplicate redirections are found for the encodedID: "+encodedIDRedirectedEncodedIDInfo[0])

            #CollectionsContext Infos
            encodedIDCollectionContextsMap = {}
            encodedIDCollectionContextInfos = collectionNode.getByEncodedIDs(eIDs= currentStudyTrackChildrenEncodedIDs)
            for encodedIDCollectionContextInfo in encodedIDCollectionContextInfos:
                encodedID = encodedIDCollectionContextInfo.get('encodedID')
                conceptCollectionHandle = encodedIDCollectionContextInfo.get('handle')
                collectionCreatorID = None
                if encodedIDCollectionContextInfo.get('collection') and encodedIDCollectionContextInfo['collection'].get('handle') and encodedIDCollectionContextInfo['collection'].get('creatorID'):
                    collectionCreatorID = encodedIDCollectionContextInfo['collection']['creatorID']
                    collectionHandle = encodedIDCollectionContextInfo['collection']['handle']
                if encodedID and collectionHandle and conceptCollectionHandle and collectionCreatorID:
                    if encodedID not in encodedIDCollectionContextsMap:
                        encodedIDCollectionContextsMap[encodedID] = []
                    if (collectionHandle, conceptCollectionHandle, collectionCreatorID) not in encodedIDCollectionContextsMap[encodedID]:
                        encodedIDCollectionContextsMap[encodedID].append((collectionHandle, conceptCollectionHandle, collectionCreatorID))

            #ConceptInfos 
            publishedEncodedIDs = set([])
            encodedIDConceptInfos = conceptNode.getByEncodedIDs(eIDs = currentStudyTrackChildrenEncodedIDs)
            for encodedIDConceptInfo in encodedIDConceptInfos:
                encodedID = encodedIDConceptInfo.get('encodedID')
                status = encodedIDConceptInfo.get('status')
                if encodedID and status == 'published':
                    publishedEncodedIDs.add(encodedID)

            #Computing StudyTrack level Infos
            currentStudyTrackAssignmentIDs = []
            currentStudyTrackAssignmentGroupIDToMemberIDsMap = {}
            isCurrentStudyTrackUsedByAnLMSAssignment = False
            if performAssignmentsMigration:
                #Consider assignments only of type 'assignment' - 'self-study' / 'self-assignment' are not supported
                currentStudyTrackAssignmentInfos = session.query(meta.ArtifactAndChildren.c.childID, meta.ArtifactAndChildren.c.id, meta.Artifacts.c.artifactTypeID, meta.Assignments.c.groupID, meta.Assignments.c.origin).filter(meta.ArtifactAndChildren.c.childID == currentStudyTrackID, meta.ArtifactAndChildren.c.id == meta.Artifacts.c.id,  meta.Artifacts.c.artifactTypeID == assignmentArtifactTypeID, meta.Artifacts.c.id == meta.Assignments.c.assignmentID, meta.Assignments.c.assignmentType == 'assignment').all()
                
                #AssignmentIDs
                currentStudyTrackAssignmentIDs = [currentStudyTrackAssignmentInfo[1] for currentStudyTrackAssignmentInfo in currentStudyTrackAssignmentInfos]

                #AssignmentGroupIDs & MemberIDs
                currentStudyTrackAssignmentGroupIDs = [currentStudyTrackAssignmentInfo[3] for currentStudyTrackAssignmentInfo in currentStudyTrackAssignmentInfos]
                if currentStudyTrackAssignmentGroupIDs:
                    currentStudyTrackAssignmentGroupMemberInfos = session.query(meta.GroupHasMembers.c.groupID, meta.GroupHasMembers.c.memberID).filter(meta.GroupHasMembers.c.groupID.in_(currentStudyTrackAssignmentGroupIDs)).all()
                    for currentStudyTrackAssignmentGroupMemberInfo in currentStudyTrackAssignmentGroupMemberInfos:
                        currentStudyTrackAssignmentGroupID = currentStudyTrackAssignmentGroupMemberInfo[0]
                        currentStudyTrackAssignmentGroupMemberID = currentStudyTrackAssignmentGroupMemberInfo[1]
                        if currentStudyTrackAssignmentGroupID not in currentStudyTrackAssignmentGroupIDToMemberIDsMap:
                            currentStudyTrackAssignmentGroupIDToMemberIDsMap[currentStudyTrackAssignmentGroupID] = []
                        if currentStudyTrackAssignmentGroupMemberID not in currentStudyTrackAssignmentGroupIDToMemberIDsMap[currentStudyTrackAssignmentGroupID]:
                            currentStudyTrackAssignmentGroupIDToMemberIDsMap[currentStudyTrackAssignmentGroupID].append(currentStudyTrackAssignmentGroupMemberID)

                #AssignmentOrigins
                currentStudyTrackAssignmentOrigins = [currentStudyTrackAssignmentInfo[4] for currentStudyTrackAssignmentInfo in currentStudyTrackAssignmentInfos]
                isCurrentStudyTrackUsedByAnLMSAssignment = 'lms' in currentStudyTrackAssignmentOrigins

            #Existing artifactRevisionRelations for the currentStudyTrackID
            currentStudyTrackArtifactRevisionRelationInfos = session.query(meta.ArtifactRevisionRelations.c.artifactRevisionID, meta.ArtifactRevisionRelations.c.hasArtifactRevisionID, meta.ArtifactRevisions.c.artifactID).filter(meta.ArtifactRevisionRelations.c.artifactRevisionID == meta.ArtifactRevisions.c.id, meta.ArtifactRevisions.c.artifactID==currentStudyTrackID).all()
            currentStudyTrackArtifactRevisionRelations = [(currentStudyTrackArtifactRevisionRelationInfo[0], currentStudyTrackArtifactRevisionRelationInfo[1]) for currentStudyTrackArtifactRevisionRelationInfo in currentStudyTrackArtifactRevisionRelationInfos] 

            #Contexts Infos for the children currently present in the database.
            childrenWithCollectionContexts = []
            childrenWithCollectionLessContexts = []
            currentStudyTrackContexts = []
            studyTrackItemContextInfos= session.query(meta.StudyTrackItemContexts.c.studyTrackID, meta.StudyTrackItemContexts.c.studyTrackItemID, meta.StudyTrackItemContexts.c.conceptCollectionHandle, meta.StudyTrackItemContexts.c.collectionCreatorID).filter(meta.StudyTrackItemContexts.c.studyTrackID == currentStudyTrackID).all()
            for studyTrackItemContextInfo in studyTrackItemContextInfos:
                studyTrackID = studyTrackItemContextInfo[0]
                studyTrackItemID = studyTrackItemContextInfo[1]
                conceptCollectionHandle = studyTrackItemContextInfo[2]
                collectionCreatorID = studyTrackItemContextInfo[3]

                #Add it to the list of existingContexts in the database.
                currentStudyTrackContexts.append((studyTrackID, studyTrackItemID, conceptCollectionHandle, collectionCreatorID))

                #Assumed that conceptCollectionHandle and collectionCreatorID either exists or doesn't exist togeather
                if conceptCollectionHandle and collectionCreatorID:
                    if studyTrackItemID not in childrenWithCollectionContexts:
                        childrenWithCollectionContexts.append(studyTrackItemID)

                if not conceptCollectionHandle and not collectionCreatorID:
                    if studyTrackItemID not in childrenWithCollectionLessContexts:
                        childrenWithCollectionLessContexts.append(studyTrackItemID)

            artifactRevisionRelationsToDelete = []
            artifactRevisionRelationsToInsert = []
            memberStudyTrackItemStatusesToUpdate = []
            studyTrackItemContextsToUpdate = []
            studyTrackItemContextsToInsert = []
            studyTrackItemsSequenceCount = 0
            artifactRevisionRelationsAlreadyProcessedForInsert = currentStudyTrackArtifactRevisionRelations
            studyTrackItemContextsAlreadyProcessedForInsert = currentStudyTrackContexts
            currentStudyTrackAssignmentGroupEncodedIDsProcessedForReReport = []
            for currentStudyTrackDomainChildrenInfo in currentStudyTrackDomainChildrenInfos:
                currentStudyTrackChildID = currentStudyTrackDomainChildrenInfo[1]
                currentStudyTrackChildEncodedID = helpers.getCanonicalEncodedID(currentStudyTrackDomainChildrenInfo[2]) if currentStudyTrackDomainChildrenInfo[2] else None
                if currentStudyTrackChildID not in childrenWithCollectionContexts:
                    #CollectionContext is absent for this child (which is of type domain). Needs fixing.

                    #If the EID is not valid in the new structure or the if the studyTrack's creation date is before collections release
                    didRedirectionOccur = False
                    canDetermineUniqueCollectionContextUsingOldBranchCollectionMap = False
                    currentStudyTrackNewChildEncodedID = None
                    currentStudyTrackNewChildID = None
                    if currentStudyTrackChildEncodedID not in publishedEncodedIDs or str(currentStudyTrackCreationTime) < COLLECTIONS_RELEASE_DATE or isCurrentStudyTrackUsedByAnLMSAssignment:
                        #Replace the encodedID if it has any redirections
                        if currentStudyTrackChildEncodedID in encodedIDRedirectedEncodedIDMap:
                            currentStudyTrackNewChildEncodedID = helpers.getCanonicalEncodedID(encodedIDRedirectedEncodedIDMap[currentStudyTrackChildEncodedID][0]) if encodedIDRedirectedEncodedIDMap[currentStudyTrackChildEncodedID][0] else None
                            currentStudyTrackNewChildID = encodedIDRedirectedEncodedIDMap[currentStudyTrackChildEncodedID][1]
                            didRedirectionOccur = True

                        #Though there is no redirection, the encodedID is still in the oldContext, hence the newCollectionContext can be determined using the branchCollectionMap
                        canDetermineUniqueCollectionContextUsingOldBranchCollectionMap = True


                    if not didRedirectionOccur: 
                        currentStudyTrackNewChildEncodedID = currentStudyTrackChildEncodedID
                        currentStudyTrackNewChildID = currentStudyTrackChildID                            

                    if currentStudyTrackNewChildEncodedID not in publishedEncodedIDs and currentStudyTrackNewChildEncodedID != currentStudyTrackChildEncodedID:
                        raise Exception("Invalid (not a valid published EID in the new taxonomy structure) endodedID: "+str(currentStudyTrackChildEncodedID)+", redirectedEncodedID: ["+str(currentStudyTrackNewChildEncodedID)+"] encountered.")

                    if didRedirectionOccur:
                        #Since we are replacing the encodedID, we need to replace the StudyTrack children as well as entires in MemberStudyTrackItemStatus tables
                        currentStudyTrackRevisionIDs = []
                        currentStudyTrackLatestRevisionID = -1
                        currentStudyTrackChildRevisionIDs = []
                        currentStudyTrackNewChildLatestRevisionID = -1
                        artifactRevisionInfos = session.query(meta.ArtifactRevisions.c.artifactID, meta.ArtifactRevisions.c.id).filter(meta.ArtifactRevisions.c.artifactID.in_((currentStudyTrackID, currentStudyTrackChildID, currentStudyTrackNewChildID))).all()
                        for artifactRevisionInfo in artifactRevisionInfos:
                            artifactID = artifactRevisionInfo[0]
                            artifactRevisionID = artifactRevisionInfo[1]
                            if artifactID == currentStudyTrackID:
                                currentStudyTrackRevisionIDs.append(artifactRevisionID)
                                if artifactRevisionID > currentStudyTrackLatestRevisionID:
                                    currentStudyTrackLatestRevisionID = artifactRevisionID
                            elif artifactID == currentStudyTrackChildID:
                                currentStudyTrackChildRevisionIDs.append(artifactRevisionID)
                            elif artifactID == currentStudyTrackNewChildID:
                                if artifactRevisionID > currentStudyTrackNewChildLatestRevisionID:
                                    currentStudyTrackNewChildLatestRevisionID = artifactRevisionID

                        #Replacing the StudyTrack Children. 
                        # - Delete all the revisionIDs of the old child
                        for currentStudyTrackRevisionID in currentStudyTrackRevisionIDs:
                            for currentStudyTrackChildRevisionID in currentStudyTrackChildRevisionIDs:
                                artifactRevisionRelationsToDelete.append((currentStudyTrackRevisionID, currentStudyTrackChildRevisionID))

                        #Insert a relation with new child
                        if (currentStudyTrackLatestRevisionID, currentStudyTrackNewChildLatestRevisionID) not in artifactRevisionRelationsAlreadyProcessedForInsert:
                            studyTrackItemsSequenceCount = studyTrackItemsSequenceCount+1
                            artifactRevisionRelationsToInsert.append({'artifactRevisionID': currentStudyTrackLatestRevisionID, 'hasArtifactRevisionID': currentStudyTrackNewChildLatestRevisionID, 'sequence': studyTrackItemsSequenceCount})
                            artifactRevisionRelationsAlreadyProcessedForInsert.append((currentStudyTrackLatestRevisionID, currentStudyTrackNewChildLatestRevisionID))

                        #Replacing the Member StudyTrack Item Statuses. (all assignments this studyTrack is part of)
                        #We just ignore the case when multiple EIDs which are merging in to the same EID were attempted by the member already
                        #We just update what ever goes through the SQL query - the rest will be staying with the oldEID in the database, but will be migrated in the API response.
                        for currentStudyTrackAssignmentID in currentStudyTrackAssignmentIDs:
                            memberStudyTrackItemStatusesToUpdate.append(meta.MemberStudyTrackItemStatus.update().prefix_with("IGNORE").where(sqlalchemy.and_(meta.MemberStudyTrackItemStatus.c.assignmentID==currentStudyTrackAssignmentID, meta.MemberStudyTrackItemStatus.c.studyTrackItemID==currentStudyTrackChildID)).values({meta.MemberStudyTrackItemStatus.c.studyTrackItemID:currentStudyTrackNewChildID}))

                    #Now get the collectionContext - if possible to uniquely determine it
                    uniqueCollectionContext = None
                    if currentStudyTrackNewChildEncodedID in encodedIDCollectionContextsMap:
                        collectionContexts = encodedIDCollectionContextsMap[currentStudyTrackNewChildEncodedID]
                        if len(collectionContexts) == 1:
                            uniqueCollectionContext = collectionContexts[0]
                        elif canDetermineUniqueCollectionContextUsingOldBranchCollectionMap:
                            #Deals with the oldChildEncodedID
                            currentStudyTrackChildEncodedIDParts = currentStudyTrackChildEncodedID.split('.')
                            if currentStudyTrackChildEncodedIDParts and len(currentStudyTrackChildEncodedIDParts) > 2:
                                currentStudyTrackChildBranch =  currentStudyTrackChildEncodedIDParts[1]
                                if currentStudyTrackChildBranch in oldBranchToNewCollectionMap:
                                    currentStudyTrackChildBranchMappedCollection = oldBranchToNewCollectionMap[currentStudyTrackChildBranch]
                                    for collectionContext in collectionContexts:
                                        if currentStudyTrackChildBranchMappedCollection == collectionContext[0]:
                                            uniqueCollectionContext = collectionContext
                        elif len(collectionContexts) > 0:
                            ## Pick a random one
                            uniqueCollectionContext = collectionContexts[0]

                    #if not uniqueCollectionContext:
                    #    raise Exception("unique CollectionContext determination for the endodedID: "+str(currentStudyTrackChildEncodedID)+ " [redirectedEncodedID: "+str(currentStudyTrackNewChildEncodedID)+"] could not be performed.")

                    if uniqueCollectionContext:
                        collectionHandle = uniqueCollectionContext[0]
                        conceptCollectionHandle = uniqueCollectionContext[1]
                        collectionCreatorID = uniqueCollectionContext[2]

                        if (currentStudyTrackID, currentStudyTrackNewChildID, conceptCollectionHandle, collectionCreatorID) not in studyTrackItemContextsAlreadyProcessedForInsert:
                            #Check if there is a collectionLess Context (In case of redirection, this check happens with the actual oldChildID)
                            if currentStudyTrackChildID in childrenWithCollectionLessContexts:
                                #Update the existing rows with collectionContext
                                #print "Collection Context is being updated. DETAILS - studyTrackID: "+str(currentStudyTrackID)+", studyTrackChildID(studyTrackItemID): "+str(currentStudyTrackChildID)+", studyTrackNewChildID:"+str(currentStudyTrackNewChildID)+", conceptCollectionHandle:"+str(conceptCollectionHandle)+", collectionCreatorID: "+str(collectionCreatorID)
                                log.info("Collection Context is being updated. DETAILS - studyTrackID: "+str(currentStudyTrackID)+", studyTrackChildID(studyTrackItemID): "+str(currentStudyTrackChildID)+", studyTrackNewChildID:"+str(currentStudyTrackNewChildID)+", conceptCollectionHandle:"+str(conceptCollectionHandle)+", collectionCreatorID: "+str(collectionCreatorID))
                                studyTrackItemContextsToUpdate.append(meta.StudyTrackItemContexts.update().where(sqlalchemy.and_(meta.StudyTrackItemContexts.c.studyTrackID==currentStudyTrackID, meta.StudyTrackItemContexts.c.studyTrackItemID==currentStudyTrackChildID)).values({meta.StudyTrackItemContexts.c.studyTrackItemID:currentStudyTrackNewChildID, meta.StudyTrackItemContexts.c.conceptCollectionHandle:conceptCollectionHandle, meta.StudyTrackItemContexts.c.collectionCreatorID:collectionCreatorID}))
                            else:
                                #Insert a new collectionContext
                                #print "Collection Context is being inserted. DETAILS - studyTrackID: "+str(currentStudyTrackID)+", studyTrackChildID(studyTrackItemID): "+str(currentStudyTrackChildID)+", studyTrackNewChildID:"+str(currentStudyTrackNewChildID)+", conceptCollectionHandle:"+str(conceptCollectionHandle)+", collectionCreatorID: "+str(collectionCreatorID)
                                log.info("Collection Context is being inserted. DETAILS - studyTrackID: "+str(currentStudyTrackID)+", studyTrackChildID(studyTrackItemID): "+str(currentStudyTrackChildID)+", studyTrackNewChildID:"+str(currentStudyTrackNewChildID)+", conceptCollectionHandle:"+str(conceptCollectionHandle)+", collectionCreatorID: "+str(collectionCreatorID))
                                studyTrackItemContextsToInsert.append({'studyTrackID':currentStudyTrackID, 'studyTrackItemID': currentStudyTrackNewChildID, 'conceptCollectionHandle': conceptCollectionHandle, 'collectionCreatorID':collectionCreatorID})                                        
                            studyTrackItemContextsAlreadyProcessedForInsert.append((currentStudyTrackID, currentStudyTrackNewChildID, conceptCollectionHandle, collectionCreatorID))

                            for currentStudyTrackAssignmentGroupID, currentStudyTrackAssignmentGroupMemberIDs in currentStudyTrackAssignmentGroupIDToMemberIDsMap.items():
                                if (currentStudyTrackAssignmentGroupID, currentStudyTrackNewChildEncodedID) not in currentStudyTrackAssignmentGroupEncodedIDsProcessedForReReport and currentStudyTrackAssignmentGroupMemberIDs:
                                    scoreReReportingPythonScriptFile.write("print 'Reporting for groupID [%d], encodedIDs: [%s], studentIDs: [%s].'\n" % (currentStudyTrackAssignmentGroupID, currentStudyTrackNewChildEncodedID, currentStudyTrackAssignmentGroupMemberIDs))
                                    scoreReReportingPythonScriptFile.write("task = ScoreReReporter().apply(kwargs={'groupID': %d, 'encodedIDs': ['%s'], 'studentIDs': %s})\n" % (currentStudyTrackAssignmentGroupID, currentStudyTrackNewChildEncodedID, currentStudyTrackAssignmentGroupMemberIDs))                        
                                    scoreReReportingPythonScriptFile.write("print 'Result: '+str(task.wait())\n")
                                    currentStudyTrackAssignmentGroupEncodedIDsProcessedForReReport.append((currentStudyTrackAssignmentGroupID, currentStudyTrackNewChildEncodedID))

            #We'll process the complete study-track togeather or not - performanceFactor
            #Update the artifactRevisionRelations, memberstudyTrackItemStatuses...etc
            if artifactRevisionRelationsToDelete:
                artifactRevisionRelationsFilters = [sqlalchemy.and_(meta.ArtifactRevisionRelations.c.artifactRevisionID==artifactRevisionRelationToDelete[0], meta.ArtifactRevisionRelations.c.hasArtifactRevisionID==artifactRevisionRelationToDelete[1]) for artifactRevisionRelationToDelete in artifactRevisionRelationsToDelete]
                session.execute(meta.ArtifactRevisionRelations.delete().where(sqlalchemy.or_(*artifactRevisionRelationsFilters)))
            
            if artifactRevisionRelationsToInsert:
                session.execute(meta.ArtifactRevisionRelations.insert(), artifactRevisionRelationsToInsert)

            if memberStudyTrackItemStatusesToUpdate:
                for memberStudyTrackItemStatusToUpdate in memberStudyTrackItemStatusesToUpdate:
                    session.execute(memberStudyTrackItemStatusToUpdate)

            #Actual Context related updates
            if not studyTrackItemContextsToUpdate and not studyTrackItemContextsToInsert:
                print "COLLECTION CONTEXTS ARE ALREADY PRESENT FOR ALL THE CHILDREN IN THE CURRENT STUDY-TRACK."
                log.info("COLLECTION CONTEXTS ARE ALREADY PRESENT FOR ALL THE CHILDREN IN THE CURRENT STUDY-TRACK.")
            else:
                if studyTrackItemContextsToUpdate:
                    for studyTrackItemContextToUpdate in studyTrackItemContextsToUpdate:
                        session.execute(studyTrackItemContextToUpdate)

                if studyTrackItemContextsToInsert:
                    session.execute(meta.StudyTrackItemContexts.insert(), studyTrackItemContextsToInsert)
                
                print "COLLECTION CONTEXTS ARE MISSING FOR FEW OF THE CHILDREN IN THE CURRENT STUDY-TRACK.CONTEXTS ARE SUCCESSFULLY DETERMINED AND ATTACHED FOR ALL OF THEM."
                log.info("COLLECTION CONTEXTS ARE MISSING FOR FEW OF THE CHILDREN IN THE CURRENT STUDY-TRACK.CONTEXTS ARE SUCCESSFULLY DETERMINED AND ATTACHED FOR ALL OF THEM.")

            if commitFixesToDataBase:
                session.commit()
            else:
                session.rollback()
            print "STUDY-TRACK PROCESSING SUCCESSFULLY COMPLETED."
            log.info("STUDY-TRACK PROCESSING SUCCESSFULLY COMPLETED.")
        except SQLAlchemyError, sqlae:
            session.rollback()
            print "CURRENT STUDY-TRACK PROCESSING FAILED. REASON : SQLAlchemyError - "+str(type(sqlae))+" - "+str(sqlae)
            log.info("CURRENT STUDY-TRACK PROCESSING FAILED. REASON : SQLAlchemyError - "+str(type(sqlae))+" - "+str(sqlae))
            log.exception(sqlae)
        except (KeyboardInterrupt, SystemExit) as e:
            session.rollback()
            print "CURRENT STUDY-TRACK PROCESSING FAILED. REASON : KeyboardInterrupt - "+str(type(e))+" - "+str(e)
            log.info("CURRENT STUDY-TRACK PROCESSING FAILED. REASON : KeyboardInterrupt - "+str(type(e))+" - "+str(e))
            log.exception(e)
            sys.exit(-1)
        except Exception, e:
            session.rollback()
            print "CURRENT STUDY-TRACK PROCESSING FAILED. REASON : Exception - "+str(type(e))+" - "+str(e)
            log.info("CURRENT STUDY-TRACK PROCESSING FAILED. REASON : Exception - "+str(type(e))+" - "+str(e))
            log.exception(e)
        finally:
            session.close()

        print "TIME TAKEN FOR CURRENT STUDY-TRACK : %s seconds" %((time.time()-chunkStartTime))
        print "ENDED PROCESSING STUDY-TRACK AT START = "+str(offset)+", END = "+str(offset+1)
        print
        log.info("TIME TAKEN FOR CURRENT STUDY-TRACK : %s seconds" %((time.time()-chunkStartTime)))
        log.info("ENDED PROCESSING STUDY-TRACK AT START = "+str(offset)+", END = "+str(offset+1))
        log.info("")
        offset = offset+1

    print "TOTAL TIME TAKEN FOR PROCESSING THE FOUND STUDY-TRACK ARTIFACTS : %s minutes" %((time.time()-processStartTime)/60)
    log.info("TOTAL TIME TAKEN FOR PROCESSING THE FOUND STUDY-TRACK ARTIFACTS : %s minutes" %((time.time()-processStartTime)/60))
    handler.close()
    log.removeHandler(handler)


def _generateStudyTracksQuery(session, creatorIDs=None, studyTrackIDs=[], startCreationTime=None, endCreationTime=None, studyTrackArtifactTypeID=55, offset=0, limit=0):
    studyTracksQuery = session.query(meta.Artifacts.c.id, meta.Artifacts.c.creationTime).filter(meta.Artifacts.c.artifactTypeID==studyTrackArtifactTypeID)
    studyTracksQuery = _updateStudyTracksRelatedQueryWithRunParameters(studyTracksQuery, creatorIDs, studyTrackIDs, startCreationTime, endCreationTime)
    if offset:
        studyTracksQuery = studyTracksQuery.offset(offset)
    if limit:
        studyTracksQuery = studyTracksQuery.limit(limit)
    return studyTracksQuery

def _generateStudyTracksCountQuery(session, creatorIDs=None, studyTrackIDs=[], startCreationTime=None, endCreationTime=None, studyTrackArtifactTypeID=55):
    studyTracksCountQuery = session.query(func.count(meta.Artifacts.c.id)).filter(meta.Artifacts.c.artifactTypeID==studyTrackArtifactTypeID)
    studyTracksCountQuery = _updateStudyTracksRelatedQueryWithRunParameters(studyTracksCountQuery, creatorIDs, studyTrackIDs, startCreationTime, endCreationTime)
    return studyTracksCountQuery

def _updateStudyTracksRelatedQueryWithRunParameters(studyTracksRelatedQuery, creatorIDs=None, studyTrackIDs=[], startCreationTime=None, endCreationTime=None):
    if creatorIDs:
        studyTracksRelatedQuery = studyTracksRelatedQuery.filter(meta.Artifacts.c.creatorID.in_(creatorIDs))
    if studyTrackIDs:
        studyTracksRelatedQuery = studyTracksRelatedQuery.filter(meta.Artifacts.c.id.in_(studyTrackIDs))
    if startCreationTime:
        studyTracksRelatedQuery = studyTracksRelatedQuery.filter(meta.Artifacts.c.creationTime >= startCreationTime)
    if endCreationTime:
        studyTracksRelatedQuery = studyTracksRelatedQuery.filter(meta.Artifacts.c.creationTime <= endCreationTime)

    return studyTracksRelatedQuery
