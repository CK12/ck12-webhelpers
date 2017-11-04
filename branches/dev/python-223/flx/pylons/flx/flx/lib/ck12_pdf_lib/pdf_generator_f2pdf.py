from subprocess import PIPE, Popen
import settings
import logging
from flx.lib.processwithtimeout import ProcessWithTimeout

class PdfGenerator:
     def __init__(self):
         self.log = logging.getLogger(__name__)
         self.f2pdf_home = ''
         self.work_dir = ''

     def setLogger(self, logger):
         self.log = logger

     def createPDF(self,work_dir,f2pdf_home, f2pdf_template, artifact_type):
         self.f2pdf_home = f2pdf_home
         self.work_dir = work_dir
         self.api_server = settings.DEFAULT_HTTP_PREFIX
         f2pdf_template = 'onecolumn'
         #timeout of 30 minutes
         timeout = 60*60
         #book_path = self.work_dir+'/'+settings.DEFAULT_BOOK_NAME
         create_cmd ='cd %s; python f2pdf.py -t %s -w %s -a  %s' %(f2pdf_home,
                                                         f2pdf_template,
                                                         self.work_dir + '/',
                                                         artifact_type)
         self.log.info(create_cmd)
         #Triggering the PDF generation task using ProcessWithTimeout to avoid zombie states
         p = ProcessWithTimeout(cmd=create_cmd, cwd=f2pdf_home, shell=True, log=self.log)
         return_code = p.start(timeout=timeout)
         if return_code == 0:
             self.log.info('pdf Successfully created')
             return self.work_dir + '/' + '/' + '%s.pdf' %(artifact_type)
         else:
             self.log.info('Could not generate pdf')
             return
