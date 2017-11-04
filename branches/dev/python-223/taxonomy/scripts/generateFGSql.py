#!/usr/bin/python

import sys
import csv
import os
from utils import *

"""
    Generate a SQL file to load all concept terms and concept neighbors into DB
"""

file = sys.argv[1]
if not os.path.exists(file):
    raise Exception("Cannot read CSV file: %s" % file)

kwOnly = False
if len(sys.argv) > 2:
    kwOnly = sys.argv[2] == 'kwonly'

conceptNodeLines = []
neighborLines = []

conceptNodeLineNoParent = "INSERT INTO `ConceptNodes` (`encodedID`, `subjectID`, `branchID`, `name`, `parentID`, `status`, `created`) select '%s', @subjectID, @branchID, '%s', NULL, 'published', NOW() ON DUPLICATE KEY UPDATE `name`=VALUES(`name`), `parentID`=VALUES(`parentID`);"
conceptNodeLine = "INSERT INTO `ConceptNodes` (`encodedID`, `subjectID`, `branchID`, `name`, `parentID`, `status`, `created`) select '%s', @subjectID, @branchID, '%s', id, 'published', NOW() from `ConceptNodes` where `encodedID` = '%s' ON DUPLICATE KEY UPDATE `name`=VALUES(`name`), `parentID`=VALUES(`parentID`);"
subjectSelectLine = "SELECT `id` INTO @subjectID FROM `Subjects` WHERE `shortname` = '%s';"
branchSelectLine = "SELECT `id` INTO @branchID FROM `Branches` WHERE `shortname` = '%s';"

neighborSelectLine = "SELECT `id` INTO @reqID FROM `ConceptNodes` WHERE `encodedID` = '%s';"
neighborDeleteLine = "DELETE FROM `ConceptNodeNeighbors` WHERE `conceptNodeID` = (SELECT `id` FROM `ConceptNodes` WHERE `encodedID` = '%s');"
neighborInsertLine = "INSERT INTO `ConceptNodeNeighbors` (`conceptNodeID`, `requiredConceptNodeID`) select id, @reqID from `ConceptNodes` where `encodedID` = '%s';"

keywordInsertLine = "INSERT INTO `ConceptKeywords` (`name`) VALUES ('%s') ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);"
keywordSelectLine = "SELECT `id` INTO @kwID FROM `ConceptKeywords` WHERE `name` = '%s';"
conceptNodeSelectLine = "SELECT `id` INTO @cnID FROM `ConceptNodes` WHERE `encodedID` = '%s';"
ckInsertLine = "INSERT IGNORE INTO `ConceptNodeHasKeywords` (`keywordID`, `conceptNodeID`) VALUES (@kwID, @cnID);"

reader = csv.DictReader(open(file, "rb"))
rowCnt = 0
# foundation_code, name, parent_code
for row in reader:
    rowCnt += 1
    
    if row['foundation_code']:
        print "Processing ", row['foundation_code']
        term = row['foundation_code']
        term = formatEncodedID(term)

        if not kwOnly:
            name = row['name']
            parent_code = formatEncodedID(row['parent_code'])
            required = []
            if row['required_codes']:
                required = row['required_codes'].split(",")
                i = 0
                while i < len(required):
                    required[i] = formatEncodedID(required[i])
                    i += 1
            
            subject, branch, numbers = splitEncodedID(term)
            if subject:
                conceptNodeLines.append(subjectSelectLine % (subject))
                if branch:
                    conceptNodeLines.append(branchSelectLine % (branch))

            if parent_code:
                conceptNodeLines.append(conceptNodeLine % (term, name.replace("'", r"\'"), parent_code))
            else:
                conceptNodeLines.append(conceptNodeLineNoParent % (term, name.replace("'", r"\'")))

            if required:
                for req in required:
                    neighborLines.append(neighborDeleteLine % term)
                    neighborLines.append(neighborSelectLine % req)
                    neighborLines.append(neighborInsertLine % term)

        keywords = row.get('keywords')
        if keywords:
            for kw in keywords.split(';'):
                kw = kw.strip()
                if kw:
                    kwSafe = kw.replace("'", r"\'")
                    conceptNodeLines.append(keywordInsertLine % (kwSafe))
                    conceptNodeLines.append(keywordSelectLine % (kwSafe))
                    conceptNodeLines.append(conceptNodeSelectLine % term)
                    conceptNodeLines.append(ckInsertLine)

    else:
        print "Empty term on line %d" % rowCnt

## Create the sql
f = open("conceptnodes.sql", "w")
for line in conceptNodeLines:
    f.write("%s\n" % line)

f.write("\n")
for line in neighborLines:
    f.write("%s\n" % line)

f.write("\n")

f.close()

print "Wrote file conceptnodes.sql"
