#!/bin/bash

removeOldDirs() {
    ## delete old dirs (keep last 3)
    i=1
    dirs=""
    for d in $(ls -1 -t /opt/2.0/work/); do 
        if [ ${i} -gt 3 ]; then 
            dirs="${dirs} /opt/2.0/work/${d}"
        fi
        let i=i+1
    done
    echo $dirs
    [ -n "${dirs}" ] && rm -rf $dirs
}

while getopts ":u:p:h:d:a:w:z:r:" opt; do
  case $opt in
    u)
      DBUSER=$OPTARG
      ;;
    p)  
      PASSWORD=$OPTARG
      ;;
    h)  
      DBHOST=$OPTARG
      ;;
    d)  
      DB=$OPTARG
      ;;
    a)  
      AUTH_DB=$OPTARG
      ;;
    w)  
      LOADWIKI=$OPTARG
      ;;
    z)  
      BZPATH=$OPTARG
      ;;
    r)  
      BZUSER=$OPTARG
      ;;
    \?) 
      echo "Usage: r2core-init -u [dbuser] -p [db password] -h [mysql host] -d [database name] -a [auth db name] -z [bzr path] -r[bzr user] -w [yes|no]"
      echo "Default Values: Username=dbadmin, Password=*****, Host=localhost, Database=flx2, Auth Database=auth, Bzr Path=/opt/data, Bzr User=www-data, Load Wiki=yes"
      exit 1
      ;;
  esac
done

if [ "$DBUSER" == "" ]; then
    DBUSER=dbadmin
fi

if [ "$PASSWORD" == "" ]; then
PASSWORD='D-coD#43'
fi

if [ "$DB" == "" ]; then
DB=flx2
fi

if [ "$AUTH_DB" == "" ]; then
AUTH_DB=auth
fi

if [ "$DBHOST" == "" ]; then
DBHOST=localhost
fi

if [ "$LOADWIKI" == "" ]; then
LOADWIKI="yes"
fi

if [ "$BZPATH" == "" ]; then
BZPATH="/opt/data"
fi

if [ "$BZUSER" == "" ]; then
BZUSER="www-data"
fi

#refresh mysql
prefix=`pwd`
db_script="./r2core-db-init -u ${DBUSER} -p ${PASSWORD} -d ${DB} -a ${AUTH_DB} -h ${DBHOST} -b no  "
cd ${prefix}/../mysql ; . ${db_script}
cd ${prefix}

#refresh bzr 
cd ${BZPATH} 
rm -rf bzr
mkdir -p bzr/0
bzr init bzr ; \
bzr add bzr/0 ; \
bzr commit bzr/0 -m "Initial revision."
chown -R ${BZUSER}.${BZUSER} bzr
cd ${prefix}

#import wiki
if [ "$LOADWIKI" == "yes" ]; then
    removeOldDirs
    python ${prefix}/../pylons/flx/quick_import_driver_2.py http://authors2.ck12.org/wiki/index.php/Concept_Algebra 3 concept;
    python ${prefix}/../pylons/flx/quick_import_driver_2.py http://authors2.ck12.org/wiki/index.php/Concept_Biology 3 concept;
    #small hindi test book
    python ${prefix}/../pylons/flx/quick_import_driver_2.py http://authors2.ck12.org/wiki/index.php/%E0%A4%85%E0%A4%B5%E0%A4%A7%E0%A4%BE%E0%A4%B0%E0%A4%A3%E0%A4%BE_%E0%A4%AC%E0%A5%80%E0%A4%9C%E0%A4%97%E0%A4%A3%E0%A4%BF%E0%A4%A4 3 concept;
fi

