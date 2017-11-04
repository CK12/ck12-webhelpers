import logging
import time
import sys
import zlib
import re
import csv
import os.path
import json
from pylons import request

from datetime import datetime
from sts.controllers import conceptnode
from sts.model import api
from sts.util import util

conceptnodeController = conceptnode.ConceptnodeController()

#Headers - CSV
ENCODED_ID_HEADER = 'EncodedID';

#EID and one of the level needs to be present
TAXONOMY_STRUCTURE_IDENTIFIER_HEADERS = [ENCODED_ID_HEADER]

#Keys - Node Dict
ENCODED_ID_KEY = 'encodedID'
ID_KEY = 'id'


#Currently supports only single csv file with a single taxonomy structure.
#Usage: $paster shell
#>>>from paster_scripts import delete_un_recongnized_taxonomy_concept_nodes
#>>>delete_un_recongnized_taxonomy_concept_nodes.run(taxonomyStructureCsvFilePath='/opt/2.0/taxonomy/data/collection/alg.csv', subjectID='MAT', branchID='ALG', deleteMode=None)
def run(taxonomyStructureCsvFilePath, subjectID, branchID, deleteMode=None):
    subjectID = str(subjectID)
    branchID = str(branchID)
    conceptNodeEncodedIDPrefix = subjectID+'.'+branchID

    NONE_DELETE_MODE = None
    STATUS_DELETE_MODE = 'STATUS_DELETE'
    HARD_NODE_DELETE_MODE = 'HARD_NODE_DELETE'
    deleteModes = [NONE_DELETE_MODE, STATUS_DELETE_MODE, HARD_NODE_DELETE_MODE]
    if deleteMode not in deleteModes:
        raise Exception("Invalid deleteMode: "+str(deleteMode)+" received. Valid deleteModes: "+str(deleteModes))

    taxonomyStructureCsvFile = open(taxonomyStructureCsvFilePath, 'rb')   
    taxonomyStructureCsvReader = csv.reader(taxonomyStructureCsvFile, delimiter=',', quotechar='"')
    headerColNumMap = {}
    colNumHeaderMap = {}

    startTime = datetime.now()

    request.cookies['auth-qa-courses'] = 'eb4cb322aaed849fcb6be39de7d6612dde18dd21c738c26db7cb4d25ac364d18da83e8cb'
    request.cookies['auth-gamma'] = '16f62448022d07bf50c5a7dc2e9be1104c7dd5200620af1403c04050a05e09c2cfb77b79'

    #Set up the logger
    LOG_FILENAME = "/opt/2.0/log/delete_un_recongnized_taxonomy_concept_nodes."+os.path.splitext(os.path.basename(taxonomyStructureCsvFilePath))[0]+"."+str(subjectID)+"."+str(branchID)+"."+str(deleteMode)+".log"
    handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=1000*1024*1024, backupCount=5)
    log = logging.getLogger(__name__)
    log.setLevel(logging.DEBUG)
    log.addHandler(handler)
    handler.doRollover()
    
    #api.clearAllIndexes()
    recognizedEncodedIDs = []
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
        else:
            try:
                #regular row.
                colNumValueMap = {}
                for colNum, colValue in enumerate(row):
                    colValue = colValue.strip()
                    if colValue:
                        colNumValueMap[colNum] = colValue
                
                #validate encodedID
                encodedID = colNumValueMap.get(headerColNumMap.get(ENCODED_ID_HEADER))
                if not encodedID:
                    raise Exception(u"Row with out {column} is found.{column} is mandatory.".format(column=ENCODED_ID_HEADER, taxonomyStructureCsvFilePath=taxonomyStructureCsvFilePath, rowNum=rowNum).encode('utf-8'))
                encodedID = util.processEncodedID(encodedID)
                encodedID = encodedID.decode('utf-8')
                recognizedEncodedIDs.append(encodedID)

            except Exception, exception:
                print "ERROR - Procession of rowNum: "+str(rowNum)+" in the received taxonomyStructureCsvFile: "+taxonomyStructureCsvFilePath+" failed with reason: "+str(exception)+"."
                print
                log.info("ERROR - Procession of rowNum: "+str(rowNum)+" in the received taxonomyStructureCsvFile: "+taxonomyStructureCsvFilePath+" failed with reason: "+str(exception)+".")
                log.exception(exception)
                log.info("")

    print "Extracted recognizedEncodedIDs: "
    print recognizedEncodedIDs
    print
    log.info("Extracted recognizedEncodedIDs: ")
    log.info(recognizedEncodedIDs)
    log.info("")

    encodedIDModalityMappingCountsMap = {}
    encodedIDModalityMappingCountsJsonFilePath = '/opt/2.0/taxonomy/data/collection/'+conceptNodeEncodedIDPrefix+'-modalityMappingCounts.json'        
    if os.path.isfile(encodedIDModalityMappingCountsJsonFilePath):
        try:
            encodedIDModalityMappingCountsJsonFile = open(encodedIDModalityMappingCountsJsonFilePath, 'r') 
            encodedIDModalityMappingCountsMap = json.loads(encodedIDModalityMappingCountsJsonFile.read())
        except (ValueError, TypeError) as e:
            raise Exception(u"Invalid encodedIDModalityMappingCountsJsonFile: [{encodedIDModalityMappingCountsJsonFilePath}] is present.".format(encodedIDModalityMappingCountsJsonFilePath=encodedIDModalityMappingCountsJsonFilePath).encode('utf-8'))
        finally:
            encodedIDModalityMappingCountsJsonFile.close()

    print "Loaded encodedIDModalityMappingCountsMap: "
    print encodedIDModalityMappingCountsMap
    print 
    log.info("Loaded encodedIDModalityMappingCountsMap: ")
    log.info(encodedIDModalityMappingCountsMap)
    log.info("")

    subject = api.getSubjectByShortname(subjectID)
    if not subject:
        raise Exception(u"Invalid subjectID: [{subjectID}] received. Could not find the corresponding subject in the database.".format(subjectID=subjectID).encode('utf-8'))
    subjectNodeID = subject.id
    
    branch = api.getBranchByShortname(branchID)
    if not branch:
        raise Exception(u"Invalid branchID: [{branchID}] received. Could not find the corresponding branch in the database.".format(branchID=branchID).encode('utf-8'))
    branchNodeID = branch.id

    currentEncodedIDs = []
    currentEncodedIDStatusMap = {}
    currentEncodedIDRedirectedReferencesMap = {}
    currentConceptNodesCount = api.getConceptNodes(subjectID=subjectNodeID, branchID=branchNodeID, pageSize=0).total
    if currentConceptNodesCount:
        currentConceptNodes = api.getConceptNodes(subjectID=subjectNodeID, branchID=branchNodeID, pageSize=currentConceptNodesCount)
        for currentConceptNode in currentConceptNodes:
            if currentConceptNode.encodedID not in currentEncodedIDs:
                currentEncodedIDs.append(currentConceptNode.encodedID)
                currentEncodedIDStatusMap[currentConceptNode.encodedID] = currentConceptNode.status
                currentEncodedIDRedirectedReferencesMap[currentConceptNode.encodedID] = currentConceptNode.redirectedReferences
    
    print "Queried currentEncodedIDs: " 
    print currentEncodedIDs
    print 
    log.info("Queried currentEncodedIDs: " )
    log.info(currentEncodedIDs)
    log.info("")

    print "Processing above 3 sets to evaluate the encodedIDs deletion."
    log.info("Processing above 3 sets to evaluate the encodedIDs deletion.")
    for currentEncodedID in currentEncodedIDs: 
        try:      
            if currentEncodedID not in recognizedEncodedIDs:
                if request.POST:
                    request.POST.clear()
                request.method = 'POST' 
                
                print currentEncodedID +" is eligible to be deleted."
                log.info(currentEncodedID +" is eligible to be deleted.")
                
                if currentEncodedID in encodedIDModalityMappingCountsMap and encodedIDModalityMappingCountsMap[currentEncodedID] > 0:
                    print currentEncodedID +" currently have non-zero modalityMappingsCount: "+str(encodedIDModalityMappingCountsMap[currentEncodedID])
                    log.info(currentEncodedID +" currently have non-zero modalityMappingsCount: "+str(encodedIDModalityMappingCountsMap[currentEncodedID]))

                if deleteMode == STATUS_DELETE_MODE and (currentEncodedIDStatusMap[currentEncodedID] != 'deleted' or currentEncodedIDRedirectedReferencesMap[currentEncodedID]):
                    request.POST['id'] = currentEncodedID
                    request.POST['status'] = 'deleted'
                    actionResult = '{}'
                    actionResult  = conceptnodeController.update()
                    actionResult = json.loads(actionResult)
                    if actionResult and actionResult.get('responseHeader') and actionResult['responseHeader'].get('status') != 0:
                        raise Exception(actionResult.get('response', {}).get('message'))
                    print currentEncodedID+" successfully status-deleted."
                    print
                    log.info(currentEncodedID+" successfully status-deleted.")
                    log.info("")
                elif deleteMode == HARD_NODE_DELETE_MODE:
                    request.POST['conceptNodeID'] = currentEncodedID
                    actionResult = '{}'
                    actionResult  = conceptnodeController.delete()
                    actionResult = json.loads(actionResult)
                    if actionResult and actionResult.get('responseHeader') and actionResult['responseHeader'].get('status') != 0:
                        raise Exception(actionResult.get('response', {}).get('message'))
                    print currentEncodedID+" successfully deleted."
                    print
                    log.info(currentEncodedID+" successfully deleted.")
                    log.info("")
                else:
                    print
                    log.info("")
        except Exception, exception:
            print "ERROR - Procession of encodedID: "+str(currentEncodedID)+" failed with reason: "+str(exception)+"."
            print
            log.info("ERROR - Procession of encodedID: "+str(currentEncodedID)+" failed with reason: "+str(exception)+".")
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
