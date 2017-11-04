#####################################################################
##  File-             utils.py                                     ##
##  Description-      Support file for f2pdf.  Used to render and  ##
##      measure tex as pdf before insertion into doc               ## 
##  Author-           Britton Olson                                ##
##  Date-             Nov 2011                                     ##
#####################################################################
import re
from subprocess import PIPE, Popen
from datetime import datetime
from BeautifulSoup import BeautifulSoup
import os
from sys import stdout, exit, __stdout__
import logging
import codecs
from pyPdf import PdfFileReader
from tempfile import NamedTemporaryFile
import logging.handlers
import time
import subprocess
import urllib2

from lib_external.headrequest import HeadRequest, HeadRedirectHandler

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
handler = logging.StreamHandler(__stdout__)
logger.addHandler(handler)

def printConsole(string):
    #if string and type(string).__name__ == 'str':
    #    string = string.decode('utf-8')
    #logger.info(string)
    return

#####################################################################
def countwidthH2(LatexEQ,workdir):
# This function used to get the dimensional length of a latex string.
# equations are assumed 'in-line' format. The width is returned by 
# printing it in the pdf, which is read in and parsed (fast)
#--LatexEQ (input) - 'inline' Latex equation to be rendered
#--workdir (input) - Working directory for tex files
#--wide (output)   - Width of the rendered latex string

    #   Minimal header stuff
    head = get_header()
    head = head + "\\begin{document} \n"

    #   Command to print the width in the pdf (not the LatexEQ)
    mid = "\\newdimen\width \n"
    mid = mid + "\\setbox0=\hbox{" + LatexEQ  + "} \n"
    mid = mid + "\width=\wd0 \\advance\width by \dp0 \n"
    mid = mid + "The width is: \\the\width \n"
    #mid = mid + LatexEQ  # No need to render actual tex... just the width

    #   Minimal ending
    tail = "\end{document}"

    tmp = get_IMname(workdir)
    fname = tmp + ".tex"
    dim = render_tex( head+mid+tail , 'read', fname)
    wide = float( dim[1] )

    return wide

#####################################################################
def countwidthTX(LatexEQ,workdir):
# This function will take Latex equation input, count the width of 
# given text and output the text into a pdf.  We then read in the pdf 
# and convert it to a float, which is returned 
#--LatexEQ (input) - Latex equation to be passed (inlined only)
#--workdir (input) - Working directory for tex files                                                                                                                                                        
#--wide (output)   - Width of the rendered latex string  

    tex = "$" + LatexEQ + "$"
    wide = countwidthH2(tex,workdir)
    return wide

#####################################################################
def countwidthTX2(LatexEQ,workdir):
# This function will take Latex equation input, count the width of 
# given text and output the text into a pdf.  We then read in the pdf 
# and convert it to a float, which is returned 
#--LatexEQ (input) - Latex equation to be rendered inside of align
#--workdir (input) - Working directory for tex files
#--wide (output)   - Width of the rendered latex string  

    #   Minimal header stuff
    head = get_header()
    head = head + "\\begin{document} \n"
    head = head + "\\thispagestyle{empty} \n"

    #   Command to print the width
    mid = "\\begin{align*}\n"
    mid = mid + LatexEQ  + "\n"
    mid = mid + "\end{align*}"

    #   Minimal ending
    tail = "\end{document}"#

    tmp = get_IMname(workdir)
    fname = tmp + ".tex"
    dim = render_tex( head+mid+tail, 'measure', fname)

    #wide = dim[0]


#####################################################################
def tex_width(tex,workdir):
# Input is anything that will render after \begin{document}
#--tex (input) - The Latex source to be placed in document
#--workdir (input) - Working directory for tex files
#--wide (output)   - Width of the rendered latex string  

    wide = 0.0
    head = get_header()  # Some standard packages and stuff
    
    latex = head + '\n \begin{document} \n'
    latex += tex + '\n'
    latex = latex + '\end{document}'
    
    tmp = get_IMname(workdir)
    fname = tmp + ".tex"
    dim = render_tex(latex,'measure',fname)
    wide = float( dim[0] )

    return wide


#####################################################################
def get_header():
# Some standard header routines used for the tmp tex files
#--head (output) - the tex file header
    head = ''
    head = "\documentclass[11pt,twoside,openany]{book} \n"
    head = head + "\usepackage{amsmath} \n \usepackage{amssymb} \n"
    head = head + "\usepackage{txfonts} \n \usepackage{graphicx} \n"
    head = head + "\usepackage{lscape} \n "
    return head

#####################################################################
def render_tex(fulltex,method,fname):
# Main driver for all tex string/equation render functions
# Render entire texfile and feed pdf path to (read or measure) to 
# return dimensions of the rendered tex.
#--fulltex (input) - The entire string of the latex file
#--method (input) - Either measure the resulting pdf size or read the 
#                   size from pdf itself.
#--fname (input) - Base name of the .tex file and resulting pdf
#--dims (output) - Dimensions (widthxheight)   
    ### Stage 1- Write to a tmp.tex file
    F = codecs.open(fname,'w', encoding = 'utf-8' )
    F.write( fulltex  )
    F.close()

    ### Stage 2- Compile the temp tex file and convert pdf to .txt (ascii text file)
    workdir = fname.rpartition('/')[0]  # Grab the path to the file directory
    cmd = "cd "+workdir + "; " +  "pdflatex -interaction=batchmode " + fname + " >> PDFLATEX.out"
    p = Popen(cmd, stdin=PIPE, shell=True)
    p.communicate()

    ### Stage 3- Get the width of the rendered pdf content
    ## Either parse the pdf for width or crop and measure
    if method == 'read':
        dim = read_width(fname.replace('.tex','.pdf'))
    else:
        dim = measure_width(fname.replace('.tex','.pdf'))

    ### Stage 4- Clean up the tmp files
    #cmd = "rm -f " + fname.replace(".tex","*")
    #p = Popen(cmd, stdin=PIPE, shell=True)
    #p.communicate()

    dims = list(map(float, dim))
    return dims


#####################################################################
def read_width(pdfname):
# Parse pdf for width info. This is fast but limited.
# The PDF itself is assumed to contain the string dimensions alone.  
# We convert the pdf to a text file and then read in the text, and 
# parse the string for the dimensions.  Faster than measuring.
#--pdfname (input) - full path name of the pdf file
#--dim (output) - the dimensions of the latex string
    workdir = os.path.dirname(pdfname)

    ### Stage 2- Compile the temp tex file and convert pdf to .txt (ascii text file)
    cmd = "cd " + workdir + " ; "
    cmd = cmd + "pdftotext " + pdfname + " " + pdfname.replace(".pdf",".txt")
    p = Popen(cmd, stdin=PIPE, shell=True)
    p.communicate()

    ### Stage 3- Read in the txt file and return the width of the latex equation
    F = open(pdfname.replace(".pdf",".txt"),'r')
    count = F.read()
    dim = re.findall(r"[+-]? *(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?", count)

    return dim


#####################################################################
def measure_width(pdfname):
# Will take the pdf and crop all the surrounding white space.  The
# remainder is then measured and the dimensions are returned.
#--pdfname (input) - full path name of the pdf file
#--dim (output) - the dimensions of the latex string

    cropname = pdfname.replace(".pdf","_crop.pdf")
    workdir = os.path.dirname(pdfname)
    cmd = "cd " + workdir + " ; "
    cmd = cmd + "pdfcrop " + pdfname + " " + cropname + " >> PDFCROP.out; "
    cmd = cmd + "pdfinfo " + cropname + ' | grep "Page size" -> ' + pdfname.replace(".pdf",".txt") + "; "
    cmd = cmd + "mv -f " + cropname + " " + pdfname
    p = Popen(cmd, stdin=PIPE, shell=True)
    p.communicate()

    ### Stage 3- Read in the txt file and return the width of the latex equation
    F = open(pdfname.replace(".pdf",".txt"),'r')
    count = F.read()
    dim = re.findall(r"[+-]? *(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?", count)

    return dim



#####################################################################
def tab_width(tabtex,workdir):
## Assums a table to HUGE and measure the natural width
    head = get_header()
    head = head + "\n \input{../ck12_common} \n"
    head = head + "\n" + r"\pagestyle{empty}" + " \n"
    head = head + "\\begin{document} \n \\thispagestyle{empty} \n"
    tex = head + tabtex + "\n" + r"\end{document}"

    tmp = get_IMname(workdir)
    fname = tmp + ".tex"
    dim = render_tex(tex,'measure',fname)
    if len(dim) < 2:
        dim = [72.0*6.0]*2
    elif dim[1] == None :
        dim = [72.0*6.0]*2

    #wide = dim[1]  # 2nd index... landscape mode from cktabww
    wide = dim[0]  # 1st index... nonlandscape mode from cktabww

    return wide

## Assums a table to HUGE and measure the natural width
def align_width(tabtex,fname):
    head = get_header()
    head = head + "\n \include{ck12_common} \n"
    head = head + "\n \usepackage{array} \n"
    head = head + "\\begin{document} \n \\thispagestyle{empty} \n"
    tex = head + tabtex + "\n" + r"\end{document}"

    dim = render_tex(tex,'measure',fname)
    if len(dim) < 2:
        dim = [100]*2
    elif dim[1] == None :
        dim = [100]*2

    wide = dim[0]  # 1st Index is width, 2nd is height

    return wide


def get_IMname(work_dir):

    d = work_dir + 'math_images/'
    f = d + datetime.now().strftime("%M%S%f")
    d = os.path.dirname(f)
    if not os.path.exists(d):
        os.makedirs(d)

    return f

def fix_frac_exponent(text):
    '''
    This method will search for instances of ^ followed by LaTeX frac.
    If a ^ precedes a LaTeX frac without any braces, then it will wrap the 
    frac inside of braces. 
    It will search through one level of braces nesting, but it will not work
    for brace nesting deeper than one level. It will simply fail to work rather
    than making a regex substitution. 
    '''
    # compile the regex: search for ^ <any space> \frac <any space> {<skip anything in {}>} <any space> {<skip anything in {}>}
    pattern = re.compile(r'\^(\s*\\frac\s*{([^{}]*({[^{}]*})*[^{}]*)*}\s*{([^{}]*({[^{}]*})*[^{}]*)*)', re.I|re.S)
    # search, substitute, and return 
    return pattern.sub(r'^{\1}', text)

def fix_frac_subscript(text):
    '''
    This method will search for instances of _ followed by LaTeX frac.
    If a _ precedes a LaTeX frac without any braces, then it will wrap the 
    frac inside of braces. 
    It will search through one level of braces nesting, but it will not work
    for brace nesting deeper than one level. It will simply fail to work rather
    than making a regex substitution. 
    '''
    # compile the regex: search for _ <any space> \frac <any space> {<skip anything in {}>} <any space> {<skip anything in {}>}
    pattern = re.compile(r'_(\s*\\frac\s*{([^{}]*({[^{}]*})*[^{}]*)*}\s*{([^{}]*({[^{}]*})*[^{}]*)*)', re.I|re.S)
    # search, substitute, and return 
    return pattern.sub(r'_{\1}', text)

def fix_altText(altText):
    #if altText.find('Theorem') > 0:
    #    import pdb; pdb.set_trace()
    #    print altText
    altTextNew = altText
    #altTextNew = altTextNew.replace(r'\$', r'$')
    #altTextNew = altTextNew.replace(r'\%', r'%')

    # since we're replacing the '#' symbols in the concept_parser.cleanup_html method, 
    # we shouldn't replace '\#' with '#', alt texts should have an escaped hash in the xhtml
    #altTextNew = altTextNew.replace(r'\#', r'#')

    altTextNew = altTextNew.replace(r'\_', r'_')
    altTextNew = altTextNew.replace(r'\{', r'{')
    altTextNew = altTextNew.replace(r'\}', r'}')
    altTextNew = altTextNew.replace(r'\...', r'\ldots')
    altTextNew = altTextNew.replace(u'\xe2\x80\x99', "'")
    altTextNew = altTextNew.replace(u'\xe2\x80\x9d', '"')
    altTextNew = altTextNew.replace(u'&#34;', '"')
    altTextNew = altTextNew.replace(u'\xe2\x80\x9c', '``')
    altTextNew = altTextNew.replace(u'\xe2\x88\xa0', r'\angle ')
    altTextNew = altTextNew.replace(r'{\textasciitilde}', '~')
    altTextNew = BeautifulSoup(altTextNew, convertEntities=BeautifulSoup.HTML_ENTITIES).text
    #import pdb; pdb.set_trace()
    return altTextNew

def fix_specialText(text):
    textNew = text
    textNew = textNew.replace(r'#', r'\#')
    textNew = textNew.replace(r'_', r'\_')
    textNew = textNew.replace(r'{', r'\{')
    textNew = textNew.replace(r'}', r'\}')
    textNew = textNew.replace(r'$', r'\$')
    textNew = textNew.replace(r'^', r'\verb|^|')
    textNew = textNew.replace(r'~', r'\verb|~|')
    textNew = textNew.replace(r'%', r'\%')
    textNew = textNew.replace(r'&', r'\&')
    return textNew

def insert_string(url,space,gap):
    lst = list(url)
    result = []
    count = 0
    for e in lst:
        count += 1
        result.append(e)
        if (e != "\\" and count%gap == 0):
            result.append(space)
    iurl = ''.join(result)
    return iurl

def _return_glyph(matches):
    id = matches.group(1)
    try:
        return unichr(int(id))
    except:
        return id

def get_unicode_references(text):
    return re.sub("&\\\#(\d+);", _return_glyph, text)

def fix_greek(text):
    ## Special unicode - Upper and lower case Greek

    text = get_unicode_references(text)

    # UPPER
    text = text.replace(u'\u0392',r"B")
    text = text.replace(u'\u0393',r"$\Gamma$")
    text = text.replace(u'\u0394',r"$\Delta$")
    text = text.replace(u'\u0395',r"E")
    text = text.replace(u'\u0396',r"Z")
    text = text.replace(u'\u0397',r"H")
    text = text.replace(u'\u0398',r"$\Theta$")
    text = text.replace(u'\u0399',r"I")
    text = text.replace(u'\u039a',r"K")
    text = text.replace(u'\u039b',r"$\Lambda$")
    text = text.replace(u'\u039c',r"M")
    text = text.replace(u'\u039d',r"N")
    text = text.replace(u'\u039e',r"$\Xi$")
    text = text.replace(u'\u039f',r"O")
    text = text.replace(u'\u03a0',r"$\Pi$")
    text = text.replace(u'\u03a1',r"P")
    text = text.replace(u'\u03a3',r"$\Sigma$")
    text = text.replace(u'\u03a4',r"T")
    text = text.replace(u'\u03a5',r"$\Upsilon$")
    text = text.replace(u'\u03a6',r"$\Phi$")
    text = text.replace(u'\u03a7',r"X")
    text = text.replace(u'\u03a8',r"$\Psi$")
    text = text.replace(u'\u03a9',r"$\Omega$")

    # LOWER CASE
    text = text.replace(u'\u03b1',r"$\alpha$")
    text = text.replace(u'\u03b2',r"$\beta$")
    text = text.replace(u'\u03b3',r"$\gamma$")
    text = text.replace(u'\u03b4',r"$\delta$")
    text = text.replace(u'\u03b4',r"$\delta$")
    text = text.replace(u'\u03b5',r"$\varepsilon$")
    text = text.replace(u'\u03b6',r"$\zeta$")
    text = text.replace(u'\u03b7',r"$\eta$")
    text = text.replace(u'\u03b8',r"$\theta$")
    text = text.replace(u'\u03b9',r"$\iota$")
    text = text.replace(u'\u03ba',r"$\kappa$")
    text = text.replace(u'\u03bb',r"$\lambda$")
    text = text.replace(u'\u03bc',r"$\mu$")
    text = text.replace(u'\u03bd',r"$\nu$")
    text = text.replace(u'\u03be',r"$\xi$")
    text = text.replace(u'\u03bf',r"o")
    text = text.replace(u'\u03c0',r"$\pi$")
    text = text.replace(u'\u03c1',r"$\rho$")
    text = text.replace(u'\u03c2',r"$\varsigma$")
    text = text.replace(u'\u03c3',r"$\sigma$")
    text = text.replace(u'\u03c4',r"$\tau$")
    text = text.replace(u'\u03c5',r"$\upsilon$")
    text = text.replace(u'\u03c6',r"$\varphi$")
    text = text.replace(u'\u03c7',r"$\chi$")
    text = text.replace(u'\u03c8',r"$\psi$")
    text = text.replace(u'\u03c9',r"$\omega$")

    # MISC SYMBOLS
    text = text.replace(u'\u2030',r"$\permil$")
    text = text.replace(u'\u2044',r"$/$")
    text = text.replace(u'\u203e',r"$\bar{}$")
    text = text.replace(u'\u25ca',r"$\diamondsuit$")
    text = text.replace(u'\u2665',r"$\varheart$")
    text = text.replace(u'\u2666',r"$\vardiamond$")
    text = text.replace(u'\u263a',r"$\smiley$")
    text = text.replace(u'\u00AE',r"\text{\textregistered}")
    text = text.replace(u'\u2122',r"\text{\tiny TM}")

    # Strip of un-supported unicode characters
    text = text.replace(u'\u2018', '\'')
    text = text.replace(u'\u2019', '\'')
    #text = text.replace(u'\u2794', '')

    #text = text.encode('ascii', 'ignore')
    #text = text.decode('utf-8')

    return text


def clip_page(pdf_file):
    # clip_page will remove the last page of the pdf_file
    # pdfinfo- used to get the overall page count (N)
    # pdftk- used to trim pdf to new size (N-1)
    if (pdf_file==None):
        print "No file specified!"
        return

    # Get the page count
    input1 = PdfFileReader(file(pdf_file, "rb"))
    NP = input1.getNumPages()

    # Save the page count to a file
    d = os.path.dirname(pdf_file)
    cmd = r'echo ' + str(NP-1) + r' > ' + d + r'/pagecount.txt; '

    # Use pdftk to strip the last page off
    tmpF = d + r'/tmp.pdf'
    cmd += r'pdftk A=' + pdf_file + r" cat A1-" + str(NP-1) + r" output " + tmpF + "; "
    cmd += r'mv ' + tmpF + '  ' + pdf_file
    proc = ProcessWithTimeout(cmd=cmd)
    returnCode = proc.start(timeout=2*60)
    if returnCode != 0:
        return None, None

def check_for_element_in_html(html, array):
    '''
    Given an HTML string, check if any html elements in the given
    array exist in the html string.
    '''
    soup = BeautifulSoup(html)
    result = []
    for i in array:
        result += soup.findAll(i)
    if result == []: 
        return False
    else:
        return True


def cut_word(word, lineMax = 43):
    # The following block parses and splits a word or name to an array
    # array elements are parsed and seperated by a newline if too long
    n = word.count(';')
    if n == 0:
        buff1 = [word]
    else:
        buff1 = word.split(';')
    for i in range(len(buff1)):
        if len(buff1[i]) > lineMax:
            buff1[i] = buff1[i][:lineMax] + '- ' + buff1[i][lineMax:]
    wordbuff = buff1[0]
    for i in range(len(buff1)-1):
        wordbuff = wordbuff + '; ' +  buff1[i+1]
    return wordbuff

def children_allowed(Cnode,allowed):

    import collections
    # Add comment to all allowed lists
    if isinstance(Cnode.tag, collections.Callable) and Cnode.tag().__class__.__name__ == '_Comment':
        return True

    # Recursive function to test if all ancestors are in list
    if Cnode.tag not in allowed:
        return False

    children = Cnode.getchildren()
    for child in children:
        if children_allowed(child,allowed) == False:
            return False

    return True

def resolve_url_redirect (url):
    _url = None
    try:
        headOpener = urllib2.build_opener(HeadRedirectHandler())
        response = headOpener.open(HeadRequest(url))
        _url = response.geturl()
    except Exception, error:
        print "ERROR RESOLVING URL REDIRECT FOR URL: %s" % (url)
        print "%s" % (error)
    return _url

try:
    LOG_FILENAME = "process.log"
    log = logging.getLogger(__name__)
    log.setLevel(logging.DEBUG)
    handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=10*1024*1024, backupCount=5)
    log.addHandler(handler)
except:
    pass

class ProcessWithTimeout(object):
    """
        A wrapper around the subprocess module to allow killing the process after a timeout.
    """

    def __init__(self, cmd, cwd=None):
        self.cmd = cmd
        self.cwd = cwd
        self.proc = None
        self.output = None
        self.error = None

    def start(self, timeout=300):
        outputFile = None
        errorFile = None
        try:
            outputFile = NamedTemporaryFile(suffix=".out", delete=False)
            errorFile = NamedTemporaryFile(suffix=".err", delete=False)

            log.info("output: %s" % outputFile.name)
            log.info("error: %s" % errorFile.name)

            timeSpent = 0
            self.proc = subprocess.Popen(self.cmd, stdin=None,
                                         stdout=outputFile, stderr=errorFile,
                                         cwd=self.cwd, shell=True)
            if timeout:
                while True:
                    time.sleep(1)
                    self.proc.poll()
                    if self.proc.returncode is not None:
                        break
                    timeSpent += 1
                    if timeSpent > timeout:
                        log.warning('Killing process because the timeout of %d seconds was exceeded.' % timeout)
                        self.proc.terminate()
                        self.proc.kill()
                        break
            else:
                self.proc.wait()

            outputFile.close()
            errorFile.close()

            if os.path.exists(outputFile.name):
                self.output = open(outputFile.name, "r").read()
                log.info("Output: %s" % self.output)

            if self.proc.returncode != 0:
                self.error = open(errorFile.name, "r").read()
                log.error("Process failed with code: %s" %(self.proc.returncode if self.proc.returncode else "process was terminated"))
                log.error("ERROR: %s" % self.error)
                return self.proc.returncode
            else:
                log.info("Process succeeded with returncode: %d" % self.proc.returncode)
                return 0
        finally:
            try:
                if outputFile:
                    outputFile.close()
                if errorFile:
                    errorFile.close()
            finally:
                if os.path.exists(errorFile.name):
                    os.remove(errorFile.name)
                if os.path.exists(outputFile.name):
                    os.remove(outputFile.name)
