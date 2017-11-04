import logging

LOG_FILENAME = "/tmp/delete_orphan_chapters.log"
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=50*1024*1024, backupCount=5)
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
log.addHandler(handler)

import re
import time

from flx.model import meta, model
from sqlalchemy.orm import aliased, exc
from sqlalchemy.sql import func
from sqlalchemy.exc import SQLAlchemyError

def run(limit=1000, commitDeletionsToDataBase=False):
    handler.doRollover()

    processStartTime = time.time()
    session = meta.Session
    totalNumberOfChapters = 0
    try:
        session.begin()
        try:
            totalNumberOfChapters = session.query(func.count(meta.Artifacts.c.id)).filter(meta.Artifacts.c.artifactTypeID==2).one()[0]
        except exc.NoResultFound, nre:
            raise Exception((u"Total number of chapter rows could not be determined. NoResultFoundException occured - "+str(nre)).encode('utf-8'))
        except exc.MultipleResultsFound, mre:
            raise Exception((u"Total number of chapter rows could not be determined. MultipleResultsFound occured - "+str(mre)).encode('utf-8'))            
    except SQLAlchemyError, sqlae:
        session.rollback()
        raise Exception((u"Total number of chapter rows could not be determined. SQLAlchemyError occured - "+str(sqlae)).encode('utf-8'))
    except Exception, e:
        session.rollback()
        raise e
    finally:
        session.close()    
    
    print "TOTAL NUMBER OF CHAPTER ARTIFACTS FOUND : "+str(totalNumberOfChapters)
    log.info("TOTAL NUMBER OF CHAPTER ARTIFACTS FOUND : "+str(totalNumberOfChapters))
    offset = 0
    while offset <= totalNumberOfChapters:
        print
        print "STARTED PROCESSING CHAPTER CHUNK WITH START = "+str(offset)+", END = "+str(offset+limit)
        log.info("")
        log.info("STARTED PROCESSING CHAPTER CHUNK WITH START = "+str(offset)+", END = "+str(offset+limit))
        chunkStartTime = time.time()
        try:
            session.begin()
            chapterArtifactsSubQuery = session.query(meta.Artifacts.c.id).filter(meta.Artifacts.c.artifactTypeID==2).order_by(meta.Artifacts.c.id).offset(offset).limit(limit).subquery("chapterArtifactsSubQuery");
            chapterInfos = session.query(chapterArtifactsSubQuery.c.id, func.count(meta.ArtifactRevisionRelations.c.artifactRevisionID)).outerjoin(meta.ArtifactRevisions, meta.ArtifactRevisions.c.artifactID==chapterArtifactsSubQuery.c.id).outerjoin(meta.ArtifactRevisionRelations, meta.ArtifactRevisionRelations.c.hasArtifactRevisionID==meta.ArtifactRevisions.c.id).group_by(chapterArtifactsSubQuery.c.id).all()
            for chapterInfo in chapterInfos:
                chapterID = chapterInfo[0]
                chapterParentsCount = chapterInfo[1]
                if chapterParentsCount == 0:
                    if commitDeletionsToDataBase:
                        chapterArtifactRevisionIDTuples = session.query(meta.ArtifactRevisions.c.id).filter(meta.ArtifactRevisions.c.artifactID==chapterID).all();
                        chapterArtifactRevisionIDs = [chapterArtifactRevisionIDTuple[0] for chapterArtifactRevisionIDTuple in chapterArtifactRevisionIDTuples]
                        print chapterArtifactRevisionIDs
                        if chapterArtifactRevisionIDs:
                            session.execute(meta.ArtifactDraft.delete(meta.ArtifactDraft.c.artifactRevisionID.in_(chapterArtifactRevisionIDs)))
                            session.execute(meta.ArtifactRevisionHasStandards.delete(meta.ArtifactRevisionHasStandards.c.artifactRevisionID.in_(chapterArtifactRevisionIDs)))
                            session.execute(meta.ArtifactRevisionHasResources.delete(meta.ArtifactRevisionHasResources.c.artifactRevisionID.in_(chapterArtifactRevisionIDs)))
                            session.execute(meta.ArtifactRevisionRelations.delete(meta.ArtifactRevisionRelations.c.artifactRevisionID.in_(chapterArtifactRevisionIDs)))                        
                            session.execute(meta.ArtifactRevisionFavorites.delete(meta.ArtifactRevisionFavorites.c.artifactRevisionID.in_(chapterArtifactRevisionIDs)))
                            session.execute(meta.PublishRequests.delete(meta.PublishRequests.c.artifactRevisionID.in_(chapterArtifactRevisionIDs)))
                            session.execute(meta.Artifacts.update(meta.Artifacts.c.ancestorID.in_(chapterArtifactRevisionIDs)).values(ancestorID=None))
                            session.execute(meta.ArtifactRevisions.delete(meta.ArtifactRevisions.c.id.in_(chapterArtifactRevisionIDs)))
                        
                        artifactFeedbackReviewTuples = session.query(meta.ArtifactFeedbackReviews.c.id).filter(meta.ArtifactFeedbackReviews.c.artifactID==chapterID).all()
                        artifactFeedbackReviewIDs = [artifactFeedbackReviewTuple[0] for artifactFeedbackReviewTuple in artifactFeedbackReviewTuples]
                        print artifactFeedbackReviewIDs
                        if artifactFeedbackReviewIDs:
                            session.execute(meta.ArtifactFeedbackReviewAbuseReports.delete(meta.ArtifactFeedbackReviewAbuseReports.c.artifactFeedbackReviewID.in_(artifactFeedbackReviewIDs)))
                            session.execute(meta.ArtifactFeedbackReviews.delete(meta.ArtifactFeedbackReviews.c.id.in_(artifactFeedbackReviewIDs)))
                        
                        session.execute(meta.ArtifactFeedbackHelpful.delete(meta.ArtifactFeedbackHelpful.c.artifactID==chapterID))
                        session.execute(meta.ArtifactFeedbacks.delete(meta.ArtifactFeedbacks.c.artifactID==chapterID))
                        session.execute(meta.ArtifactHandles.delete(meta.ArtifactHandles.c.artifactID==chapterID))
                        session.execute(meta.ArtifactAuthors.delete(meta.ArtifactAuthors.c.artifactID==chapterID))
                        session.execute(meta.ArtifactAttributers.delete(meta.ArtifactAttributers.c.artifactID==chapterID))
                        session.execute(meta.ArtifactContributionType.delete(meta.ArtifactContributionType.c.artifactID==chapterID))
                        session.execute(meta.FeaturedArtifacts.delete(meta.FeaturedArtifacts.c.artifactID==chapterID))
                        session.execute(meta.GroupHasArtifacts.delete(meta.GroupHasArtifacts.c.artifactID==chapterID))
                        session.execute(meta.SharedArtifacts.delete(meta.SharedArtifacts.c.artifactID==chapterID))
                        session.execute(meta.MemberViewedArtifacts.delete(meta.MemberViewedArtifacts.c.artifactID==chapterID))
                        session.execute(meta.Overlays.delete(meta.Overlays.c.artifactID==chapterID))
                        session.execute(meta.ArtifactHasBrowseTerms.delete(meta.ArtifactHasBrowseTerms.c.artifactID==chapterID))
                        session.execute(meta.ArtifactHasTagTerms.delete(meta.ArtifactHasTagTerms.c.artifactID==chapterID))
                        session.execute(meta.ArtifactHasSearchTerms.delete(meta.ArtifactHasSearchTerms.c.artifactID==chapterID))
                        session.execute(meta.ArtifactFeedbackAbuseReports.delete(meta.ArtifactFeedbackAbuseReports.c.artifactID==chapterID))
                        session.execute(meta.AbuseReports.delete(meta.AbuseReports.c.artifactID==chapterID))
                        session.execute(meta.From1xBooks.delete(meta.From1xBooks.c.artifactID==chapterID))
                        session.execute(meta.From1xChapters.delete(meta.From1xChapters.c.artifactID==chapterID))
                        session.execute(meta.RelatedArtifacts.delete(meta.RelatedArtifacts.c.artifactID==chapterID))
                        session.execute(meta.Assignments.delete(meta.Assignments.c.assignmentID==chapterID))
                        session.execute(meta.MemberStudyTrackItemStatus.delete(meta.MemberStudyTrackItemStatus.c.assignmentID==chapterID))
                        session.execute(meta.MemberStudyTrackItemStatus.delete(meta.MemberStudyTrackItemStatus.c.studyTrackItemID==chapterID))

                        session.execute(meta.Artifacts.delete(meta.Artifacts.c.id==chapterID))
                    print "ERROR - AN ORPHAN CHAPTER WITH ARTIFACT-ID : "+str(chapterID)+" IS FOUND. IS-DELETE-COMMITED-TO-DATA-BASE : "+str(commitDeletionsToDataBase==True)
                    log.info("ERROR - AN ORPHAN CHAPTER WITH ARTIFACT-ID : "+str(chapterID)+" IS FOUND. IS-DELETE-COMMITED-TO-DATA-BASE : "+str(commitDeletionsToDataBase==True))
            
            session.commit()
            print "CHAPTER CHUNK PROCESSING SUCCESSFULL."
            log.info("CHAPTER CHUNK PROCESSING SUCCESSFULL.")
        except SQLAlchemyError, sqlae:
            session.rollback()
            print "CURRENT CHAPTER CHUNK PROCESSING FAILED. REASON : SQLAlchemyError - "+str(sqlae)
            log.info("CURRENT CHAPTER CHUNK PROCESSING FAILED. REASON : SQLAlchemyError - "+str(sqlae))
        except Exception, e:
            session.rollback()
            print "CURRENT CHAPTER CHUNK PROCESSING FAILED. REASON : Exception - "+str(e)
            log.info("CURRENT CHAPTER CHUNK PROCESSING FAILED. REASON : Exception - "+str(e))
        finally:
            session.close()
        
        log.info("TIME TAKEN FOR CURRENT CHAPTER CHUNK : %s seconds" %((time.time()-chunkStartTime)))
        log.info("ENDED PROCESSING CHAPTER CHUNK WITH START = "+str(offset)+", END = "+str(offset+limit))
        log.info("")
        print "TIME TAKEN FOR CURRENT CHAPTER CHUNK : %s seconds" %((time.time()-chunkStartTime))
        print "ENDED PROCESSING CHAPTER CHUNK WITH START = "+str(offset)+", END = "+str(offset+limit)
        print
        offset = offset+limit
    
    print "TOTAL TIME TAKEN FOR PROCESSING THE FOUND CHAPTER ARTIFACTS : %s minutes" %((time.time()-processStartTime)/60)
    log.info("TOTAL TIME TAKEN FOR PROCESSING THE FOUND CHAPTER ARTIFACTS : %s minutes" %((time.time()-processStartTime)/60))
    handler.close()