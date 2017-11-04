from flx.model import meta, model
from flx.lib import helpers as h
from sqlalchemy import and_

import csv
import os
import re

EID_REGEX1 = re.compile(r'^[A-Z]{3}\.[A-Z0-9]{3}\.[0-9]{3}$')
EID_REGEX2 = re.compile(r'^[A-Z]{3}\.[A-Z0-9]{3}\.[0-9]{3}\.[0-9]+$')

def run(csvDir='/opt/2.0/taxonomy/data/collection', validateOnly=False):
    eidDict = {}
    for brn in ['alg', 'mea', 'ari', 'geo', 'prb', 'sta', 'cal', 'trg', 'bio', 'esc', 'che', 'phy', 'spl']:
        fileName = os.path.join(csvDir, '%s.csv' % brn)
        if os.path.exists(fileName):
            print "Processing %s" % fileName
            with open(fileName, "rb") as brnCsv:
                reader = csv.DictReader(brnCsv)
                rowCnt = 1
                for row in reader:
                    rowCnt += 1
                    if row.get("Original EncodedIDs"):
                        olds = row["Original EncodedIDs"].split(",")
                        oldSet = set([ h.getCanonicalEncodedID(old) for old in olds ])
                        for old in oldSet:
                            if old:
                                newEID = h.getCanonicalEncodedID(row['EncodedID'])
                                if not EID_REGEX1.match(old) and not EID_REGEX2.match(old):
                                    print "ERROR: Invalid EID: [%s] at row [%d]" % (old, rowCnt)
                                    continue
                                if not EID_REGEX1.match(newEID) and not EID_REGEX2.match(newEID):
                                    print "ERROR: Invalid EID: [%s] at row [%d]" % (newEID, rowCnt)
                                    continue
                                if eidDict.has_key(old):
                                    print "ERROR: Duplicate appearance of [%s] at row [%s]" % (old, rowCnt)
                                else:
                                    eidDict[old] = newEID
        else:
            print "Could not find file: %s" % fileName

    if validateOnly:
        return

    insertRows = []
    if eidDict:
        for k, v in eidDict.iteritems():
            insertRows.append({'originalEID': k, 'newEID': v})
    session = meta.Session()
    session.begin()
    try:
        if insertRows:
            session.execute(meta.MigratedConcepts.delete())
            print "Inserting %d" % len(insertRows)
            session.execute(meta.MigratedConcepts.insert(), insertRows)
            session.commit()
    except Exception as e:
        session.rollback()
        print e

