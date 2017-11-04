from flx.model import api
from flx.model import meta


def run(artifactID):
    deleted = 0
    ans = 'N'
    delete_list = []
    session = meta.Session()
    child_list = []
    delete_list.append(artifactID)
    child_list.append(artifactID)
    ## Get all children
    while len(child_list) > 0:
        id = child_list.pop(0)
        artifact = api.getArtifactByID(id=id)
        for child in artifact.revisions[0].children:
            delete_list.append(child.child.artifact.id)
            child_list.append(child.child.artifact.id)

    print "Deleting %d artifacts in the order: %s" % (len(delete_list), delete_list)
    for id in delete_list:
        print "Deleting: %d" % id
        api.deleteArtifactByID(id=id, recursive=False)
        deleted += 1
    print "Total deleted: %d" % deleted

    if delete_list:
        from flx.lib.helpers import reindexArtifacts
        reindexArtifacts(delete_list, user=None)

def help():
    print "run(artifactID) - to delete an artifact and all its children"
