#!/usr/bin/python -O

import glob
import os

root = '/opt/data/bzr/0'
cwd = root
os.chdir(cwd)
contents = glob.glob('*/*/*.xhtml')
if contents is not None and len(contents) > 0:
    for content in contents:
        from subprocess import call

        call(['python', '/opt/2.0/flx/pylons/flx/flx/lib/rosetta.py', '--content-file=%s' % content])
