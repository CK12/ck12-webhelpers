### CK12.ORG - F2PDF.PY support file 
### FILE: twocolumn.py
### DESC: Two column specific functions for f2pdf translator
### AUTH: Britton J. Olson
### DATE: Aug. 2011
from base_driver import BaseDriver
from concept_parser import ConceptParser
import codecs
from utils import countwidthH2, tab_width, get_IMname,align_width,printConsole,fix_altText,insert_string
try:
    from PIL import Image
except:
    import Image

class Twocolumn (BaseDriver):
    def __init__(self):
        self.template_dir = "./templates/twocolumn/"
        self.common_dir = "./templates/common/"
        self.logger = None
        self.work_dir = ""
        self.art_type = ""
        self.latex = ''

    def set_work_dir(self, work_dir):
        self.work_dir = work_dir

    def substitute(self):
        pass

    def translate(self):
        parser = TwocolumnParser()
        parser.work_dir = self.work_dir
        parser.art_type = self.art_type
        fd = codecs.open(self.work_dir + "/" + self.htmlfile, "r", encoding='utf-8')
        xhtmlContent = fd.read()
        parser.init_payload(xhtmlContent)

        self.latex = parser.translate()
        fd = codecs.open(self.work_dir + "/"+self.htmlfile.replace('.xhtml','.tex'), "w",
                         encoding='utf-8')
        fd.write(self.latex)
        fd.close()

    def do_work(self):
        printConsole( 'Picked up chapter: %s' %(self.htmlfile))
        self.substitute()
        self.translate()


## Over-write definitions here from ConceptParse class  
class TwocolumnParser (ConceptParser):
    # iframe- Media file, youtube link or thumbnail


    def translate_img(self, node, ancestor=[]):
        printConsole( "Translating img: "+ str(node))
        printConsole( "Attributes: "+ str(node.attrib))
        iclass = text = tail = width = ''
        tail = node.tail

        if tail == None:
            tail = ''
        if node.attrib.has_key('width'):
            width = node.attrib['width'].replace('px','pt')
        if width == '':
            width = '100pt'
        maxwidth = 3.2 # inches Max width for the twocolumn layout
        fullpage = 2.0 * maxwidth
        ec = "\end{multicols} \n"
        bc = "\\begin{multicols}{2} \n"

        if node.attrib.has_key('class'):
            #Math images 
            iclass = node.attrib['class']
            # Blocked equations or ones that use "\begin", as this break in-line mode
            if iclass == 'x-ck12-block-math' or node.attrib['alt'].__contains__(r'\begin{') :

                # Inline/text equations and math
                if node.attrib['alt'] and 1==1:
                    text = "\\begin{align*}\n"+  fix_altText(node.attrib['alt']) + "\n\\end{align*}"
                    fname = get_IMname(self.work_dir)
                    width = align_width(text,fname+'.tex')
                    width = width/ 72.0

                    if width > maxwidth:
                        text = r'\ckigC{'+fname+'.pdf}{'+str(width)+'in}{}'
                        text = ec + text + bc
                    elif width > fullpage:
                        text = r'\ckigC{'+fname+'.pdf}{'+str(min(fullpage,width))+'in}{}'
                        text = ec + text + bc
                        
                    # If ancestor is a table, just include graphics
                    if ( 'td' in ancestor ):
                        text = "\ckigC{" + fname + ".pdf}{"+str(min(maxwidth,width))+"in}\n"

                    # If ancestor is a list, just include graphics
                    if ( 'li' in ancestor or 'dd' in ancestor ):
                        #text = "\ckigC{" + fname + "}{"+str(maxwidth)+"in}\n"
                        #text = "\n \\\\  \\includegraphics[width="+str(maxwidth)+"in]{"+fname+"} \n"
                        text = r"\\" + "\n \\raisebox{1ex-\\height}{\\includegraphics[width="+ str(min(maxwidth,width)) +"in]{"+ fname +"}}\\vspace{6}\n"
                    # If in dl, protect width
                    if ('dl' in ancestor or 'dd' in ancestor):
                        text = self.protect_dl(text,ancestor[:])
                                
                    # If in ol and/or ul, protect width
                    if ('ol' in ancestor or 'ul' in ancestor):
                        text = self.protect_ol(text,ancestor[:])



                # Use the breq class instead here:  Stable in tables and descriptions
                if node.attrib['alt'] and 1==2 :
                    text = "\\begin{dmath*}\n"+  fix_altText(node.attrib['alt']) + "\n\\end{dmath*}"




            elif iclass == 'x-ck12-math':

                if node.attrib['alt']:
                    # Test width of the inline equation
                    text = "$ "+ fix_altText(node.attrib['alt']) +" $"
                    # Allow the equations to wrap... not automatic in multicols for some reason
                    space = r'{\allowbreak{}}' 
                    text = text.replace(" ",space + " ")

                    # > 20 characters... coarse filter for speed
                    if len(node.attrib['alt'].replace(' ','')) > 500:
                        fname = get_IMname(self.work_dir)
                        width = align_width(text,fname+'.tex')
                        width = width/ 72.0

                        if width > maxwidth:
                            text = r'\ckigC{'+fname+'.pdf}{'+str(width)+'in}{}'
                            text = ec + text + bc
                            if width > fullpage:
                                text = r'\ckigC{'+fname+'.pdf}{'+str(min(fullpage,width))+'in}{}'
                                text = ec + text + bc

                            #text = r'\ckigC{'+fname+'.pdf}{'+str(maxwidth)+'in}{}'
                            #text = ec + text + bc

                            # If ancestor is a table, just include graphics
                            if ( 'td' in ancestor ):
                                text = "\ckigC{" + fname + "}{"+str(maxwidth)+"in}\n"

                            # If ancestor is a list, just include graphics
                            #if ( 'ol' or 'dl' or 'ul' in ancestor ):
                            #    text = "\n \\raisebox{1ex-\\height}{\\includegraphics[width="+ str(maxwidth) +"in]{"+ fname +"}}\\vspace{6}\n"
                            # If in dl, protect width
                            if ('dl' in ancestor or 'dd' in ancestor):
                                text = self.protect_dl(text,ancestor[:])
                                
                            # If in ol and/or ul, protect width
                            if ('ol' in ancestor or 'ul' in ancestor):
                                text = self.protect_ol(text,ancestor[:])

                                
                                
                        

            # HW-pedia Math images
            elif iclass == 'x-ck12-hwpmath':
                text = self.translate_hwpmath(node,ancestor[:])


            else:
                #block image
                text = "\\raisebox{1ex-\\height}{\\includegraphics[width="+ width +"]{"+ node.attrib['src'] +"}}\\vspace{6}\n"
        else:

            ## Determine if the figure is wide or single
            prefix = self.work_dir
            fullpath = prefix + node.attrib['src']
            # Exception handling for image file that cant be found
            try:
                im = Image.open( fullpath )
            except IOError:
                printConsole( "Error in opening file " + fullpath + " ... skipping")
                return text

            Pxy = im.size
            AR = float(Pxy[0]) / float(Pxy[1])

            if node.attrib.has_key('width'):
                swide = width
                maxW = float(swide.replace('pt',''))
                maxW = min(6.5,maxW/72)
                swide = str(maxW) + 'in'
            else: 
                width = min( 6.0 , Pxy[0]/250.0 )
                swide = str(width)+"in"
                
            if swide:
                fwidth = float(swide.replace('in',''))

            if (AR >= 1.0 and fwidth >= 4.0 ):
                #text = "\ckimw{" + fullpath + "}{"+ str(fwidth) +"in}{}\n"
                text = "\ckim{" + fullpath + "}{"+ str(fwidth) +"in}{}\n"
                text = ec + text + bc
            else:
                text = "\ckim{" + fullpath + "}{"+ str(max(fwidth,3.2)) +"in}{}\n"

            # If ancestor is a table, just include graphics
            if ( 'table' in ancestor ):
                text = "\ckigC{" + fullpath + "}{1in}\n"


            # Protect the environment against breaks in multicols
            #if ('ul' in ancestor):
            #    print ancestor
            #    import pdb; pdb.set_trace()
            #    text = self.protect_ul(text,ancestor[:])
            if ('ol' in ancestor or 'ul' in ancestor):
                #print ancestor
                text = self.protect_ol(text,ancestor[:])
                #print text

            # If in dl, protect width
            if ('dl' in ancestor or 'dd' in ancestor):
                text = self.protect_dl(text,ancestor[:])



        return  text + tail




    def translate_thead_two(self, node, shortcap = '', longcap = '', id="", ancestor=[]):
        printConsole( "translate a thead.")
        localbuff = ''
        children = node.getchildren()
        ancestor.append(node.tag.lower())
        for child in children:
            localbuff += self.translate_node(child, ancestor=ancestor[:])
        #text  = "\\hline\n<headtext>\\hline\n\\label{<id>}"
        text  = localbuff #+ "\n" + "\\label{" + id + "}"
        #print text
        #time.sleep(10);
        return text

    def translate_table(self, node, ancestor=[]):
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
            border = '0'   # Default border in "on"
        self.border = border
        size = 0
        ancestor.append(node.tag.lower())
        for child in children:
            if child.tag == 'caption':
                printConsole( "Got long caption!")
                long_cap = child.text
            elif child.tag == 'thead':
                printConsole( "Got a thead")
                headtext = self.translate_thead_two(child, shortcap = short_cap, longcap = long_cap, id=id, ancestor=ancestor[:])
                size = self.count_column(child)

            else:
                localbuff += self.translate_node(child, ancestor=ancestor[:])
                if size == 0:   # Just in case a thead doesn't exist, get column width this way
                    size = self.count_column(child)

        ref = id
        # Get some spacing variables for the various tables
        printConsole( "Table size is: "+ str(size))
        cwide = 6.5/float(size)  # Page width - column size (7-.5)
        ctall = 9.0/float(size)
        sizetextw = sizetext
        sizetextww = sizetext
        #sizetext = ""
        for i in range(0, size):
            sizetext  += "c "
            if border=='1':
                sizetext  += "|"

        #widths
        arg = ''
        if border == '1':
            sizetext = '|' + sizetext
            arg = 'B'

        text = "\cktabww{"+short_cap+"}{"+long_cap+"}{"+sizetext+"}{"+headtext+"}{"+localbuff+"}{"+ref+"}"
        #text = self.translate_table_default(node,ancestor)
        N = tab_width( text , self.work_dir )
        N = N / 72.0          # Convert pt -> inches
        widths = [3.2, 6.0]   # Set transition widths for 3 table sizes
        #import pdb; pdb.set_trace();
        # Make the head text have \bftab        
        #headtext = ' \\bftab{ ' + headtext.replace('&','} &  \\bftab{ ')
        #headtext = headtext.replace("\\\\", "} \\\\ "  )

        ec = '\n ' + "\end{multicols} \n" + r'\\~' + '\n'
        bc = '\n ' + "\\begin{multicols}{2} \n"

        if N < widths[0]:
            text = "\n \\\\ \n \cktab"+arg+"{"+short_cap+"}{"+long_cap+"}{"+sizetext+"}{"+headtext+"}{"+localbuff+"}{"+ref+"}"
        elif N >= widths[0]:
            text = self.translate_table_default(node,ancestor[:])
            text = ec + text + bc

            # Protect the environment against breaks in multicols
            #if ('ul' in ancestor):
            #    text = self.protect_ul(text,ancestor[:])
            if ('ol' in ancestor or 'ul' in ancestor):
                text = self.protect_ol(text,ancestor[:])

        return text

    def protect_ol(self,text,ancestor=[]):
        myAn = ancestor[:]
        bg = '\n '
        ee = '\n '

        while ('ol' in myAn or 'ul' in myAn):
            count_li = 1
            while ('li' in myAn):
                if ('li' == myAn[-1]):
                    count_li += 1
                    myAn.pop()
                elif ('ol' in myAn[-1] or 'ul' in myAn[-1]):
                    break  # Break out of li while
                else:
                    myAn.pop()

            if ('ol' == myAn[-1] ):
                myAn.pop()
                bg = bg + r'\begin{enumerate}[start='+str(count_li)+r']' + '\n'
                ee = r'\end{enumerate}' + '\n' + ee
            elif ('ul' == myAn[-1]):
                myAn.pop()
                bg = bg + r'\begin{itemize}' + '\n'
                ee = r'\end{itemize}' + '\n' + ee
            else:
                myAn.pop()

        return  ee  + text + '\n' + bg

    def protect_ul(self,text,ancestor=[]):
        myAn = ancestor[:]
        bg = '\n '
        ee = '\n '
        while ('ul' in myAn):
            if ('ul' == myAn[-1] ):
                myAn.pop()
                bg = r'\begin{itemize}' + '\n' + bg
                ee = r'\end{itemize}' + '\n' + ee
            else:
                myAn.pop()
        return  ee  + text + '\n' + r'\item[]' + bg

    def protect_dl(self,text,ancestor=[]):
        myAn = ancestor[:]
        bg = '\n '
        ee = '\n '
        while ('dl' in myAn):
            if ('dl' == myAn[-1] ):
                myAn.pop()
                bg = r'\begin{description}' + '\n' + bg
                ee = r'\end{description}' + '\n' + ee
            else:
                myAn.pop()
        return  ee  + text + '\n' + r'\item[]' + bg


    def translate_title(self, node, ancestor=[]):
        printConsole( "Translating a title")
        printConsole( "node literal: "+ str(node))
        ec = "\end{multicols} \n"
        bc = "\\begin{multicols}{2} \n"


        nfont = 30.0    # Huge
        pwide = 6.0

        buff = node.text
        if buff == None:
            buff = ''

        font = nfont

        cp = "\clearpage \n"
        font_arg = "\\fontsize{"+str(font)+"}{"+str(font*1.2)+"}\selectfont  "
        text = cp + ec + "\CKchapter{ "+ buff +" }{ "+ font_arg +" }"

        if self.art_type == 'workbook':  
            text = ''
            return text
        if (self.art_type == 'lesson' or self.art_type == 'section' or self.art_type == 'concept' ):
            text = cp + ec + "\CKchapterC{ "+ buff +" }{ "+ font_arg +" }{ Concept }"

        # Only add minitoc for chapters with h1's and new page
        if self.has_h1 == True:
            text = text + r'\minitoc' + ' \n' + bc #+ cp
        else:
            text = text + bc

        return  text



    def translate_h1(self, node, ancestor=[]):
        printConsole( "Translating a h1.")
        printConsole( "node literal: "+ str(node))
        ec = "\end{multicols} \n"
        bc = "\\begin{multicols}{2} \n"
        cp = "\clearpage \n"
        #return  r"\section{"+ node.text + node.tail +"}\n"

        ## Count length of the section string to see if size reduction is needed
        if node.tail == None:
            node.tail = ''
        if node.text == None:
            node.text = ''
        text = node.text + node.tail
        text = text.strip()
        text = text.replace('_','$\_$')  # Make sure to escape an underscore
        nfont = 24.0    # Huge
        pwide = 5.5

        font = nfont
        font_arg = "\\fontsize{"+str(font)+"}{"+str(font*1.2)+"}\selectfont"
        text =  ec + cp+"\CSection{"+text+"}{"+font_arg+"}\n"+bc
        text += r'\\~' + '\n'    # Need some filler incase no content is present...
        return text

    def translate_a(self, node, ancestor=[]):
        printConsole( "Translating a: "+ str(node))
        printConsole( "Attributes: "+ str(node.attrib))
        url = text = ''
        #import pdb; pdb.set_trace()

        if node.attrib.has_key('href'):
            #a link 
            text = node.text
            if text == None:
                text = ''
            tail = node.tail
            if tail == None:
                tail = ''
            url = node.attrib['href']
            #print url
            #time.sleep(5)
            if url.startswith(r'\#'):
                #local url, doesn't work with '_'
                #url = url.replace('_', '').replace(r"\#","")
                #url = url.replace(r"\#","")
                #return "\\ref{"+ url + "} " + text + tail
                url = url.replace(r"\#","").replace(r'\_','_')
                text = text.replace(r'\#','')
                if ('below' in text or 'above' in text):
                    text = ''
                return "\\ref{"+ url +"} " +  text + tail

            else:
                #return r"\href{"+ url +"}{"+ text +"}" + tail
                #return r"\url{"+ url +"}" + tail
                count = ancestor.count('ol')
                count += ancestor.count('ul')
                width = 3.2 - count * 0.5
                space = r'{\allowbreak{}}'
                #murl = space.join(list(url))
                murl = insert_string(url,space,4)
                return r"\ckurl{"+ url +"}{"+ murl +"}{" + str(width) + "in}" + tail
        else:
            #an anchor
            #anchor = node.attrib['name']
            #if anchor == None:
            anchor = node.attrib['id'].replace("_", "")
            if anchor == None:
                anchor = ''
            return r"\ref{"+ anchor +"}"

            

                          
                           
