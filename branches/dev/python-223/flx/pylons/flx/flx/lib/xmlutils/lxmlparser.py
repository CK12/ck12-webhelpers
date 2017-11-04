from lxml import etree

class XHTMLContentParser(object):
    """
        A sax parser for the lxml module - basically ignores all events
        other than data() and keeps accumulating text content in self.text
        member variable.
    """

    def __init__(self):
        self.text = u''

    def start(self, tag, attrib):
        pass

    def end(self, tag):
        pass

    def data(self, data):
        self.text += data

    def close(self):
        return self.text #.encode('utf-8')


def getTextContent(cleanXhtmlFile):
    """
        Get the text content of all nodes using the very efficient 
        iterparse method.
        Unfortunately, this does not work as just tracking the "end" event is 
        not sufficient for generating coherent data. We need track the data event
        as shown in the parse above. But iterparse does not support this.
    """
    text = ''
    context = etree.iterparse(cleanXhtmlFile, events=('end',), html=True, remove_blank_text=True)
    for event, elem in context:
        if elem.text:
            text += elem.text #.encode('utf-8')
        elem.clear()
    return text

