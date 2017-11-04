#!/usr/bin/env bash
workdir=$(dirname $0)
source ${workdir}/funcs.sh

export \
    ads_url \
    date_id \
    db \
    db_host \
    db_password \
    db_user \
    eid

eid=TEST.EID

mysql_execute() {
    echo "$1" | mysql -N -r -u ${db_user} -h ${db_host} -p${db_password} -D ${db}
}

date_id () {
    mysql_execute "select dateID from D_time where date = date(now())"
}

date_id=$(date_id)

test_event () {
    local group="${1}" \
        event="${2}" \
        value="${3}"

    curl -s -o /dev/null \
        -d g=${group} \
        -d e=${event} \
        -d v=${value} \
        -d d=1 \
        -d d=1 \
        -d d=1 \
        -d a=lesson \
        -d a=${eid} \
        -d a=student \
        "${ads_url}/event"

    mysql_execute "select ${event} from F_modality where dateID=${date_id} and ${event}=${value} and context_eid=\"${eid}\""
}

export -f mysql_execute \
    test_event \

./bats/bin/bats modality.bats
