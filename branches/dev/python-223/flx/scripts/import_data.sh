#!/bin/bash

##
## Import mysql, bazaar, and fedora data from an exported archive file.
##

function usage() {
    echo ""
    echo "Usage: ${0} <import-archive-tarball> [<remote-host-name> <local-host-name>]"
    echo "   If remote and local host names are specified, the references to images and"
    echo "   embedded objects will be replaced."
    echo ""
}

archive="${1}"
if [ ! -f "${archive}" ]; then
    echo "ERROR: Invalid archive file: ${archive}"
    usage
    exit 1
fi

remoteHostName="${2}"
localHostName="${3}"

##
## Following properties are assumed - and can be overridden by setting appropriate
## environment variables.
##

dbhost="${DBHOST:-localhost}"
dbuser="${DBUSER:-dbadmin}"
dbpass="${DBPASS:-D-coD#43}"
host=`hostname`

FEDORA_HOME="${FEDORA_HOME:-/usr/local/fedora}"

[ -f ~/.bzrenv.sh ] && source ~/.bzrenv.sh

BZR_HOME="${BZR_HOME:-/opt/data/bzr}"
BZR_REPO="${BZR_REPO:-/opt/bzr-repo}"
BZR_SERVER="${BZR_SERVER:-${host}}"
BZR_CLIENT="${BZR_CLIENT:-${host}}"
BZR_READER="${BZR_READER:-${host}}"
SSH_USER="${SSH_USER:-${USER}}"

if [ -f /etc/apache2/envvars ]; then
    USER=`grep APACHE_RUN_USER /etc/apache2/envvars |sed 's/export APACHE_RUN_USER=//'`
    WUSER=${USER:-www-data}
    GROUP=`grep APACHE_RUN_GROUP /etc/apache2/envvars |sed 's/export APACHE_RUN_GROUP=//'`
    WGROUP=${GROUP:-www-data}
else
    WUSER=www-data
    WGROUP=www-data
fi

import_dir="/tmp/flx2import"

function expandArchive() {
    [ -d "${import_dir}" ] && rm -rf ${import_dir}
    echo "Creating import directory ..."
    mkdir -p ${import_dir}
    cd ${import_dir}
    echo "Extracting exported data ..."
    tar --preserve-permissions -xvzf ${archive}
}

function importMysql() {
    for dbname in flx2 taxonomy homeworkpedia ads; do
        if [ -f "${import_dir}/${dbname}.sql" ]; then
            echo "Importing data into ${dbname} ..."
            ## Remove lines that define a security definer
            sed -i -e '/^\/\*\!50013/d' ${import_dir}/${dbname}.sql
            mysql -u ${dbuser} -p${dbpass} -h ${dbhost} --default-character-set utf8 ${dbname} < ${import_dir}/${dbname}.sql
        fi
    mysql -u ${dbuser} -p${dbpass} -h ${dbhost} --default-character-set utf8 flx2 <<DB_EOD
    delete from Tasks;
    delete from Events;
    delete from Notifications;
DB_EOD
    done
    mysql -u ${dbuser} -p${dbpass} -h ${dbhost} --default-character-set utf8 < /opt/2.0/flx/mysql/mask-emails.sql
}

function importBazaar() {
    bzr_parent=`dirname ${BZR_HOME}`
    bzr_dir=`basename ${BZR_HOME}`
    echo "Importing Bazaar data to client/server model ..."
    set -x
    ssh ${BZR_SERVER} -l ${SSH_USER} "sudo rm -rf ${BZR_REPO}; sudo mkdir ${BZR_REPO}; sudo chown ${WUSER}:${WGROUP} ${BZR_REPO}; sudo rm -f /tmp/export.fi"
    ssh ${BZR_CLIENT} -l ${SSH_USER} "sudo rm -rf ${BZR_HOME}; sudo mkdir ${BZR_HOME}; sudo chown ${WUSER}:${WGROUP} ${BZR_HOME}"
    scp -p ${import_dir}/export.fi ${SSH_USER}@${BZR_SERVER}:/tmp
    ## Initialize the repository - make sure it set to have no trees
    ssh ${BZR_SERVER} -l ${SSH_USER} "sudo su -l ${WUSER} -c \"cd ${BZR_REPO}; bzr init-repo --no-trees .\""

    ## Create the bzr directory as the trunk of the repository - the "bzr init" command creates the .bzr/branch directory
    ssh ${BZR_SERVER} -l ${SSH_USER} "sudo su -l ${WUSER} -c \"cd ${BZR_REPO}; mkdir ${bzr_dir}; bzr init ${bzr_dir}; cd ${bzr_dir}; bzr fast-import /tmp/export.fi\""

    ## Checkout the files on the writer
    ssh ${BZR_CLIENT} -l ${SSH_USER} "sudo su -l ${WUSER} -c \"cd ${bzr_parent}; bzr checkout bzr+ssh://${BZR_SERVER}${BZR_REPO}/bzr\""

    ## If this is a multi-node setup, we have another checkout for the reader
    if [ "${BZR_CLIENT}" != "${BZR_READER}" ]; then
        ssh ${BZR_READER} -l ${SSH_USER} "sudo rm -rf ${BZR_HOME}; sudo mkdir ${BZR_HOME}; sudo chown ${WUSER}:${WGROUP} ${BZR_HOME}"
        ssh ${BZR_SERVER} -l ${SSH_USER} "sudo su -l ${WUSER} -c \"cp -p /opt/2.0/deploy/components/bazaar/config/branch.conf ${BZR_REPO}/bzr/.bzr/branch/branch.conf\""
        ssh ${BZR_READER} -l ${SSH_USER} "sudo su -l ${WUSER} -c \"cd ${bzr_parent}; bzr checkout bzr+ssh://${BZR_SERVER}${BZR_REPO}/bzr\""
    fi
    set +x
}

function importFedora() {
    cd ${FEDORA_HOME}/data
    echo "Extracting fedora data ..."
    sudo rm -rf *
    tar --preserve-permissions -xzf ${import_dir}/fedora_export.tar.gz

    echo "Rebuilding fedora ..."
    cd ${FEDORA_HOME}/server/bin
    for i in 2 1 3; do
        sudo ./fedora-rebuild.sh 
    done
    cd ${FEDORA_HOME}/data
    changeOwnership
}

function changeOwnership() {
    echo "Changing permissions for `pwd`..."
    sudo chown -R ${WUSER}:${WGROUP} .
}

expandArchive
importMysql
#importBazaar
#if [ "${4}" == '--no-fedora' ]; then
#    echo 'Skipping importing Fedora'
#else
#    importFedora
#fi
