import sys
from lxml import etree
import os
from optparse import OptionParser

cmdFolder = '/opt/2.0/flx/pylons/flx'
if cmdFolder not in sys.path:
    sys.path.insert(0, cmdFolder)

from flx.lib.unicode_util import UnicodeWriter

class ASNStandardParser(object):
    """
        A sax parser for the lxml module - basically ignores all events
        other than data() and keeps accumulating text content in self.text
        member variable.
    """

    def __init__(self, subject, standardBoardID, outputFile):
        self.text = ''
        self.statement = None
        self.subject = subject
        self.writer = None
        self.standardBoardID = standardBoardID
        self.outputFile = outputFile

    def reset(self):
        self.text = ''

    def getAttribute(self, attrib, key):
        attrib = dict(attrib)
        for k in attrib.keys():
            if k.endswith('}%s' % key):
                value = attrib[k]
                return value
        return None

    def start(self, tag, attrib):
        #print "STARTING Tag: %s, Attributes: %s" % (tag, attrib)
        if tag.endswith('Statement'):
            self.statement = {}
        elif tag.endswith('identifier'):
            if self.statement is not None:
                self.statement['section'] = os.path.basename(self.getAttribute(attrib, 'resource'))
        elif tag.endswith('educationLevel'):
            if self.statement is not None:
                if not self.statement.has_key('grades'):
                    self.statement['grades'] = []
                grade = os.path.basename(self.getAttribute(attrib, 'resource'))
                if grade == 'K':
                    grade = '0'
                self.statement['grades'].append(grade)

    def end(self, tag):
        #print "CLOSING Tag: %s" % tag
        self.text = self.text.strip()

        if tag.endswith('}Statement'):
            self.writeStatement()
            self.statement = None
        elif tag.endswith('}description'):
            if self.statement is not None:
                self.statement['description'] = self.text

        self.text = ''

    def writeStatement(self):
        if not self.writer:
            self.outFileObj = open(self.outputFile, 'wb')
            self.writer = UnicodeWriter(self.outFileObj)
            self.writer.writerow(['STANDARD ID', 'TITLE', 'DESCRIPTION'])
        if self.writer and self.statement:
            stdID = ''
            stdID += '%s.' % self.subject
            stdID += '%s.' % self.standardBoardID
            stdID += '%s.' % ','.join(self.statement['grades'])
            stdID += '%s.' % self.subject
            stdID += '%s' % self.statement['section']
            row = [stdID, self.statement['section'], self.statement['description']]
            print "Writing: %s" % row
            self.writer.writerow(row)

    def data(self, data):
        self.text += data

    def close(self):
        if self.outFileObj:
            self.outFileObj.close()
            print "Wrote: %s" % self.outputFile

SUBJECTS = ['MAT', 'SCI']
if __name__ == '__main__':

    parser = OptionParser()
    parser.add_option("-s", "--subject", dest='subject', help="[MUST] Subject of this mapping - one of %s" % str(SUBJECTS))
    parser.add_option("-b", "--board", dest='boardShortName', help="[MUST] Shortname of the standard board - eg: CA")
    parser.add_option("-i", "--input", dest='inputFile', help="[MUST] Name of the input XML file")
    parser.add_option("-o", "--ouput", dest='outputFile', help="[MUST] Name of the output CSV file")

    (options, args) = parser.parse_args()

    if not options.subject or options.subject not in SUBJECTS:
        raise Exception('Must specify a valid subject: %s' % str(SUBJECTS))

    if not options.boardShortName:
        raise Exception('Must specify a standard board')

    if not options.inputFile or not os.path.exists(options.inputFile):
        raise Exception('Must specify a valid filename for input xml file.')

    if not options.outputFile:
        raise Exception('Must specify a valid filename for output CSV file.')
    content = open(options.inputFile, "r").read()
    parser = etree.XMLParser(target=ASNStandardParser(subject='MAT', standardBoardID='AZ', outputFile=options.outputFile))
    result = etree.XML(content, parser)
    print result

