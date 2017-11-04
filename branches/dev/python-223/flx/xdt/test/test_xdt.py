import unittest
import os
import sys, cStringIO, traceback

import clr
import System
from System.Text import StringBuilder
from System.IO import DirectoryInfo, File, FileInfo, Path, StreamWriter
    
clr.AddReference("Microsoft.Office.Interop.Word")

import Microsoft.Office.Interop.Word as Word

from openxml.todocx import generateDocx
from openxml.todocx.xhtml import xhtmlparser
from openxml.fromdocx import parseDocx

dir = os.path.dirname(__file__)

class XdtTests(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.capture = True
        ## Capture output
        if cls.capture:
            cls.c1 = cStringIO.StringIO()
            cls.c2 = cStringIO.StringIO()
            cls.stdout = sys.stdout
            cls.stderr = sys.stderr
            sys.stdout = cls.c1
            sys.stderr = cls.c2

    @classmethod
    def tearDownClass(cls):
        global output, error
        if cls.capture:
            ## Release output
            sys.stdout = cls.stdout
            sys.stderr = cls.stderr
    
            output = cls.c1.getvalue()
            error = cls.c2.getvalue()

            outfile = open(os.path.join(dir, "test.out"), "w")
            if output:
                outfile.write(u'%s' % output.encode('utf-8'))
                outfile.write("\n\n")
            outfile.close()

            errfile = open(os.path.join(dir, "test.err"), "w")
            if error:
                errfile.write(u'%s' % error.encode('utf-8'))
                errfile.write("\n\n")
            errfile.close()

    def setUp(self):
        self.dir = os.path.dirname(__file__)
        print "##########################################"
        print "[BEGIN] Test: %s" % self.id()
        print "##########################################"

    def tearDown(self):
        print "##########################################"
        print "[END] Test: %s" % self.id()
        print "##########################################"
        print ""

    def __openInWord(self, filename):
        document = None
        word_application = None
        try:
            word_application = Word.ApplicationClass()
            word_application.visible = False

            document = word_application.Documents.Open(filename, False, NoEncodingDialog=True)

        except Exception, e:
            self.assertTrue(False, "Exception occured in opening the word doc: %s" % str(e))
        finally:
            if document:
                document.Close()
                document = None
        
            if word_application:
                print "Quitting word!"
                word_application.Quit()
                word_application = None

    def __convert2Docx(self, xhtml, docx):
        if os.path.exists(docx):
            os.remove(docx)

        self.assertTrue(os.path.exists(xhtml), "Xhtml input does not exist")
        self.assertFalse(os.path.exists(docx), "Could not delete target docx: %s" % docx)

        warnings = generateDocx.generateDocx(xhtml, docx)

        self.assertTrue(os.path.exists(docx), "Could not create docx: %s" % docx)

        print "Warnings: %s" % warnings
        self.__openInWord(os.path.abspath(docx))

    def __validateXhtml(self, xhtml):
        parser = xhtmlparser.XHTMLParser(xhtml)
        nodes = parser.getProcessableNodes()
        self.assertTrue(nodes, "Error validating xhtml: %s" % xhtml)

    def __convert2Xhtml(self, docx, xhtml):
        if os.path.exists(xhtml):
            os.remove(xhtml)

        self.assertTrue(os.path.exists(docx), "Docx input does not exist")
        self.assertFalse(os.path.exists(xhtml), "Could not delete target xhtml: %s" % xhtml)

        translator = parseDocx.Docx2Xhtml()
        translator.userId = 1
        translator.login = 'admin'
        xhtmlStr = translator.translateDocx(docx)
        file = open(xhtml, 'w')
        file.write(xhtmlStr.encode('utf-8'))
        file.close()


        self.assertTrue(os.path.exists(xhtml), "Could not create xhtml: %s" % xhtml)

        warnings = translator.getWarnings()
        print "Warnings: %s" % warnings
        self.__validateXhtml(os.path.abspath(xhtml))

    def test_01_xhtml2Docx(self):
        xhtml = os.path.join(self.dir, "1.xhtml")
        docx = os.path.join(self.dir, "1.docx")
        self.__convert2Docx(xhtml, docx)

    def test_02_xhtml2DocxMath(self):
        xhtml = os.path.join(self.dir, "better_sample.xhtml")
        docx = os.path.join(self.dir, "better_sample.docx")
        self.__convert2Docx(xhtml, docx)

    def test_03_xhtml2DocxVideo(self):
        xhtml = os.path.join(self.dir, "video.xhtml")
        docx = os.path.join(self.dir, "video.docx")
        self.__convert2Docx(xhtml, docx)

    def test_04_docx2Xhtml(self):
        xhtml = os.path.join(self.dir, "1_out.xhtml")
        docx = os.path.join(self.dir, "1.docx")
        self.__convert2Xhtml(docx, xhtml)

    def test_05_docx2XhtmlMath(self):
        xhtml = os.path.join(self.dir, "better_sample_out.xhtml")
        docx = os.path.join(self.dir, "better_sample.docx")
        self.__convert2Xhtml(docx, xhtml)

    def test_06_docx2XhtmlVideo(self):
        xhtml = os.path.join(self.dir, "video_out.xhtml")
        docx = os.path.join(self.dir, "video.docx")
        self.__convert2Xhtml(docx, xhtml)

    def test_07_docxWithImage(self):
        xhtml = os.path.join(self.dir, "imagetest.xhtml")
        docx = os.path.join(self.dir, "imagetest.docx")
        self.__convert2Xhtml(docx, xhtml)

    def test_08_textVariations(self):
        xhtml = os.path.join(self.dir, "textvariations.xhtml")
        docx = os.path.join(self.dir, "textvariations.docx")
        self.__convert2Xhtml(docx, xhtml)

    def test_09_colors(self):
        xhtml = os.path.join(self.dir, "colors.xhtml")
        docx = os.path.join(self.dir, "colors.docx")
        self.__convert2Docx(xhtml, docx)

    def test_10_elementbox(self):
        xhtml = os.path.join(self.dir, "elementbox.xhtml")
        docx = os.path.join(self.dir, "elementbox.docx")
        self.__convert2Xhtml(docx, xhtml)
        self.__convert2Docx(xhtml, docx)

    def test_11_imagelinks(self):
        xhtml = os.path.join(self.dir, "linkimage.xhtml")
        docx = os.path.join(self.dir, "linkimage.docx")
        self.__convert2Docx(xhtml, docx)
        self.__convert2Xhtml(docx, xhtml)

if __name__ == '__main__':
    unittest.main()


