from flx.model import api
from datetime import datetime
import logging

LOG_FILENAME = "/tmp/delete_data.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=10*1024*1024, backupCount=30)
handler.setFormatter(formatter)
log.addHandler(handler)

keep_member_ids = range(0, 101)
keep_member_ids_list = [
        103, #Nimish
        156, #Ravi
        119, #tag
        5111, #ck12math
        98045, #ck12science
        ]
keep_member_ids.extend(keep_member_ids_list)

def run():
    log.info("Deleting all members except: %s" % keep_member_ids)
    pageNum = 1
    pageSize = 256
    deletedCnt = 0
    totalCount = 0
    mIdx = 0
    while True:
        members = api.getMembers(sorting='id,asc', pageNum=pageNum, pageSize=pageSize)
        pageNum += 1
        if not totalCount:
            totalCount = members.getTotal() - len(keep_member_ids)
        if not members:
            break
        ids2Del = []
        for m in members:
            if m.id in keep_member_ids:
                log.info("Keeping member: %d, %s" % (m.id, m.email))
                continue
            ids2Del.append((m.id, m.email))
        for mid, memail in ids2Del:
            mIdx += 1
            log.info("[%d/%d] Deleting member: %d, %s" % (mIdx, totalCount, mid, memail))
            mid = mid
            memail = memail
            s = datetime.now()
            try:
                for attempt in [1, 2]:
                    log.info("Attempt: %d" % attempt)
                    m = api.getMemberByID(id=mid)
                    artifacts = api.getArtifactsByOwner(owner=m)
                    if artifacts:
                        aIdx = 0
                        totalA = artifacts.getTotal()
                        for a in artifacts:
                            try:
                                aIdx += 1
                                aID = a.id
                                log.info("[%d/%d] Deleting artifact: %d, %s, %s" % (aIdx, totalA, aID, a.name, a.type.name))
                                api.deleteArtifactByID(id=a.id, recursive=True)
                                log.info("[%d/%d] Deleted artifact: %d" % (aIdx, totalA, aID))
                            except Exception as ae:
                                log.warn("Error deleting artifact: %d, %s" % (a.id, str(ae)), exc_info=ae)
                groups = api.getGroupsByCreatorID(creatorID=mid, onlyActive=False)
                log.info("Need to delete %d groups for this user" % len(groups))
                for group in groups:
                    try:
                        log.info("Deleting group: %d" % group.id)
                        api.deleteGroup(group=group, memberID=mid)
                        log.info("Deleted")
                    except Exception as ge:
                        log.warn("Error deleting group: %s" % str(ge), exc_info=ge)
                api.deleteMemberByID(id=mid)
                log.info("[%d/%d] Deleted member: %d, %s. Time taken: [%s]" % (mIdx, totalCount, mid, memail, datetime.now() - s))
                deletedCnt += 1
            except Exception as e:
                log.warn("[%d/%d] Failed to delete member: %d, %s" % (mIdx, totalCount, mid, memail), exc_info=e)
    log.info("Done. Deleted %d members" % deletedCnt)
    print "Done. Deleted %d members" % deletedCnt
