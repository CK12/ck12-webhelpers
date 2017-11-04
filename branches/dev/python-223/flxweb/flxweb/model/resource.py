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
# $Id$

from flxweb.lib.ck12.exceptions import ResourceUploadException,\
    RemoteAPIStatusException, ResourceAlreadyExistsException,\
    ResourceExceedsSizeLimitException, ResourceNotFoundException,\
    ResourceSaveException
from flxweb.lib.remoteapi import RemoteAPI
from flxweb.model.ck12model import CK12Model
from flxweb.model.session import SessionManager
from pylons import config
import logging
import os
import random
import tempfile
import time
import shutil
from flxweb.lib.ck12.errorcodes import ErrorCodes
import flxweb.lib.helpers as h
from urllib2 import quote


log = logging.getLogger(__name__)

RESOURCE_FILETYPES = {
    'document':['.doc','.dot','.docx','.dotx','.odt','.ott','.txt'],
    'spreadsheet':['.xlsx','.xltx','.xls','.xlt','.ods','.ots'],
    'presentation':['.ppt','.pps','.pot','pptx','potx','.ppsx','.odp','.otp','.swf'],
    'pdf':['.pdf'],
    'epub':['.epub','.mobi'],
    'zip':['.zip','.tar','.tar.gz'],
    'image':['.jpg','.jpeg','.png','.gif','.bmp'],
    'iworks':['.key','.keynote','.pages','.numbers']
}

class Resource(CK12Model):
    '''
    Resource class is a wrapper for resource json
    '''
    def __init__(self, dict_obj):
        CK12Model.__init__(self, dict_obj)
        self['isPublic'] = self.is_public()
        self['labels'] = self.getLibraryLabels()
        
    def is_public(self):
        '''
        returns whether the resource is public
        '''
        if self.has_key('revisions') and len(self['revisions'])>0:
            revision = self['revisions'][0]
            public = revision.get('isPublic')
        else:
            public = self.get('publishTime',None) != None
        return public
    
    def get_file_extension(self):
        ext = os.path.splitext(self.get('originalName'))
        if ext:
            ext = ext[1]
            return ext
        else:
            return None
    
    def get_filetype(self):
        ext = self.get_file_extension()
        if ext:
            for ftype in RESOURCE_FILETYPES:
                extns = RESOURCE_FILETYPES.get(ftype)
                if ext in extns:
                    return ftype
        return None
    
    def getLibraryLabels(self):
        '''
        Returns labels for the resource
        '''
        if self.has_key('revisions') and self.get('revisions'):
            revision = self.get('revisions')[0]
            if revision and 'labels' in revision and revision.get('labels'):
                return [label['label'] for label in revision['labels']]
            else:
                return []
    
    def getAddedToLibrary(self):
        '''
        Returns the date on which this artifact
        was added to the library of current user
        Returns none otherwise 
        '''
        if self.has_key('revisions') and self.get('revisions'): 
            revision = self.get('revisions')[0]
            if revision and 'addedToLibrary' in revision:
                return revision['addedToLibrary']
            else:
                return None
        else:
            return None
    
    def is_owner(self,user):
        '''
        Returns true if the passed user is the owner of the artifact 
        '''
        if 'ownerID' in self and user and 'id' in user:
            return self['ownerID'] == user['id']
        else:
            return False

    def is_eo(self):
        '''
        Returns true if the resource is a Embedded Object type
        resource
        '''
        return 'embeddedObject' in self

    def get_artifact_info(self):
        '''
        Returns the artifact information if
        this resource has the 'artifactRevisions' field
        '''
        artifact_info = {}
        if 'artifactRevisions' in self and\
            self['artifactRevisions']:
                from flxweb.model.modality import ModalityManager
                for index,rev in enumerate(self['artifactRevisions']):
                    if 'artifactType' in rev and rev['artifactType'] == self['type']:
                        artifact_info = rev
                        break
                    else:
                        modality_group = ModalityManager.get_modality_group_by_type(rev['artifactType'])
                        if 'artifactType' in rev and\
                            self['type'].lower() == modality_group['group_name'].lower():
                            artifact_info = rev 
                            break
        return artifact_info

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
        defaults to system's temporary directory
        '''
        resource_upload_dir = config.get('resource_upload_dir')
        if not resource_upload_dir:
            log.warn("!!WARNING!! resource_upload_dir is not configured!")
        if not os.path.exists(resource_upload_dir):
            try:
                os.makedirs(resource_upload_dir)
            except:
                log.warn("!!WARNING!! could not create resource_upload_dir %s" % resource_upload_dir)
                resource_upload_dir = '/tmp/'
        return resource_upload_dir
    
    @classmethod
    def upload_dir_is_shared(cls):
        '''
        returns whether the upload directory is shared with 
        coreapi servers using the config setting:
        resource_upload_dir_shared
        defaults to False
        '''
        shared = config.get('resource_upload_dir_shared', False)
        return shared == 'true'
    
    
    @classmethod
    def get_unique_upload_dir(cls):
        try:
            uploaddir = cls.get_upload_dir()
            if not uploaddir:
                uploaddir = tempfile.gettempdir()
            f = tempfile.NamedTemporaryFile(dir=uploaddir)
            dirname = f.name
            f.close()
            os.makedirs(dirname)
            return dirname
        except:
            raise ResourceUploadException("Failed to create upload directory %s" % uploaddir)
       
    
    @classmethod
    def store_upload_file(cls, path, filename, fileobj):
        try:
            filename = os.path.join(path, filename)
            filename = filename.encode('utf-8')
            storedfile = open(filename, 'w')
            shutil.copyfileobj(fileobj, storedfile)
            fileobj.close()
            storedfile.close()
            return filename
        except Exception,e:
            log.exception(e)
            raise ResourceUploadException("Failed to save uploaded file %s to %s." % (filename, path) )
        
        
    
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
    
    @staticmethod
    def save_resource(resource_name, 
                      resource_desc='', 
                      resource_type='attachment', 
                      resource_id=None, 
                      resource_uri=None, 
                      resource_fileobj=None, 
                      resource_handle=None, 
                      is_attachment=False,
                      is_public=False,
                      is_external=False):
        '''
        Create/Update Resource
        '''
        if not resource_id:
            if not resource_uri and not resource_fileobj :
                raise ResourceUploadException('unspecified resource URI or resource path. provide atleast one of these.')
            if not resource_name:
                raise ResourceUploadException('resource name is not specified.')
        
        params = {
            'resourceName':resource_name,
            'resourceType':resource_type,
            'resourceDesc':resource_desc,
        }
        
        if resource_id:
            api = 'update/resource'
            params.update({'id':resource_id})
        else:
            api = 'create/resource'
        
        if resource_name:
            resource_handle = h.resourceNameToHandle(resource_name)
            params.update({'resourceHandle':resource_handle})
            
        if is_attachment:
            params.update({'isAttachment':'true'})
        else:
            params.update({'isAttachment':'false'})
            
        if is_public:
            params.update({'isPublic':'true'})
        else:
            params.update({'isPublic':'false'})

        if is_external:
            params.update({'isExternal':'true'})
        else:
            params.update({'isExternal':'false'})

        data = None
        tmp_upload_dir = None
        stored_file_path = None
        
        try:
            if resource_fileobj != None:
                # save the file
                tmp_upload_dir = ResourceManager.get_unique_upload_dir()
                stored_file_path = ResourceManager.store_upload_file( tmp_upload_dir , resource_name, resource_fileobj)
                if is_attachment and not ResourceManager.validate_resource_size(stored_file_path) :
                    raise ResourceExceedsSizeLimitException()
                
                if ResourceManager.upload_dir_is_shared() and ResourceManager.get_upload_dir() and ResourceManager.get_upload_dir() in stored_file_path :
                    params.update({'resourcePathLocation': stored_file_path})
                    log.debug('Creating resource. Params: %s' % params)
                    data = RemoteAPI.makeCall(api, params)
                    os.remove(stored_file_path)
                else:
                    uploaded_file = open(stored_file_path, 'r')
                    params.update({'resourcePath':uploaded_file})
                    log.debug('uploading attachment: %s' % uploaded_file.name)
                    log.debug("upload params: %s" % params)
                    # make API request
                    data = RemoteAPI.makeCall(api, params, multipart=True)
                    uploaded_file.close()
                shutil.rmtree(tmp_upload_dir)
            elif resource_uri != None:
                if is_external:
                    params.update({'resourceUri':resource_uri})
                log.debug("upload params: %s" % params)
                data = RemoteAPI.makeCall(api, params)
            else :
                log.debug("upload params: %s" % params)
                data = RemoteAPI.makeCall(api, params)
            log.debug('status: %s' % data)
        except RemoteAPIStatusException, ex:
            if ErrorCodes.RESOURCE_ALREADY_EXISTS == ex.status_code:
                data = ex.response_data
                if 'response' in data and 'uri' in data['response'] and 'permaUri' in data['response']:
                    existing_resource = Resource(data['response'])
                    raise ResourceAlreadyExistsException(resource=existing_resource)
                else:
                    raise ResourceAlreadyExistsException()
            elif ErrorCodes.CANNOT_CREATE_RESOURCE == ex.status_code \
            or ErrorCodes.CANNOT_UPDATE_RESOURCE == ex.status_code:
                raise ResourceSaveException()
            elif ErrorCodes.RESOURCE_EXCEEDS_SIZE_LIMIT == ex.status_code:
                raise ResourceExceedsSizeLimitException()
            else:
                log.error("Resource upload failed. api: %s , params: %s" % (api, params))
                log.exception(ex)
                raise ex
        except Exception, ex:
            log.error("Resource upload failed. api: %s , params: %s" % (api, params))
            log.exception(ex)
            raise ex
        finally:
            try:
                if stored_file_path and os.path.exists(stored_file_path):
                    os.remove(stored_file_path)
                if tmp_upload_dir and os.path.exists(tmp_upload_dir):
                    shutil.rmtree(tmp_upload_dir)
            except:
                pass
                
        if data and 'message' in data['response']:
            raise Exception("Error uploading resource")
        resource = Resource(data['response'])
        return resource
        
    @staticmethod
    def delete_resource(resource_obj):
        '''
        Delete resource
        '''
        resource_id = resource_obj.get('id')
        data = ResourceManager.delete_resource_by_id(resource_id)
        return data
    
    @staticmethod
    def validate_resource_size(stored_file_path, param='attachment_max_upload_size'):
        '''
            Check size of uploaded resource
        '''
        storedfile = None
        try:
            storedfile = open(stored_file_path, 'rb+')
            storedfile.seek(0,2)
            resource_size = storedfile.tell()
            max_upload_size = config.get(param)
            if (resource_size > int(max_upload_size)) :
                return False
            return True
        except Exception, ex:
            raise ex
        finally:
            if storedfile is not None:
                storedfile.close()
        
    @staticmethod
    def delete_resource_by_id(resource_id):
        '''
        Delete resource by ID
        '''
        api = 'delete/resource'
        params = {'id':resource_id,'force':'true'}
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
    
    @staticmethod
    def get_resource_by_perma(resource_type, resource_handle, realm, stream):
        if not (resource_type and resource_handle):
            raise ResourceNotFoundException('')
        resource_handle = quote(resource_handle)
        api_endpoint = 'get/perma/resource/info'
        if stream:
            api_endpoint = '%s/%s' % (api_endpoint, stream)
        api_endpoint = '%s/%s' % (api_endpoint, resource_type)
        if realm:
            api_endpoint = '%s/%s' % (api_endpoint, realm)
        api_endpoint = '%s/%s' % (api_endpoint, resource_handle)
        try:
            data = RemoteAPI.makeGetCall(api_endpoint)
            if data and  'response' in data and 'resource' in data['response']:
                return Resource(data['response']['resource'])
        except RemoteAPIStatusException, ex:
            raise ResourceNotFoundException()
        except Exception, ex:
            log.debug("Error fetching resource")
            raise Exception
    
