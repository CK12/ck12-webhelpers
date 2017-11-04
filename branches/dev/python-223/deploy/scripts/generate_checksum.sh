#!/bin/bash

help() {
    echo "!!! Usage: ${0} <rev> <branch>"
    echo "!!!   eg: ${0} 78379 branches/releases/2.7.3"
    echo "!!!   or  ${0} 9edc8780ae5e0a75cd0bd127e9a227370f141dd1 release-2.7.4" 
}

REVLIST="${1}"
if [ -z "${REVLIST}" ]; then
    help
    exit 1
fi
if [[ ${REVLIST} == *:* ]]; then
    REVARG="-r${REVLIST}"
    REV=$(echo ${REVLIST} | cut -f2 -d':')
else
    REVARG="-c${REVLIST}"
    REV="${REVLIST}"
fi


BRANCH=${2}
if [ -z "${BRANCH}" ]; then
    help
    exit 2
fi

MD5=$(which md5)
if [ -n "${MD5}" ]; then
    MD5="${MD5} -q"
else
    MD5=$(which md5sum)
fi

if [ -z "${MD5}" ]; then
    echo "No command found for md5."
    exit 1
fi
generate_checksum() {
    echo ""
    echo ">>> Copy-Paste following lines to Release Notes page <<<"
    echo ""
    echo '{|border="1px"'
    echo '! File'
    echo '! MD5 Checksum'
    for pth in ${PATHS}; do
        line=$(${MD5} ${pth})
        sum=$(echo ${line} | cut -f1 -d' ')
        echo "|-"
        echo "| ${pth} || ${sum}"
    done
    echo '|}'
    [ -d ${TARGET_ROOT} ] && rm -rf ${TARGET_ROOT}
}

TARGET_ROOT=/tmp/gchecksum-$$
if [[ ${BRANCH} == *"/"* ]]; then
    ## Subversion branch
    BRANCH_URL="svn://dev.ck12.org/ck12/${BRANCH}"
    PATHS=$(svn diff --summarize ${REVARG} ${BRANCH_URL} | tr -s ' ' | cut -f2 -d' ' | sed -e "s|${BRANCH_URL}/||g")
    #echo PATHS=${PATHS}
    [ -d "${TARGET_ROOT}" ] && rm -rf "${TARGET_ROOT}"
    mkdir -p ${TARGET_ROOT}
    pushd ${TARGET_ROOT} > /dev/null
    echo ">>> Checking out only the changed files in ${BRANCH_URL}/ in ${TARGET_ROOT} ..."
    echo "!!! Continue? [y/n] "
    read ans
    if [ "${ans}" = "n" ]; then
        echo ">>> Cancelling check out. Must specify a checkout root directory for target branch."
        exit 1
    else
        echo -n ">>> Checking out. This will take a few seconds .."
        BRN_ROOT="$(basename ${BRANCH_URL})"
        svn co --depth empty -r${REV} ${BRANCH_URL} ${BRN_ROOT} > /dev/null
        pushd ${TARGET_ROOT}/${BRN_ROOT} > /dev/null
        for pth in ${PATHS}; do
            uniqPaths="${uniqPaths} $(dirname ${pth})"
        done
        uniqPaths=$(echo ${uniqPaths} | xargs -n1 | sort -u)
        #echo "uniqPaths=${uniqPaths}"
        for pth in ${uniqPaths}; do
            for part in $(echo ${pth} | tr '/' ' '); do
                if [ ! -d ${part} ]; then
                    #echo svn update --set-depth empty ${part}
                    svn update -r${REV} --set-depth empty ${part} > /dev/null
                fi
                cd ${part}
            done
            cd ${TARGET_ROOT}/${BRN_ROOT}
            echo -n '.'
        done
        for pth in ${PATHS}; do
            pthdir=$(dirname ${pth})
            pthfile=$(basename ${pth})
            (
                cd ${pthdir}
                #echo svn update ${pthfile}
                svn update -r${REV} ${pthfile} > /dev/null
            )
            echo -n '.'
        done
    fi
    pushd ${TARGET_ROOT}/${BRN_ROOT} > /dev/null
    output="$(generate_checksum)"
else
    git rev-parse --is-inside-work-tree > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        rootdir=$(git rev-parse --show-toplevel)
        cd ${rootdir}
        PATHS=$(git diff-tree --no-commit-id --name-only -r ${REVLIST})
        current_branch="$(git rev-parse --abbrev-ref HEAD)"
        stashout="$(git stash)"
        [[ ${stashout} == *"No local changes"* ]] && skippop="true"
        git checkout "${BRANCH}" || exit 4
        git reset --hard ${REVLIST} || exit 5
        output="$(generate_checksum)"
        git pull --rebase || exit 6
        git checkout ${current_branch}
        [ -z "${skippop}" ] && git stash pop
    else
        echo "!!! Not inside a GIT repository."
        exit 1
    fi
fi

[ -n "${output}" ] && echo "$output"
