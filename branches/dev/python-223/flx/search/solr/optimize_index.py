import sys

cmdFolder = '/opt/2.0/flx/pylons/flx'
if cmdFolder not in sys.path:
    sys.path.insert(0, cmdFolder)

from flx.lib import helpers as h
from datetime import datetime

s = datetime.now()
print ""
print "##########################################################"
print "[%s] Optimizing index" % (s)
h.reindexArtifacts([100], user=None, wait=True, recursive=False, optimize=True)
print "[%s] Finished optimize. Time taken: %s" % (datetime.now(), datetime.now() - s)
print "All done!"
print "##########################################################"

