from flx.model import meta, model
from flx.lib import helpers as h
from flx.model.mongo.collectionNode import CollectionNode
from flx.model.mongo import getDB as getMongoDBConnection

from pylons import config
from sqlalchemy import and_, exc
import os
from datetime import datetime, timedelta
import logging

my_name = os.path.basename(__file__)
LOG_FILENAME = "/opt/2.0/log/migrate_assignment_scores.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=100*1024*1024, backupCount=5)
handler.setFormatter(formatter)
log.handlers = []
log.addHandler(handler)

## Get the oldest creation date for artifact type 56
OLDEST_ASSIGNMENT_CREATION_DATE = '2013-09-03'
LAST_ACCESS_BEFORE = '2017-07-17 00:00:00'

def returnNull(val):
    if val is None:
        return 'NULL'
    return val

def run(memberID=None, commit=False, startDate='2017-08-05', endDate=None, maxAssignmentID=0, assignmentIDs=[], lastAccessBefore=None):
    """
        Migrate Assignment Scores for Assignments created by memberID.
        Only "assignment" type assignments will be migrated.

        Logic:

            - Get all Assignments of given type optionally created by memberID
            - For each assignment get the unique studyTrackItems of type domain or asmtpractice
            - For each such studyTrackItems, find the old EID of the domain or practice
            - Find the corresponding domain or asmtpractice artifact for the new EID
            - Replace the old studyTrackItemID with the new artifactID
            - Add the default canonical collection context for this new EID
            - Find the study-track artifact which is parent of each such item.
            - Replace the child artifact association for the study-track with the new item artifact in ArtifactRevisionRelations table.
            - TODO: Some of the study-track artifacts have no association with the studyTrackItems
    """
    session = meta.Session()
    mongodb = getMongoDBConnection(config)
    cn = CollectionNode(mongodb)
    eidMappings = {}
    for row in session.query(model.MigratedConcept).all():
        eidMappings[row.originalEID] = row.newEID
    log.info("eidMappings.length: %d" % len(eidMappings.keys()))

    inserts = 0
    updates = 0
    startDateDt = datetime.strptime(startDate, '%Y-%m-%d')
    oldestCreationDate = datetime.strptime(OLDEST_ASSIGNMENT_CREATION_DATE, '%Y-%m-%d')
    if endDate:
        endDateObj = datetime.strptime(endDate, '%Y-%m-%d')
        if endDateObj > oldestCreationDate:
            oldestCreationDate = endDateObj

    global LAST_ACCESS_BEFORE
    if lastAccessBefore:
        LAST_ACCESS_BEFORE = lastAccessBefore
    elif assignmentIDs:
        ## Set LAST_ACCESS_BEFORE to current time - we should update all rows for given assignmentIDs
        LAST_ACCESS_BEFORE = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    ## Get Artifact types
    domainType = session.query(model.ArtifactType).filter(model.ArtifactType.name == 'domain').one()
    practiceType = session.query(model.ArtifactType).filter(model.ArtifactType.name == 'asmtpractice').one()
    loopCnt = 0
    while True:
        try:
            session.begin()
            loopCnt += 1
            if loopCnt > 1:
                if memberID:
                    ## No pagination for memberID
                    print "Done for member: %d" % memberID
                    break
                elif assignmentIDs:
                    print "Done for assignmentIDs: %s" % assignmentIDs
                    break
            if not memberID and not assignmentIDs:
                endDateDt = startDateDt - timedelta(days=1)
                endDateStr = endDateDt.strftime('%Y-%m-%d %H:%M:%S')
            else:
                endDateDt = None
                endDateStr = None
            startDateStr = startDateDt.strftime('%Y-%m-%d %H:%M:%S')
            ## Process assignments
            print ">>> Reverse Start date: %s, end date: %s, oldest record date: %s" % (startDateStr, endDateStr, oldestCreationDate.strftime('%Y-%m-%d %H:%M:%S'))
            log.info(">>> Reverse Start date: %s, end date: %s, oldest record date: %s" % (startDateStr, endDateStr, oldestCreationDate.strftime('%Y-%m-%d %H:%M:%S')))
            #session.execute("UPDATE LastMigratedAssignmentScore SET processedUntil = '%s'" % endDateDt)
            if endDateDt and oldestCreationDate > endDateDt:
                print ">>> Done! Reached oldestCreationDate or specied end date: %s" % endDateDt
                log.info(">>> Done! Reached oldestCreationDate or specied end date: %s" % endDateDt)
                break

            query = session.query(model.Assignment, model.Artifact).filter(and_(
                model.Assignment.assignmentID == model.Artifact.id,
                model.Assignment.assignmentType == 'assignment'))
            if assignmentIDs:
                query = query.filter(model.Assignment.assignmentID.in_(assignmentIDs))
            else:
                if memberID:
                    query = query.filter(model.Artifact.creatorID == memberID)
                if maxAssignmentID:
                    query = query.filter(model.Assignment.assignmentID <= maxAssignmentID)
                if startDateDt:
                    query = query.filter(model.Artifact.creationTime <= startDateDt)
                    if endDateDt:
                        query = query.filter(model.Artifact.creationTime > endDateDt)
            query = query.order_by(model.Assignment.assignmentID.desc())
            rows = query.all()

            startDateDt = endDateDt

            for row in rows:
                log.info("                 ###############                     ")
                log.info(">>> CreatorID: %d, AssignmentID: %d" % (row.Artifact.creatorID, row.Assignment.assignmentID))
                assignmentArtifact = row.Artifact
                ## Get distinct studyTrackItems
                distinctStudyTrackItems = session.query(model.MemberStudyTrackItemStatus.studyTrackItemID.distinct()).filter(model.MemberStudyTrackItemStatus.assignmentID == row.Assignment.assignmentID).join(
                        model.Artifact, model.MemberStudyTrackItemStatus.studyTrackItemID == model.Artifact.id).filter(model.Artifact.artifactTypeID.in_([domainType.id, practiceType.id])).all()
                log.info(">>> Found %d distinctStudyTrackItems" % len(distinctStudyTrackItems))
                studyTrackItemMap = {}
                for (studyTrackItemID,) in distinctStudyTrackItems:
                    originalItemArtifact = session.query(model.Artifact).filter(model.Artifact.id == studyTrackItemID).one()
                    log.info(">>> AssignmentID: %d, studyTrackItemID: %d, encodedID: %s, Type: %s" % (row.Assignment.assignmentID, originalItemArtifact.id, originalItemArtifact.encodedID, originalItemArtifact.type.name))
                    oldEID = originalItemArtifact.encodedID
                    if not oldEID:
                        ## Get the practice EID
                        oldEIDRow = session.query(model.RelatedArtifactsAndLevels).filter(model.RelatedArtifactsAndLevels.id == originalItemArtifact.id).first()
                        if oldEIDRow:
                            oldEID = oldEIDRow.domainEID
                            log.info(">>> Found EID for old practice: %s" % oldEID)
                    if oldEID:
                        oldCanonicalEID = h.getCanonicalEncodedID(oldEID)
                        newEid = eidMappings.get(oldCanonicalEID, oldEID)
                        if newEid != oldEID:
                            log.info(">>> Should be moved to: %s" % newEid)
                        studyTrackArtifact = assignmentArtifact.revisions[0].children[0].child.artifact
                        replacementArtifact = None
                        if originalItemArtifact.artifactTypeID == domainType.id:
                            replacementArtifact = session.query(model.Artifact).filter(model.Artifact.artifactTypeID == domainType.id, model.Artifact.encodedID == newEid).one()
                        else:
                            replacementArtifactRow = session.query(model.RelatedArtifactsAndLevels, model.Artifact).filter(and_(
                                model.RelatedArtifactsAndLevels.id == model.Artifact.id,
                                model.RelatedArtifactsAndLevels.artifactTypeID == practiceType.id,
                                model.RelatedArtifactsAndLevels.domainEID == newEid,
                                model.RelatedArtifactsAndLevels.publishTime != None)).first()
                            if replacementArtifactRow:
                                replacementArtifact = replacementArtifactRow.Artifact
                            else:
                                log.info("!!! Could not find new practice for [%s]" % newEid)
                        if replacementArtifact:
                            studyTrackItemMap[originalItemArtifact.id] = replacementArtifact.id
                        if replacementArtifact and replacementArtifact.id != originalItemArtifact.id:
                            log.info(">>> Found replacementArtifactID: %s, typeName: %s. Updating MemberStudyTrackItemStatus for assignmentID: %s, studyTrackItemID: %s" 
                                    % (replacementArtifact.id, replacementArtifact.type.name, row.Assignment.assignmentID, studyTrackItemID))
                            try:
                                session.execute("UPDATE IGNORE MemberStudyTrackItemStatus SET studyTrackItemID = %d WHERE assignmentID = %s AND studyTrackItemID = %s AND (lastAccess <= '%s' OR lastAccess is NULL)"
                                        % (replacementArtifact.id, row.Assignment.assignmentID, studyTrackItemID, LAST_ACCESS_BEFORE))
                                updates += 1
                            except exc.IntegrityError as ie:
                                log.info(">>> Error updating rows: %s" % str(ie))

                            replacementArtifactRevision = replacementArtifact.revisions[0]
                            try:
                                ## Fix the assignment relationship.
                                studyTrackArtifact = assignmentArtifact.revisions[0].children[0].child.artifact
                                if studyTrackArtifact:
                                    log.info(">>> studyTrackArtifact: %d, type: %s" % (studyTrackArtifact.id, studyTrackArtifact.type.name))
                                    studyTrackArtifactRevision = studyTrackArtifact.revisions[0]
                                    originalItemArtifactRevision = originalItemArtifact.revisions[0]
                                    artifactRevisionRelation = session.query(model.ArtifactRevisionRelation).filter(and_(
                                        model.ArtifactRevisionRelation.artifactRevisionID == studyTrackArtifactRevision.id,
                                        model.ArtifactRevisionRelation.hasArtifactRevisionID == originalItemArtifactRevision.id)).first()
                                    if artifactRevisionRelation:
                                        ## Replace the relationship row
                                        log.info(">>> Setting new ArtifactRevisionRelation (artifactRevisionID: %d, hasArtifactRevisionID: %d)" % (studyTrackArtifactRevision.id, replacementArtifactRevision.id))
                                        session.execute('UPDATE IGNORE ArtifactRevisionRelations SET hasArtifactRevisionID = %d WHERE artifactRevisionID = %d and hasArtifactRevisionID = %d' \
                                                % (replacementArtifactRevision.id, studyTrackArtifactRevision.id, originalItemArtifactRevision.id))
                                    else:
                                        log.warn("!!! No relationship found for item [%d] with studyTrackID [%d]" % (originalItemArtifact.id, studyTrackArtifact.id))
                                else:
                                    log.warn("!!! Could not find studyTrackArtifact for assignment: %s" % assignmentArtifact.id)
                            except Exception as ste:
                                log.warn("!!! No studyTrackArtifact for assignment: %s" % assignmentArtifact.id, exc_info=ste)
                        else: ## replacementArtifact and replacementArtifact.id != originalItemArtifact.id
                            log.warn("!!! Could not find domain artifact for %s or replacement and old are same artifacts." % newEid)

                        if studyTrackArtifact:
                            try:
                                ## Add collection context
                                collectionNode = None
                                collectionHandle = model.BRANCH_ENCODEDID_MAPPING.get(oldCanonicalEID[:7])
                                if collectionHandle:
                                    collectionNodes = cn.getByEncodedIDs(eIDs=[newEid], collectionHandle=collectionHandle, collectionCreatorID=3, publishedOnly=True, canonicalOnly=True)
                                    for collectionNode in collectionNodes:
                                        break
                                else:
                                    log.warn("!!! Could not find collectionHandle for EID [%s] using default collectionHandle [%s]" % (oldCanonicalEID, collectionHandle))
                                if not collectionNode:
                                    collectionNodes = cn.getByEncodedIDs(eIDs=[newEid], collectionHandle=None, collectionCreatorID=3, publishedOnly=True, canonicalOnly=True)
                                    for collectionNode in collectionNodes:
                                        break
                                if collectionNode:
                                    studyTrackItemContext = session.query(model.StudyTrackItemContext).filter(and_(
                                        model.StudyTrackItemContext.studyTrackID == studyTrackArtifact.id,
                                        model.StudyTrackItemContext.studyTrackItemID == originalItemArtifact.id)).first()
                                    if studyTrackItemContext:
                                        ## Modify to add collection context
                                        log.info(">>> Setting conceptCollectionHandle = '%s', collectionCreatorID = '%s', studyTrackItemID = %d, studyTrackID: %d" \
                                                % (collectionNode['handle'], collectionNode['collection']['creatorID'], replacementArtifact.id, studyTrackArtifact.id))
                                        session.execute("UPDATE IGNORE StudyTrackItemContexts SET conceptCollectionHandle = '%s', collectionCreatorID = '%s', studyTrackItemID = %d WHERE studyTrackItemID = %d AND studyTrackID = %d" \
                                                % (collectionNode['handle'], collectionNode['collection']['creatorID'], replacementArtifact.id, originalItemArtifact.id, studyTrackArtifact.id))
                                    else:
                                        ## Add collection context
                                        log.info(">>> Adding StudyTrackItemContext: conceptCollectionHandle = '%s', collectionCreatorID = '%s', studyTrackItemID = %d, studyTrackID = %d" \
                                                % (collectionNode['handle'], collectionNode['collection']['creatorID'], replacementArtifact.id, studyTrackArtifact.id))
                                        try:
                                            session.execute("INSERT INTO StudyTrackItemContexts (studyTrackID, studyTrackItemID, contextUrl, conceptCollectionHandle, collectionCreatorID) VALUES (%d, %d, '', '%s', %d)" \
                                                    % (studyTrackArtifact.id, replacementArtifact.id, collectionNode['handle'], collectionNode['collection']['creatorID']))
                                            inserts += 1
                                        except exc.IntegrityError as ie:
                                            log.debug(">>> Ignoring insert into StudyTrackItemContexts: %s" % str(ie))
                                else:
                                    log.warn("!!! Could not find a canonical collection for EID: %s" % (newEid))
                            
                            except Exception as e:
                                log.error("!!! Error updating: %s" % str(e), exc_info=e)
                        else: ## not studyTrackArtifact
                            log.warn("!!! Could not find studyTrackArtifact for assignment: %s" % assignmentArtifact.id)
                    else: ## not oldEid
                        log.warn("!!! ERROR: Could not find oldEID for artifact: %d" % originalItemArtifact.id)
                ## End distinctStudyTrackItems loop
                ## Process items that were many-to-one migrations
                scoreMap = {}
                for originalItemID, replacementItemID in studyTrackItemMap.iteritems():
                    log.debug(">>> Processing orig: %d, replace: %d for assignment: %d" % (originalItemID, replacementItemID, row.Assignment.assignmentID))
                    if originalItemID == replacementItemID:
                        continue
                    if replacementItemID not in scoreMap:
                        log.debug(">>> Getting scores for assignmentID: %s, studyTrackItemID: %d" % (row.Assignment.assignmentID, replacementItemID))
                        originalScores = session.query(model.MemberStudyTrackItemStatus).filter(and_(
                            model.MemberStudyTrackItemStatus.assignmentID == row.Assignment.assignmentID,
                            model.MemberStudyTrackItemStatus.studyTrackItemID == replacementItemID)).order_by(
                                    model.MemberStudyTrackItemStatus.memberID.asc(), 
                                    model.MemberStudyTrackItemStatus.score.asc()).all()
                        scoreMap[replacementItemID] = originalScores
                    else:
                        originalScores = scoreMap[replacementItemID]
                    memberScoreMap = {}
                    for score in originalScores:
                        memberScoreMap[score.memberID] = score
                        #log.debug("replacementItemID: %s" % score.studyTrackItemID)
                    for memberID in memberScoreMap.keys():
                        try:
                            score = memberScoreMap[memberID]
                            log.info(">>> Setting score for duplicate many-to-one rows.")
                            log.info(">>> UPDATE MemberStudyTrackItemStatus SET score = %s, lastAccess = '%s', status = '%s' WHERE assignmentID = %d AND memberID = %d AND studyTrackItemID = %d" % (returnNull(score.score), score.lastAccess, score.status, row.Assignment.assignmentID, score.memberID, originalItemID))
                            session.execute("UPDATE MemberStudyTrackItemStatus SET score = %s, lastAccess = '%s', status = '%s' WHERE assignmentID = %d AND memberID = %d AND studyTrackItemID = %d" % (returnNull(score.score), score.lastAccess, score.status, row.Assignment.assignmentID, score.memberID, originalItemID))
                        except Exception as e:
                            log.error("!!! ERROR: Setting duplicate many-to-one scores: %s" % str(e), exc_info=e)

        except Exception as e:
            log.error(e, exc_info=e)
        finally:
            if commit:
                log.info("Commit ! Inserts: %d, Updates: %d" % (inserts, updates))
                print "Commit ! Inserts: %d, Updates: %d" % (inserts, updates)
                session.commit()
            else:
                session.rollback()

