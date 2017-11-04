#!/bin/bash

MY_PATH="$(readlink -f ${0})"
MY_DIR="$(dirname ${MY_PATH})"
CODEROOT="$(cd ${MY_DIR}/../../; pwd)"
DIRS_TO_KEEP=${1:-1}
echo "Keeping latest ${DIRS_TO_KEEP} director(y|ies)."

BUILD_ROOTS="${CODEROOT}/flxweb/flxweb/public/media ${CODEROOT}/flx/pylons/auth/flx/public/media/ ${CODEROOT}/assessment/ui ${CODEROOT}/peerhelp/ui"
for dir in ${BUILD_ROOTS}; do
    echo "Cleaning up ${dir} ..."
    dcnt=$(ls -1d ${dir}/build-* | wc -l)
    if [ $dcnt -eq 1 ]; then
        echo "Only one build directory. Keeping it."
        echo "Kept $(ls -1d ${dir}/build-*)"
    elif [ $dcnt -gt 1 ]; then
        let dcnt=dcnt-${DIRS_TO_KEEP}
        deldirs="$(ls -1d ${dir}/build-* | sort | head --lines=$dcnt | xargs)"
        echo "Deleting ${dcnt} directories: ${deldirs}"
        sudo rm -rf ${deldirs}
        echo "Kept $(ls -1d ${dir}/build-*)"
    else
        echo "Nothing to delete"
    fi
done

