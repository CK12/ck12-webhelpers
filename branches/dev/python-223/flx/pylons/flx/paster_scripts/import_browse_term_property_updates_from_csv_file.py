import logging
import time
import sys
import zlib
import re
import csv
import os.path
import json
import time

from pylons import config
from datetime import datetime
from sqlalchemy.exc import SQLAlchemyError
from flx.model import meta, model
from flx.util import util


#Headers - CSV
ENCODED_ID_HEADER = 'EncodedID';
LEVEL_HEADER_PREFIX = 'Level'
DESCRIPTION_HEADER = 'Description'
HANDLE_HEADER = 'Handle'

#EID and one of the level needs to be present
PROPERTY_UPDATES_IDENTIFIER_HEADERS = [ENCODED_ID_HEADER]

#Keys
NAME_PROPERTY_IDENTIFIER = 'NAME'
DESCRIPTION_PROPERTY_IDENTIFIER = 'DESCRIPTION'
HANDLE_PROPERTY_IDENTIFIER = 'HANDLE'

PROPERTIES_SUPPORTED = [NAME_PROPERTY_IDENTIFIER, DESCRIPTION_PROPERTY_IDENTIFIER, HANDLE_PROPERTY_IDENTIFIER]

#Currently supports only single csv file
#Currently supportes updates for only name-handle & description. encodedID is the key used to identify the browseTerm
#This script doesn't create any new browseTerms or related domainArtifacts - It just updates the properties of existing ones
#We still need to use the script under taxonomy to create any new terms.
#Usage: $paster shell
#>>>from paster_scripts import import_browse_term_property_updates_from_csv_file
#>>>import_browse_term_property_updates_from_csv_file.run(propertyUpdatesCsvFilePath='/opt/2.0/taxonomy/data/collection/alg.csv', propertiesToUpdate=['NAME', 'HANDLE', 'DESCRIPTION'], commitFixesToDataBase=False)
def run(propertyUpdatesCsvFilePath, propertiesToUpdate=[], commitFixesToDataBase=False):
    if not isinstance(propertiesToUpdate, list) or not propertiesToUpdate:
        raise Exception("Invalid propertiesToUpdate received. It need to be a non-empty list.")
    for propertyToUpdate in propertiesToUpdate:
        if propertyToUpdate not in PROPERTIES_SUPPORTED:
            raise Exception("Invalid property received found in the received propertiesToUpdate. Only "+str(PROPERTIES_SUPPORTED)+" are supported currently.")

    propertyUpdatesCsvFile = open (propertyUpdatesCsvFilePath, 'rb')   
    propertyUpdatesCsvReader = csv.reader(propertyUpdatesCsvFile, delimiter=',', quotechar='"')
    headerColNumMap = {}
    colNumHeaderMap = {}

    startTime = datetime.now()
    session = meta.Session

    #Set up the logger
    LOG_FILENAME = "/opt/2.0/log/import_browse_term_property_updates_from_csv_file."+os.path.splitext(os.path.basename(propertyUpdatesCsvFilePath))[0]+".log"
    handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=1000*1024*1024, backupCount=5)
    log = logging.getLogger(__name__)
    log.setLevel(logging.DEBUG)
    log.addHandler(handler)
    handler.doRollover()

    for rowNum, row in enumerate(propertyUpdatesCsvReader):
        if rowNum == 0:
            #header row. prepare the headerDicts
            for colNum, colValue in enumerate(row):
                colValue = colValue.strip()
                if colValue:
                    headerColNumMap[colValue] = colNum
                    colNumHeaderMap[colNum] = colValue

            headers = headerColNumMap.keys()
            if not all([PROPERTY_UPDATES_IDENTIFIER_HEADER in headers for PROPERTY_UPDATES_IDENTIFIER_HEADER in PROPERTY_UPDATES_IDENTIFIER_HEADERS]):
                raise Exception(u"Invalid 'headersRow' is found in the received propertyUpdatesCsvFile: [{propertyUpdatesCsvFilePath}]. It should contain all the propertyUpdatesIdentifierHeaders: [{propertyUpdatesIdentifierHeaders}].".format(propertyUpdatesCsvFilePath=propertyUpdatesCsvFilePath, propertyUpdatesIdentifierHeaders=PROPERTY_UPDATES_IDENTIFIER_HEADERS).encode('utf-8'))

            duplicateHeaders = [header for header in headers if headers.count(header) > 1]
            if duplicateHeaders:
                raise Exception(u"Invalid 'headersRow' is found in the received propertyUpdatesCsvFile: [{propertyUpdatesCsvFilePath}]. duplicateHeaders: [{duplicateHeaders}] are found.".format(propertyUpdatesCsvFilePath=propertyUpdatesCsvFilePath, duplicateHeaders=duplicateHeaders).encode('utf-8'))
            
            levelHeaders = [header for header in headers if header.startswith(LEVEL_HEADER_PREFIX)]
            levelHeaderColNums = [ headerColNumMap.get(levelHeader) for levelHeader in levelHeaders]
            levelHeaderColNumTolevelHeaderNumMap = {}
            levelHeaderNumToParentEncodedIDMap = {}
            for levelHeader in levelHeaders:
                if ' ' in levelHeader:
                    levelHeaderNum = levelHeader.split(' ')[1]
                    try :
                        levelHeaderNum=long(levelHeaderNum)
                    except (ValueError, TypeError) as e:
                        raise Exception(u"Invalid 'headersRow' is found in the received propertyUpdatesCsvFile: [{propertyUpdatesCsvFilePath}]. Invalid level headers found at columnNum: [{columnNum}].".format(propertyUpdatesCsvFilePath=propertyUpdatesCsvFilePath, columnNum=headerColNumMap[levelHeader]).encode('utf-8'))
                    if levelHeaderNum <=0:
                        raise Exception(u"Invalid 'headersRow' is found in the received propertyUpdatesCsvFile: [{propertyUpdatesCsvFilePath}]. Invalid level headers found at columnNum: [{columnNum}].".format(propertyUpdatesCsvFilePath=propertyUpdatesCsvFilePath, columnNum=headerColNumMap[levelHeader]).encode('utf-8'))
                    levelHeaderColNumTolevelHeaderNumMap[headerColNumMap.get(levelHeader)] = levelHeaderNum
                else:
                    raise Exception(u"Invalid 'headersRow' is found in the received propertyUpdatesCsvFile: [{propertyUpdatesCsvFilePath}]. Invalid level headers found at columnNum: [{columnNum}].".format(propertyUpdatesCsvFilePath=propertyUpdatesCsvFilePath, columnNum=headerColNumMap[levelHeader]).encode('utf-8'))
        else:
            try:
                #regular row.
                session.begin()
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

                #Now perform the required actual update on browseTerm and related domainArtifact

                browseTermIDs = session.query(meta.BrowseTerms.c.id).filter(meta.BrowseTerms.c.encodedID == encodedID).all()
                if not browseTermIDs:
                    raise Exception("BrowseTerm with the given encodedID: "+str(encodedID)+" could not be found in the database.")
                if len(browseTermIDs) > 2:
                    raise Exception("Multiple BrowseTerms with the given encodedID: "+str(encodedID)+" are found in the database. System data Error.")
                browseTermID = browseTermIDs[0][0]
                browseTermUpdateQuery = meta.BrowseTerms.update().where(meta.BrowseTerms.c.id == browseTermID)
                browseTermUpdateQueryValues = {}

                #Hard coding the adminUserID & the domainArtifactTypeID
                artifactIDs = session.query(meta.Artifacts.c.id).filter(meta.Artifacts.c.encodedID == encodedID, meta.Artifacts.c.creatorID==1, meta.Artifacts.c.artifactTypeID==54).all()
                if not artifactIDs:
                    raise Exception("Domain Artifact with the given encodedID: "+str(encodedID)+" for the admin user could not be found in the database.")
                if len(artifactIDs) > 2:
                    raise Exception("Multiple Domain Artifacts with the given encodedID: "+str(encodedID)+" are found in the database for the admin user. System data Error.")
                artifactID = artifactIDs[0][0]

                artifactUpdateQuery = meta.Artifacts.update().where(meta.Artifacts.c.id == artifactID)
                artifactUpdateQueryValues = {}

                description = None
                if DESCRIPTION_PROPERTY_IDENTIFIER in propertiesToUpdate:
                    #Description
                    description = colNumValueMap.get(headerColNumMap.get(DESCRIPTION_HEADER))
                    if description:
                        description = description.decode('utf-8')
                        browseTermUpdateQueryValues[meta.BrowseTerms.c.description] = description
                        artifactUpdateQueryValues[meta.Artifacts.c.description] = description

                name = None
                if NAME_PROPERTY_IDENTIFIER in propertiesToUpdate:
                    #NAME - validate that only one levelColumn is given for every encodedID and process it for name
                    currentRowLevelHeaderColNums = [headerColNumMap.get(levelHeader) for levelHeader in levelHeaders if colNumValueMap.get(headerColNumMap.get(levelHeader))]
                    if len(currentRowLevelHeaderColNums) >1:
                        raise Exception(u"Row with multiple level headers is found. Only one level header is allowed at max.".encode('utf-8'))
                    if currentRowLevelHeaderColNums:
                        currentRowLevelHeaderColNum = currentRowLevelHeaderColNums[0]
                        currentRowLevelHeaderNum = levelHeaderColNumTolevelHeaderNumMap[currentRowLevelHeaderColNum]
                        name = colNumValueMap.get(currentRowLevelHeaderColNum)
                        if name:
                            name = name.decode('utf-8')
                            browseTermUpdateQueryValues[meta.BrowseTerms.c.name] = name  
                            artifactUpdateQueryValues[meta.Artifacts.c.name] = name   

                handle = None
                if HANDLE_PROPERTY_IDENTIFIER in propertiesToUpdate:
                    #Handle
                    handle = colNumValueMap.get(headerColNumMap.get(HANDLE_HEADER))
                    if not handle and NAME_PROPERTY_IDENTIFIER in propertiesToUpdate and name:
                            handle = model.title2Handle(name)                
                    if handle:
                        handle = handle.decode('utf-8')
                        browseTermUpdateQueryValues[meta.BrowseTerms.c.handle] = handle  
                        artifactUpdateQueryValues[meta.Artifacts.c.handle] = handle          

                if browseTermUpdateQueryValues:
                    print "browseTermEncodedID: "+str(encodedID)+" - browseTermID: "+str(browseTermID)+" updateValues: "+str(browseTermUpdateQueryValues)
                    log.info("browseTermEncodedID: "+str(encodedID)+" - browseTermID: "+str(browseTermID)+" updateValues: "+str(browseTermUpdateQueryValues))
                    browseTermUpdateQuery = browseTermUpdateQuery.values(browseTermUpdateQueryValues)
                    session.execute(browseTermUpdateQuery)

                if artifactUpdateQueryValues:
                    print "artifactEncodedID: "+str(encodedID)+" - artifactID: "+str(artifactID)+" updateValues: "+str(artifactUpdateQueryValues)
                    log.info("artifactEncodedID: "+str(encodedID)+" - artifactID: "+str(artifactID)+" updateValues: "+str(artifactUpdateQueryValues))
                    artifactUpdateQuery = artifactUpdateQuery.values(artifactUpdateQueryValues)
                    session.execute(artifactUpdateQuery)

                if commitFixesToDataBase:
                    session.commit()
                else:
                    session.rollback()
                print "SUCCESS - Procession of rowNum: "+str(rowNum)+" in the received propertyUpdatesCsvFile: "+propertyUpdatesCsvFilePath+" is successfull."
                print
                log.info("SUCCESS - Procession of rowNum: "+str(rowNum)+" in the received propertyUpdatesCsvFile: "+propertyUpdatesCsvFilePath+" is successfull.")
                log.info("")
            except SQLAlchemyError, e:
                session.rollback()
                print "ERROR - Procession of rowNum: "+str(rowNum)+" in the received propertyUpdatesCsvFile: "+propertyUpdatesCsvFilePath+" failed with reason: SQLAlchemyError - "+str(type(e))+" - "+str(e)
                print        
                log.info("ERROR - Procession of rowNum: "+str(rowNum)+" in the received propertyUpdatesCsvFile: "+propertyUpdatesCsvFilePath+" failed with reason: SQLAlchemyError - "+str(type(e))+" - "+str(e))
                log.exception(e)
                log.info("")
            except (KeyboardInterrupt, SystemExit) as e:
                session.rollback()
                print "ERROR - Procession of rowNum: "+str(rowNum)+" in the received propertyUpdatesCsvFile: "+propertyUpdatesCsvFilePath+" failed with reason: KeyboardInterrupt - "+str(type(e))+" - "+str(e)
                print                
                log.info("ERROR - Procession of rowNum: "+str(rowNum)+" in the received propertyUpdatesCsvFile: "+propertyUpdatesCsvFilePath+" failed with reason: KeyboardInterrupt - "+str(type(e))+" - "+str(e))
                log.exception(e)
                log.info("")
                sys.exit(-1)
            except Exception, e:
                session.rollback()
                print "ERROR - Procession of rowNum: "+str(rowNum)+" in the received propertyUpdatesCsvFile: "+propertyUpdatesCsvFilePath+" failed with reason: "+str(e)
                print
                log.info("ERROR - Procession of rowNum: "+str(rowNum)+" in the received propertyUpdatesCsvFile: "+propertyUpdatesCsvFilePath+" failed with reason: "+str(e))
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