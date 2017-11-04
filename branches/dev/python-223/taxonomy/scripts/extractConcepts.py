#!/usr/bin/python

import MySQLdb
import re
import htmlentitydefs
import sys
import os
from tempfile import NamedTemporaryFile
import logging
import csv

mydir = os.path.abspath(os.path.dirname(__file__))
stsdir = os.path.join(os.path.dirname(mydir), 'pylons', 'sts')
sys.path.append(stsdir)

from sts.lib.unicode_util import UnicodeWriter

subject = None
branch = None
bookName = None
outfile = None

log = logging.getLogger(__file__)

LOG_FILENAME = "/tmp/extract_concepts.log"
## Initialize logging
try:
    logging.basicConfig(format="%(asctime)-15s %(levelname)-4s %(message)s", filename=LOG_FILENAME)
    log = logging.getLogger(__file__)
    log.setLevel(logging.INFO)
    handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=10*1024*1024, backupCount=5)
    log.addHandler(handler)
except:
    pass

ARGLIST = [ 
        ('2537', 'SCI', 'BIO'),
        ('2541', 'SCI', 'CHE'),
        ('3659', 'MAT', 'ALG'),
        ('3461', 'MAT', 'GEO'),
        ('2965', 'SCI', 'ESC'),
        ('2410', 'MAT', 'TRI'),
        ('2988', 'MAT', 'APS'),
        ('2536', 'SCI', 'LSC'),
        ('806',  'MAT', 'CAL'),
    ]

mainSkipList = [
        u'glossary', u'objective', u'summary', u'vocabulary', u'review questions', 
        u'think critically', u'apply concepts', u'introduction', u'points to consider',
        u'further reading', u"review answers", u'multimedia resources', u'multimedia links',
        u'check your understanding', u'supplemental links', u'learning objectives', u'chapter review',
        u'chapter summary',
    ]

additionalSkipLists = {
        'SCI': [
            u'scientific ways of thinking', 'the scientific method',
        ],
        'MAT': [
            u'additional resources', u'texas instruments resources', u'further practice',
            u'solve real-world problems', u'solving real-world problems',
            u'review queue', u'defining terms', u'to summarize', u'point to consider', 
        ],
    }

titleSkipList = []

"""
    Script to extract concepts from 1.x flexbook system by
    parsing the docbook
"""

def getDBConnection():
    conn = MySQLdb.connect(host = "localhost", user = "dbadmin", passwd = "D-coD#43", db = "flexr", use_unicode=True, charset='utf8')
    return conn

def getBookByID(bookID):
    conn = getDBConnection()
    cursor = None
    try:
        cursor = conn.cursor()
        cursor.execute("select flexbook_title from flexbook where flexbook_id = %s and teacher_edition = 0 and flexbook_by_ck12 = 1 and flexbook_userid = 1504" % (bookID, ))
        row = cursor.fetchone()
        if not row:
            return None
        bookTitle = unescape(row[0])
        return bookTitle
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def processChapters(bookID):
    conn = getDBConnection()
    cursor = None
    try:
        cursor = conn.cursor()
        cursor.execute("select chapter_title, chapter_body from flexbook_chapter fch, flexbook_contents fcon where fch.chapter_id = fcon.chapter_id and fcon.flexbook_id = %s order by fcon.zorder" % (bookID, ))
        rows = cursor.fetchall()
        for row in rows:
            log.info('Chapter title: %s' % row[0])
            title = unescape(row[0].strip())
            body = row[1]
            docbook = NamedTemporaryFile(suffix=".docbook", delete=False)
            docbook.write(body)
            docbook.close()
            processConcepts(title, docbook.name)
            #break
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

##
# Removes HTML or XML character references and entities from a text string.
# Source: http://effbot.org/zone/re-sub.htm#unescape-html
#
# @param text The HTML (or XML) source text.
# @return The plain text, as a Unicode string, if necessary.

def unescape(text):
    def fixup(m):
        text = m.group(0)
        if text[:2] == "&#":
            # character reference
            try:
                if text[:3] == "&#x":
                    return unichr(int(text[3:-1], 16))
                else:
                    return unichr(int(text[2:-1]))
            except ValueError:
                pass
        else:
            # named entity
            try:
                text = unichr(htmlentitydefs.name2codepoint[text[1:-1]])
            except KeyError:
                pass
        return text # leave as is
    return re.sub("&#?\w+;", fixup, text)

def extractSections(str, chapterName):
    titles = [subject, branch, bookName, chapterName, "", chapterName, "", "", ""]
    outfile.writerow(titles)
    titles[-4] = ''
    sectionExp = re.compile(r'<sect(1|2|3)><title>([^<>]*)</title>')
    skipTill = None
    for m in sectionExp.finditer(str):
        if m:
            sectionNum = int(m.group(1))
            title = m.group(2).strip()
            if skipTill and sectionNum > skipTill:
                log.info("Skipping this section: %s level: %d till: %d" % (title, sectionNum, skipTill))
                continue
            else:
                skipTill = None
            titleL = title.lower()
            for skip in titleSkipList:
                if skip == titleL:
                    skipTill = sectionNum
                    log.info("Skipping title: %s till section number: %d (Current section: %d)" % (title, skipTill, sectionNum))
                    break
            if skipTill:
                if branch == 'APS':
                    skipTill = None
                continue
            titles[sectionNum-4] = unescape(title).strip()
            log.info("Section #%s: %s" % (m.group(1), m.group(2)))
            log.info("Sections array: %s" % titles)
            outfile.writerow(titles)
            titles[sectionNum-4] = ''

def processConcepts(chapterName, docbook):
    log.info("Got chapter: %s with docbook saved in: %s" % (chapterName, docbook))
    try:
        chapterNameL = chapterName.lower()
        for skip in titleSkipList:
            if skip == chapterNameL:
                log.info("Skipping chapter: %s" % chapterName)
                return
        f = open(docbook, "r")
        startAt = 0
        currentLevel = 1
        str = f.read()
        extractSections(str, chapterName)
        f.close()
    finally:
        os.remove(docbook)


def printUsage():
    print "Usage: %s <bookID> <subject> <branch>" % (sys.argv[0])
    print "     OR"
    print "       %s auto" % sys.argv[0]

def runForBook(bookID, subject, branch):
    global outfile, titleSkipList, bookName, mainSkipList, additionalSkipLists
    titleSkipList = mainSkipList[:]
    if additionalSkipLists.has_key(subject):
        titleSkipList.extend(additionalSkipLists[subject])

    bookName = getBookByID(bookID)
    if bookName:
        outf = open(os.path.join("output", "%s.%s.%s.csv" % (subject, branch, bookName.replace(" ", "-"))), "wb")
        try:
            outfile = UnicodeWriter(outf)
            outfile.writerow(["subject", "branch", "book", "chapter", "Encode ID", "Level 1", "Level 2", "Level 3", "Level 4"])
            processChapters(bookID)
            log.info("Wrote CSV file: %s" % outf.name)
        finally:
            if outf:
                outf.close()
    else:
        log.error("Could not find a CK-12 book by id: %s" % bookID)
        raise Exception("Could not find a CK-12 book by id: %s" % bookID)


if __name__ == '__main__':
    if len(sys.argv) == 2:
        auto = sys.argv[1]
        if auto == 'auto':
            for bookID, subject, branch in ARGLIST:
                try:
                    runForBook(bookID, subject, branch)
                except Exception, e:
                    log.error("Error extracting concepts for book: %s subject: %s branch: %s" % (bookID, subject, branch), exc_info=e)

    elif len(sys.argv) == 4:
        bookID = sys.argv[1]
        subject = sys.argv[2]
        branch = sys.argv[3]
        if not subject or not branch:
            printUsage()
            raise Exception("Must specify subject and branch")

        runForBook(bookID, subject, branch)

    else:
        printUsage()
        sys.exit(1)

