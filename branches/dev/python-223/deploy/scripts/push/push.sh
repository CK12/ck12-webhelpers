#!/bin/bash

mydir=$(dirname ${0})
cd ${mydir}
source  ${mydir}/common.sh

if [ -n "${1}" ]; then
    PROFILE="${1}"
else
    echo "No profile specified. Using 'default'"
fi

if [ ! -d "${PROFILE}" ]; then
    echo "ERROR! No such profile directory: ${PROFILE}"
fi

readConfFiles
build_number

## Get pssh
pssh="$(which pssh)"
if [ $? -ne 0 ]; then
    pssh="$(which parallel-ssh)"
fi

[ -z "${pssh}" ] && showError "Missing pssh or parallel-ssh"

thisHost=`hostname`
RSYNC_CMD="rsync --rsh=ssh -rlptDvz --delete --checksum --exclude-from ${mydir}/exclude.list" 
RSYNC_CMD_DR="rsync --rsh=ssh -rlptDvz --delete --checksum --dry-run --exclude-from ${mydir}/exclude.list"

for node in ${NODETYPES}; do
    hostsVar="${node}"
    for host in ${!hostsVar}; do
        echo "Pushing to: ${host}"
        dirsVar="${node}_dirs"
        for d in ${!dirsVar}; do
            echo "Running: ${RSYNC_CMD} ${CODE_HOME}/${d} root@${host}:${CODE_HOME}/"
            ${RSYNC_CMD} ${CODE_HOME}/${d} root@${host}:${CODE_HOME}/
        done
    done
done

[ -d /tmp/push-out ] && rm -rf /tmp/push-out
[ -d /tmp/push-err ] && rm -rf /tmp/push-err
mkdir /tmp/push-out /tmp/push-err

pylonshosts=$(getHostsByType "pylons")
firstPylons=$(echo ${pylonshosts} | cut -f1 -d' ')

webhosts=$(getHostsByType "web")
firstWeb=$(echo ${webhosts} | cut -f1 -d' ')

## Make list of hosts
#rm -f /tmp/push-hostfile
failures=0
for node in ${NODETYPES}; do
    hostsVar="${node}"
    for host in ${!hostsVar}; do
        #echo ${host} >> /tmp/push-hostfile
        echo "Running: ssh ${host} -l root CODE_HOME=${CODE_HOME} ${CODE_HOME}/deploy/scripts/push/config.sh ${PROFILE} ${node} ${firstPylons},${firstWeb} 2> /tmp/push-err/${node}_${host}.err 1>/tmp/push-out/${node}_${host}.out"
        (ssh ${host} -l root "CODE_HOME=${CODE_HOME} ${CODE_HOME}/deploy/scripts/push/config.sh ${PROFILE} ${node} ${firstPylons},${firstWeb}" 2>&1 1>&3 | tee /tmp/push-err/${node}_${host}.err) 3>&1 1>&2 | tee /tmp/push-out/${node}_${host}.out
        [ $? -ne 0 ] && let failures=failures+1
    done
done

#echo "Running: ${pssh} -h /tmp/push-hostfile -l root -v -P --timeout 300 -o /tmp/push-out -e /tmp/push-err CODE_HOME=${CODE_HOME} ${CODE_HOME}/deploy/scripts/push/config.sh ${PROFILE} ${firstPylons},${firstWeb}"
#${pssh} -h /tmp/push-hostfile -l root -v -P --timeout 300 -o /tmp/push-out -e /tmp/push-err "CODE_HOME=${CODE_HOME} ${CODE_HOME}/deploy/scripts/push/config.sh ${PROFILE} ${firstPylons},${firstWeb}"

if [ ${failures} -ne 0 ]; then
    echo "${failures} ssh processes returned non-zero status. Please check the error files under /tmp/push-err."
fi

echo "Listing output files: "
for file in $(ls -1 /tmp/push-out); do
    echo "################ Output: ${file} ##################"
    cat /tmp/push-out/${file}
    echo ""
done

echo "Listing error files: "
for file in $(ls -1 /tmp/push-err); do
    echo "################ Error: ${file} ##################"
    cat /tmp/push-err/${file}
    echo ""
done

echo "Finished! Please see the files under /tmp/push-err directory to make sure there were no errors!"
