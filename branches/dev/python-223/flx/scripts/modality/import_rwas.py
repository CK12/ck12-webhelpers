import sys

if '/opt/2.0/flx/pylons/flx' not in sys.path:
    sys.path.insert(0, '/opt/2.0/flx/pylons/flx')

from flx.model import api
from flx.controllers.celerytasks import importer
from flx.model.workdir import workdir as WD
from flx.lib.unicode_util import UnicodeDictReader

import logging, json, time

log = None

## Initialize logging
def initLog():
    try:
        global log
        if log:
            return log
        LOG_FILENAME = "/tmp/import_rwas.log"
        log = logging.getLogger(__name__)
        log.setLevel(logging.DEBUG)
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=10*1024*1024, backupCount=5)
        handler.setFormatter(formatter)
        log.addHandler(handler)
        return log
    except:
        pass

def run(csvFile):
    if not csvFile:
        raise Exception('No csvFile specified.')
    reader = UnicodeDictReader(open(csvFile, 'rb'))
    rowCnt = 1
    hostname = "http://www.ck12.org"
    workdir_prefix = "/opt/2.0/work/"

    for row in reader:
        rowCnt += 1
        try:
            url = row.get('URL', '').strip()
            if url:
                print "Row: %d. Importing url: %s" % (rowCnt, url)
                log.info("Row: %d. Importing url: %s" % (rowCnt, url))
                myUtil = WD.WorkDirectoryUtil()
                workdir = workdir_prefix + myUtil.getWorkdir()[1]
                log.info("Work dir: %s" % workdir)

                wiki_importer = importer.WikiImporter()
                task = wiki_importer.delay(url, 3, contentVersion='2', workdir=workdir, is_metadata_mode=False, import_drill_mode='concept', content_splitter_guide=None, toCache=True)
                log.info("Waiting for task: %s" % task.task_id)
                result = task.wait()
                log.info("Result: %s" % result)
                attm = 0
                while attm < 5:
                    taskObj = api.getTaskByTaskID(taskID=task.task_id)
                    if not taskObj:
                        raise Exception("Could not find task object by id: %s" % task.task_id)
                    log.info("Task status: %s" % taskObj.status)
                    if taskObj.status != 'IN PROGRESS':
                        break
                    attm += 1
                    time.sleep(5)

                if taskObj.status != 'SUCCESS':
                    log.error("Error importing: %s. Error: %s" % (url, taskObj.message))
                else:
                    log.info("Import data: %s" % taskObj.userdata)
                    j = json.loads(taskObj.userdata)
                    if j.get('artifactID'):
                        log.info("Imported %s. Artifact ID: %s" % (url, j.get('artifactID')))
                        artifact = api.getArtifactByID(id=int(j.get('artifactID')))
                        if artifact:
                            print "Perma: %s/rwa/%s" % (hostname, artifact.handle)
                            log.info("Perma: %s/rwa/%s" % (hostname, artifact.handle))
                        else:
                            log.error("No artifact for this import!")
                    else:
                        log.error("Missing artifactID in userdata")
            else:
                raise Exception("No url found.")
        except Exception as e:
            log.error("Row: %d. Error processing row: %s" % (rowCnt, str(e)))

if __name__ == '__main__':
    initLog()
    try:
        run(sys.argv[1])
    except Exception as e:
        print "Usage: %s <csv-path>" % sys.argv[0]

