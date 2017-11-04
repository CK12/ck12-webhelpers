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
# @author: Nachiket Karve
#
# $id$

from flxadmin.lib.ck12.exceptions import ResourceUploadException
from flxadmin.lib.remoteapi import RemoteAPI
from flxadmin.model.ck12model import CK12Model
from flxadmin.model.session import SessionManager
from pylons import config, tmpl_context as c
import logging
import os
import random
import tempfile
import time


log = logging.getLogger(__name__)

class Resource(CK12Model):
    '''
    Resource class is a wrapper for resource json
    '''
    def __init__(self, dict_obj):
        CK12Model.__init__(self, dict_obj)

class ResourceManager():
    '''
    ResourceManager class provides static methods to
    interact with resource creation and manipulation
    methods provided by coreAPI.
    https://insight.ck12.org/wiki/index.php/Release_2.0_Server_Design_Specification#Resource_related
    '''
    
    @classmethod
    def get_upload_dir(cls):
        '''
        get configuration setting for resource upload directory
        defaults to /tmp/
        '''
        resource_upload_dir = config.get('resource_upload_dir', tempfile.gettempdir())
        if not os.path.exists(resource_upload_dir):
            os.makedirs(resource_upload_dir)
        return resource_upload_dir

    @classmethod
    def get_upload_filename_prefix(cls):
        '''
        get filename prefix. this prefix is combination of timestamp and 
        a random number. This prefix should be used with filenames while 
        persisting file-like objects during uploads
        '''
        timestamp = '%s' % time.time()
        timestamp = timestamp.replace('.', '-')
        randomnum = '%s' % random.randint(1, 100)
        userid = '0'
        user = SessionManager.getCurrentUser()
        if user:
            userid = '%s' % user.get('id')
        prefix = '%s-%s-%s' % (userid, timestamp, randomnum)
        return prefix
    
    @classmethod
    def _upload_dir_is_shared():
        '''
        returns whether the upload directory is shared with 
        coreapi servers using the config setting:
        resource_upload_dir_shared
        defaults to False
        '''
        return config.get('resource_upload_dir_shared', False)
    
    @staticmethod
    def save(resource_name, resource_desc='', resource_type='attachment', 
             resource_id=None, resource_uri=None, resource_path=None, 
             resource_handle=None, resource_authors='', resource_licence='',
             creator_id=None, return_resource=False):
        ''' Create/Update Resource
        Returns data from api call, or returns resource object from a new GET 
         after saving if return_resource=True.
        '''
        if resource_uri != None and resource_path != None:
            raise ResourceUploadException('unspecified resource URI or resource path. provide atleast one of these.')
        if not resource_name:
            raise ResourceUploadException('resource name is not specified.')
        
        params = {
            'resourceName':resource_name,
            'resourceType':resource_type,
            'resourceDesc':resource_desc,
            'resourceAuthors':resource_authors,
            'resourceLicense':resource_licence,
            'impersonateMemberID':str(creator_id),
        }

        if resource_id:
            api = 'update/resource'
            params.update({'id':resource_id})
        else:
            api = 'create/resource'

        if resource_handle:
            params.update({'resourceHandle':resource_handle})

        data = None
        if resource_path != None:
            params.update({'resourcePath':resource_path})
            log.debug("upload params: %s" % params)
            data = RemoteAPI.makeCall(api, params, multipart=True)
        elif resource_uri != None:
            params.update({'resourceUri':resource_uri})
            log.debug("upload params: %s" % params)
            data = RemoteAPI.makeCall(api, params)
        log.debug('status: %s' % data)
        if 'message' in data['response']:
            raise Exception("Error uploading resource")

        if return_resource:
            resourceID = data['response'].get('resourceID')
            resourceRevisionID = data['response'].get('resourceRevisionID')
            return ResourceManager.get_resource(resourceID, resource_type, resourceRevisionID)
        else:
            return data
        
    @staticmethod
    def delete_resource(resource_obj):
        '''
        Delete resource
        '''
        resource_id = resource_obj.get('id')
        data = ResourceManager.delete_resource_by_id(resource_id)
        return data
    
    @staticmethod
    def delete_resource_by_id(resource_id):
        '''
        Delete resource by ID
        '''
        api = 'delete/resource'
        params = {'id':resource_id}
        data = RemoteAPI.makeCall(api, params)
        return data
    
    @staticmethod
    def get_resource(resource_id, resource_type=None, revision_id=None):
        '''
        Get resource info. 
        '''
        api = 'get/info/resource'
        if resource_type:
            api = '%s/%s' % (api, resource_type)
        else:
            resource_type = 'resource'
        api = '%s/%s' % (api, resource_id)
        if revision_id:
            api = '%s/%s' % (api, revision_id)
        
        data = RemoteAPI.makeGetCall(api)
        if data and 'response' in data:
            response = data['response']
            resource = Resource(response.get(resource_type))
            return resource
        else:
            raise Exception('Could not fetch resource. id:%s, type:%s, revision:%s' % (resource_id, resource_type, revision_id))

