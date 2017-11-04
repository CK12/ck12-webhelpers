"""The base Controller API

Provides the BaseController class for subclassing.
"""
from pylons import config
from pylons.controllers import WSGIController
from pylons.templating import render_jinja2 as render

from flx.model import meta

import logging

log = logging.getLogger(__name__)

class BaseController(WSGIController):
    prefix = '/%s' % config.get('instance')

    def __call__(self, environ, start_response):
        """Invoke the Controller"""
        # WSGIController.__call__ dispatches to the Controller method
        # the request is routed to. This routing information is
        # available in environ['pylons.routes_dict']
        try:
            return WSGIController.__call__(self, environ, start_response)
        finally:
            meta.Session.remove()

    def getResponseTemplate(self, status, qTime):
        return {
                'responseHeader':{'status':status, 'QTime':qTime},
                'response':{},
               }
