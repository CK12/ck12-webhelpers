from flx.model import api
from flx.lib import helpers as h

def run():

    pageSize = 256
    pageNum = 1
    allDomains = {}
    while True:
        artifactIDs = {}
        ra = api.getRelatedArtifactsForArtifact(artifactID=None, pageNum=pageNum, pageSize=pageSize)
        if not ra:
            break
        for a in ra:
            if not allDomains.has_key(a.domainID):
                allDomains[a.domainID] = a.domainID
                artifactIDs[a.artifactID] = a.artifactID
        if artifactIDs:
            print "Scheduling indexing for %d artifacts" % len(artifactIDs.keys())
            h.reindexArtifacts(artifactIDs.keys())
        pageNum += 1
    print "Reindexed %d domains" % len(allDomains.keys())

