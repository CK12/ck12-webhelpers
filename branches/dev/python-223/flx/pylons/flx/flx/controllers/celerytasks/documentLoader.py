import datetime
import time
from flx.controllers.celerytasks.periodictask import PeriodicTask
from flx.lib.viewer.boxViewer import BoxViewer
from flx.model import api
import json
import logging

log = logging.getLogger(__name__)
EXCLUDED_RESOURCE_TYPES = ['answer demo', 'answer key', 'epub', 'epubk', 'html', 'mobi', 'pdf', 'quiz answer demo', 'quiz answer key', 'worksheet']

class DocumentLoaderTask(PeriodicTask):
    serializer = "json"
    loglevel = "INFO"
    
    def __init__(self, **kwargs):
        ## Initialize PeriodicTask
        PeriodicTask.__init__(self, **kwargs)

        self.skipIfRunning = False
        self.routing_key = 'artifact'

    def _getQuota(self):
        executionStartTime = time.strftime("%Y/%m/%d")
        r_quota = 0
        next_iteration_days = 0
        last_execution_time = None
        taskID = None
        iteration_quota = self.config.get('dv_iteration_quota', 5000)
        iteration_quota = int(iteration_quota)
        log.info('Iteration quota=%d' % iteration_quota)
        lastTask = api.getLastTaskByName(name='UploadDocumentBatch', statusList=['SUCCESS'])
        if lastTask and lastTask.userdata:
            ud = json.loads(lastTask.userdata)
            r_quota = ud.get('remaining_quota')
            last_execution_time = ud.get('last_execution_time')
            
            y1,m1,d1 = (int(x) for x in executionStartTime.split('/'))
            y2,m2,d2 = (int(x) for x in last_execution_time.split('/'))
            date1 = datetime.date(y1, m1, d1)
            date2 = datetime.date(y2, m2, d2)
            dateDiff = date1 - date2
            log.info('Difference in days %d'% (dateDiff.days))
            
            dv_execution_days = int(self.config.get('dv_execution_days', 8))
            next_iteration_days = dv_execution_days - dateDiff.days
            if dateDiff.days >= dv_execution_days:
                last_execution_time = None
                r_quota = iteration_quota
            
            taskID = lastTask.id
        else:
            r_quota = iteration_quota
        return r_quota, last_execution_time,next_iteration_days,taskID

class DocumentLoaderWorker(DocumentLoaderTask):
    """
        Uploads documents passed in to Box Viewer
    """
    recordToDB = False

    def run(self, **kwargs):
        DocumentLoaderTask.run(self, **kwargs)
        uploaded = failed = 0
        messages = []
        documents = kwargs.get('documents')
        
        for document in documents:
            resourceID = document.get('id')
            resourceURL = document.get('resourceURL')
            file_name = document.get('file_name')
            log.info('Input file name=[%s]'%file_name)
            if BoxViewer.isFormatSupported(file_name):
                log.info('Uploading document for resource with resourceID= %s'%resourceID)
                messages.append('Uploading document for resource with resourceID= %s'%resourceID)
                dv = BoxViewer()
                document_id = dv.boxUpload(resourceURL)
                if document_id:
                    log.info('Queued document document_id= %s'%document_id)
                    messages.append('Uploaded document document_id= %s'%document_id)

                    document['document_id'] = document_id

                    log.info('Successfully queued document resource %s and document_id %s' % (resourceID,document_id))
                    messages.append('Successfully queued document resource %s and document_id %s' % (resourceID,document_id))

                    api.updateResourceBoxDocumentID(resourceID, document)
                    uploaded +=1
                else:
                    log.info('Error processing uploaded document resource %s and document_id %s' % (resourceID,document_id))
                    messages.append('Error processing uploaded document resource %s and document_id %s' % (resourceID,document_id))
                    failed += 1
            else:
                log.info('File format not supported for file=[%s]'%file_name)
        return {'uploaded':uploaded,'failed':failed,'messages':messages}

class UploadDocumentBatch(DocumentLoaderTask):
    """
        Uploads all qualifying resources for artifacts until it reaches limit given.
        limit=5000 by default
    """
    recordToDB = True
    inprocess = False
 
    def run(self, **kwargs):
        DocumentLoaderTask.run(self, **kwargs)
        executionStartTime = time.strftime("%Y/%m/%d")
 
        # Make sure we don't run again if already running/scheduled
        r_quota, last_execution_time,next_iteration_days, taskID = self._getQuota()
 
        if self.isAlreadyRunning():
            self.userdata = json.dumps({'remaining_quota': r_quota})
            return 'Skipped'
        processedResources = uploaded = failed = 0
  
        # If quota is over then do not process documents
        log.info('Starting with remaining quota=%d' % (r_quota))
        
        if last_execution_time and r_quota == 0:
            self.userdata = json.dumps({'remaining_quota': r_quota,'last_execution_time':last_execution_time})
            log.info('This Iteration quota is over, You can execute next iteration after %d days'%(next_iteration_days))
            return True
            
            
        limit = r_quota
  
        #createdAfter = kwargs.get('createdAfter', None)
        log.info('Info Params %s' %kwargs)
        resourceIDs = kwargs.get('resourceIDs', [])
        pageNum=1
        pageSize=250
        tasks = []
        messages = []
        log.info('Fetching next [%d] for page [%d]' % (pageSize, pageNum))
        if not resourceIDs:
            attachments = api.getViewerQualifiedResources(pageNum=pageNum, pageSize=pageSize)
        else:
            attachments = api.getViewerQualifiedResources(resourceIDs=resourceIDs)
        
        while limit > processedResources and attachments:
            log.info('Processing [%d] for page [%d]' % (len(attachments), pageNum))
            documents = []
            for attachment in attachments:
                # stop processing if we reached limit
                if limit <= processedResources:
                    break
                  
                attachment = attachment.asDict(addResourceURL=True)
                  
                if attachment.get('document_id') is None:
                    # TODO: if error documents to be processed again 
                     
                    if attachment['type'] not in EXCLUDED_RESOURCE_TYPES:
                        document = {'id':attachment['id'],
                                    'resourceURL':attachment['resourceURL'],
                                    'file_name':attachment['handle'],
                                    }
                        log.debug('document dict = [%s]'%document)
                        documents.append(document)
                        processedResources += 1
                else:
                    log.info('Already uploaded to document viewer. document_id=[%s]'%attachment['document_id'])
              
            log.debug('document dict = [%s]'%document)
            log.debug('%d resources qualified for upload so far'%len(documents))
            if documents:
                worker = DocumentLoaderWorker()
                if self.inprocess:
                    t = worker.apply(kwargs={'loglevel': 'INFO', 'documents': documents})
                else:
                    t = worker.delay(loglevel='INFO', documents=documents)
                tasks.append(t)
                
            log.info('processedResources= [%d]' % processedResources)
            pageNum += 1
            # Process only if quota is available
            if not resourceIDs and limit > processedResources:
                log.info('Fetching next [%d] for page [%d]' % (pageSize, pageNum))
                attachments = api.getViewerQualifiedResources(pageNum=pageNum, pageSize=pageSize)
            else:
                break
  
        log.info('Scheduled %d workers'%len(tasks))
        for task in tasks:
            try:
                ret = task.wait()
                uploaded += ret['uploaded']
                failed += ret['failed']
                messages.extend(ret['messages'])
            except Exception,e:
                log.error("Error running at least one worker: %s" % str(e), exc_info=e)
        r_quota = r_quota - uploaded
        self.userdata = json.dumps({'remaining_quota': r_quota,'last_execution_time':executionStartTime})
        log.info('uploaded=%d | failed=%d | total process=%d | Remaining Quota=%d' % (uploaded,failed,processedResources,r_quota))
        return {'uploaded':uploaded,'failed':failed,'total processed':processedResources,'Remaining Quota':r_quota}

class UploadDocumentBatchInprocess(UploadDocumentBatch):

    recordToDB = False
    inprocess = True
