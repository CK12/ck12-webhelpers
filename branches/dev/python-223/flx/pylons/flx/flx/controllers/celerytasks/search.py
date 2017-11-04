import time
import logging
import traceback
import json
from datetime import datetime
from pylons.i18n.translation import _ 

from pylons import config
from flx.model import api, migrated_concepts as mc
from flx.model.mongo.standard import Standard
from flx.model.mongo.collectionNode import CollectionNode
from flx.lib.search.solrclient import SolrClient
import flx.lib.helpers as h
from flx.lib.localtime import Local
from flx.controllers.celerytasks.periodictask import PeriodicTask
from flx.lib.remoteapi import RemoteAPI as remotecall

from beaker.cache import CacheManager

logger = logging.getLogger(__name__)

CONCEPT_NODE_URL = 'get/info/concept/'

class SearchTask(PeriodicTask):
    serializer = "json"
    loglevel = "INFO"

    def __init__(self, **kwargs):
        ## Initialize PeriodicTask
        PeriodicTask.__init__(self)

        self.skipIfRunning = False
        self.routing_key = "search"
        self.indexLock = None

        ## Init solrclient
        self.s = SolrClient()
        self.s.setSolrUpdateUrl(self.config['solr_update_url'])
        self.s.setSolrQueryUrl(self.config['solr_query_url'])
        if self.config.get('solr_username'):
            self.s.solrUsername = self.config['solr_username']
            self.s.solrPassword = self.config.get('solr_password')
        self.s.setLogger(logger)

    def __getCache(self):
        cm = CacheManager(type='file', data_dir=self.config['beaker.cache.data_dir'])
        return cm.get_cache(self.__class__.__name__)

    def acquireLock(self, artifactIDList=[]):
        try:
            self.indexLock = None
            cache = self.__getCache()
            ts = int(time.time() * 1000)
            logger.info("%d" % ts)
            ret = 0
            if self.__class__.__name__ == 'CreateIndex':
                ret = cache.get_value(key='createIndexLock', createfunc=lambda: ts, expiretime=30*60)
            elif self.__class__.__name__ == 'Reindex':
                ret = cache.get_value(key='reindexLock', createfunc=lambda: ts, expiretime=120)
            elif self.__class__.__name__ == 'SyncIndex':
                ret = cache.get_value(key='syncIndexLock', createfunc=lambda: ts, expiretime=30*60)
            logger.info("indexLock: %d" % (ret))
            if ret == ts:
                self.indexLock = ret
            else:
                logger.warning("Cannot acquire lock for: %s" % self.__class__.__name__)
            return ret == ts
        except Exception, e:
            logger.error(traceback.format_exc())
            logger.error("Error acquiring lock: %s" % str(e))
            return False

    def releaseLock(self):
        if self.indexLock:
            logger.info("Releasing lock for %s" % self.__class__.__name__)
            self.__getCache().clear()

    def getIndexableDataForArtifact(self, artifact):
        timeit = False
        if artifact:
            ## Need to pre-load everything since we will not have access to the DB when we process this
            artifactDict = self.getIndexableArtifact(artifact)
            children = api.getArtifactChildren(artifactID=artifact.getId())
            parents = api.getArtifactParents(artifactID=artifact.getId())
            keywords = self.getAllTermsForArtifactAsDict(artifact)
            if timeit: s = int(time.time() * 1000)
            descendentKeywords = self.getAllTermsForDescendentsAsDict(artifactID=artifact.getId(), artifactRevisionID=artifact.revisions[0].id)
            if timeit: logger.info("Time spent with descendentKeywords (ms): %d" % (int(time.time()*1000) - s))
            return (artifactDict, children, parents, keywords, descendentKeywords)
        return None

    def scheduleIndexingForArtifact(self, artifact, allArtifacts, indexAncestors=False):
        """
            Schedule indexing of a given artifact and all of its ancestors
        """
        if artifact:
            if allArtifacts.has_key(artifact.id):
                logger.warning("Already scheduled this artifact for indexing: %s" % artifact.id)
                return
            allArtifacts[artifact.id] = True
            (artifactDict, children, parents, keywords, descendentKeywords) = self.getIndexableDataForArtifact(artifact)
            self.s.index(artifactDict, children, parents, {'artifactKeywords': keywords, 'descendentKeywords': descendentKeywords}, indexContents=True)
            if artifact.getModality() == 1:
                self.scheduleIndexingForNodeArtifact(artifact, allArtifacts)
            if indexAncestors:
                logger.info("Indexing ancestors ...")
                ancestors = api.getArtifactAncestors(artifactID=artifact.getId())
                if ancestors:
                    for anAncestor in ancestors:
                        if allArtifacts.has_key(anAncestor['parentID']):
                            logger.warning("Already scheduled this artifact for indexing: %s" % anAncestor['parentID'])
                            continue
                        ancestor = api.getArtifactByID(id=anAncestor['parentID'])
                        allArtifacts[ancestor.id] = True
                        if ancestor:
                            (artifactDict, children, parents, keywords, descendentKeywords) = self.getIndexableDataForArtifact(ancestor)
                            self.s.index(artifactDict, children, parents, {'artifactKeywords': keywords, 'descendentKeywords': descendentKeywords}, indexContents=True)

    def _getCollectionsForArtifact(self, artifactID=None, encodedID=None):
        cHandles = []
        cTitles = []
        ccTitles = []
        ccHandles = []
        ccEids = []
        ck12editor = api.getMemberByLogin(login='ck12editor')
        if artifactID:
            eidCollections = api.getConceptCollectionHandlesAndDomainEIDsForArtifact(artifactID=artifactID)
            logger.debug("eidCollections: %s" % eidCollections)
            for domainEID, conceptCollectionHandle in eidCollections:
                try:
                    occurrences = CollectionNode(self.mongo_db).getByEncodedIDsAndConceptCollectionHandle(eIDs=[domainEID], 
                            conceptCollectionHandle=conceptCollectionHandle, collectionCreatorID=ck12editor.id, publishedOnly=True)
                    for c in occurrences:
                        logger.debug("Item: %s" % c)
                        chandle = c['collection']['handle']
                        if c['collection']['isCanonical']:
                            chandle = 'c|%s' % chandle
                        chandle = '%s|%s' % (chandle, c['collection']['creatorID'])
                        cHandles.append(chandle)
                        cTitles.append(c['collection']['title'])
                        ccHandles.append(c['absoluteHandle'])
                        ccTitles.append(c['title'])
                        ccEids.append(domainEID)
                except Exception, e:
                    logger.warn("Error getting collection info for conceptCollectionHandle[%s]" % conceptCollectionHandle, exc_info=e)
        elif encodedID:
            try:
                occurrences = CollectionNode(self.mongo_db).getByEncodedIDs(eIDs=[encodedID], collectionCreatorID=ck12editor.id, publishedOnly=True)
                for c in occurrences:
                    handle = c['collection']['handle']
                    if c['collection']['isCanonical']:
                        handle = 'c|%s' % handle
                    handle = '%s|%s' % (handle, c['collection']['creatorID'])
                    cHandles.append(handle)
                    cTitles.append(c['collection']['title'])
                    ccHandles.append(c['absoluteHandle'])
                    ccTitles.append(c['title'])
                    ccEids.append(encodedID)
            except Exception, e:
                logger.warn("Error receiving collection info for [%s]" % encodedID, exc_info=e)
        logger.info("_getCollectionsForArtifact: Returning: cHandles: %s, cTitles: %s, ccHandles: %s, ccTitles: %s, ccEids: %s" % (cHandles, cTitles, ccHandles, ccTitles, ccEids))
        return cHandles, cTitles, ccHandles, ccTitles, ccEids

    def getLastIndexedTime(self, artifactID):
        try:
            self.s.connect()
            docs = self.s.select(q='sid:"%s"' % artifactID, fields=['sid', 'indexed'], score=False)
            if docs:
                for doc in docs:
                    return doc['indexed']
        finally:
            self.s.disconnect()
        return None

    def indexDomain(self, browseTerm, allArtifacts):
        nodeArtifact = {}
        if browseTerm:
            # Negating ID not to conflict with existing Artifact IDs in index
            nodeArtifact['id'] = -(browseTerm.id)

            if browseTerm.encodedID and browseTerm.type.name == 'domain':
                delete = False
                if mc.isConceptSuperceded(encodedID=browseTerm.encodedID):
                    logger.info("This concept is superceded [encodedID: %s]. Deleting index." % browseTerm.encodedID)
                    delete = True
                else:
                    apiurl = '%s%s' % (CONCEPT_NODE_URL, browseTerm.encodedID)
                    serverUrl = '%s/taxonomy' % (self.config.get('internal_cdn_api_url')) if self.config.get('internal_cdn_api_url') else None
                    cdata = remotecall.makeTaxonomyGetCall(apiurl, params_dict={'expirationAge': 'weekly'}, serverUrl=serverUrl)
                    if cdata.get('response', {}).get('status') == 'deleted':
                        logger.info("This concept is superceded [encodedID: %s]. Deleting index." % browseTerm.encodedID)
                        delete = True
                if delete:
                    self.s.deleteIndex([nodeArtifact['id']])
                    return

            nodeArtifact['title'] = browseTerm.name
            nodeArtifact['handle'] = browseTerm.handle
            nodeArtifact['summary'] = browseTerm.description
            nodeArtifact['encodedID'] = browseTerm.encodedID
            nodeArtifact['encodedIDs'] = [browseTerm.encodedID]
            nodeArtifact['conceptEIDs'] = [browseTerm.encodedID]
            nodeArtifact['artifactType'] = browseTerm.type.name
            # Set published modalities count for domain
            nodeArtifact['publishedModalityCount'] = api.countTotalRelatedArtifactsForDomain(browseTerm.id, publishedOnly=True)
            nodeArtifact['ck12PublishedModalityCount'] = api.countTotalRelatedArtifactsForDomain(browseTerm.id, publishedOnly=True, ck12Only=True)
            nodeArtifact['creatorID'] = 3

            allMembers = api.getMembersForDomain(browseTerm.id, includePublished=True)
            if not 3 in allMembers:
                allMembers.append(3)
            nodeArtifact['modalityMemberIDs'] = nodeArtifact['libraryMemberIDs'] = allMembers

            nodeArtifact['created'] = datetime.today().strftime('%Y-%m-%d %H:%M:%S')
            nodeArtifact['modified'] = datetime.today().strftime('%Y-%m-%d %H:%M:%S')
            nodeArtifact['published'] = datetime.today().strftime('%Y-%m-%d %H:%M:%S')
            logger.info("Node Artifact Dict %s" % nodeArtifact)
            start = datetime.now()
            if allArtifacts.has_key(nodeArtifact['id']):
                logger.warning("Already scheduled this artifact for indexing: %s" % nodeArtifact['id'])
                return
            allArtifacts[nodeArtifact['id']] = True
            artifactKeywords = { 'domain': [browseTerm.name], 'domainID': [browseTerm.encodedID], 'tag': [browseTerm.name, browseTerm.handle], }
            subjects = api.getSubjectsForDomainID(domainID=browseTerm.id)
            if subjects:
                artifactKeywords['subject'] = []
                for sub in subjects:
                    artifactKeywords['subject'].append(sub.name)
            ## Get collections for this EID
            nodeArtifact['chandles'], nodeArtifact['ctitles'], nodeArtifact['cchandles'], nodeArtifact['cctitles'], nodeArtifact['cceids'] \
                = self._getCollectionsForArtifact(encodedID=browseTerm.encodedID)
            self.s.index(nodeArtifact, children=[], parents=[], keywords={'artifactKeywords': artifactKeywords, 'descendentKeywords': {}}, indexContents=True)
            end = datetime.now() - start
            logger.info("Took: %s" % end)
            logger.info("Scheduled indexing for BrowseTerm of type domain (Node) having id : %s" % nodeArtifact['id'])

    def scheduleIndexingForNodeArtifact(self, artifact, allArtifacts, browseTermID=None):
        """
            Schedule indexing of node (BrowserTerm) Artifact
        """
        if browseTermID:
            browseTerm = api.getBrowseTermByID(id=browseTermID)
            self.indexDomain(browseTerm, allArtifacts)
        if artifact:
            relatedArtifacts = api.getRelatedArtifactsForArtifact(artifactID=artifact.getId())
            logger.info("relatedArtifacts length %s" % len(relatedArtifacts))
            if relatedArtifacts:
                for relatedArtifact in relatedArtifacts:
                    if self.recordToDB:
                        lastIndexed = self.getLastIndexedTime(str(-(relatedArtifact.domainID)))
                        if lastIndexed:
                            taskStartTime = self.task.get('started').replace(tzinfo=Local)
                            if lastIndexed >= taskStartTime:
                                ## Skip indexing
                                logger.info("Skipping browseTerm %s. Task Enqueue Time: [%s], Last Indexed: [%s]" % (relatedArtifact.domainID, taskStartTime, lastIndexed))
                                continue
                    browseTerm = api.getBrowseTermByID(relatedArtifact.domainID)
                    if browseTerm:
                        self.indexDomain(browseTerm, allArtifacts)
                    if browseTerm.encodedID:
                        supercedingDomain = mc.getSupercedingConcept(encodedID=browseTerm.encodedID)
                        if supercedingDomain:
                            self.indexDomain(supercedingDomain, allArtifacts)
                    

    gridSeparator = config.get('grid_separator')
    termSeparator = config.get('term_separator')

    def addToTermDict(self, keywords, term, type):
        if not keywords.has_key(type):
            keywords[type] = []
        if term and term not in keywords[type]:
            keywords[type].append(term)#.decode('utf-8'))

    def getAllTermsForArtifactAsDict(self, artifact):
        browseTerms = artifact.getBrowseTerms()
        keywords = {}
        for std in artifact.getStandardTerms():
            self.addToTermDict(keywords, std, 'standard')
        for tt in artifact.getTagTerms():
            self.addToTermDict(keywords, tt['name'], 'tag')
        for tt in artifact.getSearchTerms():
            self.addToTermDict(keywords, tt['name'], 'search')

        stdDB = Standard(self.mongo_db)
        encodedIDs = [ d.encodedID for d in artifact.getDomains() ]
        if encodedIDs:
            for std in stdDB.getAllStandardsForConcepts(encodedIDs=encodedIDs):
                self.addToTermDict(keywords, "%s|%s" % (std['sid'], std['label']), 'standard')
        self._processBrowseTerms(browseTerms, keywords)
        return keywords

    def _processBrowseTerms(self, browseTerms, keywords):
        termIDs = []
        for term in browseTerms:
            termIDs.append(term['id'])
            self.addToTermDict(keywords, term['term'], term['from'])
            if term['from'].lower() == 'domain' and term.has_key('encodedID') and not mc.isConceptSuperceded(encodedID=term['encodedID']):
                logger.debug("_processBrowseTerms: Adding domain encodedID[%s]" % term['encodedID'])
                self.addToTermDict(keywords, term['encodedID'], 'domainID')
        if termIDs:
            synonyms = api.getBrowseTermsSynonyms(ids=termIDs)
            if synonyms:
                for synonym in synonyms:
                    self.addToTermDict(keywords, synonym.synonym.name, 'synonym')
            ancestors = api.getBrowseTermsAncestors(ids=termIDs)
            if ancestors:
                for ancestor in ancestors:
                    self.addToTermDict(keywords, ancestor.name, 'ancestor')

    def extendKeywordsDict(self, keywords, moreKeywords):
        for key in moreKeywords.keys():
            if not keywords.has_key(key):
                keywords[key] = []
            for item in moreKeywords[key]:
                if item not in keywords[key]:
                    keywords[key].append(item)

    def getAllTermsForDescendentsAsDict(self, artifactID, artifactRevisionID):
        """ 
            Get browseTerms for all descendents of the artifact 
        """
        keywords = {}
        terms = api.getBrowseTermsDictForArtifactDescendants(artifactID=artifactID)
        self._processBrowseTerms(terms, keywords)

        standards = api.getStandardsForArtifactDescendants(artifactID=artifactID, artifactRevisionID=artifactRevisionID)
        logger.info("Descendant standards: %d: %s" % (len(standards), standards))
        for std in standards:
            self.addToTermDict(keywords, std, 'standard')

        tagTerms = api.getTagTermsDictForArtifactDescendants(artifactID=artifactID)
        logger.info("Descendant tagTerms: %d: %s" % (len(tagTerms), tagTerms))
        for tt in tagTerms:
            self.addToTermDict(keywords, tt['term'], 'tag')

        searchTerms = api.getSearchTermsDictForArtifactDescendants(artifactID=artifactID)
        logger.info("Descendant searchTerms: %d: %s" % (len(searchTerms), searchTerms))
        for tt in searchTerms:
            self.addToTermDict(keywords, tt['term'], 'search')

        return keywords


    def getIndexableArtifact(self, artifact):
        """ 
            Make sure the object returned here is json serializable 
        """
        timefmt = '%Y-%m-%d %H:%M:%S %Z'
        artifactDict = artifact.asDict()
        try:
            artifactRevision = artifact.revisions[0]
            if artifact.getTitle():
                artifactDict['title'] = artifact.getTitle()#.decode('utf-8')
            if artifact.getSummary():
                artifactDict['summary'] = artifact.getSummary()#.decode('utf-8')
            created = artifact.getCreated().replace(tzinfo=Local)
            modified = artifact.getModified().replace(tzinfo=Local)
            artifactDict['created'] = time.strftime(timefmt, created.timetuple())
            artifactDict['modified'] = time.strftime(timefmt, modified.timetuple())
            artifactDict['languageCode'] = artifact.language.code if artifact.language else 'en'
            encodedID = artifact.getEncodedId()
            conceptEIDs = []
            encodedIDs = []
            iencodedIDs = []
            artifactDict['encodedID'] = encodedID if encodedID is not None else ''
            artifactDict['iencodedID'] = int('1'.ljust(8, '0'))
            iencodedIDs.append(artifactDict['iencodedID'])
            if artifact.type.modality:
                relatedArtifacts = api.getRelatedArtifactsForArtifact(artifactID=artifact.id)
                if relatedArtifacts:
                    for ra in relatedArtifacts:
                        eid = '%s.%s.%s' % (ra.domain.encodedID, artifact.type.extensionType, ra.sequence)
                        encodedIDs.append(eid.upper())
                        conceptEIDs.append(ra.domain.encodedID.upper())
                    if artifactDict['encodedID'] and not artifactDict['encodedID'] in encodedIDs:
                        encodedIDs.append(artifactDict['encodedID'])
                    artifactDict['encodedIDs'] = encodedIDs
                    artifactDict['conceptEIDs'] = conceptEIDs

            if encodedIDs:
                logger.info("encodedIDs: %s" % str(encodedIDs))
                for encodedID in encodedIDs:
                    if artifact.type.modality:
                        try:
                            iencodedID = int(encodedID.split('.')[-1].ljust(5, '0'))
                            if iencodedID > 0 and iencodedID not in iencodedIDs:
                                iencodedIDs.append(iencodedID)
                        except Exception, e:
                            logger.error('Error decoding encodedID: %s' % str(e), exc_info=e)
                    else:
                        ## For books, chapters, sections, make sure the sequence number are 0-padded to 3 digits
                        try:
                            parts = encodedID.split('.')
                            while len(parts) < 8:
                                parts.append('0')
                            i = len(parts)-1
                            while i >= 0:
                                if parts[i].isdigit():
                                    parts[i] = parts[i].rjust(3, '0')
                                else:
                                    break
                                i -= 1
                            artifactDict['encodedID'] = '.'.join(parts)
                            logger.info("EncodedID: %s, type: %s" % (artifactDict['encodedID'], artifactDict['artifactType']))
                        except Exception, e:
                            logger.error('Error decoding encodedID: %s' % str(e), exc_info=e)
                logger.info("iencodedIDs: %s" % str(iencodedIDs))
                artifactDict['iencodedIDs'] = iencodedIDs


            ## Find out if this is a featured artifact
            featured = api.getFeaturedArtifact(artifactID=artifact.id)
            if featured is not None:
                logger.info('getIndexableArtifact: featured[%s]' % featured.artifactID)
                artifactDict['featured'] = {}
                artifactDict['featured']['order'] = featured.listOrder
                artifactDict['featured']['comments'] = featured.comments

            artifactDict['revision'] = artifactRevision.asDict()
            #feedbacks = artifactRevision.feedbacks
            totalRating = 0
            #if feedbacks:
            #    for feedback in feedbacks:
            #        totalRating += feedback.rating
            artifactDict['revision']['statistics']['totalRating'] = totalRating
            if artifactRevision.publishTime:
                published = artifactRevision.publishTime.replace(tzinfo=Local)
                artifactDict['published'] = time.strftime(timefmt, published.timetuple())
            artifactDict['pop_score'] = artifact.getScore()
            viewsCount = artifact.getViews(self.mongo_db)
            if not viewsCount:
                viewsCount = 1000
            artifactDict['viewsCount'] = viewsCount
            logger.info('Artifact pop_score: [%s]' %(artifactDict['pop_score']))

            ## Get pre and post domains
            fg = artifact.getFoundationGrid()
            preTermIDs = []
            postTermIDs = []
            for id, term, eid, handle, brnhandle in fg:
                pre, post = api.getDomainNeighbors(domainID=id)
                preTermIDs.extend(pre)
                postTermIDs.extend(post)

            preArtifactIds = api.getArtifactIDsByBrowseTerm(termIDs=preTermIDs, artifactTypeID=artifact.type.id)
            postArtifactIds = api.getArtifactIDsByBrowseTerm(termIDs=postTermIDs, artifactTypeID=artifact.type.id)

            artifactDict['prereqs'] = list(set(preArtifactIds))
            artifactDict['postreqs'] = list(set(postArtifactIds))
            allNeighbors = artifactDict['prereqs'][:]
            allNeighbors.extend(artifactDict['postreqs'])
            neighbors = api.getArtifactsByIDs(idList=allNeighbors)
            #logger.debug("Neighbors: %s" % neighbors)
            neighborDict = {}
            for neighbor in neighbors:
                neighborDict[neighbor.id] = neighbor

            artifactDict['prereqTitles'] = []
            for id in artifactDict['prereqs']:
                artifactDict['prereqTitles'].append(neighborDict[id].getTitle())#.decode('utf-8'))
            artifactDict['postreqTitles'] = []
            for id in artifactDict['postreqs']:
                artifactDict['postreqTitles'].append(neighborDict[id].getTitle())#.decode('utf-8'))

            #logger.debug("Prereqs: %s" % artifactDict['prereqs'])
            #logger.debug("Postreqs: %s" % artifactDict['postreqs'])

            artifactDict['browseTermCandidatesFeatured'] = []
            artifactDict['browseTermCandidates'] = []

            artifactDict['domainEncoding'], artifactDict['domainPrefix'], artifactDict['ancestorDomainIDs'] = self.getDomainEncodingAndPrefix(artifact)
            logger.info("ancestorDomainIDs: %s" % str(artifactDict['ancestorDomainIDs']))

            artifactDict['resources'] = []
            for rr in artifactRevision.resourceRevisions:
                artifactDict['resources'].append((rr.resource.id, rr.resource.getUri(unresolved=True)))

            rCounts = artifactRevision.getResourceCounts()
            artifactDict['resourceCounts'] = [ '%s_%d' % (k.lower(), v) for k,v in rCounts.iteritems() ]
            artifactDict['hasVideos'] = int(rCounts.get('allVideos', 0) > 0)
            hasPubAttachments = '0_%d' % int(rCounts.get('allAttachments', 0) > 0)
            hasPrivateAttachments = '%d_%d' % (artifact.creatorID, int(artifactRevision.getAttachmentCount(memberID=artifact.creatorID) > 0))
            artifactDict['hasAttachments'] = [hasPubAttachments, hasPrivateAttachments]
            artifactDict['hasExercises'] = int(artifactDict['exerciseCount'] > 0)

            ## Get member ids who have this artifact in their library
            libObjs = api.getMemberLibraryObjectsByParentID(objectType='artifactRevision', parentID=artifact.id)
            artifactDict['libraryMemberIDs'] = [ l.memberID for l in libObjs ]
            artifactDict['memberLabels'] = []
            labels = api.getMemberLabelsByParentID(parentID=artifact.id, objectType='artifactRevision')
            for lbl in labels:
                logger.debug("Lable: %s" % lbl)
                if lbl.label:
                    mID = lbl.label.memberID if lbl.label.memberID else 0
                    artifactDict['memberLabels'].append('%d_%s' % (mID, lbl.label.label.lower()))

            try:
                artifactDict['xhtml'] = artifact.getXhtml()
            except:
                artifactDict['xhtml'] = u""
            ## Collections
            artifactDict['chandles'], artifactDict['ctitles'], artifactDict['cchandles'], artifactDict['cctitles'], artifactDict['cceids'] \
                    = self._getCollectionsForArtifact(artifactID=artifact.id)
        except Exception, e:
            logger.error("Error getting artifact [%d] attributes: %s" % (artifact.id, str(e)), exc_info=e)
        return artifactDict

    def getDomainEncodingAndPrefix(self, artifact):
        domainEncoding = -1
        domainPrefix = ''
        ancestorDomainIDs = []
        try:
            logger.info("Artifact encodedID: %s" % artifact.encodedID)
            if artifact.type.name.lower() in ['chapter', 'concept', 'lesson'] or artifact.type.modality:
                fg = artifact.getFoundationGrid()
                if fg:
                    fg = sorted(fg, cmp=lambda x,y: cmp(x[2].upper().ljust(30, '0'), y[2].upper().ljust(30, '0')) if x[2] and y[2] else 0)
                encodedTerm = None
                for term in fg:
                    if term[2]:
                        logger.info("FG encodedID: %s id: %s" % (term[2], term[0]))
                        encodedTerm = term[2]
                        ancestors = api.getBrowseTermAncestors(id=term[0])
                        i = 0
                        while i < len(ancestors):
                            ancestorDomainIDs.append("%d_%s" % (i+1, ancestors[i].encodedID.lower()))
                            i += 1
                        break
                if not encodedTerm:
                    raise Exception((_(u'Could not find a domain term with encodedID for: %(artifact.id)d')  % {"artifact.id":artifact.id}).encode("utf-8"))
                domainEncoding, domainPrefix = h.splitEncodedID(encodedTerm)
                if not domainEncoding:
                    domainEncoding = -1
                if not domainPrefix:
                    domainPrefix = ''
        except Exception, e:
            logger.warn("Exception in getting domain encodings: %s" % str(e))
        logger.info("Returning: %s, %s, %s" % (domainEncoding, domainPrefix, ancestorDomainIDs))
        return domainEncoding, domainPrefix, ancestorDomainIDs

class Reindex(SearchTask):

    recordToDB = True

    def run(self, **kwargs):
        SearchTask.run(self, **kwargs)
        errorCount = reindexCount = deleteCount = 0
        allArtifacts = {}
        messages = []
        artifactIDList = kwargs.get('artifactIDList')
        if not artifactIDList:
            raise Exception("No artifact ids specified.")
        recursive = kwargs.get('recursive')
        force = kwargs.get('force')
        logger.info("Recursive=%s, force=%s" % (recursive, force))
        if recursive:
            artifactIDs = {}
            for id in artifactIDList:
                id = int(str(id).strip())
                if id > 0:
                    if id not in artifactIDs.keys():
                        artifactIDs[id] = id
                    descendants = api.getArtifactDescendants(artifactID=id)
                    for id in descendants:
                        if id not in artifactIDs.keys():
                            artifactIDs[id] = id
            if artifactIDs:
                artifactIDList = artifactIDs.keys()

        self.s.startTransaction()
        toDelete = []
        try:
            logger.info("Artifact ids for reindexing: %s" % str(artifactIDList))
            if True or self.acquireLock():
                for artifactID in artifactIDList:
                    artifactID = str(artifactID)
                    artifactID = artifactID.strip()
                    artifactIDInt = int(artifactID)
                    try:
                        notFound = False
                        if artifactIDInt > 0:
                            artifact = api.getArtifactByID(id=artifactIDInt)
                            if artifact:
                                if not force:
                                    ## Check if it is already reindexed.
                                    lastIndexed = self.getLastIndexedTime(artifactID)
                                    if lastIndexed:
                                        lastModified = artifact.getLastUpdateTime().replace(tzinfo=Local)
                                        if lastIndexed >= lastModified:
                                            ## Skip indexing
                                            logger.info("Skipping artifact %s. Last Modified: [%s], Last Indexed: [%s]" % (artifactID, lastModified, lastIndexed))
                                            continue
                                start = datetime.now()
                                self.scheduleIndexingForArtifact(artifact, allArtifacts)
                                end = datetime.now() - start
                                logger.info("Took: %s" % end)
                                logger.info("Scheduled indexing for: %s" % artifact.getId())
                                messages.append('Successfully reindexed artifact and its ancestors: %s' % (artifactID))
                                reindexCount += 1
                            else:
                                notFound = True
                        else:
                            domain = api.getBrowseTermByID(id=-(artifactIDInt))
                            if domain:
                                if not force and self.recordToDB:
                                    lastIndexed = self.getLastIndexedTime(artifactID)
                                    if lastIndexed:
                                        taskStartTime = self.task.get('started').replace(tzinfo=Local)
                                        if lastIndexed >= taskStartTime:
                                            ## Skip indexing
                                            logger.info("Skipping browseTerm %s. Task Enqueue Time: [%s], Last Indexed: [%s]" % (artifactID, taskStartTime, lastIndexed))
                                            continue

                                artCount = api.countTotalRelatedArtifactsForDomain(domain.id)
                                if artCount > 0:
                                    start = datetime.now()
                                    self.scheduleIndexingForNodeArtifact(None, allArtifacts, domain.id)
                                    end = datetime.now() - start
                                    logger.info("Took: %s" % end)
                                    logger.info("Scheduled indexing for: %s" % domain.id)
                                    messages.append('Successfully reindexed domain: %s' % (domain.id))
                                    reindexCount += 1
                                else:
                                    notFound = True
                            else:
                                notFound = True
                        if artifactIDInt and notFound:
                            logger.warn("No artifact or domain for id %s" % artifactID)
                            messages.append('No such artifact or domain for id : %s. Scheduling delete index' % artifactID)
                            toDelete.append(artifactIDInt)
                            deleteCount += 1
                    except Exception, e:
                        logger.error("Exception while processing artifactID: %s" % artifactID, exc_info=e)
                        messages.append('ERROR: Cannot process artifact for id : %s' % (artifactID))
                        errorCount += 1
                if toDelete.__len__() > 0:
                    self.s.deleteIndex(toDelete)
                if errorCount == len(artifactIDList):
                    raise Exception("All artifacts errored out: %d" % errorCount)
            ## DO NOT USE optimize=True is normal usage - this is a very expensive operation
            optimize = str(kwargs.get('optimize')).lower() == 'true'
            logger.info("Optimize: %s" % str(optimize)) 
            if reindexCount or deleteCount:
                self.s.commit(optimize=optimize)
            else:
                logger.info("Skipping commit. No changes.")
            self.userdata = json.dumps({'reindexed': reindexCount, 'deleted': deleteCount, 'failed': errorCount, 'reindexList': allArtifacts.keys()})
        except Exception, e:
            self.s.rollback()
            logger.error("Error reindexing: %s" % str(e), exc_info=e)
        finally:
            if False:
                self.releaseLock()
        return messages

class QuickReindex(Reindex):

    recordToDB = False

class DeleteIndex(SearchTask):

    recordToDB = True

    def run(self, **kwargs):
        """ 
            Delete index for a given list of artifactIDs
        """
        SearchTask.run(self, **kwargs)
        messages = []
        artifactIDList = kwargs.get('artifactIDList')
        if not artifactIDList:
            raise Exception("No artifact ids specified.")
        self.s.startTransaction()
        # get domainIDs having no other modalities than one marked for deletion.
        domainIDs = api.getDomainIDsWithNoModalitiesForArtifactIDs(artifactIDList)
        if domainIDs:
            domainIDs = [-int(dm) for dm in domainIDs]
            logger.info("Going to delete index for domains %s" % str(domainIDs))
            artifactIDList = artifactIDList.__add__(domainIDs)

        logger.info("Going to delete index for %s" % str(artifactIDList))
        try:
            self.s.deleteIndex(artifactIDList)
            self.s.commit(optimize=False)
            messages.append("Successfully deleted index for %s" % str(artifactIDList))
            logger.info("Successfully deleted index for %s" % str(artifactIDList))
        except Exception, e:
            self.s.rollback()
            logger.error("Error deleting index %s" % str(e))
            logger.error(traceback.format_exc())
        return messages

class QuickDeleteIndex(DeleteIndex):
    recordToDB = False

class CreateIndexWorker(SearchTask):
    recordToDB = False

    def run(self, artifactIDs, metadataOnly=False, **kwargs):
        """
            Recreate the search index from scratch
        """
        SearchTask.run(self, **kwargs)
        messages = []
        allArtifacts = {}
        aCnt = indexed = failed = 0
        logger.info("ArtifactIDs: %s" % artifactIDs)
        self.s.startTransaction()
        try:
            for id in artifactIDs:
                logger.info("Using id: %s" % id)
                artifact = api.getArtifactByID(id=long(id))
                aCnt += 1
                try:
                    self.s.deleteIndex([artifact.id])
                    logger.info("Indexing artifact: %d" % artifact.getId())
                    self.scheduleIndexingForArtifact(artifact, allArtifacts)
                    messages.append('[%d] Successfully enqueued artifact: %s for indexing' % (aCnt, artifact.getId()))
                    logger.info('[%d] Successfully enqueued artifact: %s for indexing' % (aCnt, artifact.getId()))
                    indexed += 1
                except Exception, e:
                    failed += 1
                    logger.error("Exception while indexing artifactID: %s" % artifact.getId(), exc_info=e)
                    messages.append('ERROR: [%d] Could not index artifactID: %s' % (aCnt, artifact.getId()))

            ## Commit current set of artifacts
            self.s.commit(optimize=False)
        except Exception, e:
            self.s.rollback()
            logger.error("Error reindexing at least one artifact: %s" % str(e), exc_info=e)
        return {'indexed': indexed, 'failed': failed, 'total': len(artifactIDs), 'messages': messages}

class CreateIndex(SearchTask):

    recordToDB = True

    def run(self, metadataOnly=False, **kwargs):
        """
            Recreate the search index from scratch
        """
        SearchTask.run(self, **kwargs)
        messages = []
        allArtifacts = {}
        allIndexed = {}
        indexed = deleted = failed = 0
        artifactCnt = 0
        try:
            if self.acquireLock():
                ## Get all indexed ids from search index
                try:
                    self.s.connect()
                    start = 0
                    rows = 1000
                    while True:
                        docs = self.s.select(q='id:*', fields=['id'], score=False, start=start, rows=rows)
                        if docs:
                            for doc in docs:
                                allIndexed[doc['id']] = doc['id']
                        else:
                            break
                        start += rows
                finally:
                    self.s.disconnect()

                pageSize = 256
                pageNum = 1
                tasks = []
                while True: 
                    try:
                        artifacts = api.getArtifacts(pageNum=pageNum, pageSize=pageSize)
                        if not artifacts:
                            break
                        artifactCnt = artifacts.getTotal()
                        logger.info("Indexing %d artifacts [Page: %d]" % (len(artifacts), pageNum))
                        artifactIDs = []
                        for artifact in artifacts:
                            if allArtifacts.has_key(artifact.id):
                                continue
                            allArtifacts[artifact.id] = True
                            artifactIDs.append(artifact.id)
                            relatedArtifacts = api.getRelatedArtifactsForArtifact(artifactID=artifact.id)
                            for ra in relatedArtifacts:
                                domainID = -(ra.domainID)
                                allArtifacts[domainID] = True

                        w = CreateIndexWorker()
                        t = w.delay(artifactIDs=artifactIDs, metadataOnly=metadataOnly, loglevel='INFO')
                        tasks.append(t)

                        self.userdata = json.dumps({'scheduled': pageNum*pageSize})
                        self.updateTask()
                        pageNum += 1
                    except Exception, e:
                        logger.error('Failed to schedule indexing for artifacts using workers: %s' % str(e), exc_info=e)

                logger.info("Scheduled %d workers" % len(tasks))
                for task in tasks:
                    try:
                        ret = task.wait()
                        indexed += ret['indexed']
                        failed += ret['failed']
                        messages.extend(ret['messages'])
                        self.userdata = json.dumps({'indexed': indexed, 'failed': failed, 'total': artifactCnt, 'deleted': deleted})
                        self.updateTask()
                    except Exception, e:
                        logger.error("Error running at least one worker: %s" % str(e), exc_info=e)

                ## Now delete all artifacts that do not exist in the DB
                toDelete = []
                for id in allIndexed.keys():
                    if not allArtifacts.has_key(id):
                        toDelete.append(id)
                if toDelete:
                    try:
                        logger.info("Deleting excess artifacts from index: %s" % toDelete)
                        self.s.startTransaction()
                        self.s.deleteIndex(toDelete)
                        self.s.commit(optimize=False)
                        deleted += len(toDelete)
                    except Exception, e:
                        self.s.rollback()
                        logger.error("Could not delete excess artifacts from index: %s" % toDelete, exc_info=e)
                else:
                    logger.info("No excess artifacts to delete from index.")
            else:
                logger.error("Error acquiring lock for indexing. Another indexing in progress.")
                messages.append('ERROR: Another indexing operation is in progress.')

            self.s.startTransaction()
            self.s.commit(optimize=True)
            self.userdata = json.dumps({'indexed': indexed, 'failed': failed, 'total': artifactCnt, 'deleted': deleted})

            ## Create an event
            api.createEventForType(typeName='SEARCH_INDEX_CREATED', eventData=self.userdata, processInstant=True)
        except Exception, e:
            logger.error("%s: Exception while recreating index from scratch" % str(e), exc_info=e)
            messages.append('%s: Exception while recreating index from scratch' % str(e))
            api.createEventForType(typeName='SEARCH_INDEX_CREATE_FAILED', eventData=str(e), processInstant=True)
        finally:
            self.releaseLock()
        return messages

class QuickCreateIndex(CreateIndex):
    recordToDB = False

class SyncIndex(SearchTask):

    recordToDB = True

    def __init__(self, **kwargs):
        ## Initialize SearchTask
        SearchTask.__init__(self, **kwargs)
        self.loglevel = 'WARN'
        self.maxWaitMinutes = 600
        self.skipIfRunning = True
        self.pageSize = 256
        self.maxPages = 100

    def run(self, **kwargs):
        """
            Sync the index with database
            This task runs periodically to check if any artifacts are missing in the 
            search index or in the database and updates the index accoordingly.
        """
        SearchTask.run(self, **kwargs)

        try:
            if self.config.get('celery_test_mode') == 'true':
                logger.warn("Running in test mode. Skip sync...")
                return
        except:
            pass

        ## Make sure we don't run again if already running/scheduled
        if self.isAlreadyRunning():
            return "Skipped"

        try:
            lastPageNum = 1
            lastTask = api.getLastTaskByName(name='SyncIndex', statusList=['SUCCESS'])
            if lastTask and lastTask.userdata:
                udJ = json.loads(lastTask.userdata)
                lastPageNum = udJ.get('pageNum', 1)
                logger.info("Found last task. Starting from page: %s" % lastPageNum)
            else:
                logger.info("No last successful task. Starting from page 1")
            if not lastPageNum:
                lastPageNum = 1
            pageNum = lastPageNum
            logger.info("Starting from pageNum: %d" % pageNum)
            changes = 0
            if self.acquireLock():
                
                ## Get all artifacts from index
                indexedDict = {}
                try:
                    self.s.connect()
                    start = (pageNum-1)*self.pageSize
                    pageCnt = 1
                    while pageCnt <= self.maxPages:
                        logger.info("Search: Start: %d, Rows: %d" % (start, self.pageSize))
                        docs = self.s.select(q='id:* AND -type:domain AND -type:pseudodomain', fields=['id', 'indexed'], score=False, sort='id', sort_order='asc', start=start, rows=self.pageSize)
                        if docs:
                            for doc in docs:
                                indexedDict[long(doc['id'])] = doc['indexed']
                        else:
                            break
                        start += self.pageSize
                        pageCnt += 1
                finally:
                    self.s.disconnect()

                #logger.info("Indexed: %s" % str(indexedDict.keys()))

                artifactIDs = {}
                indexedArtifacts = 0
                allArtifacts = {}
                pageCnt = 1
                while pageCnt <= self.maxPages:
                    logger.info("pageNum=%d, pageSize=%d" % (pageNum, self.pageSize))
                    artifacts = api.getArtifacts(pageNum=pageNum, pageSize=self.pageSize)
                    if not artifacts:
                        pageNum = 0
                        break
                    toIndex = []
                    for artifact in artifacts:
                        artifactIDs[artifact.id] = artifact.id
                        relatedArtifacts = api.getRelatedArtifactsForArtifact(artifactID=artifact.id)
                        for ra in relatedArtifacts:
                            domainID = -(ra.domainID)
                            artifactIDs[domainID] = domainID
                        if not indexedDict.has_key(artifact.id):
                            logger.info("Missing artifact %s from search index" % artifact.id)
                            toIndex.append(artifact)
                        else:
                            try:
                                lastModified = artifact.getModified().replace(tzinfo=Local)
                                if indexedDict[artifact.id] < lastModified:
                                    logger.debug("Index time %s is before last modified time in db: %s" % (indexedDict[artifact.id], lastModified))
                                    toIndex.append(artifact)
                            except Exception, e:
                                logger.error("Error comparing timestamps for index and db for artifact %s: [%s]" % (artifact.id, str(e)), exc_info=e)
                    logger.info("Need to reindex %d artifacts" % len(toIndex))
                    if toIndex:
                        self.s.startTransaction()
                        try:
                            for artifact in toIndex:
                                try:
                                    self.scheduleIndexingForArtifact(artifact, allArtifacts)
                                    logger.info("Scheduled indexing for: %s" % artifact.getId())
                                    indexedArtifacts += 1
                                except Exception, e:
                                    logger.error("Error indexing artifact: %s" % artifact.getId())
                                    logger.error(traceback.format_exc())
                            self.s.commit(optimize=False)
                        except:
                            self.s.rollback()
                    pageNum += 1
                    pageCnt += 1

                #logger.info("Indexed: %s, DB: %s" % (indexedDict.keys(), artifactIDs.keys()))
                toDelete = []
                for id in indexedDict.keys():
                    if not artifactIDs.has_key(id):
                        a = api.getArtifactByID(id=long(id))
                        if not a:
                            toDelete.append(id)
                logger.info("Need to delete index for %s artifacts" % toDelete)
                if toDelete:
                    self.s.startTransaction()
                    try:
                        self.s.deleteIndex(toDelete)
                        logger.info("Scheduled delete index for: %s" % str(toDelete))
                        self.s.commit(optimize=False)
                    except:
                        self.s.rollback()

                changes = len(toDelete) + indexedArtifacts
                logger.info("Number of documents changed: %d" % changes)
                ## Add the counts data to task - so that it can be returned when queried
                self.userdata = json.dumps({'deleted': len(toDelete), 'updated': indexedArtifacts, 'pageNum': pageNum})
                logger.info("userdata: %s" % self.userdata)

                if changes and pageNum == 0:
                    self.s.startTransaction()
                    self.s.commit(optimize=True)

                ## Create an event
                evt = api.createEventForType(typeName='SEARCH_INDEX_SYNCED', objectID=self.taskID, objectType='task', eventData=self.userdata, processInstant=True)

                return "Synced changes: %d" % changes
        except Exception, e:
            logger.error("%s: Exception while syncing index with the db" % str(e), exc_info=e)
            ## Create failure event
            evt = api.createEventForType(typeName='SEARCH_INDEX_SYNC_FAILED', objectID=self.taskID, objectType='task', eventData=str(e), processInstant=True)
            raise e
        finally:
            self.releaseLock()
