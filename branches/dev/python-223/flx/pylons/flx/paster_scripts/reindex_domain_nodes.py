from flx.model import api
from flx.model.mongo.collectionNode import CollectionNode
from flx.model.mongo import getDB as getMongoDB
from flx.controllers.common import BrowseTermCache

from pylons import config

def help():
    print "reindex_domain_nodes.run()"
    print ""

def run(eidPrefix=None, reindex=True, invalidate=False, waitForReindex=False):
    """
        Reindex all domain nodes (i.e. browseTerm of type 'domain')
    """

    mongodb = getMongoDB(config)
    pageNum = 1
    pageSize = 256
    reindexList = []
    processed = 0
    while True:
        print "Fetching %d domain nodes, pageNum: %d, eidPrefix: %s" % (pageSize, pageNum, eidPrefix)
        domainTermType = api.getBrowseTermTypeByName('domain')
        if not domainTermType:
            break
        domains = api.getBrowseTermsStartingWithEncodedID(encodedIDPrefix=eidPrefix, pageNum=pageNum, pageSize=pageSize)
        if not domains:
            break
        for d in domains:
            try:
                if not d.encodedID:
                    continue
                print "Processing [%s] [%s]" % (d.encodedID, d.name)
                if invalidate:
                    print "Rebuilding cache for: [%s] [%s]" % (d.encodedID, d.name)
                    api.invalidateBrowseTerm(BrowseTermCache(), browseTermID=d.id)
                BrowseTermCache().load(d.id)
                nodes = CollectionNode(mongodb).getCollectionInfosForEncodedID(encodedID=d.encodedID, publishedOnly=True, canonicalOnly=False)
                for node in nodes:
                    print "Rebuilding cache for: [%s], [%s], [%s]" % (node['encodedID'], node['handle'], node['collection']['creatorID'])
                    BrowseTermCache().load(d.id, conceptCollectionHandle=node['handle'], collectionCreatorID=node['collection']['creatorID'])
                if reindex:
                    print "Reindexing domain node: [%s] [%s]" % (d.id, d.encodedID)
                    reindexList.append(-(d.id))
                processed += 1
            except Exception as e:
                print "Error processing [%s]" % d.encodedID
                print e
        pageNum += 1

    if reindexList:
        print "Reindexing %d domains" % len(reindexList)
        from flx.lib.helpers import reindexArtifacts
        reindexArtifacts(reindexList, user=None, recursive=True, wait=waitForReindex)

    print "Processed: %d" % processed
