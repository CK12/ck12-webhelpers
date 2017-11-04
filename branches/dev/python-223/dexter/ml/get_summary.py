from pyramid.view import view_config

#from dexter.models import detect_eids
from dexter.lib import helpers as h
from dexter.views.decorators import jsonify
from dexter.views.errorCodes import ErrorCodes
from dexter.views.common import AssessCommon as common
from dexter.views.base import BaseView
#from dexter.lib.remoteapi import RemoteAPI as remotecall

from sumy.parsers.html import HtmlParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lex_rank import LexRankSummarizer as Summarizer
from sumy.nlp.stemmers import Stemmer
from sumy.utils import get_stop_words

import logging
log = logging.getLogger(__name__)


class CK12Summarizer(BaseView):
    def __init__(self, context, request):
        BaseView.__init__(self, context, request)
        self.working_dir = '/tmp/dexter'
        self.config = h.load_config()

    @view_config(route_name='get_summary')
    @jsonify
    @h.trace
    def get_summary(self):
        try:
            request = self.request
            result = common.getResponseTemplate(ErrorCodes.OK, 0)
            params = request.POST
            log.info('params: %s' %(params))
            xhtml = params['xhtml']
            log.info(xhtml)

            LANGUAGE = "english"
            SENTENCES_COUNT = 10

            parser = HtmlParser.from_string(xhtml, None, Tokenizer(LANGUAGE))

            stemmer = Stemmer(LANGUAGE)
            summarizer = Summarizer(stemmer)
            summarizer.stop_words = get_stop_words(LANGUAGE)

            summaries = []
            for sentence in summarizer(parser.document, SENTENCES_COUNT):
                sentence = str(sentence)
                summaries.append(sentence)

            log.info(summaries)
            result['response']['summaries'] = summaries
            return result
        except Exception,e:
            if not hasattr(self.c,'errorCode'):
                self.c.errorCode = ErrorCodes.CANNOT_AGGREGATE
            log.error('top5concepts: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(self.c.errorCode, str(e))
