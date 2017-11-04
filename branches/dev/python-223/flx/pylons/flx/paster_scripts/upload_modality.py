from pylons.i18n.translation import _ 
from flx.controllers.resourceHelper import ResourceHelper
from flx.model import api, model
from flx.model import meta
from flx.lib.unicode_util import UnicodeDictReader
import flx.controllers.eohelper as eohelper
from flx.lib.helpers import reindexArtifacts
from flx.controllers.celerytasks import modality as m

import logging
import os
import urllib
from datetime import datetime

log = None

## Initialize logging
def initLog():
    try:
        global log
        if log:
            return log
        LOG_FILENAME = "/tmp/upload_modalities.log"
        log = logging.getLogger(__name__)
        log.setLevel(logging.DEBUG)
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=10*1024*1024, backupCount=30)
        handler.setFormatter(formatter)
        log.addHandler(handler)
        return log
    except:
        pass

def run():
    spreadsheet = '2012 Summer Student Modalities - UPLOAD'
    worksheet = 'Basic Algebra Multimedia'

    modalityLoader = m.ModalityLoaderTask()
    task = modalityLoader.delay(csvFilePath=None, googleDocumentName=spreadsheet, googleWorksheetName=worksheet, loglevel='INFO', user=3, toReindex=True)
    result = task.wait()
    print result

