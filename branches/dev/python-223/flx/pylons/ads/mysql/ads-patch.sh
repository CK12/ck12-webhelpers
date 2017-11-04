#! /bin/bash
#
# ADS patch driver script.
#
# This how the patching process works:
#
#  [1] Look for current patch level in ads.Revision table unless the revision
#      is passed in. Specifying a revision number is useful to force applying
#      a patch again.
#
#  [2] Invoke patch scripts needed to be run after the current patch level
#      in the chronological order. For each patch, the generic patch script
#      (with names as <patch id>.patch) is run before app-specific patch
#      script (with names as <patch id>_<app>.patch).
#
# To add new patch:
#
#   [1] For a generic patch (i.e. ADS infrastructure patch), create a new
#       patch file named as <patch id>.patch. Source and use the environment
#       variables from funcs.sh. Do not hard-code environment variable values.
#
#   [2] For app-specific patch (i.e. FlexBook or FlexMath patch), create a patch
#       named as <patch id>_<app>.patch. <app> is fbs for FlexBook or fm for
#       FlexMath. Source funcs.sh as in [1].
#
#   [3] Add the new patch revision to __PATCHES__ file in this directory. 
#
options="[--help] [--ads ads_url] [-h db_host] [-u db_user] -d db_name fbs|fm [base_rev]"
workdir=$(dirname $0)
source ${workdir}/funcs.sh

PATCHES=($(cat __PATCHES__))
app=$1
rev=$2

if [ "${app}" != "fbs" -a "${app}" != "fm" ]; then
	usage
fi

if [ -z ${app} ]; then
	echo 'Please specify target application (fbs or fm)'
	usage
fi

if [ -z ${rev} ]; then
	rev=$(mysql -h ${db_host} -u ${db_user} -p${db_password} ${db} -N -e 'select rev from Revision')
fi

for p in ${PATCHES[*]}; do
    if [ ${p} -gt ${rev} ]; then
	if [ -f ${workdir}/${p}.patch ]; then
		eval "${workdir}/${p}.patch ${args}"
	fi
	if [ -n "${app}" -a -f ${workdir}/${p}_${app}.patch ]; then
	    eval "${workdir}/${p}_${app}.patch ${args}"
	fi
	mysql -h ${db_host} -u ${db_user} -p${db_password} ${db} -e "update Revision set rev=${p}"
	rev=${p}
    fi
done

exit 0
