from flx.controllers.celerytasks.periodictask import PeriodicTask
from flx.model.mongo.collectionNode import CollectionNode
from flx.lib.remoteapi import RemoteAPI

import logging
import json

logger = logging.getLogger(__name__)
COLLECTIONS_API = "/collections/published"
COLLECTION_DETAILS_API = "/collection/collectionHandle=@@COLLECTION_HANDLE@@&collectionCreatorID=@@CREATOR_ID@@"
remoteapi = RemoteAPI()

class SyncCollectionsTask(PeriodicTask):
    recordToDB = True

    def __init__(self, **kwargs):
        ## Initialize GenericTask
        PeriodicTask.__init__(self, **kwargs)
        self.routing_key = 'artifact'
        # Get the flx2 database of mongodb.
        self.db = self.mongo_db

    def run(self, **kwargs):
        """
            Create the related artifacts for each  concept.
        """
        PeriodicTask.run(self, **kwargs)

        syncedCollections = []
        errorCollections = []
        pageNum = 1
        collectionsList = kwargs.get('collections', [])
        while True:
            ## Get all published collections
            response = remoteapi.makeTaxonomyGetCall( COLLECTIONS_API, params_dict={'pageNum': pageNum, 'pageSize': 100} )
            if not response['response']['collections']:
                break

            for collection in response['response']['collections']:
                if collectionsList and collection['handle'] not in collectionsList:
                    continue

                try:
                    logger.info("Processing collection: %s" % collection['handle'])
                    self.userdata = json.dumps({'Processing': collection['handle'], 'syncedCollections': syncedCollections, 'errorCollections': errorCollections})
                    self.updateTask()

                    ## Get the structure for collection
                    url = COLLECTION_DETAILS_API.replace("@@COLLECTION_HANDLE@@", collection['handle']).replace("@@CREATOR_ID@@", str(collection['creatorID']))
                    cResponse = remoteapi.makeTaxonomyGetCall( url, params_dict={'includeRelations': 'true'})
                    node = cResponse['response'].get('collection')
                    logger.info("node: %s" % node['handle'])
                    ## Clean the collection
                    CollectionNode(self.db).deleteAll(collectionHandle=collection['handle'])
                    levels = [0, 0, 0, 0]
                    if node.get('contains', []):
                        for child in node['contains']:
                            self._processNodeAndChildren(child, 0, levels, collection)

                    syncedCollections.append(collection['handle'])
                except Exception as e:
                    logger.error("Error syncing collection: %s" % collection['handle'], exc_info=e)
                    errorCollections.append(collection['handle'])
            pageNum += 1
            break ##TODO: Remove after the API supports pagination
        self.userdata = json.dumps({'syncedCollections': syncedCollections, 'errorCollections': errorCollections})
        self.updateTask()
        return "Synced collections: [%s], Error in collections: [%s]" % (syncedCollections, errorCollections)

    def _processNodeAndChildren(self, node, lvl, levels, collection):
        logger.info("Processing node: [%s], lvl: [%d]" % (node['absoluteHandle'], lvl))
        levels[lvl] += 1
        node['descendantIdentifier'] = '.'.join([ str(x) for x in levels if x != 0])
        node['collection'] = collection
        logger.info("!!! descendantIdentifier: %s, node: %s, collection: %s, creatorID: %s" % (node['descendantIdentifier'], node['absoluteHandle'], collection['handle'], collection['creatorID']))
        CollectionNode(self.db).deleteByDescendantIdentifier(node['descendantIdentifier'], collection['handle'], collection['creatorID'])
        ## Also delete using other indexes - in case there are any conflicts
        CollectionNode(self.db).deleteByAbsoluteHandle(node['absoluteHandle'], collection['handle'], collection['creatorID'])
        CollectionNode(self.db).create(**node)
        for child in node.get('contains', []):
            ## Recurse for each child - depth first.
            self._processNodeAndChildren(child, lvl+1, levels, collection)
        #levels[lvl] -= 1
        for i in range(lvl+1, len(levels)):
            levels[i] = 0
 



 
