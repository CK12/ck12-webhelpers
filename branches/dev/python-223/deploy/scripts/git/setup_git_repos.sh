#!/bin/bash

MY_DIR="$(dirname ${0})"
CODE_ROOT="$(cd ${MY_DIR}/../../../; pwd)"
GIT_MAPPINGS="assessment:assessment.git peerhelp:peerhelp.git tools:operations.git"

show_help() {
    echo "Usage: ${0} giturl=<git-url-excluding-repo> gitlocalbase=<local-dir-for-git> \\ "
    echo "            assessment_branch=<assessment-branch-to-checkout> peerhelp_branch=<peerhelp-branch-to-checkout> \\ "
    echo "            tools_branch=<operations-branch-to-checkout> revert=<true|false>"
    echo "       Each of these parameters have a default as follows:"
    echo "       giturl: git@github.com:CK-12"
    echo "       gitlocalbase: /opt/branches"
    echo "       assessment_branch: master"
    echo "       peerhelp_branch: master"
    echo "       tools_branch: master"
    echo "       revert: false (true will revert all local changes - used for automated build)"
    echo ""
}

for arg in ${*}; do
    case ${arg} in
        assessment_branch=* )
            assessment_branch="$(echo ${arg} | sed -e 's|assessment_branch=\(.*\)|\1|')"
            ;;
        peerhelp_branch=* )
            peerhelp_branch="$(echo ${arg} | sed -e 's|peerhelp_branch=\(.*\)|\1|')"
            ;;
        tools_branch=* )
            tools_branch="$(echo ${arg} | sed -e 's|tools_branch=\(.*\)|\1|')"
            ;;
        giturl=* )
            giturl="$(echo ${arg} | sed -e 's|giturl=\(.*\)|\1|')"
            ;;
        gitlocalbase=* )
            gitlocalbase="$(echo ${arg} | sed -e 's|gitlocalbase=\(.*\)|\1|')"
            ;;
        revert=* )
            revert="$(echo ${arg} | sed -e 's|revert=\(.*\)|\1|')"
            ;;
        "help" | "--help" )
            show_help
            exit 1
            ;;
        * )
            echo "Invalid argument: ${arg}"
            ;;
    esac
done

[ -z "${assessment_branch}" ] && assessment_branch="master"
[ -z "${peerhelp_branch}" ] && peerhelp_branch="master"
[ -z "${tools_branch}" ] && tools_branch="master"
[ -z "${giturl}" ] && giturl="git@github.com:CK-12"
LOCAL_GIT_BASE=${gitlocalbase:-/opt/branches}

for mapping in ${GIT_MAPPINGS}; do
    localDir=$(echo $mapping | sed 's|^\([^:]*\):\(.*\)$|\1|')
    repo=$(echo $mapping | sed 's|^\([^:]*\):\(.*\)$|\2|')
    echo ">>> Processing ${repo} with localDir=${localDir}"

    ## Always clean operations repo
    [ "${repo}" = "operations.git" ] && sudo rm -rf ${LOCAL_GIT_BASE}/${localDir}
    if [ ! -d ${LOCAL_GIT_BASE}/${localDir} ]; then
        echo ">>> ${LOCAL_GIT_BASE}/${localDir} doesn't exist. Cloning ..."
        sudo mkdir -p ${LOCAL_GIT_BASE}
        sudo chmod a+rw ${LOCAL_GIT_BASE}
        cd ${LOCAL_GIT_BASE}
        if [ "${repo}" != "operations.git" ]; then
            git clone ${giturl}/${repo}
        else
            echo ">>> Special setup for ${repo}"
            sudo mkdir -p ${localDir}
            sudo chmod -R a+rw ${LOCAL_GIT_BASE}/${localDir}
            cd ${localDir}
            git init
            git remote add origin ${giturl}/${repo}
            git fetch origin
            git checkout  origin/${tools_branch} -- ansible
            sudo chmod -R a+rw ${LOCAL_GIT_BASE}/${localDir}
        fi
    fi

    cd ${CODE_ROOT}
    echo ">>> Setting up ${CODE_ROOT}"
    if [ ! -L ${localDir} ]; then
        echo ">>> Setting up symlink ${localDir} -> ${LOCAL_GIT_BASE}/${localDir}"
        [ -d ${localDir} ] && sudo rm -rf ${localDir}
        ln -s ${LOCAL_GIT_BASE}/${localDir} .
    fi

    if [ "${repo}" != "operations.git" ]; then
        cd ${localDir}
        if [ "${revert}" = "true" ]; then
            echo ">>> Reverting all local changes"
            git fetch
            git reset --hard
        else
            echo ">>> Stashing local changes (if any) ..."
            stashout="$(git stash)"
            [[ ${stashout} == *"No local changes"* ]] && skippop="true"
        fi

        eval brn=\${localDir}_branch
        echo ">>> Checking out ${!brn}"
        git checkout ${!brn}
        git pull
        [ -z "${skippop}" ] && git stash pop
    fi

done

