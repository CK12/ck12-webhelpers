from flx.model import meta, model
from flx.lib import helpers as h

from sqlalchemy import and_, text
import os
import logging

my_name = os.path.basename(__file__)
LOG_FILENAME = "/opt/2.0/log/fix_studytracks_with_unpublished_practice_ids.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=100*1024*1024, backupCount=5)
handler.setFormatter(formatter)
log.handlers = []
log.addHandler(handler)

def run(commit=False, studyTrackIDs=[]):
    query = text("select A.id, RAL.id from Artifacts A, ArtifactAndChildren AC, RelatedArtifactsAndLevels RAL where A.id = AC.id and A.artifactTypeID = 55 and AC.childID = RAL.id and RAL.artifactTypeID = 53 and RAL.publishTime is null")

    session = meta.Session()
    updates = 0

    studyTrackIDDict = {}
    cnt = 0
    errors = 0
    total = 0
    outputFile = open("/tmp/fix_studytracks_with_unpublished_practice_ids_score_rereporting.py", "w")
    outputFile.write("from assessment.views.celerytasks.scorereporter import ScoreReReporter\n")
    results = session.execute(query)
    for result in results:
        studyTrackID = result[0]
        studyTrackItemID = result[1]
        if studyTrackIDs and studyTrackID not in studyTrackIDs:
            ## Skip
            continue
        if not studyTrackID in studyTrackIDDict:
            studyTrackIDDict[studyTrackID] = set()
        studyTrackIDDict[studyTrackID].add(studyTrackItemID)
        total += 1

    print "Processing %d rows with potential issues." % total
    totalCnt = len(studyTrackIDDict.keys())
    for studyTrackID in studyTrackIDDict.keys():
        try:
            session.begin()
            studyTrackArtifact = session.query(model.Artifact).filter(model.Artifact.id == studyTrackID).one()
            for studyTrackItemID in studyTrackIDDict[studyTrackID]:
                cnt += 1
                log.debug("[%d/%d] Processing: studyTrackID: %d, studyTrackIDDict[studyTrackID]: %s" % (cnt, totalCnt, studyTrackID, studyTrackIDDict[studyTrackID]))
                print "[%d/%d] Processing: studyTrackID: %d, studyTrackIDDict[studyTrackID]: %s" % (cnt, totalCnt, studyTrackID, studyTrackIDDict[studyTrackID])
                studyTrackItemArtifact = session.query(model.Artifact).filter(model.Artifact.id == studyTrackItemID).one()
                studyTrackItemContext = session.query(model.StudyTrackItemContext).filter(model.StudyTrackItemContext.studyTrackID == studyTrackID).first()
                if not studyTrackItemContext:
                    log.warn("!!! Skipping - no studyTrackItemContext exits.")
                else:
                    ## Get the published practice id for the same collection context
                    log.debug("studyTrackItemContext.studyTrackItemID [%d] is unpublished. Need to fix." % (studyTrackItemContext.studyTrackItemID))
                    currentConceptCollectionHandle = studyTrackItemContext.conceptCollectionHandle
                    if not currentConceptCollectionHandle:
                        log.warn("!!! No concept collection handle! studyTrackID: %d" % studyTrackID)
                        continue
                    ## Get the real collection context
                    context = session.query(model.RelatedArtifactsAndLevels).filter(and_(
                        model.RelatedArtifactsAndLevels.artifactTypeID == 53,
                        model.RelatedArtifactsAndLevels.publishTime != None,
                        model.RelatedArtifactsAndLevels.conceptCollectionHandle == currentConceptCollectionHandle,
                        model.RelatedArtifactsAndLevels.collectionCreatorID == studyTrackItemContext.collectionCreatorID)).first()
                    if not context:
                        log.warn("Could not find a published practice for conceptCollectionHandle[%s], collectionCreatorID[%s]" % (currentConceptCollectionHandle, studyTrackItemContext.collectionCreatorID))
                    else:
                        log.debug("Using conceptCollectionHandle[%s], collectionCreatorID[%d], id[%s], domainEID[%s]" % (context.conceptCollectionHandle, context.collectionCreatorID, context.id, context.domainEID))
                        try:
                            log.debug("Need to update: studyTrackItemID [%d -> %d] conceptCollectionHandle [%s -> %s] for studyTrackID: [%s], studyTrackItemID: [%s]" % (studyTrackItemContext.studyTrackItemID, context.id, currentConceptCollectionHandle, context.conceptCollectionHandle, studyTrackID, studyTrackItemContext.studyTrackItemID))
                            log.debug("UPDATE ArtifactRevisionRelations SET hasArtifactRevisionID = %d WHERE artifactRevisionID = %d AND hasArtifactRevisionID = %d and sequence = 1" % (context.artifact.revisions[0].id, studyTrackArtifact.revisions[0].id, studyTrackItemArtifact.revisions[0].id))
                            session.execute("UPDATE ArtifactRevisionRelations SET hasArtifactRevisionID = %d WHERE artifactRevisionID = %d AND hasArtifactRevisionID = %d and sequence = 1" % \
                                    (context.artifact.revisions[0].id, studyTrackArtifact.revisions[0].id, studyTrackItemArtifact.revisions[0].id))
                            updates += 1
                            ## Fix the StudyTrackItemContexts row as well
                            if studyTrackItemContext.studyTrackItemID != context.id:
                                try:
                                    log.debug("UPDATE StudyTrackItemContexts SET studyTrackItemID = %d WHERE studyTrackItemID = %d AND studyTrackID = %d" % (context.id, studyTrackItemContext.studyTrackItemID, studyTrackID))
                                    session.execute("UPDATE StudyTrackItemContexts SET studyTrackItemID = %d WHERE studyTrackItemID = %d AND studyTrackID = %d" % (context.id, studyTrackItemContext.studyTrackItemID, studyTrackID))
                                except Exception:
                                    errors += 1
                                    log.warn("Error updating StudyTrackItemContexts - possibly a duplicate issue.")
                            ## Get the details for re-reporting scores
                            ## Find Assignments and Groups for this studyTrackID
                            parents = session.query(model.ArtifactAndChildren, model.Assignment).filter(and_(
                                model.ArtifactAndChildren.id == model.Assignment.assignmentID,
                                model.ArtifactAndChildren.childID == studyTrackID)).all()
                            for parent in parents:
                                ## Process each assignment - get the corresponding group and get studentIDs
                                assignmentID = parent.Assignment.assignmentID
                                log.debug("UPDATE MemberStudyTrackItemStatus SET studyTrackItemID = %d WHERE assignmentID = %d and studyTrackItemID = %d" % (context.id, assignmentID, studyTrackItemID))
                                session.execute("UPDATE MemberStudyTrackItemStatus SET studyTrackItemID = %d WHERE assignmentID = %d and studyTrackItemID = %d" % (context.id, assignmentID, studyTrackItemID))
                                groupID = parent.Assignment.groupID
                                ## GEt all students for the group
                                members = session.query(model.GroupHasMembers).filter(and_(
                                    model.GroupHasMembers.groupID == groupID,
                                    model.GroupHasMembers.roleID == 14)).all()
                                studentIDs = []
                                for member in members:
                                    studentIDs.append(member.memberID)
                                if studentIDs:
                                    outputFile.write("print 'Reporting for groupID [%d], assignmentID[%d], artifactID: [%d] ...'\n" % (groupID, assignmentID, context.id))
                                    outputFile.write("ScoreReReporter().apply(kwargs={'groupID': %d, 'encodedIDs': [('artifactID', %d)], 'studentIDs': %s})\n" % (groupID, context.id, studentIDs))
                        except Exception as ie:
                            errors += 1
                            log.warn("Error updating StudyTrackItemContexts: %s" % str(ie), exc_info=ie)
        except Exception as e:
            errors += 1
            log.error(e, exc_info=e)
        finally:
            log.info("Commit:[%s]. Updates: %d Errors: %d" % (commit, updates, errors))
            print "Commit:[%s]. Updates: %d, Errors: %d" % (commit, updates, errors)
            if commit:
               session.commit()
            else:
                session.rollback()


