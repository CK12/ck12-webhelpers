#f2pdf main file. Calls ofther utilities to translate the source and then render the pdf.
from optparse import OptionParser
from subprocess import PIPE, Popen
import logging
import os
import time
from tempfile import mkstemp
from shutil import move
try:
    from PIL import Image
except:
    import Image
from os import remove, close
from bs4 import BeautifulSoup
from drivers.lesson_plain import LessonPlain
from drivers.twocolumn import Twocolumn
from drivers.onecolumn import Onecolumn
from drivers.worksheet import Worksheet
from drivers.utils import clip_page, ProcessWithTimeout, cut_word
from drivers.utils import fix_specialText, check_for_element_in_html
import codecs


class F2PDF:
    def __init__(self):
        self.render_cmd = "pdflatex -interaction=nonstopmode -file-line-error"
        self.process_log = "/opt/2.0/log/pdflatex.log"
        self.template_dir = ''
        self.log = logging.getLogger(__name__)
        self.work_dir = ''
        self.targetTex = ''
        self.driver = None
        self.art_type = '' # book, chapter, lesson, workbook, etc

    def loadDriver(self, driverName):
        if driverName == 'lesson-plain':
            self.driver = LessonPlain()
            #self.template_dir = './templates/lesson-plain/'
            self.targetTex = 'lesson-plain.tex'

        if driverName == 'onecolumn':
            self.driver = Onecolumn()
            #self.template_dir = './templates/onecolumn/'
            self.targetTex = 'onecolumn.tex'

        if driverName == 'worksheet':
            self.driver = Worksheet()
            #self.template_dir = './templates/worksheet/'
            self.targetTex = 'worksheet.tex'

        if driverName == 'twocolumn':
            self.driver = Twocolumn()
            #self.template_dir = './templates/twocolumn/'
            self.targetTex = 'twocolumn.tex'

        if self.driver != None :
            self.driver.initiate_logger(self.log)

    def make_pdf(self):
        fp = open(self.process_log, "w+")
        cmdR1 = "cd "+ self.work_dir +"; "+ self.render_cmd +" "+ self.targetTex + r" ; "
        # Call renderer twice to get TOC correct
        pdfname_old = self.targetTex.split(".tex")[0] + ".pdf"
        pdfname_new = self.art_type + ".pdf" 
        cmd = cmdR1 +" mv "+ "'" +pdfname_old+ "'"+" "+"'"+ pdfname_new+"'"
        cmdR1 += "echo 'latex': "

        # Make a BW copy of the PDF file
        if self.bw_render:
            GScmd = r"gs -sOutputFile=#OUT# -sDEVICE=pdfwrite -sColorConversionStrategy=Gray "
            GScmd+= r"-dProcessColorModel=/DeviceGray -dCompatibilityLevel=1.1 -dNOPAUSE -dBATCH #IN#;"
            color = pdfname_new.replace(r'.pdf','_color.pdf')
            cmd += r'; cp ' + pdfname_new + ' ' + color + '; '
            cmd += GScmd.replace(r'#IN#',color).replace(r'#OUT#',pdfname_new)


        self.log.info("Rendering pdf (1/2) from...")
        proc = ProcessWithTimeout(cmd=cmdR1)
        returnCode = proc.start(timeout=30*60)
        if returnCode != 0:
            return None,None

        # Call renderer twice to get TOC correct
        self.log.info("Rendering pdf (2/2) from...")
        proc = ProcessWithTimeout(cmd=cmd)
        returnCode = proc.start(timeout=30*60)
        if returnCode != 0:
            return None,None

        # Strip the last page off (this comes from using "import" rather than "include" in latex
        clip_page(self.work_dir + pdfname_new)


    def run_threaded( self, chapters , threads):
        import Queue
        import threading
        import copy

        queue = Queue.Queue()

        #f2pdf = self
        f2pdf = copy.deepcopy(self)

        class ThreadF2PDF(threading.Thread):
            """Threaded f2pdf chapters"""
            def __init__(self, queue):
                threading.Thread.__init__(self)
                self.queue = queue
                self.f2pdf = f2pdf

            def run(self):
                while True:
                    # grabs host from queue
                    infile = self.queue.get()
                    MYf2pdf = copy.deepcopy(self.f2pdf)

                    # Render this chapter
                    print self.getName() + " " + infile
                    #self.f2pdf.htmlfile = infile
                    #self.f2pdf.driver.htmlfile = infile
                    #self.f2pdf.driver.do_work()

                    MYf2pdf.htmlfile = infile
                    MYf2pdf.driver.htmlfile = infile
                    MYf2pdf.driver.do_work()

                    #time.sleep(5)
                    #print infile

                    # signals to queue job is done
                    self.queue.task_done()

        def main():

            # spawn a pool of threads, and pass them queue instance 
            for i in range(threads):
                t = ThreadF2PDF(queue)
                t.setDaemon(True)
                t.start()

            # populate queue with data   
            for chapter in chapters:
                queue.put(chapter)

            # wait on the queue until everything has been processed     
            queue.join()

        main()


    # Set the data from metadata.ini file
    def get_metadata(self):
        # Copied from book
        # Parse the text file for the meta data: Title and authors list 
        from configobj import ConfigObj
        work_dir = self.work_dir
        if os.path.exists( work_dir + 'metadata.ini'):

            config = ConfigObj(work_dir + 'metadata.ini', encoding='UTF8')
            if config.has_key('DEFAULT'):
                print 'Found DEFAULT Section'
                if config['DEFAULT'].has_key('Title'):
                    self.title = config['DEFAULT']['Title']
                    self.title = fix_specialText(self.title)
                if config['DEFAULT'].has_key('Authors'):
                    self.authors = config['DEFAULT']['Authors']
                    # BUG: 33212, cut_word will place an unwanted hyphen in long names
                    # LaTeX automatically handles word wrapping and hyphenation.
                    # self.authors = cut_word(self.authors)
                    self.authors = self.authors.replace(r'%', r'\%')
                if config['DEFAULT'].has_key('Editors'):
                    self.editors = config['DEFAULT']['Editors']
                if config['DEFAULT'].has_key('Contributors'):
                    self.contributors = config['DEFAULT']['Contributors']
                    # self.contributors = cut_word(self.contributors) 
                if config['DEFAULT'].has_key('Sources'):
                    self.sources = config['DEFAULT']['Sources']
                if config['DEFAULT'].has_key('Translators'):
                    self.translators = config['DEFAULT']['Translators']
                if config['DEFAULT'].has_key('Reviewers'):
                    self.reviewers = config['DEFAULT']['Reviewers']
                if config['DEFAULT'].has_key('TechnicalReviewers'):
                    self.technicalreviewers = config['DEFAULT']['TechnicalReviewers']
                if config['DEFAULT'].has_key('CoverImage'):
                    self.coverimage = config['DEFAULT']['CoverImage']
                if config['DEFAULT'].has_key('EncryptedUUID'):
                    self.encryptedUUID = config['DEFAULT']['EncryptedUUID']

            self.authorsDict = {'authors':self.authors, 'editors':self.editors,
                                'contributors': self.contributors, 'sources': self.sources,
                                'translators': self.translators, 'reviewers': self.reviewers,
                                'technicalreviewers': self.technicalreviewers}


    def get_attText(self):
        # Author's is wider
        tag = 'authors'
        self.authorsDict[tag] = self.authorsDict[tag].replace(r';', r'\\')
        if len(self.authorsDict[tag] ) > 0:  # Make sure Authors exist
            attText = r'\ckMP{4in}{\nameBox{'+self.authorsDict[tag]+'}{'+tag+'}}' + r' \\' + '\n'
            attText = attText + r'\vspace{10pt}'
        else:
            attText = ''

        # Loop over the non-empty fields
        count = 0
        alist = []
        for eachType in self.authorsDict.keys():
            if len(self.authorsDict[eachType]) > 0 and not (eachType in 'authors'):
                count = count + 1
                alist.append(eachType)
                self.authorsDict[eachType] = self.authorsDict[eachType].replace(r';',r'\\ ')
                self.authorsDict[eachType] = self.authorsDict[eachType] + r'\\'

        while len(alist) > 0:
            if len(alist) >= 2:
                # Double
                attText = attText + r'\begin{tabular}{cc}'+'\n'
                tag = alist[0]
                names = self.authorsDict[tag]
                attText = attText + r'\ckMP{2.5in}{\nameBox{'+names+'}{'+tag.capitalize()+'}}'+'\n'
                alist.pop(0)
                tag = alist[0]
                names = self.authorsDict[tag]
                attText = attText + r'&' + '\n'
                attText = attText + r'\ckMP{2.5in}{\nameBox{'+names+'}{'+tag.capitalize()+'}}'+'\n'
                attText = attText + r'\end{tabular}'+'\n'
                alist.pop(0)
            elif len(alist) == 1:
                # Single
                tag = alist[0]
                names = self.authorsDict[tag]
                attText = attText + r'\ckMP{2.5in}{\nameBox{'+names+'}{'+tag+'}}'+'\n'
                alist.pop(0)

        self.attText = attText

    def get_attText2(self):
        # Loop over the non-empty fields 
        attText = ''
        count = 0
        alist = []
        for eachType in self.authorsDict.keys():
            if len(self.authorsDict[eachType]) > 0 :
                count = count + 1
                alist.append(eachType)
                self.authorsDict[eachType] = self.authorsDict[eachType].replace(r';',r'\\ ')
                self.authorsDict[eachType] = self.authorsDict[eachType] + r'\\'

        alist.reverse()       # Flip the list to put authors on top
        while len(alist) > 0:
            # Single
            tag = alist[0]
            names = self.authorsDict[tag]
            if names.count(r'\\') == 1:  # Strip the "s" for single person
                tag = tag.strip()[:-1]
            attText = attText + r'{\fontsize{14}{16}\bfseries\scshape\selectfont ' + tag + r'} \\' + '\n'
            attText = attText + names + r'\\' + '\n'
            alist.pop(0)
        self.attText = attText
        return None



    def run(self, driver, payload_dir, art_type, bw_render):
        self.loadDriver(driver)
        work_dir = payload_dir
        self.driver.work_dir = work_dir
        self.driver.payload_dir = payload_dir
        self.art_type = art_type
        self.driver.art_type = art_type
        self.bw_render = bw_render
        self.driver.bw_render = bw_render
        self.driver.htmlfile = ''
        self.htmlfile = ''
        self.work_dir = work_dir
        self.driver.prepare_template()
        self.title = 'CK-12 Book'
        self.authors = 'CK-12 Authors'
        self.editors = 'CK-12 Editors'
        self.contributors = 'CK-12 Contributors'
        self.sources = 'CK-12 Sources'
        self.translators = 'CK-12 Translators'
        self.reviewers = 'CK-12 Reviewers'
        self.technicalreviewers = 'CK-12 Technical Reviewers'
        cover_default = work_dir + 'ck12_generic_cover.png'
        self.encryptedUUID = ''
        self.coverimage = cover_default
        is_concept = False 


        # Book dependent stuff here
        bookLikeArtifactTypes = ['book', 'tebook', 'studyguide', 'labkit', 'worksheet', 'quizbook']
        if self.art_type in bookLikeArtifactTypes:

            ## Loop over all the html files and do work
            listing = os.listdir(work_dir)
            chapters = []
            for i in range (1,999):
                infile = 'chapter_' + str(i).zfill(2) + '.xhtml'
                if infile in listing:
                    print infile
                    self.htmlfile = infile
                    self.driver.htmlfile = infile
                    is_concept = fix_concept_html_file(work_dir + infile)
                    if threaded:
                        chapters.append(infile)
                    else:
                        self.driver.do_work()
                    # Add tex file to tex template
                    pattern = r"%###CHAPTERS###"
                    if is_concept:
                        sub = '\\pagestyle{concept}\n' + r'\include{' + infile.replace( '.xhtml','') + '} \n'
                    else:
                        sub = '\\pagestyle{plain}\n' + r'\include{' + infile.replace( '.xhtml','') + '} \n'
                    replaceinfile( work_dir + self.targetTex , pattern, sub + pattern )


            if threaded:
                print "Runnning threaded"
                self.run_threaded(chapters, threads)
                print 'Done running threads'

            self.get_metadata()          # Sets the attribution values
            self.get_attText2()          # Gets the tex string for front matter (self.attText)

            # Replace in the tex file
            pattern = r"%###BOOKTITLE###"
            tarTex = r'ck12_bookhead.tex'
            replaceinfile( work_dir + tarTex , pattern, self.title )
            pattern = r"%###ATTRIBU###"
            replaceinfile( work_dir + tarTex , pattern, self.attText )
            pattern = r"%###AUTHORS###"
            authortx = r'\begin{center}' + '\n'
            authortx += r'\ckMP{4in}{ \centering {\fontsize{20}{24}\selectfont '
            authortx += self.authors.replace(r';',r' \\ ') + r' \\ }} ' + '\n'
            authortx += r'\end{center}' + '\n'
            replaceinfile( work_dir + tarTex , pattern, authortx )

            # ==============================================
            # Process any front matter and back matter pages
            # ==============================================
            infile_exists = False 
            frontmatter_index_skips = 0
            for i in range(1,10):
                infile = 'frontmatter_' + str(i) + '.xhtml'
                if infile in listing:
                    # Check if the frontmatter page has legitimate content within it. 
                    # Typically the content is wrapped in a 'p' tag, but we'll check for
                    # 'div' and 'span' tags too. 
                    infile_exists = True
                    frontmatter_index = i 
                    frontmatter_file = open(work_dir + r'frontmatter_' + str(i) + '.xhtml', 'r')
                    frontmatter_content = frontmatter_file.read()
                    frontmatter_file.close()
                    frontmatter_test = check_for_element_in_html(frontmatter_content, ['div', 'p', 'span'])
                    if not frontmatter_test: # if the test failed then take note of it and continue to next case
                        frontmatter_index_skips = frontmatter_index_skips + 1
                        continue
                    self.htmlfile = infile
                    self.driver.htmlfile = infile
                    self.driver.do_work()
                    pattern = r"%###FRONTMATTER###"
                    replaceinfile( work_dir + infile.replace('.xhtml', '.tex') , '\\clearpage', '' )
                    replaceinfile( work_dir + infile.replace('.xhtml', '.tex') , '\\CKchapter', '\\clearpage' )
                    # Add tex file
                    f = open(work_dir + 'frontmatter_' + str(i) + '.tex' , 'r')
                    lines = f.read()
                    title_string = lines[:lines.find('}')-1]
                    title = title_string[title_string.find('{'):]
                    sub = r"\input{" + infile.replace( '.xhtml','') + "} \n \\addcontentsline{toc}{chapter}"+ title + "}\n"
                    replaceinfile( work_dir + tarTex , pattern, sub + pattern )
                else:
                    break
            # If any frontmatter_*.tex files are created, then we need to fix the minitoc counter
            # NOTE: We're assuming the onecolumn.tex template is used 
            if infile_exists:
                pattern = r'%###SETCOUNTER###'
                replaceinfile(work_dir + r'onecolumn.tex', pattern, r'\setcounter{mtc}{%s}' % (frontmatter_index-frontmatter_index_skips))
            for i in range(1,10) :
                infile = 'backmatter_' + str(i) + '.xhtml'
                if infile in listing :
                    self.htmlfile = infile
                    self.driver.htmlfile = infile
                    pattern = r"%###BACKMATTER###"
                    self.driver.do_work()
                    replaceinfile( work_dir + infile.replace('.xhtml', '.tex'), '\\CKchapter', '' ) 
                    # Add tex file
                    f = open(work_dir + 'backmatter_' + str(i) + '.tex' , 'r')
                    lines = f.read()
                    title_string = lines[:lines.find('}')-1]
                    title = title_string[title_string.find('{'):]
                    sub = r"\input{" + infile.replace( '.xhtml','') + "}\n\\addcontentsline{toc}{chapter}" + title + "}\n"
                    replaceinfile( work_dir + self.targetTex , pattern, sub + pattern)
                else:
                    break 

            # Convert the book cover image to the standard size 2550x3300
            pattern = r"%###BOOKCOVER###"
            isz = [2550,3300]
            try:
                im = Image.open(self.coverimage)
            except:
                print 'Book cover image failed to open... using default cover page'
                im = Image.open( cover_default )
                self.coverimage = cover_default
            im = im.resize(isz)
            im.save( self.coverimage )
            replaceinfile( work_dir + tarTex , pattern, self.coverimage )

            # Include the front matter
            pattern = r"%###BOOKHEAD###"
            newtex = r'\include{ck12_bookhead}'
            replaceinfile( work_dir + self.targetTex , pattern, newtex )

        # Chapter dependent stuff here
        if self.art_type == 'chapter':
            ## Only expect one file, chapter_01.xhtml
            listing = os.listdir(work_dir)
            infile = 'chapter_01.xhtml'
            self.htmlfile = infile
            self.driver.htmlfile = infile
            self.driver.do_work()
            # Add tex file to tex template
            pattern = r"%###CHAPTERS###"
            sub = r"\include{" + infile.replace( '.xhtml','') + "} \n"
            replaceinfile( work_dir + self.targetTex , pattern, sub + pattern )

            self.get_metadata()          # Sets the attribution values
            self.get_attText2()           # Gets the tex string for front matter (self.attText)

            # Replace in the tex file
            pattern = r"%###BOOKTITLE###"
            tarTex = r'ck12_chapterhead.tex'
            replaceinfile( work_dir + tarTex , pattern, self.title )

            pattern = r"%###ATTRIBU###"
            replaceinfile( work_dir + tarTex , pattern, self.attText )

            pattern = r"%###AUTHORS###"
            authortx = r'\begin{center}' + '\n'
            authortx += r'\ckMP{4in}{ \centering {\fontsize{20}{24}\selectfont '
            authortx += self.authors.replace(r';',r' \\ ') + r' \\ }} ' + '\n'
            authortx += r'\end{centering}' + '\n'
            replaceinfile( work_dir + tarTex , pattern, authortx )

            # Include the front matter
            pattern = r"%###BOOKHEAD###"
            newtex = r'\include{ck12_chapterhead}'
            replaceinfile( work_dir + self.targetTex , pattern, newtex )


        # Lesson dependent stuff here
        if self.art_type == 'lesson':
            ## Only expect one file, lesson.xhtml
            listing = os.listdir(work_dir)
            infile = 'chapter_01.xhtml'
            self.htmlfile = infile
            self.driver.htmlfile = infile
            self.driver.do_work()
            # Add tex file to tex template
            pattern = r"%###CHAPTERS###"
            sub = r"\include{" + infile.replace( '.xhtml','') + "} \n"
            replaceinfile( work_dir + self.targetTex , pattern, sub + pattern )

            self.get_metadata()          # Sets the attribution values
            self.get_attText2()           # Gets the tex string for front matter (self.attText)

            # Replace in the tex file
            pattern = r"%###TITLE###"
            tarTex = r'ck12_lessonhead.tex'
            replaceinfile( work_dir + tarTex , pattern, self.title )

            pattern = r"%###ATTRIBU###"
            replaceinfile( work_dir + tarTex , pattern, self.attText )

            pattern = r"%###AUTHORS###"
            authortx = r'\begin{center}' + '\n'
            authortx += r'\ckMP{4in}{ \centering {\fontsize{20}{24}\selectfont '
            authortx += self.authors.replace(r';',r' \\ ') + r' \\ }} ' + '\n'
            authortx += r'\end{centering}' + '\n'
            replaceinfile( work_dir + tarTex , pattern, authortx )

            # Include the front matter
            pattern = r"%###BOOKHEAD###"
            newtex = r'\include{ck12_lessonhead}'
            replaceinfile( work_dir + self.targetTex , pattern, newtex )

        # Section dependent stuff here
        if self.art_type == 'section':
            ## Only expect one file, lesson.xhtml
            listing = os.listdir(work_dir)
            infile = 'chapter_01.xhtml'
            self.htmlfile = infile
            self.driver.htmlfile = infile
            self.driver.do_work()
            # Add tex file to tex template
            pattern = r"%###CHAPTERS###"
            sub = r"\include{" + infile.replace( '.xhtml','') + "} \n"
            replaceinfile( work_dir + self.targetTex , pattern, sub + pattern )

            self.get_metadata()          # Sets the attribution values
            self.get_attText2()           # Gets the tex string for front matter (self.attText)

            # Replace in the tex file
            pattern = r"%###TITLE###"
            tarTex = r'ck12_sectionhead.tex'
            replaceinfile( work_dir + tarTex , pattern, self.title )

            pattern = r"%###ATTRIBU###"
            replaceinfile( work_dir + tarTex , pattern, self.attText )

            pattern = r"%###AUTHORS###"
            authortx = r'\begin{center}' + '\n'
            authortx += r'\ckMP{4in}{ \centering {\fontsize{20}{24}\selectfont '
            authortx += self.authors.replace(r';',r' \\ ') + r' \\ }} ' + '\n'
            authortx += r'\end{centering}' + '\n'
            replaceinfile( work_dir + tarTex , pattern, authortx )

            # Include the front matter
            pattern = r"%###BOOKHEAD###"
            newtex = r'\include{ck12_sectionhead}'
            replaceinfile( work_dir + self.targetTex , pattern, newtex )

        # Concept dependent stuff here
        if self.art_type == 'concept':
            ## Only expect one file, lesson.xhtml
            listing = os.listdir(work_dir)
            infile = 'chapter_01.xhtml'
            self.htmlfile = infile
            self.driver.htmlfile = infile
            self.driver.do_work()
            # Add tex file to tex template
            pattern = r"%###CHAPTERS###"
            sub = r"\include{" + infile.replace( '.xhtml','') + "} \n"
            replaceinfile( work_dir + self.targetTex , pattern, sub + pattern )

            self.get_metadata()          # Sets the attribution values
            self.get_attText2()           # Gets the tex string for front matter (self.attText)

            # Replace in the tex file
            pattern = r"%###TITLE###"
            tarTex = r'ck12_concepthead.tex'
            replaceinfile( work_dir + tarTex , pattern, self.title )

            pattern = r"%###ATTRIBU###"
            replaceinfile( work_dir + tarTex , pattern, self.attText )


            pattern = r"%###AUTHORS###"
            authortx = r'\begin{center}' + '\n'
            authortx += r'\ckMP{4in}{ \centering {\fontsize{20}{24}\selectfont '
            authortx += self.authors.replace(r';',r' \\ ') + r' \\ }} ' + '\n'
            authortx += r'\end{centering}' + '\n'
            replaceinfile( work_dir + tarTex , pattern, authortx )

            # Include the front matter
            pattern = r"%###BOOKHEAD###"
            newtex = r'\include{ck12_concepthead}'
            replaceinfile( work_dir + self.targetTex , pattern, newtex )



        # WorkBook dependent stuff here
        if self.art_type == 'workbook':
            ## Only expect one file, lesson.xhtml
            listing = os.listdir(work_dir)
            infile = 'chapter_01.xhtml'
            self.htmlfile = infile
            self.driver.htmlfile = infile
            self.driver.do_work()
            # Add tex file to tex template
            pattern = r"%###CHAPTERS###"
            sub = r"\include{" + infile.replace( '.xhtml','') + "} \n"
            replaceinfile( work_dir + self.targetTex , pattern, sub + pattern )

            # Put copywrite info at end
            pattern = r'%###TAIL###'
            #newtex = r'\include{ck12_copy}
            newtex = r'~\vfill' + '\n'
            newtex = newtex + r'Printed: \today \\' + '\n'
            #newtex = newtex + r'\begin{center}'
            newtex = newtex + r'\includegraphics[width=1in]{flexbooks.jpg} \\' + '\n'
            newtex = newtex + r'\includegraphics[width=1in]{ccbync.png} ' + '\n'
            #newtex = newtex + r'\begin{center}'
            replaceinfile( work_dir + self.targetTex , pattern, newtex )

        # Render the Tex file
        self.make_pdf()

def replaceinfile(file, pattern, subst):
    # Create temp file
    fh, abs_path = mkstemp()
    new_file = codecs.open(abs_path,'w', encoding='utf-8')
    old_file = codecs.open(file,encoding='utf-8')
    for line in old_file:
        new_file.write(line.replace(pattern, subst))
    # Close temp file
    new_file.close()
    close(fh)
    old_file.close()
    # Remove original file
    remove(file)
    # Move new file
    move(abs_path, file)

def has_html_tag(file, tagName):
    """ Given a file and an HTML tagName, parse the file and try to find it.
        return True if tagName is found, False otherwise. """
    try: 
        f = open(file, 'r')
    except Exception as error:
        print (error)
        raise error

    html = f.read()
    f.close()
    soup = BeautifulSoup(html) 
    if not soup.find(tagName):
        return False
    else:
        return True

def fix_concept_html_file(_file):
    """ Given a file, parse it for H1 tags. If no H1 tags are found, then it
        is a concept, otherwise it's a chapter, so do nothing in that case. """
    if not has_html_tag(_file, 'h1'):
        f = open(_file, 'r')
        html = f.read()
        #fbackup = open(_file+".backup", "w+")
        #fbackup.write(html)
        #fbackup.close()
        f.close()
        soup = BeautifulSoup(html)
        title = soup.find('title')['arttype'] = 'concept'
        f = codecs.open(_file, 'w', encoding='utf-8')
        f.write(unicode(soup))
        f.close()
        return True
    else:
        return False 


if __name__ == "__main__":

    USAGE = "Usage: %prog -a <artifact_type[book, chapter, workbook]> -t <template[twocolumn, onecolumn]> -w <workdir>"
    VERSION = "%prog 2.0.0.0"
    DESCRIPTION = "f2pdf is a command line utility to generate PDF from Rosetta 2.0 compliant XHTML"
    threaded = False   # Run a threaded version.. needs to be tested.
    threads = 4
    parser = OptionParser(usage=USAGE,
                              version=VERSION,
                              description=DESCRIPTION)

    parser.add_option("-a",
            "--artifact_type",
            action="store",
            dest="artifactType",
            default="book",
            help="Currently supported artifact types:book, chapter, and workbook")

    parser.add_option("-t",
            "--template",
            action="store",
            dest="template",
            default="onecolumn",
            help="Currently supported templates: twocolumn, onecolumn. For Math books use onecolumn only")

    parser.add_option("-w",
            "--workdir",
            action="store",
            dest="workdir",
            default=None,
            help="Full path to the directory containing the payload")

    parser.add_option("--bw",
            "--grayscale",
            action="store_true",
            dest="bw_render",
            default="False",
            help="Use grayscale or bw to render a PDF in black and white")


    (options, args) = parser.parse_args()
    artifactType = options.artifactType
    template = options.template
    workdir = options.workdir
    if options.bw_render == 'False':
        bw_render = False
    else:
        bw_render = True

    if options.workdir is None:
        parser.error('Error: You need to specify a workdir with the -w flag to proceed further. Exiting...')
    f2pdf = F2PDF()
    f2pdf.run(template, workdir, artifactType,bw_render)

