import time
import logging
import traceback
import subprocess
import os
from tempfile import NamedTemporaryFile
from pylons.i18n.translation import _ 
import json
from shutil import copy
from datetime import datetime

from pylons import config
from celery.task import Task

from flx.model import meta
from flx.model import api
from flx.model import init_model
from sqlalchemy import engine_from_config
from flx.lib.localtime import Local
from flx.controllers.celerytasks.generictask import GenericTask
from flx.lib.helpers import transform_to_xhtml
from flx.lib.ck12_epub_lib.ck12_epub import CK12EPub
from flx.lib.gdt.gdt2epub import GDT2ePub
from flx.lib.gdt.download import GDTDownloader

log = logging.getLogger(__name__)

def save_epub_resource(epubpath, bookTitle, userID):
    try:
        resourceDict = {}
        resourceDict['resourceType'] = api.getResourceTypeByName(name="epub")
        timestamp = datetime.now().strftime("%Y%m%d%s%f")
        uniqueName = 'GDT_' + bookTitle + timestamp
        resourceDict['name'] = uniqueName
        resourceDict['description'] = ''
        resourceDict['isExternal'] = False
        resourceDict['uriOnly'] = False
        newEpubPath = os.path.dirname(epubpath) + '/' + uniqueName + '.epub'
        print 'New ePubPath: %s' %(newEpubPath)
        os.rename(epubpath, newEpubPath)
        resourceDict['uri'] = open(newEpubPath, 'rb')
        resourceDict['creationTime'] = datetime.now()
        resourceDict['ownerID'] = userID
        resourceRevision = api.createResource(resourceDict=resourceDict, commit=True)
        downloadUri = resourceRevision.resource.getPermaUri(fullUrl=True, qualified=True)
        return downloadUri
    except Exception as e:
        raise e

def timedeltaAsString(timeDelta):
    totalSeconds = timeDelta.seconds
    minutes, seconds = divmod(totalSeconds, 60)
    minutesString = '' if minutes == 0 else '%s Minutes' %(minutes)
    secondsString = ' %s Seconds' %(seconds)
    return minutesString + secondsString

class Gdt2ePubTask(GenericTask):
    recordToDB = True
    serializer = "json"
    loglevel = "INFO"

    def __init__(self, **kwargs):
        ## Initialize GenericTask
        GenericTask.__init__(self, **kwargs)
        self.routing_key = "print"
        self.output_file = None

    def run(self, docIDs, userID, bookTitle, googleAuthToken=None, **kwargs):
        """
            Convert to lesson
        """
        GenericTask.run(self, **kwargs)
        startTime = datetime.now()

        try:
            myEpub = CK12EPub()
            myEpub.setLogger(log)
            workdir = myEpub.workdir
            myEpub.setLogger(log)

            book_authors = ['CK-12 Editor']
            book_contributors = []
            book_editors = []
            book_sources = []
            book_translators = []
            book_authors_string = ", ".join(book_authors)
            book_editors_string = ", ".join(book_editors)
            book_sources_string = ", ".join(book_sources)
            book_contributors_string = ", ".join(book_contributors)
            book_translators_string = ", ".join(book_translators)
            myEpub.add_author_attribution(book_authors_string,
                                          book_editors_string,
                                          book_sources_string,
                                          book_contributors_string,
                                          book_translators_string)

            gdt2ePub = GDT2ePub(workdir, uselib=myEpub)
            for eachDocID in docIDs.split(","):
                eachDocID = eachDocID.strip()
                zipfile = None
                tempf = NamedTemporaryFile(suffix='.zip', delete=False)
                tempf.close()
                zipfile = tempf.name
                log.info("Downloading GoogleDoc with docID  %s as zip file" %(eachDocID))
                log.info("Downloading to zip file: %s" % zipfile)

                downloader = GDTDownloader(eachDocID, googleAuthToken)
                downloader.download(zipfile)

                log.info('Copying the zipfile to ePub work directory: %s' %(workdir))
                gdt2ePub.add_chapter_from_zip(zipfile)
                if os.path.exists(zipfile):
                    os.remove(zipfile)

            myEpub.set_book_title(bookTitle)

            myEpub.render()
            ePubPath = myEpub.workdir + '/book.epub'
            if os.path.exists(ePubPath):
                log.info('ePub rendered successfully. Location: %s' %(ePubPath))
                downloadUri = save_epub_resource(ePubPath, bookTitle, userID=userID)
                endTime = timestamp = datetime.now()
                timeDelta = endTime - startTime
                elapsedTime = timedeltaAsString(timeDelta)
                log.info(elapsedTime)
                self.userdata = json.dumps({'downloadUri' : downloadUri,
                                            'elapsedTime' : elapsedTime})
            else:
                raise Exception((_(u'Error in rendering epub')).encode("utf-8"))
        except Exception as e:
            raise Exception(e.__str__())
        finally:
            log.info('ePub created and saved successfully')
