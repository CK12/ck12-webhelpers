from urlparse import urlparse
from pyramid.response import Response
from pyramid.view import view_config
from pyramid.renderers import render_to_response
from dexter.lib import helpers as h

from dexter.views.decorators import jsonify, paginate, checkAuth
from dexter.views import decorators as d
from dexter.models import eventparameter
from dexter.views.errorCodes import ErrorCodes
from dexter.views.common import AssessCommon as common
from dexter.views.base import BaseView
from dexter.views.celerytasks import record_event_parameters
#from dexter.lib.remoteapi import RemoteAPI as remotecall
from pyramid import request

import logging
import json
from dexter.views import user as u
log = logging.getLogger(__name__)

class EventParameter(BaseView):
    """Class for EventParameter.
    """
    def __init__(self, context, request):
        BaseView.__init__(self, context, request)
        self.config = h.load_config()

    """
        Event Parameter related APIs

    """

    @view_config(route_name='get_event_parameters')
    @checkAuth(False, True, True)
    @jsonify
    @h.trace
    def get_event_parameters(self):
        """Returns the list of event parameter for the provided event_type.
        """
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
            if params.has_key('event_type') and params['event_type']:
                kwargs['event_type'] = params['event_type']
            else:
                raise Exception('event_type is mandatory')

            #Get the parameter 
            model_obj = eventparameter.EventParameter(request.db)
            parameters = model_obj.get_event_parameters(event_type=kwargs['event_type'])
            result['response']['parameters'] = [parameter for parameter in parameters]

            return result
        except Exception,e:
            if not hasattr(self.c,'errorCode'):
                self.c.errorCode = ErrorCodes.CANNOT_GET_PARAMETER
            log.error('get_event_parameters: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(self.c.errorCode, str(e))

    @view_config(route_name='get_all_event_parameters')
    @checkAuth(False, True, True)
    @jsonify
    @h.trace
    def get_all_event_parameters(self):
        """Returns all the events and there parameters.
        """
        try:
            request = self.request
            result = common.getResponseTemplate(ErrorCodes.OK, 0)
            kwargs = {}
            #member = u.getCurrentUser(self.request, anonymousOkay=False)
            #if not member:
            #    return ErrorCodes().asDict(ErrorCodes.AUTHENTICATION_REQUIRED, 'User not logged in')

            model_obj = eventparameter.EventParameter(request.db)
            event_params = model_obj.get_all_event_parameters()
            result['response']['events'] = [event_param for event_param in event_params]

            return result
        except Exception,e:
            if not hasattr(self.c,'errorCode'):
                self.c.errorCode = ErrorCodes.CANNOT_GET_PARAMETER
            log.error('get_event_parameters: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(self.c.errorCode, str(e))

    @view_config(route_name='add_event_parameters')
    @checkAuth(False, True, True)
    @jsonify
    @h.trace
    def add_event_parameters(self):
        """Add the new event type along with parameters.
        """
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

            if params.has_key('event_type') and params['event_type']:
                kwargs['event_type'] = params['event_type']
            else:
                raise Exception('event_type is mandatory')

            parameters = []            
            del params['event_type']
            for name, values in params.items():                
                values = values.strip()
                if not values:
                    continue
                parameters.append({name:values.split(',')})
            if not parameters:
                raise Exception('No parameters provided.')

            kwargs['parameters'] = parameters
            #Get the parameter 
            model_obj = eventparameter.EventParameter(request.db)
            model_obj.add_event_parameters(**kwargs)
            result['response']['success'] = "Parameters added successfully."
            return result
        except Exception,e:
            if not hasattr(self.c,'errorCode'):
                self.c.errorCode = ErrorCodes.CANNOT_GET_PARAMETER
            log.error('get_event_parameters: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(self.c.errorCode, str(e))

    @view_config(route_name='update_event_parameters')
    @checkAuth(False, True, True)
    @jsonify
    @h.trace
    def update_event_parameters(self):
        """Update the existing event type parameters.
        """
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

            if params.has_key('event_type') and params['event_type']:
                kwargs['event_type'] = params['event_type']
            else:
                raise Exception('event_type is mandatory')

            parameters = []            
            del params['event_type']
            for name, values in params.items():                
                values = values.strip()
                if not values:
                    continue
                parameters.append({name:values.split(',')})

            kwargs['parameters'] = parameters
            #Get the parameter 
            model_obj = eventparameter.EventParameter(request.db)
            model_obj.update_event_parameters(**kwargs)
            result['response']['success'] = "Parameters updated successfully."
            return result
        except Exception,e:
            if not hasattr(self.c,'errorCode'):
                self.c.errorCode = ErrorCodes.CANNOT_GET_PARAMETER
            log.error('get_event_parameters: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(self.c.errorCode, str(e))  


    @view_config(route_name='trigger_event_parameters_celery')
    @checkAuth(False, True, True)
    @jsonify
    @h.trace
    def trigger_event_parameters_celery(self):
        """Trigger the event parameters celery task.
        """
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

            if params.has_key('event_type') and params['event_type']:
                kwargs['event_type'] = params['event_type'].strip()
            else:
                raise Exception('event_type is mandatory')

            if params.has_key('frequency') and params['frequency']:
                kwargs['frequency'] = params['frequency'].strip()
            else:
                raise Exception('frequency is mandatory')

            if kwargs['frequency'] not in ['hour', 'day', 'week', 'month']:
                raise Exception('Invalid frequency provided, frequency:%s' % kwargs['frequency'])

            celery_obj = record_event_parameters.EventParametersTask()
            celery_obj.run(**kwargs)

            result['response']['success'] = "%s Celery trigger successfully." % kwargs['event_type']
            return result
        except Exception,e:
            if not hasattr(self.c,'errorCode'):
                self.c.errorCode = ErrorCodes.CANNOT_GET_PARAMETER
            log.error('trigger_event_parameters_celery: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(self.c.errorCode, str(e))

    @view_config(route_name='event_parameters_form')
    @checkAuth(True, True, False, 'event_parameters_form')
    def event_parameters_form(self):
        return render_to_response('parameter/event_parameters.jinja2', {'events':{}})
