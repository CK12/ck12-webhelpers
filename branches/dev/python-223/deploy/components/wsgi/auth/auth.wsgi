import os, sys
from paste.script.util.logging_config import fileConfig

baseDir='/opt/2.0/flx/pylons/auth'
configFile = os.path.join(baseDir, 'production.ini')

sys.path.append(baseDir)
os.environ['PYTHON_EGG_CACHE'] = '/var/www/.python-eggs'

fileConfig(configFile)

import logging
from paste.deploy import loadapp

log = logging.getLogger('auth.wsgi')
log.info('loading app: configFile[%s]' % configFile)
try:
    application = loadapp('config:%s' % configFile)
    log.info('loaded app: application[%s]' % application.__dict__)
except Exception, e:
    log.exception('Exception loading app[%s]' % e)
    raise e
