import urllib2, urllib
import os,sys
import shutil
from flx.model.workdir import workdir as WD
from flx.controllers.celerytasks import eflex as eflex_celery
import logging

log = logging.getLogger(__name__)

class EflexAPICaller():
    def __init__(self, email_content):
        self.email_content = email_content
        self.create_working_location()
        self.email_content_file_path = "%s/%s"%(self.working_dir, "user_email.txt")
        f = open(self.email_content_file_path,'w')
        f.write(self.email_content)
        f.close()

    def create_working_location(self):
        myUtil = WD.WorkDirectoryUtil()
        workdir_prefix = "/opt/2.0/work/"
        if not os.path.exists(workdir_prefix):
            os.mkdir(workdir_prefix)
            
        self.working_dir = workdir_prefix + myUtil.getWorkdir()[1]
        return self.working_dir

    def invoke_eflex_api(self):
        eflex_processor = eflex_celery.EflexProcessor()
        task = eflex_processor.delay(email_content_file=self.email_content_file_path) 

if __name__ == "__main__":
    eflex_caller = EflexAPICaller(sys.stdin.read())
    eflex_caller.invoke_eflex_api()
