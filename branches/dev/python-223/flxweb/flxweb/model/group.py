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
# This file originally written by Deepak Babu
#
# $ID$

from flxweb.lib.remoteapi import RemoteAPI
from flxweb.model.artifact import Artifact, ArtifactManager
from flxweb.model.ck12model import CK12Model
import logging
import re
from flxweb.model.browseTerm import BrowseManager
from flxweb.lib.helpers import url

log = logging.getLogger(__name__)

MEMBER_ROLES = {}
MEMBER_ROLES[14] = 'Group Member'
MEMBER_ROLES[15] = 'Group Admin'

class GroupManager():
    '''
    GroupManager
    defines settings for Groups,
    provides static methods to query and manipulate group objects
    '''
    ''' Disable this interface since groups will be unique per user and not system wide '''
    '''
    @staticmethod
    def get_group_by_name(group_name):
        group_info = None
        try:
            if not group_name:
                raise Exception('No Group name specified')
            api_endpoint = 'group/info'
            params_dict = {'groupName':group_name}
            data = RemoteAPI.makeGetCall(api_endpoint, params_dict)
            if 'response' in data:
                group_info = data['response']
        except Exception, e:
            log.debug("Could not retrieve info for Group name: %s" % group_name)
            log.exception(e)
        return group_info
    '''

    @staticmethod
    def get_group_by_code(access_code):
        group_info = None
        try:
            api_endpoint = 'group/info'
            params_dict = {'accessCode':access_code}
            data = RemoteAPI.makeGetCall(api_endpoint, params_dict)
            if 'response' in data:
                group_info = data['response']
        except Exception, e:
            log.debug("Could not retrieve info for Group with access code: %s" % access_code)
            log.exception(e)
        return group_info

    @staticmethod
    def create_group(group_name, group_desc, group_type='study'):
        group_info = None
        try:
            if not group_name:
                raise Exception('No Group name specified') 
            api_endpoint = 'create/group'
            params_dict = {}
            params_dict['groupName'] = group_name
            params_dict['groupDescription'] = group_desc
            #params_dict['groupType'] = group_type
            data = RemoteAPI.makeGetCall(api_endpoint, params_dict) 
            log.info('RESPONSE: %s' % data)
            if 'response' in data:
                group_info = data['response']
        except Exception, e:
            log.debug("Could not create Group: %s" % group_name)
            log.exception(e)
            # TODO: Handle this better
            if hasattr(e, 'status_code') and e.status_code == 5010:
                group_info = {'error': 'DUPLICATE', 'group': {}}
        return group_info

    @staticmethod
    def join_group_by_code(group_name, access_code):
        group_info = None
        try:
            api_endpoint = 'group/add/member'
            params_dict = {}
            params_dict['groupName'] = group_name
            params_dict['accessCode'] = access_code
            data = RemoteAPI.makeGetCall(api_endpoint, params_dict) 
            if 'response' in data:
                group_info = data['response']
        except Exception, e:
            log.debug("Could not join Group: %s" % group_name)
            log.exception(e)
            # TODO: use the errorCodes
            if hasattr(e, 'status_code') and e.status_code == 5004:
                group_info = {'error': 'no_such_group', 'message':e.__str__()}
            else:
                group_info = {'message':e.__str__()}
            log.info('%s'%group_info)
        return group_info
    
    @staticmethod
    def del_groupmember(group_id, member_id):
        group_info = None
        try:
            if not group_id:
                raise Exception('No Group id specified') 
            api_endpoint = 'group/delete/member'
            params_dict = {}
            params_dict['groupID'] = group_id
            params_dict['memberID'] = member_id
            data = RemoteAPI.makeGetCall(api_endpoint, params_dict) 
            log.info('RESPONSE: %s' % data)
            if 'response' in data:
                group_info = data['response']
        except Exception, e:
            log.debug("Could not delete group member ID: %s from the group %s" % (member_id,group_id))
            log.exception(e)
        return group_info
    
    @staticmethod
    def get_my_groups():
        group_info = None
        try:
            api_endpoint = 'group/my'
            params = { 'pageSize':50, 'sort':'d_creationTime'}
            data = RemoteAPI.makeGetCall(api_endpoint,params)
            if 'response' in data:
                group_info = data['response']
        except Exception, e:
            log.debug("Could not retrieve Groups")
            log.exception(e)
        return group_info

    @staticmethod
    def get_group_info(**kwargs):
        group_details = None
        try:
            api_endpoint = 'group/info'
            data = RemoteAPI.makeGetCall(api_endpoint, kwargs)
            if 'response' in data:
                group_details = data['response']
        except Exception, e:
            log.debug("Could not retrieve Group details")
            log.exception(e)
        return group_details

    @staticmethod
    def get_group_details(group_id):
        group_details = None
        try:
            api_endpoint = 'group/details'
            params_dict = {}
            params_dict['groupID'] = group_id
            data = RemoteAPI.makeGetCall(api_endpoint, params_dict)
            if 'response' in data:
                group_details = data['response']
        except Exception, e:
            log.debug("Could not retrieve Group details")
            log.exception(e)
        return group_details

    @staticmethod
    def update_group(**kwargs):
        group_info = None
        try:
            if not kwargs['groupID']:
                raise Exception('No group ID specified') 
            api_endpoint = 'update/group'
            data = RemoteAPI.makeGetCall(api_endpoint, kwargs) 
            log.info('RESPONSE: %s' % data)
            if 'response' in data:
                group_info = data['response']
        except Exception, e:
            log.debug("Could not update Group: %s" % kwargs['groupName'])
            log.exception(e)
            if hasattr(e, 'status_code') and e.status_code == 5010:
                group_info = {'error': 'DUPLICATE', 'group': {}}
        return group_info

    @staticmethod
    def delete_group(**kwargs):
        group_info = None
        try:
            if not kwargs['groupName']:
                raise Exception('No Group name specified') 
            api_endpoint = 'delete/group'
            data = RemoteAPI.makeGetCall(api_endpoint, kwargs) 
            log.info('RESPONSE: %s' % data)
            if 'response' in data:
                group_info = data['response']
        except Exception, e:
            log.debug("Could not delete Group: %s" % kwargs['groupName'])
            log.exception(e)
        return group_info


    @staticmethod
    def share_to_group(group_id, object_id, object_url):
        group_info = None
        try:
            if not group_id:
                raise Exception('No Group name specified') 
            if not object_id:
                raise Exception('No Object id specified')
            if not object_url:
                raise Exception('No URL specified')
            api_endpoint = 'group/share'
            params_dict = {}
            params_dict['groupID'] = group_id
            params_dict['objectID'] = object_id
            params_dict['url'] = object_url
            data = RemoteAPI.makeGetCall(api_endpoint, params_dict) 
            log.info('RESPONSE: %s' % data)
            if 'response' in data:
                group_info = data['response']
        except Exception, e:
            log.debug("Could not share object: %s to Group: %s" % (object_id, group_id))
            log.exception(e)
        return group_info

    @staticmethod
    def search_groups( search_term=None, page_num=None,page_size=None, return_total_count=False):

        try:
            if page_num:
                page_num = int( page_num )
            else:
                page_num = 1

            if not page_size:
                page_size = 10

            group_search_api_url = 'search/group/%s' % (search_term)
            params = {'pageNum':page_num, 'pageSize':page_size}
            results_key = 'groups'
            data = RemoteAPI.makeGetCall(group_search_api_url, params)
            group_list = []
            if 'response' in data and \
               results_key in data['response'] and \
               'result' in data['response'][results_key] :
                    data = data['response'][results_key]
                    groups_list = data['result']
        except Exception, e:
            log.exception( e )
            groups_list = []

        if return_total_count:
            if 'total' in data:
                total_count = data['total']
            else:
                total_count = 0
            return total_count, groups_list
        else:
            return groups_list
