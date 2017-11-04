# -*- coding: utf-8 -*-

from flx.tests import *
from flx.model import meta
from flx.model import api
from routes import url_for
import re
import os
import logging
import json
import time
import random

log = logging.getLogger(__name__)

INDEX_CREATED = False

class TestSearchController(TestController):

    def _createIndex(self):
        global INDEX_CREATED
        if INDEX_CREATED:
            return

        artifactIDs = ""
        for id in range(1, 464):
            if artifactIDs:
                artifactIDs += ","
            artifactIDs += str(id)
        print "Creating index for %s" % artifactIDs 
        response = self.app.post(url(controller='search', action='reindex'), params = { 'artifactIDs': artifactIDs, 'waitFor': True, 'force': True}, headers={'Cookie': self.getLoginCookie(1)})
        jr = json.loads(response.normal_body)
        #self.__waitForTask(jr['response']['taskID'])

    def test_reindex(self):
        artifactIDs = ""
        for id in range(1, 10):
            if id > 1:
                artifactIDs += ","
            artifactIDs += str(id)
        response = self.app.post(url(controller='search', action='reindex'), params = { 'artifactIDs': artifactIDs, 'waitFor': True, 'force': True}, headers={'Cookie': self.getLoginCookie(1)})
        print response
        assert '"status": 0' in response, "Failed reindex"
        assert '"ERROR:' not in response, "One or more artifacts could not be reindexed"

    def _test_index(self):
        response = self.app.post(url(controller='search', action='createIndex'), params = {'metadataOnly': True, 'waitFor': True}, headers={'Cookie': self.getLoginCookie(1)})
        print response
        assert '"status": 0' in response, "Failed to create index"
        assert '"ERROR:' not in response, "One or more artifacts could not be indexed"

    def test_deleteIndex(self):
        response = self.app.post(url(controller='search', action='deleteIndex'), params = {'artifactIDs': "1,2", 'waitFor': True}, headers={'Cookie': self.getLoginCookie(1)})
        self.app.post(url(controller='search', action='reindex'), params = {'artifactIDs': "1,2", 'waitFor': True}, headers={'Cookie': self.getLoginCookie(1)})
        print response
        assert '"status": 0' in response, "Failed to delete index"
        assert '"ERROR:' not in response, "One or more artifacts could not be deleted from index"

    def test_checkStatus(self):
        artifactIDs = ""
        for id in range(1, 10):
            if id > 1:
                artifactIDs += ","
            artifactIDs += str(id)
        response = self.app.post(url(controller='search', action='reindex'), params = { 'artifactIDs': artifactIDs, 'waitFor': False}, headers={'Cookie': self.getLoginCookie(1)})
        print response
        assert '"status": 0' in response, "Failed reindex"
        assert '"ERROR:' not in response, "One or more artifacts could not be reindexed"

        ret = json.loads(response.normal_body)
        assert ret['response']['taskID']
        taskID = ret['response']['taskID']
        print 'taskID: %s' % taskID
        attempts = 0
        while True:
            response = self.app.get(url(controller='task', action='getStatus', taskID=taskID), headers={'Cookie': self.getLoginCookie(1)})
            assert response
            print response
            j = json.loads(response.normal_body)
            if j['response']['status'] in ['PENDING', 'IN PROGRESS', 'SUCCESS']:
                assert True
                return

            attempts += 1
            if attempts > 10:
                assert False, "Timeout expired"
                break
            time.sleep(5)

    def _test_searchVisual(self):
        response = self.app.get(url(controller='search', action='searchVisual', terms='cell,oxygen'), params = {'pageSize': 10})
        print response
        assert '"status": 0' in response, "Failed to get visual search results"
        assert '"total": 0' not in response, "Got 0 results"
        assert '<em>' in response and '</em>' in response and '__hl__' in response
        assert '"offset": 0' in response

        response = self.app.get(url(controller='search', action='searchVisual', terms='newton'), params = {'pageSize': 10})
        print response
        assert '"status": 0' in response, "Failed to get visual search results"
        ret = json.loads(response.normal_body)
        assert ret['response']['total'] > 0, "Got 0 results"
        found = False
        for hit in ret['response']['hits']:
            assert hit.has_key('__hl__')
            if hit['__hl__'] and (hit['__hl__'].has_key('textContent') or hit['__hl__'].has_key('title')):
                found = True
        assert found, "Could not find any highlighted text content or title"

        j = json.loads(response.normal_body)
        filters = j['response']['filters']
        assert filters is not None, "No filters returned"
        if filters:
            fld = 'domains.ext'
            assert filters.has_key(fld)
            if filters[fld]:
                filterTerm = filters[fld][0][0]
                filterQuery = '%s,%s' % (fld, filters[fld][0][0])
                print filterTerm, filterQuery
                response = self.app.get(url(controller='search', action='searchVisual', terms='newton'), params={'filters':filterQuery})
                assert '"status": 0' in response, "Error getting filtered response"
                j2 = json.loads(response.normal_body)
                assert j2['response']['limit'] > 0, "Zero rows after filtering"
                for item in j2['response']['hits']:
                    found = False
                    for domain in item['domains']:
                        if domain.lower() == filterTerm.lower():
                            found = True
                            break
                    assert found, "Could not find domain filtered on"

    def _test_searchCustomUnicode(self):
        conceptType = 'concept'
        params = {
            'authors': 'Stephen AuYueng',
            'title': 'ध्रुवीय उपग्रह 任何',
            'handle': 'ध्रुवीय-उपग्रह-任何',
            'summary': 'ध्रुवीय उपग्रह प्रक्षेपण 任何',
            'cover image name': '',
            'cover image description': '',
            'xhtml': 'भारत ने एक ध्रुवीय उपग्रह प्रक्षेपण यान (पीएसएलवी) द्वारा आधुनिक संचार उपग्रह जीसैट-12 को अंतरिक्ष कक्षा में सफलतापूर्वक स्थापित किया। 维基百科是一个内容自由、任何人都能参与、并有多种语言的百科全书协作计划。我们的目标是建立一个完整、准确和中立的百科全书。任何  This is a test only.',
        }
        response = self.app.post(
            url(controller='artifact', action='createArtifact', type=conceptType),
            params=params,
            headers={'Cookie': self.getLoginCookie(3)}
        )
        assert '"status": 0' in response, "Failed creating unicode artifact"
        j = json.loads(response.normal_body)
        assert j['response'], "No info returned"
        id = j['response'][conceptType]['id']

        ## Must publish before searching
        response = self.app.get(
            url(controller='artifact',
                action='publishArtifact',
                id=id,
                member=3),
            headers={'Cookie': self.getLoginCookie(1)}
        )
        assert '"status": 0' in response, "Failed publishing artifact"

        response = self.app.post(url(controller='search', action='reindex'), params = { 'artifactIDs': [id,], 'waitFor': 'true'}, headers={'Cookie': self.getLoginCookie(3)})
        assert '"status": 0' in response, "Failed reindex"

        time.sleep(2)

        response = self.app.get(url('/search/custom') + '/title,summary,authors,textContent/title,authors,textContent/ध्रुवीय उपग्रह', params = {'pageSize': 1})
        print response
        assert '"status": 0' in response, "Failed to get custom search results"
        assert '"total": 0' not in response, "Got 0 results"
        assert '"id":' in response and '"title":' in response and '"summary":' not in response # and 'textContent' in response
        assert '"offset": 0' in response and '"limit": 1' in response

        j = json.loads(response.normal_body)
        assert j['response']['hits']
        for hit in j['response']['hits']:
            assert u'उपग्रह' in hit['title'] and u'ध्रुवीय' in hit['title']
            s = u' '.join(hit['__hl__']['textContent'])
            assert u'उपग्रह' in s and u'ध्रुवीय' in  s

        response = self.app.get(url('/search/custom') + '/title,summary,authors,textContent_cjk/title,authors,textContent_cjk/任何', params = {'pageSize': 1})
        print response
        assert '"status": 0' in response, "Failed to get custom search results"
        assert '"total": 0' not in response, "Got 0 results"
        assert '"id":' in response and '"title":' in response and '"summary":' not in response and 'textContent_cjk' in response
        assert '"offset": 0' in response and '"limit": 1' in response

        j = json.loads(response.normal_body)
        assert j['response']['hits']
        for hit in j['response']['hits']:
            assert u'任何' in hit['title'] 
            s = u' '.join(hit['__hl__']['textContent_cjk'])
            assert u'任何' in s
            s = u' '.join(hit['__hl__']['title'])
            assert u'任何' in s

    def _test_searchCustom(self):
        response = self.app.get(url(controller='search', action='searchCustom', fldsToSearch='title,summary,authors', fldsToReturn='title,authors', terms='physics,atom'), params = {'pageSize': 1})
        print response
        assert '"status": 0' in response, "Failed to get custom search results"
        assert '"total": 0' not in response, "Got 0 results"
        assert '"id":' in response and '"title":' in response and '"summary":' not in response
        assert '"offset": 0' in response and '"limit": 1' in response

        j = json.loads(response.normal_body)
        filters = j['response']['filters']

        assert filters is not None, "No filters returned"
        if filters:
            fld = 'domains.ext'
            assert filters.has_key(fld)
            if filters[fld]:
                filterTerm = filters[fld][0][0]
                filterQuery = '%s,%s' % (fld, filters[fld][0][0])
                print filterTerm, filterQuery
                response = self.app.get(url(controller='search', action='searchCustom', fldsToSearch='title,summary,authors', fldsToReturn='title,authors', terms='physics,atom'), params={'filters':filterQuery})
                assert '"status": 0' in response, "Error getting filtered response"
                j2 = json.loads(response.normal_body)
                assert j2['response']['limit'] > 0, "Zero rows after filtering"
 

    def test_searchParallel(self):
        import threading
        class Searcher(threading.Thread):

            def __init__(self, app):
                threading.Thread.__init__(self)
                self.app = app

            def run(self):
                num = random.random()
                print "Sleeping for %f" % num
                time.sleep(num)
                s = int(time.time() * 1000)
                ## url() not available in thread
                response = self.app.get('/search/artifact/physics')
                assert response
                ts = int(time.time()*1000) - s
                log.info("Time spent for search (ms): %d" % ts)
                print "Time spent for search (ms): %d" % ts
                js = json.loads(response.normal_body)
                assert js['response']['Artifacts']['total'] > 0

        searchers = []
        max = 10
        for i in range(0, max):
            searchers.append(Searcher(self.app))

        for searcher in searchers:
            searcher.start()

        for searcher in searchers:
            searcher.join()

    def _test_searchNeighbors(self):
        self._createIndex()
        response = self.app.get(url(controller='search', action='searchCustom', terms='invertebrates', fldsToSearch='domains,title', 
            fldsToReturn='prereqs,postreqs,prereqTitles,postreqTitles'), 
            params={'pageSize':1})
        print response
        assert '"status": 0' in response, "Failed to get search results"
        assert '"total": 0' not in response, "Returned 0 results"
        assert '"prereqs":' in response
        assert '"postreqs":' in response

