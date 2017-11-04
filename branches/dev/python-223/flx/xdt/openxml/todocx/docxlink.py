# -*- coding: utf-8 -*-

import sys
import os
import urllib
import clr
import System
from System.Text import StringBuilder
from System.IO import DirectoryInfo, File, FileInfo, Path, StreamWriter, FileStream, FileMode
    
clr.AddReference("System.Drawing")
clr.AddReference("DocumentFormat.OpenXml")

from System import Array, Byte
import System.Drawing.Image as DImage
from DocumentFormat.OpenXml import WordprocessingDocumentType, SpaceProcessingModeValues, OpenXmlElement
from DocumentFormat.OpenXml.Packaging import *
from DocumentFormat.OpenXml.Wordprocessing import *
import DocumentFormat.OpenXml.Drawing as d
import DocumentFormat.OpenXml.Drawing.Wordprocessing as dw
import DocumentFormat.OpenXml.Drawing.Pictures as pic

from openxml.todocx.styles import *
from openxml.common import truncateToBookmarkNameSize
from openxml.todocx.docxobject import DocxObject

class DocxInternalLink(DocxObject):
    """ Class that represents an internal link in the document
    """

    def __init__(self, anchor, text):
        self.anchor = truncateToBookmarkNameSize(urllib.unquote(anchor))
        print "Anchor: %s" % self.anchor
        self.text = text
        self.tooltip = "Jump to %s" % self.anchor

        self.hyperLink = Hyperlink()
        self.hyperLink.Anchor = self.anchor
        self.hyperLink.Tooltip = self.tooltip
        
    def addNewRun(self, runProps=None):
        if runProps:
            for p in STYLES['CK12Hyperlink'].getProperties():
                runProps.Append(p)
        self.hyperLink.Append(STYLES['CK12Hyperlink'].getNewRun(self.text, runProps=runProps))

class DocxExternalLink(DocxObject):
    """ Class represents a hyperlink in the document.
    """

    def __init__(self, mainPart, url, text, tooltip=None):
        self.url = url
        self.text = text
        if not tooltip:
            tooltip = self.text
        self.tooltip = tooltip

        uriType = System.UriKind.RelativeOrAbsolute
        if '://' in self.url:
            uriType = System.UriKind.Absolute
        else:
            uriType = System.UriKind.Relative

        uri = System.Uri(self.url, uriType)
        linkRel = mainPart.AddHyperlinkRelationship(uri, True)
        self.hyperLink = Hyperlink()
        self.hyperLink.Id = linkRel.Id
        self.hyperLink.Tooltip = self.tooltip
        
    def addNewRun(self, runProps=None):
        if runProps:
            for p in STYLES['CK12Hyperlink'].getProperties():
                runProps.Append(p)
        self.hyperLink.Append(STYLES['CK12Hyperlink'].getNewRun(self.text, runProps=runProps))

    def getProperties(self):
        return STYLES['CK12Hyperlink'].getProperties()

