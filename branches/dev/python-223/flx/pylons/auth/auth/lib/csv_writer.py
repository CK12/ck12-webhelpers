from datetime import datetime
import csv
import os
import logging
from pylons import config
log = logging.getLogger(__name__)


class CsvHandler():
    def __init__ (self):
        self.workdir = config.get('cache_share_dir') + '/csv'
        self.file_name = ""
        self.file_path = ""
        self.headers = []
        self.data =[]
    
    
    def write_csv(self, file_name=None):
        try:
            if not os.path.exists(self.workdir):
                os.mkdir(self.workdir, 0755)
            
            if file_name is None:
                self.file_name = self.create_timestamp() + ".csv"
                self.file_path = self.workdir + "/" + self.file_name 
                handle = open(self.file_path, "wt")
                self.writer = csv.DictWriter(handle, fieldnames = self.headers, quoting = csv.QUOTE_NONE)
                header_row = dict( (n,n) for n in self.headers)
                self.writer.writerow(header_row)
            else:
                self.file_name = file_name
                self.file_path = self.workdir + "/" + self.file_name
                print self.file_path 
                handle = open(self.file_path, "a")
                self.writer = csv.DictWriter(handle, fieldnames = self.headers, quoting = csv.QUOTE_NONNUMERIC)

            for row_data in self.data:
                this_row = dict( (n, row_data[n] if isinstance(row_data[n], int) else unicode(row_data[n]).encode('utf-8')) for n in self.headers)
                self.writer.writerow(this_row)
            
            handle.close()
            return True
        except Exception as e:
            log.exception(e)
            return False
    
    
    def process_csv(self, headers = [], data=[], file_name = None):
        self.headers = headers
        self.data = data
        
        if self.write_csv(file_name = file_name):
            return self.file_name
        else :
            log.error("Unable to write CSV file")
            return "Error: unable to write csv file"
            

    def create_timestamp(self):
        return datetime.now().strftime("%Y%m%d%H%M%S%f")
