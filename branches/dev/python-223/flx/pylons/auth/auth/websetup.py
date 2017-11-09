"""Setup the auth application"""
import logging

import pylons.test
from auth.config.environment import load_environment
from auth.model import meta

log = logging.getLogger(__name__)

def setup_app(command, conf, vars):
    """Place any commands to setup auth here"""
    if not pylons.test.pylonsapp:
        load_environment(conf.global_conf, conf.local_conf)

        # Create the tables if they don't already exist
        meta.metadata.create_all(bind=meta.engine)