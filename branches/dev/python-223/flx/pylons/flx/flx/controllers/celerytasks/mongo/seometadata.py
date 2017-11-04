import os
import logging
from pylons.i18n.translation import _
from flx.model.mongo import getDB
from flx.model.seometadata import seometadata
from flx.model import api, exceptions as ex
from flx.controllers.celerytasks.generictask import GenericTask
import flx.controllers.user as u

from tempfile import NamedTemporaryFile
from flx.lib.gdt.downloadcsv import GDTCSVDownloader
from flx.lib.unicode_util import UnicodeDictReader

log = logging.getLogger(__name__)

class SeoMetadataTask(GenericTask):
    """
    celery task to read and upload SEO Metadata from csv or google spreadsheet 
    to mongodb flx2.seometadata collection
    """
    recordToDB = True
     
    def __init__(self, **kwargs):
        ## Initialize GenericTask
        GenericTask.__init__(self, **kwargs)
 
        self.routing_key = 'artifact'
        self.db = getDB(self.config)
         
    def run(self, **kwargs):
        GenericTask.run(self, **kwargs)
        source = None
        errors = 0
        rowCnt = 1
        messages = []
        infile = None
        try:
            member = api.getMemberByID(id=kwargs.get('user'))
            if not u.isMemberAdmin(member):
                raise ex.UnauthorizedException((_(u'%(member.name)s is not authorized.')  % {"member.name":member.name}).encode("utf-8"))
            
            log.info('Info Params %s' %kwargs)
            csvFilePath = kwargs.get('csvFilePath', '/')
            googleDocumentName = kwargs.get('googleDocumentName', None)
            googleWorksheetName = kwargs.get('googleWorksheetName', None)
             
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
                log.info("Created csvFilePath: %s" % csvFilePath)
                source = '%s|%s' % (googleDocumentName, googleWorksheetName)
            else:
                source = os.path.basename(csvFilePath)
                 
            infile = open(csvFilePath, 'rb')
            ## Sanitize the field names to make them single word, no special chars, lower case entries like Google feed.
            csvReader = UnicodeDictReader(infile, sanitizeFieldNames=True)
            for row in csvReader:
                rowCnt += 1
                log.info('Processing row[%d] %s' % (rowCnt, str(row)))
                 
                try:
                    url = row.get('url').strip()
                    seoDescription = row.get('seodescription').strip()
                    seoKeywords = row.get('seokeywords').strip()
                except Exception as ee:
                    log.error("One or more of the required fields missing: [%s]" % str(ee), exc_info=ee)
                    raise ee
                 
                if not seoDescription or not seoKeywords:
                    errors += 1
                    messages.append('Missing information in row.Please check row with info as %s'%row)
                    log.error('Missing information in row.Please check row with info as %s'%row)
                    continue
                
                if not url:
                    raise Exception(_('Missing data in URL column in row %s.'%row))
                
                urlList = url.split("/")  # we are considering constant url structure i.e. http://servername/branch-handle/concept-handle/
                log.info("urlList---::%s"%urlList)
                conceptHandle = urlList[len(urlList)-2]
                BrowseTermType = api.getBrowseTermTypeByName(name="domain")
                BrowseTerm = api.getBrowseTermByHandle(handle=conceptHandle,typeID=BrowseTermType.id)
                
                if not BrowseTerm:
                    raise Exception(_('No BrowseTerm data found for conceptHandle %s.'%conceptHandle))
                contentID = BrowseTerm.encodedID 
                
                metadata = {
                           'desc':seoDescription,
                           'keywords':seoKeywords
                           }
                
                contentType = 'concept'
                seoInfoDict = {
                               'contentID': contentID,
                               'contentType':contentType,
                               'url':url,
                               'metadata':metadata
                               }
                
                seoData = seometadata.SeoMetaData(self.db).createSeoMetaData(**seoInfoDict)
                messages.append("Created SEO Meta Data: %s"%seoData)
                log.info("Created SEO Meta Data: %s"%seoData)
            
            
            result = {'errors': errors, 'rows': rowCnt, 'messages': messages, 'source': source}
#             self.userdata = json.dumps(result)
            self.updateTask() 
            return result
            
        except Exception, e:
            log.error('load SEO meta data from CSV Exception[%s]' % str(e), exc_info=e)
            raise e
        finally:
            pass
            if infile:
                infile.close()
            if csvFilePath and os.path.exists(csvFilePath):
                os.remove(csvFilePath)
                
class QuickSeoMetadataTask(SeoMetadataTask):
    """
        QuickSeoMetadataTask - to load SEO data "in-process"
        without having to schedule a task and wait for it to finish.
        Must be called with "apply()" method
    """

    recordToDB = False
