from flx.model import meta, model
from flx.lib import helpers as h

from sqlalchemy import and_, text
import os
import logging

my_name = os.path.basename(__file__)
LOG_FILENAME = "/opt/2.0/log/fix_studytracks_with_incorrect_practice_ids.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=100*1024*1024, backupCount=5)
handler.setFormatter(formatter)
log.handlers = []
log.addHandler(handler)

def run(commit=False, studyTrackIDs=[]):
    query = text("select A.id, A2.id from Artifacts A, ArtifactAndChildren AC, Artifacts A2  WHERE A.id = AC.id AND A.artifactTypeID = 55 AND AC.childID = A2.id and A2.artifactTypeID = 53 AND AC.childID not in (SELECT studyTrackItemID FROM StudyTrackItemContexts WHERE studyTrackID = A.id)")

    session = meta.Session()
    updates = 0

    studyTrackIDDict = {}
    cnt = 0
    errors = 0
    total = 0
    outputFile = open("/tmp/fix_studytracks_with_incorrect_practice_ids_score_rereporting.py", "w")
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
            for studyTrackItemID in studyTrackIDDict[studyTrackID]:
                cnt += 1
                log.debug("[%d/%d] Processing: studyTrackID: %d, studyTrackIDDict[studyTrackID]: %s" % (cnt, totalCnt, studyTrackID, studyTrackIDDict[studyTrackID]))
                print "[%d/%d] Processing: studyTrackID: %d, studyTrackIDDict[studyTrackID]: %s" % (cnt, totalCnt, studyTrackID, studyTrackIDDict[studyTrackID])
                studyTrackItemContext = session.query(model.StudyTrackItemContext).filter(model.StudyTrackItemContext.studyTrackID == studyTrackID).first()
                if not studyTrackItemContext or studyTrackItemContext.studyTrackItemID == studyTrackItemID:
                    log.warn("!!! Skipping - either no studyTrackItemContext exists or studyTrackItemContext.studyTrackItemID == studyTrackItemID")
                else:
                    log.debug("studyTrackItemContext.studyTrackItemID [%d] != studyTrackItemID [%d]. Need to fix." % (studyTrackItemContext.studyTrackItemID, studyTrackItemID))
                    currentConceptCollectionHandle = studyTrackItemContext.conceptCollectionHandle
                    if not currentConceptCollectionHandle:
                        log.warn("!!! No concept collection handle! studyTrackID: %d" % studyTrackID)
                        continue
                    collectionHandle, conceptCollectionAbsoluteHandle = h.splitConceptCollectionHandle(currentConceptCollectionHandle)
                    ## Get the real collection context
                    contexts = session.query(model.RelatedArtifactsAndLevels).filter(and_(
                        model.RelatedArtifactsAndLevels.id == studyTrackItemID,
                        model.RelatedArtifactsAndLevels.publishTime != None,
                        model.RelatedArtifactsAndLevels.collectionCreatorID == studyTrackItemContext.collectionCreatorID)).all()
                    chosenContext = None
                    for context in contexts:
                        chosenContext = context
                        log.debug("Checking context: %s, %s, %s" % (context.conceptCollectionHandle, context.collectionCreatorID, context.domainEID))
                        if context.conceptCollectionHandle and context.conceptCollectionHandle.startswith('%s-::-' % collectionHandle):
                            log.debug("Found match for collectionHandle: [%s]. conceptCollectionHandle: [%s]" % (collectionHandle, context.conceptCollectionHandle))
                            break
                    if not chosenContext:
                        log.warn("!!! Could not find any context to match.")
                    else:
                        log.debug("Using conceptCollectionHandle[%s], collectionCreatorID[%d], id[%s], domainEID[%s]" % (context.conceptCollectionHandle, context.collectionCreatorID, context.id, context.domainEID))
                        try:
                            log.debug("Need to update: studyTrackItemID [%d -> %d] conceptCollectionHandle [%s -> %s] for studyTrackID: [%s], studyTrackItemID: [%s]" % (studyTrackItemContext.studyTrackItemID, chosenContext.id, currentConceptCollectionHandle, chosenContext.conceptCollectionHandle, studyTrackID, studyTrackItemContext.studyTrackItemID))
                            session.execute("UPDATE StudyTrackItemContexts SET studyTrackItemID = %d, contextUrl = '', conceptCollectionHandle = '%s' WHERE studyTrackID = %d AND studyTrackItemID = %d AND collectionCreatorID = 3 AND conceptCollectionHandle = '%s'" % \
                                    (chosenContext.id, chosenContext.conceptCollectionHandle, studyTrackID, studyTrackItemContext.studyTrackItemID, currentConceptCollectionHandle))
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
                                    outputFile.write("print 'Reporting for groupID [%d], artifactID: [%d] ...'\n" % (groupID, studyTrackItemID))
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


