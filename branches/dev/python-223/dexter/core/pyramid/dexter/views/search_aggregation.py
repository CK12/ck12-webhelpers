from datetime import datetime, timedelta, date

from pyramid.view import view_config

from pyramid.renderers import render_to_response
from dexter.lib import helpers as h
from dexter.views.decorators import jsonify
from dexter.views.errorCodes import ErrorCodes
from dexter.views.common import AssessCommon as common
from dexter.views.base import BaseView
from dexter.models import iplocation
#from dexter.lib.remoteapi import RemoteAPI as remotecall

import logging
log = logging.getLogger(__name__)

class SearchAggregationView(BaseView):
    def __init__(self, context, request):
        BaseView.__init__(self, context, request)
        self.config = h.load_config()
        self.message = ''
        self.region = ''
        self.country = ''

    """
        Aggregation related APIs

    """

    @view_config(route_name='trending_searches', http_cache=3600)
    @jsonify
    @h.trace
    def get_trending_searches(self):
        try:
            request = self.request
            result = common.getResponseTemplate(ErrorCodes.OK, 0)

            params = request.GET
            log.info('params: %s' %(params))
            h.trimParameters(params)
            log.info('trimmed params: %s' %(params))

            country = params.get("country", '').lower()
            region = params.get("region", '').lower()

            client_ip = None
            if not country:
                client_ip = request.client_addr
                if not client_ip:
                    client_ip = ''
                ip_info = iplocation.IPLocation(request.db).get_location(ip_address=client_ip)

                country = ip_info.get('country_long', '').lower().strip()
                region = ip_info.get('region', '').lower().strip()

            trending_searches = self._get_trending_searches(request.db, country, region)
            if not country:
                country = 'unknown'
            if not region:
                region = 'unknown'
            if client_ip:
                self.message = "Search results for IP : %s, with country: [%s], region: [%s]" %(client_ip, country, region)
            response = {}
            response['message'] = self.message
            response['trending_searches'] = trending_searches
            response['location'] = {'country':country, 'region':region}
            result['response'] = response
            return result
        except Exception,e:
            log.error('top5Searches: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(self.c.errorCode, str(e))

    @view_config(route_name='top_5_searches_form')
    @jsonify
    @h.trace
    def top_5_searches_form(self):
        try:
            request = self.request
            result = {}
            if request.method == 'GET':
                return render_to_response('search/top5SearchTerms.jinja2', {'result':result})

            params = dict(request.POST)
            log.info('params: %s' %(params))
            h.trimParameters(params)
            log.info('trimmed params: %s' %(params))

            country = params.get("country", None)
            region = params.get("region", None)

            client_ip = None
            if not country:
                client_ip = params.get("client_ip", None)
                client_ip = request.client_addr
                if not client_ip:
                    raise Exception('client_ip not specified. Please specify the client_ip')
                ip_info = iplocation.IPLocation(request.db).get_location(ip_address=client_ip)
                #ip2location = IPLocation(request.db)
                #location = ip2location.get_location(client_ip)
                if not ip_info:
                    result['message'] = 'No Searches for IP : [%s]' % client_ip
                    result['response'] = []
                    result['country'] = ''
                    result['region'] = ''
                    return result

                country = ip_info.get('country_long', '').lower().strip()
                region = ip_info.get('region','').lower().strip()
            self.country = country
            results = self._get_trending_searches(request.db, country, region)
            if client_ip:
                self.message = "IP : %s, with country" % client_ip
            result['message'] = self.message
            result['response'] = results
            result['country'] = self.country
            result['region'] = self.region
            result['web_root'] = self.config.get("web_prefix_url", "http://www.ck12.org")
            return render_to_response('search/top5SearchTerms.jinja2', {'result':result})
        except Exception,e:
            log.error('top5Searches: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(self.c.errorCode, str(e))

    def _get_trending_searches(self, db, country, region=None):
        """
        """
        filters = {}
        if country:
            filters = {'country' : country}
        if region:
            self.region = region
            filters.update({'state' : region})

        today = date.today()
        #First Search for today time bucket for top 5 searches for specified country, region
        log.info("Search Query, current day terms")
        #time_bucket_list = ["%s-%s-%s-day" % (today.year, today.month, today.day)]
        time_bucket_list = [today.strftime('%Y-%m-%d-day')]
        results = self._get_results(db, time_bucket_list, filters)
        if results:
            self.message = "today's search terms with country"
            return results

        # check for search terms for current week
        log.info("Search Query 2, current week terms")
        #current_year = today.isocalendar()[0]
        #current_week = today.isocalendar()[1]
        #time_bucket_list = ["%s-%s-week" % (current_year, current_week)]
        time_bucket_list = [today.strftime('%Y-%W-week')]

        results = self._get_results(db, time_bucket_list, filters)
        if results:
            self.message = "current week search terms with country"
            return results

        # check for search terms for last 7 days            
        log.info("Search Query, last 7 day terms")
        time_bucket_list = []
        for i in range(7):
            dt = today - timedelta(days=i)
            #dt_str = "%s-%s-%s-day" % (dt.year, dt.month, dt.day)
            dt_str = dt.strftime('%Y-%m-%d-day')
            time_bucket_list.append(dt_str)
        results = self._get_results(db, time_bucket_list, filters)
        if results:
            self.message = "last 7 day's search terms with country"
            return results

        # check for search terms for last 2 weeks
        log.info("Search Query, last 2 weeks terms")
        time_bucket_list = []
        for i in range(14):
            dt = today - timedelta(days=i)
            #dt_str = "%s-%s-%s-day" % (dt.year, dt.month, dt.day)                
            dt_str = dt.strftime('%Y-%m-%d-day')
            time_bucket_list.append(dt_str)
        results = self._get_results(db, time_bucket_list, filters)
        if results:
            self.message = "last 2 week's search terms with country"
            return results

        # check for search terms for last 30 days
        log.info("Search Query, last 30 day terms")
        time_bucket_list = []
        for i in range(30):
            dt = today - timedelta(days=i)
            #dt_str = "%s-%s-%s-day" % (dt.year, dt.month, dt.day)                
            dt_str = dt.strftime('%Y-%m-%d-day')
            time_bucket_list.append(dt_str)
        results = self._get_results(db, time_bucket_list, filters)
        if results:
            self.message = "last 30 day's search terms with country"
            return results

        # check for search terms for last 14 days ignoring region/state
        log.info("Search Query, last 14 days without region terms.")
        time_bucket_list = []
        for i in range(14):
            dt = today - timedelta(days=i)
            #dt_str = "%s-%s-%s-day" % (dt.year, dt.month, dt.day)                
            dt_str = dt.strftime('%Y-%m-%d-day')
            time_bucket_list.append(dt_str)
        results = self._get_results(db, time_bucket_list, {'country' : country})
        if results:
            self.message = "last 14 day's search terms without region for country"
            self.region = ''
            return results

        # check for yesterday global search terms.            
        log.info("Search Query, yesterdays global terms")
        y_dt = today - timedelta(days=1)
        #y_dt_str = "%s-%s-%s-day" % (y_dt.year, y_dt.month, y_dt.day)
        y_dt_str = y_dt.strftime('%Y-%m-%d-day')
        time_bucket_list = [y_dt_str]
        results = self._get_results(db, time_bucket_list, {}, all_results=False)
        if results:
            self.message = "yesterday's search terms without country"
            self.region = ''
            self.country = ''
            return results

        # check for last 30 days global search term.
        log.info("Search Query, last 30 days global search terms.")
        time_bucket_list = []
        for i in range(30):
            dt = today - timedelta(days=i)
            #dt_str = "%s-%s-%s-day" % (dt.year, dt.month, dt.day)                
            dt_str = dt.strftime('%Y-%m-%d-day')
            time_bucket_list.append(dt_str)
        results = self._get_results(db, time_bucket_list, {}, all_results=False)
        if results:
            self.message = "last 30 day's global search terms"
            self.region = ''
            return results

        # check for last 60 days global search term.
        log.info("Search Query, last 60 days global search terms.")
        time_bucket_list = []
        for i in range(60):
            dt = today - timedelta(days=i)
            #dt_str = "%s-%s-%s-day" % (dt.year, dt.month, dt.day)                
            dt_str = dt.strftime('%Y-%m-%d-day')
            time_bucket_list.append(dt_str)
        results = self._get_results(db, time_bucket_list, {}, all_results=False)
        self.message = "last 60 day's global search terms"
        self.region = ''
        return results


    def _get_results(self, db, time_bucket_list, filters, all_results=False):
        """
        """
        main_filters = {"time_bucket": {"$in" : time_bucket_list}}
        main_filters.update(filters)
        matchClause = {'$match': main_filters}
        groupClause = {'$group': {'_id' : {'searchTerm' : '$searchTerm'}, "total": { "$sum": 1 } }}
        sortClause = {"$sort": {"total": -1}}
        if not all_results:
            limitClause = {"$limit": 10}
        # Prepare query
        query = []
        query.append(matchClause)
        query.append(groupClause)
        query.append(sortClause)
        query.append(limitClause)

        log.info("Query :%s"%query)
        search_results = db.SearchAggregate.aggregate(query)
        results = search_results['result']
        log.info("Results :%s"%results)
        if all_results:
            return results
        else:
            if len(results) >=10: # If not all results then return atleast 10 results.
                return results

