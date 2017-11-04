#!/usr/bin/python

import sys
import csv
import os
from utils import *

try:
    file = sys.argv[1]
    if not os.path.exists(file):
        raise Exception("Cannot read CSV file: %s" % file)
except Exception, e:
    print "Usage: %s <input-csv-file>" % sys.argv[0]
    raise e

previous = None
if len(sys.argv) > 2:
    previous = sys.argv[2]

mybranch = None
if len(sys.argv) > 3:
    mybranch = sys.argv[3]

browseTermLines = []
neighborLines = []

insertIgnore = ''

browseTermLineNoParentIgnore = "INSERT IGNORE INTO `BrowseTerms` (`encodedID`, `name`, `termTypeID`, `parentID`) values ('%s', '%s', 4, NULL);"
browseTermLineNoParent = "INSERT %s INTO `BrowseTerms` (`encodedID`, `name`, `termTypeID`, `parentID`) values ('%s', '%s', 4, NULL) ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `parentID` = VALUES(`parentID`);"
browseTermLine = "INSERT %s INTO `BrowseTerms` (`encodedID`, `name`, `termTypeID`, `parentID`) select '%s','%s',4, id from `BrowseTerms` where `encodedID` = '%s' ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `parentID` = VALUES(`parentID`);"

neighborDeleteLine = "DELETE FROM `DomainNeighbors` WHERE `domainID` = (SELECT `id` FROM `BrowseTerms` WHERE `encodedID` = '%s');"
neighborSelectLine = "SELECT `id` INTO @reqID FROM `BrowseTerms` WHERE `encodedID` = '%s';"
neighborInsertLine = "INSERT INTO `DomainNeighbors` (`domainID`, `requiredDomainID`) select id, @reqID from BrowseTerms where `encodedID` = '%s';"

reader = csv.DictReader(open(file, "rb"))
rowCnt = 0
# foundation_code,name,parent_code,required_codes
for row in reader:
    rowCnt += 1
    
    if row['foundation_code']:
        term = row['foundation_code']
        term = formatEncodedID(term)

        name = row['name']
        parent_code = formatEncodedID(row['parent_code'])
        required = []
        if row['required_codes']:
            required = row['required_codes'].split(",")
            i = 0
            while i < len(required):
                required[i] = formatEncodedID(required[i])
                i += 1
        
        name = name.replace("'", "\\'")
        if term.count('.') < 1 and not parent_code:
            browseTermLines.append(browseTermLineNoParentIgnore % (term, name))
        else:
            if parent_code:
                browseTermLines.append(browseTermLine % (insertIgnore, term, name, parent_code))
            else:
                browseTermLines.append(browseTermLineNoParent % (insertIgnore, term, name))

        if required:
            for req in required:
                neighborLines.append(neighborDeleteLine % term)
                neighborLines.append(neighborSelectLine % req)
                neighborLines.append(neighborInsertLine % term)

    else:
        print "Empty term on line %d" % rowCnt

## Create the sql
f = open("foundationgrid.sql", "w")
for line in browseTermLines:
    f.write("%s\n" % line)

f.write("\n")
if previous and mybranch:
    f.write("SELECT `id` INTO @reqID FROM `BrowseTerms` WHERE `encodedID` like '%s.%%' order by `encodedID` DESC LIMIT 1;\n" % previous.upper())
    f.write("INSERT INTO `DomainNeighbors` (`domainID`, `requiredDomainID`) select id, @reqID from BrowseTerms where `encodedID` = '%s.100';\n" % mybranch.upper())

f.write("\n")
for line in neighborLines:
    f.write("%s\n" % line)

f.write("\n")

f.close()

print "Wrote file foundationgrid.sql"
