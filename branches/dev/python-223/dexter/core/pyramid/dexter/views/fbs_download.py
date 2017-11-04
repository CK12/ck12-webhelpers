from pyramid.view import view_config
from dexter.lib import helpers as h

from dexter.views.decorators import jsonify
from dexter.models import fbs_download
from dexter.views.errorCodes import ErrorCodes
from dexter.views.common import AssessCommon as common
from dexter.views.base import BaseView

import logging
log = logging.getLogger(__name__)


class FBSDownload(BaseView):
    """
    FBSDownload related REST APIs.
    """

    def __init__(self, context, request):
        BaseView.__init__(self, context, request)

    @view_config(route_name='get_fbsdownloads')
    @jsonify
    @h.trace
    def get_fbsdownloads(self):
        try:
            request = self.request
            result = common.getResponseTemplate(ErrorCodes.OK, 0)
            artifactID = request.matchdict['artifactID']

            # Fetch the downloded members list.
            memberIDs = fbs_download.FBSDownload(request.db).getFBSDownloads(artifactID)

            result['response']['memberIDs'] = memberIDs
            result['response']['total']  = len(memberIDs)

            return result
        except Exception,e:
            if not hasattr(self.c,'errorCode'):
                self.c.errorCode = ErrorCodes.CANNOT_GET_FBS_DOWNLOAD
            log.error('get_fbsdownloads: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(self.c.errorCode, str(e))
