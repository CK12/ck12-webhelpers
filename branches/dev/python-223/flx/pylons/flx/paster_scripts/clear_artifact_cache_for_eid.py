from flx.model import api
from flx.controllers.common import ArtifactCache

def run(encodedID):
    if encodedID:
        domain = api.getBrowseTermByEncodedID(encodedID=encodedID)
        if domain:
            ras = api.getRelatedArtifactsForDomains(domainIDs=[domain.id])
            cnt = len(ras)
            print "Invalidating %d artifacts" % cnt
            i = 0
            for ra in ras:
                i += 1
                artifact = api.getArtifactByID(id=ra.id)
                print "[%d/%d] %s" % (i, cnt, artifact.getPerma())
                api.invalidateArtifact(ArtifactCache(), artifact=artifact)
                ArtifactCache().load(id=artifact.id)
