from pyramid.view import view_config
from pyramid.renderers import render_to_response

from dexter.lib import helpers as h
from dexter.lib.remoteapi import RemoteAPI
from dexter.views.decorators import jsonify, paginate
from dexter.models import client
from dexter.models.auth.user import UserManager as um
from dexter.views.errorCodes import ErrorCodes
from dexter.views.common import AssessCommon as common
from dexter.views.base import BaseView
#from dexter.lib.remoteapi import RemoteAPI as remotecall

import logging
log = logging.getLogger(__name__)

class ClientView(BaseView):
    def __init__(self, context, request):
        BaseView.__init__(self, context, request)
        self.working_dir = '/tmp/dexter'
        self.config = h.load_config()

    """
        Client related APIs

    """

    @view_config(route_name='register_client')
    @jsonify
    @h.trace
    def register_client(self):
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

            #Register the client 
            clientObj = client.Client(request.db).register(**kwargs)
            result['response']['client'] = client.Client(request.db).asDict(clientObj)

            return result
        except Exception,e:
            if not hasattr(self.c,'errorCode'):
                self.c.errorCode = ErrorCodes.CANNOT_REGISTER_CLIENT
            log.error('register_client: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(self.c.errorCode, str(e))

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

    @view_config(route_name='get_client')
    @jsonify
    @h.trace
    def get_client(self):
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

            #Register the client 
            clientObj = client.Client(request.db).getUnique(name=kwargs['name'])
            result['response']['client'] = client.Client(request.db).asDict(clientObj)

            return result
        except Exception,e:
            if not hasattr(self.c,'errorCode'):
                self.c.errorCode = ErrorCodes.CANNOT_GET_CLIENT
            log.error('register_client: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(self.c.errorCode, str(e))

    @view_config(route_name='get_clients')
    @jsonify
    @h.trace
    def get_clients(self):
        try:
            request = self.request
            result = common.getResponseTemplate(ErrorCodes.OK, 0)
            pageNum, pageSize = paginate(self.request)
            clients = client.Client(request.db).getAll(pageNum=pageNum, pageSize=pageSize)
            clientList = []
            for eachClient in clients:
                clientList.append(eachClient)
            result['response']['clients'] = clientList
            result['response']['total']  = clients.getTotal()
            result['response']['limit']  = clients.getResultCount()
            result['response']['offset'] = (pageNum-1)*pageSize
            return result
        except Exception,e:
            if not hasattr(self.c,'errorCode'):
                self.c.errorCode = ErrorCodes.CANNOT_GET_CLIENTS
            log.error('get_clients: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(self.c.errorCode, str(e))

    @view_config(route_name='get_clients_form')
    @jsonify
    @h.trace
    def get_clients_form(self):
        clients = client.Client(self.request.db).getAll(pageNum=1, pageSize=100)
        return render_to_response('client/list_clients.jinja2', {'clients':clients})

    @view_config(route_name='update_client')
    @jsonify
    @h.trace
    def update_client(self):
        try:
            request = self.request
            result = common.getResponseTemplate(ErrorCodes.OK, 0)
            kwargs = {}
            params = request.POST
            h.trimParameters(params)
            clientID = params.get('clientID', None)
            _get_params = request.GET
            h.trimParameters(_get_params)
            params.update(_get_params)
            clientID = params.get('clientID', None)
            if not clientID:
                raise Exception('ClientID is mandatory')
            try:
                clientID = int(clientID)
            except Exception as e:
                raise Exception('Invalid ClientID')
            if params.has_key('name') and params['name']:
                kwargs['name'] = params['name']
            if params.has_key('new_name') and params['new_name']:
                kwargs['new_name'] = params['new_name']
            kwargs['clientID'] = clientID
            #Update the client 
            update_res = client.Client(request.db).update(**kwargs)
            resp = {}
            resp['name'] = kwargs['name']
            if not update_res.get('err', None):
                resp['is_updated'] = True
            else:
                resp['is_updated'] = False
            resp['message'] = update_res.get('err')
            result['response']['client'] = resp
            return result
        except Exception,e:
            if not hasattr(self.c,'errorCode'):
                self.c.errorCode = ErrorCodes.CANNOT_UPDATE_CLIENT
            log.error('update_client: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(self.c.errorCode, str(e))

    @view_config(route_name='unregister_client')
    @jsonify
    @h.trace
    def unregister_client(self):
        try:
            request = self.request
            result = common.getResponseTemplate(ErrorCodes.OK, 0)
            kwargs = {}
            params = request.POST
            h.trimParameters(params)
            clientID = params.get('clientID', None)
            _get_params = request.GET
            h.trimParameters(_get_params)
            params.update(_get_params)
            if not clientID:
                clientID = params.get('clientID', None)
            if not clientID:
                raise Exception('ClientID is mandatory')
            try:
                clientID = int(clientID)
            except Exception as e:
                raise Exception('Invalid ClientID')
            kwargs['clientID'] = clientID
            #Unregister the client 
            unreg_resp = client.Client(request.db).unregister(**kwargs)
            resp = {}
            resp['clientID'] = clientID
            if not unreg_resp.get('err', None):
                resp['is_unregistered'] = True
            else:
                resp['is_unregistered'] = False
            resp['message'] = unreg_resp.get('err')
            result['response']['client'] = resp
            return result
        except Exception,e:
            if not hasattr(self.c,'errorCode'):
                self.c.errorCode = ErrorCodes.CANNOT_UNREGISTER_CLIENT
            log.error('unregister_client: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(self.c.errorCode, str(e))

    @view_config(route_name='unregister_client_form')
    @jsonify
    @h.trace
    def unregister_client_form(self):
        clients = client.Client(self.request.db).getAll(pageNum=1, pageSize=100)
        return render_to_response('client/unregister_client.jinja2', {'clients': clients})

