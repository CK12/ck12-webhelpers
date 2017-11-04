from flx.model import meta

## select distinct m1.memberID from MemberLibraryObjects m1, MemberLibraryObjects m2 where m1.memberID = m2.memberID and m1.objectType = m2.objectType and m1.objectID = m2.objectID and m1.parentID = m2.parentID and m1.domainID is null and m2.domainID is null and m1.id != m2.id order by m1.memberID;

## select m1.id, m1.memberID from MemberLibraryObjects m1, MemberLibraryObjects m2 where m1.memberID = m2.memberID and m1.objectType = m2.objectType and m1.objectID = m2.objectID and m1.parentID = m2.parentID and m1.domainID is null and m2.domainID is null and m1.id != m2.id order by m1.memberID;

def run():
    delete_list = []
    session = meta.Session()
    members = session.execute("select distinct m1.memberID from MemberLibraryObjects m1, MemberLibraryObjects m2 where m1.memberID = m2.memberID and m1.objectType = m2.objectType and m1.objectID = m2.objectID and m1.parentID = m2.parentID and m1.domainID is null and m2.domainID is null and m1.id != m2.id order by m1.memberID").fetchall()
    for member in members:
        ids_to_delete = []
        memberID = member[0]
        rows = session.execute("select distinct m1.id from MemberLibraryObjects m1, MemberLibraryObjects m2 where m1.memberID = m2.memberID and m1.objectType = m2.objectType and m1.objectID = m2.objectID and m1.parentID = m2.parentID and m1.domainID is null and m2.domainID is null and m1.id != m2.id and m1.memberID = %d order by m1.memberID" % memberID).fetchall()
        cnt = 0
        for row in rows:
            print row[0]
            if cnt > 0:
                ids_to_delete.append(row[0])
            cnt += 1
        delete_list.extend(ids_to_delete)
        print "ids_to_delete for %s: %s" % (member[0], ids_to_delete)

    print "delete_list: %d" % len(delete_list)
    del_sql = "delete from MemberLibraryObjects where id in (%s)" % (",".join(str(s) for s in delete_list))
    print del_sql

