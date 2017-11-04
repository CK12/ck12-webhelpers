'''
This is the wiki extractor.
'''
from subprocess import PIPE, Popen, STDOUT
import os, random, hashlib
import logging
import settings
import urllib
import codecs

#Initialing logger
log_level = settings.LEVELS.get(settings.LOG_LEVEL, logging.NOTSET)
#logging.basicConfig(filename=settings.LOG_FILENAME,level=settings.LOG_LEVEL,)

class CK12WikiExtractor:

    def __init__(self):
        self.log = logging.getLogger(__name__)
        #self.log.setLevel(log_level)
        #self.log.info("Initializing CK12WikiExtractor object")
        self.wikiurl = ''
        self.working_dir = ''
        self.is_working_dir = True
        self.wiki_extractor_path = '/opt/2.0/flx/export2xhtml/'
        self.wiki_extractor_engine = settings.WIKI_EXTRACTOR_ENGINE
        self.wiki_extractor = self.wiki_extractor_path + self.wiki_extractor_engine
        self.wiki_cache = settings.WIKI_CACHE
        self.buffer = ''
        self.working_dir = '/tmp/wikiimport2.0/'
        if not os.path.exists(self.working_dir):
            os.mkdir(self.working_dir)

    def setLogger(self, logger):
        self.log = logger

    def import_from_wiki(self):
        if self.is_working_dir == True:
            return self.import_from_wiki_to_dir(self.wikiurl)

    def import_from_wiki_to_dir(self, _wikiurl, _working_dir, concept_mode = False, is_metadata_mode=False):

        try:

            if _wikiurl.strip() == '':
                self.log.error("Wiki URL cannot be empty")
                return False

            url_type, url_path = urllib.splittype(_wikiurl)
            if url_type is None:
                _wikiurl = 'http://%s' % _wikiurl

            #EZ, the payload url is already encoded. This line makes the url double encoded
            #_wikiurl = urllib.quote(_wikiurl)     

            fp = codecs.open(settings.WIKI_EXT_LOG_FILENAME, "w+", encoding='utf-8')
            if 'mwdocbook' in self.wiki_extractor:
                cmd = self.wiki_extractor + ' -l %s -d ' % settings.FLX_PREFIX + _wikiurl + ' ' + _working_dir
            else:
                cmd = self.wiki_extractor + ' -u \'%s\' ' %(settings.WIKI_USERNAME) + \
                                        ' -p \'%s\' ' %(settings.WIKI_PASSWORD) + \
                                        ' %s ' %('--concept' if concept_mode else '') + \
                                        ' %s ' %('--metadata-only' if is_metadata_mode else '') + \
                                        ' %s ' %('--use-cache' if self.wiki_cache and not is_metadata_mode else '') + \
                                        ' -w \'%s\' ' %(_wikiurl) + \
                                        ' %s ' %('-m /opt/2.0/flx/pylons/flx/flx/tests/data/metadata.xml' if settings.CACHED_METADATA else '') + \
                                                      _working_dir

            self.log.info("Importing from "+ _wikiurl + " ...")
            self.log.info("Running command: %s" % cmd)
            from copy import deepcopy
            env = deepcopy(os.environ)
            env['LC_CTYPE'] = 'en_US.utf-8'
            env['LANG'] = 'en_US.utf-8'
            env['LC_ALL'] = 'en_US.utf-8'
            p = Popen(cmd, stdin=PIPE, stdout=fp, stderr=fp, shell=True, env=env)
            p.communicate()
            fp.close()
            self.log.info("Importing from "+ _wikiurl + " is done.")
            return True

        except Exception as e:
            self.log.exception("Wiki Extractor:  " + e.__str__())
            return False
