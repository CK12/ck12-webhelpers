import logging
import time
import sys
import zlib
import re
import csv
import os.path

from datetime import datetime
from sts.controllers import collectionServiceManager
from sts.model import api
from sts.util import util

collectionServiceController = collectionServiceManager.CollectionServiceController()

#Headers - CSV
COLLECTION_HANDLE_HEADER = 'Collection Handle';
COLLECTION_NAME_HEADER = 'Collection Name';
COLLECTION_DESCRIPTION_HEADER = 'Collection Description';
COLLECTION_CANONICAL_ID_HEADER = 'Collection Canonical ID';
COLLECTION_PARENT_SUBJECT_ID_HEADER = 'Collection Parent Subject ID';

#CanonicalID & ParentSubjectID are not mandatory. 
#They are nor part of identifier headers.
COLLECTION_IDENTIFIER_HEADERS = [COLLECTION_HANDLE_HEADER, COLLECTION_NAME_HEADER, COLLECTION_DESCRIPTION_HEADER]

LEVEL_HEADER_PREFIX = 'Level'
ENCODED_ID_HEADER = 'EncodedID'
MODALITY_IDS_HEADER = 'ModalityIDs'
PREVIEW_EID_HEADER = 'Preview EID'
DESCRIPTION_HEADER = 'Description'

ORIGINAL_ENCODED_IDS_HEADER  = 'Original EncodedIDs'
CONTENT_LEVEL_HEADER = 'Content Level'
NOTES_HEADER = 'Notes'
INCLUDES_NON_ALG_EIDS_HEADER = 'Includes non ALG EIDs'
ORIGINAL_ORDER_HEADER = 'Original Order'
OLD_EID_HEADER = 'OLD EID / (CORRECT)'
NOTES_QUESTIONS_HEADER = 'Notes/Questions'
OLD_ENCODED_ID_HEADER = 'Old Encoded ID'
INCLUDES_NON_PRB_EIDS_HEADER = 'Includes non PRB EIDs'
EIDS_WITH_NO_CONTENT_AND_NO_UGC_HEADER = "EID's with no content and no UGC"
ORIGINAL_EIDS_HEADER = 'Original EIDs'
OLD_EIDS_HEADER = 'Old EIDs'
IGNORE_HEADERS = [ORIGINAL_ENCODED_IDS_HEADER, CONTENT_LEVEL_HEADER, NOTES_HEADER, INCLUDES_NON_ALG_EIDS_HEADER, ORIGINAL_ORDER_HEADER, OLD_EID_HEADER, NOTES_QUESTIONS_HEADER, OLD_ENCODED_ID_HEADER, INCLUDES_NON_PRB_EIDS_HEADER, EIDS_WITH_NO_CONTENT_AND_NO_UGC_HEADER, ORIGINAL_EIDS_HEADER, OLD_EIDS_HEADER]

IGNORE_ENCODED_IDS = ['_MISSING_']


#Keys - Node Dict
HANDLE_KEY = 'handle'
TITLE_KEY = 'title'
DESCRIPTION_KEY = 'description'
ENCODED_ID_KEY = 'encodedID'
MODALITY_IDS_KEY = 'modalityIDs'
SEQUENCE_KEY = 'sequence'
CONTAINS_KEY = 'contains'
MEMBER_ID_KEY = 'memberID'
IS_PUBLISHED_KEY = 'isPublished'
FORCE_CREATE_KEY = 'forceCreate'
CANONICAL_ID_KEY = 'canonicalID'
PARENT_SUBJECT_ID_KEY = 'parentSubjectID'
PREVIEW_EID_KEY = 'previewEID'

#Map
OTHER_HEADER_KEY_MAP = {
    PREVIEW_EID_HEADER : PREVIEW_EID_KEY,
    DESCRIPTION_HEADER : DESCRIPTION_KEY
}

def _validateAndExtractCollectionNodeModalityIDs(collectionNodeModalityIDs):
    if not isinstance(collectionNodeModalityIDs, basestring):
        raise Exception(u"Invalid collectionNodeModalityIDs: [{collectionNodeModalityIDs}] received. A valid string is expected.".format(collectionNodeModalityIDs=collectionNodeModalityIDs).encode('utf-8'))

    processedCollectionNodeModalityIDs = []
    collectionNodeModalityIDs = collectionNodeModalityIDs.strip()
    collectionNodeModalityIDs = collectionNodeModalityIDs.strip(',')
    collectionNodeModalityIDs = collectionNodeModalityIDs.split(',')
    for collectionNodeModalityID in collectionNodeModalityIDs:
        collectionNodeModalityID = collectionNodeModalityID.strip()
        collectionNodeModalityID = collectionNodeModalityID.strip('\n')
        collectionNodeModalityIDParts = collectionNodeModalityID.split('\n')
        for collectionNodeModalityIDPart in collectionNodeModalityIDParts:
            collectionNodeModalityIDPart = collectionNodeModalityIDPart.strip()
            collectionNodeModalityID = collectionNodeModalityIDPart
            if collectionNodeModalityID not in ('ALL', 'all', 'All', '_ALL_', '_all_', '_All_'):
                try:
                    collectionNodeModalityID=long(collectionNodeModalityID)
                except (ValueError, TypeError) as e:
                    raise Exception(u"Invalid collectionNodeModalityID: [{collectionNodeModalityID}] is present in the received collectionNodeModalityIDs : [{collectionNodeModalityIDs}].".format(collectionNodeModalityID=collectionNodeModalityID,collectionNodeModalityIDs=collectionNodeModalityIDs).encode('utf-8'))
            else:
                collectionNodeModalityID = 'ALL'
            if collectionNodeModalityID not in processedCollectionNodeModalityIDs:
                processedCollectionNodeModalityIDs.append(collectionNodeModalityID)
    return processedCollectionNodeModalityIDs

def _persistCollections(memberDict, collectionIndexCollectionDictMap, collectionIndexCollectionNodeHandleEncodedIDModalityIDsMap, collectionCreatorID, collectionCsvFilePath, isForceCollectionCreationEnabled, logger=None):
    if not isinstance(memberDict, dict) or not memberDict.get(MEMBER_ID_KEY):
        raise Exception(u"Invalid memberDict: [{memberDict}] received. A  dict with MEMBER_ID_KEY:[{MEMBER_ID_KEY}] is expected.".format(memberDict=memberDict, MEMBER_ID_KEY=MEMBER_ID_KEY).encode('utf-8'))

    if not isinstance(collectionIndexCollectionDictMap, dict):
        raise Exception(u"Invalid collectionIndexCollectionDictMap: [{collectionIndexCollectionDictMap}] received. A  dict is expected.".format(collectionIndexCollectionDictMap=collectionIndexCollectionDictMap).encode('utf-8'))

    if not all([ isinstance(collectionDict, dict) and collectionDict.get(HANDLE_KEY) for collectionDict in collectionIndexCollectionDictMap.values()]):
        raise Exception(u"Invalid collectionIndexCollectionDictMap: [{collectionIndexCollectionDictMap}] received. A  dict which maps collectionIndex to the collectionDict is expected.".format(collectionIndexCollectionDictMap=collectionIndexCollectionDictMap).encode('utf-8'))

    if not isinstance(collectionCsvFilePath, basestring) or not(collectionCsvFilePath.endswith('.csv')):
        raise Exception(u"Invalid collectionCsvFilePath: [{collectionCsvFilePath}] received. A string which denotes a csvFile path is expected.".format(collectionCsvFilePath=collectionCsvFilePath).encode('utf-8'))

    collectionModalityMappingsCsvFilePath = collectionCsvFilePath[:len(collectionCsvFilePath)-4]+'-modalityMappings.csv'
    collectionModalityMappingsCsvFileAlreadyExists = False
    if os.path.isfile(collectionModalityMappingsCsvFilePath):
        collectionModalityMappingsCsvFileAlreadyExists = True

    collectionModalityMappingsCsvFileMode = 'a'
    if isForceCollectionCreationEnabled:
        collectionModalityMappingsCsvFileMode = 'w'
    collectionModalityMappingsCsvFile = open (collectionModalityMappingsCsvFilePath, collectionModalityMappingsCsvFileMode) 
    collectionModalityMappingsWriter = csv.writer(collectionModalityMappingsCsvFile, delimiter=',', quotechar='"')
    if not collectionModalityMappingsCsvFileAlreadyExists or collectionModalityMappingsCsvFileMode == 'w':
        collectionModalityMappingsHeaderRow = ['Concept Collection Handle', 'Collection CreatorID', 'EncodedID', 'ModalityIDs']
        collectionModalityMappingsWriter.writerow(collectionModalityMappingsHeaderRow)

    for collectionIndex, collectionDict in collectionIndexCollectionDictMap.items():
        if collectionDict:
            collectionHandleOrTitle = collectionDict.get(HANDLE_KEY)
            if not collectionHandleOrTitle:
                collectionHandleOrTitle = collectionDict.get(TITLE_KEY)
            processedCollectionHandleOrTitle = collectionServiceController._validateAndProcessCollectionHandle(collectionHandleOrTitle)

            isCollectionCreated = False
            try:
                print
                print "COLLECTION_INDEX: "+str(collectionIndex)+" - "+"CREATING COLLECTION: "+str(processedCollectionHandleOrTitle)
                if logger:
                    logger.info("")
                    logger.info("COLLECTION_INDEX: "+str(collectionIndex)+" - "+"CREATING COLLECTION: "+str(processedCollectionHandleOrTitle))
                collectionServiceController._validateAndProcessCollectionDict(collectionDict)
                responseDict = collectionServiceController.businessLogic.createCollection(memberDict, collectionDict)
                print "COLLECTION_INDEX: "+str(collectionIndex)+" - "+"COLLECTION: "+str(processedCollectionHandleOrTitle)+" SUCCESSFULLY CREATED."
                if logger:
                    logger.info("COLLECTION_INDEX: "+str(collectionIndex)+" - "+"COLLECTION: "+str(processedCollectionHandleOrTitle)+" SUCCESSFULLY CREATED.")
                isCollectionCreated = True
            except Exception, exception:
                print "COLLECTION_INDEX: "+str(collectionIndex)+" - "+"COLLECTION: "+str(processedCollectionHandleOrTitle)+" CREATION FAILED WITH REASON: "+str(exception)+"."
                print 
                if logger:
                    logger.info("COLLECTION_INDEX: "+str(collectionIndex)+" - "+"COLLECTION: "+str(processedCollectionHandleOrTitle)+" CREATION FAILED WITH REASON: "+str(exception)+".")
                    logger.exception(exception)
                    logger.info("")

            #now for the createdCollection add the coresponding handle-encodingID-modalityIDs mappings to the CSV
            if isCollectionCreated:
                print "COLLECTION_INDEX: "+str(collectionIndex)+" - "+"ADDING MODALITY-MAPPINGS FOR COLLECTION: "+str(processedCollectionHandleOrTitle)
                if logger:
                    logger.info("COLLECTION_INDEX: "+str(collectionIndex)+" - "+"ADDING MODALITY-MAPPINGS FOR COLLECTION: "+str(processedCollectionHandleOrTitle))
                if collectionIndex in collectionIndexCollectionNodeHandleEncodedIDModalityIDsMap:
                    collectionNodeHandleEncodedIDModalityIDsMap = collectionIndexCollectionNodeHandleEncodedIDModalityIDsMap.get(collectionIndex)
                    for collectionNodeHandle, collectionNodeHandleEncodedIDModalityIDs in collectionNodeHandleEncodedIDModalityIDsMap.items():
                        encodedID = collectionNodeHandleEncodedIDModalityIDs.get('encodedID')
                        modalityIDs = collectionNodeHandleEncodedIDModalityIDs.get('modalityIDs')
                        collectionModalityMappingsWriter.writerow([collectionNodeHandle, collectionCreatorID, encodedID, ' '.join(str(modalityID) for modalityID in modalityIDs)])
                print "COLLECTION_INDEX: "+str(collectionIndex)+" - "+"SUCCESSFULLY ADDED MODALITY-MAPPINGS FOR COLLECTION: "+str(processedCollectionHandleOrTitle)
                print 
                if logger:
                    logger.info("COLLECTION_INDEX: "+str(collectionIndex)+" - "+"SUCCESSFULLY ADDED MODALITY-MAPPINGS FOR COLLECTION: "+str(processedCollectionHandleOrTitle))
                    logger.info("")


#Currently supports only single csv files with multiple collections if required.
#TODO - Add support for directories.

#Usage: $paster shell
#>>>from paster_scripts import import_collections_from_csv_files
#>>>import_collections_from_csv_files.run(collectionCsvFilesPath='/opt/2.0/taxonomy/data/collection/alg-collection.csv', collectionCreatorID=3L, isPublished=True, forceCollectionCreation=True)
def run(collectionCsvFilesPath, collectionCreatorID=3L, isPublished=True, forceCollectionCreation=False):
    collectionCsvFilePath = collectionCsvFilesPath
    collectionCsvFile = open (collectionCsvFilePath, 'rb')   
    collectionCsvReader = csv.reader(collectionCsvFile, delimiter=',', quotechar='"')
    
    startTime = datetime.now()

    #Set up the logger
    LOG_FILENAME = "/opt/2.0/log/import_collections_from_csv_files."+os.path.splitext(os.path.basename(collectionCsvFilesPath))[0]+"."+str(collectionCreatorID)+".log"
    handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=1000*1024*1024, backupCount=5)
    log = logging.getLogger(__name__)
    log.setLevel(logging.DEBUG)
    log.addHandler(handler)
    handler.doRollover()

    #api.clearAllIndexes()

    headerColNumMap = {}
    colNumHeaderMap = {}
    memberDict = {MEMBER_ID_KEY : collectionCreatorID}
    #An index to remember the position of collection in the current sheet
    collectionIndex = 1;
    collectionIndexCollectionDictMap = {}
    collectionIndexCollectionNodeHandleEncodedIDModalityIDsMap = {}
    collectionDict = {}
    for rowNum, row in enumerate(collectionCsvReader):
        if rowNum == 0:
            #header row. prepare the headerDicts
            for colNum, colValue in enumerate(row):
                colValue = colValue.strip()
                if colValue:
                    headerColNumMap[colValue] = colNum
                    colNumHeaderMap[colNum] = colValue
            
            headers = headerColNumMap.keys()
            if not all([COLLECTION_IDENTIFIER_HEADER in headers for COLLECTION_IDENTIFIER_HEADER in COLLECTION_IDENTIFIER_HEADERS]):
                raise Exception(u"Invalid 'headersRow' is found in the received collectionCsvFile: [{collectionCsvFilePath}]. It should contain all the collectionIdentifierHeaders: [{collectionIdentifierHeaders}].".format(collectionCsvFilePath=collectionCsvFilePath, collectionIdentifierHeaders=COLLECTION_IDENTIFIER_HEADERS).encode('utf-8'))
            
            if MODALITY_IDS_HEADER in headers and ENCODED_ID_HEADER not in headers:
                raise Exception(u"Invalid 'headersRow' is found in the received collectionCsvFile: [{collectionCsvFilePath}]. ENCODED_ID_HEADER should be present when the MODALITY_IDS_HEADER is present.".format(collectionCsvFilePath=collectionCsvFilePath).encode('utf-8'))

            duplicateHeaders = [header for header in headers if headers.count(header) > 1]
            if duplicateHeaders:
                raise Exception(u"Invalid 'headersRow' is found in the received collectionCsvFile: [{collectionCsvFilePath}]. duplicateHeaders: [{duplicateHeaders}] are found.".format(collectionCsvFilePath=collectionCsvFilePath, duplicateHeaders=duplicateHeaders).encode('utf-8'))
        else:
            #regular row containing collection content.
            colNumValueMap = {}
            for colNum, colValue in enumerate(row):
                colValue = colValue.strip()
                if colValue:
                    colNumValueMap[colNum] = colValue

            if headerColNumMap.get(COLLECTION_HANDLE_HEADER) in colNumValueMap:
                #new collection starting. persist the existingCollection and start / create a new collection.
                
                #append the collectionDict
                if collectionDict:
                    collectionIndexCollectionDictMap[collectionIndex] = collectionDict
                    collectionIndex = collectionIndex+1

                #start a new collectionDict
                rootCollectionNodeDict = {}
                endColNumParentNodeDictMap = {}
                rootCollectionNodeHandle = colNumValueMap.get(headerColNumMap.get(COLLECTION_HANDLE_HEADER))
                rootCollectionNodeDict[HANDLE_KEY] = rootCollectionNodeHandle
                endColNum = headerColNumMap.get(COLLECTION_HANDLE_HEADER)

                rootCollectionNodeTitle = colNumValueMap.get(headerColNumMap.get(COLLECTION_NAME_HEADER))
                if rootCollectionNodeTitle:
                    rootCollectionNodeDict[TITLE_KEY] = rootCollectionNodeTitle
                    if headerColNumMap.get(COLLECTION_NAME_HEADER) > endColNum:
                        endColNum = headerColNumMap.get(COLLECTION_NAME_HEADER)

                rootCollectionNodeDescription = colNumValueMap.get(headerColNumMap.get(COLLECTION_DESCRIPTION_HEADER))    
                if rootCollectionNodeDescription:
                    rootCollectionNodeDict[DESCRIPTION_KEY] = rootCollectionNodeDescription
                    if headerColNumMap.get(COLLECTION_DESCRIPTION_HEADER) > endColNum:
                        endColNum = headerColNumMap.get(COLLECTION_DESCRIPTION_HEADER)

                rootCollectionNodeCanonicalID = colNumValueMap.get(headerColNumMap.get(COLLECTION_CANONICAL_ID_HEADER))
                if rootCollectionNodeCanonicalID:
                    rootCollectionNodeDict[CANONICAL_ID_KEY] = rootCollectionNodeCanonicalID
                    if headerColNumMap.get(COLLECTION_CANONICAL_ID_HEADER) > endColNum:
                        endColNum = headerColNumMap.get(COLLECTION_CANONICAL_ID_HEADER)

                rootCollectionNodeParentSubjectID = colNumValueMap.get(headerColNumMap.get(COLLECTION_PARENT_SUBJECT_ID_HEADER))
                if rootCollectionNodeParentSubjectID:
                    rootCollectionNodeDict[PARENT_SUBJECT_ID_KEY] = rootCollectionNodeParentSubjectID
                    if headerColNumMap.get(COLLECTION_PARENT_SUBJECT_ID_HEADER) > endColNum:
                        endColNum = headerColNumMap.get(COLLECTION_PARENT_SUBJECT_ID_HEADER)                    

                if isPublished:
                    rootCollectionNodeDict[IS_PUBLISHED_KEY] = isPublished
                
                if forceCollectionCreation:
                    rootCollectionNodeDict[FORCE_CREATE_KEY] = forceCollectionCreation

                endColNumParentNodeDictMap[endColNum] = rootCollectionNodeDict
                collectionDict = rootCollectionNodeDict
            else:
                rootCollectionNodeHandle = collectionDict.get(HANDLE_KEY)
                if rootCollectionNodeHandle:
                    rootCollectionNodeHandle = collectionServiceController._validateAndProcessCollectionHandle(rootCollectionNodeHandle)

                #collection continuation. keep parsing and adding to the collection dict.
                if colNumValueMap.keys():
                    startColNum = min(colNumValueMap.keys())
                    smallerEndColNumsInPreviousRows = [endColNum for endColNum in endColNumParentNodeDictMap if endColNum < startColNum]
                    if smallerEndColNumsInPreviousRows:
                        maxSmallerEndColNumInPreviousRows = max(smallerEndColNumsInPreviousRows)
                        parentNodeDict = endColNumParentNodeDictMap.get(maxSmallerEndColNumInPreviousRows)
                        collectionNodeDict = {}
                        endColNum = startColNum
                        collectionNodeModalityIDs = []
                        for colNum, colValue in colNumValueMap.items():
                            colHeader = colNumHeaderMap.get(colNum)
                            if colHeader:
                                #ignoreHeader.
                                if colHeader in IGNORE_HEADERS:
                                    continue

                                #levelHeader
                                if colHeader.startswith(LEVEL_HEADER_PREFIX):
                                    collectionNodeTitle = colValue
                                    collectionNodeDict[TITLE_KEY] = collectionNodeTitle
                                    if colNum > endColNum:
                                        endColNum = colNum
                                    continue

                                if colHeader == MODALITY_IDS_HEADER:
                                    collectionNodeEncodedID = colNumValueMap.get(headerColNumMap.get(ENCODED_ID_HEADER))
                                    if collectionNodeEncodedID:
                                        if collectionNodeEncodedID not in IGNORE_ENCODED_IDS:
                                            collectionNodeModalityIDs = colValue
                                            collectionNodeModalityIDs = _validateAndExtractCollectionNodeModalityIDs(collectionNodeModalityIDs)
                                    else:
                                        raise Exception(u"Invalid collection is found in the received collectionCsvFile: [{collectionCsvFilePath}]. modalityIDs received with out encodedID at rowNum: [{rowNum}] and colNum: [{colNum}].".format(collectionCsvFilePath=collectionCsvFilePath, rowNum=rowNum, colNum=colNum).encode('utf-8'))                                        
                                    continue

                                if colHeader == ENCODED_ID_HEADER:
                                    collectionNodeEncodedID = colNumValueMap.get(headerColNumMap.get(ENCODED_ID_HEADER))                                    
                                    if collectionNodeEncodedID:
                                        collectionNodeEncodedID = util.processEncodedID(collectionNodeEncodedID)
                                        collectionNodeDict[ENCODED_ID_KEY] = collectionNodeEncodedID
                                    continue

                                #otherHeader
                                collectionNodeDictKey = OTHER_HEADER_KEY_MAP.get(colHeader)
                                if collectionNodeDictKey:
                                    collectionNodeDict[collectionNodeDictKey] = colValue 
                                else:
                                    raise Exception(u"Invalid collection is found in the received collectionCsvFile: [{collectionCsvFilePath}]. Content received under unrecognised colHeader: [{colHeader}] at rowNum: [{rowNum}] and colNum: [{colNum}].".format(collectionCsvFilePath=collectionCsvFilePath, colHeader=colHeader, rowNum=rowNum, colNum=colNum).encode('utf-8'))
                            else:
                                raise Exception(u"Invalid collection is found in the received collectionCsvFile: [{collectionCsvFilePath}]. Content received under emptyHeader at rowNum: [{rowNum}] and colNum: [{colNum}].".format(collectionCsvFilePath=collectionCsvFilePath, rowNum=rowNum, colNum=colNum).encode('utf-8'))
                        
                        collectionNodeEncodedID = collectionNodeDict.get(ENCODED_ID_KEY)
                        collectionNodeTitle = collectionNodeDict.get(TITLE_KEY)
                        if collectionNodeTitle:
                            collectionNodeAbsoluteHandle =  collectionServiceController._validateAndProcessCollectionHandle(collectionNodeTitle)
                            collectionNodeHandle = collectionServiceController._validateAndAppendRootNonRootCollectionHandles(rootCollectionNodeHandle, collectionNodeAbsoluteHandle)

                        if collectionNodeEncodedID and collectionNodeTitle and collectionNodeEncodedID not in IGNORE_ENCODED_IDS:
                            if collectionIndex not in collectionIndexCollectionNodeHandleEncodedIDModalityIDsMap:
                                collectionIndexCollectionNodeHandleEncodedIDModalityIDsMap[collectionIndex] = {}

                            if collectionNodeHandle not in collectionIndexCollectionNodeHandleEncodedIDModalityIDsMap[collectionIndex]:
                                collectionIndexCollectionNodeHandleEncodedIDModalityIDsMap[collectionIndex][collectionNodeHandle] = {}

                            if 'encodedID' not in collectionIndexCollectionNodeHandleEncodedIDModalityIDsMap[collectionIndex][collectionNodeHandle]:
                                collectionIndexCollectionNodeHandleEncodedIDModalityIDsMap[collectionIndex][collectionNodeHandle]['encodedID'] = collectionNodeEncodedID

                            if 'modalityIDs' not in collectionIndexCollectionNodeHandleEncodedIDModalityIDsMap[collectionIndex][collectionNodeHandle]:
                                collectionIndexCollectionNodeHandleEncodedIDModalityIDsMap[collectionIndex][collectionNodeHandle]['modalityIDs'] = []

                            collectionIndexCollectionNodeHandleEncodedIDModalityIDs = collectionIndexCollectionNodeHandleEncodedIDModalityIDsMap[collectionIndex][collectionNodeHandle]['modalityIDs']
                            for collectionNodeModalityID in collectionNodeModalityIDs:
                                if collectionNodeModalityID not in collectionIndexCollectionNodeHandleEncodedIDModalityIDs:
                                    collectionIndexCollectionNodeHandleEncodedIDModalityIDs.append(collectionNodeModalityID)

                        if collectionNodeDict:
                            if not CONTAINS_KEY in parentNodeDict:
                                parentNodeDict[CONTAINS_KEY] = []
                            collectionNodeDict[SEQUENCE_KEY] = len(parentNodeDict[CONTAINS_KEY])+1
                            parentNodeDict[CONTAINS_KEY].append(collectionNodeDict)
                            endColNumParentNodeDictMap[endColNum] = collectionNodeDict
                    else:
                        raise Exception(u"Invalid collection is found in the received collectionCsvFile: [{collectionCsvFilePath}]. Content is present to the left of one of the collectionLevelHeader in rowNum: [{rowNum}] and colNum: [{colNum}].".format(collectionCsvFilePath=collectionCsvFilePath, rowNum=rowNum, colNum=colNum).encode('utf-8'))
                else:
                    #empty row received. Just ignore and move on.
                    pass

    if collectionDict:
        collectionIndexCollectionDictMap[collectionIndex] = collectionDict
        collectionIndex = collectionIndex+1
    
    _persistCollections(memberDict, collectionIndexCollectionDictMap, collectionIndexCollectionNodeHandleEncodedIDModalityIDsMap, collectionCreatorID, collectionCsvFilePath, forceCollectionCreation, log)
    
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
