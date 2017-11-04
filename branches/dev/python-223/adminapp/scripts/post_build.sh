#!/bin/bash
#add post-hudson build routines here.

DBUSER=dbadmin
DBPW=D-coD#43
DBHOST=localhost
DBNAME=flx2
HWPDBNAME=homeworkpedia



#1. Adding test user data
cd /tmp;tar xvf /opt/2.0/adminapp/scripts/test_data/auth_user.tar 
python /opt/2.0/flx/pylons/flx/flx/model/import-1x-user.py --source-file=/tmp/auth_user.txt  --dest=mysql://${DBUSER}:${DBPW}@${DBHOST}:3306/${DBNAME}?charset=utf8

#2. Adding homeworkpedia test data
mysql -u ${DBUSER} -h ${DBHOST} --password=${DBPW} ${HWPDBNAME} < /opt/2.0/hwpserver/mysql/test_data/errorreports.sql


#3. Adding 1.x migration data
python -u /opt/2.0/flx/scripts/from-1x/members-with-flexbooks.py --src="mysql://dbadmin:ck123@skylab.ck12.org:3306/flexr?charset=utf8" --dest="mysql://dbadmin:D-coD#43@localhost/flx2?charset=utf8"
