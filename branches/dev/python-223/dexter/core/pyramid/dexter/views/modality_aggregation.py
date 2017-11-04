import urllib
import json
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

branch_subject_mapping = {u'ALG': (u'algebra', u'mathematics'),
 u'ALY': (u'analysis', u'mathematics'),
 u'ARI': (u'arithmetic', u'mathematics'),
 u'CAL': (u'calculus', u'mathematics'), 
 u'MEA': (u'measurement', u'mathematics'),
 u'PRB': (u'probability', u'mathematics'),
 u'STA': (u'statistics', u'mathematics'),
 u'TRG': (u'trigonometry', u'mathematics'),
 u'GEO': (u'geometry', u'mathematics'),
 u'EM1': (u'elementary math grade 1', u'mathematics'),
 u'EM2': (u'elementary math grade 2', u'mathematics'),
 u'EM3': (u'elementary math grade 3', u'mathematics'),
 u'EM4': (u'elementary math grade 4', u'mathematics'),
 u'EM5': (u'elementary math grade 5', u'mathematics'),
 u'BIO': (u'biology', u'science'),
 u'CHE': (u'chemistry', u'science'),
 u'PHY': (u'physics', u'science'),
 u'ESC': (u'earth science', u'science'),
 u'LSC': (u'life science', u'science'),
 u'PSC': (u'physical science', u'science'),
 u'HIS': (u'history', u'social science'),
 u'SPL': (u'spelling', u'english'),
 u'TST': (u'software testing', u'engineering')}


class ModalityAggregationView(BaseView):
    def __init__(self, context, request):
        BaseView.__init__(self, context, request)
        self.config = h.load_config()
        self.message = ''
        self.moality_type = ''
        self.subject = ''
        self.branch = ''        
        self.web_prefix = self.config.get('web_prefix_url', 'http://www.ck12.org')
        self.artifact_url = '%s/flx/get/minimal' % self.web_prefix           
        self.search_api = '%s/flx/search/direct/modality/minimal/%s/?'
        self.search_params = 'pageNum=1&specialSearch=false&includeSpecialMatches=true&pageSize=20&includeEIDs=1&format=json'
        self.artifacts = set()
        self.modalities = []
        self.ck12_creator_id = 3
                
    @view_config(route_name='trending_modalities')
    @jsonify
    @h.trace
    def get_trending_modalities(self):
        try:
            request = self.request
            result = common.getResponseTemplate(ErrorCodes.OK, 0)

            params = request.GET
            log.info('params: %s' %(params))

            filter_params = {}
            fields = ['branches', 'modality_types', 'country', 'state']
            for field in fields:
                filter_params[field] = params.get(field, "").strip()
            client_ip = request.client_addr
            if params.has_key('ck12Only') and not params['ck12Only']:                
                self.ck12_only = False
            else:
                self.ck12_only = True            
            try:
                page_size = int(params['pageSize'])
            except:
                page_size = 10
            self.page_size = page_size            
            self.page_num = 1
            self.skip = 0
            if not filter_params.get('country'):
                if client_ip:
                    ip_info = iplocation.IPLocation(request.db).get_location(ip_address=client_ip)
                    filter_params['country'] = ip_info.get('country_long', '').lower().strip()
                    filter_params['state'] = ip_info.get('region', '').lower().strip()

            @cache_region('long_term')
            def __process_trending_modalities(branches, modality_types, country, state):
                filters = {}
                for field in [('branches', branches), ('modality_types', modality_types) , ('country', country), ('state', state)]:
                    if field[1]:
                        filters[field[0]] = field[1]
                if filters.has_key('modality_types') and filters['modality_types']:
                    _mtypes = filters['modality_types'].split(',')
                    filters['modality_type'] = {'$in': _mtypes}
                    del filters['modality_types']
                if filters.has_key('branches') and filters['branches']:
                    branches = filters['branches'].upper() 
                    _branches = branches.split(',')                    
                    filters['branch'] = {'$in': _branches}                    
                    del filters['branches']
                log.info('filters: [%s]' %(filters))

                trending_modalities = self._get_trending_modalities(request.db, **filters)
                # Check if we have any unpublished modalities
                published_modalities = []
                unpublished_artifactIDs = []
                for trending_modality in trending_modalities:
                    published = trending_modality.get('published')                    
                    if published:
                        published_modalities.append(trending_modality)
                    else:
                        unpublished_artifactIDs.append(trending_modality.get('artifactID'))
                unpublish_count = len(unpublished_artifactIDs)
                log.info("Unpublish modalities count:[%s]" % unpublish_count)
                log.info("Unpublish artifactIDs:[%s]" % unpublished_artifactIDs)                
                # If unpublished modalities then get the replacement modalities.
                if unpublish_count:
                    replace_modalities = self._get_replace_modalities(branches, modality_types, unpublish_count)
                    trending_modalities = published_modalities + replace_modalities
                    
                msg = ''
                for field in filters:
                    msg += '%s : [%s],' % (field, filters[field])                
                self.message = 'Modalities for %s ' % msg.strip(',')                    
                response = {}
                #response['message'] = self.message
                response['trending_modalities'] = trending_modalities
                response['location'] = {'country': filters.get('country'), 'state': filters.get('state')}
                return response
                

            country = filter_params['country']
            state = filter_params['state']
            modality_types = filter_params['modality_types']
            branches = filter_params['branches']                                    
            result['response'] = __process_trending_modalities(branches, modality_types, country, state)
            #results = self._get_trending_modalities(request.db, modality_type, subject, branch)
            #result['response'] = results
            return result
        except Exception,e:
            if not hasattr(self.c,'errorCode'):
                self.c.errorCode = ErrorCodes.CANNOT_GET_TRENDING_MODALITIES
            log.error('trending modalities: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(self.c.errorCode, str(e))

    def _get_trending_modalities(self, db, **filters):
        """
        """
        results = []
        if filters.get('subject'):
            filters['subject'] = filters['subject'].upper()

        today = date.today()
        yesterday = date.today() - timedelta(days=1)
        # Yesterday's top modalities.
        log.info("Search Query 1, Yesterday's top modalities.")
        time_bucket_list = [yesterday.strftime('%Y-%m-%d-day')]
        results = self._get_results(db, time_bucket_list, filters)
        log.info("results ::::: %s" % len(results))
        if results:
            self.message = "Yesterday's top modalities."
            return results

        # Current week top modalities.
        log.info("Search Query 2, Current week top modalities.")
        time_bucket_list = [today.strftime('%Y-%W-week')]
        results = self._get_results(db, time_bucket_list, filters)
        if results:
            self.message = "Current week top modalities."
            return results

        # Last 7 days top modalities.     
        log.info("Search Query 3, Last 7 days top modalities.")
        time_bucket_list = []
        for i in range(7):
            dt = today - timedelta(days=i)
            #dt_str = "%s-%s-%s-day" % (dt.year, dt.month, dt.day)
            dt_str = dt.strftime('%Y-%m-%d-day')
            time_bucket_list.append(dt_str)
        results = self._get_results(db, time_bucket_list, filters)
        if results:
            self.message = "Last 7 days top modalities."
            return results

        # Last 2 weeks top modalities. 
        log.info("Search Query 4, Last 2 weeks top modalities.")
        time_bucket_list = []
        for i in range(14):
            dt = today - timedelta(days=i)
            #dt_str = "%s-%s-%s-day" % (dt.year, dt.month, dt.day)                
            dt_str = dt.strftime('%Y-%m-%d-day')
            time_bucket_list.append(dt_str)
        results = self._get_results(db, time_bucket_list, filters)
        if results:
            self.message = "Last 2 weeks top modalities."
            return results

        # Last 30 days top modalities.
        log.info("Search Query 5, Last 30 days top modalities.")
        time_bucket_list = []
        for i in range(30):
            dt = today - timedelta(days=i)
            #dt_str = "%s-%s-%s-day" % (dt.year, dt.month, dt.day)                
            dt_str = dt.strftime('%Y-%m-%d-day')
            time_bucket_list.append(dt_str)
        results = self._get_results(db, time_bucket_list, filters)
        if results:
            self.message = "Last 30 days top modalities."
            return results

        if filters.has_key('state'):
            del filters['state']
        # Last 14 days top modalities without state/region.
        log.info("Search Query 6, Last 14 days top modalities without state/region.")
        time_bucket_list = []
        for i in range(14):
            dt = today - timedelta(days=i)
            #dt_str = "%s-%s-%s-day" % (dt.year, dt.month, dt.day)                
            dt_str = dt.strftime('%Y-%m-%d-day')
            time_bucket_list.append(dt_str)
        results = self._get_results(db, time_bucket_list, filters)
        if results:
            self.message = "Last 14 days top modalities without state/region."
            return results

        if filters.has_key('country'):
            del filters['country']
        # Yesterdays global modalities.
        log.info("Search Query 7, Yesterdays global modalities.")
        y_dt_str = yesterday.strftime('%Y-%m-%d-day')
        time_bucket_list = [y_dt_str]
        results = self._get_results(db, time_bucket_list, filters, all_results=True)
        self.message = "Yesterdays global modalities."
        # Get the recent modalities
        if not results:
            results = self._get_recent_modalities( db, filters)
        return results
        
    def _get_results(self, db, time_bucket_list, filters, all_results=False):
        """
        """
        main_filters = {"time_bucket": {"$in" : time_bucket_list}}
        main_filters.update(filters)        
    	log.info("main_filters :%s" % main_filters)
    	log.info("Modality Count 1: %s" % len(self.modalities))
    	log.info("Processing 100 records")
        has_modalities = self._filter_modalities(db, main_filters, limit=100)
        if has_modalities and len(self.modalities) < self.page_size:
            log.info("Modality Count 2: %s" % len(self.modalities))
            log.info("Processing all records")
            has_modalities = self._filter_modalities(db, main_filters, limit=-1)
            log.info("Modality Count 3: %s" % len(self.modalities))
                	
        if all_results:
            return self.modalities
                         
        if len(self.modalities) >= self.page_size:
            return self.modalities
            
        return []
    
    def _get_recent_modalities(self, db, filters):
        """
        """
        log.info("In _get_recent_modalities")
        new_filters = {}
        for filter_key in ['modality_type', 'branch']:            
            if filters.has_key(filter_key):
                new_filters[filter_key] = filters[filter_key]
        log.info("new_filters:[%s]" % new_filters)
        results = db.ModalityAggregate.find(new_filters).sort('timestamp',-1).limit(10)        
        modalities = []
        for result in results:
            del result['_id']
            del result['time_bucket']
            modalities.append(result)
        log.info("Modalities Count :%s" %len(modalities))
        for modality in modalities:
            log.info("modality:%s" % modality)
            artifact_id = modality['artifactID']
            if artifact_id not in self.artifacts:
                self.artifacts.add(artifact_id)
                arft_info = self._get_artifact_info(artifact_id)
                modality.update(arft_info)           
                if self.ck12_only:
                    if modality.get('creatorID') == self.ck12_creator_id:
                        self.modalities.append(modality)                            
                else:
                    self.modalities.append(modality)        
                if len(self.modalities) >= self.page_size:
                    break
        return self.modalities

    def _filter_modalities(self, db, main_filters, limit):
        """
        """
        if limit == -1:
            #results = db.ModalityAggregate.find(main_filters).sort('count', -1)
            results = db.ModalityAggregate.find(main_filters).hint('branch_1_time_bucket_1_modality_type_1_country_1_state_1').sort('count', -1)
        else:
            #results = db.ModalityAggregate.find(main_filters).sort('count', -1).limit(limit)
            results = db.ModalityAggregate.find(main_filters).hint('branch_1_time_bucket_1_modality_type_1_country_1_state_1').sort('count', -1).limit(limit)
        
        modalities = []
        for result in results:
            del result['_id']
            del result['time_bucket']
            modalities.append(result)
        log.info("Modalities Count :%s" %len(modalities))
        for modality in modalities:
            log.info("modality:%s" % modality)
            artifact_id = modality['artifactID']
            if artifact_id not in self.artifacts:
                self.artifacts.add(artifact_id)
                arft_info = self._get_artifact_info(artifact_id)
                modality.update(arft_info)           
                if self.ck12_only:
                    if modality.get('creatorID') == self.ck12_creator_id:
                        self.modalities.append(modality)                            
                else:
                    self.modalities.append(modality)        
                if len(self.modalities) >= self.page_size:
                    break
                    
        has_modalities = True if len(modalities) else False
        return has_modalities
        
    def _get_artifact_info(self, artifact_id):
        """
        """
        artifact_info = dict()
        try:
            url = '%s/%s' % (self.artifact_url, artifact_id)        
            resp = urllib.urlopen(url)
            data = resp.read()
            jdata = json.loads(data)
            artifact_info = jdata['response']['artifact']
            return artifact_info
        except Exception as e:
            log.info("Error in getting artifact info artifactID:%s, Error:%s" % (artifact_id, str(e)))
        return artifact_info
        
    def _get_replace_modalities(self, branches, modality_types, unpublish_count):
        """
        """
        replace_modalities = []
        try:
            filter_query = ''
            if modality_types:
                modality_types = modality_types.lower()            
            else:
                modality_types = 'lesson'
            # Prepare the branch filters
            branch_filters = []
            if branches:
                sub_branch_info = {}
                branches = branches.upper()
                branches = branches.split(',')
                for branch in branches:
                    sub_info = branch_subject_mapping.get(branch)
                    if sub_info:
                        branch_name, subject_name = sub_info
                        sub_branch_info.setdefault(subject_name, set()).add(branch_name)                    
                for sub in sub_branch_info:
                    brs = sub_branch_info[sub]
                    sub_filter_str = 'subjects.ext,%s' % sub                
                    branch_filters.append(sub_filter_str)                
                    filter_strs = map(lambda x:'subjects.ext,%s' % x.replace(' ', '+'), brs)
                    branch_filters.extend(filter_strs)            
            if branch_filters:
                filter_query = 'filters=%s' % (';'.join(branch_filters))
                
            # Build Search parametrs
            search_params = self.search_params
            if filter_query:
                search_params = '%s&%s' % (search_params, filter_query)
            if self.ck12_only:
                search_params = '%s&ck12only=true' % (search_params)

            # Build the search API and call it
            api = '%s/flx/search/direct/modality/minimal/%s/?%s' % (self.web_prefix, modality_types, search_params)
            log.info("Calling the search api: [%s]" % api)
            resp = urllib.urlopen(api)
            data = resp.read()
            jdata = json.loads(data)
            results = jdata['response']['Artifacts']['result']
            
            # Fetch the artifacts from search results        
            replace_modalities = []
            for result in results:
                try:
                    arft_id = int(result['id'])
                    if arft_id in self.artifacts:
                        continue
                    arft_info = self._get_artifact_info(arft_id)
                    arft_info['replacedModality'] = True
                    replace_modalities.append(arft_info)
                    unpublish_count -= 1
                    if not unpublish_count:
                        log.info("All unpublished modalities are replaced")
                        break
                except Exception as ex:
                    log.info("Error in processing search result. Error: [%s]" % str(ex))
            log.info("Replace Modalities Count:%s" % len(replace_modalities))
        except Exception as ex:
            log.info("Error in processing replacement modalities. Error: [%s]" % str(ex))        
        return replace_modalities
