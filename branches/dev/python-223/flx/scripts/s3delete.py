#!/usr/bin/env python
"""
    Copy all keys from one S3 bucket to another in parellel.
    Supports copying across 2 different accounts.
    Uses copy from S3 to S3 and does not involve downloading the 
    bucket contents over network.

    Author: Nimish Pachapurkar <nimish@ck12.org>
"""

from boto.s3.connection import S3Connection
from datetime import datetime, timedelta
import threading
from optparse import OptionParser
import logging

logger = logging.getLogger('s3delete')
logger.setLevel(logging.DEBUG)
fh = logging.handlers.RotatingFileHandler('/tmp/s3delete.log', maxBytes=50*1024*1024, backupCount=10)
fh.setLevel(logging.DEBUG)
ch = logging.StreamHandler()
ch.setLevel(logging.INFO)
# create formatter and add it to the handlers
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
fh.setFormatter(formatter)
ch.setFormatter(formatter)
# add the handlers to the logger
logger.addHandler(fh)
logger.addHandler(ch)

## tag@ck12.org
awsAccessKey="AKIAJSLRTPQSJD3DTYAQ"
awsSecretKey="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"

## aws-qa@ck12.org
#awsAccessKey=="AKIAJTYKVWIX27AUEPPA"
#awsSecretKey="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"

class KeyDeleter(threading.Thread):
    def __init__(self, srcBucketName):
        threading.Thread.__init__(self)
        self.keys = []
        self.srcBucketName = srcBucketName
        self.updated = 0
        self.skipped = 0
        self.bucket = None

    def addKey(self, key):
        self.keys.append(key)

    def run(self):
        logger.info("[%s] Starting with %d keys" % (self.name, len(self.keys)))
        for k in self.keys:
            ## Get key to make sure metadata is received
            k = self.bucket.get_key(k.key)
            if k:
                k.delete()
            self.updated += 1

            if (self.updated + self.skipped) % 1000 == 0:
                logger.info("[%s] Finished deleting %d of %d keys, skipped %d keys" % (self.name, self.updated, len(self.keys), self.skipped))


class KeyRemover():
    def __init__(self):
        self.srcAwsAccessKey = None
        self.srcAwsSecretKey = None

        self.srcBucketName = None

        self.updated = 0
        self.skipped = 0

        self.threads = 1
        self.maxKeys = 1000
        self.processKeys = 0

    def deleteKeys(self):
        logger.info("Deleting keys for %s, threads: %s" % (self.srcBucketName, self.threads))
        totalKeys = 0
        connSrc = S3Connection(self.srcAwsAccessKey, self.srcAwsSecretKey)

        srcBucket = connSrc.get_bucket(self.srcBucketName)
        
        s = datetime.now()
        updaters = []
        for i in range(0, self.threads):
            updater = KeyDeleter(self.srcBucketName)
            updater.bucket = srcBucket
            updaters.append(updater)

        resultMarker = ''
        cIdx = 0
        while True:
            keys = srcBucket.get_all_keys(max_keys=self.maxKeys, marker=resultMarker)

            for k in keys:
                updaters[cIdx].addKey(k)
                cIdx += 1

                if cIdx == len(updaters):
                    cIdx = 0
                totalKeys += 1
                if self.processKeys and totalKeys >= self.processKeys:
                    break

            logger.info("Assigned %d keys" % totalKeys)

            if self.processKeys and totalKeys >= self.processKeys:
                break
            if len(keys) < self.maxKeys:
                break

            resultMarker = keys[self.maxKeys - 1].key

        logger.info("Assigned total %d keys" % totalKeys)
        for updater in updaters:
            updater.start()

        for updater in updaters:
            updater.join()
            logger.info("Deleter: %s deleted: %d, skipped: %d" % (updater.name, updater.updated, updater.skipped))
            self.updated += updater.updated
            self.skipped += updater.skipped

        logger.info("Total keys: %d,  deleted: %d, skipped: %d" % (totalKeys, self.updated, self.skipped))
        logger.info("Time taken: %s" % (datetime.now() - s))

def setupArgs():
    parser = OptionParser(description='Delete all keys from S3 buckets')
    parser.add_option('--access-key', dest='srcAwsAccessKey', type=str, help='AWS Access Key for source bucket account')
    parser.add_option('--secret-key', dest='srcAwsSecretKey', type=str, help='AWS Secret Key for source bucket account')
    parser.add_option('--bucket', dest='srcBucketName', type=str, help='Bucket name of the source bucket')
    parser.add_option('--threads', dest='threads', type=int, default=10, help='Number of parallel threads')
    return parser


if __name__ == '__main__':
    parser = setupArgs()
    (options, args) = parser.parse_args()
    if not options.srcAwsAccessKey or not options.srcAwsSecretKey:
        raise Exception("Source keys must be provided")

    if not options.srcBucketName:
        raise Exception("Source bucket name must be provided")

    bc = KeyRemover()

    bc.srcAwsAccessKey = options.srcAwsAccessKey
    bc.srcAwsSecretKey = options.srcAwsSecretKey
    bc.srcBucketName = options.srcBucketName
    bc.threads = options.threads
    bc.deleteKeys()

