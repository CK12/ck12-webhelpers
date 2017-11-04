#!/usr/bin/python

import os
import sys
import re

dir_path = os.path.dirname(os.path.realpath(__file__))
PREFIX = "/".join(dir_path.split('/')[:-2])

UPDATE_DIRS = [
        ('flx/mysql/updates-auth', 'auth', '.sql'), 
        ('flx/mysql/updates', 'flx2', '.sql'), 
        ('flx/mongo/flx2/updates', 'flx2', '.js'), 
        ('assessment/engine/mongo/updates', 'assesment', '.js'),
        ('peerhelp/core/mongo/updates', 'peerhelp', '.js'),
        ]

def help():
    print "Usage: verify_dbpatches.py"
    print "Check db updates directories and list out patches not included in current.sql or current.js"

if __name__ == '__main__':

    dateRegex = re.compile(r'^[0-9-]+')
    error = False
    for dir, dbname, ext in UPDATE_DIRS:
        if ext == '.sql':
            print "Checking for missing patch for %s mysql db." % dbname
        else:
            print "Checking for missing patch for %s mongo db." % dbname
            
        patch_dir = os.path.join(PREFIX, dir)
        with open(os.path.join(patch_dir, 'current%s' % ext), 'r') as f:
            current = f.read()
            for file in os.listdir(patch_dir):
                if dateRegex.match(file) and file.endswith(ext):
                    #print file
                    
                    if current.find(file) < 0:
                        error = True
                        print "WARNING: file %s is not included in current%s for %s db" %(file, ext, dbname)
                    
                    if ext == '.sql':
                        #check if the file calls update_dbpatch
                        with open(os.path.join(patch_dir, file), 'r') as f1:
                            patch = f1.read()
                            if patch.find('update_dbpatch') < 0 or patch.find(file[:-4]) < 0:
                                error = True
                                print "WARNING: file %s does not call update_dbpatch correctly" % file
                            
                            #Temporarily disable this for 2.7 collection major release
                            #if patch.lower().find('alter') and patch.lower().find('rename'):
                            #    error = True
                            #    print "WARNING: file %s contains 'ALTER' and 'RENAME' statement. Please ensure the patch is backwards compatible." % file 
                            
    if error:
        sys.exit(1)
    else:
        print "All good"        
