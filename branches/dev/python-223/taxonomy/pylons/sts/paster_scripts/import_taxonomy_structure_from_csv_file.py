import logging
import time
import sys
import zlib
import re
import csv
import os.path
import json
import time

from pylons import request
from datetime import datetime
from sts.controllers import conceptnode
from sts.model import api, model
from sts.util import util

conceptnodeController = conceptnode.ConceptnodeController()

#Headers - CSV
ENCODED_ID_HEADER = 'EncodedID';
LEVEL_HEADER_PREFIX = 'Level'
DESCRIPTION_HEADER = 'Description'
ORIGINAL_ENCODED_IDS_HEADER = 'Original EncodedIDs'
HANDLE_HEADER = 'Handle'

#EID and one of the level needs to be present
TAXONOMY_STRUCTURE_IDENTIFIER_HEADERS = [ENCODED_ID_HEADER]

#Keys - Node Dict
NAME_KEY = 'name'
PARENT_ID_KEY = 'parentID'
DESCRIPTION_KEY = 'description'
ENCODED_ID_KEY = 'encodedID'
HANDLE_KEY = 'handle'
REDIRECTED_REFERENCES_KEY = 'redirectedReferences'
ID_KEY = 'id'
SUBJECT_ID_KEY = 'subjectID'
BRANCH_ID_KEY = 'branchID'
PERSIST_OLD_HANDLES_KEY = 'persistOldHandles'
EXTEND_REDIRECTED_REFERENCES_KEY = 'extendRedirectedReferences'
STATUS_KEY = 'status'


#Currently contains 'parentID', 'name', 'description'.
#Will be expanded to other attributes when included in CSV
def _shouldUpdate(currentPropertiesDict, newPropertiesDict):
    shouldUpdate = False
    for key, value in newPropertiesDict.items():
        if not shouldUpdate:
            if currentPropertiesDict.get(key) is None:
                shouldUpdate = True

            currentValue = currentPropertiesDict.get(key)
            if type(currentValue) == type(value) and currentValue != value:
                shouldUpdate = True

            if isinstance(currentValue, list) and isinstance(value, basestring):
                values = value.split(',')
                shouldUpdate = any([value for value in values if value not in currentValue])

    return shouldUpdate

#Currently supports only single csv file with a single taxonomy structure.
#Usage: $paster shell
#>>>from paster_scripts import import_taxonomy_structure_from_csv_file
#>>>import_taxonomy_structure_from_csv_file.run(taxonomyStructureCsvFilePath='/opt/2.0/taxonomy/data/collection/alg.csv', subjectID='MAT', branchID='ALG', forceUpdate=False, forceConflictingNodeUpdate=False)
def run(taxonomyStructureCsvFilePath, subjectID, branchID, forceUpdate=False, forceConflictingNodeUpdate=False):
    taxonomyStructureCsvFile = open (taxonomyStructureCsvFilePath, 'rb')   
    taxonomyStructureCsvReader = csv.reader(taxonomyStructureCsvFile, delimiter=',', quotechar='"')
    headerColNumMap = {}
    colNumHeaderMap = {}

    startTime = datetime.now()

    request.cookies['auth-qa-courses'] = 'eb4cb322aaed849fcb6be39de7d6612dde18dd21c738c26db7cb4d25ac364d18da83e8cb'
    request.cookies['auth-gamma'] = '16f62448022d07bf50c5a7dc2e9be1104c7dd5200620af1403c04050a05e09c2cfb77b79'
    
    #Set up the logger
    LOG_FILENAME = "/opt/2.0/log/import_taxonomy_structure_from_csv_file."+os.path.splitext(os.path.basename(taxonomyStructureCsvFilePath))[0]+"."+str(subjectID)+"."+str(branchID)+".log"
    handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=1000*1024*1024, backupCount=5)
    log = logging.getLogger(__name__)
    log.setLevel(logging.DEBUG)
    log.addHandler(handler)
    handler.doRollover()

    #api.clearAllIndexes()
    for rowNum, row in enumerate(taxonomyStructureCsvReader):
        if rowNum == 0:
            #header row. prepare the headerDicts
            for colNum, colValue in enumerate(row):
                colValue = colValue.strip()
                if colValue:
                    headerColNumMap[colValue] = colNum
                    colNumHeaderMap[colNum] = colValue
            
            headers = headerColNumMap.keys()
            if not all([TAXONOMY_STRUCTURE_IDENTIFIER_HEADER in headers for TAXONOMY_STRUCTURE_IDENTIFIER_HEADER in TAXONOMY_STRUCTURE_IDENTIFIER_HEADERS]):
                raise Exception(u"Invalid 'headersRow' is found in the received taxonomyStructureCsvFile: [{taxonomyStructureCsvFilePath}]. It should contain all the taxonomyStructureIdentifierHeaders: [{taxonomyStructureIdentifierHeaders}].".format(taxonomyStructureCsvFilePath=taxonomyStructureCsvFilePath, taxonomyStructureIdentifierHeaders=TAXONOMY_STRUCTURE_IDENTIFIER_HEADERS).encode('utf-8'))
            
            duplicateHeaders = [header for header in headers if headers.count(header) > 1]
            if duplicateHeaders:
                raise Exception(u"Invalid 'headersRow' is found in the received taxonomyStructureCsvFile: [{taxonomyStructureCsvFilePath}]. duplicateHeaders: [{duplicateHeaders}] are found.".format(taxonomyStructureCsvFilePath=taxonomyStructureCsvFilePath, duplicateHeaders=duplicateHeaders).encode('utf-8'))
            
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
                        raise Exception(u"Invalid 'headersRow' is found in the received taxonomyStructureCsvFile: [{taxonomyStructureCsvFilePath}]. Invalid level headers found at columnNum: [{columnNum}].".format(taxonomyStructureCsvFilePath=taxonomyStructureCsvFilePath, columnNum=headerColNumMap[levelHeader]).encode('utf-8'))
                    if levelHeaderNum <=0:
                        raise Exception(u"Invalid 'headersRow' is found in the received taxonomyStructureCsvFile: [{taxonomyStructureCsvFilePath}]. Invalid level headers found at columnNum: [{columnNum}].".format(taxonomyStructureCsvFilePath=taxonomyStructureCsvFilePath, columnNum=headerColNumMap[levelHeader]).encode('utf-8'))
                    levelHeaderColNumTolevelHeaderNumMap[headerColNumMap.get(levelHeader)] = levelHeaderNum
                else:
                    raise Exception(u"Invalid 'headersRow' is found in the received taxonomyStructureCsvFile: [{taxonomyStructureCsvFilePath}]. Invalid level headers found at columnNum: [{columnNum}].".format(taxonomyStructureCsvFilePath=taxonomyStructureCsvFilePath, columnNum=headerColNumMap[levelHeader]).encode('utf-8'))
        else:
            try:
                #regular row.
                #api.clearAllIndexes()
                colNumValueMap = {}
                for colNum, colValue in enumerate(row):
                    colValue = colValue.strip()
                    if colValue:
                        colNumValueMap[colNum] = colValue

                if request.POST:
                    request.POST.clear()
                request.method = 'POST'
                
                #validate encodedID
                encodedID = colNumValueMap.get(headerColNumMap.get(ENCODED_ID_HEADER))
                if not encodedID:
                    raise Exception(u"Row with out {column} is found.{column} is mandatory.".format(column=ENCODED_ID_HEADER).encode('utf-8'))
                encodedID = util.processEncodedID(encodedID)
                encodedID = encodedID.decode('utf-8')
                request.POST[ENCODED_ID_KEY] = encodedID

                #validate that only one levelColumn is given for every encodedID and process it for name and parentID
                currentRowLevelHeaderColNums = [headerColNumMap.get(levelHeader) for levelHeader in levelHeaders if colNumValueMap.get(headerColNumMap.get(levelHeader))]
                if len(currentRowLevelHeaderColNums) >1:
                    raise Exception(u"Row with multiple level headers is found. Only one level header is allowed at max.".encode('utf-8'))
                if currentRowLevelHeaderColNums:
                    currentRowLevelHeaderColNum = currentRowLevelHeaderColNums[0]
                    currentRowLevelHeaderNum = levelHeaderColNumTolevelHeaderNumMap[currentRowLevelHeaderColNum]
                    previousLevelHeaderNums = [ levelHeaderNum for levelHeaderNum in levelHeaderNumToParentEncodedIDMap.keys() if levelHeaderNum < currentRowLevelHeaderNum]
                    if previousLevelHeaderNums:
                        parentLevelHeaderNum = max(previousLevelHeaderNums)
                        parentEncodedID = levelHeaderNumToParentEncodedIDMap.get(parentLevelHeaderNum)
                        request.POST[PARENT_ID_KEY] = parentEncodedID
                    levelHeaderNumToParentEncodedIDMap[currentRowLevelHeaderNum] = encodedID

                    currentRowLevelHeaderValue = colNumValueMap.get(currentRowLevelHeaderColNum)
                    currentRowLevelHeaderValue = currentRowLevelHeaderValue.decode('utf-8')
                    request.POST[NAME_KEY] = currentRowLevelHeaderValue

                description = colNumValueMap.get(headerColNumMap.get(DESCRIPTION_HEADER))
                if description:
                    description = description.decode('utf-8')
                    request.POST[DESCRIPTION_KEY] = description

                handle = colNumValueMap.get(headerColNumMap.get(HANDLE_HEADER))
                if handle:
                    handle = handle.decode('utf-8')
                else:
                    if NAME_KEY in request.POST:
                        handle = model.name2Handle(request.POST[NAME_KEY])                    
                
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

                    originalEncodedIDs = ','.join(processedOriginalEncodedIDs)
                    originalEncodedIDs = originalEncodedIDs.decode('utf-8')
                    request.POST[REDIRECTED_REFERENCES_KEY] = originalEncodedIDs                    

                actionResult = '{}'

                if PARENT_ID_KEY in request.POST and request.POST[PARENT_ID_KEY] == request.POST[ENCODED_ID_KEY]:
                    raise Exception(u"Row with self referencing parentEncodedID: {parentEncodedID} is found".format(parentEncodedID=parentEncodedID).encode('utf-8'))

                if handle:
                    request.POST[HANDLE_KEY] = handle
                    #dummy-aize any node already existing with the current handle (name)
                    conceptNodesWithHandle = api.getConceptNodesWithHandle(handle, returnGraphNodes=True)
                    for conceptNodeWithHandle in conceptNodesWithHandle:
                        conceptNodeWithHandleProperties = None
                        if conceptNodeWithHandle:
                            conceptNodeWithHandleProperties = conceptNodeWithHandle._properties
                            if not conceptNodeWithHandleProperties:
                                conceptNodeWithHandleProperties = conceptNodeWithHandle.get_properties()
                        if conceptNodeWithHandleProperties and conceptNodeWithHandleProperties.get('encodedID') != request.POST[ENCODED_ID_KEY]:
                            print "Conflicting Node with encodedID: "+conceptNodeWithHandleProperties.get('encodedID')+" found for encodedID: "+request.POST[ENCODED_ID_KEY]
                            log.info("Conflicting Node with encodedID: "+conceptNodeWithHandleProperties.get('encodedID')+" found for encodedID: "+request.POST[ENCODED_ID_KEY])
                            if conceptNodeWithHandleProperties.get('status') != 'published' or forceConflictingNodeUpdate:
                                print "Updating Conflicting Node with dummyData."
                                log.info("Updating Conflicting Node with dummyData.")

                                actualNodePropertiesDict = {}
                                for key, value in request.POST.items():
                                    actualNodePropertiesDict[key] = value

                                if request.POST:
                                    request.POST.clear()
                                request.method = 'POST'
                                request.POST[ID_KEY] = conceptNodeWithHandleProperties['encodedID']
                                request.POST[NAME_KEY] = conceptNodeWithHandleProperties['name']+' '+str(time.time())
                                request.POST[PERSIST_OLD_HANDLES_KEY] = 'False'
                                request.POST[EXTEND_REDIRECTED_REFERENCES_KEY] = 'False'
                                request.POST[STATUS_KEY] = 'deleted'
                                actionResult = conceptnodeController.update()
                                actionResult = json.loads(actionResult)
                                if actionResult and actionResult.get('responseHeader') and actionResult['responseHeader'].get('status') != 0:
                                    raise Exception(actionResult.get('response', {}).get('message'))

                                if request.POST:
                                    request.POST.clear()
                                    request.method = 'POST'
                                for key, value in actualNodePropertiesDict.items():
                                    request.POST[key] = value
                                print "Conflicting Node updation successfull."
                                log.info("Conflicting Node updation successfull.")
                            else:
                                raise Exception((u'Conflicting Node update could not be done as it is a published node').encode('utf-8'))

                #Now perform the required operation (Update / Create) for actual node
                conceptNode = api.getConceptNodeByEncodedID(encodedID=encodedID)
                if conceptNode:
                    if forceUpdate or _shouldUpdate(conceptNode.info, request.POST):
                        request.POST[ID_KEY] = encodedID
                        request.POST[PERSIST_OLD_HANDLES_KEY] = 'False'
                        request.POST[EXTEND_REDIRECTED_REFERENCES_KEY] = 'False'
                        print "Should be updated. Going for an update."
                        log.info("Should be updated. Going for an update.")
                        actionResult = conceptnodeController.update()
                else:
                    request.POST[SUBJECT_ID_KEY] = subjectID
                    request.POST[BRANCH_ID_KEY] = branchID
                    print "Should be created. Going for a create."
                    log.info("Should be created. Going for a create.")
                    actionResult = conceptnodeController.create()
                
                actionResult = json.loads(actionResult)
                if actionResult and actionResult.get('responseHeader') and actionResult['responseHeader'].get('status') != 0:
                    raise Exception(actionResult.get('response', {}).get('message'))

                print "SUCCESS - Procession of rowNum: "+str(rowNum)+" in the received taxonomyStructureCsvFile: "+taxonomyStructureCsvFilePath+" is successfull."
                print
                log.info("SUCCESS - Procession of rowNum: "+str(rowNum)+" in the received taxonomyStructureCsvFile: "+taxonomyStructureCsvFilePath+" is successfull.")
                log.info("")
            except Exception, exception:
                print "ERROR - Procession of rowNum: "+str(rowNum)+" in the received taxonomyStructureCsvFile: "+taxonomyStructureCsvFilePath+" failed with reason: "+str(exception)
                print
                log.info("ERROR - Procession of rowNum: "+str(rowNum)+" in the received taxonomyStructureCsvFile: "+taxonomyStructureCsvFilePath+" failed with reason: "+str(exception))
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
