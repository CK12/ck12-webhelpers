#!/usr/bin/env python


from sys import exit
from time import sleep
from subprocess import call
from urllib import urlencode
from pymongo import MongoClient
from json import dumps

SEND_EVENTS_AFTER_MINING = True # Will send all ads at 1 event/second

API_URL = 'http://www.ck12.org/dexter/record/event'

client = MongoClient('mongodb://dbadmin:D-coD43@localhost:27017/admin')
DAT_FILE_NAME = 'peer_help_ads.dat'
f = open(DAT_FILE_NAME, 'w')

db = client['peer_help']
cur0 = db.Posts.find(); # will filter on all post types


def insert_groupID(**kwargs):
    """ Given data=dict and cursor=mongo cursor, insert the 
        groupID if it exists in the systemTags field. """
    if not kwargs['cursor'].has_key('systemTags'):
        return False
    for i in xrange(len(kwargs['cursor']['systemTags'])):
        tag = kwargs['cursor']['systemTags'][i]
        if tag.find('groupID') != -1:
            kwargs['data']['groupID'] = tag[8:] # expecting 'groupID=XXXXX' str
        break;


print 'gathering post types...'

# GATHER ALL ACTIVITY (ANSWER, COMMENT, ANSWER)

for i in xrange(cur0.count()):
    c = cur0[i]

    if i % 500 == 0:
        print 'progress: post# %s' % i

    # Detect an image in the content field.
    has_img = False
    if c['content'].find('<img src') != -1:
        has_img = True

    payload = {
        'postID'      : str(c['_id']),
        'memberID'    : c['memberID'],
        'postType'    : c['postType'],
        'created'     : c['created'].isoformat(),
        'hasImage'    : has_img,
        'isAnonymous' : (lambda x: x['isAnonymous'] if x.has_key('isAnonymous') else False)(c)
    }
    insert_groupID(data=payload, cursor=c)
    data = {
        'clientID'  : 24839961,
        'eventType' : 'FBS_PEER_HELP_POST',
        'payload'   : dumps(payload)
    }
    s = 'curl --data "%s" %s\n' % ( urlencode(data), API_URL )

    # detect if this post is answered
    if c.has_key('isAnswered'):
        payload = {
            'postID'     : str(c['_id']),
            'created'    : c['created'].isoformat(),
            'updated'    : c['updated'].isoformat()
        }
        insert_groupID(data=payload, cursor=c)
        data = {
            'clientID'   : 24839961,
            'eventType' : 'FBS_PEER_HELP_ANSWERED',
            'payload'    : dumps(payload)
        }
        s += 'curl --data "%s" %s\n' % ( urlencode(data), API_URL )

    f.write( s ) # write one cURL string to the file

f.close()
client.disconnect()


# IF flag is False, then we exit, otherwise, we send all the events
if not SEND_EVENTS_AFTER_MINING:
    exit(0)

f = open(DAT_FILE_NAME, 'r')

counter = 0
for curlcommand in f.readlines():
    call(curlcommand, shell=True)
    counter += 1
    sleep(1)

print '\n\nFINISHED inserting %s new events!!!\n\n' % counter

exit(0)
