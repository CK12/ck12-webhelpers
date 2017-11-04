import os
import sys
import logging
from zipfile import ZipFile
from tempfile import mkdtemp
from datetime import datetime
import codecs
import re
import cssutils
from shutil import copy, move

flx_dir = os.path.abspath(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))
if flx_dir not in sys.path:
    sys.path.append(flx_dir)

#from flx.lib.wiki_importer_lib.rosetta_xhtml import CK12RosettaXHTML
import flx.lib.helpers as h
import flx.lib.artifact_utils as au
from flx.model import api

log = logging.getLogger(__name__)

class GDT2ePub():

    def __init__(self, toDirectory, uselib=None):
        self.workdir = toDirectory
        self.myEpub = uselib
        self.OEBPSPath = self.workdir + '/' + 'OEBPS/'
        self.chapterNumber = 0

    def add_chapter_from_zip(self, zipfile):
        log.info('Adding %s as a chapter' %(zipfile))
        self.chapterNumber = self.chapterNumber + 1
        zipFilename = os.path.basename(zipfile)
        tmpDir = mkdtemp() + '/'
        newZipFilepath = tmpDir + zipFilename
        copy(zipfile, newZipFilepath)

        chapterLocation = self.OEBPSPath + str(self.chapterNumber) + '.html'
        log.info('Writing the XHTML into %s' %(chapterLocation))
        file, xhtml = self.getFileFromZip(newZipFilepath, '/', matchType='notin')
        xhtml = h.transform_to_xhtml(xhtml, cleanHtml=True)
        with  open(chapterLocation, 'w') as fd:
            fd.write(xhtml)

        log.info('Extracting the zip file to %s' %(tmpDir))
        zfd = ZipFile(newZipFilepath, 'r')
        zfd.extractall(tmpDir)
        resource_dir = 'ck12_%s_files' %(self.chapterNumber)
        if os.path.exists( tmpDir + 'images'):
            move(tmpDir + 'images', self.OEBPSPath + resource_dir)
        os.remove(newZipFilepath)

        chapterTitle = 'Chapter %s' %(self.chapterNumber)
        self.myEpub.add_new_chapter_for_gdt2epub(chapterTitle, xhtml, resource_dir)


    def getFileFromZip(self, zipfile, pattern, matchType='equals'):
        """
            Get a file from the zip file
        """
        z = None
        try:
            z = ZipFile(zipfile, 'r')
            log.info("Opened zipfile: %s" % zipfile)
            for file in z.namelist():
                if (matchType == 'endswith' and file.endswith(pattern)) \
                    or (matchType == 'equals' and file == pattern) \
                    or (matchType == 'notin' and pattern not in file):
                    log.info("Found file: %s" % file)
                    f = z.open(file, 'rU')
                    contents = f.read()
                    f.close()
                    return file, contents
        finally:
            if z:
                z.close()
        return None
