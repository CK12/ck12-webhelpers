from flx.model import api

def getAllLevelCounts(levelDict):
    cnt = 0
    for l in levelDict.keys():
        cnt += levelDict[l]
    return cnt

def run(prefix='MAT.'):
    eids = api.getDomainTermsByEIDLike(prefix)
    output = open('/tmp/%s-counts.csv' % prefix, 'w')
    for eid in eids:
        readCnt = otherCnt = 0
        counts = api.countRelatedArtifactsForDomains(domainIDs=[eid.id], ck12only=True)
        if counts:
            for typeName in counts.keys():
                if typeName == 'lesson':
                    readCnt += getAllLevelCounts(counts[typeName])
                else:
                    otherCnt += getAllLevelCounts(counts[typeName])
        output.write('"%s","%s",%d,%d\n' % (eid.encodedID, eid.name, readCnt, otherCnt))
    output.close()

