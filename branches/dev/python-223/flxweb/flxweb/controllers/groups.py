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
# This file originally written by Ravi Gidwani
#
# $Id: dashboard.py 19212 2012-05-30 00:25:49Z ravi $

from pylons import url,config,request,response, tmpl_context as c
from flxweb.lib.base import BaseController
from pylons.controllers.util import redirect
from flxweb.lib.ck12.decorators import login_required
from pylons.templating import render_jinja2
from flxweb.lib.pagination import *
from flxweb.model.library import *
from flxweb.model.session import SessionManager
from flxweb.model.group import GroupManager,MEMBER_ROLES
from flxweb.lib.ck12.json_response import JSONResponse
import logging,cgi
try: 
    import simplejson as json
except ImportError: 
    import json

log = logging.getLogger(__name__)


class GroupsController(BaseController):

    @login_required()
    def dashboard(self):
        """
        Default Groups page
        """
        return render_jinja2 ('/groups/groups.html')

    def create_group(self):
        """
        Create a group
        """
        group_name = request.params.get('groupName')
        group_desc = request.params.get('groupDesc')
        group_type = request.params.get('groupType')

        group = GroupManager.create_group(group_name, group_desc, group_type)
        if group:
            if group.has_key('error') and group['error'] == 'DUPLICATE':
                group['message'] = 'group_exists'
            else:
                if group.has_key('roleID'):
                    group['group']['role'] = MEMBER_ROLES[group['group']['roleID']]
                    group['group'].__delitem__('roleID')
                else:
                    group['group']['role'] = 'Group Admin'
        return json.dumps(group)

    def del_groupmember(self):
        """
        Delete a group member
        """
        member_id = request.params.get('memberID')
        if member_id == "self":
            user = SessionManager.getCurrentUser()
            member_id = user['id']
        group_id = request.params.get('groupID')
        group = GroupManager.del_groupmember(group_id, member_id)
        return json.dumps(group)
       
    def get_my_groups(self): 
        """
        Returns all the groups.
        """
        groups = GroupManager.get_my_groups()
        updated_groups = []
        if groups:
            groups = groups.get('groups', [])
            updated_groups = []
            for each_group in groups:
                each_group['role'] = MEMBER_ROLES[each_group['roleID']]
                each_group.__delitem__('roleID')
                updated_groups.append(each_group)
        return json.dumps(updated_groups)

    def get_owned_groups(self):
        """
        Returns only the owned groups.
        """
        groups = GroupManager.get_my_groups()
        updated_groups = []
        if groups:
            groups = groups.get('groups', [])
            updated_groups = []
            for each_group in groups:
                if each_group['roleID'] == 14:
                    continue
                each_group['role'] = MEMBER_ROLES[each_group['roleID']]
                each_group.__delitem__('roleID')
                updated_groups.append(each_group)
        return json.dumps(updated_groups)
    
    def get_group_details(self): 
        """
        Returns group details.
        """
        group_id = request.params.get('groupID')
        group = GroupManager.get_group_details(group_id)
        group_members = []
        if group:
            group = group.get('group',{})
            group_members = group.get('members',[])
        else:
            group = {}
        '''
        updated_group_members = []
        for each_member in group_members:
            each_member['role'] = MEMBER_ROLES[each_member['roleID']]
            each_member.__delitem__('roleID')
            updated_group_members.append(each_member)
        group['members'] = updated_group_members
        '''
        return json.dumps(group)
    
    def get_group_info(self): 
        """
        Returns group info.
        """
        group_id = request.params.get('groupID', None)
        group_name = request.params.get('groupName', None)
        access_code = request.params.get('accessCode', None)
        group_handle = request.params.get('groupHandle', None)

        kwargs = {}
        if group_id:
            kwargs['groupID'] = group_id
        elif group_handle:
            kwargs['groupHandle'] = group_handle
        elif group_name and access_code:
            kwargs['groupName'] = group_name
            kwargs['accessCode'] = access_code
        else:
            group = {}
            group['message'] = 'params_missing'
            return json.dumps(group)

        group = GroupManager.get_group_info(**kwargs)
        if not group:
            group = {}
            group['message'] = 'no_such_group'
        return json.dumps(group)
    
    def update_group(self):
        """
        Update a group
        """
        kwargs = {}
        kwargs['groupName'] = request.params.get('groupName')
        kwargs['groupID'] = request.params.get('groupID')
        kwargs['newGroupName'] = request.params.get('newGroupName')
        kwargs['newGroupDesc'] = request.params.get('newGroupDesc')
        kwargs['groupScope'] = request.params.get('groupScope', 'closed')
        kwargs['groupType'] = request.params.get('groupType', 'study')
        res = GroupManager.update_group(**kwargs)
        if res and res.has_key('error') and res['error'] == 'DUPLICATE':
            group = {}
            group['message'] = 'group_exists'
        else:
            group = res
        return json.dumps(group)
    
    def delete_group(self):
        """
        Delete a group
        """
        kwargs = {}
        kwargs['groupID'] = request.params.get('groupID',None)
        if not kwargs['groupID']:
            del kwargs['groupID']
        kwargs['groupName'] = request.params.get('groupName')
        group = GroupManager.delete_group(**kwargs)
        return json.dumps(group)
    
    def share_to_groups(self):
        """
        Share to group(s)
        """
        group_ids = request.params.get('group_ids')
        object_id = request.params.get('object_id')
        object_url = request.params.get('object_url')
        group_ids = group_ids.split(',')
        result = {}
        for group_id in group_ids:
            if group_id:
                group = GroupManager.share_to_group(group_id, object_id, object_url)
                result[group_id] = group
        return json.dumps(result)
    
    def get_search_page_size(self):
        return config.get( 'search_page_size' )

    @login_required()
    def search_groups(self, search_term=''):
        """
        Search Public Groups
        """
        query = request.params.get('q')
        if (not search_term or search_term == '') and query:
            search_term = query
        # get the page number
        page_number = request.GET.get('pageNum')
        if not page_number:
            page_number = 1
        else:
            page_number = int(page_number)
        page_size = self.get_search_page_size() 
        try:
            search_term = cgi.escape(search_term, True)
        except Exception, e:
            log.error("Exception : Group search_term = %s" % str(e))
        groups = GroupManager.get_my_groups()
        updated_groups = []
        if groups:
            groups = groups.get('groups', [])
            updated_groups = []
            for each_group in groups:
                each_group['role'] = MEMBER_ROLES[each_group['roleID']]  
                each_group.__delitem__('roleID')
                updated_groups.append(each_group)   
        pageable = PageableWrapper(partial(GroupManager.search_groups,
                                           search_term=search_term,
                                           return_total_count=True))
        c.group_search_paginator = Paginator(pageable,page_number,page_size)
        c.group_search_term = search_term
        c.my_groups = updated_groups
        return render_jinja2 ('/groups/groups_results_list.html')
    
    @login_required()
    def newgroups(self):
        return render_jinja2('/groups/new/groups.html')

    @login_required()
    def mygroups(self):
     	if not c.user.isTeacher():
            return render_jinja2('/groups/new/mygroups.html')
        return redirect("/my/dashboard-new/groups?scroll=true")

    @login_required()
    def group_home(self, rest):
        c.rest = rest
        return render_jinja2('/groups/new/group_home.html')
    
    @login_required()
    def group_assignments(self):
        return render_jinja2('/groups/new/group_assignments.html')

    @login_required()
    def group_members(self):
        return render_jinja2('/groups/new/group_members.html')
    
    @login_required()
    def group_resources(self):
        return render_jinja2('/groups/new/group_resources.html')

    @login_required()
    def group_discussions(self, rest):
        c.rest = rest
        c.peerhelp_base_url = config.get('peerhelp_base_url')
        return render_jinja2('/groups/new/group_discussions.html')

    @login_required()
    def group_settings(self):
        return render_jinja2('/groups/new/group_settings.html')
    
    @login_required()
    def group_reports(self):
        return render_jinja2('/groups/new/group_reports.html')

    @login_required()
    def join_group(self):
        return render_jinja2('/groups/new/join_group.html')

    @login_required()
    def forums_authenticated(self):
        return self.forums()

    def forums(self):
        c.peerhelp_base_url = config.get('peerhelp_base_url')
        c.page_name = 'forums'
        return render_jinja2('/forums/forums.html')
