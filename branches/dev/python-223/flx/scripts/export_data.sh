#!/bin/bash

## Export all data from an instance
dbhost="${DBHOST:-localhost}"
dbuser="${DBUSER:-dbadmin}"
dbpass="${DBPASS:-D-coD#43}"

FEDORA_HOME="${FEDORA_HOME:-/usr/local/fedora}"
BZR_HOME="${BZR_HOME:-/opt/data/bzr}"

export_dir="/mnt/flx2export"

export_fedora=""
if [ "${1}" = "--no-fedora" ]; then
    export_fedora=""
fi

function createExportDir() {
    [ -d "${export_dir}" ] && rm -rf ${export_dir}
    echo "Creating ${export_dir} ..."
    mkdir -p ${export_dir}
}

function exportMysqlData() {
    for dbname in flx2 taxonomy homeworkpedia ads; do
        echo "Exporting data from ${dbname} ..."
        mysqldump -u ${dbuser} -p${dbpass} -h ${dbhost} --default-character-set utf8 --complete-insert ${dbname} > ${export_dir}/${dbname}.sql
    done
}

function exportFedoraData() {
    cd ${FEDORA_HOME}/data
    echo "Exporting fedora data ..."
    tar --preserve-permissions -czf ${export_dir}/fedora_export.tar.gz *
}

function exportBazaarData() {
    bzr_parent=`dirname ${BZR_HOME}`
    bzr_dir=`basename ${BZR_HOME}`
    cd ${bzr_parent}
    echo "Exporting Bazaar data ..."
    bzr fast-export --no-plain bzr ${export_dir}/export.fi
    ## tar --preserve-permissions -czf ${export_dir}/bazaar_export.tar.gz ${bzr_dir}
}

function createArchive() {
    cd ${export_dir}
    echo "Creating data archive ..."
    tar --preserve-permissions -cvzf flx2_export.tar.gz *
    echo "Created archive in ${export_dir}/flx2_export.tar.gz"
}

## Main
createExportDir
exportMysqlData
#exportBazaarData
#[ "${export_fedora}" = "true" ] && exportFedoraData
createArchive
