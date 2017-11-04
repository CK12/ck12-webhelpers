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

from pylons import request, tmpl_context as c
from pylons.templating import render_jinja2 as render
from pylons.controllers.util import redirect
from formencode import htmlfill
from webhelpers import paginate
import json

from flxadmin.lib import helpers as h
from flxadmin.lib.decorators import login_required, ajax_login_required
from flxadmin.lib.base import BaseController
from flxadmin.lib.ck12.exceptions import *
from flxadmin.forms.groups import *
from flxadmin.forms.options import getviewmode
from flxadmin.lib.remoteapi import RemoteAPI

import logging
log = logging.getLogger( __name__ )

PEERHELP_CLIENT_ID = 24839961

class GroupsController(BaseController):
    """
    for: Groups, listing, details, members.
    """
    
    @ajax_login_required()
    def groups_list(self):
        """
        groups list data for ajax calls.
        """
        template = '/groups/groups_list.html'
        params = dict(request.params)
        params['groupName'] = request.params.get('searchAll') or ''
        params['isHidden'] = request.params.get('isHidden') or 1
        fieldsrch = params['search'].split(',')[1] if params.get('search') else False
        pageUrlKey = 'groups'
        pageSize = 25
        pageUrl = paginate.PageURL(h.url_('groups'), dict(params))
        pageNum = h.modify_page_attrs(params, pageSize)
        if not fieldsrch and h.int_in_search(params, 'flx/group/info/', 'group',\
                                             altSearchPath='/flx/groups/all', pageSize=25, altSearchKey='group', pageNum=pageNum, pageUrlKey=pageUrlKey):
            return render(template)

        result, total = h.page_get('/flx/groups/all', params, 'group')

        c.viewmode = request.params.get('viewmode', getviewmode('groups'))
        c.paginator = paginate.Page(result, pageNum, pageSize, total,
                       url=pageUrl, presliced_list=True)
        return render(template)
   
    @ajax_login_required()
    def members_list(self, id=None):
        """
        members list data for ajax calls.
        """
        template = "/groups/members_list.html"
        params = dict(request.params)
        params['groupID'] = id or ''
        params['allowSuperAdmin'] = True
        pageSize = 1000
        pageUrl = paginate.PageURL(h.url_('.'), dict(params))
        pageNum = h.modify_page_attrs(params, pageSize)
        members, total = h.page_get('/flx/group/members', params, 'members')

        c.paginator = paginate.Page(members, pageNum, pageSize, total, 
                       url=pageUrl, presliced_list=True)
        c.groupId = id
        return render(template)
    
    @login_required()
    def groups(self):
        """
        Groups List page.
        """
        template = '/groups/groups.html'
        c.pagetitle = "Groups"
        c.crumbs = h.htmlalist(['home'])
        c.viewmode = request.params.get('viewmode', getviewmode('groups'))
        c.form = GroupsForm()
        return render(template)
    
    @login_required()
    def group(self, id=None):
        """
        group details
        """
        template = '/groups/group.html'
        c.pagetitle = 'Group Details'
        prvlink = 'groups'
        c.form = GroupForm()
        c.is_pane = request.params.get('viewmode', '').startswith('pane')
        c.cancel = '' if c.is_pane else h.url_(prvlink)
        
        c.group = h.get_group(id)
        try:
            if c.group:
                api_endpoint = 'get/my/group/assignments/%s' % (id)
                params = {}
                params['sort'] = 'due,asc'
                params['pageSize'] = 1000
                params['impersonateMemberID'] = c.group['creator']['id']
                data = RemoteAPI.makeGetCall(api_endpoint, params_dict=params)
                c.groupAssignments = data['response']['assignments']
        except RemoteAPIStatusException, ex:
            pass
        if c.group:
            return htmlfill.render(render(template), c.group)
        
        return render(template)

    @login_required()
    def quiz_report(self):
        c.pagetitle = 'Group Quiz Report'
        c.form = GroupQuizReportForm()
        template ='/groups/quiz_report.html'
        c.result = ''

        if request.method == 'POST':
            c.groupID = str(request.params.get('groupID'))
            c.quizID = str(request.params.get('quizID'))
            ids = ""
            if c.groupID == "":
                ids = 'Group ID'
            if c.quizID == "":
                ids = "%s," % (ids) if not ids == "" else ""
                ids = '%s Quiz ID' % (ids)
            if not ids == '':
                h.set_error('Please enter %s to generate report.' % ids)
                return render(template)
            c.format = request.params.get('format')
            params ={}
            params['aggregate'] = request.params.get('aggregate')

            report_url = '/hwp/get/info/group/quizresult/%s/%s/%s' %(c.groupID, c.quizID, c.format)
            result, length = h.page_get(report_url, params, 'result' )
            c.result = result


        return render(template)
        
    @ajax_login_required()
    def peerhelp_posts_list(self):
        """
        posts list data for ajax calls.
        """
        template = '/groups/posts_list.html'
        params = dict(request.params)
        pageSize = 15
        pageUrl = paginate.PageURL(h.url_('posts'), params)
        pageNum = h.modify_page_attrs(params, pageSize)
        params['clientID'] = PEERHELP_CLIENT_ID
        params['include_author_only'] = True
        if not params.has_key('filters') or not params['filters']: 
            params['filters'] = {'includeHidden': True}
            params['filters'].update({'postType':'all'})
        else:
            new_filters = {'includeHidden': True}
            for each_filter in params['filters'].split(';'):
                fld, val = each_filter.split(',')
                if fld == 'groupType':
                    val = ['%s=%s' % (fld, val.upper()), '%s=%s' % (fld, val.lower())]
                    fld = 'systemTags'
                new_filters[fld] = val
            if 'postType' not in new_filters:
                new_filters['postType'] = 'all'
            params['filters'] = new_filters

        if params.has_key('search') and params['search']:
            new_filters = {}
            for each_search in params['search'].split(';'):
                fld, val = each_search.split(',')
                if fld == 'groupIDs':
                    val = [int(val)]
                new_filters[fld] = val
            params['filters'].update(new_filters)
        params['filters'] = json.dumps(params['filters'])
        if params.has_key('sort') and params['sort']:
            try:
                fld, ord = params['sort'].split(',')
                params['sort'] = "%s_%s" % ('d' if ord == 'desc' else 'a', fld)
            except:
                pass
        log.debug("Peerhelp_posts_list PARAMS :: %s"%params)
        result, total = h.page_get('peerhelp/api/get/posts', params, 'posts')
        c.viewmode = request.params.get('viewmode', getviewmode('posts'))
        c.paginator = paginate.Page(result, pageNum, pageSize, total, 
                       url=pageUrl, presliced_list=True)
        return render(template)
   
    @login_required()
    def peerhelp_posts(self):
        """
        Q&A Posts List page.
        """
        template = '/groups/posts.html'
        c.pagetitle = "Q&A Posts"
        c.crumbs = h.htmlalist(['home'])
        c.viewmode = request.params.get('viewmode', getviewmode('posts'))
        c.form = PostsForm()
        return render(template)

    @ajax_login_required()
    def forums_list(self):
        """
        forums list data for ajax calls.
        """
        template = '/groups/forums_list.html'
        params = dict(request.params)
        params['groupName'] = request.params.get('searchAll') or ''
        pageSize = 1000
        pageUrl = paginate.PageURL(h.url_('groups'), dict(params))
        pageNum = h.modify_page_attrs(params, pageSize)

        result, total = h.page_get('/flx/groups/all', params, 'group')
        forums_seq, seq_total = h.page_get('/flx/get/forums/sequence', {}, 'forums_sequence')
        seq = {}
        for each_seq in forums_seq:
            seq[each_seq.get('forum_id')] = each_seq.get('sequence')
        result = sorted(result, key=lambda forum_dict: seq.get(forum_dict['id'], 9999))
        c.viewmode = request.params.get('viewmode', getviewmode('forums'))
        c.paginator = paginate.Page(result, pageNum, pageSize, total,
                       url=pageUrl, presliced_list=True)
        return render(template)

    @login_required()
    def forums_sequence(self):
        """
        Public Forums Sequence List Page.
        """
        template = '/groups/forums_sequence.html'
        c.pagetitle = "Forums Sort Sequence"
        c.crumbs = h.htmlalist(['home'])
        c.viewmode = request.params.get('viewmode', getviewmode('forums'))
        c.form = ForumsSequenceForm()

        if request.method == 'GET':
            return render(template)
