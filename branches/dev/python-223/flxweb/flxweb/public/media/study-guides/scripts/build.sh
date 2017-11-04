#!/bin/bash
mydir=$(dirname ${0})

args=${*}
[ -z "${args}" ] && args="--help"
## Go over all command line args
for arg in ${args}; do
    case ${arg} in
        --apihost=* )
            apihost="$(echo ${arg} | sed -e 's|--apihost=\(.*\)|\1|')"
            ;;
        --timestamp=* )
            timestamp="$(echo ${arg} | sed -e 's|--timestamp=\(.*\)|\1|')"
            ;;
        * )
            echo "Invalid argument: ${arg}"
            echo "Usage: ${0} --apihost=<apihost> [--timestamp=<timestamp>]"
            exit 1
            ;;
    esac
done

[ -z "${apihost}" ] && apihost="gamma.ck12.org"
[ -z "${timestamp}" ] && timestamp="$(date +'%Y%m%d%H%M%S')"
echo "Using apihost: ${apihost}"
echo "Using timestamp: ${timestamp}"

(
cd ${mydir}/..
for f in index.html; do
    if [ "${apihost}" = "www.ck12.org" ]; then
        sed -i'' -e "s|\(GTM-[A-Z0-9]*\)|GTM-NFJ3V2|g" ${f}
        browsehost="interactives"
    elif [ "${apihost}" = "gamma.ck12.org" ]; then
        sed -i'' -e "s|\(GTM-[A-Z0-9]*\)|GTM-WVB47G|g" ${f}
        browsehost="simtest"
    else 
        sed -i'' -e "s|\(GTM-[A-Z0-9]*\)|GTM-WVB47G|g" ${f}
        browsehost="simdev"
    fi
    echo "Using browsehost=${browsehost}"
    echo "Using apihost=${apihost}"
    sed -i'' -e "s|\(window\.timeStamp[ ]*=[ ]*\)\"[0-9]*\";.*$|\1\"${timestamp}\";|" ${f}
    sed -i'' -e "s|\(window\.apihost[ ]*=[ ]*\)\"[0-9a-z\-\.]*\";.*$|\1\"${apihost}\";|" ${f}
    sed -i'' -e "s|\(window\.browsehost[ ]*=[ ]*\)\"[0-9a-z\-\.]*\";.*$|\1\"${browsehost}\";|" ${f}
done
echo "Building project ..."
broccoli_cli=$(which broccoli)
if [ $? -ne 0 ]; then
    sudo npm install -g broccoli-cli
    broccoli_cli=$(which broccoli)
    if [ $? -ne 0 ]; then
        echo ">>> Error installing broccoli-cli. Exiting!" && exit 1
    fi
fi
npm install
npm install --save-dev broccoli
[ -d app ] && rm -rf app
${broccoli_cli} build app

)
