#!/usr/bin/env python 

##
## $Id$
## 

import csv
import json
import os
import sys
import urllib2
import re
import logging, logging.handlers

LOG_FILENAME = "generate_elm_collection.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
fileHandler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=10*1024*1024, backupCount=5)
fileHandler.setFormatter(formatter)
log.addHandler(fileHandler)
consoleHandler = logging.StreamHandler(sys.stdout)
consoleHandler.setFormatter(formatter)
log.addHandler(consoleHandler)

GET_TOP_CONCEPTS = "https://www.ck12.org/taxonomy/get/info/concepts/@@SUB@@/@@BRN@@/top?pageSize=1000&format=json"
GET_ALL_DESCENDANTS = "https://www.ck12.org/taxonomy/get/info/descendants/concepts/@@EID@@/7?format=json"
GET_MODALITIES = "https://www.ck12.org/flx/get/minimal/modalities/@@EID@@?pageSize=100&pageNum=0&ownedBy=ck12&format=json"
GET_CONCEPT_INFO = "https://qa-courses.ck12.org/taxonomy/get/info/concept/@@EID@@?format=json"
CSV_DIR = "."

HEADER_FLDS = ['"Elementary Math Grade @@GRADE@@"', '"elementary-math-grade-@@GRADE@@"', '"Elementary Math for Grade @@GRADE@@"', '"@@EID@@"', '"MAT"']

SEEN_EIDS = {}
COLLAPSE_DUPLICATE_EIDS = False

def getAPIJson(url):
    log.debug("Getting url: %s" % url)
    ret = urllib2.urlopen(url)
    retJson = json.loads(ret.read())
    if retJson['responseHeader']['status'] != 0:
        raise Exception("Bad status code: %s" % retJson['responseHeader'])
    return retJson

rows = []
rowNum = 0
def printNode(node, level, hasChildren=True):
    log.debug("Level [%d] ------> EncodedID: [%s], Name: [%s], Handle: [%s], hasChildren: [%s]" % (level, node['encodedID'], node['name'], node['handle'], hasChildren))
    flds = [ '' for h in HEADER_FLDS ]
    eid = formatEID(node.get('encodedID', ''))
    nameIdx = -1
    for i in range(0, 4):
        if i == level-1:
            flds.append(node['name'])
            nameIdx = len(flds) - 1
        else:
            flds.append('')

    newEID = ariDict.get(eid, '_MISSING_')
    ## EncodedID
    if not hasChildren:
        flds.append(newEID)
    else:
        flds.append('')

    ## Original EIDs
    origConceptName = None
    origEids = []
    if not hasChildren:
        origEids.append(eid)
        if COLLAPSE_DUPLICATE_EIDS and nameIdx > -1 and newEID != '_MISSING_':
            url = GET_CONCEPT_INFO.replace('@@EID@@', newEID)
            resp = getAPIJson(url)
            origConceptName = resp['response']['name']

    # ModalityIDs
    modalityIDs = []
    if not hasChildren:
        modIds = getModalityIDs(eid)
        modalityIDs.extend(modIds)

    ## Preview EID
    previewEID = ''
    if level == 1 or level == 2:
        previewEID = node['encodedID']

    newRow = False
    global SEEN_EIDS, rows, rowNum
    if not hasChildren:
        if not SEEN_EIDS:
            SEEN_EIDS = {}
        if not SEEN_EIDS.has_key(newEID) or newEID == '_MISSING_':
            if newEID != '_MISSING_':
                SEEN_EIDS[newEID] = rowNum
            newRow = True
        else:
            ## Merge the modality ids and Original EIDs
            rowIdx = SEEN_EIDS[newEID]
            log.info(">>> Merging newEID: [%s], rowIdx: %d, len(rows[rowIdx]): %d, row: %s" % (newEID, rowIdx, len(rows[rowIdx]), rows[rowIdx]))
            if nameIdx > -1 and origConceptName:
                rows[rowIdx][nameIdx] = origConceptName
            rows[rowIdx][10].extend(origEids)
            rows[rowIdx][11].extend(modalityIDs)
            log.info(">>> rowNum: %d -> row: %s" % (rowIdx, rows[rowIdx]))
            return
    elif SEEN_EIDS:
        SEEN_EIDS = {}

    if newRow:
        flds.append(origEids)
        flds.append(modalityIDs)
        flds.append(previewEID)

    #print "SEEN_EIDS: %s" % SEEN_EIDS
    #print ">>> newEID: [%s], len(flds): %d" % (newEID, len(flds))
    log.info(">>> rowNum: %d -> row: %s" % (rowNum, flds))
    rows.append(flds)
    rowNum += 1

def getModalityIDs(encodedID):
    ids = []
    for i in range(0, 2):
        getModalitiesUrl = GET_MODALITIES.replace('@@EID@@', encodedID)
        try:
            modJson = getAPIJson(getModalitiesUrl)
            for mod in modJson['response']['domain']['modalities']:
                ids.append(str(mod['artifactID']))
            break
        except Exception, e:
            oldEncodedID = encodedID
            encodedID = '%s0' % encodedID
            log.warn("Bad encodedID: %s, Trying with: %s" % (oldEncodedID, encodedID))
    return ids

def processChildren(node, level):
    children = node['children']
    printNode(node, level, hasChildren=len(children)>0)
    chldCnt = 0
    while chldCnt < len(children):
        child = children.pop(0)
        processChildren(child, level+1)

def formatEID(eid):
    eid = eid.strip().upper()
    eid = eid.rstrip('.')
    if eid.count('.') == 3:
        eid = eid.rstrip('0')
    eid = eid.rstrip('.')
    return eid

def help():
    print ""
    print "Usage: %s <comma-separate-branch-eids>" % sys.argv[0]
    print ""

EID_REGEX1 = re.compile(r'^[A-Z]{3}\.[A-Z0-9]{3}\.[0-9]{3}$')
EID_REGEX2 = re.compile(r'^[A-Z]{3}\.[A-Z0-9]{3}\.[0-9]{3}\.[0-9]+$')
ariDict = {}
if __name__ == '__main__':
    if len(sys.argv) < 2:
        help()
        sys.exit(1)

    csvDir = os.path.join(os.path.abspath(os.path.dirname(sys.argv[0])), '..', '..', '..', 'taxonomy', 'data', 'collection')
    if not os.path.exists(csvDir):
        csvDir = os.path.dirname(sys.argv[0])
    branches = sys.argv[1].split(',')
    if len(branches) == 1 and branches[0] == 'ALL':
        branches = ['MAT.EM1', 'MAT.EM2', 'MAT.EM3', 'MAT.EM4', 'MAT.EM5' ]

    for brn in ['alg', 'mea', 'ari', 'geo', 'prb', 'sta', 'cal', 'trg', 'bio', 'esc', 'che', 'phy', 'spl']:
        csvFile = '%s.csv' % brn
        ariCsvFile = os.path.join(csvDir, csvFile)
        if not os.path.exists(ariCsvFile):
            log.warn("!!! Expected %s file." % ariCsvFile)
            continue

        log.info("Processing: %s" % ariCsvFile)
        with open(ariCsvFile, "rb") as ariCsv:
            ariReader = csv.DictReader(ariCsv)
            rowCnt = 1
            for row in ariReader:
                rowCnt += 1
                if row.get('Original EncodedIDs'):
                    olds = row["Original EncodedIDs"].split(",")
                    oldSet = set([ formatEID(old) for old in olds ])
                    for old in oldSet:
                        if old:
                            newEID = formatEID(row['EncodedID'])
                            if not EID_REGEX1.match(old) and not EID_REGEX2.match(old):
                                log.warn("ERROR: Invalid EID: [%s]. Row [%d]" % (old, rowCnt))
                                continue
                            if not EID_REGEX1.match(newEID) and not EID_REGEX2.match(newEID):
                                log.warn("ERROR: Invalid EID: [%s] at row [%d]" % (newEID, rowCnt))
                                continue
                            if ariDict.has_key(old):
                                log.warn("ERROR: Duplicate appearance of [%s]. Row [%d]" % (old, rowCnt))
                            else:
                                ariDict[old] = newEID
    if not ariDict:
        raise Exception("Could not find any csvFile from [%s]" % (["ari.csv", "mea.csv", "geo.csv", "alg.csv"]))

    ## Check
    for k in ariDict.keys():
        if not k or ' ' in k:
            raise Exception("Error with key [%s] %s" % (k, ariDict[k]))
        for item in ariDict[k]:
            if not item or ' ' in item:
                raise Exception("Error with value: key [%s] value[%s]" % (k, ariDict[k]))
            #print "k: [%s] ------> items[%s]" % (k, str(ariDict[k]))
    for branch in branches:
        global rows, rowNum
        rows = []
        rowNum = 0
        csv = open(os.path.join(csvDir, "%s.csv" % branch), "w")
        HEADERS = ["Collection Name", "Collection Handle", "Collection Description", "Collection Canonical ID", "Collection Parent Subject ID", "Level 1", "Level 2", "Level 3", "Level 4", "EncodedID", "Original EncodedIDs", "ModalityIDs", "Preview EID"]
        csv.write(','.join(['%s'% h for h in HEADERS]) + '\n')
        sub, brn = branch.split('.')
        grade = brn[-1]
        header_vals = HEADER_FLDS[:]
        for i in range(0, len(header_vals)):
            header_vals[i] = header_vals[i].replace('@@GRADE@@', grade).replace('@@EID@@', '%s.%s' % (sub, brn))
        while len(header_vals) < len(HEADERS):
            header_vals.append('""')
        csv.write(','.join(['%s' % h for h in header_vals]) + '\n')
        topConceptsUrl = GET_TOP_CONCEPTS.replace('@@SUB@@', sub).replace('@@BRN@@', brn)
        topJson = getAPIJson(topConceptsUrl)
        for tcn in topJson['response']['conceptNodes']:
            ## Get all children for each top node
            descUrl = GET_ALL_DESCENDANTS.replace('@@EID@@', tcn['encodedID'])
            descJson = getAPIJson(descUrl)
            node = descJson['response']['conceptNode']
            processChildren(node, 1)

        for row in rows:
            for i in range(0, len(row)):
                if type(row[i]).__name__ == 'list':
                    row[i] = '"%s"' % ', '.join(row[i])
                else:
                    row[i] = '"%s"' % row[i]
            str = ",".join(row) + '\n'
            csv.write(str)

        if csv:
            csv.close()

