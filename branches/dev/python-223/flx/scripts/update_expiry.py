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

logger = logging.getLogger('update_expiry')
logger.setLevel(logging.DEBUG)
fh = logging.handlers.RotatingFileHandler('/tmp/update_expiry.log', maxBytes=100*1024*1024, backupCount=30)
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

## Prod
#awsAccessKey="AKIAJXEZ7WGVVWSR54FA"
#awsSecretKey="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"

class KeyUpdater(threading.Thread):
    def __init__(self, srcBucketName, onlyAcl=False):
        threading.Thread.__init__(self)
        self.keys = []
        self.srcBucketName = srcBucketName
        self.updated = 0
        self.skipped = 0
        self.bucket = None
        self.onlyAcl = onlyAcl

    def updateKey(self, key):
        self.keys.append(key)

    def run(self):
        logger.info("[%s] Starting with %d keys" % (self.name, len(self.keys)))
        for k in self.keys:
            ## Get key to make sure metadata is received
            k = self.bucket.get_key(k.key)
            logger.info("Key: %s" % vars(k))
            logger.debug("onlyAcl: %s" % str(self.onlyAcl))
            if not self.onlyAcl:
                logger.debug('[%s] Updating timestamp for %s' % (self.name, k.key))
                logger.debug("Metadata: %s" % k.metadata)

                metadata = k.metadata
                logger.debug("Content-Disposition: %s" % k.content_disposition)
                if k.content_disposition:
                    metadata['Content-Disposition'] = k.content_disposition
                logger.debug("Content-Type: %s" % k.content_type)
                metadata['Content-Type'] = k.content_type
                if 'application/octet-stream' in metadata['Content-Type'] and \
                        ('COVER_PAGE' in k.key or 'IMAGE' in k.key or 'EQUATION' in k.key):
                    metadata['Content-Type'] = ''
                if metadata.has_key('content-length'):
                    del metadata['content-length']
                if metadata.has_key('last-modified'):
                    del metadata['last-modified']
                logger.debug("metadata: %s" % metadata)

                expiresIn = 5*12*30*24*60*60
                expires = datetime.now() + timedelta(seconds=expiresIn)
                #format = "Tue, 27 Mar 2012 22:09:46 GMT"
                format = '%a, %d %b %Y %H:%M:%S GMT'
                newMetadata = { 
                    "Cache-Control": "PUBLIC, max-age=%s, must-revalidate" % expiresIn,
                    "Expires": expires.strftime(format),
                }
                metadata.update(newMetadata)
                logger.debug("Updating S3 metada with new metadata: %s" % metadata)
                # Copy old key
                k2 = k.copy(k.bucket.name, k.name, metadata, preserve_acl=True)
                k = k2
            k.set_acl('public-read') 

            self.updated += 1

            if (self.updated + self.skipped) % 1000 == 0:
                logger.info("[%s] Finished updating %d of %d keys, skipped %d keys" % (self.name, self.updated, len(self.keys), self.skipped))


class ExpiryUpdater():
    def __init__(self):
        self.srcAwsAccessKey = None
        self.srcAwsSecretKey = None

        self.srcBucketName = None

        self.updated = 0
        self.skipped = 0

        self.threads = 1
        self.maxKeys = 1000
        self.processKeys = 0

    def updateExpiry(self, onlyAcl=False):
        logger.info("Updating expiry for %s, threads: %s" % (self.srcBucketName, self.threads))
        totalKeys = 0
        connSrc = S3Connection(self.srcAwsAccessKey, self.srcAwsSecretKey)

        srcBucket = connSrc.get_bucket(self.srcBucketName)
        
        s = datetime.now()
        updaters = []
        for i in range(0, self.threads):
            updater = KeyUpdater(self.srcBucketName, onlyAcl=onlyAcl)
            updater.bucket = srcBucket
            updaters.append(updater)

        resultMarker = ''
        cIdx = 0
        while True:
            keys = srcBucket.get_all_keys(max_keys=self.maxKeys, marker=resultMarker)

            for k in keys:
                updaters[cIdx].updateKey(k)
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
            logger.info("Updater: %s updated: %d, skipped: %d" % (updater.name, updater.updated, updater.skipped))
            self.updated += updater.updated
            self.skipped += updater.skipped

        logger.info("Total keys: %d,  updated: %d, skipped: %d" % (totalKeys, self.updated, self.skipped))
        logger.info("Time taken: %s" % (datetime.now() - s))

def setupArgs():
    parser = OptionParser(description='Update expiration time for s3 objects')
    parser.add_option('--access-key', dest='srcAwsAccessKey', type=str, help='AWS Access Key for source bucket account')
    parser.add_option('--secret-key', dest='srcAwsSecretKey', type=str, help='AWS Secret Key for source bucket account')
    parser.add_option('--bucket', dest='srcBucketName', type=str, help='Bucket name of the source bucket')
    parser.add_option('--threads', dest='threads', type=int, default=10, help='Number of parallel threads')
    parser.add_option('--only-acl', action='store_true', dest='onlyAcl', default=False, help='Fix the ACL only (public-read). Do not change other parameters.')
    return parser


if __name__ == '__main__':
    parser = setupArgs()
    (options, args) = parser.parse_args()
    if not options.srcAwsAccessKey or not options.srcAwsSecretKey:
        raise Exception("Source keys must be provided")

    if not options.srcBucketName:
        raise Exception("Source bucket name must be provided")

    bc = ExpiryUpdater()

    bc.srcAwsAccessKey = options.srcAwsAccessKey
    bc.srcAwsSecretKey = options.srcAwsSecretKey
    bc.srcBucketName = options.srcBucketName
    bc.threads = options.threads
    bc.updateExpiry(onlyAcl=options.onlyAcl)

