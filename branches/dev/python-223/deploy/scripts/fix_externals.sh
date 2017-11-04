#!/bin/bash

SVNROOT="svn://dev.ck12.org/ck12"
if [ "$1" = "-h" ] || [ -z "${1}" ]; then
    echo "Usage: ${0} <BAD-EXTERNAL-BRANCH> <FIX-IN-BRANCH>"
    echo "    where BAD-EXTERNAL-BRANCH is the wrong branch name used in externals AND"
    echo "          FIX-IN-BRANCH is the branch where these incorrect externals are present."
    exit 1
fi

BAD_EXTERNAL_BRANCH="${1:-trunk/2.0}"
FIX_IN_BRANCH="${2}"

if [ -z "${FIX_IN_BRANCH}" ]; then
    echo "Please specify a FIX_IN_BRANCH."
    exit 1
fi

echo "SVNROOT is: ${SVNROOT}"

## Get externals
## FIXME: Need to process output correctly
if [ -n "${AUTO_GET_EXTERNALS}" ]; then
    externals=""
    svn_output="$(svn pget svn:externals --recursive ${SVNROOT}/${FIX_IN_BRANCH} | grep -v '^[ ]*$')"
    for item in ${svn_output}; do
        dirrel="${item##${SVNROOT}/${FIX_IN_BRANCH}/}"
        if [ -n "${externals}" ]; then
            externals="${externals} ${dirrel}"
        else
            externals="${dirrel}"
        fi
    done
    echo "externals=${externals}"
fi
## Fix externals
externals="flx/pylons/auth/flx/public assessment/app/www assessment/ui/public/lib assessment/ui/public/lib/jquery assessment/ui/public/themes/honeydew/external-css adminapp/pylons/flxadmin/flxadmin/public/media/js peerhelp/ui AthenaApp/public lmspractice/ui flx/f2pdf/drivers/lib_external"
tmpDir=/tmp/$$
for external in ${externals}; do
    echo "Processing ${external} ..."
    rm -rf ${tmpDir}
    mkdir -p ${tmpDir}
    pushd ${tmpDir} > /dev/null 2>&1
    svn co -N ${SVNROOT}/${FIX_IN_BRANCH}/${external}
    extName=$(basename ${external})
    cd ${extName}
    svn pget svn:externals . > ext
    echo "Original externals"
    cat ext
    sed -e "s|${BAD_EXTERNAL_BRANCH}|${FIX_IN_BRANCH}|" -i ext
    echo "Setting externals ..."
    cat ext
    svn pset svn:externals . -F ext
    svn commit . -m 'Fixed svn externals'
    popd >/dev/null 2>&1
done


