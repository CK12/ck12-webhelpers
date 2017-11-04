from __future__ import print_function
import os
import logging

from flx.model import api, utils
from flx.lib.unicode_util import UnicodeDictReader

LOG_FILENAME = "/opt/2.0/log/block_email_notifications_by_member_emails.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=10*1024*1024, backupCount=30)
handler.setFormatter(formatter)
log.addHandler(handler)

def printToLog(message):
    print(message)
    log.debug(message)

def run(input_csv_path, userID=1, mode='block'):
    """
        input_csv_path : Path to csvn file with single column name "email" with one email per row.
        userID: Default 1. ID of user who has blocked the users
        mode : expected value block/unblock. Default is 'block'. 
    """
    if os.path.splitext(input_csv_path)[1] not in ['.csv', '.rtf']:
        printToLog('Error: Expected csv or rtf file. Got %s' % os.path.splitext(input_csv_path)[1])
        return

    if not os.path.isfile(input_csv_path):
        printToLog('Error: File %s could not be found' % input_csv_path)
        return

    if mode not in ['block', 'unblock']:
        printToLog("Invalid input value for mode parameter. Expected input is 'block' or 'unblock'")
        return

    col_names = ['email']

    inf = open(input_csv_path, 'rb')
    csvReader = UnicodeDictReader(inf, fieldnames=col_names, sanitizeFieldNames=True)
    rowNum = 0
    try:
        tx = utils.transaction('run')
        with tx as session:
            for row in csvReader:
                email = row.get('email')
                email = email.strip('\\').strip('}')
                member = api._getMemberByEmail(session, email)
                if member:
                    if mode == 'unblock':
                        printToLog('Removing email %s from blocked members list' % email)
                        kwargs = {}
                        kwargs['memberID'] = member.id
                        kwargs['objectType'] = 'notifications'   
                        kwargs['subObjectType'] = 'email' 
                        kwargs['objectID'] = None
                        try:
                            api._removeMemberToBlockedList(session, **kwargs)
                            rowNum = rowNum + 1
                        except Exception as e:
                            log.error('API raised exception %s' % str(e))
                        continue
                    printToLog('Adding email %s to blocked members list' % email)
                    printToLog(member)
                    kwargs = {}
                    kwargs['memberID'] = member.id
                    kwargs['objectType'] = 'notifications'   
                    kwargs['subObjectType'] = 'email' 
                    kwargs['objectID'] = None
                    kwargs['blockedBy'] = userID
                    kwargs['reason'] = 'Member email-id is in bounced email list'
                    printToLog('Block email notification payload %s' % kwargs)
                    try:
                        api._addMemberToBlockedList(session, **kwargs)
                        rowNum = rowNum + 1
                    except Exception as e:
                        log.error('API raised exception %s' % str(e))
                else:
                    printToLog('Invalid email id or member doesn\'t exists with email [%s]' % email)
        if mode == 'unblock':
            printToLog('Removed [%s] emails from blocked members list' % rowNum)
        else:
            printToLog('Added [%s] emails to blocked members list' % rowNum)
    finally:
        inf.close()
