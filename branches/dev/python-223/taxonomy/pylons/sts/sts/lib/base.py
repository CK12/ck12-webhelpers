"""The base Controller API

Provides the BaseController class for subclassing.
"""
from pylons.controllers import WSGIController
from pylons import request, response
## Used by other files. Leave this here.
from pylons.templating import render_jinja2 as render

from sts.model.meta import Session
from sts.lib import helpers as h

class BaseController(WSGIController):

    def __after__(self):
        ## Set CORS and Cache headers for all API calls.
        h.setCORSAndCacheHeaders(request, response)
        h.setSEOHeaders(response)

    def __call__(self, environ, start_response):
        """Invoke the Controller"""
        # WSGIController.__call__ dispatches to the Controller method
        # the request is routed to. This routing information is
        # available in environ['pylons.routes_dict']
        try:
            return WSGIController.__call__(self, environ, start_response)
        finally:
            Session.remove()
            
    def getResponseTemplate(self, status, qTime):
        return {
                'responseHeader':{'status':status, 'QTime':qTime},
                'response':{},
               }
