#!/bin/bash

mydir=$(dirname ${0})
cd ${mydir}

testmode=""
manual="true"

[ "${1}" = "test" ] && testmode="true"
[ -n "${testmode}" ] && manual=""

db="${DBNAME:-taxonomy}"
user="${DBUSER:-dbadmin}"
password="${DBPASS:-D-coD#43}"
host="${DBHOST:-localhost}"

echo 'Initializing' ${db}'...'
tmpFile=/tmp/.cdb.sql
rm -f ${tmpFile}
cat > ${tmpFile} <<EOF
DROP DATABASE IF EXISTS ${db};
CREATE DATABASE ${db};
EOF
mysql --user=${user} --password=${password} -h ${host} mysql --default-character-set utf8 < ${tmpFile}
rm -f ${tmpFile}
echo "Loading schema ..."
mysql --user=${user} --password=${password} -h ${host} --default-character-set utf8 ${db} < taxonomy-schema.sql
echo "Creating views ..."
mysql --user=${user} --password=${password} -h ${host} --default-character-set utf8 ${db} < create-views.sql
echo "Creating triggers ..."
mysql --user=${user} --password=${password} -h ${host} --default-character-set utf8 ${db} < flx2-triggers.sql
echo "Loading data ..."
mysql --user=${user} --password=${password} -h ${host} --default-character-set utf8 ${db} < taxonomy-init-data.sql

source ${mydir}/load-conceptnodes.sh

echo "Loading keywords ..."
mysql --user=${user} --password=${password} -h ${host} --default-character-set utf8 ${db} < conceptnodekeywords.sql
echo "Finished initializing database."
