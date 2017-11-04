#!/bin/bash
paths=${*}
tmpFile="/tmp/update$$"
if [ -z "${paths}" ]; then
    svn up > ${tmpFile} 2>&1
    if [ -f ${tmpFile} ]; then
        ## Remove empty lines
        sed -e '/^$/d' -i ${tmpFile}
        while read line; do
            if [ -z "${line}" ]; then
                continue
            fi
            echo "${line}" | grep "^svn: warning:.*Working copy path.*$" >/dev/null 2>&1
            ret=$?
            if [ $ret -ne 0 ]; then
                echo "${line}" | grep "^svn: warning:.*Base checksum mismatch for.*$" >/dev/null 2>&1
                ret=$?
            fi
            if [ $ret -eq 0 ]; then
                path=$(echo ${prevLine} | sed -e "s|Fetching external item into '\(.[^']*\)':$|\1|")
                echo "problem path=${path}"
                paths="${paths} $(dirname ${path})"
            fi
            prevLine=${line}
        done < ${tmpFile}
    fi
    ## make path list unique
    paths=$(echo ${paths} | xargs -n1 | sort -u | xargs)
fi
if [ -n "${paths}" ]; then
    echo "Fixing externals for paths: [${paths}]"
    for path in ${paths}; do
        svn up --set-depth empty "${path}"
        svn up --set-depth infinity "${path}"
    done
else
    echo "Nothing to fix."
fi
[ -f ${tmpFile} ] && rm -f ${tmpFile}
