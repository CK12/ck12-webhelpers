# coding=utf-8
import solr
import logging, traceback
import time, datetime
import operator
import re
import sys
from pylons import config
from pylons.i18n.translation import _ 
from math import ceil

from flx.lib.localtime import Local
from flx.lib import helpers as h

log = logging.getLogger(__name__)

TRANSACTION_NOT_ACTIVE = "No active transaction. Please start a new transaction first."
NO_OPEN_CONNECTION = "No open connection to the Solr server. Please open a connection first."

WORDS_TO_IGNORE = ['of', 'and', 'in', 'upon', 'on', 'by', 'from', 'the', 'a', 'an', 'as', 'is', 'are', 'were' ]

SEARCHABLE_FIELDS = [
        'ancestors', 'ancestors.ext', 'states', 'states.ext',
        'domains.ext', 'descendents.domains.ext', 'subjects.ext', 'descendents.subjects.ext', 
        'standards.ext', 'descendents.standards.ext', 'gradeLevels.ext', 'descendents.gradeLevels.ext', 
        'domains', 'descendents.domains', 'subjects', 'descendents.subjects', 
        'standards', 'descendents.standards', 'gradeLevels', 'descendents.gradeLevels', 
        'levels', 'levels.ext', 'descendents.levels', 'descendents.levels.ext',
        'browseTerms', 'browseTerms.ext', 'descendents.browseTerms', 'synonyms', 'synonyms.ext',
        'tags', 'tags.ext', 'descendents.tags', 'descendents.tags.ext',
        'internaltags', 'internaltags.ext', 'descendents.internaltags', 'descendents.internaltags.ext',
        'searches', 'searches.ext', 'descendents.searches', 'descendents.searches.ext',
        'domainIDs', 'domainIDs.ext', 'ancestorDomainIDs', 'ancestorDomainIDs.ext',
        'searchTerms', 'searchTerms.ext', 'descendents.searchTerms', 'descendents.searchTerms.ext',
        'title', 'summary', 'textContent', 'text', 'type', 'parents', 'revision', 
        'downloads', 'favorites', 'isPublic',
        'authors', 'authors.ext', 'created', 'modified', 'sid', 'ownerID', 'ownerLogin',
        'resources', 'resourceNames', 'prereqs', 'prereqTitles',
        'postreqs', 'postreqTitles',
        'title_cjk', 'textContent_cjk', 'summary_cjk', 'text_cjk', 'authors_cjk', 'license', 
        'libraryMemberIDs', 'memberLabels', 'language', 'languageCode', 'resourceCounts',
        'hasAttachments', 'hasVideos', 'hasExercises',
        'conceptEIDs', 'encodedIDs', 'encodedID', 'iencodedIDs', 'iencodedID',
        'publishedModalityCount', 'ck12PublishedModalityCount', 'modalityMemberIDs',
        'chandles', 'ctitles', 'cchandles', 'cctitles', 'cceids',
        ]

## Fields that are prefixed by 'memberID_'
PER_MEMBER_FIELDS = [
        'hasAttachments',
        'memberLabels',
        ]

## If the user does not specify which fields are needed - we return these
## NOTE: textContent is absent by design
AUTO_RETURN_FIELDS = [ 
        'ancestors', 
        'domains', 
        'gradeLevels', 'levels', 'ownerID', 'ownerLogin',
        'sid', 'modified', 'parents', 'revision',
        'standards', 
        'states',
        'subjects',
        'summary', 'title', 'type', 'license', 'language', 'languageCode',
        'parents', 'prereqs', 'postreqs',
        'chandles', 'ctitles', 'cchandles', 'cctitles', 'cceids',
        ]

## Following fields are allowed to be in the highlighting field list
## NOTE - they should be subset of the AUTO_RETURN_FIELDS above
HIGHLIGHT_FIELDS = [
    'domains', 
    'subjects',
    'standards',
    'gradeLevels',
    'levels',
    'title', 'summary', 'textContent', 
    'authors', 'sid'
    ]


SORTABLE_FIELDS = [
    'stitle', 'sid', 'modified', 'created', 'downloads', 'rating',
    'popularity', 'favorites', 'featured', 'score', 'encodedID',
    'iencodedID', 'domainPrefix', 'domainEncoding', 'ownerID', 'license',
]

FACET_FIELDS = [ 'domains.ext', 'gradeLevels.ext', 'standards.ext', 'states.ext', 'tags.ext', 'internaltags.ext', 'subjects.ext', 'levels.ext', 'authors.ext', 'typeStr', 'chandles', ]
MINIMAL_FACET_FIELDS = [ 'gradeLevels.ext', 'subjects.ext', 'typeStr', 'chandles', ]

SOLR_SPECIAL_CHARS = [ '\\', '+', '-', '&&', '||', '!', '(', ')', '{', '}', '[', ']', '^', '"', '~', '?', ':' ]

def getSolrTime(str, format=0):
    from time import strptime, strftime
    formats = ['%Y-%m-%dT%H:%M:%SZ', '%Y-%m-%d %H:%M:%S', '%Y-%m-%d' ]
    for f in formats:
        try:
            t = strptime(str, f)
            return strftime(formats[format], t)
        except:
            pass
    raise Exception("The time stamp string does not match expected formats. Please use %s" % formats[0])

def getTermBeforeOr(term):
    if term:
        return term.split(' or ', 1)[0]
    return term

def escapeSpecialChars(term):
    if term:
        for char in SOLR_SPECIAL_CHARS:
            term = term.replace(char, r'\%s' % char)
    return term

def removeSpecialChars(term):
    pattern = re.compile(r'[^\w\s]+', re.UNICODE)
    return pattern.sub('', term)

def removeXmlUnsafeCharacters(unsafe):
    """
    Remove unsafe xml characters from payload
    Based on http://stackoverflow.com/a/22273639
    """
    if not unsafe:
        return unsafe
    _illegal_unichrs = [(0x00, 0x08), (0x0B, 0x0C), (0x0E, 0x1F), 
                        (0x7F, 0x84), (0x86, 0x9F), 
                        (0xFDD0, 0xFDDF), (0xFFFE, 0xFFFF)] 
    if sys.maxunicode >= 0x10000:  # not narrow build 
        _illegal_unichrs.extend([(0x1FFFE, 0x1FFFF), (0x2FFFE, 0x2FFFF), 
                                 (0x3FFFE, 0x3FFFF), (0x4FFFE, 0x4FFFF), 
                                 (0x5FFFE, 0x5FFFF), (0x6FFFE, 0x6FFFF), 
                                 (0x7FFFE, 0x7FFFF), (0x8FFFE, 0x8FFFF), 
                                 (0x9FFFE, 0x9FFFF), (0xAFFFE, 0xAFFFF), 
                                 (0xBFFFE, 0xBFFFF), (0xCFFFE, 0xCFFFF), 
                                 (0xDFFFE, 0xDFFFF), (0xEFFFE, 0xEFFFF), 
                                 (0xFFFFE, 0xFFFFF), (0x10FFFE, 0x10FFFF)]) 

    _illegal_ranges = ["%s-%s" % (unichr(low), unichr(high)) for (low, high) in _illegal_unichrs] 
    _illegal_xml_chars_RE = re.compile(u'[%s]' % u''.join(_illegal_ranges)) 
    return _illegal_xml_chars_RE.sub('', unsafe)

def getHandle(term):
    return term.replace(' ', '-')

termSeparator = config.get('term_separator')

def getTermList(terms):
    myTermList = []
    termList = terms.split(termSeparator) 
    log.info("termList: %s" % str(termList))
    ## Process the term list to split multi-word terms into separate entities
    ## We then ignore some of the words which are not important
    for term in termList:
        term = term.strip()
        if term:
            termParts = term.split()
            for part in termParts:
                if part.lower() in WORDS_TO_IGNORE:
                    log.debug("Ignoring term part: %s" % part)
                    continue
                myTermList.append(part)
    log.info("myTermList: %s" % str(myTermList))
    return myTermList

def removeWordsToIgnore(term):
    words = term.split()
    retTerms = []
    for word in words:
        if word.strip().lower() in WORDS_TO_IGNORE:
            continue
        retTerms.append(word)
    return ' '.join(retTerms)

def getSortOrder(sort):
    """
        Process the sort request parameter and return a sort order field for solr
    """
    global SORTABLE_FIELDS
    if not sort or sort.lower() == 'none':
        sort = None
    ## Handle special keywords
    if sort == 'latest':
        sort = ['modified desc', 'created desc']
    elif sort == 'popular':
        sort = ['popularity desc']
    elif sort == 'featured':
        sort = ['featured asc']
    elif sort:
        sortParts = sort.split(';')
        sort = []
        for s in sortParts:
            order = 'asc'
            if s.endswith(',desc'):
                order = 'desc'
            sortFld = s.split(",", 1)[0]
            if sortFld in SORTABLE_FIELDS:
                sort.append('%s %s' % (sortFld, order))
            else:
                raise Exception((_(u'Invalid sort field: %(sortFld)s')  % {"sortFld":sortFld}).encode("utf-8"))

    return sort

def getSearchQueryForBrowseTerms(term, maxBoost=400, op='OR', types=['all'], exactOnly=False, descendents=True, escapeChars=True):
    query = ''
    if not types:
        types = ['all']
    if types and 'all' in types:
        types = ['browseTerms']
    if term:
        if escapeChars:
            term = escapeSpecialChars(term.lower())
        query += '('
        for type in types:
            query += ' %s.ext:"%s"^%d ' % (type, term, maxBoost)
            if not exactOnly:
                query += '%s %s:"%s"^%d' % (op, type, term, ceil(float(maxBoost)/4))
                termSplit = term.split()
                if len(termSplit) > 1:
                    qsplit = '('
                    for i in range(0, len(termSplit)):
                        ts = termSplit[i]
                        if i > 0:
                            qsplit += ' AND'
                        qsplit += ' %s:%s' % (type, ts)
                    qsplit += ')'
                    query += ' OR %s^%d' % (qsplit, ceil(float(maxBoost)))
            if descendents:
                query += ' %s descendents.%s.ext:"%s"^%d' % (op, type, term, ceil(float(maxBoost)/2))
                if not exactOnly:
                    query += ' %s descendents.%s:"%s"^%d' % (op, type, term, ceil(float(maxBoost)/4))
        query += ')'
    return query

def getSearchQueryForContent(term, maxBoost=10, op='OR', isArtifactSearch=False, exactOnly=False, includeContent=True, escapeChars=True):
    """
        Create a search query to look into title, summary and contents of an artifact
    """
    qTitle = qHandle = qSummary = qText = qAll = ""
    if term:
        alphaNumTerm = removeSpecialChars(term)
        handle = getHandle(term)
        if escapeChars:
            term = escapeSpecialChars(term)
        ## Bug 56334 Split term on ' or ' and use the prefix
        termWithoutOr = getTermBeforeOr(term)
        if isArtifactSearch:
            qHandle += 'handle:"%s"^%d' % (handle, ceil(float(maxBoost)/100))
        else:
            qHandle += 'handle:"%s"^%d' % (handle, maxBoost)
        
        if exactOnly:
            qTitle += 'stitle:"%s"^%d OR title_cjk:"%s"^%d' % (alphaNumTerm, maxBoost, term, maxBoost)
        else:
            qTitle += 'title_prefix:"%s"^%d OR title_infix:"%s"^%d OR stitle:"%s"^%d OR title:"%s"^%d OR title_cjk:"%s"^%d OR cctitles_prefix:"%s"^%d OR cctitles_infix:"%s"^%d OR cctitles:"%s"^%d' % \
                (term, maxBoost, term, maxBoost, alphaNumTerm, maxBoost, term, maxBoost, term, maxBoost, term, maxBoost, term, maxBoost, termWithoutOr, maxBoost)

        if exactOnly:
            qSummary += 'summary:"%s"^%d OR summary_cjk:"%s"^%d' % (alphaNumTerm, ceil(float(maxBoost)/5), term, ceil(float(maxBoost)/5))
        else:
            if isArtifactSearch:
                qSummary += 'summary_infix:"%s"^%d OR summary:"%s"^%d OR summary_cjk:"%s"^%d OR type:%s' % (alphaNumTerm, ceil(float(maxBoost)/2), alphaNumTerm, ceil(float(maxBoost)/2), term, ceil(float(maxBoost)/2), term)
            else:
                qSummary += 'summary_infix:"%s"^%d OR summary:"%s"^%d OR summary_cjk:"%s"^%d OR type:%s' % (alphaNumTerm, ceil(float(maxBoost)/5), alphaNumTerm, ceil(float(maxBoost)/5), term, ceil(float(maxBoost)/5), term)
        
        if includeContent:
            qText += 'textContent:"%s" OR textContent_cjk:"%s"' % (term, term)
            qAll += 'text:%s OR text_cjk:%s' % (term, term)

    query = ''
    for part in [qHandle, qTitle, qSummary, qText, qAll]:
        if part:
            if query:
                query += ' %s ' % op
            query += '(%s)' % part
    return query

def getCustomSearchQuery(term, fields, op='OR', exact=False, boost=None, memberID=None):
    """
        Create a search query for custom fields
    """
    query = ''
    if term:
        term = term.strip()
        if not term:
            return query
        term = escapeSpecialChars(term)
        for field in fields:
            negate = False
            if field.startswith('!'):
                field = field.strip('!')
                negate = True
            if exact and not field.endswith('.ext'):
                field = '%s.ext' % field
            if field not in SEARCHABLE_FIELDS:
                raise Exception((_(u'Invalid field name: %(field)s')  % {"field":field}).encode("utf-8"))
            if query:
                query += ' %s ' % op
            if negate:
                field = 'NOT %s' % field
            if not memberID:
                memberID = 0
            if field in PER_MEMBER_FIELDS:
                queryPart = '%s:"0_%s"' % (field, term)
                if memberID:
                    queryPart = '( %s OR %s:"%s_%s" )' % (queryPart, field, memberID, term)
            else:
                if (' ' in term or '*' in term) and not field.endswith('.ext'):
                    queryPart = '%s:%s' % (field, term)
                else:
                    queryPart = '%s:%s' % (field, quoteTerm(term))
            if boost:
                queryPart += '^%d' % boost
            query += queryPart
    return query

def __appendToken(clause, thisOp, tokens):
    log.debug("clause: [%s], thisOp: %s, tokens: %s" % (clause, thisOp, tokens))
    parenL = parenR = ''
    if clause.startswith('('):
        parenL = '('
        clause = clause[1:]
    if clause.endswith(')'):
        parenR = ')'
        clause = clause[:-1]
    log.debug("Appending: [%s, %s, %s, %s]" % (clause, thisOp, parenL, parenR))
    tokens.append((clause, thisOp, parenL, parenR))


def processSpecialSearchTerm(term, memberID=None):
    """
        Special search term format:
        field1:term1,field2:term2,...
    """
    query = ''
    tokens = []
    thisOp = ''
    cnt = 0
    orSep = '_OR_'
    andSep = '_AND_'
    while term:
        orIdx = term.find(orSep)
        andIdx = term.find(andSep)
        log.debug('Term: %s, orIdx: %d, andIdx: %d, thisOp: %s' % (term, orIdx, andIdx, thisOp))
        if orIdx == -1 and andIdx == -1:
            __appendToken(term, thisOp, tokens)
            break
        if orIdx == -1:
            orIdx = 999999
        if andIdx == -1:
            andIdx = 999999
        if orIdx < andIdx:
            op = 'OR'
            idx = orIdx
            sep = orSep
        else:
            op = 'AND'
            idx = andIdx
            sep = andSep
        clause = term[0:idx]
        term = term[idx+len(sep):]
        log.debug("Clause: [%s], term: [%s]" % (clause, term))
        __appendToken(clause, thisOp, tokens)
        thisOp = op
        cnt += 1
        #if cnt >= 10:
        #    break
    log.debug("Tokens: %s" % tokens)
    for part, op, parenL, parenR in tokens:
        exact = False
        if ':' in part:
            fld,trm = part.split(':', 1)
            trm = trm.lower().strip()
            if trm.startswith('"') and trm.endswith('"'):
                trm = trm.strip('"')
            if trm:
                log.debug("trm: %s" % trm)
                if query:
                    query += ' %s ' % op
                if parenL:
                    query += parenL
                if fld == '__all__':
                    if trm != '__all__':
                        query += getDefaultFieldsQuery(trm, memberID)
                elif trm != '__all__':
                    query += getCustomSearchQuery(trm, [fld], exact=exact, memberID=memberID)
                if parenR:
                    query += parenR
    if query.endswith(' AND '):
        query = query.rsplit(' AND ', 1)[0]
    if query.endswith(' OR '):
        query = query.rsplit(' OR ', 1)[0]
    log.debug("Special query before parentheses check: %s" % query)
    if query.count('(') != query.count(')'):
        raise Exception("Unbalanced parenthesis. Please check the query formatting: %s" % query)
    if query.count('\\(') > query.count('\\)'):
        query = re.sub(r'([^\\]?)\)', r'\1\\)', query)
    if query.count('\\(') < query.count('\\)'):
        query = re.sub(r'([^\\]?)\(', r'\1\\(', query)
    log.info("Special query: %s" % query)
    return query

def quoteTerm(term):
    if term:
        if ' ' in term and '"' not in term:
            term = '"' + term + '"'
    return term

LANGUAGES = { 
    u'spanish': ['spanish', '.SPA.'],
    u'español': ['spanish', '.SPA.'],
    u'espanol': ['spanish', '.SPA.'],
}
def getDefaultFieldsQuery(term, memberID=None, exactOnly=False, includeContent=True, language=None):
    query = ''
    if term:
        term = escapeSpecialChars(term)
        query += '(' + getSearchQueryForBrowseTerms(term, maxBoost=400, types=['browseTerms'], exactOnly=exactOnly, descendents=not exactOnly, escapeChars=False)
        #query += ' OR ' +  getSearchQueryForBrowseTerms(term, maxBoost=200, types=['tags'], descendents=True)
        query += ' OR ' + getSearchQueryForContent(term, maxBoost=1000, isArtifactSearch=True, exactOnly=exactOnly, includeContent=includeContent, escapeChars=False)
        if exactOnly:
            query += ' OR ( standards:"%s" OR standards:"%s" ) ' % (term.lower(), term.lower().replace('.', '_'))
        else:
            query += ' OR ( standards:%s OR standards:%s ) ' % (term.lower(), term.lower().replace('.', '_'))
        language = None
        for l in LANGUAGES.keys():
            regex = re.compile(r'\b%s\b' % l)
            if regex.match(term):
                language = LANGUAGES[l][0]
                break
        if language:
            query += ' OR ( language:"%s"^%d OR encodedID:"*%s*"^%d ) ' % (language, 100000, LANGUAGES[l][1], 100000)
        if memberID:
            query += ' OR memberLabels:"%d_%s" OR memberLabels:"0_%s"' % (int(memberID), term, term)
        query += ')'
    return query

def getAutoSuggestFieldsQuery(term, field, artifactTypes, memberID, excludeSubjects=[]):
    query = ''
    artifactTypeList = None
    term = term.strip()
    global termSeparator
    log.info("termSeparator >> (%s)" % termSeparator)
    if not termSeparator:
        termSeparator = ','
        log.info("termSeparator set to default >> (%s)" % termSeparator)

    if artifactTypes:
        artifactTypeList = artifactTypes.split(termSeparator)

    log.info("artifactTypeList length >> %s" % len(artifactTypeList))
    
    if 'artifact' in artifactTypeList:
        query = ''
    elif len(artifactTypeList) > 0:
        cnt = 0
        for type in artifactTypeList:
            if cnt > 0:
                query += ' OR '
            if type == 'domain':
                query += ' (type:"%s" AND ((-(publishedModalityCount:0) OR (publishedModalityCount:{* TO *} AND *:*)))) ' % type.lower()
            else:
                query += ' type:"%s"' % type.lower()

            cnt += 1
    if len(query) > 0:
        query = '(' + query + ')'
        query += ' AND '
    query += 'isPublic:"1" AND ownerID:"%s" AND ' % memberID

    if excludeSubjects:
        sq = ''
        for eb in excludeSubjects:
            if eb:
                if sq:
                    sq += ' AND '
                sq += ' -subjects:"%s"' % eb.lower()
        if sq:
            query += sq + ' AND '


    if term and len(term) > 0:
        term = escapeSpecialChars(term)
        ## More than 50 characters not supported
        if len(term) >= 50:
            term = term[0:49]
        if 'title' == field:
            query += '(title_prefix:"%s"^1000 OR title_infix:"%s"' % (term, term)
            query += ' OR (cctitles_prefix:"%s"^1000 OR cctitles_infix:"%s")' % (term, term)
            query += ')'
        else:
            raise Exception((_(u'Invalid field name: %(field)s')  % {"field":field}).encode("utf-8"))
        log.info("Auto suggest query >> "+query)
    else:
        raise Exception((_(u'Invalid term: %(term)s')  % {"term":term}).encode("utf-8"))

    return query

tzRegex = re.compile(r'([0-9]+-[0-9]+-[0-9]+ [0-9]+:[0-9]+:[0-9]+).*')

class SolrClient(object):

    def __init__(self):
        global config
        if not config or not config.get('solr_query_url'):
            from flx.lib.helpers import load_pylons_config
            config = load_pylons_config()

        self.solrQueryUrl = config.get('solr_query_url')
        self.solrUpdateUrl = config.get('solr_update_url')
        self.solrUsername = config.get('solr_username')
        self.solrPassword = config.get('solr_password')
        self.updateConn = None
        self.queryConn = None
        self.log = logging.getLogger(__name__)

    def setSolrUpdateUrl(self, url):
        self.solrUpdateUrl = url

    def setSolrQueryUrl(self, url):
        self.solrQueryUrl = url

    def setLogger(self, logger):
        self.log = logger

    def connect(self, persistent=True):
        self.queryConn = solr.Solr(self.solrQueryUrl)
        self.log.debug("SolrClient: %d conn: %d" % (id(self), id(self.queryConn)))
        return self.queryConn

    def disconnect(self):
        if self.queryConn:
            self.queryConn.close()
            self.queryConn = None

    def startTransaction(self):
        if self.updateConn:
            self.updateConn.close()
        if self.solrUsername:
            self.log.info("Connecting using: %s %s" % (self.solrUsername, self.solrPassword))
            self.updateConn = solr.Solr(self.solrUpdateUrl, http_user=self.solrUsername, http_pass=self.solrPassword)
        else:
            self.updateConn = solr.Solr(self.solrUpdateUrl)

    def commit(self, optimize=True):
        if self.updateConn:
            self.log.info("Committing changes ...")
            self.updateConn.commit(wait_flush=True, wait_searcher=True)
            if optimize:
                self.log.info("Optimizing index ...")
                self.updateConn.optimize(wait_flush=True, wait_searcher=True)
            self.updateConn.close()
            self.updateConn = None

    def rollback(self):
        if self.updateConn:
            self.log.info("Forgetting changes ...")
            self.updateConn.close()
            self.updateConn = None

    def getAllIDs(self):
        ids = []
        try:
            self.connect()
            hits = self.select(q='sid:*', fields=['sid'], score=False)
            self.log.info("Found docs: %d" % len(hits))
            if hits:
                for hit in hits:
                    ids.append(hit['sid'])
        finally:
            self.disconnect()
        return ids

    def deleteAll(self):
        try:
            ids = self.getAllIDs()
            if ids:
                self.deleteIndex(artifactIDs=ids)
                self.log.info("Deleted all artifacts for the index. Total count: %d" % len(ids))
        except solr.SolrException, se:
            self.log.error("Error getting all document ids from solr: %s" % str(se))
            self.log.error(traceback.format_exc())
            raise se
        finally:
            self.disconnect()

    def deleteIndex(self, artifactIDs):
        """ Delete the index for given artifactIDs """
        if not self.updateConn:
            raise TRANSACTION_NOT_ACTIVE
        if artifactIDs:
            try:
                self.log.info("Deleting documents: %s" % str(artifactIDs))
                self.updateConn.delete(ids=artifactIDs)
            except solr.SolrException, se:
                self.log.error("Error deleting documents from solr: %s" % str(se))
                self.log.error(traceback.format_exc())
                raise se

    def __createTimestampFromString(self, timestr):
        try:
            time_format = "%Y-%m-%d %H:%M:%S %Z"
            obj = datetime.datetime.fromtimestamp(time.mktime(time.strptime(timestr, time_format)))
        except ValueError, ve:
            ## Try a different format
            try:
                time_format = "%Y-%m-%d %H:%M:%S"
                obj = datetime.datetime.fromtimestamp(time.mktime(time.strptime(timestr, time_format)))
            except ValueError, ve:
                m = tzRegex.match(timestr)
                if m:
                    timestr = m.group(1)
                    obj = datetime.datetime.fromtimestamp(time.mktime(time.strptime(timestr, time_format)))
                else:
                    raise Exception((_(u'Invalid time string: %(timestr)s')  % {"timestr":timestr}).encode("utf-8"))
        obj = obj.replace(tzinfo=Local)
        return obj

    def index(self, artifact, children, parents, keywords, indexContents=True):
        """ Index all relevant properties and content for this artifact """
        if not self.updateConn:
            raise TRANSACTION_NOT_ACTIVE
        doc = {}
        doc['sid'] = str(artifact.get('id'))
        #doc['id'] = int(artifact.get('id'))
        doc['ownerID'] = int(artifact.get('creatorID'))
        doc['owner'] = artifact.get('creator')
        try:
            h.safe_decode(doc['owner'])
        except UnicodeDecodeError:
            doc['owner'] = '__encrypted__'
        doc['owner'] = removeXmlUnsafeCharacters(doc['owner'])

        doc['ownerLogin'] = artifact.get('creatorLogin')
        try:
            h.safe_decode(doc['ownerLogin'])
        except UnicodeDecodeError:
            doc['ownerLogin'] = '__encrypted__'
        doc['ownerLogin'] = removeXmlUnsafeCharacters(doc['ownerLogin'])

        coverImage = artifact.get('coverImageSatelliteUrl', None)
        if not coverImage:
            coverImage = artifact.get('coverImage')
        doc['coverPageUrl'] = coverImage
        doc['indexed'] = datetime.datetime.fromtimestamp(time.time()).replace(tzinfo=Local)
        ## Decode title and summary for future encoding (by solrpy)
        doc['title'] = removeXmlUnsafeCharacters(artifact.get('title'))
        ## Sortable title
        doc['stitle'] = removeXmlUnsafeCharacters(artifact.get('title'))
        doc['summary'] = removeXmlUnsafeCharacters(artifact.get('summary'))
        doc['handle'] = removeXmlUnsafeCharacters(artifact.get('handle'))
        doc['created'] = self.__createTimestampFromString(artifact.get('created'))
        doc['modified'] = self.__createTimestampFromString(artifact.get('modified'))
        if artifact.get('published'):
            doc['published'] = self.__createTimestampFromString(artifact.get('published'))
            doc['isPublic'] = 1
        else:
            doc['published'] = None
            doc['isPublic'] = 0
        doc['isModality'] = artifact.get('isModality')
        publishedModalityCount = artifact.get('publishedModalityCount')
        if publishedModalityCount:
            doc['publishedModalityCount'] = int(publishedModalityCount)
        doc['ck12PublishedModalityCount'] = artifact.get('ck12PublishedModalityCount', 0)
        modalityMemberIDs = artifact.get('modalityMemberIDs')
        if modalityMemberIDs:
            doc['modalityMemberIDs'] = artifact.get('modalityMemberIDs')
        doc['authors'] = []
        if artifact.get('authors'):
            for a in artifact.get('authors'):
                doc['authors'].append(removeXmlUnsafeCharacters(a.get('name')))
        doc['type'] = artifact.get('artifactType')
        doc['license'] = artifact.get('license')
        doc['featured'] = -1
        if artifact.has_key('featured'):
            self.log.debug("index: order[%s]" % artifact.get('featured').get('order'))
            doc['featured'] = artifact.get('featured').get('order')
        ## Store all children of this artifact
        doc['children'] = []
        if children:
            for child in children:
                if child.get('childID') and child.get('sequence'):
                    doc['children'].append('%d_%d' % (child['childID'], child.get('sequence', 0)))
        # Store ownerID, type and title in owner_type_title_group for grouping
        owner_type_title_group = '%s%s%s' % (doc['type'],doc['ownerID'],doc['title'])
        doc['owner_type_title_group'] = owner_type_title_group.replace(' ','')
        ## Store all parents of this artifact
        doc['parents'] = []
        if parents:
            for parent in parents:
                if parent.get('parentID') and parent.get('sequence'):
                    doc['parents'].append('%d_%d' % (parent['parentID'], parent.get('sequence', 0)))

        doc['language'] = artifact.get('language', 'english').lower()
        doc['languageCode'] = artifact.get('languageCode', 'en').lower()
        revDict = artifact.get('revision')
        if revDict:
            doc['revision'] = revDict['revision']
            doc['downloads'] = revDict['statistics']['downloads']
            doc['favorites'] = revDict['statistics'].get('favorites', 0)
            if revDict['statistics'].get('rating'):
                doc['rating'] = revDict['statistics']['rating']
            doc['totalRating'] = revDict['statistics']['totalRating']
        popularity = 0
        try:
            popularity = int(doc.get('totalRating')) * 100 + int(doc.get('downloads')) * 10 + int(doc.get('favorites'))
        except Exception:
            pass
        doc['popularity'] = popularity
        doc['pop_score'] = artifact.get('pop_score', 0)

        doc['resources'] = []
        doc['resourceNames'] = []
        if artifact.get('resources'):
            for rid, rname in artifact.get('resources'):
                doc['resources'].append(rid)
                doc['resourceNames'].append(removeXmlUnsafeCharacters(rname))
        doc['resourceCounts'] = artifact.get('resourceCounts') if artifact.get('resourceCounts') else []
        doc['hasVideos'] = artifact.get('hasVideos')
        doc['hasAttachments'] = artifact.get('hasAttachments')
        doc['hasExercises'] = artifact.get('hasExercises')
        self.log.debug("Resources for artifact: %s, %s, %s" % (doc['resources'], doc['resourceNames'], doc['resourceCounts']))

        doc['prereqs'] = artifact.get('prereqs')
        doc['prereqTitles'] = [ removeXmlUnsafeCharacters(t) for t in artifact.get('prereqTitles', []) ]
        doc['postreqs'] = artifact.get('postreqs')
        doc['postreqTitles'] = [ removeXmlUnsafeCharacters(t) for t in artifact.get('postreqTitles', []) ]

        doc['browseTermCandidates'] = artifact.get('browseTermCandidates')
        doc['browseTermCandidatesFeatured'] = artifact.get('browseTermCandidatesFeatured')

        doc['domainEncoding'] = artifact.get('domainEncoding')
        doc['domainPrefix'] = artifact.get('domainPrefix')
        doc['conceptEIDs'] = artifact.get('conceptEIDs', [])
        doc['encodedID'] = artifact.get('encodedID', '')
        doc['iencodedID'] = artifact.get('iencodedID')
        doc['encodedIDs'] = artifact.get('encodedIDs', [])
        doc['iencodedIDs'] = artifact.get('iencodedIDs', [])
        doc['ancestorDomainIDs'] = artifact.get('ancestorDomainIDs')
        doc['ancestorDomainIDs.ext'] = artifact.get('ancestorDomainIDs')
        doc['libraryMemberIDs'] = artifact.get('libraryMemberIDs')
        doc['memberLabels'] = artifact.get('memberLabels')

        ## Collection stuff
        doc['chandles'] = artifact.get('chandles', [])
        doc['ctitles'] = artifact.get('ctitles', [])
        doc['cchandles'] = artifact.get('cchandles', [])
        doc['cctitles'] = artifact.get('cctitles', [])
        doc['cceids'] = artifact.get('cceids', [])

        if indexContents:
            try:
                xhtml = artifact.get('xhtml')
                if xhtml:
                    text = h.xhtml_to_text(xhtml)
                    if text:
                        doc['textContent'] = removeXmlUnsafeCharacters(text)
            except:
                self.log.error(traceback.format_exc())
                ## ignore errors
        if not doc.has_key('textContent'):
            doc['textContent'] = u''

        self.log.debug("Keywords: %s" % str(keywords))
        mappings = [ ('states', 'state'), 
                     ('gradeLevels', 'grade level'),
                     ('levels', 'level'),
                     ('subjects', 'subject'),
                     ('domains', 'domain'),
                     ('domainIDs', 'domainID'),
                     ('standards', 'standard'),
                     ('ancestors', 'ancestor'),
                     ('synonyms', 'synonym'),
                     ('searchTerms', 'search'),
                     ('internaltags', 'internal-tag'),
                     ('tags', 'tag')]
        artifactKeywords = keywords['artifactKeywords']
        descendentKeywords = keywords['descendentKeywords']
        suffixes = ['', '.ext']
        for suffix in suffixes:
            for left, right in mappings:
                left += suffix
                if artifactKeywords.has_key(right):
                    doc[left] = artifactKeywords[right]
                    i = 0
                    while i < len(doc[left]):
                        doc[left][i] = removeXmlUnsafeCharacters(doc[left][i].lower())
                        i += 1

            ## Process keywords for all children and grandchildren
            for left, right in mappings:
                left += suffix
                if descendentKeywords.has_key(right):
                    left = 'descendents.' + left
                    doc[left] = descendentKeywords[right]
                    i = 0
                    while i < len(doc[left]):
                        doc[left][i] = removeXmlUnsafeCharacters(doc[left][i].lower())
                        i += 1
           
        try:
            self.log.debug("Adding or updating document: %s with keywords: %s" % (doc['sid'], str(keywords)))
            self.log.info("Created: %s" % str(doc['created']))
            self.updateConn.add(doc)
        except solr.SolrException, se:
            self.log.error("Error add document to solr: %s" % str(se))
            self.log.error(traceback.format_exc())
            raise se

    def search(self, query):
        """
            Simple convenience query method - only accepts default syntax queries
                Creates a query connection, executes the query and returns response
                Note: for more advance queries and fancier options, use the following:
                    ## See http://packages.python.org/solrpy/reference.html for select() function arguments
                    s = SolrClient()
                    try:
                        conn = s.connect()
                        hits = conn.select(...)
                        for hit in hits:
                            ...
                    finally:
                        s.disconnect()
        """
        allHits = []
        try:
            self.connect()
            hits = self.queryConn.select(q=query, score=True, rows=100)
            while True:
                if hits:
                    for hit in hits:
                        allHits.append(hit)
                    hits = hits.next_batch()
                else:
                    break
            return allHits
        finally:
            self.disconnect()
        return None
    
    def select(self, **kwargs):
        start = datetime.datetime.now()
        if not self.queryConn:
            raise NO_OPEN_CONNECTION
        allHits = []
        self.log.debug("All args: %s" % kwargs)

        autoFields = False
        ## Always return id
        if kwargs.has_key('fields') and kwargs['fields']:
            if 'sid' not in kwargs['fields']:
                kwargs['fields'].append('sid')
        else:
            kwargs['fields'] = AUTO_RETURN_FIELDS
            autoFields = True
        self.log.info("Return fields: [%s]" % kwargs['fields'])

        ## Check if highlighting is requested
        highlighting = False
        if kwargs.has_key('highlight') and kwargs['highlight']:
            highlighting = True
            if autoFields and not 'textContent' in kwargs['highlight']:
                # If fields were auto populated and highlight fields do not have textContent
                # then we should add it
                kwargs['highlight'].append('textContent')
        self.log.info("highlighting: %s" % str(highlighting))

        ## 10 rows at a time if not specified
        stopAt = -1
        if not kwargs.has_key('rows'):
            kwargs['rows'] = 10
            stopAt = 10
        else:
            stopAt = kwargs['rows']
        if stopAt <= 0:
            kwargs['rows'] = 0
            stopAt = 0
        log.debug("stopAt: %s" % stopAt)

        if kwargs.get('facet'):
            kwargs['facet'] = 'true'
            if not kwargs.has_key('facet_field'):
                kwargs['facet_field'] = MINIMAL_FACET_FIELDS
            if not kwargs.has_key('facet_mincount'):
                kwargs['facet_mincount'] = 1
            if not kwargs.has_key('facet_method'):
                kwargs['facet_method'] = 'fc' # Field cache
            if not kwargs.has_key('facet_limit'):
                kwargs['facet_limit'] = 50
                if 'ownerID' in kwargs['facet_field']:
                    kwargs['f_ownerID_facet_limit'] = 5
                if 'levels.ext' in kwargs['facet_field']:
                    kwargs['f_levels.ext_facet_limit'] = 4
                ## Bug 48657 Increase the facet limit to 100 for typeStr
                if 'typeStr' in kwargs['facet_field']:
                    kwargs['f_typeStr_facet_limit'] = 100
            if kwargs.get('fq') == True:
                del kwargs['fq']
        elif kwargs.has_key('facet'):
            del kwargs['facet']

        if kwargs.get('spellcheck'):
            kwargs['spellcheck'] = 'true'
            if kwargs.get('origTerm'):
                kwargs['spellcheck.q'] = kwargs.pop('origTerm')
        elif kwargs.has_key('spellcheck'):
            del kwargs['spellcheck']
        if kwargs.has_key('spellcheck_build'):
            del kwargs['spellcheck_build']
        
        specialSort = None
        if kwargs.get('specialSort'):
            specialSort = kwargs['specialSort']
            if specialSort['field'] not in kwargs['fields']:
                kwargs['fields'].append(specialSort['field'])
            del kwargs['specialSort']

        if kwargs.has_key('group') and 'true' == kwargs['group']:
            if kwargs.has_key('groupfield') and kwargs['groupfield']:
                kwargs['group_field'] = kwargs['groupfield']
                kwargs['group_main'] = 'true'
                del kwargs['groupfield']

        hits = self.queryConn.select(**kwargs)
        allHits = Hits(self.log)
        allHits.specialSort = specialSort
        if hasattr(hits, 'numFound') and hits.numFound == 0:
            allHits.appendHits(hits)
        else:
            while True:
                ## Process hits once if rows=0 so we get other data such as facets
                if hits is not None:
                    allHits.appendHits(hits)
                    if stopAt <= 0 or (stopAt > 0 and len(allHits) >= stopAt):
                        break
                    hits = hits.next_batch()
                    if len(hits) <= 0:
                        break
                else:
                    break
        end = datetime.datetime.now() - start
        self.log.info("Returning %d hits [Took: %s]" % (len(allHits), end))
        return allHits 

class Hits(object):
    """
        Class to represent a collection of results from solr server
        Most important properties are "numFound" which are the total number of 
        results returned, and hits which can be iterated over.
        
    """
    def __init__(self, log):
        self.log = log
        self.hits = []
        self.numFound = 0
        self.hl = None
        self.facets = {}
        self.spellingSuggestions = {}
        self.specialSort = None
        
    def appendHits(self, hits):
        if hasattr(hits, 'highlighting'):
            self.hl = hits.highlighting

        if hasattr(hits, 'facet_counts'):
            self.log.debug("Facet counts: %s" % hits.facet_counts)
            if not self.facets:
                if hits.facet_counts.has_key('facet_fields'):
                    for field in hits.facet_counts['facet_fields'].keys():
                        if not self.facets.has_key(field):
                            self.facets[field] = {}
                        for term, cnt in hits.facet_counts['facet_fields'][field].iteritems():
                            if not self.facets[field].has_key(term):
                                self.facets[field][term] = 0
                            self.facets[field][term] += cnt
                        sortedFacets = sorted(self.facets[field].iteritems(), key=operator.itemgetter(1), reverse=True)
                        self.facets[field] = sortedFacets
        else:
            self.log.debug("No attr facet_counts")
        self.log.debug("Facets: %s" % self.facets)

        if hasattr(hits, 'spellcheck'):
            for key in hits.spellcheck['suggestions'].keys():
                self.spellingSuggestions[key] = []
                for word in hits.spellcheck['suggestions'][key]['suggestion']:
                    self.spellingSuggestions[key].append(word)
            self.log.info("Spelling suggestions: %s" % self.spellingSuggestions)

        for hit in hits:
            if self.hl:
                hit['__hl__'] = self.hl[str(hit['sid'])]
            self.hits.append(self.__processHit(hit))
        self.numFound = hits.numFound

        if self.specialSort:
            self.__processSpecialSort()

    def __compareByList(self, lst, fld, item):
        if item[fld]:
            if type(item[fld]).__name__ == 'list':
                for i in item[fld]:
                    self.log.debug("Item: %s" % str(i))
                    return lst.index(i)
            else:
                return lst.index(item[fld])
        return None

    def __processSpecialSort(self):
        if self.specialSort:
            field = self.specialSort['field']
            order = self.specialSort['order']
            finalOrder = {}
            i = 0
            while i < len(self.hits):
                hit = self.hits[i]
                pos = self.__compareByList(order, field, hit)
                self.log.debug("Position of %s is %d" % (hit[field], pos))
                if pos is not None:
                    if not finalOrder.has_key(pos):
                        finalOrder[pos] = []
                    finalOrder[pos].append(hit)
                i += 1

            self.log.debug("Final order: %s" % str(finalOrder))
            i = 0
            max = len(self.hits)
            self.hits = []
            while i < self.numFound:
                if finalOrder.has_key(i):
                    self.hits.extend(finalOrder[i]) 
                i += 1 

    def append(self, hit):
        self.hits.append(self.__processHit(hit))

    def __len__(self):
        return len(self.hits)

    def __iter__(self):
        return self.hits.__iter__()

    def __processHit(self, hit):
        """
            Make sure hit is json serializable
             - Only things not JSON serializable are the datetime instances in created and modified fields
        """
        timefmt = '%Y-%m-%d %H:%M:%S %Z'
        datetime_fields = ['created', 'modified']
        for datetime_field in datetime_fields:
            if hit.has_key(datetime_field) and hit[datetime_field]:
                hit[datetime_field] = hit[datetime_field].strftime(timefmt)
        return hit



