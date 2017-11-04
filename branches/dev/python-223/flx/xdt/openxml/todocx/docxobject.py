# -*- coding: utf-8 -*-

import sys
import os
import clr
import System
from System.Text import StringBuilder
from System.IO import DirectoryInfo, File, FileInfo, Path, StreamWriter, FileStream, FileMode
    
clr.AddReference("DocumentFormat.OpenXml")

from System import Array, Byte
import System.Drawing.Image as DImage
from DocumentFormat.OpenXml import WordprocessingDocumentType, SpaceProcessingModeValues, OpenXmlElement
from DocumentFormat.OpenXml.Packaging import *
from DocumentFormat.OpenXml.Wordprocessing import *

from openxml.todocx.styles import *

class DocxObject(object):

    def getSpacePreservingText(self, text):
        t = Text()
        t.Space = SpaceProcessingModeValues.Preserve
        t.Text = text
        return t

    def isParagraphEmpty(self, para):
        for child in para.ChildElements:
            print type(child)
            if type(child) != ParagraphProperties:
                return False
        return True
