import newrelic.agent
newrelic.agent.initialize('/opt/newrelic/newrelic_asmt.ini', 'ck12_config')

import os, sys

baseDir='/opt/2.0/assessment/engine/pyramid'
configFile = os.path.join(baseDir, 'production.ini')

sys.path.append(baseDir)
os.environ['PYTHON_EGG_CACHE'] = '/var/www/.python-eggs'


from pyramid.paster import get_app, setup_logging
setup_logging(configFile)
application = get_app(configFile, 'main')
application = newrelic.agent.WSGIApplicationWrapper(application)

import logging
loggers = logging.root.manager.loggerDict.keys()
newrelic_loggers = [l for l in loggers if l.startswith('newrelic')]
for log in newrelic_loggers:
    logging.root.manager.loggerDict[log].disabled = 0


