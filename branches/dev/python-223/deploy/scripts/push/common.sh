#!/bin/bash

showError() {
    echo "ERROR: ${1}"
    echo "Exiting"
    exit 1
}

readConfFiles() {
    source ${mydir}/conffiles.sh

    if [ -f "${PROFILE}/servers.list" ]; then
        source ${PROFILE}/servers.list
    else
        showError "No ${PROFILE}/servers.list"
    fi

    if [ -f "${PROFILE}/conffiles.vars" ]; then
        source ${PROFILE}/conffiles.vars
    else
        showError "No ${PROFILE}/conffiles.vars"
    fi
}


build_number(){
   sudo /opt/2.0/deploy/scripts/buildnumber.sh ${CODE_HOME}/flxweb ${CODE_HOME}/flxweb/development.ini
}


getHostsByType() {
    type="${1}"
    readConfFiles
    echo "${!type}"
}

splitParams() {
    part1=""
    part2=""
    line="${1}"
    part1=$(echo ${line} | cut -f1 -d',')
    part2=$(echo ${line} | cut -f2 -d',')
}

makeAbsolute() {
    path="${1}"
    if [ "${path##/}" != "${path}" ]; then
        ## starts with /
        echo ${path}
    else
        echo ${CODE_HOME}/${path}
    fi
}

restartService() {
    service="${1}"
    echo "Restarting ${service}"
    case ${service} in
        tomcat)
            if [ -a /etc/init.d/tomcat ]; then
                sudo /etc/init.d/tomcat stop
                sleep 10
                sudo /etc/init.d/tomcat start
            elif [ -d /opt/runtime/tomcat/bin ]; then
                sudo /opt/runtime/tomcat/bin/shutdown.sh
                sleep 10
                sudo /opt/runtime/tomcat/bin/startup.sh
            elif [ -d ${CODE_HOME}/flx/tomcat/bin ]; then
                sudo ${CODE_HOME}/flx/tomcat/bin/shutdown.sh
                sleep 10
                sudo ${CODE_HOME}/flx/tomcat/bin/startup.sh
            else
                showError "Cannot find tomcat scripts."
            fi
            ;;

        paster)
            initScript="paster"
            sudo /etc/init.d/${initScript} restart
            ;;

        flxweb-paster)
            initScript="flxweb-paster"
            sudo /etc/init.d/${initScript} restart
            ;;

        sts-paster)
            initScript="sts-paster"
            sudo /etc/init.d/${initScript} restart
            ;;

        hwp-paster)
            initScript="hwp-paster"
            sudo /etc/init.d/${initScript} restart
            ;;

        auth-paster)
            initScript="auth-paster"
            sudo /etc/init.d/${initScript} restart
            ;;

        celeryd)
            sudo /etc/init.d/celeryd restart
            ;;

        nginx)
            sudo /etc/init.d/nginx restart
            ;;

        varnish)
            sudo /etc/init.d/varnish restart
            ;;

        apache2)
            sudo /etc/init.d/apache2 restart
            ;;

        *)
            showError "Unknown service ${service}"
            ;;
    esac
}

restart_services() {
    mynodeType="${1}"
    echo "Restarting services for ${mynodeType} ..."
    serviceVar="${mynodeType}_services"
    #echo "serviceVar=${serviceVar} ${!serviceVar}"
    for service in ${!serviceVar}; do
        restartService ${service}
    done
}


runCmd() {
    echo "Running $*"
    $*
    [ $? -ne 0 ] && showError "Error running command"
}


CODE_HOME="${CODE_HOME:-/opt/2.0}"
PROFILE="${PROFILE:-default}"
NODETYPES="pylons pylonsbzr search image print xdt web taxonomy hwp auth cache standalone"
SED_OPTIONS="--follow-symlinks"

## {nodetype}_services vars list all services that should be restarted on that node
standalone_services="apache2 tomcat celeryd"
pylons_services="apache2 tomcat celeryd"
pylonsbzr_services="apache2 tomcat celeryd"
search_services="tomcat celeryd"
image_services="tomcat"
print_services="celeryd"
web_services="apache2"
taxonomy_services="apache2"
hwp_services="apache2"
auth_services="apache2"
cache_services="varnish"

## {nodetype}_dirs vars list all directories to be synced over rsync
pylons_dirs="flx deploy log"
pylonsbzr_dirs="${pylons_dirs}"
search_dirs="${pylons_dirs}"
print_dirs="${pylons_dirs}"
image_dirs="${pylons_dirs}"
auth_dirs="${pylons_dirs}"
web_dirs="flxweb deploy log"
taxonomy_dirs="taxonomy deploy log"
hwp_dirs="hwpserver deploy log"
standalone_dirs="flx deploy flxweb log"
cache_dirs="deploy log"
