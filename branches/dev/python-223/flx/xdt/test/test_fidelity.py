from openxml.todocx import docxgenerator
from openxml.todocx.xhtml import xhtmlparser
from openxml.fromdocx import parseDocx

import os

dir = os.path.dirname(__file__)
xdtdir = os.path.abspath(os.path.dirname(dir))

if __name__ == '__main__':

    inputDocbook = os.path.join(xdtdir, 'concept.xhtml')

    parser = xhtmlparser.XHTMLParser(inputDocbook)
    nodes = parser.getProcessableNodes()

    ## Create gold file
    goldfile = os.path.join(dir, 'gold')
    f = open(goldfile, "w")
    for node in nodes:
        f.write('%s\n' % node)
    f.close()

    ## Convert to docx
    docxPath = os.path.join(dir, 'output.docx')
    if os.path.exists(docxPath):
        os.remove(docxPath)

    if nodes:
        generator = docxgenerator.DocxGenerator(filename=docxPath)
        generator.processNodes(nodes)
        generator.writeDocument()

        if generator.warnings:
            for warning in generator.warnings:
                print "!!! WARNING: %s" % warning
    else:
        raise Exception('PHASE 1: Empty nodes list from parser')

    if os.path.exists(docxPath):
        print "Starting phase 3"
        translator = parseDocx.Docx2Xhtml()
        xhtml = translator.translateDocx(docxPath)
        xhtml2path = docxPath.replace('.docx', '.xhtml')
        file = open(xhtml2path, 'w')
        file.write(xhtml.encode('utf-8'))
        file.close()

    testfile = os.path.join(dir, 'test.txt')
    if os.path.exists(xhtml2path):
        ## Create test file
        parser = xhtmlparser.XHTMLParser(xhtml2path)
        nodes = parser.getProcessableNodes()
        if not nodes:
            raise Exception('Phase 3: Empty node list from parser')
        f = open(testfile, "w")
        for node in nodes:
            f.write('%s\n' % node)
        f.close()

    if os.path.exists(testfile) and os.path.exists(goldfile):
        os.system('diff.exe %s %s' % (goldfile, testfile))

 
