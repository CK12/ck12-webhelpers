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


#This script retrives the assignments (having domainTypes as grandChildren) which doesn't have a collection context between the startDate & endDate
#And then tries to attach a collectionContext to them by determining the EID redirection...etc.
#If there was a redirection determined / resolved, Script would also update the domains of the studyTracks & entries in MemberStudyTrackItemStatus
#Would required collectionNodes & conceptNodes on FLX mongo, MigratedConcepts on FLX mysql to be up-to-date & sync
#This script is not idempotent, running the same script multiple times with the commitFixesToDataBase turned on would do unintened migrations since this script doesn't update the studyTrack's creationTime / updateTime

#####################
#Log Analysis - CMDs#
#####################
#grep -c "STARTED PROCESSING" /opt/2.0/log/add_collection_contexts_to_assignment_domains.log
#grep -c "FAILED" /opt/2.0/log/add_collection_contexts_to_assignment_domains.log
#grep  "FAILED" /opt/2.0/log/add_collection_contexts_to_assignment_domains.log | grep -c "unique CollectionContext determination for the endodedID:"
#grep  "FAILED" /opt/2.0/log/add_collection_contexts_to_assignment_domains.log | grep -c "Invalid (not a valid published EID in the new taxonomy structure) endodedID"
#grep -c "COMPLETED" /opt/2.0/log/add_collection_contexts_to_assignment_domains.log
#grep -c "SCRIPT CURRENTLY DOESN'T SUPPORT THEM" /opt/2.0/log/add_collection_contexts_to_assignment_domains.log
#grep -c "ALREADY PRESENT FOR ALL" /opt/2.0/log/add_collection_contexts_to_assignment_domains.log
#grep -c "SUCCESSFULLY DETERMINED AND ATTACHED FOR ALL OF THEM" /opt/2.0/log/add_collection_contexts_to_assignment_domains.log

#Usage: $paster shell
#>>>from paster_scripts import add_collection_contexts_to_assignment_domains
#>>>add_collection_contexts_to_assignment_domains.run(startCreationTime='2017-07-16 00:00:00', assignmentOrigin='ck-12')
def run(assignmentCreatorIDs=None, assignedGroupIDs=None, startCreationTime=None, endCreationTime=None, assignmentType=None, assignmentOrigin=None, environment='GAMMA', commitFixesToDataBase=False):
    if environment == 'PROD':
        COLLECTIONS_RELEASE_DATE = PROD_COLLECTIONS_RELEASE_DATE
    elif environment == 'GAMMA':
        COLLECTIONS_RELEASE_DATE = GAMMA_COLLECTIONS_RELEASE_DATE
    else:
        raise Exception(u"Invalid 'environment' received. It should be one of [PROD, GAMMA].")

    if assignmentCreatorIDs is None:
        assignmentCreatorIDs = []
    if assignedGroupIDs is None:
        assignedGroupIDs = []
    if not isinstance(assignmentCreatorIDs, list) or not all([isinstance(assignmentCreatorID, int) for assignmentCreatorID in assignmentCreatorIDs]):
         raise Exception(u"Invalid 'assignmentCreatorIDs' received. It should be a valid list of integers.")
    if not isinstance(assignedGroupIDs, list) or not all([isinstance(assignedGroupID, int) for assignedGroupID in assignedGroupIDs]):
         raise Exception(u"Invalid 'assignedGroupID' received. It should be a valid list of integers.")

    scoreReReportingPythonScriptFile = open("/tmp/add_collection_contexts_to_assignment_domains_score_re_reporter.py", "w", 1)
    scoreReReportingPythonScriptFile.write("from assessment.views.celerytasks.scorereporter import ScoreReReporter\n")


    #Set up the logger
    LOG_FILENAME = "/opt/2.0/log/add_collection_contexts_to_assignment_domains.log"
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
    totalNumberOfAssignments = 0
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

            totalNumberOfAssignments = _generateAssignmentsCountQuery(session, assignmentCreatorIDs, assignedGroupIDs, startCreationTime, endCreationTime, assignmentType, assignmentOrigin, assignmentArtifactTypeID).one()[0]
        except exc.NoResultFound, nre:
            raise Exception(u"Total number of assignment rows could not be determined. NoResultFoundException occured - "+str(nre))
        except exc.MultipleResultsFound, mre:
            raise Exception(u"Total number of assignment rows could not be determined. MultipleResultsFound occured - "+str(mre))
    except SQLAlchemyError, sqlae:
        session.rollback()
        raise Exception(u"Total number of assignment rows could not be determined. SQLAlchemyError occured - "+str(sqlae))
    except Exception, e:
        session.rollback()
        raise e
    finally:
        session.close()

    print "TOTAL NUMBER OF ASSIGNMENTS FOUND : "+str(totalNumberOfAssignments)
    print 
    log.info("TOTAL NUMBER OF ASSIGNMENTS FOUND : "+str(totalNumberOfAssignments))
    log.info("")

    #Having the whole logic of checking if the assignment has domainArtifacts as grandChildren 
    #and weather these grandChildren have CollectionContext in the DataBase query makes the query very heavy and code ugly with minimum redability
    #Hence adding those checks in the applicationLayer below.
    offset = 0
    while offset < totalNumberOfAssignments:
        print
        print "STARTED PROCESSING ASSIGNMENT WITH START = "+str(offset)+", END = "+str(offset+1)
        log.info("")
        log.info("STARTED PROCESSING ASSIGNMENT WITH START = "+str(offset)+", END = "+str(offset+1))
        chunkStartTime = time.time()
        try:
            session.begin()
            currentAssignmentID, currentAssignmentType, currentAssignmentGroupID, currentAssignmentOrigin = _generateAssignmentsQuery(session, assignmentCreatorIDs, assignedGroupIDs, startCreationTime, endCreationTime, assignmentType, assignmentOrigin, assignmentArtifactTypeID, offset, 1).one()
            print "ASSIGNMENT DETAILS - assignmentID: "+str(currentAssignmentID)+", assignmentType: "+str(currentAssignmentType)+", assignmentGroupID: "+str(currentAssignmentGroupID)+", assignmentOrigin: "+str(currentAssignmentOrigin)
            log.info("ASSIGNMENT DETAILS - assignmentID: "+str(currentAssignmentID)+", assignmentType: "+str(currentAssignmentType)+", assignmentGroupID: "+str(currentAssignmentGroupID)+", assignmentOrigin: "+str(currentAssignmentOrigin))

            if currentAssignmentType == 'assignment':
                #Group Members
                currentAssignmentGroupMemberInfos = session.query(meta.GroupHasMembers.c.memberID).filter(meta.GroupHasMembers.c.groupID == currentAssignmentGroupID).all()
                currentAssignmentGroupMemberIDs = []
                for currentAssignmentGroupMemberInfo in currentAssignmentGroupMemberInfos:
                    if currentAssignmentGroupMemberInfo[0] not in currentAssignmentGroupMemberIDs:
                        currentAssignmentGroupMemberIDs.append(currentAssignmentGroupMemberInfo[0])

                #Get all the child-grandChild paths where the grandChild is of type domain in the current assignment 
                ArtifactsAlias = aliased(meta.Artifacts)
                ArtifactAndChildrenAlias  = aliased(meta.ArtifactAndChildren)
                currentAssignmentChildrenAndDomainGrandChildrenInfos = session.query(meta.ArtifactAndChildren.c.id, meta.ArtifactAndChildren.c.childID, meta.Artifacts.c.creationTime, ArtifactAndChildrenAlias.c.childID, ArtifactsAlias.c.encodedID).filter(meta.ArtifactAndChildren.c.id == currentAssignmentID, meta.ArtifactAndChildren.c.childID == ArtifactAndChildrenAlias.c.id, ArtifactAndChildrenAlias.c.id == meta.Artifacts.c.id, ArtifactAndChildrenAlias.c.childID == ArtifactsAlias.c.id, ArtifactsAlias.c.artifactTypeID == domainArtifactTypeID).all()

                #Computing GrandChildren & Related Infos                
                currentAssignmentGrandChildrenEncodedIDs = list(set([currentAssignmentChildrenAndDomainGrandChildrenInfo[4] for currentAssignmentChildrenAndDomainGrandChildrenInfo in currentAssignmentChildrenAndDomainGrandChildrenInfos if currentAssignmentChildrenAndDomainGrandChildrenInfo[4]]))
                currentAssignmentGrandChildrenEncodedIDs = [helpers.getCanonicalEncodedID(currentAssignmentGrandChildrenEncodedID) for currentAssignmentGrandChildrenEncodedID in currentAssignmentGrandChildrenEncodedIDs]

                #Redirections Infos
                encodedIDRedirectedEncodedIDMap = {}
                if currentAssignmentGrandChildrenEncodedIDs:
                    encodedIDRedirectedEncodedIDInfos = session.query(meta.MigratedConcepts.c.originalEID, meta.MigratedConcepts.c.newEID, meta.Artifacts.c.id).filter(meta.MigratedConcepts.c.originalEID.in_(currentAssignmentGrandChildrenEncodedIDs), meta.MigratedConcepts.c.newEID == meta.Artifacts.c.encodedID, meta.Artifacts.c.artifactTypeID == domainArtifactTypeID).all()
                    for encodedIDRedirectedEncodedIDInfo in encodedIDRedirectedEncodedIDInfos:
                        originalEncodedID = encodedIDRedirectedEncodedIDInfo[0]
                        newEncodedID = encodedIDRedirectedEncodedIDInfo[1]
                        newArtifactID = encodedIDRedirectedEncodedIDInfo[2]
                        if originalEncodedID not in encodedIDRedirectedEncodedIDMap:
                            encodedIDRedirectedEncodedIDMap[originalEncodedID] = (newEncodedID, newArtifactID)
                            if newEncodedID not in currentAssignmentGrandChildrenEncodedIDs:
                                currentAssignmentGrandChildrenEncodedIDs.append(newEncodedID)
                        else:
                            raise Exception("Duplicate redirections are found for the encodedID: "+encodedIDRedirectedEncodedIDInfo[0])

                #CollectionsContext Infos
                encodedIDCollectionContextsMap = {}
                encodedIDCollectionContextInfos = collectionNode.getByEncodedIDs(eIDs= currentAssignmentGrandChildrenEncodedIDs)
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
                encodedIDConceptInfos = conceptNode.getByEncodedIDs(eIDs = currentAssignmentGrandChildrenEncodedIDs)
                for encodedIDConceptInfo in encodedIDConceptInfos:
                    encodedID = encodedIDConceptInfo.get('encodedID')
                    status = encodedIDConceptInfo.get('status')
                    if encodedID and status == 'published':
                        publishedEncodedIDs.add(encodedID)

                #Computing Children & Related Infos
                currentAssignmentChildren = list(set([currentAssignmentChildrenAndDomainGrandChildrenInfo[1] for currentAssignmentChildrenAndDomainGrandChildrenInfo in currentAssignmentChildrenAndDomainGrandChildrenInfos]))

                #Existing artifactRevisionRelations for the currentStudyTrackID
                currentAssignmentChildrenArtifactRevisionRelationInfos = session.query(meta.ArtifactRevisionRelations.c.artifactRevisionID, meta.ArtifactRevisionRelations.c.hasArtifactRevisionID, meta.ArtifactRevisions.c.artifactID).filter(meta.ArtifactRevisionRelations.c.artifactRevisionID == meta.ArtifactRevisions.c.id, meta.ArtifactRevisions.c.artifactID.in_(currentAssignmentChildren)).all()
                currentAssignmentChildrenArtifactRevisionRelations = [(currentAssignmentChildrenArtifactRevisionRelationInfo[0], currentAssignmentChildrenArtifactRevisionRelationInfo[1]) for currentAssignmentChildrenArtifactRevisionRelationInfo in currentAssignmentChildrenArtifactRevisionRelationInfos] 


                #Contexts Infos for the children currently present in the database.
                currentAssignmentChildrenToGrandChildrenWithCollectionContextsMap = {}
                currentAssignmentChildrenToGrandChildrenWithCollectionLessContextsMap = {}
                currentAssignmentChildrenContexts = []
                if currentAssignmentChildren:
                    studyTrackItemContextInfos= session.query(meta.StudyTrackItemContexts.c.studyTrackID, meta.StudyTrackItemContexts.c.studyTrackItemID, meta.StudyTrackItemContexts.c.conceptCollectionHandle, meta.StudyTrackItemContexts.c.collectionCreatorID).filter(meta.StudyTrackItemContexts.c.studyTrackID.in_(currentAssignmentChildren)).all()
                    for studyTrackItemContextInfo in studyTrackItemContextInfos:
                        studyTrackID = studyTrackItemContextInfo[0]
                        studyTrackItemID = studyTrackItemContextInfo[1]
                        conceptCollectionHandle = studyTrackItemContextInfo[2]
                        collectionCreatorID = studyTrackItemContextInfo[3]

                        #Add it to the list of existingContexts in the database.
                        currentAssignmentChildrenContexts.append((studyTrackID, studyTrackItemID, conceptCollectionHandle, collectionCreatorID))

                        #Assumed that conceptCollectionHandle and collectionCreatorID either exists or doesn't exist togeather
                        if conceptCollectionHandle and collectionCreatorID:
                            if studyTrackID not in currentAssignmentChildrenToGrandChildrenWithCollectionContextsMap:
                                currentAssignmentChildrenToGrandChildrenWithCollectionContextsMap[studyTrackID] = []
                            if studyTrackItemID not in currentAssignmentChildrenToGrandChildrenWithCollectionContextsMap[studyTrackID]:
                                currentAssignmentChildrenToGrandChildrenWithCollectionContextsMap[studyTrackID].append(studyTrackItemID)

                        if not conceptCollectionHandle and not collectionCreatorID:
                            if studyTrackID not in currentAssignmentChildrenToGrandChildrenWithCollectionLessContextsMap:
                                currentAssignmentChildrenToGrandChildrenWithCollectionLessContextsMap[studyTrackID] = []
                            if studyTrackItemID not in currentAssignmentChildrenToGrandChildrenWithCollectionLessContextsMap[studyTrackID]:
                                currentAssignmentChildrenToGrandChildrenWithCollectionLessContextsMap[studyTrackID].append(studyTrackItemID)

                artifactRevisionRelationsToDelete = []
                artifactRevisionRelationsToInsert = []
                memberStudyTrackItemStatusesToUpdate = []
                studyTrackItemContextsToUpdate = []
                studyTrackItemContextsToInsert = []
                studyTrackIDSequenceMap = {}
                artifactRevisionRelationsAlreadyProcessedForInsert = currentAssignmentChildrenArtifactRevisionRelations
                studyTrackItemContextsAlreadyProcessedForInsert = currentAssignmentChildrenContexts
                currentAssignmentGroupEncodedIDsProcessedForReReport = []
                for currentAssignmentChildrenAndDomainGrandChildrenInfo in currentAssignmentChildrenAndDomainGrandChildrenInfos:
                    currentAssignmentChildID = currentAssignmentChildrenAndDomainGrandChildrenInfo[1]
                    currentAssignmentChildCreationTime = currentAssignmentChildrenAndDomainGrandChildrenInfo[2]
                    currentAssignmentGrandChildID = currentAssignmentChildrenAndDomainGrandChildrenInfo[3]
                    currentAssignmentGrandChildEncodedID = helpers.getCanonicalEncodedID(currentAssignmentChildrenAndDomainGrandChildrenInfo[4]) if currentAssignmentChildrenAndDomainGrandChildrenInfo[4] else None
                    if currentAssignmentChildID not in currentAssignmentChildrenToGrandChildrenWithCollectionContextsMap or currentAssignmentGrandChildID not in currentAssignmentChildrenToGrandChildrenWithCollectionContextsMap[currentAssignmentChildID]:
                        #CollectionContext is absent for this grandChild (which is of type domain). Needs fixing.

                        #If the EID is not valid in the new structure or the child's (studyTrack) creation date is before collections release or if the assignment's origin is 'LMS' (LMS typed studytrack created after collections release also needs fixing) - resolveIt
                        didRedirectionOccur = False
                        canDetermineUniqueCollectionContextUsingOldBranchCollectionMap = False
                        currentAssignmentNewGrandChildEncodedID = None
                        currentAssignmentNewGrandChildID = None
                        if currentAssignmentGrandChildEncodedID not in publishedEncodedIDs or (str(currentAssignmentChildCreationTime) < COLLECTIONS_RELEASE_DATE or currentAssignmentOrigin == 'lms'):
                            #Replace the encodedID if it has any redirections
                            if currentAssignmentGrandChildEncodedID in encodedIDRedirectedEncodedIDMap:
                                currentAssignmentNewGrandChildEncodedID = helpers.getCanonicalEncodedID(encodedIDRedirectedEncodedIDMap[currentAssignmentGrandChildEncodedID][0]) if encodedIDRedirectedEncodedIDMap[currentAssignmentGrandChildEncodedID][0] else None
                                currentAssignmentNewGrandChildID = encodedIDRedirectedEncodedIDMap[currentAssignmentGrandChildEncodedID][1]
                                didRedirectionOccur = True
                            
                            #Though there is no redirection, the encodedID is still in the oldContext, hence the newCollectionContext can be determined using the branchCollectionMap
                            canDetermineUniqueCollectionContextUsingOldBranchCollectionMap = True

                        if not didRedirectionOccur: 
                            currentAssignmentNewGrandChildEncodedID = currentAssignmentGrandChildEncodedID
                            currentAssignmentNewGrandChildID = currentAssignmentGrandChildID                            

                        if currentAssignmentNewGrandChildEncodedID not in publishedEncodedIDs:
                            raise Exception("Invalid (not a valid published EID in the new taxonomy structure) endodedID: "+str(currentAssignmentGrandChildEncodedID)+", redirectedEncodedID: ["+str(currentAssignmentNewGrandChildEncodedID)+"] encountered.")

                        if didRedirectionOccur:
                            #Since we are replacing the encodedID, we need to replace the StudyTrack children as well as entires in MemberStudyTrackItemStatus tables
                            currentAssignmentChildRevisionIDs = []
                            currentAssignmentChildLatestRevisionID = -1
                            currentAssignmentGrandChildRevisionIDs = []
                            currentAssignmentNewGrandChildLatestRevisionID = -1
                            artifactRevisionInfos = session.query(meta.ArtifactRevisions.c.artifactID, meta.ArtifactRevisions.c.id).filter(meta.ArtifactRevisions.c.artifactID.in_((currentAssignmentChildID, currentAssignmentGrandChildID, currentAssignmentNewGrandChildID))).all()
                            for artifactRevisionInfo in artifactRevisionInfos:
                                artifactID = artifactRevisionInfo[0]
                                artifactRevisionID = artifactRevisionInfo[1]
                                if artifactID == currentAssignmentChildID:
                                    currentAssignmentChildRevisionIDs.append(artifactRevisionID)
                                    if artifactRevisionID > currentAssignmentChildLatestRevisionID:
                                        currentAssignmentChildLatestRevisionID = artifactRevisionID
                                elif artifactID == currentAssignmentGrandChildID:
                                    currentAssignmentGrandChildRevisionIDs.append(artifactRevisionID)
                                elif artifactID == currentAssignmentNewGrandChildID:
                                    if artifactRevisionID > currentAssignmentNewGrandChildLatestRevisionID:
                                        currentAssignmentNewGrandChildLatestRevisionID = artifactRevisionID

                            #Replacing the StudyTrack Children. 
                            # - Delete all the revisionIDs of the old child
                            for currentAssignmentChildRevisionID in currentAssignmentChildRevisionIDs:
                                for currentAssignmentGrandChildRevisionID in currentAssignmentGrandChildRevisionIDs:
                                    artifactRevisionRelationsToDelete.append((currentAssignmentChildRevisionID, currentAssignmentGrandChildRevisionID))

                            #Insert a relation with new child
                            if (currentAssignmentChildLatestRevisionID, currentAssignmentNewGrandChildLatestRevisionID) not in artifactRevisionRelationsAlreadyProcessedForInsert:
                                if currentAssignmentChildID not in studyTrackIDSequenceMap:
                                    studyTrackIDSequenceMap[currentAssignmentChildID] = 0
                                studyTrackIDSequenceMap[currentAssignmentChildID] = studyTrackIDSequenceMap[currentAssignmentChildID]+1
                                artifactRevisionRelationsToInsert.append({'artifactRevisionID': currentAssignmentChildLatestRevisionID, 'hasArtifactRevisionID': currentAssignmentNewGrandChildLatestRevisionID, 'sequence': studyTrackIDSequenceMap[currentAssignmentChildID]})
                                artifactRevisionRelationsAlreadyProcessedForInsert.append((currentAssignmentChildLatestRevisionID, currentAssignmentNewGrandChildLatestRevisionID))

                            #Replacing the Member StudyTrack Item Statuses.
                            #We just ignore the case when multiple EIDs which are merging in to the same EID were attempted by the member already
                            #We just update what ever goes through the SQL query - the rest will be staying with the oldEID in the database, but will be migrated in the API response. 
                            memberStudyTrackItemStatusesToUpdate.append(meta.MemberStudyTrackItemStatus.update().prefix_with("IGNORE").where(sqlalchemy.and_(meta.MemberStudyTrackItemStatus.c.assignmentID==currentAssignmentID, meta.MemberStudyTrackItemStatus.c.studyTrackItemID==currentAssignmentGrandChildID)).values({meta.MemberStudyTrackItemStatus.c.studyTrackItemID:currentAssignmentNewGrandChildID}))

                        #Now get the collectionContext - if possible to uniquely determine it
                        uniqueCollectionContext = None
                        if currentAssignmentNewGrandChildEncodedID in encodedIDCollectionContextsMap:
                            collectionContexts = encodedIDCollectionContextsMap[currentAssignmentNewGrandChildEncodedID]
                            if len(collectionContexts) == 1:
                                uniqueCollectionContext = collectionContexts[0]
                            else:
                                if canDetermineUniqueCollectionContextUsingOldBranchCollectionMap:
                                    #Deals with the oldGrandChildEncodedID
                                    currentAssignmentGrandChildEncodedIDParts = currentAssignmentGrandChildEncodedID.split('.')
                                    if currentAssignmentGrandChildEncodedIDParts and len(currentAssignmentGrandChildEncodedIDParts) > 2:
                                        currentAssignmentGrandChildBranch =  currentAssignmentGrandChildEncodedIDParts[1]
                                        if currentAssignmentGrandChildBranch in oldBranchToNewCollectionMap:
                                            currentAssignmentGrandChildBranchMappedCollection = oldBranchToNewCollectionMap[currentAssignmentGrandChildBranch]
                                            for collectionContext in collectionContexts:
                                                if currentAssignmentGrandChildBranchMappedCollection == collectionContext[0]:
                                                    uniqueCollectionContext = collectionContext

                        if not uniqueCollectionContext:
                            raise Exception("unique CollectionContext determination for the endodedID: "+str(currentAssignmentGrandChildEncodedID)+ " [redirectedEncodedID: "+str(currentAssignmentNewGrandChildEncodedID)+"] could not be performed.")

                        if uniqueCollectionContext:
                            collectionHandle = uniqueCollectionContext[0]
                            conceptCollectionHandle = uniqueCollectionContext[1]
                            collectionCreatorID = uniqueCollectionContext[2]

                            if (currentAssignmentChildID, currentAssignmentNewGrandChildID, conceptCollectionHandle, collectionCreatorID) not in studyTrackItemContextsAlreadyProcessedForInsert:
                                #Check if there is a collectionLess Context (In case of redirection, this check happens with the actual oldGrandChildID)                                
                                if currentAssignmentChildID in currentAssignmentChildrenToGrandChildrenWithCollectionLessContextsMap and currentAssignmentGrandChildID in currentAssignmentChildrenToGrandChildrenWithCollectionLessContextsMap[currentAssignmentChildID]:
                                    #Update the existing rows with collectionContext
                                    #print "Collection Context is being updated. DETAILS - assignmentChildID(studyTrackID): "+str(currentAssignmentChildID)+", assignmentGrandChildID(studyTrackItemID): "+str(currentAssignmentGrandChildID)+", assignmentNewGrandChildID:"+str(currentAssignmentNewGrandChildID)+", conceptCollectionHandle:"+str(conceptCollectionHandle)+", collectionCreatorID: "+str(collectionCreatorID)
                                    log.info("Collection Context is being updated. DETAILS - assignmentChildID(studyTrackID): "+str(currentAssignmentChildID)+", assignmentGrandChildID(studyTrackItemID): "+str(currentAssignmentGrandChildID)+", assignmentNewGrandChildID:"+str(currentAssignmentNewGrandChildID)+", conceptCollectionHandle:"+str(conceptCollectionHandle)+", collectionCreatorID: "+str(collectionCreatorID))
                                    studyTrackItemContextsToUpdate.append(meta.StudyTrackItemContexts.update().where(sqlalchemy.and_(meta.StudyTrackItemContexts.c.studyTrackID==currentAssignmentChildID, meta.StudyTrackItemContexts.c.studyTrackItemID==currentAssignmentGrandChildID)).values({meta.StudyTrackItemContexts.c.studyTrackItemID:currentAssignmentNewGrandChildID, meta.StudyTrackItemContexts.c.conceptCollectionHandle:conceptCollectionHandle, meta.StudyTrackItemContexts.c.collectionCreatorID:collectionCreatorID}))
                                else:
                                    #Insert a new collectionContext
                                    #print "Collection Context is being inserted. DETAILS - assignmentChildID(studyTrackID): "+str(currentAssignmentChildID)+", assignmentGrandChildID(studyTrackItemID): "+str(currentAssignmentGrandChildID)+", assignmentNewGrandChildID:"+str(currentAssignmentNewGrandChildID)+", conceptCollectionHandle:"+str(conceptCollectionHandle)+", collectionCreatorID: "+str(collectionCreatorID)
                                    log.info("Collection Context is being inserted. DETAILS - assignmentChildID(studyTrackID): "+str(currentAssignmentChildID)+", assignmentGrandChildID(studyTrackItemID): "+str(currentAssignmentGrandChildID)+", assignmentNewGrandChildID:"+str(currentAssignmentNewGrandChildID)+", conceptCollectionHandle:"+str(conceptCollectionHandle)+", collectionCreatorID: "+str(collectionCreatorID))
                                    studyTrackItemContextsToInsert.append({'studyTrackID':currentAssignmentChildID, 'studyTrackItemID': currentAssignmentNewGrandChildID, 'conceptCollectionHandle': conceptCollectionHandle, 'collectionCreatorID':collectionCreatorID})                                        
                                studyTrackItemContextsAlreadyProcessedForInsert.append((currentAssignmentChildID, currentAssignmentNewGrandChildID, conceptCollectionHandle, collectionCreatorID))

                                if (currentAssignmentGroupID, currentAssignmentNewGrandChildEncodedID) not in currentAssignmentGroupEncodedIDsProcessedForReReport and currentAssignmentGroupMemberIDs:
                                    scoreReReportingPythonScriptFile.write("print 'Reporting for groupID [%d], encodedIDs: [%s], studentIDs: [%s].'\n" % (currentAssignmentGroupID, currentAssignmentNewGrandChildEncodedID, currentAssignmentGroupMemberIDs))
                                    scoreReReportingPythonScriptFile.write("task = ScoreReReporter().apply(kwargs={'groupID': %d, 'encodedIDs': ['%s'], 'studentIDs': %s})\n" % (currentAssignmentGroupID, currentAssignmentNewGrandChildEncodedID, currentAssignmentGroupMemberIDs))                        
                                    scoreReReportingPythonScriptFile.write("print 'Result: '+str(task.wait())\n")
                                    currentAssignmentGroupEncodedIDsProcessedForReReport.append((currentAssignmentGroupID, currentAssignmentNewGrandChildEncodedID))

                #We'll process a complete assignment togeather or not - performanceFactor
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
                    print "COLLECTION CONTEXTS ARE ALREADY PRESENT FOR ALL THE GRAND CHILDREN IN THE CURRENT ASSIGNMENT."
                    log.info("COLLECTION CONTEXTS ARE ALREADY PRESENT FOR ALL THE GRAND CHILDREN IN THE CURRENT ASSIGNMENT.")
                else:
                    if studyTrackItemContextsToUpdate:
                        for studyTrackItemContextToUpdate in studyTrackItemContextsToUpdate:
                            session.execute(studyTrackItemContextToUpdate)

                    if studyTrackItemContextsToInsert:
                        session.execute(meta.StudyTrackItemContexts.insert(), studyTrackItemContextsToInsert)
                    
                    print "COLLECTION CONTEXTS ARE MISSING FOR FEW OF THE GRAND CHILDREN IN THE CURRENT ASSIGNMENT.CONTEXTS ARE SUCCESSFULLY DETERMINED AND ATTACHED FOR ALL OF THEM."
                    log.info("COLLECTION CONTEXTS ARE MISSING FOR FEW OF THE GRAND CHILDREN IN THE CURRENT ASSIGNMENT.CONTEXTS ARE SUCCESSFULLY DETERMINED AND ATTACHED FOR ALL OF THEM.")
            else:
                #Assignments of type like 'selfStudies', 'self-assignments'...etc are encontered. This script does nothing for them.
                print "ASSIGNMENT WITH ASSIGNMENT-TYPE: "+currentAssignmentType+" ENCOUNTERED. SCRIPT CURRENTLY DOESN'T SUPPORT THEM."
                log.info("ASSIGNMENT WITH ASSIGNMENT-TYPE: "+currentAssignmentType+" ENCOUNTERED. SCRIPT CURRENTLY DOESN'T SUPPORT THEM.")                

            if commitFixesToDataBase:
                session.commit()
            else:
                session.rollback()
            print "ASSIGNMENT PROCESSING SUCCESSFULLY COMPLETED."
            log.info("ASSIGNMENT PROCESSING SUCCESSFULLY COMPLETED.")
        except SQLAlchemyError, sqlae:
            session.rollback()
            print "CURRENT ASSIGNMENT PROCESSING FAILED. REASON : SQLAlchemyError - "+str(type(sqlae))+" - "+str(sqlae)
            log.info("CURRENT ASSIGNMENT PROCESSING FAILED. REASON : SQLAlchemyError - "+str(type(sqlae))+" - "+str(sqlae))
            log.exception(sqlae)
        except (KeyboardInterrupt, SystemExit) as e:
            session.rollback()
            print "CURRENT ASSIGNMENT PROCESSING FAILED. REASON : KeyboardInterrupt - "+str(type(e))+" - "+str(e)
            log.info("CURRENT ASSIGNMENT PROCESSING FAILED. REASON : KeyboardInterrupt - "+str(type(e))+" - "+str(e))
            log.exception(e)
            sys.exit(-1)
        except Exception, e:
            session.rollback()
            print "CURRENT ASSIGNMENT PROCESSING FAILED. REASON : Exception - "+str(type(e))+" - "+str(e)
            log.info("CURRENT ASSIGNMENT PROCESSING FAILED. REASON : Exception - "+str(type(e))+" - "+str(e))
            log.exception(e)
        finally:
            session.close()

        print "TIME TAKEN FOR CURRENT ASSIGNMENT : %s seconds" %((time.time()-chunkStartTime))
        print "ENDED PROCESSING ASSIGNMENT AT START = "+str(offset)+", END = "+str(offset+1)
        print
        log.info("TIME TAKEN FOR CURRENT ASSIGNMENT : %s seconds" %((time.time()-chunkStartTime)))
        log.info("ENDED PROCESSING ASSIGNMENT AT START = "+str(offset)+", END = "+str(offset+1))
        log.info("")
        offset = offset+1

    print "TOTAL TIME TAKEN FOR PROCESSING THE FOUND ASSIGNMENT ARTIFACTS : %s minutes" %((time.time()-processStartTime)/60)
    log.info("TOTAL TIME TAKEN FOR PROCESSING THE FOUND ASSIGNMENT ARTIFACTS : %s minutes" %((time.time()-processStartTime)/60))
    handler.close()
    log.removeHandler(handler)

def _generateAssignmentsQuery(session, assignmentCreatorIDs=None, assignedGroupIDs=None, startCreationTime=None, endCreationTime=None, assignmentType=None, assignmentOrigin=None, assignmentArtifactTypeID=56, offset=0, limit=0):
    assignmentsQuery = session.query(meta.Artifacts.c.id, meta.Assignments.c.assignmentType, meta.Assignments.c.groupID, meta.Assignments.c.origin).filter(meta.Artifacts.c.artifactTypeID==assignmentArtifactTypeID)
    assignmentsQuery = _updateAssignmentsRelatedQueryWithRunParameters(assignmentsQuery, assignmentCreatorIDs, assignedGroupIDs, startCreationTime, endCreationTime, assignmentType, assignmentOrigin)
    if offset:
        assignmentsQuery = assignmentsQuery.offset(offset)
    if limit:
        assignmentsQuery = assignmentsQuery.limit(limit)
    return assignmentsQuery

def _generateAssignmentsCountQuery(session, assignmentCreatorIDs=None, assignedGroupIDs=None, startCreationTime=None, endCreationTime=None, assignmentType=None, assignmentOrigin=None, assignmentArtifactTypeID=56):
    assignmentsCountQuery = session.query(func.count(meta.Artifacts.c.id)).filter(meta.Artifacts.c.artifactTypeID==assignmentArtifactTypeID)
    assignmentsCountQuery = _updateAssignmentsRelatedQueryWithRunParameters(assignmentsCountQuery, assignmentCreatorIDs, assignedGroupIDs, startCreationTime, endCreationTime, assignmentType, assignmentOrigin)
    return assignmentsCountQuery

def _updateAssignmentsRelatedQueryWithRunParameters(assignmentsRelatedQuery, assignmentCreatorIDs=None, assignedGroupIDs=None, startCreationTime=None, endCreationTime=None, assignmentType=None, assignmentOrigin=None):
    if assignmentCreatorIDs:
        assignmentsRelatedQuery = assignmentsRelatedQuery.filter(meta.Artifacts.c.creatorID.in_(assignmentCreatorIDs))
    if startCreationTime:
        assignmentsRelatedQuery = assignmentsRelatedQuery.filter(meta.Artifacts.c.creationTime >= startCreationTime)
    if endCreationTime:
        assignmentsRelatedQuery = assignmentsRelatedQuery.filter(meta.Artifacts.c.creationTime <= endCreationTime)

    assignmentsRelatedQuery = assignmentsRelatedQuery.join(meta.Assignments, meta.Artifacts.c.id==meta.Assignments.c.assignmentID)
    if assignedGroupIDs:
        assignmentsRelatedQuery = assignmentsRelatedQuery.filter(meta.Assignments.c.groupID.in_(assignedGroupIDs))
    if assignmentType:
        assignmentsRelatedQuery = assignmentsRelatedQuery.filter(meta.Assignments.c.assignmentType == assignmentType)   
    if assignmentOrigin:
        assignmentsRelatedQuery = assignmentsRelatedQuery.filter(meta.Assignments.c.origin == assignmentOrigin)
    return assignmentsRelatedQuery

