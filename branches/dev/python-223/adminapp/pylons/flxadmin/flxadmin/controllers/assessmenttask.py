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
from formencode import htmlfill
from webhelpers import paginate

from flxadmin.lib import helpers as h
from flxadmin.lib.decorators import login_required, ajax_login_required
from flxadmin.lib.base import BaseController
from flxadmin.lib.ck12.exceptions import *
from flxadmin.forms.assessmenttask import TasksForm, TaskForm
from flxadmin.forms.options import getviewmode

import logging
LOG = logging.getLogger( __name__ )


class AssessmenttaskController(BaseController):
    """ for: Task listing, details
    """
    
    @ajax_login_required()
    def tasks_list(self):
        """ Tasks list data, for ajax calls
        """
        template = '/assessment/tasks_list.html'
        params = dict(request.params)
        LOG.info("Request params: %s" % params)

        pageSize = 25
        params_dict = {}
        pageUrl = paginate.PageURL(h.url_('/assessment/tasks'), dict(params))
        pageNum = h.modify_page_attrs(params, pageSize)
        params_dict['pageNum'] = params['pageNum']
        params_dict['pageSize'] = params['pageSize']
        if params and params['filters']: 
            params_dict['filters'] = params['filters']

        result, total = h.page_get('assessment/api/get/info/tasks',params_dict, 'tasks')

        c.viewmode = request.params.get('viewmode', getviewmode('tasks'))
        c.paginator = paginate.Page(result, pageNum, pageSize, total, 
                       url=pageUrl, presliced_list=True)
        return render(template)

    @login_required()
    def tasks(self):
        """ Task listing page, client should call tasks_list() for data
        """
        template = '/assessment/tasks.html'
        c.pagetitle = 'Assessment Tasks'
        c.crumbs = h.htmlalist(['home'])
        c.viewmode = request.params.get('viewmode', getviewmode('tasks'))
        c.form = TasksForm()
        return render(template)

    @login_required()
    def task(self, id=None):
        """ Task Details
        """
        template = '/assessment/task.html'
        c.pagetitle = 'Assessment Task Details'
        prvlink = 'tasks'
        if request.referer and 'tasks' in request.referer:
            prvlink = (request.referer, 'Tasks')
        c.crumbs = h.htmlalist(['home', prvlink])
        c.is_pane = request.params.get('viewmode', '').startswith('pane')
        c.form = TaskForm()

        data = h.api('/assessment/api/get/status/task/'+id)
        c.task = h.traverse(data, ['response', 'task'])

        c.taskID = c.task.get('taskID')
        return htmlfill.render(render(template), c.task)
