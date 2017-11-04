"""Pylons environment configuration"""
import os

from jinja2 import ChoiceLoader, Environment, FileSystemLoader
from jinja2.utils import contextfunction
from pylons import config

import auth.lib.app_globals as app_globals
import auth.lib.helpers
from auth.lib.filters import *
from auth.lib.ck12.context_functions import version_info
from auth.config.routing import make_map
from auth.model import init_model, getSQLAlchemyEngines

#import auth.lib.mongo as mongo

#beaker.cache.clsmap['ext:mongo'] = mongo.MongoManager

def load_environment(global_conf, app_conf):
    """Configure the Pylons environment via the ``pylons.config``
    object
    """
    # Pylons paths
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    paths = dict(root=root,
                 controllers=os.path.join(root, 'controllers'),
                 static_files=os.path.join(root, 'public'),
                 templates=[os.path.join(root, 'templates')])

    # Initialize config with the basic options
    config.init_app(global_conf, app_conf, package='auth', paths=paths)

    config['routes.map'] = make_map()
    config['pylons.app_globals'] = app_globals.Globals()
    config['pylons.h'] = auth.lib.helpers

    # Create the Jinja2 Environment
    jinja2_env = Environment(
            #block_start_string='<%', block_end_string='%>', variable_start_string='${', variable_end_string='}', comment_start_string='%',
            loader=ChoiceLoader([FileSystemLoader(path) for path in paths['templates']])
        )
    #RG TODO: We need to find out a better way to add filters
    jinja2_filters = {
        'ck12_image_thumbnail_size': ck12_image_thumbnail_size,
        'ck12_json': ck12_json,
        'ck12_optimizely_enabled': ck12_optimizely_enabled
    }
    jinja2_env.filters.update(jinja2_filters)
    jinja2_env.globals['version_info'] = contextfunction(version_info)
    config['pylons.app_globals'].jinja2_env = jinja2_env
    # Jinja2's unable to request c's attributes without strict_c
    config['pylons.strict_c'] = True

    # Setup the SQLAlchemy database engine
    engines = getSQLAlchemyEngines(config)
    init_model(engines)

    # CONFIGURATION OPTIONS HERE (note: all config options will override
    # any Pylons config options)
    config['pylons.response_options']['charset'] = 'utf-8'
    os.environ['CELERY_CONFIG_MODULE'] = 'celeryconfig-auth'
