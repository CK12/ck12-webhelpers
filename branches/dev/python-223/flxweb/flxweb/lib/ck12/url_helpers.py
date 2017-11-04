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
# $Id$

from pylons import config
#from beaker.cache import cache_region
#import random

#@cache_region('forever', 'cdn_url')
def url_cdn(url,cdn_locations,version=False):
    ret_url = url
    cdn_enabled = config.get('cdn_enabled')
    if cdn_enabled.rstrip().strip() == "true":
        if cdn_locations:
            cdn_locations = cdn_locations.split(',')
            cdn_locations = [cdn_location.strip().rstrip() for cdn_location in cdn_locations ]
            idxrandom = len(url) % len(cdn_locations)
            #idxrandom = int(random.random()*len(cdn_locations))
            cdn_location_url = cdn_locations[idxrandom]
            ret_url = "%s%s" % (cdn_location_url, url)
    # make the url build number specific.
    # this will make sure the css/js are not cached accross builds
    if version:
        version = config.get('build_minor_version') 
        ret_url = '%s?v=%s' % (ret_url,version)
    return ret_url

def url_js(url,version=False):
    url_js_prefix = config.get('url_js')
    url = '%s%s' % (url_js_prefix, url)
    cdn_locations = config.get('static_cdn_locations')
    url = url_cdn(url,cdn_locations,version)
    return url

def url_css(url,version=False):
    url_css_prefix = config.get('url_css')
    url = '%s%s' % (url_css_prefix, url)
    cdn_locations = config.get('static_cdn_locations')
    url = url_cdn(url,cdn_locations,version)
    return url

def url_images(url,version=False):
    url_img_prefix = config.get('url_images')
    url = '%s%s' % (url_img_prefix, url)
    cdn_locations = config.get('img_cdn_locations')
    url = url_cdn(url,cdn_locations,version)
    return url

def url_lib(url,version=False):
    url_lib_prefix = config.get('url_lib')
    url = '%s%s' % (url_lib_prefix, url)
    cdn_locations = config.get('static_cdn_locations')
    url = url_cdn(url,cdn_locations,version)
    return url

def url_assessment(url, version=False):
    url_assessment_prefix = config.get('assessment_base_url')
    url = '%s%s' % (url_assessment_prefix, url)
    #cdn_locations = config.get('static_cdn_locations')
    #url = url_cdn(url, cdn_locations, version)
    return url

def asset_url(url,cdn_locations):
    media_url = config.get('url_media')
    url = '%s/%s' % (media_url, url)
    url = url_cdn(url,cdn_locations)
    return url

def asset_js(url):
    return asset_url(url,config.get('static_cdn_locations'))

def asset_css(url):
    return asset_url(url,config.get('static_cdn_locations'))

def asset_lib(url):
    return asset_url(url,config.get('static_cdn_locations'))

def asset_image(url):
    return asset_url(url,config.get('img_cdn_locations'))

