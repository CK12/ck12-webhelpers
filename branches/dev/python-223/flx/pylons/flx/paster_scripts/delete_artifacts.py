from flx.model import api
from flx.model import meta
import logging

LOG_FILENAME = "/tmp/delete_artifacts.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=10*1024*1024, backupCount=5)
handler.setFormatter(formatter)
log.addHandler(handler)

delete_for_owner_ids = [ ]
protected_owner_ids = [ 1, 2, 3, 4, ]
typeorder = ['book', 'tebook', 'workbook', 'labkit', 'chapter', 'lesson', 'concept', 'section']

def run():
    deleted = 0
    ans = 'N'
    deleted_list = []
    for type in typeorder:
        meta.Session()
        artifacts = api.getArtifacts(typeName=type)
        log.info("Total Artifacts of type: %s: %d" % (type, len(artifacts)))
        for a in artifacts: 
            if (not delete_for_owner_ids or a.creatorID in delete_for_owner_ids) and a.creatorID not in protected_owner_ids:
                print "Artifact [%s] type %s owned by: %d and id: %d will be deleted" % (a.getTitle(), type, a.creatorID, a.id)
                log.info("Artifact [%s: %s] owned by: %d and id: %d will be deleted" % (type, a.getTitle(), a.creatorID, a.id))
                if ans != 'A':
                    ans = raw_input("Proceed? (Yes/No/yes to All) [Y|N|A] ")
                    if ans:
                        ans = ans[0].upper()
                        if ans not in ['Y', 'A']:
                            ans = 'N'
                    if ans == 'N':
                        print "Skipping artifact deletion ..."
                        log.info("Skipping artifact deletion ...")
                        continue
                try:
                    id = a.getId()
                    api.deleteArtifactByID(id=a.id, recursive=False)
                    deleted += 1
                    deleted_list.append(id)
                except Exception, e:
                    log.error("Error deleting artifact: %s [%s]" % (id, str(e)), exc_info=e)

    log.info("Total deleted: %d" % deleted)

    if deleted_list:
        from flx.lib.helpers import reindexArtifacts
        reindexArtifacts(deleted_list, user=None)

def help():
    print "run() - to delete all artifacts not belonging to ck12editor"
