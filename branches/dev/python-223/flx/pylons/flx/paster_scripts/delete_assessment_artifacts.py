from flx.model import api
from flx.controllers.common import ArtifactCache

def run(ownerID=None):
    types = [('asmtpractice', 'Practice'), ('asmtquiz', 'Exercise'), ('asmttest', 'Test')]
    for type in types:
        artifacts = api.getArtifacts(typeName=type[0])
        for a in artifacts:
            #if not a.name.endswith(type[1]) and ownerID and a.creatorID == ownerID:
            if ownerID and (a.creatorID == ownerID or ownerID == 'ALL'):
                print "deleting %s" % a.name
                api.deleteArtifactByID(id=a.id, cache=ArtifactCache())

