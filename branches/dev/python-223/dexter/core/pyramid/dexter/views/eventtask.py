from pyramid.view import view_config
from pyramid.renderers import render_to_response

from dexter.lib import helpers as h
from dexter.lib.remoteapi import RemoteAPI
from dexter.views.decorators import jsonify, paginate
from dexter.models import eventtask
from dexter.models.auth.user import UserManager as um
from dexter.views.errorCodes import ErrorCodes
from dexter.views.common import AssessCommon as common
from dexter.views.base import BaseView
#from dexter.lib.remoteapi import RemoteAPI as remotecall

import logging
log = logging.getLogger(__name__)

class EventTaskView(BaseView):
    def __init__(self, context, request):
        BaseView.__init__(self, context, request)
        self.working_dir = '/tmp/dexter'
        self.config = h.load_config()

    """
        Event task related APIs

    """

    @view_config(route_name='register_event_task')
    @jsonify
    @h.trace
    def register_event_task(self):
        try:
            request = self.request
            result = common.getResponseTemplate(ErrorCodes.OK, 0)
            kwargs = {}
            #member = u.getCurrentUser(self.request, anonymousOkay=False)
            #if not member:
            #    return ErrorCodes().asDict(ErrorCodes.AUTHENTICATION_REQUIRED, 'User not logged in')
            params = request.GET
            log.info('params: %s' %(params))
            h.trimParameters(params)
            log.info('trimmed params: %s' %(params))
            kwargs = params
            #Register the event_task 
            event_task = eventtask.EventTask(request.db).register(**kwargs)
            result['response']['event_task'] = eventtask.EventTask(request.db).asDict(event_task)

            return result
        except Exception,e:
            if not hasattr(self.c,'errorCode'):
                self.c.errorCode = ErrorCodes.CANNOT_REGISTER_EVENTTASK
            log.error('register_event_task: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(self.c.errorCode, str(e))

    '''
    @view_config(route_name='register_client_form')
    @jsonify
    @h.trace
    def register_client_form(self):
        request = self.request
        print '---------------------'
        print 'Using existing cookie'
        res = RemoteAPI.makeRemoteCallWithAuth('get/member/1', 'http://romer.ck12.org/auth', auth_pass=request.cookies)
        print res
        print 'Now explicit Login'
        auth_cookies = um.login('admin','notck12')
        print auth_cookies
        print 'Now use received cookie to get user info'
        print um.getUser(request, 3, auth_cookies)
        print '---------------------'
        return render_to_response('client/register_client.jinja2', {})
    '''

    @view_config(route_name='get_event_task')
    @jsonify
    @h.trace
    def get_event_task(self):
        try:
            request = self.request
            result = common.getResponseTemplate(ErrorCodes.OK, 0)
            kwargs = {}
            #member = u.getCurrentUser(self.request, anonymousOkay=False)
            #if not member:
            #    return ErrorCodes().asDict(ErrorCodes.AUTHENTICATION_REQUIRED, 'User not logged in')
            params = request.GET
            log.info('params: %s' %(params))
            h.trimParameters(params)
            log.info('trimmed params: %s' %(params))
            if params.has_key('name') and params['name']:
                kwargs['name'] = params['name']
            else:
                raise Exception('name is mandatory')

            #Register the event task 
            event_task = eventtask.EventTask(request.db).getEventTask(name=kwargs['name'])
            result['response']['event_task'] = eventtask.EventTask(request.db).asDict(event_task)

            return result
        except Exception,e:
            if not hasattr(self.c,'errorCode'):
                self.c.errorCode = ErrorCodes.CANNOT_GET_EVENTTASK
            log.error('register_event_task: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(self.c.errorCode, str(e))

    @view_config(route_name='get_event_tasks')
    @jsonify
    @h.trace
    def get_event_tasks(self):
        try:
            request = self.request
            result = common.getResponseTemplate(ErrorCodes.OK, 0)
            pageNum, pageSize = paginate(self.request)
            event_tasks = eventtask.EventTask(request.db).getAll(pageNum=pageNum, pageSize=pageSize)
            event_task_list = []
            for each_task in event_tasks:
                event_task_list.append(each_task)
            result['response']['event_tasks'] = event_task_list
            result['response']['total']  = event_tasks.getTotal()
            result['response']['limit']  = event_tasks.getResultCount()
            result['response']['offset'] = (pageNum-1)*pageSize
            return result
        except Exception,e:
            if not hasattr(self.c,'errorCode'):
                self.c.errorCode = ErrorCodes.CANNOT_GET_EVENTTASKS
            log.error('get_event_tasks: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(self.c.errorCode, str(e))

    '''
    @view_config(route_name='get_clients_form')
    @jsonify
    @h.trace
    def get_clients_form(self):
        clients = client.Client(self.request.db).getAll(pageNum=1, pageSize=100)
        return render_to_response('client/list_clients.jinja2', {'clients':clients})
    '''

    @view_config(route_name='update_event_task')
    @jsonify
    @h.trace
    def update_event_task(self):
        try:
            request = self.request
            result = common.getResponseTemplate(ErrorCodes.OK, 0)
            kwargs = {}
            params = request.GET
            h.trimParameters(params)
            '''if params.has_key('name') and params['name']:
                kwargs['name'] = params['name']
            if params.has_key('new_name') and params['new_name']:
                kwargs['new_name'] = params['new_name']
            '''
            kwargs = params
            #Update the client 
            update_res = eventtask.EventTask(request.db).update(**kwargs)
            resp = {}
            resp['name'] = kwargs['name']
            if not update_res.get('err', None):
                resp['is_updated'] = True
            else:
                resp['is_updated'] = False
            resp['message'] = update_res.get('err')
            result['response']['event_task'] = resp
            return result
        except Exception,e:
            if not hasattr(self.c,'errorCode'):
                self.c.errorCode = ErrorCodes.CANNOT_UPDATE_EVENTTASK
            log.error('update_event_task: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(self.c.errorCode, str(e))

    @view_config(route_name='unregister_event_task')
    @jsonify
    @h.trace
    def unregister_event_task(self):
        try:
            request = self.request
            result = common.getResponseTemplate(ErrorCodes.OK, 0)
            kwargs = {}
            params = request.GET
            h.trimParameters(params)
            if params.has_key('name') and params['name']:
                kwargs['name'] = params['name']
            #Unregister the event task 
            unreg_resp = eventtask.EventTask(request.db).unregister(**kwargs)
            resp = {}
            resp['name'] = kwargs['name']
            if not unreg_resp.get('err', None):
                resp['is_unregistered'] = True
            else:
                resp['is_unregistered'] = False
            resp['message'] = unreg_resp.get('err')
            result['response']['event_task'] = resp
            return result
        except Exception,e:
            if not hasattr(self.c,'errorCode'):
                self.c.errorCode = ErrorCodes.CANNOT_UNREGISTER_EVENTTASK
            log.error('unregister_event_task: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(self.c.errorCode, str(e))
    
    '''
    @view_config(route_name='unregister_client_form')
    @jsonify
    @h.trace
    def unregister_client_form(self):
        clients = client.Client(self.request.db).getAll(pageNum=1, pageSize=100)
        return render_to_response('client/unregister_client.jinja2', {'clients': clients})
    '''
