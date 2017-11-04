# -*- coding: utf-8 -*-

import sys
import os
import clr
import System
clr.AddReference("Microsoft.Office.Interop.Word")

import shutil

import Microsoft.Office.Interop.Word as Word

class MacroRunner(object):

    def __init__(self, docpath, macro):
        if not os.path.exists(docpath):
            raise Exception('Invalid document path: %s' % docpath)
        print "Document: %s" % docpath
        self.docpath = docpath
        self.macro = macro

    def run(self):
        word_application = Word.ApplicationClass()
        word_application.visible = False
        document = None
        try:
            document = word_application.Documents.Open(self.docpath)
            #document = word_application.Documents.Open(self.docpath, False, True, False, None, None, None, None, None, None, None, False, True, None, True, None)
            if document:		
                ## Select all
                document.Select()
                ## Run macro
                word_application.Run(self.macro)
            else:
                raise Exception("Could not open document: %s" % self.docpath)
        except Exception, e:
            print "ERROR: Error running macro: %s. Does the macro exist?" % self.macro
            raise e
        finally:
            try:
                if document:
                    document.Close()
                if word_application:
                    print "Quitting word!"
                    word_application.Quit()
            except:
                pass

if __name__ == '__main__':
    mr = MacroRunner('C:\\Users\\Nimish\\Documents\\math.docx', 'MTCommand_TeXToggle')
    mr.run()
