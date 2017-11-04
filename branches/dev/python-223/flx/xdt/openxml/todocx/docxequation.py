# -*- coding: utf-8 -*-

import sys
import os
import urllib, urllib2
import re
import json
import hashlib
from tempfile import NamedTemporaryFile
import struct
from ctypes import *

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
import DocumentFormat.OpenXml.Vml.Office as vo

from openxml.todocx.styles import *
from openxml.todocx.docximage import DocxImage
from openxml.mathtype.mathtypelib import EquationInputFileText, EquationOutputFileWMF, EquationOutputFileEPS, ConvertEquation
from MTSDKDN import ClipboardFormats
from MTSDKDN.MathTypeSDK import RegisterClipboardFormatA

A64 = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+-"

class DocxEquation(DocxImage):
    DocxBlockEquationType = "CK12BlockEquation"
    DocxInlineEquationType = "CK12InlineEquation"

    def __init__(self, mainPart, equation, type, instanceId):
        self.equation = equation
        imageFile = self.getImageFromEquation(type)
        DocxImage.__init__(self, mainPart, imageFile, instanceId)

    def getImageFromEquation(self, type=DocxBlockEquationType):
        if type == self.DocxBlockEquationType:
            self.equation = "\\[\\begin{align}\n" + self.equation + "\n\\end{align}\\]"
        textFile = NamedTemporaryFile(suffix='.tex', delete=False)
        textFile.write(self.equation)
        textFile.close()
        print "Wrote equation to file: %s" % textFile.name

        ## Convert tex to WMF
        ce = ConvertEquation()
        ei = EquationInputFileText(textFile.name, ClipboardFormats.cfTeX)
        if not ei:
            raise Exception("Failed to create EquationInputFileText")
        outputFile = textFile.name + '.wmf'
        print "WMF file: %s" % outputFile
        eo = EquationOutputFileWMF(outputFile)
        ret = ce.Convert(ei, eo)
        if ret:
            print "Converted to WMF"
        else:
            raise Exception("Error converting to WMF")

        self.outputFileEps = textFile.name + ".eps"
        print "EPS file: %s" % self.outputFileEps
        eo = EquationOutputFileEPS(self.outputFileEps)
        ret = ce.Convert(ei, eo)
        if ret:
            print "Converted to EPS"
        else:
            raise Exception("Error converting to EPS")

        return outputFile

    def getBinaryDataFromEPS(self, epsFile):
        strData = ''
        inComment = False
        f = open(epsFile, "r")
        for line in f:
            line = line.strip()
            if inComment and line.startswith('%'):
                line = line.strip('%')
                part = line.split('!')[0]
                strData += part
                if '!' in line:
                    inComment = False
                    break
            elif line.startswith('%MathType!MTEF'):
                inComment = True

        f.close()
        print "Str data:"
        print strData

        eoFile = NamedTemporaryFile(suffix=".bin", delete=False)
        eoFile.close()

        fout = open(eoFile.name, "wb")
        print "Len of strData: %d" % len(strData)
        s = struct.pack('!HLHLLLLL', 28, 1 << 18, RegisterClipboardFormatA("MathType EF"), len(strData)/4*3, 0, 0, 0, 0)
        #s = struct.pack('=HL', 28, 2 << 17)
        fout.write(s)
        i = 0
        while i < len(strData):
            pos0 = A64.index(strData[i])
            pos1 = 0
            pos2 = 0
            pos3 = 0
            if i+1 < len(strData):
                pos1 = A64.index(strData[i+1])
            if i+2 < len(strData):
                pos2 = A64.index(strData[i+2])
            if i+3 < len(strData):
                pos3 = A64.index(strData[i+3])
            #print '%s' % strData[i:i+4]
            #print pos0, pos1, pos2, pos3

            b0 = c_ubyte((pos1 << 6) | pos0)
            #print b0.value, chr(b0.value)
            b1 = c_ubyte((pos1 >> 2) | (pos2 << 4))
            #print b1.value, chr(b1.value)
            b2 = c_ubyte((pos3 << 2) | ((pos2 << 2)>> 6))
            #print b2.value, chr(b2.value)
            fout.write(chr(b0.value))
            fout.write(chr(b1.value))
            fout.write(chr(b2.value))

            i += 4

        fout.close()
        self.embeddedDataFile = eoFile.name
        return self.embeddedDataFile

    def saveEmbeddedObjectPart(self):
        self.getBinaryDataFromEPS(self.outputFileEps)
        self.eoPart = self.mainPart.AddEmbeddedObjectPart("application/vnd.openxmlformats-officedocument.oleObject")
        stream = FileStream(self.embeddedDataFile, FileMode.Open)
        self.eoPart.FeedData(stream)
        stream.Close()
        self.eoId = self.mainPart.GetIdOfPart(self.eoPart)
        print "EmbeddedObject id: %s" % self.eoId
        return self.eoId

    def getNewEquationParagraph(self, type=DocxBlockEquationType):
        run = self.getNewEquationRun(type)
        if type == self.DocxBlockEquationType:
            style = 'MTDisplayEquation'
        else:
            style = self.DocxInlineEquationType
        para = STYLES[style].getNewParagraph()
        para.Append(run)
        return para

    def getNewEquationRun(self, type=DocxInlineEquationType):
        self.saveEmbeddedObjectPart()
        eo = EmbeddedObject()
        eo.DxaOriginal = "180"
        eo.DyaOriginal = "280"
        (w, h) = self.getImageDimensions()
        print "Image dims: %s x %s" % (w, h)

        if self.instanceId == 1:
            shapeType = v.Shapetype()
            shapeType.Id = "_x0000_t75"
            shapeType.CoordinateSize = "216000,216000"
            shapeType.Filled = False
            shapeType.Stroked = False
            shapeType.OptionalNumber = 75
            shapeType.PreferRelative = True
            shapeType.EdgePath = "m@4@5l@4@11@9@11@9@5xe"

            stroke = v.Stroke()
            stroke.JoinStyle = v.StrokeJoinStyleValues.Miter

            formulas = v.Formulas()
            formula1 = v.Formula()
            formula1.Equation = "if lineDrawn pixelLineWidth 0"
            formula2 = v.Formula()
            formula2.Equation = "sum @0 1 0"
            formula3 = v.Formula()
            formula3.Equation = "sum 0 0 @1"
            formula4 = v.Formula()
            formula4.Equation = "prod @2 1 2"
            formula5 = v.Formula()
            formula5.Equation = "prod @3 21600 pixelWidth"
            formula6 = v.Formula()
            formula6.Equation = "prod @3 21600 pixelHeight"
            formula7 = v.Formula()
            formula7.Equation = "sum @0 0 1"
            formula8 = v.Formula()
            formula8.Equation = "prod @6 1 2"
            formula9 = v.Formula()
            formula9.Equation = "prod @7 21600 pixelWidth"
            formula10 = v.Formula()
            formula10.Equation = "sum @8 21600 0"
            formula11 = v.Formula()
            formula11.Equation = "prod @7 21600 pixelHeight"
            formula12 = v.Formula()
            formula12.Equation = "sum @10 21600 0"

            formulas.Append(formula1)
            formulas.Append(formula2)
            formulas.Append(formula3)
            formulas.Append(formula4)
            formulas.Append(formula5)
            formulas.Append(formula6)
            formulas.Append(formula7)
            formulas.Append(formula8)
            formulas.Append(formula9)
            formulas.Append(formula10)
            formulas.Append(formula11)
            formulas.Append(formula12)

            path = v.Path()
            path.AllowGradientShape = True
            path.ConnectionPointType = vo.ConnectValues.Rectangle
            path.AllowExtrusion = False

            lock = vo.Lock()
            lock.Extension = v.ExtensionHandlingBehaviorValues.Edit
            lock.AspectRatio = True

            shapeType.Append(stroke)
            shapeType.Append(formulas)
            shapeType.Append(path)
            shapeType.Append(lock)
            
            eo.Append(shapeType)

        shape = v.Shape()
        shape.Ole = False
        shape.Type = "#_x0000_t75"
        shape.Id = "_x0000_i%d" % (1024 + self.instanceId)
        #shape.Style = "width:%dpx;height:%dpx" % (w, h)
        shape.Style = "width:53pt;height:53pt;"
        imageData = v.ImageData()
        imageData.Title = ""
        print "Image id: %s" % self.imageId
        imageData.RelationshipId = self.imageId

        shape.Append(imageData)

        oleObj = vo.OleObject()
        oleObj.Type = vo.OleValues.Embed
        oleObj.ProgId = "Equation.DSMT4"
        oleObj.DrawAspect = vo.OleDrawAspectValues.Content
        oleObj.Id = self.eoId
        oleObj.ObjectId = "_%d" % (1357995864L + self.instanceId)
        oleObj.ShapeId = shape.Id

        eo.Append(shape)
        eo.Append(oleObj)

        if type == self.DocxBlockEquationType:
            run = Run()
        else:
            run = STYLES['CK12InlineEquation'].getNewRun()
        run.Append(eo)
        return run
