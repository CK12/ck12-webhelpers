from pyramid.view import view_config
from pyramid.renderers import render_to_response
from dexter.lib import helpers as h

from dexter.views.decorators import jsonify, paginate
from dexter.models import client,eventtype
from dexter.views.errorCodes import ErrorCodes
from dexter.views.common import AssessCommon as common
from dexter.views.base import BaseView
#from dexter.lib.remoteapi import RemoteAPI as remotecall

import logging
log = logging.getLogger(__name__)

class EventView(BaseView):
    def __init__(self, context, request):
        BaseView.__init__(self, context, request)
        self.working_dir = '/tmp/dexter'
        self.config = h.load_config()

    """
        Event related APIs

    """

    @view_config(route_name='register_event')
    @jsonify
    @h.trace
    def register_event(self):
        try:
            request = self.request
            result = common.getResponseTemplate(ErrorCodes.OK, 0)
            kwargs = {}
            #member = u.getCurrentUser(self.request, anonymousOkay=False)
            #if not member:
            #    return ErrorCodes().asDict(ErrorCodes.AUTHENTICATION_REQUIRED, 'User not logged in')
            params = request.POST
            h.trimParameters(params)
            log.info('PARAMS: %s'% params)
            clientID = params.get('clientID')

            try:
                clientID = int(clientID)
            except Exception as e:
                log.error(str(e))
                raise Exception('Invalid ClientID')
            ## Validate client
            is_valid = client.Client(request.db).validate(clientID=clientID)
            if not is_valid:
                raise Exception('Invalid Client')

            kwargs = params
            kwargs['clientID'] = clientID
            #Register the event for a client 
            event_obj = eventtype.EventType(request.db).register(**kwargs)

            result['response']['eventtype'] = eventtype.EventType(request.db).asDict(event_obj)
            return result
        except Exception,e:
            if not hasattr(self.c,'errorCode'):
                self.c.errorCode = ErrorCodes.CANNOT_REGISTER_EVENT
            log.error('register_client: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(self.c.errorCode, str(e))

    @view_config(route_name='register_event_form')
    @jsonify
    @h.trace
    def register_event_form(self):
        clients = client.Client(self.request.db).getAll(pageNum=1, pageSize=100)
        return render_to_response('eventtype/register_event.jinja2', {'clients': clients})


    @view_config(route_name='unregister_event_form')
    @jsonify
    @h.trace
    def unregister_event_form(self):
        clients = client.Client(self.request.db).getAll(pageNum=1, pageSize=100)
        return render_to_response('eventtype/unregister_event.jinja2', {'clients': clients})

    @view_config(route_name='get_eventtypes_by_client_id')
    @jsonify
    @h.trace
    def get_event_types(self):
        try:
            request = self.request
            result = common.getResponseTemplate(ErrorCodes.OK, 0)
            #member = u.getCurrentUser(self.request, anonymousOkay=False)
            #if not member:
            #    return ErrorCodes().asDict(ErrorCodes.AUTHENTICATION_REQUIRED, 'User not logged in')
            params = request.POST
            h.trimParameters(params)
            clientID = params.get('clientID')
            if not clientID:
                get_params = request.GET
                h.trimParameters(get_params)
                clientID = get_params.get('clientID')
            try:
                log.info('CLIENT: %s'% clientID)
                clientID = int(clientID)
            except Exception as e:
                raise Exception('Invalid ClientID')
            ## Validate client
            is_valid = client.Client(request.db).validate(clientID=clientID)
            if not is_valid:
                raise Exception('Invalid Client')

            pageNum, pageSize = paginate(self.request)
            eventTypes = eventtype.EventType(request.db).getEventTypesByClientID(clientID=clientID,pageNum=pageNum, pageSize=pageSize)
            eventTypeList = []
            for eachEventType in eventTypes:
                eventTypeList.append(eachEventType)
            result['response']['event_types'] = eventTypeList
            result['response']['total']  = eventTypes.getTotal()
            result['response']['limit']  = eventTypes.getResultCount()
            result['response']['offset'] = (pageNum-1)*pageSize
            return result
        except Exception,e:
            if not hasattr(self.c,'errorCode'):
                self.c.errorCode = ErrorCodes.CANNOT_GET_CLIENTS
            log.error('get_clients: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(self.c.errorCode, str(e))

    @view_config(route_name='unregister_event')
    @jsonify
    @h.trace
    def unregister_event(self):
        try:
            request = self.request
            result = common.getResponseTemplate(ErrorCodes.OK, 0)
            kwargs = {}
            #member = u.getCurrentUser(self.request, anonymousOkay=False)
            #if not member:
            #    return ErrorCodes().asDict(ErrorCodes.AUTHENTICATION_REQUIRED, 'User not logged in')
            params = request.POST
            h.trimParameters(params)
            clientID = params.get('clientID')

            try:
                clientID = int(clientID)
            except Exception as e:
                raise Exception('Invalid ClientID')
            ## Validate client
            is_valid = client.Client(request.db).validate(clientID=clientID)
            if not is_valid:
                raise Exception('Invalid Client')

            kwargs = params
            kwargs['clientID'] = clientID
            #Register the event for a client 
            unreg_resp = eventtype.EventType(request.db).unregister(**kwargs)
            resp = {}
            resp['eventType'] = kwargs['eventType']
            resp['clientID'] = kwargs['clientID']
            if not unreg_resp.get('err', None):
                resp['is_unregistered'] = True
            else:
                resp['is_unregistered'] = False
            resp['message'] = unreg_resp.get('err')
            result['response']['event'] = resp
            return result
        except Exception,e:
            if not hasattr(self.c,'errorCode'):
                self.c.errorCode = ErrorCodes.CANNOT_UNREGISTER_EVENT
            log.error('register_client: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(self.c.errorCode, str(e))

    @view_config(route_name='get_eventtype_form')
    @jsonify
    @h.trace
    def get_eventtype_form(self):
        sort = [('clientID', 1), ('eventType', 1)]
        event_types = eventtype.EventType(self.request.db).getAll(pageNum=1, pageSize=100, sort=sort)
        return render_to_response('eventtype/get_eventtypes.jinja2', {'eventTypes': event_types})
