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
# This file originally written by Nachiket Karve
#
# $Id: url_helpers.py 12422 2011-08-19 22:51:58Z ravi $

from pylons import config
from beaker.cache import cache_region
import random

#@cache_region('short_term', 'cdn_url')
def url_cdn(url):
    cdn_enabled = config.get('cdn_enabled')
    if cdn_enabled and cdn_enabled.rstrip().strip() == "true":
        cdn_locations = config.get('cdn_locations')
        if cdn_locations:
            cdn_locations = cdn_locations.split(',')
            cdn_locations = [cdn_location.strip().rstrip() for cdn_location in cdn_locations ]
            idxrandom = int(random.random()*len(cdn_locations))
            cdn_location_url = cdn_locations[idxrandom]
            url = "%s%s" % (cdn_location_url, url)
    return url

def url_js(url):
    url_js_prefix = config.get('url_js')
    url = '%s%s' % (url_js_prefix, url)
    url = url_cdn(url)
    return url

def url_css(url):
    url_css_prefix = config.get('url_css')
    url = '%s%s' % (url_css_prefix, url)
    url = url_cdn(url)
    return url

def url_images(url):
    url_img_prefix = config.get('url_images')
    url = '%s%s' % (url_img_prefix, url)
    url = url_cdn(url)
    return url

def url_lib(url):
    url_lib_prefix = config.get('url_lib')
    url = '%s%s' % (url_lib_prefix, url)
    url = url_cdn(url)
    return url
