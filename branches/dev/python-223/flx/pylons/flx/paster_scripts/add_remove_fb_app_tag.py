from flx.lib import helpers as h
from flx.model import api
from flx.controllers.common import ArtifactCache

def run(action, tag='ready-for-fb-app', ownerID=3, typeName='book', includeIDs=[], excludeIDs=[]):
    if action not in ['add', 'remove']:
        raise Exception("Invalid action. Must be either 'add' or 'remove'.")

    termType = api.getBrowseTermTypeByName(name='internal-tag')
    term = api.getBrowseTermByHandle(handle=tag, typeID=termType.id)
    if not term:
        raise Exception("Could not find internal-tag by handle '%s'" % tag)

    cache = ArtifactCache()
    pageNum = 0
    pageSize = 2
    reindexList = []
    while True:
        if includeIDs:
            artifacts = api.getArtifacts(idList=includeIDs, typeName=typeName, ownerID=ownerID)
        else:
            pageNum += 1
            artifacts = api.getArtifacts(typeName=typeName, ownerID=ownerID, pageSize=pageSize, pageNum=pageNum)
        if not artifacts:
            break
        for a in artifacts:
            if a.id in excludeIDs:
                print "Skipping id %s" % a.id
                continue
            updated = False
            has = api.getArtifactHasBrowseTerm(artifactID=a.id, browseTermID=term.id)
            if action == 'add':
                if not has:
                    api.createArtifactHasBrowseTerm(artifactID=a.id, browseTermID=term.id)
                    reindexList.append(a.id)
                    updated = True
                    print "Added term for type:%s, id:%s" % (typeName, a.id)
                else:
                    print "Term already exists for type:%s, id:%s" % (typeName, a.id)
            elif action == 'remove':
                if not has:
                    print "Term does not exist for type:%s, id:%s" % (typeName, a.id)
                else:
                    api.deleteArtifactHasBrowseTerm(artifactID=a.id, browseTermID=term.id)
                    print "Removed term for type:%s, id:%s" % (typeName, a.id)
                    reindexList.append(a.id)
                    updated = True

            if updated:
                print "Refreshing cache: %s" % a.id
                api.invalidateArtifact(cache, a, recursive=False)
                cache.load(id=a.id)
        if includeIDs:
            break
    if reindexList:
        print "Reindexing: %s" % str(reindexList)
        h.reindexArtifacts(reindexList, recursive=False)
