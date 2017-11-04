from flx.controllers import decorators as d
from flx.controllers.celerytasks import search
from flx.controllers.errorCodes import ErrorCodes
from flx.lib.base import BaseController, render
from flx.lib.search.solrclient import *
from pylons import app_globals as g, config, request, response, tmpl_context as c
from pylons.i18n.translation import _
import urllib
import flx.controllers.user as u
import logging
import traceback

log = logging.getLogger(__name__)

class SearchController(BaseController):
    """ 
        Search related APIs 
    """

    gridSeparator = config.get('grid_separator')
    termSeparator = config.get('term_separator')

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log)
    def createIndex(self):
        """ 
            Index all artifacts in the database 
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        result['response']['messages'] = []
        user = u.getCurrentUser(request, anonymousOkay=False)
        if not u.isMemberAdmin(user):
            return ErrorCodes().asDict(ErrorCodes.UNAUTHORIZED_OPERATION, 'Only administrator can call this API')
        metadataOnly = False
        if request.POST.has_key('metadataOnly'):
            metadataOnly = (str(request.POST['metadataOnly']).lower() == 'true')
        log.info("Going to index content? %s" % str(not metadataOnly))
        waitFor = False
        if request.POST.has_key('waitFor'):
            waitFor = (str(request.POST['waitFor']).lower() == 'true')
        log.info("Wait for request? %s" % str(waitFor))
        try:
            ## call celery task async
            if not waitFor:
                createIndex = search.CreateIndex()
                task = createIndex.delay(metadataOnly=metadataOnly, loglevel='INFO', user=user.id)
                result['response']['taskID'] = task.task_id
                result['response']['messages'].append('Successfully enqueued all artifacts for indexing')
            else:
                createIndex = search.QuickCreateIndex()
                ret = createIndex.apply({'metadataOnly': metadataOnly, 'user': user.id})
                log.info("return from QuickCreateIndex: %s" % ret)
                result['response']['messages'].extend(ret.result)
            return result
        except Exception, e:
            log.error('Error while indexing all artifacts: %s' % str(e))
            log.error(traceback.format_exc())
            c.errorCode = ErrorCodes.CANNOT_UPDATE_INDEX
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.checkAuth(request, True, True)
    @d.trace(log)
    def createIndexForm(self):
        c.prefix = self.prefix
        return render('/flx/search/createIndexForm.html')

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log)
    def reindex(self):
        """ 
            Re-create the index for a given artifactID 
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        result['response']['messages'] = []
        user = u.getCurrentUser(request, anonymousOkay=False)
        artifactIDs = request.POST['artifactIDs']
        waitFor = False
        if request.POST.has_key('waitFor'):
            waitFor = (str(request.POST['waitFor']).lower() == 'true')
        log.info("Wait for completion? %s" % str(waitFor))
        recursive = str(request.params.get('recursive')).lower() == 'true'
        log.info("Recursive? %s" % str(recursive))
        force = str(request.params.get('force')).lower() == 'true'
        log.debug("force? %s" % str(force))
        try:
            if artifactIDs:
                artifactIDList = artifactIDs.split(self.termSeparator)
                if artifactIDList:
                    userID = user.id if user else None
                    if not waitFor:
                        reindex = search.Reindex()
                        task = reindex.delay(artifactIDList=artifactIDList, recursive=recursive, loglevel='INFO', user=userID, force=force)
                        result['response']['taskID'] = task.task_id
                        result['response']['messages'] = 'Artifacts %s Scheduled for reindex' % ', '.join(artifactIDList)
                    else:
                        ## Wait for processing
                        reindex = search.QuickReindex()
                        log.info("Waiting for completion...")
                        ret = reindex.apply(kwargs={'artifactIDList': artifactIDList, 'recursive': recursive, 'user': userID, 'force': force})
                        result['response']['messages'].extend(ret.result)
                else:
                    raise Exception("No artifactIDs specified.")
                return result
        except Exception, e:
            log.error('create reindex Exception [%s]' % str(e))
            log.error(traceback.format_exc())
            c.errorCode = ErrorCodes.CANNOT_UPDATE_INDEX
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.checkAuth(request, True, True)
    @d.trace(log)
    def reindexForm(self):
        c.prefix = self.prefix
        return render('/flx/search/reindexForm.html')

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log)
    def deleteIndex(self):
        """ 
            Delete index for given artifact ids 
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        user = u.getCurrentUser(request, anonymousOkay=False)
        try:
            if not request.POST.has_key('artifactIDs'):
                raise "No artifactIDs specified."
            waitFor = False
            if request.POST.has_key('waitFor'):
                waitFor = (str(request.POST['waitFor']).lower() == 'true')
            artifactIDs = request.POST['artifactIDs'].split(self.termSeparator)
            artifactIDList = []
            if artifactIDs:
                if not waitFor:
                    deleteIndex = search.DeleteIndex()
                else:
                    deleteIndex = search.QuickDeleteIndex()
                for artifactID in artifactIDs:
                    artifactID = artifactID.strip()
                    artifactIDList.append(artifactID)
                if not waitFor:
                    task = deleteIndex.delay(artifactIDList=artifactIDList, loglevel="INFO", user=user.id)
                    result['response']['taskID'] = task.task_id
                    result['response']['message'] = 'Successfully scheduled deleteIndex for artifact ids: %s' % (",".join(artifactIDList))
                else:
                    ret = deleteIndex.apply(kwargs={'artifactIDList': artifactIDList, 'user': user.id})
                    result['response']['message'] = ret.result
                return result
        except Exception, e:
            log.error('Delete index exception [%s]' % str(e))
            log.error(traceback.format_exc())
            c.errorCode = ErrorCodes.CANNOT_UPDATE_INDEX
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.checkAuth(request, True, True)
    @d.trace(log)
    def deleteIndexForm(self):
        """ 
            Delete index form 
        """
        c.prefix = self.prefix
        return render('/flx/search/deleteIndexForm.html')


    @d.jsonify()
    @d.sortable(request, ['terms'])
    @d.filterable(request, ['terms', 'sort'])
    @d.setPage(request, ['terms', 'sort', 'fq'])
    @d.trace(log, ['terms', 'sort', 'pageNum', 'pageSize', 'fq'])
    def searchVisual(self, terms, pageNum, pageSize, fq, sort=None):
        """
            Performs generic search 
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        result['response']['hits'] = []
        solr = SolrClient()
        try:
            query = ''
            myTermList = getTermList(terms)
            cnt = 0
            for term in myTermList:
                term = term.strip()
                if term:
                    if cnt > 0:
                        query += ' AND '
                    query += '(' + getSearchQueryForBrowseTerms(term, maxBoost=400, types=['browseTerms'], descendents=True) 
                    query += ' OR ' + getSearchQueryForBrowseTerms(term, maxBoost=200, types=['tags'], descendents=True)
                    query += ' OR ' + getSearchQueryForContent(term, maxBoost=100) + ')'
                    cnt += 1
            if query:
                query += ' AND isPublic:"1"'
            log.info("Query: %s" % query)
            sort = getSortOrder(sort)
            log.info("Sort: %s" % sort)

            start = (pageNum-1)*pageSize
            solr.connect()
            hits = solr.select(q=query, fields=AUTO_RETURN_FIELDS, highlight=HIGHLIGHT_FIELDS, score=True, rows=pageSize, start=start, fq=fq, facet=True, sort=sort)
            for hit in hits:
                result['response']['hits'].append(hit)
            result['response']['total'] = hits.numFound
            result['response']['offset'] = start
            result['response']['filters'] = hits.facets
            result['response']['suggestions'] = hits.spellingSuggestions
            result['response']['limit'] = len(result['response']['hits'])
            return result
        except Exception, e:
            log.error("Error searching [%s]" % str(e))
            log.error(traceback.format_exc())
            c.errorCode = ErrorCodes.RETRIEVAL_ERROR
            return ErrorCodes().asDict(c.errorCode, str(e))
        finally:
            solr.disconnect()

    @d.trace(log)
    def searchForm(self):
        c.prefix = self.prefix
        return render('/flx/search/demo.html')

    @d.jsonify()
    @d.sortable(request, ['terms', 'fldsToSearch', 'fldsToReturn'])
    @d.filterable(request, ['terms', 'fldsToSearch', 'fldsToReturn', 'sort'])
    @d.setPage(request, ['terms', 'fldsToSearch', 'fldsToReturn', 'sort', 'fq'])
    @d.trace(log, ['terms', 'fldsToSearch', 'fldsToReturn', 'sort', 'pageSize', 'pageNum', 'fq'])
    def searchCustom(self, pageSize, pageNum, fq, terms, fldsToSearch, fldsToReturn=None, sort=None):
        """
            Customized search - allows the user to specify fields to search in

        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        result['response']['hits'] = []
        solr = SolrClient()
        try:
            query = ''
            myTermList = getTermList(terms)
            searchFieldList = None
            if fldsToSearch:
                searchFieldList = fldsToSearch.split(self.termSeparator)
            if not searchFieldList:
                raise Exception((_(u"At least one field to search on must be specified.")).encode("utf-8"))

            for field in searchFieldList:
                if field not in SEARCHABLE_FIELDS:
                    raise Exception((_(u'No such search field: %(field)s')  % {"field":field}).encode("utf-8"))

            returnFieldList = []
            if fldsToReturn and fldsToReturn != '*':
                returnFieldList = fldsToReturn.split(self.termSeparator)
            if not returnFieldList:
                returnFieldList = AUTO_RETURN_FIELDS

            for field in returnFieldList:
                if field not in SEARCHABLE_FIELDS:
                    raise Exception((_(u'No such search field: %(field)s')  % {"field":field}).encode("utf-8"))
            if 'sid' not in returnFieldList:
                returnFieldList.append('sid')
            highlightFieldList = returnFieldList[:]
            if 'textContent' in returnFieldList:
                # Do not return full textContent since it can be fairly big
                returnFieldList.remove('textContent')

            cnt = 0
            for term in myTermList:
                term = term.strip()
                if term:
                    if cnt > 0:
                        query += ' AND '
                    query += '(' + getCustomSearchQuery(term, searchFieldList) + ')'
                    cnt += 1
            if query:
                query += ' AND isPublic:"1"'

            sort = getSortOrder(sort)
            log.info("Query: %s" % query)

            ## handle faceting
            log.info("Facet queries: %s" % fq)
            start = (pageNum-1)*pageSize
            solr.connect()

            if fq:
                hits = solr.select(q=query, fields=returnFieldList, highlight=highlightFieldList, 
                        score=True, rows=pageSize, start=start, fq=fq,
                        facet='true', sort=sort)
            else:
                hits = solr.select(q=query, fields=returnFieldList, highlight=highlightFieldList, 
                        score=True, rows=pageSize, start=start, sort=sort)

            for hit in hits:
                result['response']['hits'].append(hit)
            result['response']['limit'] = len(result['response']['hits'])
            result['response']['total'] = hits.numFound
            result['response']['offset'] = start
            result['response']['filters'] = hits.facets
            result['response']['suggestions'] = hits.spellingSuggestions
            return result
        except Exception, e:
            log.error("Error searching [%s]" % str(e))
            log.error(traceback.format_exc())
            c.errorCode = ErrorCodes.RETRIEVAL_ERROR
            return ErrorCodes().asDict(c.errorCode, str(e))
        finally:
            solr.disconnect()

    ## This API is cached at the CDN
    #@d.ck12_cache_region('daily')
    def __autoSuggest(self, query, pageSize, start, groupField, group):
        solr = None
        try:
            result = {}
            result['hits'] = []
            solr = SolrClient()
            solr.connect()
            hits = solr.select(q=query, fields=['title','type','handle','encodedID','cctitles'], 
                    score=True, rows=pageSize, start=start, 
                    ## Bug 47209 Do not group the results.
                    #groupfield=[groupField], group=group,
                    )
            for hit in hits:
                isPresent = False
                counter = 0;
                totalHits = len(result['hits'])
                while not isPresent and counter < totalHits:
                    suggestion = result['hits'][counter]
                    if not isPresent and suggestion['type'] == hit['type'] and suggestion['title'].lower() == hit['title'].lower():
                        isPresent = True
                    counter += 1
                if not isPresent:
                    hit['encoded_title'] = urllib.quote(hit['title'].encode('utf8'))
                    result['hits'].append(hit)

            result['limit'] = len(result['hits'])
            if str(group).lower() != 'true':
                result['total'] = hits.numFound
            result['offset'] = start
            return result
        finally:
            if solr: 
                solr.disconnect()

    @d.jsonify()
    @d.sortable(request, ['term', 'field', 'artifactTypes'])
    @d.setPage(request, ['term', 'field', 'sort', 'artifactTypes'])
    @d.trace(log, ['term', 'field', 'sort', 'pageSize', 'pageNum','artifactTypes'])
    def autoSuggest(self, pageSize, pageNum, term, artifactTypes, field, sort=None):
        """
            Customized auto suggest feature - allows user to specify field to get suggestions.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            excludeSubjects = [ x.strip() for x in request.params.get('excludeSubjects', '').split(',') ]
            query = getAutoSuggestFieldsQuery(term, field, artifactTypes, g.getCK12EditorID(), excludeSubjects)
            groupField = None
            group = 'false'
            if 'title' ==  field:
                groupField = 'owner_type_title_group'
                group = 'true'
            start = (pageNum-1)*pageSize
            result['response'] = self.__autoSuggest(query, pageSize, start, groupField, group)
            return result
        except Exception, e:
            log.error("Error building query for auto suggest %s" % str(e),exc_info=e)
            c.errorCode = ErrorCodes.SUGGESTION_RETRIEVAL_ERROR
            return ErrorCodes().asDict(c.errorCode, str(e))
