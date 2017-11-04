import newrelic.agent
newrelic.agent.initialize('/opt/newrelic/newrelic.ini', 'ck12_config')

import os, sys
from paste.script.util.logging_config import fileConfig

baseDir='/opt/2.0/flx/pylons/flx'
configFile = os.path.join(baseDir, 'production.ini')

sys.path.append(baseDir)
os.environ['PYTHON_EGG_CACHE'] = '/var/www/.python-eggs'

fileConfig(configFile)

from paste.deploy import loadapp
application = loadapp('config:%s' % configFile)
application = newrelic.agent.WSGIApplicationWrapper(application)


## !!! Development mode only !!!
## Automatically restarts the server when files are changed - Nimish
#import flx.monitor
#flx.monitor.start(interval=1.0)

import logging
loggers = logging.root.manager.loggerDict.keys()
newrelic_loggers = [l for l in loggers if l.startswith('newrelic')]
for log in newrelic_loggers:
    logging.root.manager.loggerDict[log].disabled = 0
