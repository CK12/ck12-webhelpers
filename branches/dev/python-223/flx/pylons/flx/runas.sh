#!/bin/bash

mydir=$(dirname ${0})
user=`grep -s APACHE_RUN_USER /etc/apache2/envvars |sed 's/export APACHE_RUN_USER=//'`
user=${user:-www-data}
echo "Running: sudo su ${user} -c '$* 2>&1 | tee runas.log'"
sudo su ${user} -c "cd ${mydir}; whoami; $* 2>&1 | tee runas.log"
