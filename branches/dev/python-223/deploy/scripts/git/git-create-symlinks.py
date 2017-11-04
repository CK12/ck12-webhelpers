#!/usr/bin/python -O

## Create Symlinks based on SVN externals
import sys, os

myname = sys.argv[0]
infile=sys.argv[1]

mydir = os.path.dirname(myname)
basedir = os.path.abspath(os.path.join(mydir, "..", ".."))
if not os.path.exists(infile):
    raise Exception("No such externals file: %s" % infile)

output = ["#!/bin/bash", "", "cd %s" % basedir]

with open(infile, 'r') as f:
    for line in f:
        if ' - ' in line:
            parts = line.split(' - ', 1)
            dir = parts[0]
            line = parts[1]
            output.append("")
            output.append("cd %s/%s" % (basedir, dir))
        line = line.strip()
        if not line:
            continue
        target, symlink = line.split(" ")
        output.append("[ -L %s ] || ln -v -sf %s" % (symlink, line))

outfile = os.path.join(basedir, "symlinks4externals.sh")
outf = open(outfile, "w")
for l in output:
    outf.write("%s\n" % l)
outf.close()
print "Done! Run 'bash %s'" % outfile
