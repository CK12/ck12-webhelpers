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
# This file originally written by Girish Vispute
#
# $Id: $

from flxadmin.lib.ck12.errorcodes import ErrorCodes
from flxadmin.lib.remoteapi import RemoteAPI
from flxadmin.lib.ck12.decorators import ck12_cache_region
from flxadmin.lib.ck12.exceptions import RemoteAPIStatusException
import logging

JSON_FIELD_RESPONSE = 'response'
JSON_FIELD_RESULT = 'result'

log = logging.getLogger(__name__)


class LmsManager(object):
    """
    Provides method for fetching the lms providers.
    """
    @staticmethod
    def getLMSProviderAppsByProviderID(providerID):
        """
            retrieve lms provider app for given provider id.
        """
        lms_provider_apps = []
        if not providerID:
            return lms_provider_apps
        lmsProvidersList = LmsManager.getLMSProviders()
        for lmsProvider in lmsProvidersList:
            if lmsProvider['id'] == providerID:
                lms_provider_apps = lmsProvider['apps']
        return lms_provider_apps

    @staticmethod
    def getAllLMSProviders(includeAppInfo=False):
        """
            returns all lms providers.
        """
        lms_providers = []
        if includeAppInfo == True:
            lms_providers =  LmsManager.getLMSProviders()
        else:
            
            lmsProvidersList = LmsManager.getLMSProviders()
            for lmsProvider in lmsProvidersList:
                lms_provider_dict = {}
                lms_provider_dict['id'] = lmsProvider['id']
                lms_provider_dict['name'] = lmsProvider['name']
                lms_provider_dict['description'] = lmsProvider['description']
                lms_providers.append(lms_provider_dict)
        return lms_providers

    @staticmethod
    def getLMSProviderByID(id, includeAppInfo=False):
        """
            retrieve lms provider for given id.
        """
        lms_provider_dict = {}
        if not id:
            return lms_provider_dict
        lmsProvidersList = LmsManager.getLMSProviders()
        for lmsProvider in lmsProvidersList:
            if lmsProvider['id'] == id:
                if includeAppInfo == True:
                    lms_provider_dict = lmsProvider
                else:
                    lms_provider_dict['id'] = lmsProvider['id']
                    lms_provider_dict['name'] = lmsProvider['name']
                    lms_provider_dict['description'] = lmsProvider['description']
                    return lms_provider_dict
        return lms_provider_dict

    @staticmethod
    @ck12_cache_region('daily', invalidation_key='lmsproviders')
    def getLMSProviders():
        """
        retrieve lms providers.
        """
        provider_api_endpoint = "get/lms/provider"

        lms_providers = []
        try:
            data = RemoteAPI.makeGetCall(provider_api_endpoint)
        except RemoteAPIStatusException, ex:
            if (ErrorCodes.NO_SUCH_LMS_PROVIDER == ex.status_code):
                return None
            elif (ErrorCodes.AUTHENTICATION_REQUIRED == ex.status_code):
                return lms_providers
            else:
                raise ex
        except Exception:
            data = None
            pass
        if data and ('response' in data):
            lmsProvidersList = data['response']['providers']
            for lmsProvider in lmsProvidersList:
                lms_provider_dict = {}
                lms_provider_dict['id'] = lmsProvider['id']
                lms_provider_dict['name'] = lmsProvider['name']
                lms_provider_dict['description'] = lmsProvider['description']
                try:
                    provider_app_api_endpoint = '/get/lms/providerapp/%s' %(lmsProvider['id'])
                    provider_apps_data = RemoteAPI.makeGetCall(provider_app_api_endpoint)
                    if provider_apps_data and ('response' in provider_apps_data):
                        lms_provider_dict['apps'] = provider_apps_data['response']['providerApps'] 
                except RemoteAPIStatusException, ex:
                    pass
                lms_providers.append(lms_provider_dict)
        else:
            log.error("no lms providers found in response for %s" % (provider_api_endpoint))
        return lms_providers

    @staticmethod
    def get_lms_provider_app_users(userIDStr=None, providerMemberID = None, filters=None, page_num=None, page_size=None, getTotal=False):
        """
            returns the lms information for the specified userid's
            userIDStr : comma separated string of user ids OR
            providerMemberID : user lms token
            filters : filter results by providerID, appName etc.
        """
        lmsMembersList = []
        try:
            if page_num:
                page_num = int(page_num)
            else:
                page_num = 1

            if not page_size:
                page_size = 10 

            if not userIDStr and not providerMemberID and not filters:
                return lmsMembersList
            params = {}
            params = {'pageNum':page_num, 'pageSize':page_size}
            if userIDStr:
                params['userIDs'] = userIDStr
            if providerMemberID:
                params['providerMemberID'] = providerMemberID
            if filters:
                params['filters'] = filters
            api_endpoint = 'get/lms/providerapp/users'
            data = RemoteAPI.makeGetCall(api_endpoint, params_dict=params)
        except RemoteAPIStatusException, ex:
            if (ErrorCodes.NO_SUCH_LMS_PROVIDER == ex.status_code):
                return lmsMembersList
            else:
                raise ex
        if data and ('response' in data):
            lmsMembersList = data['response']['lmsMembers']
        if getTotal:
            return lmsMembersList, data['response']['total']
        return lmsMembersList
