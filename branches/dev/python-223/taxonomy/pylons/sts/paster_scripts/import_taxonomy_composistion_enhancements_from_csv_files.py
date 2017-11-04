import logging
import time
import sys
import zlib
import re
import datetime
import csv
import os.path
import json
from pylons import request

from sts.controllers import conceptnode
from sts.model import api

conceptnodeController = conceptnode.ConceptnodeController()

#Headers - CSV
ENCODED_ID_HEADER = 'EncodedID';
ACTION_HEADER = 'Action';
TARGET_ENCODED_ID_HEADER = 'Target EncodedID';
NAME_HEADER = 'Name';

ENAHANCEMENT_IDENTIFIER_HEADERS = [ENCODED_ID_HEADER, ACTION_HEADER]


#Recognised Actions
UPDATE_ACTION = 'UPDATE'
UPDATE_PARENT_ACTION = 'UPDATE_PARENT'
DELETE_ACTION = 'DELETE'
ADD_AS_REDIRECTED_REFERENCE_ACTION = 'ADD_AS_REDIRECTED_REFERENCE'
RECOGNIZED_ACTIONS = [UPDATE_ACTION, UPDATE_PARENT_ACTION, DELETE_ACTION, ADD_AS_REDIRECTED_REFERENCE_ACTION]


#Keys
NAME_KEY = 'name'
PARENT_ID_KEY = 'parentID'
REDIRECTED_REFERENCES = 'redirectedReferences'



#Currently supports only single csv files.
#TODO - Add support for directories.

#Usage: $paster shell
#>>>from paster_scripts import import_taxonomy_composistion_enhancements_from_csv_files
#>>>import_taxonomy_composistion_enhancements_from_csv_files.run(enhancementsCsvFilesPath='paster_scripts/taxonomy-enhancements-Spelling.csv')
def run(enhancementsCsvFilesPath):
    enhancementsCsvFilePath = enhancementsCsvFilesPath
    enhancementsCsvFile = open (enhancementsCsvFilePath, 'rb')   
    enhancementsCsvReader = csv.reader(enhancementsCsvFile, delimiter=',', quotechar='"')
    headerColNumMap = {}
    colNumHeaderMap = {}

    startTime = datetime.now()

    request.cookies['auth-qa-courses'] = 'eb4cb322aaed849fcb6be39de7d6612dde18dd21c738c26db7cb4d25ac364d18da83e8cb'
    request.cookies['auth-gamma'] = '16f62448022d07bf50c5a7dc2e9be1104c7dd5200620af1403c04050a05e09c2cfb77b79'

    #Set up the logger
    LOG_FILENAME = "/opt/2.0/log/import_taxonomy_composistion_enhancements_from_csv_files."+os.path.splitext(os.path.basename(enhancementsCsvFilesPath))[0]+".log"
    handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=1000*1024*1024, backupCount=5)
    log = logging.getLogger(__name__)
    log.setLevel(logging.DEBUG)
    log.addHandler(handler)
    handler.doRollover()

    #api.clearAllIndexes()
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
                #regular row containing enhancement.
                colNumValueMap = {}
                for colNum, colValue in enumerate(row):
                    colValue = colValue.strip()
                    if colValue:
                        colNumValueMap[colNum] = colValue

                if colNumValueMap.get(headerColNumMap.get(ACTION_HEADER)):
                    if request.POST:
                        request.POST.clear()
                    action = colNumValueMap.get(headerColNumMap.get(ACTION_HEADER))
                    actionResult = '{}'
                    if action in RECOGNIZED_ACTIONS:
                        request.method = 'POST'
                        encodedID = colNumValueMap.get(headerColNumMap.get(ENCODED_ID_HEADER))
                        if action == ADD_AS_REDIRECTED_REFERENCE_ACTION:
                            if TARGET_ENCODED_ID_HEADER in headerColNumMap and colNumValueMap.get(headerColNumMap.get(TARGET_ENCODED_ID_HEADER)):
                                targetEncodedID = colNumValueMap.get(headerColNumMap.get(TARGET_ENCODED_ID_HEADER))
                                request.POST['id'] = targetEncodedID
                                request.POST['redirectedReferences'] = encodedID
                                actionResult  = conceptnodeController.update()
                            else:
                                raise Exception(u"Row with out {column} is found for {action}. {column} is mandatory for {action}".format(column=TARGET_ENCODED_ID_HEADER, action=ADD_AS_REDIRECTED_REFERENCE_ACTION).encode('utf-8'))
                        elif action == UPDATE_PARENT_ACTION:
                            if TARGET_ENCODED_ID_HEADER in headerColNumMap and colNumValueMap.get(headerColNumMap.get(TARGET_ENCODED_ID_HEADER)):
                                targetEncodedID = colNumValueMap.get(headerColNumMap.get(TARGET_ENCODED_ID_HEADER))
                                request.POST['id'] = encodedID
                                request.POST['parentID'] = targetEncodedID
                                actionResult  = conceptnodeController.update()
                            else:
                                raise Exception(u"Row with out {column} is found for {action}. {column} is mandatory for {action}".format(column=TARGET_ENCODED_ID_HEADER, action=UPDATE_PARENT_ACTION).encode('utf-8'))
                        elif action == UPDATE_ACTION:
                            if NAME_HEADER in headerColNumMap and colNumValueMap.get(headerColNumMap.get(NAME_HEADER)):
                                name = colNumValueMap.get(headerColNumMap.get(NAME_HEADER))
                                request.POST['name'] = name
                            if request.POST:
                                request.POST['id'] = encodedID
                                actionResult  = conceptnodeController.update()
                        elif action == DELETE_ACTION:
                            request.POST['conceptNodeID'] = encodedID
                            actionResult  = conceptnodeController.delete()
                    else:
                        raise Exception(u"Unrecognized action: [{action}] encountered, Ignoring it".format(action=action).encode('utf-8'))
                    
                    actionResult = json.loads(actionResult)
                    if actionResult and actionResult.get('responseHeader') and actionResult['responseHeader'].get('status') != 0:
                        raise Exception(actionResult.get('response', {}).get('message'))
                else:
                    raise Exception(u"Row with out {column} is found.{column} is mandatory".format(column=ACTION_HEADER, enhancementsCsvFilePath=enhancementsCsvFilePath, rowNum=rowNum).encode('utf-8'))

                print "SUCCESS - Procession of rowNum: "+str(rowNum)+" in the received enhancementsCsvFile: "+enhancementsCsvFilePath+" is successfull."
                print
                log.info("SUCCESS - Procession of rowNum: "+str(rowNum)+" in the received enhancementsCsvFile: "+enhancementsCsvFilePath+" is successfull.")
                log.info("")
            except Exception, exception:
                print "ERROR - Procession of rowNum: "+str(rowNum)+" in the received enhancementsCsvFile: "+enhancementsCsvFilePath+" failed with reason: "+str(exception)+"."
                print 
                log.info("ERROR - Procession of rowNum: "+str(rowNum)+" in the received enhancementsCsvFile: "+enhancementsCsvFilePath+" failed with reason: "+str(exception)+".")
                log.exception(exception)
                log.info("")

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
