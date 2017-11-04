#!/bin/bash
#
#  Export user information from 1.x database and import them into 2.0 database.
#
#  The exported file, /tmp/auth_user.sql, is comma separated.
#  If --import option is given, then it will also import the csv file into the 2.0 database.

set -- `getopt -n$0 -u --long 1x-host:,1x-user:,1x-password:,2-host:,2-user:,2-password:,import,help -o ih -- "$@"`

while true ; do
    case "$1" in
    --1x-host)
        HOST_1X=$2
        shift 2
        ;;
    --1x-user)
        USER_1X=$2
        shift 2
        ;;
    --1x-password)
        PASSWORD_1X=$2
        shift 2
        ;;
    --2-host)
        HOST_2=$2
        shift 2
        ;;
    --2-user)
        USER_2=$2
        shift 2
        ;;
    --2-password)
        PASSWORD_2=$2
        shift 2
        ;;
    --import|-i)
        IMPORT=1
        shift
        ;;
    --help|-h|\?) 
        echo "Usage:" $0 "--1x-host=<host> --1x-user=<user> --1x-password=<password> --2-host=<host> --2-user=<user> --2-password=<password> [--import] [--help]"
        exit 1
        ;;
    --)
        shift
        break
        ;;
    esac
done

if [ "$HOST_1X" == "" ]; then
    HOST_1X=localhost
fi

if [ "$USER_1X" == "" ]; then
    USER_1X=dbadmin
fi

if [ "$PASSWORD_1X" == "" ]; then
    PASSWORD_1X=D-coD#43
fi

if [ "$DB_1X" == "" ]; then
    DB_1X=flexr
fi

if [ "$HOST_2" == "" ]; then
    HOST_2=localhost
fi

if [ "$USER_2" == "" ]; then
    USER_2=dbadmin
fi

if [ "$PASSWORD_2" == "" ]; then
    PASSWORD_2=D-coD#43
fi

if [ "$DB_2" == "" ]; then
    DB_2=flx2
fi

TMP_SQL=/tmp/.mysql-1x-users.sql
TMP_USR_TXT=/tmp/auth_user.txt
TMP_PRF_TXT=/tmp/flexbook_userprofile.txt
TMP_DB="${DB_1X}tmp"
#
#  Export user info from 1.x production database.
#
echo "Exporting from ${DB_1X}..."
sudo rm -f ${TMP_SQL}
mysqldump --host=${HOST_1X} --user=${USER_1X} --password=${PASSWORD_1X} ${DB_1X} auth_user flexbook_userprofile > ${TMP_SQL}
#
#  Import user info into a local temporary database.
#
mysql --user=${USER_2} --password=${PASSWORD_2} --host=${HOST_2} <<EOD1
    drop database if exists ${TMP_DB};
    create database ${TMP_DB};
EOD1
mysql --user=${USER_2} --password=${PASSWORD_2} --host=${HOST_2} ${TMP_DB} < ${TMP_SQL}
#
#  Generate user info into the comma separated file, /tmp/auth_user.sql.
#
echo "Generating user info into a csv file..."
sudo rm -f ${TMP_USR_TXT} /tmp/auth_user.sql ${TMP_PRF_TXT} /tmp/flexbook_userprofile.sql
if [ "${HOST_2}" != "localhost" ]; then
    ssh ${HOST_2} "rm -f ${TMP_USR_TXT} ${TMP_PRF_TXT}"
fi
mysqldump --user=${USER_2} --password=${PASSWORD_2} --host=${HOST_2} --tab /tmp --fields-enclosed-by=\" --fields-terminated-by=, ${TMP_DB} auth_user flexbook_userprofile
if [ "${HOST_2}" != "localhost" ]; then
    ssh ${HOST_2} "sudo rm -f ${TMP_USR_TXT} ${TMP_PRF_TXT}"
    scp -p ${HOST_2}:${TMP_USR_TXT} ${TMP_USR_TXT}
    scp -p ${HOST_2}:${TMP_PRF_TXT} ${TMP_PRF_TXT}
fi
if [ "${IMPORT}" == 1 ]; then
    echo "Importing user info to ${DB_2}..."
    python -u /opt/2.0/flx/pylons/flx/flx/model/import-1x-user.py --source-file=${TMP_USR_TXT} --profile-file=${TMP_PRF_TXT} --dest=mysql://${USER_2}:${PASSWORD_2}@${HOST_2}:3306/${DB_2}?charset=utf8
    sudo rm -f ${TMP_USR_TXT} /tmp/auth_user.sql ${TMP_PRF_TXT} /tmp/flexbook_userprofile.sql
    if [ "${HOST_2}" != "localhost" ]; then
        ssh ${HOST_2} "sudo rm -f ${TMP_USR_TXT} ${TMP_PRF_TXT}"
    fi
fi
#
#  Clean up.
#
mysql --user=${USER_2} --password=${PASSWORD_2} --host=${HOST_2} <<EOD2
    drop database if exists ${TMP_DB};
EOD2
sudo rm -f ${TMP_SQL}
