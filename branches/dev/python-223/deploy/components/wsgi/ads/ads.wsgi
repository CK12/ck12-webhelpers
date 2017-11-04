import os, sys
from paste.script.util.logging_config import fileConfig

baseDir='/opt/2.0/flx/pylons/ads'
configFile = os.path.join(baseDir, 'production.ini')

sys.path.append(baseDir)
os.environ['PYTHON_EGG_CACHE'] = '/var/www/.python-eggs'

fileConfig(configFile)

from paste.deploy import loadapp
application = loadapp('config:%s' % configFile)

## !!! Development mode only !!!
## Automatically restarts the server when files are changed - Nimish
#import flx.monitor
#flx.monitor.start(interval=1.0)
