import random

from flx.tests import *
from flx.lib import helpers as h
from flx.lib.search import solrclient
from flx.model import api, meta

import logging
log = logging.getLogger(__name__)

class TestSolr(TestController):

    def test_searchComplex(self):
        log.info("Calling select directly on solr connection")
        solr = solrclient.SolrClient()
        try:
            solr.connect()
            #hits = solr.select(q='standards.ext:us.ca.9.*', fields=['standards', 'title', 'summary'], highlight=['standards'], score=True)
            term = 'relativity'
            hits = solr.select(q='browseTerms.ext:relativity OR title:relativity OR summary:relativity', fields=['domains', 'subjects', 'title', 'summary'], highlight=['domains', 'subjects', 'title', 'summary'], score=True)
            assert hits is not None and len(hits) > 0
            for hit in hits:
                #print hit['domains'], hit['title'], hit['summary']
                assert hit
                assert hit['__hl__']
                bts = ",".join(hit['domains']) + ",".join(hit['subjects'])
                cont = hit['title'] + "," + hit['summary']
                assert term in bts or 'relat' in cont or 'Relat' in cont
        finally:
            solr.disconnect()

    def test_searchSimple(self):
        solr = solrclient.SolrClient()
        hits = solr.search('title:newton^5 summary:newton')
        assert hits
        for hit in hits:
            assert 'newton' in hit['title'].lower() or 'newton' in hit['summary'].lower()

    def test_deleteIndex(self):
        solr = solrclient.SolrClient()
        ids = []
        hits = solr.search('sid:*')
        assert hits
        for hit in hits:
            ids.append(hit['sid'])
        log.info("Found total hits: %d" % len(ids))
        if ids:
            try:
                solr.startTransaction()
                solr.deleteIndex(artifactIDs=ids)
                #solr.commit()
                assert True
            except:
                solr.rollback()
                assert False

