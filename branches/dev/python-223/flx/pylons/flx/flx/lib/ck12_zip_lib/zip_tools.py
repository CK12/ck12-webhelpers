import logging
import os
import urllib
from datetime import datetime
from zipfile import ZipFile

import settings

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
        work_dir = settings.ROOT_WORK_DIR + "/ck12_zip/" + time_str
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

def downloadZip(downloadUri, path):
    oldPath = path.replace('.zip', '_tmp.zip')
    urllib.urlretrieve(downloadUri, oldPath)
    removeFilesFromZip(oldPath, path)

def removeFilesFromZip(oldFile, newFile):
    """
    This function will remove unwanted files from zip.
    """
    removeFileList = ['mimetype', 'META-INF/container.xml', 'OEBPS/content.opf', 'OEBPS/toc.ncx']
    zin = ZipFile(oldFile, 'r')
    zout = ZipFile(newFile, 'w')
    for item in zin.infolist():
        if item.filename not in removeFileList:
            buffer = zin.read(item.filename)
            zout.writestr(item, buffer)
    zout.close()
    zin.close()
    os.remove(oldFile)
