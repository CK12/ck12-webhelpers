import logging
from urllib import unquote
from datetime import datetime

from pylons import config, request, tmpl_context as c
from pylons.i18n.translation import _ 

from flx.controllers import decorators as d
from flx.model import api, exceptions as ex
from flx.lib.base import BaseController, render
import flx.lib.helpers as h
import flx.controllers.user as u
from flx.controllers.celerytasks import retrolation

from flx.controllers.errorCodes import ErrorCodes

log = logging.getLogger(__name__)

class RetrolationController(BaseController):
    """
        Artifact get related APIs.
    """
    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log, ['member'])
    def loadRetrolations(self, member):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
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
                retrolationLoader = retrolation.QuickRetrolationLoaderTask()
                ret = retrolationLoader.apply(kwargs={'csvFilePath': savedFilePath, 'googleDocumentName': googleDocumentName, 'googleWorksheetName': googleWorksheetName, 'user': member.id, 'loglevel': 'INFO'})
                result['response'] = ret.result
            else:
                retrolationLoader = retrolation.RetrolationLoaderTask()
                task = retrolationLoader.delay(csvFilePath=savedFilePath, googleDocumentName=googleDocumentName, googleWorksheetName=googleWorksheetName, loglevel='INFO', user=member.id)
                result['response']['taskID'] = task.task_id
            return result
        except Exception, e:
            log.error('load retrolation data from CSV Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.CANNOT_LOAD_RETROLATION_DATA
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.checkAuth(request, True, True)
    @d.trace(log, ['member'])
    def loadRetrolationForm(self, member):
        c.prefix = self.prefix
        c.member = member
        return render('/flx/retrolation/uploadForm.html')

    @d.jsonify()
    @d.setPage(request, ['domainEID'])
    @d.trace(log, ['domainEID'])
    def getRetrolationByDomainEID(self, domainEID):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            browseTerm = api.getBrowseTermByEncodedID(domainEID)
            if not browseTerm:
                raise Exception("Please provide valid domainEID.");

            result['response'] = api.getDomainRetrolationByDomainEID(domainEID)
            return result
        except Exception as e:
            log.error('get retrolation by DomainEID Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.NO_SUCH_RETROLATION
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.setPage(request, ['sectionEID'])
    @d.trace(log, ['sectionEID'])
    def getRetrolationBySectionEID(self, sectionEID):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            artifact = api.getArtifactByEncodedID(sectionEID)
            if not artifact:
                raise Exception("Please provide valid sectionEID.");

            result['response'] = api.getDomainRetrolationBySectionEID(sectionEID)
            return result
        except Exception as e:
            log.error('get retrolation by SectionEID Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.NO_SUCH_RETROLATION
            return ErrorCodes().asDict(c.errorCode, str(e))
