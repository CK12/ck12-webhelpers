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
# $Id: artifact.py 15121 2012-02-01 09:14:31Z jleung $

from beaker.cache import cache_region
from flxadmin.lib.ck12.decorators import ck12_add_nocache
from flxadmin.lib.ck12.errorcodes import ErrorCodes
from flxadmin.lib.ck12.exceptions import ArtifactSaveException, \
    ResourceAssociationException, RemoteAPIStatusException, \
    ArtifactMetadataSaveException
from flxadmin.lib.remoteapi import RemoteAPI
from flxadmin.lib.unicode_util import UnicodeWriter
from flxadmin.model.artifactRevision import ArtifactRevision
from flxadmin.model.ck12model import CK12Model
import urllib
from urllib import quote
import logging
import re
import tempfile
import json


JSON_FIELD_RESPONSE = 'response'
JSON_FIELD_RESULT = 'result'

log = logging.getLogger(__name__)


class Group(CK12Model):
    
    GROUP_TYPE_CLOSED = 'closed'
    
    def __init__(self, dict_obj=None):
        CK12Model.__init__(self, dict_obj)
        
    def __str__(self):
        return '<%s.%s object at %s>' % (self.__class__.__module__, self.__class__.__name__, hex(id(self)))
    
    def is_open(self):
        return False
    
    def is_closed():
        return True
    

class OpenGroup(Group):
    
    def __init__(self, dict_obj):
         Group.__init__(self, dict_obj)
         self['group_type'] = GroupManager.GROUP_TYPE_OPEN
         
    def is_open(self):
        return True
    
    def is_closed(self):
        return False
    
class ClosedGroup(Group):
    
    def __init__(self, dict_obj):
         Group.__init__(self, dict_obj)
         self['group_type'] = GroupManager.GROUP_TYPE_CLOSED
         
    def is_open(self):
        return False
    
    def is_closed(self):
        return True

class GroupManager(object):
    """
    Provides method for fetching the group.
    """
    GROUP_TYPE_OPEN = 'open'
    GROUP_TYPE_CLOSED = 'closed'
    
    GROUP_CLASSES = {
        GROUP_TYPE_OPEN: OpenGroup,
        GROUP_TYPE_CLOSED: ClosedGroup
    }
    
    @staticmethod
    def getGroupByID(id=None):
        """
        retrieve group by id.
        """
        api_endpoint = "group/info"
        
        group_key = 'group'
        
        params = {'groupID': id}
        try:
            data = RemoteAPI.makeGetCall(api_endpoint, params)
        except RemoteAPIStatusException, ex:
            if (ErrorCodes.NO_SUCH_GROUP == ex.status_code):
                return None
            else:
                raise ex
        if data and (JSON_FIELD_RESPONSE in data):
            # Not sure what the logic behind this was.
            '''
            for key in data[JSON_FIELD_RESPONSE]:
                group_key = key
            '''
            if (group_key in data[JSON_FIELD_RESPONSE]):
                if (not data[JSON_FIELD_RESPONSE][group_key]['updateTime']):
                    data[JSON_FIELD_RESPONSE][group_key]['updateTime'] = '-'
                group = GroupManager.toGroup(data[JSON_FIELD_RESPONSE][group_key])
                return group
        else:
            log.error("no group was found in response for %s with params %s" % (api_endpoint, params))
        return None
           
    @staticmethod
    def toGroup(dict_obj=None):
        """
        Used to transform an dict from coreAPI response 
        into an appropriate object.
        """
        groupClass = Group
        '''
        if dict_obj and dict_obj.has_key('groupScope'):
            group_type = dict_obj.get('groupScope')
            if GroupManager.GROUP_CLASSES.has_key(group_type):
                groupClass = GroupManager.GROUP_CLASSES.get(group_type)
            else:
                log.debug("No class is defined for group type %s. Fall back to generic group model." % (group_type))
        '''
        return groupClass(dict_obj)
