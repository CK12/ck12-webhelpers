import sys
import os
import clr
import logging
import System
from System.Text import StringBuilder
from System.IO import DirectoryInfo, File, FileInfo, Path, StreamWriter

log = logging.getLogger(__name__)
    
clr.AddReference("DocumentFormat.OpenXml")

from System import Array, Byte
from DocumentFormat.OpenXml import WordprocessingDocumentType
from DocumentFormat.OpenXml.Packaging import *
from DocumentFormat.OpenXml.Wordprocessing import *

from openxml.common import genURLSafeBase64Encode
from openxml.fromdocx.translator import DocxTranslator
from openxml.fromdocx.baseTranslator import BaseTranslator

class TableTranslator(DocxTranslator):

    def __init__(self, mainPart, userId, login, token):
        self.userId = userId
        self.login = login
        self.token = token
        self.tab = ""
        self.id = ""
        self.title = ""
        self.caption = ""
        self.table = None
        self.hasHeader = False
        self.hasHeaderClosing = False
        self.hasBody = False
        self.rowCount = 0
        self.mainPart = mainPart
        self.bt = BaseTranslator(self.mainPart, self.userId, self.login, self.token)
        self.borderType = "0"
        self.floating = "x-ck12-nofloat"
            
    def addTableElement(self, element):
        self.table = element

    def addTitle(self, element):
        """
            See if we can find table caotpion as a property
            of the TableProperties element
        """
        title = ""
        try :
            title = element.TableCaption.Val.ToString()
        except Exception, e:
            log.warn("Found table properties, but with no caption")
        
        if title and title.strip():
            self.title = ' summary="%s"' % title.strip()

    def findBorderType(self, element, recurse=True):
        """
            Detect if the table is with or without borders.
            We check all the borders for the table - 
            if even one of them is a visible border, we will 
            make the table with borders. Otherwise, borderless.
        """
        try:
            borders = element.TableBorders
            for child in borders.ChildElements:
                if child.GetType().ToString().endswith('Border'):
                    if child.Val not in [BorderValues.Nil, BorderValues.None]:
                        self.borderType = "1"
                        log.info("Table has gridlines: %s" % child.Val.ToString())
                        break
        except Exception, e:
            if not recurse:
                return
            try:
                for d in element.ChildElements:
                    if d.GetType().ToString().endswith('TableStyle'):
                        tblStyle = d.Val.ToString()
                        log.info("Found TableStyle: %s" % tblStyle)
                        ## Look for this style in the StyleDefinitionsPart
                        for style in self.mainPart.StyleDefinitionsPart.Styles.ChildElements:
                            if style.GetType().ToString().endswith('Style') and style.StyleId.ToString() == tblStyle:
                                log.info("Found style with id: %s" % tblStyle)
                                for c in style.ChildElements:
                                    if c.GetType().ToString().endswith('TableProperties'):
                                        log.info("Trying to get borders once again ...")
                                        self.findBorderType(c, recurse=False)
                                        return
                                return
            except Exception, ee:
                self.addWarning("Could not find borders for table. Assuming no borders.")
                log.warn("Could not find borders for table. Assuming no borders.")

    def detectFloating(self, element):
        """
            Detect if this table is a floating table
            The presence of a TablePositionProperties element
            within the TableProperties element makes the table float in a document.
            http://msdn.microsoft.com/en-us/library/documentformat.openxml.wordprocessing.tablepositionproperties.aspx
        """
        try:
            if element.TablePositionProperties:
                self.floating = "x-ck12-float"
        except:
            log.info("Could not find TablePositionProperties within TableProperties. Assuming nofloat")

    def addCaption(self, element):
        self.caption = '<caption>%s</caption>\n' % element.LastChild.InnerText
        
    def translateTable(self):
        log.info("translate Table ")
        self.tab =""
        self.innerText = ""
        childList = self.table.ChildElements
        for child in childList:
            type = child.GetType().ToString()
            log.info("type of table child: %s" %type)
            if type.rfind('TableRow') >= 0 :
                self.innerText += self.translateTableRow(child)
            elif type.rfind('TableProperties') >0:
                log.info("DEBUG: table properties")
                self.addTitle(child)
                self.findBorderType(child)
                self.detectFloating(child)
            elif type.rfind('BookmarkStart') >0:
                log.info("DEBUG: Got bookmarkStart!")
                try:
                    self.id = ' id="%s"' % child.Name.ToString() 
                except Exception, e:
                    log.error("ERROR: bookmark has no name: %s" % str(e))
            else:
                log.info("INFO: non TableRow element, not processing.")
        if not self.id and self.title:
            self.id = ' id="%s"' % genURLSafeBase64Encode(self.title)
        self.tab = '<table%s%s border="%s" class="%s"><caption>%s</caption>\n%s  </tbody>\n</table>\n' % (self.id, self.title, self.borderType, self.floating, self.caption, self.innerText)
        return self.tab

    
    def translateTableRow(self, tableRow):
        self.rowCount += 1
        log.info("TableRow: %d" %self.rowCount)
        childList = tableRow.ChildElements
        row ="    <tr>"
        colType = 'td'
        for child in childList:
            type = child.GetType().ToString()
            log.info(type)
            if (type.rfind('TableRowProperties') >=0) and not self.hasHeader and not self.hasBody:
                #potential header element
                grandKidList = child.ChildElements
                for grandKid in grandKidList:
                    log.info("DEBUG: grand kid: "+ grandKid.GetType().ToString() +" "+ grandKid.InnerText)
                    if (grandKid.GetType().ToString().rfind('TableHeader') >= 0) :
                        row = "  <thead>\n"+ row
                        self.hasHeader = True
                        colType = 'th'
                        break
            elif type.rfind('TableCell') >=0 :
                if self.hasHeaderClosing and not self.hasBody:
                    #header has been closed, but no body yet
                    row = "  <tbody>\n"+ row
                    self.hasBody = True
                if not self.hasHeader and not self.hasBody:
                    #header doesn't exist. Need to create a body
                    row = "  <tbody>\n"+ row
                    self.hasBody = True
                       
                row += "<%s>%s</%s>" % (colType, self.bt.translateBase(child), colType)
                
        row +="</tr>\n"
        if self.hasHeader and not self.hasHeaderClosing:
            row += "  </thead>\n" 
            self.hasHeaderClosing = True
        return row
