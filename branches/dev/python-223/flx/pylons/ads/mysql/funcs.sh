#!/bin/bash

PYTHONPATH=${ADS_PYTHONPATH:-/opt/2.0/flx/pylons/ads}

db_host=localhost
db=ads
db_user=dbadmin
db_password=D-coD#43
ads_url=http://localhost/ads

args=$(getopt -u -n $(basename $0) -l help,ads: d:h:u:p: "$@")
if [ $? -ne 0 ]; then
	exit 1
fi
set -- $args

usage() {
	options=${options:-"[--help] [--ads ads_url] [-h db_host] [-u db_user] [-p db_password] -d db_name"}
	echo "Usage: $(basename $0) ${options}"
	exit 0
}

while [ $# -gt 0 ]; do
	case "$1" in
		(-d) 	db=$2; shift;;
		(-h) 	db_host=$2; shift;;
		(-u) 	db_user=$2; shift;;
		(-p) 	db_password=$2; shift;;
	     (--ads)	ads_url=$2; shift;;
	    (--help)	usage;;
		(--)	shift; break;;
		 (*)	break;;
	esac
	shift
done

if [ -z ${db} ]; then
	echo 'Please specify ADS databasename (-d db_name)'
	usage
fi

http() {
    local path=$1
    local qs=$2
    wget -O /dev/null -q "${ads_url}/${path}?${qs}"
}

set_loadscript() {
    local dim=$1
    local script=$2
    curl -s -o /dev/null --data-urlencode "dimension_name=${dim}" --data-urlencode "script@${script}" "${ads_url}/meta/set/dimension/loadscript"
}

set_updatescript() {
    local dim=$1
    local script=/tmp/.ads.trigger
    sed "s/ads./${db}./g" $2 > ${script}
    curl -s -o /dev/null --data-urlencode "dimension_name=${dim}" --data-urlencode "script@${script}" "${ads_url}/meta/set/dimension/updatescript"
}

prompt_graceful_apache() {
    while true; do
	read -p '... Please graceful ADS Apache instances now. Done? (y/n) ' choice
	if [ "${choice}" = "y" ]; then
            break
        fi
    done
}


