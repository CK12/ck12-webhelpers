#!/bin/bash
dirs="/var/log/apache2 /opt/2.0/log /var/log/celery  /usr/local/fedora/server/logs /opt/2.0/flx/tomcat/logs /opt/runtime/tomcat/logs /var/log/nginx /var/log/paster /var/log/uwsgi.log"
for dir in ${dirs}; do
    for file in $(ls ${dir}/*.log ${dir}/*.txt ${dir}/*.out 2> /dev/null); do
        logfiles="${logfiles} ${file}"
    done
done
echo "Tailing files: ${logfiles}"
tail -F ${logfiles}
