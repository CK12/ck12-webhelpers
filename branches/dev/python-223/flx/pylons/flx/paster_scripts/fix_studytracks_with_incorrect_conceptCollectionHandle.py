from flx.model import meta, model

from sqlalchemy import and_, text
import os
import logging

my_name = os.path.basename(__file__)
LOG_FILENAME = "/opt/2.0/log/fix_studytracks_with_incorrect_conceptCollectionHandle.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=100*1024*1024, backupCount=5)
handler.setFormatter(formatter)
log.handlers = []
log.addHandler(handler)

def run(commit=False):
    query = text("select studyTrackID, studyTrackItemID from StudyTrackItemContexts AS STIC, RelatedArtifacts AS RA, Artifacts AS A where STIC.studyTrackItemID = RA.artifactID and A.id = RA.artifactID AND STIC.conceptCollectionHandle != '' AND STIC.conceptCollectionHandle not in (select conceptCollectionHandle from RelatedArtifacts where artifactID = STIC.studyTrackItemID)")

    session = meta.Session()
    updates = 0

    studyTrackIDs = {}
    cnt = 0
    errors = 0
    total = 0
    outputFile = open("/tmp/score_rereporting.py", "w")
    outputFile.write("from assessment.views.celerytasks.scorereporter import ScoreReReporter\n")
    results = session.execute(query)
    for result in results:
        studyTrackID = result[0]
        studyTrackItemID = result[1]
        if not studyTrackID in studyTrackIDs:
            studyTrackIDs[studyTrackID] = set()
        studyTrackIDs[studyTrackID].add(studyTrackItemID)
        total += 1

    print "Processing %d rows with potential issues." % total
    totalCnt = len(studyTrackIDs.keys())
    for studyTrackID in studyTrackIDs.keys():
        try:
            session.begin()
            for studyTrackItemID in studyTrackIDs[studyTrackID]:
                cnt += 1
                log.debug("[%d/%d] Processing: studyTrackID: %d, studyTrackIDs[studyTrackID]: %s" % (cnt, totalCnt, studyTrackID, studyTrackIDs[studyTrackID]))
                print "[%d/%d] Processing: studyTrackID: %d, studyTrackIDs[studyTrackID]: %s" % (cnt, totalCnt, studyTrackID, studyTrackIDs[studyTrackID])
                studyTrackItemContexts = session.query(model.StudyTrackItemContext).filter(and_(
                    model.StudyTrackItemContext.studyTrackID == studyTrackID,
                    model.StudyTrackItemContext.studyTrackItemID == studyTrackItemID,
                    model.StudyTrackItemContext.collectionCreatorID == 3)).all()
                for studyTrackItemContext in studyTrackItemContexts:
                    ## current association
                    currentConceptCollectionHandle = studyTrackItemContext.conceptCollectionHandle
                    ## Get actual conceptCollectionHandle
                    relatedArtifactsForCollections = session.query(model.RelatedArtifact).filter(and_(
                        model.RelatedArtifact.artifactID == studyTrackItemID,
                        model.RelatedArtifact.collectionCreatorID == 3)).all()
                    matchFound = False
                    for relatedArtifact in relatedArtifactsForCollections:
                        if currentConceptCollectionHandle == relatedArtifact.conceptCollectionHandle:
                            ## All good
                            log.debug("Skipping since %s matches %s" % (currentConceptCollectionHandle, relatedArtifact.conceptCollectionHandle))
                            matchFound = True
                            break
                    if not matchFound:
                        try:
                            log.debug("Need to update [%s] with [%s] for studyTrackID: [%s], studyTrackItemID: [%s]" % (currentConceptCollectionHandle, relatedArtifact.conceptCollectionHandle, studyTrackID, studyTrackItemID))
                            session.execute("UPDATE StudyTrackItemContexts SET conceptCollectionHandle = '%s' WHERE studyTrackID = %d AND studyTrackItemID = %d AND collectionCreatorID = 3 AND conceptCollectionHandle = '%s'" % (relatedArtifact.conceptCollectionHandle, studyTrackID, studyTrackItemID, currentConceptCollectionHandle))
                            updates += 1
                            ## Get the details for re-reporting scores
                            ## Find Assignments and Groups for this studyTrackID
                            parents = session.query(model.ArtifactAndChildren, model.Assignment).filter(and_(
                                model.ArtifactAndChildren.id == model.Assignment.assignmentID,
                                model.ArtifactAndChildren.childID == studyTrackID)).all()
                            for parent in parents:
                                ## Process each assignment - get the corresponding group and get studentIDs
                                assignmentID = parent.Assignment.assignmentID
                                groupID = parent.Assignment.groupID
                                ## GEt all students for the group
                                members = session.query(model.GroupHasMembers).filter(and_(
                                    model.GroupHasMembers.groupID == groupID,
                                    model.GroupHasMembers.roleID == 14)).all()
                                studentIDs = []
                                for member in members:
                                    studentIDs.append(member.memberID)
                                if studentIDs:
                                    outputFile.write("[%d] print 'Reporting for groupID [%d], artifactID: [%d], assignmentID: [%d] ...'\n" % (cnt, groupID, studyTrackItemID, assignmentID))
                                    outputFile.write("ScoreReReporter().apply(kwargs={'groupID': %d, 'encodedIDs': [('artifactID', %d)], 'studentIDs': %s})\n" % (groupID, studyTrackItemID, studentIDs))
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

