#!/bin/bash

workdir=''
user=`grep -s APACHE_RUN_USER /etc/apache2/envvars |sed 's/export APACHE_RUN_USER=//'`
user=${user:-www-data}

while getopts 'u:d:e:' flag; do
    case "${flag}" in
        u) user="${OPTARG}" ;;
        d) workdir="${OPTARG}" ;;
    esac
done

shift $((OPTIND-1))

if [ -z "${workdir}" ]; then
    echo "Workdir is required."
    exit
fi

if [ ! -d "${workdir}" ]; then
    echo "Workdir ${workdir} was not found."
    exit
fi

if [[ -z "$@" ]]; then
    echo "No command specified"
    exit
fi

CMD="sudo su ${user} -c \"cd ${workdir}; whoami; $@ 2>&1 | tee -a runas.log\""
echo "Running: $CMD"
eval $CMD
