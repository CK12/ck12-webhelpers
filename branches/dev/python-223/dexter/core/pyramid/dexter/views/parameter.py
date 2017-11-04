from pyramid.view import view_config
from pyramid.renderers import render_to_response
from dexter.lib import helpers as h

from dexter.views.decorators import jsonify, paginate
from dexter.models import parameter
from dexter.views.errorCodes import ErrorCodes
from dexter.views.common import AssessCommon as common
from dexter.views.base import BaseView
#from dexter.lib.remoteapi import RemoteAPI as remotecall

import logging
log = logging.getLogger(__name__)

class Parameter(BaseView):
    def __init__(self, context, request):
        BaseView.__init__(self, context, request)
        self.working_dir = '/tmp/dexter'
        self.config = h.load_config()

    """
        Parameter related APIs

    """

    @view_config(route_name='get_parameter')
    @jsonify
    @h.trace
    def get_parameter(self):
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

            #Get the parameter 
            parameter_obj = parameter.Parameter(request.db).getUnique(name=kwargs['name'])
            result['response']['parameter'] = parameter.Parameter(request.db).asDict(parameter_obj)

            return result
        except Exception,e:
            if not hasattr(self.c,'errorCode'):
                self.c.errorCode = ErrorCodes.CANNOT_GET_PARAMETER
            log.error('register_parameter: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(self.c.errorCode, str(e))
    
    @view_config(route_name='get_parameters')
    @jsonify
    @h.trace
    def get_parameters(self):
        try:
            request = self.request
            result = common.getResponseTemplate(ErrorCodes.OK, 0)
            pageNum, pageSize = paginate(self.request)
            parameters = parameter.Parameter(request.db).getAll(pageNum=pageNum, pageSize=pageSize)
            parameterList = []
            for eachParameter in parameters:
                parameterList.append(eachParameter)
            result['response']['parameters'] = parameterList
            result['response']['total']  = parameters.getTotal()
            result['response']['limit']  = parameters.getResultCount()
            result['response']['offset'] = (pageNum-1)*pageSize
            return result
        except Exception,e:
            if not hasattr(self.c,'errorCode'):
                self.c.errorCode = ErrorCodes.CANNOT_GET_PARAMETER
            log.error('get_parameters: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(self.c.errorCode, str(e))

    @view_config(route_name='get_parameters_form')
    @jsonify
    @h.trace
    def get_parameters_form(self):
        parameters = parameter.Parameter(self.request.db).getAll(pageNum=1, pageSize=100)
        return render_to_response('parameter/list_parameters.jinja2', {'parameters':parameters})

    
    @view_config(route_name='register_parameter_form')
    @jsonify
    @h.trace
    def register_parameter_form(self):
        return render_to_response('parameter/register_parameter.jinja2', {})

    @view_config(route_name='unregister_parameter_form')
    @jsonify
    @h.trace
    def unregister_parameter_form(self):
        parameters = parameter.Parameter(self.request.db).getAll(pageNum=1, pageSize=100)
        return render_to_response('parameter/unregister_parameter.jinja2', {'parameters': parameters})


    @view_config(route_name='register_parameter')
    @jsonify
    @h.trace
    def register_parameter(self):
        try:
            request = self.request
            result = common.getResponseTemplate(ErrorCodes.OK, 0)
            kwargs = {}
            #member = u.getCurrentUser(self.request, anonymousOkay=False)
            #if not member:
            #    return ErrorCodes().asDict(ErrorCodes.AUTHENTICATION_REQUIRED, 'User not logged in')
            params = request.POST
            h.trimParameters(params)
            kwargs = params
            #Register the parameter 
            parameter_obj = parameter.Parameter(request.db).register(**kwargs)

            result['response']['parameter'] = parameter.Parameter(request.db).asDict(parameter_obj)
            return result
        except Exception,e:
            if not hasattr(self.c,'errorCode'):
                self.c.errorCode = ErrorCodes.CANNOT_REGISTER_PARAMETER
            log.error('register_parameter: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(self.c.errorCode, str(e))


    @view_config(route_name='update_parameter')
    @jsonify
    @h.trace
    def update_parameter(self):
        try:
            request = self.request
            result = common.getResponseTemplate(ErrorCodes.OK, 0)
            kwargs = {}
            #member = u.getCurrentUser(self.request, anonymousOkay=False)
            #if not member:
            #    return ErrorCodes().asDict(ErrorCodes.AUTHENTICATION_REQUIRED, 'User not logged in')
            params = request.POST
            h.trimParameters(params)

            kwargs = params
            #Update the parameter 
            update_resp = parameter.Parameter(request.db).update(**kwargs)
            resp = {}
            resp.update(update_resp)
            if not update_resp.get('err', None):
                resp['is_updated'] = True
            else:
                resp['is_updated'] = False
            resp['message'] = update_resp.get('err')
            if resp.get('err'):
                del resp['err']
            result['response']['parameter'] = resp
            return result
        except Exception,e:
            if not hasattr(self.c,'errorCode'):
                self.c.errorCode = ErrorCodes.CANNOT_UPDATE_PARAMETER
            log.error('update_parameter: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(self.c.errorCode, str(e))

    @view_config(route_name='unregister_parameter')
    @jsonify
    @h.trace
    def unregister_parameter(self):
        try:
            request = self.request
            result = common.getResponseTemplate(ErrorCodes.OK, 0)
            kwargs = {}
            #member = u.getCurrentUser(self.request, anonymousOkay=False)
            #if not member:
            #    return ErrorCodes().asDict(ErrorCodes.AUTHENTICATION_REQUIRED, 'User not logged in')
            params = request.POST
            h.trimParameters(params)

            kwargs = params
            #UnRegister the parameter 
            unreg_resp = parameter.Parameter(request.db).unregister(**kwargs)
            resp = {}
            resp.update(unreg_resp)
            if not unreg_resp.get('err', None):
                resp['is_unregistered'] = True
            else:
                resp['is_unregistered'] = False
            resp['message'] = unreg_resp.get('err')
            if resp.get('err'):
                del resp['err']
            result['response']['parameter'] = resp
            return result
        except Exception,e:
            if not hasattr(self.c,'errorCode'):
                self.c.errorCode = ErrorCodes.CANNOT_UNREGISTER_PARAMETER
            log.error('unregister_parameter: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(self.c.errorCode, str(e))
