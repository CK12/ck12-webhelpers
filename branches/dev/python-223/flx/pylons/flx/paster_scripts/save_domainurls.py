from flx.model import api
from flx.model import meta
from flx.lib.unicode_util import UnicodeDictReader

import logging
import os

log = None

## Initialize logging
def initLog():
    try:
        global log
        if log:
            return log
        LOG_FILENAME = "/tmp/save_domainurls.log"
        log = logging.getLogger(__name__)
        log.setLevel(logging.DEBUG)
        handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=10*1024*1024, backupCount=5)
        log.addHandler(handler)
        return log
    except:
        pass

def run(csvFile):
    log = initLog()
    associateFailures = 0
    associations = 0

    if not os.path.exists(csvFile):
        raise Exception("No such file: %s" % csvFile)

    log.info("Loading csvFile: %s" % csvFile)
    csvFiles = [ csvFile ]
    for csvFile in csvFiles:
        if not os.path.exists(csvFile):
            log.error("Cannot process file: %s. It was not found!" % csvFile)
            continue
        meta.Session()
        reader = UnicodeDictReader(open(csvFile, 'rb'))
        rowCnt = 1
        for row in reader:
            rowCnt += 1
            try:
                eid = row.get('EID', '').strip()
                if not eid:
                    raise Exception("No EID specified. Skipping ...")
                imageUrl = row.get('Image URL', '').strip()
                if not imageUrl:
                    raise Exception('No Image URL specified. Skipping ...')

                domain = api.getBrowseTermByEncodedID(encodedID=eid)
                if not domain:
                    eid = '.'.join(eid.split('.')[:-2])
                    domain = api.getBrowseTermByEncodedID(encodedID=eid)
                if not domain:
                    raise Exception('Could not find domain term for encodedID: %s' % eid)
                log.info("Processing EID: %s" % domain.encodedID)

                du = api.getDomainUrlsForDomainID(domainID=domain.id)
                if not du or du.url != imageUrl:
                    if du:
                        api.deleteDomainUrl(domainID=domain.id)
                    api.createDomainUrl(domainID=domain.id, url=imageUrl)
                    #BrowseTermCache().invalidate(domain.id)
                    log.info("Associated url [%s] for domain: %s" % (imageUrl, domain.encodedID))
                    associations += 1
                else:
                    log.info("Already exists association for %s" % domain.encodedID)

            except Exception as e:
                associateFailures += 1
                log.error("ERROR: [%d] Error processing: %s" % (rowCnt, str(e)), exc_info=e)

    log.info("Done. Processed %d rows" % rowCnt)
    log.info("Rows: %d, associations: %d, associateFailures: %d" % (rowCnt, associations, associateFailures))


