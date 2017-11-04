from __future__ import print_function
import os
import logging

from auth.model import api
from auth.lib.unicode_util import UnicodeDictReader
from auth.lib.csv_writer import CsvHandler

LOG_FILENAME = "/opt/2.0/log/generate_member_id_email_csv.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=10*1024*1024, backupCount=30)
handler.setFormatter(formatter)
log.addHandler(handler)

def printToLog(message):
    print(message)
    log.debug(message)

def run(input_csv_path, output_csv_name=None):
    if os.path.splitext(input_csv_path)[1] != '.csv':
        printToLog('Error: Expected csv file. Got %s' % os.path.splitext(input_csv_path)[1])
        return

    if not os.path.isfile(input_csv_path):
        printToLog('Error: File %s could not be found' % input_csv_path)
        return

    col_names = ['email']
    headers = ["email", "memberID"]

    inf = open(input_csv_path, 'rb')
    csvReader = UnicodeDictReader(inf, fieldnames=col_names, sanitizeFieldNames=True)
    rowNum = -1
    output_csv_name = output_csv_name or "member_id_email.csv"
    outf = open(output_csv_name, 'w')
    try:
        outf.write('%s\n' % headers)
        for row in csvReader:
            rowNum = rowNum + 1
            if rowNum == 0:
                continue
            email = row.get("email")
            member = api.getMemberByEmail(email)
            if member:
                outf.write('%s, %d\n' % (member.email, member.id))
            else:
                printToLog('%d: email[%s] doesn\'t exists' % (rowNum, email))
            if rowNum % 10000:
                print('%d ' % rowNum, end='')
        print('')
        printToLog("Generated CSV file : %s" % output_csv_name)
    finally:
        inf.close()
        outf.close()
