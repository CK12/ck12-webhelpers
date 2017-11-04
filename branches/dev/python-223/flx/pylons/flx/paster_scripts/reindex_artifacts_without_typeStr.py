from flx.lib.search import solrclient
from flx.lib import helpers as h

def run(startPage=1):
    try:
        sc = solrclient.SolrClient()
        sc.connect()
        pageNum = startPage
        pageSize = 512
        chunk = 1
        while True:
            try:
                start = (pageNum - 1) * pageSize
                print "Getting page: %d, size: %d" % (chunk, pageSize)
                hits = sc.select(q="-typeStr:[* TO *] AND id:*", fields=["id"], start=start, rows=pageSize)
                if not hits or len(hits) == 0:
                    break
                print "Total: %d, Hits: %d" % (hits.numFound, len(hits))
                artifactIDs = [ x['id'] for x in hits ]
                if artifactIDs:
                    print "Reindexing: %d" % len(artifactIDs)
                    h.reindexArtifacts(artifactIds=artifactIDs, wait=True, recursive=False, autoSplit=512)
                    print "Done!"

                #pageNum += 1
                chunk += 1
            except Exception as e:
                print "Exception: %s" % str(e)
    finally:
        sc.disconnect()
