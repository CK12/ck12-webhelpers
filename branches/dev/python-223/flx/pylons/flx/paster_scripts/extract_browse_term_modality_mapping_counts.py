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
from sqlalchemy import func

#Usage: $paster shell
#>>>from paster_scripts import extract_browse_term_modality_mapping_counts
#>>>extract_browse_term_modality_mapping_counts.run(subjectID='MAT', branchID='ALG')
def run(subjectID, branchID):

    #Set up the logger
    LOG_FILENAME = "/opt/2.0/log/extract_browse_term_modality_mapping_counts."+str(subjectID)+"."+str(branchID)+".log"
    handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=1000*1024*1024, backupCount=5)
    log = logging.getLogger(__name__)
    log.setLevel(logging.DEBUG)
    log.addHandler(handler)
    handler.doRollover()

    try:
        browseTermEncodedIDPrefix = str(subjectID)+'.'+str(branchID)
        if not browseTermEncodedIDPrefix or not isinstance(browseTermEncodedIDPrefix, basestring):
            raise Exception("Invalid browseTermEncodedIDPrefix: "+str(browseTermEncodedIDPrefix)+" received.")

        startTime = datetime.now()

        meta.Session.begin()
        browseTermEncodedIDPrefixRegex = browseTermEncodedIDPrefix+'%'
        browseTermInfos = meta.Session.query(meta.BrowseTerms.c.id, meta.BrowseTerms.c.encodedID).filter(meta.BrowseTerms.c.encodedID.like(browseTermEncodedIDPrefixRegex)).all()
        browseTermIDEncodedIDMap = {}
        for browseTermInfo in browseTermInfos:
            browseTermID = browseTermInfo[0]
            browseTermEncodedID = browseTermInfo[1]
            browseTermIDEncodedIDMap[browseTermID] = browseTermEncodedID

        browseTermEncodedIDModalityMappingCountsMap = {}
        browseTermIDs = browseTermIDEncodedIDMap.keys()
        browseTermIDChunks = [browseTermIDs[x:x + 50] for x in xrange(0, len(browseTermIDs), 50)]
        for browseTermIDChunk in browseTermIDChunks:
            browseTermModalityMappingCountsInfos = meta.Session.query(meta.RelatedArtifacts.c.domainID, func.count(meta.RelatedArtifacts.c.artifactID)).filter(meta.RelatedArtifacts.c.domainID.in_(browseTermIDChunk)).group_by(meta.RelatedArtifacts.c.domainID).all()
            for browseTermModalityMappingCountsInfo in browseTermModalityMappingCountsInfos:
                browseTermID = browseTermModalityMappingCountsInfo[0]
                browseTermModalityMappingCount = browseTermModalityMappingCountsInfo[1]
                browseTermEncodedIDModalityMappingCountsMap[browseTermIDEncodedIDMap[browseTermID]] = browseTermModalityMappingCount

        #serialize the encodedIDModalityMappingCounts dict        
        browseTermModalityMappingCountsJsonFilePath = '/opt/2.0/taxonomy/data/collection/'+browseTermEncodedIDPrefix+'-modalityMappingCounts.json'        
        browseTermModalityMappingCountsJsonFile = open(browseTermModalityMappingCountsJsonFilePath, 'w') 
        browseTermModalityMappingCountsJsonFile.write(json.dumps(browseTermEncodedIDModalityMappingCountsMap))
        browseTermModalityMappingCountsJsonFile.close()

        print "Succesfully extracted the browse term modality mapping counts to: "+browseTermModalityMappingCountsJsonFilePath
        log.info("Succesfully extracted the browse term modality mapping counts to: "+browseTermModalityMappingCountsJsonFilePath)

        endTime = datetime.now()
        timeTaken = endTime - startTime
        print
        print "Total Time Taken: "+str(timeTaken.seconds)+" seconds."
        print "Total Time Taken: "+str(timeTaken.seconds/60)+" minutes, "+str(timeTaken.seconds%60)+" seconds."
        log.info("")
        log.info("Total Time Taken: "+str(timeTaken.seconds)+" seconds.")
        log.info("Total Time Taken: "+str(timeTaken.seconds/60)+" minutes, "+str(timeTaken.seconds%60)+" seconds.")
    except SQLAlchemyError, sqlae:
        meta.Session.rollback()
        print "ERROR - Extraction of the modality mapping counts failed with reason: SQLAlchemyError - "+str(sqlae)+"."
        print
        log.info("ERROR - Extraction of the modality mapping counts failed with reason: SQLAlchemyError - "+str(sqlae)+".")
        log.exception(sqlae)
        log.info("")
    except (KeyboardInterrupt, SystemExit) as e:
        meta.Session.rollback()
        print "ERROR - Extraction of the modality mapping counts failed with reason: KeyboardInterrupt - "+str(e)+"."
        print
        log.info("ERROR - Extraction of the modality mapping counts failed with reason: KeyboardInterrupt - "+str(e)+".")
        log.exception(e)
        log.info("")
        sys.exit(-1)
    except Exception, e:
        meta.Session.rollback()
        print "ERROR - Extraction of the modality mapping counts failed with reason: "+str(e)+"."
        print 
        log.info("ERROR - Extraction of the modality mapping counts failed with reason: "+str(e)+".")
        log.exception(e)
        log.info("")
    finally:
        meta.Session.close()
        handler.close()
        log.removeHandler(handler)
