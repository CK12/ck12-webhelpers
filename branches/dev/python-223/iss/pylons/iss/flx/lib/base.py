"""The base Controller API

Provides the BaseController class for subclassing.
"""
#from pylons import config, request, response, tmpl_context as c
from pylons import config, tmpl_context as c
from pylons.controllers import WSGIController
from pylons.i18n.translation import _
#from pylons.templating import render_mako as render

from flx.controllers.errorCodes import ErrorCodes
from flx.model.meta import Session
from flx.lib import helpers as h

import logging

log = logging.getLogger(__name__)

SORTABLE_COLUMNS = {
        'Resources': [ 'creationTime', 'name', 'ownerID', ],
    }

class BaseController(WSGIController):
    prefix = '/%s' % config.get('instance')

    def __before__(self):
        c.errorCode = ErrorCodes.OK

    def __after__(self):
        ## Set CORS and Cache headers for all API calls.
        #h.setCORSAndCacheHeaders(request, response)
        pass

    def getFuncName(self):
        return h.getFuncName()

    def getResponseTemplate(self, status, time):
        return {
                'responseHeader':{'status':status, 'time':time},
                'response':{},
               }

    def getSortOrder(self, sort, modelName):
        """
            Get sort order prescription from request parameters
            Format is: fld1,order1;fld2,order2 ...
        """
        if not sort or sort.lower() == 'none':
            return None
        if sort == 'latest':
            if modelName == 'Resources' or modelName == 'MemberLibraryResourceRevisions':
                sort = [('creationTime', 'desc')]
            else:
                sort = [('updateTime', 'desc'), ('creationTime', 'desc')]
        else:
            sortParts = sort.split(';')
            sort = []
            for s in sortParts:
                order = 'asc'
                if s.endswith(',desc'):
                    order = 'desc'
                sortFld = s.split(",", 1)[0]
                if sortFld in SORTABLE_COLUMNS[modelName]:
                    sort.append((sortFld, order))
                else:
                    raise Exception((_(u'Invalid sort field: %(sortFld)s')  % {"sortFld":sortFld}).encode("utf-8"))
        log.info('Sort order: %s' % sort)
        return sort

    def __call__(self, environ, start_response):
        """Invoke the Controller"""
        # WSGIController.__call__ dispatches to the Controller method
        # the request is routed to. This routing information is
        # available in environ['pylons.routes_dict']
        try:
            return WSGIController.__call__(self, environ, start_response)
        finally:
            Session.remove()
