#!/bin/bash
while getopts ":u:p:h:d:b:" opt; do
  case $opt in
    u)
      DBUSER=$OPTARG 
      ;;
    p)
      PASSWORD=$OPTARG 
      ;;
    h)
      HOST=$OPTARG 
      ;;
    d)
      DB=$OPTARG 
      ;;
    *)
      echo "Usage: ${0} -u [username] -p [password] -h [mysql host] -d [database name]"
      echo "Default Values: Username=dbadmin, Password=*****, Host=localhost, Database=flx2, Load books=yes"	
      exit 1
      ;;
  esac
done

if [ -z "$DBUSER" ]; then
    DBUSER=dbadmin
fi

if [ -z "$PASSWORD" ]; then
    PASSWORD='D-coD#43'
fi

if [ -z "$DB" ]; then
    DB=flx2
fi

if [ -z "$HOST" ]; then
    HOST=localhost
fi

mydir=$(dirname ${0})
cd ${mydir}
sqls="mat.ari.sql mat.mea.sql mat.alg.sql mat.geo.sql mat.prb.sql mat.sta.sql sci.esc.sql sci.bio.sql sci.phy.sql sci.che.sql mat.cal.sql mat.trg.sql"
for sql in ${sqls}; do
    if [ -f "${sql}" ]; then
        echo "LOADING ...     ${sql}"
        mysql --user=$DBUSER --password=$PASSWORD --host=$HOST --database=$DB --default-character-set utf8 < ${sql}
    fi
done
