#!/bin/bash
#===============================================================================
#
#          FILE:  $Id$
# 
#         USAGE:  ./apply_db_patches.sh 
#===============================================================================

WORKROOT=${WORKROOT:-/opt/2.0}

MYSQL_DB_PATCH_DIRS="flx2:flx/mysql/updates auth:flx/mysql/updates-auth"
MONGO_DB_PATCH_DIRS="assessment:assessment/engine/mongo/updates peer_help:peerhelp/core/mongo/updates flx2:flx/mongo/flx2/updates"

for d in ${MYSQL_DB_PATCH_DIRS}; do
    cd ${WORKROOT}
    echo "####################################################"
    echo "Processing [${d}]"
    echo "####################################################"
    dbName=$(echo $d | sed 's|^\([^:]*\):\(.*\)$|\1|')
    patchdir=$(echo $d | sed 's|^\([^:]*\):\(.*\)$|\2|')
    cd $patchdir
    echo "In $(pwd)"
    if [ -f "current.sql" ]; then
        mysql -u dbadmin -pD-coD#43 -h localhost ${dbName} --default-character-set=utf8 --force < current.sql
    else
        echo "No current.sql found. Skipping ..."
    fi
done

for d in ${MONGO_DB_PATCH_DIRS}; do
    cd ${WORKROOT}
    echo "####################################################"
    echo "Processing [${d}]"
    echo "####################################################"
    dbName=$(echo $d | sed 's|^\([^:]*\):\(.*\)$|\1|')
    patchdir=$(echo $d | sed 's|^\([^:]*\):\(.*\)$|\2|')
    cd $patchdir
    echo "In $(pwd)"
    if [ -f "current.js" ]; then
        case ${dbName} in
            assessment )
                dbUser="asmtadmin"
                ;;
            flx2 )
                dbUser="flx2admin"
                ;;
            peer_help )
                dbUser="phadmin"
                ;;
        esac
        mongo ${dbName} -u ${dbUser} -pD-coD43 < current.js
    else
        echo "No current.js found. Skipping ..."
    fi
done

