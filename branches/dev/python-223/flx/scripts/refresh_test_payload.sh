#!/bin/bash
#Refreshes test database and bzr data for nosetest.
#Run this before every test runs

removeOldDirs() {
    ## delete old dirs (keep last 3)
    i=1
    dirs=""
    if [ -d /opt/2.0/work ]; then
        for d in $(ls -1 -t /opt/2.0/work/); do
            if [ ${i} -gt 3 ]; then
                dirs="${dirs} /opt/2.0/work/${d}"
            fi
            let i=i+1
        done
    fi
    echo "Deleting: $dirs"
    [ -n "${dirs}" ] && sudo rm -rf $dirs
}

mydir=$(dirname ${0})
cd ${mydir}
prefix=`pwd`
wikidatadir="${prefix}/../../wiki_books_tars/"
load_wiki="false"
load_test_books="true"
load_test_data="false"
load_m0="false"
bzr="false"
apache_user=`grep -s APACHE_RUN_USER /etc/apache2/envvars |sed 's/export APACHE_RUN_USER=//'`
echo "apache_user=${apache_user}"
apache_user=${apache_user:-www-data}
apache_home=`sudo su ${apache_user} -c "echo ~"`
echo "apache_home=${apache_home}"

type="${1:-none}"
load="${2:-yes}"
if [ "$type" == "demo" ]; then
    db="flx2demo"
    auth_db="authdemo"
    dir="/opt/data"
elif [ "$type" == "dev" ]; then
    db="flx2"
    auth_db="auth"
    dir="/opt/data"
    echo "load=$load"
    if [ "$load" == "wiki" ]; then
        load_wiki="true"
        load_test_books="false"
    elif [ "$load" == "clean" ]; then
        load_wiki="false"
        load_test_books="false"
    elif [ "$load" == "m0" ]; then
        load_test_books="false"
        load_m0="true"
    elif [ "$load" = "test" ]; then
        load_test_data="true"
        load_test_books="false"
        load_m0="false"
        load_wiki="false"
    fi
elif [ "$type" == "test" ]; then
    db="flx2test"
    auth_db="authtest"
    dir="/opt/data"
    echo "load=$load"
    if [ "$load" == "wiki" ]; then
        load_wiki="true"
        load_test_books="false"
    elif [ "$load" == "clean" ]; then
        load_wiki="false"
        load_test_books="false"
    elif [ "$load" == "m0" ]; then
        load_test_books="false"
        load_m0="true"
    elif [ "$load" = "test" ]; then
        load_test_data="true"
        load_test_books="false"
        load_m0="false"
        load_wiki="false"
    fi
else
    echo "Did not specify which instance, should be demo, or dev"
    exit 1
fi

#load mysql
#db_script='flx2-db.sh'
db_script="./r2core-db-init -d ${db} -a ${auth_db}"
if [ "$load_test_data" = "true" ]; then
    db_script="${db_script} -b test"
    echo "Loading test data ..."
elif [ "$load_test_books" == "false" ]; then
    db_script="${db_script} -b no" 
    echo "Not loading test data."
else
    db_script="${db_script} -b yes"
    echo "Loading db sample data ..."
fi
echo "Running script: ${db_script} .."
cd ${prefix}/../mysql ; . ${db_script}
cd ${prefix}

if [ "${bzr}" = "true" ]; then
    #
    #  Create bzr repository.
    #
    host=localhost
    cd ${apache_home}
    sudo rm -rf .bzr bzr
    sudo su ${apache_user} -c "bzr init-repo --no-trees bzr+ssh://${host}/${apache_home}"

    #
    #  Create local bzr tree.
    #
    cd ${dir}
    sudo rm -rf bzr .bzr
    sudo su ${apache_user} -c "bzr init bzr+ssh://${host}/${apache_home}/bzr"
    sudo mkdir -p bzr/0
    if [ "$load_test_books" == "true" ]; then 
        sudo tar xzvf ${prefix}/../../test_data/data.tgz ; 
        sudo rm -rf bzr/.bzr 
        echo "Loading bzr data."
    fi
    #sudo chmod -R a+rw ${dir}/bzr
    sudo chown -R ${apache_user}:${apache_user} ${dir}/bzr
    sudo su ${apache_user} -c "bzr checkout bzr+ssh://${host}/${apache_home}/bzr"
    sudo su ${apache_user} -c "bzr add bzr/0"
    sudo su ${apache_user} -c "bzr commit bzr/0 -m 'Initial revision.'"
else
    echo "Creating empty data directory for file cache"
    cd ${dir}
    sudo rm -rf *
    sudo mkdir -p bzr/0
    if [ "$load_test_books" == "true" ]; then 
        sudo tar xzf ${prefix}/../../test_data/data.tgz
        sudo rm -rf bzr/.bzr 
        ## Keep only the image data
        sudo rm -f $(find -name "*.xhtml")
    fi
fi
cd ${prefix}
sudo chown -R ${apache_user}:${apache_user} ${dir}/*
sudo chmod -R a+rw ${dir}/*
sudo chmod -R a+rw ~/.python-eggs

#load wiki data
if [ "$load_wiki" == "true" ] && [ "$type" == "dev" ]; then
    removeOldDirs
    #sudo su ${apache_user} -c "python ${prefix}/../pylons/flx/quick_import_driver.py 'http://authors.ck12.org/wiki/index.php/Single_Variable_Calculus' 3 concept False"
    #sudo su ${apache_user} -c "python ${prefix}/../pylons/flx/quick_import_driver.py 'http://authors.ck12.org/wiki/index.php/CK-12_Chemistry_-_Second_Edition' 3 concept False flx/lib/wiki_importer_lib/support_files/books_1_x_configs/ck12_chem_2nd_edition.cfg"
fi        
#load m0 data
if [ "$load_m0" == "true" ] && [ "$type" == "dev" ]; then
    removeOldDirs
    python ${prefix}/../pylons/flx/quick_import_driver_2.py http://authors2.ck12.org/wiki/index.php/Concept_Algebra 3 concept False; 
    python ${prefix}/../pylons/flx/quick_import_driver_2.py http://authors2.ck12.org/wiki/index.php/Concept_Biology 3 concept False; 
    #python ${prefix}/../pylons/flx/quick_import_driver_2.py http://authors2.ck12.org/wiki/index.php/User:Deepak.babu/CK12-Concept_Algebra 3 concept False; 
    python ${prefix}/../pylons/flx/quick_import_driver_2.py http://authors2.ck12.org/wiki/index.php/%E0%A4%85%E0%A4%B5%E0%A4%A7%E0%A4%BE%E0%A4%B0%E0%A4%A3%E0%A4%BE_%E0%A4%AC%E0%A5%80%E0%A4%9C%E0%A4%97%E0%A4%A3%E0%A4%BF%E0%A4%A4 3 concept False;
fi        
(
sudo ${prefix}/../../deploy/scripts/setup_virtual_envs.sh flx
source /opt/env/flx/bin/activate
python -u ${prefix}/encrypt-members.py --database=mysql://dbadmin:D-coD#43@localhost:3306/flx2?charset=utf8 --module=flx
)
(
sudo ${prefix}/../../deploy/scripts/setup_virtual_envs.sh auth
source /opt/env/auth/bin/activate
python -u ${prefix}/encrypt-members.py --database=mysql://dbadmin:D-coD#43@localhost:3306/auth?charset=utf8 --module=auth
)

