from pyramid.view import view_config
from pyramid.response import Response
from pyramid.renderers import render_to_response
from dexter.lib import helpers as h

from dexter.views.decorators import jsonify
from dexter.models import iplocation
from dexter.views.errorCodes import ErrorCodes
from dexter.views.common import AssessCommon as common
from dexter.views.base import BaseView
#from dexter.lib.remoteapi import RemoteAPI as remotecall
import logging

log = logging.getLogger(__name__)

class IPLocationView(BaseView):
    def __init__(self, context, request):
        BaseView.__init__(self, context, request)
        self.working_dir = '/tmp/dexter'
        self.config = h.load_config()
        self.timezone = "America/Los_Angeles"
        self.timeformat = "%Y-%m-%d %H:%M:%S %f"

    """
        IP Address related APIs

    """

    @view_config(route_name='get_location_from_ip')
    @jsonify
    @h.trace
    def get_location(self):
        try:
            request = self.request
            result = common.getResponseTemplate(ErrorCodes.OK, 0)

            ip_address = request.params.get('ip', '')
            if not ip_address:
                if request.client_addr:
                    ip_address = request.client_addr

            if not ip_address:
                raise Exception('IP Address not specified. Exiting...')

            #Record the event in Redis Queue 
            log.info('IP Address: %s' %(ip_address))
            ip_info = iplocation.IPLocation(request.db).get_location(ip_address=ip_address)
            result['response']['ip_info'] = ip_info
            return result
        except Exception,e:
            if not hasattr(self.c,'errorCode'):
                self.c.errorCode = ErrorCodes.CANNOT_RECORD_EVENT
            log.error('record_event: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(self.c.errorCode, str(e))
