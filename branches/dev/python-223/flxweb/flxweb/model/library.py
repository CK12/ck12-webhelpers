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

from pylons.i18n.translation import _
from flxweb.lib.ck12.util import delimit_by,equalsIgnoreCase
from flxweb.model.artifact import *
from flxweb.lib.remoteapi import RemoteAPI
from flxweb.lib.helpers import genURLSafeBase64Decode,genURLSafeBase64Encode
from flxweb.lib.ck12.exceptions import LabelAlreadyExistsException
import logging
import re
from flxweb.model.resource import Resource
try: 
    import simplejson as json
except ImportError: 
    import json
log = logging.getLogger(__name__)

class Label(CK12Model):
    def __init__(self, dict_obj):
        CK12Model.__init__(self, dict_obj)
        # Note: API does not have "id" for labels
        # hence create one for manipulating on 
        # app side.
        self['id'] = genURLSafeBase64Encode(self['label']) 
   
    @staticmethod 
    def getLabelFromId(id):
        return genURLSafeBase64Decode(id)

class LibraryManager(object):
    '''
    Use it for managing user's library. Provides static methods
    for adding artifacts to user's library, managing labels, etc.
    see https://insight.ck12.org/wiki/index.php/Release_2.0_Server_Design_Specification#Library_related
    '''

    # APP LABELS. These are Labels DO NOT exists in backend and
    # are more of a sudo labels used only within the web application
    LABEL_ALL_ITEMS = Label({'label':_('All') ,'systemLabel':0})
    LABEL_ARCHIVED = Label({'label': _('archived'), 'systemLabel':0})
    APP_LABELS= [LABEL_ALL_ITEMS]
   
    # All artifact Types displayed within the library 
    ALL_ARTIFACT_TYPES = 'section,lesson,%s' % ','.join(ArtifactManager.BOOK_TYPES) 

    # Ownership parameter supported by API
    # see https://insight.ck12.org/wiki/index.php/Release_2.0_Server_Design_Specification#Get_Library_Artifacts
    OWNERSHIP_OWNED = 'owned'
    OWNERSHIP_ALL = 'all'
    OWNERSHIP_BOOKMARKS = 'bookmarks'
    
    @staticmethod
    def get_artifacts(artifact_types=None,
                        labels=None,page_num=None,
                        page_size=None,grades=None,
                        sort=None,filters=None,ownership=None,
                        return_total_count=False,
                        book_builder=False):
        try:
            if not artifact_types:
                artifact_types = LibraryManager.ALL_ARTIFACT_TYPES

            if not ownership:
                ownership = LibraryManager.OWNERSHIP_OWNED

            if page_num:
                page_num = int(page_num)
            else:
                page_num = 1

            if not page_size:
                page_size = 10 

            results_key = 'artifacts'
            # By default,only show artifacts that are owned by the current user.
            mylib_api_url = 'get/mylib/info'

            if artifact_types:
                mylib_api_url ='%s/%s' % (mylib_api_url,delimit_by(artifact_types,','))
            else:
                mylib_api_url ='%s/%s' % (mylib_api_url,LibraryManager.ALL_ARTIFACT_TYPES)

            if labels and type(labels) == list:
                # Replace APP LABELS with appropriate API parameters
                # check if the passed labels_copy as ALL_ITEMS label in it
                # if so, then set all=true.
                if LibraryManager.LABEL_ALL_ITEMS['label'] in labels:
                    labels.remove(LibraryManager.LABEL_ALL_ITEMS['label'])
                    artifact_types = LibraryManager.ALL_ARTIFACT_TYPES

                # finally if there are still labels, then use them in api
                if labels:
                    mylib_api_url ='%s/%s' % (mylib_api_url,delimit_by(labels,','))

            params = {'pageNum':page_num, 'pageSize':page_size,'ownership':ownership}
            if sort:
                params['sort'] = delimit_by(sort,';')
            else:
                params['sort'] = 'added,desc'

            if grades:
                params['grades'] = delimit_by(grades,',')

            if filters and type(filters) == dict:
                params['filters'] = ';'.join([ '%s,%s' % (field,term) for field,term in filters.items() ])
                    
            data = RemoteAPI.makeGetCall(mylib_api_url, params)
            artifacts_list = []
            if 'response' in data:
                data = data['response']
                if results_key in data:
                    artifacts = data[results_key]
                    if book_builder:
                        artifacts_list = artifacts
                    else:
                        artifacts_list = [ArtifactManager.toArtifact(artifact) for artifact in artifacts ]
        except Exception, e:
            log.exception(e)
            artifacts_list = []

        if return_total_count:
            if 'total' in data:
                total_count = data['total']
            else:
                total_count = 0
            return total_count,artifacts_list
        else:
            return artifacts_list
        

    @staticmethod
    def get_resources(resource_types=None,
                        labels=None,page_num=None,
                        page_size=None,grades=None,
                        sort=None,filters=None,ownership=None,
                        return_total_count=False):
        try:
            if not resource_types:
                resource_types = 'resource'

            if page_num:
                page_num = int(page_num)
            else:
                page_num = 1

            if not page_size:
                page_size = 10
            
            if not ownership:
                log.debug("!!!")
                ownership = LibraryManager.OWNERSHIP_OWNED

            results_key = 'resources'
            
            mylib_api_url = 'get/mylib/info/resources/%s' % (resource_types)


            if labels and type(labels) == list:
                # make a copy of the passed reference. This is done to avoid
                # modifying passed objects
                labels_copy = labels[:]
                # Replace APP LABELS with appropriate API parameters
                # check if the passed labels_copy as ALL_ITEMS label in it
                # if so, then set all=true.
                if LibraryManager.LABEL_ALL_ITEMS['label'] in labels_copy:
                    labels_copy.remove(LibraryManager.LABEL_ALL_ITEMS['label'])


                # finally if there are still labels, then use them in api
                if labels_copy:
                    mylib_api_url ='%s/%s' % (mylib_api_url,delimit_by(labels_copy,','))

            params = {'pageNum':page_num, 'pageSize':page_size,'ownership':ownership}
            if sort:
                params['sort'] = delimit_by(sort,';')
            else:
                params['sort'] = 'added,desc'

            if grades:
                params['grades'] = delimit_by(grades,',')

            if filters and type(filters) == dict:
                params['filters'] = ';'.join([ '%s,%s' % (field,term) for field,term in filters.items() ])
                    
            data = RemoteAPI.makeGetCall(mylib_api_url, params)
            resources_list = []
            if 'response' in data:
                data = data['response']
                if results_key in data:
                    resources = data[results_key]
                    resources_list = [Resource(resource) for resource in resources ]
        except Exception, e:
            log.exception(e)
            resources_list = []

        if return_total_count:
            if 'total' in data:
                total_count = data['total']
            else:
                total_count = 0
            return total_count,resources_list
        else:
            return resources_list


    @staticmethod
    def add_objects_to_library(objects_labels_map,object_type='artifactRevision'):
        """
        Add many resource revision or artifact revision object to the library and 
        associate multiple labels with them. All existing labels will be removed 
        and all new labels are applied. If the object is already in the library, 
        only the labels are applied.

        A json list of dictionaries. Each dictionary has following items:
        objectID: artifact revision id or resource revision id
        objectType: 'artifactRevision' or 'resourceRevision'
        labels: Comma-separated list of user labels to applied to the object (Optional).
                If given label names are not found they will be created as user-defined labels.
        systemLabels: Comma-separated list of system labels to applied to the object (Optional).
        Example: [{ 'objectID': 100, 'objectType': 'artifactRevision', 
                    'labels': ['midterm', 'for later'], 'systemLabels': ['mathematics']}, 
                  {'objectID': 101, 'objectType': 'artifactRevision'}]
        """
        try:
            api_url = 'add/mylib/objects'

            if not objects_labels_map:
                raise ValueError('objects_labels_map cannot be none')
            else:
                for mapping in objects_labels_map:
                    if not 'objectType' in mapping:
                        mapping['objectType'] = object_type
                params = {'mappings':json.dumps(objects_labels_map)}

            data = RemoteAPI.makeCall(api_url, params)
            log.debug(data)
            return True
        except Exception, e:
            log.exception(e)
            raise e

    @staticmethod
    def add_to_library(object_id,object_type='artifactRevision',
                        labels=None,are_system_labels=False):
        """
        Add a resource revision or artifact revision object to the library.
        object_id: artifact revision id or resource revision id
        object_type: 'artifactRevision' or 'resourceRevision'
        labels: Comma-separated list of labels to applied to the object (Optional).
                If given label names are not found they will be created as user-defined labels.
        are_system_labels: Flag to specify if all the labels in the list above are system-defined (Optional, default false) 
        """
        try:
            api_url = 'add/mylib/object'

            if not object_id:
                raise ValueError('object_id cannot be none')
            else:
                params = {'objectID':object_id,'objectType':object_type}

            if labels:
                params['labels'] = delimit_by(labels,',')

            params['systemLabels'] = are_system_labels

            data = RemoteAPI.makeCall(api_url, params)
            return True
        except Exception, e:
            log.exception(e)
            raise e 

    @staticmethod
    def remove_from_library(object_id,object_type='artifactRevision'):
        """
        Removes a resource revision or artifact revision object from the library.
        object_id: artifact revision id or resource revision id
        object_type: 'artifactRevision' or 'resourceRevision'
        """
        try:
            api_url = 'remove/mylib/object'

            if not object_id:
                raise ValueError('object_id cannot be none')
            else:
                params = {'objectID':object_id,'objectType':object_type}
            data = RemoteAPI.makeCall(api_url, params)
            return True
        except Exception, e:
            log.exception(e)
            raise e

    @staticmethod
    def move_objects_to_label(list_ids,old_label,new_label,
                              object_type='artifactRevision',is_system_label=False):
        """
        Moves objects from old label to new label. The objects must be already added
        to user's library.
        list_ids: list of artifact revision ids or resource revision ids
        old_label: old label name
        new_label: new label name
        object_type: 'artifactRevision' or 'resourceRevision'
        systemLabel: flag to indicate if this is a system label. 'true' or 'false' 
        """
        try:
            api_url = 'move/mylib/objectsLabel'

            if not list_ids or not old_label or not new_label:
                raise ValueError('list_ids, old_label and new_label cannot be none')
            else:
                objectTypes = ','.join([object_type for id in list_ids])
                objectIDs = ','.join([str(id) for id in list_ids])
                params = {'objectIDs':objectIDs,'objectTypes':objectTypes,
                          'oldLabel':old_label, 'newLabel':new_label,
                          'systemLabel':is_system_label  }
            data = RemoteAPI.makeCall(api_url, params)
            log.debug(data)
            return True
        except Exception, e:
            log.exception(e)
            raise e

    @staticmethod
    def remove_label_from_objects(list_ids,label,object_type='artifactRevision',is_system_label=False):
        """
        Removes the specified label from objects. The objects must be already added
        to user's library.
        list_ids: list of artifact revision ids or resource revision ids
        label: label to remove name
        object_type: 'artifactRevision' or 'resourceRevision'
        systemLabel: flag to indicate if this is a system label. 'true' or 'false' 
        """
        try:
            api_url = 'remove/mylib/objectsLabel'

            if not list_ids or not label:
                raise ValueError('list_ids and label cannot be none')
            else:
                objectTypes = ','.join([object_type for id in list_ids])
                objectIDs = ','.join([str(id) for id in list_ids])
                params = {'objectIDs':objectIDs,'objectTypes':objectTypes,
                          'label':label,'systemLabel':is_system_label  }
            data = RemoteAPI.makeCall(api_url, params)
            log.debug(data)
            return True
        except Exception, e:
            log.exception(e)
            raise e

    @staticmethod
    def archive_objects(list_ids,object_type='artifactRevision'):
        return LibraryManager.apply_label_for_objects(list_ids,
                                                      LibraryManager.LABEL_ARCHIVED['label'],
                                                      object_type)

    @staticmethod
    def apply_label_for_objects(list_ids,label,object_type='artifactRevision',is_system_label=False):
        """
        Assign a label to library objects. The objects must be already added to user's library.
        list_ids: list of artifact revision ids or resource revision ids
        label: label name
        object_type: 'artifactRevision' or 'resourceRevision'
        systemLabel: flag to indicate if this is a system label. 'true' or 'false' 
        """
        try:
            api_url = 'add/mylib/objectsLabel'

            if not list_ids or not label:
                raise ValueError('list_ids and label cannot be none')
            else:
                objectTypes = ','.join([object_type for id in list_ids])
                objectIDs = ','.join([str(id) for id in list_ids])
                params = {'objectIDs':objectIDs,'objectTypes':objectTypes,
                          'label':label,'systemLabel':is_system_label  }
            data = RemoteAPI.makeCall(api_url, params)
            log.debug(data)
            return True
        except Exception, e:
            log.exception(e)
            raise e


    @staticmethod
    def get_labels(include_system_labels=True,include_app_labels=True,
                   include_archived_label=False):
        try:
            results_key = 'labels'
            mylabel_api_url = 'get/mylib/info/labels'

            if not include_system_labels:
                mylabel_api_url ='%s/%s' % (mylabel_api_url,'false')

            params = {'pageSize':100,'pageNum':1}
            data = RemoteAPI.makeGetCall(mylabel_api_url,params)
            system_labels = []
            my_labels = []
            if 'response' in data:
                data = data['response']
                if results_key in data:
                    labels_json = data[results_key]
                    for item in labels_json:
                        # if 'archived' label is not requested,
                        # skip it and move to the next one
                        if not include_archived_label and\
                           equalsIgnoreCase(item['label'],
                            LibraryManager.LABEL_ARCHIVED['label']):
                            continue

                        label = Label(item) 
                        if label['systemLabel']:
                            system_labels.append(label)
                        else:
                            my_labels.append(label)

            labels= {'system':system_labels,'my':my_labels}
            if include_app_labels:
                labels["app"] = LibraryManager.APP_LABELS
            return labels
        except Exception, e:
            log.exception(e)
            return None

    @staticmethod
    def get_system_labels():
        all_labels = LibraryManager.get_labels(include_system_labels=True)
        return all_labels['system'] 

    @staticmethod
    def get_my_labels():
        all_labels = LibraryManager.get_labels(include_system_labels=False)
        return all_labels['my'] 


    @staticmethod
    def create_label(label_name,is_system_label=False):
        try:
            api_url = 'create/mylib/label'

            if not label_name:
                raise ValueError('label cannot be none')
            else:
                params = {'label':label_name,'systemLabel':is_system_label}

            data = RemoteAPI.makeCall(api_url, params)
            return Label(data['label'])
        except RemoteAPIStatusException,ex:
            if ex.api_message and 'label already exists' in ex.api_message:
                raise LabelAlreadyExistsException()
            else:
                raise ex
        except Exception, e:
            log.exception(e)
            raise e

    @staticmethod
    def update_label(old_label_name,new_label_name, is_system_label=False):
        try:
            api_url = 'update/mylib/label'

            if not old_label_name or not new_label_name:
                raise ValueError('label names cannot be none')
            else:
                params = {  'label':old_label_name,
                            'newLabel':new_label_name,
                            'systemLabel':is_system_label}
            data = RemoteAPI.makeCall(api_url, params)
            return Label(data['label'])
        except RemoteAPIStatusException,ex:
            if ex.api_message and 'label already exists' in ex.api_message:
                raise LabelAlreadyExistsException()
            else:
                raise ex
        except Exception, e:
            log.exception(e)
            raise e

    @staticmethod
    def delete_label(label_name,is_system_label=False):
        try:
            api_url = 'delete/mylib/label'

            if not label_name:
                raise ValueError('label cannot be none')
            else:
                params = {'label':label_name,'systemLabel':is_system_label}

            data = RemoteAPI.makeCall(api_url, params)
            log.debug(data)
            return True
        except RemoteAPIStatusException,ex:
            log.exception(e)
            raise ex
        except Exception, e:
            log.exception(e)
            raise e

