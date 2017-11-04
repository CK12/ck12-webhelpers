"""Pylons environment configuration"""
import os

#from mako.lookup import TemplateLookup
from pylons.configuration import PylonsConfig
#from pylons.error import handle_mako_error
from sqlalchemy import engine_from_config

import flx.lib.app_globals as app_globals
import flx.lib.helpers
from flx.config.routing import make_map
from flx.model import init_model

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
    config.init_app(global_conf, app_conf, package='flx', paths=paths)

    config['routes.map'] = make_map(config)
    config['pylons.app_globals'] = app_globals.Globals(config)
    config['pylons.h'] = flx.lib.helpers
    
    # Setup cache object as early as possible
    #import pylons
    #pylons.cache._push_object(config['pylons.app_globals'].cache)

    """
    # Create the Jinja2 Environment
    config['pylons.app_globals'].jinja2_env = Environment(
            #block_start_string='<%', block_end_string='%>', variable_start_string='${', variable_end_string='}', comment_start_string='%',
            loader=ChoiceLoader(
            [FileSystemLoader(path) for path in paths['templates']]))
    # Jinja2's unable to request c's attributes without strict_c
    config['pylons.strict_c'] = True
    """

    # Setup the SQLAlchemy database engine
    engine = engine_from_config(config, 'sqlalchemy.')
    init_model(engine)

    # CONFIGURATION OPTIONS HERE (note: all config options will override
    # any Pylons config options)
    config['pylons.response_options']['charset'] = 'utf-8'

    return config
