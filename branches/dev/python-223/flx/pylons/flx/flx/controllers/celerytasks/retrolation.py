from flx.controllers.celerytasks.generictask import GenericTask
from pylons.i18n.translation import _ 
from flx.model import api, exceptions as ex
from flx.lib.unicode_util import UnicodeDictReader
import flx.controllers.user as u
from flx.lib.gdt.downloadcsv import GDTCSVDownloader

from tempfile import NamedTemporaryFile
import logging
import os
import json

logger = logging.getLogger(__name__)

class RetrolationLoaderTask(GenericTask):

    recordToDB = True

    def __init__(self, **kwargs):
        ## Initialize GenericTask
        GenericTask.__init__(self, **kwargs)
        self.routing_key = 'artifact'

    def run(self, csvFilePath=None, googleDocumentName=None, googleWorksheetName=None, **kwargs):
        """
            Load the retrolations from CSV
            CSV Structure:
            | Ch# | CK-12 Basic Algebra Concepts | Concept | CK-12 EID | Lesson | Section EID | CK-12 Basic Algebra |
        """
        GenericTask.run(self, **kwargs)
        logger.info("Loading retrolations from csv file: %s" % csvFilePath)
        allMessages = {}
        errors = 0
        #updateArtifactIDs = {}
        inf = None
        try:
            member = api.getMemberByID(id=self.user)
            if not u.isMemberAdmin(member):
                raise ex.UnauthorizedException((_(u'%(member.name)s is not authorized.')  % {"member.name":member.fix().name}).encode("utf-8"))

            if not csvFilePath:
                if not googleDocumentName:
                    raise Exception(_('Missing google document name and csvFilePath. One of them must be present.'))
                googleUserName = self.config.get('gdt_user_login')
                googleUserPass = self.config.get('gdt_user_password')

                file = NamedTemporaryFile(suffix='.csv', dir=self.config.get('cache_share_dir'), delete=False)
                converter = GDTCSVDownloader()
                converter.gss_get(file, googleDocumentName, googleWorksheetName, googleUserName, googleUserPass)
                if not file.closed:
                    file.close()
                csvFilePath = file.name
                logger.info("Created csvFilePath: %s" % csvFilePath)
                source = '%s|%s' % (googleDocumentName, googleWorksheetName)
            else:
                source = os.path.basename(csvFilePath)

            inf = open(csvFilePath, 'rb')
            ## Sanitize the field names to make them single word, no special chars, lower case entries like Google feed.
            csvReader = UnicodeDictReader(inf, sanitizeFieldNames=True)
            rowCnt = 1
            eids = dict()
            storedEids = dict()
            csvRows = []
            # Fetch all the CSV rows.
            for row in csvReader:
                rowCnt += 1
                domainEID = row.get('concepteid')
                sectionEID = row.get('sectioneid')
                eids.setdefault(sectionEID, []).append(domainEID)
                csvRows.append((rowCnt, sectionEID, domainEID))

            # Add domain retrolations.
            for sectionEID in eids:                
                try:
                    domainEIDs = eids[sectionEID]
                    logger.info('Processing sectionEID/domainEIDs %s/%s' % (sectionEID, domainEIDs))
                    api.createDomainRetrolation(sectionEID, domainEIDs)
                    domainRetrolations = api.getDomainRetrolationBySectionEID(sectionEID)
                    domainEIDs = [x.get('encodedID') for x in domainRetrolations]
                    storedEids[sectionEID] = domainEIDs
                except Exception, e:
                    logger.info('Processing sectionEID/domainEIDs %s/%s, Exception:%s' % (sectionEID, domainEIDs, str(e)))
            # Updated success/error messgaes for all the csv rows.
            for csvRow in csvRows:
                rowCnt, sectionEID, domainEID =  csvRow
                if domainEID in storedEids.get(sectionEID, []):
                    allMessages[rowCnt] = ["Created/Updated Domain Retrolation for sectionEID/domainEID %s/%s" %(sectionEID, domainEID)]
                else:
                    allMessages[rowCnt] = ["ERROR processing Domain Retrolation  sectionEID/domainEID %s/%s" %(sectionEID, domainEID)]
                    errors += 1

            ret = {'errors': errors, 'rows': rowCnt, 'messages': allMessages, 'source': source}
            self.userdata = json.dumps(ret) 
            return {'errors': errors, 'rows': rowCnt, 'source': source}
        except Exception, e:
            logger.error('load retrolation data from CSV Exception[%s]' % str(e), exc_info=e)
            raise e
        finally:
            if inf:
                inf.close()
            if csvFilePath and os.path.exists(csvFilePath):
                os.remove(csvFilePath)

class QuickRetrolationLoaderTask(RetrolationLoaderTask):
    """
        QuickRetrolationLoaderTask - to load Retrolation data "in-process"
        without having to schedule a task and wait for it to finish.
        Must be called with "apply()" method (see RetrolationController for an example)
    """
    recordToDB = False
