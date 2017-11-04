import os
import logging
import traceback
from flx.controllers.celerytasks.generictask import GenericTask
from flx.lib.hwpprinter import HwpPrinter
from flx.model import api
from datetime import datetime
from time import time
from tempfile import NamedTemporaryFile
from flx.lib import helpers as h
import json

logger = logging.getLogger(__name__)

def save_worksheet_resource(resourcePath, name, resourceType):
    try:
        resourceDict = {}
        resourceDict['resourceType'] = api.getResourceTypeByName(name=resourceType)
        resourceDict['name'] = name
        resourceDict['purpose'] = 'display'
        resourceDict['handle'] = create_timestamp()
        resourceDict['description'] = ''
        resourceDict['isExternal'] = False
        resourceDict['uriOnly'] = False
        newResourcePath = os.path.dirname(resourcePath) + '/' + 'workbook-%s_%s.%s' %(create_timestamp(), name.replace('/', '_').replace('"', ''), resourceType)
        newResourcePath = newResourcePath.encode('utf-8')
        os.rename(resourcePath, newResourcePath)
        resourceDict['uri'] = open(newResourcePath, 'rb')
        resourceDict['creationTime'] = datetime.now()
        resourceDict['ownerID'] = 1
        resourceRevision = api.createResource( resourceDict=resourceDict )
        return resourceRevision.resource.getUri()
    except Exception, e:
        logger.error('Could not add worksheet into resource repository')
        raise e

def create_timestamp():
    return datetime.now().strftime("%Y%m%d%H%M%S%f")

class worksheetTask(GenericTask):

    def __init__(self, **kwargs):
        GenericTask.__init__(self, **kwargs)
        self.routing_key = "print"

class worksheet(worksheetTask):

    recordToDB = True

    def run(self, worksheetHTML, answerKey, title, doHTML, doPDF, **kwargs):
        e = None  
        try:
            #This will run the database recording task if recordToDB is set to True
            worksheetTask.run(self, **kwargs)
            result = []
            renderCount = 0 
            resourceID = int(time())

            #Creating HTML worksheet
            if doHTML:
                worksheetHTMLDict = self.saveWorksheetHTML(title, worksheetHTML )
                result.append(worksheetHTMLDict)
                renderCount = 1
            #Creating PDF worksheet
            if doPDF:
                worksheetPDF = self.createWorksheetPDF(worksheetHTML)
                if worksheetPDF:
                    worksheetPDFDict = self.saveWorksheetPDF(title, worksheetPDF)
                    result.append(worksheetPDFDict)
                    renderCount = 2
                else:
                    logger.error('Could not generate pdf, f2pdf issue?')
                    result.append({'worksheetType':'pdf', 'uri':''})

            self.userdata = json.dumps(result)     
            resultdata = {'downloadUri' : result, 'renderCount' : renderCount} 
            eventdata = json.dumps({'resultData' : resultdata, 'printType':'Workbook', 'title':title.encode('utf-8')})

            e = api.createEventForType(typeName='PRINT_GENERATION_SUCCESSFUL', objectID=resourceID, objectType='workbook', eventData=json.dumps(eventdata), ownerID=kwargs['user'], processInstant=False) 

            return result
        except Exception as exceptObj:
            logger.error(exceptObj.__str__())
            logger.error(traceback.format_exc())
            self.userdata = json.dumps({'printType':'Workbook', 'title':title.encode('utf-8')})
            e = api.createEventForType(typeName='PRINT_GENERATION_FAILED', objectID=resourceID, objectType='workbook', eventData=json.dumps(self.userdata), ownerID=kwargs['user'], processInstant=False)
        finally:
            if not e:
                logger.error('Unable to send the notification as Event object')
            else:
                n = api.createNotification(eventTypeID=e.eventTypeID, objectID=resourceID, objectType='workbook', subscriberID=kwargs['user'], type='email', frequency='instant')
                h.processInstantNotifications([e.id], notificationIDs=[n.id], user=kwargs['user'], noWait=True)



    def createWorksheetPDF(self, worksheetHTML):
        printer = HwpPrinter()
        printer.setLogger(logger)
        #workingDir    = self.config.get('worksheet_loc')
        workingDir = '/tmp/hwp/worksheet'
        f2pdfHome     = self.config.get('f2pdf_home')
        f2pdfTemplate = self.config.get('f2pdf_template')
        flxPrefixUrl  = self.config.get('flx_prefix_url')

        payloadDir = self.create_unique_path(workingDir)
        payloadDir = self.mkdirs(payloadDir)
        worksheetHTML = worksheetHTML.replace('<section', '<p').replace('</section>', '</p>')

        worksheet_filepath = self.save(worksheetHTML, payloadDir, 'chapter_01.xhtml')
        worksheetPDF = printer.printToPDF(flxPrefixUrl, payloadDir, f2pdfHome, f2pdfTemplate)
        return worksheetPDF

    def saveWorksheetHTML(self, name, html):
        worksheetDict = {}
        worksheetDict['worksheetType']  = 'html'
        html = self.fixMathImageSources(html)
        htmlFile = self.createTmpHTMLFile(name, html)
        uri = save_worksheet_resource( htmlFile,
                                           name,
                                          'html'
                                         )
        worksheetDict['uri'] = uri
        return worksheetDict

    def fixMathImageSources(self, html):
        flxPrefixUrl  = self.config.get('flx_prefix_url')
        html = html.replace('/flx/math/', flxPrefixUrl + '/flx/math/')
        return html

    def saveWorksheetPDF(self, name, pdfPath):
        worksheetDict = {}
        worksheetDict['worksheetType']  = 'pdf'
        uri = save_worksheet_resource( pdfPath,
                                          name,
                                         'pdf'
                                        )
        worksheetDict['uri'] = uri
        
        return worksheetDict

    def createTmpHTMLFile(self,fileName, html):
        file = NamedTemporaryFile(prefix='fileName', suffix='.html', delete=False)
        html = html.encode('ascii', 'xmlcharrefreplace')
        html = html.encode('utf-8')
        file.write(html)
        return file.name

    def mkdirs(self, path):
        if not os.path.exists(path):
            os.makedirs(path)
            return path
        else:
            return path

    def create_unique_path(self, prefix):
        if not prefix.endswith('/'):
            prefix += '/'
        return prefix + self.create_timestamp()

    def create_timestamp(self):
        return datetime.now().strftime("%Y%m%d%H%M%S%f")

    def save(self,payload, path, file_name):
        source = open(path +"/"+ file_name, 'wb+')
        source.write(payload.encode('utf-8'))
        source.close();
        return path+'/'+file_name
