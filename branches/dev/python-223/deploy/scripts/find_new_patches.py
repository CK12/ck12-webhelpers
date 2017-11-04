#!/usr/bin/python

import os
import sys
import re

UPDATE_DIRS = [
        ('assessment/engine/mongo/updates', 'assessment', '.js'), 
        ('peerhelp/core/mongo/updates', 'peer_help', '.js'), 
        ('flx/mysql/updates-auth', 'auth', '.sql'), 
        ('flx/mysql/updates', 'flx2', '.sql'), 
        ## ('/opt/2.0/flx/mysql/updates', 'flx2img', '.sql'), 
        ## ('/opt/2.0/taxonomy/mysql/updates', 'taxonomy', '.sql'), 
        ]

def help():
    print "Usage: find_new_patches.py <branch1> <branch2>"
    print "Compare the updates directories and list out patches missing"

if __name__ == '__main__':
    
    if len(sys.argv) < 3:
        help()
        sys.exit(1)

    branch1 = sys.argv[1]
    branch2 = sys.argv[2]

    DIFFs = {}

    dateRegex = re.compile(r'^[0-9-]+')

    files1 = {}
    files2 = {}
    for dir, dbname, ext in UPDATE_DIRS:
        files1[dir] = {}
        files2[dir] = {}
        udir1 = os.path.join(branch1, dir)
        udir2 = os.path.join(branch2, dir)
        missingFiles2 = []
        missingFiles1 = []

        for file in os.listdir(udir1):
            if dateRegex.match(file) and file.endswith(ext):
                files1[dir][file] = True
        

        for file in os.listdir(udir2):
            if dateRegex.match(file) and file.endswith(ext):
                if not files1[dir].has_key(file):
                    missingFiles2.append(file)
                files2[dir][file] = True

        for file in files1[dir].keys():
            if not files2[dir].has_key(file):
                missingFiles1.append(file)

        if missingFiles2:
            print ""
            print ">>> Files not in %s" % udir1
            for file in sorted(missingFiles2):
                print "\t%s" % os.path.join(udir2, file)

        if missingFiles1:
            print ""
            print ">>> Files not in %s" % udir2
            for file in sorted(missingFiles1):
                print "\t%s" % os.path.join(udir1, file)


