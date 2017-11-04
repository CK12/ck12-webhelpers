import os
import logging
import re
from subprocess import PIPE, Popen, STDOUT

log = logging.getLogger(__name__)

def get_docbook(xhtmlpath):
    cmd = 'fb2n '+ ' -d rosetta-docbook  -o - -'
    xhtml = open(xhtmlpath, "r").read()
    p = Popen(cmd, stdin=PIPE, stdout=PIPE, stderr=PIPE, shell=True)
    process_output = p.communicate(xhtml)
    doc_book = process_output[0]
    error_txt = process_output[1]
    if p.returncode == 0:
         return doc_book
    else:
         log.error('Could not generate docbook from xhtml')
         log.error("fb2n error : %s", str(error_txt))
         return None

def cleanup(xhtmlpath):
    file_handle = open(xhtmlpath, "r")
    html = file_handle.read()
    file_handle.close()
    #xhtml = transform_to_xhtml(html)
    xhtml = removeExtraText(html)
    xhtml = chopXHTMLHead(xhtml)
    file_handle = open(xhtmlpath, "w")
    file_handle.write(xhtml)
    file_handle.close()
    return xhtmlpath

#removing extra text in image div class(fixed temporarily)        
def removeExtraText(xhtml):
     div_pattern = re.compile("<div .*?>", re.DOTALL)
     divs = div_pattern.findall(xhtml)
     for div in divs:
         class_pattern = re.compile('class="((\w*?)\s*?([a-zA-Z0-9-]*?ck12[a-zA-Z0-9-]*)\s*(\w*?))"')
         img_class = class_pattern.findall(div)
         if len(img_class) != 0:
            if len(img_class[0][1])!=0 or len(img_class[0][3])!=0:
                new_div = div.replace(img_class[0][0],img_class[0][2])
                xhtml = xhtml.replace(div,new_div)
     return xhtml 

def chopXHTMLHead(xhtml):
    try:
        xhtml = xhtml.split('<body>')[1].replace('</body>','').replace('</html>','')
        return xhtml
    except Exception as e:
        return xhtml

def removeTmpDirectories(workdir):
    rm_cmd = 'rm -r "'+workdir+'"'
    os.system(rm_cmd);

 
#add chapter title in docbook content
def add_chapter_title(docbook,ctitle):
     chap_tag_pat = re.compile('<chapter>')
     chapter_tag = chap_tag_pat.findall(docbook)
     if len(chapter_tag) > 0:
         docbook = docbook.replace(chapter_tag[0],'<chapter>\n<title>'+ctitle+'</title>') 
     return docbook

def transform_to_xhtml(html):
    option = {"output-xhtml":1, "clean":1, "tidy-mark":0}
    document, errors = tidy_document(html, option)
    return document 

def get_xhtml(docbookpath):
    cmd = 'cat '+docbookpath+' |fb2n '+ ' -d rosetta-xhtml  -o - -'
    p = Popen(cmd, stdin=PIPE, stdout=PIPE, stderr=PIPE, shell=True)
    process_output = p.communicate()
    doc_book = process_output[0]
    error_txt = process_output[1]
    if p.returncode == 0:
         return doc_book
    else:
         log.error('Could not generate xhtml from docbook')
         log.error("fb2n error :"+str(error_txt))
         return None

