import os, sys, re
from subprocess import PIPE, Popen
import logging
from PIL import Image
from datetime import datetime
import urllib
import codecs

log = logging.getLogger(__name__)

class HwpPrinter():

    def __init__(self):
        self.workDir = ''

    def __init__(self):
        self.flx_prefix_url = ''
        self.f2pdf_home = ''
        self.work_dir = '/tmp/hwp/pdf'
        self.exercise_math_class = 'x-ck12-hwpmath'
        self.block_math_class = 'x-ck12-block-math'

    def setLogger(self, logger):
        self.log = logger

    def printToPDF(self, flx_prefix, work_dir, f2pdf_home, f2pdf_template):
        self.flx_prefix_url = flx_prefix
        work_dir = work_dir + '/' if not work_dir.endswith('/') else work_dir
        self.work_dir = work_dir
        self.f2pdf_home = f2pdf_home
        self.f2pdf_template  = f2pdf_template
        self.copyImages(work_dir)
        pdf = self.createPDF(work_dir)
        return pdf

    def createPDF(self,work_dir):
        payload_type = '"workbook"'
        result_file = 'workbook.pdf'
        create_cmd ='cd %s; python f2pdf.py -a %s -t %s -w %s' %(
                     self.f2pdf_home, payload_type, self.f2pdf_template, work_dir)
        self.log.info(create_cmd)
        p = Popen(create_cmd,stdout=PIPE, stderr=PIPE, shell=True)
        process_output = p.communicate()
        f2pdf_output = process_output[0]
        f2pdf_error = process_output[1]
        if p.returncode == 0:
            self.log.info('pdf Successfully created')
            self.log.info(self.work_dir + result_file)
            return self.work_dir + result_file
        else:
            self.log.error('Could not generate pdf')
            self.log.error("Error :"+str(f2pdf_error))
            return

    def copyImages(self, source_dir):
        if not source_dir.endswith("/"):
           source_dir = source_dir +"/"
        
        htmls = os.walk(source_dir).next()[2]
        for html in htmls:
            if html.lower().endswith('.xhtml'):
                html_file = source_dir + "/" + html
                f = open(html_file,"r")
                xhtml = f.read()
                f.close()
                xhtml = self.copy_html_images(xhtml, source_dir)
                f = codecs.open(html_file, 'wb+', encoding='utf-8')
                xhtml = xhtml.decode('utf-8')
                #xhtml = xhtml.encode('ascii', 'xmlcharrefreplace')
                f.write(xhtml)
                f.close()
 

    # download all images and save it in work_dir
    def copy_html_images(self,xhtml,resource_path):
        self.log.info("Trying to copy images")
        img_src_pattern = re.compile("<img .*?src=\W*\"(.*?)\"", re.DOTALL )
        image_srcs = img_src_pattern.findall(xhtml)
        self.mkdir(resource_path+'/'+'images_01')
        images_resource_path = resource_path+'/' + 'images_01'
        for image_src in image_srcs:
            self.log.info('Image list: '+ image_src)

            if (image_src.rfind('/flx/math/') == -1):
                #regular image
                new_image_path = self.create_unique_path(images_resource_path)
                try:
                    self.retrieve_image(image_src, new_image_path)
                    image_obj = Image.open(new_image_path)
                    img_format = image_obj.format.lower()

                    #save image with extension
                    cmd = 'mv '+new_image_path+' '+new_image_path+'.'+img_format
                    os.system(cmd)

                    xhtml = xhtml.replace(image_src +"\"" , new_image_path.replace(resource_path+'/',"")+'.'+img_format+"\"", 1)
                except Exception as Detail:
                    #TODO: Need error image  
                    self.log.info("Couldn't find image tiype for image with URL: "+ image_src + " .  Possible cause: Render Failure.")
        
        return xhtml   

    def create_unique_path(self,prefix):
        if not prefix.endswith('/'):
            prefix += '/'
        return prefix + self.create_timestamp()

    def create_timestamp(self):
        return datetime.now().strftime("%Y%m%d%H%M%S%f")
     
    def retrieve_image(self,url, path):
        return urllib.urlretrieve(url, path)
 
    def mkdir(self, path):
        if not os.path.exists(path):
            os.makedirs(path)
            return True
        else:
            return False

if __name__ == "__main__":
    printer = HwpPrinter()
    printer.printToPDF(sys.argv[1], sys.argv[2], sys.argv[3])
