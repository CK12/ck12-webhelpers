import urllib, urllib2
from urlparse import urlparse
import hashlib
import random
import re
from datetime import datetime
import settings
import os
import subprocess
#import tidy
from tidylib import tidy_document
from BeautifulSoup import BeautifulSoup
import random
from PIL import Image
import codecs
import logging

from flx.model import api
log = logging.getLogger(__name__)

# Create a unique working directory.
# If fails after 3 attempts, it raises IOError exception
def create_work_dir():
    work_dir = ""
    attempt = 0
    created = False
    while attempt < 3:
        attempt +=1
        time_str = ""
        time_str = create_timestamp()
        work_dir = settings.ROOT_WORK_DIR + "/ck12_mobi/" + time_str
        if mkdir(work_dir):
            created = True
            break;
    if not created:
        raise IOError("Failed to create working directory. Permission issue?")
    else :
        return work_dir

def mkdir(path):
    if not os.path.exists(path):
        os.makedirs(path)
        return True
    else:
        return False

def create_timestamp():
    return datetime.now().strftime("%Y%m%d%H%M%S%f")

def downloadEpub(downloadUri, path):
    return urllib.urlretrieve(downloadUri, path)
