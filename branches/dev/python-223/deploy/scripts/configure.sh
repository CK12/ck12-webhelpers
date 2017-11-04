#!/bin/bash -x

[ "$(id -u)" != "0" ] && echo "Must run as root!" && exit 1

CK12_ROOT="/opt/2.0"
OPEN_SEARCH_PATH='deploy/scripts/open_search.py'

export NODE_ENV=development

for arg in ${*}; do
    case ${arg} in
        skip_env_setup=* )
            skip_env_setup="$(echo ${arg} | sed -e 's|skip_env_setup=\(.*\)|\1|')"
            ;;
        skip_db_patches=* )
            skip_db_patches="$(echo ${arg} | sed -e 's|skip_db_patches=\(.*\)|\1|')"
            ;;
        * )
            echo "Invalid argument: ${arg}"
            ;;
    esac
done

echo ">>> skip_env_setup=${skip_env_setup}"
echo ">>> skip_db_patches=${skip_db_patches}"

sudo chmod a+rw -R ${CK12_ROOT}/*
sudo chown root:root ${CK12_ROOT}/deploy/components/celery/celeryd.logrotate ${CK12_ROOT}/deploy/components/tomcat/tomcat.logrotate
sudo chmod go-w /etc/logrotate.d/*
sudo chmod a-x /etc/logrotate.d/*

cd $CK12_ROOT/deploy/scripts
./install_yarn_if_missing.sh

sudo npm set registry http://qarel3.ck12.org/sinopia
sudo yarn global add node-gyp

## Get the IP2LOCATION DB.
sudo bash ${CK12_ROOT}/deploy/components/ip2location/getfile.sh

TIMESTAMP=`date "+%Y%m%d%H%M%S"`
if [ -d "$CK12_ROOT/flxweb" ]; then
    echo "##############################################"
    echo " Minifying flxweb ui"
    echo "##############################################"
    cd $CK12_ROOT/deploy/scripts
    sudo ./minify "${CK12_ROOT}" "${TIMESTAMP}"
    [ $? -ne 0 ] && exit 1
fi

##
## Do not build content_api on standalone boxes
##
#if [ -d "$CK12_ROOT/content_api" ]; then
#    echo "##############################################"
#    echo " Minifying content_api"
#    echo "##############################################"
#    cd $CK12_ROOT/content_api
#    sudo npm install gulp
#    sudo ./build.sh
#    [ $? -ne 0 ] && exit 1
#fi

if [ -d "$CK12_ROOT/assessment" ]; then
    echo "##############################################"
    echo " Minifying assessment ui"
    echo "##############################################"
    cd $CK12_ROOT/assessment
    sudo yarn
    sudo grunt build --timestamp=$TIMESTAMP
    [ $? -ne 0 ] && exit 1
fi

if [ -d "$CK12_ROOT/peerhelp/ui" ]; then
    echo "##############################################"
    echo " Minifying peerhelp ui"
    echo "##############################################"
    cd $CK12_ROOT/peerhelp/ui
    sudo ./build.sh "${TIMESTAMP}"
    [ $? -ne 0 ] && exit 1
fi

if [ -d "$CK12_ROOT/flxweb" ]; then
    echo "##############################################"
    echo " Adding buildnumber to flxweb"
    echo "##############################################"
    cd $CK12_ROOT/deploy/scripts
    sudo ./buildnumber.sh "${CK12_ROOT}" "${CK12_ROOT}/flxweb/development.ini"
fi

if [ -d "$CK12_ROOT/flx/pylons/auth" ]; then
    echo "##############################################"
    echo " Adding buildnumber to Auth"
    echo "##############################################"
    cd $CK12_ROOT/deploy/scripts
    sudo ./buildnumber.sh "${CK12_ROOT}" "${CK12_ROOT}/flx/pylons/auth/development.ini"
fi

echo "Setting Host Url for Open Search XML"
chmod +x "$CK12_ROOT/$OPEN_SEARCH_PATH"
"$CK12_ROOT/$OPEN_SEARCH_PATH" "$CK12_ROOT"

echo "##############################################"
echo " Building dexterjs"
echo "##############################################"
cd $CK12_ROOT/dexter/web/public/media/dexterjs/
sudo yarn
sudo grunt build || exit 1
sudo grunt uglify || exit 1

if [ "${skip_env_setup}" != "true" ]; then
    echo "Setting up virutal environments ..."
    sudo bash $CK12_ROOT/deploy/scripts/setup_virtual_envs.sh
else
    echo "Skipping virutal environments setup ..."
fi

if [ "${skip_db_patches}" = "true" ]; then
    echo ">>> Skipping DB patches"
else
    echo "Applying DB Patches ..."
    sudo bash $CK12_ROOT/deploy/scripts/apply_db_patches.sh
fi

sudo /etc/init.d/20server restart-lite
sleep 10

cd $CK12_ROOT/deploy/scripts
#sudo ./clear_redis_cache.sh

hostname=$(hostname -f)
[ "${hostname}" = "localhost" ] && hostname=$(hostname)
[ "${hostname%%.ck12.org}" = "${hostname}" ] && hostname="${hostname}.ck12.org"
echo hostname=${hostname}

#echo "##############################################"
#echo " Building backend cache"
#echo "##############################################"
#./update_flx_cache.sh localhost

#echo "##############################################"
#echo " Building frontend cache"
#echo "##############################################"
#./update_flxweb_cache.sh ${hostname}

echo "ALL DONE!"
