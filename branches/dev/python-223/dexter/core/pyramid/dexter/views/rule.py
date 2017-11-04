from pyramid.view import view_config
from dexter.lib import helpers as h

from dexter.views.decorators import jsonify, paginate
from dexter.models import rule
from dexter.views.errorCodes import ErrorCodes
from dexter.views.common import AssessCommon as common
from dexter.views.base import BaseView
#from dexter.lib.remoteapi import RemoteAPI as remotecall

import logging
log = logging.getLogger(__name__)

class RuleView(BaseView):
    def __init__(self, context, request):
        BaseView.__init__(self, context, request)
        self.working_dir = '/tmp/dexter'
        self.config = h.load_config()

    """
        Rules related APIs

    """

    @view_config(route_name='create_rule')
    @jsonify
    @h.trace
    def create_rule(self):
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

            #Register the rule 
            ruleObj = rule.Rule(request.db).register(**kwargs)
            result['response']['rule'] = rule.Rule(request.db).asDict(ruleObj)

            return result
        except Exception,e:
            if not hasattr(self.c,'errorCode'):
                self.c.errorCode = ErrorCodes.CANNOT_REGISTER_RULE
            log.error('register_rule: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(self.c.errorCode, str(e))

    #@view_config(route_name='update_test')
    @jsonify
    @h.trace
    def update_rule(self):
        try:
            request = self.request
            params = request.GET
            result = common.getResponseTemplate(ErrorCodes.OK, 0)
            return result
        except Exception,e:
            if not hasattr(self.c,'errorCode'):
                self.c.errorCode = ErrorCodes.CANNOT_UPDATE_RULE
            log.error('update_rule: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(self.c.errorCode, str(e))


    @view_config(route_name='get_rules')
    @jsonify
    @h.trace
    def get_rules(self):
        try:
            request = self.request
            result = common.getResponseTemplate(ErrorCodes.OK, 0)
            pageNum, pageSize = paginate(self.request)
            rules = rule.Rule(request.db).getAll(pageNum=pageNum, pageSize=pageSize)
            ruleList = []
            for eachRule in rules:
                ruleList.append(eachRule)
            result['response']['rules'] = ruleList
            result['response']['total']  = rules.getTotal()
            result['response']['limit']  = rules.getResultCount()
            result['response']['offset'] = (pageNum-1)*pageSize
            return result
        except Exception,e:
            if not hasattr(self.c,'errorCode'):
                self.c.errorCode = ErrorCodes.CANNOT_GET_RULES
            log.error('get_rules: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(self.c.errorCode, str(e))

