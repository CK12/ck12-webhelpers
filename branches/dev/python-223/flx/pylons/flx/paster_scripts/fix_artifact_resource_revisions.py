from sqlalchemy import text
from flx.model import api

def run():
    tx = api.transaction('run')
    with tx as session:
        res1 = session.execute(text("select rr.resourceID, rr.id from Resources r, ResourceRevisions rr where rr.resourceID = r.id and rr.revision = 1 and r.resourceTypeID = 1")).fetchall()
        for rID, rrID in res1:
            res2 = session.execute(
                text("select id from ResourceRevisions where resourceID = :resourceID and revision != 1 order by id desc limit 1"),
                {'resourceID': rID}
            ).fetchone()
            correct_rrID = res2[0]
            print rID, rrID, correct_rrID

            res3 = session.execute(
                text("select * from ArtifactRevisionHasResources where resourceRevisionID = :rrID"),
                {'rrID': rrID}
            ).fetchall()

            for artifactRevisionID, resourceRevisionID in res3:
                r = session.execute(
                    text("update ArtifactRevisionHasResources set resourceRevisionID = :c_rrID where artifactRevisionID = :arID and resourceRevisionID = :rrID"),
                    {'c_rrID': correct_rrID, 'arID': artifactRevisionID, 'rrID': rrID}
                )
                print r.rowcount, 'Updated artifact resource revision artifactRevisionID', artifactRevisionID, ' resourceRevisionID ', rrID, ' to ', correct_rrID

            r = session.execute(
                text("delete from ResourceRevisions where id = :rrID"),
                {'rrID': rrID}
            )
            print r.rowcount, 'Deleted Resource revision ', rrID

    print 'done'
