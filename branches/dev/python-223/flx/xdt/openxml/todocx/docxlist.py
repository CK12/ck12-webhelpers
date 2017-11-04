# -*- coding: utf-8 -*-

import sys
import os
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
from openxml.todocx.docxobject import DocxObject

class BulletList(DocxObject):
    """ Creates a bullet list 
        Could have any number of levels
        Currently does not support mixed list - bulleted and numbered
    """

    def __init__(self, mainPart, numPart, id):
        self.numPart = numPart
        self.id = id
        self.level = None
        self.bulletSymbols = [ "•", "o", "§" ]
        #self.numberLevelTypes = [ NumberFormatValues.Decimal, NumberFormatValues.LowerLetter, NumberFormatValues.LowerRoman ]
        self.numberLevelTypes = [ ]
        self.startAt = 1

    def getOfficeType(self, type):
        if type == 'x-ck12-upper-alpha':
            officeType = NumberFormatValues.UpperLetter
        elif type == 'x-ck12-lower-alpha':
            officeType = NumberFormatValues.LowerLetter
        elif type == 'x-ck12-upper-roman':
            officeType = NumberFormatValues.UpperRoman
        elif type == 'x-ck12-lower-roman':
            officeType = NumberFormatValues.LowerRoman
        else:
            officeType = NumberFormatValues.Decimal
        return officeType

    def changeListLevelType(self, numberLevelType, level):
        officeType = self.getOfficeType(numberLevelType)
        numbering = self.numPart.Numbering
        changed = False
        if numbering:
            for child in numbering.ChildElements:
                if type(child) == AbstractNum and int(child.AbstractNumberId) == self.id:
                    for lvl in child.ChildElements:
                        if type(lvl) == Level and int(lvl.LevelIndex) == level:
                            for nf in lvl.ChildElements:
                                if type(nf) == NumberingFormat:
                                    nf.Val = officeType
                                    changed = True
        else:
            print "No numbering!"
        if changed:
            print "Changed: %s, %d" % (officeType, level)
        else:
            print "Could not change!"

    def addBulletListDefinition(self, type='bullet', levels=9):
        ## Define numbering
        self.type = type
        abnum = AbstractNum()
        abnum.AbstractNumberId = self.id
        if not self.numberLevelTypes:
            self.numberLevelTypes = [ NumberFormatValues.Decimal ]

        lvlIndex = 0
        while lvlIndex < levels:
            nf = NumberingFormat()
            if self.type == 'bullet':
                nf.Val = NumberFormatValues.Bullet
            else:
                nf.Val = self.numberLevelTypes[lvlIndex % len(self.numberLevelTypes)]

            lvl = Level()
            lvl.LevelIndex = lvlIndex
            lvlText = LevelText()
            #lvlText.Val = "•"
            if self.type == 'bullet':
                lvlText.Val = self.bulletSymbols[lvlIndex % len(self.bulletSymbols)]
            else:
                lvlText.Val = "%%%d." % (lvlIndex+1)

            lvl.Append(nf)
            lvl.Append(lvlText)

            lvlJust = LevelJustification()
            lvlJust.Val = LevelJustificationValues.Left
            lvl.Append(lvlJust)

            snl = StartNumberingValue()
            if lvlIndex == 0:
                snl.Val = self.startAt
            else:
                snl.Val = 1
            lvl.Append(snl)

            nsrp = NumberingSymbolRunProperties()
            runFont = RunFonts()
            runFont.Hint = FontTypeHintValues.Default
            runFont.Ascii = "Symbol"
            runFont.HighAnsi = "Symbol"
            nsrp.Append(runFont)
            #lvl.Append(nsrp)

            ppPr = PreviousParagraphProperties()
            indent = Indentation()
            indent.Left = "%d" % (720*(lvlIndex+1))
            indent.Hanging = "360"
            ppPr.Append(indent)
            lvl.Append(ppPr)

            abnum.Append(lvl)

            lvlIndex += 1
        
        multiLevel = MultiLevelType()
        multiLevel.Val = MultiLevelValues.HybridMultilevel
        abnum.Append(multiLevel)

        num = NumberingInstance()
        num.NumberID = self.id+1
        abnumId = AbstractNumId()
        abnumId.Val = self.id
        num.Append(abnumId)

        numbering = self.numPart.Numbering
        if not numbering:
            numbering = Numbering()

        ## The 'abstractNum' elements must be all before the 'num' elements
        ## Otherwise we cannot have two distinct lists in a document
        numbering.PrependChild(abnum)
        numbering.Append(num)
        
        numbering.Save(self.numPart)

    def getNewNumberingParagraph(self, numberingLevelId):
        self.level = numberingLevelId
        if self.type == 'number':
            para = STYLES["CK12NumberedList"].getNewParagraph()
        else:
            para = STYLES["CK12BulletedList"].getNewParagraph()

        pp = None
        for e in para.Elements[OpenXmlElement]():
            if type(e) == ParagraphProperties:
                pp = e
                break
        if not pp:
            pp = ParagraphProperties()
            para.Append(pp)
        np = NumberingProperties()
        nlr = NumberingLevelReference()
        nlr.Val = numberingLevelId

        nid = NumberingId()
        nid.Val = self.id+1

        np.Append(nlr, nid)
        pp.Append(np)
        return para

    def getNewParagraph(self):
        para = None
        if self.type == 'number':
            para = STYLES['CK12NumberedList'].getNewParagraph()
        else:
            para = STYLES['CK12BulletedList'].getNewParagraph()

        pp = None
        for e in para.Elements[OpenXmlElement]():
            if type(e) == ParagraphProperties:
                pp = e
                break
        if not pp:
            pp = ParagraphProperties()
            para.Append(pp)

        indent = Indentation()
        indent.Left = "%d" % (720*(self.level+1))
        pp.Append(indent)
        return para
