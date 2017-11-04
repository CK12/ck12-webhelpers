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

from pylons import config, request
from datetime import datetime
from dateutil import parser
import urlparse
import urllib
import logging
import re
from flxweb.model.modality import ModalityManager
from flxweb.model.artifact import ModalityArtifact
from flxweb.lib.ck12.url_helpers import url_images
from flxweb.model.artifact import ConceptArtifact, SectionArtifact,\
    LessonArtifact, ArtifactManager
from flxweb.model.browseTerm import BrowseTerm

try: 
    import simplejson as json
    json
except ImportError: 
    import json

log = logging.getLogger(__name__)

def ck12_artifact_cover_thumbnail_small( artifact ):
    '''
    Returns the 95x95 pixels version of the first image as the cover image 
    for the artifact
    TODO: since the cover image fields and methods have now been defined in
    model/artifact.py, we should get rid of this filter.
    '''
    if artifact:
        return artifact.thumbnail_small()
    return config['default_cover_thumbnail_small']

def ck12_artifact_cover_thumbnail_large( artifact ):
    '''
    Returns the 192x192 pixels version of the first image as the cover image 
    for the artifact
    TODO: since the cover image fields and methods have now been defined in
    model/artifact.py, we should get rid of this filter.
    '''
    if artifact:
        return artifact.thumbnail_large()

    return config['default_cover_thumbnail_large']

def ck12_artifact_cover_image( artifact ):
    '''
    Returns cover image for drafts
    '''
    if artifact:
        return artifact.coverImage()

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
            if value:
                if isinstance(value, unicode):
                    value = value.encode('utf8')
                params[key] = value
            else:
                if key in params:
                    params.pop(key)
    encoded_params = urllib.urlencode(params)
    querystring = ''
    if encoded_params:
        querystring = '?%s' % encoded_params
    return querystring

def ck12_json( object ):
    try:
        if object:
            return json.dumps(object)
        else:
            return object
    except Exception,e:
        log.exception(e)
        return object

def ck12_can_be_added_to_library(artifact):
    '''
    Returns the true if the artifact can be added to the library.
    Only the allowed artifact types should return true.
    '''    
    if artifact.is_flexbook() or artifact.is_concept() or\
       artifact.is_section() or artifact.is_lesson():
        return True 
    else:
        return False

def ck12_can_publish(artifact,user):
    '''
    Returns the true if the user can request the artifact 
    to be published i.e make available to public.
    '''    
    '''return artifact.is_owner(user) and not artifact.is_published() and\
           (artifact.is_flexbook() or artifact.is_concept() or\
            artifact.is_lesson() or artifact.is_section())'''
           
    return artifact.is_owner(user) and not artifact.is_published()
                

def ck12_date(date):
    '''
    Converts the passed date string into consistent date format.
    All templates should use this filter to make dates consistent
    on the site
    '''   
    if type(date) == str or type(date) == unicode:
        #date = datetime.strptime(date,'%Y-%m-%d %H:%M:%S')
        date = parser.parse(date) 

    if type(date) == datetime:
        if datetime.today().date() == date.date(): 
            return date.strftime('Today, %H:%M')
        else:
            return date.strftime('%b %d, %Y')
    else:
        return date

def ck12_date_format(date,format):
    '''
    Converts the passed date string into passed date format.
    '''   
    try:
        if type(date) == str or type(date) == unicode:
            date = datetime.strptime(date,'%Y-%m-%d %H:%M:%S')

        if type(date) == datetime:
            return date.strftime(format)
        else:
            return date
    except Exception,e:
        log.exception(e)
        return date

def ck12_user_is_teacher(user):
    '''
    Returns true if logged in user's role or flxweb_role cookie value for guest user is teacher 
    '''
    if user:
        return user.hasAnyRole(['teacher','admin'])
    else:
        role = request.cookies.get('flxweb_role')
        if role=='teacher':
            return True
    return False

def get_modality_artifact_thumb(modality_artifact, size='small'):
    thumb = modality_artifact.get_thumb_small()
    if not thumb:
        modality_type = modality_artifact.get('artifactType')
        modality_group = ModalityManager.get_modality_group_by_type(modality_type)
        thumb = modality_group.get('default_thumb')
        thumb = url_images(thumb)
    return thumb

def get_artifact_thumb(artifact, size='small'):
    thumb = None
    if size == 'small':
        thumb = ck12_artifact_cover_thumbnail_small(artifact)
    if size == 'large':
        thumb = ck12_artifact_cover_thumbnail_large(artifact)
    return thumb

def get_node_thumb(node, size='small'):
    thumb = None
    if node:
        thumb = node.get('previewImageUrl')
    
    if not thumb:
        thumb = url_images('modality_generic_icons/concept_gicon.png')
    
    return thumb

def ck12_thumbnail(object, size='small'):
    book_classes = [ ArtifactManager.ARTIFACT_CLASSES.get( booktype ) for booktype in ArtifactManager.BOOK_TYPES ]
    classlist_thumbgen_config =[
            (ModalityArtifact, get_modality_artifact_thumb),
            ( (ConceptArtifact, SectionArtifact, LessonArtifact), get_artifact_thumb ),
            ( tuple(book_classes), get_artifact_thumb ),
            ( BrowseTerm, get_node_thumb )
    ]
    thumb = None
    for types, func in classlist_thumbgen_config:
        if isinstance(object, types  ):
            thumb = func(object, size)
    if not thumb:
        log.debug("NO THUMBNAIL FOUND")
        log.debug( type(object) )
    return thumb

def ck12_image_thumbnail_size(image_uri, size):
    if image_uri and image_uri[:4].lower() != 'http' and size:
        s = '/flx/show/thumb_%s/image' % size
        image_uri = image_uri.replace('/flx/show/image', s)

    return image_uri

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

