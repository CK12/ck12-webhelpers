from datetime import timedelta, date

from pyramid.view import view_config

from pyramid.renderers import render_to_response
from beaker.cache import cache_region
from dexter.lib import helpers as h
from dexter.views.decorators import jsonify
from dexter.views.errorCodes import ErrorCodes
from dexter.views.common import AssessCommon as common
from dexter.views.base import BaseView
from dexter.models import iplocation
#from dexter.lib.remoteapi import RemoteAPI as remotecall

import logging
log = logging.getLogger(__name__)

class ConceptAggregationView(BaseView):
    def __init__(self, context, request):
        BaseView.__init__(self, context, request)
        self.config = h.load_config()
        self.message = ''
        self.region = ''
        self.country = ''
        self.concepts = []
        self.eids = set()
        
    """
        Aggregation related APIs

    """

    @view_config(route_name='trending_concepts')
    @jsonify
    @h.trace
    def get_trending_concepts(self):
        try:
            request = self.request
            result = common.getResponseTemplate(ErrorCodes.OK, 0)

            params = request.GET
            log.info('params: %s' %(params))
            h.trimParameters(params)
            log.info('trimmed params: %s' %(params))

            country = params.get("country", '').lower()
            region = params.get("region", '').lower()
            client_ip = request.client_addr

            @cache_region('long_term')
            def __process_trending_concepts(country, region, client_ip):
                if not country:
                    if not client_ip:
                        client_ip = ''
                    ip_info = iplocation.IPLocation(request.db).get_location(ip_address=client_ip)

                    country = ip_info.get('country_long', '').lower().strip()
                    region = ip_info.get('region', '').lower().strip()

                trending_concepts = self._get_trending_concepts(request.db, country, region)
                trending_concepts = self.format_trending_concepts(request.db, trending_concepts)
                if not country:
                    country = 'unknown'
                if not region:
                    region = 'unknown'
                if client_ip:
                    self.message = "Concepts for IP : %s, with country: [%s], region: [%s]" %(client_ip, country, region)
                response = {}
                response['message'] = self.message
                response['trending_concepts'] = trending_concepts
                response['location'] = {'country':country, 'region':region}
                return response

            result['response'] = __process_trending_concepts(country, region, client_ip)
            return result
        except Exception,e:
            log.error('trending concepts: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(self.c.errorCode, str(e))

    @view_config(route_name='top_5_concepts_form')
    @jsonify
    @h.trace
    def top_5_concepts_form(self):
        try:
            request = self.request
            result = {}
            if request.method == 'GET':
                return render_to_response('search/top5Concepts.jinja2', {'result':result})

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
                    result['message'] = 'No Concepts for IP : [%s]' % client_ip
                    result['response'] = []
                    result['country'] = ''
                    result['region'] = ''
                    return result

                country = ip_info.get('country_long', '').lower().strip()
                region = ip_info.get('region','').lower().strip()
            self.country = country
            results = self._get_trending_concepts(request.db, country, region)
            if client_ip:
                self.message = "IP : %s, with country" % client_ip
            result['message'] = self.message
            result['response'] = results
            result['country'] = self.country
            result['region'] = self.region
            result['web_root'] = self.config.get("web_prefix_url", "http://www.ck12.org")
            return render_to_response('search/top5Concepts.jinja2', {'result':result})
        except Exception,e:
            log.error('top5Concepts: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(self.c.errorCode, str(e))

    def _get_trending_concepts(self, db, country, region=None):
        """
        """
        filters = {}
        if country:
            filters = {'country' : country}
        if region:
            self.region = region
            filters.update({'state' : region})

        today = date.today()
        #First Search for today time bucket for top 5 concepts for specified country, region
        log.info("Search Query 1, current day terms")
        #time_bucket_list = ["%s-%s-%s-day" % (today.year, today.month, today.day)]
        time_bucket_list = [today.strftime('%Y-%m-%d-day')]
        results = self._get_results(db, time_bucket_list, filters)
        if results:
            self.message = "today's concepts with country"
            return results

        # check for concepts for current week
        log.info("Search Query 2, current week terms")
        #current_year = today.isocalendar()[0]
        #current_week = today.isocalendar()[1]
        #time_bucket_list = ["%s-%s-week" % (current_year, current_week)]
        time_bucket_list = [today.strftime('%Y-%W-week')]

        results = self._get_results(db, time_bucket_list, filters)
        if results:
            self.message = "current week concepts with country"
            return results

        # check for concepts for last 7 days            
        log.info("Search Query 3, last 7 day terms")
        time_bucket_list = []
        for i in range(7):
            dt = today - timedelta(days=i)
            #dt_str = "%s-%s-%s-day" % (dt.year, dt.month, dt.day)
            dt_str = dt.strftime('%Y-%m-%d-day')
            time_bucket_list.append(dt_str)
        results = self._get_results(db, time_bucket_list, filters)
        if results:
            self.message = "last 7 day's concepts with country"
            return results

        # check for concepts for last 2 weeks
        log.info("Search Query 4, last 2 weeks terms")
        time_bucket_list = []
        for i in range(14):
            dt = today - timedelta(days=i)
            #dt_str = "%s-%s-%s-day" % (dt.year, dt.month, dt.day)                
            dt_str = dt.strftime('%Y-%m-%d-day')
            time_bucket_list.append(dt_str)
        results = self._get_results(db, time_bucket_list, filters)
        if results:
            self.message = "last 2 week's concepts with country"
            return results

        # check for concepts for last 30 days
        log.info("Search Query 5, last 30 day terms")
        time_bucket_list = []
        for i in range(30):
            dt = today - timedelta(days=i)
            #dt_str = "%s-%s-%s-day" % (dt.year, dt.month, dt.day)                
            dt_str = dt.strftime('%Y-%m-%d-day')
            time_bucket_list.append(dt_str)
        results = self._get_results(db, time_bucket_list, filters)
        if results:
            self.message = "last 30 day's concepts with country"
            return results

        # check for search terms for last 14 days ignoring region/state
        log.info("Search Query 6, last 14 days without region terms.")
        time_bucket_list = []
        for i in range(14):
            dt = today - timedelta(days=i)
            #dt_str = "%s-%s-%s-day" % (dt.year, dt.month, dt.day)                
            dt_str = dt.strftime('%Y-%m-%d-day')
            time_bucket_list.append(dt_str)
        results = self._get_results(db, time_bucket_list, {'country' : country})
        if results:
            self.message = "last 14 day's concepts without region for country"
            self.region = ''
            return results

        # check for yesterday global concepts.            
        log.info("Search Query 7, yesterdays global concepts")
        y_dt = today - timedelta(days=1)
        #y_dt_str = "%s-%s-%s-day" % (y_dt.year, y_dt.month, y_dt.day)
        y_dt_str = y_dt.strftime('%Y-%m-%d-day')
        time_bucket_list = [y_dt_str]
        results = self._get_results(db, time_bucket_list, {}, all_results=True)
        self.message = "yesterday's concepts without country"
        self.region = ''
        self.country = ''
        return results

    def _get_results(self, db, time_bucket_list, filters, all_results=False):
        """
        """
        main_filters = {"time_bucket": {"$in" : time_bucket_list}}
        main_filters.update(filters)
        matchClause = {'$match': main_filters}
        groupClause = {'$group': {'_id' : {'encodedID' : '$encodedID'}, "total": { "$sum": 1 } }}
        sortClause = {"$sort": {"total": -1}}
        limitClause = {"$limit": 10}
        # Prepare query
        query = []
        query.append(matchClause)
        query.append(groupClause)
        query.append(sortClause)
        query.append(limitClause)
            
        log.info("Query :%s"%query)
        concept_results = db.ConceptAggregate.aggregate(query)
        results = concept_results['result']
        log.info("Results :%s"%results)
        for result in results:
            eid = result['_id']['encodedID']
            if eid not in self.eids:
                self.eids.add(eid)
                self.concepts.append(result)
        if all_results:
            return self.concepts
        else:
            if len(self.concepts) >=10: # If not all results then return atleast 10 results.
                return self.concepts

    def format_trending_concepts(self, db, trending_concepts):
        """
        """
        eids_dict = dict()
        new_trending_concepts = []
        for trending_concept in trending_concepts:
            eid = trending_concept['_id']['encodedID'].lower()
            total = trending_concept['total']
            record = db.ConceptNodes.find_one({'encodedID': eid})
            log.info("Record:%s" % str(record))
            #continue
            if not record:
                new_trending_concepts.append({'name':'', 'handle':'', 'branch':{},'encodedID':eid, 'total':total})
                continue
            else:
                tmp_dict = dict()
                tmp_dict['name'] = record['name']
                tmp_dict['handle'] = record['handle']
                tmp_dict['branch'] = {}
                tmp_dict['branch']['name'] = record['branch']['name']
                tmp_dict['branch']['handle'] = record['branch']['handle']
                tmp_dict['encodedID'] = eid
                tmp_dict['total'] = total
                new_trending_concepts.append(tmp_dict)
        return new_trending_concepts
