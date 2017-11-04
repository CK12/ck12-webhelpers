import os, sys
#from paste.script.util.logging_config import fileConfig

baseDir='/opt/2.0/peerhelp/core/pyramid/'
configFile = os.path.join(baseDir, 'production.ini')

sys.path.append(baseDir)
os.environ['PYTHON_EGG_CACHE'] = '/var/www/.python-eggs'

#fileConfig(configFile)

#from paste.deploy import loadapp
#application = loadapp('config:%s' % configFile)

from pyramid.paster import get_app, setup_logging
setup_logging(configFile)
application = get_app(configFile, 'main')
