### CK12.ORG - F2PDF.PY support file 
### FILE: onecolumn.py
## DESC: One column specific functions for f2pdf translator
### AUTH: Britton J. Olson
### DATE: Aug. 2011
from base_driver import BaseDriver
from concept_parser import ConceptParser
from utils import countwidthH2, fix_altText, printConsole, insert_string, children_allowed
from utils import ProcessWithTimeout, fix_frac_exponent, fix_frac_subscript
try:
    from PIL import Image
except:
    import Image
import codecs
import math
import string
import re

class Onecolumn (BaseDriver):
    def __init__(self):
        self.template_dir = "./templates/onecolumn/"
        self.common_dir = "./templates/common/"
        self.logger = None
        self.work_dir = ""
        self.art_type = ""
        self.latex = ''
        self.api_server = ''

    def set_work_dir(self, work_dir):
        self.work_dir = work_dir

    def substitute(self):
        pass

    def cleantex(self):
        # If these havent been explicitly handled, remove them
        self.latex = self.latex.replace('&\#160;',' ')
        self.latex = self.latex.replace(r'&#38;', r'\&')  
        self.latex = self.latex.replace(r'&\#60;', "\\textless ")  #<
        self.latex = self.latex.replace(r'&\#62;', "\\textgreater ")  #>
        self.latex = self.latex.replace("\\lt", "\\textless ")  #<
        self.latex = self.latex.replace("\\gt", "\\textgreater ")  #>
        self.latex = self.latex.replace('&\#8217;',r"'")  # '
        self.latex = self.latex.replace('&\#8212;',r'---') # long dash
        self.latex = self.latex.replace('&#8211;', r'--') # short dash

    def translate(self):
        parser = OnecolumnParser()
        parser.work_dir = self.work_dir
        parser.art_type = self.art_type
        parser.api_server = self.api_server
        fd = codecs.open(self.work_dir + "/" + self.htmlfile, "r", encoding="utf-8")
        xhtml_content = fd.read()
        # replace &#60; and &#62; with < and > respectively (but using the latex notation)
        #
        xhtml_content = xhtml_content.replace('&#60;','\\textless ')
        xhtml_content = xhtml_content.replace('&#62;','\\textgreater ') 
        xhtml_content = xhtml_content.replace('&#9679;','\\CIRCLE ')# Balck circle 
        xhtml_content = xhtml_content.replace('&#9675;','\\Circle ')# Open circle
        xhtml_content = xhtml_content.replace('&#9702;','\\circ ') # white bullet to circle
        xhtml_content = xhtml_content.replace('&#8206;', r'') # invisible LRM (left-to-right-mark)
        xhtml_content = xhtml_content.replace(u'\u201C', r'``') # left smart quote
        xhtml_content = xhtml_content.replace(u'\u201D', r"''") # right smart quote
        xhtml_content = xhtml_content.replace(u"\x9f","") # Bug 40535 remove this character
	

        fd.close()
        parser.init_payload(xhtml_content)

        self.latex = parser.translate()

        self.cleantex()

        fd = codecs.open(self.work_dir + "/"+self.htmlfile.replace('.xhtml','.tex'), "w", encoding="utf-8")
        #fd = open(self.work_dir + "/"+self.htmlfile.replace('.xhtml','.tex'), "w")
        fd.write(self.latex)
        fd.close()

    def do_work(self):
        self.substitute()
        self.translate()


## Over-write definitions here from ConceptParse class  
class OnecolumnParser (ConceptParser):

    def translate_img(self, node, ancestor=[]):
        print "Translating img: "+ str(node)
        print "Attributes: "+ str(node.attrib)
        iclass = text = tail = width = ''
        tail = node.tail

        if tail == None:
            tail = ''
        if node.attrib.has_key('width'):
            width = node.attrib['width'].replace('px','pt')
        if node.attrib.has_key('src'):
            node.attrib['src'] = node.attrib['src'].replace(r'\_',r'_')
        if width == '':
            width = '100pt'
        # check if img is > 6 inches wide
        if re.search('pt', width) is None: 
            num_width = int(width)
            if num_width > 432:
                width = '432pt'
            else:
                width += 'pt' 

        if node.attrib.has_key('class'):
            #Math images 
            # The characters in the alt attribute are escaped, so we need to fix_altText()
            # fix any instance of ^\frac to ^{\frac...} same for _\frac
            if node.attrib['alt']:
                node.attrib['alt'] = fix_altText(node.attrib['alt'])
                node.attrib['alt'] = fix_frac_exponent(node.attrib['alt'])
                node.attrib['alt'] = fix_frac_subscript(node.attrib['alt'])


            iclass = node.attrib['class']
            headers = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']
            for each_header in headers:
                if each_header in ancestor and iclass != 'x-ck12-math':
                    return ''
            # Blocked equations
            if iclass == 'x-ck12-block-math':
                # Inline/text equations and math
                if node.attrib['alt']:
                    text = "\\begin{align*}\n" + node.attrib['alt'] + "\n\\end{align*}"
                    if self.art_type == 'workbook':
                        text = self.translate_hwpmath(node,ancestor)
                    if 'table' in ancestor:
                        text = r'\parbox{1cm}{' + text + r'}'

            elif iclass == 'x-ck12-math':
                # If the inline math content is TOO long, just use image
                #if len(node.attrib['alt']) < -10 :
                #    ## Determine if the figure is wide or single
                #    prefix = self.work_dir
                #    fullpath = prefix +"/"+ node.attrib['src']
                #    im = Image.open( fullpath )
                #    Pxy = im.size  ## returns (width,height)
                #    AR = float(Pxy[0]) / float(Pxy[1])

                #    if (AR >= 2.0 and Pxy[0] > 400):
                #        text = "\ckimw{" + fullpath + "}{}{}\n"
                #    else:
                #        text = "\ckim{" + fullpath + "}{}{}\n"

                #    # If ancestor is a list
                #    if ( ancestor[-1] == 'li'):
                #        text = "\ckimC{"+ fullpath +"}{3in}{}"

                #else:
                if node.attrib['alt']:
                    text = "$ "+ node.attrib['alt'] +" $"
            # HW-pedia Math images
            elif iclass == 'x-ck12-hwpmath':
                # some images have the inline or alignat api call but are still rendered as block.
                if self.art_type == 'workbook' and node.attrib.has_key('src'):
                    if 'alignat' in node.attrib['src'] or 'inline' in node.attrib['src']:
                        if node.attrib['alt']:
                            text = "$ "+ node.attrib['alt'] +" $"
                        else: # default to translate_hwpmath
                            text = self.translate_hwpmath(node,ancestor)
                else:
                    text = self.translate_hwpmath(node,ancestor, includeTail=False)
            else:
                #block images
                text = "\\raisebox{1ex-\\height}{\\includegraphics[width="+ width +"]{"+ node.attrib['src'] +"}}\\vspace{6}\n"
        else:
            ## Determine if the figure is wide or single
            prefix = self.work_dir
            fullpath = prefix +"/"+ node.attrib['src']
            # Exception handling for image file that cant be found
            try:
                im = Image.open( fullpath )
            except IOError:
                printConsole( "Error in opening file " + fullpath + " ... skipping")
                return text

            # If image is gif, convert it here
            if (fullpath.split('.')[-1] == 'gif'):
                cmd = r'convert #1[0] #2'
                cmd = cmd.replace('#1',fullpath)
                fullpath = fullpath.replace('.gif','.jpg')
                cmd = cmd.replace('#2',fullpath)
                proc = ProcessWithTimeout(cmd=cmd)
                returnCode = proc.start(timeout=2*60)
                if returnCode != 0:
                    return None,None

            if (self.art_type == 'workbook'):
                dpi = 125.0;
            else: 
                dpi = 250.0;

            Pxy = im.size  ## returns (width,height)
            if node.attrib.has_key('width'):
                swide = width
                maxW = float(swide.replace('pt',''))
                maxW = min(5.0,maxW/72)            # Use the wiki size attrib
                swide = str(maxW) + 'in'
            else: 
                maxW = min( 5.0 , Pxy[0]/dpi )  # Count the pixels
                swide = str(maxW)+"in"

            if ( 'table' in ancestor ):
                swide = str( min(1.0,maxW) ) + '1in'

            # Special case for image in href
            if 'a' in ancestor:
                text = r'\mbox{\includegraphics[width=#WIDE]{#SRC}}'
                text = text.replace(r'#WIDE',swide)
                text = text.replace(r'#SRC',fullpath)
                return text + tail


            # If ancestor is a table, just include graphics
            if ( 'table' in ancestor ):
                swide = str( min(1.0,maxW) ) + '1in'
                text = "\ckigC{" + fullpath + "}{"+ swide +"}\n"
            else:
                text = "\ckigC{" + fullpath + "}{"+ swide +"}\n"

        return  text + tail


    def translate_theadO(self, node, shortcap = '', longcap = '', id="", ancestor=[]):
        printConsole( "translate a thead.")
        localbuff = ''
        children = node.getchildren()
        ancestor.append(node.tag.lower())
        for child in children:
            localbuff += self.translate_node(child, ancestor=ancestor[:])
        text  = localbuff
        return text

    def translate_tableO(self, node, ancestor=[]):
        printConsole( "Translate a table.")
        short_cap = long_cap = localbuff = ref = headtext = sizetext = id =''
        fname = self.get_fname()
        children = node.getchildren()
        if node.attrib.has_key('summary'):
            short_cap = node.attrib['summary']
        if node.attrib.has_key('id'):
            id = node.attrib['id'].replace("_","").replace("\\#",'')
        if node.attrib.has_key('border'):
            border = node.attrib['border']
        else:
            border = '0'
        self.border = border
        size = 0
        ancestor.append(node.tag.lower())
        for child in children:
            if child.tag == 'caption':
                printConsole( "Got long caption!")
                long_cap = child.text
            elif child.tag == 'thead':
                printConsole( "Got a thead")
                headtext = self.translate_thead(child, shortcap = short_cap, longcap = long_cap, id=id, ancestor=ancestor[:])
                size = self.count_column(child)

            else:
                localbuff += self.translate_node(child, ancestor=ancestor[:])
                if size == 0:   # Just in case a thead doesn't exist, get column width this way
                    size = self.count_column(child)

        ref = id
        # Get some spacing variables for the various tables
        printConsole( "Table size is: "+ str(size))
        for i in range(0, size):
            sizetext  += "X "
            if border=='1':
                sizetext  += "|"

        if border == '1':
            sizetext = '|' + sizetext

        # Make the head text have \bftab        
        headtext = ' \\bftab{ ' + headtext.replace('&','} &  \\bftab{ ')
        headtext = headtext.replace("\\\\", "} \\\\ "  )

        # 1-fname. 2-spacing string, 3,4-caption, 5-head, 6-body, 7-label, 8-width
        fname = self.get_fname()
        text = '\cktabular{'+fname+'}{'+sizetext+'}{'+short_cap+'}{'+long_cap+'}{'+headtext+'}{'+localbuff+'}{'+ref+'}{\\textwidth}'

        return text


    def translate_h1(self, node, ancestor=[]):
        printConsole( "Translating a h1.")
        printConsole( "node literal: "+ str(node))
        cp = '\clearpage \n'

        ## Count length of the section string to see if size reduction is needed
        if node.text == None:
            node.text = ''
        if node.tail == None:
            node.tail = ''
        if node.attrib.has_key('id'):
            id = node.attrib['id'].replace(r"\#",'').replace(r'\_','_')
        text = node.text + node.tail
        text = text.strip()
        #text = text.replace('_','$\_$')
        text = text.replace('&', r"\&")
        nfont = 24.0    # Huge
        pwide = 6.0

        font = nfont
        font_arg = "\\fontsize{"+str(font)+"}{"+str(font*1.2)+"}\selectfont"
        text = cp + "\CSection{"+text+"}{"+font_arg+"}\n"
        text += r'\\~' + '\n'    # Need some filler incase no content is present...
        #if node.attrib.has_key('id'):
        #    text = text + r'\label{' + id + r'}'
        return  text

    def translate_a(self, node, ancestor=[]):
        printConsole( "Translating a: "+ str(node))
        printConsole( "Attributes: "+ str(node.attrib))
        url = text = ''
        text = node.text
        if text == None:
            text = ''
        tail = node.tail
        if tail == None:
            tail = ''
        # Get the children
        allowed = ['strong','em','span','img']
        allow_buff = ''
        localbuff = ''
        localbuff1 = ''
        stringbuff = ''
        
        children = node.getchildren()
        ancestor.append(node.tag.lower())


        for child in children:
            buff = self.translate_node(child, ancestor=ancestor[:])
            localbuff1 += buff
            if children_allowed(child,allowed):
                allow_buff += buff
            else:
                localbuff += buff

        text = text.replace(r'{\textasciitilde}', '~')

        if node.attrib.has_key('href'):
            #a link 
            url = node.attrib['href']
            ## Note.  Dont include text on url...
            url = url.replace(r'{\textasciitilde}', '~')
            if url.startswith(r'\#'):
                #local url, doesn't work with '_'
                url = url.replace(r"\#","").replace(r'\_','_')
                text = text.replace(r'\#','')
                if ('below' in text or 'above' in text):
                    text = ''
                    aboveBelowTextFound = True
                else:
                    aboveBelowTextFound = False;
                # Prevent merging of something like 'Figure 1.3ice'            
                if not(aboveBelowTextFound):
                    text = " " + text;
                return "\\ref{"+ url +"}" +  text + localbuff1 + tail
            else:
                tex = ''
                width = 4
                url = url.replace(r'{\textasciitilde}', '~')
                url = url.replace('\_','_').replace('\#','#').replace('\%','%').replace('\&','&')
                url = url.replace('&\#160;', ' ').replace('&\#38;', r'\&').replace('\&','&')
                url = url.replace(r'%20;', ' ')
                murl = text.replace('&\#160;', ' ').replace('&\#38;', r'\&').replace('\&','&')
                murl = murl.replace('\_','_').replace('\#','#').replace('\%','%')
                href = r'{\href{' + url + '}'
                # we break the tex into chunks for 4 characters
                # and attach the href to each 4-block chunk...  why???
                for i in xrange(0,1+int(math.ceil(len(murl)/width))):
                    if (i+1)*width < len(murl):
                        # if the 1st char is a whitespace, then it would get 
                        # ignored and words get merged
                        if (murl[ i*width : (i+1)*width])[0] == ' ':
                            stringbuff = (murl[ i*(width) : (i+1)*width])[1:]
                            stringbuff = stringbuff.replace('~', r'{\textasciitilde}')
                            tex += href + '{{ }' + stringbuff + '}}'
                        else:
                            stringbuff = murl[ i*width : (i+1)*width]
                            stringbuff = stringbuff.replace('~', r'{\textasciitilde}')
                            tex += href + '{' + stringbuff + '}}'
                        tex += r'{\allowbreak{}}'
                    else:
                        stringbuff = murl[ i*width : len(murl) ]
                        stringbuff = stringbuff.replace('~', r'{\textasciitilde}')
                        tex += href + '{' + stringbuff + '}}'
                        tex += r'{\allowbreak{}}'
                        break
                tex = tex.replace('_', '\_').replace('#', '\#').replace('%', '\%').replace('&','\&')
                url = url.replace('_', '\_').replace('#', '\#').replace('%', '\%').replace('&','\&')
                allow_buff = r'{\href{' + url + r'}{' + allow_buff + r'}}'
                
                # next two if statements handle spacing issues 
                if tex != '' and tex[len(tex)-1] != ' ':
                    allow_buff = ' ' + allow_buff

                try:
                    if (localbuff != '' and re.search(localbuff[0], '[a-z|A-Z|0-9]') != None) or (tail != '' and re.search(tail[0], '[a-z|A-Z|0-9]')  != None):
			            localbuff = ' ' + localbuff
                except Exception as e:
                    pass

                return tex + allow_buff + localbuff + tail
        else:
            if node.attrib.has_key('id'):
                anchor = node.attrib['id'].replace("_", "")
                if anchor == None:
                    anchor = ''
                return r"\ref{"+ anchor +"}" + localbuff1 + tail
            else:
                return text + localbuff1 + tail
