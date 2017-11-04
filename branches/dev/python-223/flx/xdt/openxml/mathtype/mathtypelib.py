# -*- coding: utf-8 -*-

import sys
import clr
import traceback
import os

dir = os.path.join(os.path.abspath(os.path.dirname(__file__)), "bin")
## Append bin directory to path
sys.path.append(dir)
clr.AddReferenceToFile('MTSDKDN.dll')

clr.AddReference("System.Drawing")
clr.AddReference("System.Windows.Forms")

import System
from System import Array

from System.Text import StringBuilder
import System.Windows.Forms
import System.Drawing
import System.Drawing.Imaging

import System.Runtime.InteropServices
from System.Runtime.InteropServices.ComTypes import IDataObject, FORMATETC, STGMEDIUM
from MTSDKDN import *

class MTSDK(object):

    def __init__(self):
        self.initialized = False

    def Init(self):
        if not self.initialized:
            result = MathTypeSDK.Instance.MTAPIConnectMgn(MTApiStartValues.mtinitLAUNCH_AS_NEEDED, 30)
            if result == MathTypeReturnValue.mtOK:
                self.initialized = True
        return self.initialized

    def DeInit(self):
        MathTypeSDK.Instance.MTAPIDisconnectMgn()
        self.initialized = False

class EquationOutput(object):
    def __init__(self, strOutTrans=None, log=None):
        self.strOutTrans = strOutTrans
        self.iType = None
        self.iFormat = None
        self.fileName = None
        self.strEquation = None
        self.log = log
        
    def logStr(self, str):
        if self.log:
            self.log.info(str)
        else:
            print str

    def Put(self):
        pass

class EquationOutputFile(EquationOutput):
    
    def __init__(self, fileName, strOutTrans=None, log=None):
        EquationOutput.__init__(self, strOutTrans, log=log)
        self.fileName = fileName
        self.iType = MTXFormEqn.mtxfmFILE

    def Put(self):
        return True

class EquationOutputFileText(EquationOutputFile):

    def __init__(self, fileName, strOutTrans=None, log=None):
        EquationOutputFile.__init__(self, fileName, strOutTrans, log=log)
        self.iType = MTXFormEqn.mtxfmLOCAL
        self.iFormat = MTXFormEqn.mtxfmTEXT

    def Put(self):
        f = open(self.fileName, "w")
        f.write("%s\n" % self.strEquation)
        f.close()
        return True

class EquationOutputFileWMF(EquationOutputFile):

    def __init__(self, fileName):
        EquationOutputFile.__init__(self, fileName)
        self.iType = MTXFormEqn.mtxfmFILE
        self.iFormat = MTXFormEqn.mtxfmPICT

class EquationOutputFileEPS(EquationOutputFile):

    def __init__(self, fileName):
        EquationOutputFile.__init__(self, fileName)
        self.iType = MTXFormEqn.mtxfmFILE
        self.iFormat = MTXFormEqn.mtxfmEPS_NONE

class EquationInput(object):

    def __init__(self, strInTrans=None, log=None):
        self.strInTrans = strInTrans
        self.iType = None
        self.iFormat = None
        self.strEquation = None
        self.bMTEF = None
        self.iMTEF_Length = None
        self.fileName = None
        self.strMTEF = None
        self.log = None

        self.sdk = MTSDK()

    def logStr(self, str):
        if self.log:
            self.log.info(str)
        else:
            print str

    def Get(self):
        return False

    def GetMTEF(self):
        return False

class EquationInputFile(EquationInput):

    def __init__(self, fileName, strInTrans=None, log=None):
        EquationInput.__init__(self, strInTrans, log=log)
        self.fileName = fileName
        self.iType = MTXFormEqn.mtxfmLOCAL

    def CompareArrays(self, left, leftStart, leftLen, right, rightStart, rightLen):
        leftCompareNum = leftLen - leftStart
        rightCompareNum = rightLen - rightStart
        compareNum = None
        if leftCompareNum > rightCompareNum:
            compareNum = rightCompareNum
        else:
            compareNum = leftCompareNum

        x = 0
        while x < compareNum:
            if left.GetValue(leftStart+x) != right.GetValue(rightStart+x):
                return False
            x += 1

        return True

    def RawDeserialize(self, rawData, position, anyType):
        rawsize = System.Runtime.InteropServices.Marshal.SizeOf(anyType)
        if rawsize > rawData.Length:
            return None
        buffer = System.Runtime.InteropServices.Marshal.AllocHGlobal(rawsize)
        System.Runtime.InteropServices.Marshal.Copy(rawData, position, buffer, rawsize)
        retobj = System.Runtime.InteropServices.Marshal.PtrToStructure(buffer, anyType)
        System.Runtime.InteropServices.Marshal.FreeHGlobal(buffer)
        return retobj

class WmfForm(System.Windows.Forms.Form):

    pass

class EquationInputFileWMF(EquationInputFile):

    def __init__(self, fileName, log=None):
        EquationInputFile.__init__(self, fileName, log)
        self.iFormat = MTXFormEqn.mtxfmMTEF
        self.succeeded = False
        self.wf = WmfForm()
        self.metafile = None
        self.strSig = "AppsMFC"
        self.wmfHeader = wmfHeader()

    def Get(self):
        return True

    def GetMTEF(self):
        self.Play()
        if not self.succeeded:
            return False
        return True

    def Play(self):
        self.succeeded = False
        self.metafile = System.Drawing.Imaging.Metafile(self.fileName)
        metafileDelegate = System.Drawing.Graphics.EnumerateMetafileProc(self.MetafileCallback)
        destPoint = System.Drawing.Point(20, 10)
        graphics = self.wf.CreateGraphics()
        graphics.EnumerateMetafile(self.metafile, destPoint, metafileDelegate)

    def MetafileCallback(self, recordType, flags, dataSize, data, callbackData):
        dataArray = None
        if data != System.IntPtr.Zero:
            dataArray = Array.CreateInstance(System.Byte, dataSize)
            System.Runtime.InteropServices.Marshal.Copy(data, dataArray, 0, dataSize)
            if recordType == System.Drawing.Imaging.EmfPlusRecordType.WmfEscape and dataSize >= System.Runtime.InteropServices.Marshal.SizeOf(self.wmfHeader) and not self.succeeded:
                self.wmfHeader = self.RawDeserialize(dataArray, 0, self.wmfHeader.GetType())
                if self.wmfHeader.strSig.Equals(self.strSig, System.StringComparison.CurrentCultureIgnoreCase):
                    enc = System.Text.ASCIIEncoding()
                    strCompanyInfo = enc.GetString(dataArray, System.Runtime.InteropServices.Marshal.SizeOf(self.wmfHeader), self.wmfHeader.iDataLen)
                    iNull = strCompanyInfo.IndexOf('\0')
                    if iNull >= 0:
                        mtefStart = System.Runtime.InteropServices.Marshal.SizeOf(self.wmfHeader) + iNull + 1
                        self.iMTEF_Length = self.wmfHeader.iDataLen
                        self.bMTEF = Array.CreateInstance(System.Byte, self.iMTEF_Length)
                        Array.Copy(dataArray, mtefStart, self.bMTEF, 0, self.iMTEF_Length)
                        self.succeeded = True

        self.metafile.PlayRecord(recordType, flags, dataSize, dataArray)

        return True

def getIDataObject():

    CLSCTX_INPROC_SERVER = 4

    clsid = System.Guid("0002CE03-0000-0000-C000-000000000046")
    #clr.AddReferenceToTypeLibrary(clsid)
    IID_IUnknown = System.Guid("00000000-0000-0000-C000-000000000046")
    instance = None
    hResult, a, b, instance = MathTypeSDK.Ole32Methods.CoCreateInstance(clsid, None, CLSCTX_INPROC_SERVER, IID_IUnknown)
    if hResult != 0:
        print "Got null instance"
        return None

    return instance
    #return clr.Convert(instance, System.Runtime.InteropServices.ComTypes.IDataObject)

class EquationInputFileText(EquationInputFile):

    def __init__(self, fileName, strInTrans, log=None):
        EquationInputFile.__init__(self, fileName, strInTrans ,log)
        self.iFormat = MTXFormEqn.mtxfmMTEF

    def Get(self):
        try:
            self.strEquation = System.IO.File.ReadAllText(self.fileName)
            self.logStr("Input equation: %s" % self.strEquation)
            return True
        except Exception, e:
            self.logStr(e)
            return False

    def GetMTEF(self):
        ret = False

        if not self.sdk.Init():
            self.logStr("Failed to initialize SDK")
            return ret

        dataObject = getIDataObject()
        #dataObject = clr.Convert(dataObject, System.Runtime.InteropServices.ComTypes.IDataObject.GetType())
        self.logStr(dataObject)
        if not dataObject:
            self.logStr("ERROR: Got null dataObject")
            self.sdk.DeInit()
            return ret

        formatEtc = FORMATETC()
        stgMedium = STGMEDIUM()

        try:

            ## Setup the formatting information to use for the conversion
            FORMATETC.cfFormat.SetValue(formatEtc, System.Int16(System.Windows.Forms.DataFormats.GetFormat(self.strInTrans).Id))
            FORMATETC.dwAspect.SetValue(formatEtc,System.Runtime.InteropServices.ComTypes.DVASPECT.DVASPECT_CONTENT)
            FORMATETC.lindex.SetValue(formatEtc, -1)
            FORMATETC.ptd.SetValue(formatEtc, System.IntPtr(0))
            FORMATETC.tymed.SetValue(formatEtc, System.Runtime.InteropServices.ComTypes.TYMED.TYMED_HGLOBAL)

            ## Setup the MathML content to convert
            STGMEDIUM.unionmember.SetValue(stgMedium, System.Runtime.InteropServices.Marshal.StringToHGlobalAuto(self.strEquation))
            STGMEDIUM.tymed.SetValue(stgMedium, System.Runtime.InteropServices.ComTypes.TYMED.TYMED_HGLOBAL)
            STGMEDIUM.pUnkForRelease.SetValue(stgMedium, 0)

            ## Perform the conversion
            try:
                formatEtcRef = clr.Reference[FORMATETC](formatEtc)
                System.Runtime.InteropServices.ComTypes.IDataObject.SetData(dataObject, formatEtc, stgMedium, False)
            except Exception, e:
                raise e

            ## Set the format for the output
            FORMATETC.cfFormat.SetValue(formatEtc, System.Int16(System.Windows.Forms.DataFormats.GetFormat("MathType EF").Id))
            FORMATETC.dwAspect.SetValue(formatEtc, System.Runtime.InteropServices.ComTypes.DVASPECT.DVASPECT_CONTENT)
            FORMATETC.lindex.SetValue(formatEtc, -1)
            FORMATETC.ptd.SetValue(formatEtc, System.IntPtr(0))
            FORMATETC.tymed.SetValue(formatEtc, System.Runtime.InteropServices.ComTypes.TYMED.TYMED_ISTORAGE)

            ## Create a blank data structure to hold the converted result
            stgMedium = STGMEDIUM()
            STGMEDIUM.tymed.SetValue(stgMedium, System.Runtime.InteropServices.ComTypes.TYMED.TYMED_NULL)
            STGMEDIUM.pUnkForRelease.SetValue(stgMedium, 0)

            ## Get the conversion result in MTEF format
            stgMedium = System.Runtime.InteropServices.ComTypes.IDataObject.GetData(dataObject, formatEtc)
            self.logStr(stgMedium.unionmember)

        except System.Runtime.InteropServices.COMException, e:
            self.logStr("MathML conversion to MathType threw an exception: %s" % str(e))
            self.logStr(e)
            self.sdk.DeInit()
            return ret

        handleRef = System.Runtime.InteropServices.HandleRef(None, stgMedium.unionmember)

        try:
            ## Lock in the handle to get the pointer to the data
            ptrToHandle = MathTypeSDK.GlobalLock(handleRef)

            ## Get the size of the memory block
            self.iMTEF_Length = MathTypeSDK.GlobalSize(handleRef)

            ## New an array of bytes and Marshal the data across
            self.bMTEF = Array.CreateInstance(System.Byte, self.iMTEF_Length)
            System.Runtime.InteropServices.Marshal.Copy(ptrToHandle, self.bMTEF, 0, self.iMTEF_Length)
            self.strMTEF = System.Text.ASCIIEncoding.ASCII.GetString(self.bMTEF)
            ret = True
        except Exception, e:
            self.logStr("Generation of WMF from MathType failed: %s" % str(e))
            self.logStr(e)
        finally:
            MathTypeSDK.GlobalUnlock(handleRef)

        self.sdk.DeInit()
        return ret


class ConvertEquation(object):

    def __init__(self, log=None):
        self.ei = None
        self.eo = None
        self.sdk = MTSDK()
        self.log = log

    def logStr(self, str):
        if self.log:
            self.log.info(str)
        else:
            print str

    def Convert(self, ei, eo):
        self.ei = ei
        self.eo = eo
        return self.__convert()

    def __convert(self):

        ret = False

        self.logStr("Converting %s to %s" % (str(self.ei), str(self.eo)))
        self.logStr("Get equation: %s" % self.ei)

        if self.ei.Get():
            self.logStr("Get MTEF")
            if self.ei.GetMTEF():
                self.logStr("Convert Equation")
                if self.ConvertToOutput():
                    self.logStr("Write Equation: %s" % self.eo.fileName)
                    if self.eo.Put():
                        ret = True

        self.logStr("Convert success: %s" % ret)
        return ret

    def SetTranslator(self):
        if not self.eo.strOutTrans:
            return True

        self.logStr("Loading translator: %s %s %s" % (MTXFormSetTranslator.mtxfmTRANSL_INC_NAME, MTXFormSetTranslator.mtxfmTRANSL_INC_DATA, self.eo.strOutTrans))
        stat = MathTypeSDK.Instance.MTXFormSetTranslatorMgn(
                MTXFormSetTranslator.mtxfmTRANSL_INC_NAME + MTXFormSetTranslator.mtxfmTRANSL_INC_DATA,
                self.eo.strOutTrans)
        self.logStr("Loaded translator? %s" % stat)
        return stat == MathTypeReturnValue.mtOK

    def ConvertToOutput(self):
        ret = False
        try:
            if not self.sdk.Init():
                self.logStr("Failed to initialize sdk")
                return False

            if MathTypeSDK.Instance.MTXFormResetMgn() == MathTypeReturnValue.mtOK and self.SetTranslator():
                stat = 0
                iBufferLength = 5000
                strDest = StringBuilder(iBufferLength)
                dims = clr.Reference[MTAPI_DIMS](MTAPI_DIMS())

                ## Convert
                stat = MathTypeSDK.Instance.MTXFormEqnMgn(
                        self.ei.iType,
                        self.ei.iFormat,
                        self.ei.bMTEF,
                        self.ei.iMTEF_Length,
                        self.eo.iType,
                        self.eo.iFormat,
                        strDest,
                        iBufferLength,
                        self.eo.fileName,
                        dims)

                ## Save equation
                self.logStr("return: %d" % stat)
                self.logStr("Equation: %s" % strDest)
                strEqn = strDest.ToString()
                ## Sometimes the return value is -14 but the equation is actually converted correctly
                if stat == MathTypeReturnValue.mtOK or (strEqn and strEqn.strip()):
                    self.eo.strEquation = strEqn
                    ret = True

            else:
                self.logStr("Something wrong! MathTypeSDK.Instance.MTXFormResetMgn: %s" % MathTypeSDK.Instance.MTXFormResetMgn())

            self.sdk.DeInit()
        except Exception, e:
            self.logStr(e)
        return ret

if __name__ == '__main__':

    import sys
    if len(sys.argv) > 1:
        inputFile = sys.argv[1]
    else:
        inputFile = "c:/cygwin/tmp/13385083310215758-1-None.wmf"
    ce = ConvertEquation()
    ei = EquationInputFileWMF(inputFile)
    if not ei:
        raise Exception("Failed to create EquationInputFileWMF object")
    eo = EquationOutputFileText("image1.txt", "Texify.tdl")
    ret = ce.Convert(ei, eo)
    if ret:
        print "Worked!"
    else:
        print "Failed!"

    ce = ConvertEquation()
    ei = EquationInputFileText("tex.txt", ClipboardFormats.cfTeX)
    if not ei:
        raise Exception("Failed to create EquationInputFileText")
    outputFile = os.path.abspath(os.path.join(".", "image2.wmf"))
    print outputFile
    eo = EquationOutputFileWMF(outputFile)
    ret = ce.Convert(ei, eo)
    if ret:
        print "Converted to WMF"
    else:
        print "Failed to convert to WMF"
    if not os.path.exists(outputFile):
        print "File not created!"


    ce = ConvertEquation()
    ei = EquationInputFileText("tex.txt", ClipboardFormats.cfTeX)
    if not ei:
        raise Exception("Failed to create EquationInputFileText")
    outputFile = os.path.abspath(os.path.join(".", "image2.eps"))
    print outputFile
    eo = EquationOutputFileEPS(outputFile)
    ret = ce.Convert(ei, eo)
    if ret:
        print "Converted to EPS"
    else:
        print "Failed to convert to EPS"
    if not os.path.exists(outputFile):
        print "File not created!"

