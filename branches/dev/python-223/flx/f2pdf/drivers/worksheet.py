### CK12.ORG - F2PDF.PY support file 
### FILE: worksheet.py
### DESC: worksheet specific functions for f2pdf translator.
### Inherits Onecolumn driver and parser
### AUTH: Ezra
### DATE: Aug. 2011
from onecolumn import Onecolumn, OnecolumnParser
import codecs
import time
import os
from bjo_utils import countwidth, get_align_text, countwidthH2, tab_width
try:
    from PIL import Image
except:
    import Image

class Worksheet(Onecolumn):
    def __init__(self):
        self.template_dir = "./templates/worksheet/"
        self.common_dir = "./templates/common/"
        self.logger = None
        self.work_dir = ""
        self.latex = ''
        self.api_server = ''
        

    def set_work_dir(self, work_dir):
        self.work_dir = work_dir
        

    def substitute(self):
        pass

    
    def translate(self):
        parser = WorksheetParser()
        parser.work_dir = self.work_dir
        parser.art_type = self.art_type                
        parser.api_server = self.api_server
        fd = codecs.open(self.work_dir + "/" + self.htmlfile, "r", encoding="utf-8")
        xhtml_content = fd.read()
        fd.close()
        parser.init_payload(xhtml_content)

        #parser.init_payload(unicode(open(self.work_dir +"/"+self.htmlfile, "r").read()))

        self.latex = parser.translate()
        fd = open(self.work_dir + "/concept1.tex", "w")
        fd.write(self.latex)
        fd.close()
        
     
    def do_work(self):
        self.substitute()
        self.translate()        


## Over-write definitions here from OnecolumnParser class  
class WorksheetParser (OnecolumnParser):
    
    def __init__(self):
        OnecolumnParser.__init__(self)

