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

"""Pylons environment configuration"""
from jinja2 import Environment, FileSystemLoader
from jinja2.utils import contextfunction
from pylons.configuration import PylonsConfig
import beaker
from flxweb.config.routing import make_map
from flxweb.lib.ck12.context_functions import version_info
from flxweb.lib.filters import *
import flxweb.lib.app_globals as app_globals
import flxweb.lib.helpers
import os



def load_environment(global_conf, app_conf):
    """Configure the Pylons environment via the ``pylons.config``
    object
    """
    config = PylonsConfig()
    
    # Pylons paths
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    paths = dict(root=root,
                 controllers=os.path.join(root, 'controllers'),
                 static_files=os.path.join(root, 'public'),
                 templates=[os.path.join(root, 'templates')])

    # Initialize config with the basic options
    config.init_app(global_conf, app_conf, package='flxweb', paths=paths)

    config['routes.map'] = make_map(config)
    config['pylons.app_globals'] = app_globals.Globals(config)
    config['pylons.h'] = flxweb.lib.helpers
    
    # Setup cache object as early as possible
    import pylons
    pylons.cache._push_object(config['pylons.app_globals'].cache)
    #RG: Commented the mongodb cache provider. Not used for now
    #beaker.cache.clsmap._clsmap['ext:mongo'] = MongoDBNamespaceManager
   
    #RG TODO: We need to find out a better way to add filters
    jinja2_filters = {'ck12_artifact_cover_thumbnail_small':ck12_artifact_cover_thumbnail_small,
                      'ck12_artifact_cover_thumbnail_large':ck12_artifact_cover_thumbnail_large,
                      'ck12_artifact_cover_image':ck12_artifact_cover_image,
                      'ck12_search_suggestion': ck12_search_suggestion,
                      'ck12_query_parameters': ck12_query_parameters,
                      'ck12_json': ck12_json,
                      'ck12_can_be_added_to_library': ck12_can_be_added_to_library,
                      'ck12_can_publish': ck12_can_publish, 
                      'ck12_date': ck12_date, 
                      'ck12_date_format': ck12_date_format,
                      'ck12_thumbnail' : ck12_thumbnail,
                      'ck12_image_thumbnail_size': ck12_image_thumbnail_size,
                      'ck12_optimizely_enabled': ck12_optimizely_enabled
                    }
    
    # Create the Jinja2 Environment
    jinja2_env = Environment(loader=FileSystemLoader(paths['templates']))
    jinja2_env.filters.update(jinja2_filters)
    jinja2_env.globals['version_info'] = contextfunction(version_info)
    
    config['pylons.app_globals'].jinja2_env = jinja2_env

    # CONFIGURATION OPTIONS HERE (note: all config options will override
    # any Pylons config options)
    config['pylons.response_options']['charset'] = 'utf-8'
    pylons.config.update(config) 
    return config
