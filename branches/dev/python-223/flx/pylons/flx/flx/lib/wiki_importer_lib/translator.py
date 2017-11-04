'''
This is the content translator/renderer from CK12.
'''
from subprocess import PIPE, Popen, STDOUT
from tidylib import tidy_document
import logging
import settings
from flx.lib.wiki_importer_lib.rosetta_xhtml import CK12RosettaXHTML
from flx.lib.processwithtimeout import ProcessWithTimeout

#Initialing logger
log_level = settings.LEVELS.get(settings.LOG_LEVEL, logging.NOTSET)
#logging.basicConfig(filename=settings.LOG_FILENAME,level=settings.LOG_LEVEL,)

class CK12Translator:

    def __init__(self):
        self.log = logging.getLogger(__name__)
        #self.log.setLevel(log_level)
        #self.log.info("Initializing WikiImporter object")
        self.translator_path = '/usr/local/bin/'
        self.translator_engine = 'fb2n'
        self.translator = self.translator_path + self.translator_engine

    def setLogger(self, logger):
        self.log = logger

    def get_rosetta_xhtml(self, chapter_docbook_content):
        document = ''
        try:
            #self.log.info("Translating chapter docbook to xhtml. Payload: \n%s" % chapter_docbook_content)
            cmd = self.translator + ' -d rosetta-xhtml  -o - -'
            p = ProcessWithTimeout(cmd=cmd, shell=True, log=self.log)
            ret = p.start(timeout=5*60, input=chapter_docbook_content)
            stdoutData = p.output
            stderrData = p.error
            if stdoutData is None or len(stdoutData) == 0:
                self.log.info('fb2n translation failed for[%s]' % chapter_docbook_content)
            if stderrData is not None and len(stderrData) > 0:
                self.log.info('fb2n stderr[%s]' % stderrData)
            rosettaXhtmlProcessor = CK12RosettaXHTML()
            stdoutData = rosettaXhtmlProcessor.fix_custom_embed(stdoutData)
            option = dict(output_xhtml=1, clean=0, indent=1, tidy_mark=0)
            document, errors = tidy_document(stdoutData, option)
            if document is None or len(document) == 0:
                self.log.info('fb2n tidy failed for[%s]' % stdoutData)
                self.log.info('fb2n errors[%s]' % errors)
        except Exception as e:
            self.log.exception('fb2n: exception[%s]' % e.__str__())

        return document

if __name__ == '__main__':
    t = CK12Translator()
    content = open("/tmp/chapter.xml", "r").read()
    doc = t.get_rosetta_xhtml(content)
    print doc
