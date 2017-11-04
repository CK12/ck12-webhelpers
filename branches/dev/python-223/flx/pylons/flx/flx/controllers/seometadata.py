# 
# SEO Metadata Controller to get and set seo metadata
#
import logging
import traceback
from pylons import request,config
from pylons.i18n.translation import _
from flx.controllers.mongo.base import MongoBaseController
from flx.controllers import decorators as d
from flx.controllers.errorCodes import ErrorCodes
from flx.controllers.celerytasks.mongo import seometadata as seoTask
import flx.lib.helpers as h
from flx.model import exceptions as ex
from flx.model.seometadata import seometadata
import flx.controllers.user as u

log = logging.getLogger(__name__)

class SeometadataController(MongoBaseController):
    """
        Seo Metadata related APIs.
    """
    def __init__(self, **kwargs):
        MongoBaseController.__init__(self, **kwargs)

    #
    #  Get seo metadata
    #
    @d.jsonify()
    @d.trace(log)
    def getSeoMetaData(self):
        try:
            result = MongoBaseController.getResponseTemplate(self, ErrorCodes.OK,0)
            kwargs = {}
            contentID = request.params.get('contentID', None)
            contentType = request.params.get('contentType', None)
            url = request.params.get('url', None)
            # Check url after trying contentID and contentType
            if not contentID and not contentType and url:
                kwargs['url'] = url
                result['response'] = seometadata.SeoMetaData(self.db).getSeoMetaData(**kwargs)
                return result
            if not contentID:
                raise Exception('ContentID not specified')
            if not contentType:
                raise Exception('ContentType not specified')
            kwargs['contentID'] = contentID
            kwargs['contentType'] = contentType
            result['response'] = seometadata.SeoMetaData(self.db).getSeoMetaData(**kwargs)
            return result
        except Exception, e:
            log.error("Error initiating get seo metadata")
            errorCode = ErrorCodes.CANNOT_GET_SEOMETADATA
            log.error(traceback.format_exc(e))
            return ErrorCodes().asDict(errorCode,str(e))

    #
    #  Create seo metadata
    #
    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log, ['member'])
    def createSeoMetaData(self,member):
        """
        function to upload SEO Metadata csv/google spreadsheet
        """
        try:
            result = MongoBaseController.getResponseTemplate(self, ErrorCodes.OK,0)
            
            if not u.isMemberAdmin(member):
                raise ex.UnauthorizedException((_(u'%(member.name)s is not authorized.')  % {"member.name":member.fix().name}).encode("utf-8"))

            googleDocumentName = googleWorksheetName = savedFilePath = None
            if request.params.get('googleDocumentName'):
                googleDocumentName = request.params.get('googleDocumentName')
                if not googleDocumentName:
                    raise Exception(_('Google Spreadsheet name is required.'))
                googleWorksheetName = request.params.get('googleWorksheetName')
                if not googleWorksheetName:
                    log.info("No worksheet specified. Using the first one.")
                    googleWorksheetName = None
            else:
                ## save the file to temp location
                savedFilePath = h.saveUploadedFile(request, 'file', dir=config.get('cache_share_dir'))
            
            waitFor = str(request.params.get('waitFor')).lower() == 'true'
            log.info("Wait for task? %s" % str(waitFor))
            if waitFor:
                ## Run in-process
                uploadSpreadsheet = seoTask.QuickSeoMetadataTask()
                ret = uploadSpreadsheet.apply(kwargs={'csvFilePath': savedFilePath, 'googleDocumentName': googleDocumentName, 'googleWorksheetName': googleWorksheetName, 'user': member.id, 'loglevel': 'INFO'})
                result['response'] = ret.result
            else:
                uploadSpreadsheet = seoTask.SeoMetadataTask()
                task = uploadSpreadsheet.delay(csvFilePath=savedFilePath, googleDocumentName=googleDocumentName, googleWorksheetName=googleWorksheetName, loglevel='INFO', user=member.id)
                result['response']['taskID'] = task.task_id
            
            return result
        except Exception, e:
            log.error("Error initiating create seo metadata")
            errorCode = ErrorCodes.CANNOT_CREATE_SEOMETADATA
            log.error(traceback.format_exc(e))
            return ErrorCodes().asDict(errorCode,str(e))
