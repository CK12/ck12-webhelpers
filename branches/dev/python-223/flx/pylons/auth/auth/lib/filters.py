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
# This file originally written by Viraj Kanwade
#
# $Id$

try: 
    import simplejson as json
    json
except ImportError: 
    import json
    
import logging
import re

from pylons import config

log = logging.getLogger(__name__)

def ck12_image_thumbnail_size(image_uri, size):
    if image_uri and image_uri[:4].lower() != 'http' and size:
        s = '/flx/show/thumb_%s/image' % size
        image_uri = image_uri.replace('/flx/show/image', s)

    return image_uri

def ck12_json( object ):
    try:
        if object:
            return json.dumps(object)
        else:
            return object
    except Exception,e:
        log.exception(e)
        return object


def ck12_optimizely_enabled(path):
    """
    Filter to test if optimizely should be enabled for the passed url 
    """
    if config['optimizely_enabled'] == "1":
        include_regex = config['optimizely_include_regex'].split(';')
        # remove empty strings
        include_regex = filter(None, include_regex)
        exclude_regex = config['optimizely_exclude_regex'].split(';')
        exclude_regex = filter(None, exclude_regex)
        matched_include = any (re.match(regex,path) for regex in include_regex)
        matched_exclude = any (re.match(regex,path) for regex in exclude_regex)
        return (matched_include and not matched_exclude)
    return False

