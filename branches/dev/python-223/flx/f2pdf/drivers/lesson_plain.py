#Translates lesson/concept to latex with plain template.

from base_driver import BaseDriver
from concept_parser import ConceptParser
import codecs

class LessonPlain (BaseDriver):
    def __init__(self):
        self.template_dir = "./templates/lesson-plain/"
        self.common_dir = "./templates/common/"
        self.logger = None
        self.work_dir = ""
        self.latex = ''
        

    def set_work_dir(self, work_dir):
        self.work_dir = work_dir
        

    def substitute(self):
        pass

    
    def translate(self):
        parser = ConceptParser()
        #cparser.init_payload(unicode(open(self.work_dir +"/concept1.xhtml", "r").read()))
        parser.init_payload(unicode(open(self.work_dir +"/chapter_01.xhtml", "r").read()))
        #parser.init_payload(unicode(open(self.work_dir +"/12.xhtml", "r").read()))
        self.latex = parser.translate()
        fd = open(self.work_dir + "/concept1.tex", "w")
        fd.write(self.latex)
        fd.close()
        
     
    def do_work(self):
        self.substitute()
        self.translate()        
        
  