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
# $Id: filters.py 13429 2011-10-31 06:03:55Z nimish $

from pylons import config
import urlparse
import urllib

def ck12_artifact_cover_thumbnail_small( artifact ):
    '''
    Returns the 95x95 pixels version of the first image as the cover image 
    for the artifact
    '''
    if artifact and 'revisions' in artifact:
        if artifact['revisions'] and 'coverImage' in artifact['revisions'][0]:
            image_url = artifact['revisions'][0]['coverImage']
            image_url = image_url.replace('/default/','/THUMB_SMALL/')
            return image_url

        if artifact['artifactType']:
            default_cover_name = 'default_%s_cover_small' % artifact['artifactType']
            return config[default_cover_name]
    return config['default_cover_thumbnail_small']

def ck12_artifact_cover_thumbnail_large( artifact ):
    '''
    Returns the 192x192 pixels version of the first image as the cover image 
    for the artifact
    '''
    if artifact and 'revisions' in artifact:
        if artifact['revisions'] and 'coverImage' in artifact['revisions'][0]:
            image_url = artifact['revisions'][0]['coverImage']
            image_url = image_url.replace('/default/','/thumb_large/')
            return image_url

        if artifact['artifactType']:
            default_cover_name = 'default_%s_cover_large' % artifact['artifactType']
            return config[default_cover_name]
    return config['default_cover_thumbnail_large']

def ck12_search_suggestion( search_term,search_paginator ):
    '''
    Returns the search suggestion using the search_paginator instance
    '''
    suggestion = search_term
    if search_term and search_paginator and search_paginator.pageable.rawData:
        pageable = search_paginator.pageable
        if 'suggestions' in pageable.rawData:
            words= suggestion.split() 
            for word in words:
                if word in pageable.rawData['suggestions']:
                    suggestion = suggestion.replace(word,pageable.rawData['suggestions'][word][0])

    # if the suggestion was the same as the search_term, then dont return the suggestion 
    if suggestion == search_term:
        return None
    else:
        return suggestion


def ck12_query_parameters( url,new_params_dict=None ):
    '''
    '''
    query = urlparse.urlparse(url).query
    params = dict(urlparse.parse_qsl(query))
    if new_params_dict:
        for key,value in new_params_dict.items():
            params[key] = value
    return urllib.urlencode(params)
