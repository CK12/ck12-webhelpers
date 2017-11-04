#   /bin/bash

authPath=/opt/2.0/flx/pylons/auth/flx
authDB=auth
db=flx2
user=dbadmin
password=D-coD#43

tmpFile=/tmp/.cdb.sql
rm -f ${tmpFile}
cat > ${tmpFile} <<CEOD
DROP DATABASE IF EXISTS ${authDB};
CREATE DATABASE ${authDB};
CEOD
mysql --user=${user} --password=${password} < ${tmpFile}
mysql --user=${user} --password=${password} ${authDB} < /opt/2.0/flx/mysql/auth-schema.sql 
mysqldump --user=${user} --password=${password} --no-create-db --skip-add-drop-table --no-create-info --skip-create-options --complete-insert ${db} Addresses Countries MemberAuthTypes MemberExtData MemberLocations MemberRoles MemberStates Members OAuthClients OAuthTokens USAddresses USStates USZipCodes WorldAddresses > /tmp/auth.sql
sed -i -e '/ads.D_users/d' /tmp/auth.sql
sed -i -e '/flx2.T_users/d' /tmp/auth.sql
sed -i -e '/^FOR EACH ROW BEGIN/d' /tmp/auth.sql
sed -i -e '/^END \*/d' /tmp/auth.sql
mysql --user=${user} --password=${password} ${authDB} < /tmp/auth.sql
mysql --user=${user} --password=${password} ${authDB} < /opt/2.0/flx/mysql/updates-auth/20121119-auth.sql
#
#  The following 2 lines should only be run after verifying the auth database
#  has been successfully created.
#
#  1. The 20121116-member.sql file can be run at the datbase instance.
#  2. The migrate-member-roles.py script will need to be run on one of the core
#     instance, since pylons is required.
#
#mysql --user=${user} --password=${password} ${db} < /opt/2.0/flx/mysql/updates-auth/20121116-member.sql
#python -u ${authPath}/model/migrate-member-roles.py
