WARNINGS = []

class DocxTranslator(object):

    def addWarning(self, warning):
        global WARNINGS
        WARNINGS.append(warning)

    def getWarnings(self):
        global WARNINGS
        return WARNINGS

