from flx.model import api
import traceback

PROTECTED_MEMBER_IDS = [ 1, 2, 3, 4, ]

def run():
    pageSize = 64
    pageNum = 1
    deleted = 0
    while True:
        members = api.getMembers(pageNum=pageNum, pageSize=pageSize)
        if not members:
            break
        for m in members:
            try:
                if m:
                    if m.id not in PROTECTED_MEMBER_IDS:
                        res = api.getResourcesByOwner(ownerID=m.id)
                        for r in res:
                            api.deleteResource(resource=r)
                        api.deleteMember(member=m)
                        print "Deleted: %d" % m.id
                        deleted += 1
                    else:
                        print "Skipping member: %d" % m.id
            except Exception, e:
                print "Could not delete member: %s" % m
                traceback.format_exc(e)

        pageNum += 1

    print "Deleted total: %d" % deleted

