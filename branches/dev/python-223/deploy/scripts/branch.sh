#!/bin/bash

SVNROOT="svn://dev.ck12.org/ck12"
REMOVE_DIRS=""
mydir=$(dirname ${0})


usage() {
    echo "Usage: ${0} <source> <target> [<revision>]"
    echo "   where <source> is the path of source branch relative to SVNROOT (eg: trunk/2.0)"
    echo "         <target> is the path of target branch relative to SVNROOT (eg: branches/releases/2.0a)"
    echo "         <revision> is the optional revision number of the source branch to be copied (default: HEAD)"
}

if [ $# -lt 2 ]; then
    echo ">>> Incorrect number of parameters"
    usage
    exit 1
fi

src="${1:-trunk/2.0}"
target="${2}"
rev="${3}"
SVN_USER_ARG=""
[ -n "${SVN_USER}" ] && SVN_USER_ARG="--username ${SVN_USER}"

if [ -z "${target}" ]; then
    echo "Please specify a target."
fi

echo "SVNROOT is: ${SVNROOT}"
tp=$(dirname ${target})

svn list ${SVNROOT}/${target} > /dev/null
if [ $? -eq 0 ]; then
    echo -n "The target branch exists [${SVNROOT}/${target}]. Delete? (y|n) "
    read ans
    if [ "${ans}" != "y" ] && [ "${ans}" != "Y" ]; then
        echo "Cannot proceed since target already exists [${SVNROOT}/${target}]. Exiting ..."
        exit 1
    fi
    echo svn delete ${SVN_USER_ARG} ${SVNROOT}/${target} -m "Deleting existing target ${target}"
    svn delete ${SVN_USER_ARG} ${SVNROOT}/${target} -m "Deleting existing target ${target}" || exit 1
fi

svn list ${SVNROOT}/${tp} > /dev/null
if [ $? -ne 0 ]; then
    echo svn mkdir --parents ${SVNROOT}/${tp} ${SVN_USER_ARG} -m "Created new release target"
    svn mkdir --parents ${SVNROOT}/${tp} ${SVN_USER_ARG} -m "Created new release target" || exit 1
fi

if [ -z "${rev}" ]; then
    rev=$(svn info "${SVNROOT}/${src}" | grep 'Revision:' | sed -e 's|^Revision: \([0-9]*\)|\1|')
fi
echo "Copying revision ${rev} from ${src} to ${target}"

echo svn copy "${SVNROOT}/${src}" -r ${rev} "${SVNROOT}/${target}" ${SVN_USER_ARG} -m "Copied revision ${rev} to ${target}"
svn copy "${SVNROOT}/${src}" -r ${rev} "${SVNROOT}/${target}" ${SVN_USER_ARG} -m "Copied revision ${rev} to ${target}" || exit 1

for dir in ${REMOVE_DIRS}; do
    echo svn delete ${SVNROOT}/${target}/${dir} ${SVN_USER_ARG} -m "Removed dir ${dir}"
    svn delete ${SVNROOT}/${target}/${dir} ${SVN_USER_ARG} -m "Removed dir ${dir}"
done

## Fix externals
export SVNROOT=${SVNROOT}
#bash ${mydir}/fix_externals.sh "${src}" "${target}"

echo "Created branch: ${SVNROOT}/${target}"
