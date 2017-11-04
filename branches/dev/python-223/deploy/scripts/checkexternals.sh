#!/bin/bash

if [ "${1}" = "-h" ] || [ "${1}" = "--help" ]; then
    echo "Usage: ${0} [<branch-root> [<codebase>]]"
    echo "       branch-root: Defaults to 'trunk/2.0'"
    echo "       codebase: Defaults to '/opt/2.0'"
    exit
fi

branch_root="${1:-trunk/2.0}"
codebase="${2:-/opt/2.0}"
svn_repo="svn://dev.ck12.org/ck12/"

cd ${codebase}
svn pget svn:externals --recursive . > /tmp/externals
err=0
if [ -f /tmp/externals ]; then
    sed -e '/^$/d' -i /tmp/externals
    while read line; do
        if [ -z "${line}" ]; then
            continue
        fi
        echo "Checking [${line}]"
        echo "${line}" | grep -q " -$" >/dev/null 2>&1
        ret=$?
        if [ $ret -eq 0 ]; then
            continue
        fi
        if [ "${line##${svn_repo}}" != "${line}" ]; then
            echo "${line}" | grep -q "${svn_repo}${branch_root}" >/dev/null 2>&1
            ret=$?
            #echo "ret=$ret"
            if [ $ret -ne 0 ]; then
                echo "!!! Incorrect svn:externals ${line}"
                let err=err+1
            fi
        fi
    done < /tmp/externals

    if [ ${err} -ne 0 ]; then
        echo "Failed svn:externals test"
        exit ${err}
    else
        echo "Passed svn:externals test"
    fi
else
    echo "No svn:externals found for ${branch_root}"
fi
