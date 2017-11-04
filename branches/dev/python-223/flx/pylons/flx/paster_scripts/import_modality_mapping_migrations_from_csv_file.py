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
from flx.model import meta
from flx.util import util
from sqlalchemy.exc import SQLAlchemyError

#Headers - CSV
ENCODED_ID_HEADER = 'EncodedID';
ORIGINAL_ENCODED_IDS_HEADER = 'Original EncodedIDs'

MODALITY_MAPPING_MIGRATIONS_IDENTIFIER_HEADERS = [ENCODED_ID_HEADER, ORIGINAL_ENCODED_IDS_HEADER]

EXCLUDED_ARTIFACT_TYPES = ('asmtpractice')

#Currently supports only single csv file with a single taxonomy structure.
#Usage: $paster shell
#>>>from paster_scripts import import_modality_mapping_migrations_from_csv_file
#>>>import_modality_mapping_migrations_from_csv_file.run(modalityMappingMigrationsCsvFilePath='/opt/2.0/taxonomy/data/collection/esc.csv', commitFixesToDataBase=False)
def run(modalityMappingMigrationsCsvFilePath, commitFixesToDataBase=False):
    modalityMappingMigrationsCsvFile = open (modalityMappingMigrationsCsvFilePath, 'rb')   
    modalityMappingMigrationsCsvReader = csv.reader(modalityMappingMigrationsCsvFile, delimiter=',', quotechar='"')
    headerColNumMap = {}
    colNumHeaderMap = {}

    startTime = datetime.now()

    #Set up the logger
    LOG_FILENAME = "/opt/2.0/log/import_modality_mapping_migrations_from_csv_file."+os.path.splitext(os.path.basename(modalityMappingMigrationsCsvFilePath))[0]+".log"
    handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=1000*1024*1024, backupCount=5)
    log = logging.getLogger(__name__)
    log.setLevel(logging.DEBUG)
    log.addHandler(handler)
    handler.doRollover()

    for rowNum, row in enumerate(modalityMappingMigrationsCsvReader):
        if rowNum == 0:
            #header row. prepare the headerDicts
            for colNum, colValue in enumerate(row):
                colValue = colValue.strip()
                if colValue:
                    headerColNumMap[colValue] = colNum
                    colNumHeaderMap[colNum] = colValue
            
            headers = headerColNumMap.keys()
            if not all([MODALITY_MAPPING_MIGRATIONS_IDENTIFIER_HEADER in headers for MODALITY_MAPPING_MIGRATIONS_IDENTIFIER_HEADER in MODALITY_MAPPING_MIGRATIONS_IDENTIFIER_HEADERS]):
                raise Exception(u"Invalid 'headersRow' is found in the received modalityMappingMigrationsCsvFile: [{modalityMappingMigrationsCsvFilePath}]. It should contain all the modalityMappingMigrationsIdentifierHeaders: [{modalityMappingMigrationsIdentifierHeaders}].".format(modalityMappingMigrationsCsvFilePath=modalityMappingMigrationsCsvFilePath, modalityMappingMigrationsIdentifierHeaders=MODALITY_MAPPING_MIGRATIONS_IDENTIFIER_HEADERS).encode('utf-8'))
            
            duplicateHeaders = [header for header in headers if headers.count(header) > 1]
            if duplicateHeaders:
                raise Exception(u"Invalid 'headersRow' is found in the received modalityMappingMigrationsCsvFile: [{modalityMappingMigrationsCsvFilePath}]. duplicateHeaders: [{duplicateHeaders}] are found.".format(modalityMappingMigrationsCsvFilePath=modalityMappingMigrationsCsvFilePath, duplicateHeaders=duplicateHeaders).encode('utf-8'))            
        else:
            try:
                meta.Session.begin()
                
                #regular row.
                colNumValueMap = {}
                for colNum, colValue in enumerate(row):
                    colValue = colValue.strip()
                    if colValue:
                        colNumValueMap[colNum] = colValue
                
                #validate encodedID
                encodedID = colNumValueMap.get(headerColNumMap.get(ENCODED_ID_HEADER))
                if not encodedID:
                    raise Exception(u"Row with out {column} is found.{column} is mandatory.".format(column=ENCODED_ID_HEADER).encode('utf-8'))
                encodedID = util.processEncodedID(encodedID)
                encodedID = encodedID.decode('utf-8')

                originalEncodedIDs = colNumValueMap.get(headerColNumMap.get(ORIGINAL_ENCODED_IDS_HEADER))
                if originalEncodedIDs:
                    originalEncodedIDs = originalEncodedIDs.strip()
                    originalEncodedIDs = originalEncodedIDs.strip(',')
                    originalEncodedIDs = originalEncodedIDs.split(',')
                    processedOriginalEncodedIDs = []
                    for originalEncodedID in originalEncodedIDs:
                        originalEncodedID = originalEncodedID.strip()
                        originalEncodedID = originalEncodedID.strip('\n')
                        originalEncodedIDParts = originalEncodedID.split('\n')
                        for originalEncodedIDPart in originalEncodedIDParts:
                            originalEncodedIDPart = originalEncodedIDPart.strip()
                            originalEncodedID = originalEncodedIDPart
                            if not originalEncodedID:
                                raise Exception((u'Empty / Blank originalEncodedID received.').encode('utf-8'))

                            originalEncodedID = util.processEncodedID(originalEncodedID)
                            if originalEncodedID not in processedOriginalEncodedIDs:
                                processedOriginalEncodedIDs.append(originalEncodedID)

                    if processedOriginalEncodedIDs:
                        totalEncodedIDs = processedOriginalEncodedIDs[:]
                        if encodedID not in totalEncodedIDs:
                            totalEncodedIDs.append(encodedID)
                        
                        browseTermIDInfos = meta.Session.query(meta.BrowseTerms.c.encodedID, meta.BrowseTerms.c.id).filter(meta.BrowseTerms.c.encodedID.in_(totalEncodedIDs)).all()
                        browseTermEncodedIDBrowseTermIDMap = {}
                        for browseTermIDInfo in browseTermIDInfos:
                            browseTermEncodedID = browseTermIDInfo[0]
                            browseTermID = browseTermIDInfo[1]
                            if browseTermEncodedID not in browseTermEncodedIDBrowseTermIDMap:
                                browseTermEncodedIDBrowseTermIDMap[browseTermEncodedID] = browseTermID
                            else:
                                if browseTermEncodedIDBrowseTermIDMap[browseTermEncodedID] != browseTermID:
                                    raise Exception(u"Multiple BrowseTerms are found for the encodedID:[{browseTermEncodedID}] in the database".format(browseTermEncodedID=browseTermEncodedID).encode('utf-8'))

                        if encodedID not in browseTermEncodedIDBrowseTermIDMap:
                            if encodedID.startswith('MAT.EM'):
                                browseTermEncodedID = encodedID
                                browseTermIDInfos = meta.Session.query(meta.BrowseTerms.c.encodedID, meta.BrowseTerms.c.id).filter(meta.BrowseTerms.c.encodedID.op('regexp')(browseTermEncodedID+'0+$')).all()                                
                                if len(browseTermIDInfos) > 1:
                                    raise Exception(u"Multiple BrowseTerms are found for the encodedID:[{browseTermEncodedID}] in the database after applying the elementaryMathResolution. browseTermIDInfos: {browseTermIDInfos}".format(browseTermEncodedID=browseTermEncodedID, browseTermIDInfos=browseTermIDInfos).encode('utf-8'))
                                if len(browseTermIDInfos) == 1:
                                    browseTermIDInfo = browseTermIDInfos[0]
                                    browseTermID = browseTermIDInfo[1]                                    
                                    browseTermEncodedIDBrowseTermIDMap[browseTermEncodedID] = browseTermID
                        
                        missingOriginalEncodedIDs = set(processedOriginalEncodedIDs) - set(browseTermEncodedIDBrowseTermIDMap.keys())
                        if missingOriginalEncodedIDs:
                            for missingOriginalEncodedID in missingOriginalEncodedIDs:
                                if missingOriginalEncodedID.startswith('MAT.EM'):
                                    browseTermEncodedID = missingOriginalEncodedID
                                    browseTermIDInfos = meta.Session.query(meta.BrowseTerms.c.encodedID, meta.BrowseTerms.c.id).filter(meta.BrowseTerms.c.encodedID.op('regexp')(browseTermEncodedID+'0+$')).all()                                
                                    if len(browseTermIDInfos) > 1:
                                        raise Exception(u"Multiple BrowseTerms are found for the originalEncodedID:[{browseTermEncodedID}] in the database after applying the elementaryMathResolution. browseTermIDInfos: {browseTermIDInfos}".format(browseTermEncodedID=browseTermEncodedID, browseTermIDInfos=browseTermIDInfos).encode('utf-8'))
                                    if len(browseTermIDInfos) == 1:
                                        browseTermIDInfo = browseTermIDInfos[0]
                                        browseTermID = browseTermIDInfo[1]                                    
                                        browseTermEncodedIDBrowseTermIDMap[browseTermEncodedID] = browseTermID

                        if encodedID not in browseTermEncodedIDBrowseTermIDMap:
                            raise Exception(u"BrowseTerm with the given encodedID: [{encodedID}] could not be found in the database".format(encodedID=encodedID).encode('utf-8'))

                        missingOriginalEncodedIDs = set(processedOriginalEncodedIDs) - set(browseTermEncodedIDBrowseTermIDMap.keys())
                        if missingOriginalEncodedIDs:
                            raise Exception(u"BrowseTerms with the given originalEncodedIDs: [{missingOriginalEncodedIDs}] could not be found in the database".format(missingOriginalEncodedIDs=missingOriginalEncodedIDs).encode('utf-8'))

                        browseTermIDArtifactIDsMap = {}
                        artifactMappingInfosQuery = meta.Session.query(meta.RelatedArtifactsBackup.c.domainID, meta.RelatedArtifactsBackup.c.artifactID, meta.ArtifactTypes.c.name, meta.RelatedArtifactsBackup.c.sequence).filter(meta.RelatedArtifactsBackup.c.domainID.in_(browseTermEncodedIDBrowseTermIDMap.values())).filter(meta.RelatedArtifactsBackup.c.conceptCollectionHandle == '', meta.RelatedArtifactsBackup.c.collectionCreatorID == 0, meta.RelatedArtifactsBackup.c.artifactID == meta.Artifacts.c.id, meta.Artifacts.c.artifactTypeID == meta.ArtifactTypes.c.id)
                        artifactMappingInfos = artifactMappingInfosQuery.all()
                        for artifactMappingInfo in artifactMappingInfos:
                            browseTermID =  artifactMappingInfo[0]
                            artifactID = artifactMappingInfo[1]
                            artifactTypeName = artifactMappingInfo[2]
                            sequence = artifactMappingInfo[3]
                            if browseTermID not in browseTermIDArtifactIDsMap:
                                browseTermIDArtifactIDsMap[browseTermID] = []
                            browseTermIDArtifactIDsMap[browseTermID].append((artifactID, artifactTypeName, sequence))


                        originalEncodedIDsArtifactInfos = []
                        for processedOriginalEncodedID in processedOriginalEncodedIDs:
                            if browseTermEncodedIDBrowseTermIDMap[processedOriginalEncodedID] in browseTermIDArtifactIDsMap:
                                originalEncodedIDsArtifactInfos.extend(browseTermIDArtifactIDsMap[browseTermEncodedIDBrowseTermIDMap[processedOriginalEncodedID]])
                        
                        #Since encodedID and originalEncodedIDs - 
                        #Delete all the existing mappings for the encodedID
                        meta.Session.execute(meta.RelatedArtifacts.delete().where(sqlalchemy.and_(meta.RelatedArtifacts.c.domainID == browseTermEncodedIDBrowseTermIDMap[encodedID], meta.RelatedArtifacts.c.conceptCollectionHandle == '', meta.RelatedArtifacts.c.collectionCreatorID == 0)))
                        processedArtifactInfos = []
                        artifactTypeNameMaxSequenceMap = {}
                        
                        #The current order of sequences is the actual Order of originalEIDs given.
                        #if that needs to change and the artifact sequence needs to define the order - unComment this.
                        #originalEncodedIDsArtifactInfos.sort(key = lambda originalEncodedIDsArtifactInfo:originalEncodedIDsArtifactInfo[2])

                        #genereate relatedArtifactsToInsert
                        relatedArtifactsToInsert = []
                        for originalEncodedIDsArtifactInfo in originalEncodedIDsArtifactInfos:
                            artifactID = originalEncodedIDsArtifactInfo[0]
                            artifactTypeName = originalEncodedIDsArtifactInfo[1]
                            if artifactTypeName not in EXCLUDED_ARTIFACT_TYPES and artifactID not in processedArtifactInfos:
                                if artifactTypeName not in artifactTypeNameMaxSequenceMap:
                                    artifactTypeNameMaxSequenceMap[artifactTypeName] = 0
                                artifactTypeNameMaxSequenceMap[artifactTypeName] = artifactTypeNameMaxSequenceMap[artifactTypeName]+1

                                artifactSequence = artifactTypeNameMaxSequenceMap[artifactTypeName]
                                relatedArtifactsToInsert.append({'domainID':browseTermEncodedIDBrowseTermIDMap[encodedID], 'artifactID':artifactID, 'sequence':artifactSequence})
                                processedArtifactInfos.append((artifactID))
                   
                        if relatedArtifactsToInsert:
                            meta.Session.execute(meta.RelatedArtifacts.insert(), relatedArtifactsToInsert)

                if commitFixesToDataBase:
                    meta.Session.commit()
                else:
                    meta.Session.rollback()

                print "SUCCESS - Procession of rowNum: "+str(rowNum)+" in the received modalityMappingMigrationsCsvFile: "+modalityMappingMigrationsCsvFilePath+" is successfull."
                print
                log.info("SUCCESS - Procession of rowNum: "+str(rowNum)+" in the received modalityMappingMigrationsCsvFile: "+modalityMappingMigrationsCsvFilePath+" is successfull.")
                log.info("")
            except SQLAlchemyError, sqlae:
                meta.Session.rollback()
                print "ERROR - Procession of rowNum: "+str(rowNum)+" in the received modalityMappingMigrationsCsvFile: "+modalityMappingMigrationsCsvFilePath+" failed with reason: SQLAlchemyError - "+str(sqlae)+"."
                print 
                log.info("ERROR - Procession of rowNum: "+str(rowNum)+" in the received modalityMappingMigrationsCsvFile: "+modalityMappingMigrationsCsvFilePath+" failed with reason: SQLAlchemyError - "+str(sqlae)+".")
                log.exception(sqlae)
                log.info("")
            except (KeyboardInterrupt, SystemExit) as e:
                meta.Session.rollback()
                print "ERROR - Procession of rowNum: "+str(rowNum)+" in the received modalityMappingMigrationsCsvFile: "+modalityMappingMigrationsCsvFilePath+" failed with reason: KeyboardInterrupt - "+str(e)+"."
                print 
                log.info("ERROR - Procession of rowNum: "+str(rowNum)+" in the received modalityMappingMigrationsCsvFile: "+modalityMappingMigrationsCsvFilePath+" failed with reason: KeyboardInterrupt - "+str(e)+".")
                log.exception(e)
                log.info("")
                sys.exit(-1)
            except Exception, e:
                meta.Session.rollback()
                print "ERROR - Procession of rowNum: "+str(rowNum)+" in the received modalityMappingMigrationsCsvFile: "+modalityMappingMigrationsCsvFilePath+" failed with reason: "+str(e)+"."
                print 
                log.info("ERROR - Procession of rowNum: "+str(rowNum)+" in the received modalityMappingMigrationsCsvFile: "+modalityMappingMigrationsCsvFilePath+" failed with reason: "+str(e)+".")
                log.exception(e)
                log.info("")
            finally:
                meta.Session.close()

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
