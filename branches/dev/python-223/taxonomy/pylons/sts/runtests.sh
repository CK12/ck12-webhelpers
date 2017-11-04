#!/bin/bash

mydir=$(dirname ${0})
user="www-data"
rm -rf /opt/data/sts/*
cp -vf /opt/2.0/flx/pylons/flx/development.ini-test /opt/2.0/flx/pylons/flx/development.ini
cp -vf /opt/2.0/taxonomy/pylons/sts/development.ini-test /opt/2.0/taxonomy/pylons/sts/development.ini
sudo /opt/2.0/deploy/scripts/setup_virtual_envs.sh taxonomy
sudo /etc/init.d/apache2 restart
echo "Running: sudo su ${user} -c '[ -f /opt/env/flx/bin/activate ] && source /opt/env/flx/bin/activate; cd ${mydir}; whoami; nosetests $* 2>&1 | tee test.out'"
sudo su ${user} -c "(
if [ -f /opt/env/taxonomy/bin/activate ]; then 
	source /opt/env/taxonomy/bin/activate
fi
cd /opt/2.0/taxonomy/scripts
python load_nodes.py dev
cd /opt/2.0/taxonomy/pylons/sts
echo -n 'Running as '; 
whoami
nosetests -v $* 2>&1 | tee test.out
)"
