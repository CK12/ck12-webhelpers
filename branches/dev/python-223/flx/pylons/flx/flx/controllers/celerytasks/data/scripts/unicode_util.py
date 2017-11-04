##
## Source: http://docs.python.org/library/csv.html
##

import csv, codecs, cStringIO
import sys, os, re
import logging


log = logging.getLogger(__name__)

def safe_encode(s):
    if s and type(s).__name__ == 'unicode':
        return s.encode('utf-8')
    return s

def safe_decode(s):
    if s and type(s).__name__ == 'str':
        return s.decode('utf-8')
    return s

class UTF8Recoder:
    """
    Iterator that reads an encoded stream and reencodes the input to UTF-8
    """
    def __init__(self, f, encoding):
        self.reader = codecs.getreader(encoding)(f)

    def __iter__(self):
        return self

    def next(self):
        return self.reader.next().encode("utf-8")

class UnicodeReader:
    """
    A CSV reader which will iterate over lines in the CSV file "f",
    which is encoded in the given encoding.
    """

    def __init__(self, f, dialect=csv.excel, encoding="utf-8", **kwds):
        f = UTF8Recoder(f, encoding)
        self.reader = csv.reader(f, dialect=dialect, **kwds)

    def next(self):
        row = self.reader.next()
        return [safe_decode(s) for s in row]

    def __iter__(self):
        return self

class UnicodeDictReader:
    """
    A CSV reader which will iterate over lines in the CSV file "f",
    which is encoded in the given encoding.
    """

    reSpecial = re.compile(r'[^0-9a-zA-Z-_]*')
    def __init__(self, f, fieldnames=None, sanitizeFieldNames=False, dialect=csv.excel, encoding="utf-8", **kwds):
        f = UTF8Recoder(f, encoding)
        self.reader = csv.DictReader(f, fieldnames=fieldnames, dialect=dialect, **kwds)
        self.sanitizeFieldNames = sanitizeFieldNames
        self.sanitizedFieldNames = {}
        if self.reader.fieldnames:
            for i in range(0, len(self.reader.fieldnames)):
                self.reader.fieldnames[i] = safe_decode(self.reader.fieldnames[i])
                if self.sanitizeFieldNames:
                    fldName = self.reSpecial.sub('', self.reader.fieldnames[i].lower())
                    self.sanitizedFieldNames[self.reader.fieldnames[i]] = fldName

    def next(self):
        row = self.reader.next()
        for k in self.reader.fieldnames:
            if row[k] is not None:
                row[k] = safe_decode(row[k])
                if self.sanitizeFieldNames:
                    row[self.sanitizedFieldNames[k]] = row[k]
        return row

    def __iter__(self):
        return self

class UnicodeWriter:
    """
    A CSV writer which will write rows to CSV file "f",
    which is encoded in the given encoding.
    """

    def __init__(self, f, dialect=csv.excel, encoding="utf-8", **kwds):
        # Redirect output to a queue
        self.queue = cStringIO.StringIO()
        self.writer = csv.writer(self.queue, dialect=dialect, **kwds)
        self.stream = f
        self.encoder = codecs.getincrementalencoder(encoding)()

    def writerow(self, row):
        for i in range(0, len(row)):
            if type(row[i]).__name__ not in ['str', 'unicode']:
                row[i] = str(row[i])
        self.writer.writerow([safe_encode(s) for s in row])
        # Fetch UTF-8 output from the queue ...
        data = self.queue.getvalue()
        data = data.decode("utf-8")
        # ... and reencode it into the target encoding
        data = self.encoder.encode(data)
        # write to the target stream
        self.stream.write(data)
        # empty queue
        self.queue.truncate(0)

    def writerows(self, rows):
        for row in rows:
            self.writerow(row)

if __name__ == '__main__':
    mydir = os.path.dirname(sys.argv[0])
    file = os.path.join(mydir, 'wiki_importer_lib/support_files/encodes/SCI.CHE.Nimish-Chemistry-Test-Book-encoded.csv')
    r = UnicodeDictReader(open(file, 'rb'))
    for row in r:
        print "Row: ", row
