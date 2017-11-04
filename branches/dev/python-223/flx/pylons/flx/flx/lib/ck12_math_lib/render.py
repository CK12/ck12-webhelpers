import re
import os
import shutil
import logging
from datetime import datetime
from BeautifulSoup import BeautifulStoneSoup
import codecs

DEBUG = True
ROOT_WORK_DIR = "/tmp"
TEMPLATE_DIR = "/opt/2.0/flx/pylons/flx/flx/lib/ck12_math_lib/templates"
#block_math_template = ""
#math_template = ""
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)

def create_block_math(latex, target="web"):
    return create("block", latex, target)
    

def create_math(latex, target="web"):
    return create("inline", latex, target)

    
def create_alignat_math(latex, target="web"):
    return create("alignat", latex, target)

    
def create(type, latex, hash, target="web"):
    #hash would be unique, we are going to use it as name
    decoded =  __decode_html_entities(latex)
    if type == 'inline':
        tmpl_string = __get_math_template().replace('%(math)s', decoded)
    elif type == 'block':
        tmpl_string = __get_block_template().replace('%(blockmath)s', decoded)
    elif type == 'alignat':
        #Matematic symbols with specifict alignments, currently only used for homeworkpedia.
        #At the moment, only 2 columns is supported 
        col_size = 2
        tmpl_string = __get_alignat_template().replace('%(alignat)s', decoded)
        tmpl_string = tmpl_string.replace('%(cols)d', str(col_size))
    else: 
        log.error ("invalid math type")
        
    return __render_image_target(tmpl_string, hash, target)
    

def __render_image_target(latex, hash, target):
    work_dir = __create_work_dir(ROOT_WORK_DIR)
    tex_file = "math.tex"
    dvi_file = "math.dvi"
    result_file = ""
    result_ext = ""
    tex2dvi_command = "latex -interaction=nonstopmode -no-shell-escape -file-line-error -halt-on-error %s 1>/dev/null 2>/dev/null" % tex_file
    dvi2gif_command = "dvigif --strict -l=1 -bg Transparent -T tight -D 110 %s" %dvi_file
    dvi2png_command = "dvipng --strict -l=1 -bg Transparent -T tight -D 110 %s" %dvi_file
    dvi2pnghwp_command = "dvipng --strict -l=1 -bg Transparent -T tight -D 110 %s" %dvi_file
    
    if target == "web" :
        dvi_command = dvi2png_command
        if latex.rfind('alignat')>=0:
            dvi_command = dvi2pnghwp_command
            
        result_file = "math1.png"
        result_ext = ".png"
    elif target == "kindle":
        dvi_command = dvi2gif_command
        result_file = "math1.gif"
        result_ext = ".gif"
        
    file = codecs.open(work_dir+"/"+ tex_file, "w+", encoding='utf-8')
    file.write(latex)
    file.close()
    cmd = "cd "+ work_dir +"; "+ tex2dvi_command 
    os.system(cmd)
    cmd = "cd "+ work_dir +"; "+ dvi_command
    os.system(cmd)
    cmd = "mv "+ work_dir +"/"+result_file +" "+ work_dir +"/"+ hash + result_ext
    os.system(cmd)
    return work_dir +"/"+ hash + result_ext
    
    
def __create_work_dir(root):
    work_dir = ""
    attempt = 0
    created = False
    while attempt < 3:
        attempt +=1
        time_str = ""
        time_str = __create_timestamp()
        work_dir = root + "/ck12" + time_str
        if __mkdir(work_dir):
            created = True
            break;
    
    if not created:
        raise IOError("Failed to create working directory. Permission issue?")
    else :    
        return work_dir


#simply make a dir. Return false if failed
def __mkdir(path):
    if not os.path.exists(path):
        os.mkdir(path)
        return True
    else:
        return False


def __get_alignat_template():
    file = codecs.open(TEMPLATE_DIR +"/alignat.tex", mode='r', encoding='utf-8')
    alignat_math_template = file.read()
    file.close()
    return alignat_math_template
    
    
def __get_block_template():
    file = codecs.open(TEMPLATE_DIR +"/blockmath.tex", mode='r', encoding='utf-8')
    block_math_template = file.read()
    file.close()
    return block_math_template
    
    
def __get_math_template():
    file = codecs.open(TEMPLATE_DIR +"/math.tex", mode='r', encoding='utf-8')
    math_template = file.read()
    file.close()
    return math_template
    
   
def cleanup(image_path):
    try:
        dir_path = os.path.dirname(image_path)
        log.debug("Cleaning up for "+ image_path)
        shutil.rmtree(dir_path)
    except Exception as e:
        log.error("Couldn't cleanup: %s" % image_path)
        log.error("Reason: %s" % str(e))

    
def __create_timestamp():
    return datetime.now().strftime("%Y%m%d%H%M%S%f")

    
def __decode_html_entities(string):
    return unicode(BeautifulStoneSoup(string, convertEntities=BeautifulStoneSoup.HTML_ENTITIES))


