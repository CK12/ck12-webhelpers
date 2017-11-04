#!/usr/bin/python

import re
import htmlentitydefs
import sys
import os
from tempfile import NamedTemporaryFile
import logging
import csv
import math

maxLevels = 4
errors = 0

log = logging.getLogger(__file__)

LOG_FILENAME = "/tmp/assign_encodes.log"
## Initialize logging
try:
    logging.basicConfig(format="%(asctime)-15s %(levelname)-4s %(message)s", filename=LOG_FILENAME)
    log = logging.getLogger(__file__)
    log.setLevel(logging.INFO)
    handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=10*1024*1024, backupCount=5)
    log.addHandler(handler)
except:
    pass

def analyzeFile(file):
    log.info("Analyzing file: %s" % file)
    infile = open(file, "r")
    termCount = [0 for x in range(0, maxLevels)]
    rowCount = 0
    childrenCount = {}
    intTermCount = [0 for x in range(0, maxLevels)]
    rowPositions = [1 for x in range(0, maxLevels)]
    try:
        lastLevel = 0
        csvIn = csv.DictReader(infile)
        terms = [ '' for x in range(0, maxLevels) ]
        for row in csvIn:
            rowCount += 1
            foundNewMax = False
            level = 0
            term = ''
            for i in range(1, maxLevels+1):
                key = 'Level %d' % i
                if row.get(key):
                    level = i-1
                    term = '%s_%d' % (row[key], rowCount)
                    childrenCount[term] = 0
                    #log.info("Before Level: %d, lastLevel: %d, intTermCount: %s Term: %s" % (level, lastLevel, str(intTermCount), term))
                    if level != lastLevel:
                        if termCount[lastLevel] < intTermCount[lastLevel]:
                            foundNewMax = True
                        termCount[lastLevel] = max(intTermCount[lastLevel], termCount[lastLevel])
                    if level < lastLevel:
                        for j in range(level+1, maxLevels):
                            intTermCount[j] = 0
                    if level <= lastLevel:
                        childrenCount[terms[level]] = rowCount - rowPositions[level] - 1
                        log.info("Updated childrenCount of %s to %d" % (terms[level], childrenCount[terms[level]]))

                    terms[level] = term
                    rowPositions[level] = rowCount
                    intTermCount[level] += 1
                    if foundNewMax:
                        log.info("Found new max for level: %d!" % lastLevel)
                    log.info("After  Level: %d, lastLevel: %d, intTermCount: %s Term: %s, rowPositions: %s, Terms: %s" % (level, lastLevel, str(intTermCount), term, str(rowPositions), str(terms)))
                    lastLevel = level
                    break

        while lastLevel >= 0:
            if not childrenCount[terms[lastLevel]]:
                childrenCount[terms[lastLevel]] = rowCount - rowPositions[lastLevel]
                log.info("Updated childrenCount of %s to %d" % (terms[lastLevel], childrenCount[terms[lastLevel]]))
                lastLevel -= 1
        #termCount[0] = max(termCount[0], intTermCount[0])
        if rowCount > 1000:
            log.error("ERROR: Total number of rows (%d) exceeds 1000. We cannot assign encodes to all terms.")
        log.info("Finished analyzing: %s Rows: %d" % (file, rowCount))
        log.info("childrenCount: %s" % str(childrenCount))
        log.info("Level counts: %s" % termCount)
        return rowCount, termCount, childrenCount
    finally:
        if infile:
            infile.close()

def processFile(file, outfileName, rowCount, increments, childrenCount):
    log.info("Processing file: %s" % file)
    infile = open(file, "r")
    outfile = open(os.path.join(os.path.dirname(file), '%s-encoded.csv' % outfileName), "wb")
    try:
        csvIn = csv.DictReader(infile)
        csvOut = csv.writer(outfile)
        headers = ["subject","branch","book","chapter","Encode ID"]
        for i in range(1, maxLevels+1):
            headers.append('Level %d' % i)
        csvOut.writerow(headers)

        subject = None
        branch = None
        encodes = [ -1 for x in range(0, maxLevels)]
        rowIdx = 0
        lastEncode = -1

        for row in csvIn:
            rowIdx += 1
            if not subject:
                subject = row['subject']
            if not branch:
                branch = row['branch']

            encodedID = row['Encode ID']
            level = 0

            if not encodedID:
                ## assign encodes
                term = ''
                for i in range(1, maxLevels+1):
                    key = 'Level %d' % i
                    level = i
                    if row.get(key):
                        idx = i - 1
                        term = '%s_%d' % (row[key], rowIdx)
                        if childrenCount.get(term) and idx+1 < maxLevels:
                            ## Compute increments for future levels
                            increments[idx+1] = max((increments[idx]-1)/childrenCount.get(term), 1)
                            if rowCount > 900:
                                ## Increment conservatively
                                increments[idx+1] = max(increments[idx+1]/2, 1) 

                        if encodes[idx] < 0:
                            if idx > 0:
                                encode = encodes[idx-1] + increments[idx]
                            else:
                                encode = 0
                        else:
                            encode = encodes[idx] + increments[idx]

                        if encode <= lastEncode:
                            encode = lastEncode + 1

                        if encode >= 1000:
                            raise Exception("Error assigning encodes - encode out of range (%03d) for term: %s" % (encode, term))

                        encodes[idx] = encode
                        idx += 1
                        while idx < maxLevels:
                            encodes[idx] = -1
                            idx += 1

                        lastEncode = encode
                        break
                encodedID = '%s.%s.%03d' % (subject, branch, encode)
                log.info("Encoded ID for [level :%d] %s: %s (Increment: %d)" % (level, term, encodedID, increments[level-1]))
                rowList = [subject, branch, row["book"], row["chapter"], encodedID]
                for i in range(1, maxLevels+1):
                    rowList.append(row['Level %d' % i])
                csvOut.writerow(rowList)

        log.info("Finished processing: %s" % file)
    finally:
        if infile:
            infile.close()
        if outfile:
            outfile.close()

def processFiles(inputDir, fileNames):

    global errors
    maxTries = 5
    for file in os.listdir(inputDir):
        if (fileNames and file in fileNames) or (not fileNames and file.endswith('.csv') and not file.endswith('-encoded.csv')):
            try:
                fileName = os.path.splitext(file)[0]
                file = os.path.join(inputDir, file)
                rowCount, termCount, childrenCount = analyzeFile(file)
                increments = [int(1000.0/termCount[0]), ]
                for i in range(2, maxLevels+1):
                    increments.append(1)
                log.info("Increments: %s" % str(increments))
                tries = 0
                while tries < maxTries:
                    try:
                        processFile(file, fileName, rowCount, increments, childrenCount)
                        break
                    except Exception, e:
                        if "encode out of range" in str(e):
                            log.warn("Error processing file: %s Try: %d, Message: %s" % (file, tries, str(e))) 
                            tries += 1
                            if tries >= maxTries:
                                raise e
                            increments[0] = max(increments[0]-(2*tries), 1)
                        else:
                            raise e

            except Exception, e:
                log.error("Exception processing: %s [%s]" % (file, str(e)), exc_info=e)
                errors += 1


def printUsage():
    print "%s <inputDir> [<fileNames>]" % sys.argv[0]

if __name__ == '__main__':
    fileNames = []
    if len(sys.argv) >= 2:
        inputDir = sys.argv[1]
        if not os.path.exists(inputDir):
            raise Exception("Could not find input directory: %s" % inputDir)
        if len(sys.argv) >= 3:
            fileNames = sys.argv[2:]

    else:
        printUsage()
        raise Exception("Insufficient parameters")

    try:
        processFiles(inputDir, fileNames)
    except Exception, e:
        log.error("Exception: %s" % str(e), exc_info=e)
        raise e
    finally:
        log.info("Total errors: %d" % errors)
        print "Total errors: %d" % errors
