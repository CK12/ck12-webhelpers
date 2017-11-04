import logging

import settings
import zip_tools


class CK12Zip:

    def __init__(self, zipDownloadUri):
        self.log = logging.getLogger(__name__)
        self.logfd = open(settings.LOG_FILENAME, 'a+')
        self.create_work_dir()
        self.zipDownloadUri = zipDownloadUri

    def create_work_dir(self):
        self.workdir = zip_tools.create_work_dir()

    def render(self):
        zipLocation = self.workdir + '/' + 'book.zip'
        self.log.info("zipLocation: %s" % zipLocation)
        zip_tools.downloadZip(self.zipDownloadUri, zipLocation)

        return zipLocation

    def __str__(self):
        self.log.info("CK12Zip object")
        self.log.info("Workdir: "+ self.workdir)
