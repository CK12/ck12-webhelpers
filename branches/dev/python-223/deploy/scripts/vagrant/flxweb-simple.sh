#/bin/sh

if [ ! -f /var/log/flxweb_setup ];
then
    
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
    ln -s /opt/2.0/deploy/components/apache2/apps/16_lmspractice-ui
    ln -s /opt/2.0/deploy/components/apache2/apps/27_assessment-ui
    ln -s /opt/2.0/deploy/components/apache2/apps/85_asmt-proxy
    sed "s/http:\/\/\(.*\)\.ck12\.org/ http:\/\/lilyserver.ck12.org/" -i 85_asmt-proxy

    
    #backend config
    cd /etc/apache2/apps
    ln -s /opt/2.0/deploy/components/apache2/apps/90_backend .
    
    #enable ssh support
    ln -sf /opt/2.0/deploy/components/apache2/ssl /etc/apache2/ssl
    a2enmod ssl
    /etc/init.d/apache2 restart
    
    touch /var/log/flxweb_setup
    
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
