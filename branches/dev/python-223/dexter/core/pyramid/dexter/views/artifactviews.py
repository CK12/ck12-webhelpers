from datetime import datetime, timedelta
from pyramid.view import view_config
from dexter.lib import helpers as h

from dexter.views.decorators import jsonify, paginate
from dexter.models import artifactviews
from dexter.views.errorCodes import ErrorCodes
from dexter.views.common import AssessCommon as common
from dexter.views.base import BaseView

import logging
log = logging.getLogger(__name__)

class ArtifactViews(BaseView):
    def __init__(self, context, request):
        BaseView.__init__(self, context, request)
        self.config = h.load_config()

    """
        Get Artifact Views

    """

    @view_config(route_name='get_artifact_views')
    @jsonify
    @h.trace
    def get_artifact_views(self):
        try:
            request = self.request
            result = common.getResponseTemplate(ErrorCodes.OK, 0)
            kwargs = {}
            
            params = request.GET
            log.info('params: %s' %(params))
            h.trimParameters(params)
            log.info('trimmed params: %s' %(params))
            
            start_day = end_day = None
            if params.has_key('start_day'):
                start_day = params['start_day']
                try:
                    start_day = datetime.strptime(start_day, '%Y-%m-%d').date()
                except:
                    raise Exception("Please provide appropriate start time, Sample Format:2015-12-31")
            if params.has_key('end_day'):
                end_day = params['end_day']                
                try:
                    end_day = datetime.strptime(end_day, '%Y-%m-%d').date()
                except:
                    raise Exception("Please provide appropriate end time, Sample Format:2015-12-31")
                    
            if not (start_day and end_day):
                # Take the start time and end time from yesterday
                ystd = datetime.now() - timedelta(days=1)
                ystd_day = ystd.date()
                time_buckets = [ystd_day.strftime('%Y-%m-%d-day')]
            else:
                if not (end_day >= start_day):
                    raise Exception("End day must me greater than start day.")
                diff = end_day - start_day
                time_buckets = []
                for i in range(diff.days + 1):
                    time_buckets.append(start_day + timedelta(days=i))
                time_buckets = [dt.strftime('%Y-%m-%d-day') for dt in time_buckets]
            try:
                page_num = int(params['page_num'])
            except:
                page_num = 1
            try:
                page_size = int(params['page_size'])
            except:
                page_size = 10                
                
            kwargs = dict()
            kwargs['time_buckets'] = time_buckets
            kwargs['page_num'] = page_num
            kwargs['page_size'] = page_size
            result['response']['artifactViews'] = artifactviews.ArtifactViews(request.db).getArtifactViews(**kwargs)

            return result
        except Exception,e:
            if not hasattr(self.c,'errorCode'):
                self.c.errorCode = ErrorCodes.CANNOT_GET_ARTIFACT_VIEWS
            log.error('register_parameter: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(self.c.errorCode, str(e))
