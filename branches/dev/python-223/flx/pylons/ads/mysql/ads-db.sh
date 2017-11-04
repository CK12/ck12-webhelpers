#!/bin/bash
#
# Drop and recreate ADS db
#
workdir=$(dirname $0)
source ${workdir}/funcs.sh

echo "Initialize ${db}"
mysql -h ${db_host} -u ${db_user} -p${db_password} <<EOF
DROP DATABASE IF EXISTS ${db};
CREATE DATABASE ${db};
EOF

mysql -h ${db_host} -u ${db_user} -p${db_password} ${db} < ${workdir}/ads-schema.sql

       
