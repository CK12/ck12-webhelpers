from flx.controllers import decorators as d
from flx.controllers.mongo.base import MongoBaseController
from flx.lib.remoteapi import RemoteAPI as remotecall
from flx.model.mongo.conceptnode import ConceptNode
from flx.controllers.common import BrowseTermCache
from flx.model import api
from pylons import request
import logging

log = logging.getLogger(__name__)

CONCEPT_NODE_DESCENDANTS_URL = 'browse/modality/artifact/@@EID@@/all'
BRANCHES_URL = 'get/info/branches/'
CONCEPT_NODES_URL = 'get/info/concepts/'
CONCEPT_NODE_URL = 'get/info/concept/'

#from flx.controllers.mongo.conceptnode import ConceptnodeController
#ConceptnodeController().rebuildCache()
class ConceptnodeController(MongoBaseController):
    def __init__(self, **kwargs):
        MongoBaseController.__init__(self, **kwargs)
        self.cn = ConceptNode(self.db)

    @d.jsonify()
    @d.trace(log)
    def rebuildCache(self):
        branches = request.params.get('branches')
        branchCodes = None
        if branches:
            branchCodes = [ x.upper() for x in branches.split(',') ]

        inserted = 0
        ## Get branches
        for sub in [ 'MAT', 'SCI', 'ELA' ]:
            try:
                data = remotecall.makeTaxonomyGetCall('%s%s' % (BRANCHES_URL, sub))
                if data['response'].get('branches'):
                    for brn in data['response']['branches']:
                        brnEID = '%s.%s' % (sub, brn.get('shortname'))
                        if branchCodes and brnEID not in branchCodes:
                            log.info("Skipping %s. Not in %s" % (brnEID, branchCodes))
                            continue
                        try:
                            self.cn.deleteAll(subjectShortname=sub, branchShortname=brn.get('shortname'))
                            pageNum = 1
                            pageSize = 2000
                            nodeRank = 1
                            while True:
                                apiurl = '%s%s/%s' % (CONCEPT_NODES_URL, sub, brn.get('shortname'))
                                cdata = remotecall.makeTaxonomyGetCall(apiurl, params_dict={'pageSize': pageSize, 'pageNum': pageNum})
                                totalNodes = cdata['response']['total']
                                log.debug("Total nodes for %s: %s" % (brn.get('shortname'), totalNodes))
                                if cdata['response'].get('conceptNodes'):
                                    for cnode in cdata['response']['conceptNodes']:
                                        try:
                                            if cnode.get('status') == 'deleted':
                                                log.warn("Skipping %s. status=deleted." % cnode.get('encodedID'))
                                                continue
                                            log.debug("Saving %s" % cnode.get('encodedID'))
                                            cnode['rank'] = nodeRank
                                            term = api.getBrowseTermByEncodedID(encodedID=cnode['encodedID'])
                                            if term:
                                                browseTerm = BrowseTermCache().load(term.id)
                                                cnode['ck12ModalityCount'] = browseTerm['ck12ModalityCount']
                                                cnode['communityModalityCount'] = browseTerm['communityModalityCount']
                                            else:
                                                cnode['ck12ModalityCount'] = 0
                                                cnode['communityModalityCount'] = {}

                                            node = self.cn.create(**cnode)
                                            if node:
                                                inserted += 1
                                        except Exception, e:
                                            log.error("Error saving concept node: %s" % str(e), exc_info=e)
                                        nodeRank += 1
                                if totalNodes <= (pageSize * pageNum):
                                    break

                        except Exception, be:
                            log.error("Error processing branch: %s" % brn, exc_info=be)
            except Exception, se:
                log.error("Error processing subject: %s" % sub, exc_info=se)
        return {'inserted': inserted}
