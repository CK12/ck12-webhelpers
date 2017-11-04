import logging
from datetime import datetime

from flx.model.mongo.validationwrapper import ValidationWrapper

log = logging.getLogger(__name__)

class PDFDownloads(ValidationWrapper):

    def __init__(self, db, dc=False):
        self.db = db
        # Dependency check flag
        self.dc = dc
        self.required_fields = ['grades', 'subjects', 'school', 'noOfUsers', 'artifactID', 'memberID']

    def getPDFDownloadInfo(self, **kwargs):
        """
            Get PDF download information.
        """
        try:
            query = {}
            query['memberID'] = kwargs['memberID']
            # If artifactID and memberID both are provided then return particular PDF Download request.
            if kwargs.has_key('artifactID') and kwargs['artifactID']:
                query['artifactID'] = kwargs['artifactID']
                log.info("getPDFDownloadInfo, Executing query: [%s]" % query)
                pdfDownloadRequest = self.db.PDFDownloadRequests.find_one(query)
                log.info("pdfDownloadRequest: [%s]" % pdfDownloadRequest)
                if pdfDownloadRequest:
                    pdfDownloadRequest = [pdfDownloadRequest]
                else:
                    pdfDownloadRequest = []
                return pdfDownloadRequest
            else:
                log.info("getPDFDownloadInfo, Executing query: [%s]" % query)
                # If only memberID provided then return all the PDF download requests for that memebr.
                _pdfDownloadRequests = self.db.PDFDownloadRequests.find(query)
                pdfDownloadRequests = [_pdfDownloadRequest for _pdfDownloadRequest in _pdfDownloadRequests]
                log.info("pdfDownloadRequests: [%s]" % pdfDownloadRequests)
                return pdfDownloadRequests
        except Exception as e:
            log.error('Error getting PDF Download information: [%s]' %(str(e)))
            raise e

    def savePDFDownloadInfo(self, **kwargs):
        """
            Save PDF Download infromation.
        """
        try:
            self.before_insert(**kwargs)            
            kwargs['grades'] = kwargs['grades'].split(',')
            kwargs['subjects'] = kwargs['subjects'].split(',')            
            # Check if the record already exists
            artifactID = kwargs['artifactID']
            memberID = kwargs['memberID']
            query = {'memberID': memberID, 'artifactID': artifactID}
            log.info("Executing query for PDFDownloadRequests collection : [%s]" % query)            
            pdfDownloadRequest = self.db.PDFDownloadRequests.find_one(query)                        
            log.info("pdfDownloadRequest : [%s]" % pdfDownloadRequest)
            # Create/Update the record
            currentTime = datetime.now()
            kwargs['creationTime'] = pdfDownloadRequest.get('creationTime') if pdfDownloadRequest else currentTime
            kwargs['updateTime'] = currentTime            
            result = self.db.PDFDownloadRequests.update(query, {'$set': kwargs}, upsert=True)
            log.info("PDFDownloadRequests, save result: [%s]" % result)
            return kwargs 
        except Exception as e:
            log.error('Error in saving PDF Download information: %s' %(str(e)), exc_info=e)
            raise e
