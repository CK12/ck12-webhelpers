# -*- coding: utf-8 -*-

import sys
import os
import clr
import System
from System.Text import StringBuilder
from System.IO import DirectoryInfo, File, FileInfo, Path, StreamWriter, FileStream, FileMode

sys.path.append(os.path.abspath(os.path.dirname(os.path.dirname(__file__))))
    
clr.AddReference("System.Drawing")
clr.AddReference("DocumentFormat.OpenXml")

from System import Array, Byte
import System.Drawing.Image as DImage
from DocumentFormat.OpenXml import WordprocessingDocumentType, SpaceProcessingModeValues, OpenXmlElement
from DocumentFormat.OpenXml.Packaging import *
from DocumentFormat.OpenXml.Wordprocessing import *
import DocumentFormat.OpenXml.Drawing as d
import DocumentFormat.OpenXml.Drawing.Wordprocessing as dw
import DocumentFormat.OpenXml.Drawing.Pictures as pic

from openxml.todocx.styles import *
from openxml.todocx.xhtml.xhtmlparser import XHTMLParser
from openxml.todocx.docxgenerator import DocxGenerator

def generateDocx(xhtml, docx):
    parser = XHTMLParser(xhtml)
    nodes = parser.getProcessableNodes()
    if nodes:
        generator = DocxGenerator(filename=docx)
        generator.processNodes(nodes)
        generator.writeDocument()

        return generator.warnings
    return None

if __name__ == '__main__':

    docx = None
    xhtml = None
    if len(sys.argv) > 1:
        xhtml = sys.argv[1]
    if len(sys.argv) > 2:
        docx = sys.argv[2]

    if not xhtml:
        xhtml = "concept.xhtml"
    if not docx:
        docx = "xhtml.docx"
    
    warnings = generateDocx(xhtml, docx)
    warningFile = docx + '.warn'
    f = open(warningFile, 'w')
    if warnings:
        print "!!!!!!!!!! WARNINGS !!!!!!!!!!!"
        for warning in warnings:
            print "!!! WARN: %s" % warning
            f.write('%s\n' % warning.encode('utf-8'))
    f.close()

    print "Saved document %s" % docx

