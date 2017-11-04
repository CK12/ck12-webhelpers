#!/usr/bin/python -O
# -*- coding: utf-8 -*-

"""
    Process reverse (default) or forward correlation document () in word .doc format 
    and covert it to XHTML.
    Uses a OpenOffice server to do the conversion using XDT0.

    To start the OpenOffice server, run as root:
        soffice -headless -nofirststartwizard -accept="socket,host=localhost,port=8100;urp;StarOffice.Service"

        Note: Do not change the port number of the server

    Python dependencies:
        apt-get install python-uno

"""
import os
import sys
import subprocess
import shutil

#commandHome = "/opt/lampp/website/ck12/apps/xdt"
commandHome = "/opt/flexr-1x/src/apps/xdt"
commandName = "DocumentConverter.py"
#server = "xdt.ck12.org"
#serverDir = "~/2.0/std_correlation_docs/"
scriptName = "convert.sh"
uploadDir = "/tmp/std_correlation_docs"
serverDir = uploadDir
downloadDir = "/tmp/std_correlation_docs_xhtml"

def runCommand(cmd, cwd=None):
    print "Running command: %s" % " ".join(cmd)
    p = subprocess.Popen(args=cmd, cwd=cwd)
    retcode = p.wait()
    if retcode:
        print "Error running command: %s [%d]" % (" ".join(cmd), retcode)
        return False
    return True

def printHelp():
    print "Usage: %s <dir-to-search> [--forward]" % __file__
    print "       where <dir-to-search>   is the path to look for .doc files"
    print "             --forward         processes forward correlation documents instead of the default reverse correlations"
    print ""
    sys.exit(0)

if len(sys.argv) < 2 or "help" in " ".join(sys.argv):
    printHelp()

dir = sys.argv[1]
skipCopy = False
skipConvert = False
suffix = "_rev"
i = 2
while i < len(sys.argv):
    if "forward" in sys.argv[i]:
        suffix = "_fwd"
    i += 1

filesCopied = []
if os.path.exists(uploadDir):
    shutil.rmtree(uploadDir)
os.makedirs(uploadDir)

for root, dirs, files in os.walk(dir):
    for file in files:
        if file.endswith('%s.doc' % suffix) and 'CalculusAP' not in file and 'MathCCHS' not in file and 'NSES_HS' not in file and not file.startswith('._'):
            filename = os.path.join(root, file)
            shutil.copy(filename, uploadDir)
            filesCopied.append(file)
print "Copied %d files to %s" % (len(filesCopied), uploadDir)

scriptContent = """#!/bin/bash

dir=$(dirname $0)
mkdir -p ${dir}/out
cd %%COMMAND_HOME%%
(
for file in $(find ${dir} -maxdepth 1 -name "*.doc"); do
    outfile="$(basename ${file})"
    outfile="${outfile%%.doc}".html
    outfile="${dir}/out/${outfile}"
    echo "Coverting ${file} to ${outfile}"
    python %%COMMAND_NAME%% ${file} ${outfile}
done
) 2>&1 | tee /tmp/convert.log 
"""

scriptContent = scriptContent.replace('%%COMMAND_HOME%%', commandHome)
scriptContent = scriptContent.replace('%%COMMAND_NAME%%', commandName)

f = open(os.path.join(serverDir, scriptName), "w")
f.write(scriptContent)
f.close()

if filesCopied:
    ret = runCommand(['bash', '%s' % (os.path.join(serverDir, scriptName))])

