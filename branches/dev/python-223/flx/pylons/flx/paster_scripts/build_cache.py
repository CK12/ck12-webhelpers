import urllib2
import threading, random
from datetime import datetime
from flx.model import api

import logging

LOG_FILENAME = "/tmp/build_cache.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=10*1024*1024, backupCount=5)
handler.setFormatter(formatter)
log.addHandler(handler)

hostnames = [ 'nimish.ck12.org', 'np-u1204.ck12.in' ]

def run(threads=1):
    start = datetime.now()
    termType = api.getBrowseTermTypeByName(name='domain')
    domains = api.getBrowseTerms(termType=termType)
    cnt = 1
    domainDict = {}
    total = domains.getTotal()
    log.info("Total domains: %d" % total)
    for d in domains:
        if d.handle and d.encodedID:
            domainDict[d.encodedID.upper()] = d.handle
    cacheBuilders = []
    for i in range(0, threads):
        cacheBuilders.append(CacheBuilder(i))
        cacheBuilders[-1].total = total

    cnt = 0
    for k in sorted(domainDict.keys()):
        handle = domainDict.get(k)
        cacheBuilders[cnt].domains.append((k, handle))
        cnt += 1
        if cnt == len(cacheBuilders):
            cnt = 0

    for cb in cacheBuilders:
        cb.start()

    for cb in cacheBuilders:
        cb.join()
    end = datetime.now()
    log.info("Total time: %s" % (end-start))

class CacheBuilder(threading.Thread):
    def __init__(self, id):
        threading.Thread.__init__(self)
        self.domains = []
        self.total = 0
        self.cnt = 0
        self.id = id

    def run(self):
        domainCnt = len(self.domains)
        for eid, handle in self.domains:
            self.cnt += 1
            log.info("[Thread: %d] Processing %s" % (self.id, eid))
            hostname = random.choice(hostnames)
            apiUrl = 'http://%s/flx/get/info/modalities/%s?pageSize=100' % (hostname, handle)
            log.info("[Thread: %d] [%d/%d] Calling: %s" % (self.id, self.cnt, domainCnt, apiUrl))
            start = datetime.now()
            r = urllib2.urlopen(apiUrl)
            s = r.read()
            end = datetime.now()
            log.info("[Thread: %d] [%d/%d] Returned: %s, Bytes: %d, Time: %s" % (self.id, self.cnt, domainCnt, apiUrl, len(s), (end-start)))
