from flx.model import api
from flx.controllers.common import ArtifactCache

def run(email):
    m = api.getMemberByEmail(email=email)
    if m:
        artifacts = api.getArtifactsByOwner(owner=m)
        artifacts = artifacts.results
        while len(artifacts):
            print "Remaining %d artifacts" % len(artifacts)
            a = artifacts.pop()
            a = api.getArtifactByID(id=a.id)
            try:
                id = a.id
                api.deleteArtifact(artifact=a, cache=ArtifactCache())
                print "Deleted %d" % id
            except:
                artifacts.append(a)

        api.deleteMember(member=m)
