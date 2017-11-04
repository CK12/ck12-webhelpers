import logging
import re
import time

from flx.model import meta, model
from sqlalchemy.orm import aliased, exc
from sqlalchemy.sql import func
from sqlalchemy.exc import SQLAlchemyError

def run(limit=1000, commitFixesToDataBase=False):
    LOG_FILENAME = "/tmp/fix_chapter_handles.log"
    handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=50*1024*1024, backupCount=5)
    log = logging.getLogger(__name__)
    log.setLevel(logging.DEBUG)
    log.addHandler(handler)
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
            chapterArtifactsSubQuery = session.query(meta.Artifacts.c.id, meta.Artifacts.c.handle, meta.Artifacts.c.creatorID).filter(meta.Artifacts.c.artifactTypeID==2).order_by(meta.Artifacts.c.id).offset(offset).limit(limit).subquery("chapterArtifactsSubQuery");
            chapterParentArtifactRevisionsAlias = aliased(meta.ArtifactRevisions) 
            chapterInfos = session.query(chapterArtifactsSubQuery.c.id, chapterArtifactsSubQuery.c.handle, chapterArtifactsSubQuery.c.creatorID, meta.ArtifactRevisions.c.id, meta.ArtifactRevisionRelations.c.artifactRevisionID, chapterParentArtifactRevisionsAlias.c.revision, chapterParentArtifactRevisionsAlias.c.artifactID).outerjoin(meta.ArtifactRevisions, meta.ArtifactRevisions.c.artifactID==chapterArtifactsSubQuery.c.id).outerjoin(meta.ArtifactRevisionRelations, meta.ArtifactRevisionRelations.c.hasArtifactRevisionID==meta.ArtifactRevisions.c.id).join(chapterParentArtifactRevisionsAlias, chapterParentArtifactRevisionsAlias.c.id==meta.ArtifactRevisionRelations.c.artifactRevisionID).all()

            chapterIDsList = set()
            chapterIDHandleMap = {}
            chapterIDCreatorIDMap = {}
            chapterIDRevisionIDsMap = {}
            chapterIDOriginalParentInfoMap = {}
            chapterIDParentsLastRevisionInfoMap = {}
            for chapterInfo in chapterInfos:
                chapterID = chapterInfo[0]
                chapterHandle = chapterInfo[1]
                chapterCreatorID = chapterInfo[2]
                chapterRevisionID = chapterInfo[3]

                if not chapterID in chapterIDsList:
                    chapterIDsList.add(chapterID)
                if not chapterIDHandleMap.has_key(chapterID):
                    chapterIDHandleMap[chapterID] = chapterHandle
                if not chapterIDCreatorIDMap.has_key(chapterID):
                    chapterIDCreatorIDMap[chapterID] = chapterCreatorID

                if chapterRevisionID:
                    if not chapterIDRevisionIDsMap.has_key(chapterID):
                        chapterIDRevisionIDsMap[chapterID] = set()
                    chapterIDRevisionIDsMap[chapterID].add(chapterRevisionID)

                    chapterParentRevisionID = chapterInfo[4]
                    chapterParentRevisionNO = chapterInfo[5]
                    chapterParentID = chapterInfo[6]
                    
                    if chapterParentRevisionID:                
                        if not chapterIDOriginalParentInfoMap.has_key(chapterID):
                            chapterIDOriginalParentInfoMap[chapterID] = [chapterParentRevisionID, chapterParentRevisionNO, chapterParentID]
                        else:
                            if chapterParentRevisionID < chapterIDOriginalParentInfoMap[chapterID][0]:
                                chapterIDOriginalParentInfoMap[chapterID] = [chapterParentRevisionID, chapterParentRevisionNO, chapterParentID]
                        
                        if not chapterIDParentsLastRevisionInfoMap.has_key(chapterID):
                            chapterIDParentsLastRevisionInfoMap[chapterID] = {}

                        if not chapterIDParentsLastRevisionInfoMap[chapterID].has_key(chapterParentID):
                            chapterIDParentsLastRevisionInfoMap[chapterID][chapterParentID] = [chapterParentRevisionID, chapterParentRevisionNO]
                        else:
                            if chapterParentRevisionID > chapterIDParentsLastRevisionInfoMap[chapterID][chapterParentID][0]:
                                chapterIDParentsLastRevisionInfoMap[chapterID][chapterParentID] = [chapterParentRevisionID, chapterParentRevisionNO]

            originalParentIDsList = set()
            for chapterID, chapterOriginalParentInfo in chapterIDOriginalParentInfoMap.items():
                originalParentIDsList.add(chapterOriginalParentInfo[2])
            
            originalParentInfos = meta.Session.query(meta.ArtifactRevisions.c.artifactID, func.max(meta.ArtifactRevisions.c.id)).filter(meta.ArtifactRevisions.c.artifactID.in_(originalParentIDsList)).group_by(meta.ArtifactRevisions.c.artifactID).all()
            originalParentIDLatestRevisionIDMap = {}
            for originalParentInfo in originalParentInfos:
                originalParentIDLatestRevisionIDMap[originalParentInfo[0]] = originalParentInfo[1]

            for chapterID in chapterIDsList:
                if not chapterIDRevisionIDsMap.has_key(chapterID):
                    log.info("ERROR - CHAPTER WITH ARTIFACTID : "+str(chapterID)+" DOESN'T HAVE ANY REVISION.")
                else:
                    if not chapterIDOriginalParentInfoMap.has_key(chapterID):
                        log.info(" ERROR - CHAPTER WITH ARTIFACTID : "+str(chapterID)+" HAS REVISIONS BUT NONE OF THEM IS PRESENT AS CHILD OF ANOTHER ARTIFACT EVER.")
                    else:
                        chapterHandle = chapterIDHandleMap[chapterID]
                        chapterCreatorID = chapterIDCreatorIDMap[chapterID]
                        chapterOriginalParentFirstRevisionID = chapterIDOriginalParentInfoMap[chapterID][0]
                        chapterOriginalParentFirstRevisionNO = chapterIDOriginalParentInfoMap[chapterID][1] 
                        chapterOriginalParentID = chapterIDOriginalParentInfoMap[chapterID][2]
                        chapterOriginalParentLastRevisionID = chapterIDParentsLastRevisionInfoMap[chapterID][chapterOriginalParentID][0]
                        chapterOriginalParentLastRevisionNO = chapterIDParentsLastRevisionInfoMap[chapterID][chapterOriginalParentID][1]
                        chapterOriginalParentLatestRevisionID = originalParentIDLatestRevisionIDMap[chapterOriginalParentID]
                        
                        if chapterOriginalParentLastRevisionID == chapterOriginalParentLatestRevisionID:
                            log.info("INFO - CHAPTER WITH ARTIFACTID : "+str(chapterID)+" DOESN'T NEED ANY HANDLE FIX.")
                        else:
                            if not chapterOriginalParentLastRevisionNO:
                                log.info("ERROR - CHAPTER WITH ARTIFACTID : "+str(chapterID)+" NEEDS HANDLE FIX BUT FIX CANNOT BE DONE BECAUSE OF A NULL ORIGINIAL-PARENT-LAST-REVISION-NO.")
                            else:
                                chapterSeperatorPattern = model.getChapterSeparator()
                                handleParts = re.split(chapterSeperatorPattern, chapterHandle)
                                revisionSeperatorPattern = '-::rev::-'
                                revisionParts = re.split(revisionSeperatorPattern, handleParts[0])
                                if len(revisionParts)==1:
                                    handleParts[0] = '%s%s%s' % (handleParts[0], revisionSeperatorPattern, chapterOriginalParentLastRevisionNO)
                                else:
                                    revisionParts[-1] = str(chapterOriginalParentLastRevisionNO)
                                    handleParts[0] = revisionSeperatorPattern.join(revisionParts)
                                chapterHandleAfterFix = chapterSeperatorPattern.join(handleParts)
                                
                                otherArtifactsWithSameHandleFound = True
                                sequence=1
                                while otherArtifactsWithSameHandleFound:
                                    otherArtifactsWithSameHandle = session.query(meta.Artifacts.c.id).filter(meta.Artifacts.c.artifactTypeID==2, meta.Artifacts.c.handle==chapterHandleAfterFix, meta.Artifacts.c.creatorID==chapterCreatorID).all()
                                    otherArtifactIDsWithSameHandle = [otherArtifactWithSameHandle[0] for otherArtifactWithSameHandle in otherArtifactsWithSameHandle]
                                    
                                    if otherArtifactIDsWithSameHandle and chapterID not in otherArtifactIDsWithSameHandle:
                                        chapterHandleAfterFix = chapterHandleAfterFix+'-'+str(sequence)
                                        sequence+=1
                                    else:
                                       otherArtifactsWithSameHandleFound = False 

                                if chapterHandleAfterFix == chapterHandle:
                                    log.info("INFO - CHAPTER WITH ARTIFACTID : "+str(chapterID)+"'s HANDLE FIX IS ALREADY PRESENT IN THE DATABASE.")
                                else :
                                    if commitFixesToDataBase is True:
                                        session.execute(meta.Artifacts.update().where(meta.Artifacts.c.id==chapterID).values(handle=chapterHandleAfterFix))
                                    log.info("INFO - CHAPTER WITH ARTIFACTID : "+str(chapterID)+" NEEDS HANDLE FIX. CURRENT-HANDLE : "+chapterHandle+", FIXED-HANDLE: "+chapterHandleAfterFix+", IS-FIX-COMMITED-TO-DATA-BASE : "+str(commitFixesToDataBase==True))

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