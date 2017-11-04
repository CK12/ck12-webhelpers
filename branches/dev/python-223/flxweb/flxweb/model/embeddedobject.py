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
from flxweb.model.resource import Resource
import logging
from flxweb.lib.ck12.exceptions import RemoteAPIStatusException,\
    EmbeddedObjectException


LOG = logging.getLogger(__name__)

class EmbeddedObject(CK12Model):
    '''
    CK-12 EmbeddedObject object.
    '''
    def __init__(self, dict_obj):
        CK12Model.__init__(self, dict_obj)
    
    def get_resource(self):
        resource_obj = self.get('resource')
        if resource_obj:
            return Resource(resource_obj)

        
class EmbeddedObjectManager():
    '''
    EmbeddedObjectManager class provides methods to retrieve and
    manipulate Embedded Objects through the Embedded Objects endpoint
    provided by the coreAPI.
    '''
    @staticmethod
    def get_embedded_object_by_id(eo_id):
        if not id:
            raise EmbeddedObjectException('invalid ID')
        eo = None
        api = 'get/info/embeddedobject/%s' % eo_id
        try:
            api_response = RemoteAPI.makeCall(api)
            eo_data = api_response.get(JSON_FIELD_RESPONSE)
            eo = EmbeddedObject(eo_data)
        except RemoteAPIStatusException, ex:
            LOG.error("Encountered exception while retrieving embedded object")
            raise EmbeddedObjectException( ex.api_message )
        return eo
            
    @staticmethod
    def create_embedded_object(embed_code, authors=None, license_name=None):
        '''
        create embedded objects
        TODO:Externalize messages, validate authors, license
        '''
        if not embed_code:
            raise EmbeddedObjectException("Embed Code not present")
        if not authors: authors = ''
        if not license_name: license_name = ''
        
        
        api = 'create/embeddedobject'
        params_dict = {
            'code':embed_code,
            'authors': authors,
            'license': license_name
        }
        try:
            api_response = RemoteAPI.makeCall(api, params_dict)
        except RemoteAPIStatusException, ex:
            LOG.error("Encountered exception while creating embedded object")
            raise EmbeddedObjectException(ex.api_message)
            
        eo_data = api_response.get(JSON_FIELD_RESPONSE)
        eo = EmbeddedObject(eo_data)
        return eo