from flx.model import api
from flx.lib import helpers as h
from tempfile import NamedTemporaryFile
import logging
from datetime import datetime
import sys

import os, shutil

LOG_FILENAME = "/tmp/migrate_to_satellite.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=10*1024*1024, backupCount=5)
handler.setFormatter(formatter)
log.addHandler(handler)

IMG_DIR = '/mnt/1x_images'

new = 0
def run(dir=None):
    global new
    failed = success = processed = 0
    if not dir:
        dir = IMG_DIR
    if os.path.exists(dir):
        for root, dirs, files in os.walk(dir):
            for file in files:
                processed += 1
                try:
                    img = os.path.join(root, file)
                    if os.path.exists(img) and os.path.getsize(img) > 0:
                        log.info("Processing image: %s" % img)
                        create_resource_satellite(img, 'image', license='CC BY-NC-SA')
                        success += 1
                    else:
                        raise Exception('File does not exist or is 0 size')
                except Exception as e:
                    log.error("Error creating satellite image: %s" % str(e), exc_info=e)
                    failed += 1
    log.info("Processed: %d, Success: %d, Failed: %d, New: %d" % (processed, success, failed, new))

def create_resource_satellite(resourcePath, resourceType, license=None):
    global new
    f = None
    try:
        log.info("Processing iamge: %s" % resourcePath)
        type = api.getResourceTypeByName(name=resourceType)
        f = open(resourcePath, 'rb')
        sum, size = h.computeChecksum(contents=f)
        isNew, j = h.createRemoteResource(resourceType=type, isExternal=False, creator=3, name=os.path.basename(resourcePath), contents=f, checksum=sum, authors=None, licenseName='CC BY-NC-SA')
        if isNew:
            new += 1
        log.info("Satellite image: %s, New? [%s]" % (j['response']['uri'], str(isNew)))
    except Exception as e:
        log.error("Error creating remove resource: %s" % str(e), exc_info=e)
    finally:
        if f:
            f.close()

