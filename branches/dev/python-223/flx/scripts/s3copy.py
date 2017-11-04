#!/usr/bin/env python
"""
    Copy all keys from one S3 bucket to another in parellel.
    Supports copying across 2 different accounts.
    Uses copy from S3 to S3 and does not involve downloading the 
    bucket contents over network.

    Author: Nimish Pachapurkar <nimish@ck12.org>
"""

from boto.s3.connection import S3Connection
from datetime import datetime
import threading
from optparse import OptionParser
import logging

logger = logging.getLogger('s3copy')
logger.setLevel(logging.DEBUG)
fh = logging.handlers.RotatingFileHandler('/tmp/s3copy.log', maxBytes=50*1024*1024, backupCount=10)
fh.setLevel(logging.INFO)
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
awsDestAccessKey="AKIAJTYKVWIX27AUEPPA"
awsDestSecretKey="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"

## Prod
#awsAccessKey="AKIAJXEZ7WGVVWSR54FA"
#awsSecretKey="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"

class KeyCopier(threading.Thread):
    def __init__(self, srcBucketName, dstBucketName, dstBucket, copyNewOnly=False):
        threading.Thread.__init__(self)
        self.keys = []
        self.srcBucketName = srcBucketName
        self.dstBucketName = dstBucketName
        self.dstBucket = dstBucket
        self.copyNewOnly = copyNewOnly
        self.copied = 0
        self.skipped = 0

    def copyKey(self, key):
        self.keys.append(key)

    def run(self):
        logger.info("[%s] Starting with %d keys" % (self.name, len(self.keys)))
        for k in self.keys:
            if self.copyNewOnly and self.dstBucket.get_key(k.key):
                self.skipped += 1
            else:
                logger.debug('[%s] Copying %s from %s to %s' % (self.name, k.key, self.srcBucketName, self.dstBucketName))
                self.dstBucket.copy_key(k.key, self.srcBucketName, k.key)
                self.copied += 1

            if (self.copied + self.skipped) % 1000 == 0:
                logger.info("[%s] Finished copying %d of %d keys, skipped %d keys" % (self.name, self.copied, len(self.keys), self.skipped))


class BucketCopier():
    def __init__(self):
        self.srcAwsAccessKey = None
        self.srcAwsSecretKey = None
        self.dstAwsAccessKey = None
        self.dstAwsSecretKey = None

        self.srcBucketName = None
        self.dstBucketName = None

        self.copyNewOnly = False
        self.copied = 0
        self.skipped = 0

        self.threads = 10
        self.maxKeys = 1000

    def copyBucket(self):
        logger.info("Copying from %s to %s, threads: %s, skipExisting: %s" % (self.srcBucketName, self.dstBucketName, self.threads, self.copyNewOnly))
        totalKeys = 0
        connSrc = S3Connection(self.srcAwsAccessKey, self.srcAwsSecretKey)
        connDest = S3Connection(self.dstAwsAccessKey, self.dstAwsSecretKey)

        srcBucket = connSrc.get_bucket(self.srcBucketName)
        dstBucket = connDest.get_bucket(self.dstBucketName)
        
        s = datetime.now()
        copiers = []
        for i in range(0, self.threads):
            copiers.append(KeyCopier(self.srcBucketName, self.dstBucketName, dstBucket, self.copyNewOnly))

        resultMarker = ''
        cIdx = 0
        while True:
            keys = srcBucket.get_all_keys(max_keys = self.maxKeys, marker = resultMarker)

            for k in keys:
                copiers[cIdx].copyKey(k)
                cIdx += 1

                if cIdx == len(copiers):
                    cIdx = 0
                totalKeys += 1

            logger.info("Assigned %d keys" % totalKeys)

            if len(keys) < self.maxKeys:
                break

            resultMarker = keys[self.maxKeys - 1].key

        for copier in copiers:
            copier.start()

        for copier in copiers:
            copier.join()
            logger.info("Copier: %s copied: %d, skipped: %d" % (copier.name, copier.copied, copier.skipped))
            self.copied += copier.copied
            self.skipped += copier.skipped

        logger.info("Total keys: %d,  copied: %d, skipped: %d" % (totalKeys, self.copied, self.skipped))
        logger.info("Time taken: %s" % (datetime.now() - s))

def setupArgs():
    parser = OptionParser(description='Copy keys across S3 buckets')
    parser.add_option('--src-access-key', dest='srcAwsAccessKey', type=str, help='AWS Access Key for source bucket account')
    parser.add_option('--src-secret-key', dest='srcAwsSecretKey', type=str, help='AWS Secret Key for source bucket account')
    parser.add_option('--dst-access-key', dest='dstAwsAccessKey', type=str, help='AWS Access Key for destination bucket account')
    parser.add_option('--dst-secret-key', dest='dstAwsSecretKey', type=str, help='AWS Secret Key for destination bucket account')
    parser.add_option('--src-bucket', dest='srcBucketName', type=str, help='Bucket name of the source bucket')
    parser.add_option('--dst-bucket', dest='dstBucketName', type=str, help='Bucket name of the destination bucket')
    parser.add_option('--skip-existing', dest='skipExisting', action='store_true', default=False, help='Skip copying if the key already exists')
    parser.add_option('--threads', dest='threads', type=int, default=10, help='Number of parallel threads')
    return parser


if __name__ == '__main__':
    parser = setupArgs()
    (options, args) = parser.parse_args()
    if not options.dstAwsAccessKey:
        options.dstAwsAccessKey = options.srcAwsAccessKey
    if not options.dstAwsSecretKey:
        options.dstAwsSecretKey = options.srcAwsSecretKey

    if not options.srcAwsAccessKey or not options.srcAwsSecretKey:
        raise Exception("Source keys must be provided")

    if not options.srcBucketName or not options.dstBucketName:
        raise Exception("Both source and destination bucket names must be provided")

    bc = BucketCopier()

    bc.srcAwsAccessKey = options.srcAwsAccessKey
    bc.srcAwsSecretKey = options.srcAwsSecretKey
    bc.dstAwsAccessKey = options.dstAwsAccessKey
    bc.dstAwsSecretKey = options.dstAwsSecretKey
    bc.srcBucketName = options.srcBucketName
    bc.dstBucketName = options.dstBucketName
    bc.threads = options.threads
    bc.copyNewOnly = options.skipExisting
    bc.copyBucket()

