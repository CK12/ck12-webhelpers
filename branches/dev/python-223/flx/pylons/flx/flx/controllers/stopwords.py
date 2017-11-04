from flx.controllers import decorators as d
from flx.controllers.errorCodes import ErrorCodes
from flx.lib.base import BaseController
from flx.model import api
from pylons import app_globals as g, config, request, response, session as pylons_session, tmpl_context as c
import flx.controllers.user as u
import logging
import traceback

log = logging.getLogger(__name__)

class StopwordsController(BaseController):
    """
        StopWords related APIs.
    """

    @d.jsonify()
    @d.checkAuth(request)
    @d.setPage(request, [])
    @d.trace(log, ['pageNum', 'pageSize'])    
    def getStopWords(self, pageNum=1, pageSize=100):
        """
            Get all the stopwords
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            log.info(pageSize)
            stopWords = api.getStopWords(pageNum=pageNum, pageSize=pageSize)
            stopWordsList = []
            for stopWord in stopWords:
                stopWordsList.append(stopWord.word)

            result['response']['total'] = stopWords.getTotal()
            result['response']['limit'] = len(stopWordsList)
            result['response']['offset'] = (pageNum - 1)*pageSize
            result['response']['result'] = stopWordsList
            return result
        except Exception, e:
            log.error('getStopWords Exception[%s]' % str(e))
            log.error('getStopWords Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.GENERIC_ERROR
            return ErrorCodes().asDict(c.errorCode, 'Cannot get StopWords for concept hyperlinking')

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log, ['member'])
    def createStopWords(self):
        """
            Create the stopwords
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            word = request.params.get('word', '').strip()
            if not word:
                raise Exception('Please provide required word parameter')
            # Check if empty 
            words = filter(None,word.split(','))
            if not words:
                raise Exception('Empty word not allowed.')
       
            kwargs = {'word':words}
            stopWords = api.createStopWords(**kwargs)
            result['response']['word'] = [stopWord.word for stopWord in stopWords]
            return result
        except Exception, e:
            log.error('createStopWords Exception[%s]' % str(e))
            log.error('createStopWords Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.GENERIC_ERROR
            return ErrorCodes().asDict(c.errorCode, 'Cannot create StopWords for concept hyperlinking')

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log, ['member'])
    def deleteStopWords(self):
        """
            Delete the stopwords
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)

        try:
            word = request.params.get('word', '').strip()
            if not word:
                raise Exception('Please provide required word parameter')
            # Check if empty 
            words = filter(None,word.split(','))
            if not words:
                raise Exception('Cannot delete empty word.')

            kwargs = {'word':words}
            api.deleteStopWords(**kwargs)
            return result
        except Exception, e:
            log.error('deleteStopWords Exception[%s]' % str(e))
            log.error('deleteStopWords Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.GENERIC_ERROR
            return ErrorCodes().asDict(c.errorCode, 'Cannot delete StopWords for concept hyperlinking')
