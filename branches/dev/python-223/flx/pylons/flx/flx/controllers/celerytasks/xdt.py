import logging
import os
import json
import re

from flx.model import api
from pylons.i18n.translation import _ 
from flx.controllers.celerytasks.generictask import GenericTask
from flx.lib.processwithtimeout import ProcessWithTimeout
import flx.lib.artifact_utils as au
import flx.lib.helpers as h

## Initialize logging
try:
    LOG_FILENAME = "celeryd.log"
    logger = logging.getLogger(__name__)
    logger.setLevel(logging.INFO)
    handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=10*1024*1024, backupCount=5)
    logger.addHandler(handler)
except:
    pass

timeout = 300

class XdtTask(GenericTask):
    recordToDB = True
    serializer = "json"
    loglevel = "INFO"

    def __init__(self, **kwargs):
        ## Initialize GenericTask
        GenericTask.__init__(self, **kwargs)
        self.routing_key = "xdt"
        self.output_file = None
        #self.exchange = "xdt"

    ## Runs on Windows
    def run(self, command, fromFile, toFile, userId, token, title=None, artifactHandle=None, type='lesson', saveArtifacts=False, updateExisting=False, **kwargs):
        GenericTask.run(self, **kwargs)
        logger.info("Converting %s %s to %s as user %s" % (fromFile, command, toFile, userId))
        timeout = 1200
        ipy = self.config['iron_python_exe']
        xdtBaseDir = self.config['xdt_base_dir']
        xdtWinShare = self.config['xdt_share_windows']
        flxPrefix = self.config['flx_prefix_url']
        logger.info("flx_prefix_url: %s" % flxPrefix)

        props = { "FLX2_HOST": "flx2_host", }
        for key, val in props.iteritems():
            os.environ[key] = self.config[val]

        fromFile = '%s/%s' % (xdtWinShare, fromFile)
        toFile = '%s/%s' % (xdtWinShare, toFile)

        proc = None
        if command == 'xhtml2docx':
            cmd = [ipy, 'openxml/todocx/generateDocx.py', '%s' % fromFile, '%s' % toFile]
            logger.info("Running command: %s [timeout: %s]" % (" ".join(cmd), timeout))
            proc = ProcessWithTimeout(cmd=cmd, cwd=xdtBaseDir, log=logger)
        elif command == 'docx2xhtml':
            member = api.getMemberByID(id=userId)
            cmd = [ipy, 'openxml/fromdocx/parseDocx.py', '-u', str(member.id), '-l', member.login, '-t', '%s=%s' % (self.config.get('ck12_login_cookie', 'auth'), token), '-s', '%s' % fromFile, '-d', '%s' % toFile]
            logger.info("Running command: %s [timeout: %s]" % (" ".join(cmd), timeout))
            proc = ProcessWithTimeout(cmd=cmd, cwd=xdtBaseDir, log=logger)

        self.output_file = toFile

        ret = proc.start(timeout=timeout)
        logger.info('Return code: %s' % ret)
        if ret == 0:
            logger.info("Output: %s" % proc.output)
            try:
                fromFile = fromFile.replace(r'\\', '/')
                if os.path.exists(fromFile) == True:
                    os.remove(fromFile)
            except Exception as e:
                logger.error(e)
        else:
            logger.error("Error: %s" % proc.error)
            logger.error("Output: %s" % proc.output)
            #print "Error: %s" % proc.error
            raise Exception((_(u'Error running conversion: [%(proc.error)s]')  % {"proc.error":proc.error}).encode("utf-8"))

        if command == 'docx2xhtml' and saveArtifacts:
            toFile = toFile.replace(r'\\', '/')
            logger.info("Need to save artifact. Getting contents: [%s]" % toFile)
            logger.info("File exists? %s" % os.path.exists(toFile))
            xhtml = open(toFile, 'rb').read()
            logger.info("Got xhtml length: %d" % len(xhtml))
            # Replace all & inside title attribute with &amp;
            pat = re.compile('title=[\',"].*?[\',"]')
            titles = pat.findall(xhtml)
            for old_title in titles:
                if old_title.find('&') >= 0 and (old_title.find('&amp;') == -1 or old_title.find('&#38') == -1):    
                    new_title = old_title.replace('&', '&amp;')
                    xhtml = xhtml.replace(old_title, new_title)                        
            ## Split xhtml into lesson and concept
            if type == 'lesson':
                children = []
                lesson_xhtml = concept_xhtml = None
                if api.isLessonConceptSplitEnabled:
                    try:
                        lesson_xhtml, concept_xhtml = h.splitLessonXhtml(xhtml, splitOn='h2')
                    except Exception, e:
                        logger.error("Error splitting concept: %s" % str(e), exc_info=e)
                        concept_xhtml = xhtml
                        lesson_xhtml = h.getLessonSkeleton()
                else:
                    conceptStartXHTML = "<!-- Begin inserted XHTML \[CONCEPT: .*\] -->"
                    conceptEndXHTML = "<!-- End inserted XHTML \[CONCEPT: .*\] -->"
                    conceptStartXHTML = re.search(conceptStartXHTML, xhtml)
                    conceptEndXHTML = re.search(conceptEndXHTML, xhtml)
                    if conceptStartXHTML and conceptEndXHTML:
                        xhtml = xhtml[:conceptStartXHTML.start()]+xhtml[conceptStartXHTML.end():conceptEndXHTML.start()]+xhtml[conceptEndXHTML.end():]
            
                    lesson_xhtml=xhtml
                    concept_xhtml=None                    
                try:
                    if concept_xhtml:
                        conceptID, conceptRevID = au.saveArtifactREST(flxPrefix, userId, token, title, artifactHandle, concept_xhtml, 'concept', updateExisting=updateExisting)
                        children = [conceptRevID]
                        self.userdata = json.dumps({'artifactID': conceptID, 'artifactRevisionID': conceptRevID, 'artifactType': 'concept'})
                    if lesson_xhtml:
                        lessonID, lessonRevID = au.saveArtifactREST(flxPrefix, userId, token, title, artifactHandle, lesson_xhtml, 'lesson', children=children, updateExisting=updateExisting)
                        self.userdata = json.dumps({'artifactID': lessonID, 'artifactRevisionID': lessonRevID, 'artifactType': 'lesson'})
                except Exception as e:
                    raise e
            else:
                try:
                    conceptID, conceptRevID = au.saveArtifactREST(flxPrefix, userId, token, title, artifactHandle, xhtml, type, updateExisting=updateExisting)
                except Exception as e:
                    raise e
                self.userdata = json.dumps({'artifactID': conceptID, 'artifactRevisionID': conceptRevID, 'artifactType': type})
            logger.info("Saved artifact(s): %s" % self.userdata)

        return ret
