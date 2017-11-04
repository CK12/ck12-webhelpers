from pyramid.view import view_config
from dexter.lib import helpers as h

from dexter.views.decorators import jsonify
from dexter.models import lms_install
from dexter.views.errorCodes import ErrorCodes
from dexter.views.common import AssessCommon as common
from dexter.views.base import BaseView

import logging
log = logging.getLogger(__name__)


class LMSInstall(BaseView):
    """
    LMSInstall related REST APIs.
    """

    def __init__(self, context, request):
        BaseView.__init__(self, context, request)

    @view_config(route_name='get_lmsinstall')
    @jsonify
    @h.trace
    def get_lmsinstall(self):
        try:
            request = self.request
            result = common.getResponseTemplate(ErrorCodes.OK, 0)
            totalCount = lms_install.LMSInstall(request.db).get_lms_installs()

            result['response']['totalCount'] = totalCount

            return result
        except Exception,e:
            if not hasattr(self.c,'errorCode'):
                self.c.errorCode = ErrorCodes.CANNOT_GET_LMS_INSTALL_COUNT
            log.error('get_lmsinstalls: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(self.c.errorCode, str(e))
