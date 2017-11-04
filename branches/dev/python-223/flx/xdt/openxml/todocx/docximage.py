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

from openxml.todocx.styles import *
from openxml.todocx.docxobject import DocxObject
from openxml.common import ENVIRONMENT_PROPS

class ImageHandler(object):
    """ Class to manage images hosted in the fedora repository
    """

    flx2Host = ENVIRONMENT_PROPS['FLX2_HOST']

    def __init__(self, url):
        self.url = url
        self.perma = None
        self.resourceQueryUrl = None

        if 'render/perma/resource' in self.url:
            self.perma = self.url.split('render/perma/resource')[1]

        self.getImageInfo()

    def getImageInfo(self):
        if self.perma:
            self.resourceQueryUrl = "http://%s/flx/get/perma/resource/info%s" % (self.flx2Host, self.perma)
            print "Querying: %s" % self.resourceQueryUrl
            res = urllib2.urlopen(self.resourceQueryUrl, timeout=300)
            resp = res.read()
            j = json.loads(resp)
            if j['responseHeader']['status'] == 0:
                self.originalName = j['response']['resource']['originalName']
                self.description = j['response']['resource']['description']
                self.name = j['response']['resource']['originalName']
                self.isExternal = j['response']['resource']['isExternal']
                self.streamable = j['response']['resource']['streamable']
            else:
                raise Exception('Error retrieving resource info: %s' % resp)
        else:
            ## Not a fedora url - assume png
            md5 = hashlib.md5()
            md5.update(self.url)
            self.name = md5.hexdigest() + ".png"
            self.originalName = self.name
            self.description = ''

    def getImage(self):
        print "Getting image for url: %s" % self.url
        (filename, headers) = urllib.urlretrieve(self.url)
        if not os.path.exists(filename):
            raise Exception('Failed to download object from %s' % self.url)

        print headers
        print filename
        return filename

class DocxImage(DocxObject):
    """ Class to add image to the document package
        Note: This does not add a reference to the image
    """

    DocxBlockImageType = "CK12BlockImage"
    DocxInlineImageType = "CK12InlineImage"

    def __init__(self, mainPart, imageFile, instanceId):
        self.imageTypes = {
                ".bmp": ImagePartType.Bmp,
                ".gif": ImagePartType.Gif,
                ".tiff": ImagePartType.Tiff,
                ".ico": ImagePartType.Icon,
                ".pcx": ImagePartType.Pcx,
                ".jpg": ImagePartType.Jpeg,
                ".jpeg": ImagePartType.Jpeg,
                ".png": ImagePartType.Png,
                ".wmf": ImagePartType.Wmf,
            }
        self.mainPart = mainPart
        self.file = imageFile
        self.comments = None
        self.cleanupImage = False
        if '://' in self.file:
            ih = ImageHandler(self.file)
            self.imageName = ih.originalName
            self.localImageFile = ih.getImage()
            self.cleanupImage = True
        elif os.path.exists(imageFile):
            self.imageName = os.path.basename(imageFile)
            self.localImageFile = self.file
        else:
            raise Exception('Invalid image file: %s' % imageFile)
        self.instanceId = instanceId
        self.captionPrefix = "Figure "
        ext = os.path.splitext(self.imageName)[1].lower()
        if ext in self.imageTypes.keys():
            self.imageType = self.imageTypes[ext]
        else:
            ## Default to jpeg
            self.imageType = ImagePartType.Jpeg
        self.imagePart = None
        self.imageId = None
        print "Loading image from: %s" % self.localImageFile
        image = DImage.FromFile(self.localImageFile)
        self.width = image.Width
        self.height = image.Height
        self.horizReso = image.HorizontalResolution
        self.vertReso = image.VerticalResolution
        print "Image dims: %d x %d" % (self.width, self.height)
        image.Dispose()

        self.bookmarkId = None
        self.bookmarkName = None
        self.drawing = None
        print "Got image!"

    def saveImagePart(self):
        """ 
            Save the image part to document
        """
        ## Add images
        self.imagePart = self.mainPart.AddImagePart(self.imageType)
        stream = FileStream(self.localImageFile, FileMode.Open)
        self.imagePart.FeedData(stream)
        stream.Close()
        self.imageId = self.mainPart.GetIdOfPart(self.imagePart)
        if self.cleanupImage:
            os.remove(self.localImageFile)
        return self.imageId

    def getImageDimensions(self):
        return (self.width, self.height)

    def getImageDimensionsInEMU(self, width=0, height=0, dpi=None):
        """
            Convert image dimensions to English Metric Units
        """
        aspect = float(self.width)/float(self.height)
        if width and not height:
            self.width = width
            self.height = long(float(self.width)/aspect)
        if height and not width:
            self.height = height
            self.width = long(float(self.height) * aspect)
        if height and width:
            self.height = height
            self.width = width

        wemu = long(float(self.width) * float(914400) / float(self.horizReso))
        hemu = long(float(self.height) * float(914400) / float(self.vertReso))

        ## TODO: Compute max width of document
        #maxWidthPx = 460
        #maxWidth = long(float(maxWidthPx) * float(914400)/float(self.horizReso))
        maxWidth = 5842000L
        if maxWidth < wemu:
                wemu = maxWidth
                hemu = long(wemu/aspect)
        return (wemu, hemu)

    def getDrawingObject(self, desiredWidth=0, desiredHeight=0, float=False):
        """
            Get new paragraph with the image embedded in it
        """
        picture = pic.Picture()
        nvpp = pic.NonVisualPictureProperties()
        nvdp = pic.NonVisualDrawingProperties()
        nvdp.Id = System.UInt32(0)
        nvdp.Name = self.imageName
        nvpdp = pic.NonVisualPictureDrawingProperties()
        nvpp.Append(nvdp, nvpdp)
        picture.Append(nvpp)

        be = d.BlipExtension()
        be.Uri = "{28A0092B-C50C-407E-A947-70E740481C1C}"
        bel = d.BlipExtensionList()
        bel.AppendChild(be)

        b = d.Blip()
        b.Append(bel)
        ## Embed the image
        b.Embed = self.imageId
        b.CompressionState = d.BlipCompressionValues.Print

        stretch = d.Stretch(d.FillRectangle())

        bf = pic.BlipFill()
        bf.Append(b, stretch)
        picture.Append(bf)

        ## Shape
        offset = d.Offset()
        offset.X = offset.Y = System.Int64(0)
        extents = d.Extents()

        ## Convert pixel height to emu
        emuW, emuH = self.getImageDimensionsInEMU(width=desiredWidth, height=desiredHeight)
        extents.Cx = System.Int64(emuW)
        extents.Cy = System.Int64(emuH)
        t2d = d.Transform2D()
        t2d.Append(offset, extents)

        pg = d.PresetGeometry(d.AdjustValueList())
        pg.Preset = d.ShapeTypeValues.Rectangle

        sp = pic.ShapeProperties()
        sp.Append(t2d, pg)
        picture.Append(sp)

        gd = d.GraphicData()
        gd.Uri = "http://schemas.openxmlformats.org/drawingml/2006/picture"
        gd.AppendChild(picture)

        g = d.Graphic()
        g.Append(gd)

        gfl = d.GraphicFrameLocks()
        gfl.NoChangeAspect = True
        nvgfdp = dw.NonVisualGraphicFrameDrawingProperties()
        nvgfdp.Append(gfl)

        docP = dw.DocProperties()
        docP.Id = System.UInt32(self.instanceId)
        docP.Name = self.captionPrefix
        desc = ''
        commentKeys = ['author', 'license']
        if self.comments:
            for key in commentKeys:
                if self.comments.get(key):
                    desc += '@@%s: %s\n' % (key, self.comments[key])
        docP.Description = desc

        extent = dw.Extent()
        extent.Cx = System.Int64(emuW)
        extent.Cy = System.Int64(emuH)

        effExtent = dw.EffectExtent()
        effExtent.LeftEdge = System.Int64(0)
        effExtent.RightEdge = System.Int64(0)
        effExtent.TopEdge = System.Int64(0)
        effExtent.BottomEdge = System.Int64(0)

        drawing = Drawing()
        if float:
            anchor = dw.Anchor()
            wrap = dw.WrapSquare()
            wrap.WrapText = dw.WrapTextValues.BothSides
            anchor.SimplePos = False
            anchor.BehindDoc = False
            anchor.AllowOverlap = False
            anchor.Locked = False
            anchor.RelativeHeight = System.UInt32(10)
            anchor.SimplePosition = dw.SimplePosition()
            anchor.SimplePosition.X = System.Int64(0)
            anchor.SimplePosition.Y = System.Int64(0)
            anchor.HorizontalPosition = dw.HorizontalPosition()
            anchor.HorizontalPosition.RelativeFrom = dw.HorizontalRelativePositionValues.Character
            anchor.HorizontalPosition.HorizontalAlignment = dw.HorizontalAlignment()
            anchor.HorizontalPosition.HorizontalAlignment.Text = "left"
            anchor.VerticalPosition = dw.VerticalPosition()
            anchor.VerticalPosition.RelativeFrom = dw.VerticalRelativePositionValues.Paragraph
            anchor.VerticalPosition.PositionOffset = dw.PositionOffset()
            anchor.VerticalPosition.PositionOffset.Text = "0"
            anchor.Append(extent, effExtent, wrap, docP, nvgfdp, g)
            anchor.DistanceFromTop = System.UInt32(0)
            anchor.DistanceFromBottom = System.UInt32(0)
            anchor.DistanceFromLeft = System.UInt32(0)
            anchor.DistanceFromRight = System.UInt32(0)
            anchor.LayoutInCell = False
            drawing.Append(anchor)
        else:
            inlineD = dw.Inline()
            inlineD.Append(extent, effExtent, docP, nvgfdp, g)
            inlineD.DistanceFromTop = System.UInt32(0)
            inlineD.DistanceFromBottom = System.UInt32(0)
            inlineD.DistanceFromLeft = System.UInt32(0)
            inlineD.DistanceFromRight = System.UInt32(0)
            drawing.Append(inlineD)
        self.drawing = drawing
        return self.drawing

    def getNewImageRun(self, type=DocxInlineImageType, desiredWidth=0, desiredHeight=0, hyperLink=None):
        drawing = self.getDrawingObject(desiredWidth, desiredHeight)
        ## This is an image within a hyperlink
        if hyperLink:
            docPr = None
            for e in drawing.Descendants[dw.DocProperties]():
                docPr = e
                break
            ## Get the link properties
            hlinkOnClick = d.HyperlinkOnClick()
            rid = None
            if hyperLink.Id:
                rid = hyperLink.Id.ToString()
            external = False
            if rid:
                ## External link
                external = True
                relPart = self.mainPart.GetReferenceRelationship(rid)
                url = relPart.Uri.ToString()
                tooltip = hyperLink.Tooltip.ToString()
            else:
                ## Internal link
                external = False
                url = hyperLink.Anchor.ToString()
                tooltip = hyperLink.Tooltip.ToString()
                if not url.startswith('#'):
                    url = '#' + url
                print "Anchor: %s" % url

            uriType = System.UriKind.RelativeOrAbsolute
            if '://' in url:
                uriType = System.UriKind.Absolute
            else:
                uriType = System.UriKind.Relative
    
            uri = System.Uri(url, uriType)
            linkRel = self.mainPart.AddHyperlinkRelationship(uri, external)
            hlinkOnClick.Id = linkRel.Id
            hlinkOnClick.Tooltip = tooltip
            docPr.Append(hlinkOnClick)
        run = STYLES[type].getNewRun()
        run.Append(drawing)
        return run

    def getNewImageParagraph(self, type=DocxBlockImageType, desiredWidth=0, desiredHeight=0, alignment='left', float=False):
        drawing = self.getDrawingObject(desiredWidth, desiredHeight, float=float)
        para = STYLES[type].getNewParagraph()
        paraProps = BaseStyle.getFirstDescendantOfType(para, ParagraphProperties)
        if paraProps:
            j = Justification()
            if alignment == 'left':
                j.Val = JustificationValues.Left
            elif alignment == 'right':
                j.Val = JustificationValues.Right
            elif alignment == 'center':
                j.Val = JustificationValues.Center
            paraProps.Append(j)

        if self.bookmarkName:
            bs = BookmarkStart()
            bs.Id = str(self.bookmarkId)
            bs.Name = self.bookmarkName
            para.Append(bs)

        para.Append(Run(drawing))

        if self.bookmarkName:
            be = BookmarkEnd()
            be.Id = str(self.bookmarkId)
            para.Append(be)

        return para

    def addCaptionParagraph(self, shortCaption=None, longCaption=None, imageNumber=None):
        para = None
        if longCaption:
            para = STYLES['CK12ImageCaption'].getNewParagraph()
            r = Run()
            r.Append(self.getSpacePreservingText(self.captionPrefix))
            para.Append(r)

            r = Run()
            sf = SimpleField()
            sf.Instruction = "SEQ Figure"
            rp = RunProperties()
            np = NoProof()
            np.Val = True
            rp.Append(np)
            r.Append(rp)
            if not imageNumber:
                imageNumber = self.instanceId
            else:
                ## Change the id in docPr tag
                for node in self.drawing.Descendants[OpenXmlElement]():
                    if type(node) == dw.DocProperties:
                        node.Id = System.UInt32(imageNumber)

            r.Append(self.getSpacePreservingText(str(imageNumber) + " "))
            sf.Append(r)
            para.Append(sf)

            if '%20' in longCaption:
                longCaption = urllib.unquote(longCaption)
            r = Run()
            r.Append(self.getSpacePreservingText(longCaption))
            para.Append(r)

        if shortCaption and self.drawing:
            for node in self.drawing.Descendants[OpenXmlElement]():
                if type(node) == dw.DocProperties:
                    if not node.Description:
                        node.Description = ''
                    node.Description = shortCaption + '\n' + node.Description.ToString()

                    #hv = d.HyperlinkOnHover()
                    #hv.Tooltip = shortCaption
                    #node.Append(hv)

        return para

    def addVideoData(self, data):
        self.videoPara = STYLES['CK12RawData'].getNewParagraph()

        text = "%s" % str(data)
        text = text.replace("'", "")
        text = text.replace('"', '')
        t = Text()
        t.Space = SpaceProcessingModeValues.Preserve
        t.Text = text

        r = Run()
        r.Append(t)
        self.videoPara.Append(r)

        return self.videoPara

