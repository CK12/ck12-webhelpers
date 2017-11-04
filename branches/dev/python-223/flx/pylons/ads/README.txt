# $Id$

===============================================================================
 Steps to set up ADS
===============================================================================

1. Pylons app is flx/pylons/ads. By default, development.ini points to MySQL running on localhost.

2. Install required libraries:

   $ sudo apt-get install antlr python-antlr

   (Note: antlr 2.7.7 required. antlr 3.x will not work.)

3. Set up ADS Python distribution:

   $ cd /usr/local/lib/python2.6/dist-packages
   $ sudo cp /opt/2.0/deploy/components/pylons/ads/ads.egg-link .

4. Set up WSGI app:

   # (Mandatory) Set up WSGI app
   $ cd /opt/2.0/flx/pylons/ads
   $ sudo ln -sf /opt/2.0/deploy/components/wsgi/ads/ads.wsgi .
   $ sudo ln -sf development.ini production.ini
       
5. ADS Apache configuration:
    
   # (Option 1) Allow all ADS requests at port 80
   $ cd /etc/apache2/apps
   $ sudo ln -s /opt/2.0/deploy/components/apache2/apps/60_ads .
   $ sudo service apache2 graceful

   # (Option 2) Enable ADS at port 80 for non-query requests and port 8000 for query requests
   $ cd /etc/apache2/apps
   $ sudo ln -s /opt/2.0/deploy/components/apache2/apps/60_ads_noquery .
   $ cd /etc/apache2/sites-enabled
   $ sudo ln -s /opt/2.0/deploy/components/apache2/sites-enabled/ADS .
   $ sudo service apache2 graceful

6. Create ADS database:

   $ cd /opt/2.0/flx/pylons/ads/mysql
   $ ./ads-db.sh -d ads
   $ ./ads-init-time.sh -d ads
       
7. Load application-specific meta data:

   (For FlexBook)
   $ ./ads-init-fbs.sh -d ads
   $ ./ads-init-hwp.sh -d ads

   (For FlexMath)
   $ ./ads-init-fm.sh -d ads

8. Graceful Apache

   $ sudo service apache2 graceful

9. Set up celeryd:

   # (Option 1) celeryd for ADS only
   $ sudo rm /etc/init.d/celeryd
   $ sudo ln -s /opt/2.0/deploy/components/celery/celeryd.initd /etc/init.d/celeryd
   $ sudo rm /etc/default/celeryd
   $ sudo ln -s /opt/2.0/deploy/components/celery/celeryd.conf.ads /etc/default/celeryd
   $ sudo /etc/init.d/celeryd restart
   
   # (Option 2) Shared celeryd for FlexBook and ADS
   $ sudo /opt/2.0/flx/pylons/ads/celeryd.initd start
       
10. Run ADS unit tests:

   $ cd /opt/2.0/flx/pylons/ads
   $ nosetests
   	
11. Verify ADS status:

   (If you go with Option 1 in Step 5)
   http://localhost/ads/demo

   (If you go with Option 2 in Step 5)
   http://localhost:8000/ads/demo

   Check that "Student Test Result" bar chart shows. Then pick "Student 1" in Student Dimension
   and "Component 1" in Subject Dimension. Click "Start Timer", wait for a few seconds and then
   click "Stop Timer". A pie chart should show. Repeat starting/stopping timer and observe the
   pie chart show accumulated elapsed time correctly.

   
===============================================================================
 ADS Documents
===============================================================================

1. https://insight.ck12.org/wiki/index.php/Analytical_Data_Service_Design
2. https://insight.ck12.org/wiki/index.php/Analytical_Data_Service_API_Usage_Notes

