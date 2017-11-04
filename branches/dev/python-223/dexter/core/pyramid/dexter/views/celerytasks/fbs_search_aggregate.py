import re
import traceback
import logging
from datetime import datetime, timedelta
import inflect
import re
from urllib2 import unquote
from urllib import quote

from celery import task
from dexter.views.celerytasks.generictask import GenericTask
from dexter.lib.remoteapi import RemoteAPI as remotecall
from dexter.models import iplocation

artifact_types = ['lesson', 'section', 'book', 'tebook', 'workbook', 'labkit', 'quizbook', 'domain', 'rwa', 'lecture', 'enrichment', 'worksheet', 'lab', 'preread', 'postread', 'activity', 'cthink', 'prepostread', 'whileread', 'flashcard', 'studyguide', 'practice', 'asmtquiz', 'quiz', 'exerciseint', 'quizdemo', 'conceptmap', 'web', 'image', 'interactive', 'lessonplan', 'handout', 'presentation', 'simulationint', 'simulation', 'flexbook', 'answerkey']

log = logging.getLogger(__name__)

@task(name="tasks.fbs_search_aggregate_task", base=GenericTask)
class FBSSearchAggregateTask(GenericTask):
    """
    Class for FBS Search Aggregation.
    """
    def __init__(self, **kwargs):
        GenericTask.__init__(self)
        self.singleInstance = True
        # Regular expression to filter EIDs
        self.eid_pat = re.compile('[a-zA-Z]{3,3}\.[a-zA-Z]{3,3}\.\d{3,3}', re.IGNORECASE)

    def run(self, **kwargs):
        GenericTask.run(self, **kwargs)
        try:
            self.search_score_api_server = None
            self.search_score_api_path = None
            event_type = self.db.EventTypes.find_one({'eventType': 'FBS_SEARCH'})
            if event_type:
                if event_type.get('search_score_api_server'):
                    self.search_score_api_server = event_type.get('search_score_api_server')
                if event_type.get('search_score_api_path'):
                    self.search_score_api_path = event_type.get('search_score_api_path')

            # Get the searches for the previous hour
            prev_time = datetime.now() - timedelta(hours=1)
            hour_time_bucket = prev_time.strftime('%Y-%m-%d %H-hour')
            log.info('Processing search queries for hour time bucket: [%s]', hour_time_bucket)
            searches = self.db.Events.find({'eventType':'FBS_SEARCH', "time_bucket": hour_time_bucket})
            inserted_count = 0
            skipped_count = 0
            search_terms_skipped = []
            for search in searches:
                search_payload = search.get("payload", {})
                retry = search_payload.get("retry")
                if retry and str(retry).lower() == "true":
                    skipped_count += 1
                    log.info("Skipping record as payload contains retry set to true")
                    continue 

                search_term = search_payload.get("searchTerm")
                if search_term:
                    log.info('Analyzing search term: [%s]', str(search_term.encode('utf-8')))
                    search_term = self.clean_search_term(search_term)
                    log.info("Cleaned search term:%s", str(search_term.encode('utf-8')))
                    if not search_term:
                        search_terms_skipped.append(search_payload.get("searchTerm"))
                        skipped_count += 1
                        continue
                    client_ip = search_payload.get("client_ip")
                    if not client_ip:
                        skipped_count += 1
                        continue
                    ip_info = iplocation.IPLocation(self.db).get_location(ip_address=client_ip)
                    country, state, city, zipcode, isp = [ip_info.get(x, 'unknown') for x in ['country_long', 'region', 'city', 'zipcode', 'isp']]
                    search_time_bucket = search.get('time_bucket')
                    search_aggregation =  {'searchTerm':search_term, \
                                           'country': country, \
                                           'state': state, \
                                           'city':city, \
                                           'zipcode':zipcode, \
                                           'isp': isp, \
                                           'time_bucket': search_time_bucket, \
                                           'created_time': datetime.now()}
                    id = self.db.SearchAggregate.insert(search_aggregation)
                    log.info("Insreted record in SearchAggregate, %s", id)
                    inserted_count += 1
                else:
                    skipped_count += 1

            log.info("Search Terms Skipped : %s", search_terms_skipped)
            log.info("Skipped Records Count : %s", skipped_count)
            log.info("Inserted Records Count : %s", inserted_count)
        except Exception as e:
            log.error('Error enountered while running FBSSearchAggregator: %s' %(str(e)))
            log.error(traceback.format_exc())
        log.info('Done running FBSSearchAggregator celery-beat with taskID: %s' %(self.taskID))


    def consice_search_term(self, search_term):
        """Remove space and dash characters from serach term.
        """
        for ch in [ ' ', '-']:
            search_term = search_term.replace(ch, '')
        return search_term

    def get_search_score(self, search_term):
        """Returns search term score from SearchScores collection.
        """
        search_term = unicode(search_term).encode('utf-8')
        search_score = self.db.SearchScores.find_one({'search_term': search_term})
        if not search_score:
            try:
                api_server = self.search_score_api_server
                api_path =  self.search_score_api_path %(quote(search_term))
                params_dict = {'pageNum':1, 'specialSearch':'false', 'filters':'false', 'ck12only':'false', 'pageSize':1}
                api_response = remotecall.makeRemoteCall(api_path, api_server, params_dict=params_dict)
                if api_response['response']['Artifacts']['total'] <= 0:
                    score = -1
                else:
                    score = api_response['response']['Artifacts']['result'][0]['score']
            except Exception as e:
                log.error("Unable to get_search_score. Exception: [%s]" %(e))
                log.error(traceback.format_exc())
                score = 0
            self.db.SearchScores.insert({'search_term':search_term, 'score':score})
        else:
            log.info('Found score in SearchScores: [%s]', search_score)
            score = search_score['score']
        log.info('Search score: %s', score)
        return score

    def get_singular(self, word):
        p = inflect.engine()
        try:
            singular_word = p.singular_noun(word)
        except:
            singular_word = ''
        if not singular_word:
            singular_word = word
        return singular_word

    def clean_search_term(self, search_term):

        search_term = unquote(search_term).strip().lower()

        # Skip if the search term is EID
        if self.eid_pat.match(search_term):
            return ''

        # Strip of special search tags
        special_searches = ['author', 'tag', 'subject', 'domain', 'grade']
        for special_search in special_searches:
            search_term = re.sub('^%s:' %(special_search), '', search_term)

        # Strip search term if it only consists of numbers, period, and hyphen
        search_term = re.sub('^[0-9.\-]*$', '', search_term)

        # Filter out search term if the search term is an artifact type
        concised_search_term = self.consice_search_term(search_term)
        if len(search_term.split()) <= 2:
            if self.get_singular(search_term) in artifact_types:
                return ''
            if self.get_singular(concised_search_term) in artifact_types:
                return ''

        # Filter out search term if the solr score is less than 0.3
        search_score = self.get_search_score(search_term)
        if search_score <= 0.3:
            search_term = ''

        # Remove special characters in the search term
        for ch in [ '!', '"', '+']:
            search_term = search_term.replace(ch, '')

        # After filtering if the search term is less than 2 characters then filter it out
        if len(search_term) <= 2:
            search_term = ''

        return search_term
