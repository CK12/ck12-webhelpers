from datetime import datetime, timedelta
import traceback
import re

from pyramid.view import view_config
from pymongo import ASCENDING, DESCENDING

from dexter.models import page as p
from dexter.lib import helpers as h
from dexter.views.decorators import jsonify, paginate
from dexter.views.errorCodes import ErrorCodes
from dexter.views.common import AssessCommon as common
from dexter.views.base import BaseView
#from dexter.lib.remoteapi import RemoteAPI as remotecall

import logging
log = logging.getLogger(__name__)

class TraceView(BaseView):
    def __init__(self, context, request):
        BaseView.__init__(self, context, request)
        self.working_dir = '/tmp/dexter'
        self.config = h.load_config()

    """
        Aggregation related APIs

    """

    @view_config(route_name='trace_members')
    @jsonify
    @h.trace
    def trace_members(self):
        try:
            request = self.request
            result = common.getResponseTemplate(ErrorCodes.OK, 0)
            params = request.GET
            log.info('params: %s' %(params))
            h.trimParameters(params)
            log.info('trimmed params: %s' %(params))

            memberID = params.get('memberID')
            memberEmail = params.get('memberEmail')
            if not memberID and not memberEmail:
                raise Exception('Specify memberID or memberEmail')

            if memberEmail:
                member = self.request.db.Members.find_one({"entityValue.response.email":memberEmail}, {"entityKey":1})
                memberID = member["entityKey"]

            log.info('Generating user trace for memberID: [%s]' %(memberID))

            eventTypes = [ x.strip() for x in params.get('eventTypes', 'FBS_MODALITY').split(',') ]

            fromDate = params.get('fromDate')
            toDate = params.get('toDate')
            formatDT = '%Y-%m-%d-%H'
            fromDT = datetime.strptime(fromDate, formatDT)
            toDT = datetime.strptime(toDate, formatDT)
            time_bucket = []
            while fromDT <= toDT:
                time_bucket.append(datetime.strftime(fromDT, "%Y-%m-%d %H-hour"))
                fromDT = fromDT + timedelta(hours=1)

            pageNum, pageSize = paginate(self.request)

            query = {"payload.memberID":memberID, "time_bucket": {"$in":time_bucket}}
            if len(eventTypes) > 1:
                query['$or'] = []
                for evt in eventTypes:
                    query['$or'].append({'eventType': re.compile(r'%s.*' % evt)})
            else:
                query['eventType'] = re.compile(r'%s.*' % eventTypes[0])

            log.info("qeury: %s" % query)

            events = p.Page(request.db.Events, query, pageNum, pageSize)
            eventList = []
            for eachEvent in events:
                eventList.append(eachEvent)
            result['response']['events'] = eventList
            result['response']['total']  = events.getTotal()
            result['response']['limit']  = events.getResultCount()
            result['response']['offset'] = (pageNum-1)*pageSize

            return result
        except Exception,e:
            if not hasattr(self.c,'errorCode'):
                self.c.errorCode = ErrorCodes.CANNOT_AGGREGATE
            log.error('top5concepts: %s' % str(e), exc_info=e)
            log.error(traceback.format_exc(e))
            return ErrorCodes().asDict(self.c.errorCode, str(e))
