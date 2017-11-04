#!/usr/bin/python -O
# -*- coding: utf-8 -*-

"""
    This script converts a reverse correlation XHTML to a artifact-standards mapping CSV
"""

from lxml import etree
import re
import csv
import sys
from optparse import OptionParser
import os
from StringIO import StringIO

from parser import *

if __name__ == '__main__':

    parser = OptionParser()
    parser.add_option("-d", "--domain", dest='domain', help="Domain of this mapping - one of %s" % str(DOMAINS))
    parser.add_option("-p", "--provider", dest='provider', help="Provider of this content - eg: CK")
    parser.add_option("-g", "--grades", dest='grades', help="Grades associated with the content - eg: 9 or 9,10,12 or 9-12")
    parser.add_option("-b", "--book", dest='bookSym', help="[MUST] Book symbol for this book - one of %s" % str(sorted(BOOKSYMS)))
    parser.add_option("-c", "--course", dest='courseSym', help="[MUST] Course or strand symbol - one of %s" % str(sorted(COURSESYMS)))
    parser.add_option("-s", "--standard", dest='standard', help="[MUST] Name of the standard - eg: CA")
    parser.add_option("-i", "--input", dest='inputFile', help="[MUST] Name of the input XHTML file")
    parser.add_option("-o", "--ouput", dest='outputFile', help="Name of the output CSV file")

    (options, args) = parser.parse_args()

   
    try:
        if not options.bookSym or not checkSymbol(options.bookSym, BOOKS):
            raise Exception("Unknown book symbol: %s" % options.bookSym)

        if not options.domain:
            options.domain = checkSymbol(options.bookSym, BOOKS)
            print ">>> Guessed domain: %s" % options.domain
            
        if options.domain not in DOMAINS:
            raise Exception("Invalid domain specified: %s" % options.domain)

        if not options.courseSym:
            options.courseSym = options.bookSym
            m = re.match(r'([a-zA-Z]*)[0-9]+$', options.courseSym)
            if m:
                options.courseSym = m.group(1)
            print ">>> Guessed course symbol: %s" % options.courseSym
                
        if not checkSymbol(options.courseSym, COURSES):
            raise Exception("Unknown course symbol: %s" % options.courseSym)

        if not options.provider:
            print ">>> No provider specified. Assuming 'CK'"
            options.provider = 'CK'

        options.provider = options.provider.upper()

        if not options.standard:
            raise Exception("Unknown standard")
        options.standard = options.standard.upper()

        if not options.outputFile:
            if not os.path.exists('output'):
                os.makedirs('output')
            options.outputFile = 'output/%s_%s_%s.csv' % (options.provider, options.bookSym, options.standard)

        if not options.inputFile:
            raise Exception('Input file not specified.')

        if not os.path.exists(options.inputFile):
            raise Exception('Invalid input file: %s' % options.inputFile)

        gradeExp = re.compile(r'\(Grades ([0-9\-]+)\)', re.MULTILINE)
        gradeList = []
        if not options.grades:
            ## Guess the grades
            f = open(options.inputFile, "r")
            lines = [line.strip() for line in f.readlines()]
            f.close()
            contents = " ".join(lines)
            m = gradeExp.search(contents)
            if m:
                options.grades = m.group(1)
                print ">>> Detected grades from input file: %s" % options.grades
            else:
                raise Exception("No grades specified and cannot guess grades from inputFile")

        if "," in options.grades:
            gradeList = grades.split(",")
        elif "-" in options.grades:
            parts = options.grades.split("-")
            if len(parts) == 2:
                gradeList = range(int(parts[0]), int(parts[1])+1)
            else:
                raise Exception("Invalid grade list specified: %s" % str(options.grades))
        else:
            gradeList = [options.grades,]
    except Exception, e:
        print ">>> ERROR: ", e
        parser.print_help()
        raise e

    tree = etree.parse(open(options.inputFile, "r"), etree.HTMLParser())
    ## Get the rows of table with border 1 from the HTML - this is correlation table
    r = tree.xpath("/html/body/table[@border='1']/tbody/tr")
    print len(r)

    xhtmlParser = XHTMLContentParser()
    contentParser = etree.HTMLParser(target=xhtmlParser)
    pairs = []
    ## Process all table rows of type 'Table2'
    for item in r:
        tds = item.getchildren()
        if len(tds) == 2:
            ## Only process rows with 2 children 
            ## others have colspans specified and are not useful
            xmlSnippet = etree.tostring(tds[0], pretty_print=False)

            ## Get only the paragraph element's text - this should have the chapter.lesson
            xhtmlParser.reset()
            left = etree.parse(StringIO(xmlSnippet), contentParser)
            print "Left: [%s]" % left,

            right = []
            for child in tds[1].getchildren():
                xhtmlParser.reset()
                xmlSnippet = etree.tostring(child, pretty_print=False)
                right.append(etree.parse(StringIO(xmlSnippet), contentParser))
            print "\t\tRight: [%s]" % "\n".join(right)
            pairs.append((left, right))

    f = open(options.outputFile, "w")
    writer = csv.writer(f)
    writer.writerow(["LESSON ID", "STANDARD ID"])
    for (left, right) in pairs:
        m = sectionExp.match(left)
        if m:
            ## Get the chapter.lesson combo
            chlsn = m.group(1)
            chapter, lesson = chlsn.split('.', 1)
            leftCol = '%s.%s.%s' % (getBookEID(options.bookSym, BOOKS), chapter, lesson)
            for item in right:
                m = sectionExp.match(item)
                if m:
                    sectionNum = m.group(1)
                    rightCol = '%s.%s.%s.%s.%s' % (options.domain, options.standard, options.grades, options.courseSym, sectionNum)
                    writer.writerow([leftCol.strip('.'), rightCol.strip('.')])
                else:
                    print ">>> WARNING: No match for sectionExp on right: %s" % right
        else:
            print ">>> WARNING: No match for sectionExp on left: %s" % left
    f.close()
    print ">>> Wrote output to %s" % options.outputFile
