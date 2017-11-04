#
# Copyright 2007-2011 CK-12 Foundation
#
# All rights reserved
#      
#
# Unless required by applicable law or agreed to in writing, software
# distributed under this License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
# implied.  See the License for the specific language governing
# permissions and limitations.
#
# This file originally written by Nachiket Karve
#
# $Id$

from flxweb.lib.remoteapi import RemoteAPI
from flxweb.model.artifact import JSON_FIELD_RESPONSE
from flxweb.model.ck12model import CK12Model
import logging
import simplejson
from flxweb.lib.ck12.exceptions import GDTImportException, \
    RemoteAPIStatusException, XDTImportException


LOG = logging.getLogger(__name__)

class Task(CK12Model):
    '''
    CK-12 Task Object.
    '''
    
    STATUS_SUCCESS = 'SUCCESS'
    STATUS_FAILURE = 'FAILURE'
    STATUS_PENDING = 'PENDING'
    STATUS_IN_PROGRESS = 'IN PROGRESS'
    
    def __init__(self, dict_obj):
        CK12Model.__init__(self, dict_obj)
        userdata = self.get('userdata')
        try:
            userdata = simplejson.loads(userdata)
            self['userdata'] = userdata
        except Exception:
            LOG.debug('task userdata could not be decoded. Task: %s' % dict_obj)
        
class TaskManager():
    '''
    TaskManager provides methods to work with task related APIs provided by flx coreAPI.
    '''
    @staticmethod
    def get_task_by_id(task_id):
        '''
        Returns task status
        @param task_id: task identifier
        @return: a Task object representing status of task identified by task_id
        '''
        api = 'get/status/task/%s' % task_id
        data = RemoteAPI.makeCall(api)
        if JSON_FIELD_RESPONSE in data:
            task = Task(data[JSON_FIELD_RESPONSE])
            return task
        else:
            raise Exception("Could not fetch task id:%s. API response:%s" % (task_id, data))
    
    @staticmethod
    def get_user_task(render_type, revision_id):
        '''
        checks if currently logged in user has already triggerred
        a task for a particular render type for a particular revision.
        @param render_type: render type (pdf, epub, pdfchapter)
        @param revision_id: revision ID used for print  
        @return: Task Object or None
        '''
        
        api = 'get/usertask/%s/%s' % (revision_id, render_type)
        data = RemoteAPI.makeGetCall(api)
        task_response = data.get(JSON_FIELD_RESPONSE)
        if task_response:
            return Task(task_response)
        else:
            return None
    
    @staticmethod
    def _get_render_task_id(render_type, artifact_id, revision_id, nocache, template_type=None, **kwargs):
        '''
        Triggers a new task using flx/render/ APIs and returns the task ID
        @param render_type: type of render task (pdf, epub, pdfchapter)
        @param artifact_id: id of artifact that is to be rendered
        @param revision_id: (optional) id of revision that is to be rendered.
        @return: task_id
        '''
        api = 'render/%s/%s/%s' % (render_type, artifact_id, revision_id)
        if nocache:
            api = '%s/nocache' % api
        if template_type:
            api = '%s/%s' % (api, template_type)

        if kwargs:
            data = RemoteAPI.makeGetCall(api, params_dict=kwargs)            
        else:
            data = RemoteAPI.makeGetCall(api)
        if data and JSON_FIELD_RESPONSE in data:
            task_id = data[JSON_FIELD_RESPONSE].get('task_id')
            if task_id:
                return task_id
            else:
                return None
        else:
            return None

    @staticmethod
    def get_render_task(render_type, artifact_id, revision_id, nocache=False, template_type=None, **kwargs):
        '''
        Returns a Task object representing render task status for given parameters.
        @param render_type: type of render task (pdf, epub, pdfchapter)
        @param artifact_id: id of artifact that is to be rendered
        @param revision_id: (optional) id of revision that is to be rendered.
        @return:  task_id
        '''
        task = None
        create_new_task = False
        
        if not nocache: #if nocache, always create new task
            task = TaskManager.get_user_task(render_type, revision_id)
        if not task:
            create_new_task = True
        else:
            if task.get('status') == Task.STATUS_FAILURE:
                create_new_task = True
        
        if create_new_task:
            new_task_id = TaskManager._get_render_task_id(render_type, artifact_id, revision_id, nocache, template_type, **kwargs)
            task = TaskManager.get_task_by_id(new_task_id)
            if not task:
                raise Exception('Could not get render task for Artifact ID:%s,Rev:%s,Render Type:%s')
        return task
    
    @staticmethod
    def create_gdt_import_task(docid, title, artifactType='lesson'):
        if not docid or not title:
            raise GDTImportException("Cannot import google document without document ID or title")
        api = 'import/gdt/artifact'
        params = {'docID': docid,
                  'title': title,
                  'artifactType': artifactType,
                  'command':'gdocImport'}
        try:
            data = RemoteAPI.makeCall(api, params)
            response = data['response']
            task_id = response.get('taskID')
            if not task_id:
                raise GDTImportException("could not get task id for GDT import task")
            task = TaskManager.get_task_by_id(task_id)
            if task:
                return task
            else:
                raise GDTImportException("could not get status for created task. id: %s" % task_id)
        except RemoteAPIStatusException:
            raise GDTImportException("could not create GDT import task.")
    
    @staticmethod
    def create_xdt_import_task(file_path, title, artifactType='lesson'):
        stored_file = None
        if not file_path or not title:
            raise XDTImportException("Cannot import without word document or title")
        try:
            stored_file = open(file_path, 'r')
        except:
            raise XDTImportException("Could not open file %s for upload" % file_path)
        if not stored_file:
            raise XDTImportException("Could not open file %s for upload" % file_path)
        
        api = 'import/xdt'
        params = {'command': 'docx2docbook',
                  'fromFile': stored_file,
                  'title' : title,
                  'artifactType': artifactType
                  }
        try:
            data = RemoteAPI.makeCall(api, params, multipart=True)
            try:
                stored_file.close()
            except:
                pass
            LOG.debug(data)
            response = data['response']
            task_id = response.get('task_id')
            if not task_id : 
                raise XDTImportException("could not get task id for XDT import task")
            task = TaskManager.get_task_by_id(task_id)
            if task:
                return task
            else:
                raise XDTImportException("could not get status for created task. id: %s" % task_id)
        except RemoteAPIStatusException:
            raise XDTImportException("could not create XDT import task.")
