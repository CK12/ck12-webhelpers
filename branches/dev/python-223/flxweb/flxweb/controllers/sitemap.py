# -*- coding: utf-8 -*-
#
# Copyright 2007-2012 CK-12 Foundation
#
# All rights reserved
#      
#
# Unless required by applicable law or agreed to in writing, software
# distributed under this License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
# implied.  See the License for the specific language governing
# permissions and limitations.
#
# This file originally written by Ravi Gidwani
#
# $Id$

from pylons import tmpl_context as c,response
from pylons.templating import render_jinja2
from flxweb.lib.base import BaseController
from flxweb.model.browseTerm import BrowseManager
from flxweb.lib.ck12.decorators import ck12_cache_region

import logging

log = logging.getLogger(__name__)

class SitemapController(BaseController):

    """
    Controller for serving the sitemap in xml format 
    """

    def index(self):
        """
        Serves the static sitemapindex.
        """
        response.headers['Content-type'] = "application/xml;charset=utf-8"
        return render_jinja2("/sitemap/sitemapindex.xml")

    def static(self):
        """
        Serves the static sitemap. This sitemap has been hand crafted.
        """
        response.headers['Content-type'] = "application/xml;charset=utf-8" 
        return render_jinja2 ('/sitemap/static_sitemap.xml')

    def sgSiteMap(self):
        """
        Serves the static sitemapindex.
        """
        response.headers['Content-type'] = "application/xml;charset=utf-8"
        return render_jinja2("/sitemap/sitemap-studyguides.xml")

    def plixSiteMap(self):
        """
        Serves the PLIX sitemap.xml file after caching it.
        """
        response.headers['Content-type'] = "application/xml;charset=utf-8" 
        return self.__getPLIXSitemap()

    @ck12_cache_region('daily')
    def __getPLIXSitemap(self):
        try:
            import urllib2
            url = "http://interactives.ck12.org/plix/sitemap.xml"
            log.debug("Getting plix sitemap: %s" % url)
            resp = urllib2.urlopen(url)
            xml = resp.read()
            log.debug("Retreived. Content-length: %d" % len(xml))
            return xml
        except Exception, e:
            log.error("Error fetching plix sitemap. [%s]" % str(e), exc_info=e)
            return ""
   
    def xml(self):
        """
        Generates a sitemap dynamically using the browse concept list
        """
        c.concepts = [] 
        c.root_node = BrowseManager.getConceptGrid()

        if c.root_node:
            if 'children' in c.root_node:
                for c.subject in c.root_node['children']:
                    if 'children' in c.subject:
                        for c.branch in c.subject['children']:
                            if 'children' in c.branch:
                                for topic in c.branch['children']:
                                    encoded_id = topic['encodedID']
                                    concepts = BrowseManager.getArtifactsByBrowseTerm('lesson',
                                                                                        encoded_id,
                                                                                        1,
                                                                                        1000)
                                    if concepts:
                                        c.concepts.extend(concepts)
        response.headers['Content-type'] = "application/xml;charset=utf-8" 
        return render_jinja2 ('/sitemap/sitemap.xml')

