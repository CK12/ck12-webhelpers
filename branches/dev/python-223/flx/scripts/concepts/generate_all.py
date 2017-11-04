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
        ("CK-12 Science EIDs (FINAL) - Biology.csv", "sci.bio.sql"),
        ("CK-12 Science EIDs (FINAL) - Chemistry.csv", "sci.che.sql"),
        ("CK-12 Science EIDs (FINAL) - Earth Science.csv", "sci.esc.sql"),
        ("CK-12 Science EIDs (FINAL) - Physics.csv", "sci.phy.sql"),

        ]

for csv, sql in MAPPING:
    csv = os.path.join(CSV_DIR, csv)
    ret = runCommand(['python', 'convertToFoundationGridCsv.py', csv])
    if ret == 0:
        ret = runCommand(['python', 'generateFGSql.py', 'fg.csv'])
        if ret == 0:
            target = os.path.join('..', '..', 'mysql', 'fg.manual', sql)
            print "Copying foundationgrid.sql to %s" % target
            shutil.copyfile('foundationgrid.sql', target)
        else:
            print "!!! Error convering to sql"
    else:
        print "!! Error converting to CSV"
