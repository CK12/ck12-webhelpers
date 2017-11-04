#!/usr/bin/env python 

##
## $Id$
## 

import sys
import json
import urllib2
import os
import re
import logging, logging.handlers

LOG_FILENAME = "generate_url_redirections.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
fileHandler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=10*1024*1024, backupCount=5)
fileHandler.setFormatter(formatter)
log.addHandler(fileHandler)
consoleHandler = logging.StreamHandler(sys.stdout)
consoleHandler.setFormatter(formatter)
log.addHandler(consoleHandler)

## APIs
SERVER_HOSTNAME = "gamma.ck12.org"
GET_CONCEPTS_FOR_BRANCH = "https://%s/taxonomy/get/info/concepts/@@SUB@@/@@BRN@@?pageSize=2000&format=json" % SERVER_HOSTNAME
SERVER_HOSTNAME_OLD = "legacy.ck12.org"
GET_CONCEPTS_FOR_BRANCH_OLD = "https://%s/taxonomy/get/info/concepts/@@SUB@@/@@BRN@@?pageSize=2000&format=json" % SERVER_HOSTNAME_OLD
GET_CONCEPT_INFO = "https://%s/taxonomy/get/info/concept/@@EID@@" % SERVER_HOSTNAME_OLD

OLD_BRANCHES = {
        "MAT": {
            'MAT.ARI': 'arithmetic',
            'MAT.MEA': 'measurement',
            'MAT.ALG': 'algebra',
            'MAT.GEO': 'geometry',
            'MAT.PRB': 'probability',
            'MAT.STA': 'statistics',
            'MAT.CAL': 'calculus',
            'MAT.TRG': 'trigonometry',
            'MAT.ALY': 'analysis',
        }, 
        "SCI": {
            'SCI.PHY': 'physics',
            'SCI.BIO': 'biology',
            'SCI.ESC': 'earth-science',
            'SCI.CHE': 'chemistry',
            'SCI.LSC': 'life-science',
            'SCI.PSC': 'physical-science', 
        },
        "ELA": {
            'ELA.SPL': 'spelling',
        },
}

SUBJECT_BRANCHES = {
        "MAT": {
            "ALG": "algebra",
            "ARI": "arithmetic",
            "MEA": "measurement",
            "GEO": "geometry",
            "CAL": "calculus",
            "TRG": "trigonometry",
            "PRB": "probability",
            "STA": "statistics",
        },
        "SCI": {
            "PHY": "physics",
            "CHE": "chemistry",
            "BIO": "biology",
            "ESC": "earth-science",
        },
        "ELA": {
            "SPL": "spelling",
        },
}

CONCEPT_INFO_CACHE = {}

def getAPIJson(url):
    global CONCEPT_INFO_CACHE
    if CONCEPT_INFO_CACHE.has_key(url):
        return CONCEPT_INFO_CACHE[url]
    log.debug("Getting url: %s" % url)
    ret = urllib2.urlopen(url)
    retJson = json.loads(ret.read())
    if retJson['responseHeader']['status'] != 0:
        raise Exception("Bad status code: %s" % retJson['responseHeader'])
    CONCEPT_INFO_CACHE[url] = retJson
    return retJson

def getCanonicalEncodedID(eid):
    eid = eid.strip().upper()
    eid = eid.rstrip('.')
    if eid.count('.') == 3:
        eid = eid.rstrip('0')
    eid = eid.rstrip('.')
    return eid

def cleanupHandle(handle):
    handleRegex = re.compile(r'(.*)-[0-9]+\.[0-9]+$')
    m = handleRegex.match(handle)
    if m:
        return m.group(1)
    return handle

IGNORE_OLD_URL_PREFIXES = ["/elementary-math-grade"]

if __name__ == '__main__':
    if len(sys.argv) < 2:
        help()
        sys.exit(1)
    
    mydir = os.path.dirname(sys.argv[0])
    subjects = sys.argv[1].split(',')
    if len(subjects) == 1 and subjects[0] == 'ALL':
        subjects = []
        for s in SUBJECT_BRANCHES.keys():
            subjects.append(s)

    oldConceptsAll = {}
    for subject in subjects:
        urlmap = {}
        newUrls = {}
        log.info("Processing: %s" % subject)
        if not oldConceptsAll.has_key(subject):
            oldConceptsAll[subject] = {}
            deps = []
            for b in OLD_BRANCHES[subject].keys():
                osub, obrn = b.split('.')
                url = GET_CONCEPTS_FOR_BRANCH_OLD.replace("@@SUB@@", osub).replace("@@BRN@@", obrn)
                conceptsOldJ = getAPIJson(url)
                for node in conceptsOldJ['response']['conceptNodes']:
                    oldConceptsAll[subject][node['encodedID']] = '/%s/%s' % (node['branch']['handle'].lower(), node['handle'].lower())
        oldConcepts = oldConceptsAll[subject]
        #print oldConcepts

        for brn in SUBJECT_BRANCHES[subject].keys():
            sub = subject
            url = GET_CONCEPTS_FOR_BRANCH.replace('@@SUB@@', sub).replace('@@BRN@@', brn)
            conceptsJ = getAPIJson(url)
            conceptCnt = 0
            for node in conceptsJ['response']['conceptNodes']:
                conceptCnt += 1
                log.info("[%d/%d] Processing: %s" % (conceptCnt, conceptsJ['response']['total'], node['encodedID']))
                if node.get('status') == 'deleted':
                    log.warn("!!! Skipping concept. It is deleted.")
                    continue
                newHandle = node['handle'].lower()
                newHandle = cleanupHandle(newHandle)
                if newHandle != node['handle'].lower():
                    log.warn("!!! Skipping handle - seems invalid: [%s]" % node['handle'].lower())
                    continue

                newUrl = '/%s/%s' % (node['branch']['handle'].lower(), node['handle'].lower())
                oldCoceptUrl = oldConcepts.get(node['encodedID'])
                log.warn(">>> oldCoceptUrl: [%s] -> [%s]" % (oldCoceptUrl, newUrl))
                if oldConcepts.get(node['encodedID']) == newUrl:
                    ## Old concept - skip
                    log.warn("!!! Skipping [%s, %s]. Same as old concept." % (node['encodedID'], newHandle))
                    continue
                    
                log.info(">>> Added new URL: %s" % newUrl)
                newUrls[newUrl] = True
                if not node.get('redirectedReferences'):
                    log.warn("!!! Skipping .... No redirectedReference.")
                    continue
                for rr in node['redirectedReferences']:
                    try:
                        if oldConcepts.has_key(rr):
                            oldUrl = oldConcepts.get(rr)
                        #url = GET_CONCEPT_INFO.replace('@@EID@@', rr)
                        #conceptJ = getAPIJson(url)
                        #if conceptJ['response']['branch'] and conceptJ['response']['handle']:
                            #oldHandle = cleanupHandle(conceptJ['response']['handle'])
                            #oldUrl = '/%s/%s' % (conceptJ['response']['branch']['handle'].lower(), oldHandle.lower())
                            if oldUrl != newUrl and not any([oldUrl.startswith(x) for x in IGNORE_OLD_URL_PREFIXES]):
                                urlmap[oldUrl] = newUrl
                                log.info(">>> Added %s --> %s" % (oldUrl, newUrl))
                            else:
                                log.warn("!!! Skipping %s. Old and new are same or matches a prefix that should be ignored!" % oldUrl)
                        else:
                            log.error("!!! ERROR: No such EID in old concepts: [%s]" % rr)
                            #print "!!! ERROR: Not enough info in concept node to generate oldUrl. EID[%s]" % conceptJ['response']['encodedID'] 
                    except Exception as e:
                        log.error("!!! Error processing redirectedReference: %s" % rr, exc_info=e)

        log.debug("Keys: %d" % len(urlmap.keys()))
        #print "newUrls: %s" % newUrls.keys()
        skipped = 0
        outFile = os.path.join(mydir, '%s_redirections.csv' % subject.lower())
        with open(outFile, "w") as outF:
            #outF.write('"OLD","NEW"\n')
            for key in urlmap:
                oldUrl = urlmap[key]
                if not newUrls.has_key(key):
                    outF.write('"%s","%s"\n' % (key, oldUrl))
                else:
                    log.warn("!!! Skipping [%s]. Already exists as a valid new URL" % key)
                    skipped += 1
        log.info(">>> Skipped keys: %d" % skipped)
        log.info(">>> Wrote urlmap to [%s]" % outFile)
        #print urlmap
 
