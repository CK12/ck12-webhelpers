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
from DocumentFormat.OpenXml import WordprocessingDocumentType, SpaceProcessingModeValues, OpenXmlElement, OnOffValue
from DocumentFormat.OpenXml.Packaging import *
from DocumentFormat.OpenXml.Wordprocessing import *
import DocumentFormat.OpenXml.Drawing as d
import DocumentFormat.OpenXml.Drawing.Wordprocessing as dw
import DocumentFormat.OpenXml.Drawing.Pictures as pic

class BaseStyle:
    def __init__(self):
        self.style = Style()
        self.style.StyleId = "CK12Base"
        self.style.Type = StyleValues.Paragraph
        name = Name()
        name.Val = "CK12Base"
        self.style.Append(name)
        nps = NextParagraphStyle()
        nps.Val = "CK12Base"
        self.style.Append(nps)

        self.runProps = StyleRunProperties()
        runFont = RunFonts()
        runFont.Ascii = "Tahoma";
        self.runProps.Append(runFont)
        fontSize = FontSize()
        fontSize.Val = "22"
        self.runProps.Append(fontSize)
        self.style.Append(self.runProps)

        self.tcProps = None

    def makeQuickStyle(self):
        self.style.Append(PrimaryStyle())

    def getStyle(self):
        """ Return the style object
        """
        return self.style

    def getStyleId(self):
        """ Return the id of the style
            This will be used to refer to the style in ParagraphProperties
        """
        return self.style.StyleId

    def getNewTableCell(self):
        if self.tcProps:
            tc = TableCell()
            tcProps = TableCellProperties()
            for child in self.tcProps.ChildElements:
                tcProps.Append(child.CloneNode(True))
            tc.Append(tcProps)
            return tc
        else:
            raise Exception("Not implemented")

    def getNewParagraph(self):
        """ Get a new paragraph with this style
        """
        para = Paragraph()
        paraProps = ParagraphProperties()
        paraStyle = ParagraphStyleId()
        paraStyle.Val = self.getStyleId()
        paraProps.ParagraphStyleId = paraStyle
        para.PrependChild(paraProps)
        return para

    def getNewRun(self, text=None, runProps=None):
        """ Create and return a new Run with
            this style
        """
        r = Run()
        if not runProps:
            runProps = self.runProps
        rp = RunProperties()
        for child in runProps.ChildElements:
            rp.Append(child.CloneNode(True))

        rs = RunStyle()
        rs.Val = self.getStyleId()
        rp.PrependChild(rs)
        r.Append(rp)
        if text:
            t = Text()
            t.Space = SpaceProcessingModeValues.Preserve
            t.Text = text
            r.Append(t)
        return r

    def getInheritingStyle(self, styleId, styleName):
        """ Return a new style based on this style
            for further customization
        """
        style = Style()
        style.StyleId = styleId
        name = Name()
        name.Val = styleName
        style.Append(name)
        basedOn = BasedOn()
        basedOn.Val = self.getStyleId()
        style.Append(basedOn)
        nps = NextParagraphStyle()
        nps.Val = "CK12LessonBase"
        style.Append(nps)
        style.Type = StyleValues.Paragraph
        return style

    @classmethod
    def getFirstDescendantOfType(cls, node, descType):
        if node.HasChildren:
            for e in node.Descendants[OpenXmlElement]():
                if type(e) == descType:
                    return e
        return None


class LessonBaseStyle(BaseStyle):
    """ Basic style class - represent regular text paragraph
    """

    def __init__(self):
        BaseStyle.__init__(self)
        self.style = BaseStyle.getInheritingStyle(self, "CK12LessonBase", "CK12LessonBase")
        self.makeQuickStyle()
        
        ## Define properties
        self.runProps = RunProperties()
        color = Color()
        color.Val = "000000"
        self.runProps.Append(color)

        self.style.Append(self.runProps)

class TitleStyle(BaseStyle):
    """ Represents Chapter title
    """

    def __init__(self):
        BaseStyle.__init__(self)
        self.style = BaseStyle.getInheritingStyle(self, "CK12ChapterTitle", "CK12ChapterTitle")
        self.makeQuickStyle()

        pp = StyleParagraphProperties()
        pb = ParagraphBorders()
        bb = BottomBorder()
        bb.Val = BorderValues.Single
        bb.Color = "4F81BD"
        bb.Size = System.UInt32(8)
        bb.Space = System.UInt32(4)
        pb.Append(bb)
        pp.Append(pb)

        spacing = SpacingBetweenLines()
        spacing.After = "300"
        spacing.Line = "240"
        spacing.LineRule = LineSpacingRuleValues.Auto
        pp.Append(spacing)
        pp.Append(ContextualSpacing())

        pp.Append(KeepNext())
        self.style.Append(pp)
        
        self.runProps = StyleRunProperties()
        fontSize = FontSize()
        fontSize.Val = "32"
        self.runProps.Append(fontSize)
        self.runProps.Append(Bold())
        color = Color()
        color.Val = "17365D"
        self.runProps.Append(color)
        self.style.Append(self.runProps)

class SectionTitleStyle(BaseStyle):
    """ Represents a section or lesson title
    """

    def __init__(self):
        BaseStyle.__init__(self)
        self.style = BaseStyle.getInheritingStyle(self, "CK12SectionTitle", "CK12SectionTitle")
        self.makeQuickStyle()

        self.runProps = StyleRunProperties()
        fontSize = FontSize()
        fontSize.Val = "28"
        self.runProps.Append(fontSize)
        self.runProps.Append(Bold())
        color = Color()
        color.Val = "365F91"
        self.runProps.Append(color)
        self.style.Append(self.runProps)

        self.paraProps = StyleParagraphProperties()
        self.paraProps.Append(KeepNext())
        self.style.Append(self.paraProps)

class SubsectionTitleStyle(BaseStyle):

    def __init__(self):
        BaseStyle.__init__(self)
        self.style = BaseStyle.getInheritingStyle(self, "CK12SubsectionTitle", "CK12SubsectionTitle")
        self.makeQuickStyle()

        self.runProps = StyleRunProperties()
        fontSize = FontSize()
        fontSize.Val = "24"
        self.runProps.Append(fontSize)
        self.runProps.Append(Bold())
        color = Color()
        color.Val = "4F81BD"
        self.runProps.Append(color)
        self.style.Append(self.runProps)

        self.paraProps = StyleParagraphProperties()
        self.paraProps.Append(KeepNext())
        self.style.Append(self.paraProps)

class SubsubsectionTitleStyle(BaseStyle):

    def __init__(self):
        BaseStyle.__init__(self)
        self.style = BaseStyle.getInheritingStyle(self, "CK12SubsubsectionTitle", "CK12SubsubsectionTitle")
        self.makeQuickStyle()

        self.runProps = StyleRunProperties()
        fontSize = FontSize()
        fontSize.Val = "22"
        self.runProps.Append(fontSize)
        self.runProps.Append(Bold())
        self.style.Append(self.runProps)

        self.paraProps = StyleParagraphProperties()
        self.paraProps.Append(KeepNext())
        self.style.Append(self.paraProps)

class NumberedListStyle(BaseStyle):

    def __init__(self):
        BaseStyle.__init__(self)
        self.style = BaseStyle.getInheritingStyle(self, "CK12NumberedList", "CK12NumberedList")
        #self.style.Type = StyleValues.Numbering
        self.makeQuickStyle()

    def makeRealListType(self, mainPart, numPart):
        from docxlist import BulletList
        list = BulletList(mainPart, numPart, 0)
        list.addBulletListDefinition(type='number', levels=3)

        self.paraProps = StyleParagraphProperties()
        self.style.Append(self.paraProps)

        self.numProps = NumberingProperties()
        self.numProps.NumberingId = NumberingId()
        self.numProps.NumberingId.Val = 1
        self.paraProps.Append(self.numProps)

class BulletedListStyle(BaseStyle):

    def __init__(self):
        BaseStyle.__init__(self)
        self.style = BaseStyle.getInheritingStyle(self, "CK12BulletedList", "CK12BulletedList")
        #self.style.Type = StyleValues.Numbering
        self.makeQuickStyle()

class InlineImageStyle(BaseStyle):

    def __init__(self):
        BaseStyle.__init__(self)
        self.style = BaseStyle.getInheritingStyle(self, "CK12InlineImage", "CK12InlineImage")
        #self.style.Type = StyleValues.Character
        self.makeQuickStyle()

class BlockImageStyle(BaseStyle):

    def __init__(self):
        BaseStyle.__init__(self)
        self.style = BaseStyle.getInheritingStyle(self, "CK12BlockImage", "CK12BlockImage")
        self.makeQuickStyle()

        self.paraProps = StyleParagraphProperties()
        self.paraProps.Append(KeepNext())
        self.style.Append(self.paraProps)

class InlineEquationStyle(BaseStyle):

    def __init__(self):
        BaseStyle.__init__(self)
        self.style = BaseStyle.getInheritingStyle(self, "CK12InlineEquation", "CK12InlineEquation")
        self.makeQuickStyle()

        self.runProps = StyleRunProperties()
        self.runProps.NoProof = NoProof()
        self.runProps.NoProof.Val = True
        self.runProps.RunFonts = RunFonts()
        self.runProps.RunFonts.Ascii = 'Courier'

        self.style.Append(self.runProps)

class BlockEquationStyle(BaseStyle):

    def __init__(self):
        BaseStyle.__init__(self)
        self.style = BaseStyle.getInheritingStyle(self, "CK12BlockEquation", "CK12BlockEquation")
        self.makeQuickStyle()

        self.runProps = StyleRunProperties()
        self.runProps.NoProof = NoProof()
        self.runProps.NoProof.Val = True
        self.runProps.RunFonts = RunFonts()
        self.runProps.RunFonts.Ascii = 'Courier'

        self.paraProps = StyleParagraphProperties()
        self.paraProps.Append(KeepLines())
        ind = Indentation()
        ind.Left = "720"
        self.paraProps.Append(ind)

        self.style.Append(self.paraProps)
        self.style.Append(self.runProps)

class ImageCaptionStyle(BaseStyle):

    def __init__(self):
        BaseStyle.__init__(self)
        self.style = BaseStyle.getInheritingStyle(self, "CK12ImageCaption", "CK12ImageCaption")
        self.makeQuickStyle()

        self.paraProps = StyleParagraphProperties()
        self.paraProps.Append(KeepLines())

        self.runProps = StyleRunProperties()
        self.runProps.Append(Bold())
        color = Color()
        color.Val = "4F81BD"
        self.runProps.Append(color)

        self.style.Append(self.runProps)
        self.style.Append(self.paraProps)

class TableCellStyle(BaseStyle):

    def __init__(self):
        BaseStyle.__init__(self)
        self.style = BaseStyle.getInheritingStyle(self, 'CK12TableCell', 'CK12TableCell')
        self.makeQuickStyle()
        self.tcProps = StyleTableCellProperties()
        self.style.AppendChild(self.tcProps)

class TableHeaderCellStyle(BaseStyle):

    def __init__(self):
        BaseStyle.__init__(self)
        self.style = BaseStyle.getInheritingStyle(self, 'CK12TableHeaderCell', 'CK12TableHeaderCell')
        self.makeQuickStyle()

        self.tcProps = StyleTableCellProperties()
        self.tcProps.Shading = Shading()
        self.tcProps.Shading.Fill = "ACACAC"
        tcVAlign = TableCellVerticalAlignment()
        tcVAlign.Val = TableVerticalAlignmentValues.Bottom
        self.tcProps.AppendChild(tcVAlign)
        self.style.StyleTableCellProperties = self.tcProps

        self.paraProps = ParagraphProperties()
        #self.paraProps.Shading = Shading()
        #self.paraProps.Shading.Fill = "ACACAC"
        self.style.AppendChild(self.paraProps)

        ### Header is bold
        self.runProps = StyleRunProperties()
        self.runProps.Append(Bold())
        self.style.Append(self.runProps)

class Emphasis(BaseStyle):

    def __init__(self):
        BaseStyle.__init__(self)
        self.style = BaseStyle.getInheritingStyle(self, 'CK12Emphasis', 'CK12Emphasis')

class HyperLinkStyle(BaseStyle):

    def __init__(self):
        BaseStyle.__init__(self)
        self.style = BaseStyle.getInheritingStyle(self, 'CK12Hyperlink', 'CK12Hyperlink')
        self.style.Type = StyleValues.Character

        self.runProps = StyleRunProperties()

        for item in self.getProperties():
            self.runProps.Append(item)
        self.style.Append(self.runProps)

    def getProperties(self):
        """ Get properties for the hyperlink
        """
        ul = Underline()
        ul.Val = UnderlineValues.Single

        color = Color()
        color.Val = "0000FF"

        return [ul, color]

class LiteralLayoutStyle(BaseStyle):

    def __init__(self):
        BaseStyle.__init__(self)
        self.style = BaseStyle.getInheritingStyle(self, 'CK12LiteralLayout', 'CK12LiteralLayout')
        self.makeQuickStyle()

        border = Border()
        border.Val = BorderValues.Single
        border.Size = System.UInt32(8)
        border.Color = "EFEFEF"

        self.paraProps = StyleParagraphProperties()
        self.paraProps.Append(border)
        
        self.runProps = StyleRunProperties()
        self.runProps.RunFonts = RunFonts()
        self.runProps.RunFonts.Ascii = 'Courier'

        shading = Shading()
        shading.Fill = "EFEFEF"
        #shading.Val = ShadingPatternValues.Percent10
        self.paraProps.Append(shading)

        ind = Indentation()
        ind.Left = "720"
        self.paraProps.Append(ind)

        self.paraProps.Append(KeepLines())

        wordWrap = WordWrap()
        wordWrap.Val = OnOffValue(False)
        self.paraProps.Append(wordWrap)

        self.style.Append(self.paraProps)
        self.style.Append(self.runProps)

class BlockQuoteStyle(BaseStyle):

    def __init__(self):
        BaseStyle.__init__(self)
        self.style = BaseStyle.getInheritingStyle(self, 'CK12BlockQuote', 'CK12BlockQuote')
        self.makeQuickStyle()

        self.paraProps = StyleParagraphProperties()
        ind = Indentation()
        ind.Left = "720"
        self.paraProps.Append(ind)
        self.paraProps.Append(KeepLines())

        self.runProps = StyleRunProperties()
        color = Color()
        color.Val = "595959"
        self.runProps.Append(color)

        self.style.Append(self.paraProps)
        self.style.Append(self.runProps)

class IndentStyle(BaseStyle):

    def __init__(self):
        BaseStyle.__init__(self)
        self.style = BaseStyle.getInheritingStyle(self, 'CK12Indent', 'CK12Indent')
        self.makeQuickStyle()

        self.paraProps = StyleParagraphProperties()
        ind = Indentation()
        ind.Left = "600"
        self.paraProps.Append(ind)
        self.paraProps.Append(KeepLines())

        self.style.Append(self.paraProps)

class DefinitionTermStyle(BaseStyle):

    def __init__(self):
        BaseStyle.__init__(self)
        self.style = BaseStyle.getInheritingStyle(self, 'CK12DefinitionTerm', 'CK12DefinitionTerm')
        self.makeQuickStyle()

        self.runProps = StyleRunProperties()
        self.runProps.Append(Bold())

        self.paraProps = StyleParagraphProperties()
        ind = Indentation()
        ind.Left = "360"
        self.paraProps.Append(ind)

        self.paraProps.Append(KeepNext())

        self.style.Append(self.paraProps)
        self.style.Append(self.runProps)

class DefinitionDescriptionStyle(BaseStyle):

    def __init__(self):
        BaseStyle.__init__(self)
        self.style = BaseStyle.getInheritingStyle(self, 'CK12DefinitionDesc', 'CK12DefinitionDesc')
        self.makeQuickStyle()

        self.paraProps = StyleParagraphProperties()
        ind = Indentation()
        ind.Left = "720"
        self.paraProps.Append(ind)

        self.paraProps.Append(KeepLines())

        self.style.Append(self.paraProps)

class RawDataStyle(BaseStyle):

    def __init__(self):
        BaseStyle.__init__(self)
        self.style = BaseStyle.getInheritingStyle(self, 'CK12RawData', 'CK12RawData')
        self.makeQuickStyle()

        self.runProps = StyleRunProperties()
        self.runProps.NoProof = NoProof()
        self.runProps.NoProof.Val = True
        self.runProps.RunFonts = RunFonts()
        self.runProps.RunFonts.Ascii = 'Courier'

        self.paraProps = StyleParagraphProperties()
        self.paraProps.Append(KeepLines())
        self.paraProps.Append(KeepNext())

        self.style.Append(self.paraProps)
        self.style.Append(self.runProps)

class MathTypeDisplayEquationStyle(BaseStyle):

    def __init__(self):
        BaseStyle.__init__(self)
        self.style = BaseStyle.getInheritingStyle(self, 'MTDisplayEquation', 'MTDisplayEquation')

        self.paraProps = StyleParagraphProperties()
        tabs = Tabs()
        ts1 = TabStop()
        ts1.Val = TabStopValues.Center
        ts1.Position = 4680

        ts2 = TabStop()
        ts2.Val = TabStopValues.Right
        ts2.Position = 9360

        tabs.Append(ts1)
        tabs.Append(ts2)
        self.paraProps.Append(tabs)

        self.style.Append(self.paraProps)

class ElementBoxStyle(BaseStyle):

    def __init__(self):
        BaseStyle.__init__(self)
        self.style = BaseStyle.getInheritingStyle(self, "CK12ElementBox", "CK12ElementBox")
        self.makeQuickStyle()

class ElementBoxHeaderStyle(BaseStyle):

    def __init__(self):
        BaseStyle.__init__(self)
        self.style = BaseStyle.getInheritingStyle(self, "CK12ElementBoxHeader", "CK12ElementBoxHeader")
        self.makeQuickStyle()

        self.runProps = StyleRunProperties()
        fontSize = FontSize()
        fontSize.Val = "24"
        self.runProps.Append(fontSize)
        self.runProps.Append(Bold())
        color = Color()
        color.Val = "632423"
        self.runProps.Append(color)
        self.style.Append(self.runProps)

        self.paraProps = StyleParagraphProperties()
        self.paraProps.Append(KeepNext())
        self.style.Append(self.paraProps)

STYLES = {
            "CK12Base": BaseStyle(),
            "CK12LessonBase": LessonBaseStyle(),
            "CK12ChapterTitle": TitleStyle(),
            "CK12SectionTitle": SectionTitleStyle(),
            "CK12SubsectionTitle": SubsectionTitleStyle(),
            "CK12SubsubsectionTitle": SubsubsectionTitleStyle(),
            "CK12NumberedList": NumberedListStyle(),
            "CK12BulletedList": BulletedListStyle(),
            "CK12BlockEquation": BlockEquationStyle(),
            "MTDisplayEquation": MathTypeDisplayEquationStyle(),
            "CK12InlineEquation": InlineEquationStyle(),
            "CK12BlockImage": BlockImageStyle(),
            "CK12InlineImage": InlineImageStyle(),
            "CK12ImageCaption": ImageCaptionStyle(),
            "CK12TableCell": TableCellStyle(),
            "CK12TableHeaderCell": TableHeaderCellStyle(),
            "CK12Emphasis": Emphasis(),
            "CK12Hyperlink": HyperLinkStyle(),
            "CK12LiteralLayout": LiteralLayoutStyle(),
            "CK12BlockQuote": BlockQuoteStyle(),
            "CK12Indent": IndentStyle(),
            "CK12DefinitionTerm": DefinitionTermStyle(),
            "CK12DefinitionDesc": DefinitionDescriptionStyle(),
            "CK12RawData": RawDataStyle(),
            "CK12ElementBox": ElementBoxStyle(),
            "CK12ElementBoxHeader": ElementBoxHeaderStyle(),
        }


def addStyles(stylePart, mainPart, numPart):
    styles = {
                "CK12Base": BaseStyle(),
                "CK12LessonBase": LessonBaseStyle(),
                "CK12ChapterTitle": TitleStyle(),
                "CK12SectionTitle": SectionTitleStyle(),
                "CK12SubsectionTitle": SubsectionTitleStyle(),
                "CK12SubsubsectionTitle": SubsubsectionTitleStyle(),
                "CK12NumberedList": NumberedListStyle(),
                "CK12BulletedList": BulletedListStyle(),
                "CK12BlockEquation": BlockEquationStyle(),
                "MTDisplayEquation": MathTypeDisplayEquationStyle(),
                "CK12InlineEquation": InlineEquationStyle(),
                "CK12BlockImage": BlockImageStyle(),
                "CK12InlineImage": InlineImageStyle(),
                "CK12ImageCaption": ImageCaptionStyle(),
                "CK12TableCell": TableCellStyle(),
                "CK12TableHeaderCell": TableHeaderCellStyle(),
                "CK12Emphasis": Emphasis(),
                "CK12Hyperlink": HyperLinkStyle(),
                "CK12LiteralLayout": LiteralLayoutStyle(),
                "CK12BlockQuote": BlockQuoteStyle(),
                "CK12Indent": IndentStyle(),
                "CK12DefinitionTerm": DefinitionTermStyle(),
                "CK12DefinitionDesc": DefinitionDescriptionStyle(),
                "CK12RawData": RawDataStyle(),
                "CK12ElementBox": ElementBoxStyle(),
                "CK12ElementBoxHeader": ElementBoxHeaderStyle(),
            }

    for key in styles.keys():
        val = styles.get(key)
        #if key == 'CK12NumberedList':
        #    val.makeRealListType(mainPart, numPart)
        stylePart.Styles.Append(val.getStyle())

