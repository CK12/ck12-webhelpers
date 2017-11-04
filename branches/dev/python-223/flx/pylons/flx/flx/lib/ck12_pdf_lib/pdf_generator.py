import os
from subprocess import PIPE, Popen
import settings
import logging

class PdfGenerator:
     def __init__(self):
         self.log = logging.getLogger(__name__)
         self.fb2n_home = ''
         self.work_dir = ''

     def setLogger(self, logger):
         self.log = logger

     def createPDF(self,work_dir,fb2n_home):
         self.fb2n_home = fb2n_home
         self.work_dir = work_dir 
         book_path = self.work_dir+'/'+settings.DEFAULT_BOOK_NAME
         create_cmd ='fb2n -d plain -o '+book_path+' '+work_dir
         self.log.info(create_cmd)
         p = Popen(create_cmd,stdout=PIPE, stderr=PIPE, shell=True)
         process_output = p.communicate()
         fb2n_output = process_output[0]
         fb2n_error = process_output[1]
         if p.returncode == 0:
             self.log.info('pdf Successfully created')
             return book_path 
         else:
             self.log.info('Could not generate pdf')
             self.log.info("Error :"+str(fb2n_error))     
             return  

    
 
  
