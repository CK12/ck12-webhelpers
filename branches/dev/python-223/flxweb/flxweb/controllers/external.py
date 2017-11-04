# -*- coding: utf-8 -*-
#
# Copyright 2007-2011 CK-12 Foundation
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
#$Id: landing.py 23931 2013-01-08 23:06:27Z ravi $

from pylons import tmpl_context as c, request, config
from pylons.templating import render_jinja2
from flxweb.lib.base import BaseController
from pylons.controllers.util import abort
import logging
import urlparse
import re

log = logging.getLogger(__name__)

class ExternalController(BaseController):
    """
    Controller for the handling external links.
    """

    def __init__(self):
        BaseController.__init__(self)
        self.whitelist_file = config.get('external_links_whitelist' )

    
    def __is_safe(self,url):
        '''
        checks to see if the URL is safe by comparing
        it against the whitelist
        '''
        safe = False
        # Read the whitelist. Yes we do it everytime,
        # since the whitelist might change at runtime.
        if self.whitelist_file and url:
            # get the netloc i.e the domain part of the url
            try: 
                # read the whilte list file
                with open(self.whitelist_file, 'r') as inF:
                    for line in inF:
                        line = line.rstrip('\n')
                        regex = re.compile(line,re.I)
                        if regex.search(url):
                            safe = True
                            break
            except Exception,e:
                log.exception(e)
        return safe                            

    def url(self):
        c.external_url = request.GET.get('url')
        if not c.external_url:
            if hasattr(request, 'url'):
                self._custom404(request.url)
            else:
                abort(404)

        #Make sure the external_url is from the whitelist file
        c.url_safe = self.__is_safe(c.external_url)

        if not urlparse.urlparse(c.external_url).scheme:
            c.external_url = "http://%s" % c.external_url

        return render_jinja2 ("/external/link.html")
