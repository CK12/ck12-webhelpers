from flx.model import api
from flx.lib import helpers as h
import os
import re
import logging

EXCLUDE_OWNER_IDS = [ 3 ]
srcRegex = re.compile(r' src="([^<>"]*)"')

LOG_FILENAME = "/tmp/" + os.path.basename(__file__).replace('.py', '.log')
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=10*1024*1024, backupCount=5)
handler.setFormatter(formatter)
log.addHandler(handler)

print "Logging to: %s" % LOG_FILENAME

def run():
    errors = 0
    pageNum = 1
    pageSize = 64
    totalCount = 0
    iCnt = 0
    while True:
        books = api.getArtifacts(typeName='book', sorting='id,desc', pageNum=pageNum, pageSize=pageSize)
        if not books:
            break
        if not totalCount:
            totalCount = books.getTotal()
        for book in books:
            iCnt += 1
            log.info("[%d of %d] Processing book[id: %d]: %s (user: %d)" % (iCnt, totalCount, book.id, h.safe_encode(book.getTitle()), book.creatorID))
            if book.creatorID in EXCLUDE_OWNER_IDS:
                log.info("Skipping owner %d ..." % book.creatorID)
                continue
            for child in book.revisions[0].children:
                try:
                    childA = child.child.artifact
                    xhtml = child.child.getXhtml(includeChildContent=True)
                    #print xhtml

                    if xhtml:
                        for m in srcRegex.findall(xhtml):
                            #print m
                            if m and not m.startswith('/flx/') and not m.startswith('http://') and not m.startswith('https://'):
                                log.error("Error with chapter %d: %s for book %s (user: %d). Offending SRC: %s" % (child.sequence, h.safe_encode(childA.getTitle()), h.safe_encode(book.getTitle()), book.creatorID, m))
                                errors += 1
                except Exception, e:
                    log.error("Error processing chapter %d [%s]" % (child.sequence, str(e)))

            if iCnt % 256 == 0:
                log.info("Finished %d books. Errors so far: %d" % (iCnt, errors))

        pageNum += 1

    log.info("Processed %d books. Errors: %d" % (totalCount, errors))

