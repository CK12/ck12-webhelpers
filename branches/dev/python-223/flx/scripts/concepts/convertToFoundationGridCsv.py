#!/usr/bin/python

import sys
import csv
import os
from utils import *

"""
    Convert a Google spreadsheet of following format to  CSV that can be used by the
    generateFGSql.py script
    Input format: Encode ID   | Level 1 | Level 2 | Level 3 ...
    Output Format: foundation_code | name | parent_code | required_codes
"""

try:
    file = sys.argv[1]
    if not os.path.exists(file):
        raise Exception("Cannot read CSV file: %s" % file)
except Exception, e:
    print "Usage: %s <input-csv-file>" % sys.argv[0]
    raise e

reader = csv.DictReader(open(file, "rb"))
rowCnt = 0
termDict = {}

fields = ["foundation_code", "name", "parent_code", "required_codes"]
outf = open("fg.csv", "wb")
writer = csv.writer(outf)
writer.writerow(fields)

prefixes = ['HS ', 'MS ']
suffixes = [' - 2nd edition']
skipped = 0

def cleanupName(name):
    for prefix in prefixes:
        if name.startswith(prefix):
            name = name.replace(prefix, '', 1)
    for suffix in suffixes:
        if name.endswith(suffix):
            name = name.rpartition(suffix)[0]
    return name

toplevels = [
        ('CKT', 'root', '', ''), 
        ('MAT', 'Mathematics', 'CKT', ''), 
        ('MAT.ARI', 'Arithmetic', 'MAT', ''), 
        ('MAT.MEA', 'Measurement', 'MAT', ''), 
        ('MAT.ALG', 'Algebra', 'MAT', ''),
        ('MAT.CAL', 'Calculus', 'MAT', ''),
        ('MAT.GEO', 'Geometry', 'MAT', ''),

        #('MAT.APS', 'Advanced Probability and Statistics', 'MAT', ''),
        ('MAT.PRB', 'Probability', 'MAT', ''),
        ('MAT.STA', 'Statistics', 'MAT', ''),

        ('MAT.TRG', 'Trigonometry', 'MAT', ''),
        #('MAT.TRI', 'Trigonometry', 'MAT', ''),

        ('SCI', 'Science', 'CKT', ''),
        ('SCI.CHE', 'Chemistry', 'SCI', ''),
        ('SCI.PHY', 'Physics', 'SCI', ''),
        ('SCI.BIO', 'Biology', 'SCI', ''),
        ('SCI.ESC', 'Earth Science', 'SCI', ''),
        #('SCI.LSC', 'Life Science', 'SCI', ''),
        ]

for lvl in toplevels:
    writer.writerow(lvl)

terms = {}
parents = { }
lastTerm = ''
## Encode ID, Level 1, Level 2, Level 3, ...
for row in reader:
    rowCnt += 1
    
    term = None
    if row['Encode ID']:
        term = formatEncodedID(row['Encode ID'].strip())

    name = ''
    colcnt = 1
    while row.has_key('Level %d' % colcnt):
        colname = 'Level %d' % colcnt
        if row[colname]:
            name = row[colname].strip()
            name = cleanupName(name)
            terms[term] = name
            parents[colcnt] = term
            if colcnt == 1:
                parent = '.'.join(term.split('.')[:2])
            else:
                parent = parents[colcnt-1]
            break
        colcnt += 1

    if term and name:
        print "Term: %s, Name: %s, Parent: %s" % (term, name, parent)
        writer.writerow([term,name,parent, lastTerm])
        lastTerm = term
    else:
        print "Skipping: %s Blank name!!!" % term

print "Skipped %d" % skipped
print "Wrote file: %s" % outf.name

if outf:
    outf.close()
