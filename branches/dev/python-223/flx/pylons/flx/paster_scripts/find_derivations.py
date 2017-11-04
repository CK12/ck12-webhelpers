from flx.model import api
from flx.model import meta

def run(artifactID):
    session = meta.Session()
    child_list = []
    child_list.append(artifactID)
    ## Get all children
    while len(child_list) > 0:
        id = child_list.pop(0)
        artifact = api.getArtifactByID(id=id)
        derivedArtifacts = api.getDerivedArtifacts(id=id)
        for a in derivedArtifacts:
            print "[%s] '%s' (id: %d) is derived from '%s' (id: %d) by %s (%s)" % (a.type.name, a.getTitle(), a.id, artifact.getTitle(), artifact.id, a.creatorID, a.creator.email)
        for child in artifact.revisions[0].children:
            child_list.append(child.child.artifact.id)

def help():
    print "run(artifactID) - to list all derivations for an artifact and all its children"

