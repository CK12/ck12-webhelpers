#!/usr/bin/python

from datetime import datetime, timedelta
import os
import sys

MYSQL_PASS = 'D-coD#43'
MYSQL_HOST = 'localhost'
MYSQL_STR = 'mysql -u dbadmin -p%s -h %s --default-character-set utf8 ' % (MYSQL_PASS, MYSQL_HOST)
UPDATES_DIRS = [ 
        ('/opt/2.0/flx/mysql/updates-auth', 'auth'), 
        ('/opt/2.0/flx/mysql/updates', 'flx2'), 
        ('/opt/2.0/flx/mysql/updates', 'flx2img'), 
        #('/opt/2.0/taxonomy/mysql/updates', 'taxonomy'), 
        #('/opt/2.0/hwpserver/mysql/updates', 'homeworkpedia'), 
        ]

def help():
    print "Usage: %s <start-date-for-patches (YYYYmmdd)> [<sql-dump-file> [<sql-dump-file> ...]]" % sys.argv[0]

if __name__ == '__main__':

    sqlDate = None
    inputSqls = { 'flx2': None, 'auth': None, 'homeworkpedia': None, 'ads': None, 'taxonomy': None, 'all': None }

    if len(sys.argv) >= 2:
        sqlDate = sys.argv[1]
    if len(sys.argv) >= 3:
        for i in range(2, len(sys.argv)):
            inputSql = sys.argv[i]
            db, sql = inputSql.split(':')
            if db not in inputSqls.keys():
                raise Exception("No such db: %s" % db)
            if not os.path.exists(sql):
                raise Exception("No such sql file: %s" % inputSql)
            inputSqls[db] = sql
    if len(sys.argv) < 2:
        help()
        sys.exit(1)

    today = datetime.now()
    lines = []
    for db in inputSqls.keys():
        inputSql = inputSqls[db]
        if inputSql:
            if db == 'all':
                db = ''
            lines.append(MYSQL_STR + " %s < %s" % (db, inputSql))
            lines.append('')

    for dir, dbname in UPDATES_DIRS:
        start = datetime.strptime(sqlDate, '%Y%m%d')
        while start <= today:
            startDate = datetime.strftime(start, '%Y%m%d')
            files = []
            for file in os.listdir(dir):
                if file.startswith(startDate) and file.endswith('.sql'):
                    files.append(file)
            files.sort()
            for file in files:
                lines.append(MYSQL_STR + " %s < %s" % (dbname, os.path.join(dir, file)))
            start = start + timedelta(days=1)

    lines.append('')
    ## Disable masking 
    if False and not os.environ.get('PRODUCTION'):
        lines.append(MYSQL_STR + " %s < %s" % (UPDATES_DIRS[1][1], os.path.join(os.path.dirname(UPDATES_DIRS[1][0]), 'mask-emails.sql')))
        lines.append(MYSQL_STR + " %s < %s" % (UPDATES_DIRS[1][1], os.path.join(os.path.dirname(UPDATES_DIRS[1][0]), 'cleanup-data.sql')))
    lines.append(MYSQL_STR + " %s < %s" % (UPDATES_DIRS[1][1], os.path.join(os.path.dirname(UPDATES_DIRS[1][0]), 'flx2-create-views.sql')))
    lines.append(MYSQL_STR + " %s < %s" % (UPDATES_DIRS[2][1], os.path.join(os.path.dirname(UPDATES_DIRS[2][0]), 'flx2-create-views.sql')))
    #lines.append(MYSQL_STR + " %s < %s" % (UPDATES_DIRS[0][1], os.path.join(os.path.dirname(UPDATES_DIRS[0][0]), 'create-views.sql')))
    f = open("run.sh", "w")
    f.write('#!/bin/bash\n\n')
    for line in lines:
        if line and not line.startswith('#'):
            f.write('echo ">>> Running [%s]"\n' % line)
        f.write('%s\n' % line)
    f.close()
    print "Run this script: %s" % f.name
