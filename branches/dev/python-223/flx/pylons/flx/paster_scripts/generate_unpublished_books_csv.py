import logging
import traceback
import MySQLdb as mdb

from flx.model import api
from flx.lib.unicode_util import UnicodeWriter, UnicodeDictReader

HOST = "mysql.master"
#HOST = "localhost"
USER = "dbadmin"
PASSWORD = "D-coD#43"
DB = "flx2"

# Initialise Logger
log = logging.getLogger(__name__)
hdlr = logging.StreamHandler()  # Prints on console
#hdlr = logging.FileHandler('/tmp/generate_unpublish_books.log') # Use for smaller logs
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
hdlr.setFormatter(formatter)
log.addHandler(hdlr)
log.setLevel(logging.INFO)

conn = mdb.connect(host=HOST, user=USER, passwd=PASSWORD, db=DB, use_unicode=True)
cur = conn.cursor()

csv_in_file = "/tmp/data/Unpublished_list.csv"
csv_out_file = "/tmp/data/Unpublished_list_new.csv"
csv_headers = ['State', 'First Name', 'Last Name', 'Email Address',	'memberID',	'Unpublished Books OLD', 'Unpublished Books New']


def run():
    """
    """
    stime = time.time()
    fd = open(csv_out_file, 'w')
    csv_writer = UnicodeWriter(fd)
    csv_writer.writerow(csv_headers)

    csv_reader = UnicodeDictReader(open(csv_in_file, 'rb'))
    count = 0
    for row in csv_reader:
        member_id = int(row['memberID'])
        member = api.getMemberByID(member_id)        
        if not member:
            log.info("No such user with ID : [%s]" % member_id)
            continue
        member_books = api.getArtifacts(typeName='book', ownerID=member_id)
        unpublish_count = 0
        for book in member_books.results:
            if not book.revisions[0].publishTime:
                unpublish_count += 1
        csv_row = [row['State'], row['First Name'], row['Last Name'], row['Email Address'], row['memberID'], row['Unpublished Books']]
        csv_writer.writerow(csv_row + [unpublish_count])
        count += 1
        if (count % 100) == 0:
            log.info("Till now processed %s records" % count)
            #break
    fd.close()
   
