from lxml import html
import re
from BeautifulSoup import BeautifulSoup, BeautifulStoneSoup
from datetime import datetime
try:
    from PIL import Image
except:
    import Image
import urllib
from utils import countwidthH2, fix_altText, printConsole, fix_greek, children_allowed
from utils import ProcessWithTimeout, resolve_url_redirect 
import traceback
import sys
sys.path.append('../')
import settings
import logging



class ConceptParser():

    def __init__(self):
    	self.log = logging.getLogger(__name__)
        self.doc = None
        self.texbuff = ''
        self.has_h1 = True
        self.work_dir = ""
        self.embed_prefix = 'http://qa-host1.ck12.org/flexbook/embed/view/'
        self.video_icon_src = 'embvideo.png'
        self.translator_map = {'p': self.translate_p,
                               'h1': self.translate_h1,
                               'h2': self.translate_h2,
                               'h3': self.translate_h3,
                               'h4': self.translate_h4,
                               'h5': self.translate_h5,
                               'h6': self.translate_h6,
                               'strong': self.translate_strong,
                               'em': self.translate_em,
                               'a': self.translate_a,
                               'img': self.translate_img,
                               'object': self.translate_object,
                               'iframe': self.translate_iframe,
                               'ol': self.translate_ol,
                               'ul': self.translate_ul,
                               'li': self.translate_li,
                               'table': self.translate_table,
                               'thead': self.translate_thead,
                               'tr': self.translate_tr,
                               'td': self.translate_td,
                               'th': self.translate_th,
                               'tbody': self.translate_tbody,
                               'span': self.translate_span,
                               'div': self.translate_div,
                               'title': self.translate_title,
                               'sub': self.translate_sub,
                               'sup': self.translate_sup,
                               'dl': self.translate_dl,
                               'dt': self.translate_dt,
                               'dd': self.translate_dd,
                               'pre': self.translate_pre,
                               'blockquote':self.translate_blockquote,
                               'br':self.translate_br,
                               'hr':self.translate_hr,
                                }


    def init_payload(self, text):
        self.doc = html.document_fromstring(self.cleanup_html(text))
        #text = html.tostring(self.doc, encoding='UTF-8')
        #self.doc = html.document_fromstring(self.cleanup_html(text))

    def cleanup_longdesc(self, text):
        #1. remove the extra meaningless spaces
        text = re.sub(r'\s\s+', ' ', text)

        #2. fix latex special chars
        #if text:
        #    text = text.replace(r'\xe2\x80\x9c','``').replace(r'\xe2\x80\x9d',"''")  # Replace the quote (left and right)
        #    text = text.replace(r'\xe2\x80\x99',"'")  # Replace single quote
        #    text = text.replace(r'\xe2\x80\x93',"-")  # Replace hyphen
        #    text = text.replace(r'\xe2\x80\x94',"-")  # Replace hyphen

        return text

    def cleanup_html(self, text):
        #0. Replace \n with #newline# in <pre>
        pre_re = re.compile("<pre id=.*?>(.*?)</pre>", re.DOTALL)
        allPres = pre_re.findall(text)
        for eachPre in allPres:
            text = text.replace(eachPre, eachPre.replace('\n', '\#newline\#').replace(' ', '\#space\#') )

        #1. remove the extra meaningless spaces
        text = re.sub(r'\s\s+', ' ', text)

        #0a. Revert #newline# to \n
        #text = text.replace('\#newline\#', '\n')

        #2. fix latex special chars (outdated)
        text = text.replace(u'\u25e6',r'$\circ$')
        #3. Escape underscore and dollar in text except the text in alt attribute (math mode) and src
        text = text.replace(r'_', r'\_')
        text = text.replace(r'$', r'\$')
        text = text.replace(r'%', r'\%')
        text = text.replace(r'#', r'\#')
        text = text.replace(r'{', r'\{')
        text = text.replace(r'}', r'\}')
        text = text.replace(r'~', r'{\textasciitilde}')
#        text = text.replace(r'...', r'{\ldots}')

        text = text.replace(r'\\_', r'\_')
        text = text.replace(r'\\$', r'\$')
        text = text.replace(r'\\%', r'\%')
        text = text.replace(r'\\#', r'\#')
        #text = text.replace(r'\\{', r'\{')
        #text = text.replace(r'\\}', r'\}')
        text = text.replace(r'\\...', r'\{\ldots}')
        text = text.replace('&\#8211;', r'\textendash ')
        text = text.replace('&\#8212;', r'\textemdash ')
        #text = text.replace('&#38;', r'\&')

        text = text.replace(u'\u00B0', r'$^{\circ}$')
        text = text.replace(u'\u0259', r'\textschwa')
        text = text.replace(u'\u2013', r'-')

        ## Special unicode - Upper and lower case Greek
        text = fix_greek(text)

        soup = BeautifulSoup(text)

        # Bug #45951
        # Replace title with soup's encoded version
        # If we cannot encode skip
        _title = soup.find('title')
        try:
            text = re.sub(r'<title>.*</title>',str(_title).encode('unicode-escape'),text)
        except:
            pass

        for eachImg in soup.findAll('img'):
            img_src = eachImg.get('src','')
            if img_src:
                newSrc = img_src.replace(r'\_',r'_')
                text = text.replace(img_src,newSrc)

        return text

    def translate(self):
         
        #
        # somewhere the &#38; was changed to & 
        # take a look at self.doc.body.text_content() and verify
        # if all of the &#38; have been changed to &, then pdflatex
        # will interpret the & as column breaks. This is ok for math, but not
        # for regular text.

        children = self.doc.body.getchildren()
        self.has_h1 = False
        for child in children:     # Check if there is an h2 in this chapter
            if child.tag == 'h1':
                self.has_h1 = True

        children = self.doc.head.getchildren()
        ancestor = ['head']
        for child in children:
            self.texbuff += self.translate_node(child, ancestor=ancestor)

        children = self.doc.body.getchildren()

        ancestor = ['body']
        for child in children:
            printConsole( self.texbuff )
            self.texbuff += self.translate_node(child, ancestor=ancestor)

        printConsole( "Translated doc: "+ self.texbuff)
        printConsole( "type is now:"+ str(type(self.texbuff)) )
        return self.texbuff


    def translate_node(self, node, ancestor=[]):
        tex = ''
        if str(type(node)).find('HtmlComment') < 0:
            printConsole(  "Node's name: "+ str(node.tag))
            tag = node.tag.lower()
            tmp = ''
            if self.translator_map.has_key(tag):
                try:
                    tmp = self.translator_map[tag](node, ancestor=ancestor[:])
                except Exception as exceptObj:
                    printConsole(exceptObj.__str__())
                    printConsole(traceback.format_exc())
                    if node.text:
                        tmp = node.text
                finally:
                    if tmp:  # Be safe in cat str
                        tex += tmp
            else:
                printConsole(  "a's tag name is: "+ node.tag)
                printConsole( node.text)
                printConsole( node.tail)
                printConsole( "\n")
        else:
            printConsole( 'Encountered a comment. Returing an empty string')
        return tex

    def translate_p(self, node, ancestor=[]):
        printConsole( "Translating a para.")
        printConsole( "node literal: "+ str(node))
        localbuff = ''
        children = node.getchildren()
        text = node.text
        ancestor.append(node.tag.lower())
        if text:
            if 'table' in ancestor:
                text = text.replace('&\#160;', ' ')
            else:
                text = text.replace('&\#160;', ' ')
            text = text.replace('&', r'\&')
        if text == None:
            text = ''
        tail = node.tail
        if tail == None:
            tail = ''
        for child in children:
            localbuff += self.translate_node(child, ancestor=ancestor[:])
        tex = text + localbuff

        if node.attrib.has_key('class'):
            if 'indent' in node.attrib['class']:
                tex = '\n' + r'{\addtolength{\leftskip}{10 mm}' + '\n' + tex
                tex = tex + '\n\n' + r'}' + '\n'

        printConsole( "translate result:"+ text + localbuff + tail + "\n")
        return  "\n\n"+ tex + tail

    def translate_strong(self, node, ancestor=[]):
        printConsole( "Translating strong.")
        printConsole( "node literal: "+ str(node))
        protect = ['protected_element']
        localbuff = ''
        pbuff = ''
        ancestor.append(node.tag.lower())
        text = node.text
        tail = node.tail
        if text == None:
            text = ""
        if tail == None:
            tail = ""
        children = node.getchildren()
        for child in children:
            if (child.tag.lower() not in protect):
                localbuff += self.translate_node(child, ancestor=ancestor[:])
            else:
                pbuff += self.translate_node(child, ancestor=ancestor[:])

        return r"{\bf "+ text + localbuff + pbuff + r"}" + tail 

    def translate_em(self, node, ancestor=[]):
        printConsole( "Translating em.")
        printConsole( "node literal: "+ str(node))
        protect = ['proctected_element']
        localbuff = ''
        pbuff = ''
        text = node.text
        tail = node.tail
        if text == None:
            text = ""
        if tail == None:
            tail = ""
        children = node.getchildren()
        ancestor.append(node.tag.lower())
        for child in children:
            # skip over any html comments, but get the tail text if it exists
            if child.__class__.__name__ == 'HtmlComment':
                if child.tail != None:
                    localbuff += child.tail
                continue
            if (child.tag.lower() not in protect):
                localbuff += self.translate_node(child, ancestor=ancestor[:])
            else:
                pbuff += self.translate_node(child, ancestor=ancestor[:])
        previous = node.getprevious()
        outbuff = r"\emph{"+ text + localbuff + "}" + pbuff + tail 
        if previous == None:
            return outbuff
        elif r'img' in previous.tag:
            return r" " + outbuff
        else:
            return outbuff

    def translate_a(self, node, ancestor=[]):
        printConsole( "Translating a: "+ str(node))
        printConsole( "Attributes: "+ str(node.attrib))
        url = text = ''
        if node.attrib.has_key('href'):
            #a link 
            text = node.text
            if text == None:
                text = ''
            tail = node.tail
            if tail == None:
                tail = ''
            url = node.attrib['href']

            text = text.replace(r'{\textasciitilde}', '~')
            url = url.replace(r'{\textasciitilde}', '~')

            if url.startswith(r'\#'):
                #local url, doesn't work with '_'
                url = url.replace('_', '').replace(r"\#","")
                tail = tail.replace(r"\#","")
                return "\\ref{"+ url.strip() +"}"+ tail
            else:
            
                space = r'{\allowbreak{}}'
                murl = insert_string(url,space,4)
                #return r"\ckurl{"+ url +"}{"+ murl +"}{" + str(width) + "in}" + tail
                return r"\href{"+ url +"}{"+ murl +"}" + tail
        else:
            #an anchor
            anchor = node.attrib['id'].replace("_", "")
            if anchor == None:
                anchor = ''
            return r"\ref{"+ anchor +"}" + tail

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
            width = '230pt'
        if node.attrib.has_key('class'):
            # Math images 
            iclass = node.attrib['class']
            # Blocked out equations
            if iclass == 'x-ck12-block-math' :#or node.attrib['alt'].__contains__(r'\begin{') :
                text = "\\begin{align*}\n"+  fix_altText(node.attrib['alt']) + "\n\\end{align*}"
            # Inline/Intext equations
            elif iclass == 'x-ck12-math':
                text = "$"+ fix_altText(node.attrib['alt']) +"$"
            # HW-pedia Math images
            elif iclass == 'x-ck12-hwpmath':
                text = self.translate_hwpmath(node,ancestor, includeTail=False)
            else:
                #block images
                text = "\\raisebox{1ex-\\height}{\\includegraphics[width="+ width +"]{"+ node.attrib['src'] +"}}\\vspace{6}\n"
        else:
            #inline image?
            text = "\\includegraphics[width="+ width +"]{"+ node.attrib['src'] +"}\n"
        return  text + tail


    def translate_object(self, node, ancestor=[]):
        #Deprecated, some embeded objects are written as iframe. Not handled here.
        printConsole( "Translating an embed object")
        text = ''
        if node.attrib.has_key('id'):
            oclass = node.attrib['id']
            if oclass.lower().startswith('eo_youtube'):
                children = node.getchildren()
                caption = ''
                source = ''
                desc = ''
                for child in children:
                    if child.tag == 'param':
                        if child.attrib['name'] == 'caption':
                            caption = child.attrib['value']
                        if child.attrib['name'] == 'description':
                            desc = child.attrib['value']
                        if child.attrib['name'] == 'thumbnail':
                            source = child.attrib['value']

                core = "\\raisebox{1ex-\\height}{\\includegraphics[width=230.0pt]{"+ self.video_icon_src +"}}\\vspace{6pt}\n"

                #if object is in a table, degrade to inline image
                if ancestor.__contains__('td'):
                    text = core
                else:
                    text = "\\begin{figure}[!hbpt]\n\\centering"
                    text += core
                    text += "\\caption["+ caption +"]{"+ desc +"}\n"
                    text += "\\label{}\n"
                    text += "\\end{figure}\n"
            return text
        else:
            return ""


    def translate_iframe(self, node, ancestor=[]):

        printConsole("Translating an iframe.")
        internalid = ''
        caption = ''
        thumbnail_path = ''
        iframe_id = ''

        internalid = node.attrib['name']

        if node.attrib.has_key('thumbnail'):
                thumbnail_path = node.attrib['thumbnail'].replace('\_','_') 

        if node.attrib.has_key('id'):
            iframe_id = node.attrib['id']

        if not thumbnail_path:
            thumbnail_path = self.video_icon_src
        try:
            im = Image.open( thumbnail_path )
        except IOError:
            printConsole( "Error in opening file " + thumbnail_path + " ... using default image")
            thumbnail_path = self.video_icon_src

        core = r"\\" + '\n' + "\\raisebox{1ex-\\height}{\\includegraphics[width=230.0pt]{" + thumbnail_path +"}}\\vspace{6pt}\n"
        if ('table' in ancestor):
            text = core
        else:
            title = ''
            if node.attrib.has_key('title'):
                title = node.attrib['title']
            caption = 'Click image to the left or use the URL below.'
            embed_url = settings.HOSTNAME + node.attrib['src']

            #embed_url = node.attrib['src']
            longdesc = ''
            if node.attrib.has_key('longdesc'):
                longdesc = node.attrib['longdesc']
            longdesc = urllib.unquote(longdesc)
            longdesc = self.cleanup_longdesc(longdesc)
            if type(longdesc).__name__ != 'unicode':
                longdesc = unicode(longdesc, errors='replace')

            caption_heading = 'MEDIA'
            artifact_type = node.attrib.get('artifacttype')
            if artifact_type:
                if 'simulation' in artifact_type:
                    caption_heading = 'SIMULATION'
                elif artifact_type == 'plix':
                    caption_heading = 'PLIX'

            if longdesc == "":
                longdesc = title
            if longdesc == "":
                longdesc = caption

            embed_url = embed_url.replace(r'{\textasciitilde}', '~')
            desc = "\href{"+embed_url+"}{"+longdesc+"}"
            width = '1.5in'

            text = '\n '
            
            if ( 'twocolumn' in str(self)):
                text = text + r'\iFrameT{#1}{#2}{#3}{#4}{#5}{#6}{#7}' + ' \n'
            else:
                text = text + r'\iFrameW{#1}{#2}{#3}{#4}{#5}{#6}{#7}{#8}{#9}' + ' \n'

            text = text.replace(r"#1",embed_url)
            text = text.replace(r"#2",thumbnail_path)
            text = text.replace(r"#3",desc)
            text = text.replace(r"#4",longdesc)
            text = text.replace(r"#5",internalid)
            text = text.replace(r"#6",caption_heading)
            text = text.replace(r"#7",width)
            text = text.replace(r"#8",iframe_id) 

            if artifact_type:
                resolved_url = embed_url.replace(r'\%', '%').replace(r'\_', '_')
            else:
                resolved_url = resolve_url_redirect(embed_url.replace(r'\%', '%').replace(r'\_', '_'))
            if resolved_url:
                text = text.replace(r'#9', r'URL: \href{' + resolved_url + '}{' + resolved_url + '}')
            else:
                text = text.replace(r'#9', r' ')


        return text


    def translate_ul(self, node, ancestor=[]):
        printConsole( "Translating ul")
        localbuff = ''
        text = node.text
        tail = node.tail
        if text == None:
            text = ""
        if tail == None:
            tail = ""

        children = node.getchildren()
        ancestor.append(node.tag.lower())
        for child in children:
            localbuff += self.translate_node(child, ancestor=ancestor[:])

    
        tex = "\\begin{itemize}\n%s \\end{itemize} \n" % localbuff
        return tex + tail

    def translate_ol(self, node, ancestor=[]):
        printConsole( "Translating ol")
        args = '['
        start = localbuff = ''
        if 'ol' in ancestor and not node.attrib.get('class'):
            node.attrib['class'] = 'x-ck12-lower-alpha'
        if not node.attrib.get('class'):
            node.attrib['class'] = 'x-ck12-decimal' 
        ancestor.append(node.tag.lower())
        if node.attrib.has_key('class'):
            listNum = node.attrib['class']
            if ('decimal' in listNum):
                num = r'\arabic'
            elif ('lower-alpha' in listNum):
                num = r'\alph'
            elif ('upper-alpha' in listNum):
                num = r'\Alph'
            elif ('lower-roman' in listNum):
                num = r'\roman'
            elif ('upper-roman' in listNum):
                num = r'\Roman'

            I = 'enum'
            for i in range(ancestor.count('ol')):
                I += 'i'
            Narg = r'label = ' + num + r'{'+ I +'}.'
            args = args + Narg 

            if node.attrib.has_key('start'):
                args = args + r','

        if node.attrib.has_key('start'):
            startnum = node.attrib['start']
            if startnum != '':
                start = "start=%s" % startnum
                for i in range (1,int(startnum)):  # Add more items to list
                    ancestor.append('li')
            args = args + start

        children = node.getchildren()
        args = args + ']'

        for child in children:
            localbuff += self.translate_node(child, ancestor=ancestor[:])
            # Keep track of the number of items in this list
            if (child.tag == 'li'):
                ancestor.append(child.tag.lower())

        return "\\begin{enumerate}%s %s \\end{enumerate}" % (args, localbuff)


    def translate_li(self, node, ancestor=[]):
        printConsole( "Translating li")
        localbuff = ''
        text = node.text
        if text == None:
            text = ''
        if text.strip() and text.strip()[0] == '[':
            text = text.replace('[', '{[}', 1)
        children = node.getchildren()
        ancestor.append(node.tag.lower())
        for child in children:
            localbuff += self.translate_node(child, ancestor=ancestor[:])

        return "\n\\item %s%s " % (text, localbuff)


    def translate_title(self, node, ancestor=[]):
        printConsole( "Translating a title")
        printConsole( "node literal: "+ str(node))
        nfont = 30.0    # Huge
        pwide = 6.0
        buff = node.text
        if buff == None:
            buff = ''
        font = nfont
        # allow & symbols in title
        buff = buff.replace("&", "\&")
        cp = "\clearpage \n"
        font_arg = "\\fontsize{"+str(font)+"}{"+str(font*1.2)+"}\selectfont  "

        # Handle chapter vs concepts
        if node.attrib.has_key('arttype') and node.attrib['arttype'] == 'concept':
            text = cp + "\CKconcept{ "+ buff +" }{ "+ font_arg +" }"
        else: 
            text = cp + "\CKchapter{ "+ buff +" }{ "+ font_arg +" }"

        if self.art_type == 'workbook':  
            text = ''
            return text
        #if (self.art_type == 'lesson' or self.art_type == 'section' or self.art_type == 'concept' ):
        #    text = cp + "\CKchapterC{ "+ buff +" }{ "+ font_arg +" }{ Concept }"

        # Only add minitoc for chapters with h1's and new page
        if self.has_h1 == True:
            text = text + r'\minitoc' + ' \n' #+ cp           
        return  text


    def translate_h1(self, node, ancestor=[]):
        printConsole( "Translating a h1.")
        printConsole( "node literal: "+ str(node))
        if node.tail == None:
            node.tail = ''
        if node.text == None:
            node.text = ''
        if node.attrib.has_key('id'):
            id = node.attrib['id'].replace(r"\#",'').replace(r'\_','_')
        buff = node.text
        buff = buff.replace("&", "\&")
        #buff = buff.replace('_', '\_')
        text = r"\section{"+ buff +"}"
        #if node.attrib.has_key('id'):
        #    text = r'\label{' + id + r'}'
        #    text = r"\section{"+ buff + text +"}\n"

        return  text + node.tail


    def translate_h2(self, node, ancestor=[]):
        printConsole( "Translating a h2.")
        printConsole( "node literal: "+ str(node))
        if node.tail == None:
            node.tail = ''
        if node.text == None:
            node.text = ''
        if node.attrib.has_key('id'):
            id = node.attrib['id'].replace(r"\#",'').replace(r'\_','_')
        buff = node.text
        buff = buff.replace("&", "\&")
        #buff = buff.replace('_', '\_')
        buff = buff.strip()
        text = r"\subsection{"+ buff +"}\n"
        #if node.attrib.has_key('id'):
        #    text = r'\label{' + id + r'}'
        #    text = r"\subsection{"+ buff + text +"}\n"
            
        if self.art_type == 'workbook':
            if 'answer' in buff.lower():
                buff = r"\subsection{"+ buff +"}\n"
                text = "\n" + r"\clearpage" + "\n" + buff

        return text + node.tail


    def translate_h3(self, node, ancestor=[]):
        printConsole( "Translating a h3.")
        printConsole( "node literal: "+ str(node))
        allowed = ['sup', 'sub', 'a', 'b', 'strong', 'i', 'u', 'p', 'span', 'img']
        if node.tail == None:
            node.tail = ''
        if node.text == None:
            node.text = ''
        children = node.getchildren()
        ancestor.append(node.tag.lower())
        localbuff = ''
        needToBreak = False
        for child in children:
            needToBreak = False
            # some spans have imgs in them, we don't want to translate them.
            # if there's a span, then check if there's an <img> in it...
            for el in child.getchildren(): 
                if el.tag == 'img':
                    #needToBreak = True
                    pass
            if needToBreak:
                break;
            # translate allowed children...
            if (children_allowed(child, allowed)):
                localbuff += self.translate_node(child, ancestor=ancestor[:])
            
        buff = node.text + localbuff + node.tail
        buff = buff.replace("&", "\&")
        #buff = buff.replace('_', '\_')
        buff = buff.replace(r'+',r'\+')
        
        text = '\n' + r"\subsubsection{"+ buff.strip() +"}\n"

        if self.art_type == 'workbook':
            if 'answer' in buff.lower():
                buff = r"\subsubsection{"+ buff.strip() +"}\n"
                text = "\n" + r"\clearpage" + "\n" + buff

        return  text

    def translate_h4(self, node, ancestor=[]):
        printConsole( "Translating a h4.")
        printConsole( "node literal: "+ str(node))
        allowed = ['sup', 'sub', 'a', 'b', 'strong', 'i', 'u', 'p', 'span', 'img']
        localbuff = ''
        children = node.getchildren()
        ancestor.append(node.tag.lower())
        if node.tail == None:
            node.tail = ''
        if node.text == None:
            node.text = ''
        needToBreak = False
        for child in children:
            needToBreak = False
            # some spans have imgs in them, we don't want to translate them.
            # if there's a span, then check if there's an <img> in it...
            for el in child.getchildren(): 
                if el.tag == 'img':
                    pass
                    #needToBreak = True
            if needToBreak:
                break;
            # translate allowed children...
            if (children_allowed(child, allowed)):
                localbuff += self.translate_node(child, ancestor=ancestor[:])
        buff = node.text + localbuff + node.tail
        buff = buff.replace("&", "\&")
        #buff = buff.replace('_', '\_')
        buff = buff.replace(r'+',r'\+')
        return  '\n' + r"\paragraph{"+ buff.strip() +"}\n"

    def translate_h5(self, node, ancestor=[]):
        printConsole( "Translating a h5.")
        printConsole( "node literal: "+ str(node))
        allowed = ['sup', 'sub', 'a', 'b', 'strong', 'i', 'u', 'p', 'span', 'img']
        if node.tail == None:
            node.tail = ''
        if node.text == None:
            node.text = ''
        children = node.getchildren()
        ancestor.append(node.tag.lower())
        localbuff = ''
        needToBreak = False
        for child in children:
            needToBreak = False
            # some spans have imgs in them, we don't want to translate them.
            # if there's a span, then check if there's an <img> in it...
            for el in child.getchildren(): 
                if el.tag == 'img':
                    pass
                    #needToBreak = True
            if needToBreak:
                break;
            # translate allowed children...
            if (children_allowed(child, allowed)):
                localbuff += self.translate_node(child, ancestor=ancestor[:])
        buff = node.text + localbuff  + node.tail
        buff = buff.replace("&", "\&")
        #buff = buff.replace('_', '$\_$')
        buff = buff.replace(r'+',r'\+')
        return  '\n' + r"\subparagraph{"+ buff.strip() +"}\n"

    def translate_h6(self, node, ancestor=[]):
        printConsole( "Translating a h6.")
        printConsole( "node literal: "+ str(node))
        allowed = ['sup', 'sub', 'b', 'strong', 'i', 'u', 'p', 'span', 'img']
        if node.tail == None:
            node.tail = ''
        if node.text == None:
            node.text = ''
        children = node.getchildren()
        ancestor.append(node.tag.lower())
        localbuff = ''
        needToBreak = False
        for child in children:
            needToBreak = False
            # some spans have imgs in them, we don't want to translate them.
            # if there's a span, then check if there's an <img> in it...
            for el in child.getchildren(): 
                if el.tag == 'img':
                    pass
                    #needToBreak = True
            if needToBreak:
                break;
            # translate allowed children...
            if (children_allowed(child, allowed)):
                localbuff += self.translate_node(child, ancestor=ancestor[:])
        buff = node.text + localbuff  + node.tail
        buff = buff.replace("&", "\&")
        buff = buff.replace('_', '\_')
        buff = buff.replace(r'+',r'\+')
        return  '\n' + r"{\bf "+ buff.strip() +"} \\\\* \n"

    def translate_table(self, node, ancestor=[]):
        text = ''
        if 'table' in ancestor:
            text = ''
        else:
            text = self.translate_table_default(node,ancestor)
        return text

    def translate_table_default(self, node, ancestor=[]):
        printConsole( "Translate a table.")
        short_cap = long_cap = localbuff = headtext = sizetext = id = title = ''
        fname = self.get_fname()
        children = node.getchildren()
        
        if node.attrib.has_key('summary'):
            short_cap = node.attrib['summary']
        if node.attrib.has_key('title'):
            title = node.attrib['title']            
        if node.attrib.has_key('id'):
            id = node.attrib['id'].replace("_","").replace("\\#",'')
        if node.attrib.has_key('border'):
            border = node.attrib['border']
        else:
            border = '0'        # Default the border to "on"
        self.border = border
        size = 0
        ancestor.append(node.tag.lower())

        # Make sure A child is thead... if not, make a blank one
        import copy
        chTags = [];
        for child in children:
            chTags.append(child.tag)
        if 'thead' not in chTags:
            tnode = copy.deepcopy(children[0])
            tchildren = tnode.getchildren()
            for tchild in tchildren:
                tnode.remove(tchild)
            tnode.tag = 'thead'
            tnode.text = ''
            tnode.tail = ''
            children.insert(0,tnode)

        # Extract the caption
        for child in children:
            if child.tag == 'caption':
                printConsole( "Got long caption!")
                allow = ['em']  # Allow these to render, else grab text/tail
                long_cap = self.render_some_children(child,allowed=allow,ancestor=ancestor[:])

                if child.text:
                    long_cap = child.text + long_cap
                if child.tail:
                    long_cap = long_cap + child.tail
        
        # Render the table head and body
        for child in children:
            if child.tag == 'thead':
                if long_cap == '':
                    long_cap = short_cap
                    if long_cap == '':
                        long_cap = title

                printConsole( "Got a thead")
                headtext = self.translate_thead(child, border, shortcap = short_cap, longcap = long_cap, id=id, ancestor=ancestor[:])
                size = max(size,self.count_column(child))

            else:
                localbuff += self.translate_node(child, ancestor=ancestor[:])
                size = max(size,self.count_column(child))

        # Formt of the table automatically
        if 1==1:
            #print 'Automatic table formatting'
            #text = ''
            printConsole( "Table size is: "+ str(size))
            for i in range(0, size):
                sizetext += 'X'
                if border == '1':
                    sizetext += "|"
            if border == '1':   # Additional v-line for first column
                sizetext = '|' + sizetext
            #text = '\n' + r'\FloatBarrier' + '\n'
            text = "\n\\begin{filecontents}{"+ fname +"} \n"
            text += "\\begin{longtable}{%s} %s%s"
            text += r"\specialrule{1pt}{0pt}{0pt}" + " \n"
            text += "\\end{longtable} \n"
            text += "\\end{filecontents}\n"
            text += "\\LTXtable{\\textwidth}{"+ fname +"}\n"
            text += r'\FloatBarrier' + '\n'
            text = text % (sizetext, headtext, localbuff)
            text = text.replace('&\#160;', ' ').replace('&\#38;', r'\&')


        # Format of the table manually... spills for large number of columns.?
        if 1==2:
            printConsole( "Table size is: "+ str(size))
            sizetext = ''
            for i in range(0, size):
                sizetext += r'p{' + str(1.0/float(size)*.9) + r'\textwidth} '
                if border == '1':
                    sizetext += "|"
            if border == '1':   # Additional v-line for first column
                sizetext = '|' + sizetext

            text = "\n\\begin{longtable}{%s} "
            #text += "\\caption[<shortcaption>]{\\textbf{<longcaption>}\\label{<id>}} \\\\ \n"
            text += "%s%s \n"
            text += r"\specialrule{1pt}{0pt}{0pt}" + " \n"
            text += "\\end{longtable} \n"
            text = text % (sizetext, headtext, localbuff)
            text = text.replace('&\#160;', ' ').replace('&\#38;', r'\&')
            text  = text.replace('<shortcaption>',short_cap).replace('<longcaption>',long_cap).replace("<id>",id)

        return text


    def count_column(self, node):
        printConsole( "counting td..")
        children = node.getchildren()
        size = 0
        if node.tag == 'tr':      # Only count the tr's kids
            return children.__len__()
        else:
            for child in children:
                if child.tag == 'tr':  # Only count the tr's kids
                    grandchildren = child.getchildren()
                    size = max(size,grandchildren.__len__())
            return size


    def translate_thead(self, node, border, shortcap = '', longcap = '', id="", ancestor=[]):
        printConsole( "Translate a thead.")
        localbuff = ''
        children = node.getchildren()
        ancestor.append(node.tag.lower())
        for child in children:
            localbuff += self.translate_node(child, ancestor=ancestor[:])

        
        text = "\\caption[]{(continued)} \\\\ \n"
        if border == '1':
            text += r"\specialrule{1pt}{0pt}{0pt}" + " \n"
            text += "<headtext> \n" 
            text += r"\specialrule{1pt}{0pt}{0pt}" + " \n"
            text += "\\endhead \n"
        else:
            text += "<headtext> \n"
            text += "\\endhead \n"
        text += "\\caption[<shortcaption>]{{<longcaption>}\\label{<id>}} \\\\ \n"
        if border == '1' and (shortcap or longcap):
            text += r"\specialrule{1pt}{0pt}{0pt}" + " \n"
            text += "<headtext> \n" 
            text += r"\specialrule{1pt}{0pt}{0pt}" + " \n"
            text += "\\endfirsthead \n"
        else:
            text += "\n<headtext>\n\\endfirsthead  \n"

        return text.replace("<headtext>", localbuff).replace('<shortcaption>',shortcap).replace('<longcaption>',longcap).replace("<id>",id)


    def translate_tr(self, node, ancestor=[]):
        printConsole( "Translating a tr")
        localbuff = []
        children = node.getchildren()
        ancestor.append(node.tag.lower())
        for child in children:
            localbuff.append( self.translate_node(child, ancestor=ancestor[:]).strip())

        grid = ''
        if (self.border == '1'):
            grid = r'\hline' + '\n'
        return grid + ' & '.join(localbuff) + r" \\" + " \n"
                

    def translate_td(self, node, ancestor=[]):
        printConsole( "Translate a td")
        localbuff = ''
        text = node.text
        if text == None:
            text = '' 
        tail = node.tail
        if tail == None:
            tail = ''
        if text.strip() and text.strip()[0] == '[':
            text = text.replace('[', '$[$',1)
        children = node.getchildren()
        ancestor.append(node.tag.lower())
        for child in children:
            localbuff += self.translate_node(child, ancestor=ancestor[:])    
        
        text = text + localbuff + tail
        text = text.replace(r' & ',r' \& ')  # In case actual text includes &
        text = text.replace(r'\\&',r'\&')
        return text

    # Header items for table
    def translate_th(self, node, ancestor=[]):
        printConsole( "Translate a th")
        localbuff = ''
        text = node.text
        if text == None:
            text = '' 
        tail = node.tail
        if tail == None:
            tail = ''
        children = node.getchildren()
        ancestor.append(node.tag.lower())
        for child in children:
            localbuff += self.translate_node(child, ancestor=ancestor[:])    

        text = text + localbuff + tail
        text = text.replace(r' & ',r' \& ')  
        text = text.replace(r'\\&',r'\&')      
        return text 


    def translate_tbody(self, node, ancestor=[]):
        printConsole( "Translate a tbody")
        localbuff = ''
        children = node.getchildren()
        ancestor.append(node.tag.lower())
        for child in children:
            localbuff += self.translate_node(child, ancestor=ancestor[:])   
        
        return localbuff


    def translate_div(self, node, ancestor=[]):
        printConsole( "Translating div: " + str(node) )
        text = ''
        link = ''

        # Get the class of the div tagged node, or exit
        div_class = ''
        if node.attrib.has_key('class'):
            div_class = node.attrib['class']

        # Check if div has id
        div_id = ''
        if node.attrib.has_key('id'):
            div_id = node.attrib['id']

        # Referenced figure here
        if re.search('x-ck12-img-', div_class):
            printConsole("Translating a Figure")

            # Get the child (only 1 <p>) and img attributes
            children = node.getchildren()
            src = ''
            pimg_tag_counter = 0.0
            for child in children:
                if child.tag == 'div':
                    return self.translate_div(child, ancestor=ancestor)
                if child.tag=='p':  # Only the p children are rendered: One is img and one is the caption.  (img must always come first!)
                    ichildren = child.getchildren()
                    localbuff = ''
                    text = child.text
                    if text == None:
                        text = ""
                    for ichild in ichildren:
                        # The first <p> has img tag... this is the actual figure image
                        # however, this first if block expects an <img> tag first
                        # the second if will check for an <a> with href for linkable images 
                        if (ichild.tag == 'img' and pimg_tag_counter == 0):   
                            pimg_tag_counter += 1.0
                            if ichild.attrib.has_key('src'):
                                src = ichild.attrib['src']
                            Ichild = ichild
                            if src == '':
                                printConsole("Warning: source argument is empty: no figure generated")
                                return text
                        elif (ichild.tag == 'a' and pimg_tag_counter == 0 and ichild.attrib['href']):
                            # ichild is actually an anchor with an image inside
                            # pull out the href from the <a> and set Ichild to the image inside
                            link = ichild.attrib['href']
                            printConsole("Translating a linked block image with link to %s" % (link))     
                            pimg_tag_counter += 1.0
                            
                            if ichild.getchildren()[0].tag != 'img':
                                printConsole("Warning: Image not found in <a> tag... skipping...")
                                return text
                            Ichild = ichild.getchildren()[0] # this needs to be the <img> in the <a>
                            if Ichild.attrib.has_key('src'):
                                src = Ichild.attrib['src']
                        else:  # Not the <p>(img) and must be the caption <p>
                            localbuff += self.translate_node(ichild,ancestor=ancestor[:])

                    # Set the caption here
                    longdesc = text + localbuff


            # Test the size of the image
            # Determine if the figure is wide or single
            prefix = self.work_dir
            fullpath = prefix +"/"+ src
            # Exception handling for image file that cant be found
            try:
                im = Image.open( fullpath )
            except IOError:
                printConsole( "Error in opening file " + src + " ... skipping")
                return text


            # If image is gif, convert it here
            if (fullpath.split('.')[-1] == 'gif'):
                cmd = r'convert #1[0] #2'
                cmd = cmd.replace('#1',fullpath)
                fullpath = fullpath.replace('.gif','.jpg')
                cmd = cmd.replace('#2',fullpath)
                printConsole( 'Converting a gif ...' )
                proc = ProcessWithTimeout(cmd=cmd)
                returnCode = proc.start(timeout=2*60)
                if returnCode != 0:
                    return None,None

            Pxy = im.size  ## returns (width,height)
            AR = float(Pxy[0]) / float(Pxy[1])

            # Get other arguments
            title = refid = im_id = ''
            if Ichild.attrib.has_key('longdesc') and longdesc == '':
                longdesc = Ichild.attrib['longdesc']
                longdesc = urllib.unquote(longdesc)
                longdesc = self.cleanup_longdesc(longdesc)
                if type(longdesc).__name__ != 'unicode':
                    longdesc = unicode(longdesc, errors='replace')
            if Ichild.attrib.has_key('title'):
                title = Ichild.attrib['title']
            if Ichild.attrib.has_key('id'):
                refid = Ichild.attrib['id']
            im_id = refid
            # If div id, then use: Will override the img id !!
            #if div_id:
            #    refid = div_id
            
            # If img id, then use. Else use div_id
            if refid == '':
                refid = div_id


            # Include image
            # Get widths from tag
            thumb = 1.7
            post = 4.0
            full = 6.5
            Iwide = post    # Default image size
            if ( re.search('thumbnail',div_class ) ):
                Iwide = thumb
            if ( re.search('postcard',div_class ) ):
                Iwide = post
            if ( re.search('fullpage',div_class ) ):
                Iwide = full

                
            if ('table' in ancestor):
                args = u"{" + fullpath + u"}{" + str(1.0) + u"in }{" + refid+ u"}{" + link + u"}\n"
                text = r"\ckimC" + args
            else:

                args = u"{" + fullpath + u"}{" +title+ u"}{" +longdesc+ u"}{" + refid+ u"}"
                width = Iwide
                
                if ( 'twocolumn' in str(self)):
                    if ( Iwide == thumb or Iwide == post):
                        width = 3.2
                        text = "\n \\\\ \ckfigb"  + args     # Single or two/ caption below
                        text += r'{' + str(width) + 'in}\n'

                        if ('dl' in ancestor or 'dd' in ancestor):
                            text = self.protect_dl(text,ancestor[:])
                                
                        # If in ol and/or ul, protect width
                        if ('ol' in ancestor or 'ul' in ancestor):
                            text = self.protect_ol(text,ancestor[:])

                        return text
                     
                if ( Iwide <= post ):
                    #text = "\n \\\\ \n \ckfigwbc"  + args     # Single column/ caption on side
                    text = "\n \ckfigwbc"  + args     # Single column/ caption on side
                    text += r'{' + str(width) + 'in}{' + str(7.0-width)   +'in}{' + link + '}\n' 

                if (  Iwide== full):
                    #text = "\n \\\\ \n \ckfigwb"  + args     # Single column/ caption below
                    text = "\n \ckfigwb"  + args     # Single column/ caption below
                    text += r'{' + str(width) + 'in}{' + link + '}\n' 

                # ckfloat for single column only.  Add option later
                if settings.ImgFloat:
                    if ('onecolumn' in str(self) and im_id != '' and self.art_type != 'workbook' ):
                        text = '\n' + r'\begin{ckfloat}' + text
                        text = text + r'\end{ckfloat}' + '\n'
                else:
                    text = "\n \\\\ " + text   # Add newline if not in float

            return text

        # Element box (header or body)
        elif ( re.search('x-ck12-element-box',div_class ) ):
            
            # If header, get text and find children
            if ( re.search('header',div_class) ):
                head = ''
                children = node.getchildren()
                text = node.text
                tail = node.tail
                ancestor.append(node.tag.lower())
                ancestor.append('ebox-header')
                localbuff = ''
                if text == None:
                    text = ''
                    tail = node.tail
                if tail == None:
                    tail = ''
                for child in children:
                    localbuff += self.translate_node(child, ancestor=ancestor[:])    
                head = text + localbuff + tail 
                return head

            # If body, just return the text and any children there-in
            elif ( re.search('body',div_class) ):
                body = ''
                children = node.getchildren()
                text = node.text
                tail = node.tail
                ancestor.append(node.tag.lower())
                ancestor.append('ebox-body')
                localbuff = ''
                if text == None:
                    text = ''
                    tail = node.tail
                if tail == None:
                    tail = ''
                for child in children:
                    localbuff += self.translate_node(child, ancestor=ancestor[:])    
                body = text + localbuff + tail 
                return body
            
            # If not body or head, the main function call.  Get the children
            # this function expects ONLY 2 children... head and body
            else:
                head = ''
                body = ''
                children = node.getchildren()
                ancestor.append(node.tag.lower())
                if len(children) > 1:
                    head = self.translate_node(children[0],ancestor=ancestor[:])
                    body = self.translate_node(children[1],ancestor=ancestor[:])
                head = head.replace('&\#160;', '\\vspace{1 mm}').replace('&\#38;', r'\&')
                body = body.replace('&\#160;', '\\vspace{1 mm}').replace('&\#38;', r'\&')
                color = 'ckgreen'
                #return '\n' + r"\Ebox{"+color+"}{"+head+"}{"+body+"} \\vspace{6pt} \n"
                Ebox2 = '\n' + r'\begin{EEbox}{'+head+'}{'+color+'}' + '\n'
                Ebox2 += body + '\n'
                Ebox2 += r'\end{EEbox}' + '\n'
                return Ebox2


        # Everything else with a class
        else:
            body = ''
            children = node.getchildren()
            text = node.text
            tail = node.tail
            ancestor.append(node.tag.lower())
            localbuff = ''
            if text == None:
                text = ''
                tail = node.tail
            if tail == None:
                tail = ''

            for child in children:
                localbuff += self.translate_node(child, ancestor=ancestor[:])
            body = text + localbuff + tail
            return body

    def translate_span(self, node, ancestor=[]):
        printConsole( "Translating span: " + str(node))
        text = ''
        tail = ''
        localbuff = ''
        children = node.getchildren()
        text = node.text
        ancestor.append(node.tag.lower())
        if text == None:
            text = ''
        tail = node.tail
        if tail == None:
            tail = ''
        for child in children:
            # xhtml comments have {} attrib and are not itterable, so skip them
            if child.__class__.__name__ == 'HtmlComment':
                continue
            else:
                localbuff += self.translate_node(child, ancestor=ancestor[:])
        text = text.replace("&", r"\&")
        text = text + localbuff

        if node.attrib.has_key('class'):
            s_class = node.attrib['class']
        else:
            printConsole( "Warning:  _span with no class found.  Continueing...")
            return text + tail

        # Translate the 'Text color and back ground color' strikethrough or underline
        if ( re.search('x-ck12',s_class) ):
            printConsole( s_class.split('-'))
            color = 'black'
            latex = text
            m_class = s_class.strip().split(' ')  # Split on the space (if there is one)
            for i_class in m_class:
                if ( re.search('x-ck12-textcolor',i_class) ):
                    color = i_class.split('-')[3]   # Isololate the color string
                    if color != 'black':
                        latex = r'\noindent\textcolor{'+color+'}{'+latex+'}'
                if ( re.search('x-ck12-textbgcolor',i_class) ):
                    color = i_class.split('-')[3]   # Isololate the color string
                    #if 'table' in ancestor:  # Table doesnt support \ckhl
                    if color != 'white':
                        latex = r'\highlight{'+color+'}{'+latex+'}'
                    #else:
                    #    latex = r'\ckhl{'+color+'}{'+latex+'}'
                if ( re.search('x-ck12-strikethrough',i_class) ):
                    latex = r'\sout{'+latex+'}'
                if ( re.search('x-ck12-underline',i_class) ):
                    latex = r'\uline{'+latex+'}'
            return latex +  tail

        # IMG class
        elif s_class.__contains__('img'):
            return text

        # Everthing else, just return text = ''  
        else:
            return text

    def translate_sub(self, node, ancestor=[]):

        localbuff = ''
        text = node.text
        tail = node.tail
        if text == None:
            text = ""
        if tail == None:
            tail = ""
        children = node.getchildren()
        ancestor.append(node.tag.lower())
        for child in children:
            localbuff += self.translate_node(child, ancestor=ancestor[:])
        # respect spaces
        text = text.replace(' ', '\\ ')
        text = r'$_{' + text + r'}$' + localbuff
        return text + tail

    def translate_sup(self, node, ancestor=[]):

        localbuff = ''
        text = node.text
        tail = node.tail
        if text == None:
            text = ""
        if tail == None:
            tail = ""
        children = node.getchildren()
        ancestor.append(node.tag.lower())
        for child in children:
            localbuff += self.translate_node(child, ancestor=ancestor[:])
        # respect spaces
        text = text.replace(' ', '\\ ')
        text = r'$^{' + text + r'}$' + localbuff
        return text + tail


    # Translate a definition list (dl -> dt,dd)
    def translate_dl(self, node, ancestor=[]):
        localbuff = ''
        text = node.text
        tail = node.tail
        if text == None:
            text = ""
        if tail == None:
            tail = ""
        children = node.getchildren()
        ancestor.append(node.tag.lower())
        for child in children:
            localbuff += self.translate_node(child, ancestor=ancestor[:])
        text = '\n' + r'\begin{description}' + '\n'
        text = text + localbuff
        text = text + '\n' + r'\end{description}' + '\n'

        #Bug-13034 : Allow definition list inside table
        # Exception if in a table
        #if ( 'table' in ancestor ):
        #    text = localbuff

        return text + tail

    def translate_dt(self, node, ancestor=[]):
        localbuff = ''
        text = node.text
        tail = node.tail
        if text == None:
            text = ""
        if tail == None:
            tail = ""
        children = node.getchildren()
        ancestor.append(node.tag.lower())
        for child in children:
            localbuff += self.translate_node(child, ancestor=ancestor[:])
        buff = text + localbuff
        text = r'\item['+ buff +']' + ' \hfill \\\\'

        # Exception if in a table
        if ( 'td' in ancestor[-3:] ):
            text = r'\item['+ buff +']\n'

        return text + tail

    def translate_dd(self, node, ancestor=[]):
        localbuff = ''
        text = node.text
        tail = node.tail
        previous = node.getprevious()
        if text == None:
            text = ""
        if tail == None:
            tail = ""
        children = node.getchildren()
        ancestor.append(node.tag.lower())
        for child in children:
            localbuff += self.translate_node(child, ancestor=ancestor[:])
        text = text + localbuff
        parent = node.getparent()
        #To add definition term to newline inside table cell
        if ( 'td' in ancestor ):
            text = '\n \\item \n \\hspace{14 pt} ' + text 
        
        # If there's a previous node and it's not a dt, then insert a \item 
        if previous != None:
            if previous.tag != 'dt':
                text = '\n \\item %s' % (text)
        else: # else condition is true when the dd is the first element in a dl
            text = '\n \\item %s' % (text)

        return text + tail

    def translate_hwpmath(self, node, ancestor=[], includeTail=True):
        text = node.text
        tail = node.tail if includeTail else None
        tex = ''
        if text == None:
            text = ""
        if tail == None:
            tail = ""
        ancestor.append(node.tag.lower())
        if node.attrib['alt']:
            tex += r'\newline' + '\n'
            tex += r'\begin{minipage}{.5in}' + '\n'
            tex += r'\begin{alignat*}{2}' + '\n'
            tex += fix_altText(node.attrib['alt'])
            tex += r'\end{alignat*}' + '\n'            
            tex += r'\end{minipage}' + '\n'
        return text + tex + tail

    def translate_pre(self, node, ancestor=[]):
        localbuff = ''
        text = node.text
        tail = node.tail

        if text == None:
            text = ""
        if tail == None:
            tail = ""
        text = text.replace("&", r"\&")
        tail = tail.replace("&", r"\&")

        children = node.getchildren()
        ancestor.append(node.tag.lower())
        for child in children:
            localbuff += self.translate_node(child, ancestor=ancestor[:])
        text = text.strip()
        text = text + localbuff

        tex = '\n' + r'\\*' + '\n' + r' \tt ' + text + r' \rm '
        tex = tex.replace('\#newline\#', '\\\\\n').replace('\#space\#', r' ') + r' \\'
        return tex + tail


    def translate_blockquote(self, node, ancestor=[]):
        localbuff = ''
        allow_buff = ''
        allowed = ['a','p']
        text = node.text
        tail = node.tail
        if text == None:
            text = ""
        if tail == None:
            tail = ""
        children = node.getchildren()
        ancestor.append(node.tag.lower())
        for child in children:
            buff = self.translate_node(child, ancestor=ancestor[:])
            if children_allowed(child,allowed):
                allow_buff += buff
            else:
                localbuff += buff


        text = text + allow_buff
        #tex = r'\begin{quotation}' + '\n' + r'\noindent'
        #tex = tex + text
        #tex = tex + r'\end{quotation}' + '\n'
        tex = '\n' + r'\\*' + '\n' + r' \em ' + text + r' \rm ' + '\n'
        
        return tex + localbuff + tail

    def translate_br(self,node,ancestor=[]):
        localbuff = ''
        text = node.text
        tail = node.tail
        if text == None:
            text = ""
        if tail == None:
            tail = ""
        children = node.getchildren()
        ancestor.append(node.tag.lower())
        for child in children:
            localbuff += self.translate_node(child, ancestor=ancestor[:])
        text = text + r'\\*' + '\n'  + localbuff + tail
        if ('table' in ancestor):
            text = ''
        return text 

    def translate_hr(self,node,ancestor=[]):
        localbuff = ''
        text = node.text
        tail = node.tail
        if text == None:
            text = ""
        if tail == None:
            tail = ""
        children = node.getchildren()
        ancestor.append(node.tag.lower())
        for child in children:
            localbuff += self.translate_node(child, ancestor=ancestor[:])
        tex = text + '\n' + r'\\' + '\n' + r'\ckHline' + '\n'  + localbuff + tail
        if node.attrib.has_key('class'):  # If class is present, then page break
            tex = text + '\n' + r'\clearpage' + '\n'  + localbuff + tail
        if ('table' in ancestor):
            tex = ''
        return tex 


    def get_fname(self):
        return datetime.now().strftime("%M%S%f") + ".ltx"


    def render_some_children(self,node,allowed=[],ancestor=[]):
        # Function will render only the children of "node" whose tags 
        # are in the allowed list.  Otherwise, the text and tail will be added
        tex = ''
        children = node.getchildren()
        ancestor.append(node.tag.lower())
        for child in children:
            if child.tag in allowed:  # If on list, allow render
                tex += self.translate_node(child, ancestor=ancestor[:])  # Recursive call is built into indiv. node render fucntions
            else:                     # If not, pull off the text and tail
                if child.text:
                    tex += child.text
                tex += self.render_some_children(child,allowed=allowed[:],ancestor=ancestor[:])  # Call recursively to get everyone
                if child.tail:
                    tex += child.tail

        return tex




if __name__ == "__main__":
    parser = ConceptParser()
    parser.init_payload(open("../tests/lesson/concept1.xhtml", "r").read())
    parser.translate()
