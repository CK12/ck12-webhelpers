#!/bin/bash

## Reload the search index
NEO4J_DATA_DIR="/opt/runtime/neo4j/data/graph.db"
NEO4J_DUMP_FILE="${NEO4J_DUMP_FILE:-/opt/gluster/qa_cluster/from_prod/neo4j-backup.tar.gz}"

if [ ! -f "${NEO4J_DUMP_FILE}" ]; then
    echo "ERROR: Cannot find neo4j dump file: ${NEO4J_DUMP_FILE}"
    exit 1
fi

sudo /etc/init.d/neo4j-service stop
sleep 5

cd ${NEO4J_DATA_DIR}
sudo rm -rf *
sudo tar xzf "${NEO4J_DUMP_FILE}"
sudo chmod a+rw -R *
sudo du -ksh *

sudo /etc/init.d/neo4j-service start
sleep 5
