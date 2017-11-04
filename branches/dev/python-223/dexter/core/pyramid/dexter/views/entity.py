from pyramid.view import view_config
from pyramid.renderers import render_to_response
from dexter.lib import helpers as h

from dexter.views.decorators import jsonify, paginate
from dexter.models import entity
from dexter.views.errorCodes import ErrorCodes
from dexter.views.common import AssessCommon as common
from dexter.views.base import BaseView
#from dexter.lib.remoteapi import RemoteAPI as remotecall

import logging
log = logging.getLogger(__name__)

class Entity(BaseView):
    def __init__(self, context, request):
        BaseView.__init__(self, context, request)
        self.working_dir = '/tmp/dexter'
        self.config = h.load_config()

    """
        Entity related APIs

    """

    @view_config(route_name='get_entity')
    @jsonify
    @h.trace
    def get_entity(self):
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
            if params.has_key('paramName') and params['paramName']:
                kwargs['paramName'] = params['paramName']
            else:
                raise Exception('Parameter Name is mandatory')

            if params.has_key('entityKey') and params['entityKey']:
                kwargs['entityKey'] = params['entityKey']
            else:
                raise Exception('Entity Key is mandatory')

            #Get the entity 
            entityValue = entity.Entity(request.db).getByParameterAndEntityKey(**kwargs)
            result['response']['entity'] = entityValue

            return result
        except Exception,e:
            if not hasattr(self.c,'errorCode'):
                self.c.errorCode = ErrorCodes.CANNOT_GET_ENTITY
            log.error('get_entity: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(self.c.errorCode, str(e))
