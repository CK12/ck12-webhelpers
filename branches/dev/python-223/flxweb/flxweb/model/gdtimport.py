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
from flxweb.lib.ck12.exceptions import RemoteAPIStatusException, \
    GDTImportAuthException, GDTInfoException, GDTImportException
from flxweb.lib.remoteapi import RemoteAPI
from pylons import session
import logging

log = logging.getLogger(__name__)


'''
GDT Import 
'''

class GDTImporter():
    
    @staticmethod
    def is_authorised_for_gdocs():
        try:
            status = RemoteAPI.makeGetCall('get/status/google/auth')
            if status and 'response' in status:
                return status['response']['googleDocAuthenticated']
        except RemoteAPIStatusException:
            return False
    
    @staticmethod
    def get_flx2_cookie():
        try:
            status = RemoteAPI.makeGetCall('get/cookie/my')
            return status
        except RemoteAPIStatusException:
            raise GDTImportAuthException()
    
    @staticmethod
    def getGoogleAuthURL():
        """
        Get the Google autherization URL.
        """
        try:
            status = RemoteAPI.makeGetCall('get/authURL/google')
            if status and 'response' in status:
                return status['response']['googleAuthURL']
        except RemoteAPIStatusException:
            raise GDTInfoException
    
    '''
    GDTImporter.get_gdoc_list
    used to get the list of google documents or folders.
    @param page_num: page number
    @param page_size: maximum number of items per page
    @param return_total_count: set to True to return tuple of total_count, documents
    @param list_folders: when set to True, queries for google folders list instead of googld documents list.  
    '''
    @staticmethod
    def get_gdoc_list(page_num=None, page_size=None,
                      return_total_count=False, list_folders=False):
        if page_num:
            page_num = int(page_num)
        else:
            page_num = 1

        if not page_size:
            page_size = 10 
        params = {'pageNum':page_num, 'pageSize':page_size}
        results_key = 'documents'

        api = 'get/documents/google'
        if list_folders:
            api = 'get/folders/google'
            results_key = 'folders'
            
        try:
            results = RemoteAPI.makeGetCall(api, params)
            log.debug("GDT RESPONSE: %s" %results)
            if results and 'response' in results and results_key in results['response']:
                results = results['response']
                documents = results[results_key]

        except RemoteAPIStatusException:
            raise GDTInfoException

        if return_total_count:
            if 'total' in results:
                total_count = results['total']
            else:
                total_count = 0
            return total_count,documents
        else:
            return documents 

