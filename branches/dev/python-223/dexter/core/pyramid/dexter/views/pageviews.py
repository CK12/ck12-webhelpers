from datetime import datetime, timedelta, date

from pyramid.view import view_config

from pyramid.renderers import render_to_response
from dexter.lib import helpers as h
from dexter.views.decorators import jsonify
from dexter.views.errorCodes import ErrorCodes
from dexter.views.common import AssessCommon as common
from dexter.views.base import BaseView
from bson.objectid import ObjectId

import logging
log = logging.getLogger(__name__)


class PageView(BaseView):

    def __init__(self, context, request):
        BaseView.__init__(self, context, request)
        self.config = h.load_config()
        self.message = ''
        self.region = ''
        self.country = ''

    @view_config(route_name='get_pageview_count')
    @jsonify
    @h.trace
    def get_pageview_count(self):
        """
        """
        try:
            request = self.request
            result = common.getResponseTemplate(ErrorCodes.OK, 0)

            params = request.GET
            log.info('params: %s' %(params))
            h.trimParameters(params)
            log.info('trimmed params: %s' %(params))
            artifact_id = params.get('artifactID', '').lower()
            if not artifact_id:
                raise Exception("artifactID not provided.")
            try:
                artifact_id_int = int(artifact_id)
            except Exception as e:
                raise Exception("Please provided valid artifactID.")
                
            results = request.db.Resolved_FBS_MODALITY.find({'artifactID':{'$in':[artifact_id, artifact_id_int]}})
            pageview_count = results.count()
            result['response'] = {'artifactID': artifact_id, 'pageview_count': pageview_count}
            return result
        except Exception,e:
            if not hasattr(self.c,'errorCode'):
                self.c.errorCode = ErrorCodes.CANNOT_GET_PAGEVIEW_COUNT
            log.error('get_pageview_count: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(self.c.errorCode, str(e))

    @view_config(route_name='get_pageview_artifacts')
    @jsonify
    @h.trace
    def get_pageview_artifacts(self):
        """
        """
        try:
            request = self.request
            db = request.db
            result = common.getResponseTemplate(ErrorCodes.OK, 0)

            params = request.GET
            log.info('params: %s' %(params))
            h.trimParameters(params)
            log.info('trimmed params: %s' %(params))

            time_bucket = params.get('time_bucket', '')
            if not time_bucket:
                raise Exception("Please provide timebucket.")
            creator_id = params.get('creatorID', '')
            if creator_id:
                try:
                    creator_id = int(creator_id)
                except:
                    raise Exception("Please provide valid creatorID.")
                query = {'time_bucket':time_bucket, 'artifactID_creatorID': {'$in':[creator_id, str(creator_id)]}}
                artifact_ids = request.db.Resolved_FBS_MODALITY.find(query).distinct('artifactID')
            else:
                artifact_ids = request.db.Resolved_FBS_MODALITY.find({'time_bucket':time_bucket}).distinct('artifactID')
            artifact_ids = [int(artifact_id) for artifact_id in artifact_ids]
            artifact_ids = list(set(artifact_ids))
            result['response'] = {'time_bucket':time_bucket, 'artifactIDs':artifact_ids}
            return result
        except Exception,e:
            if not hasattr(self.c,'errorCode'):
                self.c.errorCode = ErrorCodes.CANNOT_GET_PAGEVIEW_ARTIFACTS
            log.error('get_pageview_artifacts: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(self.c.errorCode, str(e))

