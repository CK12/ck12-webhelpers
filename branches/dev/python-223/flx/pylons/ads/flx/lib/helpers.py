"""Helper functions

Consists of functions to typically be used within templates, but also
available to Controllers. This module is available to templates as 'h'.
"""
# Import helpers as desired, or define your own, ie:
# from webhelpers.html.tags import checkbox, password
import logging

log = logging.getLogger(__name__)

dataDir = None

def load_pylons_config(test_mode=False):
    """
        Loads some parts of pylons configuration for modules outside pylons
    """
    import os
    ## Get the production.ini file path
    mydir = os.path.dirname(os.path.abspath(__file__))
    for i in range(1, 3):
        mydir = os.path.dirname(mydir)
    CONFIG_FILE = os.path.join(mydir, "production.ini")

    import ConfigParser

    cfg = ConfigParser.ConfigParser()
    DEV_CONFIG_FILE = CONFIG_FILE.replace('production.ini', 'development.ini')
    if os.path.exists(CONFIG_FILE):
        cfg.read(CONFIG_FILE)
    elif os.path.exists(DEV_CONFIG_FILE):
        cfg.read(DEV_CONFIG_FILE)
    elif os.path.exists('/opt/2.0/flx/pylons/flx/production.ini'):
        cfg.read('/opt/2.0/flx/pylons/flx/production.ini')
    elif os.path.exists('/opt/2.0/flx/pylons/flx/development.ini'):
        cfg.read('/opt/2.0/flx/pylons/flx/development.ini')
    else:
        raise Exception("Cannot find %s or %s" % (CONFIG_FILE, DEV_CONFIG_FILE))

    
    configs = [cfg]
    if test_mode:
        test_cfg = ConfigParser.ConfigParser()
        if os.path.exists(CONFIG_FILE):
            TEST_CONFIG_FILE = CONFIG_FILE.replace('production.ini', 'test.ini')
        else:
            TEST_CONFIG_FILE = "/opt/2.0/flx/pylons/flx/test.ini"
        if os.path.exists(TEST_CONFIG_FILE):
            test_cfg.read(TEST_CONFIG_FILE)
        configs.append(test_cfg)


    config = {}
    for cfg in configs:
        sections = ['DEFAULT', 'app:main', 'server:main']
        for section in sections:
            for name, value in cfg.items(section):
                config[name] = value
    return config
