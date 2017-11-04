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
from pylons.decorators import jsonify
from formencode import htmlfill
from webhelpers import paginate

from flxadmin.lib import helpers as h
from flxadmin.lib.decorators import login_required, ajax_login_required
from flxadmin.lib.base import BaseController
from flxadmin.lib.ck12.exceptions import *
from flxadmin.forms.task import TasksForm, TaskForm
from flxadmin.forms.options import getviewmode

import logging
LOG = logging.getLogger( __name__ )


class TaskController(BaseController):
    """ for: Task listing, details
    """
    
    @ajax_login_required()
    def tasks_list(self):
        """ Tasks list data, for ajax calls
        """
        template = '/task/tasks_list.html'
        params = dict(request.params)

        if h.int_in_search(params, 'get/status/task/'):
            return htmlfill.render(render(template), params)

        pageSize = 25
        pageUrl = paginate.PageURL(h.url_('tasks'), dict(params))
        pageNum = h.modify_page_attrs(params, pageSize)
        result, total = h.page_get('get/info/tasks', params, 'tasks')

        c.viewmode = request.params.get('viewmode', getviewmode('tasks'))
        c.paginator = paginate.Page(result, pageNum, pageSize, total, 
                       url=pageUrl, presliced_list=True)
        return render(template)

    @login_required()
    def tasks(self):
        """ Task listing page, client should call tasks_list() for data
        """
        template = '/task/tasks.html'
        c.pagetitle = 'Tasks'
        c.crumbs = h.htmlalist(['home'])
        c.viewmode = request.params.get('viewmode', getviewmode('tasks'))
        c.form = TasksForm()
        return render(template)

    @login_required()
    def task(self, id=None):
        """ Task Details
        """
        template = '/task/task.html'
        c.pagetitle = 'Task Details'
        prvlink = 'tasks'
        if request.referer and 'tasks' in request.referer:
            prvlink = (request.referer, 'Tasks')
        c.crumbs = h.htmlalist(['home', prvlink])
        c.is_pane = request.params.get('viewmode', '').startswith('pane')
        c.form = TaskForm()

        data = h.api('get/status/task/%s' % id)
        c.task = data.get('response', {}) if data else {}
        c.owner = c.task.get('owner')
        c.id = id
        return htmlfill.render(render(template), c.task)

    @login_required()
    def reindex(self, id=None):
        """ Re-Index Artifact or Global Re-Index All page
        """
        template = '/task/reindex.html'
        c.pagetitle = 'Global Re-Index'
        prvlink = 'artifacts'
        if request.referer and 'artifact/' in request.referer:
            prvlink = (request.referer, 'Artifact')
        c.crumbs = h.htmlalist(['home', prvlink])

        if id:
            c.pagetitle = 'Re-Index'
            c.id = id
            data = h.api('/get/info/'+id)
            c.artifact = h.traverse(data, ['response', 'artifact'])
        return render(template)


    # raw json renderers, for url type-in use, not called in app:
    @login_required()
    @jsonify
    def tasks_raw(self):
        return h.api_raw('get/info/tasks', {'pageSize':25})

    @login_required()
    @jsonify
    def task_raw(self, id=None):
        return h.api_raw('get/status/task/%s' % id)
