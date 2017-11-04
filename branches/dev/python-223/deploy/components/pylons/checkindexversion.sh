#!/bin/bash

## Update these urls according to the setup
SOLR_BACKUP_URL="http://localhost:8080/solr"
SOLR_SLAVE_URL="http://localhost:8080/solr"

WGET_OPTIONS="--quiet --tries=1 --timeout=20"

getIndexVersion() {
    file=$1
    index=$(grep 'indexversion' $file | sed -e 's|.*"indexversion">\([0-9]*\)<.*|\1|')
    echo ${index}
}

updateConfig() {
    sed -e "s|^\(solr_query_url = \).*$|\1${SOLR_SLAVE_URL}/select|" -i /opt/2.0/flx/pylons/flx/production.ini
    [ -f /etc/init.d/apache2 ] && /etc/init.d/apache2 restart
    [ -f /etc/init.d/paster ] && /etc/init.d/paster restart
}

wget ${WGET_OPTIONS} "${SOLR_BACKUP_URL}/replication?command=indexversion" -O backupversion
if [ $? -ne 0 ]; then
    echo "Error connecting to solr backup. Exiting ..."
    exit 1
fi
backupindex=$(getIndexVersion backupversion)
echo "Master version: ${backupindex}"

while [ 1 -eq 1 ]; do

    sleep 10s

    ## Get the slave version
    wget ${WGET_OPTIONS} "${SOLR_SLAVE_URL}/replication?command=indexversion" -O slaveversion
    if [ $? -eq 0 ]; then
        slaveindex=$(getIndexVersion slaveversion)
        echo "Slave version: ${slaveindex}"
        if [ ${slaveindex} -ge ${backupindex} ]; then
            echo "In sync ${slaveindex} >= ${backupindex}"
            echo "Updating config ..."
            updateConfig
            break
        fi
    else
        echo "Could not get index version from slave!"
    fi
done
