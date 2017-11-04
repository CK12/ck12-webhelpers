from urllib2 import unquote
from copy import deepcopy
import re
from datetime import datetime, timedelta
from beaker.cache import cache_region

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


def get_todays_time_bucket():
    now = datetime.now()
    return now.strftime('%Y-%m-%d-day')

def get_week_time_buckets():
    now = datetime.now()
    time_buckets = []
    for i in range(1, 8):
        time_buckets.append(now.strftime('%Y-%m-%d-day'))
        now = now - timedelta(hours=24)
    return time_buckets

def clean_search_term(search_term):
    search_term = unquote(search_term).strip().lower()
    special_searches = ['author', 'tag', 'subject', 'domain', 'grade']
    for special_search in special_searches:
        search_term = re.sub('^%s:' %(special_search), '', search_term)
    search_term = re.sub('^[0-9.\-]*$', '', search_term)
    for ch in [ '!', '"', '+']:
        search_term = search_term.replace(ch, '')
    if len(search_term) <= 2:
        search_term = ''
    return search_term


class TopRegionalView(BaseView):
    def __init__(self, context, request):
        BaseView.__init__(self, context, request)
        self.working_dir = '/tmp/dexter'
        self.config = h.load_config()

    """
        IP Address related APIs

    """

    @view_config(route_name='get_top_regional_search_terms')
    @jsonify
    @h.trace
    def get_top_regional_search_terms(self):
        try:
            request = self.request
            result = common.getResponseTemplate(ErrorCodes.OK, 0)

            ip_address = request.params.get('ip', '')
            if not ip_address:
                if request.client_addr:
                    ip_address = request.client_addr

            log.info('IP Address: %s' %(ip_address))
            ip_info = iplocation.IPLocation(request.db).get_location(ip_address=ip_address)
            if ip_info:
                current_location = ip_info.get('region', 'california')
            else:
                current_location = 'california'

            #@cache_region('long_term')
            def _main():
                regional_search_terms = {}
                states = 'Alaska,Alabama,Arkansas,Arizona,California,Colorado,Connecticut,District of Columbia,Delaware,Florida,Georgia,Hawaii,Iowa,Idaho,Illinois,Indiana,Kansas,Kentucky,Louisiana,Massachusetts,Maryland,Maine,Michigan,Minnesota,Missouri,Mississippi,Montana,North Carolina,North Dakota,Nebraska,New Hampshire,New Jersey,New Mexico,Nevada,New York,Ohio,Oklahoma,Oregon,Pennsylvania,Puerto Rico,Rhode Island,South Carolina,South Dakota,Tennessee,Texas,Utah,Virginia,Vermont,Washington,Wisconsin,West Virginia,Wyoming'
                for each_state in states.split(','):
                    regional_search_terms[each_state.lower()] = {}
                top_regional_search_terms = deepcopy(regional_search_terms)

                #todays_time_bucket = get_todays_time_bucket()
                week_time_buckets = get_week_time_buckets()
                log.info('week_time_buckets: [%s]' %(week_time_buckets))
                results = request.db.Events.find({'eventType':'FBS_SEARCH', 'time_bucket':{"$in":week_time_buckets}})
                for search_event in results:
                    payload = search_event.get('payload', {})
                    client_ip = payload.get('client_ip', None)
                    if not client_ip:
                        continue
                    ip_info = iplocation.IPLocation(request.db).get_location(ip_address=client_ip)
                    if ip_info.get('country_short') != 'us':
                        continue
                    region = ip_info.get('region')
                    if not region:
                        continue
                    search_term = payload.get('searchTerm')
                    search_term = clean_search_term(search_term)
                    if not search_term:
                        continue
                    if regional_search_terms.has_key(region):
                        if regional_search_terms[region].has_key(search_term):
                            regional_search_terms[region][search_term] += 1
                        else:
                            regional_search_terms[region][search_term] = 1
                    else:
                        regional_search_terms[region] = {search_term: 1}

                for state, search_terms in regional_search_terms.items():
                    sorted_search_terms = sorted(search_terms.items(), key=lambda x:x[1], reverse=True)[:10]
                    for search_term in sorted_search_terms:
                        top_regional_search_terms[state][search_term[0]] = search_term[1]
                return top_regional_search_terms
            top_regional_search_terms = _main()
            log.debug('regional_search_terms: [%s]' %(top_regional_search_terms))
            result['response']['states'] = top_regional_search_terms
            result['response']['current'] = current_location
            return result
        except Exception,e:
            if not hasattr(self.c,'errorCode'):
                self.c.errorCode = ErrorCodes.CANNOT_RECORD_EVENT
            log.error('record_event: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(self.c.errorCode, str(e))


    @cache_region('long_term')
    @view_config(route_name='get_top_regional_eids')
    @jsonify
    @h.trace
    def get_top_regional_eids(self):
        try:
            request = self.request
            result = common.getResponseTemplate(ErrorCodes.OK, 0)

            regional_eids = {}
            top_regional_eids = {}
            todays_time_bucket = get_todays_time_bucket()
            results = request.db.Events.find({'eventType':'FBS_MODALITY', '$or':[{'payload.context_eid':{'$regex': 'MAT.*', '$options':'i'}}, {'payload.context_eid':{'$regex': 'SCI.*', '$options':'i'}}], 'time_bucket':todays_time_bucket} )
            for modality_event in results:
                payload = modality_event.get('payload', {})
                client_ip = payload.get('client_ip', None)
                context_eid = payload.get('context_eid', '')
                if len(context_eid.split('.')) <=2 :
                    continue
                if not client_ip:
                    continue
                ip_info = iplocation.IPLocation(request.db).get_location(ip_address=client_ip)
                if ip_info.get('country_short') != 'us':
                    continue
                region = ip_info.get('region')
                if not region:
                    continue
                if regional_eids.has_key(region):
                    if regional_eids[region].has_key(context_eid):
                        regional_eids[region][context_eid] += 1
                    else:
                        regional_eids[region][context_eid] = 1
                else:
                    regional_eids[region] = {context_eid: 1}

            # Prepare the top regional eids dictionary.
            for state in regional_eids:
                top_regional_eids[state] = dict()

            for state, artifact_ids in regional_eids.items():
                log.info("State:%s, artifact_ids:%s" % (state,len(artifact_ids.keys())))
                sorted_artifact_ids = sorted(artifact_ids.items(), key=lambda x:x[1], reverse=True)[:10]
                log.info(sorted_artifact_ids)
                for artifact_id in sorted_artifact_ids:
                    top_regional_eids[state][artifact_id[0]] = artifact_id[1]
            log.info('top_regional_eids: [%s]' %(top_regional_eids))

            result['response']['states'] = top_regional_eids
            #return render_to_response('search/searchTerms.jinja2', {'search_terms':regional_search_terms})
            return result
        except Exception,e:
            if not hasattr(self.c,'errorCode'):
                self.c.errorCode = ErrorCodes.CANNOT_RECORD_EVENT
            log.error('record_event: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(self.c.errorCode, str(e))
