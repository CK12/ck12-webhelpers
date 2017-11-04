"""Setup the flx application"""
import logging

import pylons.test
from flx.config.environment import load_environment
from flx.model import meta

log = logging.getLogger(__name__)

def setup_app(command, conf, vars):
    """Place any commands to setup flx here"""
    if not pylons.test.pylonsapp:
        load_environment(conf.global_conf, conf.local_conf)

        # Create the tables if they don't already exist
        meta.metadata.create_all(bind=meta.engine)
