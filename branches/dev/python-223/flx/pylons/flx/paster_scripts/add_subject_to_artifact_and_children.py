from flx.model import api
from flx.controllers.common import ArtifactCache

def run(artifactID, subjectName):
    associations = 0
    reindex_list = []
    child_list = []
    child_list.append(artifactID)
    subjectType = api.getBrowseTermTypeByName(name='subject')
    subjectTerm = api.getBrowseTermByIDOrName(idOrName=subjectName, type=subjectType.id)
    if not subjectTerm:
        raise Exception("Cannot find subject browseTerm [%s]" % subjectName)
    ## Get all children
    while len(child_list) > 0:
        id = child_list.pop(0)
        reindex_list.append(id)
        artifact = api.getArtifactByID(id=id)
        if not artifact:
            raise Exception('Cannot find artifact by id [%s]' % id)
        if not api.getArtifactHasBrowseTerm(artifactID=id, browseTermID=subjectTerm.id):
            api.createArtifactHasBrowseTerm(artifactID=id, browseTermID=subjectTerm.id)
            associations += 1
            api.invalidateArtifact(ArtifactCache(), artifact=artifact, revision=artifact.revisions[0])
            ArtifactCache().load(artifact.id)

        for child in artifact.revisions[0].children:
            child_list.append(child.child.artifact.id)

    print "Associated %d artifacts with subject %s" % (associations, subjectName)
    print "Reindexing %d artifacts in the order: %s" % (len(reindex_list), reindex_list)
    from flx.lib.helpers import reindexArtifacts
    reindexArtifacts(artifactIds=reindex_list)

def help():
    print "run(artifactID, subjectTerm) - to add subject term to an artifact and all its children"


