#/bin/sh

if [ ! -f /var/log/flxweb_setup ];
then

    #installations
    echo "Installing essentials"

    apt-get update
    apt-get install -y -qq python-setuptools software-properties-common python-pip curl git subversion redis-server python-dev

    echo "Installing pylons and dependencies"

    pip install beaker==1.8.1
    pip install BeautifulSoup
    pip install babel
    pip install webob==1.2
    pip install python-dateutil
    pip install redis
    pip install beaker-extensions

    easy_install pylons
    easy_install Jinja2
    easy_install python_memcached

    echo "Installing node and tools from the node world..."
    cd /opt
    git clone https://github.com/creationix/nvm.git /opt/.nvm
    source /opt/.nvm/nvm.sh
    nvm install stable
    n=$(which node);n=${n%/bin/node}; chmod -R 755 $n/bin/*; cp -r $n/{bin,lib,share} /usr/local

    npm install -g docco
    npm install -g grunt-cli
    npm install -g bower


    #apache install and config
    echo "Installing & Configuring Apache"

    apt-get install -y -qq apache2 libapache2-mod-wsgi

    mkdir /etc/apache2/www-data
    sed -i -e 's,\(APACHE_RUN_.*=\).*,\1www-data,' /etc/apache2/envvars
    chown -R www-data:www-data /var/www   # this is where the egg cache will be under

    a2enmod wsgi
    a2enmod mem_cache
    a2enmod expires
    a2enmod headers
    a2enmod rewrite
    a2enmod proxy
    a2enmod proxy_http

    #installing node modules
    echo "Installing node modules"
    cd /opt/2.0
    npm install


    #flxweb directory setup
    echo "Setting up flxweb"

    ln -s /vagrant /opt/2.0
    cd /opt/2.0
    if [ ! -d "log" ]; then
      echo "Creating log directory"
      mkdir log
    fi
    cd flxweb
    ln -s development.ini production.ini
    if [ ! -d "data" ]; then
      echo "Creating data directory"
      mkdir data
    fi
    chmod a+w data


    ## Flxweb wsgi link
    cd /opt/2.0/flxweb
    ln -sf /opt/2.0/deploy/components/wsgi/flxweb/flxweb.wsgi .

    #python egg-link
    cd /usr/local/lib/python2.7/dist-packages
    cp /opt/2.0/deploy/components/pylons/flxweb/flxweb.egg-link .

    #apache sites enabled
    echo "Configuring flxweb with apache"
    cd /etc/apache2/sites-enabled
    rm -f *
    ln -s /opt/2.0/deploy/components/apache2/sites-enabled/R2 .

    #flxweb specific config
    cd /etc/apache2
    if [ ! -d "apps" ]; then
      echo "Creating apps directory"
      mkdir apps
    fi
    cd apps
    ln -s /opt/2.0/deploy/components/apache2/apps/99_flxweb .
    ln -s /opt/2.0/deploy/components/apache2/apps/27_assessment-ui .
    ln -s /opt/2.0/deploy/components/apache2/apps/28_assessment-tools .
    ln -s /opt/2.0/deploy/components/apache2/apps/75_peer_help_ui .

    #backend config
    cd /etc/apache2/apps
    ln -s /opt/2.0/deploy/components/apache2/apps/90_backend .
    ln -s /opt/2.0/deploy/components/apache2/apps/98_backend_proxy .
    

    #enable ssh support
    ln -sf /opt/2.0/deploy/components/apache2/ssl /etc/apache2/ssl
    a2enmod ssl
    /etc/init.d/apache2 restart


    touch /var/log/flxweb_setup
    
    sudo sh -c 'echo "#mapping for gamma https proxy\n54.84.176.198 gamma.ck12.org" >> /etc/hosts'

    if [ ! -e "/var/run/apache2" ]; then
        mkdir /var/run/apache2
    fi
    /etc/init.d/apache2 restart
else
    if [ ! -e "/var/run/apache2" ]; then
        mkdir /var/run/apache2
    fi
    /etc/init.d/apache2 restart
fi
ifconfig eth1 | grep 'inet addr:' | cut -d: -f2 | awk '{ print "IP ADDRESS: "$1}'
