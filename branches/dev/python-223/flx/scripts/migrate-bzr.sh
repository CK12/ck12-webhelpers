#! /bin/bash

if [ $# == 1 ]; then
    exportFile=$1
else
    echo "$0: Location of the bzr export file expected."
    exit 1
fi

configFile='/opt/2.0/flx/pylons/flx/development.ini'
url=`grep "^sqlalchemy.url" ${configFile} | sed -e 's,^sqlalchemy.url[ \t]*=[ \t]*,,'`
p=( `echo ${url} | sed -e 's,mysql://\([^:]*\):\([^@]*\)@\([^:]*\):.*,\1 \2 \3,'` )
user=${p[0]}
pass=${p[1]}
host=${p[2]}

echo "Removing foreign keys..."
mysql --user=${user} --password=${pass} --host=${host} flx2 <<DEOD
    ALTER TABLE Contents DROP FOREIGN KEY Contents_ibfk_2;
    ALTER TABLE Contents DROP FOREIGN KEY Contents_ibfk_1;
DEOD

echo "Migrating from Bazaar to MySQL..."
export PYTHONPATH=/opt/2.0/flx/pylons/flx:${PYTHONPATH}
python -u migrate-bzr.py --config-file=${configFile} --bzr-export-file=${exportFile} --dest=/tmp

echo "Restoring foreign keys..."
mysql --user=${user} --password=${pass} --host=${host} flx2 <<CEOD
    DELETE FROM Contents WHERE (resourceURI, ownerID) NOT IN ( SELECT uri, ownerID FROM Resources );
    ALTER TABLE Contents ADD FOREIGN KEY Contents_ibfk_1 (resourceURI, ownerID) REFERENCES Resources(uri, ownerID) ON DELETE NO ACTION ON UPDATE NO ACTION;
    ALTER TABLE Contents ADD FOREIGN KEY Contents_ibfk_2 (contentRevisionID) REFERENCES ContentRevisions(id) ON DELETE NO ACTION ON UPDATE NO ACTION;
CEOD
echo "Done"
