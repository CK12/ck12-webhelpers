from lxml import etree
from pylons.i18n.translation import _ 
from StringIO import StringIO
import logging
import logging.handlers

import flx.lib.helpers as h

logger = logging.getLogger(__name__)

## Initialize logging
def initLog():
    LOG_FILENAME = "/tmp/rosetta-validation.log"
    logger = logging.getLogger(__name__)
    logger.setLevel(logging.INFO)
    handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=10*1024*1024, backupCount=5)
    logger.addHandler(handler)
    return logger

class XhtmlValidator:

    def __init__(self, xsdFile, useFilename=False):
        global logger
        self.log = logger
        self.log.debug("Loading schema: %s" % xsdFile)
        self.schema = self._loadSchema(xsdFile, useFilename=useFilename)
        self.log.debug("Loaded schema!")
        self.errors = []

    def _loadSchema(self, xsdFile, useFilename=False):
        f = None
        try:
            self.log.debug("Parsing schema ...")
            if not useFilename:
                f = open(xsdFile)
                schema = etree.XMLSchema(file=f)
            else:
                schema = etree.XMLSchema(file=xsdFile)
            self.log.debug("Parsed schema!")
        finally:
            if f:
                f.close()
        return schema

    def validate(self, xhtml):
        try:
            htmlParser = etree.XMLParser()
            doc = etree.parse(StringIO(xhtml), htmlParser)
            if not self.schema.validate(doc):
                if self.schema.error_log:
                    for err in self.schema.error_log:
                        errL = str(err).lower()
                        skip =  'attribute \'id\' is required but missing' in errL or \
                                'attribute \'title\' is required but missing' in errL or \
                                ('attribute \'id\'' in errL  and 'x-ck12-' in errL and 'not a valid value of the atomic type \'xs:id\'' in errL) or \
                                ('missing child element' in errL and 'tfoot,' in errL and 'tbody,' in errL)
                        if skip:
                            self.log.warn("Skipping Rosetta Validation Error: %s" % str(err))
                            continue
                        self.log.warn("Unacceptable rosetta validation error: %s" % str(err))
                        self.errors.append(str(err))
        except Exception as e:
            #self.log.error("Error validating xhtml: %s" % str(e), exc_info=e)
            #self.log.error(xhtml)
            raise h.InvalidRosettaException(str(e))
        return len(self.errors) == 0

if __name__ == '__main__':
    import optparse

    xsdFile = '/opt/2.0/flx/pylons/flx/flx/templates/flx/rosetta/2_0.xsd'
    xhtmlFiles = []

    parser = optparse.OptionParser('%prog [options]')
    parser.add_option(
        '-x', '--xsd-file', dest='xsdFile', default=xsdFile,
        help='The schema file.'
    )
    parser.add_option(
        '-c', '--content-file', dest='xhtmlFiles', default=xhtmlFiles,
        action='append',
        help='The xhtml file to be validated. Can be specified multiple times.'
    )
    options, args = parser.parse_args()
    if args:
        parser.error('Expected no arguments. Got %r' % args)

    xsdFile = options.xsdFile
    xhtmlFiles = options.xhtmlFiles
    if len(xhtmlFiles) == 0:
        print 'Error: No xhtml file provided for validation.'
        exit(0)

    try:
        xv = XhtmlValidator(xsdFile)
    except Exception, e:
        print 'Schema file error: %s' % e

    for xhtmlFile in xhtmlFiles:
        errors = None
        try:
            f = open(xhtmlFile, 'r')
            xhtml = f.read()
            f.close()
            if not xv.validate(xhtml):
                errors = xv.errors
                raise Exception((_(u'Errors in validation')).encode("utf-8"))
        except Exception, e:
            print 'Validate %s failed: %s' % (xhtmlFile, e)
            if errors:
                for err in errors:
                    print "\t\t%s" % err
