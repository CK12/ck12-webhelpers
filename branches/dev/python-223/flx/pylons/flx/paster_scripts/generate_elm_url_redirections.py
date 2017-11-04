#!/usr/bin/env python 

##
## $Id$
## 

import sys
import json
import urllib2
import os
import re
import csv

from flx.model.mongo.collectionNode import CollectionNode
from flx.model.mongo import getDB as getMongoDB
from pylons import config

## APIs
SERVER_HOSTNAME_OLD = "www.ck12.org"
GET_CONCEPT_INFO = "https://%s/taxonomy/get/info/concept/@@EID@@" % SERVER_HOSTNAME_OLD
CONCEPT_INFO_CACHE = {}

MONGODB = getMongoDB(config)

def getAPIJson(url):
    global CONCEPT_INFO_CACHE
    if CONCEPT_INFO_CACHE.has_key(url):
        return CONCEPT_INFO_CACHE[url]
    print "Getting url: %s" % url
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

BRANCHES = [('em1', 'elementary-math-grade-1'), ('em2', 'elementary-math-grade-2'), ('em3', 'elementary-math-grade-3'), ('em4', 'elementary-math-grade-4'), ('em5', 'elementary-math-grade-5')]
def run(csvFileDir='/opt/collection-data'):

    mapping = {}
    for brn, brnHandle in BRANCHES:
        csvFileName = os.path.join(csvFileDir, '%s-collection.csv' % brn)
        if not os.path.exists(csvFileName):
            print "!!! Error: Cannot find CSV file: %s" % csvFileName
            continue

        print "Processing: %s" % csvFileName
        with open(csvFileName, "rb") as csvf:
            reader = csv.DictReader(csvf)
            rowCnt = 1
            for row in reader:
                newEID = row.get('EncodedID')
                if not newEID:
                    continue
                newEID = getCanonicalEncodedID(newEID)
                ## Get handle
                docs = CollectionNode(MONGODB).getByEncodedIDs(eIDs=[newEID], collectionHandle=brnHandle, collectionCreatorID=3, publishedOnly=True, canonicalOnly=True)
                newHandle = None
                for doc in docs:
                    newHandle = doc['absoluteHandle']

                if not newHandle:
                    print "!!! Error: Cannot get newHandle for EID [%s]" % newEID
                    continue

                newUrl = '/c/%s/%s' % (brnHandle.lower(), newHandle.lower())

                ## Get old EIDs
                origEids = [ getCanonicalEncodedID(x.strip()) for x in row.get('Original EncodedIDs').split(',') ]
                for oeid in origEids:
                    ## Get the API response
                    resp = None
                    for item in [oeid, '%s0' % oeid]:
                        try:
                            url = GET_CONCEPT_INFO.replace('@@EID@@', item)
                            resp = getAPIJson(url)
                            break
                        except Exception as e:
                            print "!!! No such EID: [%s]. Trying again ..." % item
                            pass

                    if not resp:
                        print "!!! Error: Cannot get response for EID [%s]" % oeid
                        continue

                    oldUrl = '/%s/%s' % (resp['response']['branch']['handle'].lower(), resp['response']['handle'].lower())

                    if not mapping.has_key(newUrl):
                        mapping[newUrl] = set()
                    mapping[newUrl].add(oldUrl)
                rowCnt += 1
            outFile = os.path.join(csvFileDir, '%s_redirections.csv' % brn.lower())
            with open(outFile, "w") as outF:
                for key in mapping:
                    for oldUrl in mapping[key]:
                        outF.write('"%s","%s"\n' % (oldUrl, key))
            print ">>> Wrote urlmap to [%s]" % outFile


 
