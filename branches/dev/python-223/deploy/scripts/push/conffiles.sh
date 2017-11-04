#!/bin/bash

##
## Specify config files for all types of nodes
## The files are specified as real-file1,symlink-name1 real-file2,symlink-name2 ...
##

allnode_files="deploy/scripts/services,/etc/init.d/20server \
              "

pylons_files="${allnode_files} \
              flx/search/solr/conf/solrconfig_slave.xml,flx/search/solr/conf/solrconfig.xml \
              deploy/components/celery/celeryd.conf.artifact,/etc/default/celeryd \
              deploy/components/celery/celeryd.initd,/etc/init.d/celeryd \
              deploy/components/celery/celeryd.logrotate,/etc/logrotate.d/celeryd \
              \
              deploy/components/wsgi/flx/flx.wsgi,flx/pylons/flx/flx.wsgi \
              deploy/components/apache2/apps/20_flx,/etc/apache2/apps/20_flx \
              deploy/components/apache2/sites-enabled/R2,/etc/apache2/sites-enabled/R2 \
              \
              flx/pylons/flx/development.ini,flx/pylons/flx/production.ini \
              flx/pylons/flx/celeryconfig.py.artifact,flx/pylons/flx/celeryconfig.py \
              \
              deploy/components/tomcat/tomcat.initd,/etc/init.d/tomcat \
              deploy/components/tomcat/tomcat.default,/etc/default/tomcat \
              "

pylonsbzr_files="${allnode_files} \
              flx/search/solr/conf/solrconfig_slave.xml,flx/search/solr/conf/solrconfig.xml \
              deploy/components/celery/celeryd.conf.vcs,/etc/default/celeryd \
              deploy/components/celery/celeryd.initd,/etc/init.d/celeryd \
              deploy/components/celery/celeryd.logrotate,/etc/logrotate.d/celeryd \
              \
              deploy/components/wsgi/flx/flx.wsgi,flx/pylons/flx/flx.wsgi \
              deploy/components/apache2/apps/20_flx,/etc/apache2/apps/20_flx \
              deploy/components/apache2/sites-enabled/R2,/etc/apache2/sites-enabled/R2 \
              \
              flx/pylons/flx/development.ini,flx/pylons/flx/production.ini \
              flx/pylons/flx/celeryconfig.py.vcs,flx/pylons/flx/celeryconfig.py \
              \
              deploy/components/tomcat/tomcat.initd,/etc/init.d/tomcat \
              deploy/components/tomcat/tomcat.default,/etc/default/tomcat \
              "

search_files="${allnode_files} \
              deploy/components/celery/celeryd.conf.search,/etc/default/celeryd \
              deploy/components/celery/celeryd.initd,/etc/init.d/celeryd \
              deploy/components/celery/celeryd.logrotate,/etc/logrotate.d/celeryd \
              flx/pylons/flx/celeryconfig.py.search,flx/pylons/flx/celeryconfig.py \
              flx/pylons/flx/development.ini,flx/pylons/flx/production.ini \
              \
              deploy/components/tomcat/tomcat.initd,/etc/init.d/tomcat \
              deploy/components/tomcat/tomcat.default,/etc/default/tomcat \
              "

image_files="${allnode_files} \
             deploy/components/fcrepo/truststore,/usr/local/fedora/server/truststore \
             deploy/components/fcrepo/fedora_s3.fcfg,/usr/local/fedora/server/config/fedora.fcfg \
             flx/search/solr/conf/solrconfig_slave.xml,flx/search/solr/conf/solrconfig.xml \
             \
             deploy/components/tomcat/tomcat.initd,/etc/init.d/tomcat \
             deploy/components/tomcat/tomcat.default,/etc/default/tomcat \
             "

print_files="${allnode_files} \
              deploy/components/celery/celeryd.conf.print,/etc/default/celeryd \
              deploy/components/celery/celeryd.initd,/etc/init.d/celeryd \
              deploy/components/celery/celeryd.logrotate,/etc/logrotate.d/celeryd \
              flx/pylons/flx/celeryconfig.py.print,flx/pylons/flx/celeryconfig.py \
              flx/pylons/flx/development.ini,flx/pylons/flx/production.ini \
              "

web_files="${allnode_files} \
           deploy/components/wsgi/flxweb/flxweb.wsgi,flxweb/flxweb.wsgi \
           deploy/components/apache2/apps/99_flxweb,/etc/apache2/apps/99_flxweb \
           deploy/components/apache2/apps/90_backend,/etc/apache2/apps/90_backend \
           deploy/components/apache2/sites-enabled/R2,/etc/apache2/sites-enabled/R2 \
           flxweb/development.ini,flxweb/production.ini \
          "

cache_files=""

taxonomy_files="${allnode_files} \
                deploy/components/wsgi/sts/sts.wsgi,taxonomy/pylons/sts/sts.wsgi \
                deploy/components/apache2/apps/40_sts,/etc/apache2/apps/40_sts \
                deploy/components/apache2/sites-enabled/R2,/etc/apache2/sites-enabled/R2 \
                taxonomy/pylons/sts/development.ini,taxonomy/pylons/sts/production.ini \
               "

hwp_files="${allnode_files} \
           deploy/components/wsgi/hwp/hwp.wsgi,hwpserver/hwp.wsgi \
           deploy/components/apache2/apps/30_hwp,/etc/apache2/apps/30_hwp \
           deploy/components/apache2/sites-enabled/R2,/etc/apache2/sites-enabled/R2
           hwpserver/development.ini,hwpserver/production.ini \
          "

auth_files="${allnode_files} \
            deploy/components/wsgi/auth/auth.wsgi,flx/pylons/auth/auth.wsgi \
            deploy/components/apache2/apps/10_auth,/etc/apache2/apps/10_auth \
            deploy/components/apache2/sites-enabled/R2,/etc/apache2/sites-enabled/R2
            flx/pylons/auth/development.ini,flx/pylons/auth/production.ini \
           "

standalone_files="${allnode_files} \
                  deploy/components/celery/celeryd.conf.default,/etc/default/celeryd \
                  deploy/components/celery/celeryd.initd,/etc/init.d/celeryd \
                  deploy/components/celery/celeryd.logrotate,/etc/logrotate.d/celeryd \
                  \
                  deploy/components/wsgi/flx/flx.wsgi,flx/pylons/flx/flx.wsgi \
                  deploy/components/wsgi/hwp/hwp.wsgi,hwpserver/hwp.wsgi \
                  deploy/components/wsgi/sts/sts.wsgi,taxonomy/pylons/sts/sts.wsgi \
                  deploy/components/wsgi/flxweb/flxweb.wsgi,flxweb/flxweb.wsgi \
                  \
                  deploy/components/apache2/apps/10_auth,/etc/apache2/apps/10_auth \
                  deploy/components/apache2/apps/20_flx,/etc/apache2/apps/20_flx \
                  deploy/components/apache2/apps/30_hwp,/etc/apache2/apps/30_hpw \
                  deploy/components/apache2/apps/40_sts,/etc/apache2/apps/40_sts \
                  deploy/components/apache2/apps/99_flxweb,/etc/apache2/apps/99_flxweb \
                  \
                  deploy/components/apache2/sites-enabled/R2,/etc/apache2/sites-enabled/R2
                  deploy/components/tomcat/tomcat.initd,/etc/init.d/tomcat \
                  deploy/components/tomcat/tomcat.default,/etc/default/tomcat \
                  \
                  flx/pylons/flx/celeryconfig.py.default,flx/pylons/flx/celeryconfig.py \
                  \
                  flx/pylons/flx/development.ini,flx/pylons/flx/production.ini \
                  flx/pylons/auth/development.ini,flx/pylons/auth/production.ini \
                  taxonomy/pylons/sts/development.ini,taxonomy/pylons/sts/production.ini \
                  hwpserver/development.ini,hwpserver/production.ini \
                  \
                  deploy/components/fcrepo/truststore,/usr/local/fedora/server/truststore \
                  deploy/components/fcrepo/fedora_local.fcfg,/usr/local/fedora/server/config/fedora.fcfg \
                  flxweb/development.ini,flxweb/production.ini \
                  "

