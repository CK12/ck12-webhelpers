from flx.model import api
from flx.model import meta


def run(artifactID):
    reindexed = 0
    session = meta.Session()
    reindex_list = []
    child_list = []
    child_list.append(artifactID)
    ## Get all children
    while len(child_list) > 0:
        id = child_list.pop(0)
        reindex_list.append(id)
        artifact = api.getArtifactByID(id=id)
        for child in artifact.revisions[0].children:
            child_list.append(child.child.artifact.id)

    print "Reindexing %d artifacts in the order: %s" % (len(reindex_list), reindex_list)
    from flx.lib.helpers import reindexArtifacts
    reindexArtifacts(artifactIds=reindex_list)

def help():
    print "run(artifactID) - to reindex an artifact and all its children"

