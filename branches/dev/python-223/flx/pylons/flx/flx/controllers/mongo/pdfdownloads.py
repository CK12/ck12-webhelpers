import logging
import traceback

from pylons import request, tmpl_context as c

from flx.controllers.mongo.base import MongoBaseController
from flx.controllers import decorators as d
from flx.controllers.errorCodes import ErrorCodes

from flx.model.mongo import pdfdownloads

log = logging.getLogger(__name__)

class PdfdownloadsController(MongoBaseController):
    """
        PDF download related APIs.
    """
    def __init__(self, **kwargs):
        MongoBaseController.__init__(self, **kwargs)

    #
    #  Save PDF Downloads
    #
    @d.jsonify()
    @d.trace(log, ['member'])
    @d.checkAuth(request)
    def getPDFDownloadInfo(self, member):
        """
            Get PDF Download Inforamtion.
        """
        try:
            result = MongoBaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            kwargs = {}
            if not member:
                raise Exception('Invalid Request, Member not avaialble.')
            kwargs['memberID'] = member.id
            artifactID = request.params.get('artifactID')
            if artifactID:
                try:
                    kwargs['artifactID'] = int(artifactID)
                except Exception as ex:
                    raise Exception('Invalid artifactID provided. artifactID: [%s]' % artifactID)
            result['response']['pdfDownlaodInfo'] = pdfdownloads.PDFDownloads(self.db).getPDFDownloadInfo(**kwargs)
            return result
        except Exception as e:
            log.error('Error getting PDF Download information: [%s]' %(str(e)))
            c.errorCode = ErrorCodes.CANNOT_GET_PDF_DOWNLOAD_INFO
            log.error(traceback.format_exc(e))
            return ErrorCodes().asDict(c.errorCode, str(e))

    #
    #  Save PDF Downloads
    #
    @d.jsonify()
    @d.trace(log, ['member'])
    @d.checkAuth(request)
    def savePDFDownloadInfo(self, member):
        """
            Save the PDF download information.
        """
        try:
            result = MongoBaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            kwargs = {}
            if not member:
                raise Exception('Invalid Request, Member not avaialble.')
            kwargs['memberID'] = member.id
            mandatoryFields = ['grades', 'subjects', 'school', 'noOfUsers', 'artifactID']            
            numberFields = ['noOfUsers', 'artifactID']
            # Validate madetory fields
            for mandatoryField in mandatoryFields:
                value = request.params.get(mandatoryField, '').strip()
                if not value:
                    raise Exception('%s not specified' % mandatoryField)
                kwargs[mandatoryField] = value
            # Validate integer fields
            for numberField in numberFields:
                try:
                    kwargs[numberField] = int(kwargs[numberField])
                except Exception as ex:
                    raise Exception('Invalid %s provided, %s: [%s]' % (numberField, numberField, kwargs[numberField]))
            result['response']['pdfDownlaodInfo'] = pdfdownloads.PDFDownloads(self.db).savePDFDownloadInfo(**kwargs)
            return result
        except Exception as e:
            log.error('Error saving PDF Download information: [%s]' %(str(e)))
            c.errorCode = ErrorCodes.CANNOT_SAVE_PDF_DOWNLOAD_INFO
            log.error(traceback.format_exc(e))
            return ErrorCodes().asDict(c.errorCode, str(e))
