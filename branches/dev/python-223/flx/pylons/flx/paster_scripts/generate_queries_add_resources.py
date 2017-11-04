from flx.model import api


def run(artifactID):
    chapter = api.getArtifactByID(id=artifactID)
    sections = chapter.revisions[0].children

    queryForMongo = []
    for each_section in sections:
        artifactRevisions = []
        for i, ar in enumerate(each_section.child.artifact.revisions):
            artifactRevisions.append(ar.id)
            if ar.resourceRevisions:
                break
        rrIDs = [x.id for x in ar.resourceRevisions]
        goodAR = artifactRevisions.pop()
        artifactID = each_section.child.artifactID
        for ar in artifactRevisions:
            print 'insert into ArtifactRevisionHasResources select %s, resourceRevisionID from ArtifactRevisionHasResources where artifactRevisionID = %s;' %(ar, goodAR)
        print '\n'

        for ar in artifactRevisions:
            queryForMongo.append("db.FlxForever.remove({'_id.key': 'c-ar-id %s'})" %(ar))
            pass
        #print 'artifactID: [%s] artifactRevisionIDs: [%s] rrIDs: [%s]' %(artifactID, artifactRevisions, rrIDs)
    for q in queryForMongo:
        print q
