import sys
import os
import clr
import System
from System.Text import StringBuilder
from System.IO import DirectoryInfo, File, FileInfo, Path, StreamWriter
    
clr.AddReference("DocumentFormat.OpenXml")

from System import Array, Byte
from DocumentFormat.OpenXml import WordprocessingDocumentType
from DocumentFormat.OpenXml.Packaging import *
from DocumentFormat.OpenXml.Wordprocessing import *

if __name__ == '__main__':
    doc = WordprocessingDocument.Create("test.docx", WordprocessingDocumentType.Document)
    mainPart = doc.AddMainDocumentPart()

    ## Define styles
    stylePart = mainPart.AddNewPart[StyleDefinitionsPart]()

    ## heading
    runProps = RunProperties()
    runFont = RunFonts()
    runFont.Ascii = "Comic Sans MS";
    runProps.Append(runFont)
    runProps.Append(Bold())
    fontSize = FontSize()
    fontSize.Val = "48"
    runProps.Append(fontSize)

    ## Created named style
    headingStyle = Style()
    headingStyle.StyleId = "CK12LessonHeading"
    name = Name()
    name.Val = "CK-12 Lesson Heading"
    headingStyle.Append(name)
    nps = NextParagraphStyle()
    nps.Val = "Normal"
    headingStyle.Append(nps)
    headingStyle.Append(runProps)

    stylePart.Styles = Styles()
    stylePart.Styles.Append(headingStyle)

    #docXml = u'<?xml version="1.0" encoding="UTF-8" standalone="yes"?> <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"> <w:body><w:p><w:r><w:t>Hello world!</w:t></w:r></w:p></w:body></w:document>'
    #docXmlBytes = Array[Byte](tuple(Byte(ord(c)) for c in docXml))
    #stream = mainPart.GetStream()
    #stream.Write(docXmlBytes, 0, len(docXmlBytes))

    mainPart.Document = Document()
    text = Text("Hello There!")
    run = Run(text)
    para = Paragraph(run)
    body = Body()
    body.Append(para)


    paraProps = ParagraphProperties()
    paraStyle = ParagraphStyleId()
    paraStyle.Val = "CK12LessonHeading"
    paraProps.ParagraphStyleId = paraStyle
    para.PrependChild(paraProps)

    text2 = Text("Welcome to the new OpenXML Word document created using OpenXML SDK 2.0.")
    run2 = Run(text2)

    para2 = Paragraph(run2)
    body.Append(para2)

    ## Table
    table = Table()

    ## Properties of the table
    tableProps = TableProperties()
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
    #tableBorders = TableBorders(borders[0], borders[1], borders[2], borders[3], borders[4], borders[5])
    tableProps.Append(tableStyle, tableWidth)
    tableProps.Append(tableBorders)
    table.PrependChild(tableProps)

    ## Grid
    tg = TableGrid(GridColumn(), GridColumn(), GridColumn())
    table.AppendChild(tg)
    for i in range(1, 11):
        tr = TableRow()
        for j in range(1, 4):
            p = Paragraph(Run(Text(str((i-1)*3+j))))

            ## Make para Center justified
            pprops = ParagraphProperties()
            pj = Justification()
            pj.Val = JustificationValues.Center
            pprops.AppendChild(pj)
            p.PrependChild(pprops)

            ## Create table cell and make it vertical aligned
            tc = TableCell(p)
            tcProps = TableCellProperties()
            tcVAlign = TableCellVerticalAlignment()
            tcVAlign.Val = TableVerticalAlignmentValues.Bottom
            tcProps.AppendChild(tcVAlign)
            tc.PrependChild(tcProps)
            tr.Append(tc)
        table.AppendChild(tr)

    body.AppendChild(table)

    ## Add body and save the document
    stylePart.Styles.Save()
    mainPart.Document.Append(body)
    mainPart.Document.Save()
    doc.Close()

    print "Wrote document"
