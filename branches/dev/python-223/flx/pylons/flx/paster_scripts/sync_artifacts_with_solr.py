##
## $Id$
##

from flx.lib.search.solrclient import SolrClient as SC
from flx.model import api
from flx.lib import helpers as h

def run(typeName, maxReturn=5000):
    s = SC()
    s.connect()
    artifactIDs = {}
    hits = s.select(q='type:"%s"' % typeName, fields=['sid', 'isPublic'], rows=5000)
    for hit in hits:
        artifactIDs[int(hit['sid'])] = hit['isPublic']

    reindexList = []
    for id in artifactIDs.keys():
        a = api.getArtifactByID(id=id)
        if a:
            isPublic = a.revisions[0].publishTime != None
            if artifactIDs[id] != isPublic:
                reindexList.append(id)
        else:
             reindexList.append(id)
                    
    print len(reindexList)
    h.reindexArtifacts(artifactIds=reindexList)

