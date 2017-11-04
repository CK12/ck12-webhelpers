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
from openxml.common import truncateToBookmarkNameSize
from openxml.todocx.docxobject import DocxObject

class DocxTable(DocxObject):

    def __init__(self, instanceId, bookmarkId=None, bookmarkName=None, float=False):
        self.instanceId = instanceId
        self.bookmarkName = bookmarkName
        self.bookmarkId = bookmarkId

        self.captionPrefix = "Table "

        ## Table
        self.table = Table()

        ## Properties of the table
        self.tableProps = TableProperties()
        tableStyle = TableStyle()
        tableStyle.Val = "TableGrid"
        tableWidth = TableWidth()
        tableWidth.Width = "5000"
        tableWidth.Type = TableWidthUnitValues.Pct

        ## Create borders
        tableBorders = TableBorders()
        borders = [TopBorder(), BottomBorder(), LeftBorder(), RightBorder(), InsideHorizontalBorder(), InsideVerticalBorder()]
        for tb in borders:
            tb.Val = BorderValues.Single
            tb.Size = System.UInt32(20)
            tableBorders.AppendChild(tb)

        if float:
            posProps = TablePositionProperties()
            posProps.TopFromText = System.Int16(140)
            posProps.BottomFromText = System.Int16(140)
            posProps.LeftFromText = System.Int16(140)
            posProps.RightFromText = System.Int16(140)
            posProps.HorizontalAnchor = HorizontalAnchorValues.Text
            posProps.VerticalAnchor = VerticalAnchorValues.Text
            self.tableProps.Append(posProps)

        self.tableProps.Append(tableStyle, tableWidth)
        self.tableProps.Append(tableBorders)
        self.table.PrependChild(self.tableProps)

        if self.bookmarkName:
            bs = BookmarkStart()
            bs.Name = truncateToBookmarkNameSize(self.bookmarkName)
            bs.Id = str(self.bookmarkId)
            self.table.Append(bs)

            be = BookmarkEnd()
            be.Id = str(self.bookmarkId)
            self.table.Append(be)

        self.caption = None

    def addHeaderRow(self):
        self.row = TableRow()
        trPr = TableRowProperties()
        self.row.AppendChild(trPr)
        th = TableHeader()
        trPr.AppendChild(th)
        self.table.AppendChild(self.row)

    def addRow(self):
        self.row = TableRow()
        self.table.AppendChild(self.row)

    def __addColumn(self, style, addPara):
        self.col = STYLES[style].getNewTableCell()

        self.colStyle = style
        ## Shading for header cells
        #if self.colStyle == 'CK12TableHeaderCell':
        #    tcProps = STYLES[self.colStyle].getFirstDescendantOfType(self.col, TableCellProperties)
        #    tcProps.Shading = Shading()
        #    tcProps.Shading.Fill = "ACACAC"

        #self.col.PrependChild(tcProps)

        p = None
        print "Adding new para: %s" % str(addPara)
        if addPara:
            p = self.addParagraphToLastColumn()

        self.row.AppendChild(self.col)

        return p

    def addColumn(self, addPara=True):
        return self.__addColumn('CK12TableCell', addPara)

    def addHeaderColumn(self, addPara=True):
        return self.__addColumn('CK12TableHeaderCell', addPara)

    def addParagraphToLastColumn(self):
        para = None
        found = False
        for child in self.col.ChildElements:
            if type(child) == Paragraph:
                found = False
                if self.isParagraphEmpty(child):
                    found = True
                    para = child
        if found:
            print "Found empty para"
            return para

        p = STYLES[self.colStyle].getNewParagraph()
        pprops = STYLES[self.colStyle].getFirstDescendantOfType(p, ParagraphProperties)
        if not pprops:
            pprops = ParagraphProperties()
            p.Append(pprops)
        pj = Justification()
        pj.Val = JustificationValues.Center
        pprops.AppendChild(pj)
        self.col.AppendChild(p)
        return p

    def addCaption(self, text):
        self.caption = TableCaption()
        self.caption.Val = text
        self.tableProps.TableCaption = self.caption


    def addDescription(self, desc, tableNumber=None):
        para = None
        if desc:
            para = STYLES['CK12ImageCaption'].getNewParagraph()
            r = Run()
            r.Append(self.getSpacePreservingText(self.captionPrefix))
            para.Append(r)

            r = Run()
            sf = SimpleField()
            sf.Instruction = "SEQ Table"
            rp = RunProperties()
            np = NoProof()
            np.Val = True
            rp.Append(np)
            r.Append(rp)
            if not tableNumber:
                tableNumber = self.instanceId

            r.Append(self.getSpacePreservingText(str(tableNumber) + " "))
            sf.Append(r)
            para.Append(sf)

            if '%20' in desc:
                desc = urllib.unquote(desc)
            r = Run()
            r.Append(self.getSpacePreservingText(desc))
            para.Append(r)

        return para


