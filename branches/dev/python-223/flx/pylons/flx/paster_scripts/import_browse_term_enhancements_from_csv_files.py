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
from sqlalchemy.exc import SQLAlchemyError


#Headers - CSV
ENCODED_ID_HEADER = 'EncodedID';
ACTION_HEADER = 'Action';
TARGET_ENCODED_ID_HEADER = 'Target EncodedID';
NAME_HEADER = 'Name';

ENAHANCEMENT_IDENTIFIER_HEADERS = [ENCODED_ID_HEADER, ACTION_HEADER]


#Recognised Actions
MOVE_MODALITY_MAPPINGS_ACTION = 'MOVE_MODALITY_MAPPINGS'

RECOGNIZED_ACTIONS = [MOVE_MODALITY_MAPPINGS_ACTION]


#Currently supports only single csv files.
#TODO - Add support for directories.

#Usage: $paster shell
#>>>from paster_scripts import import_browse_term_enhancements_from_csv_files
#>>>import_browse_term_enhancements_from_csv_files.run(enhancementsCsvFilesPath='paster_scripts/taxonomy-enhancements-Spelling.csv', commitFixesToDataBase=False)
def run(enhancementsCsvFilesPath, commitFixesToDataBase=False):
    enhancementsCsvFilePath = enhancementsCsvFilesPath
    enhancementsCsvFile = open (enhancementsCsvFilePath, 'rb')   
    enhancementsCsvReader = csv.reader(enhancementsCsvFile, delimiter=',', quotechar='"')
    headerColNumMap = {}
    colNumHeaderMap = {}
    memberDict = {'id':3}

    startTime = datetime.now()

    #Set up the logger
    LOG_FILENAME = "/opt/2.0/log/import_browse_term_enhancements_from_csv_files."+os.path.splitext(os.path.basename(enhancementsCsvFilesPath))[0]+".log"
    handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=1000*1024*1024, backupCount=5)
    log = logging.getLogger(__name__)
    log.setLevel(logging.DEBUG)
    log.addHandler(handler)
    handler.doRollover()

    for rowNum, row in enumerate(enhancementsCsvReader):
        if rowNum == 0:
            #header row. prepare the headerDicts
            for colNum, colValue in enumerate(row):
                colValue = colValue.strip()
                if colValue:
                    headerColNumMap[colValue] = colNum
                    colNumHeaderMap[colNum] = colValue
            
            headers = headerColNumMap.keys()
            if not all([ENAHANCEMENT_IDENTIFIER_HEADER in headers for ENAHANCEMENT_IDENTIFIER_HEADER in ENAHANCEMENT_IDENTIFIER_HEADERS]):
                raise Exception(u"Invalid 'headersRow' is found in the received enhancementsCsvFile: [{enhancementsCsvFilePath}]. It should contain all the enhancementIdentifierHeaders: [{enhancementIdentifierHeaders}].".format(enhancementsCsvFilePath=enhancementsCsvFilePath, enhancementIdentifierHeaders=ENAHANCEMENT_IDENTIFIER_HEADERS).encode('utf-8'))
            
            duplicateHeaders = [header for header in headers if headers.count(header) > 1]
            if duplicateHeaders:
                raise Exception(u"Invalid 'headersRow' is found in the received enhancementsCsvFile: [{enhancementsCsvFilePath}]. duplicateHeaders: [{duplicateHeaders}] are found.".format(collectionCsvFilePath=collectionCsvFilePath, duplicateHeaders=duplicateHeaders).encode('utf-8'))
        else:
            try:
                meta.Session.begin()

                #regular row containing enhancement.
                colNumValueMap = {}
                for colNum, colValue in enumerate(row):
                    colValue = colValue.strip()
                    if colValue:
                        colNumValueMap[colNum] = colValue

                if colNumValueMap.get(headerColNumMap.get(ACTION_HEADER)):
                    action = colNumValueMap.get(headerColNumMap.get(ACTION_HEADER))
                    if action in RECOGNIZED_ACTIONS:
                        encodedID = colNumValueMap.get(headerColNumMap.get(ENCODED_ID_HEADER))
                        if action == MOVE_MODALITY_MAPPINGS_ACTION:
                            if TARGET_ENCODED_ID_HEADER in headerColNumMap and colNumValueMap.get(headerColNumMap.get(TARGET_ENCODED_ID_HEADER)):
                                targetEncodedID = colNumValueMap.get(headerColNumMap.get(TARGET_ENCODED_ID_HEADER))
                                browseTermIDInfos = meta.Session.query(meta.BrowseTerms.c.encodedID, meta.BrowseTerms.c.id).filter(meta.BrowseTerms.c.encodedID.in_([encodedID, targetEncodedID])).all()
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
                                    raise Exception(u"BrowseTerm with the given encodedID: [{encodedID}] could not be found in the database".format(encodedID=encodedID).encode('utf-8'))

                                if targetEncodedID not in browseTermEncodedIDBrowseTermIDMap:
                                    raise Exception(u"BrowseTerm with the given targetEncodedID: [{targetEncodedID}] could not be found in the database".format(targetEncodedID=targetEncodedID).encode('utf-8'))

                                browseTermIDArtifactIDsMap = {}
                                artifactMappingInfosQuery = meta.Session.query(meta.RelatedArtifacts.c.domainID, meta.RelatedArtifacts.c.artifactID, meta.RelatedArtifacts.c.sequence).filter(meta.RelatedArtifacts.c.domainID.in_([browseTermEncodedIDBrowseTermIDMap[encodedID], browseTermEncodedIDBrowseTermIDMap[targetEncodedID]])).filter(meta.RelatedArtifacts.c.conceptCollectionHandle == '', meta.RelatedArtifacts.c.collectionCreatorID == 0)
                                artifactMappingInfos = artifactMappingInfosQuery.all()
                                for artifactMappingInfo in artifactMappingInfos:
                                    browseTermID =  artifactMappingInfo[0]
                                    artifactID = artifactMappingInfo[1]
                                    sequence = artifactMappingInfo[2]
                                    if browseTermID not in browseTermIDArtifactIDsMap:
                                        browseTermIDArtifactIDsMap[browseTermID] = []
                                    browseTermIDArtifactIDsMap[browseTermID].append((artifactID, sequence))

                                encodedIDArtifactInfos = []
                                if browseTermEncodedIDBrowseTermIDMap[encodedID] in browseTermIDArtifactIDsMap:
                                    encodedIDArtifactInfos = browseTermIDArtifactIDsMap[browseTermEncodedIDBrowseTermIDMap[encodedID]]
                                
                                targetEncodedIDArtifactInfos = []
                                if browseTermEncodedIDBrowseTermIDMap[targetEncodedID] in browseTermIDArtifactIDsMap:
                                    targetEncodedIDArtifactInfos = browseTermIDArtifactIDsMap[browseTermEncodedIDBrowseTermIDMap[targetEncodedID]]

                                relatedArtifactsToInsert = []
                                for encodedIDArtifactInfo in encodedIDArtifactInfos:
                                    if encodedIDArtifactInfo not in targetEncodedIDArtifactInfos:
                                        relatedArtifactsToInsert.append({'domainID':browseTermEncodedIDBrowseTermIDMap[targetEncodedID], 'artifactID':encodedIDArtifactInfo[0], 'sequence':encodedIDArtifactInfo[1]})

                                if relatedArtifactsToInsert:
                                    meta.Session.execute(meta.RelatedArtifacts.insert(), relatedArtifactsToInsert)

                                meta.Session.execute(meta.RelatedArtifacts.delete().where(meta.RelatedArtifacts.c.domainID == browseTermEncodedIDBrowseTermIDMap[encodedID]))
                            else:
                                raise Exception(u"Row with out {column} is found for {action}. {column} is mandatory for {action}".format(column=TARGET_ENCODED_ID_HEADER, action=MOVE_MODALITY_MAPPINGS_ACTION).encode('utf-8'))
                    else:
                        raise Exception(u"Unrecognized action: [{action}] encountered, Ignoring it".format(action=action).encode('utf-8'))
                else:
                    raise Exception(u"Row with out {column} is found.{column} is mandatory".format(column=ACTION_HEADER, enhancementsCsvFilePath=enhancementsCsvFilePath, rowNum=rowNum).encode('utf-8'))
                
                if commitFixesToDataBase:
                    meta.Session.commit()
                else:
                    meta.Session.rollback()
                print "SUCCESS - Procession of rowNum: "+str(rowNum)+" in the received enhancementsCsvFile: "+enhancementsCsvFilePath+" is successfull."
                print 
                log.info("SUCCESS - Procession of rowNum: "+str(rowNum)+" in the received enhancementsCsvFile: "+enhancementsCsvFilePath+" is successfull.")
                log.info("")
            except SQLAlchemyError, sqlae:
                meta.Session.rollback()
                print "ERROR - Procession of rowNum: "+str(rowNum)+" in the received enhancementsCsvFile: "+enhancementsCsvFilePath+" failed with reason: SQLAlchemyError - "+str(sqlae)+"."
                print
                log.info("ERROR - Procession of rowNum: "+str(rowNum)+" in the received enhancementsCsvFile: "+enhancementsCsvFilePath+" failed with reason: SQLAlchemyError - "+str(sqlae)+".")
                log.exception(sqlae)
                log.info("")
            except (KeyboardInterrupt, SystemExit) as e:
                meta.Session.rollback()
                print "ERROR - Procession of rowNum: "+str(rowNum)+" in the received enhancementsCsvFile: "+enhancementsCsvFilePath+" failed with reason: KeyboardInterrupt - "+str(e)+"."
                print
                log.info("ERROR - Procession of rowNum: "+str(rowNum)+" in the received enhancementsCsvFile: "+enhancementsCsvFilePath+" failed with reason: KeyboardInterrupt - "+str(e)+".")
                log.exception(e)
                log.info("")
                sys.exit(-1)
            except Exception, e:
                meta.Session.rollback()
                print "ERROR - Procession of rowNum: "+str(rowNum)+" in the received enhancementsCsvFile: "+enhancementsCsvFilePath+" failed with reason: "+str(e)+"."
                print 
                log.info("ERROR - Procession of rowNum: "+str(rowNum)+" in the received enhancementsCsvFile: "+enhancementsCsvFilePath+" failed with reason: "+str(e)+".")
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