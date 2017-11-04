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
ORIGINAL_ENCODED_IDS_HEADER = 'Original EncodedIDs'

#EID and one of the level needs to be present
TAXONOMY_STRUCTURE_IDENTIFIER_HEADERS = [ENCODED_ID_HEADER]

#Keys - Node Dict
ENCODED_ID_KEY = 'encodedID'
ID_KEY = 'id'


#Currently supports only single csv file with a single taxonomy structure.
#Usage: $paster shell
#>>>from paster_scripts import extract_un_migrated_concept_nodes
#>>>extract_un_migrated_concept_nodes.run(subjectID='MAT', branchID='ALG')
def run(subjectID, branchID, outputDirectoryPath = '/opt/2.0/taxonomy/data/collection/'):
    subjectID = str(subjectID)
    branchID = str(branchID)
    conceptNodeEncodedIDPrefix = subjectID+'.'+branchID

    startTime = datetime.now()

    #api.clearAllIndexes()
    subject = api.getSubjectByShortname(subjectID)
    if not subject:
        raise Exception(u"Invalid subjectID: [{subjectID}] received. Could not find the corresponding subject in the database.".format(subjectID=subjectID).encode('utf-8'))
    subjectNodeID = subject.id
    
    branch = api.getBranchByShortname(branchID)
    if not branch:
        raise Exception(u"Invalid branchID: [{branchID}] received. Could not find the corresponding branch in the database.".format(branchID=branchID).encode('utf-8'))
    branchNodeID = branch.id

    #Set up the logger
    LOG_FILENAME = "/opt/2.0/log/extract_un_migrated_concept_nodes."+str(subjectID)+"."+str(branchID)+".log"
    handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=1000*1024*1024, backupCount=5)
    log = logging.getLogger(__name__)
    log.setLevel(logging.DEBUG)
    log.addHandler(handler)
    handler.doRollover()

    unRecognizedEncodedIDs = []
    unReconginzedEncodedIDHandleMap = {}
    currentConceptNodesCount = api.getConceptNodes(subjectID=subjectNodeID, branchID=branchNodeID, pageSize=0).total
    if currentConceptNodesCount:
        currentConceptNodes = api.getConceptNodes(subjectID=subjectNodeID, branchID=branchNodeID, pageSize=currentConceptNodesCount)
        for currentConceptNode in currentConceptNodes:
            if currentConceptNode.status != 'published':
                encodedID = currentConceptNode.encodedID
                encodedID = util.processEncodedID(encodedID)
                if encodedID not in unRecognizedEncodedIDs:
                    unRecognizedEncodedIDs.append(encodedID)
                    unReconginzedEncodedIDHandleMap[encodedID] = currentConceptNode.handle

    print "Queried unRecognizedEncodedIDs: " 
    print unRecognizedEncodedIDs
    print
    log.info("Queried unRecognizedEncodedIDs: ")
    log.info(unRecognizedEncodedIDs)
    log.info("")

    if unRecognizedEncodedIDs:
        if not outputDirectoryPath.endswith('/'):
            outputDirectoryPath = outputDirectoryPath+'/'
        outputCsvFilePath = outputDirectoryPath+branchID.lower()+'-unMigratedEIDs.csv'
        outputCsvFile = open(outputCsvFilePath, 'w') 
        outputWriter = csv.writer(outputCsvFile, delimiter=',', quotechar='"')
        headerRow = ['EncodedID', 'Handle']
        outputWriter.writerow(headerRow)

        unRecognizedEncodedIDsChunks = [unRecognizedEncodedIDs[x:x + 10] for x in xrange(0, len(unRecognizedEncodedIDs), 10)]
        for unRecognizedEncodedIDsChunk in unRecognizedEncodedIDsChunks:
            redirectionGraphConceptNodes = api.getGraphConceptNodesByRedirectedReferences(redirectedReferences=unRecognizedEncodedIDsChunk)
            redirectedReferenceToRedirectionPropertiesMap = {}
            for redirectionGraphConceptNode in redirectionGraphConceptNodes:
                redirectionGraphConceptNodeProperties = redirectionGraphConceptNode._properties
                if not redirectionGraphConceptNodeProperties:
                    redirectionGraphConceptNodeProperties = redirectionGraphConceptNode.get_properties()

                if redirectionGraphConceptNodeProperties.get('status') == 'published':
                    redirectedReferences = redirectionGraphConceptNodeProperties.get('redirectedReferences')
                    for redirectedReference in redirectedReferences:
                        redirectedReferenceToRedirectionPropertiesMap[redirectedReference] = redirectionGraphConceptNodeProperties

            for unRecognizedEncodedID in unRecognizedEncodedIDsChunk:
                print "Processing unRecognizedEncodedID: "+unRecognizedEncodedID
                log.info("Processing unRecognizedEncodedID: "+unRecognizedEncodedID)
                if unRecognizedEncodedID not in redirectedReferenceToRedirectionPropertiesMap:
                    print "Not Migrated"
                    log.info("Not Migrated")
                    outputWriter.writerow([unRecognizedEncodedID, unReconginzedEncodedIDHandleMap[unRecognizedEncodedID]])
                else:
                    print "Migrated to encodedID: "+str(redirectedReferenceToRedirectionPropertiesMap[unRecognizedEncodedID].get('encodedID'))
                    log.info("Migrated to encodedID: "+str(redirectedReferenceToRedirectionPropertiesMap[unRecognizedEncodedID].get('encodedID')))
                print 
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
