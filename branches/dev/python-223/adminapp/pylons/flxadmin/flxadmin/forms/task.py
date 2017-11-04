#
# Copyright 2011-201x CK-12 Foundation
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
# This file originally written by John Leung
# $Id:$

import formencode
from flxadmin.lib import helpers as h
from flxadmin.forms import options


class TasksForm(formencode.Schema):
    """ Tasks listing Form
    Supported filters: id, status, taskID, name, ownerID, login, email
    """
    name_sel = [('name,'+name, name) for name in options.tasks]
    name_sel.insert(0, ('name,', 'All'))

    status_sel = [('status,'+s, s) for s in options.statuses]
    status_sel.insert(0, ('status,', 'All'))

    refresh_sel = options.refresh_rate_choices

    listhead = [ h.htmldiv(*vals) for vals in [
     ('Id', 'id', 'sortable'), 
     ('Name', 'name', 'sortable'),
     ('Status', 'status', 'sortable'),
     ('Result', 'result'),
     ('User Data', 'userdata'),
     ('Started', 'started', 'sortable'),
     ('Updated', 'updated', 'sortable'),
    ]]
    listhead_short = [ h.htmldiv(*vals) for vals in [
     ('Name', 'name', 'sortable'),
     ('Status', 'status', 'sortable'),
     ('Result, User Data', 'result'),
     ('Updated', 'updated', 'sortable'),
    ]]

class TaskForm(formencode.Schema):
    css = 'info long'
    ordered_fields = [ h.labelreadonly(*vals) for vals in [
     ('Name', 'name', css),
     ('Id', 'id', css), 
     ('Task Id', 'taskID', css), 
     ('Started', 'started', css),
    ]] 
