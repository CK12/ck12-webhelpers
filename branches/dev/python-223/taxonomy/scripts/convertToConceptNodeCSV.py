#!/usr/bin/python

"""
    Create a spreadsheet that can be consumed by the bulk import API 
    for the simple taxonomy service
"""
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

reader = csv.DictReader(open(file, "rb"))
rowCnt = 0
termDict = {}

fields = ["foundation_code", "name", "description", "parent_code", "required_codes", "keywords"]
outf = open("fg.csv", "wb")
writer = csv.writer(outf)
writer.writerow(fields)

toplevels = [('CKT', 'root', '', '', ''), 
        ('MAT', 'Mathematics', 'CKT', '', ''), 
        ('MAT.ARI', 'Arithmetic', 'MAT', '', ''), 
        ('MAT.MEA', 'Measurement', 'MAT', '', ''), 
        ('MAT.CAL', 'Calculus', 'MAT', '', ''), 
        ('MAT.STA', 'Statistics', 'MAT', '', ''), 
        ('MAT.TRG', 'Trigonometry', 'MAT', '', ''), 
        ('MAT.ALG', 'Algebra', 'MAT', '', '')]

#for lvl in toplevels:
#    writer.writerow(lvl)

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

terms = {}
parents = { }
lastTerm = ''
## Encode ID, Level 1, Level 2, Level 3, ...
for row in reader:
    description = ''
    keywords = ''
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
                #parent = '.'.join(term.split('.')[:2])
                parent = ''
            else:
                parent = parents[colcnt-1]
            break
        colcnt += 1


    if not description:
        description = name

    kwlist = []
    keywords = row.get('Keywords')
    if keywords:
        keywords = keywords.replace('\n', '')
        for kw in keywords.split(';'):
            kw = kw.strip()
            if kw:
                kwlist.append(kw)

    if term and name:
        print "Term: %s, Name: %s, Parent: %s, Desc: %s, keywords: %s" % (term, name, parent, description, ";".join(kwlist))
        writer.writerow([term, name, description, parent, lastTerm, ";".join(kwlist)])
        lastTerm = term
    else:
        print "Skipping: %s Blank name!!!" % term
        skipped += 1

outf.close()
print "Skipped %d" % skipped
print "Wrote file: %s" % outf.name
