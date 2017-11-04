#!/usr/bin/env python 

##
## $Id$
## 

import json
from collections import OrderedDict
import os
import sys
import urllib2
import re
import logging, logging.handlers

LOG_FILENAME = "generate_prereqs.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
fileHandler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=10*1024*1024, backupCount=5)
fileHandler.setFormatter(formatter)
log.addHandler(fileHandler)
consoleHandler = logging.StreamHandler(sys.stdout)
consoleHandler.setFormatter(formatter)
log.addHandler(consoleHandler)

GET_CONCEPTS_FOR_BRANCH = "https://www.ck12.org/taxonomy/get/info/concepts/@@SUB@@/@@BRN@@?pageSize=2000&format=json"
GET_CONCEPT_INFO = "https://www.ck12.org/taxonomy/get/info/concept/@@EID@@?format=json"
GET_ORIGINAL_PREREQS = "https://legacy.ck12.org/taxonomy/get/info/conceptPrerequires/@@EID@@?format=json"

IGNORE_BRANCH_PREFIXES = [ 'MAT.EM', 'MAT.ALY', 'SCI.PSC', 'SCI.LSC' ]

API_CACHE = {}

def getAPIJson(url):
    if not API_CACHE.get(url):
        log.debug("Getting url: %s" % url)
        ret = urllib2.urlopen(url)
        retJson = json.loads(ret.read())
        if retJson['responseHeader']['status'] != 0:
            raise Exception("Bad status code: %s" % retJson['responseHeader'])
        API_CACHE[url] = retJson
    return API_CACHE.get(url)

def getCanonicalEncodedID(eid):
    eid = eid.strip().upper()
    eid = eid.rstrip('.')
    if eid.count('.') == 3:
        eid = eid.rstrip('0')
    eid = eid.rstrip('.')
    return eid

def cleanupConceptName(handle):
    handleRegex = re.compile(r'(.*) [0-9]+\.[0-9]+$')
    m = handleRegex.match(handle)
    if m:
        return m.group(1)
    return handle

BRANCHES = {
        'MAT': ["MAT.ARI", "MAT.MEA", "MAT.ALG", "MAT.GEO", "MAT.TRG", "MAT.CAL", "MAT.PRB", "MAT.STA",],
        'SCI': ["SCI.PHY", "SCI.ESC", "SCI.CHE", "SCI.BIO"],
        'ELA': ["ELA.SPL"]
        }

if __name__ == '__main__':
    prereqMap = OrderedDict()
    subject = sys.argv[1]
    branches = BRANCHES.get(subject.upper())
    for brnEID in branches:
        sub, brn = brnEID.split('.')
        url = GET_CONCEPTS_FOR_BRANCH.replace('@@SUB@@', sub).replace('@@BRN@@', brn)
        resp = getAPIJson(url)
        total = resp['response']['total']
        cnt = 0
        for cn in resp['response']['conceptNodes']:
            cnt += 1
            if cn.get('status', '') != 'published':
                log.warn("!!! Skipping EID [%s]. Status [%s]" % (cn.get('encodedID'), cn.get('status')))
                continue

            origEid = cn.get('encodedID')
            log.info(">>> [%d/%d] Processing [%s]" % (cnt, total, origEid))
            redirectRefs = cn.get('redirectedReferences', [])
            if not redirectRefs:
                ## Then use the same EID to get prereqs
                redirectRefs = [origEid]
            
            for rr in redirectRefs:
                try:
                    ## Get pre-reqs for the redirectRef
                    url = GET_ORIGINAL_PREREQS.replace('@@EID@@', rr)
                    resp = getAPIJson(url)
                    if resp['response']['prerequires']:
                        if not prereqMap.has_key(origEid):
                            prereqMap[origEid] = {'name': cleanupConceptName(cn.get('name')), 'prereqs': set(), 'prereqEids': set()}

                        for prereq in resp['response']['prerequires']:
                            log.info("prereq: EID[%s], Priority[%s]" % (prereq.get('encodedID'), prereq.get('priority')))
                            prereqEid = prereq.get('encodedID')
                            ## Get the new concept for this
                            url = GET_CONCEPT_INFO.replace('@@EID@@', prereqEid)
                            resp = getAPIJson(url)
                            prereqConcept = resp['response'].get('redirectionConcept', resp['response'])
                            if prereqConcept and not any([prereqConcept.get('encodedID').startswith(x) for x in IGNORE_BRANCH_PREFIXES]):
                                prereqNewEid = prereqConcept.get('encodedID')
                                if prereqNewEid != origEid and prereqNewEid not in prereqMap[origEid]['prereqEids']:
                                    prereqMap[origEid]['prereqEids'].add(prereqNewEid)
                                    prereqTuple = (prereqNewEid, cleanupConceptName(prereqConcept.get('name')), prereq.get('priority'))
                                    log.info(">>> Adding prereqTuple [%s]" % str(prereqTuple))
                                    prereqMap[origEid]['prereqs'].add(prereqTuple)
                                else:
                                    log.warn(">>> Skipping %s. It is already a pre-req or same as %s." % (prereqNewEid, origEid))
                            else:
                                log.warn(">>> No prereq concept OR prefix matches IGNORE_BRANCH_PREFIXES: [%s]" % prereq.get('encodedID'))
                except Exception as e:
                    log.error("!!! Error: %s" % str(e), exc_info=e)

    if prereqMap:
        csvDir = os.path.join(os.path.abspath(os.path.dirname(sys.argv[0])), '..', '..', '..', 'taxonomy', 'data', 'collection')
        outputFile = os.path.join(csvDir, "%s-prereqs.csv" % subject)
        with open(outputFile, "w") as outf:
            for key in prereqMap:
                for prereq in prereqMap[key]['prereqs']:
                    outf.write('"%s","%s","%s","%s","%s"\n' % (key, prereqMap[key]['name'], prereq[0], prereq[1], prereq[2]))
            log.info("Wrote: %s" % outputFile)

