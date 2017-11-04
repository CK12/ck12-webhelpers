#!/bin/bash

## Reload the search index
SOLR_INDEX_DIR="/opt/2.0/flx/search/solr/data"
SOLR_DUMP_FILE="${SOLR_DUMP_FILE:-/opt/gluster/qa_cluster/from_prod/solrdump.tar.gz}"

if [ ! -f "${SOLR_DUMP_FILE}" ]; then
    echo "ERROR: Cannot find solr dump file: ${SOLR_DUMP_FILE}"
    exit 1
fi

sudo /etc/init.d/tomcat stop
sleep 5

cd ${SOLR_INDEX_DIR}
sudo rm -rf *
sudo tar xzf "${SOLR_DUMP_FILE}"
sudo chmod a+rw -R *
sudo du -ksh *

sudo /etc/init.d/tomcat start
sleep 5
