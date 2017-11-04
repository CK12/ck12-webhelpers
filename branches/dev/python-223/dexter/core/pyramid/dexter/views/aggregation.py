from datetime import datetime, timedelta

from pyramid.view import view_config
from pymongo import ASCENDING, DESCENDING

from dexter.lib import helpers as h
from dexter.views.decorators import jsonify
from dexter.views.errorCodes import ErrorCodes
from dexter.views.common import AssessCommon as common
from dexter.views.base import BaseView
#from dexter.lib.remoteapi import RemoteAPI as remotecall

import logging
log = logging.getLogger(__name__)

class AggregationView(BaseView):
    def __init__(self, context, request):
        BaseView.__init__(self, context, request)
        self.working_dir = '/tmp/dexter'
        self.config = h.load_config()

    """
        Aggregation related APIs

    """

    @view_config(route_name='top5concepts')
    @jsonify
    @h.trace
    def top5concepts(self):
        try:
            request = self.request
            result = common.getResponseTemplate(ErrorCodes.OK, 0)
            params = request.GET
            log.info('params: %s' %(params))
            h.trimParameters(params)
            log.info('trimmed params: %s' %(params))

            start = datetime(2013, 3, 1)
            end = datetime(2013, 3, 31)

            log.info(datetime.now())
            queryResult = request.db.Resolved_FBS_MODALITY.aggregate([
                { "$match":  {"context_eid": {"$ne": ""}, "timestamp": {"$gt": start, "$lt": end} } },
                { "$group":  {"_id": { "day": { "$dayOfMonth": "$timestamp" }, "EID": "$context_eid"}, "total": { "$sum": 1 } } },
                { "$sort" :  {"total": -1 } }
            ])
            log.info(datetime.now())

            days = {}
            queryResult = queryResult['result']
            for row in queryResult:
                if len(row['_id']['EID'].split('.')) <= 2:
                    continue
                if days.has_key("April " +  str(row['_id']['day'])) and len(days["April " + str(row['_id']['day'])]) >= 5:
                    continue
                if not days.has_key("April " + str(row['_id']['day'])):
                    days["April " + str(row['_id']['day'])] = []
                days["April " + str(row['_id']['day'])].append(row)

            result['response'] = days
            return result
        except Exception,e:
            if not hasattr(self.c,'errorCode'):
                self.c.errorCode = ErrorCodes.CANNOT_AGGREGATE
            log.error('top5concepts: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(self.c.errorCode, str(e))

    @view_config(route_name='top_aggregates')
    @jsonify
    @h.trace
    def top_aggregates(self):
        try:
            request = self.request
            result = common.getResponseTemplate(ErrorCodes.OK, 0)
            params = request.GET
            log.info('Params: %s' %(params))
            h.trimParameters(params)
            #log.info('trimmed params: %s' %(params))

            query = []
            year = params.get('year', '2013')
            month = params.get('month', '')
            day = params.get('day', '')
            if not month and not day:
                time_bucket = year + '-year'
            if month and not day:
                time_bucket = year + '-' + month + '-month'
            if month and day:
                time_bucket = year + '-' + month + '-' + day + '-day'
            filters = {"time_bucket": time_bucket}
            if params.has_key('filter'):
                filterClause = params['filter']
                if not isinstance(filterClause, dict):
                    raise Exception('filter parameter is not of the right format')
                filters.update(filterClause)
            matchClause = {'$match': filters}
            query.append(matchClause)

            if params.has_key('filter'):
                filterClause = {}
                filterClause['$match'] = params['filter']
                query.append(filterClause)

            groupBy = params.get('groupBy', 'context_eid')
            groupClause = {"$group": {"_id": "$%s" %(groupBy), "total": {"$sum": 1}}}
            query.append(groupClause)

            sortBy = params.get('sort', 'desc')
            if sortBy == 'desc':
                sortBy = DESCENDING
            else:
                sortBy = ASCENDING
            sortClause = {"$sort": {"total": sortBy}}
            query.append(sortClause)

            limit = params.get('limit', 10)
            limit = int(limit)
            limitClause = {"$limit": limit}
            query.append(limitClause)

            log.info('Query: %s' %(query))
            queryResult = request.db.Resolved_FBS_MODALITY.aggregate(query)

            queryResult = queryResult['result']
            result['response'] = queryResult
            return result
        except Exception,e:
            if not hasattr(self.c,'errorCode'):
                self.c.errorCode = ErrorCodes.CANNOT_AGGREGATE
            log.error('top_aggregate: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(self.c.errorCode, str(e))


    @view_config(route_name='recent_modality_views')
    @jsonify
    @h.trace
    def recent_modality_views(self):
        try:
            request = self.request
            result = common.getResponseTemplate(ErrorCodes.OK, 0)
            params = request.GET
            log.info('Params: %s' %(params))
            h.trimParameters(params)
            #log.info('trimmed params: %s' %(params))

            query = []
            memberID = params.get('memberID')
            if not memberID:
                raise Exception('memberID not specified. Please specified the memberID')
            memberID = int(memberID)

            filters = {'memberID': memberID, 'artifactID_modality': True}
            matchClause = {'$match': filters}
            query.append(matchClause)

            if params.has_key('filter'):
                filterClause = {}
                filterClause['$match'] = params['filter']
                log.info(filterClause)
                query.append(filterClause)

            groupClause = {"$group": {'_id':'$artifactID', 'last_visited' : {'$max':'$timestamp'}}}
            query.append(groupClause)

            sortClause = {"$sort": {"last_visited": DESCENDING}}
            query.append(sortClause)

            limit = params.get('limit', 10)
            limit = int(limit)
            limitClause = {"$limit": limit}
            query.append(limitClause)

            log.info('Query: %s' %(query))
            queryResult = request.db.Resolved_FBS_MODALITY.aggregate(query)

            queryResult = queryResult['result']
            result['response'] = queryResult
            return result
        except Exception,e:
            if not hasattr(self.c,'errorCode'):
                self.c.errorCode = ErrorCodes.CANNOT_AGGREGATE
            log.error('top_aggregate: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(self.c.errorCode, str(e))


    @view_config(route_name='pageviews_per_day')
    @jsonify
    @h.trace
    def pageviews_per_day(self):
        try:
            request = self.request
            result = common.getResponseTemplate(ErrorCodes.OK, 0)
            params = request.GET
            log.info('Params: %s' %(params))
            #h.trimParameters(params)
            #log.info('trimmed params: %s' %(params))

            fromTimeStamp = params.get('from', '2013-01-01')
            toTimeStamp = params.get('to', '2013-05-15')
            fromDate = datetime.strptime(fromTimeStamp, '%Y-%m-%d')
            toDate = datetime.strptime(toTimeStamp, '%Y-%m-%d')

            delta = toDate - fromDate
            deltaDays = delta.days

            groupClause = {"$group": {"_id": None, "total": {"$sum": 1}}}
            queryResults = []
            for i in range(0, deltaDays + 1):
                newDate = fromDate + timedelta(days=i)
                time_bucket = newDate.strftime('%Y-%m-%d-day')
                query = []
                matchClauseForTimeBucket = {"$match": {"time_bucket": time_bucket}}
                query.append(matchClauseForTimeBucket)
                groupClause = {"$group": {"_id": time_bucket, "total": {"$sum": 1}}}
                query.append(groupClause)
                log.info('Query: %s' %(query))
                queryResult = request.db.Resolved_FBS_MODALITY.aggregate(query)
                if not queryResult['result']:
                    queryResult['result'] = [{'_id':time_bucket, 'total':0}]
                queryResults.append(queryResult['result'])

            result['response'] = queryResults
            return result
        except Exception,e:
            if not hasattr(self.c,'errorCode'):
                self.c.errorCode = ErrorCodes.CANNOT_AGGREGATE
            log.error('top_aggregate: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(self.c.errorCode, str(e))
