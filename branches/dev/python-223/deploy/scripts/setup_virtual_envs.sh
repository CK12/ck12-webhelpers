#!/bin/bash
##
## Set up all virtual environemnts
## 

INSTALL_ENVS="${1}"
WORKROOT=/opt/2.0
server_dirs="flxweb:flxweb flxadmin:adminapp/pylons/flxadmin flx:flx/pylons/flx auth:flx/pylons/auth asmt:assessment/engine/pyramid peerhelp:peerhelp/core/pyramid taxonomy:taxonomy/pylons/sts iss:iss/pylons/iss"
for d in ${server_dirs}; do
    cd ${WORKROOT}
    envName=$(echo $d | sed 's|^\([^:]*\):\(.*\)$|\1|')
    workdir=$(echo $d | sed 's|^\([^:]*\):\(.*\)$|\2|')
    if [ -n "${INSTALL_ENVS}" ]; then
        echo ${INSTALL_ENVS} | grep "\<${envName}\>" || continue
    fi
    echo "####################################################"
    echo "Processing [${d}]"
    echo "####################################################"
    cd $workdir
    envDir=/opt/env/$envName
    if [ ! -d /opt/env/$envName ]; then
        echo "Creating ${envDir} ..."
        virtualenv $envDir
    else
        echo "Already exists ${envDir}"
    fi
    echo "####################################################"
    echo "Setting up ${envDir} ..."
    echo "####################################################"
    source $envDir/bin/activate
    which python
    pip install --upgrade pip
    python setup.py develop || exit 1
    (cd ${WORKROOT}/deploy/components/beaker/mongodb_beaker; python setup.py develop)
    ${WORKROOT}/deploy/components/beaker/patch_beaker.sh || echo "Patch already applied?"
    deactivate
done
echo "All done!"

