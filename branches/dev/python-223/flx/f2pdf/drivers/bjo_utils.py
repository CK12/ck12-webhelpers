import re
from subprocess import PIPE, Popen, STDOUT
import time

def replaceM(test,front,back,newmiddle):
    pat = front + "(.*)" + back   
    repl = ""

    import re
    m = re.search(pat,test)

    if m and m.groups() > 0:
        kill = m.group(0)
        cnt = kill.count('$')/2
        for i in range(1,cnt+1):
            repl = repl + newmiddle
        test1 = test.replace(kill,repl)
        return test1
    else:
        return test


def countwidth(linestring,cols,workdir):

    lst = linestring.replace('&','-BJO-')
    linestring = lst
    lst = linestring.replace('\\\\','-BJO-')
    
    # You can even make a list with it!
    strngs = lst.split('-BJO-')

    #cols = 3  Now an argument
    c = 0
    row = []
    sumR = 0
    
    for i in strngs:
        j = replaceM(i,"\$","\$","--LATEX--")
        #print j
        

        c = c + 1
        #sumR = sumR + len(j.strip())
        sumR = sumR + countwidthH2( i.strip() , workdir )
        if c == cols:
            c = 0
        #print sumR
            row.append(sumR)
            sumR = 0


    #print max(row)
    if row:
        return max(row)
    else:
        return 0.0

def protect(string):
    string = string.replace("\b","\\b").replace("\n","\\n").replace("\f","\\f").replace("\s","\\s")


# This function used to get the dimensional length of a latex string.
#   equations are assumed 'in-line' format.
def countwidthH2(LatexEQ,workdir):

    #   Minimal header stuff
    head = get_header()
    head = head + "\\begin{document} \n"

    #   Command to print the width in the pdf (not the LatexEQ)
    mid = "\\newdimen\width \n"
    mid = mid + "\\setbox0=\hbox{" + LatexEQ  + "} \n"
    mid = mid + "\width=\wd0 \\advance\width by \dp0 \n"
    mid = mid + "The width is: \\the\width \n"
    mid = mid + LatexEQ

    #   Minimal ending
    tail = "\end{document}"

    dim = render_tex( head+mid+tail , 'read', workdir)
    wide = float( dim[1] )

    return wide
    

## This function will take Latex equation input, count the width of given text and output the text into a pdf
## We then read in the pdf and convert it to a float, which is returned 
def countwidthTX(LatexEQ,workdir):

    tex = "$" + LatexEQ + "$"
    wide = countwidthH2(tex,workdir)
    
    return wide

    

## This function will take Latex equation input, count the width of given text and output the text into a pdf
## We then read in the pdf and convert it to a float, which is returned 
def countwidthTX2(LatexEQ,workdir):

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

    dim = render_tex( head+mid+tail, 'measure', workdir)

    wide = dim[0]


def get_align_text( Latex, max_wide , workdir):
    
    
    normalfont = 10.95     # 11pt document font size
    #max_wide = 3.0         # Maximum equation width in inches
    pt_width = front = 0.0

    text = ''
    # Get the align string and fix the align spacing
    astr = Latex
    astr = astr.replace("&","-BJO-",1)    # Protect the first align marker
    astr = astr.replace("&","\\\ & ")     # Make the rest have spaces
    astr = astr.replace("-BJO-","&")      # Fix the first one
    
    # Check to see is "small" font reduction fixes problems
    if ( re.search('frac',astr) or "\\\ " in astr):
        pt_width = countwidthTX2(astr,workdir)  # Slow but accurate
    else:
        pt_width = countwidthTX(astr,workdir)   # Fast but wrong for frac and \\
    in_width = (pt_width + front) / 72.0   # Convert pts to inches                    
    
    if (in_width <= max_wide):
        # If the equation wont exceed the column width, do as before
        text = "\\begin{align*}\n"+  astr + "\n\\end{align*}\n"
        return text
    elif (in_width > max_wide and in_width < max_wide * 1.25):
        newfont = (max_wide/in_width) * normalfont
        text = "\\begin{align*}\n"+  astr + "\n\\end{align*}\n"
        text = "\\fontsize{"+str(newfont)+"}{"+str(1.2*newfont)+"}\\selectfont\n"+text
        text = text + "\\normalsize\n"
        return text
    else:
                    

        # Break-up if there are more than 2 equals signs to see if this makes it fit
        eqs = astr.split("=")
        if ( len(eqs) > 3 ):
            text = astr.replace("=","-BJO-",1)       # Single out the first equals sign
            text = text.replace("=","\\\ & = ")      # Space all others
            text = text.replace("-BJO-","& =")       # Fix the first one
            astr = text

            # Check to see if that did it...  if not, reduce font
            pt_width = countwidthTX2(astr,workdir)                    
            in_width = (pt_width + front) / 72.0   # Convert pts to inches                    
            if (in_width <= max_wide):
                # If the equation wont exceed the column width, do as before
                text = "\\begin{align*}\n"+  astr + "\n\\end{align*}\n"
                return text
            else: 
                newfont = (max_wide/in_width) * normalfont
                text = "\\begin{align*}\n"+  astr + "\n\\end{align*}\n"
                text = "\\fontsize{"+str(newfont)+"}{"+str(1.2*newfont)+"}\\selectfont\n"+text
                text = text + "\\normalsize\n"
                return text
                    
                        
                    # Loop over each line and determine max. width
                    #lines = astr.split("&")
                    #if ( len(lines) > 100 ):
                    #    front = countwidthTX2(lines[0].split("=")[0])    # For an aligned eq with mult. lines, get the length of the first piece
                    #    for line in lines:
                    #        tmp_width = countwidthTX2(line)
                    #        if (tmp_width > pt_width):
                    #            pt_width = tmp_width
                    #        else:
                    
                                            
                
                # If the equations is going to exceed the width, make the column width
                #if (in_width > max_wide):
                #    newfont = (max_wide/in_width) * normalfont
                #    text = "\\fontsize{"+str(newfont)+"}{"+str(1.2*newfont)+"}\\selectfont\n"+text
                #    text = text + "\n\\normalsize"
                                                               
                #text = text.replace("=","-BJO-",1)    # Single out the first equals sign
                #text = text.replace("=","\\\ = ")     # Space all others
                #text = text.replace("-BJO-","=")      # FIx the first one
  


## Input is anything that will render after \begin{document}
def tex_width(tex):
    wide = 0.0
    head = get_header()  # Some standard packages and stuff
    
    latex = head + '\n \begin{document} \n'
    latex += tex + '\n'
    latex = latex + '\end{document}'
    
    dim = render_tex(latex,'measure')
    wide = float( dim[1] )

    return wide

## Keep from repeating the same lines of code
def get_header():
    head = ''
    head = "\documentclass[11pt,twoside,openany]{book} \n"
    head = head + "\usepackage{amsmath} \n \usepackage{amssymb} \n"
    head = head + "\usepackage{txfonts} \n \usepackage{graphicx} \n"
    head = head + "\usepackage{lscape} \n "

    return head

## Render entire texfile and feed pdf path to (read-measure) to return dimensions 
##   of the rendered tex.
def render_tex(fulltex,method,workdir):
    
    #   Stage 1- Write to a tmp.tex file
    fname = workdir + "TMPwidthINFOfile_deleteME.tex"
    F = open(fname,'w')
    F.write( fulltex  )
    F.close()

    ### Stage 2- Compile the temp tex file and convert pdf to .txt (ascii text file)
    cmd = "cd "+workdir + "; " +  "pdflatex -interaction=batchmode " + fname 
    p = Popen(cmd, stdin=PIPE, shell=True)
    p.communicate()

    
    ### Stage 3- Get the width of the rendered pdf content
    ## Either parse the pdf for width or crop and measure
    if method == 'read':
        dim = read_width(fname.replace('.tex','.pdf'))
    else:
        dim = measure_width(fname.replace('.tex','.pdf'))

    ### Stage 4- Clean up the tmp files
    cmd = "rm -f " + fname.replace(".tex","*")
    p = Popen(cmd, stdin=PIPE, shell=True)
    p.communicate()

    return list(map(float, dim))

    #return dim


## Parse pdf for width info
## The PDF itself is assumed to contain the string dimensions alone.  We convert the pdf to a text file
## and then read in the text, and parse the string for the dimensions.  Faster than measuring.
def read_width(pdfname):
    
    ### Stage 2- Compile the temp tex file and convert pdf to .txt (ascii text file)
    cmd = "pdftotext " + pdfname + " " + pdfname.replace(".pdf",".txt")
    p = Popen(cmd, stdin=PIPE, shell=True)
    p.communicate()
        
    ### Stage 3- Read in the txt file and return the width of the latex equation
    F = open(pdfname.replace(".pdf",".txt"),'r')
    count = F.read()
    dim = re.findall(r"[+-]? *(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?", count)
    
    return dim


## Will take the pdf and crop all the surrounding white space.  Then remainder is then
## measured and the dimensions are returned.
def measure_width(pdfname):
    cmd = "pdfcrop " + pdfname + " " + pdfname.replace(".pdf","2.pdf") + "; "
    cmd = cmd + "pdfinfo " + pdfname.replace(".pdf","2.pdf") + ' | grep "Page size" -> ' + pdfname.replace(".pdf",".txt")
    p = Popen(cmd, stdin=PIPE, shell=True)
    p.communicate()
        
    ### Stage 3- Read in the txt file and return the width of the latex equation
    F = open(pdfname.replace(".pdf",".txt"),'r')
    count = F.read()
    dim = re.findall(r"[+-]? *(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?", count)

    return dim


## Assums a table to HUGE and measure the natural width
def tab_width(tabtex,workdir):
    head = get_header()
    head = head + "\n \include{ck12_common} \n"
    head = head + "\\begin{document} \n \\thispagestyle{empty} \n"
    tex = head + tabtex + "\n" + r"\end{document}"

    dim = render_tex(tex,'measure',workdir)
    wide = dim[1]  # 2nd index... landscape mode

    return wide




