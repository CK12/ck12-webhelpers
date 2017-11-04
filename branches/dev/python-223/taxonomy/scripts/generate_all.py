#!/usr/bin/python

import os
import shutil
import subprocess

def runCommand(cmd):
    print "Running command: %s" % ' '.join(cmd)
    p = subprocess.Popen(cmd)
    p.wait()
    return p.returncode

CSV_DIR = "/home/nimish/Downloads"
MAPPING = [
        ("Final Math Encoding List - Algebra.csv", "mat.alg.sql"),
        ("Final Math Encoding List - Arithmetic.csv", "mat.ari.sql"),
        ("Final Math Encoding List - Calculus.csv", "mat.cal.sql"),
        ("Final Math Encoding List - Geometry.csv", "mat.geo.sql"),
        ("Final Math Encoding List - Measurement.csv", "mat.mea.sql"),
        ("Final Math Encoding List - Probability.csv", "mat.prb.sql"),
        ("Final Math Encoding List - Statistics.csv", "mat.sta.sql"),
        ("Final Math Encoding List - Trigonometry.csv", "mat.trg.sql"),

        ## Science
        ("CK-12 Science EIDs (FINAL) - Biology EIDs.csv", "sci.bio.sql"),
        ("CK-12 Science EIDs (FINAL) - Chemistry EIDs.csv", "sci.che.sql"),
        ("CK-12 Science EIDs (FINAL) - Earth Science EIDs.csv", "sci.esc.sql"),
        ("CK-12 Science EIDs (FINAL) - Physics EIDs.csv", "sci.phy.sql"),

        ## Keywords
        ("SCI_EIDs - Biology EIDs.csv", "sci.bio.kw.sql"),
        ("SCI_EIDs - Earth Science EIDs.csv", "sci.esc.kw.sql"),
        ("SCI_EIDs - Physics EIDs.csv", "sci.phy.kw.sql"),
        
        ]

for csv, sql in MAPPING:
    csv = os.path.join(CSV_DIR, csv)
    if os.path.exists(csv):
        ret = runCommand(['python', 'convertToConceptNodeCSV.py', csv])
        if ret == 0:
            if not sql.endswith('.kw.sql'):
                ret = runCommand(['python', 'generateFGSql.py', 'fg.csv'])
            else:
                ret = runCommand(['python', 'generateFGSql.py', 'fg.csv', 'kwonly'])
            if ret == 0:
                target = os.path.join('..', 'mysql', 'conceptnodes.manual', sql)
                print "Copying conceptnodes.sql to %s" % target
                shutil.copyfile('conceptnodes.sql', target)
            else:
                print "!!! Error convering to sql"
        else:
            print "!! Error converting to CSV"
    else:
        print "!!! File does not exist: %s" % csv
