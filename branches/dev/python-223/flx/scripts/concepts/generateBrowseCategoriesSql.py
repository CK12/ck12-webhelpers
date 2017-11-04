import sys
import csv
import os
from utils import *

file = sys.argv[1]
if not os.path.exists(file):
    raise Exception("Cannot read CSV file: %s" % file)

candidateLines = []
candidateLine = "INSERT INTO `BrowseTermCandidates` (`categoryID`, `rangeStart`, `rangeEnd`, `sequence`) select id, '%s', '%s', %d FROM `BrowseTerms` where `encodedID` = '%s' AND `termTypeID` = 4;"

reader = csv.DictReader(open(file, "rb"))
rowCnt = 0
termDict = {}
# CATEGORY, NAME, CANDIDATE_1, CANDIDATE_2, CANDIDATE_3, CANDIDATE_4, START, END
for row in reader:
    rowCnt += 1
    
    if row['CATEGORY']:
        term = row['CATEGORY']
        term = formatEncodedID(term)

        if not termDict.has_key(term):
            termDict[term] = 1001
        else:
            termDict[term] += 1

        candidates = []
        col = 1
        while True:
            colname = 'CANDIDATE_%d' % col
            if row.has_key(colname):
                if row[colname]:
                    candidates.append(formatEncodedID(row[colname]))
            else:
                break
            col += 1

        seq = 1
        for candidate in candidates:
            candidateLines.append(candidateLine % (candidate, candidate, seq, term))
            seq += 1

        start = end = ''
        if row['START']:
            start = formatEncodedID(row['START'])
        if row['END']:
            end = formatEncodedID(row['END'])

        if start and end:
            candidateLines.append(candidateLine % (start, end, termDict[term], term))

    else:
        print "Empty term on line %d" % rowCnt

## Create the sql
f = open("browsetermcandidates.sql", "w")
for line in candidateLines:
    f.write("%s\n" % line)

f.write("\n")
f.close()

print "Wrote file browsetermcandidates.sql"

