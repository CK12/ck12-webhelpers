import logging
import urllib
import json
from datetime import timedelta, date

from pylons import config
from flx.model.mongo.validationwrapper import ValidationWrapper

log = logging.getLogger(__name__)

 
class TrendingModalities(ValidationWrapper):
    """
        Get Trending Modalities.
    """
    
    def __init__(self, db, dc=False):
        """Initialize function.
        """
        self.db = db
        # Dependency check flag
        self.dc = dc
        self.required_fields = []
        self.message = ''
        self.webPrefix = config.get('web_prefix_url', 'http://www.ck12.org')
        self.artifactURL = '%s/flx/get/minimal' % self.webPrefix           
        self.searchAPI = '%s/flx/search/direct/modality/minimal/%s/?%s'
        self.searchParams = 'pageNum=1&pageSize=20&specialSearch=false&includeEIDs=1&expirationAge=daily'
        self.artifacts = set()
        self.modalities = []
        self.ck12CreatorID = 3        
        self.pageSize = 10

    def getTrendingModalities(self, **kwargs):
        """Returns trending modalities.
        """
        try:
            log.info("In getTrendingModalities, kwargs:[%s]" % kwargs)
            mongoFilters = self._buildMongoFilters(kwargs['filters'])
            log.info('mongoFilters: [%s]' % (mongoFilters))
            self.ck12Only = kwargs['ck12Only']
            self.pageSize = kwargs['pageSize']
            # Get the trending modalities
            trendingModalities = self._getTrendingModalities(**mongoFilters)
            log.info('Got [%s] trendingModalities' %(len(trendingModalities)))
            # Check if we have any unpublished modalities
            publishedModalities = []            
            unpublishedIDs = []
            for modality in trendingModalities:
                published = modality.get('published')               
                if published:
                    publishedModalities.append(modality)
                else:
                    unpublishedIDs.append(modality.get('artifactID'))
            unpublishCount = len(unpublishedIDs)
            log.info("Unpublish modalities count: [%s]" % unpublishCount)                    
            # If unpublished modalities then get the replacement modalities.
            if unpublishCount:
                log.info("Unpublish artifactIDs: [%s]" % unpublishedIDs)
                collectionHandles, modalityTypes = kwargs['filters'].get('collectionHandles', ''), kwargs['filters'].get('modalityTypes', '')
                # Collect the replace modalites for unpublished modalities.
                replaceModalities = self._getReplaceModalities(collectionHandles, modalityTypes, unpublishCount)
                log.info('Got [%s] replaceModalities' %(len(replaceModalities)))
                trendingModalities = publishedModalities + replaceModalities
                log.info('Final [%s] trendingModalities' %(len(trendingModalities)))
                
            response = {}
            response['trending_modalities'] = trendingModalities
            response['location'] = {'country': kwargs['filters'].get('country'), 'state': kwargs['filters'].get('state')}
            return response
                                                   
        except Exception as e:
            log.error('Error in getTrendingModalities: [%s]' %(str(e)), exc_info=e)
            raise e
            
    def _buildMongoFilters(self, filters):    
        """Prepare the mongo filters.
        """
        mongoFilters = {}
        for key in ('country', 'state'):
            if filters.get(key):
                mongoFilters[key] = filters[key].strip()
        if filters.get('collectionHandles'):
            collectionHandles = filters['collectionHandles'].strip().lower() 
            _collectionHandles = collectionHandles.split(',')                    
            mongoFilters['collection_handle'] = {'$in': _collectionHandles}
        if filters.get('modalityTypes'):
            modalityTypes = filters['modalityTypes'].strip().lower() 
            _mtypes = modalityTypes.split(',')
            mongoFilters['modality_type'] = {'$in': _mtypes}
                        
        return mongoFilters

    def _getTrendingModalities(self, **filters):
        """Returns trending modalities.
           Checks for various time buckets if modalities not available in specific time bucket.
        """
        results = []
        today = date.today()        
        # Yesterday's top modalities.        
        yesterday = date.today() - timedelta(days=1)        
        log.info("Search Query 1, Yesterday's top modalities.")
        timeBucketList = [yesterday.strftime('%Y-%m-%d-day')]
        results = self._getResults(timeBucketList, filters)
        log.info("results ::::: %s" % len(results))
        if results:
            self.message = "Yesterday's top modalities."
            return results

        # Current week top modalities.
        log.info("Search Query 2, Current week top modalities.")
        timeBucketList = [today.strftime('%Y-%W-week')]
        results = self._getResults(timeBucketList, filters)
        if results:
            self.message = "Current week top modalities."
            return results

        # Last 7 days top modalities.     
        log.info("Search Query 3, Last 7 days top modalities.")
        timeBucketList = []
        for i in range(7):
            dt = today - timedelta(days=i)
            dtFormatted = dt.strftime('%Y-%m-%d-day')
            timeBucketList.append(dtFormatted)
        results = self._getResults(timeBucketList, filters)
        if results:
            self.message = "Last 7 days top modalities."
            return results

        # Last 2 weeks top modalities. 
        log.info("Search Query 4, Last 2 weeks top modalities.")
        timeBucketList = []
        for i in range(14):
            dt = today - timedelta(days=i)
            dtFormatted = dt.strftime('%Y-%m-%d-day')
            timeBucketList.append(dtFormatted)
        results = self._getResults(timeBucketList, filters)
        if results:
            self.message = "Last 2 weeks top modalities."
            return results

        # Last 30 days top modalities.
        log.info("Search Query 5, Last 30 days top modalities.")
        timeBucketList = []
        for i in range(30):
            dt = today - timedelta(days=i)
            dtFormatted = dt.strftime('%Y-%m-%d-day')
            timeBucketList.append(dtFormatted)
        results = self._getResults(timeBucketList, filters)
        if results:
            self.message = "Last 30 days top modalities."
            return results

        # Last 14 days top modalities without state/region.
        if filters.has_key('state') and filters['state']:
            del filters['state']  
            log.info("Search Query 6, Last 14 days top modalities without state/region.")
            timeBucketList = []
            for i in range(14):
                dt = today - timedelta(days=i)
                dtFormatted = dt.strftime('%Y-%m-%d-day')
                timeBucketList.append(dtFormatted)
            results = self._getResults(timeBucketList, filters)
            if results:
                self.message = "Last 14 days top modalities without state/region."
                return results
                
        # Yesterdays global modalities.
        if filters.has_key('country') and filters['country']:
            del filters['country']            
            log.info("Search Query 7, Yesterdays global modalities.")
            dtFormatted = yesterday.strftime('%Y-%m-%d-day')
            timeBucketList = [dtFormatted]
            results = self._getResults(timeBucketList, filters)
            if results:
                self.message = "Yesterdays global modalities."
                return results

        # As the modalities could not found for specific time buckets, get the recent modalities.
        results = self._getRecentModalities(filters)
        return results
        
    def _getResults(self, timeBucketList, filters, allResults=False):
        """Returns the modalities that falls under provided time bucket and filters.
        """
        mainFilters = {"time_bucket": {"$in" : timeBucketList}}
        mainFilters.update(filters)
        log.info("mainFilters : [%s]" % mainFilters)
        log.info("Modality Count 1: %s" % len(self.modalities))
        log.info("Processing 100 records")
        # We need only 10 trending modalities, however some modalities will not be published so limit to 100 modalities.
        hasMoreModalities = self._filterModalities(mainFilters, limit=100)
        if hasMoreModalities and len(self.modalities) < self.pageSize:
            log.info("Modality Count 2: %s" % len(self.modalities))
            log.info("Processing all records")
            # With 100 modalties we are still not able to get top 10 trending modalities, then process all the modalities.
            hasMoreModalities = self._filterModalities(mainFilters, limit=200)
            log.info("Modality Count 3: %s" % len(self.modalities))                     
            
        # Return all the collected modalities.
        if allResults:
            return self.modalities    
            
        # If the collected modalities equals or higher than page size then only return it.
        if len(self.modalities) >= self.pageSize:
            return self.modalities
        
        # Return empty means we have not found any modalities or we have not yet collected top 10(pageSize) trending modalities.
        # By returning empty the calling function will try for next set of time bucket, and see if it gets any more modalities.
        return []
        
    def _filterModalities(self, mainFilters, limit):
        """Queries the mongodb collection and fetches the records as per the provided filters.
        """
        log.info("In _filterModalities, Limit: [%s]" % limit)
        # Get the records from mongo collection.
        if limit == -1: # limit -1 when all the modalities are requested.
            results = self.db.ModalityAggregate.find(mainFilters).sort('count', -1)
        else:
            results = self.db.ModalityAggregate.find(mainFilters).sort('count', -1).limit(limit)
        # Prepare the list of modalities.
        modalities = []
        for result in results:
            del result['_id']
            del result['time_bucket']
            modalities.append(result)
        log.info("_filterModalities, Fetched Modalities Count : [%s]" % len(modalities))
        # Add artifact information to each modality.
        self._processModalities(modalities)
        
        # Set the hasMoreModalities flag which denotes weather more results can be pulled or not.
        hasMoreModalities = False
        if limit != -1 and len(modalities) >= limit:
            hasMoreModalities = True
        
        return hasMoreModalities

    def _getArtifactInfo(self, artifactID):
        """Return the artifact information for the provided artifactID.
        """
        artifactInfo = dict()
        try:
            url = '%s/%s' % (self.artifactURL, artifactID)        
            resp = urllib.urlopen(url)
            data = resp.read()
            jsonData = json.loads(data)
            artifactInfo = jsonData['response']['artifact']
            return artifactInfo
        except Exception as e:
            log.info("Error in getting artifact info artifactID:%s, Error:%s" % (artifactID, str(e)))
        return artifactInfo
        
    def _getRecentModalities(self, filters):
        """Returns the recent modalities.
        """
        log.info("In _getRecentModalities")
        recentFilters = dict()
        if filters.get('modality_type'):
            recentFilters['modality_type'] = filters.get('modality_type')
        if filters.get('collection_handle'):
            recentFilters['collection_handle'] = filters.get('collection_handle')                        
        log.info("recentFilters: [%s]" % recentFilters)
        results = self.db.ModalityAggregate.find(recentFilters).sort('timestamp',-1).limit(20) 
        # Cleanup result modalities
        modalities = []
        for result in results:
            del result['_id']
            del result['time_bucket']
            modalities.append(result)
        log.info("_getRecentModalities, Modalities Count : [%s]" % len(modalities))
        self._processModalities(modalities, isRecentModalities=True)
        return self.modalities
        
    def _processModalities(self, modalities, isRecentModalities=False):
        """Process modality , add artifact information to the modality.
        """
        unpublishedModalities = []
        log.info("In _processModalities")
        for modality in modalities:
            #log.info("modality: [%s]" % modality)
            artifactID = modality['artifactID']
            # Filter out any repeated artifacts
            if artifactID not in self.artifacts:
                self.artifacts.add(artifactID)
                # Update modality info with respective artifact info.
                artifactInfo = self._getArtifactInfo(artifactID)
                modality.update(artifactInfo)
                if isRecentModalities and not artifactInfo.get('published'):
                    # When processing recent modalities, if modality not published then stored them under unpublishedModalities.
                    unpublishedModalities.append(modality)
                else:                               
                    # Filter out ck12 modalities as per user request.
                    if self.ck12Only:
                        if modality.get('creatorID') == self.ck12CreatorID:
                            self.modalities.append(modality)                   
                    else:
                        self.modalities.append(modality)
                    # Stop processing once the number of modalities are equals to page size.
                    if len(self.modalities) >= self.pageSize:
                        break
                        
        # Handling for unpublished modalities, we still not get the modalities of pageSize so consider the unpublished modalities.
        if isRecentModalities and unpublishedModalities:
            for unpublishedModality in unpublishedModalities:
                if self.ck12Only:
                    if unpublishedModality.get('creatorID') == self.ck12CreatorID:
                        self.modalities.append(unpublishedModality)                   
                else:
                    self.modalities.append(unpublishedModality)
                # Stop processing once the number of modalities are equals to page size.
                if len(self.modalities) >= self.pageSize:
                    break
                                            
    def _getReplaceModalities(self, collectionHandles, modalityTypes, unpublishCount):
        """Returns the replace modalities.
           Replace modalities will satisfy only the collectionHandle and modalityTypes filter.
           Eg. https://api-qa-courses.ck12.org/flx/search/direct/modality/minimal/asmtpractice/Add%20Integers?
                pageNum=1&
                pageSize=10&
                specialSearch=false&                
                ck12only=true&                
                includeEIDs=1&
                expirationAge=daily& 
                filters=chandles,c|arithmetic|3&
                ck12only=true
        """
        log.info("In _getReplaceModalities")
        replaceModalities = []
        try:
            modalityTypes = modalityTypes.lower() if modalityTypes else 'lesson'
            # Prepare the collection filter query
            collectionFilters = ''
            if collectionHandles:
                # Build the filter string, Eg. chandles,c|arithmetic|3;chandles,c|algebra|3
                collectionHandleTemplate = 'chandles,c|%s|3'
                collectionFilterHandles = [collectionHandleTemplate % ch for ch in collectionHandles.split(',')]
                collectionFilters = ';'.join(collectionFilterHandles)
            filterQuery = ''
            if collectionFilters:
                filterQuery = 'filters=%s' % (collectionFilters)
                filterQuery = urllib.quote_plus(filterQuery)
                
            # Build Search parametrs
            searchParams = self.searchParams
            if filterQuery:
                searchParams = '%s&%s' % (searchParams, filterQuery)
            if self.ck12Only:
                searchParams = '%s&ck12only=true' % (searchParams)

            # Build the search API and call it
            api = self.searchAPI % (self.webPrefix, modalityTypes, searchParams)                        
            log.info("Calling the search api: [%s]" % api)
            resp = urllib.urlopen(api)
            data = resp.read()
            jsonData = json.loads(data)
            results = jsonData['response']['Artifacts']['result']
                        
            # Fetch the artifacts from search results        
            for result in results:
                try:
                    artifactID = int(result['id'])
                    # Filter out already processed artifacts.
                    if artifactID in self.artifacts:
                        continue
                    artifactInfo = self._getArtifactInfo(artifactID)
                    artifactInfo['replacedModality'] = True
                    replaceModalities.append(artifactInfo)
                    unpublishCount -= 1
                    if not unpublishCount:
                        log.info("All unpublished modalities are replaced")
                        break
                except Exception as ex:
                    log.info("Error in processing search result. Error: [%s]" % str(ex))
            log.info("Replace Modalities Count:%s" % len(replaceModalities))
        except Exception as ex:
            log.info("Error in processing replacement modalities. Error: [%s]" % str(ex))        
        return replaceModalities
