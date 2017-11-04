from xml.sax import saxutils, handler, make_parser
import logging
import traceback

log = logging.getLogger(__name__)

class XHTMLParser(handler.ContentHandler):
    """
        Slow SAX parser based on xml.sax
        Consider using the lxmlparser.XHTMLContentParser instead
        It is a lot faster
    """

    def __init__(self):
        handler.ContentHandler.__init__(self)
        self.text = ""
    
    def startElement(self, name, attrs):
        log.debug("Starting %s" % name)

    def endElement(self, name):
        log.debug("Ending: %s" % name)

    def ignorableWhitespace(self, whitespace):
        log.debug("Encountered ignorableWhitespace")

    def characters(self, content):
        self.text += content

    def getText(self):
        return self.text

class ForgivingErrorHandler(handler.ErrorHandler):

    def error(self, exception):
        log.error(exception)
        log.error(traceback.format_exc())

    def fatalError(self, exception):
        log.error(exception)
        log.error(traceback.format_exc())

    def warning(self, exception):
        log.error(exception)
        log.error(traceback.format_exc())
