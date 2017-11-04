from pylons import config
import logging
from flx.model import api
from flx.controllers.common import BrowseTermCache
from flx.lib.search.solrclient import SolrClient


LOG_FILENAME = "/tmp/reindex_solrdomain_nodes.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=10*1024*1024, backupCount=5)
handler.setFormatter(formatter)
log.addHandler(handler)

def help():
    print "reindex_solrdomain_nodes.run()"
    print ""

def run():
    """
        Index all domain nodes (i.e. browseTerm of type 'domain')
    """
    s = SolrClient()
    s.setSolrUpdateUrl(config['solr_update_url'])
    s.setSolrQueryUrl(config['solr_query_url'])
    if config.get('solr_username'):
        s.solrUsername = config['solr_username']
        s.solrPassword = config.get('solr_password')
    s.setLogger(log)
    log.info(config['solr_update_url'])
    
    pageSize = 250
    pageNum = 1
    ## Get all artifacts from index
    reindexList = []
    try:
        s.connect()
        start = (pageNum-1)*pageSize
        while True:
            log.info("Search: Start: %d, Rows: %d" % (start, pageSize))
            docs = s.select(q='id:[* TO -1] AND type:domain', fields=['id'], score=False, sort='id',start=start, rows=pageSize)
            if docs:
                for doc in docs:
                    reindexList.append(long(doc['id']))
                start += pageSize
            else:
                break
    finally:
        s.disconnect()
        
    log.info("reindex BrowseTermID List :: %s"% reindexList)
    
    if reindexList:
        log.info("Reindexing %d domains(BrowseTermIDs)" % len(reindexList))
        from flx.lib.helpers import reindexArtifacts
        reindexArtifacts(reindexList, user=None, recursive=True)
             