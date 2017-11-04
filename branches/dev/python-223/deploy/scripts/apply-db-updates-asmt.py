#!/usr/bin/python

from datetime import datetime, timedelta
import os
import sys

MONGO_PASS = ''
UPDATES_DIRS = [ 
        ('/opt/2.0/assessment/engine/mongo/updates', 'assessment'), 
        ('/opt/2.0/peerhelp/core/mongo/updates', 'peer_help'), 
        ('/opt/2.0/dexter/core/mongo/updates', 'dexter'), 
        ('/opt/2.0/flx/mongo/flx2/updates', 'flx2'), 
        ]

def help():
    print "Usage: %s <dbparams> <start-date-for-patches (YYYYmmdd)> [<dbname1:mongo-dump-dir1> [<dbname2:mongo-dump-dir2> ...]]" % sys.argv[0]

if __name__ == '__main__':

    if len(sys.argv) < 3:
        help()
        sys.exit(1)

    sqlDate = None
    inputSqls = { 'assessment': None, 'peer_help': None, 'dexter': None, 'flx2': None}

    MONGO_PARAMS = { 'assessment': '', 'peer_help': '', 'dexter': '', 'flx2': '' }
    if len(sys.argv) >= 2:
        params = sys.argv[1]
        if params:
            for param in params.split('|'):
                db, cred = param.split(':', 1)
                if not MONGO_PARAMS.has_key(db):
                    raise Exception('Invalid db name [%s] in parameters' % db)
                MONGO_PARAMS[db] = cred

    MONGO_STR = 'mongo'
    MONGO_RESTORE_STR = 'mongorestore'
    if len(sys.argv) >= 3:
        sqlDate = sys.argv[2]
    if len(sys.argv) >= 4:
        for i in range(3, len(sys.argv)):
            inputSql = sys.argv[i]
            db, sql = inputSql.split(':')
            if db not in inputSqls.keys():
                raise Exception("No such db: %s. Available DBs: %s" % (db, inputSqls.keys()))
            if not os.path.exists(sql):
                raise Exception("No such data file or directory: %s" % inputSql)
            if os.path.isfile(sql) and sql.endswith('.tar.gz'):
                ## Need to unzip it
                path = os.path.dirname(sql)
                dbdir = os.path.join(path, db)
                from subprocess import call
                print "Extracting tarball to %s" % dbdir
                cmd = ['rm', '-rf', dbdir]
                print "Running: %s" % ' '.join(cmd)
                call(cmd)
                cmd = ['tar', '-xzf', sql, '-C', path]
                print "Running: %s" % ' '.join(cmd)
                call(cmd)
                sql = dbdir
            if not os.path.isdir(sql):
                raise Exception('Cannot proceed for file path: %%s' % sql)
            inputSqls[db] = sql
    today = datetime.now()
    lines = []

    for k in inputSqls.keys():
        if inputSqls[k]:
            lines.append(MONGO_RESTORE_STR + " %s --drop --noIndexRestore --db %s %s" % (MONGO_PARAMS.get(k, ''), k, inputSqls[k]))

    ## Indexes, masking etc.
    for updateDir, dbName in UPDATES_DIRS:
        ## Disable masking.
        if False and not os.environ.get('PRODUCTION'):
            scriptPath = os.path.join(os.path.dirname(updateDir), 'mask-emails.js')
            if os.path.exists(scriptPath):
                lines.append(MONGO_STR + " %s %s %s" % (MONGO_PARAMS.get(dbName, ''), dbName, scriptPath))
        scriptPath = os.path.join(os.path.dirname(updateDir), '%s_schema.js' % dbName)
        if os.path.exists(scriptPath):
            lines.append(MONGO_STR + " %s %s %s" % (MONGO_PARAMS.get(dbName, ''), dbName, scriptPath))
    lines.append('')

    ## Apply patches
    start = datetime.strptime(sqlDate, '%Y%m%d')
    while start <= today:
        startDate = datetime.strftime(start, '%Y%m%d')
        for dir, dbname in UPDATES_DIRS:
            files = []
            for file in os.listdir(dir):
                if file.startswith(startDate) and file.endswith('.js'):
                    files.append(file)
            files.sort()
            for file in files:
                lines.append(MONGO_STR + " %s %s %s" % (MONGO_PARAMS.get(dbname, ''), dbname, os.path.join(dir, file)))
        start = start + timedelta(days=1)
    lines.append('')

    f = open("run-asmt.sh", "w")
    f.write('#!/bin/bash\n\n')
    for line in lines:
        if line and not line.startswith('#'):
            f.write('echo ">>> Running [%s]"\n' % line)
        f.write('%s\n' % line)
    f.close()
    print "Run this script: %s" % f.name
