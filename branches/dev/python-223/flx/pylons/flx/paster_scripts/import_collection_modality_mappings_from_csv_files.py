import logging
import time
import sys
import zlib
import re
import csv
import os.path
import json
import sqlalchemy

from datetime import datetime
from flx.model import meta, model
from flx.lib import helpers
from flx.util import util
from sqlalchemy.orm import aliased, exc
from sqlalchemy.sql import func
from sqlalchemy.exc import SQLAlchemyError

CONCEPT_COLLECTION_HANDLE_HEADER = 'Concept Collection Handle'
COLLECTION_CREATOR_ID_HEADER = 'Collection CreatorID'
ENCODED_ID_HEADER = 'EncodedID'
MODALITY_IDS_HEADER = 'ModalityIDs'
COLLECTION_MODALITY_MAPPING_IDENTIFIER_HEADERS = [CONCEPT_COLLECTION_HANDLE_HEADER, COLLECTION_CREATOR_ID_HEADER, ENCODED_ID_HEADER, MODALITY_IDS_HEADER]

EXCLUDED_ARTIFACT_TYPES = ('asmtpractice')

#Usage: $paster shell
#>>>from paster_scripts import import_collection_modality_mappings_from_csv_files
#>>>import_collection_modality_mappings_from_csv_files.run('/opt/2.0/taxonomy/data/collection/alg-collection-modalityMappings.csv', deleteExistingMappings=False, commitFixesToDataBase=False)
def run(collectionModalityMappingCsvFilesPath, deleteExistingMappings=False, commitFixesToDataBase=False):
    collectionModalityMappingCsvFilePath = collectionModalityMappingCsvFilesPath
    collectionModalityMappingCsvFile = open (collectionModalityMappingCsvFilePath, 'rb')   
    collectionCsvReader = csv.reader(collectionModalityMappingCsvFile, delimiter=',', quotechar='"')
    headerColNumMap = {}
    colNumHeaderMap = {}

    startTime = datetime.now()

    #Set up the logger
    LOG_FILENAME = "/opt/2.0/log/import_collection_modality_mappings_from_csv_files."+os.path.splitext(os.path.basename(collectionModalityMappingCsvFilesPath))[0]+".log"
    handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=1000*1024*1024, backupCount=5)
    log = logging.getLogger(__name__)
    log.setLevel(logging.DEBUG)
    log.addHandler(handler)
    handler.doRollover()

    for rowNum, row in enumerate(collectionCsvReader):
        if rowNum == 0:
            #header row. prepare the headerDicts
            for colNum, colValue in enumerate(row):
                colValue = colValue.strip()
                if colValue:
                    headerColNumMap[colValue] = colNum
                    colNumHeaderMap[colNum] = colValue
            
            headers = headerColNumMap.keys()
            if not all([COLLECTION_MODALITY_MAPPING_IDENTIFIER_HEADER in headers for COLLECTION_MODALITY_MAPPING_IDENTIFIER_HEADER in COLLECTION_MODALITY_MAPPING_IDENTIFIER_HEADERS]):
                raise Exception(u"Invalid 'headersRow' is found in the received collectionModalityMappingCsvFile : [{collectionModalityMappingCsvFilePath}]. It should contain all the collectionModalityMappingIdentifierHeaders: [{collectionModalityMappingIdentifierHeaders}].".format(collectionModalityMappingCsvFilePath=collectionModalityMappingCsvFilePath, collectionModalityMappingIdentifierHeaders=COLLECTION_MODALITY_MAPPING_IDENTIFIER_HEADERS).encode('utf-8'))
            
            duplicateHeaders = [header for header in headers if headers.count(header) > 1]
            if duplicateHeaders:
                raise Exception(u"Invalid 'headersRow' is found in the received collectionModalityMappingCsvFile: [{collectionModalityMappingCsvFilePath}]. duplicateHeaders: [{duplicateHeaders}] are found.".format(collectionModalityMappingCsvFilePath=collectionModalityMappingCsvFilePath, duplicateHeaders=duplicateHeaders).encode('utf-8'))
        else:
            try:
                session = meta.Session
                session.begin()
            
                #regular row containing collection modality mapping
                colNumValueMap = {}
                for colNum, colValue in enumerate(row):
                    colValue = colValue.strip()
                    if colValue is not None:
                        colNumValueMap[colNum] = colValue

                #extract the values.
                conceptCollectionHandle = collectionCreatorID = encodedID = modalityIDs = None
                
                if headerColNumMap[CONCEPT_COLLECTION_HANDLE_HEADER] in colNumValueMap:
                    conceptCollectionHandle = colNumValueMap[headerColNumMap[CONCEPT_COLLECTION_HANDLE_HEADER]]
                    conceptCollectionHandle = conceptCollectionHandle.lower()
                
                if headerColNumMap[COLLECTION_CREATOR_ID_HEADER] in colNumValueMap:
                    collectionCreatorID = colNumValueMap[headerColNumMap[COLLECTION_CREATOR_ID_HEADER]]
                
                if headerColNumMap[ENCODED_ID_HEADER] in colNumValueMap:
                    encodedID = colNumValueMap[headerColNumMap[ENCODED_ID_HEADER]]
                    encodedID = util.processEncodedID(encodedID)

                if headerColNumMap[MODALITY_IDS_HEADER] in colNumValueMap:
                    modalityIDs = colNumValueMap[headerColNumMap[MODALITY_IDS_HEADER]]

                #Empty string is a valid value for modalityIDs
                if not conceptCollectionHandle or not collectionCreatorID or not encodedID or (not modalityIDs and modalityIDs != ''):
                    raise Exception(u"Invalid  conceptCollectionHandle: [{conceptCollectionHandle}], collectionCreatorID: [{collectionCreatorID}], encodedID:[{encodedID}], modalityIDs:[{modalityIDs}] combination found at the rowNum: [{rowNum}] in the received collectionModalityMappingCsvFile: [{collectionModalityMappingCsvFilePath}].".format(conceptCollectionHandle=conceptCollectionHandle, collectionCreatorID=collectionCreatorID, encodedID=encodedID, modalityIDs=modalityIDs,rowNum=rowNum, collectionModalityMappingCsvFilePath=collectionModalityMappingCsvFilePath).encode('utf-8'))

                #removes duplicates, casts the strings to longs. (except for 'ALL')
                processedModalityIDs = []
                if modalityIDs:
                    modalityIDs = modalityIDs.split(' ')
                    for modalityID in modalityIDs:
                        modalityID = modalityID.strip()
                        if modalityID not in ('ALL', 'all', 'All', '_ALL_', '_all_', '_All_'):
                            try:
                                modalityID=long(modalityID)
                            except (ValueError, TypeError) as e:
                                raise Exception(u"Invalid modalityID: [{modalityID}] is found at the rowNum: [{rowNum}] received in the collectionModalityMappingCsvFile: [{collectionModalityMappingCsvFilePath}]..".format(modalityID=modalityID, rowNum=rowNum, collectionModalityMappingCsvFilePath=collectionModalityMappingCsvFilePath).encode('utf-8'))
                        else:
                            modalityID = 'ALL'
                        if modalityID not in processedModalityIDs:
                            processedModalityIDs.append(modalityID)
                modalityIDs = processedModalityIDs
                
                #validate that the encodedID received is a valid one.
                try:
                    browseTermIDFromEncodedIDInfo = session.query(meta.BrowseTerms.c.id).filter(meta.BrowseTerms.c.encodedID == encodedID).one()
                    browseTermIDFromEncodedID = browseTermIDFromEncodedIDInfo[0]
                except exc.NoResultFound:
                    raise Exception(u"BrowseTerm(Domain) with the given encodedID : [{encodedID}] could not be found in the dataBase.".format(encodedID=encodedID).encode('utf-8'))
                except exc.MultipleResultsFound:
                    raise Exception(u"Multiple BrowseTerms(Domains)  with the given encodedID : [{encodedID}] are found in the dataBase. Internal System data error.".format(encodedID=encodedID).encode('utf-8'))

                if 'ALL' in modalityIDs:
                    #migrate all the content including community & ck12editors
                    allIndex = modalityIDs.index('ALL')
                    modalityIDs.remove('ALL')
                    modalityIDsFromALLInfos = session.query(meta.RelatedArtifacts.c.artifactID).filter(meta.RelatedArtifacts.c.domainID == browseTermIDFromEncodedID, meta.RelatedArtifacts.c.conceptCollectionHandle == '', meta.RelatedArtifacts.c.collectionCreatorID == 0).all()
                    modalityIDsFromALL = [ modalityIDsFromALLInfo[0] for modalityIDsFromALLInfo in modalityIDsFromALLInfos]
                    for modalityIDFromAll in modalityIDsFromALL:
                        if modalityIDFromAll not in modalityIDs:
                            modalityIDs.insert(allIndex, modalityIDFromAll)
                            allIndex = allIndex+1
                else:
                    #migrate only the community owned content
                    modalityIDsFromCommunityInfos = session.query(meta.RelatedArtifacts.c.artifactID).filter(meta.RelatedArtifacts.c.domainID == browseTermIDFromEncodedID, meta.RelatedArtifacts.c.conceptCollectionHandle == '', meta.RelatedArtifacts.c.collectionCreatorID == 0).join(meta.Artifacts, meta.RelatedArtifacts.c.artifactID == meta.Artifacts.c.id).filter(meta.Artifacts.c.creatorID != 3).all()
                    modalityIDsFromCommunity = [ modalityIDsFromCommunityInfo[0] for modalityIDsFromCommunityInfo in modalityIDsFromCommunityInfos]
                    for modalityIDFromCommunity in modalityIDsFromCommunity:
                        if modalityIDFromCommunity not in modalityIDs:
                            modalityIDs.append(modalityIDFromCommunity)

                if deleteExistingMappings:
                    session.execute(meta.RelatedArtifacts.delete().where(sqlalchemy.and_(meta.RelatedArtifacts.c.conceptCollectionHandle == conceptCollectionHandle, meta.RelatedArtifacts.c.collectionCreatorID == collectionCreatorID, meta.RelatedArtifacts.c.domainID == browseTermIDFromEncodedID)))
                else:
                    existingModalityIDInfos = session.query(meta.RelatedArtifacts.c.artifactID).filter(meta.RelatedArtifacts.c.conceptCollectionHandle == conceptCollectionHandle, meta.RelatedArtifacts.c.collectionCreatorID == collectionCreatorID, meta.RelatedArtifacts.c.domainID == browseTermIDFromEncodedID).all()
                    existingModalityIDs = [existingModalityIDInfo[0] for existingModalityIDInfo in existingModalityIDInfos]
                    for existingModalityID in existingModalityIDs:
                        if existingModalityID in modalityIDs:
                            modalityIDs.remove(existingModalityID)

                if modalityIDs:
                    modalityIDsChunks = [modalityIDs[x:x + 100] for x in xrange(0, len(modalityIDs), 100)]
                    modalityIDModalityTypeNameMap = {}
                    for modalityIDsChunk  in modalityIDsChunks:
                        modalityIDsChunkInfos = session.query(meta.Artifacts.c.id, meta.ArtifactTypes.c.name).filter(meta.Artifacts.c.id.in_(modalityIDsChunk)).join(meta.ArtifactTypes, meta.Artifacts.c.artifactTypeID==meta.ArtifactTypes.c.id).all()
                        for modalityIDsChunkInfo in modalityIDsChunkInfos:
                            modalityIDModalityTypeNameMap[modalityIDsChunkInfo[0]] = modalityIDsChunkInfo[1]                    
                    if len(modalityIDs) != len(modalityIDModalityTypeNameMap.keys()):
                        print "!!! One or more of the received modalityIDs either could not be found in the database or are not enabled as modalities in the database."+str(set(modalityIDs)-set(modalityIDModalityTypeNameMap.keys()))
                        log.info("!!! One or more of the received modalityIDs either could not be found in the database or are not enabled as modalities in the database."+str(set(modalityIDs)-set(modalityIDModalityTypeNameMap.keys())))
                        modalityIDs = modalityIDModalityTypeNameMap.keys()
                        #raise Exception(u"One or more of the received modalityIDs either could not be found in the database or are not enabled as modalities in the database."+str(set(modalityIDs)-set(modalityIDModalityTypeNameMap.keys())))
                    
                    modalityTypeNameMaxSequenceInfos = session.query(func.max(meta.RelatedArtifacts.c.sequence), meta.ArtifactTypes.c.name).filter(meta.RelatedArtifacts.c.conceptCollectionHandle == conceptCollectionHandle, meta.RelatedArtifacts.c.collectionCreatorID == collectionCreatorID, meta.RelatedArtifacts.c.domainID == browseTermIDFromEncodedID).join(meta.Artifacts, meta.RelatedArtifacts.c.artifactID == meta.Artifacts.c.id).join(meta.ArtifactTypes, meta.Artifacts.c.artifactTypeID == meta.ArtifactTypes.c.id).group_by(meta.ArtifactTypes.c.name).all()
                    modalityTypeNameMaxSequenceMap = {}
                    for modalityTypeNameMaxSequenceInfo in modalityTypeNameMaxSequenceInfos:
                        modalityTypeNameMaxSequenceMap[modalityTypeNameMaxSequenceInfo[1]] = modalityTypeNameMaxSequenceInfo[0]

                    #modalityIDs currently present in the defaultContext
                    existingDefaultContextModalityIDInfos = session.query(meta.RelatedArtifacts.c.artifactID).filter(meta.RelatedArtifacts.c.conceptCollectionHandle == '', meta.RelatedArtifacts.c.collectionCreatorID == 0, meta.RelatedArtifacts.c.domainID == browseTermIDFromEncodedID).all()
                    existingDefaultContextModalityIDs = [existingDefaultContextModalityIDInfo[0] for existingDefaultContextModalityIDInfo in existingDefaultContextModalityIDInfos]

                    defaultContextModalityTypeNameMaxSequenceInfos = session.query(func.max(meta.RelatedArtifacts.c.sequence), meta.ArtifactTypes.c.name).filter(meta.RelatedArtifacts.c.conceptCollectionHandle == '', meta.RelatedArtifacts.c.collectionCreatorID == 0, meta.RelatedArtifacts.c.domainID == browseTermIDFromEncodedID).join(meta.Artifacts, meta.RelatedArtifacts.c.artifactID == meta.Artifacts.c.id).join(meta.ArtifactTypes, meta.Artifacts.c.artifactTypeID == meta.ArtifactTypes.c.id).group_by(meta.ArtifactTypes.c.name).all()
                    defaultContextModalityTypeNameMaxSequenceMap = {}
                    for defaultContextModalityTypeNameMaxSequenceInfo in defaultContextModalityTypeNameMaxSequenceInfos:
                        defaultContextModalityTypeNameMaxSequenceMap[defaultContextModalityTypeNameMaxSequenceInfo[1]] = defaultContextModalityTypeNameMaxSequenceInfo[0]

                    collectionModalityMappingsToInsert = []
                    defaultModalityMappingsToInsert = []
                    for modalityID in modalityIDs:
                        modalityType = modalityIDModalityTypeNameMap[modalityID]
                        if modalityType not in EXCLUDED_ARTIFACT_TYPES:
                            #Check if the modalityID is already attached in the defaultContext, else attach it now
                            if modalityID not in existingDefaultContextModalityIDs:
                                if modalityType in defaultContextModalityTypeNameMaxSequenceMap:
                                    sequence = defaultContextModalityTypeNameMaxSequenceMap.get(modalityType)+1
                                else:
                                    sequence = 1;
                                defaultContextModalityTypeNameMaxSequenceMap[modalityType] = sequence
                                defaultModalityMappingsToInsert.append({'domainID': browseTermIDFromEncodedID, 'artifactID': modalityID, 'sequence':sequence})

                            #Attach the modalityID in the current collectionContext
                            if modalityType in modalityTypeNameMaxSequenceMap:
                                sequence = modalityTypeNameMaxSequenceMap.get(modalityType)+1
                            else:
                                sequence = 1;
                            modalityTypeNameMaxSequenceMap[modalityType] = sequence
                            collectionModalityMappingsToInsert.append({'conceptCollectionHandle': conceptCollectionHandle, 'collectionCreatorID':collectionCreatorID, 'domainID': browseTermIDFromEncodedID, 'artifactID': modalityID, 'sequence':sequence})

                    if defaultModalityMappingsToInsert:
                        session.execute(meta.RelatedArtifacts.insert(), defaultModalityMappingsToInsert)
            
                    if collectionModalityMappingsToInsert:
                        session.execute(meta.RelatedArtifacts.insert(), collectionModalityMappingsToInsert)
            
                    if commitFixesToDataBase:
                        session.commit()
                    else:
                        session.rollback()

                print "SUCCESS - Procession of rowNum: "+str(rowNum)+" in the received collectionModalityMappingCsvFilesPath: "+collectionModalityMappingCsvFilesPath+" is successful."
                print
                log.info("SUCCESS - Procession of rowNum: "+str(rowNum)+" in the received collectionModalityMappingCsvFilesPath: "+collectionModalityMappingCsvFilesPath+" is successful.")
                log.info("")
            except SQLAlchemyError, sqlae:
                session.rollback()
                print "ERROR - Procession of rowNum: "+str(rowNum)+" in the received collectionModalityMappingCsvFilesPath: "+collectionModalityMappingCsvFilesPath+" failed with reason: SQLAlchemyError - "+str(sqlae)+"."
                print
                log.info("ERROR - Procession of rowNum: "+str(rowNum)+" in the received collectionModalityMappingCsvFilesPath: "+collectionModalityMappingCsvFilesPath+" failed with reason: SQLAlchemyError - "+str(sqlae)+".")
                log.exception(sqlae)
                log.info("")
            except (KeyboardInterrupt, SystemExit) as e:
                session.rollback()
                print "ERROR - Procession of rowNum: "+str(rowNum)+" in the received collectionModalityMappingCsvFilesPath: "+collectionModalityMappingCsvFilesPath+" failed with reason: KeyboardInterrupt - "+str(e)+"."
                print 
                log.info("ERROR - Procession of rowNum: "+str(rowNum)+" in the received collectionModalityMappingCsvFilesPath: "+collectionModalityMappingCsvFilesPath+" failed with reason: KeyboardInterrupt - "+str(e)+".")
                log.exception(e)
                log.info("")
                sys.exit(-1)
            except Exception, e:
                session.rollback()
                print "ERROR - Procession of rowNum: "+str(rowNum)+" in the received collectionModalityMappingCsvFilesPath: "+collectionModalityMappingCsvFilesPath+" failed with reason: "+str(e)+"."
                print
                log.info("ERROR - Procession of rowNum: "+str(rowNum)+" in the received collectionModalityMappingCsvFilesPath: "+collectionModalityMappingCsvFilesPath+" failed with reason: "+str(e)+".")
                log.exception(e)
                log.info("")
            finally:
                session.close()

    endTime = datetime.now()
    timeTaken = endTime - startTime
    print
    print "Total Time Taken: "+str(timeTaken.seconds)+" seconds."
    print "Total Time Taken: "+str(timeTaken.seconds/60)+" minutes, "+str(timeTaken.seconds%60)+" seconds."
    log.info("")
    log.info("Total Time Taken: "+str(timeTaken.seconds)+" seconds.")
    log.info("Total Time Taken: "+str(timeTaken.seconds/60)+" minutes, "+str(timeTaken.seconds%60)+" seconds.")
    handler.close()
    log.removeHandler(handler)
