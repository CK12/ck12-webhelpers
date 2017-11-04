from pyramid.view import view_config

#from dexter.models import detect_eids
from dexter.lib import helpers as h
from dexter.views.decorators import jsonify
from dexter.views.errorCodes import ErrorCodes
from dexter.views.common import AssessCommon as common
from dexter.views.base import BaseView
#from dexter.lib.remoteapi import RemoteAPI as remotecall

import os
import glob
import re
import codecs
from BeautifulSoup import BeautifulStoneSoup, BeautifulSoup
from urllib import quote
from urlparse import urlparse, urlunparse

#from sklearn.feature_extraction.text import CountVectorizer
#from sklearn.feature_extraction.text import TfidfTransformer
#from sklearn.metrics.pairwise import linear_kernel

from dexter.lib.remoteapi import RemoteAPI

import logging
log = logging.getLogger(__name__)

payload_dir = '/opt/concept_lessons_4/'
payload_files = payload_dir + '/' + '*.txt'
api_server_url = 'http://gamma.ck12.org'
api_end_point = 'flx/get/info/'
api_server_url = 'http://www.ck12.org'
api_end_point = 'taxonomy/get/info/concept/'
htmlpath = '/tmp/related.html'
branch_dict = {'bio': 'biology',
               'phy': 'physics',
               'che': 'chemistry',
               'psc': 'physical-science',
               'lsc': 'life-science',
               'esc': 'earth-science'}

tagExp = re.compile(r'<.*?>')
spaceExp = re.compile(r'\s+')
def xhtml_to_text(xhtmlClean):
    text = None
    if xhtmlClean:
        xhtmlClean = unicode(BeautifulStoneSoup(xhtmlClean, convertEntities=BeautifulStoneSoup.ALL_ENTITIES))
        xhtmlClean = spaceExp.sub(u' ', xhtmlClean)
        xhtmlClean = tagExp.sub(u'', xhtmlClean)
        text = xhtmlClean.strip()
    return text

def run(data_set):
    log.info('In run method')
    from sklearn.feature_extraction.text import CountVectorizer
    from sklearn.feature_extraction.text import TfidfTransformer
    from sklearn.metrics.pairwise import linear_kernel
    #from sklearn.externals import joblib
    log.info('After the imports')

    #print 'Size of data set: [%s]' %(data_set_len)

    vectorizer = CountVectorizer(stop_words='english')
    log.info('Before fit_transform')
    trainVectorizerArray = vectorizer.fit_transform(data_set).toarray()

    transformer = TfidfTransformer()

    log.info('Before computing tfidf fit_transform')
    tfidf =  transformer.fit_transform(trainVectorizerArray).toarray()
    #print 'TF-IFD Matrix'
    #print tfidf
    #print '-'*100
    similarArtifacts = {}
    #print 'Done generating TFIDF matrix'
    log.info('Before linear_kernel')
    cosine_similarities = linear_kernel(tfidf[0:1], tfidf).flatten()
    related_content_indices = cosine_similarities.argsort()[-10:]
    cosine_distances = cosine_similarities[related_content_indices][:-1]
    log.info(cosine_distances)
    #print cosine_distances
    return related_content_indices, cosine_distances


def get_concepts_info(eids):
    global api_end_point
    global api_server_url

    remoteAPI = RemoteAPI()
    concept_info = []
    for eid in eids:
        api = api_end_point + str(eid)
        response = remoteAPI._makeCall(api, api_server_url, 30)
        concept_title  = response['response']['name']
        concept_branch = response['response']['branch']['name']
        concept_info.append({'name':concept_title, 'branch':concept_branch, 'eid':eid})
    return concept_info

def main(xhtml):
    data_set = []
    file_paths = glob.glob(payload_files)

    for each_file in file_paths:
        with open(each_file) as fd:
            content = fd.read()
        data_set.append(content)

    xhtml_text = xhtml_to_text(xhtml)
    file_paths.insert(0, 'this.txt')
    data_set.insert(0, xhtml_text)
    #print data_set[0]
    log.info('Before running main')
    related_content_indices, cosine_distances = run(data_set)
    eids = []
    for i, each_related_content in enumerate(related_content_indices[-3:-1]):
        filename = os.path.basename(file_paths[each_related_content])
        relatedEncodedID = ".".join(filename.split('_')[1].split('.')[:-1])
        eids.append(relatedEncodedID)
    eids = list(reversed(eids))
    cosine_distances = list(reversed(cosine_distances))
    eid_cosine_distance = {}
    for i, eid in enumerate(eids):
        if eid not in eid_cosine_distance:
            eid_cosine_distance[eid] = cosine_distances[i]
    log.info(eid_cosine_distance)
    concepts_info =  get_concepts_info(eid_cosine_distance.keys())
    for i, eid in enumerate(concepts_info):
        #eid.update({'similarity_measure':'%.2f%%' %(eid_cosine_distance[eid['eid']]*100)})
        eid.update({'similarity_measure_numeric':eid_cosine_distance[eid['eid']]*100, 'similarity_measure':'%.2f%%' %(eid_cosine_distance[eid['eid']]*100)})

    concepts_info = sorted(concepts_info, key=lambda k: k['similarity_measure_numeric'], reverse=True)
    concepts_info = [x for x in concepts_info]
    log.info(concepts_info)
    return concepts_info[:3]


class DetectEIDs(BaseView):
    def __init__(self, context, request):
        BaseView.__init__(self, context, request)
        self.working_dir = '/tmp/dexter'
        self.config = h.load_config()

    @view_config(route_name='detect_eids')
    @jsonify
    @h.trace
    def detect_eids(self):
        try:
            request = self.request
            result = common.getResponseTemplate(ErrorCodes.OK, 0)
            params = request.POST

            log.info('request headers: [%s]' %(request.response.headerlist))
            request.response.headerlist.extend((
                ('Access-Control-Allow-Origin', '*'),
                ('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'),
                ('Access-Control-Allow-Credentials', 'true'),
            ))

            log.info('params: %s' %(params))
            xhtml = params['xhtml']
            url = params.get('url', '')

            log.info('Cleaning up URL: [%s]' %(url))
            parts = urlparse(url)
            parts = parts._asdict().values()
            parts[0] = ''
            url = urlunparse(parts)

            if not url:
                raise Exception('URL not specified')
            url_eid_mapping = request.db.DetectConcepts.find_one({'url':url})
            if url_eid_mapping:
                log.info('Cache hit! Already processed this url: [%s]' %(url))
                eids = url_eid_mapping.get('eids')
            else:
                log.info(xhtml)
                eids = main(xhtml)
                request.db.DetectConcepts.insert({'url':url, 'eids':eids})
            log.info(eids)

            result['response'] = eids
            return result
        except Exception,e:
            if not hasattr(self.c,'errorCode'):
                self.c.errorCode = ErrorCodes.CANNOT_AGGREGATE
            log.error('top5concepts: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(self.c.errorCode, str(e))
