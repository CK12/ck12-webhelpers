import logging

from pylons import config,request, tmpl_context as c

from flx.lib.base import BaseController, render
from flx.controllers import decorators as d
from flx.controllers.errorCodes import ErrorCodes
import flx.controllers.user as u
import flx.lib.helpers as h
from flx.controllers.celerytasks import vocabulary
from flx.model import api, exceptions as ex
from pylons.i18n.translation import _

log = logging.getLogger(__name__)

class VocabularyController(BaseController):

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log, ['member'])
    def loadVocabularies(self, member):
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
            toReindex = False
            waitFor = str(request.params.get('waitFor')).lower() == 'true'
            log.info("Wait for task? %s" % str(waitFor))
            if waitFor:
                ## Run in-process
                vocabularyLoader = vocabulary.QuickVocabularyLoaderTask()
                ret = vocabularyLoader.apply(kwargs={'csvFilePath': savedFilePath, 'googleDocumentName': googleDocumentName, 'googleWorksheetName': googleWorksheetName, 'user': member.id, 'loglevel': 'INFO', 'toReindex': toReindex})
                result['response'] = ret.result
            else:
                vocabularyLoader = vocabulary.VocabularyLoaderTask()
                task = vocabularyLoader.delay(csvFilePath=savedFilePath, googleDocumentName=googleDocumentName, googleWorksheetName=googleWorksheetName, loglevel='INFO', user=member.id, toReindex=toReindex)
                result['response']['taskID'] = task.task_id
            return result
        except Exception, e:
            log.error('load vocabulary data from CSV Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.CANNOT_LOAD_VOCABULARY_DATA
            return ErrorCodes().asDict(c.errorCode, str(e))


    @d.checkAuth(request, True, True)
    @d.trace(log, ['member'])
    def loadVocabulariesForm(self, member):
        c.prefix = self.prefix
        c.member = member
        return render('/flx/vocabularies/uploadForm.html')

    @d.jsonify()
    @d.setPage(request, ['languageCode', 'eid'])
    @d.trace(log, ['languageCode', 'eid', 'pageSize', 'pageNum'])
    def getVocabularies(self, pageNum, pageSize, eid, languageCode=None):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            artifact = api.getArtifactByEncodedID(encodedID=eid)
            if languageCode:
                language = api.getLanguageByCode(code=languageCode)
                if not language:
                    c.errorCode = ErrorCodes.NO_SUCH_LANGUAGE
                    raise Exception('No such language code, Code:%s' % languageCode)
            if not artifact:
                c.errorCode = ErrorCodes.NO_SUCH_ARTIFACT 
                raise Exception('No such artifact node by EID: %s' % eid)
            vocabularies = api.getVocabulariesByArtifactID(artifactID=artifact.id, pageSize=pageSize, pageNum=pageNum, languageCode=languageCode)
            vresults = []
            lresults = []
            languages= api.getVocabularyLanguagesForArtifact(artifactID=artifact.id)
            for vocab in vocabularies:
                vresults.append(vocab.asDict())
            for language in languages:
                lresults.append({'languageCode':language[0], 'languageName':language[1]})
            result['response'][ 'languages' ] = lresults
            result['response'][ 'vocabularies' ] = vresults
            result['response']['total'] = vocabularies.getTotal()
            result['response']['limit'] = len(vresults)
            result['response']['offset'] = (pageNum - 1)*pageSize
            return result
        except Exception as e:
            log.error('get vocabularies by eid Exception[%s]' % str(e), exc_info=e)
            if not hasattr(c,'errorCode'):
                c.errorCode = ErrorCodes.NO_SUCH_VOCABULARY
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, False, ['term', 'languageCode'])
    @d.sortable(request, ['term', 'languageCode'])
    @d.setPage(request, ['term', 'languageCode', 'sort'])
    @d.trace(log, ['term', 'languageCode', 'pageSize', 'pageNum', 'sort'])
    def getVocabulariesByTerm(self, term, pageNum, pageSize, sort=None, language=None):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            if not language:
                language = dict(request.params).get('language', 'english')
            if not term:
                raise Exception((_(u"Missing required attribute: term")).encode("utf-8"))
            vocabularies = api.getVocabulariesByTerm(term=term, pageSize=pageSize, pageNum=pageNum, sort=sort, language=language)
            vresults = []
            for vocab in vocabularies:
                vresults.append({'id':vocab.id, 'definition': vocab.definition, 'languageID':vocab.languageID})
            result['response'][ 'vocabularies' ] = vresults
            result['response']['total'] = vocabularies.getTotal()
            result['response']['limit'] = len(vresults)
            result['response']['offset'] = (pageNum - 1)*pageSize
            return result
        except Exception as ex:
            log.error('get vocabularies by term Exception[%s]' % str(ex), exc_info=ex)
            return ErrorCodes().asDict(c.errorCode, str(ex))
