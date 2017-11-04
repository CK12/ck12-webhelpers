from flx.model import meta, model
from flx.lib import helpers as h
from flx.model.mongo.collectionNode import CollectionNode
from flx.model.mongo import getDB as getMongoDBConnection

from pylons import config
from sqlalchemy import and_, exc
from datetime import datetime, timedelta
import os
import logging

my_name = os.path.basename(__file__)
LOG_FILENAME = "/opt/2.0/log/migrate_selfstudy_scores.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=100*1024*1024, backupCount=5)
handler.setFormatter(formatter)
log.handlers = []
log.addHandler(handler)

LAST_ACCESS_BEFORE = '2017-07-17 00:00:00'
## Get the oldest lastAccess date for MemberStudyTrackItemStatus
OLDEST_LAST_ACCESS_DATE = '2012-05-06'

def run(memberID=None, commit=False, startDate='2017-08-05', endDate=None, maxAssignmentID=0):
    session = meta.Session()
    mongodb = getMongoDBConnection(config)
    cn = CollectionNode(mongodb)
    eidMappings = {}
    for row in session.query(model.MigratedConcept).all():
        eidMappings[row.originalEID] = row.newEID
    log.info("eidMappings.length: %d" % len(eidMappings.keys()))

    startDateDt = datetime.strptime(startDate, '%Y-%m-%d')
    oldestLastAccessDate = datetime.strptime(OLDEST_LAST_ACCESS_DATE, '%Y-%m-%d')
    if endDate:
        endDateObj = datetime.strptime(endDate, '%Y-%m-%d')
        if endDateObj > oldestLastAccessDate:
            oldestLastAccessDate = endDateObj
    inserts = 0

    ## Get Artifact types
    domainType = session.query(model.ArtifactType).filter(model.ArtifactType.name == 'domain').one()
    practiceType = session.query(model.ArtifactType).filter(model.ArtifactType.name == 'asmtpractice').one()
    loopCnt = 0
    while True:
        try:
            session.begin()
            loopCnt += 1
            if memberID and loopCnt > 1:
                ## No pagination for memberID
                print "Done for member: %d" % memberID
                break
            if not memberID:
                endDateDt = startDateDt - timedelta(days=1)
                endDateStr = endDateDt.strftime('%Y-%m-%d %H:%M:%S')
            else:
                endDateDt = None
                endDateStr = None
            startDateStr = startDateDt.strftime('%Y-%m-%d %H:%M:%S')
            ## Process assignments
            print ">>> Reverse Start date: %s, end date: %s, oldest record date: %s" % (startDateStr, endDateStr, oldestLastAccessDate.strftime('%Y-%m-%d %H:%M:%S'))
            log.info(">>> Reverse Start date: %s, end date: %s, oldest record date: %s" % (startDateStr, endDateStr, oldestLastAccessDate.strftime('%Y-%m-%d %H:%M:%S')))
            if endDateDt and oldestLastAccessDate > endDateDt:
                print "Done! Reached: %s" % oldestLastAccessDate
                log.info("Done! Reached: %s" % oldestLastAccessDate)
                break

            query = session.query(model.MemberStudyTrackItemStatus, model.Assignment, model.Artifact).filter(and_(
                model.MemberStudyTrackItemStatus.assignmentID == model.Assignment.assignmentID,
                model.MemberStudyTrackItemStatus.status == 'completed',
                model.Assignment.assignmentID == model.Artifact.id,
                model.Assignment.assignmentType == 'self-study'))
            if memberID:
                query = query.filter(model.MemberStudyTrackItemStatus.memberID == memberID)
            if maxAssignmentID:
                query = query.filter(model.MemberStudyTrackItemStatus.assignmentID <= maxAssignmentID)
            #query = query.order_by(model.Assignment.assignmentID.desc())
            if startDateDt:
                query = query.filter(model.MemberStudyTrackItemStatus.lastAccess <= startDateDt)
                if endDateDt:
                    query = query.filter(model.MemberStudyTrackItemStatus.lastAccess > endDateDt)
            rows = query.all()
            startDateDt = endDateDt
            for row in rows:
                log.info("                 ###############                     ")
                log.info(">>> CreatorID: %d, AssignmentID: %d" % (row.Artifact.creatorID, row.MemberStudyTrackItemStatus.studyTrackItemID))
                originalMemberStudyTrackItemStatus = row.MemberStudyTrackItemStatus
                ## Get the domains
                originalItemArtifact = session.query(model.Artifact).filter(model.Artifact.id == originalMemberStudyTrackItemStatus.studyTrackItemID).one()
                if originalItemArtifact:
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
                        else:
                            log.info(">>> EID [%s] does not seem to be old. No need to migrate. Just copy the row" % oldEID)
                            replacementArtifact = originalItemArtifact
                        if replacementArtifact:
                            log.info(">>> Found replacementArtifactID: %s, typeName: %s" % (replacementArtifact.id, replacementArtifact.type.name))
                            ## Need to add an entry to the new table MemberSelfStudyItemStatus
                            ## Add collection context
                            collectionNode = None
                            collectionHandle = model.BRANCH_ENCODEDID_MAPPING.get(oldCanonicalEID[:7])
                            if collectionHandle:
                                collectionNodes = cn.getByEncodedIDs(eIDs=[newEid], collectionHandle=collectionHandle, collectionCreatorID=3, publishedOnly=True, canonicalOnly=True)
                                for collectionNode in collectionNodes:
                                    break
                            else:
                                log.warn("!!! Could not find collectionHandle for EID [%s]" % oldCanonicalEID)
                            if not collectionNode:
                                collectionNodes = cn.getByEncodedIDs(eIDs=[newEid], collectionHandle=None, collectionCreatorID=3, publishedOnly=True, canonicalOnly=True)
                                for collectionNode in collectionNodes:
                                    break
                            if collectionNode:
                                score = originalMemberStudyTrackItemStatus.score if originalMemberStudyTrackItemStatus.score != None else 0
                                log.info(">>> Inserting domainID: %s, memberID: %d, conceptCollectionHandle: %s, collectionCreatorID: %d, status: %s, score: %d, lastAccess: %s" \
                                        % (replacementArtifact.id, originalMemberStudyTrackItemStatus.memberID, collectionNode['handle'], collectionNode['collection']['creatorID'], 
                                            originalMemberStudyTrackItemStatus.status, score, originalMemberStudyTrackItemStatus.lastAccess))
                                try:
                                    session.execute("INSERT IGNORE INTO MemberSelfStudyItemStatus (domainID, memberID, conceptCollectionHandle, collectionCreatorID, status, score, lastAccess) VALUES (%d, %d, '%s', %d, '%s', %d, '%s')" \
                                            % (replacementArtifact.id, originalMemberStudyTrackItemStatus.memberID, collectionNode['handle'], collectionNode['collection']['creatorID'], 
                                                originalMemberStudyTrackItemStatus.status, score, originalMemberStudyTrackItemStatus.lastAccess))
                                    inserts += 1
                                except Exception, mssise:
                                    log.warn("!!! Error inserting to MemberSelfStudyItemStatus: [%s]" % str(mssise), exc_info=mssise)
                            else:
                                log.warn("!!! No collectionNode found for domainEID: %s, collectionHandle: %s" % (newEid, collectionHandle))
                    else: ## not oldEid
                        log.warn("!!! ERROR: Could not find oldEID for artifact: %d" % originalItemArtifact.id)
                else:
                    log.warn("!!! Could not find domain artifact for studyTrackItemID: [%s]" %  originalMemberStudyTrackItemStatus.studyTrackItemID)
        except Exception as e:
            log.error(e, exc_info=e)
        finally:
            if commit:
                log.info("Commit! Inserts: %d" % inserts)
                print "Commit! Inserts: %d" % inserts
                session.commit()
            else:
                session.rollback()

