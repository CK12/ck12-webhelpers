#!/bin/bash

mydir=$(dirname ${0})
cd ${mydir}

testmode="${testmode:-}"
manual="${manual:-true}"
db="${DBNAME:-taxonomy}"
user="${DBUSER:-dbadmin}"
password="${DBPASS:-D-coD#43}"
host="${DBHOST:-localhost}"

echo "$testmode $manual $db $user $password $host"

if [ -n "${manual}" ]; then
    conceptNodeFiles=$(ls -1 conceptnodes.manual/*.sql)
else
    conceptNodeFiles=$(ls -1 conceptnodes/*.sql)
fi
if [ -n "${testmode}" ]; then
    echo "Disabling triggers ..."
    mysql --user=${user} --password=${password} -h ${host} --default-character-set utf8 ${db} < flx2-triggers-delete.sql
    conceptNodeFiles="$(ls -1 conceptnodes/*.sql.authors2)"
fi

nodeSqls=""
kwSqls=""
for file in ${conceptNodeFiles}; do
    if [ "${file//.kw.sql/}" != "${file}" ]; then
        kwSqls="${kwSqls} ${file}"
    else
        nodeSqls="${nodeSqls} ${file}"
    fi
done

for file in ${nodeSqls}; do
    echo "Loading concept nodes from ${file} ..."
    mysql --user=${user} --password=${password} -h ${host} --default-character-set utf8 ${db} -f < ${file}
done
for file in ${kwSqls}; do
    echo "Loading concept node keywords from ${file} ..."
    mysql --user=${user} --password=${password} -h ${host} --default-character-set utf8 ${db} -f < ${file}
done

if [ -n "${testmode}" ]; then
    echo "Recreating triggers ..."
    mysql --user=${user} --password=${password} -h ${host} --default-character-set utf8 ${db} < flx2-triggers.sql
fi

