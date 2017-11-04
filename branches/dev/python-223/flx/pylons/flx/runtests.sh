#!/bin/bash

reloaddb="${1}"
if [ "${reloaddb}" = "reloaddb" ]; then
    shift
    (cd /opt/2.0/flx/scripts; ./refresh_test_payload.sh dev test)
    (sudo rm -rf /opt/2.0/flx/search/solr/data/* ; /etc/init.d/tomcat restart)
fi

mydir=$(dirname ${0})
user=`grep -s APACHE_RUN_USER /etc/apache2/envvars |sed 's/export APACHE_RUN_USER=//'`
user=${user:-www-data}
mongo flx2 -u flx2admin -pD-coD43 < /opt/2.0/flx/mongo/flx2/flx2_test_cleanup.js
mongo flx2 -u flx2admin -pD-coD43 < /opt/2.0/flx/mongo/flx2/flx2_schema.js
/opt/2.0/deploy/components/beaker/mongodb_beaker/clear_all_cache.sh "-u cacheadmin -pD-coD43"
/opt/2.0/deploy/scripts/clear_redis_cache.sh
sudo /etc/init.d/apache2 restart 
sudo /etc/init.d/celeryd stop
sudo /etc/init.d/celeryd purge
sudo /etc/init.d/celeryd restarttest
sleep 4
echo "Running: sudo su ${user} -c '[ -f /opt/env/flx/bin/activate ] && source /opt/env/flx/bin/activate; cd ${mydir}; whoami; nosetests $* 2>&1 | tee test.out'"
sudo su ${user} -c "[ -f /opt/env/flx/bin/activate ] && source /opt/env/flx/bin/activate ; cd ${mydir}; whoami; RUN_XDT=${RUN_XDT} nosetests $* 2>&1 | tee test.out"
