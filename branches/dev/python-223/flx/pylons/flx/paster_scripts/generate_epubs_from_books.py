# This script triggers the epub generation endpoint for all Published books
# (books, teacher books, workbooks) sequentially. Note that epub generation for
# all the published books is a time consuming process and will last several
# minutes to few hours depending on the amount of books available
# Instructions: 1) cd /opt/2.0/flx/pylons/flx
#               2) sudo paster shell
#               3) from paster_scripts import generate_all_epubs
#               4) generate_all_epubs.start(app, url)

import urllib2
from datetime import datetime
from datetime import timedelta
import json
import jsonlib
import logging
import traceback

from flx.model import meta
from flx.model import model
from flx.model import api
from flx.lib.unicode_util import UnicodeWriter

session = meta.Session()

from paster_scripts import login_handler

LOG_FILENAME = "/opt/2.0/log/allepubs.log"
log = logging.getLogger('GeneratAllepub')
log.setLevel(logging.DEBUG)
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=10*1024*1024, backupCount=5)
log.addHandler(handler)

def pollOnTask(taskID):
    while True:
        task = api.getTaskByTaskID(taskID=taskID)
        import time; time.sleep(5)
        if task.status == 'SUCCESS' or task.status == 'FAILURE':
            return task
        if task.status == 'IN PROGRESS' or task.status == 'PENDING':
            pass

def timedeltaAsString(timeDelta):
    totalSeconds = timeDelta.seconds
    minutes, seconds = divmod(totalSeconds, 60)
    minutesString = '' if minutes == 0 else '%s Minutes' %(minutes)
    secondsString = ' %s Seconds' %(seconds)
    return minutesString + secondsString

def printToLog(message):
    print message
    log.debug(message)

def writeDownloadUri(writer, artifactID):
    artifact = api.getArtifactByID(id=artifactID)
    epubResoures = artifact.revisions[0].getResources('epub')
    if epubResoures:
        downloadUri = epubResoures[0].getUri()
        if downloadUri:
            writer.writerow([downloadUri])

def _makeCall(url, cookie):
    opener = urllib2.build_opener()
    opener.addheaders.append(('Cookie', cookie))
    handle = opener.open(url)
    response = handle.read()
    #response = json.loads(response)
    return response

def start(server, publishedBooksID):
    loginHandler = login_handler.LoginHandler()
    cookie = loginHandler.getLoginCookie(1)
    count = 0
    successCount = 0
    failureCount = 0
    totalTime = timedelta(0, 0, 0)
    outputFile = open('/tmp/epub_downloads_%s.csv' %(publishedBooksID), 'w')
    writer = UnicodeWriter(outputFile)

    artifact = api.getArtifactByID(id=publishedBooksID)
    artifactRevision = artifact.revisions[0]
    chapters = artifactRevision.children
    for eachChapter in chapters:
        log.info('Chapter title: [%s]' %(eachChapter.child.artifact.getTitle()))
        for eachLesson in eachChapter.child.children:
            log.info('Lesson title: [%s]' %(eachLesson.child.artifact.getTitle()))
            artifactID = eachLesson.child.artifact.id
            artifact = eachLesson.child.artifact
            epubResoures = artifact.revisions[0].getResources('epub')
            if epubResoures:
                downloadUri = epubResoures[0].getUri()
                if downloadUri:
                    writer.writerow([downloadUri])
                    continue

            count = count + 1
            printToLog('%d. Generating epub - artifactID: %s, name: %s' %(count, artifactID, artifact.name))

            startTime = datetime.now()
            try:
                url = server + '/flx/render/epub/%s/nocache' %(artifactID)
                response = _makeCall(url, cookie)
                #response = app.get(url(controller = 'epub', action =
                #                       'render',id=artifactID,
                #                       revisionID=None,
                #                       nocache=True,optimizeForKindle='False'),headers={'Cookie': loginHandler.getLoginCookie(1)})
                result = jsonlib.read(str(response))
                response = result['response']
                taskID = response["task_id"]
            except Exception as e:
                log.info(traceback.format_exc(e))
                printToLog('Encountered an error is triggering the end point. Exiting...')
                printToLog('Error message: %s' %(response))
                continue

            printToLog('\t taskID: %s' %(taskID))
            task = pollOnTask(taskID)
            endTime = datetime.now()
            timeDelta = endTime - startTime
            totalTime = totalTime + timeDelta
            elapsedTime = timedeltaAsString(timeDelta)
            if task.status == 'SUCCESS':
                downloadUri = json.loads(task.userdata)['downloadUri']
                printToLog('\t epub generation completed for artifactID: %s \
                       \n\t DownloadUri: %s \
                       \n\t Elapsed Time: %s' %(artifactID, downloadUri, elapsedTime))
                writer.writerow([downloadUri])
                successCount = successCount + 1
            elif task.status == 'FAILURE':
                printToLog('\t epub generation failed for artifactID: %s \
                       \n\t Error Message: %s \
                       \n\t Elapsed Time: %s' %(artifactID, task.message, elapsedTime))
                failureCount = failureCount + 1
            printToLog('\t Success/Total: %d/%d' %(successCount, count))
            printToLog('\t Elapsed Time: %s' %(timedeltaAsString(totalTime)))
            printToLog('_'*150)
    printToLog('_'*150)
    printToLog('Total number of books: %d' %(count))
    printToLog('Total number of succeeded books: %d' %(successCount))
    printToLog('Total number of failed books: %d' %(failureCount))
    printToLog('Total elapsed time: %s' %(timedeltaAsString(totalTime)))
    writer.writerow([downloadUri])
    printToLog('\n\n')
