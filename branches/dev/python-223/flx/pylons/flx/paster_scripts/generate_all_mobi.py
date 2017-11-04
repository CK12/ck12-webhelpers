# This script triggers the PDF generation endpoint for all Published books
# (books, teacher books, workbooks) sequentially. Note that PDF generation for
# all the published books is a time consuming process and will last several
# minutes to few hours depending on the amount of books available
# Instructions: 1) cd /opt/2.0/flx/pylons/flx
#               2) sudo paster shell
#               3) from paster_scripts import generate_all_mobi
#               4) generate_all_mobi.start(app, url)

import urllib2
from datetime import datetime
from datetime import timedelta
import json
import jsonlib
import logging

from flx.model import meta
from flx.model import model
from flx.model import api
session = meta.Session()

from paster_scripts import login_handler

LOG_FILENAME = "/opt/2.0/log/allmobi.log"
log = logging.getLogger('GeneratAllMobi')
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

def start(app, url):
    loginHandler = login_handler.LoginHandler()
    publishedBooksIDs = api.getPublishedBooksIDs()
    #publishedBooksIDs = publishedBooksIDs[126:]
    #publishedBooksIDs = [9319]
    count = 0
    successCount = 0
    failureCount = 0
    totalTime = timedelta(0, 0, 0)
    for eachPublishedBook in publishedBooksIDs:
        count = count + 1
        artifact = api.getArtifactByID(id=eachPublishedBook)
        printToLog('%d. Generating mobi - artifactID: %s, name: %s' %(count, eachPublishedBook, artifact.name))
        renderPDFEndPoint = 'http://localhost/flx/render/mobinoauth/%s/nocache' %(eachPublishedBook)

        startTime = datetime.now()
        try:
            response = app.get(url(controller = 'mobi', action =
                                   'render',id=eachPublishedBook,
                                   revisionID=None,
                                   nocache=True),headers={'Cookie': loginHandler.getLoginCookie(1)})
            result = jsonlib.read(str(response.body))
            response = result['response']
            taskID = response["task_id"]
        except:
            printToLog('Encountered an error is triggering the end point. Exiting...')
            printToLog('Error message: %s' %(response))
            continue
        printToLog('\t taskID: %s' %(taskID))
        task = pollOnTask(taskID)
        endTime = timestamp = datetime.now()
        timeDelta = endTime - startTime
        totalTime = totalTime + timeDelta
        elapsedTime = timedeltaAsString(timeDelta)
        if task.status == 'SUCCESS':
            downloadUri = json.loads(task.userdata)['downloadUri']
            printToLog('\t Mobi generation completed for artifactID: %s \
                   \n\t DownloadUri: %s \
                   \n\t Elapsed Time: %s' %(eachPublishedBook, downloadUri, elapsedTime))
            successCount = successCount + 1
        elif task.status == 'FAILURE':
            printToLog('\t Mobi generation failed for artifactID: %s \
                   \n\t Error Message: %s \
                   \n\t Elapsed Time: %s' %(eachPublishedBook, task.message, elapsedTime))
            failureCount = failureCount + 1
        printToLog('\t Success/Total: %d/%d' %(successCount, count))
        printToLog('\t Elapsed Time: %s' %(timedeltaAsString(totalTime)))
        printToLog('_'*150)
    printToLog('_'*150)
    printToLog('Total number of books: %d' %(count))
    printToLog('Total number of succeeded books: %d' %(successCount))
    printToLog('Total number of failed books: %d' %(failureCount))
    printToLog('Total elapsed time: %s' %(timedeltaAsString(totalTime)))
    printToLog('\n\n')
