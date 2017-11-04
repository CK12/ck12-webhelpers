from subprocess import PIPE, Popen, STDOUT
import logging
import settings

from flx.lib import helpers as h
import mobi_tools

class CK12Mobi:

    def __init__(self, epubDownloadUri):
        self.logfd = open(settings.LOG_FILENAME, 'a+')
        self.create_work_dir()
        self.epubDownloadUri = epubDownloadUri

    def create_work_dir(self):
        self.workdir = mobi_tools.create_work_dir()

    def render(self):
        epubLocation = self.workdir + '/' + 'book.epub'
        mobi_tools.downloadEpub(self.epubDownloadUri, epubLocation)
        kindlegenLocation = settings.KINDLEGEN_LOCATION
        cmd = "%s %s -c0 -o %s" %(kindlegenLocation, epubLocation, 'book.mobi')
        self.logfd.write('Command: %s' %(cmd))
        p = Popen(cmd, stdin=PIPE, stdout=self.logfd, stderr=self.logfd, shell=True)
        p.communicate()
        mobiLocation = self.workdir + '/' + 'book.mobi'
        self.logfd.close()
        return mobiLocation

    def __str__(self):
        self.log.info("CK12Mobi object")
        self.log.info("Workdir: "+ self.workdir)
