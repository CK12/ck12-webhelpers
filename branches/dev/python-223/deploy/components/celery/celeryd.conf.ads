## Place this file (or symlink it) under /etc/default/celeryd
# Where to chdir at start.
CELERYD_CHDIR="/opt/2.0/flx/pylons/ads"

# Extra arguments to celeryd
CELERYD_OPTS="--queues ads -B --schedule=/var/run/celery/celerybeat-schedule.ads"

CELERYD_LOG_FILE="/var/log/celery/celeryd.ads.log"

CELERYD_LOG_LEVEL="INFO"
  
CELERYD_PID_FILE="/var/run/celery/celeryd.ads.pid"
  
# Workers should run as an unprivileged user.
CELERYD_USER=`grep APACHE_RUN_USER /etc/apache2/envvars |sed 's/export APACHE_RUN_USER=//'`
CELERYD_USER=${CELERYD_USER:-www-data}
CELERYD_GROUP=`grep APACHE_RUN_GROUP /etc/apache2/envvars |sed 's/export APACHE_RUN_GROUP=//'`
CELERYD_GROUP=${CELERYD_GROUP:-www-data}

# PAth to celeryd
#CELERYD="/usr/local/bin/paster celeryd celeryconfig.py"

# Name of the celery config module.#
#CELERY_CONFIG_MODULE="celeryconfig"
