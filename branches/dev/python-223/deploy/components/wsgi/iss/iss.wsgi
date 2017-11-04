import os, sys
from paste.script.util.logging_config import fileConfig

baseDir='/opt/2.0/iss/pylons/iss'
configFile = os.path.join(baseDir, 'production.ini')

sys.path.append(baseDir)
os.environ['PYTHON_EGG_CACHE'] = '/var/www/.python-eggs'

fileConfig(configFile)

from paste.deploy import loadapp
application = loadapp('config:%s' % configFile)
