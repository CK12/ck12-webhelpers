#!/usr/bin/python


#########################################################
# svn_up.py                                             #
# Wrapper around "svn up" command to notify DB changes  #
# Author: Viraj Kanwade                                 #
# Ubuntu installation:                                  #
#  sudo apt-get install python-svn                      #
#  sudo apt-get install svn-workbench                   #
#########################################################

import pysvn
import sys
import os
import pprint

MYSQL_DB_USERNAME = 'dbadmin'
MYSQL_DB_PASSWORD = 'D-coD#43'
DB_COMMANDS = {
    'mysql': 'mysql --user=' + MYSQL_DB_USERNAME + ' -p' + MYSQL_DB_PASSWORD + ' -h localhost --default-character-set=utf8 %s < %s',
    'mongo': "mongo --host localhost %s < %s",
}
# NOTE: trailing slash is mandatory
DB_NOTIFY_PATHS = {
    'flx/mysql/updates/': ('flx2', 'mysql'),
    'flx/mongo/standards/': ('standards', 'mongo'),
    'flx/mysql/updates-auth/': ('auth', 'mysql'),
    'assessment/engine/mongo/updates/': ('assessment', 'mongo'),
    'dexter/core/mongo/updates/': ('dexter', 'mongo'),
    'peerhelp/core/mongo/updates/': ('peer_help', 'mongo'),
}
INI_PATHS = [
    'adminapp/pylons/flxadmin/development.ini',
    'assessment/engine/pyramid/development.ini',
    'dexter/core/pyramid/development.ini',
    'flx/pylons/ads/development.ini',
    'flx/pylons/auth/development.ini',
    'flx/pylons/flx/development.ini',
    'flxweb/development.ini',
    'hwpserver/development.ini',
    'iodocs/Iodocs-UI/iodocs/development.ini',
    'peerhelp/core/pyramid/._development.ini',
    'peerhelp/core/pyramid/development.ini',
    'taxonomy/pylons/sts/development.ini',
    'tests/repo/repodais/development.ini'
]

ROOT_PATH = os.path.dirname(os.path.abspath(__file__)) + '/'
CWD = os.getcwd() + '/'
root = '.'
conflicts = []
db_commands = []
in_external = False
is_updated = False
ini_updated = []

SVN_VER = 1.7 if pysvn.svn_version[0:2] == (1, 7) else 1.6

FILE_CHANGE_INFO = {
    pysvn.wc_notify_action.update_add: 'A',
    pysvn.wc_notify_action.update_delete: 'D',
    pysvn.wc_notify_action.update_update: 'U',
    pysvn.wc_notify_action.exists: 'E',
}

def getPath(path):
    return path if SVN_VER == 1.6 else path.replace(ROOT_PATH, '')

def notify(event_dict):
    try:
        global in_external

        pth = getPath(event_dict['path'])
        #pprint.pprint(event_dict)
        if event_dict['action'] == pysvn.wc_notify_action.update_external:
            in_external = True
            print "\nFetching external item into '%s'" % pth
        elif hasattr(pysvn.wc_notify_action, 'update_started') and event_dict['action'] == pysvn.wc_notify_action.update_started:
            pass
        elif event_dict['action'] == pysvn.wc_notify_action.update_completed:
            print('Updated %sto revision %d.%s' % (('external ' if in_external else ''), event_dict['revision'].number, ('\n' if in_external else '')))
            if in_external:
                in_external = False
        elif hasattr(pysvn.wc_notify_action, 'update_external_removed') and event_dict['action'] == pysvn.wc_notify_action.update_external_removed:
            print("Removed external '%s'" % pth)
        else:
            act = FILE_CHANGE_INFO[event_dict['action']]
            highlight = ''

            l = filter(pth.__contains__, DB_NOTIFY_PATHS.keys())
            if len(l) == 1:
                cmd = DB_COMMANDS[DB_NOTIFY_PATHS[l[0]][1]] % (DB_NOTIFY_PATHS[l[0]][0], os.path.join(ROOT_PATH, pth))
                if event_dict['action'] == pysvn.wc_notify_action.update_update:
                    cmd += ' # NOTE: You might have already run this script. It was updated. You might run into problems when you rerun the script. Please confirm.'
                db_commands.append(cmd)
                highlight = '\033[95m'

            l = filter(pth.__contains__, INI_PATHS)
            if len(l) == 1:
                ini_updated.append(pth)

            if event_dict['content_state'] == pysvn.wc_notify_state.merged:
                act = 'G'
            elif event_dict['content_state'] == pysvn.wc_notify_state.conflicted:
                act = 'C'
                conflicts.append(pth)
                highlight = '\033[91m'

            msg = '%s    %s' % (act, pth)
            if event_dict['action'] == pysvn.wc_notify_action.update_update:
                if event_dict['kind'] == pysvn.node_kind.dir:
                    if event_dict['prop_state'] == pysvn.wc_notify_state.changed:
                        msg = ' %s   %s' % (act, pth)
                    else:
                        msg = ''

            if msg:
                if highlight:
                    print highlight + msg + '\033[0m'
                else:
                    print msg
    except Exception, e:
        print '\033[95m'
        print e
        pprint.pprint(event_dict)
        print '\033[0m'


def svn_up_notify(event_dict):
    global is_updated

    #pprint.pprint(event_dict)
    if event_dict['kind'] == pysvn.node_kind.file:
        is_updated = True

def get_login(realm, username, may_save):
    return True, "build", "ck1234", True

client = pysvn.Client()

# Update svn_up.py. If it was updated, exit and ask user to rerun
client.callback_notify = svn_up_notify
client.callback_get_login = get_login
up = client.update(os.path.join(root, os.path.basename(sys.argv[0])))
#pprint.pprint(up)
if is_updated:
    print '\033[91m%s was updated. Please re-run.\033[0m' % sys.argv[0]
    exit(1)

method = client.update

kwargs = {'path': root}
# Continue with other update
for i in range(1, len(sys.argv)):
    arg = sys.argv[i]
    if arg == '--ignore-externals':
        kwargs['ignore_externals'] = True
        open(".nosvnext", "a").close()
    elif arg == '--include-externals':
        kwargs['ignore_externals'] = False
        if os.path.exists('.nosvnext'):
            os.remove('.nosvnext')
    elif arg == 'switch':
        method = client.switch
        kwargs['url'] = sys.argv[i+1]
        break
    else:
        root = os.path.join(root, arg)
        kwargs['path'] = root

if not os.path.exists(root):
    print 'Error: path %s does not exist' % root
    exit(1)

if kwargs.get('ignore_externals') or os.path.exists('.nosvnext'):
    print "Ignoring externals ..."
    kwargs['ignore_externals'] = True

client.callback_notify = notify

print 'Method: ', method.__name__, 'Args: ', kwargs

#up = client.update(root)
method(**kwargs)
#print('Updated to revision %d.' % up[0].number)

## Write commands to a file
if os.path.exists("db_patches.sh"):
    os.remove("db_patches.sh")

if db_commands:
    print '\n\033[91mDB schema changes found:\033[0m'
    db_commands.sort()
    dbp = open("db_patches.sh", "w")
    dbp.write("#!/bin/bash\n")
    dbp.write("\necho \"Applying patches ...\"\n")
    for cmd in db_commands:
        print cmd
        dbp.write("%s\n" % cmd)
    dbp.close()

if conflicts:
    print '\033[91m'
    print len(conflicts), ' conflict(s) found.'
    conflicts.sort()
    for f in conflicts:
        print f
    print '\033[0m'

    exit(1)

if ini_updated:
    print 'INI files updated'
    ini_updated.sort()
    for f in ini_updated:
        print f
