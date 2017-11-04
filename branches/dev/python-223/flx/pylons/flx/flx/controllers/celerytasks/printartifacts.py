import logging
import json
import jsonlib
import time
import urllib2

from paster_scripts import login_handler
from pylons import config
from flx.controllers.celerytasks.generictask import GenericTask
from flx.lib import helpers as h
import flx.controllers.user as u
from flx.model import api
import flx.controllers.task as t
from flx.controllers.celerytasks import pdf
from flx.controllers.celerytasks import epub
from flx.controllers.celerytasks import mobi
log = logging.getLogger(__name__)


class PrintArtifactsTask(GenericTask):
    """
    This task will generate pdf, epub and mob for all the ck12 artifacts.
    """

    recordToDB = False

    def __init__(self, **kwargs):
        ## Initialize GenericTask
        GenericTask.__init__(self, **kwargs)
        self.routing_key = "print"
        self.output_file = None
        self.batchSize = 100
        self.ck12_userid = 1
        self.polling_wait_time = 1200
        self.ck12_user = api.getMemberByID(self.ck12_userid)
        self._setConfigVariables()

    def _setConfigVariables(self):
        """
        Set the required configuration variables.
        """
        global config
        
        typeNames = config.get('PRINT_ARTIFACT_TYPES')
        if not typeNames:
            config = h.load_pylons_config()
            typeNames = config.get('PRINT_ARTIFACT_TYPES')
        types = typeNames.split(',')
        self.printJobRunTime = int(config.get('PRINT_JOB_RUN_TIME'))        
        self.typeNames = filter(lambda x:x, map(lambda x:x.strip(), types))
        self.defaultImageHost = config.get('default_image_host')
        self.downloadPrefix = config.get('pdf_download_prefix')
        self.mathSatelliteServer = config.get('math_satelite_server')
        flx_prefix = config.get('flx_prefix_url')
        self.server = '%s/flx'
        loginHandler = login_handler.LoginHandler()
        self.cookie = loginHandler.getLoginCookie(self.ck12_userid)

    def getArtifacts(self, pageNum=1, pageSize=10):
        """
        Return the artifacts owned by CK-12.
        """
        artifacts = api.getArtifactsByOwner(self.ck12_user, typeName=self.typeNames, pageNum=pageNum, pageSize=pageSize)
        return artifacts

    def processArtifact(self, artifact):
        """
        Process artifact to generate print resources for pdf, epub and mobi.
        """
        result = dict()
        artifactRevision = artifact.revisions[0]
        artifactID = artifact.id
        revisionID = artifactRevision.id
        tc = t.TaskController()

        log.info('Processing artifact/artifactRevision: %s/%s' % (artifactID, revisionID))

        # Generate PDF
        pdfTaskResult = self._getTaskStatus(artifactID, 'pdf')
        # If task already handled or in progress skip the task.
        if pdfTaskResult['response'] and (pdfTaskResult['response']['status'] in ['PENDING', 'IN PROGRESS', 'SUCCESS', 'FAILURE']):
            log.info('A PDF task is already handled or in progress for the artifactRevision: %s' %(revisionID))
            log.info('PDF Task Info: %s' %(pdfTaskResult))
        else:    
            createPdf = pdf.pdf()
            pdfTask = createPdf.delay(artifactID,self.downloadPrefix, self.defaultImageHost, 
                                      revisionID=revisionID, nocache=True, user=self.ck12_userid)
            result['pdf_task_id'] = pdfTask.task_id
            log.info('PDF task created, artifactID/TaskID: %s/%s' % (artifactID, pdfTask.task_id))
            # Wait till PDF task is completed.
            task = self.pollOnTask(pdfTask.task_id)
            log.info('PDF task completed, artifactID/TaskID/Status: %s/%s/%s' % (artifactID, pdfTask.task_id, task.status))

        
        # Generate EPUB
        epubTaskResult = self._getTaskStatus(artifactID, 'epub')
        # If task already handled or in progress skip the task.
        if epubTaskResult['response'] and (epubTaskResult['response']['status'] in ['PENDING', 'IN PROGRESS', 'SUCCESS', 'FAILURE']):
            log.info('A EPUB task is already handled or in progress for the artifactRevision: %s' %(revisionID))
            log.info('EPUB Task Info: %s' %(epubTaskResult))
        else:    
            createEpub = epub.epub()
            epubTask = createEpub.delay(artifactID, self.mathSatelliteServer, self.defaultImageHost, 
                                        revisionID=revisionID, nocache=True, user=self.ck12_userid)
            result['epub_task_id'] = epubTask.task_id
            log.info('EPUB task created, artifactID/TaskID: %s/%s' % (artifactID, epubTask.task_id))
            # Wait till EPUB task is completed.
            task = self.pollOnTask(epubTask.task_id)
            log.info('EPUB task completed, artifactID/TaskID/Status: %s/%s/%s' % (artifactID, epubTask.task_id, task.status))

        # Generate MOBI
        mobiTaskResult = self._getTaskStatus(artifactID, 'mobi')
        # If task already handled or in progress skip the task.
        if mobiTaskResult['response'] and (mobiTaskResult['response']['status'] in ['PENDING', 'IN PROGRESS', 'SUCCESS', 'FAILURE']):
            log.info('A MOBI task is already handled or in progress for the artifactRevision: %s' %(revisionID))
            log.info('MOBI Task Info: %s' %(mobiTaskResult))
        else:    
            resourceRevision = artifact.getResourceRevision(artifactRevision, 'mobi')
            if resourceRevision:
                log.info('nocache option specified. Regenerating the mobi')
                api.deleteArtifactHasResource(artifactRevisionID=revisionID,
                                            resourceRevisionID=resourceRevision.id)
                api.deleteResource(resource=resourceRevision.resource)
            createMobi = mobi.mobi()
            mobiTask = createMobi.delay(artifactID, self.mathSatelliteServer, self.defaultImageHost,
                                        revisionID=revisionID , nocache=True, user=self.ck12_userid)
            result['mobi_task_id'] = mobiTask.task_id
            log.info('MOBI task created, artifactID/TaskID: %s/%s' % (artifactID, mobiTask.task_id))
            # Wait till MOBI task is completed.
            task = self.pollOnTask(mobiTask.task_id)
            log.info('MOBI task completed, artifactID/TaskID/Status: %s/%s/%s' % (artifactID, mobiTask.task_id, task.status))

        return result

    def pollOnTask(self, taskID):
        startTime = time.time()
        while True:
            task = api.getTaskByTaskID(taskID=taskID)
            time.sleep(5)
            if task.status == 'SUCCESS' or task.status == 'FAILURE':
                return task
            if task.status == 'IN PROGRESS' or task.status == 'PENDING':
                pass
            if (time.time() - startTime) >= self.polling_wait_time:
                log.info('Task taking more time so skipping polling for task, TaskID:%s.' % (taskID))
                return task

    def _getTaskStatus(self, artifactID, taskName):
        """
        Get the status of the task.
        """
        result = {'response' : None}
        try:
            url = self.server + '/flx/render/%s/%s/nocache' %(taskName, artifactID)
            response = self._makeCall(url, self.cookie)
            result = jsonlib.read(str(response))
            response = result['response']
            taskID = response["task_id"]
            task = api.getTaskByTaskID(taskID=taskID)
            result['response'] = self._getTaskInfo(task)
        except Exception as e:
            log.info('In _getTaskStatus Exception : %s' %(e))

        log.info('In _getTaskStatus: %s' %(result))

        return result

    def _getTaskInfo(self, task):
        """
        Get the details of the task.
        """
        taskInfo = dict()
        taskInfo['id'] = task.id
        taskInfo['taskID'] = task.taskID
        taskInfo['name'] = task.name
        taskInfo['status']  = task.status
        taskInfo['hostname'] = task.hostname
        if task.owner:
            taskInfo['owner'], task.owner = u.getUserInfo(task.owner)
        taskInfo['result'] = task.message
        taskInfo['started'] = str(task.started)
        taskInfo['updated'] = str(task.updated)
        taskInfo['userdata'] = task.userdata
        return taskInfo    

    def _makeCall(self, url, cookie):
        """
        Make the API call.
        """
        opener = urllib2.build_opener()
        opener.addheaders.append(('Cookie', cookie))
        handle = opener.open(url)
        response = handle.read()
        #response = json.loads(response)
        return response

    def run(self, **kwargs):
        """
        Generate the print resources for pdf, epub and mobi.
        """
        timeUp = False
        startTime = time.time()
        GenericTask.run(self, **kwargs)
        pageNum = 1
        # Process artifacts in batch.
        artifacts = self.getArtifacts(pageNum=pageNum, pageSize=self.batchSize)
        while True:
            if len(artifacts) <= 0:
                break
            for artifact in artifacts:
                self.processArtifact(artifact)
                # Run the task for the 4 hours.
                if (time.time() - startTime) >= self.printJobRunTime:
                    timeUp = True
                    break
            if timeUp:
                break       
            pageNum += 1
            artifacts = self.getArtifacts(pageNum=pageNum, pageSize=self.batchSize)
