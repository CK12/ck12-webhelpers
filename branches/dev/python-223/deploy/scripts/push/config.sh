#!/bin/bash

##
## Push the code to machines from servers.list - if the machine hostname does not appear in servers.list, treat it as a standalone node.
##

configurePylons() {
    sed ${SED_OPTIONS} -e "s|^\(data_dir[ ]*=[ ]*\).*$|\1${data_dir}|" -i ${CODE_HOME}/flx/pylons/flx/production.ini
    sed ${SED_OPTIONS} -e "s|^\(vcs_dir[ ]*=[ ]*\).*$|\1${vcs_dir}|" -i ${CODE_HOME}/flx/pylons/flx/production.ini
    sed ${SED_OPTIONS} -e "s|^\(flx_prefix_url[ ]*=[ ]*\).*$|\1${flx_prefix_url}|" -i ${CODE_HOME}/flx/pylons/flx/production.ini
    sed ${SED_OPTIONS} -e "s|^\(default_image_host[ ]*=[ ]*\).*$|\1${default_image_host}|" -i ${CODE_HOME}/flx/pylons/flx/production.ini
    sed ${SED_OPTIONS} -e "s|^\(workdir_prefix[ ]*=[ ]*\).*$|\1${workdir_prefix}|" -i ${CODE_HOME}/flx/pylons/flx/production.ini
    sed ${SED_OPTIONS} -e "s|^\(cache_share_dir[ ]*=[ ]*\).*$|\1${cache_share_dir}|" -i ${CODE_HOME}/flx/pylons/flx/production.ini

    sed ${SED_OPTIONS} -e "s|^\(solr_query_url[ ]*=[ ]*\).*$|\1${solr_query_url}|" -i ${CODE_HOME}/flx/pylons/flx/production.ini
    sed ${SED_OPTIONS} -e "s|^\(solr_update_url[ ]*=[ ]*\).*$|\1${solr_update_url}|" -i ${CODE_HOME}/flx/pylons/flx/production.ini
    sed ${SED_OPTIONS} -e "s|^\(solr_username[ ]*=[ ]*\).*$|\1${solr_username}|" -i ${CODE_HOME}/flx/pylons/flx/production.ini
    sed ${SED_OPTIONS} -e "s|^\(solr_password[ ]*=[ ]*\).*$|\1${solr_password}|" -i ${CODE_HOME}/flx/pylons/flx/production.ini

    sed ${SED_OPTIONS} -e "s|^\(fedora_commons_url[ ]*=[ ]*\).*$|\1${fedora_commons_url}|" -i ${CODE_HOME}/flx/pylons/flx/production.ini
    sed ${SED_OPTIONS} -e "s|^\(cdn_download_url[ ]*=[ ]*\).*$|\1${cdn_download_url}|" -i ${CODE_HOME}/flx/pylons/flx/production.ini
    sed ${SED_OPTIONS} -e "s|^\(cdn_streaming_url[ ]*=[ ]*\).*$|\1${cdn_streaming_url}|" -i ${CODE_HOME}/flx/pylons/flx/production.ini
    sed ${SED_OPTIONS} -e "s|^\(aws_access_key[ ]*=[ ]*\).*$|\1${aws_access_key}|" -i ${CODE_HOME}/flx/pylons/flx/production.ini
    sed ${SED_OPTIONS} -e "s|^\(aws_secret_key[ ]*=[ ]*\).*$|\1${aws_secret_key}|" -i ${CODE_HOME}/flx/pylons/flx/production.ini
    sed ${SED_OPTIONS} -e "s|^\(aws_bucket_name[ ]*=[ ]*\).*$|\1${aws_bucket_name}|" -i ${CODE_HOME}/flx/pylons/flx/production.ini

    sed ${SED_OPTIONS} -e "s|^\(beaker.cache.data_dir[ ]*=[ ]*\).*$|\1${beaker_cache_data_dir}|" -i ${CODE_HOME}/flx/pylons/flx/production.ini
    sed ${SED_OPTIONS} -e "s|^\(beaker.session.data_dir[ ]*=[ ]*\).*$|\1${beaker_session_data_dir}|" -i ${CODE_HOME}/flx/pylons/flx/production.ini
    sed ${SED_OPTIONS} -e "s|^\(beaker.session.secret[ ]*=[ ]*\).*$|\1${flx_beaker_session_secret}|" -i ${CODE_HOME}/flx/pylons/flx/production.ini
    sed ${SED_OPTIONS} -e "s|^\(sqlalchemy.url[ ]*=[ ]*\).*$|\1${sqlalchemy_url}|" -i ${CODE_HOME}/flx/pylons/flx/production.ini
    sed ${SED_OPTIONS} -e "s|^\(sqlalchemy.pool_size[ ]*=[ ]*\).*$|\1${sqlalchemy_pool_size}|" -i ${CODE_HOME}/flx/pylons/flx/production.ini
    sed ${SED_OPTIONS} -e "s|^\(sqlalchemy.max_overflow[ ]*=[ ]*\).*$|\1${sqlalchemy_max_overflow}|" -i ${CODE_HOME}/flx/pylons/flx/production.ini
    sed ${SED_OPTIONS} -e "s|^\(celery.sqlalchemy.url[ ]*=[ ]*\).*$|\1${sqlalchemy_url}|" -i ${CODE_HOME}/flx/pylons/flx/production.ini
    sed ${SED_OPTIONS} -e "s|^\(celery.sqlalchemy.pool_size[ ]*=[ ]*\).*$|\1${celery_sqlalchemy_pool_size}|" -i ${CODE_HOME}/flx/pylons/flx/production.ini
    sed ${SED_OPTIONS} -e "s|^\(celery.sqlalchemy.max_overflow[ ]*=[ ]*\).*$|\1${celery_sqlalchemy_max_overflow}|" -i ${CODE_HOME}/flx/pylons/flx/production.ini

    sed ${SED_OPTIONS} -e "s|^\(redirect_to_login[ ]*=[ ]*\).*$|\1${redirect_to_login}|" -i ${CODE_HOME}/flx/pylons/flx/production.ini
    sed ${SED_OPTIONS} -e "s|^\(ck12_login_prefix[ ]*=[ ]*\).*$|\1${ck12_login_prefix}|" -i ${CODE_HOME}/flx/pylons/flx/production.ini

    sed ${SED_OPTIONS} -e "s|^\(image_use_satellite[ ]*=[ ]*\).*$|\1${image_use_satellite}|" -i ${CODE_HOME}/flx/pylons/flx/production.ini
    sed ${SED_OPTIONS} -e "s|^\(image_satellite_server[ ]*=[ ]*\).*$|\1${image_satellite_server}|" -i ${CODE_HOME}/flx/pylons/flx/production.ini
    sed ${SED_OPTIONS} -e "s|^\(iam_image_satellite_server[ ]*=[ ]*\).*$|\1${iam_image_satellite_server}|" -i ${CODE_HOME}/flx/pylons/flx/production.ini
    sed ${SED_OPTIONS} -e "s|^\(iss_secret[ ]*=[ ]*\).*$|\1${iss_secret}|" -i ${CODE_HOME}/flx/pylons/flx/production.ini
    sed ${SED_OPTIONS} -e "s|^\(iss_passcode[ ]*=[ ]*\).*$|\1${iss_passcode}|" -i ${CODE_HOME}/flx/pylons/flx/production.ini

    sed ${SED_OPTIONS} -e "s|^\(DEFAULT_HTTP_PREFIX[ ]*=[ ]*\).*$|\1\"${default_http_prefix}\"|" -i ${CODE_HOME}/flx/pylons/flx/flx/lib/ck12_pdf_lib/settings.py

    cp -f /opt/2.0/deploy/components/pylons/flx/flx.egg-link /usr/local/lib/python2.6/dist-packages/flx.egg-link

}

enable_apache2_modules() {
    sed -i -e 's,\(APACHE_RUN_.*=\).*,\1www-data,' /etc/apache2/envvars
    chown -R www-data:www-data /var/www 
    a2enmod wsgi
    a2enmod mem_cache
    a2enmod expires
    a2enmod headers
    a2enmod rewrite
}

prepare_apache2_dirs() {
    [ ! -d /etc/apache2/apps ] && mkdir -p /etc/apache2/apps
}

## Not used
prepare_nginx_dirs() {
    [ ! -d /etc/nginx/upstream ] && mkdir -p /etc/nginx/upstream
    [ ! -d /etc/nginx/locations ] && mkdir -p /etc/nginx/locations
}

create_symlink() {
    echo "Linking ${2} to ${1}"
    if [ -f ${2} ] || [ -L ${2} ]; then
        runCmd rm -fv ${2}
    fi
    runCmd ln -svf ${1} ${2}
}

install_mwlib() {
    echo "Installing mwlib"
    (
    cd ${CODE_HOME}/flx/mwlib-0.12.14/
    python setup.py install
    )
}

install_google_analytics() {
    echo "Installing Google Analytics"
    (
    cd ${CODE_HOME}/flx/python-googleanalytics/
    python setup.py install
    )
}

secure_solr() {
    if [ -n "${MY_TOMCAT_HOME}" ]; then
        create_symlink "${CODE_HOME}/deploy/components/tomcat/tomcat-users.xml" "${MY_TOMCAT_HOME}/conf/tomcat-users.xml"
        cp -pvf "${CODE_HOME}/deploy/components/tomcat/solr-web.xml" "${MY_TOMCAT_HOME}/webapps/solr/WEB-INF/web.xml"
    else
        showError "Cannot find tomcat home!!"
    fi
}

## Main
mydir=$(dirname ${0})
cd ${mydir}
source ${mydir}/common.sh

myhostName="$(hostname)"
echo "myhostName=${myhostName}"

if [ -n "${1}" ]; then
    PROFILE="${1}"
else
    echo "No profile specified. Using 'default'"
fi

if [ -n "${2}" ]; then
    mynodeType="${2}"
else
    echo "ERROR! No node type specified. Assuming 'standalone'"
    mynodeType="standalone"
fi

COPY_TO_MOUNT=0
if [ -n "${3}" ]; then
    COPY_HOSTS="${3//,/ }"
    for h in ${COPY_HOSTS}; do
        if [ "${h}" = "${myhostName}" ]; then
            COPY_TO_MOUNT=1
            echo "Copying to mount point after config."
            break
        fi
    done
fi

if [ ! -d "${PROFILE}" ]; then
    echo "ERROR! No such profile directory: ${PROFILE}"
fi

readConfFiles

echo "mynodeType=${mynodeType}"

if [ -d /etc/apache2 ]; then
    enable_apache2_modules
    prepare_apache2_dirs
fi

filelistVar="${mynodeType}_files"
for file in ${!filelistVar}; do
    #echo "Using line: ${file}"
    splitParams ${file}
    src=$(makeAbsolute ${part1})
    dest=$(makeAbsolute ${part2})
    create_symlink "${src}" "${dest}"
done

MY_TOMCAT_HOME=""
if [ -d "${CODE_HOME}/flx/tomcat" ]; then
    MY_TOMCAT_HOME="${CODE_HOME}/flx/tomcat"
elif [ -d "/opt/runtime/tomcat" ]; then
    MY_TOMCAT_HOME="/opt/runtime/tomcat"
fi

## Change config
if [ "${mynodeType}" = "pylons" ] || [ "${mynodeType}" = "pylonsbzr" ]; then

    sed ${SED_OPTIONS} -e "s|\(BROKER_HOST[ ]*=[ ]*\).*$|\1\"${broker_host}\"|" -i ${CODE_HOME}/flx/pylons/flx/celeryconfig_queues.py
    sed ${SED_OPTIONS} -e "s|\(<str name=\"masterUrl\">\).*$|\1${solr_master}</str>|" -i ${CODE_HOME}/flx/search/solr/conf/solrconfig.xml
    configurePylons
    install_google_analytics
    secure_solr

elif [ "${mynodeType}" = "print" ]; then

    sed ${SED_OPTIONS} -e "s|\(BROKER_HOST[ ]*=[ ]*\).*$|\1\"${broker_host}\"|" -i ${CODE_HOME}/flx/pylons/flx/celeryconfig_queues.py
    configurePylons
    install_mwlib
    install_google_analytics

elif [ "${mynodeType}" = "search" ]; then

    sed ${SED_OPTIONS} -e "s|\(BROKER_HOST[ ]*=[ ]*\).*$|\1\"${broker_host}\"|" -i ${CODE_HOME}/flx/pylons/flx/celeryconfig_queues.py
    sed ${SED_OPTIONS} -e "s|\(<str name=\"masterUrl\">\).*$|\1${solr_master}</str>|" -i ${CODE_HOME}/flx/search/solr/conf/solrconfig_slave.xml
    configurePylons
    secure_solr

elif [ "${mynodeType}" = "image" ]; then

    ## Must change the config before unzip of war - otherwise wrong values get picked up by tomcat.
    sed ${SED_OPTIONS} -e "s|\(<str name=\"masterUrl\">\).*$|\1${solr_master}</str>|" -i ${CODE_HOME}/flx/search/solr/conf/solrconfig.xml

    sed ${SED_OPTIONS} -e "s|\(name=\"dbUsername\" value=\)\"[^\"]*\"\([/>]\)|\1\"${fedora_db_username}\"\2|" -i /usr/local/fedora/server/config/fedora.fcfg
    sed ${SED_OPTIONS} -e "s|\(name=\"dbPassword\" value=\)\"[^\"]*\"\([/>]\)|\1\"${fedora_db_password}\"\2|" -i /usr/local/fedora/server/config/fedora.fcfg
    sed ${SED_OPTIONS} -e "s|\(<param name=\"jdbcURL\" value=\)\"jdbc:mysql.*$|\1\"${fedora_jdbc_url}\">|" -i /usr/local/fedora/server/config/fedora.fcfg
    sed ${SED_OPTIONS} -e "s|\(<param name=\"download_bucket_name\" value=\).*$|\1\"${download_bucket_name}\">|" -i /usr/local/fedora/server/config/fedora.fcfg
    sed ${SED_OPTIONS} -e "s|\(<param name=\"streaming_bucket_name\" value=\).*$|\1\"${streaming_bucket_name}\">|" -i /usr/local/fedora/server/config/fedora.fcfg
    sed ${SED_OPTIONS} -e "s|\(<param name=\"aws_access_key_id\" value=\).*$|\1\"${amazon_access_key}\">|" -i /usr/local/fedora/server/config/fedora.fcfg
    sed ${SED_OPTIONS} -e "s|\(<param name=\"aws_secret_access_key\" value=\).*$|\1\"${amazon_secret_key}\">|" -i /usr/local/fedora/server/config/fedora.fcfg

    if [ -n "${MY_TOMCAT_HOME}" ]; then
        [ ! -d "${MY_TOMCAT_HOME}/webapps/fedora" ] && mkdir -p ${MY_TOMCAT_HOME}/webapps/fedora
        rm -rf ${MY_TOMCAT_HOME}/webapps/fedora/*
        unzip -o -d ${MY_TOMCAT_HOME}/webapps/fedora /usr/local/fedora/install/fedora.war
        cp -vf ${CODE_HOME}/flx/amazon/fcrepo/AmazonS3Storage/dist/amazonS3llstore.jar ${MY_TOMCAT_HOME}/webapps/fedora/WEB-INF/lib/amazonS3llstore.jar
        ## BouncyCastle JCE implementation
        cp -vf ${CODE_HOME}/flx/amazon/fcrepo/AmazonS3Storage/lib/bcprov-jdk16-146.jar ${MY_TOMCAT_HOME}/webapps/fedora/WEB-INF/lib/
    else
        showError "Cannot find tomcat home!!"
    fi


elif [ "${mynodeType}" = "web" ]; then

    cp -f /opt/2.0/deploy/components/pylons/flxweb/flxweb.egg-link /usr/local/lib/python2.6/dist-packages/flxweb.egg-link

    sed ${SED_OPTIONS} -e "s|^\(flx_core_api_server[ ]*=[ ]*\).*$|\1${flx_core_api_server}|" -i ${CODE_HOME}/flxweb/development.ini
    sed ${SED_OPTIONS} -e "s|^\(hwp_api_server[ ]*=[ ]*\).*$|\1${hwp_api_server}|" -i ${CODE_HOME}/flxweb/development.ini
    sed ${SED_OPTIONS} -e "s|^\(taxonomy_api_server[ ]*=[ ]*\).*$|\1${taxonomy_api_server}|" -i ${CODE_HOME}/flxweb/development.ini
    sed ${SED_OPTIONS} -e "s|^\(flx_auth_api_server[ ]*=[ ]*\).*$|\1${flx_auth_api_server}|" -i ${CODE_HOME}/flxweb/development.ini
    sed ${SED_OPTIONS} -e "s|^\(beaker.cache.data_dir[ ]*=[ ]*\).*$|\1${flxweb_beaker_cache_data_dir}|" -i ${CODE_HOME}/flxweb/development.ini
    sed ${SED_OPTIONS} -e "s|^\(beaker.session.data_dir[ ]*=[ ]*\).*$|\1${flxweb_beaker_session_data_dir}|" -i ${CODE_HOME}/flxweb/development.ini
    sed ${SED_OPTIONS} -e "s|^\(ga_domain[ ]*=[ ]*\).*$|\1${flxweb_ga_domain}|" -i ${CODE_HOME}/flxweb/development.ini

    sed ${SED_OPTIONS} -e "s|localhost|${backend_server_hostname}|" -i /etc/apache2/apps/90_backend
    
elif [ "${mynodeType}" = "taxonomy" ]; then

    cp -f /opt/2.0/deploy/components/pylons/sts/sts.egg-link /usr/local/lib/python2.6/dist-packages/sts.egg-link

    sed ${SED_OPTIONS} -e "s|^\(sqlalchemy.url[ ]*=[ ]*\).*$|\1${taxonomy_sqlalchemy_url}|" -i ${CODE_HOME}/taxonomy/pylons/sts/production.ini
    sed ${SED_OPTIONS} -e "s|^\(sqlalchemy.pool_size[ ]*=[ ]*\).*$|\1${taxonomy_sqlalchemy_pool_size}|" -i ${CODE_HOME}/taxonomy/pylons/sts/production.ini
    sed ${SED_OPTIONS} -e "s|^\(sqlalchemy.max_overflow[ ]*=[ ]*\).*$|\1${taxonomy_sqlalchemy_max_overflow}|" -i ${CODE_HOME}/taxonomy/pylons/sts/production.ini
    sed ${SED_OPTIONS} -e "s|^\(remote_server_url[ ]*=[ ]*\).*$|\1${taxonomy_remote_server_url}|" -i ${CODE_HOME}/taxonomy/pylons/sts/production.ini
    sed ${SED_OPTIONS} -e "s|^\(ck12_login_url[ ]*=[ ]*\).*$|\1${taxonomy_ck12_login_url}|" -i ${CODE_HOME}/taxonomy/pylons/sts/production.ini
    sed ${SED_OPTIONS} -e "s|^\(cache_dir[ ]*=[ ]*\).*$|\1${taxonomy_cache_dir}|" -i ${CODE_HOME}/taxonomy/pylons/sts/production.ini

elif [ "${mynodeType}" = "hwp" ]; then

    cp -f /opt/2.0/deploy/components/pylons/hwp/hwpserver.egg-link /usr/local/lib/python2.6/dist-packages/hwpserver.egg-link

    sed ${SED_OPTIONS} -e "s|^\(data_dir[ ]*=[ ]*\).*$|\1${hwp_data_dir}|" -i ${CODE_HOME}/hwpserver/production.ini
    sed ${SED_OPTIONS} -e "s|^\(cache_dir[ ]*=[ ]*\).*$|\1${hwp_cache_dir}|" -i ${CODE_HOME}/hwpserver/production.ini
    sed ${SED_OPTIONS} -e "s|^\(fedora_commons_url[ ]*=[ ]*\).*$|\1${hwp_fedora_commons_url}|" -i ${CODE_HOME}/hwpserver/production.ini
    sed ${SED_OPTIONS} -e "s|^\(cdn_download_url[ ]*=[ ]*\).*$|\1${hwp_cdn_download_url}|" -i ${CODE_HOME}/hwpserver/production.ini
    sed ${SED_OPTIONS} -e "s|^\(cdn_streaming_url[ ]*=[ ]*\).*$|\1${hwp_cdn_streaming_url}|" -i ${CODE_HOME}/hwpserver/production.ini
    sed ${SED_OPTIONS} -e "s|^\(beaker.cache.data_dir[ ]*=[ ]*\).*$|\1${hwp_beaker_cache_data_dir}|" -i ${CODE_HOME}/hwpserver/production.ini
    sed ${SED_OPTIONS} -e "s|^\(beaker.session.data_dir[ ]*=[ ]*\).*$|\1${hwp_beaker_session_data_dir}|" -i ${CODE_HOME}/hwpserver/production.ini
    sed ${SED_OPTIONS} -e "s|^\(sqlalchemy.url[ ]*=[ ]*\).*$|\1${hwp_sqlalchemy_url}|" -i ${CODE_HOME}/hwpserver/production.ini
    sed ${SED_OPTIONS} -e "s|^\(sqlalchemy.pool_size[ ]*=[ ]*\).*$|\1${hwp_sqlalchemy_pool_size}|" -i ${CODE_HOME}/hwpserver/production.ini
    sed ${SED_OPTIONS} -e "s|^\(sqlalchemy.max_overflow[ ]*=[ ]*\).*$|\1${hwp_sqlalchemy_max_overflow}|" -i ${CODE_HOME}/hwpserver/production.ini
    sed ${SED_OPTIONS} -e "s|^\(worksheet_server_url[ ]*=[ ]*\).*$|\1${hwp_worksheet_server_url}|" -i ${CODE_HOME}/hwpserver/production.ini
    sed ${SED_OPTIONS} -e "s|^\(ck12_login_prefix[ ]*=[ ]*\).*$|\1${hwp_ck12_login_prefix}|" -i ${CODE_HOME}/hwpserver/production.ini
    sed ${SED_OPTIONS} -e "s|^\(math_server_url[ ]*=[ ]*\).*$|\1${hwp_math_server_url}|" -i ${CODE_HOME}/hwpserver/production.ini

elif [ "${mynodeType}" = "auth" ]; then

    cp -f /opt/2.0/deploy/components/pylons/flx/flx.egg-link /usr/local/lib/python2.6/dist-packages/flx.egg-link

    sed ${SED_OPTIONS} -e "s|^\(flx_prefix_url[ ]*=[ ]*\).*$|\1${auth_flx_prefix_url}|" -i ${CODE_HOME}/flx/pylons/auth/production.ini
    sed ${SED_OPTIONS} -e "s|^\(beaker.session.secret[ ]*=[ ]*\).*$|\1${auth_beaker_session_secret}|" -i ${CODE_HOME}/flx/pylons/auth/production.ini
    sed ${SED_OPTIONS} -e "s|^\(beaker.session.cookie_domain[ ]*=[ ]*\).*$|\1${auth_beaker_session_cookie_domain}|" -i ${CODE_HOME}/flx/pylons/auth/production.ini
    sed ${SED_OPTIONS} -e "s|^\(sqlalchemy.url[ ]*=[ ]*\).*$|\1${auth_sqlalchemy_url}|" -i ${CODE_HOME}/flx/pylons/auth/production.ini
    sed ${SED_OPTIONS} -e "s|^\(sqlalchemy.pool_size[ ]*=[ ]*\).*$|\1${auth_sqlalchemy_pool_size}|" -i ${CODE_HOME}/flx/pylons/auth/production.ini
    sed ${SED_OPTIONS} -e "s|^\(sqlalchemy.max_overflow[ ]*=[ ]*\).*$|\1${auth_sqlalchemy_max_overflow}|" -i ${CODE_HOME}/flx/pylons/auth/production.ini
    sed ${SED_OPTIONS} -e "s|^\(cache_dir[ ]*=[ ]*\).*$|\1${auth_cache_dir}|" -i ${CODE_HOME}/flx/pylons/auth/production.ini
    sed ${SED_OPTIONS} -e "s|^\(beaker.cache.data_dir[ ]*=[ ]*\).*$|\1${auth_beaker_cache_data_dir}|" -i ${CODE_HOME}/flx/pylons/auth/production.ini
    sed ${SED_OPTIONS} -e "s|^\(beaker.session.data_dir[ ]*=[ ]*\).*$|\1${auth_beaker_session_data_dir}|" -i ${CODE_HOME}/flx/pylons/auth/production.ini
    sed ${SED_OPTIONS} -e "s|^\(google_openid_realm[ ]*=[ ]*\).*$|\1${auth_google_openid_realm}|" -i ${CODE_HOME}/flx/pylons/auth/production.ini
    sed ${SED_OPTIONS} -e "s|^\(openid_realm[ ]*=[ ]*\).*$|\1${auth_openid_realm}|" -i ${CODE_HOME}/flx/pylons/auth/production.ini
    sed ${SED_OPTIONS} -e "s|^\(openid_url[ ]*=[ ]*\).*$|\1${auth_openid_url}|" -i ${CODE_HOME}/flx/pylons/auth/production.ini
    sed ${SED_OPTIONS} -e "s|^\(openid_filestore_path[ ]*=[ ]*\).*$|\1${auth_openid_filestore_path}|" -i ${CODE_HOME}/flx/pylons/auth/production.ini
    sed ${SED_OPTIONS} -e "s|^\(google_openid_filestore_path[ ]*=[ ]*\).*$|\1${auth_openid_filestore_path}|" -i ${CODE_HOME}/flx/pylons/auth/production.ini

    for xml in $(find ${CODE_HOME}/flx/pylons/auth/flx/templates -name "*.xml"); do
         sed ${SED_OPTIONS} -e "s|<URI>\(http[s]*://[^/]*\)|<URI>${auth_openid_uri}|" -i ${xml}
    done

elif [ "${mynodeType}" = "cache" ]; then

    echo "Nothing to do!"

elif [ "${mynodeType}" = "standalone" ]; then

    echo "Nothing to do!"

fi

restart_services "${mynodeType}"

if [ ${COPY_TO_MOUNT} -ne 0 ]; then
    if [ "${mynodeType}" = "pylons" ] && [ -n "${share_code_home}" ]; then
        echo "Copying configured code to mount: ${share_code_home}"
        [ ! -d "${share_code_home}" ] && mkdir -pv "${share_code_home}"
        rsync -rlptDvz --checksum --exclude-from ${mydir}/exclude.list ${CODE_HOME}/* ${share_code_home}/
    fi
    if [ "${mynodeType}" = "web" ] && [ -n "${flxweb_share_code_home}" ]; then
        echo "Copying configured code to mount: ${flxweb_share_code_home}"
        [ ! -d "${flxweb_share_code_home}" ] && mkdir -pv "${flxweb_share_code_home}"
        rsync -rlptDvz --checksum --exclude-from ${mydir}/exclude.list ${CODE_HOME}/flxweb ${flx_share_code_home}/
    fi
fi

