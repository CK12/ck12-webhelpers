#!/bin/bash

## 
## Reload data on gamma cluster - run on mysql.master node
## 

START_DATE="${1}"
LOAD_DATA="${2}"

SQL_DUMP_DIR=${SQL_DUMP_DIR:-/opt/gluster/qa_cluster/from_prod}
cd ${SQL_DUMP_DIR}

if [ -n "${LOAD_DATA}" ]; then
    sql_dump_gzipped="dailydump.sql.gz"
    sql_dump="dailydump.sql"
    if [ -f "${sql_dump_gzipped}" ]; then
        echo "Unzipping sql data ..."
        sudo rm -f "${sql_dump}"
        gunzip "${sql_dump_gzipped}"
        echo "Finished!"
    fi
    if [ ! -f "${sql_dump}" ]; then
        echo "Error: Cannot find sql dump from production."
        exit 1
    fi
fi

## Switch my.cnf
if [ -f "/etc/mysql/my.cnf.load" ] && [ -f "/etc/mysql/my.cnf.run" ]; then
    sudo ln -sf /etc/mysql/my.cnf.load /etc/mysql/my.cnf
    sudo /etc/init.d/mysql restart
fi

sudo rm -f run.sh

# Get time as a UNIX timestamp (seconds elapsed since Jan 1, 1970 0:00 UTC)
T="$(date +%s)"
now="$(date +'%Y-%m-%d %H:%M:%S')"
echo "Starting... [${now}]"

if [ -n "${LOAD_DATA}" ]; then
    echo /opt/2.0/deploy/scripts/apply-db-updates.py "${START_DATE}" all:${sql_dump}
    /opt/2.0/deploy/scripts/apply-db-updates.py "${START_DATE}" all:${sql_dump}
else
    echo /opt/2.0/deploy/scripts/apply-db-updates.py "${START_DATE}"
    /opt/2.0/deploy/scripts/apply-db-updates.py "${START_DATE}"
fi

[ ! -f ./run.sh ] && echo "Error generating run.sh" && exit 1
echo "Running sh ./run.sh"
sh ./run.sh

T="$(($(date +%s)-T))"
echo "Time in seconds: ${T}"
printf "Time taken: %02d:%02d:%02d:%02d\n" "$((T/86400))" "$((T/3600%24))" "$((T/60%60))" "$((T%60))"

## Switch back my.cnf
if [ -f "/etc/mysql/my.cnf.load" ] && [ -f "/etc/mysql/my.cnf.run" ]; then
    sudo ln -sf /etc/mysql/my.cnf.run /etc/mysql/my.cnf
    sudo /etc/init.d/mysql restart
fi

echo "All done!"

