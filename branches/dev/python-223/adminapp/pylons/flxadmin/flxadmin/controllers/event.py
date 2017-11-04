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
from pylons.decorators import jsonify
from formencode import htmlfill
from webhelpers import paginate

from flxadmin.lib import helpers as h
from flxadmin.lib.decorators import login_required, ajax_login_required
from flxadmin.lib.base import BaseController
from flxadmin.lib.ck12.exceptions import *
from flxadmin.forms.event import *
from flxadmin.forms.options import getviewmode  
import json

import logging
LOG = logging.getLogger( __name__ )


class EventController(BaseController):
    """ for: Events and Notifications
    """
    @ajax_login_required()
    def events_list(self):
        """ Events list data, for ajax calls
        """
        template = '/event/events_list.html'
        params = dict(request.params)
        pageSize = 25
        pageUrl = paginate.PageURL(h.url_('events'), dict(params))
        pageNum = h.modify_page_attrs(params, pageSize)
        result, total = h.page_get('get/info/events', params, 'events')

        c.paginator = paginate.Page(result, pageNum, pageSize, total, 
                       url=pageUrl, presliced_list=True)
        return render(template)

    @login_required()
    def events(self):
        """ Events listing page, client should call events_list() for data
        """
        template = '/event/events.html'
        c.pagetitle = 'Events'
        c.crumbs = h.htmlalist(['home'])
        c.form = EventsForm()
        return render(template)

    @ajax_login_required()
    def notifications_list(self):
        """ Notifications list data, for ajax calls
        """
        template = '/event/notifications_list.html'
        params = dict(request.params)
        pageSize = 25
        pageUrl = paginate.PageURL(h.url_('/notifications'), dict(params))
        pageNum = h.modify_page_attrs(params, pageSize)
        result, total = h.page_get('get/info/notifications', params, 'notifications')

        c.viewmode = request.params.get('viewmode', getviewmode('notifications'))
        c.paginator = paginate.Page(result, pageNum, pageSize, total, 
                       url=pageUrl, presliced_list=True)
        return htmlfill.render(render(template), params)

    @login_required()
    def notifications(self):
        """ Notifications listing page, client should call events_list() for data
        """
        template = '/event/notifications.html'
        c.pagetitle = 'Notifications'
        c.crumbs = h.htmlalist(['home'])
        c.viewmode = request.params.get('viewmode', getviewmode('notifications'))
        c.form = NotificationsForm()
        return render(template)

    @login_required()
    def notification(self, id):
        template = '/event/notification.html'
        c.pagetitle = 'Notification Details'

        prvlink = 'notifications'
        c.crumbs = h.htmlalist(['home', prvlink])
        c.form = NotificationForm()
        c.is_pane = request.params.get('viewmode', '').startswith('pane')
        c.cancel = '' if c.is_pane else h.url_(prvlink)
        c.id = id
        data = h.api('get/info/notification/'+id)

        if request.method == 'GET':
            c.success = h.flash.pop_message()
            return htmlfill.render(render(template), data.get('response'))

        elif request.method == 'POST':
            if not h.validate(request.params, c.form):
                return htmlfill.render(render(template), c.form_result)

            remove = 'lastSent created updated subscriber'.split()
            params = h.remove_attrs(c.form_result, remove)
            params = h.rename_attrs(params, {'rule': 'ruleName'})
            post_data = h.api_post('update/notification', params,
                'Notification Successfully Updated!')
            if not post_data or c.is_pane:
                if c.is_pane and post_data:
                    c.success = h.flash.pop_message()
                return htmlfill.render(render(template), c.form_result)
        return redirect(request.url)

    @login_required()
    def create_notification(self):
        template = '/event/notification.html'
        c.pagetitle = 'Create Notification'

        prvlink = 'notifications'
        c.crumbs = h.htmlalist(['home', prvlink])
        c.cancel = h.url_(prvlink)
        c.form = NewNotificationForm()
        c.create = True

        if request.method == 'GET':
            c.success = h.flash.pop_message()
            return render(template)
        elif request.method == 'POST':
            if not h.validate(request.params, c.form):
                return htmlfill.render(render(template), c.form_result)
            params = h.rename_attrs(c.form_result, {'rule': 'ruleName'})
            if not params.get('impersonateMemberID'):
                params = h.remove_attrs(params, 'impersonateMemberID')
            params['eventType'] = [evnType[1] for evnType in c.form.events if evnType[0] == params['eventType']][0]
            data = h.api_post('create/notification', params, 
                'Notification Successfully Created!')
            if not data:
                return htmlfill.render(render(template), c.form_result)
            id = h.traverse(data, ['response', 'id'])
            return redirect(h.url_('/notification/'+str(id)))

    @login_required()
    def create_maintenance_notification(self):
        template = '/event/maintenance_notification.html'
        c.pagetitle = 'System Maintenance Notifications'

        prvlink = 'notifications'
        c.crumbs = h.htmlalist(['home', prvlink])
        c.cancel = h.url_(prvlink)
        c.create = True
        c.invalidateCache = False

        if request.method == 'GET':
            c.form = MaintenanceNotificationForm()
            return render(template)

        elif request.method == 'POST':
            params = {}
            params = request.params
            response = h.api_post('update/maintenance/notification', params, 
                'Notification Successfully Created!')
            return json.dumps(response['response'])

    @ajax_login_required()
    def maintenance_notifications_list(self):
        """ Notifications list data, for ajax calls
        """
        template = '/event/maintenance_notifications_list.html'
        c.notifications = []
        #params are to get latest configuration from xml instead of cached data
        params = {'nocache':'true', 'key':'maintenancenotification'} 
        data = h.api('get/maintenance/notification', params=params)
        c.notifications = data['response']
        return render(template)


    # raw json renderers, for url type-ins, not called in app
    @login_required()
    @jsonify
    def events_raw(self):
        return h.api_raw('get/info/events',
            {'pageSize':25, 'sort':'created,desc'})

    @login_required()
    @jsonify
    def notifications_raw(self):
        return h.api_raw('get/info/notifications',
            {'pageSize':25, 'sort':'updated,desc'})

    @login_required()
    @jsonify
    def notification_raw(self, id):
        return h.api_raw('get/info/notification/'+id)
