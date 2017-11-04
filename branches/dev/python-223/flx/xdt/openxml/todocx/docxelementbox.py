
# -*- coding: utf-8 -*-

import sys
import os
import urllib, urllib2
import re
import json
import hashlib

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
import DocumentFormat.OpenXml.Vml as v
import DocumentFormat.OpenXml.Vml.Office as ovml

from openxml.todocx.styles import *
from openxml.todocx.docxobject import DocxObject
from openxml.common import ENVIRONMENT_PROPS

class DocxElementBox(DocxObject):

    def __init__(self, id):
        self.id = id

    def create(self):

        self.para = STYLES['CK12ElementBox'].getNewParagraph()
        picture = Picture()
        group = v.Group()
        group.Id = "ElementBoxGroup_%d" % self.id
        width = 8000
        headerHeight = 700

        ## Create a shapetype for the group of boxes
        shapetype = v.Shapetype()
        stroke = v.Stroke()
        stroke.JoinStyle = v.StrokeJoinStyleValues.Miter
        path = v.Path()
        path.AllowGradientShape = True
        path.ConnectionPointType = ovml.ConnectValues.Rectangle
        shapetype.Append(stroke)
        shapetype.Append(path)

        shapeHead = v.Shape()
        shapeHead.Style = "position:absolute;visibility:visible;mso-wrap-style:square;width:%dpct;height:%dpct" % (width, headerHeight)
        shapeHead.Type = "#_x0000_t202"
        shapeHead.FillColor = "#c2d69b"
        shapeHead.AllowOverlap = False

        self.textBoxHeadID = "ElementBoxHead_%d" % self.id
        self.textBoxBodyID = "ElementBoxBody_%d" % self.id
        self.textBoxHead = v.TextBox()
        self.textBoxHead.Id = self.textBoxHeadID
        self.textBoxHead.Style = "mso-next-textbox:#%s;mso-fit-text-to-shape:true;width:%dpct;height:%dpct" % (self.textBoxBodyID, width, headerHeight)
        self.headContent = TextBoxContent()
        self.textBoxHead.Append(self.headContent)
        shapeHead.Append(self.textBoxHead)

        shapeBody = v.Shape()
        shapeBody.Style = "position:absolute;visibility:visible;mso-wrap-style:square;width:%dpct;margin-top:%dpct" % (width, headerHeight)
        shapeBody.Type = "#_x0000_t202"
        shapeBody.FillColor = "#dbe5f1"
        shapeBody.AllowOverlap = False

        self.textBoxBody = v.TextBox()
        self.textBoxBody.Id = self.textBoxBodyID
        self.textBoxBody.Style = "mso-fit-shape-to-text:true;width:%dpct" % (width)
        self.bodyContent = TextBoxContent()
        self.textBoxBody.Append(self.bodyContent)
        shapeBody.Append(self.textBoxBody)

        group.Append(shapeHead)
        group.Append(shapeBody)
        picture.Append(group)
        #picture.Append(shapeBody)
        #picture.Append(shapeHead)
        run = Run()
        run.Append(picture)
        self.para.Append(run)
        return self.para

    def getNewHeaderParagraph(self):
        para = STYLES['CK12ElementBoxHeader'].getNewParagraph()
        self.headContent.Append(para)
        return para

    def getNewContentParagraph(self):
        para = STYLES['CK12LessonBase'].getNewParagraph()
        self.bodyContent.Append(para)
        return para

    def addNewContentParagraph(self, para):
        print "Appending to self.bodyContent"
        self.__addNewPara(para, self.bodyContent)

    def __addNewPara(self, para, node):
        try:
            node.Append(para)
        except SystemError, se:
            if 'part of a tree' in se.message:
                pass
            else:
                raise se

    def addNewHeaderParagraph(self, para):
        print "Appending to self.headContent"
        self.__addNewPara(para, self.headContent)

    def closeContent(self):
        style = self.textBoxHead.Parent.Style
        print "Style of head: %s" % style
