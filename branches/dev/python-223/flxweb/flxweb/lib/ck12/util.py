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
# $Id$
from pylons import config
from flxweb.lib.ck12.ordereddict import OrderedDict
from flxweb.config.routing import make_map
import re
import logging

log = logging.getLogger(__name__)
RE_REMOVE_TAGS = re.compile('<(.*?)>')

def equalsIgnoreCase(string1,string2):
    """
    Does a case insensitive string comparison
    """
    if not string1 or not string2:
        return False
    return string1.lower() == string2.lower()

def to_unicode(obj, encode=False):
    try:
        if not isinstance( obj, basestring):
            obj = unicode(obj)
        if encode:
            obj = obj.encode('utf-8')
    except:
        pass
    return obj

def delimit_by(obj,delimiter):
    """
    Converts the passed list obj into a string
    delimited by the passed limiter.
    """
    if type(obj) == list:
        if not delimiter:
            delimiter = ','
        return delimiter.join(obj)
    elif isinstance(obj,basestring):
        return obj


def getUSStatesList():
    states = {
        'AK': 'Alaska',
        'AL': 'Alabama',
        'AR': 'Arkansas',
        'AS': 'American Samoa',
        'AZ': 'Arizona',
        'CA': 'California',
        'CO': 'Colorado',
        'CT': 'Connecticut',
        'DC': 'District of Columbia',
        'DE': 'Delaware',
        'FL': 'Florida',
        'GA': 'Georgia',
        'GU': 'Guam',
        'HI': 'Hawaii',
        'IA': 'Iowa',
        'ID': 'Idaho',
        'IL': 'Illinois',
        'IN': 'Indiana',
        'KS': 'Kansas',
        'KY': 'Kentucky',
        'LA': 'Louisiana',
        'MA': 'Massachusetts',
        'MD': 'Maryland',
        'ME': 'Maine',
        'MI': 'Michigan',
        'MN': 'Minnesota',
        'MO': 'Missouri',
        'MP': 'Northern Mariana Islands',
        'MS': 'Mississippi',
        'MT': 'Montana',
        'NA': 'National',
        'NC': 'North Carolina',
        'ND': 'North Dakota',
        'NE': 'Nebraska',
        'NH': 'New Hampshire',
        'NJ': 'New Jersey',
        'NM': 'New Mexico',
        'NV': 'Nevada',
        'NY': 'New York',
        'OH': 'Ohio',
        'OK': 'Oklahoma',
        'OR': 'Oregon',
        'PA': 'Pennsylvania',
        'PR': 'Puerto Rico',
        'RI': 'Rhode Island',
        'SC': 'South Carolina',
        'SD': 'South Dakota',
        'TN': 'Tennessee',
        'TX': 'Texas',
        'UT': 'Utah',
        'VA': 'Virginia',
        'VI': 'Virgin Islands',
        'VT': 'Vermont',
        'WA': 'Washington',
        'WI': 'Wisconsin',
        'WV': 'West Virginia',
        'WY': 'Wyoming'
    }
    ordered_states = OrderedDict( sorted(states.items(), key= lambda t: t[1] ) )
    return ordered_states

def parse_perma(perma_handle):
    #RG: Can't use the make_map anymore. The perma maps don't
    #exist for the old /concept based URLS.
    #mapper = make_map(config)
    #perma= mapper.match('/%s' % perma_handle)
    log.debug(perma_handle)
    perma_regex = re.compile(r"(c/)?/?(user:[^/]*)?/?([^/]*)/([^/]*)/(r[^/]*)?/?")
    log.debug(perma_handle)
    perma = {}
    if perma_handle:
        parts = perma_regex.match(perma_handle)
        if parts and parts.groups():
            perma['realm'] = parts.group(2)
            perma['artifact_type'] = parts.group(3)
            perma['artifact_title'] = parts.group(4)
            perma['ext'] = parts.group(5)

    log.debug(perma)
    return perma
    
def replace_last(source_string, replace_what, replace_with):
    head, _sep, tail = source_string.rpartition(replace_what)
    return head + replace_with + tail

def remove_tags(string):
    """
    Removes markup tags from the passed input string.
    Can be used to stripping out tags from input strings
    """
    return RE_REMOVE_TAGS.sub("",string)

def get_url_contents(url):
    try:
        from urllib2 import urlopen
        log.debug('Calling %s' % url)
        contents = urlopen(url).read()
        return contents
    except Exception,e:
        log.exception(e)
        return ""
