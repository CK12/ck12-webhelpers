"""Pylons environment configuration"""
import os

from jinja2 import ChoiceLoader, Environment, FileSystemLoader
from pylons import config
from sqlalchemy import engine_from_config

import flx.lib.app_globals as app_globals
import flx.lib.helpers
from flx.config.routing import make_map
from flx.model import init_model

#import flx.lib.mongo as mongo
#import beaker

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
    config.init_app(global_conf, app_conf, package='flx', paths=paths)

    config['routes.map'] = make_map()
    config['pylons.app_globals'] = app_globals.Globals()
    config['pylons.h'] = flx.lib.helpers

    # Create the Jinja2 Environment
    config['pylons.app_globals'].jinja2_env = Environment(
            #block_start_string='<%', block_end_string='%>', variable_start_string='${', variable_end_string='}', comment_start_string='%',
            loader=ChoiceLoader(
            [FileSystemLoader(path) for path in paths['templates']]))
    # Jinja2's unable to request c's attributes without strict_c
    config['pylons.strict_c'] = True

    # Setup the SQLAlchemy database engine
    engine = engine_from_config(config, 'sqlalchemy.')
    init_model(engine)

    # CONFIGURATION OPTIONS HERE (note: all config options will override
    # any Pylons config options)
    config['pylons.response_options']['charset'] = 'utf-8'

    # Create data directory if it does not exist
    dataDir = config['data_dir']
    CDODir = os.path.normpath(os.path.join(config['data_dir'], 'cdo'))
    eventsDir = os.path.normpath(os.path.join(config['data_dir'], 'events'))
    loadedEventsDir = os.path.normpath(os.path.join(config['data_dir'], 'events', 'loaded'))
    if not os.path.isdir(dataDir):
        os.mkdir(dataDir)
    if not os.path.isdir(CDODir):
        os.mkdir(CDODir)
    if not os.path.isdir(eventsDir):
        os.mkdir(eventsDir)
    if not os.path.isdir(loadedEventsDir):
        os.mkdir(loadedEventsDir)
