#!/bin/bash

export PATH=/opt/lampp/bin:$PATH

db=flx2
if [ $# -gt 0 ]; then
    db=$1
fi
user=dbadmin
password=D-coD#43

echo 'Initializing' ${db}'...'
tmpFile=/tmp/.cdb.sql
rm -f ${tmpFile}
cat > ${tmpFile} <<EOF
DROP DATABASE IF EXISTS ${db};
CREATE DATABASE ${db};
EOF
mysql --user=${user} --password=${password} mysql < ${tmpFile}
rm -f ${tmpFile}
mysql --user=${user} --password=${password} ${db} < flx2-schema.sql
mysql --user=${user} --password=${password} ${db} < flx2-init.sql
mysql --user=${user} --password=${password} ${db} < flx2-create-views.sql
echo 'Loading stub data...'
mysql --user=${user} --password=${password} ${db} < flx2-load-stub.sql
echo "Loading foundation grid data..."
for sql in $(ls -1 fg/*.sql); do
    mysql --user=${user} --password=${password} ${db} < ${sql}
done
mysql --user=${user} --password=${password} ${db} < foundationgrid.sql
mysql --user=${user} --password=${password} ${db} < browsecategories.sql
mysql --user=${user} --password=${password} ${db} < domainurls.sql
mysql --user=${user} --password=${password} ${db} < biology.sql
mysql --user=${user} --password=${password} ${db} < life_science.sql
mysql --user=${user} --password=${password} ${db} < calculus.sql
mysql --user=${user} --password=${password} ${db} < probability.sql
mysql --user=${user} --password=${password} ${db} < trigonometry.sql
mysql --user=${user} --password=${password} ${db} < geometry.sql
mysql --user=${user} --password=${password} ${db} < earth_science.sql
mysql --user=${user} --password=${password} ${db} < ppb.sql
mysql --user=${user} --password=${password} ${db} < 21st_physics.sql
mysql --user=${user} --password=${password} ${db} < chemistry.sql
mysql --user=${user} --password=${password} ${db} < algebra.sql
