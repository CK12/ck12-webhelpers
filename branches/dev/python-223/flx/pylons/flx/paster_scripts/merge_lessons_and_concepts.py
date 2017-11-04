import logging
import time
import sys
import zlib
import sqlalchemy
import re
import datetime

from flx.model import meta, model
from flx.lib import helpers
from sqlalchemy.orm import aliased, exc
from sqlalchemy.sql import func
from sqlalchemy.exc import SQLAlchemyError

#Usage: $paster shell
#>>>from paster_scripts import merge_lessons_and_concepts
#>>>merge_lessons_and_concepts.run() / merge_lessons_and_concepts.run(memberLogins=['admin'], isPIEncrypted=False)

#memberIDs would have more precendence
def run(memberIDs=None, memberLogins=None, commitFixesToDataBase=False, isPIEncrypted=True):
    if memberIDs is None:
        memberIDs = []
    if memberLogins is None:
        memberLogins = None

    if not isinstance(memberIDs, list) or not all([isinstance(memberID, int) for memberID in memberIDs]):
         raise Exception(u"Invalid 'memberIDs' received. It should be a valid list of integers.")
    if not isinstance(memberLogins, list) or not all([isinstance(memberLogin, basestring) for memberLogin in memberLogins]):
         raise Exception(u"Invalid 'memberLogins' received. It should be a valid list of strings.")

    LOG_FILENAME = "/tmp/merge_lessons_and_concepts.log"
    handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=1000*1024*1024, backupCount=5)
    log = logging.getLogger(__name__)
    log.setLevel(logging.DEBUG)
    log.addHandler(handler)
    handler.doRollover()

    processStartTime = time.time()
    session = meta.Session
    if not memberIDs and memberLogins:
        if not isPIEncrypted:
            #model.meta has PIEncrypted Members but the data base doesn't. So, create a PIDecrypted Members instance for querying
            from sqlalchemy import MetaData
            metaMembers = sqlalchemy.Table('Members', MetaData(),  sqlalchemy.Column('id', sqlalchemy.Integer(),  primary_key=True, nullable=False), sqlalchemy.Column('login', sqlalchemy.String(255),  nullable=False), extend_existing=True)
        else:
            metaMembers = meta.Members   
        
        memberInfos = session.query(metaMembers.c.id, metaMembers.c.login).filter(metaMembers.c.login.in_(memberLogins)).all()
        memberIDs = [memberInfo[0] for memberInfo in memberInfos]
        memberLoginsFromDataBase = [memberInfo[1] for memberInfo in memberInfos]
        if len(memberLogins) != len(memberLoginsFromDataBase):
            raise Exception(u"One or more of the given memberLogins could not be found in the database."+str(set(memberLogins)-set(memberLoginsFromDataBase)))

    totalNumberOfConcepts = 0
    try:
        session.begin()
        try:
            artifactTypeInfos = session.query(meta.ArtifactTypes.c.name, meta.ArtifactTypes.c.id).filter(meta.ArtifactTypes.c.name.in_(['concept', 'lesson'])).all()
            artifactTypeNameIDMap = {}
            for artifactTypeInfo in artifactTypeInfos:
                artifactTypeName = artifactTypeInfo[0]
                artifactTypeID = artifactTypeInfo[1]
                artifactTypeNameIDMap[artifactTypeName] = artifactTypeID

            if 'concept' not in artifactTypeNameIDMap or 'lesson' not in artifactTypeNameIDMap:
                raise Exception(u"ArtifactTypeID of 'concept' / 'lesson' types could not be determined from the dataBase.")
            else:
                conceptArtifactTypeID = artifactTypeNameIDMap['concept']
                lessonArtifactTypeID = artifactTypeNameIDMap['lesson']

            totalNumberOfConceptsQuery = session.query(func.count(meta.Artifacts.c.id)).filter(meta.Artifacts.c.artifactTypeID==conceptArtifactTypeID)
            if memberIDs:
                totalNumberOfConceptsQuery = totalNumberOfConceptsQuery.filter(meta.Artifacts.c.creatorID.in_(memberIDs))
            totalNumberOfConcepts = totalNumberOfConceptsQuery.one()[0]
        except exc.NoResultFound, nre:
            raise Exception(u"Total number of concept rows could not be determined. NoResultFoundException occured - "+str(nre))
        except exc.MultipleResultsFound, mre:
            raise Exception(u"Total number of concept rows could not be determined. MultipleResultsFound occured - "+str(mre))
    except SQLAlchemyError, sqlae:
        session.rollback()
        raise Exception(u"Total number of concept rows could not be determined. SQLAlchemyError occured - "+str(sqlae))
    except Exception, e:
        session.rollback()
        raise e
    finally:
        session.close()

    print "TOTAL NUMBER OF CONCEPT ARTIFACTS FOUND : "+str(totalNumberOfConcepts)
    print 
    log.info("TOTAL NUMBER OF CONCEPT ARTIFACTS FOUND : "+str(totalNumberOfConcepts))
    log.info("")

    #Adding InteractiveEntries table def to meta
    if not hasattr(meta,'InteractiveEntries'):
        meta.InteractiveEntries = sqlalchemy.Table('InteractiveEntries', meta.meta, sqlalchemy.Column('artifactRevisionID', sqlalchemy.Integer(), sqlalchemy.ForeignKey('ArtifactRevisions.id', name='InteractiveEntries_ibfk_4'), nullable=False))
        print "InteractiveEntries table definition added to meta."
        log.info("InteractiveEntries table definition added to meta.")
        
    #Adding the contentBackup table to meta
    if not hasattr(meta,'ArtifactRevisionContentBackup'):
        meta.ArtifactRevisionContentBackup = sqlalchemy.Table('ArtifactRevisionContentBackup', meta.meta, sqlalchemy.Column('artifactRevisionID', sqlalchemy.Integer(), primary_key=True, autoincrement=False), sqlalchemy.Column('artifactRevisionType', sqlalchemy.String(16), nullable=False), sqlalchemy.Column('resourceID', sqlalchemy.Integer(), primary_key=True, autoincrement=False), sqlalchemy.Column('resourceURI', sqlalchemy.String(128), nullable=False), sqlalchemy.Column('resourceOwnerID', sqlalchemy.Integer(), nullable=False), sqlalchemy.Column('resourceRevisionID', sqlalchemy.Integer(), nullable=False), sqlalchemy.Column('resourceRevisionNo', sqlalchemy.Integer(), primary_key=True, autoincrement=False), sqlalchemy.Column('contents', sqlalchemy.BLOB(), nullable=True))
        print "ArtifactRevisionContentBackup table definition added to meta."
        log.info("ArtifactRevisionContentBackup table definition added to meta.")

    #creating /verifying ArtifactRevisionContentBackup in the dataBase
    meta.ArtifactRevisionContentBackup.create(meta.engine, checkfirst=True)
    print "ArtifactRevisionContentBackup table definition is made sure to be present in the dataBase."
    log.info("ArtifactRevisionContentBackup table definition is made sure to be present in the dataBase.")

    offset = 0
    noOfSuccessfullyDeletedConcepts = 0
    parentChildContentResourceMap = {}
    while offset < totalNumberOfConcepts:
        print
        print "STARTED PROCESSING CONCEPT CHUNK WITH START = "+str(offset)+", END = "+str(offset+1)
        log.info("")
        log.info("STARTED PROCESSING CONCEPT CHUNK WITH START = "+str(offset)+", END = "+str(offset+1))
        chunkStartTime = time.time()
        try:
            session.begin()
            effectiveOffset = offset - noOfSuccessfullyDeletedConcepts if commitFixesToDataBase else offset
            conceptArtifactsSubQuery = session.query(meta.Artifacts.c.id).filter(meta.Artifacts.c.artifactTypeID==conceptArtifactTypeID)
            if memberIDs:
              conceptArtifactsSubQuery = conceptArtifactsSubQuery.filter(meta.Artifacts.c.creatorID.in_(memberIDs))
            conceptArtifactsSubQuery = conceptArtifactsSubQuery.order_by(meta.Artifacts.c.id).offset(effectiveOffset).limit(1).subquery("conceptArtifactsSubQuery")
            conceptParentArtifactRevisionsAlias = aliased(meta.ArtifactRevisions)
            conceptParentArtifactAlias = aliased(meta.Artifacts)
            conceptInfos = session.query(conceptArtifactsSubQuery.c.id, meta.ArtifactRevisions.c.id, conceptParentArtifactRevisionsAlias.c.id, conceptParentArtifactRevisionsAlias.c.artifactID, conceptParentArtifactAlias.c.artifactTypeID).outerjoin(meta.ArtifactRevisions, meta.ArtifactRevisions.c.artifactID==conceptArtifactsSubQuery.c.id).outerjoin(meta.ArtifactRevisionRelations, meta.ArtifactRevisions.c.id==meta.ArtifactRevisionRelations.c.hasArtifactRevisionID).outerjoin(conceptParentArtifactRevisionsAlias, conceptParentArtifactRevisionsAlias.c.id==meta.ArtifactRevisionRelations.c.artifactRevisionID).outerjoin(conceptParentArtifactAlias, conceptParentArtifactRevisionsAlias.c.artifactID==conceptParentArtifactAlias.c.id).all()
            conceptIDParentIDsMap = {}
            conceptRevisionIDParentRevisionIDsMap = {}
            for conceptInfo in conceptInfos:
                conceptID = conceptInfo[0]
                conceptRevisionID = conceptInfo[1]
                conceptRevisionParentRevisionID = conceptInfo[2]
                conceptRevisionParentID = conceptInfo[3]
                conceptRevisionParentTypeID = conceptInfo[4]
                if conceptID:
                    if conceptID not in conceptIDParentIDsMap:
                        conceptIDParentIDsMap[conceptID] = set([])
                    if conceptRevisionParentID and conceptRevisionParentTypeID==lessonArtifactTypeID:
                        conceptIDParentIDsMap.get(conceptID).add(conceptRevisionParentID)
                if conceptRevisionID:
                    if conceptRevisionID not in conceptRevisionIDParentRevisionIDsMap:
                        conceptRevisionIDParentRevisionIDsMap[conceptRevisionID] = set([])
                    if conceptRevisionParentRevisionID and conceptRevisionParentTypeID==lessonArtifactTypeID:
                        conceptRevisionIDParentRevisionIDsMap.get(conceptRevisionID).add(conceptRevisionParentRevisionID)

            conceptIDs = conceptIDParentIDsMap.keys()
            conceptParentIDs = [conceptParentID for conceptParentIDSet in conceptIDParentIDsMap.values() for conceptParentID in conceptParentIDSet]
            conceptRevisionIDs = conceptRevisionIDParentRevisionIDsMap.keys()
            conceptRevisionParentRevisionIDs = [conceptRevisionParentRevisionID for conceptRevisionParentRevisionIDSet in conceptRevisionIDParentRevisionIDsMap.values() for conceptRevisionParentRevisionID in conceptRevisionParentRevisionIDSet]
            if conceptIDs:
                if conceptRevisionIDs:
                    #artifactRevision level Initializations
                    conceptRevisionParentRevisionIDContentsPostMap = {}
                    conceptRevisionParentRevisionIDCoverImagesPostMap = {}
                    conceptRevisionParentRevisionIDAttachmentsPostMap = {}
                    contentRevisionsToDelete = set([])
                    contentsToDelete = set([])
                    artifactRevisionHasResourceRevisionsToDelete = set([])
                    resourceRevisionsToDelete = set([])
                    resourcesToDelete = set([])
                    artifactRevisionContentBackupsToDelete = set([])
                    artifactRevisionHasResourceRevisionsToInsert = []
                    artifactRevisionContentBackupsToInsert = {}
                    artifactRevisionHasStandardsToInsert = []

                    ###ArtifactRevison level information exraction##
                    if conceptRevisionParentRevisionIDs:
                        #extracting conceptParents
                        conceptRevisionParentRevisionLatestConceptInfoMap = {}
                        conceptRevisionParentRevisionLatestConceptInfos = session.query(meta.ArtifactRevisionRelations.c.artifactRevisionID, meta.ArtifactRevisionRelations.c.hasArtifactRevisionID, meta.ArtifactRevisionRelations.c.sequence).filter(meta.ArtifactRevisionRelations.c.artifactRevisionID.in_(conceptRevisionParentRevisionIDs)).all()
                        for conceptRevisionParentRevisionLatestConceptInfo in conceptRevisionParentRevisionLatestConceptInfos:
                            if conceptRevisionParentRevisionLatestConceptInfo[0] not in conceptRevisionParentRevisionLatestConceptInfoMap:
                                conceptRevisionParentRevisionLatestConceptInfoMap[conceptRevisionParentRevisionLatestConceptInfo[0]] = (conceptRevisionParentRevisionLatestConceptInfo[1], conceptRevisionParentRevisionLatestConceptInfo[2])
                            else:
                                if conceptRevisionParentRevisionLatestConceptInfoMap[conceptRevisionParentRevisionLatestConceptInfo[0]][1] > conceptRevisionParentRevisionLatestConceptInfo[2]:
                                    conceptRevisionParentRevisionLatestConceptInfoMap[conceptRevisionParentRevisionLatestConceptInfo[0]] = (conceptRevisionParentRevisionLatestConceptInfo[1], conceptRevisionParentRevisionLatestConceptInfo[2])
                        for conceptRevisionID in conceptRevisionIDParentRevisionIDsMap:
                            conceptRevisionIDParentRevisionIDsMap[conceptRevisionID] = filter(lambda conceptRevisionParentRevisionID:conceptRevisionParentRevisionLatestConceptInfoMap.get(conceptRevisionParentRevisionID)[0] == conceptRevisionID, conceptRevisionIDParentRevisionIDsMap[conceptRevisionID])
                        conceptRevisionParentRevisionIDs = [conceptRevisionParentRevisionID for conceptRevisionParentRevisionIDSet in conceptRevisionIDParentRevisionIDsMap.values() for conceptRevisionParentRevisionID in conceptRevisionParentRevisionIDSet]

                        #conceptRevisionParentRevisionInfos
                        conceptRevisionParentRevisionContentResourceContentInfosMap = {}
                        conceptRevisionParentRevisionOtherResourceInfosMap = {}
                        conceptRevisionParentRevisionStandardIDsMap = {}
                        conceptRevisionParentRevisionIDsChunks = [conceptRevisionParentRevisionIDs[x:x + len(conceptRevisionParentRevisionIDs)] for x in xrange(0, len(conceptRevisionParentRevisionIDs), len(conceptRevisionParentRevisionIDs))]
                        for conceptRevisionParentRevisionIDsChunk in conceptRevisionParentRevisionIDsChunks:
                            #resourceRelatedInfos
                            conceptRevisionParentRevisionResourceInfos = session.query(meta.ArtifactRevisionHasResources.c.artifactRevisionID, meta.ArtifactRevisionHasResources.c.resourceRevisionID, meta.ResourceRevisions.c.revision, meta.Resources.c.id, meta.Resources.c.uri, meta.Resources.c.ownerID, meta.ResourceTypes.c.name, meta.Contents.c.contents, meta.Contents.c.compressed).filter(meta.ArtifactRevisionHasResources.c.artifactRevisionID.in_(conceptRevisionParentRevisionIDsChunk)).join(meta.ResourceRevisions, meta.ResourceRevisions.c.id == meta.ArtifactRevisionHasResources.c.resourceRevisionID).join(meta.Resources, meta.Resources.c.id==meta.ResourceRevisions.c.resourceID).join(meta.ResourceTypes, meta.ResourceTypes.c.id==meta.Resources.c.resourceTypeID).outerjoin(meta.Contents, sqlalchemy.and_(meta.Contents.c.contentRevisionID==meta.ResourceRevisions.c.revision, meta.Contents.c.resourceURI==meta.Resources.c.uri, meta.Contents.c.ownerID==meta.Resources.c.ownerID)).all()
                            for conceptRevisionParentRevisionResourceInfo in conceptRevisionParentRevisionResourceInfos:
                                conceptRevisionParentRevisionID = conceptRevisionParentRevisionResourceInfo[0]
                                conceptRevisionParentRevisionResourceRevisionID = conceptRevisionParentRevisionResourceInfo[1]
                                conceptRevisionParentRevisionResourceRevisionRevision = conceptRevisionParentRevisionResourceInfo[2]
                                conceptRevisionParentRevisionResourceID = conceptRevisionParentRevisionResourceInfo[3]
                                conceptRevisionParentRevisionResourceURI = conceptRevisionParentRevisionResourceInfo[4]
                                conceptRevisionParentRevisionResourceOwnerID = conceptRevisionParentRevisionResourceInfo[5]
                                conceptRevisionParentRevisionResourceType = conceptRevisionParentRevisionResourceInfo[6]
                                conceptRevisionParentRevisionContentResourceContents = conceptRevisionParentRevisionResourceInfo[7]
                                conceptRevisionParentRevisionContentResourceIsCompressed = conceptRevisionParentRevisionResourceInfo[8]

                                if conceptRevisionParentRevisionResourceType == 'contents':
                                    if conceptRevisionParentRevisionContentResourceIsCompressed and conceptRevisionParentRevisionContentResourceContents:
                                        try:
                                            conceptRevisionParentRevisionContentResourceContents = zlib.decompress(conceptRevisionParentRevisionContentResourceContents)
                                        except (Exception) as e:
                                            raise Exception(u"ERROR - Not able to process conceptIDs : "+str(conceptIDs)+" as an exception with an errorMessage: "+str(e)+" occured while trying to decompress the contents of conceptRevisionParentRevisionID: "+str(conceptRevisionParentRevisionID) +", conceptRevisionParentRevisionResourceRevisionID:"+str(conceptRevisionParentRevisionResourceRevisionID)+ " .\n contentsFound: " + str(conceptRevisionParentRevisionContentResourceContents).encode('utf-8'))
                                    
                                    if not conceptRevisionParentRevisionContentResourceContents:
                                        if not conceptRevisionParentRevisionResourceRevisionRevision:
                                            conceptRevisionParentRevisionResourceRevisionRevision=1
                                        conceptRevisionParentRevisionContentResourceActualContentsInfos = session.query(meta.Contents.c.contentRevisionID, meta.Contents.c.contents, meta.Contents.c.compressed).filter(sqlalchemy.and_(meta.Contents.c.resourceURI==conceptRevisionParentRevisionResourceURI, meta.Contents.c.ownerID==conceptRevisionParentRevisionResourceOwnerID)).order_by(sqlalchemy.desc(meta.Contents.c.contentRevisionID)).limit(1).offset(int(conceptRevisionParentRevisionResourceRevisionRevision) - 1).all()
                                        
                                        """if not conceptRevisionParentRevisionContentResourceActualContentsInfos:
                                            conceptRevisionParentRevisionResourceRevisionRevision=1
                                            conceptRevisionParentRevisionContentResourceActualContentsInfos = session.query(meta.Contents.c.contentRevisionID, meta.Contents.c.contents, meta.Contents.c.compressed).filter(sqlalchemy.and_(meta.Contents.c.resourceURI==conceptRevisionParentRevisionResourceURI, meta.Contents.c.ownerID==conceptRevisionParentRevisionResourceOwnerID)).order_by(sqlalchemy.desc(meta.Contents.c.contentRevisionID)).limit(1).offset(int(conceptRevisionParentRevisionResourceRevisionRevision) - 1).all()"""

                                        if conceptRevisionParentRevisionContentResourceActualContentsInfos:
                                            conceptRevisionParentRevisionContentResourceActualContentsInfo = conceptRevisionParentRevisionContentResourceActualContentsInfos[0]
                                            
                                            conceptRevisionParentRevisionResourceRevisionActualRevision = conceptRevisionParentRevisionContentResourceActualContentsInfo[0]
                                            conceptRevisionParentRevisionContentResourceActualContents = conceptRevisionParentRevisionContentResourceActualContentsInfo[1]
                                            conceptRevisionParentRevisionContentResourceActualIsCompressed = conceptRevisionParentRevisionContentResourceActualContentsInfo[2]
                                            if conceptRevisionParentRevisionContentResourceActualIsCompressed and conceptRevisionParentRevisionContentResourceActualContents:
                                                try:
                                                    conceptRevisionParentRevisionContentResourceActualContents = zlib.decompress(conceptRevisionParentRevisionContentResourceActualContents)
                                                except (Exception) as e:
                                                    raise Exception(u"ERROR - Not able to process conceptIDs : "+str(conceptIDs)+" as an exception with an errorMessage: "+str(e)+" occured while trying to decompress the contents of conceptRevisionParentRevisionID: "+str(conceptRevisionParentRevisionID) +", conceptRevisionParentRevisionResourceRevisionID:"+str(conceptRevisionParentRevisionResourceRevisionID)+ " .\n contentsFound: " + str(conceptRevisionParentRevisionContentResourceActualContents).encode('utf-8'))

                                            if conceptRevisionParentRevisionContentResourceActualContents:
                                                contentRevisionsToDelete.add(conceptRevisionParentRevisionResourceRevisionRevision)
                                                contentsToDelete.add((conceptRevisionParentRevisionResourceRevisionRevision, conceptRevisionParentRevisionResourceURI, conceptRevisionParentRevisionResourceOwnerID))
                               
                                                conceptRevisionParentRevisionContentResourceContents = conceptRevisionParentRevisionContentResourceActualContents
                                                conceptRevisionParentRevisionResourceRevisionRevision = str(conceptRevisionParentRevisionResourceRevisionActualRevision)
                                          
                                    if conceptRevisionParentRevisionContentResourceContents:
                                        conceptStartXHTML = "<!-- Begin inserted XHTML \[CONCEPT: .*\] -->"
                                        conceptEndXHTML = "<!-- End inserted XHTML \[CONCEPT: .*\] -->"
                                        conceptStartXHTML = re.search(conceptStartXHTML, conceptRevisionParentRevisionContentResourceContents)
                                        conceptEndXHTML = re.search(conceptEndXHTML, conceptRevisionParentRevisionContentResourceContents)
                                        if conceptStartXHTML and conceptEndXHTML:
                                            conceptRevisionParentRevisionContentResourceContents = conceptRevisionParentRevisionContentResourceContents[:conceptStartXHTML.start()]+"""<div class="x-ck12-data-concept"><!--<concept />--></div>"""+conceptRevisionParentRevisionContentResourceContents[conceptEndXHTML.end():]
                               
                                    if conceptRevisionParentRevisionContentResourceContents and conceptRevisionParentRevisionID not in conceptRevisionParentRevisionContentResourceContentInfosMap:
                                        conceptRevisionParentRevisionContentResourceContentInfosMap[conceptRevisionParentRevisionID] = (conceptRevisionParentRevisionContentResourceContents, conceptRevisionParentRevisionResourceRevisionID, conceptRevisionParentRevisionResourceRevisionRevision, conceptRevisionParentRevisionResourceID, conceptRevisionParentRevisionResourceURI, conceptRevisionParentRevisionResourceOwnerID)
                                    else:
                                        if conceptRevisionParentRevisionContentResourceContents and conceptRevisionParentRevisionResourceRevisionID > conceptRevisionParentRevisionContentResourceContentInfosMap[conceptRevisionParentRevisionID][1]:
                                            conceptRevisionParentRevisionResourceRevisionRevisionToDelete = conceptRevisionParentRevisionContentResourceContentInfosMap[conceptRevisionParentRevisionID][2]
                                            conceptRevisionParentRevisionResourceURIToDelete = conceptRevisionParentRevisionContentResourceContentInfosMap[conceptRevisionParentRevisionID][4]
                                            conceptRevisionParentRevisionResourceOwnerIDToDelete = conceptRevisionParentRevisionContentResourceContentInfosMap[conceptRevisionParentRevisionID][5]
                                            conceptRevisionParentRevisionResourceRevisionIDToDelete = conceptRevisionParentRevisionContentResourceContentInfosMap[conceptRevisionParentRevisionID][1]
                                            conceptRevisionParentRevisionResourceIDToDelete = conceptRevisionParentRevisionContentResourceContentInfosMap[conceptRevisionParentRevisionID][3]
                                            conceptRevisionParentRevisionContentResourceContentsToDelete = conceptRevisionParentRevisionContentResourceContentInfosMap[conceptRevisionParentRevisionID][0]

                                            conceptRevisionParentRevisionContentResourceContentInfosMap[conceptRevisionParentRevisionID] = (conceptRevisionParentRevisionContentResourceContents, conceptRevisionParentRevisionResourceRevisionID, conceptRevisionParentRevisionResourceRevisionRevision, conceptRevisionParentRevisionResourceID, conceptRevisionParentRevisionResourceURI, conceptRevisionParentRevisionResourceOwnerID)

                                            contentRevisionsToDelete.add(conceptRevisionParentRevisionResourceRevisionRevisionToDelete)
                                            contentsToDelete.add((conceptRevisionParentRevisionResourceRevisionRevisionToDelete, conceptRevisionParentRevisionResourceURIToDelete, conceptRevisionParentRevisionResourceOwnerIDToDelete))
                                            artifactRevisionHasResourceRevisionsToDelete.add((conceptRevisionParentRevisionID, conceptRevisionParentRevisionResourceRevisionIDToDelete))
                                            resourceRevisionsToDelete.add(conceptRevisionParentRevisionResourceRevisionIDToDelete)
                                            resourcesToDelete.add(conceptRevisionParentRevisionResourceIDToDelete)
                                            artifactRevisionContentBackupsToDelete.add((conceptRevisionParentRevisionID, conceptRevisionParentRevisionResourceIDToDelete, conceptRevisionParentRevisionResourceRevisionRevisionToDelete))
                                            artifactRevisionContentBackupsToInsert[(conceptRevisionParentRevisionID, conceptRevisionParentRevisionResourceIDToDelete, conceptRevisionParentRevisionResourceRevisionRevisionToDelete)]={'artifactRevisionID':conceptRevisionParentRevisionID, 'artifactRevisionType':'parent', 'resourceID':conceptRevisionParentRevisionResourceIDToDelete, 'resourceURI':conceptRevisionParentRevisionResourceURIToDelete, 'resourceOwnerID':conceptRevisionParentRevisionResourceOwnerIDToDelete, 'resourceRevisionID':conceptRevisionParentRevisionResourceRevisionIDToDelete, 'resourceRevisionNo':conceptRevisionParentRevisionResourceRevisionRevisionToDelete, 'contents':conceptRevisionParentRevisionContentResourceContentsToDelete}
                                        else:
                                            contentRevisionsToDelete.add(conceptRevisionParentRevisionResourceRevisionRevision)
                                            contentsToDelete.add((conceptRevisionParentRevisionResourceRevisionRevision, conceptRevisionParentRevisionResourceURI, conceptRevisionParentRevisionResourceOwnerID))
                                            artifactRevisionHasResourceRevisionsToDelete.add((conceptRevisionParentRevisionID, conceptRevisionParentRevisionResourceRevisionID))
                                            resourceRevisionsToDelete.add(conceptRevisionParentRevisionResourceRevisionID)
                                            resourcesToDelete.add(conceptRevisionParentRevisionResourceID)
                                            artifactRevisionContentBackupsToDelete.add((conceptRevisionParentRevisionID, conceptRevisionParentRevisionResourceID, conceptRevisionParentRevisionResourceRevisionRevision))
                                            artifactRevisionContentBackupsToInsert[(conceptRevisionParentRevisionID, conceptRevisionParentRevisionResourceID, conceptRevisionParentRevisionResourceRevisionRevision)]={'artifactRevisionID':conceptRevisionParentRevisionID, 'artifactRevisionType':'parent', 'resourceID':conceptRevisionParentRevisionResourceID, 'resourceURI':conceptRevisionParentRevisionResourceURI, 'resourceOwnerID':conceptRevisionParentRevisionResourceOwnerID, 'resourceRevisionID':conceptRevisionParentRevisionResourceRevisionID, 'resourceRevisionNo':conceptRevisionParentRevisionResourceRevisionRevision, 'contents':conceptRevisionParentRevisionContentResourceContents}                                        
                                else:
                                    if conceptRevisionParentRevisionID not in conceptRevisionParentRevisionOtherResourceInfosMap:
                                        conceptRevisionParentRevisionOtherResourceInfosMap[conceptRevisionParentRevisionID] = set([conceptRevisionParentRevisionResourceRevisionID])
                                    else:
                                        conceptRevisionParentRevisionOtherResourceInfosMap.get(conceptRevisionParentRevisionID).add(conceptRevisionParentRevisionResourceRevisionID)

                            #standardRelatedInfos
                            conceptRevisionParentRevisionStandardInfos = session.query(meta.ArtifactRevisionHasStandards.c.artifactRevisionID, meta.ArtifactRevisionHasStandards.c.standardID).filter(meta.ArtifactRevisionHasStandards.c.artifactRevisionID.in_(conceptRevisionParentRevisionIDsChunk)).all()
                            for conceptRevisionParentRevisionStandardInfo in conceptRevisionParentRevisionStandardInfos:
                                conceptRevisionParentRevisionID = conceptRevisionParentRevisionStandardInfo[0]
                                conceptRevisionParentRevisionStandardID = conceptRevisionParentRevisionStandardInfo[1]
                                if conceptRevisionParentRevisionID not in conceptRevisionParentRevisionStandardIDsMap:
                                    conceptRevisionParentRevisionStandardIDsMap[conceptRevisionParentRevisionID] = []
                                conceptRevisionParentRevisionStandardIDsMap[conceptRevisionParentRevisionID].append(conceptRevisionParentRevisionStandardID)

                        #Calculate the contentXHTML, attachments & coverImage for every parentRevision (For Verification)
                        conceptRevisionParentRevisionIDContentsPreMap = {}
                        conceptRevisionParentRevisionIDCoverImagesPreMap = {}
                        conceptRevisionParentRevisionIDAttachmentsPreMap = {}
                        conceptRevisionParentRevisionDOs = session.query(model.ArtifactRevision).filter(model.ArtifactRevision.id.in_(conceptRevisionParentRevisionIDs)).all()
                        for conceptRevisionParentRevisionDO in conceptRevisionParentRevisionDOs:
                            conceptRevisionParentRevisionIDContentsPreMap[conceptRevisionParentRevisionDO.id] = conceptRevisionParentRevisionDO.getXhtml(includeChildContent=True, considerContentResourceOnly=True, resolveChildConceptContent=True, considerMultipleContentResources=True)
                            conceptRevisionParentRevisionIDCoverImagesPreMap[conceptRevisionParentRevisionDO.id] = set([])
                            conceptRevisionParentRevisionIDAttachmentsPreMap[conceptRevisionParentRevisionDO.id] = set([])
                            for conceptRevisionParentRevisionResourceRevisionDO in conceptRevisionParentRevisionDO.resourceRevisions:
                                if conceptRevisionParentRevisionResourceRevisionDO.resource and conceptRevisionParentRevisionResourceRevisionDO.resource.isAttachment:
                                    conceptRevisionParentRevisionIDAttachmentsPreMap[conceptRevisionParentRevisionDO.id].add(conceptRevisionParentRevisionResourceRevisionDO.id)
                                if conceptRevisionParentRevisionResourceRevisionDO.resource and conceptRevisionParentRevisionResourceRevisionDO.resource.type and conceptRevisionParentRevisionResourceRevisionDO.resource.type.name == 'cover page':
                                    conceptRevisionParentRevisionIDCoverImagesPreMap[conceptRevisionParentRevisionDO.id].add(conceptRevisionParentRevisionResourceRevisionDO.id)
                        
                    conceptRevisionContentResourceContentInfosMap = {}
                    conceptRevisionOtherResourceInfosMap = {}
                    conceptRevisionStandardIDsMap = {}
                    conceptRevisionIDsChunks = [conceptRevisionIDs[x:x + len(conceptRevisionIDs)] for x in xrange(0, len(conceptRevisionIDs), len(conceptRevisionIDs))]
                    for conceptRevisionIDsChunk in conceptRevisionIDsChunks:
                        #resourceRelatedInfos
                        conceptRevisionResourceInfos = session.query(meta.ArtifactRevisionHasResources.c.artifactRevisionID, meta.ArtifactRevisionHasResources.c.resourceRevisionID, meta.ResourceRevisions.c.revision, meta.Resources.c.id, meta.Resources.c.uri, meta.Resources.c.ownerID, meta.ResourceTypes.c.name, meta.Contents.c.contents, meta.Contents.c.compressed, meta.Resources.c.isAttachment).filter(meta.ArtifactRevisionHasResources.c.artifactRevisionID.in_(conceptRevisionIDsChunk)).join(meta.ResourceRevisions, meta.ResourceRevisions.c.id == meta.ArtifactRevisionHasResources.c.resourceRevisionID).join(meta.Resources, meta.Resources.c.id==meta.ResourceRevisions.c.resourceID).join(meta.ResourceTypes, meta.ResourceTypes.c.id==meta.Resources.c.resourceTypeID).outerjoin(meta.Contents, sqlalchemy.and_(meta.Contents.c.contentRevisionID==meta.ResourceRevisions.c.revision, meta.Contents.c.resourceURI==meta.Resources.c.uri, meta.Contents.c.ownerID==meta.Resources.c.ownerID)).all()
                        for conceptRevisionResourceInfo in conceptRevisionResourceInfos:
                            conceptRevisionID = conceptRevisionResourceInfo[0]
                            conceptRevisionResourceRevisionID = conceptRevisionResourceInfo[1]
                            conceptRevisionResourceRevisionRevision = conceptRevisionResourceInfo[2]
                            conceptRevisionResourceID = conceptRevisionResourceInfo[3]
                            conceptRevisionResourceURI = conceptRevisionResourceInfo[4]
                            conceptRevisionResourceOwnerID = conceptRevisionResourceInfo[5]
                            conceptRevisionResourceType = conceptRevisionResourceInfo[6]
                            conceptRevisionContentResourceContents = conceptRevisionResourceInfo[7]
                            conceptRevisionContentResourceIsCompressed = conceptRevisionResourceInfo[8]
                            conceptRevisionResourceIsAttachment = conceptRevisionResourceInfo[9]
                            
                            if conceptRevisionResourceType == 'contents':
                                if conceptRevisionContentResourceIsCompressed and conceptRevisionContentResourceContents:
                                    try:
                                        conceptRevisionContentResourceContents = zlib.decompress(conceptRevisionContentResourceContents)
                                    except (Exception) as e:
                                        raise Exception(u"ERROR - Not able to process conceptIDs : "+str(conceptIDs)+" as an exception with an errorMessage: "+str(e)+" occured while trying to decompress the contents of conceptRevisionID: "+str(conceptRevisionID) +", conceptRevisionResourceRevisionID:"+str(conceptRevisionResourceRevisionID)+ " .\n contentsFound: " + str(conceptRevisionContentResourceContents).encode('utf-8'))
                                
                                if not conceptRevisionContentResourceContents:
                                    if not conceptRevisionResourceRevisionRevision:
                                        conceptRevisionResourceRevisionRevision=1
                                    conceptRevisionContentResourceActualContentsInfos = session.query(meta.Contents.c.contentRevisionID, meta.Contents.c.contents, meta.Contents.c.compressed).filter(sqlalchemy.and_(meta.Contents.c.resourceURI==conceptRevisionResourceURI, meta.Contents.c.ownerID==conceptRevisionResourceOwnerID)).order_by(sqlalchemy.desc(meta.Contents.c.contentRevisionID)).limit(1).offset(int(conceptRevisionResourceRevisionRevision) - 1).all()
                                    
                                    """if not conceptRevisionContentResourceActualContentsInfos:
                                        conceptRevisionResourceRevisionRevision=1
                                        conceptRevisionContentResourceActualContentsInfos = session.query(meta.Contents.c.contentRevisionID, meta.Contents.c.contents, meta.Contents.c.compressed).filter(sqlalchemy.and_(meta.Contents.c.resourceURI==conceptRevisionResourceURI, meta.Contents.c.ownerID==conceptRevisionResourceOwnerID)).order_by(sqlalchemy.desc(meta.Contents.c.contentRevisionID)).limit(1).offset(int(conceptRevisionResourceRevisionRevision) - 1).all()"""

                                    if conceptRevisionContentResourceActualContentsInfos:
                                        conceptRevisionContentResourceActualContentsInfo = conceptRevisionContentResourceActualContentsInfos[0]
                                        
                                        conceptRevisionResourceRevisionActualRevision = conceptRevisionContentResourceActualContentsInfo[0]
                                        conceptRevisionContentResourceActualContents = conceptRevisionContentResourceActualContentsInfo[1]
                                        conceptRevisionContentResourceActualIsCompressed = conceptRevisionContentResourceActualContentsInfo[2]
                                        if conceptRevisionContentResourceActualIsCompressed and conceptRevisionContentResourceActualContents:
                                            try:
                                                conceptRevisionContentResourceActualContents = zlib.decompress(conceptRevisionContentResourceActualContents)
                                            except (Exception) as e:
                                                raise Exception(u"ERROR - Not able to process conceptIDs : "+str(conceptIDs)+" as an exception with an errorMessage: "+str(e)+" occured while trying to decompress the contents of conceptRevisionID: "+str(conceptRevisionID) +", conceptRevisionResourceRevisionID:"+str(conceptRevisionResourceRevisionID)+ " .\n contentsFound: " + str(conceptRevisionContentResourceActualContents).encode('utf-8'))

                                        if conceptRevisionContentResourceActualContents:
                                            contentRevisionsToDelete.add(conceptRevisionResourceRevisionRevision)
                                            contentsToDelete.add((conceptRevisionResourceRevisionRevision, conceptRevisionResourceURI, conceptRevisionResourceOwnerID))
                           
                                            conceptRevisionContentResourceContents = conceptRevisionContentResourceActualContents
                                            conceptRevisionResourceRevisionRevision = str(conceptRevisionResourceRevisionActualRevision)
                                
                                """if conceptRevisionContentResourceContents:
                                    conceptStartXHTML = "<!-- Begin inserted XHTML \[CONCEPT: .*\] -->"
                                    conceptEndXHTML = "<!-- End inserted XHTML \[CONCEPT: .*\] -->"
                                    conceptStartXHTML = re.search(conceptStartXHTML, conceptRevisionContentResourceContents)
                                    conceptEndXHTML = re.search(conceptEndXHTML, conceptRevisionContentResourceContents)
                                    if conceptStartXHTML and conceptEndXHTML:
                                        conceptRevisionContentResourceContents = conceptRevisionContentResourceContents[:conceptStartXHTML.start()]+\"""<div class="x-ck12-data-concept"><!--<concept />--></div>\"""+conceptRevisionContentResourceContents[conceptEndXHTML.end():]"""
                                                                   
                                if conceptRevisionContentResourceContents and conceptRevisionID not in conceptRevisionContentResourceContentInfosMap:
                                    conceptRevisionContentResourceContentInfosMap[conceptRevisionID] = (conceptRevisionContentResourceContents, conceptRevisionResourceRevisionID, conceptRevisionResourceRevisionRevision, conceptRevisionResourceID, conceptRevisionResourceURI, conceptRevisionResourceOwnerID)
                                else:
                                    if conceptRevisionContentResourceContents and conceptRevisionResourceRevisionID > conceptRevisionContentResourceContentInfosMap[conceptRevisionID][1]:
                                        conceptRevisionResourceRevisionRevisionToDelete = conceptRevisionContentResourceContentInfosMap[conceptRevisionID][2]
                                        conceptRevisionResourceURIToDelete = conceptRevisionContentResourceContentInfosMap[conceptRevisionID][4]
                                        conceptRevisionResourceOwnerIDToDelete = conceptRevisionContentResourceContentInfosMap[conceptRevisionID][5]
                                        conceptRevisionResourceRevisionIDToDelete = conceptRevisionContentResourceContentInfosMap[conceptRevisionID][1]
                                        conceptRevisionResourceIDToDelete = conceptRevisionContentResourceContentInfosMap[conceptRevisionID][3]
                                        conceptRevisionContentResourceContentsToDelete = conceptRevisionContentResourceContentInfosMap[conceptRevisionID][0]

                                        conceptRevisionContentResourceContentInfosMap[conceptRevisionID] = (conceptRevisionContentResourceContents, conceptRevisionResourceRevisionID, conceptRevisionResourceRevisionRevision, conceptRevisionResourceID, conceptRevisionResourceURI, conceptRevisionResourceOwnerID)

                                        contentRevisionsToDelete.add(conceptRevisionResourceRevisionRevisionToDelete)
                                        contentsToDelete.add((conceptRevisionResourceRevisionRevisionToDelete, conceptRevisionResourceURIToDelete, conceptRevisionResourceOwnerIDToDelete))
                                        resourceRevisionsToDelete.add(conceptRevisionResourceRevisionIDToDelete)
                                        resourcesToDelete.add(conceptRevisionResourceIDToDelete)
                                        artifactRevisionContentBackupsToDelete.add((conceptRevisionID, conceptRevisionResourceIDToDelete, conceptRevisionResourceRevisionRevisionToDelete))
                                        artifactRevisionContentBackupsToInsert[(conceptRevisionID, conceptRevisionResourceIDToDelete, conceptRevisionResourceRevisionRevisionToDelete)]={'artifactRevisionID':conceptRevisionID, 'artifactRevisionType':'concept', 'resourceID':conceptRevisionResourceIDToDelete, 'resourceURI':conceptRevisionResourceURIToDelete, 'resourceOwnerID':conceptRevisionResourceOwnerIDToDelete, 'resourceRevisionID':conceptRevisionResourceRevisionIDToDelete, 'resourceRevisionNo':conceptRevisionResourceRevisionRevisionToDelete, 'contents':conceptRevisionContentResourceContentsToDelete}
                                    else:
                                        contentRevisionsToDelete.add(conceptRevisionResourceRevisionRevision)
                                        contentsToDelete.add((conceptRevisionResourceRevisionRevision, conceptRevisionResourceURI, conceptRevisionResourceOwnerID))
                                        resourceRevisionsToDelete.add(conceptRevisionResourceRevisionID)
                                        resourcesToDelete.add(conceptRevisionResourceID)
                                        artifactRevisionContentBackupsToDelete.add((conceptRevisionID, conceptRevisionResourceID, conceptRevisionResourceRevisionRevision))
                                        artifactRevisionContentBackupsToInsert[(conceptRevisionID, conceptRevisionResourceID, conceptRevisionResourceRevisionRevision)]={'artifactRevisionID':conceptRevisionID, 'artifactRevisionType':'concept', 'resourceID':conceptRevisionResourceID, 'resourceURI':conceptRevisionResourceURI, 'resourceOwnerID':conceptRevisionResourceOwnerID, 'resourceRevisionID':conceptRevisionResourceRevisionID, 'resourceRevisionNo':conceptRevisionResourceRevisionRevision, 'contents':conceptRevisionContentResourceContents}         
                            elif conceptRevisionResourceType != 'cover page' and not conceptRevisionResourceIsAttachment:
                                if conceptRevisionID not in conceptRevisionOtherResourceInfosMap:
                                    conceptRevisionOtherResourceInfosMap[conceptRevisionID] = set([conceptRevisionResourceRevisionID])
                                else:
                                    conceptRevisionOtherResourceInfosMap.get(conceptRevisionID).add(conceptRevisionResourceRevisionID)
                            else:
                                resourceRevisionsToDelete.add(conceptRevisionResourceRevisionID)
                                resourcesToDelete.add(conceptRevisionResourceID)
                        
                        #standardRelatedInfos
                        conceptRevisionStandardInfos = session.query(meta.ArtifactRevisionHasStandards.c.artifactRevisionID, meta.ArtifactRevisionHasStandards.c.standardID).filter(meta.ArtifactRevisionHasStandards.c.artifactRevisionID.in_(conceptRevisionIDsChunk)).all()
                        for conceptRevisionStandardInfo in conceptRevisionStandardInfos:
                            conceptRevisionID = conceptRevisionStandardInfo[0]
                            conceptRevisionStandardID = conceptRevisionStandardInfo[1]
                            if conceptRevisionID not in conceptRevisionStandardIDsMap:
                                conceptRevisionStandardIDsMap[conceptRevisionID] = []
                            conceptRevisionStandardIDsMap[conceptRevisionID].append(conceptRevisionStandardID)

                    #Migrate and delete the resource related data
                    for conceptRevisionID in conceptRevisionIDs:
                        addConceptRevisionRelatedInfoToDeleteLists = True
                        conceptRevisionParentRevisionIDs = conceptRevisionIDParentRevisionIDsMap[conceptRevisionID]
                        
                        #Handle the content resources
                        if conceptRevisionID in conceptRevisionContentResourceContentInfosMap and conceptRevisionContentResourceContentInfosMap[conceptRevisionID][0]:
                            conceptRevisionContentResourceContentInfo = conceptRevisionContentResourceContentInfosMap[conceptRevisionID]
                            conceptRevisionContentResourceContents = conceptRevisionContentResourceContentInfo[0]
                            conceptRevisionContentResourceRevisionID = conceptRevisionContentResourceContentInfo[1]
                            conceptRevisionContentResourceRevisionRevision = conceptRevisionContentResourceContentInfo[2]
                            conceptRevisionContentResourceID = conceptRevisionContentResourceContentInfo[3]
                            conceptRevisionContentResourceURI = conceptRevisionContentResourceContentInfo[4]
                            conceptRevisionContentResourceOwnerID = conceptRevisionContentResourceContentInfo[5]
                            childContentResourceIdentifier = (conceptRevisionContentResourceRevisionRevision, conceptRevisionContentResourceURI, conceptRevisionContentResourceOwnerID)

                            for conceptRevisionParentRevisionID in conceptRevisionParentRevisionIDs:
                                if conceptRevisionParentRevisionID not in conceptRevisionParentRevisionContentResourceContentInfosMap:
                                    addConceptRevisionRelatedInfoToDeleteLists = False
                                    if {'artifactRevisionID':conceptRevisionParentRevisionID, 'resourceRevisionID':conceptRevisionContentResourceRevisionID} not in artifactRevisionHasResourceRevisionsToInsert:
                                        artifactRevisionHasResourceRevisionsToInsert.append({'artifactRevisionID':conceptRevisionParentRevisionID, 'resourceRevisionID':conceptRevisionContentResourceRevisionID})
                                    conceptRevisionParentRevisionContentResourceContents = None
                                    conceptRevisionParentRevisionContentResourceRevisionID = conceptRevisionContentResourceRevisionID
                                    conceptRevisionParentRevisionContentResourceRevisionRevision = conceptRevisionContentResourceRevisionRevision
                                    conceptRevisionParentRevisionContentResourceID = conceptRevisionContentResourceID
                                    conceptRevisionParentRevisionContentResourceURI = conceptRevisionContentResourceURI
                                    conceptRevisionParentRevisionContentResourceOwnerID = conceptRevisionContentResourceOwnerID
                                else:
                                    conceptRevisionParentRevisionContentResourceContentInfo = conceptRevisionParentRevisionContentResourceContentInfosMap[conceptRevisionParentRevisionID]
                                    conceptRevisionParentRevisionContentResourceContents = conceptRevisionParentRevisionContentResourceContentInfo[0]
                                    conceptRevisionParentRevisionContentResourceRevisionID = conceptRevisionParentRevisionContentResourceContentInfo[1]
                                    conceptRevisionParentRevisionContentResourceRevisionRevision = conceptRevisionParentRevisionContentResourceContentInfo[2]
                                    conceptRevisionParentRevisionContentResourceID = conceptRevisionParentRevisionContentResourceContentInfo[3]
                                    conceptRevisionParentRevisionContentResourceURI = conceptRevisionParentRevisionContentResourceContentInfo[4]
                                    conceptRevisionParentRevisionContentResourceOwnerID = conceptRevisionParentRevisionContentResourceContentInfo[5]
                                    parentContentResourceIdentifier = (conceptRevisionParentRevisionContentResourceRevisionRevision, conceptRevisionParentRevisionContentResourceURI, conceptRevisionParentRevisionContentResourceOwnerID)
                                    if parentChildContentResourceMap.get(parentContentResourceIdentifier) and parentChildContentResourceMap.get(parentContentResourceIdentifier) != (childContentResourceIdentifier, conceptRevisionID):
                                        artifactRevisionHasResourceRevisionsToDelete.add((conceptRevisionParentRevisionID, conceptRevisionParentRevisionContentResourceRevisionID))

                                        currentConceptRevisionParentRevisionContentResourceContentRevisonDO = session.query(model.ContentRevision).get(int(conceptRevisionParentRevisionContentResourceRevisionRevision))
                                        newConceptRevisionParentRevisionContentResourceContentRevisonDO = model.ContentRevision(creationTime=currentConceptRevisionParentRevisionContentResourceContentRevisonDO.creationTime, log="NEW_CONTENT_RESOURCE_CREATION_FOR_REPLACING_SHARED_CONTENT_RESOURCE_IN_PARENTS_LESSON_CONCEPT_MERGE_PARENT_ARTIFACT_RESVISION_ID_"+str(conceptRevisionParentRevisionID))
                                        session.add(newConceptRevisionParentRevisionContentResourceContentRevisonDO)
                                        session.flush()
                                        
                                        currentConceptRevisionParentRevisionContentResourceContentDO = session.query(model.Content).get((conceptRevisionParentRevisionContentResourceURI, conceptRevisionParentRevisionContentResourceOwnerID, conceptRevisionParentRevisionContentResourceRevisionRevision))
                                        newConceptRevisionParentRevisionContentResourceContentDO = model.Content(resourceURI=conceptRevisionParentRevisionContentResourceURI, ownerID=conceptRevisionParentRevisionContentResourceOwnerID, contentRevisionID=newConceptRevisionParentRevisionContentResourceContentRevisonDO.id, creationTime=currentConceptRevisionParentRevisionContentResourceContentDO.creationTime, contents=currentConceptRevisionParentRevisionContentResourceContentDO.contents, checksum=currentConceptRevisionParentRevisionContentResourceContentDO.checksum, compressed=currentConceptRevisionParentRevisionContentResourceContentDO.compressed)
                                        session.add(newConceptRevisionParentRevisionContentResourceContentDO)
                                        
                                        currentConceptRevisionParentRevisionContentResourceRevisionDO = session.query(model.ResourceRevision).get(conceptRevisionParentRevisionContentResourceRevisionID)
                                        newConceptRevisionParentRevisionContentResourceRevisionDO = model.ResourceRevision(resourceID=conceptRevisionParentRevisionContentResourceID, revision=newConceptRevisionParentRevisionContentResourceContentRevisonDO.id, hash=currentConceptRevisionParentRevisionContentResourceRevisionDO.hash, creationTime=currentConceptRevisionParentRevisionContentResourceRevisionDO.creationTime, filesize=currentConceptRevisionParentRevisionContentResourceRevisionDO.filesize, publishTime=currentConceptRevisionParentRevisionContentResourceRevisionDO.publishTime)
                                        session.add(newConceptRevisionParentRevisionContentResourceRevisionDO)
                                        
                                        session.flush()
                                        
                                        conceptRevisionParentRevisionContentResourceRevisionID = newConceptRevisionParentRevisionContentResourceRevisionDO.id
                                        conceptRevisionParentRevisionContentResourceRevisionRevision = newConceptRevisionParentRevisionContentResourceRevisionDO.revision
                                        
                                        if {'artifactRevisionID':conceptRevisionParentRevisionID, 'resourceRevisionID':conceptRevisionParentRevisionContentResourceRevisionID} not in artifactRevisionHasResourceRevisionsToInsert:
                                            artifactRevisionHasResourceRevisionsToInsert.append({'artifactRevisionID':conceptRevisionParentRevisionID, 'resourceRevisionID':conceptRevisionParentRevisionContentResourceRevisionID})
                                    else:
                                        parentChildContentResourceMap[parentContentResourceIdentifier] = (childContentResourceIdentifier, conceptRevisionID)
                                
                                if not conceptRevisionParentRevisionContentResourceContents:
                                    conceptRevisionParentRevisionContentResourceContents = """<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"><html xmlns="http://www.w3.org/1999/xhtml"><head><title></title></head><body><div class="x-ck12-data-concept"><!--<concept />--></div><div class="x-ck12-data-problem-set"></div><div class="x-ck12-data-vocabulary"></div></body></html>"""
                                
                                if "<body>" not in conceptRevisionParentRevisionContentResourceContents or "</body>" not in conceptRevisionParentRevisionContentResourceContents[conceptRevisionParentRevisionContentResourceContents.index("<body>")+6:]:
                                    if "</head>" in conceptRevisionParentRevisionContentResourceContents:
                                        headTagClosingIndex = conceptRevisionParentRevisionContentResourceContents.index("</head>")+7
                                    else:
                                        headTagClosingIndex = 0;
                                    conceptRevisionParentRevisionContentResourceContents = conceptRevisionParentRevisionContentResourceContents[:headTagClosingIndex]+'<body><div class="x-ck12-data-concept"><!--<concept />--></div><div class="x-ck12-data-problem-set"></div><div class="x-ck12-data-vocabulary"></div></body>'+conceptRevisionParentRevisionContentResourceContents[headTagClosingIndex:]
                                
                                if '<div class="x-ck12-data-concept">' in conceptRevisionParentRevisionContentResourceContents and "</div>" in conceptRevisionParentRevisionContentResourceContents[conceptRevisionParentRevisionContentResourceContents.index('<div class="x-ck12-data-concept">')+33:]:
                                    parentContentDivStartingIndex = conceptRevisionParentRevisionContentResourceContents.index('<div class="x-ck12-data-concept">')
                                    parentContentDivEndingIndex = parentContentDivStartingIndex+conceptRevisionParentRevisionContentResourceContents[parentContentDivStartingIndex:].index('</div>')+6
                                    
                                    if "<body>" in conceptRevisionContentResourceContents :
                                        conceptBodyStartingIndex = conceptRevisionContentResourceContents.index("<body>")+6
                                        if "</body>" in conceptRevisionContentResourceContents[conceptBodyStartingIndex:]:
                                            conceptBodyEndingIndex = conceptBodyStartingIndex+conceptRevisionContentResourceContents[conceptBodyStartingIndex:].index("</body>")
                                        else:
                                            conceptBodyEndingIndex = len(conceptRevisionContentResourceContents)
                                    else:
                                        conceptBodyStartingIndex = 0
                                        conceptBodyEndingIndex = len(conceptRevisionContentResourceContents)

                                    conceptRevisionParentRevisionContentResourceContents = conceptRevisionParentRevisionContentResourceContents[:parentContentDivStartingIndex]+'\n<!-- Begin inserted XHTML [CONCEPT: '+str(conceptRevisionID)+'] -->\n'+conceptRevisionContentResourceContents[conceptBodyStartingIndex:conceptBodyEndingIndex]+'\n<!-- End inserted XHTML [CONCEPT: '+str(conceptRevisionID)+'] -->\n'+conceptRevisionParentRevisionContentResourceContents[parentContentDivEndingIndex:]
                                else:
                                    conceptRevisionParentRevisionContentResourceContents = helpers.processLessonXhtmlForWrappingInContentComments(conceptRevisionParentRevisionContentResourceContents)
                                
                                conceptRevisionParentRevisionContentResourceContentsUnCompressed = conceptRevisionParentRevisionContentResourceContents
                                conceptRevisionParentRevisionContentResourceIsCompressed = 0
                                try:
                                    conceptRevisionParentRevisionContentResourceContents = zlib.compress(conceptRevisionParentRevisionContentResourceContents)
                                    conceptRevisionParentRevisionContentResourceIsCompressed = 1
                                except (Exception) as e:
                                    raise Exception(u"ERROR - Not able to process conceptIDs : "+str(conceptIDs)+" as an exception with errorMessage: "+str(e)+" occured while trying to compress the merged contents of conceptRevisionID: "+str(conceptRevisionID) +", conceptRevisionContentResourceRevisionID:"+str(conceptRevisionContentResourceRevisionID)+ " and conceptRevisionParentRevisionID: "+str(conceptRevisionParentRevisionID)+", conceptRevisionParentRevisionContentResourceRevisionID: "+str(conceptRevisionParentRevisionContentResourceRevisionID)+".\n mergedContents: " + str(conceptRevisionParentRevisionContentResourceContents).encode('utf-8'))

                                #Update the current parentRevisionContentResource with the updated content
                                session.execute(meta.Contents.update().where(sqlalchemy.and_(meta.Contents.c.contentRevisionID==conceptRevisionParentRevisionContentResourceRevisionRevision, meta.Contents.c.resourceURI==conceptRevisionParentRevisionContentResourceURI, meta.Contents.c.ownerID==conceptRevisionParentRevisionContentResourceOwnerID)).values({meta.Contents.c.contents:conceptRevisionParentRevisionContentResourceContents, meta.Contents.c.compressed:conceptRevisionParentRevisionContentResourceIsCompressed}))
                                conceptRevisionParentRevisionIDContentsPostMap[conceptRevisionParentRevisionID] = conceptRevisionParentRevisionContentResourceContentsUnCompressed
                        
                            #Add the conceptRevisionContentResourceContentRevision and conceptRevisionContentResourceContent rowse to the delete list
                            if addConceptRevisionRelatedInfoToDeleteLists:
                                if conceptRevisionContentResourceRevisionRevision:
                                    contentRevisionsToDelete.add(conceptRevisionContentResourceRevisionRevision)
                                if conceptRevisionContentResourceRevisionRevision and conceptRevisionContentResourceURI and conceptRevisionContentResourceOwnerID:
                                    contentsToDelete.add((conceptRevisionContentResourceRevisionRevision, conceptRevisionContentResourceURI, conceptRevisionContentResourceOwnerID))
                                if conceptRevisionContentResourceRevisionID:
                                    resourceRevisionsToDelete.add(conceptRevisionContentResourceRevisionID)
                                if conceptRevisionContentResourceID:
                                    resourcesToDelete.add(conceptRevisionContentResourceID)
                        else:
                            #concept with no content resource - just ignore and update the contentValidationDict
                            for conceptRevisionParentRevisionID in conceptRevisionParentRevisionIDs:
                                if conceptRevisionParentRevisionID in conceptRevisionParentRevisionContentResourceContentInfosMap:
                                    conceptRevisionParentRevisionIDContentsPostMap[conceptRevisionParentRevisionID] = helpers.processLessonXhtmlForWrappingInContentComments(conceptRevisionParentRevisionContentResourceContentInfosMap.get(conceptRevisionParentRevisionID)[0])

                        #Handle all other resources
                        if conceptRevisionID in conceptRevisionOtherResourceInfosMap:
                            conceptRevisionOtherResourceRevisionIDs = conceptRevisionOtherResourceInfosMap.get(conceptRevisionID)
                            for conceptRevisionParentRevisionID in conceptRevisionParentRevisionIDs:
                                conceptRevisionParentRevisionOtherResourceRevisionIDs =  conceptRevisionParentRevisionOtherResourceInfosMap.get(conceptRevisionParentRevisionID) if conceptRevisionParentRevisionID in conceptRevisionParentRevisionOtherResourceInfosMap else set([])
                                conceptRevisionParentRevisionOtherResourceRevisionIDs = conceptRevisionOtherResourceRevisionIDs - conceptRevisionParentRevisionOtherResourceRevisionIDs
                                
                                artifactRevisionHasResourcesForParent = [{'artifactRevisionID':conceptRevisionParentRevisionID, 'resourceRevisionID':conceptRevisionParentRevisionOtherResourceRevisionID} for conceptRevisionParentRevisionOtherResourceRevisionID in conceptRevisionParentRevisionOtherResourceRevisionIDs]
                                for artifactRevisionHasResourceForParent in artifactRevisionHasResourcesForParent:
                                    if artifactRevisionHasResourceForParent not in artifactRevisionHasResourceRevisionsToInsert:
                                        artifactRevisionHasResourceRevisionsToInsert.append(artifactRevisionHasResourceForParent)
                    
                    #Migrate and delete the standard related information
                    for conceptRevisionID in conceptRevisionIDs:
                        if conceptRevisionID in conceptRevisionStandardIDsMap:
                            conceptRevisionParentRevisionIDs = conceptRevisionIDParentRevisionIDsMap[conceptRevisionID]
                            conceptRevisionStandardIDs  = conceptRevisionStandardIDsMap[conceptRevisionID]
                            for conceptRevisionParentRevisionID in conceptRevisionParentRevisionIDs:
                                if conceptRevisionParentRevisionID in conceptRevisionParentRevisionStandardIDsMap:
                                    conceptRevisionParentRevisionStandardIDs = conceptRevisionParentRevisionStandardIDsMap[conceptRevisionParentRevisionID]
                                else:
                                    conceptRevisionParentRevisionStandardIDs = []

                                conceptRevisionParentRevisionStandardIDsToBeAdded = set(conceptRevisionStandardIDs) - set(conceptRevisionParentRevisionStandardIDs)
                                for conceptRevisionParentRevisionStandardIDToBeAdded in conceptRevisionParentRevisionStandardIDsToBeAdded:
                                    artifactRevisionHasStandardsToInsert.append({'artifactRevisionID':conceptRevisionParentRevisionID, 'standardID':conceptRevisionParentRevisionStandardIDToBeAdded})
                        else:
                            #Just ignore. We encountered a conceptRevision with no standards. :P
                            pass

                    
                    #ArtifactRevision level dataBase migration handline
                    #Manipulate & Migrate The Resources side of the Entity Graph.
                    if artifactRevisionHasResourceRevisionsToInsert:
                        session.execute(meta.ArtifactRevisionHasResources.insert(), artifactRevisionHasResourceRevisionsToInsert)

                    #Effectively migrating the standards information
                    if artifactRevisionHasStandardsToInsert:
                        session.execute(meta.ArtifactRevisionHasStandards.insert(), artifactRevisionHasStandardsToInsert)

                    #deleting the ArtifactRevisionResourceRevisionMappings for the additional contents present in parents and also the mappings in parents where we are replacing the contentResource with a new resource since exiting contentResource is being shared between 2 parents with 2 different concept children. (not the actual conceptRevisionResourceRevisionMappings)
                    if artifactRevisionHasResourceRevisionsToDelete:
                        artifactRevisionHasResourceRevisionFilters = [sqlalchemy.and_(meta.ArtifactRevisionHasResources.c.artifactRevisionID==artifactRevisionHasResourceRevisionToDelete[0], meta.ArtifactRevisionHasResources.c.resourceRevisionID==artifactRevisionHasResourceRevisionToDelete[1]) for artifactRevisionHasResourceRevisionToDelete in artifactRevisionHasResourceRevisionsToDelete]
                        session.execute(meta.ArtifactRevisionHasResources.delete().where(sqlalchemy.or_(*artifactRevisionHasResourceRevisionFilters)))

                    resourceRevisionsAttachedToOtherArtifactRevisions = set([])
                    if resourceRevisionsToDelete:
                        resourceRevisionsAttachedToOtherArtifactRevisionInfos = session.query(meta.ArtifactRevisionHasResources.c.resourceRevisionID).filter(meta.ArtifactRevisionHasResources.c.resourceRevisionID.in_(resourceRevisionsToDelete)).all()
                        resourceRevisionsAttachedToOtherArtifactRevisions = set([resourceRevisionsAttachedToOtherArtifactRevisionInfo[0] for resourceRevisionsAttachedToOtherArtifactRevisionInfo in resourceRevisionsAttachedToOtherArtifactRevisionInfos])
                        resourceRevisionsToDelete = resourceRevisionsToDelete - resourceRevisionsAttachedToOtherArtifactRevisions

                    resourcesAttachedToOtherArtifactRevisions = set([])
                    if resourcesToDelete:
                        resourcesAttachedToOtherArtifactRevisionInfosQuery = session.query(meta.ResourceRevisions.c.resourceID).filter(meta.ResourceRevisions.c.resourceID.in_(resourcesToDelete))
                        if resourceRevisionsToDelete:
                            resourcesAttachedToOtherArtifactRevisionInfosQuery = resourcesAttachedToOtherArtifactRevisionInfosQuery.filter(~meta.ResourceRevisions.c.id.in_(resourceRevisionsToDelete))
                        resourcesAttachedToOtherArtifactRevisionInfos = resourcesAttachedToOtherArtifactRevisionInfosQuery.all()
                        resourcesAttachedToOtherArtifactRevisions = set([resourcesAttachedToOtherArtifactRevisionInfo[0] for resourcesAttachedToOtherArtifactRevisionInfo in resourcesAttachedToOtherArtifactRevisionInfos])
                        resourcesToDelete = resourcesToDelete - resourcesAttachedToOtherArtifactRevisions

                    resourceRevisionNosAttachedToOtherArtifactRevisions = set([])     
                    if resourceRevisionsAttachedToOtherArtifactRevisions:
                        resourceRevisionNosAttachedToOtherArtifactRevisionInfos = session.query(meta.ResourceRevisions.c.revision).filter(meta.ResourceRevisions.c.id.in_(resourceRevisionsAttachedToOtherArtifactRevisions)).all()
                        resourceRevisionNosAttachedToOtherArtifactRevisions = set([resourceRevisionNosAttachedToOtherArtifactRevisionInfo[0] for resourceRevisionNosAttachedToOtherArtifactRevisionInfo in resourceRevisionNosAttachedToOtherArtifactRevisionInfos])
                    
                    resourceOwnerIDUrisAttachedToOtherArtifactRevisions = set([])
                    if resourcesAttachedToOtherArtifactRevisions:
                        resourceOwnerIDUrisAttachedToOtherArtifactRevisionInfos = session.query(meta.Resources.c.ownerID, meta.Resources.c.uri).filter(meta.Resources.c.id.in_(resourcesAttachedToOtherArtifactRevisions)).all()
                        resourceOwnerIDUrisAttachedToOtherArtifactRevisions = set(resourceOwnerIDUrisAttachedToOtherArtifactRevisionInfos)

                    if contentsToDelete:
                        actualContentsToDelete = set([])
                        for contentToDelete in contentsToDelete:
                            if not (((contentToDelete[2], contentToDelete[1]) in resourceOwnerIDUrisAttachedToOtherArtifactRevisions) and (contentToDelete[0] in resourceRevisionNosAttachedToOtherArtifactRevisions)):
                                actualContentsToDelete.add(contentToDelete)

                        if actualContentsToDelete:
                            contentFilters = [sqlalchemy.and_(meta.Contents.c.contentRevisionID==conceptRevisionContentResourceContentToDelete[0], meta.Contents.c.resourceURI==conceptRevisionContentResourceContentToDelete[1], meta.Contents.c.ownerID==conceptRevisionContentResourceContentToDelete[2]) for conceptRevisionContentResourceContentToDelete in actualContentsToDelete]
                            session.execute(meta.Contents.delete().where(sqlalchemy.or_(*contentFilters)))

                    if contentRevisionsToDelete:
                        contentRevisionsAttachedToOtherContentInfos = session.query(meta.Contents.c.contentRevisionID).filter(meta.Contents.c.contentRevisionID.in_(contentRevisionsToDelete)).all()
                        contentRevisionsAttachedToOtherContents = set([str(contentRevisionsAttachedToOtherContentInfo[0]) for contentRevisionsAttachedToOtherContentInfo in contentRevisionsAttachedToOtherContentInfos])
                        contentRevisionsToDelete = contentRevisionsToDelete - contentRevisionsAttachedToOtherContents
                        if contentRevisionsToDelete:
                            session.execute(meta.ContentRevisions.delete().where(meta.ContentRevisions.c.id.in_(contentRevisionsToDelete)))
                    
                    if resourceRevisionsToDelete:
                        session.execute(meta.ResourceRevisions.delete().where(meta.ResourceRevisions.c.id.in_(resourceRevisionsToDelete)))
                     
                    if resourcesToDelete:
                        resourcesAttachedToOtherContentInfos = session.query(meta.Resources.c.id).filter(meta.Resources.c.id.in_(resourcesToDelete)).join(meta.Contents, sqlalchemy.and_(meta.Contents.c.resourceURI==meta.Resources.c.uri, meta.Contents.c.ownerID==meta.Resources.c.ownerID)).all()
                        resourcesAttachedToOtherContents = set([resourcesAttachedToOtherContentInfo[0] for resourcesAttachedToOtherContentInfo in resourcesAttachedToOtherContentInfos])
                        resourcesToDelete = resourcesToDelete - resourcesAttachedToOtherContents
                        if resourcesToDelete:
                            session.execute(meta.Resources.delete().where(meta.Resources.c.id.in_(resourcesToDelete)))

                    actualArtifactRevisionContentBackupsToInsert = []
                    artifactRevisionContentBackupsToInsert = artifactRevisionContentBackupsToInsert.values()
                    for artifactRevisionContentBackupToInsert in artifactRevisionContentBackupsToInsert:
                        if not (((artifactRevisionContentBackupToInsert['resourceOwnerID'], artifactRevisionContentBackupToInsert['resourceURI']) in resourceOwnerIDUrisAttachedToOtherArtifactRevisions) and (artifactRevisionContentBackupToInsert['resourceRevisionNo'] in resourceRevisionNosAttachedToOtherArtifactRevisions)):
                            if artifactRevisionContentBackupToInsert not in actualArtifactRevisionContentBackupsToInsert:
                                actualArtifactRevisionContentBackupsToInsert.append(artifactRevisionContentBackupToInsert)  
                        else:
                            artifactRevisionContentBackupsToDelete.remove((artifactRevisionContentBackupToInsert['artifactRevisionID'], artifactRevisionContentBackupToInsert['resourceID'], artifactRevisionContentBackupToInsert['resourceRevisionNo']))
                    
                    if artifactRevisionContentBackupsToDelete:
                        artifactRevisionContentBackupsFilters = [sqlalchemy.and_(meta.ArtifactRevisionContentBackup.c.artifactRevisionID==artifactRevisionContentBackupToDelete[0], meta.ArtifactRevisionContentBackup.c.resourceID==artifactRevisionContentBackupToDelete[1], meta.ArtifactRevisionContentBackup.c.resourceRevisionNo==artifactRevisionContentBackupToDelete[2]) for artifactRevisionContentBackupToDelete in artifactRevisionContentBackupsToDelete]
                        session.execute(meta.ArtifactRevisionContentBackup.delete().where(sqlalchemy.or_(*artifactRevisionContentBackupsFilters)))

                    if actualArtifactRevisionContentBackupsToInsert:
                        session.execute(meta.ArtifactRevisionContentBackup.insert(), actualArtifactRevisionContentBackupsToInsert)

                    #ArtifactRevisionDependents
                        #CASCADE ON DELETE: (Currently just letting the CASCADE delete them. Any change??)
                            #ArtifactDrafts
                            #ArtifactRevisionHasStandards
                            #ArtifactRevisionRelations (From both sides)
                            #ArtifactRevisionHasResources (ArtifactRevisionHasResourceRevisions) (Additional contents for parents are being removed seperately)
                    
                        #UPDATE TO NULL ON DELETE:   
                            #Artifacts (ancestorID)
                    
                        #NO ACTION ON DELETE: (Currently just deleting them manually below. Any change??)
                            #ArtifactRevisionFavorites
                            #InteractiveEntries
                            #PublishRequests
                    session.execute(meta.InteractiveEntries.delete().where(meta.InteractiveEntries.c.artifactRevisionID.in_(conceptRevisionIDs)))         
                    session.execute(meta.ArtifactRevisionFavorites.delete().where(meta.ArtifactRevisionFavorites.c.artifactRevisionID.in_(conceptRevisionIDs)))
                    session.execute(meta.PublishRequests.delete().where(meta.PublishRequests.c.artifactRevisionID.in_(conceptRevisionIDs)))
                    session.execute(meta.ArtifactRevisions.delete().where(meta.ArtifactRevisions.c.id.in_(conceptRevisionIDs)))

                    #Now since all the DB migration related to ArtifactRevision has already happened
                    #Calculate the contentXHTML, attachments & coverImage for every parentRevision (Verification)
                    conceptRevisionParentRevisionIDs = [conceptRevisionParentRevisionID for conceptRevisionParentRevisionIDSet in conceptRevisionIDParentRevisionIDsMap.values() for conceptRevisionParentRevisionID in conceptRevisionParentRevisionIDSet]                    
                    if conceptRevisionParentRevisionIDs:
                        conceptRevisionParentRevisionResourceInfos = session.query(meta.ArtifactRevisionHasResources.c.artifactRevisionID, meta.ArtifactRevisionHasResources.c.resourceRevisionID, meta.Resources.c.isAttachment, meta.ResourceTypes.c.name).filter(meta.ArtifactRevisionHasResources.c.artifactRevisionID.in_(conceptRevisionParentRevisionIDs)).join(meta.ResourceRevisions, meta.ArtifactRevisionHasResources.c.resourceRevisionID == meta.ResourceRevisions.c.id).join(meta.Resources, meta.ResourceRevisions.c.resourceID == meta.Resources.c.id).join(meta.ResourceTypes, meta.Resources.c.resourceTypeID == meta.ResourceTypes.c.id).all()
                        for conceptRevisionParentRevisionResourceInfo in conceptRevisionParentRevisionResourceInfos:
                            if conceptRevisionParentRevisionResourceInfo[0] not in conceptRevisionParentRevisionIDCoverImagesPostMap:
                                conceptRevisionParentRevisionIDCoverImagesPostMap[conceptRevisionParentRevisionResourceInfo[0]] = set([])
                            if conceptRevisionParentRevisionResourceInfo[0] not in conceptRevisionParentRevisionIDAttachmentsPostMap:
                                conceptRevisionParentRevisionIDAttachmentsPostMap[conceptRevisionParentRevisionResourceInfo[0]] = set([])

                            if conceptRevisionParentRevisionResourceInfo[3] and conceptRevisionParentRevisionResourceInfo[3] == 'cover page':
                                conceptRevisionParentRevisionIDCoverImagesPostMap[conceptRevisionParentRevisionResourceInfo[0]].add(conceptRevisionParentRevisionResourceInfo[1])
                            if conceptRevisionParentRevisionResourceInfo[2] and conceptRevisionParentRevisionResourceInfo[2] == 1:
                                conceptRevisionParentRevisionIDAttachmentsPostMap[conceptRevisionParentRevisionResourceInfo[0]].add(conceptRevisionParentRevisionResourceInfo[1])
                        
                        for conceptRevisionParentRevisionID in conceptRevisionParentRevisionIDs:
                            if conceptRevisionParentRevisionIDContentsPreMap.get(conceptRevisionParentRevisionID) and conceptRevisionParentRevisionIDContentsPreMap.get(conceptRevisionParentRevisionID) != conceptRevisionParentRevisionIDContentsPostMap.get(conceptRevisionParentRevisionID):
                                raise Exception(u"ERROR - Not able to process conceptIDs : "+str(conceptIDs)+" as Contents did not match for conceptRevisionParentRevisionID: "+str(conceptRevisionParentRevisionID) + "\n preContents: " + str(conceptRevisionParentRevisionIDContentsPreMap.get(conceptRevisionParentRevisionID)).encode('utf-8')+"\n postContents: "+str(conceptRevisionParentRevisionIDContentsPostMap.get(conceptRevisionParentRevisionID)).encode('utf-8'))

                            if conceptRevisionParentRevisionIDCoverImagesPreMap.get(conceptRevisionParentRevisionID) and conceptRevisionParentRevisionIDCoverImagesPreMap.get(conceptRevisionParentRevisionID) != conceptRevisionParentRevisionIDCoverImagesPostMap.get(conceptRevisionParentRevisionID):
                                raise Exception(u"ERROR - Not able to process conceptIDs : "+str(conceptIDs)+" as CoverImages did not match for conceptRevisionParentRevisionID: "+str(conceptRevisionParentRevisionID) + "\n preCoverImages: "+str(conceptRevisionParentRevisionIDCoverImagesPreMap.get(conceptRevisionParentRevisionID))+"\n postCoverImages: "+str(conceptRevisionParentRevisionIDCoverImagesPostMap.get(conceptRevisionParentRevisionID)))

                            if conceptRevisionParentRevisionIDAttachmentsPreMap.get(conceptRevisionParentRevisionID) and conceptRevisionParentRevisionIDAttachmentsPreMap.get(conceptRevisionParentRevisionID) != conceptRevisionParentRevisionIDAttachmentsPostMap.get(conceptRevisionParentRevisionID):
                                raise Exception(u"ERROR - Not able to process conceptIDs : "+str(conceptIDs)+" as Attachments did not match for conceptRevisionParentRevisionID: "+str(conceptRevisionParentRevisionID) + "\n preAttachments: "+str(conceptRevisionParentRevisionIDAttachmentsPreMap.get(conceptRevisionParentRevisionID))+"\n postAttachments: "+str(conceptRevisionParentRevisionIDAttachmentsPostMap.get(conceptRevisionParentRevisionID)))

                #ArtifactDependents
                    #CASCADE ON DELETE: (Currently just letting the CASCADE delete them. Any change??)
                        #ArtifactContributionType
                        #ArtifactFeedbackAbuseReports
                        #ArtifactHandles 
                        #ArtifactHasBrowseTerms
                        #ArtifactHasSearchTerms
                        #ArtifactHasTagTerms 
                        #ArtifactHasVocabularies
                        #From1xBooks
                        #From1xChapters
                    
                    #UPDATE TO NULL ON DELETE:   
                        #
                
                    #NO ACTION ON DELETE: (Currently just deleting them manually below. Any change??)
                        #AbuseReports
                        #ArtifactAttributers
                        #ArtifactAuthors
                        #ArtifactFeedbacks
                        #ArtifactRevisions
                        #Assignments
                        #FeaturedArtifacts
                        #GroupHasArtifacts
                        #MemberStudyTrackItemStatus
                        #MemberViewedArtifacts
                        #Overlays 
                        #RelatedArtifacts
                        #SharedArtifacts

                session.execute(meta.AbuseReports.delete().where(meta.AbuseReports.c.artifactID.in_(conceptIDs)))
                session.execute(meta.ArtifactAttributers.delete().where(meta.ArtifactAttributers.c.artifactID.in_(conceptIDs)))
                session.execute(meta.ArtifactAuthors.delete().where(meta.ArtifactAuthors.c.artifactID.in_(conceptIDs)))
                session.execute(meta.ArtifactFeedbacks.delete().where(meta.ArtifactFeedbacks.c.artifactID.in_(conceptIDs)))
                session.execute(meta.Assignments.delete().where(meta.Assignments.c.assignmentID.in_(conceptIDs)))
                session.execute(meta.FeaturedArtifacts.delete().where(meta.FeaturedArtifacts.c.artifactID.in_(conceptIDs)))
                session.execute(meta.GroupHasArtifacts.delete().where(meta.GroupHasArtifacts.c.artifactID.in_(conceptIDs)))
                session.execute(meta.MemberStudyTrackItemStatus.delete().where(meta.MemberStudyTrackItemStatus.c.studyTrackItemID.in_(conceptIDs)))
                session.execute(meta.MemberViewedArtifacts.delete().where(meta.MemberViewedArtifacts.c.artifactID.in_(conceptIDs)))
                session.execute(meta.Overlays.delete().where(meta.Overlays.c.artifactID.in_(conceptIDs)))
                session.execute(meta.RelatedArtifacts.delete().where(meta.RelatedArtifacts.c.artifactID.in_(conceptIDs)))
                session.execute(meta.SharedArtifacts.delete().where(meta.SharedArtifacts.c.artifactID.in_(conceptIDs)))
                session.execute(meta.Artifacts.delete().where(meta.Artifacts.c.id.in_(conceptIDs)))
            
            if commitFixesToDataBase:
                session.commit()
                noOfSuccessfullyDeletedConcepts = noOfSuccessfullyDeletedConcepts+1
            else:
                session.rollback()
            print "CONCEPT CHUNK PROCESSING SUCCESSFULL."
            log.info("CONCEPT CHUNK PROCESSING SUCCESSFULL.")
        except SQLAlchemyError, sqlae:
            session.rollback()
            print "CURRENT CONCEPT CHUNK PROCESSING FAILED. REASON : SQLAlchemyError - "+str(type(sqlae))+" - "+str(sqlae)
            log.info("CURRENT CONCEPT CHUNK PROCESSING FAILED. REASON : SQLAlchemyError - "+str(type(sqlae))+" - "+str(sqlae))
            log.exception(sqlae)
        except (KeyboardInterrupt, SystemExit) as e:
            session.rollback()
            print "CURRENT CONCEPT CHUNK PROCESSING FAILED. REASON : KeyboardInterrupt - "+str(type(e))+" - "+str(e)
            log.info("CURRENT CONCEPT CHUNK PROCESSING FAILED. REASON : KeyboardInterrupt - "+str(type(e))+" - "+str(e))
            log.exception(e)
            sys.exit(-1)
        except Exception, e:
            session.rollback()
            print "CURRENT CONCEPT CHUNK PROCESSING FAILED. REASON : Exception - "+str(type(e))+" - "+str(e)
            log.info("CURRENT CONCEPT CHUNK PROCESSING FAILED. REASON : Exception - "+str(type(e))+" - "+str(e))
            log.exception(e)
        finally:
            session.close()

        print "TIME TAKEN FOR CURRENT CONCEPT CHUNK : %s seconds" %((time.time()-chunkStartTime))
        print "ENDED PROCESSING CONCEPT CHUNK WITH START = "+str(offset)+", END = "+str(offset+1)
        print
        log.info("TIME TAKEN FOR CURRENT CONCEPT CHUNK : %s seconds" %((time.time()-chunkStartTime)))
        log.info("ENDED PROCESSING CONCEPT CHUNK WITH START = "+str(offset)+", END = "+str(offset+1))
        log.info("")
        offset = offset+1

    print "TOTAL TIME TAKEN FOR PROCESSING THE FOUND CONCEPT ARTIFACTS : %s minutes" %((time.time()-processStartTime)/60)
    log.info("TOTAL TIME TAKEN FOR PROCESSING THE FOUND CONCEPT ARTIFACTS : %s minutes" %((time.time()-processStartTime)/60))
    handler.close()