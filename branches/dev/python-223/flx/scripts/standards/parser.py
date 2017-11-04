# -*- coding: utf-8 -*-

import re

DOMAINS = ["MAT", "SCI"]
BOOKS = {
        "MAT": {
            "ALG1":      "CK.MAT.ENG.SE.1.Algebra-I",
            "CAL":       "CK.MAT.ENG.SE.1.Calculus",
            "GEO":       "CK.MAT.ENG.SE.1.Geometry",
            "PSADV":     "CK.MAT.ENG.SE.1.Prob-&-Stats-Adv",
            "PSBSC":     "CK.MAT.ENG.SE.1.Prob-&-Stats-Basic-(Short-Course)", #"CK-12 Basic Probability and Statistics - A Short Course",
            "TRG":       "CK.MAT.ENG.SE.1.Trigonometry", #"Trigonometry",
            "MAT6":      "CK.MAT.ENG.SE.1.Math-Grade-6",
            "MAT7":      "CK.MAT.ENG.SE.1.Math-Grade-7",
            "ALG12e":    "CK.MAT.ENG.SE.2.Algebra-I",
            "BSCALG":    "CK.MAT.ENG.SE.1.Algebra-Basic",
            "BSCGEO":    "CK.MAT.ENG.SE.1.Geometry-Basic",
            "GEO2e":     "CK.MAT.ENG.SE.2.Geometry",
        },
        "SCI": {
            "BIO1":      "CK.SCI.ENG.SE.1.Biology-I-Honors",
            "CHE":       "CK.SCI.ENG.SE.1.Chemistry",
            "ESC":       "CK.SCI.ENG.SE.1.Earth-Science-HS", #"CK-12 Earth Science",
            "LSC":       "CK.SCI.ENG.SE.1.Life-Science-MS", #"CK-12 Life Science",
            "ESCMS":     "CK.SCI.ENG.SE.1.Earth-Science-MS",
        },
        "ENG": {
        },
        "TECH": {
        }
    }

BOOKSOLD = {
        "MAT": {
            "ALG1":      "Algebra I",
            "CAL":       "CK-12 Calculus",
            "GEO":       "Geometry",
            "PSADV":     "CK-12 Advanced Probability and Statistics",
            "PSBSC":     "CK-12 Basic Probability and Statistics - A Short Course",
            "TRG":       "Trigonometry",
        },
        "SCI": {
            "BIO1":      "Biology I",
            "CHE":       "CK-12 Chemistry",
            "ESC":       "CK-12 Earth Science",
            "LSC":       "CK-12 Life Science",
        },
        "ENG": {
        },
        "TEC": {
        }
    }

BOOKSYMS = []
for dom in BOOKS.keys():
    BOOKSYMS.extend(BOOKS[dom].keys())

COURSES = {
        "MAT": {
            "ALG":       "Algebra",
            "GEO":       "Geometry",
            "CAL":       "Calculus",
            "PSADV":     "Advanced Probability and Statistics",
            "PSBSC":     "Basic Probability and Statistics",
            "TRG":       "Trigonometry",
            "MAT":       "Mathematics",
        },
        "SCI": {
            "BIO":       "Biology",
            "CHE":       "Chemistry",
            "ESC":       "Earth Science",
            "LSC":       "Life Science",
            "SCI":       "Science",
        }
    }

COURSESYMS = []
for dom in COURSES:
    COURSESYMS.extend(COURSES[dom].keys())

exp = re.compile(r'[\s ]+')
sectionExp = re.compile(r'([0-9a-zA-Z_\-]+\.[0-9a-zA-Z_\-\.]*)(.*)$')

class XHTMLContentParser(object):
    """
        A sax parser for the lxml module - basically ignores all events
        other than data() and keeps accumulating text content in self.text
        member variable.
    """

    def __init__(self):
        self.text = ''

    def reset(self):
        self.text = ''

    def start(self, tag, attrib):
        pass

    def end(self, tag):
        pass

    def data(self, data):
        self.text += data

    def close(self):
        text = self.text
        text = text.replace("\n", " ")
        text = text.replace(u'Â', '')
        text = exp.sub(' ', text)
        text = exp.sub(' ', text)
        return text.strip().encode('utf-8')

def getText(node, recursive=True):
    """
        Get text recursively from a node and its children
        If recursive is False, only process the node itself and return
        Returns text as list of text elements - one element per node processed
    """
    text = []
    nodes = [node,]
    while len(nodes) > 0:
        node = nodes.pop(0)
        if recursive:
            for child in node.getchildren():
                nodes.insert(0, child)
        if node.text:
            t = node.text.strip()
            if t:
                text.append('%s' % t)
    i = 0
    while i < len(text):
        text[i] = text[i].replace("\n", " ")
        text[i] = text[i].replace(u'Â', '')
        text[i] = exp.sub(' ', text[i])
        text[i] = exp.sub(' ', text[i])
        i += 1
    return text

def checkSymbol(bookSym, dict):
    if bookSym:
        for domain in dict.keys():
            if bookSym in dict[domain].keys():
                return domain
    return False

def getBookEID(bookSym, dict):
    if bookSym:
        for domain in dict.keys():
            if bookSym in dict[domain].keys():
                return dict[domain][bookSym]
    return False
