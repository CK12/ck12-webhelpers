from pyramid.view import view_config
from dexter.lib import helpers as h
from beaker.cache import cache_region

from dexter.views.decorators import jsonify
from dexter.models import assessment
from dexter.views.errorCodes import ErrorCodes
from dexter.views.common import AssessCommon as common
from dexter.views.base import BaseView

import logging
log = logging.getLogger(__name__)


class Assessment(BaseView):
    """
    Assessment related REST APIs.
    """

    def __init__(self, context, request):
        BaseView.__init__(self, context, request)

    @cache_region('long_term')
    @view_config(route_name='get_assessment_answered_count')
    @jsonify
    @h.trace
    def get_assessment_answered_count(self):
        try:
            request = self.request
            result = common.getResponseTemplate(ErrorCodes.OK, 0)
            totalCount = assessment.Assessment(request.db).get_assessment_answered_count()

            result['response']['totalCount'] = totalCount
            return result
        except Exception,e:
            if not hasattr(self.c,'errorCode'):
                self.c.errorCode = ErrorCodes.CANNOT_GET_ASSESSMENT_COUNT
            log.error('get_assessment_answered_count: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(self.c.errorCode, str(e))

