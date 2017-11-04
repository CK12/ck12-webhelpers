from flx.model import api
from flx.controllers.common import ArtifactCache

def run(handle, memberID, typeName='book'):
    artifactType = api.getArtifactTypeByName(typeName=typeName)
    if not artifactType:
        raise Exception("Invalid typeName[%s]" % typeName)

    artifact = api.getArtifactByHandle(handle=handle, typeID=artifactType.id, creatorID=memberID)
    if not artifact:
        raise Exception("No such artifact handle[%s], typeName[%s], creatorID[%s]" % (handle, typeName, memberID))

    api.invalidateArtifact(ArtifactCache(), artifact, revision=artifact.revisions[0], recursive=True, clearPrePost=True)
    print "Cleared cache for %s" % artifact.id
