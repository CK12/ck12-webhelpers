from flx.model import api

def run(encodedID):
    book = api.getArtifactByEncodedID(encodedID=encodedID, typeName='book')
    if not book:
        raise Exception("No such book for encodedID: %s" % encodedID)

    unpublish_list = []
    child_list = [book.id]
    ## Get all children
    while child_list:
        id = child_list.pop(0)
        artifact = api.getArtifactByID(id=id)
        for child in artifact.revisions[0].children:
            child_list.append(child.child.artifact.id)
            if child.child.artifact.type.name == 'section':
                unpublish_list.append(child.child)

    reindex_list = []
    unpublished = 0
    print "Unpublishing section artifacts for this book ..."
    for ar in unpublish_list:
        print "Unpublishing %s" % ar.artifact.name
        api.unpublishArtifactRevision(artifactRevision=ar, recursive=False)
        reindex_list.append(ar.artifact.id)
        unpublished += 1

    print "Total unpublished: %d" % unpublished

    if reindex_list:
        from flx.lib.helpers import reindexArtifacts
        reindexArtifacts(reindex_list, user=None)

def help():
    print "run(bookEncodedID) - to unpublish all sections from a given book"
